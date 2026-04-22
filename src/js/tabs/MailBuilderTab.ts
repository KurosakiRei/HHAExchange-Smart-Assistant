import { BaseTab } from "./BaseTab";
import {
  ProfileDataExtractor,
  ProfilePageType,
  ProfileData,
} from "../services/ProfileDataExtractor";
import { TemplateManager, MailTemplate } from "../services/TemplateManager";
import { TemplateEngine } from "../services/TemplateEngine";
import { MailService } from "../services/MailService";
import {
  getBuiltinTemplates,
  isBuiltinTemplate,
} from "../services/BuiltinTemplates";
import { TimesheetNotificationTemplate } from "../services/builtin/TimesheetNotificationTemplate";
import { PatientVacationTemplate } from "../services/builtin/PatientVacationTemplate";
import { EodReportTemplate } from "../services/builtin/EodReportTemplate";
import { EmploymentActivationTemplate } from "../services/builtin/EmploymentActivationTemplate";
import { PageDetector } from "../services/PageDetector";
import { matchInsurance } from "../utils/InsuranceMatcher";
import { FaxPreviewModal } from "../components/FaxPreviewModal";

declare const unsafeWindow: Window;

/**
 * Mail Builder Tab
 * Epic 12: 智能邮件构筑助手
 *
 * 功能：
 * - 自动检测当前页面（病人 / 护理员）
 * - 从页面 DOM 提取关键信息
 * - 左侧展示提取的信息，支持一键复制
 * - 右侧管理邮件模板（内置 + 自定义）
 */
export class MailBuilderTab extends BaseTab {
  id = "mail-builder";
  label = "邮件助手";
  icon = "📧";

  private currentPageType: ProfilePageType = "UNKNOWN";
  private profileData: ProfileData | null = null;
  private pageChangeHandler: ((pageType: ProfilePageType) => void) | null =
    null;

  // Template state
  private templates: MailTemplate[] = [];
  private activeTemplateTab: "builtin" | "custom" = "custom";
  private editingTemplate: MailTemplate | null = null;
  private isEditorOpen: boolean = false;
  private editorDirty: boolean = false;
  private timesheetTemplate: TimesheetNotificationTemplate | null = null;
  private patientVacationTemplate: PatientVacationTemplate | null = null;
  private eodReportTemplate: EodReportTemplate | null = null;
  private employmentActivationTemplate: EmploymentActivationTemplate | null =
    null;

  async init(): Promise<void> {
    this.initialized = true;
    // Load templates
    this.templates = TemplateManager.getAll();
    // Create default templates if none exist
    if (this.templates.length === 0) {
      TemplateManager.createDefaultTemplates();
      this.templates = TemplateManager.getAll();
    }
    console.log(
      "[MailBuilderTab] Initialized with",
      this.templates.length,
      "templates"
    );
  }

  render(container: HTMLElement): void {
    this.container = container;
    container.classList.add("mail-builder-tab");

    // 每次渲染时重新加载模板（解决页面刷新后模板不显示的问题）
    this.templates = TemplateManager.getAll();

    // 检测当前页面类型
    this.currentPageType = ProfileDataExtractor.getCurrentPageType();
    this.profileData = ProfileDataExtractor.extract();

    // 渲染对应的 UI
    this.renderContent();

    // 如果是病人内页，尝试在 iframe 加载完成后刷新保险数据（解决时序问题）
    if (this.currentPageType === "PATIENT_INTERNAL") {
      const iframe = document.getElementById(
        "iframefrmRightSide"
      ) as HTMLIFrameElement | null;
      if (iframe && iframe.contentDocument?.readyState !== "complete") {
        const refreshOnIframeLoad = () => {
          const fresh = ProfileDataExtractor.extract();
          const oldCount = this.profileData?.insurances?.length ?? 0;
          if ((fresh?.insurances?.length ?? 0) > oldCount) {
            this.profileData = fresh;
            const existingPanel = this.container?.querySelector(
              ".mail-builder-info-panel"
            ) as HTMLElement | null;
            if (existingPanel) {
              existingPanel.replaceWith(this.renderInfoPanel());
              this.setupCopyHandlers(
                this.container?.querySelector(
                  ".mail-builder-info-panel"
                ) as HTMLElement
              );
            }
          }
          iframe.removeEventListener("load", refreshOnIframeLoad);
        };
        iframe.addEventListener("load", refreshOnIframeLoad);
      }
    }

    // 监听页面变化
    this.pageChangeHandler = (pageType: ProfilePageType) => {
      if (pageType !== this.currentPageType) {
        this.currentPageType = pageType;
        this.profileData = ProfileDataExtractor.extract();
        this.renderContent();
      }
    };
    ProfileDataExtractor.onPageChange(this.pageChangeHandler);
  }

  /**
   * 根据页面类型渲染内容
   */
  private renderContent(): void {
    if (!this.container) return;

    // 清空容器
    this.container.innerHTML = "";

    // 始终渲染主布局，根据页面类型决定是否显示左侧信息面板
    this.renderMainLayout();
  }

