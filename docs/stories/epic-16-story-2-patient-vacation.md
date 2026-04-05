# Epic 16, Story 2: Patient Vacation 通知内置模板

## Story 元数据

| 属性           | 值                                                                               |
| -------------- | -------------------------------------------------------------------------------- |
| **Story ID**   | EPIC-016-STORY-002                                                               |
| **标题**       | Patient Vacation 通知 — 内置 Patient Profile 邮件模板                           |
| **优先级**     | P1 - 高                                                                          |
| **状态**       | ✅ 已完成（手动测试通过）                                                        |
| **预估工作量** | 8-10 Story Points                                                                |
| **目标页面**   | `InternalPatientInfo_ns.aspx`（Patient Profile）                                 |
| **关联 Epic**  | Epic 16（内置模板体系）、Epic 12（Mail Builder 基础框架）                        |
| **依赖服务**   | `PageDetector`, `MailService`, `MailBuilderTab`, `ApiParamProvider`（参考）      |

---

## 用户故事

**作为** 脚本用户  
**我希望** 在邮件助手的"内置模板"区域看到"Patient Vacation"入口卡片，点击后自动读取病人的 Vacation 日期范围及服务日信息，预填邮件内容，并支持发送到 Outlook 或复制  
**以便** 在病人添加 Vacation 后快速生成标准化的 Vacation 通知邮件，无需手动查找日期和撰写正文

---

## 业务背景

Coordinator 在病人去 Vacation 时，需要向固定收件人（Authorization、Billing、RN、Intake 等）发送一封格式统一的通知邮件，告知 vacation 日期范围、最后服务日及恢复服务日期。目前此流程完全手动（查 Calendar → 算日期 → 手写邮件），此内置模板将流程缩减为"点击卡片 → 确认预填内容 → 一键发送"。

典型使用场景：Coordinator 先在 Patient Profile 的 Vacation Tab 添加 vacation 记录，然后切换到邮件助手，点击 Patient Vacation 入口卡片，系统自动分析 Calendar/API 数据预填邮件，用户确认后发送。

---

## UI 规格

### 1. 入口卡片（MailBuilderTab 内置模板 Tab）

- 卡片标题：**Patient Vacation**
- 卡片描述：`🏖️ 自动分析 Calendar 并生成 Patient Vacation 通知邮件`
- 必须显示页面 Tag：**`Patient页面`**
- **页面检测规则**（`PageDetector.getCurrentPageType()`）：
  - 当前页面类型 = `"PATIENT_PROFILE"` → 卡片**可点击**，正常样式
  - 其他页面类型 → 卡片**置灰**，`pointer-events: none`，hover 显示 tooltip：`"请先导航到 Patient Profile 页面"`

### 2. Loading 蒙版（点击卡片后立即显示）

- 全屏半透明深色蒙版（`z-index` 高于 Modal）覆盖页面
- 居中显示旋转 spinner + 文字：`正在读取 Patient Vacation 数据...`
- **无关闭按钮**（防止中断数据获取）
- **超时时间：3 分钟（180000ms）**，超时后强制切换为完整 Modal
- 任何数据获取失败或超时 → 对应字段填入占位符 `[无法获取]`，并在 Modal 打开后通过 toast 提示用户

### 3. Modal（数据就绪后显示）

Modal 标题：**Patient Vacation 通知**，右上角 `×` 关闭按钮

#### 3a. 配置区（顶部）

```
To:  [ Authorizations@AlwaysNY.net; billingahc@AlwaysNY.net        ]
CC:  [ rthomas@AlwaysNY.net; TVuong@AlwaysNY.net; ...              ]
```

- To 和 CC 各一行，支持 `,` 或 `;` 分隔多地址
- 从 `GM_getValue("hha_builtin_patient_vacation_config")` 加载已保存配置
- 默认 To：`Authorizations@AlwaysNY.net,billingahc@AlwaysNY.net`
- 默认 CC：`rthomas@AlwaysNY.net,TVuong@AlwaysNY.net,Nursing@AlwaysNY.net,intake@AlwaysNY.net`
- **"保存配置"Dirty State**：任意字段与已保存值不同时按钮启用，点击保存后禁用

#### 3b. Subject 区

```
Subject: [ PT: ZHUO ZUJING AHC-907804 Vacation 04/06/2026 - 05/05/2026 ]
```

