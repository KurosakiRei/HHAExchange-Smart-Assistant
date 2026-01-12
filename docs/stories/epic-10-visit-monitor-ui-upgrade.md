# Epic 10: Visit Monitor UI 现代化升级

**状态**: 📝 **待开始**

## Epic 概述

对 Visit Monitor（辅导员追踪面板）的 UI 进行现代化升级，使其视觉风格与 QA Report Tab 保持一致，提升用户体验和视觉统一性。本次升级将在不破坏任何现有功能的前提下，重构 UI 样式系统。

## 业务价值

- **视觉统一**：与其他面板保持一致的设计语言，提升专业度
- **用户体验**：更现代化的交互体验，更清晰的视觉层次
- **可维护性**：使用统一的设计系统（variables.less），便于后续维护
- **无功能破坏**：100% 保留所有现有功能，仅升级视觉表现

## 当前 UI 分析

### VisitMonitor 现状对比 QA Report

| 设计元素 | VisitMonitor（旧） | QA Report（新） | 差异程度 |
|---------|------------------|----------------|---------|
| **按钮样式** | 灰色扁平按钮，无图标 | 渐变色/边框按钮，带图标 | ⚠️ 较大 |
| **按钮文字大小** | 默认大小（约 14px） | 统一 13px（@font-size-sm） | ⚠️ 中等 |
| **表格风格** | 基础边框表格 | 现代化无边框表格 + 行悬停 | ⚠️ 较大 |
| **数字按钮** | 圆形彩色按钮（28px） | 圆形彩色按钮（28px），悬停效果 | ✅ 接近 |
| **颜色系统** | 硬编码颜色值 | 使用 variables.less 统一管理 | ⚠️ 较大 |
| **工具栏** | 简单灰色背景 | 白色背景 + 底部边框，44px 高度 | ⚠️ 中等 |
| **面板背景** | #f9f9f9 | @background-white (#ffffff) | ⚠️ 中等 |
| **阴影系统** | 硬编码阴影 | 统一的 @shadow-* 变量 | ⚠️ 中等 |
| **圆角系统** | 混合使用 5px, 8px, 50% | 统一的 @radius-* 变量 | ⚠️ 中等 |
| **拖拽句柄** | 蓝色圆形 emoji | 渐变背景圆形句柄（可保留emoji） | ⚠️ 中等 |

### 详细差异示例

#### 1. 按钮设计

**当前 VisitMonitor：**
```css
.tracker-header-btn {
    background: #e0e0e0;
    border: 1px solid #ccc;
    padding: 4px 10px;
    border-radius: 5px;
    cursor: pointer;
}
```
- ❌ 灰色扁平风格
- ❌ 没有图标
- ❌ 颜色硬编码

**QA Report 标准：**
```css
.qa-load-btn {
    background: @primary-gradient;  // 渐变背景
    border: none;
    color: white;
    border-radius: @radius-sm;
    height: 28px;
    padding: 0 14px;
    font-size: @font-size-sm;
    display: inline-flex;
    align-items: center;
    gap: @spacing-xs;  // 图标与文字间距
}
```
- ✅ 渐变色或主题色
- ✅ 支持图标
- ✅ 统一变量管理
- ✅ 固定高度

#### 2. 表格设计

**当前 VisitMonitor：**
```css
.tracker-table {
    width: 100%;
    border-collapse: collapse;
}
.tracker-table th,
.tracker-table td {
    border: 1px solid #ddd;  // 全边框
    padding: 8px 12px;
    text-align: center;
}
.tracker-table th {
    background-color: #e9ecef;  // 灰色表头
}
```
- ❌ 全边框设计（老式）
- ❌ 灰色表头
- ❌ 无悬停效果

**QA Report 标准：**
```css
.qa-report-table {
    border-collapse: collapse;
}
.qa-report-table th {
    background: @background-alt;  // 浅色背景
    color: @text-primary;
    font-weight: @font-weight-semibold;
    border-bottom: 2px solid @border-color;  // 仅底部粗边框
    padding: @spacing-sm @spacing-md;
}
.qa-report-table tbody tr {
    border-bottom: 1px solid @border-color-light;  // 细分割线
    transition: background @transition-fast;
}
.qa-report-table tbody tr:hover {
    background: @background-hover;  // 悬停高亮
}
```
- ✅ 现代化无边框设计
- ✅ 悬停交互
- ✅ 清晰的视觉层次

#### 3. 工具栏设计

**当前 VisitMonitor：**
```css
.tracker-header {
    padding: 8px 15px;
    background: @background-white;  // 已升级
    border-bottom: 1px solid @border-color;  // 已升级
    height: 44px;  // 已升级
}
```
- ✅ 已经使用了统一变量
- ⚠️ 但内部按钮样式未统一

**QA Report 标准：**
```css
.qa-report-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: @spacing-xs @spacing-md;
    background: @background-white;
    border-bottom: 1px solid @border-color;
    height: 44px;
    gap: @spacing-sm;  // 元素间距
}
```
- ✅ Flexbox 布局
- ✅ 统一间距系统

## Story 列表

| Story | 标题 | 优先级 | 工时 | 状态 |
|-------|------|--------|------|------|
| 10.1 | 颜色系统迁移至 variables.less | High | 2h | 📝 待开始 |
| 10.2 | 按钮组件统一升级 | High | 3h | 📝 待开始 |
| 10.3 | 表格样式现代化 | High | 3h | 📝 待开始 |
| 10.4 | 工具栏布局优化 | Medium | 2h | 📝 待开始 |
| 10.5 | 数字按钮增强交互 | Low | 1h | 📝 待开始 |
| 10.6 | 拖拽句柄视觉升级 | Low | 1h | 📝 待开始 |
| 10.7 | 细节打磨与测试 | High | 2h | 📝 待开始 |
| 10.8 | 编辑视图（编辑追踪列表）UI 升级 | High | 2.5h | 📝 待开始 |
| 10.9 | 详情列表弹窗 UI 统一升级 | High | 3h | 📝 待开始 |
| 10.10 | 详情列表四边可拉伸功能 | Medium | 3.5h | 📝 待开始 |

**总工时预估**: 23 小时

---

## Story 10.1: 颜色系统迁移至 variables.less

### 用户故事
**作为** 开发者  
**我希望** Visit Monitor 使用统一的颜色变量系统  
**以便** 保持与其他面板的视觉一致性，便于统一主题管理

### 验收标准
- [ ] 移除 coordinator-tracker.less 中所有硬编码的颜色值
- [ ] 使用 variables.less 中的颜色变量：
  - [ ] `@primary-color`, `@primary-gradient` 替换主色调
  - [ ] `@background-white`, `@background-alt` 替换背景色
  - [ ] `@border-color` 替换边框色
  - [ ] `@text-primary`, `@text-secondary` 替换文字颜色
- [ ] 更新状态颜色：
  - [ ] 绿色成功状态保持 `#28a745`
  - [ ] 红色错误状态保持 `#dc3545`
  - [ ] 蓝色信息提示使用 `@primary-color`
