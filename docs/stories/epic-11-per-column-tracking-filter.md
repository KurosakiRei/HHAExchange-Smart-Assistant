# Epic 11: 按列追踪过滤器（Per-Column Tracking Filter）

**状态**: 📋 **规划中**

## Epic 概述

为 Visit Monitor 状态追踪面板的每个数据列（上班钟、下班钟、异常打钟、消息）添加 Split Button 过滤器，允许用户**按人按列**地控制追踪项，从而减少不必要的 API 请求，避免触发 API Rate Limit，提升整体系统响应速度。

## 业务价值

- **降低 API 负载**：用户可关闭不需要的追踪项，显著减少每轮请求数量
- **避免 Rate Limit**：减少并发请求，降低 HHAExchange API 限流风险
- **提升响应速度**：更少的请求 = 更快的数据刷新周期
- **精细化控制**：每个辅导员可独立配置追踪项，按需追踪
- **用户体验**：通过可视化的请求计数，帮助用户理解 API 负载

## 问题分析

### 当前痛点

当前系统对每个追踪的辅导员都发送 4 个 API 请求（上班钟、下班钟、异常打钟、消息），每轮追踪更新的请求总数为：

```
请求数 = 追踪人数 × 4
```

以截图为例，追踪 5 人 = 20 个请求/轮。当某些辅导员的消息数很多时（如 Tracy 有 19 条消息），获取消息详情的请求本身也很重，容易触发 API Rate Limit，导致：
- 其他页面请求变慢
- 部分 API 请求超时或失败
- 数据刷新延迟

### 解决方案

通过 **Per-Column Tracking Filter**，用户可以选择性地关闭某些辅导员的特定追踪项。例如：
- 关闭 Tracy 的"消息"追踪 → 减少 1 个重量级请求
- 关闭所有人的"下班钟"追踪（上午时段不需要）→ 减少 5 个请求

优化后请求数为：
```
请求数 = Σ (每个人勾选的列数)
```

## 功能设计

### UI 设计

#### 表头 Split Button

在 4 个数据列（上班钟、下班钟、异常打钟、消息）的表头文字旁添加一个向下的小箭头（▾），点击后弹出过滤浮窗。

```
┌──────────────────────────────────────────────────────────────────┐
│  ⏰ 上次更新: 6:30:24 PM        [📝 选择要追踪的辅导员]        │
├──────────────────────────────────────────────────────────────────┤
│  编号   辅导员 (Ext.)       上班钟 ▾   下班钟 ▾   异常打钟 ▾   消息 ▾  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│   1    Cathy Huang           (0)       (1)         (4)        (5)    │
│   2    Mona He               (0)       (0)         (5)        (9)    │
│   3    Tao Yang              (0)       (0)         (3)        (2)    │
│   4    Tracy V.              (0)       (0)         (6)        (19)   │
│   5    Vicky Zhao            (0)       (0)         (13)       (8)    │
└──────────────────────────────────────────────────────────────────┘
```

#### 过滤浮窗

点击某列的 ▾ 箭头后，弹出该列的过滤浮窗：

```
                    ┌──────────────────────────┐
                    │  ☑ 全选 / ☐ 全不选       │
                    │  ─────────────────────── │
                    │  ☑ Cathy Huang     (5)   │
                    │  ☑ Mona He         (9)   │
                    │  ☑ Tao Yang        (2)   │
                    │  ☐ Tracy V.        (19)  │  ← 取消勾选
                    │  ☑ Vicky Zhao      (8)   │
                    │  ─────────────────────── │
                    │  当前追踪: 16/20 请求/轮  │
                    │  ─────────────────────── │
                    │  [取消]       [✓ 确认]    │
                    └──────────────────────────┘
```

#### 未追踪项的展示

当某人某列被取消追踪后，对应单元格显示 `—`：

```
│   4    Tracy V.        (0)       (0)         (6)        —      │
```

### 数据结构

#### 过滤配置

```typescript
/**
 * 每列追踪过滤配置
 * key: coordinatorId
 * value: 该辅导员需要追踪的列集合
 */
type ColumnFilterConfig = Record<number, Set<ColumnType>>;

/** 可过滤的列类型 */
type ColumnType = "clockIn" | "clockOut" | "anomaly" | "message";

/** 列类型与 API CallType 的映射 */
const COLUMN_CALL_TYPE_MAP: Record<ColumnType, CallType> = {
  clockIn: 2,
  clockOut: 3,
  anomaly: "anomaly",
  message: "message",
};
```

