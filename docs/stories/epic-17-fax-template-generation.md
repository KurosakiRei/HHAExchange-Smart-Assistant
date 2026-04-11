# Epic 17: Word 传真模板一键生成

## Epic 概述

| 属性 | 值 |
|---|---|
| **Epic ID** | EPIC-017 |
| **标题** | Word 传真模板一键生成（Fax Template Generation） |
| **优先级** | P1 |
| **状态** | 🔲 未开始 |
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
- [ ] `webpack.config.base.cjs` 新增 `asset/inline` 规则，匹配 `\.docx$`
- [ ] `src/typings.d.ts` 增加 `declare module '*.docx'` 类型声明，返回 `string`（base64 data URI）
- [ ] `npm run build` 无报错，输出文件包含 docx base64 内容
- [ ] `npm run build:dev` 同样正常

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
- [ ] `package.json` 中已添加 `docxtemplater@^3.68.3` 和 `pizzip@^3.2.0`（dependencies）
- [ ] `npm install` 无报错
- [ ] 两个库共约 76kB gzipped，不超出预算

---

## Story 17-3: ProfileDataExtractor 升级（多保险 + 多电话）

**作为** 悬浮面板，
**我需要** 从病人页面提取多家保险公司名称和多个电话号码，
**以便** 用户可以选择为任意一家保险生成传真模板，并在病人信息区完整展示联系方式。

### 背景 / DOM 结构（已通过 Chrome MCP 验证）

```js
// 多保险：Authorization iframe 表格（仅 PATIENT_INTERNAL 页面）
const iframe = document.getElementById('iframefrmRightSide');
const rows = iframe.contentDocument
  .querySelector('#PatientAuthorization_uxGvAuthorization')
  .querySelectorAll('tbody tr td:first-child');
// 取第 1 列文本，去重，得到保险公司名称数组

// 多电话：#menulist 下拉
document.querySelector('#menulist').querySelectorAll('li a[href^="tel:"]');
// 每个 a 的 textContent 为标签（如 "Patient Phone 2"），href="tel:929-557-5611"
```

### ProfileData 接口变更

```typescript
// 新增字段，现有字段保持不变（向后兼容）
export interface PhoneEntry {
  label: string;   // 'Home Phone' | 'Patient Phone 2' | 'Emergency 1' ...
  number: string;  // '929-557-5611'
}

export interface ProfileData {
  // ... 现有字段不变 ...
  phones?: PhoneEntry[];  // 新增：所有电话列表（含 Home Phone 作为第一项）
  insurances?: string[];  // 新增：Authorization 表格全部去重保险名称
}
```

### 验收标准
- [ ] `ProfileData` 接口新增 `phones?: PhoneEntry[]` 和 `insurances?: string[]`
- [ ] `PhoneEntry` 接口导出
- [ ] `extractPatientInternal()` 调用新增的 `getInsurancesFromAuthTable()` 方法，结果写入 `insurances`
- [ ] `getInsurancesFromAuthTable()`：访问 `iframefrmRightSide` iframe → `#PatientAuthorization_uxGvAuthorization tbody tr td:first-child`，返回去重数组；iframe 不可访问时 catch 异常，返回 `[]`，`insurance` fallback 到 `uxLblContracts`
- [ ] `extractPatientInternal()` 调用新增的 `getPhonesFromMenu()` 方法，结果写入 `phones`
- [ ] `getPhonesFromMenu()`：查询 `#menulist li`，提取每个 `a[href^="tel:"]` 的 label（li 标题文本）和号码（href 去除 `tel:`）
- [ ] `insurance` 字段继续保留（`insurances[0] ?? getText(selectors.insurance)`），不破坏 `TemplateEngine` 等现有调用方
- [ ] `PATIENT_NS` 页面不执行 iframe 查询（该页面无 Authorization iframe）

---

## Story 17-4: InsuranceMatcher 工具函数

**作为** `FaxTemplateGenerator`，
**我需要** 根据页面提取到的保险公司显示名在 `insurances.json` 中找到对应条目，
**以便** 获取正确的 fax 和 phone 号码。

### 验收标准
- [ ] 新建 `src/js/utils/InsuranceMatcher.ts`，导出 `matchInsurance(displayName: string): InsuranceRecord | null`
- [ ] 匹配顺序：① `company_name` 精确匹配（忽略大小写） → ② `aliases` 数组任一精确匹配（忽略大小写） → ③ 返回 `null`
- [ ] `InsuranceRecord` 类型：`{ company_name: string; aliases: string[]; phone: string; fax: string }`
- [ ] `insurances.json` 通过 `import` 引入（Webpack 已支持 JSON 模块）
- [ ] 单元测试覆盖：精确匹配、alias 匹配（含 `"Anthem(Integra)"` 无空格变体、`"CENTERS PLAN for a HEALTHY LIV"` 截断变体）、不匹配返回 null

