import { IncidentSchemaRegistry } from "./IncidentSchemaRegistry";
import {
  IncidentAutofillFailure,
  IncidentAutofillResult,
  IncidentFieldDefinition,
  IncidentFieldValue,
  IncidentPayload,
  getValueByPath,
  isFieldVisible,
  isFieldRequired,
  isValuePresent,
  resolveFieldOptions,
  toDisplayValue,
} from "./IncidentTypes";

export interface IncidentAutofillOptions {
  root?: Document;
  dryRun?: boolean;
  allowNavigation?: boolean;
  waitForRenderMs?: number;
  maxNavigationSteps?: number;
  fieldInteractionDelayMs?: number;
  branchRevealWaitMs?: number;
}

type GuardCleanup = () => string[];

interface FillFieldResult {
  ok: boolean;
  failure?: IncidentAutofillFailure;
  maybeOnNextPage?: boolean;
}

const NEXT_BUTTON_MARKERS = ["next", "continue", "下一", "继续", "next page"];

const DEFAULT_RENDER_WAIT_MS = 500;
const DEFAULT_MAX_NAVIGATION_STEPS = 6;
const DEFAULT_FIELD_INTERACTION_DELAY_MS = 220;
const DEFAULT_BRANCH_REVEAL_WAIT_MS = 520;

