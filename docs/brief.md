# Project Brief: HHAExchange Smart Assistant

## Executive Summary

**HHAExchange Smart Assistant** 是一个基于 Tampermonkey 的用户脚本（UserScript），旨在大幅提高家庭护理协调员（Coordinator）在 HHAExchange 平台上的工作效率。通过自动化表单填写、智能电话号码识别、来电监控与自动搜索、以及实时 Visit 状态追踪等功能，将原本需要大量手动操作的重复性工作简化为一键完成。

**主要价值**:
- 减少 80%+ 的重复性表单填写时间
- 实时监控护理员打卡状态，快速响应异常情况
- 来电自动识别，秒级获取来电人信息
- 跨平台（HHAExchange + VoiceTech）统一工作体验

---

## Problem Statement

### 当前痛点

1. **重复性表单填写耗时**
   - Missed Call 处理需要手动填写多个字段（原因、备注、时间等）
   - POC (Plan of Care) 处理需要逐一勾选多个任务项
   - 每次操作耗时 2-5 分钟，每日处理数十次

2. **来电识别效率低下**
   - 接听来电后需要手动复制号码到 HHAExchange 搜索
   - 需要在多个搜索页面（病人、护理员）分别查询
   - 影响通话质量和响应速度

3. **Visit 状态监控困难**
   - 需要频繁刷新多个报表页面查看护理员打卡状态
   - 多个 Coordinator 的监控数据分散，难以一目了然
   - 无法及时发现异常情况（未打卡、异常打卡）

4. **工作流程碎片化**
   - HHAExchange 和 VoiceTech 电话系统分离
   - 需要在多个页面间频繁切换
   - 缺乏统一的工作界面

---

## Proposed Solution

构建一个功能丰富的 Tampermonkey 用户脚本，深度集成 HHAExchange 和 VoiceTech 平台：

### 核心功能模块

1. **一键表单填写系统** - 自动填充标准化内容
2. **智能电话交互系统** - 高亮电话号码，一键拨号/发短信
3. **来电智能识别系统** - WebSocket 监控来电，自动搜索来电人
4. **Visit Monitor 监控面板** - 悬浮式状态追踪，支持多 Coordinator

### 技术优势

- 基于 Vue3 + Webpack 的现代化开发架构
- TypeScript 保证代码质量
- GM_fetch 实现跨域 API 调用
- 模块化设计，易于扩展

---

## Target Users

### Primary User Segment: 家庭护理协调员 (Coordinator)

**角色描述**:
- 负责安排护理人员（Aide/Caregiver）到老人家中工作
- 协调老人（Patient）和护理员之间的问题
- 处理护理员打卡异常、任务变更等日常事务
- 接听来自病人和护理员的电话咨询

**工作环境**:
- 日常使用 HHAExchange 平台管理 Visit 和人员信息
- 使用 VoiceTech (mt3.1voicetech.com) 接听工作电话
- 同时打开多个浏览器 Tab 处理不同任务
- 高频次的页面刷新和切换

**痛点**:
- 重复性表单填写消耗大量时间
- 来电时需要快速识别来电人身份
- 需要实时监控多个护理员的打卡状态
- 多 Tab 操作导致数据不同步

---

## Goals & Success Metrics

### Business Objectives

- 减少单次 Visit 处理时间 50%+
- 降低来电响应识别时间至 5 秒内
- 实现 Missed Call 状态的实时监控（2分钟刷新间隔）
- 提供跨 Tab 数据同步能力，减少 90% 的重复 API 请求

### User Success Metrics

- 用户每日节省操作时间 1-2 小时
- Visit Monitor 数据准确率 99%+
- 来电识别准确率 95%+（基于已有数据源）
- 脚本稳定运行，无明显卡顿或错误

### Key Performance Indicators (KPIs)

- **操作效率**: 单次 Missed Call 处理时间 < 30 秒
- **数据新鲜度**: Visit Monitor 数据延迟 < 5 分钟
- **API 效率**: 多 Tab 场景下 API 调用减少 80%+
- **稳定性**: 脚本无报错运行时间 > 99%

---

## MVP Scope

### Core Features (Must Have)

