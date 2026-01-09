# ADR 008: QA 报告 Tab 实现方案

## 状态
**已实现** - 2026-01-09 (完成于 Epic 8)

## 背景

### 业务需求
Coordinator 需要定期对病人进行 Quality Assurance (QA) 电话回访，以确保服务质量。目前需要手动对比两个报表：
1. **Census by Coordinator**：获取当前负责的病人列表
2. **Patient General Notes**：查看病人的 QA 记录历史

手动对比效率低下且容易遗漏。需要一个自动化工具来：
- 合并两个数据源
- 自动计算上次 QA 距今天数
- 按优先级排序（长期未联系的优先）

### 技术需求
- 集成到现有多 Tab 面板系统（Epic 7）
- 复用现有 API 封装（CensusbyCoordinator.ts, PatientGeneralNotesReport.ts）
- 共享 API 参数，避免重复请求
- 支持数据导出和视图切换

---

## 决策

### 1. API 参数共享策略

**决策**：创建独立的 `ApiParamProvider` 单例模块

**⚠️ 风险警告**：
HHAExchange 页面采用多层 iframe 嵌套结构，将核心 API 参数提供器从 VisitMonitor 移动到 MultiTabPanel 层级存在以下风险：
- 跨 iframe 访问可能受限
- Session 信息在不同 iframe 层级可能不一致
- 页面重载时状态丢失风险

**缓解措施**：
1. **渐进式迁移**：先只在 QAReportTab 使用，VisitMonitor 保持原实现
2. **完整备份**：在 `src/js/backup/apiParamProvider-original.ts` 保存原始代码
3. **快速回退**：准备一键回退脚本，5 分钟内恢复原状
4. **保留期限**：原代码注释保留至少 2 周，确认稳定后再清理

**理由**：
- ✅ **避免重复请求**：多个组件共享同一份 API 参数
- ✅ **统一管理**：Session 信息、版本号等集中管理
- ✅ **易于维护**：修改只需改一处
- ✅ **支持多源**：可从 app.hhaexchange.com 或 reports.hhaexchange.com 获取

**备选方案**：复制代码到每个模块
- ❌ 代码重复
- ❌ 可能导致重复 API 调用
- ❌ 维护困难
- ✅ 但更安全（隔离故障）

**最终决策**：采用单例模式，但执行严格的备份和回退策略

**实现代码**：
```typescript
// src/js/services/ApiParamProvider.ts
export class ApiParamProvider {
  private static instance: ApiParamProvider;
  private params: ApiParams | null = null;
  
  private constructor() {}
  
  static getInstance(): ApiParamProvider {
    if (!ApiParamProvider.instance) {
      ApiParamProvider.instance = new ApiParamProvider();
    }
    return ApiParamProvider.instance;
  }
  
  async getParams(): Promise<ApiParams> {
    if (this.params) return this.params;
    
    // 根据当前页面选择获取策略
    if (this.isReportsPage()) {
      this.params = await this.extractFromReportsPage();
    } else {
      this.params = await this.extractFromAppPage();
    }
    
    return this.params;
  }
  
  private isReportsPage(): boolean {
    return window.location.hostname.includes('reports.hhaexchange.com');
  }
  
  private async extractFromReportsPage(): Promise<ApiParams> {
    // 从隐藏字段和 URL 参数提取
    const sessionInfo = extractSessionInfoFromReports();
    return this.normalizeParams(sessionInfo);
  }
  
  private async extractFromAppPage(): Promise<ApiParams> {
    // 使用 VisitMonitor 的方法，从 CallMaintenance 页面获取
    const response = await GM_fetch(CALL_MAINTENANCE_URL);
    const text = await response.text();
    return this.parseFromHtml(text);
  }
}
```

---

### 2. 数据获取策略

**决策**：两阶段串行获取 + 前端合并

**流程**：
```
Step 1: Census API ──▶ 获取病人列表 + Admission ID
                          │
                          ▼
Step 2: Notes API ──▶ 获取 QA 记录（按 Coordinator 过滤）
                          │
                          ▼
Step 3: 前端合并 ──▶ 根据 Admission ID 匹配 + 排序
```

