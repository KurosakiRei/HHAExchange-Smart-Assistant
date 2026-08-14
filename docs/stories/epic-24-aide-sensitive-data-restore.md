# Epic 24: Aide 页面 DOB/SSN 显示恢复与搜索结果生日补全

## Epic 概述

| 属性 | 值 |
|---|---|
| **Epic ID** | EPIC-024 |
| **标题** | Aide 页面 DOB/SSN 显示恢复与搜索结果生日补全 |
| **优先级** | P1 |
| **状态** | ✅ verified（用户实测通过：HHA 档案页 / 搜索弹窗 / Outlook 搜索均正常） |
| **关联系统** | AideSensitiveDataRestore（新建）, HhaSearchService, ProfileDataExtractor（受益）, index.ts 主 bootstrap |
| **依赖 Epic** | Epic 7（Multi-Tab Panel）, Epic 18（Quick Search） |
| **ADR** | ADR-023 |
| **关联 Issue** | TBD |

## 背景

HHAExchange 近期对无 SSN/DOB 查看权限的账号启用了敏感信息掩码（`uxHidIsAccessSSNOrBirthDate=False`），导致护理员档案页与搜索结果里的生日/SSN 无法正常显示：

1. `Aide/Aide_ns.aspx` 左栏信息区 `Date of Birth` 显示 `XX/XX/XXXX`（截图 1 ①）。
2. `Aide/Aide_ns.aspx` Demographics 区 `Date of Birth *` 显示 `xx/xx/xxxx`（截图 1 ②）。
3. `Aide/Aide_ns.aspx` Demographics 区 `Social Security Number *` 显示 `XXX-XX-4421`（截图 1 ③）。
4. 快速搜索结果表格 `Date of Birth` 列显示 `XX/XX/XXXX`（截图 3）。

### 现场取证（2026-08-13 Chrome DevTools 实测，AideId=3632255）

- **档案页**：真实数据已随页面下发到浏览器隐藏字段——`#uxHfDtDOB` / `#hidprevDOB` = `07/15/1956`；`#uxHfSSN` / `#hidprevSSN` = `830-39-4421`。三个显示位均在 Aide_ns.aspx **顶层文档**：
  - DOB ①：`#ctl00_ContentPlaceHolder1_uxlblInfoDOB`（SPAN）
  - DOB ②：`#uxLblPDOB`（SPAN，view 模式可见）
  - SSN ③：`#uxLblPSSN`（SPAN，view 模式可见）
  - 编辑态控件：`#uxDtDOB`（`type=date`，view 模式 `display:none`）、`#uxTxtSSN`（text input，readonly，view 模式 `display:none`）
- **嵌套结构**：`#frame_NewCaregiverCompilanceConfiguration` 的 `src` 即 `Aide_ns.aspx?AideId=...`（懒加载嵌套 Aide_ns），模块必须按窗口作用域 + 幂等。
- **搜索**：官方 `AideSearchXSLT_ns.aspx` 表格里 DOB/SSN 是掩码且无真实值；每行姓名链接 `onclick="RedirectToAidePage(3632255)"` 可提取 AideID；逐行请求 `Aide/AideProfile_ns.aspx?AideID=X`（约 245KB、1.3~1.5s/次、无需 officeID）可拿到真实 DOB（`#uxHfDtDOB`）与 SSN（`#uxHfSSN`）。
- **附带收益**：`ProfileDataExtractor` CAREGIVER 的 dob 选择器正是 `#ctl00_ContentPlaceHolder1_uxlblInfoDOB`，档案页恢复后 MailBuilder 变量 / M11Q / 内置模板自动拿到真实生日。

---

## Epic 目标

1. 在 Aide_ns 档案页把两处 DOB 与一处 SSN 恢复为真实值显示（纯 DOM 还原，零额外网络请求）。
2. 在快速搜索 / 来电搜索 / 向导的搜索结果中把 DOB 列恢复为真实 `MM/DD/YYYY`。
3. 提供全局开关，关闭后行为与原状完全一致。

