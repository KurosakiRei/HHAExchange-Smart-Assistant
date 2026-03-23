---
id: TD-005
title: "Duplicate Call 清理队列执行卡住（5 个 Bug + Tampermonkey Sandbox 陷阱）"
status: Fixed
created: 2026-03-23
fixed: 2026-03-23
severity: High
components:
  - CleaningController.ts
---

## 摘要

Duplicate Call 批量清理功能（"一键清理全部"）在执行过程中会永久卡住，无法推进到下一个任务，最终导致整个队列冻结。经过远程 Chrome DevTools 调试，发现共有 **5 个独立 Bug**，形成一条完整的故障链。其中 Bug 5 涉及 Tampermonkey sandbox 与页面真实 `window` 的隔离机制，是最深层的根因。

---

## Bug 1：isModalOpen 假阳性永久阻塞 Polling

### 现象

队列 polling 每秒检查一次 `isModalOpen`，但始终返回 `true`，导致 polling 永远不触发下一任务。

### 根本原因

页面预建了两个空的 modal 容器：`#modal-callmaintenance`、`#modal-visiteditreasonactiontakennote`。这两个元素 CSS 为 `display: flex`，但 `innerHTML` 为空（无实际内容）。旧的 `isModalOpen` 检查不区分"有内容的 modal"和"空容器"，导致永远返回 `true`。

### 修复

过滤 `el.innerHTML.trim().length <= 10` 的空容器，仅计算有实际内容的 modal：

```typescript
const visibleModals = Array.from(
  document.querySelectorAll('.reveal-overlay, [id*="PopWin"], .hhax-modal')
).filter(el =>
  window.getComputedStyle(el).display !== "none" &&
  el.innerHTML.trim().length > 10
);
```

---

## Bug 2：#confirmDelete 被 callback 异常永久卡住

### 现象

`#confirmDelete` 在点击 OK 后不关闭，`display` 始终为 `block`，触发 Bug 1 中的假阳性，polling 无限等待。

### 根本原因

Foundation reveal modal 的 `confirmDeleteFn` 执行顺序为：
1. 调用 `options.callback(true)` — callback 内部调用 `CallMaintenance_ns.RejectCall()`
2. 调用 `confirmDelmodal.close()`

由于 Bug 5（`CallMaintenance_ns.RejectCall` 不存在），步骤 1 抛出 `ReferenceError`，步骤 2 永不执行，modal 永久 `display: block`。

### 修复

在 polling 中检测 `#confirmDelete` 卡住超过 5 秒时自动强制关闭：

```typescript
if (Date.now() - this.confirmDeleteStuckSince > 5000) {
  confirmDeleteEl.style.display = "none";
  this.confirmDeleteStuckSince = 0;
}
```

---

## Bug 3：offsetParent 检测不适合 Foundation reveal modal

### 现象

`handleCallRejectConfirmation` 最多重试 15 次，但每次都无法找到 OK 按钮，最终放弃。

### 根本原因

旧代码用 `btn.offsetParent !== null` 判断按钮是否可见。Foundation reveal modal 使用 `position: fixed`，其祖先链中存在 `position: fixed` 元素，导致 `offsetParent` 始终为 `null`，即使 modal 实际上是打开和可见的。

### 修复

改为检查 modal 容器本身的 `getComputedStyle().display`：

```typescript
const modal = btn.closest(".hhax-modal, .reveal") as HTMLElement | null;
const isVisible = modal
  ? window.getComputedStyle(modal).display !== "none"
  : window.getComputedStyle(btn).display !== "none";
```

---

## Bug 4：MAX_RETRIES 耗尽后不推进队列

### 现象

即使 Bug 3 修复后按钮找到了，一旦发生任何异常导致重试耗尽，队列会永久冻结在当前 index。

### 根本原因

旧代码在 `retryCount >= MAX_RETRIES` 时只打一行 log，`queue.currentIndex` 不增加。由于 polling 的推进条件是 `queue.currentIndex > this.lastStartedIndex`，而 `lastStartedIndex` 在本次任务启动时已经被更新为 `currentIndex`，之后 polling 的条件永远不成立，队列冻结。

### 修复

耗尽重试后强制推进 `queue.currentIndex++` 并标记 error，确保队列总能继续：

```typescript
queue.tasks[queue.currentIndex].error =
  "Confirmation dialog not found — may have silently succeeded";
queue.currentIndex++;
GM_setValue(CLEANING_QUEUE_KEY, queue);
```

---

## Bug 5：CallMaintenance_ns AjaxPro 代理未初始化（核心根因）