  /**
   * 渲染主布局
   * - 在个人信息页面：35% 左侧信息区 + 65% 右侧模板区
   * - 在其他页面：100% 模板区
   */
  private renderMainLayout(): void {
    if (!this.container) return;

    const isProfilePage = ProfileDataExtractor.isProfilePage(
      this.currentPageType
    );

    const wrapper = document.createElement("div");
    wrapper.className = "mail-builder-wrapper";

    // Header
    const header = this.renderHeader();
    wrapper.appendChild(header);

    // 主内容区
    const mainContent = document.createElement("div");
    mainContent.className = isProfilePage
      ? "mail-builder-main"
      : "mail-builder-main full-width";

    // 仅在个人信息页面显示左侧信息面板
    if (isProfilePage) {
      const infoPanel = this.renderInfoPanel();
      mainContent.appendChild(infoPanel);
    }

    // 右侧模板面板（或全宽模板面板）
    const templatePanel = this.renderTemplatePanel();
    mainContent.appendChild(templatePanel);

    wrapper.appendChild(mainContent);
    this.container.appendChild(wrapper);
  }

  /**
   * 渲染 Header
   */
  private renderHeader(): HTMLElement {
    const header = document.createElement("div");
    header.className = "mail-builder-header";

    header.innerHTML = `
      <h3 class="mail-builder-title">📧 邮件助手</h3>
      <span class="mail-builder-page-tag">当前页面：${ProfileDataExtractor.getPageDisplayName(
        this.currentPageType
      )}</span>
    `;

    return header;
  }

  /**
   * 渲染左侧信息面板
   */
  private renderInfoPanel(): HTMLElement {
    const panel = document.createElement("div");
    panel.className = "mail-builder-info-panel";

    if (!this.profileData) {
      panel.innerHTML = `
        <div class="mail-builder-no-data">
          <span>⚠️ 无法提取页面数据</span>
        </div>
      `;
      return panel;
    }

    // 构建信息字段列表
    const fields = this.buildFieldsList();
    const isPatientInternal = this.currentPageType === "PATIENT_INTERNAL";

    const list = document.createElement("div");
    list.className = "mail-builder-info-list";

    fields.forEach((field) => {
      const item = document.createElement("div");
      item.className = "mail-builder-info-item";

      const labelEl = document.createElement("span");
      labelEl.className = "info-label";
      labelEl.textContent = `${field.label}:`;

      const valueEl = document.createElement("span");
      valueEl.className = "info-value";
      valueEl.title = field.value;
      valueEl.textContent = this.truncateText(field.value, 20);

      item.appendChild(labelEl);
      item.appendChild(valueEl);

      // 复制按钮（所有字段都有）
      const copyBtn = document.createElement("button");
      copyBtn.className = "info-copy-btn";
      copyBtn.dataset.value = field.value;
      copyBtn.title = "复制";
      copyBtn.textContent = "📋";
      item.appendChild(copyBtn);

      if (field.isInsurance) {
        // 传真按钮
        const faxBtn = document.createElement("button");
        faxBtn.className = "info-fax-btn";
        faxBtn.title = isPatientInternal
          ? "创建传真模板"
          : "仅在病人档案页可用";
        faxBtn.textContent = "📠";
        if (!isPatientInternal) {
          faxBtn.disabled = true;
          faxBtn.classList.add("disabled");
        } else {
          faxBtn.addEventListener("click", () => {
            const insuranceRecord = matchInsurance(field.value);
            const modal = new FaxPreviewModal({
              profileData: this.profileData!,
              insuranceName: field.value,
              insuranceRecord,
            });
            modal.open();
          });
        }
        item.appendChild(faxBtn);
      } else if (field.isPhone) {
        // 拨打按钮
        const dialBtn = document.createElement("a");
        dialBtn.className = "info-dial-btn";
        dialBtn.href = `tel:${field.value}`;
        dialBtn.title = "拨打";
        dialBtn.textContent = "📞";
        item.appendChild(dialBtn);
      }

      list.appendChild(item);
    });

    panel.appendChild(list);

    const quickCopy = document.createElement("div");
    quickCopy.className = "mail-builder-quick-copy";
    quickCopy.innerHTML = `<button class="quick-copy-btn" id="copy-name-id">📋 复制 名字+ID</button>`;
    panel.appendChild(quickCopy);

    // 添加事件监听
    this.setupCopyHandlers(panel);

    return panel;
  }

  /**
   * 构建字段列表
   */
  private buildFieldsList(): Array<{
    label: string;
    value: string;
    isInsurance?: boolean;
    isPhone?: boolean;
  }> {
    if (!this.profileData) return [];

    const fields: Array<{
      label: string;
      value: string;
      isInsurance?: boolean;
      isPhone?: boolean;
    }> = [
      { label: "名字", value: this.profileData.name },
      { label: "ID", value: this.profileData.id },
    ];

    if (this.profileData.dob) {
      fields.push({ label: "生日", value: this.profileData.dob });
    }

    // 多电话：展示 phones 数组（Epic 17），fallback to single phone
    // 始终将 phone 字段（Home Phone）作为 Phone 1 前置，避免被子菜单遮漏
    if (this.profileData.phones && this.profileData.phones.length > 0) {
      const primaryPhone = this.profileData.phone;
      const inSubMenu = this.profileData.phones.some(
        (p) => p.number === primaryPhone
      );
      if (primaryPhone && !inSubMenu) {
        fields.push({ label: "电话 1", value: primaryPhone, isPhone: true });
      }
      this.profileData.phones.forEach((entry) => {
        fields.push({
          label: this.shortenPhoneLabel(entry.label),
          value: entry.number,
          isPhone: true,
        });
      });
    } else if (this.profileData.phone) {
      fields.push({
        label: "电话 1",
        value: this.profileData.phone,
        isPhone: true,
      });
    }

    if (this.profileData.address) {
      fields.push({ label: "地址", value: this.profileData.address });
    }

    // 多保险：展示 insurances 数组（Epic 17），多条时加编号
    if (this.profileData.insurances && this.profileData.insurances.length > 0) {
      const multi = this.profileData.insurances.length > 1;
      this.profileData.insurances.forEach((name, idx) => {
        fields.push({
          label: multi ? `保险${idx + 1}` : "保险",
          value: name,
          isInsurance: true,
        });
      });
    } else if (this.profileData.insurance) {
      fields.push({
        label: "保险",
        value: this.profileData.insurance,
        isInsurance: true,
      });
    }

    return fields;
  }

