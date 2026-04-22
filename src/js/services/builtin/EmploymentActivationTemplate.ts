/**
 * EmploymentActivationTemplate
 * Epic 16, Story 4: 护理激活请求四步向导内置模板
 *
 * 子 Story:
 *   16.4a — 向导框架 + 步骤条 + 入口卡片 + 脏状态检测
 *   16.4b — 步骤1/2：嵌入式 Caregiver & Patient 搜索选择
 *   16.4c — 步骤3：日期选择器
 *   16.4d — 收件组 CRUD + GM Storage + 管理弹窗
 *   16.4e — 步骤4：预览编辑器 + 收件组选择 + Outlook 发送
 */

import { MailService } from "../MailService";
import {
  fetchAllPages,
  parseAideRows,
  parsePatientRows,
  AideRecord,
  PatientRecord,
} from "../HhaSearchService";

declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue(key: string, value: string): void;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectedCaregiver {
  fullName: string;
  caregiverCode: string;
  lastName: string;
  firstName: string;
}

interface SelectedPatient {
  fullName: string;
  admissionId: string;
}

interface WizardState {
  caregiver: SelectedCaregiver | null;
  patient: SelectedPatient | null;
  activationDate: string | null; // MM/DD/YYYY
  selectedGroupId: string | null;
  isDirty: boolean;
  bodyHtml: string | null;
  skipBodySave: boolean;
}

interface RecipientGroup {
  id: string; // "grp_{Date.now()}"
  name: string;
  greeting: string;
  to: string[];
  cc: string[];
}

interface EaConfig {
  recipientGroups: RecipientGroup[];
}

// ─── GM Storage ───────────────────────────────────────────────────────────────

const GM_KEY = "hha_builtin_employment_activation_config";

function loadEaConfig(): EaConfig {
  try {
    const raw = GM_getValue<string>(GM_KEY, "");
    if (raw) return { recipientGroups: [], ...JSON.parse(raw) };
  } catch (_) {
    /* ignore */
  }
  return { recipientGroups: [] };
}

function saveEaConfig(cfg: EaConfig): void {
  GM_setValue(GM_KEY, JSON.stringify(cfg));
}

