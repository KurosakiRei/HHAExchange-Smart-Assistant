# ADR-002: Visit Monitor 详情列表 UI 增强方案

## 状态
已实施 (2025-12-14)

## 背景

Visit Monitor 的详情列表（Popover）在实际使用中暴露出多个用户体验问题：

1. **国际化支持不足**：列标题全为英文，中文用户不友好
2. **Authorization Note 可读性差**：
   - 原始HTML表格直接渲染导致列宽度爆炸
   - 表格内容覆盖到其他列的文本
   - 信息显示不完整（丢失 New Value 列）
3. **Resize 功能问题**：
   - 拖拽时详情列表不跟随鼠标移动
   - 存在莫名其妙的高度和宽度限制
   - 快速拖动时出现"脱离"现象

## 决策

### 1. 国际化 - 混合中英文标题

**方案**：保留功能性英文标识符，添加中文说明

```typescript
<th style="width:40px;color: #333 !important;" class="col-coordinator">辅导员 (Ext.)</th>
```

**理由**：
- 用户主要是中文使用者，中文标题更直观
- 保留关键英文标识（如 Ext.）保持系统一致性
- 不影响现有的列宽度和样式

### 2. Authorization Note 格式化渲染

**问题分析**：
- 原版HTML表格（3列：Edited Fields, Previous Value, New Value）直接插入会撑破容器
- 之前的解决方案只提取了2列，丢失了 New Value 信息

**最终方案**：解析原始HTML并生成紧凑表格

```typescript
function formatAuthorizationNote(note: string): string {
  // 1. 解析原始HTML表格
  const table = tempDiv.querySelector('table');
  
  // 2. 提取表头和所有数据列
  const headers: string[] = [];
  headerRow?.querySelectorAll('th, td').forEach(cell => {
    headers.push(cell.textContent?.trim() || '');
  });
  
  // 3. 生成紧凑HTML表格
  result += '<table class="auth-note-table"><thead><tr>';
  headers.forEach(h => result += `<th>${h}</th>`);
  result += '</tr></thead><tbody>';
  
  // 4. 填充数据行（完整保留所有列）
  tableData.forEach(row => {
    result += '<tr>';
    row.cells.forEach(cell => result += `<td>${cell}</td>`);
    result += '</tr>';
  });
}
```

**CSS 样式**：
```less
.popover-table td.note-cell {
    white-space: normal !important;
    max-width: 350px;
    word-wrap: break-word;
}

.auth-note-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    th, td {
        border: 1px solid #dee2e6;
        padding: 4px 8px;
    }
}
```

### 3. Resize 功能修复 - 透明遮罩层方案

**问题根因**：页面中的 iframe 或其他元素会拦截鼠标事件，导致 `mousemove` 事件丢失

**解决方案**：创建全屏透明遮罩层

```typescript
const onMouseDown = (e: MouseEvent) => {
  // 创建透明遮罩层覆盖整个页面
  overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;cursor:nwse-resize;';
  document.body.appendChild(overlay);
  
  // 使用 capture 模式捕获事件
  document.addEventListener("mousemove", onMouseMove, true);
  document.addEventListener("mouseup", onMouseUp, true);
};
```

**CSS 高度限制调整**：
```less
#details-popover {
    max-height: 90vh; // 从 60vh 提升到 90vh
    max-width: 95vw;  // 从 90vw 提升到 95vw
}
```

## 技术细节

### Authorization Note 解析逻辑

1. **检测阶段**：判断是否包含 Authorization 表格标识
2. **解析阶段**：使用 `DOMParser` 安全解析HTML
3. **数据提取**：完整保留表头和所有列数据
4. **渲染阶段**：生成紧凑表格，适应容器宽度

### Resize 事件捕获

1. **遮罩层**：`z-index: 999999` 确保覆盖所有元素
2. **事件捕获**：使用 `capture: true` 优先捕获事件
3. **防止文本选中**：`document.body.style.userSelect = 'none'`
4. **清理机制**：`mouseup` 时移除遮罩层和事件监听

## 结果

### 用户体验改进

- ✅ 中文列标题直观易懂
- ✅ Authorization Note 完整显示所有3列信息
- ✅ Note列内容自动换行，不覆盖其他列
- ✅ Resize 功能流畅跟随鼠标
- ✅ 可拉伸到接近全屏高度（90vh）

### 性能影响

- HTML解析使用原生 `DOMParser`，性能良好
- 遮罩层仅在拖拽期间存在，无常驻性能开销
- CSS渲染优化，无额外重排重绘

## 替代方案

### 备选方案 A：使用弹窗显示 Authorization Note
**优点**：可以显示更大表格
**缺点**：需要额外点击，打断用户工作流

### 备选方案 B：使用 pointer-events 而非遮罩层
**优点**：更轻量
**缺点**：在复杂页面结构中可能失效

### 备选方案 C：使用 CSS Grid 重新布局表格
**优点**：现代化布局
**缺点**：改动较大，兼容性风险

## 参考资料

- [MDN: MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
- [Event Capturing vs Bubbling](https://javascript.info/bubbling-and-capturing)
- [CSS word-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/word-wrap)
