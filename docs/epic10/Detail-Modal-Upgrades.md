# Epic 10: 详情列表弹窗 UI 升级与功能增强

## 文档概述

本文档详细说明了 Visit Monitor "详情列表"弹窗的 UI 现代化升级和可拉伸功能增强。这是 Epic 10 的重要组成部分，涵盖两个新增的 Story：

- **Story 10.9**: 详情列表弹窗 UI 统一升级
- **Story 10.10**: 四边可拉伸功能实现

**相关文档**：
- [Epic 10 主文档](../stories/epic-10-visit-monitor-ui-upgrade.md)
- [Epic 10 README](./README.md)

---

## 1. 详情列表弹窗功能说明

### 1.1 弹窗触发方式

用户在追踪面板主视图中点击任意数字按钮（上班钟、下班钟、异常打钟、消息）时，会弹出"详情列表"模态窗口，显示该类型的详细记录列表。

### 1.2 弹窗结构

```
┌──────────────────────────────────────────────────────────┐
│  详情列表（只显示最新10条）(23 条记录)          [×]     │  ← 头部（可拖拽）
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐  │
│  │ Patient Name │ Assignment ID │ ... │ Coordinators │  │  ← 表格
│  ├────────────────────────────────────────────────────┤  │
│  │ ZHENG KAILIU │ 904737        │ ... │ Tao Yang ... │  │
│  │ ...                                                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                              ◢            │  ← 拉伸手柄（右下角）
└──────────────────────────────────────────────────────────┘
```

### 1.3 代码位置

**TypeScript 文件**：`src/js/VisitMonitor.ts`
- showDetailsPopover 函数：约第 2508-2685 行
- makeResizable 函数：约第 2403-2460 行
- makeDraggable 函数：约第 2253-2300 行

**当前实现**：
- 弹窗使用 inline styles（未在 LESS 中定义）
- 拖拽功能：通过头部拖拽移动弹窗
- 拉伸功能：仅右下角的 `.popover-resize-handle` 可拉伸

---

## 2. 当前设计问题分析

### 2.1 UI 样式问题

#### 问题 1: 硬编码颜色和样式

**当前实现（VisitMonitor.ts 约第 2632-2634 行）**：
```html
<div class="popover-header">
    <h4 style="color: #333 !important;">详情列表...</h4>
    <button class="popover-close-btn">&times;</button>
</div>
<div class="popover-content">
    <table class="popover-table">${tableHtml}</table>
</div>
<div class="popover-resize-handle"></div>
```

**表格单元格（约第 2606-2610 行）**：
```html
<td style="color: #333 !important;">${d.memberName}</td>
<td style="color: #333 !important;">${d.payerName}</td>
<td style="color: #333 !important;">${d.reason}</td>
```

**问题**：
- ❌ 所有颜色使用 inline `style="color: #333 !important;"`
- ❌ 未使用 variables.less 的设计系统
- ❌ `!important` 强制覆盖，难以维护
- ❌ 无法通过 CSS 统一调整样式

#### 问题 2: 弹窗样式未在 LESS 中定义

**当前实现（VisitMonitor.ts 约第 2509-2525 行）**：
```typescript
const popover = document.createElement("div");
popover.id = "details-popover";
// ... 没有对应的 CSS 类
```

弹窗样式完全依赖浏览器默认样式或 inline styles，缺少：
- 统一的背景色、边框、阴影
- 头部样式（背景、高度、padding）
- 表格样式（边框、悬停效果）
- 关闭按钮样式

#### 问题 3: 表格样式与主视图不一致

**当前状态**：
- 详情列表表格可能使用浏览器默认样式
- 与追踪面板主视图表格样式不统一
- 未应用 Story 10.3 的现代化表格样式

### 2.2 可拉伸功能问题

#### 问题 1: 仅右下角可拉伸

**当前实现（VisitMonitor.ts 约第 2649-2654 行）**：
```typescript
const resizeHandle = popover.querySelector(".popover-resize-handle");
if (resizeHandle) {
    makeResizable(popover, resizeHandle);
}
```

