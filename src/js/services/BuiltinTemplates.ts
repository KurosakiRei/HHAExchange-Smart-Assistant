/**
 * BuiltinTemplates - 内置邮件模板
 * Epic 12, Story 9: 预设常用模板
 *
 * 注意：内置模板需要根据实际业务需求单独实现
 * 目前暂时清空，后续再添加
 *
 * ──────────────────────────────────────────────────────────────────────────
 * 【独立渲染路径说明】
 * "Timesheet 提交"内置模板（Epic 16, Story 1）由
 * `TimesheetNotificationTemplate`（src/js/services/builtin/）独立渲染。
 * "Patient Vacation"内置模板（Epic 16, Story 2）由
 * `PatientVacationTemplate`（src/js/services/builtin/）独立渲染。
 * 两者均以"入口卡片"形式注入"内置模板"Tab，而非通过下方的 `MailTemplate[]` 数组
 * 驱动的自定义模板列表，两者是不同的渲染路径，请勿混淆。
 * ──────────────────────────────────────────────────────────────────────────
 */

import { MailTemplate } from "./TemplateManager";

/**
 * 内置模板列表
 * TODO: 根据实际业务需求添加内置模板
 */
export const BUILTIN_TEMPLATES: MailTemplate[] = [];

/**
 * 获取所有内置模板
 */
export function getBuiltinTemplates(): MailTemplate[] {
  return BUILTIN_TEMPLATES;
}

/**
 * 根据页面类型获取内置模板
 */
export function getBuiltinTemplatesByType(
  pageType: "PATIENT" | "CAREGIVER"
): MailTemplate[] {
  return BUILTIN_TEMPLATES.filter(
    (t) => t.targetPageType === pageType || t.targetPageType === "ANY"
  );
}

/**
 * 检查是否为内置模板
 */
export function isBuiltinTemplate(templateId: string): boolean {
  return templateId.startsWith("builtin_");
}
