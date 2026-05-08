import { BaseTab } from "./BaseTab";
import { DateComposerModal } from "../components/DateComposerModal";
import {
  DATE_FORMAT_PRESET_OPTIONS,
  DateComposerService,
  DateFormatPreset,
  isDateFormatPreset,
} from "../services/DateComposerService";
import { CSPBypassInjector } from "../services/CSPBypassInjector";

const DATE_INPUT_TAB_STYLE_ID = "hha-date-input-tab-style";

interface DateInputTabOptions {
  presetStorageKey: string;
  showOutlookHint?: boolean;
}

function isOutlookHost(): boolean {
  const host = window.location.hostname.toLowerCase();
  return (
    host === "outlook.office.com" ||
    host === "outlook.cloud.microsoft" ||
    host === "webshell.suite.office.com"
  );
}

function ensureStyles(): void {
  if (document.getElementById(DATE_INPUT_TAB_STYLE_ID)) {
    return;
  }

  const css = `
    .date-input-tab-root {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      height: 100%;
      overflow: hidden;
      background: #ffffff;
    }

    .date-input-header {
      display: flex;
      flex-direction: column;
      padding: 12px 14px;
      border-bottom: 1px solid #e0e0e0;
      background: #fafbfc;
      flex-shrink: 0;
    }

    .date-input-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px 14px 8px;
      display: flex;
      flex-direction: column;
      gap: 0;
      box-sizing: border-box;
      min-height: 0;
    }

    .date-input-footer {
      flex-shrink: 0;
      padding: 8px 14px 12px;
      border-top: 1px solid #e0e0e0;
      background: #fafbfc;
    }

    .date-input-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #333333;
    }

    .date-input-preview-section {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .date-input-card-head {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      padding: 0 2px;
    }

    .date-input-preset-inline {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 0;
    }

    .date-input-select {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #ffffff;
      color: #333333;
      font-size: 13px;
      min-height: 32px;
      padding: 5px 30px 5px 8px;
      width: min(290px, 100%);
      min-width: 220px;
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

    .date-input-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px #a29bfe;
    }

    .date-input-preview {
      flex: 1;
      min-height: 88px;
      overflow-y: auto;
      border: 1px dashed #d5d9df;
      border-radius: 4px;
      background: #ffffff;
      padding: 10px;
      font-size: 13px;
      line-height: 1.45;
      color: #333333;
      word-break: break-word;
    }

    .date-input-preview.empty {
      color: #999999;
      font-style: italic;
    }

    .date-input-btn-row {
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
      margin-top: 8px;
    }

    .date-input-btn-row .date-input-btn {
      flex: 1;
      min-width: 0;
      justify-content: center;
    }

    .date-input-btn {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #ffffff;
      color: #333333;
      font-size: 13px;
      padding: 7px 12px;
      cursor: pointer;
      min-height: 34px;
      transition: all 0.15s ease;
    }

    .date-input-btn:hover {
      background: #f0f2f5;
    }

    .date-input-btn.primary {
      border-color: transparent;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      font-weight: 600;
    }

    .date-input-btn.primary:hover {
      background: linear-gradient(135deg, #5a6fd6 0%, #6a3f96 100%);
    }

    .date-input-open-btn {
      width: 100%;
      justify-content: center;
    }

    .date-input-helper {
      margin: 0;
      color: #666666;
      font-size: 12px;
      line-height: 1.5;
    }

    .date-input-toast {
      position: fixed;
      left: 50%;
      top: 14px;
      bottom: auto;
      transform: translateX(-50%);
      opacity: 0;
      z-index: 2147483000;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.35;
      color: #ffffff;
      background: #334155;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
      transition: top 0.18s ease, opacity 0.18s ease;
      pointer-events: none;
      max-width: min(80vw, 320px);
      text-align: center;
    }

    .date-input-toast.show {
      top: 18px;
      opacity: 1;
    }

    .date-input-toast.success {
      background: #16794d;
    }

    .date-input-toast.error {
      background: #af2f2f;
    }

    @media (max-width: 760px) {
      .date-input-card-head {
        grid-template-columns: 1fr;
      }

      .date-input-preset-inline {
        justify-content: flex-start;
      }

      .date-input-select {
        width: 100%;
        min-width: 0;
      }
    }
  `;

  if (isOutlookHost() && CSPBypassInjector.isAvailable()) {
    CSPBypassInjector.injectStyle(css, DATE_INPUT_TAB_STYLE_ID);
    return;
  }

  const style = document.createElement("style");
  style.id = DATE_INPUT_TAB_STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

export class DateInputTab extends BaseTab {
  id = "date-input";
  label = "日期输入";
  icon = "📅";

  private readonly service = new DateComposerService();
  private readonly presetStorageKey: string;
  private readonly showOutlookHint: boolean;
  private previewEl: HTMLDivElement | null = null;

  constructor(options: DateInputTabOptions) {
    super();
    this.presetStorageKey = options.presetStorageKey;
    this.showOutlookHint = options.showOutlookHint === true;
    this.service.setPreset(this.loadPreset());
  }

  async init(): Promise<void> {
    this.initialized = true;
  }

  render(container: HTMLElement): void {
    ensureStyles();

    this.container = container;
    container.innerHTML = "";

    const root = document.createElement("div");
    root.className = "date-input-tab-root";

    const header = document.createElement("div");
    header.className = "date-input-header";
    header.innerHTML = `
      <h3 class="date-input-title">日期输入器</h3>
    `;

    const body = document.createElement("div");
    body.className = "date-input-body";

    const footer = document.createElement("div");
    footer.className = "date-input-footer";

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "date-input-btn primary date-input-open-btn";
    openBtn.textContent = "打开日期输入器";
    openBtn.addEventListener("click", () => this.openComposer());

    const presetWrap = document.createElement("div");
    presetWrap.className = "date-input-preset-inline";
    const presetSelect = document.createElement("select");
    presetSelect.className = "date-input-select";
    presetSelect.innerHTML = DATE_FORMAT_PRESET_OPTIONS.map(
      (option) => `<option value="${option.value}">${option.label}</option>`
    ).join("");
    presetSelect.value = this.service.getPreset();
    presetSelect.addEventListener("change", () => {
      const value = presetSelect.value as DateFormatPreset;
      this.service.setPreset(value);
      this.savePreset(value);
      this.refreshPreview();
    });

    const resultCard = document.createElement("div");
    resultCard.className = "date-input-preview-section";
    const resultHead = document.createElement("div");
    resultHead.className = "date-input-card-head";
    const previewTitle = document.createElement("h3");
    previewTitle.className = "date-input-title";
    previewTitle.textContent = "当前结果预览";

    presetWrap.appendChild(presetSelect);
    resultHead.appendChild(previewTitle);
    resultHead.appendChild(presetWrap);

    const preview = document.createElement("div");
    preview.className = "date-input-preview empty";

    const actions = document.createElement("div");
    actions.className = "date-input-btn-row";

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "date-input-btn primary";
    copyBtn.textContent = "复制结果";
    copyBtn.addEventListener("click", () => this.copyResult());

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "date-input-btn";
    clearBtn.textContent = "清空";
    clearBtn.addEventListener("click", () => {
      this.service.clear();
      this.refreshPreview();
      this.showToast("已清空日期选择", "success");
    });

    actions.appendChild(copyBtn);
    actions.appendChild(clearBtn);

    resultCard.appendChild(resultHead);
    resultCard.appendChild(preview);
    resultCard.appendChild(actions);

    body.appendChild(resultCard);
    footer.appendChild(openBtn);

    if (this.showOutlookHint) {
      const hint = document.createElement("p");
      hint.className = "date-input-helper";
      hint.textContent = "复制后回到 Outlook 直接粘贴即可。";
      footer.appendChild(hint);
    }

    root.appendChild(header);
    root.appendChild(body);
    root.appendChild(footer);

    container.appendChild(root);

    this.previewEl = preview;
    this.refreshPreview();
  }

  private async openComposer(): Promise<void> {
    const result = await DateComposerModal.open({
      initialDates: this.service.getSelectedDates(),
      preset: this.service.getPreset(),
      showPresetSelector: false,
    });

    if (!result) {
      return;
    }

    this.service.setDates(result.dates);
    this.service.setPreset(result.preset);
    this.savePreset(result.preset);
    this.refreshPreview();
  }

  private refreshPreview(): void {
    if (!this.previewEl) {
      return;
    }

    const text = this.service.buildDisplayText();
    if (!text) {
      this.previewEl.textContent = "尚未生成日期文本";
      this.previewEl.classList.add("empty");
      return;
    }

    this.previewEl.textContent = text;
    this.previewEl.classList.remove("empty");
  }

  private async copyResult(): Promise<void> {
    const text = this.service.buildDisplayText();
    if (!text) {
      this.showToast("请先选择日期后再复制", "error");
      return;
    }

    const copied = await this.copyToClipboard(text);
    if (copied) {
      this.showToast("复制成功", "success");
      return;
    }

    this.showToast("复制失败，请手动复制预览文本", "error");
  }

  private async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn(
        "[DateInputTab] Clipboard API failed, fallback to execCommand",
        error
      );
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let success = false;
    try {
      success = document.execCommand("copy");
    } catch (error) {
      success = false;
      console.error("[DateInputTab] execCommand copy failed", error);
    }

    textarea.remove();
    return success;
  }

  private showToast(message: string, type: "success" | "error"): void {
    const existing = document.querySelector(".date-input-toast");
    existing?.remove();

    const toast = document.createElement("div");
    toast.className = `date-input-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 180);
    }, 1800);
  }

  private loadPreset(): DateFormatPreset {
    const saved = localStorage.getItem(this.presetStorageKey);
    if (isDateFormatPreset(saved)) {
      return saved;
    }
    return "compactSameYear";
  }

  private savePreset(preset: DateFormatPreset): void {
    localStorage.setItem(this.presetStorageKey, preset);
  }
}
