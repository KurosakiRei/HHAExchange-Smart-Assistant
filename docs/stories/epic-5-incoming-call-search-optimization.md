# Epic 5: 来电搜索功能优化与 Bug 修复

**Epic ID**: Epic-5  
**Status**: Completed  
**Priority**: High  
**Related ADR**: [ADR-005: 来电搜索结果判断逻辑优化](../adr/005-incoming-call-search-logic-optimization.md)  
**Target File**: [IncomingCallHandler.ts](../../src/js/IncomingCallHandler.ts)

---

## Epic Goal

优化 `IncomingCallHandler.ts` 的搜索结果判断逻辑，修复 Active 状态过滤不完整和多结果展示空白页的 bug，提升代码可维护性和可扩展性，为后续添加第三数据源（Emergency Contacts）奠定基础。

---

## Background

### 当前问题

1. **Active 状态过滤逻辑缺陷**
   - 只处理 1个或2个结果的情况，3+ 结果时无过滤逻辑
   - 只过滤 "Waiting"，未覆盖 "Discharged"、"Hold"
   - 未支持 "Hospitalized" 状态（应视为 Active）

2. **多结果展示空白页 bug**
   - 使用 `displayCombinedResults` 或 `data URL` 时经常显示空白页
   - 影响用户体验，无法查看搜索结果

3. **代码可扩展性差**
   - 硬编码结果数量判断（1个、2个）
   - 逻辑分散，不利于后续添加第三数据源

### 用户场景示例

**场景 1**：来电号码 `929-685-6363`，搜索 Patient 源得到 3个结果
- 结果 1: LIN SHUYU, Status: Discharged
- 结果 2: LIN SHUYU, Status: Active
- 结果 3: PAN SHENGLI, Status: Active

**当前行为**：返回 `count: 3`，弹出空白页或显示所有3个结果  
**期望行为**：识别出 2个 Active，弹出完整原始 HTML（包含所有3个结果）供用户判断

**场景 2**：来电号码搜索得到 2个结果，都是 Active
**当前行为**：根据是否包含 "Waiting" 过滤，可能判断错误  
**期望行为**：识别出 2个 Active，弹出完整原始 HTML

---

## Success Criteria

### Functional Requirements

1. ✅ **正确处理任意数量的搜索结果**（1个、2个、3个及以上）
2. ✅ **完整支持所有 Status**：Active、Hospitalized、Discharged、Hold、Waiting
3. ✅ **唯一 Active 时自动跳转** profile 页
4. ✅ **多个 Active 或无法判断时展示完整原始 HTML**
5. ✅ **修复多结果展示空白页 bug**，用户能正常查看搜索结果
6. ✅ **保留原始 HTML 中的 profile 跳转链接**，用户可直接点击

### Non-Functional Requirements

1. ✅ **代码可维护性**：使用通用算法，减少硬编码
2. ✅ **可扩展性**：为添加第三数据源（Emergency Contacts）预留接口
3. ✅ **性能**：不影响现有搜索速度
4. ✅ **稳定性**：错误处理和降级逻辑完善

---

## Stories

### Story 5.1: 重写 Patient 源 Active 过滤逻辑

**As a** Coordinator  
**I want** 来电搜索能正确识别任意数量结果中的 Active 状态  
**So that** 我能快速定位到正确的 patient profile 或查看所有相关结果

#### Acceptance Criteria

1. ✅ **支持任意数量结果**：不再硬编码 `resultCount === 1 || === 2`
2. ✅ **正确提取 Active 结果**：
   - 识别 Status 列包含 "Active" 或 "Hospitalized" 的行
   - 统计 Active 结果数量
3. ✅ **判断逻辑**：
   - 1个 Active → 返回 `{ count: 1, finalUrl, rawHtml }`
   - 0个 Active 且总结果1个 → 返回 `{ count: 1, finalUrl, rawHtml }`
   - 其他情况 → 返回 `{ count: totalCount, rawHtml }`
4. ✅ **保持向后兼容**：现有功能不受影响

#### Technical Notes

