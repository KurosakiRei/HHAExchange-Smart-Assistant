# Epic 11: Cleaner Tab - 智能清理器

## Epic 概述

| 属性           | 值                                             |
| -------------- | ---------------------------------------------- |
| **Epic ID**    | EPIC-011                                       |
| **标题**       | Cleaner Tab - POC 和 Duplicate Call 智能清理器 |
| **优先级**     | P1 - 高优先级功能                              |
| **状态**       | 📋 Planning                                     |
| **预估工作量** | 5-7 个 Story                                   |
| **关联系统**   | HHAExchange Prebilling, Call Maintenance       |

## 背景与目标

### 当前问题

1. **POC Compliance 清理繁琐**：
   - 需要手动逐个点击访问详情页
   - 重复操作：选择 duties → 选择 reason/action → 填写备注 → 保存
   - 效率低下，容易出错

2. **Duplicate Call 处理困难**：
   - 需要在长列表中手动查找重复呼叫
   - 逐个点击 Reject 按钮
   - 无批量操作能力

### 目标

创建第三个 Tab "清理器"（Cleaner Tab），实现：

1. **智能页面检测**：
   - 自动识别当前是否在 PrebillingReportInternal 或 CallMaintenance 页面
   - 显示对应的清理界面
   - 非目标页面时显示提示信息

2. **POC Compliance 自动清理**：
   - 异步分析 Prebilling Review 表格
   - 筛选出符合条件的 visit：
     - 仅包含 "POC Compliance"
     - 仅包含 "POC Compliance" + "Caregiver Compliance"（顺序无关）
   - **详细列出每个可清理的 visit 供用户选择**
   - 批量清理选中的 visits

3. **Duplicate Call 自动清理**：
   - 异步分析 Call Maintenance 表格
   - 筛选出状态为 "Duplicate Call" 的记录
   - **仅显示检测到的数量**，可切换显示详情
   - 一键批量拒绝

### ⚠️ 关键技术挑战：页面刷新问题

> [!CAUTION]
> **每次清理操作后页面会自动刷新**（约 0.5-1 秒后）  
> 这会导致选中的任务列表丢失！

**解决方案**：使用 `GM_setValue` / `GM_getValue` 暂存清理任务队列

```typescript
// 任务持久化存储
interface CleaningTaskQueue {
  pageType: 'PREBILLING' | 'CALL_MAINTENANCE';
  tasks: VisitTask[] | CallTask[];
  currentIndex: number;
  startTime: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

// 页面加载时检查是否有未完成的任务
function checkPendingTasks(): void {
  const queue = GM_getValue('cleaningTaskQueue', null);
  if (queue && queue.status === 'IN_PROGRESS') {
    // 恢复清理进度
    resumeCleaning(queue);
  }
}
```

## 技术分析结果

### Prebilling Report 页面分析

#### 页面结构
- **URL 模式**: `https://app.hhaexchange.com/*/Billing/PrebillingReportInternal_ns.aspx*`
- **表格容器**: `#ctl00_ContentPlaceHolder1_divPrebillingReportInternalScroll`
- **Problems 列**: Column Index 12 (第 13 列)
- **Action 列**: Column Index 13 (最后一列)

#### 需要显示的列（省略无用信息）
| 列名           | 显示 | 原因               |
| -------------- | ---- | ------------------ |
| Visit Date     | ✅    | 关键信息           |
| Admission ID   | ✅    | 识别患者           |
| Patient        | ✅    | 关键信息           |
| Office         | ❌    | 可省略             |
| Contract       | ✅    | 可选显示           |
| Caregiver      | ✅    | 可选显示           |
| Service Code   | ❌    | 可省略             |
| Coordinator    | ❌    | 可省略             |
| Scheduled Time | ✅    | 区分同患者多次访问 |
| Visit Time     | ✅    | 关键信息           |
| Disciplines    | ❌    | 可省略             |
| TF             | ❌    | 可省略             |
| Problems       | ✅    | 显示问题类型       |
| Actions        | ❌    | 不需要             |

#### 清理 UI 设计

