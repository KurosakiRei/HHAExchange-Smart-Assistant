---
id: TD-007
title: "Epic 16 内置模板体系：开发过程中累积的 Bug 修复与 UI 调整"
status: Fixed
created: 2026-04-12
fixed: 2026-04-12
severity: Medium
components:
  - src/js/services/builtin/EmploymentActivationTemplate.ts
  - src/js/services/builtin/PatientVacationTemplate.ts
  - src/js/services/builtin/EodReportTemplate.ts
  - src/js/services/builtin/TimesheetNotificationTemplate.ts
  - src/js/tabs/MailBuilderTab.ts
  - src/js/tabs/QuickSearchTab.ts
  - src/style/mail-builder-tab.css
---

## 背景

Epic 16 Story 4（Employment Activation Request 四步向导）及其余三个内置模板（Patient Vacation、EOD Report、Timesheet Notification）在开发与手动测试阶段暴露出多个 Bug 和 UI 一致性问题，均已在本次迭代中修复。

---

## Bug 1：TinyMCE 被错误引入内置模板，与 Userscript 环境不兼容

### 现象
MailBuilderTab 和 EmploymentActivationTemplate 引入了 TinyMCE 富文本编辑器，但 TinyMCE 依赖 CDN 加载及独立 iframe，在 Tampermonkey Userscript 环境中加载失败、编辑器空白或 CSP 阻断。

### 根因
TinyMCE 基于 `<iframe>` sandbox 及外部 CDN 脚本，均与 Userscript 注入环境冲突。

### 修复
将所有内置模板中的 TinyMCE 替换为自研 `contenteditable` div + `execCommand` 工具栏，与已有的 PV/EOD 方案保持一致。
- `MailBuilderTab.ts`：模板管理弹窗正文编辑器由 TinyMCE textarea 改为 contenteditable
- `EmploymentActivationTemplate.ts`：Step 4 正文编辑器直接使用 contenteditable

---

## Bug 2：EA Toast 位置与动画错误

### 现象
发送到 Outlook 后的 Toast 提示出现在页面左下角，且无淡入/滑入动画，视觉体验差。

### 根因
Toast 元素使用了 `position: absolute` 且未设置正确的 `transform` 动画初始状态。

### 修复
EA Toast 改为 `position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-40px)`；`.show` 类将 translateY 归零并配合 opacity 实现从上落下的淡入效果。

---

## Bug 3：EA 切换收件组后正文 Greeting 被重置为空

### 现象
在 Step 4 点击不同收件组 chip 后，正文中的 "Hello xxx," 变为 "Hello ,"，用户已编辑的正文内容也被意外清空。

### 根因
Chip 点击时执行了以下逻辑：
1. 设置 `state.bodyHtml = null`（意图：强制重新生成含新 greeting 的正文）
2. 调用 `rerenderAll()` → `renderBody()` → **立刻读取当前 DOM 的 `#ea-body-editor` innerHTML 并写回 `state.bodyHtml`**，将 null 覆盖为旧内容
3. `renderPreviewStep` 判断 `state.bodyHtml ?? bodyPrefill`，因 bodyHtml 已被覆写，永远读不到新 greeting 的预填内容

### 修复
在 `WizardState` 增加 `skipBodySave: boolean` 标志位：

```typescript
// chip click
state.bodyHtml = null;
state.skipBodySave = true;  // 新增：阻止 renderBody 读取旧 DOM 内容
rerenderAll();

// renderBody() 内
if (!state.skipBodySave) {
  const editorEl = document.querySelector<HTMLElement>("#ea-body-editor");
  if (editorEl) state.bodyHtml = editorEl.innerHTML;
}
state.skipBodySave = false;
```

---

## Bug 4：PV 主题预填包含 "LINK WITH - [ ... ]" 脏数据

### 现象
Patient Vacation 模板主题栏显示：
```
PT: Wong Lingyun LINK WITH - [ WONG TICKWAH() ] AHC-902185 Vacation 04/05/2026 - 04/12/2026
```

### 根因
`extractPatientName()` 直接读取 `h1.textContent`，而 HHA 患者档案页 H1 中包含完整的 linked account 文字 "LINK WITH - [ WONG TICKWAH() ]"。该文字与患者姓名在同一文本节点中，无法通过 child node 过滤排除。

早期曾尝试仅遍历 direct text nodes 的方案，但实测发现"LINK WITH - [...]"文字本身就是直接文本节点的一部分（与患者姓名同一节点），该方案无效。