function normalizeLabel(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function dispatchInputEvents(element: HTMLElement): void {
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function getElementText(element: Element): string {
  const node = element as HTMLElement;
  return normalizeLabel(
    `${node.innerText || ""} ${node.textContent || ""} ${
      node.getAttribute("aria-label") || ""
    }`
  );
}

function getLabelTextForControl(root: Document, control: Element): string {
  const asHtml = control as HTMLElement;
  const ownLabel = asHtml.closest("label")?.textContent || "";
  const id = (control as HTMLInputElement).id;
  const forLabel = id
    ? root.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent || ""
    : "";
  const legend = asHtml
    .closest("fieldset")
    ?.querySelector("legend")?.textContent;

  return normalizeLabel(`${ownLabel} ${forLabel} ${legend || ""}`);
}

function bestControlMatch(
  root: Document,
  label: string,
  selector: string
): HTMLElement | null {
  const target = normalizeLabel(label);
  let bestScore = 0;
  let best: HTMLElement | null = null;

  const controls = Array.from(root.querySelectorAll<HTMLElement>(selector));
  controls.forEach((control) => {
    const aria = normalizeLabel(control.getAttribute("aria-label") || "");
    const placeholder = normalizeLabel(
      (control as HTMLInputElement).placeholder || ""
    );
    const name = normalizeLabel((control as HTMLInputElement).name || "");
    const id = normalizeLabel((control as HTMLInputElement).id || "");
    const labels = getLabelTextForControl(root, control);

    let score = 0;
    if (aria === target || labels === target || placeholder === target) {
      score = 100;
    } else if (
      aria.includes(target) ||
      labels.includes(target) ||
      placeholder.includes(target)
    ) {
      score = 80;
    } else if (target && (name.includes(target) || id.includes(target))) {
      score = 60;
    }

    if (score > bestScore) {
      bestScore = score;
      best = control;
    }
  });

  return best;
}

function isSubmitLikeElement(element: Element | null): boolean {
  if (!element) {
    return false;
  }

  const asHtml = element as HTMLElement;
  const text = normalizeLabel(asHtml.innerText || asHtml.textContent || "");
  const ariaLabel = normalizeLabel(asHtml.getAttribute("aria-label") || "");
  const inputType = normalizeLabel((element as HTMLInputElement).type || "");

  const markerText = `${text} ${ariaLabel}`;

  // If it's a navigation button (Next/Back/Prev/Continue), it is definitely NOT a submit action
  if (
    /\bnext\b|\bback\b|\bprev\b|\bcontinue\b|\b下一\b|\b上一\b|\b返回\b/.test(
      markerText
    )
  ) {
    return false;
  }

  if (inputType === "submit") {
    if (element.tagName === "INPUT") {
      const val = normalizeLabel((element as HTMLInputElement).value || "");
      return /\bsubmit\b|\bsend\b|\bfinish\b|\bfinal\b|\b提交\b/.test(val);
    }
    return /\bsubmit\b|\bsend\b|\bfinish\b|\bfinal\b|\b提交\b/.test(markerText);
  }

  if (/\bsubmit\b|\bsend\b|\bfinish\b|\bfinal\b|\b提交\b/.test(markerText)) {
    return true;
  }

  return false;
}

export function installNoSubmitGuard(root: Document): GuardCleanup {
  const blocked: string[] = [];

  const clickHandler = (event: Event) => {
    const target = event.target as Element | null;
    const submitCandidate =
      target?.closest("button, input[type='submit'], [role='button']") ||
      target;

    if (!isSubmitLikeElement(submitCandidate)) {
      return;
    }

    const text =
      (submitCandidate as HTMLElement)?.innerText?.trim() ||
      (submitCandidate as HTMLElement)?.getAttribute("aria-label") ||
      "submit-action";

    blocked.push(`blocked-click:${text}`);
    event.preventDefault();
    event.stopPropagation();
    if (typeof (event as any).stopImmediatePropagation === "function") {
      (event as any).stopImmediatePropagation();
    }
  };

  const submitHandler = (event: Event) => {
    blocked.push("blocked-form-submit");
    event.preventDefault();
    event.stopPropagation();
  };

  root.addEventListener("click", clickHandler, true);
  root.addEventListener("submit", submitHandler, true);

  return () => {
    root.removeEventListener("click", clickHandler, true);
    root.removeEventListener("submit", submitHandler, true);
    return blocked;
  };
}

function findElementByLabel(
  root: Document,
  field: IncidentFieldDefinition
): HTMLElement | null {
  if (field.kind === "select") {
    return bestControlMatch(
      root,
      field.label,
      "select"
    ) as HTMLSelectElement | null;
  }

  return bestControlMatch(root, field.label, "input, textarea, select");
}

function isInteractable(element: HTMLElement): boolean {
  const input = element as HTMLInputElement;
  if (typeof input.disabled === "boolean" && input.disabled) {
    return false;
  }

  if (typeof input.readOnly === "boolean" && input.readOnly) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }

  return true;
}

function findCheckboxByOption(
  root: Document,
  field: IncidentFieldDefinition,
  optionValue: string
): HTMLInputElement | null {
  const target = normalizeLabel(optionValue);
  const wantedField = normalizeLabel(field.label);

  const candidates = Array.from(
    root.querySelectorAll<HTMLInputElement>("input[type='checkbox']")
  );

  let scoped: HTMLInputElement[] = candidates;
  const fieldset = Array.from(root.querySelectorAll("fieldset")).find((entry) =>
    normalizeLabel(entry.querySelector("legend")?.textContent || "").includes(
      wantedField
    )
  );
  if (fieldset) {
    scoped = Array.from(
      fieldset.querySelectorAll<HTMLInputElement>("input[type='checkbox']")
    );
  }

  for (const candidate of scoped) {
    const labelText = getLabelTextForControl(root, candidate);
    const value = normalizeLabel(candidate.value || "");
    const aria = normalizeLabel(candidate.getAttribute("aria-label") || "");
    if (
      value === target ||
      labelText.includes(target) ||
      aria.includes(target)
    ) {
      return candidate;
    }
  }

  return null;
}

function createFailure(
  field: IncidentFieldDefinition,
  code: IncidentAutofillFailure["code"],
  reason: string,
  suggestion: string
): IncidentAutofillFailure {
  return {
    fieldId: field.id,
    label: field.label,
    code,
    reason,
    suggestion,
  };
}

function isMicrosoftFormsRuntime(root: Document): boolean {
  return !!root.querySelector('[data-automation-id="questionItem"]');
}

function normalizeQuestionText(text: string): string {
  return normalizeLabel(text)
    .replace(/^\d+\.?\s*/g, "")
    .replace(/\bsingle\s+choice\.?/g, "")
    .replace(/\bsingle\s+line\s+text\.?/g, "")
    .replace(/\bmulti\s+line\s+text\.?/g, "")
    .replace(/\bdate\.?/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeQuestionText(text: string): string[] {
  return normalizeQuestionText(text)
    .split(/[^a-z0-9\u4e00-\u9fff]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function scoreQuestionMatch(label: string, question: string): number {
  const normalizedLabel = normalizeQuestionText(label);
  const normalizedQuestion = normalizeQuestionText(question);
  if (!normalizedLabel || !normalizedQuestion) {
    return 0;
  }

  if (normalizedLabel === normalizedQuestion) {
    return 1;
  }

  const labelTokens = tokenizeQuestionText(normalizedLabel);
  const questionTokens = tokenizeQuestionText(normalizedQuestion);
  if (!labelTokens.length || !questionTokens.length) {
    return 0;
  }

  const labelSet = new Set(labelTokens);
  const questionSet = new Set(questionTokens);

  let intersection = 0;
  labelSet.forEach((token) => {
    if (questionSet.has(token)) {
      intersection += 1;
    }
  });

  return intersection / (labelSet.size + questionSet.size - intersection);
}

function getFormsQuestionText(questionItem: HTMLElement): string {
  const title =
    questionItem
      .querySelector<HTMLElement>('[data-automation-id="questionTitle"]')
      ?.innerText?.trim() || "";
  return normalizeQuestionText(title);
}

function findFormsQuestionItemByLabel(
  root: Document,
  label: string
): HTMLElement | null {
  const questionItems = Array.from(
    root.querySelectorAll<HTMLElement>('[data-automation-id="questionItem"]')
  );
  if (!questionItems.length) {
    return null;
  }

  let bestScore = 0;
  let best: HTMLElement | null = null;

  questionItems.forEach((questionItem) => {
    const score = scoreQuestionMatch(label, getFormsQuestionText(questionItem));
    if (score > bestScore) {
      bestScore = score;
      best = questionItem;
    }
  });

  return bestScore >= 0.3 ? best : null;
}

function canonicalOptionText(text: string): string {
  return normalizeLabel(text)
    .replace(/[\u00a0]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactOptionText(text: string): string {
  return canonicalOptionText(text).replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "");
}

function isOptionMatch(optionText: string, targetText: string): boolean {
  const optionCanonical = canonicalOptionText(optionText);
  const targetCanonical = canonicalOptionText(targetText);
  if (!optionCanonical || !targetCanonical) {
    return false;
  }

  if (optionCanonical === targetCanonical) {
    return true;
  }

  const optionCompact = compactOptionText(optionCanonical);
  const targetCompact = compactOptionText(targetCanonical);
  if (optionCompact === targetCompact) {
    return true;
  }

  const hasVeryShortCandidate =
    optionCanonical.length <= 3 || targetCanonical.length <= 3;
  if (hasVeryShortCandidate) {
    return false;
  }

  if (
    optionCanonical.includes(targetCanonical) ||
    targetCanonical.includes(optionCanonical)
  ) {
    return true;
  }

  const optionTokens = optionCanonical
    .split(/[^a-z0-9\u4e00-\u9fff]+/i)
    .filter((token) => token.length > 1);
  const targetTokens = targetCanonical
    .split(/[^a-z0-9\u4e00-\u9fff]+/i)
    .filter((token) => token.length > 1);

  if (!optionTokens.length || !targetTokens.length) {
    return false;
  }

  const targetSet = new Set(targetTokens);
  let overlap = 0;
  optionTokens.forEach((token) => {
    if (targetSet.has(token)) {
      overlap += 1;
    }
  });

  return overlap >= Math.min(optionTokens.length, targetTokens.length);
}

function setNativeTextValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string
): void {
  const isCombo =
    (element.getAttribute("role") || "").toLowerCase() === "combobox" ||
    !!element.getAttribute("aria-haspopup");

  // Convert ISO date format (yyyy-MM-dd) to the M/d/yyyy format that
  // Fabric UI DatePicker expects.  The incident composer stores dates
  // from <input type="date"> which always uses yyyy-MM-dd.
  let resolvedValue = value;
  if (isCombo && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parts = value.split("-");
    const month = String(parseInt(parts[1], 10)); // strip leading zero
    const day = String(parseInt(parts[2], 10));
    resolvedValue = `${month}/${day}/${parts[0]}`;
  }

  // Set the value FIRST, before any interaction
  const oldValue = element.value;
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (descriptor?.set) {
    descriptor.set.call(element, resolvedValue);
  } else {
    element.value = resolvedValue;
  }

  // React 15+ value tracker bypass
  const tracker = (element as any)._valueTracker;
  if (tracker) {
    tracker.setValue(oldValue);
  }

  // Focus ONLY — do NOT click (clicking a Fabric UI DatePicker opens
  // the calendar dialog which resets the value).
  element.focus();

  dispatchInputEvents(element);

  if (isCombo) {
    element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
    );
    element.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Enter", bubbles: true })
    );
  } else {
    element.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  element.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Tab", bubbles: true })
  );

  if (isCombo) {
    window.setTimeout(() => {
      element.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );
      element.dispatchEvent(
        new KeyboardEvent("keyup", { key: "Enter", bubbles: true })
      );
    }, 200);
  }
}

function isVisibleElement(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }
  return element.getClientRects().length > 0;
}

async function selectFormsComboOption(
  root: Document,
  questionItem: HTMLElement,
  textValue: string
): Promise<boolean> {
  const comboButton = questionItem.querySelector<HTMLElement>(
    '[role="button"][aria-haspopup="listbox"]'
  );
  if (!comboButton) {
    return false;
  }

  comboButton.click();
  await sleep(140);

  const visibleListboxes = Array.from(
    root.querySelectorAll<HTMLElement>('[role="listbox"]')
  ).filter((listbox) => isVisibleElement(listbox));

  let option: HTMLElement | null = null;
  for (const listbox of visibleListboxes) {
    const candidate = Array.from(
      listbox.querySelectorAll<HTMLElement>('[role="option"]')
    ).find((entry) =>
      isOptionMatch(entry.innerText || entry.textContent || "", textValue)
    );
    if (candidate) {
      option = candidate;
      break;
    }
  }

  if (!option) {
    option =
      Array.from(root.querySelectorAll<HTMLElement>('[role="option"]'))
        .filter((entry) => isVisibleElement(entry))
        .find((entry) =>
          isOptionMatch(entry.innerText || entry.textContent || "", textValue)
        ) || null;
  }

  if (!option) {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );
    return false;
  }

  option.click();
  await sleep(140);
  return true;
}

