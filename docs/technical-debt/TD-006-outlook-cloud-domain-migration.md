---
id: TD-006
title: "Outlook cloud.microsoft 域名迁移：注入失效 / TrustedHTML 阻断 / Subject React 重置"
status: Fixed
created: 2026-04-02
fixed: 2026-04-02
severity: High
components:
  - OutlookDOMControllerPayload.ts
  - OutlookAdapter.ts
  - config/metadata.cjs
  - scripts/Bypass Outlook Trusted Types for HHA.js
---

## 背景

Outlook Web 从 `outlook.office.com` 迁移到 `outlook.cloud.microsoft` 后出现三个连锁问题，症状看起来像脚本完全失效，但实际根因都很浅。

---

## 问题 1：Bypass Trusted Types 脚本未覆盖新域，导致 TrustedHTML 全面阻断

### 现象

打开 `https://outlook.cloud.microsoft/` 后，控制台大量：

```
This document requires 'TrustedHTML' assignment. The action has been blocked.
Uncaught TypeError: Failed to set the 'innerHTML' property on 'Element':
    This document requires 'TrustedHTML' assignment.
Applying inline style violates Content Security Policy directive 'default-src none'...
```

`OutlookDOMControllerPayload` 注入后无法正常操作 DOM。

### 根本原因

`scripts/Bypass Outlook Trusted Types for HHA.js` 的 `@match` 只有 `outlook.office.com`，新域 `cloud.microsoft` 不在列，该脚本从未运行。

Trusted Types 的 `default` 策略只能注册一次。Outlook 自己在很早的时机注册了一个严格的 `default` 策略。我们晚了，抢不回来，后续所有 `innerHTML` / inline style 操作全部被拒。

### 修复

在 `scripts/Bypass Outlook Trusted Types for HHA.js` 新增一行：

```
// @match        *://outlook.cloud.microsoft/*
```

该脚本在 `document-start` 运行，抢在 Outlook 自身 JS 之前注册宽松的 `default` 策略。

**验证方法（CDP console）：**

```js
window.trustedTypes.createPolicy.toString()
// 应返回含 "Intercepted" 的代理函数，非 [native code]
!!window.trustedTypes.defaultPolicy   // true
```

### 日后注意

每次 Outlook 换域，必须同步更新**两个**脚本的 `@match`：

- `config/metadata.cjs`（主脚本 header，控制主脚本注入）
- `scripts/Bypass Outlook Trusted Types for HHA.js`（必须 `document-start` 先跑）

---

## 问题 2：Subject 字段点击后内容消失（React 受控组件状态不同步）

### 现象

`executeMailTask` 执行完毕后，Subject 字段上显示了正确的值。但用户点击该字段，内容立即清空。

### 根本原因

Outlook 的 Subject 输入框是 React 受控组件（`value` 由 React state 驱动）。旧的填写方式：

```js
// 旧方法 — 有问题
const nativeSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype, 'value'
).set;
nativeSetter.call(field, value);
field.dispatchEvent(new Event('input', { bubbles: true }));
field.dispatchEvent(new Event('change', { bubbles: true }));
```

问题链：
1. `nativeSetter.call(field, value)` 更新了 DOM `.value`，同时把 React 的 `_valueTracker` 清零（标记"新基线 = 当前值"）
2. 之后 dispatch 的 `input` 事件确实让 React 的 onChange 触发，React 更新了局部 state
3. 但 Outlook 在 `focusin` / 外部 state flush 等路径上会触发更高层的 re-render，React 会用上层 state（仍为 `""`）把 Subject input `value` 重新覆盖

本质：我们改了 DOM but React state tree 的上层状态没有同步。

### 修复

改用 `document.execCommand('insertText', false, value)`，走浏览器原生文本插入流水线，触发 `beforeinput` + `input` 完整事件序列，React 在此路径上有专门处理，能可靠同步 fiber state：

```js
// 新方法 — 正确
field.select();  // 先全选，清空已有内容
var inserted = document.execCommand('insertText', false, value);
if (!inserted || field.value !== value) {
  // 降级：execCommand 返回 false 时（极少见）
  var nativeSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype, 'value'
  ).set;
  if (nativeSetter) nativeSetter.call(field, value);
  field.dispatchEvent(new InputEvent('input', {
    bubbles: true, cancelable: true,
    data: value, inputType: 'insertText'
  }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
}
```

> `execCommand('insertText')` 在规范层面已弃用，但在 Chromium / Chrome Canary 中对
> `<input type="text">` 和 contenteditable 元素均有效，是目前与 React 受控组件协同最可靠的方式。

---

## 问题 3（已排除误判）：chrome.userScripts eTLD Bug

### 过程

调试初期误判根因为 Chrome Canary 的 `chrome.userScripts` API bug（无法向 `cloud.microsoft` eTLD 注入脚本）。为此走了两条弯路：

**弯路 A：TM Options Page Bridge**
把邮件任务写入 GM storage，用 `GM_openInTab` 打开 TM Own Options 页当跳板，再用 `chrome.scripting.executeScript` 注入 Outlook。
**失败原因**：TM 不会向自己的 `chrome-extension://` 页面注入 userscript，`window.HHA_SMART_ASSISTANT_STARTED` 永远 `undefined`。