// ─── Avatar Helpers ───────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash + ch.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function getStatusBadgeHtml(status: string): string {
  const lower = status.toLowerCase();
  let cls = "ea-badge-yellow";
  if (lower === "active" || lower === "hospitalized") cls = "ea-badge-green";
  else if (lower === "terminated" || lower === "discharged")
    cls = "ea-badge-gray";
  return `<span class="ea-status-badge ${cls}">${escHtml(status)}</span>`;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const EA_STYLES = `
<style id="ea-wizard-styles">
/* ── Overlay & Modal ──────────────────────────────────────────────────── */
.ea-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  z-index: 2147483640; display: flex; align-items: center; justify-content: center;
}
.ea-container {
  background: #fff; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,.25);
  min-width: 960px; min-height: 760px; width: 960px; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
}
/* ── Header ───────────────────────────────────────────────────────────── */
.ea-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; flex-shrink: 0;
}
.ea-header-title { margin: 0; font-size: 16px; font-weight: 600; }
.ea-close-btn {
  background: none; border: none; color: #fff; font-size: 20px;
  cursor: pointer; line-height: 1; padding: 0 4px;
}
.ea-close-btn:hover { opacity: .7; }
/* ── Step Bar ─────────────────────────────────────────────────────────── */
.ea-steps {
  display: flex; align-items: center; padding: 16px 24px;
  background: #f8fafc; border-bottom: 1px solid #e2e8f0; flex-shrink: 0;
}
.ea-step {
  display: flex; align-items: center; cursor: default; user-select: none;
}
.ea-step.clickable { cursor: pointer; }
.ea-step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; flex-shrink: 0;
  border: 2px solid #d1d5db; background: #f3f4f6; color: #9ca3af;
}
.ea-step.done .ea-step-dot {
  background: #667eea; border-color: #667eea; color: #fff;
}
.ea-step.active .ea-step-dot {
  border-color: #667eea; background: #fff; color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,.15);
}
.ea-step-label { margin-left: 6px; font-size: 12px; color: #6b7280; white-space: nowrap; }
.ea-step.done .ea-step-label, .ea-step.active .ea-step-label { color: #667eea; font-weight: 600; }
.ea-step-connector { flex: 1; height: 2px; background: #e2e8f0; margin: 0 10px; }
.ea-step-connector.done { background: #667eea; }
/* ── Summary Bar ──────────────────────────────────────────────────────── */
.ea-summary {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 8px 20px; background: #eff6ff; border-bottom: 1px solid #bfdbfe;
  font-size: 12px; color: #1e40af; flex-shrink: 0;
}
.ea-summary-item {
  cursor: pointer; padding: 2px 6px; border-radius: 4px;
}
.ea-summary-item:hover { background: #dbeafe; text-decoration: underline; }
.ea-summary-sep { color: #93c5fd; }
/* ── Body ─────────────────────────────────────────────────────────────── */
.ea-body {
  flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 20px;
  min-height: 0; display: flex; flex-direction: column;
}
/* ── Footer ───────────────────────────────────────────────────────────── */
.ea-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border-top: 1px solid #e2e8f0; flex-shrink: 0;
}
.ea-footer-right { display: flex; gap: 8px; }
/* ── Buttons ──────────────────────────────────────────────────────────── */
.ea-btn {
  padding: 7px 16px; border-radius: 5px; font-size: 13px; cursor: pointer;
  border: 1px solid #d1d5db; background: #fff; color: #374151;
  transition: background .15s;
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
}
.ea-btn:hover:not(:disabled) { background: #f9fafb; }
.ea-btn:disabled { opacity: .45; cursor: not-allowed; }
.ea-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border-color: transparent;
}
.ea-btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #5a6fd6 0%, #6b4199 100%); }
/* ── Search Area ──────────────────────────────────────────────────────── */
.ea-search-row {
  display: flex; gap: 8px; align-items: center; margin-bottom: 10px;
}
.ea-search-field { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; }
.ea-search-label { font-size: 11px; color: #6b7280; white-space: nowrap; flex-shrink: 0; }
.ea-input-wrap { position: relative; flex: 1; min-width: 0; display: flex; align-items: center; }
.ea-input {
  flex: 1; min-width: 0; box-sizing: border-box; padding: 6px 26px 6px 8px;
  border: 1px solid #d1d5db; border-radius: 4px; font-size: 12px; margin: 0 !important;
}
.ea-input:focus { outline: none; border-color: #667eea; }
.ea-clear-btn {
  all: unset; box-sizing: border-box;
  position: absolute; right: 0; top: 0; bottom: 0;
  display: flex; align-items: center; justify-content: center;
  width: 22px; cursor: pointer; color: #bbb; font-size: 12px;
}
.ea-clear-btn:hover { color: #555; }
.ea-search-btn { padding: 6px 14px; white-space: nowrap; }
.ea-result-count { font-size: 11px; color: #6b7280; white-space: nowrap; }
/* ── Current Selection Bar ────────────────────────────────────────────── */
.ea-selection-bar {
  padding: 8px 12px; background: #eff6ff; border: 1px solid #bfdbfe;
  border-radius: 4px; margin-bottom: 10px; font-size: 12px; min-height: 36px;
  display: flex; align-items: center;
}
.ea-selection-placeholder { color: #9ca3af; font-style: italic; }
.ea-selection-chosen { color: #1e40af; font-weight: 600; }
/* ── Result List ──────────────────────────────────────────────────────── */
.ea-result-list {
  flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain;
  border: 1px solid #e2e8f0; border-radius: 4px;
  display: flex; flex-direction: column;
}
.ea-result-placeholder {
  flex: 1; display: flex; align-items: center; justify-content: center;
  color: #9ca3af; font-size: 13px; text-align: center; padding: 20px;
}
.ea-result-spinner {
  flex: 1; display: flex; align-items: center; justify-content: center;
}
.ea-spinner {
  width: 32px; height: 32px; border: 3px solid #e2e8f0;
  border-top-color: #667eea; border-radius: 50%;
  animation: ea-spin .7s linear infinite;
}
@keyframes ea-spin { to { transform: rotate(360deg); } }
.ea-result-card {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-bottom: 1px solid #f1f5f9; cursor: default;
}
.ea-result-card:last-child { border-bottom: none; }
.ea-result-card.selected { background: #eff6ff; }
.ea-result-card:hover { background: #f8fafc; }
.ea-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 13px; font-weight: 700;
}
.ea-card-info { flex: 1; min-width: 0; }
.ea-card-line1 { font-size: 13px; font-weight: 600; color: #1f2937; }
.ea-card-line2 { font-size: 11px; color: #6b7280; margin-top: 1px; }
.ea-card-line3 { font-size: 11px; color: #9ca3af; margin-top: 1px; }
.ea-card-select-btn {
  padding: 4px 10px; font-size: 11px; border-radius: 4px;
  border: 1px solid #667eea; background: #fff; color: #667eea;
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
}
.ea-card-select-btn:hover:not(:disabled) { background: #eff6ff; }
.ea-card-select-btn.selected-btn {
  background: #d1fae5; border-color: #10b981; color: #065f46; cursor: default;
}
/* ── Step 3: Date ─────────────────────────────────────────────────────── */
.ea-date-section {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 40px 0;
}
.ea-date-title { font-size: 15px; font-weight: 600; color: #1f2937; }
.ea-date-shortcuts { display: flex; gap: 8px; }
.ea-date-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; justify-content: center; }
.ea-date-input {
  padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px;
  font-size: 14px; min-width: 180px;
}
.ea-date-input:focus { outline: none; border-color: #667eea; }
/* ── Step 4: Preview ──────────────────────────────────────────────────── */
.ea-step4-section { display: flex; flex-direction: column; gap: 12px; }
.ea-group-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.ea-group-label { font-size: 12px; font-weight: 600; color: #374151; }
.ea-gear-btn {
  background: none; border: 1px solid #d1d5db; border-radius: 4px;
  padding: 3px 8px; font-size: 12px; cursor: pointer; color: #374151;
}
.ea-gear-btn:hover { background: #f3f4f6; }
.ea-group-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.ea-group-chip {
  padding: 5px 12px; border-radius: 16px; font-size: 12px;
  border: 1px solid #d1d5db; background: #fff; cursor: pointer; color: #374151;
}
.ea-group-chip:hover { border-color: #667eea; color: #667eea; }
.ea-group-chip.active {
  background: #667eea; border-color: #667eea; color: #fff;
}
.ea-group-empty { font-size: 12px; color: #9ca3af; font-style: italic; }
.ea-to-cc-info {
  font-size: 11px; color: #4b5563; padding: 6px 10px;
  background: #f9fafb; border-radius: 4px; border: 1px solid #e5e7eb;
}
.ea-to-cc-line { margin-bottom: 2px; }
.ea-subject-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.ea-subject-label { font-size: 12px; color: #374151; white-space: nowrap; font-weight: 500; min-width: 56px; flex-shrink: 0; }
.ea-subject-input {
  flex: 1; padding: 7px 10px; border: 1px solid #d1d5db;
  border-radius: 4px; font-size: 13px; margin: 0 !important; vertical-align: middle;
  box-sizing: border-box;
}
.ea-subject-input:focus { outline: none; border-color: #667eea; }
.ea-body-label { font-size: 12px; color: #374151; font-weight: 500; margin-top: 4px; }
/* ── Rich Editor (Step 4) ─────────────────────────────────────────────── */
.ea-editor-section { display: flex; flex-direction: column; border: 1px solid #d1d5db; border-radius: 4px; overflow: hidden; margin-top: 4px; }
.ea-editor-toolbar { display: flex; gap: 2px; padding: 5px 8px; background: #f5f5f5; border-bottom: 1px solid #e0e0e0; flex-wrap: wrap; }
.ea-editor-toolbar button { background: none; border: 1px solid transparent; border-radius: 4px; padding: 3px 7px; font-size: 13px; cursor: pointer; color: #333; transition: background .15s; }
.ea-editor-toolbar button:hover { background: #e0e0e0; border-color: #ccc; }
.ea-rich-editor { min-height: 220px; padding: 10px 12px; font-size: 13px; line-height: 1.6; outline: none; background: #fff; }
.ea-rich-editor:focus { background: #fafafa; }
/* ── Status Badge ─────────────────────────────────────────────────────── */
.ea-status-badge {
  display: inline-block; padding: 1px 7px; border-radius: 10px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
}
.ea-badge-green { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.ea-badge-gray  { background: #f3f4f6; color: #6b7280; border: 1px solid #d1d5db; }
.ea-badge-yellow { background: #fef9c3; color: #854d0e; border: 1px solid #fde68a; }
/* ── Confirm Dialog ───────────────────────────────────────────────────── */
.ea-confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.3);
  z-index: 2147483645; display: flex; align-items: center; justify-content: center;
}
.ea-confirm-box {
  background: #fff; border-radius: 8px; padding: 24px; max-width: 380px;
  box-shadow: 0 4px 20px rgba(0,0,0,.2); text-align: center;
}
.ea-confirm-msg { font-size: 14px; color: #374151; margin-bottom: 18px; line-height: 1.5; }
.ea-confirm-actions { display: flex; gap: 10px; justify-content: center; }
/* ── Toast ────────────────────────────────────────────────────────────── */
.ea-toast {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-40px);
  background: #4caf50; color: #fff; padding: 10px 20px; border-radius: 8px;
  font-size: 14px; z-index: 2147483647; box-shadow: 0 4px 12px rgba(0,0,0,.15);
  opacity: 0; transition: opacity .3s ease, transform .3s ease;
  pointer-events: none; max-width: 440px; text-align: center;
}
.ea-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
/* ── Manage Groups Modal ──────────────────────────────────────────────── */
.ea-mgr-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  z-index: 2147483650; display: flex; align-items: center; justify-content: center;
}
.ea-mgr-container {
  background: #fff; border-radius: 8px; width: 480px; max-height: 560px;
  display: flex; flex-direction: column; box-shadow: 0 6px 24px rgba(0,0,0,.2);
  overflow: hidden;
}
.ea-mgr-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; flex-shrink: 0;
}
.ea-mgr-title { margin: 0; font-size: 14px; font-weight: 600; }
.ea-mgr-body { flex: 1; overflow-y: auto; padding: 12px 16px; }
.ea-mgr-footer { padding: 10px 16px; border-top: 1px solid #e2e8f0; flex-shrink: 0; }
.ea-mgr-group-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid #f1f5f9;
}
.ea-mgr-group-row:last-child { border-bottom: none; }
.ea-mgr-group-info { flex: 1; min-width: 0; }
.ea-mgr-group-name { font-size: 13px; font-weight: 600; color: #1f2937; }
.ea-mgr-group-greeting { font-size: 11px; color: #9ca3af; }
.ea-mgr-group-actions { display: flex; gap: 6px; flex-shrink: 0; }
.ea-mgr-group-actions button {
  padding: 3px 8px; font-size: 11px; border-radius: 3px;
  border: 1px solid #d1d5db; background: #fff; cursor: pointer; color: #374151;
}
.ea-mgr-group-actions button:hover { background: #f3f4f6; }
.ea-mgr-group-form {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;
  padding: 10px; margin-top: 6px;
}
.ea-mgr-form-row { margin-bottom: 8px; }
.ea-mgr-form-row label { display: block; font-size: 11px; color: #6b7280; margin-bottom: 3px; }
.ea-mgr-form-row input {
  width: 100%; box-sizing: border-box; padding: 5px 8px;
  border: 1px solid #d1d5db; border-radius: 3px; font-size: 12px;
}
.ea-mgr-form-row input:focus { outline: none; border-color: #667eea; }
.ea-mgr-form-error { font-size: 11px; color: #ef4444; margin-top: 3px; display: none; }
.ea-mgr-form-actions { display: flex; gap: 6px; justify-content: flex-end; }
.ea-mgr-inline-confirm {
  font-size: 12px; color: #374151; display: flex; align-items: center;
  gap: 6px; margin-top: 4px; flex-wrap: wrap;
}
.ea-mgr-empty { font-size: 13px; color: #9ca3af; text-align: center; padding: 16px 0; }
.ea-mgr-limit-tip { font-size: 11px; color: #9ca3af; }
</style>
`;

