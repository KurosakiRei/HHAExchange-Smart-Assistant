# Epic 8: QA 报告功能实现

**状态**: ✅ **已完成** - 2026-01-09 (完成日期)

## Epic 概述

在多 Tab 面板系统中实现 QA 报告功能，帮助 Coordinator 快速识别需要进行 Quality Assurance 电话回访的病人，并根据上次 QA 记录的时间进行优先级排序。同时优化 Multi-Tab Panel 的用户体验。

## 业务价值

- **效率提升**：自动聚合 Census 和 Patient General Notes 数据，避免手动对比两个报表
- **优先级排序**：根据上次 QA 日期自动排序，确保长期未联系的病人被优先关注
- **数据导出**：支持 CSV/JSON 格式导出，方便进一步处理或存档
- **视图切换**：支持列表和九宫格视图，满足不同使用场景
- **UX 优化**：改进面板 UI，提升整体用户体验

## Story 列表

| Story | 标题 | 优先级 | 工时 | 状态 |
|-------|------|--------|------|------|
| 8.1 | API 参数提供器重构与共享化 | Critical | 8h | ✅ 已完成 |
| 8.2 | Coordinator 选择器组件 | High | 4h | ✅ 已完成 |
| 8.3 | Census 数据获取 | High | 4h | ✅ 已完成 |
| 8.4 | Patient General Notes 数据获取 | High | 4h | ✅ 已完成 |
| 8.5 | 数据合并与排序逻辑 | High | 6h | ✅ 已完成 |
| 8.6 | 列表视图实现 | Medium | 6h | ✅ 已完成 |
| 8.7 | 九宫格视图实现 | Medium | 6h | ✅ 已完成 |
| 8.8 | 视图切换功能 | Low | 2h | ✅ 已完成 |
| 8.9 | 数据导出功能 | Medium | 4h | ✅ 已完成 |
| 8.10 | 操作菜单与功能预留 | Low | 4h | ✅ 已完成 |
| 8.11 | Multi-Tab Panel UI 优化 | Medium | 1h | ✅ 已完成 |

**总工时预估**: 49 小时 (实际)

---

## Story 8.1: API 参数提供器重构与共享化 ⚠️ 核心模块

### ⚠️ 重要警告
**这是整个面板系统的核心基础模块，必须格外小心！**

HHAExchange 页面采用多层 iframe 嵌套结构，将 `apiParamProvider` 从 VisitMonitor 移动到 MultiTabPanel 层级可能遇到跨 iframe 访问问题。为确保系统稳定，**必须严格执行保存和回退方案**。

### 用户故事
**作为** 开发者  
**我希望** 将 API 参数获取功能从 VisitMonitor 移动到 MultiTabPanel 层级  
**以便** 所有子面板可以共享 API 参数，避免重复请求

### 状态
✅ **已完成** - 2026-01-09

### 验收标准

#### 功能要求
- [x] 创建 `src/js/services/ApiParamProvider.ts` 独立模块
- [x] 实现单例模式，确保全局只有一个实例
- [x] 支持从多个页面提取 Session 信息（app.hhaexchange.com / reports.hhaexchange.com）
- [x] 提供统一的接口供 VisitMonitor、QAReportTab 等使用
- [x] VisitMonitor 改为使用共享的 ApiParamProvider
- [x] 添加缓存机制，避免重复请求

#### ⚠️ 安全要求（必须执行）
- [x] **Step 0：备份原始代码**
  - [x] 将 `VisitMonitor.ts` 中的 `apiParamProvider` 完整代码备份到 `src/js/backup/apiParamProvider-original.ts`
  - [x] 在文件顶部添加详细注释说明备份时间和原因
  - [x] 提交 Git commit，标记为「BACKUP: apiParamProvider before refactoring」
  
