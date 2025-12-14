# ADR-001: 多 Tab 数据同步方案

## 状态
已决定 (2024-12-07)

## 背景

Visit Monitor 脚本在用户打开多个 HHAExchange 标签页时，每个标签页都会独立发起 API 请求。这导致：
1. **API 重复调用**：N 个标签页 = N 倍的 API 请求量
2. **服务器压力**：不必要的请求可能触发限流
3. **资源浪费**：重复获取相同数据

## 决策

**选择方案 D：localStorage + BroadcastChannel**

### 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      localStorage                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ hha_visit_monitor_cache: {                          │    │
│  │   data: {...},                                      │    │
│  │   timestamp: 1702000000000,                         │    │
│  │   sourceTabId: "tab_abc123"                         │    │
│  │ }                                                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐         ┌──────────┐         ┌──────────┐
   │  Tab A   │◄───────►│  Tab B   │◄───────►│  Tab C   │
   │ (Leader) │         │(Follower)│         │(Follower)│
   └──────────┘         └──────────┘         └──────────┘
         │                    ▲                    ▲
         │                    │                    │
         └────────────────────┴────────────────────┘
                   BroadcastChannel
              'hha-visit-monitor-sync'
```

### 数据流

1. **Tab 打开时**：检查 localStorage 缓存
2. **缓存新鲜 (<30s)**：直接使用，不发起 API
3. **缓存可用 (<2min)**：使用缓存，但排队刷新
4. **缓存过期 (>2min)**：立即发起 API
5. **API 完成后**：更新 localStorage，通过 BroadcastChannel 通知其他 Tab

### 缓存策略

| 缓存年龄 | 行为 |
|---------|------|
| < 30 秒 | 直接使用缓存，跳过 API |
| 30s - 2min | 使用缓存显示，后台排队刷新 |
| > 2 分钟 | 缓存失效，立即刷新 |

## 考虑的替代方案

### 方案 A: 仅 localStorage 轮询
- **优点**：实现简单
- **缺点**：轮询效率低，延迟高
- **结论**：❌ 不够实时

### 方案 B: 仅 BroadcastChannel
- **优点**：实时性好
- **缺点**：新 Tab 无法获取历史数据
- **结论**：❌ 冷启动问题

### 方案 C: SharedWorker
- **优点**：最优雅的共享机制
- **缺点**：
  - Tampermonkey 环境无法托管 Worker 文件
  - GM_fetch 在 Worker 中不可用
  - 调试困难
- **结论**：❌ 环境限制

### 方案 D: localStorage + BroadcastChannel ✅
- **优点**：
  - 结合两者优势
  - localStorage 解决冷启动
  - BroadcastChannel 提供实时通知
  - 完全在 Tampermonkey 环境中运行
- **缺点**：
  - 需要处理 localStorage 容量限制
  - 需要防止竞态条件
- **结论**：✅ 最适合 Tampermonkey 环境

## 技术细节

### localStorage Key
```typescript
const CACHE_KEY = 'hha_visit_monitor_cache';
```

### BroadcastChannel 名称
```typescript
const CHANNEL_NAME = 'hha-visit-monitor-sync';
```

### 消息类型
```typescript
interface SyncMessage {
  type: 'DATA_UPDATED' | 'REQUEST_REFRESH';
  sourceTabId: string;
  timestamp: number;
  data?: CacheData;
}
```

### 竞态条件处理
- 使用 `sourceTabId` 标识数据来源
- 检查 `timestamp` 防止旧数据覆盖新数据
- 使用锁机制防止并发写入

## 后果

### 正面
- 显著减少 API 调用量（理论上 N 个 Tab → 1 个 Tab 的请求量）
- 提升用户体验（数据加载更快）
- 降低被限流风险

### 负面
- 代码复杂度增加
- 需要处理边缘情况（localStorage 满、BroadcastChannel 不支持等）

### 风险
- BroadcastChannel 在某些旧浏览器不支持（需要 fallback）
- localStorage 5MB 限制（需要数据清理策略）

## 参考
- [BroadcastChannel API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- [localStorage - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
