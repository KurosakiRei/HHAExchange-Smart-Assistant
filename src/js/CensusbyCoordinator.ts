/**
 * Census by Coordinator Report - API 封装
 * 用于快速生成 HHAexchange Census by Coordinator 报表
 *
 * 使用 GM_xmlhttpRequest 进行跨域请求（Tampermonkey 环境）
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface CensusReportParams {
  /** Office IDs，逗号分隔 */
  officeIds?: string;
  /** Status IDs：-1=All, -2=All Selected, 1=Waiting, 3=Active, 4=Hospitalized, 5=Discharged, 8=Hold */
  statusIds?: string;
  /** Coordinator IDs：-1=All, -2=All Selected, -3=No Coordinator, 或具体 ID */
  coordinatorIds?: string;
  /** Patient Location IDs：-1=All, -2=All Selected, 0=No Location */
  patientLocationIds?: string;
  /** Patient Branch IDs：-1=All, -2=All Selected, 0=No Branch */
  patientBranchIds?: string;
  /** Patient Team IDs：-1=All, -2=All Selected, 0=No Team */
  patientTeamIds?: string;
  /** Contract IDs：-1=All, -2=All Selected */
  contractIds?: string;
  /** 是否只显示 Default Patient：0=否, 1=是 */
  isDefaultPatient?: string;
}

export interface Coordinator {
  ID: string;
  Text: string;
}

export interface PatientStatus {
  ID: string;
  Text: string;
}

export interface Contract {
  ID: string;
  Text: string;
}

export interface Location {
  ID: string;
  Text: string;
}

export interface Branch {
  ID: string;
  Text: string;
}

export interface Team {
  ID: string;
  Text: string;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  officeIds: string;
  version: string;
  minorVersion: string;
  appVersion: string;
}

// ============================================================================
// 常量 - 已知的 Coordinators ID 映射
// ============================================================================

export const KNOWN_COORDINATORS: Record<string, string> = {
  "No Coordinator": "-3",
  "Anna O. Russian Sup": "8058",
  "Aziza Yunuosova": "79747",
  Barno: "80700",
  "Daisy Wang": "22851",
  Default: "2778",
  "Eslana O. Sup.": "23279",
  "Grace (Chunyu) Shi": "25794",
  GulchekhraKhakimova: "80227",
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
  "Tao Yang": "75207",
  "Tracy V.": "23466",
  "Vicky Zhao": "78357",
  "Winnie Y.": "80380",
  "Yahaira Perez": "80978",
};

export const KNOWN_STATUSES: Record<string, string> = {
  All: "-1",
  "All Selected": "-2",
  Waiting: "1",
  Active: "3",
  Hospitalized: "4",
  Discharged: "5",
  Hold: "8",
};

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 从 Cookie 和页面信息中提取 Session 信息
 */
export function extractSessionInfo(): SessionInfo | null {
  // 从 cookie 获取 HHAX_Session
  const sessionMatch = document.cookie.match(/HHAX_Session=([^;]+)/);
  if (!sessionMatch) {
    console.error("未找到 HHAX_Session cookie");
    return null;
  }

  // 从 JWT token 获取 userId
  const tokenMatch = document.cookie.match(/HHAX_ENT_AccessToken=([^;]+)/);
  let userId = "";
  let officeIds = "";

  if (tokenMatch) {
    try {
      const payload = JSON.parse(atob(tokenMatch[1].split(".")[1]));
      userId = payload.uid || "";
      officeIds = payload.pid || "";
    } catch (e) {
      console.error("JWT 解析失败:", e);
    }
  }

  // 从 URL 获取 Version 信息
  const urlParams = new URLSearchParams(window.location.search);

  // 尝试从隐藏字段获取
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

  return {
    sessionId: sessionMatch[1],
    userId: hdnUserID || userId,
    officeIds: hdnOfficeID || officeIds,
    version: hdnVersion || urlParams.get("Version") || "25.07",
    minorVersion: hdnMinorVersion || urlParams.get("MinorVersion") || "1.00",
    appVersion: hdnAppVersion || urlParams.get("AppVersion") || "ENT",
  };
}

