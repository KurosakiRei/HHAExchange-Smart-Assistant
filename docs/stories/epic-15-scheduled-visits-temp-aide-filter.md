# Epic 15: Scheduled Visits With Temp Aide Coordinator Filter 悬停过滤功能

**状态**: 📝 **计划中**

## Epic 概述

在 `ScheduledVisitsWithtempAide.aspx` 报表页面中，新增与 `HomePage.ts` 类似的 Coordinator 悬停选择器。该功能允许用户在不离开当前工作区的情况下，快速通过悬浮面板过滤和单选 Coordinator，并自动填充报表的 "From Date" 和 "To Date"，从而显著提升日常报表查询效率。

## 业务价值

- **提升效率**：通过悬浮卡片一键呼出，支持打字过滤，告别长列表下拉框肉眼寻找的痛点。
- **日期自动化**：自动智能填写报表的查询日期范围（From Date 设为 Today，To Date 设为下一个工作日），免去重复手动输入的烦恼。
- **操作一致性**：将 HomePage 已验证有效的设计模式（如样式、交互、配置记忆）平移到该页面，提升整个系统的用户体验一致性。

## 当前 UI 与技术分析

### 数据源获取差异
- **HomePage**: 依赖 `fetchCoordinatorsFromAPI()` 调用 `GetAllCoordinators` 构建。
- **Scheduled Visits**: 页面 DOM 中已经存在加载好的 Coordinator `<select id="ctl00_ContentPlaceHolder1_uxddlCordinator">`，不需要额外 API 调用，可直接从 DOM `options` 中提取。大大简化了网络层，也排除了跨域或 Token 问题。

### 日期计算逻辑
- **"From Date"**：页面元素 `ctl00_ContentPlaceHolder1_uxDtFromDate`，应自动填入当天的日期（格式：MM/DD/YYYY）。
- **"To Date"**：页面元素 `ctl00_ContentPlaceHolder1_uxDtToDate`，应自动填入下一个工作日（跳过周六和周日）。例如：周五的下一个工作日是下周一。遇到特殊节假日由用户手动在原生界面上调整。

### UI 风格
- 保持 HomePage 悬浮按钮的样式。
- 引入 `HomePage.ts` 及相关样式文件或单独抽取共用机制，或者复刻一套专用的悬浮卡片 HTML + CSS，与原来 `HomePage` 保持视觉一致（`variables.less` 中已存在的设计模式）。

## Story 列表

| Story | 标题                                       | 优先级 | 工时预估 | 状态 |
| ----- | ------------------------------------------ | ------ | -------- | ---- |
| 15.1  | 报表页悬停按钮及 UI 卡片结构与样式构建     | High   | 2h       | [x]  |
| 15.2  | DOM 配置读取及 Coordinator 列表渲染器      | High   | 1.5h     | [x]  |
| 15.3  | 日期自动计算逻辑引入及表单填充             | High   | 1h       | [x]  |
| 15.4  | 用户设定缓存 (`GM_storage`) 与搜索触发联动 | High   | 1.5h     | [x]  |
| 15.5  | 面板交互细节及健壮性测试                   | Medium | 1h       | [x]  |

**总工时预估**: 7 小时

---

## Story 15.1: 报表页悬停按钮及 UI 卡片结构与样式构建

### 用户故事
**作为** 脚本用户  
**我希望** 在 Scheduled Visits 报表页面看到一个和 HomePage 一样的悬浮过滤按钮  
**以便** 随时呼出 Coordinator 列表

### 验收标准
- [x] 在原生的 `View Report` 按钮左侧紧凑显示悬浮搜索主按钮。
- [x] 悬停按钮上方弹出 Config Card（UI 一致：复用 `HomePage.ts` 面板结构、阴影和 `btn-primary` 等类）。
- [x] UI 符合原设计规范，300ms防抖进入动画，支持 ESC 和 Enter 键盘交互。
- [x] 此 UI 组件不破坏页面原有的 DOM，并配合 `setInterval` 防止 ASP.NET UpdatePanel 全局洗页导致组件消失。

---

## Story 15.2: DOM 配置读取及 Coordinator 列表渲染器

### 用户故事
**作为** 开发者  
**我希望** 悬停卡片中的数据列表由页面上原本的 Select 生成  
**以便** 重用现有数据而不需要进行后端请求

### 验收标准
- [x] 脚本定位到 `#ctl00_ContentPlaceHolder1_uxddlCordinator`。
- [x] 提取其所有的 `<option>`，作为渲染数据源。
- [x] 处理和过滤可能需要的冗余选项。
- [x] 支持在悬停面板的搜索框中根据 Coordinator Name 动态过滤隐藏列表项。

---

## Story 15.3: 日期自动计算逻辑引入及表单填充

### 用户故事
**作为** 脚本用户  
**我希望** "From Date" 为今天，"To Date" 为下一个工作日  
**以便** 每天不用重新选择日期范围

### 验收标准
- [x] 实现 `getNextBusinessDay(Date)` 方法（处理 Friday to Monday）。
- [x] 在点击主按钮执行查询时，自动设置 `#ctl00_ContentPlaceHolder1_uxDtFromDate` 的值为 `MM/DD/YYYY`（Today）。
- [x] 自动设置 `#ctl00_ContentPlaceHolder1_uxDtToDate` 的值为 `MM/DD/YYYY`（Next Business Day）。
- [x] 写入 DOM 后自动点击原生按钮进行报表生成。

---

## Story 15.4: 用户设定缓存 (`GM_storage`) 与搜索触发联动

### 用户故事
**作为** 脚本用户  
**我希望** 脚本能记住我最后选过的 Coordinator 并且在我点击搜索时自动执行系统原生的报表获取  
**以便** 每天固定执行时一键傻瓜操作

### 验收标准
- [x] 首选项存入 `GM_storage` 下特定键值（`hha_scheduled_visits_config`）。
- [x] 页面加载完成时恢复按钮名称文本 `Search: ${shortName}`。
- [x] **交互解耦**：点击面板内的“保存配置”**仅**保存至 Local Storage；想要触发报表，用户需点击外面的主按钮 `Search: XXX`。
- [x] 确保所有表单元素包含 `type="button"`，杜绝 ASP.NET 表单意外全页提交问题。

---

## Story 15.5: 面板交互细节及健壮性测试

### 用户故事
**作为** 开发者  
**我希望** 该模块独立且健壮  
**以便** 应对由于 HHA 系统 DOM 微小变动造成的问题

### 验收标准
- [x] 悬停防抖：增加 300ms `mouseenter` 防抖避免手滑唤起卡顿。
- [x] 后台驻守轮询：处理局部刷新后 DOM 重建导致的丢失，健壮修复 `URL匹配`。
- [x] 测试独立性，数据以独立字段挂载，不与主页污染。