  /**
   * 缩短电话标签：
   * "Patient Phone N" → "Phone N"
   * "Emergency Phone N" → "EMC N"
   * "Home Phone" → "Phone 1"
   */
  private shortenPhoneLabel(label: string): string {
    const s = label.trim();
    // Check Emergency first (before generic Phone match)
    const em = s.match(/Emergency\s+Phone\s*(\d+)/i);
    if (em) return `紧急 ${em[1]}`;
    if (/Emergency\s+Phone/i.test(s)) return "紧急";
    if (/Home\s+Phone/i.test(s)) return "电话 1";
    // Match any "[Patient ]Phone N" substring — tolerates trailing garbage
    const pm = s.match(/(?:Patient\s+)?Phone\s*(\d+)/i);
    if (pm) return `电话 ${pm[1]}`;
    return s.replace(/^Patient\s+/i, "");
  }

  /**
   * 渲染右侧模板面板
   */
  private renderTemplatePanel(): HTMLElement {
    const panel = document.createElement("div");
    panel.className = "mail-builder-template-panel";
    panel.id = "mail-builder-template-panel";

    // 模板 Tabs
    const tabs = document.createElement("div");
    tabs.className = "mail-builder-template-tabs";
    tabs.innerHTML = `
            <button class="template-tab-btn ${
              this.activeTemplateTab === "builtin" ? "active" : ""
            }" data-tab="builtin">内置模板</button>
            <button class="template-tab-btn ${
              this.activeTemplateTab === "custom" ? "active" : ""
            }" data-tab="custom">自定义模板</button>
        `;
    panel.appendChild(tabs);

    // 模板内容区 - 始终显示模板列表
    const content = document.createElement("div");
    content.className = "mail-builder-template-content";
    content.id = "template-content-area";
    content.appendChild(this.renderTemplateList());
    panel.appendChild(content);

    // 底部操作按钮
    const actions = document.createElement("div");
    actions.className = "mail-builder-template-actions";
    actions.innerHTML = `
            <button class="template-action-btn" id="add-template-btn">+ 添加模板</button>
            <button class="template-action-btn" id="export-btn">⬇ 导出</button>
            <button class="template-action-btn" id="import-btn">⬆ 导入</button>
            <input type="file" id="import-file-input" accept=".json" style="display: none;">
        `;
    panel.appendChild(actions);

    // 设置事件处理
    this.setupTemplatePanelHandlers(panel);

    return panel;
  }

  /**
   * 渲染模板列表
   */
  private renderTemplateList(): HTMLElement {
    const list = document.createElement("div");
    list.className = "template-list";

    // 内置模板 Tab：动态排序，当前页面可用的排在前面
    if (this.activeTemplateTab === "builtin") {
      if (!this.timesheetTemplate) {
        this.timesheetTemplate = new TimesheetNotificationTemplate();
      }
      if (!this.patientVacationTemplate) {
        this.patientVacationTemplate = new PatientVacationTemplate();
      }
      if (!this.eodReportTemplate) {
        this.eodReportTemplate = new EodReportTemplate();
      }
      if (!this.employmentActivationTemplate) {
        this.employmentActivationTemplate = new EmploymentActivationTemplate();
      }

      const pageType = PageDetector.getCurrentPageType();

      // 每条记录包含「当前页可用」标志和渲染函数
      const entries: Array<{
        isActive: boolean;
        render: (container: HTMLElement) => void;
      }> = [
        {
          isActive: pageType === "PREBILLING",
          render: (c) => this.timesheetTemplate!.renderEntryCard(c),
        },
        {
          isActive: pageType === "PATIENT_PROFILE",
          render: (c) => this.patientVacationTemplate!.renderEntryCard(c),
        },
        {
          isActive: true, // 任意页面
          render: (c) => this.eodReportTemplate!.renderEntryCard(c),
        },
        {
          isActive: true, // 任意页面
          render: (c) => this.employmentActivationTemplate!.renderEntryCard(c),
        },
      ];

      // 先渲染当前页可用的模板，再渲染不可用的（移到底部）
      entries.filter((e) => e.isActive).forEach((e) => e.render(list));
      entries.filter((e) => !e.isActive).forEach((e) => e.render(list));

      return list;
    }

    // 自定义模板 Tab
    if (this.templates.length === 0) {
      list.innerHTML = `
                <div class="template-empty">
                    <div class="template-empty-icon">📝</div>
                    <p>暂无自定义模板</p>
                    <p class="template-hint">点击下方 "+ 添加模板" 创建您的第一个模板</p>
                </div>
            `;
    } else {
      this.templates.forEach((template) => {
        const card = this.renderTemplateCard(template);
        list.appendChild(card);
      });
    }

    return list;
  }