- 可编辑的单行 `<input>`，预填格式：`PT: {patientName} {admissionId} Vacation {vacationStart} - {vacationEnd}`
- 日期格式：`MM/DD/YYYY`

#### 3c. 正文富文本编辑器区

- 样式与"编辑模板"Modal 的富文本编辑器一致（B / I / U / S / 列表 / 链接 / 清除格式工具栏）
- 使用 `contenteditable` div 实现
- 预填内容：

```
Hello,

The patient will be on vacation from {vacationStart} to {vacationEnd}.
The last day of service will be {lastServiceDate} and the resumption of service will be {resumptionDate}.
```

- 四个日期占位符均替换为实际推算值（`MM/DD/YYYY` 格式），预填后可编辑

#### 3d. 底部操作区

```
[ 保存配置 ]          [ 复制正文 ▾ ]          [ ▶ Outlook ]
                           └─ 复制 Subject
```

- **保存配置**（左）：仅在配置 dirty 时可点击
- **复制正文 ▾**（中，Split Button）：
  - 主按钮：复制富文本编辑器当前 innerHTML（以当前预填/编辑后的内容为准）
  - 下拉项：`复制 Subject`（以 Subject input 当前内容为准）
- **▶ Outlook**（右）：将邮件任务推送到 Outlook Tab，收件人以已保存配置为准（未保存时弹出确认框，行为与 16.1 一致）

---

## 数据获取规格

### 数据来源层级

| 字段 | 数据来源 | 方法 |
|---|---|---|
| Patient Name | 主页面 `h1` 文本（去除尾部状态词如 "Active"） | DOM 读取 |
| Admission ID | 主页面 overview 区域 `StaticText "Admission ID"` 后的值 | DOM 读取 |
| Patient ID | URL 参数 `PatientId` | `URLSearchParams` |
| Vacation Start / End | `Calender.asmx/GetCalendarVacationInfo` API | `GM_fetch` |
| Last Day of Service | `Calender.asmx/GetCalendarVisitInfo`（vacation start 所在月） | `GM_fetch` |
| Resumption of Service | 优先：同月 visitInfo（vacation end 后第一条）；fallback：Master Week 推算 | `GM_fetch` |

### API 凭据获取（`PatientCalendarApiProvider`）

新建 `src/js/services/PatientCalendarApiProvider.ts`，实现以下逻辑：

```typescript
/** Calendar API 所需参数 */
interface CalendarApiParams {
  hhwsPath: string;   // e.g. "/HHAWSENT2603010000/"
  appName: string;
  appSecret: string;
  userID: string;
  patientID: string;
  officeID: string;
  vendorID: string;
  appVersion: string;
  version: string;
  minorVersion: string;
  callerInfo: string;
  providerApiUrl: string; // for Master Week
}
```

**获取策略（优先顺序）**：

1. **直接读 Calendar iframe**：检查 `document.getElementById('iframefrmRightSide')` 的 src 是否包含 `InternalPatientCalendarDetails_ns.aspx`，若是，则从 iframe 内 `InternalPatientCalendarObj` 和隐藏 input 读取所有参数（同步，最快）
2. **Fallback — GM_fetch Calendar 页**：若 iframe 不是 Calendar 页，用 `GM_fetch` 请求 `InternalPatientCalendarDetails_ns.aspx?PatientID={patientId}&dt={Date.now()}&office={officeId}` 并解析隐藏 input；`officeId` 从 URL 参数或页面 `hdnvendorID` 获取

### API 调用规格

所有 API 使用 `GM_fetch` 以 POST JSON 方式调用：

**GetCalendarVacationInfo**：
```
POST {hhwsPath}Calender.asmx/GetCalendarVacationInfo
Content-Type: application/json
Body: { appName, appSecret, userID, patientID, calendarMonth, calendarYear, appVersion, version, minorVersion, callerInfo }
Response: { "d": "{ \"PatientVacationInfo\": [{ \"PatientID\", \"StartDate\", \"EndDate\", \"CalenderStartDate\", \"CalenderEndDate\" }] }" }
```

**GetCalendarVisitInfo**：
```
POST {hhwsPath}Calender.asmx/GetCalendarVisitInfo
Response: { "d": "{ \"VisitInfo\": [{ \"VisitDate\": \"MM/DD/YYYY\", \"ScheduledTime\", ... }] }" }
```