## 非目标

1. 不恢复搜索结果中的 SSN 显示（按需求范围仅 DOB）。
2. 不修改 HHA 服务端权限、不破解认证、不获取服务端未下发的数据。
3. 不改变 HHA 页面既有布局与样式。
4. 不做面板 UI 开关（P2 备选）。

## 成功标准

1. Aide_ns 页两处 DOB 与一处 SSN 显示真实值，无需任何额外网络请求。
2. 页面重渲染（UpdatePanel 回发、切 Tab、搜索刷新）后恢复结果保持。
3. 搜索弹窗（QuickSearch / 来电 / 向导）DOB 列显示真实 `MM/DD/YYYY`；接口失败/超时仍显示掩码且不报错、不阻塞展示。
4. 关闭开关 `hha_restore_aide_sensitive_data` 后，所有页面行为等同未装功能。
5. `npm run build` 通过、新增单测通过、既有 QuickSearch/来电搜索/向导功能无回归。

---

## Story 24-1: Aide 档案页 DOB/SSN 显示恢复（零网络 DOM 还原）

**作为** 护理员协调员，
**我需要** 在 Aide_ns 档案页直接看到真实的生日与 SSN，
**以便** 核对护理员身份与信息，不再被 `XX/XX/XXXX` / `XXX-XX-4421` 掩码阻塞。

### 验收标准

- [x] 新建 `src/js/services/AideSensitiveDataRestore.ts`，导出 `initAideSensitiveDataRestore()`；模块内自行判断当前 URL 是否为 `Aide_ns.aspx`，否则直接返回
- [x] 读取真实值：`#uxHfDtDOB` → `#hidprevDOB` 取第一个通过 `/^\d{2}\/\d{2}\/\d{4}$/` 校验的值；`#uxHfSSN` → `#hidprevSSN` 取第一个通过 `/^\d{3}-\d{2}-\d{4}$/` 校验的值
- [x] 恢复三个显示位（仅当当前文本命中掩码正则时替换）：
  - `#ctl00_ContentPlaceHolder1_uxlblInfoDOB` 文本 → 真实 DOB（如 `07/15/1956`）
  - `#uxLblPDOB` 文本 → 真实 DOB
  - `#uxLblPSSN` 文本 → 真实 SSN（如 `830-39-4421`）
  - DOB 掩码正则 `/^X{2}\/X{2}\/X{4}$/i`；SSN 掩码正则 `/^X{3}-X{2}-\d{4}$/i`
- [x] 编辑态同步：`#uxDtDOB`（date input）赋 `YYYY-MM-DD` 格式（提供 `MM/DD/YYYY → YYYY-MM-DD` 转换），`#uxTxtSSN` 赋真实 SSN；元素不存在/不可见时跳过
- [x] 幂等：每个 window 一个初始化标记（`window.__HHA_AIDE_SENSITIVE_RESTORED_FLAG__`）；写入前先比对当前值，已恢复元素加 `data-hha-sensitive-restored` 属性并跳过
- [x] 重渲染覆盖：`MutationObserver` 观察 `#aspnetForm`（或 body）子树，debounce 50~100ms 后重新应用；写入真实值后不会再次命中掩码正则，避免循环触发
- [x] 开关：`GM_getValue("hha_restore_aide_sensitive_data", true)` 为 `false` 时模块直接返回
- [x] 在 `src/index.ts` 主 bootstrap 中与 `ProfileDataExtractor.enhanceCaregiverSearchPanel()` 同级调用 `initAideSensitiveDataRestore()`；新增 `isAideProfilePage()` 分支，嵌套 Aide_ns（Compliance 配置区）同样生效
- [x] 静默降级：任何元素缺失/格式不合法时跳过该元素，不抛错、不写空值
- [x] `npm run build` 通过，无新增 TS 错误

### 实现提示

