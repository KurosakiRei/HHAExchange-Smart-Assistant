# ADR-021: Incident 一次性自动填表（Hospitalization/Fall/Death）与邮件/Fax 生成架构

## 状态
Accepted (2026-06-02)

## 背景

Issue #19 目标明确：

1. 新增对 Hospitalization / Fall / Death 三类官方 Link 的自动填写。
2. 在同一流程内生成邮件与 Fax 内容。
3. 必须复刻官方 Microsoft Forms 的全部问题与子问题（含条件分支）。

讨论与实测还给出了三个关键事实：

1. 当前业务是高频一次性上报，不是长周期草稿编辑。
2. 用户更偏好在浮动面板 Mail Tab 完成输入，不希望把入口强绑到病人 Profile 主页面。
3. 绝对禁止自动点击 Submit（硬约束）。

此外，通过实时页面逆向（Chrome DevTools MCP）确认：

1. 三个官方 Form 的问题树是运行时动态展开，不能只靠静态 HTML。
2. Hospitalization 与 Fall 都存在多层条件分支；分支行为需要按“实际运行表现”复刻，而非按文案猜测。

---

## 决策

### D1：采用 One-shot 会话模型，不引入重型 draftId 持久层

选定：

1. 流程以“一次完成”为主，状态保存在当前浮动面板会话内。
2. 支持从患者资料一键重新预填，不实现多草稿列表、草稿审批、草稿回放。

原因：

1. 与实际工作流一致，减少心智负担。
2. 显著降低实现复杂度与维护成本。

### D2：入口放在浮动面板 Mail Tab，不强制放在 Patient Profile

选定：

1. 在 Mail Tab 增加 Incident Composer（Hospitalization / Fall / Death 三合一）。
2. 可从当前上下文读取患者信息并预填。

原因：

1. 面板入口更轻，符合“快速上报+快速生成邮件/Fax”。
2. 避免在 Profile 页面持续扩张按钮与弹窗密度。

### D3：使用“Form Schema + Branch Rules”引擎复刻官方问题树

选定：

1. 三类表单统一抽象为 schema（字段定义、必填规则、选项集、显示条件）。
2. 运行时由规则引擎根据用户选择动态计算“当前应显示字段 + 必填校验”。

原因：

1. 可精确复刻官方子问题逻辑。
2. 后续官方问题变更时，只需改 schema/rules，避免散落在 UI 代码中的硬编码判断。

### D4：No-submit Guard 作为系统级硬护栏

选定：

1. 自动化仅允许“填充字段 + 跳转到提交前状态”，禁止触发 Submit 点击。
2. 若检测到目标元素语义为 Submit（按钮文本、aria-label、type=submit 等），直接拦截。
3. 执行结束给出明确提示：请人工复核后手动提交。

原因：

1. 满足明确业务红线。
2. 兼顾自动化效率与合规可控性。

### D5：邮件与 Fax 基于同一 Incident Payload 生成

选定：

1. Form 填写数据、邮件模板数据、Fax 模板数据共享同一 payload。
2. 邮件、Fax、（必要时）General Notes 从同源数据渲染，避免多处重复录入。

原因：

1. 避免字段不一致。
2. 降低二次编辑错误率。

### D6：按官方运行时行为复刻分支，不做“文案推断优化”

选定：

1. 以实际运行表现作为唯一真值，即使某些分支触发与文案直觉不一致，也按实测实现。

原因：

1. 目标是“复刻官方 Form”，不是“重设计官方 Form”。

---

## 官方问题树复刻规格（实测基线）

### A. Death Form（Patient Death Questionnaire）

固定主问题：

1. Patient name
2. Admission ID
3. Patient DOB
4. Who reported the death of the patient?
5. What is the title of the person who reported death?
6. Services Patient received?
7. Contract / Vendor

分支规则：

1. 未发现额外条件子题。
2. “Other answer”仅为该题内联输入，不引出新问题。

关键选项：

1. Q5 标题：HHA / PCA / HCSS, Family members, Other answer。
2. Q6 服务：HHA / PCA, HCSS, TBI。
3. Q7 Vendor 下拉：43 项（含 Other）。

### B. Fall / Accident Form

基础问题（所有服务类型）：

1. Type of Accident
2. Admission ID
3. Vendor / Contact Name
4. Patient name
5. Services Patient received

Type of Accident 选项：

1. Bruises / Cuts
2. Car Accident
3. Trip / Fall
4. Fire / Burns
5. Patient Abuse / Physical Violence
6. Poisoning
7. Pressure ulcer / Wound
8. Other answer

服务分支：

1. 服务=HHA 或 PCA：直接进入通用后续题。
2. 服务=NHTD / TBI Waiver Program：先插入两题：
3. NHTD / TBI Case（多选）
4. Specify the date and time you reported hospitalization to the personnel listed above.