**注意**：API 返回的 `d` 字段是 JSON 字符串，需二次 `JSON.parse`。

### Vacation 记录选取逻辑

1. 调用 `GetCalendarVacationInfo`，从返回 `PatientVacationInfo` 数组取**第一条**（最新）
2. 若第一条 `EndDate` < 今天 → 不阻止 Modal 打开，但 toast 提示：`⚠️ 检测到的 vacation 记录已过期（{EndDate}），请检查日期是否正确`
3. 若返回数组为空 → toast 提示 `⚠️ 未找到 vacation 记录，请先在 Vacation Tab 添加`，Subject 和 Body 日期字段填 `[无法获取]`

### Last Day of Service 推算

1. 调用 `GetCalendarVisitInfo(month=vacationStart.month, year=vacationStart.year)`
2. 过滤出所有 `VisitDate < vacationStartDate` 的记录
3. 按 `VisitDate` 降序取第一条 → Last Day of Service

若当月无 vacation 前 visit（vacation 从月首开始）：
1. 继续查上一个月：`GetCalendarVisitInfo(month=vacationStart.month - 1, year=...)`
2. 取返回结果最后一条（最大日期）

### Resumption of Service 推算

**策略一（直接从 VisitInfo 查找，短假期适用）**：
1. 调用 `GetCalendarVisitInfo(month=vacationEnd.month, year=vacationEnd.year)`
2. 过滤出 `VisitDate > vacationEndDate` 的记录
3. 按 `VisitDate` 升序取第一条 → Resumption
4. 若有结果，**直接使用**，无需执行策略二

**策略二（Master Week 推算，长假期 / 未来 visit 尚未生成时）**：
1. 若策略一返回空，`GM_fetch` 请求 `InternalPatientMasterWeekIFrame_ns.aspx?PatientID={id}`
2. 解析页面中 Master Week 表格（`body innerText` 包含 `Days:\nSat\tSun\t...\nHours:\t0800-1200\t0800-1200\t...` 格式）
3. 提取有排班（Hours 非空）的 day-of-week 集合，得到 `serviceDays: Set<number>`（0=Sun, 1=Mon...6=Sat）
4. 从 `vacationEndDate + 1 天` 开始，逐日检查 `dayOfWeek ∈ serviceDays`，第一个匹配日 → Resumption

若 Master Week 也无法解析 → Resumption 填 `[无法获取]`，触发 toast 提示。

---

## 邮件构成规格

| 字段 | 内容 |
|---|---|
| **To** | 从已保存配置读取（多地址逗号连接，与 16.1 一致） |
| **CC** | 从已保存配置读取（为空则不传 CC） |
| **Subject** | Modal 中 Subject input 的当前值（以用户最终编辑内容为准） |
| **Body** | Modal 中富文本编辑器的当前 innerHTML（以用户最终编辑内容为准） |

---

## Toast 规格

- **单例**：显示新 toast 前先移除已有 `.pv-toast`
- **停留时长**：`Math.max(3000, message.length * 60)` ms
- **样式**：固定在页面底部居中，复用 `mail-builder-tab.less` 的 toast 样式，新增 class `.pv-toast`
- **触发场景**：

| 场景 | 消息 | 类型 |
|---|---|---|
| Vacation 记录已过期 | `⚠️ 检测到的 vacation 记录已过期（{EndDate}），请检查日期是否正确` | warning |
| 未找到 vacation 记录 | `⚠️ 未找到 vacation 记录，请先在 Vacation Tab 添加` | warning |
| Last day of service 获取失败 | `⚠️ 无法推算最后服务日，请手动填写` | warning |
| Resumption 获取失败 | `⚠️ 无法推算 Resumption 日期，请手动填写` | warning |
| 多个字段失败（合并） | `⚠️ 以下字段无法自动获取，请手动填写：{字段列表}` | warning |
| 加载超时 | `⚠️ 数据获取超时（3分钟），部分字段可能需要手动填写` | warning |
| 保存配置成功 | `✅ 配置已保存` | success |
| 复制成功 | `✅ 已复制` | success |

**多字段合并规则**：加载完成时统一收集所有失败字段，若 ≥ 2 个字段失败，使用合并版 toast（一条 toast 显示所有问题），避免重叠。

---

## 未保存配置警告

与 Story 16.1 行为一致，当 To/CC 有 dirty 未保存状态时点击 "▶ Outlook"，弹出确认框：

