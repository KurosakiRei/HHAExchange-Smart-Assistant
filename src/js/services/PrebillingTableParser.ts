/**
 * PrebillingTableParser Service
 * Epic 11, Story 2: Prebilling 表格解析器
 *
 * 解析 Prebilling Report 表格，识别可清理的 POC 问题：
 * - POC Only: 仅包含 "POC Compliance"
 * - POC + Caregiver: 包含 "POC Compliance" 和 "Caregiver Compliance"（顺序无关）
 */

/**
 * 精简的 Visit 记录，用于 Timesheet 内置模板
 */
export interface TimesheetRecord {
  patientName: string;
  admissionId: string;
  visitDate: string;
  scheduledTime: string;
}

/**
 * 单个 Visit 记录
 */
export interface VisitRecord {
  /** 行索引（用于定位原始 DOM 元素） */
  rowIndex: number;
  /** 行元素引用（用于点击操作） */
  rowElement: HTMLTableRowElement;
  /** 访问日期 */
  visitDate: string;
  /** Admission ID */
  admissionId: string;
  /** 患者姓名 */
  patientName: string;
  /** 合同/支付方 */
  contract: string;
  /** 护理员姓名 */
  caregiverName: string;
  /** 计划时间 */
  scheduledTime: string;
  /** 实际访问时间 */
  visitTime: string;
  /** 问题类型匹配 */
  matchType: "POC_ONLY" | "POC_AND_CAREGIVER";
  /** 原始问题文本 */
  problemsText: string;
}

/**
 * 表格列索引映射
 */
const COLUMN_INDEX = {
  VISIT_DATE: 0,
  ADMISSION_ID: 1,
  PATIENT: 2,
  OFFICE: 3,
  CONTRACT: 4,
  CAREGIVER: 5,
  SERVICE_CODE: 6,
  COORDINATOR: 7,
  SCHEDULED_TIME: 8,
  VISIT_TIME: 9,
  DISCIPLINES: 10,
  TF: 11,
  PROBLEMS: 12,
  ACTIONS: 13,
} as const;

/**
 * 表格选择器
 * 注意：实际表格 ID 是 #tblDetails（由 XSLT 渲染）
 */
const SELECTORS = {
  TABLE_CONTAINER:
    "#ctl00_ContentPlaceHolder1_divPrebillingReportInternalScroll",
  TABLE: "#tblDetails",
  TABLE_BODY: "#tblDetails tbody",
  EDIT_BUTTON: 'a[name="imgEditInternal"]',
} as const;

