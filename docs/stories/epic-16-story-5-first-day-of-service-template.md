# Epic 16 Story 5: First Day of Service 内置模板（Patient页面专用）

## Epic 概述

| 属性 | 值 |
|---|---|
| **Epic ID** | EPIC-016 |
| **Story ID** | STORY-16-5 |
| **标题** | First Day of Service 内置模板（轻引导变量 + 预览编辑 + Outlook 发送） |
| **优先级** | P1 |
| **状态** | ✅ done（已实现并手工验证通过） |
| **关联系统** | MailBuilderTab, ProfileDataExtractor, MailService, 内置模板体系 |
| **依赖 Epic** | Epic 12（Mail Builder）, Epic 16（Built-in Templates）, Epic 19（Date Composer） |
| **ADR** | ADR-022 |
| **关联 Issue** | #27 |

## 背景

当前业务中，Coordinator 发送 First Day of Service 邮件仍需手工拼装收件人、抄送、主题、正文，效率低且一致性差。该场景具有明显标准化特征：

1. To/CC 固定。
2. 变量很少且稳定（服务开始日期、保险名）。
3. 仅在 Patient Profile 场景有效。
4. 需要发送前可预览并允许小幅修改。

因此该能力应以“内置模板”而不是“自定义模板”交付，降低操作路径并减少格式偏差。

---

## 目标

在邮件助手的“内置模板”中新增 First Day of Service 入口，点击后弹出与现有脚本 UI 风格一致的 modal，完成以下流程：

1. 顶部选择变量（服务开始日期、保险来源/保险值）。
2. 中部预览并可编辑 To/CC/Subject/正文（富文本）。
3. 底部仅保留一个 Outlook 按钮发送到现有跨 Tab 队列。

---

## 非目标

1. 不支持在 Patient Profile 之外页面使用。
2. 不开放 To/CC 模板配置（本模板 To/CC 固定）。
3. 不引入自动提交 Outlook（仍只创建草稿/填写）。
4. 不引入新的浏览器原生对话框交互（禁止 alert/confirm/prompt）。

---

## 关键业务规则

### 固定收件人

1. **To（固定）**：`"RNs Coordinators" <Nursing@AlwaysNY.net>`
2. **CC（固定）**：
3. `"Reggie Thomas (Chief Operations Officer)" <rthomas@AlwaysNY.net>`
4. `"Ada Wu" <DWu@AlwaysNY.net>`
5. `"Tracy Vuong" <TVuong@AlwaysNY.net>`
6. `"Intake" <intake@AlwaysNY.net>`

### 变量

1. 服务开始日期（用户选择，必填）。
2. 保险公司名（自动检测或手动指定）。

### 主题与正文

1. 主题中仅“服务开始日期”为用户选择变量。
2. 正文变量仅包含“保险公司名”和“服务开始日期”。
3. 变量变更后，预填内容实时更新（用户已手改内容时需防止强覆盖，见 Story 16-5.4）。

---

## UX / 交互硬约束

1. **UI 风格必须与现有 userscript 风格一致**，优先复用现有邮件模板 modal 视觉体系。
2. **关闭弹窗仅允许右上角 X 入口触发**。
3. **关闭弹窗必须二次确认**。
4. **二次确认必须复用项目现有自定义确认弹窗样式与实现路径**。
5. **严禁使用浏览器原生 `alert` / `confirm` / `prompt`**。
6. 点击遮罩层、按 Esc 均不得触发关闭行为。

---

## 用户流程

1. 用户在 Patient Profile 页面打开“邮件助手”。
2. 在“内置模板”点击 First Day of Service 卡片。
3. 顶部变量区选择服务开始日期。
4. 系统自动读取授权中的保险：
5. 若仅 1 个，自动选中；
6. 若多个，展示检测结果供用户手选；
7. 用户可切换到“全量保险”下拉手动覆盖。
8. 中部预览区显示 To/CC/Subject/正文并允许编辑。
9. 用户点击右下角唯一按钮“Outlook”。
10. 系统通过 `MailService` 投递邮件任务。

---

## Stories

### Story 16-5.1：入口卡片与页面限制

**作为** Coordinator，
**我希望** 在内置模板中看到 First Day of Service 入口，并且仅在 Patient Profile 可用，
**以便** 在正确场景快速发信。

#### 验收标准

1. 在“内置模板”区域新增入口卡片：First Day of Service。
2. 卡片标签显示“内置”和“Patient页面”。
3. 非 Patient Profile 页面时卡片置灰、不可点击，并有提示文案。
4. Patient Profile 页面时卡片可点击，打开模板 modal。

---

### Story 16-5.2：变量区（服务开始日期 + 保险来源模式）

**作为** Coordinator，
**我希望** 在弹窗顶部先选变量，
**以便** 快速驱动后续主题与正文生成。

#### 验收标准

1. 弹窗顶部有“变量区”，位于预览区上方。
2. 服务开始日期为必填。
3. 日期选择器复用项目已有日期输入能力（样式与交互与现有脚本一致）。
4. 保险来源支持两种模式：
5. 自动检测（来自 Patient Profile 授权）。
6. 手动选择（全量保险列表）。
7. 自动检测到多个保险时，必须展示可选列表让用户明确选择。
8. 用户可随时切换到“全量保险”下拉覆盖自动结果。

