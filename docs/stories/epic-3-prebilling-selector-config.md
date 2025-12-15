# Epic 3: Prebilling Selector 配置化功能

## Epic 概述

| 属性 | 值 |
|-----|---|
| **Epic ID** | EPIC-003 |
| **标题** | Prebilling Selector 配置化功能 |
| **优先级** | P1 - 功能增强 |
| **状态** | ✅ 已完成 |
| **预计工作量** | 3 个 Story |
| **关联 ADR** | [ADR-003](../adr/003-prebilling-selector-config.md) |

## 背景与目标

### 当前问题
Prebilling Selector 按钮硬编码为 Tao Yang，导致：
- 其他用户无法使用该功能
- 使用模拟点击 + sleep，实现脆弱
- 依赖"Select All"状态，只能使用一次
- 无法在运行时修改配置

### 目标
实现可配置的 Prebilling Selector，使得：
- 任何用户都能配置自己的 coordinator 列表
- 使用 multipleSelect API，实现更可靠
- 配置持久化到 localStorage
- 提供友好的 Hover 配置界面

## 验收标准 (Epic 级别)

- [x] 按钮可重复使用，不再有一次性 Bug
- [x] 用户能通过 Hover 卡片选择 coordinator
- [x] 配置保存到 GM_storage，刷新页面后保持
- [x] 默认配置为 Tao Yang（向后兼容）
- [x] 支持多选 coordinator
- [x] 不再使用模拟点击，改用 multipleSelect API

## Bug 修复追踪

### Bug 2: 页面刷新后 Coordinator 筛选失效 (已修复 ✅)

**问题**：保存配置后刷新页面，Coordinator filter 显示 "Loading..."，搜索返回全部结果而非筛选结果。

**修复日期**：2024-12-15

**修复方案**：在 `selectCoordinatorByAPI()` 和 `selectDisciplineByAPI()` 中调用 `.multipleSelect('enable')` 启用控件。

**验证**：
- 页面刷新后 coordinator 筛选正常工作
- 搜索结果正确（54条 vs 之前的 3171条）
- 所有搜索结果的 Coordinator 列均为选中的 coordinator

