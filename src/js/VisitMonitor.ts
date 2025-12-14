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
// 缓存的数据结构现在可以是两种类型之一
type CachedDetails = VisitDetail[] | AnomalyDetail[];
interface TrackedData {
  count: number;
  details: CachedDetails;
  timestamp: number;
}

// 定义追踪任务类型
type CallType = 2 | 3 | "anomaly";

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
  type: 'DATA_UPDATED' | 'REQUEST_REFRESH' | 'TAB_CLOSING';
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

  // 第 1 层：检查 DOM 中是否已存在UI，如果存在，说明已运行过，立即退出。
  if (document.getElementById("tracker-container")) {
    console.log(
      "Status Tracker script stopped: UI container already exists in the DOM."
    );
    return;
  }
  // 第 2 层：检查顶层窗口的全局标志位，防止 iframe 竞争。
  if ((window.top as any).visitMonitorHasRun) {
    console.log("Status Tracker script stopped: global flag is already set.");
    return;
  }
  (window.top as any).visitMonitorHasRun = true;

  // 第 3 层：您的原始检查，作为基础保险。
  if (window.self !== window.top) {
    console.log("Status Tracker script stopped: running in an iframe.");
    return;
  }

  // --- 状态与常量 ---
  const STORAGE_KEY = "hha_coordinator_tracker_list";
  let trackedCoordinators: Coordinator[] = [];
  let allCoordinators: Coordinator[] = [];
  let tempTrackedIds: Set<number> = new Set();
  // 新增：用于缓存追踪结果和 Office IDs
  const statusDataCache = new Map<string, TrackedData>();
  let officeIdString: string | null = null;

  // --- TAB SYNC MANAGER (Story 1 & 4: Plan D 多 Tab 同步 + 边缘情况处理) ---
  /**
   * TabSyncManager - 管理多 Tab 之间的数据同步
   * 
   * 功能：
   * - 使用 localStorage 存储共享数据，实现跨 Tab 数据持久化
   * - 使用 BroadcastChannel 实时通知其他 Tab 数据更新
   * - 提供缓存新鲜度判断，决定是否需要重新请求 API
   * - Story 4: 边缘情况处理（降级、错误处理、storage 事件备用）
   * 
   * @see docs/adr/001-multi-tab-sync.md - 架构决策记录
   * @see docs/stories/epic-1-multi-tab-sync.md - Epic 详情
   */
  class TabSyncManager {
    /** 当前 Tab 的唯一标识符 */
    public readonly tabId: string;
    /** BroadcastChannel 实例，用于 Tab 间实时通信 */
    private channel: BroadcastChannel | null = null;
    /** 是否支持 BroadcastChannel API */
    private readonly channelSupported: boolean;
    /** storage 事件回调（用于 BroadcastChannel 不可用时的备用方案） */
    private storageCallback: ((msg: SyncMessage) => void) | null = null;
    
    // --- 常量配置 ---
    /** localStorage 缓存键名 */
    private readonly CACHE_KEY = 'hha_visit_monitor_cache';
    /** BroadcastChannel 频道名称 */
    private readonly CHANNEL_NAME = 'hha-visit-monitor-sync';
    /** 缓存新鲜阈值：30秒内视为新鲜，直接使用 */
    private readonly FRESH_THRESHOLD = 30 * 1000;
    /** 缓存过期阈值：2分钟后视为过期，必须刷新 */
    private readonly STALE_THRESHOLD = 2 * 60 * 1000;

    constructor() {
      // 生成唯一的 Tab ID
      this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // 检测 BroadcastChannel 支持
      this.channelSupported = typeof BroadcastChannel !== 'undefined';
      
      if (this.channelSupported) {
        try {
          this.channel = new BroadcastChannel(this.CHANNEL_NAME);
          console.log(`[TabSyncManager] Tab ${this.tabId} initialized with BroadcastChannel`);
        } catch (e) {
          console.warn('[TabSyncManager] Failed to create BroadcastChannel:', e);
          this.channel = null;
        }
      } else {
        console.warn('[TabSyncManager] BroadcastChannel not supported, falling back to localStorage + storage event');
      }
      
      // 注册 Tab 关闭清理
      window.addEventListener('beforeunload', () => this.cleanup());
    }

    /**
     * 从 localStorage 获取缓存的数据
     * Story 4: 增强数据验证和错误处理
     * @returns 缓存数据，如果不存在或解析失败则返回 null
     */
    getCachedData(): SyncCacheData | null {
      try {
        const stored = localStorage.getItem(this.CACHE_KEY);
        if (!stored) return null;
        
        const parsed = JSON.parse(stored);
        
        // Story 4: 增强数据结构验证
        if (!this.isValidCacheData(parsed)) {
          console.warn('[TabSyncManager] Invalid cache structure, clearing corrupted data');
          this.clearCache();
          return null;
        }
        
        return parsed as SyncCacheData;
      } catch (e) {
        // Story 4: JSON 解析错误处理
        if (e instanceof SyntaxError) {
          console.error('[TabSyncManager] JSON parse error, clearing corrupted cache:', e.message);
          this.clearCache();
        } else {
          console.error('[TabSyncManager] Failed to read cached data:', e);
        }
        return null;
      }
    }

    /**
     * Story 4: 验证缓存数据结构是否有效
     * @param data - 待验证的数据
     */
    private isValidCacheData(data: unknown): data is SyncCacheData {
      if (!data || typeof data !== 'object') return false;
      const obj = data as Record<string, unknown>;
      
      // 检查必需字段
      if (typeof obj.timestamp !== 'number') return false;
      if (typeof obj.sourceTabId !== 'string') return false;
      if (!obj.data || typeof obj.data !== 'object') return false;
      
      // 检查 timestamp 是否合理（不超过 24 小时）
      const age = Date.now() - (obj.timestamp as number);
      if (age < 0 || age > 24 * 60 * 60 * 1000) {
        console.warn('[TabSyncManager] Cache timestamp out of reasonable range');
        return false;
      }
      
      return true;
    }

    /**
     * 将数据保存到 localStorage
     * Story 4: 增强错误处理和重试机制
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
          sourceTabId: this.tabId
        };
        
        const jsonStr = JSON.stringify(cacheData);
        
        // Story 4: 检查数据大小（localStorage 限制约 5MB）
        const sizeKB = new Blob([jsonStr]).size / 1024;
        if (sizeKB > 4096) { // 4MB 警告阈值
          console.warn(`[TabSyncManager] Cache size is large: ${sizeKB.toFixed(1)}KB`);
        }
        
        localStorage.setItem(this.CACHE_KEY, jsonStr);
        console.log(`[TabSyncManager] Cache updated by Tab ${this.tabId}, size: ${sizeKB.toFixed(1)}KB`);
      } catch (e) {
        this.handleStorageError(e as Error);
      }
    }

    /**
     * 通过 BroadcastChannel 向其他 Tab 广播消息
     * @param message - 要广播的消息
     */
    broadcast(message: SyncMessage): void {
      if (this.channel) {
        try {
          this.channel.postMessage(message);
          console.log(`[TabSyncManager] Broadcasted ${message.type} from Tab ${this.tabId}`);
        } catch (e) {
          console.error('[TabSyncManager] Failed to broadcast message:', e);
        }
      }
      // Story 4: BroadcastChannel 不可用时，storage 事件会自动触发其他 Tab
      // 不需要额外操作，setCachedData 会触发 storage 事件
    }

    /**
     * 注册消息监听器
     * Story 4: 同时注册 BroadcastChannel 和 storage 事件（备用方案）
     * @param callback - 收到消息时的回调函数
     */
    onMessage(callback: (msg: SyncMessage) => void): void {
      this.storageCallback = callback;
      
      // 方案 1: BroadcastChannel（优先）
      if (this.channel) {
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          callback(event.data);
        };
        
        // Story 4: 处理 BroadcastChannel 错误
        this.channel.onmessageerror = (event) => {
          console.error('[TabSyncManager] BroadcastChannel message error:', event);
        };
      }
      
      // 方案 2: storage 事件（备用，当 BroadcastChannel 不可用或出错时）
      window.addEventListener('storage', (event: StorageEvent) => {
        // 只关注我们的缓存键
        if (event.key !== this.CACHE_KEY) return;
        // 只处理其他 Tab 的修改
        if (!event.newValue) return;
        
        try {
          const newData = JSON.parse(event.newValue) as SyncCacheData;
          // 防止自己触发自己
          if (newData.sourceTabId === this.tabId) return;
          
          console.log(`[TabSyncManager] Storage event detected from Tab ${newData.sourceTabId}`);
          
          // 如果 BroadcastChannel 不可用，使用 storage 事件作为备用
          if (!this.channel && this.storageCallback) {
            this.storageCallback({
              type: 'DATA_UPDATED',
              sourceTabId: newData.sourceTabId,
              timestamp: newData.timestamp
            });
          }
        } catch (e) {
          console.error('[TabSyncManager] Failed to parse storage event data:', e);
        }
      });
      
      console.log(`[TabSyncManager] Message listeners registered (BroadcastChannel: ${!!this.channel}, Storage: true)`);
    }

    /**
     * 判断缓存的新鲜度，决定是否需要重新请求 API
     * @param cachedTimestamp - 缓存的时间戳
     * @returns 'USE' | 'USE_AND_REFRESH' | 'REFRESH'
     *   - USE: 缓存新鲜（<30s），直接使用，不请求 API
     *   - USE_AND_REFRESH: 缓存可用但需刷新（30s-2min），先显示再后台刷新
     *   - REFRESH: 缓存过期（>2min），必须立即刷新
     */
    shouldFetchFresh(cachedTimestamp: number): 'USE' | 'USE_AND_REFRESH' | 'REFRESH' {
      const age = Date.now() - cachedTimestamp;
      
      if (age < this.FRESH_THRESHOLD) {
        return 'USE';
      } else if (age < this.STALE_THRESHOLD) {
        return 'USE_AND_REFRESH';
      } else {
        return 'REFRESH';
      }
    }

    /**
     * 清理资源，在 Tab 关闭时调用
     */
    cleanup(): void {
      if (this.channel) {
        // 通知其他 Tab 本 Tab 即将关闭
        this.broadcast({
          type: 'TAB_CLOSING',
          sourceTabId: this.tabId,
          timestamp: Date.now()
        });
        this.channel.close();
        this.channel = null;
      }
      console.log(`[TabSyncManager] Tab ${this.tabId} cleanup complete`);
    }

    /**
     * Story 4: 增强的 localStorage 存储错误处理
     * @param error - 错误对象
     */
    private handleStorageError(error: Error): void {
      console.error('[TabSyncManager] Storage error:', error.name, error.message);
      
      if (error.name === 'QuotaExceededError') {
        console.warn('[TabSyncManager] Storage quota exceeded, attempting cleanup...');
        this.clearCache();
        
        // 清理其他可能的旧数据（如果需要）
        this.cleanupOldStorageData();
      } else if (error.name === 'SecurityError') {
        // 隐私模式或其他安全限制
        console.error('[TabSyncManager] Storage access denied (possibly private browsing mode)');
      }
    }

    /**
     * Story 4: 清理旧的存储数据以释放空间
     */
    private cleanupOldStorageData(): void {
      try {
        // 清理与本应用相关的其他旧缓存
        const keysToCheck = ['hha_visit_monitor_', 'hha_coordinator_'];
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && keysToCheck.some(prefix => key.startsWith(prefix)) && key !== this.CACHE_KEY) {
            // 检查是否是旧数据（超过 7 天）
            try {
              const data = localStorage.getItem(key);
              if (data) {
                const parsed = JSON.parse(data);
                if (parsed.timestamp && Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
                  localStorage.removeItem(key);
                  console.log(`[TabSyncManager] Cleaned up old storage: ${key}`);
                }
              }
            } catch {
              // 无法解析的数据，可能是旧格式，删除
              localStorage.removeItem(key);
            }
          }
        }
      } catch (e) {
        console.error('[TabSyncManager] Failed to cleanup old storage data:', e);
      }
    }

    /**
     * 清除缓存数据
     */
    clearCache(): void {
      try {
        localStorage.removeItem(this.CACHE_KEY);
        console.log('[TabSyncManager] Cache cleared');
      } catch (e) {
        console.error('[TabSyncManager] Failed to clear cache:', e);
      }
    }

    /**
     * Story 4: 获取调试信息
     */
    getDebugInfo(): object {
      return {
        tabId: this.tabId,
        channelSupported: this.channelSupported,
        channelActive: !!this.channel,
        cacheKey: this.CACHE_KEY,
        hasCachedData: !!this.getCachedData(),
        cachedDataAge: this.getCachedData()?.timestamp 
          ? `${((Date.now() - this.getCachedData()!.timestamp) / 1000).toFixed(1)}s`
          : 'N/A'
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
              <h3 style="color: #333 !important;">各类状态追踪<span id="last-refresh-time" style="font-size: 11px; color: #666; margin-left: 8px;"></span></h3>
              <button id="edit-list-btn" class="tracker-header-btn">编辑追踪列表</button>
            </div>
            <div class="tracker-content"><table class="tracker-table"><thead><tr>
                    <th style="width:40px;color: #333 !important;">编号</th>
                    <th style="width:40px;color: #333 !important;"class="col-coordinator">Coordinator (Ext.)</th>
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
    console.log(`[Story2] Restored ${Object.keys(data).length} items from cache`);
  }

  /**
   * 更新 UI 上的"上次更新时间"显示
   * @param timestamp - 时间戳
   */
  function updateLastRefreshTime(timestamp: number): void {
    const timeEl = document.getElementById('last-refresh-time');
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

  function switchView(fromView: HTMLElement, toView: HTMLElement): void {
    toView.classList.remove("hidden");
    toView.classList.add("slide-in-from-right");
    requestAnimationFrame(() => {
      fromView.classList.add("slide-out");
      toView.classList.add("slide-in");
      toView.classList.remove("slide-in-from-right");
    });
    setTimeout(() => {
      fromView.classList.remove("slide-in", "slide-out");
      fromView.classList.add("hidden");
    }, 300);
  }

  function loadTrackedCoordinators(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      trackedCoordinators = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(
        "Failed to load or parse tracked coordinators from localStorage:",
        error
      );
      trackedCoordinators = [];
    }
  }

  function saveTrackedCoordinators(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trackedCoordinators));
    } catch (error) {
      console.error(
        "Failed to save tracked coordinators to localStorage:",
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
        const clockInCount = clockInData?.count ?? 0;
        const clockOutCount = clockOutData?.count ?? 0;
        const anomalyCount = anomalyData?.count ?? 0;
        const clockInStatus = clockInCount > 0 ? "status-error" : "status-ok";
        const clockOutStatus = clockOutCount > 0 ? "status-error" : "status-ok";
        const anomalyStatus = anomalyCount > 0 ? "status-error" : "status-ok";

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
                    <td><div class="status-icon status-ok" data-coordinator-id="${
                      coordinator.id
                    }" data-call-type="message">0</div></td>
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
      console.log(`[Story2] Cache decision: ${decision}, age: ${Date.now() - cached.timestamp}ms`);
      
      if (decision === 'USE') {
        // 缓存新鲜（<30s），直接使用，跳过 API 请求
        restoreFromCache(cached.data);
        renderTrackingView();
        updateLastRefreshTime(cached.timestamp);
        console.log('[Story2] Using fresh cache, skipping API call');
        return;
      }
      
      if (decision === 'USE_AND_REFRESH') {
        // 缓存可用但需刷新（30s-2min），先显示缓存数据
        restoreFromCache(cached.data);
        renderTrackingView();
        updateLastRefreshTime(cached.timestamp);
        console.log('[Story2] Using stale cache, will refresh in background');
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
      }
      await Promise.allSettled(promises);
      renderTrackingView();
      
      // --- Story 2 & 3: API 完成后保存缓存、广播并更新时间 ---
      const now = Date.now();
      tabSyncManager.setCachedData(statusDataCache);
      
      // Story 3: 广播数据更新通知给其他 Tab
      tabSyncManager.broadcast({
        type: 'DATA_UPDATED',
        sourceTabId: tabSyncManager.tabId,
        timestamp: now
      });
      
      updateLastRefreshTime(now);
      console.log(`[Story3] Tracking update complete. Broadcasted to other tabs.`);
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
                <th>Patient Name</th><th>Assignment ID</th><th>Admission ID</th>
                <th>Caregiver Name</th><th>Visit Date</th><th>Coordinators</th>
                <th>Schedule</th><th>Contract</th><th>Discipline</th>
                <th>Service Code</th><th>Caregiver Team</th>
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
    } else {
      // 备用情况
      tableHtml = `<tbody><tr><td style="color: #333 !important;">未知的数据类型</td></tr></tbody>`;
    }

    // --- 4. 组装：将头部、内容和表格组装成完整的 Popover HTML ---
    popover.innerHTML = `
        <div class="popover-header"><h4 style="color: #333 !important;">详情列表（只显示最新10条） (${data.count} 条记录)</h4><button class="popover-close-btn">&times;</button></div>
            <div class="popover-content"><table class="popover-table">${tableHtml}</table></div>
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
      switchView(editingView, trackingView);
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

        if (callType === "message") {
          showToast("消息功能待开发", "success");
          return;
        }
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
      if (msg.type === 'DATA_UPDATED' && msg.sourceTabId !== tabSyncManager.tabId) {
        console.log(`[Story3] Tab ${tabSyncManager.tabId} received DATA_UPDATED from Tab ${msg.sourceTabId}`);
        
        // 从 localStorage 读取最新缓存数据
        const cached = tabSyncManager.getCachedData();
        if (cached) {
          restoreFromCache(cached.data);
          renderTrackingView();
          updateLastRefreshTime(cached.timestamp);
          console.log(`[Story3] UI updated from broadcast, timestamp: ${new Date(cached.timestamp).toLocaleTimeString()}`);
        }
      } else if (msg.type === 'TAB_CLOSING') {
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