#### 持久化格式

存储在 GM_setValue 中，实现跨 Tab/跨域名同步：

```typescript
// GM_setValue key
const FILTER_STORAGE_KEY = "hha_column_tracking_filter";

// 存储格式（JSON 序列化友好）
interface PersistedFilterConfig {
  /** coordinatorId -> 启用的列名数组 */
  filters: Record<number, ColumnType[]>;
  /** 最后修改时间戳 */
  timestamp: number;
}
```

### 核心逻辑

#### runTrackingUpdate 改造

```typescript
// 改造前：固定 4 个请求/人
for (const coordinator of trackedCoordinators) {
  promises.push(fetchStatusReport(coordinator.id, 2, officeIds)...);
  promises.push(fetchStatusReport(coordinator.id, 3, officeIds)...);
  promises.push(fetchAnomalyReport(coordinator.id)...);
  promises.push(fetchMessageReport(coordinator.id)...);
}

// 改造后：按过滤配置决定请求
for (const coordinator of trackedCoordinators) {
  const enabledColumns = getEnabledColumns(coordinator.id);
  
  if (enabledColumns.has("clockIn")) {
    promises.push(fetchStatusReport(coordinator.id, 2, officeIds)...);
  }
  if (enabledColumns.has("clockOut")) {
    promises.push(fetchStatusReport(coordinator.id, 3, officeIds)...);
  }
  if (enabledColumns.has("anomaly")) {
    promises.push(fetchAnomalyReport(coordinator.id)...);
  }
  if (enabledColumns.has("message")) {
    promises.push(fetchMessageReport(coordinator.id)...);
  }
}
```

#### renderTrackingView 改造

```typescript
// 改造后：根据过滤配置决定单元格显示
const enabledColumns = getEnabledColumns(coordinator.id);

const clockInCell = enabledColumns.has("clockIn")
  ? `<div class="${clockInClass}" ...>${clockInCount}</div>`
  : `<span class="tracking-disabled">—</span>`;
// ... 类似处理其他列
```

## Story 列表

| Story | 标题 | 优先级 | 工时 | 依赖 | 状态 |
|-------|------|--------|------|------|------|
| 11.1 | 数据模型与持久化 | High | 2h | - | 📋 待开发 |
| 11.2 | 表头 Split Button UI | High | 2h | 11.1 | 📋 待开发 |
| 11.3 | 过滤浮窗 UI | High | 3h | 11.2 | 📋 待开发 |
| 11.4 | 追踪逻辑集成 | High | 2h | 11.1 | 📋 待开发 |
| 11.5 | 视图渲染与 UI 反馈 | Medium | 2h | 11.3, 11.4 | 📋 待开发 |
| 11.6 | 跨 Tab 同步 | Medium | 1.5h | 11.1 | 📋 待开发 |
| 11.7 | 集成测试与细节打磨 | High | 2h | 11.1-11.6 | 📋 待开发 |

**总工时预估**: 14.5 小时

---

## Story 11.1: 数据模型与持久化

### 用户故事
**作为** 开发者  
**我希望** 建立过滤配置的数据模型和持久化机制  
**以便** 为后续的 UI 和逻辑功能提供数据基础

### 验收标准
- [ ] 定义 `ColumnType` 类型：`"clockIn" | "clockOut" | "anomaly" | "message"`
- [ ] 定义 `ColumnFilterConfig` 数据结构
- [ ] 实现 `loadColumnFilter()` 函数，从 GM_getValue 加载配置
- [ ] 实现 `saveColumnFilter()` 函数，保存配置到 GM_setValue
- [ ] 实现 `getEnabledColumns(coordinatorId)` 辅助函数
- [ ] 实现 `getTotalRequestCount()` 函数，计算当前配置下的请求总数
- [ ] 新添加的辅导员默认全部列启用
- [ ] 首次使用时所有人所有列默认全部启用
- [ ] 删除辅导员时自动清理对应的过滤配置

### 技术要点

#### 数据结构定义