**理由**：
- ✅ **减少 API 调用**：Notes API 只需调用一次（按 Coordinator 过滤）
- ✅ **避免 N+1 问题**：不需要为每个病人单独查询
- ✅ **数据完整**：Census 提供病人基础信息，Notes 提供 QA 历史

**备选方案**：为每个病人单独查询 Notes
- ❌ API 调用次数过多（可能上百次）
- ❌ 性能差
- ❌ 可能触发 API 限流

---

### 3. Census API 调用参数

**决策**：使用特定 Status 筛选

```typescript
const censusParams = {
  coordinatorIds: selectedCoordinatorId,
  statusIds: '3,4,8',  // Active (3), Hospitalized (4), Hold (8)
  isDefaultPatient: '0',
  // 其他参数使用 -1 (All)
  patientLocationIds: '-1',
  patientBranchIds: '-1',
  patientTeamIds: '-1',
  contractIds: '-1',
};
```

**排除的 Status**：
- Waiting (1)：尚未开始服务
- Discharged (5)：已出院，不再需要 QA

**理由**：
- ✅ 只关注当前在服务的病人
- ✅ 减少无效数据
- ✅ 符合业务逻辑

---

### 4. Patient General Notes API 调用参数

**决策**：获取过去一年的 Quality Assurance 记录

```typescript
const notesParams = {
  coordinatorId: selectedCoordinatorId,
  fromDate: getOneYearAgo(),  // 格式: MM/DD/YYYY
  toDate: getToday(),
  reasonId: '2289535',  // Quality Assurance
  statusId: '-1',  // All (包括 Open 和 Closed)
  priority: '-1',
  patientId: '-1',
};
```

**理由**：
- ✅ 一年范围足以覆盖大部分场景
- ✅ Quality Assurance (ID: 2289535) 是唯一需要的 Reason
- ✅ 不限制 Status，获取所有 QA 记录

---

### 5. 数据解析策略

**决策**：从报表 HTML/PDF 解析数据

**问题**：Census 和 Notes API 返回的是报表 URL (UserDataXML GUID)，而非结构化数据

**方案 A：解析报表 HTML**（推荐）
```typescript
async function fetchAndParseCensusData(reportUrl: string): Promise<CensusPatient[]> {
  const response = await GM_xmlhttpRequest({ url: reportUrl });
  const html = response.responseText;
  
  // 解析报表 HTML 中的表格数据
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rows = doc.querySelectorAll('table tr');
  
  return Array.from(rows).map(row => ({
    admissionId: row.cells[1]?.textContent,
    patientName: row.cells[2]?.textContent,
    // ...
  }));
}
```

**方案 B：使用导出功能**
- 部分报表支持导出 Excel/CSV
- 可能更结构化，但增加复杂度

**方案 C：拦截 AJAX 请求**（如果有）
- 某些报表可能有内部 AJAX 数据接口
- 需要进一步调研

**选择方案 A 的理由**：
- ✅ 通用性强，适用于所有报表
- ✅ 实现相对简单
- ✅ 不依赖额外接口

---

### 6. 排序算法

**决策**：按"从未联系 > 最久未联系（天数多）"排序

```typescript
function sortByQAPriority(items: QAReportItem[]): QAReportItem[] {
  return items.sort((a, b) => {
    // 1. 从未联系的排最前（Critical）
    if (a.lastQADaysAgo === null && b.lastQADaysAgo !== null) return -1;
    if (a.lastQADaysAgo !== null && b.lastQADaysAgo === null) return 1;
    if (a.lastQADaysAgo === null && b.lastQADaysAgo === null) {
      // 都没有记录时，按 Admission ID 排序（方便定位）
      return a.admissionId.localeCompare(b.admissionId);
    }
    
    // 2. 最久未联系的排前面（天数从大到小）
    return b.lastQADaysAgo! - a.lastQADaysAgo!;
  });
}
```

**优先级分类（用于视觉提示）**：
| 级别 | 条件 | 显示样式 | 示例 |
|------|------|----------|------|
| Critical | 从未联系 | 红色高亮 | 新入院患者 |
| High | >90 天 | 深橙色边框 | 长期未跟进 |
| Medium | 30-90 天 | 橙色边框 | 需要关注 |
| Low | <30 天 | 绿色边框 | 已及时跟进 |

