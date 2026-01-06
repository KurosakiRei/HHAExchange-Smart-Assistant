import GM_fetch from "@trim21/gm-fetch";
import {
  TOAST_CONTAINER_SELECTOR,
  TOAST_TOAST_SELECTOR,
  TOAST_TOAST_WRAPPER_SELECTOR,
  CALL_STATE_SELECTOR,
  MAIN_CONTENT_SELECTOR,
  CALL_INFO_PANEL_SELECTOR,
  PHONE_NUMBER_CONTAINER_SELECTOR,
} from "../utils/templates&const";

// ==================== 类型定义 ====================

/**
 * 搜索结果的标准接口
 * - count: 原始结果总数
 * - activeCount: Active 状态的结果数量 (仅 Patient 源使用)
 * - finalUrl: 当定位到唯一结果时的 profile URL
 * - searchUrl: 原始搜索URL (用于多结果时直接打开)
 * - rawHtml: 原始 HTML 响应 (备用)
 */
interface HhaSearchResult {
  count: number;
  activeCount?: number;
  finalUrl?: string;
  searchUrl?: string;
  rawHtml: string;
}

/**
 * Patient 状态分类
 * Active States: Active, Hospitalized (高优先级，需要关注)
 * Non-Active States: Discharged, Hold, Waiting (低优先级，可忽略)
 */
type PatientActiveStatus = "Active" | "Hospitalized";
type PatientNonActiveStatus = "Discharged" | "Hold" | "Waiting";
type PatientStatus = PatientActiveStatus | PatientNonActiveStatus;

// ==================== 常量定义 ====================

/** Active 状态列表 (包括 Hospitalized，因为需要同等关注) */
const ACTIVE_STATUSES: readonly PatientActiveStatus[] = [
  "Active",
  "Hospitalized",
] as const;

/** Non-Active 状态列表 */
const NON_ACTIVE_STATUSES: readonly PatientNonActiveStatus[] = [
  "Discharged",
  "Hold",
  "Waiting",
] as const;

// ==================== 配置区域 ====================

const AIDE_SEARCH_URL: string =
  "https://app.hhaexchange.com/ENT2507010000/Aide/AideSearchXSLT_ns.aspx?FirstName=&Phone=";
const AIDE_SEARCH_PARAMS: string =
  "&LastName=&Type=-1&Discipline=-1&CaregiverCode=&ALtCaregiverCode=&Status=-1&SSN=&CaregiverTeamID=-1&FromVisitEdit=0&CaregiverLocationID=-1&CaregiverBranchID=-1&VisitDate=&office=469,5137,5139,6475,14849&DOB=&pg=1&sort=&ord=ASC&FromPage=";
const AIDE_PROFILE_URL_TEMPLATE: string =
  "https://app.hhaexchange.com/ENT2507010000/Aide/Aide_ns.aspx?AideId={ID}";

const PATIENT_SEARCH_URL: string =
  "https://app.hhaexchange.com/ENT2507010000/Patient/PatientSearchXSLT_ns.aspx?FirstName=&LastName=&StatusID=-1&PatientID=&MRNumber=&CoordinatorId=-1&Source=-1&PatientNumber=&HomePhone=";
const PATIENT_SEARCH_PARAMS: string =
  "&AltPatientID=&TeamID=-1&LocationID=-1&BranchID=-1&DisciplineID=0&Default=false&pg=1&sort=&ord=ASC&OfficeIds=469,5137,5139,6475,14849&MedicaidID=";
const PATIENT_PROFILE_URL_TEMPLATE: string =
  "https://app.hhaexchange.com/ENT2507010000/Patient/InternalPatientInfo_ns.aspx?PatientId={ID}";

// ==================== 状态变量 ====================

let lastCallWasIncoming: boolean = false;

/** 当前搜索的电话号码（用于高亮显示） */
let currentSearchPhone: string = "";

// ==================== 工具函数 ====================

/**
 * 判断给定的状态是否为 Active 状态
 * Active 状态包括: Active, Hospitalized
 * @param status - Patient 的状态字符串
 * @returns 是否为 Active 状态
 */
