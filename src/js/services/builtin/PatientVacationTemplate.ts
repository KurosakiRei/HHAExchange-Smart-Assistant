/**
 * PatientVacationTemplate
 * Epic 16, Story 2: Patient Vacation 通知内置模板
 *
 * 职责：
 * - 渲染入口卡片（含 PATIENT_PROFILE 页面检测与置灰逻辑）
 * - 管理 Loading 蒙版生命周期（含 3 分钟超时）
 * - 并行调用所有 API，收集失败字段
 * - 管理 Modal 生命周期（富文本编辑器、Split Button、配置区 dirty 追踪）
 * - 读写配置（GM_getValue / GM_setValue）
 * - 构建邮件内容并调用 MailService.sendMailTask()
 */

import GM_fetch from "@trim21/gm-fetch";
import { PageDetector, PageType } from "../PageDetector";
import { MailService } from "../MailService";
import { ApiParamProvider } from "../ApiParamProvider";
import {
  PatientCalendarApiProvider,
  CalendarApiParams,
} from "../PatientCalendarApiProvider";

declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue(key: string, value: string): void;

// ─── Types ───────────────────────────────────────────────────────────────────

const GM_KEY = "hha_builtin_patient_vacation_config";
const LOADING_TIMEOUT_MS = 180_000; // 3 minutes

interface PVConfig {
  to: string;
  cc: string;
}

const DEFAULT_CONFIG: PVConfig = {
  to: "Authorizations@AlwaysNY.net,billingahc@AlwaysNY.net",
  cc: "rthomas@AlwaysNY.net,TVuong@AlwaysNY.net,Nursing@AlwaysNY.net,intake@AlwaysNY.net",
};