- [ ] 验证所有颜色在浅色/深色背景下的可读性
- [ ] 确保功能完全正常，无视觉断层

### 技术要点

**当前硬编码示例：**
```less
#tracker-drag-handle {
    background-color: #007bff;  // ❌ 硬编码
}
.tracker-header-btn {
    background: #e0e0e0;        // ❌ 硬编码
    border: 1px solid #ccc;     // ❌ 硬编码
}
```

**升级后：**
```less
#tracker-drag-handle {
    background: @primary-gradient;  // ✅ 使用渐变
}
.tracker-header-btn {
    background: @background-alt;     // ✅ 统一变量
    border: 1px solid @border-color; // ✅ 统一变量
}
```

### 回归测试检查项
- [ ] 拖拽句柄颜色正常
- [ ] 按钮颜色正常
- [ ] 表格颜色正常
- [ ] 数字按钮颜色（绿色/红色）保持不变
- [ ] Toast 提示颜色正常

---

## Story 10.2: 按钮组件统一升级

### 用户故事
**作为** 脚本用户  
**我希望** 按钮样式与 QA Report 一致  
**以便** 获得统一的交互体验

### 验收标准
- [ ] 主操作按钮使用渐变背景（如"保存"）
- [ ] 次级操作按钮使用边框样式（如"取消"、"导出"）
- [ ] 所有按钮高度统一为 28px
- [ ] 按钮文字大小统一为 @font-size-sm (13px)
- [ ] 按钮支持图标（使用 Unicode 或 SVG）
- [ ] 按钮悬停/按下状态有明确反馈
- [ ] disabled 状态样式统一
- [ ] 现有功能完全不受影响

### UI 设计

#### 工具栏按钮组

**升级前：**
```
┌─────────────────────────────────────────┐
│  ⏰ --:--:--  [编辑追踪列表]           │
└─────────────────────────────────────────┘
```

**升级后：**
```
┌─────────────────────────────────────────┐
│  ⏰ --:--:--  [📝 编辑列表]            │
└─────────────────────────────────────────┘
```

#### 编辑视图按钮组

**升级前：**
```
┌─────────────────────────────────────────┐
│  [取消]                      [保存]     │
└─────────────────────────────────────────┘
```

**升级后：**
```
┌─────────────────────────────────────────┐
│  [取消]                      [💾 保存]   │
└─────────────────────────────────────────┘
```

### 技术实现

#### 按钮基础样式

```less
// 主操作按钮（保存、确认等）
.tracker-btn-primary {
    background: @primary-gradient;
    border: none;
    color: white;
    border-radius: @radius-sm;
    height: 28px;
    padding: 0 14px;
    font-size: @font-size-sm;
    font-weight: @font-weight-medium;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: @spacing-xs;
    transition: all @transition-fast;
    
    &:hover:not(:disabled) {
        filter: brightness(1.1);
        box-shadow: @shadow-button;
    }
    
    &:active:not(:disabled) {
        transform: translateY(1px);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

// 次级按钮（取消、返回等）
.tracker-btn-secondary {
    background: white;
    border: 1px solid @border-color;
    color: @text-primary;
    border-radius: @radius-sm;
    height: 28px;
    padding: 0 14px;
    font-size: @font-size-sm;
    cursor: pointer;
    transition: all @transition-fast;
    
    &:hover:not(:disabled) {
        border-color: @primary-color;
        color: @primary-color;
        background: @primary-bg-light;
    }
}

// 图标按钮（返回）
.tracker-btn-icon {
    width: 28px;
    height: 28px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: @radius-sm;
    font-size: @font-size-lg;
}
```

#### HTML 更新示例

**工具栏：**
```html
<!-- 升级前 -->
<button id="edit-list-btn" class="tracker-header-btn">编辑追踪列表</button>

<!-- 升级后 -->
<button id="edit-list-btn" class="tracker-btn-secondary">
    📝 编辑列表
</button>
```

**编辑视图底部：**
```html
<!-- 升级前 -->
<button id="cancel-btn" class="tracker-header-btn">取消</button>
<button id="save-btn" class="tracker-header-btn" style="background-color:#007bff;color:white">保存</button>

<!-- 升级后 -->
<button id="cancel-btn" class="tracker-btn-secondary">取消</button>
<button id="save-btn" class="tracker-btn-primary">💾 保存</button>
```

**返回按钮：**
```html
<!-- 升级前 -->
<button id="back-btn" class="tracker-header-btn back-btn">←</button>

<!-- 升级后 -->
<button id="back-btn" class="tracker-btn-icon tracker-btn-secondary">←</button>
```

### 回归测试检查项
- [ ] "编辑列表" 按钮点击正常切换视图
- [ ] "保存" 按钮正常保存追踪列表
- [ ] "取消" 按钮正常返回并放弃修改
- [ ] "返回" 按钮正常切换视图
- [ ] 按钮 disabled 状态在加载时正确显示
- [ ] 所有按钮悬停效果正常

---

## Story 10.3: 表格样式现代化

### 用户故事
**作为** 脚本用户  
**我希望** 表格样式更现代化、易读  
**以便** 更舒适地查看辅导员状态

### 验收标准
- [ ] 移除表格全边框，改为细分割线设计
- [ ] 表头使用浅色背景 + 底部粗边框
- [ ] 表格行添加悬停高亮效果
- [ ] 单元格内边距统一使用 spacing 变量
- [ ] 表头字体使用 semibold 加粗
- [ ] 保持表格列宽设置不变
- [ ] 数字按钮位置和功能完全不变
- [ ] 响应式设计保持不变

### UI 对比

#### 升级前（全边框设计）

```
┌──────┬────────────────────┬─────────┬─────────┬─────────┬──────┐
│ 编号 │ 辅导员 (Ext.)     │ 上班钟  │ 下班钟  │ 异常打钟│ 消息 │
├──────┼────────────────────┼─────────┼─────────┼─────────┼──────┤
│  1   │ Tao Yang ext.503   │  (0)    │  (0)    │  (0)    │ (0)  │
├──────┼────────────────────┼─────────┼─────────┼─────────┼──────┤
│  2   │ Tracy V. ext.145   │  (0)    │  (0)    │  (10)   │ (9)  │
└──────┴────────────────────┴─────────┴─────────┴─────────┴──────┘
```

#### 升级后（现代化设计）

```
  编号   辅导员 (Ext.)       上班钟    下班钟    异常打钟  消息
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1    Tao Yang ext.503     (0)       (0)       (0)      (0)
  ─────────────────────────────────────────────────────────
   2    Tracy V. ext.145     (0)       (0)       (10)     (9)   ← 悬停高亮
  ─────────────────────────────────────────────────────────
   3    Winnie Y. Ext. 402   (0)       (0)       (17)     (0)
```

### 技术实现

