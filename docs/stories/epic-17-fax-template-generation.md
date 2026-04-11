# Epic 17: Word 传真模板一键生成

## Epic 概述

| 属性 | 值 |
|---|---|
| **Epic ID** | EPIC-017 |
| **标题** | Word 传真模板一键生成（Fax Template Generation） |
| **优先级** | P1 |
| **状态** | ✅ review |
| **关联系统** | MailBuilderTab, ProfileDataExtractor, insurances.json, Webpack config |
| **依赖 Epic** | Epic 12 Mail Builder（MailBuilderTab 基础架构） |
| **ADR** | ADR-014 |

## 背景

Case Coordinator 每天需要向保险公司发送传真，目前须手动打开 Word 模板、逐字段填写病人/保险信息再传真，耗时约 5 分钟/次。本 Epic 在悬浮面板病人信息区增加「创建传真模板」入口，自动预填所有已知字段，用户只需填写本次传真的 Command 和 Body，点击「下载」即获得可直接传真的 `.docx` 文件。

## 模板占位符总览

`src/assets/fax_cover_sheet.docx` 经预处理后含以下 docxtemplater 占位符：

| 占位符 | 数据来源 | 用户可编辑 | 持久化到 config |
|---|---|---|---|
| `{insurance_name}` | Authorization iframe 表格（用户选择） | ❌ | — |
| `{insurance_fax}` | insurances.json alias 匹配 | ❌ | — |
| `{insurance_phone}` | insurances.json alias 匹配 | ❌ | — |
| `{date}` | `new Date()` → MM/DD/YYYY | ❌ | — |
| `{patient_name}` | DOM `uxLblPatientName` | ❌ | — |
| `{patient_dob}` | DOM `uxLblPatientDOB` | ❌ | — |
| `{from_line}` | 用户配置 | ✅ | ✅ |
| `{signature_block}` | 用户配置（多行） | ✅ | ✅ |
| `{command}` | 用户每次输入 | ✅ | ❌ |
| `{body}` | 用户每次输入（textarea） | ✅ | ❌ |
| Pages（表格 hardcoded） | 用户每次输入 | ✅ | ❌ |

---

## Story 17-1: Webpack `.docx` 资源打包配置

**作为** 构建系统，
**我需要** 将 `src/assets/VCM.docx` 以 base64 inline 方式打包进 `.user.js`，
**以便** `FaxTemplateGenerator` 可以直接 `import` 使用，无需运行时 fetch。

### 验收标准
- [x] `webpack.config.base.cjs` 新增 `asset/inline` 规则，匹配 `\.docx$`
- [x] `src/typings.d.ts` 增加 `declare module '*.docx'` 类型声明，返回 `string`（base64 data URI）
- [x] `npm run build` 无报错，输出文件包含 docx base64 内容
- [x] `npm run build:dev` 同样正常

### 实现提示
```js
// webpack.config.base.cjs — module.rules 中新增
{ test: /\.docx$/, type: 'asset/inline' }
```
```ts
// src/typings.d.ts
declare module '*.docx' {
  const src: string;
  export default src;
}
```

---

## Story 17-2: 安装 docxtemplater + pizzip 依赖

**作为** 开发者，
**我需要** 在项目中安装 `docxtemplater` 和 `pizzip`，
**以便** `FaxTemplateGenerator` 可以在浏览器环境中渲染 `.docx` 模板。

### 验收标准
- [x] `package.json` 中已添加 `docxtemplater@^3.68.3` 和 `pizzip@^3.2.0`（dependencies）
- [x] `npm install` 无报错
- [x] 两个库共约 76kB gzipped，不超出预算

---

## Story 17-3: ProfileDataExtractor 升级（多保险 + 多电话）

**作为** 悬浮面板，
**我需要** 从病人页面提取多家保险公司名称和多个电话号码，
**以便** 用户可以选择为任意一家保险生成传真模板，并在病人信息区完整展示联系方式。

### 背景 / DOM 结构（已通过 Chrome MCP 验证）

