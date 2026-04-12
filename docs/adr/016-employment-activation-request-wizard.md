# ADR-016: 雇佣激活请求内置模板 — 四步向导架构设计
## 状态
Accepted (2026-04-12)
## 背景
在"内置模板"体系（Epic 16）中新增第四个模板："雇佣激活请求（Employment Activation Request）"。该模板的业务目标是让 Coordinator 快速生成一封标准化邮件，通知 HR 在指定日期激活某护理员，使其能够为指定患者提供服务。
与已有三个内置模板（Timesheet 通知、Patient Vacation、End of Day Report）相比，本模板具有以下新特征：
1. **多步骤向导 UI**：邮件内容需要依次收集「护理员、患者、激活日期」三类独立信息，单页表单难以承载，需要引导式多步骤流程；
2. **嵌入式 HHA 搜索**：护理员和患者信息需从 HHAExchange 系统搜索选取，而非手动输入，需要复用 Epic 18 已实现的 HhaSearchService；
3. **收件组配置系统**：HR 人员变动频繁，邮件收件人（To/CC/称呼）需要可配置，且可能存在多个不同目标（如不同 HR 人员），需要一套独立的收件组管理方案；
4. **可编辑预览**：第四步展示生成的邮件内容，允许用户在发送前自由修改。
---
## 决策
### D1：向导主体 — 大尺寸 Modal，横向步骤条
**选定**：Modal 尺寸为 960px × 680px（内容视口高度约 580px），确保足够容纳搜索结果区域。
横向步骤条（4步）放置于 Modal 顶部 Header 下方，固定始终可见，不随内容区滚动。
步骤定义：
| 步骤编号 | 标题 | 内容 |
|---|---|---|
| 1 | 护理员 | 搜索并选择 Caregiver |
| 2 | 患者 | 搜索并选择 Patient |
| 3 | 日期 | 选择激活日期 |
| 4 | 预览 | 编辑并发送邮件 |
**步骤跳转规则**：
- 步骤条圆点仅支持**点击跳回**已完成的步骤（圆点着色表示已完成）；
- 不允许通过步骤条跳过未完成步骤；
- 每个步骤底部有「上一步」/「下一步」导航按钮（第1步无「上一步」，第4步无「下一步」）。
**已完成判定**：
- 步骤1完成：已选择 Caregiver（非 null）
- 步骤2完成：已选择 Patient（非 null）
- 步骤3完成：已选择激活日期（非空）
- 步骤4本身即末步，无「完成」概念
**每页上方信息摘要栏（第2步起）**：在步骤条下方、内容区上方显示已完成步骤的摘要信息（例如第3页显示「护理员：Lin Bin AHC-25402 ｜ 患者：Zhao Kezhong AHC-909844」），方便用户发现录入错误后点击步骤条返回修改。
### D2：嵌入式搜索复用策略 — 调用 HhaSearchService，自建紧凑 UI
**背景**：Epic 18 的 QuickSearchTab 搜索逻辑封装于 HhaSearchService.ts，核心函数为 uildSearchUrl() 和 etchAllPages()，结果以 HhaSearchResult（含 awHtml 字符串）形式返回。Epic 18 直接渲染该 rawHtml 到 Blob 弹窗，但在本向导内嵌场景中需要结构化数据。
**选定**：在 HhaSearchService.ts 中新增两个解析函数（不破坏现有接口）：
`	ypescript
/** 从 rawHtml 解析 Caregiver 行为结构化记录 */
function parseAideRows(rawHtml: string): AideRecord[]
/** 从 rawHtml 解析 Patient 行为结构化记录 */
function parsePatientRows(rawHtml: string): PatientRecord[]
`
不复用 QuickSearchTab.ts 的 UI 代码；
不复用 displayCombinedResults / displaySingleResult（它们是 Blob 弹窗方案，与 Modal 嵌入方案不兼容）。
**接口定义**：
`	ypescript
interface AideRecord {
  fullName: string;        // 姓名
  caregiverCode: string;   // Caregiver Code，如 AHC-25402
  dob: string;             // 出生日期
  phone: string;           // 电话（可多号码逗号分隔）
  discipline: string;      // PCA, HHA 等
  status: string;          // Active / Terminated 等
}
interface PatientRecord {
  fullName: string;        // 姓名
  patientId: string;       // Patient ID（内部 ID）
  admissionId: string;     // Admission ID / MR Number
  dob: string;
  status: string;
  phoneNumber: string;
}
`
### D3：搜索结果展示 — 固定高度卡片列表，内部滚动
**选定**：搜索结果容器固定高度约 260px，内部 overflow-y: auto，禁止触发外层 Modal 滚动（overscroll-behavior: contain）。
每条结果渲染为紧凑双行卡片（对标 Epic 16 Story 1 的 Visit 列表风格）：
`
┌─────────────────────────────────────────────────────┐
│ [首字母] Lin Bin  AHC-25402                [选择]   │
│          DOB: 08/07/1963  917-618-5477  PCA, HHA  [Active] │
└─────────────────────────────────────────────────────┘
`
- Status 字段使用与 Epic 18 / Story 16.1 相同的三档彩色 badge；
- 选中状态：行背景高亮（淡蓝色 #eff6ff），「选择」按钮变为「✓ 已选」（禁用态，绿色）；
- 结果总数显示于搜索框右侧（如「共 15 条»）；
- 列表顶部（搜索框与结果列表之间）有一条「当前选择」信息栏，未选择时显示占位文字「已选择：（请搜索并选择）」。
**重新搜索行为**：用户修改搜索字段并触发新一轮搜索时，若已有选择，不自动清空，保留上次选择高亮（直到用户主动选择新行）。
### D4：收件组配置系统 — localStorage，按钮组 + CRUD 二次弹窗
**存储 Key**：hha_builtin_employment_activation_config
**存储结构**：
`json
{
  "recipientGroups": [
    {
      "id": "grp_1713000000000",
      "name": "HR Liz",
      "greeting": "Liz",
      "to": ["Lweizhen@AlwaysNY.net"],
      "cc": []
    }
  ]
}
`
**第四页 UI**：
- 小标题「选择收件组」，右侧「⚙️」图标按钮打开管理弹窗；
- 按钮组显示所有收件组，横向排列，选中项高亮（深蓝色激活态）；
- 最多支持 10 个收件组（超出时「⚙️」管理弹窗内禁用「添加」按钮并提示）。
**CRUD 管理弹窗**（Modal on Modal）：
- 标题「管理收件组」，列表展示所有收件组
- 每行有「编辑」「删除」操作；底部有「+ 添加收件组」按钮
- 编辑/添加使用内联表单（在同一弹窗内展开），字段：
  - 配置名（