**排序示例**：
```
1. 患者 A (ID: 12345) - 从未联系 (null)      ← Critical 优先
2. 患者 B (ID: 12346) - 从未联系 (null)      ← Critical
3. 患者 C (ID: 67890) - 120 天未联系         ← High (天数多)
4. 患者 D (ID: 54321) - 95 天未联系          ← High
5. 患者 E (ID: 98765) - 45 天未联系          ← Medium
6. 患者 F (ID: 11111) - 20 天前联系过        ← Low
```

**理由**：
- ✅ 突出最紧急的患者（从未联系）
- ✅ 将需要关注的患者（天数多）排在前面
- ✅ 减少协调员滚动查找的时间
- ✅ 符合质量管理的实际需求

---

### 7. UI 组件架构

**决策**：组件化 + MVC 分离

```
QAReportTab (Controller)
├── CoordinatorSelect (View)
├── Toolbar (View)
│   ├── LoadButton
│   ├── ExportButton
│   └── ViewToggle
├── ContentArea (View)
│   ├── ListView
│   └── GridView
└── ActionMenu (View)          ← 三点菜单
    ├── QuickQANote            ← 快速创建 QA Note（预留）
    ├── MakePhoneCall          ← 拨打电话（预留）
    ├── ViewAdmission          ← 查看详细信息
    └── ExportPatientData      ← 导出患者数据

QAReportService (Model)
├── CensusService
├── NotesService
└── DataMerger
```

**ActionMenu 预留功能说明**：
| 菜单项 | 当前状态 | 实现计划 |
|--------|---------|----------|
| **快速创建 QA Note** | 预留 | Epic 9 实现 API 集成 |
| **拨打电话** | 预留 | Epic 10 集成电话系统 |
| **查看详细信息** | 可实现 | 跳转到患者详情页 |
| **导出患者数据** | 可实现 | 导出单个患者的 QA 记录 |

**理由**：
- ✅ 职责清晰
- ✅ 易于测试
- ✅ 组件可复用
- ✅ 预留扩展接口，避免后续大幅改动

---

### 8. 视图切换实现

**决策**：DOM 切换 + CSS 动画

```typescript
class ContentArea {
  private listView: ListView;
  private gridView: GridView;
  private currentView: 'list' | 'grid' = 'list';
  
  switchView(view: 'list' | 'grid'): void {
    const outgoing = view === 'list' ? this.gridView : this.listView;
    const incoming = view === 'list' ? this.listView : this.gridView;
    
    // 淡出
    outgoing.element.classList.add('fade-out');
    
    setTimeout(() => {
      outgoing.element.style.display = 'none';
      incoming.element.style.display = 'block';
      incoming.element.classList.add('fade-in');
      
      setTimeout(() => {
        incoming.element.classList.remove('fade-in');
      }, 200);
    }, 200);
    
    this.currentView = view;
    this.saveViewPreference();
  }
}
```

**CSS**：
```css
.fade-out {
  opacity: 0;
  transition: opacity 200ms ease-out;
}

.fade-in {
  animation: fadeIn 200ms ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

### 9. 数据导出实现

**决策**：Blob 下载 + UTF-8 BOM

```typescript
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