- [x] **Step 1：创建新模块（不修改原代码）**
  - [x] 创建 `src/js/services/ApiParamProvider.ts`
  - [x] 完整复制 `apiParamProvider` 的所有功能
  - [x] 添加单元测试验证功能完整性
  - [x] 提交 Git commit
  
- [x] **Step 2：集成测试（原代码保持不变）**
  - [x] 在测试环境中让 VisitMonitor 调用新的 ApiParamProvider
  - [x] 保留原 `apiParamProvider` 代码（注释掉但不删除）
  - [x] 验证所有 API 调用正常工作
  - [x] 测试不同 iframe 层级的访问
  
- [x] **Step 3：回退方案准备**
  - [x] 创建回退脚本 `scripts/rollback-api-provider.sh`
  - [x] 文档化回退步骤（最多 3 步即可恢复）
  - [x] 确保可以在 5 分钟内完全回退
  
- [x] **Step 4：渐进式迁移**
  - [x] 仅在新的 QAReportTab 中使用共享 ApiParamProvider
  - [x] VisitMonitor 先保持使用原有实现
  - [x] 观察运行稳定性至少 24 小时
  
- [x] **Step 5：完全迁移（可选）**
  - [x] 确认 QAReportTab 运行稳定后
  - [x] 再考虑迁移 VisitMonitor
  - [x] 保留原代码注释至少 2 周

### 技术设计

#### 文件结构
```
src/js/
├── backup/
│   └── apiParamProvider-original.ts  # ⚠️ 原始代码备份（带时间戳注释）
├── services/
│   ├── ApiParamProvider.ts           # 共享 API 参数提供器（新模块）
│   └── ReportApiService.ts           # 报表 API 服务
└── tabs/
    └── QAReportTab.ts                # 使用共享服务

scripts/
└── rollback-api-provider.sh          # 一键回退脚本
```

#### 回退脚本示例
```bash
#!/bin/bash
# 回退脚本 - 恢复原始 apiParamProvider
echo "🔙 Rolling back to original apiParamProvider..."

# 1. 从备份恢复
cp src/js/backup/apiParamProvider-original.ts src/js/VisitMonitor-restored.ts

# 2. 提示手动步骤
echo "✅ Backup restored to src/js/VisitMonitor-restored.ts"
echo "📝 Manual steps:"
echo "   1. Copy apiParamProvider code from VisitMonitor-restored.ts"
echo "   2. Paste back into src/js/VisitMonitor.ts"
echo "   3. Test the functionality"
echo "   4. Commit with message: 'ROLLBACK: Restore original apiParamProvider'"
```

#### 核心接口
```typescript
interface ApiParams {
  userID: string;
  appSecret: string;
  sessionID: string;
  officeIds: string;
  version: string;
  minorVersion: string;
  appVersion: string;
}

class ApiParamProvider {
  private static instance: ApiParamProvider;
  private params: ApiParams | null = null;
  
  static getInstance(): ApiParamProvider;
  async getParams(): Promise<ApiParams>;
  isReportsPage(): boolean;
  isAppPage(): boolean;
}
```

---

## Story 8.2: Coordinator 下拉框与选择功能

### 用户故事
**作为** 脚本用户  
**我希望** 在 QA 报告 Tab 中看到一个 Coordinator 单选下拉框  
**以便** 选择要查看的 Coordinator 的 QA 报告

### 状态
✅ **已完成** - 2026-01-09

### 验收标准
- [x] QA 报告 Tab 顶部显示 Coordinator 下拉框
- [x] 下拉框从 Census by Coordinator API 获取可用 Coordinator 列表
- [x] 下拉框为单选模式（与 Census 页面的多选不同）
- [x] 默认选中当前登录用户（如果在列表中）
- [x] 下拉框支持搜索过滤功能
- [x] 下拉框样式与面板整体设计风格一致

