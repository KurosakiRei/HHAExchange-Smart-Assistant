/**
 * PageDetector Service
 * Epic 11, Story 1: 页面检测服务
 *
 * 识别当前页面类型：
 * - PREBILLING: PrebillingReportInternal_ns.aspx
 * - CALL_MAINTENANCE: CallMaintenance_ns.aspx
 * - UNKNOWN: 其他页面
 */

export type PageType =
  | "PREBILLING"
  | "CALL_MAINTENANCE"
  | "PATIENT_PROFILE"
  | "UNKNOWN";

export class PageDetector {
  private static currentPageType: PageType = "UNKNOWN";
  private static listeners: Array<(pageType: PageType) => void> = [];
  private static checkInterval: number | null = null;

  /**
   * 检测当前页面类型
   */
  static detectPageType(): PageType {
    const url = window.location.href;

    if (url.includes("PrebillingReportInternal_ns.aspx")) {
      return "PREBILLING";
    }

    if (url.includes("CallMaintenance_ns.aspx")) {
      return "CALL_MAINTENANCE";
    }

    if (url.includes("InternalPatientInfo_ns.aspx")) {
      return "PATIENT_PROFILE";
    }

    return "UNKNOWN";
  }

  /**
   * 获取当前页面类型（缓存版本）
   */
  static getCurrentPageType(): PageType {
    this.currentPageType = this.detectPageType();
    return this.currentPageType;
  }

  /**
   * 注册页面变化监听器
   */
  static onPageChange(callback: (pageType: PageType) => void): void {
    this.listeners.push(callback);

    // 首次调用时启动监听
    if (this.checkInterval === null) {
      this.startWatching();
    }
  }

  /**
   * 移除页面变化监听器
   */
  static offPageChange(callback: (pageType: PageType) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }

    // 如果没有监听器，停止监听
    if (this.listeners.length === 0 && this.checkInterval !== null) {
      this.stopWatching();
    }
  }

  /**
   * 开始监听 URL 变化
   * 使用轮询方式检测，因为 HHAExchange 可能使用 iframe 或其他方式导航
   */
  private static startWatching(): void {
    this.currentPageType = this.detectPageType();

    // 每 500ms 检查一次 URL 变化
    this.checkInterval = window.setInterval(() => {
      const newPageType = this.detectPageType();

      if (newPageType !== this.currentPageType) {
        console.log(
          `[PageDetector] Page changed: ${this.currentPageType} -> ${newPageType}`
        );
        this.currentPageType = newPageType;
        this.notifyListeners(newPageType);
      }
    }, 500);

    console.log("[PageDetector] Started watching for page changes");
  }

  /**
   * 停止监听 URL 变化
   */
  private static stopWatching(): void {
    if (this.checkInterval !== null) {
      window.clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("[PageDetector] Stopped watching for page changes");
    }
  }

  /**
   * 通知所有监听器
   */
  private static notifyListeners(pageType: PageType): void {
    this.listeners.forEach((callback) => {
      try {
        callback(pageType);
      } catch (error) {
        console.error("[PageDetector] Error in listener callback:", error);
      }
    });
  }

  /**
   * 获取页面友好名称
   */
  static getPageDisplayName(pageType: PageType): string {
    switch (pageType) {
      case "PREBILLING":
        return "Prebilling Report Internal";
      case "CALL_MAINTENANCE":
        return "Call Maintenance";
      case "PATIENT_PROFILE":
        return "Patient Profile";
      default:
        return "未知页面";
    }
  }

  /**
   * 清理资源
   */
  static cleanup(): void {
    this.stopWatching();
    this.listeners = [];
  }
}
