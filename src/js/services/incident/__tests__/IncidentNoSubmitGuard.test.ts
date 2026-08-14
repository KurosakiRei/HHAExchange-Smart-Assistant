/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest";
import { installNoSubmitGuard } from "../IncidentAutofillOrchestrator";

describe("incident no-submit guard", () => {
  it("blocks click and submit attempts on submit controls", () => {
    document.body.innerHTML = `
      <form id="incident-form">
        <label for="patient-name">Patient name</label>
        <input id="patient-name" type="text" />
        <button type="submit">Submit</button>
      </form>
    `;

    const form = document.getElementById("incident-form") as HTMLFormElement;
    const submitButton = form.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;

    const cleanup = installNoSubmitGuard(document);

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    submitButton.dispatchEvent(clickEvent);

    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    form.dispatchEvent(submitEvent);

    const blocked = cleanup();
    expect(blocked.some((entry) => entry.startsWith("blocked-click:"))).toBe(
      true
    );
    expect(blocked).toContain("blocked-form-submit");
  });

  it("does not block navigation buttons", () => {
    document.body.innerHTML = `
      <form id="incident-form">
        <button id="next-btn" type="submit">Next</button>
        <button id="back-btn" type="submit">Back</button>
        <button id="continue-btn" type="submit">Continue</button>
      </form>
    `;

    const nextBtn = document.getElementById("next-btn") as HTMLButtonElement;
    const backBtn = document.getElementById("back-btn") as HTMLButtonElement;
    const continueBtn = document.getElementById(
      "continue-btn"
    ) as HTMLButtonElement;

    const cleanup = installNoSubmitGuard(document);

    nextBtn.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true })
    );
    backBtn.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true })
    );
    continueBtn.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true })
    );

    const blocked = cleanup();
    const blockedClicks = blocked.filter((entry) =>
      entry.startsWith("blocked-click:")
    );
    expect(blockedClicks.length).toBe(0);
  });
});
