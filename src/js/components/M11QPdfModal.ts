import { ProfileData } from "../services/ProfileDataExtractor";
import {
  M11QConfigService,
  M11QFaxConfig,
  M11QFaxMode,
} from "../services/M11QConfigService";
import {
  buildFilename,
  download,
  generate,
  normalizeDob,
} from "../services/M11QPdfGenerator";

interface M11QPdfModalOptions {
  profileData: ProfileData;
  onClose?: () => void;
  onDownloaded?: (filename: string) => void;
}

export class M11QPdfModal {
  private overlay: HTMLElement | null = null;
  private escHandler: ((event: KeyboardEvent) => void) | null = null;
  private wheelHandler: ((event: WheelEvent) => void) | null = null;

  constructor(private readonly options: M11QPdfModalOptions) {}

  open(): void {
    const config = M11QConfigService.load();
    const faxOptions = M11QConfigService.getBuiltinFaxOptions();
    const sourceValue =
      config.mode === "custom" ? "__custom__" : config.builtinId;

    this.overlay = document.createElement("div");
    this.overlay.className = "template-modal-overlay m11q-modal-overlay";
    this.overlay.innerHTML = `
      <div class="template-modal m11q-modal" role="dialog" aria-modal="true" aria-label="创建 M11Q PDF">
        <div class="template-modal-header">
          <span class="template-modal-title">创建 M11Q PDF</span>
          <button class="template-modal-close" id="m11q-close-btn" title="关闭">×</button>
        </div>
        <div class="template-modal-body m11q-modal-body">
          <div class="m11q-info-grid">
            <span class="m11q-info-label">Patient Name</span>
            <span class="m11q-info-value">${this.escape(
              this.options.profileData.name || "—"
            )}</span>
            <span class="m11q-info-label">DOB</span>
            <span class="m11q-info-value">${this.escape(
              normalizeDob(this.options.profileData.dob || "") || "—"
            )}</span>
            <span class="m11q-info-label">Admission ID</span>
            <span class="m11q-info-value">${this.escape(
              this.options.profileData.id || "—"
            )}</span>
          </div>

          <div class="m11q-form-section">
            <label class="m11q-form-label" for="m11q-fax-source">Fax Number</label>
            <select class="template-form-select m11q-fax-select" id="m11q-fax-source">
              ${faxOptions
                .map(
                  (item) =>
                    `<option value="${this.escape(item.id)}" ${
                      sourceValue === item.id ? "selected" : ""
                    }>${this.escape(
                      M11QConfigService.formatOptionLabel(item)
                    )}</option>`
                )
                .join("")}
              <option value="__custom__" ${
                sourceValue === "__custom__" ? "selected" : ""
              }>自定义传真号</option>
            </select>

            <div class="m11q-custom-wrap ${
              sourceValue === "__custom__" ? "" : "hidden"
            }" id="m11q-custom-wrap">
              <label class="m11q-form-label" for="m11q-custom-fax">自定义 Fax</label>
              <input
                class="template-form-input m11q-custom-input"
                id="m11q-custom-fax"
                type="text"
                placeholder="请输入传真号"
                value="${this.escape(config.customFax || "")}" />
            </div>

            <label class="m11q-remember-label">
              <input type="checkbox" id="m11q-remember" ${
                config.remember ? "checked" : ""
              } />
              记住下次默认选择
            </label>
          </div>
        </div>

        <div class="m11q-modal-footer">
          <button class="template-modal-btn btn-cancel" id="m11q-cancel-btn">取消</button>
          <button class="template-modal-btn btn-save" id="m11q-download-btn">下载 PDF</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    this.overlay
      .querySelector("#m11q-close-btn")
      ?.addEventListener("click", () => this.close());
    this.overlay
      .querySelector("#m11q-cancel-btn")
      ?.addEventListener("click", () => this.close());
    this.overlay
      .querySelector("#m11q-download-btn")
      ?.addEventListener("click", () => this.handleDownload());

    const sourceSelect =
      this.overlay.querySelector<HTMLSelectElement>("#m11q-fax-source");
    const customWrap =
      this.overlay.querySelector<HTMLElement>("#m11q-custom-wrap");
    const customInput =
      this.overlay.querySelector<HTMLInputElement>("#m11q-custom-fax");

    const syncCustomVisibility = () => {
      const isCustom = sourceSelect?.value === "__custom__";
      customWrap?.classList.toggle("hidden", !isCustom);
      if (isCustom) {
        customInput?.focus();
      }
    };

    sourceSelect?.addEventListener("change", syncCustomVisibility);
    syncCustomVisibility();

    this.escHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        this.close();
      }
    };
    document.addEventListener("keydown", this.escHandler);

    this.wheelHandler = (event: WheelEvent) => {
      const modalBody = this.overlay?.querySelector(".m11q-modal-body");
      if (!modalBody || !modalBody.contains(event.target as Node)) {
        event.preventDefault();
      }
    };

    this.overlay.addEventListener("wheel", this.wheelHandler, {
      passive: false,
    });
  }

  private async handleDownload(): Promise<void> {
    if (!this.overlay) {
      return;
    }

    const profileData = this.options.profileData;
    const patientName = (profileData.name || "").trim();
    const admissionId = (profileData.id || "").trim();
    const dob = (profileData.dob || "").trim();

    const missing: string[] = [];
    if (!patientName) missing.push("Patient Name");
    if (!admissionId) missing.push("Admission ID");
    if (!dob) missing.push("DOB");

    if (missing.length > 0) {
      this.showToast(`缺少必要信息：${missing.join("、")}`, "warning");
      return;
    }

    const normalizedDob = normalizeDob(dob);
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(normalizedDob)) {
      this.showToast(
        "DOB 格式无法识别，请确认病人生日为 MM/DD/YYYY",
        "warning"
      );
      return;
    }

    const sourceSelect =
      this.overlay.querySelector<HTMLSelectElement>("#m11q-fax-source");
    const customInput =
      this.overlay.querySelector<HTMLInputElement>("#m11q-custom-fax");
    const rememberCheckbox =
      this.overlay.querySelector<HTMLInputElement>("#m11q-remember");
    const downloadBtn =
      this.overlay.querySelector<HTMLButtonElement>("#m11q-download-btn");

    const selectedValue = sourceSelect?.value || "";
    const remember = rememberCheckbox?.checked ?? true;

    let mode: M11QFaxMode = "builtin";
    let builtinId = selectedValue;
    let customFax = "";
    let faxNumber = "";

    if (selectedValue === "__custom__") {
      mode = "custom";
      builtinId = "8av";
      customFax = (customInput?.value || "").trim();
      faxNumber = customFax;
      if (!faxNumber) {
        this.showToast("请输入自定义传真号", "warning");
        customInput?.focus();
        return;
      }
    } else {
      const builtin = M11QConfigService.getBuiltinById(selectedValue);
      if (!builtin) {
        this.showToast("请选择有效的内置传真号", "warning");
        return;
      }
      faxNumber = builtin.fax;
      builtinId = builtin.id;
    }

    const configToSave: M11QFaxConfig = {
      mode,
      builtinId,
      customFax,
      remember,
    };

    if (downloadBtn) {
      downloadBtn.disabled = true;
      downloadBtn.textContent = "生成中...";
    }

    try {
      const blob = await generate({
        patientName,
        dob: normalizedDob,
        faxNumber,
      });
      const filename = buildFilename(patientName, admissionId);
      download(blob, filename);
      M11QConfigService.save(configToSave);
      this.options.onDownloaded?.(filename);
      this.close();
    } catch (error) {
      console.error("[M11QPdfModal] Failed to generate M11Q PDF:", error);
      this.showToast("生成 PDF 失败，请重试", "error");
      if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.textContent = "下载 PDF";
      }
    }
  }

  private showToast(
    message: string,
    type: "success" | "warning" | "error"
  ): void {
    const host = this.overlay || document.body;
    const existing = host.querySelector(".m11q-modal-toast");
    if (existing) {
      existing.remove();
    }

    const toast = document.createElement("div");
    toast.className = `m11q-modal-toast m11q-modal-toast--${type}`;
    toast.textContent = message;
    host.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2400);
  }

  close(): void {
    this.destroy();
  }

  destroy(): void {
    if (this.escHandler) {
      document.removeEventListener("keydown", this.escHandler);
      this.escHandler = null;
    }

    if (this.wheelHandler && this.overlay) {
      this.overlay.removeEventListener("wheel", this.wheelHandler);
      this.wheelHandler = null;
    }

    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    this.options.onClose?.();
  }

  private escape(value: string): string {
    return (value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
