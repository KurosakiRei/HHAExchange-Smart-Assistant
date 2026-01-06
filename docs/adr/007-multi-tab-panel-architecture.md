# ADR 007: 多 Tab 面板架构设计

## 状态
**已接受** - 2026-01-05

## 背景

### 当前问题
现有的 Visit Monitor 追踪面板功能单一，无法承载更多功能扩展需求。用户希望：
1. 添加新功能（如 QA 报告）而不增加新的独立面板
2. 统一多个功能的入口，避免界面混乱
3. 采用现代化的 UI 设计，提升用户体验

### 业务需求
- 将现有追踪面板改为 "状态追踪" tab
- 新增 "QA 报告" tab（功能待定）
- 为未来功能扩展预留架构空间

### 技术需求
- 支持多 tab 切换
- 左侧 tab 栏（纯文字标签）
- Tab 栏可折叠（持久化）
- 记住用户最后选择的 tab
- 统一的设计风格（Material Design）

---

## 决策

### 核心架构：多 Tab 面板系统

采用 **容器-内容** 分离的架构模式：

```
MultiTabPanel (容器层)
├── TabBar Component (左侧 tab 栏)
│   ├── TabItem[]（tab 列表）
│   ├── CollapseButton（折叠按钮）
│   └── LocalStorage Sync（状态持久化）
│
└── ContentArea (内容区域)
    ├── StatusTrackingTab (状态追踪)
    ├── QAReportTab (QA 报告)
    └── ...（未来扩展）
```

---

## 技术方案详解

### 1. Tab 切换机制

**决策**：使用 **显示/隐藏 DOM** 方式

**理由**：
- ✅ **状态自动保留**：用户切换回来时筛选条件、滚动位置等自动恢复
- ✅ **性能可控**：初期只有 2-3 个 tab，DOM 数量可控
- ✅ **实现简单**：只需操作 `display` 属性，无需复杂的状态管理
- ✅ **切换流畅**：200ms CSS 动画即可，无需重新渲染

**备选方案**：动态挂载/卸载
- ❌ 需要手动保存/恢复状态（复杂度高）
- ❌ 切换时需要重新渲染（体验不佳）
- ✅ 内存占用低（但现阶段不是瓶颈）

**实现代码**：
```typescript
class MultiTabPanel {
    private tabs: Map<string, HTMLElement> = new Map();
    private activeTabId: string = '';

    switchTab(tabId: string) {
        // 隐藏所有 tab
        this.tabs.forEach((content, id) => {
            content.style.display = id === tabId ? 'block' : 'none';
        });
        
        this.activeTabId = tabId;
        this.saveActiveTab(); // localStorage 持久化
        this.updateTabBarUI(); // 更新激活状态
    }
}
```

---

### 2. 面板尺寸策略

**当前追踪面板尺寸**（从 CSS 推测）：
```css
/* 现有 VisitMonitor */
width: ~600px;
height: ~400px;
```

**新面板尺寸**（"大一圈"）：
```css
/* MultiTabPanel */
width: 680px;   /* +80px (左侧 tab 栏 80px) */
height: 460px;  /* +60px (顶部 padding 增加) */
```

**布局计算**：
```
总宽度 680px = Tab 栏 80px + 内容区 600px
总高度 460px = 标题栏 40px + 内容区 420px
```

**响应式考虑**：
- Tab 栏折叠后：宽度缩减至 40px（只显示图标占位符）
- 折叠按钮图标旋转 180°（◀ → ▶）
- 文字使用 `opacity: 0` 隐藏（而非 `display: none`，保持布局稳定）
- 内容区自适应调整（宽度增加 40px）

**折叠状态对比**：
```
展开状态 (80px)          折叠状态 (40px)
┌──────────┐            ┌────┐
│ 📊 状态追踪 │            │ 📊 │
│ ────────  │            │ ── │  ← 高亮条仍显示
│ 📋 QA 报告│            │ 📋 │
│           │            │    │
│    ◀     │            │ ▶  │  ← 图标旋转
└──────────┘            └────┘
```

---

### 3. Tab 栏设计规范

