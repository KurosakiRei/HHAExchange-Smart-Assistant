import { MailService } from "../MailService";
import { PageDetector, PageType } from "../PageDetector";
import { ProfileData, ProfileDataExtractor } from "../ProfileDataExtractor";
import {
  FIRST_DAY_INSURANCE_FALLBACK_OPTIONS,
  FirstDayInsuranceOption,
} from "./FirstDayInsuranceFallback";

const FIXED_TO = '"RNs Coordinators" <Nursing@AlwaysNY.net>';
const FIXED_CC =
  '"Reggie Thomas (Chief Operations Officer)" <rthomas@AlwaysNY.net>; "Ada Wu" <DWu@AlwaysNY.net>; "Tracy Vuong" <TVuong@AlwaysNY.net>; "Intake" <intake@AlwaysNY.net>';

interface PatientContext {
  patientName: string;
  patientId: string;
}

const FDS_STYLE_ID = "fds-template-styles";
const FDS_STYLES = `
<style id="${FDS_STYLE_ID}">
.first-day-entry-card {
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}
.first-day-entry-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(43, 66, 89, 0.12);
}
.fds-modal {
  max-width: 840px;
}
.fds-modal-body {
  padding: 16px 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  overscroll-behavior: contain;
  max-height: calc(90vh - 160px);
}
.fds-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 4px;
}
.fds-variable-section,
.fds-preview-section {
  border: 1px solid #d8dde6;
  border-radius: 8px;
  padding: 12px;
  background: #ffffff;
}
.fds-variable-section {
  background: linear-gradient(180deg, #fbfdff 0%, #f7fafe 100%);
}
.fds-variable-row,
.fds-preview-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.fds-variable-row:last-of-type,
.fds-preview-row:last-of-type {
  margin-bottom: 0;
}
.fds-variable-label,
.fds-preview-label {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  min-width: 104px;
  white-space: nowrap;
}
.fds-variable-input,
.fds-variable-select,
.fds-preview-input {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  padding: 7px 10px;
  border: 1px solid #ccd4e0;
  border-radius: 6px;
  font-size: 13px;
  color: #1f2937;
  background: #fff;
}
.fds-variable-input:focus,
.fds-variable-select:focus,
.fds-preview-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.12);
}
.fds-variable-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 34px;
  background-image: linear-gradient(45deg, transparent 50%, #5a6580 50%),
    linear-gradient(135deg, #5a6580 50%, transparent 50%);
  background-position: calc(100% - 16px) calc(50% - 2px),
    calc(100% - 10px) calc(50% - 2px);
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
}
.fds-help-text {
  margin-top: 2px;
  font-size: 12px;
  color: #6b7280;
}
.fds-editor-section {
  margin-top: 10px;
  border: 1px solid #d0d7e2;
  border-radius: 7px;
  overflow: hidden;
}
.fds-editor-toolbar {
  display: flex;
  gap: 2px;
  padding: 6px 8px;
  background: #f6f8fb;
  border-bottom: 1px solid #e5e9f1;
  flex-wrap: wrap;
}
.fds-editor-toolbar button {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.fds-editor-toolbar button:hover {
  background: #e9edf4;
  border-color: #d7deea;
}
.fds-rich-editor {
  min-height: 190px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.6;
  outline: none;
  background: #fff;
}
.fds-rich-editor:focus {
  background: #fcfdff;
}
.fds-modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #e0e4ea;
  background: #f8fafc;
}
.fds-outlook-btn {
  min-width: 116px;
}
.fds-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-60px);
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000007;
  opacity: 0;
  transition: transform 0.25s ease, opacity 0.25s ease;
  pointer-events: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
}
.fds-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.fds-toast.fds-toast--success {
  background: #2e7d32;
  color: #fff;
}
.fds-toast.fds-toast--warning {
  background: #9a3412;
  color: #fff;
}
</style>
`;

export class FirstDayOfServiceTemplate {
  private pageChangeHandler: ((pageType: PageType) => void) | null = null;

