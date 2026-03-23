/**
 * CleaningController Service
 * Epic 11, Story 5: 清理控制器和任务持久化
 *
 * 功能：
 * - 使用 GM_setValue/GM_getValue 存储任务队列
 * - 页面加载时检查未完成任务
 * - 页面刷新后自动恢复清理进度
 * - 任务完成后清除队列
 */

import { CleaningOverlay, PageType } from "./CleaningOverlay";
import { VisitRecord } from "./PrebillingTableParser";

/**
 * 清理任务接口
 */
export interface CleaningTask {
  // 通用字段
  completed: boolean;
  error?: string;

  // POC 任务字段
  rowIndex?: number;
  visitDate?: string;
  patientName?: string;
  admissionId?: string;
  scheduledTime?: string;
  visitTime?: string;
  matchType?: "POC_ONLY" | "POC_AND_CAREGIVER";

  // Call 任务字段
  assignCode?: string;
  caregiverName?: string;
  callDate?: string;
  callTime?: string;
}

/**
 * Call 记录简化接口（用于 startCleaning 参数）
 */
export interface CallRecordLike {
  assignCode: string;
  caregiverName: string;
  patientName?: string;
  callDate: string;
  callTime: string;
  rowElement?: HTMLTableRowElement;
}

/**
 * 清理任务队列接口
 */
export interface CleaningTaskQueue {
  pageType: PageType;
  tasks: CleaningTask[];
  currentIndex: number;
  startTime: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
}

// GM Storage Key
const CLEANING_QUEUE_KEY = "hha_cleaner_task_queue";

// 声明 GM 函数类型
declare function GM_setValue(key: string, value: unknown): void;
declare function GM_getValue<T>(key: string, defaultValue: T): T;

export class CleaningController {
  private static lastStartedIndex = -1;

  private static pollingTimer = 0;

  // Timestamp when #confirmDelete was first observed stuck open
  private static confirmDeleteStuckSince = 0;

  /**
   * Start an interval to monitor the GM storage for queue progression.
   * This is required because task completion in the iframe modal DOES NOT trigger
   * a parent page reload, and ASP.NET AJAX UpdatePanel events are too messy to hook into.
   */
  static startQueuePolling(): void {
    if (this.pollingTimer) return;

    // IMPORTANT: Top window orchestrates the queue polling to prevent duplicate task execution.
    if (window.self !== window.top) {
      console.log("[CleaningController] Skipping queue polling in iframe.");
      return;
    }

    console.log("[CleaningController] Starting queue state polling...");
    this.pollingTimer = window.setInterval(() => {
      const queue = GM_getValue<CleaningTaskQueue | null>(
        CLEANING_QUEUE_KEY,
        null
      );

      if (queue && queue.status === "IN_PROGRESS") {
        // ★ PAGE GUARD: Only act when we are actually on the page that matches
        // the queue's pageType. Without this, the polling would trigger
        // checkPendingTasks() (and show the overlay) on any page — including
        // unrelated ones like CallReportsBeta.ns.aspx — as long as a stale
        // IN_PROGRESS queue exists in GM storage.
        const url = window.location.href.toLowerCase();
        const isOnExpectedPage =
          queue.pageType === "PREBILLING"
            ? url.includes("prebillingreportinternal_ns.aspx")
            : url.includes("callmaintenance_ns.aspx");

        if (!isOnExpectedPage) {
          return; // Wrong page — skip this polling tick entirely
        }

        // Prevent launching the next task if a meaningful modal is still open.
        // Empty-content modals (e.g. pre-created reveal containers) are excluded
        // to avoid permanent false-positive blocking.
        const visibleModals = Array.from(
          document.querySelectorAll(
            '.reveal-overlay, [id*="PopWin"], .hhax-modal'
          )
        ).filter(
          (el) =>
            window.getComputedStyle(el as HTMLElement).display !== "none" &&
            (el as HTMLElement).innerHTML.trim().length > 10
        );

        // Self-healing: if #confirmDelete is stuck open (callback threw an exception
        // so its close() was never called), force-close it after 5 seconds.
        const confirmDeleteEl = document.getElementById("confirmDelete");
        if (
          confirmDeleteEl &&
          window.getComputedStyle(confirmDeleteEl).display !== "none"
        ) {
          if (this.confirmDeleteStuckSince === 0) {
            this.confirmDeleteStuckSince = Date.now();
          } else if (Date.now() - this.confirmDeleteStuckSince > 5000) {
            console.warn(
              "[CleaningController] #confirmDelete stuck open >5s, force-closing to unblock polling."
            );
            confirmDeleteEl.style.display = "none";
            confirmDeleteEl.setAttribute("aria-hidden", "true");
            // Also close the backing overlay
            document.querySelectorAll(".reveal-overlay").forEach((ov) => {
              if (
                window.getComputedStyle(ov as HTMLElement).display !== "none"
              ) {
                (ov as HTMLElement).style.display = "none";
              }
            });
            this.confirmDeleteStuckSince = 0;
          }
        } else {
          this.confirmDeleteStuckSince = 0;
        }

        const isModalOpen = visibleModals.length > 0;
        if (isModalOpen) {
          return; // Wait for the modal to close
        }

        if (queue.currentIndex > this.lastStartedIndex) {
          console.log(
            `[CleaningController] Polling detected queue advancement (${this.lastStartedIndex} -> ${queue.currentIndex}). Triggering next task...`
          );
          // Note: Wait a brief moment to ensure any associated DOM updates finish settling.
          setTimeout(() => {
            this.checkPendingTasks();
          }, 1500);
        }
      } else if (queue && queue.status === "COMPLETED" && this.pollingTimer) {
        window.clearInterval(this.pollingTimer);
        this.pollingTimer = 0;
        console.log("[CleaningController] Queue completed. Stopped polling.");
      }
    }, 1000);
  }

