/**
 * Epic 18: Search Page Enhancements
 * Injects a "Clear Filters" button next to the Search button on:
 * - CaregiverSearch_ns.aspx
 * - PatientSearchXSLTIFrame_ns.aspx
 *
 * The button clears all text inputs, resets all dropdowns to "All",
 * ensures custom multi-select widgets (Offices, Discipline) are fully selected,
 * and unchecks the "Default Patient" checkbox (patient search only).
 */

interface ClearConfig {
  searchBtnId: string;
  textInputSelectors: string[];
  selectSelectors: string[];
  /** IDs of checkboxes that should be UNCHECKED when clearing */
  uncheckIds?: string[];
}

function injectClearButton(config: ClearConfig): void {
  const searchBtn = document.getElementById(
    config.searchBtnId
  ) as HTMLInputElement | null;
  if (!searchBtn) return;
  if (document.getElementById("hha-clear-filters-btn")) return; // already injected

  const clearBtn = document.createElement("input");
  clearBtn.type = "button";
  clearBtn.value = "Clear Filters";
  clearBtn.id = "hha-clear-filters-btn";
  // Reuse all classes from search button but swap "primary" → "secondary"
  clearBtn.className = searchBtn.className.replace("primary", "secondary");
  clearBtn.style.marginLeft = "8px";

  clearBtn.addEventListener("click", () => {
    // 1. Clear all plain text / date inputs
    config.textInputSelectors.forEach((sel) => {
      const el = document.querySelector(sel) as HTMLInputElement | null;
      if (el) el.value = "";
    });

    // 2. Reset regular <select> elements to first option ("All")
    config.selectSelectors.forEach((sel) => {
      const el = document.querySelector(sel) as HTMLSelectElement | null;
      if (el) el.selectedIndex = 0;
    });

    // 3. Reset custom multi-select widgets (Offices, Discipline):
    //    First ensure all individual items are checked, then ensure selectAll is checked.
    document
      .querySelectorAll<HTMLInputElement>('input[name="selectItem"]')
      .forEach((cb) => {
        if (!cb.checked) cb.click();
      });
    document
      .querySelectorAll<HTMLInputElement>('input[name="selectAll"]')
      .forEach((cb) => {
        if (!cb.checked) cb.click();
      });

    // 4. Uncheck specific checkboxes (e.g. Default Patient)
    (config.uncheckIds ?? []).forEach((id) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el?.checked) el.checked = false;
    });
  });

  searchBtn.insertAdjacentElement("afterend", clearBtn);
}

function initCaregiverSearchClearButton(): void {
  injectClearButton({
    searchBtnId: "ctl00_ContentPlaceHolder1_uxbtnSearch",
    textInputSelectors: [
      "#ctl00_ContentPlaceHolder1_uxtxtLastName",
      "#ctl00_ContentPlaceHolder1_uxtxtFirstName",
      "#ctl00_ContentPlaceHolder1_uxtxtSSN",
      "#ctl00_ContentPlaceHolder1_uxtxtAideCode",
      "#ctl00_ContentPlaceHolder1_uxTxtAltAideCode",
      "#ctl00_ContentPlaceHolder1_uxtxtPhoneNumber",
      "#ctl00_ContentPlaceHolder1_uxtxtDOB",
    ],
    selectSelectors: [
      "#ctl00_ContentPlaceHolder1_uxDdlStatus",
      "#ctl00_ContentPlaceHolder1_uxddlType",
      "#ctl00_ContentPlaceHolder1_uxDdlLocation",
      "#ctl00_ContentPlaceHolder1_uxDdlBranch",
      "#ctl00_ContentPlaceHolder1_uxDdlEmploymentType",
      "#ctl00_ContentPlaceHolder1_uxDdlTeam",
    ],
  });
}

function initPatientSearchClearButton(): void {
  injectClearButton({
    searchBtnId: "ctl00_ContentPlaceHolder1_uxBtnSearch",
    textInputSelectors: [
      "#ctl00_ContentPlaceHolder1_uxLastName",
      "#ctl00_ContentPlaceHolder1_uxFirstName",
      "#ctl00_ContentPlaceHolder1_uxPatientId",
      "#ctl00_ContentPlaceHolder1_uxtxtMRNumber",
      "#ctl00_ContentPlaceHolder1_uxTxtAltPatientID",
      "#ctl00_ContentPlaceHolder1_uxPhoneNo",
      "#ctl00_ContentPlaceHolder1_uxMedicaidId",
    ],
    selectSelectors: [
      "#ctl00_ContentPlaceHolder1_uxStatus",
      "#ctl00_ContentPlaceHolder1_uxddlCoordinator",
      "#ctl00_ContentPlaceHolder1_uxDdlTeam",
      "#ctl00_ContentPlaceHolder1_uxDdlLocation",
      "#ctl00_ContentPlaceHolder1_uxDdlBranch",
      "#ctl00_ContentPlaceHolder1_uxDdlSource",
    ],
    uncheckIds: ["ctl00_ContentPlaceHolder1_chkDefaultPatient"],
  });
}

/**
 * Entry point — detects the current page and injects the appropriate Clear button.
 * Should be called from main() in index.ts.
 */
export function initSearchPageEnhancements(): void {
  const url = window.location.href;
  if (url.includes("CaregiverSearch_ns.aspx")) {
    initCaregiverSearchClearButton();
  } else if (url.includes("PatientSearchXSLTIFrame_ns.aspx")) {
    initPatientSearchClearButton();
  }
}
