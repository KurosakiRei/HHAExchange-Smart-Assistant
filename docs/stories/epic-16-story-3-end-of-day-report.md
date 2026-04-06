# Epic 16, Story 3: End of Day Report 内置模板
## Story 元数据
| 属性           | 值                                                                               |
| -------------- | -------------------------------------------------------------------------------- |
| **Story ID**   | EPIC-016-STORY-003                                                               |
| **标题**       | End of Day Report — 内置每日收工报告邮件模板（含本地截图自动读取）              |
| **优先级**     | P1 - 高                                                                          |
| **状态**       | ✅ 已完成                                                                        |
| **预估工作量** | 8-10 Story Points                                                                |
| **目标页面**   | 任意页面（不依赖页面 DOM，卡片始终可用）                                         |
| **关联 Epic**  | Epic 16（内置模板体系）、Epic 12（Mail Builder 基础框架）                        |
| **依赖服务**   | `MailService`, `MailBuilderTab`                                                   |
---
## 用户故事
**作为** 脚本用户  
**我希望** 在邮件助手的"内置模板"区域看到"End of Day Report"入口卡片，点击后能读取本地指定文件夹中的截图文件，预填当天日期和固定收件人，确认列表后一键推送到 Outlook  
**以便** 下班前的每日收工报告从"手动找图、拖附件、填标题"三步缩减为"点一下、确认、发送"一步
---
## 业务背景
每个工作日结束时，Coordinator 需要向 Chief Operations Officer 发送一封含有当日工作截图的收工报告邮件。目前的完整流程：
1. 手动截图并保存到固定本地文件夹
2. 打开 Outlook，新建邮件
3. 手动填写收件人、标题（含当天日期）、正文
4. 逐一拖拽截图到附件栏
5. 检查后发送
此内置模板将步骤 2-5 全部自动化，用户仅需完成截图准备（步骤 1），其余交由脚本一键处理。
---
## UI 规格
### 1. 入口卡片（MailBuilderTab 内置模板 Tab）
- 卡片标题：**End of Day Report**
- 卡片描述：`📊 自动读取本地截图并生成每日收工报告邮件`
- 页面 Tag：**`任意页面`**
- **卡片始终可点击**，无置灰逻辑（不依赖任何页面类型检测）
### 2. 点击卡片后的行为
#### 2a. 首次使用（IndexedDB 中无文件夹 Handle）
1. 直接触发浏览器原生 `showDirectoryPicker({ mode: 'read' })` → 弹出系统文件夹选择器
2. 用户选择文件夹后，将 `FileSystemDirectoryHandle` 及文件夹展示名存入 IndexedDB
3. 打开 Modal，自动扫描该文件夹并渲染文件列表
#### 2b. 后续使用（IndexedDB 中已有文件夹 Handle）
1. 直接打开 Modal
2. Modal 打开后立即调用 `handle.requestPermission({ mode: 'read' })`
3. 浏览器显示原生权限横幅（地址栏附近），用户点击 Allow 后自动扫描文件列表
> ⚠️ **已知限制**：每次浏览器新 session 均需通过浏览器原生权限横幅重新确认文件夹访问权限，这是 File System Access API 的强制安全行为。
### 3. Modal 规格
Modal 标题：**End of Day Report**，右上角 `×` 关闭按钮
```
┌──────────────────────────────────────────────────────────────┐
│  📧 End of Day Report                                   [×]  │
│────────────────────────────────────────────────────────────  │
│  收件人名:  [ Reggie                    ]                    │
│  收件邮箱:  [ rthomas@AlwaysNY.net      ]                    │
│────────────────────────────────────────────────────────────  │
│  Subject:   [ The End of Day Report 04/05/2026            ]  │
│────────────────────────────────────────────────────────────  │
│  ┌─ 富文本编辑器 ──────────────────────────────────────┐    │
│  │ Hello Reggie,                                       │    │
│  │                                                     │    │
│  │ Please see attached.                                │    │
│  └─────────────────────────────────────────────────────┘    │
│────────────────────────────────────────────────────────────  │
│  📁 Screenshots  [更改文件夹]                                │
│  ┌─ 附件列表 ──────────────────────────────────────────┐    │
│  │ 📄 miss-in.PNG        修改于 04/05/2026 16:32  [✕] │    │
│  │ 📄 report2.PNG        修改于 04/05/2026 16:45  [✕] │    │
│  └─────────────────────────────────────────────────────┘    │
│────────────────────────────────────────────────────────────  │
│  [ 保存配置 ]                      [ 📤 发送到 Outlook ]     │
└──────────────────────────────────────────────────────────────┘
```
#### 3a. 配置区（顶部）
- **收件人名**：单行 `<input>`，用于生成正文问候语（`Hello {recipientName},`）
- **收件邮箱**：单行 `<input>`，作为邮件 To 地址
- 从 `GM_getValue("hha_builtin_eod_report_config")` 加载已保存配置
- 默认收件人名：`Reggie`
- 默认收件邮箱：`rthomas@AlwaysNY.net`
- **「保存配置」Dirty State**：任意字段与已保存值不同时按钮启用，点击保存后禁用
#### 3b. Subject 区
- 可编辑的单行 `<input>`
- 每次打开 Modal 时重新生成，格式为：`The End of Day Report {MM/DD/YYYY}`
- 日期为当天本地时间，日期格式化逻辑内联于模板代码：
  ```typescript
  const today = new Date();
  const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
  const subject = `The End of Day Report ${dateStr}`;
  ```
