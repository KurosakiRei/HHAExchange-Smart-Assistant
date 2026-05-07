# Epic 20: Patient Profile Calendar 快速批量添加 Visit Notes

## Epic 概述

| 属性 | 值 |
|---|---|
| **Epic ID** | EPIC-020 |
| **标题** | Patient Profile Calendar 快速批量添加 Visit Notes |
| **优先级** | P1 |
| **状态** | 📝 draft |
| **关联系统** | `PageDetector`, `iframefrmRightSide` Calendar, `PatientVisitNotesService`（新建）, `PatientCalendarBulkNotes`（新建）, `PatientCalendarBulkNotesModal`（新建） |
| **依赖 Epic** | Epic 19 日期输入能力（交互参考与状态模型借鉴） |
| **ADR** | ADR-018 |

## 背景

用户需要在 Patient Profile 的 Calendar 上为一批日期快速添加完全相同的 Visit Note：

- `Received live-in Timesheet`

当前手工流程存在三个主要问题：

1. 每个日期都要展开菜单、打开 Notes、输入文本、点击保存；
2. 原生保存成功会触发 popup 刷新和 calendar 刷新，逐条操作成本高；
3. 当用户要处理整月的某些周几时，手动操作非常低效。

同时，本 Epic 已通过远程调试确认：

1. 真实入口位于 Patient Calendar iframe 内，而不是主页面；
2. 真正的保存链路是 `CommonFunctions.SavePatientVisitNotes` 对应的 AjaxPro 端点；
3. 现有代码中的 `PatientSaveNote2` 并不属于同一功能。

因此，本 Epic 的目标不是“再做一个 note 输入框”，而是：

> 在 Patient Profile Calendar 上提供一个 API-first 的批量 Visit Notes 工具，用更少的点击完成更多的同质化写入，并自动跳过已经存在的同日同内容记录。

---

## 非目标

以下事项不在本 Epic 范围内：

1. 复用 `PatientSaveNote2` 或把功能做成 General Notes；
2. 支持自由编辑 note 文本或附加备注；
3. 编辑、删除已有 Visit Notes；
4. 自动重试失败请求；
5. 对 linked contract 做跨档案重复检查；
6. 将该功能做成悬浮主面板 Tab；
7. 处理非 Patient Profile 页面或非 Calendar 上下文。

---

## 关键逆向结论

| 主题 | 结论 |
|---|---|
| Calendar 宿主 | `#iframefrmRightSide`，URL 包含 `InternalPatientCalendarDetails_ns.aspx` |
| 顶部锚点按钮 | iframe 内 `button#btnVisits`，文案 `Add a Visit` |
| 原生 Notes 弹窗页面 | `Patient/PatientVisitNotes_ns.aspx?PatientId={id}&VisitDate={date}&office={office}&OfficeID={office}` |
| 新增保存函数链 | `SavePatientVisitNote -> SavePatientVisitNoteInfo -> CommonFunctions.SavePatientVisitNotes` |
| 最终保存端点 | `POST /ajaxpro/CommonFunctions,HHAExchangeUI.ashx` |
| AjaxPro Header | `Content-Type: text/plain; charset=utf-8` + `X-AjaxPro-Method: SavePatientVisitNotes` |
| 保存参数 | `PatientNoteID`, `PatientID`, `Note`, `VisitDate` |
| 成功判定 | `ReturnValue.value > 0` |
| 原生刷新动作 | 成功后刷新 popup，并点击 calendar iframe 内 `uxbtnSearch` |
| 去重读取来源 | `PatientVisitNotes_ns.aspx` 表格 `#gvPatientVisitNote` |
| Note 文本解析 | 优先 `span[id$="_lblNote"]`，避免 `td.innerText` 因隐藏 textarea 重复文本 |

---

## 目标用户流程

### 流程 A：在 Patient Calendar 顶部批量添加固定 Visit Notes

