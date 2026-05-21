// Only inject styles on HHA pages — Outlook's strict CSP blocks style-loader injection
if (
  !window.location.hostname.includes("outlook") &&
  window.location.hostname !== "webshell.suite.office.com"
) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./style/main.less");
}
import {
  saveButtonSelector,
  documentManagementSaveButtonSelector,
  newMessageButtonSelector,
  newMessageIframeSelector,
  prebillingSearchButtonSelector,
  homePageSearchButtonSelector,
  visitReasonSelector,
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
import { ProfileDataExtractor } from "./js/services/ProfileDataExtractor";
import { initSearchPageEnhancements } from "./js/SearchPageEnhancements";
import { StatusTrackingTab } from "./js/tabs/StatusTrackingTab";
import { QAReportTab } from "./js/tabs/QAReportTab";
import { CleanerTab } from "./js/tabs/CleanerTab";
import { MailBuilderTab } from "./js/tabs/MailBuilderTab";
import { QuickSearchTab } from "./js/tabs/QuickSearchTab";
import { DateInputTab } from "./js/tabs/DateInputTab";
import { CleaningController } from "./js/services/CleaningController";
import { CleaningOverlay } from "./js/services/CleaningOverlay";
import { initPatientCalendarBulkNotes } from "./js/services/PatientCalendarBulkNotes";
import { OutlookAdapter } from "./js/services/OutlookAdapter";
import { OutlookMiniPanel } from "./js/services/OutlookMiniPanel";
import { TinyMCEBundler } from "./js/services/TinyMCEBundler";
import { initDocumentDropzone } from "./js/services/DocumentDropzone";
import { initScheduledVisitsConfigCardUI } from "./js/ScheduledVisitsFilter";

import { version } from "../package.json";

const HOST = window.location.hostname.toLowerCase();
const IS_HHA_APP_HOST = HOST === "app.hhaexchange.com";
const IS_HHA_REPORTS_HOST = HOST === "reports.hhaexchange.com";
const IS_VOICE_TECH_HOST = HOST === "mt3.1voicetech.com";
const IS_BLOB_PAGE = window.location.protocol === "blob:";
const MAIN_BOOTSTRAP_FLAG = "__HHA_SMART_ASSISTANT_MAIN_BOOTSTRAPPED__";
const VISIT_QUICK_ACTIONS_FLAG =
  "__HHA_SMART_ASSISTANT_VISIT_QUICK_ACTIONS_BOOTSTRAPPED__";
const NEW_MESSAGE_QUICK_ACTIONS_FLAG =
  "__HHA_SMART_ASSISTANT_NEW_MESSAGE_QUICK_ACTIONS_BOOTSTRAPPED__";
const HHA_MAIN_PANEL_POSITION_KEY = "hha_main_panel_position";
const HHA_MAIN_PANEL_KEY_PREFIX = "hha_main_panel";
const HHA_MAIN_DATE_PRESET_KEY = "hha_main_date_preset";
const EPIC11_DEBUG_ENABLED = (window as any).__HHA_EPIC11_DEBUG__ === true;

function epic11Debug(...args: unknown[]): void {
  if (EPIC11_DEBUG_ENABLED) {
    console.debug(...args);
  }
}

function isCleanerDetailPage(url: string): boolean {
  const normalized = url.toLowerCase();
  return (
    normalized.includes("nonskilledvisitinfo_ns.aspx") ||
    normalized.includes("skilledvisitinfo_ns.aspx") ||
    normalized.includes("nonskilledvisitinfopayer_ns.aspx") ||
    normalized.includes("skilledvisitinfopayer_ns.aspx") ||
    normalized.includes("calendarvisitdetailchharightsiframe_ns.aspx")
  );
}

function isPatientProfilePage(url: string): boolean {
  return url.toLowerCase().includes("internalpatientinfo_ns.aspx");
}

function initVisitQuickActionButtons(): void {
  if ((window as any)[VISIT_QUICK_ACTIONS_FLAG]) {
    return;
  }
  (window as any)[VISIT_QUICK_ACTIONS_FLAG] = true;

  const $missedInBtn = $("<input/>").text("Missed In").attr({
    type: "button",
    id: "missedInBtn",
    name: "missedInBtn",
    class: "button hollow",
    tabindex: "1",
    value: "Missed In",
  });

  const $missedOutBtn = $("<input/>").text("Missed Out").attr({
    type: "button",
    id: "missedOutBtn",
    name: "missedOutBtn",
    class: "button hollow",
    tabindex: "1",
    value: "Missed Out",
  });

  const $missedInOutBtn = $("<input/>").text("Missed In/Out").attr({
    type: "button",
    id: "missedInOutBtn",
    name: "missedInOutBtn",
    class: "button hollow",
    tabindex: "1",
    value: "Missed In&Out",
  });

  const $POCBtn = $("<input/>").text("POC").attr({
    type: "button",
    id: "uxBtnPOC",
    name: "uxBtnPOC",
    class: "button hollow",
    tabindex: "1",
    value: "POC",
  });

  assignIntervalTimer(saveButtonSelector, $POCBtn, "#uxBtnPOC", POCResolver);

  // Resolve popup iframe document at click-time, fallback to current document.
  const getMypopupDoc = (): Document => {
    const mypopup = document.getElementById(
      "mypopup"
    ) as HTMLIFrameElement | null;
    return mypopup?.contentDocument ?? document;
  };

  assignIntervalTimer(
    saveButtonSelector,
    $missedInOutBtn,
    "#missedInOutBtn",
    (reason: string) => missedCallResolver(reason as any, getMypopupDoc()),
    ["Attendant failed to call in and out"]
  );

  assignIntervalTimer(
    saveButtonSelector,
    $missedOutBtn,
    "#missedOutBtn",
    (reason: string) => missedCallResolver(reason as any, getMypopupDoc()),
    ["Attendant failed to call out"]
  );

  assignIntervalTimer(
    saveButtonSelector,
    $missedInBtn,
    "#missedInBtn",
    (reason: string) => missedCallResolver(reason as any, getMypopupDoc()),
    ["Attendant failed to call in"]
  );
}

function initNewMessageQuickActionButtons(): void {
  if ((window as any)[NEW_MESSAGE_QUICK_ACTIONS_FLAG]) {
    return;
  }
  (window as any)[NEW_MESSAGE_QUICK_ACTIONS_FLAG] = true;

  const $newQABtn = $("<input/>").text("").attr({
    type: "button",
    id: "newQABtn",
    name: "newQABtn",
    class: "button hollow",
    value: "New QA",
  });

  const $newWelcomeCall = $("<input/>").text("").attr({
    type: "button",
    id: "newWelcomecallBtn",
    name: "newWelcomecallBtn",
    class: "button hollow",
    value: "New Welcome Call",
  });

  const $newQABtnInIframe = $("<input/>").text("").attr({
    type: "button",
    id: "newQABtnInIframe",
    name: "newQABtnInIframe",
    class: "button hollow",
    value: "New QA",
  });

  const $newWelcomeCallInIframe = $("<input/>").text("").attr({
    type: "button",
    id: "newWelcomecallBtnInIframe",
    name: "newWelcomecallBtnInIframe",
    class: "button hollow",
    value: "New Welcome Call",
  });

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

  assignIntervalTimer(
    newMessageButtonSelector,
    $newQABtnInIframe,
    "#newQABtnInIframe",
    createNewQA,
    [],
    "left",
    null,
    newMessageIframeSelector
  );

  assignIntervalTimer(
    newMessageButtonSelector,
    $newWelcomeCallInIframe,
    "#newWelcomecallBtnInIframe",
    createWelcomeCall,
    [],
    "left",
    null,
    newMessageIframeSelector
  );
}

async function main() {
  if ((window as any)[MAIN_BOOTSTRAP_FLAG]) {
    return;
  }
  (window as any)[MAIN_BOOTSTRAP_FLAG] = true;

  if (IS_BLOB_PAGE) {
    console.log("[main] Blob page detected, skipping bootstrap");
    return;
  }

  const currentUrl = window.location.href;

  console.log("HHA Exchange Smart Assistant " + version + " : script start");

  // Set a global flag to indicate script is running (for debugging)
  (window as any).HHA_SMART_ASSISTANT_STARTED = true;
  (window as any).HHA_SMART_ASSISTANT_VERSION = version;

  // Initialize OutlookAdapter if on Outlook page
  try {
    OutlookAdapter.init();
  } catch (error) {
    console.error("[main] OutlookAdapter init failed:", error);
  }

  try {
    OutlookMiniPanel.init();
  } catch (error) {
    console.error("[main] OutlookMiniPanel init failed:", error);
  }

  // Domain-mode bootstrap:
  // - VoiceTech page: only incoming call assistant
  // - HHA app page: full feature set
  // - Other matched domains (Outlook/Office/Reports): avoid starting HHA-heavy watchers
  if (IS_VOICE_TECH_HOST) {
    highlight2Call();
    void incomingCallHandler().catch((err) => {
      console.error("[main] incomingCallHandler init failed on mt3:", err);
    });
    return;
  }

  if (!IS_HHA_APP_HOST) {
    if (IS_HHA_REPORTS_HOST) {
      console.log(
        "[main] Reports domain detected, bootstrapping report-specific features"
      );

      // Epic 15: reports domain still needs Scheduled Visits coordinator filter UI.
      initScheduledVisitsConfigCardUI();
    }
    return;
  }

  // In most iframes we should not start full bootstrap.
  // Exception: visit detail iframes need only quick-action button injection.
  if (window.self !== window.top) {
    if (isCleanerDetailPage(currentUrl)) {
      console.log(
        "[main] Detail iframe detected, running quick-action bootstrap + cleaner resume"
      );
      initVisitQuickActionButtons();
      await checkAndResumeCleaningTasks();
      return;
    } else if (isPatientProfilePage(currentUrl)) {
      console.log(
        "[main] Patient profile iframe detected, running bulk-notes bootstrap"
      );
      highlight2Call();
      initPatientCalendarBulkNotes();
      return;
    } else {
      console.log("[main] Non-top iframe detected, skipping HHA bootstrap");
      return;
    }
  }

  // Preload TinyMCE in the background (fire and forget)
  // This gives it time to load before user opens the mail template editor
  TinyMCEBundler.load().catch((err) => {
    console.warn(
      "[main] TinyMCE preload failed (will retry on modal open):",
      err
    );
  });

  async function FetchTester() {
    try {
      // 构造目标网站的搜索URL
      // const searchUrl = `https://your-search-site.com/search?q=${number}`; // <--- [!] 修改为实际的搜索URL格式

      // console.log('正在搜索:', searchUrl);
      let SearchCGphone =
        "https://app.hhaexchange.com/ENT2602010000/Aide/AideSearchXSLT_ns.aspx?FirstName=&Phone=347-265-3886&LastName=&Type=2&Discipline=-1&CaregiverCode=&ALtCaregiverCode=&Status=-1&SSN=&CaregiverTeamID=-1&FromVisitEdit=0&CaregiverLocationID=-1&CaregiverBranchID=-1&VisitDate=&office=469,5137,5139,6475,14849&DOB=&pg=1&sort=&ord=ASC&FromPage=&_=1755108928644";

      let missIn =
        "https://app.hhaexchange.com/ENT2602010000/Call/CallReportsXSLT_ns.aspx?CallType=2&VendorID=469&CoordinatorID=69419&PatientNumber=&PatientName=&AideName=&AssignmentID=&sort=VisitDate&ord=DESC&Source=-1&CaregiverTeamID=-1&SkillType=-1&HideVisitWithTimeSheetRequired=false&FromDate=2025-08-13%2000:00:00&ToDate=2025-08-13%2023:59:00&TimesheetRequired=-1&PatientTeamID=-1&PatientLocationID=-1&PatientBranchID=-1&CaregiverLocationID=-1&CaregiverBranchID=-1&time=1755113664818&OfficeId=469,5137,5139,6475,14849&DisciplineIDs=0";

      let CallMaintenance_ns =
        "https://app.hhaexchange.com/ENT2602010000/Call/CallMaintenance_ns.aspx";

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

  // Separate button instances for #msg iframe context.
  let $newQABtnInIframe = $("<input/>").text("").attr({
    type: "button",
    id: "newQABtnInIframe",
    name: "newQABtnInIframe",
    class: "button hollow",
    value: "New QA",
  });

  let $newWelcomeCallInIframe = $("<input/>").text("").attr({
    type: "button",
    id: "newWelcomecallBtnInIframe",
    name: "newWelcomecallBtnInIframe",
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
    newMessageIframeSelector // iframe 选择器
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

  assignIntervalTimer(
    newMessageButtonSelector,
    $newQABtnInIframe,
    "#newQABtnInIframe",
    createNewQA,
    [],
    "left",
    null,
    newMessageIframeSelector
  );

  assignIntervalTimer(
    newMessageButtonSelector,
    $newWelcomeCallInIframe,
    "#newWelcomecallBtnInIframe",
    createWelcomeCall,
    [],
    "left",
    null,
    newMessageIframeSelector
  );

  assignIntervalTimer(saveButtonSelector, $POCBtn, "#uxBtnPOC", POCResolver);

  /**
   * TD-003 fix: resolve mypopup iframe document at click time so that all
   * jQuery selectors inside missedCallResolver target the correct document.
   * Fallback to `document` handles the case where the script itself is already
   * running inside the mypopup iframe (unlikely, but safe).
   */
  const getMypopupDoc = (): Document => {
    const mypopup = document.getElementById(
      "mypopup"
    ) as HTMLIFrameElement | null;
    return mypopup?.contentDocument ?? document;
  };

  assignIntervalTimer(
    saveButtonSelector,
    $missedInOutBtn,
    "#missedInOutBtn",
    (reason: string) => missedCallResolver(reason as any, getMypopupDoc()),
    ["Attendant failed to call in and out"]
  );

  assignIntervalTimer(
    saveButtonSelector,
    $missedOutBtn,
    "#missedOutBtn",
    (reason: string) => missedCallResolver(reason as any, getMypopupDoc()),
    ["Attendant failed to call out"]
  );

  assignIntervalTimer(
    saveButtonSelector,
    $missedInBtn,
    "#missedInBtn",
    (reason: string) => missedCallResolver(reason as any, getMypopupDoc()),
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

  // Epic 18: Profile page enhancements
  ProfileDataExtractor.enhanceCaregiverSearchPanel();
  ProfileDataExtractor.enhancePatientAddressLink();
  initPatientCalendarBulkNotes();

  // Epic 18: Search page Clear Filters buttons
  initSearchPageEnhancements();

  // Initialize Multi-Tab Panel (Epic 7: Story 7.1, 7.2, 7.3)
  // This will be shown when clicking the floating button
  initMultiTabPanel();

  // Epic 11: Check for pending cleaning tasks on page load
  // This enables automatic resume of cleaning after page refresh
  checkAndResumeCleaningTasks();

  // Start polling the shared Tampermonkey storage to detect when child iframes complete tasks
  // This is required because HHAExchange modals (iframes) closing do not trigger a full parent page reload.
  CleaningController.startQueuePolling();

  // Epic 14: Init DocumentDropzone
  initDocumentDropzone();

  // Epic 15: Init Scheduled Visits Coordinator Filter
  initScheduledVisitsConfigCardUI();
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
  // CRITICAL FIX: 立即克隆铃铛移除 VisitMonitor 的所有事件监听器
  // 必须在异步操作之前完成，防止用户在初始化期间点击铃铛触发旧的 handler
  const newDragHandle = dragHandle.cloneNode(true) as HTMLElement;
  dragHandle.parentNode?.replaceChild(newDragHandle, dragHandle);
  console.log("[Epic 7] Bell button cloned to remove VisitMonitor handlers");

  // Host-level panel position persistence (HHA main panel only)
  try {
    const raw = localStorage.getItem(HHA_MAIN_PANEL_POSITION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { left: number; top: number };
      if (typeof parsed.left === "number" && typeof parsed.top === "number") {
        trackerContainer.style.left = `${parsed.left}px`;
        trackerContainer.style.top = `${parsed.top}px`;
        trackerContainer.style.right = "auto";
        trackerContainer.style.bottom = "auto";
      }
    }
  } catch (error) {
    console.warn("[Epic 19] Failed to restore HHA panel position:", error);
  }

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
    storageKeyPrefix: HHA_MAIN_PANEL_KEY_PREFIX,
  });

  // Register tabs
  panel.registerTab(new StatusTrackingTab());
  panel.registerTab(new QAReportTab());
  panel.registerTab(new CleanerTab());
  panel.registerTab(new MailBuilderTab());
  panel.registerTab(new QuickSearchTab());
  panel.registerTab(
    new DateInputTab({
      presetStorageKey: HHA_MAIN_DATE_PRESET_KEY,
      showOutlookHint: false,
    })
  );

  // Initialize panel
  panel
    .init()
    .then(() => {
      console.log("[Epic 7] Multi-Tab Panel embedded in tracker-container");

      // Hook bell button click - 使用已克隆的新铃铛
      setupBellClickHandler(container, newDragHandle, trackerPanel);
    })
    .catch((error) => {
      console.error("[Epic 7] Failed to initialize Multi-Tab Panel:", error);
    });
}

/**
 * Setup click handler on bell button to toggle Multi-Tab Panel
 * 参考 VisitMonitor.ts initializeDragAndClick() 的实现
 *
 * 注意：传入的 dragHandle 已经是在 embedMultiTabPanel 中克隆过的新节点
 */
function setupBellClickHandler(
  panelContainer: HTMLElement,
  dragHandle: HTMLElement,
  trackerPanel: HTMLElement | null
): void {
  let hasDragged = false;

  // dragHandle 已经是克隆过的节点，不需要再克隆
  // 重新实现拖动功能（参考 VisitMonitor makeDraggable）
  const trackerContainer = dragHandle.parentElement!;
  let isDragging = false;
  let offsetX = 0,
    offsetY = 0;

  dragHandle.style.cursor = "move";

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    hasDragged = false; // 重置拖动标志
    const rect = trackerContainer.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    hasDragged = true; // 标记为已拖动

    let newX = e.clientX - offsetX;
    let newY = e.clientY - offsetY;

    // 边界检测
    const margin = 5;
    if (newX < margin) newX = margin;
    if (newY < margin) newY = margin;
    if (newX + trackerContainer.offsetWidth > window.innerWidth - margin) {
      newX = window.innerWidth - trackerContainer.offsetWidth - margin;
    }
    if (newY + trackerContainer.offsetHeight > window.innerHeight - margin) {
      newY = window.innerHeight - trackerContainer.offsetHeight - margin;
    }

    // 设置位置
    trackerContainer.style.right = "auto";
    trackerContainer.style.bottom = "auto";
    trackerContainer.style.left = `${newX}px`;
    trackerContainer.style.top = `${newY}px`;
  };

  const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    try {
      const rect = trackerContainer.getBoundingClientRect();
      localStorage.setItem(
        HHA_MAIN_PANEL_POSITION_KEY,
        JSON.stringify({ left: rect.left, top: rect.top })
      );
    } catch (error) {
      console.warn("[Epic 19] Failed to save HHA panel position:", error);
    }
  };

  dragHandle.addEventListener("mousedown", onMouseDown);

  // 使用capture阶段拦截click，完全控制点击行为
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
        // CRITICAL: 立即隐藏原来的tracker-panel，防止在页面刚加载时点击铃铛显示旧面板
        if (trackerPanel) {
          trackerPanel.style.display = "none";
        }

        // 显示我们的面板
        positionPanelRelativeToHandle(panelContainer, dragHandle);
        panelContainer.style.display = "block";
        console.log("[Epic 7] Multi-Tab Panel opened");
      } else {
        // 隐藏面板
        panelContainer.style.display = "none";
        console.log("[Epic 7] Multi-Tab Panel closed");
      }
    },
    true
  ); // capture phase

  console.log(
    "[Epic 7] Bell click handler setup complete (drag functionality restored)"
  );
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