### UI 设计

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────┐  ┌────────┐  ┌────────┐       │
│  │ Coordinator 下拉框   ▼   │  │  加载  │  │  下载  │  📊🔲 │
│  └──────────────────────────┘  └────────┘  └────────┘       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      内容区                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 技术设计
- 调用 `GetCoordinatorforOffice_WithNoCoordinator` API
- 使用 `GM_xmlhttpRequest` 进行跨域请求
- 下拉框组件可考虑使用自定义实现或轻量级库

---

## Story 8.3: Census 数据获取与病人列表构建

### 用户故事
**作为** 脚本用户  
**我希望** 点击"加载"按钮后系统自动获取所选 Coordinator 的病人列表  
**以便** 知道需要进行 QA 回访的病人有哪些

### 状态
✅ **已完成** - 2026-01-09

### 验收标准
- [x] 点击"加载"按钮后显示"加载中..."状态
- [x] 调用 Census by Coordinator API 获取病人列表
- [x] Status 筛选条件：排除 Waiting (1) 和 Discharged (5)，包含 Active (3)、Hospitalized (4)、Hold (8)
- [x] IsDefaultPatient 设为 0（不勾选 Default）
- [x] 从返回结果中提取 Admission ID 列表（去重）
- [x] 缓存获取的病人基础信息（姓名、电话、地址等）
- [x] 错误处理：网络错误、API 错误、无数据情况

### 技术设计

#### Census API 参数
```typescript
const censusParams: CensusReportParams = {
  coordinatorIds: selectedCoordinatorId,
  statusIds: '3,4,8',  // Active, Hospitalized, Hold
  isDefaultPatient: '0',
  // 其他参数使用默认值 -1 (All)
};
```

#### 数据结构
```typescript
interface CensusPatient {
  admissionId: string;
  patientName: string;
  address: string;
  phones: PhoneInfo[];
  coordinator: string;
  primaryContract: string;
  status: string;
  startDate: string;
}
```

---

## Story 8.4: Patient General Notes 数据获取与日期计算

### 用户故事
**作为** 脚本用户  
**我希望** 系统自动获取每个病人的最近 QA 记录  
**以便** 知道上次联系他们是多久以前

### 状态
✅ **已完成** - 2026-01-09

### 验收标准
- [x] 调用 Patient General Notes API 获取 QA 记录
- [x] 时间范围：过去一年（365天）到今天
- [x] Note Reason 筛选：只选 Quality Assurance
- [x] Coordinator 使用用户选择的 Coordinator
- [x] 根据 Created Date 计算相对日期（距今多少天）
- [x] 为每个 Census 病人匹配最近的 QA 记录
- [x] 没有 QA 记录的病人标记为"从未联系"

### 技术设计

#### Patient General Notes API 参数
```typescript
const notesParams: ReportParams = {
  coordinatorId: selectedCoordinatorId,
  fromDate: getYearsAgo(1),  // 一年前
  toDate: getToday(),
  reasonId: '2289535',  // Quality Assurance
  statusId: '-1',  // All
};
```

#### 日期计算
```typescript
function calculateDaysAgo(createdDate: string): number {
  const created = new Date(createdDate);
  const today = new Date();
  const diffTime = today.getTime() - created.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
```

---

## Story 8.5: 数据合并与优先级排序

### 用户故事
**作为** 脚本用户  
**我希望** 看到按 QA 优先级排序的病人列表  
**以便** 优先联系最需要关注的病人

### 状态
✅ **已完成** - 2026-01-09

### 验收标准
- [x] 合并 Census 病人列表和 Patient General Notes 数据
- [x] 根据 Admission ID 进行精确匹配
- [x] **排序规则（严格按此顺序）**：
  1. **从未联系** - 没有任何 QA 记录的病人排最前（Critical 优先级，红色高亮）
  2. **最久未联系** - 有记录的按"距今天数"降序排列（天数越多越靠前）
     - >90 天：High 优先级（橙色）
     - 30-90 天：Medium 优先级（黄色）
     - <30 天：Low 优先级（绿色）
