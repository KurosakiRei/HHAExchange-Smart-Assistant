# Epic 12: Mail Builder - 邮件助手

## Epic 概述

| 属性           | 值                                                        |
| -------------- | --------------------------------------------------------- |
| **Epic ID**    | EPIC-012                                                  |
| **标题**       | Mail Builder - 智能邮件构筑助手                           |
| **优先级**     | P1 - 高优先级功能                                         |
| **状态**       | ✅ In Production (v3.13.0 全链路验证通过，邮件填充功能稳定) |
| **预估工作量** | 11 个 Story (Story 11: CSP 合规重构 ✅)                   |
| **关联系统**   | HHAExchange Patient/Caregiver Profiles, Outlook Web (OWA) |
| **技术阻塞**   | ~~Outlook CSP 导致 Story 8 实现无法运行，需 Story 11 修复~~ ✅ 已通过 String Payload + GM.addElement 方案解决 |

## 背景与目标

### 当前问题

1. **重复性邮件撰写繁琐**：
   - 工作中需要频繁发送类似格式的邮件（护理员请假、病人请假、请求信息等）
   - 每次都要手动从 HHA 页面复制病人/护理员的姓名、ID、生日等信息
   - 需要记住不同邮件类型的收件人、CC、格式要求

2. **信息分散在多个 Tab**：
   - HHA Exchange 页面打开病人/护理员资料
   - Outlook 网页版在另一个 Tab 撰写邮件
   - 需要频繁切换 Tab 复制粘贴

3. **邮件模板管理困难**：
   - 无法保存常用邮件模板
   - 无法在不同电脑间同步模板配置

### 目标

创建第四个 Tab "邮件助手"（Mail Builder Tab），实现：

1. **智能上下文检测**：
   - 自动识别当前是否在病人或护理员的 Profile 页面
   - 从页面 DOM 提取关键信息（姓名、ID、生日、电话、地址等）
   - 在面板左侧展示提取的信息，支持一键复制

2. **双模板系统**：
   - **内置模板**：硬编码的复杂逻辑模板（如自动计算假期日期）
   - **自定义模板**：用户可增删改查的模板，支持变量替换

3. **模板导入/导出**：
   - 将模板导出为 JSON 文件下载到本地
   - 从 JSON 文件导入模板配置
   - 支持在不同电脑间共享模板

4. **多种邮件发送方式**：
   - **一键复制**：分别复制收件人、CC、标题、正文
   - **组合复制**：复制格式化后的完整内容
   - **Mailto 协议**：一键打开邮件客户端
   - **Outlook 自动化**（首选）：跨 Tab 直接在 Outlook 网页版创建并填充邮件

## 技术分析结果

### 页面 DOM 结构分析

#### 1. 病人 Profile 页面 - InternalPatientInfo

- **URL 模式**: `https://app.hhaexchange.com/*/Patient/InternalPatientInfo_ns.aspx?PatientId=*`
- **关键选择器**：

| 字段       | CSS 选择器                                                   | 示例值                                            |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------- |
| 姓名       | `#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientName`   | `Zhao Guohua`                                     |
| Patient ID | `#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientNumber` | `144284443`                                       |
| 生日       | `#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientDOB`    | `10/15/1950`                                      |
| 地址       | `#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblAddress`       | `72 Mayberry Promenade, STATEN ISLAND, NY, 10312` |
| 保险/合同  | `#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblContracts`     | `Healthfirst (AHC)`                               |
| 电话       | `a[href^="tel:"]`                                            | `917-622-0826`                                    |

#### 2. 病人 Profile 页面 - Patient_ns

- **URL 模式**: `https://app.hhaexchange.com/*/Patient/Patient_ns.aspx?PatientId=*`
- **关键选择器**：

