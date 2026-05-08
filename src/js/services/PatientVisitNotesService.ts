import GM_fetch from "@trim21/gm-fetch";
import { ApiParamProvider } from "./ApiParamProvider";

export interface SaveVisitNoteRequest {
  patientId: string;
  note: string;
  visitDate: string;
  patientNoteId?: number;
}

export interface FetchVisitNotesPageRequest {
  patientId: string;
  visitDate: string;
  officeId: string;
}

export interface PatientVisitNoteRecord {
  date: string;
  noteText: string;
  createdBy: string;
  createdDate: string;
}

interface AjaxProEnvelope {
  value?: number | string;
  error?: {
    Message?: string;
  };
  message?: string;
  d?: unknown;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extractTenantBase(): string {
  return ApiParamProvider.getTenantBaseUrl();
}

function extractText(cell: Element | null): string {
  return normalizeWhitespace(cell?.textContent || "");
}

function resolveColumnIndex(
  headerTexts: string[],
  candidates: string[],
  fallbackIndex: number
): number {
  const index = headerTexts.findIndex((headerText) => {
    return candidates.some((candidate) => headerText.includes(candidate));
  });

  return index >= 0 ? index : fallbackIndex;
}

function toDocument(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function toAjaxProEnvelope(payload: unknown): AjaxProEnvelope | null {
  if (payload === null || payload === undefined) {
    return null;
  }

  if (typeof payload === "number") {
    return { value: payload };
  }

  if (typeof payload === "string") {
    const trimmed = payload.trim();
    if (!trimmed) {
      return null;
    }

    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const nested = toAjaxProEnvelope(JSON.parse(trimmed) as unknown);
        if (nested) {
          return nested;
        }
      } catch {
        // ignore nested parse failures and continue with string fallback
      }
    }

    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
      return { value: numeric };
    }

    return { message: trimmed };
  }

  if (typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (record.d !== undefined) {
    const nested = toAjaxProEnvelope(record.d);
    if (nested) {
      return nested;
    }
  }

  const value =
    typeof record.value === "number" || typeof record.value === "string"
      ? record.value
      : undefined;
  const message =
    typeof record.message === "string" ? record.message : undefined;
  const errorMessage =
    record.error && typeof record.error === "object"
      ? (record.error as Record<string, unknown>).Message
      : undefined;
  const error =
    typeof errorMessage === "string"
      ? {
          Message: errorMessage,
        }
      : undefined;

  if (value !== undefined || message || error) {
    return {
      value,
      message,
      error,
    };
  }

  return null;
}

function tryParseAjaxProEnvelope(body: string): AjaxProEnvelope | null {
  const trimmed = body.trim();
  if (!trimmed) {
    return null;
  }

  const candidates = [trimmed];
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const extracted = trimmed.slice(firstBrace, lastBrace + 1);
    if (extracted !== trimmed) {
      candidates.push(extracted);
    }
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      const envelope = toAjaxProEnvelope(parsed);
      if (envelope) {
        return envelope;
      }
    } catch {
      // ignore and continue trying relaxed candidates
    }
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) {
    return { value: numeric };
  }

  return null;
}

export class PatientVisitNotesService {
  static normalizeVisitNoteText(text: string): string {
    return normalizeWhitespace(text);
  }