  renderEntryCard(container: HTMLElement): void {
    if (this.pageChangeHandler) {
      PageDetector.offPageChange(this.pageChangeHandler);
      this.pageChangeHandler = null;
    }

    const card = document.createElement("div");
    card.className = "template-card first-day-entry-card";

    const pageType = PageDetector.getCurrentPageType();
    this.updateCardState(card, pageType);

    card.addEventListener("click", () => {
      if (PageDetector.getCurrentPageType() === "PATIENT_PROFILE") {
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
    const isActive = pageType === "PATIENT_PROFILE";

    card.innerHTML = `
      <div class="template-card-header">
        <span class="template-name">First Day of Service</span>
        <div class="template-badges">
          <span class="template-builtin-badge">内置</span>
          <span class="template-target-badge">Patient页面</span>
        </div>
      </div>
      <div class="template-card-preview">
        <span class="template-subject">🩺 选择服务开始日期与保险后，一键生成并发送 Outlook 邮件</span>
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
      card.title = "请先导航到 Patient页面";
      card.style.cursor = "not-allowed";
    }
  }

  private openModal(): void {
    this.ensureStyles();

    document.getElementById("fds-modal-overlay")?.remove();

    const profileData = ProfileDataExtractor.extract();
    const patientContext = this.getPatientContext(profileData);

    const detectedInsurances = this.getDetectedInsuranceNames(profileData);
    const allInsuranceOptions = this.getAllInsuranceOptions();

    const autoOptions =
      detectedInsurances.length > 0
        ? detectedInsurances
        : ["[未检测到保险，请切换到手动选择]"];

    const overlay = document.createElement("div");
    overlay.className = "template-modal-overlay fds-modal-overlay";
    overlay.id = "fds-modal-overlay";

    overlay.innerHTML = `
      <div class="template-modal fds-modal">
        <div class="template-modal-header">
          <h3 class="template-modal-title">First Day of Service</h3>
          <button class="template-modal-close" id="fds-modal-close">&times;</button>
        </div>

        <div class="template-modal-body fds-modal-body">
          <section class="fds-variable-section">
            <div class="fds-section-title">变量设置</div>

            <div class="fds-variable-row">
              <label class="fds-variable-label" for="fds-service-date">服务开始日期:</label>
              <input type="date" class="fds-variable-input" id="fds-service-date">
            </div>

            <div class="fds-variable-row">
              <label class="fds-variable-label" for="fds-insurance-mode">保险来源:</label>
              <select class="fds-variable-select" id="fds-insurance-mode">
                <option value="auto">自动检测</option>
                <option value="manual">手动选择</option>
              </select>
            </div>

            <div class="fds-variable-row" id="fds-auto-wrap">
              <label class="fds-variable-label" for="fds-auto-insurance">检测保险:</label>
              <select class="fds-variable-select" id="fds-auto-insurance">
                ${autoOptions
                  .map(
                    (name) =>
                      `<option value="${this.escapeHtml(
                        name
                      )}">${this.escapeHtml(name)}</option>`
                  )
                  .join("")}
              </select>
            </div>

            <div class="fds-variable-row" id="fds-manual-wrap" style="display:none;">
              <label class="fds-variable-label" for="fds-manual-insurance">手动保险:</label>
              <select class="fds-variable-select" id="fds-manual-insurance">
                ${allInsuranceOptions
                  .map(
                    (opt) =>
                      `<option value="${this.escapeHtml(
                        opt.value
                      )}">${this.escapeHtml(opt.label)}</option>`
                  )
                  .join("")}
              </select>
            </div>

            <div class="fds-help-text">提示: 自动检测优先使用当前 Patient Profile 的保险数据。</div>
          </section>

          <section class="fds-preview-section">
            <div class="fds-section-title">邮件预览与编辑</div>

            <div class="fds-preview-row">
              <label class="fds-preview-label" for="fds-to">收件人(To):</label>
              <input type="text" id="fds-to" class="fds-preview-input" value="${this.escapeHtml(
                FIXED_TO
              )}">
            </div>

            <div class="fds-preview-row">
              <label class="fds-preview-label" for="fds-cc">抄送(CC):</label>
              <input type="text" id="fds-cc" class="fds-preview-input" value="${this.escapeHtml(
                FIXED_CC
              )}">
            </div>