/**
 * Epic 11: Check and Resume Cleaning Tasks
 *
 * Called on every page load to:
 * 1. Check for pending cleaning tasks in GM_getValue
 * 2. If on visit detail page with pending task, auto-execute POCResolver
 * 3. Resume cleaning progress display
 */
async function checkAndResumeCleaningTasks(): Promise<void> {
  // Wait loop to detect page type
  // Priority order: URL-based checks first (fast & reliable), DOM fallback for detail pages
  const detectPageType = async (
    retries = 20
  ): Promise<"DETAIL" | "LIST" | "CALL_MAINTENANCE" | "UNKNOWN"> => {
    const url = window.location.href.toLowerCase();

    // 1. Check for Call Maintenance page via URL (fast, reliable - no DOM needed)
    //    IMPORTANT: Must check BEFORE DETAIL, as CallMaintenance URL does NOT contain
    //    visitReasonSelector elements, so it would fall to UNKNOWN otherwise.
    if (url.includes("callmaintenance_ns.aspx")) {
      return "CALL_MAINTENANCE";
    }

    // 2. Check for Visit Detail Page specific element (Dropdowns or Headers)
    // CRITICAL: We strictly rely on the specific URLs of the Visit Edit pages
    // because $(visitReasonSelector).length > 0 is too broad and triggers on
    // pages like InternalPatientInfo_ns.aspx (which causes the stuck issue)
    if (
      url.includes("nonskilledvisitinfo_ns.aspx") ||
      url.includes("skilledvisitinfo_ns.aspx") ||
      url.includes("nonskilledvisitinfopayer_ns.aspx") ||
      url.includes("skilledvisitinfopayer_ns.aspx") ||
      url.includes("calendarvisitdetailchharightsiframe_ns.aspx")
    ) {
      return "DETAIL";
    }

    // 3. Check for Prebilling List specific element (Container or Search Button)
    // Make sure it doesn't accidentally trigger on non-list pages
    if (url.includes("prebillingreportinternal_ns.aspx")) {
      return "LIST";
    }

    if (retries <= 0) return "UNKNOWN";

    await new Promise((r) => setTimeout(r, 500));
    return detectPageType(retries - 1);
  };

  const pageType = await detectPageType();
  console.log(`[Epic 11] Page Type Detected: ${pageType}`);

  if (pageType === "DETAIL") {
    // 获取待处理的任务队列
    const queue = CleaningController.getQueue();
    epic11Debug("[Epic 11] DETAIL queue snapshot", {
      hasQueue: !!queue,
      status: queue?.status,
      pageType: queue?.pageType,
      currentIndex: queue?.currentIndex,
      totalTasks: queue?.tasks?.length ?? 0,
    });

    if (
      queue &&
      queue.status === "IN_PROGRESS" &&
      queue.pageType === "PREBILLING"
    ) {
      // ★ 防误触判断：检查这个详情页是否由脚本刚刚点击打开（300秒内有效）
      const clickTime = GM_getValue<number>("hha_cleaner_poc_click_time", 0);
      if (Date.now() - clickTime > 300000) {
        epic11Debug(
          "[Epic 11] Skip DETAIL auto-run due to stale click timestamp",
          {
            clickTime,
            now: Date.now(),
            ageMs: Date.now() - clickTime,
          }
        );
        return;
      }

      const currentTask = queue.tasks[queue.currentIndex];

      // ★ Verify we are on the CORRECT patient's detail page!
      // If ASP.NET validation failed, the iframe might reload on the old patient while queue advanced!
      const pageText = document.body.innerText || "";
      if (
        currentTask.admissionId &&
        !pageText.includes(currentTask.admissionId)
      ) {
        console.warn(
          `[Epic 11] Patient mismatch! Expected ${currentTask.admissionId} but not found in page. This usually means the previous save failed with a validation error. Reloading top window to recover...`
        );
        // We MUST close this iframe or reload the parent so the parent can try the next task properly.
        setTimeout(() => {
          try {
            if (window.top) window.top.location.reload();
            else window.location.reload();
          } catch (e) {
            window.location.reload();
          }
        }, 1000);
        return;
      }

      console.log("[Epic 11] Visit detail page detected with pending POC task");

      // 延迟执行，确保页面完全加载
      setTimeout(async () => {
        try {
          // 显示蒙版 (Important: Update text because previous page might have left it at 'Refreshing table...')
          CleaningOverlay.show(
            queue.currentIndex + 1,
            queue.tasks.length,
            "正在处理 POC... (已进入详情页)",
            () => CleaningController.manualResetQueue("DETAIL_PAGE_OVERLAY")
          );

          // 执行 POC 清理
          setTimeout(async () => {
            await POCResolver();

            // 点击保存按钮
            setTimeout(() => {
              // 尝试多种选择器找到保存按钮
              let saveButton = document.getElementById(
                "uxBtnSaveVisit"
              ) as HTMLButtonElement;
              if (!saveButton) {
                // 回退到完整 ID 选择器
                saveButton = document.getElementById(
                  "ctl00_ContentPlaceHolder1_uxBtnSaveVisit"
                ) as HTMLButtonElement;
              }
              if (!saveButton) {
                // 使用 querySelector 查找任何匹配的保存按钮
                saveButton = document.querySelector(
                  '[id$="uxBtnSaveVisit"]'
                ) as HTMLButtonElement;
              }

              if (saveButton) {
                console.log("[Epic 11] Clicking save button...", saveButton.id);

                // ★★★ 关键修复：在点击 Save 之前，提前增加任务索引 ★★★
                // 因为保存后 iframe 可能会被销毁（成功时不显示确认框），如果等确认框出现再增加索引，就会丢失更新
                try {
                  const currentQueue = CleaningController.getQueue();
                  if (
                    currentQueue &&
                    currentQueue.status === "IN_PROGRESS" &&
                    currentQueue.pageType === "PREBILLING"
                  ) {
                    currentQueue.tasks[currentQueue.currentIndex].completed =
                      true;
                    currentQueue.currentIndex++;
                    GM_setValue("hha_cleaner_task_queue", currentQueue);
                    console.log(
                      `[Epic 11] POC task index advanced to ${currentQueue.currentIndex}/${currentQueue.tasks.length} before Save`
                    );
                  }
                } catch (e) {
                  console.error(
                    "[Epic 11] Failed to advance task queue before save:",
                    e
                  );
                }

                saveButton.click();

                // 处理保存后可能弹出的确认对话框
                // HHAeXchange 会弹出 "HHAeXchange - Confirm" 对话框，需要点击 OK
                setTimeout(() => {
                  handleConfirmationDialog();
                }, 500);

                // 页面会刷新回 Prebilling Report，在那里会继续下一个任务
              } else {
                console.error(
                  "[Epic 11] Save button not found with any selector"
                );
                CleaningOverlay.showError("Save button not found");
              }
            }, 1000);
          }, 500);
        } catch (error) {
          console.error("[Epic 11] Auto POC execution failed:", error);
        }
      }, 1500);

      return;
    } else {
      epic11Debug("[Epic 11] Skip DETAIL page logic", {
        hasQueue: !!queue,
        status: queue?.status,
        pageType: queue?.pageType,
      });
    }
  } else if (pageType === "LIST" || pageType === "CALL_MAINTENANCE") {
    // 在 Prebilling 或 Call Maintenance 列表页，检查是否有待恢复的任务
    // Note: Call Maintenance 页面刷新后需要从这里恢复 duplicate call 清理
    const hasPendingTasks = await CleaningController.checkPendingTasks();

    if (hasPendingTasks) {
      console.log(
        `[Epic 11] Cleaning tasks resumed (${
          pageType === "CALL_MAINTENANCE" ? "Call Maintenance" : "List"
        } Page)`
      );
    }
  } else {
    // UNKNOWN or Timeout
    const queue = CleaningController.getQueue();
    if (queue && queue.status === "IN_PROGRESS") {
      epic11Debug("[Epic 11] Page type unknown while tasks pending", {
        status: queue.status,
        pageType: queue.pageType,
        currentIndex: queue.currentIndex,
      });
    }
  }
}

