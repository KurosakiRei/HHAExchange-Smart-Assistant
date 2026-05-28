import {
  formatPhoneNumber,
  openInPopup,
  fetchHhaData,
  fetchAllPages,
  displayCombinedResults,
  displaySingleResult,
  getQuickSearchTenantState,
} from "./services/HhaSearchService";
import {
  TOAST_CONTAINER_SELECTOR,
  TOAST_TOAST_SELECTOR,
  TOAST_TOAST_WRAPPER_SELECTOR,
  CALL_STATE_SELECTOR,
  MAIN_CONTENT_SELECTOR,
  CALL_INFO_PANEL_SELECTOR,
  PHONE_NUMBER_CONTAINER_SELECTOR,
} from "../utils/templates&const";
// ==================== 状态变量 ====================

let lastCallWasIncoming: boolean = false;

/** 当前搜索的电话号码（用于高亮显示） */
let currentSearchPhone: string = "";

const HHA_HIGHLIGHT_ID_PATTERN = /^(?:AHC|AMD)-\d{4,6}$/;
const HHA_SEARCH_TOAST_ID = "hha-highlight-search-toast";
const HHA_SEARCH_TOAST_LIFETIME_MS = 2600;

type SearchToastType = "success" | "info" | "warning" | "error";

function showHighlightSearchToast(
  message: string,
  type: SearchToastType = "info"
): void {
  const existing = document.getElementById(HHA_SEARCH_TOAST_ID);
  if (existing) {
    existing.remove();
  }

  const colors: Record<SearchToastType, string> = {
    success: "#1f8f4c",
    info: "#1769aa",
    warning: "#b66a00",
    error: "#b3261e",
  };

  const toast = document.createElement("div");
  toast.id = HHA_SEARCH_TOAST_ID;
  toast.textContent = message;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%) translateY(-8px)";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 180ms ease, transform 180ms ease";
  toast.style.padding = "10px 14px";
  toast.style.borderRadius = "8px";
  toast.style.backgroundColor = colors[type];
  toast.style.color = "#ffffff";
  toast.style.fontSize = "13px";
  toast.style.fontWeight = "500";
  toast.style.boxShadow = "0 8px 22px rgba(0, 0, 0, 0.25)";
  toast.style.zIndex = "2147483646";
  toast.style.pointerEvents = "none";

  document.body.appendChild(toast);

  window.requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(-8px)";
    window.setTimeout(() => toast.remove(), 220);
  }, HHA_SEARCH_TOAST_LIFETIME_MS);
}

function normalizeHhaSearchId(rawId: string): string | null {
  const normalized = rawId.trim().toUpperCase();
  if (!HHA_HIGHLIGHT_ID_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
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
          // 多个结果：使用干净的单面板展示
          displaySingleResult(aideResult, "aide", formattedNumber);
        }
      } else if (!hasAideResult && hasPatientResult) {
        // 只有 Patient 结果
        if (patientResult.finalUrl) {
          // finalUrl 存在说明已定位到唯一结果
          openInPopup(patientResult.finalUrl);
        } else {
          // 多个结果：使用干净的单面板展示
          displaySingleResult(patientResult, "patient", formattedNumber);
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
const SEARCH_BTN_TEXT_DEFAULT = "在HHA中搜索此号码";
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
      displaySingleResult(aideResult, "aide", formattedNumber);
    }
  } else if (!hasAideResult && hasPatientResult) {
    if (patientResult.finalUrl) {
      openInPopup(patientResult.finalUrl);
    } else {
      displaySingleResult(patientResult, "patient", formattedNumber);
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

/**
 * 通过 AHC/AMD ID 搜索 HHA（供 Highlight2Call 调用）
 */
export async function searchHhaById(rawId: string): Promise<boolean> {
  const normalizedId = normalizeHhaSearchId(rawId);
  if (!normalizedId) {
    showHighlightSearchToast(
      `ID 格式无效：${rawId}（仅支持 AHC/AMD-后4到6位数字，如 AHC-1234）`,
      "warning"
    );
    return false;
  }

  const tenantState = getQuickSearchTenantState();
  if (!tenantState.baseUrl && tenantState.source === "missing") {
    showHighlightSearchToast(
      tenantState.message || "请先打开一次 HHA 页面同步租户信息。",
      "warning"
    );
    return false;
  }

  try {
    console.log(`[HHA Search] 外部ID调用: ${normalizedId}, 开始并行搜索...`);
    const [aideResult, patientResult] = await Promise.all([
      fetchAllPages("aide", { id: normalizedId }),
      fetchAllPages("patient", { id: normalizedId }),
    ]);

    const hasAideResult = aideResult.count > 0;
    const hasPatientResult = patientResult.count > 0;

    if (hasAideResult && hasPatientResult) {
      displayCombinedResults(aideResult, patientResult, "");
    } else if (hasAideResult) {
      displaySingleResult(aideResult, "aide", "");
    } else if (hasPatientResult) {
      displaySingleResult(patientResult, "patient", "");
    } else {
      showHighlightSearchToast(
        `ID [${normalizedId}] 在 HHAeXchange 中未找到对应的护工或病人。`,
        "info"
      );
    }

    return true;
  } catch (error) {
    console.error("[HHA Search] ID search failed:", error);
    showHighlightSearchToast("ID 搜索失败，请稍后重试。", "error");
    return false;
  }
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
