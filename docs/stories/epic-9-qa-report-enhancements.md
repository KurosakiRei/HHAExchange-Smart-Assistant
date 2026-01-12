# Epic 9: QA 报告功能增强与完善

**状态**: ✅ **已完成** - 2026-01-11

## Epic 概述

完善 QA 报告面板的各项功能，包括表格排序、电话号码显示与拨打、数据导出修复、操作菜单功能实现等，以提升用户体验和工作效率。

## 业务价值

- **快速定位**：通过表格排序功能，用户可以快速找到特定病人
- **便捷操作**：电话号码一键拨打，减少手动复制粘贴
- **数据复制**：支持表格内容选中复制，方便数据使用
- **直接访问**：一键跳转病人详情页，无需手动搜索
- **快速记录**：预留快速创建 QA Note 功能，提升工作效率

## Story 列表

| Story | 标题 | 优先级 | 工时 | 状态 |
|-------|------|--------|------|------|
| 9.1 | 表格排序功能 | High | 4h | ✅ 已完成 |
| 9.2 | 表格可选中与复制 | Medium | 1h | ✅ 已完成 |
| 9.3 | 电话号码列功能实现 | High | 6h | ✅ 已完成 |
| 9.4 | 导出功能修复 | High | 2h | ✅ 已完成 |
| 9.5 | 查看病人详情功能 | Medium | 3h | ✅ 已完成 |
| 9.6 | 快速创建 QA Note 弹窗 | Medium | 3h | ✅ 已完成 |

**总工时预估**: 19 小时

---

## Story 9.1: 表格排序功能

### 用户故事
**作为** 脚本用户  
**我希望** 点击表头可以对表格进行排序  
**以便** 快速定位和查找特定病人

### 状态
✅ **已完成**

### 验收标准
- [x] 将 "Admission ID" 列名改为 "ID"
- [x] 以下列支持点击排序：
  - [x] ID 列 - 按字母 A-Z 排序
  - [x] 病人姓名列 - 按字母 A-Z 排序
  - [x] 上次 QA 列 - 按天数大小排序
- [x] 排序状态三态循环：原序 → 升序 → 降序 → 原序
- [x] 可排序列的表头显示排序图标：
  - 原序状态：显示 ⇅ 或不显示图标
  - 升序状态：显示 ▲
  - 降序状态：显示 ▼
- [x] 点击表头时排序状态切换，同时更新图标
- [x] 排序时保持数据完整性（所有列数据同步排序）
- [x] "解析到的QA日期" 和 "操作" 列不支持排序

### UI 设计

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ID ▲    │ 病人姓名 ⇅ │   电话    │ 上次 QA ⇅ │  操作  │
├─────────────────────────────────────────────────────────────────────────┤
│ AHC-901234 │ Alice Wang   │ 917-xxx-xxxx │ 5 天前    │   ⋮   │
│ AHC-902345 │ Bob Chen     │ ...          │ 从未联系  │   ⋮   │
│ AHC-903456 │ Carol Li     │ 347-xxx-xxxx │ 30 天前   │   ⋮   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 技术设计

#### 排序状态类型
```typescript
type SortDirection = 'none' | 'asc' | 'desc';
type SortableColumn = 'id' | 'name' | 'lastQA';

interface SortState {
  column: SortableColumn | null;
  direction: SortDirection;
}
```

#### 排序逻辑
```typescript
private sortState: SortState = { column: null, direction: 'none' };
private originalData: QAReportItem[] = []; // 保存原始顺序

private handleSort(column: SortableColumn): void {
  if (this.sortState.column === column) {
    // 同一列：切换状态 none → asc → desc → none
    const nextDirection: Record<SortDirection, SortDirection> = {
      'none': 'asc',
      'asc': 'desc', 
      'desc': 'none'
    };
    this.sortState.direction = nextDirection[this.sortState.direction];
  } else {
    // 新列：从 asc 开始
    this.sortState.column = column;
    this.sortState.direction = 'asc';
  }
  
  this.applySorting();
  this.renderData();
}

private applySorting(): void {
  if (this.sortState.direction === 'none') {
    // 恢复原始顺序
    this.qaReportData = [...this.originalData];
    return;
  }
  
  const multiplier = this.sortState.direction === 'asc' ? 1 : -1;
  
  this.qaReportData.sort((a, b) => {
    switch (this.sortState.column) {
      case 'id':
        return multiplier * a.admissionId.localeCompare(b.admissionId);
      case 'name':
        return multiplier * a.patientName.localeCompare(b.patientName);
      case 'lastQA':
        // null (从未联系) 视为最大值
        const aVal = a.lastQADaysAgo ?? Infinity;
        const bVal = b.lastQADaysAgo ?? Infinity;
        return multiplier * (aVal - bVal);
      default:
        return 0;
    }
  });
}
```