```less
.tracker-table {
    width: 100%;
    border-collapse: collapse;
    font-size: @font-size-sm;
}

// 表头样式
.tracker-table thead th {
    background: @background-alt;
    color: @text-primary;
    font-weight: @font-weight-semibold;
    font-size: @font-size-sm;
    text-align: center;
    padding: @spacing-sm @spacing-md;
    border: none;
    border-bottom: 2px solid @border-color;  // 仅底部粗边框
    position: sticky;
    top: 0;
    z-index: 10;
}

// 左对齐的列（辅导员名称）
.tracker-table thead th.col-coordinator,
.tracker-table tbody td.col-coordinator {
    text-align: left;
}

// 表格行样式
.tracker-table tbody tr {
    border: none;
    border-bottom: 1px solid @border-color-light;  // 细分割线
    transition: background @transition-fast;
}

.tracker-table tbody tr:hover {
    background: @background-hover;  // 悬停高亮
}

// 单元格样式
.tracker-table tbody td {
    padding: @spacing-sm @spacing-md;
    text-align: center;
    vertical-align: middle;
    border: none;  // 移除边框
}

// 最后一行不显示底部边框
.tracker-table tbody tr:last-child {
    border-bottom: none;
}
```

### 回归测试检查项
- [ ] 表格数据正常显示
- [ ] 辅导员名称列左对齐
- [ ] 数字按钮位置正确
- [ ] 点击数字按钮功能正常
- [ ] 表格滚动正常
- [ ] 表头固定（sticky）功能正常（如果有）

---

## Story 10.4: 工具栏布局优化

### 用户故事
**作为** 脚本用户  
**我希望** 工具栏布局更清晰合理  
**以便** 快速找到所需操作

### 验收标准
- [ ] 使用 Flexbox 布局，元素均匀分布
- [ ] 左侧：上次更新时间
- [ ] 右侧：编辑按钮
- [ ] 元素垂直居中对齐
- [ ] 使用统一的 gap 间距
- [ ] 工具栏高度保持 44px
- [ ] 响应式适配（小屏幕时合理布局）

### 技术实现

```less
.tracker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: @spacing-xs @spacing-md;
    background: @background-white;
    border-bottom: 1px solid @border-color;
    flex-shrink: 0;
    height: 44px;
    box-sizing: border-box;
    gap: @spacing-sm;
}

.tracker-header-left {
    display: flex;
    align-items: center;
    gap: @spacing-sm;
    flex: 0 0 auto;
}

.tracker-header-right {
    display: flex;
    align-items: center;
    gap: @spacing-xs;
}

#last-refresh-time {
    font-size: @font-size-sm;
    color: @text-secondary;
    line-height: 28px;  // 与按钮高度一致
}
```

### HTML 结构调整

```html
<!-- 升级前 -->
<div class="tracker-header">
    <div style="display: flex; align-items: center; gap: 8px;">
        <span id="last-refresh-time">上次更新: --:--:--</span>
    </div>
    <button id="edit-list-btn" class="tracker-header-btn">编辑追踪列表</button>
</div>

<!-- 升级后 -->
<div class="tracker-header">
    <div class="tracker-header-left">
        <span id="last-refresh-time">⏰ 上次更新: --:--:--</span>
    </div>
    <div class="tracker-header-right">
        <button id="edit-list-btn" class="tracker-btn-secondary">📝 编辑列表</button>
    </div>
</div>
```

### 回归测试检查项
- [ ] 工具栏元素对齐正确
- [ ] 上次更新时间显示正常
- [ ] 编辑按钮位置正确
- [ ] 按钮点击功能正常

---

## Story 10.5: 数字按钮增强交互

### 用户故事
**作为** 脚本用户  
**我希望** 数字按钮有更好的交互反馈  
**以便** 明确知道哪些是可点击的

### 验收标准
- [ ] 保持数字按钮当前的圆形设计（28px）
- [ ] 保持当前的颜色系统（绿色/红色）
- [ ] 增强悬停效果：
  - [ ] 轻微放大（scale: 1.05）
  - [ ] 增加阴影深度
  - [ ] 降低不透明度（0.9）
- [ ] 增加按下效果（active state）
- [ ] 为 0 值按钮添加禁用样式提示
- [ ] 保持点击功能完全不变
- [ ] 保持闪烁动画不变

### 技术实现

```less
.status-icon {
    width: 28px;
    height: 28px;
    border-radius: @radius-round;
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: @font-weight-bold;
    font-size: @font-size-sm;
    cursor: pointer;
    transition: all @transition-fast;
    box-shadow: @shadow-button;  // 基础阴影
    
    // 悬停效果增强
    &:hover {
        transform: scale(1.05);
        box-shadow: @shadow-card;  // 更深阴影
        opacity: 0.9;
    }
    
    // 按下效果
    &:active {
        transform: scale(0.95);
        box-shadow: @shadow-button;
    }
    
    // 禁用状态（0值）
    &.status-disabled {
        opacity: 0.5;
        cursor: default;
        
        &:hover {
            transform: none;
            opacity: 0.5;
        }
    }
}

.status-ok {
    background-color: #28a745;  // 保持绿色
}

.status-error {
    background-color: #dc3545;  // 保持红色
    animation: blink-animation 1.5s infinite;
}

// 闪烁动画保持不变
@keyframes blink-animation {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}
```

### 逻辑调整

在渲染数字按钮时，为 0 值按钮添加 `status-disabled` 类：

```typescript
// 示例代码（实际位置在 renderTrackingView 函数中）
const clockInCount = statusDataCache.get(key2)?.count || 0;
const iconClass = clockInCount === 0 
    ? 'status-icon status-ok status-disabled' 
    : clockInCount > 0 
        ? 'status-icon status-ok' 
        : 'status-icon status-ok status-disabled';
```

### 回归测试检查项
- [ ] 数字显示正常
- [ ] 绿色按钮颜色不变
- [ ] 红色按钮颜色不变
- [ ] 红色按钮闪烁动画正常
- [ ] 点击按钮弹出详情功能正常
- [ ] 0 值按钮不可点击（或点击无反应）

---

## Story 10.6: 拖拽句柄视觉升级

### 用户故事
**作为** 脚本用户  
**我希望** 拖拽句柄更美观现代  
**以便** 提升整体视觉品质

### 验收标准
- [ ] 使用渐变背景替换纯蓝色
- [ ] 保留或替换 emoji 图标（🔔）
- [ ] 增强悬停/按下动画效果
- [ ] 与面板风格保持一致
- [ ] 拖拽功能完全不受影响
- [ ] 句柄大小保持 48px

### 技术实现

```less
#tracker-drag-handle {
    width: 48px;
    height: 48px;
    background: @primary-gradient;  // 使用渐变
    color: white;
    border-radius: @radius-round;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: move;  // 更明确的拖拽光标
    box-shadow: @shadow-card;
    font-size: 24px;
    transition: all @transition-fast;
    
    &:hover {
        transform: scale(1.1);
        box-shadow: @shadow-card-hover;
    }
    
    &:active {
        transform: scale(0.95);
        box-shadow: @shadow-button;
    }
}
```

### 备选方案

如果不想使用 emoji，可以使用 Unicode 图标或 SVG：