### 现象

每次点击 `#confirmDelete` 的 OK 按钮，控制台抛出 `Uncaught ReferenceError: CallMaintenance_ns is not defined`，实际的服务器端 Reject 操作从未被发送。

### 根本原因

页面通过 `<script src="...ajaxpro/CallMaintenance_ns,HHAExchangeUI.ashx">` 加载 AjaxPro 代理。调试发现该脚本标签存在于 DOM 中，ashx 内容也正确（以 `CallMaintenance_ns = new CallMaintenance_ns_class()` 结尾），但 `window.CallMaintenance_ns` 始终为 `undefined`。

经 `performance.getEntriesByType('resource')` 分析，该 ashx 在页面首次加载时 `transferSize` 仅 300 字节（真实内容应为 1757 字节），说明首次加载时服务器返回了重定向响应（可能是 session 过期导致的 302 到登录页），脚本内容实际上是 HTML，执行后静默失败，`CallMaintenance_ns` 从未被赋值。

### 第一次修复尝试（失败）

使用 `fetch()` 获取 ashx 内容，然后 `eval(text)` 重新执行：

```typescript
const text = await resp.text();
eval(text); // ← 失败
```

**失败原因**：Tampermonkey 脚本运行在 sandbox 环境（因为使用了 `GM_setValue` 等 GM API，Tampermonkey 自动启用隔离沙箱）。`eval()` 在 sandbox 的 global scope 执行，`CallMaintenance_ns = new ...` 被赋值到 sandbox 的 `window`（代理对象），而非页面真实的 `window`。页面原生的 `RejectCall()` 函数查找的是页面 `window.CallMaintenance_ns`，仍然找不到，错误依旧。

### 最终修复

新增 `ensureCallMaintenanceNs()` 方法，采用两步策略：

1. **用 `unsafeWindow` 检测**：`unsafeWindow` 是 Tampermonkey 提供的对页面真实 `window` 的直接引用，不经过 sandbox 代理，可正确判断页面上下文中变量是否存在。

2. **用 `GM.addElement` 注入 `<script src>`**：`GM.addElement` 以 Tampermonkey privileged context 创建 DOM 元素，能绕过页面 CSP，且注入的 `<script>` 标签在页面真实 global 中执行，变量注册到真实 `window` 上。加 `?_r=时间戳` 参数破坏浏览器缓存，防止重新注入时被跳过。

3. **URL 动态提取**：从页面已有的 `<script src="...CallMaintenance_ns...ashx">` 标签中提取 URL，无需硬编码租户路径（如 `/ENT2603010000/`）。

```typescript
private static async ensureCallMaintenanceNs(): Promise<void> {
  const pageWin = unsafeWindow as unknown as Record<string, unknown>;
  const ns = pageWin["CallMaintenance_ns"] as Record<string, unknown> | undefined;
  if (ns && typeof ns["RejectCall"] === "function") return;

  const existingScript = Array.from(document.scripts).find(s =>
    s.src.includes("CallMaintenance_ns,HHAExchangeUI.ashx")
  );
  const ashxUrl = existingScript?.src || "";

  await new Promise<void>((resolve, reject) => {
    const script = GM.addElement(document.head, "script", {
      src: ashxUrl.split("?")[0] + "?_r=" + Date.now(),
      type: "text/javascript",
    }) as HTMLScriptElement;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to reload CallMaintenance_ns"));
  });
}
```

---

## 关键技术知识点（供后续维护参考）

| 场景 | 正确做法 | 错误做法 |
|------|---------|---------|
| 检测页面 `window` 上的变量 | 使用 `unsafeWindow.xxx` | 使用 `window.xxx`（sandbox 代理） |
| 在页面 global 执行代码 | `GM.addElement` 注入 `<script>` | `eval()`（在 sandbox 中执行） |
| 检测 Foundation reveal modal 可见性 | `getComputedStyle(modal).display !== "none"` | `btn.offsetParent !== null` |
| 判断 modal 是否有实际内容 | `el.innerHTML.trim().length > 10` | `getComputedStyle(el).display !== "none"` |

## 现实影响

- **消除队列冻结**：5 个 Bug 修复后，Duplicate Call 批量清理可完整执行全部任务，不再卡住。
- **服务器操作保证**：`ensureCallMaintenanceNs()` 确保每次 Reject 前 AjaxPro 代理已就绪，Reject 操作真实到达服务器。
- **自愈机制**：`#confirmDelete` stuck 超时自动关闭，MAX_RETRIES 耗尽自动推进，降低人工干预需求。