```
┌────────────────────────────────────────────────────────────┐
│ 🧹 POC Compliance 清理器                                    │
│ ───────────────────────────────────────────────────────────│
│ 📍 当前页面: Prebilling Report Internal                     │
│ 📊 检测到 5 个可清理的 POC 问题                              │
├────────────────────────────────────────────────────────────┤
│ ☑ 全选                    [清理选中项 (3)]                  │
├────────────────────────────────────────────────────────────┤
│ ☑ Wang Zihua | AHC-902986 | 01/10/2026 | 12:00-16:00      │
│   └ POC + Caregiver Compliance                             │
├────────────────────────────────────────────────────────────┤
│ ☑ Wang Zihua | AHC-902986 | 01/10/2026 | 17:00-18:00      │
│   └ POC + Caregiver Compliance                             │
├────────────────────────────────────────────────────────────┤
│ ☐ LIN ZHI HUI | AHC-904989 | 01/10/2026 | 11:00-17:00     │
│   └ POC Only                                                │
├────────────────────────────────────────────────────────────┤
│ ☑ CHEN FENG | AHC-908699 | 01/10/2026 | 19:00-22:00       │
│   └ POC Only                                                │
├────────────────────────────────────────────────────────────┤
│ ☐ CHEN ZUANHE | AHC-909658 | 01/12/2026 | 08:30-15:30     │
│   └ POC Only                                                │
└────────────────────────────────────────────────────────────┘
```

### Call Maintenance 页面分析

#### 页面结构
- **URL 模式**: `https://app.hhaexchange.com/*/Call/CallMaintenance_ns.aspx*`
- **表格**: `#ctl00_ContentPlaceHolder1_uxGvSearch`
- **Status 列**: Column Index 9 (第 10 列)

#### 需要显示的列（切换详情时）
| 列名            | 显示 | 原因                |
| --------------- | ---- | ------------------- |
| Assign Code     | ✅    | 关键标识            |
| Caregiver Code  | ✅    | 关键信息            |
| Caregiver Name  | ✅    | 关键信息            |
| Office Name     | ❌    | 可省略              |
| Caregiver Phone | ❌    | 可省略              |
| Caregiver Team  | ❌    | 可省略              |
| Patient Name    | ✅    | 关键信息            |
| Call Date       | ✅    | 关键信息            |
| Call Time       | ✅    | 关键信息            |
| Call Type       | ✅    | 可选显示            |
| Caller ID       | ✅    | 可选显示            |
| Status          | ❌    | 都是 Duplicate Call |
| TF              | ❌    | 可省略              |
| Action          | ❌    | 不需要              |

#### 清理 UI 设计（简洁模式）

```
┌────────────────────────────────────────────────────────────┐
│ 🧹 Duplicate Call 清理器                                    │
│ ───────────────────────────────────────────────────────────│
│ 📍 当前页面: Call Maintenance                               │
│ 📊 检测到 3 个 Duplicate Call                               │
├────────────────────────────────────────────────────────────┤
│ [▼ 显示详情]              [一键清理全部]                     │
└────────────────────────────────────────────────────────────┘
```

#### 清理 UI 设计（展开详情模式）

```
┌────────────────────────────────────────────────────────────┐
│ 🧹 Duplicate Call 清理器                                    │
│ ───────────────────────────────────────────────────────────│
│ 📍 当前页面: Call Maintenance                               │
│ 📊 检测到 3 个 Duplicate Call                               │
├────────────────────────────────────────────────────────────┤
│ [▲ 隐藏详情]              [一键清理全部]                     │
├────────────────────────────────────────────────────────────┤
│ • 055169 | Awais Sumaira | Butt Aasha | 01/13/2026 23:02   │
│ • 905904 | FU MAN HO | TAN W XIUPING | 01/13/2026 22:34    │
│ • 775517 | ABDURAHMANOV M. | - | 01/13/2026 22:03          │
└────────────────────────────────────────────────────────────┘
```

## 清理操作差异

### POC Compliance 清理（参考 POC.ts）

基于现有 `POC.ts` 实现：

