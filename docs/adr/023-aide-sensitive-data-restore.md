# ADR-023: Aide 页面敏感信息（DOB/SSN）显示恢复与搜索结果生日补全架构决策

## 状态

Accepted (2026-08-13)

## 关联 Story

- `docs/stories/epic-24-aide-sensitive-data-restore.md`

## 背景

HHAExchange 护理员档案页（`Aide/Aide_ns.aspx`）与搜索功能近期出现生日/SSN 掩码显示：

1. 档案页左栏信息区 `Date of Birth` 显示 `XX/XX/XXXX`（截图 1 红箭头①）。
2. 档案页 Demographics 区 `Date of Birth *` 显示 `xx/xx/xxxx`（截图 1 红箭头②）。
3. 档案页 Demographics 区 `Social Security Number *` 显示 `XXX-XX-4421`（截图 1 红箭头③）。
4. 快速搜索结果表格 `Date of Birth` 列显示 `XX/XX/XXXX`（截图 3）。

### 现场取证结论（2026-08-13，AideId=3632255，Chrome DevTools 实测）

1. **真实数据已随页面下发到浏览器**：隐藏字段 `#uxHfDtDOB` / `#hidprevDOB` = `07/15/1956`；`#uxHfSSN` / `#hidprevSSN` = `830-39-4421`。官方掩码开关 `#uxHidIsAccessSSNOrBirthDate` = `False`（当前账号无 SSN/DOB 查看权限，官方主动掩码，页面上有对应 tooltip 说明）。
2. **三个显示位均在 Aide_ns.aspx 顶层文档**（不在 iframe 内），映射关系如下：

| 位置 | 可见元素（view 模式） | 掩码值 | 真实值来源（隐藏字段） |
|---|---|---|---|
| 左栏信息区 DOB | `#ctl00_ContentPlaceHolder1_uxlblInfoDOB`（SPAN） | `XX/XX/XXXX` | `#uxHfDtDOB` → `#hidprevDOB` |
| Demographics DOB | `#uxLblPDOB`（SPAN，可见） | `XX/XX/XXXX` | 同上 |
| Demographics DOB 编辑态 | `#uxDtDOB`（`type=date`，view 模式 `display:none`） | 空值 | 同上（需转 `YYYY-MM-DD`） |
| Demographics SSN | `#uxLblPSSN`（SPAN，可见） | `XXX-XX-4421` | `#uxHfSSN` → `#hidprevSSN` |
| Demographics SSN 编辑态 | `#uxTxtSSN`（text input，`readonly`，view 模式 `display:none`） | `XXX-XX-4421` | 同上 |

3. **嵌套结构注意点**：页面内 `#frame_NewCaregiverCompilanceConfiguration` 的 `src` 本身就是 `Aide_ns.aspx?AideId=...`（Compliance 配置区懒加载一个嵌套 Aide_ns 页）。userscript 会在同源每个 window 执行，恢复模块必须按当前 window 作用域工作且幂等，不能依赖顶层全局状态。
4. **搜索侧**：官方搜索接口 `Aide/AideSearchXSLT_ns.aspx` 返回的表格中 DOB/SSN 均为掩码，且响应 HTML 不含真实值；但每行姓名链接带 `onclick="RedirectToAidePage(3632255)"`，可稳定提取 AideID。逐行请求 `Aide/AideProfile_ns.aspx?AideID=X`（实测约 245KB、1.3~1.5s/次，**无需 officeID 参数**）即可拿到真实 DOB（`#uxHfDtDOB`）与 SSN（`#uxHfSSN`）。
5. **附带收益**：现有 `ProfileDataExtractor` 的 CAREGIVER `dob` 选择器正是 `#ctl00_ContentPlaceHolder1_uxlblInfoDOB`，目前提取到掩码值；档案页恢复后，MailBuilder 变量、M11Q、内置模板等下游自动拿到真实生日，无需改抽取器。

---

## 决策

### D1：档案页恢复采用「零网络、纯 DOM 还原」

**选定**：在 Aide_ns 页面内读取既有隐藏字段真实值，写回三个可见显示位（两处 DOB + 一处 SSN），不发起任何额外网络请求。

**原因**：

1. 真实值已在页面 DOM 中（`uxHfDtDOB`/`hidprevDOB`/`uxHfSSN`/`hidprevSSN`），零成本。
2. 即时生效，无异步等待、无失败分支。
3. 不引入对 HHA 接口的额外依赖。

### D2：独立模块 `AideSensitiveDataRestore`，按窗口作用域 + 幂等 + MutationObserver

**选定**：新建 `src/js/services/AideSensitiveDataRestore.ts`，导出 `initAideSensitiveDataRestore()`；在 `src/index.ts` 主 bootstrap 中与 `ProfileDataExtractor.enhanceCaregiverSearchPanel()` 同级调用（模块内部自行判断 URL 是否 `Aide_ns.aspx`）。

**要求**：

1. 每个 window 用 `window.__HHA_AIDE_SENSITIVE_RESTORED_FLAG__` 类标记防止重复初始化。
2. 写入真实值前先比对当前文本，已恢复则跳过；给已恢复元素加 `data-hha-sensitive-restored` 属性。
3. `MutationObserver` 观察 `#aspnetForm`（或 body）子树，debounce 50~100ms 后重新扫描应用，覆盖 UpdatePanel 回发、切 Tab、搜索面板刷新等官方重渲染场景。
4. 因嵌套 Aide_ns iframe（Compliance 配置区）同 URL，模块天然按窗口作用域执行，无需特殊分支。

### D3：编辑态输入框同步赋值

**选定**：除三个 view 模式显示位外，同步维护编辑态控件：`#uxDtDOB`（date input）赋 `YYYY-MM-DD` 格式值、`#uxTxtSSN`（readonly text input）赋真实 SSN，仅在元素可见/存在时执行。