**CSS（需要添加到 coordinator-tracker.less）**：
```less
.popover-resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;  // ◢ 右下角箭头
}
```

**问题**：
- ❌ 只有右下角一个拉伸点
- ❌ 如果弹窗靠近屏幕右下角，右下角手柄不可见
- ❌ 无法从其他方向拉伸（上下左右边缘）
- ❌ 用户体验不佳

#### 问题 2: 拉伸手柄可见性差

**当前实现**：
```less
.popover-resize-handle {
    width: 16px;
    height: 16px;
    // 可能没有背景色，仅依赖 cursor 提示
}
```

**问题**：
- ❌ 手柄太小（16px × 16px）
- ❌ 没有明显的视觉提示
- ❌ 用户不易发现可拉伸功能

---

## 3. Story 10.9: 详情列表弹窗 UI 统一升级

### 3.1 用户故事

**作为** 脚本用户  
**我希望** 详情列表弹窗的 UI 与主追踪面板保持一致的现代化风格  
**以便** 在查看详情时获得统一的视觉体验

### 3.2 验收标准

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

### 3.3 UI 设计对比

#### 升级前：详情列表弹窗

```
┌──────────────────────────────────────────────────────────┐
│  详情列表（只显示最新10条）(23 条记录)          ×      │  ← 简单文本，无样式
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐  │
│  │ Patient Name │ Assignment ID │ ... │ Coordinators │  │  ← 全边框表格
│  ├────────────────────────────────────────────────────┤  │
│  │ ZHENG KAILIU │ 904737        │ ... │ Tao Yang ... │  │  ← 硬编码颜色
│  ├────────────────────────────────────────────────────┤  │
│  │ ...                                                 │  │  ← 无悬停效果
│  └────────────────────────────────────────────────────┘  │
│                                              ◢ (16px)   │  ← 小手柄，不明显
└──────────────────────────────────────────────────────────┘
```

**问题点**：
- ❌ 头部无背景色、无统一高度
- ❌ 关闭按钮仅为文本 "×"
- ❌ 表格全边框（老式设计）
- ❌ 无行悬停效果
- ❌ 拉伸手柄小且不明显

#### 升级后：详情列表弹窗

```
┌──────────────────────────────────────────────────────────┐
│  📄 详情列表（只显示最新10条）(23 条记录)       [×]    │  ← 白色背景，44px 高度，关闭按钮 28px
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐  │
│  │ Patient Name   Assignment ID   ...   Coordinators  │  │  ← 浅色背景，粗边框
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │  │
│  │ ZHENG KAILIU   904737          ...   Tao Yang ... │  │  ← 使用变量色
│  │ ─────────────────────────────────────────────────  │  │  ← 细分割线
│  │ ... (悬停高亮)                                     │  │  ← 悬停效果
│  └────────────────────────────────────────────────────┘  │
│                                              ⋮⋮⋮        │  ← 明显的拉伸图标
└──────────────────────────────────────────────────────────┘
```

**改进点**：
- ✅ 头部统一样式（白色背景，44px 高度）
- ✅ 图标按钮关闭（28px × 28px）
- ✅ 现代化表格样式（细分割线）
- ✅ 行悬停高亮
- ✅ 拉伸手柄更明显

### 3.4 技术实现

#### 1. 添加弹窗 CSS 类（coordinator-tracker.less）