  /**
   * 检查是否有待处理的清理任务
   * 在页面加载时调用
   */
  static async checkPendingTasks(): Promise<boolean> {
    const queue = GM_getValue<CleaningTaskQueue | null>(
      CLEANING_QUEUE_KEY,
      null
    );

    if (!queue || queue.status !== "IN_PROGRESS") {
      return false;
    }

    if (this.lastStartedIndex === queue.currentIndex) {
      console.log(
        `[CleaningController] Task ${queue.currentIndex} already started in this session. Yielding to active task.`
      );
      return false;
    }

    this.lastStartedIndex = queue.currentIndex;

    console.log("[CleaningController] Found pending tasks, resuming...", queue);

    // 检查是否全部完成
    if (queue.currentIndex >= queue.tasks.length) {
      console.log(
        `[CleaningController] checkPendingTasks: All tasks complete (${queue.currentIndex}/${queue.tasks.length}). Finalizing queue.`
      );
      queue.status = "COMPLETED";
      GM_setValue(CLEANING_QUEUE_KEY, queue);
      CleaningOverlay.showComplete(queue.pageType);

      if (this.pollingTimer) {
        window.clearInterval(this.pollingTimer);
        this.pollingTimer = 0;
        console.log("[CleaningController] Polling stopped on completion.");
      }
      return true;
    }

    // Capture expected index for closure checks
    const expectedIndex = queue.currentIndex;

    // 显示蒙版并继续
    const currentTask = queue.tasks[queue.currentIndex];
    CleaningOverlay.show(
      queue.currentIndex + 1,
      queue.tasks.length,
      this.getTaskInfo(currentTask, queue.pageType)
    );

    // 更新蒙版状态提示
    CleaningOverlay.update(
      queue.currentIndex + 1,
      queue.tasks.length,
      `${this.getTaskInfo(currentTask, queue.pageType)} (等待页面加载...)`
    );

    // 智能等待表格加载，最长等待 5 分钟 (300000ms) 以防 Session Timeout 弹窗阻塞
    this.waitForTable(queue.pageType, 300000)
      .then(() => {
        // ★ CRITICAL FIX: Re-fetch the queue! Iframe might have finished the task while we were waiting!
        const latestQueue = GM_getValue<CleaningTaskQueue | null>(
          CLEANING_QUEUE_KEY,
          null
        );
        if (
          !latestQueue ||
          latestQueue.status !== "IN_PROGRESS" ||
          latestQueue.currentIndex !== expectedIndex
        ) {
          console.warn(
            "[CleaningController] Queue state changed during waitForTable. Aborting stale execution."
          );
          return;
        }

        // 表格加载完成，执行任务
        console.log("[CleaningController] Table loaded, executing task...");
        // 再次更新蒙版状态
        CleaningOverlay.update(
          latestQueue.currentIndex + 1,
          latestQueue.tasks.length,
          this.getTaskInfo(currentTask, latestQueue.pageType)
        );

        // ★★★ 给 ASP.NET UpdatePanel 一点反应时间，防止点击太快事件未绑定导致卡住
        setTimeout(() => {
          // Double check again if queue state moved
          const doubleCheckQueue = GM_getValue<CleaningTaskQueue | null>(
            CLEANING_QUEUE_KEY,
            null
          );
          if (
            !doubleCheckQueue ||
            doubleCheckQueue.status !== "IN_PROGRESS" ||
            doubleCheckQueue.currentIndex !== expectedIndex
          ) {
            console.warn(
              "[CleaningController] Queue advanced during UpdatePanel settlement timeout. Aborting."
            );
            return;
          }

          // Double check if table is still attached to document
          const tableInDoc =
            document.querySelector("#tblDetails") ||
            document.querySelector("#ctl00_ContentPlaceHolder1_uxGvSearch");
          if (tableInDoc && !document.body.contains(tableInDoc)) {
            console.warn(
              "[CleaningController] Table became detached, waiting again..."
            );
            setTimeout(() => {
              this.checkPendingTasks();
            }, 3000);
            return;
          }
          this.executeCurrentTask(doubleCheckQueue);
        }, 3000);
      })
      .catch((error) => {
        console.warn(
          "[CleaningController] Initial wait table failed, trying recovery options...",
          error
        );

        // Recovery mechanism for Prebilling: Click Search button if table is missing
        // This is common after a page reload where the search results are cleared
        if (queue.pageType === "PREBILLING") {
          const searchBtn = (document.querySelector("#prebillingSelector") ||
            document.querySelector(
              "#ctl00_ContentPlaceHolder1_uxSearchPrebilling"
            ) ||
            document.querySelector(
              "#ctl00_ContentPlaceHolder1_btnSearch"
            )) as HTMLInputElement;

          if (searchBtn) {
            console.log(
              "[CleaningController] Found Search button (" +
                searchBtn.id +
                "), clicking to refresh table..."
            );
            const isCustomBtn = searchBtn.id === "prebillingSelector";
            searchBtn.click();

            // Retry waiting for table
            CleaningOverlay.update(
              expectedIndex + 1,
              queue.tasks.length,
              `${this.getTaskInfo(
                currentTask,
                queue.pageType
              )} (正在刷新表格...)`
            );

            // Important: Add delay if using custom button to allow event propagation and async loading start
            const delayMs = isCustomBtn ? 1500 : 500;
            setTimeout(() => {
              this.waitForTable(queue.pageType, 300000)
                .then(() => {
                  const retryQueue = GM_getValue<CleaningTaskQueue | null>(
                    CLEANING_QUEUE_KEY,
                    null
                  );
                  if (
                    !retryQueue ||
                    retryQueue.status !== "IN_PROGRESS" ||
                    retryQueue.currentIndex !== expectedIndex
                  ) {
                    console.warn(
                      "[CleaningController] Queue state changed during retry. Aborting."
                    );
                    return;
                  }
                  console.log(
                    "[CleaningController] Table loaded after auto-search, executing task..."
                  );
                  this.executeCurrentTask(retryQueue);
                })
                .catch((retryError) => {
                  console.error(
                    "[CleaningController] Retry failed:",
                    retryError
                  );
                  const failQueue =
                    GM_getValue<CleaningTaskQueue | null>(
                      CLEANING_QUEUE_KEY,
                      null
                    ) || queue;
                  failQueue.status = "FAILED";
                  GM_setValue(CLEANING_QUEUE_KEY, failQueue);
                  CleaningOverlay.showError(
                    `无法加载表格。尝试自动搜索失败。\n请手动点击搜索按钮，脚本将尝试恢复。`
                  );
                });
            }, delayMs);
            return;
          }
        }

        console.error("[CleaningController] Timeout waiting for table:", error);
        queue.status = "FAILED";
        GM_setValue(CLEANING_QUEUE_KEY, queue);
        CleaningOverlay.showError(
          `页面加载超时，无法找到表格。\n请手动刷新页面，脚本将尝试恢复。`
        );
      });

    return true;
  }