interface VacationData {
  patientName: string;
  admissionId: string;
  patientId: string;
  vacationStart: string; // MM/DD/YYYY
  vacationEnd: string; // MM/DD/YYYY
  lastServiceDate: string; // MM/DD/YYYY or "[无法获取]"
  resumptionDate: string; // MM/DD/YYYY or "[无法获取]"
  failedFields: string[];
  toastWarnings: string[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

interface VacationInfoRecord {
  PatientID: string;
  StartDate: string;
  EndDate: string;
  CalenderStartDate: string;
  CalenderEndDate: string;
}

interface VisitInfoRecord {
  VisitDate: string; // MM/DD/YYYY
  ScheduledTime?: string;
}

// ─── Main Class ──────────────────────────────────────────────────────────────

export class PatientVacationTemplate {
  private pageChangeHandler: ((pageType: PageType) => void) | null = null;
  private loadingEl: HTMLElement | null = null;
  private loadingTimeout: ReturnType<typeof setTimeout> | null = null;

  // ─── Config ────────────────────────────────────────────────────────────────

  private loadConfig(): PVConfig {
    try {
      const stored = GM_getValue<string>(GM_KEY, "");
      if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    } catch (_) {
      // ignore
    }
    return { ...DEFAULT_CONFIG };
  }

  private saveConfig(config: PVConfig): void {
    GM_setValue(GM_KEY, JSON.stringify(config));
  }

  // ─── Entry Card ────────────────────────────────────────────────────────────

  renderEntryCard(container: HTMLElement): void {
    if (this.pageChangeHandler) {
      PageDetector.offPageChange(this.pageChangeHandler);
      this.pageChangeHandler = null;
    }

    const card = document.createElement("div");
    card.className = "template-card pv-entry-card";

    const pageType = PageDetector.getCurrentPageType();
    this.updateCardState(card, pageType);

    card.addEventListener("click", () => {
      if (PageDetector.getCurrentPageType() === "PATIENT_PROFILE") {
        this.startFlow();
      }
    });

    container.appendChild(card);

    this.pageChangeHandler = (pt: PageType) => {
      this.updateCardState(card, pt);
    };
    PageDetector.onPageChange(this.pageChangeHandler);
  }

  private updateCardState(card: HTMLElement, pageType: PageType): void {
    const isActive = pageType === "PATIENT_PROFILE";
    card.innerHTML = `
      <div class="template-card-header">
        <span class="template-name">Patient Vacation</span>
        <div class="template-badges">
          <span class="template-builtin-badge">内置</span>
          <span class="template-target-badge">Patient页面</span>
        </div>
      </div>
      <div class="template-card-preview">
        <span class="template-subject">🏖️ 自动分析 Calendar 并生成 Patient Vacation 通知邮件</span>
      </div>
    `;

    if (isActive) {
      card.style.opacity = "";
      card.style.pointerEvents = "";
      card.title = "";
      card.style.cursor = "pointer";
    } else {
      card.style.opacity = "0.5";
      card.style.pointerEvents = "none";
      card.title = "请先导航到 Patient Profile 页面";
      card.style.cursor = "not-allowed";
    }
  }

  // ─── Flow: Loading → Data → Modal ─────────────────────────────────────────

  private async startFlow(): Promise<void> {
    this.showLoading();

    let data: VacationData;
    let timedOut = false;

    // Set up 3-minute timeout
    const timeoutPromise = new Promise<"timeout">((resolve) => {
      this.loadingTimeout = setTimeout(() => {
        timedOut = true;
        resolve("timeout");
      }, LOADING_TIMEOUT_MS);
    });

    const dataPromise = this.fetchAllData();

    const result = await Promise.race([dataPromise, timeoutPromise]);

    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }

    if (result === "timeout") {
      // Build partial data with placeholders
      data = await dataPromise.catch(() => this.buildPlaceholderData());
      data.toastWarnings.push(
        "⚠️ 数据获取超时（3分钟），部分字段可能需要手动填写"
      );
    } else {
      data = result;
    }

    this.hideLoading();
    this.openModal(data);
  }

  // ─── DOM Data Extraction ───────────────────────────────────────────────────

  private extractPatientName(): string {
    // From h1 on Patient Profile page, strip trailing status words
    const h1 = document.querySelector("h1");
    if (!h1) return "[无法获取]";
    let text = h1.textContent?.trim() ?? "";
    // Remove trailing status words like "Active", "Inactive", "Discharged"
    text = text
      .replace(/\s*(Active|Inactive|Discharged|Pending)\s*$/i, "")
      .trim();
    return text || "[无法获取]";
  }

  private extractAdmissionId(): string {
    // Look for StaticText "Admission ID" followed by value in overview area
    const labels = document.querySelectorAll("span, td, label");
    for (const el of Array.from(labels)) {
      if (el.textContent?.trim() === "Admission ID") {
        const next =
          el.nextElementSibling ||
          el.parentElement?.nextElementSibling?.querySelector("span, td");
        if (next) {
          const val = next.textContent?.trim();
          if (val) return val;
        }
      }
    }
    // Fallback: look for pattern like "AHC-" or numeric admission ID in page
    const match = document.body.innerText.match(/\b(AHC-\d+|\d{6,})\b/);
    return match ? match[1] : "[无法获取]";
  }

  private extractPatientId(): string {
    const params = new URLSearchParams(window.location.search);
    return params.get("PatientId") || params.get("PatientID") || "[无法获取]";
  }

  // ─── API Calls ─────────────────────────────────────────────────────────────

  private async fetchAllData(): Promise<VacationData> {
    const patientId = this.extractPatientId();
    const patientName = this.extractPatientName();
    const admissionId = this.extractAdmissionId();

    const failedFields: string[] = [];
    const toastWarnings: string[] = [];

    let apiParams: CalendarApiParams | null = null;
    try {
      apiParams = await PatientCalendarApiProvider.getParams(
        patientId === "[无法获取]" ? "" : patientId
      );
    } catch (e) {
      console.error("[PVTemplate] Failed to get Calendar API params:", e);
    }

    // Vacation Start/End
    let vacationStart = "[无法获取]";
    let vacationEnd = "[无法获取]";

    if (apiParams) {
      try {
        const vacList = await this.getVacationInfo(apiParams);
        if (vacList.length === 0) {
          toastWarnings.push(
            "⚠️ 未找到 vacation 记录，请先在 Vacation Tab 添加"
          );
          failedFields.push("Vacation 日期");
        } else {
          const rec = vacList[0];
          vacationStart = this.formatDate(
            rec.StartDate || rec.CalenderStartDate
          );
          vacationEnd = this.formatDate(rec.EndDate || rec.CalenderEndDate);

          // Check if expired
          const endDateObj = this.parseDate(vacationEnd);
          if (endDateObj && endDateObj < new Date()) {
            toastWarnings.push(
              `⚠️ 检测到的 vacation 记录已过期（${vacationEnd}），请检查日期是否正确`
            );
          }
        }
      } catch (e) {
        console.error("[PVTemplate] Failed to get vacation info:", e);
        failedFields.push("Vacation 日期");
        toastWarnings.push("⚠️ 无法获取 Vacation 日期，请手动填写");
      }
    } else {
      failedFields.push("Vacation 日期");
    }

    // Last Day of Service
    let lastServiceDate = "[无法获取]";
    if (apiParams && vacationStart !== "[无法获取]") {
      try {
        lastServiceDate = await this.calcLastServiceDate(
          apiParams,
          vacationStart
        );
      } catch (e) {
        console.error("[PVTemplate] Failed to calc last service date:", e);
        failedFields.push("最后服务日");
      }
    } else if (vacationStart !== "[无法获取]") {
      failedFields.push("最后服务日");
    }

    // Resumption Date
    let resumptionDate = "[无法获取]";
    if (apiParams && vacationEnd !== "[无法获取]") {
      try {
        resumptionDate = await this.calcResumptionDate(apiParams, vacationEnd);
      } catch (e) {
        console.error("[PVTemplate] Failed to calc resumption date:", e);
        failedFields.push("Resumption 日期");
      }
    } else if (vacationEnd !== "[无法获取]") {
      failedFields.push("Resumption 日期");
    }

    // Merge toast warnings for multiple failed fields
    if (lastServiceDate === "[无法获取]" && resumptionDate === "[无法获取]") {
      if (
        !failedFields.some((f) => f === "最后服务日") &&
        !failedFields.some((f) => f === "Resumption 日期")
      ) {
        // already added individually
      }
    }

    return {
      patientName,
      admissionId,
      patientId,
      vacationStart,
      vacationEnd,
      lastServiceDate,
      resumptionDate,
      failedFields,
      toastWarnings,
    };
  }

  private buildPlaceholderData(): VacationData {
    return {
      patientName: this.extractPatientName(),
      admissionId: this.extractAdmissionId(),
      patientId: this.extractPatientId(),
      vacationStart: "[无法获取]",
      vacationEnd: "[无法获取]",
      lastServiceDate: "[无法获取]",
      resumptionDate: "[无法获取]",
      failedFields: ["Vacation 日期", "最后服务日", "Resumption 日期"],
      toastWarnings: [],
    };
  }

  private async getVacationInfo(
    params: CalendarApiParams
  ): Promise<VacationInfoRecord[]> {
    const now = new Date();
    const body = {
      appName: params.appName,
      appSecret: params.appSecret,
      userID: params.userID,
      patientID: params.patientID,
      calendarMonth: String(now.getMonth() + 1),
      calendarYear: String(now.getFullYear()),
      appVersion: params.appVersion,
      version: params.version,
      minorVersion: params.minorVersion,
      callerInfo: params.callerInfo,
    };

    const baseUrl = ApiParamProvider.getTenantBaseUrl().replace(
      /https:\/\/app\.hhaexchange\.com/,
      "https://app.hhaexchange.com"
    );
    const url = `https://app.hhaexchange.com${params.hhwsPath}Calender.asmx/GetCalendarVacationInfo`;

    const r = (await GM_fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })) as Response & { rawBody: Blob };