### 修复
在 `extractPatientName()` 中增加正则，提取后直接去除 "LINK WITH - [...]" 整段噪音：
```typescript
text = text.replace(/\s+LINK\s+WITH\s*-\s*\[.*?\]/gi, "").trim();
```

---

## Bug 5：PV extractAdmissionId 误匹配非 AHC 格式 ID

### 现象
部分患者档案页中存在多种格式的 ID（如 Medicaid ID、MR Number），`extractAdmissionId()` 可能取到错误的 ID。

### 根因
原正则匹配了页面上所有类似 ID 格式的文本，未限定必须为 `AHC-XXXXXX` 格式。

### 修复
将正则限定为 `AHC-\d+` 模式，只匹配 Always Home Care 的 Admission ID 格式，跳过所有其他 ID。

---

## Bug 6：QuickSearch 清空按钮（×）会抢夺焦点导致搜索中断

### 现象
点击 QuickSearch 输入框旁的 × 清空按钮时，输入框失焦，触发 blur 事件中断搜索逻辑。

### 根因
`<button>` 默认 `tabIndex=0`，点击时会夺取焦点（blur 输入框），导致 blur 事件监听器中断搜索状态。

### 修复
`QuickSearchTab.ts` 的 `makeInputWrap()` 中为清空按钮增加 `clear.tabIndex = -1`，阻止其在点击时获得焦点，与 EA 内部 `ea-clear-btn` 处理方式保持一致。

---

## UI 调整 1：全局标签文字标准化

开发过程中各内置模板的字段名存在不一致（全角/半角括号混用、大小写不统一），统一规范如下：

| 原始文本 | 标准化后 |
|---|---|
| `称呼 (greeting):` | `称呼 (Greeting):` |
| `收件人（To）:` / `收件人 (To)` | `收件人(To):` |
| `主题:` / `主题 *` | `主题(Subject):` / `主题(Subject) *` |

涉及文件：`EodReportTemplate.ts`、`PatientVacationTemplate.ts`、`TimesheetNotificationTemplate.ts`、`EmploymentActivationTemplate.ts`、`MailBuilderTab.ts`

---

## UI 调整 2：EOD 三个输入框宽度不一致

### 现象
EOD 报告弹窗中「称呼」「收件人」「主题」三行输入框宽度不相等，视觉参差。

### 根因
原实现将三行分在两个不同的 flex 容器（`eod-config-section` + `eod-subject-row`），各自独立布局，标签宽度不同导致每行输入框起始位置不同。尝试用 `min-width`/固定 `width` 固定标签宽度均无法完全解决，因为 flex 容器的 `flex: 1` 分配在各自容器内独立计算。

### 修复
将三行合并到一个 `display: grid; grid-template-columns: max-content 1fr` 的单容器（`.eod-fields-grid`），CSS Grid 的列**跨行共享**机制保证所有输入框宽度完全一致，同时标签与输入框自动垂直居中对齐。

---

## UI 调整 3：PV 配置区标签宽度不一致

### 现象
Patient Vacation 配置区「收件人(To):」与「主题(Subject):」两个标签宽度不一致，导致两个输入框宽度不同。

### 根因
`pv-config-label` 未设置固定宽度，标签文字宽度直接影响同行 `flex: 1` 输入框的可用空间。

### 修复
`pv-config-label` 增加 `min-width: 110px; flex-shrink: 0;`，确保两行标签占据相同宽度，输入框左侧对齐。

---

## 文件变更汇总

| 文件 | 变更类型 | 说明 |
|---|---|---|
| `EmploymentActivationTemplate.ts` | Bug Fix | Bug 2/3：Toast 位置修复；WizardState 增加 `bodyHtml`+`skipBodySave`，修复 Chip 切换后 Greeting 丢失 |
| `PatientVacationTemplate.ts` | Bug Fix | Bug 4/5：`extractPatientName` 增加 LINK WITH 正则过滤；`extractAdmissionId` 限定 AHC-only 格式 |
| `MailBuilderTab.ts` | Bug Fix + UI | Bug 1：TinyMCE 移除，改为 contenteditable；UI 调整 1：标签标准化 |
| `EodReportTemplate.ts` | UI | 标签标准化；UI 调整 2：三行合并为 `eod-fields-grid` |
| `TimesheetNotificationTemplate.ts` | UI | 标签标准化 |
| `QuickSearchTab.ts` | Bug Fix | Bug 6：清空按钮增加 `tabIndex=-1` |
| `mail-builder-tab.css` | UI | 新增 `.eod-fields-grid` 样式；废弃 `.eod-config-section`/`.eod-subject-row`；`pv-config-label` 增加最小宽度 |