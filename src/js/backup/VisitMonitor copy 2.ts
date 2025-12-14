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

// --- 0. TypeScript 类型定义与环境声明 ---
declare function GM_addStyle(css: string): void;
declare function GM_fetch(url: string, options?: RequestInit): Promise<Response & { rawBody: Blob }>;

// 基础的Coordinator数据结构
interface Coordinator {
    id: number;
    name: string;
}

// 带有状态的Coordinator数据结构，用于主列表
interface CoordinatorStatus extends Coordinator {
    clockIn: number;
    clockOut: number;
    anomalies: number;
}

// API请求所需的参数
interface ApiParams {
    userID: string;
    appSecret: string;
    appVersion: string;
    version: string;
    minorVersion: string;
    appName: string;
}

(function() {
    'use strict';

    if (window.self !== window.top) {
        console.log('Status Tracker script stopped: running in an iframe.');
        return;
    }

    const STORAGE_KEY = 'hha_coordinator_tracker_list';

    // --- 1. 样式定义 (CSS) ---
    GM_addStyle(`
        /* --- General Container --- */
        #tracker-container { position: fixed; top: 20px; right: 20px; z-index: 99999; user-select: none; -webkit-user-select: none; }
        #tracker-drag-handle { width: 48px; height: 48px; background-color: #007bff; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; box-shadow: 0 4px 8px rgba(0,0,0,0.2); font-size: 24px; transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
        #tracker-drag-handle:hover { transform: scale(1.1); }
        #tracker-drag-handle:active { transform: scale(0.95); box-shadow: 0 2px 4px rgba(0,0,0,0.3); }

        /* --- Panel & Views --- */
        #tracker-panel { position: absolute; top: 0; width: 550px; min-height: 200px; background: #f9f9f9; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); display: none; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #333; overflow: hidden; }
        .tracker-view { position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: flex; flex-direction: column; transition: transform 0.3s ease-in-out; }
        .tracker-view.hidden { display: none; }
        
        /* View Transition Animations */
        .slide-in { transform: translateX(0); }
        .slide-out { transform: translateX(-100%); }
        .slide-in-from-right { transform: translateX(100%); }

        /* --- Header --- */
        .tracker-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: #f1f1f1; border-bottom: 1px solid #ddd; flex-shrink: 0; }
        .tracker-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
        .tracker-header-btn { background: #e0e0e0; border: 1px solid #ccc; padding: 4px 10px; border-radius: 5px; cursor: pointer; }
        .tracker-header-btn:hover { background: #d4d4d4; }
        .back-btn { font-size: 20px; padding: 0 10px; }

        /* --- Content & Table --- */
        .tracker-content { flex-grow: 1; padding: 10px; max-height: 60vh; overflow-y: auto; }
        .tracker-table { width: 100%; border-collapse: collapse; }
        .tracker-table th, .tracker-table td { border: 1px solid #ddd; padding: 8px 12px; text-align: center; vertical-align: middle; }
        .tracker-table th { background-color: #e9ecef; font-size: 14px; }
        .tracker-table td { font-size: 13px; }
        .tracker-table .col-coordinator { text-align: left; width: auto; min-width: 150px; }
        .status-icon { width: 28px; height: 28px; border-radius: 50%; color: white; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .status-icon:hover { opacity: 0.8; box-shadow: 0 0 5px rgba(0,0,0,0.5); }
        .status-ok { background-color: #28a745; }
        .status-error { background-color: #dc3545; animation: blink-animation 1.5s infinite; }
        @keyframes blink-animation { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        /* --- Edit View Specifics --- */
        .edit-list-actions button { font-size: 18px; width: 36px; height: 36px; border: none; border-radius: 50%; cursor: pointer; transition: background-color 0.2s; }
        .edit-list-actions button.add-btn { background-color: #28a745; color: white; }
        .edit-list-actions button.remove-btn { background-color: #dc3545; color: white; }
        .edit-list-actions button:disabled { background-color: #ccc; cursor: not-allowed; }
        .tracker-footer { padding: 10px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #ddd; background: #f1f1f1; flex-shrink: 0; }

        /* --- Loader --- */
        .loader { text-align: center; padding: 40px; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* --- Toast Notification --- */
        .tracker-toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background-color: #333; color: white; padding: 10px 20px; border-radius: 5px; z-index: 10000; opacity: 0; transition: opacity 0.3s, bottom 0.3s; }
        .tracker-toast.show { opacity: 1; bottom: 40px; }
        .tracker-toast.success { background-color: #28a745; }
        .tracker-toast.error { background-color: #dc3545; }
    `);

    // --- 2. HTML 结构创建 ---
    const container = document.createElement('div');
    container.id = 'tracker-container';
    const dragHandle = document.createElement('div');
    dragHandle.id = 'tracker-drag-handle';
    dragHandle.innerHTML = '🔔';
    const panel = document.createElement('div');
    panel.id = 'tracker-panel';
    panel.innerHTML = `
        <!-- View 1: Tracking List -->
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

        <!-- View 2: Edit List -->
        <div id="editing-view" class="tracker-view hidden">
            <div class="tracker-header">
                <button id="back-btn" class="tracker-header-btn back-btn">←</button>
                <h3>编辑追踪列表</h3>
            </div>
            <div id="editing-content" class="tracker-content">
                <!-- Loader or table will be injected here -->
            </div>
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
    let tempTrackedIds: Set<number> = new Set(); // 用于在编辑时临时存储ID

    // --- 5. 核心功能逻辑 ---

    /**
     * 显示一个短暂的消息提示 (Toast)
     * @param message 消息内容
     * @param type 类型 'success' 或 'error'
     */
    function showToast(message: string, type: 'success' | 'error'): void {
        const toast = document.createElement('div');
        toast.className = `tracker-toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2500);
    }

    /**
     * 切换视图的动画
     * @param fromView 离开的视图
     * @param toView 进入的视图
     */
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
    
    // --- 数据持久化 (LocalStorage) ---
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

    // --- 渲染逻辑 ---
    /**
     * 渲染主追踪列表
     */
    function renderTrackingView(): void {
        if (trackedCoordinators.length === 0) {
            trackingTableBody.innerHTML = `<tr><td colspan="5">没有正在追踪的 Coordinator</td></tr>`;
            return;
        }

        const rowsHtml = trackedCoordinators.map((coordinator, index) => {
            // Mock status data for now. This will be replaced with real data later.
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

    /**
     * 渲染编辑列表
     * @param allCoordinators 从API获取的所有Coordinator
     */
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

    // --- API 数据获取逻辑 ---

    /**
     * 核心函数：通过三步网络请求获取所有Coordinator
     */
    async function fetchAllCoordinators(): Promise<Coordinator[]> {
        // Step 1: Get initial parameters
        console.log("Step 1: Fetching initial params...");
        const initialUrl = "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
        const r = await GM_fetch(initialUrl, { method: 'GET' });
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

        // Step 2: Get all office IDs
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

        // Step 3: Get coordinators for offices
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
            // 清理名字，只保留名字和ext号码
            name: c.CoordinatorName.match(/.*?ext\.\s*\d+|[^\s@]+(?:\s+[^\s@]+)*/)?.[0] || c.CoordinatorName,
        })).filter((c: Coordinator) => c.name.toLowerCase() !== 'default');
        
        console.log("Step 3 Success. Found coordinators:", coordinators.length);
        return coordinators.sort((a, b) => a.name.localeCompare(b.name));
    }


    // --- 事件监听 ---
    // 编辑按钮点击
    editListBtn.addEventListener('click', async () => {
        editingContent.innerHTML = `<div class="loader"><div class="spinner"></div><p>正在加载人员列表...</p></div>`;
        switchView(trackingView, editingView);
        
        // 初始化临时ID集合
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

    // 编辑列表中的添加/移除按钮 (事件委托)
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
        // 清空编辑内容，以便下次打开时重新加载
        editingContent.innerHTML = '';
    }

    backBtn.addEventListener('click', handleGoBack);
    cancelBtn.addEventListener('click', handleGoBack);

    // 保存按钮点击
    saveBtn.addEventListener('click', () => {
        const allCoordinatorsTable = editingContent.querySelector('#editing-table-body');
        if (!allCoordinatorsTable) {
             handleGoBack(); // 如果列表还没加载出来就点了保存，直接返回
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

    // (拖拽和主图标点击的逻辑保持不变)
    let hasDragged = false, isDragging = false, offsetX = 0, offsetY = 0;
    dragHandle.addEventListener('click', () => { if (!hasDragged) { panel.style.display = panel.style.display === 'block' ? 'none' : 'block'; } });
    dragHandle.addEventListener('mousedown', (e: MouseEvent) => { isDragging = true; hasDragged = false; offsetX = e.clientX - container.getBoundingClientRect().left; offsetY = e.clientY - container.getBoundingClientRect().top; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); });
    function onMouseMove(e: MouseEvent) { if (!isDragging) return; hasDragged = true; let newX = e.clientX - offsetX, newY = e.clientY - offsetY; /* ... boundary checks ... */ container.style.left = `${newX}px`; container.style.top = `${newY}px`; container.style.right = 'auto'; }
    function onMouseUp() { isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); }

    // --- 6. 初始化 ---
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