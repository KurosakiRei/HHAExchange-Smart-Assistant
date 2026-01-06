# Multi-Tab Panel System

多 Tab 面板系统 - 为 HHAexchange Smart Assistant 提供统一的功能容器。

## 快速开始

### 创建一个新的 Tab

```typescript
import { BaseTab } from './BaseTab';

export class MyCustomTab extends BaseTab {
  // Tab 唯一 ID
  id = 'my-custom-tab';
  
  // Tab 显示名称
  label = '我的功能';
  
  // Tab 图标（emoji）
  icon = '🎯';

  // 初始化（可选）
  async init(): Promise<void> {
    // 加载数据、设置监听器等
  }

  // 渲染 Tab 内容
  render(container: HTMLElement): void {
    this.container = container;

    // 使用工具方法创建配置卡片
    const content = document.createElement('div');
    content.textContent = '我的功能内容';

    const card = this.createConfigCard('配置标题', content);
    container.appendChild(card);
  }

  // Tab 激活时触发（可选）
  onActivate(): void {
    console.log('Tab 已激活');
  }

  // Tab 失活时触发（可选）
  onDeactivate(): void {
    console.log('Tab 已失活');
  }
}
```

### 注册 Tab 到面板

```typescript
import { MultiTabPanel } from './MultiTabPanel';
import { MyCustomTab } from './tabs/MyCustomTab';

// 创建容器
const container = document.createElement('div');
document.body.appendChild(container);

// 创建面板
const panel = new MultiTabPanel(container, {
  title: '面板标题',
  defaultTabId: 'my-custom-tab', // 默认激活的 Tab
  initialCollapsed: false, // 初始是否折叠
});

// 注册 Tab
panel.registerTab(new MyCustomTab());

// 初始化
await panel.init();
```

## BaseTab 工具方法

### createConfigCard()
创建统一样式的配置卡片

```typescript
const content = document.createElement('div');
content.innerHTML = '<p>配置内容</p>';

const card = this.createConfigCard('卡片标题', content);
```

### createButton()
创建按钮

```typescript
const button = this.createButton('点击我', () => {
  console.log('按钮被点击');
}, true); // true = 主按钮，false = 次按钮
```

### createPlaceholder()
创建占位符 UI

```typescript
const placeholder = this.createPlaceholder(
  '📋',           // 图标
  '功能开发中',   // 标题
  '敬请期待...'   // 描述文字
);
```

## 样式指南

### 使用设计令牌

在 LESS 文件中使用预定义的变量：

```less
@import "../style/variables.less";

.my-custom-element {
  color: @primary-color;          // 主题蓝色
  padding: @spacing-md;           // 16px
  border-radius: @radius-md;      // 4px
  box-shadow: @shadow-card;       // 卡片阴影
  transition: all @transition-fast; // 150ms 过渡
}
```

### 可用的设计令牌

#### 颜色
- `@primary-color`: #1976d2（主题蓝）
- `@primary-hover`: #1565c0（悬停蓝）
- `@background-white`: #ffffff
- `@background-alt`: #fafafa
- `@text-primary`: #333333
- `@text-secondary`: #666666

#### 间距
- `@spacing-xs`: 4px
- `@spacing-sm`: 8px
- `@spacing-md`: 16px
- `@spacing-lg`: 24px
- `@spacing-xl`: 32px

#### 阴影
- `@shadow-card`: 卡片阴影
- `@shadow-card-hover`: 悬停阴影
- `@shadow-panel`: 面板阴影

#### 圆角
- `@radius-sm`: 2px
- `@radius-md`: 4px
- `@radius-lg`: 8px

#### 过渡
- `@transition-fast`: 0.15s ease
- `@transition-normal`: 0.2s ease
- `@transition-slow`: 0.3s ease

### CSS 类名

#### 按钮
```html
<button class="hha-smart-btn-primary">主按钮</button>
<button class="hha-smart-btn-secondary">次按钮</button>
```

#### 配置卡片
```html
<div class="hha-smart-config-card">
  <div class="hha-smart-config-card-title">标题</div>
  <div class="hha-smart-config-card-body">
    <!-- 内容 -->
  </div>
</div>
```

## 状态持久化

面板自动保存以下状态到 LocalStorage：

- `hha_smart_assistant_active_tab`: 当前激活的 Tab
- `hha_smart_assistant_tab_bar_collapsed`: Tab 栏折叠状态

各 Tab 可以使用自己的 localStorage 键保存状态：

```typescript
// 保存 Tab 特定状态
const STORAGE_KEY = 'hha_smart_assistant_my_tab_state';

// 保存
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

// 读取
const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
```

## 架构概览

```
MultiTabPanel
├── Panel Header (标题栏)
│   ├── Title (标题)
│   └── Controls (最小化/关闭按钮)
├── Panel Body
│   ├── Tab Bar (左侧 Tab 栏)
│   │   ├── Tab List
│   │   │   ├── Tab Item 1 (图标 + 文字 + 高亮条)
│   │   │   ├── Tab Item 2
│   │   │   └── ...
│   │   └── Collapse Button (折叠按钮)
│   └── Content Area (内容区)
│       ├── Tab Content 1 (显示/隐藏)
│       ├── Tab Content 2 (显示/隐藏)
│       └── ...
```

## 性能优化

### 延迟初始化
只有默认 Tab 在面板初始化时加载，其他 Tab 在首次点击时才初始化：

```typescript
async switchTab(tabId: string): Promise<void> {
  // 首次访问时初始化
  const container = this.tabContents.get(tabId);
  if (container && container.children.length === 0) {
    await tab.init();
    tab.render(container);
  }
}
```

### 状态保留
使用显示/隐藏 DOM 方式，Tab 状态自动保留，无需手动管理。

## 最佳实践

1. **保持 Tab 独立**: 每个 Tab 应该是独立的功能模块
2. **使用设计令牌**: 始终使用 `variables.less` 中的变量
3. **异步初始化**: 将耗时操作放在 `init()` 方法中
4. **清理资源**: 在 `destroy()` 中清理事件监听器和定时器
5. **状态管理**: 使用 LocalStorage 持久化用户配置

## 示例

查看现有实现：
- [StatusTrackingTab.ts](../src/js/tabs/StatusTrackingTab.ts) - 状态追踪
- [QAReportTab.ts](../src/js/tabs/QAReportTab.ts) - QA 报告占位符

## 相关文档

- [Epic 7: 多 Tab 面板系统重构](./epic-7-multi-tab-panel-system.md)
- [ADR 007: 多 Tab 面板架构设计](../adr/007-multi-tab-panel-architecture.md)