ame）、称呼（greeting，即正文 "Hello XX" 中的 XX）
  - To 地址（支持多个，逗号/分号分隔）
  - CC 地址（支持多个，可选）
### D5：切换收件组 — 仅更新 To/CC，不重置邮件内容
**选定方案 B**：切换收件组时仅刷新富文本编辑器中 To/CC 的绑定值（若邮件预览区域有独立的 To/CC 显示区），正文与标题维持用户最后一次编辑的状态，不重新生成。
实现方式：富文本编辑器内容与 wizardState 中的 odyHtml / subject 字段解耦，初次进入第4步时生成默认内容填入编辑器，此后编辑器内容完全由用户控制；切换收件组只更新 wizardState.selectedGroupId，不触发编辑器内容重新生成。
### D6：脏状态检测 — 首次输入后监听，点击外部弹确认
**触发脏状态的操作**：
- 在步骤1完成 Caregiver 选择
- 在步骤2完成 Patient 选择
- 在步骤3选择了日期
- 在步骤4对编辑器内容进行任何修改
**触发关闭确认的时机**：isDirty === true 时，点击 Modal 外部区域（背景层）或右上角 ×。
**确认文案**：
> ⚠️ 你已有输入内容尚未发送，关闭将清空所有输入。确认关闭？
>
> [取消]　[确认关闭]
点击「确认关闭」后：清空 wizardState 所有字段，Modal 关闭，下次打开从步骤1重新开始。
### D7：文件架构
| 操作 | 文件路径 | 说明 |
|---|---|---|
| 新建 | src/js/services/builtin/EmploymentActivationTemplate.ts | 模板主文件（入口卡片、向导逻辑、收件组管理） |
| 修改 | src/js/services/HhaSearchService.ts | 新增 parseAideRows() / parsePatientRows() |
| 修改 | src/js/tabs/MailBuilderTab.ts | 注册新入口卡片 |
| 修改 | docs/stories/epic-16-builtin-templates.md | 更新 Story 索引 |
EmploymentActivationTemplate.ts 内部子模块职责划分：
- enderEntryCard() — 入口卡片渲染与页面检测
- openWizard() — Modal 创建与初始化 wizardState
- enderStep(n) — 切换步骤内容，更新步骤条状态
- enderStep1/2SearchPane() — 搜索输入 + 结果列表渲染
- enderStep3DatePicker() — 日期选择器渲染
- enderStep4Preview() — 预览编辑器 + 收件组选择渲染
- RecipientGroupManager — 收件组 CRUD（localStorage 读写 + 管理弹窗）
### D8：无收件组发送的降级处理
允许用户在未选择收件组时点击「发送到 Outlook」，但须弹出强提示：
> ⚠️ 未选择收件组  
> 未选择收件组将导致邮件无收件人。是否仍要发送到 Outlook？  
>
> [取消]　[仍要发送]
点击「仍要发送」：以空 To/CC 调用 MailService.sendMail()，Outlook 将显示无收件人的草稿，用户可在 Outlook 中手动填写。
---
## 影响范围
- HhaSearchService.ts：新增 parseAideRows() / parsePatientRows() 两个纯函数，不影响现有接口；
- MailBuilderTab.ts：新增一次 enderEntryCard() 调用，改动量极小；
- 无需修改 index.ts、MultiTabPanel.ts 或任何 Tab 路由。
---
## 被否决的方案
| 方案 | 否决原因 |
|---|---|
| 直接复用 QuickSearchTab.ts 的搜索 UI | QuickSearchTab 基于 BaseTab，输入 UI 与 Tab 框架绑定，无法直接嵌入 Modal 内 |
| 搜索结果使用分页而非固定高度滚动 | 弹窗内空间有限，分页器额外占用高度；用户通常输入姓名后结果 < 20 条，滚动足够 |
| 切换收件组重新生成邮件内容（方案A/C） | 破坏用户已在第4步做出的修改，体验不佳 |
| 直接在步骤条圆点上允许自由跳转 | 跳过未完成步骤会导致生成邮件时缺少必要字段，引发错误 |