  /**
   * 启动清理流程
   * 支持 POC 记录 (VisitRecord) 和 Call 记录
   */
  static async startCleaning(
    records: Array<VisitRecord | CallRecordLike>,
    pageType: PageType
  ): Promise<void> {
    // 转换为任务列表
    const tasks: CleaningTask[] = records.map((record) => {
      if (pageType === "PREBILLING") {
        // POC 记录
        const visitRecord = record as VisitRecord;
        return {
          completed: false,
          rowIndex: visitRecord.rowIndex,
          visitDate: visitRecord.visitDate,
          patientName: visitRecord.patientName,
          admissionId: visitRecord.admissionId,
          scheduledTime: visitRecord.scheduledTime,
          visitTime: visitRecord.visitTime,
          matchType: visitRecord.matchType,
        };
      } else {
        // Call 记录
        const callRecord = record as CallRecordLike;
        return {
          completed: false,
          // Extract specific properties for call task...
          ...callRecord,
        } as unknown as CleaningTask; // Cast for now
      }
    });

    console.log(
      `[CleaningController] Starting batch cleaning for ${tasks.length} items.`
    );
    console.log("[CleaningController] Queue Tasks:", tasks);

    // 创建任务队列
    const queue: CleaningTaskQueue = {
      pageType,
      tasks,
      currentIndex: 0,
      startTime: Date.now(),
      status: "IN_PROGRESS",
    };

    // 保存到 GM_setValue
    GM_setValue(CLEANING_QUEUE_KEY, queue);
    console.log(
      "[CleaningController] Started cleaning with",
      tasks.length,
      "tasks"
    );

    // 显示蒙版
    CleaningOverlay.show(1, tasks.length, this.getTaskInfo(tasks[0], pageType));

    // 确保监控轮询正在运行 (如果用户在不刷新页面的情况下进行第二次清理，轮询可能已关闭)
    this.lastStartedIndex = -1;
    this.startQueuePolling();

    // 执行第一个任务
    await this.executeCurrentTask(queue);
  }

