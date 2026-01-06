# ADR-006: Patient Emergency Contacts 数据源集成

**Date**: 2025-12-30  
**Status**: Proposed  
**Decision Makers**: Development Team  
**Related Epic**: [Epic-6: 添加第三数据源 - Patient Emergency Contacts](../stories/epic-6-emergency-contacts-third-data-source.md)

---

## Context and Problem Statement

在来电搜索功能中，当前只搜索两个数据源：
1. **Caregiver (Aide)** - 护理员
2. **Patient** - 病人（使用病人本人的电话号码）

但实际业务中，大量来电来自**病人的紧急联系人**（家属、朋友等），这些电话号码记录在 HHAExchange 的 **Emergency Contacts Report** 中。当前系统无法识别这类来电，导致 Coordinator 需要手动搜索，效率低下。

**核心问题**：
- 如何从 Emergency Contacts Report 获取数据？
- 如何构建高效的 phone → patient 映射表？
- 如何集成到现有的来电搜索流程？

---

## Decision Drivers

1. **业务价值**: 73.8% 的病人有紧急联系人电话（1,446/1,960），覆盖率高
2. **性能要求**: 不能影响现有搜索速度
3. **可靠性要求**: 数据获取失败时不影响前两个数据源
4. **可维护性**: 复用 Epic-5 的架构，代码简洁
5. **数据新鲜度**: 紧急联系人数据相对稳定，可缓存

---

## Considered Options

### Option 1: 爬取 Emergency Contacts Report 的 HTML 页面

**实现方式**：
- 使用 `GM_fetch` 获取 `EmergencyContactsReportEnt.aspx` 页面
- 点击 "View Report" 按钮触发报表生成
- 解析生成的 HTML 表格提取数据

**优点**：
- ✅ 不需要额外依赖（如 Excel 解析库）
- ✅ 技术相对简单

**缺点**：
- ❌ HTML 表格可能分页，需要处理多页（或调整 PageSize）
- ❌ HTML 解析不如结构化数据稳定
- ❌ 数据量大时 HTML 文件也很大

**评估**: ⭐⭐⭐ (可行但不优)

---

### Option 2: 拦截 Excel 下载并在后台解析（失败方案）

**实现方式**：
- 尝试拦截 "Print to Excel" 按钮的下载请求
- 使用 SheetJS 在后台解析 Excel 文件

**优点**：
- ✅ Excel 文件结构化，易于解析
- ✅ 包含完整数据，无分页问题

**缺点**：
- ❌ **ASP.NET WebForms 使用 VIEWSTATE 验证，JavaScript 无法拦截 native form POST**
- ❌ 所有 `fetch` / `XMLHttpRequest` 尝试都返回错误页面
- ❌ 技术上不可行（已验证）

**评估**: ⭐ (技术不可行)

**验证记录**：
```javascript
// 尝试 1: 直接 fetch - 失败 (6146 bytes 错误页面)
const response = await fetch(url);

// 尝试 2: 带 VIEWSTATE - 失败 (同样错误)
const response = await fetch(url, {
  method: 'POST',
  body: new FormData(form)
});

// 尝试 3: XMLHttpRequest with Blob - 失败
xhr.responseType = 'blob';

// 尝试 4: Hidden iframe form submission - 失败 (32016 bytes 错误页面)
iframe.contentDocument.querySelector('form').submit();

// 结论: ASP.NET VIEWSTATE/EventValidation 验证阻止 JavaScript 拦截
```

---

### Option 3: 使用 Microsoft SSRS Report Viewer Export API（推荐方案）✅

**实现方式**：

通过分析 Emergency Contacts Report 页面，发现其使用 **Microsoft SSRS (SQL Server Reporting Services) Report Viewer**，提供了标准的 Export API。

**技术发现**：

1. **页面使用 PageMethods.BindData**
   ```javascript
   // EmergencyContactsReportEnt.aspx 页面中的按钮
   onclick="return openReport();"
   
   // openReport() 函数
   function openReport() {
     var XMLUserData = buildXMLParams();
     PageMethods.BindData(XMLUserData, function(result) {
       // result 是一个 GUID
       window.open(`Reports.aspx?UserDataXML=${result}&ReportName=Emergency Contacts`);
     });
   }
   ```

2. **Reports.aspx 返回 SSRS Report Viewer**
   ```javascript
   // HTML 中包含 ReportSession 和 ControlID
   ExportUrlBase="/HHAReportsML/Reserved.ReportViewerWebControl.axd?
     ReportSession=zusgqwmndqmru0ek3pkq3oa2&
     ControlID=55844a97c26f465d9c27fe0872df61c5&
     OpType=Export&
     Format=EXCELOPENXML"
   ```