            <div class="fds-preview-row">
              <label class="fds-preview-label" for="fds-subject">主题(Subject):</label>
              <input type="text" id="fds-subject" class="fds-preview-input">
            </div>

            <div class="fds-editor-section">
              <div class="fds-editor-toolbar" id="fds-toolbar">
                <button type="button" data-cmd="bold" title="粗体"><b>B</b></button>
                <button type="button" data-cmd="italic" title="斜体"><i>I</i></button>
                <button type="button" data-cmd="underline" title="下划线"><u>U</u></button>
                <button type="button" data-cmd="insertUnorderedList" title="无序列表">≡</button>
                <button type="button" data-cmd="insertOrderedList" title="有序列表">⒈</button>
                <button type="button" data-cmd="removeFormat" title="清除格式">✕</button>
              </div>
              <div class="fds-rich-editor" id="fds-body-editor" contenteditable="true"></div>
            </div>
          </section>
        </div>

        <div class="fds-modal-footer">
          <button class="template-modal-btn btn-save fds-outlook-btn" id="fds-outlook">Outlook</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    const closeModal = () => {
      overlay.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", escBlocker, true);
      document.getElementById("fds-close-confirm-overlay")?.remove();
    };

    const escBlocker = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener("keydown", escBlocker, true);

    const modeSelect = overlay.querySelector(
      "#fds-insurance-mode"
    ) as HTMLSelectElement;
    const autoWrap = overlay.querySelector("#fds-auto-wrap") as HTMLElement;
    const manualWrap = overlay.querySelector("#fds-manual-wrap") as HTMLElement;
    const autoInsuranceSelect = overlay.querySelector(
      "#fds-auto-insurance"
    ) as HTMLSelectElement;
    const manualInsuranceSelect = overlay.querySelector(
      "#fds-manual-insurance"
    ) as HTMLSelectElement;
    const dateInput = overlay.querySelector(
      "#fds-service-date"
    ) as HTMLInputElement;
    const subjectInput = overlay.querySelector(
      "#fds-subject"
    ) as HTMLInputElement;
    const bodyEditor = overlay.querySelector("#fds-body-editor") as HTMLElement;
    const toInput = overlay.querySelector("#fds-to") as HTMLInputElement;
    const ccInput = overlay.querySelector("#fds-cc") as HTMLInputElement;
    const toolbar = overlay.querySelector("#fds-toolbar") as HTMLElement;

    let bodyDirty = false;

    const hasAutoInsurance = detectedInsurances.length > 0;
    if (!hasAutoInsurance) {
      modeSelect.value = "manual";
      autoWrap.style.display = "none";
      manualWrap.style.display = "flex";
    }

    const getSelectedInsurance = (): string => {
      if (modeSelect.value === "manual") {
        const selected =
          manualInsuranceSelect.selectedOptions[0]?.textContent?.trim() || "";
        if (selected === "All" || selected === "Undefined") return "";
        return selected;
      }

      const selected =
        autoInsuranceSelect.selectedOptions[0]?.textContent?.trim() || "";
      if (selected.startsWith("[未检测到保险")) return "";
      return selected;
    };

    const selectManualInsuranceByLabel = (label: string) => {
      const target = Array.from(manualInsuranceSelect.options).find(
        (opt) => (opt.textContent || "").trim() === label
      );
      if (target) {
        manualInsuranceSelect.value = target.value;
      }
    };

    if (hasAutoInsurance) {
      selectManualInsuranceByLabel(detectedInsurances[0]);
    }