  /**
   * 执行当前任务
   */
  private static async executeCurrentTask(
    queue: CleaningTaskQueue
  ): Promise<void> {
    const task = queue.tasks[queue.currentIndex];

    try {
      if (queue.pageType === "PREBILLING") {
        await this.executePOCClean(task);
      } else {
        await this.executeCallReject(task);
      }

      // 注意：索引增加已移到各自的确认对话框处理函数中
      // - POC 任务：handleConfirmationDialog (在 index.ts 中)
      // - Call 任务：handleCallRejectConfirmation (在本类中)
      // 这确保索引在点击 OK 之前更新，页面刷新后能正确继续下一个任务

      // 页面会自动刷新，不需要手动触发下一个任务
    } catch (error) {
      console.error("[CleaningController] Task execution error:", error);
      task.error = error instanceof Error ? error.message : String(error);

      // CRITICAL FIX: If a single row is not found (meaning it was probably cleaned manually or disappeared),
      // we shouldn't fail the ENTIRE batch. Just mark this one as failed/skipped and move to the next.
      if (task.error.includes("Row not found")) {
        console.warn(
          `[CleaningController] Skipping task ${queue.currentIndex + 1}/${
            queue.tasks.length
          } because row was missing.`
        );
        queue.currentIndex++; // Skip and advance
        GM_setValue(CLEANING_QUEUE_KEY, queue);

        if (queue.currentIndex >= queue.tasks.length) {
          queue.status = "COMPLETED";
          GM_setValue(CLEANING_QUEUE_KEY, queue);
          CleaningOverlay.showComplete(queue.pageType);
        } else {
          // Continue to next task immediately
          CleaningController.OpeningNextTaskDelay(queue);
        }
      } else {
        // Other critical errors fail the queue
        queue.status = "FAILED";
        GM_setValue(CLEANING_QUEUE_KEY, queue);
        CleaningOverlay.showError(task.error);
      }
    }
  }

  // helper function to encapsulate the setTimeout call since we use it repeatedly
  private static OpeningNextTaskDelay(queue: CleaningTaskQueue) {
    setTimeout(() => {
      this.executeCurrentTask(queue);
    }, 1000);
  }

