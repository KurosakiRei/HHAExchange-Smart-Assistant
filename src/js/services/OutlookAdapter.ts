/**
 * OutlookAdapter - Outlook Web 自动化适配器 (CSP-Compliant)
 * Epic 12, Story 11: CSP 合规的 Outlook 集成重构
 *
 * 职责：
 * - 在 Outlook Web 页面监听邮件任务
 * - 使用 GM.addElement 注入 DOM Controller 到主世界
 * - 通过 CustomEvent 与注入的脚本通信
 *
 * 重构说明：
 * - 原实现直接使用 DOM API 操作，被 Outlook CSP 阻止
 * - 新实现使用 CSPBypassInjector 注入自包含的控制器脚本
 * - 控制器在页面主世界运行，不受 CSP 限制
 *
 * 注意：仅在 https://outlook.office.com/* 页面运行
 *
 * @see docs/guides/Outlook CSP 绕过 Userscript 方案.md
 */

import { MailService, MailTask } from "./MailService";
import { CSPBypassInjector } from "./CSPBypassInjector";
import {
  OutlookDOMControllerPayload,
  OUTLOOK_DOM_CONTROLLER_ID,
} from "./OutlookDOMControllerPayload";

/**
 * 声明 Tampermonkey 的 unsafeWindow API
 * unsafeWindow 提供对页面真实 window 对象的访问
 * 这是必要的，因为 Tampermonkey 脚本运行在隔离的沙箱中
 * 而 HHAOutlookController 被注入到页面的主世界
 */
declare const unsafeWindow: Window & typeof globalThis;

/**
 * 声明全局 HHAOutlookController 类型
 */
declare global {
  interface Window {
    HHAOutlookController?: {
      executeMailTask: (task: MailTask) => Promise<void>;
      version: string;
      selectors: Record<string, string>;
    };
  }
}

/**
 * OutlookAdapter 类
 * CSP 合规的 Outlook Web 自动化适配器
 */
export class OutlookAdapter {
  private static isListening: boolean = false;
  private static controllerInjected: boolean = false;
  private static statusToast: HTMLElement | null = null;

  /**
   * 初始化适配器（仅在 Outlook 页面调用）
   */
  static init(): void {
    const hostname = window.location.hostname;
    const isOutlook = MailService.isOutlookPage();

    console.log("[OutlookAdapter] Checking page...", {
      hostname,
      isOutlook,
      href: window.location.href.substring(0, 50),
    });

    if (!isOutlook) {
      console.log("[OutlookAdapter] Not on Outlook page, skipping init");
      return;
    }

    console.log(
      "[OutlookAdapter] Initializing on Outlook page (CSP-Compliant)..."
    );
    MailService.init();

    // 注入 DOM Controller 到主世界（使用 GM.addElement 绕过 CSP）
    this.injectDOMController();

    // 开始监听邮件任务
    this.startListening();

    // 创建状态 Toast（使用 GM.addElement 绕过 CSP）
    this.createStatusToast();

    console.log("[OutlookAdapter] Initialization complete!");
  }

  /**
   * 注入 DOM Controller（仅执行一次）
   * 使用 CSPBypassInjector 将控制器脚本注入到页面主世界
   */
  private static async injectDOMController(): Promise<void> {
    if (this.controllerInjected) {
      console.log("[OutlookAdapter] DOM Controller already injected");
      return;
    }

    try {
      // 检查 GM.addElement 是否可用
      if (!CSPBypassInjector.isAvailable()) {
        console.error(
          "[OutlookAdapter] GM.addElement not available. Please upgrade Tampermonkey to version 4.10 or later."
        );
        this.showStatus("❌ 请升级 Tampermonkey 到 4.10 或更高版本", true);
        return;
      }

      // 使用 CSPBypassInjector 注入控制器脚本
      await CSPBypassInjector.injectPayloadScript(
        OutlookDOMControllerPayload,
        OUTLOOK_DOM_CONTROLLER_ID
      );

      this.controllerInjected = true;
      console.log("[OutlookAdapter] DOM Controller injected successfully");
    } catch (error) {
      console.error("[OutlookAdapter] Failed to inject DOM Controller:", error);
      this.showStatus(`❌ 注入失败: ${(error as Error).message}`, true);
    }
  }

  /**
   * 开始监听任务
   */
  private static startListening(): void {
    if (this.isListening) return;

    this.isListening = true;
    MailService.startListening((task, taskId) => {
      console.log("[OutlookAdapter] Received task:", taskId, task);
      this.handleMailTask(task, taskId);
    });

    console.log("[OutlookAdapter] Started listening for mail tasks");
  }