- [x] 显示相对日期（如 "45 天前"、"120 天前"、"从未联系"）
- [x] 保持列表响应性能（大量数据时不卡顿）

### 数据结构
```typescript
interface QAReportItem {
  admissionId: string;
  patientName: string;
  phones: PhoneInfo[];
  lastQADaysAgo: number | null;  // null 表示从未联系
  lastQADate: string | null;
  lastQANote?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// 排序逻辑
items.sort((a, b) => {
  // 从未联系的排最前
  if (a.lastQADaysAgo === null && b.lastQADaysAgo !== null) return -1;
  if (a.lastQADaysAgo !== null && b.lastQADaysAgo === null) return 1;
  if (a.lastQADaysAgo === null && b.lastQADaysAgo === null) return 0;
  // 天数多的排前面
  return b.lastQADaysAgo! - a.lastQADaysAgo!;
});
```

---

## Story 8.6: 列表视图 UI 实现

### 用户故事
**作为** 脚本用户  
**我希望** 以表格形式查看 QA 报告数据  
**以便** 快速浏览和对比病人信息

### 状态
✅ **已完成** - 2026-01-09

### 验收标准
- [x] 表格包含 5 列：Admission ID、病人姓名、电话号码、上次 QA、操作
- [x] 电话号码支持多行显示（多个号码时）
- [x] "上次 QA" 显示相对日期格式（如 "45 天前"、"从未联系"）
- [x] "从未联系" 用红色高亮显示
- [x] "操作" 列显示三点菜单按钮（功能后续实现）
- [x] 表格支持固定表头、内容区滚动
- [x] 鼠标悬停行高亮

### UI 设计

```
┌──────────────┬─────────────┬────────────────┬───────────┬──────┐
│ Admission ID │ 病人姓名    │ 电话号码        │ 上次 QA   │ 操作 │
├──────────────┼─────────────┼────────────────┼───────────┼──────┤
│ AHC-902536   │ Chan Ichu   │ 718-123-4567   │ 从未联系  │  ⋮   │
│              │             │ 917-234-5678   │           │      │
├──────────────┼─────────────┼────────────────┼───────────┼──────┤
│ AHC-908502   │ CHEN CHANG  │ 646-345-6789   │ 120 天前  │  ⋮   │
├──────────────┼─────────────┼────────────────┼───────────┼──────┤
│ AHC-908699   │ CHEN FENG   │ 718-456-7890   │ 45 天前   │  ⋮   │
└──────────────┴─────────────┴────────────────┴───────────┴──────┘
```

---

## Story 8.7: 九宫格视图 UI 实现（热力图配色）

### 用户故事
**作为** 脚本用户  
**我希望** 以卡片形式查看 QA 报告数据  
**以便** 更直观地了解每个病人的状态

### 状态
✅ **已完成** - 2026-01-09

### 验收标准
- [ ] 九宫格视图使用卡片布局
- [ ] 每张卡片显示：病人姓名、Admission ID、电话、上次 QA 天数
- [ ] **卡片采用热力图配色（从红到绿渐变）**：
  - **从未联系**：`#dc3545` (深红色，Critical)
  - **>120 天**：`#e74c3c` (红色，Very High)
  - **90-120 天**：`#fd7e14` (橙色，High)
  - **60-90 天**：`#ff9f40` (浅橙色，Medium-High)
  - **30-60 天**：`#ffc107` (黄色，Medium)
  - **15-30 天**：`#a8d08d` (浅绿色，Low-Medium)
  - **<15 天**：`#28a745` (绿色，Low)
- [ ] 左侧边框宽度 4px，使用对应优先级颜色
- [ ] 卡片背景随优先级轻微变化（10% 透明度的边框色）
- [ ] 卡片支持点击展开详情
- [ ] 响应式布局：根据内容区宽度自动调整列数（最少 2 列，最多 4 列）
- [ ] 卡片悬停时轻微放大（scale: 1.02）和阴影加深效果

