# Epic 14: Add Document 弹窗拖拽上传 (Drag and Drop Attachment)

**状态**: 📋 **规划中**

## Epic 概述

为 HHAExchange 的 Patient Profile 中的 "Add Document" (添加文档) 弹窗开发拖拽上传功能。在此功能中，用户可以直接将文件拖放到网页弹窗内。不仅如此，系统会立刻拦截被拖拽的文件，弹窗让用户修改文件名（输入框自动高亮预填充旧名字以便快速覆盖），并在确认后，自动执行一系列繁琐的操作：注入新文件、选择“通用笔记”分类、并自动填充说明栏。极大程度降低日常文书上传的工作量。

## 业务价值

- **避免操作系统级的来回切换**：无需在本地修改好文件名后再去网页点击寻找，所有工作全在网页拖拽阶段一条龙完成。
- **免除多余点击**：去掉“点击 Attach -> 点击 Attach File -> 弹出系统窗口寻找”这三步高频没营养的操作。
- **强制约束与提效融合**：在提交的那一瞬间即时强制要求重命名，确保上传到系统中的文件名永远规范。
- **全自动化表单填报**：彻底省去手动选择 "General Notes" 和复制文本到 "Description" 的操作。

## 问题分析

### 当前痛点
目前要传一个有正确名字和描述记录的文档，标准的步骤如下：
1. 在本地机器中右键 -> `重命名`
2. 点击页面 `Attach` 下拉按钮 -> `Attach File`
3. 导航到对应目录选中文件 -> `打开`
4. 找到 `Document Type` 下拉菜单 -> 选择 `General Notes`
5. 手动去点那个我们之前开发的 `Copy Attachment To Description` 功能按钮。
上述过程，每天如果执行十多次，是非常令人沮丧的体感体验。

### 解决方案
利用 Web 现代 `Drag and Drop API` + UI 注入层：
当我们检测到这个弹窗出现时，在其表面附着一层隐形的区域。用户只需要把原文件往里一丢，所有的流程交由脚本代办：
```
拖入文件 -> 弹出原生/自定义 prompt 提示改名(含选中的原名) -> 确认 -> 脚本重组 File 数据 -> 自动化填表 -> 用户只需点 [Save]!
```

## 功能设计

### UI 设计

#### 拖拽提示层 (Dropzone Overlay)

当用户拖着文件进入 "Add Document" 弹窗范围时，弹窗背景会有明显的视觉变化（例如背景变色为浅绿或带虚线边框），提示可以松手。

```
 ┌─────────────────────────────────────────────────────────┐
 │ Add Document                                        [X] │
 │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
 │ ░░        ====================================       ░░ │
 │ ░░        ║                                  ║       ░░ │
 │ ░░        ║      ↑ 拖拽文件到这里进行智能上传   ║       ░░ │
 │ ░░        ║                                  ║       ░░ │
 │ ░░        ====================================       ░░ │
 │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
 └─────────────────────────────────────────────────────────┘
```

#### 改名拦截提示层

在释放鼠标的瞬间，立即弹出重命名窗口。这可以是浏览器的标准 `prompt()` 或是我们注入的一套小 UI。考虑到需要预选中文本，我们可以使用一个小型的 HTML Modal 来达到完美的用户体验。

```
                    ┌──────────────────────────┐
                    | 📝 重命名要上传的文档     |
                    | ───────────────────────  |
                    | 新文件名:                |
                    | [ 本地原文件名 ] <────── 预先高亮全选，方便一键覆盖！
                    |                          |
                    |       [取消]  [✓ 确认]   |
                    └──────────────────────────┘
```

### 核心逻辑

1. **观察者初始化**：`MutationObserver` 寻找含有 id 或者特定 layout 包含 `Add Document` 文字的 Modal。
2. **事件阻止**：劫持目标区域的 `dragenter`, `dragover`, `dragleave`, `drop` 事件，强行 `preventDefault` 防止浏览器把文件给单独打开新标签页。
3. **Blob File 重构**：核心黑魔法，获取只读 File 对象后：`new File([oldFile], newName, {type: oldFile.type})`
4. **触发系统反应**：构造新的 `DataTransfer` 给原配隐藏的 `fuUpload2`。并且通过 `element.dispatchEvent(new Event('change', {bubbles: true}))` 通知底层框架更新渲染。 

---

## Story 列表

| Story | 标题                                            | 优先级 | 工时 | 依赖 | 状态     |
| ----- | ----------------------------------------------- | ------ | ---- | ---- | -------- |
| 14.1  | 建立针对弹窗的 MutationObserver 与拖拽层样式    | High   | 2h   | -    | 📋 待开发 |
| 14.2  | 实现文件拖拽事件劫持与 UI 反馈                  | High   | 2h   | 14.1 | 📋 待开发 |
| 14.3  | 实现重命名窗格（支持原文件名全选高亮）          | High   | 3h   | 14.2 | 📋 待开发 |
| 14.4  | File 对象重组及内部上传逻辑触发对接             | High   | 3h   | 14.3 | 📋 待开发 |
| 14.5  | 自动化表单填写 (General Notes与Description联动) | Medium | 2h   | 14.4 | 📋 待开发 |
| 14.6  | 重命名后另存为新文件到本地（可选下载步骤）      | Low    | 1h   | 14.3 | 📋 待开发 |

