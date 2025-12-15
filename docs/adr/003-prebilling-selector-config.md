# ADR-003: Prebilling Selector 配置化改进方案

## 状态
✅ 已实现 (2024-12-14)
🐛 Bug 2 修复完成 (2024-12-15)

## 背景

当前 Prebilling Selector 按钮存在以下问题：
1. **硬编码限制**：Coordinator 选择硬编码为 "Tao Yang"，其他用户无法使用
2. **脆弱的实现**：使用模拟点击 + sleep 延迟，依赖"Select All"状态
3. **一次性使用 Bug**：由于依赖 Select All 切换逻辑，按钮只能使用一次
4. **无配置持久化**：每次刷新页面都需要重新配置
5. **缺乏用户界面**：无法在运行时修改配置

## 技术发现

通过页面分析，我们发现了更优雅的实现方式：

### HHAExchange 使用的 multipleSelect 插件

```javascript
// jQuery multipleSelect 插件 API
$('#ddlCoordinatorMul').multipleSelect('getSelects')        // 获取选中值
$('#ddlCoordinatorMul').multipleSelect('uncheckAll')       // 取消全选
$('#ddlCoordinatorMul').multipleSelect('setSelects', [...]) // 直接设置选中值
$('#ddlCoordinatorMul').multipleSelect('checkAll')         // 全选
```

### 关键页面元素

| 元素 | ID | 用途 |
|------|----|----|
| Coordinator Select | `ddlCoordinatorMul` | 原始 select 元素 |
| Coordinator Button | `#coordid_choice` | 下拉按钮 |
| Coordinator Listbox | `#coordid_listbox` | 选项列表 |
| Hidden Field | `ctl00_ContentPlaceHolder1_hdCoordinatorMul` | 存储选中的值 |

### Coordinator 完整列表

共 26 个 coordinator（包括 "No Coordinator"），关键数据：
- Value: 数字 ID（如 `75207` 代表 Tao Yang）
- Text: 完整名称（如 "Tao Yang ext.503 TYang@alwaysNY.net"）
- 隐藏字段值 `-1` 表示"全选"，否则为逗号分隔的 ID 列表

## 决策

**选择方案：multipleSelect API + localStorage + Hover Config Card**

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                     localStorage                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ hha_prebilling_config: {                         │   │
│  │   coordinators: ["75207", "22851", ...],        │   │
│  │   disciplines: ["-1", "-2", "1"],               │   │
│  │   lastUpdated: 1702800000000                    │   │
│  │ }                                                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
          ┌─────────────────────────────┐
          │   Prebilling Selector Button │
          │   "Prebilling Selector"      │
          └─────────────────────────────┘
                    │ hover
                    ▼
          ┌─────────────────────────────┐
          │    Configuration Card        │
          │  ┌─────────────────────────┐ │
          │  │ Coordinator Selection   │ │
          │  │ ☑ Tao Yang             │ │
          │  │ ☐ Daisy Wang           │ │
          │  │ ☐ Grace Shi            │ │
          │  │ ...                    │ │
          │  └─────────────────────────┘ │
          │  [Save Config]  [Cancel]     │
          └─────────────────────────────┘
                    │ save
                    ▼
          ┌─────────────────────────────┐
          │  PrebillingSelector Logic    │
          │  1. multipleSelect('uncheck')│
          │  2. multipleSelect('setSelects')│
          │  3. Update hidden field      │
          │  4. Trigger search          │
          └─────────────────────────────┘
