# ADR-005: Combined View 实现方案 - Aide & Patient 搜索结果合并显示

## 状态
已实施 (2025-12-20)

## 背景

在 v3.6.5 版本中，我们引入了 Combined View 功能，允许用户在一个弹窗中同时查看 Aide (Caregiver) 和 Patient 的搜索结果。然而，初始实现遇到了严重的技术障碍，导致多次迭代才最终找到可行方案。

### 初始需求
- 在同一个弹窗中上下分栏显示 Aide 和 Patient 搜索结果
- 保持原有表格的完整功能（排序、点击跳转等）
- 高亮显示搜索的电话号码
- 提供清晰的视觉分隔和标题

### 遇到的问题

#### 问题 1: Chrome 安全策略阻止嵌套 Blob URL
**尝试方案**：使用 iframe 嵌套 blob URL 页面
```typescript
// ❌ 失败 - Chrome blocked nested blob URLs
const aideBlob = new Blob([aideHtml], { type: 'text/html' });
const aideBlobUrl = URL.createObjectURL(aideBlob);
iframe.src = aideBlobUrl; // 被安全策略阻止
```

**错误信息**：`"This content is blocked. Contact the site owner to fix the issue."`

**原因**：Chrome 的安全策略不允许在 blob URL 页面中嵌套另一个 blob URL 的 iframe。

#### 问题 2: srcdoc 方案导致 HTML 破坏
**尝试方案 A**：使用 `escapeHtml()` 转义后传给 srcdoc
```typescript
// ❌ 失败 - Over-escaped, HTML tags destroyed
iframe.srcdoc = escapeHtml(aideHtml); // <table> 变成 &lt;table&gt;
```

**尝试方案 B**：仅转义引号后传给 srcdoc
```typescript
// ❌ 失败 - Still resulted in blank iframe
iframe.srcdoc = aideHtml.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
```

#### 问题 3: 字符串 Regex 提取导致内容丢失
**尝试方案**：用正则表达式提取 `<body>` 内容
```typescript
// ❌ 失败 - Extracted scripts but no table data
function extractBodyContent(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1] : html;
}
```

**问题**：复杂的 HTML 结构导致正则匹配不准确，只提取到脚本而丢失了表格内容。

#### 问题 4: 字符串清理破坏 DOM 结构
**尝试方案**：先用字符串操作清理 HTML，再用 DOMParser 解析
```typescript
// ❌ 失败 - String manipulation broke DOM structure
html = cleanupHtml(html); // 破坏了 HTML 结构
const doc = new DOMParser().parseFromString(html, 'text/html');
```

## 决策

### 最终方案：直接 DOM 嵌入 + DOMParser 清理

放弃所有 iframe 方案，改用可滚动的 `<div>` 容器直接嵌入表格内容。

#### 1. 容器结构
```html
<div class="container">
  <div class="panel">
    <h2 class="panel-header">Caregiver (护工) 搜索结果 (1 条)</h2>
    <div class="panel-content">${aideTableHtml}</div>
  </div>
  <div class="panel">
    <h2 class="panel-header">Patient (病人) 搜索结果 (1 条, Active: 1)</h2>
    <div class="panel-content">${patientTableHtml}</div>
  </div>
</div>
```

#### 2. 内容提取与清理流程

**核心原则**：
- ✅ 使用 DOMParser 解析原始 HTML（不做字符串预处理）
- ✅ 在 DOM 树上进行选择和清理操作
- ✅ 最后提取 `outerHTML` 作为最终内容

**实现代码**：
```typescript
const extractAndCleanContent = (html: string, type: "aide" | "patient"): string => {
  // 1. 直接解析原始 HTML，不做任何预处理
  const doc = new DOMParser().parseFromString(html, "text/html");
  
  // 2. 定位表格（多重备选选择器）
  let table = doc.querySelector<HTMLTableElement>("#tdSearchResults");
  if (!table) {
    table = doc.querySelector<HTMLTableElement>("table[id*='Search']");
  }
  if (!table) {
    const tables = doc.querySelectorAll<HTMLTableElement>("table");
    for (const t of tables) {
      if (t.querySelector("tbody tr")) {
        table = t;
        break;
      }
    }
  }
  
  // 3. 移除不需要的元素
  const unwantedSelectors = [
    'a[id*="uxfrmSearchXSLT"]',
    'a[href*="uxfrmSearchXSLT"]',
    'form[id*="uxfrmSearch"]',
    'input[type="hidden"]',
    'script',
    '.show-for-sr',           // 屏幕阅读器专用文字
    '[class*="show-for-sr"]'
  ];
  unwantedSelectors.forEach(sel => {
    table!.querySelectorAll(sel).forEach(el => el.remove());
  });
  
  // 4. 清理表头文字（移除 "sortable column head" 等）
  table.querySelectorAll('th, thead td').forEach(th => {
    const link = th.querySelector('a');
    if (link) {
      th.textContent = link.textContent?.trim() || '';
    } else {
      let text = th.textContent || '';
      text = text.replace(/sortable\s*column\s*head/gi, '');
      text = text.replace(/[\r\n\t]+/g, ' ');
      text = text.replace(/\s+/g, ' ').trim();
      th.textContent = text;
    }
  });
  
  // 5. 清理数据单元格
  table.querySelectorAll('tbody td, tr td').forEach(td => {
    td.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent || '';
        text = text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
        node.textContent = text;
      }
    });
    
    // 移除空的 <br>
    td.querySelectorAll('br').forEach(br => {
      if (!br.nextSibling || !br.nextSibling.textContent?.trim()) {
        br.remove();
      }
    });
  });
  
  // 6. Aide 表格特殊处理：移除空的 Action 列
  if (type === "aide") {
    const headerCells = table.querySelectorAll('thead tr th, thead tr td');
    const lastHeader = headerCells[headerCells.length - 1];
    
    if (lastHeader?.textContent?.trim().toLowerCase() === 'action') {
      const rows = table.querySelectorAll('tbody tr');
      let allEmpty = true;
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const lastCell = cells[cells.length - 1];
        if (lastCell?.textContent?.trim()) {
          allEmpty = false;
        }
      });
      
      if (allEmpty) {
        lastHeader.remove();
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          cells[cells.length - 1]?.remove();
        });
      }
    }
  }
  
  return table.outerHTML;
};
```

