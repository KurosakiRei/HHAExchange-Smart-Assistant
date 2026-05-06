import {
  homePageCommunicationTypeOptionSelector,
  homePageCommunicationTypeSelector,
  homePageCoordinatorOptionSelector,
  homePageCoordinatorSelector,
  homePageSearchButtonSelector,
  homePagestatusOptionSelector,
  homePagestatusSelector,
} from "../utils/templates&const";
import { sleep } from "../utils/util";

// ============================================================================
// Story 2: 配置接口定义与常量
// ============================================================================

/** Coordinator 选项接口（与 API 返回格式对齐）*/
interface CoordinatorOption {
  CoordinatorID: string; // "75207"
  CoordinatorName: string; // "Tao Yang ext.503 TYang@alwaysNY.net"
}

/** HomePage 配置接口（单选 Coordinator）*/
interface HomePageConfig {
  coordinatorID: string; // Coordinator ID（如 "75207"）
  coordinatorText: string; // Coordinator 显示名称
  status: string; // "-1" (All) | "1" (Open) | "2" (Closed)
  lastUpdated: number; // 最后更新时间戳
}

/** 缓存的 Coordinators 接口 */
interface CachedCoordinators {
  data: CoordinatorOption[];
  timestamp: number;
}

// GM_storage keys
const HOMEPAGE_CONFIG_KEY = "hha_homepage_config";
const COORDINATOR_CACHE_KEY = "hha_coordinator_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

// 标志：是否已经加载过coordinators
let coordinatorsLoadedOnce = false;

// 默认配置（向后兼容：Tao Yang）
const DEFAULT_CONFIG: HomePageConfig = {
  coordinatorID: "75207",
  coordinatorText: "Tao Yang ext.503 TYang@alwaysNY.net",
  status: "1", // Open
  lastUpdated: Date.now(),
};

// ============================================================================
// Story 2: GM_storage 配置管理函数
// ============================================================================

/**
 * 检测 GM_storage API 是否可用
 */
function isGMStorageAvailable(): boolean {
  return typeof GM_setValue === "function" && typeof GM_getValue === "function";
}

/**
 * 获取当前保存的配置
 */
export function getHomePageConfig(): HomePageConfig {
  if (isGMStorageAvailable()) {
    try {
      const stored = GM_getValue(HOMEPAGE_CONFIG_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        console.log("[HomePage] Config loaded from GM_storage:", config);
        return config;
      }
    } catch (error) {
      console.error("[HomePage] Failed to load config from GM_storage:", error);
    }
  }
  console.log("[HomePage] Using default config");
  return { ...DEFAULT_CONFIG, lastUpdated: Date.now() };
}

/**
 * 保存配置
 */
export function saveHomePageConfig(config: Partial<HomePageConfig>): void {
  const current = getHomePageConfig();
  const updated: HomePageConfig = {
    ...current,
    ...config,
    lastUpdated: Date.now(),
  };

  if (isGMStorageAvailable()) {
    try {
      GM_setValue(HOMEPAGE_CONFIG_KEY, JSON.stringify(updated));
      console.log("[HomePage] Config saved to GM_storage:", updated);
    } catch (error) {
      console.error("[HomePage] Failed to save config to GM_storage:", error);
    }
  }
}

/**
 * 重置为默认配置
 */
export function resetHomePageConfig(): void {
  saveHomePageConfig(DEFAULT_CONFIG);
  console.log("[HomePage] Config reset to default");
}

// ============================================================================
// Story 2: API 数据获取函数
// ============================================================================

/**
 * 从页面获取 AppSecret（从任意请求头中提取）
 */
function getAppSecretFromPage(): string {
  // 方法1: 从 meta 标签读取
  const metaSecret = document.querySelector('meta[name="appsecret"]');
  if (metaSecret) {
    const content = metaSecret.getAttribute("content");
    if (content) return content;
  }

  // 方法2: 从全局变量读取（如果页面有暴露）
  const win = window as any;
  if (win.AppSecret) {
    return win.AppSecret;
  }

  // 方法3: 使用实测默认值
  return "79BB4FCD-9884-4652-B77F-6077F363193D";
}

