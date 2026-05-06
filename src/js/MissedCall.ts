import {
  visitActionSelector,
  visitActionOptionSelector,
  visitReasonSelector,
  visitReasonOptionSelector,
  visitNotesSelector,
  visitVerifyStarSelector,
  visitScheduleTimeSelector,
  visitPatientNameSelector,
  visitDateSelector,
  visitAuditPatientSelector,
  caregiverInfoNameSelector,
  visitStartTimeInputSelector,
  visitEndTimeInputSelector,
  prebillingSearchResultsSelector,
  prebillingVisitAdmissionIdSelector,
  prebillingVisitDateSelector,
  prebillingVisitScheduledTimeSelector,
} from "../utils/templates&const";

import { sleep, getTodayMMDD, convertMilitaryTime } from "../utils/util";

declare type ReasonType =
  | "Attendant failed to call in"
  | "Attendant failed to call out"
  | "Attendant failed to call in and out";

const templateForReason = {
  "Attendant failed to call in": (
    patientName: string,
    aideName: string,
    schedule: {
      startTime: string;
      endTime: string;
    }
  ) =>
    `I spoke to patient ${patientName} and aide ${aideName} on ${getTodayMMDD()}. The patient confirmed that ${aideName} arrived at ${
      schedule.startTime
    }. I spoke to the aide, who stated they forgot to clock in. The aide was reminded to clock in and out for every shift, and a counseling note was placed on their profile.`,
  "Attendant failed to call out": (
    patientName: string,
    aideName: string,
    schedule: {
      startTime: string;
      endTime: string;
    }
  ) =>
    `I spoke to patient ${patientName} on ${getTodayMMDD()}. The patient confirmed that aide ${aideName} left at ${
      schedule.endTime
    }. I contacted the aide, who stated they forgot to clock out. The aide was reminded to clock in and out for every shift, and a counseling note was placed on their profile. A timesheet will be submitted for this.`,
  "Attendant failed to call in and out": (
    patientName: string,
    aideName: string,
    schedule: {
      startTime: string;
      endTime: string;
    }
  ) =>
    `I spoke to patient ${patientName} and aide ${aideName} on ${getTodayMMDD()}. The patient confirmed that ${aideName} arrived at ${
      schedule.startTime
    } and left at ${
      schedule.endTime
    }. I spoke to the aide, who stated they forgot to clock in and out. The aide was reminded to clock in and out for every shift, and a counseling note was placed on their profile. A timesheet will be submitted for this.`,
};

export const missedCallResolver = async (
  reason: ReasonType,
  iframeDoc?: Document
) => {
  const ctx: Document = iframeDoc || document;
  let aideName = getAideName(ctx),
    patientName = $(visitPatientNameSelector, ctx).text();

  missedCallTimeInputer(reason, ctx);
  await missedCalledReasonChooser(reason, ctx);
  $(visitNotesSelector, ctx).val(
    templateForReason[reason](patientName, aideName, getScheduleTime(ctx))
  );
  $(visitNotesSelector, ctx)[0].dispatchEvent(new Event("change"));
  if ($(visitVerifyStarSelector, ctx).length > 0)
    $(visitAuditPatientSelector, ctx).click();
};

/* export const missedOutResolver = async() => {
    let aideName = getAideName(),
        patientName = $(visitPatientNameSelector)
    
    await MissCalledReasonChooser("Attendant failed to call out")
    $(visitNotesSelector).val(templateForReason["Attendant failed to call in"](patientName, aideName, getScheduleTime()))
    $(visitNotesSelector)[0].dispatchEvent(new Event("change"))
    if ($(visitVerifyStarSelector).length > 0) $(visitAuditPatientSelector).click()
}

export const missedInOutResolver = async() => {
    let aideName = getAideName(),
        patientName = $(visitPatientNameSelector)
    
    await MissCalledReasonChooser("Attendant failed to call in and out")
    $(visitNotesSelector).val(templateForReason["Attendant failed to call in"](patientName, aideName, getScheduleTime()))
    $(visitNotesSelector)[0].dispatchEvent(new Event("change"))
    if ($(visitVerifyStarSelector).length > 0) $(visitAuditPatientSelector).click()
} */

