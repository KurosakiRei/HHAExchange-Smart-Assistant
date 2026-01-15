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

  // 如果需要验证（有星号标记），则填写验证信息
  if ($(visitVerifyStarSelector).length > 0) {
    // 点击 Caregiver 复选框
    $(visitAuditCaregiverSelector).click();

    // 填写 Date Verified 字段（MM/DD/YYYY 格式）
    const dateVerifiedInput = document.getElementById(
      "uxtxtDateVerified"
    ) as HTMLInputElement;
    if (dateVerifiedInput) {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const year = today.getFullYear();
      const dateStr = `${month}/${day}/${year}`;
      dateVerifiedInput.value = dateStr;
      dateVerifiedInput.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("[POCResolver] Date Verified set to:", dateStr);
    }

    // 填写 Time Verified 字段（HHmm 格式，如 1430）
    const timeVerifiedInput = document.getElementById(
      "uxtxttimeVerified"
    ) as HTMLInputElement;
    if (timeVerifiedInput) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const timeStr = `${hours}${minutes}`;
      timeVerifiedInput.value = timeStr;
      timeVerifiedInput.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("[POCResolver] Time Verified set to:", timeStr);
    }
  }
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