  /**
   * 渲染单个模板卡片
   */
  private renderTemplateCard(template: MailTemplate): HTMLElement {
    const card = document.createElement("div");
    card.className = "template-card";
    card.dataset.templateId = template.id;

    const isBuiltin = isBuiltinTemplate(template.id);

    const targetLabel =
      template.targetPageType === "PATIENT"
        ? "病人"
        : template.targetPageType === "CAREGIVER"
        ? "护理员"
        : "通用";

    // 内置模板不显示编辑/删除按钮
    const actionButtons = isBuiltin
      ? `
                <button class="template-card-btn outlook-btn" data-id="${template.id}" title="发送到 Outlook">📧 Outlook</button>
            `
      : `
                <button class="template-card-btn outlook-btn" data-id="${template.id}" title="发送到 Outlook">📧 Outlook</button>
                <button class="template-card-btn edit-btn" data-id="${template.id}" title="编辑">✏️</button>
                <button class="template-card-btn delete-btn" data-id="${template.id}" title="删除">🗑️</button>
            `;

    card.innerHTML = `
            <div class="template-card-header">
                <span class="template-name">${this.escapeHtml(
                  template.name
                )}</span>
                <div class="template-badges">
                    ${
                      isBuiltin
                        ? '<span class="template-builtin-badge">内置</span>'
                        : ""
                    }
                    <span class="template-target-badge">${targetLabel}</span>
                </div>
            </div>
            <div class="template-card-preview">
                <span class="template-subject">📧 ${this.escapeHtml(
                  this.truncateText(template.subject, 40)
                )}</span>
            </div>
            <div class="template-card-actions">
                ${actionButtons}
            </div>
        `;

    return card;
  }

  /**
   * 渲染模板编辑器
   */
  private renderTemplateEditor(): HTMLElement {
    const editor = document.createElement("div");
    editor.className = "template-editor";

    const template = this.editingTemplate;
    const isNew = !template?.id;

    editor.innerHTML = `
            <div class="editor-header">
                <h4>${isNew ? "新建模板" : "编辑模板"}</h4>
            </div>
            <div class="editor-form">
                <div class="form-group">
                    <label>模板名称 *</label>
                    <input type="text" id="tpl-name" value="${this.escapeHtml(
                      template?.name || ""
                    )}" placeholder="例：护理员请假通知">
                </div>
                <div class="form-group">
                    <label>适用页面</label>
                    <select id="tpl-target">
                        <option value="ANY" ${
                          template?.targetPageType === "ANY" ? "selected" : ""
                        }>通用</option>
                        <option value="PATIENT" ${
                          template?.targetPageType === "PATIENT"
                            ? "selected"
                            : ""
                        }>病人页面</option>
                        <option value="CAREGIVER" ${
                          template?.targetPageType === "CAREGIVER"
                            ? "selected"
                            : ""
                        }>护理员页面</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>收件人(To)</label>
                    <input type="text" id="tpl-to" value="${this.escapeHtml(
                      template?.to || ""
                    )}" placeholder="email@example.com">
                </div>
                <div class="form-group">
                    <label>抄送 (CC)</label>
                    <input type="text" id="tpl-cc" value="${this.escapeHtml(
                      template?.cc || ""
                    )}" placeholder="可选">
                </div>
                <div class="form-group">
                    <label>主题(Subject) *</label>
                    <input type="text" id="tpl-subject" value="${this.escapeHtml(
                      template?.subject || ""
                    )}" placeholder="使用 {{变量名}} 插入动态内容">
                </div>
                <div class="form-group">
                    <label>正文 *</label>
                    <textarea id="tpl-body" rows="6" placeholder="使用 {{变量名}} 插入动态内容">${this.escapeHtml(
                      template?.body || ""
                    )}</textarea>
                </div>
            </div>
            <div class="editor-actions">
                <button class="editor-btn cancel-btn" id="editor-cancel">取消</button>
                <button class="editor-btn save-btn" id="editor-save">保存</button>
            </div>
        `;

    return editor;
  }

