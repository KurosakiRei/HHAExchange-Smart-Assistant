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

export const missedCallResolver = async (reason: ReasonType) => {
  let aideName = getAideName(),
    patientName = $(visitPatientNameSelector).text();

  missedCallTimeInputer(reason);
  await missedCalledReasonChooser(reason);
  $(visitNotesSelector).val(
    templateForReason[reason](patientName, aideName, getScheduleTime())
  );
  $(visitNotesSelector)[0].dispatchEvent(new Event("change"));
  if ($(visitVerifyStarSelector).length > 0)
    $(visitAuditPatientSelector).click();
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

function getAideName(): string {
  let aideName: string,
    flag = false;
  // 2 Windows: 0-topWindow, 1-popupWindow
  let topWidow = window.parent;

  // 1. On patient page
  if (!flag) {
    let aideLinks = topWidow[0].document.querySelectorAll("#aidelink");
    for (const aideLink of aideLinks) {
      if (
        aideLink.getAttribute("onClick").includes($(visitDateSelector).text())
      ) {
        aideName = aideLink.innerHTML.trim();
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
    let hhaxLinks = topWidow[0].document.querySelectorAll(".hhax-link");
    // let hhaxLinks = searchElementInAllFrames(window.top,".hhax-link");
    // console.log(hhaxLinks)
    for (const hhaxLink of hhaxLinks) {
      if (
        hhaxLink.getAttribute("onClick").includes($(visitDateSelector).text())
      ) {
        // aideName = hhaxLink.innerHTML.trim();
        // console.log(hhaxLink)
        // console.log($(hhaxLink).parent())
        aideName = $(hhaxLink)
          .parent()
          .find("a[onclick^='OpenAideProfileMax'")[0]
          .innerText.trim();
        flag = true;
        break;
      }
    }

    // console.log(hhaxLinks)
    /*     for (const hhaxLink of hhaxLinks) {
          console.log(hhaxLink)
              if (
            !flag &&
            aideLink.getAttribute("onClick").includes($(visitDateSelector).text())
          ) {
            aideName = aideLink.innerHTML.trim();
            flag = true;
            break;
          }
        } */
  }

  // 4. On CHHA Prebilling page
  if (!flag) {
    let table = searchElementInAllFrames(
      window.top,
      prebillingSearchResultsSelector
    );
    // console.log(table)
    let list = table.querySelectorAll("tbody > tr");
    for (const visit of list) {
      let date = visit.querySelector("td:nth-child(1)");
      let id = visit.querySelector("td:nth-child(2) > a");
      let time = visit.querySelector("td:nth-child(9)");
      //ucVisitHeader_lblAdmissionID
      //ucVisitHeader_lblVisitDate
      //lblScheduledTime
      // console.log($("#ucVisitHeader_lblAdmissionID").text())
      // console.log($("#ucVisitHeader_lblVisitDate").text())
      // console.log($("#lblScheduledTime").text())

      if (
        (date as HTMLElement)?.innerText ==
          $(prebillingVisitDateSelector).text() &&
        (id as HTMLElement).innerText ==
          $(prebillingVisitAdmissionIdSelector).text() &&
        (time as HTMLElement).innerText ==
          $(prebillingVisitScheduledTimeSelector).text()
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

  if (!flag) {
    aideName = "AideNotFound";
    alert("AideNotFound");
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

function missedCallTimeInputer(reason: ReasonType) {
  if (reason == "Attendant failed to call in") {
    $(visitStartTimeInputSelector).val(
      $(visitScheduleTimeSelector).text().split("-")[0]
    );
    $(visitStartTimeInputSelector)[0].dispatchEvent(new Event("change"));
  } else if (reason == "Attendant failed to call out") {
    $(visitEndTimeInputSelector).val(
      $(visitScheduleTimeSelector).text().split("-")[1]
    );
    $(visitEndTimeInputSelector)[0].dispatchEvent(new Event("change"));
  } else if (reason == "Attendant failed to call in and out") {
    $(visitStartTimeInputSelector).val(
      $(visitScheduleTimeSelector).text().split("-")[0]
    );
    $(visitStartTimeInputSelector)[0].dispatchEvent(new Event("change"));
    $(visitEndTimeInputSelector).val(
      $(visitScheduleTimeSelector).text().split("-")[1]
    );
    $(visitEndTimeInputSelector)[0].dispatchEvent(new Event("change"));
  } else {
    console.log("Something went error");
  }
}

async function missedCalledReasonChooser(reason: ReasonType) {
  let expectedReason = reason,
    expectedAction =
      "Confirmed visit with the client or the client's family member/representative and documented";
  let select1 = $(visitReasonSelector);
  for (const reason of $(visitReasonOptionSelector)) {
    if (expectedReason == reason.innerText) {
      select1.val((reason as HTMLOptionElement).value);
      select1[0].dispatchEvent(new Event("change"));
      break;
    }
  }

  await sleep(500);

  let select2 = $(visitActionSelector);
  for (const action of $(visitActionOptionSelector)) {
    if (expectedAction == action.innerText) {
      select2.val((action as HTMLOptionElement).value);
      select2[0].dispatchEvent(new Event("change"));
      break;
    }
  }
}

function getScheduleTime(): {
  startTime: string;
  endTime: string;
} {
  return {
    startTime: convertMilitaryTime(
      $(visitScheduleTimeSelector).text().split("-")[0]
    ),
    endTime: convertMilitaryTime(
      $(visitScheduleTimeSelector).text().split("-")[1]
    ),
  };
}
