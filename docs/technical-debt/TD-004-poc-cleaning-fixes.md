---
id: TD-004
title: POC Cleaning 状态不同步与任务匹配不准问题
status: Fixed
created: 2026-03-17
fixed: 2026-03-17
severity: High
components:
  - CleanerTab.ts
  - CleaningController.ts
---

## 摘要

Prebilling Report / POC Cleaning（POC 自动清理功能）在自动执行过程中遇到了两个导致无响应和功能严重失效的独立问题。
1. **选择状态不同步（全选 Bug）：** 在定期轮询 Prebilling Report 表格数据时，任何发现的新行都会导致 UI 的完全重新渲染。由于 `selectedIndices` 在未保存用户选择指纹的情况下被完全清空，所有单独的列表勾选框都会变成 `未选中`，而独立的 `Select All` 全选框在视觉上仍然保持 `选中`。这导致点击“清理选定项”的任务循环因为实际上 0 个有效选中目标而执行失败。
2. **目标匹配不精准：** 在 `CleaningController.ts` 中，当遍历 DOM 行来精确定位目标并点击 "Edit" 按钮时，原来的匹配逻辑仅仅校验了 `Admission ID` 和 `Patient Name`。如果同一个病人有**多个**任务记录且这些记录仅凭日期和时间来区分（比如早班和晚班访问），脚本就会盲目地匹配到页面上出现的**绝对第一个**符合条件的行，导致执行了错误的访问记录的清理。

## 根本原因

这两个问题均源于对动态变化的 DOM 元素的状态保存机制不够健壮：
- `CleanerTab.ts` 在触发 DOM 替换/重新渲染前，没有主动缓存已勾选记录的“指纹特征”。
- `CleaningController.ts` 在解析表格寻找元素时，没有详尽地应用被选中任务对象（`Task`）上的所有可用特征参数。

## 修复方案

1. **保留选中记录的状态 (`CleanerTab.ts`)：** 
   - 在执行 `this.visitRecords = await PrebillingTableParser.parseTable();` 覆盖数据之前，脚本现在会把当前所有已选记录的指纹（使用 `admissionId`、`visitDate` 和 `scheduledTime` 组合）缓存到一个 `Set<string>` 中。
   - 在新数据获取完毕且 `selectedIndices` 被清空后，脚本会遍历**新**获取的 `visitRecords`，并通过比对缓存的指纹 Set 来重新恢复选中状态。
   - 重构了 DOM 事件绑定：把独立的匿名闭包提取到了 `setupDynamicCheckboxes()` 方法统一管理，配合一次性初始化标识旗标 `prebillingEventHandlersSet`，成功杜绝了重复绑定导致的状态混乱和性能 Bug。

2. **精准执行目标行探测 (`CleaningController.ts`)：**
   - 增强了提取器的映射输出（优化 `parseColumns` 结构）。
   - 扩充了 `executePOCClean` 的 DOM 搜寻机制，主动且精确地提取、处理并比对 `visitDate` 和 `scheduledTime`。
   - 当前逻辑下，只有满足严格的全要素匹配才会判断为找到目标行：`admissionId === task.admissionId && visitDate === task.visitDate && scheduledTime === task.scheduledTime`。

## 影响与消除的技术债务

- 消解了“游离”的 DOM 元素事件绑定，防止了在 HHAExchange 页面长会话生命周期内缓慢产生的内存泄漏。
- 确保执行点击交互具有严格的约束范围，避免了因误匹配而篡改其他来访排期造成的严重行政与账单计费后果。
- 使用标准的 `Set` 集合实现基于指纹的快速检索，保障了即便轮询非常频繁（例如每 1.5 秒），依然能保持极高的运行性能。
