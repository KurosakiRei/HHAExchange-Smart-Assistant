# HHAexchange Patient General Notes Report API 文档

## 概述

本文档记录了 HHAexchange Patient General Notes Report 页面背后的API调用流程，可用于自动化报表生成。

## 认证信息

### Session 与 Token

```javascript
// 关键 Cookie
HHAX_Session: 'F9CACD0B-058F-4E3E-B2D4-FFFA26704099'  // Session ID
HHAX_ENT_AccessToken: 'eyJhbGciOi...'  // JWT Token (PS256 算法)

// JWT Token 解码后的 Payload
{
  "iss": "hhaexchange.com",
  "sid": "F9CACD0B-058F-4E3E-B2D4-FFFA26704099",  // Session ID
  "pid": "469",    // Primary Office ID
  "uid": "184885", // User ID
  "ctype": "VENDOR",
  "as": "79BB4FCD-9884-4652-B77F-6077F363193D",  // App Secret
  "rid": "63904",  // Role ID
  "oid": "469",    // Office ID
  "sub": "184885", // Subject (User ID)
  "app": "ENT",    // App Version
  "env": "app",
  "guid": "c572335d-1ccc-456b-a664-018cfc596b24",
  "gvid": "d76a344a-9890-4856-abbe-66eb81ffe0f9"
}
```

### URL 参数

```
s=F9CACD0B-058F-4E3E-B2D4-FFFA26704099  // Session ID
Version=25.07
MinorVersion=1.00
AppVersion=ENT
```

---

## API 端点

### 1. 获取 Coordinators 列表

**端点**: `GET /HHAReportsML/Handler/Contracts.ashx/BindContract`

**参数**:
```
MethodName=GetCoordinatorByOffice
UserID=184885
OfficeIDs=469,5137,5139,6475,14849
Version=25.07
MinorVersion=1.00
AppVersion=ENT
```

**响应示例**:
```json
[
  {"ID": "75207", "Text": "Tao Yang ext.503 TYang@alwaysNY.net"},
  {"ID": "8058", "Text": "Anna O. Russian Sup ext.141 AOzhigova@alwaysny.net"},
  // ... 更多 Coordinators
]
```

---

### 2. 获取 Note Reasons 列表

**端点**: `GET /HHAReportsML/Handler/Contracts.ashx/BindContract`

**参数**:
```
MethodName=GetPatientGeneralNoteReasons_All
UserID=184885
ReasonType=16
Version=25.07
MinorVersion=1.00
AppVersion=ENT
```

**响应示例**:
```json
[
  {"ID": "2289535", "Text": "Quality Assurance"},
  {"ID": "123456", "Text": "Other Reason"},
  // ... 更多 Reasons
]
```

---

### 3. 获取 Offices 列表

**端点**: `POST /HHAReportsWSMLNew/Office.asmx/GetAllOffices`

**请求头**:
```
Content-Type: application/json; charset=UTF-8
```

**请求体**:
```json
{
  "userName": "184885",
  "password": "79BB4FCD-9884-4652-B77F-6077F363193D"
}
```

---

### 4. 生成报表 (核心 API) ⭐

**端点**: `POST /HHAReportsML/Reports/PatientGeneralNotesRpt.aspx/BindData`

**请求头**:
```
Content-Type: application/json; charset=UTF-8
X-Requested-With: XMLHttpRequest
```

**请求体**:
```json
{
  "UserDataXML": "<Params><Param OfficeIDs=\"469,5137,5139,6475,14849\"/><Param FromDate=\"12/31/2024\"/><Param ToDate=\"12/31/2025\"/><Param StatusID=\"-1\"/><Param ReasonID=\"2289535\"/><Param ChhaID=\"-1\"/><Param PatientID=\"-1\"/><Param CoordinatorID=\"75207\"/><Param Priority=\"-1\"/><Param IsCallFromPatientProfile=\"0\"/><Param CallerInfo=\"SSRS\"/><Param AppVersion=\"ENT\"/><Param Version=\"25.07\"/><Param MinorVersion=\"1.00\"/></Params>"
}
```

