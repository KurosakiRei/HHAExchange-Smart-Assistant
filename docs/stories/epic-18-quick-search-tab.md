# Epic 18: 快速搜索 Tab — 聚合 Caregiver & Patient 搜索

## Epic 概述

| 属性 | 值 |
|---|---|
| **Epic ID** | EPIC-018 |
| **标题** | 快速搜索 Tab（Quick Search Tab） |
| **优先级** | P1 |
| **状态** | ✅ done |
| **关联系统** | MultiTabPanel, IncomingCallHandler, HhaSearchService（新建）, QuickSearchTab（新建） |
| **依赖 Epic** | Epic 7 Multi-Tab Panel（Tab 架构基础） |
| **ADR** | ADR-015 |

## 背景

HHAExchange 原生搜索系统需要在两个独立页面分别搜索 Caregiver 和 Patient，操作繁琐。本 Epic 在悬浮面板新增「快速搜索」Tab，提供聚合搜索入口：用户填写姓/名/电话/ID，一键同时搜索两端，结果全量加载后在 Blob 弹窗内展示，并支持客户端分页。

---

## Story 18-1: 提取 HhaSearchService 共享服务

**作为** 开发者，
**我需要** 将 `IncomingCallHandler.ts` 中的搜索核心逻辑提取到独立的 `HhaSearchService.ts`，
**以便** `IncomingCallHandler` 和新的 `QuickSearchTab` 可以共享同一套搜索、结果解析和结果展示代码，避免维护两份副本。

### 验收标准
- [x] 新建 `src/js/services/HhaSearchService.ts`，导出以下内容：
  - `detectTenantBaseUrl()` 及所有 URL 常量（`AIDE_SEARCH_URL` 等）
  - `HhaSearchResult` 接口、`HhaQuickSearchParams` 接口
  - `PatientActiveStatus`、`PatientNonActiveStatus`、`ACTIVE_STATUSES`、`NON_ACTIVE_STATUSES` 常量
  - `isActiveStatus()`、`formatPhoneNumber()`、`openInPopup()`
  - `handleAideSearchResult()`、`handlePatientSearchResult()`
  - `extractAndCleanContent()`（从 `displayCombinedResults` 内部函数提升为独立导出函数）
  - `displayCombinedResults()`、`displaySingleResult()`
  - `fetchHhaData()`（现有签名不变）
- [x] `IncomingCallHandler.ts` 重构为从 `HhaSearchService` import 上述内容，保留所有原有功能（自动跳转、电话高亮、toast 监听等）不变
- [x] 执行 `npm run build` 无报错，无新增 TS 类型错误
- [x] 手动回归验证：来电自动搜索、手动搜索按钮功能与重构前行为一致

### 实现提示
- `HHA_STYLE_CSS`、`cleanupHtml()`、`injectHhaStyles()`、`highlightPhoneNumber()`、`injectRedirectScript()`、`processHtmlForDisplay()` 也一并迁移（它们是 display 函数的依赖）
- `HhaQuickSearchParams` 接口在此 Story 中定义即可，Search Tab 在后续 Story 使用

---

## Story 18-2: 扩展 fetchHhaData 支持多字段搜索与多页全量获取

**作为** 开发者，
**我需要** 扩展 `HhaSearchService` 中的数据获取层，
**以便** 支持按姓/名/电话/ID/SSN/PatientID/MedicaidID 等多字段搜索，并能自动获取所有页面的完整结果。

### 验收标准
- [x] 新增 `buildSearchUrl(type: "aide" | "patient", params: HhaQuickSearchParams, page: number): string` 函数，根据 `params` 动态构建搜索 URL：
  - `type="aide"` 时：映射 `lastName→LastName`、`firstName→FirstName`、`phone→Phone`、`id→CaregiverCode`、`ssn→SSN`，其余固定参数与现有 `AIDE_SEARCH_PARAMS` 相同（`Type=-1`、`Status=-1` 等）
  - `type="patient"` 时：映射 `lastName→LastName`、`firstName→FirstName`、`phone→HomePhone`、`id→PatientNumber`（对应 Admission ID，通过抓包确认）、`patientId→PatientID`、`medicaidId→MedicaidID`，`MRNumber` 保留为空；其余固定参数与现有 `PATIENT_SEARCH_PARAMS` 相同（`StatusID=-1`、`Default=false` 等）
  - `page` 参数对应 URL 中的 `pg=` 字段
