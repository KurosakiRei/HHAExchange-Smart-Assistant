---
id: TD-002
title: Highlight Phone Search Blob Page White Screen
status: Fixed
created: 2026-02-22
fixed: 2026-02-22
severity: High
components:
  - IncomingCallHandler.ts
---

## Summary

修复了在通话信息页面高亮电话号码并点击"在HHA搜索"按钮时，弹出的 blob 结果窗口始终白屏的问题。涉及三个独立根因，需逐层排查修复。

## 背景

搜索功能通过 `GM_fetch` 从 HHAExchange 抓取原始搜索结果 HTML，经过处理后以 `blob:` URL 的形式在弹出窗口中展示。原始 HTML 是专为在 HHAExchange 内部 iframe 中运行设计的完整页面，直接展示时存在兼容性问题。

## 根本原因（共三层）

### 根因 1：`<script>` 标签内的 jQuery 引用（`$ is not defined`）

**现象**：控制台报 `Uncaught ReferenceError: $ is not defined`

**原因**：HHAExchange 原始搜索页面的 `<script>` 标签中大量使用 jQuery（`$`）。blob 弹窗是独立的顶级窗口，不会加载 HHAExchange 的 jQuery，导致这些内联脚本执行失败并阻断后续渲染。

**修复**：在 `cleanupHtml()` 中添加 Step 1：移除所有 `<script>` 标签及其内容。

```typescript
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
html = html.replace(/<script\b[^>]*\/>/gi, "");
```

---

### 根因 2：`<body>` 标签上的 `onload` 事件属性（`parent.Hide is not a function`）

**现象**：控制台报 `Uncaught TypeError: parent.Hide is not a function at onload`

**原因**：HHAExchange 搜索页的 `<body>` 标签携带 `onload="parent.Hide('...')"`。原页面在 HHAExchange 的 iframe 中运行时，`parent` 是合法的父窗口引用；但在 blob 弹窗中，该页面是顶级窗口（`top === window`），`parent` 不存在 `Hide` 方法，导致页面加载时抛出错误，阻断渲染。

**修复**：在 `cleanupHtml()` 中添加 Step 2：移除所有 inline `on*` 事件属性。

```typescript
html = html.replace(/(\s+on\w+\s*=\s*"[^"]*")/gi, "");
html = html.replace(/(\s+on\w+\s*=\s*'[^']*')/gi, "");
```

**验证**：通过 Chrome DevTools 连接到实时 blob 页面，调用 `document.body.getAttribute('onload')` 确认属性值为 `parent.Hide('ctl00_ContentPlaceHolder1_uxBtnSearch');`。

---

### 根因 3：`cleanupHtml()` 误删整个搜索结果内容（**主因**，白屏）

**现象**：控制台无 JS 错误，但页面完全空白（`document.body.innerHTML` 为空）

**原因**：`cleanupHtml()` 中用于移除 `uxfrmSearch` 相关表单的正则：

```typescript
/<form[^>]*id\s*=\s*["']?uxfrmSearch[^"']*["']?[^>]*>[\s\S]*?<\/form>/gi
```

该正则使用了 `[\s\S]*?` 来匹配 form 内容，成功匹配到了页面中唯一的 `<form id="uxfrmSearchXSLT">...</form>`。然而，**这个 `<form>` 标签是整个搜索结果的外层容器**，包含了搜索结果表格 `#tdSearchResults` 在内的所有可视内容（约 11,840 字符）。正则将其连同内容全部删除，仅剩 277 字符的空 HTML 外壳，导致 `body` 彻底为空。

通过在浏览器控制台中逐步模拟 `cleanupHtml()` 的每个步骤确认：

| 清理步骤                   | 剩余字符数                   |
| -------------------------- | ---------------------------- |
| 原始 HTML                  | 13,337                       |
| 移除 scripts               | 12,373                       |
| 移除 on* 属性              | 12,117                       |
| 移除 `<a>` 链接            | 12,117                       |
| **移除 `<form>` (旧逻辑)** | **277** ← 删除了 11,840 字符 |

**修复**：改为"解包"策略——只移除 `<form>` 和 `</form>` 标签本身，保留标签内的所有内容。

```typescript
// 旧：删除标签 + 全部内容
/<form[^>]*id="uxfrmSearch..."[\s\S]*?<\/form>/gi → ""

// 新：只删开始标签和结束标签
html = html.replace(/<form[^>]*id\s*=\s*["']?uxfrmSearch[^"']*["']?[^>]*>/gi, "");
html = html.replace(/<\/form>/gi, "");
```

**修复后验证**：
- `originalLength: 13,337 → cleanedLength: 11,641` ✅（只减少了合理的 1,696 字符）
- `hasTable: true` ✅
- `hasTdSearchResults: true` ✅

---

### 根因 4：单源多结果展示样式与设计不符（UI 问题）

**现象**：数据正确显示，但表格包含 "sortable column head" 等原始 HHAExchange DOM 文字，样式不匹配 combined 视图

**原因**：当只有 Aide 或只有 Patient 有搜索结果时（`displaySingleResult` 路径），代码使用 `processHtmlForDisplay()` 直接注入 CSS 到原始 HTML 中；而双源结果（`displayCombinedResults` 路径）则使用 `extractAndCleanContent()` 对 DOM 做详细清理。两条路径不一致。

**修复**：新建 `displaySingleResult()` 函数，复用 `displayCombinedResults` 的：
- DOM 解析 + `extractAndCleanContent` 表头清理逻辑（移除 "sortable column head"、`.show-for-sr` 等）
- 完全相同的深蓝色面板 CSS 样式（`#0d3e61` 表头）
- 电话号码黄色高亮

替换了 `extractAndInitiateSearch` 和 `searchHhaByPhone` 中共 4 处 `processHtmlForDisplay` 调用。

## 涉及代码变更

| 文件                     | 变更                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `IncomingCallHandler.ts` | `cleanupHtml()`: 添加 Step 1（移除 script）、Step 2（移除 on* 事件属性）、Step 3（form 解包） |
| `IncomingCallHandler.ts` | 新增 `displaySingleResult()` 函数（~180 行）                                                  |
| `IncomingCallHandler.ts` | 替换 4 处 `processHtmlForDisplay()` 调用为 `displaySingleResult()`                            |

## 预防措施

1. **永远不要在 blob 页面中保留原始 HTML 的 script 标签**：原始 HHAExchange HTML 依赖其自身加载的 jQuery 和父窗口环境，两者在 blob 上下文中均不可用。
2. **清理 form 标签时务必区分"移除标签"和"移除标签+内容"**：HHAExchange 页面经常将整个视图内容包裹在一个 `<form>` 里。
3. **使用 DOM 解析（`DOMParser`）而非正则处理 HTML**：正则处理 HTML 容易出现意外匹配。`extractAndCleanContent` 的 DOM 方式更安全可靠，应作为首选。

## 验证方法

测试电话号码（均已在生产环境验证）：
- `917-246-9855`：Patient 3条结果（1 Active, 1 Hospitalized, 1 Discharged）→ 单源面板正确显示
- `732-679-5568`：Caregiver 2条结果 + Patient 有结果 → combined 视图正确显示
- `917-622-0826`：Patient 2条结果（均 Active）→ 单源面板正确显示
