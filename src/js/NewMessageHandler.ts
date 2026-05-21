import {
  newMessageIframeSelector,
  newMessageReasonSelector,
  newMessageNoteSelector,
  newMessagePatientNameSelector,
  newMessagePatientNameSelecotr,
} from "../utils/templates&const";
import {
  getQANoteTemplate,
  getWelcomeCallTemplate,
} from "./services/GeneralNotesTemplates";

export const createNewQA = async () =>
  await messageHandler("Quality Assurance", getQANoteTemplate());

export const createWelcomeCall = async () => {
  const patientName = getPatientNameFromForm();
  await messageHandler("Welcome call", getWelcomeCallTemplate(patientName));
};

function getSearchDocuments(): Document[] {
  const docs: Document[] = [];

  const pushDoc = (candidate: Document | null | undefined): void => {
    if (!candidate || docs.includes(candidate)) {
      return;
    }
    docs.push(candidate);
  };

  pushDoc(document);

  const messageIframe = document.querySelector(
    newMessageIframeSelector
  ) as HTMLIFrameElement | null;
  try {
    pushDoc(messageIframe?.contentDocument);
  } catch {
    // Cross-origin iframe is ignored.
  }

  document.querySelectorAll("iframe").forEach((frame) => {
    const iframe = frame as HTMLIFrameElement;
    try {
      pushDoc(iframe.contentDocument);
    } catch {
      // Ignore cross-origin frames.
    }
  });

  return docs;
}

function findElementInDocs<T extends Element>(selector: string): T | null {
  for (const doc of getSearchDocuments()) {
    const found = doc.querySelector(selector) as T | null;
    if (found) {
      return found;
    }
  }
  return null;
}

function readValueFromField(element: Element | null): string {
  if (!element) {
    return "";
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    return (element.value || "").trim();
  }

  return (element.textContent || "").trim();
}

function getPatientNameFromForm(): string {
  const patientSelectors = [
    newMessagePatientNameSelector,
    newMessagePatientNameSelecotr,
    "#txtPatient",
    "#txtPatientName",
    "#PatientName",
    '#htmlmodal input[id*="Patient"]',
    '#htmlmodal input[name*="Patient"]',
  ];

  for (const selector of patientSelectors) {
    const value = readValueFromField(findElementInDocs(selector));
    if (value) {
      return value;
    }
  }

  for (const doc of getSearchDocuments()) {
    const labels = Array.from(
      doc.querySelectorAll("label, .control-label, .field-label, span, div")
    );
    const patientLabel = labels.find((label) => {
      const normalized = (label.textContent || "")
        .replace(/[\s:*]/g, "")
        .toLowerCase();
      return normalized === "patient";
    });

    if (!patientLabel) {
      continue;
    }

    const container =
      patientLabel.closest("tr, .row, .form-group, td, section, div") ||
      patientLabel.parentElement;
    if (!container) {
      continue;
    }

    const field = container.querySelector("input, textarea, select");
    const value = readValueFromField(field);
    if (value) {
      return value;
    }
  }

  return "";
}

function setFieldValue(
  field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string
): void {
  field.value = value;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

async function messageHandler(reason: string, notes: string) {
  const reasonSelect = findElementInDocs<HTMLSelectElement>(
    newMessageReasonSelector
  );

  if (reasonSelect) {
    const matchedOption = Array.from(reasonSelect.options).find(
      (option) => option.text.trim().toLowerCase() === reason.toLowerCase()
    );
    if (matchedOption) {
      setFieldValue(reasonSelect, matchedOption.value);
    } else {
      console.warn(`[NewMessageHandler] Reason option not found: ${reason}`);
    }
  } else {
    console.warn("[NewMessageHandler] Reason select not found");
  }

  const noteField = findElementInDocs<HTMLTextAreaElement>(
    newMessageNoteSelector
  );
  if (!noteField) {
    console.warn("[NewMessageHandler] Note textarea not found");
    return;
  }

  setFieldValue(noteField, notes);
}