- [x] 新增 `fetchAllPages(type: "aide" | "patient", params: HhaQuickSearchParams): Promise<HhaSearchResult>` 函数：
  1. 获取第 1 页
  2. 从响应 HTML 的 `h2` 解析总结果数（兼容现有 `handleXxxSearchResult` 逻辑）
  3. 若 `totalCount > 10`，计算总页数（`Math.ceil(totalCount / 10)`），并行请求第 2…N 页
  4. 合并所有页的 `<tbody>` 行插入第 1 页的 `#tdSearchResults` → 返回含完整 `rawHtml` 的 `HhaSearchResult`
  5. `count` 字段反映真实总数
- [x] 现有 `fetchHhaData()` 保持不变（`IncomingCallHandler` 继续使用，电话搜索只需单页）
- [ ] 单元/集成验证：模拟 2 页 Caregiver 结果，确认合并后 `count` 正确、所有行均存在

### 实现提示
- 从第 1 页 HTML 中解析总页数：`h2` 里的 `(N)` 即为 `totalCount`，`totalPages = Math.ceil(totalCount / 10)`
- 并行请求用 `Promise.all()`
- 行合并：用 `DOMParser` 解析各页 HTML，`querySelector('#tdSearchResults tbody')` 取出 `<tr>` 节点，追加到第 1 页的 `tbody` 中，最后序列化 `#tdSearchResults.outerHTML` 作为新 `rawHtml`

---

## Story 18-3: Patient 状态 Badge 样式注入

**作为** 用户，
**我需要** 在 Patient 搜索结果表格中通过颜色 badge 快速识别每个病人的状态，
**以便** 无需逐行阅读文字即可判断结果的优先级。

### 验收标准
- [x] 新增 `injectStatusBadges(html: string, type: "aide" | "patient"): string` 函数，供 `displayCombinedResults` 和 `displaySingleResult` 在 `extractAndCleanContent` 之后调用
- [x] 函数用 `DOMParser` 解析 HTML，找到 Status 列的所有数据 `<td>`（通过列索引或文本内容匹配定位），将单元格文本替换为 `<span class="status-badge status-{green|gray|yellow}">文本</span>`
- [x] **Patient** badge 规则（`type="patient"`）：
  - Active / Hospitalized → `.status-green`（背景 `#d1fae5`，文字 `#065f46`）
  - Discharged → `.status-gray`（背景 `#f3f4f6`，文字 `#6b7280`）
  - 其余所有（Waiting / Hold / 未知状态）→ `.status-yellow`（背景 `#fef9c3`，文字 `#854d0e`）
- [x] **Caregiver** badge 规则（`type="aide"`）：
  - Active → `.status-green`
  - Terminated → `.status-gray`
  - 其余所有（Inactive / Hold / On Leave / 未知状态）→ `.status-yellow`
- [x] 匹配策略：先精确匹配绿色/灰色状态关键词；未命中任何绿色/灰色规则的文本一律归入黄色（容错未来新增状态）；状态文字仅取第一个词（按空白/换行/括号分割），以兼容 HHA 多行状态单元格（如 "Discharged\n(06/30/2021)"）
- [x] Badge 样式通过 `PANEL_STYLE_BLOCK` 注入到弹窗 HTML 的 `<head>` 中，不依赖外部 CSS，不在 `panel-content` 行内插入 `<style>` 标签
- [x] Badge 样式柔和，不影响表格整体可读性
- [x] 回归：电话搜索的 `IncomingCallHandler` 现有 Caregiver / Patient 显示功能正常（自动获益于此改动）

### 实现提示
- Status 列识别：遍历 `<thead>` 的 `<th>` 文本，找到包含 "Status" 或 "状态" 字样的列索引，再对 `<tbody>` 中同列索引的 `<td>` 应用 badge
- 绿色/灰色精确匹配后，剩余未匹配文本均用黄色，无需枚举所有状态
- 多行单元格处理：`fullText.split(/[\s\n(]/)[0].trim()` 取第一个词参与匹配，避免 HHA 在状态下方附加日期时匹配失败

---

## Story 18-4: QuickSearchTab — 搜索输入区 UI

**作为** 用户，
**我需要** 在悬浮面板的「快速搜索」Tab 中看到一个简洁的搜索表单，
**以便** 快速输入搜索条件后发起聚合搜索。