#### 布局结构
```html
<div class="tab-bar">
    <div class="tab-item active">
        <span class="tab-icon">📊</span> <!-- 折叠时显示的图标 -->
        <span class="tab-text">状态追踪</span>
        <div class="tab-indicator"></div> <!-- 蓝色高亮条 -->
    </div>
    <div class="tab-item">
        <span class="tab-icon">📋</span>
        <span class="tab-text">QA 报告</span>
    </div>
    <div class="tab-collapse-btn">
        <span class="collapse-icon">◀</span> <!-- 折叠图标，折叠后变为 ▶ -->
    </div>
</div>
```

**图标映射**：
```typescript
const TAB_ICONS = {
    'status-tracking': '📊', // 状态追踪
    'qa-report': '📋',       // QA 报告
    // 未来扩展...
};
```

#### 样式规范
```css
/* Tab 栏容器 */
.tab-bar {
    width: 80px; /* 最小 80px，最大 150px */
    background: #fafafa;
    border-right: 1px solid #e0e0e0;
    transition: width 0.2s ease;
    overflow: hidden; /* 折叠时隐藏文字溢出 */
}

.tab-bar.collapsed {
    width: 40px;
}

/* Tab 项 */
.tab-item {
    position: relative;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    gap: 8px; /* 图标和文字间距 */
    white-space: nowrap; /* 防止文字换行 */
}

.tab-item:hover {
    background: #f5f5f5;
}

.tab-item.active {
    background: #e3f2fd; /* 浅蓝背景 */
    color: #1976d2;
}

/* 图标（折叠时显示）*/
.tab-icon {
    flex-shrink: 0; /* 防止图标缩小 */
    font-size: 18px;
    line-height: 1;
}

/* 文字（展开时显示）*/
.tab-text {
    opacity: 1;
    transition: opacity 0.2s;
}

.tab-bar.collapsed .tab-text {
    opacity: 0; /* 折叠时隐藏文字 */
    pointer-events: none;
}

/* 蓝色高亮条（B 站样式）*/
.tab-indicator {
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background: #1976d2;
    opacity: 0;
    transition: opacity 0.2s;
}

.tab-item.active .tab-indicator {
    opacity: 1;
}

/* 折叠按钮 */
.tab-collapse-btn {
    padding: 8px;
    text-align: center;
    cursor: pointer;
    border-top: 1px solid #e0e0e0;
    transition: background 0.15s;
}

.tab-collapse-btn:hover {
    background: #f5f5f5;
}

.collapse-icon {
    display: inline-block;
    transition: transform 0.2s;
}

.tab-bar.collapsed .collapse-icon {
    transform: rotate(180deg); /* 折叠后图标旋转 180° (◀ → ▶) */
}
```

#### 文字宽度自适应逻辑
```typescript
function calculateTabBarWidth(tabLabels: string[]): number {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = '14px Arial';
    
    const maxWidth = Math.max(
        ...tabLabels.map(label => ctx.measureText(label).width)
    );
    
    return Math.min(
        Math.max(maxWidth + 32, 80), // padding 左右各 16px
        150 // 最大宽度限制
    );
}
```

---

### 4. 状态持久化策略

#### LocalStorage 键设计
```typescript
const STORAGE_KEYS = {
    ACTIVE_TAB: 'hha_smart_assistant_active_tab',
    TAB_BAR_COLLAPSED: 'hha_smart_assistant_tab_bar_collapsed',
    // 各 tab 自己的状态键
    STATUS_TRACKING_FILTER: 'hha_smart_assistant_status_tracking_filter',
    QA_REPORT_CONFIG: 'hha_smart_assistant_qa_report_config',
};
```

#### 状态保存时机
```typescript
class MultiTabPanel {
    private saveActiveTab() {
        localStorage.setItem(
            STORAGE_KEYS.ACTIVE_TAB,
            this.activeTabId
        );
    }

    private toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        localStorage.setItem(
            STORAGE_KEYS.TAB_BAR_COLLAPSED,
            String(this.isCollapsed)
        );
        this.updateTabBarWidth();
    }

    private loadState() {
        // 恢复上次选择的 tab
        const savedTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
        this.activeTabId = savedTab || 'status-tracking';

        // 恢复折叠状态
        const collapsed = localStorage.getItem(STORAGE_KEYS.TAB_BAR_COLLAPSED);
        this.isCollapsed = collapsed === 'true';
    }
}
```

---

### 5. 现代化 UI 统一规范

