import GM_fetch from "@trim21/gm-fetch";

// --- 1. TYPES & INTERFACES ---
interface Coordinator {
  id: number;
  name: string;
}

interface PhoneInfo {
  label: string;
  phone: string;
}

// --- 1. TYPES & INTERFACES ---
// (Coordinator, ApiParams 等接口不变)
// 新增：异常打钟的详情
interface AnomalyDetail {
  assignId: string;
  caregiverCode: string;
  caregiverName: string;
  officeName: string;
  caregiverPhone: string;
  caregiverTeam: string;
  patientName: string;
  callDate: string;
  callTime: string;
  callType: string;
  callerId: string;
  status: string;
}
// 新增：消息通知的详情接口
interface MessageDetail {
  notificationId: number;
  patientId: number;
  memberName: string;
  payerName: string;
  reason: string;
  note: string;
  status: string;
  createdDate: string;
  createdTime: string;
  createdDateTimeDisplay: string; // 格式化的日期时间显示，如 "12/13/2024 12:13:26 PM (Yesterday)"
  createdDateHoverDisplay: string; // 悬停显示的完整日期时间
  coordinatorName: string;
  officeName: string;
  fromUserName: string;
  canReplyClose: boolean;
  isPatientNote: boolean;
}

// 缓存的数据结构现在可以是三种类型之一
type CachedDetails = VisitDetail[] | AnomalyDetail[] | MessageDetail[];
interface TrackedData {
  count: number;
  details: CachedDetails;
  timestamp: number;
}

// 定义追踪任务类型
type CallType = 2 | 3 | "anomaly" | "message";

// --- TAB SYNC TYPES (Story 1: Plan D 多 Tab 同步) ---
/**
 * 存储在 localStorage 中的缓存数据结构
 */
interface SyncCacheData {
  /** 缓存的状态数据，使用 Record 便于 JSON 序列化 */
  data: Record<string, TrackedData>;
  /** 缓存时间戳 */
  timestamp: number;
  /** 产生此缓存的 Tab ID */
  sourceTabId: string;
}

/**
 * BroadcastChannel 消息结构
 */
interface SyncMessage {
  /** 消息类型 */
  type: "DATA_UPDATED" | "REQUEST_REFRESH" | "TAB_CLOSING";
  /** 发送消息的 Tab ID */
  sourceTabId: string;
  /** 消息时间戳 */
  timestamp: number;
}

// 追踪结果的详情
interface VisitDetail {
  patientName: string;
  phones: PhoneInfo[]; // 将电话号码分离出来
  assignmentId: string;
  admissionId: string;
  caregiverName: string;
  visitDate: string;
  coordinators: string;
  schedule: string;
  contract: string;
  discipline: string;
  serviceCode: string;
  caregiverTeam: string;
}

interface ApiParams {
  userID: string;
  appSecret: string;
  appVersion: string;
  version: string;
  minorVersion: string;
  appName: string;
}