```typescript
// 复用现有逻辑
export const POCResolver = () => {
  // 1. 选择特定的 POC Duties
  POCTick();  // 选择 101, 107, 111, 112, 411, 502, 511 等
  
  // 2. 选择 Reason 和 Action
  POCReasonChooser();  // 自动匹配合适的 reason/action
  
  // 3. 填写 Notes
  $(visitNotesSelector).val("task does not match plan of care");
  $(visitNotesSelector)[0].dispatchEvent(new Event("change"));
  
  // 4. 处理 Caregiver Audit（如果有）
  if ($(visitVerifyStarSelector).length > 0) {
    $(visitAuditCaregiverSelector).click();
  }
};
```

**清理器流程**：
1. 导航到 visit 详情页
2. 调用 `POCResolver()` 自动填充
3. 点击保存按钮
4. 等待页面刷新
5. 从 `GM_getValue` 读取下一个任务
6. 重复直到所有任务完成

### Duplicate Call 清理

**更简单**：只需点击 Action 列的 "Reject" 按钮

```typescript
// 找到 Duplicate Call 行的 Reject 按钮
const rejectButton = row.querySelector('a[id*="uxbtnRejectCall"]');
rejectButton.click();

// 页面会自动刷新，从 GM_getValue 获取下一个任务
```

## 清理中 UX 设计

### 设计理念

> [!IMPORTANT]
> **蒙版设计目标**：
> 1. 让用户**看到自动化操作过程**（给用户信心）
> 2. **提醒用户不要操作**（避免中断脚本）
> 3. 显示清理进度（让用户了解进度）

**关键 UX 决策**：
- 使用**浅色半透明蒙版**（让背景页面可见）
- 中心模态框显示详细进度
- **无任务时也显示成功**：分析后未检测到任务时，直接显示"恭喜，当前页面已清空问题！"

### 蒙版和进度显示

```typescript
// 清理开始时显示蒙版
function showCleaningOverlay(): void {
  const overlay = document.createElement('div');
  overlay.id = 'hha-cleaning-overlay';
  overlay.innerHTML = `
    <div class="cleaning-modal">
      <div class="cleaning-icon">⏳</div>
      <h3 id="cleaning-status">正在执行清理中 (1/7)</h3>
      <p id="cleaning-current-task">正在处理: Wang Zihua - AHC-902986</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 14.28%"></div>
      </div>
      <p class="cleaning-warning">⚠️ 请勿操作页面，清理完成后将自动关闭</p>
    </div>
  `;
  document.body.appendChild(overlay);
}

// 更新进度
function updateCleaningProgress(current: number, total: number, taskInfo: string): void {
  const statusEl = document.getElementById('cleaning-status');
  const taskEl = document.getElementById('cleaning-current-task');
  const progressEl = document.querySelector('.progress-fill') as HTMLElement;
  
  if (statusEl) statusEl.textContent = `正在执行清理中 (${current}/${total})`;
  if (taskEl) taskEl.textContent = `正在处理: ${taskInfo}`;
  if (progressEl) progressEl.style.width = `${(current / total) * 100}%`;
}

// 清理完成时显示成功消息
// 注意：此函数在两种情况下调用：
// 1. 完成所有清理任务后
// 2. 分析表格后发现没有需要清理的任务（空列表）
function showCleaningComplete(pageType: 'PREBILLING' | 'CALL_MAINTENANCE'): void {
  const modal = document.querySelector('.cleaning-modal');
  if (!modal) return;
  
  const message = pageType === 'PREBILLING'
    ? '🎉 恭喜，当前页面已清空 POC 问题！'
    : '🎉 恭喜，当前页面已清空 Duplicate Call 问题！';
  
  modal.innerHTML = `
    <div class="cleaning-icon success">✅</div>
    <h3>${message}</h3>
    <p class="success-note">所有符合条件的问题已处理完成</p>
    <button id="btn-close-overlay" class="primary-btn">关闭</button>
  `;
  
  document.getElementById('btn-close-overlay')?.addEventListener('click', () => {
    document.getElementById('hha-cleaning-overlay')?.remove();
  });
}

// 空列表时也显示成功消息
function showNoTasksFound(pageType: 'PREBILLING' | 'CALL_MAINTENANCE'): void {
  // 无需清理任务时，直接显示成功消息
  showCleaningComplete(pageType);
}

```

### 蒙版样式

