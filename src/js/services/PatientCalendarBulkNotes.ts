import { PatientCalendarBulkNotesModal } from "../components/PatientCalendarBulkNotesModal";
import { highlight2Call } from "../Highlight2Call";
import { PageDetector, PageType } from "./PageDetector";
import { openPatientCalendarTimesheetComposer } from "./PatientCalendarTimesheetComposer";
import { PatientVisitNotesService } from "./PatientVisitNotesService";

const CALENDAR_IFRAME_ID = "iframefrmRightSide";
const CALENDAR_PATH_KEYWORD = "InternalPatientCalendarDetails_ns.aspx";
const BTN_VISITS_SELECTOR = "button#btnVisits";
const BULK_BUTTON_ID = "hha-patient-calendar-bulk-notes-btn";
const BULK_BUTTON_ROW_CLASS = "hha-patient-calendar-action-row";
const SUMMARY_OVERLAY_ID = "hha-patient-calendar-bulk-notes-summary";
const CONFIRM_OVERLAY_ID = "hha-patient-calendar-bulk-notes-confirm";
const FIXED_NOTE_TEXT = "Received live-in Timesheet";
const DEFAULT_CONCURRENCY = 3;
const HEARTBEAT_INTERVAL_MS = 1200;

interface BatchFailure {
  date: string;
  reason: string;
}

interface BatchResult {
  created: string[];
  skipped: string[];
  failed: BatchFailure[];
}

interface RunContext {
  patientId: string;
  officeId: string;
  iframeDocument: Document;
}

function toDisplayDate(canonicalDate: string): string {
  return `${canonicalDate.slice(5, 7)}/${canonicalDate.slice(
    8,
    10
  )}/${canonicalDate.slice(0, 4)}`;
}

function sortCanonicalDates(dates: string[]): string[] {
  return Array.from(new Set(dates)).sort((left, right) =>
    left.localeCompare(right)
  );
}

function getQueryParamCaseInsensitive(
  searchParams: URLSearchParams,
  targetKey: string
): string {
  const normalizedKey = targetKey.toLowerCase();
  for (const [key, value] of searchParams.entries()) {
    if (key.toLowerCase() === normalizedKey) {
      return value.trim();
    }
  }
  return "";
}

export class PatientCalendarBulkNotes {
  private pageChangeHandler: ((pageType: PageType) => void) | null = null;
  private readonly iframeLoadHandler = () => this.handleIframeState();
  private currentIframe: HTMLIFrameElement | null = null;
  private heartbeatTimer: number | null = null;
  private isRunning = false;

  init(): void {
    if (this.pageChangeHandler) {
      return;
    }

    this.pageChangeHandler = (pageType: PageType) => {
      this.handlePageChange(pageType);
    };

    PageDetector.onPageChange(this.pageChangeHandler);
    this.handlePageChange(PageDetector.getCurrentPageType());
  }

  destroy(): void {
    if (this.pageChangeHandler) {
      PageDetector.offPageChange(this.pageChangeHandler);
      this.pageChangeHandler = null;
    }

    this.stopHeartbeat();
    this.detachIframe();
  }

  private handlePageChange(pageType: PageType): void {
    if (pageType !== "PATIENT_PROFILE") {
      this.stopHeartbeat();
      this.detachIframe();
      return;
    }

    this.startHeartbeat();
    this.attachCurrentIframe();
    this.handleIframeState();
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      return;
    }