function isActiveStatus(status: string): boolean {
  return ACTIVE_STATUSES.some(
    (activeStatus) => status.toLowerCase() === activeStatus.toLowerCase()
  );
}

/**
 * HHA 风格的 CSS 样式
 * 用于在弹窗中复现 HHAeXchange 原版的表格样式
 */
const HHA_STYLE_CSS = `
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
 * @param html - 原始 HTML 字符串
 * @returns 处理后的 HTML 字符串
 */
function injectHhaStyles(html: string): string {
  // 在 </head> 前注入样式，如果没有 head 标签则在开头添加
  if (html.includes("</head>")) {
    return html.replace("</head>", HHA_STYLE_CSS + "</head>");
  } else if (html.includes("<body")) {
    return html.replace("<body", HHA_STYLE_CSS + "<body");
  } else {
    return HHA_STYLE_CSS + html;
  }
}

/**
 * 清理 HTML 中的无用元素，移除用户不需要看到的链接和表单
 * @param html - 原始 HTML 字符串
 * @returns 清理后的 HTML 字符串
 */
function cleanupHtml(html: string): string {
  // 移除 uxfrmSearchXSLT 相关的链接和表单（包含 URL 参数的那种长链接）
  // 匹配: <a ...id="uxfrmSearchXSLT"...>...</a>
  html = html.replace(
    /<a[^>]*id\s*=\s*["']?uxfrmSearchXSLT["']?[^>]*>[\s\S]*?<\/a>/gi,
    ""
  );

  // 移除 href 中包含 uxfrmSearchXSLT 的链接
  html = html.replace(
    /<a[^>]*href\s*=\s*["'][^"']*uxfrmSearchXSLT[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,
    ""
  );

  // 移除 uxfrmSearch 相关的表单
  html = html.replace(
    /<form[^>]*id\s*=\s*["']?uxfrmSearch[^"']*["']?[^>]*>[\s\S]*?<\/form>/gi,
    ""
  );

  // 移除那些包含完整 URL 参数的链接文本 (如 "&LastName=...&FirstName=..." 这种)
  html = html.replace(/<a[^>]*>[^<]*(&amp;|\&)LastName=[^<]*<\/a>/gi, "");

  return html;
}

/**
 * 在 HTML 中高亮指定的电话号码
 * @param html - 原始 HTML 字符串
 * @param phoneNumber - 要高亮的电话号码 (格式: xxx-xxx-xxxx)
 * @returns 处理后的 HTML 字符串
 */
function highlightPhoneNumber(html: string, phoneNumber: string): string {
  if (!phoneNumber) return html;

  // 生成多种格式的电话号码进行匹配
  const digits = phoneNumber.replace(/\D/g, "");
  const formats = [
    phoneNumber, // xxx-xxx-xxxx
    digits, // xxxxxxxxxx
    `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`, // (xxx) xxx-xxxx
    `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`, // xxx.xxx.xxxx
    `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`, // xxx xxx xxxx
  ];

  // 转义正则特殊字符并创建匹配模式
  const escapedFormats = formats.map((f) =>
    f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const pattern = new RegExp(`(${escapedFormats.join("|")})`, "g");

  // 替换为高亮版本（避免在标签内替换）
  return html.replace(
    pattern,
    '<span style="background-color: #ffff00; padding: 1px 3px; border-radius: 2px; font-weight: bold;">$1</span>'
  );
}

/**
 * 为 HTML 注入重定向脚本，使点击链接能正常跳转到 profile 页面
 * @param html - 原始 HTML 字符串
 * @param type - 搜索类型 'aide' 或 'patient'
 * @returns 处理后的 HTML 字符串
 */
function injectRedirectScript(html: string, type: "aide" | "patient"): string {
  const profileUrlTemplate =
    type === "aide" ? AIDE_PROFILE_URL_TEMPLATE : PATIENT_PROFILE_URL_TEMPLATE;
  const functionName =
    type === "aide" ? "RedirectToAidePage" : "RedirectToPatientPage";

  const script = `