```less
// ============================================
// 详情列表弹窗样式
// ============================================

// 弹窗主容器
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    
    // 淡入动画
    opacity: 0;
    transition: opacity @transition-fast;
    
    &.visible {
        opacity: 1;
    }
}

// 弹窗头部
.popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: @spacing-xs @spacing-md;
    background: @background-white;
    border-bottom: 1px solid @border-color;
    height: 44px;  // 与主视图头部统一
    box-sizing: border-box;
    cursor: move;  // 提示可拖拽
    flex-shrink: 0;
    
    h4 {
        margin: 0;
        font-size: @font-size-md;
        font-weight: @font-weight-semibold;
        color: @text-primary;
        display: flex;
        align-items: center;
        gap: @spacing-xs;
        
        // 图标（可选）
        &::before {
            content: "📄";  // 文档图标
            font-size: @font-size-lg;
        }
    }
}

// 关闭按钮
.popover-close-btn {
    width: 28px;
    height: 28px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 1px solid @border-color;
    border-radius: @radius-sm;
    color: @text-secondary;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    transition: all @transition-fast;
    
    &:hover {
        border-color: @primary-color;
        color: @primary-color;
        background: @primary-bg-light;
    }
    
    &:active {
        transform: translateY(1px);
    }
}

// 弹窗内容区域
.popover-content {
    flex: 1;
    overflow: auto;
    padding: @spacing-md;
    background: @background-white;
}

// 弹窗表格
.popover-table {
    width: 100%;
    border-collapse: collapse;
    font-size: @font-size-sm;
    
    // 表头
    thead {
        th {
            background: @background-alt;
            color: @text-primary;
            font-weight: @font-weight-semibold;
            padding: @spacing-sm @spacing-md;
            text-align: left;
            border-bottom: 2px solid @border-color;
            white-space: nowrap;
            position: sticky;
            top: 0;  // 表头固定
            z-index: 10;
        }
    }
    
    // 表格行
    tbody {
        tr {
            border-bottom: 1px solid @border-color-light;
            transition: background @transition-fast;
            
            &:hover {
                background: @background-hover;
            }
            
            &:last-child {
                border-bottom: none;
            }
        }
        
        td {
            padding: @spacing-sm @spacing-md;
            color: @text-primary;
            border: none;
            
            // 处理长文本
            &.note-cell {
                max-width: 300px;
                word-wrap: break-word;
            }
        }
    }
}

// 拉伸手柄（右下角）- Story 10.9
.popover-resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 24px;  // 从 16px 增大到 24px
    height: 24px;
    cursor: nwse-resize;
    
    // 添加可视化图标
    &::after {
        content: "⋮⋮⋮";
        position: absolute;
        right: 4px;
        bottom: 2px;
        font-size: 12px;
        color: @text-secondary;
        line-height: 1;
        letter-spacing: -2px;
        transform: rotate(-45deg);
        pointer-events: none;
    }
    
    &:hover::after {
        color: @primary-color;
    }
}

// 电话号码悬浮提示（保持现有功能）
.phone-icon-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: @spacing-xs;
    
    .phone-icon {
        font-size: 14px;
        cursor: help;
    }
    
    .phone-tooltip {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border: 1px solid @border-color;
        border-radius: @radius-sm;
        padding: @spacing-sm;
        box-shadow: @shadow-card;
        z-index: 1000;
        min-width: 200px;
        
        .phone-tooltip-item {
            display: flex;
            justify-content: space-between;
            padding: @spacing-xs 0;
            
            label {
                font-weight: @font-weight-medium;
                color: @text-secondary;
            }
            
            span {
                color: @text-primary;
            }
        }
    }
    
    &:hover .phone-tooltip {
        display: block;
    }
}
```

#### 2. 移除 HTML 中的 inline styles（VisitMonitor.ts）

**当前代码（约第 2632-2634 行）**：
```typescript
popover.innerHTML = `
    <div class="popover-header">
        <h4 style="color: #333 !important;">详情列表（只显示最新10条） (${data.count} 条记录)</h4>
        <button class="popover-close-btn">&times;</button>
    </div>
    <div class="popover-content">
        <table class="popover-table">${tableHtml}</table>
    </div>
    <div class="popover-resize-handle"></div>
`;
```

**升级后**：
```typescript
popover.innerHTML = `
    <div class="popover-header">
        <h4>详情列表（只显示最新10条） (${data.count} 条记录)</h4>
        <button class="popover-close-btn">&times;</button>
    </div>
    <div class="popover-content">
        <table class="popover-table">${tableHtml}</table>
    </div>
    <div class="popover-resize-handle"></div>
`;
```

**表格单元格（移除所有 inline styles）**：

