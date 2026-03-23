---
id: TD-004
title: POC Cleaning 状态不同步与任务匹配不准问题
status: "Fixed (v3 - 2026-03-23)"
created: 2026-03-17
fixed: 2026-03-23
severity: High
components:
  - CleanerTab.ts
  - CleaningController.ts
---

## 摘要

Prebilling Report / POC Cleaning（POC 自动清理功能）在自动执行过程中遇到了两个导致无响应和功能严重失效的独立问题：

1. **选择状态不同步（全选 Bug）：** Prebilling 页面每 5 秒轮询一次表格。由于并发保护缺失与非原子性状态清空，用户手动勾选的行在每轮重新分析后会被静默丢弃，视觉上全选框仍显示选中，实际提交时却无有效目标，导致清理任务无法启动。
2. **目标行跨日期误匹配（高危）：** 在执行清理时，`CleaningController.ts` 的回退路径仅以 `admissionId` 定位目标行，完全缺失 `visitDate` 约束，造成同一病人不同日期的访问记录被错误清理。在真实事故中，本应清理 3/15 的记录，结果操作了 3/14 的记录。

## 根本原因分析

### Bug 1：选择状态丢失（`CleanerTab.ts`）

**根本原因共三处：**

1. **`lastTableRowCount` 初始值为 `0`**：页面实际行数恒不为 0，因此首次 5 秒轮询必然触发一次多余的"行数变更"重新分析，将用户刚刚做出的选择完全抹除。

2. **无并发调用保护**：`analyzePrebillingTable()` 内部调用 `PrebillingTableParser.parseTable()`，后者使用 `requestIdleCallback`，异步窗口长达 1-3 秒。在此期间若定时器再次触发分析，两次执行会交叉操作同一 `selectedIndices`，导致状态损坏。

3. **`selectedIndices.clear()` 为非原子操作**：先 `clear()`、再逐条恢复的两步操作之间存在可观测的空窗期。若第二次并发调用在空窗期读取该 Set，将看到空集合，所有选中状态随之消失。

### Bug 2：目标行跨日期误匹配（`CleaningController.ts`）

**根本原因共两处：**

1. **行过滤阈值不一致**：`executePOCClean` 中过滤异常行的判断为 `cells.length < 10`，而 `parseTable()` 使用的是 `< 14`（表格共 14 列，列 13 为 ACTIONS）。阈值不一致导致表头/摘要行可能逃过过滤进入匹配流程。

2. **回退路径缺失 `visitDate` 约束**：原始回退逻辑为：
   ```typescript
   Array.from(rows).find(r => r.cells[1].textContent.includes(admissionId))
   ```
   该调用仅检查 `admissionId`，不含任何日期约束。对于同一病人的多条访问记录，DOM 中排在最前面的行会被无条件命中——即使其 `visitDate` 与任务完全不符。这在真实场景中导致了 3/14 的记录被误操作。

## 修复方案（v2）

### Bug 1 修复：`CleanerTab.ts`

1. **新增并发锁**：添加 `private _prebillingAnalyzing: boolean = false` 字段；函数入口检测到锁已占用时立即返回，确保同一时刻只有一个分析实例在运行。

2. **原子性状态替换**：废弃"先 `clear()` 再逐条恢复"的模式，改为构建完整的新 `Set<number>` 后一次性赋值：
   ```typescript
   const newSelectedIndices = new Set<number>();
   this.visitRecords.forEach((record, index) => { ... });
   this.selectedIndices = newSelectedIndices; // 原子赋值
   ```

3. **`finally` 块兜底更新**：无论分析是否成功，`finally` 块始终执行以下两步，保证状态一致：
   ```typescript
   } finally {
     this._prebillingAnalyzing = false;
     this.lastTableRowCount = PrebillingTableParser.getTotalRowCount();
   }
   ```
   `lastTableRowCount` 在真实行数处初始化，消除了首次必然触发的多余重分析。

4. **空记录保护**：在构建指纹时对 `visitRecords[i]` 添加 `null` 守卫，避免索引越界引发 TypeError。

### Bug 2 修复：`CleaningController.ts`

将原有的单一匹配路径升级为 **4 级递进式匹配**，从严到宽，每一级均内含 `visitDate` 约束：