// ============================================================================
// GM_xmlhttpRequest 封装函数 (Tampermonkey API)
// ============================================================================

/**
 * 使用 GM_xmlhttpRequest 发送 POST 请求 (AjaxPro 格式)
 */
function gmPostAjaxPro(
  url: string,
  method: string,
  data: any
): Promise<string> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: url,
      headers: {
        "Content-Type": "text/plain; charset=UTF-8",
        "X-AjaxPro-Method": method,
      },
      data: JSON.stringify(data),
      onload: function (response: any) {
        try {
          // AjaxPro 返回格式: "value";/*
          let result = response.responseText;
          // 移除末尾的 ;/*
          if (result.endsWith(";/*")) {
            result = result.slice(0, -3);
          }
          // 移除引号
          result = result.replace(/^"|"$/g, "");
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
        "Content-Type": "application/json; charset=utf-8",
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
  params: CensusReportParams,
  sessionInfo: SessionInfo
): string {
  const {
    officeIds = sessionInfo.officeIds,
    statusIds = "-1",
    coordinatorIds = "-1",
    patientLocationIds = "-1",
    patientBranchIds = "-1",
    patientTeamIds = "-1",
    contractIds = "-1",
    isDefaultPatient = "0",
  } = params;

  return (
    ` <Params> ` +
    `<Param StatusIDs="${statusIds}"/>` +
    `<Param OfficeIDs="${officeIds}"/>` +
    `<Param CoordinatorIDs="${coordinatorIds}"/>` +
    `<Param PatientLocationIDs="${patientLocationIds}"/>` +
    `<Param PatientBranchIDs="${patientBranchIds}"/>` +
    `<Param PatientTeamIDs="${patientTeamIds}"/>` +
    `<Param ContractIDs="${contractIds}"/>` +
    `<Param IsDefaultPatient="${isDefaultPatient}"/>` +
    `<Param Version="${sessionInfo.version}"/>` +
    `<Param MinorVersion="${sessionInfo.minorVersion}"/>` +
    `<Param AppVersion="${sessionInfo.appVersion}"/>` +
    ` </Params>`
  );
}

/**
 * 直接调用 BindData API 生成报表
 * 返回 UserDataXML GUID
 */
export async function callBindDataAPI(
  params: CensusReportParams
): Promise<string | null> {
  const sessionInfo = extractSessionInfo();
  if (!sessionInfo) {
    console.error("无法获取 Session 信息");
    return null;
  }

  const xmlParams = buildReportXML(params, sessionInfo);

  try {
    const result = await gmPostAjaxPro(
      "https://reports.hhaexchange.com/HHAReportsML/ajaxpro/Reports_CensusbyCoordinator,HHAExchangeUI.ashx",
      "BindData",
      { UserDataXML: xmlParams }
    );
    return result; // 返回 UserDataXML GUID
  } catch (e) {
    console.error("API 调用失败:", e);
    return null;
  }
}

/**
 * 生成报表并返回报表 URL
 */
export async function generateReportURL(
  params: CensusReportParams
): Promise<string | null> {
  const reportGuid = await callBindDataAPI(params);
  if (!reportGuid) {
    return null;
  }

  return (
    `https://reports.hhaexchange.com/HHAReportsML/Reports/Reports.aspx` +
    `?UserDataXML=${reportGuid}` +
    `&ReportName=Census%20by%20Coordinator` +
    `&ReportTitle=Census%20by%20Coordinator`
  );
}

/**
 * 生成报表并在新窗口打开
 */
export async function generateAndOpenReport(
  params: CensusReportParams
): Promise<void> {
  const url = await generateReportURL(params);
  if (url) {
    window.open(
      url,
      "_blank",
      "width=1000,height=700,menu=false,scrollbars=yes,resizable=true,top=3,left=3"
    );
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
        `?MethodName=GetCoordinatorforOffice_WithNoCoordinator` +
        `&UserID=${sessionInfo.userId}` +
        `&OfficeIDs=${sessionInfo.officeIds}` +
        `&Version=${sessionInfo.version}` +
        `&MinorVersion=${sessionInfo.minorVersion}` +
        `&AppVersion=${sessionInfo.appVersion}`
    );
  } catch (e) {
    console.error("获取 Coordinators 失败:", e);
    return [];
  }
}