    const updateModeUI = () => {
      const manualMode = modeSelect.value === "manual";
      autoWrap.style.display = manualMode ? "none" : "flex";
      manualWrap.style.display = manualMode ? "flex" : "none";
    };

    const updatePreview = () => {
      const serviceDate = this.formatDate(dateInput.value);
      const insurance = getSelectedInsurance();

      subjectInput.value = this.buildSubject(
        patientContext,
        serviceDate || "[请选择日期]"
      );

      if (!bodyDirty) {
        bodyEditor.innerHTML = this.buildBodyHtml(
          insurance || "[请选择保险]",
          serviceDate || "[请选择日期]"
        );
      }
    };

    modeSelect.addEventListener("change", () => {
      if (modeSelect.value === "manual") {
        const autoSelected =
          autoInsuranceSelect.selectedOptions[0]?.textContent?.trim() || "";
        if (autoSelected && !autoSelected.startsWith("[未检测到保险")) {
          selectManualInsuranceByLabel(autoSelected);
        }
      }

      updateModeUI();
      updatePreview();
    });

    autoInsuranceSelect.addEventListener("change", updatePreview);
    manualInsuranceSelect.addEventListener("change", updatePreview);
    dateInput.addEventListener("change", updatePreview);
    dateInput.addEventListener("input", updatePreview);

    bodyEditor.addEventListener("input", () => {
      bodyDirty = true;
    });

    toolbar.addEventListener("mousedown", (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest("[data-cmd]") as HTMLElement | null;
      if (!button) return;
      event.preventDefault();
      const cmd = button.dataset.cmd;
      if (cmd) {
        document.execCommand(cmd, false);
      }
    });

    overlay.querySelector("#fds-modal-close")?.addEventListener("click", () => {
      this.showCloseConfirm(closeModal);
    });

    overlay.querySelector("#fds-outlook")?.addEventListener("click", () => {
      const insurance = getSelectedInsurance();
      const serviceDate = this.formatDate(dateInput.value);

      if (!serviceDate) {
        this.showToast("⚠️ 请先选择服务开始日期", "warning");
        return;
      }

      if (!insurance) {
        this.showToast("⚠️ 请先选择保险", "warning");
        return;
      }

      const normalizedTo = this.normalizeRecipients(toInput.value);
      if (!normalizedTo) {
        this.showToast("⚠️ 收件人不能为空", "warning");
        return;
      }

      const normalizedCc = this.normalizeRecipients(ccInput.value);

      MailService.sendMailTask({
        to: normalizedTo,
        ...(normalizedCc ? { cc: normalizedCc } : {}),
        subject: subjectInput.value.trim(),
        body: bodyEditor.innerHTML,
      });

      this.showToast("✅ 已发送到 Outlook", "success");
      closeModal();
    });

