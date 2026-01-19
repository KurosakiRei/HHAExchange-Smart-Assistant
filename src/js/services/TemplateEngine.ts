/**
 * TemplateEngine Service
 * Epic 12, Story 4: 模板变量替换引擎
 *
 * 处理模板中的变量占位符替换
 * 支持内置变量和自定义 CSS 选择器变量
 */

import { ProfileData } from "./ProfileDataExtractor";
import { MailTemplate, TemplateVariable } from "./TemplateManager";

/**
 * 渲染后的邮件内容
 */
export interface RenderedEmail {
  to: string;
  cc: string;
  subject: string;
  body: string;
}

/**
 * 模板变量引擎
 */
export class TemplateEngine {
  /**
   * 内置变量映射
   * 这些变量可以直接使用 ProfileData 中的数据
   */
  private static readonly BUILTIN_VARIABLES: Record<
    string,
    (data: ProfileData) => string
  > = {
    // 病人相关变量
    "{{patient_name}}": (data) => (data.type === "PATIENT" ? data.name : ""),
    "{{patient_id}}": (data) => (data.type === "PATIENT" ? data.id : ""),
    "{{patient_dob}}": (data) =>
      data.type === "PATIENT" ? data.dob || "" : "",
    "{{patient_phone}}": (data) =>
      data.type === "PATIENT" ? data.phone || "" : "",
    "{{patient_address}}": (data) =>
      data.type === "PATIENT" ? data.address || "" : "",
    "{{patient_insurance}}": (data) =>
      data.type === "PATIENT" ? data.insurance || "" : "",

    // 护理员相关变量
    "{{aide_name}}": (data) => (data.type === "CAREGIVER" ? data.name : ""),
    "{{aide_id}}": (data) => (data.type === "CAREGIVER" ? data.id : ""),
    "{{caregiver_name}}": (data) =>
      data.type === "CAREGIVER" ? data.name : "",
    "{{caregiver_id}}": (data) => (data.type === "CAREGIVER" ? data.id : ""),
    "{{caregiver_dob}}": (data) =>
      data.type === "CAREGIVER" ? data.dob || "" : "",
    "{{caregiver_phone}}": (data) =>
      data.type === "CAREGIVER" ? data.phone || "" : "",
    "{{caregiver_address}}": (data) =>
      data.type === "CAREGIVER" ? data.address || "" : "",

    // 通用变量
    "{{name}}": (data) => data.name,
    "{{id}}": (data) => data.id,
    "{{dob}}": (data) => data.dob || "",
    "{{phone}}": (data) => data.phone || "",
    "{{address}}": (data) => data.address || "",

    // 日期变量
    "{{today}}": () => new Date().toLocaleDateString("en-US"),
    "{{today_cn}}": () => new Date().toLocaleDateString("zh-CN"),
    "{{now}}": () => new Date().toLocaleString("en-US"),
  };

  /**
   * 渲染模板
   * 将模板中的变量替换为实际值
   */
  static render(
    template: MailTemplate,
    profileData: ProfileData | null
  ): RenderedEmail {
    return {
      to: this.replaceVariables(template.to, profileData, template.variables),
      cc: this.replaceVariables(
        template.cc || "",
        profileData,
        template.variables
      ),
      subject: this.replaceVariables(
        template.subject,
        profileData,
        template.variables
      ),
      body: this.replaceVariables(
        template.body,
        profileData,
        template.variables
      ),
    };
  }

  /**
   * 替换字符串中的变量
   */
  private static replaceVariables(
    text: string,
    profileData: ProfileData | null,
    customVariables: TemplateVariable[]
  ): string {
    if (!text) return text;

    let result = text;

    // 1. 替换内置变量
    if (profileData) {
      for (const [placeholder, getter] of Object.entries(
        this.BUILTIN_VARIABLES
      )) {
        if (result.includes(placeholder)) {
          const value = getter(profileData);
          result = result.split(placeholder).join(value);
        }
      }
    }

    // 2. 替换自定义变量（通过 CSS 选择器获取）
    for (const variable of customVariables) {
      if (result.includes(variable.placeholder)) {
        const value = this.extractValueBySelector(variable);
        result = result.split(variable.placeholder).join(value);
      }
    }

    // 3. 清理未替换的变量（替换为空字符串）
    result = result.replace(/\{\{[^}]+\}\}/g, "");

    return result;
  }

  /**
   * 通过 CSS 选择器提取值
   */
  private static extractValueBySelector(variable: TemplateVariable): string {
    try {
      const element = document.querySelector(variable.selector);
      if (!element) return "";

      switch (variable.method) {
        case "text":
          return element.textContent?.trim() || "";
        case "val":
          return (element as HTMLInputElement).value?.trim() || "";
        case "attr":
          return variable.attrName
            ? element.getAttribute(variable.attrName) || ""
            : "";
        default:
          return element.textContent?.trim() || "";
      }
    } catch (error) {
      console.error(
        `[TemplateEngine] Error extracting value for ${variable.placeholder}:`,
        error
      );
      return "";
    }
  }

  /**
   * 解析模板中使用的变量列表
   */
  static parseVariables(text: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      const placeholder = `{{${match[1]}}}`;
      if (!variables.includes(placeholder)) {
        variables.push(placeholder);
      }
    }

    return variables;
  }

  /**
   * 检查变量是否为内置变量
   */
  static isBuiltinVariable(placeholder: string): boolean {
    return placeholder in this.BUILTIN_VARIABLES;
  }

  /**
   * 获取所有内置变量列表
   */
  static getBuiltinVariables(): string[] {
    return Object.keys(this.BUILTIN_VARIABLES);
  }

  /**
   * 预览模板渲染结果
   * 用于在编辑器中实时预览
   */
  static preview(
    template: Partial<MailTemplate>,
    profileData: ProfileData | null
  ): RenderedEmail {
    return {
      to: this.replaceVariables(template.to || "", profileData, []),
      cc: this.replaceVariables(template.cc || "", profileData, []),
      subject: this.replaceVariables(template.subject || "", profileData, []),
      body: this.replaceVariables(template.body || "", profileData, []),
    };
  }
}
