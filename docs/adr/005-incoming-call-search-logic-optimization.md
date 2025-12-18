# ADR-005: 来电搜索结果判断逻辑优化

**Status**: Implemented  
**Date**: 2025-12-17  
**Implementation Date**: 2025-12-17  
**Decision Maker**: John (PM) + KurosakiRei  
**Related Epic**: [Epic-5: 来电搜索功能优化与 Bug 修复](../stories/epic-5-incoming-call-search-optimization.md)

---

## Context

当前 `IncomingCallHandler.ts` 在处理来电搜索结果时存在多个问题：

### 发现的问题

1. **Active 状态过滤不完整**
   - 当前只处理 `resultCount === 1` 或 `resultCount === 2` 的情况
   - 3个及以上结果时，完全没有过滤 Active 的逻辑
   - 只过滤了 "Waiting" 状态，没有过滤 "Discharged" 和 "Hold"
   - 没有考虑 "Hospitalized" 状态（应视为 Active）

2. **多结果展示空白页 bug**
   - 使用 `displayCombinedResults` 或 `data URL` 弹出新窗口时，经常显示空白页
   - 网址显示 `about:blank`，用户无法看到搜索结果

3. **逻辑复杂且不通用**
   - Patient 和 Caregiver 的处理逻辑分散
   - 硬编码处理特定数量的结果（1个、2个）
   - 缺乏可扩展性（未来添加第三数据源困难）

### 用户需求

**核心原则**：
- **能定位单个 profile → 跳转到该 profile**
- **不能定位单个 profile → 展示完整原始 HTML 让用户判断**

**Status 优先级**：
- Active 状态（包括 `Active` 和 `Hospitalized`）优先级最高
- 非 Active 状态（`Discharged`、`Hold`、`Waiting`）优先级相同

---

## Decision

### 1. 简化判断逻辑为通用算法

**不再基于结果数量硬编码判断**，而是基于 **Active 状态数量**：

```typescript
// 通用判断逻辑（伪代码）
function processSearchResult(html: string): HhaSearchResult {
  const activeResults = extractActiveResults(html); // Active + Hospitalized
  const totalResults = extractAllResults(html);
  
  if (activeResults.length === 1) {
    // 唯一 Active，能定位单个 profile
    return { count: 1, finalUrl: activeResults[0].profileUrl, rawHtml: html };
  } else if (activeResults.length === 0 && totalResults.length === 1) {
    // 只有1个结果且为非 Active，仍能定位
    return { count: 1, finalUrl: totalResults[0].profileUrl, rawHtml: html };
  } else {
    // 其他情况：不能定位，展示完整原始 HTML
    return { count: totalResults.length, rawHtml: html };
  }
}
```

### 2. Status 分类标准

**Active 状态（优先级高）**：
- `Active`
- `Hospitalized` ← **由 Active 变化而来，视为 Active**

**非 Active 状态（优先级低）**：
- `Discharged`
- `Hold`
- `Waiting`

### 3. 不需要检查姓名是否相同

经过分析，**判断逻辑只需要看 Active 数量和总结果数**，不需要解析姓名字段：

| 场景示例 | Active数 | 总结果数 | 处理 | 需要检查姓名？ |
|---------|---------|---------|------|-------------|
| 2个同名，1 Active | 1 | 2 | 跳转 Active | ❌ 不需要 |
| 2个同名，都 Active | 2 | 2 | 展示HTML | ❌ 不需要 |
| 2个不同名，1 Active | 1 | 2 | 跳转 Active | ❌ 不需要 |
| 5个结果，3 Active | 3 | 5 | 展示HTML | ❌ 不需要 |

**原因**：
- 同名同姓只是用来解释为什么某些情况会出现多个结果
- 但处理方式完全由 Active 数量决定
- 减少代码复杂度，避免解析 DOM 中的姓名字段

### 4. 多结果展示策略

**始终使用完整原始 HTML**：
- ✅ 保留所有结果（包括非 Active），用户可以自行判断
- ✅ 保留原始的 profile 跳转链接，用户可直接点击
- ❌ 不在弹出页面中过滤结果（避免删除可能有用的信息）

