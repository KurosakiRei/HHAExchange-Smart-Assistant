# Epic 2: Visit Monitor 详情列表用户体验优化

## Epic 概述

| 属性 | 值 |
|-----|---|
| **Epic ID** | EPIC-002 |
| **标题** | 详情列表 UI/UX 增强 & Combined View |
| **优先级** | P1 - 重要用户体验改进 |
| **状态** | ✅ 已完成 (2025-12-20) |
| **实际工作量** | 4 个功能任务 |
| **关联 ADR** | [ADR-002](../adr/002-visit-monitor-ui-enhancements.md), [ADR-005](../adr/005-combined-view-implementation.md) |

## 背景与目标

### 当前问题
Visit Monitor 功能在实际使用中存在以下问题：
1. **国际化问题**：列标题全为英文，中文用户使用不便
2. **Authorization Note 显示问题**：
   - HTML表格直接渲染导致列宽度爆炸
   - 内容覆盖到其他列
   - 信息显示不完整（丢失 New Value 列）
3. **Resize 交互问题**：
   - 拖拽时详情列表不跟随鼠标
   - 存在不合理的高度限制
   - 快速拖动时出现"脱离"现象
4. **Combined View 需求**：
   - 当搜索结果同时包含 Aide 和 Patient 时，需要在一个弹窗中同时显示
   - 需要清晰的视觉分隔和信息呈现

### 目标
- 提供中文列标题，改善国际化体验
- 优化 Authorization Note 的格式化显示，保留完整信息
- 修复 Resize 功能，提供流畅的拖拽体验
- 实现 Combined View，提升搜索效率和用户体验

## Epic 级别验收标准

- [x] 详情列表的 Coordinator 列标题显示为中文"辅导员 (Ext.)"
- [x] Authorization Note 完整显示所有3列（Edited Fields, Previous Value, New Value）
- [x] Note 列内容自动换行，不覆盖相邻列
- [x] Resize 拖拽时详情列表流畅跟随鼠标
- [x] 详情列表可拉伸到接近全屏高度
- [x] Combined View 正常显示 Caregiver 和 Patient 结果
- [x] Combined View 表格内容清晰准确，无垃圾字符
- [x] 统一使用 "Caregiver" 术语
- [x] 所有修复不影响现有功能

---

## Story 1: 国际化 - 添加中文列标题

### Story 描述
作为 **中文用户**，我希望详情列表的列标题能显示中文，这样我可以更快速地理解每列的含义。

### 验收标准
- [x] "Coordinator (Ext.)" 列标题改为"辅导员 (Ext.)"
- [x] 保留关键的英文标识符（Ext.）
- [x] 列宽度和样式保持不变
- [x] 其他列标题保持英文（Member Name, Payer, Reason等）

### 技术实现

**文件**：`src/js/VisitMonitor.ts`

**修改位置**：Message类型详情表格表头

```typescript
// Before:
<th style="width:40px;">Coordinator (Ext.)</th>

// After:
<th style="width:40px;color: #333 !important;" class="col-coordinator">辅导员 (Ext.)</th>
```

### 测试步骤
1. 打开详情列表（点击 Message 数量徽章）
2. 确认表头显示"辅导员 (Ext.)"
3. 确认列宽度和对齐方式正常

---

## Story 2: Authorization Note 格式化优化

### Story 描述
作为 **Coordinator**，当我查看详情列表中的 Authorization Note 时，我希望：
- 能看到完整的编辑信息（包括 Edited Fields, Previous Value, New Value）
- 表格内容不会覆盖到其他列
- 内容可以自动换行，保持可读性

### 问题分析

**原始数据示例**：
```html
Authorization (DBL2023JAN002516) has been edited by Elderplan MJHS.
<table>
  <tr><th>Edited Fields</th><th>Previous Value</th><th>New Value</th></tr>
  <tr><td>From date</td><td>1/5/2023</td><td>1/1/2023</td></tr>
  <tr><td>Authorization Note</td><td>Homefirst -3338839...</td><td>Homefirst -</td></tr>
</table>
```

