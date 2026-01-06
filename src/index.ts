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
import { prebillingSelector, initConfigCardUI } from "./js/Prebilling";
import { missedCallResolver } from "./js/MissedCall";
import { incomingCallHandler } from "./js/IncomingCallHandler";
import { highlight2Call } from "./js/Highlight2Call";
import { visitMonitor } from "./js/VisitMonitor";
import {
  homePageSelector,
  initHashChangeListener,
  initHomePageConfigCardUI,
} from "./js/HomePage";
import { MultiTabPanel } from "./js/MultiTabPanel";
import { StatusTrackingTab } from "./js/tabs/StatusTrackingTab";
import { QAReportTab } from "./js/tabs/QAReportTab";

async function main() {
  console.log("HHA Exchange Smart Assistant: script start");
  incomingCallHandler();

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
    class: "button hollow prebilling-selector-btn",
    value: "Search by Coordinator(s)",
  });

  let $HomePageSelector = $("<input/>").text("").attr({
    type: "button",
    id: "homePageSelector",
    name: "homePageSelector",
    class: "button hollow homepage-selector-btn",
    value: "Search by Coordinator",
  });

  assignIntervalTimer(
    homePageSearchButtonSelector,
    $HomePageSelector,
    "#homePageSelector",
    homePageSelector,
    [],
    "left",
    () => window.location.hash === "#msg", // 只在 #msg 锚点显示
    "#ctl00_ContentPlaceHolder1_iframemsg" // iframe 选择器
  );

  assignIntervalTimer(
    prebillingSearchButtonSelector,
    $prebillingSelector,
    "#prebillingSelector",
    prebillingSelector
  );

  // 初始化 Prebilling 配置卡片 UI (Story 3)
  initConfigCardUI();

  // 初始化 HomePage hashchange 监听器 (Epic 4, Story 1)
  initHashChangeListener();

  // 初始化 HomePage 配置卡片 UI (Epic 4, Story 3)
  initHomePageConfigCardUI();

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

  visitMonitor(); // Create floating button and background tracking
  highlight2Call();

  // Initialize Multi-Tab Panel (Epic 7: Story 7.1, 7.2, 7.3)
  // This will be shown when clicking the floating button
  initMultiTabPanel();
}

/**
 * Initialize Multi-Tab Panel System
 * Epic 7: Multi-Tab Panel System
 *
 * 关键架构（参考 VisitMonitor.ts）：
 * - Multi-Tab Panel 作为 tracker-container 的子元素
 * - 这样拖动铃铛时，整个container（包括panel）会一起移动
 * - 铃铛点击控制panel显示/隐藏
 */
function initMultiTabPanel(): void {
  // IMPORTANT: Only run in top window, not in iframes
  if (window.self !== window.top) {
    return;
  }

  console.log("[Epic 7] Initializing Multi-Tab Panel System...");

  // Wait for VisitMonitor to create tracker-container
  waitForTrackerContainer();
}

/**
 * Wait for tracker-container to exist, then embed our panel inside it
 */
function waitForTrackerContainer(retryCount = 0): void {
  const MAX_RETRIES = 40; // 20 seconds max

  const trackerContainer = document.getElementById("tracker-container");
  const dragHandle = document.getElementById("tracker-drag-handle");
  const trackerPanel = document.getElementById("tracker-panel");

  if (trackerContainer && dragHandle) {
    // tracker-container exists, now embed our panel
    embedMultiTabPanel(trackerContainer, dragHandle, trackerPanel);
  } else if (retryCount < MAX_RETRIES) {
    setTimeout(() => waitForTrackerContainer(retryCount + 1), 500);
  } else {
    console.error("[Epic 7] tracker-container not found after max retries");
  }
}

/**
 * Embed Multi-Tab Panel inside tracker-container
 * This way it will move together when dragging the bell button
 */
