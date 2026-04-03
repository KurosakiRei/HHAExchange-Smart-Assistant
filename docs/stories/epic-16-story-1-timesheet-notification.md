# Epic 16, Story 1: Timesheet 提交通知内置模板

## Story 元数据

| 属性           | 值                                                               |
| -------------- | ---------------------------------------------------------------- |
| **Story ID**   | EPIC-016-STORY-001                                               |
| **标题**       | Timesheet 提交通知 — 内置 Prebilling 邮件模板                   |
| **优先级**     | P1 - 高                                                          |
| **状态**       | 📝 计划中                                                        |
| **预估工作量** | 6-8 Story Points                                                 |
| **目标页面**   | `PrebillingReportInternal_ns.aspx`（Prebilling Review）          |
| **关联 Epic**  | Epic 16（内置模板体系）、Epic 12（Mail Builder 基础框架）        |
| **依赖服务**   | `PrebillingTableParser`, `PageDetector`, `MailService`, `MailBuilderTab` |

---

## 用户故事

**作为** 脚本用户  
**我希望** 在邮件助手的"内置模板"区域看到"Timesheet 提交"入口卡片，点击后弹出 Prebilling 访问列表  
**以便** 快速选择对应 visit 并一键将 Timesheet 通知邮件发送到 Outlook，无需手动复制病人信息  

---

## 业务背景

Coordinator 在提交每个病人的 Timesheet 时，需要给固定收件人发送一封格式统一的通知邮件，邮件内容只有正文固定，标题需要嵌入病人姓名、Admission ID 与访问日期。目前此操作是手动完成的（从页面复制信息 → 手写邮件），此内置模板将整个流程缩减为"选 visit → 点按钮"两步。

---

## UI 规格

### 1. 入口卡片（MailBuilderTab 内置模板 Tab）

- 卡片标题：**Timesheet 提交**
- 卡片描述：`📋 从 Prebilling 列表选择并一键发送 Timesheet 通知`
- 必须显示页面 Tag：**`Prebilling页面`**
- **页面检测规则**（`PageDetector.getCurrentPageType()`）：
  - 当前页面类型 = `"PREBILLING"` → 卡片**可点击**，正常样式
  - 其他页面类型 → 卡片**置灰**，`pointer-events: none`，鼠标 hover 显示 tooltip：`"请先导航到 Prebilling Review 页面"`

### 2. Modal（点击卡片后弹出）

Modal 标题：**HHAexchange Smart Assistant**（与品牌标准一致）

#### 2a. 顶部配置区

```
Recipient Name: [ Enter Name          ]    To: [ Enter Address       ]   [ 保存配置 ]
                                           CC: [ Enter CC Address    ]
```

- **Recipient Name**：初次加载默认值 `Mariana`
- **To**：初次加载默认值 `Mzlotar@AlwaysNY.net`
- **CC**：初次加载默认值 `""`（空）
- **多地址输入**：To 和 CC 支持用户用 `,` 或 `;` 分隔输入多个邮件地址（与"编辑模板"保持一致）
- **"保存配置"按钮 Dirty State**：
  - 初始加载成功读取已保存值（或默认值）后，按钮**禁用**（灰色）
  - 任意字段与已保存值不同时，按钮**启用**
  - 点击保存后，立即将三个字段写入 `GM_setValue`，按钮重新禁用

#### 2b. Visit 列表区

```
📅 SELECT SCHEDULED SESSIONS          [ 🔍 Patient Name 或 Admission ID ]

┌──────────────────────────────────────────────────────────────────────┐
│  LIN GUOZHENG | AHC-908687                        [ ▶ Send to Outlook ] │
│  📅 03/24/2026  🕐 0700-1500                                         │
├──────────────────────────────────────────────────────────────────────┤
│  ZHENG BIQING | AHC-908874                        [ ▶ Send to Outlook ] │
│  📅 04/02/2026  🕐 1700-2200                                         │
└──────────────────────────────────────────────────────────────────────┘
```