// ─── Main Class ───────────────────────────────────────────────────────────────

export class EmploymentActivationTemplate {
  // ─── Entry Card ──────────────────────────────────────────────────────────

  renderEntryCard(container: HTMLElement): void {
    const card = document.createElement("div");
    card.className = "template-card ea-entry-card";
    card.style.cursor = "pointer";
    card.innerHTML = `
      <div class="template-card-header">
        <span class="template-name">Employment Activation Request</span>
        <div class="template-badges">
          <span class="template-builtin-badge">内置</span>
          <span class="template-target-badge">任意页面</span>
        </div>
      </div>
      <div class="template-card-preview">
        <span class="template-subject">📨 四步向导生成护理员雇佣激活邮件</span>
      </div>
    `;
    card.addEventListener("click", () => this.openModal());
    container.appendChild(card);
  }

  // ─── Wizard Modal ─────────────────────────────────────────────────────────

  private openModal(): void {
    if (document.getElementById("ea-wizard-overlay")) return;

    // Inject styles once
    if (!document.getElementById("ea-wizard-styles")) {
      document.head.insertAdjacentHTML("beforeend", EA_STYLES);
    }

    const state: WizardState = {
      caregiver: null,
      patient: null,
      activationDate: null,
      selectedGroupId: null,
      isDirty: false,
      bodyHtml: null,
      skipBodySave: false,
    };
    let currentStep = 1;

    // ── Build Shell ──────────────────────────────────────────────────────
    const overlay = document.createElement("div");
    overlay.className = "ea-overlay";
    overlay.id = "ea-wizard-overlay";

    const container = document.createElement("div");
    container.className = "ea-container";
    overlay.appendChild(container);

    // Header
    const header = document.createElement("div");
    header.className = "ea-header";
    header.innerHTML = `
      <h3 class="ea-header-title">护理激活请求</h3>
      <button class="ea-close-btn" id="ea-close-btn">&times;</button>
    `;
    container.appendChild(header);

    // Step bar
    const stepsEl = document.createElement("div");
    stepsEl.className = "ea-steps";
    stepsEl.id = "ea-steps";
    container.appendChild(stepsEl);

    // Summary bar
    const summaryEl = document.createElement("div");
    summaryEl.className = "ea-summary";
    summaryEl.id = "ea-summary";
    summaryEl.style.display = "none";
    container.appendChild(summaryEl);

    // Body
    const bodyEl = document.createElement("div");
    bodyEl.className = "ea-body";
    bodyEl.id = "ea-body";
    container.appendChild(bodyEl);

    // Footer
    const footerEl = document.createElement("div");
    footerEl.className = "ea-footer";
    footerEl.id = "ea-footer";
    container.appendChild(footerEl);

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    // ── Close Logic ──────────────────────────────────────────────────────
    const closeModal = () => {
      overlay.remove();
      document.body.style.overflow = "";
    };

    const tryClose = () => {
      if (!state.isDirty) {
        closeModal();
        return;
      }
      showConfirmDialog(
        "⚠️ 你已有输入内容尚未发送，关闭将清空所有输入。确认关闭？",
        "取消",
        "确认关闭",
        closeModal
      );
    };

    header.querySelector("#ea-close-btn")!.addEventListener("click", tryClose);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) tryClose();
    });

    // ── Render Helpers ────────────────────────────────────────────────────
    const renderStepBar = () => {
      const steps = [
        { n: 1, label: "护理员" },
        { n: 2, label: "病人" },
        { n: 3, label: "日期" },
        { n: 4, label: "预览" },
      ];
      stepsEl.innerHTML = "";
      steps.forEach((s, i) => {
        const isDone = s.n < currentStep;
        const isActive = s.n === currentStep;
        const el = document.createElement("div");
        el.className =
          "ea-step" +
          (isDone ? " done clickable" : "") +
          (isActive ? " active" : "");
        el.innerHTML = `
          <div class="ea-step-dot">${isDone ? "✓" : s.n}</div>
          <div class="ea-step-label">${s.label}</div>
        `;
        if (isDone) {
          el.addEventListener("click", () => {
            currentStep = s.n;
            renderAll();
          });
        }
        stepsEl.appendChild(el);
        if (i < steps.length - 1) {
          const conn = document.createElement("div");
          conn.className = "ea-step-connector" + (isDone ? " done" : "");
          stepsEl.appendChild(conn);
        }
      });
    };

    const renderSummary = () => {
      if (currentStep < 2) {
        summaryEl.style.display = "none";
        return;
      }
      summaryEl.style.display = "flex";
      summaryEl.innerHTML = "";

      const addChip = (text: string, step: number) => {
        const chip = document.createElement("span");
        chip.className = "ea-summary-item";
        chip.textContent = text;
        chip.addEventListener("click", () => {
          currentStep = step;
          renderAll();
        });
        summaryEl.appendChild(chip);
      };
      const addSep = () => {
        const sep = document.createElement("span");
        sep.className = "ea-summary-sep";
        sep.textContent = "｜";
        summaryEl.appendChild(sep);
      };

      if (state.caregiver) {
        addChip(
          `护理员：${state.caregiver.fullName} ${state.caregiver.caregiverCode}`,
          1
        );
      }
      if (currentStep >= 3 && state.patient) {
        addSep();
        addChip(
          `病人：${state.patient.fullName} ${state.patient.admissionId}`,
          2
        );
      }
      if (currentStep >= 4 && state.activationDate) {
        addSep();
        addChip(`激活日期：${state.activationDate}`, 3);
      }
    };

    const renderAll = () => {
      renderStepBar();
      renderSummary();
      renderFooter();
      renderBody();
    };

    const rerenderShell = () => {
      renderStepBar();
      renderSummary();
      renderFooter();
    };

    // ── Step Bodies ───────────────────────────────────────────────────────
    const renderBody = () => {
      // Save contenteditable editor content before clearing body DOM
      // (skip save when chip click has explicitly reset bodyHtml)
      if (!state.skipBodySave) {
        const editorEl = document.querySelector<HTMLElement>("#ea-body-editor");
        if (editorEl) state.bodyHtml = editorEl.innerHTML;
      }
      state.skipBodySave = false;
      bodyEl.innerHTML = "";
      if (currentStep === 1) renderSearchStep(bodyEl, "aide", state);
      else if (currentStep === 2) renderSearchStep(bodyEl, "patient", state);
      else if (currentStep === 3) renderDateStep(bodyEl, state, rerenderShell);
      else if (currentStep === 4) renderPreviewStep(bodyEl, state, renderAll);
    };

    // ── Footer ────────────────────────────────────────────────────────────
    const renderFooter = () => {
      footerEl.innerHTML = "";
      const left = document.createElement("div");
      const right = document.createElement("div");
      right.className = "ea-footer-right";

      if (currentStep > 1) {
        const prev = document.createElement("button");
        prev.className = "ea-btn";
        prev.textContent = "上一步";
        prev.addEventListener("click", () => {
          currentStep--;
          renderAll();
        });
        left.appendChild(prev);
      }

      if (currentStep < 4) {
        const next = document.createElement("button");
        next.className = "ea-btn ea-btn-primary";
        next.textContent = "下一步";
        const canNext =
          (currentStep === 1 && state.caregiver !== null) ||
          (currentStep === 2 && state.patient !== null) ||
          (currentStep === 3 && state.activationDate !== null);
        next.disabled = !canNext;
        if (!canNext) {
          const tips: Record<number, string> = {
            1: "请先选择护理员",
            2: "请先选择病人",
            3: "请先选择日期",
          };
          next.title = tips[currentStep] ?? "";
        }
        next.addEventListener("click", () => {
          currentStep++;
          renderAll();
        });
        right.appendChild(next);
      } else {
        // Step 4: send button is managed inside renderPreviewStep
      }

      footerEl.appendChild(left);
      footerEl.appendChild(right);
    };

    // ── Search Step Renderer ──────────────────────────────────────────────
    const renderSearchStep = (
      parent: HTMLElement,
      type: "aide" | "patient",
      st: WizardState
    ) => {
      const isAide = type === "aide";
      const idPlaceholder = isAide
        ? "Caregiver Code"
        : "Admission ID (MR Number)";
      const currentSel = isAide ? st.caregiver : st.patient;

      // Search inputs row
      const allInputs: HTMLInputElement[] = [];
      const searchRow = document.createElement("div");
      searchRow.className = "ea-search-row";

      const makeField = (label: string, key: string, placeholder: string) => {
        const field = document.createElement("div");
        field.className = "ea-search-field";
        field.innerHTML = `<label class="ea-search-label">${label}</label>`;
        const wrap = document.createElement("div");
        wrap.className = "ea-input-wrap";
        const input = document.createElement("input");
        input.className = "ea-input";
        input.type = "text";
        input.placeholder = placeholder;
        input.dataset.key = key;
        allInputs.push(input);
        const clearBtn = document.createElement("button");
        clearBtn.className = "ea-clear-btn";
        clearBtn.textContent = "×";
        clearBtn.type = "button";
        clearBtn.tabIndex = -1;
        clearBtn.addEventListener("click", () => {
          input.value = "";
          input.focus();
          updateSearchBtn();
        });
        wrap.appendChild(input);
        wrap.appendChild(clearBtn);
        field.appendChild(wrap);
        return field;
      };

      const lastField = makeField("姓", "lastName", "Last Name");
      const firstField = makeField("名", "firstName", "First Name");
      const phoneField = makeField("电话", "phone", "Phone");
      const idField = makeField("ID", "id", idPlaceholder);
      searchRow.append(lastField, firstField, phoneField, idField);

      const countEl = document.createElement("span");
      countEl.className = "ea-result-count";
      searchRow.appendChild(countEl);

      const searchBtn = document.createElement("button");
      searchBtn.className = "ea-btn ea-search-btn";
      searchBtn.textContent = "搜索";
      searchBtn.type = "button";
      searchBtn.disabled = true;
      searchBtn.title = "请至少输入一个搜索条件";
      searchRow.appendChild(searchBtn);

      parent.appendChild(searchRow);

      // Type-exclusive search fields
      const exclusiveRow = document.createElement("div");
      exclusiveRow.className = "ea-search-row";
      if (isAide) {
        exclusiveRow.appendChild(
          makeField("SSN", "ssn", "Social Security Number")
        );
      } else {
        exclusiveRow.appendChild(
          makeField("PatientID", "patientId", "Patient ID")
        );
        exclusiveRow.appendChild(
          makeField("Medicaid", "medicaidId", "Medicaid ID")
        );
      }
      parent.appendChild(exclusiveRow);

      // Current selection bar
      const selBar = document.createElement("div");
      selBar.className = "ea-selection-bar";
      const updateSelBar = () => {
        const sel = isAide ? st.caregiver : st.patient;
        if (sel) {
          const code = isAide
            ? (sel as SelectedCaregiver).caregiverCode
            : (sel as SelectedPatient).admissionId;
          selBar.innerHTML = `<span class="ea-selection-chosen">✓ 已选择：${escHtml(
            sel.fullName
          )} ${escHtml(code)}</span>`;
        } else {
          selBar.innerHTML = `<span class="ea-selection-placeholder">已选择：（请搜索并选择）</span>`;
        }
      };
      updateSelBar();
      parent.appendChild(selBar);

      // Result list — flex:1 so it fills remaining body height
      const resultListWrap = document.createElement("div");
      resultListWrap.style.cssText =
        "flex:1;min-height:0;display:flex;flex-direction:column;";
      const resultList = document.createElement("div");
      resultList.className = "ea-result-list";
      resultList.innerHTML = `<div class="ea-result-placeholder">请输入搜索条件后点击搜索</div>`;
      resultListWrap.appendChild(resultList);
      parent.appendChild(resultListWrap);

      // Input helpers
      const getAllInputs = () => allInputs;

      const updateSearchBtn = () => {
        const hasAny = getAllInputs().some((i) => i.value.trim() !== "");
        searchBtn.disabled = !hasAny;
        searchBtn.title = hasAny ? "" : "请至少输入一个搜索条件";
      };

      getAllInputs().forEach((inp) => {
        inp.addEventListener("input", updateSearchBtn);
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !searchBtn.disabled) searchBtn.click();
        });
      });

      // Search handler
      let selectedIndex: number | null = currentSel ? -1 : null; // -1 means existing selection

      const doSearch = async () => {
        const params: Record<string, string> = {};
        getAllInputs().forEach((i) => {
          if (i.value.trim()) params[i.dataset.key!] = i.value.trim();
        });

        searchBtn.disabled = true;
        searchBtn.textContent = "⏳ 搜索中…";
        resultList.innerHTML = `<div class="ea-result-spinner"><div class="ea-spinner"></div></div>`;

        try {
          const result = await fetchAllPages(type, params);
          const records = isAide
            ? parseAideRows(result.rawHtml)
            : parsePatientRows(result.rawHtml);

          if (records.length === 0) {
            resultList.innerHTML = `<div class="ea-result-placeholder">未找到匹配结果，请尝试其他条件</div>`;
            countEl.textContent = "";
          } else {
            countEl.textContent = `共 ${records.length} 条`;
            resultList.innerHTML = "";
            renderResultCards(
              records,
              resultList,
              isAide,
              st,
              selBar,
              updateSelBar,
              rerenderShell
            );
          }
        } catch (err) {
          console.error("[EmploymentActivation] Search error:", err);
          resultList.innerHTML = `<div class="ea-result-placeholder">搜索出错，请重试</div>`;
        } finally {
          searchBtn.disabled = false;
          searchBtn.textContent = "搜索";
          updateSearchBtn();
        }
      };

      searchBtn.addEventListener("click", () => doSearch());
    };

    // Initial render
    renderAll();
  }

  // ─── Result Cards ─────────────────────────────────────────────────────────

  // (static-like helper, extracted for clarity)
}