```less
// 方案 1：使用不同的 Unicode 图标
#tracker-drag-handle::before {
    content: "⋮⋮";  // 双竖点
    font-size: 20px;
}

// 方案 2：使用文字
#tracker-drag-handle {
    font-family: @font-family-base;
    font-size: 12px;
    font-weight: @font-weight-bold;
    // 内容："追踪" 或 "TRACK"
}

// 方案 3：背景图 SVG
#tracker-drag-handle {
    background-image: url('data:image/svg+xml,...');
}
```

### 回归测试检查项
- [ ] 拖拽句柄显示正常
- [ ] 拖拽功能正常
- [ ] 点击展开/收起面板功能正常
- [ ] 悬停效果正常

---

## Story 10.7: 细节打磨与测试

### 用户故事
**作为** 开发者  
**我希望** 完成所有细节优化并充分测试  
**以便** 确保升级后功能完整、体验流畅

### 验收标准
- [ ] 所有 LESS 代码使用统一变量
- [ ] 所有内联样式移除或最小化
- [ ] CSS 编译正常，无错误
- [ ] 所有功能完整性测试通过
- [ ] 视觉对比测试通过
- [ ] 性能无退化
- [ ] 代码符合项目规范

### 完整功能测试清单

#### 基础功能
- [ ] 页面加载时 Visit Monitor 正常初始化
- [ ] 拖拽句柄正常显示
- [ ] 点击句柄展开/收起面板
- [ ] 拖拽功能正常移动面板位置

#### 追踪功能
- [ ] 加载保存的追踪列表
- [ ] 显示上次更新时间
- [ ] 显示辅导员列表和状态数字
- [ ] 点击数字按钮弹出详情弹窗
- [ ] 详情弹窗显示正确的数据
- [ ] 自动刷新功能正常工作

#### 编辑功能
- [ ] 点击"编辑列表"切换到编辑视图
- [ ] 编辑视图显示所有辅导员
- [ ] 点击 + 按钮添加辅导员到追踪列表
- [ ] 点击 - 按钮从追踪列表移除辅导员
- [ ] 点击"保存"保存修改并返回
- [ ] 点击"取消"放弃修改并返回
- [ ] 点击"返回"按钮正常切换视图

#### 多 Tab 同步（Epic 1 功能）
- [ ] 跨 Tab 数据同步正常
- [ ] BroadcastChannel 通信正常
- [ ] localStorage 缓存正常
- [ ] Tab 关闭时清理正常

#### 视觉测试
- [ ] 所有颜色正确显示
- [ ] 所有按钮正确显示
- [ ] 表格样式正确
- [ ] 悬停效果正确
- [ ] 过渡动画流畅
- [ ] 无视觉闪烁或跳动

#### 兼容性测试
- [ ] Chrome 浏览器测试通过
- [ ] Edge 浏览器测试通过
- [ ] Firefox 浏览器测试通过（如适用）
- [ ] 不同分辨率下正常显示

### 性能检查
- [ ] CSS 文件大小无显著增加
- [ ] 页面加载速度无退化
- [ ] 交互响应速度正常
- [ ] 内存使用无异常

### 代码质量检查
- [ ] LESS 代码无重复
- [ ] 使用语义化的 class 名称
- [ ] 代码注释清晰
- [ ] 符合项目代码规范
- [ ] Git diff 清晰易读

---

## 技术债务与风险

### 已知风险
1. **CSS 特异性冲突**：新样式可能与全局样式冲突
   - **缓解措施**：使用更高特异性的选择器，必要时使用 !important
   
2. **浏览器兼容性**：部分 CSS 特性可能不兼容旧浏览器
   - **缓解措施**：针对主要浏览器进行充分测试

3. **视觉回退**：用户可能不习惯新 UI
   - **缓解措施**：保留备份代码，可快速回滚

### 回滚计划
如果升级后发现严重问题，可以快速回滚：

1. **代码回滚**
   ```bash
   # 恢复 TypeScript 文件
   cp src/js/backup/VisitMonitor-pre-epic10.ts src/js/VisitMonitor.ts
   
   # 恢复样式文件
   cp src/style/coordinator-tracker-pre-epic10.less src/style/coordinator-tracker.less
   
   # 重新编译
   npm run build
   ```

2. **备份位置**
   - 代码备份：`src/js/backup/VisitMonitor-pre-epic10.ts`
   - 样式备份：`src/style/coordinator-tracker-pre-epic10.less`
   - Git 提交记录：Epic 10 前的最后一次提交

---

## 设计系统参考

本次升级严格遵循项目的统一设计系统，参考以下文件：

1. **颜色系统**：[src/style/variables.less](../../src/style/variables.less)
2. **QA Report 样式**：[src/style/qa-report-tab.less](../../src/style/qa-report-tab.less)
3. **Multi-Tab Panel 样式**：[src/style/multi-tab-panel.less](../../src/style/multi-tab-panel.less)

### 核心设计原则
- 使用 `@primary-gradient` 作为主要操作的背景
- 使用 `@background-white` 和 `@background-alt` 作为层次背景
- 使用 `@border-color` 统一边框颜色
- 使用 `@spacing-*` 变量统一间距
- 使用 `@radius-*` 变量统一圆角
- 使用 `@shadow-*` 变量统一阴影
- 使用 `@font-size-sm` (13px) 作为按钮和表格文字大小

---

## 附录：UI 升级前后对比图

### 整体面板对比

**升级前：**
```
┌─────────────────────────────────────────────────────────┐
│  🔔 (蓝色圆形)                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  ⏰ --:--:--        [编辑追踪列表] (灰色)        │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ ┌──┬────────┬────┬────┬────┬────┐                │ │
│  │ │编│辅导员  │上班│下班│异常│消息│                │ │
│  │ ├──┼────────┼────┼────┼────┼────┤                │ │
│  │ │1 │Tao Yang│ 0  │ 0  │ 0  │ 0  │                │ │
│  │ ├──┼────────┼────┼────┼────┼────┤                │ │
│  │ │2 │Tracy V.│ 0  │ 0  │ 10 │ 9  │                │ │
│  │ └──┴────────┴────┴────┴────┴────┘                │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**升级后：**
```
┌─────────────────────────────────────────────────────────┐
│  🔔 (渐变圆形)                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  ⏰ --:--:--        [📝 编辑列表] (渐变/边框)    │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  编号  辅导员      上班  下班  异常  消息        │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         │ │
│  │   1   Tao Yang      0    0    0    0            │ │
│  │  ─────────────────────────────────────────       │ │
│  │   2   Tracy V.      0    0    10   9   ← 悬停   │ │
│  │  ─────────────────────────────────────────       │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 按钮组对比

**编辑视图底部（升级前）：**
```
[取消] (灰色扁平)          [保存] (硬编码蓝色)
```

**编辑视图底部（升级后）：**
```
[取消] (边框按钮)          [💾 保存] (渐变按钮)
```

---

## Story 10.8: 编辑视图（编辑追踪列表）UI 升级

### 用户故事
**作为** 脚本用户  
**我希望** "编辑追踪列表"视图的 UI 与主视图保持一致的现代化风格  
**以便** 在编辑辅导员列表时获得统一的视觉体验