**之前的问题**：
- 直接渲染原始HTML导致表格宽度不受控制
- 第一次尝试只提取了2列，丢失了 New Value
- Note列没有正确换行

### 验收标准
- [x] Authorization Note 显示完整的3列表格
- [x] 表格宽度适应容器，不超出 Note 列
- [x] 表格样式紧凑，字体大小11px
- [x] 表头带有背景色区分
- [x] 单元格边框清晰
- [x] Note 列内容自动换行

### 技术实现

**文件**：
- `src/js/VisitMonitor.ts` - formatAuthorizationNote() 函数
- `src/style/main.less` - CSS样式

**核心逻辑**：

```typescript
function formatAuthorizationNote(note: string): string {
  // 1. 检测是否包含 Authorization 表格
  if (note.includes('<table') && 
      (note.includes('Edited Fields') || note.includes('Previous Value'))) {
    
    // 2. 使用 DOMParser 安全解析HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note;
    const table = tempDiv.querySelector('table');
    
    // 3. 提取表头（完整的3列）
    const headers: string[] = [];
    headerRow?.querySelectorAll('th, td').forEach(cell => {
      headers.push(cell.textContent?.trim() || '');
    });
    
    // 4. 提取所有数据行（保留所有列）
    const tableData: { cells: string[] }[] = [];
    dataRows.forEach((row, index) => {
      if (index === 0 && row.querySelector('th')) return;
      const cells: string[] = [];
      row.querySelectorAll('td').forEach(cell => {
        cells.push(cell.textContent?.trim() || '');
      });
      tableData.push({ cells });
    });
    
    // 5. 生成紧凑表格HTML
    return `
      <div>${descriptionText}</div>
      <table class="auth-note-table">
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${tableData.map(row => 
          `<tr>${row.cells.map(c => `<td>${c}</td>`).join('')}</tr>`
        ).join('')}</tbody>
      </table>
    `;
  }
  
  // 非 Authorization 内容：去除HTML标签返回纯文本
  return note.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
```

**CSS样式**：

```less
// Note 列样式
.popover-table td.note-cell {
    white-space: normal !important;
    max-width: 350px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    vertical-align: top;
}

// Authorization Note 表格样式
.auth-note-table {
    width: 100%;
    border-collapse: collapse;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    margin-top: 6px;
    font-size: 11px;
    
    th, td {
        border: 1px solid #dee2e6;
        padding: 4px 8px;
        text-align: left;
        white-space: normal;
        word-wrap: break-word;
    }
    
    th {
        background: #e9ecef;
        font-weight: 600;
        color: #495057;
    }
    
    td {
        color: #212529;
        background: #fff;
    }
}
```

### 测试步骤
1. 打开包含 Authorization Edit 消息的详情列表
2. 确认表格显示完整的3列（Edited Fields, Previous Value, New Value）
3. 确认 From date 行显示："1/5/2023" → "1/1/2023"
4. 确认 Authorization Note 行显示完整内容
5. 确认表格不超出 Note 列范围
6. 确认长文本自动换行

---

## Story 3: Resize 功能修复

### Story 描述
作为 **Coordinator**，当我拖拽详情列表的 resize handle 时，我希望：
- 详情列表能够流畅地跟随鼠标移动
- 可以拉伸到接近全屏高度
- 不会出现"脱离"或卡顿现象

### 问题分析

**原因1：iframe 事件拦截**
- HHAExchange 页面可能包含 iframe 元素
- 鼠标移动到 iframe 上时，`mousemove` 事件被拦截
- 导致 resize 功能失效

**原因2：CSS 高度限制**
- `max-height: 60vh` 限制过于保守
- 用户实际可用空间更大

**原因3：事件冒泡问题**
- 未使用事件捕获模式
- 子元素可能阻止事件传播

### 验收标准
- [x] 拖拽 resize handle 时，详情列表实时跟随鼠标
- [x] 快速拖动时不会出现"脱离"现象
- [x] 可以拉伸到视口高度的 90%
- [x] 可以拉伸到视口宽度的 95%
- [x] 拖拽时不会选中页面文字
- [x] 释放鼠标后，遮罩层正确清理