    this.heartbeatTimer = window.setInterval(() => {
      this.attachCurrentIframe();
      this.handleIframeState();
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private attachCurrentIframe(): void {
    const iframe = document.getElementById(
      CALENDAR_IFRAME_ID
    ) as HTMLIFrameElement | null;

    if (!iframe) {
      this.detachIframe();
      return;
    }

    if (iframe === this.currentIframe) {
      return;
    }

    this.detachIframe();
    this.currentIframe = iframe;
    iframe.addEventListener("load", this.iframeLoadHandler);
  }

  private detachIframe(): void {
    if (this.currentIframe) {
      this.currentIframe.removeEventListener("load", this.iframeLoadHandler);
    }

    this.currentIframe = null;
  }

  private handleIframeState(): void {
    this.ensureIframeHighlight2Call();

    const iframeDocument = this.getCalendarIframeDocument();
    if (!iframeDocument) {
      return;
    }

    this.ensureBulkButton(iframeDocument);
  }

  private ensureIframeHighlight2Call(): void {
    const iframeWindow = this.currentIframe?.contentWindow;
    const iframeDocument = this.getCurrentIframeDocument();
    if (!iframeWindow || !iframeDocument) {
      return;
    }

    highlight2Call(iframeWindow, iframeDocument);
  }

  private getCurrentIframeDocument(): Document | null {
    if (!this.currentIframe) {
      return null;
    }

    const iframeDocument =
      this.currentIframe.contentDocument ||
      this.currentIframe.contentWindow?.document;
    if (!iframeDocument || !iframeDocument.body) {
      return null;
    }

    return iframeDocument;
  }

  private getCalendarIframeDocument(): Document | null {
    if (!this.currentIframe) {
      return null;
    }

    const iframeUrl = this.getIframeUrl(this.currentIframe);
    if (!iframeUrl.includes(CALENDAR_PATH_KEYWORD)) {
      return null;
    }

    return this.getCurrentIframeDocument();
  }

  private ensureBulkButton(iframeDocument: Document): void {
    const anchorButton = iframeDocument.querySelector(
      BTN_VISITS_SELECTOR
    ) as HTMLButtonElement | null;
    if (!anchorButton || !anchorButton.parentElement) {
      return;
    }

    const buttonRow = this.ensureBulkButtonRow(anchorButton);

    let bulkButton = iframeDocument.getElementById(
      BULK_BUTTON_ID
    ) as HTMLButtonElement | null;

    if (!bulkButton) {
      bulkButton = iframeDocument.createElement("button");
      bulkButton.id = BULK_BUTTON_ID;
      bulkButton.type = "button";
      bulkButton.className = this.buildButtonClass(anchorButton);
      bulkButton.classList.add("hha-bulk-notes-trigger");
      bulkButton.style.marginRight = "8px";
      bulkButton.style.whiteSpace = "nowrap";
      bulkButton.style.width = "auto";
      bulkButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        void this.handleBulkButtonClick();
      });
      buttonRow.insertBefore(bulkButton, anchorButton);
    }

    if (bulkButton.parentElement !== buttonRow) {
      buttonRow.insertBefore(bulkButton, anchorButton);
    }

    bulkButton.textContent = this.isRunning
      ? "批量 Notes 处理中..."
      : "快速添加 Notes";
    bulkButton.disabled = this.isRunning;
  }

  private ensureBulkButtonRow(anchorButton: HTMLButtonElement): HTMLDivElement {
    const parent = anchorButton.parentElement as HTMLElement;
    const existingInParent = parent.querySelector(
      `.${BULK_BUTTON_ROW_CLASS}`
    ) as HTMLDivElement | null;

    const row =
      existingInParent ||
      (() => {
        const created = anchorButton.ownerDocument.createElement("div");
        created.className = BULK_BUTTON_ROW_CLASS;
        created.style.display = "inline-flex";
        created.style.alignItems = "center";
        created.style.justifyContent = "flex-end";
        created.style.gap = "8px";
        created.style.marginLeft = "auto";
        created.style.flexWrap = "nowrap";
        parent.insertBefore(created, anchorButton);
        return created;
      })();

    if (anchorButton.parentElement !== row) {
      row.appendChild(anchorButton);
    }

    return row;
  }

  private buildButtonClass(anchorButton: HTMLButtonElement): string {
    const classes = Array.from(anchorButton.classList).filter(
      (className) => className !== "dropdown" && className !== "active"
    );

    if (classes.length === 0) {
      return "button primary";
    }

    return classes.join(" ");
  }

