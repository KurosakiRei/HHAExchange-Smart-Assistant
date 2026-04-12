# ADR-015: 快速搜索 Tab — 聚合 Caregiver & Patient 搜索

## 状态
Accepted (2026-04-11)

## 背景

HHAExchange 原生搜索系统存在以下痛点：
1. Caregiver 和 Patient 使用两个独立页面搜索，每次需要切换；
2. 搜索页面包含大量下拉 filter，绝大多数情况下只需要姓、名、电话、ID 即可覆盖 90% 的场景；
3. 原生页面不支持同时查看两端搜索结果。

目标：在 Smart Assistant 悬浮面板中新增「快速搜索」Tab，提供轻量聚合搜索入口，结果以 Blob 弹窗形式展示。

---

## 决策

### D1：搜索入口 UI — 聚合输入，不区分 Caregiver / Patient；风格与现有 Tab 一致

**UI 风格约束**：`QuickSearchTab` 的所有界面元素（输入框、按钮、折叠区、提示文字、loading 动画）必须与悬浮面板其他 Tab（如 `MailBuilderTab`、`StatusTrackingTab`）保持一致，复用项目现有 CSS class（如 `hha-smart-config-card`、`hha-smart-config-card-body` 等），禁止引入与现有风格不符的自定义样式。


**选定**：搜索 Tab 内只显示统一的输入框组，不设"选择搜索哪一端"的开关。

普通搜索字段：
| 标签 | 字段 | 两端映射 |
|---|---|---|
| 姓 | LastName | 两端均有 |
| 名 | FirstName | 两端均有 |
| 电话 | Phone | Caregiver `Phone`；Patient `HomePhone` |
| ID | id | Caregiver `CaregiverCode`；Patient `MRNumber`（Admission ID） |

高级搜索（折叠区）— Caregiver 独占：
| 标签 | 字段 |
|---|---|
| SSN | `SSN` |

高级搜索（折叠区）— Patient 独占：
| 标签 | 字段 |
|---|---|
| 病人 ID | `PatientID` |
| Medicaid ID | `MedicaidID` |

每个输入框内置 ✕ 清除按钮，底部提供「清空所有」按钮（含高级搜索字段）。

### D2：搜索路由逻辑 — 独占字段决定单/双端

| 高级搜索填入情况 | 触发行为 |
|---|---|
| 未填任何独占字段 | 双端并行搜索 |
| 仅填 Caregiver 独占字段（SSN） | 仅搜索 Caregiver |
| 仅填 Patient 独占字段（病人ID / MedicaidID） | 仅搜索 Patient |
| 两端独占字段均有填入 | 立即在 Tab 内显示错误提示，禁用搜索按钮 |

ID 字段（普通区）：若无独占字段限定，双端都用此 ID 搜索（Caregiver Code / MR Number 各自）。

### D3：全量结果获取 — 多页并行抓取，无上限

**选定**：先获取第 1 页，从 `h2` 解析总结果数，推算总页数（每页 10 条）→ 并行请求所有后续页面 → 在内存中合并全部 `<tbody>` 行。

- 不设结果上限，搜索期间在 Tab 内显示 CSS loading 动画；
- 搜索完成后不自动清空输入框，除非用户主动点击「清空所有」按钮。

### D4：结果展示 — 始终显示列表，弹窗内客户端分页

**选定**：结果永远以列表形式展示，不做自动跳转到单个 Profile（与 `IncomingCallHandler` 的电话搜索逻辑不同）；

弹窗类型：
- 双端均有结果 → Combined View（上下 50/50，各侧独立分页）
- 仅一端有结果 → Single View（全高单面板）
- 两端均无结果 → 在 Tab 内显示提示，不弹窗

弹窗内客户端分页规格：
| 视图 | 每页行数 |
|---|---|
| Combined（双端）| 每侧 15 行 |
| Single（单端） | 20 行 |

弹窗复用现有 `openInPopup()` 的 Blob URL 方案。

### D5：状态 Badge — Patient 与 Caregiver 双端，三档柔和颜色

在结果列表中为 Status 列添加彩色 badge，两端均实现，通过注入 CSS + DOM 后处理实现。

**Patient 状态**（页面已知值：Waiting / Active / Hospitalized / Discharged / Hold，及未来可能新增的未知状态）：

| 状态 | Badge 颜色 |
|---|---|
| Active / Hospitalized | 淡绿色 `#d1fae5` 文字 `#065f46` |
| Discharged | 淡灰色 `#f3f4f6` 文字 `#6b7280` |
| 其余所有状态（Waiting / Hold / 未知） | 淡黄色 `#fef9c3` 文字 `#854d0e` |

**Caregiver 状态**（页面已知值：Active / Inactive / Hold / On Leave / Terminated，及未来可能新增的未知状态）：

| 状态 | Badge 颜色 |
|---|---|
| Active | 淡绿色 `#d1fae5` 文字 `#065f46` |
| Terminated | 淡灰色 `#f3f4f6` 文字 `#6b7280` |
| 其余所有状态（Inactive / Hold / On Leave / 未知） | 淡黄色 `#fef9c3` 文字 `#854d0e` |

**匹配策略**：优先精确匹配已知状态，未匹配到任何已知绿色/灰色规则的文本一律归入淡黄色，保证对未来新增状态的容错性。

### D6：共享搜索核心 — 提取 HhaSearchService.ts

**选定**：将 `IncomingCallHandler.ts` 中的搜索核心逻辑提取到 `src/js/services/HhaSearchService.ts`，供 `IncomingCallHandler` 和新的 `QuickSearchTab` 共同 import。

提取的函数：
- `detectTenantBaseUrl()`、URL 常量
- `fetchHhaData()`（扩展为支持多字段、多页）
- `handleAideSearchResult()`、`handlePatientSearchResult()`
- `displayCombinedResults()`、`displaySingleResult()`
- `openInPopup()`、`formatPhoneNumber()`
- `extractAndCleanContent()`（内部从 `displayCombinedResults` 提取为独立函数）

`IncomingCallHandler.ts` 重构后 import 上述函数，保留电话搜索特有的逻辑（自动跳转、高亮电话号码）。

新增的 `HhaQuickSearchParams` 接口：
```typescript
interface HhaQuickSearchParams {
  lastName?: string;
  firstName?: string;
  phone?: string;
  id?: string;          // Caregiver → CaregiverCode; Patient → MRNumber
  // Caregiver 独占
  ssn?: string;
  // Patient 独占
  patientId?: string;   // PatientID 字段
  medicaidId?: string;
}
```

---

## 后果

### 正面影响
- 消除 Caregiver / Patient 搜索来回切页的操作负担
- 结果全量加载后在弹窗内分页，体验一致
- `HhaSearchService` 消除代码重复，后续维护成本降低

### 负面影响 / 风险
- 全量获取（无上限）：搜索过于宽泛（如只输入单字）时请求数量多，等待时间长 → 缓解：Loading 动画给出反馈，用户可通过缩小条件主动控制
- `IncomingCallHandler.ts` 需重构（提取到 service），引入回归风险 → 缓解：现有逻辑100%保留，仅移动文件位置并 re-export

---

## 相关文件
- `src/js/services/HhaSearchService.ts`（新建）
- `src/js/IncomingCallHandler.ts`（重构，import from HhaSearchService）
- `src/js/tabs/QuickSearchTab.ts`（新建）
- `docs/stories/epic-18-quick-search-tab.md`