| 字段       | CSS 选择器                                                   | 示例值                                          |
| ---------- | ------------------------------------------------------------ | ----------------------------------------------- |
| 姓名       | `#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientName`   | `CHEN TZEN`                                     |
| Patient ID | `#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientNumber` | `000211664`（注意：ID 大写）                    |
| 生日       | `#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientDOB`    | `11/29/1933`                                    |
| 地址       | `#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblAddress`       | `80 BEEKMAN STREET APT 3K, NEW YORK, NY, 10038` |
| 支付方     | `#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblChhaName`      | `Americare`                                     |
| 电话       | `a[href^="tel:"]`                                            | `917-623-6566`                                  |

> [!IMPORTANT]
> **两种病人页面的差异**：
> - ID 选择器大小写不同：`uxLblPatientId` vs `uxLblPatientID`
> - 保险字段不同：`uxLblContracts` vs `uxLblChhaName`
> - 脚本需要兼容两种页面结构

#### 3. 护理员 Profile 页面

- **URL 模式**: `https://app.hhaexchange.com/*/Aide/Aide_ns.aspx?AideId=*`
- **关键选择器**：

| 字段         | CSS 选择器                                         | 示例值                                     |
| ------------ | -------------------------------------------------- | ------------------------------------------ |
| 姓名         | `#ctl00_ContentPlaceHolder1_uxlblInfoName`         | `Chen Shuyun`                              |
| Caregiver ID | `#ctl00_ContentPlaceHolder1_uxlblInfoAideInitials` | `AHC-24573`                                |
| 生日         | `#ctl00_ContentPlaceHolder1_uxlblInfoDOB`          | `10/18/1970`                               |
| 地址         | `#uxHyPAddress` 或 `#lblInfoAddress`               | `57-15 163rd St, Fresh Meadows, NY, 11365` |
| 电话         | `#lnkHours_{AideId}` 或 `a[href^="tel:"]`          | `929-763-7333`                             |

#### 4. Outlook Web (OWA) 页面

- **URL 模式**: `https://outlook.office.com/mail/*`
- **关键选择器**：

| 字段         | CSS 选择器                       | 说明                          |
| ------------ | -------------------------------- | ----------------------------- |
| 新建邮件按钮 | `button[aria-label="New mail"]`  | 点击打开撰写窗口              |
| To 字段      | `div[aria-label="To"]`           | role=presentation             |
| CC 字段      | `div[aria-label="Cc"]`           | role=presentation             |
| Subject 字段 | `input[aria-label="Subject"]`    | placeholder="Add a subject"   |
| 邮件正文     | `div[aria-label="Message body"]` | role=textbox, contenteditable |
| 发送按钮     | `button[aria-label="Send"]`      | 点击发送邮件                  |

## UI 设计

### 面板布局 (35% / 65% 分屏)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📧 邮件助手                                    当前页面：病人主页           │
├──────────────────────────┬──────────────────────────────────────────────────┤
│ 名字: Zhao Guohua  [复制]│  [ 内置模板 ]  [ 自定义模板 ]                     │
│ ID:   144284443    [复制]├──────────────────────────────────────────────────┤
│ 生日: 10/15/1950   [复制]│  ┌─────────────────────────────────────────────┐ │
│ 电话: 917-622-0826 [复制]│  │ 假期通知      [编辑] [删除]                 │ │
│ 地址: 72 Mayberry  [复制]│  ├─────────────────────────────────────────────┤ │
│ 保险: Healthfirst  [复制]│  │ 护理员请假    [编辑] [删除]                 │ │
│                          │  ├─────────────────────────────────────────────┤ │
│ ─────────────────────────│  │ 请求信息      [编辑] [删除]                 │ │
│ [📋 复制 名字+ID]        │  └─────────────────────────────────────────────┘ │
│ [📋 复制 完整主题行]     │                                                  │
│                          │                          [+ 添加模板] [⬇ 导出] [⬆ 导入] │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

### 模板编辑器

