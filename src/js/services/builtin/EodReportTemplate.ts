/**
 * EodReportTemplate
 * Epic 16, Story 3: End of Day Report 内置每日收工报告邮件模板（含本地截图自动读取）
 *
 * 职责：
 * - 渲染入口卡片（始终可点击，无置灰逻辑）
 * - 管理 IndexedDB 存储的 FileSystemDirectoryHandle
 * - 扫描本地文件夹中的截图文件
 * - 管理 Modal 生命周期（富文本编辑器、配置区 dirty 追踪、附件列表）
 * - 读写配置（GM_getValue / GM_setValue）
 * - 将文件序列化为 base64 并通过 MailService 发送到 Outlook
 */

import { MailService } from "../MailService";
import { saveHandleToIDB, loadHandleFromIDB } from "../../utils/IDBHandleStore";

declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue(key: string, value: string): void;

// ─── Types ────────────────────────────────────────────────────────────────────

const GM_KEY = "hha_builtin_eod_report_config";
const IDB_HANDLE_KEY = "eod-report-folder";

const SUPPORTED_EXTS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".webp",
  ".pdf",
  ".heic",
];

interface EodReportConfig {
  recipientName: string; // 默认 "Reggie"
  recipientEmail: string; // 默认 "rthomas@AlwaysNY.net"
}

const DEFAULT_CONFIG: EodReportConfig = {
  recipientName: "Reggie",
  recipientEmail: "rthomas@AlwaysNY.net",
};

// ─── Main Class ───────────────────────────────────────────────────────────────

export class EodReportTemplate {
  // ─── Config ─────────────────────────────────────────────────────────────

  private loadConfig(): EodReportConfig {
    try {
      const stored = GM_getValue<string>(GM_KEY, "");
      if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    } catch (_) {
      // ignore
    }
    return { ...DEFAULT_CONFIG };
  }

  private saveConfig(config: EodReportConfig): void {
    GM_setValue(GM_KEY, JSON.stringify(config));
  }

  // ─── Entry Card ──────────────────────────────────────────────────────────

  renderEntryCard(container: HTMLElement): void {
    const card = document.createElement("div");
    card.className = "template-card eod-entry-card";
    card.style.cursor = "pointer";
    card.innerHTML = `
      <div class="template-card-header">
        <span class="template-name">End of Day Report</span>
        <div class="template-badges">
          <span class="template-builtin-badge">内置</span>
          <span class="template-target-badge">任意页面</span>
        </div>
      </div>
      <div class="template-card-preview">
        <span class="template-subject">📊 自动读取本地截图并生成每日收工报告邮件</span>
      </div>
    `;

    card.addEventListener("click", () => {
      this.startFlow();
    });

    container.appendChild(card);
  }

  // ─── Flow ────────────────────────────────────────────────────────────────

  private async startFlow(): Promise<void> {
    let handle = await loadHandleFromIDB(IDB_HANDLE_KEY);

    if (!handle) {
      // 首次使用：触发文件夹选择器
      try {
        handle = await (
          window as typeof window & {
            showDirectoryPicker: (opts?: {
              mode?: string;
            }) => Promise<FileSystemDirectoryHandle>;
          }
        ).showDirectoryPicker({ mode: "read" });
        await saveHandleToIDB(IDB_HANDLE_KEY, handle);
      } catch (e) {
        // User cancelled the picker
        console.log("[EodReport] Directory picker cancelled or failed:", e);
        return;
      }
    } else {
      // 后续使用：请求权限（触发浏览器原生权限横幅）
      const permission = await (
        handle as FileSystemDirectoryHandle & {
          requestPermission: (opts: {
            mode: string;
          }) => Promise<PermissionState>;
        }
      ).requestPermission({ mode: "read" });

      if (permission !== "granted") {
        console.log("[EodReport] Permission not granted:", permission);
        this.showToast(
          "⚠️ 请在浏览器权限横幅中点击「允许」以访问文件夹",
          "warning"
        );
        return;
      }
    }

    const files = await this.scanFolder(handle);
    this.openModal(handle, files);
  }

