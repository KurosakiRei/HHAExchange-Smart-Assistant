/**
 * ============================================================================
 * BACKUP: Original apiParamProvider from VisitMonitor.ts
 * ============================================================================
 *
 * Backup Date: 2026-01-08
 * Source File: src/js/VisitMonitor.ts (lines 533-637)
 * Reason: Refactoring apiParamProvider into a shared singleton module for Epic 8
 *
 * This backup contains the complete original implementation of apiParamProvider
 * from VisitMonitor.ts. It should be retained for at least 2 weeks after the
 * refactoring is complete and verified stable.
 *
 * ROLLBACK INSTRUCTIONS:
 * 1. Copy the apiParamProvider object below
 * 2. Paste it back into src/js/VisitMonitor.ts at line ~533
 * 3. Remove imports of ApiParamProvider from any files using it
 * 4. Test the functionality thoroughly
 *
 * @see docs/stories/epic-8-qa-report-feature.md - Story 8.1
 * @see docs/adr/008-qa-report-tab-implementation.md
 * ============================================================================
 */

import GM_fetch from "@trim21/gm-fetch";

// Original interface from VisitMonitor.ts
interface ApiParams {
  userID: string;
  appSecret: string;
  appVersion: string;
  version: string;
  minorVersion: string;
  appName: string;
}

// Extended ApiParams with session-specific fields
type FullApiParams = ApiParams & {
  sessionID: string;
  viewState: string;
  viewStateGenerator: string;
  vendorID: string;
};

/**
 * Original apiParamProvider implementation from VisitMonitor.ts
 *
 * This is the exact code that was in VisitMonitor.ts before refactoring.
 * DO NOT MODIFY THIS FILE - it serves as a backup reference only.
 */
export const apiParamProvider = {
  params: null as FullApiParams | null,

  /**
   * 获取并缓存所有API请求所需的基础参数
   */
  async get() {
    // 如果已经缓存了参数，直接返回
    if (this.params) return this.params;

    console.log("Fetching API parameters for the first time...");
    const url =
      "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
    const r = (await GM_fetch(url, { method: "GET" })) as Response & {
      rawBody: Blob;
    };
    const text = await r.rawBody.text();

    /**
     * 辅助函数：使用正则表达式从大段文本中精确提取指定键的值
     * @param key 要查找的键 (例如 'userID')
     * @param sourceText 从中查找的源文本
     */
    const getParamFromText = (
      key: string,
      sourceText: string
    ): string | null => {
      // 正则表达式查找类似 'key: 'value'' 的模式
      const regex = new RegExp(`${key}\\s*:\\s*'([^']+)'`);
      const match = sourceText.match(regex);
      // 如果匹配成功，返回捕获组1 (也就是单引号里的值)
      return match ? match[1] : null;
    };

    /**
     * 辅助函数：从HTML中提取隐藏input的值
     */
    const getInputValue = (id: string, sourceText: string): string | null => {
      const match = sourceText.match(
        new RegExp(`id="${id}"[\\s\\S]*?value="([^"]*)"`)
      );
      return match ? match[1] : null;
    };

    // 组装并缓存所有参数
    this.params = {
      userID: getParamFromText("userID", text)!,
      appSecret: getParamFromText("appSecret", text)!,
      appVersion: getParamFromText("appVersion", text)!,
      version: getParamFromText("version", text)!,
      minorVersion: getParamFromText("minorVersion", text)!,
      appName: getParamFromText("appName", text)!,
      sessionID: getParamFromText("sessionID", text)!,
      vendorID: getParamFromText("vendorID", text)!,
      viewState: getInputValue("__VIEWSTATE", text)!,
      viewStateGenerator: getInputValue("__VIEWSTATEGENERATOR", text)!,
    };

    // 进行一次严格的检查，确保所有关键参数都已成功获取
    for (const [key, value] of Object.entries(this.params)) {
      if (!value) {
        throw new Error(`Failed to extract critical API parameter: ${key}`);
      }
    }

    console.log("API parameters cached successfully:", this.params);
    return this.params;
  },

  /**
   * 从 HTML 文本中解析并更新 ViewState
   */
  parseViewState(htmlText: string): {
    viewState: string;
    viewStateGenerator: string;
  } {
    const getInputValue = (id: string, sourceText: string): string | null => {
      const match = sourceText.match(
        new RegExp(`id="${id}"[\\s\\S]*?value="([^"]*)"`)
      );
      return match ? match[1] : null;
    };

    const viewState = getInputValue("__VIEWSTATE", htmlText);
    const viewStateGenerator = getInputValue("__VIEWSTATEGENERATOR", htmlText);

    if (viewState && this.params) {
      this.params.viewState = viewState;
    }
    if (viewStateGenerator && this.params) {
      this.params.viewStateGenerator = viewStateGenerator;
    }

    return {
      viewState: viewState || "",
      viewStateGenerator: viewStateGenerator || "",
    };
  },
};