#### 1. Visit 信息快速填写
- **Missed In** - 一键填写护理员未打上班钟的处理记录
- **Missed Out** - 一键填写护理员未打下班钟的处理记录
- **Missed In & Out** - 一键填写护理员未打上下班钟的处理记录
- **POC (Plan of Care)** - 一键处理任务不符合护理计划的情况

#### 2. 病人 Profile 快速操作
- **New QA** - 快速创建质量保证通话记录
- **New Welcome Call** - 快速创建欢迎电话记录
- **Copy Attachment To Description** - 复制附件到描述

#### 3. Filter 快速选择
- **Home Page Selector** - 首页快速筛选（协调员、通讯类型、状态）
- **Prebilling Selector** - Prebilling 页面快速筛选

#### 4. 电话号码交互 (Highlight2Call)
- 高亮页面上的电话号码
- 点击后弹窗显示"打电话"和"发短信"选项
- 连接电脑电话快速操作

#### 5. 来电监控与搜索 (IncomingCallHandler)
- 监控 `mt3.1voicetech.com` WebSocket 来电
- 自动在 HHAExchange 搜索来电号码
- 病人搜索 + 护理员搜索双数据源

#### 6. Visit Monitor 悬浮监控面板
- 悬浮图标点击展开列表
- 监控 Missed-In（未打上班钟）
- 监控 Missed-Out（未打下班钟）
- 异常打钟监控
- 支持多 Coordinator 追踪
- 可拖拽定位

### Out of Scope for MVP

- 完整的消息监控功能
- 第三个来电搜索数据源
- 多 Tab 数据同步（使用 BroadcastChannel/SharedWorker）
- Vue3 重构的 Visit Monitor UI
- Chrome MCP Server 测试集成
- 自动化测试框架

### MVP Success Criteria

- 所有核心功能可在 HHAExchange 和 VoiceTech 页面正常运行
- Visit Monitor 可正确获取并显示监控数据
- 来电可被正确识别并在弹窗显示搜索结果
- 一键填写功能正确填充所有必要字段

---

## Post-MVP Vision

### Phase 2 Features

1. **多 Tab 数据同步优化 (方案 D: 组合方案)**
   
   **选型决策**: 经过方案对比，选择 `localStorage` + `BroadcastChannel` 组合方案，原因如下：
   - SharedWorker 在 Tampermonkey UserScript 环境下可行性存疑（Worker 文件托管、GM_fetch 在 Worker 内不可用）
   - 组合方案实现复杂度适中，技术风险低
   - 对于 2 分钟刷新间隔的场景，效果足够好
   
   **实现架构**:
   ```
   ┌─────────────────────────────────────────────────────┐
   │ 数据层: localStorage                                │
   │   Key: 'hha_visit_monitor_cache'                   │
   │   Value: { data, timestamp, sourceTabId }          │
   └─────────────────────────────────────────────────────┘
   ┌─────────────────────────────────────────────────────┐
   │ 通信层: BroadcastChannel                            │
   │   Channel: 'hha-visit-monitor-sync'                │
   │   消息类型: DATA_UPDATED | REQUEST_DATA | TAB_OPENED│
   └─────────────────────────────────────────────────────┘
   ┌─────────────────────────────────────────────────────┐
   │ 请求决策逻辑                                        │
   │   • 缓存存在且 < 30秒 → 直接使用缓存                │
   │   • 缓存存在且 < 2分钟 → 使用缓存，加入下次刷新队列  │
   │   • 其他情况 → 发起新请求                           │
   └─────────────────────────────────────────────────────┘
   ```
   
   **核心逻辑**:
   - 使用 `localStorage` 存储数据 + 时间戳 + 来源 Tab ID
   - 使用 `BroadcastChannel` 通知其他 Tab 数据已更新
   - 新 Tab 打开时检查缓存有效性，有效则不请求
   - 设置合理的缓存有效期（30秒内直接用，2分钟内可用但需刷新）