```typescript
type ColumnType = "clockIn" | "clockOut" | "anomaly" | "message";

const ALL_COLUMNS: ColumnType[] = ["clockIn", "clockOut", "anomaly", "message"];

// 运行时使用 Map<number, Set<ColumnType>>
let columnFilterConfig: Map<number, Set<ColumnType>> = new Map();

// 持久化格式
interface PersistedFilterConfig {
  filters: Record<number, ColumnType[]>;
  timestamp: number;
}
```

#### 存储键

```typescript
const FILTER_STORAGE_KEY = "hha_column_tracking_filter";
```

#### 辅助函数

```typescript
function getEnabledColumns(coordinatorId: number): Set<ColumnType> {
  return columnFilterConfig.get(coordinatorId) || new Set(ALL_COLUMNS);
}

function isColumnEnabled(coordinatorId: number, column: ColumnType): boolean {
  return getEnabledColumns(coordinatorId).has(column);
}

function getTotalRequestCount(): number {
  let count = 0;
  for (const coordinator of trackedCoordinators) {
    count += getEnabledColumns(coordinator.id).size;
  }
  return count;
}

function getMaxRequestCount(): number {
  return trackedCoordinators.length * ALL_COLUMNS.length;
}
```

### 回归测试检查项
- [ ] 首次加载时，所有辅导员的所有列默认启用
- [ ] 保存配置后刷新页面，配置正确恢复
- [ ] 添加新辅导员后，该辅导员默认全列启用
- [ ] 删除辅导员后，对应过滤配置被清理
- [ ] 配置数据 JSON 序列化/反序列化正确

---

## Story 11.2: 表头 Split Button UI

### 用户故事
**作为** 脚本用户  
**我希望** 看到表头列名旁有向下的箭头按钮  
**以便** 知道可以点击打开过滤菜单

### 验收标准
- [ ] 4 个数据列（上班钟、下班钟、异常打钟、消息）的表头旁显示 ▾ 箭头
- [ ] 编号列和辅导员列不显示箭头
- [ ] 箭头使用 CSS 三角形或 Unicode 字符，不使用图片
- [ ] 箭头有悬停效果（颜色变化或 opacity）
- [ ] 箭头点击时视觉反馈（旋转或颜色变化）
- [ ] 当浮窗打开时，对应箭头保持激活状态样式
- [ ] 没有正在追踪的人员时，箭头不显示（或禁用）
- [ ] 箭头不影响表头文字的 `white-space: nowrap`

### UI 设计

#### 表头结构

```html
<!-- 升级前 -->
<th style="width:80px;">上班钟</th>

<!-- 升级后 -->
<th style="width:80px;">
  <span class="th-label">上班钟</span>
  <span class="th-filter-btn" data-column="clockIn">▾</span>
</th>
```

#### 样式

```less
// 表头标签与箭头的布局
.tracker-table thead th {
  // ... 现有样式
  
  .th-label {
    // 列名文字
  }

  .th-filter-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-left: 2px;
    font-size: 10px;
    color: @text-secondary;
    cursor: pointer;
    border-radius: @radius-xs;
    transition: all @transition-fast;
    vertical-align: middle;

    &:hover {
      color: @primary-color;
      background: fade(@primary-color, 10%);
    }

    &.active {
      color: @primary-color;
      transform: rotate(180deg);
    }
  }
}
```

### 回归测试检查项
- [ ] 4 个数据列显示箭头
- [ ] 编号列和辅导员列不显示箭头
- [ ] 箭头悬停效果正常
- [ ] 箭头不影响表头布局（没有位移或换行）
- [ ] 表头样式与 Epic 10 保持一致

---

## Story 11.3: 过滤浮窗 UI

### 用户故事
**作为** 脚本用户  
**我希望** 点击箭头后弹出人员列表浮窗  
**以便** 选择哪些人需要追踪当前列

### 验收标准

#### 浮窗内容
- [ ] 顶部显示"全选/全不选" checkbox
- [ ] 中间显示当前所有已追踪的辅导员列表，每人一行
- [ ] 每人旁边有一个 checkbox
- [ ] 每人名字旁显示该列当前的数据量（从缓存中读取，如 `(19)`）
- [ ] 底部显示当前总请求量：`当前追踪: X/Y 请求/轮`
- [ ] 底部有"取消"和"✓ 确认"按钮