**原因**：
- 显示 3个结果和显示 5个结果的开发成本相同
- 用户可能需要查看非 Active 的历史记录
- 简化代码逻辑，减少出错可能

### 5. Caregiver 源保持现有逻辑

```typescript
if (resultCount === 1) {
  return { count: 1, finalUrl: profileUrl, rawHtml: html };
} else {
  return { count: resultCount, rawHtml: html };
}
```

**原因**：
- Caregiver 基本不会出现多个结果（一个电话号码对应一个护理员）
- 不需要 Status 过滤（如果出现多结果，直接展示即可）
- 现有逻辑符合通用原则

---

## Consequences

### Positive

1. ✅ **逻辑简化**：从硬编码结果数量判断 → 基于 Active 状态数量判断
2. ✅ **可扩展性提升**：通用算法可直接应用到第三数据源（Emergency Contacts）
3. ✅ **Bug 修复**：解决 3+ 结果时的过滤缺失问题
4. ✅ **Status 覆盖完整**：支持 Hospitalized、Discharged、Hold、Waiting
5. ✅ **用户体验改善**：多结果时用户可看到完整信息
6. ✅ **代码可维护性**：减少特殊情况处理，统一判断流程

### Negative

1. ⚠️ **需要重构现有代码**：`handlePatientSearchResult` 函数需要重写
2. ⚠️ **测试覆盖需求增加**：需要测试更多 Status 组合情况
3. ⚠️ **空白页 bug 需要单独修复**：`displayCombinedResults` 的问题仍需调查

### Risks

1. **HHAExchange 页面结构变化**：如果搜索结果页面的 DOM 结构改变，选择器可能失效
   - *缓解*：使用更稳定的选择器（如 `id` 优先于 `class`）
   - *缓解*：添加错误处理和降级逻辑

2. **Status 文本变化**：如果 HHAExchange 修改 Status 的显示文本，过滤逻辑可能失效
   - *缓解*：使用 `includes()` 而非 `===` 进行文本匹配
   - *缓解*：添加日志记录未识别的 Status

---

## Implementation Plan

详见 [Epic-5: 来电搜索功能优化与 Bug 修复](../stories/epic-5-incoming-call-search-optimization.md)

### Phase 1: 核心逻辑重构
- Story 5.1: 重写 Patient 源 Active 过滤逻辑
- Story 5.2: 添加 Hospitalized 状态支持
- Story 5.3: 统一所有 Status 过滤（Discharged/Hold/Waiting）

### Phase 2: Bug 修复
- Story 5.4: 修复多结果展示空白页 bug

### Phase 3: 测试与优化
- Story 5.5: 代码重构与测试

---

## Alternatives Considered

### Alternative 1: 继续基于结果数量硬编码

```typescript
if (resultCount === 1) { /* ... */ }
else if (resultCount === 2) { /* ... */ }
else if (resultCount === 3) { /* ... */ }
// ...
```

**拒绝原因**：
- ❌ 不可扩展，每增加一种情况都要修改代码
- ❌ 代码冗长，难以维护
- ❌ 无法处理任意数量的结果

### Alternative 2: 在弹出页面中过滤掉非 Active 结果

**拒绝原因**：
- ❌ 用户可能需要查看非 Active 的历史信息
- ❌ 增加代码复杂度（需要重建 HTML 表格）
- ❌ 可能丢失原始链接或格式

### Alternative 3: 检查姓名是否相同来判断

**拒绝原因**：
- ❌ 增加代码复杂度（需要解析姓名字段）
- ❌ 姓名格式可能不一致（大小写、空格、特殊字符）
- ❌ 实际上不影响判断结果（Active 数量已经足够）

---

## References

- [Project Brief](../brief.md) - Phase 2 Features: 来电搜索增强
- [IncomingCallHandler.ts](../../src/js/IncomingCallHandler.ts) - 当前实现
- [Epic-5](../stories/epic-5-incoming-call-search-optimization.md) - 实施计划

---

*Document Version: 1.0*  
*Created: 2025-12-17*  
*Author: John (PM)*
