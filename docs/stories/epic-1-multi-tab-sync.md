# Epic 1: Visit Monitor 多 Tab 数据同步

## Epic 概述

| 属性 | 值 |
|-----|---|
| **Epic ID** | EPIC-001 |
| **标题** | 多 Tab 数据同步 - 跨域名升级版 |
| **优先级** | P0 - 关键缺陷修复 |
| **状态** | ✅ 已完成 (2025-12-15) |
| **实际工作量** | 4 个 Story + 跨域升级 |
| **关联 ADR** | [ADR-001](../adr/001-multi-tab-sync.md) |

## 背景与目标

### 当前问题
Visit Monitor 在多标签页场景下，每个标签页独立发起 API 请求，导致：
- API 重复调用，浪费资源
- 可能触发服务器限流
- 数据不同步，用户体验差

### 目标
实现基于 **GM_setValue/GM_getValue + BroadcastChannel** 的跨域名多 Tab 数据同步，使得：
- 多 Tab 共享数据，减少 API 调用
- **跨域名同步**：app.hhaexchange.com 和 mt3.1voicetech.com 之间共享缓存
- 数据实时同步，保持一致性
- 向后兼容，单 Tab 场景正常工作

### 🆕 升级亮点（v3.3.0）
- ✨ **跨域名支持**：使用 GM_setValue 替代 localStorage，实现真正的跨域数据共享
- ⚡ **双通道机制**：同域名用 BroadcastChannel（实时），跨域名用轮询（5秒延迟）
- 🔍 **智能检测**：自动识别更新来源，避免重复处理

## 验收标准 (Epic 级别)

- [x] 打开多个标签页时，只有一个标签页发起 API 请求
- [x] 所有标签页显示相同的数据
- [x] 新打开的标签页能立即获取缓存数据
- [x] 数据更新后，所有标签页实时同步（同域名 < 1s，跨域名 < 5s）
- [x] 单标签页场景功能不受影响
- [x] 浏览器刷新后数据正常恢复
- [x] **跨域名同步**：app.hhaexchange.com 和 mt3.1voicetech.com 之间数据共享

---

## Story 1: 实现 TabSyncManager 核心模块

### Story 描述
作为开发者，我需要在 `src/js/VisitMonitor.ts` 文件内部添加 TabSyncManager 类来管理多 Tab 数据同步逻辑。

### 代码架构决策
> **方案 A+**: 保持 `VisitMonitor.ts` 单文件结构，TabSyncManager 作为内部类实现。
> 
> **理由**: Tampermonkey 脚本最终打包为单文件，避免不必要的模块拆分和重构风险。

### 验收标准
- [x] 在 `VisitMonitor.ts` 内部创建 `TabSyncManager` 类
- [x] 实现 Tab ID 生成和管理
- [x] 实现 localStorage 读写封装
- [x] 实现 BroadcastChannel 消息发送/接收
- [x] 包含完整的 TypeScript 类型定义和 JSDoc 注释

### 技术要点

```typescript
// 位置: src/js/VisitMonitor.ts (在文件顶部类型定义区域添加)

// --- TAB SYNC TYPES ---
interface SyncCacheData {
  data: Record<string, TrackedData>;  // 使用 Record 便于 JSON 序列化
  timestamp: number;
  sourceTabId: string;
}

interface SyncMessage {
  type: 'DATA_UPDATED' | 'REQUEST_REFRESH' | 'TAB_CLOSING';
  sourceTabId: string;
  timestamp: number;
}

// --- TAB SYNC MANAGER (在 visitMonitor 函数内部定义) ---
/**
 * 管理多 Tab 之间的数据同步
 * 使用 localStorage 存储共享数据，BroadcastChannel 实时通知
 */
class TabSyncManager {
  public readonly tabId: string;
  private channel: BroadcastChannel | null = null;
  private readonly CACHE_KEY = 'hha_visit_monitor_cache';
  private readonly CHANNEL_NAME = 'hha-visit-monitor-sync';
  private readonly FRESH_THRESHOLD = 30 * 1000;      // 30秒内视为新鲜
  private readonly STALE_THRESHOLD = 2 * 60 * 1000;  // 2分钟后视为过期
  
  constructor() { /* ... */ }
  
  getCachedData(): SyncCacheData | null { /* ... */ }
  setCachedData(data: Map<string, TrackedData>): void { /* ... */ }
  broadcast(message: SyncMessage): void { /* ... */ }
  onMessage(callback: (msg: SyncMessage) => void): void { /* ... */ }
  shouldFetchFresh(cachedTimestamp: number): 'USE' | 'USE_AND_REFRESH' | 'REFRESH' { /* ... */ }
  cleanup(): void { /* ... */ }
}
```