**当前代码**：
```typescript
<td style="color: #333 !important;">${d.memberName}</td>
<td style="color: #333 !important;">${d.payerName}</td>
<td style="color: #333 !important;">${d.reason}</td>
```

**升级后**：
```typescript
<td>${d.memberName}</td>
<td>${d.payerName}</td>
<td>${d.reason}</td>
```

**表头（移除 inline styles）**：

**当前代码**：
```typescript
<th style="color: #333 !important;">Patient Name</th>
<th style="color: #333 !important;">Assignment ID</th>
```

**升级后**：
```typescript
<th>Patient Name</th>
<th>Assignment ID</th>
```

### 3.5 回归测试清单

#### 视觉测试
- [ ] 弹窗背景色为白色
- [ ] 边框使用统一的边框色
- [ ] 阴影效果正常
- [ ] 头部高度为 44px
- [ ] 关闭按钮为 28px × 28px
- [ ] 表格使用现代化样式（细分割线）
- [ ] 行悬停高亮正常
- [ ] 拉伸手柄可见且明显

#### 功能测试
- [ ] 点击数字按钮弹出详情列表
- [ ] 拖拽头部可移动弹窗
- [ ] 拖拽右下角可调整大小
- [ ] 关闭按钮正常关闭弹窗
- [ ] 表格滚动正常
- [ ] 电话号码悬浮提示正常

#### 兼容性测试
- [ ] Chrome 显示正常
- [ ] Firefox 显示正常
- [ ] Edge 显示正常

---

## 4. Story 10.10: 四边可拉伸功能实现

### 4.1 用户故事

**作为** 脚本用户  
**我希望** 详情列表弹窗的四个边和四个角都可以拉伸调整大小  
**以便** 在任何位置都能方便地调整弹窗尺寸，提升使用体验

### 4.2 当前限制

**当前实现**：
- 仅右下角 `.popover-resize-handle` 一个拉伸点
- 使用 `nwse-resize` 光标（右下角对角线箭头 ◢）
- `makeResizable` 函数仅支持单一手柄

**问题场景**：
1. 弹窗在屏幕右下角时，右下角手柄被遮挡或不可见
2. 需要向左拉伸时，必须先移动弹窗再拉伸
3. 需要向上拉伸时，无法实现

### 4.3 验收标准

#### 四边拉伸功能
- [ ] 上边缘可向上拉伸（cursor: `n-resize`）
- [ ] 下边缘可向下拉伸（cursor: `s-resize`）
- [ ] 左边缘可向左拉伸（cursor: `w-resize`）
- [ ] 右边缘可向右拉伸（cursor: `e-resize`）

#### 四角拉伸功能
- [ ] 左上角可对角拉伸（cursor: `nw-resize` ◤）
- [ ] 右上角可对角拉伸（cursor: `ne-resize` ◥）
- [ ] 左下角可对角拉伸（cursor: `sw-resize` ◣）
- [ ] 右下角可对角拉伸（cursor: `se-resize` ◢）

#### 拉伸手柄设计
- [ ] 边缘手柄宽度为 8px（不可见，仅响应区域）
- [ ] 角手柄尺寸为 16px × 16px
- [ ] 悬停时显示视觉提示（可选）
- [ ] 手柄不影响拖拽功能（仅在手柄区域触发拉伸）

#### 拉伸逻辑
- [ ] 拉伸时保持最小尺寸（400px × 300px）
- [ ] 拉伸不超出视口边界
- [ ] 拉伸时防止文本选中
- [ ] 拉伸时添加透明遮罩防止 iframe 干扰

#### 功能兼容性
- [ ] 拖拽功能不受影响
- [ ] 原有右下角拉伸仍然可用（作为角手柄的一部分）
- [ ] 所有交互流畅无卡顿

### 4.4 UI 设计

#### 四边八点拉伸布局

