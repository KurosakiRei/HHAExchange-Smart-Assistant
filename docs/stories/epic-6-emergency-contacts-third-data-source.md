# Epic 6: 添加第三数据源 - Patient Emergency Contacts

**Epic ID**: Epic-6  
**Status**: Planning  
**Priority**: Medium  
**Related ADR**: [ADR-006: Patient Emergency Contacts 数据源集成](../adr/006-emergency-contacts-integration.md)  
**Target File**: [IncomingCallHandler.ts](../../src/js/IncomingCallHandler.ts)  
**Dependencies**: Epic-5 (已完成)

---

## Epic Goal

在来电搜索功能中添加第三数据源 - **Patient Emergency Contacts（病人紧急联系人）**，当来电号码匹配到病人的紧急联系人电话时，能够快速定位到对应的 Patient Profile，提升 Coordinator 处理紧急来电的效率。

---

## Background

### 业务场景

在实际工作中，Coordinator 经常会接到来自病人紧急联系人（如家属、朋友）的电话，这些电话号码通常记录在 HHAExchange 的 **Emergency Contacts Report** 中。

**当前痛点**：
- 来电号码无法直接匹配到 Patient（因为电话号码属于家属，而非病人本人）
- 需要手动在 Emergency Contacts Report 中搜索，效率低下
- 紧急情况下无法快速定位到对应的病人信息

**解决方案**：
- 自动获取 Emergency Contacts Report 数据
- 构建 `phone → patient` 映射表
- 在来电搜索时同时查询这个映射表
- 如果匹配到，直接显示对应的 Patient Profile

---

## Data Source Analysis

### Emergency Contacts Report 页面

**URL**: `https://reports.hhaexchange.com/HHAReportsML/Reports/EmergencyContactsReportEnt.aspx`

**数据规模**（截至 2025-12-30）：
- 总病人数: **1,960**
- 有紧急联系电话的病人: **1,446** (73.8%)
- 唯一电话号码数: **1,664**
- Excel 文件大小: **384 KB**

**数据结构**：

| 列名 | 说明 | 示例 |
|------|------|------|
| Sr# | 序号 | 1 |
| Admission ID | 入院ID | AHC-901686 |
| Patient | 病人姓名 | Abakumova Mariya |
| Coordinator | 协调员信息 | Irina G. ext.122 igoncharova@alwaysny.net |
| Primary Contract | 主要合同 | CENTERS PLAN for a HEALTHY LIV |
| Status | 状态 | Active |
| Start Date | 开始日期 | 07/03/2017 |
| Contact1 | 紧急联系人1 | Olga<br/>Daughter<br/>Ph1: 718-934-2659<br/>Ph2: |
| Contact2 | 紧急联系人2 | （同上格式） |
| Contact3 | 紧急联系人3 | （同上格式） |

**Contact 字段格式**：
```
{Name}
(空行)
{Relation}
Ph1: {Phone1}
Ph2: {Phone2}
```

**关键发现**：
- ✅ 每个病人最多有 3 个紧急联系人
- ✅ 每个联系人最多有 2 个电话号码（Ph1, Ph2）
- ✅ 同一个电话号码可能对应多个病人（如共用家庭电话）
- ✅ 数据通过 Microsoft SSRS Report Viewer 提供 Excel 导出功能

---

## Technical Approach

详细技术实现请参考 [ADR-006: Patient Emergency Contacts 数据源集成](../adr/006-emergency-contacts-integration.md)

### 核心技术栈

- **SheetJS (xlsx)**: 解析 Excel 文件
- **GM_fetch**: Tampermonkey 跨域请求
- **Microsoft SSRS Report Viewer**: 报表查看器（提供 Excel 导出 API）

### 数据获取流程（概览）

```
1. 调用 PageMethods.BindData(XMLParams) 
   → 返回 GUID

2. fetch(Reports.aspx?UserDataXML={GUID}) 
   → 返回 HTML (含 ReportSession 和 ControlID)

3. fetch(ReportViewerWebControl.axd?...&Format=EXCELOPENXML) 
   → 返回 XLSX 文件

4. XLSX.read(buffer) 
   → 解析 Excel，构建 phone → patient 映射表
```

