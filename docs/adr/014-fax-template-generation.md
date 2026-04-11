# ADR-014: Word 传真模板一键生成方案

## 状态
Accepted (2026-04-10)

## 背景

业务场景：Case Coordinator 每天需要向保险公司发送大量传真，内容高度模板化（固定的 Fax Cover Sheet 格式，含病人姓名、DOB、保险名称、传真/电话号码、日期、短描述和正文）。目前流程：
1. 在 Word 中手动打开 VCM.docx 模板
2. 逐字段输入或复制粘贴病人/保险信息
3. 手动修改日期
4. 保存并传真

目标：在 HHAExchange Smart Assistant 悬浮面板的病人信息区增加**一键传真模板生成**功能，自动预填所有已知字段，用户仅需填写本次传真的 Command 和 Body，一键下载即用的 `.docx` 文件。

---

## 决策

### D1：渲染库选型 — docxtemplater + pizzip

**选定**：`docxtemplater@3.68.3` + `pizzip@3.2.0`

| 方案 | 优点 | 缺点 | 结论 |
|---|---|---|---|
| docxtemplater + pizzip | MIT；浏览器原生支持；Webpack 5 兼容；52kB+24kB gzipped；标签语法简单 `{tag}` | 高级功能（HTML 注入）需付费模块 | ✅ 选定 |
| officegen | 从头生成 docx | 无法保留原始样式/布局 | ❌ 否决 |
| html-docx-js | HTML→docx | 样式转换不可靠，无法保留封面格式 | ❌ 否决 |
| Word Online API | 完整预览 | 需后端、OAuth；违反 CSP 合规要求 | ❌ 否决 |

### D2：模板资源打包策略 — Webpack `asset/inline`

**选定**：将 `fax_cover_sheet.docx` 通过 Webpack `asset/inline` 规则打包为 base64 data URI，内联进 `.user.js` 输出文件。

理由：
- Userscript 以单文件方式分发，不能依赖外部文件服务
- `asset/inline` 自动 base64 编码，`import templateBase64 from './assets/VCM.docx'` 即可使用
- 避免运行时 fetch（无需 GM.xmlHttpRequest，无 CORS 问题，离线可用）
- 模板文件 ~22KB，base64 后 ~29KB，对总包体积影响可接受

### D3：模板文件预处理 — python-docx XML 级 run 合并

Word 的 revision tracking 会将连续文本分割为多个 `<w:r>` runs（如 "Village Care Max" 被拆为 2 段、"04/08/2026" 被拆为 5 段），标准搜索/替换无法跨 run 找到完整文本。

**选定**：用 `python-docx` + lxml 直接操作 XML，将同一段落内的所有 `<w:r>` 合并为单个 run 后再写入占位符。该操作离线一次性执行（`fix_template.py` + `fix_step4.py`），结果提交为 `src/assets/fax_cover_sheet.docx`。docxtemplater 运行时不感知此预处理步骤。

### D4：Insurance 名称匹配策略 — aliases 精确匹配

HHAExchange 页面显示的保险名称与存储的规范名称存在差异（空格、截断）。

**选定**：在 `insurances.json` 每条记录中增加 `aliases` 数组，包含所有已知 HHAExchange 显示变体。匹配顺序：`company_name` 精确匹配 → `aliases` 精确匹配 → 不匹配（降级：不填 fax/phone）。

不引入 fuzzy string 匹配库（如 fuse.js）的理由：
- 保险公司名称集合小且固定（12家）
- Fuzzy 匹配存在误匹配风险（例如 "Elderplan" 误匹配 "ElderServe"）
- 人工维护 aliases 更可控、可审计

### D5：多保险公司提取 — Authorization iframe table

`uxLblContracts`（页面顶部栏）仅显示一家保险。完整保险列表在 iframe `iframefrmRightSide` → `InternalPatientCalendarDetails_ns.aspx` → 表格 `#PatientAuthorization_uxGvAuthorization`。

**选定**：在 `PATIENT_INTERNAL` 页面额外查询 iframe 内的 Authorization 表格，提取所有不重复的保险公司名称，存入 `ProfileData.insurances: string[]`（新增字段，向后兼容，`insurance` 字段保留指向第一个值）。

### D6：传真正文编辑器 — 纯文本 textarea + linebreaks:true

**选定**：预览弹窗使用标准 `<textarea>` 编辑 Body。docxtemplater 开启 `linebreaks: true` 选项，`\n` 自动转为 `<w:br/>`（Word 软换行），保留段内换行结构。

不使用 TinyMCE 的理由：fax 正文无加粗/斜体等格式需求；将 HTML 注入 docx 需付费 docxtemplater 模块或大量自造轮子。

### D7：UI 入口 — 保险行 Split Button

在 MailBuilderTab 左侧病人信息面板的保险行，将现有「复制」按钮升级为 **split button**：左侧保持复制功能，右侧下拉箭头触发「创建传真模板」。如检测到多家保险，每一行各有一个 split button。

### D8：预览弹窗与下载

点击「创建传真模板」后弹出预览弹窗，包含：
- **只读展示区**：病人姓名、DOB、保险名称、传真号、电话号、日期（自动填充，不可编辑）
- **每次输入区**：Pages（默认 1）、Command（单行）、Body（多行 textarea）
- **配置区**（首次使用提示填写，之后自动加载）：From 行、签名区（多行 textarea）
- **操作按钮**：「保存配置」（仅存 From + 签名，不存 Pages）、「下载 .docx」（触发浏览器 Save As）

文件名格式：`PatientName AdmissionID InsuranceName MMDDYYYY.docx`
示例：`HAN YUE YING AHC-123456 Village Care Max 04102026.docx`

---

## 影响

### 正面
- 减少 CC 手动操作：从「约 5 分钟逐字段复制」到「约 30 秒填写 Command/Body 后下载」
- 完全离线可用，不依赖外部服务
- 与 Epic 16 内置模板体系平行，不破坏已有架构

### 负面 / 限制
- `.docx` 内联 base64 增加约 29KB 包体积
- `{signature_block}` 将签名区多段落合并为单段落 + 软换行，丢失原有各行间的段间距和 Bold 样式
- Browser Save As 路径由浏览器控制，无法程序化指定保存目录
- iframe 内 Authorization 表格提取依赖 HHAExchange DOM 结构稳定性