```
     ↕ (上边缘，8px 高)
┌─◤────────────────────────◥─┐  ← 左上角 16px, 右上角 16px
↔ │                          │ ↔  ← 左边缘 8px, 右边缘 8px
│ │   详情列表弹窗内容       │ │
│ │                          │ │
↔ │                          │ ↔
└─◣────────────────────────◢─┘  ← 左下角 16px, 右下角 16px
     ↕ (下边缘，8px 高)
```

**拉伸手柄说明**：
- **四条边**：8px 宽/高的透明拉伸区域
  - 上边：从左上角右侧到右上角左侧
  - 下边：从左下角右侧到右下角左侧
  - 左边：从左上角下方到左下角上方
  - 右边：从右上角下方到右下角上方

- **四个角**：16px × 16px 的拉伸区域
  - 优先级高于边缘（角覆盖边）
  - 提供对角拉伸功能

### 4.5 技术实现

#### 1. 添加拉伸手柄 CSS（coordinator-tracker.less）

```less
// ============================================
// 四边八点拉伸手柄 - Story 10.10
// ============================================

// 边缘拉伸手柄（透明响应区域）
.popover-resize-edge {
    position: absolute;
    background: transparent;  // 透明，仅响应交互
    z-index: 10;
    
    // 悬停时显示提示（可选）
    &:hover {
        background: rgba(102, 126, 234, 0.1);  // 淡蓝色提示
    }
}

// 上边缘
.popover-resize-edge-top {
    top: 0;
    left: 16px;      // 避开左上角
    right: 16px;     // 避开右上角
    height: 8px;
    cursor: n-resize;  // ↕ 上下箭头
}

// 下边缘
.popover-resize-edge-bottom {
    bottom: 0;
    left: 16px;      // 避开左下角
    right: 16px;     // 避开右下角
    height: 8px;
    cursor: s-resize;  // ↕ 上下箭头
}

// 左边缘
.popover-resize-edge-left {
    left: 0;
    top: 16px;       // 避开左上角
    bottom: 16px;    // 避开左下角
    width: 8px;
    cursor: w-resize;  // ↔ 左右箭头
}

// 右边缘
.popover-resize-edge-right {
    right: 0;
    top: 16px;       // 避开右上角
    bottom: 16px;    // 避开右下角
    width: 8px;
    cursor: e-resize;  // ↔ 左右箭头
}

// 角手柄（覆盖边缘，优先级更高）
.popover-resize-corner {
    position: absolute;
    width: 16px;
    height: 16px;
    z-index: 11;  // 高于边缘
    background: transparent;
    
    &:hover {
        background: rgba(102, 126, 234, 0.2);  // 角手柄悬停时更明显
    }
}

// 左上角 ◤
.popover-resize-corner-nw {
    top: 0;
    left: 0;
    cursor: nw-resize;
}

// 右上角 ◥
.popover-resize-corner-ne {
    top: 0;
    right: 0;
    cursor: ne-resize;
}

// 左下角 ◣
.popover-resize-corner-sw {
    bottom: 0;
    left: 0;
    cursor: sw-resize;
}

// 右下角 ◢
.popover-resize-corner-se {
    bottom: 0;
    right: 0;
    cursor: se-resize;
}
```

#### 2. 更新 HTML 结构（VisitMonitor.ts）

**当前代码（约第 2632-2636 行）**：
```typescript
popover.innerHTML = `
    <div class="popover-header">...</div>
    <div class="popover-content">...</div>
    <div class="popover-resize-handle"></div>  ← 仅右下角
`;
```

**升级后**：
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

#### 3. 重写 makeResizable 函数（VisitMonitor.ts）

**新的多方向拉伸函数**：

