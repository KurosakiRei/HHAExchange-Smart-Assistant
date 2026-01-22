/**
 * OutlookDOMControllerPayload - Outlook DOM 控制器负载脚本
 * Epic 12, Story 11: CSP 合规的 Outlook 集成重构
 *
 * 重要说明：
 * - 这段代码会被序列化为字符串，通过 GM.addElement 注入到页面主世界执行
 * - 因此必须是完全自包含的 IIFE (Immediately Invoked Function Expression)
 * - 不能依赖外部模块或 TypeScript 特性
 * - 所有依赖必须内联在此文件中
 *
 * 功能：
 * - 在 Outlook 页面主世界中运行
 * - 提供邮件自动填充功能
 * - 通过 CustomEvent 与 OutlookAdapter 通信
 */

/**
 * Outlook DOM Controller Payload
 * 这是一个自包含的 JavaScript 代码字符串，将被注入到 Outlook 页面
 */
export const OutlookDOMControllerPayload = `
(function() {
  'use strict';

  // 防止重复初始化
  if (window.HHAOutlookController) {
    console.log('[OutlookDOMController] Already initialized, skipping');
    return;
  }

  console.log('[OutlookDOMController] Initializing...');

  /**
   * Outlook DOM 选择器
   * 基于浏览器远程调试确认 (2026-01)
   * 使用 EditorClass[id] 定位收件人字段
   */
  var SELECTORS = {
    // 新邮件按钮
    newMailButton: 'button[aria-label="New mail"]',
    newMailButtonAlt: '[data-testid="new-message-button"]',

    // 收件人字段 - 通过父容器的 _TO, _CC 后缀定位（更可靠）
    // 旧选择器 div.EditorClass[id="0"] 可能与其他元素冲突
    toField: 'div[id$="_TO"] .EditorClass, div.EditorClass[id="0"]',
    ccField: 'div[id$="_CC"] .EditorClass, div.EditorClass[id="1"]',

    // 主题字段
    subjectField: 'input[aria-label="Subject"]',
    subjectFieldAlt: 'input[placeholder="Add a subject"]',

    // 邮件正文编辑器
    bodyEditor: 'div[aria-label="Message body"]',

    // 发送按钮
    sendButton: 'button[aria-label="Send"]',
    sendButtonAlt: '[data-testid="send-button"]',

    // 丢弃/关闭按钮 (用于关闭已打开的草稿)
    discardButton: 'button[aria-label="Discard"]',
    discardConfirmButton: 'button[data-testid="confirmDialogPrimaryButton"], .ms-Dialog-main button.ms-Button--primary'
  };

  /**
   * 工具函数：等待元素出现
   * @param {string} selector - CSS 选择器
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<Element>}
   */
  function waitForElement(selector, timeout) {
    return new Promise(function(resolve, reject) {
      var startTime = Date.now();
      
      function check() {
        var el = document.querySelector(selector);
        if (el) {
          resolve(el);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Element ' + selector + ' not found within ' + timeout + 'ms'));
        } else {
          requestAnimationFrame(check);
        }
      }
      
      check();
    });
  }

  /**
   * 工具函数：延迟
   * @param {number} ms - 毫秒数
   * @returns {Promise<void>}
   */
  function sleep(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
  }

  /**
   * 关闭已存在的草稿窗口（如果有）
   * 检测：如果存在邮件正文区域但没有新邮件按钮，则说明窗口已打开
   * @returns {Promise<boolean>} - 是否成功关闭了现有草稿
   */
  async function closeExistingDraft() {
    var bodyEditor = document.querySelector(SELECTORS.bodyEditor);
    var newMailBtn = document.querySelector(SELECTORS.newMailButton) || 
                     document.querySelector(SELECTORS.newMailButtonAlt);
    
    // 如果存在正文区域但没有新邮件按钮，说明草稿窗口已打开
    if (bodyEditor && !newMailBtn) {
      console.log('[OutlookDOMController] Existing draft detected, attempting to close...');
      
      // 尝试点击丢弃按钮
      var discardBtn = document.querySelector(SELECTORS.discardButton);
      if (discardBtn) {
        discardBtn.click();
        await sleep(500);
        
        // 等待确认对话框并点击确认
        var confirmBtn = document.querySelector(SELECTORS.discardConfirmButton);
        if (confirmBtn) {
          confirmBtn.click();
          console.log('[OutlookDOMController] Clicked discard confirm button');
          await sleep(800); // 等待对话框关闭
        }
        
        console.log('[OutlookDOMController] Existing draft closed');
        return true;
      } else {
        console.warn('[OutlookDOMController] Discard button not found, cannot close existing draft');
      }
    }
    
    return false;
  }

  /**
   * 填充输入字段（支持 React 合成事件）
   * @param {string|string[]} selectors - CSS 选择器或选择器数组
   * @param {string} value - 要填充的值
   * @returns {boolean} - 是否成功
   */
  function fillInputField(selectors, value) {
    var selectorList = Array.isArray(selectors) ? selectors : [selectors];
    
    for (var i = 0; i < selectorList.length; i++) {
      var selector = selectorList[i];
      var field = document.querySelector(selector);
      
      if (field) {
        // 聚焦字段
        field.focus();
        
        // 使用原生 setter 设置值（兼容 React）
        var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        );
        
        if (nativeInputValueSetter && nativeInputValueSetter.set) {
          nativeInputValueSetter.set.call(field, value);
        } else {
          field.value = value;
        }
        
        // 触发事件
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
        
        console.log('[OutlookDOMController] Filled field:', selector, '->', value.substring(0, 30) + (value.length > 30 ? '...' : ''));
        return true;
      }
    }
    
    console.warn('[OutlookDOMController] Field not found:', selectorList.join(' | '));
    return false;
  }

  /**
   * 填充 EditorClass 类型的字段（To/Cc 使用这种）
   * Outlook 的收件人字段是复杂的 div，需要模拟键入
   * @param {string} containerSelector - EditorClass 容器选择器（可以是逗号分隔的多个选择器）
   * @param {string} value - 要填充的值（邮箱地址）
   * @returns {boolean} - 是否成功
   */
  function fillEditorClassField(containerSelector, value) {
    // 支持逗号分隔的多个选择器（按顺序尝试）
    var selectors = containerSelector.split(',').map(function(s) { return s.trim(); });
    var container = null;
    
    for (var i = 0; i < selectors.length; i++) {
      container = document.querySelector(selectors[i]);
      if (container) {
        console.log('[OutlookDOMController] Found EditorClass with selector:', selectors[i]);
        break;
      }
    }
    
    if (!container) {
      console.warn('[OutlookDOMController] EditorClass container not found:', containerSelector);
      return false;
    }
    
    // 聚焦容器
    container.focus();
    container.click();
    
    // 尝试找到可编辑区域
    var editable = container.querySelector('[contenteditable="true"]') || 
                   container.querySelector('[role="textbox"]') ||
                   container;
    
    if (editable) {
      editable.focus();
      
      // 使用 innerText 设置内容（比 execCommand 更可靠）
      editable.innerText = value;
      
      // 触发事件让 Outlook 识别输入
      editable.dispatchEvent(new Event('input', { bubbles: true }));
      editable.dispatchEvent(new Event('change', { bubbles: true }));
      editable.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      
      console.log('[OutlookDOMController] Filled EditorClass field:', containerSelector, '->', value);
      return true;
    }
    
    console.warn('[OutlookDOMController] No editable area in container:', containerSelector);
    return false;
  }

  /**
   * 填充邮件正文（在开头插入内容，保留签名）
   * 关键：不使用 selectAll + delete，而是将光标移到开头插入
   * @param {string} htmlBody - HTML 格式的邮件正文
   * @returns {boolean} - 是否成功
   */
  function fillBodyEditor(htmlBody) {
    var editor = document.querySelector(SELECTORS.bodyEditor);
    
    if (!editor) {
      console.warn('[OutlookDOMController] Body editor not found');
      return false;
    }
    
    // 聚焦编辑器
    editor.focus();
    
    // 将光标移动到编辑器开头（保留签名）
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(editor, 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    
    // 规范化内容：处理 HTML 和纯文本两种情况
    // 1. 将 </p><p> 转换为双换行（段落之间保留空行）
    // 2. 移除单独的 <p> 和 </p> 标签
    // 3. 将纯文本 \\n 转换为 <br>
    // 注意：不要合并连续的 <br>，因为用户可能故意留空行
    var normalizedHtml = htmlBody
      .replace(/<\\/p>\\s*<p>/gi, '<br><br>')  // </p><p> -> 双换行保留段落间隔
      .replace(/<p>/gi, '')                    // 移除开始 <p>
      .replace(/<\\/p>/gi, '')                 // 移除结束 </p>
      .replace(/\\r?\\n/g, '<br>');             // \\n -> <br>
    
    console.log('[OutlookDOMController] Normalized body content, inserting...');
    
    // 在开头插入 HTML 内容
    document.execCommand('insertHTML', false, normalizedHtml + '<br><br>');
    
    // 触发 input 事件
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('[OutlookDOMController] Body filled successfully (signature preserved)');
    return true;
  }

  /**
   * 通知任务完成状态（通过 CustomEvent）
   * @param {string} status - 'SUCCESS' 或 'FAILED'
   * @param {string|null} error - 错误信息（如果有）
   */
  function notifyTaskComplete(status, error) {
    document.dispatchEvent(new CustomEvent('hha-outlook-task-complete', {
      detail: { status: status, error: error || null }
    }));
    console.log('[OutlookDOMController] Task complete notification sent:', status);
  }

  /**
   * 主执行流程：执行邮件任务
   * @param {Object} task - 邮件任务对象
   * @param {string} task.to - 收件人
   * @param {string} [task.cc] - 抄送
   * @param {string} task.subject - 主题
   * @param {string} task.body - 正文（HTML）
   */
  async function executeMailTask(task) {
    console.log('[OutlookDOMController] Executing mail task:', task);
    
    try {
      // 0. 先关闭已存在的草稿窗口（如果有）
      var closedDraft = await closeExistingDraft();
      if (closedDraft) {
        console.log('[OutlookDOMController] Closed existing draft, waiting for UI to stabilize...');
        await sleep(1000);
      }
      
      // 1. 点击新建邮件按钮（可能需要短暂等待按钮出现）
      var newMailBtn = null;
      for (var attempt = 0; attempt < 5; attempt++) {
        newMailBtn = document.querySelector(SELECTORS.newMailButton) || 
                     document.querySelector(SELECTORS.newMailButtonAlt);
        if (newMailBtn) break;
        await sleep(300);
      }
      
      if (!newMailBtn) {
        throw new Error('New mail button not found');
      }
      
      newMailBtn.click();
      console.log('[OutlookDOMController] Clicked New Mail button');
      
      // 2. 等待编辑器加载
      try {
        await waitForElement(SELECTORS.subjectField, 5000);
      } catch (e) {
        await waitForElement(SELECTORS.subjectFieldAlt, 3000);
      }
      await sleep(500); // 额外等待确保 UI 稳定
      
      // 3. 填充 To 字段 - 直接使用 EditorClass[id="0"]
      if (task.to) {
        // 添加分号让 Outlook 识别为收件人
        var toEmail = task.to.endsWith(';') ? task.to : task.to + ';';
        fillEditorClassField(SELECTORS.toField, toEmail);
        await sleep(300);
        // 移开焦点以触发收件人解析
        var subjectInput = document.querySelector(SELECTORS.subjectField);
        if (subjectInput) subjectInput.focus();
        await sleep(200);
      }
      
      // 4. 填充 CC 字段（如果有）- 直接使用 EditorClass[id="1"]
      if (task.cc) {
        var ccEmail = task.cc.endsWith(';') ? task.cc : task.cc + ';';
        fillEditorClassField(SELECTORS.ccField, ccEmail);
        await sleep(300);
        // 移开焦点
        var subjectInput = document.querySelector(SELECTORS.subjectField);
        if (subjectInput) subjectInput.focus();
        await sleep(200);
      }
      
      // 5. 填充主题
      fillInputField([SELECTORS.subjectField, SELECTORS.subjectFieldAlt], task.subject);
      await sleep(300);
      
      // 6. 填充正文
      fillBodyEditor(task.body);
      
      // 7. 报告成功
      notifyTaskComplete('SUCCESS', null);
      
    } catch (error) {
      console.error('[OutlookDOMController] Error:', error);
      notifyTaskComplete('FAILED', error.message || String(error));
    }
  }

  // ===== 暴露到全局供 OutlookAdapter 调用 =====
  window.HHAOutlookController = {
    executeMailTask: executeMailTask,
    version: '1.0.0',
    selectors: SELECTORS
  };

  console.log('[OutlookDOMController] Loaded and ready (v1.0.0)');
})();
`;

/**
 * Payload 脚本的标识符，用于防止重复注入
 */
export const OUTLOOK_DOM_CONTROLLER_ID = "hha-outlook-dom-controller";