#### 3c. 富文本编辑器区
- 工具栏与其他内置模板一致（B / I / U / S / 列表 / 链接 / 清除格式）
- 使用 `contenteditable` div 实现
- 每次打开 Modal 时，依据当前**已保存的**收件人名动态预填（非实时跟随输入框）：
  ```
  Hello {recipientName},
  Please see attached.
  ```
- 预填后用户可自由编辑，所有编辑仅影响本次发送，不持久化
#### 3d. 附件文件夹区
```
📁 Screenshots          [更改文件夹]
```
> ⚠️ **技术限制说明**：File System Access API 出于浏览器安全沙箱设计，`FileSystemDirectoryHandle` **不暴露文件夹的完整磁盘路径**（如 `C:\Users\...\Screenshots`），只能获取文件夹名称（`handle.name`）。因此显示内容为文件夹名，而非完整路径。建议在 UI 标注「已选择文件夹：」以减少歧义。此为浏览器平台级限制，无法通过 userscript 绕过。
- 显示格式：`📁 {handle.name}`（仅文件夹名，不含路径）
- **「更改文件夹」按钮**：重新触发 `showDirectoryPicker()`，替换 handle 并刷新文件列表
#### 3e. 附件文件列表
**扫描规则**：
- 遍历所选文件夹第一层级（**非递归**，不扫描子文件夹）
- 过滤条件：后缀名（大小写不敏感）属于支持格式清单
**支持格式**：`.png` `.jpg` `.jpeg` `.gif` `.bmp` `.webp` `.pdf` `.heic`
**列表项格式**（每行）：
```
📄 {fileName}        修改于 {MM/DD/YYYY HH:mm}        [✕]
```
- **文件名**：含扩展名的完整文件名（`entry.name`）
- **修改日期时间**：`File.lastModified` 转换为 `MM/DD/YYYY HH:mm`（24小时制本地时间）
- **`[✕]` 删除按钮**：点击后从当前列表移除；Modal 关闭后再次打开将恢复完整列表（仅影响本次）
**空文件夹状态**：
```
⚠️ 当前文件夹内未找到支持格式的文件
```
列表区域显示上述提示，**Outlook 按钮保持可用**（见 3f 的空文件夹确认逻辑）
#### 3f. 底部操作区
- **「保存配置」**（左）：仅在配置区 dirty 时可点击；点击后将 `recipientName` + `recipientEmail` 序列化存入 `GM_setValue("hha_builtin_eod_report_config", JSON.stringify(config))`
- **「📤 发送到 Outlook」**（右）：
  - **正常情况**（列表中有文件）：以列表中剩余 `File[]` 为附件，连同 Subject、正文 innerHTML、收件邮箱推送到 `MailService`，成功后**自动关闭 Modal**
  - **无文件情况**（列表为空或全部被删除）：弹出浏览器原生 `confirm()` 对话框：
    > 「当前没有附件文件，是否确认发送到 Outlook？」
    用户点击「确定」→ 继续推送并关闭 Modal；点击「取消」→ 关闭对话框，Modal 保持打开