```

### 核心改进

1. **使用 API 替代模拟点击**
   ```javascript
   // 旧方式：模拟点击 + sleep
   coordinatorButton.click();
   await sleep(200);
   selectAllCheckbox.click();
   await sleep(200);
   
   // 新方式：直接调用 API
   $('#ddlCoordinatorMul').multipleSelect('uncheckAll');
   $('#ddlCoordinatorMul').multipleSelect('setSelects', coordinatorIds);
   ```

2. **localStorage 持久化配置**
   - 保存用户选择的 coordinator 列表
   - 页面刷新后自动恢复配置
   - 支持多个 coordinator 同时选择

3. **Hover 配置卡片**
   - 鼠标悬停在按钮上显示配置界面
   - 实时预览选择的 coordinator
   - 保存/取消操作

4. **解决一次性使用 Bug**
   - 不再依赖 Select All 切换逻辑
   - 每次都先 `uncheckAll`，然后 `setSelects`
   - 直接更新隐藏字段确保状态一致

## 备选方案

### 方案 A：仅改用 API，保持硬编码
**优点**：实现简单，快速修复 Bug
**缺点**：仍然只有 Tao 能用，不解决根本问题
**拒绝理由**：无法满足其他用户需求

### 方案 B：配置文件 + 脚本修改
**优点**：完全自定义
**缺点**：需要修改脚本源码，不便于用户
**拒绝理由**：违背 Tampermonkey 运行时配置的原则

### 方案 C：URL 参数传递配置
**优点**：无需 localStorage
**缺点**：URL 长度限制，配置不持久
**拒绝理由**：用户体验差，不适合频繁使用

## 影响范围

### 修改文件
- `src/js/Prebilling.ts` - 核心逻辑改进
- `src/index.ts` - 按钮名称和事件绑定
- `src/style/main.less` - 配置卡片样式

### 不受影响
- Discipline 选择逻辑（保持现有实现）
- 日期设置逻辑
- 其他页面功能

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| multipleSelect API 版本差异 | 插件方法不可用 | 降级到模拟点击，添加版本检测 |
| localStorage 被禁用 | 配置无法保存 | 使用内存临时存储，每次手动选择 |
| 配置卡片 z-index 冲突 | 被其他元素遮挡 | 设置高 z-index 值（9999+） |
| 页面结构变更 | 选择器失效 | 添加选择器验证和错误提示 |

## 实施计划

分 3 个 Story 逐步实现：

1. **Story 1**：重构现有逻辑，使用 multipleSelect API
2. **Story 2**：实现 localStorage 配置持久化
3. **Story 3**：添加 Hover 配置卡片 UI

## 成功标准

- [x] 任何用户都能配置自己的 coordinator 列表
- [x] 配置在页面刷新后保持
- [x] 按钮可以重复使用，不再有一次性 Bug
- [x] Hover 卡片操作流畅，响应及时
- [x] 向后兼容，默认配置为 Tao Yang（保持现有行为）

## Bug 修复记录

### Bug 2: 保存配置后刷新页面 Filter 显示 'Loading...'

**问题描述**：
用户保存配置后刷新页面，Coordinator filter 显示为 "Loading..."，搜索时返回所有 coordinator 的结果（3171条），而不是只返回选中的 coordinator 结果（54条）。

**根本原因**：
1. 页面刷新后，`multipleSelect` 控件的 `isEnabled()` 返回 `false`
2. 页面的 `GetSelectedIDsJSON()` 函数在 `isEnabled()` 为 false 时返回 `null`
3. 导致 API 请求中 `CoordinatorMulFrm: "null"`，相当于搜索所有 coordinator

**修复方案**：
在 `selectCoordinatorByAPI()` 和 `selectDisciplineByAPI()` 函数中，调用 `setSelects()` 后添加 `.multipleSelect('enable')` 调用：

```typescript
// 设置选中值
($select as any).multipleSelect("setSelects", coordinatorIds);

// 关键修复：启用控件，确保 GetSelectedIDsJSON 返回正确值
($select as any).multipleSelect("enable");
```

**修复文件**：
- `src/js/Prebilling.ts` - 第 220行和第 267行

**验证结果**：
- ✅ 刷新页面后 `isEnabled()` 返回 `true`
- ✅ `GetSelectedIDsJSON()` 返回正确的 coordinator ID 数组
- ✅ API 请求携带正确的 `CoordinatorMulFrm` 参数
- ✅ 搜索结果从 3171 条减少到 54 条（正确筛选）

**影响范围**：
- Coordinator 和 Discipline 筛选器在页面刷新后保持正确状态

## 参考资料

- [multipleSelect 插件文档](https://github.com/wenzhixin/multiple-select)
- [HHAExchange Prebilling Review 页面分析](./003-prebilling-selector-config-analysis.md)
