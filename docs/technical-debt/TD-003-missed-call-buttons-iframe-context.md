---
id: TD-003
title: MissedCall 按钮因 iframe 上下文隔离导致填充失效
status: Fixed
created: 2026-03-08
fixed: 2026-03-08
severity: High
components:
  - MissedCall.ts
  - utils/util.js (assignIntervalTimer)
  - src/index.ts (button registration)
---

## 摘要

"Missed In"、"Missed Out"、"Missed In & Out" 按钮点击后对表单**完全没有效果**：Reason 下拉框不选中、Action 不填写、Notes 文本不生成。

受影响的页面：
- `Patient_ns.aspx`（从患者资料页打开的 Visit弹窗）
- `CallReportsBeta_ns.aspx`（从 Call Dashboard 打开的 Visit弹窗）

---

## 根本原因（经浏览器 DOM 层级调查确认）

### 实际 DOM 结构

HHAExchange 的 Visit 编辑弹窗**不是原生 `<dialog>` 或 `<div>` 模态框**，而是一个 **iframe**：

```
window.top (Patient_ns.aspx)
└── <iframe id="mypopup">  ← Visit 编辑表单在此
      ├── #ddlReason
      ├── #ddlEditAction
      ├── #txtNotes
      ├── #txtVisitStartTime / #txtVisitEndTime
      ├── #lblScheduledTime
      ├── #uxBtnSaveVisit
      └── #missedInBtn, #missedOutBtn, #missedInOutBtn  ← 按钮也注入在此
```

按钮本身已经通过 `assignIntervalTimer` 在 `mypopup` iframe 内被正确注入（因为监测到了 `#uxBtnSaveVisit`）。

### 真正的失效原因：事件处理函数里的 jQuery 在错误的 Document 上运行

按钮的 `click` 事件监听器是由 `assignIntervalTimer`（`util.js`）通过 `JQel.on("click", () => bindFunc(...param))` 绑定的。

`bindFunc` 是 `MissedCall.ts` 里的 `missedCallResolver`，它内部所有的 jQuery 选择均使用了**不带 `context` 参数**的 `$(selector)` 写法：

```typescript
// MissedCall.ts - 所有这些调用都在 TOP DOCUMENT 上执行
$(visitNotesSelector).val(...)           // 找不到 mypopup 里的 #txtNotes
$(visitReasonSelector)                   // 找不到 mypopup 里的 #ddlReason
$(visitScheduleTimeSelector).text()     // 找不到 mypopup 里的 #lblScheduledTime
$(visitStartTimeInputSelector).val()    // 找不到 mypopup 里的 #txtVisitStartTime
$(visitPatientNameSelector).text()      // 找不到 mypopup 里的患者名
```

由于 `mypopup` iframe 和顶层页面是**不同的 Document**，标准的 `$(selector)` 只会在顶层 `document` 上搜索，所有查询结果均为**空的 jQuery 对象**，所有操作都静默失败，没有任何错误提示。

### 为何之前可能"曾经工作过"

如果代码最初是在 Visit 页面直接打开（即脚本运行在 `mypopup` iframe 内部本身），则 `$(selector)` 确实能在当前 `document`（即 iframe）内找到元素，行为正常。但当通过患者页（`Patient_ns.aspx`）或 Call Report 页（`CallReportsBeta_ns.aspx`）间接打开 popup 时，脚本的主代码运行在顶层，接收到的 `document` 是父页面，`mypopup` iframe 内的元素均不可见。

---

## 受影响的代码点

| 文件                   | 函数/位置                         | 描述                                                                                                             |
| ---------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `src/js/MissedCall.ts` | `missedCallResolver`              | 所有 `$(selector)` 缺少 iframe context                                                                           |
| `src/js/MissedCall.ts` | `missedCallTimeInputer`           | `$(visitStartTimeInputSelector).val()` 同上                                                                      |
| `src/js/MissedCall.ts` | `missedCalledReasonChooser`       | `$(visitReasonSelector)` 同上                                                                                    |
| `src/js/MissedCall.ts` | `getScheduleTime`                 | `$(visitScheduleTimeSelector).text()` 同上                                                                       |
| `src/js/MissedCall.ts` | `getAideName`                     | 策略 1、3 使用 `topWidow[0].document.querySelectorAll` 依赖 `window.parent[0]`（访问已弃用的 window frame 索引） |
| `src/index.ts`         | `missedCallResolver` registration | 未向 `assignIntervalTimer` 传递 iframe 上下文                                                                    |

---

## 修复方案

### 策略：在 `missedCallResolver` 执行前获取 `mypopup` iframe 的 document 并透传给所有子函数

**步骤 1**：修改 `missedCallResolver` 函数签名，添加可选的 `iframeDoc` 参数，并将它作为 jQuery 上下文传入所有选择器：

```typescript
export const missedCallResolver = async (reason: ReasonType, iframeDoc?: Document) => {
  const ctx = iframeDoc || document;
  // 将 ctx 传入所有子函数
  ...
  $(visitNotesSelector, ctx).val(...);
  $(visitNotesSelector, ctx)[0].dispatchEvent(new Event("change"));
};
```

**步骤 2**：同样修改 `missedCallTimeInputer`、`missedCalledReasonChooser`、`getScheduleTime` 等所有私有工具函数，接受 `ctx: Document` 参数并使用 `$(selector, ctx)` 写法。

**步骤 3**：修改 `getAideName`，使其识别 mypopup iframe 结构，从 **top window** 找到 `mypopup` iframe，再从中读取患者信息；或者将患者信息元素读取逻辑移入读取 `iframe.contentDocument` 的上下文中。

**步骤 4**：修改 `src/index.ts` 中按钮注册逻辑，在 `bindFunc` 调用时传入 `mypopup` iframe 的 document：

```typescript
// 修改前
JQel.on("click", () => missedCallResolver(reason));

// 修改后 (在 assignIntervalTimer 里或 onClick 时获取 mypopup.contentDocument)
JQel.on("click", () => {
  const mypopup = document.getElementById('mypopup') as HTMLIFrameElement;
  const ctx = mypopup?.contentDocument || document;
  missedCallResolver(reason, ctx);
});
```

或者更优雅地，修改 `assignIntervalTimer` 让 `bindFunc` 在 *iframe 文档上下文* 中被调用（传入 `bindFuncContext` 参数）。

---

## 验证计划

1. 在 `Patient_ns.aspx` 页面打开任意 Visit。
2. 点击"Missed In"按钮，验证：
   - `#ddlReason` 选中 "Attendant failed to call in"。
   - `#ddlEditAction` 选中 "Confirmed visit with..."。
   - `#txtNotes` 填入了正确的模板文本。
   - `#txtVisitStartTime` 被设置为计划开始时间。
3. 在 `CallReportsBeta_ns.aspx` 重复同样的测试。
4. 点击 Save 确认保存成功。

---

## 相关 TD

- TD-001: Dynamic Tenant URL Detection（已修复，教训：避免对 DOM/URL 硬编码假设）