---

## Story 17-5: FaxTemplateGenerator 服务

**作为** 悬浮面板，
**我需要** 一个服务将病人/保险数据 + 用户输入渲染进 `VCM.docx` 模板并触发下载，
**以便** 用户获得可直接传真的预填 `.docx` 文件。

### 验收标准
- [ ] 新建 `src/js/services/FaxTemplateGenerator.ts`
- [ ] 导出 `generate(params: FaxParams): Blob`，返回渲染后的 `.docx` Blob
- [ ] 导出 `download(blob: Blob, filename: string): void`，触发浏览器 Save As（`<a download>` + click + revokeObjectURL）
- [ ] 文件名格式：`PatientName AdmissionID InsuranceName MMDDYYYY.docx`（各部分之间空格分隔）
- [ ] docxtemplater 启用 `linebreaks: true`（`{body}` 和 `{signature_block}` 中 `\n` 转为 `<w:br/>`）
- [ ] Pages 通过直接修改 Blob 前替换表格中 `Pages:     1` 处的值（或作为独立占位符）— 如果后者，需同步更新 VCM.docx 模板

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
│  收件方  {insurance_name}                           │
│  传真号  {insurance_fax}    电话  {insurance_phone} │
│  病人    {patient_name}     DOB   {patient_dob}     │
│  日期    {date}                                     │
├─────────────────────────────────────────────────────┤
│  Pages    [input  default=1          ]              │
│  Command  [单行 input                ]              │
│  Body     [多行 textarea  min-h:120px]              │
├─────────────────────────────────────────────────────┤
│  ── 发件人配置 ────────────────────────────────     │
│  From 行  [input  e.g. Tao Yang Ext. 503]           │
│  签名区   [多行 textarea              ]             │
│                              [保存配置]             │
├─────────────────────────────────────────────────────┤
│                          [取消]   [下载 .docx]      │
└─────────────────────────────────────────────────────┘
```

### 验收标准
- [ ] 新建 `src/js/components/FaxPreviewModal.ts`，构造函数接收 `FaxPreviewModalOptions`（含 `profileData`, `insuranceName`, `insuranceRecord`）
- [ ] 弹窗打开时从 `GM_getValue('hha_fax_template_config')` 加载 `{ from_line, signature_block }` 预填配置区
- [ ] 首次使用（config 为空）时，配置区字段显示 placeholder 提示文字
- [ ] 「保存配置」：将 `{ from_line, signature_block }` 写入 `GM_setValue('hha_fax_template_config', ...)`，不含 pages
- [ ] 「下载 .docx」：调用 `FaxTemplateGenerator.generate()` + `.download()`
- [ ] 只读区字段（insurance_fax / insurance_phone）若 `InsuranceMatcher` 未匹配，显示 `—`，不阻塞下载
- [ ] `Pages` input 输入验证：只允许正整数，非法输入时恢复为 `1`
- [ ] 弹窗宽度 480px，z-index 高于悬浮面板，半透明遮罩背景
- [ ] `destroy()` 方法：移除 DOM 节点和 keydown（Esc 关闭）监听

---

## Story 17-7: MailBuilderTab 保险行 Split Button

**作为** 用户，
**我需要** 在悬浮面板病人信息区的每行保险信息旁看到一个 split button，
**以便** 左侧继续复制保险名称，右侧箭头快速打开传真模板预览弹窗。

### 验收标准
- [ ] 修改 `MailBuilderTab.ts` `buildFieldsList()`：当 `profileData.insurances` 存在且长度 > 0 时，每家保险各生成一条字段行
- [ ] 保险行渲染改为 split button：`[复制保险名]` + `[▼]` 竖线分隔；左侧点击 = 复制，右侧点击 = 弹出 `FaxPreviewModal`
- [ ] 当页面类型非 `PATIENT_INTERNAL` 或 `insurances` 为空时，split button 右侧 `[▼]` 禁用（视觉灰色，cursor: not-allowed）
- [ ] 现有复制功能行为不变
- [ ] 新增 split button 和 modal overlay CSS 到现有样式文件（`src/style/`）

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
| `src/style/` | 修改：split button + modal 样式 |