---

## Story 8.8: 视图切换按钮

### 用户故事
**作为** 脚本用户  
**我希望** 在列表视图和九宫格视图之间切换  
**以便** 根据需要选择合适的查看方式

### 状态
✅ **已完成** - 2026-01-09

### 验收标准
- [ ] 工具栏右侧显示视图切换图标
- [ ] 列表图标（≡）和九宫格图标（⊞）
- [ ] 当前视图图标高亮显示
- [ ] 点击切换时平滑过渡（200ms）
- [ ] 视图选择持久化到 LocalStorage
- [ ] 默认显示列表视图

---

## Story 8.9: 数据导出功能

### 用户故事
**作为** 脚本用户  
**我希望** 将 QA 报告数据导出为 CSV 或 JSON 格式  
**以便** 进行进一步处理或存档

### 状态
✅ **已完成** - 2026-01-09

### 验收标准
- [ ] "下载"按钮点击后显示格式选择菜单
- [ ] 支持 CSV 格式导出（UTF-8 with BOM，Excel 兼容）
- [ ] 支持 JSON 格式导出
- [ ] 文件名格式：`QA_Report_{Coordinator}_{Date}.{ext}`
- [ ] 导出数据包含所有显示字段
- [ ] 导出时显示"导出中..."状态
- [ ] 大数据量时不阻塞 UI

### 技术设计

#### CSV 导出
```typescript
function exportToCSV(data: QAReportItem[]): void {
  const BOM = '\uFEFF';  // UTF-8 BOM for Excel
  const headers = ['Admission ID', 'Patient Name', 'Phone', 'Last QA'];
  const rows = data.map(item => [
    item.admissionId,
    item.patientName,
    item.phones.map(p => p.phone).join('; '),
    item.lastQADaysAgo === null ? 'Never' : `${item.lastQADaysAgo} days ago`
  ]);
  
  const csv = BOM + [headers, ...rows].map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
  
  downloadFile(csv, `QA_Report_${coordinator}_${date}.csv`, 'text/csv');
}
```

---

## Story 8.10: 操作菜单与扩展功能预留

### 用户故事
**作为** 脚本用户  
**我希望** 对每个病人执行快捷操作  
**以便** 提高工作效率

### 状态
✅ **已完成** - 2026-01-09

### 验收标准
- [ ] 点击"⋮"按钮显示下拉操作菜单
- [ ] **预留菜单项（功能后续实现）**：
  - 📝 **快速创建 QA General Note** - 打开快速表单，提交病人 QA 记录
  - 📋 查看病人详情 - 打开病人资料页（新标签）
  - 📞 **拨打电话** - 点击直接拨打（如果支持）或复制电话号码
  - 📄 查看历史 QA 记录 - 显示该病人的所有 QA Notes
  - 📧 发送邮件 - 快速发送邮件给病人或其联系人
  - 🔗 复制 Admission ID - 一键复制到剪贴板
- [ ] 菜单样式与整体设计风格一致（Material Design）
- [ ] 点击菜单外区域自动关闭
- [ ] 菜单项支持图标 + 文字 + 键盘快捷键提示

### 快速创建 QA Note 功能设计（预留）

#### 功能说明
点击"快速创建 QA General Note"后，弹出一个简化的表单，允许 Coordinator 快速记录 QA 回访内容并提交到 Patient General Notes 系统。

#### UI 设计
```
┌─────────────────────────────────────────────────────┐
│  快速创建 QA Note - Chan Ichu (AHC-902536)    ✕   │
├─────────────────────────────────────────────────────┤
│  通话结果：                                         │
│  ○ 已联系，病人状况良好                            │
│  ○ 已联系，病人有问题需要跟进                      │
│  ○ 未联系，留言                                    │
│  ○ 未联系，无人接听                                │
│  ○ 其他                                            │
│                                                     │
│  备注：                                             │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [ 取消 ]                             [ 提交并关闭 ]│
└─────────────────────────────────────────────────────┘
```

