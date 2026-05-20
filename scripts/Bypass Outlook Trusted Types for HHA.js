// ==UserScript==
// @name         Bypass Outlook Trusted Types for HHA
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Patch Trusted Types HTML sinks for HHA on Outlook
// @match        *://outlook.office.com/*
// @match        *://*.office.com/*
// @match        *://outlook.cloud.microsoft/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  const tt = window.trustedTypes;
  if (typeof tt === "undefined" || typeof tt.createPolicy !== "function") {
    return;
  }

  const originalCreatePolicy = tt.createPolicy.bind(tt);
  const existingDefaultPolicy = tt.defaultPolicy || null;
  const candidateNames = [
    "domPurifyHTML",
    "emptyStringPolicyHTML",
    "ast-policy",
    "nativeSanitizerTrustedTypesPolicy",
    "default",
  ];

  let bypassPolicy = null;

  for (const name of candidateNames) {
    try {
      bypassPolicy = originalCreatePolicy(name, {
        createHTML: (value) => value,
        createScriptURL: (value) => value,
        createScript: (value) => value,
      });
      console.log(
        `[HHA Helper] Trusted Types bypass policy installed as "${name}".`
      );
      break;
    } catch (error) {
      if (
        name === "default" &&
        existingDefaultPolicy &&
        String(error).includes("already exists")
      ) {
        bypassPolicy = existingDefaultPolicy;
        console.log(
          "[HHA Helper] Reusing existing default Trusted Types policy."
        );
        break;
      }
    }
  }

  if (!bypassPolicy || typeof bypassPolicy.createHTML !== "function") {
    console.warn(
      "[HHA Helper] No usable Trusted Types policy was available; sink patch skipped."
    );
    return;
  }

  const trustedHtml = (value) => {
    if (typeof value !== "string") {
      return value;
    }

    try {
      return bypassPolicy.createHTML(value);
    } catch {
      return value;
    }
  };

  const patchInnerHtmlSetter = (proto) => {
    if (!proto || proto.__HHA_TT_INNER_HTML_PATCHED__) {
      return;
    }

    const descriptor = Object.getOwnPropertyDescriptor(proto, "innerHTML");
    if (!descriptor || typeof descriptor.set !== "function") {
      return;
    }

    try {
      Object.defineProperty(proto, "innerHTML", {
        configurable: true,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set(value) {
          descriptor.set.call(this, trustedHtml(value));
        },
      });

      Object.defineProperty(proto, "__HHA_TT_INNER_HTML_PATCHED__", {
        value: true,
        configurable: true,
      });
    } catch (error) {
      console.warn("[HHA Helper] Failed to patch innerHTML setter:", error);
    }
  };

  const patchInsertAdjacentHtml = (proto) => {
    if (!proto || proto.__HHA_TT_INSERT_ADJACENT_PATCHED__) {
      return;
    }

    const original = proto.insertAdjacentHTML;
    if (typeof original !== "function") {
      return;
    }

    proto.insertAdjacentHTML = function (position, value) {
      return original.call(this, position, trustedHtml(value));
    };

    Object.defineProperty(proto, "__HHA_TT_INSERT_ADJACENT_PATCHED__", {
      value: true,
      configurable: true,
    });
  };

  patchInnerHtmlSetter(Element.prototype);
  if (typeof ShadowRoot !== "undefined") {
    patchInnerHtmlSetter(ShadowRoot.prototype);
  }
  patchInsertAdjacentHtml(Element.prototype);

  tt.createPolicy = function (name, rules) {
    if (name === "default" && existingDefaultPolicy) {
      return existingDefaultPolicy;
    }

    try {
      return originalCreatePolicy(name, rules);
    } catch (error) {
      if (name === "default") {
        return bypassPolicy;
      }
      throw error;
    }
  };

  console.log("[HHA Helper] Trusted Types sink patch installed.");
})();