function findAndCheckEmailReceipt(root: Document): boolean {
  // Primary: Forms uses a custom checkbox wrapped in
  // <span data-automation-id="checkbox" data-automation-value="Receipt">
  const formsCheckboxWrapper = root.querySelector<HTMLElement>(
    '[data-automation-id="checkbox"][data-automation-value="Receipt"]'
  );
  if (formsCheckboxWrapper) {
    const input = formsCheckboxWrapper.querySelector<HTMLInputElement>(
      'input[type="checkbox"], input[role="checkbox"]'
    );
    const isChecked =
      input?.checked ||
      input?.getAttribute("aria-checked") === "true" ||
      formsCheckboxWrapper.getAttribute("aria-checked") === "true";
    if (!isChecked) {
      // Must click the <input> itself – Forms event handlers bind to input,
      // clicking the wrapper <span> does NOT toggle aria-checked.
      // Double-click for resilience: some Forms themes require a second hit.
      if (input) {
        input.click();
        dispatchInputEvents(input);
        window.setTimeout(() => {
          const stillUnchecked =
            !input.checked && input.getAttribute("aria-checked") !== "true";
          if (stillUnchecked) {
            input.click();
            dispatchInputEvents(input);
          }
        }, 220);
      } else {
        formsCheckboxWrapper.click();
      }
    }
    return true;
  }

  // Fallback: search by label text for "email receipt"
  const candidateLabels = Array.from(
    root.querySelectorAll("label, span")
  ).filter((el) =>
    /email receipt|email receive|receipt of my responses/i.test(
      (el.textContent || "").replace(/\s+/g, " ")
    )
  );

  for (const label of candidateLabels) {
    const scope = label.closest("label") || label.parentElement;
    if (!scope) continue;

    const checkbox = scope.querySelector<HTMLInputElement>(
      'input[type="checkbox"], input[role="checkbox"]'
    );
    if (checkbox) {
      const isChecked =
        checkbox.checked || checkbox.getAttribute("aria-checked") === "true";
      if (!isChecked) {
        checkbox.click();
        dispatchInputEvents(checkbox);
      }
      return true;
    }
  }

  // Last resort: scan all checkboxes for email receipt text in their container
  const allCheckboxes = Array.from(
    root.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"], input[role="checkbox"]'
    )
  );
  for (const cb of allCheckboxes) {
    const container = cb.closest("label, div, span");
    if (
      container &&
      /email receipt|email receive|receipt/i.test(
        (container.textContent || "").replace(/\s+/g, " ")
      )
    ) {
      const isChecked =
        cb.checked || cb.getAttribute("aria-checked") === "true";
      if (!isChecked) {
        cb.click();
        dispatchInputEvents(cb);
      }
      return true;
    }
  }

  return false;
}

