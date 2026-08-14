export type IncidentType = "hospitalization" | "fall" | "death";

export type IncidentServiceType =
  | "HHA"
  | "PCA"
  | "HCSS"
  | "NHTD_TBI"
  | "UNKNOWN";

export type IncidentYesNoUnknown = "Yes" | "No" | "Unknown";

export type IncidentFieldKind =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "time"
  | "datetime-local"
  | "multiselect";

export type IncidentFieldValue = string | string[];

export interface IncidentPatientInfo {
  name: string;
  dob: string;
  admissionId: string;
  serviceType: IncidentServiceType;
  vendorOrContract: string;
}

export interface IncidentReporterInfo {
  name: string;
  title: string;
  source: string;
}

export interface IncidentTimelineInfo {
  eventDate: string;
  eventTime: string;
  reportDateTime: string;
}

export interface IncidentHospitalizationInfo {
  nhtdTbiCaseTypes: string[];
  reason: string;
  reasonOtherText: string;
  infectionType: string;
  infectionDetails: string;
  accidentDetails: string;
  hospitalName: string;
  hospitalNameOtherText: string;
  duringServiceHours: IncidentYesNoUnknown | "";
}

export interface IncidentFallInfo {
  accidentType: string;
  nhtdTbiCaseTypes: string[];
  was911Dialed: IncidentYesNoUnknown | "";
  whoCalled911: string;
  duringServiceHours: "Yes" | "No" | "";
  caregiverInfo: string;
  aideWhereabouts: string;
  patientActivity: string;
  adequateLighting: IncidentYesNoUnknown | "";
  nonSlipperyFootwear: IncidentYesNoUnknown | "";
  assistiveDeviceUsed: IncidentYesNoUnknown | "";
  assistiveDeviceSpecify: string;
  assistiveDeviceSpecifyOther: string;
  familyPowerAttorneyNotified: IncidentYesNoUnknown | "";
  reasonForFall: string;
  bodyDamageDetails: string;
  hospitalizationResult: IncidentYesNoUnknown | "";
  helpedPatientUp: string;
}

export interface IncidentDeathInfo {
  reportTitle: string;
  reportTitleOther: string;
  servicesReceived: string;
  placeOfDeath: string;
  dateOfDeath: string;
  timeOfDeath: string;
  duringServiceHours: string;
  caregiverName: string;
  caregiverActivity: string;
  patientActivityAtDeath: string;
  was911Called: string;
  time911Called: string;
  officialsArrived: string;
  officialsArrivedOther: string;
  whichOfficials: string[];
  whichOfficialsOther: string;
  familyNotified: string;
  additionalDetails: string;
}

export interface IncidentGeneratedDrafts {
  mailSubject: string;
  mailBody: string;
  faxCommand: string;
  faxBody: string;
  generatedAt: number;
}

export interface IncidentSafetyInfo {
  noSubmitGuardTriggered: boolean;
  blockedActions: string[];
}

export interface IncidentPayload {
  incidentType: IncidentType;
  patient: IncidentPatientInfo;
  reporter: IncidentReporterInfo;
  timeline: IncidentTimelineInfo;
  hospitalization: IncidentHospitalizationInfo;
  fall: IncidentFallInfo;
  death: IncidentDeathInfo;
  notes: string;
  generated: IncidentGeneratedDrafts | null;
  safety: IncidentSafetyInfo;
}

export interface IncidentOption {
  value: string;
  label: string;
}

export type IncidentOptionProvider =
  | IncidentOption[]
  | ((payload: IncidentPayload) => IncidentOption[]);

export type IncidentPredicate = (payload: IncidentPayload) => boolean;

export interface IncidentFieldDefinition {
  id: string;
  bindTo: string;
  label: string;
  kind: IncidentFieldKind;
  required?: boolean | IncidentPredicate;
  visibleWhen?: IncidentPredicate;
  options?: IncidentOptionProvider;
  placeholder?: string;
  helperText?: string;
  normalize?: (
    value: IncidentFieldValue,
    payload: IncidentPayload
  ) => IncidentFieldValue;
}

export interface IncidentSchemaSection {
  id: string;
  title: string;
  description?: string;
  visibleWhen?: IncidentPredicate;
  fields: IncidentFieldDefinition[];
}

export interface IncidentSchema {
  incidentType: IncidentType;
  displayName: string;
  sections: IncidentSchemaSection[];
}

export interface IncidentAutofillFailure {
  fieldId: string;
  label: string;
  code:
    | "required_missing"
    | "option_mismatch"
    | "branch_unreached"
    | "field_not_found"
    | "field_not_interactable"
    | "navigation_failed"
    | "config_missing"
    | "runtime_error";
  reason: string;
  suggestion: string;
}

export type IncidentAutofillJobStatus =
  | "PENDING"
  | "OPENING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface IncidentAutofillJob {
  id: string;
  incidentType: IncidentType;
  targetUrl: string;
  payload: IncidentPayload;
  status: IncidentAutofillJobStatus;
  createdAt: number;
  updatedAt: number;
  sourceHost: string;
  result?: IncidentAutofillResult;
  errorMessage?: string;
}

export interface IncidentAutofillResult {
  jobId?: string;
  status: "COMPLETED" | "FAILED";
  startedAt: number;
  endedAt: number;
  totalFields: number;
  successCount: number;
  failedFields: IncidentAutofillFailure[];
  blockedActions: string[];
  manualSubmitRequired: true;
}