  // ─── Folder Scan ─────────────────────────────────────────────────────────

  private async scanFolder(handle: FileSystemDirectoryHandle): Promise<File[]> {
    const files: File[] = [];
    try {
      for await (const entry of (
        handle as FileSystemDirectoryHandle & {
          values: () => AsyncIterable<FileSystemHandle>;
        }
      ).values()) {
        if (entry.kind === "file") {
          const ext = entry.name
            .slice(entry.name.lastIndexOf("."))
            .toLowerCase();
          if (SUPPORTED_EXTS.includes(ext)) {
            files.push(await (entry as FileSystemFileHandle).getFile());
          }
        }
      }
    } catch (e) {
      console.error("[EodReport] Failed to scan folder:", e);
    }
    // Sort by lastModified descending (newest first)
    files.sort((a, b) => b.lastModified - a.lastModified);
    return files;
  }

  // ─── Modal ────────────────────────────────────────────────────────────────

  private openModal(
    handle: FileSystemDirectoryHandle,
    initialFiles: File[]
  ): void {
    // Remove any existing modal
    document.getElementById("eod-modal-overlay")?.remove();

    const config = this.loadConfig();

    // Generate subject with today's date
    const today = new Date();
    const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
      today.getDate()
    ).padStart(2, "0")}/${today.getFullYear()}`;
    const subject = `The End of Day Report ${dateStr}`;

    const bodyPreFill = `Hello ${this.escapeHtml(
      config.recipientName
    )},<br><br>Please see attached.`;

    const overlay = document.createElement("div");
    overlay.id = "eod-modal-overlay";
    overlay.className = "template-modal-overlay";

    overlay.innerHTML = `
      <div class="template-modal eod-modal">
        <div class="template-modal-header eod-modal-header">
          <h3 class="template-modal-title">📧 End of Day Report</h3>
          <button class="template-modal-close" id="eod-modal-close">&times;</button>
        </div>
        <div class="template-modal-body eod-modal-body">

          <!-- Config Section -->
          <div class="eod-config-section">
            <div class="eod-config-row">
              <label class="eod-config-label">收件人名:</label>
              <input type="text" class="eod-config-input" id="eod-recipient-name"
                value="${this.escapeHtml(config.recipientName)}"
                placeholder="Reggie">
            </div>
            <div class="eod-config-row">
              <label class="eod-config-label">收件邮箱:</label>
              <input type="text" class="eod-config-input" id="eod-recipient-email"
                value="${this.escapeHtml(config.recipientEmail)}"
                placeholder="email@example.com">
            </div>
          </div>

          <!-- Subject -->
          <div class="eod-subject-row">
            <label class="eod-config-label">Subject:</label>
            <input type="text" class="eod-subject-input" id="eod-subject"
              value="${this.escapeHtml(subject)}">
          </div>

          <!-- Rich Text Editor -->
          <div class="eod-editor-section">
            <div class="eod-editor-toolbar" id="eod-toolbar">
              <button type="button" data-cmd="bold" title="粗体"><b>B</b></button>
              <button type="button" data-cmd="italic" title="斜体"><i>I</i></button>
              <button type="button" data-cmd="underline" title="下划线"><u>U</u></button>
              <button type="button" data-cmd="strikeThrough" title="删除线"><s>S</s></button>
              <button type="button" data-cmd="insertUnorderedList" title="无序列表">≡</button>
              <button type="button" data-cmd="insertOrderedList" title="有序列表">⒈</button>
              <button type="button" id="eod-link-btn" title="插入链接">🔗</button>
              <button type="button" data-cmd="removeFormat" title="清除格式">✕</button>
            </div>
            <div class="eod-rich-editor" id="eod-body-editor" contenteditable="true">${bodyPreFill}</div>
          </div>

          <!-- Attachment Folder Section -->
          <div class="eod-folder-section">
            <div class="eod-folder-header">
              <span class="eod-folder-label">
                📁 <span class="eod-folder-hint">已选择文件夹：</span><span id="eod-folder-name">${this.escapeHtml(
                  handle.name
                )}</span>
              </span>
              <button class="eod-change-folder-btn" id="eod-change-folder">更改文件夹</button>
            </div>
            <div class="eod-file-list" id="eod-file-list">
              ${this.renderFileListHtml(initialFiles)}
            </div>
          </div>

        </div>
        <!-- Footer -->
        <div class="eod-modal-footer">
          <button class="template-modal-btn btn-save eod-save-config-btn" id="eod-save-config" disabled>保存配置</button>
          <button class="template-modal-btn btn-save eod-outlook-btn" id="eod-outlook">▶ Outlook</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    // Keep a mutable file list (current session only)
    let currentFiles = [...initialFiles];
    let currentHandle = handle;

    this.setupModalHandlers(overlay, currentFiles, currentHandle, config);
  }

  // ─── File List HTML ───────────────────────────────────────────────────────

  private renderFileListHtml(files: File[]): string {
    if (files.length === 0) {
      return `<div class="eod-file-empty">⚠️ 当前文件夹内未找到支持格式的文件</div>`;
    }
    return files
      .map(
        (f, i) =>
          `<div class="eod-file-item" data-index="${i}">
            <span class="eod-file-icon">📄</span>
            <span class="eod-file-name">${this.escapeHtml(f.name)}</span>
            <span class="eod-file-date">修改于 ${this.formatDate(
              f.lastModified
            )}</span>
            <button type="button" class="eod-file-remove" data-index="${i}" title="移除">✕</button>
          </div>`
      )
      .join("");
  }

  private formatDate(ts: number): string {
    const d = new Date(ts);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
  }

  // ─── Modal Handlers ───────────────────────────────────────────────────────

  private setupModalHandlers(
    overlay: HTMLElement,
    currentFiles: File[],
    currentHandle: FileSystemDirectoryHandle,
    initialConfig: EodReportConfig
  ): void {
    const nameInput = overlay.querySelector(
      "#eod-recipient-name"
    ) as HTMLInputElement;
    const emailInput = overlay.querySelector(
      "#eod-recipient-email"
    ) as HTMLInputElement;
    const saveConfigBtn = overlay.querySelector(
      "#eod-save-config"
    ) as HTMLButtonElement;
    const outlookBtn = overlay.querySelector(
      "#eod-outlook"
    ) as HTMLButtonElement;
    const fileListEl = overlay.querySelector("#eod-file-list") as HTMLElement;
    const folderNameEl = overlay.querySelector(
      "#eod-folder-name"
    ) as HTMLElement;

    let savedConfig: EodReportConfig = { ...initialConfig };
    let handle = currentHandle;

    // ── Config dirty tracking ─────────────────────────────────────────────
    const checkDirty = (): boolean =>
      nameInput.value !== savedConfig.recipientName ||
      emailInput.value !== savedConfig.recipientEmail;

    const updateSaveBtn = () => {
      saveConfigBtn.disabled = !checkDirty();
    };

    nameInput.addEventListener("input", updateSaveBtn);
    emailInput.addEventListener("input", updateSaveBtn);

    saveConfigBtn.addEventListener("click", () => {
      const newConfig: EodReportConfig = {
        recipientName: nameInput.value.trim(),
        recipientEmail: emailInput.value.trim(),
      };
      this.saveConfig(newConfig);
      savedConfig = { ...newConfig };
      saveConfigBtn.disabled = true;
      this.showToast("✅ 配置已保存", "success");
    });

    // ── Toolbar ───────────────────────────────────────────────────────────
    const toolbar = overlay.querySelector("#eod-toolbar") as HTMLElement;
    toolbar.addEventListener("mousedown", (e) => {
      const btn = (e.target as HTMLElement).closest(
        "[data-cmd]"
      ) as HTMLElement | null;
      if (btn) {
        e.preventDefault();
        document.execCommand(btn.dataset.cmd!, false);
      }
    });

    const linkBtn = overlay.querySelector("#eod-link-btn");
    linkBtn?.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const url = prompt("输入链接 URL：");
      if (url) document.execCommand("createLink", false, url);
    });

    // ── File remove buttons ───────────────────────────────────────────────
    const rebindRemoveButtons = () => {
      fileListEl.querySelectorAll(".eod-file-remove").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = parseInt((btn as HTMLElement).dataset.index ?? "-1", 10);
          if (idx >= 0 && idx < currentFiles.length) {
            currentFiles.splice(idx, 1);
            fileListEl.innerHTML = this.renderFileListHtml(currentFiles);
            rebindRemoveButtons();
          }
        });
      });
    };
    rebindRemoveButtons();

    // ── Change folder button ──────────────────────────────────────────────
    overlay
      .querySelector("#eod-change-folder")
      ?.addEventListener("click", async () => {
        try {
          const newHandle = await (
            window as typeof window & {
              showDirectoryPicker: (opts?: {
                mode?: string;
              }) => Promise<FileSystemDirectoryHandle>;
            }
          ).showDirectoryPicker({ mode: "read" });
          await saveHandleToIDB(IDB_HANDLE_KEY, newHandle);
          handle = newHandle;
          folderNameEl.textContent = newHandle.name;
          const newFiles = await this.scanFolder(newHandle);
          currentFiles.length = 0;
          currentFiles.push(...newFiles);
          fileListEl.innerHTML = this.renderFileListHtml(currentFiles);
          rebindRemoveButtons();
        } catch (e) {
          console.log("[EodReport] Folder change cancelled:", e);
        }
      });

    // ── Close ─────────────────────────────────────────────────────────────
    overlay.querySelector("#eod-modal-close")?.addEventListener("click", () => {
      this.closeModal(overlay);
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.closeModal(overlay);
    });

    // ── Send to Outlook ───────────────────────────────────────────────────
    outlookBtn.addEventListener("click", async () => {
      const bodyEditor = overlay.querySelector(
        "#eod-body-editor"
      ) as HTMLElement;
      const subjectInput = overlay.querySelector(
        "#eod-subject"
      ) as HTMLInputElement;

      if (currentFiles.length === 0) {
        const ok = window.confirm("当前没有附件文件，是否确认发送到 Outlook？");
        if (!ok) return;
      }

      outlookBtn.disabled = true;
      outlookBtn.textContent = "处理中...";

      try {
        // Serialize files to base64
        const attachments = await Promise.all(
          currentFiles.map(async (f) => ({
            name: f.name,
            type: f.type || "application/octet-stream",
            base64: await this.fileToBase64(f),
          }))
        );

        MailService.sendMailTask({
          to: emailInput.value.trim() || savedConfig.recipientEmail,
          subject: subjectInput.value.trim(),
          body: bodyEditor.innerHTML,
          attachments,
        });

        this.closeModal(overlay);
        this.showToast("✅ 邮件任务已发送到 Outlook", "success");
      } catch (e) {
        console.error("[EodReport] Send failed:", e);
        outlookBtn.disabled = false;
        outlookBtn.textContent = "▶ Outlook";
        this.showToast("❌ 发送失败，请重试", "warning");
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private closeModal(overlay: HTMLElement): void {
    overlay.remove();
    document.body.style.overflow = "";
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip "data:...;base64," prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private showToast(message: string, type: "success" | "warning"): void {
    document.querySelector(".eod-toast")?.remove();
    const toast = document.createElement("div");
    toast.className = `eod-toast eod-toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add("show"));
    });
    const duration = Math.max(3000, message.length * 60);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}
