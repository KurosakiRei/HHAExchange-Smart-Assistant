import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import m11qTemplateDataUri from "../../assets/M11Q FORM.pdf";

export interface GenerateM11QPdfParams {
  patientName: string;
  dob: string;
  faxNumber: string;
}

interface FieldCoordinate {
  x: number;
  y: number;
  size: number;
}

const M11Q_COORDINATES: {
  pageIndex: number;
  name: FieldCoordinate;
  dob: FieldCoordinate;
  fax: FieldCoordinate;
} = {
  pageIndex: 0,
  name: { x: 38.6183, y: 625.047, size: 12 },
  dob: { x: 244.147, y: 626.356, size: 12 },
  // Move a bit left/down based on visual QA screenshot feedback.
  fax: { x: 330, y: 730, size: 12 },
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toMmDdYyyy(month: number, day: number, year: number): string {
  return `${pad2(month)}/${pad2(day)}/${year}`;
}

async function decodeTemplateDataUri(
  dataUriOrBase64: string
): Promise<Uint8Array> {
  if (!dataUriOrBase64) {
    throw new Error("M11Q template is missing");
  }

  if (dataUriOrBase64.startsWith("data:")) {
    const commaIndex = dataUriOrBase64.indexOf(",");
    if (commaIndex < 0) {
      throw new Error("Invalid M11Q template data URI");
    }

    const header = dataUriOrBase64.slice(0, commaIndex);
    const payload = dataUriOrBase64.slice(commaIndex + 1);

    if (/;base64/i.test(header)) {
      const binary = atob(payload.replace(/\s/g, ""));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }

    const decoded = decodeURIComponent(payload);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i += 1) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  }

  const binary = atob(dataUriOrBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function sanitizeFilenameSegment(value: string): string {
  return (value || "").replace(/[\\/:*?"<>|]/g, "").trim();
}

function formatFaxForPdf(value: string): string {
  const clean = (value || "").trim().replace(/^fax\s*:\s*/i, "");
  if (!clean) return "";
  return `Fax: ${clean}`;
}

export function normalizeDob(input: string): string {
  const value = (input || "").trim();
  if (!value) {
    return "";
  }

  let match = value.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (match) {
    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);
    return toMmDdYyyy(month, day, year);
  }

  match = value.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    return toMmDdYyyy(month, day, year);
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length === 8) {
    const first4 = Number(digits.slice(0, 4));
    if (first4 >= 1900 && first4 <= 2100) {
      const year = first4;
      const month = Number(digits.slice(4, 6));
      const day = Number(digits.slice(6, 8));
      return toMmDdYyyy(month, day, year);
    }

    const month = Number(digits.slice(0, 2));
    const day = Number(digits.slice(2, 4));
    const year = Number(digits.slice(4, 8));
    return toMmDdYyyy(month, day, year);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return toMmDdYyyy(
      parsed.getMonth() + 1,
      parsed.getDate(),
      parsed.getFullYear()
    );
  }

  return value;
}

export async function generate(params: GenerateM11QPdfParams): Promise<Blob> {
  const templateBytes = await decodeTemplateDataUri(m11qTemplateDataUri);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPage(M11Q_COORDINATES.pageIndex);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const patientName = (params.patientName || "").trim();
  const normalizedDob = normalizeDob(params.dob);
  const faxNumber = formatFaxForPdf(params.faxNumber);

  page.drawText(patientName, {
    ...M11Q_COORDINATES.name,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText(normalizedDob, {
    ...M11Q_COORDINATES.dob,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText(faxNumber, {
    ...M11Q_COORDINATES.fax,
    font,
    color: rgb(0, 0, 0),
  });

  const outputBytes = await pdfDoc.save();
  const outputBuffer = new ArrayBuffer(outputBytes.byteLength);
  new Uint8Array(outputBuffer).set(outputBytes);
  return new Blob([outputBuffer], { type: "application/pdf" });
}

export function buildFilename(
  patientName: string,
  admissionId: string
): string {
  const safeName = sanitizeFilenameSegment(patientName) || "Patient";
  const safeId = sanitizeFilenameSegment(admissionId) || "UnknownID";
  return `${safeName} ${safeId} M11Q.pdf`;
}

export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
