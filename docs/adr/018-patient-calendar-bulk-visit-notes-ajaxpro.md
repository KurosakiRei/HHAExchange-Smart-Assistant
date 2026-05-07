# ADR-018: Patient Profile Calendar 批量 Visit Notes 采用 AjaxPro SavePatientVisitNotes 链路

## 状态
Accepted (2026-05-07)

## 背景

用户需要在 Patient Profile 的 Calendar 上为大量日期快速添加完全相同的 note，目标文本固定为：

- `Received live-in Timesheet`

目标场景具备以下特点：

1. 日期集合通常不是连续整月，而是某一时间范围内的若干周几，例如“每周三到每周五”或“每周一到每周三”；
2. 用户一次性会添加大量 notes，若继续走 UI 点击、输入和保存，会被成功 toast、弹窗刷新和逐条操作成本拖慢；
3. 功能必须挂在 Patient Profile Calendar 区域，而不是悬浮主面板或 Mail Builder；
4. 功能必须自动跳过“同日同内容”的既有记录；
5. 用户不需要附加备注输入框，也不需要失败自动重试。

代码库中已经存在另一条 note 提交路径：

- `Patient/PatientGeneralNotesIFrame.aspx/PatientSaveNote2`

该路径已被用于 General Notes / Calendar Note 相关功能，例如：

