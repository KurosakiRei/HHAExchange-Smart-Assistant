# Epic 16, Story 4: 雇佣激活请求内置模板（Employment Activation Request）
## Story 元数据
| 属性           | 值                                                                                   |
| -------------- | ------------------------------------------------------------------------------------ |
| **Story ID**   | EPIC-016-STORY-004                                                                   |
| **标题**       | Employment Activation Request — 四步向导内置模板                                    |
| **优先级**     | P1 - 高                                                                              |
| **状态**       | ✅ 已完成（review）                                                                   |
| **目标页面**   | 任意页面（无限制）                                                                   |
| **关联 Epic**  | Epic 16（内置模板体系）、Epic 18（快速搜索 Tab）                                    |
| **依赖服务**   | `HhaSearchService`, `MailService`, `MailBuilderTab`                                 |
| **ADR**        | ADR-016                                                                              |
## 用户故事
**作为** 脚本用户  
**我希望** 在邮件助手的"内置模板"区域点击"雇佣激活请求"入口卡片，按照四步向导依次选择护理员、患者、激活日期后，自动生成标准化邮件并支持发送到 Outlook  
**以便** 快速通知 HR 在指定日期激活护理员，无需手动查找人员信息和撰写邮件
---
## 子 Story 索引
| 子 Story | 标题 | 状态 |
|---|---|---|
| 16.4a | 四步向导框架 + 步骤条 + 入口卡片 + 脏状态检测 | ✅ 已完成 |
| 16.4b | 第一/二步：嵌入式 Caregiver & Patient 搜索选择 | ✅ 已完成 |
| 16.4c | 第三步：日期选择器 | ✅ 已完成 |
| 16.4d | 收件组配置系统（CRUD + localStorage + 管理弹窗） | ✅ 已完成 |
| 16.4e | 第四步：预览编辑器 + 收件组选择 + Outlook 发送 | ✅ 已完成 |
---
## 邮件规格（总览）
| 字段    | 内容                                                                                   |
| ------- | -------------------------------------------------------------------------------------- |
| **To**  | 选中收件组的 `to` 地址列表（逗号连接）；未选组时为空                                  |
| **CC**  | 选中收件组的 `cc` 地址列表；为空则不传                                                |
| **Subject** | `Employment Activation Request / {CaregiverLastName} {CaregiverFirstName} {CaregiverCode}` |
| **Body**    | 见下方正文模板                                                                    |
**正文模板**（初始预填，第四步可自由修改）：
```
Hello {greeting},
PLEASE ACTIVATE PCA REGISTED ONCE ORIENTATION COMPLETE ON
{CaregiverFullName} {CaregiverCode}
THE AIDE WILL BE ASSIGNED TO BELOW CASE ON {activationDate}
{PatientFullName} {PatientAdmissionId}
```
---
## 向导状态数据结构
```typescript
interface WizardState {
  caregiver: SelectedCaregiver | null;
  patient: SelectedPatient | null;
  activationDate: string | null;   // 格式 MM/DD/YYYY
  selectedGroupId: string | null;
  isDirty: boolean;
}
interface SelectedCaregiver {
  fullName: string;       // 完整姓名，如 "Lian Bin"
  caregiverCode: string;  // 如 "AHC-25402"
  lastName: string;
  firstName: string;
}
interface SelectedPatient {
  fullName: string;        // 完整姓名，如 "Zhao Kezhong"
  admissionId: string;     // 如 "AHC-909844"
}
```
---
## Story 16.4a：四步向导框架 + 步骤条 + 入口卡片 + 脏状态检测
### 验收标准
- [ ] 在邮件助手"内置模板" Tab 显示"雇佣激活请求"入口卡片
  - 卡片标题：**Employment Activation Request**
  - 卡片描述：`📨 四步向导生成护理员雇佣激活邮件`
  - 页面 Tag：**`任意页面`**
  - 无页面限制，卡片始终可点击（不置灰）