#### 浮窗行为
- [ ] 浮窗定位在对应箭头正下方
- [ ] 浮窗打开时，对应箭头显示激活状态
- [ ] 点击"确认"按钮保存修改并关闭浮窗
- [ ] 点击"取消"按钮放弃修改并关闭浮窗
- [ ] 点击浮窗外部区域关闭浮窗（放弃修改）
- [ ] 再次点击同一箭头关闭浮窗（放弃修改）
- [ ] 同一时间只能打开一个浮窗（打开新的自动关闭旧的）
- [ ] 没有正在追踪的人员时，不弹出浮窗

#### 交互
- [ ] "全选"checkbox 勾选时，所有人都勾选
- [ ] "全不选"checkbox 取消时，所有人都取消
- [ ] 部分勾选时，"全选"checkbox 显示为半选状态（indeterminate）
- [ ] Checkbox 变化时，底部请求计数实时更新
- [ ] 浮窗内不需要滚动（追踪人数一般不超过 10 人）

#### 视觉
- [ ] 浮窗使用统一的 `@shadow-lg` 阴影
- [ ] 浮窗背景 `@background-white`，圆角 `@radius-md`
- [ ] 浮窗边框 `1px solid @border-color`
- [ ] 人员列表使用 `@spacing-sm` 间距
- [ ] "确认"按钮使用 `.tracker-btn-primary` 样式
- [ ] "取消"按钮使用 `.tracker-btn-secondary` 样式

### UI 设计

#### 浮窗 HTML 结构

```html
<div class="column-filter-popover" data-column="message">
  <div class="filter-header">
    <label class="filter-select-all">
      <input type="checkbox" class="filter-checkbox-all" />
      <span>全选</span>
    </label>
  </div>
  <div class="filter-divider"></div>
  <div class="filter-list">
    <label class="filter-item">
      <input type="checkbox" data-coordinator-id="123" checked />
      <span class="filter-name">Cathy Huang</span>
      <span class="filter-count">(5)</span>
    </label>
    <!-- ... more items ... -->
  </div>
  <div class="filter-divider"></div>
  <div class="filter-stats">
    当前追踪: <strong>16</strong>/<strong>20</strong> 请求/轮
  </div>
  <div class="filter-divider"></div>
  <div class="filter-actions">
    <button class="tracker-btn-secondary filter-cancel-btn">取消</button>
    <button class="tracker-btn-primary filter-confirm-btn">✓ 确认</button>
  </div>
</div>
```

#### 浮窗样式

```less
.column-filter-popover {
  position: absolute;
  z-index: 100003;
  min-width: 220px;
  background: @background-white;
  border: 1px solid @border-color;
  border-radius: @radius-md;
  box-shadow: @shadow-lg;
  padding: @spacing-sm;
  
  .filter-header {
    padding: @spacing-xs @spacing-sm;
  }
  
  .filter-list {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .filter-item {
    display: flex;
    align-items: center;
    gap: @spacing-xs;
    padding: @spacing-xs @spacing-sm;
    cursor: pointer;
    border-radius: @radius-sm;
    
    &:hover {
      background: @background-hover;
    }
  }
  
  .filter-count {
    margin-left: auto;
    color: @text-secondary;
    font-size: @font-size-xs;
  }
  
  .filter-stats {
    padding: @spacing-xs @spacing-sm;
    font-size: @font-size-xs;
    color: @text-secondary;
    text-align: center;
  }
  
  .filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: @spacing-xs;
    padding: @spacing-xs @spacing-sm;
  }
}
```

### 回归测试检查项
- [ ] 浮窗定位正确（箭头正下方）
- [ ] 浮窗内容正确显示所有已追踪人员
- [ ] Checkbox 初始状态与当前过滤配置一致
- [ ] 全选/全不选功能正常
- [ ] 半选状态（indeterminate）正确显示
- [ ] 确认按钮保存修改
- [ ] 取消按钮放弃修改
- [ ] 点击外部关闭浮窗
- [ ] 再次点击箭头关闭浮窗
- [ ] 同时只有一个浮窗打开
- [ ] 请求计数实时更新

---

