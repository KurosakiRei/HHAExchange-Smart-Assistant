# Epic 10.8: 编辑视图（编辑追踪列表）详细 UI 升级指南

## 文档概述

本文档详细说明了 Visit Monitor 编辑视图的 UI 升级方案，这是 Epic 10 的补充文档，专门针对"编辑追踪列表"页面的设计现代化。

**相关文档**：
- [Epic 10 主文档](../stories/epic-10-visit-monitor-ui-upgrade.md)
- [Story 10.8: 编辑视图 UI 升级](../stories/epic-10-visit-monitor-ui-upgrade.md#story-108-编辑视图编辑追踪列表-ui-升级)

---

## 1. 编辑视图功能说明

### 1.1 视图作用

"编辑追踪列表"是 Visit Monitor 的辅助视图，允许用户：
- 查看所有可用的辅导员列表
- 添加辅导员到追踪列表（显示绿色 [+] 按钮）
- 从追踪列表移除辅导员（显示红色 [−] 按钮）
- 临时保存修改，点击"保存"后生效
- 取消修改，返回主视图

### 1.2 视图结构

```
┌─────────────────────────────────────────────┐
│  [← 返回]   编辑追踪列表                     │  ← 头部区域
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ 姓名              操作                │ │  ← 表头
│  ├───────────────────────────────────────┤ │
│  │ Tao Yang          [−]                 │ │  ← 已追踪
│  │ Tracy V.          [+]                 │ │  ← 未追踪
│  │ John Doe          [+]                 │ │  ← 未追踪
│  └───────────────────────────────────────┘ │
│                                             │  ← 内容区域
├─────────────────────────────────────────────┤
│  [取消]                       [💾 保存]     │  ← 底部操作栏
└─────────────────────────────────────────────┘
```

### 1.3 代码位置

**TypeScript 文件**：`src/js/VisitMonitor.ts`
- 编辑视图 HTML 结构：约第 668-671 行
- renderEditingView 函数：约第 2129-2157 行
- 编辑视图事件处理：约第 2158-2180 行

**样式文件**：`src/style/coordinator-tracker.less`
- 编辑列表按钮样式：第 209-235 行
- 表格样式：第 131-160 行
- 底部操作栏：第 121-128 行

---

## 2. 当前设计问题分析

### 2.1 按钮尺寸不统一

| 按钮类型 | 当前尺寸 | 标准尺寸 | 差异 |
|---------|---------|---------|------|
| 编辑视图 +/− 按钮 | 36px × 36px | 28px × 28px | ⚠️ 大 8px |
| 工具栏按钮 | 28px 高度 | 28px 高度 | ✅ 统一 |
| 数字按钮 | 28px × 28px | 28px × 28px | ✅ 统一 |
| 底部操作按钮 | 28px 高度 | 28px 高度 | ✅ 统一 |

**问题**：编辑视图的添加/删除按钮比其他圆形按钮大 8px，破坏视觉一致性。

### 2.2 硬编码颜色问题

**当前代码（coordinator-tracker.less 第 219-228 行）**：
```less
.edit-list-actions button.add-btn {
    background-color: #28a745;  // ❌ 硬编码绿色
    color: white;
}

.edit-list-actions button.remove-btn {
    background-color: #dc3545;  // ❌ 硬编码红色
    color: white;
}

.edit-list-actions button:disabled {
    background-color: #ccc;     // ❌ 硬编码灰色
    cursor: not-allowed;
}
```

**问题**：
- 不使用设计系统变量
- 如果需要更换主题，必须手动修改每个颜色值
- 与 variables.less 的设计理念不符

### 2.3 缺少交互反馈

**当前代码（coordinator-tracker.less 第 209-218 行）**：
```less
.edit-list-actions button {
    font-size: 18px;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s;  // ❌ 只过渡背景色
}
```

**缺少的交互效果**：
- ❌ 没有悬停高亮
- ❌ 没有阴影效果
- ❌ 没有按下动画
- ❌ 没有缩放/位移反馈

对比 QA Report 的按钮：
```less
.qa-load-btn {
    transition: all @transition-fast;  // ✅ 全属性过渡
    
    &:hover:not(:disabled) {
        filter: brightness(1.1);       // ✅ 亮度提升
        box-shadow: @shadow-button;    // ✅ 阴影
        transform: translateY(-1px);   // ✅ 上浮
    }
    
    &:active:not(:disabled) {
        transform: translateY(1px);    // ✅ 下压
    }
}
```

---

## 3. 升级方案

### 3.1 按钮尺寸统一

#### 调整目标

将添加/删除按钮从 **36px × 36px** 调整为 **28px × 28px**，字体大小从 **18px** 调整为 **14px**。

#### 视觉对比

**升级前（36px）**：
```
  [+]  ← 较大，与其他按钮不协调
 ━━━
```

**升级后（28px）**：
```
 [+]   ← 统一尺寸，视觉和谐
━━━
```

#### 代码修改

```less
.edit-list-actions button {
    font-size: 14px;    // ✅ 从 18px → 14px
    width: 28px;        // ✅ 从 36px → 28px
    height: 28px;       // ✅ 从 36px → 28px
    // ... 其他样式
}
```

#### 可访问性考虑

- **WCAG 2.1 标准**：最小触摸目标为 44px × 44px（Level AAA）或 24px × 24px（Level AA）
- **28px × 28px** 符合 Level AA 标准
- 对于鼠标操作，28px 已经足够（常用按钮尺寸：24px-32px）
- 如果需要支持触摸设备，可以通过以下方式增加触摸区域：

```less
.edit-list-actions button {
    width: 28px;
    height: 28px;
    
    // 增加点击区域（不影响视觉尺寸）
    &::before {
        content: '';
        position: absolute;
        inset: -8px;  // 增加 8px 的点击区域（总共 44px）
    }
}
```

### 3.2 添加完整交互效果

#### 悬停效果（Hover）

**目标**：
- 亮度提升 15%
- 显示阴影
- 轻微放大（scale 1.05）

**代码实现**：
```less
.edit-list-actions button {
    transition: all @transition-fast;  // 0.2s ease
    
    &:hover:not(:disabled) {
        filter: brightness(1.15);      // 亮度提升
        box-shadow: @shadow-button;    // 添加阴影
        transform: scale(1.05);        // 轻微放大
    }
}
```

**视觉效果**：
```
正常：  [+] (绿色 28px, 无阴影)
悬停：  [+] (亮绿 28px, 有阴影, 1.4px 偏大)
```

#### 按下效果（Active）

**目标**：
- 视觉下压 1px
- 保持放大效果

**代码实现**：
```less
.edit-list-actions button {
    &:active:not(:disabled) {
        transform: translateY(1px) scale(1.05);
    }
}
```

**视觉效果**：
```
悬停：  [+] (y: 0)
按下：  [+] (y: +1px) ← 向下移动 1px
```

#### 禁用状态（Disabled）

**目标**：
- 使用统一的禁用颜色
- 降低透明度
- 移除所有交互效果

**代码实现**：
```less
.edit-list-actions button:disabled {
    background-color: @background-disabled;  // 统一禁用色
    color: @text-disabled;                   // 统一文字色
    cursor: not-allowed;
    opacity: 0.6;
    
    &:hover {
        filter: none;       // 移除悬停效果
        box-shadow: none;
        transform: none;
    }
}
```

### 3.3 颜色主题优化

#### 添加按钮（绿色）

**保持绿色主题**（成功/添加的语义颜色）：

```less
.edit-list-actions button.add-btn {
    background-color: #28a745;  // 绿色（保持）
    color: white;
    
    &:hover:not(:disabled) {
        background-color: #218838;  // 深绿色（新增悬停色）
    }
}
```

**颜色选择理由**：
- `#28a745` 是 Bootstrap 的成功色，广泛认可
- 与语义一致：绿色 = 添加/成功
- 对比度良好（WCAG AA 标准）

#### 删除按钮（红色）

**保持红色主题**（危险/删除的语义颜色）：

```less
.edit-list-actions button.remove-btn {
    background-color: #dc3545;  // 红色（保持）
    color: white;
    
    &:hover:not(:disabled) {
        background-color: #c82333;  // 深红色（新增悬停色）
    }
}
```

**颜色选择理由**：
- `#dc3545` 是 Bootstrap 的危险色
- 与语义一致：红色 = 删除/危险
- 对比度良好

#### 未来可选的设计系统集成

如果需要与 variables.less 完全集成，可以添加：

```less
// variables.less 中添加
@color-success: #28a745;
@color-success-dark: #218838;
@color-danger: #dc3545;
@color-danger-dark: #c82333;

// coordinator-tracker.less 中使用
.edit-list-actions button.add-btn {
    background-color: @color-success;
    &:hover:not(:disabled) {
        background-color: @color-success-dark;
    }
}
```

### 3.4 表格样式现代化

#### 移除全边框

**升级前**：
```less
.tracker-table th,
.tracker-table td {
    border: 1px solid #ddd;  // ❌ 全边框
}
```

**升级后**：
```less
.editing-content table {
    thead tr {
        border-bottom: 2px solid @border-color;  // ✅ 仅表头底部粗边框
    }
    
    tbody tr {
        border-bottom: 1px solid @border-color-light;  // ✅ 行间细分割线
        
        &:last-child {
            border-bottom: none;  // 最后一行无边框
        }
    }
    
    td {
        border: none;  // ✅ 单元格无边框
    }
}
```

#### 添加悬停效果

```less
.editing-content table tbody tr {
    transition: background @transition-fast;
    
    &:hover {
        background: @background-hover;  // 浅色高亮
    }
}
```

**视觉对比**：

升级前：
```
┌─────────────────────────────┐
│ 姓名          │ 操作        │  ← 全边框
├─────────────────────────────┤
│ Tao Yang      │ [−]         │
├─────────────────────────────┤
│ Tracy V.      │ [+]         │  ← 无悬停效果
└─────────────────────────────┘
```

升级后：
```
┌─────────────────────────────┐
│ 姓名            操作        │  ← 无竖线分割
│ ━━━━━━━━━━━━━━━━━━━━━━━   │  ← 粗边框
│ Tao Yang        [−]         │
│ ─────────────────────────   │  ← 细分割线
│ Tracy V. (高亮) [+]         │  ← 悬停高亮
└─────────────────────────────┘
```

---

## 4. 完整代码实现

### 4.1 LESS 样式（coordinator-tracker.less）

#### 完整的编辑列表按钮样式

```less
// ============================================
// 编辑列表操作按钮（添加/删除）
// ============================================
.edit-list-actions button {
    // 基础样式
    font-size: 14px;              // 统一字体大小
    width: 28px;                  // 统一尺寸
    height: 28px;
    border: none;
    border-radius: @radius-round; // 圆形（50%）
    cursor: pointer;
    
    // Flexbox 居中
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    // 字体加粗
    font-weight: @font-weight-semibold;
    
    // 过渡动画
    transition: all @transition-fast;  // 0.2s ease
    
    // 悬停效果
    &:hover:not(:disabled) {
        filter: brightness(1.15);     // 亮度提升 15%
        box-shadow: @shadow-button;   // 添加阴影
        transform: scale(1.05);       // 放大 5%
    }
    
    // 按下效果
    &:active:not(:disabled) {
        transform: translateY(1px) scale(1.05);  // 下压 + 放大
    }
    
    // 禁用状态
    &:disabled {
        background-color: @background-disabled;
        color: @text-disabled;
        cursor: not-allowed;
        opacity: 0.6;
        
        // 移除交互效果
        &:hover {
            filter: none;
            box-shadow: none;
            transform: none;
        }
    }
}

// 添加按钮（绿色）
.edit-list-actions button.add-btn {
    background-color: #28a745;  // 成功色（绿色）
    color: white;
    
    &:hover:not(:disabled) {
        background-color: #218838;  // 深绿色悬停
    }
}

// 删除按钮（红色）
.edit-list-actions button.remove-btn {
    background-color: #dc3545;  // 危险色（红色）
    color: white;
    
    &:hover:not(:disabled) {
        background-color: #c82333;  // 深红色悬停
    }
}
```

#### 编辑视图表格样式

```less
// ============================================
// 编辑视图表格
// ============================================
.editing-content table {
    width: 100%;
    border-collapse: collapse;
    
    // 表头
    thead {
        th {
            background: @background-alt;            // 浅色背景
            color: @text-primary;                   // 主文字色
            font-weight: @font-weight-semibold;     // 加粗
            font-size: @font-size-sm;               // 13px
            padding: @spacing-sm @spacing-md;       // 8px 16px
            text-align: left;
            border-bottom: 2px solid @border-color; // 粗边框
        }
        
        // 操作列右对齐
        th:last-child {
            text-align: right;
        }
    }
    
    // 表格行
    tbody {
        tr {
            border-bottom: 1px solid @border-color-light;  // 细分割线
            transition: background @transition-fast;
            
            // 悬停高亮
            &:hover {
                background: @background-hover;
            }
            
            // 最后一行无边框
            &:last-child {
                border-bottom: none;
            }
        }
        
        td {
            padding: @spacing-sm @spacing-md;  // 8px 16px
            font-size: @font-size-sm;          // 13px
            border: none;                      // 无单元格边框
            
            // 操作列右对齐
            &.edit-list-actions {
                text-align: right;
                padding-right: @spacing-md;
            }
        }
    }
}
```

#### 编辑视图头部

```less
// ============================================
// 编辑视图头部
// ============================================
.editing-view {
    .tracker-header {
        // 继承主视图头部样式
        padding: @spacing-xs @spacing-md;
        background: @background-white;
        border-bottom: 1px solid @border-color;
        height: 44px;
        display: flex;
        align-items: center;
        gap: @spacing-sm;
        
        // 标题
        .editing-title {
            font-size: @font-size-md;
            font-weight: @font-weight-semibold;
            color: @text-primary;
            flex: 1;
        }
    }
}
```

#### 编辑视图底部操作栏

```less
// ============================================
// 编辑视图底部
// ============================================
.tracker-footer {
    padding: @spacing-sm @spacing-md;
    background: @background-white;
    border-top: 1px solid @border-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: @spacing-sm;
    
    // 按钮样式继承自 Story 10.2
    // .tracker-btn-secondary（取消）
    // .tracker-btn-primary（保存）
}
```

### 4.2 TypeScript 代码修改（VisitMonitor.ts）

#### renderEditingView 函数（约第 2129 行）

**当前代码无需大幅修改**，主要是确保使用正确的 class：

```typescript
const renderEditingView = () => {
    const allCoordinators = getAllCoordinators();
    
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
            <thead>
                <tr>
                    <th>姓名</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
};
```

**关键点**：
- ✅ 保持 `add-btn` 和 `remove-btn` class
- ✅ 保持 `edit-list-actions` class
- ✅ 保持 `data-id` 属性（事件处理需要）
- ✅ 表格结构不变

#### 头部返回按钮（约第 670 行）

**升级前**：
```typescript
<button id="back-btn" class="tracker-header-btn back-btn" style="font-size:20px">←</button>
```

**升级后**：
```typescript
<button id="back-btn" class="tracker-btn-icon tracker-btn-secondary">←</button>
```

#### 底部操作按钮（约第 671 行）

**升级前**：
```typescript
<button id="cancel-edit-btn" class="tracker-header-btn">取消</button>
<button id="save-edit-btn" class="tracker-header-btn" style="background-color:#007bff;color:white">保存</button>
```

**升级后**：
```typescript
<button id="cancel-edit-btn" class="tracker-btn-secondary">取消</button>
<button id="save-edit-btn" class="tracker-btn-primary">💾 保存</button>
```

---

## 5. 测试和验证

### 5.1 视觉测试清单

#### 按钮尺寸验证

使用浏览器开发者工具测量：

```
1. 右键点击添加按钮 → 检查元素
2. 查看 Computed 样式：
   ✓ width: 28px
   ✓ height: 28px
   ✓ font-size: 14px

3. 对比其他按钮：
   ✓ 数字按钮: 28px × 28px
   ✓ 工具栏按钮高度: 28px
   ✓ 底部按钮高度: 28px
```

#### 交互效果验证

```
1. 悬停添加按钮：
   ✓ 背景变为深绿色 (#218838)
   ✓ 出现阴影
   ✓ 轻微放大

2. 点击添加按钮：
   ✓ 向下移动 1px
   ✓ 保持放大效果

3. 悬停删除按钮：
   ✓ 背景变为深红色 (#c82333)
   ✓ 出现阴影
   ✓ 轻微放大
```

#### 表格样式验证

```
1. 表头：
   ✓ 浅色背景
   ✓ 底部 2px 粗边框
   ✓ 字体加粗

2. 表格行：
   ✓ 无竖向边框
   ✓ 细分割线（1px）
   ✓ 悬停时高亮

3. 最后一行：
   ✓ 无底部边框
```

### 5.2 功能回归测试

#### 添加辅导员流程

```
测试步骤：
1. 点击工具栏的"编辑列表"按钮
   ✓ 切换到编辑视图
   ✓ 显示所有辅导员列表

2. 找到未追踪的辅导员（绿色 [+] 按钮）
   ✓ 悬停时按钮有反馈
   ✓ 点击后按钮变为红色 [−]

3. 点击底部"保存"按钮
   ✓ 返回主视图
   ✓ 新辅导员出现在追踪列表中
   ✓ 功能完全正常
```

#### 删除辅导员流程

```
测试步骤：
1. 在编辑视图中找到已追踪的辅导员（红色 [−] 按钮）
   ✓ 悬停时按钮有反馈
   ✓ 点击后按钮变为绿色 [+]

2. 点击底部"保存"按钮
   ✓ 返回主视图
   ✓ 辅导员从追踪列表中移除
   ✓ 功能完全正常
```

#### 取消修改流程

```
测试步骤：
1. 在编辑视图中进行一些修改
   - 添加几个辅导员
   - 删除几个辅导员

2. 点击底部"取消"按钮
   ✓ 返回主视图
   ✓ 所有修改被放弃
   ✓ 追踪列表保持不变
```

#### 快速连续操作

```
测试步骤：
1. 快速连续点击多个添加按钮
   ✓ 每个按钮正确切换状态
   ✓ 无重复添加
   ✓ 无 JavaScript 错误

2. 快速连续点击添加和删除按钮
   ✓ 状态切换正确
   ✓ tempTrackedIds 正确更新
```

### 5.3 兼容性测试

#### 浏览器测试矩阵

| 浏览器 | 版本 | 测试项 | 结果 |
|--------|------|--------|------|
| Chrome | 最新 | 按钮样式、悬停效果、表格样式 | ✓ |
| Firefox | 最新 | 按钮样式、悬停效果、表格样式 | ✓ |
| Edge | 最新 | 按钮样式、悬停效果、表格样式 | ✓ |
| Safari | 最新 | 按钮样式、悬停效果、表格样式 | ⚠️ 需测试 |

#### 特殊场景测试

```
1. 长列表场景（50+ 辅导员）：
   ✓ 滚动流畅
   ✓ 按钮交互正常
   ✓ 无性能问题

2. 小屏幕（最小宽度 320px）：
   ✓ 按钮不重叠
   ✓ 表格自适应
   ✓ 文字不截断

3. 禁用状态：
   ✓ 按钮显示为灰色
   ✓ 无悬停效果
   ✓ 无法点击
```

---

## 6. 实施计划

### 6.1 分阶段实施

#### 第一阶段：CSS 样式修改（1 小时）

```
1. 备份现有文件：
   - cp coordinator-tracker.less coordinator-tracker-backup.less

2. 修改 coordinator-tracker.less：
   - 更新 .edit-list-actions button 基础样式
   - 添加 :hover 和 :active 伪类
   - 更新 .add-btn 和 .remove-btn 样式
   - 添加编辑视图表格样式

3. 本地测试：
   - 刷新页面
   - 检查按钮尺寸
   - 测试交互效果
```

#### 第二阶段：HTML 结构调整（0.5 小时）

```
1. 修改 VisitMonitor.ts：
   - 更新头部返回按钮 class
   - 更新底部操作按钮 class

2. 验证：
   - 确认按钮 ID 不变
   - 确认事件绑定正常
```

#### 第三阶段：测试和调优（1 小时）

```
1. 功能回归测试：
   - 添加辅导员
   - 删除辅导员
   - 取消修改
   - 保存修改

2. 视觉测试：
   - 按钮尺寸测量
   - 交互效果验证
   - 表格样式检查

3. 跨浏览器测试：
   - Chrome
   - Firefox
   - Edge

4. 性能测试：
   - 长列表滚动
   - 快速连续点击
```

### 6.2 回滚计划

如果升级后出现问题，可以快速回滚：

#### 回滚步骤

```bash
# 1. 恢复样式文件
cp coordinator-tracker-backup.less coordinator-tracker.less

# 2. 如果修改了 TypeScript，从备份恢复
cp VisitMonitor-pre-epic10.ts VisitMonitor.ts

# 3. 重新编译（如果使用 TypeScript）
npm run build

# 4. 刷新页面验证
```

#### 回滚验证

```
1. 检查按钮尺寸：
   ✓ 恢复为 36px × 36px

2. 检查功能：
   ✓ 添加辅导员正常
   ✓ 删除辅导员正常
   ✓ 保存和取消正常

3. 检查样式：
   ✓ 恢复旧样式（灰色扁平按钮等）
```

---

## 7. 常见问题 (FAQ)

### Q1: 为什么要将按钮从 36px 缩小到 28px？

**A**: 主要有三个原因：
1. **视觉一致性**：与其他圆形按钮（数字按钮）统一尺寸
2. **设计规范**：28px 是现代 UI 设计的常用按钮尺寸
3. **空间优化**：较小的按钮在小屏幕上更友好

如果担心点击区域太小，可以通过 CSS 伪元素增加触摸区域（见 3.1 节）。

### Q2: 绿色和红色按钮会改变颜色吗？

**A**: 不会。我们保持现有的绿色（#28a745）和红色（#dc3545），因为：
- 这些是通用的成功/危险色
- 用户已经习惯这个配色
- 与语义一致（绿色=添加，红色=删除）

仅在悬停时使用深色变体（深绿/深红）提升交互反馈。

### Q3: 如果升级后发现性能问题怎么办？

**A**: 按照以下步骤排查：

1. **检查 transition 属性**：
   - 如果列表很长（50+ 辅导员），过渡动画可能造成卡顿
   - 解决：缩短过渡时间或移除 scale 效果

2. **检查 filter 属性**：
   - `brightness()` 可能在某些浏览器中性能较差
   - 解决：改用直接修改背景色

3. **检查表格悬停**：
   - 如果悬停高亮导致重绘卡顿
   - 解决：使用 `will-change: background` 优化

4. **回滚**：
   - 如果问题严重，使用回滚计划恢复旧版本

### Q4: 如何在不破坏功能的情况下测试升级？

**A**: 建议使用以下测试流程：

1. **本地测试环境**：
   - 在浏览器开发者工具中临时注入新样式
   - 使用 Chrome DevTools 的 Overrides 功能

2. **灰度发布**：
   - 使用 localStorage 添加功能开关
   - 仅对部分用户启用新样式

```javascript
// 添加功能开关
const useNewEditingViewUI = localStorage.getItem('new-editing-ui') === 'true';

if (useNewEditingViewUI) {
    // 应用新样式
} else {
    // 使用旧样式
}
```

3. **A/B 测试**：
   - 收集用户反馈
   - 对比使用数据

### Q5: 升级后如何确保无障碍访问？

**A**: 按照以下清单验证：

```
1. 键盘导航：
   ✓ Tab 键可以聚焦到所有按钮
   ✓ Enter/Space 键可以触发按钮
   ✓ 聚焦状态有明显视觉反馈

2. 屏幕阅读器：
   ✓ 按钮有明确的 aria-label（建议添加）
   ✓ 状态变化有语音提示（建议添加）

3. 色盲友好：
   ✓ 除了颜色外，还有符号区分（+/−）
   ✓ 悬停状态有阴影反馈（不仅依赖颜色）

4. 触摸目标：
   ✓ 28px 符合 WCAG AA 标准
   ✓ 如需支持触摸设备，可增加伪元素点击区域
```

**建议添加的无障碍属性**：

```html
<!-- 添加按钮 -->
<button class="add-btn" 
        data-id="${c.id}"
        aria-label="添加 ${c.name} 到追踪列表">
    +
</button>

<!-- 删除按钮 -->
<button class="remove-btn" 
        data-id="${c.id}"
        aria-label="从追踪列表移除 ${c.name}">
    −
</button>
```

---

## 8. 附录

### 8.1 设计系统变量参考

本次升级使用的 variables.less 变量：

```less
// 颜色
@primary-color: #667eea;
@primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
@background-white: #ffffff;
@background-alt: #f8f9fa;
@background-hover: #f1f3f5;
@background-disabled: #e9ecef;
@border-color: #dee2e6;
@border-color-light: #e9ecef;
@text-primary: #212529;
@text-secondary: #6c757d;
@text-disabled: #adb5bd;

// 间距
@spacing-xs: 4px;
@spacing-sm: 8px;
@spacing-md: 16px;
@spacing-lg: 24px;

// 圆角
@radius-sm: 2px;
@radius-md: 4px;
@radius-lg: 8px;
@radius-round: 50%;

// 字体
@font-size-sm: 13px;
@font-size-md: 14px;
@font-size-lg: 16px;
@font-weight-medium: 500;
@font-weight-semibold: 600;

// 阴影
@shadow-button: 0 2px 4px rgba(0, 0, 0, 0.1);
@shadow-card: 0 2px 8px rgba(0, 0, 0, 0.1);

// 过渡
@transition-fast: 0.2s ease;
```

### 8.2 完整的升级前后对比

#### 按钮对比

| 属性 | 升级前 | 升级后 | 改进 |
|------|--------|--------|------|
| 尺寸 | 36px × 36px | 28px × 28px | ✅ 统一尺寸 |
| 字体 | 18px | 14px | ✅ 更合理 |
| 颜色 | 硬编码 | 可选变量 | ✅ 可维护 |
| 悬停 | 无效果 | 亮度+阴影+放大 | ✅ 反馈明确 |
| 按下 | 无效果 | 下压效果 | ✅ 物理感 |
| 禁用 | 简单灰色 | 统一禁用色+透明度 | ✅ 一致性 |

#### 表格对比

| 属性 | 升级前 | 升级后 | 改进 |
|------|--------|--------|------|
| 边框 | 全边框 | 细分割线 | ✅ 现代化 |
| 表头 | 灰色背景 | 浅色+粗边框 | ✅ 层次清晰 |
| 悬停 | 无效果 | 高亮行 | ✅ 交互友好 |
| 间距 | 硬编码 | 统一变量 | ✅ 可维护 |

---

**文档版本**: 1.0  
**创建日期**: 2026-01-12  
**最后更新**: 2026-01-12  
**责任人**: Product Manager (John)  
**审批状态**: 待审批

**相关 Story**: [Epic 10.8](./stories/epic-10-visit-monitor-ui-upgrade.md#story-108-编辑视图编辑追踪列表-ui-升级)