#### 设计令牌（Design Tokens）
```typescript
const DESIGN_TOKENS = {
    // 颜色
    colors: {
        primary: '#1976d2',
        primaryHover: '#1565c0',
        primaryLight: '#bbdefb',
        background: '#ffffff',
        backgroundAlt: '#fafafa',
        border: '#e0e0e0',
        text: '#333333',
        textSecondary: '#666666',
    },
    
    // 间距
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
    },
    
    // 阴影
    shadows: {
        card: '0 2px 8px rgba(0,0,0,0.1)',
        cardHover: '0 4px 12px rgba(0,0,0,0.15)',
        panel: '0 6px 16px rgba(0,0,0,0.12)',
    },
    
    // 圆角
    radius: {
        sm: '2px',
        md: '4px',
        lg: '8px',
    },
    
    // 动画
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
    },
};
```

#### 配置卡片样式（统一 Prebilling/Homepage）
```css
.config-card {
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 16px;
    margin-bottom: 16px;
    transition: box-shadow 0.2s ease;
}

.config-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.config-card-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
}
```

#### 按钮样式
```css
.btn-primary {
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s ease;
}

.btn-primary:hover {
    background: #1565c0;
}

.btn-primary:active {
    background: #0d47a1;
}
```

---

### 6. VisitMonitor 重构策略

#### 重构目标
1. **解耦 UI 和逻辑**：将渲染代码和数据处理分离
2. **样式现代化**：采用统一的设计令牌
3. **Tab 兼容**：支持在 MultiTabPanel 中运行

#### 重构步骤
```typescript
// 原代码结构（耦合）
class VisitMonitor {
    constructor() {
        this.createUI();      // UI 创建
        this.bindEvents();    // 事件绑定
        this.startTracking(); // 业务逻辑
    }
}

// 重构后（解耦）
class StatusTrackingTab {
    // 只负责 UI 渲染
    render(container: HTMLElement): void {
        container.innerHTML = this.buildHTML();
        this.attachEventListeners(container);
    }
    
    private buildHTML(): string {
        return `
            <div class="config-card">
                <div class="config-card-title">筛选配置</div>
                <!-- 配置项 -->
            </div>
            <div class="tracking-table">
                <!-- 表格 -->
            </div>
        `;
    }
}

class VisitTrackingService {
    // 只负责数据和业务逻辑
    async fetchVisits(filters: FilterParams): Promise<Visit[]> {
        // API 调用
    }
    
    startRealTimeUpdates() {
        // 轮询逻辑
    }
}
```

#### 向后兼容
```typescript
// 保留现有的 localStorage 键名
const LEGACY_STORAGE_KEYS = {
    COORDINATOR_FILTER: 'visitMonitorCoordinatorFilter', // 不改变
    AUTO_REFRESH: 'visitMonitorAutoRefresh',             // 不改变
};
```

---

### 7. 性能优化策略

#### 初始化优化
```typescript
class MultiTabPanel {
    async init() {
        // 只初始化默认 tab 的内容
        const defaultTab = this.loadState().activeTabId;
        await this.tabs.get(defaultTab)?.init();
        
        // 其他 tab 延迟初始化（用户点击时才初始化）
        this.tabs.forEach((tab, id) => {
            if (id !== defaultTab) {
                tab.lazyInit = true;
            }
        });
    }
    
    async switchTab(tabId: string) {
        const tab = this.tabs.get(tabId);
        if (tab.lazyInit) {
            await tab.init();
            tab.lazyInit = false;
        }
        // ... 切换逻辑
    }
}
```

#### CSS 性能
```css
/* 使用 CSS containment 优化渲染 */
.tab-content {
    contain: layout style paint;
}

/* 使用 transform 代替 left/top（GPU 加速）*/
.tab-indicator {
    transform: translateX(0);
    will-change: transform;
}
```

---

## 文件结构

```
src/js/
├── MultiTabPanel.ts          # 主面板容器（新建）
├── tabs/                     # Tab 内容模块（新建目录）
│   ├── StatusTrackingTab.ts  # 状态追踪（重构自 VisitMonitor）
│   ├── QAReportTab.ts        # QA 报告（新建）
│   └── BaseTab.ts            # Tab 基类（可选）
├── services/                 # 业务逻辑层（新建目录）
│   └── VisitTrackingService.ts  # 追踪服务（从 VisitMonitor 抽离）
└── VisitMonitor.ts           # 保留（向后兼容）

src/style/
├── multi-tab-panel.less      # 主面板样式（新建）
├── tabs/                     # Tab 样式（新建目录）
│   ├── status-tracking.less
│   └── qa-report.less
└── variables.less            # 设计令牌（新建）
```

