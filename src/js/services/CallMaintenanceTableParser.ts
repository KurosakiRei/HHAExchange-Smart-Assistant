/**
 * CallMaintenanceTableParser
 * 
 * Epic 11 - Story 7: 解析 Call Maintenance 表格
 * 筛选出 status 为 "Duplicate Call" 的记录
 * 
 * 表格结构:
 * - 表格: #ctl00_ContentPlaceHolder1_uxGvSearch
 * - Status 列: Column Index 9
 * - Duplicate Call 记录需要点击 Reject 按钮清理
 */

/**
 * Call 记录数据结构
 * 省略无用字段: officeName, caregiverPhone, caregiverTeam, status, tf
 */
export interface CallRecord {
    /** 行索引 */
    rowIndex: number;
    /** 原始行元素 */
    rowElement: HTMLTableRowElement;
    /** Assign Code */
    assignCode: string;
    /** Caregiver Code */
    caregiverCode: string;
    /** Caregiver Name */
    caregiverName: string;
    /** Patient Name */
    patientName: string;
    /** Call Date */
    callDate: string;
    /** Call Time */
    callTime: string;
    /** Call Type */
    callType: string;
    /** Caller ID */
    callerId: string;
}

/**
 * 表格列索引
 * 基于 Call Maintenance 表格结构
 */
const COLUMN_INDEX = {
    ASSIGN_CODE: 0,
    CAREGIVER_CODE: 1,
    CAREGIVER_NAME: 2,
    OFFICE_NAME: 3,        // 省略
    CAREGIVER_PHONE: 4,    // 省略
    CAREGIVER_TEAM: 5,     // 省略
    PATIENT_NAME: 6,
    CALL_DATE: 7,
    CALL_TIME: 8,
    CALL_TYPE: 9,
    CALLER_ID: 10,
    STATUS: 11,
    TF: 12,                // 省略
    ACTION: 13
} as const;

/**
 * 选择器常量
 */
const SELECTORS = {
    TABLE: "#ctl00_ContentPlaceHolder1_uxGvSearch",
    TABLE_BODY: "#ctl00_ContentPlaceHolder1_uxGvSearch tbody",
    REJECT_BUTTON: 'a[id*="uxbtnRejectCall"]'
} as const;