```
┌─────────────────────────────────────────────────────────────────┐
│ 编辑模板                                                        │
├─────────────────────────────────────────────────────────────────┤
│ 模板名称:                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 护理员获取请假时间                                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 收件人 (To):                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ SNazarov@AlwaysNY.net                                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 抄送 (CC):                                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 主题:                                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Aide: {{aide_name}} {{aide_id}} Vacation/Sick Hours         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 正文 (富文本编辑器):                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ 数据字段                                                        │
│                                                                 │
│ 占位符         CSS选择器                      处理类型   规则   │
│ ┌──────────┐ ┌──────────────────────────────┐ ┌───────┐ ┌─────┐│
│ │{{aide_name}}│ │#ctl00_...uxlblInfoName     │ │ text  │ │     ││
│ └──────────┘ └──────────────────────────────┘ └───────┘ └─────┘│
│ ┌──────────┐ ┌──────────────────────────────┐ ┌───────┐ ┌─────┐│
│ │{{aide_id}}│ │#ctl00_...uxlblInfoAideInitials│ │ text  │ │     ││
│ └──────────┘ └──────────────────────────────┘ └───────┘ └─────┘│
│                                                                 │
│ [+ 添加字段]                                                    │
│                                                                 │
│                              [取消]  [保存]                     │
└─────────────────────────────────────────────────────────────────┘
```

## 核心架构设计

### 目录结构

```
src/
├── js/
│   ├── tabs/
│   │   └── MailBuilderTab.ts            # 🆕 Mail Builder Tab 主类
│   │
│   ├── services/
│   │   ├── MailService.ts               # 🆕 跨 Tab 通讯服务（独立实现）
│   │   ├── ProfileDataExtractor.ts      # 🆕 页面数据提取器
│   │   ├── TemplateManager.ts           # 🆕 模板管理器（CRUD + 导入导出）
│   │   ├── TemplateEngine.ts            # 🆕 模板变量替换引擎
│   │   └── OutlookAdapter.ts            # 🆕 Outlook DOM 自动化适配器
│   │
│   └── utils/
│       └── templates&const.ts           # 🔧 添加 Mail Builder 相关选择器
│
├── style/
│   └── mail-builder-tab.less            # 🆕 Mail Builder Tab 样式
│
└── index.ts                             # 🔧 添加 Outlook 页面路由
```

### 核心类设计

#### 1. MailService（独立的跨 Tab 通讯服务）

> [!IMPORTANT]
> **独立实现**：不修改 `VisitMonitor.ts` 的 `TabSyncManager`，创建全新的独立服务类
> - 使用独立的 `GM_setValue` 键名（`hha_mail_service_bus`）
> - 参考 `TabSyncManager` 的设计模式，但代码完全独立

```typescript
/**
 * Mail Service - 邮件任务跨 Tab 通讯服务
 * 
 * 职责：
 * - HHA Tab 发送邮件任务到 Outlook Tab
 * - 使用 GM_setValue 实现跨域数据共享
 * - 轮询检测任务更新
 */
class MailService {
  private static readonly TASK_KEY = 'hha_mail_service_bus';
  private static readonly POLL_INTERVAL = 1000; // 1秒轮询
  
  /**
   * 发送邮件任务（HHA 端调用）
   */
  static sendMailTask(task: MailTask): void {
    const payload: MailTaskPayload = {
      id: crypto.randomUUID(),
      status: 'PENDING',
      data: task,
      timestamp: Date.now(),
      sourceTabId: this.getTabId()
    };
    GM_setValue(this.TASK_KEY, JSON.stringify(payload));
  }
  
  /**
   * 监听邮件任务（Outlook 端调用）
   */
  static startListening(callback: (task: MailTask) => void): void {
    setInterval(() => {
      const payload = this.getTaskPayload();
      if (payload?.status === 'PENDING') {
        callback(payload.data);
        // 标记为处理中
        payload.status = 'PROCESSING';
        GM_setValue(this.TASK_KEY, JSON.stringify(payload));
      }
    }, this.POLL_INTERVAL);
  }
  
  /**
   * 报告任务完成（Outlook 端调用）
   */
  static reportComplete(taskId: string): void {
    const payload = this.getTaskPayload();
    if (payload?.id === taskId) {
      payload.status = 'COMPLETED';
      GM_setValue(this.TASK_KEY, JSON.stringify(payload));
    }
  }
}

interface MailTask {
  to: string;
  cc?: string;
  subject: string;
  body: string; // 支持 HTML
}
```

