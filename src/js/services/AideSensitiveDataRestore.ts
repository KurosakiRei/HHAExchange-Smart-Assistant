/**
 * Epic 24 (Story 24-1): Aide 档案页 DOB/SSN 显示恢复
 *
 * 背景：HHA 对无 SSN/DOB 查看权限的账号主动掩码（uxHidIsAccessSSNOrBirthDate=False），
 * 但真实值已随页面下发至隐藏字段：
 *   - DOB: #uxHfDtDOB / #hidprevDOB（MM/DD/YYYY）
 *   - SSN: #uxHfSSN / #hidprevSSN（NNN-NN-NNNN）
 * 本模块在页面内做零网络纯 DOM 还原，覆盖三个可见显示位与两个编辑态控件：
 *   - 左栏信息区 DOB:  #ctl00_ContentPlaceHolder1_uxlblInfoDOB（SPAN）
 *   - Demographics DOB: #uxLblPDOB（SPAN）
 *   - Demographics SSN: #uxLblPSSN（SPAN）
 *   - 编辑态 DOB:      #uxDtDOB（type=date，需 YYYY-MM-DD）
 *   - 编辑态 SSN:      #uxTxtSSN（text input，readonly）
 *
 * 设计约束：
 *   - 按窗口作用域 + 幂等（每个 window 一个初始化标记）
 *   - MutationObserver + debounce 覆盖 UpdatePanel 回发 / 切 Tab / 重渲染
 *   - 仅在命中掩码时替换，格式校验兜底，静默降级
 *   - Tampermonkey 开关 hha_restore_aide_sensitive_data（默认 true）
 */

const STORAGE_KEY = "hha_restore_aide_sensitive_data";
const INIT_FLAG_KEY = "__HHA_AIDE_SENSITIVE_RESTORED_FLAG__";
const RESTORED_ATTR = "data-hha-sensitive-restored";
const OBSERVE_DEBOUNCE_MS = 80;

const DOB_MASK_RE = /^X{2}\/X{2}\/X{4}$/i;
const SSN_MASK_RE = /^X{3}-X{2}-\d{4}$/i;
const DOB_VALUE_RE = /^\d{2}\/\d{2}\/\d{4}$/;
const SSN_VALUE_RE = /^\d{3}-\d{2}-\d{4}$/;

/**
 * 功能开关：GM_getValue 读取，默认开启；读取异常时按开启处理（不阻断已有行为）。
 */
export function isFeatureEnabled(): boolean {
  try {
    return GM_getValue<boolean>(STORAGE_KEY, true) !== false;
  } catch {
    return true;
  }
}

export function isDobMasked(text: string): boolean {
  return DOB_MASK_RE.test(text.trim());
}

export function isSsnMasked(text: string): boolean {
  return SSN_MASK_RE.test(text.trim());
}

export function isValidDob(value: string): boolean {
  return DOB_VALUE_RE.test(value.trim());
}

export function isValidSsn(value: string): boolean {
  return SSN_VALUE_RE.test(value.trim());
}

/**
 * MM/DD/YYYY → YYYY-MM-DD（date input 专用）；非法输入返回 null。
 */
export function dobToDateInputValue(dob: string): string | null {
  const m = dob.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[1]}-${m[2]}`;
}

/**
 * 按 id 顺序读取第一个通过校验的非空隐藏字段值。
 */
function readFirstValidValue(
  ids: string[],
  validator: (value: string) => boolean
): string {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    const raw =
      el instanceof HTMLInputElement
        ? el.value
        : el.getAttribute("value") ?? "";
    const v = (raw ?? "").trim();
    if (v && validator(v)) return v;
  }
  return "";
}

function isVisible(el: HTMLElement): boolean {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden";
}

/**
 * 仅当元素当前文本命中掩码正则时替换为真实值；幂等（已恢复则跳过）。
 */
function setTextIfMasked(
  el: HTMLElement | null,
  real: string,
  maskRe: RegExp
): void {
  if (!el || !real) return;
  const current = (el.textContent ?? "").trim();
  if (!maskRe.test(current) || current === real) return;
  el.textContent = real;
  el.setAttribute(RESTORED_ATTR, "1");
}

/**
 * 单次还原：读取隐藏字段真实值 → 写回所有显示位与编辑态控件。
 * 任何元素缺失/格式不合法时静默跳过，绝不写入空值或脏值。
 */
export function applyAideSensitiveDataRestore(): void {
  const realDob = readFirstValidValue(["uxHfDtDOB", "hidprevDOB"], isValidDob);
  const realSsn = readFirstValidValue(["uxHfSSN", "hidprevSSN"], isValidSsn);

  if (realDob) {
    // 左栏信息区 DOB + Demographics DOB（view 模式 SPAN）
    setTextIfMasked(
      document.getElementById("ctl00_ContentPlaceHolder1_uxlblInfoDOB"),
      realDob,
      DOB_MASK_RE
    );
    setTextIfMasked(document.getElementById("uxLblPDOB"), realDob, DOB_MASK_RE);

    // 编辑态 date input（view 模式下官方隐藏，变为可见时由观察器触发赋值）
    const dobInput = document.getElementById(
      "uxDtDOB"
    ) as HTMLInputElement | null;
    if (dobInput && isVisible(dobInput)) {
      const iso = dobToDateInputValue(realDob);
      if (iso && dobInput.value !== iso) {
        dobInput.value = iso;
        dobInput.setAttribute(RESTORED_ATTR, "1");
      }
    }
  }

  if (realSsn) {
    // Demographics SSN（view 模式 SPAN）
    setTextIfMasked(document.getElementById("uxLblPSSN"), realSsn, SSN_MASK_RE);

    // 编辑态 readonly text input
    const ssnInput = document.getElementById(
      "uxTxtSSN"
    ) as HTMLInputElement | null;
    if (
      ssnInput &&
      isVisible(ssnInput) &&
      ssnInput.value.trim() !== realSsn &&
      SSN_MASK_RE.test(ssnInput.value.trim())
    ) {
      ssnInput.value = realSsn;
      ssnInput.setAttribute(RESTORED_ATTR, "1");
    }
  }
}

/**
 * 初始化（幂等，按窗口作用域）：
 * 1. 仅 Aide_ns.aspx 页面生效；
 * 2. 开关关闭时直接返回；
 * 3. MutationObserver 观察 #aspnetForm（或 body），debounce 后重新应用，
 *    覆盖 UpdatePanel 回发、切 Tab、编辑态切换等官方重渲染。
 */
export function initAideSensitiveDataRestore(): void {
  if (!window.location.href.toLowerCase().includes("aide_ns.aspx")) return;
  if (!isFeatureEnabled()) return;
  if ((window as any)[INIT_FLAG_KEY]) return;
  (window as any)[INIT_FLAG_KEY] = true;

  applyAideSensitiveDataRestore();

  let timer: number | null = null;
  const schedule = (): void => {
    if (timer !== null) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = null;
      applyAideSensitiveDataRestore();
    }, OBSERVE_DEBOUNCE_MS);
  };

  const target = document.getElementById("aspnetForm") ?? document.body;
  if (!target) return;

  const observer = new MutationObserver(schedule);
  observer.observe(target, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });
}