export class CallMaintenanceTableParser {
    /**
     * 解析表格，返回 Duplicate Call 记录
     */
    static async parseTable(): Promise<CallRecord[]> {
        console.log("[CallMaintenanceTableParser] Starting table analysis...");

        const records: CallRecord[] = [];

        return new Promise((resolve) => {
            const parseRows = () => {
                try {
                    // 先在主文档中查找表格
                    let table = document.querySelector(SELECTORS.TABLE) as HTMLTableElement | null;

                    // 如果主文档中找不到，尝试在 iframes 中搜索
                    if (!table) {
                        console.log("[CallMaintenanceTableParser] Table not found in main document, searching iframes...");
                        table = CallMaintenanceTableParser.searchTableInAllFrames(window, SELECTORS.TABLE);
                    }

                    if (!table) {
                        console.warn("[CallMaintenanceTableParser] Table not found with selector:", SELECTORS.TABLE);
                        resolve([]);
                        return;
                    }

                    console.log("[CallMaintenanceTableParser] Table found:", table.id);

                    // 获取所有行
                    const tbody = table.querySelector("tbody");
                    const rows = tbody
                        ? Array.from(tbody.querySelectorAll("tr"))
                        : Array.from(table.querySelectorAll("tr"));

                    console.log(`[CallMaintenanceTableParser] Found ${rows.length} rows`);

                    let duplicateCount = 0;

                    rows.forEach((row, index) => {
                        const cells = row.querySelectorAll("td");

                        // 跳过无效行（没有足够列或是标题行）
                        if (cells.length < COLUMN_INDEX.STATUS + 1) {
                            return;
                        }

                        // 检查是否是 Duplicate Call
                        const statusText = CallMaintenanceTableParser.getCellText(cells[COLUMN_INDEX.STATUS]);

                        if (statusText.toLowerCase().includes("duplicate call")) {
                            duplicateCount++;

                            const record: CallRecord = {
                                rowIndex: index,
                                rowElement: row as HTMLTableRowElement,
                                assignCode: CallMaintenanceTableParser.getCellText(cells[COLUMN_INDEX.ASSIGN_CODE]),
                                caregiverCode: CallMaintenanceTableParser.getCellText(cells[COLUMN_INDEX.CAREGIVER_CODE]),
                                caregiverName: CallMaintenanceTableParser.getCellText(cells[COLUMN_INDEX.CAREGIVER_NAME]),
                                patientName: CallMaintenanceTableParser.getCellText(cells[COLUMN_INDEX.PATIENT_NAME]),
                                callDate: CallMaintenanceTableParser.getCellText(cells[COLUMN_INDEX.CALL_DATE]),
                                callTime: CallMaintenanceTableParser.getCellText(cells[COLUMN_INDEX.CALL_TIME]),
                                callType: CallMaintenanceTableParser.getCellText(cells[COLUMN_INDEX.CALL_TYPE]),
                                callerId: CallMaintenanceTableParser.getCellText(cells[COLUMN_INDEX.CALLER_ID])
                            };

                            records.push(record);
                            console.log(`[CallMaintenanceTableParser] Found Duplicate Call #${duplicateCount}:`,
                                record.caregiverName, record.patientName, record.callDate, record.callTime);
                        }
                    });

                    console.log(`[CallMaintenanceTableParser] Analysis complete. Found ${records.length} Duplicate Call records`);
                    resolve(records);

                } catch (error) {
                    console.error("[CallMaintenanceTableParser] Error parsing table:", error);
                    resolve([]);
                }
            };

            // 使用 requestIdleCallback 避免阻塞 UI
            if ("requestIdleCallback" in window) {
                requestIdleCallback(parseRows, { timeout: 3000 });
            } else {
                setTimeout(parseRows, 100);
            }
        });
    }

    /**
     * 获取单元格文本内容
     */
    private static getCellText(cell: Element): string {
        return cell?.textContent?.trim().replace(/\s+/g, " ") || "";
    }

    /**
     * 获取 Reject 按钮
     */
    static getRejectButton(record: CallRecord): HTMLAnchorElement | null {
        const actionCell = record.rowElement.querySelectorAll("td")[COLUMN_INDEX.ACTION];
        if (!actionCell) return null;

        return actionCell.querySelector(SELECTORS.REJECT_BUTTON) as HTMLAnchorElement | null;
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
        if (!tableBody) {
            // 尝试在 iframes 中搜索
            const table = CallMaintenanceTableParser.searchTableInAllFrames(window, SELECTORS.TABLE);
            if (table) {
                const tbody = table.querySelector("tbody");
                return tbody
                    ? tbody.querySelectorAll("tr").length
                    : table.querySelectorAll("tr").length;
            }
            return 0;
        }
        return tableBody.querySelectorAll("tr").length;
    }

    /**
     * 在所有 frames 中搜索表格元素
     */
    private static searchTableInAllFrames(
        win: Window,
        selector: string
    ): HTMLTableElement | null {
        let result: HTMLTableElement | null = null;

        function searchWindow(currentWindow: Window): boolean {
            try {
                if (currentWindow.document) {
                    const foundElement = currentWindow.document.querySelector<HTMLTableElement>(selector);
                    if (foundElement) {
                        result = foundElement;
                        console.log("[CallMaintenanceTableParser] Table found in frame");
                        return true;
                    }
                }
            } catch (e) {
                // 跨域 iframe 无法访问，静默忽略
            }

            try {
                for (let i = 0; i < currentWindow.frames.length; i++) {
                    const frame = currentWindow.frames[i];
                    if (searchWindow(frame)) {
                        return true;
                    }
                }
            } catch (e) {
                // 无法访问 frames，静默忽略
            }

            return false;
        }

        searchWindow(win);
        return result;
    }
}