function getAideName(ctx: Document = document): string {
  let aideName: string,
    flag = false;
  const visitDateText = $(visitDateSelector, ctx).text();

  const tryGetParentDoc = (): Document | null => {
    try {
      return window.parent?.document ?? null;
    } catch {
      return null;
    }
  };

  const tryGetTopDoc = (): Document | null => {
    try {
      return window.top?.document ?? null;
    } catch {
      return null;
    }
  };

  const readInputValue = (selector: string): string | null => {
    const el = ctx.querySelector(selector) as HTMLInputElement | null;
    const value = el?.value?.trim();
    return value ? value : null;
  };

  const getAideNameFromCallReportsRow = (): string | null => {
    const topDoc = tryGetTopDoc();
    if (!topDoc) return null;

    const frame = topDoc.getElementById(
      "frmCallResults"
    ) as HTMLIFrameElement | null;
    const frameDoc = frame?.contentDocument;
    if (!frameDoc) return null;

    let visitId: string | null = null;
    try {
      visitId = new URL(ctx.location.href).searchParams.get("VisitID");
    } catch {
      visitId = null;
    }
    if (!visitId) {
      visitId =
        readInputValue("#hdnVisitID") ||
        readInputValue("input[name='VisitID']") ||
        null;
    }
    if (!visitId) return null;

    const editButtons = Array.from(
      frameDoc.querySelectorAll(
        "button[title='View/Edit'], button[id$='Visitinfo']"
      )
    ) as HTMLButtonElement[];
    const matchedEditButton = editButtons.find((btn) => {
      const onclick = btn.getAttribute("onclick") || "";
      return (
        onclick.includes(`,${visitId},`) ||
        onclick.includes(`VisitID=',${visitId}`) ||
        onclick.includes(`VisitID=${visitId}`)
      );
    });

    if (!matchedEditButton) return null;
    const row = matchedEditButton.closest("tr");
    if (!row) return null;

    const aideLink = row.querySelector(
      "td:nth-child(4) a"
    ) as HTMLElement | null;
    const aideText =
      aideLink?.innerText?.trim() ||
      (
        row.querySelector("td:nth-child(4)") as HTMLElement | null
      )?.innerText?.trim() ||
      "";

    return aideText || null;
  };

  const directCaregiverName =
    readInputValue("#hdnCaregiverName") ||
    readInputValue("#hdnAideName") ||
    readInputValue("#hidAideName") ||
    readInputValue("#hidCaregiverName");
  if (directCaregiverName) return directCaregiverName;

  const rowMappedAideName = getAideNameFromCallReportsRow();
  if (rowMappedAideName) return rowMappedAideName;

  // 0. Direct read from popup hidden field (NonskilledVisitInfo_ns popup, Call/Patient page)
  const hdnCGName = (ctx.querySelector("#hdnCaregiverName") as HTMLInputElement)
    ?.value;
  if (hdnCGName) return hdnCGName;

  // 1. On patient page
  if (!flag) {
    const parentDoc = tryGetParentDoc();
    let aideLinks = parentDoc?.querySelectorAll("#aidelink") ?? [];
    for (const aideLink of aideLinks) {
      if (aideLink.getAttribute("onClick")?.includes(visitDateText)) {
        aideName = (aideLink as HTMLElement).innerHTML.trim();
        flag = true;
        break;
      }
    }
  }
  // 2. On caregiver page
  if (!flag) {
    let result = searchElementInAllFrames(
      window.top,
      caregiverInfoNameSelector
    );
    if (result != null) {
      aideName = result.innerText.trim();
      flag = true;
    }
  }

  // 3. On CHHA Patient page
  if (!flag) {
    const parentDoc = tryGetParentDoc();
    let hhaxLinks = parentDoc?.querySelectorAll(".hhax-link") ?? [];
    for (const hhaxLink of hhaxLinks) {
      if (hhaxLink.getAttribute("onClick")?.includes(visitDateText)) {
        const aideProfileLink = $(hhaxLink)
          .parent()
          .find("a[onclick^='OpenAideProfileMax']")[0] as
          | HTMLElement
          | undefined;
        if (aideProfileLink) {
          aideName = aideProfileLink.innerText.trim();
          flag = true;
          break;
        }
      }
    }
  }

  // 4. On CHHA Prebilling page
  if (!flag) {
    let table = searchElementInAllFrames(
      window.top,
      prebillingSearchResultsSelector
    );
    if (table) {
      let list = table.querySelectorAll("tbody > tr");
      for (const visit of list) {
        let date = visit.querySelector("td:nth-child(1)");
        let id = visit.querySelector("td:nth-child(2) > a");
        let time = visit.querySelector("td:nth-child(9)");
        if (
          (date as HTMLElement)?.innerText ==
            $(prebillingVisitDateSelector, ctx).text() &&
          (id as HTMLElement).innerText ==
            $(prebillingVisitAdmissionIdSelector, ctx).text() &&
          (time as HTMLElement).innerText ==
            $(prebillingVisitScheduledTimeSelector, ctx).text()
        ) {
          aideName = (
            visit.querySelector("td:nth-child(6) > a") as HTMLElement
          ).innerText
            .split("\n")[0]
            .trim();
          flag = true;
          break;
        }
      }
    }
  }

  if (!flag) {
    aideName = "AideNotFound";
    console.warn("[MissedCall] Aide name not found in current context");
  }
  return aideName;
}