- 参考 `ProfileDataExtractor.enhanceCaregiverSearchPanel()` 的 URL 判断与挂载方式
- 不要用 `requestAnimationFrame` 做超时/轮询（后台标签页会暂停）；用 `setTimeout` debounce（既有代码惯例）
- 顶层 window 与嵌套 Aide_ns iframe 都会各自执行本模块，天然覆盖嵌套结构，无需访问 parent

---

## Story 24-2: 搜索结果 DOB 行级补全（AideSearchXSLT + AideProfile 数据源）

**作为** 搜索使用者，
**我需要** 在搜索结果表格里看到护理员真实生日，
**以便** 快速区分同名护理员、核对身份，无需逐个打开档案页。

### 验收标准

- [x] 在 `src/js/services/HhaSearchService.ts` 新增 `enrichAideSearchDob(rawHtml: string): Promise<string>`，在 `fetchAllPages("aide", ...)` 合并出完整 `rawHtml` 后调用，再返回结果（QuickSearchTab / IncomingCallHandler / EmploymentActivationTemplate 无需改调用方）
- [x] 行 AideID 解析：从姓名链接 `onclick="RedirectToAidePage(3632255)"` 提取（复用现有 `/RedirectToAidePage\(\s*(\d+)/` 思路；`preserveProfileIdsInRawHtml` 已写入 `data-hha-profile-id` 时优先取该属性）
- [x] 数据源：`${TENANT_BASE}/Aide/AideProfile_ns.aspx?AideID={ID}`（GM_fetch 带凭证，已验证无需 officeID）；从响应 HTML 提取 `#uxHfDtDOB` 并通过 `/^\d{2}\/\d{2}\/\d{4}$/` 校验
- [x] 替换规则：按表头文本定位 `Date of Birth` 列；仅当单元格文本命中 `/^X{2}\/X{2}\/X{4}$/i` 时替换为真实值；每行独立处理
- [x] 限流与容错：
  - 并发上限 3（worker 池，实测 max-in-flight ≤ 3）
  - 单请求 8s 超时（`Promise.race` 软超时），超时或失败保留掩码值
  - 会话级缓存 `Map<number, string>`，同一 AideID 不重复请求
  - 补全上限：仅处理合并结果前 30 行（常量可配置），超出部分保持掩码
- [x] 补全失败不影响主流程：`fetchAllPages` 仍正常返回，展示不阻塞、不报错弹窗（console.warn 即可）
- [x] 开关 `hha_restore_aide_sensitive_data=false` 时跳过补全直接返回原 `rawHtml`
- [x] 单测：mock `GM_fetch` 返回搜索表格 HTML + 单个档案 HTML，断言 DOB 列替换成功；失败/超时/缓存/并发上限分支保留 `XX/XX/XXXX`
- [x] `npm run build` 通过

### 实现提示

- 补全发生在 `fetchAllPages` 的 aide 分支返回前，这样 `displaySingleResult` / `displayCombinedResults` / `parseAideRows` 全部自动受益
- `AideProfile_ns.aspx` 响应约 245KB，务必限流 + 缓存 + 上限，不要为超过上限的行发请求
- 搜索弹窗是 blob 页面，补全结果以字符串形式进入 `rawHtml` 即可，无需运行时 DOM 钩子

---

## Story 24-3: 开关配置、单测与回归验证

**作为** 维护者，
**我需要** 一个随时可关闭的开关与覆盖核心逻辑的单测，
**以便** 在机构政策要求禁用或 HHA 改版异常时快速止血。

### 验收标准

- [x] Tampermonkey 存储键 `hha_restore_aide_sensitive_data`（默认 `true`）；档案页模块与搜索补全均读取该开关，关闭后完全等同原状
- [x] 单测覆盖：
  - 档案页三处显示位 + 编辑态控件赋值（jsdom）
  - 幂等：连续两次 `applyAideSensitiveDataRestore` 后 DOM 不变
  - 掩码/真实值正则与 `MM/DD/YYYY → YYYY-MM-DD` 转换
  - 搜索补全成功、单行失败不影响其他行、全失败保留掩码、并发上限 ≤3 生效
