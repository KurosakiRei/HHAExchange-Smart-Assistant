# Epic 21: M11Q PDF 一键预填生成

## Epic 概述

| 属性 | 值 |
|---|---|
| **Epic ID** | EPIC-021 |
| **标题** | M11Q PDF 一键预填生成（M11Q Prefilled PDF Generation） |
| **优先级** | P1 |
| **状态** | 📝 draft |
| **关联系统** | MailBuilderTab, ProfileDataExtractor, Webpack assets, M11QPdfGenerator（新建）, M11QPdfModal（新建） |
| **依赖 Epic** | Epic 12（邮件助手 Tab 基础架构）、Epic 17（模板生成交互经验） |
| **ADR** | ADR-019 |

## 背景

用户需要在病人页面快速生成 M11Q 文档。目前流程中，姓名、DOB、传真号需要重复手工输入，容易出现错填与漏填。

目标是提供一个稳定入口（悬浮面板内）和最小交互（轻弹窗），让用户在 1 次操作内下载已预填关键字段的 PDF：

1. Patient Name
2. DOB（固定 `MM/DD/YYYY`）
3. Fax Number（内置可选 + 自定义可输）

考虑到现有 `M11Q FORM.pdf` 为静态 PDF（非 AcroForm），本 Epic 采用坐标绘制方式生成结果文件。

---

## 非目标

以下内容不在本 Epic 范围内：

1. 将 `M11Q FORM.pdf` 改造成可填写 AcroForm。
2. 引入后端服务进行 PDF 处理。
3. 在 HHA 原生页面 DOM 中额外插入入口按钮。
4. 批量生成多个病人的 M11Q。
5. 对超长姓名进行自动缩放或换行排版。

---

## 关键业务规则

1. 入口仅在病人页面可用：`PATIENT_INTERNAL` / `PATIENT_NS`。
2. 入口位于邮件助手 header 右侧动作区，按钮在 `当前页面：XX` 左侧。
3. 文件名固定：`PatientName AdmissionId M11Q.pdf`。
4. Name / DOB / Fax 均左对齐、固定字号。
5. Patient Name 单行渲染，不自动缩小，允许向右溢出。
6. DOB 输出固定为 `MM/DD/YYYY`。

内置传真号：

1. Main - 718-646-0680
2. Queens - 718-943-0902
3. Flushing - 718-353-2571
4. 8AV - 718-676-0957
5. Chinatown - 646-448-4353

首次默认：`8AV - 718-676-0957`。

---

## 目标用户流程

### 流程 A：病人页面一键下载 M11Q

1. 用户进入病人页面并打开悬浮面板 `邮件助手` Tab。
2. 在 header 右侧点击 `创建 M11Q PDF`。
3. 弹窗显示病人姓名、DOB 与传真设置区。
4. 用户可直接使用默认传真号，或切换为内置其他号码，或输入自定义号码。
5. 点击 `下载 PDF` 后获得预填完成文件。

### 流程 B：自定义传真号并记住

1. 用户在弹窗中切换至 `自定义传真号`。
2. 输入号码并保持 `记住下次默认选择` 勾选。
3. 本次下载后保存设置。
4. 下次打开弹窗时自动进入自定义模式并回填号码。

### 流程 C：用户不希望记忆上次选择

1. 用户取消勾选 `记住下次默认选择`。
2. 本次可正常下载。
3. 下次打开弹窗回退到首次默认值（8AV）。

---

## Story 21-1: PDF 基础能力接入（依赖 + 资源打包）

**作为** 构建系统，
**我需要** 支持浏览器端处理 PDF 模板，
**以便** 后续服务可直接读取内联模板并生成文件。

### 验收标准
- [ ] 安装并接入 `pdf-lib`（依赖版本写入 `package.json`）
- [ ] `webpack.config.base.cjs` 新增 `.pdf` 的 `asset/inline` 规则
- [ ] `src/typings.d.ts` 新增 `declare module '*.pdf'`
- [ ] `npm run build` 无新增错误

---

## Story 21-2: M11QPdfGenerator 服务（静态模板坐标绘制）

**作为** 系统，
**我需要** 一个专门的 PDF 生成服务，
**以便** 将 Name/DOB/Fax 写入模板并返回下载 Blob。

### 验收标准
- [ ] 新建 `src/js/services/M11QPdfGenerator.ts`
- [ ] 导出 `generate(params): Promise<Blob>`
- [ ] 导出 `download(blob, filename): void`
- [ ] 导出 `buildFilename(patientName, admissionId): string`
- [ ] 文件名格式为 `PatientName AdmissionId M11Q.pdf`
- [ ] 第 1 页写入 3 个字段：`name`、`dob`、`fax`
- [ ] 渲染规则：左对齐、固定字号
- [ ] `name` 单行不缩放，允许向右溢出
- [ ] `dob` 统一转换为 `MM/DD/YYYY`
- [ ] 坐标常量集中定义（不可散落在 UI 代码中）

