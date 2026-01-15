import { BaseTab } from "./BaseTab";
import { PageDetector, PageType } from "../services/PageDetector";
import {
  PrebillingTableParser,
  VisitRecord,
} from "../services/PrebillingTableParser";
import {
  CallMaintenanceTableParser,
  CallRecord,
} from "../services/CallMaintenanceTableParser";
import { CleaningOverlay } from "../services/CleaningOverlay";
import { CleaningController } from "../services/CleaningController";

/**
 * Cleaner Tab
 * Epic 11: POC 和 Duplicate Call 智能清理器
 *
 * 功能：
 * - 自动检测当前页面（Prebilling / Call Maintenance）
 * - 在 Prebilling 页面显示 POC 清理器
 * - 在 Call Maintenance 页面显示 Duplicate Call 清理器
 * - 非目标页面显示提示信息
 */
export class CleanerTab extends BaseTab {
  id = "cleaner";
  label = "清理器";
  icon = "🧹";

  private currentPageType: PageType = "UNKNOWN";
  private pageChangeHandler: ((pageType: PageType) => void) | null = null;

  /** POC 清理器：解析到的 visit 记录 */
  private visitRecords: VisitRecord[] = [];
  /** POC 清理器：选中的记录索引 */
  private selectedIndices: Set<number> = new Set();
  /** 自动刷新定时器 */
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  /** 上一次检测到的表格行数（用于检测变化） */
  private lastTableRowCount: number = 0;
  /** 自动轮询间隔（毫秒） */
  private static readonly POLLING_INTERVAL = 5000;

  /** Call 清理器：解析到的 Duplicate Call 记录 */
  private callRecords: CallRecord[] = [];
  /** Call 清理器：是否显示详情 */
  private showCallDetails: boolean = false;
  /** Call 清理器：事件处理器是否已设置（防止重复添加监听器） */
  private callEventHandlersSet: boolean = false;

  async init(): Promise<void> {
    this.initialized = true;
    console.log("[CleanerTab] Initialized");
  }

  render(container: HTMLElement): void {
    this.container = container;
    container.classList.add("cleaner-tab");

    // 检测当前页面类型
    this.currentPageType = PageDetector.getCurrentPageType();

    // 渲染对应的 UI
    this.renderContent();

    // 监听页面变化
    this.pageChangeHandler = (pageType: PageType) => {
      if (pageType !== this.currentPageType) {
        this.currentPageType = pageType;
        this.renderContent();
      }
    };
    PageDetector.onPageChange(this.pageChangeHandler);
  }

  /**
   * 根据页面类型渲染内容
   */
  private renderContent(): void {
    if (!this.container) return;

    // 清空容器
    this.container.innerHTML = "";

    switch (this.currentPageType) {
      case "PREBILLING":
        this.renderPrebillingCleaner();
        break;
      case "CALL_MAINTENANCE":
        this.renderCallCleaner();
        break;
      default:
        this.renderNoPageDetected();
        break;
    }
  }

  /**
   * 渲染 POC 清理器界面
   */
  private renderPrebillingCleaner(): void {
    if (!this.container) return;

    const wrapper = document.createElement("div");
    wrapper.className = "cleaner-wrapper";

    wrapper.innerHTML = `
      <div class="cleaner-header">
        <div class="cleaner-title-row">
          <h3 class="cleaner-title">🧹 POC Compliance 清理器</h3>
          <span class="cleaner-page-tag">📍 当前页面: ${PageDetector.getPageDisplayName(
            this.currentPageType
          )}</span>
          <button id="cleaner-refresh-btn" class="cleaner-btn-refresh" title="刷新分析">🔄</button>
        </div>
      </div>
      
      <div class="cleaner-status" id="cleaner-analysis-status">
        <span class="cleaner-spinner">⏳</span> 正在分析表格...
      </div>
      
      <div class="cleaner-records-container" id="cleaner-records-container" style="display: none;">
        <div class="cleaner-toolbar">
          <label class="cleaner-select-all">
            <input type="checkbox" id="cleaner-select-all-checkbox">
            <span>全选</span>
          </label>
          <button id="cleaner-clean-btn" class="cleaner-btn-primary" disabled>
            清理选中项 (0)
          </button>
        </div>
        
        <div class="cleaner-records-list" id="cleaner-records-list">
          <!-- 动态填充记录 -->
        </div>
      </div>
      
      <div class="cleaner-empty-state" id="cleaner-empty-state" style="display: none;">
        <div class="cleaner-empty-icon">✅</div>
        <p>当前页面已清空 POC 问题！</p>
        <p class="cleaner-hint">💡 如果表格有数据但未显示，请先点击 "Search by Coordinator(s)" 按钮搜索，然后点击 🔄 刷新</p>
      </div>
    `;

    this.container.appendChild(wrapper);

    // 刷新按钮事件监听
    const refreshBtn = document.getElementById("cleaner-refresh-btn");
    refreshBtn?.addEventListener("click", () => {
      console.log("[CleanerTab] Manual refresh triggered");
      this.analyzePrebillingTable(); // 重新分析表格
    });

    // 启动自动轮询
    this.startPolling();

    // 调用 PrebillingTableParser 分析表格
    this.analyzePrebillingTable();
  }

