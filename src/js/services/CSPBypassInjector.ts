/**
 * CSPBypassInjector - CSP 绕过注入器
 * Epic 12, Story 11: CSP 合规的 Outlook 集成重构
 *
 * 职责：
 * - 使用 GM.addElement 将 JavaScript 注入到页面主世界
 * - 绕过 Outlook 的 script-src CSP 限制
 * - 提供样式注入功能
 *
 * 原理：
 * - Tampermonkey 作为浏览器扩展拥有特权上下文
 * - 通过 GM.addElement 发起的 DOM 注入被浏览器视为"扩展操作"
 * - 豁免于页面的 CSP 检查（CSP Level 3 规范推荐行为）
 *
 * @see https://www.tampermonkey.net/documentation.php#api:GM.addElement
 */

/**
 * CSPBypassInjector 类
 * 封装 Tampermonkey 的 GM.addElement API 用于 CSP 绕过
 */
export class CSPBypassInjector {
  private static injectedScripts: Set<string> = new Set();

  /**
   * 检查 GM.addElement API 是否可用
   * @returns true 如果 API 可用
   */
  static isAvailable(): boolean {
    return typeof GM !== "undefined" && typeof GM.addElement === "function";
  }

  /**
   * 注入 Payload 脚本到页面主世界
   * 使用 GM.addElement 绕过 CSP 的 script-src 限制
   *
   * @param payload - 要注入的 JavaScript 代码字符串
   * @param id - 可选的脚本标识符，用于防止重复注入
   * @returns Promise<void> - 注入完成后 resolve
   * @throws Error - 如果 GM.addElement 不可用
   */
  static injectPayloadScript(payload: string, id?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 检查是否已注入过（防止重复注入）
        if (id && this.injectedScripts.has(id)) {
          console.log(
            `[CSPBypassInjector] Script "${id}" already injected, skipping`
          );
          resolve();
          return;
        }

        // 检查 GM.addElement API 是否可用
        if (!this.isAvailable()) {
          throw new Error(
            "GM.addElement not available. Please upgrade Tampermonkey to version 4.10 or later."
          );
        }

        // 使用特权 API 注入脚本
        // GM.addElement 创建的元素被视为扩展注入，绕过页面 CSP
        GM.addElement(document.body, "script", {
          textContent: payload,
          type: "text/javascript",
        });

        // 记录已注入的脚本
        if (id) {
          this.injectedScripts.add(id);
        }

        console.log(
          `[CSPBypassInjector] Script${
            id ? ` "${id}"` : ""
          } injected successfully`
        );
        resolve();
      } catch (error) {
        console.error("[CSPBypassInjector] Injection failed:", error);
        reject(error);
      }
    });
  }

  /**
   * 注入样式到页面
   * 使用 GM.addElement 绕过 CSP 的 style-src 限制
   *
   * @param css - CSS 样式字符串
   * @param id - 可选的样式标识符，用于防止重复注入
   */
  static injectStyle(css: string, id?: string): void {
    try {
      // 检查是否已注入过
      if (id && this.injectedScripts.has(`style_${id}`)) {
        console.log(
          `[CSPBypassInjector] Style "${id}" already injected, skipping`
        );
        return;
      }

      if (!this.isAvailable()) {
        // 回退到 GM_addStyle（如果可用）
        if (typeof GM_addStyle === "function") {
          GM_addStyle(css);
          console.log(
            `[CSPBypassInjector] Style${
              id ? ` "${id}"` : ""
            } injected via GM_addStyle fallback`
          );
          return;
        }
        console.warn(
          "[CSPBypassInjector] GM.addElement not available for style injection"
        );
        return;
      }

      // 使用 GM.addElement 注入样式
      GM.addElement(document.head, "style", {
        textContent: css,
      });

      // 记录已注入的样式
      if (id) {
        this.injectedScripts.add(`style_${id}`);
      }

      console.log(
        `[CSPBypassInjector] Style${id ? ` "${id}"` : ""} injected successfully`
      );
    } catch (error) {
      console.error("[CSPBypassInjector] Style injection failed:", error);
    }
  }

  /**
   * 检查脚本是否已注入
   * @param id - 脚本标识符
   * @returns true 如果已注入
   */
  static isInjected(id: string): boolean {
    return this.injectedScripts.has(id);
  }

  /**
   * 清除注入记录（用于测试或重新注入）
   */
  static clearInjectionRecord(): void {
    this.injectedScripts.clear();
    console.log("[CSPBypassInjector] Injection records cleared");
  }
}
