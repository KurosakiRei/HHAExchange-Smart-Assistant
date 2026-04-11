/**
 * TimesheetNotificationTemplate
 * Epic 16, Story 1: Timesheet 提交通知内置模板
 *
 * 职责：
 * - 渲染入口卡片（含页面检测与置灰逻辑）
 * - 管理 Modal 生命周期（创建、打开、关闭）
 * - 管理轮询（Modal 开启时 start，关闭时 stop）
 * - 读写配置（GM_getValue / GM_setValue）
 * - 构建邮件内容并调用 MailService.sendMailTask()
 */

import { PageDetector, PageType } from "../PageDetector";
import {
  PrebillingTableParser,
  TimesheetRecord,
} from "../PrebillingTableParser";
import { MailService } from "../MailService";

declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue(key: string, value: string): void;

const GM_KEY = "hha_builtin_timesheet_config";

interface TimesheetConfig {
  recipientName: string;
  to: string;
  cc: string;
}

const DEFAULT_CONFIG: TimesheetConfig = {
  recipientName: "Mariana",
  to: "Mzlotar@AlwaysNY.net",
  cc: "",
};

export class TimesheetNotificationTemplate {
  private pageChangeHandler: ((pageType: PageType) => void) | null = null;
  private modalOpen: boolean = false;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private static readonly POLLING_INTERVAL = 5000;

  // ─── Config ──────────────────────────────────────────────────────────────