```typescript
function handlePatientSearchResult(html: string): HhaSearchResult {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const resultsTable = doc.querySelector<HTMLTableElement>("#tdSearchResults");
  if (!resultsTable) return { count: 0, rawHtml: html };

  const resultRows = Array.from(resultsTable.querySelectorAll("tbody tr"));
  const totalCount = resultRows.length;

  // 过滤 Active 状态（包括 Hospitalized）
  const activeRows = resultRows.filter(row => {
    const statusText = row.textContent || "";
    return statusText.includes("Active") || statusText.includes("Hospitalized");
  });

  if (activeRows.length === 1) {
    // 唯一 Active，提取 profile URL
    const link = activeRows[0].querySelector<HTMLAnchorElement>(
      'a[onclick*="RedirectToPatientPage"]'
    );
    const match = link?.getAttribute("onclick")?.match(/RedirectToPatientPage\((\d+)/);
    if (match && match[1]) {
      return {
        count: 1,
        finalUrl: PATIENT_PROFILE_URL_TEMPLATE.replace("{ID}", match[1]),
        rawHtml: html,
      };
    }
  } else if (activeRows.length === 0 && totalCount === 1) {
    // 只有1个非 Active 结果
    const link = resultRows[0].querySelector<HTMLAnchorElement>(
      'a[onclick*="RedirectToPatientPage"]'
    );
    const match = link?.getAttribute("onclick")?.match(/RedirectToPatientPage\((\d+)/);
    if (match && match[1]) {
      return {
        count: 1,
        finalUrl: PATIENT_PROFILE_URL_TEMPLATE.replace("{ID}", match[1]),
        rawHtml: html,
      };
    }
  }

  // 其他情况：多个 Active 或无法判断
  return { count: totalCount, rawHtml: html };
}
```

#### Testing Scenarios

| 测试场景 | 结果数 | Active数 | 期望处理 |
|---------|--------|---------|--------|
| 单个 Active | 1 | 1 | 跳转 profile |
| 单个 Discharged | 1 | 0 | 跳转 profile |
| 2个结果，1 Active | 2 | 1 | 跳转 Active profile |
| 2个结果，都 Active | 2 | 2 | 展示完整 HTML |
| 3个结果，1 Active | 3 | 1 | 跳转 Active profile |
| 3个结果，2 Active | 3 | 2 | 展示完整 HTML |
| 5个结果，3 Active | 5 | 3 | 展示完整 HTML |
| 2个结果，都 Discharged | 2 | 0 | 展示完整 HTML |

---

### Story 5.2: 添加 Hospitalized 状态支持

**As a** Coordinator  
**I want** Hospitalized 状态的 patient 被视为 Active  
**So that** 我能定位到住院病人的 profile（因为 Hospitalized 是由 Active 变化而来）

#### Acceptance Criteria

1. ✅ Status 包含 "Hospitalized" 时，视为 Active
2. ✅ 测试场景：2个结果，1 Active + 1 Hospitalized → 展示完整 HTML（因为有2个 Active）
3. ✅ 测试场景：2个结果，1 Hospitalized + 1 Discharged → 跳转 Hospitalized profile

#### Technical Notes

在 Story 5.1 的代码中，过滤条件已包含：
```typescript
statusText.includes("Active") || statusText.includes("Hospitalized")
```

---

### Story 5.3: 统一所有 Status 过滤

**As a** Developer  
**I want** 完整支持所有 Patient Status  
**So that** 代码逻辑清晰，易于维护和扩展

#### Acceptance Criteria

1. ✅ **明确定义 Active 状态**：`Active`、`Hospitalized`
2. ✅ **明确定义非 Active 状态**：`Discharged`、`Hold`、`Waiting`
3. ✅ **删除当前代码中的 "Waiting" 硬编码**
4. ✅ **使用通用的 `isActiveStatus()` 函数**

#### Technical Notes

```typescript
function isActiveStatus(statusText: string): boolean {
  return statusText.includes("Active") || statusText.includes("Hospitalized");
}

const activeRows = resultRows.filter(row => 
  isActiveStatus(row.textContent || "")
);
```

**好处**：
- 未来新增 Status 时，只需修改 `isActiveStatus()` 函数
- 代码语义清晰，易于理解

---

### Story 5.4: 修复多结果展示空白页 bug

**As a** Coordinator  
**I want** 多结果弹出窗口能正常显示搜索结果  
**So that** 我能查看和选择正确的 patient 或 caregiver

#### Acceptance Criteria

1. ✅ 单源多结果：弹出窗口显示完整原始 HTML，不出现空白页
2. ✅ 双源都有结果：弹出窗口显示上下分栏，不出现空白页
3. ✅ 弹出窗口保留所有原始链接，用户可点击跳转
4. ✅ 测试各种结果数量组合（2个、3个、5个等）

#### Technical Investigation

**可能原因**：

1. **`displayCombinedResults` 中的 `srcdoc` 转义问题**
   ```typescript
   <iframe srcdoc="${aideResult.rawHtml.replace(/"/g, "&quot;")}"></iframe>
   ```
   - 如果 `rawHtml` 中包含复杂的 JavaScript 或 CSS，转义可能不完整
   - 建议使用 `encodeURIComponent()` 或 Base64 编码

2. **`data URL` 长度限制**
   ```typescript
   openInPopup(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
   ```
   - 某些浏览器对 data URL 有长度限制（2MB 左右）
   - 如果 HTML 过大，可能被截断

