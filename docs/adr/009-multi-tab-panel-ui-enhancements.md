# ADR 009: Multi-Tab Panel UI 优化

**日期**: 2026-01-08  
**状态**: ✅ **已批准**  
**决策者**: KurosakiRei  
**相关 Story**: Epic 8 - Story 8.11

---

## 背景

在开发 QA Report 功能过程中，发现 Multi-Tab Panel 存在以下用户体验问题：
1. **标题重复**：Tab 展开时，Tab 区域和内容区域都显示标题，造成视觉冗余
2. **样式不一致**：面板头部使用渐变紫色，与 HHAExchange 其他组件（如 Prebilling Selector）风格不符
3. **品牌缺失**：没有明确的作者署名或品牌标识

本 ADR 记录了针对这些问题的 UI 优化决策。

---

## 技术决策

### 决策 1: 内容区标题淡入淡出机制

**问题**：Tab 展开时，左侧 Tab 栏已显示当前 Tab 名称，内容区域再显示相同标题造成重复。

**决策**：实现标题的条件显示逻辑
- **Tab 展开时**（`isCollapsed = false`）：内容标题淡出隐藏
- **Tab 收缩时**（`isCollapsed = true`）：内容标题淡入显示

**实现方案**：

```typescript
// MultiTabPanel.ts
class MultiTabPanel {
  private isCollapsed: boolean = false;

  /**
   * Toggle content title visibility based on tab bar state
   */
  private toggleContentTitle(show: boolean): void {
    const allContentTitles = this.contentAreaEl?.querySelectorAll('.content-title-text');
    
    allContentTitles?.forEach((title) => {
      if (show) {
        // Tab 收缩时显示标题
        title.classList.remove('fade-out');
        title.classList.add('fade-in');
      } else {
        // Tab 展开时隐藏标题
        title.classList.remove('fade-in');
        title.classList.add('fade-out');
      }
    });
  }

  /**
   * Toggle tab bar collapse state
   */
  private toggleTabBar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.tabBarEl?.classList.toggle('collapsed', this.isCollapsed);
    
    // 同步更新内容标题显示状态
    this.toggleContentTitle(this.isCollapsed);
    
    this.saveState();
  }

  /**
   * Initialize panel - apply saved collapse state
   */
  private async init(): Promise<void> {
    this.render();
    
    // 应用保存的折叠状态
    if (this.isCollapsed) {
      this.tabBarEl?.classList.add('collapsed');
      this.toggleContentTitle(true);  // 收缩状态下显示标题
    } else {
      this.toggleContentTitle(false); // 展开状态下隐藏标题
    }
    
    await this.initializeDefaultTab();
  }
}
```

**CSS 实现**：