### 当前编辑视图分析

"编辑追踪列表"是一个独立视图，用户可以添加/删除要追踪的辅导员。当前设计存在以下问题：

#### 当前设计问题

1. **添加/删除按钮样式过时**
   - 使用 36px 圆形按钮（标准应该是 28px）
   - 硬编码颜色：绿色 `#28a745`（添加）、红色 `#dc3545`（删除）
   - 字体大小 18px 较大
   - 缺少悬停/按下反馈

2. **按钮尺寸不统一**
   - 编辑视图按钮：36px
   - 其他 UI 按钮：28px（标准）
   - 数字按钮：28px
   - 造成视觉不一致

3. **表格样式与主视图不一致**
   - 编辑视图可能使用不同的表格样式
   - 需要与 Story 10.3 保持一致

### 验收标准

#### 添加/删除按钮升级
- [ ] 按钮尺寸从 36px 调整为 28px（与其他圆形按钮统一）
- [ ] 字体大小从 18px 调整为 14px
- [ ] 保持绿色/红色主题色，但确保与设计系统协调
- [ ] 添加悬停效果：
  - [ ] 添加按钮悬停时：亮度提升，显示阴影
  - [ ] 删除按钮悬停时：亮度提升，显示阴影
- [ ] 添加按下效果：`transform: translateY(1px)`
- [ ] disabled 状态使用 `@background-disabled` 和降低 opacity

#### 表格样式统一
- [ ] 编辑视图表格样式与主视图保持一致（参考 Story 10.3）
- [ ] 使用细分割线代替全边框
- [ ] 添加行悬停高亮效果
- [ ] 使用统一的 spacing 变量设置内边距

#### 头部和底部按钮
- [ ] 头部返回按钮使用 `.tracker-btn-icon`（28px）
- [ ] 底部取消按钮使用 `.tracker-btn-secondary`
- [ ] 底部保存按钮使用 `.tracker-btn-primary`
- [ ] 按钮高度统一为 28px

#### 功能保持
- [ ] 添加辅导员功能完全正常
- [ ] 删除辅导员功能完全正常
- [ ] 保存修改功能完全正常
- [ ] 取消修改功能完全正常
- [ ] 返回主视图功能完全正常

### UI 设计对比

#### 升级前：编辑视图

```
┌─────────────────────────────────────────────────────────┐
│  [← 返回] (灰色扁平 36px)   编辑追踪列表                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 姓名                            操作            │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ Tao Yang                        [−] (红色 36px) │   │  ← 已在追踪列表
│  │ Tracy V.                        [+] (绿色 36px) │   │  ← 未在追踪列表
│  │ John Doe                        [+] (绿色 36px) │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [取消] (灰色扁平)              [保存] (硬编码蓝色)    │
└─────────────────────────────────────────────────────────┘
```

**问题点**：
- ❌ 返回按钮 36px（应该 28px）
- ❌ +/− 按钮 36px（应该 28px）
- ❌ 字体大小 18px 过大
- ❌ 硬编码颜色
- ❌ 表格全边框
- ❌ 无悬停效果

#### 升级后：编辑视图

```
┌─────────────────────────────────────────────────────────┐
│  [←] (图标按钮 28px)   编辑追踪列表                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 姓名                            操作            │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         │   │  ← 粗边框分割
│  │ Tao Yang                        [−] (28px)      │   │  ← 已在追踪
│  │ ─────────────────────────────────────────       │   │  ← 细分割线
│  │ Tracy V. (悬停高亮)              [+] (28px 悬停)│   │  ← 未追踪，悬停效果
│  │ ─────────────────────────────────────────       │   │
│  │ John Doe                        [+] (28px)      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [取消] (边框按钮)              [💾 保存] (渐变按钮)    │
└─────────────────────────────────────────────────────────┘
```

**改进点**：
- ✅ 所有按钮统一 28px
- ✅ 字体大小合理
- ✅ 使用设计系统变量
- ✅ 现代化表格样式
- ✅ 完整的悬停/按下效果

### 技术实现

#### 1. 添加/删除按钮样式升级

**当前样式（coordinator-tracker.less）：**
```less
.edit-list-actions button {
    font-size: 18px;        // ❌ 过大
    width: 36px;            // ❌ 不统一
    height: 36px;           // ❌ 不统一
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s;  // ❌ 仅过渡背景色
}

.edit-list-actions button.add-btn {
    background-color: #28a745;  // ❌ 硬编码
    color: white;
}

.edit-list-actions button.remove-btn {
    background-color: #dc3545;  // ❌ 硬编码
    color: white;
}

.edit-list-actions button:disabled {
    background-color: #ccc;     // ❌ 硬编码
    cursor: not-allowed;
}
```

**升级后样式：**
```less
// 编辑列表操作按钮（添加/删除）
.edit-list-actions button {
    font-size: 14px;              // ✅ 合理大小
    width: 28px;                  // ✅ 统一尺寸
    height: 28px;                 // ✅ 统一尺寸
    border: none;
    border-radius: @radius-round; // ✅ 使用变量
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all @transition-fast;  // ✅ 全属性过渡
    font-weight: @font-weight-semibold;
    
    // 悬停效果
    &:hover:not(:disabled) {
        filter: brightness(1.15);     // ✅ 亮度提升
        box-shadow: @shadow-button;   // ✅ 添加阴影
        transform: scale(1.05);       // ✅ 轻微放大
    }
    
    // 按下效果
    &:active:not(:disabled) {
        transform: translateY(1px) scale(1.05);  // ✅ 下压效果
    }
}

// 添加按钮（保持绿色主题，但优化设计）
.edit-list-actions button.add-btn {
    background-color: #28a745;  // 保持绿色（成功色）
    color: white;
    
    &:hover:not(:disabled) {
        background-color: #218838;  // 深绿色悬停
    }
}

// 删除按钮（保持红色主题，但优化设计）
.edit-list-actions button.remove-btn {
    background-color: #dc3545;  // 保持红色（危险色）
    color: white;
    
    &:hover:not(:disabled) {
        background-color: #c82333;  // 深红色悬停
    }
}

// 禁用状态
.edit-list-actions button:disabled {
    background-color: @background-disabled;  // ✅ 使用变量
    color: @text-disabled;                   // ✅ 使用变量
    cursor: not-allowed;
    opacity: 0.6;
    
    &:hover {
        filter: none;
        box-shadow: none;
        transform: none;
    }
}
```

#### 2. 编辑视图表格样式

**确保与主视图一致（参考 Story 10.3）：**
```less
// 编辑视图表格（如果有单独的表格class）
.editing-content table {
    width: 100%;
    border-collapse: collapse;
    
    th {
        background: @background-alt;
        color: @text-primary;
        font-weight: @font-weight-semibold;
        font-size: @font-size-sm;
        padding: @spacing-sm @spacing-md;
        text-align: left;
        border-bottom: 2px solid @border-color;  // 粗边框
    }
    
    tbody tr {
        border-bottom: 1px solid @border-color-light;  // 细分割线
        transition: background @transition-fast;
        
        &:hover {
            background: @background-hover;  // 悬停高亮
        }
    }
    
    td {
        padding: @spacing-sm @spacing-md;
        font-size: @font-size-sm;
        
        // 操作列右对齐
        &.edit-list-actions {
            text-align: right;
            padding-right: @spacing-md;
        }
    }
}
```