#### 2. ProfileDataExtractor（数据提取器）

```typescript
/**
 * 页面数据提取器
 * 从病人/护理员 Profile 页面提取关键信息
 */
class ProfileDataExtractor {
  /**
   * 检测当前页面类型
   */
  static detectPageType(): 'PATIENT_INTERNAL' | 'PATIENT_NS' | 'CAREGIVER' | 'UNKNOWN' {
    const url = window.location.href;
    if (url.includes('InternalPatientInfo_ns.aspx')) return 'PATIENT_INTERNAL';
    if (url.includes('Patient_ns.aspx')) return 'PATIENT_NS';
    if (url.includes('Aide_ns.aspx')) return 'CAREGIVER';
    return 'UNKNOWN';
  }
  
  /**
   * 提取页面数据
   */
  static extract(): ProfileData | null {
    const pageType = this.detectPageType();
    
    switch (pageType) {
      case 'PATIENT_INTERNAL':
        return this.extractPatientInternal();
      case 'PATIENT_NS':
        return this.extractPatientNs();
      case 'CAREGIVER':
        return this.extractCaregiver();
      default:
        return null;
    }
  }
  
  private static extractPatientInternal(): ProfileData {
    return {
      type: 'PATIENT',
      name: this.getText('#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientName'),
      id: this.getText('#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientNumber'),
      dob: this.getText('#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientDOB'),
      address: this.getText('#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblAddress'),
      phone: this.getPhoneFromTelLink(),
      insurance: this.getText('#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblContracts'),
    };
  }
  
  // ... 其他提取方法
}

interface ProfileData {
  type: 'PATIENT' | 'CAREGIVER';
  name: string;
  id: string;
  dob?: string;
  address?: string;
  phone?: string;
  insurance?: string; // 仅病人
}
```

#### 3. TemplateManager（模板管理器）

```typescript
/**
 * 模板管理器
 * 处理自定义模板的 CRUD 和导入导出
 */
class TemplateManager {
  private static readonly STORAGE_KEY = 'hha_mail_templates';
  
  /**
   * 获取所有模板
   */
  static getAll(): MailTemplate[] {
    const stored = GM_getValue<string>(this.STORAGE_KEY, '[]');
    return JSON.parse(stored);
  }
  
  /**
   * 保存模板
   */
  static save(template: MailTemplate): void {
    const templates = this.getAll();
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    GM_setValue(this.STORAGE_KEY, JSON.stringify(templates));
  }
  
  /**
   * 删除模板
   */
  static delete(templateId: string): void {
    const templates = this.getAll().filter(t => t.id !== templateId);
    GM_setValue(this.STORAGE_KEY, JSON.stringify(templates));
  }
  
  /**
   * 导出为 JSON 文件下载
   */
  static exportToFile(): void {
    const templates = this.getAll();
    const json = JSON.stringify(templates, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `hha-mail-templates-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
  
  /**
   * 从文件导入
   */
  static async importFromFile(file: File): Promise<number> {
    const text = await file.text();
    const imported = JSON.parse(text) as MailTemplate[];
    
    // 合并到现有模板（按 ID 去重）
    const existing = this.getAll();
    const merged = [...existing];
    
    let addedCount = 0;
    for (const template of imported) {
      if (!merged.find(t => t.id === template.id)) {
        merged.push(template);
        addedCount++;
      }
    }
    
    GM_setValue(this.STORAGE_KEY, JSON.stringify(merged));
    return addedCount;
  }
}