#### 表头渲染
```typescript
private getSortIcon(column: SortableColumn): string {
  if (this.sortState.column !== column || this.sortState.direction === 'none') {
    return '<span class="sort-icon sort-none">⇅</span>';
  }
  return this.sortState.direction === 'asc' 
    ? '<span class="sort-icon sort-asc">▲</span>'
    : '<span class="sort-icon sort-desc">▼</span>';
}
```

#### CSS 样式
```less
.qa-report-table th.sortable {
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background-color: darken(@header-bg, 5%);
  }
  
  .sort-icon {
    margin-left: 4px;
    font-size: 10px;
    opacity: 0.6;
    
    &.sort-asc, &.sort-desc {
      opacity: 1;
      color: @accent-color;
    }
  }
}
```

---

## Story 9.2: 表格可选中与复制

### 用户故事
**作为** 脚本用户  
**我希望** 可以选中（highlight）表格内容并复制  
**以便** 方便地使用表格中的数据

### 状态
✅ **已完成**

### 验收标准
- [x] 表格内所有文本内容可以用鼠标选中高亮
- [x] 选中的内容可以通过 Ctrl+C 或右键菜单复制
- [x] 列表视图和九宫格视图都支持选中复制
- [x] 电话号码可以选中复制
- [x] 不影响按钮和下拉菜单的点击交互

### 技术设计

#### CSS 调整
```less
.qa-report-table {
  // 移除可能阻止选中的样式
  user-select: text;
  
  td {
    user-select: text;
    cursor: text;
  }
  
  // 按钮列除外
  td.col-action {
    user-select: none;
    cursor: default;
  }
}

.qa-card {
  user-select: text;
  
  // 按钮除外
  .card-action-btn {
    user-select: none;
  }
}
```

---

## Story 9.3: 电话号码列功能实现

### 用户故事
**作为** 脚本用户  
**我希望** 在 QA 报告中看到病人的电话号码，并能一键拨打  
**以便** 快速联系病人进行 QA 回访

### 状态
✅ **已完成**

### 验收标准
- [x] 恢复第三列为"电话"列（替换当前的 debug 列）
- [x] 通过 Admission ID 获取病人电话号码
- [x] 单个电话号码：直接显示号码
- [x] 多个电话号码：显示 "⋯" 图标，点击展开下拉框
- [x] 下拉框显示所有电话号码
- [x] 点击电话号码使用 `tel:` 协议发起拨打
- [x] 所有电话号码可以选中复制
- [x] 加载数据时显示 loading 状态
- [x] 请求失败时显示 "-" 或错误提示

### UI 设计

#### 单个电话号码
```
┌─────────────┐
│ 917-415-2489│  ← 直接显示，可点击拨打
└─────────────┘
```

#### 多个电话号码
```
┌─────────────┐
│     ⋯      │  ← 点击展开
└─────────────┘
       ↓
┌─────────────────────┐
│ 📞 332-265-6219     │  ← 点击拨打
│ 📞 929-685-6363     │
│ 📞 347-323-3536     │
└─────────────────────┘
```

### 技术设计

