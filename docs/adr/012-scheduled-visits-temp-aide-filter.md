# ADR-012: Scheduled Visits With Temp Aide Coordinator Filter 实现方案

## 状态
Proposed (2026-03-08)

## 背景

在 HHAExchange 的 `ScheduledVisitsWithtempAide.aspx` 报表页面中，用户需要频繁按 Coordinator 筛选数据。目前页面默认提供了一个标准的下拉框，但如果列表中选项较多，用户每次手动点开下拉并寻找特定 Coordinator 效率低下。

为了提升工作效率，减少手动调整筛选器的繁琐操作，业务希望在该页面引入与 Home Page (`HomePage.ts`) 类似的悬停搜索按钮 (Coordinator Selector)。该按钮在悬停时会展示配置卡片，支持关键字过滤和快速单选 Coordinator。

另外，报表默认需要填写 "From Date" 和 "To Date"。
- **From Date**: 默认为当天日期。
- **To Date**: 默认为下一个工作日日期（即跳过周末，例如如果当天是周五，则 To Date 应为下周一）。对于美国法定节假日，目前暂不引入外部 API 判断，如果遇到特殊长假，由用户手动干预。

## 决策

1. **统一 UI 与交互组件**
   - 复用或仿照已在 `HomePage.ts` 中实现的 Coordinator 悬停按钮及搜索面板的 UI 样式与交互逻辑（DOM 结构及 CSS 样式完全保持一致）。
   
2. **本地 DOM 数据提取替代 API 请求**
   - **分析**：与 Home Page 不同，在 `ScheduledVisitsWithtempAide.aspx` 页面，全部的 Coordinator 选项已经存在于 ID 为 `ctl00_ContentPlaceHolder1_uxddlCordinator` 的 `select` 元素中。
   - **决策**：不调用后端 API 获取 Coordinator 列表，而是直接读取页面原生的 `select` option 内容进行组件的渲染。这样可以避免不必要的网络请求，且保证与当前页面权限和逻辑严格一致。

3. **存储机制**
   - 使用与 `HomePage.ts` 相同的 `GM_storage` 机制进行数据持久化，独立命名空间（例如 `hha_scheduled_visits_config`）以隔离 Home Page 的配置，或者如果业务需要两者统一，再考虑复用。根据需求，本次独立于该页面进行保存。

4. **日期自动计算逻辑**
   - 注入逻辑处理日期输入框：
     - `ctl00_ContentPlaceHolder1_uxDtFromDate` 设为 `Today`。
     - `ctl00_ContentPlaceHolder1_uxDtToDate` 设为 `Next Business Day`。计算逻辑：如果是周五，加 3 天；如果是周六，加 2 天；否则加 1 天。不依赖外部假日 API。
   - 触发按钮点击或配置保存时，将日期自动填入并触发原生的 `View Report` 操作。

## 影响 (Consequences)

### 正面影响
- **效率提升**：用户一键呼出悬停面板，快速搜索和固定常用 Coordinator。
- **避免多余网络请求**：直接利用页面现有 DOM 获取 Coordinator 数据，不仅提升脚本加载速度，还能规避 API 变更风险。
- **自动化日期填充**：减少用户每日重复填写工作日日期的繁琐。

### 负面影响 / 限制
- **节假日支持有限**：因为采用纯前端业务日计算（仅排除周末），若遇法定节假日，"To Date" 的自动计算可能包含放假日，此时需要用户手动在面板上进行更正。

## 备选方案 (Alternatives Considered)

- **调用公共节假日 API (如 Nager.Date)**：
  - **结果**：被否决。当前系统未集成类似 API，且引入外部网络请求会增加脚本复杂性及潜在的网络拦截风险。用户目前接受周末顺延模型，节假日小概率事件手动介入。
- **直接使用后端的 Coordinator API**：
  - **结果**：被否决。经调查，页面的原声 DOM 已包含全量列表（当前有 27 个），提取本地 DOM 是最高效和可靠的方式，避免跨域或 Token 问题。
