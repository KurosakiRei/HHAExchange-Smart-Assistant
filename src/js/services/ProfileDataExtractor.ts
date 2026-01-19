/**
 * ProfileDataExtractor Service
 * Epic 12, Story 1 & 2: 页面数据提取服务
 *
 * 识别当前页面类型并从 DOM 提取病人/护理员信息：
 * - PATIENT_INTERNAL: InternalPatientInfo_ns.aspx
 * - PATIENT_NS: Patient_ns.aspx
 * - CAREGIVER: Aide_ns.aspx
 * - UNKNOWN: 其他页面
 */

export type ProfilePageType =
  | "PATIENT_INTERNAL"
  | "PATIENT_NS"
  | "CAREGIVER"
  | "UNKNOWN";

export interface ProfileData {
  type: "PATIENT" | "CAREGIVER";
  name: string;
  id: string;
  dob?: string;
  address?: string;
  phone?: string;
  insurance?: string;
}

/**
 * CSS 选择器配置
 * 基于 Chrome MCP DOM 分析结果
 */
const SELECTORS = {
  // 病人 InternalPatientInfo 页面
  PATIENT_INTERNAL: {
    name: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientName",
    id: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientNumber", // 小写 d
    dob: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientDOB",
    address: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblAddress",
    insurance: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblContracts",
  },
  // 病人 Patient_ns 页面
  PATIENT_NS: {
    name: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientName",
    id: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientNumber", // 大写 ID
    dob: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientDOB",
    address: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblAddress",
    insurance: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblChhaName", // 不同字段
  },
  // 护理员 Aide_ns 页面
  CAREGIVER: {
    name: "#ctl00_ContentPlaceHolder1_uxlblInfoName",
    id: "#ctl00_ContentPlaceHolder1_uxlblInfoAideInitials",
    dob: "#ctl00_ContentPlaceHolder1_uxlblInfoDOB",
    address: "#uxHyPAddress",
    addressFallback: "#lblInfoAddress",
  },
} as const;

export class ProfileDataExtractor {
  private static currentPageType: ProfilePageType = "UNKNOWN";
  private static listeners: Array<(pageType: ProfilePageType) => void> = [];
  private static checkInterval: number | null = null;

  /**
   * 检测当前页面类型
   */
  static detectPageType(): ProfilePageType {
    const url = window.location.href;

    if (url.includes("InternalPatientInfo_ns.aspx")) {
      return "PATIENT_INTERNAL";
    }

    if (url.includes("Patient_ns.aspx")) {
      return "PATIENT_NS";
    }

    if (url.includes("Aide_ns.aspx")) {
      return "CAREGIVER";
    }

    return "UNKNOWN";
  }

  /**
   * 获取当前页面类型（缓存版本）
   */
  static getCurrentPageType(): ProfilePageType {
    this.currentPageType = this.detectPageType();
    return this.currentPageType;
  }

  /**
   * 提取页面数据
   */
  static extract(): ProfileData | null {
    const pageType = this.detectPageType();

    switch (pageType) {
      case "PATIENT_INTERNAL":
        return this.extractPatientInternal();
      case "PATIENT_NS":
        return this.extractPatientNs();
      case "CAREGIVER":
        return this.extractCaregiver();
      default:
        return null;
    }
  }

  /**
   * 从 InternalPatientInfo 页面提取数据
   */
  private static extractPatientInternal(): ProfileData {
    const selectors = SELECTORS.PATIENT_INTERNAL;
    return {
      type: "PATIENT",
      name: this.getText(selectors.name),
      id: this.getText(selectors.id),
      dob: this.getText(selectors.dob),
      address: this.getText(selectors.address),
      phone: this.getPhoneFromTelLink(),
      insurance: this.getText(selectors.insurance),
    };
  }

  /**
   * 从 Patient_ns 页面提取数据
   */
  private static extractPatientNs(): ProfileData {
    const selectors = SELECTORS.PATIENT_NS;
    return {
      type: "PATIENT",
      name: this.getText(selectors.name),
      id: this.getText(selectors.id),
      dob: this.getText(selectors.dob),
      address: this.getText(selectors.address),
      phone: this.getPhoneFromTelLink(),
      insurance: this.getText(selectors.insurance),
    };
  }

  /**
   * 从 Aide_ns 页面提取数据
   */
  private static extractCaregiver(): ProfileData {
    const selectors = SELECTORS.CAREGIVER;
    // 地址尝试两个选择器
    let address = this.getText(selectors.address);
    if (!address) {
      address = this.getText(selectors.addressFallback);
    }

    return {
      type: "CAREGIVER",
      name: this.getText(selectors.name),
      id: this.getText(selectors.id),
      dob: this.getText(selectors.dob),
      address: address,
      phone: this.getPhoneFromTelLink(),
    };
  }

  /**
   * 获取元素文本内容
   */
  private static getText(selector: string): string {
    const el = document.querySelector(selector);
    return el?.textContent?.trim() || "";
  }

  /**
   * 从 tel: 链接提取电话号码
   */
  private static getPhoneFromTelLink(): string {
    const telLink = document.querySelector(
      'a[href^="tel:"]'
    ) as HTMLAnchorElement;
    if (telLink) {
      // 从 href="tel:917-622-0826" 提取号码
      const href = telLink.getAttribute("href") || "";
      return href.replace("tel:", "").trim();
    }
    return "";
  }

  /**
   * 注册页面变化监听器
   */
  static onPageChange(callback: (pageType: ProfilePageType) => void): void {
    this.listeners.push(callback);

    // 首次调用时启动监听
    if (this.checkInterval === null) {
      this.startWatching();
    }
  }

  /**
   * 移除页面变化监听器
   */
  static offPageChange(callback: (pageType: ProfilePageType) => void): void {
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
   */
  private static startWatching(): void {
    this.currentPageType = this.detectPageType();

    // 每 500ms 检查一次 URL 变化
    this.checkInterval = window.setInterval(() => {
      const newPageType = this.detectPageType();

      if (newPageType !== this.currentPageType) {
        console.log(
          `[ProfileDataExtractor] Page changed: ${this.currentPageType} -> ${newPageType}`
        );
        this.currentPageType = newPageType;
        this.notifyListeners(newPageType);
      }
    }, 500);

    console.log("[ProfileDataExtractor] Started watching for page changes");
  }

  /**
   * 停止监听 URL 变化
   */
  private static stopWatching(): void {
    if (this.checkInterval !== null) {
      window.clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("[ProfileDataExtractor] Stopped watching for page changes");
    }
  }

  /**
   * 通知所有监听器
   */
  private static notifyListeners(pageType: ProfilePageType): void {
    this.listeners.forEach((callback) => {
      try {
        callback(pageType);
      } catch (error) {
        console.error(
          "[ProfileDataExtractor] Error in listener callback:",
          error
        );
      }
    });
  }

  /**
   * 获取页面友好名称
   */
  static getPageDisplayName(pageType: ProfilePageType): string {
    switch (pageType) {
      case "PATIENT_INTERNAL":
      case "PATIENT_NS":
        return "病人主页";
      case "CAREGIVER":
        return "护理员主页";
      default:
        return "未知页面";
    }
  }

  /**
   * 判断是否为 Profile 页面
   */
  static isProfilePage(pageType: ProfilePageType): boolean {
    return pageType !== "UNKNOWN";
  }

  /**
   * 清理资源
   */
  static cleanup(): void {
    this.stopWatching();
    this.listeners = [];
  }
}