```less
#hha-cleaning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  // 浅色半透明蒙版 - 让用户能看到背后的自动化操作
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(2px);  // 轻微模糊背景
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;  // 阻止点击穿透
  
  .cleaning-modal {
    background: white;
    padding: 30px 40px;
    border-radius: 12px;
    text-align: center;
    min-width: 400px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    
    .cleaning-icon {
      font-size: 48px;
      margin-bottom: 15px;
      
      &.success {
        color: #4CAF50;
      }
    }
    
    h3 {
      margin: 0 0 10px;
      font-size: 20px;
      color: #333;
    }
    
    .progress-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin: 20px 0;
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #8BC34A);
        transition: width 0.3s ease;
      }
    }
    
    .cleaning-warning {
      color: #ff9800;
      font-size: 14px;
      margin-top: 15px;
    }
    
    .primary-btn {
      margin-top: 20px;
      padding: 10px 30px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      
      &:hover {
        background: #1565c0;
      }
    }
  }
}
```

## 任务持久化机制

### GM_setValue 存储结构

```typescript
// 清理任务队列
interface CleaningTaskQueue {
  pageType: 'PREBILLING' | 'CALL_MAINTENANCE';
  tasks: CleaningTask[];
  currentIndex: number;
  startTime: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

interface CleaningTask {
  // POC 任务
  visitId?: string;
  visitDate?: string;
  patientName?: string;
  admissionId?: string;
  scheduledTime?: string;
  matchType?: 'POC_ONLY' | 'POC_AND_CAREGIVER';
  
  // Call 任务
  assignCode?: string;
  caregiverName?: string;
  callDate?: string;
  callTime?: string;
  
  // 通用
  completed: boolean;
  error?: string;
}

// 存储 Key
const CLEANING_QUEUE_KEY = 'hha_cleaner_task_queue';
```

### 清理流程控制

```typescript
class CleaningController {
  
  /**
   * 启动清理流程
   */
  async startCleaning(tasks: CleaningTask[], pageType: 'PREBILLING' | 'CALL_MAINTENANCE'): Promise<void> {
    // 1. 保存任务队列到 GM_setValue
    const queue: CleaningTaskQueue = {
      pageType,
      tasks,
      currentIndex: 0,
      startTime: Date.now(),
      status: 'IN_PROGRESS'
    };
    GM_setValue(CLEANING_QUEUE_KEY, queue);
    
    // 2. 显示蒙版
    showCleaningOverlay();
    updateCleaningProgress(1, tasks.length, this.getTaskInfo(tasks[0]));
    
    // 3. 执行第一个任务
    await this.executeCurrentTask(queue);
  }
  
  /**
   * 页面加载时检查并恢复清理进度
   */
  async checkAndResume(): Promise<void> {
    const queue = GM_getValue(CLEANING_QUEUE_KEY, null) as CleaningTaskQueue | null;
    
    if (!queue || queue.status !== 'IN_PROGRESS') {
      return;
    }
    
    // 标记上一个任务完成
    if (queue.currentIndex > 0) {
      queue.tasks[queue.currentIndex - 1].completed = true;
    }
    
    // 检查是否全部完成
    if (queue.currentIndex >= queue.tasks.length) {
      queue.status = 'COMPLETED';
      GM_setValue(CLEANING_QUEUE_KEY, queue);
      showCleaningComplete(queue.pageType);
      return;
    }
    
    // 显示蒙版并继续
    showCleaningOverlay();
    updateCleaningProgress(
      queue.currentIndex + 1,
      queue.tasks.length,
      this.getTaskInfo(queue.tasks[queue.currentIndex])
    );
    
    // 执行当前任务
    await this.executeCurrentTask(queue);
  }
  
  /**
   * 执行当前任务
   */
  private async executeCurrentTask(queue: CleaningTaskQueue): Promise<void> {
    const task = queue.tasks[queue.currentIndex];
    
    try {
      if (queue.pageType === 'PREBILLING') {
        await this.executePOCClean(task);
      } else {
        await this.executeCallReject(task);
      }
      
      // 更新索引（页面刷新后会从 checkAndResume 继续）
      queue.currentIndex++;
      GM_setValue(CLEANING_QUEUE_KEY, queue);
      
      // 页面会自动刷新，不需要手动触发下一个任务
      
    } catch (error) {
      task.error = error.message;
      queue.status = 'FAILED';
      GM_setValue(CLEANING_QUEUE_KEY, queue);
      showCleaningError(error.message);
    }
  }
  
  /**
   * 执行 POC 清理
   */
  private async executePOCClean(task: CleaningTask): Promise<void> {
    // 1. 点击 Edit 按钮进入详情页
    const row = this.findVisitRow(task);
    const editButton = row.querySelector('a[name="imgEditInternal"]');
    editButton?.click();
    
    // 页面会导航到详情页，然后在详情页触发 POCResolver
    // 详情页需要检测 URL 并自动执行
  }
  
  /**
   * 执行 Call Reject
   */
  private async executeCallReject(task: CleaningTask): Promise<void> {
    const row = this.findCallRow(task);
    const rejectButton = row.querySelector('a[id*="uxbtnRejectCall"]');
    rejectButton?.click();
    
    // 页面会自动刷新
  }
}
```