1. 用户进入 `InternalPatientInfo_ns.aspx` 页面；
2. 右侧 Calendar iframe 加载完成后，在 `Add a Visit` 左侧看到新按钮 `快速添加 Notes`；
3. 点击按钮后，打开专用批量 Notes Modal；
4. 用户通过日期选择 UI 生成目标日期集合；
5. 系统对每个目标日期先检查是否已存在 `Received live-in Timesheet`；
6. 系统仅对缺失的日期发起保存；
7. 批次完成后，页面显示一次汇总反馈并刷新一次 Calendar。

### 流程 B：按“区间 + 周几”快速选出整批日期

1. 用户在 Modal 中设置起止范围；
2. 选择若干周几，例如 `周三 / 周四 / 周五`；
3. 点击批量加入后，系统自动把范围内符合条件的日期加入已选集合；
4. 用户可继续手动补点、取消个别日期；
5. 用户确认后执行批量添加。

### 流程 C：遇到同日同内容自动跳过

1. 某个日期已经存在 `Received live-in Timesheet`；
2. 系统读取该日 `PatientVisitNotes_ns.aspx` 页面并命中重复；
3. 该日期标记为 `skipped`，不会再发写入请求；
4. 汇总中显示跳过数量，避免重复创建。

---

## Story 20-1: 提取 AjaxPro 版 PatientVisitNotesService

**作为** 开发者，
**我需要** 一个低层的 Patient Visit Notes 服务封装，
**以便** 在不依赖原生 UI 点击的情况下直接调用真实保存链路。

### 验收标准
- [ ] 新建 `src/js/services/PatientVisitNotesService.ts`
- [ ] 至少导出以下接口或等价能力：
  - `saveVisitNote(request): Promise<number>`
  - `fetchVisitNotesPage(patientId, visitDate, officeId): Promise<string>`
  - `parseVisitNotes(html): PatientVisitNoteRecord[]`
  - `normalizeVisitNoteText(text): string`
- [ ] `saveVisitNote()` 使用真实 AjaxPro 保存链路：
  - `POST {tenantBase}/ajaxpro/CommonFunctions,HHAExchangeUI.ashx`
  - Header: `Content-Type: text/plain; charset=utf-8`
  - Header: `X-AjaxPro-Method: SavePatientVisitNotes`
  - Body: `{"PatientNoteID":-1,"PatientID":"...","Note":"Received live-in Timesheet","VisitDate":"MM/DD/YYYY"}`
- [ ] 成功时返回正整数 `value`；失败时抛出明确错误
- [ ] 明确禁止走 `PatientSaveNote2`
- [ ] `npm run build` 无新增错误

### 实现提示
- 低层协议建议继续使用 `GM_fetch`，保持与现有 HHA 服务层一致
- `tenantBase` 可通过当前页面路径推导，例如 `/ENT2603010000`

---

## Story 20-2: 提取 Visit Notes 页面读取与重复判定能力

**作为** 系统，
**我需要** 在保存前读取某一天现有的 Visit Notes 并进行重复判定，
**以便** 自动跳过同日同内容记录。

### 验收标准
- [ ] `PatientVisitNotesService` 支持请求：
  - `GET /Patient/PatientVisitNotes_ns.aspx?PatientId={id}&VisitDate={MM/DD/YYYY}&office={office}&OfficeID={office}&dt={timestamp}`
- [ ] 解析表格 `#gvPatientVisitNote`，输出结构至少包含：
  - `date`
  - `noteText`
  - `createdBy`
  - `createdDate`
- [ ] Note 解析优先读取：
  - `span[id$="_lblNote"]`
  - fallback：`textarea[id$="_txtNote"]`
- [ ] 不允许直接拿整格 `td.innerText` 作为 note 内容来源
- [ ] 归一化后，若某条记录与目标文本完全一致，则该日期判定为重复
- [ ] 若读取页面失败或解析失败，该日期必须返回 `failed`，调用方不得继续盲写

### 实现提示
- 当前真实页面中 Note 列会同时包含可见 `span` 和隐藏 `textarea`，直接取整格文本会得到重复文本

---

