/**
 * ApiParamProvider - Shared API Parameter Provider (Singleton)
 *
 * This module provides a centralized way to obtain API parameters needed for
 * HHAexchange API calls. It supports fetching parameters from both:
 * - app.hhaexchange.com (main application)
 * - reports.hhaexchange.com (reports domain)
 *
 * @author HHA Smart Assistant
 * @date 2026-01-08
 * @see docs/stories/epic-8-qa-report-feature.md - Story 8.1
 * @see docs/adr/008-qa-report-tab-implementation.md
 */

import GM_fetch from "@trim21/gm-fetch";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Base API Parameters (common across all API calls)
 */
export interface ApiParams {
  userID: string;
  appSecret: string;
  appVersion: string;
  version: string;
  minorVersion: string;
  appName: string;
}

/**
 * Full API Parameters including session-specific fields
 * Used for app.hhaexchange.com requests
 */
export interface FullApiParams extends ApiParams {
  sessionID: string;
  viewState: string;
  viewStateGenerator: string;
  vendorID: string;
}

/**
 * Session info from reports.hhaexchange.com
 * Used for Census and Patient Notes API calls
 */
export interface ReportsSessionInfo {
  sessionId: string;
  userId: string;
  officeIds: string;
  version: string;
  minorVersion: string;
  appVersion: string;
}

/**
 * Parameter source type
 */
export type ParamSource = "app" | "reports" | "auto";

// ============================================================================
// Constants
// ============================================================================

/**
 * 动态检测当前 HHAExchange 租户路径前缀（如 "ENT2602010000"）
 * 优先从 window.location.pathname 提取，其次从页面加载的 <script> src 提取
 * 避免因服务器版本升级导致的硬编码路径失效
 */