### 详情页自动执行

```typescript
// 在详情页 (NonSkilledVisitInfo_ns.aspx) 检测并自动执行
function initVisitPage(): void {
  const queue = GM_getValue(CLEANING_QUEUE_KEY, null) as CleaningTaskQueue | null;
  
  if (!queue || queue.status !== 'IN_PROGRESS' || queue.pageType !== 'PREBILLING') {
    return;
  }
  
  // 显示蒙版
  showCleaningOverlay();
  updateCleaningProgress(
    queue.currentIndex + 1,
    queue.tasks.length,
    '正在处理 POC...'
  );
  
  // 执行 POC 解决
  setTimeout(() => {
    POCResolver();
    
    // 点击保存按钮
    setTimeout(() => {
      const saveButton = document.getElementById('uxBtnSaveVisit');
      saveButton?.click();
      
      // 页面会刷新回 Prebilling Report
    }, 500);
  }, 500);
}
```

## 验收标准 (Epic 级别)

### 功能性

- [ ] 第三个 Tab "清理器" 成功添加到面板
- [ ] 自动检测当前页面类型（Prebilling / Call Maintenance / 其他）
- [ ] 在 Prebilling 页面显示 POC 清理界面
- [ ] 在 Call Maintenance 页面显示 Duplicate Call 清理界面
- [ ] 非目标页面显示"未检测到有效页面"提示
- [ ] 异步分析不阻塞 UI

### POC 清理功能

- [ ] 正确识别"仅 POC Compliance"的 visits
- [ ] 正确识别"POC + Caregiver Compliance"的 visits
- [ ] **详细列出每个 visit**，显示：患者名、Admission ID、Visit Date、Scheduled Time
- [ ] 省略无用列：Office、Coordinator、Service Code、Disciplines、TF、Actions
- [ ] 每个 visit 可勾选
- [ ] 提供"全选"/"取消全选"功能
- [ ] 点击"清理选中项"显示确认对话框
- [ ] **使用 `GM_setValue` 存储任务队列**
- [ ] **页面刷新后自动恢复清理进度**
- [ ] **清理过程显示蒙版和进度**
- [ ] **蒙版使用浅色半透明背景**（让用户看到自动化过程）
- [ ] **蒙版中心显示模态框**，提醒用户不要操作
- [ ] **清理完成后显示**"恭喜，当前页面已清空 POC 问题！"
- [ ] **无任务时也显示**"恭喜，当前页面已清空 POC 问题！"（表格为空）

### Duplicate Call 清理功能

- [ ] 正确识别 "Duplicate Call" 状态的记录
- [ ] **默认仅显示检测到的数量**
- [ ] **可切换显示/隐藏详情**
- [ ] 详情显示时省略无用列：Office Name、Caregiver Phone、Caregiver Team、Status、TF、Actions
- [ ] 提供"一键清理全部"按钮
- [ ] 点击清理后显示确认对话框
- [ ] **使用 `GM_setValue` 存储任务队列**
- [ ] **页面刷新后自动恢复清理进度**
- [ ] **清理过程显示蒙版和进度**
- [ ] **蒙版使用浅色半透明背景**（让用户看到自动化过程）
- [ ] **蒙版中心显示模态框**，提醒用户不要操作
- [ ] **清理完成后显示**"恭喜，当前页面已清空 Duplicate Call 问题！"
- [ ] **无任务时也显示**"恭喜，当前页面已清空 Duplicate Call 问题！"（表格为空）