/**
 * 获取当前用户 ID（从页面 cookie 或全局变量）
 */
function getUserIDFromPage(): string {
  // 方法1: 从 hhaKeyWordConfiguration cookie 读取
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "hhaKeyWordConfiguration") {
      const match = value.match(/UserId=(\d+)/);
      if (match) {
        console.log("[HomePage] UserID from cookie:", match[1]);
        return match[1];
      }
    }
  }

  // 方法2: 从全局变量读取
  const win = window as any;
  if (win.currentUserID) {
    console.log(
      "[HomePage] UserID from window.currentUserID:",
      win.currentUserID.toString()
    );
    return win.currentUserID.toString();
  }

  // 方法3: 尝试从顶层window读取
  try {
    const topWin = window.top as any;
    if (topWin && topWin !== window) {
      // 尝试从top window的cookie读取
      const topCookies = topWin.document.cookie.split(";");
      for (const cookie of topCookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "hhaKeyWordConfiguration") {
          const match = value.match(/UserId=(\d+)/);
          if (match) {
            console.log("[HomePage] UserID from top window cookie:", match[1]);
            return match[1];
          }
        }
      }

      // 尝试从top window全局变量读取
      if (topWin.currentUserID) {
        console.log(
          "[HomePage] UserID from top window.currentUserID:",
          topWin.currentUserID.toString()
        );
        return topWin.currentUserID.toString();
      }
    }
  } catch (e) {
    // 跨域限制，无法访问top window
    console.warn("[HomePage] Cannot access top window:", e);
  }

  // 使用实测默认值
  console.warn("[HomePage] Using hardcoded userID fallback: 184885");
  return "184885";
}

/**
 * 获取 Office IDs（从页面上下文）
 */
function getOfficeIDsFromPage(): {
  OfficeIDs: string;
  OfficeXML: Array<{ OfficeID: number }>;
} {
  // 尝试从页面全局变量获取
  const win = window as any;

  // 如果页面有 offices 数组
  if (win.offices && Array.isArray(win.offices)) {
    const ids = win.offices.map((o: any) => o.OfficeID || o.id);
    return {
      OfficeIDs: ids.join(","),
      OfficeXML: ids.map((id: number) => ({ OfficeID: id })),
    };
  }

  // 使用实测默认值（从成功请求中提取）
  return {
    OfficeIDs: "469,5137,5139,6475,14849",
    OfficeXML: [
      { OfficeID: 469 },
      { OfficeID: 5137 },
      { OfficeID: 5139 },
      { OfficeID: 6475 },
      { OfficeID: 14849 },
    ],
  };
}