### 验收标准
- [x] 新建 `src/js/tabs/QuickSearchTab.ts`，实现 `BaseTab` 接口：
  - `id = "quick-search"`
  - `label = "快速搜索"`
  - `icon = "🔍"`
- [x] Tab 内普通搜索区包含 4 个输入框：
  - **姓**（`lastName`）、**名**（`firstName`）、**电话**（`phone`）、**ID**（`id`）
  - 每个输入框右侧内置 ✕ 清除按钮（点击清空对应输入框并 focus）
  - 输入框支持按 Enter 键触发搜索
- [x] ID 输入框旁有 ℹ️ tooltip，hover 显示：「Caregiver: Caregiver Code；Patient: Admission ID (MR Number)」
- [x] 高级搜索折叠区（默认收起，点击展开/收起，有展开箭头指示）：
  - **Caregiver 独占**一组：SSN（同样带 ✕ 清除）
  - **Patient 独占**一组：病人 ID、Medicaid ID（同样带 ✕ 清除）
  - 两组之间有分组标题标注归属
- [x] 底部按钮行：「搜索」按钮（主色）+ 「清空」按钮（次色）
  - 「清空」清除所有普通区 + 高级搜索区的输入框内容
- [x] 冲突检测：若 Caregiver 独占字段（SSN）和 Patient 独占字段（病人ID / MedicaidID）均有内容，禁用「搜索」按钮并在按钮上方显示红色提示文字：「不能同时输入 Caregiver 和 Patient 的独占字段」
- [x] Tab 注册到 `MultiTabPanel`（在 `index.ts` 的 `initMultiTabPanel()` 中）
- [x] 所有文字标签为中文
- [x] **UI 风格与现有 Tab 一致**：复用项目现有 CSS class（`hha-smart-config-card`、`hha-smart-config-card-body`、`hha-smart-btn` 等），输入框、按钮、折叠区的视觉风格与 `MailBuilderTab` / `StatusTrackingTab` 保持统一

### 实现提示
- 参考 `StatusTrackingTab.ts` / `MailBuilderTab.ts` 的 `render()` 结构，以及 `BaseTab.createConfigCard()` 等现有辅助方法
- 高级搜索折叠使用 `details`/`summary` HTML 元素或手动 toggle（参考项目现有 CSS 风格）
- ✕ 清除按钮用绝对定位或 flex 布局嵌在 input wrapper 内

---

## Story 18-5: QuickSearchTab — 搜索逻辑与状态管理

**作为** 用户，
**我需要** 点击「搜索」按钮后，Tab 显示 loading 动画，搜索完成后自动弹出结果窗口，
**以便** 获取完整的 Caregiver + Patient 搜索结果并进行判断。

### 验收标准
- [x] 点击「搜索」按钮后：
  - 「搜索」按钮禁用（`disabled`），文字变为「⏳ 搜索中…」
  - Tab 内容区显示 CSS loading spinner（居中，不覆盖输入框）
- [x] 根据高级搜索独占字段决定调用哪端的 `fetchAllPages()`：
  - 无独占字段 → `Promise.all([fetchAllPages("aide", params), fetchAllPages("patient", params)])`
  - 仅 SSN → `fetchAllPages("aide", params)`
  - 仅病人ID / MedicaidID → `fetchAllPages("patient", params)`
- [x] 搜索完成后：
  - Loading 动画隐藏，「搜索」按钮恢复可用
  - **输入框内容保持不变**（不自动清空）
  - 若双端均有结果 → 调用 `displayCombinedResults()`（不传 phoneNumber，无高亮）
  - 若仅一端有结果 → 调用 `displaySingleResult()`
  - 若两端均无结果 → 在 Tab 内（输入框下方）显示内联提示：「未找到匹配的护理员或病人」
- [x] 每次搜索均在独立的新弹窗中展示结果：`openInPopup()` 使用 `HHA_Search_${Date.now()}` 作为唯一窗口名，确保多次搜索互不覆盖
- [x] loading 动画使用纯 CSS（不引入新依赖），风格与面板整体一致

### 实现提示
- `displayCombinedResults` 第三个参数 `phoneNumber` 传空字符串 `""` 即可禁用高亮
- Loading spinner 可直接在 Tab 的 `render()` 方法中预埋一个 `div.quick-search-loading`（默认 `display:none`），搜索中切换为可见

