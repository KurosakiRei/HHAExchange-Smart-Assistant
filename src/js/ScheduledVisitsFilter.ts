import { assignIntervalTimer } from "../utils/util";

// ============================================================================
// Epic 15: Scheduled Visits With Temp Aide Coordinator Filter 悬停过滤功能
// ============================================================================

interface CoordinatorOption {
  CoordinatorID: string;
  CoordinatorName: string;
}

interface ScheduledVisitsConfig {
  coordinatorID: string;
  coordinatorText: string;
}

const CONFIG_KEY = "hha_scheduled_visits_config";
let isCardVisible = false;

// Default configuration fallback
const DEFAULT_CONFIG: ScheduledVisitsConfig = {
  coordinatorID: "-1",
  coordinatorText: "All",
};

/**
 * 获取业务工作日（跳过周末）
 * 如果今天是周五，加 3 天；如果是周六，加 2 天；平时加 1 天。
 */
export function getNextBusinessDay(date: Date): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay();

  if (dayOfWeek === 5) {
    // Friday -> Monday
    result.setDate(result.getDate() + 3);
  } else if (dayOfWeek === 6) {
    // Saturday -> Monday
    result.setDate(result.getDate() + 2);
  } else {
    // Other days -> Next day
    result.setDate(result.getDate() + 1);
  }
  return result;
}

/**
 * 格式化日期为 MM/DD/YYYY 以适配 ASP.NET 控件
 */
export function formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * 检查当前页面是否为目标页面
 */
export function isScheduledVisitsPage(): boolean {
  const url = window.location.href.toLowerCase();
  return (
    url.includes("scheduledvisitswithtempaide.aspx") ||
    url.includes("reportname=scheduledvisitswithtempaide")
  );
}

