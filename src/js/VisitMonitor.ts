import GM_fetch from "@trim21/gm-fetch";

// --- 1. TYPES & INTERFACES ---
interface Coordinator {
  id: number;
  name: string;
}

interface PhoneInfo {
  label: string;
  phone: string;
}

// 追踪结果的详情
interface VisitDetail {
  patientName: string;
  phones: PhoneInfo[]; // 将电话号码分离出来
  assignmentId: string;
  admissionId: string;
  caregiverName: string;
  visitDate: string;
  coordinators: string;
  schedule: string;
  contract: string;
  discipline: string;
  serviceCode: string;
  caregiverTeam: string;
}

// 缓存的数据结构
interface TrackedData {
  count: number;
  details: VisitDetail[];
  timestamp: number; // 缓存时间戳
}

interface ApiParams {
  userID: string;
  appSecret: string;
  appVersion: string;
  version: string;
  minorVersion: string;
  appName: string;
}

export const visitMonitor = async () => {
  // --- FIX 1: 三层防御机制，彻底杜绝脚本重复执行 ---

  // 第 1 层：检查 DOM 中是否已存在UI，如果存在，说明已运行过，立即退出。
  if (document.getElementById("tracker-container")) {
    console.log(
      "Status Tracker script stopped: UI container already exists in the DOM."
    );
    return;
  }
  // 第 2 层：检查顶层窗口的全局标志位，防止 iframe 竞争。
  if ((window.top as any).visitMonitorHasRun) {
    console.log("Status Tracker script stopped: global flag is already set.");
    return;
  }
  (window.top as any).visitMonitorHasRun = true;

  // 第 3 层：您的原始检查，作为基础保险。
  if (window.self !== window.top) {
    console.log("Status Tracker script stopped: running in an iframe.");
    return;
  }

  // --- 状态与常量 ---
  const STORAGE_KEY = "hha_coordinator_tracker_list";
  let trackedCoordinators: Coordinator[] = [];
  let allCoordinators: Coordinator[] = [];
  let tempTrackedIds: Set<number> = new Set();
  // 新增：用于缓存追踪结果和 Office IDs
  const statusDataCache = new Map<string, TrackedData>();
  let officeIdString: string | null = null;

  // --- 2. HTML 结构创建 ---
  const container = document.createElement("div");
  container.id = "tracker-container";
  const dragHandle = document.createElement("div");
  dragHandle.id = "tracker-drag-handle";
  dragHandle.innerHTML = "🔔";
  const panel = document.createElement("div");
  panel.id = "tracker-panel";
  panel.innerHTML = `
        <div id="tracking-view" class="tracker-view">
            <div class="tracker-header">
                <h3>各类状态追踪</h3>
                <button id="edit-list-btn" class="tracker-header-btn">编辑追踪列表</button>
            </div>
            <div class="tracker-content">
                <table class="tracker-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;">编号</th>
                            <th class="col-coordinator">Coordinator (Ext.)</th>
                            <th style="width: 80px;">上班钟</th>
                            <th style="width: 80px;">下班钟</th>
                            <th style="width: 80px;">异常</th>
                        </tr>
                    </thead>
                    <tbody id="tracking-table-body"></tbody>
                </table>
            </div>
        </div>
        <div id="editing-view" class="tracker-view hidden">
            <div class="tracker-header">
                <button id="back-btn" class="tracker-header-btn back-btn">←</button>
                <h3>编辑追踪列表</h3>
            </div>
            <div id="editing-content" class="tracker-content"></div>
            <div class="tracker-footer">
                <button id="cancel-btn" class="tracker-header-btn">取消</button>
                <button id="save-btn" class="tracker-header-btn" style="background-color: #007bff; color: white;">保存</button>
            </div>
        </div>
    `;
  container.appendChild(dragHandle);
  container.appendChild(panel);
  document.body.appendChild(container);

  // --- 3. DOM 元素获取 ---
  const trackingView = document.getElementById(
    "tracking-view"
  ) as HTMLDivElement;
  const editingView = document.getElementById("editing-view") as HTMLDivElement;
  const trackingTableBody = document.getElementById(
    "tracking-table-body"
  ) as HTMLTableSectionElement;
  const editingContent = document.getElementById(
    "editing-content"
  ) as HTMLDivElement;
  const editListBtn = document.getElementById(
    "edit-list-btn"
  ) as HTMLButtonElement;
  const backBtn = document.getElementById("back-btn") as HTMLButtonElement;
  const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
  const saveBtn = document.getElementById("save-btn") as HTMLButtonElement;

  // --- 5. 核心功能逻辑 ---
  function showToast(message: string, type: "success" | "error"): void {
    const toast = document.createElement("div");
    toast.className = `tracker-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2500);
  }

  function switchView(fromView: HTMLElement, toView: HTMLElement): void {
    toView.classList.remove("hidden");
    toView.classList.add("slide-in-from-right");
    requestAnimationFrame(() => {
      fromView.classList.add("slide-out");
      toView.classList.add("slide-in");
      toView.classList.remove("slide-in-from-right");
    });
    setTimeout(() => {
      fromView.classList.remove("slide-in", "slide-out");
      fromView.classList.add("hidden");
    }, 300);
  }

  function loadTrackedCoordinators(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      trackedCoordinators = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(
        "Failed to load or parse tracked coordinators from localStorage:",
        error
      );
      trackedCoordinators = [];
    }
  }

  function saveTrackedCoordinators(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trackedCoordinators));
    } catch (error) {
      console.error(
        "Failed to save tracked coordinators to localStorage:",
        error
      );
      showToast("保存失败", "error");
    }
  }

  async function fetchAllCoordinators(): Promise<Coordinator[]> {
    console.log("Step 1: Fetching initial params...");
    const initialUrl =
      "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
    const r = (await GM_fetch(initialUrl, { method: "GET" })) as Response & {
      rawBody: Blob;
    };
    const textResult = await r.rawBody.text();

    const getParam = (name: string) =>
      textResult.match(
        new RegExp(`var\\s+${name}\\s*=\\s*['"]([^'"]+)['"];`)
      )?.[1];

    const apiParams: ApiParams = {
      userID: getParam("gnUserID")!,
      appSecret: getParam("gnApSc")!,
      appVersion: getParam("gnAppVersion")!,
      version: getParam("gnVersion")!,
      minorVersion: getParam("gnMinorVersion")!,
      appName: getParam("gnApNm")!,
    };

    if (!apiParams.userID || !apiParams.appSecret) {
      throw new Error("Failed to extract initial API parameters.");
    }
    console.log("Step 1 Success. Params:", apiParams);

    console.log("Step 2: Fetching office IDs...");
    const officeUrl = `https://app.hhaexchange.com/HHAWS${
      apiParams.appVersion
    }${apiParams.version.replace(".", "")}010000/Office.asmx/GetAllOffices`;
    const officePayload = {
      ...apiParams,
      IPAddress: "127.0.0.1",
      PayrollSetupID: "-1",
      permissionName: "",
      selectedOfficeID: "-1",
      selectionType: "Filter",
    };

    const officeRes = await fetch(officeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(officePayload),
    });
    const officeData = await officeRes.json();
    const offices = JSON.parse(officeData.d);
    const officeIDs: number[] = offices
      .map((o: any) => o.OfficeID)
      .filter((id: number) => id > 0);
    console.log("Step 2 Success. Office IDs:", officeIDs);

    console.log("Step 3: Fetching coordinators...");
    const coordinatorUrl = `${initialUrl}/GetCoordinatorForOffice`;
    const officeXml = `<Offices>${officeIDs
      .map((id) => `<Office ID="${id}"/>`)
      .join("")}</Offices>`;

    const coordinatorRes = await fetch(coordinatorUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ officeXml }),
    });
    const coordinatorData = await coordinatorRes.json();
    const coordinatorsRaw = JSON.parse(coordinatorData.d);

    const coordinators: Coordinator[] = coordinatorsRaw
      .map((c: any) => ({
        id: c.CoordinatorID,
        name:
          c.CoordinatorName.match(
            /.*?ext\.\s*\d+|[^\s@]+(?:\s+[^\s@]+)*/
          )?.[0] || c.CoordinatorName,
      }))
      .filter((c: Coordinator) => c.name.toLowerCase() !== "default");

    console.log("Step 3 Success. Found coordinators:", coordinators.length);
    return coordinators.sort((a, b) => a.name.localeCompare(b.name));
  }

  // --- 全新的追踪数据获取与解析 ---

  /**
   * 获取并缓存所有 Office IDs
   */
  async function getOfficeIds(): Promise<string> {
    if (officeIdString) return officeIdString;

    // This reuses part of the fetchAllCoordinators logic.
    const r = await GM_fetch(
      "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx",
      { method: "GET" }
    );
    const textResult = await (r as any).rawBody.text();
    const getParam = (name: string) =>
      textResult.match(
        new RegExp(`var\\s+${name}\\s*=\\s*['"]([^'"]+)['"];`)
      )?.[1];
    const apiParams = {
      userID: getParam("gnUserID")!,
      appSecret: getParam("gnApSc")!,
      appVersion: getParam("gnAppVersion")!,
      version: getParam("gnVersion")!,
      minorVersion: getParam("gnMinorVersion")!,
      appName: getParam("gnApNm")!,
    };
    const officeUrl = `https://app.hhaexchange.com/HHAWS${
      apiParams.appVersion
    }${apiParams.version.replace(".", "")}010000/Office.asmx/GetAllOffices`;
    const officePayload = {
      ...apiParams,
      IPAddress: "127.0.0.1",
      PayrollSetupID: "-1",
      permissionName: "",
      selectedOfficeID: "-1",
      selectionType: "Filter",
    };
    const officeRes = await fetch(officeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(officePayload),
    });
    const officeData = await officeRes.json();
    const offices = JSON.parse(officeData.d);
    const officeIDs: number[] = offices
      .map((o: any) => o.OfficeID)
      .filter((id: number) => id > 0);

    officeIdString = officeIDs.join(",");
    return officeIdString;
  }

  /**
   * 解析返回的HTML报告
   */
  function parseCallReport(htmlText: string): Omit<TrackedData, "timestamp"> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    const caption = doc.querySelector("#tdSearchResults caption");
    const captionText = caption?.textContent || "";
    const countMatch = captionText.match(/\((\d+)\)/);
    const count = countMatch ? parseInt(countMatch[1], 10) : 0;

    if (count === 0) {
      return { count: 0, details: [] };
    }

    const details: VisitDetail[] = [];
    const rows = doc.querySelectorAll("#tdSearchResults tbody tr");
    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      if (cells.length < 11) return;

      // FIX: 分离 Patient Name 和电话号码
      const patientCell = cells[0];
      const patientName =
        patientCell.querySelector("a")?.textContent?.trim() || "";
      const phones: PhoneInfo[] = [];
      const phoneDropdown = patientCell.querySelector(".dropdown-pane");
      if (phoneDropdown) {
        phoneDropdown.querySelectorAll(".mb05").forEach((item) => {
          const label = item.querySelector("label")?.textContent?.trim();
          const phone = item.querySelector("span")?.textContent?.trim();
          if (label && phone) {
            phones.push({ label, phone });
          }
        });
      }

      details.push({
        patientName,
        phones,
        assignmentId: cells[1]?.textContent?.trim() || "",
        admissionId: cells[2]?.textContent?.trim() || "",
        caregiverName: cells[3]?.textContent?.trim() || "",
        visitDate: cells[4]?.textContent?.trim() || "",
        coordinators: cells[5]?.textContent?.trim() || "",
        schedule: cells[6]?.textContent?.trim() || "",
        contract: cells[7]?.textContent?.trim() || "",
        discipline: cells[8]?.textContent?.trim() || "",
        serviceCode: cells[9]?.textContent?.trim() || "",
        caregiverTeam: cells[10]?.textContent?.trim() || "",
      });
    });

    return { count, details };
  }

  /**
   * 获取单个状态报告 (上班钟或下班钟)
   */
  async function fetchStatusReport(
    coordinatorId: number,
    callType: 2 | 3,
    officeIds: string
  ): Promise<TrackedData> {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
    const toDate = `${yyyy}-${mm}-${dd} 23:59:00`;
    const time = Date.now();

    const url = new URL(
      "https://app.hhaexchange.com/ENT2507010000/Call/CallReportsXSLT_ns.aspx"
    );
    const params = url.searchParams;
    params.set("CallType", callType.toString());
    params.set("VendorID", "469"); // This might need to be dynamic later
    params.set("CoordinatorID", coordinatorId.toString());
    params.set("FromDate", fromDate);
    params.set("ToDate", toDate);
    params.set("time", time.toString());
    params.set("OfficeId", officeIds);
    // Add other static params
    params.set("sort", "VisitDate");
    params.set("ord", "DESC");
    params.set("Source", "-1");
    params.set("CaregiverTeamID", "-1");
    params.set("SkillType", "-1");
    params.set("HideVisitWithTimeSheetRequired", "false");
    params.set("TimesheetRequired", "-1");
    params.set("PatientTeamID", "-1");
    params.set("PatientLocationID", "-1");
    params.set("PatientBranchID", "-1");
    params.set("CaregiverLocationID", "-1");
    params.set("CaregiverBranchID", "-1");
    params.set("DisciplineIDs", "0");

    const response = await GM_fetch(url.toString(), { method: "GET" });
    const htmlText = await (response as any).rawBody.text();
    const parsedData = parseCallReport(htmlText);

    return { ...parsedData, timestamp: Date.now() };
  }

  // --- 视图渲染与更新 ---

  function renderTrackingView(): void {
    if (trackedCoordinators.length === 0) {
      trackingTableBody.innerHTML = `<tr><td colspan="5">没有正在追踪的 Coordinator</td></tr>`;
      return;
    }

    const rowsHtml = trackedCoordinators
      .map((coordinator, index) => {
        const clockInData = statusDataCache.get(`${coordinator.id}-2`);
        const clockOutData = statusDataCache.get(`${coordinator.id}-3`);

        const clockInCount = clockInData?.count ?? 0;
        const clockOutCount = clockOutData?.count ?? 0;

        const clockInStatus = clockInCount > 0 ? "status-error" : "status-ok";
        const clockOutStatus = clockOutCount > 0 ? "status-error" : "status-ok";

        return `
                <tr>
                    <td>${index + 1}</td>
                    <td class="col-coordinator">${coordinator.name}</td>
                    <td><div class="status-icon ${clockInStatus}" data-coordinator-id="${
          coordinator.id
        }" data-call-type="2">${clockInCount}</div></td>
                    <td><div class="status-icon ${clockOutStatus}" data-coordinator-id="${
          coordinator.id
        }" data-call-type="3">${clockOutCount}</div></td>
                    <td><div class="status-icon status-ok" data-coordinator-id="${
                      coordinator.id
                    }" data-call-type="anomaly">0</div></td>
                </tr>
            `;
      })
      .join("");
    trackingTableBody.innerHTML = rowsHtml;
  }

  // FIX 2: 移除函数参数，使其直接使用上层作用域的 allCoordinators 状态变量
  function renderEditingView(): void {
    const tableHtml = `
            <table class="tracker-table">
                <thead><tr><th class="col-coordinator">所有可用 Coordinator</th><th style="width: 80px;">操作</th></tr></thead>
                <tbody id="editing-table-body">
                    ${allCoordinators
                      .map(
                        (c) => `
                        <tr data-id="${c.id}">
                            <td class="col-coordinator">${c.name}</td>
                            <td class="edit-list-actions">
                                <button class="${
                                  tempTrackedIds.has(c.id)
                                    ? "remove-btn"
                                    : "add-btn"
                                }" data-id="${c.id}" data-name="${c.name}">
                                    ${tempTrackedIds.has(c.id) ? "−" : "+"}
                                </button>
                            </td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>`;
    editingContent.innerHTML = tableHtml;
  }

  // --- 详情气泡 (Popover) ---

  // 新增一个辅助函数来渲染病人姓名单元格
  function renderPatientNameCell(detail: VisitDetail): string {
    if (!detail.phones || detail.phones.length === 0) {
      return `<td>${detail.patientName}</td>`;
    }

    const phoneItems = detail.phones
      .map(
        (p) => `
            <div class="phone-tooltip-item">
                <label>${p.label}</label>
                <span>${p.phone}</span>
            </div>
        `
      )
      .join("");

    return `
            <td>
                <div class="phone-icon-wrapper">
                    <span>${detail.patientName}</span>
                    <span class="phone-icon">📞</span>
                    <div class="phone-tooltip">
                        ${phoneItems}
                    </div>
                </div>
            </td>
        `;
  }

  // --- 追踪循环 ---

  async function runTrackingUpdate() {
    if (trackedCoordinators.length === 0) return;
    console.log(
      `[${new Date().toLocaleTimeString()}] Running tracking update...`
    );

    try {
      const officeIds = await getOfficeIds();
      const promises: Promise<void>[] = [];

      for (const coordinator of trackedCoordinators) {
        // For Clock-In (2)
        promises.push(
          fetchStatusReport(coordinator.id, 2, officeIds).then((data) => {
            statusDataCache.set(`${coordinator.id}-2`, data);
          })
        );
        // For Clock-Out (3)
        promises.push(
          fetchStatusReport(coordinator.id, 3, officeIds).then((data) => {
            statusDataCache.set(`${coordinator.id}-3`, data);
          })
        );
      }

      await Promise.allSettled(promises);
      renderTrackingView(); // Re-render the main view with new data
      console.log("Tracking update complete.");
    } catch (error) {
      console.error("Failed to run tracking update:", error);
      showToast("追踪数据更新失败", "error");
    }
  }

  // --- NEW: 可复用的拖拽函数 (已修复) ---
  /**
   * 使一个元素可以通过其句柄进行拖拽
   * @param draggableElement 需要被拖动的元素
   * @param handleElement 鼠标按下的句柄元素
   */
  function makeDraggable(
    draggableElement: HTMLElement,
    handleElement: HTMLElement
  ) {
    let isDragging = false;
    let offsetX = 0,
      offsetY = 0;

    handleElement.style.cursor = "move";

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      const rect = draggableElement.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;

      // 边界检测 (不变)
      const margin = 5;
      if (newX < margin) newX = margin;
      if (newY < margin) newY = margin;
      if (newX + draggableElement.offsetWidth > window.innerWidth - margin) {
        newX = window.innerWidth - draggableElement.offsetWidth - margin;
      }
      if (newY + draggableElement.offsetHeight > window.innerHeight - margin) {
        newY = window.innerHeight - draggableElement.offsetHeight - margin;
      }

      // FIX: 在设置 left 和 top 的同时，清除 right 和 bottom 的影响
      draggableElement.style.right = "auto";
      draggableElement.style.bottom = "auto";
      draggableElement.style.left = `${newX}px`;
      draggableElement.style.top = `${newY}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    handleElement.addEventListener("mousedown", onMouseDown);
  }

  // --- REWRITTEN: 详情气泡 (Popover) ---
  function showDetailsPopover(data: TrackedData, targetElement: HTMLElement) {
    document.getElementById("details-popover")?.remove();
    const popover = document.createElement("div");
    popover.id = "details-popover";
    const tableRows = data.details
      .map(
        (d) =>
          `<tr>${renderPatientNameCell(d)}<td>${d.assignmentId}</td><td>${
            d.admissionId
          }</td><td>${d.caregiverName}</td><td>${d.visitDate}</td><td>${
            d.coordinators
          }</td><td>${d.schedule}</td><td>${d.contract}</td><td>${
            d.discipline
          }</td><td>${d.serviceCode}</td><td>${d.caregiverTeam}</td></tr>`
      )
      .join("");
    popover.innerHTML = `<div class="popover-header"><h4>详情列表 (${data.count} 条记录)</h4><button class="popover-close-btn">&times;</button></div><div class="popover-content"><table class="popover-table"><thead><tr><th>Patient Name</th><th>Assignment ID</th><th>Admission ID</th><th>Caregiver Name</th><th>Visit Date</th><th>Coordinators</th><th>Schedule</th><th>Contract</th><th>Discipline</th><th>Service Code</th><th>Caregiver Team</th></tr></thead><tbody>${tableRows}</tbody></table></div>`;
    document.body.appendChild(popover);

    const popoverHeader = popover.querySelector(
      ".popover-header"
    ) as HTMLElement;
    if (popoverHeader) makeDraggable(popover, popoverHeader);

    const targetRect = targetElement.getBoundingClientRect();
    const popoverHeight = popover.offsetHeight,
      popoverWidth = popover.offsetWidth;
    const margin = 10;
    let top = targetRect.bottom + 5;
    if (top + popoverHeight > window.innerHeight - margin)
      top = targetRect.top - popoverHeight - 5;
    if (top < margin) top = margin;
    let left = targetRect.left;
    if (left + popoverWidth > window.innerWidth - margin)
      left = targetRect.right - popoverWidth;
    if (left < margin) left = margin;

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
    popover
      .querySelector(".popover-close-btn")
      ?.addEventListener("click", () => popover.remove());
    requestAnimationFrame(() => popover.classList.add("visible"));
  }

  // --- REFACTORED: 拖拽与点击逻辑 ---
  function initializeDragAndClick() {
    let hasDragged = false;
    // 主面板拖拽
    makeDraggable(container, dragHandle);
    // 点击/拖拽区分
    dragHandle.addEventListener("mousedown", () => {
      hasDragged = false;
    });
    dragHandle.addEventListener("mousemove", () => {
      hasDragged = true;
    });
    dragHandle.addEventListener("click", () => {
      if (hasDragged) return;
      const isVisible = panel.style.display === "flex";
      if (isVisible) {
        panel.style.display = "none";
      } else {
        console.log("Panel opened. Syncing with localStorage...");
        loadTrackedCoordinators();
        renderTrackingView();
        console.log("Triggering immediate data fetch...");
        runTrackingUpdate();
        panel.style.display = "flex";
        // Position panel
        const w = window.innerWidth,
          r = dragHandle.getBoundingClientRect();
        if (r.left + r.width / 2 < w / 2) {
          panel.style.left = `${dragHandle.offsetWidth + 10}px`;
          panel.style.right = "auto";
        } else {
          panel.style.right = `${dragHandle.offsetWidth + 10}px`;
          panel.style.left = "auto";
        }
      }
    });
  }

  function attachAllEventListeners() {
    initializeDragAndClick();

    const editListBtn = document.getElementById(
      "edit-list-btn"
    ) as HTMLButtonElement;
    editListBtn.addEventListener("click", async () => {
      editingContent.innerHTML = `
            <div class="loader">
                <div class="spinner"></div>
                <p>正在加载人员列表...</p>
            </div>
        `;

      switchView(trackingView, editingView);
      tempTrackedIds = new Set(trackedCoordinators.map((c) => c.id));

      try {
        allCoordinators = await fetchAllCoordinators();
        renderEditingView();
      } catch (error) {
        console.error("Error fetching coordinator list:", error);
        showToast("获取人员列表时出错", "error");
        editingContent.innerHTML = `
                <p style="text-align:center;color:red">
                    加载失败，请稍后重试。
                </p>
            `;
      }
    });

    const editingContent = document.getElementById(
      "editing-content"
    ) as HTMLDivElement;
    editingContent.addEventListener("click", (e) => {
      const target = e.target as HTMLButtonElement;
      if (target.tagName !== "BUTTON") return;

      const id = parseInt(target.dataset.id!, 10);
      if (tempTrackedIds.has(id)) {
        tempTrackedIds.delete(id);
        target.textContent = "+";
        target.className = "add-btn";
      } else {
        tempTrackedIds.add(id);
        target.textContent = "−";
        target.className = "remove-btn";
      }
    });

    const handleGoBack = () => {
      switchView(editingView, trackingView);
      editingContent.innerHTML = "";
    };

    const backBtn = document.getElementById("back-btn") as HTMLButtonElement;
    backBtn.addEventListener("click", handleGoBack);

    const cancelBtn = document.getElementById(
      "cancel-btn"
    ) as HTMLButtonElement;
    cancelBtn.addEventListener("click", handleGoBack);

    const saveBtn = document.getElementById("save-btn") as HTMLButtonElement;
    saveBtn.addEventListener("click", () => {
      trackedCoordinators = allCoordinators.filter((c) =>
        tempTrackedIds.has(c.id)
      );
      saveTrackedCoordinators();
      renderTrackingView();
      showToast("保存成功", "success");
      handleGoBack();
    });

    const trackingTableBody = document.getElementById(
      "tracking-table-body"
    ) as HTMLTableSectionElement;
    trackingTableBody.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains("status-icon")) return;

      const coordinatorId = target.dataset.coordinatorId;
      const callType = target.dataset.callType;
      if (!coordinatorId || !callType) return;

      if (callType === "anomaly") {
        showToast("异常追踪功能待开发", "success");
        return;
      }

      const cacheKey = `${coordinatorId}-${callType}`;
      const data = statusDataCache.get(cacheKey);

      if (data) {
        showDetailsPopover(data, target);
      } else {
        showToast("暂无数据或正在加载中...", "success");
      }
    });
  }

  function initialize() {
    loadTrackedCoordinators();
    renderTrackingView();
    attachAllEventListeners();

    runTrackingUpdate();
    setInterval(runTrackingUpdate, 30000);
  }

  initialize();

  try {
    let CallMaintenance_ns =
      "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
    const r = (await GM_fetch(CallMaintenance_ns, {
      method: "GET",
    })) as Response & { rawBody: Blob };
    console.log("r", r);
    const result = await r.rawBody.text();
    console.log("text:", result);
  } catch (error) {
    console.error(error);
  }
};