### 性能优化策略

由于 Emergency Contacts 数据相对稳定（不像实时来电记录），采用以下缓存策略：

- **缓存周期**: 1 小时
- **存储位置**: 内存中的 `Map` 对象
- **刷新触发**: 
  - 每小时自动刷新
  - 用户手动刷新（提供按钮）
  - 页面加载时检查缓存是否过期

---

## Success Criteria

### Functional Requirements

1. ⬜ **数据获取与解析**
   - 能够从 Emergency Contacts Report 获取完整数据
   - 能够解析 Excel 文件并提取电话号码
   - 能够构建 `phone → patient` 映射表

2. ⬜ **来电搜索集成**
   - 来电搜索时自动查询 Emergency Contacts 映射表
   - 如果匹配到，显示对应的 Patient 信息
   - 如果一个电话号码对应多个病人，显示所有匹配结果

3. ⬜ **多数据源结果展示**
   - 处理三数据源（Caregiver + Patient + Emergency Contacts）的组合结果
   - 优先级：Patient Direct Match > Emergency Contacts > Caregiver
   - 当 Emergency Contacts 和 Patient Direct Match 都匹配时，明确标注来源

4. ⬜ **缓存管理**
   - 初次加载时获取数据并缓存
   - 缓存过期后自动刷新
   - 提供手动刷新按钮

### Non-Functional Requirements

1. ⬜ **性能**
   - 数据获取不阻塞页面加载
   - 映射表查询时间 < 10ms
   - Excel 文件解析时间 < 1s

2. ⬜ **可靠性**
   - 数据获取失败时降级到只搜索前两个数据源
   - 缓存过期后重试机制
   - 错误日志记录

3. ⬜ **可维护性**
   - 复用 Epic-5 的通用过滤逻辑
   - 模块化设计，便于后续扩展
   - 完整的 TypeScript 类型定义

---

## Stories

### Story 6.1: Emergency Contacts 数据获取与解析

**As a** Developer  
**I want** 实现 Emergency Contacts 数据获取和解析功能  
**So that** 能够构建 phone → patient 映射表供来电搜索使用

#### Acceptance Criteria

1. ⬜ **依赖库加载**
   - 在 Tampermonkey 脚本头部添加 SheetJS CDN 引用
   - 确保 `XLSX` 对象全局可用

2. ⬜ **数据获取函数**
   - 实现 `fetchEmergencyContactsData()` 函数
   - 完整执行 4 步数据获取流程（详见 ADR-006）
   - 返回解析后的 Excel JSON 数据

3. ⬜ **电话号码解析**
   - 实现 `parsePhoneNumbers(contactStr: string): string[]` 函数
   - 正确提取 `Ph1:` 和 `Ph2:` 后的电话号码
   - 清理格式（去除 `-`, `()`, 空格）
   - 去重（同一联系人的 Ph1 和 Ph2 可能相同）

4. ⬜ **映射表构建**
   - 实现 `buildPhoneToPatientMap(excelData): Map<string, PatientInfo[]>` 函数
   - 遍历所有 Contact1, Contact2, Contact3 字段
   - 构建 `phone → [{ patientName, admissionId }]` 映射

5. ⬜ **错误处理**
   - 捕获网络请求失败
   - 捕获 Excel 解析失败
   - 返回有意义的错误信息

#### Technical Notes

```typescript
// TypeScript 类型定义
interface PatientEmergencyContact {
  patientName: string;
  admissionId: string;
  contactName?: string;
  contactRelation?: string;
}

type PhoneToPatientMap = Map<string, PatientEmergencyContact[]>;

// 函数签名
async function fetchEmergencyContactsData(): Promise<any>;
function parsePhoneNumbers(contactStr: string): string[];
function buildPhoneToPatientMap(excelData: any[][]): PhoneToPatientMap;
```