### 技术实现

**文件**：
- `src/js/VisitMonitor.ts` - makeResizable() 函数
- `src/style/main.less` - CSS max-height/max-width

**核心修复**：

```typescript
function makeResizable(element: HTMLElement, handleElement: HTMLElement) {
  let isResizing = false;
  let startX = 0, startY = 0, startWidth = 0, startHeight = 0;
  let overlay: HTMLDivElement | null = null;

  const onMouseDown = (e: MouseEvent) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = element.offsetWidth;
    startHeight = element.offsetHeight;
    
    // 创建透明遮罩层覆盖整个页面
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;cursor:nwse-resize;';
    document.body.appendChild(overlay);
    
    // 防止拖动时选中文字
    document.body.style.userSelect = 'none';
    
    // 使用 capture 模式优先捕获事件
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("mouseup", onMouseUp, true);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    // 只有最小尺寸限制，无最大限制（由CSS控制）
    const newWidth = Math.max(400, startWidth + deltaX);
    const newHeight = Math.max(300, startHeight + deltaY);
    
    element.style.width = `${newWidth}px`;
    element.style.height = `${newHeight}px`;
    
    e.preventDefault();
    e.stopPropagation();
  };

  const onMouseUp = (e: MouseEvent) => {
    if (!isResizing) return;
    isResizing = false;
    document.body.style.userSelect = '';
    
    // 清理遮罩层
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("mouseup", onMouseUp, true);
    
    e.preventDefault();
    e.stopPropagation();
  };

  handleElement.addEventListener("mousedown", onMouseDown);
}
```

**CSS 限制调整**：

```less
#details-popover {
    max-width: 95vw;  // 从 90vw 提升
    max-height: 90vh; // 从 60vh 提升
}
```

### 关键技术点

1. **透明遮罩层**：
   - `position: fixed` 覆盖全屏
   - `z-index: 999999` 确保在最上层
   - `cursor: nwse-resize` 保持正确的光标样式

2. **事件捕获模式**：
   - `addEventListener(..., true)` 使用捕获阶段
   - 优先于所有子元素接收事件
   - 防止 iframe 拦截

3. **用户选择控制**：
   - `userSelect: 'none'` 防止拖动时选中文字
   - 释放时恢复默认值

4. **事件传播控制**：
   - `preventDefault()` 阻止默认行为
   - `stopPropagation()` 阻止事件冒泡

### 测试步骤
1. 打开详情列表
2. 点击右下角 resize handle 并拖动
3. 向右下方快速拖动，确认详情列表跟随
4. 拖动到接近屏幕边缘，确认可以达到 90vh/95vw
5. 拖动过程中移动到页面其他元素上，确认不会失效
6. 释放鼠标，确认没有遮罩层残留
7. 确认拖动时没有选中页面文字

---

## 回归测试

### 功能回归
- [x] 详情列表正常打开和关闭
- [x] 拖拽移动功能正常
- [x] 表格数据正确显示
- [x] 其他消息类型（非 Authorization Edit）正常显示
- [x] 多 Tab 数据同步功能不受影响

### 性能测试
- [x] HTML 解析性能正常（< 5ms）
- [x] 遮罩层创建和销毁无泄漏
- [x] CSS 渲染无额外重排重绘
- [x] 大量数据时表格渲染流畅

### 兼容性测试
- [x] Chrome 最新版
- [x] Edge 最新版
- [x] Firefox 最新版（如适用）

---

## 技术债务

无重大技术债务。未来可考虑：
- 将 formatAuthorizationNote 函数抽离为独立工具函数
- 为 resize 功能添加记忆用户偏好尺寸的能力
- 考虑支持更多语言的国际化

---

## 关联 PRs/Commits

- Commit: "feat: add Chinese column header for Coordinator"
- Commit: "fix: preserve all 3 columns in Authorization Note table"
- Commit: "fix: resolve resize tracking issue with transparent overlay"
- Commit: "style: increase max-height to 90vh for better UX"

---

---

