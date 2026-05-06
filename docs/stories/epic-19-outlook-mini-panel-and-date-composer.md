# Epic 19: Outlook 专用迷你悬浮面板 + 日期输入器（Date Composer）

## Epic 概述

| 属性 | 值 |
|---|---|
| **Epic ID** | EPIC-019 |
| **标题** | Outlook 专用迷你悬浮面板 + 日期输入器 |
| **优先级** | P1 |
| **状态** | 📝 draft |
| **关联系统** | MultiTabPanel, OutlookAdapter, HhaSearchService, DateComposerService（新建）, DateComposerModal（新建）, DateInputTab（新建）, OutlookMiniPanel（新建） |
| **依赖 Epic** | Epic 7 Multi-Tab Panel、Epic 12/13 Outlook 集成、Epic 18 Quick Search Tab |
| **ADR** | ADR-017 |

## 背景

用户需要在 Outlook 与 HHAExchange 两个环境中高频输入日期文本。现有流程的问题不在于“不会写日期”，而在于：

1. 日期模式太多，手工输入极易出现格式不统一；
2. 过去日期、未来日期、单日、连续区间、混合区间都很常见；
3. Outlook 是最高频使用场景，但当前没有与 HHA 页面同等便利的面板入口；
4. HHA 页面虽然已有主悬浮面板，但没有面向通用日期文本的共享能力；
5. 若把日期能力继续散落到 MailBuilder、内置模板或各类弹窗中，维护成本会持续升高。

本 Epic 的目标是交付一套最小但完整的共享日期输入能力：

- 在 HHAExchange 主悬浮面板中新增独立的 `日期输入器` Tab；
- 在 Outlook 页面新增专用迷你悬浮面板，只保留 `快速搜索` 与 `日期输入器` 两个 Tab；
- 以图形化日期选择 + 统一格式输出 + 稳定复制为主路径，优先解决最高频、最痛的输入问题。

---

## 非目标

以下事项不在本 Epic 范围内：

1. 对 Outlook 任意输入框、任意 caret 位置做通用自动插入承诺；
2. 为所有现有模板与编辑器逐一加“小日历按钮”集成；
3. 支持鼠标拖拽跨格连选日期；
4. 支持自然语言解析已有日期字符串再反向编辑；
5. 在 Outlook 迷你面板中复刻 HHA 主面板全部 Tab。

---

## 目标用户流程

### 流程 A：Outlook 中快速生成并复制日期文本

1. 用户在 Outlook 页面点击悬浮图标，打开迷你面板；
2. 切换到 `日期输入器` Tab；
3. 点击 `打开日期输入器`，弹出双月历 Modal；
4. 点选日期后点击 `应用`；
5. Tab 预览区显示结果，例如 `04/01 - 04/02, 04/07, 04/15 - 04/16/2026`；
6. 用户点击 `复制结果` 并回到 Outlook 粘贴。

### 流程 B：HHAExchange 中使用日期输入器作为共享工具

1. 用户在 HHA 页面打开主悬浮面板；
2. 切换到 `日期输入器` Tab；
3. 通过 Modal 选择日期并生成结果；
4. 在 HHA 各类模板或其他输入位置手动粘贴，后续再按需要决定是否为特定输入框增加自动插入能力。

---

## Story 19-1: 提取共享 DateComposerService 核心域

**作为** 系统，
**我需要** 一个完全独立于宿主页面与 UI 组件的日期输入核心服务，
**以便** HHA 与 Outlook 两个宿主可以共享同一套日期集合管理和格式化逻辑。

### 验收标准
- [ ] 新建 `src/js/services/DateComposerService.ts`
- [ ] 导出 canonical 数据结构与核心方法，至少包括：
  - `toggleDate(date: string): void`
  - `setDates(dates: string[]): void`
  - `clear(): void`
  - `getSelectedDates(): string[]`
  - `setPreset(preset: DateFormatPreset): void`
  - `buildDisplayText(): string`
- [ ] 内部日期 canonical 格式统一为 `YYYY-MM-DD`
- [ ] `buildDisplayText()` 满足以下规则：
  - 自动排序
  - 自动去重
  - 自动合并连续日期
  - 逗号后一个空格
  - 横线两边一个空格
  - 跨月区间正常显示，例如 `04/30 - 05/02/2026`
  - 跨年区间两端都带年份，例如 `12/30/2026 - 01/02/2027`
- [ ] 支持以下 preset：
  - `compactSameYear`
  - `fullYear`
  - `monthDayOnly`
- [ ] 该服务不直接访问 DOM、不直接写剪贴板、不依赖具体 Tab 或 Modal
- [ ] `npm run build` 无新增错误

### 实现提示
- 建议把“把已选日期压缩为区间”的逻辑抽为纯函数，便于后续单测与宿主复用
- `monthDayOnly` 仅是展示层策略，不影响 canonical 日期集合本身