**XML 参数说明**:
| 参数 | 说明 | 示例值 |
|------|------|--------|
| OfficeIDs | Office ID 列表，逗号分隔 | `469,5137,5139,6475,14849` |
| FromDate | 开始日期 (MM/DD/YYYY) | `12/31/2024` |
| ToDate | 结束日期 (MM/DD/YYYY) | `12/31/2025` |
| StatusID | 状态 ID，-1 表示全部 | `-1` |
| ReasonID | Note Reason ID | `2289535` (Quality Assurance) |
| ChhaID | CHHA ID，-1 表示全部 | `-1` |
| PatientID | 患者 ID，-1 表示全部 | `-1` |
| CoordinatorID | Coordinator ID | `75207` (Tao Yang) |
| Priority | 优先级，-1 表示全部 | `-1` |
| IsCallFromPatientProfile | 是否从患者资料调用 | `0` |
| CallerInfo | 调用者信息 | `SSRS` |
| AppVersion | 应用版本 | `ENT` |
| Version | 主版本 | `25.07` |
| MinorVersion | 次版本 | `1.00` |

**响应**:
```json
{
  "d": "500C039D-7CEA-4C7D-8E00-37254311BCEF"  // UserDataXML GUID
}
```

---

### 5. 打开报表查看器

**URL**: 
```
https://reports.hhaexchange.com/HHAReportsML/Reports/Reports.aspx
  ?UserDataXML=500C039D-7CEA-4C7D-8E00-37254311BCEF
  &ReportName=Patient%20General%20Notes
  &ReportTitle=Patient%20General%20Notes
  &s=F9CACD0B-058F-4E3E-B2D4-FFFA26704099
  &Version=25.07
  &MinorVersion=1.00
  &AppVersion=ENT
```

---

## 关键 ID 映射表

### Coordinators (部分)
| ID | Name |
|----|------|
| 75207 | Tao Yang ext.503 |
| 8058 | Anna O. Russian Sup ext.141 |
| 79747 | Aziza Yunuosova ext. 212 |
| 80700 | Barno Ext 109 |
| 22851 | Daisy Wang ext.108 |
| 25794 | Grace (Chunyu) Shi ext.602 |

### Note Reasons (已知)
| ID | Name |
|----|------|
| 2289535 | Quality Assurance |

---

## 前端实现参考

### openReport() 函数分析

```javascript
function openReport() {
    // 1. 收集所有筛选参数
    var Office = hha_multiselect.getMultiSelectValue("cblOffice");
    var CoordinatorID = hha_multiselect.getMultiSelectValue("cblCoordinator");
    var ReasonID = hha_multiselect.getMultiSelectValue("cblReason");
    var FromDate = document.getElementById("txtFromDate").value;
    var ToDate = document.getElementById("txtToDate").value;
    
    // 2. 构建 XML 参数
    var xmlParams = '<Params>' +
        '<Param OfficeIDs="' + Office + '"/>' +
        '<Param FromDate="' + FromDate + '"/>' +
        '<Param ToDate="' + ToDate + '"/>' +
        '<Param StatusID="' + StatusID + '"/>' +
        '<Param ReasonID="' + ReasonID + '"/>' +
        '<Param ChhaID="' + ChhaID + '"/>' +
        '<Param PatientID="' + PatientID + '"/>' +
        '<Param CoordinatorID="' + CoordinatorID + '"/>' +
        '<Param Priority="' + Priority + '"/>' +
        '<Param IsCallFromPatientProfile="0"/>' +
        '<Param CallerInfo="SSRS"/>' +
        '<Param AppVersion="ENT"/>' +
        '<Param Version="25.07"/>' +
        '<Param MinorVersion="1.00"/>' +
        '</Params>';
    
    // 3. 调用 PageMethods.BindData
    PageMethods.BindData(xmlParams, function(result) {
        // result = UserDataXML GUID
        var url = 'Reports.aspx?UserDataXML=' + result + 
                  '&ReportName=Patient General Notes' +
                  '&ReportTitle=Patient General Notes';
        window.open(url);
    });
}
```

