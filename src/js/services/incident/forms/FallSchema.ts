import { IncidentPayload, IncidentSchema } from "../IncidentTypes";
import { INCIDENT_OPTION_CATALOG } from "../IncidentOptionCatalog";

function isNhtdTbiService(payload: IncidentPayload): boolean {
  return payload.patient.serviceType === "NHTD_TBI";
}

export const fallSchema: IncidentSchema = {
  incidentType: "fall",
  displayName: "Fall / Accident",
  sections: [
    {
      id: "fall-base",
      title: "Basic Information",
      fields: [
        {
          id: "fall-accident-type",
          bindTo: "fall.accidentType",
          label: "Type of Accident",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.fallAccidentType,
        },
        {
          id: "fall-admission-id",
          bindTo: "patient.admissionId",
          label: "Admission ID",
          kind: "text",
          required: true,
        },
        {
          id: "fall-vendor-contact",
          bindTo: "patient.vendorOrContract",
          label: "Vendor / Contact Name",
          kind: "text",
          required: true,
        },
        {
          id: "fall-patient-name",
          bindTo: "patient.name",
          label: "Patient name",
          kind: "text",
          required: true,
        },
        {
          id: "fall-service",
          bindTo: "patient.serviceType",
          label: "Services Patient received",
          kind: "select",
          required: true,
          options: [
            { value: "HHA", label: "HHA" },
            { value: "PCA", label: "PCA" },
            {
              value: "NHTD_TBI",
              label: "NHTD / TBI Waiver Program",
            },
          ],
        },
      ],
    },
    {
      id: "fall-hcss-pre-step",
      title: "NHTD / TBI Additional Step",
      visibleWhen: (payload) => isNhtdTbiService(payload),
      fields: [
        {
          id: "fall-hcss-case",
          bindTo: "fall.nhtdTbiCaseTypes",
          label: "NHTD / TBI Case",
          kind: "multiselect",
          required: true,
          options: INCIDENT_OPTION_CATALOG.nhtdTbiCase,
        },
        {
          id: "fall-hcss-report-time",
          bindTo: "timeline.reportDateTime",
          label:
            "Specify the date and time you reported hospitalization to the personnel listed above",
          kind: "datetime-local",
          required: true,
        },
      ],
    },
    {
      id: "fall-main-tree",
      title: "Emergency Details",
      fields: [
        {
          id: "fall-reporter-name",
          bindTo: "reporter.name",
          label: "Who reported emergency?",
          kind: "text",
          required: true,
        },
        {
          id: "fall-reporter-title",
          bindTo: "reporter.title",
          label: "Title of person who reported emergency",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.fallReporterTitle,
        },
        {
          id: "fall-date",
          bindTo: "timeline.eventDate",
          label: "Date of Fall / Accident",
          kind: "date",
          required: true,
        },
        {
          id: "fall-time",
          bindTo: "timeline.eventTime",
          label: "Time of Fall / Accident",
          kind: "time",
          required: true,
        },
        {
          id: "fall-911",
          bindTo: "fall.was911Dialed",
          label: "Was 911 dialed?",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.yesNoUnknown,
        },
        {
          id: "fall-911-caller",
          bindTo: "fall.whoCalled911",
          label: "Who called 911",
          kind: "text",
          required: true,
          visibleWhen: (payload) => payload.fall.was911Dialed === "Yes",
        },
        {
          id: "fall-service-hours",
          bindTo: "fall.duringServiceHours",
          label: "Was it during service hours?",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.yesNo,
        },
        {
          id: "fall-caregiver",
          bindTo: "fall.caregiverInfo",
          label: "Caregiver Name & Caregiver Code",
          kind: "text",
          required: true,
          visibleWhen: (payload) => payload.fall.duringServiceHours === "Yes",
        },
        {
          id: "fall-aide-whereabouts",
          bindTo: "fall.aideWhereabouts",
          label:
            "Where was the aide during the accident and what was the aide doing?",
          kind: "textarea",
          required: true,
          visibleWhen: (payload) => payload.fall.duringServiceHours === "Yes",
        },
      ],
    },
    {
      id: "fall-risk-questions",
      title: "Risk Assessment",
      fields: [
        {
          id: "fall-patient-activity",
          bindTo: "fall.patientActivity",
          label: "What was the patient doing at the time of fall",
          kind: "textarea",
          required: true,
        },
        {
          id: "fall-lighting",
          bindTo: "fall.adequateLighting",
          label: "Did the area where the fall occurred have adequate lighting?",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.yesNoUnknown,
        },
        {
          id: "fall-footwear",
          bindTo: "fall.nonSlipperyFootwear",
          label: "Was the patient wearing NON-Slippery footwear?",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.yesNoUnknown,
        },
        {
          id: "fall-assistive-device",
          bindTo: "fall.assistiveDeviceUsed",
          label:
            "Did the patient use any assistive devices (walker, wheelchair, cane, etc.)?",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.yesNoUnknown,
        },
        {
          id: "fall-assistive-device-specify",
          bindTo: "fall.assistiveDeviceSpecify",
          label: "Specify what device was in use.",
          kind: "select",
          required: true,
          visibleWhen: (payload) => payload.fall.assistiveDeviceUsed === "Yes",
          options: [
            { value: "Cane", label: "Cane" },
            { value: "Wheelchair", label: "Wheelchair" },
            { value: "Walker", label: "Walker" },
            { value: "Hoyer Lift", label: "Hoyer Lift" },
            { value: "Other answer", label: "Other answer" },
          ],
        },
        {
          id: "fall-assistive-device-specify-other",
          bindTo: "fall.assistiveDeviceSpecifyOther",
          label: "Specify what device was in use - Other",
          kind: "text",
          required: true,
          visibleWhen: (payload) =>
            payload.fall.assistiveDeviceUsed === "Yes" &&
            payload.fall.assistiveDeviceSpecify === "Other answer",
        },
        {
          id: "fall-family-notified",
          bindTo: "fall.familyPowerAttorneyNotified",
          label: "Was the family/power of attorney notified?",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.yesNoUnknown,
        },
        {
          id: "fall-reason-for-fall",
          bindTo: "fall.reasonForFall",
          label: "Reason for fall (Ex. Dizziness, tripped, legs gave out)",
          kind: "text",
          required: true,
        },
        {
          id: "fall-body-damage-details",
          bindTo: "fall.bodyDamageDetails",
          label: "Any damage to the patient's body? Locations of injuries?",
          kind: "textarea",
          required: true,
          helperText:
            "Имеются ли повреждения на теле пациента? Местонахождение травм? / 患者身体有受到什么损伤？受伤的部位是哪里？",
        },
        {
          id: "fall-hospitalization-result",
          bindTo: "fall.hospitalizationResult",
          label: "Any Hospitalization as a result of the fall",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.yesNoUnknown,
        },
        {
          id: "fall-helped-patient-up",
          bindTo: "fall.helpedPatientUp",
          label: "How / Who helped patient to get up",
          kind: "text",
          required: true,
        },
        {
          id: "fall-notes",
          bindTo: "notes",
          label: "NOTES",
          kind: "textarea",
          helperText: "Add any additional information about the accident.",
        },
      ],
    },
  ],
};
