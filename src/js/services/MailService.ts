/**
 * MailService - 跨 Tab 邮件任务通讯服务
 * Epic 12, Story 7: 独立的跨 Tab 通讯服务
 *
 * 职责：
 * - HHA Tab 发送邮件任务到 Outlook Tab
 * - 使用 GM_setValue 实现跨域数据共享
 * - 轮询检测任务更新
 *
 * 独立实现：不依赖 VisitMonitor.ts 的 TabSyncManager
 */

declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue(key: string, value: string): void;

/**
 * 邮件任务状态
 */
export type MailTaskStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

/**
 * 邮件任务接口
 */
export interface MailTask {
  to: string;
  cc?: string;
  subject: string;
  body: string; // 支持 HTML
}

/**
 * 邮件任务载荷
 */
export interface MailTaskPayload {
  id: string;
  status: MailTaskStatus;
  data: MailTask;
  timestamp: number;
  sourceTabId: string;
  error?: string;
}

/**
 * 任务回调类型
 */
type TaskCallback = (task: MailTask, taskId: string) => void;
type StatusCallback = (payload: MailTaskPayload) => void;

/**
 * MailService 类
 * 独立的跨 Tab 通讯服务
 */
export class MailService {
  private static readonly TASK_KEY = "hha_mail_service_bus";
  private static readonly POLL_INTERVAL = 1000; // 1秒轮询
  private static readonly TASK_EXPIRY = 5 * 60 * 1000; // 5分钟过期

  private static tabId: string = "";
  private static pollingTimer: number | null = null;
  private static taskListeners: TaskCallback[] = [];
  private static statusListeners: StatusCallback[] = [];
  private static lastProcessedTaskId: string = "";

  /**
   * 初始化服务
   */
  static init(): void {
    this.tabId = this.generateTabId();
    console.log("[MailService] Initialized with tabId:", this.tabId);
  }

  /**
   * 生成唯一的 Tab ID
   */
  private static generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取当前 Tab ID
   */
  static getTabId(): string {
    if (!this.tabId) {
      this.init();
    }
    return this.tabId;
  }

  /**
   * 发送邮件任务（HHA 端调用）
   */
  static sendMailTask(task: MailTask): string {
    const taskId = `task_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const payload: MailTaskPayload = {
      id: taskId,
      status: "PENDING",
      data: task,
      timestamp: Date.now(),
      sourceTabId: this.getTabId(),
    };

    GM_setValue(this.TASK_KEY, JSON.stringify(payload));
    console.log("[MailService] Sent mail task:", taskId, task);

    return taskId;
  }

  /**
   * 获取当前任务载荷
   */
  static getTaskPayload(): MailTaskPayload | null {
    try {
      const stored = GM_getValue<string>(this.TASK_KEY, "");
      if (!stored) return null;

      const payload = JSON.parse(stored) as MailTaskPayload;

      // 检查是否过期
      if (Date.now() - payload.timestamp > this.TASK_EXPIRY) {
        console.log("[MailService] Task expired, clearing...");
        this.clearTask();
        return null;
      }

      return payload;
    } catch (error) {
      console.error("[MailService] Error parsing task payload:", error);
      return null;
    }
  }

  /**
   * 开始监听任务（Outlook 端调用）
   */
  static startListening(callback: TaskCallback): void {
    this.taskListeners.push(callback);

    if (this.pollingTimer === null) {
      this.startPolling();
    }
  }

  /**
   * 停止监听
   */
  static stopListening(callback?: TaskCallback): void {
    if (callback) {
      const index = this.taskListeners.indexOf(callback);
      if (index > -1) {
        this.taskListeners.splice(index, 1);
      }
    } else {
      this.taskListeners = [];
    }

    if (this.taskListeners.length === 0) {
      this.stopPolling();
    }
  }

  /**
   * 监听任务状态变化（HHA 端调用）
   */
  static onStatusChange(callback: StatusCallback): void {
    this.statusListeners.push(callback);

    if (this.pollingTimer === null) {
      this.startPolling();
    }
  }

  /**
   * 停止监听状态变化
   */
  static offStatusChange(callback?: StatusCallback): void {
    if (callback) {
      const index = this.statusListeners.indexOf(callback);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    } else {
      this.statusListeners = [];
    }
  }

  /**
   * 开始轮询
   */
  private static startPolling(): void {
    if (this.pollingTimer !== null) return;

    console.log("[MailService] Starting polling...");

    this.pollingTimer = window.setInterval(() => {
      const payload = this.getTaskPayload();

      if (payload) {
        // 通知状态监听器
        this.statusListeners.forEach((cb) => {
          try {
            cb(payload);
          } catch (e) {
            console.error("[MailService] Status callback error:", e);
          }
        });

        // 检查是否有待处理的任务（仅 Outlook 端可以处理任务）
        if (
          this.isOutlookPage() &&
          payload.status === "PENDING" &&
          payload.id !== this.lastProcessedTaskId
        ) {
          this.lastProcessedTaskId = payload.id;

          // 标记为处理中
          this.updateTaskStatus(payload.id, "PROCESSING");

          // 通知任务监听器
          this.taskListeners.forEach((cb) => {
            try {
              cb(payload.data, payload.id);
            } catch (e) {
              console.error("[MailService] Task callback error:", e);
            }
          });
        }
      }
    }, this.POLL_INTERVAL);
  }

  /**
   * 停止轮询
   */
  private static stopPolling(): void {
    if (this.pollingTimer !== null) {
      window.clearInterval(this.pollingTimer);
      this.pollingTimer = null;
      console.log("[MailService] Polling stopped");
    }
  }

  /**
   * 更新任务状态
   */
  static updateTaskStatus(
    taskId: string,
    status: MailTaskStatus,
    error?: string
  ): void {
    const payload = this.getTaskPayload();

    if (payload && payload.id === taskId) {
      payload.status = status;
      if (error) payload.error = error;
      payload.timestamp = Date.now();

      GM_setValue(this.TASK_KEY, JSON.stringify(payload));
      console.log("[MailService] Updated task status:", taskId, status);
    }
  }

  /**
   * 报告任务完成（Outlook 端调用）
   */
  static reportComplete(taskId: string): void {
    this.updateTaskStatus(taskId, "COMPLETED");
    console.log("[MailService] Task completed:", taskId);
  }

  /**
   * 报告任务失败（Outlook 端调用）
   */
  static reportFailed(taskId: string, error: string): void {
    this.updateTaskStatus(taskId, "FAILED", error);
    console.log("[MailService] Task failed:", taskId, error);
  }

  /**
   * 清除任务
   */
  static clearTask(): void {
    GM_setValue(this.TASK_KEY, "");
  }

  /**
   * 检查是否在 Outlook 页面
   */
  static isOutlookPage(): boolean {
    return window.location.hostname === "outlook.office.com";
  }

  /**
   * 检查是否在 HHA 页面
   */
  static isHHAPage(): boolean {
    return window.location.hostname.includes("hhaexchange.com");
  }

  /**
   * 清理资源
   */
  static cleanup(): void {
    this.stopPolling();
    this.taskListeners = [];
    this.statusListeners = [];
  }
}