<script>
function ${functionName}(id) {
  window.open('${profileUrlTemplate}'.replace('{ID}', id), '_blank');
}
function RedirectToAidePage(id) {
  window.open('${AIDE_PROFILE_URL_TEMPLATE}'.replace('{ID}', id), '_blank');
}
function RedirectToPatientPage(id) {
  window.open('${PATIENT_PROFILE_URL_TEMPLATE}'.replace('{ID}', id), '_blank');
}
</script>
`;

  // 在 </head> 或 </body> 前注入脚本
  if (html.includes("</head>")) {
    return html.replace("</head>", script + "</head>");
  } else if (html.includes("</body>")) {
    return html.replace("</body>", script + "</body>");
  } else {
    return html + script;
  }
}

/**
 * 处理 HTML: 注入样式 + 高亮电话号码 + 注入重定向脚本
 * @param html - 原始 HTML
 * @param type - 搜索类型
 * @param phoneNumber - 要高亮的电话号码
 * @returns 处理后的 HTML
 */
function processHtmlForDisplay(
  html: string,
  type: "aide" | "patient",
  phoneNumber: string
): string {
  let processed = html;
  processed = cleanupHtml(processed); // 先清理无用元素
  processed = injectHhaStyles(processed); // 注入 HHA 风格样式
  processed = highlightPhoneNumber(processed, phoneNumber);
  processed = injectRedirectScript(processed, type);
  return processed;
}

/**
 * 格式化电话号码为 HHAeXchange 接受的格式 (e.g., 917-415-2489)
 * @param rawNumber - 从页面提取的原始号码字符串
 * @returns 格式化后的号码字符串, 如果格式无效则返回 null
 */
function formatPhoneNumber(rawNumber: string | null): string | null {
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
 * 使用 Blob URL 避免 data URL 的长度限制和编码问题
 * @param urlOrHtml - 要打开的网址或HTML字符串
 * @param windowName - 弹窗的名称, 相同的名称会覆盖已打开的弹窗
 * @param isHtml - 是否为HTML内容（默认false，表示是URL）
 */
function openInPopup(
  urlOrHtml: string,
  windowName: string = "HHA_Search_Result",
  isHtml: boolean = false
): void {
  const windowFeatures: string =
    "width=1200,height=900,resizable=yes,scrollbars=yes,status=yes";

  if (isHtml) {
    // 使用 Blob URL 避免 data URL 的编码问题和长度限制
    const blob = new Blob([urlOrHtml], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const popup = window.open(blobUrl, windowName, windowFeatures);

    // 在新窗口加载后释放 Blob URL 以避免内存泄漏
    if (popup) {
      popup.addEventListener("load", () => {
        URL.revokeObjectURL(blobUrl);
      });
      // 备用清理：如果 load 事件未触发，5秒后自动清理
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } else {
      // 如果弹窗被阻止，立即清理
      URL.revokeObjectURL(blobUrl);
      console.warn("弹窗被浏览器阻止，请允许弹窗后重试");
    }
  } else {
    window.open(urlOrHtml, windowName, windowFeatures);
  }
}

/**
 * 解析 Aide (护工) 的搜索结果
 * @param html - HHAeXchange返回的Aide搜索结果页HTML字符串
 * @returns 一个包含搜索结果信息的对象
 */
function handleAideSearchResult(html: string): HhaSearchResult {
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
    // Fallback
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
        finalUrl: AIDE_PROFILE_URL_TEMPLATE.replace("{ID}", match[1]),
        rawHtml: html,
      };
    }
  }
  return { count: resultCount, rawHtml: html };
}

/**
 * 解析 Patient (病人) 的搜索结果
 *
 * 核心逻辑 (基于 ADR-005):
 * 1. 统计 Active 状态 (Active, Hospitalized) 的结果数量
 * 2. 如果 activeCount === 1 → 返回该 Active 结果的 profile URL
 * 3. 如果 activeCount === 0 且 totalCount === 1 → 返回唯一结果的 profile URL
 * 4. 其他情况 → 返回原始 HTML 让用户判断
 *
 * @param html - HHAeXchange返回的Patient搜索结果页HTML字符串
 * @returns 一个包含搜索结果信息的对象
 */
function handlePatientSearchResult(html: string): HhaSearchResult {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const resultsTable = doc.querySelector<HTMLTableElement>("#tdSearchResults");

  if (!resultsTable) {
    return { count: 0, activeCount: 0, rawHtml: html };
  }

  // 获取结果总数
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

  // 无结果
  if (resultCount === 0) {
    return { count: 0, activeCount: 0, rawHtml: html };
  }

  // 解析每一行，提取状态和 profile 链接
  interface RowInfo {
    row: Element;
    status: string;
    profileId: string | null;
  }

  const rowInfos: RowInfo[] = Array.from(resultRows).map((row) => {
    // 获取 Status（通常在特定列，通过检查行内容获取）
    const statusText = row.textContent || "";
    let status = "Unknown";

    // 检查所有已知状态
    for (const s of [...ACTIVE_STATUSES, ...NON_ACTIVE_STATUSES]) {
      // 使用单词边界匹配，避免部分匹配
      const regex = new RegExp(`\\b${s}\\b`, "i");
      if (regex.test(statusText)) {
        status = s;
        break;
      }
    }

    // 获取 profile ID
    const link = row.querySelector<HTMLAnchorElement>(
      'a[onclick*="RedirectToPatientPage"]'
    );
    const match = link
      ?.getAttribute("onclick")
      ?.match(/RedirectToPatientPage\((\d+)/);
    const profileId = match ? match[1] : null;

    return { row, status, profileId };
  });

  // 筛选 Active 状态的行
  const activeRows = rowInfos.filter((info) => isActiveStatus(info.status));
  const activeCount = activeRows.length;

  console.log(
    `[Patient Search] Total: ${resultCount}, Active: ${activeCount}`,
    rowInfos.map((r) => ({ status: r.status, id: r.profileId }))
  );

  // 核心决策逻辑
  // Case 1: 恰好 1 个 Active 结果 → 跳转
  if (activeCount === 1 && activeRows[0].profileId) {
    return {
      count: resultCount,
      activeCount: 1,
      finalUrl: PATIENT_PROFILE_URL_TEMPLATE.replace(
        "{ID}",
        activeRows[0].profileId
      ),
      rawHtml: html,
    };
  }

  // Case 2: 0 个 Active 结果，但总共只有 1 个结果 → 跳转
  if (activeCount === 0 && resultCount === 1 && rowInfos[0].profileId) {
    return {
      count: 1,
      activeCount: 0,
      finalUrl: PATIENT_PROFILE_URL_TEMPLATE.replace(
        "{ID}",
        rowInfos[0].profileId
      ),
      rawHtml: html,
    };
  }

  // Case 3: 其他情况 → 返回原始 HTML 让用户判断
  return { count: resultCount, activeCount, rawHtml: html };
}

/**
 * 创建一个上下分栏的HTML页面来同时显示两个搜索结果
 * 不使用 iframe，直接将内容嵌入到可滚动的 div 中
 * @param aideResult - Aide的搜索结果对象
 * @param patientResult - Patient的搜索结果对象
 */
function displayCombinedResults(
  aideResult: HhaSearchResult,
  patientResult: HhaSearchResult,
  phoneNumber: string = currentSearchPhone
): void {
  console.log("两边都有结果，创建合并视图...");

  /**
   * 使用 DOMParser 从原始 HTML 提取搜索结果表格及相关内容
   * 这是最稳定可靠的方法，不依赖字符串正则替换
   */
  const extractAndCleanContent = (
    html: string,
    type: "aide" | "patient"
  ): string => {
    const doc = new DOMParser().parseFromString(html, "text/html");

    // 找到搜索结果表格 - 尝试多种选择器
    let table = doc.querySelector<HTMLTableElement>("#tdSearchResults");
    if (!table) {
      // 备选：查找包含数据的表格
      table = doc.querySelector<HTMLTableElement>("table[id*='Search']");
    }
    if (!table) {
      // 再备选：查找 tbody 有内容的表格
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
      console.warn(`[${type}] HTML 前500字符:`, html.substring(0, 500));
      return `<p style="color: #666; padding: 20px;">未找到搜索结果</p>`;
    }

    // 在表格内移除不需要的元素（包括屏幕阅读器专用元素）
    const unwantedSelectors = [
      'a[id*="uxfrmSearchXSLT"]',
      'a[href*="uxfrmSearchXSLT"]',
      'form[id*="uxfrmSearch"]',
      'input[type="hidden"]',
      "script",
      ".show-for-sr", // 屏幕阅读器专用文字（如 "View Patient Details", "Patient Id"）
      '[class*="show-for-sr"]', // 匹配任何包含此类的元素
    ];
    unwantedSelectors.forEach((sel) => {
      table!.querySelectorAll(sel).forEach((el) => el.remove());
    });

    // 移除原始页面的标题行（如 "Caregiver search results (1)"）
    const captionRow = table.querySelector(
      'caption, tr.title-row, [class*="title"]'
    );
    if (captionRow) captionRow.remove();

    // 清理表头：移除 "sortable column head" 等多余文字
    table.querySelectorAll("th, thead td").forEach((th) => {
      const link = th.querySelector("a");
      if (link) {
        // 只保留链接的文字内容
        th.textContent = link.textContent?.trim() || "";
      } else {
        // 清理多余的空白、换行符和 "sortable column head"
        let text = th.textContent || "";
        text = text.replace(/sortable\s*column\s*head/gi, ""); // 移除这段文字
        text = text.replace(/[\r\n\t]+/g, " "); // 换行变空格
        text = text.replace(/\s+/g, " ").trim(); // 多空格变单空格
        th.textContent = text;
      }
    });

    // 清理数据单元格
    table.querySelectorAll("tbody td, tr td").forEach((td) => {
      // 已经通过 unwantedSelectors 移除了 .show-for-sr 元素
      // 现在清理文本节点中的多余空白
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

      // 移除空的 <br> 和多余换行
      td.querySelectorAll("br").forEach((br) => {
        if (!br.nextSibling || !br.nextSibling.textContent?.trim()) {
          br.remove();
        }
      });
    });

    // Aide 表格：移除空的 Action 列（最后一列）
    if (type === "aide") {
      const headerCells = table.querySelectorAll("thead tr th, thead tr td");
      const lastHeaderIndex = headerCells.length - 1;
      const lastHeader = headerCells[lastHeaderIndex];

      // 检查最后一列是否是 Action 且内容为空
      if (
        lastHeader &&
        lastHeader.textContent?.trim().toLowerCase() === "action"
      ) {
        // 检查所有数据行的最后一列是否都为空
        const rows = table.querySelectorAll("tbody tr");
        let allEmpty = true;
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          const lastCell = cells[cells.length - 1];
          if (lastCell && lastCell.textContent?.trim()) {
            allEmpty = false;
          }
        });

        if (allEmpty) {
          // 移除表头的 Action 列
          lastHeader.remove();
          // 移除每行的最后一列
          rows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            const lastCell = cells[cells.length - 1];
            if (lastCell) lastCell.remove();
          });
        }
      }
    }

    // 构建输出（不再需要额外标题，因为 panel-header 已经显示了）
    return table.outerHTML;
  };

  // 直接从原始 HTML 提取内容（不做字符串级别的清理，避免破坏 DOM）
  let aideBody = extractAndCleanContent(aideResult.rawHtml, "aide");
  let patientBody = extractAndCleanContent(patientResult.rawHtml, "patient");

  // 高亮电话号码
  aideBody = highlightPhoneNumber(aideBody, phoneNumber);
  patientBody = highlightPhoneNumber(patientBody, phoneNumber);

  const combinedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HHA Combined Search Results</title>
  <style>
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
      padding: 10px;
      background-color: #fff;
    }
    /* 在 panel-content 内部应用的样式 */
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
    /* 确保表头内的链接也是白色 */
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
    /* 隐藏不需要的元素 */
    .panel-content a[href*="uxfrmSearchXSLT"],
    .panel-content a[id*="uxfrmSearchXSLT"],
    .panel-content form[id*="uxfrmSearch"] {
      display: none !important;
    }
    /* 分页样式 */
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
    /* 电话高亮 */
    .panel-content span[style*="background-color: #ffff00"] {
      background-color: #ffff00 !important;
      padding: 1px 3px !important;
      border-radius: 2px !important;
      font-weight: bold !important;
    }
  </style>
  <script>
    function RedirectToAidePage(id) {
      window.open('${AIDE_PROFILE_URL_TEMPLATE}'.replace('{ID}', id), '_blank');
    }
    function RedirectToPatientPage(id) {
      window.open('${PATIENT_PROFILE_URL_TEMPLATE}'.replace('{ID}', id), '_blank');
    }
  </script>
</head>
<body>
  <div class="container">
    <div class="panel">
      <h2 class="panel-header">Caregiver (护工) 搜索结果 (${
        aideResult.count
      } 条)</h2>
      <div class="panel-content">${aideBody}</div>
    </div>
    <div class="panel">
      <h2 class="panel-header">Patient (病人) 搜索结果 (${
        patientResult.count
      } 条${
    patientResult.activeCount !== undefined
      ? `, Active: ${patientResult.activeCount}`
      : ""
  })</h2>
      <div class="panel-content">${patientBody}</div>
    </div>
  </div>
</body>
</html>`;

  openInPopup(combinedHtml, "HHA_Combined_Result", true);
}

