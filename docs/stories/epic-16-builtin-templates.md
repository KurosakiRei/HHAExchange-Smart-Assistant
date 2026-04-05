# Epic 16: 内置模板体系（Built-in Templates Domain）

## Epic 概述

| 属性           | 值                                                              |
| -------------- | --------------------------------------------------------------- |
| **Epic ID**    | EPIC-016                                                        |
| **标题**       | Built-in Templates — 邮件助手内置模板能力域                    |
| **优先级**     | P1 - 高优先级                                                   |
| **状态**       | 🔄 Ongoing（开放域，随模板持续扩展，永不关闭）                  |
| **关联系统**   | MailBuilderTab, PrebillingTableParser, MailService, GM_setValue |
| **所属功能**   | Epic 12 Mail Builder 的内置能力扩展                             |

> ⚠️ **注意**：此 Epic 为"开放能力域"，不追求关闭状态。每新增一个内置模板即新增一个 Story。Epic 本文件维护设计原则、接口约定和所有模板的状态索引。

---

## 背景

Epic 12 建立了邮件助手的完整基础框架（自定义模板系统、Outlook 跨 Tab 注入、CSP 合规方案）。内置模板体系（Epic 16）在此之上，将**具有固定业务逻辑的高频邮件场景**以硬编码方式内置，无需用户手动配置即可开箱使用，同时保留关键参数（如收件人）的可配置性。

与自定义模板的核心区别：
- **自定义模板**：用户自行定义所有字段，依赖手动变量替换
- **内置模板**：逻辑由代码实现，可访问页面 DOM 或执行复杂计算，UI 交互也由模板自身定义（如弹出 Modal、列表展示等）

---

## 设计原则

1. **每个内置模板是独立的服务类**，封装自己的 UI 渲染、轮询、配置管理和发送逻辑
2. **入口统一通过 MailBuilderTab 的"内置模板"Tab 展示**，每个模板渲染为一张入口卡片
3. **卡片必须展示适用页面 Tag**，并在用户不在目标页面时自动置灰、禁止开启
4. **配置项使用 `GM_setValue` 持久化**，各模板使用独立的 Storage Key（命名规范：`hha_builtin_<template_id>_config`）
5. **轮询仅在模板交互界面（如 Modal）打开时运行**，关闭即停，节省资源
6. **复用已有服务**：页面检测复用 `PageDetector`，Outlook 发送复用 `MailService`，DOM 解析尽量扩展已有 Parser（如 `PrebillingTableParser`），避免重复造轮

---

## 内置模板接口约定

每个内置模板服务类应实现以下接口（非强制 TypeScript interface，但作为设计契约）：

```typescript
interface BuiltinTemplateService {
  /** 渲染入口卡片，挂载到给定容器 */
  renderEntryCard(container: HTMLElement): void;
  /** 销毁：移除事件监听器、停止轮询、关闭 Modal */
  destroy(): void;
}
```

入口卡片结构约定（HTML 骨架）：

```html
<div class="builtin-template-card [disabled?]">
  <div class="builtin-card-header">
    <span class="builtin-card-title">[模板名称]</span>
    <span class="builtin-card-page-tag">[目标页面名]</span>  <!-- 必须存在 -->
  </div>
  <div class="builtin-card-preview">[简短描述]</div>
  <!-- 当 disabled 时，覆盖一层灰色遮罩，pointer-events: none -->
</div>
```

---

## Story 索引

| Story ID | 模板名称           | 目标页面              | 状态       | 文件                                              |
| -------- | ------------------ | --------------------- | ---------- | ------------------------------------------------- |
| 16.1     | Timesheet 提交通知    | Prebilling Review     | ✅ 已完成  | [epic-16-story-1-timesheet-notification.md](epic-16-story-1-timesheet-notification.md) |
| 16.2     | Patient Vacation 通知 | Patient Profile       | 📝 计划中  | [epic-16-story-2-patient-vacation.md](epic-16-story-2-patient-vacation.md)              |

---

## 文档更新规范

每次新增 Story，必须同步更新本文件的**Story 索引表**，填写 Story ID、模板名称、目标页面和初始状态。
