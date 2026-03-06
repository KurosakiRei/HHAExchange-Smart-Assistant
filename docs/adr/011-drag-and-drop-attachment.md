# ADR-011: Add Document 弹窗拖拽上传实现方案

## 状态
Proposed (2026-03-05)

## 背景

在 HHAExchange 系统中，为 Patient Profile 添加非访问类文档（Non-visit Documents）是一个极其频繁的操作。然而，当前的交互流程存在显著的痛点，导致严重的操作摩擦和效率损耗。

### 初始需求
- 允许用户直接将电脑上的文件拖拽到网页中完成上传准备。
- 能够在拖拽后直接在浏览器内修改文件名，而无需事先在操作系统中重命名文件。
- 自动完成高频的表单操作（如选择“General Notes”，自动将文件名带入 Description）。

### 遇到的痛点与问题

#### 痛点 1: 繁琐的原生上传流程
用户当前必须通过以下步骤才能上传文件：
1. 点击 `Attach` 下拉菜单。
2. 点击 `Attach File` 打开系统文件选择器。
3. 在弹出的系统窗口中穿梭目录寻找文件。

#### 痛点 2: 文件重命名成本极高
机构通常对上传的文档有严格的命名规范。用户常常需要：
1. 在电脑的资源管理器中找到该文件。
2. 右键 -> 重命名。
3. 返回浏览器执行上传。
如果发现传错了或者名字不对，必须重复上述全部过程。

#### 痛点 3: 重复的表单录入
上传文件后，用户绝大多数情况下选择的是 "General Notes" (ID: 29132)，并且需要点击 "Copy Attachment To Description" 来填充描述。这些步骤完全是机械且高度重复的。

#### 技术限制问题
- **File API 的只读限制**：Web API 中的 `File.name` 属性是只读的。无法直接修改拦截到的 `DataTransfer` 对象中文件的名字。
- **React/Vanilla 状态穿透**：HHAExchange 底层采用复杂的事件监听。单纯地修改 DOM 的 value 无法触发其内部状态的更新，必须通过 dispatch 合成的 `change` 事件来欺骗系统触发上传。

## 决策

### 最终方案：弹窗局部拦截 + File Blob 重构 + 自动化流

为了在不破坏且不干扰页面其他功能的前提下实现该需求，我们采取针对特定弹窗进行劫持的方案。

#### 1. 局部作用域监听 (Dropzone Injection)
- **拒绝全局监听**：全局监听 `dragover` 容易导致意外在其他区域释放文件触发浏览器的下载/打开行为。
- **方案**：使用 `MutationObserver` 监听 DOM，当检测到带有 `Add Document` 标题的 Modal 弹窗（或 `.fileInput57` 输入框）出现时，我们才动态地向弹窗区域注入半透明的 Dropzone 覆盖层和拖拽事件。

#### 2. 文件劫持与内存重构 (Intercept & Reconstruction)
因为原生的 `File` 对象的 `name` 是只读的，当用户拖入文件并触发触发 `drop` 事件时，流程如下：
1. `e.preventDefault()` 阻止浏览器默认行为。
2. 捕获 `e.dataTransfer.files[0]`。
3. 弹出一个对话框输入框（预填充原文件名并默认 `全选高亮`，方便一键覆盖）。
4. 用户确认新名字后，读取原文件的 `Blob` 数据流，在内存中实例化一个新的文件：
   ```typescript
   const newFile = new File([originalFile], newFilename, { type: originalFile.type });
   ```

#### 3. 自动注入与模拟交互 (Automated Interaction)
1. 使用 `DataTransfer` 构建一个新的 `FileList`。
2. 将其赋值给隐藏的 `<input type="file" id="fuUpload2">` (或对应选择器)。
3. 给文件 input 派发 `change` 和 `input` 事件，激活原生系统的上传等待流程。
4. 自动定位 Document Type 的 `<select>`，将其值设置为 "General Notes" 对应的值，派发 `change`。<br>
5. 自动调用本项目原有的 `DocManagement.ts` 中的 `copyAttachmentToDescrp()` 逻辑或复用代码，用新的文件名覆盖 Description。

## 技术决策总结

| 面临的技术挑战               | 尝试/考虑的方案                      | 最终采用方案                                                                                                 |
| :--------------------------- | :----------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **触发区域定位**             | 全局 Window 监听                     | **局部 MutationObserver** - 随弹窗生命周期装载/卸载，防止污染其他页面的原生拖拽操作。                        |
| **修改只读的 File.name**     | 强行改写 Property (会抛出 TypeError) | **重新构造 `new File([blob], newName)`** - 虽然在内存中多复制了一次 Blob，但单个文档体积小，开销完全可接受。 |
| **绕过原生弹出的文件选择器** | 拦截 Click 事件并抛出                | **捕获 DataTransfer 后直接赋值隐藏的 input.files**，并分发 `change` Event 进行模拟触发。                     |

## 影响范围

### 修改的文件
- 新增 `src/js/services/DocumentDropzone.ts` (核心实现)
- 可能需要修改/重构 `src/js/DocManagement.ts` 以暴露出供 Dropzone 消费的方法。
- 主入口 `src/index.ts` 引入该新的服务。

### 兼容性
- 该方案仅针对 HHAExchange "Add Document" 弹窗内的 DOM 结构（依赖特定的 `<select>` 值和隐藏的 `<input type="file">` ID）。如果 HHA 更改其内部表单实现，选择器可能需要随之更新。

## 参考资料
- [MDN: File API - constructor](https://developer.mozilla.org/en-US/docs/Web/API/File/File)
- [MDN: DataTransferItem](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem)