/**
 * 通用的后台搜索函数, 使用 GM_fetch
 * @param type - 搜索类型, 'aide' 或 'patient'
 * @param formattedNumber - 格式化后的电话号码
 * @returns 一个解析后的搜索结果对象的 Promise
 */
async function fetchHhaData(
  type: "aide" | "patient",
  formattedNumber: string
): Promise<HhaSearchResult> {
  let baseUrl: string,
    params: string,
    handler: (html: string) => HhaSearchResult;
  if (type === "aide") {
    [baseUrl, params, handler] = [
      AIDE_SEARCH_URL,
      AIDE_SEARCH_PARAMS,
      handleAideSearchResult,
    ];
  } else {
    [baseUrl, params, handler] = [
      PATIENT_SEARCH_URL,
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
      result.searchUrl = searchUrl; // 保存原始搜索URL
      return result;
    }
    console.error(`HHA ${type} search failed with status: ${r.status}`);
    return { count: 0, rawHtml: `Request Failed: ${r.status}` };
  } catch (error) {
    console.error(`HHA ${type} search network error:`, error);
    return { count: 0, rawHtml: "Network Error" };
  }
}

/**
 * 核心调度函数：提取号码并发起并行搜索, 然后根据结果决定如何显示
 * @param callInfoPanel - 包含电话号码信息的DOM元素
 * @returns 如果成功发起搜索则返回 true, 否则返回 false
 */
