import { DateComposerService } from "./DateComposerService";
import { MailService } from "./MailService";

declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue(key: string, value: string): void;

const TIMESHEET_GM_KEY = "hha_builtin_timesheet_config";
const MAIL_OVERLAY_ID = "hha-pcbn-mail-overlay";

interface TimesheetConfig {
  recipientName: string;
  to: string;
  cc: string;
}

interface ComposerOpenOptions {
  selectedDates: string[];
}

const DEFAULT_TIMESHEET_CONFIG: TimesheetConfig = {
  recipientName: "Mariana",
  to: "Mzlotar@AlwaysNY.net",
  cc: "",
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toDisplayDate(canonicalDate: string): string {
  return `${canonicalDate.slice(5, 7)}/${canonicalDate.slice(
    8,
    10
  )}/${canonicalDate.slice(0, 4)}`;
}

function normalizeAddresses(raw: string): string {
  return raw
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(",");
}

function loadTimesheetConfig(): TimesheetConfig {
  try {
    const stored = GM_getValue<string>(TIMESHEET_GM_KEY, "");
    if (stored) {
      return {
        ...DEFAULT_TIMESHEET_CONFIG,
        ...JSON.parse(stored),
      };
    }
  } catch {
    // ignore parse errors and use defaults
  }

  return { ...DEFAULT_TIMESHEET_CONFIG };
}

function saveTimesheetConfig(config: TimesheetConfig): void {
  GM_setValue(TIMESHEET_GM_KEY, JSON.stringify(config));
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function buildDateSummaryText(selectedDates: string[]): string {
  const service = new DateComposerService(selectedDates, "compactSameYear");
  return service.buildDisplayText();
}

function normalizeInlineText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extractAdmissionIdFromText(raw: string): string {
  const normalized = normalizeInlineText(raw);
  if (!normalized) {
    return "";
  }

  const ahcMatch = normalized.match(/\b(AHC-\d+)\b/i);
  if (ahcMatch?.[1]) {
    return ahcMatch[1].toUpperCase();
  }

  const numericMatch = normalized.match(/\b(\d{6,})\b/);
  if (numericMatch?.[1]) {
    return numericMatch[1];
  }

  return "";
}

function extractPatientName(): string {
  const h1 = document.querySelector("h1");
  if (!h1) {
    return "Patient";
  }

  const cleaned = (h1.textContent || "")
    .replace(/\s+LINK\s+WITH\s*-\s*\[.*?\]/gi, "")
    .replace(/\bActive\s+Alert\b/gi, "")
    .replace(/\bAHC-\d+\b/gi, "")
    .replace(/\s*(Active|Inactive|Discharged|Pending)\s*$/i, "")
    .trim();

  return normalizeInlineText(cleaned) || "Patient";
}

function extractAdmissionId(): string {
  const labels = document.querySelectorAll("span, td, label");
  for (const label of Array.from(labels)) {
    if ((label.textContent || "").trim() !== "Admission ID") {
      continue;
    }

    const nextElement =
      label.nextElementSibling ||
      label.parentElement?.nextElementSibling?.querySelector("span, td");
    const raw = (nextElement?.textContent || "").trim();
    if (!raw) {
      continue;
    }

    const id = extractAdmissionIdFromText(raw);
    if (id) {
      return id;
    }

    return raw;
  }

  const headingText = document.querySelector("h1")?.textContent || "";
  return extractAdmissionIdFromText(headingText);
}

function showToast(message: string, type: "success" | "error" | "info"): void {
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
  }, Math.max(2600, message.length * 55));
}