> ⚠️ **检测到未保存的配置修改**  
> 将使用上一次保存的设置发送邮件。  
> [继续发送]  [取消]

---

## 技术设计

### 新增：`PatientCalendarApiProvider.ts`

路径：`src/js/services/PatientCalendarApiProvider.ts`

职责：
- 提供 Calendar API 所需的 `CalendarApiParams`
- 优先读 Calendar iframe，fallback `GM_fetch` Calendar 页面 HTML 解析

```typescript
export class PatientCalendarApiProvider {
  static async getParams(patientId: string): Promise<CalendarApiParams>
}
```

解析逻辑：
- iframe 方式：`document.getElementById('iframefrmRightSide')?.contentWindow?.InternalPatientCalendarObj`
- fetch 方式：解析 HTML 中 `id="hdnHHWSPath"`、`id="hdnAppSecret"`、`id="hdnUserID"`、`id="hdnvendorID"`、`id="hdnProviderPatientAPIUrl"` 等隐藏 input 的 `value`

### 新增：`PatientVacationTemplate.ts`

路径：`src/js/services/builtin/PatientVacationTemplate.ts`

职责：
- 渲染入口卡片（含 `PATIENT_PROFILE` 页面检测与置灰逻辑）
- 管理 Loading 蒙版生命周期（含 3 分钟超时）
- 并行调用所有 API，收集失败字段
- 管理 Modal 生命周期（富文本编辑器、Split Button、配置区 dirty 追踪）
- 读写配置（`GM_getValue` / `GM_setValue`）
- 构建邮件内容并调用 `MailService.sendMailTask()`

**GM Storage Key**：`hha_builtin_patient_vacation_config`

**存储结构**：
```json
{
  "to": "Authorizations@AlwaysNY.net,billingahc@AlwaysNY.net",
  "cc": "rthomas@AlwaysNY.net,TVuong@AlwaysNY.net,Nursing@AlwaysNY.net,intake@AlwaysNY.net"
}
```

### 修改：`PageDetector.ts`

新增 `PATIENT_PROFILE` 页面类型：

```typescript
export type PageType = "PREBILLING" | "CALL_MAINTENANCE" | "PATIENT_PROFILE" | "UNKNOWN";
```

在 `detectPageType()` 中新增：
```typescript
if (url.includes("InternalPatientInfo_ns.aspx")) {
  return "PATIENT_PROFILE";
}
```

在 `getPageDisplayName()` 中新增：
```typescript
case "PATIENT_PROFILE":
  return "Patient Profile";
```

### 修改：`MailBuilderTab.ts`

- import `PatientVacationTemplate`
- 添加 `private patientVacationTemplate: PatientVacationTemplate | null = null` 字段
- 在渲染内置模板 Tab 时实例化并调用 `renderEntryCard(container)`
- 在 `destroy()` 末尾调用 `patientVacationTemplate?.destroy()`

### 修改：`BuiltinTemplates.ts`

更新注释，标注 `Patient Vacation` 模板已由 `PatientVacationTemplate` 独立渲染。

### 修改：`mail-builder-tab.less`

新增 Patient Vacation Modal 专属样式：
- `.pv-modal`：Modal 容器，含 Subject input、富文本编辑器区、底部三按钮布局
- `.pv-rich-editor`：富文本编辑器（`contenteditable`）+ 工具栏样式，与"编辑模板"Modal 保持一致
- `.pv-split-btn`：Split Button 容器（主按钮 + chevron 下拉触发）
- `.pv-split-dropdown`：下拉菜单
- `.pv-loading-overlay`：Loading 蒙版样式（全屏，`backdrop-filter: blur(2px)`）
- `.pv-toast`：toast 样式（复用 `mail-builder-toast` 样式定义）

---

## 验收标准

### 入口卡片

- [x] 在邮件助手"内置模板"Tab 显示 "Patient Vacation" 卡片
- [x] 卡片显示 `Patient页面` Tag 标签
- [x] 在 `InternalPatientInfo_ns.aspx` 页面时卡片可点击
- [x] 在其他页面时卡片置灰不可点击，hover 显示 tooltip
- [x] 页面切换时卡片状态实时更新

### Loading 蒙版

- [x] 点击卡片立即显示 Loading 蒙版，无关闭按钮
- [x] Loading 期间无法关闭或操作
- [x] 所有 API 返回后 Loading 消失，Modal 出现
- [x] 超时 3 分钟后强制显示 Modal，并触发超时 toast