function searchElementInAllFrames(
  win: Window,
  selector: string
): HTMLElement | null {
  let result: HTMLElement | null = null;

  function searchWindow(currentWindow: Window): boolean {
    try {
      if (currentWindow.document) {
        const foundElement =
          currentWindow.document.querySelector<HTMLElement>(selector);
        if (foundElement) {
          result = foundElement;
          return true; // 找到了，停止搜索
        }
      }
    } catch (e) {
      console.warn("无法访问的 window:", e);
    }

    try {
      for (let i = 0; i < currentWindow.frames.length; i++) {
        const frame = currentWindow.frames[i];
        if (searchWindow(frame)) {
          return true; // 子frame中找到了，停止搜索
        }
      }
    } catch (e) {
      console.warn("无法访问 frames:", e);
    }

    return false; // 当前window和子frames都没找到
  }

  searchWindow(win);
  return result;
}

function missedCallTimeInputer(reason: ReasonType, ctx: Document = document) {
  if (reason == "Attendant failed to call in") {
    $(visitStartTimeInputSelector, ctx).val(
      $(visitScheduleTimeSelector, ctx).text().split("-")[0]
    );
    $(visitStartTimeInputSelector, ctx)[0].dispatchEvent(new Event("change"));
  } else if (reason == "Attendant failed to call out") {
    $(visitEndTimeInputSelector, ctx).val(
      $(visitScheduleTimeSelector, ctx).text().split("-")[1]
    );
    $(visitEndTimeInputSelector, ctx)[0].dispatchEvent(new Event("change"));
  } else if (reason == "Attendant failed to call in and out") {
    $(visitStartTimeInputSelector, ctx).val(
      $(visitScheduleTimeSelector, ctx).text().split("-")[0]
    );
    $(visitStartTimeInputSelector, ctx)[0].dispatchEvent(new Event("change"));
    $(visitEndTimeInputSelector, ctx).val(
      $(visitScheduleTimeSelector, ctx).text().split("-")[1]
    );
    $(visitEndTimeInputSelector, ctx)[0].dispatchEvent(new Event("change"));
  } else {
    console.log("Something went error");
  }
}

async function missedCalledReasonChooser(
  reason: ReasonType,
  ctx: Document = document
) {
  let expectedReason = reason,
    expectedAction =
      "Confirmed visit with the client or the client's family member/representative and documented";
  let select1 = $(visitReasonSelector, ctx);
  for (const reason of $(visitReasonOptionSelector, ctx)) {
    if (expectedReason == reason.innerText) {
      select1.val((reason as HTMLOptionElement).value);
      select1[0].dispatchEvent(new Event("change"));
      break;
    }
  }

  await sleep(500);

  let select2 = $(visitActionSelector, ctx);
  for (const action of $(visitActionOptionSelector, ctx)) {
    if (expectedAction == action.innerText) {
      select2.val((action as HTMLOptionElement).value);
      select2[0].dispatchEvent(new Event("change"));
      break;
    }
  }
}

function getScheduleTime(ctx: Document = document): {
  startTime: string;
  endTime: string;
} {
  return {
    startTime: convertMilitaryTime(
      $(visitScheduleTimeSelector, ctx).text().split("-")[0]
    ),
    endTime: convertMilitaryTime(
      $(visitScheduleTimeSelector, ctx).text().split("-")[1]
    ),
  };
}