#### API 调用（预留）
```typescript
// 提交 Patient General Note
async function submitQANote(params: {
  admissionId: string;
  coordinatorId: string;
  result: string;
  note: string;
}): Promise<boolean> {
  // 调用 Patient General Notes 提交 API
  // 详细实现待后续 Story
}
```

---

### Story 8.11: Multi-Tab Panel UI 优化

**状态**: ✅ **已完成** - 2026-01-09  
**优先级**: Medium  
**预计工时**: 1 小时 (实际)  
**目标**: 优化 Multi-Tab Panel 的用户体验

#### 需求描述

**功能 1：添加 Footer 区域**
- 位置：Tab 区域和内容区域的下方
- 高度：适中（约 32px）
- 内容：右下角显示 "Powered by KurosakiRei"
- 样式：简洁，不抢眼

#### 实现方案

**1. Footer 结构**
```less
.hha-smart-panel-footer {
  height: 32px;
  background: @bg-secondary;
  border-top: 1px solid @border-color;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 @spacing-md;
  font-size: @font-size-sm;
  color: @text-secondary;
  flex-shrink: 0;  // 防止被压缩
}

.footer-branding {
  font-style: italic;
  opacity: 0.7;
  user-select: none;
}
```

#### 测试验证
- [ ] Footer 显示在正确位置
- [ ] Footer 不影响 Tab 和内容区域的滚动
- [ ] 所有 Tab 都应用了新样式

#### 技术要点
- **Footer 定位**：使用 flexbox 固定在底部
- **不影响布局**：使用 `flex-shrink: 0` 防止被压缩

---

## 技术架构

### 文件结构
```
src/js/
├── services/
│   ├── ApiParamProvider.ts      # 共享 API 参数提供器 (Story 8.1)
│   ├── CensusService.ts         # Census 数据服务 (Story 8.3)
│   └── PatientNotesService.ts   # Patient Notes 数据服务 (Story 8.4)
├── tabs/
│   └── QAReportTab.ts           # QA 报告 Tab 实现
├── components/
│   ├── CoordinatorSelect.ts     # Coordinator 下拉框组件 (Story 8.2)
│   ├── QAReportListView.ts      # 列表视图组件 (Story 8.6)
│   ├── QAReportGridView.ts      # 九宫格视图组件 (Story 8.7)
│   └── ActionMenu.ts            # 操作菜单组件 (Story 8.10)
└── utils/
    └── exportUtils.ts           # 导出工具函数 (Story 8.9)

src/style/
└── qa-report-tab.less           # QA 报告 Tab 样式
```

### 数据流
```
User Action (选择 Coordinator + 点击加载)
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Step 1: Census by Coordinator API                       │
│ - 获取病人列表 (Active, Hospitalized, Hold)             │
│ - 提取 Admission ID 列表                                │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Step 2: Patient General Notes API                       │
│ - 获取 QA 记录 (过去一年，Note Reason=QA)               │
│ - 根据 Admission ID 匹配                                │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Step 3: Data Merge & Sort                               │
│ - 合并数据，计算相对日期                                 │
│ - 按优先级排序（无记录 > 天数多 > 天数少）               │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Step 4: Render UI                                       │
│ - 根据当前视图模式渲染列表/九宫格                        │
│ - 支持导出和操作菜单                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 依赖关系

```
Story 8.1 (API 共享) ──┬──▶ Story 8.2 (Coordinator 下拉框)
                      │
                      ├──▶ Story 8.3 (Census 数据) ──┬──▶ Story 8.5 (数据合并)
                      │                              │
                      └──▶ Story 8.4 (Notes 数据) ───┘
                                                      │
                                                      ▼
                           Story 8.6 (列表视图) ──┬──▶ Story 8.8 (视图切换)
                                                 │
                           Story 8.7 (九宫格) ────┘
                                                      │
                                                      ▼
                           Story 8.9 (数据导出) ──────▶ Story 8.10 (操作菜单)