async function extractAndInitiateSearch(
  callInfoPanel: HTMLElement
): Promise<boolean> {
  const numElement = callInfoPanel?.querySelector<HTMLElement>(
    PHONE_NUMBER_CONTAINER_SELECTOR
  );
  if (numElement && !numElement.textContent?.includes("ext:")) {
    const formattedNumber = formatPhoneNumber(numElement.textContent);
    if (formattedNumber) {
      // 保存当前搜索号码用于高亮显示
      currentSearchPhone = formattedNumber;
      console.log(`号码 ${formattedNumber}, 开始并行搜索 Aide 和 Patient...`);
      const [aideResult, patientResult] = await Promise.all([
        fetchHhaData("aide", formattedNumber),
        fetchHhaData("patient", formattedNumber),
      ]);

      const hasAideResult = aideResult.count > 0;
      const hasPatientResult = patientResult.count > 0;

      if (hasAideResult && !hasPatientResult) {
        // 只有 Aide 结果
        if (aideResult.count === 1 && aideResult.finalUrl) {
          openInPopup(aideResult.finalUrl);
        } else {
          // 多个结果：处理 HTML 后显示（高亮 + 点击跳转）
          const processedHtml = processHtmlForDisplay(
            aideResult.rawHtml,
            "aide",
            formattedNumber
          );
          openInPopup(processedHtml, "HHA_Search_Result", true);
        }
      } else if (!hasAideResult && hasPatientResult) {
        // 只有 Patient 结果
        if (patientResult.finalUrl) {
          // finalUrl 存在说明已定位到唯一结果
          openInPopup(patientResult.finalUrl);
        } else {
          // 多个结果：处理 HTML 后显示（高亮 + 点击跳转）
          const processedHtml = processHtmlForDisplay(
            patientResult.rawHtml,
            "patient",
            formattedNumber
          );
          openInPopup(processedHtml, "HHA_Search_Result", true);
        }
      } else if (hasAideResult && hasPatientResult) {
        displayCombinedResults(aideResult, patientResult, formattedNumber);
      } else {
        alert(
          `电话号码 [${formattedNumber}] 在 HHAeXchange 中未找到对应的护工或病人。`
        );
      }
      return true;
    }
  }
  return false;
}