## Story 11.4: 追踪逻辑集成

### 用户故事
**作为** 系统  
**我希望** 追踪更新逻辑根据过滤配置决定哪些 API 请求需要发送  
**以便** 减少不必要的请求，降低 API 负载

### 验收标准
- [ ] `runTrackingUpdate()` 在发送请求前检查过滤配置
- [ ] 未启用的列不发送对应的 API 请求
- [ ] 未启用的列对应的缓存数据清除（避免显示过期数据）
- [ ] 请求数量减少后，日志中打印实际请求数
- [ ] 缓存同步时包含过滤状态信息（其他 Tab 能正确渲染）

### 技术要点

#### 改造 runTrackingUpdate

```typescript
async function runTrackingUpdate() {
  if (trackedCoordinators.length === 0) return;
  
  // ... 现有缓存检查逻辑 ...
  
  try {
    const officeIds = await getOfficeIds();
    const promises: Promise<void>[] = [];
    
    for (const coordinator of trackedCoordinators) {
      const enabled = getEnabledColumns(coordinator.id);
      
      if (enabled.has("clockIn")) {
        promises.push(
          fetchStatusReport(coordinator.id, 2, officeIds)
            .then(data => statusDataCache.set(`${coordinator.id}-2`, data))
            .catch(err => console.error(err))
        );
      } else {
        statusDataCache.delete(`${coordinator.id}-2`);
      }
      
      if (enabled.has("clockOut")) {
        promises.push(
          fetchStatusReport(coordinator.id, 3, officeIds)
            .then(data => statusDataCache.set(`${coordinator.id}-3`, data))
            .catch(err => console.error(err))
        );
      } else {
        statusDataCache.delete(`${coordinator.id}-3`);
      }
      
      if (enabled.has("anomaly")) {
        promises.push(
          fetchAnomalyReport(coordinator.id)
            .then(data => statusDataCache.set(`${coordinator.id}-anomaly`, data))
            .catch(err => console.error(err))
        );
      } else {
        statusDataCache.delete(`${coordinator.id}-anomaly`);
      }
      
      if (enabled.has("message")) {
        promises.push(
          fetchMessageReport(coordinator.id)
            .then(data => statusDataCache.set(`${coordinator.id}-message`, data))
            .catch(err => console.error(err))
        );
      } else {
        statusDataCache.delete(`${coordinator.id}-message`);
      }
    }
    
    console.log(`[Epic11] Sending ${promises.length}/${getMaxRequestCount()} requests`);
    await Promise.allSettled(promises);
    // ... 后续渲染和缓存逻辑 ...
  }
}
```

### 回归测试检查项
- [ ] 全部启用时，请求数与改造前一致
- [ ] 取消某人的某列后，该列的 API 请求不再发送
- [ ] 取消某列后，对应缓存数据被清除
- [ ] 日志正确打印实际请求数 vs 最大请求数
- [ ] 追踪更新循环正常工作（2 分钟间隔）
- [ ] 缓存同步功能正常

---

## Story 11.5: 视图渲染与 UI 反馈

### 用户故事
**作为** 脚本用户  
**我希望** 未追踪的列显示为 `—`  
**以便** 清楚地知道哪些项被我主动关闭了追踪

### 验收标准
- [ ] 未启用的列单元格显示 `—`（全角破折号）
- [ ] `—` 使用 `@text-secondary` 颜色，与正常数据视觉区分
- [ ] `—` 不可点击（无 cursor: pointer，无点击事件）
- [ ] 启用的列正常显示数字按钮（行为不变）
- [ ] 当某列所有人都未勾选时，该列表头的 ▾ 箭头显示警告色
- [ ] 浮窗中的数据量 `(N)` 从 `statusDataCache` 读取，未追踪项显示 `(—)`

### 技术要点

#### renderTrackingView 改造