### 任务清单
- [x] 在 `src/js/VisitMonitor.ts` 顶部添加 Sync 相关类型定义
- [x] 在 `visitMonitor` 函数内部实现 `TabSyncManager` 类
- [x] 为所有方法添加 JSDoc 注释
- [x] 实例化 `tabSyncManager` 变量供后续 Story 使用

---

## Story 2: 集成缓存检查逻辑

### Story 描述
作为用户，当我打开新标签页时，应该立即看到已有的监控数据，而不是等待 API 请求。

### 验收标准
- [x] 面板打开时首先检查 localStorage 缓存
- [x] 缓存 < 30 秒：直接使用，不发起 API
- [x] 缓存 30s-2min：显示缓存数据，后台排队刷新
- [x] 缓存 > 2min 或无缓存：立即刷新
- [x] UI 显示"上次更新时间"

### 技术要点

```typescript
// 位置: src/js/VisitMonitor.ts - 修改 runTrackingUpdate 函数

async function runTrackingUpdate() {
  // 🆕 Step 1: 检查缓存
  const cached = tabSyncManager.getCachedData();
  
  if (cached) {
    const decision = tabSyncManager.shouldFetchFresh(cached.timestamp);
    
    if (decision === 'USE') {
      // 缓存新鲜，直接使用，跳过 API
      restoreFromCache(cached.data);
      renderTrackingView();
      updateLastRefreshTime(cached.timestamp);
      return;
    }
    
    if (decision === 'USE_AND_REFRESH') {
      // 先显示缓存，然后后台刷新
      restoreFromCache(cached.data);
      renderTrackingView();
      updateLastRefreshTime(cached.timestamp);
      // 继续执行下面的 API 调用
    }
  }
  
  // 原有的 API 调用逻辑...
}

// 🆕 辅助函数：从缓存恢复数据到 statusDataCache
function restoreFromCache(data: Record<string, TrackedData>): void {
  statusDataCache.clear();
  for (const [key, value] of Object.entries(data)) {
    statusDataCache.set(key, value);
  }
}

// 🆕 辅助函数：更新 UI 上的"上次更新时间"
function updateLastRefreshTime(timestamp: number): void {
  const timeEl = document.getElementById('last-refresh-time');
  if (timeEl) {
    const date = new Date(timestamp);
    timeEl.textContent = `上次更新: ${date.toLocaleTimeString()}`;
  }
}
```

### 任务清单
- [x] 修改 `initialize()` 函数，实例化 `tabSyncManager`
- [x] 修改 `runTrackingUpdate()` 函数，添加缓存检查逻辑
- [x] 添加 `restoreFromCache()` 辅助函数
- [x] 在 panel header 添加"上次更新时间"显示元素
- [x] 添加 `updateLastRefreshTime()` 辅助函数
- [x] 测试三种缓存场景 (USE / USE_AND_REFRESH / REFRESH)

---

## Story 3: 实现跨 Tab 数据广播

### Story 描述
作为用户，当一个标签页获取到新数据时，其他标签页应该自动更新。

### 验收标准
- [x] API 请求完成后，数据写入 localStorage
- [x] 通过 BroadcastChannel 通知其他 Tab
- [x] 其他 Tab 收到通知后更新 UI
- [x] 防止循环更新（检查 sourceTabId）

### 技术要点

```typescript
// 位置: src/js/VisitMonitor.ts - 修改 runTrackingUpdate 函数末尾

async function runTrackingUpdate() {
  // ... 原有 API 调用逻辑 ...
  
  await Promise.allSettled(promises);
  renderTrackingView();
  
  // 🆕 API 完成后：保存缓存并广播
  tabSyncManager.setCachedData(statusDataCache);
  tabSyncManager.broadcast({
    type: 'DATA_UPDATED',
    sourceTabId: tabSyncManager.tabId,
    timestamp: Date.now()
  });
  updateLastRefreshTime(Date.now());
  
  console.log("Tracking update complete. Broadcasted to other tabs.");
}

// 🆕 在 initialize() 中注册消息监听
function initialize() {
  // ... 原有初始化逻辑 ...
  
  // 监听其他 Tab 的数据更新
  tabSyncManager.onMessage((msg) => {
    if (msg.type === 'DATA_UPDATED' && msg.sourceTabId !== tabSyncManager.tabId) {
      console.log(`[Tab ${tabSyncManager.tabId}] Received update from Tab ${msg.sourceTabId}`);
      const cached = tabSyncManager.getCachedData();
      if (cached) {
        restoreFromCache(cached.data);
        renderTrackingView();
        updateLastRefreshTime(cached.timestamp);
      }
    }
  });
}
```