#### 保险数据来源规则

1. 检测列表来源：`ProfileDataExtractor.extract().insurances`。
2. 全量列表来源：页面 `#ctl00_ContentPlaceHolder1_uxDdlSource` 的全部 `option`。
3. 若页面无法读取该下拉，使用 issue #27 中提供的全量快照作为 fallback。
4. 全量列表必须保留原始 value/label（含 `All` 与 `Undefined`）。

---

### Story 16-5.3：预览区布局与编辑能力

**作为** Coordinator，
**我希望** 在一个统一预览区中看到并修改邮件最终内容，
**以便** 发送前完成最后校对。

#### 验收标准

1. 预览区布局顺序固定为：To -> CC -> Subject -> 正文富文本编辑器。
2. To 与 CC 默认预填固定收件人内容。
3. Subject 默认预填，可编辑。
4. 正文使用与“每日报告”一致的富文本编辑器交互（工具条 + contenteditable 方案）。
5. 底部 Footer 右下角仅保留一个按钮：`Outlook`。
6. Footer 不显示其他发送或关闭按钮。

---

### Story 16-5.4：变量绑定与内容生成

**作为** Coordinator，
**我希望** 变量变化后内容自动更新，
**以便** 减少手改错误。

#### 验收标准

1. 默认 Subject 格式：`PT: {patient_name} {patient_id} - First Day of Service - {service_start_date}`。
2. 默认正文模板：

```text
Hello,

The first day of PCA service under {insurance_name} for the patient will be {service_start_date}.
```

3. 正文中的动态变量仅 `{insurance_name}` 与 `{service_start_date}`。
4. Subject/正文在变量变更时实时刷新。
5. 若用户已手动编辑正文，后续变量变更不得粗暴覆盖已编辑内容；需采用“仅在未手改状态自动刷新”的保护策略。

---

### Story 16-5.5：关闭行为与二次确认（强约束）

**作为** 用户，
**我希望** 关闭操作可控且安全，
**以便** 避免误关导致内容丢失。

#### 验收标准

1. 只有点击右上角 `X` 才触发“关闭流程”。
2. 点击遮罩层不关闭 modal。
3. 按 Esc 不关闭 modal。
4. 点击 X 后必须弹出二次确认。
5. 二次确认必须复用现有项目自定义确认弹窗（同视觉、同组件/样式体系）。
6. 不允许使用 `alert` / `confirm` / `prompt`。
7. 用户确认关闭后清理本次会话输入并退出 modal。
8. 用户取消关闭后保留所有当前输入。

---

### Story 16-5.6：Outlook 发送链路

**作为** 用户，
**我希望** 点击一次 Outlook 即可把内容带到 Outlook 草稿，
**以便** 快速完成邮件发送。

#### 验收标准

1. 点击 Outlook 按钮后调用 `MailService.sendMailTask()`。
2. 发送 payload 包含：to, cc, subject, body。
3. 与既有 OutlookAdapter 兼容，不新增专用发送通道。
4. 异常场景使用现有 toast 风格提示，不使用原生弹窗。

---

### Story 16-5.7：回归与验收测试

**作为** 团队，
**我希望** 对关键路径有可执行回归清单，
**以便** 降低对已有模板和 Outlook 的回归风险。

#### 验收标准

1. 页面限制验证：仅 Patient Profile 可用。
2. 多保险场景验证：自动检测 >1 时可切换且可手动覆盖。
3. 全量保险场景验证：可读取并选择完整列表。
4. 变量联动验证：日期/保险变更可正确反映到 Subject/正文。
5. 关闭约束验证：
6. 仅 X 可触发关闭流程。
7. 遮罩/Esc 不关闭。
8. 二次确认为自定义弹窗且非浏览器原生弹窗。
9. Outlook 投递验证：任务写入成功，Outlook 端可消费。
10. 构建验证：`npm run build` 通过，无新增 TypeScript 错误。

---

## 文件清单（规划）

| 操作 | 文件路径 |
|---|---|
| 新建 | `src/js/services/builtin/FirstDayOfServiceTemplate.ts` |
| 新建 | `src/js/services/builtin/FirstDayInsuranceFallback.ts` |
| 修改 | `src/js/tabs/MailBuilderTab.ts` |
| 修改 | `src/style/mail-builder-tab.less` |
| 文档 | `docs/stories/epic-16-story-5-first-day-of-service-template.md` |
| 文档 | `docs/adr/022-first-day-of-service-template-modal.md` |

---

## 风险与缓解

| 风险 | 说明 | 缓解 |
|---|---|---|
| 保险列表漂移 | 页面 option 可能变化 | 优先动态读取，失败回退快照；定期同步快照 |
| 变量覆盖用户输入 | 自动联动可能覆盖手改正文 | 引入正文脏状态保护 |
| 关闭误触 | 背景点击导致数据丢失 | 仅 X 触发关闭，强制二次确认 |
| UI 风格回归 | 新 modal 风格偏离脚本体系 | 复用现有 modal class 和设计 token |