function embedMultiTabPanel(
  trackerContainer: HTMLElement,
  dragHandle: HTMLElement,
  trackerPanel: HTMLElement | null
): void {
  // Create our panel container as a SIBLING to tracker-panel inside tracker-container
  const container = document.createElement("div");
  container.id = "hha-smart-multi-tab-container";
  // 使用和tracker-panel相同的定位方式（相对于container）
  // CRITICAL: 必须设置 width，否则 container 宽度为 0，getBoundingClientRect 无法正确计算位置
  container.style.cssText = `
    position: absolute;
    top: 0;
    width: 680px;
    display: none;
    z-index: 99998;
  `;

  // Append INSIDE tracker-container (not body)
  trackerContainer.appendChild(container);

  // Create panel instance
  const panel = new MultiTabPanel(container, {
    title: "HHAexchange Smart Assistant",
    defaultTabId: "status-tracking",
    initialCollapsed: false,
    showHeaderControls: false, // 不显示最小化/关闭按钮，用铃铛控制
  });

  // Register tabs
  panel.registerTab(new StatusTrackingTab());
  panel.registerTab(new QAReportTab());

  // Initialize panel
  panel
    .init()
    .then(() => {
      console.log("[Epic 7] Multi-Tab Panel embedded in tracker-container");

      // Hook bell button click
      setupBellClickHandler(container, dragHandle, trackerPanel);
    })
    .catch((error) => {
      console.error("[Epic 7] Failed to initialize Multi-Tab Panel:", error);
    });
}

/**
 * Setup click handler on bell button to toggle Multi-Tab Panel
 * 参考 VisitMonitor.ts initializeDragAndClick() 的实现
 */
function setupBellClickHandler(
  panelContainer: HTMLElement,
  dragHandle: HTMLElement,
  trackerPanel: HTMLElement | null
): void {
  let hasDragged = false;

  // 监听拖拽状态
  dragHandle.addEventListener(
    "mousedown",
    () => {
      hasDragged = false;
    },
    false
  );

  dragHandle.addEventListener(
    "mousemove",
    () => {
      hasDragged = true;
    },
    false
  );

  // 使用capture阶段拦截click，在VisitMonitor处理之前
  dragHandle.addEventListener(
    "click",
    (e) => {
      if (hasDragged) {
        console.log("[Epic 7] Drag detected, skipping panel toggle");
        hasDragged = false;
        return;
      }

      e.stopPropagation();
      e.preventDefault();

      const isVisible = panelContainer.style.display !== "none";

      if (!isVisible) {
        // 显示我们的面板
        positionPanelRelativeToHandle(panelContainer, dragHandle);
        panelContainer.style.display = "block";

        // 隐藏原来的tracker-panel
        if (trackerPanel) {
          trackerPanel.style.display = "none";
        }
        console.log("[Epic 7] Multi-Tab Panel opened");
      } else {
        // 隐藏面板
        panelContainer.style.display = "none";
        console.log("[Epic 7] Multi-Tab Panel closed");
      }
    },
    true
  ); // capture phase

  console.log("[Epic 7] Bell click handler setup complete");
}

/**
 * Position panel relative to drag handle (bell button)
 * 完全参照 VisitMonitor.ts 的鲁棒实现（第 2806-2814 行）
 */
function positionPanelRelativeToHandle(
  panel: HTMLElement,
  handle: HTMLElement
): void {
  const w = window.innerWidth;
  const r = handle.getBoundingClientRect();

  // VisitMonitor 的简单判断：铃铛中心在左半边 → 面板放右边，否则放左边
  if (r.left + r.width / 2 < w / 2) {
    panel.style.left = `${handle.offsetWidth + 10}px`;
    panel.style.right = "auto";
    console.log("[Epic 7] Panel positioned RIGHT (handle in left half):", {
      handleCenterX: r.left + r.width / 2,
      viewportHalf: w / 2,
      leftValue: `${handle.offsetWidth + 10}px`,
    });
  } else {
    panel.style.right = `${handle.offsetWidth + 10}px`;
    panel.style.left = "auto";
    console.log("[Epic 7] Panel positioned LEFT (handle in right half):", {
      handleCenterX: r.left + r.width / 2,
      viewportHalf: w / 2,
      rightValue: `${handle.offsetWidth + 10}px`,
    });
  }
}

main().catch((e) => {
  console.log(e);
});