#### 3. CSS 样式设计

**关键样式**：
```css
/* 上下分栏布局 */
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

/* 固定标题 + 可滚动内容 */
.panel-header { 
  flex-shrink: 0;  /* 标题不收缩 */
  background-color: #0d3e61; 
  color: #fff;
}

.panel-content { 
  flex: 1;
  overflow: auto;  /* 内容可滚动 */
}

/* 表头样式加强（覆盖原始样式）*/
.panel-content table th,
.panel-content table thead th,
.panel-content table thead td {
  background-color: #0d3e61 !important;
  color: #fff !important;
  font-weight: 600;
}

/* 确保表头内的链接也是白色 */
.panel-content table th a,
.panel-content table thead a {
  color: #fff !important;
}
```

#### 4. 屏幕阅读器文字清理

**问题发现**：Patient 表格中存在隐藏的屏幕阅读器专用文字
```html
<td>
  634937<span class="show-for-sr"> Patient Id</span>
</td>
<td>
  <a href="#">CHEN YINGJIAN 
    <span class="show-for-sr">View Patient Details</span>
  </a>
</td>
```

**解决方案**：在 unwantedSelectors 中添加
```typescript
'.show-for-sr',
'[class*="show-for-sr"]'
```

#### 5. 术语统一

为保持与 HHA 系统一致性，将所有 "Aide" 改为 "Caregiver"：
- 面板标题：`"Caregiver (护工) 搜索结果"`
- 注释和变量保持为 "aide"（技术层面）

## 技术决策总结

| 方案 | 评估 | 结果 |
|------|------|------|
| iframe + nested blob URL | Chrome 安全策略阻止 | ❌ 失败 |
| iframe + srcdoc (escaped) | HTML 被过度转义破坏 | ❌ 失败 |
| iframe + srcdoc (quote-escaped) | 仍然显示空白 | ❌ 失败 |
| div + Regex extraction | 内容提取不完整 | ❌ 失败 |
| div + String cleanup + DOMParser | DOM 结构被破坏 | ❌ 失败 |
| **div + DOMParser + DOM cleanup** | **完美工作** | ✅ 成功 |

## 经验教训

### 1. 优先使用 DOM API 而非字符串操作
当处理 HTML 内容时，应该：
- ✅ 使用 `DOMParser` 解析为 DOM 树
- ✅ 使用 `querySelector`、`querySelectorAll` 定位元素
- ✅ 使用 `remove()`、`textContent` 等 DOM 方法操作
- ❌ 避免使用正则表达式匹配 HTML 标签
- ❌ 避免字符串替换/拼接破坏 HTML 结构

### 2. 理解浏览器安全策略
- Blob URL 的嵌套受限于 CSP (Content Security Policy)
- 不要假设 iframe 可以嵌入任何内容
- 在 blob URL 页面中，某些操作会被安全策略阻止

### 3. 渐进式调试方法
- 从最简单的方案开始（iframe + URL）
- 每次只改变一个变量
- 使用 Chrome DevTools 检查实际渲染结果
- 打印中间状态验证数据流

### 4. CSS Flexbox 布局细节
- `min-height: 0` 对于允许 flex 子元素收缩至关重要
- `flex-shrink: 0` 用于固定元素（如标题栏）
- `overflow: auto` 必须配合 flex 布局正确工作

## 影响范围

### 修改的文件
- `src/js/IncomingCallHandler.ts`
  - `displayCombinedResults()` 函数重写
  - `extractAndCleanContent()` 新函数（核心清理逻辑）
  - Combined HTML 模板和 CSS

### 版本历史
- v3.6.5: 初始 Combined View（iframe 方案，失败）
- v3.6.5 (fix-1 to fix-3): iframe srcdoc 尝试（失败）
- v3.6.5 (fix-4): div + regex 方案（部分成功）
- v3.6.5 (fix-5): div + string cleanup（失败）
- **v3.6.6**: div + DOMParser 方案（完全成功）✅

## 未来改进方向

1. **性能优化**
   - 考虑缓存 DOMParser 实例
   - 对于大量结果，可能需要虚拟滚动

2. **功能增强**
   - 添加导出功能（CSV/Excel）
   - 添加过滤和排序功能
   - 支持调整两个面板的高度比例

3. **可访问性**
   - 虽然移除了 `.show-for-sr` 元素，但应该在清理后的表格中添加适当的 ARIA 标签
   - 确保键盘导航可用

## 参考资料
- [MDN: DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser)
- [Chrome CSP and Blob URLs](https://developer.chrome.com/docs/extensions/mv3/security/)
- [CSS Flexbox Layout](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