export class PrebillingTableParser {
  /**
   * 解析表格，返回符合 POC 清理条件的 visit 记录
   *
   * 清理条件：
   * 1. 仅包含 "POC Compliance"
   * 2. 仅包含 "POC Compliance" + "Caregiver Compliance"（顺序无关）
   */
  static async parseTable(): Promise<VisitRecord[]> {
    console.log("[PrebillingTableParser] Starting table analysis...");

    const records: VisitRecord[] = [];

    // 使用 requestIdleCallback 进行异步解析，避免阻塞 UI
    return new Promise((resolve) => {
      const parseRows = () => {
        try {
          // 先尝试在主文档中找到表格
          let table = document.querySelector(
            SELECTORS.TABLE
          ) as HTMLTableElement | null;

          // 如果主文档中找不到，尝试在所有 iframe 中搜索
          if (!table) {
            console.log(
              "[PrebillingTableParser] Table not found in main document, searching iframes..."
            );
            table = PrebillingTableParser.searchTableInAllFrames(
              window,
              SELECTORS.TABLE
            );
          }

          if (!table) {
            console.warn(
              "[PrebillingTableParser] Table not found with selector:",
              SELECTORS.TABLE
            );
            console.log(
              "[PrebillingTableParser] Available tables in main document:",
              Array.from(document.querySelectorAll("table")).map((t) => t.id)
            );
            resolve([]);
            return;
          }

          console.log("[PrebillingTableParser] Table found:", table.id);

          // 尝试找 tbody，如果没有则直接从 table 查找 tr
          const tbody = table.querySelector("tbody");
          const rows = tbody
            ? tbody.querySelectorAll("tr")
            : table.querySelectorAll("tr");

          console.log(
            `[PrebillingTableParser] Found ${
              rows.length
            } rows to analyze (using ${tbody ? "tbody" : "table directly"})`
          );

          // Debug: Log first 3 rows structure
          for (let i = 0; i < Math.min(3, rows.length); i++) {
            const cells = rows[i].querySelectorAll("td");
            console.log(
              `[PrebillingTableParser] Row ${i}: ${
                cells.length
              } cells, Problems cell text: "${
                cells[COLUMN_INDEX.PROBLEMS]?.textContent?.trim() || "N/A"
              }"`
            );
          }

          rows.forEach((row, index) => {
            const cells = row.querySelectorAll("td");

            if (cells.length < COLUMN_INDEX.ACTIONS + 1) {
              // 跳过不完整的行
              return;
            }

            const problemsText = PrebillingTableParser.getCellText(
              cells[COLUMN_INDEX.PROBLEMS]
            );
            const matchType = PrebillingTableParser.checkPOCMatch(problemsText);

            // Debug: Log POC detection for first 5 rows with problems
            if (index < 5 && problemsText) {
              console.log(
                `[PrebillingTableParser] Row ${index}: Problems="${problemsText}", Match=${matchType}`
              );
            }

            if (matchType) {
              const record: VisitRecord = {
                rowIndex: index,
                rowElement: row as HTMLTableRowElement,
                visitDate: PrebillingTableParser.getCellText(
                  cells[COLUMN_INDEX.VISIT_DATE]
                ),
                admissionId: PrebillingTableParser.getCellText(
                  cells[COLUMN_INDEX.ADMISSION_ID]
                ),
                patientName: PrebillingTableParser.getCellText(
                  cells[COLUMN_INDEX.PATIENT]
                ),
                contract: PrebillingTableParser.getCellText(
                  cells[COLUMN_INDEX.CONTRACT]
                ),
                caregiverName: PrebillingTableParser.getCellText(
                  cells[COLUMN_INDEX.CAREGIVER]
                ),
                scheduledTime: PrebillingTableParser.getCellText(
                  cells[COLUMN_INDEX.SCHEDULED_TIME]
                ),
                visitTime: PrebillingTableParser.getCellText(
                  cells[COLUMN_INDEX.VISIT_TIME]
                ),
                matchType,
                problemsText,
              };

              records.push(record);
            }
          });

          console.log(
            `[PrebillingTableParser] Found ${records.length} records matching POC criteria`
          );
          resolve(records);
        } catch (error) {
          console.error("[PrebillingTableParser] Error parsing table:", error);
          resolve([]);
        }
      };

      // 使用 requestIdleCallback 进行异步解析
      if ("requestIdleCallback" in window) {
        requestIdleCallback(parseRows, { timeout: 3000 });
      } else {
        // 降级方案
        setTimeout(parseRows, 0);
      }
    });
  }

  /**
   * 检查问题文本是否符合 POC 清理条件
   *
   * 匹配规则（严格模式）：
   * - POC_ONLY: 仅包含 "POC Compliance"（没有其他问题类型）
   * - POC_AND_CAREGIVER: 仅包含 "POC Compliance" 和 "Caregiver Compliance"（没有其他问题类型）
   *
   * 注意：如果存在其他问题类型（如 "Timesheet Not Approved"），则不匹配
   *
   * @returns 匹配类型或 null（不匹配）
   */
  private static checkPOCMatch(
    problemsText: string
  ): "POC_ONLY" | "POC_AND_CAREGIVER" | null {
    if (!problemsText) {
      return null;
    }

    // 用逗号分隔问题列表，支持 ", " 和 "," 两种格式
    const problems = problemsText
      .split(/,\s*/)
      .map((p) => p.trim().toLowerCase())
      .filter((p) => p.length > 0);

    if (problems.length === 0) {
      return null;
    }

    // 定义允许的问题类型
    const allowedProblems = new Set(["poc compliance", "caregiver compliance"]);

    // 检查所有问题是否都在允许列表中
    const allAllowed = problems.every((p) => allowedProblems.has(p));

    if (!allAllowed) {
      // 存在不允许的问题类型，不匹配
      return null;
    }

    // 检查是否包含 POC Compliance（必须有）
    const hasPOC = problems.includes("poc compliance");
    if (!hasPOC) {
      return null;
    }

    // 检查是否包含 Caregiver Compliance
    const hasCaregiver = problems.includes("caregiver compliance");

    if (hasCaregiver) {
      return "POC_AND_CAREGIVER";
    }

    return "POC_ONLY";
  }

