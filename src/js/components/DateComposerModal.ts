import { CSPBypassInjector } from "../services/CSPBypassInjector";
import {
  DATE_FORMAT_PRESET_OPTIONS,
  DateComposerService,
  DateFormatPreset,
} from "../services/DateComposerService";

const MODAL_STYLE_ID = "hha-date-composer-modal-style";

export interface DateComposerModalOptions {
  initialDates: string[];
  preset: DateFormatPreset;
  showPresetSelector?: boolean;
}

export interface DateComposerModalResult {
  dates: string[];
  preset: DateFormatPreset;
  displayText: string;
}

function isOutlookHost(): boolean {
  const host = window.location.hostname.toLowerCase();
  return (
    host === "outlook.office.com" ||
    host === "outlook.cloud.microsoft" ||
    host === "webshell.suite.office.com"
  );
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toCanonical(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function firstDayOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, months: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1)
  );
}

function ensureStyles(): void {
  if (document.getElementById(MODAL_STYLE_ID)) {
    return;
  }

  const css = `
    .hha-date-composer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.42);
      z-index: 100200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
    }

    .hha-date-composer-modal {
      width: min(840px, 96vw);
      max-height: min(720px, 90vh);
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      color: #333333;
    }

    .hha-date-composer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      border-bottom: 1px solid rgba(255, 255, 255, 0.25);
    }

    .hha-date-composer-title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
    }

    .hha-date-composer-close {
      border: none;
      background: rgba(255, 255, 255, 0.16);
      color: #ffffff;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    }

    .hha-date-composer-close:hover {
      background: rgba(255, 255, 255, 0.26);
    }

    .hha-date-composer-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px;
      flex: 1;
      min-height: 0;
      overflow: auto;
      background: #f7f8fa;
    }

    .hha-date-composer-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .hha-date-composer-toolbar-left {
      font-size: 12px;
      color: #666666;
    }

    .hha-date-composer-nav {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .hha-date-composer-nav-btn {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #ffffff;
      color: #333333;
      min-width: 30px;
      height: 30px;
      cursor: pointer;
      font-size: 15px;
      line-height: 1;
      transition: all 0.15s ease;
    }

    .hha-date-composer-nav-btn:hover {
      background: #f0f2f5;
    }

    .hha-date-composer-months {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .hha-date-composer-month {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      background: #ffffff;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .hha-date-composer-month-title {
      margin: 0;
      padding: 8px 10px;
      background: #f2f4f8;
      border-bottom: 1px solid #e0e0e0;
      font-size: 13px;
      font-weight: 600;
      color: #333333;
    }

    .hha-date-composer-weekdays,
    .hha-date-composer-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(28px, 1fr));
      gap: 4px;
      padding: 8px;
      box-sizing: border-box;
    }

    .hha-date-composer-weekday {
      text-align: center;
      font-size: 11px;
      color: #666666;
      padding: 3px 0;
      font-weight: 600;
    }

    .hha-date-composer-grid {
      grid-template-rows: repeat(6, 32px);
    }

    .hha-date-composer-day {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #ffffff;
      color: #333333;
      height: 32px;
      padding: 0;
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
      transition: all 0.12s ease;
    }

    .hha-date-composer-day:hover {
      background: #f0f2f5;
      border-color: #cfd5dd;
    }

    .hha-date-composer-day.selected {
      background: #667eea;
      border-color: #667eea;
      color: #ffffff;
      font-weight: 600;
    }

    .hha-date-composer-day.today {
      box-shadow: inset 0 0 0 1px #52c41a;
    }

    .hha-date-composer-empty {
      height: 32px;
    }

    .hha-date-composer-preview {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #ffffff;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-height: 72px;
    }

    .hha-date-composer-preview-label {
      font-size: 12px;
      color: #666666;
      font-weight: 600;
    }

    .hha-date-composer-preview-text {
      font-size: 13px;
      color: #333333;
      word-break: break-word;
      min-height: 18px;
      line-height: 1.45;
    }

    .hha-date-composer-preview-controls {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      border-top: 1px solid #f0f0f0;
      margin-top: 4px;
      padding-top: 8px;
    }

    .hha-date-composer-format-label {
      font-size: 12px;
      color: #666666;
      white-space: nowrap;
    }

    .hha-date-composer-format-select {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #ffffff;
      color: #333333;
      font-size: 12px;
      min-height: 30px;
      padding: 4px 30px 4px 8px;
      min-width: 250px;
      max-width: 100%;
      background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"%3E%3Cpath fill="%23666" d="M6 9L1 4h10z"/%3E%3C/svg%3E');
      background-repeat: no-repeat;
      background-position: right 8px center;
      background-size: 12px 12px;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
    }

    .hha-date-composer-format-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px #a29bfe;
    }

    .hha-date-composer-footer {
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 10px 12px;
      background: #ffffff;
      flex-wrap: wrap;
    }

    .hha-date-composer-btn {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #ffffff;
      color: #333333;
      font-size: 13px;
      padding: 7px 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .hha-date-composer-btn:hover {
      background: #f0f2f5;
    }

    .hha-date-composer-btn.primary {
      border-color: transparent;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
    }

    .hha-date-composer-btn.primary:hover {
      background: linear-gradient(135deg, #5a6fd6 0%, #6a3f96 100%);
    }

    @media (max-width: 880px) {
      .hha-date-composer-modal {
        max-height: min(820px, 94vh);
      }

      .hha-date-composer-months {
        grid-template-columns: 1fr;
      }

      .hha-date-composer-preview-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .hha-date-composer-format-select {
        min-width: 100%;
      }
    }
  `;

  if (isOutlookHost() && CSPBypassInjector.isAvailable()) {
    CSPBypassInjector.injectStyle(css, MODAL_STYLE_ID);
    return;
  }

  const style = document.createElement("style");
  style.id = MODAL_STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

export class DateComposerModal {
  private overlayEl: HTMLDivElement | null = null;
  private monthContainerEl: HTMLDivElement | null = null;
  private previewTextEl: HTMLDivElement | null = null;
  private readonly draftService: DateComposerService;
  private monthCursor: Date;
  private lastInteractedDate: string | null = null;
  private resolver: ((value: DateComposerModalResult | null) => void) | null =
    null;

  constructor(private readonly options: DateComposerModalOptions) {
    this.draftService = new DateComposerService(
      options.initialDates,
      options.preset
    );

    const selected = this.draftService.getSelectedDates();
    if (selected.length > 0) {
      const first = new Date(`${selected[0]}T00:00:00Z`);
      this.monthCursor = firstDayOfMonth(first);
    } else {
      this.monthCursor = firstDayOfMonth(new Date());
    }
  }

  static open(
    options: DateComposerModalOptions
  ): Promise<DateComposerModalResult | null> {
    const modal = new DateComposerModal(options);
    return modal.open();
  }

  open(): Promise<DateComposerModalResult | null> {
    ensureStyles();

    return new Promise((resolve) => {
      this.resolver = resolve;
      this.render();
    });
  }

  private render(): void {
    this.destroy();

    const overlay = document.createElement("div");
    overlay.className = "hha-date-composer-overlay";

    const modal = document.createElement("div");
    modal.className = "hha-date-composer-modal";

    const header = document.createElement("div");
    header.className = "hha-date-composer-header";
    header.innerHTML = `<h3 class="hha-date-composer-title">日期输入</h3>`;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "hha-date-composer-close";
    closeBtn.title = "关闭";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => this.finish(null));
    header.appendChild(closeBtn);

    const content = document.createElement("div");
    content.className = "hha-date-composer-content";

    const toolbar = document.createElement("div");
    toolbar.className = "hha-date-composer-toolbar";
    toolbar.innerHTML = `<div class="hha-date-composer-toolbar-left">支持 Shift + Click 连续区间；若区间已全选则再次操作可批量取消</div>`;

    const nav = document.createElement("div");
    nav.className = "hha-date-composer-nav";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "hha-date-composer-nav-btn";
    prevBtn.textContent = "◀";
    prevBtn.title = "上两个月";
    prevBtn.addEventListener("click", () => {
      this.monthCursor = addMonths(this.monthCursor, -1);
      this.renderMonths();
    });

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "hha-date-composer-nav-btn";
    nextBtn.textContent = "▶";
    nextBtn.title = "下两个月";
    nextBtn.addEventListener("click", () => {
      this.monthCursor = addMonths(this.monthCursor, 1);
      this.renderMonths();
    });

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    toolbar.appendChild(nav);

    const monthContainer = document.createElement("div");
    monthContainer.className = "hha-date-composer-months";

    const preview = document.createElement("div");
    preview.className = "hha-date-composer-preview";
    preview.innerHTML = `<div class="hha-date-composer-preview-label">实时预览</div>`;
    const previewText = document.createElement("div");
    previewText.className = "hha-date-composer-preview-text";
    preview.appendChild(previewText);

    if (this.options.showPresetSelector === true) {
      const previewControls = document.createElement("div");
      previewControls.className = "hha-date-composer-preview-controls";
      const formatLabel = document.createElement("span");
      formatLabel.className = "hha-date-composer-format-label";
      formatLabel.textContent = "格式：";
      const presetSelect = document.createElement("select");
      presetSelect.className = "hha-date-composer-format-select";
      presetSelect.innerHTML = DATE_FORMAT_PRESET_OPTIONS.map(
        (option) => `<option value="${option.value}">${option.label}</option>`
      ).join("");
      presetSelect.value = this.draftService.getPreset();
      presetSelect.addEventListener("change", () => {
        this.draftService.setPreset(presetSelect.value as DateFormatPreset);
        this.refreshPreview();
      });

      previewControls.appendChild(formatLabel);
      previewControls.appendChild(presetSelect);
      preview.appendChild(previewControls);
    }

    content.appendChild(toolbar);
    content.appendChild(monthContainer);
    content.appendChild(preview);

    const footer = document.createElement("div");
    footer.className = "hha-date-composer-footer";

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "hha-date-composer-btn";
    clearBtn.textContent = "清空";
    clearBtn.addEventListener("click", () => {
      this.lastInteractedDate = null;
      this.draftService.clear();
      this.refreshPreview();
      this.renderMonths();
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "hha-date-composer-btn";
    cancelBtn.textContent = "取消";
    cancelBtn.addEventListener("click", () => this.finish(null));

    const applyBtn = document.createElement("button");
    applyBtn.type = "button";
    applyBtn.className = "hha-date-composer-btn primary";
    applyBtn.textContent = "应用";
    applyBtn.addEventListener("click", () => {
      this.finish({
        dates: this.draftService.getSelectedDates(),
        preset: this.draftService.getPreset(),
        displayText: this.draftService.buildDisplayText(),
      });
    });

    footer.appendChild(clearBtn);
    footer.appendChild(cancelBtn);
    footer.appendChild(applyBtn);

    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(footer);
    overlay.appendChild(modal);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        this.finish(null);
      }
    });

    document.addEventListener("keydown", this.handleKeydown);
    document.body.appendChild(overlay);

    this.overlayEl = overlay;
    this.monthContainerEl = monthContainer;
    this.previewTextEl = previewText;
    this.renderMonths();
    this.refreshPreview();
  }

  private renderMonths(): void {
    if (!this.monthContainerEl) {
      return;
    }

    this.monthContainerEl.innerHTML = "";

    const leftMonth = this.createMonthElement(this.monthCursor);
    const rightMonth = this.createMonthElement(addMonths(this.monthCursor, 1));

    this.monthContainerEl.appendChild(leftMonth);
    this.monthContainerEl.appendChild(rightMonth);
  }

  private createMonthElement(monthDate: Date): HTMLElement {
    const year = monthDate.getUTCFullYear();
    const monthIndex = monthDate.getUTCMonth();
    const today = new Date();

    const monthWrapper = document.createElement("div");
    monthWrapper.className = "hha-date-composer-month";

    const title = document.createElement("h4");
    title.className = "hha-date-composer-month-title";
    title.textContent = `${year}年 ${monthIndex + 1}月`;
    monthWrapper.appendChild(title);

    const weekdayRow = document.createElement("div");
    weekdayRow.className = "hha-date-composer-weekdays";
    ["日", "一", "二", "三", "四", "五", "六"].forEach((label) => {
      const weekday = document.createElement("div");
      weekday.className = "hha-date-composer-weekday";
      weekday.textContent = label;
      weekdayRow.appendChild(weekday);
    });
    monthWrapper.appendChild(weekdayRow);

    const grid = document.createElement("div");
    grid.className = "hha-date-composer-grid";

    const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
    const daysInMonth = new Date(
      Date.UTC(year, monthIndex + 1, 0)
    ).getUTCDate();

    for (let i = 0; i < firstWeekday; i++) {
      const empty = document.createElement("div");
      empty.className = "hha-date-composer-empty";
      grid.appendChild(empty);
    }

    const selected = new Set(this.draftService.getSelectedDates());
    const todayCanonical = `${today.getFullYear()}-${pad2(
      today.getMonth() + 1
    )}-${pad2(today.getDate())}`;

    for (let day = 1; day <= daysInMonth; day++) {
      const canonical = toCanonical(year, monthIndex, day);

      const dayBtn = document.createElement("button");
      dayBtn.type = "button";
      dayBtn.className = "hha-date-composer-day";
      dayBtn.textContent = String(day);
      dayBtn.dataset.date = canonical;

      if (selected.has(canonical)) {
        dayBtn.classList.add("selected");
      }

      if (canonical === todayCanonical) {
        dayBtn.classList.add("today");
      }

      dayBtn.addEventListener("click", (event) => {
        this.handleDateClick(canonical, (event as MouseEvent).shiftKey);
      });

      grid.appendChild(dayBtn);
    }

    const totalCells = firstWeekday + daysInMonth;
    for (let i = totalCells; i < 42; i++) {
      const empty = document.createElement("div");
      empty.className = "hha-date-composer-empty";
      grid.appendChild(empty);
    }

    monthWrapper.appendChild(grid);
    return monthWrapper;
  }

  private handleDateClick(
    canonicalDate: string,
    isShiftPressed: boolean
  ): void {
    if (isShiftPressed && this.lastInteractedDate) {
      const rangeDates = this.draftService.getRangeDates(
        this.lastInteractedDate,
        canonicalDate
      );
      const shouldDeselectRange =
        rangeDates.length > 0 &&
        rangeDates.every((date) => this.draftService.hasDate(date));

      this.draftService.setRangeSelection(
        this.lastInteractedDate,
        canonicalDate,
        !shouldDeselectRange
      );
    } else {
      this.draftService.toggleDate(canonicalDate);
    }

    this.lastInteractedDate = canonicalDate;
    this.refreshPreview();
    this.renderMonths();
  }

  private refreshPreview(): void {
    if (!this.previewTextEl) {
      return;
    }

    const text = this.draftService.buildDisplayText();
    this.previewTextEl.textContent = text || "尚未选择日期";
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      this.finish(null);
    }
  };

  private finish(result: DateComposerModalResult | null): void {
    const resolve = this.resolver;
    this.resolver = null;
    this.destroy();
    resolve?.(result);
  }

  private destroy(): void {
    if (this.overlayEl) {
      this.overlayEl.remove();
      this.overlayEl = null;
    }
    this.monthContainerEl = null;
    this.previewTextEl = null;
    document.removeEventListener("keydown", this.handleKeydown);
  }
}