```js
// 多保险：两步策略
// Step 1 Baseline：主页面 contract span（始终可取）
document.querySelector('#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblContracts');

// Step 2 Supplement：Authorization iframe 表格（仅 iframe 已加载完成时）
const iframe = document.getElementById('iframefrmRightSide');
const cells = iframe.contentDocument
  .querySelectorAll('#PatientAuthorization_uxGvAuthorization tbody tr td:first-child');
// 去重后追加到结果数组

// 多电话：#menulist 下拉（仅 li 内 submenu 项目，不含顶层 Home Phone）
document.querySelectorAll('#menulist li a[href^="tel:"]');
// 每个 a 的 textContent 为 "Patient Phone 2 :  929-557-5611"（含号码），href="tel:9295575611"（纯数字，格式与文本不同）
// ⚠️ href 的号码格式与 textContent 不同，需 regex 双重剥离
```

### ProfileData 接口变更

```typescript
// 新增字段，现有字段保持不变（向后兼容）
export interface PhoneEntry {
  label: string;   // 'Home Phone' | 'Patient Phone 2' | 'Emergency Phone' ...
  number: string;  // '929-557-5611'
}

export interface ProfileData {
  // ... 现有字段不变 ...
  phones?: PhoneEntry[];  // 新增：#menulist submenu 里的电话列表
  insurances?: string[];  // 新增：Authorization 表格全部去重保险名称
}
```

### 验收标准
- [x] `ProfileData` 接口新增 `phones?: PhoneEntry[]` 和 `insurances?: string[]`
- [x] `PhoneEntry` 接口导出
- [x] `extractPatientInternal()` 调用新增的 `getInsurancesFromAuthTable()` 方法，结果写入 `insurances`
- [x] `getInsurancesFromAuthTable()`：两步策略 — ① 读取主页面 `uxLblContracts` span 作为 baseline；② 若 iframe `readyState === "complete"` 则补充读取 `#PatientAuthorization_uxGvAuthorization tbody tr td:first-child`，去重后合并；iframe 不可访问时 catch 异常并返回已收集结果
- [x] `extractPatientInternal()` 调用新增的 `getPhonesFromMenu()` 方法，结果写入 `phones`
- [x] `getPhonesFromMenu()`：查询 `#menulist li`，提取 `a[href^="tel:"]` 的号码（href）和标签（textContent）；因 `href` 号码为纯数字而 `textContent` 为带连字符格式，采用双重 `.replace()` 剥离：先精确替换 href 号码，再通过 `/\s*:?\s*[\+\d][\d\s\-\.\(\)]{6,}$/` regex fallback，保证任何格式下标签都被干净提取
- [x] `insurance` 字段继续保留（`insurances[0] ?? getText(selectors.insurance)`），不破坏 `TemplateEngine` 等现有调用方
- [x] `PATIENT_NS` 页面不执行 iframe 查询（该页面无 Authorization iframe）
- [x] `MailBuilderTab.render()` 在 PATIENT_INTERNAL 页面监听 `iframefrmRightSide` 的 `load` 事件；iframe 加载完成后重新调用 `ProfileDataExtractor.extract()` 并对比保险数量，若增加则替换左侧信息面板（解决页面初次渲染早于 iframe 加载完成的时序问题）

---

## Story 17-4: InsuranceMatcher 工具函数

**作为** `FaxTemplateGenerator`，
**我需要** 根据页面提取到的保险公司显示名在 `insurances.json` 中找到对应条目，
**以便** 获取正确的 fax 和 phone 号码。

### 验收标准
- [x] 新建 `src/js/utils/InsuranceMatcher.ts`，导出 `matchInsurance(displayName: string): InsuranceRecord | null`
- [x] 匹配顺序：① `company_name` 精确匹配（忽略大小写） → ② `aliases` 数组任一精确匹配（忽略大小写） → ③ 返回 `null`
- [x] `InsuranceRecord` 类型：`{ company_name: string; aliases: string[]; phone: string; fax: string }`
- [x] `insurances.json` 通过 `import` 引入（Webpack 已支持 JSON 模块）
- [x] 单元测试覆盖：精确匹配、alias 匹配（含 `"Anthem(Integra)"` 无空格变体、`"CENTERS PLAN for a HEALTHY LIV"` 截断变体）、不匹配返回 null