- [ ] 点击卡片弹出向导 Modal，尺寸 `960px × 680px`（`min-width`/`min-height`），背景半透明遮罩
- [ ] Modal 顶部固定 Header：左侧标题「雇佣激活请求」，右上角 `×` 关闭按钮
- [ ] Header 下方横向步骤条，显示 4 个步骤（护理员 / 患者 / 日期 / 预览）：
  - 已完成步骤：圆点实心深蓝色，支持点击跳回
  - 当前步骤：圆点高亮边框
  - 未到达步骤：圆点灰色，**不可点击**
- [ ] 内容区中部渲染当前步骤内容（默认显示步骤1），footer 区域有导航按钮：
  - 步骤1：仅「下一步」（下一步需步骤已完成才启用）
  - 步骤2/3：「上一步」+「下一步」
  - 步骤4：「上一步」+「发送到 Outlook」
- [ ] 第2步起，步骤条与内容区之间显示已完成信息摘要栏（蓝灰色背景条）：
  - 步骤2：「护理员：{fullName} {caregiverCode}」
  - 步骤3：「护理员：... ｜ 患者：{fullName} {admissionId}」
  - 步骤4：「护理员：... ｜ 患者：... ｜ 激活日期：{date}」
  - 摘要栏每个信息块可点击（高亮 hover），点击跳回对应步骤
- [ ] 脏状态检测：`isDirty` 默认 `false`；以下操作将 `isDirty` 置 `true`：
  - 完成步骤1 Caregiver 选择
  - 完成步骤2 Patient 选择
  - 步骤3选择了日期
  - 步骤4在编辑器内有任何输入
- [ ] 当 `isDirty === true` 时，点击遮罩背景或 `×` 按钮，弹出确认对话框：
  > ⚠️ 你已有输入内容尚未发送，关闭将清空所有输入。确认关闭？
  > [取消] [确认关闭]
- [ ] 点击「确认关闭」：清空 `wizardState`，关闭 Modal，下次打开重置至步骤1
- [ ] `isDirty === false` 时直接关闭，无需确认
### 实现提示
- Modal DOM 结构：`wizard-modal > wizard-overlay | wizard-container > wizard-header + wizard-steps + wizard-summary + wizard-body + wizard-footer`
- 步骤条使用 CSS flex 布局，步骤间连接线通过伪元素或 hr 实现
- `wizardState` 以闭包变量形式持有，Modal 关闭时清空；不写入 localStorage（收件组配置才写 localStorage）
- 遮罩层 click 事件冒泡阻止：仅 `wizard-overlay`（遮罩背景本身）触发关闭检测，点击 `wizard-container` 内部时不触发
---
## Story 16.4b：第一/二步 — 嵌入式 Caregiver & Patient 搜索选择
### 验收标准
**搜索区（步骤1/2 通用结构）：**
- [ ] 步骤1搜索 Caregiver，步骤2搜索 Patient，UI 结构相同，仅搜索端和结果列渲染不同
- [ ] 搜索输入区：水平排列 4 个字段——**姓**（lastName）、**名**（firstName）、**电话**（phone）、**ID**（id）
  - 步骤1 ID placeholder：`Caregiver Code`
  - 步骤2 ID placeholder：`Admission ID (MR Number)`
  - 每个输入框内置 `×` 清除按钮
  - 任意输入框按 Enter 触发搜索
- [ ] 「搜索」按钮（主色），搜索中状态变为「⏳ 搜索中…」并禁用
- [ ] 至少有一个字段有值才启用「搜索」按钮（否则禁用，tooltip：「请至少输入一个搜索条件」）
- [ ] 搜索进行中：结果区显示 CSS loading spinner（居中，纯 CSS，无外部依赖）
**当前选择栏（搜索框与结果列表之间）：**
- [ ] 始终可见，固定高度（约 40px），背景淡蓝色
- [ ] 未选择时显示：「已选择：（请搜索并选择）」（灰色斜体）
- [ ] 已选择时显示：「✓ 已选择：{fullName} {code/admissionId}」（深蓝色）
**搜索结果列表（HHA 数据，结构化卡片）：**
- [ ] 结果区固定高度 `260px`，`overflow-y: auto`，`overscroll-behavior: contain`（防止穿透到 Modal）
- [ ] 每条结果为紧凑双行卡片：
  - **Caregiver 卡片**（第一行）：`[首字母头像] {fullName} {caregiverCode}　　　　[选择]按钮`
  - **Caregiver 卡片**（第二行，灰色小字）：`DOB: {dob}  📞 {phone}  {discipline}  [Status Badge]`
  - **Patient 卡片**（第一行）：`[首字母头像] {fullName}　　　　[选择]按钮`
  - **Patient 卡片**（第二行，灰色小字）：`DOB: {dob}  Admission ID: {admissionId}  📞 {phoneNumber}  [Status Badge]`