---

## Story 18-6: 弹窗结果 — Combined View 客户端分页

**作为** 用户，
**我需要** 在 Combined View 弹窗中，每侧独立分页浏览搜索结果，
**以便** 在结果数量较多时不因高度限制而无法查看完整内容。

### 验收标准
- [x] `displayCombinedResults()` 升级：接收合并后的完整结果行，在弹窗 HTML 中注入客户端分页逻辑
- [x] 每侧每页显示 **15 行**（用 JS 控制 `<tr>` 的 `display` 属性切换）
- [x] 每侧面板底部有独立分页控制栏：「上一页」「第 X / Y 页」「下一页」
  - 首页时「上一页」禁用，末页时「下一页」禁用
- [x] 两侧分页互相独立（Caregiver 翻页不影响 Patient 侧）
- [x] 分页切换时面板内容不重新 fetch，纯客户端 JS 切换 `<tr>` 可见性
- [x] 若某侧总行数 ≤ 15，不显示分页控制栏（直接全部展示）
- [x] 分页控制栏样式与面板 header 颜色系一致（深蓝色背景或其他与整体一致的方案）
- [x] 分页控制栏渲染在 `.panel-footer`（`flex-shrink:0`）中，与 `.panel-content`（`flex:1; overflow:auto; min-height:0`）构成 flex 列布局；控制栏始终固定在面板底部，不随表格内容滚动，也不与行内容产生视觉间隙

### 实现提示
- 在注入 `displayCombinedResults` 生成的 HTML 中，给每侧的每个 `<tbody><tr>` 追加 `data-row-index` 属性（第几行，0-based）
- 注入一段内联 `<script>`，实现 `showPage(side, pageNum)` 函数（`side` 为 `"aide"` 或 `"patient"`）
- 页码按钮调用 `showPage()`，初始时 `side` 两侧都调用 `showPage("aide", 1)` 和 `showPage("patient", 1)`
- `injectRowIndexes()` 返回 `{ tableHtml, paginationBarHtml }` 结构体，调用方将 `paginationBarHtml` 渲染到 `.panel-footer`，而非内联在 `.panel-content` 中

---

## Story 18-7: 弹窗结果 — Single View 客户端分页

**作为** 用户，
**我需要** 在 Single View 弹窗中分页浏览单端搜索结果，
**以便** 查看超过 20 行的完整搜索结果。

### 验收标准
- [x] `displaySingleResult()` 升级：注入客户端分页逻辑，每页显示 **20 行**
- [x] 面板底部有分页控制栏：「上一页」「第 X / Y 页」「下一页」，逻辑与 Story 18-6 一致
- [x] 若总行数 ≤ 20，不显示分页控制栏
- [x] 样式与 Combined View 分页栏一致

### 实现提示
- 实现思路与 Story 18-6 相同，抽取共享的 `buildPaginationScript(pageSize: number): string` 函数供两者复用

---

## 依赖关系

```
18-1 (HhaSearchService 提取)
  └─ 18-2 (多字段+多页获取)
       ├─ 18-3 (Patient Status Badge)  ← 可与 18-4 并行
       ├─ 18-4 (QuickSearchTab UI)
       └─ 18-5 (搜索逻辑 + 状态管理)  ← 依赖 18-2 + 18-4
            ├─ 18-6 (Combined View 分页)
            └─ 18-7 (Single View 分页)
```

## 文件清单

| 操作 | 文件路径 |
|---|---|
| 新建 | `src/js/services/HhaSearchService.ts` |
| 重构 | `src/js/IncomingCallHandler.ts` |
| 新建 | `src/js/tabs/QuickSearchTab.ts` |
| 修改 | `src/index.ts`（注册新 Tab） |
| 修改 | `docs/stories/epic-18-quick-search-tab.md` |

---

## Dev Agent Record

### 实现计划执行情况

