import GM_fetch from "@trim21/gm-fetch";

const FALLBACK_TENANT_BASE_URL = "https://app.hhaexchange.com/ENT2603010000";
const TENANT_CACHE_KEY = "hha_smart_assistant_tenant_base_url";
let hasWarnedTenantFallback = false;

// ==================== 动态 Tenant URL 检测 ====================

export interface TenantBaseUrlResolution {
  baseUrl: string | null;
  source: "detected" | "cache" | "fallback" | "missing";
  message?: string;
}

function isOutlookLikeHost(): boolean {
  const host = window.location.hostname.toLowerCase();
  return (
    host === "outlook.office.com" ||
    host === "outlook.cloud.microsoft" ||
    host === "webshell.suite.office.com"
  );
}

function isHhaHost(): boolean {
  return window.location.hostname.toLowerCase().endsWith("hhaexchange.com");
}

function extractTenantVersion(url: string): string | null {
  const m1 = url.match(/\/ENT(\d+)\//);
  if (m1) return m1[1];
  const m2 = url.match(/\/(?:HHANotification|ENTP)(\d+)\//);
  if (m2) return m2[1];
  return null;
}

function detectTenantBaseUrlStrict(): string | null {
  const pathnameVersion = extractTenantVersion(window.location.pathname);
  if (pathnameVersion) {
    return `https://app.hhaexchange.com/ENT${pathnameVersion}`;
  }

  for (const script of Array.from(document.scripts)) {
    if (!script.src) {
      continue;
    }
    const scriptVersion = extractTenantVersion(script.src);
    if (scriptVersion) {
      return `https://app.hhaexchange.com/ENT${scriptVersion}`;
    }
  }

  const hrefVersion = extractTenantVersion(window.location.href);
  if (hrefVersion) {
    return `https://app.hhaexchange.com/ENT${hrefVersion}`;
  }

  try {
    if (window.parent !== window) {
      const parentVersion = extractTenantVersion(window.parent.location.href);
      if (parentVersion) {
        return `https://app.hhaexchange.com/ENT${parentVersion}`;
      }
    }
  } catch (_) {
    /* 跨域父窗口，跳过 */
  }

  return null;
}

function saveTenantBaseUrlToCache(baseUrl: string): void {
  if (!baseUrl) {
    return;
  }

  try {
    GM_setValue(TENANT_CACHE_KEY, baseUrl);
  } catch (_) {
    /* ignore */
  }

  try {
    localStorage.setItem(TENANT_CACHE_KEY, baseUrl);
  } catch (_) {
    /* ignore */
  }
}

function readTenantBaseUrlFromCache(): string | null {
  try {
    const fromGM = GM_getValue<string>(TENANT_CACHE_KEY, "");
    if (
      typeof fromGM === "string" &&
      fromGM.startsWith("https://app.hhaexchange.com/ENT")
    ) {
      return fromGM;
    }
  } catch (_) {
    /* ignore */
  }

  try {
    const fromStorage = localStorage.getItem(TENANT_CACHE_KEY);
    if (
      fromStorage &&
      fromStorage.startsWith("https://app.hhaexchange.com/ENT")
    ) {
      return fromStorage;
    }
  } catch (_) {
    /* ignore */
  }

  return null;
}

function getDefaultMissingMessage(): string {
  if (isOutlookLikeHost()) {
    return "Quick Search 无法确定租户。请先打开一次 HHA 页面以同步租户信息。";
  }
  return "无法自动解析当前租户，请确认页面已完成加载。";
}

/**
 * 优先租户策略：当前环境解析 -> 租户缓存 ->（可选）fallback。
 */
export function getPreferredTenantBaseUrl(options?: {
  allowFallback?: boolean;
}): TenantBaseUrlResolution {
  const allowFallback = options?.allowFallback === true;

  const detected = detectTenantBaseUrlStrict();
  if (detected) {
    if (isHhaHost()) {
      saveTenantBaseUrlToCache(detected);
    }
    return {
      baseUrl: detected,
      source: "detected",
    };
  }

  const cached = readTenantBaseUrlFromCache();
  if (cached) {
    return {
      baseUrl: cached,
      source: "cache",
      message: isOutlookLikeHost()
        ? "当前在 Outlook 环境，Quick Search 使用缓存租户。"
        : undefined,
    };
  }

  if (allowFallback) {
    if (!hasWarnedTenantFallback) {
      hasWarnedTenantFallback = true;
      console.warn(
        "[HhaSearchService] Could not detect tenant prefix from URL and cache; using fallback"
      );
    }
    return {
      baseUrl: FALLBACK_TENANT_BASE_URL,
      source: "fallback",
      message: "未检测到租户信息，已使用默认租户。",
    };
  }

  return {
    baseUrl: null,
    source: "missing",
    message: getDefaultMissingMessage(),
  };
}

export function getQuickSearchTenantState(): TenantBaseUrlResolution {
  return getPreferredTenantBaseUrl({ allowFallback: !isOutlookLikeHost() });
}

function getTenantBaseUrlForSearchOrThrow(): string {
  const allowFallback = !isOutlookLikeHost();
  const resolution = getPreferredTenantBaseUrl({ allowFallback });
  if (resolution.baseUrl) {
    return resolution.baseUrl;
  }
  throw new Error(resolution.message || "Quick Search 无法确定租户信息");
}

function buildProfileUrlTemplate(type: "aide" | "patient"): string {
  const baseUrl =
    getPreferredTenantBaseUrl({ allowFallback: true }).baseUrl ||
    FALLBACK_TENANT_BASE_URL;
  if (type === "aide") {
    return `${baseUrl}/Aide/Aide_ns.aspx?AideId={ID}`;
  }
  return `${baseUrl}/Patient/InternalPatientInfo_ns.aspx?PatientId={ID}`;
}

/**
 * 动态检测当前 HHAExchange 租户路径前缀
 * 支持所有已知 URL 格式：ENT / HHANotification / ENTP
 * 并在同源 iframe 中尝试从父窗口推导，避免版本升级触发强制登出
 */
export function detectTenantBaseUrl(): string {
  return (
    getPreferredTenantBaseUrl({ allowFallback: true }).baseUrl ||
    FALLBACK_TENANT_BASE_URL
  );
}

// ==================== URL 常量 ====================

const _TENANT_BASE_URL = detectTenantBaseUrl();

/** Aide (护工) 搜索 URL - 使用动态租户前缀 */
export const AIDE_SEARCH_URL: string = `${_TENANT_BASE_URL}/Aide/AideSearchXSLT_ns.aspx?FirstName=&Phone=`;
export const AIDE_SEARCH_PARAMS: string =
  "&LastName=&Type=-1&Discipline=-1&CaregiverCode=&ALtCaregiverCode=&Status=-1&SSN=&CaregiverTeamID=-1&FromVisitEdit=0&CaregiverLocationID=-1&CaregiverBranchID=-1&VisitDate=&office=469,5137,5139,6475,14849&DOB=&pg=1&sort=&ord=ASC&FromPage=";
export const AIDE_PROFILE_URL_TEMPLATE: string =
  buildProfileUrlTemplate("aide");

/** Patient (病人) 搜索 URL - 使用动态租户前缀 */
export const PATIENT_SEARCH_URL: string = `${_TENANT_BASE_URL}/Patient/PatientSearchXSLT_ns.aspx?FirstName=&LastName=&StatusID=-1&PatientID=&MRNumber=&CoordinatorId=-1&Source=-1&PatientNumber=&HomePhone=`;
export const PATIENT_SEARCH_PARAMS: string =
  "&AltPatientID=&TeamID=-1&LocationID=-1&BranchID=-1&DisciplineID=0&Default=false&pg=1&sort=&ord=ASC&OfficeIds=469,5137,5139,6475,14849&MedicaidID=";
export const PATIENT_PROFILE_URL_TEMPLATE: string =
  buildProfileUrlTemplate("patient");

// ==================== 类型定义 ====================

/**
 * 搜索结果的标准接口
 */
export interface HhaSearchResult {
  count: number;
  activeCount?: number;
  finalUrl?: string;
  searchUrl?: string;
  rawHtml: string;
}

/**
 * 快速搜索参数接口，供 QuickSearchTab 使用
 */
export interface HhaQuickSearchParams {
  lastName?: string;
  firstName?: string;
  phone?: string;
  id?: string;
  ssn?: string; // Caregiver 独占
  patientId?: string; // Patient 独占
  medicaidId?: string; // Patient 独占
}

/**
 * Patient 状态分类
 */
export type PatientActiveStatus = "Active" | "Hospitalized";
export type PatientNonActiveStatus = "Discharged" | "Hold" | "Waiting";

/** Active 状态列表 */
export const ACTIVE_STATUSES: readonly PatientActiveStatus[] = [
  "Active",
  "Hospitalized",
] as const;

/** Non-Active 状态列表 */
export const NON_ACTIVE_STATUSES: readonly PatientNonActiveStatus[] = [
  "Discharged",
  "Hold",
  "Waiting",
] as const;

// ==================== 工具函数 ====================

/**
 * 判断给定的状态是否为 Active 状态
 */
export function isActiveStatus(status: string): boolean {
  return ACTIVE_STATUSES.some(
    (activeStatus) => status.toLowerCase() === activeStatus.toLowerCase()
  );
}

/**
 * 格式化电话号码为 HHAeXchange 接受的格式 (e.g., 917-415-2489)
 */
export function formatPhoneNumber(rawNumber: string | null): string | null {
  if (!rawNumber) return null;
  const digits = rawNumber.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `${digits.substring(1, 4)}-${digits.substring(
      4,
      7
    )}-${digits.substring(7)}`;
  } else if (digits.length === 10) {
    return `${digits.substring(0, 3)}-${digits.substring(
      3,
      6
    )}-${digits.substring(6)}`;
  }
  return null;
}

/**
 * 以弹窗形式打开一个URL或HTML内容
 */
export function openInPopup(
  urlOrHtml: string,
  _windowName: string = "HHA_Search_Result",
  isHtml: boolean = false
): void {
  const windowFeatures: string =
    "width=1200,height=900,resizable=yes,scrollbars=yes,status=yes";
  // Always use a unique name so each search opens a fresh window
  const uniqueName = `HHA_Search_${Date.now()}`;

  if (isHtml) {
    const blob = new Blob([urlOrHtml], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const popup = window.open(blobUrl, uniqueName, windowFeatures);

    if (popup) {
      popup.addEventListener("load", () => {
        URL.revokeObjectURL(blobUrl);
      });
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } else {
      URL.revokeObjectURL(blobUrl);
      console.warn("弹窗被浏览器阻止，请允许弹窗后重试");
    }
  } else {
    window.open(urlOrHtml, uniqueName, windowFeatures);
  }
}

// ==================== HTML 处理工具 ====================

/**
 * HHA 风格的 CSS 样式
 */
export const HHA_STYLE_CSS = `
<style>
  /* 基础样式重置 */
  body {
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    background-color: #fff;
    margin: 0;
    padding: 10px;
  }

  /* 隐藏不需要的链接和元素 */
  a[href*="uxfrmSearchXSLT"],
  a[id*="uxfrmSearchXSLT"],
  a#uxfrmSearchXSLT,
  form[id*="uxfrmSearch"],
  [id="uxfrmSearchXSLT"],
  a[href*="LastName"][href*="FirstName"] {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    width: 0 !important;
    overflow: hidden !important;
    position: absolute !important;
    left: -9999px !important;
  }

  /* 分页列表友好显示 */
  ul:has(li a[href*="Page"]),
  ul:has(li:first-child a[href*="First"]),
  ul:has(li > a) {
    list-style: none !important;
    padding: 5px 10px !important;
    margin: 10px 0 !important;
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
    align-items: center !important;
    background-color: #f5f5f5 !important;
    border-radius: 4px !important;
  }

  ul:has(li a[href*="Page"]) li,
  ul:has(li:first-child a[href*="First"]) li,
  ul:has(li > a) li {
    display: inline !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  ul:has(li a[href*="Page"]) li::before,
  ul:has(li:first-child a[href*="First"]) li::before,
  ul:has(li > a) li::before {
    content: none !important;
  }

  ul:has(li a[href*="Page"]) li a,
  ul:has(li:first-child a[href*="First"]) li a {
    color: #0066cc !important;
    text-decoration: none !important;
    padding: 4px 8px !important;
    border: 1px solid #ddd !important;
    border-radius: 3px !important;
    background-color: #fff !important;
    transition: background-color 0.2s !important;
  }

  ul:has(li a[href*="Page"]) li a:hover,
  ul:has(li:first-child a[href*="First"]) li a:hover {
    background-color: #e6f2ff !important;
  }

  /* 通用分页 UL 样式 - 作为后备 */
  body ul {
    list-style-type: none;
  }

  /* 表格基础样式 */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    background-color: #fff;
  }

  /* 表头样式 - HHA 深蓝色风格 */
  table thead tr,
  table tr.header,
  table tr:first-child:has(th),
  table tr:has(a[href*="sortable"]) {
    background-color: #0d3e61 !important;
    color: #fff !important;
  }

  table th,
  table thead td,
  table tr.header td,
  table tr:has(a[href*="sortable"]) td {
    background-color: #0d3e61 !important;
    color: #fff !important;
    padding: 10px 8px;
    text-align: left;
    font-weight: 600;
    border: 1px solid #0a2d47;
    white-space: nowrap;
  }

  table th a,
  table thead td a,
  table tr.header td a,
  table tr:has(a[href*="sortable"]) td a {
    color: #fff !important;
    text-decoration: none;
  }

  table th a:hover,
  table thead td a:hover {
    text-decoration: underline;
  }

  /* 表格数据行样式 */
  table tbody tr,
  table tr:not(:first-child):not(.header):not(:has(a[href*="sortable"])) {
    background-color: #fff;
  }

  table tbody tr:nth-child(even),
  table tr:nth-child(even):not(:first-child):not(.header):not(:has(a[href*="sortable"])) {
    background-color: #f8f9fa;
  }

  table tbody tr:hover,
  table tr:hover:not(:first-child):not(.header):not(:has(a[href*="sortable"])) {
    background-color: #e9ecef;
  }

  table td {
    padding: 8px;
    border: 1px solid #dee2e6;
    vertical-align: middle;
  }

  /* 链接样式 */
  a {
    color: #0d6efd;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
    color: #0a58ca;
  }

  /* 可点击的名字链接 */
  a[href*="javascript:"] {
    color: #0d6efd;
    cursor: pointer;
    font-weight: 500;
  }

  a[href*="javascript:"]:hover {
    text-decoration: underline;
  }

  /* Active 状态标签样式 */
  td:has(> span:contains("Active")),
  td:contains("Active") {
    color: #198754;
  }

  /* 手动匹配 Active 状态 - 使用边框 */
  span.status-active,
  .status-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  /* 分页样式 */
  .pagination,
  ul:has(li:contains("Page")),
  div:has(> a:contains("Next")),
  div:has(> a:contains("Previous")) {
    margin: 10px 0;
    padding: 10px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #666;
  }

  /* 搜索结果标题 */
  h2, h3 {
    color: #0d3e61;
    margin: 15px 0 10px 0;
    font-size: 16px;
    font-weight: 600;
  }

  /* 隐藏空的或不需要的行 */
  tr:empty,
  td:empty:only-child {
    display: none;
  }

  /* 电话号码高亮保持 */
  span[style*="background-color: #ffff00"] {
    background-color: #ffff00 !important;
    padding: 1px 3px !important;
    border-radius: 2px !important;
    font-weight: bold !important;
  }

  /* 修复表格内的文字换行 */
  td {
    word-break: break-word;
  }

  /* 响应式调整 */
  @media (max-width: 1200px) {
    table {
      font-size: 13px;
    }
    table th, table td {
      padding: 6px;
    }
  }
</style>
`;

/**
 * 在 HTML 中注入 HHA 风格的 CSS 样式
 */
export function injectHhaStyles(html: string): string {
  if (html.includes("</head>")) {
    return html.replace("</head>", HHA_STYLE_CSS + "</head>");
  } else if (html.includes("<body")) {
    return html.replace("<body", HHA_STYLE_CSS + "<body");
  } else {
    return HHA_STYLE_CSS + html;
  }
}

/**
 * 清理 HTML 中的无用元素
 */
export function cleanupHtml(html: string): string {
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<script\b[^>]*\/>/gi, "");
  html = html.replace(/(\s+on\w+\s*=\s*"[^"]*")/gi, "");
  html = html.replace(/(\s+on\w+\s*=\s*'[^']*')/gi, "");
  html = html.replace(
    /<a[^>]*id\s*=\s*["']?uxfrmSearchXSLT["']?[^>]*>[\s\S]*?<\/a>/gi,
    ""
  );
  html = html.replace(
    /<a[^>]*href\s*=\s*["'][^"']*uxfrmSearchXSLT[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,
    ""
  );
  html = html.replace(
    /<form[^>]*id\s*=\s*["']?uxfrmSearch[^"']*["']?[^>]*>/gi,
    ""
  );
  html = html.replace(/<\/form>/gi, "");
  html = html.replace(/<a[^>]*>[^<]*(&amp;|&)LastName=[^<]*<\/a>/gi, "");
  return html;
}

/**
 * 在 HTML 中高亮指定的电话号码
 */
export function highlightPhoneNumber(
  html: string,
  phoneNumber: string
): string {
  if (!phoneNumber) return html;

  const digits = phoneNumber.replace(/\D/g, "");
  const formats = [
    phoneNumber,
    digits,
    `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`,
    `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`,
    `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`,
  ];

  const escapedFormats = formats.map((f) =>
    f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const pattern = new RegExp(`(${escapedFormats.join("|")})`, "g");

  return html.replace(
    pattern,
    '<span style="background-color: #ffff00; padding: 1px 3px; border-radius: 2px; font-weight: bold;">$1</span>'
  );
}

/**
 * 为 HTML 注入重定向脚本
 */
export function injectRedirectScript(
  html: string,
  type: "aide" | "patient"
): string {
  const aideTemplate = buildProfileUrlTemplate("aide");
  const patientTemplate = buildProfileUrlTemplate("patient");
  const profileUrlTemplate = type === "aide" ? aideTemplate : patientTemplate;
  const functionName =
    type === "aide" ? "RedirectToAidePage" : "RedirectToPatientPage";

  const script = `
<script>
function ${functionName}(id) {
  window.open('${profileUrlTemplate}'.replace('{ID}', id), '_blank');
}
function RedirectToAidePage(id) {
  window.open('${aideTemplate}'.replace('{ID}', id), '_blank');
}
function RedirectToPatientPage(id) {
  window.open('${patientTemplate}'.replace('{ID}', id), '_blank');
}
</script>
`;

  if (html.includes("</head>")) {
    return html.replace("</head>", script + "</head>");
  } else if (html.includes("</body>")) {
    return html.replace("</body>", script + "</body>");
  } else {
    return html + script;
  }
}

// ==================== 结果解析 ====================

/**
 * 解析 Aide (护工) 的搜索结果
 */
export function handleAideSearchResult(html: string): HhaSearchResult {
  const profileTemplate = buildProfileUrlTemplate("aide");
  const doc = new DOMParser().parseFromString(html, "text/html");
  const resultsTable = doc.querySelector<HTMLTableElement>("#tdSearchResults");
  if (!resultsTable) return { count: 0, rawHtml: html };

  let resultCount: number = -1;
  const heading = doc.querySelector<HTMLHeadingElement>(
    'h2[aria-describedby="tdSearchResults"]'
  );
  if (heading) {
    const match = heading.textContent?.match(/\((\d+)\)/);
    if (match && match[1]) resultCount = parseInt(match[1], 10);
  }
  if (resultCount === -1) {
    resultCount = resultsTable.querySelectorAll("tbody tr").length;
  }

  if (resultCount === 1) {
    const row = resultsTable.querySelector("tbody tr");
    const link = row?.querySelector<HTMLAnchorElement>(
      'a[onclick*="RedirectToAidePage"]'
    );
    const match = link
      ?.getAttribute("onclick")
      ?.match(/RedirectToAidePage\((\d+)\)/);
    if (match && match[1]) {
      return {
        count: 1,
        finalUrl: profileTemplate.replace("{ID}", match[1]),
        rawHtml: html,
      };
    }
  }
  return { count: resultCount, rawHtml: html };
}

/**
 * 解析 Patient (病人) 的搜索结果
 */
export function handlePatientSearchResult(html: string): HhaSearchResult {
  const profileTemplate = buildProfileUrlTemplate("patient");
  const doc = new DOMParser().parseFromString(html, "text/html");
  const resultsTable = doc.querySelector<HTMLTableElement>("#tdSearchResults");

  if (!resultsTable) {
    return { count: 0, activeCount: 0, rawHtml: html };
  }

  let resultCount: number = -1;
  const heading = doc.querySelector<HTMLHeadingElement>("h2");
  if (heading) {
    const match = heading.textContent?.match(/\((\d+)\)/);
    if (match && match[1]) resultCount = parseInt(match[1], 10);
  }

  const resultRows = resultsTable.querySelectorAll("tbody tr");
  if (resultCount === -1) {
    resultCount = resultRows.length;
  }

  if (resultCount === 0) {
    return { count: 0, activeCount: 0, rawHtml: html };
  }

  interface RowInfo {
    row: Element;
    status: string;
    profileId: string | null;
  }

  const rowInfos: RowInfo[] = Array.from(resultRows).map((row) => {
    const statusText = row.textContent || "";
    let status = "Unknown";

    for (const s of [...ACTIVE_STATUSES, ...NON_ACTIVE_STATUSES]) {
      const regex = new RegExp(`\\b${s}\\b`, "i");
      if (regex.test(statusText)) {
        status = s;
        break;
      }
    }

    const link = row.querySelector<HTMLAnchorElement>(
      'a[onclick*="RedirectToPatientPage"]'
    );
    const match = link
      ?.getAttribute("onclick")
      ?.match(/RedirectToPatientPage\((\d+)/);
    const profileId = match ? match[1] : null;

    return { row, status, profileId };
  });

  const activeRows = rowInfos.filter((info) => isActiveStatus(info.status));
  const activeCount = activeRows.length;

  console.log(
    `[Patient Search] Total: ${resultCount}, Active: ${activeCount}`,
    rowInfos.map((r) => ({ status: r.status, id: r.profileId }))
  );

  if (activeCount === 1 && activeRows[0].profileId) {
    return {
      count: resultCount,
      activeCount: 1,
      finalUrl: profileTemplate.replace("{ID}", activeRows[0].profileId),
      rawHtml: html,
    };
  }

  if (activeCount === 0 && resultCount === 1 && rowInfos[0].profileId) {
    return {
      count: 1,
      activeCount: 0,
      finalUrl: profileTemplate.replace("{ID}", rowInfos[0].profileId),
      rawHtml: html,
    };
  }

  return { count: resultCount, activeCount, rawHtml: html };
}

// ==================== 内容提取 ====================

/**
 * 为搜索结果 HTML 注入 Status 列的颜色 badge
 *
 * Caregiver badge 规则：
 *   green → Active
 *   gray  → Terminated
 *   yellow → 其余全部（容错未来新状态）
 *
 * Patient badge 规则：
 *   green → Active / Hospitalized
 *   gray  → Discharged
 *   yellow → 其余全部
 *
 * @param html - 原始 HTML（已经过 extractAndCleanContent 处理）
 * @param type - 搜索类型
 * @returns 注入 badge 后的 HTML
 */
export function injectStatusBadges(
  html: string,
  type: "aide" | "patient"
): string {
  // Green / gray keyword sets per type
  const greenWords = type === "aide" ? ["Active"] : ["Active", "Hospitalized"];
  const grayWords = type === "aide" ? ["Terminated"] : ["Discharged"];

  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector<HTMLTableElement>("table");
  if (!table) return html;

  // Find Status column index (handle both thead th and plain th/first-row)
  const headerRow =
    table.querySelector("thead tr") ?? table.querySelector("tr");
  const headers = headerRow
    ? Array.from(headerRow.querySelectorAll("th, td"))
    : [];
  let statusColIndex = -1;
  for (let i = 0; i < headers.length; i++) {
    const text = headers[i].textContent?.toLowerCase().trim() ?? "";
    if (text.includes("status") || text.includes("状态")) {
      statusColIndex = i;
      break;
    }
  }

  if (statusColIndex === -1) return html;

  table.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((row) => {
    const cells = row.querySelectorAll("td");
    const cell = cells[statusColIndex];
    if (!cell) return;

    // Use first line of text only (some cells have dates on second line)
    const fullText = (cell.textContent ?? "").trim();
    const firstWord = fullText.split(/[\s\n(]/)[0].trim();
    const matchText = firstWord || fullText;

    let cls = "status-yellow";
    if (greenWords.some((w) => matchText.toLowerCase() === w.toLowerCase())) {
      cls = "status-green";
    } else if (
      grayWords.some((w) => matchText.toLowerCase() === w.toLowerCase())
    ) {
      cls = "status-gray";
    } else if (!fullText) {
      return; // skip empty cells
    }
    cell.innerHTML = `<span class="status-badge ${cls}">${fullText}</span>`;
  });

  return table.outerHTML;
}

/**
 * 从表格中按表头文字移除若干列（降序处理避免 index shift）
 */
function removeColumnsByHeader(
  table: HTMLTableElement,
  headerNames: string[]
): void {
  const headerCells = Array.from(table.querySelectorAll("th, thead td"));
  if (!headerCells.length) return;

  const indicesToRemove = headerNames
    .map((name) =>
      headerCells.findIndex(
        (cell) =>
          (cell.textContent?.trim() ?? "").toLowerCase() === name.toLowerCase()
      )
    )
    .filter((idx) => idx >= 0)
    .sort((a, b) => b - a); // descending to avoid index shift

  indicesToRemove.forEach((colIdx) => {
    headerCells[colIdx].remove();
    table.querySelectorAll("tbody tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells[colIdx]) cells[colIdx].remove();
    });
  });
}

function extractProfileIdFromActionText(
  actionText: string,
  type: "aide" | "patient"
): string | null {
  if (!actionText) {
    return null;
  }

  const pattern =
    type === "aide"
      ? /RedirectToAidePage\(\s*['"]?(\d+)['"]?\s*\)/i
      : /RedirectToPatientPage\(\s*['"]?(\d+)['"]?\s*\)/i;
  const match = actionText.match(pattern);
  return match?.[1] ?? null;
}

function extractProfileIdFromLink(
  anchor: HTMLAnchorElement,
  type: "aide" | "patient"
): string | null {
  const onclick = anchor.getAttribute("onclick") || "";
  const fromOnclick = extractProfileIdFromActionText(onclick, type);
  if (fromOnclick) {
    return fromOnclick;
  }

  const href = anchor.getAttribute("href") || "";
  const fromHrefAction = extractProfileIdFromActionText(href, type);
  if (fromHrefAction) {
    return fromHrefAction;
  }

  try {
    const url = new URL(href, "https://app.hhaexchange.com");
    if (type === "aide") {
      return url.searchParams.get("AideId");
    }

    return (
      url.searchParams.get("PatientId") ||
      url.searchParams.get("PatientID") ||
      url.searchParams.get("Patientid")
    );
  } catch (_) {
    // fallback with regex if href is not URL-like
  }

  const regex =
    type === "aide" ? /AideId=(\d+)/i : /Patient(?:Id|ID|id)=(\d+)/i;
  const match = href.match(regex);
  return match?.[1] ?? null;
}

function rewriteProfileLinksForPopup(
  table: HTMLTableElement,
  type: "aide" | "patient"
): void {
  const template = buildProfileUrlTemplate(type);
  table.querySelectorAll<HTMLAnchorElement>("tbody a").forEach((anchor) => {
    const profileId = extractProfileIdFromLink(anchor, type);
    if (!profileId) {
      return;
    }

    const targetUrl = template.replace("{ID}", profileId);
    anchor.setAttribute("href", targetUrl);
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
    anchor.removeAttribute("onclick");
  });
}

/**
 * 使用 DOMParser 从原始 HTML 提取并清理搜索结果表格
 * 供 displayCombinedResults 和 displaySingleResult 共用
 */
export function extractAndCleanContent(
  html: string,
  type: "aide" | "patient"
): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  let table = doc.querySelector<HTMLTableElement>("#tdSearchResults");
  if (!table) {
    table = doc.querySelector<HTMLTableElement>("table[id*='Search']");
  }
  if (!table) {
    const tables = doc.querySelectorAll<HTMLTableElement>("table");
    for (const t of tables) {
      if (t.querySelector("tbody tr")) {
        table = t;
        break;
      }
    }
  }

  if (!table) {
    console.warn(`[${type}] 未找到搜索结果表格，HTML 长度: ${html.length}`);
    return `<p style="color: #666; padding: 20px;">未找到搜索结果</p>`;
  }

  const unwantedSelectors = [
    'a[id*="uxfrmSearchXSLT"]',
    'a[href*="uxfrmSearchXSLT"]',
    'form[id*="uxfrmSearch"]',
    'input[type="hidden"]',
    "script",
    ".show-for-sr",
    '[class*="show-for-sr"]',
  ];
  unwantedSelectors.forEach((sel) => {
    table!.querySelectorAll(sel).forEach((el) => el.remove());
  });

  const captionRow = table.querySelector(
    'caption, tr.title-row, [class*="title"]'
  );
  if (captionRow) captionRow.remove();

  table.querySelectorAll("th, thead td").forEach((th) => {
    const link = th.querySelector("a");
    if (link) {
      th.textContent = link.textContent?.trim() || "";
    } else {
      let text = th.textContent || "";
      text = text.replace(/sortable\s*column\s*head/gi, "");
      text = text.replace(/[\r\n\t]+/g, " ");
      text = text.replace(/\s+/g, " ").trim();
      th.textContent = text;
    }
  });

  table.querySelectorAll("tbody td, tr td").forEach((td) => {
    td.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent || "";
        text = text
          .replace(/[\r\n\t]+/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        node.textContent = text;
      }
    });

    td.querySelectorAll("br").forEach((br) => {
      if (!br.nextSibling || !br.nextSibling.textContent?.trim()) {
        br.remove();
      }
    });
  });

  if (type === "aide") {
    removeColumnsByHeader(table, ["Alt. Caregiver Code", "Action"]);
  } else if (type === "patient") {
    removeColumnsByHeader(table, ["Team"]);
  }

  rewriteProfileLinksForPopup(table, type);

  return table.outerHTML;
}

// ==================== 显示函数 ====================

/** Combined View 内联样式块（供 displayCombinedResults 和 displaySingleResult 共用）*/
const PANEL_STYLE_BLOCK = `
    .status-badge { display:inline-block; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600; white-space:nowrap; }
    .status-green  { background:#d1fae5; color:#065f46; border:1px solid #a7f3d0; }
    .status-gray   { background:#f3f4f6; color:#6b7280; border:1px solid #d1d5db; }
    .status-yellow { background:#fef9c3; color:#854d0e; border:1px solid #fde68a; }
    body, html { 
      margin: 0; 
      padding: 0; 
      height: 100%; 
      overflow: hidden; 
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; 
    }
    .container { 
      display: flex; 
      flex-direction: column; 
      height: 100%; 
    }
    .panel { 
      flex: 1; 
      border-bottom: 2px solid #0d3e61; 
      overflow: hidden; 
      display: flex; 
      flex-direction: column;
      min-height: 0;
    }
    .panel:last-child {
      border-bottom: none;
    }
    .panel-header { 
      margin: 0; 
      padding: 10px 15px; 
      background-color: #0d3e61; 
      color: #fff;
      font-size: 16px; 
      font-weight: 600;
      flex-shrink: 0;
    }
    .panel-content { 
      flex: 1;
      overflow: auto;
      min-height: 0;
      padding: 10px;
      background-color: #fff;
    }
    .panel-footer {
      flex-shrink: 0;
    }
    .panel-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    .panel-content table th,
    .panel-content table td {
      padding: 8px;
      border: 1px solid #dee2e6;
      text-align: left;
    }
    .panel-content table thead tr,
    .panel-content table tr:first-child:has(th) {
      background-color: #0d3e61 !important;
      color: #fff !important;
    }
    .panel-content table th,
    .panel-content table thead th,
    .panel-content table thead td {
      background-color: #0d3e61 !important;
      color: #fff !important;
      font-weight: 600;
    }
    .panel-content table th a,
    .panel-content table thead a {
      color: #fff !important;
    }
    .panel-content table tbody tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    .panel-content table tbody tr:hover {
      background-color: #e9ecef;
    }
    .panel-content a {
      color: #0d6efd;
      text-decoration: none;
    }
    .panel-content a:hover {
      text-decoration: underline;
    }
    .panel-content a[href*="uxfrmSearchXSLT"],
    .panel-content a[id*="uxfrmSearchXSLT"],
    .panel-content form[id*="uxfrmSearch"] {
      display: none !important;
    }
    .panel-content ul {
      list-style: none;
      padding: 5px 10px;
      margin: 10px 0;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .panel-content ul li {
      display: inline;
    }
    .panel-content ul li::before {
      content: none;
    }
    .panel-content ul li a {
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 3px;
      background-color: #fff;
    }
    .panel-content span[style*="background-color: #ffff00"] {
      background-color: #ffff00 !important;
      padding: 1px 3px !important;
      border-radius: 2px !important;
      font-weight: bold !important;
    }
`;

/** 共用的重定向脚本块 */
function buildRedirectScriptBlock(): string {
  const aideTemplate = buildProfileUrlTemplate("aide");
  const patientTemplate = buildProfileUrlTemplate("patient");
  return `
  <script>
    function RedirectToAidePage(id) {
      window.open('${aideTemplate}'.replace('{ID}', id), '_blank');
    }
    function RedirectToPatientPage(id) {
      window.open('${patientTemplate}'.replace('{ID}', id), '_blank');
    }
  </script>
`;
}

/** 划词拨号脚本块（自包含 IIFE，不依赖 GM API，注入 blob: 弹窗页） */
const H2C_SCRIPT_BLOCK = `
  <style>
    #highlight-caller-popup {
      position: fixed;
      z-index: 999999;
      background-color: #ffffff;
      border: 1px solid #dcdcdc;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: #333;
      padding: 12px;
      min-width: 200px;
    }
    #highlight-caller-popup .hcp-title {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 8px;
    }
    #highlight-caller-popup .hcp-number {
      background-color: #f0f0f0;
      padding: 4px 8px;
      border-radius: 4px;
      margin-bottom: 12px;
      text-align: center;
      font-weight: 500;
    }
    #highlight-caller-popup .hcp-actions {
      display: flex;
      justify-content: space-around;
      gap: 10px;
    }
    #highlight-caller-popup .hcp-button {
      display: inline-block;
      text-decoration: none;
      color: #fff;
      background-color: #007bff;
      padding: 8px 12px;
      border-radius: 5px;
      transition: background-color 0.2s;
      flex-grow: 1;
      text-align: center;
      border: none;
      cursor: pointer;
      font-size: 14px;
    }
    #highlight-caller-popup .hcp-button:hover {
      background-color: #0056b3;
    }
    #highlight-caller-popup .hcp-close-btn {
      position: absolute;
      top: 5px;
      right: 8px;
      font-size: 20px;
      color: #aaa;
      cursor: pointer;
      font-weight: bold;
    }
    #highlight-caller-popup .hcp-close-btn:hover {
      color: #333;
    }
    #highlight-caller-popup .hcp-actions-full {
      margin-top: 10px;
    }
    #highlight-caller-popup .hcp-copy-btn {
      width: 100%;
      background-color: #f0f0f0;
      border: 1px solid #dcdcdc;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      padding: 8px 12px;
      border-radius: 5px;
      transition: background-color 0.2s;
    }
    #highlight-caller-popup .hcp-copy-btn:hover {
      background-color: #e0e0e0;
    }
  </style>
  <script>
  (function () {
    var PHONE_REGEX = /(?:\\+?1[\\s.-]?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}/;
    function normalize(s) {
      var d = s.replace(/\\D/g, '');
      if (d.length === 11 && d.charAt(0) === '1') d = d.substring(1);
      return d;
    }
    var popup = null;
    function removePopup() { if (popup) { popup.remove(); popup = null; } }
    function createPopup(phoneNumber, evt) {
      removePopup();
      var clean = normalize(phoneNumber);
      if (clean.length !== 10) return;
      popup = document.createElement('div');
      popup.id = 'highlight-caller-popup';
      popup.innerHTML =
        '<div class="hcp-title">\u8bf7\u9009\u62e9\u64cd\u4f5c</div>' +
        '<div class="hcp-number">' + phoneNumber + '</div>' +
        '<div class="hcp-actions">' +
          '<a href="tel:' + clean + '" class="hcp-button" target="_blank">\ud83d\udcde \u6253\u7535\u8bdd</a>' +
          '<a href="sms:' + clean + '" class="hcp-button" target="_blank">\ud83d\udcac \u53d1\u77ed\u4fe1</a>' +
        '</div>' +
        '<div class="hcp-actions-full">' +
          '<button class="hcp-copy-btn">\ud83d\udccb \u590d\u5236\u53f7\u7801</button>' +
        '</div>' +
        '<div class="hcp-close-btn" title="\u5173\u95ed">\u00d7</div>';
      document.body.appendChild(popup);
      var rect = popup.getBoundingClientRect();
      var top = evt.clientY + 15;
      var left = evt.clientX;
      if (top + rect.height > window.innerHeight) top = evt.clientY - rect.height - 15;
      if (left + rect.width > window.innerWidth) left = window.innerWidth - rect.width - 10;
      popup.style.top = top + 'px';
      popup.style.left = left + 'px';
      var closeBtn = popup.querySelector('.hcp-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', removePopup);
      var copyBtn = popup.querySelector('.hcp-copy-btn');
      if (copyBtn) copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(clean).then(function() {
          copyBtn.textContent = '\u2705 \u5df2\u590d\u5236';
          setTimeout(function() { if (copyBtn) copyBtn.textContent = '\ud83d\udccb \u590d\u5236\u53f7\u7801'; }, 1500);
        });
      });
      popup.querySelectorAll('a.hcp-button').forEach(function(a) {
        a.addEventListener('click', function() { setTimeout(removePopup, 100); });
      });
    }
    document.addEventListener('mouseup', function(e) {
      if (popup && popup.contains(e.target)) return;
      var sel = window.getSelection();
      var text = sel ? sel.toString().trim() : '';
      if (text) {
        var m = text.match(PHONE_REGEX);
        if (m) { createPopup(m[0], e); } else { removePopup(); }
      } else { removePopup(); }
    });
    document.addEventListener('mousedown', function(e) {
      if (popup && !popup.contains(e.target)) removePopup();
    });
  })();
  </script>
`;

// ==================== 客户端分页脚本构建器 ====================

/**
 * 构建分页 JS 脚本，供 Combined View（pageSize=15）和 Single View（pageSize=20）共用
 *
 * 约定：
 * - 每个 side 的 tbody tr 需要 data-row-index="0" ... 属性
 * - side 为 "aide" 或 "patient"（Combined）或 "single"（Single View）
 *
 * @param pageSizes - 各 side 的每页行数，对象格式 { aide: 15, patient: 15 }
 */
function buildPaginationScript(pageSizes: Record<string, number>): string {
  return `
<script>
(function() {
  var pageSizes = ${JSON.stringify(pageSizes)};
  var currentPages = {};
  Object.keys(pageSizes).forEach(function(side) { currentPages[side] = 1; });

  function showPage(side, pageNum) {
    var ps = pageSizes[side] || 15;
    var rows = document.querySelectorAll('[data-side="' + side + '"] tbody tr[data-row-index]');
    if (!rows.length) return;
    var total = rows.length;
    var totalPages = Math.ceil(total / ps);
    if (pageNum < 1) pageNum = 1;
    if (pageNum > totalPages) pageNum = totalPages;
    currentPages[side] = pageNum;
    rows.forEach(function(tr) {
      var idx = parseInt(tr.getAttribute('data-row-index'), 10);
      var show = idx >= (pageNum - 1) * ps && idx < pageNum * ps;
      tr.style.display = show ? '' : 'none';
    });
    // Update pagination bar
    var pageInfo = document.querySelector('[data-pagination-side="' + side + '"] .pg-info');
    var prevBtn = document.querySelector('[data-pagination-side="' + side + '"] .pg-prev');
    var nextBtn = document.querySelector('[data-pagination-side="' + side + '"] .pg-next');
    if (pageInfo) pageInfo.textContent = '第 ' + pageNum + ' / ' + totalPages + ' 页';
    if (prevBtn) prevBtn.disabled = pageNum <= 1;
    if (nextBtn) nextBtn.disabled = pageNum >= totalPages;
  }

  window.showPage = showPage;
  window.prevPage = function(side) { showPage(side, (currentPages[side] || 1) - 1); };
  window.nextPage = function(side) { showPage(side, (currentPages[side] || 1) + 1); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      Object.keys(pageSizes).forEach(function(side) { showPage(side, 1); });
    });
  } else {
    Object.keys(pageSizes).forEach(function(side) { showPage(side, 1); });
  }
})();
</script>`;
}

/**
 * 为 HTML table outerHTML 中的 tbody tr 加上 data-row-index 属性，
 * 并在 HTML 末尾追加分页控制栏
 *
 * @param tableHtml - 来自 extractAndCleanContent 的 table outerHTML
 * @param side - data-side 标记，用于 JS showPage 定位
 * @param pageSize - 每页行数
 * @returns 加上标注和分页栏的 HTML 片段
 */
function injectRowIndexes(
  tableHtml: string,
  side: string,
  pageSize: number
): { tableHtml: string; paginationBarHtml: string } {
  // Use DOMParser to add data-row-index and data-side, count rows
  const doc = new DOMParser().parseFromString(tableHtml, "text/html");
  const table = doc.querySelector("table");
  if (!table) return { tableHtml, paginationBarHtml: "" };

  table.setAttribute("data-side", side);
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  rows.forEach((tr, idx) => tr.setAttribute("data-row-index", String(idx)));

  const totalRows = rows.length;
  const needPagination = totalRows > pageSize;
  const tableOut = table.outerHTML;

  if (!needPagination) return { tableHtml: tableOut, paginationBarHtml: "" };

  const totalPages = Math.ceil(totalRows / pageSize);
  const paginationBarHtml = `<div data-pagination-side="${side}" style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#0d3e61;">
  <button class="pg-prev" disabled
    onclick="prevPage('${side}')"
    style="background:#1a5276;color:#fff;border:none;padding:4px 10px;border-radius:3px;cursor:pointer;font-size:12px;">
    上一页
  </button>
  <span class="pg-info" style="color:#fff;font-size:12px;flex:1;text-align:center;">第 1 / ${totalPages} 页</span>
  <button class="pg-next" ${totalPages <= 1 ? "disabled" : ""}
    onclick="nextPage('${side}')"
    style="background:#1a5276;color:#fff;border:none;padding:4px 10px;border-radius:3px;cursor:pointer;font-size:12px;">
    下一页
  </button>
</div>`;

  return { tableHtml: tableOut, paginationBarHtml };
}

/**
 * 创建一个上下分栏的HTML页面来同时显示两个搜索结果
 * 支持客户端分页：每侧 15 行/页
 */
export function displayCombinedResults(
  aideResult: HhaSearchResult,
  patientResult: HhaSearchResult,
  phoneNumber: string = ""
): void {
  console.log("两边都有结果，创建合并视图...");

  let aideBody = extractAndCleanContent(aideResult.rawHtml, "aide");
  let patientBody = extractAndCleanContent(patientResult.rawHtml, "patient");

  aideBody = injectStatusBadges(aideBody, "aide");
  patientBody = injectStatusBadges(patientBody, "patient");

  aideBody = highlightPhoneNumber(aideBody, phoneNumber);
  patientBody = highlightPhoneNumber(patientBody, phoneNumber);

  const aideContent = injectRowIndexes(aideBody, "aide", 15);
  const patientContent = injectRowIndexes(patientBody, "patient", 15);

  const paginationScript = buildPaginationScript({ aide: 15, patient: 15 });

  const combinedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HHA Combined Search Results</title>
  <style>${PANEL_STYLE_BLOCK}</style>
  ${buildRedirectScriptBlock()}
</head>
<body>
  <div class="container">
    <div class="panel">
      <h2 class="panel-header">Caregiver (护工) 搜索结果 (${
        aideResult.count
      } 条)</h2>
      <div class="panel-content">${aideContent.tableHtml}</div>
      ${
        aideContent.paginationBarHtml
          ? `<div class="panel-footer">${aideContent.paginationBarHtml}</div>`
          : ""
      }
    </div>
    <div class="panel">
      <h2 class="panel-header">Patient (病人) 搜索结果 (${
        patientResult.count
      } 条${
    patientResult.activeCount !== undefined
      ? `, Active: ${patientResult.activeCount}`
      : ""
  })</h2>
      <div class="panel-content">${patientContent.tableHtml}</div>
      ${
        patientContent.paginationBarHtml
          ? `<div class="panel-footer">${patientContent.paginationBarHtml}</div>`
          : ""
      }
    </div>
  </div>
  ${paginationScript}
  ${H2C_SCRIPT_BLOCK}
</body>
</html>`;

  openInPopup(combinedHtml, "HHA_Combined_Result", true);
}

/**
 * 以单面板形式展示单一数据源的多结果
 * 支持客户端分页：20 行/页
 */
export function displaySingleResult(
  result: HhaSearchResult,
  type: "aide" | "patient",
  phoneNumber: string
): void {
  const isAide = type === "aide";
  const label = isAide ? "Caregiver (护工)" : "Patient (病人)";
  const countLabel =
    !isAide && result.activeCount !== undefined
      ? `${result.count} 条, Active: ${result.activeCount}`
      : `${result.count} 条`;

  let bodyContent = extractAndCleanContent(result.rawHtml, type);
  bodyContent = injectStatusBadges(bodyContent, type);
  bodyContent = highlightPhoneNumber(bodyContent, phoneNumber);
  const singleContent = injectRowIndexes(bodyContent, "single", 20);

  const paginationScript = buildPaginationScript({ single: 20 });

  const singleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HHA ${label} 搜索结果</title>
  <style>${PANEL_STYLE_BLOCK}</style>
  ${buildRedirectScriptBlock()}
</head>
<body>
  <div class="container">
    <div class="panel">
      <h2 class="panel-header">${label} 搜索结果 (${countLabel})</h2>
      <div class="panel-content">${singleContent.tableHtml}</div>
      ${
        singleContent.paginationBarHtml
          ? `<div class="panel-footer">${singleContent.paginationBarHtml}</div>`
          : ""
      }
    </div>
  </div>
  ${paginationScript}
  ${H2C_SCRIPT_BLOCK}
</body>
</html>`;

  openInPopup(singleHtml, "HHA_Search_Result", true);
}

// ==================== 数据获取 ====================

/**
 * 通用的后台搜索函数, 使用 GM_fetch
 */
export async function fetchHhaData(
  type: "aide" | "patient",
  formattedNumber: string
): Promise<HhaSearchResult> {
  let tenantBaseUrl = "";
  try {
    tenantBaseUrl = getTenantBaseUrlForSearchOrThrow();
  } catch (error) {
    return { count: 0, rawHtml: (error as Error).message || "Tenant missing" };
  }

  let baseUrl: string,
    params: string,
    handler: (html: string) => HhaSearchResult;
  if (type === "aide") {
    [baseUrl, params, handler] = [
      `${tenantBaseUrl}/Aide/AideSearchXSLT_ns.aspx?FirstName=&Phone=`,
      AIDE_SEARCH_PARAMS,
      handleAideSearchResult,
    ];
  } else {
    [baseUrl, params, handler] = [
      `${tenantBaseUrl}/Patient/PatientSearchXSLT_ns.aspx?FirstName=&LastName=&StatusID=-1&PatientID=&MRNumber=&CoordinatorId=-1&Source=-1&PatientNumber=&HomePhone=`,
      PATIENT_SEARCH_PARAMS,
      handlePatientSearchResult,
    ];
  }
  const searchUrl = `${baseUrl}${formattedNumber}${params}&_=${new Date().getTime()}`;

  try {
    const r = (await GM_fetch(searchUrl)) as Response & { rawBody: Blob };
    if (r.status >= 200 && r.status < 400) {
      const html = await r.rawBody.text();
      const result = handler(html);
      result.searchUrl = searchUrl;
      return result;
    }
    console.error(`HHA ${type} search failed with status: ${r.status}`);
    return { count: 0, rawHtml: `Request Failed: ${r.status}` };
  } catch (error) {
    console.error(`HHA ${type} search network error:`, error);
    return { count: 0, rawHtml: "Network Error" };
  }
}

// ==================== 多字段搜索 + 多页全量获取 ====================

/**
 * 根据 HhaQuickSearchParams 和页码构建搜索 URL
 * @param type - 搜索类型 'aide' 或 'patient'
 * @param params - 快速搜索参数
 * @param page - 页码（对应 URL 中的 pg= 字段）
 */
export function buildSearchUrl(
  type: "aide" | "patient",
  params: HhaQuickSearchParams,
  page: number
): string {
  const tenantBaseUrl = getTenantBaseUrlForSearchOrThrow();

  if (type === "aide") {
    const baseUrl = `${tenantBaseUrl}/Aide/AideSearchXSLT_ns.aspx`;
    const qp = new URLSearchParams({
      FirstName: params.firstName ?? "",
      Phone: params.phone ?? "",
      LastName: params.lastName ?? "",
      Type: "-1",
      Discipline: "-1",
      CaregiverCode: params.id ?? "",
      ALtCaregiverCode: "",
      Status: "-1",
      SSN: params.ssn ?? "",
      CaregiverTeamID: "-1",
      FromVisitEdit: "0",
      CaregiverLocationID: "-1",
      CaregiverBranchID: "-1",
      VisitDate: "",
      office: "469,5137,5139,6475,14849",
      DOB: "",
      pg: String(page),
      sort: "",
      ord: "ASC",
      FromPage: "",
    });
    return `${baseUrl}?${qp.toString()}`;
  } else {
    const baseUrl = `${tenantBaseUrl}/Patient/PatientSearchXSLT_ns.aspx`;
    const qp = new URLSearchParams({
      FirstName: params.firstName ?? "",
      LastName: params.lastName ?? "",
      StatusID: "-1",
      PatientID: params.patientId ?? "",
      MRNumber: "",
      CoordinatorId: "-1",
      Source: "-1",
      PatientNumber: params.id ?? "",
      HomePhone: params.phone ?? "",
      AltPatientID: "",
      TeamID: "-1",
      LocationID: "-1",
      BranchID: "-1",
      DisciplineID: "0",
      Default: "false",
      pg: String(page),
      sort: "",
      ord: "ASC",
      OfficeIds: "469,5137,5139,6475,14849",
      MedicaidID: params.medicaidId ?? "",
    });
    return `${baseUrl}?${qp.toString()}`;
  }
}

/**
 * 获取指定类型搜索的所有页面结果，返回合并后的完整 HhaSearchResult
 * 1. 获取第 1 页
 * 2. 从 h2 解析总数
 * 3. 若总数 > 10，并行请求其余页并合并 tbody 行
 *
 * @param type - 搜索类型
 * @param params - 快速搜索参数
 */

// ==================== 向导搜索行解析（Employment Activation Template）====================

/** Aide（护理员）行记录——供向导步骤1使用 */
export interface AideRecord {
  fullName: string;
  caregiverCode: string;
  lastName: string;
  firstName: string;
  dob: string;
  phone: string;
  discipline: string;
  status: string;
  ssn: string;
  team: string;
  type: string;
  altCaregiverCode: string;
}

/** Patient（患者）行记录——供向导步骤2使用 */
export interface PatientRecord {
  fullName: string;
  patientId: string;
  admissionId: string;
  dob: string;
  status: string;
  phone: string;
  coordinators: string;
  startDate: string;
  active: string;
  contract: string;
  location: string;
  branch: string;
  disciplines: string;
}

/**
 * 从搜索结果 HTML 解析 Aide 行数据，供向导步骤1使用。
 * 使用动态列索引定位，不硬编码列号。
 */
export function parseAideRows(rawHtml: string): AideRecord[] {
  const doc = new DOMParser().parseFromString(rawHtml, "text/html");
  const table =
    doc.querySelector<HTMLTableElement>("#tdSearchResults") ??
    doc.querySelector<HTMLTableElement>("table");
  if (!table) return [];

  const headerRow =
    table.querySelector("thead tr") ?? table.querySelector("tr");
  if (!headerRow) return [];

  const headers = Array.from(headerRow.querySelectorAll("th, td")).map((th) =>
    (th.textContent?.trim() ?? "").toLowerCase()
  );

  const findCol = (keywords: string[]): number =>
    headers.findIndex((h) => keywords.some((kw) => h.includes(kw)));

  const nameIdx = Math.max(findCol(["name"]), 0);
  const dobIdx = findCol(["dob", "birth"]);
  const phoneIdx = findCol(["phone"]);
  const disciplineIdx = findCol(["discipline"]);
  const statusIdx = findCol(["status"]);
  const ssnIdx = findCol(["ssn", "social security"]);
  const teamIdx = findCol(["team"]);
  const typeIdx = findCol(["type", "caregiver type"]);
  const altCodeIdx = findCol(["alt caregiver", "alt code"]);

  const records: AideRecord[] = [];

  table.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length === 0) return;

    const nameCell = cells[nameIdx];
    if (!nameCell) return;

    const nameLink = nameCell.querySelector<HTMLAnchorElement>("a");
    const fullName = (
      nameLink?.textContent ??
      nameCell.childNodes[0]?.textContent ??
      nameCell.textContent ??
      ""
    )
      .trim()
      .replace(/\s+/g, " ");
    if (!fullName) return;

    // Caregiver Code: second text node or span after the name link in the same cell
    let caregiverCode = "";
    const cellText = (nameCell.textContent ?? "").replace(/\s+/g, " ").trim();
    const cleaned = cellText.replace(fullName, "").trim();
    const codeMatch = cleaned.match(/[A-Z]{2,5}-\d+/);
    if (codeMatch) caregiverCode = codeMatch[0];

    const nameParts = fullName.split(/\s+/);
    const lastName = nameParts[0] ?? "";
    const firstName = nameParts.slice(1).join(" ");

    const dob = dobIdx >= 0 ? cells[dobIdx]?.textContent?.trim() ?? "" : "";
    const phone =
      phoneIdx >= 0 ? cells[phoneIdx]?.textContent?.trim() ?? "" : "";
    const discipline =
      disciplineIdx >= 0 ? cells[disciplineIdx]?.textContent?.trim() ?? "" : "";

    let status = "";
    if (statusIdx >= 0 && cells[statusIdx]) {
      const statusBadge = cells[statusIdx].querySelector(".status-badge");
      status = (
        statusBadge?.textContent ??
        cells[statusIdx].textContent ??
        ""
      ).trim();
    }

    const ssn = ssnIdx >= 0 ? cells[ssnIdx]?.textContent?.trim() ?? "" : "";
    const team = teamIdx >= 0 ? cells[teamIdx]?.textContent?.trim() ?? "" : "";
    const type = typeIdx >= 0 ? cells[typeIdx]?.textContent?.trim() ?? "" : "";
    const altCaregiverCode =
      altCodeIdx >= 0 ? cells[altCodeIdx]?.textContent?.trim() ?? "" : "";
    records.push({
      fullName,
      caregiverCode,
      lastName,
      firstName,
      dob,
      phone,
      discipline,
      status,
      ssn,
      team,
      type,
      altCaregiverCode,
    });
  });

  return records;
}

/**
 * 从搜索结果 HTML 解析 Patient 行数据，供向导步骤2使用。
 * 使用动态列索引定位，不硬编码列号。
 */
export function parsePatientRows(rawHtml: string): PatientRecord[] {
  const doc = new DOMParser().parseFromString(rawHtml, "text/html");
  const table =
    doc.querySelector<HTMLTableElement>("#tdSearchResults") ??
    doc.querySelector<HTMLTableElement>("table");
  if (!table) return [];

  const headerRow =
    table.querySelector("thead tr") ?? table.querySelector("tr");
  if (!headerRow) return [];

  const headers = Array.from(headerRow.querySelectorAll("th, td")).map((th) =>
    (th.textContent?.trim() ?? "").toLowerCase()
  );

  const findCol = (keywords: string[]): number =>
    headers.findIndex((h) => keywords.some((kw) => h.includes(kw)));

  const nameIdx = Math.max(findCol(["name"]), 0);
  const patientIdIdx = findCol(["patient id", "patient number", "patientid"]);
  const admissionIdx = findCol(["admission", "mr number", "mrnumber"]);
  const dobIdx = findCol(["dob", "birth"]);
  const statusIdx = findCol(["status"]);
  const phoneIdx = findCol(["phone"]);
  const coordinatorsIdx = findCol(["coordinator", "case manager"]);
  const startDateIdx = findCol(["start date", "start"]);
  const activeIdx = findCol(["active"]);
  const contractIdx = findCol(["contract"]);
  const locationIdx = findCol(["location"]);
  const branchIdx = findCol(["branch"]);
  const disciplinesIdx = findCol(["discipline"]);

  const records: PatientRecord[] = [];

  table.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length === 0) return;

    const nameCell = cells[nameIdx];
    if (!nameCell) return;

    const nameLink = nameCell.querySelector<HTMLAnchorElement>("a");
    const rawName = (nameLink?.textContent ?? nameCell.textContent ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s*View\s+Patient\s+Details\b.*/i, "")
      .trim();
    const fullName = rawName;
    if (!fullName) return;

    const patientId =
      patientIdIdx >= 0
        ? (cells[patientIdIdx]?.textContent?.trim() ?? "")
            .replace(/\s*Patient\s+Id\b.*/i, "")
            .trim()
        : "";
    const admissionId =
      admissionIdx >= 0 ? cells[admissionIdx]?.textContent?.trim() ?? "" : "";
    const dob = dobIdx >= 0 ? cells[dobIdx]?.textContent?.trim() ?? "" : "";

    let status = "";
    if (statusIdx >= 0 && cells[statusIdx]) {
      const statusBadge = cells[statusIdx].querySelector(".status-badge");
      status = (
        statusBadge?.textContent ??
        cells[statusIdx].textContent ??
        ""
      ).trim();
    }

    const phone =
      phoneIdx >= 0 ? cells[phoneIdx]?.textContent?.trim() ?? "" : "";

    const coordinators =
      coordinatorsIdx >= 0
        ? cells[coordinatorsIdx]?.textContent?.trim() ?? ""
        : "";
    const startDate =
      startDateIdx >= 0 ? cells[startDateIdx]?.textContent?.trim() ?? "" : "";
    const active =
      activeIdx >= 0 ? cells[activeIdx]?.textContent?.trim() ?? "" : "";
    const contract =
      contractIdx >= 0 ? cells[contractIdx]?.textContent?.trim() ?? "" : "";
    const location =
      locationIdx >= 0 ? cells[locationIdx]?.textContent?.trim() ?? "" : "";
    const branch =
      branchIdx >= 0 ? cells[branchIdx]?.textContent?.trim() ?? "" : "";
    const disciplines =
      disciplinesIdx >= 0
        ? cells[disciplinesIdx]?.textContent?.trim() ?? ""
        : "";
    records.push({
      fullName,
      patientId,
      admissionId,
      dob,
      status,
      phone,
      coordinators,
      startDate,
      active,
      contract,
      location,
      branch,
      disciplines,
    });
  });

  return records;
}

export async function fetchAllPages(
  type: "aide" | "patient",
  params: HhaQuickSearchParams
): Promise<HhaSearchResult> {
  // 获取第 1 页
  let url1 = "";
  try {
    url1 = buildSearchUrl(type, params, 1);
  } catch (error) {
    return {
      count: 0,
      rawHtml: (error as Error).message || "Tenant missing",
    };
  }

  let page1Html = "";
  try {
    const r = (await GM_fetch(url1)) as Response & { rawBody: Blob };
    if (r.status >= 200 && r.status < 400) {
      page1Html = await r.rawBody.text();
    } else {
      return { count: 0, rawHtml: `Request Failed: ${r.status}` };
    }
  } catch (error) {
    console.error(`[fetchAllPages] Page 1 error:`, error);
    return { count: 0, rawHtml: "Network Error" };
  }

  const handler =
    type === "aide" ? handleAideSearchResult : handlePatientSearchResult;
  const page1Result = handler(page1Html);

  const totalCount = page1Result.count;
  if (totalCount <= 10) {
    // 单页结果，直接返回
    return page1Result;
  }

  // 多页：并行获取剩余页
  const totalPages = Math.ceil(totalCount / 10);
  const pagePromises: Promise<string>[] = [];
  for (let pg = 2; pg <= totalPages; pg++) {
    let url = "";
    try {
      url = buildSearchUrl(type, params, pg);
    } catch (_) {
      continue;
    }

    pagePromises.push(
      GM_fetch(url)
        .then((r) => (r as Response & { rawBody: Blob }).rawBody.text())
        .catch(() => "")
    );
  }
  const extraPages = await Promise.all(pagePromises);

  // 合并：将所有页的 <tbody> 行追加到第 1 页的 #tdSearchResults 中
  const doc1 = new DOMParser().parseFromString(page1Html, "text/html");
  const tbody1 = doc1.querySelector<HTMLElement>("#tdSearchResults tbody");

  if (tbody1) {
    for (const pageHtml of extraPages) {
      if (!pageHtml) continue;
      const docN = new DOMParser().parseFromString(pageHtml, "text/html");
      const tbodyN = docN.querySelector<HTMLElement>("#tdSearchResults tbody");
      if (tbodyN) {
        Array.from(tbodyN.querySelectorAll("tr")).forEach((tr) => {
          tbody1.appendChild(document.adoptNode(tr));
        });
      }
    }
  }

  // 序列化合并后的 #tdSearchResults 为新的 rawHtml
  const mergedTable = doc1.querySelector<HTMLElement>("#tdSearchResults");
  const mergedRawHtml = mergedTable ? mergedTable.outerHTML : page1Html;

  const result: HhaSearchResult = {
    count: totalCount,
    rawHtml: mergedRawHtml,
  };
  if (type === "patient" && page1Result.activeCount !== undefined) {
    result.activeCount = page1Result.activeCount;
  }

  return result;
}