function getStoredConfig(): ScheduledVisitsConfig {
  if (typeof GM_getValue === "function") {
    try {
      const stored = GM_getValue(CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("[ScheduledVisits] Failed to parse config:", e);
    }
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: ScheduledVisitsConfig) {
  if (typeof GM_setValue === "function") {
    try {
      GM_setValue(CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("[ScheduledVisits] Failed to save config:", e);
    }
  }
}

function getCoordinatorsFromDOM(): CoordinatorOption[] {
  // 直接从页面的 DOM 中提取 options
  const select = document.getElementById(
    "ctl00_ContentPlaceHolder1_uxddlCordinator"
  ) as HTMLSelectElement;
  if (!select) return [];

  const options: CoordinatorOption[] = [];
  for (let i = 0; i < select.options.length; i++) {
    const opt = select.options[i];
    // 可选：跳过无效节点，根据实际报表表现。
    options.push({
      CoordinatorID: opt.value,
      CoordinatorName: opt.text,
    });
  }
  return options;
}

/**
 * 渲染选项列表
 */
function renderCoordinatorList(
  options: CoordinatorOption[],
  selectedId: string
): void {
  const container = document.getElementById("sv-coordinator-options");
  if (!container) return;

  container.innerHTML = "";

  if (options.length === 0) {
    container.innerHTML =
      '<div class="no-results">⚠️ No coordinators found on page</div>';
    return;
  }

  options.forEach((opt) => {
    const checked =
      String(opt.CoordinatorID) === String(selectedId) ? "checked" : "";
    const div = document.createElement("div");
    div.className = "coordinator-option";
    div.setAttribute("data-coordinator-id", opt.CoordinatorID);
    div.setAttribute("data-coordinator-name", opt.CoordinatorName);
    div.innerHTML = `
      <input type="radio" 
             name="sv-coordinator" 
             id="sv-coord-${opt.CoordinatorID}" 
             value="${opt.CoordinatorID}"
             aria-label="${opt.CoordinatorName}"
             ${checked}>
      <label class="coordinator-label" for="sv-coord-${opt.CoordinatorID}">
        ${opt.CoordinatorName}
      </label>
    `;
    container.appendChild(div);
  });
}

/**
 * 绑定搜索过滤功能
 */
function initCoordinatorSearch(): void {
  const searchInput = document.getElementById(
    "sv-coordinator-search"
  ) as HTMLInputElement;
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    const options = document.querySelectorAll(
      "#sv-coordinator-options .coordinator-option"
    );
    let visibleCount = 0;

    options.forEach((option) => {
      const name = option.getAttribute("data-coordinator-name") || "";
      if (name.toLowerCase().includes(query)) {
        option.classList.remove("hidden");
        visibleCount++;
      } else {
        option.classList.add("hidden");
      }
    });

    const container = document.getElementById("sv-coordinator-options");
    if (container) {
      const noResults = container.querySelector(".no-results");
      if (visibleCount === 0 && !noResults) {
        const div = document.createElement("div");
        div.className = "no-results";
        div.textContent = "🔍 No coordinators found";
        container.appendChild(div);
      } else if (visibleCount > 0 && noResults) {
        noResults.remove();
      }
    }
  });
}

function updateButtonText(btn: HTMLElement, text: string): void {
  const words = text.split(/\s+/);
  const shortName = words.slice(0, 2).join(" ");
  (btn as HTMLInputElement).value = `Search: ${shortName}`;
}

function hideConfigCard(): void {
  const card = document.getElementById("homepage-config-card");
  if (card) {
    card.classList.remove("show");
    setTimeout(() => {
      card.style.display = "none";
    }, 200);
  }
  isCardVisible = false;
}

function showConfigCard(): void {
  const card = document.getElementById("homepage-config-card");
  if (!card) return;

  const config = getStoredConfig();
  const options = getCoordinatorsFromDOM();
  renderCoordinatorList(options, config.coordinatorID);

  card.style.display = "block";
  // Trigger reflow for transition
  void card.offsetWidth;
  card.classList.add("show");

  const searchInput = document.getElementById(
    "sv-coordinator-search"
  ) as HTMLInputElement;
  if (searchInput) {
    searchInput.focus();
  }

  isCardVisible = true;
}

function handleSaveConfiguration(): void {
  const selectedRadio = document.querySelector(
    'input[name="sv-coordinator"]:checked'
  ) as HTMLInputElement;

  if (!selectedRadio) {
    alert("⚠️ Please select a coordinator before saving.");
    return;
  }

  const coordinatorID = selectedRadio.value;
  const optionDiv = selectedRadio.closest(".coordinator-option");
  const coordinatorText =
    optionDiv?.getAttribute("data-coordinator-name") || "Unknown";

  saveConfig({ coordinatorID, coordinatorText });

  const mainBtn = document.getElementById(
    "scheduledVisitsSelectorBtn"
  ) as HTMLInputElement;
  if (mainBtn) updateButtonText(mainBtn, coordinatorText);

  hideConfigCard();
}

/**
 * 核心自动填表及提交逻辑
 */
function executeSearchLogic(): void {
  const config = getStoredConfig();
  const coordinatorID = config.coordinatorID;

  if (coordinatorID === "-1" || !coordinatorID) {
    alert(
      "⚠️ Please configure a coordinator first (hover over the button and save)."
    );
    return;
  }
  // 1. 设置 Coordinator
  const coordinatorSelect = document.getElementById(
    "ctl00_ContentPlaceHolder1_uxddlCordinator"
  ) as HTMLSelectElement;

  if (coordinatorSelect) {
    coordinatorSelect.value = coordinatorID;
    // jQuery change (if bound) or native change
    coordinatorSelect.dispatchEvent(new Event("change"));
  }

  // 2. 设置 Dates
  const today = new Date();
  const nextBizDay = getNextBusinessDay(today);

  const fromDateInput = document.getElementById(
    "ctl00_ContentPlaceHolder1_uxDtFromDate"
  ) as HTMLInputElement;
  const toDateInput = document.getElementById(
    "ctl00_ContentPlaceHolder1_uxDtToDate"
  ) as HTMLInputElement;

  if (fromDateInput) fromDateInput.value = formatDate(today);
  if (toDateInput) toDateInput.value = formatDate(nextBizDay);

  // 3. 点击 View Report
  const viewReportBtn = document.getElementById(
    "ctl00_ContentPlaceHolder1_btnViewReport"
  ) as HTMLInputElement | HTMLButtonElement;

  if (viewReportBtn) {
    setTimeout(() => {
      viewReportBtn.click();
    }, 100);
  } else {
    console.error("[ScheduledVisits] Native 'View Report' button not found!");
  }
}

/**
 * 初始化 DOM 和样式结构
 */
export function initScheduledVisitsConfigCardUI(): void {
  // 设定一个轮询以应对 ASP.NET UpdatePanel 的 Partial Postback 擦除 DOM
  setInterval(() => {
    if (!isScheduledVisitsPage()) return;
    if (document.getElementById("sv-config-wrapper")) return;

    const viewReportBtn = document.getElementById(
      "ctl00_ContentPlaceHolder1_btnViewReport"
    );
    if (!viewReportBtn || !viewReportBtn.parentNode) return;

    const config = getStoredConfig();

    // 1. 生成卡片 HTML (完全复用 HomePage CSS 的 ID和结构)
    // CRITICAL: 必须添加 type="button"，否则 ASP.NET 会当成默认的 form submit 刷新整个页面
    const cardHtml = `
            <div id="homepage-config-card" role="dialog" aria-label="Coordinator Selection" style="display: none;">
              <div class="config-card-header">
                <h3>🔍 Search by Coordinator 配置</h3>
                <button type="button" class="config-close-btn" id="sv-config-close" aria-label="Close configuration">×</button>
              </div>
              <div class="config-card-body">
                <label for="sv-coordinator-search">选择 Coordinator:</label>
                <input type="text" 
                       id="sv-coordinator-search" 
                       class="config-search-input" 
                       placeholder="搜索 Coordinator..."
                       aria-label="Search coordinators">
                <div id="sv-coordinator-options" 
                     class="coordinator-list" 
                     role="radiogroup" 
                     aria-label="Coordinator options">
                  <!-- 动态加载选项 -->
                </div>
              </div>
              <div class="config-card-footer">
                <button type="button" id="sv-config-save" class="btn-primary" aria-label="Save configuration">💾 保存配置</button>
                <button type="button" id="sv-config-cancel" class="btn-secondary" aria-label="Cancel">❌ 取消</button>
              </div>
            </div>
        `;

    // 2. Wrap the button and the card in a relative positioned container
    const wrapperHtml = `
            <div id="sv-config-wrapper" style="position: relative; display: inline-block; margin-right: 15px; vertical-align: middle;">
                <input type="button" 
                   id="scheduledVisitsSelectorBtn" 
                   name="scheduledVisitsSelectorBtn" 
                   class="button hollow homepage-selector-btn" 
                   value="Search by Coordinator">
                ${cardHtml}
            </div>
        `;

    // 找到 View Report 按钮并插入到其前面
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = wrapperHtml.trim();
    const wrapperNode = tempDiv.firstChild as HTMLElement;
    viewReportBtn.parentNode.insertBefore(wrapperNode, viewReportBtn);

    const mainBtn = document.getElementById(
      "scheduledVisitsSelectorBtn"
    ) as HTMLInputElement;
    if (mainBtn) updateButtonText(mainBtn, config.coordinatorText);

    // Event Listeners
    const wrapper = document.getElementById("sv-config-wrapper");
    let hoverTimer: number | null = null;
    let hideTimer: number | null = null;
    let isCardHovered = false;

    mainBtn?.addEventListener("mouseenter", () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      hoverTimer = window.setTimeout(() => {
        if (!isCardVisible) showConfigCard();
      }, 300);
    });

    mainBtn?.addEventListener("mouseleave", () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
      if (!isCardHovered) {
        hideTimer = window.setTimeout(() => hideConfigCard(), 200);
      }
    });

    const card = document.getElementById("homepage-config-card");
    card?.addEventListener("mouseenter", () => {
      isCardHovered = true;
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    });

    card?.addEventListener("mouseleave", () => {
      isCardHovered = false;
      hideTimer = window.setTimeout(() => hideConfigCard(), 200);
    });

    const closeBtn = document.getElementById("sv-config-close");
    const cancelBtn = document.getElementById("sv-config-cancel");
    const saveBtn = document.getElementById("sv-config-save");

    closeBtn?.addEventListener("click", hideConfigCard);
    cancelBtn?.addEventListener("click", hideConfigCard);
    saveBtn?.addEventListener("click", handleSaveConfiguration);

    mainBtn?.addEventListener("click", (e) => {
      // Prevent clicking the button from doing anything if they meant to hover
      e.preventDefault();
      executeSearchLogic();
    });

    // Keyboard Support
    document.addEventListener("keydown", (e) => {
      const currentCard = document.getElementById("homepage-config-card");
      if (e.key === "Escape" && currentCard?.classList.contains("show")) {
        hideConfigCard();
      }
    });

    card?.addEventListener("keydown", (e) => {
      if (
        e.key === "Enter" &&
        e.target instanceof HTMLInputElement &&
        e.target.type === "radio"
      ) {
        handleSaveConfiguration();
      }
    });

    // Initialize Search input
    initCoordinatorSearch();
  }, 1000);
}