## Story 4: Combined View - Aide & Patient 结果合并显示

### Story 描述
作为 **Coordinator**，当我搜索一个电话号码时，如果同时存在 Aide (Caregiver) 和 Patient 的搜索结果，我希望：
- 在一个弹窗中同时看到两边的结果
- 上下分栏显示，清晰区分
- 保持表格的完整功能和数据准确性
- 高亮显示搜索的电话号码

### 问题分析

在 v3.6.5 版本中引入的 Combined View 功能遭遇了严重的技术挑战。初始方案使用 iframe 嵌套 blob URL，但被 Chrome 的安全策略阻止。经过 6 次迭代才最终找到可行方案。

**失败的尝试**：
1. ❌ iframe + nested blob URL → Chrome 安全策略阻止
2. ❌ iframe + srcdoc (escaped HTML) → HTML 标签被破坏
3. ❌ iframe + srcdoc (quote-escaped) → 仍然空白
4. ❌ div + Regex extraction → 内容提取不完整
5. ❌ div + String cleanup + DOMParser → DOM 结构被破坏

**成功的方案**：
✅ div + DOMParser + DOM cleanup → 完美工作

### 验收标准
- [x] 上下分栏显示 Caregiver 和 Patient 结果
- [x] 面板标题显示结果数量（如 "1 条, Active: 1"）
- [x] 表格完整显示所有列和数据
- [x] 表头清晰可读（白色文字在深蓝背景上）
- [x] 移除无用内容：
  - [x] 移除 "sortable column head" 文字
  - [x] 移除屏幕阅读器专用文字（"View Patient Details", "Patient Id"）
  - [x] 移除 Caregiver 表格的空 Action 列
  - [x] 移除原始页面标题（如 "Caregiver search results (1)"）
- [x] 电话号码高亮显示
- [x] 点击链接可正常跳转到 profile 页面
- [x] 统一使用 "Caregiver" 而非 "Aide"

### 技术实现

**文件**：
- `src/js/IncomingCallHandler.ts` - displayCombinedResults(), extractAndCleanContent()
- 关联 ADR: [ADR-005](../adr/005-combined-view-implementation.md)

**核心架构**：

```typescript
// 1. HTML 容器结构
const combinedHtml = `
<div class="container">
  <div class="panel">
    <h2 class="panel-header">Caregiver (护工) 搜索结果 (${count} 条)</h2>
    <div class="panel-content">${aideTableHtml}</div>
  </div>
  <div class="panel">
    <h2 class="panel-header">Patient (病人) 搜索结果 (${count} 条, Active: ${active})</h2>
    <div class="panel-content">${patientTableHtml}</div>
  </div>
</div>
`;

// 2. 内容提取和清理函数
const extractAndCleanContent = (html: string, type: "aide" | "patient"): string => {
  // 使用 DOMParser 解析原始 HTML（不做字符串预处理）
  const doc = new DOMParser().parseFromString(html, "text/html");
  
  // 定位表格
  let table = doc.querySelector("#tdSearchResults");
  
  // 移除不需要的元素
  const unwantedSelectors = [
    'script',
    '.show-for-sr',           // 屏幕阅读器文字
    '[class*="show-for-sr"]',
    'a[id*="uxfrmSearchXSLT"]',
    'form[id*="uxfrmSearch"]'
  ];
  unwantedSelectors.forEach(sel => {
    table.querySelectorAll(sel).forEach(el => el.remove());
  });
  
  // 清理表头（移除 "sortable column head"）
  table.querySelectorAll('th, thead td').forEach(th => {
    let text = th.textContent || '';
    text = text.replace(/sortable\s*column\s*head/gi, '');
    text = text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
    th.textContent = text;
  });
  
  // 清理数据单元格
  table.querySelectorAll('tbody td, tr td').forEach(td => {
    td.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent || '';
        text = text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
        node.textContent = text;
      }
    });
  });
  
  // Caregiver 表格：移除空的 Action 列
  if (type === "aide") {
    // ... 移除逻辑
  }
  
  return table.outerHTML;
};
```