详细技术分析见 [ADR-003](../adr/003-prebilling-selector-config.md#bug-修复记录)

---

## Story 1: 重构 Prebilling Selector 使用 multipleSelect API

### Story 描述
作为开发者，我需要重构 `selectCoordinator()` 函数，使用 multipleSelect 插件的 API 替代模拟点击，以解决一次性使用 Bug 并提高稳定性。

### 当前实现问题

```typescript
// src/js/Prebilling.ts - selectCoordinator() 函数
async function selectCoordinator() {
    const coordinatorButton = $(prebillingCoordinatorButtonSelector)[0] as HTMLElement;
    const coordinatorSelectAll = $(prebillingCoordinatorOptionSelectAllSelector)[0] as HTMLInputElement;
    const coordinatorToSelect = [
        "Tao Yang ext.503 TYang@alwaysNY.net",
    ];
    
    coordinatorButton.click(); // 模拟点击打开下拉
    await sleep(200);
    coordinatorSelectAll.click(); // 点击 Select All 取消全选
    await sleep(200);
    
    // 然后再点击特定项...
    coordinatorSelectAll.click(); // 再次点击 Select All（导致 Bug）
}
```

**问题**：
1. 依赖两次点击 Select All 的切换逻辑
2. 如果已经是非全选状态，第二次点击会误选全部
3. 使用 sleep 延迟不可靠

### 新实现方案

```typescript
// 使用 multipleSelect API
function selectCoordinator(coordinatorIds: string[]) {
    const $select = $('#ddlCoordinatorMul');
    
    // 1. 清空所有选择
    $select.multipleSelect('uncheckAll');
    
    // 2. 设置指定的 coordinator
    $select.multipleSelect('setSelects', coordinatorIds);
    
    // 3. 同步更新隐藏字段（如果需要）
    const hdCoord = document.getElementById('ctl00_ContentPlaceHolder1_hdCoordinatorMul') as HTMLInputElement;
    if (hdCoord) {
        hdCoord.value = coordinatorIds.join(',');
    }
}
```

### 验收标准
- [ ] 移除所有模拟点击和 sleep 逻辑
- [ ] 使用 `$('#ddlCoordinatorMul').multipleSelect('uncheckAll')` 清空选择
- [ ] 使用 `$('#ddlCoordinatorMul').multipleSelect('setSelects', ids)` 设置值
- [ ] 更新隐藏字段 `ctl00_ContentPlaceHolder1_hdCoordinatorMul`
- [ ] 按钮可以重复使用，不再有一次性 Bug
- [ ] 添加错误处理，检测 multipleSelect 插件是否可用

### 技术要点

```typescript
// Coordinator 数据结构
interface CoordinatorOption {
    value: string;      // ID，如 "75207"
    text: string;       // 名称，如 "Tao Yang ext.503 TYang@alwaysNY.net"
}

// 默认配置（保持向后兼容）
const DEFAULT_COORDINATORS = ["75207"]; // Tao Yang

// 检测 multipleSelect 可用性
function isMultipleSelectAvailable(): boolean {
    return typeof $ !== 'undefined' && 
           typeof $.fn.multipleSelect === 'function';
}
```

### 测试场景
1. **首次点击按钮**：正确选择 Tao Yang
2. **第二次点击按钮**：仍然能正确选择
3. **连续多次点击**：每次都正常工作
4. **页面已有选择**：正确清空并重新设置
5. **插件不可用降级**：输出错误信息，不执行

---

## Story 2: 实现 localStorage 配置持久化

### Story 描述
作为用户，我希望我的 Prebilling Selector 配置能保存到浏览器，这样刷新页面后不需要重新配置。

### 配置数据结构

```typescript
interface PrebillingConfig {
    coordinators: string[];      // Coordinator IDs
    disciplines: string[];       // Discipline IDs (未来扩展)
    lastUpdated: number;         // 最后更新时间戳
}

// localStorage key
const CONFIG_KEY = 'hha_prebilling_config';

// 默认配置
const DEFAULT_CONFIG: PrebillingConfig = {
    coordinators: ["75207"],     // Tao Yang
    disciplines: ["-1", "-2", "1"], // Non Skilled, PCA, HHA
    lastUpdated: Date.now()
};
```

### 实现功能

```typescript
// 保存配置
function savePrebillingConfig(config: PrebillingConfig): void {
    try {
        config.lastUpdated = Date.now();
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        console.log('[Prebilling] Config saved:', config);
    } catch (e) {
        console.error('[Prebilling] Failed to save config:', e);
        // 降级：使用内存存储
    }
}

// 加载配置
function loadPrebillingConfig(): PrebillingConfig {
    try {
        const stored = localStorage.getItem(CONFIG_KEY);
        if (stored) {
            const config = JSON.parse(stored) as PrebillingConfig;
            console.log('[Prebilling] Config loaded:', config);
            return config;
        }
    } catch (e) {
        console.error('[Prebilling] Failed to load config:', e);
    }
    
    // 返回默认配置
    console.log('[Prebilling] Using default config');
    return { ...DEFAULT_CONFIG };
}

// 初始化：第一次使用时保存默认配置
function initPrebillingConfig(): void {
    const existing = localStorage.getItem(CONFIG_KEY);
    if (!existing) {
        savePrebillingConfig(DEFAULT_CONFIG);
    }
}
```

### 修改 prebillingSelector 函数

```typescript
export async function prebillingSelector() {
    // 加载配置
    const config = loadPrebillingConfig();
    
    // 使用配置中的 coordinator
    selectCoordinator(config.coordinators);
    
    // 使用配置中的 discipline（可选）
    selectDiscipline(config.disciplines);
    
    // ... 其余逻辑
}
```

### 验收标准
- [ ] 创建配置数据结构 `PrebillingConfig`
- [ ] 实现 `savePrebillingConfig()` 保存到 localStorage
- [ ] 实现 `loadPrebillingConfig()` 加载配置
- [ ] 实现 `initPrebillingConfig()` 初始化默认配置
- [ ] `prebillingSelector()` 使用加载的配置
- [ ] localStorage 被禁用时优雅降级（使用内存存储）
- [ ] 添加完整的错误处理和日志输出

### 测试场景
1. **首次使用**：自动保存默认配置（Tao Yang）
2. **配置后刷新页面**：配置保持不变
3. **localStorage 被禁用**：使用默认配置，不报错
4. **配置数据损坏**：自动恢复为默认配置

---

## Story 3: 添加 Hover 配置卡片 UI

### Story 描述
作为用户，我希望能通过鼠标悬停在 Prebilling Selector 按钮上来快速配置我要筛选的 coordinator，而不需要修改代码。

### UI 设计

```
┌─────────────────────────────────────────┐
│  Prebilling Selector            [▼]    │  ← 按钮
└─────────────────────────────────────────┘
           │ hover 0.3s
           ▼
┌─────────────────────────────────────────┐
│  📋 Prebilling Selector 配置             │
├─────────────────────────────────────────┤
│  Coordinator 选择:                       │
│  ┌─────────────────────────────────┐    │
│  │ 🔍 搜索 coordinator...          │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ ☑ Anna O. Russian Sup ext.141   │    │
│  │ ☐ Aziza Yunuosova ext. 212      │    │
│  │ ☐ Daisy Wang ext.108            │    │
│  │ ☑ Tao Yang ext.503             │    │
│  │ ☐ Tracy V. ext.145              │    │
│  │ ... (滚动查看更多)               │    │
│  └─────────────────────────────────┘    │
│                                          │
│  已选择: 2 个 coordinator                │
│                                          │
│  [💾 保存配置]  [❌ 取消]                │
└─────────────────────────────────────────┘
```

### HTML 结构

```html
<div id="prebilling-config-card" style="display: none;">
  <div class="config-card-header">
    <h3>📋 Prebilling Selector 配置</h3>
  </div>
  
  <div class="config-card-body">
    <label>Coordinator 选择:</label>
    
    <input 
      type="text" 
      id="coordinator-search" 
      placeholder="🔍 搜索 coordinator..."
      class="config-search-input"
    />
    
    <div class="coordinator-list" id="coordinator-options">
      <!-- 动态生成 checkbox 列表 -->
    </div>
    
    <div class="config-summary">
      已选择: <span id="selected-count">0</span> 个 coordinator
    </div>
  </div>
  
  <div class="config-card-footer">
    <button id="save-config-btn" class="btn-primary">💾 保存配置</button>
    <button id="cancel-config-btn" class="btn-secondary">❌ 取消</button>
  </div>
</div>
```

### CSS 样式

```less
// src/style/main.less
#prebilling-config-card {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  width: 350px;
  max-height: 500px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  display: none;
  
  &.show {
    display: block;
  }
  
  .config-card-header {
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
    border-radius: 6px 6px 0 0;
    
    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
  }
  
  .config-card-body {
    padding: 16px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 13px;
    }
    
    .config-search-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 12px;
      
      &:focus {
        outline: none;
        border-color: #007bff;
      }
    }
    
    .coordinator-list {
      max-height: 250px;
      overflow-y: auto;
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 8px;
      
      .coordinator-option {
        padding: 6px 8px;
        cursor: pointer;
        border-radius: 3px;
        
        &:hover {
          background: #f0f8ff;
        }
        
        input[type="checkbox"] {
          margin-right: 8px;
        }
        
        label {
          cursor: pointer;
          font-size: 12px;
          margin: 0;
        }
      }
    }
    
    .config-summary {
      margin-top: 12px;
      font-size: 12px;
      color: #666;
      
      span {
        font-weight: 600;
        color: #007bff;
      }
    }
  }
  
  .config-card-footer {
    padding: 12px 16px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 8px;
    
    button {
      flex: 1;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      
      &.btn-primary {
        background: #007bff;
        color: white;
        
        &:hover {
          background: #0056b3;
        }
      }
      
      &.btn-secondary {
        background: #6c757d;
        color: white;
        
        &:hover {
          background: #5a6268;
        }
      }
    }
  }
}
```

### JavaScript 逻辑

```typescript
// src/js/Prebilling.ts

// 获取所有可用的 coordinator
async function fetchCoordinatorOptions(): Promise<CoordinatorOption[]> {
    const $select = $('#ddlCoordinatorMul');
    const options: CoordinatorOption[] = [];
    
    $select.find('option').each((_, opt) => {
        const value = $(opt).val() as string;
        const text = $(opt).text();
        
        // 排除 "No Coordinator"
        if (value && value !== '0') {
            options.push({ value, text });
        }
    });
    
    return options;
}

// 渲染配置卡片
function renderConfigCard(options: CoordinatorOption[], selectedIds: string[]): void {
    const container = $('#coordinator-options');
    container.empty();
    
    options.forEach(opt => {
        const checked = selectedIds.includes(opt.value) ? 'checked' : '';
        const html = `
            <div class="coordinator-option">
                <input 
                    type="checkbox" 
                    id="coord-${opt.value}" 
                    value="${opt.value}"
                    ${checked}
                />
                <label for="coord-${opt.value}">${opt.text}</label>
            </div>
        `;
        container.append(html);
    });
    
    updateSelectedCount();
}

// 更新选中数量
function updateSelectedCount(): void {
    const count = $('#coordinator-options input:checked').length;
    $('#selected-count').text(count);
}

// 搜索过滤
function filterCoordinators(searchTerm: string): void {
    const term = searchTerm.toLowerCase();
    $('.coordinator-option').each((_, elem) => {
        const text = $(elem).text().toLowerCase();
        $(elem).toggle(text.includes(term));
    });
}

// 初始化配置卡片事件
function initConfigCard(): void {
    // Hover 显示/隐藏
    let hoverTimer: number;
    
    $('.prebilling-selector-btn').on('mouseenter', () => {
        hoverTimer = window.setTimeout(() => {
            $('#prebilling-config-card').addClass('show');
        }, 300); // 延迟 300ms 显示
    });
    
    $('.prebilling-selector-btn, #prebilling-config-card').on('mouseleave', () => {
        clearTimeout(hoverTimer);
        setTimeout(() => {
            if (!$('#prebilling-config-card:hover').length) {
                $('#prebilling-config-card').removeClass('show');
            }
        }, 200);
    });
    
    // 搜索功能
    $('#coordinator-search').on('input', (e) => {
        filterCoordinators((e.target as HTMLInputElement).value);
    });
    
    // Checkbox 变化更新计数
    $('#coordinator-options').on('change', 'input[type="checkbox"]', () => {
        updateSelectedCount();
    });
    
    // 保存配置
    $('#save-config-btn').on('click', () => {
        const selectedIds: string[] = [];
        $('#coordinator-options input:checked').each((_, elem) => {
            selectedIds.push($(elem).val() as string);
        });
        
        const config: PrebillingConfig = {
            coordinators: selectedIds,
            disciplines: ["-1", "-2", "1"], // 保持默认
            lastUpdated: Date.now()
        };
        
        savePrebillingConfig(config);
        $('#prebilling-config-card').removeClass('show');
        
        // 显示成功提示
        alert(`✅ 配置已保存！\n选择了 ${selectedIds.length} 个 coordinator`);
    });
    
    // 取消按钮
    $('#cancel-config-btn').on('click', () => {
        $('#prebilling-config-card').removeClass('show');
    });
}

// 在页面加载时初始化
$(async () => {
    // 获取 coordinator 选项
    const options = await fetchCoordinatorOptions();
    
    // 加载当前配置
    const config = loadPrebillingConfig();
    
    // 渲染配置卡片
    renderConfigCard(options, config.coordinators);
    
    // 初始化事件
    initConfigCard();
});
```

### 验收标准
- [ ] 在 Prebilling Review 页面创建配置卡片 DOM
- [ ] 鼠标 hover 按钮 300ms 后显示卡片
- [ ] 卡片显示所有可用的 coordinator（排除 "No Coordinator"）
- [ ] 搜索框能实时过滤 coordinator 列表
- [ ] Checkbox 能正确反映当前配置
- [ ] 实时显示已选择的数量
- [ ] 点击"保存配置"按钮保存到 localStorage
- [ ] 点击"取消"按钮关闭卡片
- [ ] 鼠标移出卡片 200ms 后自动关闭
- [ ] 配置保存后显示成功提示

### 测试场景
1. **Hover 显示**：鼠标悬停按钮 0.3s 后卡片显示
2. **快速移开**：鼠标快速划过不触发显示
3. **搜索功能**：输入"Tao"只显示包含该关键词的项
4. **保存配置**：选择多个 coordinator，保存后刷新页面配置保持
5. **取消操作**：修改选择后点击取消，配置不变
6. **多选验证**：选择 3 个 coordinator，点击按钮正确应用

---

## Epic 完成标准

### 功能验收
- [ ] 所有 3 个 Story 已完成
- [ ] 按钮可重复使用，无 Bug
- [ ] 配置保存和加载正常
- [ ] Hover 卡片 UI 流畅美观
- [ ] 默认配置为 Tao Yang（向后兼容）

### 代码质量
- [ ] 所有函数有 TypeScript 类型定义
- [ ] 添加 JSDoc 注释
- [ ] 错误处理完整
- [ ] 日志输出清晰

### 测试覆盖
- [ ] 手动测试所有场景通过
- [ ] 兼容性测试（Chrome, Firefox）
- [ ] 边界条件测试（localStorage 禁用等）

### 文档更新
- [ ] 更新 README 说明新功能
- [ ] 添加使用说明截图

## 风险与依赖

### 技术风险
- multipleSelect 插件版本变化
- localStorage 被浏览器禁用
- 页面 DOM 结构变更

### 缓解措施
- 添加插件版本检测
- 降级到内存存储
- 选择器验证和错误提示