通用后续题：

1. Who reported emergency?
2. Title of person who reported emergency
3. Date of Fall / Accident
4. Time of Fall / Accident
5. Was 911 dialed?
6. Was it during service hours?

条件子题：

1. Was 911 dialed=Yes -> 新增 Who called 911。
2. Was 911 dialed=No/Unknown -> 不显示 Who called 911。
3. Was it during service hours=Yes -> 新增：
4. Caregiver Name & Caregiver Code
5. Where was the aide during the accident and what was the aide doing?
6. Was it during service hours=No -> 不显示上述两题。

无论 Yes/No 最终都出现：

1. What was the patient doing at the time of fall
2. Did the area where the fall occurred have adequate lighting?
3. Was the patient wearing NON-Slippery footwear?
4. Did the patient use any assistive devices (walker, wheelchair, cane, etc.)?

### C. Hospitalization Form（Patients Hospitalization Tracker）

Page 1（Initial Information）：

1. Patient Name
2. Patient DOB
3. Admission ID
4. Patient Services (HHA, PCA, HCSS)
5. Contract（受服务类型分支）

服务分支（Page 1）：

1. 服务=HHA/PCA -> Q5 为 Vendor / Contract（41项下拉）。
2. 服务=HCSS (NHTD / TBI) -> Q5 变为 NHTD / TBI Contract（2项：NHTD Waiver Service, TBI WAIVER）。

HCSS 专属中间页：

1. NHTD / TBI Case（多选）
2. Specify the date and time you reported hospitalization to the personnel listed above.
3. 该页未完成必填时不可进入下一页。

Details 页基础题：

1. Date of Hospitalization
2. Time of Hospitalization or Time of 911 Called
3. Hospital Name（69项下拉）
4. During Service Hours?
5. Reason For Hospitalization
6. Source Of Information
7. Name who report hospitalization
8. Notes

Reason For Hospitalization（29项）条件分支：

1. Infections -> 额外出现：
2. Type of Infection
3. Infection - Details
4. Planned Hospitalization / Respiratory Distress / Trauma / Injury / Unwell (Malaise) / Wound -> 额外出现：
5. Accident（多行文本）
6. 其余 reason -> 不出现上述额外题。

补充行为（官方运行表现）：

1. 选择 Reason 的 Other answer 但未填文本时，后续 Source/Name/Notes 会临时不显示。
2. 填写 Other 文本后，后续题恢复显示。

Type of Infection 选项：

1. COVID-19
2. Pneumonia
3. Respiratory Infection (any, but not Pneumonia )
4. UTI
5. Skin/Wound
6. Other answer

Source Of Information 选项：

1. Family, Friends, Client Emergency Contact
2. Vendor
3. Social Worker, Hospital Employee
4. Caregiver (PCA, HHA, HCSS)
5. Other answer

---

## 数据模型决策

统一 Incident Payload（建议）：

1. incidentType: hospitalization | fall | death
2. patient: name, dob, admissionId, serviceType, vendorOrContract
3. reporter: name, title, source
4. timeline: eventDate, eventTime, reportDateTime
5. hospitalization: reason, infectionType, infectionDetails, accidentDetails, hospitalName, duringServiceHours
6. fall: accidentType, was911Dialed, whoCalled911, duringServiceHours, caregiverInfo, aideWhereabouts, environmentAndAssistiveAnswers
7. death: reportTitle, servicesReceived
8. notes: freeText
9. generated: emailDraft, faxDraft
10. safety: noSubmitGuardTriggered, blockedActions

---

## 后果

### 正面影响

1. 与真实工作流一致，输入和发送链路更短。
2. 三类事件共享模型，邮件/Fax 文本一致性更高。
3. 对官方分支变化具备可维护性（schema/rules 可调整）。
4. 强制 no-submit，降低自动化误提交风险。

### 负面影响 / 风险

1. 官方 Form 一旦改版（字段名/分支变化）会导致映射失配。
2. 需要维护较大的下拉选项与条件矩阵。
3. One-shot 模型下，页面刷新会丢失会话。

### 风险缓解

1. 加入“Schema 版本戳 + 运行时巡检”机制，发现字段失配时快速告警。
2. 建立分支覆盖测试矩阵（尤其 Hospitalization Infections 与 Fall 911/service-hours 组合）。
3. 提供“从患者资料重新预填”作为快速恢复。

---

## 非目标

1. 不自动点击官方 Form Submit。
2. 不实现复杂草稿管理（草稿列表、跨天恢复、多人协作编辑）。
3. 不重设计官方问题结构，仅按官方行为复刻。

---

## 相关文档

1. Epic 23（本 ADR 对应实施拆分）
2. Issue #19