  /**
   * 渲染 Duplicate Call 清理器界面
   */
  private renderCallCleaner(): void {
    if (!this.container) return;

    const wrapper = document.createElement("div");
    wrapper.className = "cleaner-wrapper";

    wrapper.innerHTML = `
      <div class="cleaner-header">
        <div class="cleaner-title-row">
          <h3 class="cleaner-title">🧹 Duplicate Call 清理器</h3>
          <span class="cleaner-page-tag">📍 当前页面: ${PageDetector.getPageDisplayName(
            this.currentPageType
          )}</span>
          <button id="cleaner-refresh-btn" class="cleaner-btn-refresh" title="刷新分析">🔄</button>
        </div>
      </div>
      
      <div class="cleaner-status" id="cleaner-analysis-status">
        <span class="cleaner-spinner">⏳</span> 正在分析表格...
      </div>
      
      <div class="cleaner-call-container" id="cleaner-call-container" style="display: none;">
        <div class="cleaner-call-summary">
          <span class="cleaner-call-count">📊 检测到 <strong id="cleaner-call-count-num">0</strong> 个 Duplicate Call</span>
        </div>
        
        <div class="cleaner-toolbar">
          <button id="cleaner-toggle-details" class="cleaner-btn-secondary">
            ▼ 显示详情
          </button>
          <button id="cleaner-clean-all-btn" class="cleaner-btn-primary" disabled>
            一键清理全部
          </button>
        </div>
        
        <div class="cleaner-call-details" id="cleaner-call-details" style="display: none;">
          <!-- 动态填充详情 -->
        </div>
      </div>
      
      <div class="cleaner-empty-state" id="cleaner-empty-state" style="display: none;">
        <div class="cleaner-empty-icon">✅</div>
        <p>当前页面已清空 Duplicate Call 问题！</p>
        <p class="cleaner-hint">💡 如果表格有数据但未显示，请先执行搜索，然后点击 🔄 刷新</p>
      </div>
    `;

    this.container.appendChild(wrapper);

    // 重置事件处理器标志（新渲染时需要重新设置）
    this.callEventHandlersSet = false;

    // 刷新按钮事件监听
    const refreshBtn = document.getElementById("cleaner-refresh-btn");
    refreshBtn?.addEventListener("click", () => {
      console.log("[CleanerTab] Manual refresh triggered (Call Maintenance)");
      this.analyzeCallMaintenanceTable();
    });

    // 启动自动轮询
    this.startCallPolling();

    // 调用 CallMaintenanceTableParser 分析表格
    this.analyzeCallMaintenanceTable();
  }

  /**
   * 渲染未检测到有效页面的提示
   */
  private renderNoPageDetected(): void {
    if (!this.container) return;

    const placeholder = this.createPlaceholder("⚠️", "未检测到有效页面", "");

    // 添加支持的页面列表
    const infoDiv = document.createElement("div");
    infoDiv.className = "cleaner-no-page-info";
    infoDiv.innerHTML = `
      <p>清理器目前支持以下页面：</p>
      <ul>
        <li><strong>Prebilling Report Internal</strong> - POC Compliance 清理</li>
        <li><strong>Call Maintenance</strong> - Duplicate Call 清理</li>
      </ul>
      <p class="cleaner-hint">请导航到上述页面之一来使用清理功能。</p>
    `;

    placeholder.appendChild(infoDiv);
    this.container.appendChild(placeholder);
  }

