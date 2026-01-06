# Epic 7: 多 Tab 面板系统重构

**状态**: ✅ **已完成** - 2026-01-06

## Epic 概述

将现有的单一追踪面板重构为支持多 Tab 的可扩展面板系统，为后续功能扩展（如 QA 报告、文档管理等）提供统一的 UI 框架。

## 业务价值

- **可扩展性**：为脚本添加更多功能提供标准化的 UI 容器
- **用户体验**：统一的现代化设计语言，降低学习成本
- **状态管理**：智能保存用户的 tab 选择和功能配置
- **开发效率**：后续新功能只需实现 tab 内容，无需重复造轮子

---

## Story 7.1: 多 Tab 面板框架实现

### 用户故事
**作为**脚本用户  
**我希望**看到一个带左侧 tab 栏的现代化面板  
**以便**在不同功能之间快速切换

### 状态
✅ **已完成** - 2026-01-05

### 验收标准
- [x] 新面板比当前追踪面板"大一圈"（680×460px）
- [x] 左侧显示垂直 tab 栏，纯文字标签 + 图标
- [x] Tab 宽度 80px（可折叠至 40px）
- [x] Tab 激活状态显示蓝色高亮条（B 站样式）
- [x] Tab 栏支持折叠/展开（图标旋转 180°）
- [x] localStorage 持久化折叠状态和活跃 tab
- [x] 采用统一的 Material Design 风格
- [x] 平滑的 tab 切换动画（200ms fade in/out）

### 技术实现

#### 文件清单
**新建文件**：
1. `src/style/variables.less` - 设计令牌（颜色、间距、阴影等）
2. `src/style/multi-tab-panel.less` - 多 Tab 面板样式
3. `src/js/MultiTabPanel.ts` - 核心面板类
4. `src/js/tabs/BaseTab.ts` - Tab 基类
5. `src/js/tabs/StatusTrackingTab.ts` - 状态追踪 Tab
6. `src/js/tabs/QAReportTab.ts` - QA 报告占位符 Tab

**修改文件**：
1. `src/style/main.less` - 引入新样式文件
2. `src/index.ts` - 集成多 Tab 面板系统

#### 核心架构
```typescript
MultiTabPanel (容器层)
├── TabBar Component (左侧 tab 栏)
│   ├── TabItem[] (tab 列表)
│   ├── CollapseButton (折叠按钮)
│   └── LocalStorage Sync (状态持久化)
│
└── ContentArea (内容区域)
    ├── StatusTrackingTab (状态追踪)
    ├── QAReportTab (QA 报告)
    └── ...（未来扩展）
```

#### 关键特性
1. **显示/隐藏 DOM 切换**：所有 tab 内容同时存在于 DOM，通过 CSS display 控制显示，自动保留 tab 状态
2. **LocalStorage 持久化**：`hha_smart_assistant_active_tab`（活跃 tab ID）、`hha_smart_assistant_tab_bar_collapsed`（折叠状态）
3. **延迟初始化**：默认只初始化活跃 tab，其他 tab 在首次点击时初始化，优化性能
4. **设计令牌系统**：统一的颜色、间距、阴影定义，便于维护和主题切换

### 开发日志
**Phase 1: 设计令牌和样式**（2026-01-05）
- ✅ 创建 `variables.less` 定义设计令牌
- ✅ 创建 `multi-tab-panel.less` 实现完整样式
- ✅ 包含所有状态（hover, active, collapsed）
- ✅ 支持动画和过渡效果

**Phase 2: 核心框架**
- ✅ 创建 `BaseTab.ts` 抽象基类
- ✅ 创建 `MultiTabPanel.ts` 容器类
- ✅ 实现 tab 注册和切换逻辑
- ✅ 实现折叠/展开功能
- ✅ 实现 LocalStorage 持久化

**Phase 3: Tab 实现**
- ✅ 创建 `StatusTrackingTab.ts` - 状态追踪（占位符）
- ✅ 创建 `QAReportTab.ts` - QA 报告（占位符）
- ✅ 两个 tab 都使用统一的设计风格

**Phase 4: 集成**
- ✅ 更新 `main.less` 引入新样式
- ✅ 更新 `index.ts` 初始化面板
- ✅ 面板定位在页面右上角（top: 80px, right: 20px）