```typescript
/**
 * 使元素可以从四边八点拉伸调整大小
 * @param element 要调整大小的元素
 */
function makeMultiDirectionResizable(element: HTMLElement) {
    // 获取所有拉伸手柄
    const resizeHandles = element.querySelectorAll<HTMLElement>(
        '.popover-resize-edge, .popover-resize-corner'
    );
    
    let isResizing = false;
    let currentDirection = '';
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let startTop = 0;
    let startLeft = 0;
    let overlay: HTMLDivElement | null = null;
    
    // 最小尺寸
    const MIN_WIDTH = 400;
    const MIN_HEIGHT = 300;
    
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', onMouseDown);
    });
    
    function onMouseDown(e: MouseEvent) {
        const handle = e.currentTarget as HTMLElement;
        currentDirection = handle.dataset.direction || '';
        
        if (!currentDirection) return;
        
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = element.offsetWidth;
        startHeight = element.offsetHeight;
        startTop = element.offsetTop;
        startLeft = element.offsetLeft;
        
        // 创建透明遮罩防止 iframe 干扰
        overlay = document.createElement('div');
        overlay.style.cssText = 
            'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;cursor:inherit;';
        overlay.style.cursor = window.getComputedStyle(handle).cursor;
        document.body.appendChild(overlay);
        
        // 防止文本选中
        document.body.style.userSelect = 'none';
        
        document.addEventListener('mousemove', onMouseMove, true);
        document.addEventListener('mouseup', onMouseUp, true);
        
        e.preventDefault();
        e.stopPropagation();
    }
    
    function onMouseMove(e: MouseEvent) {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newTop = startTop;
        let newLeft = startLeft;
        
        // 根据方向计算新尺寸和位置
        if (currentDirection.includes('e')) {  // 右边（东）
            newWidth = Math.max(MIN_WIDTH, startWidth + deltaX);
        }
        if (currentDirection.includes('w')) {  // 左边（西）
            newWidth = Math.max(MIN_WIDTH, startWidth - deltaX);
            if (newWidth > MIN_WIDTH) {
                newLeft = startLeft + deltaX;
            }
        }
        if (currentDirection.includes('s')) {  // 下边（南）
            newHeight = Math.max(MIN_HEIGHT, startHeight + deltaY);
        }
        if (currentDirection.includes('n')) {  // 上边（北）
            newHeight = Math.max(MIN_HEIGHT, startHeight - deltaY);
            if (newHeight > MIN_HEIGHT) {
                newTop = startTop + deltaY;
            }
        }
        
        // 应用新尺寸和位置
        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;
        element.style.top = `${newTop}px`;
        element.style.left = `${newLeft}px`;
        
        e.preventDefault();
        e.stopPropagation();
    }
    
    function onMouseUp(e: MouseEvent) {
        if (!isResizing) return;
        
        isResizing = false;
        currentDirection = '';
        document.body.style.userSelect = '';
        
        if (overlay) {
            document.body.removeChild(overlay);
            overlay = null;
        }
        
        document.removeEventListener('mousemove', onMouseMove, true);
        document.removeEventListener('mouseup', onMouseUp, true);
        
        e.preventDefault();
        e.stopPropagation();
    }
}
```

#### 4. 更新弹窗激活代码（VisitMonitor.ts）

**当前代码（约第 2649-2654 行）**：
```typescript
// 激活调整大小功能
const resizeHandle = popover.querySelector(".popover-resize-handle") as HTMLElement;
if (resizeHandle) {
    makeResizable(popover, resizeHandle);  // 旧函数
}
```

**升级后**：
```typescript
// 激活四边八点拉伸功能
makeMultiDirectionResizable(popover);  // 新函数
```

### 4.6 拉伸逻辑详解

#### 方向映射

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

#### 计算公式

**右边缘拉伸（e）**：
```typescript
newWidth = startWidth + deltaX;
// 位置不变
```

**左边缘拉伸（w）**：
```typescript
newWidth = startWidth - deltaX;   // 向左拉伸，宽度增加
newLeft = startLeft + deltaX;     // 左边界向左移动
```

**下边缘拉伸（s）**：
```typescript
newHeight = startHeight + deltaY;
// 位置不变
```

**上边缘拉伸（n）**：
```typescript
newHeight = startHeight - deltaY;  // 向上拉伸，高度增加
newTop = startTop + deltaY;        // 上边界向上移动
```

**右下角拉伸（se）**：
```typescript
newWidth = startWidth + deltaX;
newHeight = startHeight + deltaY;
// 位置不变
```