### jQuery MultiSelect API

```javascript
// 设置选中值
$('#cblCoordinator').multipleSelect('setSelects', ['75207']);
$('#cblReason').multipleSelect('setSelects', ['2289535']);

// 获取选中值
var selected = $('#cblCoordinator').multipleSelect('getSelects');

// 全选
$('#cblOffice').multipleSelect('checkAll');

// 刷新显示
$('#cblCoordinator').multipleSelect('refresh');
```

---

## 自动化实现示例

### 方式一：通过 UI 操作 (推荐用于 Tampermonkey)

```javascript
// 快速生成 Tao Yang 的 Quality Assurance 报表
function generateTaoYangQAReport() {
    // 设置日期
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    document.getElementById('txtFromDate').value = formatDate(oneYearAgo);
    document.getElementById('txtToDate').value = formatDate(today);
    
    // 设置 Coordinator
    $('#cblCoordinator').multipleSelect('setSelects', ['75207']);
    
    // 设置 Note Reason
    $('#cblReason').multipleSelect('setSelects', ['2289535']);
    
    // 触发报表生成
    openReport();
}

function formatDate(date) {
    return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
}
```

### 方式二：直接 API 调用 (后端/独立脚本)

```javascript
async function generatePatientGeneralNotesReport(options) {
    const {
        sessionId,
        accessToken,
        officeIds = '469,5137,5139,6475,14849',
        fromDate,
        toDate,
        coordinatorId = '-1',
        reasonId = '-1',
        statusId = '-1'
    } = options;

    const xmlParams = `<Params>
        <Param OfficeIDs="${officeIds}"/>
        <Param FromDate="${fromDate}"/>
        <Param ToDate="${toDate}"/>
        <Param StatusID="${statusId}"/>
        <Param ReasonID="${reasonId}"/>
        <Param ChhaID="-1"/>
        <Param PatientID="-1"/>
        <Param CoordinatorID="${coordinatorId}"/>
        <Param Priority="-1"/>
        <Param IsCallFromPatientProfile="0"/>
        <Param CallerInfo="SSRS"/>
        <Param AppVersion="ENT"/>
        <Param Version="25.07"/>
        <Param MinorVersion="1.00"/>
    </Params>`;

    const response = await fetch(
        'https://reports.hhaexchange.com/HHAReportsML/Reports/PatientGeneralNotesRpt.aspx/BindData',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': `HHAX_Session=${sessionId}; HHAX_ENT_AccessToken=${accessToken}`
            },
            body: JSON.stringify({ UserDataXML: xmlParams })
        }
    );

    const result = await response.json();
    const reportGuid = result.d;

    // 返回报表 URL
    return `https://reports.hhaexchange.com/HHAReportsML/Reports/Reports.aspx?UserDataXML=${reportGuid}&ReportName=Patient%20General%20Notes&ReportTitle=Patient%20General%20Notes&s=${sessionId}&Version=25.07&MinorVersion=1.00&AppVersion=ENT`;
}
```

---

## 注意事项

1. **Session 过期**: Session 会定期过期，需要重新登录获取新的 Session ID 和 Access Token
2. **CORS 限制**: 直接从浏览器外部调用这些 API 会遇到 CORS 限制，需要：
   - 使用 Tampermonkey 脚本在页面内执行
   - 或使用后端代理服务器
3. **Cookie 传递**: 所有请求都需要携带正确的认证 Cookie
4. **Office ID**: 不同用户可能有不同的 Office ID 权限

---

## 更新日志

- **2025-12-31**: 初始文档创建，记录 Patient General Notes Report API