3. **直接调用 Export API 获取 Excel**
   ```javascript
   const excelUrl = `${baseUrl}/Reserved.ReportViewerWebControl.axd?
     ReportSession=${reportSession}&
     ControlID=${controlId}&
     OpType=Export&
     Format=EXCELOPENXML`;
   
   const response = await fetch(excelUrl);
   const buffer = await response.arrayBuffer();
   // buffer 是真正的 XLSX 文件（验证: 文件头 50 4B 03 04）
   ```

**完整数据获取流程**：

```javascript
// ===== STEP 1: 调用 PageMethods.BindData 获取 GUID =====
function buildXMLParams() {
  const sessionId = 'A8EC9184-196D-498A-BEC8-763B586175C0'; // 从 URL 获取
  const officeIDs = '469,5137,5139,6475,14849'; // 从配置获取
  
  return `<Params>
    <Param StatusID="Active"/>
    <Param CoordinatorID="All"/>
    <Param OfficeIDs="${officeIDs}"/>
    <Param s="${sessionId}"/>
    <Param AppVersion="ENT"/>
    <Param PrimaryContractID="All"/>
    <Param PatientTeamID="All"/>
    <Param PatientBranchID="All"/>
    <Param PatientLocationTypeID="All"/>
  </Params>`;
}

const xmlParams = buildXMLParams();
const guid = await new Promise((resolve, reject) => {
  PageMethods.BindData(xmlParams, resolve, reject);
});
// 返回: "5F1E60FE-51A8-4D61-9CCA-DDAADD8345B6"

// ===== STEP 2: 获取 Reports.aspx 页面（含 ReportSession） =====
const reportUrl = `https://reports.hhaexchange.com/HHAReportsML/Reports/Reports.aspx?UserDataXML=${guid}&ReportName=Emergency%20Contacts&ReportTitle=Emergency%20Contacts`;

const reportResponse = await fetch(reportUrl, { credentials: 'include' });
const reportHtml = await reportResponse.text();

// ===== STEP 3: 提取 ReportSession 和 ControlID =====
const exportUrlMatch = reportHtml.match(/ExportUrlBase.*?ReportSession=([^&"\\]+).*?ControlID=([^&"\\]+)/);
const reportSession = exportUrlMatch[1]; // "zusgqwmndqmru0ek3pkq3oa2"
const controlId = exportUrlMatch[2];     // "55844a97c26f465d9c27fe0872df61c5"

// ===== STEP 4: 下载 Excel 文件 =====
const excelExportUrl = `https://reports.hhaexchange.com/HHAReportsML/Reserved.ReportViewerWebControl.axd?ReportSession=${reportSession}&Culture=1033&CultureOverrides=True&UICulture=1033&UICultureOverrides=True&ReportStack=1&ControlID=${controlId}&OpType=Export&FileName=Emergency+Contacts&ContentDisposition=OnlyHtmlInline&Format=EXCELOPENXML`;

const excelResponse = await fetch(excelExportUrl, { credentials: 'include' });
const buffer = await excelResponse.arrayBuffer();
// buffer.byteLength = 384018 bytes (真正的 XLSX 文件)

// ===== STEP 5: 使用 SheetJS 解析 Excel =====
const workbook = XLSX.read(buffer, { type: 'array' });
const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
// jsonData = 1973 rows (包含表头和过滤条件行)
```

**优点**：
- ✅ **技术可行**（已在浏览器中成功验证）
- ✅ 获取完整数据（1960 条记录）
- ✅ Excel 格式标准化，易于解析
- ✅ 使用官方 API，稳定性高
- ✅ 文件大小适中（384 KB）

**缺点**：
- ❌ 需要额外依赖 SheetJS 库（+200KB）
- ❌ 多步骤流程，代码相对复杂
- ❌ PageMethods 需要在页面上下文中调用（或使用备用方案）

**评估**: ⭐⭐⭐⭐⭐ (推荐方案)

---

## Decision Outcome

**选择 Option 3: Microsoft SSRS Report Viewer Export API**

### 实现细节

#### 1. 依赖库

在 Tampermonkey 脚本头部添加：

```javascript
// ==UserScript==
// @name         HHAExchange Smart Assistant
// @require      https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
// ==/UserScript==
```

#### 2. TypeScript 类型定义

```typescript
// Emergency Contacts 相关类型
interface PatientEmergencyContact {
  patientName: string;
  admissionId: string;
  contactName?: string;
  contactRelation?: string;
  phones: string[];
}