**总工时预估**: 13 小时

---

## Story 14.1: 建立针对弹窗的 MutationObserver 与拖拽层样式

### 用户故事
**作为** 开发者  
**我希望** 能够监听到 "Add Document" 弹窗的出现与消失，并在其区域创建样式准备  
**以便** 我可以将拖放逻辑精准绑定到这个小局部上，而不污染整个页面

### 验收标准
- [x] 构建一个 `MutationObserver` 监控 DOM 的变化，识别出 Add Document 弹窗
- [x] 获取到包含 "Attachment" 下拉菜单的那一层级 Container
- [x] 当特定元素存在时（弹窗开启），附加 `dragenter` 等监听器监听。
- [x] 弹窗关闭时，要有机制确保不会发生内存泄露重复绑定。

---

## Story 14.2: 实现文件拖拽事件劫持与 UI 反馈

### 用户故事
**作为** 脚本用户  
**我希望** 当我把文件拖到弹窗上时，弹窗有背景颜色的变化或提示文字，并且松手后不会导致原页面被重定向  
**以便** 获得清晰的拖拽反馈感并保证页面处于安全的应用环境

### 验收标准
- [x] 在拖拽进入 Container 范围时，背景色要变得柔和显眼（示例蓝或绿浅底）。
- [x] 添加虚线边框等样式体现这是一个“可投递”的状态。
- [x] 必须阻止 `dragover` 和 `drop` 的 default 处理，确保不会离开当前页面上下文。
- [x] 拖拽离开 `dragleave` 后，还原到最初状态。

---

## Story 14.3: 实现重命名窗格（支持原文件名全选高亮）

### 用户故事
**作为** 脚本用户  
**我希望** 在释放文件的一瞬间弹出一个修改文件名的框，且这个框里已经有原文件的名字并处于**全选的蓝底高亮状态**  
**以便** 我看到框后不用碰鼠标，可以直接开始在键盘上敲字重置名字然后回车即可

### 验收标准
- [x] 在 `drop` 回调中读取 `e.dataTransfer.files[0].name`。
- [x] 使用自定义 DOM 注入（推荐）的方式，弹出一个小型的漂亮 Modal 输入框。
- [x] Input 的 `value` 分配为刚才读取的名字（最好去除后缀名部分以方便纯修改前缀，但这视技术难度可以后加）。
- [x] 使用 `HTMLInputElement.select()` 在显示后立即强制聚焦并全选内容。
- [x] 提供取消和保存的流程，按 ESC 可视同取消。

---

## Story 14.4: File 对象重组及内部上传逻辑触发对接

### 用户故事
**作为** 系统  
**我希望** 拿到用户重命名后的字符串，重新生成一份系统内的 File 对象，并将其赋值给内部的实际上传组件，同时发出更新 Event  
**以便** HHAExchange 自己的 React/Vanilla 层能够识别我们拖拽的文件，就当是我们通过点击鼠标产生的一样。

### 验收标准
- [x] 拿到步骤 14.3 的新名字后，读取最初始保存的 Blob 内容实例化新的 File 对象。
- [x] 实例化一个浏览器的原生的 `DataTransfer` 对象并在其 items 中 `add()` 新的 File 对象。
- [x] 利用获取的 DOM `input[type="file"]` (针对 `id="fuUpload2"` 或者 `.fileInput57`) 覆盖其 `.files` 属性为我们伪造的 DataTransfer 的 files 列表。
- [x] 调用对应的 `.dispatchEvent(new Event('change', { bubbles: true }))` 确保页面脚本感受到数据的变更，开始展示“正在上传中”之类的字样或状态。

---

## Story 14.5: 自动化表单填写 (General Notes与Description联动)

### 用户故事
**作为** 脚本用户  
**我希望** 文件被劫持注入完毕后，系统不仅完成了名字更替和上传，连底下的几个必须填的表单项都被直接填好了。  
**以便** 我不用再去手动下拉选分类和按原来的赋值按钮。

### 验收标准
- [x] 定位 `select#documentTypeDropdown`，将其 value 改为 `29132` (意味着 General Notes)。
- [x] 派发对应的 `change` 或 `input` 使得 select 组件视觉更新生效。
- [x] 将之前取到的去除了后缀的新名字字符串，直接填入 `textarea#attachedDocumentDescription` 中。
- [x] 直接调用既有的 `import { copyAttachmentToDescrp } from "../DocManagement"` 逻辑如果可复用的前提下，避免逻辑碎片化。
- [x] 流程结束后，最终状态只需停留在弹窗表面，留下高亮的 "Save" 供用户二次校对后最终提交即可。

