import {
  prebillingSearchButtonSelector,
  prebillingToDateSelector,
  prebillingAdvancedFilterButtonSelector,
} from "../utils/templates&const";
import { getYesterdayFormatted, sleep } from "../utils/util";

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

// localStorage key
const PREBILLING_CONFIG_KEY = "hha_prebilling_config";

// 默认 Coordinator IDs（向后兼容：Tao Yang）
const DEFAULT_COORDINATOR_IDS = ["75207"];

// 默认 Discipline IDs (Non Skilled=-1, PCA=-2, HHA=1)
const DEFAULT_DISCIPLINE_IDS = ["-1", "-2", "1"];

// 元素选择器
const COORDINATOR_SELECT_ID = "ddlCoordinatorMul";
const COORDINATOR_HIDDEN_ID = "ctl00_ContentPlaceHolder1_hdCoordinatorMul";
const DISCIPLINE_SELECT_ID = "ddlDiscipline";
const DISCIPLINE_HIDDEN_ID = "ctl00_ContentPlaceHolder1_hdDiscipline";

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
 */
export function getPrebillingConfig(): PrebillingConfig {
  try {
    const stored = localStorage.getItem(PREBILLING_CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("[Prebilling] Failed to load config from localStorage:", e);
  }
  // 返回默认配置
  return {
    coordinators: DEFAULT_COORDINATOR_IDS,
    disciplines: DEFAULT_DISCIPLINE_IDS,
    lastUpdated: Date.now(),
  };
}

/**
 * 保存配置到 localStorage
 */
export function savePrebillingConfig(config: Partial<PrebillingConfig>): void {
  try {
    const current = getPrebillingConfig();
    const updated: PrebillingConfig = {
      ...current,
      ...config,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(PREBILLING_CONFIG_KEY, JSON.stringify(updated));
    console.log("[Prebilling] Config saved:", updated);
  } catch (e) {
    console.error("[Prebilling] Failed to save config:", e);
  }
}

/**
 * 获取所有可用的 Coordinator 选项
 */
export function getCoordinatorOptions(): CoordinatorOption[] {
  const options: CoordinatorOption[] = [];
  const $select = page$(`#${COORDINATOR_SELECT_ID}`);

  if (!$select || $select.length === 0) {
    console.warn("[Prebilling] Coordinator select not found");
    return options;
  }

  $select.find("option").each(function (this: HTMLOptionElement) {
    const value = page$(this).val() as string;
    const text = page$(this).text();
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

    // 3. 同步更新隐藏字段
    const hdCoord = document.getElementById(
      COORDINATOR_HIDDEN_ID
    ) as HTMLInputElement;
    if (hdCoord) {
      hdCoord.value = coordinatorIds.join(",");
    }

    console.log("[Prebilling] Coordinator selected:", coordinatorIds);
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

    // 3. 同步更新隐藏字段
    const hdDiscipline = document.getElementById(
      DISCIPLINE_HIDDEN_ID
    ) as HTMLInputElement;
    if (hdDiscipline) {
      hdDiscipline.value = disciplineIds.join(",");
    }

    console.log("[Prebilling] Discipline selected:", disciplineIds);
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
  // 设置日期为昨天
  page$(prebillingToDateSelector).val(getYesterdayFormatted());

  // 展开高级筛选
  await sleep(100);
  page$(prebillingAdvancedFilterButtonSelector)[0].click();
  await sleep(200);

  // 加载配置
  const config = getPrebillingConfig();

  // 使用 API 设置 Discipline
  selectDisciplineByAPI(config.disciplines);

  // 使用 API 设置 Coordinator
  selectCoordinatorByAPI(config.coordinators);

  // 等待 UI 更新
  await sleep(100);

  // 点击搜索
  page$(prebillingSearchButtonSelector)[0].click();

  // 收起高级筛选
  await sleep(100);
  page$(prebillingAdvancedFilterButtonSelector)[0].click();

  console.log("[Prebilling] Search executed with config:", config);
};
