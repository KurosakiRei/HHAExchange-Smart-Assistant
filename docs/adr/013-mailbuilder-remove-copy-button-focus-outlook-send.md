# ADR-013: Mail Builder 模板卡片移除复制按钮，聚焦 Outlook 发送

## 状态
Accepted (2026-04-03)

## 背景

Epic 12 Mail Builder 的模板卡片操作区最初提供两个主要操作：
- **📋 复制**（`use-btn`）：将邮件内容（To/CC/Subject/Body 拼接文本）复制到剪贴板
- **📧 Outlook**（`outlook-btn`）：通过跨 Tab 注入方式在 Outlook Web 中自动填充并创建邮件草稿

经过实际使用发现，复制功能存在以下问题：
1. **体验割裂**：复制后仍需用户手动打开 Outlook、新建邮件、分别粘贴各字段，操作步骤多
2. **HTML 正文不兼容**：正文为富文本（HTML），复制到剪贴板为纯文本，格式丢失
3. **实际使用率极低**：Outlook 跨 Tab 注入功能（Epic 12/13 CSP 合规方案）稳定后，没有理由退回复制方式

与此同时，Epic 16 Story 1 的内置模板交互设计确立了"Send to Outlook 为唯一发送操作"的原则，与自定义模板保持一致性的需要也促使此次统一清理。

## 决策

**移除模板卡片上的"复制"按钮**，内置模板和自定义模板统一仅保留 `📧 Outlook` 按钮作为主操作。

具体变更：
1. `MailBuilderTab.ts` — `renderTemplateCard()`：删除内置和自定义模板两个分支中的 `use-btn` 按钮 HTML
2. `MailBuilderTab.ts` — `setupTemplatePanelHandlers()`：删除 `.use-btn` 的 `querySelectorAll` 事件绑定块

`useTemplate()` 方法及 `copyToClipboard()` 辅助方法保留（暂不删除），以防后续有其他调用方。

**同步更新默认模板内容**（`TemplateManager.createDefaultTemplates()`）：
- 旧内容："护理员请假通知"、"病人信息请求"（示例占位数据，收件人为 `example.com`）
- 新内容：`Staff Leaving Form`、`Vacation/Sick Hours`（来自实际业务导出的真实模板，收件人 `SNazarov@AlwaysNY.net`）

> 注：`createDefaultTemplates()` 受 `if (templates.length > 0) return` 守卫保护，仅在 GM storage 为空时执行。已有数据的用户需手动清除旧模板或通过导入功能覆盖。

## 影响

### 正面影响
- 操作区 UI 更简洁，用户选择路径清晰
- 与 Epic 16 内置模板的交互设计保持一致（统一"Send to Outlook"语言）
- 消除了 HTML 正文被剪贴板截断/格式丢失的潜在问题

### 负面影响 / 限制
- 用户在 **Outlook Tab 未打开** 的情况下无法发送邮件（原复制方案可作为降级路径）
  - 现有缓解措施：`MailService` 在 Outlook Tab 未就绪时会返回超时错误提示，引导用户先打开 Outlook

## 备选方案

- **保留复制作为次要操作（小图标，不显眼）**：被否决，增加 UI 复杂度，且无实际需求场景支撑
- **同时提供"复制"和"Outlook"，用户自选**：被否决，feature parity 维护成本高，复制方案问题（格式丢失）无法根本解决