function findTextOrDateInput(
  questionItem: HTMLElement,
  kind: string
): HTMLInputElement | HTMLTextAreaElement | null {
  // For date fields, try the Forms date-picker aria label first,
  // then native type=date, then placeholder-based fallback
  if (kind === "date") {
    const datePicker =
      questionItem.querySelector<HTMLInputElement>(
        'input[aria-label="Date picker"]'
      ) ||
      questionItem.querySelector<HTMLInputElement>(
        'input[role="combobox"][aria-haspopup="dialog"]'
      ) ||
      questionItem.querySelector<HTMLInputElement>('input[type="date"]') ||
      questionItem.querySelector<HTMLInputElement>(
        'input[placeholder*="date" i], input[placeholder*="M/d/yyyy" i]'
      ) ||
      questionItem.querySelector<HTMLInputElement>(
        'input[data-automation-id="textInput"][aria-label*="date" i], ' +
          'input[data-automation-id="textInput"][placeholder*="date" i]'
      );
    if (datePicker) return datePicker;
    // Last resort: any input in the questionItem
    return questionItem.querySelector<HTMLInputElement>(
      'input[data-automation-id="textInput"], input:not([type="radio"]):not([type="checkbox"])'
    );
  }

  // For text/time fields, try the standard textInput first, then fall back
  // to date picker / combo (many Forms "text" fields are actually date pickers or combos)
  return (
    questionItem.querySelector<HTMLInputElement>(
      'input[data-automation-id="textInput"]'
    ) ||
    questionItem.querySelector<HTMLInputElement>(
      'input[aria-label="Date picker"]'
    ) ||
    questionItem.querySelector<HTMLInputElement>(
      'input[role="combobox"][aria-haspopup="dialog"]'
    ) ||
    questionItem.querySelector<HTMLInputElement>('input[type="date"]') ||
    questionItem.querySelector<HTMLInputElement>(
      'input:not([type="radio"]):not([type="checkbox"])'
    )
  );
}