---

## Story 19-2: 共享双月历 DateComposerModal

**作为** 用户，
**我需要** 一个图形化的日期选择弹窗，
**以便** 不再手动输入复杂日期文本。

### 验收标准
- [ ] 新建 `src/js/components/DateComposerModal.ts`
- [ ] Modal 可被 HHA 的 `DateInputTab` 与 Outlook 的 `DateInputTab` 共同调用
- [ ] Desktop 默认显示双月历并排；窄视口自动改为上下布局
- [ ] 单击某一天可切换选中 / 取消选中
- [ ] 支持 Shift-Click 选择连续区间
- [ ] 已选日期有明确视觉高亮，连续区间无需用户切换“范围模式”
- [ ] Modal 内部显示实时预览文本，调用 `DateComposerService.buildDisplayText()` 生成
- [ ] 提供以下按钮：
  - `应用`
  - `清空`
  - `取消`
- [ ] 关闭弹窗后，未点击 `应用` 的改动不污染宿主当前已确认结果
- [ ] 不要求实现鼠标拖拽跨格连选

### 实现提示
- 可采用“临时 draft service state + apply 时提交”的模式，避免取消时污染宿主
- Modal 宽度建议参考现有模板弹窗体系，控制在 `780px - 860px` 区间

---

## Story 19-3: HHAExchange `日期输入器` Tab 工作台

**作为** HHAExchange 用户，
**我需要** 在主悬浮面板中有一个清晰独立的日期工具入口，
**以便** 在任何需要日期文本的地方都能复用它。

### 验收标准
- [ ] 新建 `src/js/tabs/DateInputTab.ts`
- [ ] Tab 基本属性：
  - `id = "date-input"`
  - `label = "日期输入器"`
  - `icon = "📅"`
- [ ] Tab 注册到 HHA 主 `MultiTabPanel`
- [ ] 建议将该 Tab 放在 `QuickSearchTab` 后，形成轻工具分组
- [ ] Tab 不常驻完整日历，而是提供工作台 UI：
  - `打开日期输入器` 主按钮
  - preset 切换区
  - 当前结果预览区
  - `复制结果` 按钮
  - `清空` 按钮
- [ ] 复制成功后显示统一 toast 提示
- [ ] 当前选择结果在同一页面生命周期内保留；刷新页面后默认清空
- [ ] Tab 的视觉风格与现有悬浮面板一致，不引入突兀的新设计语言

### 实现提示
- 该 Tab 是 workbench，不是完整日历容器；完整选择仍通过 Story 19-2 的 Modal 完成

---

## Story 19-4: Outlook 专用迷你悬浮面板壳层

**作为** Outlook 用户，
**我需要** 一个与 HHA 页面相似的悬浮图标与面板入口，
**以便** 在 Outlook 环境中也能快速使用 Smart Assistant 的轻量工具。

### 验收标准
- [ ] 新建 `src/js/services/OutlookMiniPanel.ts`
- [ ] Outlook 页面在现有 `OutlookAdapter.init()` 之外，再启动专用迷你面板 bootstrap
- [ ] 迷你面板视觉上沿用现有悬浮图标 / 悬浮面板的交互范式：
  - 可点击展开 / 收起
  - 可拖动
  - 位置可持久化
- [ ] 迷你面板运行时独立于 VisitMonitor，不依赖 HHA 页面 DOM
- [ ] Outlook 迷你面板只注册两个 Tab：
  - `快速搜索`
  - `日期输入器`
- [ ] 不初始化 StatusTracking / QA / Cleaner / MailBuilder 等 HHA 专属模块
- [ ] Outlook 页面为 SPA 路由切换时，迷你面板不会重复初始化出多份实例

### 实现提示
- 视觉上“复制”HHA 的悬浮图标即可，但代码层不要依赖 `visitMonitor()` 的现有实现
- host 级持久化 key 应与 HHA 主面板分离，防止位置和最后激活 tab 互相污染

---

## Story 19-5: Outlook 迷你面板中的 Quick Search 复用

**作为** Outlook 用户，
**我需要** 在 Outlook 迷你面板中也能使用 Quick Search，
**以便** 不必切回 HHA 页面才能做人员 / 病人检索。

### 验收标准
- [ ] Outlook 迷你面板成功注册 Quick Search Tab
- [ ] `QuickSearchTab` 在 Outlook 宿主下能够正常工作，不依赖 HHA 页面可见 DOM
- [ ] `HhaSearchService` 增加 tenant cache 策略：
  - 在 HHA 页面成功解析租户后写入缓存
  - 在 Outlook 页面优先读取缓存
  - 缓存缺失时给出明确提示，而不是悄悄回退到错误租户
- [ ] Outlook 中发起 Quick Search 后，查询 URL 使用缓存租户前缀
- [ ] 不破坏 HHA 页面现有 Quick Search 行为

