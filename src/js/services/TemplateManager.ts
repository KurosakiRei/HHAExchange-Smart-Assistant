/**
 * TemplateManager Service
 * Epic 12, Story 3: 模板管理器
 *
 * 处理自定义邮件模板的 CRUD 和导入导出
 * 使用 GM_setValue 持久化存储
 */

declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue(key: string, value: string): void;

/**
 * 邮件模板接口
 */
export interface MailTemplate {
  id: string;
  name: string;
  targetPageType: "PATIENT" | "CAREGIVER" | "ANY";
  to: string;
  cc?: string;
  subject: string;
  body: string;
  variables: TemplateVariable[];
  createdAt: number;
  updatedAt: number;
}

/**
 * 模板变量接口
 */
export interface TemplateVariable {
  placeholder: string; // e.g., "{{patient_name}}"
  selector: string; // CSS selector
  method: "text" | "val" | "attr";
  attrName?: string; // 当 method 为 "attr" 时使用
}

/**
 * 模板管理器
 */
export class TemplateManager {
  private static readonly STORAGE_KEY = "hha_mail_templates";

  /**
   * 获取所有模板
   */
  static getAll(): MailTemplate[] {
    try {
      const stored = GM_getValue<string>(this.STORAGE_KEY, "[]");
      return JSON.parse(stored);
    } catch (error) {
      console.error("[TemplateManager] Error parsing templates:", error);
      return [];
    }
  }

  /**
   * 根据 ID 获取模板
   */
  static getById(templateId: string): MailTemplate | null {
    const templates = this.getAll();
    return templates.find((t) => t.id === templateId) || null;
  }

  /**
   * 保存模板（新增或更新）
   */
  static save(
    template: Omit<MailTemplate, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    }
  ): MailTemplate {
    const templates = this.getAll();
    const now = Date.now();

    if (template.id) {
      // 更新现有模板
      const index = templates.findIndex((t) => t.id === template.id);
      if (index >= 0) {
        const updated: MailTemplate = {
          ...templates[index],
          ...template,
          id: template.id,
          updatedAt: now,
        };
        templates[index] = updated;
        this.saveAll(templates);
        console.log("[TemplateManager] Updated template:", updated.name);
        return updated;
      }
    }

    // 新增模板
    const newTemplate: MailTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    } as MailTemplate;

    templates.push(newTemplate);
    this.saveAll(templates);
    console.log("[TemplateManager] Created template:", newTemplate.name);
    return newTemplate;
  }

  /**
   * 删除模板
   */
  static delete(templateId: string): boolean {
    const templates = this.getAll();
    const index = templates.findIndex((t) => t.id === templateId);

    if (index >= 0) {
      const deleted = templates.splice(index, 1)[0];
      this.saveAll(templates);
      console.log("[TemplateManager] Deleted template:", deleted.name);
      return true;
    }

    return false;
  }

  /**
   * 导出为 JSON 文件下载
   */
  static exportToFile(): void {
    const templates = this.getAll();
    const json = JSON.stringify(templates, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `hha-mail-templates-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    console.log("[TemplateManager] Exported", templates.length, "templates");
  }

  /**
   * 从文件导入
   * @returns 导入的模板数量
   */
  static async importFromFile(file: File): Promise<number> {
    const text = await file.text();

    let imported: MailTemplate[];
    try {
      imported = JSON.parse(text) as MailTemplate[];
    } catch (error) {
      throw new Error("无法解析 JSON 文件，请检查文件格式。");
    }

    if (!Array.isArray(imported)) {
      throw new Error("导入的数据格式不正确，应为模板数组。");
    }

    // 验证模板结构
    for (const template of imported) {
      if (!template.name || !template.subject) {
        throw new Error(`模板 "${template.name || "未知"}" 缺少必要字段。`);
      }
    }

    // 合并到现有模板（按 ID 去重）
    const existing = this.getAll();
    const existingIds = new Set(existing.map((t) => t.id));

    let addedCount = 0;
    for (const template of imported) {
      if (!existingIds.has(template.id)) {
        // 确保有时间戳
        if (!template.createdAt) template.createdAt = Date.now();
        if (!template.updatedAt) template.updatedAt = Date.now();

        existing.push(template);
        addedCount++;
      }
    }

    this.saveAll(existing);
    console.log("[TemplateManager] Imported", addedCount, "new templates");
    return addedCount;
  }

  /**
   * 根据页面类型筛选模板
   */
  static getByPageType(pageType: "PATIENT" | "CAREGIVER"): MailTemplate[] {
    return this.getAll().filter(
      (t) => t.targetPageType === pageType || t.targetPageType === "ANY"
    );
  }

  /**
   * 保存所有模板到 GM_setValue
   */
  private static saveAll(templates: MailTemplate[]): void {
    GM_setValue(this.STORAGE_KEY, JSON.stringify(templates));
  }

  /**
   * 生成唯一 ID
   */
  private static generateId(): string {
    return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建默认示例模板（仅用于首次使用）
   */
  static createDefaultTemplates(): void {
    const templates = this.getAll();
    if (templates.length > 0) return;

    // 创建默认模板
    this.save({
      name: "Staff Leaving Form",
      targetPageType: "CAREGIVER",
      to: "SNazarov@AlwaysNY.net",
      cc: "",
      subject: "Aide: {{aide_name}} {{aide_id}} Staff Leaving Form",
      body: `<div data-olk-copy-source="MessageBody">Hello Serge,&nbsp;</div>
<div aria-hidden="true">&nbsp;</div>
<div>Please see the attachment.</div>`,
      variables: [],
    });

    this.save({
      name: "Vacation/Sick Hours",
      targetPageType: "CAREGIVER",
      to: "SNazarov@AlwaysNY.net",
      cc: "",
      subject: "Aide: {{aide_name}} {{aide_id}} Vacation/Sick Hours",
      body: `<div data-olk-copy-source="MessageBody">Hello Serge,</div>
<div>&nbsp;</div>
<div>Could you please provide me the vacation and sick hours for the aide?</div>`,
      variables: [],
    });

    console.log("[TemplateManager] Created default templates");
  }
}
