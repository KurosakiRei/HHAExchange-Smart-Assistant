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

// 为搜索结果定义一个标准接口
interface HhaSearchResult {
  count: number;
  finalUrl?: string; // 最终的个人主页URL，可选
  rawHtml: string;
}

// --- 配置区域 (请根据需要修改) ---
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

// --- 脚本核心逻辑 ---
let lastCallWasIncoming: boolean = false;

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
 * 以弹窗形式打开一个URL
 * @param url - 要打开的网址
 * @param windowName - 弹窗的名称, 相同的名称会覆盖已打开的弹窗
 */
function openInPopup(
  url: string,
  windowName: string = "HHA_Search_Result"
): void {
  const windowFeatures: string =
    "width=1200,height=900,resizable=yes,scrollbars=yes,status=yes";
  window.open(url, windowName, windowFeatures);
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
 * 解析 Patient (病人) 的搜索结果, 包含特殊过滤逻辑
 * @param html - HHAeXchange返回的Patient搜索结果页HTML字符串
 * @returns 一个包含搜索结果信息的对象
 */
function handlePatientSearchResult(html: string): HhaSearchResult {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const resultsTable = doc.querySelector<HTMLTableElement>("#tdSearchResults");
  if (!resultsTable) return { count: 0, rawHtml: html };

  let resultCount: number = -1;
  const heading = doc.querySelector<HTMLHeadingElement>("h2");
  if (heading) {
    const match = heading.textContent?.match(/\((\d+)\)/);
    if (match && match[1]) resultCount = parseInt(match[1], 10);
  }

  const resultRows = resultsTable.querySelectorAll("tbody tr");
  if (resultCount === -1) {
    // Fallback
    resultCount = resultRows.length;
  }

  if (resultCount === 1 && resultRows.length === 1) {
    const link = resultRows[0].querySelector<HTMLAnchorElement>(
      'a[onclick*="RedirectToPatientPage"]'
    );
    const match = link
      ?.getAttribute("onclick")
      ?.match(/RedirectToPatientPage\((\d+)/);
    if (match && match[1]) {
      return {
        count: 1,
        finalUrl: PATIENT_PROFILE_URL_TEMPLATE.replace("{ID}", match[1]),
        rawHtml: html,
      };
    }
  } else if (resultCount === 2 && resultRows.length === 2) {
    const activeRows = Array.from(resultRows).filter(
      (row) => !row.textContent?.includes("Waiting")
    );
    if (activeRows.length === 1) {
      const link = activeRows[0].querySelector<HTMLAnchorElement>(
        'a[onclick*="RedirectToPatientPage"]'
      );
      const match = link
        ?.getAttribute("onclick")
        ?.match(/RedirectToPatientPage\((\d+)/);
      if (match && match[1]) {
        return {
          count: 1,
          finalUrl: PATIENT_PROFILE_URL_TEMPLATE.replace("{ID}", match[1]),
          rawHtml: html,
        };
      }
    }
  }
  return { count: resultCount, rawHtml: html };
}

/**
 * 创建一个上下分栏的HTML页面来同时显示两个搜索结果
 * @param aideResult - Aide的搜索结果对象
 * @param patientResult - Patient的搜索结果对象
 */
function displayCombinedResults(
  aideResult: HhaSearchResult,
  patientResult: HhaSearchResult
): void {
  console.log("两边都有结果，创建合并视图...");
  const combinedHtml = `
        <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>HHA Combined Search Results</title>
            <style>
                body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: sans-serif; }
                .container { display: flex; flex-direction: column; height: 100%; }
                .panel { flex: 1; border: 1px solid #ccc; overflow: hidden; display: flex; flex-direction: column; }
                .panel h2 { margin: 0; padding: 10px; background-color: #f0f0f0; border-bottom: 1px solid #ccc; font-size: 16px; }
                .panel iframe { flex-grow: 1; border: none; width: 100%; height: 100%; }
            </style>
        </head><body>
            <div class="container">
                <div class="panel">
                    <h2>Aide (护工) 搜索结果 (${aideResult.count} a result)</h2>
                    <iframe srcdoc="${aideResult.rawHtml.replace(
                      /"/g,
                      "&quot;"
                    )}"></iframe>
                </div>
                <div class="panel">
                    <h2>Patient (病人) 搜索结果 (${
                      patientResult.count
                    } a result)</h2>
                    <iframe srcdoc="${patientResult.rawHtml.replace(
                      /"/g,
                      "&quot;"
                    )}"></iframe>
                </div>
            </div>
        </body></html>`;
  openInPopup(
    `data:text/html;charset=utf-8,${encodeURIComponent(combinedHtml)}`,
    "HHA_Combined_Result"
  );
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
      return handler(html);
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
      console.log(`号码 ${formattedNumber}, 开始并行搜索 Aide 和 Patient...`);
      const [aideResult, patientResult] = await Promise.all([
        fetchHhaData("aide", formattedNumber),
        fetchHhaData("patient", formattedNumber),
      ]);

      const hasAideResult = aideResult.count > 0;
      const hasPatientResult = patientResult.count > 0;

      if (hasAideResult && !hasPatientResult) {
        aideResult.count === 1 && aideResult.finalUrl
          ? openInPopup(aideResult.finalUrl)
          : openInPopup(
              `data:text/html;charset=utf-8,${encodeURIComponent(
                aideResult.rawHtml
              )}`
            );
      } else if (!hasAideResult && hasPatientResult) {
        patientResult.count === 1 && patientResult.finalUrl
          ? openInPopup(patientResult.finalUrl)
          : openInPopup(
              `data:text/html;charset=utf-8,${encodeURIComponent(
                patientResult.rawHtml
              )}`
            );
      } else if (hasAideResult && hasPatientResult) {
        displayCombinedResults(aideResult, patientResult);
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
  console.log("HHAeXchange 电话助手 v4.2 (并行搜索/TS/注释版) 已启动。");
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