---

## Story 17-5: FaxTemplateGenerator 服务

**作为** 悬浮面板，
**我需要** 一个服务将病人/保险数据 + 用户输入渲染进 `VCM.docx` 模板并触发下载，
**以便** 用户获得可直接传真的预填 `.docx` 文件。

### 验收标准
- [x] 新建 `src/js/services/FaxTemplateGenerator.ts`
- [x] 导出 `generate(params: FaxParams): Blob`，返回渲染后的 `.docx` Blob
- [x] 导出 `download(blob: Blob, filename: string): void`，触发浏览器 Save As（`<a download>` + click + revokeObjectURL）
- [x] 文件名格式：`PatientName AdmissionID InsuranceName MMDDYYYY.docx`（各部分之间空格分隔）
- [x] docxtemplater 启用 `linebreaks: true`（`{body}` 和 `{signature_block}` 中 `\n` 转为 `<w:br/>`）
- [x] Pages 通过直接修改 Blob 前替换表格中 `Pages:     1` 处的値（或作为独立占位符）— 如果后者，需同步更新 VCM.docx 模板

```typescript
export interface FaxParams {
  // 自动填充（只读）
  insurance_name: string;
  insurance_fax: string;
  insurance_phone: string;
  date: string;           // MM/DD/YYYY
  patient_name: string;
  patient_dob: string;
  // 用户每次输入
  pages: string;          // 默认 '1'
  command: string;
  body: string;
  // 用户配置（持久化）
  from_line: string;
  signature_block: string;
}
```

### 实现提示
```typescript
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import templateBase64 from '../../assets/fax_cover_sheet.docx';

const binary = atob(templateBase64.split(',')[1] ?? templateBase64);
const zip = new PizZip(binary, { base64: false });
const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
doc.render(params);
const blob = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
```

> ⚠️ 注意：`Pages` 字段目前在模板表格中是 hardcoded `1`，需要将其改为 `{pages}` 占位符并同步更新 VCM.docx（小改动，可在本 Story 内处理）。

---

## Story 17-6: 预览弹窗 UI（FaxPreviewModal）

**作为** 用户，
**我需要** 在下载传真模板前看到一个预览弹窗，可以预填 Command、Body 等字段并管理我的发件人配置，
**以便** 下载后无需再打开 Word 做二次编辑。

### 弹窗结构

```
┌─────────────────────────────────────────────────────┐
│  创建传真模板                                   [×] │
├─────────────────────────────────────────────────────┤
│  收件方  {insurance_name}     日期  {date}          │
│  传真号  {insurance_fax}      电话  {insurance_phone}│
│  病人    {patient_name}       DOB   {patient_dob}   │
├─────────────────────────────────────────────────────┤
│  页数    [number input  default=1   ↑↓]             │
│  简述    [单行 input                ]               │
│  正文    [多行 textarea  min-h:120px]               │
├─────────────────────────────────────────────────────┤
│  ── 发件人配置 ────────────────────────────────     │
│  来自：  [input  e.g. Tao Yang Ext. 503]            │
│  签名区  [多行 textarea              ]              │
│                              [保存配置]             │
├─────────────────────────────────────────────────────┤
│                          [取消]   [下载 .docx]      │
└─────────────────────────────────────────────────────┘
```

