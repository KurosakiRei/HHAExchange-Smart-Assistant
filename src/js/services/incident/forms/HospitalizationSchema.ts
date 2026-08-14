import { IncidentPayload, IncidentSchema } from "../IncidentTypes";
import {
  INCIDENT_OPTION_CATALOG,
  INCIDENT_OPTION_COUNTS,
} from "../IncidentOptionCatalog";

const ACCIDENT_REASONS = new Set<string>([
  "Planned Hospitalization",
  "Respiratory Distress",
  "Trauma / Injury",
  "Unwell (Malaise)",
  "Wound",
]);

function isHcssService(payload: IncidentPayload): boolean {
  return payload.patient.serviceType === "HCSS";
}

function isReasonOtherWithoutText(payload: IncidentPayload): boolean {
  return (
    payload.hospitalization.reason === "Other answer" &&
    !payload.hospitalization.reasonOtherText.trim()
  );
}

export const hospitalizationSchema: IncidentSchema = {
  incidentType: "hospitalization",
  displayName: "Hospitalization",
  sections: [
    {
      id: "initial-information",
      title: "Initial Information",
      fields: [
        {
          id: "patient-name",
          bindTo: "patient.name",
          label: "Patient Name",
          kind: "text",
          required: true,
        },
        {
          id: "patient-dob",
          bindTo: "patient.dob",
          label: "Patient DOB",
          kind: "text",
          required: true,
          placeholder: "MM/DD/YYYY",
        },
        {
          id: "admission-id",
          bindTo: "patient.admissionId",
          label: "Admission ID",
          kind: "text",
          required: true,
        },
        {
          id: "patient-service",
          bindTo: "patient.serviceType",
          label: "Patient Services",
          kind: "select",
          required: true,
          options: [
            { value: "HHA", label: "HHA" },
            { value: "PCA", label: "PCA" },
            { value: "HCSS", label: "HCSS (NHTD / TBI)" },
          ],
        },
        {
          id: "contract-or-vendor",
          bindTo: "patient.vendorOrContract",
          label: "Vendor / Contract",
          helperText: "服务类型为 HCSS 时自动切换为 NHTD / TBI Contract 选项。",
          kind: "select",
          required: true,
          options: (payload) =>
            isHcssService(payload)
              ? INCIDENT_OPTION_CATALOG.hcssContract
              : INCIDENT_OPTION_CATALOG.hospitalizationVendorContract,
        },
      ],
    },
    {
      id: "hcss-pre-step",
      title: "HCSS Pre-Step",
      description: "当服务类型为 HCSS 时，必须先完成该步骤。",
      visibleWhen: (payload) => isHcssService(payload),
      fields: [
        {
          id: "hcss-case",
          bindTo: "hospitalization.nhtdTbiCaseTypes",
          label: "NHTD / TBI Case",
          kind: "multiselect",
          required: true,
          options: INCIDENT_OPTION_CATALOG.nhtdTbiCase,
        },
        {
          id: "hcss-report-time",
          bindTo: "timeline.reportDateTime",
          label:
            "Specify the date and time you reported hospitalization to the personnel listed above",
          kind: "datetime-local",
          required: true,
        },
      ],
    },
    {
      id: "details-base",
      title: "Details",
      fields: [
        {
          id: "hospitalization-date",
          bindTo: "timeline.eventDate",
          label: "Date of Hospitalization",
          kind: "date",
          required: true,
        },
        {
          id: "hospitalization-time",
          bindTo: "timeline.eventTime",
          label: "Time of Hospitalization or Time of 911 Called",
          kind: "time",
          required: true,
        },
        {
          id: "hospital-name",
          bindTo: "hospitalization.hospitalName",
          label: "Hospital Name",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.hospitalName,
        },
        {
          id: "hospital-name-other",
          bindTo: "hospitalization.hospitalNameOtherText",
          label: "Hospital Name - Other",
          kind: "text",
          required: (payload) =>
            payload.hospitalization.hospitalName === "Other",
          visibleWhen: (payload) =>
            payload.hospitalization.hospitalName === "Other",
        },
        {
          id: "hospitalization-during-service-hours",
          bindTo: "hospitalization.duringServiceHours",
          label: "During Service Hours?",
          kind: "select",
          required: true,
          options: [
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
            { value: "Unknown", label: "Unknown" },
          ],
        },
        {
          id: "hospitalization-reason",
          bindTo: "hospitalization.reason",
          label: "Reason For Hospitalization",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.hospitalizationReason,
        },
        {
          id: "hospitalization-reason-other",
          bindTo: "hospitalization.reasonOtherText",
          label: "Reason For Hospitalization - Other",
          kind: "text",
          required: (payload) =>
            payload.hospitalization.reason === "Other answer",
          visibleWhen: (payload) =>
            payload.hospitalization.reason === "Other answer",
        },
      ],
    },
    {
      id: "reason-infection",
      title: "Infection Details",
      visibleWhen: (payload) => payload.hospitalization.reason === "Infections",
      fields: [
        {
          id: "infection-type",
          bindTo: "hospitalization.infectionType",
          label: "Type of Infection",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.infectionType,
        },
        {
          id: "infection-details",
          bindTo: "hospitalization.infectionDetails",
          label: "Infection - Details",
          kind: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "reason-accident",
      title: "Accident Details",
      visibleWhen: (payload) =>
        ACCIDENT_REASONS.has(payload.hospitalization.reason),
      fields: [
        {
          id: "accident-details",
          bindTo: "hospitalization.accidentDetails",
          label: "Accident",
          kind: "textarea",
          required: true,
          helperText:
            "该字段在 Planned/Respiratory Distress/Trauma-Injury/Unwell/Wound 分支下为必填。",
        },
      ],
    },
    {
      id: "source-and-reporter",
      title: "Source & Notes",
      description: "当 Reason=Other 且未填写文本时，本区块按官方表现隐藏。",
      visibleWhen: (payload) => !isReasonOtherWithoutText(payload),
      fields: [
        {
          id: "source-of-information",
          bindTo: "reporter.source",
          label: "Source Of Information",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.sourceOfInformation,
        },
        {
          id: "name-who-report",
          bindTo: "reporter.name",
          label: "Name who report hospitalization",
          kind: "text",
          required: true,
        },
        {
          id: "reporter-title",
          bindTo: "reporter.title",
          label: "Reporter Title",
          kind: "text",
        },
        {
          id: "hospitalization-notes",
          bindTo: "notes",
          label: "Notes",
          kind: "textarea",
        },
      ],
    },
  ],
};

if (INCIDENT_OPTION_COUNTS.hospitalizationVendorContract !== 41) {
  console.warn(
    "[IncidentSchema] hospitalization Vendor/Contract option count mismatch:",
    INCIDENT_OPTION_COUNTS.hospitalizationVendorContract
  );
}

if (INCIDENT_OPTION_COUNTS.hospitalName !== 69) {
  console.warn(
    "[IncidentSchema] hospitalization Hospital Name option count mismatch:",
    INCIDENT_OPTION_COUNTS.hospitalName
  );
}