### 实现提示
- 可在 `detectTenantBaseUrl()` 外围新增 `getPreferredTenantBaseUrl()`，统一封装“当前环境解析 + 缓存兜底”的策略

---

## Story 19-6: Outlook 迷你面板中的 `日期输入器` Tab 与复制工作流

**作为** Outlook 用户，
**我需要** 在 Outlook 页面内通过图形界面快速生成标准化日期文本并复制，
**以便** 粘贴到邮件正文或其他需要输入日期的地方。

### 验收标准
- [ ] Outlook 迷你面板注册 `日期输入器` Tab
- [ ] 该 Tab 复用 Story 19-3 的工作台 UI 与 Story 19-2 的共享 Modal
- [ ] 用户在 Modal 选择日期并点击 `应用` 后，Tab 预览区立即更新
- [ ] 点击 `复制结果` 后调用 Clipboard API，成功时显示 toast
- [ ] 复制是 Outlook 场景的主路径
- [ ] 本 Story 不实现 Outlook 任意 caret 自动插入
- [ ] 若 Clipboard API 失败，提供明确失败提示

### 实现提示
- 可在预览区上方显示一行辅助文案：`复制后回到 Outlook 直接粘贴即可`

---

## Story 19-7: 宿主级持久化、回归测试与上线准备

**作为** 团队，
**我需要** 为 HHA 与 Outlook 两个宿主建立稳定的轻量持久化与回归测试清单，
**以便** 新增能力不会破坏现有面板和 Outlook 自动化流程。

### 验收标准
- [ ] 分别为 HHA 主面板与 Outlook 迷你面板定义独立持久化 key，至少覆盖：
  - 面板位置
  - 最后激活的 Tab
  - 最后使用的日期 preset
- [ ] 不跨页面持久化当前已选日期集合
- [ ] 完成以下手动回归清单：
  - HHA 主面板原有 5 个 Tab 行为不受影响
  - HHA 新增 `日期输入器` Tab 可打开 Modal、生成结果、复制成功
  - Outlook 页面迷你面板可正常展开 / 拖动 / 收起
  - Outlook `快速搜索` 在租户缓存存在时可正常搜索
  - Outlook `日期输入器` 可生成并复制结果
  - Outlook 现有 `OutlookAdapter` 邮件任务流不受影响
- [ ] 文档更新：Epic 状态、实现记录、热修复记录预留章节齐全

### 实现提示
- 若 Outlook 页面无法读取 tenant cache，应在 Quick Search Tab 内联提示“请先打开一次 HHA 页面以同步租户信息”

---

## 依赖关系

```text
19-1 (DateComposerService)
  └─ 19-2 (DateComposerModal)
       ├─ 19-3 (HHA DateInputTab)
       └─ 19-6 (Outlook DateInputTab)

19-4 (OutlookMiniPanel Shell)
  ├─ 19-5 (Quick Search in Outlook)
  └─ 19-6 (DateInputTab in Outlook)

19-7 (Persistence + QA)
  └─ depends on 19-3, 19-4, 19-5, 19-6
```

---

## 文件清单（规划）

| 操作 | 文件路径 |
|---|---|
| 新建 | `src/js/services/DateComposerService.ts` |
| 新建 | `src/js/components/DateComposerModal.ts` |
| 新建 | `src/js/tabs/DateInputTab.ts` |
| 新建 | `src/js/services/OutlookMiniPanel.ts` |
| 修改 | `src/js/services/HhaSearchService.ts` |
| 修改 | `src/index.ts` |
| 修改 | `src/style/main.css` / `src/style/multi-tab-panel.css`（如需新增 tab / panel 样式） |
| 修改 | `docs/stories/epic-19-outlook-mini-panel-and-date-composer.md` |

---

## 风险与缓解

| 风险 | 说明 | 缓解 |
|---|---|---|
| Outlook Quick Search 租户错误 | Outlook 环境无法直接推导 tenant | 使用 HHA 页面写入的 tenant cache，缺失时显式提示 |
| 面板重复初始化 | Outlook 为 SPA，路由变化频繁 | 加全局单例保护与 DOM 已存在检查 |
| 用户期待自动插入 | 复制路径仍需手动粘贴 | 在 UI 中明确说明“复制后粘贴”，后续再单独规划第一方输入框插入 |
| 日期选择残留导致误用 | 用户下一次打开仍看到旧选择 | 仅持久化 preset，不默认跨页面保留已选日期 |

---

## 后续候选增强（不在本 Epic 范围内）

1. 第一方输入框 / 富文本编辑器的“目标字段记忆 + 自动插入”能力
2. 日期结果最近历史列表与一键重用
3. 鼠标拖拽跨格连选日期
4. 从已有日期字符串反向解析并回填到日历