### 验收标准
- [x] 新建 `src/js/components/FaxPreviewModal.ts`，构造函数接收 `FaxPreviewModalOptions`（含 `profileData`, `insuranceName`, `insuranceRecord`）
- [x] 弹窗复用 `template-modal-overlay` / `template-modal` / `template-modal-header` 等现有 CSS class，保持与其他内置弹窗视觉一致；额外 `fax-modal-*` class 仅做尺寸和布局差异化覆盖
- [x] 弹窗打开时从 `GM_getValue('hha_fax_template_config')` 加载 `{ from_line, signature_block }` 预填配置区
- [x] 首次使用（config 为空）时，配置区字段显示 placeholder 提示文字
- [x] 「保存配置」：将 `{ from_line, signature_block }` 写入 `GM_setValue('hha_fax_template_config', ...)`，不含 pages
- [x] 「下载 .docx」：调用 `FaxTemplateGenerator.generate()` + `.download()`；使用 `input.valueAsNumber` 读取页数
- [x] 只读区字段（insurance_fax / insurance_phone）若 `InsuranceMatcher` 未匹配，显示 `—`，不阻塞下载
- [x] `Pages` 使用 `type="number" min="1" step="1"` 原生 spinner；下载时校验：非有限正整数则回退为 `"1"`
- [x] 信息区使用 CSS Grid `grid-template-columns: auto 1fr auto 1fr` 实现两列对齐（6 个字段排成 3 行）
- [x] 弹窗宽度 740px（`max-width: 96vw`），body 区 `max-height: calc(85vh - 120px)` + `overflow-y: auto` 防止内容溢出屏幕
- [x] z-index 100003（高于 `.template-modal-overlay` 的 100002）
- [x] 关闭（X / 取消 / Esc）时，若「简述」或「正文」有内容，提示 `window.confirm("填写的内容尚未下载，关闭窗口将丢失内容，确认关闭吗？")`
- [x] **不绑定** overlay 背景点击关闭事件（防止误触丢失内容）
- [x] `destroy()` 方法：移除 DOM 节点和 keydown（Esc）监听

---

## Story 17-7: MailBuilderTab 保险行操作按钮与信息面板重构

**作为** 用户，
**我需要** 在悬浮面板病人信息区的保险行看到传真按钮、电话行看到拨打按钮，同时「复制 名字+ID」按钮固定在面板底部不随内容滚动，
**以便** 快速完成传真、拨打、复制等日常操作。

### 验收标准

#### 保险 / 电话 / 复制按钮
- [x] 修改 `MailBuilderTab.ts` `buildFieldsList()`：当 `profileData.insurances` 存在且长度 > 0 时，每家保险各生成一条字段行；多条保险时标签为 `保险1` / `保险2`，单条时标签为 `保险`
- [x] 修改 `renderInfoPanel()`，改为程序式 DOM 构建，所有字段均使用同一 `📋` 复制按钮（`.info-copy-btn`）
- [x] 保险行额外追加 `📠` 传真按钮（`.info-fax-btn`）：在 `PATIENT_INTERNAL` 页面点击打开 `FaxPreviewModal`；其他页面按钮禁用（`.disabled`，`cursor: not-allowed`）
- [x] 电话行额外追加 `📞` 拨打链接（`.info-dial-btn`，`href="tel:..."`，`<a>` 标签）
- [x] 「复制 名字+ID」按钮（`.mail-builder-quick-copy`）固定在面板底部，不参与滚动：`.mail-builder-info-panel` 设 `overflow: hidden`，`.mail-builder-info-list` 设 `flex: 1; overflow-y: auto`，quick-copy 为 flex 末尾子项

#### 电话标签中文化
- [x] 新增 `shortenPhoneLabel(label)` 私有方法，将所有 DOM 原始标签统一转换为中文短标签：
  - `Emergency Phone N` → `紧急 N`；`Emergency Phone` → `紧急`
  - `Home Phone` → `电话 1`
  - `[Patient ]Phone N`（含脏尾部） → `电话 N`（使用子串匹配，去掉 `^`/`$` 锚以容忍剥离不完整的标签）
- [x] `buildFieldsList()` 中：若 `profileData.phone`（Home Phone）不在 phones 数组内，前置插入 label `"电话 1"`；若 phones 数组为空则 fallback 单条 `"电话 1"`

#### 其他内置弹窗一致性改造
- [x] `EodReportTemplate`、`PatientVacationTemplate`、`TimesheetNotificationTemplate` 的 X 关闭按钮均改为 dirty-check confirm（`window.confirm("邮件尚未发送，确认关闭吗？")`）后关闭
- [x] 以上三个弹窗均移除 overlay 背景点击关闭事件（防止误触）
- [x] `MailBuilderTab` 编辑器关闭（`closeEditor()`）同样引入 `editorDirty` 追踪：有改动时弹出 confirm；`saveTemplate()` 成功后重置 `editorDirty`