**左上角拉伸（nw）**：
```typescript
newWidth = startWidth - deltaX;
newHeight = startHeight - deltaY;
newLeft = startLeft + deltaX;
newTop = startTop + deltaY;
```

### 4.7 回归测试清单

#### 四边拉伸测试
- [ ] 上边缘拉伸：向上拖拽，高度增加，top 减少
- [ ] 下边缘拉伸：向下拖拽，高度增加，top 不变
- [ ] 左边缘拉伸：向左拖拽，宽度增加，left 减少
- [ ] 右边缘拉伸：向右拖拽，宽度增加，left 不变

#### 四角拉伸测试
- [ ] 左上角拉伸：对角拉伸，宽高同时变化，top/left 同时变化
- [ ] 右上角拉伸：对角拉伸，宽高同时变化，top 变化，left 不变
- [ ] 左下角拉伸：对角拉伸，宽高同时变化，top 不变，left 变化
- [ ] 右下角拉伸：对角拉伸，宽高同时变化，top/left 不变

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

---

## 5. 实施计划

### 5.1 Story 10.9: 详情列表 UI 升级

#### 阶段 1: CSS 样式添加（1.5 小时）

```
1. 在 coordinator-tracker.less 添加：
   - #details-popover 主容器样式
   - .popover-header 头部样式
   - .popover-close-btn 关闭按钮样式
   - .popover-content 内容区域样式
   - .popover-table 表格样式（现代化）
   - .popover-resize-handle 拉伸手柄样式（增强）

2. 测试：
   - 刷新页面
   - 点击数字按钮
   - 检查弹窗样式是否正常
```

#### 阶段 2: 移除 inline styles（1 小时）

```
1. 修改 VisitMonitor.ts：
   - 头部 h4：移除 style="color: #333 !important;"
   - 表头 th：移除所有 style 属性
   - 表格单元格 td：移除所有 style 属性

2. 验证：
   - 所有文字颜色正常
   - 表格样式正常
   - 无样式断层
```

#### 阶段 3: 测试和调优（0.5 小时）

```
1. 功能回归测试：
   - 弹窗显示正常
   - 拖拽功能正常
   - 拉伸功能正常
   - 关闭按钮正常

2. 视觉测试：
   - 与主视图样式一致
   - 表格悬停效果正常
   - 跨浏览器兼容

**总计**: 3 小时
```

### 5.2 Story 10.10: 四边可拉伸功能

#### 阶段 1: 添加拉伸手柄 CSS（0.5 小时）

```
1. 在 coordinator-tracker.less 添加：
   - .popover-resize-edge（四条边）
   - .popover-resize-corner（四个角）
   - 各个方向的具体样式

2. 测试：
   - 手柄位置正确
   - 光标显示正确
```

#### 阶段 2: 实现多方向拉伸逻辑（2 小时）

```
1. 创建 makeMultiDirectionResizable 函数：
   - 监听所有手柄的 mousedown 事件
   - 根据方向计算新尺寸和位置
   - 添加透明遮罩防止干扰
   - 防止文本选中

2. 更新 HTML 结构：
   - 添加 8 个拉伸手柄元素
   - 设置 data-direction 属性

3. 激活新函数：
   - 替换旧的 makeResizable 调用
```

#### 阶段 3: 测试和调优（1 小时）

```
1. 四边八点拉伸测试
2. 边界条件测试
3. 交互冲突测试
4. 性能测试

**总计**: 3.5 小时
```

### 5.3 总体时间规划

| Story | 任务 | 工时 |
|-------|------|------|
| 10.9 | 详情列表 UI 升级 | 3h |
| 10.10 | 四边可拉伸功能 | 3.5h |
| **总计** | | **6.5h** |

---

## 6. 回滚方案

### 6.1 Story 10.9 回滚

如果 UI 升级后出现问题：

```bash
# 恢复 LESS 文件
git checkout src/style/coordinator-tracker.less

# 恢复 TypeScript 文件中的 inline styles
# 手动恢复或从备份文件恢复相关部分
```