### 非功能性

- [ ] 分析过程不超过 3 秒（对于 100 条记录）
- [ ] 清理过程提供详细日志
- [ ] 出错时有明确提示
- [ ] 清理后自动刷新列表

## 架构设计

### 目录结构

```
src/
├── js/
│   ├── tabs/
│   │   └── CleanerTab.ts                    # 🆕 Cleaner Tab 主类
│   │
│   ├── services/
│   │   ├── PageDetector.ts                  # 🆕 页面检测服务
│   │   ├── PrebillingTableParser.ts         # 🆕 Prebilling 表格解析器
│   │   ├── CallMaintenanceTableParser.ts    # 🆕 Call Maintenance 表格解析器
│   │   ├── CleaningController.ts            # 🆕 清理流程控制器
│   │   └── CleaningOverlay.ts               # 🆕 清理蒙版 UI
│   │
│   ├── POC.ts                               # 现有 POC 解决逻辑（复用）
│   │
│   └── utils/
│       ├── templates&const.ts               # 🔧 添加 Cleaner 相关选择器
│       └── gm-storage.ts                    # 🆕 GM_setValue/getValue 封装
│
└── style/
    └── cleaner-tab.less                     # 🆕 Cleaner Tab 和蒙版样式
```

### 核心类设计

#### 1. CleaningController（核心控制器）

```typescript
/**
 * 清理流程控制器
 * 管理任务队列、页面刷新恢复、进度追踪
 */
class CleaningController {
  private static readonly QUEUE_KEY = 'hha_cleaner_task_queue';
  
  /**
   * 页面加载时调用，检查是否有未完成的任务
   */
  static async checkPendingTasks(): Promise<void> {
    const queue = GM_getValue(this.QUEUE_KEY, null);
    if (queue?.status === 'IN_PROGRESS') {
      await this.resumeCleaning(queue);
    }
  }
  
  /**
   * 启动新的清理任务
   */
  static async startCleaning(
    tasks: CleaningTask[],
    pageType: PageType
  ): Promise<void> {
    const queue: CleaningTaskQueue = {
      pageType,
      tasks: tasks.map(t => ({ ...t, completed: false })),
      currentIndex: 0,
      startTime: Date.now(),
      status: 'IN_PROGRESS'
    };
    
    GM_setValue(this.QUEUE_KEY, queue);
    CleaningOverlay.show(1, tasks.length, this.getTaskInfo(tasks[0]));
    
    await this.executeTask(queue);
  }
  
  /**
   * 清理完成后清除队列
   */
  static clearQueue(): void {
    GM_setValue(this.QUEUE_KEY, null);
  }
}
```

#### 2. CleaningOverlay（蒙版 UI）

```typescript
/**
 * 清理蒙版 UI
 */
class CleaningOverlay {
  static show(current: number, total: number, taskInfo: string): void { /* ... */ }
  static update(current: number, total: number, taskInfo: string): void { /* ... */ }
  static showComplete(pageType: PageType): void { /* ... */ }
  static showError(message: string): void { /* ... */ }
  static hide(): void { /* ... */ }
}
```

#### 3. PrebillingTableParser

```typescript
interface VisitRecord {
  rowIndex: number;
  visitId: string;
  visitDate: string;
  patientName: string;
  admissionId: string;
  scheduledTime: string;  // 用于区分同患者多次访问
  visitTime: string;
  matchType: 'POC_ONLY' | 'POC_AND_CAREGIVER';
  // 省略: office, coordinator, serviceCode, disciplines, tf, actions
}

class PrebillingTableParser {
  static async parseTable(): Promise<VisitRecord[]> { /* ... */ }
}
```

#### 4. CallMaintenanceTableParser

