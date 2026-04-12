import { BaseTab } from "./BaseTab";
import {
  fetchAllPages,
  displayCombinedResults,
  displaySingleResult,
  HhaQuickSearchParams,
} from "../services/HhaSearchService";

export class QuickSearchTab extends BaseTab {
  id = "quick-search";
  label = "\u5feb\u901f\u641c\u7d22";
  icon = "\uD83D\uDD0D";

  private isSearching = false;

  async init(): Promise<void> {
    this.initialized = true;
  }

  render(container: HTMLElement): void {
    this.container = container;
    container.innerHTML = "";
    container.style.cssText =
      "height:100%;display:flex;flex-direction:column;overflow:hidden;padding:0;box-sizing:border-box;";

    // ── Styles ─────────────────────────────────────────────────────────────────────────────────
    const style = document.createElement("style");
    style.textContent = `
      .qs-wrapper {
        flex: 1; display: flex; flex-direction: column; overflow: hidden;
      }
      .qs-header {
        display: flex; align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #e0e0e0;
        background: #fafbfc;
        flex-shrink: 0;
      }
      .qs-title {
        margin: 0; font-size: 15px; font-weight: 600; color: #333;
      }
      .qs-body {
        flex: 1; overflow-y: auto; overflow-x: hidden; position: relative;
        overscroll-behavior: contain; padding: 12px 14px;
      }
      /* 2-col row */
      .qs-row-2col {
        display: flex; gap: 10px; margin-bottom: 8px;
      }
      .qs-col {
        display: flex; align-items: center; gap: 5px; min-width: 0;
      }
      .qs-col.wide   { flex: 3; }
      .qs-col.narrow { flex: 2; }
      .qs-col.half   { flex: 1; }
      .qs-col > label {
        width: 26px; font-size: 12px; color: #555;
        white-space: nowrap; flex-shrink: 0;
        margin: 0 !important; padding: 0 !important;
      }
      /* input wrap */
      .qs-input-wrap {
        position: relative; flex: 1; min-width: 0;
        display: flex; align-items: center;
      }
      .qs-input-wrap input {
        flex: 1; min-width: 0; box-sizing: border-box;
        margin: 0 !important;
        padding: 5px 26px 5px 7px;
        border: 1px solid #ccc; border-radius: 4px; font-size: 12px;
      }
      .qs-input-wrap input:focus {
        outline: none; border-color: #0d3e61;
      }
      .qs-clear-btn {
        all: unset; box-sizing: border-box;
        position: absolute; right: 0; top: 0; bottom: 0;
        display: flex; align-items: center; justify-content: center;
        width: 22px; cursor: pointer;
        color: #bbb; font-size: 12px;
      }
      .qs-clear-btn:hover { color: #555; }
      /* info icon */
      .qs-info-icon {
        cursor: help; font-size: 13px; flex-shrink: 0; margin-left: 2px;
      }
      /* tooltip rendered via fixed position JS */
      .qs-tooltip-popup {
        position: fixed; background: #333; color: #fff;
        font-size: 11px; padding: 5px 8px; border-radius: 4px;
        z-index: 2147483647; white-space: normal; line-height: 1.4;
        width: 200px; pointer-events: none; display: none;
      }
      /* advanced section */
      .qs-advanced-section {
        margin-bottom: 8px; border: 1px solid #e0e0e0;
        border-radius: 4px; overflow: hidden;
      }
      .qs-advanced-summary {
        padding: 6px 10px; background: #f5f7fa;
        cursor: pointer; font-size: 12px; color: #444;
        user-select: none; list-style: none;
      }
      .qs-advanced-summary::-webkit-details-marker { display: none; }
      .qs-advanced-content {
        padding: 8px 10px; border-top: 1px solid #e0e0e0;
      }
      .qs-group-label {
        font-size: 11px; font-weight: 600; color: #0d3e61;
        text-transform: uppercase; letter-spacing: 0.5px; margin: 4px 0 6px;
      }
      .qs-adv-row {
        display: flex; align-items: center; gap: 6px; margin-bottom: 6px;
      }
      .qs-adv-row > label {
        width: 58px; font-size: 12px; color: #555;
        white-space: nowrap; overflow: hidden;
        text-overflow: ellipsis; flex-shrink: 0;
      }
      /* conflict / buttons / states */
      .qs-conflict-warning {
        color: #c0392b; font-size: 12px; margin-bottom: 6px; display: none;
      }
      .qs-btn-row { display: flex; gap: 8px; }
      .qs-btn-row .hha-smart-btn { flex: 1; }
      .qs-footer {
        flex-shrink: 0; padding: 8px 14px 12px;
        border-top: 1px solid #e0e0e0; background: #fafbfc;
      }
      .qs-no-result {
        color: #666; font-size: 13px; margin-top: 8px; padding: 8px;
        background: #fef9e7; border-radius: 4px;
        border-left: 3px solid #f39c12; display: none;
      }
      .qs-loading {
        display: none; position: absolute; inset: 0; z-index: 10;
        background: rgba(255,255,255,0.85);
        align-items: center; justify-content: center;
      }
      .qs-spinner {
        width: 26px; height: 26px; border: 3px solid #e0e0e0;
        border-top-color: #0d3e61; border-radius: 50%;
        animation: qs-spin 0.8s linear infinite; margin: 0 auto;
      }
      @keyframes qs-spin { to { transform: rotate(360deg); } }
    `;
    container.appendChild(style);

    // ── Tooltip popup (singleton on document.body) ────────────────────────────────────────────
    const TOOLTIP_ID = "qs-global-tooltip";
    let tooltipPopup = document.getElementById(
      TOOLTIP_ID
    ) as HTMLDivElement | null;
    if (!tooltipPopup) {
      tooltipPopup = document.createElement("div");
      tooltipPopup.id = TOOLTIP_ID;
      tooltipPopup.className = "qs-tooltip-popup";
      tooltipPopup.textContent =
        "Caregiver: Caregiver Code；Patient: Admission ID (MR Number)";
      document.body.appendChild(tooltipPopup);
    }

    // ── Wrapper + Header ────────────────────────────────────────────────────────────────────────
    const wrapper = document.createElement("div");
    wrapper.className = "qs-wrapper";

    const header = document.createElement("div");
    header.className = "qs-header";
    const title = document.createElement("h3");
    title.className = "qs-title";
    title.textContent = "🔍 快速搜索";
    header.appendChild(title);
    wrapper.appendChild(header);

    const body = document.createElement("div");
    body.className = "qs-body";
    wrapper.appendChild(body);
    const footer = document.createElement("div");
    footer.className = "qs-footer";
    wrapper.appendChild(footer);
    container.appendChild(wrapper);

    // ── Helpers ───────────────────────────────────────────────────────────────────────────────────
    const makeInputWrap = (input: HTMLInputElement): HTMLElement => {
      const wrap = document.createElement("div");
      wrap.className = "qs-input-wrap";
      wrap.appendChild(input);
      const clear = document.createElement("button");
      clear.className = "qs-clear-btn";
      clear.type = "button";
      clear.textContent = "✕";
      clear.title = "清空";
      clear.addEventListener("click", () => {
        input.value = "";
        input.focus();
        validateConflict();
      });
      wrap.appendChild(clear);
      return wrap;
    };

    const makeInput = (placeholder: string): HTMLInputElement => {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.placeholder = placeholder;
      inp.addEventListener("input", () => validateConflict());
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doSearch();
      });
      return inp;
    };

    const makeCol = (
      labelText: string,
      input: HTMLInputElement,
      colClass = "half"
    ): HTMLElement => {
      const col = document.createElement("div");
      col.className = `qs-col ${colClass}`;
      const lbl = document.createElement("label");
      lbl.textContent = labelText;
      col.appendChild(lbl);
      col.appendChild(makeInputWrap(input));
      return col;
    };

    // ── Row 1: 姓 + 名 ──────────────────────────────────────────────────────────────────────────
    const lastNameInput = makeInput("请输入 Last name");
    const firstNameInput = makeInput("请输入 First name");
    const row1 = document.createElement("div");
    row1.className = "qs-row-2col";
    row1.appendChild(makeCol("姓", lastNameInput));
    row1.appendChild(makeCol("名", firstNameInput));
    body.appendChild(row1);

    // ── Row 2: 电话(wide) + ID(narrow) + ℹ️ ────────────────────────────────────────────────────
    const phoneInput = makeInput("请输入电话");
    const idInput = makeInput("请输入 ID");
    const row2 = document.createElement("div");
    row2.className = "qs-row-2col";

    const colId = document.createElement("div");
    colId.className = "qs-col narrow";
    const lblId = document.createElement("label");
    lblId.textContent = "ID";
    colId.appendChild(lblId);
    colId.appendChild(makeInputWrap(idInput));

    const infoIcon = document.createElement("span");
    infoIcon.className = "qs-info-icon";
    infoIcon.textContent = "ℹ️";
    infoIcon.addEventListener("mouseenter", () => {
      const r = infoIcon.getBoundingClientRect();
      tooltipPopup!.style.left = `${r.right + 6}px`;
      tooltipPopup!.style.top = `${r.top - 4}px`;
      tooltipPopup!.style.display = "block";
    });
    infoIcon.addEventListener("mouseleave", () => {
      tooltipPopup!.style.display = "none";
    });
    colId.appendChild(infoIcon);
    row2.appendChild(colId);
    row2.appendChild(makeCol("电话", phoneInput, "wide"));
    body.appendChild(row2);

    // ── Advanced section ──────────────────────────────────────────────────────────────────────────
    const details = document.createElement("details");
    details.className = "qs-advanced-section";
    const summary = document.createElement("summary");
    summary.className = "qs-advanced-summary";
    summary.textContent = "▶ 高级搜索";
    details.addEventListener("toggle", () => {
      summary.textContent = details.open ? "▼ 高级搜索" : "▶ 高级搜索";
    });
    details.appendChild(summary);

    const advContent = document.createElement("div");
    advContent.className = "qs-advanced-content";

    const makeAdvRow = (
      labelText: string,
      input: HTMLInputElement
    ): HTMLElement => {
      const row = document.createElement("div");
      row.className = "qs-adv-row";
      const lbl = document.createElement("label");
      lbl.textContent = labelText;
      row.appendChild(lbl);
      row.appendChild(makeInputWrap(input));
      return row;
    };

    const cgLbl = document.createElement("div");
    cgLbl.className = "qs-group-label";
    cgLbl.textContent = "Caregiver 独占";
    advContent.appendChild(cgLbl);
    const ssnInput = makeInput("SSN");
    advContent.appendChild(makeAdvRow("SSN", ssnInput));

    const ptLbl = document.createElement("div");
    ptLbl.className = "qs-group-label";
    ptLbl.textContent = "Patient 独占";
    advContent.appendChild(ptLbl);
    const patientIdInput = makeInput("Patient ID");
    const medicaidIdInput = makeInput("Medicaid ID");
    advContent.appendChild(makeAdvRow("PatientID", patientIdInput));
    advContent.appendChild(makeAdvRow("Medicaid", medicaidIdInput));

    details.appendChild(advContent);
    body.appendChild(details);

    // ── Conflict warning ──────────────────────────────────────────────────────────────────────────
    const conflictWarn = document.createElement("div");
    conflictWarn.className = "qs-conflict-warning";
    conflictWarn.textContent = "不能同时输入 Caregiver 和 Patient 的独占字段";
    footer.appendChild(conflictWarn);

    // ── Buttons ───────────────────────────────────────────────────────────────────────────────────
    const btnRow = document.createElement("div");
    btnRow.className = "qs-btn-row";

    const searchBtn = document.createElement("button");
    searchBtn.className = "hha-smart-btn hha-smart-btn-primary";
    searchBtn.textContent = "搜索";
    searchBtn.addEventListener("click", () => doSearch());

    const clearAllBtn = document.createElement("button");
    clearAllBtn.className = "hha-smart-btn hha-smart-btn-secondary";
    clearAllBtn.textContent = "清空";
    clearAllBtn.addEventListener("click", () => {
      [
        lastNameInput,
        firstNameInput,
        phoneInput,
        idInput,
        ssnInput,
        patientIdInput,
        medicaidIdInput,
      ].forEach((inp) => (inp.value = ""));
      conflictWarn.style.display = "none";
      searchBtn.disabled = false;
      noResultDiv.style.display = "none";
    });

    btnRow.appendChild(searchBtn);
    btnRow.appendChild(clearAllBtn);
    footer.appendChild(btnRow);

    // ── Loading ───────────────────────────────────────────────────────────────────────────────────
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "qs-loading";
    const spinner = document.createElement("div");
    spinner.className = "qs-spinner";
    loadingDiv.appendChild(spinner);
    body.appendChild(loadingDiv);

    // ── No-result ────────────────────────────────────────────────────────────────────────────────────
    const noResultDiv = document.createElement("div");
    noResultDiv.className = "qs-no-result";
    noResultDiv.textContent = "未找到匹配的护理员或病人";
    body.appendChild(noResultDiv);

    // ── Validation ────────────────────────────────────────────────────────────────────────────────
    const validateConflict = () => {
      const hasCg = !!ssnInput.value.trim();
      const hasPt = !!(
        patientIdInput.value.trim() || medicaidIdInput.value.trim()
      );
      const conflict = hasCg && hasPt;
      conflictWarn.style.display = conflict ? "block" : "none";
      searchBtn.disabled = conflict;
    };

    [ssnInput, patientIdInput, medicaidIdInput].forEach((inp) => {
      inp.addEventListener("input", validateConflict);
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doSearch();
      });
    });

    // ── Search logic ──────────────────────────────────────────────────────────────────────────────
    const doSearch = async () => {
      if (this.isSearching || searchBtn.disabled) return;

      const params: HhaQuickSearchParams = {
        lastName: lastNameInput.value.trim() || undefined,
        firstName: firstNameInput.value.trim() || undefined,
        phone: phoneInput.value.trim() || undefined,
        id: idInput.value.trim() || undefined,
        ssn: ssnInput.value.trim() || undefined,
        patientId: patientIdInput.value.trim() || undefined,
        medicaidId: medicaidIdInput.value.trim() || undefined,
      };

      const anyFilled = Object.values(params).some((v) => v !== undefined);
      if (!anyFilled) return;

      this.isSearching = true;
      searchBtn.disabled = true;
      searchBtn.textContent = "⏳ 搜索中…";
      loadingDiv.style.display = "flex";
      noResultDiv.style.display = "none";

      try {
        const hasCg = !!params.ssn;
        const hasPt = !!(params.patientId || params.medicaidId);
        let aideResult = null;
        let patientResult = null;

        if (hasCg && !hasPt) {
          aideResult = await fetchAllPages("aide", params);
        } else if (!hasCg && hasPt) {
          patientResult = await fetchAllPages("patient", params);
        } else {
          [aideResult, patientResult] = await Promise.all([
            fetchAllPages("aide", params),
            fetchAllPages("patient", params),
          ]);
        }

        const hasAide = aideResult && aideResult.count > 0;
        const hasPatient = patientResult && patientResult.count > 0;

        if (hasAide && hasPatient && aideResult && patientResult) {
          displayCombinedResults(aideResult, patientResult, "");
        } else if (hasAide && aideResult) {
          displaySingleResult(aideResult, "aide", "");
        } else if (hasPatient && patientResult) {
          displaySingleResult(patientResult, "patient", "");
        } else {
          noResultDiv.style.display = "block";
        }
      } finally {
        this.isSearching = false;
        searchBtn.disabled = false;
        searchBtn.textContent = "搜索";
        loadingDiv.style.display = "none";
      }
    };
  }
}
