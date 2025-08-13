import {
  visitActionSelector,
  visitActionOptionSelector,
  visitReasonSelector,
  visitReasonOptionSelector,
  visitNotesSelector,
  visitVerifyStarSelector,
  visitAuditCaregiverSelector,
  visitScheduleTimeSelector,
  visitDutySelector,
} from "../utils/templates&const";

import { sleep } from "../utils/util";

export const POCResolver = () => {
  console.log("clicked");
  POCTick();
  POCReasonChooser();
  $(visitNotesSelector).val("task does not match plan of care");
  $(visitNotesSelector)[0].dispatchEvent(new Event("change"));
  if ($(visitVerifyStarSelector).length > 0)
    $(visitAuditCaregiverSelector).click();
};

function POCSafeTick(el: any) {
  if ($(el).parent().find("td:last-child > span").css("display") == "none") {
    (
      $(el).parent().find("td:first-child input")[0] as HTMLInputElement
    ).click();
  }
}

function POCTick() {
  let pocList = ["101", "107", "111", "112", "411", "502", "511"];
  for (const dutyNum of pocList) {
    POCSafeTick($(`${visitDutySelector}("${dutyNum}")`)[0]);
  }
  if ("0800-0800" == $(visitScheduleTimeSelector).text()) {
    POCSafeTick($(`${visitDutySelector}("801")`)[0]);
    POCSafeTick($(`${visitDutySelector}("802")`)[0]);
  }
}

async function POCReasonChooser() {
  let expectedReasonList = [
      "Other",
      "Attendant's identification number (s) does not match the scheduled shift or task discrepancy/task does not match plan of care",
    ],
    expectedActionList = [
      "Other",
      "Confirmed with the client or the client's family member/representative and documented",
      "Confirmed visit with the client or the client's family member/representative and documented",
    ];

  let select1 = $(visitReasonSelector);
  let flag = false;
  for (const expectedReason of expectedReasonList) {
    //expectedReason = other
    for (const reason of $(visitReasonOptionSelector)) {
      if (expectedReason == reason.innerText) {
        select1.val((reason as HTMLOptionElement).value);
        select1[0].dispatchEvent(new Event("change"));
        flag = true;
        break;
      }
    }
    if (flag) break;
  }

  flag = false;
  await sleep(500);

  let select2 = $(visitActionSelector);
  for (const expectedAction of expectedActionList) {
    //expectedReason = other
    for (const action of $(visitActionOptionSelector)) {
      if (expectedAction == action.innerText) {
        select2.val((action as HTMLOptionElement).value);
        select2[0].dispatchEvent(new Event("change"));
        flag = true;
        break;
      }
    }
    if (flag) break;
  }

  /*   for (const reason of $("#ddlReason > option")) {
        // console.log(reason.innerText)
        if(reason.innerText == "Attendant's identification number (s) does not match the scheduled shift or task discrepancy/task does not match plan of care"){
          select1.val((reason as HTMLOptionElement).value)
          select1[0].dispatchEvent(new Event("change"))
    
          let select2 = $('#ddlEditAction')
          for (const action of $("#ddlEditAction > option")) {
            if(action.innerText == "Other"){
              select2.val((action as HTMLOptionElement).value)
              select2[0].dispatchEvent(new Event("change"))
              break
            }
            if(action.innerText == "Other"){
              select2.val((action as HTMLOptionElement).value)
              select2[0].dispatchEvent(new Event("change"))
              break
            }
          }
        }
      } */
}