- [ ] Status Badge 复用与 Epic 18 相同的三档颜色（绿/灰/黄）
- [ ] 结果总数显示在搜索框右侧，如「共 15 条»」
- [ ] 未搜索/无结果时结果区显示占位内容：
  - 初始状态：「请输入搜索条件后点击搜索」
  - 无结果：「未找到匹配结果，请尝试其他条件」
- [ ] 「选择」按钮：点击后 `wizardState.caregiver/patient` 更新，该行背景高亮（淡蓝 `#eff6ff`），按钮变为「✓ 已选」（绿色，禁用态），之前选中行恢复正常样式
- [ ] 重新搜索后，若已有选择，保留上次选择高亮并滚动至选中行
- [ ] 步骤1「下一步」：需已选择 Caregiver 才可点击，否则禁用并显示 tooltip：「请先选择护理员」
- [ ] 步骤2「下一步」：需已选择 Patient 才可点击，否则禁用并显示 tooltip：「请先选择患者」
**HhaSearchService 扩展：**
- [ ] 在 `HhaSearchService.ts` 中新增：
  ```typescript
  export function parseAideRows(rawHtml: string): AideRecord[]
  export function parsePatientRows(rawHtml: string): PatientRecord[]
  ```
- [ ] `parseAideRows` 解析 `#tdSearchResults tbody tr`，提取：姓名（第1列）、Caregiver Code（第1列子元素）、SSN列（跳过）、DOB、Phone、Team（跳过）、Type（跳过）、Discipline、Status
- [ ] `parsePatientRows` 解析同样的表格 DOM，提取：姓名、Patient ID（不显示）、Admission ID、DOB、Status、Phone Number
- [ ] 两函数均处理空行（`tr` 无有效单元格）和异常行，静默跳过
### 实现提示
- 调用 `fetchAllPages("aide"|"patient", params)` 获取 `HhaSearchResult`，再传 `rawHtml` 给 `parseAideRows/parsePatientRows`
- 首字母头像：取 `fullName` 第一个字母，大写，圆形背景色按首字母哈希取色（5-6种颜色），风格对标 Story 16.1 头像
- 实际列索引通过解析 `<thead>` 列标题动态定位（对标 `injectStatusBadges` 的列检测逻辑），不硬编码列号
---
## Story 16.4c：第三步 — 日期选择器
### 验收标准
- [ ] 步骤3内容区居中显示：
  - 标题文字：「选择护理员激活日期」
  - 快捷按钮行：「今天」「明天」，点击自动填入对应日期
  - 日期输入框：原生 `<input type="date">`，无需引入外部库
  - 已选日期以 `MM/DD/YYYY` 格式存储于 `wizardState.activationDate`（内部转换，input value 使用 `YYYY-MM-DD`）
