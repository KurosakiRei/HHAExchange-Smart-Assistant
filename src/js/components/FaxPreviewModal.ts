/**
 * FaxPreviewModal Component
 * Epic 17, Story 17-6: 传真模板预览 & 下载弹窗
 */
import { ProfileData } from "../services/ProfileDataExtractor";
import { InsuranceRecord } from "../utils/InsuranceMatcher";
import {
  generate,
  download,
  buildFilename,
} from "../services/FaxTemplateGenerator";

export interface FaxPreviewModalOptions {
  profileData: ProfileData;
  insuranceName: string;
  insuranceRecord: InsuranceRecord | null;
  onClose?: () => void;
}

const CONFIG_KEY = "hha_fax_template_config";

interface FaxConfig {
  from_line: string;
  signature_block: string;
}

export class FaxPreviewModal {
  private overlay: HTMLElement | null = null;
  private options: FaxPreviewModalOptions;
  private escHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(options: FaxPreviewModalOptions) {
    this.options = options;
  }

  open(): void {
    const config = this.loadConfig();
    const { profileData, insuranceName, insuranceRecord } = this.options;

    const faxNumber = insuranceRecord?.fax || "—";
    const phoneNumber = insuranceRecord?.phone || "—";
    const patientName = profileData.name || "";
    const patientDob = profileData.dob || "";
    const today = new Date();
    const date = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
      today.getDate()
    ).padStart(2, "0")}/${today.getFullYear()}`;

    // Create overlay — reuse template-modal-* classes for consistent UI style
    this.overlay = document.createElement("div");
    this.overlay.className = "template-modal-overlay fax-modal-overlay";
    this.overlay.innerHTML = `
      <div class="template-modal fax-modal" role="dialog" aria-modal="true" aria-label="创建传真模板">
        <div class="template-modal-header">
          <span class="template-modal-title">创建传真模板</span>
          <button class="template-modal-close fax-modal-close" title="关闭">×</button>
        </div>
        <div class="template-modal-body fax-modal-body">
          <div class="fax-info-grid">
            <span class="fax-ig-label">收件方</span><span class="fax-ig-value">${this.esc(
              insuranceName
            )}</span>
            <span class="fax-ig-label">日期</span><span class="fax-ig-value">${this.esc(
              date
            )}</span>
            <span class="fax-ig-label">传真号</span><span class="fax-ig-value">${this.esc(
              faxNumber
            )}</span>
            <span class="fax-ig-label">电话</span><span class="fax-ig-value">${this.esc(
              phoneNumber
            )}</span>
            <span class="fax-ig-label">病人</span><span class="fax-ig-value">${this.esc(
              patientName
            )}</span>
            <span class="fax-ig-label">DOB</span><span class="fax-ig-value">${this.esc(
              patientDob
            )}</span>
          </div>
          <div class="fax-form-section">
            <div class="fax-field-row">
              <label class="fax-field-label" for="fax-pages">页数</label>
              <input id="fax-pages" class="template-form-input fax-pages-input" type="number" min="1" step="1" value="1" />
            </div>
            <div class="fax-field-row">
              <label class="fax-field-label" for="fax-command">简述</label>
              <input id="fax-command" class="template-form-input" type="text" placeholder="例：请更新患者电话" />
            </div>
            <div class="fax-field-row">
              <label class="fax-field-label" for="fax-body">正文</label>
              <textarea id="fax-body" class="template-form-input fax-field-textarea" placeholder="正文内容..."></textarea>
            </div>
          </div>
          <div class="fax-config-section">
            <div class="fax-config-title">── 发件人配置 ──</div>
            <div class="fax-field-row">
              <label class="fax-field-label" for="fax-from">来自：</label>
              <input id="fax-from" class="template-form-input" type="text" placeholder="例：Tao Yang Ext. 503" value="${this.esc(
                config.from_line
              )}" />
            </div>
            <div class="fax-field-row">
              <label class="fax-field-label" for="fax-sig">签名区</label>
              <textarea id="fax-sig" class="template-form-input fax-field-textarea fax-sig-textarea" placeholder="多行签名内容...">${this.esc(
                config.signature_block
              )}</textarea>
            </div>
            <div class="fax-config-actions">
              <button class="template-modal-btn btn-cancel" id="fax-save-config">保存配置</button>
            </div>
          </div>
        </div>
        <div class="fax-modal-footer">
          <button class="template-modal-btn btn-cancel" id="fax-cancel">取消</button>
          <button class="template-modal-btn btn-save" id="fax-download">下载 .docx</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    // Event bindings
    this.overlay
      .querySelector(".fax-modal-close")!
      .addEventListener("click", () => this.close());
    this.overlay
      .querySelector("#fax-cancel")!
      .addEventListener("click", () => this.close());
    this.overlay
      .querySelector("#fax-save-config")!
      .addEventListener("click", () => this.saveConfig());
    this.overlay
      .querySelector("#fax-download")!
      .addEventListener("click", () => this.handleDownload(date));

    // Esc closes modal
    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") this.close();
    };
    document.addEventListener("keydown", this.escHandler);
  }

  private handleDownload(date: string): void {
    if (!this.overlay) return;
    const { profileData, insuranceName, insuranceRecord } = this.options;
    const pagesInput =
      this.overlay.querySelector<HTMLInputElement>("#fax-pages")!;
    const pagesVal = pagesInput.valueAsNumber;
    const pages =
      Number.isFinite(pagesVal) && pagesVal >= 1
        ? String(Math.floor(pagesVal))
        : "1";

    const params = {
      insurance_name: insuranceName,
      insurance_fax: insuranceRecord?.fax || "",
      insurance_phone: insuranceRecord?.phone || "",
      date,
      patient_name: profileData.name || "",
      patient_dob: profileData.dob || "",
      pages,
      command:
        this.overlay.querySelector<HTMLInputElement>("#fax-command")!.value,
      body: this.overlay.querySelector<HTMLTextAreaElement>("#fax-body")!.value,
      from_line:
        this.overlay.querySelector<HTMLInputElement>("#fax-from")!.value,
      signature_block:
        this.overlay.querySelector<HTMLTextAreaElement>("#fax-sig")!.value,
    };

    const blob = generate(params);
    const filename = buildFilename(
      profileData.name,
      profileData.id,
      insuranceName
    );
    download(blob, filename);
  }

  private saveConfig(): void {
    if (!this.overlay) return;
    const from_line =
      this.overlay.querySelector<HTMLInputElement>("#fax-from")!.value;
    const signature_block =
      this.overlay.querySelector<HTMLTextAreaElement>("#fax-sig")!.value;
    GM_setValue(CONFIG_KEY, { from_line, signature_block });
  }

  private loadConfig(): FaxConfig {
    const saved = GM_getValue<FaxConfig | null>(CONFIG_KEY, null);
    return saved || { from_line: "", signature_block: "" };
  }

  close(): void {
    if (this.overlay) {
      const command = (
        this.overlay.querySelector<HTMLInputElement>("#fax-command")?.value ||
        ""
      ).trim();
      const body = (
        this.overlay.querySelector<HTMLTextAreaElement>("#fax-body")?.value ||
        ""
      ).trim();
      if (command !== "" || body !== "") {
        if (
          !window.confirm(
            "填写的内容尚未下载，关闭窗口将丢失内容，确认关闭吗？"
          )
        )
          return;
      }
    }
    this.destroy();
  }

  destroy(): void {
    if (this.escHandler) {
      document.removeEventListener("keydown", this.escHandler);
      this.escHandler = null;
    }
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.options.onClose?.();
  }

  private esc(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
