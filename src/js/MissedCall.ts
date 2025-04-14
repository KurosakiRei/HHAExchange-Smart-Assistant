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

export const missedCallResolver = async (Reason: ReasonType) => {
  let aideName = getAideName(),
    patientName = $(visitPatientNameSelector).text();

  await MissCalledReasonChooser(Reason);
  $(visitNotesSelector).val(
    templateForReason[Reason](patientName, aideName, getScheduleTime())
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
  let aideLinks = topWidow[0].document.querySelectorAll("#aidelink");
  for (const aideLink of aideLinks) {
    if (
      !flag &&
      aideLink.getAttribute("onClick").includes($(visitDateSelector).text())
    ) {
      aideName = aideLink.getAttribute("title").trim();
      flag = true;
      break;
    }
  }
  if (!flag) aideName = "AideNotFound";
  return aideName;
}

async function MissCalledReasonChooser(reason: string) {
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