#### 3. 编辑视图头部和底部

**头部返回按钮：**
```html
<!-- 升级前 -->
<button id="back-btn" class="tracker-header-btn back-btn" style="font-size:20px">←</button>

<!-- 升级后 -->
<button id="back-btn" class="tracker-btn-icon tracker-btn-secondary">←</button>
```

**底部操作按钮（已在 Story 10.2 中定义）：**
```html
<!-- 取消按钮 -->
<button id="cancel-edit-btn" class="tracker-btn-secondary">取消</button>

<!-- 保存按钮 -->
<button id="save-edit-btn" class="tracker-btn-primary">💾 保存</button>
```

### 代码修改位置

#### TypeScript (VisitMonitor.ts)

**修改 renderEditingView() 函数（约第 2129 行）：**

```typescript
// 当前代码（简化）
const renderEditingView = () => {
    const allCoordinators = [...]; // 获取所有辅导员
    const rows = allCoordinators.map(c => {
        const isTracked = tempTrackedIds.has(c.id);
        const buttonClass = isTracked ? 'remove-btn' : 'add-btn';
        const buttonText = isTracked ? '−' : '+';
        
        return `
            <tr>
                <td>${c.name}</td>
                <td class="edit-list-actions">
                    <button class="${buttonClass}" data-id="${c.id}">
                        ${buttonText}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    return `
        <table>
            <thead><tr><th>姓名</th><th>操作</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
};
```

**代码无需大幅修改**，主要是 CSS 样式调整。仅需确保：
- 表格使用正确的 class
- 按钮 class 保持为 `add-btn` 和 `remove-btn`
- 操作列使用 `edit-list-actions` class

#### LESS (coordinator-tracker.less)

**需要修改的区域（约第 209-235 行）：**
- 替换 `.edit-list-actions button` 样式
- 更新 `.add-btn` 和 `.remove-btn` 样式
- 添加悬停/按下效果
- 统一尺寸为 28px

### 视觉效果演示

#### 添加按钮交互状态

```
正常：  [+] (绿色 #28a745, 28px×28px)
悬停：  [+] (亮绿 #218838, 阴影, scale(1.05))
按下：  [+] (亮绿, 下移 1px, scale(1.05))
禁用：  [+] (灰色, 透明度 0.6, 无悬停)
```

#### 删除按钮交互状态

```
正常：  [−] (红色 #dc3545, 28px×28px)
悬停：  [−] (深红 #c82333, 阴影, scale(1.05))
按下：  [−] (深红, 下移 1px, scale(1.05))
禁用：  [−] (灰色, 透明度 0.6, 无悬停)
```

### 回归测试检查项

#### 功能测试
- [ ] 点击"编辑列表"按钮切换到编辑视图
- [ ] 编辑视图显示所有辅导员列表
- [ ] 已追踪的辅导员显示红色 [−] 按钮
- [ ] 未追踪的辅导员显示绿色 [+] 按钮
- [ ] 点击 [+] 按钮正常添加到追踪列表
- [ ] 点击 [−] 按钮正常从追踪列表移除
- [ ] 临时修改保存在 tempTrackedIds 中
- [ ] 点击"保存"按钮正常应用修改
- [ ] 点击"取消"按钮正常放弃修改
- [ ] 点击返回按钮正常切换回主视图

#### 视觉测试
- [ ] 添加/删除按钮尺寸为 28px（使用开发者工具测量）
- [ ] 按钮字体大小合理（约 14px）
- [ ] 悬停时显示阴影和亮度提升
- [ ] 按下时有下压效果
- [ ] 表格行悬停高亮正常
- [ ] 表格使用细分割线（无全边框）
- [ ] 头部返回按钮为 28px
- [ ] 底部按钮样式统一

#### 兼容性测试
- [ ] 在 Chrome 中显示正常
- [ ] 在 Firefox 中显示正常
- [ ] 在 Edge 中显示正常
- [ ] 按钮触摸区域足够大（28px × 28px）
- [ ] 快速连续点击不会导致错误

### 注意事项

1. **保持功能完整性**
   - 编辑视图的核心逻辑完全不变
   - 仅升级视觉样式，不改变交互流程
   - tempTrackedIds 管理逻辑保持不变

2. **按钮尺寸调整**
   - 从 36px 降低到 28px 可能降低点击区域
   - 但 28px 对于鼠标操作已足够（符合 WCAG 标准）
   - 如果有触摸设备考虑，可保留 36px 或添加额外 padding

3. **颜色选择**
   - 绿色和红色是通用的成功/危险色
   - 保持现有色值以维持语义一致性
   - 但添加悬停时的深色变体提升交互反馈

4. **测试重点**
   - 重点测试添加/删除功能是否正常
   - 确认尺寸调整后按钮仍易于点击
   - 验证所有交互状态（正常/悬停/按下/禁用）

### 工时预估

- **CSS 样式修改**: 1 小时
  - 更新 .edit-list-actions button 基础样式
  - 添加悬停/按下效果
  - 统一表格样式
  
- **HTML 结构调整**: 0.5 小时
  - 更新头部返回按钮 class
  - 确认表格结构正确
  
- **测试和调优**: 1 小时
  - 功能回归测试
  - 视觉效果测试
  - 跨浏览器兼容性测试
  - 微调细节

**总计**: 2.5 小时

---

## Story 10.9: 详情列表弹窗 UI 统一升级

### 用户故事
**作为** 脚本用户  
**我希望** 详情列表弹窗的 UI 与主追踪面板保持一致的现代化风格  
**以便** 在查看详情时获得统一的视觉体验

### 背景说明

当用户点击追踪面板中的数字按钮（上班钟、下班钟、异常打钟、消息）时，会弹出"详情列表"模态窗口显示详细记录。当前这个弹窗的样式存在以下问题：

1. **所有颜色使用 inline styles**（`style="color: #333 !important;"`）
2. **弹窗样式未在 LESS 中定义**，依赖浏览器默认样式
3. **表格使用全边框设计**，与主视图不一致
4. **拉伸手柄太小**（16px），不易发现

**代码位置**：
- TypeScript: `src/js/VisitMonitor.ts` 第 2508-2685 行（showDetailsPopover 函数）
- 需要添加 LESS 样式到 `src/style/coordinator-tracker.less`

### 验收标准

#### 弹窗样式统一
- [ ] 移除所有 inline `style` 属性，使用 CSS 类
- [ ] 移除所有 `!important` 声明
- [ ] 弹窗使用统一的背景、边框、阴影（variables.less）
- [ ] 头部样式与主视图头部一致（高度 44px，flexbox 布局）
- [ ] 关闭按钮使用图标按钮样式（28px × 28px）