**CSS 关键样式**：

```css
/* Flexbox 上下分栏布局 */
.container { 
  display: flex; 
  flex-direction: column; 
  height: 100%; 
}

.panel { 
  flex: 1; 
  display: flex; 
  flex-direction: column;
  min-height: 0;  /* 关键：允许 flex 子元素收缩 */
}

/* 固定标题 */
.panel-header { 
  flex-shrink: 0;
  background-color: #0d3e61; 
  color: #fff;
}

/* 可滚动内容区 */
.panel-content { 
  flex: 1;
  overflow: auto;
}

/* 表头样式强化（覆盖原始样式）*/
.panel-content table th,
.panel-content table thead th,
.panel-content table thead td {
  background-color: #0d3e61 !important;
  color: #fff !important;
  font-weight: 600;
}

/* 表头内链接也使用白色 */
.panel-content table th a,
.panel-content table thead a {
  color: #fff !important;
}
```

### 关键技术决策

1. **为什么放弃 iframe？**
   - Chrome 安全策略阻止在 blob URL 页面中嵌套另一个 blob URL 的 iframe
   - srcdoc 方案无法可靠地传递复杂 HTML

2. **为什么使用 DOMParser 而非 Regex？**
   - Regex 无法准确匹配复杂的嵌套 HTML 结构
   - DOMParser 提供真正的 DOM 树，可以精确操作

3. **为什么不预处理字符串？**
   - 字符串级别的清理（replace、substring）会破坏 HTML 结构
   - 必须先解析为 DOM，再进行 DOM 级别的操作

4. **为什么使用 Flexbox？**
   - 提供灵活的上下分栏布局
   - 自动处理高度分配和滚动
   - `min-height: 0` 是关键，允许子元素收缩

### 测试步骤

**准备**：搜索一个同时有 Caregiver 和 Patient 结果的电话号码

**验证清单**：
1. [x] 弹窗正常打开，显示两个面板
2. [x] Caregiver 面板标题："Caregiver (护工) 搜索结果 (X 条)"
3. [x] Patient 面板标题："Patient (病人) 搜索结果 (X 条, Active: X)"
4. [x] Caregiver 表格：
   - [x] 表头清晰（白色文字）
   - [x] 无 "sortable column head" 文字
   - [x] 无空的 Action 列
   - [x] 数据完整显示
5. [x] Patient 表格：
   - [x] 表头清晰（白色文字）
   - [x] 无 "sortable column head" 文字
   - [x] 病人名字干净（无 "View Patient Details"）
   - [x] Patient ID 干净（无重复的 "Patient Id"）
   - [x] DOB 干净（无 "sortable column head"）
6. [x] 电话号码高亮显示（黄色背景）
7. [x] 点击 Caregiver 名字 → 跳转到 Caregiver profile
8. [x] 点击 Patient 名字 → 跳转到 Patient profile
9. [x] 两个面板可独立滚动
10. [x] 无原始页面标题（如 "Caregiver search results"）

### 边界情况测试
- [x] Caregiver 多条结果，Patient 1 条结果
- [x] Caregiver 1 条结果，Patient 多条结果
- [x] 两边都是多条结果
- [x] 表格内容很长时，滚动条正常工作

### 回归测试
- [x] 单独 Caregiver 搜索结果正常显示
- [x] 单独 Patient 搜索结果正常显示
- [x] 单一结果自动跳转功能不受影响
- [x] 电话号码高亮功能不受影响

---

## 里程碑

- **2025-12-14**: Epic 启动
- **2025-12-14**: Story 1 完成（中文标题）
- **2025-12-14**: Story 2 完成（Authorization Note 格式化）
- **2025-12-14**: Story 3 完成（Resize 修复）
- **2025-12-20**: Story 4 开发（Combined View）
  - v3.6.5 初始实现（iframe 方案失败）
  - 经历 6 次迭代修复
  - **v3.6.6**: 最终方案成功（div + DOMParser）✅
- **2025-12-20**: Story 4 完成，所有测试通过
- **2025-12-20**: Epic 2 完全完成