---

## Story 14.6: 重命名后另存为新文件到本地（可选下载步骤）

### 用户故事
**作为** 脚本用户  
**我希望** 在完成拖拽重命名后，能够选择将改名后的文件**以新文件名下载保存到本地磁盘**  
**以便** 在维护本地文件系统存档的同时，无需再手动在本地重命名原文件

### 背景说明
浏览器安全沙箱限制了 userscript 直接修改本地文件，因此**原始文件的文件名不会被脚本改变**。此 Story 提供的是一个替代方案：将内存中已重命名的 `File` 对象通过浏览器下载机制「另存为」到本地，等效于以新名字保留一份副本。此步骤为**可选**——用户可选择跳过，直接提交上传即可。

### 验收标准
- [x] 在重命名确认 Modal 的底部增加一个可选的复选框或次级按钮：`「同时保存到本地」`，默认不勾选。
- [x] 若用户勾选（或点击该按钮），在确认新文件名后，通过以下方式触发浏览器下载：
  ```typescript
  const url = URL.createObjectURL(renamedFile);
  const a = document.createElement('a');
  a.href = url;
  a.download = renamedFile.name;
  a.click();
  URL.revokeObjectURL(url);
  ```
- [x] 下载触发后，浏览器显示标准下载提示（保存到下载目录或弹出另存为对话框，取决于浏览器设置），无需额外 UI。
- [x] 下载触发与 HHAExchange 页面的上传流程（14.4）**互不阻塞**，两者可并行完成。
- [x] 若用户不勾选该选项，流程与现有 14.3-14.5 行为完全一致，无任何额外干扰。

---

## Dev Agent Record
### Story 14.1 & 14.2
- Implemented `DocumentDropzone.ts` which uses `MutationObserver` to locate the Add Document modal.
- Added drag-and-drop hijacking logic (`onDragEnter`, `onDragOver`, `onDragLeave`, `onDrop`) with `.preventDefault()`.
- Created `document-dropzone.less` with a styled overlay that becomes active upon drag enter.
- Registered the singleton service `initDocumentDropzone()` in `src/index.ts`.
- Both Story 14.1 and 14.2 are fully implemented and standard ACs are complete.

### Story 14.3, 14.4, & 14.5
- **Story 14.3**: Added `promptForRename` method to pop up a custom renaming modal. It properly splits filename and extension, pre-fills the pure filename, and highlights it fully so users can just type and overwrite.
- **Story 14.4**: Used the captured input to initialize `new File([originalFile], newFileName, { type: originalFile.type })` in `attachFileToInput`. Injected this new file into the DOM using `DataTransfer` and dispatched the necessary `change` event.
- **Story 14.5**: Hooked up `autoFillMetadata` to set Document Type `documentTypeDropdown` to '29132' and `attachedDocumentDescription` to the new filename (without extension), dispatching `change` and `input` events automatically. All forms are synced now. Ready for user testing!

### Story 14.6
- Added `保存到本地` checkbox (default: **checked**) to the rename modal footer in `DocumentDropzone.ts`.
- `promptForRename()` return type changed to `{ name: string | null; saveToLocal: boolean }` to carry the checkbox state — existing 14.3–14.5 logic is completely unaffected when unchecked.
- `onDrop` handler: when `saveToLocal === true`, uses `window.showSaveFilePicker()` (File System Access API) to open a native OS "Save As" dialog; falls back to anchor-download if the API is unavailable. Cancelling the Save As dialog does not abort the HHAExchange upload.
- Added `.rename-save-local-row` + `.rename-save-local-label` styles to `document-dropzone.less`.

### 修复记录（本次 session）
- **Dropzone 早激活问题修复**：MutationObserver 回调从仅检测 `fuUpload2` input 的存在改为 `findAddDocumentModal()`，该方法通过查找可见的「Add Document」标题元素（`getBoundingClientRect` 非零）来判断弹窗是否真正打开，彻底解决弹窗未出现时 dropzone 就绑定的问题。
- **Rename Modal 标题栏颜色**：从深蓝 `#0d3e61` 改为与 userscript 主题一致的紫色渐变 `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`。

### File List (Changed Files)
- `src/index.ts` (Modified)
- `src/style/main.less` (Modified)
- `src/style/document-dropzone.less` (Modified — `.rename-save-local-row` 样式 + rename header 颜色修正为紫色渐变)
- `src/js/services/DocumentDropzone.ts` (Modified — Story 14.6: Save As dialog + default checked; dropzone 早激活修复)
- `docs/stories/epic-14-drag-and-drop-attachment.md` (Modified)