#### 数据获取
```typescript
// 请求 URL 模板
const PATIENT_SEARCH_BY_NUMBER_URL = 
  'https://app.hhaexchange.com/ENT2507010000/Patient/PatientSearchXSLT_ns.aspx' +
  '?FirstName=&LastName=&StatusID=-1&PatientID=&MRNumber=&CoordinatorId=-1' +
  '&Source=-1&PatientNumber={ADMISSION_ID}&HomePhone=';

const PATIENT_SEARCH_PARAMS = 
  '&AltPatientID=&TeamID=-1&LocationID=-1&BranchID=-1&DisciplineID=0' +
  '&Default=false&pg=1&sort=&ord=ASC&OfficeIds=469,5137,5139,6475,14849&MedicaidID=';

interface PatientSearchResult {
  phones: string[];
  profileId: string | null;
}

/**
 * 通过 Admission ID 获取病人电话号码和 Profile ID
 */
async function fetchPatientDetails(admissionId: string): Promise<PatientSearchResult> {
  const url = PATIENT_SEARCH_BY_NUMBER_URL.replace('{ADMISSION_ID}', admissionId) 
            + PATIENT_SEARCH_PARAMS 
            + `&_=${Date.now()}`;
  
  const response = await GM_fetch(url);
  const html = await response.text();
  
  return parsePatientSearchResult(html);
}

/**
 * 解析搜索结果 HTML，提取电话号码和 Profile ID
 */
function parsePatientSearchResult(html: string): PatientSearchResult {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const rows = doc.querySelectorAll('#tdSearchResults tbody tr');
  
  if (rows.length === 0) {
    return { phones: [], profileId: null };
  }
  
  // 取第一行结果
  const row = rows[0];
  const cells = row.querySelectorAll('td');
  
  // 电话号码在第9列 (index 8)，格式: "332-265-6219, 929-685-6363, 347-323-3536"
  const phoneCell = cells[8];
  const phonesText = phoneCell?.textContent?.trim() || '';
  const phones = phonesText
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  // Profile ID 从 onclick 属性提取
  const link = row.querySelector('a[onclick*="RedirectToPatientPage"]');
  const onclickAttr = link?.getAttribute('onclick') || '';
  const match = onclickAttr.match(/RedirectToPatientPage\((\d+)/);
  const profileId = match ? match[1] : null;
  
  return { phones, profileId };
}
```

#### 缓存设计
```typescript
// 缓存已获取的病人详情，避免重复请求
private patientDetailsCache: Map<string, PatientSearchResult> = new Map();

async getPatientDetails(admissionId: string): Promise<PatientSearchResult> {
  if (this.patientDetailsCache.has(admissionId)) {
    return this.patientDetailsCache.get(admissionId)!;
  }
  
  const result = await fetchPatientDetails(admissionId);
  this.patientDetailsCache.set(admissionId, result);
  return result;
}
```

#### 电话号码下拉组件
```typescript
private showPhoneDropdown(phones: string[], anchorEl: HTMLElement): void {
  document.querySelector('.phone-dropdown')?.remove();
  
  const dropdown = document.createElement('div');
  dropdown.className = 'phone-dropdown';
  
  phones.forEach(phone => {
    const item = document.createElement('a');
    item.className = 'phone-dropdown-item';
    item.href = `tel:${phone.replace(/\D/g, '')}`;
    item.innerHTML = `📞 ${phone}`;
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      // tel: 协议会自动处理
    });
    dropdown.appendChild(item);
  });
  
  // 定位到锚点元素下方
  const rect = anchorEl.getBoundingClientRect();
  dropdown.style.position = 'fixed';
  dropdown.style.top = `${rect.bottom + 4}px`;
  dropdown.style.left = `${rect.left}px`;
  
  // 点击外部关闭
  const closeHandler = (e: MouseEvent) => {
    if (!dropdown.contains(e.target as Node)) {
      dropdown.remove();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 0);
  
  document.body.appendChild(dropdown);
}
```

#### CSS 样式
```less
.phone-cell {
  user-select: text;
  
  .phone-single {
    color: @link-color;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .phone-multiple {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    background: @bg-secondary;
    
    &:hover {
      background: darken(@bg-secondary, 5%);
    }
  }
}

.phone-dropdown {
  background: white;
  border: 1px solid @border-color;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1000;
  min-width: 150px;
  
  .phone-dropdown-item {
    display: block;
    padding: 8px 12px;
    color: @text-primary;
    text-decoration: none;
    user-select: text;
    
    &:hover {
      background: @bg-hover;
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid @border-light;
    }
  }
}
```

