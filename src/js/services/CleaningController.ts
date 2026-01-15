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

    console.log("[CleaningController] Found pending tasks, resuming...", queue);

    // 注意：任务完成标记和索引增加已经在 handleConfirmationDialog 中处理
    // 这里只需要检查是否全部完成

    // 检查是否全部完成
    if (queue.currentIndex >= queue.tasks.length) {
      queue.status = "COMPLETED";
      GM_setValue(CLEANING_QUEUE_KEY, queue);
      CleaningOverlay.showComplete(queue.pageType);
      return true;
    }

    // 显示蒙版并继续
    const currentTask = queue.tasks[queue.currentIndex];
    CleaningOverlay.show(
      queue.currentIndex + 1,
      queue.tasks.length,
      this.getTaskInfo(currentTask, queue.pageType)
    );

    // 延迟执行，确保 DOM 加载完成
    setTimeout(() => {
      this.executeCurrentTask(queue);
    }, 1000);

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
          assignCode: callRecord.assignCode,
          caregiverName: callRecord.caregiverName,
          patientName: callRecord.patientName,
          callDate: callRecord.callDate,
          callTime: callRecord.callTime,
        };
      }
    });

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
      queue.status = "FAILED";
      GM_setValue(CLEANING_QUEUE_KEY, queue);
      CleaningOverlay.showError(task.error);
    }
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
    let targetRow: Element | null = null;

    // 首先尝试通过 rowIndex
    if (task.rowIndex !== undefined && rows[task.rowIndex]) {
      targetRow = rows[task.rowIndex];
    } else {
      // 通过匹配信息查找
      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length < 10) continue;

        const admissionId = cells[1]?.textContent?.trim();
        const patientName = cells[2]?.textContent?.trim();

        if (
          admissionId === task.admissionId &&
          patientName?.includes(task.patientName || "")
        ) {
          targetRow = row;
          break;
        }
      }
    }

    if (!targetRow) {
      throw new Error(`Row not found for ${task.patientName}`);
    }

    // 查找 Edit 按钮
    const editButton = targetRow.querySelector(
      'a[name="imgEditInternal"]'
    ) as HTMLAnchorElement;

    if (!editButton) {
      throw new Error("Edit button not found");
    }

    // 点击 Edit 按钮，页面会导航到详情页
    editButton.click();

    // 页面会重新加载，在详情页会检测到待处理任务并执行 POCResolver
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
      if (btn && btn.offsetParent !== null) {
        okButton = btn;
        break;
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
      console.log(
        "[CleaningController] No Call Reject confirmation dialog found (may not be needed)"
      );
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
    console.log("[CleaningController] Queue cleared");
  }

  /**
   * 获取当前队列状态
   */
  static getQueue(): CleaningTaskQueue | null {
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
}
