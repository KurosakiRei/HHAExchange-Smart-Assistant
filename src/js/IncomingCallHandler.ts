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
  "&LastName=&Type=-1&Discipline=-1&CaregiverCode=&ALtCaregiverCode=&Status=1&SSN=&CaregiverTeamID=-1&FromVisitEdit=0&CaregiverLocationID=-1&CaregiverBranchID=-1&VisitDate=&office=469,5137,5139,6475,14849&DOB=&pg=1&sort=&ord=ASC&FromPage=";
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
 * 处理 HTML: 高亮电话号码 + 注入重定向脚本
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
 * 使用 Blob URL 避免 srcdoc 的编码问题
 * @param aideResult - Aide的搜索结果对象
 * @param patientResult - Patient的搜索结果对象
 */
function displayCombinedResults(
  aideResult: HhaSearchResult,
  patientResult: HhaSearchResult,
  phoneNumber: string = currentSearchPhone
): void {
  console.log("两边都有结果，创建合并视图...");

  // 处理 HTML: 高亮电话号码 + 注入重定向脚本
  const processedAideHtml = processHtmlForDisplay(
    aideResult.rawHtml,
    "aide",
    phoneNumber
  );
  const processedPatientHtml = processHtmlForDisplay(
    patientResult.rawHtml,
    "patient",
    phoneNumber
  );

  // 为每个结果创建 Blob URL
  const aideBlob = new Blob([processedAideHtml], {
    type: "text/html;charset=utf-8",
  });
  const patientBlob = new Blob([processedPatientHtml], {
    type: "text/html;charset=utf-8",
  });
  const aideBlobUrl = URL.createObjectURL(aideBlob);
  const patientBlobUrl = URL.createObjectURL(patientBlob);

  const combinedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HHA Combined Search Results</title>
  <style>
    body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: sans-serif; }
    .container { display: flex; flex-direction: column; height: 100%; }
    .panel { flex: 1; border: 1px solid #ccc; overflow: hidden; display: flex; flex-direction: column; }
    .panel h2 { margin: 0; padding: 10px; background-color: #f0f0f0; border-bottom: 1px solid #ccc; font-size: 16px; }
    .panel iframe { flex-grow: 1; border: none; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="panel">
      <h2>Aide (护工) 搜索结果 (${aideResult.count} 条)</h2>
      <iframe src="${aideBlobUrl}"></iframe>
    </div>
    <div class="panel">
      <h2>Patient (病人) 搜索结果 (${patientResult.count} 条${
    patientResult.activeCount !== undefined
      ? `, Active: ${patientResult.activeCount}`
      : ""
  })</h2>
      <iframe src="${patientBlobUrl}"></iframe>
    </div>
  </div>
  <script>
    // 页面加载完成后清理 Blob URLs
    window.addEventListener('load', function() {
      setTimeout(function() {
        URL.revokeObjectURL('${aideBlobUrl}');
        URL.revokeObjectURL('${patientBlobUrl}');
      }, 1000);
    });
  </script>
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

/**
 * 在通话信息面板中注入一个手动搜索按钮
 * @param callInfoPanel - 将要注入按钮的目标DOM元素
 */
function injectManualSearchButton(callInfoPanel: HTMLElement): void {
  if (callInfoPanel.querySelector(".manual-search-btn-hha")) return;
  const button = document.createElement("button");
  button.textContent = "在HHA中搜索此号码 (Aide & Patient)";
  button.className = "manual-search-btn-hha";
  button.addEventListener("click", async (e: MouseEvent) => {
    e.stopPropagation();
    button.textContent = "正在搜索...";
    const success = await extractAndInitiateSearch(callInfoPanel);
    if (!success) alert("未能在当前通话信息中找到有效的外部电话号码！");
    button.textContent = "在HHA中搜索此号码 (Aide & Patient)";
  });
  const header = callInfoPanel.querySelector<HTMLElement>(".call-info-header");
  header
    ? header.insertAdjacentElement("afterend", button)
    : callInfoPanel.prepend(button);
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
              await extractAndInitiateSearch(callInfoPanel);
              lastCallWasIncoming = false; // 在此处消费并重置flag，解决竞态条件
            }
            injectManualSearchButton(callInfoPanel);
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

export const incomingCallHandler = async (): Promise<void> => {
  console.log("HHAeXchange 电话助手 v5.1 (高亮电话号码/点击跳转修复) 已启动。");
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