  /**
   * 执行 POC 清理
   * 点击 Edit 按钮导航到 visit 详情页
   */
  private static async executePOCClean(task: CleaningTask): Promise<void> {
    console.log(
      "[CleaningController] Executing POC clean for:",
      task.patientName
    );

    // 查找对应的表格行
    const table = document.querySelector("#tblDetails");
    if (!table) {
      throw new Error("Table not found");
    }

    const tbody = table.querySelector("tbody");
    const rows = tbody
      ? tbody.querySelectorAll("tr")
      : table.querySelectorAll("tr");

    // 通过 rowIndex 或匹配关键信息找到行
    // Verify or find the row using Admission ID and Patient Name (Prioritize exact match over rowIndex)
    // After a table reload/search, the rowIndex might have changed order.
    let targetRow: Element | null = null;
    let foundByMatch = false;

    // ── 第一轮：精确四字段匹配（admissionId + patientName + visitDate + scheduledTime）──
    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      // 使用与 PrebillingTableParser 一致的 14 列判断（ACTIONS 列索引 13）
      if (cells.length < 14) continue;

      // Normalize spaces to match PrebillingTableParser logic
      const visitDate = cells[0]?.textContent?.trim().replace(/\s+/g, " ");
      const admissionId = cells[1]?.textContent?.trim().replace(/\s+/g, " ");
      const patientName = cells[2]?.textContent?.trim().replace(/\s+/g, " ");
      const scheduledTime = cells[8]?.textContent?.trim().replace(/\s+/g, " ");

      if (
        admissionId === task.admissionId &&
        patientName?.includes(task.patientName || "") &&
        visitDate === task.visitDate &&
        scheduledTime === task.scheduledTime
      ) {
        console.log(
          `[CleaningController] [Match-1] Matched ${task.patientName} (${task.admissionId}) on ${task.visitDate} at ${task.scheduledTime}`
        );
        targetRow = row;
        foundByMatch = true;
        break;
      }
    }

    // ── 第二轮：三字段匹配（忽略 scheduledTime 格式差异）──
    // 当页面刷新后 scheduledTime 格式（如前导零）可能与解析时不同，此轮作为降级手段
    if (!foundByMatch) {
      console.warn(
        `[CleaningController] 4-field match failed for ${task.patientName} (${task.admissionId}). Trying 3-field match (admissionId + patientName + visitDate)...`
      );
      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length < 14) continue;

        const visitDate = cells[0]?.textContent?.trim().replace(/\s+/g, " ");
        const admissionId = cells[1]?.textContent?.trim().replace(/\s+/g, " ");
        const patientName = cells[2]?.textContent?.trim().replace(/\s+/g, " ");