## Story 20-3: Patient Calendar 专用批量 Notes Modal

**作为** 用户，
**我需要** 一个专门用于批量选择日期和执行固定 note 写入的弹窗，
**以便** 快速完成高频重复性工作。

### 验收标准
- [ ] 新建 `src/js/components/PatientCalendarBulkNotesModal.ts`
- [ ] Modal 标题明确指向当前场景，例如：`快速添加 Patient Visit Notes`
- [ ] Modal 中固定显示将要写入的 note：
  - `Received live-in Timesheet`
- [ ] 不提供自由输入 textarea 或附加备注字段
- [ ] 日期选择区至少提供两种能力：
  - 手动点选日期
  - 按“起止范围 + 周几”批量加入日期
- [ ] 支持跨月选择
- [ ] 至少提供以下快速筛选元素：
  - 起始日期
  - 结束日期
  - 周一至周日多选 chip
  - `按条件加入` 按钮
  - `清空已选` 按钮
- [ ] Modal 中实时显示：
  - 已选日期数
  - 前若干个已选日期预览
- [ ] 用户可在执行前手动取消个别日期

### 实现提示
- 交互风格参考现有日期输入器的双月历思路，但本 Modal 是 Patient Calendar 专用工作流，不必强行复用通用日期输入器文案

---

## Story 20-4: Patient Profile Calendar 顶部按钮注入

**作为** 用户，
**我需要** 在 `Add a Visit` 旁边看到批量 Notes 入口，
**以便** 不离开当前 Calendar 就能启动批量写入。

### 验收标准
- [ ] 新建 `src/js/services/PatientCalendarBulkNotes.ts`
- [ ] 仅在以下条件同时满足时注入按钮：
  - 当前页面为 `PATIENT_PROFILE`
  - `#iframefrmRightSide` 已加载
  - iframe URL 包含 `InternalPatientCalendarDetails_ns.aspx`
- [ ] 目标锚点为 iframe 内的：
  - `button#btnVisits`
- [ ] 新按钮插在 `Add a Visit` 左侧
- [ ] 新按钮样式与现有 `Add a Visit` 按钮保持一致
- [ ] month/year 切换、calendar 刷新、iframe reload 后不会重复注入多份按钮
- [ ] 离开 Patient Profile 或 iframe 不是 Calendar 时，不显示该按钮

### 实现提示
- 优先使用 iframe `load` 监听和 idempotent 检查，而不是全局无差别轮询

---

## Story 20-5: 批量执行编排与上下文提取

**作为** 系统，
**我需要** 将已选日期集合、安全去重和 AjaxPro 保存串联成一个可控的批处理流程，
**以便** 用最少的 UI 干扰完成批量写入。

### 验收标准
- [ ] 从当前 Patient Profile URL 中大小写不敏感提取 `PatientId`
- [ ] 从 calendar iframe URL 参数或隐藏字段中提取 `officeId`
- [ ] 内部已选日期集合使用 canonical 格式（推荐 `YYYY-MM-DD`）
- [ ] 发请求前统一转换为 `MM/DD/YYYY`
- [ ] 对每个日期执行顺序固定为：
  - 读取现有 Visit Notes
  - 命中重复则 `skipped`
  - 否则调用 AjaxPro 保存
- [ ] 默认并发度为 `3`
- [ ] 不做失败自动重试
- [ ] 任何单日失败不会中断整个批次，其余日期继续执行
- [ ] 固定 note 文本写死为 `Received live-in Timesheet`

### 实现提示
- 建议输出统一的批处理结果结构，例如 `created[] / skipped[] / failed[]`

---

## Story 20-6: 汇总反馈与单次 Calendar 刷新

**作为** 用户，
**我需要** 在批量结束后看到一次明确摘要，并让 Calendar 最终刷新出最新状态，
**以便** 快速确认结果，而不是被逐条反馈打断。

### 验收标准
- [ ] 整个批次结束后只显示一次汇总反馈
- [ ] 汇总至少包含：
  - 创建成功数量
  - 跳过数量
  - 失败数量
