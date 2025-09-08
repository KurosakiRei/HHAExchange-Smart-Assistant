import "./style/main.less";
import {
  saveButtonSelector,
  documentManagementSaveButtonSelector,
  newMessageButtonSelector,
  prebillingSearchButtonSelector,
  homePageSearchButtonSelector,
} from "./utils/templates&const";
import GM_fetch from "@trim21/gm-fetch";
import { assignIntervalTimer } from "./utils/util";
import { POCResolver } from "./js/POC";
import { copyAttachmentToDescrp } from "./js/DocManagement";
import { createNewQA, createWelcomeCall } from "./js/NewMessageHandler";
import { prebillingSelector } from "./js/Prebilling";
import { missedCallResolver } from "./js/MissedCall";
import { incomingCallHandler } from "./js/IncomingCallHandler";
import { highlight2Call } from "./js/Highlight2Call";
import { visitMonitor } from "./js/VisitMonitor";
import { homePageSelector } from "./js/HomePage";

async function main() {
  console.log("HHA Exchange Smart Assistant: script start");

  async function FetchTester() {
    try {
      // 构造目标网站的搜索URL
      // const searchUrl = `https://your-search-site.com/search?q=${number}`; // <--- [!] 修改为实际的搜索URL格式

      // console.log('正在搜索:', searchUrl);
      let SearchCGphone =
        "https://app.hhaexchange.com/ENT2507010000/Aide/AideSearchXSLT_ns.aspx?FirstName=&Phone=347-265-3886&LastName=&Type=2&Discipline=-1&CaregiverCode=&ALtCaregiverCode=&Status=1&SSN=&CaregiverTeamID=-1&FromVisitEdit=0&CaregiverLocationID=-1&CaregiverBranchID=-1&VisitDate=&office=469,5137,5139,6475,14849&DOB=&pg=1&sort=&ord=ASC&FromPage=&_=1755108928644";

      let missIn =
        "https://app.hhaexchange.com/ENT2507010000/Call/CallReportsXSLT_ns.aspx?CallType=2&VendorID=469&CoordinatorID=69419&PatientNumber=&PatientName=&AideName=&AssignmentID=&sort=VisitDate&ord=DESC&Source=-1&CaregiverTeamID=-1&SkillType=-1&HideVisitWithTimeSheetRequired=false&FromDate=2025-08-13%2000:00:00&ToDate=2025-08-13%2023:59:00&TimesheetRequired=-1&PatientTeamID=-1&PatientLocationID=-1&PatientBranchID=-1&CaregiverLocationID=-1&CaregiverBranchID=-1&time=1755113664818&OfficeId=469,5137,5139,6475,14849&DisciplineIDs=0";

      let CallMaintenance_ns =
        "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";

      const r = (await GM_fetch(CallMaintenance_ns, {
        method: "GET",
      })) as Response & { rawBody: Blob };
      console.log("r", r);
      const text = await r.rawBody.text();
      console.log("text:", text);
    } catch (error) {
      console.error(error);
    }
  }

  setInterval(() => {
    // FetchTester()
  }, 10000);

  let $missedInBtn = $("<input/>").text("Missed In").attr({
    type: "button",
    id: "missedInBtn",
    name: "missedInBtn",
    class: "button hollow",
    tabindex: "1",
    value: "Missed In",
  });

  let $missedOutBtn = $("<input/>").text("Missed Out").attr({
    type: "button",
    id: "missedOutBtn",
    name: "missedOutBtn",
    class: "button hollow",
    tabindex: "1",
    value: "Missed Out",
  });

  let $missedInOutBtn = $("<input/>").text("Missed In/Out").attr({
    type: "button",
    id: "missedInOutBtn",
    name: "missedInOutBtn",
    class: "button hollow",
    tabindex: "1",
    value: "Missed In&Out",
  });

  let $POCBtn = $("<input/>").text("POC").attr({
    type: "button",
    id: "uxBtnPOC",
    name: "uxBtnPOC",
    class: "button hollow",
    tabindex: "1",
    value: "POC",
  });

  let $copyDescrpBtn = $("<input/>")
    .text("Copy Attachment To Descrption")
    .attr({
      type: "button",
      id: "uxBtnCopyToDescrp",
      name: "uxBtnCopyToDescrp",
      class: "button hollow",
      tabindex: "1",
      value: "Copy Attachment To Descrption",
    });

  let $newQABtn = $("<input/>").text("").attr({
    type: "button",
    id: "newQABtn",
    name: "newQABtn",
    class: "button hollow",
    value: "New QA",
  });

  let $newWelcomeCall = $("<input/>").text("").attr({
    type: "button",
    id: "newWelcomecallBtn",
    name: "newWelcomecallBtn",
    class: "button hollow",
    value: "New Welcome Call",
  });

  let $prebillingSelector = $("<input/>").text("").attr({
    type: "button",
    id: "prebillingSelector",
    name: "prebillingSelector",
    class: "button hollow",
    value: "Prebilling Selector: Tao",
  });

  let $HomePageSelector = $("<input/>").text("").attr({
    type: "button",
    id: "homePageSelector",
    name: "homePageSelector",
    class: "button hollow",
    value: "Home Page Selector: Tao",
  });

  assignIntervalTimer(
    homePageSearchButtonSelector,
    $HomePageSelector,
    "#homePageSelector",
    homePageSelector
  );

  assignIntervalTimer(
    prebillingSearchButtonSelector,
    $prebillingSelector,
    "#prebillingSelector",
    prebillingSelector
  );

  assignIntervalTimer(
    newMessageButtonSelector,
    $newQABtn,
    "#newQABtn",
    createNewQA
  );

  assignIntervalTimer(
    newMessageButtonSelector,
    $newWelcomeCall,
    "#newWelcomecallBtn",
    createWelcomeCall
  );

  assignIntervalTimer(saveButtonSelector, $POCBtn, "#uxBtnPOC", POCResolver);

  assignIntervalTimer(
    saveButtonSelector,
    $missedInOutBtn,
    "#missedInOutBtn",
    missedCallResolver,
    ["Attendant failed to call in and out"]
  );

  assignIntervalTimer(
    saveButtonSelector,
    $missedOutBtn,
    "#missedOutBtn",
    missedCallResolver,
    ["Attendant failed to call out"]
  );

  assignIntervalTimer(
    saveButtonSelector,
    $missedInBtn,
    "#missedInBtn",
    missedCallResolver,
    ["Attendant failed to call in"]
  );

  assignIntervalTimer(
    documentManagementSaveButtonSelector,
    $copyDescrpBtn,
    "#uxBtnCopyToDescrp",
    copyAttachmentToDescrp
  );

  visitMonitor();
  highlight2Call();
  incomingCallHandler();
}

main().catch((e) => {
  console.log(e);
});