function getChoiceOptionText(choiceElement: HTMLElement): string {
  const textInput = choiceElement.querySelector<HTMLInputElement>(
    'input[type="text"], input[data-automation-id="textInput"]'
  );
  if (textInput) {
    const placeholder = textInput.getAttribute("placeholder") || "";
    const ariaLabel = textInput.getAttribute("aria-label") || "";
    if (
      placeholder.toLowerCase().includes("other") ||
      ariaLabel.toLowerCase().includes("other")
    ) {
      return "Other answer";
    }
  }

  const radioOrCheck = choiceElement.querySelector<HTMLInputElement>(
    'input[type="radio"], input[type="checkbox"]'
  );
  if (radioOrCheck) {
    const ariaLabel = radioOrCheck.getAttribute("aria-label");
    if (ariaLabel) {
      return ariaLabel;
    }
  }

  return choiceElement.innerText || choiceElement.textContent || "";
}

async function fillMicrosoftFormsField(
  root: Document,
  questionItem: HTMLElement,
  field: IncidentFieldDefinition,
  value: IncidentFieldValue
): Promise<FillFieldResult> {
  const textValue = toDisplayValue(value);

  if (field.kind === "multiselect") {
    const values = Array.isArray(value) ? value : [];
    if (!values.length) {
      return { ok: true };
    }

    const unresolved: string[] = [];
    const choiceItems = Array.from(
      questionItem.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    )
      .map((input) => input.closest("label"))
      .filter(Boolean) as HTMLElement[];

    values.forEach((entry) => {
      const targetChoice = choiceItems.find((choice) =>
        isOptionMatch(getChoiceOptionText(choice), entry)
      );

      if (!targetChoice) {
        unresolved.push(entry);
        return;
      }

      const checkbox = targetChoice.querySelector<HTMLInputElement>(
        'input[type="checkbox"]'
      );
      if (checkbox && !checkbox.checked) {
        targetChoice.click();
        dispatchInputEvents(checkbox);
      }
    });

    if (unresolved.length) {
      return {
        ok: false,
        failure: createFailure(
          field,
          "option_mismatch",
          `多选值未匹配: ${unresolved.join(", ")}`,
          "请在配置中确认多选项文案与官方 Form 完全一致，再重试。"
        ),
      };
    }

    return { ok: true };
  }

  if (field.kind === "select") {
    const choiceItems = Array.from(
      questionItem.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    )
      .map((input) => input.closest("label"))
      .filter(Boolean) as HTMLElement[];

    if (choiceItems.length) {
      const matchedChoice = choiceItems.find((choice) =>
        isOptionMatch(getChoiceOptionText(choice), textValue)
      );
      if (!matchedChoice) {
        return {
          ok: false,
          failure: createFailure(
            field,
            "option_mismatch",
            `选项不匹配: ${field.label} -> ${textValue}`,
            "请更新 incident 选项目录，使值与官方选项一致后重试。"
          ),
        };
      }

      const radio = matchedChoice.querySelector<HTMLInputElement>(
        'input[type="radio"]'
      );
      if (radio) {
        if (!radio.checked) {
          matchedChoice.click();
        }
        dispatchInputEvents(radio);

        // "Other answer" sub‑input: when the user selects "Other",
        // a free‑text input appears inside the same choice label.
        // Fill it now if we have an "other" value from the payload.
        if (
          textValue === "Other answer" ||
          getChoiceOptionText(matchedChoice) === "Other answer"
        ) {
          const otherInput = matchedChoice.querySelector<HTMLInputElement>(
            'input[type="text"], input[data-automation-id="textInput"]'
          );
          // The other-value comes from the companion "-other" field
          // in the schema, which is filled separately.  We just need
          // to activate the radio; the text field gets its value from
          // the next field in the section loop.
        }

        return { ok: true };
      }

      matchedChoice.click();
      return { ok: true };
    }

    const selectedFromCombo = await selectFormsComboOption(
      root,
      questionItem,
      textValue
    );
    if (selectedFromCombo) {
      return { ok: true };
    }

    return {
      ok: false,
      failure: createFailure(
        field,
        "option_mismatch",
        `选项不匹配: ${field.label} -> ${textValue}`,
        "请更新 incident 选项目录，使值与官方选项一致后重试。"
      ),
    };
  }

  const textControl =
    field.kind === "textarea"
      ? questionItem.querySelector<HTMLTextAreaElement>(
          'textarea[data-automation-id="textInput"]'
        )
      : findTextOrDateInput(questionItem, field.kind);

  if (textControl) {
    if (!isInteractable(textControl as HTMLElement)) {
      return {
        ok: false,
        failure: createFailure(
          field,
          "field_not_interactable",
          `字段不可交互: ${field.label}`,
          "请确认字段已解锁且在当前页可见，然后重新执行自动填写。"
        ),
      };
    }
    setNativeTextValue(textControl, textValue);
    return { ok: true };
  }

  // Combo fallback: many Forms "text" / "select" / "date" fields are actually
  // role=button + aria-haspopup=listbox combos, not native inputs.
  {
    const comboResult = await selectFormsComboOption(
      root,
      questionItem,
      textValue
    );
    if (comboResult) {
      return { ok: true };
    }
  }

  return {
    ok: false,
    maybeOnNextPage: true,
    failure: createFailure(
      field,
      "field_not_found",
      `找不到字段控件: ${field.label}`,
      "请确认该字段是否位于下一页，或在表单中调整字段标题后重试。"
    ),
  };
}