// ─── renderResultCards ────────────────────────────────────────────────────────

function renderResultCards(
  records: (AideRecord | PatientRecord)[],
  listEl: HTMLElement,
  isAide: boolean,
  state: WizardState,
  selBar: HTMLElement,
  updateSelBar: () => void,
  rerenderAll: () => void
): void {
  const currentSel = isAide ? state.caregiver : state.patient;

  records.forEach((rec, idx) => {
    const card = document.createElement("div");
    card.className = "ea-result-card";
    card.dataset.index = String(idx);

    const initial = rec.fullName.charAt(0).toUpperCase() || "?";
    const avatarColor = getAvatarColor(rec.fullName);

    let line1 = "";
    let line2 = "";
    let line3 = "";
    let matchCode = "";

    if (isAide) {
      const aide = rec as AideRecord;
      const statusHtml = aide.status
        ? `&nbsp;${getStatusBadgeHtml(aide.status)}`
        : "";
      line1 = `${escHtml(aide.fullName)} ${escHtml(
        aide.caregiverCode
      )}${statusHtml}`;
      const parts: string[] = [];
      if (aide.dob) parts.push(`DOB: ${escHtml(aide.dob)}`);
      if (aide.phone) parts.push(`📞 ${escHtml(aide.phone)}`);
      if (aide.discipline) parts.push(escHtml(aide.discipline));
      line2 = parts.join("&nbsp;&nbsp;");
      const parts3: string[] = [];
      if (aide.ssn) parts3.push(`SSN: ${escHtml(aide.ssn)}`);
      if (aide.team) parts3.push(`Team: ${escHtml(aide.team)}`);
      if (aide.type) parts3.push(`Type: ${escHtml(aide.type)}`);
      if (aide.altCaregiverCode)
        parts3.push(`Alt: ${escHtml(aide.altCaregiverCode)}`);
      line3 = parts3.join("&nbsp;&nbsp;");
      matchCode = aide.caregiverCode;
    } else {
      const patient = rec as PatientRecord;
      const statusHtml = patient.status
        ? `&nbsp;${getStatusBadgeHtml(patient.status)}`
        : "";
      line1 = `${escHtml(patient.fullName)}${
        patient.admissionId
          ? ` &nbsp;<span style="font-weight:400;color:#6b7280">${escHtml(
              patient.admissionId
            )}</span>`
          : ""
      }${statusHtml}`;
      const parts: string[] = [];
      if (patient.coordinators)
        parts.push(`Coord: ${escHtml(patient.coordinators)}`);
      if (patient.dob) parts.push(`DOB: ${escHtml(patient.dob)}`);
      if (patient.phone) parts.push(`📞 ${escHtml(patient.phone)}`);
      line2 = parts.join("&nbsp;&nbsp;");
      const parts3: string[] = [];
      if (patient.patientId)
        parts3.push(`PatientID: ${escHtml(patient.patientId)}`);
      if (patient.startDate)
        parts3.push(`Start: ${escHtml(patient.startDate)}`);
      if (patient.contract)
        parts3.push(`Contract: ${escHtml(patient.contract)}`);
      if (patient.location) parts3.push(`Loc: ${escHtml(patient.location)}`);
      if (patient.branch) parts3.push(`Branch: ${escHtml(patient.branch)}`);
      if (patient.disciplines)
        parts3.push(`Disc: ${escHtml(patient.disciplines)}`);
      line3 = parts3.join("&nbsp;&nbsp;");
      matchCode = patient.admissionId;
    }

    // Check if this record matches current selection
    const isSelected =
      currentSel !== null &&
      currentSel.fullName === rec.fullName &&
      (isAide
        ? (currentSel as SelectedCaregiver).caregiverCode === matchCode
        : (currentSel as SelectedPatient).admissionId === matchCode);

    if (isSelected) card.classList.add("selected");

    const selectBtn = document.createElement("button");
    selectBtn.className =
      "ea-card-select-btn" + (isSelected ? " selected-btn" : "");
    selectBtn.textContent = isSelected ? "✓ 已选" : "选择";
    selectBtn.disabled = isSelected;
    selectBtn.type = "button";

    card.innerHTML = `
      <div class="ea-avatar" style="background:${avatarColor}">${initial}</div>
      <div class="ea-card-info">
        <div class="ea-card-line1">${line1}</div>
        <div class="ea-card-line2">${line2}</div>
        ${line3 ? `<div class="ea-card-line3">${line3}</div>` : ""}
      </div>
    `;
    card.appendChild(selectBtn);
    listEl.appendChild(card);

    // Scroll selected card into view
    if (isSelected) {
      setTimeout(() => card.scrollIntoView({ block: "nearest" }), 0);
    }

    selectBtn.addEventListener("click", () => {
      // Reset all cards
      listEl.querySelectorAll<HTMLElement>(".ea-result-card").forEach((c) => {
        c.classList.remove("selected");
        const btn = c.querySelector<HTMLButtonElement>(".ea-card-select-btn");
        if (btn) {
          btn.textContent = "选择";
          btn.disabled = false;
          btn.classList.remove("selected-btn");
        }
      });

      // Mark this card selected
      card.classList.add("selected");
      selectBtn.textContent = "✓ 已选";
      selectBtn.disabled = true;
      selectBtn.classList.add("selected-btn");

      // Update wizard state
      state.isDirty = true;
      if (isAide) {
        const aide = rec as AideRecord;
        state.caregiver = {
          fullName: aide.fullName,
          caregiverCode: aide.caregiverCode,
          lastName: aide.lastName,
          firstName: aide.firstName,
        };
      } else {
        const patient = rec as PatientRecord;
        state.patient = {
          fullName: patient.fullName,
          admissionId: patient.admissionId,
        };
      }

      updateSelBar();
      // Refresh footer next button
      rerenderAll();
      // After rerender, re-scroll to keep result list visible (rerender replaces the DOM)
    });
  });
}