export function createEmptyIncidentPayload(
  incidentType: IncidentType
): IncidentPayload {
  return {
    incidentType,
    patient: {
      name: "",
      dob: "",
      admissionId: "",
      serviceType: "UNKNOWN",
      vendorOrContract: "",
    },
    reporter: {
      name: "",
      title: "",
      source: "",
    },
    timeline: {
      eventDate: "",
      eventTime: "",
      reportDateTime: "",
    },
    hospitalization: {
      nhtdTbiCaseTypes: [],
      reason: "",
      reasonOtherText: "",
      infectionType: "",
      infectionDetails: "",
      accidentDetails: "",
      hospitalName: "",
      hospitalNameOtherText: "",
      duringServiceHours: "",
    },
    fall: {
      accidentType: "",
      nhtdTbiCaseTypes: [],
      was911Dialed: "",
      whoCalled911: "",
      duringServiceHours: "",
      caregiverInfo: "",
      aideWhereabouts: "",
      patientActivity: "",
      adequateLighting: "",
      nonSlipperyFootwear: "",
      assistiveDeviceUsed: "",
      assistiveDeviceSpecify: "",
      assistiveDeviceSpecifyOther: "",
      familyPowerAttorneyNotified: "",
      reasonForFall: "",
      bodyDamageDetails: "",
      hospitalizationResult: "",
      helpedPatientUp: "",
    },
    death: {
      reportTitle: "",
      reportTitleOther: "",
      servicesReceived: "",
      placeOfDeath: "",
      dateOfDeath: "",
      timeOfDeath: "",
      duringServiceHours: "",
      caregiverName: "",
      caregiverActivity: "",
      patientActivityAtDeath: "",
      was911Called: "",
      time911Called: "",
      officialsArrived: "",
      officialsArrivedOther: "",
      whichOfficials: [],
      whichOfficialsOther: "",
      familyNotified: "",
      additionalDetails: "",
    },
    notes: "",
    generated: null,
    safety: {
      noSubmitGuardTriggered: false,
      blockedActions: [],
    },
  };
}

export function cloneIncidentPayload(
  payload: IncidentPayload
): IncidentPayload {
  return JSON.parse(JSON.stringify(payload)) as IncidentPayload;
}

export function cloneIncidentAutofillJob(
  job: IncidentAutofillJob
): IncidentAutofillJob {
  return JSON.parse(JSON.stringify(job)) as IncidentAutofillJob;
}

export function getValueByPath(
  payload: IncidentPayload,
  path: string
): IncidentFieldValue | undefined {
  const parts = path.split(".");
  let cursor: any = payload;

  for (const part of parts) {
    if (cursor == null || typeof cursor !== "object") {
      return undefined;
    }
    cursor = cursor[part];
  }

  if (typeof cursor === "string" || Array.isArray(cursor)) {
    return cursor;
  }

  return undefined;
}

export function setValueByPath(
  payload: IncidentPayload,
  path: string,
  value: IncidentFieldValue
): void {
  const parts = path.split(".");
  let cursor: any = payload;

  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!cursor[part] || typeof cursor[part] !== "object") {
      cursor[part] = {};
    }
    cursor = cursor[part];
  }

  cursor[parts[parts.length - 1]] = value;
}

export function isFieldVisible(
  field: IncidentFieldDefinition,
  payload: IncidentPayload
): boolean {
  if (!field.visibleWhen) {
    return true;
  }

  try {
    return field.visibleWhen(payload);
  } catch {
    return false;
  }
}

export function isFieldRequired(
  field: IncidentFieldDefinition,
  payload: IncidentPayload
): boolean {
  if (typeof field.required === "boolean") {
    return field.required;
  }

  if (typeof field.required === "function") {
    try {
      return field.required(payload);
    } catch {
      return false;
    }
  }

  return false;
}

export function isValuePresent(value: IncidentFieldValue | undefined): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return false;
}

export function toDisplayValue(value: IncidentFieldValue | undefined): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return "";
}

export function getIncidentTypeLabel(incidentType: IncidentType): string {
  switch (incidentType) {
    case "hospitalization":
      return "Hospitalization";
    case "fall":
      return "Fall / Accident";
    case "death":
      return "Death";
    default:
      return incidentType;
  }
}

export function resolveFieldOptions(
  field: IncidentFieldDefinition,
  payload: IncidentPayload
): IncidentOption[] {
  if (!field.options) {
    return [];
  }

  if (typeof field.options === "function") {
    try {
      return field.options(payload);
    } catch {
      return [];
    }
  }

  return field.options;
}

export interface IncidentPrefillData {
  patientName?: string;
  patientDob?: string;
  admissionId?: string;
  serviceType?: IncidentServiceType;
  vendorOrContract?: string;
}

export function applyPrefillToPayload(
  payload: IncidentPayload,
  prefill: IncidentPrefillData
): IncidentPayload {
  if (prefill.patientName) {
    payload.patient.name = prefill.patientName;
  }
  if (prefill.patientDob) {
    payload.patient.dob = prefill.patientDob;
  }
  if (prefill.admissionId) {
    payload.patient.admissionId = prefill.admissionId;
  }
  if (prefill.serviceType) {
    payload.patient.serviceType = prefill.serviceType;
  }
  if (prefill.vendorOrContract) {
    payload.patient.vendorOrContract = prefill.vendorOrContract;
  }
  return payload;
}
