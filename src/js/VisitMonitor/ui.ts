import { Coordinator, CoordinatorStatus } from './types';
import { state } from './state';

// --- 导出所有需要被其他文件访问的 DOM 元素变量 ---

// 顶层容器
export let container: HTMLDivElement;
export let dragHandle: HTMLDivElement;
export let panel: HTMLDivElement;

// 视图容器
export let trackingView: HTMLDivElement;
export let editingView: HTMLDivElement;

// 内容区域
export let trackingTableBody: HTMLTableSectionElement;
export let editingContent: HTMLDivElement;

// 按钮
export let editListBtn: HTMLButtonElement;
export let backBtn: HTMLButtonElement;
export let cancelBtn: HTMLButtonElement;
export let saveBtn: HTMLButtonElement;


/**
 * 创建所有初始的 DOM 结构并查询关键元素
 */
export function createDOM(): void {
    container = document.createElement('div');
    container.id = 'tracker-container';

    dragHandle = document.createElement('div');
    dragHandle.id = 'tracker-drag-handle';
    dragHandle.innerHTML = '🔔';

    panel = document.createElement('div');
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
            <div id="editing-content" class="tracker-content">
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

    // 查询并赋值给导出的变量
    trackingView = document.getElementById('tracking-view') as HTMLDivElement;
    editingView = document.getElementById('editing-view') as HTMLDivElement;
    trackingTableBody = document.getElementById('tracking-table-body') as HTMLTableSectionElement;
    editingContent = document.getElementById('editing-content') as HTMLDivElement;
    editListBtn = document.getElementById('edit-list-btn') as HTMLButtonElement;
    backBtn = document.getElementById('back-btn') as HTMLButtonElement;
    cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;
    saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
}


/**
 * 显示一个短暂的消息提示 (Toast)
 * @param message 消息内容
 * @param type 类型 'success' 或 'error'
 */
export function showToast(message: string, type: 'success' | 'error'): void {
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
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 2500);
}


/**
 * 切换视图的动画
 * @param fromView 离开的视图
 * @param toView 进入的视图
 */
export function switchView(fromView: HTMLElement, toView: HTMLElement): void {
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


/**
 * 渲染主追踪列表
 * 该函数从 state.ts 导入 trackedCoordinators 进行渲染
 */
export function renderTrackingView(): void {
    if (state.trackedCoordinators.length === 0) {
        trackingTableBody.innerHTML = `<tr><td colspan="5">没有正在追踪的 Coordinator</td></tr>`;
        return;
    }

    const rowsHtml = state.trackedCoordinators.map((coordinator, index) => {
        // Mock status data for now.
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
 * 该函数从 state.ts 导入 allCoordinators 和 tempTrackedIds 进行渲染
 */
export function renderEditingView(): void {
    const tableHtml = `
        <table class="tracker-table">
            <thead>
                <tr>
                    <th class="col-coordinator">所有可用 Coordinator</th>
                    <th style="width: 80px;">操作</th>
                </tr>
            </thead>
            <tbody id="editing-table-body">
                ${state.allCoordinators.map(c => `
                    <tr data-id="${c.id}">
                        <td class="col-coordinator">${c.name}</td>
                        <td class="edit-list-actions">
                            <button class="${state.tempTrackedIds.has(c.id) ? 'remove-btn' : 'add-btn'}" data-id="${c.id}" data-name="${c.name}">
                                ${state.tempTrackedIds.has(c.id) ? '−' : '+'}
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
    editingContent.innerHTML = tableHtml;
}