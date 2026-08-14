import {
  IncidentGeneratedDrafts,
  IncidentPayload,
  getIncidentTypeLabel,
} from "./IncidentTypes";

function safe(value: string): string {
  const trimmed = (value || "").trim();
  return trimmed || "-";
}

function buildSharedSummary(payload: IncidentPayload): string {
  const lines = [
    `Incident Type: ${getIncidentTypeLabel(payload.incidentType)}`,
    `Patient: ${safe(payload.patient.name)} (${safe(
      payload.patient.admissionId
    )})`,
    `DOB: ${safe(payload.patient.dob)}`,
    `Service: ${safe(payload.patient.serviceType)}`,
    `Vendor/Contract: ${safe(payload.patient.vendorOrContract)}`,
    `Event Date/Time: ${safe(payload.timeline.eventDate)} ${safe(
      payload.timeline.eventTime
    )}`,
    `Reported By: ${safe(payload.reporter.name)} ${safe(
      payload.reporter.title
    )}`.trim(),
  ];

  switch (payload.incidentType) {
    case "hospitalization": {
      let reasonVal = payload.hospitalization.reason;
      if (
        reasonVal === "Other answer" &&
        payload.hospitalization.reasonOtherText
      ) {
        reasonVal = `Other (${payload.hospitalization.reasonOtherText})`;
      }
      lines.push(`Reason: ${safe(reasonVal)}`);

      let hospitalVal = payload.hospitalization.hospitalName;
      if (
        hospitalVal === "Other" &&
        payload.hospitalization.hospitalNameOtherText
      ) {
        hospitalVal = `Other (${payload.hospitalization.hospitalNameOtherText})`;
      }
      lines.push(`Hospital: ${safe(hospitalVal)}`);

      if (payload.hospitalization.infectionType) {
        lines.push(
          `Infection Type: ${safe(payload.hospitalization.infectionType)}`
        );
      }
      if (payload.hospitalization.accidentDetails) {
        lines.push(
          `Accident Details: ${safe(payload.hospitalization.accidentDetails)}`
        );
      }
      break;
    }
    case "fall":
      lines.push(`Accident Type: ${safe(payload.fall.accidentType)}`);
      lines.push(`911 Dialed: ${safe(payload.fall.was911Dialed)}`);
      if (payload.fall.whoCalled911) {
        lines.push(`Who Called 911: ${safe(payload.fall.whoCalled911)}`);
      }
      lines.push(
        `During Service Hours: ${safe(payload.fall.duringServiceHours)}`
      );
      lines.push(
        `Family/POA Notified: ${safe(payload.fall.familyPowerAttorneyNotified)}`
      );
      if (payload.fall.reasonForFall) {
        lines.push(`Reason For Fall: ${safe(payload.fall.reasonForFall)}`);
      }
      if (payload.fall.hospitalizationResult) {
        lines.push(
          `Hospitalization Result: ${safe(payload.fall.hospitalizationResult)}`
        );
      }
      if (payload.fall.helpedPatientUp) {
        lines.push(`Helped Patient Up: ${safe(payload.fall.helpedPatientUp)}`);
      }
      break;
    case "death":
      lines.push(`Reporter Title: ${safe(payload.death.reportTitle)}`);
      lines.push(`Services Received: ${safe(payload.death.servicesReceived)}`);
      break;
    default:
      break;
  }

  if (payload.notes) {
    lines.push(`Notes: ${payload.notes.trim()}`);
  }

  return lines.join("\n");
}

export class IncidentDraftGenerator {
  static generate(payload: IncidentPayload): IncidentGeneratedDrafts {
    const incidentLabel = getIncidentTypeLabel(payload.incidentType);
    const patientRef = `${safe(payload.patient.name)} ${safe(
      payload.patient.admissionId
    )}`;
    const summary = buildSharedSummary(payload);

    const mailSubject = `[Incident][${incidentLabel}] ${patientRef}`;
    const mailBody = [
      "Hello Team,",
      "",
      "Please review the incident details below:",
      "",
      summary,
      "",
      "This notification is auto-generated from Incident Composer.",
      "Official form submission remains manual by design.",
      "",
      "Thanks,",
      "HHA Smart Assistant",
    ].join("\n");

    const faxCommand = `Incident Update - ${incidentLabel}`;
    const faxBody = [
      `Incident Type: ${incidentLabel}`,
      `Patient: ${patientRef}`,
      "",
      summary,
      "",
      "Please process and advise if any additional documentation is required.",
    ].join("\n");

    return {
      mailSubject,
      mailBody,
      faxCommand,
      faxBody,
      generatedAt: Date.now(),
    };
  }
}