```typescript
function renderTrackingView(): void {
  // ... 现有逻辑 ...
  
  const rowsHtml = trackedCoordinators.map((coordinator, index) => {
    const enabled = getEnabledColumns(coordinator.id);
    
    // 为每列生成 HTML
    const clockInCell = enabled.has("clockIn")
      ? `<div class="${clockInClass}" data-coordinator-id="${coordinator.id}" data-call-type="2">${clockInCount}</div>`
      : `<span class="tracking-disabled">—</span>`;
    
    const clockOutCell = enabled.has("clockOut")
      ? `<div class="${clockOutClass}" data-coordinator-id="${coordinator.id}" data-call-type="3">${clockOutCount}</div>`
      : `<span class="tracking-disabled">—</span>`;
    
    const anomalyCell = enabled.has("anomaly")
      ? `<div class="${anomalyClass}" data-coordinator-id="${coordinator.id}" data-call-type="anomaly">${anomalyCount}</div>`
      : `<span class="tracking-disabled">—</span>`;
    
    const messageCell = enabled.has("message")
      ? `<div class="${messageClass}" data-coordinator-id="${coordinator.id}" data-call-type="message">${messageCount}</div>`
      : `<span class="tracking-disabled">—</span>`;
    
    return `
      <tr>
        <td>${index + 1}</td>
        <td class="col-coordinator">${coordinator.name}</td>
        <td>${clockInCell}</td>
        <td>${clockOutCell}</td>
        <td>${anomalyCell}</td>
        <td>${messageCell}</td>
      </tr>`;
  }).join("");
  
  trackingTableBody.innerHTML = rowsHtml;
}
```

#### 未追踪样式

```less
.tracking-disabled {
  color: @text-secondary;
  font-size: @font-size-sm;
  cursor: default;
  user-select: none;
}
```

### 回归测试检查项
- [ ] 启用列正常显示数字按钮
- [ ] 未启用列显示 `—`
- [ ] `—` 不可点击
- [ ] 修改过滤后，视图立即更新
- [ ] 详情弹窗功能不受影响（仅针对启用列）
- [ ] 数字按钮的闪烁动画不受影响

---

## Story 11.6: 跨 Tab 同步

### 用户故事
**作为** 脚本用户  
**我希望** 过滤配置在多个 Tab 之间同步  
**以便** 在任意 Tab 修改配置后，其他 Tab 自动生效

### 验收标准
- [ ] 使用 `GM_setValue` / `GM_getValue` 存储过滤配置（与追踪列表一致）
- [ ] 在一个 Tab 中修改过滤配置后，其他 Tab 通过轮询检测到变化
- [ ] 其他 Tab 检测到变化后，自动重新加载配置并更新视图
- [ ] 同步数据包含时间戳，防止旧数据覆盖
- [ ] BroadcastChannel 用于同域名 Tab 的实时通知

### 技术要点

#### 同步键名

```typescript
const FILTER_STORAGE_KEY = "hha_column_tracking_filter";
```

#### 同步消息类型

在 `SyncMessage` 中添加新的消息类型：

```typescript
interface SyncMessage {
  type: "DATA_UPDATED" | "REQUEST_REFRESH" | "TAB_CLOSING" | "FILTER_UPDATED";
  sourceTabId: string;
  timestamp: number;
}
```

#### 保存时广播

```typescript
function saveColumnFilter(): void {
  // 保存到 GM_setValue
  const data: PersistedFilterConfig = {
    filters: {},
    timestamp: Date.now(),
  };
  columnFilterConfig.forEach((columns, coordinatorId) => {
    data.filters[coordinatorId] = Array.from(columns);
  });
  GM_setValue(FILTER_STORAGE_KEY, JSON.stringify(data));
  
  // 广播变更通知
  tabSyncManager.broadcast({
    type: "FILTER_UPDATED",
    sourceTabId: tabSyncManager.tabId,
    timestamp: Date.now(),
  });
}
```

### 回归测试检查项
- [ ] Tab A 修改过滤后，Tab B 在轮询周期内（5s）自动更新
- [ ] 同域名 Tab 通过 BroadcastChannel 实时同步
- [ ] 跨域名 Tab 通过轮询同步
- [ ] 不会出现旧配置覆盖新配置的情况
- [ ] 现有的数据缓存同步功能不受影响

---

## Story 11.7: 集成测试与细节打磨

### 用户故事
**作为** 开发者  
**我希望** 完成所有细节优化并充分测试  
**以便** 确保新功能完整、稳定、体验流畅

### 验收标准
- [ ] 所有 Story (11.1-11.6) 功能正常
- [ ] 所有 LESS 代码使用统一变量
- [ ] CSS 编译正常，无错误
- [ ] Webpack 构建正常
- [ ] 代码符合项目规范