/**
 * Handle HHAeXchange confirmation dialogs that appear after Save
 *
 * 基于用户提供的 HTML，对话框结构如下：
 * - 对话框容器: #confirmation.reveal.hhax-modal
 * - OK 按钮: button.button.primary.yes
 *
 * 关键发现：对话框在 window.top（主文档）中，但脚本运行在 iframe 内
 * 必须使用 window.top.document 来访问对话框
 */
function handleConfirmationDialog(retryCount = 0): void {
  const MAX_RETRIES = 15; // 最多重试 15 次，每次间隔 300ms，共 4.5 秒

  console.log(
    `[Epic 11] Looking for confirmation dialog (attempt ${
      retryCount + 1
    }/${MAX_RETRIES})...`
  );

  // 基于用户提供的 HTML 的精确选择器
  const selectors = [
    // 用户提供的准确选择器
    "#confirmation button.button.primary.yes",
    "#confirmation .footer button.button.primary",
    "#confirmation button.primary",
    ".hhax-modal button.button.primary.yes",
    ".reveal button.button.primary.yes",
    // 回退选择器
    "button.button.primary.yes",
    ".footer button.primary",
  ];

  let okButton: HTMLElement | null = null;

  // ★★★ 关键修复：首先在 window.top（主文档）中搜索 ★★★
  // 因为脚本运行在 iframe 内，但确认对话框在主文档中
  try {
    if (window.top && window.top.document) {
      okButton = findOkButtonInDocument(window.top.document, selectors);
      if (okButton) {
        console.log("[Epic 11] Found OK button in window.top.document");
      }
    }
  } catch (e) {
    console.log("[Epic 11] Cannot access window.top.document:", e);
  }

  // 如果没找到，在当前文档中搜索（可能脚本在主文档运行）
  if (!okButton) {
    okButton = findOkButtonInDocument(document, selectors);
  }

  // 如果还没找到，在所有 iframe 中搜索
  if (!okButton) {
    okButton = findOkButtonInAllFrames(window, selectors);
  }

  if (okButton) {
    console.log(
      "[Epic 11] Found and clicking confirmation dialog OK button..."
    );
    okButton.click();
    // 点击后页面会刷新

    // CRITICAL FIX: Ensure parent page reloads if the modal/dialog close action fails to trigger it
    console.log(
      "[Epic 11] Waiting 3s for page reload, otherwise forcing reload of top window..."
    );
    setTimeout(() => {
      try {
        if (window.top) {
          console.log("[Epic 11] Forcing top window reload...");
          window.top.location.reload();
        } else {
          window.location.reload();
        }
      } catch (e) {
        console.error("Failed to reload top window:", e);
        window.location.reload();
      }
    }, 3000);
  } else if (retryCount < MAX_RETRIES) {
    // 对话框可能还没出现，重试
    setTimeout(() => handleConfirmationDialog(retryCount + 1), 300);
  } else {
    // Possible scenario: Save successful without confirmation dialog
    console.log(
      "[Epic 11] No confirmation dialog found after retries. Assuming silent success. Forcing top window reload..."
    );
    try {
      if (window.top) window.top.location.reload();
      else window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  }
}

/**
 * 在指定文档中查找 OK 按钮
 */
function findOkButtonInDocument(
  doc: Document,
  selectors: string[]
): HTMLElement | null {
  for (const selector of selectors) {
    try {
      const btn = doc.querySelector(selector) as HTMLElement;
      if (btn) {
        // 检查是否可见
        const style = doc.defaultView?.getComputedStyle(btn);
        if (
          style &&
          style.display !== "none" &&
          style.visibility !== "hidden"
        ) {
          console.log("[Epic 11] Found OK button with selector:", selector);
          return btn;
        }
      }
    } catch (e) {
      // 选择器可能无效，静默忽略
    }
  }
  return null;
}

/**
 * 在所有 iframe 中递归查找 OK 按钮
 */
function findOkButtonInAllFrames(
  win: Window,
  selectors: string[]
): HTMLElement | null {
  // 遍历所有 frames
  try {
    for (let i = 0; i < win.frames.length; i++) {
      try {
        const frame = win.frames[i];
        if (frame && frame.document) {
          // 在这个 frame 的文档中查找
          const btn = findOkButtonInDocument(frame.document, selectors);
          if (btn) {
            return btn;
          }

          // 递归搜索嵌套的 iframes
          const nestedBtn = findOkButtonInAllFrames(frame, selectors);
          if (nestedBtn) {
            return nestedBtn;
          }
        }
      } catch (e) {
        // 跨域 iframe 无法访问，静默忽略
      }
    }
  } catch (e) {
    // 无法访问 frames，静默忽略
  }

  return null;
}

main().catch((e) => {
  console.log(e);
});