2. **Visit Monitor 增强** ✅ (部分已实现)
   - ✅ **UI/UX 优化** (v3.2.0 已完成)
     - 列表标题国际化：将 "Coordinator (Ext.)" 改为 "辅导员 (Ext.)"
     - Authorization Note 智能解析：将 HTML 表格内容解析为可读的格式化表格
     - 拖拽调整大小优化：修复拖拽手柄响应问题，增加视窗最大限制
     - 详见：[ADR-002: Visit Monitor UI增强](./adr/002-visit-monitor-ui-enhancements.md)
   - 面板标题显示上次数据更新时间（显示数据获取时间，判断是否过期）
   - **"消息"监控功能**
     - 监控协调员（Coordinator）的消息页是否有新消息
     - 与 Missed-In/Missed-Out/异常打钟 相同的显示逻辑
     - 显示消息数量，可点击查看详情列表
     - 技术挑战：API 调用逻辑分析困难（之前尝试失败，暂时搁置）
   - Vue3 重构 UI，提升视觉体验
   - 支持自定义刷新间隔

3. **来电搜索增强**
   - 添加第三个搜索数据源：**Emergency Contacts Report**
     - API: `https://reports.hhaexchange.com/HHAReportsML/Reports/EmergencyContactsReportEnt.aspx`
     - 需要处理：动态 token (s参数)、翻页逻辑
     - 数据特点：病人的紧急联系人电话（非病人/护理员直属电话）
     - 一个病人可能有多个紧急联系人
     - 需要在搜索结果中区分标记：紧急联系人电话 vs 直属电话
   - 修复多结果显示 bug
   - 优化搜索结果展示界面

4. **代码质量优化**
   - 减少代码冗余
   - 修复所有 TypeScript 类型错误
   - 统一代码风格和命名规范
   - 提取公共工具函数

### Long-term Vision

- 支持更多 HHAExchange 页面的自动化操作
- 构建完整的测试框架（单元测试 + E2E）
- 添加用户配置面板（自定义快捷填写内容）
- **发布供其他 Coordinator 使用**
  - 大部分功能已通用化
  - 需要将硬编码配置（如 Coordinator ID、Office ID 等）改为可配置
  - 考虑发布到 GreasyFork
- 探索 Chrome Extension 形态（更强的权限和能力）

### Expansion Opportunities

- 支持其他类似的护理管理平台
- 开发配套的数据分析工具
- 移动端适配或配套 App

---

## Technical Considerations

### Platform Requirements

- **Target Platforms**: Chrome 浏览器 (Tampermonkey 插件)
- **Browser Support**: Chrome 最新版本（主要）, 其他 Chromium 内核浏览器
- **HHAExchange 环境**: ENT2507010000 (当前配置)
- **VoiceTech 环境**: mt3.1voicetech.com

### Technology Stack (Current)

- **开发框架**: Webpack 5 + Vue3
- **编程语言**: TypeScript
- **样式处理**: LESS/SASS
- **API 请求**: GM_fetch (@trim21/gm-fetch)
- **用户脚本**: Tampermonkey (GreaseMonkey 兼容)
- **包管理**: npm

### Architecture Considerations

- **Repository Structure**: 单仓库，src 目录按功能模块划分
- **模块化**: 每个功能独立 TypeScript 文件
- **样式管理**: LESS 文件与功能模块对应
- **构建输出**: 
  - `dist/index.dev.user.js` (开发调试)
  - `dist/index.prod.user.js` (生产部署)

### Integration Requirements

- **HHAExchange API**: 通过解析页面获取动态参数（userID, appSecret, viewState 等）
- **VoiceTech WebSocket**: 监听来电事件
- **浏览器 API**: 
  - `localStorage` - 数据持久化存储和跨 Tab 数据共享
  - `BroadcastChannel` - Tab 间实时通信（数据更新通知）

---

## Constraints & Assumptions

### Constraints

- **API 限流**: HHAExchange 有 API 调用频率限制，需合理控制请求频率
- **跨域限制**: 需要通过 GM_fetch 绑定跨域请求
- **环境依赖**: 必须在 Tampermonkey 环境下运行
- **页面依赖**: 依赖 HHAExchange 页面 DOM 结构，页面更新可能导致脚本失效

### Key Assumptions

- HHAExchange 的页面结构和 API 接口保持相对稳定
- 用户使用的是 Chrome 浏览器最新版本
- 用户已正确安装并配置 Tampermonkey 插件
- 用户有权访问相应的 HHAExchange 功能模块
- VoiceTech WebSocket 连接稳定可用