  /**
   * 获取单元格文本内容（清理空白字符）
   */
  private static getCellText(cell: Element): string {
    return cell?.textContent?.trim().replace(/\s+/g, " ") || "";
  }

  /**
   * 获取 visit 的 Edit 按钮
   */
  static getEditButton(record: VisitRecord): HTMLAnchorElement | null {
    const actionCell =
      record.rowElement.querySelectorAll("td")[COLUMN_INDEX.ACTIONS];
    if (!actionCell) return null;

    return actionCell.querySelector(
      SELECTORS.EDIT_BUTTON
    ) as HTMLAnchorElement | null;
  }

  /**
   * 获取表格是否存在
   */
  static isTablePresent(): boolean {
    return document.querySelector(SELECTORS.TABLE) !== null;
  }

  /**
   * 获取表格总行数
   */
  static getTotalRowCount(): number {
    const tableBody = document.querySelector(SELECTORS.TABLE_BODY);
    if (!tableBody) return 0;
    return tableBody.querySelectorAll("tr").length;
  }

  /**
   * 解析表格，返回所有行（不过滤 Problems 列）
   * 用于 Timesheet 内置模板
   */
  static async parseAllRows(): Promise<TimesheetRecord[]> {
    console.log("[PrebillingTableParser] parseAllRows: starting...");

    const records: TimesheetRecord[] = [];

    return new Promise((resolve) => {
      const parseRows = () => {
        try {
          let table = document.querySelector(
            SELECTORS.TABLE
          ) as HTMLTableElement | null;

          if (!table) {
            table = PrebillingTableParser.searchTableInAllFrames(
              window,
              SELECTORS.TABLE
            );
          }

          if (!table) {
            console.warn(
              "[PrebillingTableParser] parseAllRows: table not found"
            );
            resolve([]);
            return;
          }

          const tbody = table.querySelector("tbody");
          const rows = tbody
            ? tbody.querySelectorAll("tr")
            : table.querySelectorAll("tr");

          rows.forEach((row) => {
            const cells = row.querySelectorAll("td");

            if (cells.length < COLUMN_INDEX.ACTIONS + 1) {
              return;
            }

            const record: TimesheetRecord = {
              patientName: PrebillingTableParser.getCellText(
                cells[COLUMN_INDEX.PATIENT]
              ),
              admissionId: PrebillingTableParser.getCellText(
                cells[COLUMN_INDEX.ADMISSION_ID]
              ),
              visitDate: PrebillingTableParser.getCellText(
                cells[COLUMN_INDEX.VISIT_DATE]
              ),
              scheduledTime: PrebillingTableParser.getCellText(
                cells[COLUMN_INDEX.SCHEDULED_TIME]
              ),
            };

            if (record.patientName || record.admissionId) {
              records.push(record);
            }
          });

          console.log(
            `[PrebillingTableParser] parseAllRows: found ${records.length} rows`
          );
          resolve(records);
        } catch (error) {
          console.error("[PrebillingTableParser] parseAllRows error:", error);
          resolve([]);
        }
      };

      if ("requestIdleCallback" in window) {
        requestIdleCallback(parseRows, { timeout: 3000 });
      } else {
        setTimeout(parseRows, 0);
      }
    });
  }

  /**
   * 在所有 frames 中搜索表格元素
   * 支持多层 iframe 嵌套的页面结构
   */
  private static searchTableInAllFrames(
    win: Window,
    selector: string
  ): HTMLTableElement | null {
    let result: HTMLTableElement | null = null;

    function searchWindow(currentWindow: Window): boolean {
      try {
        if (currentWindow.document) {
          const foundElement =
            currentWindow.document.querySelector<HTMLTableElement>(selector);
          if (foundElement) {
            result = foundElement;
            console.log("[PrebillingTableParser] Table found in frame");
            return true; // 找到了，停止搜索
          }
        }
      } catch (e) {
        // 跨域 iframe 无法访问，静默忽略
      }

      try {
        for (let i = 0; i < currentWindow.frames.length; i++) {
          const frame = currentWindow.frames[i];
          if (searchWindow(frame)) {
            return true; // 子frame中找到了，停止搜索
          }
        }
      } catch (e) {
        // 无法访问 frames，静默忽略
      }

      return false; // 当前window和子frames都没找到
    }

    searchWindow(win);
    return result;
  }
}