// ─── Date Step ────────────────────────────────────────────────────────────────

function renderDateStep(
  parent: HTMLElement,
  state: WizardState,
  rerenderShell: () => void
): void {
  const section = document.createElement("div");
  section.className = "ea-date-section";

  const title = document.createElement("div");
  title.className = "ea-date-title";
  title.textContent = "选择护理员激活日期";
  section.appendChild(title);

  const shortcuts = document.createElement("div");
  shortcuts.className = "ea-date-shortcuts";

  const toDateInputValue = (d: Date): string => {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  };
  const toDisplayDate = (d: Date): string => {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}/${dd}/${d.getFullYear()}`;
  };

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.className = "ea-date-input";
  // Pre-fill from state
  if (state.activationDate) {
    // Convert MM/DD/YYYY → YYYY-MM-DD
    const parts = state.activationDate.split("/");
    if (parts.length === 3)
      dateInput.value = `${parts[2]}-${parts[0]}-${parts[1]}`;
  }

  dateInput.addEventListener("change", () => {
    if (dateInput.value) {
      const [yyyy, mm, dd] = dateInput.value.split("-");
      state.activationDate = `${mm}/${dd}/${yyyy}`;
      state.isDirty = true;
    } else {
      state.activationDate = null;
    }
    state.bodyHtml = null; // date changed — regenerate body on next step 4 visit
    rerenderShell();
  });

  const makeSC = (label: string, offsetDays: number) => {
    const btn = document.createElement("button");
    btn.className = "ea-btn";
    btn.textContent = label;
    btn.type = "button";
    btn.addEventListener("click", () => {
      const d = new Date();
      d.setDate(d.getDate() + offsetDays);
      dateInput.value = toDateInputValue(d);
      state.activationDate = toDisplayDate(d);
      state.isDirty = true;
      state.bodyHtml = null; // date changed — regenerate body on next step 4 visit
      rerenderShell();
    });
    return btn;
  };

  shortcuts.appendChild(makeSC("今天", 0));
  shortcuts.appendChild(makeSC("明天", 1));
  const dateRow = document.createElement("div");
  dateRow.className = "ea-date-row";
  dateRow.appendChild(shortcuts);
  dateRow.appendChild(dateInput);
  section.appendChild(dateRow);
  parent.appendChild(section);
}

// ─── Preview Step ─────────────────────────────────────────────────────────────

function renderPreviewStep(
  parent: HTMLElement,
  state: WizardState,
  rerenderAll: () => void
): void {
  const cfg = loadEaConfig();
  const groups = cfg.recipientGroups;

  // Find selected group
  const selectedGroup = state.selectedGroupId
    ? groups.find((g) => g.id === state.selectedGroupId) ?? null
    : null;

  const greeting = selectedGroup?.greeting ?? "";
  const cg = state.caregiver;
  const pt = state.patient;
  const cDate = state.activationDate ?? "";

  // Build initial body content (only if not already set)
  const ptName = pt
    ? pt.fullName.replace(/\s*View\s+Patient\s+Details\b.*/i, "").trim()
    : "";
  const bodyPrefill = [
    `Hello ${greeting},`,
    ``,
    `Please ACTIVATE the aide registered once orientation complete on`,
    `${cg ? cg.fullName + " " + cg.caregiverCode : ""}`,
    ``,
    `The aide will be assigned to below case on ${cDate}`,
    `${ptName ? ptName + " " + (pt?.admissionId ?? "") : ""}`,
  ].join("\n");

  const subjectPrefill = cg
    ? `Employment Activation Request / ${cg.lastName} ${cg.firstName} ${cg.caregiverCode}`
    : "Employment Activation Request";

  const section = document.createElement("div");
  section.className = "ea-step4-section";

  // ── Recipient Group Selection ──
  const groupHeader = document.createElement("div");
  groupHeader.className = "ea-group-header";
  groupHeader.innerHTML = `<span class="ea-group-label">选择收件组</span>`;
  const gearBtn = document.createElement("button");
  gearBtn.className = "ea-gear-btn";
  gearBtn.type = "button";
  gearBtn.textContent = "⚙️ 管理收件组";
  gearBtn.addEventListener("click", () => {
    const editorEl = document.querySelector<HTMLElement>("#ea-body-editor");
    if (editorEl) state.bodyHtml = editorEl.innerHTML;
    openManageGroupsModal(state, () => rerenderAll());
  });
  groupHeader.appendChild(gearBtn);
  section.appendChild(groupHeader);

  const chipsRow = document.createElement("div");
  chipsRow.className = "ea-group-chips";
  if (groups.length === 0) {
    chipsRow.innerHTML = `<span class="ea-group-empty">暂无收件组，请点击 ⚙️ 添加</span>`;
  } else {
    groups.forEach((g) => {
      const chip = document.createElement("button");
      chip.className =
        "ea-group-chip" + (state.selectedGroupId === g.id ? " active" : "");
      chip.type = "button";
      chip.textContent = g.name;
      chip.addEventListener("click", () => {
        const prevGroupId = state.selectedGroupId;
        state.selectedGroupId = prevGroupId === g.id ? null : g.id;
        // Reset body so it regenerates with the new group's greeting
        state.bodyHtml = null;
        state.skipBodySave = true; // prevent renderBody from overwriting the null
        rerenderAll();
      });
      chipsRow.appendChild(chip);
    });
  }
  section.appendChild(chipsRow);

  // ── To / CC editable rows ──
  const makeRecipientRow = (
    labelText: string,
    storageKey: "to" | "cc",
    initialVal: string
  ) => {
    const row = document.createElement("div");
    row.className = "ea-subject-row";
    const lbl = document.createElement("span");
    lbl.className = "ea-subject-label";
    lbl.textContent = labelText;
    const inp = document.createElement("input");
    inp.type = "text";
    inp.className = "ea-subject-input";
    inp.id = `ea-rcpt-${storageKey}`;
    const existingInp = document.querySelector<HTMLInputElement>(
      `#ea-rcpt-${storageKey}`
    );
    inp.value = existingInp ? existingInp.value : initialVal;
    inp.placeholder =
      storageKey === "to" ? "收件人邮箱，多个用逗号分隔" : "抄送邮箱（可选）";
    inp.addEventListener("input", () => {
      state.isDirty = true;
    });
    row.appendChild(lbl);
    row.appendChild(inp);
    return { row, inp };
  };

  const toInitial = selectedGroup ? selectedGroup.to.join(", ") : "";
  const ccInitial = selectedGroup ? selectedGroup.cc.join(", ") : "";
  const { row: toRow, inp: toInput } = makeRecipientRow(
    "收件人(To):",
    "to",
    toInitial
  );
  const { row: ccRow, inp: ccInput } = makeRecipientRow(
    "抄送(CC):",
    "cc",
    ccInitial
  );

  // When a new group chip is selected the inputs should update (only if user hasn't edited them)
  section.appendChild(toRow);
  section.appendChild(ccRow);

  // ── Subject ──
  const subjRow = document.createElement("div");
  subjRow.className = "ea-subject-row";
  const subjLabel = document.createElement("span");
  subjLabel.className = "ea-subject-label";
  subjLabel.textContent = "主题(Subject):";
  const subjInput = document.createElement("input");
  subjInput.type = "text";
  subjInput.className = "ea-subject-input";

  // Preserve subject across rerenders via dataset
  const existingSubjInput =
    document.querySelector<HTMLInputElement>("#ea-subject-input");
  subjInput.id = "ea-subject-input";
  subjInput.value = existingSubjInput
    ? existingSubjInput.value
    : subjectPrefill;
  subjInput.addEventListener("input", () => {
    state.isDirty = true;
  });
  subjRow.appendChild(subjLabel);
  subjRow.appendChild(subjInput);
  section.appendChild(subjRow);

  // ── Body ──
  const bodyLabel = document.createElement("div");
  bodyLabel.className = "ea-body-label";
  bodyLabel.textContent = "邮件正文:";
  section.appendChild(bodyLabel);

  // Compute initial HTML before creating the textarea so we can pre-set .value.
  // TinyMCE 5 reads textarea.value during init as the editor's initial content —
  // this is the canonical approach and is more reliable than editor.on('init', setContent).
  const initBodyHtml =
    state.bodyHtml ??
    bodyPrefill
      .split("\n")
      .map((line) =>
        line.trim() ? `<p>${escHtml(line)}</p>` : "<p>&nbsp;</p>"
      )
      .join("");

  const editorSection = document.createElement("div");
  editorSection.className = "ea-editor-section";
  const editorToolbar = document.createElement("div");
  editorToolbar.className = "ea-editor-toolbar";
  editorToolbar.innerHTML = `
    <button type="button" data-cmd="bold" title="粗体"><b>B</b></button>
    <button type="button" data-cmd="italic" title="斜体"><i>I</i></button>
    <button type="button" data-cmd="underline" title="下划线"><u>U</u></button>
    <button type="button" data-cmd="strikeThrough" title="删除线"><s>S</s></button>
    <button type="button" data-cmd="insertUnorderedList" title="无序列表">≡</button>
    <button type="button" data-cmd="insertOrderedList" title="有序列表">⒈</button>
    <button type="button" id="ea-link-btn" title="插入链接">🔗</button>
    <button type="button" data-cmd="removeFormat" title="清除格式">✕</button>
  `;
  const bodyEditor = document.createElement("div");
  bodyEditor.id = "ea-body-editor";
  bodyEditor.className = "ea-rich-editor";
  bodyEditor.contentEditable = "true";
  bodyEditor.innerHTML = initBodyHtml;
  editorSection.appendChild(editorToolbar);
  editorSection.appendChild(bodyEditor);
  section.appendChild(editorSection);

  parent.appendChild(section);

  editorToolbar
    .querySelectorAll<HTMLButtonElement>("[data-cmd]")
    .forEach((btn) => {
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        document.execCommand(btn.dataset.cmd as string, false);
      });
    });
  editorToolbar
    .querySelector("#ea-link-btn")
    ?.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const url = prompt("请输入链接 URL:");
      if (url) document.execCommand("createLink", false, url);
      bodyEditor.focus();
    });
  bodyEditor.addEventListener("input", () => {
    state.isDirty = true;
  });

  // ── Send Button — inject into footer right slot ──
  const doSendFromStep4 = () => {
    const subject = subjInput.value.trim();
    const body =
      document.querySelector<HTMLElement>("#ea-body-editor")?.innerHTML || "";
    const to = toInput.value.trim();
    const cc = ccInput.value.trim();
    if (!to) {
      showConfirmDialog(
        "⚠️ 收件人为空，邮件将无收件人。是否仍要发送到 Outlook？",
        "取消",
        "仍要发送",
        () => doSend("", cc, subject, body)
      );
    } else {
      doSend(to, cc, subject, body);
    }
  };

  const footerRight = document.querySelector<HTMLElement>(
    "#ea-footer .ea-footer-right"
  );
  if (footerRight) {
    footerRight.innerHTML = "";
    const sendBtnFooter = document.createElement("button");
    sendBtnFooter.className = "ea-btn ea-btn-primary";
    sendBtnFooter.type = "button";
    sendBtnFooter.textContent = "Outlook";
    sendBtnFooter.addEventListener("click", doSendFromStep4);
    footerRight.appendChild(sendBtnFooter);
  }
}