**修复方案**：

```typescript
// 方案 1：使用 Blob URL（推荐）
function openHtmlInPopup(html: string, windowName: string = "HHA_Search_Result"): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  const newWindow = window.open(blobUrl, windowName, "width=1200,height=900,resizable=yes");
  
  // 清理 Blob URL（窗口关闭后）
  if (newWindow) {
    newWindow.addEventListener("unload", () => URL.revokeObjectURL(blobUrl));
  }
}

// 方案 2：使用 Base64 编码
function openHtmlInPopup(html: string, windowName: string = "HHA_Search_Result"): void {
  const base64Html = btoa(unescape(encodeURIComponent(html)));
  openInPopup(`data:text/html;base64,${base64Html}`, windowName);
}
```

#### Testing Checklist

- [x] 单源多结果（Patient 3个）
- [x] 单源多结果（Patient 5个）
- [x] 双源都有结果（Caregiver 1个 + Patient 2个）
- [x] 双源都有结果（Caregiver 1个 + Patient 5个）
- [x] 验证弹出窗口中的链接可点击
- [ ] 验证不同浏览器（Chrome、Edge）- 待生产环境验证

---

### Story 5.5: 代码重构与测试

**As a** Developer  
**I want** 代码结构清晰、可维护、可扩展  
**So that** 未来添加第三数据源时能快速集成

#### Acceptance Criteria

1. ✅ **提取通用过滤函数**：`filterActiveResults()`
2. ✅ **提取通用判断函数**：`determineProfileAction()`
3. ✅ **添加 TypeScript 类型定义**：
   ```typescript
   type PatientStatus = 'Active' | 'Hospitalized' | 'Discharged' | 'Hold' | 'Waiting';
   type ActionType = 'JUMP_TO_PROFILE' | 'SHOW_MULTI_RESULTS';
   ```
4. ✅ **添加错误处理**：DOM 解析失败、选择器无效等
5. ✅ **添加日志记录**：记录搜索结果数量、Active 数量、最终处理方式
6. ✅ **更新代码注释**：说明判断逻辑和 Status 分类

#### Code Structure

```typescript
// --- 类型定义 ---
type PatientStatus = 'Active' | 'Hospitalized' | 'Discharged' | 'Hold' | 'Waiting';
type ActionType = 'JUMP_TO_PROFILE' | 'SHOW_MULTI_RESULTS';

interface ProcessedResult {
  action: ActionType;
  profileUrl?: string;
  totalCount: number;
  activeCount: number;
}

// --- 工具函数 ---
function isActiveStatus(statusText: string): boolean {
  return statusText.includes("Active") || statusText.includes("Hospitalized");
}

function extractProfileUrl(row: HTMLElement, urlTemplate: string): string | null {
  const link = row.querySelector<HTMLAnchorElement>('a[onclick*="RedirectTo"]');
  const match = link?.getAttribute("onclick")?.match(/\((\d+)/);
  return match && match[1] ? urlTemplate.replace("{ID}", match[1]) : null;
}

function filterActiveResults(rows: HTMLElement[]): HTMLElement[] {
  return rows.filter(row => isActiveStatus(row.textContent || ""));
}

function determineAction(activeRows: HTMLElement[], totalRows: HTMLElement[], urlTemplate: string): ProcessedResult {
  const activeCount = activeRows.length;
  const totalCount = totalRows.length;

  if (activeCount === 1) {
    const profileUrl = extractProfileUrl(activeRows[0], urlTemplate);
    return { action: 'JUMP_TO_PROFILE', profileUrl: profileUrl || undefined, totalCount, activeCount };
  } else if (activeCount === 0 && totalCount === 1) {
    const profileUrl = extractProfileUrl(totalRows[0], urlTemplate);
    return { action: 'JUMP_TO_PROFILE', profileUrl: profileUrl || undefined, totalCount, activeCount };
  } else {
    return { action: 'SHOW_MULTI_RESULTS', totalCount, activeCount };
  }
}

// --- 核心函数 ---
function handlePatientSearchResult(html: string): HhaSearchResult {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const resultsTable = doc.querySelector<HTMLTableElement>("#tdSearchResults");
  
  if (!resultsTable) {
    console.warn("[IncomingCallHandler] Patient search: No results table found");
    return { count: 0, rawHtml: html };
  }

  const totalRows = Array.from(resultsTable.querySelectorAll("tbody tr"));
  const activeRows = filterActiveResults(totalRows);
  const result = determineAction(activeRows, totalRows, PATIENT_PROFILE_URL_TEMPLATE);

  console.log(`[IncomingCallHandler] Patient search: ${result.totalCount} total, ${result.activeCount} active, action: ${result.action}`);

  if (result.action === 'JUMP_TO_PROFILE' && result.profileUrl) {
    return { count: 1, finalUrl: result.profileUrl, rawHtml: html };
  } else {
    return { count: result.totalCount, rawHtml: html };
  }
}
```