async function fillSingleField(
  root: Document,
  field: IncidentFieldDefinition,
  value: IncidentFieldValue
): Promise<FillFieldResult> {
  if (isMicrosoftFormsRuntime(root)) {
    const questionItem = findFormsQuestionItemByLabel(root, field.label);
    if (questionItem) {
      const formsResult = await fillMicrosoftFormsField(
        root,
        questionItem,
        field,
        value
      );
      if (formsResult.ok || formsResult.failure?.code !== "field_not_found") {
        return formsResult;
      }
    }
  }

  const element = findElementByLabel(root, field);
  if (!element) {
    const code = field.visibleWhen ? "branch_unreached" : "field_not_found";
    return {
      ok: false,
      maybeOnNextPage: true,
      failure: createFailure(
        field,
        code,
        `找不到字段控件: ${field.label}`,
        code === "branch_unreached"
          ? "请先确认前置分支答案已写入并触发页面分支，再重试自动填写。"
          : "请确认该字段是否位于下一页，或在表单中调整字段标题后重试。"
      ),
    };
  }

  if (!isInteractable(element)) {
    return {
      ok: false,
      failure: createFailure(
        field,
        "field_not_interactable",
        `字段不可交互: ${field.label}`,
        "请确认字段已解锁且在当前页可见，然后重新执行自动填写。"
      ),
    };
  }

  if (field.kind === "multiselect") {
    const values = Array.isArray(value) ? value : [];
    if (!values.length) {
      return { ok: true };
    }

    const unresolved: string[] = [];
    values.forEach((entry) => {
      const candidate = findCheckboxByOption(root, field, entry);

      if (!candidate) {
        unresolved.push(entry);
        return;
      }

      if (!candidate.checked) {
        candidate.checked = true;
        dispatchInputEvents(candidate);
      }
    });

    if (unresolved.length) {
      return {
        ok: false,
        failure: createFailure(
          field,
          "option_mismatch",
          `多选值未匹配: ${unresolved.join(", ")}`,
          "请在配置中确认多选项文案与官方 Form 完全一致，再重试。"
        ),
      };
    }

    return { ok: true };
  }

  if (element instanceof HTMLSelectElement) {
    const options = Array.from(element.options);
    const textValue = toDisplayValue(value);
    const targetOption =
      options.find(
        (opt) => normalizeLabel(opt.value) === normalizeLabel(textValue)
      ) ||
      options.find(
        (opt) => normalizeLabel(opt.text) === normalizeLabel(textValue)
      );

    if (!targetOption) {
      return {
        ok: false,
        failure: createFailure(
          field,
          "option_mismatch",
          `选项不匹配: ${field.label} -> ${textValue}`,
          "请更新 incident 选项目录，使值与官方下拉选项一致后重试。"
        ),
      };
    }

    element.value = targetOption.value;
    dispatchInputEvents(element);
    return { ok: true };
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    element.value = toDisplayValue(value);
    dispatchInputEvents(element);
    return { ok: true };
  }

  return {
    ok: false,
    failure: createFailure(
      field,
      "field_not_interactable",
      `控件类型不支持: ${field.label}`,
      "请手动填写该字段并反馈新的控件类型，以便扩展自动填写支持。"
    ),
  };
}