```less
.content-title-text {
  display: inline-block;
  transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
  opacity: 1;
  transform: translateX(0);
  
  &.fade-out {
    opacity: 0;
    transform: translateX(-10px);  // 轻微左移增强动效
    pointer-events: none;
  }
  
  &.fade-in {
    animation: fadeInFromLeft 300ms ease-in-out forwards;
  }
}

@keyframes fadeInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

**保留字段**：
- `.content-subtitle`（如"上次更新：XXXX"）不受影响，始终显示
- 只控制 `.content-title-text` 的显示

**优点**：
- ✅ 避免标题重复，提升视觉清爽度
- ✅ 平滑的淡入淡出动画，提升用户体验
- ✅ 状态自动同步，无需手动控制

---

### 决策 2: 面板头部样式重构

**问题**：当前面板头部使用渐变紫色背景，与 HHAExchange 系统的其他组件（如 Prebilling Selector）风格不一致。

**当前样式**：
```less
.hha-smart-panel-header {
  background: linear-gradient(135deg, @primary-color 0%, @primary-hover 100%);
}
```

**新样式**（参考 Prebilling Selector）：

```less
.hha-smart-panel-header {
  height: @panel-header-height;
  background: @bg-primary;  // 纯色背景：#4a90e2
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 @spacing-md;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.hha-smart-panel-title {
  font-size: @font-size-lg;
  font-weight: @font-weight-semibold;
  display: flex;
  align-items: center;
  gap: @spacing-sm;
  
  &::before {
    content: "📊";
    font-size: 20px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
}
```

**颜色定义**（variables.less）：
```less
@bg-primary: #4a90e2;           // 主蓝色（与 HHAExchange 系统一致）
@bg-primary-hover: #357abd;     // 悬停色
@bg-primary-active: #2667a8;   // 激活色
```

**优点**：
- ✅ 与 HHAExchange 系统风格统一
- ✅ 更专业的视觉效果
- ✅ 添加图标增强识别度

**备选方案**：保持渐变紫色
- ❌ 与系统其他组件风格割裂
- ❌ 可能被误认为第三方插件

---

### 决策 3: 添加 Footer 品牌展示区

**问题**：面板缺少品牌标识，用户可能不清楚这是自定义增强功能。

**决策**：在面板底部添加 Footer 区域显示作者信息

**HTML 结构**：

```html
<div class="hha-smart-panel">
  <div class="hha-smart-panel-header">...</div>
  <div class="hha-smart-panel-body">
    <div class="hha-smart-tab-bar">...</div>
    <div class="hha-smart-content-area">...</div>
  </div>
  <div class="hha-smart-panel-footer">
    <span class="footer-branding">Powered by KurosakiRei</span>
  </div>
</div>
```

**CSS 实现**：

```less
.hha-smart-panel-footer {
  height: 32px;
  min-height: 32px;  // 防止被压缩
  background: @bg-secondary;
  border-top: 1px solid @border-color;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 @spacing-md;
  font-size: @font-size-sm;
  color: @text-secondary;
  flex-shrink: 0;  // 确保不会被 flex 压缩
  user-select: none;
}

.footer-branding {
  font-style: italic;
  opacity: 0.7;
  transition: opacity 200ms ease;
  
  &:hover {
    opacity: 1;
  }
}
```

**布局调整**（确保 Footer 在正确位置）：

```less
.hha-smart-panel {
  display: flex;
  flex-direction: column;
  height: 100%;  // 确保占满容器
  
  .hha-smart-panel-header {
    flex-shrink: 0;  // 固定高度
  }
  
  .hha-smart-panel-body {
    flex: 1;  // 占据剩余空间
    min-height: 0;  // 允许内部滚动
    overflow: hidden;
  }
  
  .hha-smart-panel-footer {
    flex-shrink: 0;  // 固定高度
  }
}
```

**交互优化**：
- Footer 区域不可拖拽（避免误触）
- 鼠标悬停时 Footer 文本稍微变亮
- 不影响 Tab 区域和内容区域的滚动

**优点**：
- ✅ 明确的品牌标识
- ✅ 位置固定，不影响主要功能
- ✅ 简洁优雅，不抢眼

**备选方案**：在头部显示作者信息
- ❌ 占用宝贵的头部空间
- ❌ 可能与系统标题冲突

---

## 性能考虑

### 1. 动画性能优化

**使用 `opacity` 而非 `display`**：
- `opacity` 触发 GPU 加速，性能更好
- `display: none` 会触发 reflow，性能较差

**使用 `transform` 辅助动画**：
- 轻微的 `translateX` 增强视觉效果
- `transform` 同样享受 GPU 加速

**避免频繁的 DOM 查询**：
```typescript
// ❌ 不好的做法
private toggleContentTitle(show: boolean): void {
  document.querySelectorAll('.content-title-text').forEach(...);  // 每次都查询全局
}

// ✅ 推荐做法
private toggleContentTitle(show: boolean): void {
  const titles = this.contentAreaEl?.querySelectorAll('.content-title-text');  // 限定范围
  titles?.forEach(...);
}
```

### 2. Footer 布局性能

**使用 Flexbox 而非绝对定位**：
- Flexbox 自动处理空间分配，减少手动计算
- 响应式更好，适应不同窗口大小

**防止 Footer 被压缩**：
```less
.hha-smart-panel-footer {
  flex-shrink: 0;  // 关键：防止被 flex 压缩
  min-height: 32px;
}
```

---

## 向后兼容性

### 现有 Tab 适配

所有现有的 Tab（StatusTrackingTab、QAReportTab）需要更新 HTML 结构：

**旧结构**：
```html
<div class="content-header">
  <h2>状态追踪</h2>
  <span class="subtitle">上次更新：2:34:37 PM</span>
</div>
```

**新结构**：
```html
<div class="content-header">
  <div class="content-title">
    <span class="content-title-text">状态追踪</span>
  </div>
  <div class="content-subtitle">
    上次更新：2:34:37 PM
  </div>
</div>
```

**迁移清单**：
- [ ] StatusTrackingTab
- [ ] QAReportTab（新开发的 Tab 直接使用新结构）
- [ ] 未来的其他 Tab

---

## 测试策略

### 单元测试

```typescript
describe('MultiTabPanel UI Enhancements', () => {
  it('should hide content title when tab bar expanded', () => {
    const panel = new MultiTabPanel(container);
    panel.init();
    
    const title = container.querySelector('.content-title-text');
    expect(title.classList.contains('fade-out')).toBe(true);
  });

  it('should show content title when tab bar collapsed', () => {
    const panel = new MultiTabPanel(container);
    panel.init();
    
    // 模拟折叠
    panel.toggleTabBar();
    
    const title = container.querySelector('.content-title-text');
    expect(title.classList.contains('fade-in')).toBe(true);
  });

  it('should always show content subtitle', () => {
    const panel = new MultiTabPanel(container);
    panel.init();
    
    const subtitle = container.querySelector('.content-subtitle');
    expect(window.getComputedStyle(subtitle).opacity).toBe('1');
  });
});
```

### 视觉测试

- [ ] Tab 展开时，标题平滑淡出（300ms 动画）
- [ ] Tab 收缩时，标题平滑淡入（300ms 动画）
- [ ] 副标题（"上次更新"）始终可见
- [ ] Footer 正确显示在面板底部
- [ ] Footer 不影响内容区域滚动
- [ ] 面板头部样式与 Prebilling Selector 一致

### 兼容性测试

- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Edge 90+
- [ ] Safari 14+（如有需要）

---

## 实施计划

### Phase 1: 基础结构调整（1 小时）
1. 修改 `MultiTabPanel.ts` 添加 Footer 渲染逻辑
2. 更新 LESS 样式文件
3. 调整面板头部颜色

### Phase 2: 标题动画实现（1.5 小时）
1. 实现 `toggleContentTitle()` 方法
2. 集成到 `toggleTabBar()` 逻辑中
3. 添加 CSS 动画样式
4. 处理初始化状态

### Phase 3: 现有 Tab 迁移（1 小时）
1. 更新 StatusTrackingTab HTML 结构
2. 验证动画效果
3. 测试不同状态下的表现

### Phase 4: 测试与优化（0.5 小时）
1. 执行测试清单
2. 性能优化
3. 兼容性检查

**总计**: 4 小时

---

## 相关文档

- [ADR 007: Multi-Tab Panel Architecture](./007-multi-tab-panel-architecture.md)
- [Epic 8: QA Report Feature](../stories/epic-8-qa-report-feature.md)
- [Multi-Tab Panel Guide](../guides/multi-tab-panel-guide.md)

---

## 版本历史

| 日期 | 版本 | 变更说明 | 作者 |
|------|------|----------|------|
| 2026-01-08 | 1.0 | 初始版本 | KurosakiRei |