  /**
   * 设置模板面板事件处理
   */
  private setupTemplatePanelHandlers(panel: HTMLElement): void {
    // Tab 切换
    panel.querySelectorAll(".template-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const tab = target.dataset.tab as "builtin" | "custom";
        if (tab !== this.activeTemplateTab) {
          this.activeTemplateTab = tab;
          this.refreshTemplatePanel();
        }
      });
    });

    // 添加模板按钮
    const addBtn = panel.querySelector("#add-template-btn");
    addBtn?.addEventListener("click", () => {
      this.openEditor(null);
    });

    // 导出按钮
    const exportBtn = panel.querySelector("#export-btn");
    exportBtn?.addEventListener("click", () => {
      TemplateManager.exportToFile();
      this.showToast("✅ 模板已导出");
    });

    // 导入按钮
    const importBtn = panel.querySelector("#import-btn");
    const importInput = panel.querySelector(
      "#import-file-input"
    ) as HTMLInputElement;
    importBtn?.addEventListener("click", () => {
      importInput?.click();
    });
    importInput?.addEventListener("change", async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const count = await TemplateManager.importFromFile(file);
          this.templates = TemplateManager.getAll();
          this.refreshTemplatePanel();
          this.showToast(`✅ 导入了 ${count} 个模板`);
        } catch (error) {
          this.showToast(`❌ ${(error as Error).message}`);
        }
        importInput.value = "";
      }
    });

    // 模板卡片操作按钮
    panel.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = (e.currentTarget as HTMLButtonElement).dataset.id;
        if (id) {
          // 每次编辑时从存储重新加载模板，避免使用过期的缓存数据
          this.templates = TemplateManager.getAll();
          const template = this.templates.find((t) => t.id === id);
          if (template) this.openEditor(template);
        }
      });
    });

    panel.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = (e.currentTarget as HTMLButtonElement).dataset.id;
        if (id) this.deleteTemplate(id);
      });
    });

    // Outlook 按钮
    panel.querySelectorAll(".outlook-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = (e.currentTarget as HTMLButtonElement).dataset.id;
        if (id) this.sendToOutlook(id);
      });
    });

    // 编辑器按钮
    const cancelBtn = panel.querySelector("#editor-cancel");
    cancelBtn?.addEventListener("click", () => {
      this.closeEditor();
    });

    const saveBtn = panel.querySelector("#editor-save");
    saveBtn?.addEventListener("click", () => {
      this.saveTemplate();
    });
  }

  /**
   * 打开模板编辑器 (模态框)
   */
  private openEditor(template: MailTemplate | null): void {
    this.editingTemplate = template
      ? { ...template }
      : {
          id: "",
          name: "",
          targetPageType: "ANY",
          to: "",
          cc: "",
          subject: "",
          body: "",
          variables: [],
          createdAt: 0,
          updatedAt: 0,
        };
    this.isEditorOpen = true;
    this.showEditorModal();
  }

  /**
   * 显示编辑器模态框
   */
  private showEditorModal(): void {
    const template = this.editingTemplate;
    const isNew = !template?.id;

    // 创建模态框覆盖层
    const overlay = document.createElement("div");
    overlay.className = "template-modal-overlay";
    overlay.id = "template-modal-overlay";

    // 构建数据字段 HTML
    const dataFieldsHtml = this.buildDataFieldsHtml(template?.variables || []);

    overlay.innerHTML = `
            <div class="template-modal">
                <div class="template-modal-header">
                    <h3 class="template-modal-title">${
                      isNew ? "新建模板" : "编辑模板"
                    }</h3>
                    <button class="template-modal-close" id="modal-close-btn">&times;</button>
                </div>
                <div class="template-modal-body">
                    <div class="template-form-group">
                        <label class="template-form-label">模板名称 *</label>
                        <input type="text" class="template-form-input" id="modal-tpl-name" 
                            value="${this.escapeHtml(template?.name || "")}" 
                            placeholder="例：护理员请假通知">
                    </div>
                    <div class="template-form-group">
                        <label class="template-form-label">收件人(To)</label>
                        <input type="text" class="template-form-input" id="modal-tpl-to" 
                            value="${this.escapeHtml(template?.to || "")}" 
                            placeholder="email@example.com">
                    </div>
                    <div class="template-form-group">
                        <label class="template-form-label">抄送 (CC)</label>
                        <input type="text" class="template-form-input" id="modal-tpl-cc" 
                            value="${this.escapeHtml(template?.cc || "")}" 
                            placeholder="可选，多个邮箱用逗号分隔">
                    </div>
                    <div class="template-form-row">
                        <div class="template-form-group">
                            <label class="template-form-label">主题(Subject) *</label>
                            <input type="text" class="template-form-input" id="modal-tpl-subject" 
                                value="${this.escapeHtml(
                                  template?.subject || ""
                                )}" 
                                placeholder="使用 {{变量名}} 插入动态内容">
                        </div>
                        <div class="template-form-group" style="flex: 0 0 140px;">
                            <label class="template-form-label">适用页面</label>
                            <select class="template-form-select" id="modal-tpl-target">
                                <option value="ANY" ${
                                  template?.targetPageType === "ANY"
                                    ? "selected"
                                    : ""
                                }>通用</option>
                                <option value="PATIENT" ${
                                  template?.targetPageType === "PATIENT"
                                    ? "selected"
                                    : ""
                                }>病人页面</option>
                                <option value="CAREGIVER" ${
                                  template?.targetPageType === "CAREGIVER"
                                    ? "selected"
                                    : ""
                                }>护理员页面</option>
                            </select>
                        </div>
                    </div>
                    <div class="template-form-group">
                        <label class="template-form-label">邮件正文 *</label>
                        <div class="template-placeholder-hint" style="font-size: 12px; color: #666; margin-bottom: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
                            <strong>💡 可用占位符:</strong> 
                            <span style="font-family: monospace; color: #0066cc;">{{aide_name}}</span>, 
                            <span style="font-family: monospace; color: #0066cc;">{{aide_id}}</span>, 
                            <span style="font-family: monospace; color: #0066cc;">{{patient_name}}</span>, 
                            <span style="font-family: monospace; color: #0066cc;">{{patient_id}}</span>
                            <br><small style="color: #999;">在下方"数据字段"区域可以添加自定义占位符</small>
                        </div>
                        <div class="template-body-editor">
                            <div class="modal-editor-toolbar" id="modal-tpl-toolbar">
                                <button type="button" data-cmd="bold" title="粗体"><b>B</b></button>
                                <button type="button" data-cmd="italic" title="斜体"><i>I</i></button>
                                <button type="button" data-cmd="underline" title="下划线"><u>U</u></button>
                                <button type="button" data-cmd="strikeThrough" title="删除线"><s>S</s></button>
                                <button type="button" data-cmd="insertUnorderedList" title="无序列表">≡</button>
                                <button type="button" data-cmd="insertOrderedList" title="有序列表">⒈</button>
                                <button type="button" id="modal-tpl-link-btn" title="插入链接">🔗</button>
                                <button type="button" data-cmd="removeFormat" title="清除格式">✕</button>
                            </div>
                            <div id="modal-tpl-body" class="modal-rich-editor" contenteditable="true"></div>
                        </div>
                    </div>
                    
                    <!-- 数据字段部分 -->
                    <div class="template-variables-section">
                        <div class="template-variables-header">
                            <h5>数据字段</h5>
                            <button type="button" class="template-add-var-btn" id="add-var-btn">+ 添加字段</button>
                        </div>
                        <table class="template-variables-table">
                            <thead>
                                <tr>
                                    <th style="width: 15%;">占位符</th>
                                    <th style="width: 35%;">CSS选择器</th>
                                    <th style="width: 15%;">处理类型</th>
                                    <th style="width: 25%;">规则/表达式</th>
                                    <th style="width: 10%;">操作</th>
                                </tr>
                            </thead>
                            <tbody id="var-fields-body">
                                ${dataFieldsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="template-modal-footer">
                    <button class="template-modal-btn btn-cancel" id="modal-cancel-btn">取消</button>
                    <button class="template-modal-btn btn-save" id="modal-save-btn">保存模板</button>
                </div>
            </div>
        `;

    document.body.appendChild(overlay);

    // 禁用 body 滚动
    document.body.style.overflow = "hidden";

    // 设置事件处理
    this.setupModalHandlers(overlay);
  }

  /**
   * 构建数据字段 HTML
   */
  private buildDataFieldsHtml(variables: any[]): string {
    if (!variables || variables.length === 0) {
      return "";
    }
    return variables
      .map(
        (v, idx) => `
            <tr data-var-idx="${idx}">
                <td><input type="text" class="var-key" value="${this.escapeHtml(
                  v.key || ""
                )}" placeholder="e.g. {{name}}"></td>
                <td><input type="text" class="var-selector" value="${this.escapeHtml(
                  v.selector || ""
                )}" placeholder="e.g. #elementId"></td>
                <td><input type="text" class="var-process-type" value="${this.escapeHtml(
                  v.process_type || ""
                )}" placeholder="e.g. regex"></td>
                <td><input type="text" class="var-process-rule" value="${this.escapeHtml(
                  v.process_rule || ""
                )}" placeholder="e.g. \\d+"></td>
                <td style="text-align: center;"><button type="button" class="var-delete-btn" data-idx="${idx}">✕</button></td>
            </tr>
        `
      )
      .join("");
  }

  /**
   * 添加新的数据字段行
   */
  private addVariableRow(): void {
    const tbody = document.getElementById("var-fields-body");
    if (!tbody) return;

    const idx = tbody.querySelectorAll("tr").length;
    const row = document.createElement("tr");
    row.dataset.varIdx = String(idx);
    row.innerHTML = `
            <td><input type="text" class="var-key" value="" placeholder="e.g. {{name}}"></td>
            <td><input type="text" class="var-selector" value="" placeholder="e.g. #elementId"></td>
            <td><input type="text" class="var-process-type" value="" placeholder="e.g. regex"></td>
            <td><input type="text" class="var-process-rule" value="" placeholder="e.g. \\d+"></td>
            <td style="text-align: center;"><button type="button" class="var-delete-btn" data-idx="${idx}">✕</button></td>
        `;
    tbody.appendChild(row);

    // 绑定删除按钮
    row.querySelector(".var-delete-btn")?.addEventListener("click", () => {
      row.remove();
    });
  }

  /**
   * 收集数据字段
   */
  private collectVariables(): any[] {
    const rows = document.querySelectorAll("#var-fields-body tr");
    const variables: any[] = [];
    rows.forEach((row) => {
      const key = (
        row.querySelector(".var-key") as HTMLInputElement
      )?.value.trim();
      const selector = (
        row.querySelector(".var-selector") as HTMLInputElement
      )?.value.trim();
      const process_type = (
        row.querySelector(".var-process-type") as HTMLInputElement
      )?.value.trim();
      const process_rule = (
        row.querySelector(".var-process-rule") as HTMLInputElement
      )?.value.trim();
      if (key && selector) {
        variables.push({ key, selector, process_type, process_rule });
      }
    });
    return variables;
  }

  /**
   * 设置模态框事件处理
   */
  private setupModalHandlers(overlay: HTMLElement): void {
    // 关闭按钮
    const closeBtn = overlay.querySelector("#modal-close-btn");
    closeBtn?.addEventListener("click", () => this.closeEditor());

    // 取消按钮
    const cancelBtn = overlay.querySelector("#modal-cancel-btn");
    cancelBtn?.addEventListener("click", () => this.closeEditor());

    // 保存按钮
    const saveBtn = overlay.querySelector("#modal-save-btn");
    saveBtn?.addEventListener("click", () => this.saveTemplate());

    // 添加字段按钮
    const addVarBtn = overlay.querySelector("#add-var-btn");
    addVarBtn?.addEventListener("click", () => this.addVariableRow());

    // 删除字段按钮（已有行）
    overlay.querySelectorAll(".var-delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        (e.target as HTMLElement).closest("tr")?.remove();
      });
    });

    // ESC 键关闭
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.closeEditor();
        if (!this.isEditorOpen) {
          document.removeEventListener("keydown", escHandler);
        }
      }
    };
    document.addEventListener("keydown", escHandler);

    // 编辑器工具栏和初始内容
    const bodyEditor = overlay.querySelector<HTMLElement>("#modal-tpl-body");
    if (bodyEditor && this.editingTemplate?.body) {
      bodyEditor.innerHTML = this.editingTemplate.body;
    }
    const toolbar = overlay.querySelector<HTMLElement>("#modal-tpl-toolbar");
    toolbar
      ?.querySelectorAll<HTMLButtonElement>("[data-cmd]")
      .forEach((btn) => {
        btn.addEventListener("mousedown", (e) => {
          e.preventDefault();
          document.execCommand(btn.dataset.cmd!, false);
        });
      });
    overlay
      .querySelector("#modal-tpl-link-btn")
      ?.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const url = prompt("请输入链接 URL:");
        if (url) document.execCommand("createLink", false, url);
        bodyEditor?.focus();
      });
    bodyEditor?.addEventListener("input", () => {
      this.editorDirty = true;
    });

    // 脏状态追踪
    this.editorDirty = false;
    overlay.querySelectorAll<HTMLElement>("input, select").forEach((el) => {
      el.addEventListener("change", () => {
        this.editorDirty = true;
      });
      el.addEventListener("input", () => {
        this.editorDirty = true;
      });
    });
  }

  /**
   * 关闭编辑器
   */
  private closeEditor(): void {
    if (this.editorDirty) {
      if (!window.confirm("有未保存的修改，确认丢弃并关闭吗？")) return;
    }
    this.editorDirty = false;

    // 移除模态框
    const overlay = document.querySelector("#template-modal-overlay");
    if (overlay) {
      overlay.remove();
    }

    // 恢复 body 滚动
    document.body.style.overflow = "";

    this.editingTemplate = null;
    this.isEditorOpen = false;
  }

  /**
   * 保存模板
   */
  private saveTemplate(): void {
    const nameInput = document.querySelector(
      "#modal-tpl-name"
    ) as HTMLInputElement;
    const targetSelect = document.querySelector(
      "#modal-tpl-target"
    ) as HTMLSelectElement;
    const toInput = document.querySelector("#modal-tpl-to") as HTMLInputElement;
    const ccInput = document.querySelector("#modal-tpl-cc") as HTMLInputElement;
    const subjectInput = document.querySelector(
      "#modal-tpl-subject"
    ) as HTMLInputElement;

    // 从 contenteditable 编辑器读取 HTML 内容
    let body = "";
    const bodyEl = document.querySelector<HTMLElement>("#modal-tpl-body");
    body = bodyEl?.innerHTML.trim() || "";

    const name = nameInput?.value.trim();
    const subject = subjectInput?.value.trim();

    if (!name || !subject || !body) {
      this.showToast("❌ 请填写必填字段");
      return;
    }

    const templateData = {
      id: this.editingTemplate?.id || undefined,
      name,
      targetPageType: targetSelect?.value as "PATIENT" | "CAREGIVER" | "ANY",
      to: toInput?.value.trim() || "",
      cc: ccInput?.value.trim() || "",
      subject,
      body,
      variables: this.collectVariables(),
    };

    TemplateManager.save(templateData);
    this.templates = TemplateManager.getAll();
    this.showToast("✅ 模板已保存");
    this.editorDirty = false;
    this.closeEditor();
    this.refreshTemplatePanel();
  }

  /**
   * 删除模板
   */
  private deleteTemplate(templateId: string): void {
    // 每次删除时从存储重新加载模板，避免使用过期的缓存数据
    this.templates = TemplateManager.getAll();
    const template = this.templates.find((t) => t.id === templateId);
    if (!template) return;

    if (confirm(`确定要删除模板 "${template.name}" 吗？`)) {
      TemplateManager.delete(templateId);
      this.templates = TemplateManager.getAll();
      this.refreshTemplatePanel();
      this.showToast("✅ 模板已删除");
    }
  }

  /**
   * 查找模板（包括内置和自定义）
   */
  private findTemplateById(templateId: string): MailTemplate | undefined {
    // 每次查找时从存储重新加载模板，避免使用过期的缓存数据
    this.templates = TemplateManager.getAll();
    // 先在自定义模板中查找
    let template = this.templates.find((t) => t.id === templateId);
    if (!template) {
      // 再在内置模板中查找
      template = getBuiltinTemplates().find((t) => t.id === templateId);
    }
    return template;
  }

  /**
   * 使用模板
   */
  private useTemplate(templateId: string): void {
    const template = this.findTemplateById(templateId);
    if (!template) return;

    // 使用 TemplateEngine 进行变量替换
    const rendered = TemplateEngine.render(template, this.profileData);

    const content = `To: ${rendered.to}\nCC: ${rendered.cc}\nSubject: ${rendered.subject}\n\n${rendered.body}`;
    this.copyToClipboard(content);
    this.showToast("✅ 模板内容已复制（变量已替换）");
  }

  /**
   * 发送到 Outlook
   * 将邮件任务写入 GM 共享存储，Outlook 页面上运行的 OutlookAdapter 会通过
   * MailService 轮询拾取任务，并调用注入的 HHAOutlookController 填写邮件。
   *
   * 依赖：
   * - Outlook 页面已打开（否则轮询无法运行）
   * - TM @match 覆盖 outlook.cloud.microsoft/*
   * - "Bypass Outlook Trusted Types for HHA" 脚本也匹配该域（document-start）
   */
  private sendToOutlook(templateId: string): void {
    const template = this.findTemplateById(templateId);
    if (!template) return;

    // 使用 TemplateEngine 进行变量替换
    const rendered = TemplateEngine.render(template, this.profileData);

    const taskId = MailService.sendMailTask({
      to: rendered.to || "",
      cc: rendered.cc,
      subject: rendered.subject || "",
      body: rendered.body || "",
    });

    console.log("[MailBuilderTab] Mail task queued:", taskId, rendered.subject);
    this.showToast("📧 正在准备 Outlook...");
  }

  /**
   * 刷新模板面板
   */
  private refreshTemplatePanel(): void {
    const panel = document.querySelector("#mail-builder-template-panel");
    if (panel && panel.parentElement) {
      const newPanel = this.renderTemplatePanel();
      panel.parentElement.replaceChild(newPanel, panel);
    }
  }

  /**
   * 设置复制按钮事件处理
   */
  private setupCopyHandlers(panel: HTMLElement): void {
    // 单字段复制按钮
    panel.querySelectorAll(".info-copy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const value = target.dataset.value || "";
        this.copyToClipboard(value);
      });
    });

    // 快捷复制：名字+ID
    const copyNameIdBtn = panel.querySelector("#copy-name-id");
    copyNameIdBtn?.addEventListener("click", () => {
      if (this.profileData) {
        const text = `${this.profileData.name} ${this.profileData.id}`;
        this.copyToClipboard(text);
      }
    });
  }

  /**
   * 复制到剪贴板
   */
  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast("✅ 已复制");
    } catch (error) {
      console.error("[MailBuilderTab] Copy failed:", error);
      this.showToast("❌ 复制失败");
    }
  }

  /**
   * 显示 Toast 提示
   */
  private showToast(message: string): void {
    // 检查是否已有 toast
    let toast = document.querySelector(".mail-builder-toast") as HTMLElement;
    if (toast) {
      toast.remove();
    }

    toast = document.createElement("div");
    toast.className = "mail-builder-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    // 动画显示
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    // 2秒后隐藏
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  /**
   * 渲染未检测到 Profile 页面的提示
   */
  private renderNoProfileDetected(): void {
    if (!this.container) return;

    const placeholder = this.createPlaceholder(
      "📧",
      "未检测到个人信息页面",
      ""
    );

    // 添加支持的页面列表
    const infoDiv = document.createElement("div");
    infoDiv.className = "mail-builder-no-page-info";
    infoDiv.innerHTML = `
      <p>邮件助手目前支持以下页面：</p>
      <ul>
        <li><strong>Patient Info</strong> - 病人信息页</li>
        <li><strong>Internal Patient Info</strong> - 病人内部信息页</li>
        <li><strong>Aide Info</strong> - 护理员信息页</li>
      </ul>
      <p class="mail-builder-hint">请导航到上述页面之一来使用邮件助手功能。</p>
    `;

    placeholder.appendChild(infoDiv);
    this.container.appendChild(placeholder);
  }

  /**
   * 截断文本
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  onActivate(): void {
    console.log("[MailBuilderTab] Activated");
    // 重新检测页面类型
    this.currentPageType = ProfileDataExtractor.getCurrentPageType();
    this.profileData = ProfileDataExtractor.extract();
    // 每次激活都重新渲染
    this.renderContent();
  }

  onDeactivate(): void {
    console.log("[MailBuilderTab] Deactivated");
  }

  destroy(): void {
    // 移除页面变化监听器
    if (this.pageChangeHandler) {
      ProfileDataExtractor.offPageChange(this.pageChangeHandler);
      this.pageChangeHandler = null;
    }
    // 销毁内置模板实例（停止轮询、注销页面变化监听，关闭 Modal）
    if (this.timesheetTemplate) {
      this.timesheetTemplate.destroy();
      this.timesheetTemplate = null;
    }
    if (this.patientVacationTemplate) {
      this.patientVacationTemplate.destroy();
      this.patientVacationTemplate = null;
    }
    super.destroy();
  }
}