  /**
   * 分析 Prebilling 表格
   * Story 2 & 3: 使用 PrebillingTableParser 解析并渲染列表
   */
  private async analyzePrebillingTable(): Promise<void> {
    const statusEl = document.getElementById("cleaner-analysis-status");
    const recordsContainer = document.getElementById(
      "cleaner-records-container"
    );
    const emptyState = document.getElementById("cleaner-empty-state");

    try {
      // 调用真实的解析器
      this.visitRecords = await PrebillingTableParser.parseTable();
      this.selectedIndices.clear();

      if (statusEl) statusEl.style.display = "none";

      if (this.visitRecords.length === 0) {
        // 无符合条件的记录，显示成功状态
        if (emptyState) emptyState.style.display = "block";
        if (recordsContainer) recordsContainer.style.display = "none";
      } else {
        // 有记录，渲染列表
        if (emptyState) emptyState.style.display = "none";
        if (recordsContainer) recordsContainer.style.display = "block";
        this.renderPrebillingRecordsList();
        this.setupPrebillingEventHandlers();
      }
    } catch (error) {
      console.error("[CleanerTab] Error analyzing Prebilling table:", error);
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: #e53935;">❌ 分析表格时出错</span>`;
      }
    }
  }

  /**
   * 渲染 POC 记录列表
   */
  private renderPrebillingRecordsList(): void {
    const listEl = document.getElementById("cleaner-records-list");
    if (!listEl) return;

    listEl.innerHTML = this.visitRecords
      .map(
        (record, index) => `
      <div class="cleaner-record-item" data-index="${index}">
        <input type="checkbox" class="cleaner-record-checkbox" data-index="${index}">
        <div class="cleaner-record-info">
          <div class="record-main">
            <span class="cleaner-badge ${
              record.matchType === "POC_ONLY"
                ? "badge-poc"
                : "badge-poc-caregiver"
            }">
              ${record.matchType === "POC_ONLY" ? "POC" : "POC+CG"}
            </span>
            ${record.patientName} | ${record.admissionId}
          </div>
          <div class="record-detail">
            📅 ${record.visitDate} | 🕐 ${record.scheduledTime}
          </div>
        </div>
      </div>
    `
      )
      .join("");

    this.updateCleanButtonState();
  }

  /**
   * 设置 Prebilling 清理器的事件处理器
   */
  private setupPrebillingEventHandlers(): void {
    const selectAllCheckbox = document.getElementById(
      "cleaner-select-all-checkbox"
    ) as HTMLInputElement;
    const cleanBtn = document.getElementById("cleaner-clean-btn");

    // 全选/取消全选
    selectAllCheckbox?.addEventListener("change", () => {
      const checkboxes = document.querySelectorAll(
        ".cleaner-record-checkbox"
      ) as NodeListOf<HTMLInputElement>;

      if (selectAllCheckbox.checked) {
        this.selectedIndices = new Set(this.visitRecords.map((_, i) => i));
        checkboxes.forEach((cb) => (cb.checked = true));
      } else {
        this.selectedIndices.clear();
        checkboxes.forEach((cb) => (cb.checked = false));
      }

      this.updateCleanButtonState();
    });

    // 单个复选框
    document
      .querySelectorAll(".cleaner-record-checkbox")
      .forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          const target = e.target as HTMLInputElement;
          const index = parseInt(target.dataset.index || "0", 10);

          if (target.checked) {
            this.selectedIndices.add(index);
          } else {
            this.selectedIndices.delete(index);
          }

          // 更新全选状态
          if (selectAllCheckbox) {
            selectAllCheckbox.checked =
              this.selectedIndices.size === this.visitRecords.length;
          }

          this.updateCleanButtonState();
        });
      });

    // 清理按钮（Story 4-6 实现真实清理逻辑）
    cleanBtn?.addEventListener("click", () => {
      this.handleCleanSelectedVisits();
    });
  }

  /**
   * 更新清理按钮状态
   */
  private updateCleanButtonState(): void {
    const cleanBtn = document.getElementById(
      "cleaner-clean-btn"
    ) as HTMLButtonElement;
    if (!cleanBtn) return;

    const count = this.selectedIndices.size;
    cleanBtn.textContent = `清理选中项 (${count})`;
    cleanBtn.disabled = count === 0;
  }

  /**
   * 处理清理选中的 visits
   * Story 4-6: 显示确认对话框并启动清理
   */
  private async handleCleanSelectedVisits(): Promise<void> {
    const selectedRecords = Array.from(this.selectedIndices).map(
      (i) => this.visitRecords[i]
    );

    if (selectedRecords.length === 0) {
      return;
    }

    console.log("[CleanerTab] Selected records for cleaning:", selectedRecords);

    // 显示确认对话框
    const confirmed = await CleaningOverlay.showConfirmDialog(
      selectedRecords.length,
      "PREBILLING"
    );

    if (!confirmed) {
      console.log("[CleanerTab] User cancelled cleaning");
      return;
    }

    // 启动清理流程
    await CleaningController.startCleaning(selectedRecords, "PREBILLING");
  }

  /**
   * 分析 Call Maintenance 表格
   * Story 7: 使用 CallMaintenanceTableParser 解析并渲染
   */
  private async analyzeCallMaintenanceTable(): Promise<void> {
    const statusEl = document.getElementById("cleaner-analysis-status");
    const callContainer = document.getElementById("cleaner-call-container");
    const emptyState = document.getElementById("cleaner-empty-state");

    try {
      // 调用真实的解析器
      this.callRecords = await CallMaintenanceTableParser.parseTable();

      if (statusEl) statusEl.style.display = "none";

      if (this.callRecords.length === 0) {
        // 无 Duplicate Call，显示成功状态
        if (emptyState) emptyState.style.display = "block";
        if (callContainer) callContainer.style.display = "none";
      } else {
        // 有记录，显示 UI
        if (emptyState) emptyState.style.display = "none";
        if (callContainer) callContainer.style.display = "block";

        // 更新数量
        const countEl = document.getElementById("cleaner-call-count-num");
        if (countEl) countEl.textContent = String(this.callRecords.length);

        // 启用清理按钮
        const cleanBtn = document.getElementById(
          "cleaner-clean-all-btn"
        ) as HTMLButtonElement;
        if (cleanBtn) cleanBtn.disabled = false;

        // 渲染详情列表
        this.renderCallDetailsList();

        // 设置事件处理器 - 只在首次设置，避免重复添加监听器
        if (!this.callEventHandlersSet) {
          this.setupCallEventHandlers();
          this.callEventHandlersSet = true;
        } else {
          // 更新 toggle 按钮和详情显示状态（保持之前的展开/收起状态）
          this.updateCallToggleState();
        }
      }
    } catch (error) {
      console.error(
        "[CleanerTab] Error analyzing Call Maintenance table:",
        error
      );
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: #e53935;">❌ 分析表格时出错</span>`;
      }
    }
  }

  /**
   * 渲染 Duplicate Call 详情列表
   */
  private renderCallDetailsList(): void {
    const detailsContainer = document.getElementById("cleaner-call-details");
    if (!detailsContainer) return;

    detailsContainer.innerHTML = this.callRecords
      .map(
        (record) => `
      <div class="cleaner-call-item">
        • ${record.assignCode} | ${record.caregiverName} | ${
          record.patientName || "-"
        } | ${record.callDate} ${record.callTime}
      </div>
    `
      )
      .join("");
  }

  /**
   * 设置 Call 清理器事件处理器
   */
  private setupCallEventHandlers(): void {
    // 切换详情显示
    const toggleBtn = document.getElementById("cleaner-toggle-details");
    const detailsContainer = document.getElementById("cleaner-call-details");

    toggleBtn?.addEventListener("click", () => {
      this.showCallDetails = !this.showCallDetails;
      if (toggleBtn) {
        toggleBtn.textContent = this.showCallDetails
          ? "▲ 隐藏详情"
          : "▼ 显示详情";
      }
      if (detailsContainer) {
        detailsContainer.style.display = this.showCallDetails
          ? "block"
          : "none";
      }
    });

    // 一键清理全部按钮
    const cleanAllBtn = document.getElementById("cleaner-clean-all-btn");
    cleanAllBtn?.addEventListener("click", () => {
      this.handleCleanAllCalls();
    });
  }

  /**
   * 更新 toggle 按钮和详情显示状态（不重新添加事件监听器）
   * 用于轮询刷新时保持展开/收起状态
   */
  private updateCallToggleState(): void {
    const toggleBtn = document.getElementById("cleaner-toggle-details");
    const detailsContainer = document.getElementById("cleaner-call-details");

    if (toggleBtn) {
      toggleBtn.textContent = this.showCallDetails
        ? "▲ 隐藏详情"
        : "▼ 显示详情";
    }
    if (detailsContainer) {
      detailsContainer.style.display = this.showCallDetails ? "block" : "none";
    }
  }

  /**
   * 处理一键清理全部 Duplicate Calls
   */
  private async handleCleanAllCalls(): Promise<void> {
    if (this.callRecords.length === 0) return;

    // 显示确认对话框
    const confirmed = await CleaningOverlay.showConfirmDialog(
      this.callRecords.length,
      "CALL_MAINTENANCE"
    );

    if (!confirmed) {
      console.log("[CleanerTab] User cancelled Call cleaning");
      return;
    }

    // 启动清理流程
    await CleaningController.startCleaning(
      this.callRecords.map((record) => ({
        assignCode: record.assignCode,
        caregiverName: record.caregiverName,
        patientName: record.patientName,
        callDate: record.callDate,
        callTime: record.callTime,
        rowElement: record.rowElement,
      })),
      "CALL_MAINTENANCE"
    );
  }

  onActivate(): void {
    console.log("[CleanerTab] Activated");
    // 重新检测页面类型
    this.currentPageType = PageDetector.getCurrentPageType();
    // 每次激活都重新渲染，确保在表格数据加载后能够重新分析
    this.renderContent();
  }

  onDeactivate(): void {
    console.log("[CleanerTab] Deactivated");
    // 停止轮询（当 tab 不可见时节省资源）
    this.stopPolling();
  }

  destroy(): void {
    // 停止轮询
    this.stopPolling();
    // 移除页面变化监听器
    if (this.pageChangeHandler) {
      PageDetector.offPageChange(this.pageChangeHandler);
      this.pageChangeHandler = null;
    }
    super.destroy();
  }

  /**
   * 启动自动轮询
   * 每隔一段时间检测表格是否有变化
   */
  private startPolling(): void {
    // 先停止现有的轮询
    this.stopPolling();

    // 只在 Prebilling 页面启动轮询
    if (this.currentPageType !== "PREBILLING") {
      return;
    }

    console.log(
      "[CleanerTab] Starting auto-polling (interval: " +
        CleanerTab.POLLING_INTERVAL +
        "ms)"
    );

    this.pollingTimer = setInterval(() => {
      // 检测表格行数是否变化
      const currentRowCount = PrebillingTableParser.getTotalRowCount();

      if (currentRowCount !== this.lastTableRowCount) {
        console.log(
          `[CleanerTab] Table changed: ${this.lastTableRowCount} -> ${currentRowCount} rows`
        );
        this.lastTableRowCount = currentRowCount;

        // 只有当有新数据时才重新分析
        if (currentRowCount > 0) {
          this.analyzePrebillingTable();
        }
      }
    }, CleanerTab.POLLING_INTERVAL);
  }

  /**
   * 停止自动轮询
   */
  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
      console.log("[CleanerTab] Polling stopped");
    }
  }

  /**
   * 启动 Call Maintenance 自动轮询
   */
  private startCallPolling(): void {
    // 先停止现有的轮询
    this.stopPolling();

    // 只在 Call Maintenance 页面启动轮询
    if (this.currentPageType !== "CALL_MAINTENANCE") {
      return;
    }

    console.log(
      "[CleanerTab] Starting Call Maintenance auto-polling (interval: " +
        CleanerTab.POLLING_INTERVAL +
        "ms)"
    );

    this.pollingTimer = setInterval(() => {
      // 检测表格行数是否变化
      const currentRowCount = CallMaintenanceTableParser.getTotalRowCount();

      if (currentRowCount !== this.lastTableRowCount) {
        console.log(
          `[CleanerTab] Call table changed: ${this.lastTableRowCount} -> ${currentRowCount} rows`
        );
        this.lastTableRowCount = currentRowCount;

        // 只有当有新数据时才重新分析
        if (currentRowCount > 0) {
          this.analyzeCallMaintenanceTable();
        }
      }
    }, CleanerTab.POLLING_INTERVAL);
  }
}
