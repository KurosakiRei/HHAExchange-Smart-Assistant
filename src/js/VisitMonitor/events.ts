import { Coordinator } from './types';
import { state, saveTrackedCoordinators } from './state';
import { fetchAllCoordinators } from './api';
import {
    showToast,
    switchView,
    renderEditingView,
    renderTrackingView,
    // DOM 元素
    container,
    dragHandle,
    panel,
    trackingView,
    editingView,
    editingContent,
    editListBtn,
    backBtn,
    cancelBtn,
    saveBtn
} from './ui';

/**
 * 初始化图标的拖拽与点击功能
 * @param handle - 可拖拽的图标元素
 * @param panel - 需要切换显示的浮窗元素
 * @param container - 包含图标和浮窗的顶层容器
 */
function initializeDragAndClick(handle: HTMLElement, panel: HTMLElement, container: HTMLElement): void {
    let isDragging = false, hasDragged = false, offsetX = 0, offsetY = 0;

    function positionPanel(): void {
        const viewportWidth = window.innerWidth;
        const handleRect = handle.getBoundingClientRect();
        if (handleRect.left + (handleRect.width / 2) < viewportWidth / 2) {
            panel.style.left = `${handle.offsetWidth + 10}px`;
            panel.style.right = 'auto';
        } else {
            panel.style.right = `${handle.offsetWidth + 10}px`;
            panel.style.left = 'auto';
        }
    }

    function handleClick(): void {
        if (hasDragged) return;
        const isVisible = panel.style.display === 'block';
        if (isVisible) {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
            positionPanel();
        }
    }

    function handleMouseDown(e: MouseEvent): void {
        isDragging = true;
        hasDragged = false;
        offsetX = e.clientX - container.getBoundingClientRect().left;
        offsetY = e.clientY - container.getBoundingClientRect().top;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(e: MouseEvent): void {
        if (!isDragging) return;
        hasDragged = true;
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;
        const viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;
        const containerWidth = container.offsetWidth, containerHeight = container.offsetHeight;
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + containerWidth > viewportWidth) newX = viewportWidth - containerWidth;
        if (newY + containerHeight > viewportHeight) newY = viewportHeight - containerHeight;
        container.style.left = `${newX}px`;
        container.style.top = `${newY}px`;
        container.style.right = 'auto';
    }

    function handleMouseUp(): void {
        isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    handle.addEventListener('click', handleClick);
    handle.addEventListener('mousedown', handleMouseDown);
}


/**
 * 绑定所有应用程序的事件监听器
 */
export function attachAllEventListeners(): void {

    // 初始化铃铛图标的拖拽和点击事件
    initializeDragAndClick(dragHandle, panel, container);

    // --- 视图切换事件 ---

    editListBtn.addEventListener('click', async () => {
        editingContent.innerHTML = `<div class="loader"><div class="spinner"></div><p>正在加载人员列表...</p></div>`;
        switchView(trackingView, editingView);

        // 基于当前已追踪的列表，初始化临时列表
        state.tempTrackedIds = new Set(state.trackedCoordinators.map(c => c.id));

        try {
            // 调用 API 获取最新的人员列表，并存入 state
            state.allCoordinators = await fetchAllCoordinators();
            // 使用 state 中的数据渲染编辑视图
            renderEditingView();
        } catch (error) {
            console.error("Error fetching coordinator list:", error);
            showToast("获取人员列表时出错", "error");
            editingContent.innerHTML = `<p style="text-align: center; color: red;">加载失败，请稍后重试。</p>`;
        }
    });

    // --- 编辑视图中的事件 ---

    // 使用事件委托处理编辑列表中的所有按钮点击
    editingContent.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        if (target.tagName === 'BUTTON') {
            const id = parseInt(target.dataset.id!, 10);
            if (state.tempTrackedIds.has(id)) {
                state.tempTrackedIds.delete(id);
                target.textContent = '+';
                target.className = 'add-btn';
            } else {
                state.tempTrackedIds.add(id);
                target.textContent = '−';
                target.className = 'remove-btn';
            }
        }
    });

    // 返回和取消按钮的通用处理函数
    function handleGoBack(): void {
        switchView(editingView, trackingView);
        // 清空编辑内容，以便下次打开时重新加载
        editingContent.innerHTML = '';
    }

    backBtn.addEventListener('click', handleGoBack);
    cancelBtn.addEventListener('click', handleGoBack);

    // 保存按钮
    saveBtn.addEventListener('click', () => {
        // 调用 state 模块中的保存函数，它会使用 state.allCoordinators 和 state.tempTrackedIds 来更新
        saveTrackedCoordinators();

        // 更新主追踪列表的视图
        renderTrackingView();
        showToast("保存成功", "success");
        handleGoBack();
    });
}