**原因**：避免用户点 Edit 后看到空白 DOB / 掩码 SSN 与恢复后的 view 模式不一致；`readonly` 不影响脚本赋 `value`。

### D4：搜索生日补全采用「行级按需拉取 + 缓存 + 限流」

**选定**：在 `HhaSearchService.fetchAllPages("aide", ...)` 合并出完整 `rawHtml` 后，调用新增的 `enrichAideSearchDob(rawHtml): Promise<string>` 做行级补全，再进入现有 `display*` / `parseAideRows` 流程。规则：

1. 从每行姓名链接解析 AideID（复用 `RedirectToAidePage\(\s*(\d+)/` 解析思路，代码中已有同款正则）。
2. 数据源：`${TENANT_BASE}/Aide/AideProfile_ns.aspx?AideID={ID}`（GM_fetch 带凭证；已验证无需 officeID）。
3. 并发限制 3；单请求超时 8s（超时/失败保留掩码值，不阻塞展示）。
4. 会话级缓存 `Map<number, string>`（同一 AideID 不重复请求，QuickSearch/来电/向导共享）。
5. 补全上限：仅处理合并结果的前 30 行（可配置），超出部分保持掩码，避免大结果集产生海量 245KB 请求。
6. 通过表头文本定位 DOB 列；仅当单元格命中掩码正则时替换。

**原因**：

1. 搜索接口本身不返回真实 DOB，补全必须逐行取数。
2. 缓存 + 限流 + 上限控制把代价压到可接受范围（典型 1~10 条结果：最多 10 次请求，并行后数秒内完成）。
3. 在 `fetchAllPages` 层做补全，QuickSearchTab、IncomingCallHandler、EmploymentActivationTemplate（`parseAideRows`）统一受益，无需改三处。

### D5：只在掩码命中时替换，格式校验兜底

**选定**：

- DOB 掩码判定：`/^X{2}\/X{2}\/X{4}$/i`；真实值校验：`/^\d{2}\/\d{2}\/\d{4}$/`。
- SSN 掩码判定：`/^X{3}-X{2}-\d{4}$/i`；真实值校验：`/^\d{3}-\d{2}-\d{4}$/`。
- 数据源取值优先级：`uxHfDtDOB` → `hidprevDOB`；`uxHfSSN` → `hidprevSSN`，取第一个通过格式校验的非空值。
- 任何一步不满足即静默跳过该元素，绝不写入空值/脏值。

**原因**：防止 HHA 改版（元素缺失、格式漂移）时写入错误数据或报错刷屏。

### D6：功能开关（默认开启）+ 合规边界

**选定**：Tampermonkey 存储开关 `hha_restore_aide_sensitive_data`（`GM_getValue`，默认 `true`）；关闭时模块与补全逻辑直接返回，行为完全等同原状。开关切换立即生效（每次页面加载读取），暂不做面板 UI 开关（如后续需要，在 MailBuilder 设置区加一个 checkbox，列为 P2）。

**合规边界**：

1. 本功能**只还原服务端已下发到当前浏览器的数据**（页面隐藏字段 / 单个档案接口），不新增任何权限、不绕过认证。
2. HHA 官方对无权限账号主动掩码 SSN/DOB（`uxHidIsAccessSSNOrBirthDate=False`）；本功能属于展示层还原，操作者须确认其机构内部政策允许查看这些数据，开关保留随时关闭能力。

### D7：测试策略

**选定**：

1. 新增 jsdom 单测（放到项目现有测试目录）：
   - 档案页恢复：给定隐藏字段 + 掩码 span/input → 断言三处文本、编辑态值、幂等（二次运行不变化）。
   - 正则工具：掩码判定、真实值校验、`MM/DD/YYYY → YYYY-MM-DD` 转换。
   - 搜索补全：mock `GM_fetch` 返回含 `RedirectToAidePage(id)` 的表格 HTML 与单个档案 HTML → 断言 DOB 列被替换、失败/超时保留掩码。
2. 手动验收：按 Epic 24 验收清单逐项截图核对。
3. 回归：`npm run build` 无新 TS 错误；`npm test` 通过；现有 QuickSearch/来电搜索/向导行为不回归。

---

## 备选方案对比

| 方案 | 结论 | 理由 |
|---|---|---|
| A. 拦截/改写 HHA 接口响应（GM_fetch hook / 代理） | 否决 | userscript 架构下复杂且脆弱，档案页零网络方案已覆盖主场景 |
| B. 仅恢复档案页，搜索不动 | 否决 | 用户明确要求搜索结果生日正常显示 |
| C. 搜索补全改用 `Aide_ns.aspx?AideId=X` 全页拉取 | 否决 | 响应比 `AideProfile_ns.aspx` 更大，信息量无增益 |
| D. 档案页恢复 + 搜索行级补全（本方案） | **选定** | 成本最低、覆盖全部诉求、复用现有数据管线 |

## 风险

1. **官方页面结构漂移**：元素 ID/掩码格式变化会导致静默失效——用多选择器 + 格式校验 + 静默降级缓解；失效时表现等同于未装功能，无副作用。
2. **权限语义变化**：若 HHA 未来不再下发隐藏字段真实值，档案页恢复自然失效（降级为掩码），搜索补全同样留掩码，不需要改动。
3. **搜索补全请求开销**：并发 3 + 8s 超时 + 会话缓存 + 30 行上限已将最坏情况控制在可接受范围；若未来需要更大结果集，优先考虑后台分批补全 + 局部刷新。
4. **官方重渲染竞态**：MutationObserver debounce + 幂等写入防止闪烁与循环触发（写入真实值不会再命中掩码正则，观察器不重复动作）。