function exportToCSV(data: QAReportItem[], coordinator: string): void {
  const BOM = '\uFEFF';  // UTF-8 BOM for Excel compatibility
  const headers = ['Admission ID', 'Patient Name', 'Phone', 'Last QA', 'Days Ago'];
  
  const rows = data.map(item => [
    item.admissionId,
    item.patientName,
    item.phones.map(p => p.phone).join('; '),
    item.lastQADate || 'Never',
    item.lastQADaysAgo === null ? 'N/A' : item.lastQADaysAgo.toString()
  ]);
  
  const csv = BOM + [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  const date = new Date().toISOString().split('T')[0];
  downloadFile(csv, `QA_Report_${coordinator}_${date}.csv`, 'text/csv');
}

function exportToJSON(data: QAReportItem[], coordinator: string): void {
  const json = JSON.stringify({
    coordinator,
    exportDate: new Date().toISOString(),
    totalPatients: data.length,
    patients: data
  }, null, 2);
  
  const date = new Date().toISOString().split('T')[0];
  downloadFile(json, `QA_Report_${coordinator}_${date}.json`, 'application/json');
}
```

---

### 10. LocalStorage 持久化

**决策**：持久化视图偏好和最后选择的 Coordinator

```typescript
const STORAGE_KEYS = {
  VIEW_MODE: 'hha_qa_report_view_mode',
  LAST_COORDINATOR: 'hha_qa_report_last_coordinator',
};

function saveViewMode(mode: 'list' | 'grid'): void {
  localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
}

function loadViewMode(): 'list' | 'grid' {
  return (localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as 'list' | 'grid') || 'list';
}

function saveLastCoordinator(id: string): void {
  localStorage.setItem(STORAGE_KEYS.LAST_COORDINATOR, id);
}

function loadLastCoordinator(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LAST_COORDINATOR);
}
```

---

## 样式设计

### 颜色方案（热力图 - 从红到绿）

```less
// 优先级颜色（7 级热力图）
@qa-critical:    #dc3545;  // 红色 - 从未联系
@qa-very-high:   #e74c3c;  // 深红 - >120 天
@qa-high:        #fd7e14;  // 橙红 - 90-120 天
@qa-medium-high: #ff9f40;  // 橙色 - 60-90 天
@qa-medium:      #ffc107;  // 黄色 - 30-60 天
@qa-low:         #a8d08d;  // 浅绿 - 15-30 天
@qa-very-low:    #28a745;  // 绿色 - <15 天

// 工具栏
@toolbar-bg: @bg-tertiary;
@toolbar-border: @border-color;

// 表格
@table-header-bg: @bg-secondary;
@table-row-hover: rgba(0, 0, 0, 0.05);
@table-border: @border-color;
```

### 响应式布局

```less
.qa-report-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .toolbar {
    flex-shrink: 0;
    padding: 12px;
    border-bottom: 1px solid @toolbar-border;
  }
  
  .content-area {
    flex: 1;
    overflow: auto;
  }
}

// 九宫格响应式
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 12px;
}
```

---

## 性能考虑

### 1. 数据量预估
- 每个 Coordinator 通常负责 50-200 个病人
- Patient Notes 一年可能有 1000+ 条记录
- 合并后的数据量可控

### 2. 优化措施
- **虚拟滚动**：如果列表超过 100 条，考虑虚拟滚动
- **延迟渲染**：九宫格视图只渲染可见区域
- **防抖处理**：搜索过滤添加 300ms 防抖
- **缓存**：短期缓存 API 结果（5 分钟内有效）

### 3. 内存管理
- 及时清理不用的 DOM 引用
- 大数据导出使用 Blob 而非字符串拼接

---

## 错误处理

### API 错误
```typescript
try {
  const data = await fetchCensusData(params);
} catch (error) {
  if (error.status === 401) {
    showError('Session 已过期，请刷新页面重新登录');
  } else if (error.status === 403) {
    showError('没有权限访问此 Coordinator 的数据');
  } else if (error.status >= 500) {
    showError('服务器错误，请稍后重试');
  } else {
    showError('获取数据失败: ' + error.message);
  }
}
```

### 数据解析错误
```typescript
try {
  const patients = parseCensusHtml(html);
  if (patients.length === 0) {
    showInfo('该 Coordinator 没有符合条件的病人');
  }
} catch (error) {
  console.error('解析报表数据失败:', error);
  showError('报表格式异常，请联系管理员');
}
```

---

## 未来扩展

### 预留功能
1. **操作菜单**（Story 8.10）
   - 查看病人详情
   - 打开病人资料页
   - 一键拨打电话
   - 记录 QA 通话

2. **搜索过滤**
   - 按病人姓名搜索
   - 按优先级筛选

3. **批量操作**
   - 批量标记已联系
   - 批量导出选中项

4. **数据刷新**
   - 自动定时刷新
   - 手动刷新按钮

---

## 参考资料

- [Epic 7: 多 Tab 面板系统重构](../stories/epic-7-multi-tab-panel-system.md)
- [ADR 007: 多 Tab 面板架构设计](./007-multi-tab-panel-architecture.md)
- [Census by Coordinator API 文档](../api/census-by-coordinator-api.md)
- [Patient General Notes API 文档](../api/patient-general-notes-api.md)
- [CensusbyCoordinator.ts 实现](../../src/js/CensusbyCoordinator.ts)
- [PatientGeneralNotesReport.ts 实现](../../src/js/PatientGeneralNotesReport.ts)