---

## 实现计划

### Phase 1: 基础框架（Story 7.1）
- [ ] 创建 `MultiTabPanel.ts` 核心类
- [ ] 实现 tab 栏渲染和点击切换
- [ ] 添加折叠/展开功能
- [ ] localStorage 状态持久化
- [ ] 编写样式文件（`multi-tab-panel.less`）

### Phase 2: VisitMonitor 重构（Story 7.2）
- [ ] 抽离 `VisitTrackingService.ts` 业务逻辑
- [ ] 创建 `StatusTrackingTab.ts` UI 层
- [ ] 更新样式为现代化设计
- [ ] 在 `MultiTabPanel` 中集成
- [ ] 测试功能完整性

### Phase 3: QA 报告占位（Story 7.3）
- [ ] 创建 `QAReportTab.ts` 占位符
- [ ] 添加到 tab 列表

---

## 风险与缓解

### 风险 1: CSS 冲突
**描述**：新样式可能与 HHAexchange 原站样式冲突  
**缓解**：
- 使用唯一 class 前缘：`hha-smart-`
- 所有样式限定在 `.hha-smart-panel` 容器内
- 使用 CSS Modules 或 scoped 样式（如果升级构建工具）

### 风险 2: 性能问题
**描述**：多个 tab 同时存在 DOM 可能影响性能  
**缓解**：
- 初期限制 tab 数量（2-3 个）
- 使用 CSS containment 优化渲染
- 延迟初始化非激活 tab

### 风险 3: 状态管理复杂度
**描述**：多个 tab 的状态同步可能引入 bug  
**缓解**：
- 每个 tab 独立管理自己的状态
- 使用不同的 localStorage 键避免冲突
- 明确状态保存时机（切换 tab 时保存）

---

## 替代方案

### 方案 A: 动态挂载/卸载（已否决）
**理由**：
- 实现复杂度高
- 状态管理困难
- 切换体验不佳
- 现阶段内存优势不明显

### 方案 B: 独立面板（已否决）
**理由**：
- 不符合用户需求（希望统一入口）
- 界面会变得混乱
- 无法复用容器逻辑

### 方案 C: iframe 隔离（已否决）
**理由**：
- 通信复杂
- 性能开销大
- 无法共享状态

---

## 参考资料

### 设计参考
- **B 站 Tab 设计**：左侧 tab 栏 + 蓝色高亮条
- **Material Design Tabs**：https://m2.material.io/components/tabs

### 内部参考
- `HomePage.ts` - 配置卡片样式
- `Prebilling.ts` - 按钮和颜色规范
- Epic 1 - Multi-tab Sync（命名参考）

### 代码参考
```typescript
// 参考 HomePage.ts 的 createConfigCard 方法
createConfigCard(title: string, content: HTMLElement): HTMLElement {
    const card = document.createElement('div');
    card.className = 'config-card';
    card.innerHTML = `
        <div class="config-card-title">${title}</div>
    `;
    card.appendChild(content);
    return card;
}
```

---

## 成功指标

### 技术指标
- ✅ Tab 切换响应时间 < 200ms
- ✅ 面板初始化时间 < 500ms
- ✅ 内存占用 < 20MB（所有 tab 展开）
- ✅ 代码覆盖率 > 80%

### 用户体验指标
- ✅ 视觉风格与 Prebilling/Homepage 一致性 > 95%
- ✅ Tab 切换无闪烁、卡顿
- ✅ 状态正确保存和恢复

### 可维护性指标
- ✅ 新增 tab 工作量 < 2 小时
- ✅ UI 组件复用率 > 60%
- ✅ 代码行数增长 < 30%（相比独立面板方案）

---

## 后续优化方向

1. **UI 组件库**：提取公共组件到 `components/` 目录
2. **拖拽排序**：允许用户自定义 tab 顺序
3. **主题系统**：支持深色模式切换
4. **快捷键**：添加 Ctrl+1/2/3 快捷键（用户后续可能需要）
5. **性能监控**：集成 Performance API 监控渲染性能

---

## 批准者
- **产品经理**: John (PM Agent)
- **架构师**: 待确认
- **开发者**: 待实现