- [ ] 快捷按钮「今天」：填入今日日期（以当前浏览器本地时间为准）
- [ ] 快捷按钮「明天」：填入明日日期
- [ ] 不限制过去日期（允许选择）
- [ ] 步骤3「下一步」（进入步骤4）：需日期非空才可点击，否则禁用，tooltip：「请先选择日期」
- [ ] 进入步骤4时，将选定日期格式化为 `MM/DD/YYYY` 写入 `wizardState.activationDate`
### 实现提示
- 快捷按钮点击时同步更新 `<input>` 的 `value` 并触发自定义事件，确保 `change` 监听器更新 `wizardState`
- `<input type="date">` 在 Chromium 环境（Tampermonkey / Chrome Extension）下表现一致，无需 polyfill
---
## Story 16.4d：收件组配置系统（CRUD + localStorage + 管理弹窗）
### 数据结构
```typescript
interface RecipientGroup {
  id: string;          // 唯一 ID，格式 "grp_{Date.now()}"
  name: string;        // 配置显示名，如 "HR Liz"
  greeting: string;    // 邮件 Hello 后的称呼，如 "Liz"
  to: string[];        // 收件人地址列表
  cc: string[];        // 抄送地址列表（可为空数组）
}
```
**GM Storage Key**：`hha_builtin_employment_activation_config`
**存储结构**：
```json
{
  "recipientGroups": [ ...RecipientGroup[] ]
}
```
### 验收标准
**读取与初始化：**
- [ ] 首次使用（无 localStorage 数据）时，`recipientGroups` 为空数组，管理弹窗提示「暂无收件组，请点击添加」
- [ ] 每次打开 Modal 时重新从 localStorage 读取，确保数据最新
**管理弹窗（`⚙️` 按钮打开，Modal on Modal）：**
- [ ] 弹窗标题「管理收件组」，尺寸 `480px × auto`（最高 `560px`，内部可滚动），居中叠加于向导 Modal 之上
- [ ] 列表按 `id` 升序（创建先后）展示所有收件组，每行：
  - 左侧：显示名（粗体）+ `greeting` 预览（灰色「Hello {greeting}」）
  - 右侧：「编辑」「删除」按钮
- [ ] 「编辑」：在弹窗内底部展开内联表单（Accordion 式），同一时间只展开一个；若点击已展开行的「编辑」则收起
- [ ] 「删除」：弹出小型确认弹窗（inline confirm，无需第三层 Modal）：「确认删除「{name}」？ [取消] [删除]」
- [ ] 「+ 添加收件组」按钮：在列表底部展开新增表单
- [ ] 添加/编辑表单字段：
  - 配置名（必填，`name`）
  - 称呼（必填，`greeting`，如 `Liz`）
  - To 地址（必填，多地址用逗号/分号分隔，输入后自动拆分为字符串数组）
  - CC 地址（选填，多地址同上）
- [ ] 表单「保存」按钮：验证必填字段后写入 localStorage，更新列表显示；「取消」收起表单
- [ ] 收件组数量 ≥ 10 时，「+ 添加收件组」按钮禁用，显示提示「最多支持 10 个收件组」
- [ ] 管理弹窗关闭后，第四步的收件组按钮组自动同步最新数据
**To 地址格式验证：**
- [ ] 保存时校验 `to` 地址是否至少有一个，且每个地址包含 `@`（简单校验）；不合法时内联红色错误提示，阻止保存
### 实现提示
- localStorage 读写封装在 `RecipientGroupManager` 类（或一组纯函数），供步骤4和管理弹窗共用
- `id` 使用 `"grp_" + Date.now()` 生成，足够唯一
- 管理弹窗层级：`z-index` 比向导 Modal 高 10，有自己的半透明遮罩；点击遮罩关闭管理弹窗，不影响向导 Modal
---
## Story 16.4e：第四步 — 预览编辑器 + 收件组选择 + Outlook 发送
### 验收标准
**收件组选择区（步骤4顶部）：**
- [ ] 小标题「选择收件组」，右侧「⚙️」按钮打开收件组管理弹窗（Story 16.4d）
- [ ] 已有收件组时：横向按钮组，每个按钮显示收件组 `name`；选中项深蓝色激活态背景，未选项边框样式
- [ ] 无收件组时：显示灰色提示「暂无收件组，请点击 ⚙️ 添加」，及「⚙️ 管理收件组」快捷链接
- [ ] 切换收件组：不重置邮件内容（方案B），仅更新 `wizardState.selectedGroupId`
**邮件预览区：**
- [ ] 标题输入框（单行）：初始预填 `Employment Activation Request / {lastName} {firstName} {caregiverCode}`，用户可自由修改
- [ ] 正文富文本编辑器（复用项目现有的 `contenteditable` div 或 `quill` 方案，与 MailBuilderTab 保持一致）：
  - 初始预填内容如下（以 `<br>` 换行）：
    ```
    Hello {greeting},
    PLEASE ACTIVATE PCA REGISTED ONCE ORIENTATION COMPLETE ON
    {CaregiverFullName} {CaregiverCode}
    THE AIDE WILL BE ASSIGNED TO BELOW CASE ON {activationDate}
    {PatientFullName} {PatientAdmissionId}
    ```
  - 若无选中收件组，`{greeting}` 填入空字符串（显示为「Hello ,」），用户可自行修改
  - 用户对编辑器的任何修改触发 `isDirty = true`