- **无复选框**，每行右侧一个 "Send to Outlook" 按钮
- 列表显示**全部 visit 行**（不过滤 POC），来源：`PrebillingTableParser.parseAllRows()`
- 每行显示字段：Patient Name、Admission ID、Visit Date、Scheduled Time
- **搜索框**：模糊匹配 Patient Name 或 Admission ID，大小写不敏感
  - 搜索词在轮询刷新后**保留**，重新对刷新后的数据计算过滤并渲染

#### 2c. 页面未就绪时的 Modal 状态（防御性处理）

若用户通过极端操作在非 Prebilling 页面打开了 Modal（理论上不应发生，入口已置灰），列表区域显示：

```
⚠️ 请先导航到 Prebilling Review 页面
```

---

## 邮件构成规格

| 字段    | 内容                                                                              |
| ------- | --------------------------------------------------------------------------------- |
| **To**  | 从 GM 读取的 `to` 配置值（多地址用逗号连接）                                     |
| **CC**  | 从 GM 读取的 `cc` 配置值（为空则不传 CC）                                        |
| **Subject** | `PT: {patientName} {admissionId} Timesheet for {visitDate}`                 |
| **Body**    | `Hello {recipientName},<br><br>Please see the attached. Let me know if there is any problem.` |

- `{patientName}`：Visit 行的 Patient 列文本
- `{admissionId}`：Visit 行的 Admission ID 列文本
- `{visitDate}`：Visit 行的 Visit Date 列文本（格式原样输出，如 `03/24/2026`）
- `{recipientName}`：从 GM 读取的 `recipientName` 配置值

---

## 未保存配置警告

当用户：
1. 修改了 Recipient Name / To / CC 任意字段
2. **未点击"保存配置"**
3. 直接点击某行的 "Send to Outlook"

系统弹出确认提示框：

> ⚠️ **检测到未保存的配置修改**  
> 将使用上一次保存的设置发送邮件。  
> [继续发送]  [取消]

- 点击"继续发送" → 使用 `GM_getValue` 中的旧值执行发送
- 点击"取消" → 关闭提示框，返回 Modal，用户可手动保存后重试

---

## 轮询机制

- 轮询**仅在 Modal 打开期间运行**，Modal 关闭时立即停止，调用同 `CleanerTab` 的 `clearInterval` 模式
- 轮询间隔：`5000ms`（与 `CleanerTab.POLLING_INTERVAL` 保持一致）
- 每次轮询：调用 `PrebillingTableParser.parseAllRows()` 获取最新列表
  - 列表数据更新后，保留当前搜索词，重新过滤并渲染 Visit 列表
  - 配置区字段**不受轮询影响**（不会被覆盖）

---

## 技术设计

### 新增：`PrebillingTableParser.parseAllRows()`

在 `PrebillingTableParser.ts` 中新增静态方法，复用已有的 iframe 搜索逻辑和表格定位逻辑，返回**所有有效行**（不做 POC 过滤）：

```typescript
/** 精简的 Visit 记录，用于 Timesheet 内置模板 */
export interface TimesheetRecord {
  patientName: string;
  admissionId: string;
  visitDate: string;
  scheduledTime: string;
}

/** 解析表格，返回所有行（不过滤 Problems 列） */
static async parseAllRows(): Promise<TimesheetRecord[]>
```

- 复用 `searchTableInAllFrames()` iframe 搜索逻辑
- 复用 `COLUMN_INDEX` 字段索引常量
- 跳过 `cells.length < COLUMN_INDEX.ACTIONS + 1` 的不完整行
- **不读取**也不检查 Problems 列

### 新增：`TimesheetNotificationTemplate.ts` 服务类

路径：`src/js/services/builtin/TimesheetNotificationTemplate.ts`

职责：
- 渲染入口卡片（含页面检测与置灰逻辑）
- 管理 Modal 生命周期（创建、打开、关闭）
- 管理轮询（Modal 开启时 start，关闭时 stop）
- 读写配置（`GM_getValue` / `GM_setValue`）
- 构建邮件内容并调用 `MailService.sendMail()`

**GM Storage Key**：`hha_builtin_timesheet_config`

