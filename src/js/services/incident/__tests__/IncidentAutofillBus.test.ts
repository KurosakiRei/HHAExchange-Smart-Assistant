import { describe, expect, it } from "vitest";
import { IncidentAutofillBus } from "../IncidentAutofillBus";
import {
  IncidentAutofillJob,
  IncidentType,
  createEmptyIncidentPayload,
} from "../IncidentTypes";

function createJob(
  targetUrl: string,
  incidentType: IncidentType = "fall"
): IncidentAutofillJob {
  const now = Date.now();
  return {
    id: "test-job",
    incidentType,
    targetUrl,
    payload: createEmptyIncidentPayload(incidentType),
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
    sourceHost: "app.hhaexchange.com",
  };
}

describe("IncidentAutofillBus.isCurrentPageTarget", () => {
  it("matches the exact Forms id query", () => {
    const job = createJob(
      "https://forms.office.com/pages/responsepage.aspx?id=FORM_A&route=shorturl"
    );

    const matched = IncidentAutofillBus.isCurrentPageTarget(
      job,
      "https://forms.office.com/pages/responsepage.aspx?id=FORM_A&route=shorturl"
    );

    expect(matched).toBe(true);
  });

  it("rejects a different Forms id on the same pathname", () => {
    const job = createJob(
      "https://forms.office.com/pages/responsepage.aspx?id=FORM_A&route=shorturl"
    );

    const matched = IncidentAutofillBus.isCurrentPageTarget(
      job,
      "https://forms.office.com/pages/responsepage.aspx?id=FORM_B&route=shorturl"
    );

    expect(matched).toBe(false);
  });

  it("allows extra current query params when target params still match", () => {
    const job = createJob(
      "https://forms.office.com/pages/responsepage.aspx?id=FORM_A&route=shorturl"
    );

    const matched = IncidentAutofillBus.isCurrentPageTarget(
      job,
      "https://forms.office.com/pages/responsepage.aspx?id=FORM_A&route=shorturl&lang=en-US"
    );

    expect(matched).toBe(true);
  });

  it("matches forms short link redirect by incident type/title fallback", () => {
    const job = createJob("https://forms.office.com/r/gbMzuZavDr", "fall");

    const matched = IncidentAutofillBus.isCurrentPageTarget(
      job,
      "https://forms.office.com/pages/responsepage.aspx?id=FORM_A&route=shorturl",
      "FALL / ACCIDENT Questionnaire"
    );

    expect(matched).toBe(true);
  });

  it("rejects short-link fallback when forms title does not match incident type", () => {
    const job = createJob("https://forms.office.com/r/gbMzuZavDr", "fall");

    const matched = IncidentAutofillBus.isCurrentPageTarget(
      job,
      "https://forms.office.com/pages/responsepage.aspx?id=FORM_A&route=shorturl",
      "Hospitalization Questionnaire"
    );

    expect(matched).toBe(false);
  });

  it("matches SafeLinks wrapped short-link target by incident type/title fallback", () => {
    const wrappedTargetUrl =
      "https://nam11.safelinks.protection.outlook.com/?url=https%3A%2F%2Fforms.office.com%2Fr%2FgbMzuZavDr&data=foo";
    const job = createJob(wrappedTargetUrl, "fall");

    const matched = IncidentAutofillBus.isCurrentPageTarget(
      job,
      "https://forms.office.com/pages/responsepage.aspx?id=FORM_A&route=shorturl",
      "FALL / ACCIDENT Questionnaire"
    );

    expect(matched).toBe(true);
  });

  it("matches when forms short-link host differs after redirect (office -> microsoft)", () => {
    const job = createJob("https://forms.office.com/r/gbMzuZavDr", "fall");

    const matched = IncidentAutofillBus.isCurrentPageTarget(
      job,
      "https://forms.microsoft.com/pages/responsepage.aspx?id=FORM_A&route=shorturl",
      "FALL / ACCIDENT Questionnaire"
    );

    expect(matched).toBe(true);
  });
});