```typescript
interface CallRecord {
  rowIndex: number;
  assignCode: string;
  caregiverCode: string;
  caregiverName: string;
  patientName: string;
  callDate: string;
  callTime: string;
  callType: string;
  callerId: string;
  // 省略: officeName, caregiverPhone, caregiverTeam, status, tf, action
}

class CallMaintenanceTableParser {
  static async parseTable(): Promise<CallRecord[]> { /* ... */ }
}
```

## Story 拆分

### Story 1: 页面检测和基础 UI 框架

**目标**: 创建 Cleaner Tab 并实现页面检测

**验收标准**:
- [ ] 新增第三个 Tab "清理器"
- [ ] 实现 `PageDetector` 服务
- [ ] URL 变化时自动重新检测
- [ ] 在未检测到有效页面时显示提示
- [ ] 在 Prebilling 页面显示 "POC 清理器" 标题
- [ ] 在 Call Maintenance 页面显示 "Call 清理器" 标题

**文件**:
- `src/js/tabs/CleanerTab.ts`
- `src/js/services/PageDetector.ts`
- `src/style/cleaner-tab.less`

---

### Story 2: Prebilling 表格解析器

**目标**: 实现 Prebilling Report 表格的异步解析

**验收标准**:
- [ ] 实现 `PrebillingTableParser` 类
- [ ] 正确提取所有 visit 记录
- [ ] 正确识别 "POC Only" visits
- [ ] 正确识别 "POC + Caregiver" visits
- [ ] 提取必要字段：Visit ID, Date, Patient, Admission ID, Scheduled Time, Visit Time
- [ ] **省略无用字段**：Office, Coordinator, Service Code, Disciplines, TF, Actions
- [ ] 异步解析不阻塞 UI

**文件**:
- `src/js/services/PrebillingTableParser.ts`

---

### Story 3: POC 清理器列表 UI

**目标**: 在 Cleaner Tab 中显示详细的可勾选 visit 列表

**验收标准**:
- [ ] 调用解析器获取数据
- [ ] **详细列出每个 visit**
- [ ] 显示关键信息：患者名、Admission ID、Visit Date、Scheduled Time、问题类型徽章
- [ ] 每个 visit 可勾选
- [ ] 提供"全选"和"取消全选"按钮
- [ ] "清理选中项"按钮显示已选数量
- [ ] 未选择时按钮禁用

**文件**:
- `src/js/tabs/CleanerTab.ts` (UI 部分)

---

### Story 4: 清理蒙版和进度显示

**目标**: 实现清理过程的蒙版遮罩和进度追踪

**验收标准**:
- [ ] 实现 `CleaningOverlay` 类
- [ ] 点击"清理"后显示确认对话框
- [ ] 确认后显示全屏蒙版
- [ ] **蒙版使用浅色半透明背景** `rgba(0, 0, 0, 0.15)` + `backdrop-filter: blur(2px)`
- [ ] **用户能看到背后页面的自动化操作**
- [ ] **中心模态框阻止点击穿透，并提醒用户不要操作**
- [ ] 显示进度条和当前任务信息："正在执行清理中 (1/7)"
- [ ] 显示当前处理的任务详情："正在处理: Wang Zihua - AHC-902986"
- [ ] **完成后显示成功消息**（包含两种场景）
- [ ] **无任务时直接显示成功消息**（无需清理）
- [ ] 提供关闭按钮

**文件**:
- `src/js/services/CleaningOverlay.ts`
- `src/style/cleaner-tab.less`

---

### Story 5: 清理控制器和任务持久化

**目标**: 使用 GM_setValue 实现任务队列持久化，支持页面刷新恢复

**验收标准**:
- [ ] 实现 `CleaningController` 类
- [ ] 使用 `GM_setValue` 存储任务队列
- [ ] 页面加载时调用 `checkPendingTasks()` 检查未完成任务
- [ ] **页面刷新后自动恢复清理进度**
- [ ] 正确追踪 currentIndex
- [ ] 任务完成后清除队列

**文件**:
- `src/js/services/CleaningController.ts`
- `src/utils/gm-storage.ts`

---

### Story 6: POC 批量清理执行

**目标**: 集成 POC.ts，实现批量 POC 清理

