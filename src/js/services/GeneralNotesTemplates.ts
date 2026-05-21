const QA_NOTE_TEMPLATE =
  "Quality assurance call made to patient. Pt confirmed no hospitalizations, rehab admissions, or falls within the past 30 days. Address and contact information remain unchanged. Pt expressed satisfaction with current services, aide, and hours, and has no further questions at this time.";

function normalizePatientName(patientName?: string | null): string {
  const normalized = (patientName || "").trim();
  return normalized || "the patient";
}

export function getQANoteTemplate(): string {
  return QA_NOTE_TEMPLATE;
}

export function getWelcomeCallTemplate(patientName?: string | null): string {
  const safePatientName = normalizePatientName(patientName);
  return `I spoke to PT ${safePatientName} and introduced myself and Always Home Care. PT. speaks Mandarin/Fuzhounese, no pets, no smoking/drinking, use cane and the address/schedule was confirmed.`;
}