### 测试结果
**功能测试**：
- [x] Tab 点击切换流畅，无闪烁
- [x] 折叠 tab 栏后只显示图标
- [x] 刷新页面后恢复上次选择的 tab
- [x] 折叠状态正确持久化
- [x] 多次切换 tab 性能正常

**视觉测试**：
- [x] Tab 激活状态蓝色高亮条显示正确
- [x] 卡片阴影和圆角统一
- [x] 折叠动画流畅（200ms）
- [x] 图标和文字对齐
- [x] Material Design 风格一致

**构建测试**：
- [x] TypeScript 编译通过（0 errors）
- [x] Webpack 构建成功

---

## Story 7.2: 状态追踪 Tab 集成

### 用户故事
**作为**脚本用户  
**我希望**现有的追踪面板以"状态追踪" tab 的形式嵌入新面板  
**以便**继续使用现有功能

### 状态
✅ **已完成** - 2026-01-06

### 验收标准
- [x] 将现有 VisitMonitor.ts 逻辑整合到 tab 系统中
- [x] Tab 标签文字："状态追踪"
- [x] 更新追踪面板 UI 为现代化风格
- [x] 保留所有现有功能（Coordinator 筛选、状态追踪逻辑、实时更新）
- [x] Tab 切换时保留筛选状态（不重新加载数据）
- [x] 修复位置检测和定位逻辑
- [x] 修复按钮事件处理
- [x] 修复面板可见性问题（MutationObserver）
- [x] 修复表头颜色可读性问题

### 关键修复

#### 1. 位置检测和定位 ✅
**问题**：新面板出现时一半在视图外，且遮挡铃铛图标

**解决方案**：
- 在 MultiTabPanel 的 show() 方法中实现智能位置检测
- 根据 drag handle 位置判断左右两侧
- 容器宽度固定 680px，避免溢出
- 动态计算 left/right 位置，确保不遮挡原有元素

**修改文件**：`src/js/MultiTabPanel.ts` - 添加位置检测逻辑

#### 2. 按钮事件处理 ✅
**问题**：编辑按钮和返回按钮点击无响应  
**根本原因**：使用 cloneNode() 导致事件监听器丢失

**解决方案**：
- 改用 DOM 节点移动而不是克隆
- 使用 removeChild() + appendChild() 保持节点引用
- 在 MultiTabPanel hide() 时将 tracker-container 移回原位
- 确保所有事件监听器保持有效

**修改文件**：
- `src/js/MultiTabPanel.ts` - 重构 show/hide 方法
- `src/js/tabs/StatusTrackingTab.ts` - 调整初始化逻辑

#### 3. 面板可见性 ✅
**问题**：VisitMonitor 面板被外部代码隐藏  
**根本原因**：HHAExchange 页面的某些脚本会设置 `display: none`

**解决方案**：
- 使用 MutationObserver 监控 display 属性变化
- 当检测到被隐藏时立即恢复 `display: flex`
- 在面板关闭时停止监听

**修改文件**：`src/js/tabs/StatusTrackingTab.ts` - 添加 MutationObserver 逻辑

#### 4. 表头颜色可读性 ✅
**问题**：上班钟/下班钟详情列表的表头显示白色文字，看不清楚  
**根本原因**：CSS 只定义了背景色 `#f9f9f9`，没有定义文字颜色

**解决方案**：
- 为所有访问表头（Visit table headers）添加内联样式
- 统一使用 `style="color: #333 !important;"`
- 匹配现有 anomaly 和 message 表头的样式

**修改文件**：`src/js/VisitMonitor.ts` (lines 2564-2577) - 更新访问表头 HTML

### 文件修改清单
1. **src/js/MultiTabPanel.ts** - 添加位置检测逻辑、改用 DOM 移动而非克隆、支持动态左右定位
2. **src/js/tabs/StatusTrackingTab.ts** - 添加 MutationObserver 防止外部隐藏、调整初始化逻辑
3. **src/js/VisitMonitor.ts** - 修复访问表头颜色（lines 2564-2577）

### 开发日志
**Phase 1: 位置检测和定位**（2026-01-06）
- ✅ 实现智能左右两侧定位逻辑
- ✅ 容器宽度固定 680px 防止溢出
- ✅ 动态计算 left/right 位置
- ✅ MCP Chrome 验证通过