- [PatientVacationTemplate 中的 submitCalendarNote](c:\Users\KurosakiRei\Desktop\HHAExchange Smart Assistant\src\js\services\builtin\PatientVacationTemplate.ts#L1214)

但本次通过 Chrome DevTools MCP 对真实页面进行远程调试后确认，Patient Calendar 上“Notes”菜单对应的并不是这条 General Notes 链路，而是一个独立的 Patient Visit Notes 链路。

### 远程调试确认的关键事实

1. Patient Profile 页面中，Calendar 实际位于右侧 iframe：
   - `#iframefrmRightSide`
   - iframe URL 包含 `InternalPatientCalendarDetails_ns.aspx`
2. Calendar 右上角的主操作按钮是 iframe 内的：
   - `button#btnVisits`
   - 文案为 `Add a Visit`
3. 某个日期格上的 `Notes` 菜单打开后，弹窗加载页面为：
   - `Patient/PatientVisitNotes_ns.aspx?PatientId={id}&VisitDate={date}&office={office}&OfficeID={office}&dt=...`
4. 新增 note 的前端函数调用链为：
   - `SavePatientVisitNote`
   - `SavePatientVisitNoteInfo`
   - `CommonFunctions.SavePatientVisitNotes`
5. 最终保存端点为：
   - `POST /ENT2603010000/ajaxpro/CommonFunctions,HHAExchangeUI.ashx`
   - Header: `Content-Type: text/plain; charset=utf-8`
   - Header: `X-AjaxPro-Method: SavePatientVisitNotes`
6. `CommonFunctions.SavePatientVisitNotes` 提交的核心参数为：
   - `PatientNoteID`
   - `PatientID`
   - `Note`
   - `VisitDate`
7. 页面内成功判定条件为：
   - `ReturnValue.value > 0`
8. 保存成功后的原生 UI 行为并不是 toast，而是：
   - 刷新当前 popup iframe
   - 点击 calendar iframe 内的 `uxbtnSearch` 刷新日历显示
9. 重复读取可以直接复用 `PatientVisitNotes_ns.aspx` 页面表格：
   - 表格 ID：`#gvPatientVisitNote`
   - 该页面按“病人 + 单个 VisitDate”返回当日 notes 列表
10. Note 列解析不能直接使用整格 `innerText`，因为单元格中同时存在：
   - 可见 `<span id="..._lblNote">`
   - 隐藏 `<textarea id="..._txtNote" style="display:none;">`
   直接读整格文本会出现内容重复，去重解析应优先读取 `span[id$="_lblNote"]`。

---

## 决策

### D1：本功能必须走 Patient Visit Notes 的 AjaxPro 链路，不得复用 PatientSaveNote2

**选定**：批量添加功能统一采用 `CommonFunctions.SavePatientVisitNotes` 这条 AjaxPro 保存链路，而不是复用 `PatientSaveNote2`。

**理由**：

1. 这是用户当前在 Patient Calendar 上手动点击 `Notes` 时的真实保存路径；
2. 它天然对应“某个病人某一天的 Visit Notes”，语义正确；
3. `PatientSaveNote2` 属于另一套 General Notes / Calendar Note 体系，功能相近但不是同一个业务对象；
4. 若错误复用 `PatientSaveNote2`，会把 Visit Notes 与 General Notes 的产品边界再次混淆。

### D2：入口按钮挂在 Patient Profile Calendar iframe 内，锚点为 Add a Visit 左侧

**选定**：在 Patient Profile 页面中，仅当 `#iframefrmRightSide` 当前承载 `InternalPatientCalendarDetails_ns.aspx` 时，在其内部 `button#btnVisits` 左侧插入新按钮。

推荐挂载锚点：

- iframe 内 `div.dropdown.menu.hhax-dropdown.with-sr-label.float-right`
- 其内部现有按钮为 `button#btnVisits.button.primary.dropdown`

新按钮建议文案：

- `快速添加 Notes`

新按钮样式要求：

- 复用 `Add a Visit` 的主按钮视觉语言；
- 保持与 HHA 原生按钮一致的高度、圆角和主色；
- 作为独立按钮插在 `Add a Visit` 左边，而不是追加到下拉菜单内部。

**理由**：

1. 这是用户当前最自然的操作入口；
2. 语义上属于 Calendar 顶部动作，而不是悬浮主面板工具；
3. 把按钮插在 iframe 内能确保它与 Calendar 的刷新和月份切换处于同一上下文。

### D3：使用专用批量 Notes Modal，交互参考日期输入器，但不复用 PatientGeneralNotes 弹窗

**选定**：新增一个专用批量 Notes Modal，交互参考现有日期输入器的双月历思路，但不复用 General Notes 弹窗，也不要求用户填写 note 正文。

Modal 必须满足：

1. 默认显示双月历，支持跨月导航；
2. 支持手动点选日期；
3. 支持“区间 + 周几”快速选择，以满足每周一到周三、每周三到周五等高频场景；
4. 固定显示 note 内容预览：`Received live-in Timesheet`；
5. 不提供附加备注 textarea；
6. 执行前展示“已选日期数”和部分日期预览。

**理由**：

1. 现有通用 `DateComposerModal` 擅长手动多选，但不直接覆盖“按周几批量选”的核心高频路径；
2. 本功能的目标是“高频固定文本批量写入”，不是通用日期文本复制器；
3. 做成专用 Modal 可以把固定 note、去重说明、执行摘要整合进同一流程，而不污染通用日期输入器。

### D4：日期内部状态使用 canonical 集合，网络请求统一转换为 `MM/DD/YYYY`

**选定**：前端内部仍使用 canonical 日期集合管理选择状态，推荐复用 `YYYY-MM-DD`；在请求 `PatientVisitNotes_ns.aspx` 和 AjaxPro 保存时，统一转换为 `MM/DD/YYYY` 格式。

**理由**：

1. 内部 canonical 集合便于排序、去重、跨月处理和周几筛选；
2. HHA 现有 Visit Notes 页面与表格展示使用 `MM/DD/YYYY`；
3. 即使原生某些 URL 中出现 `4/30/2026` 这种非零填充写法，统一转为 `MM/DD/YYYY` 仍更可控且更一致。

### D5：自动跳过策略按“当前 PatientID + 当前 VisitDate + 归一化 Note 内容”判定

**选定**：每个待写入日期在真正发起保存前，先请求对应的 `PatientVisitNotes_ns.aspx` 页面，解析当日 notes；若已存在与目标文本归一化后完全一致的 note，则该日期直接标记为 `skipped`。

归一化规则至少包括：

1. 去除首尾空白；
2. 折叠连续空白和换行；
3. 优先读取 `span[id$="_lblNote"]` 的文本；
4. 仅在 `span` 不存在时才 fallback 到 `textarea[id$="_txtNote"]`；
5. 比较时大小写保持原样，默认按精确文本匹配。

**理由**：

1. 用户明确要求同日同内容自动跳过；
2. 以当前 patient + date 页面作为事实来源，最贴近原生 UI；
3. 避免把隐藏 textarea 导致的重复文本误判为 note 内容本身。

### D6：若重复检查失败，该日期标记为 failed，不允许盲写

**选定**：在无法成功读取某一天现有 notes 的情况下，该日期不执行保存，而是直接记为 `failed`。

**理由**：

1. 用户的明确要求是“自动跳过已有同日同内容”；
2. 一旦读取失败就继续盲写，会放大重复写入风险；
3. 在不启用自动重试的前提下，保守失败比误写更符合业务预期。

### D7：批量执行采用小并发、无自动重试、单次汇总反馈

**选定**：批量执行允许小并发处理，推荐默认并发度为 `3`；不做自动重试；整个批次结束后只显示一次汇总结果。

汇总至少包含：

- `created` 数量
- `skipped` 数量
- `failed` 数量
- 若失败存在，展示前若干个失败日期

**理由**：

1. 小并发可以显著快于串行，同时避免瞬间请求风暴；
2. 用户已明确不需要失败自动重试；
3. 原生逐条成功反馈会严重拖慢流程，本功能必须压缩为单次摘要。

### D8：批量结束后只刷新一次 Calendar，而不是逐条刷新

**选定**：整个批次结束后，只触发一次 `uxbtnSearch` 刷新 Calendar iframe；不在每条成功后模仿原生行为去刷新 popup 或 calendar。

**理由**：

1. 逐条刷新是手工 UI 的必要行为，不适合批量 API 模式；
2. 单次刷新能显著减少页面抖动和等待时间；
3. 用户最关心的是批量落库和最终可见性，不需要每条即时回显。

### D9：linked contract 提示仅视为可见性说明，不纳入 V1 重复检查范围

**选定**：V1 的重复检查范围只覆盖当前 `PatientID + VisitDate` 对应的 Visit Notes 页面；不额外向 linked contract 所映射的其他 patient profile 做跨档案重复查询。

**理由**：

1. 当前真实保存链路和读取页面都天然以当前 patient/date 为作用域；
2. linked contract 的现有页面提示只说明“可见性”，未提供明确的跨档案去重要求；
3. 若在 V1 引入跨档案判重，将显著增加关联关系探测复杂度。

---

## 后果

### 正面影响

- 功能语义与用户实际点击 `Notes` 的真实页面完全一致；
- 可以在不弹原生成功确认的情况下批量落 notes，显著提升速度；
- 同日同内容自动跳过，避免重复劳动；
- 单次刷新和单次摘要反馈能控制 UI 噪音；
- 不再混淆 Patient Visit Notes 与 General Notes 两套体系。

### 负面影响 / 风险

- 需要额外实现 AjaxPro 请求封装，而不是直接复用现有 JSON API 工具；
- 去重需要先读取每一天的 Visit Notes 页面，存在额外网络开销；
- 若 HHA 后续改动 `PatientVisitNotes_ns.aspx` 表格结构，解析器需要同步调整；
- V1 不做 linked contract 跨档案判重，可能保留极少数跨档案重复可见的情况；
- 专用 Modal 会新增一套面向 Patient Calendar 的 UI 代码。

---

## 被否决的方案

| 方案 | 否决原因 |
|---|---|
| 继续走 UI 自动点击、输入、保存 | toast、弹窗刷新和逐条交互会显著拖慢批量处理 |
| 复用 `PatientSaveNote2` | 这是另一套 General Notes / Calendar Note 体系，不是 Patient Visit Notes 的真实链路 |
| 允许自由编辑 note 正文 | 用户需求是批量写固定文本，额外输入框只会拖慢流程 |
| 保存失败自动重试 | 用户已明确不需要，且重试会放大重复或误写风险 |
| 去重失败时继续盲写 | 无法满足“已存在同日同内容自动跳过”的业务约束 |
| 把入口放进悬浮主面板 | 功能上下文是 Patient Profile Calendar 顶部动作，不是全局工具 |
| 把 linked contract 也纳入 V1 判重 | 复杂度高，且当前讨论未确认这是业务必须项 |

---

## 相关文件（规划）

- `src/js/services/PatientVisitNotesService.ts`（新建）
- `src/js/services/PatientCalendarBulkNotes.ts`（新建）
- `src/js/components/PatientCalendarBulkNotesModal.ts`（新建）
- `src/index.ts`（修改，HHA 页面 bootstrap）
- `src/style/main.less`（修改，按钮与 Modal 样式）
- `docs/stories/epic-20-patient-calendar-bulk-visit-notes.md`（新建）