function getCoordinatorApiUrl(): string {
  const entpMatch = window.location.pathname.match(/\/(ENTP\d+)\//i);
  if (entpMatch?.[1]) {
    return `/${entpMatch[1]}/api/Common/GetAllCoordinators`;
  }

  try {
    const topPath = window.top?.location?.pathname || "";
    const entMatch = topPath.match(/\/(ENT\d+)\//i);
    if (entMatch?.[1]) {
      const entpPrefix = entMatch[1].replace(/^ENT/i, "ENTP");
      return `/${entpPrefix}/api/Common/GetAllCoordinators`;
    }
  } catch (error) {
    console.warn("[HomePage] Cannot read top window path for API URL:", error);
  }

  // Final fallback keeps relative API resolution if tenant prefix is unavailable.
  return "/api/Common/GetAllCoordinators";
}

function getRuntimeVersionInfo(): {
  appVersion: string;
  version: string;
  minorVersion: string;
} {
  const params = new URLSearchParams(window.location.search);
  const appVersion =
    params.get("AppVersion") || params.get("appVersion") || "ENT";
  const version = params.get("Version") || params.get("version") || "26.03";
  const minorVersion =
    params.get("MinorVersion") || params.get("minorVersion") || "1.0";

  return {
    appVersion,
    version,
    minorVersion,
  };
}

/**
 * 从 API 获取所有 Coordinators
 * API: POST /api/Common/GetAllCoordinators
 * 实测返回: 26 个 coordinator 对象
 */
async function fetchCoordinatorsFromAPI(): Promise<CoordinatorOption[]> {
  const apiUrl = getCoordinatorApiUrl();

  try {
    const appSecret = getAppSecretFromPage();
    const userID = getUserIDFromPage();
    const officeData = getOfficeIDsFromPage();
    const runtimeVersion = getRuntimeVersionInfo();

    // 构建完整的请求体（与成功请求一致）
    const requestBody = {
      appVersion: runtimeVersion.appVersion,
      version: runtimeVersion.version,
      minorVersion: runtimeVersion.minorVersion,
      userID: userID,
      OfficeIDs: officeData.OfficeIDs,
      OfficeXML: officeData.OfficeXML,
    };

    console.log("[HomePage] Fetching coordinators from:", apiUrl);
    console.log("[HomePage] Fetching coordinators with body:", requestBody);

    const response = await fetch(apiUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        AppSecret: appSecret,
        AppName: "ENT",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data: CoordinatorOption[] = await response.json();
      console.log(`[HomePage] Fetched ${data.length} coordinators from API`);
      return data;
    } else {
      console.error(
        "[HomePage] API returned error:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error("[HomePage] Failed to fetch coordinators:", error);
  }

  return [];
}

/**
 * 强制清除coordinator缓存
 */
export function clearCoordinatorCache(): void {
  if (isGMStorageAvailable()) {
    GM_setValue(COORDINATOR_CACHE_KEY, "");
    console.log("[HomePage] Coordinator cache cleared");
  }
}

/**
 * 带缓存的 Coordinator 获取（避免重复请求）
 */
export async function getCoordinators(
  forceRefresh = false
): Promise<CoordinatorOption[]> {
  const now = Date.now();

  // 如果强制刷新，先清除缓存
  if (forceRefresh) {
    clearCoordinatorCache();
    console.log("[HomePage] Force refresh: clearing cache");
  }

  // 1. 先从缓存读取
  if (!forceRefresh && isGMStorageAvailable()) {
    try {
      const cached = GM_getValue(COORDINATOR_CACHE_KEY);
      if (cached) {
        const cacheData: CachedCoordinators = JSON.parse(cached);
        // 检查缓存是否过期
        if (now - cacheData.timestamp < CACHE_TTL) {
          console.log(
            `[HomePage] Using cached coordinators (${cacheData.data.length} items)`
          );
          return cacheData.data;
        }
        console.log("[HomePage] Cache expired, fetching from API...");
      }
    } catch (error) {
      console.error("[HomePage] Failed to read cache:", error);
    }
  }

  // 2. 缓存过期或不存在，从 API 获取
  const coordinators = await fetchCoordinatorsFromAPI();

  // 3. 保存到缓存
  if (coordinators.length > 0 && isGMStorageAvailable()) {
    const cacheData: CachedCoordinators = {
      data: coordinators,
      timestamp: now,
    };
    GM_setValue(COORDINATOR_CACHE_KEY, JSON.stringify(cacheData));
    console.log("[HomePage] Coordinators cached successfully");
  }

  return coordinators;
}

// ============================================================================
// Story 4: API-First 搜索实现
// ============================================================================

/**
 * 获取目标 iframe（#ctl00_ContentPlaceHolder1_iframemsg）
 */
function getTargetIframe(): HTMLIFrameElement | null {
  return document.getElementById(
    "ctl00_ContentPlaceHolder1_iframemsg"
  ) as HTMLIFrameElement;
}

/**
 * 直接调用 PayerNotificationSearch API 执行搜索
 * 优点：绕过 UI 级联依赖，速度快（< 500ms）
 *
 * @returns 成功返回 true，失败返回 false
 */
async function executeSearchByAPI(): Promise<boolean> {
  const config = getHomePageConfig();

  try {
    const appSecret = getAppSecretFromPage();
    const userID = getUserIDFromPage();
    const officeData = getOfficeIDsFromPage();
    const apiUrl =
      "/ENTP2507010000/api/PayerNotification/PayerNotificationSearch";

    // 构建请求体（匹配成功的请求格式）
    const requestBody = {
      appVersion: "ENT",
      version: "25.07",
      minorVersion: "1.0",
      userID: userID,
      MessageType: -1,
      Status: parseInt(config.status),
      ProviderId: "469", // 从 officeData 提取主 office ID
      IsConversation: 0,
      KeySearch: "",
      Pagination: {
        PageNumber: 1,
        SortItem: "CreatedDate",
        SortOrder: "DESC",
        PageSize: "50",
      },
      IsNewLook: true,
      CommunicationType: 1, // 1=Non-Patient, 2=Patient
      UserName: "", // 留空或从页面获取
      NoOfDays: 1,
      UseMirrorConnection: true,
      Internal: 2,
      IsServicePortalNote: 0,
      CoordinatorID: parseInt(config.coordinatorID),
      Payers: "", // 留空表示 All
      FromDate: "",
      ToDate: "",
      OfficeIDs: officeData.OfficeIDs,
      ReasonIDs: "", // 留空表示 All
    };

    console.log("[HomePage] API request:", requestBody);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        AppSecret: appSecret,
        AppName: "ENT",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("[HomePage] API search succeeded, results:", data);

      // 触发页面刷新以显示搜索结果
      // Angular 应用会自动更新 UI
      return true;
    } else {
      console.error(
        "[HomePage] API search failed:",
        response.status,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.error("[HomePage] API search error:", error);
    return false;
  }
}

/**
 * 传统 UI 自动化方式（回退方案）
 * 保留原有逻辑作为 API 失败时的 fallback
 */
async function legacyUIAutomation(): Promise<boolean> {
  const config = getHomePageConfig();
  const iframe = getTargetIframe();
  if (!iframe) {
    console.error("[HomePage] Iframe not found");
    return false;
  }

  const doc = iframe.contentDocument;
  if (!doc) {
    console.error("[HomePage] Iframe document not accessible");
    return false;
  }

  try {
    await sleep(100);

    // 使用 iframe 的 document 作为 jQuery context
    const $iframe = (selector: string) => $(selector, doc);

    // 1. 设置 Communication Type = "Patient"
    const communicationType = $iframe(homePageCommunicationTypeSelector);
    for (const option of $iframe(homePageCommunicationTypeOptionSelector)) {
      if ("Patient" == option.innerText) {
        communicationType.val(
          (option as HTMLOptionElement).getAttribute("value")
        );
        communicationType[0].dispatchEvent(new Event("change"));
        console.log("[HomePage] Communication Type set to Patient");
        break;
      }
    }

    // 等待 Coordinator 下拉菜单出现（最多等待 3 秒）
    let coordinator = $iframe(homePageCoordinatorSelector);
    let retries = 0;
    const maxRetries = 30; // 30 * 100ms = 3 秒
    while (coordinator.length === 0 && retries < maxRetries) {
      await sleep(100);
      coordinator = $iframe(homePageCoordinatorSelector);
      retries++;
    }

    if (coordinator.length === 0) {
      console.error("[HomePage] Coordinator dropdown not found after waiting");
      return false;
    }
    console.log(
      "[HomePage] Coordinator dropdown found after",
      retries * 100,
      "ms"
    );

    // 2. 设置 Coordinator（使用配置的 ID）
    // 注意：Angular 下拉菜单的 option value 是 coordinatorID（如 "8058"）
    let coordinatorFound = false;

    for (const option of $iframe(homePageCoordinatorOptionSelector)) {
      const optionValue = (option as HTMLOptionElement).getAttribute("value");
      // 使用 coordinatorID 来匹配
      if (optionValue === config.coordinatorID) {
        coordinator.val(optionValue);
        coordinator[0].dispatchEvent(new Event("change"));
        coordinatorFound = true;
        console.log(
          "[HomePage] Coordinator set via UI:",
          config.coordinatorText,
          "(ID:",
          config.coordinatorID,
          ")"
        );
        break;
      }
    }

    if (!coordinatorFound) {
      console.error(
        "[HomePage] Coordinator not found in dropdown. ID:",
        config.coordinatorID,
        "Text:",
        config.coordinatorText
      );
      // 输出所有可用选项以便调试
      const availableOptions = $iframe(homePageCoordinatorOptionSelector)
        .map((i, el) => $(el).val())
        .get();
      console.error("[HomePage] Available coordinator IDs:", availableOptions);
      return false;
    }

    await sleep(300);

    // 3. 设置 Status（使用配置的 status）
    const status = $iframe(homePagestatusSelector);
    const statusMap: { [key: string]: string } = {
      "-1": "All",
      "1": "Open",
      "2": "Closed",
    };
    const statusText = statusMap[config.status] || "Open";

    for (const option of $iframe(homePagestatusOptionSelector)) {
      if (statusText == option.innerText) {
        status.val((option as HTMLOptionElement).getAttribute("value"));
        status[0].dispatchEvent(new Event("change"));
        break;
      }
    }

    await sleep(100);

    // 4. 点击搜索按钮
    $iframe(homePageSearchButtonSelector)[0].click();
    console.log("[HomePage] UI automation search triggered");

    return true;
  } catch (error) {
    console.error("[HomePage] Legacy UI automation error:", error);
    return false;
  }
}

/**
 * HomePage Selector 主函数（UI-First 策略）
 * 使用 UI 自动化触发 Angular 原生搜索，确保结果正确显示
 * 注意：直接 API 调用不会触发 Angular 数据绑定更新 UI
 */
export const homePageSelector = async () => {
  console.log("[HomePage] ========== Button Clicked ==========");
  console.log("[HomePage] Selector started (UI-First mode)");

  // 检查配置
  const config = getHomePageConfig();
  console.log("[HomePage] Current config:", config);

  if (!config.coordinatorID) {
    console.error("[HomePage] No coordinator configured");
    alert("⚠️ Please configure a coordinator first (hover over the button)");
    return;
  }

  // 使用 UI 自动化触发搜索（Angular 应用需要通过原生 UI 交互来更新视图）
  console.log("[HomePage] Using UI automation to trigger Angular search...");
  const uiSuccess = await legacyUIAutomation();

  if (uiSuccess) {
    console.log("[HomePage] ✅ UI automation search succeeded");
  } else {
    console.error("[HomePage] ❌ UI automation failed");
    alert("❌ Search failed. Please try again or search manually.");
  }
  console.log("[HomePage] =========================================");
};

/**
 * 检测当前是否在 Linked Communication Tab (#msg)
 */
export function isLinkedCommunicationTab(): boolean {
  return window.location.hash === "#msg";
}

/**
 * 初始化 hashchange 监听器
 * 当用户切换 Tab 时，自动显示/隐藏按钮
 */
export function initHashChangeListener(): void {
  window.addEventListener("hashchange", () => {
    const btn = document.getElementById("homePageSelector");
    if (btn) {
      btn.style.display = isLinkedCommunicationTab() ? "" : "none";
    }
  });

  console.log("[HomePage] Hash change listener initialized");
}

// ============================================================================
// Story 3: 配置卡片 UI 函数
// ============================================================================

/**
 * 渲染 coordinator 列表（单选 radio）
 */
function renderCoordinatorList(
  options: CoordinatorOption[],
  selectedId: string
): void {
  const container = document.getElementById("hp-coordinator-options");
  if (!container) return;

  container.innerHTML = "";

  if (options.length === 0) {
    container.innerHTML =
      '<div class="no-results">⚠️ No coordinators available</div>';
    return;
  }

  options.forEach((opt) => {
    // Use String() to ensure consistent type comparison
    const checked =
      String(opt.CoordinatorID) === String(selectedId) ? "checked" : "";
    const div = document.createElement("div");
    div.className = "coordinator-option";
    div.setAttribute("data-coordinator-id", opt.CoordinatorID);
    div.setAttribute("data-coordinator-name", opt.CoordinatorName);
    div.innerHTML = `
      <input type="radio" 
             name="hp-coordinator" 
             id="hp-coord-${opt.CoordinatorID}" 
             value="${opt.CoordinatorID}"
             aria-label="${opt.CoordinatorName}"
             ${checked}>
      <label class="coordinator-label" for="hp-coord-${opt.CoordinatorID}">
        ${opt.CoordinatorName}
      </label>
    `;
    container.appendChild(div);
  });
}

/**
 * 初始化搜索/过滤功能
 */
function initCoordinatorSearch(): void {
  const searchInput = document.getElementById(
    "hp-coordinator-search"
  ) as HTMLInputElement;
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    const options = document.querySelectorAll(".coordinator-option");
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

    // 显示无结果提示
    const container = document.getElementById("hp-coordinator-options");
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

/**
 * 更新按钮文本显示选中的 Coordinator
 */
function updateButtonText(btn: HTMLElement, coordinatorText: string): void {
  // 提取前两个单词作为按钮显示（如 "Tao Yang"）
  const words = coordinatorText.split(/\s+/);
  const shortName = words.slice(0, 2).join(" ");
  (btn as HTMLInputElement).value = `Search: ${shortName}`;
}

/**
 * 保存配置按钮处理
 */
function handleSaveConfiguration(): void {
  console.log("[HomePage] handleSaveConfiguration called");

  const selectedRadio = document.querySelector(
    'input[name="hp-coordinator"]:checked'
  ) as HTMLInputElement;

  if (!selectedRadio) {
    console.warn("[HomePage] No coordinator selected");
    alert("⚠️ Please select a coordinator");
    return;
  }

  const coordinatorID = selectedRadio.value;
  const optionDiv = selectedRadio.closest(".coordinator-option");
  const coordinatorText =
    optionDiv?.getAttribute("data-coordinator-name") || "";

  console.log("[HomePage] Saving config:", { coordinatorID, coordinatorText });

  // 保存配置
  saveHomePageConfig({
    coordinatorID,
    coordinatorText,
    status: "1", // 默认使用 Open 状态
  });

  // 更新按钮文本
  const btn = document.getElementById("homePageSelector") as HTMLInputElement;
  if (btn) {
    updateButtonText(btn, coordinatorText);
    console.log("[HomePage] Button text updated to:", btn.value);
  }

  // 关闭配置卡片
  hideConfigCard();

  console.log("[HomePage] ✅ Configuration saved successfully");
  // Note: No alert popup - user feedback via button text update
}

/**
 * 取消/关闭配置卡片
 */
function hideConfigCard(): void {
  const card = document.getElementById("homepage-config-card");
  if (card) {
    card.classList.remove("show");
    setTimeout(() => {
      card.style.display = "none";
    }, 200);
  }

  // 重置搜索框
  const searchInput = document.getElementById(
    "hp-coordinator-search"
  ) as HTMLInputElement;
  if (searchInput) {
    searchInput.value = "";
    // 触发 input 事件重置过滤
    searchInput.dispatchEvent(new Event("input"));
  }
}

/**
 * 显示配置卡片
 */
async function showConfigCard(): Promise<void> {
  const card = document.getElementById("homepage-config-card");
  if (!card) {
    console.error("[HomePage] Config card not found");
    return;
  }

  console.log("[HomePage] Showing config card...");

  // 获取配置
  const config = getHomePageConfig();

  // 第一次显示时强制刷新缓存
  const forceRefresh = !coordinatorsLoadedOnce;
  if (forceRefresh) {
    console.log("[HomePage] First time showing card, forcing cache refresh");
    coordinatorsLoadedOnce = true;
  }

  // 获取 Coordinator 列表
  const options = await getCoordinators(forceRefresh);

  if (options.length > 0) {
    renderCoordinatorList(options, config.coordinatorID);
  } else {
    const container = document.getElementById("hp-coordinator-options");
    if (container) {
      container.innerHTML =
        '<div class="no-results">⚠️ Failed to load coordinators</div>';
    }
  }

  // 显示卡片 - CRITICAL: 必须先设置display再添加class
  card.style.display = "block";
  setTimeout(() => {
    card.classList.add("show");
  }, 10);

  console.log("[HomePage] Config card displayed");
}

/**
 * 初始化配置卡片事件监听
 * - Hover 显示/隐藏逻辑
 * - 保存/取消按钮事件
 * - 键盘导航支持
 */
function initConfigCardEvents(): void {
  let hoverTimer: number | null = null;
  let hideTimer: number | null = null;
  let isCardHovered = false;

  const btn = document.getElementById("homePageSelector");
  const card = document.getElementById("homepage-config-card");

  if (!btn || !card) return;

  // 按钮 hover 显示卡片（延迟 300ms）
  btn.addEventListener("mouseenter", () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    hoverTimer = window.setTimeout(() => {
      showConfigCard();
    }, 300);
  });

  btn.addEventListener("mouseleave", () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }

    if (!isCardHovered) {
      hideTimer = window.setTimeout(() => {
        hideConfigCard();
      }, 200);
    }
  });

  // 卡片 hover 保持显示
  card.addEventListener("mouseenter", () => {
    isCardHovered = true;
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  });

  card.addEventListener("mouseleave", () => {
    isCardHovered = false;
    hideTimer = window.setTimeout(() => {
      hideConfigCard();
    }, 200);
  });

  // 保存按钮
  const saveBtn = document.getElementById("hp-save-config-btn");
  saveBtn?.addEventListener("click", handleSaveConfiguration);

  // 取消/关闭按钮
  const cancelBtn = document.getElementById("hp-cancel-config-btn");
  const closeBtn = document.getElementById("hp-config-close-x");

  cancelBtn?.addEventListener("click", hideConfigCard);
  closeBtn?.addEventListener("click", hideConfigCard);

  // 键盘支持（Escape 关闭卡片）
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && card.classList.contains("show")) {
      hideConfigCard();
    }
  });

  // Enter 键保存（当焦点在配置卡片内时）
  card.addEventListener("keydown", (e) => {
    if (
      e.key === "Enter" &&
      e.target instanceof HTMLInputElement &&
      e.target.type === "radio"
    ) {
      handleSaveConfiguration();
    }
  });

  // 初始化搜索过滤
  initCoordinatorSearch();

  console.log("[HomePage] Config card events initialized");
}