        if (
          admissionId === task.admissionId &&
          patientName?.includes(task.patientName || "") &&
          visitDate === task.visitDate
        ) {
          console.warn(
            `[CleaningController] [Match-2] Fallback matched by 3 fields (no scheduledTime): ${task.patientName} (${task.admissionId}) on ${task.visitDate}`
          );
          targetRow = row;
          foundByMatch = true;
          break;
        }
      }
    }

    // ── 第三轮：精确双字段匹配（admissionId + visitDate，无 patientName 子串匹配）──
    // 进一步兜底：patientName 可能含特殊字符或因大小写不同导致 includes 失败
    if (!foundByMatch) {
      console.warn(
        `[CleaningController] 3-field match also failed. Trying 2-field match (admissionId + visitDate)...`
      );
      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length < 14) continue;

        const visitDate = cells[0]?.textContent?.trim().replace(/\s+/g, " ");
        const admissionId = cells[1]?.textContent?.trim().replace(/\s+/g, " ");

        if (admissionId === task.admissionId && visitDate === task.visitDate) {
          console.warn(
            `[CleaningController] [Match-3] Fallback matched by admissionId+visitDate only: ${task.patientName} (${task.admissionId}) on ${task.visitDate}`
          );
          targetRow = row;
          foundByMatch = true;
          break;
        }
      }
    }

    // ── 最终降级：rowIndex + admissionId+visitDate 双字段核实 ──
    // 仅在以上三轮均失败时使用，且必须通过日期核实防止错配
    if (!foundByMatch && task.rowIndex !== undefined && rows[task.rowIndex]) {
      console.warn(
        `[CleaningController] All field-matches failed. Falling back to rowIndex ${task.rowIndex} with date verification for ${task.patientName}`
      );
      const candidateRow = rows[task.rowIndex] as HTMLTableRowElement;
      const candidateCells = candidateRow.querySelectorAll("td");
      if (candidateCells.length >= 14) {
        const candidateAdmId = candidateCells[1]?.textContent?.trim() || "";
        const candidateDate =
          candidateCells[0]?.textContent?.trim().replace(/\s+/g, " ") || "";

        if (
          candidateAdmId.includes(task.admissionId) &&
          candidateDate === task.visitDate
        ) {
          console.warn(
            `[CleaningController] [Match-4] rowIndex ${task.rowIndex} verified by admissionId+visitDate`
          );
          targetRow = candidateRow;
        } else {
          // rowIndex 对应行不匹配：在全表中按 admissionId + visitDate 搜索
          console.warn(
            `[CleaningController] rowIndex ${task.rowIndex} mismatch. Searching by admissionId+visitDate: ${task.admissionId} / ${task.visitDate}`
          );
          const deepFallback = Array.from(rows).find((r) => {
            const rCells = (r as HTMLTableRowElement).querySelectorAll("td");
            if (rCells.length < 14) return false;
            const idStr = rCells[1]?.textContent?.trim() || "";
            const dateStr =
              rCells[0]?.textContent?.trim().replace(/\s+/g, " ") || "";
            return (
              idStr.includes(task.admissionId) && dateStr === task.visitDate
            );
          });

          if (deepFallback) {
            console.warn(
              `[CleaningController] [Match-4b] Found by admissionId+visitDate scan`
            );
            targetRow = deepFallback;
          } else {
            console.error(
              `[CleaningController] All fallbacks exhausted. Row not found for ${task.patientName} (${task.admissionId}) on ${task.visitDate}`
            );
            targetRow = null;
          }
        }
      }
    }

    // Confirm found
    if (!targetRow) {
      throw new Error(
        `Row not found for ${task.patientName} (${task.admissionId})`
      );
    }

    // 查找 Edit 按钮
    const editButton = targetRow.querySelector(
      'a[name="imgEditInternal"]'
    ) as HTMLAnchorElement;

    if (!editButton) {
      throw new Error("Edit button not found");
    }

    // Update overlay to indicate navigation
    const queue = GM_getValue<CleaningTaskQueue | null>(
      CLEANING_QUEUE_KEY,
      null
    );
    if (queue) {
      CleaningOverlay.update(
        queue.currentIndex + 1,
        queue.tasks.length,
        `${this.getTaskInfo(task, queue.pageType)} (正在打开详情页...)`
      );
    }

    // 设置时间戳，用于防误触 (防止用户手动打开导致自动POC被触发)
    GM_setValue("hha_cleaner_poc_click_time", Date.now());

    // 点击 Edit 按钮，页面会导航到详情页
    editButton.click();

    // 页面会重新加载，在详情页会检测到待处理任务并执行 POCResolver
  }

  /**
   * 确保 CallMaintenance_ns AjaxPro 代理已正确初始化。
   * 页面首次加载时 ashx 可能因 session/timing 问题执行失败，
   * 导致 CallMaintenance_ns 为空对象或 undefined。
   *
   * 重要：检测使用 unsafeWindow（页面真实 window），修复使用 GM.addElement 将
   * script 标签注入到页面上下文执行——这样可以绕过 Tampermonkey sandbox 限制和
   * 页面 CSP，确保变量被注册到页面的 window 上，供页面原生 RejectCall() 使用。
   */
  private static async ensureCallMaintenanceNs(): Promise<void> {
    // 必须检查 unsafeWindow（页面真实 window），而非 sandbox 代理的 window
    const pageWin = unsafeWindow as unknown as Record<string, unknown>;
    const ns = pageWin["CallMaintenance_ns"] as
      | Record<string, unknown>
      | undefined;
    if (ns && typeof ns["RejectCall"] === "function") {
      return; // 已正确初始化
    }
    console.warn(
      "[CleaningController] CallMaintenance_ns not initialized, re-injecting via GM.addElement..."
    );
    // 动态获取 ashx URL，从页面上已有的 script 标签中提取，避免硬编码租户路径
    const existingAshxScript = Array.from(document.scripts).find((s) =>
      s.src.includes("CallMaintenance_ns,HHAExchangeUI.ashx")
    );
    const ashxUrl =
      existingAshxScript?.src ||
      (() => {
        const m = window.location.pathname.match(/\/(ENT\d+)\//);
        return m
          ? `/${m[1]}/ajaxpro/CallMaintenance_ns,HHAExchangeUI.ashx`
          : "/ajaxpro/CallMaintenance_ns,HHAExchangeUI.ashx";
      })();

    // 使用 GM.addElement 注入 <script src> 元素：
    // - 在页面真实上下文（而非 userscript sandbox）中执行
    // - Tampermonkey 的 privileged context 可绕过页面 CSP
    // - 加 _r 参数防止浏览器 script 缓存阻止重新执行
    await new Promise<void>((resolve, reject) => {
      const cacheBustedUrl = ashxUrl.split("?")[0] + "?_r=" + Date.now();
      const script = GM.addElement(document.head, "script", {
        src: cacheBustedUrl,
        type: "text/javascript",
      }) as HTMLScriptElement;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error(`Failed to load ashx from: ${cacheBustedUrl}`));
    });

    const nsAfter = pageWin["CallMaintenance_ns"] as
      | Record<string, unknown>
      | undefined;
    if (!nsAfter || typeof nsAfter["RejectCall"] !== "function") {
      throw new Error(
        "CallMaintenance_ns.RejectCall still not available after GM.addElement re-injection"
      );
    }
    console.log(
      "[CleaningController] CallMaintenance_ns re-injected successfully via GM.addElement."
    );
  }

  /**
   * 执行 Call Reject
   * 点击 Reject 按钮，然后处理确认对话框
   */
  private static async executeCallReject(task: CleaningTask): Promise<void> {
    console.log(
      "[CleaningController] Executing Call reject for:",
      task.caregiverName
    );

    // 确保 AjaxPro 代理已初始化，避免 RejectCall callback 抛出 ReferenceError
    await this.ensureCallMaintenanceNs();

    // 查找 Call Maintenance 表格
    const table = document.querySelector(
      "#ctl00_ContentPlaceHolder1_uxGvSearch"
    );
    if (!table) {
      throw new Error("Call Maintenance table not found");
    }

    const tbody = table.querySelector("tbody");
    const rows = tbody
      ? tbody.querySelectorAll("tr")
      : table.querySelectorAll("tr");

    // 通过 assignCode 和其他信息查找行
    let targetRow: Element | null = null;

    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length < 10) continue;

      const assignCode = cells[0]?.textContent?.trim();
      const caregiverName = cells[2]?.textContent?.trim();

      if (
        assignCode === task.assignCode &&
        caregiverName?.includes(task.caregiverName || "")
      ) {
        targetRow = row;
        break;
      }
    }

    if (!targetRow) {
      throw new Error(`Row not found for ${task.caregiverName}`);
    }

    // 查找 Reject 按钮
    const rejectButton = targetRow.querySelector(
      'a[id*="uxbtnRejectCall"]'
    ) as HTMLAnchorElement;

    if (!rejectButton) {
      throw new Error("Reject button not found");
    }

    // 点击 Reject 按钮
    console.log("[CleaningController] Clicking Reject button...");
    rejectButton.click();

    // 处理 "Confirm Call Rejection" 对话框
    // 对话框 ID: #confirmDelete, 确认按钮: button.primary
    setTimeout(() => {
      this.handleCallRejectConfirmation();
    }, 500);
  }

  /**
   * 处理 Call Reject 确认对话框
   * 对话框结构: #confirmDelete.reveal.hhax-modal
   * 确认按钮: button.button.primary (文字 "Ok")
   */
  private static handleCallRejectConfirmation(retryCount = 0): void {
    const MAX_RETRIES = 15;

    console.log(
      `[CleaningController] Looking for Call Reject confirmation dialog (attempt ${
        retryCount + 1
      }/${MAX_RETRIES})...`
    );

    // 精确选择器，基于调试发现的结构
    const selectors = [
      "#confirmDelete button.primary",
      "#confirmDelete button.button.primary",
      ".hhax-modal button.primary",
      ".reveal button.primary",
    ];

    let okButton: HTMLElement | null = null;

    for (const selector of selectors) {
      const btn = document.querySelector(selector) as HTMLElement;
      // Use computed display instead of offsetParent — Foundation reveal modals
      // can have offsetParent===null even when visually open (position:fixed ancestry).
      if (btn) {
        // Walk up to the modal container to check if it is actually visible
        const modal = btn.closest(".hhax-modal, .reveal") as HTMLElement | null;
        const isVisible = modal
          ? window.getComputedStyle(modal).display !== "none"
          : window.getComputedStyle(btn).display !== "none";
        if (isVisible) {
          okButton = btn;
          break;
        }
      }
    }

    if (okButton) {
      // 在点击 OK 之前，增加任务索引
      try {
        const queue = GM_getValue<CleaningTaskQueue | null>(
          CLEANING_QUEUE_KEY,
          null
        );
        if (queue && queue.status === "IN_PROGRESS") {
          queue.tasks[queue.currentIndex].completed = true;
          queue.currentIndex++;
          GM_setValue(CLEANING_QUEUE_KEY, queue);
          console.log(
            `[CleaningController] Task index advanced to ${queue.currentIndex}/${queue.tasks.length}`
          );
        }
      } catch (e) {
        console.error("[CleaningController] Failed to update task queue:", e);
      }

      console.log(
        "[CleaningController] Clicking Call Reject confirmation OK button..."
      );
      okButton.click();
      // 点击后页面会刷新
    } else if (retryCount < MAX_RETRIES) {
      setTimeout(() => this.handleCallRejectConfirmation(retryCount + 1), 300);
    } else {
      // Confirmation dialog never appeared — the reject may have silently succeeded
      // (ASP.NET UpdatePanel sometimes skips the dialog) or the Reject click had no
      // effect. Either way, we MUST advance the index so the queue is not frozen.
      console.warn(
        "[CleaningController] Confirmation dialog not found after max retries. Advancing queue to prevent freeze."
      );
      try {
        const queue = GM_getValue<CleaningTaskQueue | null>(
          CLEANING_QUEUE_KEY,
          null
        );
        if (queue && queue.status === "IN_PROGRESS") {
          queue.tasks[queue.currentIndex].completed = true;
          queue.tasks[queue.currentIndex].error =
            "Confirmation dialog not found — may have silently succeeded";
          queue.currentIndex++;
          GM_setValue(CLEANING_QUEUE_KEY, queue);
          console.log(
            `[CleaningController] Queue advanced to ${queue.currentIndex}/${queue.tasks.length} after dialog timeout`
          );
        }
      } catch (e) {
        console.error(
          "[CleaningController] Failed to advance queue after dialog timeout:",
          e
        );
      }
    }
  }

  /**
   * 获取任务信息描述
   */
  private static getTaskInfo(task: CleaningTask, pageType: PageType): string {
    if (pageType === "PREBILLING") {
      return `${task.patientName} - ${task.admissionId}`;
    } else {
      return `${task.caregiverName} - ${task.callDate}`;
    }
  }

  /**
   * 清除队列
   */
  static clearQueue(): void {
    GM_setValue(CLEANING_QUEUE_KEY, null);
    this.lastStartedIndex = -1;
    console.log("[CleaningController] Queue cleared");
  }

  /**
   * 获取当前队列状态
   */
  public static getQueue(): CleaningTaskQueue | null {
    return GM_getValue<CleaningTaskQueue | null>(CLEANING_QUEUE_KEY, null);
  }

  /**
   * 中止清理
   */
  static abortCleaning(): void {
    const queue = this.getQueue();
    if (queue) {
      queue.status = "FAILED";
      GM_setValue(CLEANING_QUEUE_KEY, queue);
    }
    CleaningOverlay.hide();
  }
  /**
   * 等待表格元素加载完成
   * @param pageType 页面类型
   * @param timeoutMs 超时时间（毫秒）
   */
  private static waitForTable(
    pageType: PageType,
    timeoutMs: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const selector =
        pageType === "PREBILLING"
          ? "#ctl00_ContentPlaceHolder1_divPrebillingReportInternalScroll" // Prebilling 容器
          : "#ctl00_ContentPlaceHolder1_uxGvSearch"; // Call Maintenance 表格

      const check = () => {
        const element = document.querySelector(selector);
        // 确保元素不仅存在，而且有内容（行数 > 0）
        // 对于 Call Maintenance，至少应该有 header row
        let isReady = false;
        if (element) {
          if (pageType === "PREBILLING") {
            // Check for the actual data table, not just the container
            const dataTable = document.querySelector("#tblDetails");
            isReady = !!dataTable; // Prebilling table must exist
          } else {
            // Call Maintenance 表格应该有 tbody 或 tr
            const table = element as HTMLTableElement;
            isReady = table.rows.length > 0;
          }
        }

        if (isReady) {
          resolve();
          return;
        }

        if (Date.now() - startTime > timeoutMs) {
          reject(new Error(`Timeout waiting for selector: ${selector}`));
          return;
        }

        // 使用 requestAnimationFrame 或 setTimeout 轮询
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(check);
        } else {
          setTimeout(check, 100);
        }
      };

      check();
    });
  }
}
