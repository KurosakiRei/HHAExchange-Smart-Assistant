/**
 * HHAexchange Patient General Notes Report API
 *
 * 这个模块提供了与 HHAexchange Patient General Notes Report 页面交互的工具函数
 * 可以在 Tampermonkey 脚本中使用，或者集成到现有的扩展中
 *
 * @author HHA Smart Assistant
 * @date 2025-12-31
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface ReportParams {
  officeIds?: string; // Office IDs，逗号分隔，默认全部
  fromDate: string; // 开始日期 MM/DD/YYYY
  toDate: string; // 结束日期 MM/DD/YYYY
  coordinatorId?: string; // Coordinator ID，-1 表示全部
  reasonId?: string; // Note Reason ID，-1 表示全部
  statusId?: string; // Status ID，-1 表示全部
  chhaId?: string; // CHHA ID，-1 表示全部
  patientId?: string; // Patient ID，-1 表示全部
  priority?: string; // Priority，-1 表示全部
}

export interface Coordinator {
  ID: string;
  Text: string;
}

export interface NoteReason {
  ID: string;
  Text: string;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  appSecret: string;
  officeIds: string;
  version: string;
  minorVersion: string;
}

// ============================================================================
// 常量定义 - 已知的 ID 映射
// ============================================================================

export const KNOWN_COORDINATORS: Record<string, string> = {
  "Tao Yang": "75207",
  "Anna O. Russian Sup": "8058",
  "Aziza Yunuosova": "79747",
  Barno: "80700",
  "Daisy Wang": "22851",
  "Eslana O. Sup.": "23279",
  "Grace (Chunyu) Shi": "25794",
  "Gulchekhra Khakimova": "80227",
  "Gulnaz K.": "75765",
  "Hanin Aldaeif": "44912",
  "Irina G.": "79400",
  "Ivy Ko": "81264",
  "Jay He": "80123",
  "Jennifer Rivera": "81314",
  "Lolita K.": "69419",
  "Lucia (LuMing) Yu": "10492",
  "Lutfiya Mamadova": "80216",
  "Madina R.": "78899",
  "Mahira Rahman": "66394",
  "Mona He": "81406",
  "Nodira A. Sup.": "7530",
  "Ruth Queriga Sup.": "71296",
  "Tracy V.": "23466",
  "Vicky Zhao": "78357",
  "Winnie Y.": "80380",
  "Yahaira Perez BX.": "80978",
};

export const KNOWN_NOTE_REASONS: Record<string, string> = {
  "Quality Assurance": "2289535",
  // 更多 Reasons 需要从实际 API 获取后添加
};

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 格式化日期为 MM/DD/YYYY 格式
 */
export function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * 获取今天的日期字符串
 */
export function getToday(): string {
  return formatDate(new Date());
}

/**
 * 获取 N 年前的日期字符串
 */
export function getYearsAgo(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return formatDate(date);
}

/**
 * 获取 N 个月前的日期字符串
 */
export function getMonthsAgo(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return formatDate(date);
}

/**
 * 从 URL 中提取 Session 信息
 */
export function extractSessionInfo(): SessionInfo | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("s") || "";

    // 尝试从 cookie 中获取更多信息
    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    // 解析 JWT token 获取用户信息
    const accessToken = cookies["HHAX_ENT_AccessToken"];
    let userId = "";
    let appSecret = "";
    let officeId = "";

    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        userId = payload.uid || "";
        appSecret = payload.as || "";
        officeId = payload.pid || "";
      } catch (e) {
        console.warn("Failed to parse access token:", e);
      }
    }

    return {
      sessionId,
      userId,
      appSecret,
      officeIds: officeId,
      version: urlParams.get("Version") || "25.07",
      minorVersion: urlParams.get("MinorVersion") || "1.00",
    };
  } catch (e) {
    console.error("Failed to extract session info:", e);
    return null;
  }
}

// ============================================================================
// GM_xmlhttpRequest 封装函数 (Tampermonkey API)
// ============================================================================

/**
 * 使用 GM_xmlhttpRequest 发送 POST 请求
 */
function gmPost(url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: url,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
      },
      data: JSON.stringify(data),
      onload: function (response: any) {
        try {
          const result = JSON.parse(response.responseText);
          resolve(result);
        } catch (e) {
          reject(
            new Error("Failed to parse response: " + (e as Error).message)
          );
        }
      },
      onerror: function (error: any) {
        reject(error);
      },
    });
  });
}

/**
 * 使用 GM_xmlhttpRequest 发送 GET 请求
 */
function gmGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      onload: function (response: any) {
        try {
          const result = JSON.parse(response.responseText);
          resolve(result);
        } catch (e) {
          reject(
            new Error("Failed to parse response: " + (e as Error).message)
          );
        }
      },
      onerror: function (error: any) {
        reject(error);
      },
    });
  });
}

// ============================================================================
// 主要 API 函数
// ============================================================================

/**
 * 构建报表参数 XML
 */
