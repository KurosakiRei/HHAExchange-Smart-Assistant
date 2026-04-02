# Epic 13: Outlook CSP Bypass 彻底重构 (String Payload 方案)

## Epic 概述

| 属性           | 值                                                                        |
| -------------- | ------------------------------------------------------------------------- |
| **Epic ID**    | EPIC-013                                                                  |
| **标题**       | Outlook CSP Bypass 彻底重构 (String Payload 方案)                         |
| **优先级**     | P0 - Critical (阻塞邮件助手核心运作)                                      |
| **状态**       | ✅ completed (已实现，含全链路 bug 修复，v3.13.0 生产验证通过)             |
| **预估工作量** | 3 个 Story                                                                |
| **关联系统**   | HHAExchange Mail Builder Tab, Outlook Web (OWA)                           |
| **背景技术债** | Epic 12 中由于 CSP 拦截导致 Outlook 页面注入失效（相关于放弃的 Story 11） |

## 背景与目标

### 问题现状
在 Epic 12 (邮件助手) 的开发中，为了让 HHAExchange 提取的信息能够自动填充到 Outlook 的网页版写信窗口，最初（Story 8）使用了标准的 `document.createElement('script')` 和 DOM 操作。但由于 Outlook 启用极其严格的 Content-Security-Policy (CSP)，所有非法内联脚本都被拦截，导致自动化填充功能**完全崩溃**。

另外，如果像常规前端项目一样将特定于 Outlook 的脚本功能独立成模块动态加载，会导致 Webpack 打包时产生代码分割 (Code Splitting，生成多个 `.chunk.js`)，从而**直接破坏 Tampermonkey 用户脚本必须是单文件 (`.user.js`) 的环境要求**，会使其在 HHAExchange 环境下也无法正常加载和运行。

### 本次重构目标
本 Epic 旨在彻底解决 CSP 拦截问题且坚决保证单文件编译环境：

1. **绝对禁止 Webpack 代码分割**：采用 **String Payload 取代代码块引入**的架构设计。将专门给 Outlook 运行的原生 JavaScript 操作封装为一段**纯长字符串常量**（或在编译时强制内联为文本）。
2. **利用特权 API 突破 CSP**：主业务逻辑引入上述长字符串，并使用 Tampermonkey 的安全特权 API `GM.addElement`（或 `GM_addElement`）将其作为 "扩展应用行为" 注入 Outlook 的 `<head>` 或 `<body>`，合法绕过页面的原有 CSP 限制。
3. **安全稳定的事件通讯**：注入的 Payload 脚本与宿主 Userscript（也就是 `OutlookAdapter`）之间，依靠原生的 `window.CustomEvent` 建立可靠的任务投递和状态回收通讯桥梁。

---

## 核心架构设计

### 1. Payload 字符串设计
创建一个独立的文件专门存放这段复杂的、供 Outlook 消费的纯字符串：
`src/js/services/OutlookDOMControllerPayload.ts`

```typescript
// 将整个立即执行函数(IIFE)以纯文本字符串方式导出，Webpack会将它作为静态常量打包
export const OutlookDOMControllerPayload = \`
(function() {
  'use strict';
  // ... 所有的 Outlook DOM 操作逻辑放到这里 ...
  // 如 document.querySelector('button[aria-label="New mail"]').click();
  // 必须是自包含的，绝不使用 import 或 require
  
  // 监听并执行发来的信息，操作结束后用 CustomEvent 通知出去
})();
\`;
```

### 2. Outlook 适配器重构架构示意
```text
┌───────────────────────────────────────┐
│ userscript主环境 (Tampermonkey上下文)  │
│                                       │
│ 1. 拦截到 hha_mail_service_bus 有新任务  │
│ 2. 验证当前在 Outlook 页面              │
│ 3. 提取 OutlookDOMControllerPayload 串 │
│ 4. 调用 GM.addElement 注入这段文本      │
└──────────────┬────────────────────────┘
               │
               │ (GM.addElement 安全通道跨过CSP)
               ▼
┌───────────────────────────────────────┐
│ Outlook 主页世界 (Main World)          │
│                                       │
│ 1. 脚本被浏览器视为可信，开始执行          │
│ 2. 收到邮件填充数据并点击、打字            │
│ 3. 抛出 CustomEvent 报告 "SUCCESS"   │
└──────────────┬────────────────────────┘
               │ 
               │ (通过 document.dispatchEvent 返回握手)
               ▼
┌───────────────────────────────────────┐
│ userscript主环境                        │
│ 1. 监听到 SUCCESS                      │
│ 2. 变更状态，反馈给 HHA                 │
└───────────────────────────────────────┘
```