### 完整功能测试清单

#### 基本过滤功能
- [ ] 点击箭头打开浮窗
- [ ] 取消某人勾选后确认，该单元格显示 `—`
- [ ] 取消某人勾选后确认，下一轮追踪不发送对应请求
- [ ] 重新勾选后确认，恢复正常追踪和显示
- [ ] 全选功能正常
- [ ] 全不选功能正常
- [ ] 半选状态正确
- [ ] 取消按钮放弃修改
- [ ] 请求计数实时正确

#### 浮窗行为
- [ ] 浮窗定位准确
- [ ] 点击外部关闭浮窗
- [ ] 再次点击箭头关闭浮窗
- [ ] 同时只有一个浮窗
- [ ] 浮窗不超出屏幕边界

#### 持久化
- [ ] 刷新页面后过滤配置保持
- [ ] 跨 Tab 同步正常
- [ ] 新添加的辅导员默认全选
- [ ] 删除辅导员后配置被清理

#### 兼容性
- [ ] 与 Epic 10 UI 一致（样式不冲突）
- [ ] 提示弹窗（Details Popover）不受影响
- [ ] 编辑视图功能不受影响
- [ ] 拖拽功能不受影响
- [ ] 多 Tab 同步不受影响

#### 边界情况
- [ ] 只追踪 1 个人时功能正常
- [ ] 所有列都取消后主动显示提示
- [ ] 某人所有列都取消时，该行全部显示 `—`
- [ ] 添加新辅导员后，浮窗列表正确更新

### 回归测试清单
- [ ] 页面加载时 Visit Monitor 正常初始化
- [ ] 拖拽句柄正常
- [ ] 点击句柄展开/收起面板
- [ ] 追踪功能正常
- [ ] 详情弹窗功能正常
- [ ] 编辑视图功能正常
- [ ] 多 Tab 同步正常
- [ ] Toast 通知正常

---

## 技术债务与风险

### 已知风险

1. **浮窗定位**：当表头接近屏幕边缘时，浮窗可能超出可视区域
   - **缓解措施**：添加边界检测逻辑，自动调整方向

2. **配置数据量**：大量辅导员的配置可能增加存储体积
   - **缓解措施**：使用紧凑的 JSON 格式，实际追踪人数不超过 10 人

3. **同步冲突**：多 Tab 同时修改可能导致冲突
   - **缓解措施**：使用时间戳进行最后修改者优先策略

### 回滚计划

如果升级后发现严重问题，可以快速回滚：

1. **代码回滚**
   ```bash
   git revert HEAD   # 回退最新提交
   npm run build     # 重新构建
   ```

2. **数据清理**：过滤配置使用独立的存储键，不影响现有数据

---

## 设计系统参考

本次开发严格遵循项目的统一设计系统：

1. **颜色系统**：[src/style/variables.less](../../src/style/variables.less)
2. **追踪面板样式**：[src/style/coordinator-tracker.less](../../src/style/coordinator-tracker.less)
3. **Epic 10 UI 标准**：[docs/stories/epic-10-visit-monitor-ui-upgrade.md](./epic-10-visit-monitor-ui-upgrade.md)

### 核心设计原则
- 使用 `@spacing-*` 变量统一间距
- 使用 `@radius-*` 变量统一圆角
- 使用 `@shadow-*` 变量统一阴影
- 使用 `.tracker-btn-primary` / `.tracker-btn-secondary` 按钮样式
- 浮窗 z-index: `100003`（高于详情弹窗的 `100001`）

---

## 附录：API 请求量对比

### 优化前（5 人追踪）

```
每轮请求: 5人 × 4列 = 20 请求
每分钟请求: 20 × 30秒/轮 ≈ 10 请求/分钟（2分钟间隔）
```

### 优化后（5 人追踪，关闭 Tracy 消息 + 全员关闭下班钟）

```
每轮请求: 4人×3列 + 1人×2列 = 14 请求
节省: 6 请求/轮 (30% 减少)
```

### Change Log

| Date | Story | Changes |
|------|-------|---------|
| 2026-02-28 | Epic 11 | 创建 Epic 文档，规划 7 个 Story |