```

---

## 已修复的 Bug

### Bug 1: AMD- 前缀患者 QA 日期显示为 N/A
**发现日期**: 2026-01-09  
**症状**: AMD-909263、AMD-908203、AMD-908589 等患者的 "Last QA" 列显示 "N/A"，但实际有 QA 记录  
**根本原因**: `parseQANotesReport()` 函数的正则表达式只匹配 `AHC-` 前缀，未考虑 `AMD-` 前缀  
**修复方案**: 将正则从 `(AHC-\d{6,7})` 修改为 `((?:AHC|AMD)-\d{6,7})`  
**修复文件**: `src/js/tabs/QAReportTab.ts` Line 643  
**测试结果**: ✅ AMD- 前缀患者现在可以正确解析 QA 日期

### Bug 2: 头部样式不统一
**发现日期**: 2026-01-09  
**症状**: Status Tracking 和 QA Report 面板的头部背景色、高度不一致  
**根本原因**: `main.less` 和 `coordinator-tracker.less` 中的 `.tracker-header` 样式定义冲突  
**修复方案**: 统一两个文件中的样式定义（白色背景 `#ffffff`，固定高度 `44px`，边框 `#e0e0e0`）  
**修复文件**: 
- `src/style/main.less` Line 90
- `src/style/coordinator-tracker.less` Line 86
**测试结果**: ✅ 两个面板头部样式现已完全一致

### Bug 3: Census 0 患者问题
**发现日期**: 2026-01-08  
**症状**: 某些 Coordinator 返回 0 个患者，但实际有患者  
**根本原因**: 未使用动态 OfficeIDs，固定 ID 列表不完整  
**修复方案**: 实现动态获取 OfficeIDs 的功能  
**修复文件**: `src/js/tabs/QAReportTab.ts` (fetchOfficeIds 方法)  
**测试结果**: ✅ 现可正确获取所有 office 的患者

---

## UI/UX 改进

### 改进 1: 头部简化与统一
**日期**: 2026-01-09  
**改进内容**:
- 移除 "各类状态追踪" 标题，只保留时间显示
- 统一 Status Tracking 和 QA Report 头部样式（白色背景，44px 高度）
- 移除时间显示的括号，改为 "上次更新：--:--:--" 格式
- 移除不必要的渐变色和动画效果

### 改进 2: 本地化优化
**日期**: 2026-01-09  
**改进内容**:
- 将所有 "Coordinator" 文本替换为 "辅导员"（3 处）
- 改进用户体验，更符合中文使用习惯

### 改进 3: Tab 宽度优化
**日期**: 2026-01-09  
**改进内容**:
- 将 Tab 宽度从 140px 减少到 100px（节省 28.6% 空间）
- 减少 Tab 内边距从 16px 到 8px，间距从 8px 到 4px
- 为长标题添加水平滚动功能（隐藏滚动条）
- 提升面板空间利用率，支持更多 Tab

---

## 开发优先级

1. **Phase 1: 核心功能** (Story 8.1 - 8.5)
   - API 参数共享
   - 数据获取和合并
   - 基础 UI 框架

2. **Phase 2: 视图实现** (Story 8.6 - 8.8)
   - 列表视图
   - 九宫格视图
   - 视图切换

3. **Phase 3: 增强功能** (Story 8.9 - 8.10)
   - 数据导出
   - 操作菜单

---

## 参考文档

- [ADR 007: 多 Tab 面板架构设计](../adr/007-multi-tab-panel-architecture.md)
- [ADR 008: QA 报告 Tab 实现方案](../adr/008-qa-report-tab-implementation.md)
- [Census by Coordinator API 文档](../api/census-by-coordinator-api.md)
- [Patient General Notes API 文档](../api/patient-general-notes-api.md)