#### Testing Scenarios

| 测试场景 | 输入 | 期望输出 |
|---------|------|--------|
| 正常获取数据 | - | 返回包含 1960 行的 Excel 数据 |
| 解析单个电话 | "Ph1: 718-934-2659\nPh2:" | ["7189342659"] |
| 解析多个电话 | "Ph1: 718-934-2659\nPh2: 917-450-8756" | ["7189342659", "9174508756"] |
| 构建映射表 | 完整 Excel 数据 | Map 包含 1664 个电话号码 |
| 网络请求失败 | 模拟 404 | 返回错误信息并记录日志 |

---

### Story 6.2: 缓存机制实现

**As a** Developer  
**I want** 实现 Emergency Contacts 数据的缓存机制  
**So that** 不需要每次来电都重新获取数据，提升性能

#### Acceptance Criteria

1. ⬜ **缓存结构定义**
   - 定义 `EmergencyContactsCache` 接口
   - 包含字段：`data`, `timestamp`, `isValid`

2. ⬜ **缓存管理函数**
   - `getCachedData()`: 获取缓存数据
   - `setCacheData(data)`: 设置缓存数据
   - `isCacheValid()`: 检查缓存是否有效（1小时内）
   - `clearCache()`: 清空缓存

3. ⬜ **自动刷新机制**
   - 页面加载时检查缓存
   - 缓存无效时自动获取新数据
   - 缓存有效时直接使用，并在后台静默刷新

4. ⬜ **手动刷新**
   - 提供 `refreshEmergencyContacts()` 函数
   - 可由用户通过按钮触发
   - 刷新时显示 Loading 状态

#### Technical Notes

```typescript
interface EmergencyContactsCache {
  data: PhoneToPatientMap;
  timestamp: number;
  version: string; // 用于未来数据结构升级
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

let emergencyContactsCache: EmergencyContactsCache | null = null;

function isCacheValid(): boolean {
  if (!emergencyContactsCache) return false;
  const now = Date.now();
  return (now - emergencyContactsCache.timestamp) < CACHE_DURATION;
}
```

---

### Story 6.3: 来电搜索集成

**As a** Coordinator  
**I want** 来电时自动搜索病人的紧急联系人  
**So that** 我能快速识别来电者是哪个病人的家属或朋友

#### Acceptance Criteria

1. ⬜ **搜索函数实现**
   - 实现 `searchEmergencyContactsByPhone(phone: string): PatientEmergencyContact[]`
   - 在映射表中查询电话号码
   - 返回所有匹配的病人信息

2. ⬜ **并行搜索集成**
   - 在 `extractAndInitiateSearch()` 中添加第三个 Promise
   - 使用 `Promise.all([aide, patient, emergencyContacts])`
   - 不阻塞前两个数据源的搜索

3. ⬜ **结果优先级处理**
   - **Patient Direct Match** (病人本人电话): 最高优先级
   - **Emergency Contacts** (病人紧急联系人): 中等优先级
   - **Caregiver** (护理员): 最低优先级

4. ⬜ **结果展示**
   - 如果只有 Emergency Contacts 匹配，显示病人信息并标注"来自紧急联系人"
   - 如果 Patient 和 Emergency Contacts 都匹配，优先显示 Patient，但提示"此号码也是其他病人的紧急联系人"
   - 如果一个电话对应多个病人，显示所有病人列表

#### Technical Notes

```typescript
interface SearchResult {
  source: 'aide' | 'patient' | 'emergency-contact';
  count: number;
  finalUrl?: string;
  searchUrl?: string;
  rawHtml?: string;
  emergencyContactMatches?: PatientEmergencyContact[];
}

async function extractAndInitiateSearch(callInfoPanel: HTMLElement): Promise<boolean> {
  // ... 现有代码 ...
  
  const [aideResult, patientResult, emergencyResult] = await Promise.all([
    fetchHhaData("aide", formattedNumber),
    fetchHhaData("patient", formattedNumber),
    searchEmergencyContactsByPhone(formattedNumber),
  ]);
  
  // 根据结果优先级决定显示内容
  handleCombinedSearchResults(aideResult, patientResult, emergencyResult);
}
```