### 任务清单
- [x] 在 `runTrackingUpdate()` API 完成后调用 `setCachedData()` 和 `broadcast()`
- [x] 在 `initialize()` 中调用 `tabSyncManager.onMessage()` 注册监听
- [x] 添加 `sourceTabId` 检查防止自我触发更新
- [x] 添加 console.log 调试信息便于验证

---

## Story 4: 边缘情况处理与优化

### Story 描述
作为开发者，我需要处理各种边缘情况，确保功能稳定可靠。

### 验收标准
- [x] 处理 BroadcastChannel 不支持的情况（降级到仅 localStorage）
- [x] 处理 localStorage 满的情况（清理旧数据）
- [x] 处理 JSON 解析错误
- [x] Tab 关闭时的清理逻辑
- [x] 添加错误日志

### 技术要点

```typescript
class TabSyncManager {
  private channelSupported: boolean;
  
  constructor() {
    // 检测 BroadcastChannel 支持
    this.channelSupported = typeof BroadcastChannel !== 'undefined';
    
    if (this.channelSupported) {
      this.channel = new BroadcastChannel(this.CHANNEL_NAME);
    }
    
    // Tab 关闭时清理
    window.addEventListener('beforeunload', () => this.cleanup());
  }
  
  private handleStorageError(error: Error): void {
    if (error.name === 'QuotaExceededError') {
      // 清理旧缓存
      this.clearOldCache();
    }
    console.error('[TabSyncManager] Storage error:', error);
  }
}
```

### 任务清单
- [x] 添加 BroadcastChannel 特性检测
- [x] 实现 localStorage 错误处理
- [x] 实现缓存清理策略
- [x] 添加 `beforeunload` 清理
- [x] 添加调试日志

---

## 技术约束

1. **环境限制**：必须在 Tampermonkey 环境中运行
2. **API 限制**：使用 GM_fetch，不能用原生 fetch
3. **存储限制**：localStorage 5MB 限制
4. **兼容性**：BroadcastChannel 需要 Chrome 54+, Firefox 38+

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|-----|-----|-----|---------|
| BroadcastChannel 不支持 | 低 | 中 | 降级到仅 localStorage 轮询 |
| localStorage 满 | 低 | 低 | 实现数据清理策略 |
| 竞态条件 | 中 | 中 | timestamp + sourceTabId 检查 |

## 完成定义 (DoD)

- [x] 所有 Story 验收标准通过
- [x] 代码已添加 JSDoc 注释
- [x] 无 TypeScript 编译错误
- [x] 手动测试多 Tab 场景通过
- [x] 单 Tab 场景回归测试通过

## 变更日志

| 日期 | 版本 | 变更内容 | 作者 |
|-----|-----|---------|-----|
| 2024-12-13 | 1.0 | 初始创建 | BA |
| 2025-12-15 | 2.0 | ✅ Epic 完成 - 升级到跨域名支持 | Dev + QA |

---

## 🎉 Epic 完成总结

### 实现亮点
1. **跨域名数据共享**：使用 GM_setValue/GM_getValue 替代 localStorage
2. **双通道机制**：
   - BroadcastChannel：同域名实时通知（< 1秒）
   - 轮询机制：跨域名更新检测（5秒间隔）
3. **智能缓存策略**：30秒新鲜 / 2分钟过期
4. **完善的错误处理**：JSON 解析、特性检测、降级方案

### 性能优化
- 跨域轮询仅在缓存有变化时触发回调
- Tab ID 包含域名信息便于调试
- 完整的 getDebugInfo() 支持

### 测试覆盖
- ✅ 同域名多 Tab 实时同步
- ✅ 跨域名多 Tab 延迟同步（< 5秒）
- ✅ 单 Tab 场景功能正常
- ✅ BroadcastChannel 不可用降级
- ✅ 缓存新鲜度策略正确

### 技术债务
无重大技术债务。未来可考虑：
- 将轮询间隔改为可配置
- 添加数据压缩以减少 GM_setValue 存储大小
- 实现增量更新而非全量替换