    updatePreview();
  }

  private getPatientContext(profileData: ProfileData | null): PatientContext {
    const patientName =
      profileData?.type === "PATIENT" && profileData.name
        ? this.sanitizePatientLabel(profileData.name)
        : "[无法获取患者姓名]";

    const patientId =
      profileData?.type === "PATIENT" && profileData.id
        ? this.sanitizePatientLabel(profileData.id)
        : "[无法获取患者ID]";

    return {
      patientName: patientName || "[无法获取患者姓名]",
      patientId: patientId || "[无法获取患者ID]",
    };
  }

  private getDetectedInsuranceNames(profileData: ProfileData | null): string[] {
    if (!profileData || profileData.type !== "PATIENT") return [];

    const source = [...(profileData.insurances || [])];
    if (profileData.insurance) source.push(profileData.insurance);

    const unique = new Set<string>();
    source.forEach((name) => {
      const normalized = name.trim();
      if (normalized) unique.add(normalized);
    });

    return Array.from(unique);
  }

  private getAllInsuranceOptions(): FirstDayInsuranceOption[] {
    const fromPage = this.readInsuranceOptionsFromPage();
    if (fromPage.length > 0) {
      return fromPage;
    }
    return [...FIRST_DAY_INSURANCE_FALLBACK_OPTIONS];
  }

  private readInsuranceOptionsFromPage(): FirstDayInsuranceOption[] {
    const documents = this.collectAccessibleDocuments();
    const merged: FirstDayInsuranceOption[] = [];

    documents.forEach((doc) => {
      const select = doc.querySelector(
        "#ctl00_ContentPlaceHolder1_uxDdlSource"
      ) as HTMLSelectElement | null;
      if (!select) return;

      const options = Array.from(select.options)
        .map((opt) => ({
          value: opt.value?.trim() || "",
          label: (opt.textContent || "").trim(),
        }))
        .filter((opt) => opt.value && opt.label);

      merged.push(...options);
    });

    if (merged.length === 0) return [];

    const deduped = new Map<string, FirstDayInsuranceOption>();
    merged.forEach((opt) => {
      if (!deduped.has(opt.value)) {
        deduped.set(opt.value, opt);
      }
    });

    return Array.from(deduped.values());
  }

  private collectAccessibleDocuments(): Document[] {
    const docs = new Set<Document>();

    const walk = (doc: Document) => {
      if (docs.has(doc)) return;
      docs.add(doc);

      const frames = Array.from(doc.querySelectorAll("iframe"));
      frames.forEach((frame) => {
        try {
          if (frame.contentDocument) {
            walk(frame.contentDocument);
          }
        } catch (_) {
          // Cross-origin frame, skip.
        }
      });
    };

    walk(document);
    return Array.from(docs);
  }

  private buildSubject(context: PatientContext, serviceDate: string): string {
    return `PT: ${context.patientName} ${context.patientId} - First Day of Service - ${serviceDate}`;
  }

  private buildBodyHtml(insurance: string, serviceDate: string): string {
    return `Hello,<br><br>The first day of PCA service under ${this.escapeHtml(
      insurance
    )} for the patient will be ${this.escapeHtml(serviceDate)}.`;
  }

  private normalizeRecipients(raw: string): string {
    return raw
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .join(",");
  }

  private formatDate(inputValue: string): string {
    if (!inputValue) return "";
    const [year, month, day] = inputValue.split("-");
    if (!year || !month || !day) return "";
    return `${month}/${day}/${year}`;
  }

  private sanitizePatientLabel(value: string): string {
    return value
      .replace(/\s*\*+\s*Inactive\s*$/i, "")
      .replace(/\s*\*+\s*Discharged\s*$/i, "")
      .replace(/\s*\(Discharged\)\s*$/i, "")
      .trim();
  }

  private showCloseConfirm(onConfirmClose: () => void): void {
    document.getElementById("fds-close-confirm-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "timesheet-confirm-overlay";
    overlay.id = "fds-close-confirm-overlay";

    overlay.innerHTML = `
      <div class="timesheet-confirm-box">
        <p>⚠️ 你已有输入内容尚未发送，关闭将清空所有输入。</p>
        <p>确认关闭吗？</p>
        <div class="timesheet-confirm-actions">
          <button class="template-modal-btn btn-cancel" id="fds-close-cancel">取消</button>
          <button class="template-modal-btn btn-save" id="fds-close-confirm">确认关闭</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay
      .querySelector("#fds-close-cancel")
      ?.addEventListener("click", () => {
        overlay.remove();
      });
    overlay
      .querySelector("#fds-close-confirm")
      ?.addEventListener("click", () => {
        overlay.remove();
        onConfirmClose();
      });
  }

  private showToast(message: string, type: "success" | "warning"): void {
    document.querySelectorAll(".fds-toast").forEach((node) => node.remove());

    const toast = document.createElement("div");
    toast.className = `fds-toast fds-toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 280);
    }, 1800);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private ensureStyles(): void {
    if (!document.getElementById(FDS_STYLE_ID)) {
      document.head.insertAdjacentHTML("beforeend", FDS_STYLES);
    }
  }
}