export function openPatientCalendarTimesheetComposer(
  options: ComposerOpenOptions
): void {
  document.getElementById(MAIL_OVERLAY_ID)?.remove();

  const selectedDates = Array.from(new Set(options.selectedDates)).sort(
    (left, right) => left.localeCompare(right)
  );
  if (selectedDates.length === 0) {
    showToast("请先选择至少一个日期后再打开 Outlook", "error");
    return;
  }

  const currentConfig = loadTimesheetConfig();
  const dateSummary = buildDateSummaryText(selectedDates);
  const patientName = extractPatientName();
  const admissionId = extractAdmissionId();
  const subjectParts = [`Live-in PT: ${patientName}`];
  if (admissionId) {
    subjectParts.push(admissionId);
  }
  subjectParts.push("Timesheet for");
  subjectParts.push(dateSummary || toDisplayDate(selectedDates[0]));
  const defaultSubject = subjectParts.join(" ").replace(/\s+/g, " ").trim();

  const greetingName = currentConfig.recipientName.trim();
  const defaultBody = greetingName
    ? `Hello ${escapeHtml(
        greetingName
      )},<br><br>Please see the attached. Let me know if there is any problem.`
    : "Hello,<br><br>Please see the attached. Let me know if there is any problem.";

  const overlay = document.createElement("div");
  overlay.id = MAIL_OVERLAY_ID;
  overlay.className = "template-modal-overlay pcbn-mail-overlay";

  overlay.innerHTML = `
    <div class="template-modal pcbn-mail-modal" role="dialog" aria-modal="true" aria-label="Timesheet 邮件预览">
      <div class="template-modal-header">
        <h3 class="template-modal-title">Timesheet 邮件预览</h3>
        <button class="template-modal-close" type="button" aria-label="关闭">&times;</button>
      </div>
      <div class="template-modal-body pcbn-mail-body">
        <div class="pcbn-mail-config">
          <div class="pcbn-mail-row">
            <label for="pcbn-mail-to">收件人(To):</label>
            <input id="pcbn-mail-to" class="template-form-input" type="text" value="${escapeHtml(
              currentConfig.to
            )}" placeholder="收件人地址，逗号或分号分隔" />
          </div>
          <div class="pcbn-mail-row">
            <label for="pcbn-mail-cc">抄送(CC):</label>
            <input id="pcbn-mail-cc" class="template-form-input" type="text" value="${escapeHtml(
              currentConfig.cc
            )}" placeholder="抄送地址，逗号或分号分隔" />
          </div>
          <div class="pcbn-mail-row">
            <label for="pcbn-mail-subject">主题(Subject):</label>
            <input id="pcbn-mail-subject" class="template-form-input" type="text" value="${escapeHtml(
              defaultSubject
            )}" />
          </div>
          <div class="pcbn-mail-row">
            <label>所选日期:</label>
            <div class="pcbn-confirm-list">${selectedDates
              .map(
                (date) =>
                  `<span class="pcbn-confirm-chip">${escapeHtml(
                    toDisplayDate(date)
                  )}</span>`
              )
              .join("")}</div>
          </div>
        </div>

        <div class="pcbn-mail-editor">
          <div class="modal-editor-toolbar" id="pcbn-mail-toolbar">
            <button type="button" data-cmd="bold" title="粗体"><b>B</b></button>
            <button type="button" data-cmd="italic" title="斜体"><i>I</i></button>
            <button type="button" data-cmd="underline" title="下划线"><u>U</u></button>
            <button type="button" data-cmd="strikeThrough" title="删除线"><s>S</s></button>
            <button type="button" data-cmd="insertUnorderedList" title="无序列表">≡</button>
            <button type="button" data-cmd="insertOrderedList" title="有序列表">⒈</button>
            <button type="button" id="pcbn-mail-link" title="插入链接">🔗</button>
            <button type="button" data-cmd="removeFormat" title="清除格式">✕</button>
          </div>
          <div id="pcbn-mail-body" class="modal-rich-editor" contenteditable="true">${defaultBody}</div>
        </div>
      </div>
      <div class="template-modal-footer pcbn-mail-footer">
        <button type="button" class="template-modal-btn btn-save pcbn-mail-save-btn" id="pcbn-mail-save" disabled>保存配置</button>
        <div class="pcbn-mail-footer-right">
          <button type="button" class="template-modal-btn btn-cancel" id="pcbn-mail-cancel">取消</button>
          <button type="button" class="template-modal-btn btn-save" id="pcbn-mail-send">▶ Outlook</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const toInput = overlay.querySelector("#pcbn-mail-to") as HTMLInputElement;
  const ccInput = overlay.querySelector("#pcbn-mail-cc") as HTMLInputElement;
  const subjectInput = overlay.querySelector(
    "#pcbn-mail-subject"
  ) as HTMLInputElement;
  const bodyEditor = overlay.querySelector("#pcbn-mail-body") as HTMLElement;
  const saveButton = overlay.querySelector(
    "#pcbn-mail-save"
  ) as HTMLButtonElement;
  const sendButton = overlay.querySelector(
    "#pcbn-mail-send"
  ) as HTMLButtonElement;

  let savedConfig = { ...currentConfig };

  const close = () => {
    document.removeEventListener("keydown", onKeydown);
    overlay.remove();
  };

  const updateSaveState = () => {
    const changed =
      toInput.value !== savedConfig.to || ccInput.value !== savedConfig.cc;
    saveButton.disabled = !changed;
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      close();
    }
  };

  document.addEventListener("keydown", onKeydown);

  overlay
    .querySelector(".template-modal-close")
    ?.addEventListener("click", close);
  overlay.querySelector("#pcbn-mail-cancel")?.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  toInput.addEventListener("input", updateSaveState);
  ccInput.addEventListener("input", updateSaveState);

  saveButton.addEventListener("click", () => {
    const nextConfig: TimesheetConfig = {
      recipientName: savedConfig.recipientName,
      to: toInput.value.trim(),
      cc: ccInput.value.trim(),
    };
    saveTimesheetConfig(nextConfig);
    savedConfig = { ...nextConfig };
    saveButton.disabled = true;
    showToast("✅ 已保存 Timesheet 收件人配置", "success");
  });

  const toolbar = overlay.querySelector("#pcbn-mail-toolbar") as HTMLElement;
  toolbar.addEventListener("mousedown", (event) => {
    const target = (event.target as HTMLElement).closest(
      "[data-cmd]"
    ) as HTMLElement | null;
    if (!target) {
      return;
    }

    event.preventDefault();
    document.execCommand(target.dataset.cmd || "", false);
  });

  overlay
    .querySelector("#pcbn-mail-link")
    ?.addEventListener("mousedown", (event) => {
      event.preventDefault();
      const url = prompt("输入链接 URL：");
      if (url) {
        document.execCommand("createLink", false, url);
      }
    });

  sendButton.addEventListener("click", () => {
    const to = normalizeAddresses(toInput.value);
    const cc = normalizeAddresses(ccInput.value);
    if (!to) {
      const proceed = window.confirm(
        "收件人(To)为空，邮件将无收件人。是否仍要发送到 Outlook？"
      );
      if (!proceed) {
        return;
      }
    }

    sendButton.disabled = true;
    sendButton.textContent = "处理中...";

    try {
      MailService.sendMailTask({
        to,
        ...(cc ? { cc } : {}),
        subject: subjectInput.value.trim(),
        body: bodyEditor.innerHTML,
      });
      showToast("✅ 邮件任务已发送到 Outlook", "success");
      close();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "发送到 Outlook 失败";
      showToast(message, "error");
      sendButton.disabled = false;
      sendButton.textContent = "▶ Outlook";
    }
  });
}