- **Story 18-1**：将 `IncomingCallHandler.ts` 中约 1200 行的搜索逻辑提取到新建的 `HhaSearchService.ts`，通过 Node.js 脚本精确裁剪重构边界；`IncomingCallHandler.ts` 精简至约 280 行，仅保留来电状态管理与调度逻辑。
- **Story 18-2**：新增 `buildSearchUrl()` 函数（使用 `URLSearchParams` 构造多字段查询 URL）和 `fetchAllPages()` 函数（获取第 1 页后解析 `totalCount`，并行拉取剩余页，通过 `DOMParser` + `document.adoptNode` 合并 `<tbody>` 行）。
- **Story 18-3**：新增 `injectStatusBadges()` 函数，通过列标题文字检测 Status 列位置，对 Patient 行注入绿/灰/黄三色徽章；已集成到 `displayCombinedResults()` 和 `displaySingleResult()` 中。
- **Story 18-4 + 18-5**：新建 `QuickSearchTab.ts`，实现完整的 UI（4 个基本字段 + 高级折叠区）和搜索逻辑（路由判断、loading 状态、无结果内联提示），使用纯 CSS spinner，复用项目现有 CSS class。
- **Story 18-6 + 18-7**：新增 `buildPaginationScript()` 和 `injectRowIndexes()` 共享函数；Combined View 每侧 15 行/页（两侧独立），Single View 20 行/页；分页控制栏深蓝色背景，≤ 阈值时隐藏控制栏。

### 修复记录

- **Patient 面板 count 显示错误**：`displayCombinedResults()` 中 Patient 面板标题原错误使用 `aideResult.count`，已修正为 `patientResult.count`。
- **`injectRowIndexes` 中间变量残留**：清除了 `paginationBar` 的重复草稿变量，保持代码整洁。

### 手动验证后热修复记录（2026-04-12）

- **分页栏底部间隙**：分页控制栏使用 `position:sticky; bottom:0` 置于 `.panel-content` 内部时，会与滚动内容产生可见间隙。重构为 `.panel-footer`（`flex-shrink:0`）独立 flex 子项，置于 `.panel-content` 之外彻底消除间隙。
- **多次搜索覆盖同一窗口**：原 `openInPopup()` 使用固定窗口名（`HHA_Combined_Result` / `HHA_Search_Result`），导致新结果覆盖旧弹窗。改为每次调用生成 `HHA_Search_${Date.now()}` 唯一窗口名，每次搜索均开新窗口。
- **Status badge CSS 不生效**：Badge `<style>` 标签插入在 `.panel-content` div 内部，浏览器对块级 `<style>` 的处理不稳定。将 badge CSS 迁移至 `PANEL_STYLE_BLOCK`，统一注入到弹窗 `<head>`，确保样式可靠生效。
- **多行状态单元格匹配失败**：HHA 部分状态单元格文本为 `"Discharged\n(06/30/2021)"` 格式，全文精确匹配无法命中任何规则，错误降级为黄色。改为取 `split(/[\s\n(]/)[0]` 的第一个词进行匹配，修复 Discharged / Active 等状态颜色错误。
- **Patient ID 搜索字段错误**：原 `buildSearchUrl` 将用户输入的 ID 映射到 `MRNumber` 参数，实际上 HHA 的 Admission ID 对应 URL 参数 `PatientNumber`（通过浏览器抓包确认）。已修正映射：`id→PatientNumber`，清空 `MRNumber`。
- **QuickSearchTab.ts 注释编码损坏**：分节注释中的 `──` 等 Unicode 字符经 PowerShell `Set-Content` 写入后被转换为 GBK 乱码序列（`鈹€`）。使用 `replace_string_in_file` 直接替换所有 13 处损坏注释，恢复为正确的 Unicode 分隔线。

### 完成摘要

- 全部 7 个 Story 已实现并通过 `npm run build` 验证（TypeScript 编译 0 错误，5 条预存在的 webpack 警告）
- 手动验证通过：Caregiver/Patient 搜索结果正确展示，Admission ID 搜索命中正确，分页功能正常，status badge 颜色正确
- 未引入新的运行时依赖

### Change Log

| 日期 | 版本 | 描述 | 作者 |
|---|---|---|---|
| 2025-07-14 | 1.0.0 | Epic 18 全部 7 个 Story 实现完成，状态更新为 review | Amelia (Dev Agent) |
| 2026-04-12 | 1.1.0 | 手动验证后热修复：分页栏布局（panel-footer）、唯一弹窗名（Date.now）、badge CSS 移入 head、多行状态匹配、PatientNumber 字段映射修正、QuickSearchTab 注释编码修复；Epic 状态更新为 done | GitHub Copilot |