### 数据预填

- [x] Patient Name 正确从页面顶部 `h1` 提取（去除 "Active" 等状态词）
- [x] Admission ID 正确从 overview 区域提取
- [x] Subject 格式正确：`PT: {patientName} {admissionId} Vacation {start} - {end}`，日期为 `MM/DD/YYYY`
- [x] Body 正文四个日期均正确预填
- [x] Vacation 已过期时显示 warning toast，但不阻止 Modal 打开
- [x] 未找到 vacation 记录时显示 warning toast，日期字段填 `[无法获取]`
- [x] Last day of service 和 Resumption 无法获取时各自触发对应 toast 或合并 toast
- [x] 多字段失败时合并为单条 toast

### Modal 配置区

- [x] 首次打开预填默认收件人配置
- [x] 已有保存配置时加载保存值
- [x] "保存配置"按钮 dirty state 逻辑与 16.1 一致
- [x] To / CC 支持 `,` `;` 分隔多地址

### Subject / Body 编辑

- [x] Subject input 可自由编辑
- [x] 富文本编辑器工具栏 B / I / U / S / 列表 / 链接 / 清除格式 均可用
- [x] 编辑内容在发送/复制时以当前编辑后内容为准

### 复制按钮（Split Button）

- [x] 主按钮点击复制 Body 富文本编辑器 innerHTML，显示 "✅ 已复制" toast
- [x] 点击 chevron 展开下拉菜单
- [x] 下拉项 "复制 Subject" 复制 Subject input 当前值
- [x] 复制后下拉菜单自动关闭

### Outlook 发送

- [x] 点击 "▶ Outlook" 调用 `MailService.sendMailTask()`
- [x] To / CC 以已保存配置为准
- [x] Subject / Body 以 Modal 当前编辑内容为准
- [x] 有未保存 dirty 状态时弹出与 16.1 相同的确认框

### 边界情况

- [x] 在非 Patient Profile 页面极端情况下打开 Modal（理论上不会），显示 `⚠️ 请先导航到 Patient Profile 页面`
- [x] `PatientCalendarApiProvider.getParams()` 失败时优雅降级（对应字段填 `[无法获取]`），toast 提示
- [x] GM_fetch 网络错误时同上处理，不抛出未捕获异常
- [x] Vacation 跨月时正确处理（当月 visit 数据里找 last service + 翻月或 Master Week 找 resumption）

---

## 文件变更清单

| 文件 | 变更类型 | 说明 |
|---|---|---|
| `src/js/services/PageDetector.ts` | 修改 | 新增 `PATIENT_PROFILE` 类型及检测逻辑 |
| `src/js/services/PatientCalendarApiProvider.ts` | 新增 | Calendar API 参数获取服务 |
| `src/js/services/builtin/PatientVacationTemplate.ts` | 新增 | 内置模板主服务类 |
| `src/js/tabs/MailBuilderTab.ts` | 修改 | 注册 PatientVacationTemplate 入口卡片 |
| `src/js/services/BuiltinTemplates.ts` | 修改 | 更新注释说明独立渲染路径 |
| `src/style/mail-builder-tab.less` | 修改 | 新增 Patient Vacation Modal / Loading / Toast 样式 |
| `docs/stories/epic-16-builtin-templates.md` | 修改 | 更新 Story 索引，16.2 状态改为"计划中" |

---

## 任务列表 (Tasks/Subtasks)

### Task 1: 修改 PageDetector.ts — 新增 PATIENT_PROFILE 页面类型
- [x] 1.1 在 `PageType` 联合类型中添加 `"PATIENT_PROFILE"`
- [x] 1.2 在 `detectPageType()` 中添加 `InternalPatientInfo_ns.aspx` 检测逻辑
- [x] 1.3 在 `getPageDisplayName()` 中添加 `PATIENT_PROFILE` case

### Task 2: 新增 PatientCalendarApiProvider.ts
- [x] 2.1 定义 `CalendarApiParams` 接口
- [x] 2.2 实现 iframe 优先读取策略（读取 Calendar iframe 内 hidden inputs）
- [x] 2.3 实现 GM_fetch fallback 策略（请求 Calendar 页面 HTML 并解析 hidden inputs）

