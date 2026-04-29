import { BaseTab } from "./BaseTab";
import {
  ApiParamProvider,
  ReportsSessionInfo,
} from "../services/ApiParamProvider";
import GM_fetch from "@trim21/gm-fetch";

/**
 * QA Report Tab - 病人 QA 回访优先级报告
 *
 * Epic 8: QA 报告功能实现
 * - Story 8.2: Coordinator 下拉框
 * - Story 8.3: Census 数据获取
 * - Story 8.4: Patient General Notes 数据获取
 * - Story 8.5: 数据合并与排序
 * - Story 8.6: 列表视图
 * - Story 8.7: 九宫格视图
 * - Story 8.8: 视图切换
 * - Story 8.9: 数据导出
 * - Story 8.10: 操作菜单
 *
 * @author HHA Smart Assistant
 * @date 2026-01-08
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Coordinator {
  ID: string;
  Text: string;
}

interface PhoneInfo {
  label: string;
  phone: string;
}

interface CensusPatient {
  admissionId: string;
  patientName: string;
  address: string;
  phones: PhoneInfo[];
  coordinator: string;
  primaryContract: string;
  status: string;
  startDate: string;
}

interface QANote {
  admissionId: string;
  patientName: string;
  createdDate: string;
  note: string;
  coordinator: string;
}

interface QAReportItem {
  admissionId: string;
  patientName: string;
  phones: PhoneInfo[];
  address: string;
  lastQADaysAgo: number | null; // null = 从未联系
  lastQADate: string | null;
  lastQANote: string | null;
  priority:
    | "critical"
    | "high"
    | "medium-high"
    | "medium"
    | "low-medium"
    | "low";
  coordinator: string;
  primaryContract: string;
}

type ViewMode = "list" | "grid";

// Story 9.1: 排序类型
type SortDirection = "none" | "asc" | "desc";
type SortableColumn = "id" | "name" | "lastQA";

interface SortState {
  column: SortableColumn | null;
  direction: SortDirection;
}

// Story 9.3: 病人详情搜索结果（电话号码和 Profile ID）
interface PatientSearchResult {
  phones: string[];
  profileId: string | null;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  VIEW_MODE: "hha_qa_report_view_mode",
  LAST_COORDINATOR: "hha_qa_report_last_coordinator",
};

// Story 9.3 & 9.5: 病人搜索 API URL - 使用动态租户前缀
const _TENANT_BASE_URL = ApiParamProvider.getTenantBaseUrl();
const PATIENT_SEARCH_BY_NUMBER_URL =
  `${_TENANT_BASE_URL}/Patient/PatientSearchXSLT_ns.aspx` +
  "?FirstName=&LastName=&StatusID=-1&PatientID=&MRNumber=&CoordinatorId=-1" +
  "&Source=-1&PatientNumber={ADMISSION_ID}&HomePhone=";

const PATIENT_SEARCH_PARAMS =
  "&AltPatientID=&TeamID=-1&LocationID=-1&BranchID=-1&DisciplineID=0" +
  "&Default=false&pg=1&sort=&ord=ASC&OfficeIds=469,5137,5139,6475,14849&MedicaidID=";

// Story 9.5: 病人详情页 URL
const PATIENT_PROFILE_URL_TEMPLATE = `${_TENANT_BASE_URL}/Patient/InternalPatientInfo_ns.aspx?PatientId={ID}`;

const PRIORITY_COLORS: Record<QAReportItem["priority"], string> = {
  critical: "#dc3545", // 从未联系 - 深红
  high: "#e74c3c", // >120天 - 红
  "medium-high": "#fd7e14", // 90-120天 - 橙
  medium: "#ffc107", // 30-90天 - 黄
  "low-medium": "#a8d08d", // 15-30天 - 浅绿
  low: "#28a745", // <15天 - 绿
};

const PRIORITY_LABELS: Record<QAReportItem["priority"], string> = {
  critical: "从未联系",
  high: ">120天",
  "medium-high": "90-120天",
  medium: "30-90天",
  "low-medium": "15-30天",
  low: "<15天",
};

// ============================================================================
// QAReportTab Class
// ============================================================================

export class QAReportTab extends BaseTab {
  id = "qa-report";
  label = "QA 报告";
  icon = "📋";

  private apiProvider: ApiParamProvider;
  private coordinators: Coordinator[] = [];
  private selectedCoordinatorId: string = "";
  private qaReportData: QAReportItem[] = [];
  private viewMode: ViewMode = "list";
  private isLoading: boolean = false;
  private cachedOfficeIds: string | null = null; // Cache complete OfficeIDs from API
  private officeIdsCacheTimestamp: number = 0; // Cache timestamp for OfficeIDs

  // Story 9.1: 排序状态
  private sortState: SortState = { column: null, direction: "none" };
  private originalData: QAReportItem[] = []; // 保存原始顺序用于重置

  // Story 9.3 & 9.5: 病人详情缓存 (电话号码和 Profile ID)
  private patientDetailsCache: Map<string, PatientSearchResult> = new Map();

  // DOM Elements
  private toolbarEl: HTMLElement | null = null;
  private contentBodyEl: HTMLElement | null = null;
  private coordinatorSelectEl: HTMLSelectElement | null = null;
  private loadBtnEl: HTMLButtonElement | null = null;
  private exportBtnEl: HTMLButtonElement | null = null;
  private viewToggleEl: HTMLElement | null = null;

  constructor() {
    super();
    this.apiProvider = ApiParamProvider.getInstance();
    this.loadState();
  }

  async init(): Promise<void> {
    // 避免重复初始化 - 使用单独的标志
    if (this.initialized) {
      return;
    }

    try {
      await this.fetchCoordinators();
      this.initialized = true;
    } catch (e) {
      console.error("[QAReportTab] Init failed:", e);
    }
  }

  render(container: HTMLElement): void {
    this.container = container;
    // 只添加 qa-report-tab class，不要覆盖原有的 class
    container.classList.add("qa-report-tab");

    // Create main structure
    const wrapper = document.createElement("div");
    wrapper.className = "qa-report-wrapper";

    // Header with title
    const header = document.createElement("div");
    header.className = "qa-report-header";
    header.innerHTML = `<h3 class="qa-report-title">📋 QA 报告</h3>`;
    wrapper.appendChild(header);

    // Toolbar
    this.toolbarEl = this.createToolbar();
    wrapper.appendChild(this.toolbarEl);

    // Content body
    this.contentBodyEl = document.createElement("div");
    this.contentBodyEl.className = "qa-report-content-body";
    wrapper.appendChild(this.contentBodyEl);

    // Initial empty state
    this.renderEmptyState();

    container.appendChild(wrapper);
    // 注意：不要在这里设置 this.initialized = true
    // initialized 标志只在 init() 成功完成后设置
  }

  // ==========================================================================
  // Toolbar Creation
  // ==========================================================================

  private createToolbar(): HTMLElement {
    const toolbar = document.createElement("div");
    toolbar.className = "qa-report-toolbar";

    // Left section: Coordinator select
    const leftSection = document.createElement("div");
    leftSection.className = "qa-toolbar-left";

    const selectLabel = document.createElement("label");
    selectLabel.className = "qa-select-label";
    selectLabel.textContent = "辅导员:";

    this.coordinatorSelectEl = document.createElement("select");
    this.coordinatorSelectEl.className = "qa-coordinator-select";
    this.coordinatorSelectEl.innerHTML = '<option value="">加载中...</option>';

    leftSection.appendChild(selectLabel);
    leftSection.appendChild(this.coordinatorSelectEl);

    // Actions section: Button group (Load + Export)
    const actionsSection = document.createElement("div");
    actionsSection.className = "qa-toolbar-actions";

    this.loadBtnEl = document.createElement("button");
    this.loadBtnEl.className = "hha-smart-btn-primary qa-load-btn";
    this.loadBtnEl.innerHTML = "🔄 加载";
    this.loadBtnEl.addEventListener("click", () => this.handleLoad());

    this.exportBtnEl = document.createElement("button");
    this.exportBtnEl.className = "hha-smart-btn-secondary qa-export-btn";
    this.exportBtnEl.innerHTML = "📥 导出";
    this.exportBtnEl.disabled = true;
    this.exportBtnEl.addEventListener("click", () => this.showExportMenu());

    actionsSection.appendChild(this.loadBtnEl);
    actionsSection.appendChild(this.exportBtnEl);

    // Right section: View toggle
    const rightSection = document.createElement("div");
    rightSection.className = "qa-toolbar-right";

    this.viewToggleEl = this.createViewToggle();

    rightSection.appendChild(this.viewToggleEl);

    toolbar.appendChild(leftSection);
    toolbar.appendChild(actionsSection);
    toolbar.appendChild(rightSection);

    return toolbar;
  }

  private createViewToggle(): HTMLElement {
    const toggle = document.createElement("div");
    toggle.className = "qa-view-toggle";

    const listBtn = document.createElement("button");
    listBtn.className = `qa-view-btn ${
      this.viewMode === "list" ? "active" : ""
    }`;
    listBtn.innerHTML = "≡";
    listBtn.title = "列表视图";
    listBtn.addEventListener("click", () => this.setViewMode("list"));

    const gridBtn = document.createElement("button");
    gridBtn.className = `qa-view-btn ${
      this.viewMode === "grid" ? "active" : ""
    }`;
    gridBtn.innerHTML = "⊞";
    gridBtn.title = "九宫格视图";
    gridBtn.addEventListener("click", () => this.setViewMode("grid"));

    toggle.appendChild(listBtn);
    toggle.appendChild(gridBtn);

    return toggle;
  }

  // ==========================================================================
  // Data Fetching
  // ==========================================================================

  private async fetchCoordinators(): Promise<void> {
    try {
      const sessionInfo = await this.getSessionInfo();
      const url = this.buildCoordinatorApiUrl(sessionInfo);

      const response = await this.gmGet(url);
      this.coordinators = response || [];

      this.populateCoordinatorSelect();
    } catch (e) {
      console.error("[QAReportTab] Failed to fetch coordinators:", e);
      this.showError("获取 Coordinator 列表失败");
    }
  }

  private buildCoordinatorApiUrl(sessionInfo: ReportsSessionInfo): string {
    const params = new URLSearchParams({
      MethodName: "GetCoordinatorforOffice_WithNoCoordinator",
      UserID: sessionInfo.userId,
      OfficeIDs: sessionInfo.officeIds,
      Version: sessionInfo.version,
      MinorVersion: sessionInfo.minorVersion,
      AppVersion: sessionInfo.appVersion,
    });

    return `https://reports.hhaexchange.com/HHAReportsML/Handler/Contracts.ashx/BindContract?${params}`;
  }

  private populateCoordinatorSelect(): void {
    if (!this.coordinatorSelectEl) {
      console.error("[QAReportTab] coordinatorSelectEl is null!");
      return;
    }

    this.coordinatorSelectEl.innerHTML =
      '<option value="">-- 选择辅导员 --</option>';

    // Filter out "No Coordinator" option
    const validCoordinators = this.coordinators.filter((c) => c.ID !== "-3");

    validCoordinators.forEach((coordinator) => {
      const option = document.createElement("option");
      option.value = coordinator.ID;
      // 去除邮箱地址，只保留名字和分机号（例如："Anna O. Russian Sup ext.141" 而不是 "Anna O. Russian Sup ext.141 AOzhigova@alwaysny.net"）
      const displayText = coordinator.Text.replace(
        /\s+[\w.-]+@[\w.-]+$/i,
        ""
      ).trim();
      option.textContent = displayText;
      this.coordinatorSelectEl!.appendChild(option);
    });

    // Restore last selected
    const lastSelected = localStorage.getItem(STORAGE_KEYS.LAST_COORDINATOR);
    if (lastSelected && validCoordinators.some((c) => c.ID === lastSelected)) {
      this.coordinatorSelectEl.value = lastSelected;
      this.selectedCoordinatorId = lastSelected;
    }

    this.coordinatorSelectEl.addEventListener("change", (e) => {
      this.selectedCoordinatorId = (e.target as HTMLSelectElement).value;
      localStorage.setItem(
        STORAGE_KEYS.LAST_COORDINATOR,
        this.selectedCoordinatorId
      );
    });
  }

  private async handleLoad(): Promise<void> {
    if (!this.selectedCoordinatorId) {
      this.showError("请先选择一个 Coordinator");
      return;
    }

    if (this.isLoading) return;

    this.setLoading(true);

    try {
      // Step 1: Fetch Census data
      const censusPatients = await this.fetchCensusData();

      // Step 2: Fetch Patient General Notes
      const qaNotes = await this.fetchQANotes();

      // Step 3: Merge and sort data
      this.qaReportData = this.mergeAndSortData(censusPatients, qaNotes);
      console.log(
        `[QAReportTab] Loaded: ${censusPatients.length} patients, ${qaNotes.length} notes → ${this.qaReportData.length} items`
      );

      // Step 4: Render
      this.renderData();
      this.exportBtnEl!.disabled = false;

      this.showSuccess(`已加载 ${this.qaReportData.length} 个病人数据`);
    } catch (e) {
      console.error("[QAReportTab] Load error:", e);
      this.showError("加载失败: " + (e as Error).message);
    } finally {
      this.setLoading(false);
    }
  }

  private async fetchCensusData(): Promise<CensusPatient[]> {
    // CRITICAL: Initialize reports session first to establish cookies
    await this.initializeReportsSession();

    const sessionInfo = await this.getSessionInfo();

    // Build UserDataXML for Census API
    const userDataXML = `<Params>
      <Param StatusIDs="3,4,8"/>
      <Param OfficeIDs="${sessionInfo.officeIds}"/>
      <Param CoordinatorIDs="${this.selectedCoordinatorId}"/>
      <Param PatientLocationIDs="-1"/>
      <Param PatientBranchIDs="-1"/>
      <Param PatientTeamIDs="-1"/>
      <Param ContractIDs="-1"/>
      <Param IsDefaultPatient="0"/>
      <Param Version="${sessionInfo.version}"/>
      <Param MinorVersion="${sessionInfo.minorVersion}"/>
      <Param AppVersion="${sessionInfo.appVersion}"/>
    </Params>`.replace(/\s+/g, " ");

    console.log(
      `[QAReportTab] Census API params: StatusIDs=3,4,8, CoordinatorID=${this.selectedCoordinatorId}, OfficeIDs=${sessionInfo.officeIds}`
    );

    // Call Census API to get report GUID
    const bindDataUrl =
      "https://reports.hhaexchange.com/HHAReportsML/ajaxpro/Reports_CensusbyCoordinator,HHAExchangeUI.ashx";

    const response = await this.gmPostAjaxPro(bindDataUrl, "BindData", {
      UserDataXML: userDataXML,
    });

    // Response format: "GUID";/*
    const guid = response.replace(/[";/*]/g, "").trim();

    if (!guid) {
      throw new Error("Census API 返回空 GUID");
    }

    // Fetch and parse ALL pages of report HTML
    const reportUrl = `https://reports.hhaexchange.com/HHAReportsML/Reports/Reports.aspx?UserDataXML=${guid}&ReportName=Census%20by%20Coordinator&ReportTitle=Census%20by%20Coordinator`;

    const allPatients: CensusPatient[] = [];

    // Fetch first page and get total pages
    const {
      html: firstPageHtml,
      totalPages,
      formFields,
    } = await this.fetchReportFirstPage(reportUrl);
    const firstPagePatients = this.parseCensusReport(firstPageHtml);
    allPatients.push(...firstPagePatients);

    console.log(
      `[QAReportTab] Census page 1/${totalPages}: ${firstPagePatients.length} patients`
    );

    // Fetch remaining pages if more than one page
    if (totalPages > 1) {
      for (let page = 2; page <= totalPages; page++) {
        try {
          const pageHtml = await this.fetchReportPage(
            reportUrl,
            page,
            formFields
          );
          const pagePatients = this.parseCensusReport(pageHtml);
          allPatients.push(...pagePatients);
          console.log(
            `[QAReportTab] Census page ${page}/${totalPages}: ${pagePatients.length} patients`
          );
        } catch (e) {
          console.error(
            `[QAReportTab] Failed to fetch Census page ${page}:`,
            e
          );
        }
      }
    }

    // Deduplicate by admissionId (in case of page overlaps)
    const uniquePatients = Array.from(
      new Map(allPatients.map((p) => [p.admissionId, p])).values()
    );

    console.log(
      `[QAReportTab] Census total: ${uniquePatients.length} patients from ${totalPages} pages (before dedup: ${allPatients.length})`
    );
    return uniquePatients;
  }

  /**
   * Parse Census by Coordinator report HTML to extract patient data.
   * ASP.NET ReportViewer uses uppercase HTML tags (TR, TD, DIV).
   */
  private parseCensusReport(html: string): CensusPatient[] {
    const patients: CensusPatient[] = [];

    try {
      // Find all AHC-XXXXXX or AMD-XXXXXX Admission IDs (6 OR 7 digits)
      const admissionIdRegex = /(AHC|AMD)-\d{6,7}/g;
      const allIds = html.match(admissionIdRegex) || [];

      // Log IDs found for debugging
      console.log(
        `[QAReportTab] Census IDs found in page: ${allIds.length}`,
        allIds.slice(0, 5).join(", ") + "..."
      );

      // Process each unique ID
      const processedIds = new Set<string>();

      allIds.forEach((admissionId) => {
        if (processedIds.has(admissionId)) return;
        processedIds.add(admissionId);

        // Find ID position in HTML (format: >AHC-XXXXXX<)
        let idPos = html.indexOf(`>${admissionId}<`);
        if (idPos === -1) {
          idPos = html.indexOf(admissionId);
        }
        if (idPos === -1) return;

        // Find containing <TR> (ASP.NET uses uppercase)
        let trStart = html.lastIndexOf("<TR", idPos);
        if (trStart === -1) trStart = html.lastIndexOf("<tr", idPos);
        if (trStart === -1) return;

        // Find closing </TR>
        let trEnd = html.indexOf("</TR>", idPos);
        if (trEnd === -1) trEnd = html.indexOf("</tr>", idPos);
        if (trEnd === -1) return;
        trEnd += 5; // Include </TR>

        const rowHtml = html.substring(trStart, trEnd);

        // Verify it's a data row (has VALIGN="top")
        if (
          !rowHtml.includes('VALIGN="top"') &&
          !rowHtml.includes('valign="top"')
        ) {
          return;
        }

        // Extract cell values from <TD><DIV>VALUE</DIV></TD> structure
        const tdDivRegex =
          /<TD[^>]*>(?:<DIV[^>]*>)?([^<]*)(?:<\/DIV>)?<\/TD>/gi;
        const cellValues: string[] = [];
        let cellMatch;
        while ((cellMatch = tdDivRegex.exec(rowHtml)) !== null) {
          const value = cellMatch[1].trim();
          if (value) cellValues.push(value);
        }

        // Fallback: extract <DIV> contents directly
        if (cellValues.length < 3) {
          const divRegex = /<DIV[^>]*>([^<]+)<\/DIV>/gi;
          let divMatch;
          while ((divMatch = divRegex.exec(rowHtml)) !== null) {
            const value = divMatch[1].trim();
            if (value) cellValues.push(value);
          }
        }

        // Need at least 3 cells (row#, ID, name)
        if (cellValues.length < 3) return;

        // Find admissionId position in cell values
        const idIndex = cellValues.findIndex((v) => v === admissionId);
        if (idIndex === -1) return;

        // Extract fields relative to ID position
        // Expected: [rowNum, admissionId, patientName, address, coordinator, contract, status, startDate]
        const patientName = cellValues[idIndex + 1] || "";
        const address = cellValues[idIndex + 2] || "";
        const coordinator = cellValues[idIndex + 3] || "";
        const primaryContract = cellValues[idIndex + 4] || "";
        const status = cellValues[idIndex + 5] || "Active";
        const startDate = cellValues[idIndex + 6] || "";

        // Extract phone numbers from all fields
        const phones: PhoneInfo[] = [];
        const allText = cellValues.join(" ");
        const phoneMatches = allText.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/g) || [];
        phoneMatches.forEach((phone, idx) => {
          phones.push({
            label: idx === 0 ? "Primary" : `Phone ${idx + 1}`,
            phone: this.formatPhone(phone),
          });
        });

        patients.push({
          admissionId,
          patientName,
          address,
          phones,
          coordinator,
          primaryContract,
          status,
          startDate,
        });
      });

      console.log(`[QAReportTab] Census parsed: ${patients.length} patients`);
    } catch (e) {
      console.error("[QAReportTab] Census parse error:", e);
    }

    return patients;
  }

  private async fetchQANotes(): Promise<QANote[]> {
    // CRITICAL: Initialize reports session first to establish cookies
    await this.initializeReportsSession();

    const sessionInfo = await this.getSessionInfo();

    // Calculate date range (1 year ago to today)
    // NOTE: Use millisecond calculation because Date.setFullYear() is broken in HHA page environment
    const today = new Date();
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const oneYearAgo = new Date(today.getTime() - oneYearMs);

    // Format date as MM/DD/YYYY with leading zeros (matches HHA report format)
    const formatDate = (d: Date) => {
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${month}/${day}/${d.getFullYear()}`;
    };

    const fromDateStr = formatDate(oneYearAgo);
    const toDateStr = formatDate(today);
    console.log(
      `[QAReportTab] QA Notes date range: ${fromDateStr} to ${toDateStr}`
    );
    console.log(
      `[QAReportTab] QA Notes API params: OfficeIDs=${sessionInfo.officeIds}, CoordinatorID=${this.selectedCoordinatorId}`
    );

    // Build UserDataXML for Patient General Notes API (与 PatientGeneralNotesReport.ts 格式一致)
    const userDataXML =
      `<Params>` +
      `<Param OfficeIDs="${sessionInfo.officeIds}"/>` +
      `<Param FromDate="${formatDate(oneYearAgo)}"/>` +
      `<Param ToDate="${formatDate(today)}"/>` +
      `<Param StatusID="-1"/>` +
      `<Param ReasonID="2289535"/>` + // Quality Assurance
      `<Param ChhaID="-1"/>` +
      `<Param PatientID="-1"/>` +
      `<Param CoordinatorID="${this.selectedCoordinatorId}"/>` +
      `<Param Priority="-1"/>` +
      `<Param IsCallFromPatientProfile="0"/>` +
      `<Param CallerInfo="SSRS"/>` +
      `<Param AppVersion="${sessionInfo.appVersion}"/>` +
      `<Param Version="${sessionInfo.version}"/>` +
      `<Param MinorVersion="${sessionInfo.minorVersion}"/>` +
      `</Params>`;

    // Call Patient General Notes API (正确的URL)
    const apiUrl =
      "https://reports.hhaexchange.com/HHAReportsML/Reports/PatientGeneralNotesRpt.aspx/BindData";

    const response = await this.gmPost(apiUrl, { UserDataXML: userDataXML });

    // Response format: { d: "GUID" }
    const guid = response?.d;

    if (!guid) {
      console.warn("[QAReportTab] No QA notes found");
      return [];
    }

    // Fetch and parse ALL pages of report HTML
    const reportUrl = `https://reports.hhaexchange.com/HHAReportsML/Reports/Reports.aspx?UserDataXML=${guid}&ReportName=Patient%20General%20Notes&ReportTitle=Patient%20General%20Notes`;

    const allNotes: QANote[] = [];

    // Fetch first page and get total pages
    const {
      html: firstPageHtml,
      totalPages,
      formFields,
    } = await this.fetchReportFirstPage(reportUrl);
    const firstPageNotes = this.parseQANotesReport(firstPageHtml);
    allNotes.push(...firstPageNotes);

    console.log(
      `[QAReportTab] QA Notes page 1/${totalPages}: ${firstPageNotes.length} notes`
    );

    // Fetch remaining pages if more than one page
    if (totalPages > 1) {
      for (let page = 2; page <= totalPages; page++) {
        try {
          const pageHtml = await this.fetchReportPage(
            reportUrl,
            page,
            formFields
          );
          const pageNotes = this.parseQANotesReport(pageHtml);
          allNotes.push(...pageNotes);
          console.log(
            `[QAReportTab] QA Notes page ${page}/${totalPages}: ${pageNotes.length} notes`
          );
        } catch (e) {
          console.error(
            `[QAReportTab] Failed to fetch QA Notes page ${page}:`,
            e
          );
        }
      }
    }

    console.log(
      `[QAReportTab] QA Notes total: ${allNotes.length} notes from ${totalPages} pages`
    );
    return allNotes;
  }

  private parseQANotesReport(html: string): QANote[] {
    const notes: QANote[] = [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Extract all text content from the report
      const fullText = doc.body.textContent || "";

      // Split by "Quality Assurance" followed by contract/note info
      // Pattern: ...Quality Assurance[Contract][Note Text]Closed by...
      // We need to split on the pattern where "Closed" appears before date

      // Find all patterns of: Closed[Date][Time][User][AHC-XXXXXX or AMD-XXXXXX]
      const recordPattern =
        /Closed(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2})([^\s]+)((?:AHC|AMD)-\d{6,7})/g;
      const matches = [...fullText.matchAll(recordPattern)];

      console.log(`[QAReportTab] Found ${matches.length} QA Note records`);

      matches.forEach((match, index) => {
        const createdDate = match[1]; // e.g., "05/02/2025 14:13"
        const admissionId = match[3]; // e.g., "AHC-908035"

        // Extract just the date part (MM/DD/YYYY)
        const dateOnly = createdDate.split(" ")[0];

        notes.push({
          admissionId: admissionId,
          patientName: "",
          createdDate: dateOnly,
          note: "",
          coordinator: "",
        });
      });

      console.log(`[QAReportTab] QA Notes parsed: ${notes.length} notes`);
    } catch (e) {
      console.error("[QAReportTab] QA Notes parse error:", e);
    }

    return notes;
  }

  // ==========================================================================
  // Data Processing (Story 8.5)
  // ==========================================================================

  private mergeAndSortData(
    censusPatients: CensusPatient[],
    qaNotes: QANote[]
  ): QAReportItem[] {
    // Build a map of latest QA note by admission ID
    const qaMap = new Map<string, QANote>();

    qaNotes.forEach((note) => {
      const existing = qaMap.get(note.admissionId);
      if (
        !existing ||
        this.compareDates(note.createdDate, existing.createdDate) > 0
      ) {
        qaMap.set(note.admissionId, note);
      }
    });

    // Merge with census patients
    const reportItems: QAReportItem[] = censusPatients.map((patient) => {
      const qaNote = qaMap.get(patient.admissionId);
      const daysAgo = qaNote ? this.calculateDaysAgo(qaNote.createdDate) : null;

      return {
        admissionId: patient.admissionId,
        patientName: patient.patientName,
        phones: patient.phones,
        address: patient.address,
        lastQADaysAgo: daysAgo,
        lastQADate: qaNote?.createdDate || null,
        lastQANote: qaNote?.note || null,
        priority: this.calculatePriority(daysAgo),
        coordinator: patient.coordinator,
        primaryContract: patient.primaryContract,
      };
    });

    // Sort: 从未联系优先，然后按天数降序
    reportItems.sort((a, b) => {
      // 从未联系的排最前
      if (a.lastQADaysAgo === null && b.lastQADaysAgo !== null) return -1;
      if (a.lastQADaysAgo !== null && b.lastQADaysAgo === null) return 1;
      if (a.lastQADaysAgo === null && b.lastQADaysAgo === null) return 0;
      // 天数多的排前面
      return b.lastQADaysAgo! - a.lastQADaysAgo!;
    });

    // Story 9.1: 保存原始顺序用于重置
    this.originalData = [...reportItems];
    // 重置排序状态
    this.sortState = { column: null, direction: "none" };

    return reportItems;
  }

  private calculateDaysAgo(dateStr: string): number {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const diffTime = today.getTime() - date.getTime();
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  private calculatePriority(daysAgo: number | null): QAReportItem["priority"] {
    if (daysAgo === null) return "critical";
    if (daysAgo > 120) return "high";
    if (daysAgo > 90) return "medium-high";
    if (daysAgo > 30) return "medium";
    if (daysAgo > 15) return "low-medium";
    return "low";
  }

  private compareDates(date1: string, date2: string): number {
    return new Date(date1).getTime() - new Date(date2).getTime();
  }

  // ==========================================================================
  // Sorting (Story 9.1)
  // ==========================================================================

  /**
   * 处理表头排序点击
   * 三态循环: none → asc → desc → none
   */
  private handleSort(column: SortableColumn): void {
    if (this.sortState.column === column) {
      // 同一列：切换状态 none → asc → desc → none
      const nextDirection: Record<SortDirection, SortDirection> = {
        none: "asc",
        asc: "desc",
        desc: "none",
      };
      this.sortState.direction = nextDirection[this.sortState.direction];
      if (this.sortState.direction === "none") {
        this.sortState.column = null;
      }
    } else {
      // 新列：从 asc 开始
      this.sortState.column = column;
      this.sortState.direction = "asc";
    }

    this.applySorting();
    this.renderData();
  }

  /**
   * 应用当前排序状态到数据
   */
  private applySorting(): void {
    if (this.sortState.direction === "none" || !this.sortState.column) {
      // 恢复原始顺序
      this.qaReportData = [...this.originalData];
      return;
    }

    const multiplier = this.sortState.direction === "asc" ? 1 : -1;

    this.qaReportData = [...this.originalData].sort((a, b) => {
      switch (this.sortState.column) {
        case "id":
          return multiplier * a.admissionId.localeCompare(b.admissionId);
        case "name":
          return multiplier * a.patientName.localeCompare(b.patientName);
        case "lastQA":
          // null (从未联系) 视为最大值，在升序时排最后，降序时排最前
          const aVal = a.lastQADaysAgo ?? Infinity;
          const bVal = b.lastQADaysAgo ?? Infinity;
          return multiplier * (aVal - bVal);
        default:
          return 0;
      }
    });
  }

  /**
   * 获取排序图标
   */
  private getSortIcon(column: SortableColumn): string {
    if (
      this.sortState.column !== column ||
      this.sortState.direction === "none"
    ) {
      return '<span class="sort-icon sort-none">⇅</span>';
    }
    return this.sortState.direction === "asc"
      ? '<span class="sort-icon sort-asc">▲</span>'
      : '<span class="sort-icon sort-desc">▼</span>';
  }

  // ==========================================================================
  // Rendering (Story 8.6, 8.7, 8.8)
  // ==========================================================================

  // ==========================================================================
  // Patient Details (Story 9.3 & 9.5)
  // ==========================================================================

  /**
   * 获取病人详情（电话号码和 Profile ID）
   * 使用缓存避免重复请求
   */
  private async getPatientDetails(
    admissionId: string
  ): Promise<PatientSearchResult> {
    // 检查缓存
    if (this.patientDetailsCache.has(admissionId)) {
      return this.patientDetailsCache.get(admissionId)!;
    }

    try {
      const result = await this.fetchPatientDetails(admissionId);
      this.patientDetailsCache.set(admissionId, result);
      return result;
    } catch (e) {
      console.error(
        `[QAReportTab] Failed to fetch patient details for ${admissionId}:`,
        e
      );
      return { phones: [], profileId: null };
    }
  }

  /**
   * 通过 Admission ID 获取病人电话号码和 Profile ID
   */
  private async fetchPatientDetails(
    admissionId: string
  ): Promise<PatientSearchResult> {
    try {
      const url =
        PATIENT_SEARCH_BY_NUMBER_URL.replace("{ADMISSION_ID}", admissionId) +
        PATIENT_SEARCH_PARAMS +
        `&_=${Date.now()}`;

      const response = await GM_fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        console.error(
          `[QAReportTab] Failed to fetch patient details for ${admissionId}: HTTP ${response.status}`
        );
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      return this.parsePatientSearchResult(html);
    } catch (error) {
      console.error(
        `[QAReportTab] Error fetching patient details for ${admissionId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * 解析搜索结果 HTML，提取电话号码和 Profile ID
   */
  private parsePatientSearchResult(html: string): PatientSearchResult {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const rows = doc.querySelectorAll("#tdSearchResults tbody tr");

    if (rows.length === 0) {
      return { phones: [], profileId: null };
    }

    // 取第一行结果
    const row = rows[0];
    const cells = row.querySelectorAll("td");

    // 更健壮的电话号码查找：遍历所有单元格，找到包含电话号码格式的单元格
    // 电话号码格式: "332-265-6219, 929-685-6363, 347-323-3536" 或单个号码
    // 严格匹配：必须是 xxx-xxx-xxxx 或 xxx.xxx.xxxx 或 xxxxxxxxxx 格式，且只包含数字和分隔符
    let phones: string[] = [];
    // 匹配整个字符串为电话号码格式（3位-3位-4位，分隔符可选）
    const strictPhonePattern = /^\d{3}[-.]?\d{3}[-.]?\d{4}$/;

    for (let i = 0; i < cells.length; i++) {
      const cellText = cells[i]?.textContent?.trim() || "";
      // 先检查单元格是否包含电话号码特征（去掉非数字字符后至少10位）
      const digitsOnly = cellText.replace(/\D/g, "");
      if (digitsOnly.length >= 10) {
        // 按逗号分割，每个部分独立验证
        const parts = cellText.split(",").map((p) => p.trim());
        const validPhones = parts.filter((p) => strictPhonePattern.test(p));

        if (validPhones.length > 0) {
          phones = validPhones;
          break; // 找到第一个有效的电话单元格就停止
        }
      }
    }

    // Profile ID 从 onclick 属性提取
    const link = row.querySelector('a[onclick*="RedirectToPatientPage"]');
    const onclickAttr = link?.getAttribute("onclick") || "";
    const match = onclickAttr.match(/RedirectToPatientPage\((\d+)/);
    const profileId = match ? match[1] : null;

    return { phones, profileId };
  }

  /**
   * 显示电话号码下拉框
   */
  private showPhoneDropdown(phones: string[], anchorEl: HTMLElement): void {
    // 移除已有下拉框
    document.querySelector(".phone-dropdown")?.remove();

    const dropdown = document.createElement("div");
    dropdown.className = "phone-dropdown";

    phones.forEach((phone) => {
      const item = document.createElement("a");
      item.className = "phone-dropdown-item";
      item.href = `tel:${phone.replace(/\D/g, "")}`;
      item.innerHTML = `📞 ${phone}`;
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        // tel: 协议会自动处理
      });
      dropdown.appendChild(item);
    });

    // 定位到锚点元素下方
    const rect = anchorEl.getBoundingClientRect();
    const dropdownWidth = 160; // minWidth

    // 计算 left 位置，确保不超出屏幕右边缘
    let leftPos = rect.left;
    const viewportWidth = window.innerWidth;
    if (leftPos + dropdownWidth > viewportWidth - 10) {
      // 如果会超出右边缘，则向左调整
      leftPos = viewportWidth - dropdownWidth - 10;
    }
    // 确保不会超出左边缘
    if (leftPos < 10) {
      leftPos = 10;
    }

    // 设置完整的内联样式（因为 dropdown 添加到 body，CSS 选择器无法匹配）
    // z-index 必须高于面板容器的 99999
    Object.assign(dropdown.style, {
      position: "fixed",
      top: `${rect.bottom + 4}px`,
      left: `${leftPos}px`,
      zIndex: "100001",
      minWidth: `${dropdownWidth}px`,
      padding: "4px 0",
      background: "white",
      border: "1px solid #e0e0e0",
      borderRadius: "4px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    });

    // 设置下拉项样式并添加 hover 效果
    dropdown.querySelectorAll(".phone-dropdown-item").forEach((item) => {
      const el = item as HTMLElement;

      // 设置基础样式
      Object.assign(el.style, {
        display: "block",
        padding: "8px 12px",
        color: "#333",
        fontFamily: "Monaco, Menlo, Consolas, monospace",
        fontSize: "13px",
        textDecoration: "none",
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
      });

      // 添加 hover 效果
      el.addEventListener("mouseenter", () => {
        el.style.background = "#f5f5f5";
        el.style.color = "#1890ff";
      });

      el.addEventListener("mouseleave", () => {
        el.style.background = "";
        el.style.color = "#333";
      });
    });

    // 点击外部关闭
    const closeHandler = (e: MouseEvent) => {
      if (!dropdown.contains(e.target as Node)) {
        dropdown.remove();
        document.removeEventListener("click", closeHandler);
      }
    };
    setTimeout(() => document.addEventListener("click", closeHandler), 0);

    document.body.appendChild(dropdown);
  }

  /**
   * 渲染电话号码单元格
   */
  private renderPhoneCell(item: QAReportItem, td: HTMLElement): void {
    td.className = "col-phone phone-cell";
    td.innerHTML = '<span class="phone-loading">加载中...</span>';

    // 异步获取电话号码
    this.getPatientDetails(item.admissionId)
      .then((details) => {
        if (details.phones.length === 0) {
          td.innerHTML = '<span class="phone-none">-</span>';
        } else if (details.phones.length === 1) {
          // 单个电话号码：直接显示，可点击拨打
          const phone = details.phones[0];
          td.innerHTML = `<a class="phone-single" href="tel:${phone.replace(
            /\D/g,
            ""
          )}">${phone}</a>`;
        } else {
          // 多个电话号码：显示 ⋯，点击展开下拉框
          // Store phones data on the element for event delegation
          td.innerHTML = `<button class="phone-multiple" data-phones="${encodeURIComponent(
            JSON.stringify(details.phones)
          )}" title="点击查看 ${details.phones.length} 个电话">⋯</button>`;
        }
      })
      .catch(() => {
        td.innerHTML = '<span class="phone-error">获取失败</span>';
      });
  }

  private renderData(): void {
    if (!this.contentBodyEl) return;

    // 如果没有数据，显示空状态
    if (this.qaReportData.length === 0) {
      this.renderEmptyState("无数据", "当前 Coordinator 没有找到病人数据");
      return;
    }

    if (this.viewMode === "list") {
      this.renderListView();
    } else {
      this.renderGridView();
    }
  }

  private renderEmptyState(
    title: string = "QA 报告",
    message: string = "选择辅导员并点击'加载'开始"
  ): void {
    if (!this.contentBodyEl) return;

    this.contentBodyEl.innerHTML = `
      <div class="qa-empty-state">
        <div class="qa-empty-icon">📋</div>
        <div class="qa-empty-title">${title}</div>
        <div class="qa-empty-text">${message}</div>
      </div>
    `;
  }

  private renderListView(): void {
    if (!this.contentBodyEl) return;

    const table = document.createElement("table");
    table.className = "qa-report-table";

    // Header with sortable columns (Story 9.1)
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    // ID 列 - 可排序
    const thId = document.createElement("th");
    thId.className = "col-id sortable";
    thId.innerHTML = `ID ${this.getSortIcon("id")}`;
    thId.addEventListener("click", () => this.handleSort("id"));
    headerRow.appendChild(thId);

    // 病人姓名列 - 可排序
    const thName = document.createElement("th");
    thName.className = "col-name sortable";
    thName.innerHTML = `病人姓名 ${this.getSortIcon("name")}`;
    thName.addEventListener("click", () => this.handleSort("name"));
    headerRow.appendChild(thName);

    // 电话号码列 - 不可排序 (Story 9.3)
    const thPhone = document.createElement("th");
    thPhone.className = "col-phone";
    thPhone.textContent = "电话号码";
    headerRow.appendChild(thPhone);

    // 上次 QA 列 - 可排序
    const thLastQA = document.createElement("th");
    thLastQA.className = "col-qa sortable";
    thLastQA.innerHTML = `上次 QA ${this.getSortIcon("lastQA")}`;
    thLastQA.addEventListener("click", () => this.handleSort("lastQA"));
    headerRow.appendChild(thLastQA);

    // 操作列 - 不可排序
    const thAction = document.createElement("th");
    thAction.className = "col-action";
    thAction.textContent = "操作";
    headerRow.appendChild(thAction);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement("tbody");

    this.qaReportData.forEach((item) => {
      const tr = document.createElement("tr");
      tr.className = `priority-${item.priority}`;

      const qaDisplay = this.formatQADisplay(item.lastQADaysAgo);
      const qaClass = item.lastQADaysAgo === null ? "qa-never" : "";

      // Create row with static cells
      const qaTooltip = item.lastQADate || "从未联系";
      tr.innerHTML = `
        <td class="col-id">${item.admissionId}</td>
        <td class="col-name">${item.patientName}</td>
        <td class="col-phone"></td>
        <td class="col-qa ${qaClass}" style="border-left: 4px solid ${
        PRIORITY_COLORS[item.priority]
      }" title="${qaTooltip}">${qaDisplay}</td>
        <td class="col-action">
          <button class="qa-action-btn" data-id="${item.admissionId}">⋮</button>
        </td>
      `;

      // Async render phone cell (Story 9.3)
      const phoneCell = tr.querySelector(".col-phone") as HTMLElement;
      if (phoneCell) {
        this.renderPhoneCell(item, phoneCell);
      }

      // Action button click handler
      const actionBtn = tr.querySelector(".qa-action-btn");
      actionBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showActionMenu(item, actionBtn as HTMLElement);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    this.contentBodyEl.innerHTML = "";
    this.contentBodyEl.appendChild(table);

    // Event delegation for phone-multiple buttons (fix: inline addEventListener doesn't work in async context)
    this.setupPhoneButtonDelegation();
  }

  /**
   * Setup event delegation for phone-multiple buttons
   * This is needed because buttons created in async Promise callbacks don't retain event handlers
   */
  private setupPhoneButtonDelegation(): void {
    if (!this.contentBodyEl) return;

    // Remove existing handler if any
    this.contentBodyEl.removeEventListener(
      "click",
      this.handlePhoneButtonClick
    );

    // Add delegated click handler
    this.contentBodyEl.addEventListener("click", this.handlePhoneButtonClick);
  }

  /**
   * Delegated click handler for phone buttons
   */
  private handlePhoneButtonClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("phone-multiple")) {
      e.stopPropagation();
      const phonesData = target.getAttribute("data-phones");
      if (phonesData) {
        try {
          const phones = JSON.parse(decodeURIComponent(phonesData));
          this.showPhoneDropdown(phones, target);
        } catch (err) {
          console.error("[QAReportTab] Failed to parse phone data:", err);
        }
      }
    }
  };

  private renderGridView(): void {
    if (!this.contentBodyEl) return;

    const grid = document.createElement("div");
    grid.className = "qa-report-grid";

    this.qaReportData.forEach((item) => {
      const card = document.createElement("div");
      card.className = `qa-card priority-${item.priority}`;
      card.style.borderLeftColor = PRIORITY_COLORS[item.priority];
      card.style.backgroundColor = this.hexToRgba(
        PRIORITY_COLORS[item.priority],
        0.08
      );

      const qaTooltip = item.lastQADate || "从未联系";
      card.innerHTML = `
        <div class="card-header">
          <span class="card-name">${item.patientName}</span>
          <button class="card-action-btn" data-id="${
            item.admissionId
          }">⋮</button>
        </div>
        <div class="card-id">${item.admissionId}</div>
        <div class="card-phones"></div>
        <div class="card-qa" style="color: ${
          PRIORITY_COLORS[item.priority]
        }" title="${qaTooltip}">
          ${this.formatQADisplay(item.lastQADaysAgo)}
        </div>
        <div class="card-priority-badge" style="background: ${
          PRIORITY_COLORS[item.priority]
        }">
          ${PRIORITY_LABELS[item.priority]}
        </div>
      `;

      // Async render phone cell (Story 9.3)
      const phoneContainer = card.querySelector(".card-phones") as HTMLElement;
      if (phoneContainer) {
        this.renderPhoneCell(item, phoneContainer);
      }

      // Action button click handler
      const actionBtn = card.querySelector(".card-action-btn");
      actionBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showActionMenu(item, actionBtn as HTMLElement);
      });

      grid.appendChild(card);
    });

    this.contentBodyEl.innerHTML = "";
    this.contentBodyEl.appendChild(grid);

    // Event delegation for phone-multiple buttons
    this.setupPhoneButtonDelegation();
  }

  private formatQADisplay(daysAgo: number | null): string {
    if (daysAgo === null) return "从未联系";
    if (daysAgo === 0) return "今天";
    if (daysAgo === 1) return "昨天";
    return `${daysAgo} 天前`;
  }

  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return phone;
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // ==========================================================================
  // View Toggle (Story 8.8)
  // ==========================================================================

  private setViewMode(mode: ViewMode): void {
    if (this.viewMode === mode) return;

    this.viewMode = mode;
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);

    // Update toggle buttons
    const buttons = this.viewToggleEl?.querySelectorAll(".qa-view-btn");
    buttons?.forEach((btn, index) => {
      btn.classList.toggle(
        "active",
        (index === 0 && mode === "list") || (index === 1 && mode === "grid")
      );
    });

    // Re-render if data exists
    if (this.qaReportData.length > 0) {
      this.renderData();
    }
  }

  // ==========================================================================
  // Export (Story 8.9)
  // ==========================================================================

  private showExportMenu(): void {
    // Remove existing menu
    document.querySelector(".qa-export-menu")?.remove();

    const menu = document.createElement("div");
    menu.className = "qa-export-menu";

    menu.innerHTML = `
      <div class="export-menu-item" data-format="csv">📄 导出 CSV</div>
      <div class="export-menu-item" data-format="json">📋 导出 JSON</div>
    `;

    // Position menu near export button
    const btnRect = this.exportBtnEl!.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.top = `${btnRect.bottom + 4}px`;
    menu.style.left = `${btnRect.left}px`;

    // Click handlers
    menu.querySelectorAll(".export-menu-item").forEach((item) => {
      item.addEventListener("click", () => {
        const format = (item as HTMLElement).dataset.format;
        if (format === "csv") this.exportToCSV();
        else if (format === "json") this.exportToJSON();
        menu.remove();
      });
    });

    // Close on outside click
    const closeHandler = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove();
        document.removeEventListener("click", closeHandler);
      }
    };
    setTimeout(() => document.addEventListener("click", closeHandler), 0);

    document.body.appendChild(menu);
  }

  private exportToCSV(): void {
    const BOM = "\uFEFF";
    const headers = [
      "Admission ID",
      "Patient Name",
      "Phone",
      "Last QA",
      "Priority",
    ];

    const rows = this.qaReportData.map((item) => [
      item.admissionId,
      item.patientName,
      item.phones.map((p) => p.phone).join("; "),
      item.lastQADaysAgo === null ? "Never" : `${item.lastQADaysAgo} days ago`,
      PRIORITY_LABELS[item.priority],
    ]);

    const csv =
      BOM +
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

    const coordinatorName = this.getSelectedCoordinatorName();
    const date = new Date().toISOString().split("T")[0];
    this.downloadFile(
      csv,
      `QA_Report_${coordinatorName}_${date}.csv`,
      "text/csv"
    );
  }

  private exportToJSON(): void {
    const json = JSON.stringify(this.qaReportData, null, 2);
    const coordinatorName = this.getSelectedCoordinatorName();
    const date = new Date().toISOString().split("T")[0];
    this.downloadFile(
      json,
      `QA_Report_${coordinatorName}_${date}.json`,
      "application/json"
    );
  }

  private downloadFile(
    content: string,
    filename: string,
    mimeType: string
  ): void {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private getSelectedCoordinatorName(): string {
    const coordinator = this.coordinators.find(
      (c) => c.ID === this.selectedCoordinatorId
    );
    return coordinator?.Text?.split(" ")[0] || "Unknown";
  }

  // ==========================================================================
  // Action Menu (Story 8.10)
  // ==========================================================================

  private showActionMenu(item: QAReportItem, anchorEl: HTMLElement): void {
    // Remove existing menu
    document.querySelector(".qa-action-menu")?.remove();

    const menu = document.createElement("div");
    menu.className = "qa-action-menu";

    menu.innerHTML = `
      <div class="action-menu-item" data-action="create-note">📝 快速创建 QA Note</div>
      <div class="action-menu-item" data-action="view-patient">📋 查看病人详情</div>
    `;

    // Position menu near anchor
    const rect = anchorEl.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.left = `${rect.left - 150}px`;

    // Click handlers
    menu.querySelectorAll(".action-menu-item").forEach((menuItem) => {
      menuItem.addEventListener("click", () => {
        const action = (menuItem as HTMLElement).dataset.action;
        this.handleAction(action!, item);
        menu.remove();
      });
    });

    // Close on outside click
    const closeHandler = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove();
        document.removeEventListener("click", closeHandler);
      }
    };
    setTimeout(() => document.addEventListener("click", closeHandler), 0);

    document.body.appendChild(menu);
  }

  private handleAction(action: string, item: QAReportItem): void {
    switch (action) {
      case "create-note":
        this.showQuickNoteModal(item);
        break;
      case "view-patient":
        // Story 9.5: Open patient profile using cached Profile ID
        this.openPatientProfile(item);
        break;
    }
  }

  /**
   * Story 9.6: Submit QA note via API directly
   * Endpoint: POST /Patient/PatientGeneralNotesIFrame.aspx/PatientSaveNote2
   * ReasonID 2289535 = "Quality Assurance"
   */
  private async submitQANote(
    item: QAReportItem,
    noteMessage: string
  ): Promise<void> {
    // 1. Get API params
    const params = await this.apiProvider.getParams();

    // 2. Get patient's profile ID (required as PatientID in the API)
    const details = await this.getPatientDetails(item.admissionId);
    if (!details.profileId) {
      throw new Error("无法获取病人 Profile ID");
    }

    const baseUrl = ApiParamProvider.getTenantBaseUrl();
    const url = `${baseUrl}/Patient/PatientGeneralNotesIFrame.aspx/PatientSaveNote2`;

    // All numeric fields must be actual numbers (not strings) — server expects Int32
    const officeId = parseInt(params.vendorID, 10) || 469;
    const patientId = parseInt(details.profileId!, 10);

    const payload = {
      UserID: params.userID,
      PatientNoteId: -1, // -1 = new note
      Message: encodeURIComponent(noteMessage),
      ReasonID: 2289535, // Quality Assurance
      ReasonText: encodeURIComponent("Quality Assurance"),
      Priority: "Normal",
      Status: "Open",
      FromDate: "",
      VendorText: "-1",
      RoleName: "",
      PatientID: patientId,
      InternalNote: "Yes",
      ReplyPatientNoteId: -1,
      ThreadID: -1,
      EmailTo: "",
      ProviderOfficeID: officeId,
      Type: 0, // required Int32, 0 = standard note
      FromDateChangeInService: "",
      ToDateChangeInService: "",
      ReplacementCaregiver: -1,
      CaregiverID: -1,
      PayerID: -1,
      ProviderID: officeId,
      CaregiverReasonID: -1,
      NoteType: -1,
      RecipientType: "",
      RecipientGlobalID: "",
      RecipientName: "",
      FormId: "",
      FormSubmissionId: "",
      FormName: "",
    };

    console.log("[QAReportTab] Submitting QA note payload:", payload);

    const result = await this.gmPost(url, payload);

    // Parse inner JSON (ASP.NET PageMethod returns { d: "[...]" })
    const inner =
      typeof result.d === "string" ? JSON.parse(result.d) : result.d;
    if (Array.isArray(inner) && inner.length > 0 && inner[0].ErrorDetail) {
      throw new Error(inner[0].ErrorDetail);
    }

    console.log("[QAReportTab] QA note submitted successfully:", inner);
  }

  /**
   * Story 9.5: Open patient profile in new tab using Profile ID
   */
  private async openPatientProfile(item: QAReportItem): Promise<void> {
    try {
      const details = await this.getPatientDetails(item.admissionId);

      if (details.profileId) {
        const url = PATIENT_PROFILE_URL_TEMPLATE.replace(
          "{ID}",
          details.profileId
        );
        window.open(url, "_blank");
      } else {
        this.showError("无法获取病人资料链接");
      }
    } catch (error) {
      console.error("[QAReportTab] Failed to get patient profile:", error);
      this.showError("获取病人信息失败");
    }
  }

  /**
   * Story 9.3: Handle call action using cached phone numbers
   */
  private async handleCallAction(item: QAReportItem): Promise<void> {
    try {
      const details = await this.getPatientDetails(item.admissionId);

      if (details.phones.length === 0) {
        this.showError("没有可用的电话号码");
      } else if (details.phones.length === 1) {
        window.open(`tel:${details.phones[0]}`, "_self");
      } else {
        // Multiple phones - let user choose
        this.showInfo(
          `该病人有 ${details.phones.length} 个电话号码，请从表格中选择拨打`
        );
      }
    } catch (error) {
      console.error("[QAReportTab] Failed to get phone numbers:", error);
      this.showError("获取电话号码失败");
    }
  }

  /**
   * Story 9.6: Show quick note creation modal
   */
  private showQuickNoteModal(item: QAReportItem): void {
    // Remove existing modal if any
    document.querySelector(".qa-note-modal-overlay")?.remove();

    // Default QA note template
    const defaultNote = `Quality assurance call made to patient. Pt confirmed no hospitalizations, rehab admissions, or falls within the past 30 days. Address and contact information remain unchanged. Pt expressed satisfaction with current services, aide, and hours, and has no further questions at this time.`;

    // Create modal overlay
    const overlay = document.createElement("div");
    overlay.className = "qa-note-modal-overlay";

    overlay.innerHTML = `
      <div class="qa-note-modal">
        <div class="qa-note-modal-header">
          <div class="qa-note-modal-title">
            📝 快速创建 QA Note - ${item.patientName} (${item.admissionId})
          </div>
          <button class="qa-note-modal-close" type="button">×</button>
        </div>
        <div class="qa-note-modal-body">
          <div class="qa-note-section">
            <label class="qa-note-label">将提交以下 QA 记录:</label>
            <div class="qa-note-template">${defaultNote}</div>
          </div>
          <div class="qa-note-section">
            <label class="qa-note-label" for="qa-additional-note">附加备注 (可选):</label>
            <textarea 
              id="qa-additional-note" 
              class="qa-note-textarea" 
              placeholder="在此输入任何附加信息..."
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="qa-note-modal-footer">
          <button class="qa-note-btn qa-note-btn-cancel" type="button">取消</button>
          <button class="qa-note-btn qa-note-btn-submit" type="button">提交并关闭</button>
        </div>
      </div>
    `;

    // Event handlers
    const closeModal = () => overlay.remove();

    // Close button
    overlay
      .querySelector(".qa-note-modal-close")
      ?.addEventListener("click", closeModal);

    // Cancel button
    overlay
      .querySelector(".qa-note-btn-cancel")
      ?.addEventListener("click", closeModal);

    // Submit button
    overlay
      .querySelector(".qa-note-btn-submit")
      ?.addEventListener("click", async () => {
        const additionalNote = (
          overlay.querySelector("#qa-additional-note") as HTMLTextAreaElement
        )?.value?.trim();
        const fullNote = additionalNote
          ? `${defaultNote}\n\n${additionalNote}`
          : defaultNote;

        const submitBtn = overlay.querySelector(
          ".qa-note-btn-submit"
        ) as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.textContent = "提交中...";

        try {
          await this.submitQANote(item, fullNote);
          closeModal();
          this.showSuccess(`QA Note 已成功提交 - ${item.patientName}`);
        } catch (e) {
          console.error("[QAReportTab] Failed to submit QA note:", e);
          submitBtn.disabled = false;
          submitBtn.textContent = "提交并关闭";
          this.showError("提交失败: " + (e as Error).message);
        }
      });

    // ESC key to close
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);

    // Append to body
    document.body.appendChild(overlay);

    // Focus on textarea
    setTimeout(() => {
      (
        overlay.querySelector("#qa-additional-note") as HTMLTextAreaElement
      )?.focus();
    }, 100);
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  /**
   * Get complete OfficeIDs dynamically from API
   * The JWT token only contains a single office (469), but we need all offices for complete data.
   * This implementation is ported from VisitMonitor.ts getMessageOfficeIds()
   */
  private async getCompleteOfficeIds(): Promise<string> {
    // Use cached value if available (5 minute cache)
    const CACHE_EXPIRY_MS = 5 * 60 * 1000;
    const now = Date.now();
    if (
      this.cachedOfficeIds &&
      this.officeIdsCacheTimestamp &&
      now - this.officeIdsCacheTimestamp < CACHE_EXPIRY_MS
    ) {
      console.log(
        `[QAReportTab] Using cached OfficeIDs: ${this.cachedOfficeIds}`
      );
      return this.cachedOfficeIds;
    }

    try {
      // Get API params from session
      const session = await this.apiProvider.getSessionInfo();

      // Get appSecret from ApiParamProvider
      const fullParams = await this.apiProvider.getParams();

      // Build base URL dynamically
      const baseUrl = `https://app.hhaexchange.com/ENTP${session.version.replace(
        ".",
        ""
      )}010000`;

      console.log(
        `[QAReportTab] Fetching OfficeIDs from: ${baseUrl}/api/Common/GetAllOffices`
      );

      const response = await this.gmPostWithHeaders(
        `${baseUrl}/api/Common/GetAllOffices`,
        {
          appVersion: session.appVersion,
          version: session.version,
          minorVersion: session.minorVersion,
          userID: session.userId,
          SelectionType: "filter",
          PermissionName: "Smart Map Beta",
        },
        {
          appsecret: fullParams.appSecret,
          appname: session.appVersion,
        }
      );

      // Check if response is valid array
      if (!Array.isArray(response)) {
        console.warn(
          `[QAReportTab] GetAllOffices returned non-array, falling back to JWT token`
        );
        return this.apiProvider.getOfficeIdsFromToken();
      }

      // Only include Type: "1" offices (actual offices, not groups/parents)
      const officeIds = response
        .filter(
          (o: { OfficeID: number; Type: string }) =>
            o.OfficeID > 0 && o.Type === "1"
        )
        .map((o: { OfficeID: number }) => o.OfficeID)
        .join(",");

      if (!officeIds) {
        console.warn(
          `[QAReportTab] No valid offices found, falling back to JWT token`
        );
        return this.apiProvider.getOfficeIdsFromToken();
      }

      // Cache the result
      this.cachedOfficeIds = officeIds;
      this.officeIdsCacheTimestamp = now;
      console.log(
        `[QAReportTab] Fetched complete OfficeIDs: ${this.cachedOfficeIds}`
      );

      return this.cachedOfficeIds;
    } catch (e) {
      console.error("[QAReportTab] Failed to fetch complete OfficeIDs:", e);
      // Fall back to JWT token on error
      return this.apiProvider.getOfficeIdsFromToken();
    }
  }

  private async getSessionInfo(): Promise<ReportsSessionInfo> {
    const session = await this.apiProvider.getSessionInfo();

    // Get complete OfficeIDs dynamically from API
    // JWT token only has single office (469), but we need all offices for complete data
    const completeOfficeIds = await this.getCompleteOfficeIds();
    session.officeIds = completeOfficeIds;

    return session;
  }

  /**
   * Initialize reports.hhaexchange.com session by accessing a report page
   * This establishes the necessary cookies for AjaxPro API calls
   *
   * @see Similar to VisitMonitor's apiParamProvider.get() which fetches CallMaintenance page
   */
  private reportsSessionInitialized = false;
  private reportsSessionTimestamp = 0;
  private static readonly REPORTS_SESSION_TTL_MS = 25 * 60 * 1000; // 25 min

  private async initializeReportsSession(): Promise<void> {
    // Re-initialize if session has expired (use a shorter TTL than backend to be safe)
    const sessionAge = Date.now() - this.reportsSessionTimestamp;
    if (
      this.reportsSessionInitialized &&
      sessionAge < QAReportTab.REPORTS_SESSION_TTL_MS
    ) {
      return;
    }

    try {
      const sessionInfo = await this.getSessionInfo();

      // Access Census by Coordinator report page to establish session
      const reportUrl = `https://reports.hhaexchange.com/HHAReportsML/Reports/CensusbyCoordinator.aspx?s=${sessionInfo.sessionId}&Version=${sessionInfo.version}&MinorVersion=${sessionInfo.minorVersion}&AppVersion=${sessionInfo.appVersion}`;

      console.log("[QAReportTab] Initializing reports session...");

      const response = await GM_fetch(reportUrl, {
        method: "GET",
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        console.warn(
          `[QAReportTab] Session init returned HTTP ${response.status}`
        );
      }

      // Mark as initialized with timestamp
      this.reportsSessionInitialized = true;
      this.reportsSessionTimestamp = Date.now();
      // Also clear the ApiParamProvider reports cache so it re-extracts fresh session
      this.apiProvider.clearReportsCache();
      console.log("[QAReportTab] Reports session initialized successfully");
    } catch (e) {
      console.error("[QAReportTab] Failed to initialize reports session:", e);
      // Don't throw - allow API calls to proceed and fail with better error messages
    }
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    if (this.loadBtnEl) {
      this.loadBtnEl.disabled = loading;
      this.loadBtnEl.innerHTML = loading ? "⏳ 加载中..." : "🔄 加载";
    }
  }

  private showError(message: string): void {
    this.showToast(message, "error");
  }

  private showSuccess(message: string): void {
    this.showToast(message, "success");
  }

  private showInfo(message: string): void {
    this.showToast(message, "info");
  }

  private showToast(message: string, type: "success" | "error" | "info"): void {
    const toast = document.createElement("div");
    toast.className = `qa-toast qa-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  private loadState(): void {
    const savedView = localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as ViewMode;
    if (savedView) {
      this.viewMode = savedView;
    }
  }

  // ==========================================================================
  // GM API Wrappers (使用 GM_fetch 而非 GM_xmlhttpRequest)
  // ==========================================================================

  private async gmGet(url: string): Promise<any> {
    const response = await GM_fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await (response as any).rawBody.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private async gmGetText(url: string): Promise<string> {
    const response = await GM_fetch(url, {
      method: "GET",
      credentials: "include", // 包含cookies用于身份验证
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await (response as any).rawBody.text();
  }

  /**
   * Fetch the first page of ASP.NET ReportViewer report and extract pagination info
   * Returns HTML content, total pages, and form fields for subsequent page requests
   */
  private async fetchReportFirstPage(url: string): Promise<{
    html: string;
    totalPages: number;
    formFields: Record<string, string>;
  }> {
    // Step 1: Initial GET request to get __VIEWSTATE and all form fields
    const initialResponse = await GM_fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!initialResponse.ok) {
      throw new Error(`Initial GET failed: HTTP ${initialResponse.status}`);
    }

    const initialHtml = await (initialResponse as any).rawBody.text();

    // Extract ALL hidden form fields from initial response
    const formFields = this.extractAllFormFields(initialHtml);

    if (!formFields["__VIEWSTATE"]) {
      console.warn("[QAReportTab] __VIEWSTATE not found, using initial HTML");
      return { html: initialHtml, totalPages: 1, formFields };
    }

    // Step 2: Build async POST request for first page
    const asyncText = await this.postReportPage(url, formFields);

    // Step 3: Parse response and extract total pages
    const html = this.parseUpdatePanelResponse(asyncText);
    const totalPages = this.extractTotalPages(html);

    // Update formFields with new __VIEWSTATE from response
    const newViewState = this.extractViewStateFromResponse(asyncText);
    if (newViewState) {
      formFields["__VIEWSTATE"] = newViewState;
    }

    return { html, totalPages, formFields };
  }

  /**
   * Fetch a specific page of ASP.NET ReportViewer report
   */
  private async fetchReportPage(
    url: string,
    pageNumber: number,
    formFields: Record<string, string>
  ): Promise<string> {
    // Build form data for page navigation
    const formData = new URLSearchParams();

    // For page navigation, use the CurrentPage control as EVENTTARGET
    formData.append(
      "ScriptManager1",
      "ScriptManager1|ReportViewer$ctl05$ctl00$CurrentPage"
    );
    formData.append("__EVENTTARGET", "ReportViewer$ctl05$ctl00$CurrentPage");
    formData.append("__EVENTARGUMENT", "");

    // Add __VIEWSTATE and __VIEWSTATEGENERATOR
    formData.append("__VIEWSTATE", formFields["__VIEWSTATE"]);
    if (formFields["__VIEWSTATEGENERATOR"]) {
      formData.append(
        "__VIEWSTATEGENERATOR",
        formFields["__VIEWSTATEGENERATOR"]
      );
    }

    // Add all ReportViewer control fields with the new page number
    formData.append(
      "ReportViewer$ctl03$ctl00",
      formFields["ReportViewer$ctl03$ctl00"] || ""
    );
    formData.append(
      "ReportViewer$ctl03$ctl01",
      formFields["ReportViewer$ctl03$ctl01"] || ""
    );
    formData.append(
      "ReportViewer$ctl10",
      formFields["ReportViewer$ctl10"] || "ltr"
    );
    formData.append(
      "ReportViewer$ctl11",
      formFields["ReportViewer$ctl11"] || "standards"
    );
    formData.append("ReportViewer$AsyncWait$HiddenCancelField", "False");
    formData.append("ReportViewer$ToggleParam$store", "");
    formData.append("ReportViewer$ToggleParam$collapse", "false");
    // CRITICAL: Set the page number here
    formData.append("ReportViewer$ctl05$ctl00$CurrentPage", String(pageNumber));
    formData.append(
      "ReportViewer$ctl05$ctl03$ctl00",
      formFields["ReportViewer$ctl05$ctl03$ctl00"] || ""
    );
    formData.append("ReportViewer$ctl08$ClientClickedId", "");
    formData.append("ReportViewer$ctl07$store", "");
    formData.append("ReportViewer$ctl07$collapse", "false");
    formData.append("ReportViewer$ctl09$VisibilityState$ctl00", "ReportPage");
    formData.append("ReportViewer$ctl09$ScrollPosition", "");
    formData.append("ReportViewer$ctl09$ReportControl$ctl02", "");
    formData.append("ReportViewer$ctl09$ReportControl$ctl03", "");
    formData.append("ReportViewer$ctl09$ReportControl$ctl04", "100");
    formData.append("__ASYNCPOST", "true");

    const asyncResponse = await GM_fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-MicrosoftAjax": "Delta=true",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
      body: formData.toString(),
    });

    if (!asyncResponse.ok) {
      throw new Error(
        `Page ${pageNumber} POST failed: HTTP ${asyncResponse.status}`
      );
    }

    const asyncText = await (asyncResponse as any).rawBody.text();
    const html = this.parseUpdatePanelResponse(asyncText);

    // Update formFields with new __VIEWSTATE for next page
    const newViewState = this.extractViewStateFromResponse(asyncText);
    if (newViewState) {
      formFields["__VIEWSTATE"] = newViewState;
    }

    return html;
  }

  /**
   * Post request to get report page content
   */
  private async postReportPage(
    url: string,
    formFields: Record<string, string>
  ): Promise<string> {
    const formData = new URLSearchParams();

    // Add special async postback fields FIRST (order matters for ASP.NET)
    formData.append(
      "ScriptManager1",
      "ScriptManager1|ReportViewer$ctl09$Reserved_AsyncLoadTarget"
    );
    formData.append(
      "__EVENTTARGET",
      "ReportViewer$ctl09$Reserved_AsyncLoadTarget"
    );
    formData.append("__EVENTARGUMENT", "");

    // Add __VIEWSTATE and __VIEWSTATEGENERATOR
    formData.append("__VIEWSTATE", formFields["__VIEWSTATE"]);
    if (formFields["__VIEWSTATEGENERATOR"]) {
      formData.append(
        "__VIEWSTATEGENERATOR",
        formFields["__VIEWSTATEGENERATOR"]
      );
    }

    // Add all ReportViewer control fields
    formData.append(
      "ReportViewer$ctl03$ctl00",
      formFields["ReportViewer$ctl03$ctl00"] || ""
    );
    formData.append(
      "ReportViewer$ctl03$ctl01",
      formFields["ReportViewer$ctl03$ctl01"] || ""
    );
    formData.append(
      "ReportViewer$ctl10",
      formFields["ReportViewer$ctl10"] || "ltr"
    );
    formData.append(
      "ReportViewer$ctl11",
      formFields["ReportViewer$ctl11"] || "standards"
    );
    formData.append(
      "ReportViewer$AsyncWait$HiddenCancelField",
      formFields["ReportViewer$AsyncWait$HiddenCancelField"] || "False"
    );
    formData.append(
      "ReportViewer$ToggleParam$store",
      formFields["ReportViewer$ToggleParam$store"] || ""
    );
    formData.append(
      "ReportViewer$ToggleParam$collapse",
      formFields["ReportViewer$ToggleParam$collapse"] || "false"
    );
    formData.append(
      "ReportViewer$ctl05$ctl00$CurrentPage",
      formFields["ReportViewer$ctl05$ctl00$CurrentPage"] || ""
    );
    formData.append(
      "ReportViewer$ctl05$ctl03$ctl00",
      formFields["ReportViewer$ctl05$ctl03$ctl00"] || ""
    );
    formData.append(
      "ReportViewer$ctl08$ClientClickedId",
      formFields["ReportViewer$ctl08$ClientClickedId"] || ""
    );
    formData.append(
      "ReportViewer$ctl07$store",
      formFields["ReportViewer$ctl07$store"] || ""
    );
    formData.append(
      "ReportViewer$ctl07$collapse",
      formFields["ReportViewer$ctl07$collapse"] || "false"
    );
    formData.append(
      "ReportViewer$ctl09$VisibilityState$ctl00",
      formFields["ReportViewer$ctl09$VisibilityState$ctl00"] || "None"
    );
    formData.append(
      "ReportViewer$ctl09$ScrollPosition",
      formFields["ReportViewer$ctl09$ScrollPosition"] || ""
    );
    formData.append(
      "ReportViewer$ctl09$ReportControl$ctl02",
      formFields["ReportViewer$ctl09$ReportControl$ctl02"] || ""
    );
    formData.append(
      "ReportViewer$ctl09$ReportControl$ctl03",
      formFields["ReportViewer$ctl09$ReportControl$ctl03"] || ""
    );
    formData.append(
      "ReportViewer$ctl09$ReportControl$ctl04",
      formFields["ReportViewer$ctl09$ReportControl$ctl04"] || "100"
    );
    formData.append("__ASYNCPOST", "true");

    const asyncResponse = await GM_fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-MicrosoftAjax": "Delta=true",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
      body: formData.toString(),
    });

    if (!asyncResponse.ok) {
      throw new Error(`Async POST failed: HTTP ${asyncResponse.status}`);
    }

    return await (asyncResponse as any).rawBody.text();
  }

  /**
   * Extract total page count from report HTML
   * Looks for pattern like "Page 1 of 3" or "Page  1 of 3"
   */
  private extractTotalPages(html: string): number {
    // Pattern: "Page  X of Y" (ASP.NET ReportViewer format)
    const pageMatch = html.match(/Page\s+\d+\s+of\s+(\d+)/i);
    if (pageMatch) {
      return parseInt(pageMatch[1], 10);
    }
    return 1; // Default to 1 page if pattern not found
  }

  /**
   * Extract new __VIEWSTATE from async postback response
   */
  private extractViewStateFromResponse(response: string): string | null {
    // Format: |length|hiddenField|__VIEWSTATE|value|
    const viewStateMatch = response.match(
      /\|(\d+)\|hiddenField\|__VIEWSTATE\|([^|]+)\|/
    );
    if (viewStateMatch) {
      return viewStateMatch[2];
    }
    return null;
  }

  /**
   * Fetch ASP.NET ReportViewer report using async postback
   * The ReportViewer uses UpdatePanel which requires a two-step process:
   * 1. Initial GET to get __VIEWSTATE and ALL form fields
   * 2. Async POST to trigger report rendering (AsyncLoadTarget) with ALL fields
   *
   * CRITICAL: The server returns different content based on which form fields are sent.
   * We must send ALL hidden form fields to get the full report with ReportArea panel.
   */
  private async fetchReportWithAsyncPostback(url: string): Promise<string> {
    // Step 1: Initial GET request to get __VIEWSTATE and all form fields
    const initialResponse = await GM_fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!initialResponse.ok) {
      throw new Error(`Initial GET failed: HTTP ${initialResponse.status}`);
    }

    const initialHtml = await (initialResponse as any).rawBody.text();

    // Extract ALL hidden form fields from initial response
    const formFields = this.extractAllFormFields(initialHtml);

    if (!formFields["__VIEWSTATE"]) {
      console.warn("[QAReportTab] __VIEWSTATE not found, using initial HTML");
      return initialHtml;
    }

    // Step 2: Build async POST request with ALL form fields
    // This mimics exactly what the browser does for UpdatePanel async postback
    const formData = new URLSearchParams();

    // Add special async postback fields FIRST (order matters for ASP.NET)
    formData.append(
      "ScriptManager1",
      "ScriptManager1|ReportViewer$ctl09$Reserved_AsyncLoadTarget"
    );
    formData.append(
      "__EVENTTARGET",
      "ReportViewer$ctl09$Reserved_AsyncLoadTarget"
    );
    formData.append("__EVENTARGUMENT", "");

    // Add __VIEWSTATE and __VIEWSTATEGENERATOR
    formData.append("__VIEWSTATE", formFields["__VIEWSTATE"]);
    if (formFields["__VIEWSTATEGENERATOR"]) {
      formData.append(
        "__VIEWSTATEGENERATOR",
        formFields["__VIEWSTATEGENERATOR"]
      );
    }

    // Add all ReportViewer control fields (these are CRITICAL for getting full report)
    formData.append(
      "ReportViewer$ctl03$ctl00",
      formFields["ReportViewer$ctl03$ctl00"] || ""
    );
    formData.append(
      "ReportViewer$ctl03$ctl01",
      formFields["ReportViewer$ctl03$ctl01"] || ""
    );
    formData.append(
      "ReportViewer$ctl10",
      formFields["ReportViewer$ctl10"] || "ltr"
    );
    formData.append(
      "ReportViewer$ctl11",
      formFields["ReportViewer$ctl11"] || "standards"
    );
    formData.append(
      "ReportViewer$AsyncWait$HiddenCancelField",
      formFields["ReportViewer$AsyncWait$HiddenCancelField"] || "False"
    );
    formData.append(
      "ReportViewer$ToggleParam$store",
      formFields["ReportViewer$ToggleParam$store"] || ""
    );
    formData.append(
      "ReportViewer$ToggleParam$collapse",
      formFields["ReportViewer$ToggleParam$collapse"] || "false"
    );
    formData.append(
      "ReportViewer$ctl05$ctl00$CurrentPage",
      formFields["ReportViewer$ctl05$ctl00$CurrentPage"] || ""
    );
    formData.append(
      "ReportViewer$ctl05$ctl03$ctl00",
      formFields["ReportViewer$ctl05$ctl03$ctl00"] || ""
    );
    formData.append(
      "ReportViewer$ctl08$ClientClickedId",
      formFields["ReportViewer$ctl08$ClientClickedId"] || ""
    );
    formData.append(
      "ReportViewer$ctl07$store",
      formFields["ReportViewer$ctl07$store"] || ""
    );
    formData.append(
      "ReportViewer$ctl07$collapse",
      formFields["ReportViewer$ctl07$collapse"] || "false"
    );
    formData.append(
      "ReportViewer$ctl09$VisibilityState$ctl00",
      formFields["ReportViewer$ctl09$VisibilityState$ctl00"] || "None"
    );
    formData.append(
      "ReportViewer$ctl09$ScrollPosition",
      formFields["ReportViewer$ctl09$ScrollPosition"] || ""
    );
    formData.append(
      "ReportViewer$ctl09$ReportControl$ctl02",
      formFields["ReportViewer$ctl09$ReportControl$ctl02"] || ""
    );
    formData.append(
      "ReportViewer$ctl09$ReportControl$ctl03",
      formFields["ReportViewer$ctl09$ReportControl$ctl03"] || ""
    );
    formData.append(
      "ReportViewer$ctl09$ReportControl$ctl04",
      formFields["ReportViewer$ctl09$ReportControl$ctl04"] || "100"
    );

    // Add async post flag LAST
    formData.append("__ASYNCPOST", "true");

    const asyncResponse = await GM_fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-MicrosoftAjax": "Delta=true",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
      body: formData.toString(),
    });

    if (!asyncResponse.ok) {
      throw new Error(`Async POST failed: HTTP ${asyncResponse.status}`);
    }

    const asyncText = await (asyncResponse as any).rawBody.text();

    // Step 3: Parse UpdatePanel response to extract HTML
    // Response format: 1|#||4|length|updatePanel|panelId|<html content>|...
    const reportHtml = this.parseUpdatePanelResponse(asyncText);

    return reportHtml;
  }

  /**
   * Extract all form fields (hidden inputs) from HTML
   * This is critical for ASP.NET UpdatePanel to return the correct content
   */
  private extractAllFormFields(html: string): Record<string, string> {
    const fields: Record<string, string> = {};

    // Match all hidden input fields and text inputs
    const inputRegex = /<input[^>]*type=["']?(?:hidden|text)["']?[^>]*>/gi;
    const matches = html.match(inputRegex) || [];

    for (const input of matches) {
      // Extract name and value attributes
      const nameMatch = input.match(/name=["']([^"']+)["']/i);
      const valueMatch = input.match(/value=["']([^"']*)["']/i);

      if (nameMatch) {
        const name = nameMatch[1];
        const value = valueMatch ? valueMatch[1] : "";
        // Decode HTML entities in the value
        fields[name] = this.decodeHtmlEntities(value);
      }
    }

    return fields;
  }

  /**
   * Decode HTML entities in a string
   */
  private decodeHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/");
  }

  /**
   * Parse ASP.NET UpdatePanel response format to extract HTML content
   * Format: 1|#||4|length|updatePanel|panelId|content|length|updatePanel|panelId|content|...
   *
   * The key insight is that we need to use the LENGTH prefix to properly extract content,
   * because the content itself may contain pipe characters.
   */
  private parseUpdatePanelResponse(response: string): string {
    // Strategy: Look for ReportArea panel using regex with length-based extraction
    // The actual format from browser is: |62065|updatePanel|ReportViewer_ctl09_ReportArea|<content>

    // Try multiple regex patterns to find ReportArea
    const patterns = [
      /\|(\d+)\|updatePanel\|ReportViewer_ctl09_ReportArea\|/, // Exact match
      /\|(\d+)\|updatePanel\|([^|]*ReportArea[^|]*)\|/, // Contains ReportArea
      /\|(\d+)\|updatePanel\|(ReportViewer_ctl09[^|]*)\|/, // Any ctl09 panel
    ];

    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match) {
        const contentLength = parseInt(match[1], 10);
        const matchEnd = match.index! + match[0].length;

        // Extract content starting from matchEnd with the specified length
        const content = response.substring(matchEnd, matchEnd + contentLength);

        // Verify content has patient data patterns
        if (
          content.includes("AHC-") ||
          content.includes("AMD-") ||
          content.includes('VALIGN="top"')
        ) {
          return content;
        }
      }
    }

    // Fallback: Try to find any large HTML content with patient data patterns
    // Look for DIV with report content that contains patient data
    const divMatch = response.match(
      /<DIV[^>]*dir="LTR"[^>]*>[\s\S]*?(?=<\/DIV>)/gi
    );
    if (divMatch) {
      // Find the largest DIV that contains patient ID patterns
      const patientDivs = divMatch.filter(
        (d) => d.includes("AHC-") || d.includes("AMD-")
      );
      if (patientDivs.length > 0) {
        const largestPatientDiv = patientDivs.reduce((a, b) =>
          a.length > b.length ? a : b
        );
        return largestPatientDiv;
      }
    }

    // Look for table content that might contain patient rows
    const tableMatch = response.match(
      /<TABLE[^>]*CELLSPACING[^>]*>[\s\S]*?<\/TABLE>/gi
    );
    if (tableMatch) {
      // Find tables that contain patient data
      const patientTables = tableMatch.filter(
        (t) => t.includes("AHC-") || t.includes("AMD-")
      );
      if (patientTables.length > 0) {
        return patientTables.reduce((a, b) => (a.length > b.length ? a : b));
      }
      // If no patient tables, still return the largest table
      return tableMatch.reduce((a, b) => (a.length > b.length ? a : b));
    }

    // Last resort: return the whole response
    return response;
  }

  private async gmPost(url: string, data: any): Promise<any> {
    const response = await GM_fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include", // 包含cookies用于身份验证
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await (response as any).rawBody.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  /**
   * POST request with custom headers (for app.hhaexchange.com APIs)
   */
  private async gmPostWithHeaders(
    url: string,
    data: any,
    customHeaders: Record<string, string>
  ): Promise<any> {
    const response = await GM_fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        ...customHeaders,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await (response as any).rawBody.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private async gmPostAjaxPro(
    url: string,
    method: string,
    data: any
  ): Promise<string> {
    const response = await GM_fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=UTF-8",
        "X-AjaxPro-Method": method,
      },
      credentials: "include", // 包含cookies用于身份验证
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await (response as any).rawBody.text();
  }
}