---

## Story 9.4: 导出功能修复

### 用户故事
**作为** 脚本用户  
**我希望** 点击"导出"按钮能正常弹出格式选择菜单  
**以便** 将 QA 报告数据导出为 CSV 或 JSON 格式

### 状态
✅ **已完成**

### 问题分析
当前导出按钮点击无反应，可能原因：
1. CSS 样式问题导致菜单不可见（z-index、position、display 等）
2. 菜单被其他元素遮挡
3. 事件监听器未正确绑定

### 验收标准
- [x] 点击"导出"按钮显示格式选择下拉菜单
- [x] 菜单显示在按钮下方正确位置
- [x] 菜单包含 "📄 导出 CSV" 和 "📋 导出 JSON" 两个选项
- [x] 点击选项触发对应的导出功能
- [x] 点击菜单外区域关闭菜单
- [x] 导出的文件名格式：`QA_Report_{Coordinator}_{Date}.{ext}`
- [x] CSV 导出包含 UTF-8 BOM 以支持 Excel 中文显示

### 技术设计

#### 检查并修复 CSS
```less
.qa-export-menu {
  position: fixed;
  background: white;
  border: 1px solid @border-color;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 10000;  // 确保足够高
  min-width: 140px;
  
  .export-menu-item {
    padding: 10px 16px;
    cursor: pointer;
    white-space: nowrap;
    
    &:hover {
      background: @bg-hover;
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid @border-light;
    }
  }
}
```

#### 调试与验证
```typescript
private showExportMenu(): void {
  console.log('[QAReportTab] showExportMenu called'); // Debug log
  
  // Remove existing menu
  document.querySelector('.qa-export-menu')?.remove();
  
  const menu = document.createElement('div');
  menu.className = 'qa-export-menu';
  
  // ... 现有代码 ...
  
  console.log('[QAReportTab] Export menu created:', menu); // Debug log
  console.log('[QAReportTab] Menu position:', menu.style.top, menu.style.left);
  
  document.body.appendChild(menu);
}
```

---

## Story 9.5: 查看病人详情功能

### 用户故事
**作为** 脚本用户  
**我希望** 通过操作菜单一键打开病人详情页  
**以便** 快速查看病人的完整信息

### 状态
✅ **已完成**

### 验收标准
- [x] "⋮" 操作菜单中的"📋 查看病人详情"可正常使用
- [x] 点击后在新标签页打开正确的病人详情页
- [x] 使用 Profile ID 构建 URL（非 Admission ID）
- [x] 如果无法获取 Profile ID，显示错误提示

### 技术设计

#### URL 格式
```typescript
const PATIENT_PROFILE_URL_TEMPLATE = 
  'https://app.hhaexchange.com/ENT2507010000/Patient/InternalPatientInfo_ns.aspx?PatientId={ID}';
```

#### 实现逻辑
```typescript
private async handleAction(action: string, item: QAReportItem): Promise<void> {
  switch (action) {
    case 'view-patient':
      await this.openPatientProfile(item);
      break;
    // ... 其他 actions
  }
}

private async openPatientProfile(item: QAReportItem): Promise<void> {
  try {
    // 获取 Profile ID（会使用缓存）
    const details = await this.getPatientDetails(item.admissionId);
    
    if (details.profileId) {
      const url = PATIENT_PROFILE_URL_TEMPLATE.replace('{ID}', details.profileId);
      window.open(url, '_blank');
    } else {
      this.showError('无法获取病人资料链接');
    }
  } catch (error) {
    console.error('[QAReportTab] Failed to get patient profile:', error);
    this.showError('获取病人信息失败');
  }
}
```

#### 依赖关系
- 复用 Story 9.3 中的 `fetchPatientDetails()` 函数和缓存机制
- Profile ID 和电话号码从同一个请求获取，避免重复请求

---

## Story 9.6: 快速创建 QA Note 弹窗

### 用户故事
**作为** 脚本用户  
**我希望** 通过操作菜单打开快速创建 QA Note 的弹窗  
**以便** 未来能快速记录 QA 回访结果

### 状态
✅ **已完成**

