import "./style/main.less";
import {
  saveButtonSelector,
  documentManagementSaveButtonSelector,
  newMessageButtonSelector,
  prebillingSearchButtonSelector,
} from "./utils/templates&const";
import GM_fetch from "@trim21/gm-fetch";
import { fetch, stringifyCookies, assignIntervalTimer } from "./utils/util";
import { POCResolver } from "./js/POC";
import { copyAttachmentToDescrp } from "./js/DocManagement";
import { createNewQA, createWelcomeCall } from "./js/NewMessageHandler";
import { prebillingSelector } from "./js/Prebilling";
import { missedCallResolver } from "./js/MissedCall";

import axios from "axios";
import { createApp } from "vue";
import VisitsMonitor from "./VisitsMonitor.vue";

async function main() {
  console.log("HHA Exchange Smart Assistant: script start");

  // let result = await fetch(, {
  //   headers:{
  //     cookie: getAllCookies(),
  //     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  //   }
  // })

  //   try {
  //     const response = await axios.get(`
  // https://app.hhaexchange.com/HHANotification2410010000/default.aspx?S=${getAllCookies()["HHAX_Session"]}&AppVersion=ENT&Version=24.10&MinorVersion=1.0`, {
  //       headers: {
  //         "cookie": getAllCookies(),
  //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  //       }, withCredentials: true
  //     });
  //     console.log(response);
  //     console.log('Response Headers:', response.headers);
  //   } catch (error) {
  //     console.error(error);
  //   }

  // try {
  //   const response = await axios.get(`
  // https://app.hhaexchange.com/HHANotification2410010000/default.aspx?S=${getAllCookies()["HHAX_Session"]}&AppVersion=ENT&Version=24.10&MinorVersion=1.0`, {
  //     headers: {
  //       "cookie": getAllCookies(),
  //       "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  //     }, withCredentials: true
  //   });
  //   console.log(response);
  //   console.log('Response Headers:', response.headers);
  // } catch (error) {
  //   console.error(error);
  // }

  /*   try {
      const r = await GM_fetch(
        `https://app.hhaexchange.com/HHANotification2410010000/default.aspx?S=${getAllCookies()["HHAX_Session"]}&AppVersion=ENT&Version=24.10&MinorVersion=1.0`, {
        method: "get",
        headers: {
          "cookie": stringifyCookies(getAllCookies()),
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        }
      });
      console.log(r);
      console.log(r.json())
      console.log(r.headers.getSetCookie())
    } catch (error) {
      console.error(error);
    } */
  let $missedInBtn = $("<input/>").text("Missed In").attr({
    type: "button",
    id: "missedInBtn",
    name: "missedInBtn",
    class: "curveButtons",
    tabindex: "1",
    value: "Missed In",
  });

  let $missedOutBtn = $("<input/>").text("Missed Out").attr({
    type: "button",
    id: "missedOutBtn",
    name: "missedOutBtn",
    class: "curveButtons",
    tabindex: "1",
    value: "Missed Out",
  });

  let $missedInOutBtn = $("<input/>").text("Missed In/Out").attr({
    type: "button",
    id: "missedInOutBtn",
    name: "missedInOutBtn",
    class: "curveButtons",
    tabindex: "1",
    value: "Missed In/Out",
  });

  let $POCBtn = $("<input/>").text("POC").attr({
    type: "button",
    id: "uxBtnPOC",
    name: "uxBtnPOC",
    class: "curveButtons",
    tabindex: "1",
    value: "POC",
  });

  let $copyDescrpBtn = $("<input/>")
    .text("Copy Attachment To Descrption")
    .attr({
      type: "button",
      id: "uxBtnCopyToDescrp",
      name: "uxBtnCopyToDescrp",
      class: "curveButtons",
      tabindex: "1",
      value: "Copy Attachment To Descrption",
    });

  let $newQABtn = $("<input/>").text("").attr({
    type: "button",
    id: "newQABtn",
    name: "newQABtn",
    class: "button secondary-button",
    value: "New QA",
  });

  let $newWelcomeCall = $("<input/>").text("").attr({
    type: "button",
    id: "newWelcomecallBtn",
    name: "newWelcomecallBtn",
    class: "button secondary-button",
    value: "New Welcome Call",
  });

  let $prebillingSelector = $("<input/>").text("").attr({
    type: "button",
    id: "prebillingSelector",
    name: "prebillingSelector",
    class: "curveButtons",
    value: "Prebilling Selector: Tao",
  });

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

  /*   // let intervalbtnGroup: string | number | NodeJS.Timer;
    setInterval(() => {
      $btnGroup = $(saveButtonSelector).parent();
      if ($btnGroup && $("#uxBtnPOC").length <= 0) {
        $btnGroup.prepend($POCBtn)
        $POCBtn.on('click', () => POCResolver())
        // clearInterval(intervalbtnGroup)
      }
  
      //#ctl00_ContentPlaceHolder1_uxGvSearch   FOR CALLMAINTANANCE TABLE ID
  
  
      // console.log("cookies:", getAllCookies());
    }, 1000) */

  assignIntervalTimer(
    documentManagementSaveButtonSelector,
    $copyDescrpBtn,
    "#uxBtnCopyToDescrp",
    copyAttachmentToDescrp
  );

  /*   // uxLblMessage
    setInterval(() => {
      $btnGroup = $(documentManagementSaveButtonSelector).parent();
      if ($btnGroup && $("#uxBtnCopyToDescrp").length <= 0) {
        $btnGroup.prepend($CopyDescrpBtn)
        $CopyDescrpBtn.on('click', () => copyAttachmentToDescrp())
        // clearInterval(intervalbtnGroup)
      }
  
      //#ctl00_ContentPlaceHolder1_uxGvSearch   FOR CALLMAINTANANCE TABLE ID
  
  
      // console.log("cookies:", getAllCookies());
    }, 1000)
  */
}

main().catch((e) => {
  console.log(e);
});
