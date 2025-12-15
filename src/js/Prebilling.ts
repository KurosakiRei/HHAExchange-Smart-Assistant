import {
  prebillingSearchButtonSelector,
  prebillingToDateSelector,
  prebillingAdvancedFilterButtonSelector,
} from "../utils/templates&const";
import { getYesterdayFormatted, sleep } from "../utils/util";
import "../style/prebilling-config-card.less";

// ============================================================================
// Prebilling Selector - 配置化功能 (Epic-3)
// ============================================================================

// 获取页面上的 jQuery (UserScript 沙箱环境需要 unsafeWindow)
const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
const page$ = (pageWindow as any).$;

/** Coordinator 选项接口 */
interface CoordinatorOption {
  value: string; // ID，如 "75207"
  text: string; // 名称，如 "Tao Yang ext.503 TYang@alwaysNY.net"
}

/** Prebilling 配置接口 */
interface PrebillingConfig {
  coordinators: string[]; // Coordinator IDs
  disciplines: string[]; // Discipline IDs
  lastUpdated: number; // 最后更新时间戳
}

// GM_storage key（使用 Tampermonkey 的持久化存储，不受网站 logout 影响）
const PREBILLING_CONFIG_KEY = "hha_prebilling_config";

// 默认 Coordinator IDs（向后兼容：Tao Yang）
const DEFAULT_COORDINATOR_IDS = ["75207"];

// 默认 Discipline IDs (Non Skilled=-1, PCA=-2, HHA=1)
const DEFAULT_DISCIPLINE_IDS = ["-1", "-2", "1"];

// 默认配置对象
const DEFAULT_CONFIG: PrebillingConfig = {
  coordinators: DEFAULT_COORDINATOR_IDS,
  disciplines: DEFAULT_DISCIPLINE_IDS,
  lastUpdated: Date.now(),
};

// 内存存储 fallback（当 GM_storage 不可用时）
let memoryConfigFallback: PrebillingConfig | null = null;

// 元素选择器
const COORDINATOR_SELECT_ID = "ddlCoordinatorMul";
const COORDINATOR_HIDDEN_ID = "ctl00_ContentPlaceHolder1_hdCoordinatorMul";
const DISCIPLINE_SELECT_ID = "ddlDiscipline";
const DISCIPLINE_HIDDEN_ID = "ctl00_ContentPlaceHolder1_hdDiscipline";

/**
 * 检测 GM_storage API 是否可用
 */
function isGMStorageAvailable(): boolean {
  return typeof GM_setValue === "function" && typeof GM_getValue === "function";
}

/**
 * 检测 multipleSelect 插件是否可用
 */
function isMultipleSelectAvailable(): boolean {
  return (
    typeof page$ !== "undefined" &&
    page$ !== null &&
    typeof page$.fn !== "undefined" &&
    typeof page$.fn.multipleSelect === "function"
  );
}

/**
 * 获取当前保存的配置
 * 优先从 GM_storage 读取，若不可用则从内存 fallback 读取
 * 使用 GM_storage 替代 localStorage，因为网站 logout 会清除 localStorage
 */
export function getPrebillingConfig(): PrebillingConfig {
  // 优先尝试 GM_storage（Tampermonkey 持久化存储，不受网站影响）
  if (isGMStorageAvailable()) {
    try {
      const stored = GM_getValue<string | null>(PREBILLING_CONFIG_KEY, null);
      if (stored) {
        const parsed = JSON.parse(stored) as PrebillingConfig;
        // 验证配置数据结构完整性
        if (parsed.coordinators && parsed.disciplines) {
          console.log("[Prebilling] Config loaded from GM_storage:", parsed);
          return parsed;
        }
        console.warn("[Prebilling] Config data incomplete, using default");
      }
    } catch (e) {
      console.warn("[Prebilling] Failed to parse config from GM_storage:", e);
    }
  } else {
    // GM_storage 不可用，使用内存 fallback
    if (memoryConfigFallback) {
      console.log(
        "[Prebilling] Config loaded from memory fallback:",
        memoryConfigFallback
      );
      return memoryConfigFallback;
    }
    console.warn("[Prebilling] GM_storage unavailable, using default config");
  }

  // 返回默认配置的副本
  return { ...DEFAULT_CONFIG, lastUpdated: Date.now() };
}

/**
 * 保存配置
 * 优先保存到 GM_storage，若不可用则保存到内存 fallback
 */