#### 表格样式现代化
- [ ] 表格应用 Story 10.3 的现代化样式
- [ ] 移除全边框，使用细分割线
- [ ] 表头使用浅色背景 + 粗边框
- [ ] 行悬停高亮效果
- [ ] 使用统一的 spacing 变量

#### 颜色系统统一
- [ ] 所有颜色使用 variables.less 变量
- [ ] 文字颜色：`@text-primary`、`@text-secondary`
- [ ] 背景色：`@background-white`、`@background-alt`
- [ ] 边框色：`@border-color`

#### 功能保持
- [ ] 拖拽功能正常
- [ ] 拉伸功能正常（右下角，Story 10.10 会增强）
- [ ] 关闭按钮正常
- [ ] 智能定位正常
- [ ] 表格滚动正常
- [ ] 数据显示完整

### UI 对比

#### 升级前
```
┌──────────────────────────────────────────────────────────┐
│  详情列表（只显示最新10条）(23 条记录)          ×      │  ← 简单文本
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐  │
│  │ Patient Name │ Assignment ID │ ... │ Coordinators │  │  ← 全边框
│  ├────────────────────────────────────────────────────┤  │
│  │ ZHENG KAILIU │ 904737        │ ... │ Tao Yang ... │  │  ← 硬编码颜色
│  └────────────────────────────────────────────────────┘  │
│                                              ◢ (16px)   │  ← 小手柄
└──────────────────────────────────────────────────────────┘
```

#### 升级后
```
┌──────────────────────────────────────────────────────────┐
│  📄 详情列表（只显示最新10条）(23 条记录)       [×]    │  ← 44px 头部
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐  │
│  │ Patient Name   Assignment ID   ...   Coordinators  │  │  ← 浅色背景
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │  │
│  │ ZHENG KAILIU   904737          ...   Tao Yang ... │  │  ← 变量色
│  │ ─────────────────────────────────────────────────  │  │  ← 细分割线
│  │ ... (悬停高亮)                                     │  │  ← 悬停效果
│  └────────────────────────────────────────────────────┘  │
│                                              ⋮⋮⋮        │  ← 明显手柄
└──────────────────────────────────────────────────────────┘
```

### 技术实现要点

#### 1. 添加弹窗 LESS 样式
```less
// 详情列表弹窗主容器
#details-popover {
    position: fixed;
    background: @background-white;
    border: 1px solid @border-color;
    border-radius: @radius-lg;
    box-shadow: @shadow-card;
    min-width: 600px;
    max-width: 90vw;
    min-height: 400px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    z-index: 100000;
}

.popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: @spacing-xs @spacing-md;
    background: @background-white;
    border-bottom: 1px solid @border-color;
    height: 44px;
    cursor: move;
}

.popover-close-btn {
    width: 28px;
    height: 28px;
    border: 1px solid @border-color;
    border-radius: @radius-sm;
    // ... 其他统一按钮样式
}

.popover-table {
    // 应用 Story 10.3 的现代化表格样式
}

.popover-resize-handle {
    width: 24px;  // 从 16px 增大到 24px
    height: 24px;
    // 添加可视化图标 "⋮⋮⋮"
}
```

#### 2. 移除 TypeScript 中的 inline styles
```typescript
// 移除所有 style="color: #333 !important;"
// 移除表头和单元格的硬编码样式
popover.innerHTML = `
    <div class="popover-header">
        <h4>详情列表...</h4>  <!-- 移除 style 属性 -->
        <button class="popover-close-btn">&times;</button>
    </div>
    <div class="popover-content">
        <table class="popover-table">${tableHtml}</table>
    </div>
    <div class="popover-resize-handle"></div>
`;
```

### 回归测试清单
- [ ] 点击数字按钮正常弹出详情列表
- [ ] 弹窗背景、边框、阴影样式正确
- [ ] 头部高度为 44px，布局正确
- [ ] 关闭按钮样式统一，功能正常
- [ ] 表格使用现代化样式（细分割线）
- [ ] 行悬停高亮效果正常
- [ ] 拖拽头部可移动弹窗
- [ ] 拖拽右下角可调整大小
- [ ] 表格滚动正常
- [ ] 电话号码悬浮提示正常
- [ ] 所有颜色使用变量，无硬编码

### 工时分解
- **CSS 样式添加**: 1.5 小时
- **移除 inline styles**: 1 小时
- **测试和调优**: 0.5 小时

**总计**: 3 小时

**详细文档**: [Epic 10 详情列表弹窗升级指南](../epic10/Detail-Modal-Upgrades.md)

---

## Story 10.10: 详情列表四边可拉伸功能

### 用户故事
**作为** 脚本用户  
**我希望** 详情列表弹窗的四个边和四个角都可以拉伸调整大小  
**以便** 在任何位置都能方便地调整弹窗尺寸，提升使用体验

### 背景说明

当前详情列表弹窗仅在**右下角**有一个拉伸手柄（`nwse-resize` 光标 ◢），存在以下问题：

1. **仅右下角可拉伸**，如果弹窗靠近屏幕右下角，手柄不可见或难以操作
2. **无法从其他方向拉伸**（上、下、左、右边缘）
3. **用户体验受限**，需要先移动弹窗才能拉伸

**期望目标**：实现**四边八点拉伸系统**：
- **4 条边**：上、下、左、右（8px 宽度响应区域）
- **4 个角**：左上、右上、左下、右下（16px × 16px）

**代码位置**：
- TypeScript: `src/js/VisitMonitor.ts` makeResizable 函数（第 2403-2460 行）
- 需要创建新的 makeMultiDirectionResizable 函数

### 验收标准

#### 四边拉伸功能
- [ ] 上边缘可向上拉伸（cursor: `n-resize` ↕）
- [ ] 下边缘可向下拉伸（cursor: `s-resize` ↕）
- [ ] 左边缘可向左拉伸（cursor: `w-resize` ↔）
- [ ] 右边缘可向右拉伸（cursor: `e-resize` ↔）

#### 四角拉伸功能
- [ ] 左上角可对角拉伸（cursor: `nw-resize` ◤）
- [ ] 右上角可对角拉伸（cursor: `ne-resize` ◥）
- [ ] 左下角可对角拉伸（cursor: `sw-resize` ◣）
- [ ] 右下角可对角拉伸（cursor: `se-resize` ◢）

#### 拉伸手柄设计
- [ ] 边缘手柄宽度为 8px（透明，仅响应区域）
- [ ] 角手柄尺寸为 16px × 16px
- [ ] 悬停时显示淡蓝色提示（可选）
- [ ] 手柄不影响拖拽功能

#### 拉伸逻辑
- [ ] 拉伸时保持最小尺寸（400px × 300px）
- [ ] 拉伸不超出视口边界
- [ ] 拉伸时防止文本选中
- [ ] 拉伸时添加透明遮罩防止 iframe 干扰

#### 功能兼容性
- [ ] 拖拽功能不受影响
- [ ] 原有右下角拉伸功能包含在新系统中
- [ ] 所有交互流畅无卡顿

### UI 设计