type PhoneToPatientMap = Map<string, PatientEmergencyContact[]>;

interface EmergencyContactsCache {
  data: PhoneToPatientMap;
  timestamp: number;
  version: string;
}

// 扩展现有的 HhaSearchResult
interface HhaSearchResult {
  count: number;
  activeCount?: number;
  finalUrl?: string;
  searchUrl?: string;
  rawHtml?: string;
  emergencyContactMatches?: PatientEmergencyContact[]; // 新增字段
}
```

#### 3. 核心函数实现

```typescript
// ===== 数据获取函数 =====
async function fetchEmergencyContactsData(): Promise<any[][]> {
  try {
    // Step 1: Build XML params
    const sessionId = extractSessionIdFromUrl();
    const officeIDs = '469,5137,5139,6475,14849'; // 从配置读取
    
    const xmlParams = `<Params>
      <Param StatusID="Active"/>
      <Param CoordinatorID="All"/>
      <Param OfficeIDs="${officeIDs}"/>
      <Param s="${sessionId}"/>
      <Param AppVersion="ENT"/>
      <Param PrimaryContractID="All"/>
      <Param PatientTeamID="All"/>
      <Param PatientBranchID="All"/>
      <Param PatientLocationTypeID="All"/>
    </Params>`;
    
    // Step 2: Get GUID
    // 注意: PageMethods 需要在正确的页面上下文中调用
    // 备用方案: 使用 iframe 或直接 AJAX 调用
    const guid = await callBindDataAPI(xmlParams);
    
    // Step 3: Get Reports.aspx
    const reportUrl = `https://reports.hhaexchange.com/HHAReportsML/Reports/Reports.aspx?UserDataXML=${guid}&ReportName=Emergency%20Contacts&ReportTitle=Emergency%20Contacts`;
    const reportResponse = await GM_fetch(reportUrl, { credentials: 'include' });
    const reportHtml = await reportResponse.text();
    
    // Step 4: Extract ReportSession and ControlID
    const exportUrlMatch = reportHtml.match(/ExportUrlBase.*?ReportSession=([^&"\\]+).*?ControlID=([^&"\\]+)/);
    if (!exportUrlMatch) {
      throw new Error('Failed to extract ReportSession from Reports.aspx');
    }
    const reportSession = exportUrlMatch[1];
    const controlId = exportUrlMatch[2];
    
    // Step 5: Download Excel
    const excelExportUrl = `https://reports.hhaexchange.com/HHAReportsML/Reserved.ReportViewerWebControl.axd?ReportSession=${reportSession}&Culture=1033&CultureOverrides=True&UICulture=1033&UICultureOverrides=True&ReportStack=1&ControlID=${controlId}&OpType=Export&FileName=Emergency+Contacts&ContentDisposition=OnlyHtmlInline&Format=EXCELOPENXML`;
    
    const excelResponse = await GM_fetch(excelExportUrl, { credentials: 'include' });
    const buffer = await excelResponse.arrayBuffer();
    
    // Step 6: Parse Excel
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    
    console.log(`[EmergencyContacts] Successfully fetched ${jsonData.length} rows`);
    return jsonData;
    
  } catch (error) {
    console.error('[EmergencyContacts] Data fetch failed:', error);
    throw error;
  }
}

// ===== 电话号码解析函数 =====
function parsePhoneNumbers(contactStr: string): string[] {
  if (!contactStr || typeof contactStr !== 'string') return [];
  
  const phones: string[] = [];
  // 匹配 Ph1: xxx-xxx-xxxx 或 Ph2: xxx-xxx-xxxx
  const phoneRegex = /Ph[12]:\s*([\d\-\(\)\s]+)/g;
  let match;
  
  while ((match = phoneRegex.exec(contactStr)) !== null) {
    // 清理格式：去除 -, (), 空格
    const phone = match[1].trim().replace(/[\-\(\)\s]/g, '');
    if (phone && phone.length >= 10) {
      phones.push(phone);
    }
  }
  
  // 去重
  return [...new Set(phones)];
}

