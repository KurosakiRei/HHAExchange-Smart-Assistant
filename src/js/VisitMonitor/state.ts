import { Coordinator } from './types';
import { showToast } from './ui'; // 导入UI函数以显示错误

export const STORAGE_KEY = 'hha_coordinator_tracker_list';

/**
 * 应用的核心状态，集中管理所有动态数据
 */
export const state = {
    /** 当前正在追踪的 Coordinator 列表 (从 localStorage 加载) */
    trackedCoordinators: [] as Coordinator[],

    /** 从 API 获取的所有可用的 Coordinator 列表 (用于编辑) */
    allCoordinators: [] as Coordinator[],

    /** 在编辑视图中，临时存储用户勾选要追踪的人员 ID */
    tempTrackedIds: new Set<number>(),
};

/**
 * 从 localStorage 加载已保存的追踪列表到 state 中
 */
export function loadTrackedCoordinators(): void {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        state.trackedCoordinators = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to load or parse tracked coordinators from localStorage:", error);
        state.trackedCoordinators = [];
    }
}

/**
 * 将当前选择的追踪列表保存到 localStorage
 * 这是修复 "按钮闪烁" bug 的核心：它使用内存中的 allCoordinators 作为唯一数据源
 */
export function saveTrackedCoordinators(): void {
    try {
        // 根据临时的 ID 集合，从完整的列表中过滤出需要追踪的人员
        state.trackedCoordinators = state.allCoordinators.filter(c => state.tempTrackedIds.has(c.id));
        
        // 将最终结果持久化
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.trackedCoordinators));

    } catch (error) {
        console.error("Failed to save tracked coordinators to localStorage:", error);
        showToast("保存列表时出错", 'error');
    }
}