- [ ] 若失败数量大于 0，摘要中展示前若干个失败日期
- [ ] 不显示逐条成功 toast / confirm
- [ ] 批次结束后只刷新一次 Calendar：
  - 点击 iframe 内 `uxbtnSearch`
- [ ] 现有 `Add a Visit` 下拉菜单和手工 `Notes` 弹窗行为不受影响

### 实现提示
- 若未来要做当前打开 popup 的同步刷新，可作为后续增强，不纳入本 Story 必需项

---

## Story 20-7: 回归验证与文档收口

**作为** 团队，
**我需要** 为这一批量写入功能准备最小但完整的回归清单与文档闭环，
**以便** 在不误伤现有 Patient Calendar 功能的前提下上线。

### 验收标准
- [ ] 手动验证以下场景：
  - 仅手动点选少量日期后成功创建 notes
  - 使用跨月日期范围 + 周几批量加入后成功创建 notes
  - 已存在同日同内容时正确跳过
  - 某一日读取失败时该日进入 `failed`，其余日期继续执行
  - 批次结束后只刷新一次 Calendar
  - 原生 `Add a Visit` 菜单不受影响
  - 原生单日 `Notes` 弹窗不受影响
- [ ] `npm run build` 无新增错误
- [ ] 文档完成并互相关联：
  - `docs/adr/018-patient-calendar-bulk-visit-notes-ajaxpro.md`
  - `docs/stories/epic-20-patient-calendar-bulk-visit-notes.md`

---

## 依赖关系

```text
20-1 (AjaxPro Save Service)
  └─ 20-2 (Visit Notes Reader + Dedup)

20-3 (Bulk Notes Modal)
  └─ 20-5 (Batch Orchestration)

20-4 (Button Injection)
  └─ 20-5 (Batch Orchestration)

20-5 (Batch Orchestration)
  └─ 20-6 (Summary + Single Refresh)

20-7 (QA + Docs)
  └─ depends on 20-3, 20-4, 20-5, 20-6
```

---

## 文件清单（规划）

| 操作 | 文件路径 |
|---|---|
| 新建 | `src/js/services/PatientVisitNotesService.ts` |
| 新建 | `src/js/services/PatientCalendarBulkNotes.ts` |
| 新建 | `src/js/components/PatientCalendarBulkNotesModal.ts` |
| 修改 | `src/index.ts` |
| 修改 | `src/style/main.less` |
| 新建 | `docs/adr/018-patient-calendar-bulk-visit-notes-ajaxpro.md` |
| 新建 | `docs/stories/epic-20-patient-calendar-bulk-visit-notes.md` |

---

## 风险与缓解

| 风险 | 说明 | 缓解 |
|---|---|---|
| 误走 `PatientSaveNote2` | 会把 Visit Notes 与 General Notes 功能混淆 | 在服务层与文档中明确锁定 AjaxPro `SavePatientVisitNotes` |
| Note 解析误判重复 | 直接读 `td.innerText` 会把隐藏 textarea 一起读出来 | 只解析 `span[id$="_lblNote"]`，必要时再 fallback 到 textarea |
| 批量速度快但页面抖动大 | 若逐条刷新 Calendar 会极大拖慢流程 | 仅在整批结束后刷新一次 `uxbtnSearch` |
| 去重检查失败后发生误写 | 网络波动或结构变更时会无法安全判断 | 读取失败直接标记 `failed`，禁止盲写 |
| linked contract 范围不清 | 关联档案可见性提示可能被误解为必须跨档案判重 | V1 明确只做当前 PatientID + VisitDate 判重，并在 ADR 中记为范围控制 |

---

## 后续候选增强（不在本 Epic 范围内）

1. 支持可配置的固定 note 模板，而不只是一条写死文本
2. 支持批次历史记录与最近一次重复执行
3. 若业务确认需要，再补 linked contract 跨档案判重
4. 支持按当前月份快速“全选某些周几”而不必输入起止范围