#### Benefits

- ✅ 代码模块化，每个函数职责单一
- ✅ 类型安全，减少运行时错误
- ✅ 易于测试（可单独测试 `filterActiveResults`、`determineAction`）
- ✅ 为第三数据源预留接口（可复用 `filterActiveResults`、`determineAction`）
- ✅ 日志完善，便于调试

---

## Out of Scope

以下内容**不在本 Epic 范围内**，将在后续 Epic 中处理：

1. ❌ 添加第三数据源（Emergency Contacts）
2. ❌ Emergency Contacts API 的数据获取实现
3. ❌ 多 Tab 数据同步优化
4. ❌ UI/UX 改进（如搜索结果的高亮显示）
5. ❌ 自动化测试框架搭建

---

## Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| HHAExchange 页面结构变化 | 高 | 使用稳定的选择器（`id` 优先），添加降级逻辑 |
| Status 文本变化 | 中 | 使用 `includes()` 匹配，添加日志记录未识别状态 |
| 空白页 bug 根本原因不明 | 高 | 尝试多种修复方案（Blob URL、Base64），逐一验证 |
| 测试环境限制（需要公司电话） | 低 | 本 Epic 功能可在 HHAExchange 直接测试，不依赖电话环境 |

---

## Testing Strategy

### Unit Testing (Manual)

由于是 Tampermonkey 脚本，使用浏览器控制台手动测试：

```javascript
// 测试 isActiveStatus
console.log(isActiveStatus("Active")); // true
console.log(isActiveStatus("Hospitalized")); // true
console.log(isActiveStatus("Discharged")); // false

// 测试 filterActiveResults
const mockRows = [
  { textContent: "Patient 1, Active" },
  { textContent: "Patient 2, Discharged" },
  { textContent: "Patient 3, Hospitalized" },
];
const activeRows = filterActiveResults(mockRows);
console.log(activeRows.length); // 2
```

### Integration Testing

在 HHAExchange 实际搜索页面测试：

1. 搜索已知电话号码（准备多个测试用例）
2. 验证弹出窗口或跳转行为
3. 检查浏览器控制台日志

### Test Cases

| Test ID | 描述 | 输入 | 期望输出 |
|---------|------|------|--------|
| TC-5.1 | 单个 Active | 1个 Active | 跳转 profile |
| TC-5.2 | 单个非 Active | 1个 Discharged | 跳转 profile |
| TC-5.3 | 2个结果，1 Active | 1 Active + 1 Discharged | 跳转 Active profile |
| TC-5.4 | 2个结果，都 Active | 2 Active | 弹出完整 HTML |
| TC-5.5 | 3个结果，1 Active | 1 Active + 2 Discharged | 跳转 Active profile |
| TC-5.6 | 3个结果，2 Active | 2 Active + 1 Discharged | 弹出完整 HTML |
| TC-5.7 | Hospitalized 视为 Active | 1 Hospitalized + 1 Discharged | 跳转 Hospitalized profile |
| TC-5.8 | 空白页 bug | 任意多结果 | 弹出窗口正常显示，无空白页 |

---

## Implementation Timeline

| Story | 预计工作量 | 依赖 |
|-------|----------|------|
| Story 5.1 | 2 hours | 无 |
| Story 5.2 | 0.5 hours | Story 5.1 |
| Story 5.3 | 1 hour | Story 5.1 |
| Story 5.4 | 2 hours | 无（独立调查） |
| Story 5.5 | 2 hours | Story 5.1, 5.2, 5.3, 5.4 |

**总计**：约 7.5 小时（1个工作日）

---

## Definition of Done

- [x] 所有 5个 Stories 的 Acceptance Criteria 满足
- [x] 代码已提交到 `dev` 分支
- [x] 所有 Test Cases 通过（手动测试）
- [x] 空白页 bug 已修复并验证
- [x] 代码注释完整，逻辑清晰
- [ ] 在 HHAExchange 实际环境测试通过 - 待生产环境验证
- [x] README 或 Brief 文档已更新（如有必要）

---

## Next Steps

完成本 Epic 后，下一步工作：

1. **Epic-6: 添加第三数据源（Emergency Contacts）**
   - 前提：Emergency Contacts API 数据获取已实现
   - 复用本 Epic 的通用过滤逻辑
   - 处理三源结果的组合展示

2. **Epic-X: 多 Tab 数据同步优化**
   - 使用 `localStorage` + `BroadcastChannel`
   - 减少重复 API 请求

---

*Document Version: 1.0*  
*Created: 2025-12-17*  
*Author: John (PM)*