export function savePrebillingConfig(config: Partial<PrebillingConfig>): void {
  const current = getPrebillingConfig();
  const updated: PrebillingConfig = {
    ...current,
    ...config,
    lastUpdated: Date.now(),
  };

  if (isGMStorageAvailable()) {
    try {
      GM_setValue(PREBILLING_CONFIG_KEY, JSON.stringify(updated));
      console.log("[Prebilling] Config saved to GM_storage:", updated);
    } catch (e) {
      console.error("[Prebilling] Failed to save config to GM_storage:", e);
      // 降级到内存存储
      memoryConfigFallback = updated;
      console.log("[Prebilling] Config saved to memory fallback:", updated);
    }
  } else {
    // GM_storage 不可用，保存到内存
    memoryConfigFallback = updated;
    console.log("[Prebilling] Config saved to memory fallback:", updated);
  }
}

/**
 * 初始化配置
 * 首次使用时保存默认配置，确保配置存在
 */
export function initPrebillingConfig(): PrebillingConfig {
  // 检查是否已存在配置
  if (isGMStorageAvailable()) {
    const existing = GM_getValue<string | null>(PREBILLING_CONFIG_KEY, null);
    if (existing) {
      try {
        const parsed = JSON.parse(existing) as PrebillingConfig;
        if (parsed.coordinators && parsed.disciplines) {
          console.log("[Prebilling] Existing config found:", parsed);
          return parsed;
        }
      } catch (e) {
        console.warn("[Prebilling] Existing config corrupted, resetting");
      }
    }
  } else if (memoryConfigFallback) {
    console.log(
      "[Prebilling] Using existing memory fallback config:",
      memoryConfigFallback
    );
    return memoryConfigFallback;
  }

  // 保存默认配置
  const defaultConfig = { ...DEFAULT_CONFIG, lastUpdated: Date.now() };
  savePrebillingConfig(defaultConfig);
  console.log("[Prebilling] Default config initialized:", defaultConfig);
  return defaultConfig;
}

/**
 * 重置配置为默认值
 */
export function resetPrebillingConfig(): PrebillingConfig {
  const defaultConfig = { ...DEFAULT_CONFIG, lastUpdated: Date.now() };
  savePrebillingConfig(defaultConfig);
  console.log("[Prebilling] Config reset to default:", defaultConfig);
  return defaultConfig;
}

/**
 * 获取所有可用的 Coordinator 选项
 * 使用原生 DOM API 避免触发 jQuery/multipleSelect 的事件
 */
export function getCoordinatorOptions(): CoordinatorOption[] {
  const options: CoordinatorOption[] = [];

  // 使用原生 DOM API 而不是 jQuery，避免触发任何插件事件
  const selectEl = document.getElementById(
    COORDINATOR_SELECT_ID
  ) as HTMLSelectElement | null;

  if (!selectEl) {
    console.warn("[Prebilling] Coordinator select not found");
    return options;
  }

  // 直接遍历原生 option 元素
  const optionEls = selectEl.querySelectorAll("option");
  optionEls.forEach((opt) => {
    const value = opt.value;
    const text = opt.textContent || "";
    if (value && value !== "") {
      options.push({ value, text });
    }
  });

  return options;
}

/**
 * 使用 multipleSelect API 选择 Coordinator
 * @param coordinatorIds - 要选择的 Coordinator ID 数组
 */
function selectCoordinatorByAPI(coordinatorIds: string[]): boolean {
  const $select = page$(`#${COORDINATOR_SELECT_ID}`);

  if (!$select || $select.length === 0) {
    console.error("[Prebilling] Coordinator select element not found");
    return false;
  }

  if (!isMultipleSelectAvailable()) {
    console.error("[Prebilling] multipleSelect plugin not available");
    return false;
  }

  try {
    // 1. 清空所有选择
    ($select as any).multipleSelect("uncheckAll");

    // 2. 设置指定的 coordinator
    ($select as any).multipleSelect("setSelects", coordinatorIds);

    // 3. 关键修复：启用 multipleSelect 控件
    // 页面的 GetSelectedIDsJSON() 函数检查 isEnabled 状态
    // 如果 isEnabled 为 false，它会返回 null 而不是实际选择的值
    // 这会导致搜索时 CoordinatorMulFrm:"null"，忽略 coordinator 过滤
    ($select as any).multipleSelect("enable");

    // 4. 同步更新隐藏字段
    const hdCoord = document.getElementById(
      COORDINATOR_HIDDEN_ID
    ) as HTMLInputElement;
    if (hdCoord) {
      hdCoord.value = coordinatorIds.join(",");
    }

    console.log(
      "[Prebilling] Coordinator selected and enabled:",
      coordinatorIds
    );
    return true;
  } catch (e) {
    console.error("[Prebilling] Failed to set coordinator:", e);
    return false;
  }
}