---

### Story 6.4: 多数据源结果展示优化

**As a** Coordinator  
**I want** 清晰地看到来电号码匹配到的所有数据源  
**So that** 我能准确判断来电者身份并决定处理方式

#### Acceptance Criteria

1. ⬜ **三源结果组合处理**
   - 实现 `handleCombinedSearchResults()` 函数
   - 处理 8 种组合情况（每个源有/无结果）

2. ⬜ **结果标注**
   - Emergency Contacts 匹配时显示：
     ```
     📞 紧急联系人来电
     来电者可能是以下病人的家属/朋友：
     - Abakumova Mariya (AHC-901686)
       联系人: Olga (Daughter)
     ```

3. ⬜ **多病人匹配**
   - 一个电话对应多个病人时，显示列表
   - 按 Patient Status 排序（Active > Hospitalized > Others）
   - 提供快速跳转到每个 Patient Profile 的链接

4. ⬜ **降级处理**
   - Emergency Contacts 数据获取失败时，仍然显示前两个数据源的结果
   - 显示警告信息："紧急联系人搜索暂时不可用"

#### UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  📞 来电搜索结果 - 718-934-2659                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Patient (紧急联系人匹配)                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  👤 Abakumova Mariya (AHC-901686)                      │  │
│  │     Status: Active                                     │  │
│  │     紧急联系人: Olga (Daughter)                          │  │
│  │     [📋 查看 Patient Profile]                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ❌ Caregiver - 未找到匹配                                    │
│  ❌ Patient Direct Match - 未找到匹配                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Story 6.5: 错误处理与日志

**As a** Developer  
**I want** 完善的错误处理和日志记录  
**So that** 在数据获取失败或异常情况下能快速定位问题

#### Acceptance Criteria

1. ⬜ **错误分类**
   - 网络错误（API 请求失败）
   - 解析错误（Excel 格式异常）
   - 缓存错误（存储失败）

2. ⬜ **日志记录**
   - 数据获取开始/完成时间
   - 映射表大小（电话号码数量）
   - 搜索命中率（每次搜索是否匹配到 Emergency Contacts）

3. ⬜ **降级策略**
   - Emergency Contacts 不可用时，不影响前两个数据源
   - 显示友好的错误提示
   - 提供重试按钮

4. ⬜ **性能监控**
   - 记录数据获取耗时
   - 记录映射表查询耗时
   - 超时预警（如果获取数据超过 5 秒）

---

## Out of Scope

以下内容**不在本 Epic 范围内**：

1. ❌ 获取 **Caregiver（护理员）** 的紧急联系人（未来可考虑）
2. ❌ 实时同步 Emergency Contacts 数据（仍使用缓存策略）
3. ❌ 编辑或修改 Emergency Contacts 数据
4. ❌ Emergency Contacts 数据的历史记录或变更追踪
5. ❌ 自动化测试框架（手动测试为主）

---

## Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| SSRS Report Viewer API 变更 | 高 | 添加版本检测和降级逻辑 |
| Excel 文件格式变化 | 中 | 使用灵活的列查找逻辑（按列名而非索引） |
| 缓存数据过期导致信息不准确 | 中 | 添加"数据更新时间"显示，允许手动刷新 |
| 大量病人导致映射表占用内存过多 | 低 | 当前 1960 条记录可接受，未来可考虑 IndexedDB |
| PageMethods.BindData 需要页面上下文 | 中 | 提供备用方案（iframe 或直接 API 调用） |

---

## Testing Strategy

### Unit Testing (Manual)

使用浏览器控制台手动测试：