  private async handleBulkButtonClick(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    let runContext: RunContext;
    try {
      runContext = this.resolveRunContext();
    } catch (error) {
      this.showToast(this.formatError(error), "error");
      return;
    }

    const modalResult = await PatientCalendarBulkNotesModal.open({
      noteText: FIXED_NOTE_TEXT,
      onOutlookClick: (dates) => {
        openPatientCalendarTimesheetComposer({
          selectedDates: dates,
        });
      },
    });

    if (!modalResult) {
      return;
    }

    const selectedDates = sortCanonicalDates(modalResult.dates);
    if (selectedDates.length === 0) {
      this.showToast("请至少选择一个日期后再执行", "info");
      return;
    }

    const confirmed = await this.confirmBatchExecution(selectedDates);
    if (!confirmed) {
      return;
    }

    this.isRunning = true;
    this.handleIframeState();

    try {
      const result = await this.runBatch(runContext, selectedDates);
      this.refreshCalendar(runContext.iframeDocument);
      this.showSummary(result);
    } catch (error) {
      this.showToast(this.formatError(error), "error");
    } finally {
      this.isRunning = false;
      this.handleIframeState();
    }
  }

  private resolveRunContext(): RunContext {
    const patientId = this.extractPatientIdFromCurrentUrl();
    if (!patientId) {
      throw new Error("无法从当前 Patient Profile URL 提取 PatientId");
    }

    const iframeDocument = this.getCalendarIframeDocument();
    if (!iframeDocument) {
      throw new Error(
        "当前右侧 iframe 不是 Patient Calendar，无法执行批量 Notes"
      );
    }

    const officeId = this.extractOfficeId(iframeDocument);
    if (!officeId) {
      throw new Error("无法从 Patient Calendar 提取 officeId");
    }

    return {
      patientId,
      officeId,
      iframeDocument,
    };
  }

  private extractPatientIdFromCurrentUrl(): string {
    const searchParams = new URLSearchParams(window.location.search);
    return (
      getQueryParamCaseInsensitive(searchParams, "PatientId") ||
      getQueryParamCaseInsensitive(searchParams, "PatientID")
    );
  }

  private extractOfficeId(iframeDocument: Document): string {
    if (this.currentIframe) {
      const iframeUrl = this.getIframeUrl(this.currentIframe);
      try {
        const url = new URL(iframeUrl, window.location.origin);
        const fromUrl =
          getQueryParamCaseInsensitive(url.searchParams, "OfficeID") ||
          getQueryParamCaseInsensitive(url.searchParams, "office");
        if (fromUrl) {
          return fromUrl;
        }
      } catch {
        // ignore malformed iframe URL and fall back to hidden fields
      }
    }

    const hiddenOfficeId = (
      iframeDocument.getElementById("hdnOfficeID") as HTMLInputElement | null
    )?.value;
    if (hiddenOfficeId?.trim()) {
      return hiddenOfficeId.trim();
    }

    const vendorId = (
      iframeDocument.getElementById("hdnvendorID") as HTMLInputElement | null
    )?.value;
    return vendorId?.trim() || "";
  }

  private getIframeUrl(iframe: HTMLIFrameElement): string {
    try {
      const href = iframe.contentWindow?.location.href;
      if (href) {
        return href;
      }
    } catch {
      // same-origin access can fail during transient reloads; fall back to src
    }

    return iframe.getAttribute("src") || "";
  }