  static async saveVisitNote(request: SaveVisitNoteRequest): Promise<number> {
    const patientId = request.patientId.trim();
    const note = request.note.trim();
    const visitDate = request.visitDate.trim();
    const patientNoteId = request.patientNoteId ?? -1;

    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    if (!note) {
      throw new Error("Visit note text is required");
    }

    if (!visitDate) {
      throw new Error("Visit date is required");
    }

    const url = `${extractTenantBase()}/ajaxpro/CommonFunctions,HHAExchangeUI.ashx`;
    const payload = JSON.stringify({
      PatientNoteID: patientNoteId,
      PatientID: patientId,
      Note: note,
      VisitDate: visitDate,
    });

    const response = (await GM_fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-AjaxPro-Method": "SavePatientVisitNotes",
      },
      body: payload,
    })) as Response & { rawBody: Blob };

    if (!response.ok) {
      throw new Error(
        `SavePatientVisitNotes failed with HTTP ${response.status}`
      );
    }

    const text = await response.rawBody.text();
    const parsed = tryParseAjaxProEnvelope(text);
    if (!parsed) {
      throw new Error("SavePatientVisitNotes returned invalid JSON");
    }

    const value = Number(parsed?.value);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }

    const errorMessage =
      parsed?.error?.Message ||
      parsed?.message ||
      "SavePatientVisitNotes did not return a positive value";
    throw new Error(errorMessage);
  }

  static async fetchVisitNotesPage(
    patientIdOrRequest: string | FetchVisitNotesPageRequest,
    visitDate?: string,
    officeId?: string
  ): Promise<string> {
    const request: FetchVisitNotesPageRequest =
      typeof patientIdOrRequest === "string"
        ? {
            patientId: patientIdOrRequest,
            visitDate: visitDate || "",
            officeId: officeId || "",
          }
        : patientIdOrRequest;

    const patientId = request.patientId.trim();
    const normalizedVisitDate = request.visitDate.trim();
    const normalizedOfficeId = request.officeId.trim();

    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    if (!normalizedVisitDate) {
      throw new Error("Visit date is required");
    }

    if (!normalizedOfficeId) {
      throw new Error("Office ID is required");
    }

    const url = new URL(
      `${extractTenantBase()}/Patient/PatientVisitNotes_ns.aspx`
    );
    url.searchParams.set("PatientId", patientId);
    url.searchParams.set("VisitDate", normalizedVisitDate);
    url.searchParams.set("office", normalizedOfficeId);
    url.searchParams.set("OfficeID", normalizedOfficeId);
    url.searchParams.set("dt", String(Date.now()));

    const response = (await GM_fetch(url.toString(), {
      method: "GET",
      credentials: "include",
    })) as Response & { rawBody: Blob };

    if (!response.ok) {
      throw new Error(
        `PatientVisitNotes page failed with HTTP ${response.status}`
      );
    }

    return response.rawBody.text();
  }

  static parseVisitNotes(html: string): PatientVisitNoteRecord[] {
    const doc = toDocument(html);
    const table = doc.querySelector(
      "#gvPatientVisitNote, table[id*='gvPatientVisitNote']"
    );
    if (!table) {
      return [];
    }

    const headerTexts = Array.from(table.querySelectorAll("th")).map((header) =>
      extractText(header).toLowerCase()
    );
    const dateColumnIndex = resolveColumnIndex(
      headerTexts,
      ["date", "visit date"],
      0
    );
    const noteColumnIndex = resolveColumnIndex(
      headerTexts,
      ["note", "notes"],
      1
    );
    const createdByColumnIndex = resolveColumnIndex(
      headerTexts,
      ["created by", "entered by", "user"],
      2
    );
    const createdDateColumnIndex = resolveColumnIndex(
      headerTexts,
      ["created date", "entered date", "date created"],
      3
    );

    const rows = Array.from(table.querySelectorAll("tr")).filter((row) =>
      row.querySelector("td")
    );

    return rows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length === 0) {
          return null;
        }

        const noteSpan = row.querySelector('span[id$="_lblNote"]');
        const noteTextarea = row.querySelector('textarea[id$="_txtNote"]');
        const noteText = this.normalizeVisitNoteText(
          noteSpan?.textContent ||
            noteTextarea?.textContent ||
            cells[noteColumnIndex]?.textContent ||
            ""
        );

        return {
          date: extractText(cells[dateColumnIndex] || null),
          noteText,
          createdBy: extractText(cells[createdByColumnIndex] || null),
          createdDate: extractText(cells[createdDateColumnIndex] || null),
        } satisfies PatientVisitNoteRecord;
      })
      .filter((record): record is PatientVisitNoteRecord => {
        return Boolean(
          record &&
            (record.noteText ||
              record.date ||
              record.createdBy ||
              record.createdDate)
        );
      });
  }
}