**Phase 2: 按钮事件修复**
- ✅ 改用 DOM 移动替代 cloneNode
- ✅ 保持事件监听器有效性
- ✅ 编辑按钮功能正常
- ✅ 返回按钮功能正常

**Phase 3: 面板可见性修复**
- ✅ 添加 MutationObserver 监控
- ✅ 自动恢复被隐藏的面板
- ✅ tracker-panel 内容正常显示

**Phase 4: 表头颜色修复**
- ✅ 识别问题根源（CSS 无文字颜色）
- ✅ 为 11 个访问表头添加内联样式
- ✅ 匹配现有表格样式模式
- ✅ 编译输出验证通过

### 测试结果
**功能测试**：
- [x] 位置检测：左侧定位正常、右侧定位正常
- [x] 不溢出视图、不遮挡铃铛图标
- [x] tracker-panel 可见且内容显示
- [x] 编辑按钮、返回按钮正常工作
- [x] 关闭/重新打开保持状态
- [x] 表头颜色可读（深灰色文字）

**视觉测试**：
- [x] 面板定位准确
- [x] 按钮样式统一
- [x] 表格表头清晰可读
- [x] 动画流畅（200ms）

**构建测试**：
- [x] TypeScript 编译通过（0 errors）
- [x] Webpack 构建成功（86ms - 1933ms）
- [x] 编译输出验证通过（dist/index.debug.js）

---

## Story 7.3: QA 报告 Tab 占位符

### 用户故事
**作为**脚本用户  
**我希望**看到"QA 报告" tab 选项  
**以便**为未来功能做准备

### 状态
✅ **已完成** - 2026-01-05

### 验收标准
- [x] 左侧 tab 栏显示："📋 QA 报告"（图标 + 文字）
- [x] 点击后显示占位符内容："📋 QA 报告功能 - 功能规划中，敬请期待..."
- [x] 占位符样式与整体设计一致（卡片样式，居中显示）
- [x] 折叠状态下只显示 📋 图标

### 技术实现

#### 文件清单
**新建文件**：`src/js/tabs/QAReportTab.ts` - QA 报告 Tab 占位符实现  
**修改文件**：`src/index.ts` - 注册 QAReportTab 到 MultiTabPanel

#### 实现细节
**QAReportTab.ts**:
```typescript
import { BaseTab } from './BaseTab';

export class QAReportTab extends BaseTab {
  id = 'qa-report';
  label = 'QA 报告';
  icon = '📋';

  render(container: HTMLElement): void {
    this.container = container;
    const placeholder = this.createPlaceholder(
      '📋',
      'QA 报告功能',
      '功能规划中，敬请期待...'
    );
    container.appendChild(placeholder);
  }
}
```

**注册到 MultiTabPanel** (src/index.ts):
```typescript
import { QAReportTab } from "./js/tabs/QAReportTab";
// ...
panel.registerTab(new StatusTrackingTab());
panel.registerTab(new QAReportTab());  // ← 新增
```

### 开发日志
**Phase 1: Tab 占位符创建**（2026-01-05）
- ✅ 创建 `QAReportTab.ts` 类
- ✅ 继承 `BaseTab` 基类
- ✅ 实现 `render()` 方法
- ✅ 使用 `createPlaceholder()` 辅助方法

**Phase 2: 注册和集成**
- ✅ 在 `index.ts` 中导入 `QAReportTab`
- ✅ 注册到 `MultiTabPanel` 实例
- ✅ 验证 Tab 正确显示

### 测试结果
**功能测试**：
- [x] Tab 按钮正确显示在左侧栏
- [x] Tab 文字："QA 报告"
- [x] Tab 图标：📋
- [x] 点击 Tab 切换到 QA 报告内容
- [x] 占位符内容正确显示

**视觉测试**：
- [x] Tab 按钮样式统一
- [x] 图标和文字对齐
- [x] 折叠状态只显示图标
- [x] 占位符样式与整体设计一致

**构建测试**：
- [x] TypeScript 编译通过（0 errors）
- [x] Webpack 构建成功

### 未来规划
当 QA 报告功能准备好实现时，需要：
- **数据获取**：定义 QA 报告数据结构、实现数据获取 API、添加数据缓存机制
- **UI 实现**：报告列表视图、报告详情视图、筛选和排序功能、导出功能
- **状态管理**：LocalStorage 持久化、实时更新机制、数据同步
- **交互优化**：加载状态指示、错误处理、Toast 提示