- [ ] 收件组信息展示行（编辑器上方）：
  - 「To: {to 地址列表}」
  - 「CC: {cc 地址列表}」（若为空则不显示此行）
  - To/CC 仅**展示**，不可在此直接编辑（须通过 ⚙️ 管理收件组修改）
**导航与发送：**
- [ ] Footer 左侧：「← 上一步」按钮，点击返回步骤3（不清空已生成内容）
- [ ] Footer 右侧：「发送到 Outlook」按钮
- [ ] 点击「发送到 Outlook」：
  - 若已选收件组：直接调用 `MailService.sendMail({ to, cc, subject, body })`
  - 若**未选收件组**：弹出确认提示：
    > ⚠️ 未选择收件组，邮件将无收件人。是否仍要发送到 Outlook？
    > [取消]　[仍要发送]
  - 点击「仍要发送」：以空 To/CC 调用 `MailService.sendMail()`
- [ ] 发送成功后：
  - `isDirty` 置 `false`
  - Modal 不自动关闭（允许用户发送相同邮件到多个收件组，只需切换收件组再次发送）
  - 显示短暂 toast：「已发送到 Outlook ✓」
**初始内容生成时机：**
- [ ] 每次从步骤3「下一步」进入步骤4时，若编辑器内容为空（首次进入），自动生成预填内容
- [ ] 若编辑器已有内容（用户从步骤4返回步骤3再回来），**不重新生成**，保留用户已编辑内容
### 实现提示
- 富文本编辑器：优先复用 MailBuilderTab 已有方案（`contenteditable` + `execCommand` 或 Quill），保持风格统一
- `MailService.sendMail()` 已支持 `to`/`cc`/`subject`/`body`，直接调用即可
- 「发送到 Outlook」按钮样式复用 `hha-smart-btn-primary`（与其他内置模板保持一致）
---
## 文件清单
| 操作 | 文件路径 |
|---|---|
| 新建 | `src/js/services/builtin/EmploymentActivationTemplate.ts` |
| 修改 | `src/js/services/HhaSearchService.ts`（新增 `parseAideRows`、`parsePatientRows`） |
| 修改 | `src/js/tabs/MailBuilderTab.ts`（注册新入口卡片） |
| 修改 | `docs/stories/epic-16-builtin-templates.md`（更新 Story 索引） |
---
## Dev Agent Record
### 实现计划执行情况

**实现日期：** 2026-04-12  
**开发者：** Amelia (Dev Agent)  

**完成内容：**

1. **`HhaSearchService.ts` 扩展（16.4b AC — `parseAideRows` / `parsePatientRows`）**
   - 新增 `AideRecord` / `PatientRecord` interface 导出
   - `parseAideRows(rawHtml)`: 动态解析 `<thead>` 列标题定位列索引，提取姓名、CaregiverCode（正则匹配 `[A-Z]{2,5}-\d+`）、lastName/firstName、DOB、Phone、Discipline、Status；静默跳过空行
   - `parsePatientRows(rawHtml)`: 同样动态列索引，提取姓名、patientId、admissionId、DOB、Status、Phone；静默跳过空行