  private async runBatch(
    runContext: RunContext,
    selectedDates: string[]
  ): Promise<BatchResult> {
    const created: string[] = [];
    const skipped: string[] = [];
    const failed: BatchFailure[] = [];
    const normalizedTargetText =
      PatientVisitNotesService.normalizeVisitNoteText(FIXED_NOTE_TEXT);
    let cursor = 0;

    const workerCount = Math.max(
      1,
      Math.min(DEFAULT_CONCURRENCY, selectedDates.length)
    );

    const worker = async () => {
      while (true) {
        const index = cursor;
        cursor += 1;

        if (index >= selectedDates.length) {
          return;
        }

        const canonicalDate = selectedDates[index];
        const visitDate = toDisplayDate(canonicalDate);

        try {
          const html = await PatientVisitNotesService.fetchVisitNotesPage({
            patientId: runContext.patientId,
            visitDate,
            officeId: runContext.officeId,
          });

          const records = PatientVisitNotesService.parseVisitNotes(html);
          const hasDuplicate = records.some((record) => {
            return (
              PatientVisitNotesService.normalizeVisitNoteText(
                record.noteText
              ) === normalizedTargetText
            );
          });

          if (hasDuplicate) {
            skipped.push(canonicalDate);
            continue;
          }

          await PatientVisitNotesService.saveVisitNote({
            patientId: runContext.patientId,
            note: FIXED_NOTE_TEXT,
            visitDate,
          });
          created.push(canonicalDate);
        } catch (error) {
          if (this.shouldVerifyWriteResult(error)) {
            const wasWritten = await this.verifyVisitNoteWasWritten(
              runContext,
              visitDate,
              normalizedTargetText
            );

            if (wasWritten) {
              created.push(canonicalDate);
              continue;
            }
          }

          failed.push({
            date: canonicalDate,
            reason: this.formatError(error),
          });
        }
      }
    };

    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    return {
      created: sortCanonicalDates(created),
      skipped: sortCanonicalDates(skipped),
      failed: failed.sort((left, right) => left.date.localeCompare(right.date)),
    };
  }

  private shouldVerifyWriteResult(error: unknown): boolean {
    const message = this.formatError(error).toLowerCase();
    return (
      message.includes("savepatientvisitnotes returned invalid json") ||
      message.includes("savepatientvisitnotes did not return a positive value")
    );
  }

  private async verifyVisitNoteWasWritten(
    runContext: RunContext,
    visitDate: string,
    normalizedTargetText: string
  ): Promise<boolean> {
    try {
      const html = await PatientVisitNotesService.fetchVisitNotesPage({
        patientId: runContext.patientId,
        visitDate,
        officeId: runContext.officeId,
      });
      const records = PatientVisitNotesService.parseVisitNotes(html);
      return records.some((record) => {
        return (
          PatientVisitNotesService.normalizeVisitNoteText(record.noteText) ===
          normalizedTargetText
        );
      });
    } catch {
      return false;
    }
  }

  private refreshCalendar(iframeDocument: Document): void {
    const refreshButton = iframeDocument.querySelector(
      "#uxbtnSearch, #uxBtnSearch, [id$='uxbtnSearch'], [id$='uxBtnSearch']"
    ) as HTMLElement | null;

    refreshButton?.click();
  }

