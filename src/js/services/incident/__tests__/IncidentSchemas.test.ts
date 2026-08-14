import { describe, expect, it } from "vitest";
import { IncidentSchemaRegistry } from "../IncidentSchemaRegistry";
import { INCIDENT_OPTION_COUNTS } from "../IncidentOptionCatalog";
import { createEmptyIncidentPayload } from "../IncidentTypes";

function visibleFieldIds(
  payload: ReturnType<typeof createEmptyIncidentPayload>
): Set<string> {
  return new Set(
    IncidentSchemaRegistry.getVisibleFields(payload).map((field) => field.id)
  );
}

describe("incident option catalog", () => {
  it("keeps agreed option counts", () => {
    expect(INCIDENT_OPTION_COUNTS.hospitalizationVendorContract).toBe(41);
    expect(INCIDENT_OPTION_COUNTS.deathVendor).toBe(43);
    expect(INCIDENT_OPTION_COUNTS.hospitalName).toBe(69);
    expect(INCIDENT_OPTION_COUNTS.hospitalizationReason).toBe(29);
  });
});

describe("hospitalization schema branching", () => {
  it("shows HCSS pre-step only for HCSS service", () => {
    const payload = createEmptyIncidentPayload("hospitalization");
    payload.patient.serviceType = "HHA";
    let ids = visibleFieldIds(payload);
    expect(ids.has("hcss-case")).toBe(false);
    expect(ids.has("hcss-report-time")).toBe(false);

    payload.patient.serviceType = "HCSS";
    ids = visibleFieldIds(payload);
    expect(ids.has("hcss-case")).toBe(true);
    expect(ids.has("hcss-report-time")).toBe(true);
  });

  it("hides source section when reason is Other without details", () => {
    const payload = createEmptyIncidentPayload("hospitalization");
    payload.hospitalization.reason = "Other answer";
    payload.hospitalization.reasonOtherText = "";
    let ids = visibleFieldIds(payload);

    expect(ids.has("hospitalization-reason-other")).toBe(true);
    expect(ids.has("source-of-information")).toBe(false);

    payload.hospitalization.reasonOtherText = "Custom reason";
    ids = visibleFieldIds(payload);
    expect(ids.has("source-of-information")).toBe(true);
  });

  it("opens infection and accident detail branches", () => {
    const payload = createEmptyIncidentPayload("hospitalization");
    payload.hospitalization.reason = "Infections";
    let ids = visibleFieldIds(payload);
    expect(ids.has("infection-type")).toBe(true);
    expect(ids.has("infection-details")).toBe(true);

    payload.hospitalization.reason = "Trauma / Injury";
    ids = visibleFieldIds(payload);
    expect(ids.has("accident-details")).toBe(true);
  });
});

describe("fall schema branching", () => {
  it("shows NHTD/TBI pre-step only for waiver service", () => {
    const payload = createEmptyIncidentPayload("fall");
    payload.patient.serviceType = "HHA";
    let ids = visibleFieldIds(payload);
    expect(ids.has("fall-hcss-case")).toBe(false);

    payload.patient.serviceType = "NHTD_TBI";
    ids = visibleFieldIds(payload);
    expect(ids.has("fall-hcss-case")).toBe(true);
    expect(ids.has("fall-hcss-report-time")).toBe(true);
  });

  it("unlocks conditional 911 and service-hour follow-up fields", () => {
    const payload = createEmptyIncidentPayload("fall");

    payload.fall.was911Dialed = "No";
    let ids = visibleFieldIds(payload);
    expect(ids.has("fall-911-caller")).toBe(false);

    payload.fall.was911Dialed = "Yes";
    ids = visibleFieldIds(payload);
    expect(ids.has("fall-911-caller")).toBe(true);

    payload.fall.duringServiceHours = "No";
    ids = visibleFieldIds(payload);
    expect(ids.has("fall-caregiver")).toBe(false);
    expect(ids.has("fall-aide-whereabouts")).toBe(false);

    payload.fall.duringServiceHours = "Yes";
    ids = visibleFieldIds(payload);
    expect(ids.has("fall-caregiver")).toBe(true);
    expect(ids.has("fall-aide-whereabouts")).toBe(true);
  });

  it("contains restored question set from official 21-question form", () => {
    const payload = createEmptyIncidentPayload("fall");
    const ids = visibleFieldIds(payload);

    expect(ids.has("fall-family-notified")).toBe(true);
    expect(ids.has("fall-reason-for-fall")).toBe(true);
    expect(ids.has("fall-body-damage-details")).toBe(true);
    expect(ids.has("fall-hospitalization-result")).toBe(true);
    expect(ids.has("fall-helped-patient-up")).toBe(true);
    expect(ids.has("fall-notes")).toBe(true);

    const schema = IncidentSchemaRegistry.getSchema("fall");
    const fields = schema.sections.flatMap((section) => section.fields);
    const serviceHourField = fields.find(
      (field) => field.id === "fall-service-hours"
    );
    const reporterTitleField = fields.find(
      (field) => field.id === "fall-reporter-title"
    );

    const serviceHourOptions =
      typeof serviceHourField?.options === "function"
        ? serviceHourField.options(payload)
        : serviceHourField?.options || [];
    const reporterTitleOptions =
      typeof reporterTitleField?.options === "function"
        ? reporterTitleField.options(payload)
        : reporterTitleField?.options || [];

    expect(serviceHourOptions.map((option) => option.value)).toEqual([
      "Yes",
      "No",
    ]);
    expect(reporterTitleOptions.map((option) => option.value)).toEqual([
      "Family member",
      "Caregiver (PCA, HHA, HCSS)",
      "Vendor (Insurance Plan)",
    ]);
  });
});
