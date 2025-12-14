import GM_fetch from "@trim21/gm-fetch";

interface Coordinator {
    id: number;
    name: string;
}

interface CoordinatorStatus extends Coordinator {
    clockIn: number;
    clockOut: number;
    anomalies: number;
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

    if (window.self !== window.top) {
        console.log('Status Tracker script stopped: running in an iframe.');
        return;
    }

    const STORAGE_KEY = 'hha_coordinator_tracker_list';

    // --- 1. 样式定义 (CSS) ---
    // Styles are now managed in an external CSS file.


    // --- 2. HTML 结构创建 ---
    const container = document.createElement('div');
    container.id = 'tracker-container';
    const dragHandle = document.createElement('div');
    dragHandle.id = 'tracker-drag-handle';
    dragHandle.innerHTML = '🔔';
    const panel = document.createElement('div');
    panel.id = 'tracker-panel';
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
    const trackingView = document.getElementById('tracking-view') as HTMLDivElement;
    const editingView = document.getElementById('editing-view') as HTMLDivElement;
    const trackingTableBody = document.getElementById('tracking-table-body') as HTMLTableSectionElement;
    const editingContent = document.getElementById('editing-content') as HTMLDivElement;
    const editListBtn = document.getElementById('edit-list-btn') as HTMLButtonElement;
    const backBtn = document.getElementById('back-btn') as HTMLButtonElement;
    const cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;
    const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;

    // --- 4. 状态管理 ---
    let trackedCoordinators: Coordinator[] = [];
    let tempTrackedIds: Set<number> = new Set();