```javascript
// 测试电话号码解析
console.log(parsePhoneNumbers("Ph1: 718-934-2659\nPh2: 917-450-8756"));
// 期望: ["7189342659", "9174508756"]

// 测试映射表查询
const matches = searchEmergencyContactsByPhone("7189342659");
console.log(matches);
// 期望: [{ patientName: "Abakumova Mariya", admissionId: "AHC-901686", ... }]

// 测试缓存
console.log(isCacheValid());
// 期望: true (在缓存有效期内)
```

### Integration Testing

在 HHAExchange 实际环境测试：

1. **数据获取测试**
   - 导航到 Emergency Contacts Report 页面
   - 执行数据获取流程
   - 验证返回的 Excel 文件大小和内容

2. **来电搜索测试**
   - 使用已知的紧急联系人电话号码
   - 验证能否正确匹配到对应病人
   - 验证多病人匹配时的显示

3. **缓存测试**
   - 首次加载后检查缓存
   - 等待 1 小时后验证缓存刷新
   - 手动刷新按钮功能测试

### Test Cases

| Test ID | 描述 | 输入 | 期望输出 |
|---------|------|------|--------|
| TC-6.1 | 数据获取成功 | - | 返回 1960 行数据 |
| TC-6.2 | 单病人匹配 | 718-934-2659 | 显示 Abakumova Mariya |
| TC-6.3 | 多病人匹配 | 718-484-5000 | 显示 4 个病人列表 |
| TC-6.4 | 缓存命中 | 第二次搜索 | 不重新获取数据 |
| TC-6.5 | 缓存过期 | 1 小时后 | 自动刷新数据 |
| TC-6.6 | 网络失败降级 | 模拟 API 失败 | 仍显示 Aide + Patient 结果 |
| TC-6.7 | 三源都匹配 | 特定号码 | 优先显示 Patient，标注 Emergency Contact |
| TC-6.8 | 只有 Emergency Contact 匹配 | 特定号码 | 显示紧急联系人信息 |

---

## Performance Benchmarks

### 目标性能指标

| 操作 | 目标时间 | 实际测量 | 状态 |
|------|---------|---------|------|
| 首次数据获取 | < 3s | - | ⬜ 待测试 |
| Excel 解析 | < 1s | - | ⬜ 待测试 |
| 映射表查询 | < 10ms | - | ⬜ 待测试 |
| 缓存命中查询 | < 1ms | - | ⬜ 待测试 |

---

## Implementation Timeline

| Story | 预计工作量 | 依赖 |
|-------|----------|------|
| Story 6.1 | 4 hours | Epic-5 |
| Story 6.2 | 2 hours | Story 6.1 |
| Story 6.3 | 3 hours | Story 6.1, 6.2 |
| Story 6.4 | 3 hours | Story 6.3 |
| Story 6.5 | 2 hours | All above |

**总计**：约 14 小时（2 个工作日）

---

## Definition of Done

- [ ] 所有 5 个 Stories 的 Acceptance Criteria 满足
- [ ] 代码已提交到 `dev` 分支
- [ ] 所有 Test Cases 通过（手动测试）
- [ ] 代码注释完整，逻辑清晰
- [ ] 错误处理和降级逻辑完善
- [ ] 性能指标符合预期
- [ ] 在 HHAExchange 实际环境测试通过
- [ ] README 或 Brief 文档已更新

---

## Next Steps

完成本 Epic 后，可考虑：

1. **Epic-7: Caregiver Emergency Contacts（护理员紧急联系人）**
   - 如果 HHAExchange 提供护理员紧急联系人报表
   - 复用本 Epic 的技术架构

2. **Epic-8: Emergency Contacts 数据的持久化存储**
   - 使用 IndexedDB 替代内存缓存
   - 支持更大数据量（10,000+ 记录）

3. **Epic-9: Emergency Contacts 数据的手动编辑**
   - 允许用户临时添加/修改紧急联系人电话
   - 本地存储，不影响 HHAExchange 原始数据

---

*Document Version: 1.0*  
*Created: 2025-12-30*  
*Author: John (PM)*