/**
 * 初始化配置卡片 UI
 * 创建 HTML 结构并附加到按钮
 */
export function initHomePageConfigCardUI(): void {
  // 等待按钮创建
  const checkBtn = setInterval(() => {
    const btn = document.getElementById("homePageSelector");
    if (btn) {
      clearInterval(checkBtn);

      // 检查是否已创建配置卡片
      if (document.getElementById("homepage-config-card")) {
        console.log("[HomePage] Config card already exists");
        return;
      }

      // 创建配置卡片 HTML
      const cardHTML = `
        <div id="homepage-config-card" role="dialog" aria-label="Coordinator Selection">
          <div class="config-card-header">
            <h3>🔍 Search by Coordinator 配置</h3>
            <button class="config-close-btn" id="hp-config-close-x" aria-label="Close configuration">×</button>
          </div>
          <div class="config-card-body">
            <label for="hp-coordinator-search">选择 Coordinator:</label>
            <input type="text" 
                   id="hp-coordinator-search" 
                   class="config-search-input" 
                   placeholder="搜索 Coordinator..."
                   aria-label="Search coordinators">
            <div id="hp-coordinator-options" 
                 class="coordinator-list" 
                 role="radiogroup" 
                 aria-label="Coordinator options">
              <!-- Coordinator options will be rendered here -->
            </div>
          </div>
          <div class="config-card-footer">
            <button id="hp-save-config-btn" class="btn-primary" aria-label="Save configuration">💾 保存配置</button>
            <button id="hp-cancel-config-btn" class="btn-secondary" aria-label="Cancel">❌ 取消</button>
          </div>
        </div>
      `;

      // 将卡片附加到按钮的父元素
      const btnParent = btn.parentElement;
      if (btnParent) {
        // 创建临时容器
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = cardHTML;
        const card = tempDiv.firstElementChild;

        if (card) {
          btnParent.appendChild(card);
          console.log("[HomePage] Config card UI created");

          // 初始化事件监听
          initConfigCardEvents();

          // 根据当前配置更新按钮文本
          const config = getHomePageConfig();
          // Update button text if coordinatorID is configured (any saved coordinator)
          if (config.coordinatorID && config.coordinatorText) {
            updateButtonText(btn, config.coordinatorText);
            console.log(
              "[HomePage] Button text restored from saved config:",
              config.coordinatorText
            );
          }
        }
      }
    }
  }, 1000);
}