  /**
   * 处理邮件任务（调用注入的 Controller）
   */
  private static async handleMailTask(
    task: MailTask,
    taskId: string
  ): Promise<void> {
    try {
      this.showStatus("📧 正在打开新邮件...");

      // 确保 Controller 已注入
      if (!this.controllerInjected) {
        await this.injectDOMController();
      }

      // 等待 Controller 就绪
      // 注意：使用 unsafeWindow 访问页面主世界中的 Controller
      if (!unsafeWindow.HHAOutlookController) {
        await this.waitForController();
      }

      // 监听完成事件
      const completePromise = new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          document.removeEventListener(
            "hha-outlook-task-complete",
            handler as EventListener
          );
          reject(new Error("Task execution timeout (10s)"));
        }, 10000);

        const handler = (e: CustomEvent) => {
          clearTimeout(timeoutId);
          const { status, error } = e.detail;
          document.removeEventListener(
            "hha-outlook-task-complete",
            handler as EventListener
          );

          if (status === "SUCCESS") {
            resolve();
          } else {
            reject(new Error(error || "Unknown error"));
          }
        };

        document.addEventListener(
          "hha-outlook-task-complete",
          handler as EventListener
        );
      });

      // 调用注入的 Controller（使用 unsafeWindow）
      this.showStatus("📝 正在填充邮件内容...");
      unsafeWindow.HHAOutlookController!.executeMailTask(task);

      // 等待完成
      await completePromise;

      this.showStatus("✅ 邮件已准备就绪！");
      MailService.reportComplete(taskId);

      // 3秒后隐藏状态
      setTimeout(() => this.hideStatus(), 3000);
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error("[OutlookAdapter] Error handling mail task:", error);
      this.showStatus(`❌ 错误: ${errorMsg}`, true);
      MailService.reportFailed(taskId, errorMsg);

      // 5秒后隐藏状态
      setTimeout(() => this.hideStatus(), 5000);
    }
  }

  /**
   * 等待 Controller 加载
   * 使用 unsafeWindow 访问页面主世界中的 Controller
   */
  private static waitForController(timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (unsafeWindow.HHAOutlookController) {
          console.log(
            "[OutlookAdapter] Controller ready, version:",
            unsafeWindow.HHAOutlookController.version
          );
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error("Controller not loaded within timeout"));
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  }

  /**
   * 创建状态 Toast
   * 使用 GM.addElement 绕过 CSP 的 style-src 限制
   */
  private static createStatusToast(): void {
    if (this.statusToast) return;

    // 注入 Toast 样式
    const toastStyles = `
      #hha-outlook-status {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: none;
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transition: opacity 0.3s ease;
      }
      #hha-outlook-status.error {
        background: #e53935;
      }
      #hha-outlook-status.visible {
        display: block;
      }
    `;

    // 使用 CSPBypassInjector 注入样式
    CSPBypassInjector.injectStyle(toastStyles, "outlook-status-toast");

    // 创建 Toast 元素
    this.statusToast = document.createElement("div");
    this.statusToast.id = "hha-outlook-status";
    document.body.appendChild(this.statusToast);

    console.log("[OutlookAdapter] Status toast created");
  }

  /**
   * 显示状态
   */
  private static showStatus(message: string, isError: boolean = false): void {
    if (!this.statusToast) {
      this.createStatusToast();
    }

    if (this.statusToast) {
      this.statusToast.textContent = message;
      this.statusToast.className = isError ? "error visible" : "visible";
    }
  }

  /**
   * 隐藏状态
   */
  private static hideStatus(): void {
    if (this.statusToast) {
      this.statusToast.className = "";
    }
  }

  /**
   * 点击发送按钮（可选功能）
   * 注意：此功能需要用户确认，不自动执行
   */
  static async clickSend(): Promise<boolean> {
    if (!unsafeWindow.HHAOutlookController) {
      console.error("[OutlookAdapter] Controller not available");
      return false;
    }

    const sendBtn =
      document.querySelector('button[aria-label="Send"]') ||
      document.querySelector('[data-testid="send-button"]');

    if (sendBtn) {
      (sendBtn as HTMLElement).click();
      console.log("[OutlookAdapter] Clicked Send button");
      return true;
    }

    console.error("[OutlookAdapter] Send button not found");
    return false;
  }

  /**
   * 清理资源
   */
  static cleanup(): void {
    this.isListening = false;
    MailService.stopListening();
    if (this.statusToast) {
      this.statusToast.remove();
      this.statusToast = null;
    }
    console.log("[OutlookAdapter] Cleaned up");
  }
}