/**
 * 使用 multipleSelect API 选择 Discipline
 * @param disciplineIds - 要选择的 Discipline ID 数组
 */
function selectDisciplineByAPI(disciplineIds: string[]): boolean {
  const $select = page$(`#${DISCIPLINE_SELECT_ID}`);

  if (!$select || $select.length === 0) {
    console.error("[Prebilling] Discipline select element not found");
    return false;
  }

  if (!isMultipleSelectAvailable()) {
    console.error("[Prebilling] multipleSelect plugin not available");
    return false;
  }

  try {
    // 1. 清空所有选择
    ($select as any).multipleSelect("uncheckAll");

    // 2. 设置指定的 discipline
    ($select as any).multipleSelect("setSelects", disciplineIds);

    // 3. 关键修复：启用 multipleSelect 控件
    // 页面的 GetSelectedIDsJSON() 函数检查 isEnabled 状态
    // 如果 isEnabled 为 false，它会返回 null 而不是实际选择的值
    ($select as any).multipleSelect("enable");

    // 4. 同步更新隐藏字段
    const hdDiscipline = document.getElementById(
      DISCIPLINE_HIDDEN_ID
    ) as HTMLInputElement;
    if (hdDiscipline) {
      hdDiscipline.value = disciplineIds.join(",");
    }

    console.log("[Prebilling] Discipline selected and enabled:", disciplineIds);
    return true;
  } catch (e) {
    console.error("[Prebilling] Failed to set discipline:", e);
    return false;
  }
}

/**
 * Prebilling Selector 主函数
 * 使用 multipleSelect API 设置筛选条件并执行搜索
 */
export const prebillingSelector = async () => {
  // 初始化配置（确保配置存在）
  initPrebillingConfig();

  // 设置日期为昨天
  page$(prebillingToDateSelector).val(getYesterdayFormatted());

  // 加载配置
  const config = getPrebillingConfig();

  // 使用 API 设置 Discipline（无需展开面板，直接通过 API 操作）
  selectDisciplineByAPI(config.disciplines);

  // 使用 API 设置 Coordinator（无需展开面板，直接通过 API 操作）
  selectCoordinatorByAPI(config.coordinators);

  // 等待 UI 更新
  await sleep(100);

  // 点击搜索
  page$(prebillingSearchButtonSelector)[0].click();

  // 保持高级筛选展开状态（不再收起，避免闪烁）
  // await sleep(100);
  // page$(prebillingAdvancedFilterButtonSelector)[0].click();

  console.log("[Prebilling] Search executed with config:", config);
};

// ============================================================================
// Story 3: Hover 配置卡片 UI
// ============================================================================

/** 临时选中的 coordinator IDs（用于配置卡片中的选择状态） */
let tempSelectedCoordinators: string[] = [];

/**
 * 创建配置卡片 DOM 结构
 */
function createConfigCardDOM(): HTMLElement {
  const card = document.createElement("div");
  card.id = "prebilling-config-card";
  card.innerHTML = `
    <div class="config-card-header">
      <h3>📋 Prebilling Selector 配置</h3>
      <button class="config-close-btn" id="config-close-x">×</button>
    </div>
    <div class="config-card-body">
      <label>Coordinator 选择:</label>
      <input 
        type="text" 
        id="coordinator-search" 
        placeholder="🔍 搜索 coordinator..."
        class="config-search-input"
      />
      <div class="coordinator-list" id="coordinator-options">
        <!-- 动态生成 checkbox 列表 -->
      </div>
      <div class="config-summary">
        已选择: <span id="selected-count">0</span> 个 coordinator
      </div>
    </div>
    <div class="config-card-footer">
      <button id="save-config-btn" class="btn-primary">💾 保存配置</button>
      <button id="cancel-config-btn" class="btn-secondary">❌ 取消</button>
    </div>
  `;
  return card;
}

/**
 * 渲染 coordinator 列表到配置卡片
 */
function renderCoordinatorList(
  options: CoordinatorOption[],
  selectedIds: string[]
): void {
  const container = document.getElementById("coordinator-options");
  if (!container) return;

  container.innerHTML = "";

  options.forEach((opt) => {
    const checked = selectedIds.includes(opt.value) ? "checked" : "";
    const div = document.createElement("div");
    div.className = "coordinator-option";
    div.innerHTML = `
      <input 
        type="checkbox" 
        id="coord-${opt.value}" 
        value="${opt.value}"
        ${checked}
      />
      <label for="coord-${opt.value}">${opt.text}</label>
    `;
    container.appendChild(div);
  });

  updateSelectedCount();
}