function findNextButton(root: Document): HTMLElement | null {
  const candidates = Array.from(
    root.querySelectorAll<HTMLElement>(
      "button, input[type='button'], input[type='submit'], [role='button']"
    )
  );

  // Primary: text-based match
  let best = candidates.find((candidate) => {
    if (isSubmitLikeElement(candidate)) return false;
    const text = getElementText(candidate);
    return NEXT_BUTTON_MARKERS.some((marker) => text.includes(marker));
  });

  // Fallback: aria-label match (Forms uses aria-label="Next" on some themes)
  if (!best) {
    best =
      candidates.find((candidate) => {
        if (isSubmitLikeElement(candidate)) return false;
        const aria = (candidate.getAttribute("aria-label") || "").toLowerCase();
        return NEXT_BUTTON_MARKERS.some((marker) => aria.includes(marker));
      }) || null;
  }

  // Ensure the button is interactable; if disabled, still return it —
  // the caller may choose to wait
  return best || null;
}

async function clickNextPage(
  root: Document,
  waitForRenderMs: number
): Promise<boolean> {
  // Wait a bit for Forms to enable the Next button after filling page-1 fields
  await sleep(Math.max(waitForRenderMs, 600));

  let nextButton: HTMLElement | null = null;
  // Retry up to 5 times (1.5s total) waiting for the button to become enabled
  for (let attempt = 0; attempt < 5; attempt++) {
    nextButton = findNextButton(root);
    if (nextButton && isInteractable(nextButton)) break;
    await sleep(300);
  }

  if (!nextButton) {
    console.warn(
      "[IncidentAutofill] Next button not found for page navigation"
    );
    return false;
  }

  if (!isInteractable(nextButton)) {
    console.warn("[IncidentAutofill] Next button found but still disabled");
    return false;
  }

  nextButton.click();
  await sleep(waitForRenderMs);
  return true;
}