function detectTenantBaseUrl(): string {
  // 从 URL 字符串中提取版本号（纯数字部分），支持多种前缀格式
  function extractVersion(url: string): string | null {
    // /ENT2603010000/ 直接匹配
    const m1 = url.match(/\/ENT(\d+)\//);
    if (m1) return m1[1];
    // /HHANotification2603010000/ 或 /ENTP2603010000/ → 推导相同版本号
    const m2 = url.match(/\/(?:HHANotification|ENTP)(\d+)\//);
    if (m2) return m2[1];
    return null;
  }

  // 方法1：当前页面路径（含 HHANotification/ENTP 子应用路径）
  const r1 = extractVersion(window.location.pathname);
  if (r1) return `https://app.hhaexchange.com/ENT${r1}`;

  // 方法2：页面已加载的 <script> src 属性
  for (const script of Array.from(document.scripts)) {
    if (script.src) {
      const r2 = extractVersion(script.src);
      if (r2) return `https://app.hhaexchange.com/ENT${r2}`;
    }
  }

  // 方法3：完整页面 URL（含 hash）（for pages where ENT is not in path)
  const r3 = extractVersion(window.location.href);
  if (r3) return `https://app.hhaexchange.com/ENT${r3}`;

  // 方法4：父窗口 URL（适用于 HHANotification/ENTP 等同源 iframe）
  try {
    if (window.parent !== window) {
      const r4 = extractVersion(window.parent.location.href);
      if (r4) return `https://app.hhaexchange.com/ENT${r4}`;
    }
  } catch (_) {
    /* 跨域父窗口，跳过 */
  }

  console.warn(
    "[ApiParamProvider] Could not detect tenant prefix from URL, using fallback"
  );
  return "https://app.hhaexchange.com/ENT2603010000";
}

const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes cache

// ============================================================================
// ApiParamProvider Class (Singleton)
// ============================================================================

/**
 * ApiParamProvider - Singleton class for managing API parameters
 *
 * Features:
 * - Single instance across all modules (singleton pattern)
 * - Supports both app and reports domains
 * - Automatic caching with configurable expiry
 * - ViewState parsing and updating
 *
 * Usage:
 * ```typescript
 * const provider = ApiParamProvider.getInstance();
 * const params = await provider.getParams();
 * ```
 */
export class ApiParamProvider {
  private static instance: ApiParamProvider;

  // Cached parameters
  private appParams: FullApiParams | null = null;
  private reportsParams: ReportsSessionInfo | null = null;
  private cacheTimestamp: number = 0;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    console.log("[ApiParamProvider] Singleton instance created");
  }

  /**
   * Get the singleton instance of ApiParamProvider
   */
  public static getInstance(): ApiParamProvider {
    if (!ApiParamProvider.instance) {
      ApiParamProvider.instance = new ApiParamProvider();
    }
    return ApiParamProvider.instance;
  }

  /**
   * Reset the singleton instance (for testing purposes)
   */
  public static resetInstance(): void {
    ApiParamProvider.instance = null as any;
  }

  /**
   * 获取当前 HHAExchange 租户 Base URL（供其他模块复用）
   * 例如: "https://app.hhaexchange.com/ENT2602010000"
   */
  public static getTenantBaseUrl(): string {
    return detectTenantBaseUrl();
  }

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  /**
   * Get API parameters for app.hhaexchange.com
   * @returns Full API parameters including ViewState
   */
  public async getParams(): Promise<FullApiParams> {
    // Return cached params if still valid
    if (this.appParams && !this.isCacheExpired()) {
      console.log("[ApiParamProvider] Returning cached app params");
      return this.appParams;
    }

    console.log(
      "[ApiParamProvider] Fetching app params from CallMaintenance..."
    );
    this.appParams = await this.fetchFromAppPage();
    this.cacheTimestamp = Date.now();

    return this.appParams;
  }

  /**
   * Get session info for reports.hhaexchange.com
   * @returns Session info for reports API calls
   */
  public getReportsSessionInfo(): ReportsSessionInfo | null {
    // Return cached params if still valid
    if (this.reportsParams && !this.isCacheExpired()) {
      return this.reportsParams;
    }

    // Cache expired or not set — re-extract from current page
    if (this.reportsParams) {
      console.log(
        "[ApiParamProvider] Reports session cache expired, re-extracting"
      );
    }
    this.reportsParams = this.extractFromReportsPage();
    return this.reportsParams;
  }

  /**
   * Get session info, automatically detecting source
   * @returns Session info for API calls
   */
  public async getSessionInfo(): Promise<ReportsSessionInfo> {
    // Try reports page first if we're on reports domain
    if (this.isReportsPage()) {
      const reportsInfo = this.getReportsSessionInfo();
      if (reportsInfo) {
        return reportsInfo;
      }
    }

    // Fall back to app params
    const appParams = await this.getParams();
    return {
      sessionId: appParams.sessionID,
      userId: appParams.userID,
      officeIds: "", // Need to get from JWT token
      version: appParams.version,
      minorVersion: appParams.minorVersion,
      appVersion: appParams.appVersion,
    };
  }

  /**
   * Parse ViewState from HTML and update cached params
   * @param htmlText - HTML content containing ViewState
   * @returns Extracted ViewState values
   */
  public parseViewState(htmlText: string): {
    viewState: string;
    viewStateGenerator: string;
  } {
    const viewState = this.getInputValue("__VIEWSTATE", htmlText);
    const viewStateGenerator = this.getInputValue(
      "__VIEWSTATEGENERATOR",
      htmlText
    );

    // Update cached params if available
    if (this.appParams) {
      if (viewState) {
        this.appParams.viewState = viewState;
      }
      if (viewStateGenerator) {
        this.appParams.viewStateGenerator = viewStateGenerator;
      }
    }

    return {
      viewState: viewState || "",
      viewStateGenerator: viewStateGenerator || "",
    };
  }

  /**
   * Check if we're on the reports.hhaexchange.com domain
   */
  public isReportsPage(): boolean {
    return window.location.hostname.includes("reports.hhaexchange.com");
  }

  /**
   * Check if we're on the app.hhaexchange.com domain
   */
  public isAppPage(): boolean {
    return window.location.hostname.includes("app.hhaexchange.com");
  }

  /**
   * Clear all cached parameters
   */
  public clearCache(): void {
    this.appParams = null;
    this.reportsParams = null;
    this.cacheTimestamp = 0;
    console.log("[ApiParamProvider] Cache cleared");
  }

  /**
   * Clear only the reports session cache, preserving app params
   */
  public clearReportsCache(): void {
    this.reportsParams = null;
    console.log("[ApiParamProvider] Reports session cache cleared");
  }

  /**
   * Get office IDs from JWT token
   */
  public getOfficeIdsFromToken(): string {
    try {
      const tokenMatch = document.cookie.match(/HHAX_ENT_AccessToken=([^;]+)/);
      if (tokenMatch) {
        const payload = JSON.parse(atob(tokenMatch[1].split(".")[1]));
        return payload.pid || "";
      }
    } catch (e) {
      console.warn("[ApiParamProvider] Failed to parse JWT token:", e);
    }
    return "";
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Check if cache has expired
   */
  private isCacheExpired(): boolean {
    return Date.now() - this.cacheTimestamp > CACHE_EXPIRY_MS;
  }

  /**
   * Fetch API parameters from app.hhaexchange.com CallMaintenance page
   */
  private async fetchFromAppPage(): Promise<FullApiParams> {
    const callMaintenanceUrl = `${detectTenantBaseUrl()}/Call/CallMaintenance_ns.aspx`;
    console.log(
      "[ApiParamProvider] fetchFromAppPage using URL:",
      callMaintenanceUrl
    );
    const r = (await GM_fetch(callMaintenanceUrl, {
      method: "GET",
    })) as Response & {
      rawBody: Blob;
    };
    const text = await r.rawBody.text();

    const params: FullApiParams = {
      userID: this.getParamFromText("userID", text)!,
      appSecret: this.getParamFromText("appSecret", text)!,
      appVersion: this.getParamFromText("appVersion", text)!,
      version: this.getParamFromText("version", text)!,
      minorVersion: this.getParamFromText("minorVersion", text)!,
      appName: this.getParamFromText("appName", text)!,
      sessionID: this.getParamFromText("sessionID", text)!,
      vendorID: this.getParamFromText("vendorID", text)!,
      viewState: this.getInputValue("__VIEWSTATE", text)!,
      viewStateGenerator: this.getInputValue("__VIEWSTATEGENERATOR", text)!,
    };

    // Validate all required parameters
    for (const [key, value] of Object.entries(params)) {
      if (!value) {
        throw new Error(
          `[ApiParamProvider] Failed to extract critical API parameter: ${key}`
        );
      }
    }

    console.log("[ApiParamProvider] App params cached successfully");
    return params;
  }

  /**
   * Extract session info from reports.hhaexchange.com page
   */
  private extractFromReportsPage(): ReportsSessionInfo | null {
    try {
      // From cookie
      const sessionMatch = document.cookie.match(/HHAX_Session=([^;]+)/);
      if (!sessionMatch) {
        console.warn("[ApiParamProvider] HHAX_Session cookie not found");
        return null;
      }

      // From JWT token
      const tokenMatch = document.cookie.match(/HHAX_ENT_AccessToken=([^;]+)/);
      let userId = "";
      let officeIds = "";

      if (tokenMatch) {
        try {
          const payload = JSON.parse(atob(tokenMatch[1].split(".")[1]));
          userId = payload.uid || "";
          officeIds = payload.pid || "";
        } catch (e) {
          console.warn("[ApiParamProvider] JWT parse error:", e);
        }
      }

      // From hidden fields or URL
      const hdnUserID = (
        document.getElementById(
          "ctl00_ContentPlaceHolder1_hdnUserID"
        ) as HTMLInputElement
      )?.value;
      const hdnOfficeID = (
        document.getElementById(
          "ctl00_ContentPlaceHolder1_hdnOfficeID"
        ) as HTMLInputElement
      )?.value;
      const hdnVersion = (
        document.getElementById(
          "ctl00_ContentPlaceHolder1_hdnVersion"
        ) as HTMLInputElement
      )?.value;
      const hdnMinorVersion = (
        document.getElementById(
          "ctl00_ContentPlaceHolder1_hdnMinorVersion"
        ) as HTMLInputElement
      )?.value;
      const hdnAppVersion = (
        document.getElementById(
          "ctl00_ContentPlaceHolder1_hdnAppVersion"
        ) as HTMLInputElement
      )?.value;

      const urlParams = new URLSearchParams(window.location.search);

      return {
        sessionId: sessionMatch[1],
        userId: hdnUserID || userId,
        officeIds: hdnOfficeID || officeIds,
        version: hdnVersion || urlParams.get("Version") || "25.07",
        minorVersion:
          hdnMinorVersion || urlParams.get("MinorVersion") || "1.00",
        appVersion: hdnAppVersion || urlParams.get("AppVersion") || "ENT",
      };
    } catch (e) {
      console.error(
        "[ApiParamProvider] Failed to extract reports session info:",
        e
      );
      return null;
    }
  }

  /**
   * Extract parameter value from text using regex
   * Pattern: key: 'value'
   */
  private getParamFromText(key: string, sourceText: string): string | null {
    const regex = new RegExp(`${key}\\s*:\\s*'([^']+)'`);
    const match = sourceText.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Extract hidden input value from HTML
   */
  private getInputValue(id: string, sourceText: string): string | null {
    const match = sourceText.match(
      new RegExp(`id="${id}"[\\s\\S]*?value="([^"]*)"`)
    );
    return match ? match[1] : null;
  }
}

// ============================================================================
// Export default instance for convenience
// ============================================================================

export const apiParamProvider = ApiParamProvider.getInstance();
export default ApiParamProvider;