// ===== 映射表构建函数 =====
function buildPhoneToPatientMap(excelData: any[][]): PhoneToPatientMap {
  const map = new Map<string, PatientEmergencyContact[]>();
  
  // 找到表头行（包含 "Sr#"）
  let headerRowIndex = -1;
  for (let i = 0; i < excelData.length; i++) {
    if (excelData[i] && excelData[i][0] === 'Sr#') {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) {
    console.error('[EmergencyContacts] Header row not found');
    return map;
  }
  
  // 获取列索引
  const headerRow = excelData[headerRowIndex];
  const colIndex = {
    admissionId: headerRow.findIndex(h => h === 'Admission ID'),
    patient: headerRow.findIndex(h => h === 'Patient'),
    contact1: headerRow.findIndex(h => h === 'Contact1'),
    contact2: headerRow.findIndex(h => h === 'Contact2'),
    contact3: headerRow.findIndex(h => h === 'Contact3'),
  };
  
  // 遍历数据行
  for (let i = headerRowIndex + 1; i < excelData.length; i++) {
    const row = excelData[i];
    if (!row || typeof row[0] !== 'number') continue; // 跳过非数据行
    
    const admissionId = row[colIndex.admissionId];
    const patientName = row[colIndex.patient]?.trim();
    
    // 处理 Contact1, Contact2, Contact3
    for (const contactCol of ['contact1', 'contact2', 'contact3']) {
      const contactStr = row[colIndex[contactCol]];
      const phones = parsePhoneNumbers(contactStr);
      
      for (const phone of phones) {
        if (!map.has(phone)) {
          map.set(phone, []);
        }
        
        // 提取联系人姓名和关系（可选）
        const lines = contactStr?.split('\n').map(l => l.trim()).filter(l => l) || [];
        const contactName = lines[0] && !lines[0].startsWith('Ph') ? lines[0] : undefined;
        const relationKeywords = ['Daughter', 'Son', 'Spouse', 'Wife', 'Husband', 'Mother', 'Father'];
        const contactRelation = lines.find(l => relationKeywords.some(k => l.includes(k)));
        
        map.get(phone)!.push({
          patientName,
          admissionId,
          contactName,
          contactRelation,
          phones: [phone], // 只包含当前这个电话
        });
      }
    }
  }
  
  console.log(`[EmergencyContacts] Built mapping for ${map.size} unique phone numbers`);
  return map;
}

// ===== 搜索函数 =====
function searchEmergencyContactsByPhone(phone: string): PatientEmergencyContact[] {
  if (!emergencyContactsCache || !emergencyContactsCache.data) {
    console.warn('[EmergencyContacts] Cache not initialized');
    return [];
  }
  
  // 清理输入电话号码格式
  const cleanPhone = phone.replace(/[\-\(\)\s]/g, '');
  const matches = emergencyContactsCache.data.get(cleanPhone) || [];
  
  console.log(`[EmergencyContacts] Search for ${phone}: ${matches.length} matches`);
  return matches;
}
```

#### 4. 缓存机制

```typescript
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

let emergencyContactsCache: EmergencyContactsCache | null = null;

async function initializeEmergencyContacts(): Promise<void> {
  if (isCacheValid()) {
    console.log('[EmergencyContacts] Cache is valid, skipping fetch');
    return;
  }
  
  console.log('[EmergencyContacts] Initializing data...');
  try {
    const excelData = await fetchEmergencyContactsData();
    const phoneMap = buildPhoneToPatientMap(excelData);
    
    emergencyContactsCache = {
      data: phoneMap,
      timestamp: Date.now(),
      version: '1.0',
    };
    
    console.log(`[EmergencyContacts] Initialized with ${phoneMap.size} phone numbers`);
  } catch (error) {
    console.error('[EmergencyContacts] Initialization failed:', error);
    // 不抛出错误，允许继续使用前两个数据源
  }
}

function isCacheValid(): boolean {
  if (!emergencyContactsCache) return false;
  const now = Date.now();
  return (now - emergencyContactsCache.timestamp) < CACHE_DURATION;
}

// 页面加载时初始化（不阻塞）
window.addEventListener('load', () => {
  setTimeout(() => {
    initializeEmergencyContacts().catch(err => {
      console.error('[EmergencyContacts] Background initialization failed:', err);
    });
  }, 2000); // 延迟 2 秒，避免影响页面加载
});
```

#### 5. 集成到来电搜索

```typescript
async function extractAndInitiateSearch(callInfoPanel: HTMLElement): Promise<boolean> {
  const numElement = callInfoPanel?.querySelector<HTMLElement>(PHONE_NUMBER_CONTAINER_SELECTOR);
  if (numElement && !numElement.textContent?.includes("ext:")) {
    const formattedNumber = formatPhoneNumber(numElement.textContent);
    if (formattedNumber) {
      currentSearchPhone = formattedNumber;
      console.log(`号码 ${formattedNumber}, 开始并行搜索 Aide、Patient 和 Emergency Contacts...`);
      
      // 三源并行搜索
      const [aideResult, patientResult, emergencyMatches] = await Promise.all([
        fetchHhaData("aide", formattedNumber),
        fetchHhaData("patient", formattedNumber),
        searchEmergencyContactsByPhone(formattedNumber),
      ]);
      
      // 构建 Emergency Contacts 的搜索结果对象
      const emergencyResult: HhaSearchResult = {
        count: emergencyMatches.length,
        emergencyContactMatches: emergencyMatches,
        rawHtml: '', // Emergency Contacts 不需要 HTML
      };
      
      // 处理组合结果
      handleThreeSourceResults(aideResult, patientResult, emergencyResult, formattedNumber);
      return true;
    }
  }
  return false;
}
```

---

## Consequences

### Positive

1. ✅ **业务价值高**: 73.8% 的病人有紧急联系人，大幅提升搜索覆盖率
2. ✅ **技术可行**: 已验证的技术方案，使用官方 SSRS Export API
3. ✅ **性能优化**: 缓存机制避免频繁请求
4. ✅ **降级优雅**: Emergency Contacts 失败不影响前两个数据源
5. ✅ **代码复用**: 可复用 Epic-5 的结果处理逻辑

### Negative

1. ❌ **依赖外部库**: SheetJS 增加 ~200KB 脚本体积
2. ❌ **初始化时间**: 首次加载需要 2-3 秒获取数据
3. ❌ **Session 依赖**: PageMethods.BindData 需要正确的页面上下文或 Session
4. ❌ **缓存过期**: 1 小时缓存可能导致数据不是最新（可接受）
5. ❌ **内存占用**: 1664 个电话号码的映射表（约 100-200KB，可接受）

### Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| SSRS API 变更 | 添加版本检测，保留 HTML 爬取作为备用方案 |
| PageMethods 上下文问题 | 使用 iframe 加载 EmergencyContactsReportEnt.aspx 或直接 AJAX 调用 |
| SheetJS 库加载失败 | 添加加载检测，失败时禁用 Emergency Contacts 搜索 |
| 缓存数据过期 | 显示"数据更新时间"，提供手动刷新按钮 |

---

## Technical Notes

### PageMethods.BindData 备用方案

如果直接调用 `PageMethods.BindData` 失败（因为不在正确的页面上下文），可以：

**方案 A: 使用 iframe**
```typescript
function callBindDataViaIframe(xmlParams: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'https://reports.hhaexchange.com/HHAReportsML/Reports/EmergencyContactsReportEnt.aspx';
    
    iframe.onload = () => {
      try {
        iframe.contentWindow.PageMethods.BindData(xmlParams, resolve, reject);
      } catch (error) {
        reject(error);
      }
    };
    
    document.body.appendChild(iframe);
  });
}
```

**方案 B: 直接 AJAX 调用**
```typescript
async function callBindDataViaAjax(xmlParams: string): Promise<string> {
  const url = 'https://reports.hhaexchange.com/HHAReportsML/Reports/EmergencyContactsReportEnt.aspx/BindData';
  
  const response = await GM_fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ XMLUserData: xmlParams }),
    credentials: 'include',
  });
  
  const result = await response.json();
  return result.d; // ASP.NET AJAX 返回格式
}
```

### Excel 文件结构

```
Row 1: "Emergency Contacts" | ... | "Page 1 of 1"
Row 2: null | ... | "Report Date: 12/21/2025 3:25:30 AM"
Row 3: (空行)
Row 4: "Status:" | "Active" | ... | "Coordinator:" | "All" | ...
...
Row 11: (空行)
Row 12 (表头): "Sr#" | "" | "Admission ID" | "" | "Patient" | ... | "Contact1" | "Contact2" | "Contact3"
Row 13+: 1 | "" | "AHC-901686" | "" | "Abakumova Mariya" | ... | "Olga\n\nDaughter\nPh1: 718-934-2659\nPh2:" | ...
...
Row 1972: 1960 | ...
```

**解析关键**：
- 表头行: 查找第一个包含 `"Sr#"` 的行
- 数据行: 从表头下一行开始，直到遇到非数字 `Sr#`
- Contact 列: 包含多行文本，需要按 `\n` 分割并用正则提取电话

---

## Related Documents

- [Epic-6: 添加第三数据源 - Patient Emergency Contacts](../stories/epic-6-emergency-contacts-third-data-source.md)
- [Epic-5: 来电搜索功能优化与 Bug 修复](../stories/epic-5-incoming-call-search-optimization.md)
- [ADR-005: 来电搜索结果判断逻辑优化](./005-incoming-call-search-logic-optimization.md)

---

*Document Version: 1.0*  
*Author: Development Team*  
*Review Status: Pending*