export function buildReportXML(
  params: ReportParams,
  sessionInfo: SessionInfo
): string {
  const {
    officeIds = sessionInfo.officeIds,
    fromDate,
    toDate,
    coordinatorId = "-1",
    reasonId = "-1",
    statusId = "-1",
    chhaId = "-1",
    patientId = "-1",
    priority = "-1",
  } = params;

  return (
    `<Params>` +
    `<Param OfficeIDs="${officeIds}"/>` +
    `<Param FromDate="${fromDate}"/>` +
    `<Param ToDate="${toDate}"/>` +
    `<Param StatusID="${statusId}"/>` +
    `<Param ReasonID="${reasonId}"/>` +
    `<Param ChhaID="${chhaId}"/>` +
    `<Param PatientID="${patientId}"/>` +
    `<Param CoordinatorID="${coordinatorId}"/>` +
    `<Param Priority="${priority}"/>` +
    `<Param IsCallFromPatientProfile="0"/>` +
    `<Param CallerInfo="SSRS"/>` +
    `<Param AppVersion="ENT"/>` +
    `<Param Version="${sessionInfo.version}"/>` +
    `<Param MinorVersion="${sessionInfo.minorVersion}"/>` +
    `</Params>`
  );
}

/**
 * 直接调用 BindData API 生成报表
 */
export async function callBindDataAPI(
  params: ReportParams
): Promise<string | null> {
  const sessionInfo = extractSessionInfo();
  if (!sessionInfo) {
    console.error("无法获取 Session 信息");
    return null;
  }

  const xmlParams = buildReportXML(params, sessionInfo);

  try {
    const result = await gmPost(
      "https://reports.hhaexchange.com/HHAReportsML/Reports/PatientGeneralNotesRpt.aspx/BindData",
      { UserDataXML: xmlParams }
    );
    return result.d; // 返回 UserDataXML GUID
  } catch (e) {
    console.error("API 调用失败:", e);
    return null;
  }
}

/**
 * 生成报表并返回报表 URL
 */
export async function generateReportURL(
  params: ReportParams
): Promise<string | null> {
  const reportGuid = await callBindDataAPI(params);
  if (!reportGuid) {
    return null;
  }

  const sessionInfo = extractSessionInfo();
  if (!sessionInfo) {
    return null;
  }

  return (
    `https://reports.hhaexchange.com/HHAReportsML/Reports/Reports.aspx` +
    `?UserDataXML=${reportGuid}` +
    `&ReportName=Patient%20General%20Notes` +
    `&ReportTitle=Patient%20General%20Notes` +
    `&s=${sessionInfo.sessionId}` +
    `&Version=${sessionInfo.version}` +
    `&MinorVersion=${sessionInfo.minorVersion}` +
    `&AppVersion=ENT`
  );
}

/**
 * 生成报表并在新窗口打开
 */
export async function generateAndOpenReport(
  params: ReportParams
): Promise<void> {
  const url = await generateReportURL(params);
  if (url) {
    window.open(url, "_blank");
  } else {
    console.error("报表生成失败");
  }
}

// ============================================================================
// 数据获取函数
// ============================================================================

/**
 * 获取 Coordinators 列表
 */
export async function fetchCoordinators(): Promise<Coordinator[]> {
  const sessionInfo = extractSessionInfo();
  if (!sessionInfo) {
    return [];
  }

  try {
    return await gmGet(
      `https://reports.hhaexchange.com/HHAReportsML/Handler/Contracts.ashx/BindContract` +
        `?MethodName=GetCoordinatorByOffice` +
        `&UserID=${sessionInfo.userId}` +
        `&OfficeIDs=${sessionInfo.officeIds}` +
        `&Version=${sessionInfo.version}` +
        `&MinorVersion=${sessionInfo.minorVersion}` +
        `&AppVersion=ENT`
    );
  } catch (e) {
    console.error("获取 Coordinators 失败:", e);
    return [];
  }
}

/**
 * 获取 Note Reasons 列表
 */
export async function fetchNoteReasons(): Promise<NoteReason[]> {
  const sessionInfo = extractSessionInfo();
  if (!sessionInfo) {
    return [];
  }

  try {
    return await gmGet(
      `https://reports.hhaexchange.com/HHAReportsML/Handler/Contracts.ashx/BindContract` +
        `?MethodName=GetPatientGeneralNoteReasons_All` +
        `&UserID=${sessionInfo.userId}` +
        `&ReasonType=16` +
        `&Version=${sessionInfo.version}` +
        `&MinorVersion=${sessionInfo.minorVersion}` +
        `&AppVersion=ENT`
    );
  } catch (e) {
    console.error("获取 Note Reasons 失败:", e);
    return [];
  }
}

// ============================================================================
// 导出
// ============================================================================

export default {
  buildReportXML,
  callBindDataAPI,
  generateReportURL,
  generateAndOpenReport,
  fetchCoordinators,
  fetchNoteReasons,
  formatDate,
  getToday,
  getYearsAgo,
  getMonthsAgo,
  extractSessionInfo,
  KNOWN_COORDINATORS,
  KNOWN_NOTE_REASONS,
};