/**
 * 获取 Patient Status 列表
 */
export async function fetchPatientStatuses(): Promise<PatientStatus[]> {
  const sessionInfo = extractSessionInfo();
  if (!sessionInfo) {
    return [];
  }

  try {
    return await gmGet(
      `https://reports.hhaexchange.com/HHAReportsML/Handler/Contracts.ashx/BindContract` +
        `?MethodName=GetPatientStatus` +
        `&UserID=${sessionInfo.userId}`
    );
  } catch (e) {
    console.error("获取 Patient Statuses 失败:", e);
    return [];
  }
}

/**
 * 获取 Contracts 列表
 */
export async function fetchContracts(): Promise<Contract[]> {
  const sessionInfo = extractSessionInfo();
  if (!sessionInfo) {
    return [];
  }

  try {
    return await gmGet(
      `https://reports.hhaexchange.com/HHAReportsML/Handler/Contracts.ashx/BindContract` +
        `?MethodName=GetContractsByOffice` +
        `&UserID=${sessionInfo.userId}` +
        `&OfficeIDs=${sessionInfo.officeIds}` +
        `&Version=${sessionInfo.version}` +
        `&MinorVersion=${sessionInfo.minorVersion}` +
        `&AppVersion=${sessionInfo.appVersion}`
    );
  } catch (e) {
    console.error("获取 Contracts 失败:", e);
    return [];
  }
}

/**
 * 获取 Patient Locations 列表
 */
export async function fetchLocations(): Promise<Location[]> {
  const sessionInfo = extractSessionInfo();
  if (!sessionInfo) {
    return [];
  }

  try {
    return await gmGet(
      `https://reports.hhaexchange.com/HHAReportsML/Handler/Contracts.ashx/BindContract` +
        `?MethodName=GetLocationByOffice_WithNoLocation` +
        `&UserID=${sessionInfo.userId}` +
        `&OfficeIDs=${sessionInfo.officeIds}` +
        `&Version=${sessionInfo.version}` +
        `&MinorVersion=${sessionInfo.minorVersion}` +
        `&AppVersion=${sessionInfo.appVersion}`
    );
  } catch (e) {
    console.error("获取 Locations 失败:", e);
    return [];
  }
}

/**
 * 获取 Patient Branches 列表
 */
export async function fetchBranches(): Promise<Branch[]> {
  const sessionInfo = extractSessionInfo();
  if (!sessionInfo) {
    return [];
  }

  try {
    return await gmGet(
      `https://reports.hhaexchange.com/HHAReportsML/Handler/Contracts.ashx/BindContract` +
        `?MethodName=GetBranchDetailsByofficexML_WithNoBranch` +
        `&UserID=${sessionInfo.userId}` +
        `&OfficeIDs=${sessionInfo.officeIds}` +
        `&Version=${sessionInfo.version}` +
        `&MinorVersion=${sessionInfo.minorVersion}` +
        `&AppVersion=${sessionInfo.appVersion}`
    );
  } catch (e) {
    console.error("获取 Branches 失败:", e);
    return [];
  }
}

/**
 * 获取 Patient Teams 列表
 */
export async function fetchTeams(): Promise<Team[]> {
  const sessionInfo = extractSessionInfo();
  if (!sessionInfo) {
    return [];
  }

  try {
    return await gmGet(
      `https://reports.hhaexchange.com/HHAReportsML/Handler/Contracts.ashx/BindContract` +
        `?MethodName=GetTeamByOffice_WithNoTeam` +
        `&UserID=${sessionInfo.userId}` +
        `&OfficeIDs=${sessionInfo.officeIds}` +
        `&Version=${sessionInfo.version}` +
        `&MinorVersion=${sessionInfo.minorVersion}` +
        `&AppVersion=${sessionInfo.appVersion}`
    );
  } catch (e) {
    console.error("获取 Teams 失败:", e);
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
  fetchPatientStatuses,
  fetchContracts,
  fetchLocations,
  fetchBranches,
  fetchTeams,
  extractSessionInfo,
  KNOWN_COORDINATORS,
  KNOWN_STATUSES,
};