---

## Risks & Open Questions

### Key Risks

- **HHAExchange 页面更新风险**: 页面结构或 API 变化可能导致脚本功能失效
  - *影响*: 高 - 核心功能可能完全不可用
  - *缓解*: 模块化设计，便于快速定位和修复

- **API 限流风险**: 多 Tab 场景下可能触发 HHAExchange API 限流
  - *影响*: 中 - 可能导致数据获取失败
  - *缓解*: 实现跨 Tab 数据同步，减少重复请求

- **浏览器兼容性风险**: 不同浏览器或 Tampermonkey 版本可能有兼容问题
  - *影响*: 低 - 主要针对 Chrome 开发
  - *缓解*: 优先保证 Chrome + Tampermonkey 环境

### Resolved Questions

1. **第三个来电搜索数据源** ✅
   - API: Emergency Contacts Report (`reports.hhaexchange.com`)
   - 用途: 搜索病人紧急联系人电话
   - 技术挑战: 动态 token、翻页逻辑、区分电话类型

2. **"消息"监控功能需求** ✅
   - 监控协调员消息页的新消息
   - 显示逻辑与 Missed-In/Out 相同
   - 当前阻塞: API 调用逻辑分析失败

3. **用户自定义快捷填写** ✅
   - 暂时不需要

4. **发布给其他 Coordinator** ✅
   - 有计划，但不是当前优先事项
   - 大部分功能通用，只需少量调整（如硬编码的 Coordinator 信息）

### Remaining Open Questions

- Emergency Contacts Report API 的具体翻页逻辑如何处理？
- 消息页 API 的正确调用方式是什么？需要哪些参数？
- 发布给其他用户时，哪些硬编码配置需要改为可配置项？

### Areas Needing Further Research

- HHAExchange API 的具体限流规则（每分钟/每小时限制）
- Vue3 组件化重构 Visit Monitor 的最佳实践
- Chrome MCP Server 集成的可行性和价值
- BroadcastChannel 在不同 Chrome 版本下的兼容性表现

---

## Appendices

### A. Current File Structure

```
src/
├── index.ts                    # 主入口，功能调度
├── js/
│   ├── DocManagement.ts        # 文档管理功能
│   ├── Highlight2Call.ts       # 电话号码高亮与交互
│   ├── HomePage.ts             # 首页 Filter 快速选择
│   ├── IncomingCallHandler.ts  # 来电监控与搜索
│   ├── MissedCall.ts           # Missed Call 处理
│   ├── NewMessageHandler.ts    # 新消息处理（QA, Welcome Call）
│   ├── POC.ts                  # Plan of Care 处理
│   ├── Prebilling.ts           # Prebilling Filter
│   └── VisitMonitor.ts         # Visit 状态监控面板
├── style/
│   ├── main.less               # 主样式
│   ├── coordinator-tracker.less # Visit Monitor 样式
│   └── highlight2call.less     # 电话高亮样式
└── utils/
    ├── templates&const.ts      # 选择器常量
    └── util.js                 # 工具函数
```

### B. Key Selector Constants

脚本依赖大量 DOM 选择器与 HHAExchange 页面交互，详见 `src/utils/templates&const.ts`。

### C. Related Links

- **模板仓库**: [trim21/webpack-userscript-template](https://github.com/trim21/webpack-userscript-template)
- **Vue3 增强版**: [KurosakiRei/webpack-userscript-template-with-vue3](https://github.com/KurosakiRei/webpack-userscript-template-with-vue3)
- **GM_fetch 库**: [@trim21/gm-fetch](https://github.com/trim21/gm-fetch)

---

*Document Version: 1.3*
*Created: 2025-11-30*
*Updated: 2025-12-14*
*Author: Mary (Business Analyst)*

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial draft |
| 1.1 | 2025-12-07 | Added: Emergency Contacts data source details, Message monitoring requirements, Publication plans |
| 1.2 | 2025-12-07 | Added: Multi-Tab sync solution decision (Plan D: localStorage + BroadcastChannel) with implementation architecture |
| 1.3 | 2025-12-14 | Added: Visit Monitor UI/UX enhancements completion (v3.2.0) - i18n, Authorization Note parsing, resize optimization |