**弯路 B：Helper 扩展 (`hha-outlook-helper/`)**
构建独立 Chrome 扩展，通过 content script MAIN/ISOLATED world 双层桥接绕过 TM 限制。
**撤销原因**：CDP 调试最终证明 TM 脚本已正确注入 `cloud.microsoft`，根本不存在所谓的 eTLD bug，真正的问题只是上述问题 1-2。所有 helper 扩展文件和代码改动已清理。

### 核心教训

> **遇到"脚本不运行"，第一步永远是用 CDP 检查：**
>
> ```js
> window.HHA_SMART_ASSISTANT_STARTED   // 脚本有没有跑
> window.HHAOutlookController          // Controller 有没有注入
> window.trustedTypes.createPolicy.toString()  // Bypass 有没有生效
> ```
>
> **先确认脚本真的没注入，再换方案。** 问题 1-2 本可 30 分钟修好；走弯路花了数小时。

---

## 文件变更列表

| 文件 | 类型 | 说明 |
|------|------|------|
| `scripts/Bypass Outlook Trusted Types for HHA.js` | 修改 | 新增 `@match *://outlook.cloud.microsoft/*` |
| `src/js/services/OutlookDOMControllerPayload.ts` | 修改 | INPUT 填写改用 native setter + `_valueTracker` 重置；To/CC 改用建议下拉点击确认 |
| `config/metadata.cjs` | 修改 | 清理误添加的 `chrome-extension://` match |
| `src/js/tabs/MailBuilderTab.ts` | 修改 | 撤销 helper 扩展改动，恢复纯 GM storage 方案 |
| `src/index.ts` | 修改 | 撤销 `OutlookBridge` import、`isBridgePage` 路由逻辑；Outlook 页面跳过 style-loader 注入 |
| `src/js/services/OutlookBridge.ts` | 删除 | 失败方案遗留文件 |
| `hha-outlook-helper/` | 删除 | 失败方案遗留目录 |
| `src/js/services/OutlookAdapter.ts` | 修改 | 加入 `isHandlingTask` 互锁防并发；`isDraftEmpty` 检测要求 Send 按钮存在 |
| `src/js/services/MailService.ts` | 修改 | `isOutlookPage()` 增加 path 检查，排除 `/host/*`（To-Do、Calendar 等 M365 套件） |

---

## 后续追加问题（2026-04-02）

### 问题 4：To/CC 地址填入后未确认为 token pill

**现象**：To / CC 字段中地址显示为普通文本，未变成蓝色 token pill（Serge Nazarov ×），多个地址时连接在一起。

**根本原因**：
- 旧的 Enter key 方案：Outlook 对合成 `KeyboardEvent('Enter')` 的响应不稳定，部分路径仅移动焦点而不确认地址。
- 单字符串插入：`a@b.com, c@d.com` 作为整体插入，Outlook 不自动拆分。

**修复**：改用 **点击建议下拉项** 方案（通过 CDP 验证 selector）：
```js
// 插入单个地址后等 300ms 让下拉框渲染，再点击第一个建议按钮
const suggestionBtn = document.querySelector(
  'ul[class*="FloatingSuggestions"] button[role="option"]'
);
if (suggestionBtn) suggestionBtn.click();
else /* fallback: Enter key */
```
点击后 `div[aria-label="To"]` 内出现 `contenteditable="false"` 的 `<span>` entity，即已确认的 pill。外部邮箱（无下拉建议）回退到 Enter key。

### 问题 5：To-Do 页面（`/host/*`）触发 "New mail button not found" 错误

**现象**：任务抵达后，toast 显示 `❌ 错误: New mail button not found after 8s`。

**根本原因**：`MailService.isOutlookPage()` 只检查 hostname，`outlook.cloud.microsoft/host/...`（To-Do、Calendar 等 M365 套件）被误判为邮件页面，`OutlookAdapter` 在这些页面上初始化并接收任务，但找不到 Compose 按钮。

**修复**：`isOutlookPage()` 增加 `/mail` path 前缀检查：
```typescript
// 修复前
if (hostname === 'outlook.cloud.microsoft') return true;
// 修复后
if (hostname === 'outlook.cloud.microsoft' && pathname.startsWith('/mail')) return true;
```

### 问题 6：CSP inline style 报错来自 style-loader

**现象**：Outlook 控制台大量 `Applying inline style violates CSP`，来源 `injectStylesIntoStyleTag.js`（webpack style-loader）。

**根本原因**：`src/index.ts` 的 `import './style/main.less'` 在所有页面执行，style-loader 在 Outlook 页面尝试注入 inline style 被 CSP 阻断。

**修复**：改为条件 `require()`，Outlook / webshell 页面跳过样式注入：
```typescript
if (!window.location.hostname.includes('outlook') &&
    window.location.hostname !== 'webshell.suite.office.com') {
  require('./style/main.less');
}
```

### 问题 7：handleMailTask 并发导致不稳定

**现象**：删掉草稿后再次点击「发送到 Outlook」，概率性无反应或报错。

**根本原因**：快速连续触发时，第一次 async `handleMailTask` 尚未结束，第二次也进入执行，两者并发竞争 DOM。

**修复**：加 `isHandlingTask` 静态互锁：
```typescript
if (this.isHandlingTask) { reportFailed(); return; }
this.isHandlingTask = true;
try { ... } finally { this.isHandlingTask = false; }
```