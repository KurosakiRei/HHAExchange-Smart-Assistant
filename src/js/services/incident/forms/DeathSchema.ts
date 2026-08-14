import { IncidentPayload, IncidentSchema } from "../IncidentTypes";
import { INCIDENT_OPTION_CATALOG } from "../IncidentOptionCatalog";

const TITLE_OPTIONS = [
  { value: "HHA / PCA / HCSS", label: "HHA / PCA / HCSS" },
  { value: "Family members", label: "Family members" },
  { value: "Other answer", label: "Other answer" },
];

const SERVICES_OPTIONS = [
  { value: "HHA / PCA", label: "HHA / PCA" },
  { value: "HCSS", label: "HCSS" },
  { value: "TBI", label: "TBI" },
];

const YES_NO_NA = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "N/A", label: "N/A" },
];

const YES_NO_UNKNOWN_NA = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "Unknown", label: "Unknown" },
  { value: "N/A", label: "N/A" },
];

const YES_NO_UNKNOWN = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "Unknown", label: "Unknown" },
];

const YES_NO_UNKNOWN_OTHER = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "Unknown", label: "Unknown" },
  { value: "Other answer", label: "Other answer" },
];

const OFFICIALS_OPTIONS = [
  { value: "NYPD", label: "NYPD" },
  { value: "NYFD", label: "NYFD" },
  { value: "Paramedics, Hatzalah", label: "Paramedics, Hatzalah" },
  { value: "Clerics", label: "Clerics" },
  { value: "Other answer", label: "Other answer" },
];

export const deathSchema: IncidentSchema = {
  incidentType: "death",
  displayName: "Death",
  sections: [
    {
      id: "death-main",
      title: "Patient Death Questionnaire",
      fields: [
        {
          id: "death-patient-name",
          bindTo: "patient.name",
          label: "Patient name",
          kind: "text",
          required: true,
        },
        {
          id: "death-admission-id",
          bindTo: "patient.admissionId",
          label: "Admission ID",
          kind: "text",
          required: true,
        },
        {
          id: "death-patient-dob",
          bindTo: "patient.dob",
          label: "Patient DOB",
          kind: "date",
          required: true,
        },
        {
          id: "death-reporter-name",
          bindTo: "reporter.name",
          label: "Who reported the death of the patient?",
          kind: "text",
          required: true,
          helperText: "Name of the person / short answer",
        },
        {
          id: "death-reporter-title",
          bindTo: "death.reportTitle",
          label: "What is the title of the person who reported death?",
          kind: "select",
          required: true,
          options: TITLE_OPTIONS,
        },
        {
          id: "death-reporter-title-other",
          bindTo: "death.reportTitleOther",
          label: "Title of reporter - Other",
          kind: "text",
          required: true,
          visibleWhen: (p: IncidentPayload) =>
            p.death.reportTitle === "Other answer",
        },
        {
          id: "death-services",
          bindTo: "death.servicesReceived",
          label: "Services Patient received?",
          kind: "select",
          required: true,
          options: SERVICES_OPTIONS,
        },
        {
          id: "death-vendor",
          bindTo: "patient.vendorOrContract",
          label: "Contract / Vendor",
          kind: "select",
          required: true,
          options: INCIDENT_OPTION_CATALOG.hospitalizationVendorContract,
        },
        {
          id: "death-place",
          bindTo: "death.placeOfDeath",
          label: "Place of death (Home, Hospital, ect.)",
          kind: "text",
          required: true,
        },
        {
          id: "death-date",
          bindTo: "death.dateOfDeath",
          label: "Date Of Death",
          kind: "date",
          required: true,
        },
        {
          id: "death-time",
          bindTo: "death.timeOfDeath",
          label: "Time Of Death",
          kind: "time",
          required: true,
        },
        {
          id: "death-service-hours",
          bindTo: "death.duringServiceHours",
          label: "Did the death occur during service hours?",
          kind: "select",
          required: true,
          options: YES_NO_NA,
        },
        {
          id: "death-caregiver-name",
          bindTo: "death.caregiverName",
          label: "Caregiver's Name",
          kind: "text",
          required: true,
          visibleWhen: (p: IncidentPayload) =>
            p.death.duringServiceHours === "Yes",
        },
        {
          id: "death-caregiver-activity",
          bindTo: "death.caregiverActivity",
          label: "What was the caregiver doing when the patient died?",
          kind: "textarea",
          required: true,
          visibleWhen: (p: IncidentPayload) =>
            p.death.duringServiceHours === "Yes",
        },
        {
          id: "death-patient-activity",
          bindTo: "death.patientActivityAtDeath",
          label: "What was the patient doing at the time of death?",
          kind: "textarea",
          required: true,
        },
        {
          id: "death-911-called",
          bindTo: "death.was911Called",
          label: "Was 911 called?",
          kind: "select",
          required: true,
          options: YES_NO_UNKNOWN_NA,
        },
        {
          id: "death-911-time",
          bindTo: "death.time911Called",
          label: "What was the time 911 called?",
          kind: "text",
          required: true,
          visibleWhen: (p: IncidentPayload) => p.death.was911Called === "Yes",
        },
        {
          id: "death-officials",
          bindTo: "death.officialsArrived",
          label:
            "Are any officials arrived at the patient's residence (NYPD, NYFD, paramedics, clerics)?",
          kind: "select",
          required: true,
          options: YES_NO_UNKNOWN_OTHER,
        },
        {
          id: "death-officials-other",
          bindTo: "death.officialsArrivedOther",
          label: "Officials arrived - Other",
          kind: "text",
          required: true,
          visibleWhen: (p: IncidentPayload) =>
            p.death.officialsArrived === "Other answer",
        },
        {
          id: "death-which-officials",
          bindTo: "death.whichOfficials",
          label: "Specify which officials arrived at the patient's residence?",
          kind: "multiselect",
          required: true,
          options: OFFICIALS_OPTIONS,
          visibleWhen: (p: IncidentPayload) =>
            p.death.officialsArrived === "Yes",
        },
        {
          id: "death-which-officials-other",
          bindTo: "death.whichOfficialsOther",
          label: "Which officials - Other",
          kind: "text",
          required: true,
          visibleWhen: (p: IncidentPayload) =>
            p.death.officialsArrived === "Yes" &&
            p.death.whichOfficials.includes("Other answer"),
        },
        {
          id: "death-family-notified",
          bindTo: "death.familyNotified",
          label: "Was the family notified?",
          kind: "select",
          required: true,
          options: YES_NO_UNKNOWN,
        },
        {
          id: "death-additional-details",
          bindTo: "death.additionalDetails",
          label: "Additional Details",
          kind: "textarea",
          required: true,
        },
        {
          id: "death-notes",
          bindTo: "notes",
          label: "Notes",
          kind: "textarea",
        },
      ],
    },
  ],
};