function doSend(to: string, cc: string, subject: string, body: string): void {
  MailService.sendMailTask({ to, cc, subject, body });
  showToast("已发送到 Outlook ✓");
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function showConfirmDialog(
  message: string,
  cancelLabel: string,
  confirmLabel: string,
  onConfirm: () => void
): void {
  const existing = document.getElementById("ea-confirm-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "ea-confirm-overlay";
  overlay.id = "ea-confirm-overlay";
  overlay.innerHTML = `
    <div class="ea-confirm-box">
      <div class="ea-confirm-msg">${escHtml(message)}</div>
      <div class="ea-confirm-actions">
        <button class="ea-btn" id="ea-confirm-cancel">${escHtml(
          cancelLabel
        )}</button>
        <button class="ea-btn ea-btn-primary" id="ea-confirm-ok">${escHtml(
          confirmLabel
        )}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay
    .querySelector("#ea-confirm-cancel")!
    .addEventListener("click", () => overlay.remove());
  overlay.querySelector("#ea-confirm-ok")!.addEventListener("click", () => {
    overlay.remove();
    onConfirm();
  });
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(message: string): void {
  document.querySelectorAll(".ea-toast").forEach((el) => el.remove());
  const toast = document.createElement("div");
  toast.className = "ea-toast";
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

// ─── Manage Groups Modal ──────────────────────────────────────────────────────

function openManageGroupsModal(state: WizardState, onClose: () => void): void {
  const existing = document.getElementById("ea-mgr-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "ea-mgr-overlay";
  overlay.id = "ea-mgr-overlay";

  const box = document.createElement("div");
  box.className = "ea-mgr-container";

  const header = document.createElement("div");
  header.className = "ea-mgr-header";
  header.innerHTML = `
    <h3 class="ea-mgr-title">管理收件组</h3>
    <button class="ea-close-btn" id="ea-mgr-close">&times;</button>
  `;

  const body = document.createElement("div");
  body.className = "ea-mgr-body";
  body.id = "ea-mgr-body";

  const footer = document.createElement("div");
  footer.className = "ea-mgr-footer";

  const addBtn = document.createElement("button");
  addBtn.className = "ea-btn ea-btn-primary";
  addBtn.type = "button";
  addBtn.id = "ea-mgr-add-btn";
  addBtn.textContent = "+ 添加收件组";
  footer.appendChild(addBtn);

  box.appendChild(header);
  box.appendChild(body);
  box.appendChild(footer);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const closeModal = () => {
    overlay.remove();
    onClose();
  };
  header.querySelector("#ea-mgr-close")!.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  let editingId: string | null = null;
  let showingAddForm = false;

  const addFormId = "ea-mgr-add-form";

  const renderList = () => {
    body.innerHTML = "";
    const cfg = loadEaConfig();
    const groups = cfg.recipientGroups;

    if (groups.length === 0) {
      body.innerHTML = `<div class="ea-mgr-empty">暂无收件组，请点击添加</div>`;
    } else {
      groups.forEach((grp) => {
        const row = document.createElement("div");
        row.className = "ea-mgr-group-row";
        row.dataset.id = grp.id;
        row.innerHTML = `
          <div class="ea-mgr-group-info">
            <div class="ea-mgr-group-name">${escHtml(grp.name)}</div>
            <div class="ea-mgr-group-greeting">Hello ${escHtml(
              grp.greeting
            )}</div>
          </div>
          <div class="ea-mgr-group-actions">
            <button type="button" class="ea-mgr-edit-btn">编辑</button>
            <button type="button" class="ea-mgr-delete-btn">删除</button>
          </div>
        `;

        const editBtnEl =
          row.querySelector<HTMLButtonElement>(".ea-mgr-edit-btn")!;
        const deleteBtnEl =
          row.querySelector<HTMLButtonElement>(".ea-mgr-delete-btn")!;

        editBtnEl.addEventListener("click", () => {
          if (editingId === grp.id) {
            // Collapse
            editingId = null;
            renderList();
            return;
          }
          editingId = grp.id;
          showingAddForm = false;
          renderList();
        });

        deleteBtnEl.addEventListener("click", () => {
          // Inline confirm
          const existing = row.querySelector(".ea-mgr-inline-confirm");
          if (existing) {
            existing.remove();
            return;
          }
          const confirmEl = document.createElement("div");
          confirmEl.className = "ea-mgr-inline-confirm";
          confirmEl.innerHTML = `
            <span>确认删除「${escHtml(grp.name)}」？</span>
            <button type="button" class="ea-btn" id="del-cancel">取消</button>
            <button type="button" class="ea-btn ea-btn-primary" id="del-confirm">删除</button>
          `;
          row.appendChild(confirmEl);
          confirmEl
            .querySelector("#del-cancel")!
            .addEventListener("click", () => confirmEl.remove());
          confirmEl
            .querySelector("#del-confirm")!
            .addEventListener("click", () => {
              const c = loadEaConfig();
              c.recipientGroups = c.recipientGroups.filter(
                (g) => g.id !== grp.id
              );
              if (state.selectedGroupId === grp.id)
                state.selectedGroupId = null;
              saveEaConfig(c);
              if (editingId === grp.id) editingId = null;
              renderList();
            });
        });

        body.appendChild(row);

        // Render inline edit form if this group is being edited
        if (editingId === grp.id) {
          const form = buildGroupForm(
            grp,
            (updated) => {
              const c = loadEaConfig();
              const idx = c.recipientGroups.findIndex((g) => g.id === grp.id);
              if (idx >= 0) c.recipientGroups[idx] = updated;
              saveEaConfig(c);
              editingId = null;
              renderList();
            },
            () => {
              editingId = null;
              renderList();
            }
          );
          body.appendChild(form);
        }
      });
    }

    // Render add form if open
    if (showingAddForm) {
      const form = buildGroupForm(
        null,
        (newGrp) => {
          const c = loadEaConfig();
          c.recipientGroups.push(newGrp);
          saveEaConfig(c);
          showingAddForm = false;
          renderList();
        },
        () => {
          showingAddForm = false;
          renderList();
        }
      );
      form.id = addFormId;
      body.appendChild(form);
    }

    // Update add button state
    const cfg2 = loadEaConfig();
    addBtn.disabled = cfg2.recipientGroups.length >= 10;
    addBtn.title =
      cfg2.recipientGroups.length >= 10 ? "最多支持 10 个收件组" : "";
    if (cfg2.recipientGroups.length >= 10) {
      const tip = document.createElement("span");
      tip.className = "ea-mgr-limit-tip";
      tip.textContent = "最多支持 10 个收件组";
      footer.insertBefore(tip, addBtn.nextSibling);
    }
  };

  addBtn.addEventListener("click", () => {
    const cfg = loadEaConfig();
    if (cfg.recipientGroups.length >= 10) return;
    showingAddForm = !showingAddForm;
    editingId = null;
    renderList();
  });

  renderList();
}

// ─── Group Form Builder ───────────────────────────────────────────────────────

function buildGroupForm(
  existing: RecipientGroup | null,
  onSave: (grp: RecipientGroup) => void,
  onCancel: () => void
): HTMLElement {
  const form = document.createElement("div");
  form.className = "ea-mgr-group-form";

  const makeRow = (
    label: string,
    id: string,
    placeholder: string,
    value: string,
    required: boolean
  ) => {
    const row = document.createElement("div");
    row.className = "ea-mgr-form-row";
    const lbl = document.createElement("label");
    lbl.htmlFor = id;
    lbl.textContent = required ? `${label} *` : label;
    const input = document.createElement("input");
    input.type = "text";
    input.id = id;
    input.placeholder = placeholder;
    input.value = value;
    const errEl = document.createElement("div");
    errEl.className = "ea-mgr-form-error";
    errEl.id = `${id}-err`;
    row.appendChild(lbl);
    row.appendChild(input);
    row.appendChild(errEl);
    form.appendChild(row);
  };

  makeRow("配置名", "fg-name", "如：HR Liz", existing?.name ?? "", true);
  makeRow(
    "称呼 (Greeting)",
    "fg-greeting",
    "如：Liz",
    existing?.greeting ?? "",
    true
  );
  makeRow(
    "To 地址（多个用逗号分隔）",
    "fg-to",
    "email@example.com, ...",
    existing?.to.join(", ") ?? "",
    true
  );
  makeRow(
    "CC 地址（选填）",
    "fg-cc",
    "email@example.com, ...",
    existing?.cc.join(", ") ?? "",
    false
  );

  const actions = document.createElement("div");
  actions.className = "ea-mgr-form-actions";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "ea-btn";
  cancelBtn.textContent = "取消";
  cancelBtn.addEventListener("click", onCancel);

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "ea-btn ea-btn-primary";
  saveBtn.textContent = "保存";
  saveBtn.addEventListener("click", () => {
    const nameVal = (
      form.querySelector<HTMLInputElement>("#fg-name")!.value ?? ""
    ).trim();
    const greetingVal = (
      form.querySelector<HTMLInputElement>("#fg-greeting")!.value ?? ""
    ).trim();
    const toVal = (
      form.querySelector<HTMLInputElement>("#fg-to")!.value ?? ""
    ).trim();
    const ccVal = (
      form.querySelector<HTMLInputElement>("#fg-cc")!.value ?? ""
    ).trim();

    let valid = true;

    const setErr = (id: string, msg: string) => {
      const el = form.querySelector<HTMLElement>(`#${id}-err`);
      if (el) {
        el.textContent = msg;
        el.style.display = msg ? "block" : "none";
      }
    };

    setErr("fg-name", nameVal ? "" : "请填写配置名");
    if (!nameVal) valid = false;

    setErr("fg-greeting", greetingVal ? "" : "请填写称呼");
    if (!greetingVal) valid = false;

    const toAddresses = toVal
      .split(/[,;]/)
      .map((a) => a.trim())
      .filter(Boolean);
    if (toAddresses.length === 0) {
      setErr("fg-to", "请至少填写一个 To 地址");
      valid = false;
    } else if (toAddresses.some((a) => !a.includes("@"))) {
      setErr("fg-to", "To 地址格式不正确，请检查（每个地址需包含 @）");
      valid = false;
    } else {
      setErr("fg-to", "");
    }

    if (!valid) return;

    const ccAddresses = ccVal
      ? ccVal
          .split(/[,;]/)
          .map((a) => a.trim())
          .filter(Boolean)
      : [];

    const grp: RecipientGroup = {
      id: existing?.id ?? `grp_${Date.now()}`,
      name: nameVal,
      greeting: greetingVal,
      to: toAddresses,
      cc: ccAddresses,
    };

    onSave(grp);
  });

  actions.appendChild(cancelBtn);
  actions.appendChild(saveBtn);
  form.appendChild(actions);
  return form;
}