- [x] 手动验收清单（用户实测通过，2026-08-13）：
  1. 打开 `Aide_ns.aspx?AideId=3632255`：左栏 DOB、Demographics DOB、Demographics SSN 三处均显示真实值 ✅
  2. 点击 Edit：DOB date input 与 SSN input 显示真实值 ✅
  3. 切换 Profile/Compliance 等 Tab 再切回：恢复保持 ✅
  4. 快速搜索 `Fu GuiZhi`：弹窗 DOB 列显示 `07/15/1956`；SSN 列保持掩码（非目标） ✅
  5. 打开 MailBuilder：`{{caregiver_dob}}` 变量为真实生日（附带收益） ✅
  6. 设置 `hha_restore_aide_sensitive_data=false` 刷新：三处与搜索均回到掩码，无报错 ✅
  7. Outlook（outlook.cloud.microsoft）快速搜索：DOB 列真实值 + 点击名字新开标签页 ✅（清理旧脚本副本后）
- [x] 回归：来电搜索、QuickSearch 组合搜索、Employment 向导 Step1 行为不回归（全量 41 测试通过，含既有 incident 测试）
- [x] `npm run build` + `npm test` 通过

### 实现提示

- 测试放项目现有测试目录（参考既有 jest/vitest 配置与 mock 方式）
- 手动验收时用 DevTools Console 直接核对 `#uxHfDtDOB` / `#hidprevDOB` 存在后再截图，避免改版后误判

---

## 已知限制

1. HHA 若停止在页面下发隐藏字段真实值（或搜索行去掉 `RedirectToAidePage` 链接），本功能静默降级为掩码显示，需要重新取证。
2. 搜索补全对大结果集只处理前 30 行，其余保持掩码（可调常量）。
3. 结果弹窗的 SSN 列按需求保持掩码，不随本 Epic 改变。

## 修复记录

- **2026-08-13（搜索结果 DOB 补全实测确认）**：在真实页面驱动 QuickSearch 面板搜索后，新弹窗 DOB 列已显示真实值并带 `data-hha-dob-enriched="1"`。用户截图中的弹窗为重装脚本前生成的旧弹窗（blob 页面不刷新），关闭后重新搜索即可看到补全结果。
- **2026-08-13（Outlook 搜索结果点击跳转修复）**：`setupPopupProfileLinkFallback` 的 `openInNewTab` 原实现用 `window.open(url, "_blank", "noopener,noreferrer")` 的返回值判断成败，但该特性组合按规范恒返回 `null`，导致必然落入 `location.href` 就地跳转分支（搜索结果窗口内跳转）。已改为优先 `GM_openInTab(targetUrl, { active: true })`（Tampermonkey 特权 API，不受宿主弹窗拦截影响），`window.open` 作为第二选择且不再依赖返回值，`location.href` 仅作最终兜底。
- **2026-08-13（Outlook 域名功能失效根因——旧脚本副本）**：实测发现 Outlook（outlook.cloud.microsoft）页面执行的是一份**旧版 userscript 副本**：生成的搜索弹窗锚点只有 `rel="noopener noreferrer"` 而无 `target="_blank"`（当前源码两个分支都会设置 target），且 DOB 无补全标记。而 app.hhaexchange.com 页面执行的是最新构建（DOB 补全正常）。判定 Tampermonkey（或 Tampermonkey BETA）中存在多份「HHAExchange Smart Assistant」脚本，Outlook 域名命中的是旧副本。处理：删除管理器内所有旧副本、只保留重新导入的 `dist/index.prod.user.js`，版本号已升到 **3.21.15** 便于识别——重载 Outlook 后控制台应看到 `HHA Exchange Smart Assistant 3.21.15 : script start`。
- **2026-08-13（用户最终验收）**：清理旧脚本副本后，HHA 档案页、搜索弹窗、Outlook 快速搜索（生日补全 + 新标签页打开）全部实测通过，Epic 24 关闭。