export const visitMonitor = async () => {
  // --- FIX 1: 三层防御机制，彻底杜绝脚本重复执行 ---

  // 第 1 层：检查是否在iframe中运行
  if (window.self !== window.top) {
    console.log("Status Tracker script stopped: running in an iframe.");
    return;
  }

  // 第 2 层：检查 DOM 中是否已存在UI，如果存在，说明已运行过，立即退出。
  if (document.getElementById("tracker-container")) {
    console.log(
      "Status Tracker script stopped: UI container already exists in the DOM."
    );
    return;
  }

  // 第 3 层：检查全局标志位，但只有在DOM也存在时才阻止执行
  // 如果DOM不存在但标志存在，说明页面重新加载了，需要重新初始化
  const hasUI = document.getElementById("tracker-container") !== null;
  const hasFlag = (window.top as any).visitMonitorHasRun;

  if (hasFlag && hasUI) {
    console.log(
      "Status Tracker script stopped: already running with UI present."
    );
    return;
  }

  // 如果到这里，要么标志不存在，要么UI不存在（页面重载），设置标志并继续
  (window.top as any).visitMonitorHasRun = true;

  // --- 状态与常量 ---
  const STORAGE_KEY = "hha_coordinator_tracker_list";
  let trackedCoordinators: Coordinator[] = [];
  let allCoordinators: Coordinator[] = [];
  let tempTrackedIds: Set<number> = new Set();
  // 新增：用于缓存追踪结果和 Office IDs
  const statusDataCache = new Map<string, TrackedData>();
  let officeIdString: string | null = null;

  // --- TAB SYNC MANAGER (升级版：支持跨域名多 Tab 同步) ---
  /**
   * TabSyncManager - 管理多 Tab 之间的数据同步（支持跨域名）
   *
   * 功能：
   * - 使用 GM_setValue/GM_getValue 存储共享数据，实现跨域名数据持久化
   * - 使用 BroadcastChannel 实时通知同域名内的其他 Tab
   * - 使用轮询机制检测跨域名的数据更新
   * - 提供缓存新鲜度判断，决定是否需要重新请求 API
   * - 边缘情况处理（降级、错误处理）
   *
   * 升级说明：
   * - 从 localStorage 升级到 GM_setValue，实现 app.hhaexchange.com 和 mt3.1voicetech.com 之间的数据共享
   * - BroadcastChannel 仍用于同域名实时通知，跨域通过轮询实现
   *
   * @see docs/adr/001-multi-tab-sync.md - 架构决策记录
   * @see docs/stories/epic-1-multi-tab-sync.md - Epic 详情
   */
  class TabSyncManager {
    /** 当前 Tab 的唯一标识符 */
    public readonly tabId: string;
    /** BroadcastChannel 实例，用于同域名 Tab 间实时通信 */
    private channel: BroadcastChannel | null = null;
    /** 是否支持 BroadcastChannel API */
    private readonly channelSupported: boolean;
    /** 消息回调函数 */
    private messageCallback: ((msg: SyncMessage) => void) | null = null;
    /** 跨域轮询定时器 ID */
    private pollIntervalId: number | null = null;
    /** 上次检查的缓存时间戳（用于检测跨域更新） */
    private lastKnownTimestamp: number = 0;

    // --- 常量配置 ---
    /** GM_setValue 缓存键名（跨域共享） */
    private readonly CACHE_KEY = "hha_visit_monitor_cache";
    /** BroadcastChannel 频道名称（同域名内使用） */
    private readonly CHANNEL_NAME = "hha-visit-monitor-sync";
    /** 缓存新鲜阈值：30秒内视为新鲜，直接使用 */
    private readonly FRESH_THRESHOLD = 30 * 1000;
    /** 缓存过期阈值：2分钟后视为过期，必须刷新 */
    private readonly STALE_THRESHOLD = 2 * 60 * 1000;
    /** 跨域轮询间隔：5秒检查一次是否有其他域名的更新 */
    private readonly POLL_INTERVAL = 5 * 1000;

    constructor() {
      // 生成唯一的 Tab ID（包含域名信息以便调试）
      const domain = window.location.hostname.split(".")[0];
      this.tabId = `${domain}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      // 检测 BroadcastChannel 支持
      this.channelSupported = typeof BroadcastChannel !== "undefined";

      if (this.channelSupported) {
        try {
          this.channel = new BroadcastChannel(this.CHANNEL_NAME);
          console.log(
            `[TabSyncManager] Tab ${this.tabId} initialized with BroadcastChannel (same-origin realtime)`
          );
        } catch (e) {
          console.warn(
            "[TabSyncManager] Failed to create BroadcastChannel:",
            e
          );
          this.channel = null;
        }
      } else {
        console.warn(
          "[TabSyncManager] BroadcastChannel not supported, using polling only"
        );
      }

      // 初始化时记录当前缓存时间戳
      const cached = this.getCachedData();
      if (cached) {
        this.lastKnownTimestamp = cached.timestamp;
      }

      // 注册 Tab 关闭清理
      window.addEventListener("beforeunload", () => this.cleanup());

      console.log(
        `[TabSyncManager] Initialized with cross-domain support via GM_setValue`
      );
    }

    /**
     * 从 GM_getValue 获取缓存的数据（跨域共享）
     * @returns 缓存数据，如果不存在或解析失败则返回 null
     */
    getCachedData(): SyncCacheData | null {
      try {
        const stored = GM_getValue<string>(this.CACHE_KEY, "");
        if (!stored) return null;

        const parsed = JSON.parse(stored);

        // 增强数据结构验证
        if (!this.isValidCacheData(parsed)) {
          console.warn(
            "[TabSyncManager] Invalid cache structure, clearing corrupted data"
          );
          this.clearCache();
          return null;
        }

        return parsed as SyncCacheData;
      } catch (e) {
        // JSON 解析错误处理
        if (e instanceof SyntaxError) {
          console.error(
            "[TabSyncManager] JSON parse error, clearing corrupted cache:",
            (e as Error).message
          );
          this.clearCache();
        } else {
          console.error("[TabSyncManager] Failed to read cached data:", e);
        }
        return null;
      }
    }

    /**
     * 验证缓存数据结构是否有效
     * @param data - 待验证的数据
     */
    private isValidCacheData(data: unknown): data is SyncCacheData {
      if (!data || typeof data !== "object") return false;
      const obj = data as Record<string, unknown>;

      // 检查必需字段
      if (typeof obj.timestamp !== "number") return false;
      if (typeof obj.sourceTabId !== "string") return false;
      if (!obj.data || typeof obj.data !== "object") return false;

      // 检查 timestamp 是否合理（不超过 24 小时）
      const age = Date.now() - (obj.timestamp as number);
      if (age < 0 || age > 24 * 60 * 60 * 1000) {
        console.warn(
          "[TabSyncManager] Cache timestamp out of reasonable range"
        );
        return false;
      }

      return true;
    }

    /**
     * 将数据保存到 GM_setValue（跨域共享）
     * @param data - Map<string, TrackedData> 格式的状态数据
     */
    setCachedData(data: Map<string, TrackedData>): void {
      try {
        // 将 Map 转换为普通对象以便 JSON 序列化
        const dataObj: Record<string, TrackedData> = {};
        data.forEach((value, key) => {
          dataObj[key] = value;
        });

        const cacheData: SyncCacheData = {
          data: dataObj,
          timestamp: Date.now(),
          sourceTabId: this.tabId,
        };

        const jsonStr = JSON.stringify(cacheData);

        // 检查数据大小
        const sizeKB = new Blob([jsonStr]).size / 1024;
        if (sizeKB > 4096) {
          // 4MB 警告阈值
          console.warn(
            `[TabSyncManager] Cache size is large: ${sizeKB.toFixed(1)}KB`
          );
        }

        GM_setValue(this.CACHE_KEY, jsonStr);
        this.lastKnownTimestamp = cacheData.timestamp;
        console.log(
          `[TabSyncManager] Cache updated by Tab ${
            this.tabId
          }, size: ${sizeKB.toFixed(1)}KB (cross-domain shared)`
        );
      } catch (e) {
        console.error("[TabSyncManager] Failed to save cache:", e);
      }
    }

    /**
     * 通过 BroadcastChannel 向同域名的其他 Tab 广播消息
     * 注意：跨域名的 Tab 通过轮询机制获取更新
     * @param message - 要广播的消息
     */
    broadcast(message: SyncMessage): void {
      if (this.channel) {
        try {
          this.channel.postMessage(message);
          console.log(
            `[TabSyncManager] Broadcasted ${message.type} from Tab ${this.tabId} (same-origin)`
          );
        } catch (e) {
          console.error("[TabSyncManager] Failed to broadcast message:", e);
        }
      }
      // 跨域名的 Tab 会通过轮询机制检测到 GM_setValue 的更新
    }

    /**
     * 注册消息监听器
     * - BroadcastChannel: 用于同域名实时通知
     * - 轮询: 用于跨域名数据同步检测
     * @param callback - 收到消息时的回调函数
     */
    onMessage(callback: (msg: SyncMessage) => void): void {
      this.messageCallback = callback;

      // 方案 1: BroadcastChannel（同域名实时通知）
      if (this.channel) {
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          callback(event.data);
        };

        this.channel.onmessageerror = (event) => {
          console.error(
            "[TabSyncManager] BroadcastChannel message error:",
            event
          );
        };
      }

      // 方案 2: 轮询（跨域名数据同步）
      // GM_setValue 的变化不会触发事件，所以需要轮询检测
      this.startCrossOriginPolling();

      console.log(
        `[TabSyncManager] Message listeners registered (BroadcastChannel: ${!!this
          .channel}, CrossOriginPolling: ${this.POLL_INTERVAL}ms)`
      );
    }

    /**
     * 启动跨域轮询，定期检查是否有其他域名的更新
     */
    private startCrossOriginPolling(): void {
      if (this.pollIntervalId) {
        clearInterval(this.pollIntervalId);
      }

      this.pollIntervalId = window.setInterval(() => {
        this.checkForCrossOriginUpdates();
      }, this.POLL_INTERVAL);

      console.log(
        `[TabSyncManager] Cross-origin polling started (interval: ${this.POLL_INTERVAL}ms)`
      );
    }

    /**
     * 检查是否有跨域更新
     * 如果检测到其他 Tab（可能来自其他域名）更新了数据，则触发回调
     */
    private checkForCrossOriginUpdates(): void {
      const cached = this.getCachedData();
      if (!cached) return;

      // 检查是否有新的更新（时间戳变化 + 不是自己更新的）
      if (
        cached.timestamp > this.lastKnownTimestamp &&
        cached.sourceTabId !== this.tabId
      ) {
        console.log(
          `[TabSyncManager] Cross-origin update detected from Tab ${cached.sourceTabId}`
        );

        // 更新已知时间戳
        this.lastKnownTimestamp = cached.timestamp;

        // 触发回调
        if (this.messageCallback) {
          this.messageCallback({
            type: "DATA_UPDATED",
            sourceTabId: cached.sourceTabId,
            timestamp: cached.timestamp,
          });
        }
      }
    }

    /**
     * 判断缓存的新鲜度，决定是否需要重新请求 API
     * @param cachedTimestamp - 缓存的时间戳
     * @returns 'USE' | 'USE_AND_REFRESH' | 'REFRESH'
     *   - USE: 缓存新鲜（<30s），直接使用，不请求 API
     *   - USE_AND_REFRESH: 缓存可用但需刷新（30s-2min），先显示再后台刷新
     *   - REFRESH: 缓存过期（>2min），必须立即刷新
     */
    shouldFetchFresh(
      cachedTimestamp: number
    ): "USE" | "USE_AND_REFRESH" | "REFRESH" {
      const age = Date.now() - cachedTimestamp;

      if (age < this.FRESH_THRESHOLD) {
        return "USE";
      } else if (age < this.STALE_THRESHOLD) {
        return "USE_AND_REFRESH";
      } else {
        return "REFRESH";
      }
    }

    /**
     * 停止跨域轮询
     */
    private stopCrossOriginPolling(): void {
      if (this.pollIntervalId) {
        clearInterval(this.pollIntervalId);
        this.pollIntervalId = null;
        console.log(`[TabSyncManager] Cross-origin polling stopped`);
      }
    }

    /**
     * 清理资源，在 Tab 关闭时调用
     */
    cleanup(): void {
      // 停止跨域轮询
      this.stopCrossOriginPolling();

      if (this.channel) {
        // 通知同域名的其他 Tab 本 Tab 即将关闭
        this.broadcast({
          type: "TAB_CLOSING",
          sourceTabId: this.tabId,
          timestamp: Date.now(),
        });
        this.channel.close();
        this.channel = null;
      }
      console.log(`[TabSyncManager] Tab ${this.tabId} cleanup complete`);
    }

    /**
     * 清除缓存（跨域共享）
     */
    clearCache(): void {
      try {
        GM_setValue(this.CACHE_KEY, "");
        this.lastKnownTimestamp = 0;
        console.log(`[TabSyncManager] Cache cleared`);
      } catch (e) {
        console.error("[TabSyncManager] Failed to clear cache:", e);
      }
    }

    /**
     * 获取调试信息
     */
    getDebugInfo(): object {
      return {
        tabId: this.tabId,
        channelSupported: this.channelSupported,
        channelActive: !!this.channel,
        cacheKey: this.CACHE_KEY,
        hasCachedData: !!this.getCachedData(),
        cachedDataAge: this.getCachedData()?.timestamp
          ? `${((Date.now() - this.getCachedData()!.timestamp) / 1000).toFixed(
              1
            )}s`
          : "N/A",
        crossOriginPolling: !!this.pollIntervalId,
        lastKnownTimestamp: this.lastKnownTimestamp,
      };
    }
  }

  // 实例化 TabSyncManager（供后续 Story 使用）
  const tabSyncManager = new TabSyncManager();

  // --- REWRITTEN: 全新的 API 参数管理器 ---
  const apiParamProvider = {
    params: null as
      | (ApiParams & {
          sessionID: string;
          viewState: string;
          viewStateGenerator: string;
          vendorID: string;
        })
      | null,

    /**
     * 获取并缓存所有API请求所需的基础参数
     */
    async get() {
      // 如果已经缓存了参数，直接返回
      if (this.params) return this.params;

      console.log("Fetching API parameters for the first time...");
      const url =
        "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
      const r = (await GM_fetch(url, { method: "GET" })) as Response & {
        rawBody: Blob;
      };
      const text = await r.rawBody.text();

      /**
       * 辅助函数：使用正则表达式从大段文本中精确提取指定键的值
       * @param key 要查找的键 (例如 'userID')
       * @param sourceText 从中查找的源文本
       */
      const getParamFromText = (
        key: string,
        sourceText: string
      ): string | null => {
        // 正则表达式查找类似 'key: 'value'' 的模式
        const regex = new RegExp(`${key}\\s*:\\s*'([^']+)'`);
        const match = sourceText.match(regex);
        // 如果匹配成功，返回捕获组1 (也就是单引号里的值)
        return match ? match[1] : null;
      };

      /**
       * 辅助函数：从HTML中提取隐藏input的值
       */
      const getInputValue = (id: string, sourceText: string): string | null => {
        const match = sourceText.match(
          new RegExp(`id="${id}"[\\s\\S]*?value="([^"]*)"`)
        );
        return match ? match[1] : null;
      };

      // 组装并缓存所有参数
      this.params = {
        userID: getParamFromText("userID", text)!,
        appSecret: getParamFromText("appSecret", text)!,
        appVersion: getParamFromText("appVersion", text)!,
        version: getParamFromText("version", text)!,
        minorVersion: getParamFromText("minorVersion", text)!,
        appName: getParamFromText("appName", text)!,
        sessionID: getParamFromText("sessionID", text)!,
        vendorID: getParamFromText("vendorID", text)!,
        viewState: getInputValue("__VIEWSTATE", text)!,
        viewStateGenerator: getInputValue("__VIEWSTATEGENERATOR", text)!,
      };

      // 进行一次严格的检查，确保所有关键参数都已成功获取
      for (const [key, value] of Object.entries(this.params)) {
        if (!value) {
          throw new Error(`Failed to extract critical API parameter: ${key}`);
        }
      }

      console.log("API parameters cached successfully:", this.params);
      return this.params;
    },

    /**
     * 从 HTML 文本中解析并更新 ViewState
     */
    parseViewState(htmlText: string): {
      viewState: string;
      viewStateGenerator: string;
    } {
      const getInputValue = (id: string, sourceText: string): string | null => {
        const match = sourceText.match(
          new RegExp(`id="${id}"[\\s\\S]*?value="([^"]*)"`)
        );
        return match ? match[1] : null;
      };

      const viewState = getInputValue("__VIEWSTATE", htmlText);
      const viewStateGenerator = getInputValue(
        "__VIEWSTATEGENERATOR",
        htmlText
      );

      if (viewState && this.params) {
        this.params.viewState = viewState;
      }
      if (viewStateGenerator && this.params) {
        this.params.viewStateGenerator = viewStateGenerator;
      }

      return {
        viewState: viewState || "",
        viewStateGenerator: viewStateGenerator || "",
      };
    },
  };

  // --- 2. HTML 结构创建 ---
  const container = document.createElement("div");
  container.id = "tracker-container";
  const dragHandle = document.createElement("div");
  dragHandle.id = "tracker-drag-handle";
  dragHandle.innerHTML = "🔔";
  const panel = document.createElement("div");
  panel.id = "tracker-panel";
  panel.innerHTML = `
         <div id="tracking-view" class="tracker-view">
            <div class="tracker-header">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="last-refresh-time" style="font-size: 12px; color: #666;">上次更新：--:--:--</span>
              </div>
              <button id="edit-list-btn" class="tracker-header-btn">编辑追踪列表</button>
            </div>
            <div class="tracker-content"><table class="tracker-table"><thead><tr>
                    <th style="width:40px;color: #333 !important;">编号</th>
                    <th style="width:40px;color: #333 !important;"class="col-coordinator">辅导员 (Ext.)</th>
                    <th style="width:80px;color: #333 !important;">上班钟</th>
                    <th style="width:80px;color: #333 !important;">下班钟</th>
                    <th style="width:80px;color: #333 !important;">异常打钟</th>
                    <th style="width:80px;color: #333 !important;">消息</th>
                </tr></thead><tbody id="tracking-table-body"></tbody></table></div>
        </div>
        <div id="editing-view" class="tracker-view hidden">
            <div class="tracker-header"><button id="back-btn" class="tracker-header-btn back-btn">←</button><h3 style="color: #333 !important;">编辑追踪列表</h3></div>
            <div id="editing-content" class="tracker-content"></div>
            <div class="tracker-footer"><button id="cancel-btn" class="tracker-header-btn">取消</button><button id="save-btn" class="tracker-header-btn" style="background-color:#007bff;color:white">保存</button></div>
        </div>
    `;
  container.appendChild(dragHandle);
  container.appendChild(panel);
  document.body.appendChild(container);

  // --- 3. DOM 元素获取 ---
  const trackingView = document.getElementById(
    "tracking-view"
  ) as HTMLDivElement;
  const editingView = document.getElementById("editing-view") as HTMLDivElement;
  const trackingTableBody = document.getElementById(
    "tracking-table-body"
  ) as HTMLTableSectionElement;
  const editingContent = document.getElementById(
    "editing-content"
  ) as HTMLDivElement;

  // --- 5. 核心功能逻辑 ---

  // --- Story 2: 缓存恢复辅助函数 ---
  /**
   * 从缓存数据恢复到 statusDataCache
   * @param data - Record<string, TrackedData> 格式的缓存数据
   */
  function restoreFromCache(data: Record<string, TrackedData>): void {
    statusDataCache.clear();
    for (const [key, value] of Object.entries(data)) {
      statusDataCache.set(key, value);
    }
    console.log(
      `[Story2] Restored ${Object.keys(data).length} items from cache`
    );
  }

  /**
   * 更新 UI 上的"上次更新时间"显示
   * @param timestamp - 时间戳
   */
  function updateLastRefreshTime(timestamp: number): void {
    const timeEl = document.getElementById("last-refresh-time");
    if (timeEl) {
      const date = new Date(timestamp);
      timeEl.textContent = `（上次更新: ${date.toLocaleTimeString()}）`;
    }
  }

  function showToast(message: string, type: "success" | "error"): void {
    const toast = document.createElement("div");
    toast.className = `tracker-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2500);
  }

  function switchView(
    fromView: HTMLElement,
    toView: HTMLElement,
    direction: "forward" | "backward" = "forward"
  ): void {
    toView.classList.remove("hidden");

    if (direction === "forward") {
      // 前进动画：从右往左
      // 1. 设置 toView 初始位置在右边
      toView.style.transform = "translateX(100%)";
      // 2. 强制浏览器渲染
      toView.offsetHeight;
      // 3. 添加 transition 并移动到中间
      toView.style.transition = "transform 0.3s ease-in-out";
      toView.style.transform = "translateX(0)";
      // 4. fromView 向左滑出
      fromView.style.transition = "transform 0.3s ease-in-out";
      fromView.style.transform = "translateX(-100%)";
    } else {
      // 后退动画：从左往右
      // 1. 设置 toView 初始位置在左边
      toView.style.transform = "translateX(-100%)";
      // 2. 强制浏览器渲染
      toView.offsetHeight;
      // 3. 添加 transition 并移动到中间
      toView.style.transition = "transform 0.3s ease-in-out";
      toView.style.transform = "translateX(0)";
      // 4. fromView 向右滑出
      fromView.style.transition = "transform 0.3s ease-in-out";
      fromView.style.transform = "translateX(100%)";
    }

    setTimeout(() => {
      fromView.classList.add("hidden");
      // 清理 inline styles
      fromView.style.transform = "";
      fromView.style.transition = "";
    }, 300);
  }

  function loadTrackedCoordinators(): void {
    try {
      // 使用 GM_getValue 实现跨域名同步（在 mt3.1voicetech.com 和 app.hhaexchange.com 之间共享）
      const stored = GM_getValue<string>(STORAGE_KEY, "");
      trackedCoordinators = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(
        "Failed to load or parse tracked coordinators from GM_getValue:",
        error
      );
      trackedCoordinators = [];
    }
  }

  function saveTrackedCoordinators(): void {
    try {
      // 使用 GM_setValue 实现跨域名同步
      GM_setValue(STORAGE_KEY, JSON.stringify(trackedCoordinators));
    } catch (error) {
      console.error(
        "Failed to save tracked coordinators to GM_setValue:",
        error
      );
      showToast("保存失败", "error");
    }
  }

  async function fetchAllCoordinators(): Promise<Coordinator[]> {
    console.log("Step 1: Fetching initial params...");
    const initialUrl =
      "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
    const r = (await GM_fetch(initialUrl, { method: "GET" })) as Response & {
      rawBody: Blob;
    };
    const textResult = await r.rawBody.text();

    const getParam = (name: string) =>
      textResult.match(
        new RegExp(`var\\s+${name}\\s*=\\s*['"]([^'"]+)['"];`)
      )?.[1];
    const apiParams: ApiParams = {
      userID: getParam("gnUserID")!,
      appSecret: getParam("gnApSc")!,
      appVersion: getParam("gnAppVersion")!,
      version: getParam("gnVersion")!,
      minorVersion: getParam("gnMinorVersion")!,
      appName: getParam("gnApNm")!,
    };

    if (!apiParams.userID || !apiParams.appSecret) {
      throw new Error("Failed to extract initial API parameters.");
    }

    console.log("Step 2: Fetching office IDs...");
    const officeIds = await getOfficeIds();

    console.log("Step 3: Fetching coordinators...");
    const coordinatorUrl = `${initialUrl}/GetCoordinatorForOffice`;
    const officeXml = `<Offices>${officeIds
      .split(",")
      .map((id) => `<Office ID="${id}"/>`)
      .join("")}</Offices>`;

    // FIXED: Corrected the GM_fetch call and response handling
    const coordinatorRes = await GM_fetch(coordinatorUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ officeXml }),
    });
    const coordinatorText = await (coordinatorRes as any).rawBody.text();
    const coordinatorData = JSON.parse(coordinatorText);

    const coordinatorsRaw = JSON.parse(coordinatorData.d);
    const coordinators: Coordinator[] = coordinatorsRaw
      .map((c: any) => ({
        id: c.CoordinatorID,
        name:
          c.CoordinatorName.match(
            /.*?ext\.\s*\d+|[^\s@]+(?:\s+[^\s@]+)*/
          )?.[0] || c.CoordinatorName,
      }))
      .filter((c: Coordinator) => c.name.toLowerCase() !== "default");

    console.log("Step 3 Success. Found coordinators:", coordinators.length);
    return coordinators.sort((a, b) => a.name.localeCompare(b.name));
  }

  // --- 全新的追踪数据获取与解析 ---

  // --- 消息监控相关的缓存 ---
  let messageApiCache: {
    payers: string | null;
    payerIdWithContractChhaId: { key: number; value: number }[] | null;
    reasonIds: string | null;
    officeIds: string | null;
    timestamp: number;
  } = {
    payers: null,
    payerIdWithContractChhaId: null,
    reasonIds: null,
    officeIds: null,
    timestamp: 0,
  };

  // 缓存从 app.hhaexchange.com 获取的 API 参数
  let cachedMessageApiParams: {
    appVersion: string;
    version: string;
    minorVersion: string;
    userID: string;
    appSecret: string;
    appName: string;
  } | null = null;

  /**
   * 获取消息 API 所需的基础参数
   * 优先从页面全局变量获取，如果不存在则从 app.hhaexchange.com 动态获取
   * 这解决了在 mt3.1voicetech.com 上无法获取认证参数的问题
   */
  async function getMessageApiParams(): Promise<{
    appVersion: string;
    version: string;
    minorVersion: string;
    userID: string;
    appSecret: string;
    appName: string;
  }> {
    // 如果已缓存，直接返回
    if (cachedMessageApiParams) {
      console.log("[VisitMonitor] getMessageApiParams: using cached params");
      return cachedMessageApiParams;
    }

    // 尝试从页面全局变量获取
    const win = (
      typeof unsafeWindow !== "undefined" ? unsafeWindow : window
    ) as any;

    let params = {
      appVersion: win.gnAppVersion || "ENT",
      version: win.gnVersion || "25.07",
      minorVersion: win.gnMinorVersion || "1.0",
      userID: String(win.gnUserID || ""),
      appSecret: win.gnApSc || "",
      appName: win.gnApNm || "ENT",
    };

    // 如果关键参数缺失（如在 mt3.1voicetech.com 上），则从 app.hhaexchange.com 动态获取
    if (!params.userID || !params.appSecret) {
      console.log(
        "[VisitMonitor] getMessageApiParams: page params missing, fetching from app.hhaexchange.com..."
      );

      try {
        const initialUrl =
          "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
        const r = (await GM_fetch(initialUrl, {
          method: "GET",
        })) as Response & {
          rawBody: Blob;
        };
        const textResult = await r.rawBody.text();

        const getParam = (name: string) =>
          textResult.match(
            new RegExp(`var\\s+${name}\\s*=\\s*['"]([^'"]+)['"];`)
          )?.[1];

        params = {
          userID: getParam("gnUserID") || "",
          appSecret: getParam("gnApSc") || "",
          appVersion: getParam("gnAppVersion") || "ENT",
          version: getParam("gnVersion") || "25.07",
          minorVersion: getParam("gnMinorVersion") || "1.0",
          appName: getParam("gnApNm") || "ENT",
        };

        if (!params.userID || !params.appSecret) {
          console.error(
            "[VisitMonitor] getMessageApiParams: Failed to extract params from app.hhaexchange.com"
          );
        } else {
          console.log(
            "[VisitMonitor] getMessageApiParams: Successfully fetched from app.hhaexchange.com"
          );
        }
      } catch (error) {
        console.error(
          "[VisitMonitor] getMessageApiParams: Error fetching from app.hhaexchange.com:",
          error
        );
      }
    }

    // 缓存参数
    cachedMessageApiParams = params;
    console.log("[VisitMonitor] getMessageApiParams:", params);
    return params;
  }

  /**
   * 获取消息 API 的 base URL
   */
  async function getMessageApiBaseUrl(): Promise<string> {
    const params = await getMessageApiParams();
    return `https://app.hhaexchange.com/ENTP${params.version.replace(
      ".",
      ""
    )}010000`;
  }

  /**
   * 获取消息 API 所需的 OfficeIDs (数组形式，用于其他API调用)
   */
  async function getMessageOfficeIdsArray(): Promise<number[]> {
    const officeIds = await getMessageOfficeIds();
    return officeIds
      .split(",")
      .map(Number)
      .filter((n) => n > 0);
  }

  /**
   * 获取消息 API 所需的 Contract Payers 列表（包含 LinkedContractChhaId 映射）
   * 使用 GetContractPayersList API (正确的API)
   */
  async function getMessageContractPayers(): Promise<{
    payers: string;
    payerIdWithContractChhaId: { key: number; value: number }[];
  }> {
    if (messageApiCache.payers && messageApiCache.payerIdWithContractChhaId) {
      return {
        payers: messageApiCache.payers,
        payerIdWithContractChhaId: messageApiCache.payerIdWithContractChhaId,
      };
    }

    const baseUrl = await getMessageApiBaseUrl();
    const params = await getMessageApiParams();
    const officeIds = await getMessageOfficeIdsArray();

    console.log(
      "[VisitMonitor] getMessageContractPayers - fetching from:",
      `${baseUrl}/api/PayerNotification/GetContractPayersList`
    );
    console.log(
      "[VisitMonitor] getMessageContractPayers - using officeIds:",
      officeIds
    );

    const res = (await GM_fetch(
      `${baseUrl}/api/PayerNotification/GetContractPayersList`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          appsecret: params.appSecret,
          appname: params.appName,
        },
        body: JSON.stringify({
          appVersion: params.appVersion,
          version: params.version,
          minorVersion: params.minorVersion,
          userID: params.userID,
          vendorId: "469", // ProviderId
          listOfficeId: officeIds,
          internalNote: "Both",
        }),
      }
    )) as Response & { rawBody: Blob };

    const rawText = await res.rawBody.text();
    console.log(
      "[VisitMonitor] getMessageContractPayers - response status:",
      res.status
    );

    // 检查 API 状态码 - 非 200 时返回空数据
    if (res.status !== 200) {
      console.warn(
        `[VisitMonitor] getMessageContractPayers - API returned status ${res.status}, skipping`
      );
      return { payers: "", payerIdWithContractChhaId: [] };
    }

    const data = JSON.parse(rawText);
    const payerList = data?.ListPayers || [];
    console.log(
      "[VisitMonitor] getMessageContractPayers - payer count:",
      payerList.length
    );

    // 提取 PayerId 列表
    const payerIds = payerList
      .map((p: { PayerId: number }) => p.PayerId)
      .join(",");

    // 构建 PayerId -> LinkedContractChhaId 映射
    const payerIdWithContractChhaId = payerList.map(
      (p: { PayerId: number; LinkedContractChhaId: number }) => ({
        key: p.PayerId,
        value: p.LinkedContractChhaId || 0,
      })
    );

    messageApiCache.payers = payerIds;
    messageApiCache.payerIdWithContractChhaId = payerIdWithContractChhaId;

    console.log(
      "[VisitMonitor] getMessageContractPayers - result payers:",
      payerIds.substring(0, 80) + "..."
    );
    return { payers: payerIds, payerIdWithContractChhaId };
  }

  /**
   * 获取消息 API 所需的 Payers 列表 (向后兼容的简化版本)
   */
  async function getMessagePayers(): Promise<string> {
    const { payers } = await getMessageContractPayers();
    return payers;
  }

  /**
   * 获取消息 API 所需的 ReasonIDs
   */
  async function getMessageReasonIds(): Promise<string> {
    if (messageApiCache.reasonIds) return messageApiCache.reasonIds;

    const baseUrl = await getMessageApiBaseUrl();
    const params = await getMessageApiParams();

    try {
      // 首先获取 Contract Payers 数据（包含 PayerId 和 LinkedContractChhaId 映射）
      const { payers, payerIdWithContractChhaId } =
        await getMessageContractPayers();
      const payerIds = payers
        ? payers
            .split(",")
            .map(Number)
            .filter((n) => n > 0)
        : [];

      console.log(
        "[VisitMonitor] getMessageReasonIds - fetching from:",
        `${baseUrl}/api/PayerNotification/GetNotificationReasonsNewLook`
      );
      console.log(
        "[VisitMonitor] getMessageReasonIds - using",
        payerIds.length,
        "payers"
      );

      const res = (await GM_fetch(
        `${baseUrl}/api/PayerNotification/GetNotificationReasonsNewLook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            appsecret: params.appSecret,
            appname: params.appName,
          },
          body: JSON.stringify({
            appVersion: params.appVersion,
            version: params.version,
            minorVersion: params.minorVersion,
            userID: params.userID,
            ListPayerId: payerIds,
            InternalID: -1,
            // 使用正确的映射：key = PayerId, value = LinkedContractChhaId
            ListPayerIdWithContractChhaId: payerIdWithContractChhaId,
            PayerCount: payerIds.length,
            CommunicationType: 2, // Patient type - 这里用数字类型
          }),
        }
      )) as Response & { rawBody: Blob };

      const rawText = await res.rawBody.text();
      console.log(
        "[VisitMonitor] getMessageReasonIds - response status:",
        res.status
      );

      // 检查 API 状态码 - 非 200 时返回空数据
      if (res.status !== 200) {
        console.warn(
          `[VisitMonitor] getMessageReasonIds - API returned status ${res.status}, skipping`
        );
        return "";
      }

      const data = JSON.parse(rawText);
      console.log(
        "[VisitMonitor] getMessageReasonIds - data length:",
        data?.length
      );

      // 检查 data 是否为数组
      if (!Array.isArray(data)) {
        console.warn(
          "[VisitMonitor] getMessageReasonIds - data is not an array, skipping",
          typeof data
        );
        return "";
      }

      const reasonIds = data
        .map((r: { ReasonId: number }) => r.ReasonId)
        .join(",");
      console.log(
        "[VisitMonitor] getMessageReasonIds - result:",
        reasonIds.substring(0, 100) + "..."
      );
      messageApiCache.reasonIds = reasonIds;
      return reasonIds;
    } catch (error) {
      console.error("[VisitMonitor] getMessageReasonIds - error:", error);
      return "";
    }
  }

  /**
   * 获取消息 API 所需的 OfficeIDs
   * 只包含 Type: "1" 的实际 Office，排除 Type: "0" 的分组/父级
   */
  async function getMessageOfficeIds(): Promise<string> {
    if (messageApiCache.officeIds) return messageApiCache.officeIds;

    const baseUrl = await getMessageApiBaseUrl();
    const params = await getMessageApiParams();

    try {
      console.log(
        "[VisitMonitor] getMessageOfficeIds - fetching from:",
        `${baseUrl}/api/Common/GetAllOffices`
      );
      const res = (await GM_fetch(`${baseUrl}/api/Common/GetAllOffices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          appsecret: params.appSecret,
          appname: params.appName,
        },
        body: JSON.stringify({
          appVersion: params.appVersion,
          version: params.version,
          minorVersion: params.minorVersion,
          userID: params.userID,
          SelectionType: "filter",
          PermissionName: "Smart Map Beta",
        }),
      })) as Response & { rawBody: Blob };

      const rawText = await res.rawBody.text();
      console.log(
        "[VisitMonitor] getMessageOfficeIds - response status:",
        res.status
      );

      // 检查 API 状态码 - 非 200 时返回空数据（常见于跨域认证问题）
      if (res.status !== 200) {
        console.warn(
          `[VisitMonitor] getMessageOfficeIds - API returned status ${res.status}, skipping message tracking`
        );
        return "";
      }

      const data = JSON.parse(rawText);
      console.log(
        "[VisitMonitor] getMessageOfficeIds - data length:",
        data?.length
      );

      // 检查 data 是否为数组
      if (!Array.isArray(data)) {
        console.warn(
          "[VisitMonitor] getMessageOfficeIds - data is not an array, skipping",
          typeof data
        );
        return "";
      }

      // 只包含 Type: "1" 的实际 Office，排除 Type: "0" 的分组/父级（如 OfficeID 720）
      const officeIds = data
        .filter(
          (o: { OfficeID: number; Type: string }) =>
            o.OfficeID > 0 && o.Type === "1"
        )
        .map((o: { OfficeID: number }) => o.OfficeID)
        .join(",");
      console.log("[VisitMonitor] getMessageOfficeIds - result:", officeIds);
      messageApiCache.officeIds = officeIds;
      return officeIds;
    } catch (error) {
      console.error("[VisitMonitor] getMessageOfficeIds - error:", error);
      return "";
    }
  }

  /**
   * 获取指定 Coordinator 的消息通知
   * @param coordinatorId - Coordinator ID
   * @returns TrackedData 包含消息数量和详情
   */
  async function fetchMessageReport(
    coordinatorId: number
  ): Promise<TrackedData> {
    try {
      const baseUrl = await getMessageApiBaseUrl();
      const params = await getMessageApiParams();

      // 先获取 payers（因为 reasonIds 依赖它）
      const payers = await getMessagePayers();

      // 然后并行获取 reasonIds 和 officeIds
      const [reasonIds, officeIds] = await Promise.all([
        getMessageReasonIds(),
        getMessageOfficeIds(),
      ]);

      console.log(
        "[VisitMonitor] fetchMessageReport - got payers:",
        payers ? payers.substring(0, 50) + "..." : "(empty)"
      );
      console.log(
        "[VisitMonitor] fetchMessageReport - got reasonIds:",
        reasonIds ? reasonIds.substring(0, 50) + "..." : "(empty)"
      );
      console.log(
        "[VisitMonitor] fetchMessageReport - got officeIds:",
        officeIds || "(empty)"
      );

      const requestBody = {
        appVersion: params.appVersion,
        version: params.version,
        minorVersion: params.minorVersion,
        userID: params.userID,
        MessageType: -1,
        Status: "1", // 1 = Open, -1 = All (字符串类型)
        ProviderId: "469", // VendorID - hardcoded for now, could be made dynamic
        IsConversation: 0,
        KeySearch: "",
        Pagination: {
          PageNumber: 1,
          SortItem: "CreatedDate",
          SortOrder: "DESC",
          PageSize: "50",
        },
        IsNewLook: true,
        CommunicationType: "2", // 2 = Patient type (字符串类型)
        UserName: "", // Will be filled if needed
        NoOfDays: 1,
        UseMirrorConnection: true,
        Internal: -1,
        IsServicePortalNote: 0,
        CoordinatorID: String(coordinatorId), // 转为字符串
        Payers: payers,
        FromDate: "",
        ToDate: "",
        OfficeIDs: officeIds,
        ReasonIDs: reasonIds,
      };

      console.log(
        "[VisitMonitor] fetchMessageReport - Request URL:",
        `${baseUrl}/api/PayerNotification/PayerNotificationSearch`
      );
      console.log(
        "[VisitMonitor] fetchMessageReport - Request Body:",
        JSON.stringify(requestBody, null, 2)
      );

      const res = (await GM_fetch(
        `${baseUrl}/api/PayerNotification/PayerNotificationSearch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            appsecret: params.appSecret,
            appname: params.appName,
          },
          body: JSON.stringify(requestBody),
        }
      )) as Response & { rawBody: Blob };

      const rawText = await res.rawBody.text();
      console.log(
        "[VisitMonitor] fetchMessageReport - Response status:",
        res.status
      );
      console.log(
        "[VisitMonitor] fetchMessageReport - Response raw:",
        rawText.substring(0, 500)
      );

      const data = JSON.parse(rawText);
      console.log(
        "[VisitMonitor] fetchMessageReport - Parsed data length:",
        data?.length
      );

      // 解析消息数据
      const details: MessageDetail[] = data.map((item: any) => {
        const createdDate = item.CreatedDate || "";
        const createdTime = item.CreatedTime || "";
        const dateHoverDisplay = item.CreatedDateHoverDisplay || "";

        // 格式化日期时间显示："MM/DD/YYYY HH:MM:SS AM/PM (Yesterday)"
        let dateTimeDisplay = "";
        if (dateHoverDisplay) {
          // dateHoverDisplay 格式如 "Sat Dec 13 12:13 PM" 或 "Thu Dec 12 09:46 AM"
          // 从 dateHoverDisplay 中提取实际日期
          const now = new Date();
          let actualDate: Date;

          // 尝试从 dateHoverDisplay 中解析日期
          // 格式: "DayOfWeek Month Day HH:MM AM/PM"
          const dateMatch = dateHoverDisplay.match(
            /\w{3}\s+(\w{3})\s+(\d{1,2})\s+(\d{1,2}):(\d{2})\s+(\w{2})/
          );

          if (dateMatch) {
            const [, monthStr, dayStr, hourStr, minuteStr, ampm] = dateMatch;
            const monthMap: { [key: string]: number } = {
              Jan: 0,
              Feb: 1,
              Mar: 2,
              Apr: 3,
              May: 4,
              Jun: 5,
              Jul: 6,
              Aug: 7,
              Sep: 8,
              Oct: 9,
              Nov: 10,
              Dec: 11,
            };

            const month = monthMap[monthStr];
            const day = parseInt(dayStr);
            let year = now.getFullYear();

            // 如果日期在未来（例如 12月底显示 1月初的消息），则是去年
            if (
              month > now.getMonth() ||
              (month === now.getMonth() && day > now.getDate())
            ) {
              year--;
            }

            actualDate = new Date(year, month, day);
          } else {
            // 回退到原有逻辑
            if (createdDate === "Yesterday") {
              actualDate = new Date(now);
              actualDate.setDate(actualDate.getDate() - 1);
            } else if (createdDate === "Today") {
              actualDate = new Date(now);
            } else {
              actualDate = new Date(createdDate);
            }
          }

          // 格式化为 MM/DD/YYYY HH:MM:SS AM/PM
          const month = String(actualDate.getMonth() + 1).padStart(2, "0");
          const day = String(actualDate.getDate()).padStart(2, "0");
          const year = actualDate.getFullYear();

          // 从 createdTime 中提取时间部分（如 "12:13:26 PM"）
          const timeStr = createdTime || "";

          dateTimeDisplay = `${month}/${day}/${year} ${timeStr} (${createdDate})`;
        } else {
          dateTimeDisplay = `${createdDate} ${createdTime}`;
        }

        return {
          notificationId: item.NotificationId,
          patientId: item.PatientId,
          memberName: item.MemberName?.trim() || "",
          payerName: item.PayerName || "",
          reason: item.Reason || "",
          note: item.Note || "",
          status: item.Status || "",
          createdDate: createdDate,
          createdTime: createdTime,
          createdDateTimeDisplay: dateTimeDisplay,
          createdDateHoverDisplay: dateHoverDisplay,
          coordinatorName: item.CoordinatorName || "",
          officeName: item.OfficeName || "",
          fromUserName: item.FromUserName || "",
          canReplyClose: item.CanReplyClose || false,
          isPatientNote: item.IsPatientNote || false,
        };
      });

      // TotalRecords 在每个 item 中都有，取第一个即可
      const count = data.length > 0 ? data[0].TotalRecords || data.length : 0;

      return {
        count,
        details,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(
        `Failed to fetch message report for coordinator ${coordinatorId}:`,
        error
      );
      return {
        count: 0,
        details: [],
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 获取并缓存所有 Office IDs
   */
  async function getOfficeIds(): Promise<string> {
    if (officeIdString) return officeIdString;

    const r = (await GM_fetch(
      "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx",
      { method: "GET" }
    )) as Response & { rawBody: Blob };
    const textResult = await r.rawBody.text();
    const getParam = (name: string) =>
      textResult.match(
        new RegExp(`var\\s+${name}\\s*=\\s*['"]([^'"]+)['"];`)
      )?.[1];
    const apiParams = {
      userID: getParam("gnUserID")!,
      appSecret: getParam("gnApSc")!,
      appVersion: getParam("gnAppVersion")!,
      version: getParam("gnVersion")!,
      minorVersion: getParam("gnMinorVersion")!,
      appName: getParam("gnApNm")!,
    };
    const officeUrl = `https://app.hhaexchange.com/HHAWS${
      apiParams.appVersion
    }${apiParams.version.replace(".", "")}010000/Office.asmx/GetAllOffices`;
    const officePayload = {
      ...apiParams,
      IPAddress: "127.0.0.1",
      PayrollSetupID: "-1",
      permissionName: "",
      selectedOfficeID: "-1",
      selectionType: "Filter",
    };

    // FIXED: Corrected the GM_fetch call and response handling
    const officeRes = (await GM_fetch(officeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(officePayload),
    })) as Response & { rawBody: Blob };
    const officeText = await officeRes.rawBody.text();
    const officeData = JSON.parse(officeText);

    const offices = JSON.parse(officeData.d);
    const officeIDs: number[] = offices
      .map((o: any) => o.OfficeID)
      .filter((id: number) => id > 0);

    officeIdString = officeIDs.join(",");
    return officeIdString;
  }

  /**
   * 解析返回的HTML报告
   */
  function parseCallReport(htmlText: string): Omit<TrackedData, "timestamp"> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    const caption = doc.querySelector("#tdSearchResults caption");
    const captionText = caption?.textContent || "";
    const countMatch = captionText.match(/\((\d+)\)/);
    const count = countMatch ? parseInt(countMatch[1], 10) : 0;

    if (count === 0) {
      return { count: 0, details: [] };
    }

    const details: VisitDetail[] = [];
    const rows = doc.querySelectorAll("#tdSearchResults tbody tr");
    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      if (cells.length < 11) return;

      // FIX: 分离 Patient Name 和电话号码
      const patientCell = cells[0];
      const patientName =
        patientCell.querySelector("a")?.textContent?.trim() || "";
      const phones: PhoneInfo[] = [];
      const phoneDropdown = patientCell.querySelector(".dropdown-pane");
      if (phoneDropdown) {
        phoneDropdown.querySelectorAll(".mb05").forEach((item) => {
          const label = item.querySelector("label")?.textContent?.trim();
          const phone = item.querySelector("span")?.textContent?.trim();
          if (label && phone) {
            phones.push({ label, phone });
          }
        });
      }

      details.push({
        patientName,
        phones,
        assignmentId: cells[1]?.textContent?.trim() || "",
        admissionId: cells[2]?.textContent?.trim() || "",
        caregiverName: cells[3]?.textContent?.trim() || "",
        visitDate: cells[4]?.textContent?.trim() || "",
        coordinators: cells[5]?.textContent?.trim() || "",
        schedule: cells[6]?.textContent?.trim() || "",
        contract: cells[7]?.textContent?.trim() || "",
        discipline: cells[8]?.textContent?.trim() || "",
        serviceCode: cells[9]?.textContent?.trim() || "",
        caregiverTeam: cells[10]?.textContent?.trim() || "",
      });
    });

    return { count, details };
  }

  /**
   * 获取单个状态报告 (上班钟或下班钟)
   */
  async function fetchStatusReport(
    coordinatorId: number,
    callType: 2 | 3,
    officeIds: string
  ): Promise<TrackedData> {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
    const toDate = `${yyyy}-${mm}-${dd} 23:59:00`;
    const time = Date.now();

    const url = new URL(
      "https://app.hhaexchange.com/ENT2507010000/Call/CallReportsXSLT_ns.aspx"
    );
    const params = url.searchParams;
    params.set("CallType", callType.toString());
    params.set("VendorID", "469"); // This might need to be dynamic later
    params.set("CoordinatorID", coordinatorId.toString());
    params.set("FromDate", fromDate);
    params.set("ToDate", toDate);
    params.set("time", time.toString());
    params.set("OfficeId", officeIds);
    // Add other static params
    params.set("sort", "VisitDate");
    params.set("ord", "DESC");
    params.set("Source", "-1");
    params.set("CaregiverTeamID", "-1");
    params.set("SkillType", "-1");
    params.set("HideVisitWithTimeSheetRequired", "false");
    params.set("TimesheetRequired", "-1");
    params.set("PatientTeamID", "-1");
    params.set("PatientLocationID", "-1");
    params.set("PatientBranchID", "-1");
    params.set("CaregiverLocationID", "-1");
    params.set("CaregiverBranchID", "-1");
    params.set("DisciplineIDs", "0");

    const response = await GM_fetch(url.toString(), { method: "GET" });
    const htmlText = await (response as any).rawBody.text();
    const parsedData = parseCallReport(htmlText);

    return { ...parsedData, timestamp: Date.now() };
  }

  // --- 追踪数据获取与解析 ---

  /**
   * 获取“异常打钟”报告
   */
  async function fetchAnomalyReport(
    coordinatorId: number
  ): Promise<TrackedData> {
    const apiParams = await apiParamProvider.get();

    const url = `https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx?VisitStatus=13&s=${apiParams.sessionID}&Version=${apiParams.version}&MinorVersion=${apiParams.minorVersion}&AppVersion=${apiParams.appVersion}`;

    const today = new Date();
    // ASP.NET 页面期望 MM/dd/yyyy 格式
    const toDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
      today.getDate()
    ).padStart(2, "0")}/${today.getFullYear()}`;

    // 使用 URLSearchParams 来构建一个与浏览器完全一致的 Form Data
    const formData = new URLSearchParams();

    // --- Form Data (严格按照您提供的列表构建) ---

    // 动态替换的关键参数
    formData.append("__VIEWSTATE", apiParams.viewState);
    formData.append("__VIEWSTATEGENERATOR", apiParams.viewStateGenerator);
    formData.append("ctl00$ucMenu$hidMenuUserId", apiParams.userID);
    formData.append("ctl00$hdnSessionID", apiParams.sessionID);
    formData.append("ctl00$hdnAppVersion", apiParams.appVersion);
    formData.append("ctl00$hdnVersion", apiParams.version);
    formData.append("ctl00$hdnMinorVersion", apiParams.minorVersion);
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnuserid",
      apiParams.userID
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnappVersion",
      apiParams.appVersion
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnversion",
      apiParams.version
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnminorVersion",
      apiParams.minorVersion
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnAppSecret",
      apiParams.appSecret
    );
    // 注意: IPAddress 最好不要硬编码，但如果服务器不校验，则可以使用一个占位符
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnIpAddress",
      "127.0.0.1"
    );
    // Office IDs
    const officeIds = officeIdString || (await getOfficeIds());
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnOffices",
      officeIds
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnAllOffices",
      officeIds
    );
    formData.append("ctl00$ContentPlaceHolder1$hdnSelectedOffices", officeIds);
    // 用户与日期参数
    formData.append(
      "ctl00$ContentPlaceHolder1$uxDdlCoordinator",
      coordinatorId.toString()
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnSelectedCoordinator",
      coordinatorId.toString()
    );
    formData.append("ctl00$ContentPlaceHolder1$uxDtFromDate", "08/04/2025"); // 根据要求固定 (注意格式)
    formData.append("ctl00$ContentPlaceHolder1$uxDtToDate", toDate);
    // ContentPlaceHolder1 下的其他动态参数
    formData.append("ctl00$ContentPlaceHolder1$hdnUserID", apiParams.userID);
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnAppVersion",
      apiParams.appVersion
    );
    formData.append("ctl00$ContentPlaceHolder1$hdnVersion", apiParams.version);
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnMinorVersion",
      apiParams.minorVersion
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnServicePath",
      "/HHAWSENT2507010000/"
    );
    formData.append("ctl00$ContentPlaceHolder1$hdnAppName", apiParams.appName);
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnAppSecret",
      apiParams.appSecret
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnWSURL",
      "/HHAWSENT2507010000/"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnSessionId",
      apiParams.sessionID
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnVendorID",
      apiParams.vendorID
    );

    // 静态参数 (完全复制)
    formData.append("__LASTFOCUS", "");
    formData.append("__EVENTTARGET", "");
    formData.append("__EVENTARGUMENT", "");
    formData.append("ctl00$hidUserMessageID", "");
    formData.append(
      "ctl00$ucMenu$hidAgenciesUsingNewPendingPlacementVendor",
      "true"
    );
    formData.append("ctl00$ucMenu$hidMenuVendorId", "469");
    formData.append("ctl00$hdnShowCmpArtMenu", "0");
    formData.append("ctl00$hdnMobileChatAppVersionID", "34");
    formData.append("ctl00$hdnChatAccess", "False");
    formData.append("ctl00$hdnProviderAppVersionID", "101");
    formData.append("ctl00$hdnIsOldHistoryEnabled", "0");
    formData.append("ctl00$hdnIsNewHistoryEnabled", "1");
    formData.append(
      "ctl00$hdnHistoryViewerUrl",
      "https://app.hhaexchange.com/history/"
    );
    formData.append(
      "ctl00$hdnWebcomponentsLibraryUrl",
      "https://unpkg.com/foundation-web-components/umd/webcomponents.js"
    );
    formData.append("ctl00$hdnFileSizeText", "20");
    formData.append("ctl00$hdnFileSizeLimit", "20971520");
    formData.append("selectAll", "on");
    // 对于有多个同名键的情况，需要多次 append
    const officeIdList = officeIds.split(",");
    officeIdList.forEach((id) => formData.append("selectItem", id));
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnWebURL",
      "/HHAWSENT2507010000/Office.asmx"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnCallbackFunction",
      "UpdateOfficeData();"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnSingleSelect",
      "false"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnIsDisable",
      "false"
    );
    formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnWidth", "178");
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnAutoPostback",
      "False"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnDefaultText",
      "Select one or more..."
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnOnClientSideLoad",
      "bindedOn();"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnPermissionName",
      ""
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnSelectionType",
      "Filter"
    );
    formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnRevokeMethod", "");
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnSelectAllRevokeMethod",
      ""
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnOnOpenFunction",
      "OnOpen();"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnOnCloseNoChangeFunction",
      "OnClientClose();"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnGetDependentControls",
      ""
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnOnSingleSelect",
      ""
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnEmptyDisable",
      "false"
    );
    formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnNoOffice", "false");
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnShowUnassignedOfficeForReferrals",
      "false"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnSetOfficeSelectionValue",
      ""
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnPayrollSetupID",
      "-1"
    );
    formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnCaregiverID", "");
    formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnCustomeMethod", "");
    // hdnOfficeNames 最好动态生成，但如果固定也可以
    formData.append(
      "ctl00$ContentPlaceHolder1$divOffice$hdnOfficeNames",
      "Always Home Care,AHC – New York,AHC -- Richmond,Private Duty Expert,Always NHTD/TBI"
    );
    formData.append("ctl00$ContentPlaceHolder1$uxtxtFromTime", "");
    formData.append("ctl00$ContentPlaceHolder1$uxtxtToTime", "");
    formData.append("ctl00$ContentPlaceHolder1$uxTxtAideFirstName", "");
    formData.append("ctl00$ContentPlaceHolder1$uxTxtAideLastName", "");
    formData.append("ctl00$ContentPlaceHolder1$txtCaregiverCode", "");
    formData.append("ctl00$ContentPlaceHolder1$uxDdlTeam", "-1");
    formData.append("ctl00$ContentPlaceHolder1$hdnSelectedCaregiverTeam", "");
    formData.append("ctl00$ContentPlaceHolder1$uxDdlCaregiverLocation", "-1");
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnSelectedCaregiverLocation",
      ""
    );
    formData.append("ctl00$ContentPlaceHolder1$uxDdlCaregiverBranch", "-1");
    formData.append("ctl00$ContentPlaceHolder1$hdnSelectedCaregiverBranch", "");
    formData.append("ctl00$ContentPlaceHolder1$uxTxtAssignmentID", "");
    formData.append("ctl00$ContentPlaceHolder1$uxTxtAdmissionID", "");
    formData.append("ctl00$ContentPlaceHolder1$uxDdlContract", "-1");
    formData.append("ctl00$ContentPlaceHolder1$hdnSelectedContract", "");
    // 多个 selectItem
    const maintenanceStatus = [
      "9",
      "15",
      "19",
      "24",
      "11",
      "10",
      "14",
      "16",
      "12",
      "22",
      "23",
      "18",
      "20",
      "21",
      "13",
      "8",
      "43",
      "25",
      "26",
      "27",
      "36",
      "33",
      "34",
      "29",
      "32",
    ];
    maintenanceStatus.forEach((item) => formData.append("selectItem", item));
    formData.append("ctl00$ContentPlaceHolder1$hdnCallerInfo", "");
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnBroadcastReceivedPageSize",
      "25"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnAltCaregiverValue",
      "Caregiver"
    );
    formData.append("ctl00$ContentPlaceHolder1$hdnAltPatientValue", "Patient");
    formData.append("ctl00$ContentPlaceHolder1$hdnAltFOBValue", "FOB");
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnIsBeaconDeviceEnable",
      "691,651,262,339,959,338,370,155,180,243,848,216,241,194,939,543,709,1730,377,674,733,801,744"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnddlMaintenanceStatus",
      maintenanceStatus.join(",")
    );
    formData.append("ctl00$ContentPlaceHolder1$uxTxtPatientFirstName", "");
    formData.append("ctl00$ContentPlaceHolder1$uxTxtPatientLastName", "");
    formData.append("ctl00$ContentPlaceHolder1$uxDdlPatientTeam", "-1");
    formData.append("ctl00$ContentPlaceHolder1$hdnSelectedPatientTeam", "");
    formData.append("ctl00$ContentPlaceHolder1$uxDdlPatientLocation", "-1");
    formData.append("ctl00$ContentPlaceHolder1$hdnSelectedPatientLocation", "");
    formData.append("ctl00$ContentPlaceHolder1$uxDdlPatientBranch", "-1");
    formData.append("ctl00$ContentPlaceHolder1$hdnSelectedPatientBranch", "");
    formData.append("ctl00$ContentPlaceHolder1$uxBtnSearch", "Search");
    formData.append("ctl00$ContentPlaceHolder1$hdnCallReprocessLimit", "1000");
    // GvSearch controls are likely not needed as they are response-related
    formData.append("ctl00$ContentPlaceHolder1$uxDdlVendor", "469");
    formData.append("ctl00$ContentPlaceHolder1$uxHidRefresh", "");
    formData.append(
      "ctl00$ContentPlaceHolder1$uxHidValidateScheduleOvertime",
      "True"
    );
    formData.append("ctl00$ContentPlaceHolder1$uxHidScheduleOvertimePwd", "");
    formData.append("ctl00$ContentPlaceHolder1$uxHidAideID", "");
    formData.append("ctl00$ContentPlaceHolder1$uxHidAideCode", "");
    formData.append("ctl00$ContentPlaceHolder1$uxHidFromCallDashBoard", "1");
    formData.append("ctl00$ContentPlaceHolder1$hdnFromTime", "");
    formData.append("ctl00$ContentPlaceHolder1$hdnToTime", "");
    formData.append(
      "ctl00$ContentPlaceHolder1$hidProviderURL",
      "https://app.hhaexchange.com/PROVIDER2507010000/caregiver-availability"
    );
    formData.append("ctl00$ContentPlaceHolder1$hdnEditSkilledSchedule", "True");
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnEditNonSkillSchedule",
      "True"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnEditPayrollInfoAfterPayroll",
      "False"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnEditPayrollInfoAfterBilling",
      "False"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnInternalEditScheduleTime",
      "True"
    );
    formData.append("ctl00$ContentPlaceHolder1$hdnLinkCall", "True");
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnAllowLinkingUnrecognizedNumber",
      "True"
    );
    formData.append("ctl00$ContentPlaceHolder1$hdnEditPatientProfile", "False");
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnReportPagePath",
      "https://reports.hhaexchange.com/HHAReportsML/Reports/"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnReportServicepath",
      "http://AWSProdWebRP2/HHAReportsWS/ReportWebService.asmx"
    );
    formData.append("ctl00$ContentPlaceHolder1$hdnControlID", "");
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnCallDashboardCorrections",
      ""
    );
    formData.append("ctl00$ContentPlaceHolder1$hdnHistoryData", "");
    formData.append("ctl00$ContentPlaceHolder1$hdnIspopupOpen", "");
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnKafkaWebAPIPath",
      "/HHAXKafkaAPI20070100/api/"
    );
    formData.append("ctl00$ContentPlaceHolder1$hdnHistoryURL", "/HHAHistory/");
    formData.append("ctl00$ContentPlaceHolder1$hdnMessageType", "2");
    formData.append("ctl00$ContentPlaceHolder1$hdnMessageSource", "3");
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnAllowLinkingUnrecognizedFOB",
      "True"
    );
    formData.append(
      "ctl00$ContentPlaceHolder1$hdnAllowLinkingUnrecognizedGPS",
      "True"
    );

    const response = await GM_fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch anomaly report: ${response.status} ${response.statusText}`
      );
    }

    const htmlText = await (response as any).rawBody.text();
    return { ...parseAnomalyReport(htmlText), timestamp: Date.now() };
  }

  /**
   * 解析异常打钟报告 HTML
   */
  function parseAnomalyReport(htmlText: string): {
    count: number;
    details: AnomalyDetail[];
    viewState: string;
    viewStateGenerator: string;
  } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const countSpan = doc.querySelector(
      "#ctl00_ContentPlaceHolder1_uxlblSearchCount"
    );
    const countMatch = countSpan?.textContent?.match(/\((\d+)\)/);
    const count = countMatch ? parseInt(countMatch[1], 10) : 0;
    const { viewState, viewStateGenerator } =
      apiParamProvider.parseViewState(htmlText);
    const details: AnomalyDetail[] = [];
    if (count > 0) {
      const rows = doc.querySelectorAll(
        "#ctl00_ContentPlaceHolder1_uxGvSearch > tbody > tr"
      );
      rows.forEach((row) => {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length < 12) return;

        // FIX: 电话号码换行处理
        let phoneHtml = cells[4]?.innerHTML || "";
        phoneHtml = phoneHtml
          .replace(/Phone2:/g, "<br>Phone2:")
          .replace(/Phone3:/g, "<br>Phone3:");

        // FIX: 只获取 Status 标题
        const statusCell = cells[11];
        const statusText =
          statusCell
            ?.querySelector('span[id*="uxlblStatus"]')
            ?.textContent?.trim() ||
          statusCell?.textContent?.trim() ||
          "";

        details.push({
          assignId: cells[0]?.textContent?.trim() || "",
          caregiverCode: cells[1]?.textContent?.trim() || "",
          caregiverName: cells[2]?.textContent?.trim() || "",
          officeName: cells[3]?.textContent?.trim() || "",
          caregiverPhone: phoneHtml,
          caregiverTeam: cells[5]?.textContent?.trim() || "",
          patientName: cells[6]?.textContent?.trim() || "",
          callDate: cells[7]?.textContent?.trim() || "",
          callTime: cells[8]?.textContent?.trim() || "",
          callType:
            cells[9]?.textContent
              ?.trim()
              .replace(/History/gi, "")
              .trim() || "", // FIX: 移除 "History"
          callerId: cells[10]?.textContent?.trim() || "",
          status: statusText,
        });
      });
    }
    return { count, details, viewState, viewStateGenerator };
  }

  // --- 视图渲染 (renderTrackingView 已更新) ---
  function renderTrackingView(): void {
    if (trackedCoordinators.length === 0) {
      trackingTableBody.innerHTML = `<tr><td colspan="6" style="color: #333 !important;">没有正在追踪的 Coordinator</td></tr>`; // colspan 改为 6
      return;
    }
    const rowsHtml = trackedCoordinators
      .map((coordinator, index) => {
        const clockInData = statusDataCache.get(`${coordinator.id}-2`);
        const clockOutData = statusDataCache.get(`${coordinator.id}-3`);
        const anomalyData = statusDataCache.get(`${coordinator.id}-anomaly`);
        const messageData = statusDataCache.get(`${coordinator.id}-message`);
        const clockInCount = clockInData?.count ?? 0;
        const clockOutCount = clockOutData?.count ?? 0;
        const anomalyCount = anomalyData?.count ?? 0;
        const messageCount = messageData?.count ?? 0;
        const clockInStatus = clockInCount > 0 ? "status-error" : "status-ok";
        const clockOutStatus = clockOutCount > 0 ? "status-error" : "status-ok";
        const anomalyStatus = anomalyCount > 0 ? "status-error" : "status-ok";
        const messageStatus = messageCount > 0 ? "status-error" : "status-ok";

        return `
                <tr>
                    <td style="color: #333 !important;">${index + 1}</td>
                    <td class="col-coordinator" style="color: #333 !important;">${
                      coordinator.name
                    }</td>
                    <td><div class="status-icon ${clockInStatus}" data-coordinator-id="${
          coordinator.id
        }" data-call-type="2">${clockInCount}</div></td>
                    <td><div class="status-icon ${clockOutStatus}" data-coordinator-id="${
          coordinator.id
        }" data-call-type="3">${clockOutCount}</div></td>
                    <td><div class="status-icon ${anomalyStatus}" data-coordinator-id="${
          coordinator.id
        }" data-call-type="anomaly">${anomalyCount}</div></td>
                    <td><div class="status-icon ${messageStatus}" data-coordinator-id="${
          coordinator.id
        }" data-call-type="message">${messageCount}</div></td>
                </tr>`;
      })
      .join("");
    trackingTableBody.innerHTML = rowsHtml;
  }

  // FIX 2: 移除函数参数，使其直接使用上层作用域的 allCoordinators 状态变量
  function renderEditingView(): void {
    const tableHtml = `
            <table class="tracker-table">
                <thead><tr><th style="color: #333 !important;"class="col-coordinator">所有可用 Coordinator</th><th style="color: #333 !important;">操作</th></tr></thead>
                <tbody id="editing-table-body">
                    ${allCoordinators
                      .map(
                        (c) => `
                        <tr data-id="${c.id}">
                            <td class="col-coordinator" style="color: #333 !important;">${
                              c.name
                            }</td>
                            <td class="edit-list-actions">
                                <button class="${
                                  tempTrackedIds.has(c.id)
                                    ? "remove-btn"
                                    : "add-btn"
                                }" data-id="${c.id}" data-name="${c.name}">
                                    ${tempTrackedIds.has(c.id) ? "−" : "+"}
                                </button>
                            </td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>`;
    editingContent.innerHTML = tableHtml;
  }

  // --- 追踪循环 (Story 2: 集成缓存检查逻辑) ---
  async function runTrackingUpdate() {
    if (trackedCoordinators.length === 0) return;
    console.log(
      `[${new Date().toLocaleTimeString()}] Running tracking update...`
    );

    // --- Story 2: 缓存检查逻辑 ---
    const cached = tabSyncManager.getCachedData();

    if (cached) {
      const decision = tabSyncManager.shouldFetchFresh(cached.timestamp);
      console.log(
        `[Story2] Cache decision: ${decision}, age: ${
          Date.now() - cached.timestamp
        }ms`
      );

      if (decision === "USE") {
        // 缓存新鲜（<30s），直接使用，跳过 API 请求
        restoreFromCache(cached.data);
        renderTrackingView();
        updateLastRefreshTime(cached.timestamp);
        console.log("[Story2] Using fresh cache, skipping API call");
        return;
      }

      if (decision === "USE_AND_REFRESH") {
        // 缓存可用但需刷新（30s-2min），先显示缓存数据
        restoreFromCache(cached.data);
        renderTrackingView();
        updateLastRefreshTime(cached.timestamp);
        console.log("[Story2] Using stale cache, will refresh in background");
        // 继续执行下面的 API 调用进行后台刷新
      }
      // decision === 'REFRESH': 缓存过期，直接执行 API 调用
    }

    // --- 原有的 API 调用逻辑 ---
    try {
      const officeIds = await getOfficeIds();
      const promises: Promise<void>[] = [];
      for (const coordinator of trackedCoordinators) {
        // 上班钟 (CallType=2)
        promises.push(
          fetchStatusReport(coordinator.id, 2, officeIds)
            .then((data) => {
              statusDataCache.set(`${coordinator.id}-2`, data);
            })
            .catch((err) => console.error(err))
        );
        // 下班钟 (CallType=3)
        promises.push(
          fetchStatusReport(coordinator.id, 3, officeIds)
            .then((data) => {
              statusDataCache.set(`${coordinator.id}-3`, data);
            })
            .catch((err) => console.error(err))
        );
        // 异常打钟
        promises.push(
          fetchAnomalyReport(coordinator.id)
            .then((data) => {
              statusDataCache.set(`${coordinator.id}-anomaly`, data);
            })
            .catch((err) => console.error(err))
        );
        // 消息监控
        promises.push(
          fetchMessageReport(coordinator.id)
            .then((data) => {
              statusDataCache.set(`${coordinator.id}-message`, data);
            })
            .catch((err) => console.error(err))
        );
      }
      await Promise.allSettled(promises);
      renderTrackingView();

      // --- Story 2 & 3: API 完成后保存缓存、广播并更新时间 ---
      const now = Date.now();
      tabSyncManager.setCachedData(statusDataCache);

      // Story 3: 广播数据更新通知给其他 Tab
      tabSyncManager.broadcast({
        type: "DATA_UPDATED",
        sourceTabId: tabSyncManager.tabId,
        timestamp: now,
      });

      updateLastRefreshTime(now);
      console.log(
        `[Story3] Tracking update complete. Broadcasted to other tabs.`
      );
    } catch (error) {
      console.error("Failed to run tracking update:", error);
      showToast("追踪数据更新失败", "error");
    }
  }

  // --- NEW: 可复用的拖拽函数 (已修复) ---
  /**
   * 使一个元素可以通过其句柄进行拖拽
   * @param draggableElement 需要被拖动的元素
   * @param handleElement 鼠标按下的句柄元素
   */
  function makeDraggable(
    draggableElement: HTMLElement,
    handleElement: HTMLElement
  ) {
    let isDragging = false;
    let offsetX = 0,
      offsetY = 0;

    handleElement.style.cursor = "move";

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      const rect = draggableElement.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;

      // 边界检测 (不变)
      const margin = 5;
      if (newX < margin) newX = margin;
      if (newY < margin) newY = margin;
      if (newX + draggableElement.offsetWidth > window.innerWidth - margin) {
        newX = window.innerWidth - draggableElement.offsetWidth - margin;
      }
      if (newY + draggableElement.offsetHeight > window.innerHeight - margin) {
        newY = window.innerHeight - draggableElement.offsetHeight - margin;
      }

      // FIX: 在设置 left 和 top 的同时，清除 right 和 bottom 的影响
      draggableElement.style.right = "auto";
      draggableElement.style.bottom = "auto";
      draggableElement.style.left = `${newX}px`;
      draggableElement.style.top = `${newY}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    handleElement.addEventListener("mousedown", onMouseDown);
  }

  /**
   * 格式化Authorization Note内容
   * 解析原始HTML表格，完整保留所有列（Edited Fields, Previous Value, New Value）
   */
  function formatAuthorizationNote(note: string): string {
    if (!note) return "";

    // 检查是否包含Authorization相关的HTML表格
    if (
      note.includes("<table") &&
      (note.includes("Edited Fields") || note.includes("Previous Value"))
    ) {
      try {
        // 创建临时DOM解析HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = note;

        // 提取表格前的文字描述
        const textContent = note.replace(/<table[\s\S]*<\/table>/gi, "").trim();
        const descriptionText = textContent.replace(/<[^>]+>/g, "").trim();

        // 解析表格 - 获取表头和数据
        const table = tempDiv.querySelector("table");
        if (table) {
          const headerRow = table.querySelector("tr");
          const headers: string[] = [];
          headerRow?.querySelectorAll("th, td").forEach((cell) => {
            headers.push(cell.textContent?.trim() || "");
          });

          // 获取数据行
          const dataRows = table.querySelectorAll("tr");
          const tableData: { cells: string[] }[] = [];

          dataRows.forEach((row, index) => {
            if (index === 0 && row.querySelector("th")) return; // 跳过表头行
            const cells: string[] = [];
            row.querySelectorAll("td").forEach((cell) => {
              cells.push(cell.textContent?.trim() || "");
            });
            if (cells.length > 0 && cells.some((c) => c)) {
              tableData.push({ cells });
            }
          });

          // 生成紧凑表格
          if (tableData.length > 0) {
            let result = descriptionText
              ? `<div style="margin-bottom:6px;">${descriptionText}</div>`
              : "";
            result += '<table class="auth-note-table"><thead><tr>';

            // 表头
            headers.forEach((h) => {
              result += `<th>${h}</th>`;
            });
            result += "</tr></thead><tbody>";

            // 数据行
            tableData.forEach((row) => {
              result += "<tr>";
              row.cells.forEach((cell) => {
                result += `<td>${cell}</td>`;
              });
              result += "</tr>";
            });
            result += "</tbody></table>";
            return result;
          }
        }
      } catch (e) {
        // 解析失败，回退到纯文本
      }
    }

    // 如果不是Authorization表格或解析失败，移除HTML标签返回纯文本
    return note
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // 调整大小功能 (修复：移除最大尺寸限制，使用capture捕获事件，添加iframe遮罩)
  function makeResizable(element: HTMLElement, handleElement: HTMLElement) {
    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let overlay: HTMLDivElement | null = null;

    handleElement.style.cursor = "nwse-resize";

    const onMouseDown = (e: MouseEvent) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = element.offsetWidth;
      startHeight = element.offsetHeight;

      // 创建透明遮罩层覆盖整个页面，防止iframe或其他元素抦截鼠标事件
      overlay = document.createElement("div");
      overlay.style.cssText =
        "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;cursor:nwse-resize;";
      document.body.appendChild(overlay);

      // 防止拖动时选中文字
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove, true);
      document.addEventListener("mouseup", onMouseUp, true);
      e.preventDefault();
      e.stopPropagation();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // 计算新尺寸，只有最小限制，没有最大限制
      const newWidth = Math.max(400, startWidth + deltaX);
      const newHeight = Math.max(300, startHeight + deltaY);

      element.style.width = `${newWidth}px`;
      element.style.height = `${newHeight}px`;

      e.preventDefault();
      e.stopPropagation();
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isResizing) return;
      isResizing = false;
      document.body.style.userSelect = "";

      // 移除遮罩层
      if (overlay) {
        overlay.remove();
        overlay = null;
      }

      document.removeEventListener("mousemove", onMouseMove, true);
      document.removeEventListener("mouseup", onMouseUp, true);
      e.preventDefault();
      e.stopPropagation();
    };

    handleElement.addEventListener("mousedown", onMouseDown);
  }

  // --- 详情气泡 (Popover) ---

  /**
   * 辅助函数：专门用于渲染病人姓名单元格（<td>）
   * 如果有电话号码，则会生成带有悬浮提示的HTML
   * @param detail
   * @returns 返回一个完整的 <td>...</td> HTML字符串
   */
  function renderPatientNameCell(detail: VisitDetail): string {
    // 如果没有电话或电话列表为空，则只返回简单的姓名单元格
    if (!detail.phones || detail.phones.length === 0) {
      return `<td style="color: #333 !important;">${detail.patientName}</td>`;
    }

    // 如果有电话，则生成带有悬浮提示的复杂HTML
    const phoneItems = detail.phones
      .map(
        (p) => `
        <div class="phone-tooltip-item">
                <label>${p.label}</label>
                <span>${p.phone}</span>
            </div>
        `
      )
      .join("");
    return `
            <td>
                <div class="phone-icon-wrapper" style="color: #333 !important;">
                    <span>${detail.patientName}</span>
                    <span class="phone-icon">📞</span>
                    <div class="phone-tooltip">${phoneItems}</div>
                </div>
            </td>
    `;
  }

  /**
   * 显示详情气泡 (Popover)
   * @param data 从缓存中获取的数据
   * @param callType 数据类型 (2, 3, 'anomaly')，用于决定渲染哪个表格
   * @param targetElement 用户点击的图标元素，用于定位
   */
  function showDetailsPopover(
    data: TrackedData,
    callType: CallType,
    targetElement: HTMLElement
  ) {
    // 1. 清理：移除任何已存在的气泡，确保页面上只有一个
    document.getElementById("details-popover")?.remove();

    // 2. 创建：创建新的气泡容器
    const popover = document.createElement("div");
    popover.id = "details-popover";

    let tableHtml: string;

    // --- 3. 渲染：根据 callType 决定渲染哪种表格 ---
    if (callType == 2 || callType == 3) {
      const details = data.details as VisitDetail[];
      const tableRows = details
        .map(
          (d) => `
            <tr>
                    ${renderPatientNameCell(d)}
                    <td style="color: #333 !important;">${d.assignmentId}</td>
                    <td style="color: #333 !important;">${d.admissionId}</td>
                    <td style="color: #333 !important;">${d.caregiverName}</td>
                    <td style="color: #333 !important;">${d.visitDate}</td>
                    <td style="color: #333 !important;">${d.coordinators}</td>
                    <td style="color: #333 !important;">${d.schedule}</td>
                    <td style="color: #333 !important;">${d.contract}</td>
                    <td style="color: #333 !important;">${d.discipline}</td>
                    <td style="color: #333 !important;">${d.serviceCode}</td>
                    <td style="color: #333 !important;">${d.caregiverTeam}</td>
                </tr>`
        )
        .join("");

      tableHtml = `
            <thead><tr>
                <th style="color: #333 !important;">Patient Name</th>
                <th style="color: #333 !important;">Assignment ID</th>
                <th style="color: #333 !important;">Admission ID</th>
                <th style="color: #333 !important;">Caregiver Name</th>
                <th style="color: #333 !important;">Visit Date</th>
                <th style="color: #333 !important;">Coordinators</th>
                <th style="color: #333 !important;">Schedule</th>
                <th style="color: #333 !important;">Contract</th>
                <th style="color: #333 !important;">Discipline</th>
                <th style="color: #333 !important;">Service Code</th>
                <th style="color: #333 !important;">Caregiver Team</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
        `;
    } else if (callType === "anomaly") {
      const details = data.details as AnomalyDetail[];
      const tableRows = details
        .map(
          (d) => `
            <tr>
                    <td style="color: #333 !important;">${d.assignId}</td><td style="color: #333 !important;">${d.caregiverCode}</td>
                    <td style="color: #333 !important;">${d.caregiverName}</td><td style="color: #333 !important;">${d.officeName}</td>
                    <td style="color: #333 !important;">${d.caregiverPhone}</td><td style="color: #333 !important;">${d.caregiverTeam}</td>
                    <td style="color: #333 !important;">${d.patientName}</td><td style="color: #333 !important;">${d.callDate}</td>
                    <td style="color: #333 !important;">${d.callTime}</td><td style="color: #333 !important;">${d.callType}</td>
                    <td style="color: #333 !important;">${d.callerId}</td><td style="color: #333 !important;">${d.status}</td>
                </tr>`
        )
        .join("");

      tableHtml = `
            <thead>
            <tr>
                <th style="color: #333 !important;">Assign. ID#</th>
                <th style="color: #333 !important;">Caregiver Code</th>
                <th style="color: #333 !important;">Caregiver Name</th>
                <th style="color: #333 !important;">Office Name</th>
                <th style="color: #333 !important;">Caregiver Phone</th>
                <th style="color: #333 !important;">Caregiver Team</th>
                <th style="color: #333 !important;">Patient Name</th>
                <th style="color: #333 !important;">Call Date</th>
                <th style="color: #333 !important;">Call Time</th>
                <th style="color: #333 !important;">Call Type</th>
                <th style="color: #333 !important;">Caller ID</th>
                <th style="color: #333 !important;">Status</th>
            </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        `;
    } else if (callType === "message") {
      const details = data.details as MessageDetail[];
      const tableRows = details
        .map((d) => {
          // 格式化Note内容：解析Authorization Note中的表格数据
          const formattedNote = formatAuthorizationNote(d.note);
          return `
            <tr>
                    <td style="color: #333 !important;">${d.memberName}</td>
                    <td style="color: #333 !important;">${d.payerName}</td>
                    <td style="color: #333 !important;">${d.reason}</td>
                    <td style="color: #333 !important;" class="note-cell">${formattedNote}</td>
                    <td style="color: #333 !important; white-space: nowrap;">${d.createdDateTimeDisplay}</td>
                </tr>`;
        })
        .join("");

      tableHtml = `
            <thead>
            <tr>
                <th style="color: #333 !important;">Member Name</th>
                <th style="color: #333 !important;">Payer</th>
                <th style="color: #333 !important;">Reason</th>
                <th style="color: #333 !important;">Note</th>
                <th style="color: #333 !important;">DateTime</th>
            </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        `;
    } else {
      // 备用情况
      tableHtml = `<tbody><tr><td style="color: #333 !important;">未知的数据类型</td></tr></tbody>`;
    }

    // --- 4. 组装：将头部、内容和表格组装成完整的 Popover HTML ---
    popover.innerHTML = `
        <div class="popover-header"><h4 style="color: #333 !important;">详情列表（只显示最新10条） (${data.count} 条记录)</h4><button class="popover-close-btn">&times;</button></div>
            <div class="popover-content"><table class="popover-table">${tableHtml}</table></div>
            <div class="popover-resize-handle"></div>
        `;

    // --- 5. 注入与激活 ---
    document.body.appendChild(popover);

    // 激活拖拽功能
    const popoverHeader = popover.querySelector(
      ".popover-header"
    ) as HTMLElement;
    if (popoverHeader) {
      makeDraggable(popover, popoverHeader);
    }

    // 激活调整大小功能
    const resizeHandle = popover.querySelector(
      ".popover-resize-handle"
    ) as HTMLElement;
    if (resizeHandle) {
      makeResizable(popover, resizeHandle);
    }

    // 智能定位
    const targetRect = targetElement.getBoundingClientRect();
    const popoverHeight = popover.offsetHeight;
    const popoverWidth = popover.offsetWidth;
    const margin = 10;

    let top = targetRect.bottom + 5;
    if (top + popoverHeight > window.innerHeight - margin)
      top = targetRect.top - popoverHeight - 5;
    if (top < margin) top = margin;

    let left = targetRect.left;
    if (left + popoverWidth > window.innerWidth - margin)
      left = targetRect.right - popoverWidth;
    if (left < margin) left = margin;

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    // 绑定关闭事件
    popover
      .querySelector(".popover-close-btn")
      ?.addEventListener("click", () => popover.remove());

    // 触发淡入动画
    requestAnimationFrame(() => popover.classList.add("visible"));
  }

  // --- NEW: Show message detail popup ---
  function showMessageDetail(cell: HTMLElement) {
    const popup = document.getElementById("message-detail-popup");
    const backdrop = document.getElementById("message-detail-backdrop");
    const title = document.getElementById("popup-title");
    const content = document.getElementById("popup-content");
    const closeBtn = document.getElementById("close-popup-btn");

    if (!popup || !backdrop || !title || !content || !closeBtn) return;

    const fullNote = cell.dataset.fullNote || "";
    const member = cell.dataset.member || "";
    const payer = cell.dataset.payer || "";
    const reason = cell.dataset.reason || "";
    const priority = cell.dataset.priority || "Normal";
    const caregiver = cell.dataset.caregiver || "";
    const patient = cell.dataset.patient || "";
    const created = cell.dataset.created || "";

    // Set title
    title.textContent = payer || "Message Details";

    // Build content HTML (similar to original popup structure)
    const contentHtml = `
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 20px; font-size: 14px;">
        <div style="font-weight: bold;">From</div>
        <div>${payer}</div>
        
        <div style="font-weight: bold;">Created</div>
        <div>${created}</div>
        
        <div style="font-weight: bold;">To</div>
        <div>${member}</div>
        
        <div style="font-weight: bold;">Reason</div>
        <div>${reason}</div>
        
        ${
          caregiver
            ? `<div style="font-weight: bold;">Caregiver</div><div>${caregiver}</div>`
            : ""
        }
        
        <div style="font-weight: bold;">Priority</div>
        <div>${priority}</div>
        
        ${
          patient
            ? `<div style="font-weight: bold;">Patient</div><div>${patient}</div>`
            : ""
        }
      </div>
      
      <div style="margin-top: 20px;">
        <div style="font-weight: bold; margin-bottom: 10px;">Message</div>
        <div style="padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; max-height: 400px; overflow: auto;">
          ${fullNote}
        </div>
      </div>
    `;

    content.innerHTML = contentHtml;

    // Show popup and backdrop
    popup.style.display = "block";
    backdrop.style.display = "block";

    // Close handlers
    const closePopup = () => {
      popup.style.display = "none";
      backdrop.style.display = "none";
    };

    closeBtn.onclick = closePopup;
    backdrop.onclick = closePopup;

    // ESC key to close
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePopup();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);
  }

  // --- REFACTORED: 拖拽与点击逻辑 ---
  function initializeDragAndClick() {
    let hasDragged = false;
    // 主面板拖拽
    makeDraggable(container, dragHandle);
    // 点击/拖拽区分
    dragHandle.addEventListener("mousedown", () => {
      hasDragged = false;
    });
    dragHandle.addEventListener("mousemove", () => {
      hasDragged = true;
    });
    dragHandle.addEventListener("click", () => {
      if (hasDragged) return;
      const isVisible = panel.style.display === "flex";
      if (isVisible) {
        panel.style.display = "none";
      } else {
        console.log("Panel opened. Syncing with localStorage...");
        loadTrackedCoordinators();
        renderTrackingView();
        console.log("Triggering immediate data fetch...");
        runTrackingUpdate();
        panel.style.display = "flex";
        // Position panel
        const w = window.innerWidth,
          r = dragHandle.getBoundingClientRect();
        if (r.left + r.width / 2 < w / 2) {
          panel.style.left = `${dragHandle.offsetWidth + 10}px`;
          panel.style.right = "auto";
        } else {
          panel.style.right = `${dragHandle.offsetWidth + 10}px`;
          panel.style.left = "auto";
        }
      }
    });
  }

  function attachAllEventListeners() {
    initializeDragAndClick();

    const editListBtn = document.getElementById(
      "edit-list-btn"
    ) as HTMLButtonElement;
    editListBtn.addEventListener("click", async () => {
      editingContent.innerHTML = `
            <div class="loader">
                <div class="spinner"></div>
                <p>正在加载人员列表...</p>
            </div>
        `;

      switchView(trackingView, editingView);
      tempTrackedIds = new Set(trackedCoordinators.map((c) => c.id));

      try {
        allCoordinators = await fetchAllCoordinators();
        renderEditingView();
      } catch (error) {
        console.error("Error fetching coordinator list:", error);
        showToast("获取人员列表时出错", "error");
        editingContent.innerHTML = `
                <p style="text-align:center;color:red">
                    加载失败，请稍后重试。
                </p>
            `;
      }
    });

    const editingContent = document.getElementById(
      "editing-content"
    ) as HTMLDivElement;
    editingContent.addEventListener("click", (e) => {
      const target = e.target as HTMLButtonElement;
      if (target.tagName !== "BUTTON") return;

      const id = parseInt(target.dataset.id!, 10);
      if (tempTrackedIds.has(id)) {
        tempTrackedIds.delete(id);
        target.textContent = "+";
        target.className = "add-btn";
      } else {
        tempTrackedIds.add(id);
        target.textContent = "−";
        target.className = "remove-btn";
      }
    });

    const handleGoBack = () => {
      switchView(editingView, trackingView, "backward");
      editingContent.innerHTML = "";
    };

    const backBtn = document.getElementById("back-btn") as HTMLButtonElement;
    backBtn.addEventListener("click", handleGoBack);

    const cancelBtn = document.getElementById(
      "cancel-btn"
    ) as HTMLButtonElement;
    cancelBtn.addEventListener("click", handleGoBack);

    const saveBtn = document.getElementById("save-btn") as HTMLButtonElement;
    saveBtn.addEventListener("click", () => {
      trackedCoordinators = allCoordinators.filter((c) =>
        tempTrackedIds.has(c.id)
      );
      saveTrackedCoordinators();
      renderTrackingView();
      showToast("保存成功", "success");
      handleGoBack();
    });

    // --- 主追踪列表的点击事件 (已更新) ---
    const trackingTableBody = document.getElementById(
      "tracking-table-body"
    ) as HTMLTableSectionElement;
    trackingTableBody.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("status-icon")) {
        const coordinatorId = target.dataset.coordinatorId;
        const callType = target.dataset.callType; // 类型断言
        if (!coordinatorId || !callType) return;

        const cacheKey = `${coordinatorId}-${callType}`;
        const data = statusDataCache.get(cacheKey);
        if (data && data.count > 0) {
          showDetailsPopover(data, callType as CallType, target);
        } else if (data && data.count === 0) {
          showToast("没有需要处理的记录", "success");
        } else {
          showToast("暂无数据或正在加载中...", "success");
        }
      }
    });
  }

  // --- 初始化 (Story 3: 添加跨 Tab 消息监听) ---
  function initialize() {
    loadTrackedCoordinators();
    renderTrackingView();
    attachAllEventListeners();

    // --- Story 3: 注册 BroadcastChannel 消息监听 ---
    tabSyncManager.onMessage((msg) => {
      // 检查 sourceTabId 防止自我触发更新
      if (
        msg.type === "DATA_UPDATED" &&
        msg.sourceTabId !== tabSyncManager.tabId
      ) {
        console.log(
          `[Story3] Tab ${tabSyncManager.tabId} received DATA_UPDATED from Tab ${msg.sourceTabId}`
        );

        // 从 localStorage 读取最新缓存数据
        const cached = tabSyncManager.getCachedData();
        if (cached) {
          restoreFromCache(cached.data);
          renderTrackingView();
          updateLastRefreshTime(cached.timestamp);
          console.log(
            `[Story3] UI updated from broadcast, timestamp: ${new Date(
              cached.timestamp
            ).toLocaleTimeString()}`
          );
        }
      } else if (msg.type === "TAB_CLOSING") {
        console.log(`[Story3] Tab ${msg.sourceTabId} is closing`);
      }
    });

    runTrackingUpdate();
    setInterval(runTrackingUpdate, 120000); // 间隔已更新为 2 分钟
  }

  initialize();

  /*     try {
            let CallMaintenance_ns =
                "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
            const r = (await GM_fetch(CallMaintenance_ns, {
                method: "GET",
            })) as Response & { rawBody: Blob };
            console.log("r", r);
            const result = await r.rawBody.text();
            console.log("text:", result);
        } catch (error) {
            console.error(error);
        } */
};