**存储结构**：
```json
{
  "recipientName": "Mariana",
  "to": "Mzlotar@AlwaysNY.net",
  "cc": ""
}
```

### 修改：`MailBuilderTab.ts`

在渲染内置模板 Tab 内容时，实例化 `TimesheetNotificationTemplate` 并调用 `renderEntryCard(container)`。在 Tab 销毁（`destroy()`）时调用实例的 `destroy()` 方法。

### 修改：`BuiltinTemplates.ts`

在 `getBuiltinTemplates()` 函数的注释中标注"Timesheet 提交"模板已由 `TimesheetNotificationTemplate` 独立渲染（入口卡片模式），与 `MailTemplate[]` 驱动的自定义模板列表是不同的渲染路径，避免混淆。

---

## 验收标准

### 入口卡片

- [x] 在邮件助手的"内置模板"Tab 显示"Timesheet 提交"卡片
- [x] 卡片上显示 `Prebilling页面` Tag 标签
- [x] 当前页面为 Prebilling Review 时，卡片可点击
- [x] 当前页面不是 Prebilling Review 时，卡片置灰不可点击，hover 显示提示
- [x] 页面切换时（`PageDetector.onPageChange`）入口卡片状态实时更新

### Modal 配置区

- [x] 首次打开时预填默认值（Recipient Name: `Mariana`，To: `Mzlotar@AlwaysNY.net`，CC: 空）
- [x] 已有保存记录时，加载已保存值
- [x] "保存配置"按钮初始为禁用状态
- [x] 修改任意字段后，"保存配置"按钮变为启用
- [x] 恢复为已保存值后，按钮重新禁用
- [x] 点击"保存配置"成功写入 `GM_setValue`，按钮恢复禁用
- [x] To 和 CC 支持 `,` 和 `;` 分隔的多地址

### Visit 列表

- [x] Modal 打开时立即调用 `parseAllRows()` 渲染列表
- [x] 列表展示所有行（含无 POC 问题的 visit）
- [x] 每行显示：Patient Name | Admission ID、Visit Date、Scheduled Time
- [x] 每行右侧有 "Send to Outlook" 按钮
- [x] 搜索框可按 Patient Name 或 Admission ID 实时过滤
- [x] 轮询每 5s 刷新列表，搜索词在刷新后保留
- [x] Modal 关闭时停止轮询
- [x] Prebilling 页无数据时显示空状态提示

### 发送逻辑

- [x] 点击"Send to Outlook"时，从 `GM_getValue` 读取配置构建邮件
- [x] Subject 格式：`PT: {patientName} {admissionId} Timesheet for {visitDate}`
- [x] Body：`Hello {recipientName},<br><br>Please see the attached. Let me know if there is any problem.`
- [x] 有未保存的脏状态时，弹出警告确认框
- [x] 警告框点击"继续发送"使用旧保存值发送；点击"取消"返回 Modal
- [x] 发送成功后关闭 Modal（或显示成功提示，与 Epic 12 行为一致）

### 边界情况

- [x] Modal 在非 Prebilling 页面被意外打开时，列表区显示 `⚠️ 请先导航到 Prebilling Review 页面`
- [x] `parseAllRows()` 找不到表格时，列表显示空状态（不抛出未捕获异常）
- [x] CC 为空时，`MailService` 调用不传 CC 字段，不影响发送

---

## 文件变更清单

| 文件                                                         | 变更类型 | 说明                                    |
| ------------------------------------------------------------ | -------- | --------------------------------------- |
| `src/js/services/PrebillingTableParser.ts`                   | 修改     | 新增 `TimesheetRecord` 接口和 `parseAllRows()` 方法 |
| `src/js/services/builtin/TimesheetNotificationTemplate.ts`   | 新增     | 内置模板服务类（Modal、轮询、配置、发送） |
| `src/js/tabs/MailBuilderTab.ts`                              | 修改     | 内置模板 Tab 渲染时集成入口卡片          |
| `src/js/services/BuiltinTemplates.ts`                        | 修改     | 添加注释说明独立渲染路径                 |
