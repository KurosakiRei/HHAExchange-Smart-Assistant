# Census by Coordinator Report API 文档

## 概述

本文档记录了 HHAexchange Census by Coordinator 报表的 API 接口，用于快速生成指定 Coordinator 的患者统计报表。

## 基础信息

- **报表页面**: `https://reports.hhaexchange.com/HHAReportsML/Reports/CensusbyCoordinator.aspx`
- **认证方式**: Cookie 认证 (HHAX_Session + HHAX_ENT_AccessToken)
- **API 技术**: AjaxPro (不同于 Patient General Notes 使用的 ASP.NET AJAX PageMethods)

## API 端点

### 1. 生成报表 (BindData)

**端点**: `POST /HHAReportsML/ajaxpro/Reports_CensusbyCoordinator,HHAExchangeUI.ashx`

**请求头**:
```http
Content-Type: text/plain; charset=UTF-8
X-AjaxPro-Method: BindData
```

**请求体**:
```json
{
    "UserDataXML": " <Params> <Param StatusIDs=\"-1\"/><Param OfficeIDs=\"469,5137,5139,6475,14849\"/><Param CoordinatorIDs=\"75207\"/><Param PatientLocationIDs=\"-1\"/><Param PatientBranchIDs=\"-1\"/><Param PatientTeamIDs=\"-1\"/><Param ContractIDs=\"-1\"/><Param IsDefaultPatient=\"0\"/><Param Version=\"25.07\"/><Param MinorVersion=\"1.00\"/><Param AppVersion=\"ENT\"/> </Params>"
}
```

**XML 参数说明**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| StatusIDs | string | -1=所有, -2=全选, 1=Waiting, 3=Active, 4=Hospitalized, 5=Discharged, 8=Hold |
| OfficeIDs | string | 逗号分隔的 Office ID 列表 |
| CoordinatorIDs | string | -1=所有, -2=全选, -3=No Coordinator, 或具体 ID |
| PatientLocationIDs | string | -1=所有, -2=全选, 0=No Location |
| PatientBranchIDs | string | -1=所有, -2=全选, 0=No Branch |
| PatientTeamIDs | string | -1=所有, -2=全选, 0=No Team |
| ContractIDs | string | -1=所有, -2=全选, 或具体 Contract ID |
| IsDefaultPatient | string | 0=否, 1=是 (只显示 Default Patient) |
| Version | string | 当前版本号 (如 "25.07") |
| MinorVersion | string | 次版本号 (如 "1.00") |
| AppVersion | string | 应用版本 (通常是 "ENT") |

**响应**:
```
"68D8566A-E961-46E4-BE55-2266022F1893";/*
```
返回 UserDataXML GUID，用于构造报表 URL。

---

### 2. 获取 Coordinators 列表

**端点**: `GET /HHAReportsML/Handler/Contracts.ashx/BindContract`

**参数**:
| 参数名 | 说明 |
|--------|------|
| MethodName | `GetCoordinatorforOffice_WithNoCoordinator` |
| UserID | 用户 ID |
| OfficeIDs | 逗号分隔的 Office ID |
| Version | 版本号 |
| MinorVersion | 次版本号 |
| AppVersion | 应用版本 |

**响应示例**:
```json
[
    {"ID": "-3", "Text": "No Coordinator"},
    {"ID": "75207", "Text": "Tao Yang ext.503 TYang@alwaysNY.net"},
    // ...
]
```

---

### 3. 获取 Patient Status 列表

**端点**: `GET /HHAReportsML/Handler/Contracts.ashx/BindContract`

**参数**:
| 参数名 | 说明 |
|--------|------|
| MethodName | `GetPatientStatus` |
| UserID | 用户 ID |

**响应示例**:
```json
[
    {"ID": "1", "Text": "Waiting"},
    {"ID": "3", "Text": "Active"},
    {"ID": "4", "Text": "Hospitalized"},
    {"ID": "5", "Text": "Discharged"},
    {"ID": "8", "Text": "Hold"}
]
```

---

### 4. 获取 Contracts 列表

**端点**: `GET /HHAReportsML/Handler/Contracts.ashx/BindContract`

**参数**:
| 参数名 | 说明 |
|--------|------|
| MethodName | `GetContractsByOffice` |
| UserID | 用户 ID |
| OfficeIDs | 逗号分隔的 Office ID |
| Version | 版本号 |
| MinorVersion | 次版本号 |
| AppVersion | 应用版本 |

---

### 5. 获取 Patient Locations 列表

**端点**: `GET /HHAReportsML/Handler/Contracts.ashx/BindContract`

