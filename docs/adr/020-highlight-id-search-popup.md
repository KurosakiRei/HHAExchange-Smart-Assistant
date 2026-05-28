# ADR-020: Highlight ID Search（AHC/AMD）与统一 Toast 反馈

## 状态
Accepted (2026-05-28)

## 背景

当前 `Highlight2Call` 已支持电话号码划词弹窗与一键搜索，但针对 `AHC-XXXX`~`AHC-XXXXXX` / `AMD-XXXX`~`AMD-XXXXXX`（4-6 位数字）这类 ID，用户仍需手动复制再到 Quick Search Tab 输入，步骤冗长。

已确认的产品目标如下：

1. 用户在 Outlook 与 HHAExchange 页面全局选中 ID 后，出现与现有 `highlight2call` 风格一致的浮层。
2. 点击按钮后直接进入搜索结果弹窗，不走“先填 Quick Search Tab 再搜索”。
3. ID 匹配接受大小写，但不接受无连字符格式。
4. 同一选区同时命中电话与 ID 时，优先按 ID 处理。
5. 未命中搜索结果时使用轻提示 toast；不在 action popup 内展示“未找到”（因为点击 action 后 popup 已关闭）。

此外，本变更必须显式规避历史 toast 回归（位置漂移、颜色可读性不足、被遮挡、动画缺失）。

---

## 决策

### D1：交互模型采用“直接出结果弹窗”

**选定**：ID action 点击后直接执行搜索并弹出结果窗口，复用现有 `HhaSearchService` 的结果展示链路（`displayCombinedResults` / `displaySingleResult`），不通过 Quick Search Tab 中转。

**原因**：
- 减少一步“填表单”操作，交互与用户预期一致；
- 与电话划词动作同类化，认知成本低；
- 实现路径最短，复用代码最多。

### D2：ID 识别规则严格限定（大小写不敏感 + 强制连字符 + 4-6 位数字）

**选定**：匹配规则采用大小写不敏感正则：

```regex
\b(?:AHC|AMD)-\d{4,6}\b
```

并在内部标准化为大写（如 `ahc-1234` -> `AHC-1234`，`amd-123456` -> `AMD-123456`）。

**明确不支持**：
- `AHC123456`（无连字符）
- 位数不在 4-6 之间的数字段

### D3：匹配优先级采用“ID > 电话”

**选定**：若同一选区同时命中 ID 与电话，优先展示 ID 搜索 action。

**原因**：
- 该优先级为业务明确要求；
- 避免同一选区出现歧义动作，降低误触发。

### D4：Outlook 适用范围为全页面

**选定**：Outlook 域名下采用全页面监听策略，不限制在邮件阅读区或特定容器内。

**实现约束**：
- 监听保持 capture phase（`mouseup` / `mousedown`）以提升在复杂页面的命中稳定性；
- 读取选区保持“延后一拍”策略（`setTimeout(..., 0)`）避免同步读取空选区；
- 继续保留 editable 输入框选区回退逻辑。

### D5：搜索路由采用共享服务，并新增按 ID 调用入口

**选定**：新增按 ID 的外部入口（如 `searchHhaById`），内部使用：

- `fetchAllPages("aide", { id })`
- `fetchAllPages("patient", { id })`

再按结果分流：
- 双端都有结果 -> `displayCombinedResults`
- 单端有结果 -> `displaySingleResult`
- 双端无结果 -> 轻提示 toast

### D6：Toast 规范化与回归防护

**选定**：ID 搜索失败/租户缺失等轻提示统一采用“顶部居中轻提示 toast”规范，禁止使用 action popup 内文案替代。

**最低视觉与行为规范**：

1. 定位：`position: fixed; top: 20px; left: 50%; transform: translateX(-50%) ...`
2. 字体：与现有模块保持同级字号（13-14px）与高对比字体色（白字）。
3. 层级：`z-index` 必须高于业务 overlay，避免“toast 在遮罩后方不可见”。
4. 动效：进入/退出需有淡入位移动画，避免生硬闪现。
5. 生命周期：自动消失，不抢焦点，不阻塞用户继续操作。

**回归约束来源**：此前已出现 toast 左下角漂移、层级被遮挡、动画缺失等问题，本次必须在验收清单中单列。

### D7：UI 必须复用现有 Highlight Popup 视觉语言

**选定**：ID action popup 复用现有 `#highlight-caller-popup` 视觉体系（圆角、阴影、按钮尺寸、字体层级、关闭按钮行为），仅扩展 action 文案与数据绑定，不引入与现有风格不一致的独立主题。

### D8：Outlook 租户缺失场景使用 toast 兜底

**选定**：若 Outlook 环境无法获得可用租户（包括缓存为空），不进行静默失败；弹出 toast 指引用户先打开一次 HHA 页面同步租户信息。

---

## 实施与验收结果（2026-05-28）

- [x] `Highlight2Call` 已支持 AHC/AMD ID（4-6 位）高亮识别，且保持 ID 优先级高于电话。
- [x] ID action 点击后直接走 `HhaSearchService` 结果弹窗链路，不再依赖 Quick Search Tab 中转。
- [x] Outlook 与 CallReports 页面均已接入可用触发链路，包含复杂页面/iframe 场景兜底。
- [x] Toast 反馈已统一为顶部居中轻提示，覆盖“无结果”和“租户缺失”场景。
- [x] 与 Issue #25 对齐的手动验收已通过。

---

## 后果

### 正面影响

1. 删除“复制 ID -> 切换 Tab -> 粘贴 -> 搜索”的冗余路径，显著减少操作步数。
2. 与现有电话划词交互统一，学习成本低。
3. 复用现有搜索与结果弹窗能力，变更面可控。
4. 明确 toast 规范并纳入验收，可降低 UI 回归概率。

### 负面影响 / 风险

1. Outlook 全页面监听可能提高事件处理频率。
2. 依赖租户缓存时，首次仅在 Outlook 打开且无缓存会触发“不可搜索”提示。
3. 同时维护电话与 ID 两类动作，需谨慎处理优先级与互斥逻辑。

### 风险缓解

1. 监听仅在选区非空且命中正则时才创建 popup。
2. 对租户缺失场景提供明确 toast 指引，不做静默失败。
3. 用回归测试矩阵覆盖：ID 优先级、大小写匹配、连字符约束、toast 可见性与层级。

---

## 非目标

1. 不支持无连字符 ID（如 `AHC123456`）。
2. 不在本次引入“自动跳转 Profile”策略；沿用现有结果弹窗展示模式。
3. 不在 action popup 内显示“未找到”文本。

---

## 相关文件（实际）

1. `src/js/Highlight2Call.ts`
2. `src/js/IncomingCallHandler.ts`
3. `src/js/services/HhaSearchService.ts`
4. `src/index.ts`
5. `docs/stories/epic-22-highlight-id-search.md`

---

## 关联需求

1. GitHub Issue #25: HHAexchange 辅助脚本增加 Highlight 搜索 AHC/AMD ID（支持病人与护理员）