2. **`EmploymentActivationTemplate.ts` 新建（16.4a/b/c/d/e 全量实现）**
   - `renderEntryCard()`: 入口卡片，无页面限制，始终可点击
   - `openModal()`: 向导 Modal 960×760，半透明遮罩，`isDirty` 脏状态检测，`×` 关闭 + 遮罩点击关闭均走 `tryClose()` 确认流
   - 步骤条：4步，done/active/未到达三态，done 步骤可点击跳回
   - 摘要栏：步骤≥2时显示，每块可点击跳回，步骤≥3/4时累加显示
   - 16.4b: `renderSearchStep()` — 姓/名/电话/ID 4字段（+Aide专属 SSN，Patient专属 PatientID/Medicaid），Clear 按钮，Enter 触发，搜索中 spinner，已选栏持久显示
   - 16.4b: `renderResultCards()` — 三行卡片（第三行显示 SSN/Team/Type/Alt code 或 PatientID/StartDate/Contract/Location 等辅助信息），首字母头像（6色哈希），Status Badge 三档色，选中高亮 + 保持跨搜索
   - 16.4c: `renderDateStep()` — 今天/明天快捷按钮，原生 `<input type="date">`，MM/DD/YYYY 内部存储转换
   - 16.4d: `openManageGroupsModal()` — 480px 管理弹窗，CRUD，Accordion 内联编辑表单，inline 删除确认，10组上限，GM_getValue/GM_setValue 持久化
   - 16.4e: `renderPreviewStep()` — 收件组 chip 选择，**To/CC 可编辑输入框**（允许用户在发送前临时修改地址），subject 单行输入，`contenteditable` 正文编辑器，跨 rerender 内容保留，无收件组警告确认，`MailService.sendMailTask()` 发送，发送后 Toast
   - CSS: 700+ 行内联 `<style>` 一次性注入，无外部依赖

3. **`MailBuilderTab.ts` 修改（注册入口卡片）**
   - import `EmploymentActivationTemplate`
   - `employmentActivationTemplate` 私有成员
   - `renderTemplateList()` 内置 Tab 末尾追加 `employmentActivationTemplate.renderEntryCard(list)`

**构建验证：** `npx tsc --noEmit` 无错误；`npm run build` exit:0，5 warnings（均为项目原有 warning）

### 与 Story 规格的偏差记录

| 条目 | 规格 | 实际实现 | 原因 |
|---|---|---|---|
| Modal 最小高度 | `min-height: 680px` | `min-height: 760px` | 步骤1/2的搜索区 + 三行卡片需要更多空间，实测 680px 会出现结果列表过矮的问题 |
| Modal 标题 | 「雇佣激活请求」 | 「护理激活请求」 | 更直观，与入口卡片名（Employment Activation Request）语义对应 |
| 摘要栏「患者」 | 「患者：」 | 「病人：」 | 与 HHA 系统界面用词一致 |
| 搜索字段（Aide） | 姓/名/电话/ID 共 4 个 | +额外一行：SSN | 支持按 SSN 搜索的高频需求 |
| 搜索字段（Patient） | 姓/名/电话/ID 共 4 个 | +额外一行：PatientID、Medicaid ID | 支持按患者 ID 和 Medicaid 搜索 |
| 结果卡片布局 | 双行 | 三行（第三行显示辅助信息） | 第三行展示 SSN/Team/Type/Alt code（Aide）或 PatientID/StartDate/Contract/Location/Branch（Patient），供核对身份 |
| Patient 卡片第二行 | DOB / Admission ID / Phone | +Coordinators 字段 | Coordinators 是日常核对常用信息 |
| To / CC 展示方式 | 只读展示，不可编辑 | **可编辑输入框** | 允许用户在不改收件组配置的前提下临时调整发送地址 |
| 正文预填格式 | 全大写英文规范 | 首字母大写英文（可读性更好）| 全大写在 Outlook 显示较突兀，实际邮件发送后与收件人沟通时首字母大写更常见 |
| 发送按钮文字 | 「发送到 Outlook」 | 「Outlook」（带 ▶ 前缀） | Footer 空间有限，文字截断；图标+短文字更清晰 |
| WizardState 字段 | 5个字段 | +`bodyHtml`, +`skipBodySave` | 修复收件组切换时正文被 `renderBody()` 覆盖的 Bug（见 TD-007） |

### 修复记录
（Bug 修复详情见 [TD-007](../technical-debt/TD-007-epic16-builtin-templates-bugfixes.md)）
