// ==UserScript==
// @name         Bypass Outlook Trusted Types for HHA
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Proxy Trusted Types createPolicy to avoid Outlook crash
// @match        *://outlook.office.com/*
// @match        *://*.office.com/*
// @match        *://outlook.cloud.microsoft/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

if (
  typeof window.trustedTypes !== "undefined" &&
  window.trustedTypes.createPolicy
) {
  try {
    // 先抢占 default 策略并赋予全部权限
    const bypassPolicy = window.trustedTypes.createPolicy("default", {
      createHTML: (string) => string,
      createScriptURL: (string) => string,
      createScript: (string) => string,
    });

    // 劫持浏览器的 API 给后续的 Outlook 脚本用
    const originalCreatePolicy = window.trustedTypes.createPolicy.bind(
      window.trustedTypes
    );
    window.trustedTypes.createPolicy = function (name, rules) {
      if (name === "default") {
        console.log(
          "🛡️ [HHA Helper] Intercepted Outlook's request to create 'default' policy. Returning our permissive policy instead."
        );
        return bypassPolicy;
      }
      return originalCreatePolicy(name, rules);
    };

    console.log("✅ [HHA Helper] Trusted Types proxy installed successfully!");
  } catch (e) {
    console.warn("⚠️ [HHA Helper] Bypass setup failed:", e);
  }
}