#### 四边八点拉伸布局
```
     ↕ (上边缘，8px 高)
┌─◤────────────────────────◥─┐  ← 左上角 16px, 右上角 16px
↔ │                          │ ↔  ← 左边缘 8px, 右边缘 8px
│ │   详情列表弹窗内容       │ │
↔ │                          │ ↔
└─◣────────────────────────◢─┘  ← 左下角 16px, 右下角 16px
     ↕ (下边缘，8px 高)
```

### 方向映射

| 方向代码 | 名称 | 光标 | 影响维度 |
|---------|------|------|---------|
| `n` | 北（上） | `n-resize` ↕ | height ↓, top ↑ |
| `s` | 南（下） | `s-resize` ↕ | height ↑ |
| `w` | 西（左） | `w-resize` ↔ | width ↓, left ↑ |
| `e` | 东（右） | `e-resize` ↔ | width ↑ |
| `nw` | 西北（左上） | `nw-resize` ◤ | width ↓, height ↓, top ↑, left ↑ |
| `ne` | 东北（右上） | `ne-resize` ◥ | width ↑, height ↓, top ↑ |
| `sw` | 西南（左下） | `sw-resize` ◣ | width ↓, height ↑, left ↑ |
| `se` | 东南（右下） | `se-resize` ◢ | width ↑, height ↑ |

### 技术实现要点

#### 1. 添加拉伸手柄 LESS 样式
```less
// 边缘拉伸手柄（透明响应区域）
.popover-resize-edge {
    position: absolute;
    background: transparent;
    z-index: 10;
    &:hover {
        background: rgba(102, 126, 234, 0.1);  // 淡蓝色提示
    }
}

// 四条边的样式
.popover-resize-edge-top { /* 上边缘 */ }
.popover-resize-edge-bottom { /* 下边缘 */ }
.popover-resize-edge-left { /* 左边缘 */ }
.popover-resize-edge-right { /* 右边缘 */ }

// 角手柄（覆盖边缘，优先级更高）
.popover-resize-corner {
    position: absolute;
    width: 16px;
    height: 16px;
    z-index: 11;
}

// 四个角的样式
.popover-resize-corner-nw { /* 左上角 */ }
.popover-resize-corner-ne { /* 右上角 */ }
.popover-resize-corner-sw { /* 左下角 */ }
.popover-resize-corner-se { /* 右下角 */ }
```

#### 2. 更新 HTML 结构
```typescript
popover.innerHTML = `
    <div class="popover-header">...</div>
    <div class="popover-content">...</div>
    
    <!-- 四条边的拉伸手柄 -->
    <div class="popover-resize-edge popover-resize-edge-top" data-direction="n"></div>
    <div class="popover-resize-edge popover-resize-edge-bottom" data-direction="s"></div>
    <div class="popover-resize-edge popover-resize-edge-left" data-direction="w"></div>
    <div class="popover-resize-edge popover-resize-edge-right" data-direction="e"></div>
    
    <!-- 四个角的拉伸手柄 -->
    <div class="popover-resize-corner popover-resize-corner-nw" data-direction="nw"></div>
    <div class="popover-resize-corner popover-resize-corner-ne" data-direction="ne"></div>
    <div class="popover-resize-corner popover-resize-corner-sw" data-direction="sw"></div>
    <div class="popover-resize-corner popover-resize-corner-se" data-direction="se"></div>
`;
```

#### 3. 创建 makeMultiDirectionResizable 函数
```typescript
function makeMultiDirectionResizable(element: HTMLElement) {
    const resizeHandles = element.querySelectorAll<HTMLElement>(
        '.popover-resize-edge, .popover-resize-corner'
    );
    
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', onMouseDown);
    });
    
    function onMouseDown(e: MouseEvent) {
        const handle = e.currentTarget as HTMLElement;
        const direction = handle.dataset.direction || '';
        
        // 根据方向计算新尺寸和位置
        // - 右边/下边：增加宽度/高度
        // - 左边/上边：调整位置 + 增加宽度/高度
        // - 角：组合两个方向的逻辑
    }
}
```

#### 4. 激活新的拉伸系统
```typescript
// 替换旧的单点拉伸
// const resizeHandle = popover.querySelector(".popover-resize-handle");
// if (resizeHandle) makeResizable(popover, resizeHandle);

// 使用新的多方向拉伸
makeMultiDirectionResizable(popover);
```

### 回归测试清单

#### 四边拉伸测试
- [ ] 上边缘：向上拖拽，高度增加，top 减少
- [ ] 下边缘：向下拖拽，高度增加，top 不变
- [ ] 左边缘：向左拖拽，宽度增加，left 减少
- [ ] 右边缘：向右拖拽，宽度增加，left 不变

#### 四角拉伸测试
- [ ] 左上角：对角拉伸，宽高同时变化，top/left 同时变化
- [ ] 右上角：对角拉伸，宽高同时变化，top 变化，left 不变
- [ ] 左下角：对角拉伸，宽高同时变化，top 不变，left 变化
- [ ] 右下角：对角拉伸，宽高同时变化，top/left 不变

#### 边界条件测试
- [ ] 最小尺寸限制（400px × 300px）正常工作
- [ ] 快速拖拽不会出现负数尺寸
- [ ] 拖拽到屏幕边缘时不超出视口

#### 交互冲突测试
- [ ] 拖拽头部移动弹窗仍然正常
- [ ] 拉伸时不会触发拖拽
- [ ] 拉伸手柄不干扰内容点击
- [ ] 关闭按钮不受影响

#### 视觉测试
- [ ] 光标在不同区域显示正确的 resize 图标
- [ ] 悬停时手柄区域有视觉提示（可选）
- [ ] 拉伸过程流畅无卡顿

### 工时分解
- **添加拉伸手柄 CSS**: 0.5 小时
- **实现多方向拉伸逻辑**: 2 小时
- **测试和调优**: 1 小时

**总计**: 3.5 小时

**详细文档**: [Epic 10 详情列表弹窗升级指南](../epic10/Detail-Modal-Upgrades.md)

---

## 相关文档

### Epic 10 辅助文档
- [Epic 10 README - 文档索引](../epic10/README.md)
- [Epic 10 详情列表弹窗升级指南](../epic10/Detail-Modal-Upgrades.md)
- [Epic 10 编辑视图 UI 升级指南](../epic10/Editing-View-UI-Upgrade.md)
- [UI 对比分析：VisitMonitor vs QAReport](../epic10/UI-Comparison.md)
- [UI 升级视觉设计预览](../epic10/UI-Preview.md)

### 相关 Epic
- [ADR 007: Multi-Tab Panel Architecture](../adr/007-multi-tab-panel-architecture.md)
- [Epic 1: Multi-Tab Sync](./epic-1-multi-tab-sync.md)
- [Epic 2: Visit Monitor Improvements](./epic-2-visit-monitor-improvements.md)
- [Epic 8: QA Report Feature](./epic-8-qa-report-feature.md)

---

**创建日期**: 2026-01-12  
**最后更新**: 2026-01-12  
**责任人**: Product Manager (John)  
**审批状态**: 待审批
