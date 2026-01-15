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
import { CleanerTab } from "./js/tabs/CleanerTab";
import { CleaningController } from "./js/services/CleaningController";
import { version } from "../package.json";

async function main() {
  console.log("HHA Exchange Smart Assistant " + version + " : script start");
  incomingCallHandler();

  async function FetchTester() {
    try {
      // 构造目标网站的搜索URL
      // const searchUrl = `https://your-search-site.com/search?q=${number}`; // <--- [!] 修改为实际的搜索URL格式

      // console.log('正在搜索:', searchUrl);
      let SearchCGphone =
        "https://app.hhaexchange.com/ENT2507010000/Aide/AideSearchXSLT_ns.aspx?FirstName=&Phone=347-265-3886&LastName=&Type=2&Discipline=-1&CaregiverCode=&ALtCaregiverCode=&Status=-1&SSN=&CaregiverTeamID=-1&FromVisitEdit=0&CaregiverLocationID=-1&CaregiverBranchID=-1&VisitDate=&office=469,5137,5139,6475,14849&DOB=&pg=1&sort=&ord=ASC&FromPage=&_=1755108928644";

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

  // Epic 11: Check for pending cleaning tasks on page load
  // This enables automatic resume of cleaning after page refresh
  checkAndResumeCleaningTasks();
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
  panel.registerTab(new CleanerTab());

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
  // 检查是否在 visit 详情页 (NonSkilledVisitInfo_ns.aspx)
  const isVisitDetailPage = window.location.href.includes(
    "NonSkilledVisitInfo_ns.aspx"
  );

  if (isVisitDetailPage) {
    // 获取待处理的任务队列
    const queue = CleaningController.getQueue();

    if (
      queue &&
      queue.status === "IN_PROGRESS" &&
      queue.pageType === "PREBILLING"
    ) {
      console.log("[Epic 11] Visit detail page detected with pending POC task");

      // 延迟执行，确保页面完全加载
      setTimeout(async () => {
        try {
          // 导入并执行 POCResolver
          const { CleaningOverlay } = await import(
            "./js/services/CleaningOverlay"
          );

          // 显示蒙版
          CleaningOverlay.show(
            queue.currentIndex + 1,
            queue.tasks.length,
            "正在处理 POC..."
          );

          // 执行 POC 清理
          setTimeout(() => {
            POCResolver();

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
    }
  }

  // 不在详情页，检查是否有待恢复的任务（在 Prebilling 或 Call Maintenance 页面）
  const hasPendingTasks = await CleaningController.checkPendingTasks();

  if (hasPendingTasks) {
    console.log("[Epic 11] Cleaning tasks resumed");
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
    // ★★★ 关键修复：在点击 OK 之前，增加任务索引 ★★★
    // 这样页面刷新后，checkPendingTasks 会处理下一个任务
    try {
      const queue = CleaningController.getQueue();
      if (queue && queue.status === "IN_PROGRESS") {
        // 标记当前任务完成
        queue.tasks[queue.currentIndex].completed = true;
        // 增加索引
        queue.currentIndex++;
        // 保存更新的队列
        GM_setValue("hha_cleaner_task_queue", queue);
        console.log(
          `[Epic 11] Task index advanced to ${queue.currentIndex}/${queue.tasks.length}`
        );
      }
    } catch (e) {
      console.error("[Epic 11] Failed to update task queue:", e);
    }

    console.log(
      "[Epic 11] Found and clicking confirmation dialog OK button..."
    );
    okButton.click();
    // 点击后页面会刷新
  } else if (retryCount < MAX_RETRIES) {
    // 对话框可能还没出现，重试
    setTimeout(() => handleConfirmationDialog(retryCount + 1), 300);
  } else {
    // 可能没有确认对话框（某些情况下直接保存成功），不报错
    console.log(
      "[Epic 11] No confirmation dialog found after retries (may not be needed)"
    );
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