### 验收标准
- [x] "⋮" 操作菜单中的"📝 快速创建 QA Note"打开弹窗
- [x] 弹窗显示病人姓名和 Admission ID
- [x] 弹窗显示预设的 QA 语句提示
- [x] 弹窗包含可选的附加备注输入框
- [x] "取消"按钮关闭弹窗
- [x] "提交并关闭"按钮显示"功能开发中..."提示
- [x] 弹窗样式与整体设计风格一致
- [x] 点击弹窗外部不关闭弹窗（防止误操作）
- [x] 按 ESC 键可关闭弹窗

### UI 设计

```
┌─────────────────────────────────────────────────────────────────┐
│  📝 快速创建 QA Note - LIN SHUYU (AHC-909557)              ✕   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  将提交以下 QA 记录:                                           │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Quality call made to pt, confirmed pt has not been        │ │
│  │ admitted to hospital or rehab within the last 30 days.    │ │
│  │ Pt is satisfied with current aide and or hours OR pt is   │ │
│  │ interested in increase                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  附加备注 (可选):                                              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│                        [ 取消 ]    [ 提交并关闭 ]              │
└─────────────────────────────────────────────────────────────────┘
```

### 技术设计

#### 预设语句常量
```typescript
const QA_NOTE_TEMPLATE = 
  'Quality call made to pt, confirmed pt has not been admitted to hospital or rehab ' +
  'within the last 30 days. Pt is satisfied with current aide and or hours OR pt is ' +
  'interested in increase';
```

#### 弹窗实现
```typescript
private showQuickNoteModal(item: QAReportItem): void {
  // 移除已有弹窗
  document.querySelector('.qa-note-modal-overlay')?.remove();
  
  const overlay = document.createElement('div');
  overlay.className = 'qa-note-modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'qa-note-modal';
  
  modal.innerHTML = `
    <div class="modal-header">
      <h3>📝 快速创建 QA Note - ${item.patientName} (${item.admissionId})</h3>
      <button class="modal-close-btn">✕</button>
    </div>
    <div class="modal-body">
      <div class="note-preview-section">
        <label>将提交以下 QA 记录:</label>
        <div class="note-preview">${QA_NOTE_TEMPLATE}</div>
      </div>
      <div class="note-extra-section">
        <label>附加备注 (可选):</label>
        <textarea 
          class="note-extra-input" 
          placeholder="在此输入附加内容，将追加到上述语句之后..."
          rows="3"
        ></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="hha-smart-btn-secondary modal-cancel-btn">取消</button>
      <button class="hha-smart-btn-primary modal-submit-btn">提交并关闭</button>
    </div>
  `;
  
  overlay.appendChild(modal);
  
  // 事件绑定
  const closeBtn = modal.querySelector('.modal-close-btn');
  const cancelBtn = modal.querySelector('.modal-cancel-btn');
  const submitBtn = modal.querySelector('.modal-submit-btn');
  
  const closeModal = () => overlay.remove();
  
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  
  submitBtn?.addEventListener('click', () => {
    this.showInfo('功能开发中，敬请期待...');
    // TODO: 未来实现 API 调用
    // const extraNote = modal.querySelector('.note-extra-input').value;
    // const fullNote = extraNote ? `${QA_NOTE_TEMPLATE} ${extraNote}` : QA_NOTE_TEMPLATE;
    // await submitQANote(item.admissionId, fullNote);
  });
  
  // ESC 关闭
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
  
  document.body.appendChild(overlay);
}
```

#### CSS 样式
```less
.qa-note-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.qa-note-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid @border-color;
    background: @bg-secondary;
    
    h3 {
      margin: 0;
      font-size: 16px;
      color: @text-primary;
    }
    
    .modal-close-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: @text-secondary;
      
      &:hover {
        color: @text-primary;
      }
    }
  }
  
  .modal-body {
    padding: 20px;
    
    .note-preview-section {
      margin-bottom: 16px;
      
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: @text-secondary;
      }
      
      .note-preview {
        background: @bg-tertiary;
        border: 1px solid @border-color;
        border-radius: 4px;
        padding: 12px;
        font-size: 13px;
        line-height: 1.5;
        color: @text-primary;
        user-select: text;
      }
    }
    
    .note-extra-section {
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: @text-secondary;
      }
      
      .note-extra-input {
        width: 100%;
        border: 1px solid @border-color;
        border-radius: 4px;
        padding: 10px;
        font-size: 14px;
        resize: vertical;
        font-family: inherit;
        
        &:focus {
          outline: none;
          border-color: @accent-color;
          box-shadow: 0 0 0 2px fade(@accent-color, 20%);
        }
      }
    }
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid @border-color;
    background: @bg-secondary;
  }
}
```

