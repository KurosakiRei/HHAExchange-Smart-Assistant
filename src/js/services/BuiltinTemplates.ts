/**
 * BuiltinTemplates - 内置邮件模板
 * Epic 12, Story 9: 预设常用模板
 *
 * 注意：内置模板需要根据实际业务需求单独实现
 * 目前暂时清空，后续再添加
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