// 按钮文本常量
const SEARCH_BTN_TEXT_DEFAULT = "在HHA中搜索此号码 (Aide & Patient)";
const SEARCH_BTN_TEXT_SEARCHING = "⏳ 正在HHA中搜索...";

/**
 * 设置搜索按钮的状态（搜索中/默认）
 * @param button - 搜索按钮元素
 * @param isSearching - 是否正在搜索
 */
function setSearchButtonState(
  button: HTMLButtonElement,
  isSearching: boolean
): void {
  button.textContent = isSearching
    ? SEARCH_BTN_TEXT_SEARCHING
    : SEARCH_BTN_TEXT_DEFAULT;
  button.disabled = isSearching;
  button.style.opacity = isSearching ? "0.7" : "1";
  button.style.cursor = isSearching ? "not-allowed" : "pointer";
}

/**
 * 在通话信息面板中注入一个手动搜索按钮
 * @param callInfoPanel - 将要注入按钮的目标DOM元素
 * @param isSearching - 初始状态是否为"搜索中"
 * @returns 创建的按钮元素，如果已存在则返回已存在的按钮
 */
function injectManualSearchButton(
  callInfoPanel: HTMLElement,
  isSearching: boolean = false
): HTMLButtonElement {
  // 检查是否已存在按钮
  const existingButton = callInfoPanel.querySelector<HTMLButtonElement>(
    ".manual-search-btn-hha"
  );
  if (existingButton) return existingButton;

  const button = document.createElement("button");
  button.className = "manual-search-btn-hha";
  setSearchButtonState(button, isSearching);

  button.addEventListener("click", async (e: MouseEvent) => {
    e.stopPropagation();
    if (button.disabled) return; // 如果按钮已禁用，不执行任何操作

    setSearchButtonState(button, true);
    const success = await extractAndInitiateSearch(callInfoPanel);
    if (!success) alert("未能在当前通话信息中找到有效的外部电话号码！");
    setSearchButtonState(button, false);
  });

  const header = callInfoPanel.querySelector<HTMLElement>(".call-info-header");
  header
    ? header.insertAdjacentElement("afterend", button)
    : callInfoPanel.prepend(button);

  return button;
}