**验收标准**:
- [ ] 点击 Edit 按钮导航到 visit 详情页
- [ ] 在详情页检测到清理任务后自动执行 `POCResolver()`
- [ ] 自动点击保存按钮
- [ ] 页面刷新回 Prebilling Report 后继续下一个任务
- [ ] 所有任务完成后显示"恭喜，当前页面已清空 POC 问题！"
- [ ] 错误处理和日志记录

**文件**:
- `src/js/services/CleaningController.ts` (POC 执行部分)
- `src/index.ts` (详情页检测)

---

### Story 7: Call Maintenance 解析器和 UI

**目标**: 实现 Call Maintenance 表格解析和简洁 UI

**验收标准**:
- [ ] 实现 `CallMaintenanceTableParser` 类
- [ ] 筛选 status 为 "Duplicate Call" 的记录
- [ ] **默认仅显示数量**："检测到 X 个 Duplicate Call"
- [ ] **提供切换按钮**："显示详情" / "隐藏详情"
- [ ] 详情显示关键字段，省略无用字段
- [ ] 提供"一键清理全部"按钮

**文件**:
- `src/js/services/CallMaintenanceTableParser.ts`
- `src/js/tabs/CleanerTab.ts` (Call UI 部分)

---

### Story 8: Duplicate Call 批量清理执行

**目标**: 实现批量 Reject Duplicate Calls

**验收标准**:
- [ ] 找到并点击 Reject 按钮
- [ ] 使用 `GM_setValue` 持久化任务
- [ ] 页面刷新后继续下一个任务
- [ ] 所有任务完成后显示"当前页面已清空 Duplicate Call 问题！"
- [ ] 错误处理和日志记录

**文件**:
- `src/js/services/CleaningController.ts` (Call 执行部分)

---

## 技术约束

1. **环境限制**: Tampermonkey 环境
2. **存储**: 必须使用 `GM_setValue` / `GM_getValue`（不是 localStorage）
3. **目标系统**: ASP.NET WebForms（页面刷新不可避免）
4. **复用**: 必须复用现有 `POC.ts` 逻辑
5. **浏览器**: Chrome/Edge

## 风险与缓解

| 风险             | 概率 | 影响 | 缓解措施                |
| ---------------- | ---- | ---- | ----------------------- |
| 页面刷新丢失状态 | 高   | 高   | 使用 GM_setValue 持久化 |
| 页面结构变化     | 低   | 高   | 使用健壮的选择器        |
| 服务器返回错误   | 中   | 中   | 添加重试和错误处理      |
| 清理过程中断     | 中   | 中   | 保存进度，支持恢复      |
| 用户意外操作     | 中   | 中   | 蒙版阻止交互            |

## 完成定义 (DoD)

- [ ] 所有 Story 验收标准通过
- [ ] 代码已添加 JSDoc 注释
- [ ] 无 TypeScript 编译错误
- [ ] UI 美观，符合现有风格
- [ ] 使用 GM_setValue 而非 localStorage
- [ ] 复用现有 POC.ts 逻辑
- [ ] 手动测试通过（Prebilling 和 Call Maintenance）
- [ ] 页面刷新后能正确恢复进度
- [ ] 清理蒙版正常工作

## 变更日志

| 日期       | 版本 | 变更内容                                          | 作者         |
| ---------- | ---- | ------------------------------------------------- | ------------ |
| 2026-01-13 | 1.0  | Epic 初始创建                                     | AI Developer |
| 2026-01-14 | 1.1  | 更新：页面刷新处理、UI 差异、蒙版 UX、复用 POC.ts | AI Developer |

---

## 📸 技术分析截图

### Prebilling Report 表格结构

![Prebilling Table](file:///C:/Users/KurosakiRei/.gemini/antigravity/brain/e1d17b2b-f700-46f1-9262-a5c7066727f7/uploaded_image_1768367688582.png)

### Call Maintenance 表格结构

![Call Maintenance Table](file:///C:/Users/KurosakiRei/.gemini/antigravity/brain/e1d17b2b-f700-46f1-9262-a5c7066727f7/uploaded_image_1768364396987.png)

## 🎬 分析过程录像

![Complete Analysis Process](file:///C:/Users/KurosakiRei/.gemini/antigravity/brain/e1d17b2b-f700-46f1-9262-a5c7066727f7/prebilling_api_analysis_1768364429637.webp)
