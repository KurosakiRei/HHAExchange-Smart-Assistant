/**
 * PatientCalendarApiProvider
 * Epic 16, Story 2: Patient Vacation 通知内置模板
 *
 * 职责：
 * - 提供 Calendar API 所需的 CalendarApiParams
 * - 优先读 Calendar iframe，fallback GM_fetch Calendar 页面 HTML 解析
 */

import GM_fetch from "@trim21/gm-fetch";
import { ApiParamProvider } from "./ApiParamProvider";

/** Calendar API 所需参数 */
export interface CalendarApiParams {
  hhwsPath: string; // e.g. "/HHAWSENT2603010000/"
  appName: string;
  appSecret: string;
  userID: string;
  patientID: string;
  officeID: string;
  vendorID: string;
  appVersion: string;
  version: string;
  minorVersion: string;
  callerInfo: string;
  providerApiUrl: string; // for Master Week
}

export class PatientCalendarApiProvider {
  /**
   * 获取 Calendar API 所需参数，优先从 Calendar iframe 读取，否则 GM_fetch 解析
   */
  static async getParams(patientId: string): Promise<CalendarApiParams> {
    // 策略1：从 Calendar iframe 直接读取
    const fromIframe = this.tryFromIframe(patientId);
    if (fromIframe) {
      return fromIframe;
    }

    // 策略2：GM_fetch 获取 Calendar 页 HTML 并解析
    return this.fetchFromCalendarPage(patientId);
  }

  // ─── Strategy 1: Calendar iframe ─────────────────────────────────────────

  private static tryFromIframe(patientId: string): CalendarApiParams | null {
    try {
      const iframe = document.getElementById(
        "iframefrmRightSide"
      ) as HTMLIFrameElement | null;
      if (!iframe) return null;

      const src = iframe.src || "";
      if (!src.includes("InternalPatientCalendarDetails_ns.aspx")) return null;

      const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iDoc) return null;

      const get = (id: string): string =>
        (iDoc.getElementById(id) as HTMLInputElement | null)?.value ?? "";

      const hhwsPath = get("hdnHHWSPath");
      const appSecret = get("hdnAppSecret");
      const userID = get("hdnUserID");
      const vendorID = get("hdnvendorID");
      const providerApiUrl = get("hdnProviderPatientAPIUrl");
      const appName = get("hdnAppName");
      const appVersion = get("hdnAppVersion");
      const version = get("hdnVersion");
      const minorVersion = get("hdnMinorVersion");
      const callerInfo = get("hdnCallerInfo");
      const officeID = get("hdnOfficeID");

      if (!hhwsPath || !appSecret || !userID) return null;

      return {
        hhwsPath,
        appName: appName || "HHAeXchange",
        appSecret,
        userID,
        patientID: patientId,
        officeID,
        vendorID,
        appVersion: appVersion || "ENT",
        version: version || "25.07",
        minorVersion: minorVersion || "1.00",
        callerInfo: callerInfo || "CalendarDetails",
        providerApiUrl,
      };
    } catch (_) {
      return null;
    }
  }

  // ─── Strategy 2: GM_fetch Calendar page HTML ─────────────────────────────

  private static async fetchFromCalendarPage(
    patientId: string
  ): Promise<CalendarApiParams> {
    const baseUrl = ApiParamProvider.getTenantBaseUrl();

    // 从当前页面 URL 获取 officeId
    const urlParams = new URLSearchParams(window.location.search);
    const officeId =
      urlParams.get("office") ||
      urlParams.get("OfficeID") ||
      (document.getElementById("hdnvendorID") as HTMLInputElement | null)
        ?.value ||
      "";

    const calendarUrl =
      `${baseUrl}/Patient/InternalPatientCalendarDetails_ns.aspx` +
      `?PatientID=${encodeURIComponent(patientId)}&dt=${Date.now()}` +
      (officeId ? `&office=${encodeURIComponent(officeId)}` : "");

    const r = (await GM_fetch(calendarUrl, { method: "GET" })) as Response & {
      rawBody: Blob;
    };
    const html = await r.rawBody.text();

    const getInput = (id: string): string => {
      const m = html.match(new RegExp(`id="${id}"[^>]*value="([^"]*)"`));
      return m ? m[1] : "";
    };

    const hhwsPath = getInput("hdnHHWSPath");
    const appSecret = getInput("hdnAppSecret");
    const userID = getInput("hdnUserID");
    const vendorID = getInput("hdnvendorID");
    const providerApiUrl = getInput("hdnProviderPatientAPIUrl");
    const appName = getInput("hdnAppName");
    const appVersion = getInput("hdnAppVersion");
    const version = getInput("hdnVersion");
    const minorVersion = getInput("hdnMinorVersion");
    const callerInfo = getInput("hdnCallerInfo");
    const officeIDFromPage = getInput("hdnOfficeID");

    if (!hhwsPath || !appSecret || !userID) {
      throw new Error(
        "[PatientCalendarApiProvider] Failed to extract required Calendar API params from HTML"
      );
    }

    return {
      hhwsPath,
      appName: appName || "HHAeXchange",
      appSecret,
      userID,
      patientID: patientId,
      officeID: officeIDFromPage || officeId,
      vendorID,
      appVersion: appVersion || "ENT",
      version: version || "25.07",
      minorVersion: minorVersion || "1.00",
      callerInfo: callerInfo || "CalendarDetails",
      providerApiUrl,
    };
  }
}