export class IncidentAutofillOrchestrator {
  async run(
    payload: IncidentPayload,
    options: IncidentAutofillOptions = {}
  ): Promise<IncidentAutofillResult> {
    const startedAt = Date.now();
    const root = options.root || document;
    const schema = IncidentSchemaRegistry.getSchema(payload.incidentType);
    const failures: IncidentAutofillFailure[] = [];
    let successCount = 0;
    let blockedActions: string[] = [];
    let hasRuntimeError = false;
    const allowNavigation = options.allowNavigation !== false;
    const waitForRenderMs = options.waitForRenderMs || DEFAULT_RENDER_WAIT_MS;
    const maxNavigationSteps =
      options.maxNavigationSteps || DEFAULT_MAX_NAVIGATION_STEPS;
    const fieldInteractionDelayMs =
      options.fieldInteractionDelayMs || DEFAULT_FIELD_INTERACTION_DELAY_MS;
    const branchRevealWaitMs =
      options.branchRevealWaitMs || DEFAULT_BRANCH_REVEAL_WAIT_MS;
    let navigationSteps = 0;

    const cleanupGuard = installNoSubmitGuard(root);

    try {
      for (const section of schema.sections) {
        if (section.visibleWhen && !section.visibleWhen(payload)) {
          continue;
        }

        for (const field of section.fields) {
          if (!isFieldVisible(field, payload)) {
            continue;
          }

          const value = getValueByPath(payload, field.bindTo);
          if (!isValuePresent(value)) {
            if (isFieldRequired(field, payload)) {
              failures.push(
                createFailure(
                  field,
                  "required_missing",
                  `必填字段缺少值: ${field.label}`,
                  "请先补齐该字段内容后再运行自动填写。"
                )
              );
            }
            continue;
          }

          if (field.kind === "select") {
            const available = resolveFieldOptions(field, payload);
            const selected = toDisplayValue(value);
            const valid = available.some(
              (option) =>
                normalizeLabel(option.value) === normalizeLabel(selected) ||
                normalizeLabel(option.label) === normalizeLabel(selected)
            );
            if (!valid) {
              failures.push(
                createFailure(
                  field,
                  "option_mismatch",
                  `值不在选项集中: ${selected}`,
                  "请更新选项目录并确认与官方 Form 完全一致后重试。"
                )
              );
              continue;
            }
          }

          if (options.dryRun) {
            successCount += 1;
            continue;
          }

          let resolved = false;
          while (!resolved) {
            const fillResult = await fillSingleField(root, field, value);
            if (fillResult.ok) {
              successCount += 1;
              resolved = true;
              const postFillDelayMs =
                field.kind === "select" || field.kind === "multiselect"
                  ? Math.max(waitForRenderMs, branchRevealWaitMs)
                  : Math.max(waitForRenderMs, fieldInteractionDelayMs);
              await sleep(postFillDelayMs);
              continue;
            }

            const canTryNextPage =
              allowNavigation &&
              fillResult.maybeOnNextPage &&
              navigationSteps < maxNavigationSteps;

            if (canTryNextPage) {
              const moved = await clickNextPage(root, waitForRenderMs);
              if (moved) {
                navigationSteps += 1;
                continue;
              }

              failures.push(
                createFailure(
                  field,
                  "navigation_failed",
                  `无法导航到后续页面: ${field.label}`,
                  "请手动点击 Next 到包含该字段的页面，然后重新运行自动填写。"
                )
              );
              resolved = true;
              continue;
            }

            failures.push(
              fillResult.failure ||
                createFailure(
                  field,
                  "runtime_error",
                  `未知填写错误: ${field.label}`,
                  "请刷新页面后重试；若重复失败，请反馈该字段截图。"
                )
            );
            resolved = true;
          }

          if (!resolved) {
            hasRuntimeError = true;
          }
        }
      }

      // Post-processing: check the "Send me an email receipt" checkbox
      // which lives outside the question-item structure
      if (isMicrosoftFormsRuntime(root as Document)) {
        const emailChecked = findAndCheckEmailReceipt(root as Document);
        if (emailChecked) {
          successCount += 1;
        }
      }
    } catch (error) {
      hasRuntimeError = true;
      failures.push({
        fieldId: "runtime",
        label: "Incident Autofill",
        code: "runtime_error",
        reason: (error as Error)?.message || "Unexpected runtime error",
        suggestion: "请刷新官方 Form 页面后重试自动填写。",
      });
    } finally {
      blockedActions = cleanupGuard();
      payload.safety.noSubmitGuardTriggered = blockedActions.length > 0;
      payload.safety.blockedActions = blockedActions;
    }

    const endedAt = Date.now();
    return {
      status: failures.length > 0 || hasRuntimeError ? "FAILED" : "COMPLETED",
      startedAt,
      endedAt,
      totalFields: successCount + failures.length,
      successCount,
      failedFields: failures,
      blockedActions,
      manualSubmitRequired: true,
    };
  }
}