  private loadConfig(): TimesheetConfig {
    try {
      const stored = GM_getValue<string>(GM_KEY, "");
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (_) {
      // ignore parse errors
    }
    return { ...DEFAULT_CONFIG };
  }

  private saveConfig(config: TimesheetConfig): void {
    GM_setValue(GM_KEY, JSON.stringify(config));
  }

  // ─── Entry Card ──────────────────────────────────────────────────────────

  /**
   * 渲染入口卡片到 container。
   * 多次调用时会先注销旧的页面变化监听器，保证不重复注册。
   */
  renderEntryCard(container: HTMLElement): void {
    if (this.pageChangeHandler) {
      PageDetector.offPageChange(this.pageChangeHandler);
      this.pageChangeHandler = null;
    }

    const card = document.createElement("div");
    card.className = "template-card timesheet-entry-card";

    const pageType = PageDetector.getCurrentPageType();
    this.updateCardState(card, pageType);

    card.addEventListener("click", () => {
      if (PageDetector.getCurrentPageType() === "PREBILLING") {
        this.openModal();
      }
    });

    container.appendChild(card);

    this.pageChangeHandler = (pt: PageType) => {
      this.updateCardState(card, pt);
    };
    PageDetector.onPageChange(this.pageChangeHandler);
  }

  private updateCardState(card: HTMLElement, pageType: PageType): void {
    const isActive = pageType === "PREBILLING";
    card.innerHTML = `
      <div class="template-card-header">
        <span class="template-name">Timesheet 提交</span>
        <div class="template-badges">
          <span class="template-builtin-badge">内置</span>
          <span class="template-target-badge">Prebilling页面</span>
        </div>
      </div>
      <div class="template-card-preview">
        <span class="template-subject">📋 从 Prebilling 列表选择并一键发送 Timesheet 通知</span>
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
      card.title = "请先导航到 Prebilling Review 页面";
      card.style.cursor = "not-allowed";
    }
  }

  // ─── Modal ───────────────────────────────────────────────────────────────

  private openModal(): void {
    if (this.modalOpen) return;
    this.modalOpen = true;

    const savedConfig = this.loadConfig();

    const overlay = document.createElement("div");
    overlay.className = "template-modal-overlay timesheet-modal-overlay";
    overlay.id = "timesheet-modal-overlay";

    overlay.innerHTML = `
      <div class="template-modal timesheet-modal">
        <div class="template-modal-header">
          <h3 class="template-modal-title">Timesheet 提交</h3>
          <button class="template-modal-close" id="timesheet-modal-close">&times;</button>
        </div>
        <div class="template-modal-body timesheet-modal-body">
          <div class="timesheet-config-section">
            <div class="timesheet-config-row">
              <div class="timesheet-config-col-left">
                <span class="timesheet-config-label">收件人:</span>
                <input type="text" class="timesheet-config-input" id="ts-recipient-name"
                  value="${this.escapeHtml(savedConfig.recipientName)}"
                  placeholder="Enter Name">
              </div>
              <div class="timesheet-config-col-mid">
                <div class="timesheet-config-inline">
                  <label class="timesheet-config-label ts-short-label">To:</label>
                  <input type="text" class="timesheet-config-input" id="ts-to"
                    value="${this.escapeHtml(savedConfig.to)}"
                    placeholder="Enter Address">
                </div>
                <div class="timesheet-config-inline">
                  <label class="timesheet-config-label ts-short-label">CC:</label>
                  <input type="text" class="timesheet-config-input" id="ts-cc"
                    value="${this.escapeHtml(savedConfig.cc)}"
                    placeholder="Enter CC Address">
                </div>
              </div>
              <button class="template-modal-btn btn-save ts-save-btn"
                id="ts-save-config" disabled>保存配置</button>
            </div>
          </div>
          <div class="timesheet-list-section">
            <div class="timesheet-list-header">
              <span class="timesheet-list-title">Visits</span>
              <input type="text" class="timesheet-search-input" id="ts-search"
                placeholder="🔍 Patient Name 或 Admission ID">
            </div>
            <div class="timesheet-visit-list" id="ts-visit-list">
              <div class="timesheet-loading">加载中...</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    // ── Config dirty tracking ────────────────────────────────────────────
    const recipientInput = overlay.querySelector(
      "#ts-recipient-name"
    ) as HTMLInputElement;
    const toInput = overlay.querySelector("#ts-to") as HTMLInputElement;
    const ccInput = overlay.querySelector("#ts-cc") as HTMLInputElement;
    const saveBtn = overlay.querySelector(
      "#ts-save-config"
    ) as HTMLButtonElement;

    let currentSaved: TimesheetConfig = { ...savedConfig };

    const checkDirty = (): boolean =>
      recipientInput.value !== currentSaved.recipientName ||
      toInput.value !== currentSaved.to ||
      ccInput.value !== currentSaved.cc;

    const updateSaveBtn = () => {
      saveBtn.disabled = !checkDirty();
    };

    recipientInput.addEventListener("input", updateSaveBtn);
    toInput.addEventListener("input", updateSaveBtn);
    ccInput.addEventListener("input", updateSaveBtn);

    saveBtn.addEventListener("click", () => {
      const newConfig: TimesheetConfig = {
        recipientName: recipientInput.value.trim(),
        to: toInput.value.trim(),
        cc: ccInput.value.trim(),
      };
      this.saveConfig(newConfig);
      currentSaved = { ...newConfig };
      saveBtn.disabled = true;
    });

    // ── Close handlers ───────────────────────────────────────────────────
    overlay
      .querySelector("#timesheet-modal-close")
      ?.addEventListener("click", () => {
        const saveBtn =
          overlay.querySelector<HTMLButtonElement>("#ts-save-config");
        if (
          saveBtn &&
          !saveBtn.disabled &&
          !window.confirm("有未保存的配置修改，确认丢弃并关闭吗？")
        )
          return;
        this.closeModal(overlay);
      });

    // ── Search ───────────────────────────────────────────────────────────
    let currentSearchTerm = "";
    let currentRecords: TimesheetRecord[] = [];

    const searchInput = overlay.querySelector("#ts-search") as HTMLInputElement;
    searchInput.addEventListener("input", () => {
      currentSearchTerm = searchInput.value;
      this.renderVisitList(
        overlay.querySelector("#ts-visit-list") as HTMLElement,
        currentRecords,
        currentSearchTerm,
        checkDirty,
        () => currentSaved,
        overlay
      );
    });

    // ── Initial load + polling ───────────────────────────────────────────
    const refreshList = async () => {
      const listEl = overlay.querySelector(
        "#ts-visit-list"
      ) as HTMLElement | null;
      if (!listEl) return;

      if (PageDetector.getCurrentPageType() !== "PREBILLING") {
        listEl.innerHTML = `<div class="timesheet-no-data">⚠️ 请先导航到 Prebilling Review 页面</div>`;
        return;
      }

      try {
        currentRecords = await PrebillingTableParser.parseAllRows();
        this.renderVisitList(
          listEl,
          currentRecords,
          currentSearchTerm,
          checkDirty,
          () => currentSaved,
          overlay
        );
      } catch (_) {
        if (listEl.isConnected) {
          listEl.innerHTML = `<div class="timesheet-no-data">⚠️ 无法加载列表</div>`;
        }
      }
    };

    refreshList();
    this.startPolling(refreshList);
  }

  // ─── Visit List Renderer ─────────────────────────────────────────────────

  private renderVisitList(
    listEl: HTMLElement,
    records: TimesheetRecord[],
    searchTerm: string,
    isDirty: () => boolean,
    getSavedConfig: () => TimesheetConfig,
    overlay: HTMLElement
  ): void {
    const lower = searchTerm.toLowerCase();
    const filtered = searchTerm
      ? records.filter(
          (r) =>
            r.patientName.toLowerCase().includes(lower) ||
            r.admissionId.toLowerCase().includes(lower)
        )
      : records;

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="timesheet-no-data">${
        records.length === 0 ? "暂无访问记录" : "无匹配结果"
      }</div>`;
      return;
    }

    listEl.innerHTML = "";
    filtered.forEach((record) => {
      const card = document.createElement("div");
      card.className = "timesheet-visit-card";
      const initial = record.patientName.trim().charAt(0).toUpperCase() || "?";
      card.innerHTML = `
        <div class="timesheet-avatar">${this.escapeHtml(initial)}</div>
        <div class="timesheet-visit-info">
          <span class="timesheet-patient">${this.escapeHtml(
            record.patientName
          )} | ${this.escapeHtml(record.admissionId)}</span>
          <span class="timesheet-details">
            <span class="timesheet-date">📅 ${this.escapeHtml(
              record.visitDate
            )}</span>
            <span class="timesheet-time">🕐 ${this.escapeHtml(
              record.scheduledTime
            )}</span>
          </span>
        </div>
        <button class="template-modal-btn btn-save timesheet-send-btn">▶ Outlook</button>
      `;

      const sendBtn = card.querySelector(
        ".timesheet-send-btn"
      ) as HTMLButtonElement;
      sendBtn.addEventListener("click", () => {
        this.handleSend(record, isDirty, getSavedConfig, overlay);
      });

      listEl.appendChild(card);
    });
  }

  // ─── Send ────────────────────────────────────────────────────────────────

  private handleSend(
    record: TimesheetRecord,
    isDirty: () => boolean,
    getSavedConfig: () => TimesheetConfig,
    overlay: HTMLElement
  ): void {
    if (isDirty()) {
      document.getElementById("ts-unsaved-confirm")?.remove();

      const confirmBox = document.createElement("div");
      confirmBox.id = "ts-unsaved-confirm";
      confirmBox.className = "timesheet-confirm-overlay";
      confirmBox.innerHTML = `
        <div class="timesheet-confirm-box">
          <p>⚠️ <strong>检测到未保存的配置修改</strong></p>
          <p>将使用上一次保存的设置发送邮件。</p>
          <div class="timesheet-confirm-actions">
            <button id="ts-confirm-send" class="template-modal-btn btn-save">继续发送</button>
            <button id="ts-confirm-cancel" class="template-modal-btn btn-cancel">取消</button>
          </div>
        </div>
      `;
      document.body.appendChild(confirmBox);

      confirmBox
        .querySelector("#ts-confirm-send")
        ?.addEventListener("click", () => {
          confirmBox.remove();
          this.doSend(record, getSavedConfig(), overlay);
        });

      confirmBox
        .querySelector("#ts-confirm-cancel")
        ?.addEventListener("click", () => {
          confirmBox.remove();
        });
    } else {
      this.doSend(record, getSavedConfig(), overlay);
    }
  }

  private doSend(
    record: TimesheetRecord,
    config: TimesheetConfig,
    overlay: HTMLElement
  ): void {
    const normalizeAddresses = (raw: string): string =>
      raw
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(",");

    const toAddresses = normalizeAddresses(config.to);
    const ccAddresses = normalizeAddresses(config.cc);

    MailService.sendMailTask({
      to: toAddresses,
      ...(ccAddresses ? { cc: ccAddresses } : {}),
      subject: `PT: ${record.patientName} ${record.admissionId} Timesheet for ${record.visitDate}`,
      body: `Hello ${config.recipientName},<br><br>Please see the attached. Let me know if there is any problem.`,
    });

    this.closeModal(overlay);
  }

  // ─── Modal Lifecycle ─────────────────────────────────────────────────────

  private closeModal(overlay: HTMLElement): void {
    this.stopPolling();
    this.modalOpen = false;
    overlay.remove();
    document.body.style.overflow = "";
    document.getElementById("ts-unsaved-confirm")?.remove();
  }

  // ─── Polling ─────────────────────────────────────────────────────────────

  private startPolling(callback: () => void): void {
    this.stopPolling();
    this.pollingTimer = setInterval(
      callback,
      TimesheetNotificationTemplate.POLLING_INTERVAL
    );
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  // ─── Utilities ───────────────────────────────────────────────────────────

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // ─── Destroy ─────────────────────────────────────────────────────────────

  destroy(): void {
    this.stopPolling();

    if (this.pageChangeHandler) {
      PageDetector.offPageChange(this.pageChangeHandler);
      this.pageChangeHandler = null;
    }

    const overlay = document.getElementById("timesheet-modal-overlay");
    if (overlay) {
      overlay.remove();
      document.body.style.overflow = "";
      this.modalOpen = false;
    }

    document.getElementById("ts-unsaved-confirm")?.remove();
  }
}
