import {
  prebillingToDateSelector,
  prebillingDisciplineButtonSelector,
  prebillingDisciplineOptionSelectAllSelector,
  prebillingDisciplineOptionSelector,
  prebillingCoordinatorButtonSelector,
  prebillingCoordinatorOptionSelectAllSelector,
  prebillingCoordinatorOptionSelector,
} from "../utils/templates&const";
import { getYesterdayFormatted, sleep } from "../utils/util";

export const prebillingSelector = async () => {
  $(prebillingToDateSelector).val(getYesterdayFormatted());
  await selectDiscipline();
  await selectCoordinator();

  /*     parent.document.getElementById('ctl00_ContentPlaceHolder1_iframe').style.visibility = 'hidden';
    parent.document.getElementById('ctl00_ContentPlaceHolder1_hdnPg').value = 0;
    parent.document.getElementById('ctl00_ContentPlaceHolder1_hdnRefresh').value = 1;
    parent.document.getElementById('ctl00_ContentPlaceHolder1_hdnOffSet').value = 0;
    parent.document.getElementById('ctl00_ContentPlaceHolder1_uxRefresh').style.visibility = 'hidden';
    return FillPrebillingReviewFrameNewScroll('ctl00_ContentPlaceHolder1_uxPatientName','ctl00_ContentPlaceHolder1_uxPatientId','ctl00_ContentPlaceHolder1_hdDiscipline','ctl00_ContentPlaceHolder1_hdCoordinatorMul','ctl00_ContentPlaceHolder1_hdContract','ctl00_ContentPlaceHolder1_uxAideCode','ctl00_ContentPlaceHolder1_uxAideName','ctl00_ContentPlaceHolder1_uxDtFromDate','ctl00_ContentPlaceHolder1_uxDtToDate','ctl00_ContentPlaceHolder1_uxchkType','2'); */
};

async function selectDiscipline() {
  await sleep(100);
  $(prebillingDisciplineButtonSelector)[0].click();
  await sleep(300);
  $(prebillingDisciplineOptionSelectAllSelector)[0].click();

  let expectedRole = ["NonSkilled", "PCA", "HHA"];
  for (const element of $(prebillingDisciplineOptionSelector)) {
    if (expectedRole.includes(element.innerText)) {
      /* if(!element.parentElement.parentElement.parentElement.classList.contains("selected")) */
      $(element.previousSibling).find("input")[0].click();
    }
  }
  await sleep(100);
  $(prebillingDisciplineButtonSelector)[0].click();
}

//Tao Yang ext.503 TYang@alwaysNY.net

async function selectCoordinator() {
  await sleep(100);
  $(prebillingCoordinatorButtonSelector)[0].click();
  await sleep(300);
  $(prebillingCoordinatorOptionSelectAllSelector)[0].click();

  let expectedCoordinatorList = ["Tao Yang ext.503 TYang@alwaysNY.net"];
  for (const element of $(prebillingCoordinatorOptionSelector)) {
    if (expectedCoordinatorList.includes(element.innerText)) {
      /* if(!element.parentElement.parentElement.parentElement.classList.contains("selected")) */
      $(element.previousSibling).find("input")[0].click();
    }
  }
  await sleep(100);
  $(prebillingCoordinatorButtonSelector)[0].click();
}