    const text = await r.rawBody.text();
    const outer = JSON.parse(text) as { d: string };
    const inner = JSON.parse(outer.d) as {
      PatientVacationInfo: VacationInfoRecord[];
    };
    return inner.PatientVacationInfo || [];
  }

  private async getVisitInfo(
    params: CalendarApiParams,
    month: number,
    year: number
  ): Promise<VisitInfoRecord[]> {
    const url = `https://app.hhaexchange.com${params.hhwsPath}Calender.asmx/GetCalendarVisitInfo`;
    const body = {
      appName: params.appName,
      appSecret: params.appSecret,
      userID: params.userID,
      patientID: params.patientID,
      calendarMonth: String(month),
      calendarYear: String(year),
      appVersion: params.appVersion,
      version: params.version,
      minorVersion: params.minorVersion,
      callerInfo: params.callerInfo,
    };

    const r = (await GM_fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })) as Response & { rawBody: Blob };

    const text = await r.rawBody.text();
    const outer = JSON.parse(text) as { d: string };
    const inner = JSON.parse(outer.d) as { VisitInfo: VisitInfoRecord[] };
    return inner.VisitInfo || [];
  }

  // ─── Last Service Date ─────────────────────────────────────────────────────

  private async calcLastServiceDate(
    params: CalendarApiParams,
    vacationStart: string
  ): Promise<string> {
    const startDate = this.parseDate(vacationStart);
    if (!startDate) return "[无法获取]";

    const m = startDate.getMonth() + 1;
    const y = startDate.getFullYear();

    let visits = await this.getVisitInfo(params, m, y);
    let before = visits
      .filter((v) => {
        const d = this.parseDate(v.VisitDate);
        return d && d < startDate;
      })
      .sort((a, b) => {
        const da = this.parseDate(a.VisitDate)!;
        const db = this.parseDate(b.VisitDate)!;
        return db.getTime() - da.getTime();
      });

    if (before.length > 0) return before[0].VisitDate;

    // Fallback: previous month
    const prevM = m === 1 ? 12 : m - 1;
    const prevY = m === 1 ? y - 1 : y;
    visits = await this.getVisitInfo(params, prevM, prevY);

    const sorted = visits.sort((a, b) => {
      const da = this.parseDate(a.VisitDate)!;
      const db = this.parseDate(b.VisitDate)!;
      return db.getTime() - da.getTime();
    });

    return sorted.length > 0 ? sorted[0].VisitDate : "[无法获取]";
  }

  // ─── Resumption Date ───────────────────────────────────────────────────────

  private async calcResumptionDate(
    params: CalendarApiParams,
    vacationEnd: string
  ): Promise<string> {
    const endDate = this.parseDate(vacationEnd);
    if (!endDate) return "[无法获取]";

    // Strategy 1: Direct VisitInfo lookup
    const m = endDate.getMonth() + 1;
    const y = endDate.getFullYear();
    const visits = await this.getVisitInfo(params, m, y);

    const after = visits
      .filter((v) => {
        const d = this.parseDate(v.VisitDate);
        return d && d > endDate;
      })
      .sort((a, b) => {
        const da = this.parseDate(a.VisitDate)!;
        const db = this.parseDate(b.VisitDate)!;
        return da.getTime() - db.getTime();
      });

    if (after.length > 0) return after[0].VisitDate;

    // Strategy 2: Master Week fallback
    return this.calcResumptionFromMasterWeek(params.patientID, endDate);
  }

  private async calcResumptionFromMasterWeek(
    patientId: string,
    vacationEndDate: Date
  ): Promise<string> {
    const baseUrl = ApiParamProvider.getTenantBaseUrl();
    const url = `${baseUrl}/Patient/InternalPatientMasterWeekIFrame_ns.aspx?PatientID=${encodeURIComponent(
      patientId
    )}`;

    const r = (await GM_fetch(url, { method: "GET" })) as Response & {
      rawBody: Blob;
    };
    const html = await r.rawBody.text();

    // Parse Master Week table: find service days (day-of-week with non-empty Hours)
    // Format in innerText: "Days:\nSat\tSun\t...\nHours:\t0800-1200\t..."
    const serviceDays = this.parseMasterWeekServiceDays(html);
    if (serviceDays.size === 0) return "[无法获取]";

    // Start from vacationEnd + 1 day
    const candidate = new Date(vacationEndDate);
    candidate.setDate(candidate.getDate() + 1);

    // Search up to 14 days
    for (let i = 0; i < 14; i++) {
      const dow = candidate.getDay(); // 0=Sun, 6=Sat
      if (serviceDays.has(dow)) {
        return this.formatDateFromObj(candidate);
      }
      candidate.setDate(candidate.getDate() + 1);
    }

    return "[无法获取]";
  }

  private parseMasterWeekServiceDays(html: string): Set<number> {
    const serviceDays = new Set<number>();
    const dayNameToDoW: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    try {
      const doc = new DOMParser().parseFromString(html, "text/html");

      for (const table of Array.from(doc.querySelectorAll("table"))) {
        const rows = Array.from(table.querySelectorAll("tr"));
        if (rows.length < 2) continue;

        // Map column index → day-of-week from header row
        const colToDow = new Map<number, number>();
        Array.from(rows[0].querySelectorAll("td,th")).forEach((cell, idx) => {
          const txt = (cell.textContent ?? "").trim().toLowerCase();
          if (txt in dayNameToDoW) colToDow.set(idx, dayNameToDoW[txt]);
        });
        if (colToDow.size === 0) continue;

        // Find the "Hours" row and check which day columns have a value
        for (const row of rows) {
          const cells = Array.from(row.querySelectorAll("td,th"));
          if (!cells[0]?.textContent?.toLowerCase().includes("hours")) continue;

          cells.forEach((cell, idx) => {
            const dow = colToDow.get(idx);
            if (dow !== undefined && (cell.textContent ?? "").trim()) {
              serviceDays.add(dow);
            }
          });
          break;
        }

        if (serviceDays.size > 0) break;
      }
    } catch (e) {
      console.error("[PVTemplate] parseMasterWeekServiceDays error:", e);
    }

    return serviceDays;
  }

  // ─── Date Utilities ────────────────────────────────────────────────────────

  /** Parse MM/DD/YYYY or M/D/YYYY → Date */
  private parseDate(str: string): Date | null {
    if (!str || str === "[无法获取]") return null;
    const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return null;
    return new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2]));
  }

  /** Format Date object → MM/DD/YYYY */
  private formatDateFromObj(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  /** Format date string to MM/DD/YYYY (pass-through if already in that format) */
  private formatDate(str: string): string {
    if (!str) return "[无法获取]";
    // Try ISO: YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[2]}/${isoMatch[3]}/${isoMatch[1]}`;
    }
    // Already MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str;
    return str;
  }

  // ─── Loading Overlay ───────────────────────────────────────────────────────

  private showLoading(): void {
    this.hideLoading();
    const el = document.createElement("div");
    el.className = "pv-loading-overlay";
    el.id = "pv-loading-overlay";
    el.innerHTML = `
      <div class="pv-loading-inner">
        <div class="pv-spinner"></div>
        <span class="pv-loading-text">正在读取 Patient Vacation 数据...</span>
      </div>
    `;
    document.body.appendChild(el);
    this.loadingEl = el;
  }

  private hideLoading(): void {
    if (this.loadingEl) {
      this.loadingEl.remove();
      this.loadingEl = null;
    }
    document.getElementById("pv-loading-overlay")?.remove();
  }

  // ─── Modal ─────────────────────────────────────────────────────────────────

  private openModal(data: VacationData): void {
    document.getElementById("pv-modal-overlay")?.remove();

    const config = this.loadConfig();

    const subjectPreFill =
      data.vacationStart !== "[无法获取]" && data.vacationEnd !== "[无法获取]"
        ? `PT: ${data.patientName} ${data.admissionId} Vacation ${data.vacationStart} - ${data.vacationEnd}`
        : `PT: ${data.patientName} ${data.admissionId} Vacation`;

    const bodyPreFill = this.buildBodyHtml(data);

    const overlay = document.createElement("div");
    overlay.className = "template-modal-overlay pv-modal-overlay";
    overlay.id = "pv-modal-overlay";

    overlay.innerHTML = `
      <div class="template-modal pv-modal">
        <div class="template-modal-header">
          <h3 class="template-modal-title">Patient Vacation 通知</h3>
          <button class="template-modal-close" id="pv-modal-close">&times;</button>
        </div>
        <div class="template-modal-body pv-modal-body">

          <!-- Config Section -->
          <div class="pv-config-section">
            <div class="pv-config-row">
              <label class="pv-config-label">To:</label>
              <input type="text" class="pv-config-input" id="pv-to"
                value="${this.escapeHtml(
                  config.to
                )}" placeholder="收件人地址，逗号或分号分隔">
            </div>
            <div class="pv-config-row">
              <label class="pv-config-label">CC:</label>
              <input type="text" class="pv-config-input" id="pv-cc"
                value="${this.escapeHtml(
                  config.cc
                )}" placeholder="抄送地址，逗号或分号分隔">
            </div>
          </div>

          <!-- Subject -->
          <div class="pv-subject-row">
            <label class="pv-config-label">Subject:</label>
            <input type="text" class="pv-subject-input" id="pv-subject"
              value="${this.escapeHtml(subjectPreFill)}">
          </div>

          <!-- Rich Text Editor -->
          <div class="pv-editor-section">
            <div class="pv-editor-toolbar" id="pv-toolbar">
              <button type="button" data-cmd="bold" title="粗体"><b>B</b></button>
              <button type="button" data-cmd="italic" title="斜体"><i>I</i></button>
              <button type="button" data-cmd="underline" title="下划线"><u>U</u></button>
              <button type="button" data-cmd="strikeThrough" title="删除线"><s>S</s></button>
              <button type="button" data-cmd="insertUnorderedList" title="无序列表">≡</button>
              <button type="button" data-cmd="insertOrderedList" title="有序列表">⒈</button>
              <button type="button" id="pv-link-btn" title="插入链接">🔗</button>
              <button type="button" data-cmd="removeFormat" title="清除格式">✕</button>
            </div>
            <div class="pv-rich-editor" id="pv-body-editor" contenteditable="true">${bodyPreFill}</div>
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="pv-modal-footer">
          <button class="template-modal-btn btn-save pv-save-config-btn" id="pv-save-config" disabled>保存配置</button>
          <div class="pv-split-btn" id="pv-copy-split">
            <button class="template-modal-btn btn-save pv-copy-main" id="pv-copy-body">复制正文</button>
            <button class="template-modal-btn btn-save pv-copy-chevron" id="pv-copy-chevron">▾</button>
            <div class="pv-split-dropdown" id="pv-split-dropdown" style="display:none;">
              <button id="pv-copy-subject">复制 Subject</button>
            </div>
          </div>
          <button class="template-modal-btn btn-save pv-outlook-btn" id="pv-outlook">▶ Outlook</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    this.setupModalHandlers(overlay, config, data);

    // Show toasts after modal opens
    this.showConsolidatedToasts(data);
  }

  private buildBodyHtml(data: VacationData): string {
    return `Hello,<br><br>The patient will be on vacation from ${this.escapeHtml(
      data.vacationStart
    )} to ${this.escapeHtml(
      data.vacationEnd
    )}. The last day of service will be ${this.escapeHtml(
      data.lastServiceDate
    )} and the resumption of service will be ${this.escapeHtml(
      data.resumptionDate
    )}.`;
  }

  private setupModalHandlers(
    overlay: HTMLElement,
    initialConfig: PVConfig,
    data: VacationData
  ): void {
    const toInput = overlay.querySelector("#pv-to") as HTMLInputElement;
    const ccInput = overlay.querySelector("#pv-cc") as HTMLInputElement;
    const saveBtn = overlay.querySelector(
      "#pv-save-config"
    ) as HTMLButtonElement;
    const subjectInput = overlay.querySelector(
      "#pv-subject"
    ) as HTMLInputElement;
    const bodyEditor = overlay.querySelector("#pv-body-editor") as HTMLElement;
    const toolbar = overlay.querySelector("#pv-toolbar") as HTMLElement;

    let currentSaved: PVConfig = { ...initialConfig };

    // ── Config dirty tracking ────────────────────────────────────────────
    const checkDirty = (): boolean =>
      toInput.value !== currentSaved.to || ccInput.value !== currentSaved.cc;

    const updateSaveBtn = () => {
      saveBtn.disabled = !checkDirty();
    };

    toInput.addEventListener("input", updateSaveBtn);
    ccInput.addEventListener("input", updateSaveBtn);

    saveBtn.addEventListener("click", () => {
      const newConfig: PVConfig = {
        to: toInput.value.trim(),
        cc: ccInput.value.trim(),
      };
      this.saveConfig(newConfig);
      currentSaved = { ...newConfig };
      saveBtn.disabled = true;
      this.showToast("✅ 配置已保存", "success");
    });

    // ── Toolbar ──────────────────────────────────────────────────────────
    toolbar.addEventListener("mousedown", (e) => {
      const btn = (e.target as HTMLElement).closest(
        "[data-cmd]"
      ) as HTMLElement | null;
      if (btn) {
        e.preventDefault();
        document.execCommand(btn.dataset.cmd!, false);
      }
    });

    const linkBtn = overlay.querySelector("#pv-link-btn");
    linkBtn?.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const url = prompt("输入链接 URL：");
      if (url) document.execCommand("createLink", false, url);
    });

    // ── Copy Split Button ─────────────────────────────────────────────────
    const dropdown = overlay.querySelector("#pv-split-dropdown") as HTMLElement;

    overlay.querySelector("#pv-copy-body")?.addEventListener("click", () => {
      const html = bodyEditor.innerHTML;
      this.copyHtml(html);
      this.showToast("✅ 已复制", "success");
    });

    overlay
      .querySelector("#pv-copy-chevron")
      ?.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.style.display =
          dropdown.style.display === "none" ? "block" : "none";
      });

    overlay.querySelector("#pv-copy-subject")?.addEventListener("click", () => {
      navigator.clipboard?.writeText(subjectInput.value).catch(() => {
        const ta = document.createElement("textarea");
        ta.value = subjectInput.value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      });
      dropdown.style.display = "none";
      this.showToast("✅ 已复制", "success");
    });

    // Close dropdown when clicking elsewhere
    document.addEventListener(
      "click",
      () => {
        dropdown.style.display = "none";
      },
      { once: false }
    );

    // ── Outlook Button ─────────────────────────────────────────────────────
    overlay.querySelector("#pv-outlook")?.addEventListener("click", () => {
      if (checkDirty()) {
        this.showUnsavedConfirm(() => {
          this.doSendOutlook(subjectInput, bodyEditor, currentSaved);
          this.closeModal(overlay);
        });
      } else {
        this.doSendOutlook(subjectInput, bodyEditor, currentSaved);
        this.closeModal(overlay);
      }
    });

    // ── Close handlers ──────────────────────────────────────────────────
    overlay.querySelector("#pv-modal-close")?.addEventListener("click", () => {
      this.closeModal(overlay);
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.closeModal(overlay);
    });
  }

  private copyHtml(html: string): void {
    // Use Clipboard API with text/html support
    const blob = new Blob([html], { type: "text/html" });
    const plainBlob = new Blob([this.htmlToText(html)], { type: "text/plain" });
    const item = new ClipboardItem({
      "text/html": blob,
      "text/plain": plainBlob,
    });
    navigator.clipboard?.write([item]).catch(() => {
      // Fallback: execCommand
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-99999px";
      document.body.appendChild(tempDiv);
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(tempDiv);
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand("copy");
      sel?.removeAllRanges();
      tempDiv.remove();
    });
  }

  private htmlToText(html: string): string {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.innerText || div.textContent || "";
  }

  private doSendOutlook(
    subjectInput: HTMLInputElement,
    bodyEditor: HTMLElement,
    config: PVConfig
  ): void {
    const normalize = (raw: string): string =>
      raw
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(",");

    MailService.sendMailTask({
      to: normalize(config.to),
      ...(config.cc.trim() ? { cc: normalize(config.cc) } : {}),
      subject: subjectInput.value,
      body: bodyEditor.innerHTML,
    });
  }

  private showUnsavedConfirm(onConfirm: () => void): void {
    document.getElementById("pv-unsaved-confirm")?.remove();

    const box = document.createElement("div");
    box.id = "pv-unsaved-confirm";
    box.className = "timesheet-confirm-overlay";
    box.innerHTML = `
      <div class="timesheet-confirm-box">
        <p>⚠️ <strong>检测到未保存的配置修改</strong></p>
        <p>将使用上一次保存的设置发送邮件。</p>
        <div class="timesheet-confirm-actions">
          <button id="pv-confirm-send" class="template-modal-btn btn-save">继续发送</button>
          <button id="pv-confirm-cancel" class="template-modal-btn btn-cancel">取消</button>
        </div>
      </div>
    `;
    document.body.appendChild(box);

    box.querySelector("#pv-confirm-send")?.addEventListener("click", () => {
      box.remove();
      onConfirm();
    });
    box.querySelector("#pv-confirm-cancel")?.addEventListener("click", () => {
      box.remove();
    });
  }

  private closeModal(overlay: HTMLElement): void {
    overlay.remove();
    document.body.style.overflow = "";
    document.getElementById("pv-unsaved-confirm")?.remove();
  }

  // ─── Toast ─────────────────────────────────────────────────────────────────

  private showConsolidatedToasts(data: VacationData): void {
    // Collect failed-field toasts
    const fieldWarnings: string[] = [];

    if (data.lastServiceDate === "[无法获取]") {
      fieldWarnings.push("最后服务日");
    }
    if (data.resumptionDate === "[无法获取]") {
      fieldWarnings.push("Resumption 日期");
    }

    // Show each explicit warning first
    data.toastWarnings.forEach((msg) => {
      setTimeout(() => this.showToast(msg, "warning"), 100);
    });

    // Consolidate multiple failed fields
    if (fieldWarnings.length >= 2) {
      setTimeout(
        () =>
          this.showToast(
            `⚠️ 以下字段无法自动获取，请手动填写：${fieldWarnings.join("、")}`,
            "warning"
          ),
        200
      );
    } else if (fieldWarnings.length === 1) {
      if (
        fieldWarnings[0] === "最后服务日" &&
        !data.toastWarnings.some((w) => w.includes("最后服务日"))
      ) {
        setTimeout(
          () => this.showToast("⚠️ 无法推算最后服务日，请手动填写", "warning"),
          200
        );
      } else if (
        fieldWarnings[0] === "Resumption 日期" &&
        !data.toastWarnings.some((w) => w.includes("Resumption"))
      ) {
        setTimeout(
          () =>
            this.showToast(
              "⚠️ 无法推算 Resumption 日期，请手动填写",
              "warning"
            ),
          200
        );
      }
    }
  }

  private showToast(message: string, type: "success" | "warning"): void {
    // Singleton: remove existing .pv-toast
    document.querySelector(".pv-toast")?.remove();

    const toast = document.createElement("div");
    toast.className = `pv-toast pv-toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add("show");
      });
    });

    const duration = Math.max(3000, message.length * 60);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ─── Utilities ─────────────────────────────────────────────────────────────

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // ─── Destroy ───────────────────────────────────────────────────────────────

  destroy(): void {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }

    if (this.pageChangeHandler) {
      PageDetector.offPageChange(this.pageChangeHandler);
      this.pageChangeHandler = null;
    }

    this.hideLoading();
    document.getElementById("pv-modal-overlay")?.remove();
    document.getElementById("pv-unsaved-confirm")?.remove();
    document.querySelector(".pv-toast")?.remove();

    document.body.style.overflow = "";
  }
}