---

## Story 21-3: 传真号配置模型与持久化

**作为** 用户，
**我需要** 内置号码 + 自定义号码 + 记忆偏好，
**以便** 快速复用最常用传真号。

### 验收标准
- [ ] 新建或扩展配置管理（建议 `M11QConfigService`，或在 Modal 内模块化实现）
- [ ] 持久化字段至少包含：`mode`、`builtinId`、`customFax`、`remember`
- [ ] 首次默认：`8AV - 718-676-0957`
- [ ] 内置号码列表与标签与需求一致
- [ ] `remember=true` 时恢复上次模式和值
- [ ] `remember=false` 时下次恢复默认 8AV
- [ ] 对自定义号码做基础清洗（去首尾空格）和非空校验

---

## Story 21-4: M11Q 生成弹窗（M11QPdfModal）

**作为** 用户，
**我需要** 在下载前快速确认字段并调整传真号，
**以便** 平衡“一键”与可控性。

### 验收标准
- [ ] 新建 `src/js/components/M11QPdfModal.ts`
- [ ] 复用现有项目弹窗视觉体系（`template-modal-*`）
- [ ] 只读显示：Patient Name、DOB
- [ ] 传真号区域提供：
  - [ ] 内置下拉
  - [ ] 自定义输入切换
  - [ ] `记住下次默认选择`（默认勾选）
- [ ] 按钮：`取消`、`下载 PDF`
- [ ] 点击 `下载 PDF` 调用 `M11QPdfGenerator` 完成生成与下载
- [ ] 在病人信息缺失时给出可理解错误提示，不生成空文件

---

## Story 21-5: MailBuilderTab Header 入口集成

**作为** 用户，
**我需要** 在邮件助手顶部固定看到 M11Q 入口，
**以便** 稳定访问该功能，不受 HHA 页面结构变化影响。

### 验收标准
- [ ] 修改 `MailBuilderTab.renderHeader()`，新增 header 右侧动作区容器
- [ ] `创建 M11Q PDF` 按钮位于 `当前页面：XX` 左侧
- [ ] 仅病人页面启用按钮；非病人页面显示禁用态
- [ ] 禁用态有 tooltip（例如：仅在病人页面可用）
- [ ] 不改动 `MultiTabPanel` 全局 header 结构

---

## Story 21-6: 坐标标定与渲染回归

**作为** 团队，
**我需要** 将字段坐标收敛到稳定值，
**以便** 输出文件在常见数据下可读且位置正确。

### 验收标准
- [ ] 基于第 1 页建立 `name/dob/fax` 初始坐标
- [ ] 完成至少一轮样张校准（用户反馈后微调）
- [ ] 验证样例：
  - [ ] 正常长度姓名
  - [ ] 较长姓名（确认右溢出行为符合预期）
  - [ ] 默认内置号码
  - [ ] 自定义号码
- [ ] 记录最终坐标与字号到文档/代码注释（简洁可追溯）

---

## Story 21-7: 回归验证与发布准备

**作为** 团队，
**我需要** 确认新功能不破坏现有邮件助手能力，
**以便** 安全发布。

### 验收标准
- [ ] 回归现有邮件助手功能：
  - [ ] 字段复制按钮正常
  - [ ] 现有传真模板（docx）功能不受影响
  - [ ] 内置模板与自定义模板区域行为不受影响
- [ ] 验证不同页面切换时按钮状态正确（病人页/非病人页）
- [ ] 验证配置持久化符合预期（remember on/off）
- [ ] `npm run build` 通过，无新增 TS 错误
- [ ] 更新关联文档索引（若仓库当前流程要求）

---

## 依赖关系

```text
21-1 (PDF 依赖 + 打包)
  └─ 21-2 (M11QPdfGenerator)
       ├─ 21-3 (传真配置持久化)
       ├─ 21-4 (M11QPdfModal)
       └─ 21-5 (MailBuilderTab Header 入口)
            └─ 21-6 (坐标标定与样张回归)
                 └─ 21-7 (全量回归与发布准备)
```

---

## 文件清单（计划）

| 操作 | 文件路径 |
|---|---|
| 新建 | `docs/adr/019-m11q-prefilled-pdf-generation.md` |
| 新建 | `docs/stories/epic-21-m11q-prefilled-pdf-generation.md` |
| 新建 | `src/js/services/M11QPdfGenerator.ts` |
| 新建 | `src/js/components/M11QPdfModal.ts` |
| 修改 | `src/js/tabs/MailBuilderTab.ts` |
| 修改 | `src/style/mail-builder-tab.less` |
| 修改 | `config/webpack.config.base.cjs` |
| 修改 | `src/typings.d.ts` |
| 修改 | `package.json` |