  private confirmBatchExecution(selectedDates: string[]): Promise<boolean> {
    document.getElementById(CONFIRM_OVERLAY_ID)?.remove();

    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.id = CONFIRM_OVERLAY_ID;
      overlay.className = "template-modal-overlay pcbn-confirm-overlay";

      const chips = selectedDates
        .map((date) => {
          return `<span class="pcbn-confirm-chip">${this.escapeHtml(
            toDisplayDate(date)
          )}</span>`;
        })
        .join("");

      overlay.innerHTML = `
        <div class="template-modal pcbn-confirm-modal" role="dialog" aria-modal="true" aria-label="确认批量添加 Notes">
          <div class="template-modal-header">
            <h3 class="template-modal-title">确认批量添加 Notes</h3>
            <button class="template-modal-close" type="button" aria-label="关闭">&times;</button>
          </div>
          <div class="template-modal-body pcbn-confirm-body">
            <div class="pcbn-confirm-desc">即将为以下 <strong>${
              selectedDates.length
            }</strong> 个日期添加固定内容 <strong>${this.escapeHtml(
        FIXED_NOTE_TEXT
      )}</strong>。请确认后继续。</div>
            <div class="pcbn-confirm-list">${chips}</div>
          </div>
          <div class="template-modal-footer">
            <button type="button" class="template-modal-btn btn-cancel" data-action="cancel">取消</button>
            <button type="button" class="template-modal-btn btn-save" data-action="confirm">确认添加</button>
          </div>
        </div>
      `;

      const finish = (value: boolean) => {
        overlay.remove();
        resolve(value);
      };

      overlay
        .querySelector(".template-modal-close")
        ?.addEventListener("click", () => finish(false));
      overlay
        .querySelector('[data-action="cancel"]')
        ?.addEventListener("click", () => finish(false));
      overlay
        .querySelector('[data-action="confirm"]')
        ?.addEventListener("click", () => finish(true));
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          finish(false);
        }
      });

      document.body.appendChild(overlay);
    });
  }

  private showSummary(result: BatchResult): void {
    document.getElementById(SUMMARY_OVERLAY_ID)?.remove();

    const overlay = document.createElement("div");
    overlay.id = SUMMARY_OVERLAY_ID;
    overlay.className = "template-modal-overlay pcbn-summary-overlay";

    const failedPreview = result.failed
      .map((item) => {
        return `<li><strong>${this.escapeHtml(
          toDisplayDate(item.date)
        )}</strong><span>${this.escapeHtml(item.reason)}</span></li>`;
      })
      .join("");

    overlay.innerHTML = `
      <div class="template-modal pcbn-summary-modal" role="dialog" aria-modal="true" aria-label="批量 Visit Notes 结果">
        <div class="template-modal-header">
          <h3 class="template-modal-title">Patient Visit Notes 批量结果</h3>
          <button class="template-modal-close" type="button" aria-label="关闭">&times;</button>
        </div>
        <div class="template-modal-body pcbn-summary-body">
          <div class="pcbn-summary-note">本次固定写入内容：${this.escapeHtml(
            FIXED_NOTE_TEXT
          )}</div>
          <div class="pcbn-summary-grid">
            <div class="pcbn-summary-stat">
              <div class="pcbn-summary-stat-value">${
                result.created.length
              }</div>
              <div class="pcbn-summary-stat-label">创建成功</div>
            </div>
            <div class="pcbn-summary-stat">
              <div class="pcbn-summary-stat-value">${
                result.skipped.length
              }</div>
              <div class="pcbn-summary-stat-label">已跳过</div>
            </div>
            <div class="pcbn-summary-stat pcbn-summary-stat--danger">
              <div class="pcbn-summary-stat-value">${result.failed.length}</div>
              <div class="pcbn-summary-stat-label">失败</div>
            </div>
          </div>
          ${
            result.failed.length > 0
              ? `
              <div class="pcbn-summary-failures">
                <div class="pcbn-summary-failures-title">失败日期（共 ${result.failed.length} 条）</div>
                <ul>${failedPreview}</ul>
              </div>
            `
              : `<div class="pcbn-summary-success">所有日期都已完成去重检查与写入处理。</div>`
          }
        </div>
        <div class="template-modal-footer">
          <button type="button" class="template-modal-btn btn-save" data-action="close-summary">关闭</button>
        </div>
      </div>
    `;

    const close = () => overlay.remove();
    overlay
      .querySelector(".template-modal-close")
      ?.addEventListener("click", close);
    overlay
      .querySelector('[data-action="close-summary"]')
      ?.addEventListener("click", close);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        close();
      }
    });

    document.body.appendChild(overlay);
  }

  private showToast(message: string, type: "success" | "error" | "info"): void {
    document.querySelector(".pcbn-toast")?.remove();

    const toast = document.createElement("div");
    toast.className = `qa-toast qa-toast-${type} pcbn-toast`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add("show");
      });
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, Math.max(3200, message.length * 55));
  }

  private formatError(error: unknown): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message.trim();
    }

    return typeof error === "string" && error.trim()
      ? error.trim()
      : "发生未知错误";
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

let bulkNotesServiceInstance: PatientCalendarBulkNotes | null = null;

export function initPatientCalendarBulkNotes(): void {
  if (!bulkNotesServiceInstance) {
    bulkNotesServiceInstance = new PatientCalendarBulkNotes();
  }

  bulkNotesServiceInstance.init();
}