/**
 * 监视主面板的变化, 以触发自动搜索或注入按钮
 * @param mainPanel - 要监视的主内容区DOM元素
 */
function observeMainPanel(mainPanel: HTMLElement): void {
  const observer = new MutationObserver(
    async (mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (mutation.addedNodes.length > 0) {
          const callInfoPanel = mainPanel.querySelector<HTMLElement>(
            CALL_INFO_PANEL_SELECTOR
          );
          if (
            callInfoPanel &&
            !callInfoPanel.hasAttribute("data-hha-processed")
          ) {
            callInfoPanel.setAttribute("data-hha-processed", "true");

            if (lastCallWasIncoming) {
              // 先注入按钮，显示"搜索中"状态
              const button = injectManualSearchButton(callInfoPanel, true);
              // 执行自动搜索
              await extractAndInitiateSearch(callInfoPanel);
              // 搜索完成后，将按钮恢复为默认状态
              setSearchButtonState(button, false);
              lastCallWasIncoming = false;
            } else {
              // 非来电情况，注入默认状态的按钮
              injectManualSearchButton(callInfoPanel, false);
            }
          }
        }
      }
    }
  );
  observer.observe(mainPanel, { childList: true, subtree: true });
}

/**
 * 监视来电通知 (Toast) 的出现
 * @param toastContainer - 包含通知的DOM元素容器
 */
