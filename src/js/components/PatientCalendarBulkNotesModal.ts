import { DateComposerService } from "../services/DateComposerService";

export interface PatientCalendarBulkNotesModalOptions {
  noteText: string;
  initialDates?: string[];
  onOutlookClick?: (dates: string[]) => void | Promise<void>;
}

export interface PatientCalendarBulkNotesModalResult {
  dates: string[];
}

type StatusTone = "info" | "success" | "error";

interface WeekdayOption {
  value: number;
  label: string;
}

const WEEKDAY_OPTIONS: WeekdayOption[] = [
  { value: 1, label: "周一" },
  { value: 2, label: "周二" },
  { value: 3, label: "周三" },
  { value: 4, label: "周四" },
  { value: 5, label: "周五" },
  { value: 6, label: "周六" },
  { value: 0, label: "周日" },
];

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function firstDayOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, months: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1)
  );
}

function toCanonical(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function toDisplayDate(canonicalDate: string): string {
  return `${canonicalDate.slice(5, 7)}/${canonicalDate.slice(
    8,
    10
  )}/${canonicalDate.slice(0, 4)}`;
}

function toDateInputValue(canonicalDate: string): string {
  return canonicalDate;
}

function getUtcWeekday(canonicalDate: string): number {
  return new Date(`${canonicalDate}T00:00:00Z`).getUTCDay();
}

export class PatientCalendarBulkNotesModal {
  private overlayEl: HTMLDivElement | null = null;
  private monthContainerEl: HTMLDivElement | null = null;
  private selectionCountEl: HTMLDivElement | null = null;
  private selectionListEl: HTMLDivElement | null = null;
  private applyButtonEl: HTMLButtonElement | null = null;
  private statusEl: HTMLDivElement | null = null;
  private readonly selectionService: DateComposerService;
  private readonly weekdaySet = new Set<number>();
  private monthCursor: Date;
  private resolver:
    | ((value: PatientCalendarBulkNotesModalResult | null) => void)
    | null = null;

  constructor(private readonly options: PatientCalendarBulkNotesModalOptions) {
    this.selectionService = new DateComposerService(
      options.initialDates || [],
      "fullYear"
    );

    const selectedDates = this.selectionService.getSelectedDates();
    this.monthCursor = selectedDates.length
      ? firstDayOfMonth(new Date(`${selectedDates[0]}T00:00:00Z`))
      : firstDayOfMonth(new Date());
  }

  static open(
    options: PatientCalendarBulkNotesModalOptions
  ): Promise<PatientCalendarBulkNotesModalResult | null> {
    const modal = new PatientCalendarBulkNotesModal(options);
    return modal.open();
  }

  open(): Promise<PatientCalendarBulkNotesModalResult | null> {
    return new Promise((resolve) => {
      this.resolver = resolve;
      this.render();
    });
  }

  private render(): void {
    this.destroy();

    const overlay = document.createElement("div");
    overlay.className = "template-modal-overlay pcbn-modal-overlay";

    const modal = document.createElement("div");
    modal.className = "template-modal pcbn-modal";
    modal.innerHTML = `
      <div class="template-modal-header">
        <h3 class="template-modal-title">快速添加 Patient Visit Notes</h3>
        <button class="template-modal-close" type="button" aria-label="关闭">&times;</button>
      </div>
      <div class="template-modal-body pcbn-modal-body">
        <section class="pcbn-fixed-note-card">
          <div class="pcbn-section-label">固定写入内容</div>
          <div class="pcbn-fixed-note-text">${this.escapeHtml(
            this.options.noteText
          )}</div>
          <div class="pcbn-fixed-note-hint">执行时会先检查同日同内容，命中后自动跳过，不会盲写。</div>
        </section>

        <section class="pcbn-filter-card">
          <div class="pcbn-filter-header">
            <div>
              <div class="pcbn-section-label">按区间 + 周几加入</div>
              <div class="pcbn-section-subtitle">适合整月固定周几场景，可跨月加入。</div>
            </div>
            <div class="pcbn-filter-actions">
              <button type="button" class="template-modal-btn btn-cancel pcbn-inline-btn" data-action="clear-selected">清空已选</button>
            </div>
          </div>

          <div class="pcbn-filter-grid">
            <label class="template-form-group pcbn-date-field">
              <span class="template-form-label">起始日期</span>
              <input class="template-form-input" type="date" data-role="range-start" />
            </label>
            <label class="template-form-group pcbn-date-field">
              <span class="template-form-label">结束日期</span>
              <input class="template-form-input" type="date" data-role="range-end" />
            </label>
          </div>

          <div class="pcbn-weekday-row" data-role="weekday-row"></div>

          <div class="pcbn-filter-bottom-row">
            <button type="button" class="template-modal-btn btn-save pcbn-inline-btn" data-action="add-range">按条件加入</button>
            <div class="pcbn-status pcbn-status--info" data-role="status">支持手动点选单日，也可先按条件批量加入再逐个取消。</div>
          </div>
        </section>

        <section class="pcbn-calendar-card">
          <div class="pcbn-calendar-toolbar">
            <div class="pcbn-section-label">手动点选日期</div>
            <div class="pcbn-calendar-nav">
              <button type="button" class="pcbn-nav-btn" data-action="prev-month">◀</button>
              <button type="button" class="pcbn-nav-btn" data-action="next-month">▶</button>
            </div>
          </div>
          <div class="pcbn-calendar-months"></div>
        </section>

        <section class="pcbn-selection-card">
          <div class="pcbn-selection-header">
            <div>
              <div class="pcbn-section-label">已选日期</div>
              <div class="pcbn-section-subtitle" data-role="selection-count">尚未选择日期</div>
            </div>
          </div>
          <div class="pcbn-selection-list" data-role="selection-list"></div>
        </section>
      </div>
      <div class="template-modal-footer pcbn-modal-footer">
        <button type="button" class="template-modal-btn btn-save pcbn-outlook-btn" data-action="open-outlook">Outlook</button>
        <div class="pcbn-footer-right-actions">
          <button type="button" class="template-modal-btn btn-cancel" data-action="cancel">取消</button>
          <button type="button" class="template-modal-btn btn-save" data-action="apply">开始批量添加</button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    this.overlayEl = overlay;
    this.monthContainerEl = modal.querySelector(
      ".pcbn-calendar-months"
    ) as HTMLDivElement | null;
    this.selectionCountEl = modal.querySelector(
      '[data-role="selection-count"]'
    ) as HTMLDivElement | null;
    this.selectionListEl = modal.querySelector(
      '[data-role="selection-list"]'
    ) as HTMLDivElement | null;
    this.applyButtonEl = modal.querySelector(
      '[data-action="apply"]'
    ) as HTMLButtonElement | null;
    this.statusEl = modal.querySelector(
      '[data-role="status"]'
    ) as HTMLDivElement | null;

    const weekdayRow = modal.querySelector('[data-role="weekday-row"]');
    WEEKDAY_OPTIONS.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pcbn-weekday-chip";
      button.dataset.weekday = String(option.value);
      button.textContent = option.label;
      button.addEventListener("click", () => {
        if (this.weekdaySet.has(option.value)) {
          this.weekdaySet.delete(option.value);
          button.classList.remove("active");
        } else {
          this.weekdaySet.add(option.value);
          button.classList.add("active");
        }
      });
      weekdayRow?.appendChild(button);
    });

    modal
      .querySelector(".template-modal-close")
      ?.addEventListener("click", () => this.finish(null));

    modal
      .querySelector('[data-action="cancel"]')
      ?.addEventListener("click", () => this.finish(null));

    modal
      .querySelector('[data-action="clear-selected"]')
      ?.addEventListener("click", () => {
        this.selectionService.clear();
        this.refreshSelectionView();
        this.renderMonths();
        this.setStatus("已清空所有已选日期", "info");
      });

    modal
      .querySelector('[data-action="add-range"]')
      ?.addEventListener("click", () => this.handleAddRange());

    modal
      .querySelector('[data-action="prev-month"]')
      ?.addEventListener("click", () => {
        this.monthCursor = addMonths(this.monthCursor, -1);
        this.renderMonths();
      });

    modal
      .querySelector('[data-action="next-month"]')
      ?.addEventListener("click", () => {
        this.monthCursor = addMonths(this.monthCursor, 1);
        this.renderMonths();
      });

    this.applyButtonEl?.addEventListener("click", () => {
      const dates = this.selectionService.getSelectedDates();
      if (dates.length === 0) {
        this.setStatus("请至少选择一个日期后再执行", "error");
        return;
      }
      this.finish({ dates });
    });

    modal
      .querySelector('[data-action="open-outlook"]')
      ?.addEventListener("click", () => {
        const dates = this.selectionService.getSelectedDates();
        if (dates.length === 0) {
          this.setStatus("请先选择至少一个日期后再打开 Outlook", "error");
          return;
        }

        if (this.options.onOutlookClick) {
          void this.options.onOutlookClick(dates);
        }
      });

    document.addEventListener("keydown", this.handleKeydown);

    this.renderMonths();
    this.refreshSelectionView();
  }

  private handleAddRange(): void {
    if (!this.overlayEl) {
      return;
    }

    const startInput = this.overlayEl.querySelector(
      '[data-role="range-start"]'
    ) as HTMLInputElement | null;
    const endInput = this.overlayEl.querySelector(
      '[data-role="range-end"]'
    ) as HTMLInputElement | null;

    const startDate = startInput?.value || "";
    const endDate = endInput?.value || "";

    if (!startDate || !endDate) {
      this.setStatus("请先选择起始日期和结束日期", "error");
      return;
    }

    if (this.weekdaySet.size === 0) {
      this.setStatus("请至少选择一个周几条件", "error");
      return;
    }

    const rangeDates = this.selectionService.getRangeDates(startDate, endDate);
    const matchedDates = rangeDates.filter((date) =>
      this.weekdaySet.has(getUtcWeekday(date))
    );

    if (matchedDates.length === 0) {
      this.setStatus("当前区间和周几组合没有匹配到任何日期", "error");
      return;
    }

    matchedDates.forEach((date) =>
      this.selectionService.setDateSelection(date, true)
    );

    this.refreshSelectionView();
    this.renderMonths();
    this.setStatus(`已加入 ${matchedDates.length} 个日期`, "success");
  }

  private renderMonths(): void {
    if (!this.monthContainerEl) {
      return;
    }

    this.monthContainerEl.innerHTML = "";
    this.monthContainerEl.appendChild(
      this.createMonthElement(this.monthCursor)
    );
    this.monthContainerEl.appendChild(
      this.createMonthElement(addMonths(this.monthCursor, 1))
    );
  }

  private createMonthElement(monthDate: Date): HTMLElement {
    const year = monthDate.getUTCFullYear();
    const monthIndex = monthDate.getUTCMonth();
    const daysInMonth = new Date(
      Date.UTC(year, monthIndex + 1, 0)
    ).getUTCDate();
    const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
    const selectedDates = new Set(this.selectionService.getSelectedDates());
    const today = new Date();
    const todayCanonical = `${today.getFullYear()}-${pad2(
      today.getMonth() + 1
    )}-${pad2(today.getDate())}`;

    const wrapper = document.createElement("div");
    wrapper.className = "pcbn-month";

    const title = document.createElement("div");
    title.className = "pcbn-month-title";
    title.textContent = `${year}年 ${monthIndex + 1}月`;
    wrapper.appendChild(title);

    const weekdayHeader = document.createElement("div");
    weekdayHeader.className = "pcbn-weekday-header";
    ["日", "一", "二", "三", "四", "五", "六"].forEach((label) => {
      const cell = document.createElement("div");
      cell.className = "pcbn-weekday-label";
      cell.textContent = label;
      weekdayHeader.appendChild(cell);
    });
    wrapper.appendChild(weekdayHeader);

    const grid = document.createElement("div");
    grid.className = "pcbn-day-grid";

    for (let i = 0; i < firstWeekday; i++) {
      const empty = document.createElement("div");
      empty.className = "pcbn-day-empty";
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const canonicalDate = toCanonical(year, monthIndex, day);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pcbn-day-btn";
      button.textContent = String(day);

      if (selectedDates.has(canonicalDate)) {
        button.classList.add("selected");
      }

      if (canonicalDate === todayCanonical) {
        button.classList.add("today");
      }

      button.addEventListener("click", () => {
        this.selectionService.toggleDate(canonicalDate);
        this.refreshSelectionView();
        this.renderMonths();
      });

      grid.appendChild(button);
    }

    const totalCells = firstWeekday + daysInMonth;
    for (let i = totalCells; i < 42; i++) {
      const empty = document.createElement("div");
      empty.className = "pcbn-day-empty";
      grid.appendChild(empty);
    }

    wrapper.appendChild(grid);
    return wrapper;
  }

  private refreshSelectionView(): void {
    const selectedDates = this.selectionService.getSelectedDates();

    if (this.selectionCountEl) {
      this.selectionCountEl.textContent =
        selectedDates.length === 0
          ? "尚未选择日期"
          : `已选 ${selectedDates.length} 个日期`;
    }

    if (this.applyButtonEl) {
      this.applyButtonEl.disabled = selectedDates.length === 0;
    }

    if (!this.selectionListEl) {
      return;
    }

    this.selectionListEl.innerHTML = "";
    if (selectedDates.length === 0) {
      const empty = document.createElement("div");
      empty.className = "pcbn-selection-empty";
      empty.textContent = "可直接点选日历，或先用区间 + 周几批量加入。";
      this.selectionListEl.appendChild(empty);
      return;
    }

    selectedDates.forEach((date) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "pcbn-selection-chip";
      chip.innerHTML = `<span>${this.escapeHtml(
        toDisplayDate(date)
      )}</span><span class="pcbn-selection-chip-close">×</span>`;
      chip.title = "点击移除此日期";
      chip.addEventListener("click", () => {
        this.selectionService.setDateSelection(date, false);
        this.refreshSelectionView();
        this.renderMonths();
      });
      this.selectionListEl?.appendChild(chip);
    });
  }

  private setStatus(message: string, tone: StatusTone): void {
    if (!this.statusEl) {
      return;
    }

    this.statusEl.textContent = message;
    this.statusEl.className = `pcbn-status pcbn-status--${tone}`;
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      this.finish(null);
    }
  };

  private finish(result: PatientCalendarBulkNotesModalResult | null): void {
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
    this.selectionCountEl = null;
    this.selectionListEl = null;
    this.applyButtonEl = null;
    this.statusEl = null;
    document.removeEventListener("keydown", this.handleKeydown);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
