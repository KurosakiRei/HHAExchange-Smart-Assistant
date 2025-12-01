import { attachAllEventListeners } from './events';
import { loadTrackedCoordinators } from './state';
import { createDOM, renderTrackingView } from './ui';

// 主 IIFE (立即执行函数表达式)
export const visitMonitor = () => {
    'use strict';

    // FIX: 确保这是脚本执行的第一件事
    if (window.self !== window.top) {
        console.log('Status Tracker script stopped: running in an iframe.');
        return;
    }

    // 主初始化函数
    function initialize() {
        // 如果您使用 @resource 加载 CSS, 在这里用 GM_addStyle(GM_getResourceText("styles")) 注入
        // GM_addStyle(GM_getResourceText("styles"));
        
        createDOM();
        loadTrackedCoordinators();
        renderTrackingView();
        attachAllEventListeners();
    }

    initialize();
};