---

## 验收标准 (Epic 级别)

### 强制技术标准
- [x] 构建产物 `dist/index.prod.user.js` **必须**是单一文件，绝对不允许出现 Webpack 打包产生的任何外部 `.chunk.js` 散落。
- [x] 在 `metadata.cjs` 中必须申请 `@grant GM.addElement`。

### 功能体验标准
- [x] 开启插件并在 HHA 选择某个病人模板，点击"发送到 Outlook"后。
- [x] 成功自动呼出 Outlook 写信面板。
- [x] Outlook 上的 To、CC、Subject、Body 等字段成功被正确回填，并且没有破坏 Outlook 原有的保存收件人、换行、或样式格式。
- [x] 浏览器的 Console 不再飘红显示 CSP 拦截错误 (`Refused to execute inline script because it violates CSP`)。

### 降级处理标准
- [x] 若使用者所安装的 Tampermonkey 版本过于古老，不支持 `GM.addElement` API，能够体面地检测到并在 UI 上提示用户升级（不让整个脚本崩溃）。

---

## Story 拆分

### Story 1: 基础设施搭建 - String Payload 注入器
**目标**: 创建核心的纯文本载荷包结构，并用 `GM.addElement` 打通沙盒注入。

**任务列表**:
- [x] 更新 `config/metadata.cjs` 的 `@grant` 列表，加入必需的 `GM.addElement`（或其兼容形式）。
- [x] 新建 `src/js/services/OutlookDOMControllerPayload.ts`，并写入一个 `export const` 字面量字符串占位（内含只用来 console.log 的探路代码）。
- [x] 新建 `src/js/services/CSPBypassInjector.ts` 提供工具方法，负责检查 API 的存在性并执行 `GM.addElement` 注入。

---

### Story 2: 原生 Outlook 自动化交互代码重写
**目标**: 将之前的 OutlookAdapter 内部操控 DOM 的逻辑全部挪进字符串长文本中，并保证可以无损寻找并操作元素。

**任务列表**:
- [x] 在 `OutlookDOMControllerPayload.ts` 的长字符串里完成基于 `document.querySelector` 的查元素操作。
- [x] 实现原生的 React/Angular 事件触发机制（因为 Outlook 是单页应用，简单的 `.value = 'x'` 可能无法更新其内部状态，需要触发原生的 `input` 或 `change` 事件）。
- [x] 建立 Payload 和适配器外壳之间基于 `window.CustomEvent` 的握手（用于发任务和回传状态）。

---

### Story 3: 适配器组装与全链路贯通
**目标**: 重写 `src/js/services/OutlookAdapter.ts`（外壳），串联收发组件，解决所有悬空逻辑并测试。

**任务列表**:
- [x] 清理老版 `OutlookAdapter.ts` 中废弃阻塞的纯 DOM 操作，转为调用 Injector 注入。
- [x] 处理监听逻辑，监听 `hha_mail_service_bus` 的任务变化。
- [x] 接住 Payload 抛出的 `CustomEvent` 状态结果（成功/失败），再写回存储让 HHA 端知道。
- [x] 编译测试，并最终验证生成文件是不是 100% 单纯唯一的文件。

---

---

## 变更日志

| 日期       | 版本 | 变更内容                              | 作者              |
| ---------- | ---- | ------------------------------------- | ----------------- |
| 2026-03-19 | 1.0  | Epic 初始实现完成：CSPBypassInjector、OutlookDOMControllerPayload、OutlookAdapter 全部落地 | Dev Agent |
| 2026-04-01 | 1.1  | Bug Fix: `MailService.isOutlookPage()` 新增 `outlook.cloud.microsoft` 支持；`config/metadata.cjs` match/connect 规则补充新版 Outlook URL，修复在新版 Outlook 中 OutlookAdapter 无法初始化的问题 | Dev Agent |
| 2026-04-02 | 1.2  | Bug Fix (v3.13.0): To/CC 地址确认改用建议下拉点击方案（CDP 验证 selector）；Subject 填写用 native setter + _valueTracker 重置；isOutlookPage 增加 /mail path 限制排除 To-Do 等套件页面；handleMailTask 加 isHandlingTask 互锁；Outlook 页面跳过 style-loader 消除 CSP 报错；compose 打开后加 500ms 等待；hha-outlook-helper/ 彻底清理 | Dev Agent |