interface MailTemplate {
  id: string;
  name: string;
  targetPageType: 'PATIENT' | 'CAREGIVER' | 'ANY';
  to: string;
  cc?: string;
  subject: string;
  body: string;
  variables: TemplateVariable[];
}

interface TemplateVariable {
  placeholder: string;  // e.g., "{{aide_name}}"
  selector: string;     // CSS selector
  method: 'text' | 'val' | 'attr';
  regex?: string;       // Optional regex extraction
}
```

#### 4. OutlookAdapter（Outlook 自动化适配器）

```typescript
/**
 * Outlook Web 自动化适配器
 * 运行在 outlook.office.com 页面
 */
class OutlookAdapter {
  private static readonly SELECTORS = {
    newMailButton: 'button[aria-label="New mail"]',
    toField: 'div[aria-label="To"]',
    ccField: 'div[aria-label="Cc"]',
    subjectInput: 'input[aria-label="Subject"]',
    messageBody: 'div[aria-label="Message body"]',
    sendButton: 'button[aria-label="Send"]',
  };
  
  /**
   * 创建新邮件并填充内容
   */
  static async composeEmail(task: MailTask): Promise<void> {
    // 1. 点击"新建邮件"按钮
    const newMailBtn = document.querySelector(this.SELECTORS.newMailButton) as HTMLButtonElement;
    if (!newMailBtn) throw new Error('New mail button not found');
    newMailBtn.click();
    
    // 2. 等待编辑器加载
    await this.waitForElement(this.SELECTORS.subjectInput, 5000);
    
    // 3. 填充 To 字段
    await this.fillRecipient(this.SELECTORS.toField, task.to);
    
    // 4. 填充 CC 字段（如果有）
    if (task.cc) {
      await this.fillRecipient(this.SELECTORS.ccField, task.cc);
    }
    
    // 5. 填充 Subject
    const subjectInput = document.querySelector(this.SELECTORS.subjectInput) as HTMLInputElement;
    subjectInput.value = task.subject;
    subjectInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // 6. 填充 Body（支持 HTML）
    const bodyDiv = document.querySelector(this.SELECTORS.messageBody) as HTMLDivElement;
    bodyDiv.innerHTML = task.body;
    bodyDiv.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  private static async waitForElement(selector: string, timeout: number): Promise<Element> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        const el = document.querySelector(selector);
        if (el) {
          resolve(el);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  }
  
  private static async fillRecipient(selector: string, email: string): Promise<void> {
    const field = document.querySelector(selector) as HTMLDivElement;
    field.click();
    // 模拟输入
    document.execCommand('insertText', false, email);
  }
}
```

## 验收标准 (Epic 级别)

### 功能性

- [ ] 第四个 Tab "邮件助手" 成功添加到面板
- [ ] 自动检测当前页面类型（病人 / 护理员 / 其他）
- [ ] 在 Profile 页面显示提取的个人信息
- [ ] 非 Profile 页面显示"未检测到个人信息"提示

### 左侧信息面板

- [ ] 正确提取病人 InternalPatientInfo 页面的数据
- [ ] 正确提取病人 Patient_ns 页面的数据（兼容 ID 大小写差异）
- [ ] 正确提取护理员 Aide_ns 页面的数据
- [ ] 每个字段旁有独立的"复制"按钮
- [ ] 提供"复制名字+ID"等组合复制功能
- [ ] 复制成功后显示 Toast 提示

### 自定义模板系统

- [ ] 可创建新模板
- [ ] 可编辑现有模板
- [ ] 可删除模板
- [ ] 模板编辑器支持：名称、收件人、CC、主题、正文
- [ ] 模板支持变量占位符（如 `{{patient_name}}`）
- [ ] 变量可配置 CSS 选择器
- [ ] 模板持久化存储在 `GM_setValue`

### 导入导出功能

- [ ] 点击"导出"按钮下载 JSON 文件
- [ ] 点击"导入"按钮可选择 JSON 文件
- [ ] 导入时按 ID 去重，不覆盖已有模板
- [ ] 导入成功后显示添加数量

### 邮件发送方式

- [ ] **复制方式**：分别复制 To、CC、Subject、Body
- [ ] **Mailto 方式**：一键打开默认邮件客户端
- [ ] **Outlook 自动化**：跨 Tab 在 Outlook 网页版创建邮件
- [ ] Outlook 自动化成功后显示状态反馈

### 跨 Tab 通讯

- [ ] `MailService` 独立实现，不依赖 `VisitMonitor.ts`
- [ ] 使用独立的 `GM_setValue` 键名
- [ ] HHA Tab 可发送任务到 Outlook Tab
- [ ] Outlook Tab 可接收并执行任务
- [ ] 任务状态可追踪（PENDING → PROCESSING → COMPLETED）

### 非功能性

- [ ] 数据提取响应时间 < 500ms
- [ ] UI 美观，符合现有面板风格
- [ ] 使用 `GM_setValue` 而非 localStorage
- [ ] 无 TypeScript 编译错误
- [ ] 详细的控制台日志

## Story 拆分

### Story 1: 页面检测和基础 UI 框架

**目标**: 创建 Mail Builder Tab 并实现页面类型检测

**验收标准**:
- [ ] 新增第四个 Tab "邮件助手"
- [ ] 实现 `ProfileDataExtractor.detectPageType()` 方法
- [ ] 在 Profile 页面显示主界面（左右分栏布局）
- [ ] 在非 Profile 页面显示提示信息
- [ ] 面板 Header 显示当前检测到的页面类型

**文件**:
- `src/js/tabs/MailBuilderTab.ts`
- `src/js/services/ProfileDataExtractor.ts`
- `src/style/mail-builder-tab.less`

---

### Story 2: 数据提取与信息展示

**目标**: 实现左侧个人信息提取和展示

**验收标准**:
- [ ] 实现 `ProfileDataExtractor.extract()` 方法
- [ ] 正确提取病人 InternalPatientInfo 页面的数据
- [ ] 正确提取病人 Patient_ns 页面的数据
- [ ] 正确提取护理员 Aide_ns 页面的数据
- [ ] 在左侧面板展示所有提取的字段
- [ ] 每个字段旁有"复制"按钮
- [ ] 复制成功后显示 Toast

**文件**:
- `src/js/services/ProfileDataExtractor.ts`
- `src/js/tabs/MailBuilderTab.ts` (左侧 UI)

---

### Story 3: 模板管理器 - CRUD

**目标**: 实现自定义模板的增删改查

**验收标准**:
- [ ] 实现 `TemplateManager` 类
- [ ] 模板列表展示在右侧面板
- [ ] 点击"添加模板"打开编辑器
- [ ] 编辑器包含：名称、To、CC、Subject、Body
- [ ] 点击"保存"保存到 `GM_setValue`
- [ ] 点击"删除"可删除模板
- [ ] 点击"编辑"可修改模板

**文件**:
- `src/js/services/TemplateManager.ts`
- `src/js/tabs/MailBuilderTab.ts` (编辑器 UI)

---

### Story 4: 模板变量系统

**目标**: 实现模板变量替换引擎

**验收标准**:
- [ ] 模板编辑器支持添加变量字段
- [ ] 变量字段包含：占位符名、CSS 选择器、处理类型
- [ ] 实现 `TemplateEngine.render()` 方法
- [ ] 选择模板时自动替换变量为实际值
- [ ] 预览替换后的完整邮件内容

**文件**:
- `src/js/services/TemplateEngine.ts`
- `src/js/tabs/MailBuilderTab.ts` (变量编辑 UI)

---

### Story 5: 模板导入导出

**目标**: 实现模板的文件导入导出

**验收标准**:
- [ ] 点击"导出"生成并下载 JSON 文件
- [ ] 使用 Blob + `<a download>` 实现下载
- [ ] 点击"导入"打开文件选择器
- [ ] 使用 `<input type="file">` + FileReader 读取文件
- [ ] 导入时合并模板（按 ID 去重）
- [ ] 显示导入结果（添加 X 个模板）

**文件**:
- `src/js/services/TemplateManager.ts` (导入导出方法)
- `src/js/tabs/MailBuilderTab.ts` (按钮 UI)

---

### Story 6: 复制功能实现

**目标**: 实现各种复制功能

**验收标准**:
- [ ] 单字段复制：点击复制按钮复制对应值
- [ ] 组合复制：复制"名字+ID"等组合
- [ ] 模板内容复制：分别复制 To、CC、Subject、Body
- [ ] 使用 `navigator.clipboard.writeText()` API
- [ ] 复制成功后显示 Toast 反馈

**文件**:
- `src/js/tabs/MailBuilderTab.ts` (复制逻辑)

---

### Story 7: MailService 跨 Tab 通讯

**目标**: 实现独立的跨 Tab 通讯服务

**验收标准**:
- [ ] 创建独立的 `MailService` 类
- [ ] 使用 `GM_setValue('hha_mail_service_bus')` 存储任务
- [ ] 实现 `sendMailTask()` 方法（HHA 端）
- [ ] 实现 `startListening()` 方法（Outlook 端）
- [ ] 实现任务状态追踪（PENDING → PROCESSING → COMPLETED）
- [ ] 不修改 `VisitMonitor.ts` 的任何代码

**文件**:
- `src/js/services/MailService.ts`

---

### Story 8: OutlookAdapter 自动化

**目标**: 实现 Outlook Web 页面的 DOM 操作

**验收标准**:
- [ ] 在 `src/index.ts` 添加 Outlook 页面路由
- [ ] 实现 `OutlookAdapter.composeEmail()` 方法
- [ ] 自动点击"新建邮件"按钮
- [ ] 自动填充 To、CC、Subject
- [ ] 自动填充 Body（支持 HTML 富文本）
- [ ] 填充完成后报告状态

**文件**:
- `src/js/services/OutlookAdapter.ts`
- `src/index.ts` (Outlook 路由)
- `config/webpack.config.*.cjs` (添加 @match outlook.office.com)

---

### Story 9: 内置模板系统

**目标**: 实现硬编码的复杂逻辑模板

**验收标准**:
- [ ] 创建"内置模板"Tab（与"自定义模板"平级）
- [ ] 实现至少 2 个内置模板示例
- [ ] 内置模板可包含复杂逻辑（如日期计算）
- [ ] 内置模板不可编辑/删除
- [ ] 内置模板可一键使用

**文件**:
- `src/js/tabs/MailBuilderTab.ts` (内置模板 UI)
- `src/js/services/BuiltinTemplates.ts`

---

### Story 10: 整合与测试

**目标**: 整合所有功能并进行端到端测试

**验收标准**:
- [ ] 所有 Story 功能正常工作
- [ ] HHA → Outlook 自动化流程畅通
- [ ] 模板导入导出正常工作
- [ ] 无 TypeScript 编译错误
- [ ] UI 美观，符合现有风格
- [ ] 详细的控制台日志

**文件**:
- 所有相关文件的最终集成

---

### Story 11: CSP-Compliant Outlook Integration (🆕 Technical Debt)

> [!IMPORTANT]
> **阻塞问题修复**：Story 8 实现的 `OutlookAdapter.ts` 因 Outlook CSP 策略无法运行。
> 本 Story 使用 `GM_addElement` API 重构以绕过 CSP 限制。

**目标**: 重构 Outlook 自动化适配器以符合 CSP 安全策略

**验收标准**:
- [ ] 添加 `GM.addElement` 到 `@grant` 权限列表
- [ ] 创建 `CSPBypassInjector` 服务（封装 `GM_addElement` 调用）
- [ ] 定义 `OutlookDOMController` Payload（自包含脚本字符串）
- [ ] 重构 `OutlookAdapter.ts` 使用 Payload 注入方式
- [ ] 通过 CustomEvent 实现跨上下文通讯
- [ ] 保持单文件构建（`index.prod.user.js`）
- [ ] 实际测试通过：控制台无 CSP 错误，邮件自动填充成功

**文件**:
- `config/metadata.cjs` (添加 `GM.addElement` grant)
- `src/js/services/CSPBypassInjector.ts` (新建)
- `src/js/services/OutlookDOMControllerPayload.ts` (新建)
- `src/js/services/OutlookAdapter.ts` (重构)
- `src/typings.d.ts` (可选：添加 `GM.addElement` 类型声明)

**参考文档**:
- 详细 Story 文档：`docs/stories/epic-12-story-11-csp-compliant-outlook-integration.md`
- 技术研究指南：`docs/guides/Outlook CSP 绕过 Userscript 方案.md`

---

## 技术约束

1. **环境限制**: Tampermonkey 环境
2. **存储**: 必须使用 `GM_setValue` / `GM_getValue`（不是 localStorage）
3. **请求**: 必须使用 `GM_fetch`（如果需要网络请求）
4. **独立性**: `MailService` 必须独立于 `VisitMonitor.ts`
5. **跨域**: 需要在 Tampermonkey 头部添加 `@match` 规则
6. **浏览器**: Chrome/Edge

## 风险与缓解

| 风险                   | 概率 | 影响 | 缓解措施                                |
| ---------------------- | ---- | ---- | --------------------------------------- |
| Outlook DOM 结构变化   | 中   | 高   | 使用 aria-label 选择器（相对稳定）      |
| 病人页面两种结构不兼容 | 中   | 中   | 分别处理，使用 fallback 机制            |
| 跨 Tab 通讯延迟        | 低   | 低   | 使用 1 秒轮询，用户可接受的延迟         |
| 模板导入格式错误       | 中   | 低   | 添加 JSON 格式验证，错误时提示用户      |
| Outlook 页面未打开     | 中   | 中   | 检测后提示用户打开，或使用 GM_openInTab |

## 完成定义 (DoD)

- [ ] 所有 Story 验收标准通过
- [ ] 代码已添加 JSDoc 注释
- [ ] 无 TypeScript 编译错误
- [ ] UI 美观，符合现有风格
- [ ] 使用 GM_setValue 而非 localStorage
- [ ] MailService 完全独立于 VisitMonitor
- [ ] 手动测试通过
- [ ] 跨 Tab 自动化正常工作

## 变更日志

| 日期       | 版本 | 变更内容                               | 作者         |
| ---------- | ---- | -------------------------------------- | ------------ |
| 2026-01-15 | 1.0  | Epic 初始创建，基于需求讨论和 DOM 分析 | AI Developer |

---

## 📸 技术分析截图

### 页面 DOM 分析录像

![DOM Analysis Process](file:///C:/Users/KurosakiRei/.gemini/antigravity/brain/822946b1-c5b7-45d3-b654-163621965828/analyze_page_structures_1768537881881.webp)

### UI 设计参考

````carousel
![邮件助手面板设计](file:///C:/Users/KurosakiRei/.gemini/antigravity/brain/822946b1-c5b7-45d3-b654-163621965828/uploaded_image_0_1768530171875.png)
<!-- slide -->
![模板编辑器设计](file:///C:/Users/KurosakiRei/.gemini/antigravity/brain/822946b1-c5b7-45d3-b654-163621965828/uploaded_image_1768498234532.png)
````