function observeToasts(toastContainer: HTMLElement): void {
  const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
    mutationsList.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement && node.matches(TOAST_TOAST_SELECTOR)) {
          const callState = node
            .querySelector<HTMLElement>(CALL_STATE_SELECTOR)
            ?.textContent?.trim();
          if (callState === "Incoming") {
            lastCallWasIncoming = true; // 只在这里设置flag为true
            node
              .querySelector<HTMLElement>(TOAST_TOAST_WRAPPER_SELECTOR)
              ?.click();
          }
        }
      });
    });
  });
  observer.observe(toastContainer, { childList: true });
}

/**
 * 等待页面上某个元素加载完成
 * @param selector - 元素的CSS选择器
 * @returns 返回一个Promise, resolve时提供找到的元素
 */
function waitForElement<T extends HTMLElement>(selector: string): Promise<T> {
  return new Promise((resolve) => {
    const el = document.querySelector<T>(selector);
    if (el) return resolve(el);
    const observer = new MutationObserver(() => {
      const el = document.querySelector<T>(selector);
      if (el) {
        resolve(el);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

/**
 * 通过电话号码搜索 HHA (供外部模块调用)
 * @param phoneNumber - 电话号码字符串 (任意格式，会自动格式化)
 * @returns 是否成功发起搜索
 */
export async function searchHhaByPhone(phoneNumber: string): Promise<boolean> {
  const formattedNumber = formatPhoneNumber(phoneNumber);
  if (!formattedNumber) {
    alert(`无效的电话号码格式: ${phoneNumber}`);
    return false;
  }

  // 保存当前搜索号码用于高亮显示
  currentSearchPhone = formattedNumber;
  console.log(`[HHA Search] 外部调用: ${formattedNumber}, 开始并行搜索...`);

  const [aideResult, patientResult] = await Promise.all([
    fetchHhaData("aide", formattedNumber),
    fetchHhaData("patient", formattedNumber),
  ]);

  const hasAideResult = aideResult.count > 0;
  const hasPatientResult = patientResult.count > 0;

  if (hasAideResult && !hasPatientResult) {
    if (aideResult.count === 1 && aideResult.finalUrl) {
      openInPopup(aideResult.finalUrl);
    } else {
      const processedHtml = processHtmlForDisplay(
        aideResult.rawHtml,
        "aide",
        formattedNumber
      );
      openInPopup(processedHtml, "HHA_Search_Result", true);
    }
  } else if (!hasAideResult && hasPatientResult) {
    if (patientResult.finalUrl) {
      openInPopup(patientResult.finalUrl);
    } else {
      const processedHtml = processHtmlForDisplay(
        patientResult.rawHtml,
        "patient",
        formattedNumber
      );
      openInPopup(processedHtml, "HHA_Search_Result", true);
    }
  } else if (hasAideResult && hasPatientResult) {
    displayCombinedResults(aideResult, patientResult, formattedNumber);
  } else {
    alert(
      `电话号码 [${formattedNumber}] 在 HHAeXchange 中未找到对应的护工或病人。`
    );
  }
  return true;
}

export const incomingCallHandler = async (): Promise<void> => {
  console.log("HHAeXchange 电话助手 v5.5 (HTML清理+分页样式优化) 已启动。");
  const toastContainer = await waitForElement<HTMLDivElement>(
    TOAST_CONTAINER_SELECTOR
  );
  const mainContent = await waitForElement<HTMLDivElement>(
    MAIN_CONTENT_SELECTOR
  );
  console.log("关键元素已找到，正在启动监视器...");
  observeToasts(toastContainer);
  observeMainPanel(mainContent);
};