#### CSS（`src/style/mail-builder-tab.less`）
- [x] 删除旧 `.info-split-btn` / `.info-split-copy` / `.info-split-fax` 样式块
- [x] 新增 `.info-fax-btn` / `.info-dial-btn`（与 `.info-copy-btn` 风格一致）
- [x] `/* Epic 17: Fax Preview Modal */` 区块：`.fax-modal-overlay`（z-index 100003）、`.fax-modal`（width 740px，max-width 96vw）、`.fax-modal-body`（max-height calc(85vh - 120px)，overflow-y auto）、`.fax-info-grid`（CSS Grid 4列）、各 form/config/footer 子类

---

## 实现顺序建议

```
17-1 Webpack .docx inline 规则
  └─▶ 17-2 npm install 依赖
        └─▶ 17-3 ProfileDataExtractor 升级
              ├─▶ 17-4 InsuranceMatcher
              │     └─▶ 17-5 FaxTemplateGenerator
              │           └─▶ 17-6 FaxPreviewModal
              │                 └─▶ 17-7 Split Button UI
              └─▶ (17-4 可与 17-3 完成后并行进行)
```

## 涉及文件清单

| 文件 | 操作 |
|---|---|
| `webpack.config.base.cjs` | 修改：加 `.docx` asset/inline 规则 |
| `src/typings.d.ts` | 修改：加 `*.docx` 类型声明 |
| `src/assets/fax_cover_sheet.docx` | ✅ 已完成（占位符预处理） |
| `src/assets/insurances.json` | ✅ 已完成（aliases 添加） |
| `src/js/services/ProfileDataExtractor.ts` | 修改：多保险 + 多电话 |
| `src/js/utils/InsuranceMatcher.ts` | 新建 |
| `src/js/services/FaxTemplateGenerator.ts` | 新建 |
| `src/js/components/FaxPreviewModal.ts` | 新建 |
| `src/js/tabs/MailBuilderTab.ts` | 修改：split button UI |
| `src/style/mail-builder-tab.less` | 修改：split button + modal 样式 |

---

## Dev Agent Record

### 实现计划

按照故事文件任务顺序依次实现：17-1 → 17-2 → 17-3 → 17-4 → 17-5 → 17-6 → 17-7。

### 完成说明

- **17-1**：`webpack.config.base.cjs` 在 fonts 规则后新增 `{ test: /\.docx$/, type: 'asset/inline' }`；`src/typings.d.ts` 新增 `declare module '*.docx'`。`npm run build` 验证通过。
- **17-2**：`npm install docxtemplater@^3.68.4 pizzip@^3.2.0` 成功，已写入 `package.json` dependencies。
- **17-3**：`ProfileDataExtractor.ts` 新增 `PhoneEntry` 接口并导出；`ProfileData` 新增 `phones?` / `insurances?` 字段；`extractPatientInternal()` 调用 `getInsurancesFromAuthTable()`（两步策略：span baseline + iframe supplement，catch 异常返回已收集结果）和 `getPhonesFromMenu()`（从 `#menulist` 提取，双重 replace 处理 href/textContent 格式不一致）；`insurance` 字段保持向后兼容。`MailBuilderTab.render()` 新增 iframe load 事件监听，在保险数增加时刷新左侧面板。
- **17-4**：新建 `src/js/utils/InsuranceMatcher.ts`，导出 `matchInsurance()`，支持 company_name / aliases 双层忽略大小写精确匹配。
- **17-5**：新建 `src/js/services/FaxTemplateGenerator.ts`，导出 `generate()`（docxtemplater + pizzip，linebreaks:true）、`download()`（`<a download>` 方式）、`buildFilename()`（PatientName ID InsuranceName MMDDYYYY.docx）。
- **17-6**：新建 `src/js/components/FaxPreviewModal.ts`。弹窗复用 `template-modal-*` CSS class 保持 UI 一致性；信息区 CSS Grid 4 列；页数使用 `type="number"` 原生 spinner；关闭前 dirty-check confirm；不绑定 overlay 点击关闭；`destroy()` 清理 keydown 监听。
- **17-7**：`MailBuilderTab.ts` 全面重构 `renderInfoPanel()`（程序式 DOM 构建）和 `buildFieldsList()`；各字段一律 `📋` 复制，保险额外 `📠` 传真，电话额外 `📞` 拨打；新增 `shortenPhoneLabel()` 将所有 DOM 原始标签转为中文；quick-copy 按钮改为 flex 底部固定（info-list 滚动，quick-copy 不动）；三个内置弹窗统一移除 overlay 点击关闭并加 dirty-check confirm；`mail-builder-tab.less` 删除旧 split-btn 样式，新增 `info-fax-btn` / `info-dial-btn` 及 Epic 17 Fax Modal 全套样式。