### Task 3: 新增 PatientVacationTemplate.ts（入口卡片 + Loading + Modal）
- [x] 3.1 实现 `renderEntryCard()` 含 PATIENT_PROFILE 页面检测与置灰逻辑
- [x] 3.2 实现 Loading 蒙版（全屏達盖，3 分钟超时，无关闭按鈕）
- [x] 3.3 从页面 DOM 提取 Patient Name、Admission ID、Patient ID
- [x] 3.4 调用 GetCalendarVacationInfo API，实现 vacation 记录选取逻辑（含过期/为空 toast）
- [x] 3.5 推算 Last Day of Service（同月 visit 查找 + 上月 fallback）
- [x] 3.6 推算 Resumption of Service（VisitInfo 直接查找策略一 + Master Week 策略二）
- [x] 3.7 实现 Modal（配置区 To/CC + Subject input + 富文本编辑器 + Split Button + Outlook 按鈕）
- [x] 3.8 实现配置保存 dirty state 追踪（GM_getValue/setValue）
- [x] 3.9 实现 toast 单例与多字段合并规则
- [x] 3.10 实现未保存配置确认框（▶ Outlook dirty 警告，与 16.1 行为一致）

### Task 4: 修改 MailBuilderTab.ts — 注册 PatientVacationTemplate
- [x] 4.1 import `PatientVacationTemplate`
- [x] 4.2 添加 `patientVacationTemplate` 私有字段，在内置模板 Tab 渲染时实例化并调用 `renderEntryCard`
- [x] 4.3 在 `destroy()` 末尾调用 `patientVacationTemplate?.destroy()`

### Task 5: 修改 BuiltinTemplates.ts — 更新注释
- [x] 5.1 在独立渲染路径说明注释中标注 Patient Vacation 模板已由 `PatientVacationTemplate` 独立渲染

### Task 6: 修改 mail-builder-tab.less — 新增 Patient Vacation 样式
- [x] 6.1 新增 `.pv-loading-overlay` Loading 蒙版样式
- [x] 6.2 新增 `.pv-modal` Modal 容器（Subject input + 编辑器区 + 底部三按鈕布局）
- [x] 6.3 新增 `.pv-rich-editor` 富文本编辑器 + 工具栏样式
- [x] 6.4 新增 `.pv-split-btn` 和 `.pv-split-dropdown` Split Button 样式
- [x] 6.5 新增 `.pv-toast` toast 样式（固定底部居中）

---

## Dev Agent 记录

### 实现计划

任务按 Task 1 → 6 顺序执行。PatientCalendarApiProvider 复用 ApiParamProvider 的 DOM 解析模式，从 Calendar iframe 或 HTML 提取参数。PatientVacationTemplate 参照 TimesheetNotificationTemplate 的模态框/配置/toast 模式实现。

### 完成备注

Task 1～6 全部完成，共新增/修改以下文件：

- `PageDetector.ts`：新增 `PATIENT_PROFILE` 类型和检测、显示名逻辑
- `PatientCalendarApiProvider.ts`：全新，iframe 优先 + GM_fetch fallback 获取 Calendar API 参数
- `PatientVacationTemplate.ts`：全新，完整实现入口卡片、Loading 蒙版、数据获取推算、Modal、Toast
- `MailBuilderTab.ts`：注册 `PatientVacationTemplate` 入口卡片 + destroy 清理
- `BuiltinTemplates.ts`：更新独立渲染路径注释
- `mail-builder-tab.less`：新增 Loading 蒙版、Modal、富文本编辑器、Split Button、toast 样式

---

## 变更日志

- 2026-04-05: Story 16.2 实现完成。新增 PatientCalendarApiProvider.ts 和 PatientVacationTemplate.ts；修改 PageDetector.ts (新增 PATIENT_PROFILE)、MailBuilderTab.ts (注册 PV 卡片)、BuiltinTemplates.ts (更新注释)、mail-builder-tab.less (新增 PV 样式)。状态更新为待审查。
- 2026-04-05: 手动测试通过，全部验收标准确认。修复 4 项问题：① toast 改为顶部显示；② 富文本编辑器 min-height 调整为 320px；③ 正文 HTML 格式修正，Outlook 中段落间距正确；④ Master Week 推算 Resumption 换用 DOMParser 表格解析，修复 innerText 未挂载 DOM 导致 serviceDays 为空的 bug。版本升级至 3.16.0，Story 状态更新为已完成。