---

## 设计参考

### 面板布局（参考 B 站截图样式）

```
展开状态（总宽 680px）
┌─────────────────────────────────────────────────┐
│  HHAexchange Smart Assistant   [−][×]          │ ← 标题栏
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ 📊状态追踪│  ┌────────────────────────────────┐ │ ← 内容区
│ ────────│  │  配置卡片                      │ │
│          │  │  [Coordinator] [▼]            │ │
│ 📋QA 报告│  │  [筛选按钮]                    │ │
│          │  └────────────────────────────────┘ │
│          │                                      │
│          │  追踪数据表格...                    │
│    ◀     │                                      │ ← 折叠按钮
│          │                                      │
└──────────┴──────────────────────────────────────┘
   ↑
Tab 栏（80px）

折叠状态（总宽 640px）
┌─────────────────────────────────────────────────┐
│  HHAexchange Smart Assistant   [−][×]          │
├────┬────────────────────────────────────────────┤
│    │                                            │
│ 📊 │  ┌────────────────────────────────────┐   │
│ ── │  │  配置卡片                          │   │
│    │  │  [Coordinator] [▼]                │   │
│ 📋 │  │  [筛选按钮]                        │   │
│    │  └────────────────────────────────────┘   │
│    │                                            │
│    │  追踪数据表格...                          │
│ ▶  │                                            │
│    │                                            │
└────┴────────────────────────────────────────────┘
  ↑
40px（只显示图标）
```

### 颜色规范（统一设计语言）

```css
/* 主题色 */
--primary-color: #1976d2;        /* 蓝色主色调 */
--primary-hover: #1565c0;        /* 悬停深蓝 */
--primary-light: #bbdefb;        /* 浅蓝背景 */

/* Tab 激活状态 */
--tab-active-bg: #e3f2fd;        /* 浅蓝背景 */
--tab-active-border: #1976d2;    /* 左侧蓝色高亮条（4px 宽）*/

/* 阴影和圆角 */
--card-shadow: 0 2px 8px rgba(0,0,0,0.1);
--border-radius: 4px;
```

---

## 技术实现路线

### Phase 1: 框架搭建（Story 7.1）
1. 创建 `MultiTabPanel.ts` 核心类
2. 实现 tab 栏渲染和切换逻辑
3. 添加折叠/展开功能
4. localStorage 状态持久化

### Phase 2: 现有功能迁移（Story 7.2）
1. 重构 `VisitMonitor.ts` 为 tab 兼容模式
2. 更新 UI 样式为现代化设计
3. 测试功能完整性

### Phase 3: 占位符（Story 7.3）
1. 添加 QA 报告 tab
2. 渲染占位符内容

---

## QA 验收

### QA 验收结果
**验收人员**: Quinn (Test Architect)  
**验收日期**: 2026-01-06  
**验收状态**: ✅ **通过**

### 验收测试用例

#### 功能测试
- [x] Tab 点击切换流畅，无闪烁
- [x] 折叠 tab 栏后图标正常显示
- [x] 刷新页面后恢复上次选择的 tab
- [x] 状态追踪功能与原版一致
- [x] 多次切换 tab 不影响性能

#### 视觉测试
- [x] Tab 激活状态蓝色高亮条对齐
- [x] 卡片阴影和圆角统一
- [x] 按钮悬停效果一致
- [x] 折叠动画流畅（200ms）

#### 兼容性测试
- [x] Chrome 最新版本正常运行
- [x] 不同分辨率下布局不错乱
- [x] localStorage 读写无异常

### QA 审查结论

#### ✅ 代码质量
- **架构设计**: 优秀 - BaseTab 基类设计清晰，易于扩展
- **代码规范**: 良好 - TypeScript 类型定义完整，代码结构清晰
- **错误处理**: 完善 - MutationObserver 保护机制有效
- **性能优化**: 良好 - 延迟初始化，localStorage 持久化高效

#### ✅ 功能完整性
- **Story 7.1**: 框架实现完整，所有验收标准通过
- **Story 7.2**: 状态追踪 Tab 集成成功，关键问题已修复
- **Story 7.3**: QA 报告占位符就绪，为未来扩展做好准备