### 已知决策与偏差

| 项目 | 原始规格 | 实际实现 | 原因 |
|---|---|---|---|
| 顶层 Home Phone 缺失 | phones 来自 `#menulist` | `phone` 字段如不在 submenu 则前置为 `电话 1` | Home Phone anchor 在 `li.opens-right`（顶层），不在 `#menulist` submenu |
| 保险提取时序 | 直接读 iframe | 两步 baseline+supplement + iframe load 事件刷新 | 面板渲染时 iframe 未必加载完成 |
| label 剥离 | 简单 replace | 双重 replace（href 精确 + regex fallback） | `tel:href` 格式（纯数字）与 `textContent`（带连字符）不一致 |
| 弹窗宽度 | 480px | 740px，body max-height calc(85vh-120px) | 用户反馈空间不足 |
| 按钮设计 | Split Button（复制+▼传真） | 独立 📋复制 + 📠传真 + 📞拨打 | 用户反馈 split button UX 不直观 |
| 字段标签 | 英文（Phone N / EMC N） | 中文（电话 N / 紧急 N） | 产品语言统一要求 |
| 弹窗关闭方式 | overlay 点击可关闭 | 移除 overlay 点击关闭（所有弹窗统一） | 防止误触丢失未下载内容 |

### 变更日志

- 2026-04-10：完成 Epic 17 所有 7 个 Story 的初始实现（Webpack 配置、依赖安装、ProfileDataExtractor 升级、InsuranceMatcher、FaxTemplateGenerator、FaxPreviewModal、MailBuilderTab split button）。
- 2026-04-10~11：手动测试发现并修复多项 UI 问题：
  - 移除所有内置弹窗 overlay 点击关闭，添加 dirty-check confirm
  - 修复 Home Phone 顶层未在 `#menulist` submenu 中的缺失问题
  - 修复 `getInsurancesFromAuthTable()` 时序问题（iframe load 事件 + baseline span 策略）
  - 修复 `anchor.textContent` 中内嵌电话号码剥离不完整（href 纯数字 vs 文本带连字符）
  - Split Button 改为独立 📋📠📞 三按钮
  - 字段标签全面中文化（电话 N / 紧急 N）
  - 弹窗尺寸扩大至 740px，body 加 max-height 防溢出
  - quick-copy 按钮固定在面板底部（info-list 独立滚动）
  - `shortenPhoneLabel` 改为子串匹配（去掉 `^$` 锚），处理剥离不完整的脏标签

### 文件列表

| 文件 | 操作 |
|---|---|
| `config/webpack.config.base.cjs` | 修改 |
| `src/typings.d.ts` | 修改 |
| `package.json` | 修改（新增 docxtemplater, pizzip） |
| `src/js/services/ProfileDataExtractor.ts` | 修改 |
| `src/js/utils/InsuranceMatcher.ts` | 新建 |
| `src/js/services/FaxTemplateGenerator.ts` | 新建 |
| `src/js/components/FaxPreviewModal.ts` | 新建 |
| `src/js/tabs/MailBuilderTab.ts` | 修改 |
| `src/style/mail-builder-tab.less` | 修改 |