| 匹配级别 | 匹配字段 | 说明 |
|---|---|---|
| Match-1（精确） | admissionId + patientName + visitDate + scheduledTime | 四字段全匹配 |
| Match-2（宽松） | admissionId + patientName + visitDate | 忽略时间格式差异时命中 |
| Match-3（最简） | admissionId + visitDate | 处理特殊字符导致 patientName 无法比对时命中 |
| Match-4（行号） | rowIndex + admissionId + visitDate 验证 + 深度扫描 | 以行号定位后进行双重验证 |

所有匹配路径均包含 `visitDate === task.visitDate` 判断，使跨日期误匹配在代码层面成为物理不可能。

同时将所有循环中的行过滤阈值统一修正为 `cells.length < 14`，与 `parseTable()` 保持一致。

## 现实影响与消除的风险

- **消除高危跨日期误操作**：3/14 vs 3/15 类型的账单误清理事故在当前代码下完全不可能复现。
- **解决状态丢失问题**：并发锁 + 原子替换确保高频轮询（5s 间隔）场景下选中状态始终可靠保留。
- **行过滤一致性**：阈值统一为 `< 14`，防止表头/摘要行污染匹配流程。

## 残留边缘情况（已知、低风险）

同一病人、同一日期、不同时间段存在两次访问，且 `scheduledTime` 在页面重载后格式发生变化时，Match-2 会取同日第一行。此问题与本次高危 Bug 性质不同（需两个条件同时满足），风险极低，后续可通过规范化时间格式字符串后再比对来彻底消除。

---

## Bug 3（v3 后续, 2026-03-23）：`_prebillingAnalyzing` 锁在 DOM 重建后未重置导致清理器永久停留在「正在分析表格」

### 现象

在 Prebilling Report Internal 页面打开面板（点击铃铛），POC 清理器始终显示「⏳ 正在分析表格...」，记录列表（`cleaner-records-container`）保持 `display: none`，即使表格数据已完整加载。手动点击 🔄 刷新按钮后恢复正常。

### 根本原因

这是 TD-004 Bug 1 修复的二阶问题——Bug 1 引入的 `_prebillingAnalyzing` 锁与 `onActivate()` 的 DOM 重建路径之间存在竞态：

1. `initializeDefaultTab()` 在页面初始化时渲染清理器 tab → 设置 `_prebillingAnalyzing = true` → 通过 `requestIdleCallback` 异步启动解析（此时 Prebilling AJAX 数据仍在加载）
2. 用户打开面板 → `switchTab()` 发现容器已有子元素，跳过 `tab.render()` → 调用 `onActivate()` → `renderContent()` 执行 **`this.container.innerHTML = ""`** 销毁全部 DOM
3. 旧的 DOM 被销毁，新的 spinner 被渲染 → `analyzePrebillingTable()` 再次被调用 → **`_prebillingAnalyzing` 仍为 `true`**（由步骤 1 设置），新调用直接返回
4. 步骤 1 的 `requestIdleCallback` 最终触发 → 解析完成 → 试图 `statusEl.style.display = "none"` → **`statusEl` 是已 detached 的旧元素**，新 spinner 不受影响 → `finally` 块将锁释放并更新 `lastTableRowCount`
5. 轮询检测到行数未变化 → 不触发重分析 → **清理器永久卡在 spinner 状态**

### 修复（v3）

在 `renderContent()` 清空容器前，主动重置 `_prebillingAnalyzing = false`：

```typescript
private renderContent(): void {
  if (!this.container) return;

  // 清空容器前，重置分析锁：旧 DOM 已被销毁，任何飞行中的分析 Promise
  // 持有的 statusEl/recordsContainer 引用将失效（detached），
  // 不能阻塞新一轮的分析调用。
  this._prebillingAnalyzing = false;

  // 清空容器
  this.container.innerHTML = "";
  ...
}
```

**根因路径**：`initializeDefaultTab()` → `_prebillingAnalyzing=true` → `onActivate()` → `renderContent()` → `innerHTML=""` 销毁 DOM → 新调用被旧锁阻塞 → 旧 Promise 操作 detached 元素 → 永久卡住

**修复 commit**：`b0db15f`（2026-03-23）