---

## 技术架构

### 文件修改清单
```
src/js/tabs/QAReportTab.ts    # 主要修改文件
src/style/qa-report-tab.less  # 样式更新
```

### 新增功能模块
```typescript
// QAReportTab.ts 中新增的主要方法

// Story 9.1 - 排序
private sortState: SortState;
private originalData: QAReportItem[];
private handleSort(column: SortableColumn): void;
private applySorting(): void;
private getSortIcon(column: SortableColumn): string;

// Story 9.3 - 电话号码
private patientDetailsCache: Map<string, PatientSearchResult>;
private fetchPatientDetails(admissionId: string): Promise<PatientSearchResult>;
private parsePatientSearchResult(html: string): PatientSearchResult;
private showPhoneDropdown(phones: string[], anchorEl: HTMLElement): void;

// Story 9.5 - 病人详情（复用 9.3 的缓存）
private openPatientProfile(item: QAReportItem): Promise<void>;

// Story 9.6 - QA Note 弹窗
private showQuickNoteModal(item: QAReportItem): void;
```

### 数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                       QA Report Tab                              │
├─────────────────────────────────────────────────────────────────┤
│  1. 加载数据 (现有)                                             │
│     Census API → Patient Notes API → 合并数据                   │
│                                                                  │
│  2. 电话号码/Profile ID 获取 (新增)                            │
│     点击电话列/查看详情 → 检查缓存 → 发送 PatientSearch 请求    │
│     → 解析 HTML → 缓存结果 → 显示电话/打开详情页               │
│                                                                  │
│  3. 排序 (新增)                                                 │
│     点击表头 → 切换排序状态 → 重新排序数据 → 重新渲染          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 测试计划

### 功能测试

| 测试项 | 测试步骤 | 预期结果 |
|-------|---------|---------|
| 排序-ID | 点击 ID 列表头 | 按 ID 升序/降序排列 |
| 排序-姓名 | 点击姓名列表头 | 按姓名 A-Z/Z-A 排列 |
| 排序-QA | 点击上次QA列表头 | 按天数升序/降序排列 |
| 排序-重置 | 连续点击同一列3次 | 恢复原始顺序 |
| 复制 | 选中表格文本 Ctrl+C | 成功复制到剪贴板 |
| 电话-单个 | 查看单电话病人 | 直接显示电话号码 |
| 电话-多个 | 点击多电话的 ⋯ | 显示电话下拉框 |
| 电话-拨打 | 点击电话号码 | 触发 tel: 协议 |
| 导出-CSV | 点击导出 → CSV | 下载 CSV 文件 |
| 导出-JSON | 点击导出 → JSON | 下载 JSON 文件 |
| 详情页 | 点击查看病人详情 | 新标签打开详情页 |
| QA弹窗 | 点击快速创建 QA Note | 显示弹窗 |
| QA提交 | 点击提交并关闭 | 显示"功能开发中" |

---

## 风险与依赖

### 风险
1. **API 请求频率**：每个病人需要额外请求获取电话号码，可能影响性能
   - 缓解：使用缓存机制，懒加载（点击时才请求）
   
2. **HTML 解析稳定性**：HHAExchange 页面结构可能变化
   - 缓解：使用健壮的选择器，添加错误处理

### 依赖
- Story 9.3、9.5 共享同一个请求和缓存机制
- 排序功能需要保存原始数据顺序用于重置

---

## 变更日志

| 日期 | 版本 | 描述 | 作者 |
|-----|------|------|-----|
| 2026-01-09 | 1.0 | 创建 Epic 9 文档 | PM |
| 2026-01-10 | 1.1 | 完成所有 6 个 Stories 实现 | Dev |