---
## 技术规格
### 存储架构
| 存储位置 | 存储内容 | Key |
|----------|----------|-----|
| `GM_setValue` | 收件人名、收件邮箱 | `hha_builtin_eod_report_config` |
| IndexedDB | `FileSystemDirectoryHandle`（文件夹权限句柄） | DB: `hha-smart-assistant`<br>Store: `fs-handles`<br>Key: `eod-report-folder` |
> **技术说明**：`FileSystemDirectoryHandle` 是浏览器原生对象，**不可 JSON 序列化**，因此无法使用 `GM_setValue` 存储。IndexedDB 支持直接存取非序列化原生对象，是此场景的唯一可行持久化方案。`GM_setValue` 仍用于存储普通配置字段。
### IDB 工具模块
需新建或扩展一个轻量级 IndexedDB 工具模块（如 `src/js/utils/IDBHandleStore.ts`），提供以下能力：
```typescript
export async function saveHandleToIDB(key: string, handle: FileSystemDirectoryHandle): Promise<void>;
export async function loadHandleFromIDB(key: string): Promise<FileSystemDirectoryHandle | null>;
```
DB 名称：`hha-smart-assistant`，版本号与项目统一管理。若项目已有 IDB 基础设施，优先复用。
### File System Access API 调用流程
```typescript
// 首次使用 / 更改文件夹
const handle = await window.showDirectoryPicker({ mode: 'read' });
await saveHandleToIDB('eod-report-folder', handle);
// 后续使用
const handle = await loadHandleFromIDB('eod-report-folder');
if (!handle) { /* 走首次使用流程 */ return; }
const permission = await handle.requestPermission({ mode: 'read' });
if (permission !== 'granted') { /* 提示用户在浏览器横幅中点击 Allow */ return; }
// 扫描文件
const SUPPORTED_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.pdf', '.heic'];
const files: File[] = [];
for await (const entry of handle.values()) {
  if (entry.kind === 'file') {
    const ext = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase();
    if (SUPPORTED_EXTS.includes(ext)) {
      files.push(await (entry as FileSystemFileHandle).getFile());
    }
  }
}
```
### 配置数据结构
```typescript
interface EodReportConfig {
  recipientName: string;   // 默认 "Reggie"
  recipientEmail: string;  // 默认 "rthomas@AlwaysNY.net"
}
```
### 与 MailService 的对接
参照 16.1、16.2 的 `MailService` 调用约定，将以下参数传递：
- `to`: `config.recipientEmail`
- `subject`: 动态生成的 Subject 字符串
- `body`: 富文本编辑器当前 `innerHTML`
- `attachments`: 列表中剩余的 `File[]`
---
## 已知限制
| 限制 | 说明 |
|------|------|
| 文件夹路径不可完整显示 | File System Access API 不暴露磁盘完整路径，只能显示文件夹名 |
| 每次 session 需权限确认 | 浏览器新 session 后使用时需通过原生权限横幅重新授权，无法跳过 |
| HEIC 收件端兼容性 | Windows 收件端需安装 HEIC 图片扩展才能预览 HEIC 附件，发送本身不受影响 |
| 截图仍需手动 | userscript 无法自动截取网页截图并保存到本地，截图准备步骤必须手动完成 |
| 非递归扫描 | 仅扫描所选文件夹的第一层级，子文件夹内的文件不被读取 |
---
## Dev Agent Record

### 实现说明
- **`src/js/utils/IDBHandleStore.ts`（新建）**: 轻量级 IndexedDB 工具模块。DB: `hha-smart-assistant`，Store: `fs-handles`。提供 `saveHandleToIDB` / `loadHandleFromIDB` 两个异步函数，供 EodReportTemplate 持久化 `FileSystemDirectoryHandle`。
- **`src/js/services/builtin/EodReportTemplate.ts`（新建）**: 完整实现 Epic 16 Story 3 所有 AC：
  - 入口卡片始终可点击，无置灰逻辑，TagBadge 显示「任意页面」。
  - 首次使用时触发 `showDirectoryPicker()`，后续使用通过 `handle.requestPermission()` 触发原生权限横幅。
  - Modal 含：收件人名/邮箱配置区（dirty 追踪 + 保存配置按钮）、可编辑 Subject（格式 `The End of Day Report MM/DD/YYYY`）、`contenteditable` 富文本编辑器（预填 `Hello {recipientName},\nPlease see attached.`）、文件夹区（显示格式：`📁 已选择文件夹：{handle.name}`）、附件列表（扫描 SUPPORTED_EXTS，按 lastModified 降序排列，每项含 `[✕]` 删除按钮）。
  - 「发送到 Outlook」按钮：空列表时弹出 `confirm()` 确认；文件通过 `FileReader` 转 base64 后存入 `MailTask.attachments[]`；成功后关闭 Modal。