**参数**:
| 参数名 | 说明 |
|--------|------|
| MethodName | `GetLocationByOffice_WithNoLocation` |
| UserID | 用户 ID |
| OfficeIDs | 逗号分隔的 Office ID |
| Version | 版本号 |
| MinorVersion | 次版本号 |
| AppVersion | 应用版本 |

---

### 6. 获取 Patient Branches 列表

**端点**: `GET /HHAReportsML/Handler/Contracts.ashx/BindContract`

**参数**:
| 参数名 | 说明 |
|--------|------|
| MethodName | `GetBranchDetailsByofficexML_WithNoBranch` |
| UserID | 用户 ID |
| OfficeIDs | 逗号分隔的 Office ID |
| Version | 版本号 |
| MinorVersion | 次版本号 |
| AppVersion | 应用版本 |

---

### 7. 获取 Patient Teams 列表

**端点**: `GET /HHAReportsML/Handler/Contracts.ashx/BindContract`

**参数**:
| 参数名 | 说明 |
|--------|------|
| MethodName | `GetTeamByOffice_WithNoTeam` |
| UserID | 用户 ID |
| OfficeIDs | 逗号分隔的 Office ID |
| Version | 版本号 |
| MinorVersion | 次版本号 |
| AppVersion | 应用版本 |

---

## 报表 URL 格式

```
https://reports.hhaexchange.com/HHAReportsML/Reports/Reports.aspx
  ?UserDataXML={GUID}
  &ReportName=Census%20by%20Coordinator
  &ReportTitle=Census%20by%20Coordinator
```

## 已知 Coordinator ID 映射

| Name | ID |
|------|-----|
| No Coordinator | -3 |
| Anna O. Russian Sup | 8058 |
| Aziza Yunuosova | 79747 |
| Barno | 80700 |
| Daisy Wang | 22851 |
| Default | 2778 |
| Eslana O. Sup. | 23279 |
| Grace (Chunyu) Shi | 25794 |
| GulchekhraKhakimova | 80227 |
| Gulnaz K. | 75765 |
| Hanin Aldaeif | 44912 |
| Irina G. | 79400 |
| Ivy Ko | 81264 |
| Jay He | 80123 |
| Jennifer Rivera | 81314 |
| Lolita K. | 69419 |
| Lucia (LuMing) Yu | 10492 |
| Lutfiya Mamadova | 80216 |
| Madina R. | 78899 |
| Mahira Rahman | 66394 |
| Mona He | 81406 |
| Nodira A. Sup. | 7530 |
| Ruth Queriga Sup. | 71296 |
| **Tao Yang** | **75207** |
| Tracy V. | 23466 |
| Vicky Zhao | 78357 |
| Winnie Y. | 80380 |
| Yahaira Perez | 80978 |

## 与 Patient General Notes Report 的区别

| 特性 | Census by Coordinator | Patient General Notes |
|------|----------------------|----------------------|
| API 技术 | AjaxPro | ASP.NET AJAX PageMethods |
| 请求头 | X-AjaxPro-Method | Content-Type: application/json |
| 响应格式 | `"value";/*` | `{"d": "value"}` |
| 日期筛选 | 无 | 有 (FromDate, ToDate) |
| Coordinator ID 来源 | GetCoordinatorforOffice_WithNoCoordinator | GetCoordinatorByOffice |
| 额外筛选 | Status, Location, Branch, Team, Contract, IsDefaultPatient | Status, Reason, Chha, Priority |

## 使用示例

```typescript
import CensusReport from './CensusbyCoordinator';

// 生成 Tao Yang 的 Census 报表 (非 Default Patient)
const params = {
    coordinatorIds: CensusReport.KNOWN_COORDINATORS['Tao Yang'], // '75207'
    isDefaultPatient: '0',
};

// 获取报表 URL
const url = await CensusReport.generateReportURL(params);
console.log('Report URL:', url);

// 或直接在新窗口打开
await CensusReport.generateAndOpenReport(params);

// 获取 Coordinator 列表
const coordinators = await CensusReport.fetchCoordinators();
console.log('Coordinators:', coordinators);
```

## 认证信息

需要以下 Cookies:
- `HHAX_Session`: Session ID (GUID 格式)
- `HHAX_ENT_AccessToken`: JWT Token (PS256 算法签名)

JWT Payload 示例:
```json
{
    "iss": "hhaexchange.com",
    "sid": "F9CACD0B-058F-4E3E-B2D4-FFFA26704099",
    "pid": "469",
    "uid": "184885",
    "ctype": "VENDOR",
    "app": "ENT"
}
```