### 6.2 Story 10.10 回滚

如果四边拉伸功能有问题：

```typescript
// 1. 注释掉新的拉伸函数调用
// makeMultiDirectionResizable(popover);

// 2. 恢复旧的单点拉伸
const resizeHandle = popover.querySelector(".popover-resize-handle") as HTMLElement;
if (resizeHandle) {
    makeResizable(popover, resizeHandle);
}

// 3. 移除 HTML 中的 8 个新增手柄元素
// 保留 <div class="popover-resize-handle"></div>
```

---

## 7. 常见问题 (FAQ)

### Q1: 为什么要移除所有 inline styles？

**A**: 原因有三：
1. **可维护性**：inline styles 分散在代码各处，难以统一修改
2. **!important 问题**：强制覆盖导致后续样式调整困难
3. **设计系统一致性**：无法使用 variables.less 的统一变量

### Q2: 四边拉伸会不会影响性能？

**A**: 不会。拉伸逻辑与原单点拉伸基本相同，只是增加了方向判断。关键优化点：
- 使用事件委托（8个手柄共用一套逻辑）
- 使用 `true` 捕获模式防止事件冒泡
- 拉伸结束后及时清理事件监听器

### Q3: 拉伸手柄会不会干扰内容点击？

**A**: 不会。设计上：
- 边缘手柄宽度仅 8px，位于边框附近
- 角手柄 16px × 16px，位于角落
- 手柄 z-index 设置合理，不遮挡内容
- 透明设计，不影响视觉

### Q4: 如果弹窗很小，手柄会重叠吗？

**A**: 不会。代码中设置了最小尺寸（400px × 300px），确保：
- 边缘手柄有足够空间不重叠
- 角手柄 16px 不会占据过多空间
- 如果需要更小尺寸，可以调整 MIN_WIDTH/MIN_HEIGHT

### Q5: 拉伸时为什么需要透明遮罩？

**A**: 防止页面中的 iframe 或其他元素捕获鼠标事件。HHAExchange 页面可能包含 iframe，没有遮罩会导致：
- 鼠标移动事件丢失
- 拉伸卡顿或中断
- 光标显示错误

---

## 8. 附录

### 8.1 完整的方向拉伸逻辑代码

```typescript
function makeMultiDirectionResizable(element: HTMLElement) {
    // [完整代码见 4.5 节第 3 部分]
}
```

### 8.2 拉伸手柄 HTML 完整示例

```html
<div id="details-popover">
    <div class="popover-header">
        <h4>详情列表（只显示最新10条）(23 条记录)</h4>
        <button class="popover-close-btn">&times;</button>
    </div>
    <div class="popover-content">
        <table class="popover-table">
            <!-- 表格内容 -->
        </table>
    </div>
    
    <!-- 四条边 -->
    <div class="popover-resize-edge popover-resize-edge-top" data-direction="n"></div>
    <div class="popover-resize-edge popover-resize-edge-bottom" data-direction="s"></div>
    <div class="popover-resize-edge popover-resize-edge-left" data-direction="w"></div>
    <div class="popover-resize-edge popover-resize-edge-right" data-direction="e"></div>
    
    <!-- 四个角 -->
    <div class="popover-resize-corner popover-resize-corner-nw" data-direction="nw"></div>
    <div class="popover-resize-corner popover-resize-corner-ne" data-direction="ne"></div>
    <div class="popover-resize-corner popover-resize-corner-sw" data-direction="sw"></div>
    <div class="popover-resize-corner popover-resize-corner-se" data-direction="se"></div>
</div>
```

---

**文档版本**: 1.0  
**创建日期**: 2026-01-12  
**最后更新**: 2026-01-12  
**责任人**: Product Manager (John)  
**审批状态**: 待审批

**相关 Story**: 
- [Story 10.9: 详情列表弹窗 UI 统一升级](#3-story-109-详情列表弹窗-ui-统一升级)
- [Story 10.10: 四边可拉伸功能实现](#4-story-1010-四边可拉伸功能实现)