- **`src/js/services/MailService.ts`（修改）**: `MailTask` 接口新增可选字段 `attachments?: Array<{name: string; type: string; base64: string}>`。
- **`src/js/services/OutlookDOMControllerPayload.ts`（修改）**: `executeMailTask()` 新增 `attachFiles()` 调用；`attachFiles` 将 base64 解码为 `File[]`，通过精确 selector `input[type="file"][data-testid="local-computer-filein"]:not([accept="image/*"])` 定位 Outlook Ribbon 的真正附件 input（排除 `accept="image/*"` 的内嵌图片 input），注入文件并派发 `change`/`input` 事件。注意：整个 payload 是注入为纯 JS 字符串执行，不可包含 TypeScript 语法（如 `as` 类型断言）。
- **`src/js/tabs/MailBuilderTab.ts`（修改）**: 导入 `EodReportTemplate`，新增 `eodReportTemplate` 实例字段，在内置模板 Tab 的 `renderTemplateList()` 中调用 `this.eodReportTemplate.renderEntryCard(list)`。
- **`src/style/mail-builder-tab.less`（修改）**: 新增 `.eod-modal`、`.eod-modal-body`、`.eod-config-*`、`.eod-subject-*`、`.eod-editor-*`（`min-height: 180px`，`max-height: 280px`，`overflow-y: auto`）、`.eod-folder-*`、`.eod-file-*`、`.eod-modal-footer`、`.eod-save-config-btn`、`.eod-outlook-btn`、`.eod-toast` 样式规则。Modal 主题沿用 userscript 标准紫色渐变，无独立绿色主题。

### 修复记录（本次 session）
- **Modal UI 主题**：移除独立绿色渐变 `.eod-modal-header` 和 `.eod-outlook-btn` 覆写，改为继承 `.template-modal-header` 和 `.template-modal-btn.btn-save` 的标准紫色主题，与 Timesheet 等其他内置模板风格一致。
- **「▶ Outlook」按钮**：发送按钮文字从「📤 发送到 Outlook」改为「▶ Outlook」，保持简洁。
- **富文本编辑器高度**：`min-height` 从 90px 提升至 180px，新增 `max-height: 280px` + `overflow-y: auto`，内容超出后在编辑器内部滚动，不再撑大弹窗。
- **附件注入根本性修复**：通过 Chrome DevTools MCP 实时查询 Outlook Web DOM，发现 Ribbon 中存在两个 file input：`accept="image/*"`（内联图片嵌入正文）和无 accept 限制（真正的附件上传）。旧代码 `querySelector('input[type="file"][multiple]')` 因 DOM 顺序命中了 `image/*` input，导致所有文件被嵌入邮件正文而非作为附件。修复后精确使用 `[data-testid="local-computer-filein"]:not([accept="image/*"])` 选择器。
- **Controller 语法错误修复**：附件注入修复初版在注入字符串里误写了 TypeScript 类型断言 `as HTMLInputElement | null`，导致浏览器解析时抛 `SyntaxError: Unexpected identifier 'as'`，controller 完全无法加载。改为纯 JS 写法（`/** @type {...} */` 注释）修复。
- **tsconfig types 补全**：新增 `"types": ["node", "jquery", "greasemonkey"]` 消除 `index.ts` 的已知类型误报（依赖包均已安装，仅缺 types 字段声明）。

### File List（变更文件）
- `src/js/utils/IDBHandleStore.ts`（新建）
- `src/js/services/builtin/EodReportTemplate.ts`（新建）
- `src/js/services/MailService.ts`（修改）
- `src/js/services/OutlookDOMControllerPayload.ts`（修改）
- `src/js/tabs/MailBuilderTab.ts`（修改）
- `src/style/mail-builder-tab.less`（修改）
- `src/style/document-dropzone.less`（修改）
- `src/js/services/DocumentDropzone.ts`（修改）
- `tsconfig.json`（修改）
- `package.json`（修改 — 版本升至 3.16.1）
- `docs/stories/epic-14-drag-and-drop-attachment.md`（修改）
- `docs/stories/epic-16-story-3-end-of-day-report.md`（修改）