    // --- 5. 核心功能逻辑 ---
    function showToast(message: string, type: 'success' | 'error'): void {
        const toast = document.createElement('div');
        toast.className = `tracker-toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => { toast.classList.add('show'); }, 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => { document.body.removeChild(toast); }, 300);
        }, 2500);
    }

    function switchView(fromView: HTMLElement, toView: HTMLElement): void {
        toView.classList.remove('hidden');
        toView.classList.add('slide-in-from-right');
        requestAnimationFrame(() => {
            fromView.classList.add('slide-out');
            toView.classList.add('slide-in');
            toView.classList.remove('slide-in-from-right');
        });
        setTimeout(() => {
            fromView.classList.remove('slide-in', 'slide-out');
            fromView.classList.add('hidden');
        }, 300);
    }
    
    function loadTrackedCoordinators(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            trackedCoordinators = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Failed to load or parse tracked coordinators from localStorage:", error);
            trackedCoordinators = [];
        }
    }

    function saveTrackedCoordinators(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trackedCoordinators));
        } catch (error) {
            console.error("Failed to save tracked coordinators to localStorage:", error);
            showToast("保存失败", 'error');
        }
    }

    function renderTrackingView(): void {
        if (trackedCoordinators.length === 0) {
            trackingTableBody.innerHTML = `<tr><td colspan="5">没有正在追踪的 Coordinator</td></tr>`;
            return;
        }
        const rowsHtml = trackedCoordinators.map((coordinator, index) => {
            const status: CoordinatorStatus = { ...coordinator, clockIn: 0, clockOut: 0, anomalies: 0 };
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td class="col-coordinator">${status.name}</td>
                    <td><div class="status-icon status-ok">0</div></td>
                    <td><div class="status-icon status-ok">0</div></td>
                    <td><div class="status-icon status-ok">0</div></td>
                </tr>
            `;
        }).join('');
        trackingTableBody.innerHTML = rowsHtml;
    }

    function renderEditingView(allCoordinators: Coordinator[]): void {
        const tableHtml = `
            <table class="tracker-table">
                <thead>
                    <tr>
                        <th class="col-coordinator">所有可用 Coordinator</th>
                        <th style="width: 80px;">操作</th>
                    </tr>
                </thead>
                <tbody id="editing-table-body">
                    ${allCoordinators.map(c => `
                        <tr data-id="${c.id}">
                            <td class="col-coordinator">${c.name}</td>
                            <td class="edit-list-actions">
                                <button class="${tempTrackedIds.has(c.id) ? 'remove-btn' : 'add-btn'}" data-id="${c.id}" data-name="${c.name}">
                                    ${tempTrackedIds.has(c.id) ? '−' : '+'}
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
        editingContent.innerHTML = tableHtml;
    }

    async function fetchAllCoordinators(): Promise<Coordinator[]> {
        console.log("Step 1: Fetching initial params...");
        const initialUrl = "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
        const r = await GM_fetch(initialUrl, { method: 'GET' }) as Response & { rawBody: Blob };
        const textResult = await r.rawBody.text();

        const getParam = (name: string) => textResult.match(new RegExp(`var\\s+${name}\\s*=\\s*['"]([^'"]+)['"];`))?.[1];

        const apiParams: ApiParams = {
            userID: getParam('gnUserID')!,
            appSecret: getParam('gnApSc')!,
            appVersion: getParam('gnAppVersion')!,
            version: getParam('gnVersion')!,
            minorVersion: getParam('gnMinorVersion')!,
            appName: getParam('gnApNm')!,
        };

        if (!apiParams.userID || !apiParams.appSecret) {
            throw new Error("Failed to extract initial API parameters.");
        }
        console.log("Step 1 Success. Params:", apiParams);

        console.log("Step 2: Fetching office IDs...");
        const officeUrl = `https://app.hhaexchange.com/HHAWS${apiParams.appVersion}${apiParams.version.replace('.', '')}010000/Office.asmx/GetAllOffices`;
        const officePayload = { ...apiParams, IPAddress: "127.0.0.1", PayrollSetupID: "-1", permissionName: "", selectedOfficeID: "-1", selectionType: "Filter" };

        const officeRes = await fetch(officeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(officePayload),
        });
        const officeData = await officeRes.json();
        const offices = JSON.parse(officeData.d);
        const officeIDs: number[] = offices.map((o: any) => o.OfficeID).filter((id: number) => id > 0);
        console.log("Step 2 Success. Office IDs:", officeIDs);

        console.log("Step 3: Fetching coordinators...");
        const coordinatorUrl = `${initialUrl}/GetCoordinatorForOffice`;
        const officeXml = `<Offices>${officeIDs.map(id => `<Office ID="${id}"/>`).join('')}</Offices>`;
        
        const coordinatorRes = await fetch(coordinatorUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({ officeXml }),
        });
        const coordinatorData = await coordinatorRes.json();
        const coordinatorsRaw = JSON.parse(coordinatorData.d);

        const coordinators: Coordinator[] = coordinatorsRaw.map((c: any) => ({
            id: c.CoordinatorID,
            name: c.CoordinatorName.match(/.*?ext\.\s*\d+|[^\s@]+(?:\s+[^\s@]+)*/)?.[0] || c.CoordinatorName,
        })).filter((c: Coordinator) => c.name.toLowerCase() !== 'default');
        
        console.log("Step 3 Success. Found coordinators:", coordinators.length);
        return coordinators.sort((a, b) => a.name.localeCompare(b.name));
    }

    editListBtn.addEventListener('click', async () => {
        editingContent.innerHTML = `<div class="loader"><div class="spinner"></div><p>正在加载人员列表...</p></div>`;
        switchView(trackingView, editingView);
        tempTrackedIds = new Set(trackedCoordinators.map(c => c.id));
        try {
            const allCoordinators = await fetchAllCoordinators();
            renderEditingView(allCoordinators);
        } catch (error) {
            console.error("Error fetching coordinator list:", error);
            showToast("获取人员列表时出错", "error");
            editingContent.innerHTML = `<p style="text-align: center; color: red;">加载失败，请稍后重试。</p>`;
        }
    });

    editingContent.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        if (target.tagName === 'BUTTON') {
            const id = parseInt(target.dataset.id!, 10);
            if (tempTrackedIds.has(id)) {
                tempTrackedIds.delete(id);
                target.textContent = '+';
                target.className = 'add-btn';
            } else {
                tempTrackedIds.add(id);
                target.textContent = '−';
                target.className = 'remove-btn';
            }
        }
    });
    
    function handleGoBack(): void {
        switchView(editingView, trackingView);
        editingContent.innerHTML = '';
    }

    backBtn.addEventListener('click', handleGoBack);
    cancelBtn.addEventListener('click', handleGoBack);

    saveBtn.addEventListener('click', () => {
        const allCoordinatorsTable = editingContent.querySelector('#editing-table-body');
        if (!allCoordinatorsTable) {
             handleGoBack();
             return;
        }
        const allAvailableCoordinators: Coordinator[] = Array.from(allCoordinatorsTable.querySelectorAll('tr')).map(tr => {
            const button = tr.querySelector('button') as HTMLButtonElement;
            return {
                id: parseInt(button.dataset.id!, 10),
                name: button.dataset.name!
            };
        });
        trackedCoordinators = allAvailableCoordinators.filter(c => tempTrackedIds.has(c.id));
        saveTrackedCoordinators();
        renderTrackingView();
        showToast("保存成功", "success");
        handleGoBack();
    });

    let hasDragged = false, isDragging = false, offsetX = 0, offsetY = 0;
    dragHandle.addEventListener('click', () => { if (!hasDragged) { const isVisible = panel.style.display === 'block'; if (isVisible) { panel.style.display = 'none'; } else { panel.style.display = 'block'; const viewportWidth = window.innerWidth; const handleRect = dragHandle.getBoundingClientRect(); if (handleRect.left + (handleRect.width / 2) < viewportWidth / 2) { panel.style.left = `${handleRect.width + 10}px`; panel.style.right = 'auto'; } else { panel.style.right = `${handleRect.width + 10}px`; panel.style.left = 'auto'; } } } });
    dragHandle.addEventListener('mousedown', (e: MouseEvent) => { isDragging = true; hasDragged = false; offsetX = e.clientX - container.getBoundingClientRect().left; offsetY = e.clientY - container.getBoundingClientRect().top; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); });
    function onMouseMove(e: MouseEvent) { if (!isDragging) return; hasDragged = true; let newX = e.clientX - offsetX, newY = e.clientY - offsetY; const viewportWidth = window.innerWidth, viewportHeight = window.innerHeight, containerWidth = container.offsetWidth, containerHeight = container.offsetHeight; if (newX < 0) newX = 0; if (newY < 0) newY = 0; if (newX + containerWidth > viewportWidth) newX = viewportWidth - containerWidth; if (newY + containerHeight > viewportHeight) newY = viewportHeight - containerHeight; container.style.left = `${newX}px`; container.style.top = `${newY}px`; container.style.right = 'auto'; }
    function onMouseUp() { isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); }

    function initialize() {
        loadTrackedCoordinators();
        renderTrackingView();
    }

    initialize();
    try {
        let CallMaintenance_ns = "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx"
        const r = await GM_fetch(CallMaintenance_ns, { method: 'GET' }) as Response & { rawBody: Blob };
        console.log("r", r);
        const result = await r.rawBody.text();
        console.log("text:", result)
    } catch (error) {
        console.error(error);
    }



}