#### ✅ 用户体验
- **交互流畅**: Tab 切换无延迟，动画自然
- **视觉统一**: Material Design 风格一致
- **状态保持**: LocalStorage 持久化可靠

#### ✅ 技术亮点
1. **智能定位系统**: 自动适应左右两侧布局
2. **DOM 移动模式**: 保持事件监听器有效性
3. **MutationObserver 保护**: 防止外部干扰
4. **可扩展架构**: 易于添加新 Tab 功能

### 技术债务记录
- ⚠️ VisitMonitor.ts 需要重构（2977 行，耦合严重）- 建议后续 Epic
- 💡 可提取公共 UI 组件到独立模块 - 后续优化

### QA 批准
本 Epic 满足所有验收标准，代码质量良好，功能完整可用。批准发布。

**QA 签字**: Quinn (Test Architect)  
**批准时间**: 2026-01-06

---

## 风险与依赖

### 技术风险
- **CSS 冲突**：新样式可能与 HHAexchange 原站样式冲突
  - 缓解措施：使用唯一的 CSS class 前缀（如 `hha-smart-`）

- **性能问题**：多个 tab 同时存在 DOM 可能影响性能
  - 缓解措施：Story 7.1 限制初期只有 2 个 tab

### 依赖项
- ✅ 现有 `VisitMonitor.ts` 代码稳定
- ✅ Prebilling/Homepage Selector 的样式规范已建立

---

## Epic 完成总结

### 交付成果

#### ✅ Story 7.1: 多 Tab 面板框架实现
- 完成日期: 2026-01-05
- 关键特性：
  - 左侧垂直 Tab 栏（80px，可折叠至 40px）
  - LocalStorage 状态持久化
  - Material Design 风格
  - 平滑切换动画（200ms）

#### ✅ Story 7.2: 状态追踪 Tab 集成
- 完成日期: 2026-01-06
- 关键特性：
  - VisitMonitor 完全集成
  - 智能位置检测（左右两侧定位）
  - 事件处理修复（DOM 移动模式）
  - MutationObserver 防止外部隐藏
  - 表头颜色可读性修复

#### ✅ Story 7.3: QA 报告 Tab 占位符
- 完成日期: 2026-01-05
- 关键特性：
  - QA 报告 Tab UI 占位符
  - 统一设计风格
  - 为未来功能预留接口

### 技术亮点

1. **可扩展架构**：BaseTab 基类设计，新功能只需继承并实现 render 方法
2. **智能定位系统**：自动检测并适应左右两侧布局，避免遮挡和溢出
3. **DOM 移动模式**：保持事件监听器有效性，避免 cloneNode 的副作用
4. **MutationObserver 保护**：防止外部脚本干扰面板可见性
5. **状态持久化**：LocalStorage 保存用户偏好（活跃 Tab、折叠状态）

### 解决的关键问题

1. **位置检测和定位** - 容器智能定位，不遮挡铃铛图标，不溢出视图
2. **按钮事件失效** - 改用 DOM 移动替代克隆，保持事件监听器
3. **面板被外部隐藏** - MutationObserver 实时监控并恢复显示
4. **表头颜色不清晰** - 为访问表头添加内联样式，确保可读性

### 用户价值

- **统一体验**：现代化的 Material Design 风格，与其他功能（Prebilling、Homepage Selector）保持一致
- **便捷切换**：快速在不同功能间切换，提高工作效率
- **可扩展性**：为未来功能（QA 报告、文档管理等）提供标准化容器
- **稳定可靠**：解决了多个关键问题，确保核心功能正常运行

### 技术债务

- VisitMonitor.ts 仍需重构（2977 行，耦合严重）- 建议后续单独规划重构 Epic
- 可以提取公共 UI 组件到 `components/` 目录 - 后续优化

---

## 后续规划（Epic 外）

1. **UI 组件库提取**：将配置卡片、按钮等抽离为公共组件
2. **更多 tab 功能**：文档管理、数据导出、设置面板等
3. **主题切换**：支持深色模式
4. **拖拽排序**：允许用户自定义 tab 顺序

---

## 相关文档

- **相关 Epic**: 
  - Epic 1: Multi-tab Sync（参考设计模式）
  - Epic 3/4: Prebilling/Homepage Selector（参考 UI 风格）

