/**
 * OutlookAdapter - Outlook Web 自动化适配器
 * Epic 12, Story 8: Outlook DOM 自动化
 *
 * 职责：
 * - 在 Outlook Web 页面监听邮件任务
 * - 自动填充 New Mail 表单
 * - 操作 DOM 元素发送邮件
 *
 * 注意：仅在 https://outlook.office.com/mail/ 页面运行
 */

import { MailService, MailTask } from "./MailService";

/**
 * Outlook DOM 选择器
 * 基于 Chrome MCP DOM 分析结果
 */
const OUTLOOK_SELECTORS = {
  // 新邮件按钮
  newMailButton: 'button[aria-label="New mail"]',
  newMailButtonAlt: '[data-testid="new-message-button"]',

  // 邮件编辑器字段
  toField: 'input[aria-label="To"]',
  toFieldAlt: '[role="combobox"][aria-label="To"]',

  ccButton: 'button[aria-label="Cc"]',
  ccField: 'input[aria-label="Cc"]',

  subjectField: 'input[aria-label="Add a subject"]',
  subjectFieldAlt: '[placeholder="Add a subject"]',

  // 邮件正文 - contenteditable div
  bodyEditor: '[role="textbox"][aria-label="Message body"]',
  bodyEditorAlt: 'div[aria-label="Message body, press Alt+F10 to exit"]',

  // 发送按钮
  sendButton: 'button[aria-label="Send"]',
  sendButtonAlt: '[data-testid="send-button"]',
} as const;

/**
 * OutlookAdapter 类
 */
export class OutlookAdapter {
  private static isListening: boolean = false;
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

    console.log("[OutlookAdapter] Initializing on Outlook page...");
    MailService.init();

    // 开始监听邮件任务
    this.startListening();

    // 创建状态 Toast
    this.createStatusToast();

    console.log("[OutlookAdapter] Initialization complete!");
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
   * 处理邮件任务
   */
  private static async handleMailTask(
    task: MailTask,
    taskId: string
  ): Promise<void> {
    try {
      this.showStatus("📧 正在打开新邮件...");

      // 1. 点击 New Mail 按钮
      const clicked = await this.clickNewMail();
      if (!clicked) {
        throw new Error("无法点击 New Mail 按钮");
      }

      // 等待编辑器加载
      await this.wait(1500);

      this.showStatus("📝 正在填充邮件内容...");

      // 2. 填充 To 字段
      if (task.to) {
        await this.fillField("to", task.to);
        await this.wait(300);
      }

      // 3. 填充 CC 字段（如果有）
      if (task.cc) {
        await this.expandCC();
        await this.wait(300);
        await this.fillField("cc", task.cc);
        await this.wait(300);
      }

      // 4. 填充 Subject
      await this.fillField("subject", task.subject);
      await this.wait(300);

      // 5. 填充 Body
      await this.fillBody(task.body);

      this.showStatus("✅ 邮件已准备就绪！");

      // 报告完成
      MailService.reportComplete(taskId);

      // 3秒后隐藏状态
      setTimeout(() => this.hideStatus(), 3000);
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error("[OutlookAdapter] Error handling mail task:", error);
      this.showStatus(`❌ 错误: ${errorMsg}`, true);
      MailService.reportFailed(taskId, errorMsg);

      setTimeout(() => this.hideStatus(), 5000);
    }
  }

  /**
   * 点击 New Mail 按钮
   */
  private static async clickNewMail(): Promise<boolean> {
    const selectors = [
      OUTLOOK_SELECTORS.newMailButton,
      OUTLOOK_SELECTORS.newMailButtonAlt,
    ];

    for (const selector of selectors) {
      const btn = document.querySelector(selector) as HTMLElement;
      if (btn) {
        btn.click();
        console.log("[OutlookAdapter] Clicked New Mail button");
        return true;
      }
    }

    console.error("[OutlookAdapter] New Mail button not found");
    return false;
  }

  /**
   * 展开 CC 字段
   */
  private static async expandCC(): Promise<void> {
    const ccButton = document.querySelector(
      OUTLOOK_SELECTORS.ccButton
    ) as HTMLElement;
    if (ccButton) {
      ccButton.click();
      await this.wait(300);
    }
  }

  /**
   * 填充字段
   */
  private static async fillField(
    fieldType: "to" | "cc" | "subject",
    value: string
  ): Promise<void> {
    let selectors: string[];

    switch (fieldType) {
      case "to":
        selectors = [OUTLOOK_SELECTORS.toField, OUTLOOK_SELECTORS.toFieldAlt];
        break;
      case "cc":
        selectors = [OUTLOOK_SELECTORS.ccField];
        break;
      case "subject":
        selectors = [
          OUTLOOK_SELECTORS.subjectField,
          OUTLOOK_SELECTORS.subjectFieldAlt,
        ];
        break;
    }

    for (const selector of selectors) {
      const field = document.querySelector(selector) as HTMLInputElement;
      if (field) {
        // Focus the field
        field.focus();
        await this.wait(100);

        // Set value
        field.value = value;

        // Trigger input event for React/Angular apps
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));

        console.log(`[OutlookAdapter] Filled ${fieldType}: ${value}`);
        return;
      }
    }

    console.warn(`[OutlookAdapter] ${fieldType} field not found`);
  }

  /**
   * 填充邮件正文
   */
  private static async fillBody(body: string): Promise<void> {
    const selectors = [
      OUTLOOK_SELECTORS.bodyEditor,
      OUTLOOK_SELECTORS.bodyEditorAlt,
    ];

    for (const selector of selectors) {
      const editor = document.querySelector(selector) as HTMLElement;
      if (editor) {
        // Focus editor
        editor.focus();
        await this.wait(100);

        // 将换行转换为 HTML
        const htmlBody = body.replace(/\n/g, "<br>");

        // 使用 innerHTML 设置内容
        editor.innerHTML = htmlBody;

        // Trigger input event
        editor.dispatchEvent(new Event("input", { bubbles: true }));

        console.log("[OutlookAdapter] Filled body");
        return;
      }
    }

    console.warn("[OutlookAdapter] Body editor not found");
  }

  /**
   * 点击发送按钮（可选功能）
   */
  static async clickSend(): Promise<boolean> {
    const selectors = [
      OUTLOOK_SELECTORS.sendButton,
      OUTLOOK_SELECTORS.sendButtonAlt,
    ];

    for (const selector of selectors) {
      const btn = document.querySelector(selector) as HTMLElement;
      if (btn) {
        btn.click();
        console.log("[OutlookAdapter] Clicked Send button");
        return true;
      }
    }

    console.error("[OutlookAdapter] Send button not found");
    return false;
  }

  /**
   * 创建状态 Toast
   */
  private static createStatusToast(): void {
    if (this.statusToast) return;

    this.statusToast = document.createElement("div");
    this.statusToast.id = "hha-outlook-status";
    this.statusToast.style.cssText = `
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
    `;
    document.body.appendChild(this.statusToast);
  }

  /**
   * 显示状态
   */
  private static showStatus(message: string, isError: boolean = false): void {
    if (!this.statusToast) return;

    this.statusToast.textContent = message;
    this.statusToast.style.background = isError ? "#e53935" : "#333";
    this.statusToast.style.display = "block";
  }

  /**
   * 隐藏状态
   */
  private static hideStatus(): void {
    if (this.statusToast) {
      this.statusToast.style.display = "none";
    }
  }

  /**
   * 等待工具函数
   */
  private static wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
  }
}