/**
 * 更新已选择的 coordinator 数量显示
 */
function updateSelectedCount(): void {
  const checkboxes = document.querySelectorAll(
    "#coordinator-options input[type='checkbox']:checked"
  );
  const countEl = document.getElementById("selected-count");
  if (countEl) {
    countEl.textContent = String(checkboxes.length);
  }
}

/**
 * 搜索过滤 coordinator 列表
 */
function filterCoordinators(searchTerm: string): void {
  const term = searchTerm.toLowerCase();
  const options = document.querySelectorAll(".coordinator-option");
  options.forEach((opt) => {
    const text = opt.textContent?.toLowerCase() || "";
    (opt as HTMLElement).style.display = text.includes(term) ? "" : "none";
  });
}

/**
 * 显示配置卡片
 */
function showConfigCard(): void {
  const card = document.getElementById("prebilling-config-card");
  if (card) {
    // 加载当前配置
    const config = getPrebillingConfig();
    tempSelectedCoordinators = [...config.coordinators];

    // 检查页面组件是否已完全加载（选项已填充）
    const options = getCoordinatorOptions();

    if (options.length === 0) {
      // 组件还在加载中，显示加载提示
      const container = document.getElementById("coordinator-options");
      if (container) {
        container.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #666;">
            ⏳ 正在加载 Coordinator 列表...<br/>
            <small>请稍后再试，或等待页面完全加载后再打开此配置卡片</small>
          </div>
        `;
      }
    } else {
      // 组件已加载，渲染列表
      renderCoordinatorList(options, tempSelectedCoordinators);
    }

    // 清空搜索框
    const searchInput = document.getElementById(
      "coordinator-search"
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = "";
    }

    card.classList.add("show");
    console.log("[Prebilling] Config card shown");
  }
}

/**
 * 隐藏配置卡片
 */
function hideConfigCard(): void {
  const card = document.getElementById("prebilling-config-card");
  if (card) {
    card.classList.remove("show");
    console.log("[Prebilling] Config card hidden");
  }
}

/**
 * 保存配置卡片中的选择
 */
function saveConfigFromCard(): void {
  const selectedIds: string[] = [];
  const checkboxes = document.querySelectorAll(
    "#coordinator-options input[type='checkbox']:checked"
  ) as NodeListOf<HTMLInputElement>;

  checkboxes.forEach((cb) => {
    selectedIds.push(cb.value);
  });

  if (selectedIds.length === 0) {
    alert("⚠️ 请至少选择一个 Coordinator");
    return;
  }

  // 只保存到 GM_storage，不修改页面组件
  // 配置会在用户点击搜索按钮时应用
  savePrebillingConfig({ coordinators: selectedIds });

  hideConfigCard();

  // 更新按钮文字显示选中数量
  updateButtonText(selectedIds.length);

  // 显示保存成功提示
  console.log(
    `[Prebilling] Config saved! Selected ${selectedIds.length} coordinators:`,
    selectedIds
  );
}

/**
 * 更新按钮文字
 */
function updateButtonText(count: number): void {
  const btn = document.getElementById("prebillingSelector") as HTMLInputElement;
  if (btn) {
    btn.value = `Search by Coordinator(s) [${count}]`;
  }
}

/**
 * 初始化配置卡片事件监听
 */
function initConfigCardEvents(): void {
  let hoverTimer: number | null = null;
  let isCardHovered = false;

  const btn = document.querySelector(".prebilling-selector-btn");
  const card = document.getElementById("prebilling-config-card");

  if (!btn || !card) {
    console.warn("[Prebilling] Button or card not found for event binding");
    return;
  }

  // 按钮 hover 显示卡片
  btn.addEventListener("mouseenter", () => {
    hoverTimer = window.setTimeout(() => {
      showConfigCard();
    }, 300);
  });

  btn.addEventListener("mouseleave", () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    // 延迟检查是否应该隐藏卡片
    setTimeout(() => {
      if (!isCardHovered) {
        hideConfigCard();
      }
    }, 200);
  });

  // 卡片 hover 保持显示
  card.addEventListener("mouseenter", () => {
    isCardHovered = true;
  });

  card.addEventListener("mouseleave", () => {
    isCardHovered = false;
    setTimeout(() => {
      if (!isCardHovered) {
        hideConfigCard();
      }
    }, 200);
  });

  // 搜索框输入过滤
  const searchInput = document.getElementById("coordinator-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      filterCoordinators((e.target as HTMLInputElement).value);
    });
  }

  // Checkbox 变化更新计数
  const optionsContainer = document.getElementById("coordinator-options");
  if (optionsContainer) {
    optionsContainer.addEventListener("change", (e) => {
      if ((e.target as HTMLElement).tagName === "INPUT") {
        updateSelectedCount();
      }
    });
  }

  // 保存按钮
  const saveBtn = document.getElementById("save-config-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      saveConfigFromCard();
    });
  }

  // 取消按钮
  const cancelBtn = document.getElementById("cancel-config-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      hideConfigCard();
    });
  }

  // 关闭 X 按钮
  const closeBtn = document.getElementById("config-close-x");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      hideConfigCard();
    });
  }

  console.log("[Prebilling] Config card events initialized");
}

/**
 * 初始化配置卡片 UI
 * 在按钮插入后调用
 */
export function initConfigCardUI(): void {
  // 等待按钮存在
  const checkBtn = setInterval(() => {
    const btn = document.querySelector(".prebilling-selector-btn");
    if (btn) {
      clearInterval(checkBtn);

      // 创建包装容器
      const wrapper = document.createElement("div");
      wrapper.id = "prebilling-selector-wrapper";
      wrapper.style.cssText = "position: relative; display: inline-block;";

      // 将按钮移入容器
      btn.parentNode?.insertBefore(wrapper, btn);
      wrapper.appendChild(btn);

      // 创建配置卡片并添加到容器
      const card = createConfigCardDOM();
      wrapper.appendChild(card);

      // 初始化事件
      initConfigCardEvents();

      // 更新按钮文字显示当前配置的 coordinator 数量
      const config = getPrebillingConfig();
      updateButtonText(config.coordinators.length);

      // 修复 multipleSelect UI 不刷新的问题（Bug 2 fix）
      // 在某些情况下（如 bfcache 恢复），multipleSelect 显示层不会自动更新
      fixMultipleSelectUI();

      console.log("[Prebilling] Config card UI initialized");
    }
  }, 500);

  // 10 秒后停止检查
  setTimeout(() => clearInterval(checkBtn), 10000);
}

/**
 * 修复 multipleSelect 组件 UI 不刷新的问题，并重新应用保存的配置
 * 当页面从 bfcache 恢复或刷新时：
 * 1. 刷新 multipleSelect UI 显示层
 * 2. 重新应用用户保存的 coordinator 和 discipline 配置
 */
function fixMultipleSelectUI(): void {
  // 延迟执行，等待页面完全加载
  setTimeout(() => {
    if (!isMultipleSelectAvailable()) {
      console.log("[Prebilling] multipleSelect not available, skipping UI fix");
      return;
    }

    try {
      // 1. 先刷新主要的 multipleSelect 组件 UI
      const selectIds = [
        "ddlContract",
        "ddlCoordinatorMul",
        "ddlDiscipline",
        "ddlPatientTeam",
        "ddlPatientLocation",
      ];

      selectIds.forEach((id) => {
        const $select = page$(`#${id}`);
        if ($select && $select.length > 0) {
          try {
            ($select as any).multipleSelect("refresh");
          } catch (e) {
            // 某些组件可能还没初始化，忽略错误
          }
        }
      });

      console.log("[Prebilling] multipleSelect UI refresh completed");

      // 2. 重新应用保存的配置（关键修复！）
      // 页面刷新后，组件会恢复到默认的 "All selected" 状态
      // 我们需要重新设置用户保存的 coordinator 和 discipline 选择
      const config = getPrebillingConfig();

      // 应用 Coordinator 配置
      if (config.coordinators && config.coordinators.length > 0) {
        selectCoordinatorByAPI(config.coordinators);
        console.log(
          "[Prebilling] Coordinator config re-applied:",
          config.coordinators
        );
      }

      // 应用 Discipline 配置
      if (config.disciplines && config.disciplines.length > 0) {
        selectDisciplineByAPI(config.disciplines);
        console.log(
          "[Prebilling] Discipline config re-applied:",
          config.disciplines
        );
      }

      // 更新按钮显示
      updateButtonText(config.coordinators.length);
    } catch (e) {
      console.warn("[Prebilling] Failed to fix multipleSelect UI:", e);
    }
  }, 1500); // 延迟 1.5 秒，确保页面 AJAX 数据已加载
}
