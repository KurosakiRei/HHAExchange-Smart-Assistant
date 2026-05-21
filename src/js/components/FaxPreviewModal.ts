/**
 * FaxPreviewModal Component
 * Epic 17, Story 17-6: 传真模板预览 & 下载弹窗
 */
import GM_fetch from "@trim21/gm-fetch";
import { ApiParamProvider } from "../services/ApiParamProvider";
import { ProfileData } from "../services/ProfileDataExtractor";
import { InsuranceRecord } from "../utils/InsuranceMatcher";
import {
  generate,
  download,
  buildFilename,
} from "../services/FaxTemplateGenerator";

export interface FaxPreviewModalOptions {
  profileData: ProfileData;
  insuranceName: string;
  insuranceRecord: InsuranceRecord | null;
  initialCommand?: string;
  initialBody?: string;
  onClose?: () => void;
}

const CONFIG_KEY = "hha_fax_template_config";

interface FaxConfig {
  from_line: string;
  signature_block: string;
}

const DEFAULT_FAX_CONFIG: FaxConfig = {
  from_line: "Tao Yang Ext. 503",
  signature_block: `Tao Yang

Always Home Care.
Case Coordinator.
3131 Coney Island Ave
Brookly NY 11235
718-843-8430
Ext. 503.
Tyang@alwaysNY.net
`,
};

export class FaxPreviewModal {
  private overlay: HTMLElement | null = null;
  private options: FaxPreviewModalOptions;
  private escHandler: ((e: KeyboardEvent) => void) | null = null;
  private wheelHandler: ((e: WheelEvent) => void) | null = null;

  constructor(options: FaxPreviewModalOptions) {
    this.options = options;
  }

  open(): void {
    const config = this.loadConfig();
    const { profileData, insuranceName, insuranceRecord } = this.options;
    const initialCommand = this.options.initialCommand || "";
    const initialBody = this.options.initialBody || "";

    const faxNumber = insuranceRecord?.fax || "—";
    const phoneNumber = insuranceRecord?.phone || "—";
    const patientName = profileData.name || "";
    const patientDob = profileData.dob || "";
    const today = new Date();
    const date = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
      today.getDate()
    ).padStart(2, "0")}/${today.getFullYear()}`;

    // Create overlay — reuse template-modal-* classes for consistent UI style
    this.overlay = document.createElement("div");
    this.overlay.className = "template-modal-overlay fax-modal-overlay";
    this.overlay.innerHTML = `
      <div class="template-modal fax-modal" role="dialog" aria-modal="true" aria-label="创建传真模板">
        <div class="template-modal-header">
          <span class="template-modal-title">创建传真模板</span>
          <button class="template-modal-close fax-modal-close" title="关闭">×</button>
        </div>
        <div class="template-modal-body fax-modal-body">
          <div class="fax-info-grid">
            <span class="fax-ig-label">收件方</span><span class="fax-ig-value">${this.esc(
              insuranceName
            )}</span>
            <span class="fax-ig-label">日期</span><span class="fax-ig-value">${this.esc(
              date
            )}</span>
            <span class="fax-ig-label">传真号</span><span class="fax-ig-value">${this.esc(
              faxNumber
            )}</span>
            <span class="fax-ig-label">电话</span><span class="fax-ig-value">${this.esc(
              phoneNumber
            )}</span>
            <span class="fax-ig-label">病人</span><span class="fax-ig-value">${this.esc(
              patientName
            )}</span>
            <span class="fax-ig-label">DOB</span><span class="fax-ig-value">${this.esc(
              patientDob
            )}</span>
          </div>
          <div class="fax-form-section">
            <div class="fax-field-row">
              <label class="fax-field-label" for="fax-pages">页数</label>
              <input id="fax-pages" class="template-form-input fax-pages-input" type="number" min="1" step="1" value="1" />
            </div>
            <div class="fax-field-row">
              <label class="fax-field-label" for="fax-command">简述</label>
              <input id="fax-command" class="template-form-input" type="text" placeholder="例：请更新患者电话" value="${this.esc(
                initialCommand
              )}" />
            </div>
            <div class="fax-field-row">
              <label class="fax-field-label" for="fax-body">正文</label>
              <textarea id="fax-body" class="template-form-input fax-field-textarea" placeholder="正文内容...">${this.esc(
                initialBody
              )}</textarea>
            </div>
          </div>
          <div class="fax-config-section">
            <div class="fax-config-title">── 发件人配置 ──</div>
            <div class="fax-field-row">
              <label class="fax-field-label" for="fax-from">来自：</label>
              <input id="fax-from" class="template-form-input" type="text" placeholder="例：Tao Yang Ext. 503" value="${this.esc(
                config.from_line
              )}" />
            </div>
            <div class="fax-field-row">
              <label class="fax-field-label" for="fax-sig">签名区</label>
              <textarea id="fax-sig" class="template-form-input fax-field-textarea fax-sig-textarea" placeholder="多行签名内容...">${this.esc(
                config.signature_block
              )}</textarea>
            </div>
            <div class="fax-config-actions">
              <button class="template-modal-btn btn-cancel" id="fax-save-config">保存配置</button>
            </div>
          </div>
        </div>
        <div class="fax-modal-footer">
          <button class="template-modal-btn btn-save" id="fax-open-note" style="margin-right:auto;">创建General Notes</button>
          <button class="template-modal-btn btn-cancel" id="fax-cancel">取消</button>
          <button class="template-modal-btn btn-save" id="fax-download">下载 .docx</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    // Event bindings
    this.overlay
      .querySelector(".fax-modal-close")!
      .addEventListener("click", () => this.close());
    this.overlay
      .querySelector("#fax-cancel")!
      .addEventListener("click", () => this.close());
    this.overlay
      .querySelector("#fax-save-config")!
      .addEventListener("click", () => this.saveConfig());
    this.overlay
      .querySelector("#fax-download")!
      .addEventListener("click", () => this.handleDownload(date));
    this.overlay
      .querySelector("#fax-open-note")!
      .addEventListener("click", () => this.openGeneralNoteModal());

    // Esc closes modal
    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.querySelector(".fax-note-modal-overlay")) {
          return;
        }
        this.close();
      }
    };
    document.addEventListener("keydown", this.escHandler);

    // Prevent scroll penetration: block wheel events on the backdrop from
    // reaching the underlying page. Events inside .fax-modal-body are allowed
    // through (overscroll-behavior:contain in CSS handles the boundary case).
    this.wheelHandler = (e: WheelEvent) => {
      const modalBody = this.overlay?.querySelector(".fax-modal-body");
      if (!modalBody || !modalBody.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    this.overlay.addEventListener("wheel", this.wheelHandler, {
      passive: false,
    });
  }

  private handleDownload(date: string): void {
    if (!this.overlay) return;
    const { profileData, insuranceName, insuranceRecord } = this.options;
    const pagesInput =
      this.overlay.querySelector<HTMLInputElement>("#fax-pages")!;
    const pagesVal = pagesInput.valueAsNumber;
    const pages =
      Number.isFinite(pagesVal) && pagesVal >= 1
        ? String(Math.floor(pagesVal))
        : "1";

    const params = {
      insurance_name: insuranceName,
      insurance_fax: insuranceRecord?.fax || "",
      insurance_phone: insuranceRecord?.phone || "",
      date,
      patient_name: profileData.name || "",
      patient_dob: profileData.dob || "",
      pages,
      command:
        this.overlay.querySelector<HTMLInputElement>("#fax-command")!.value,
      body: this.overlay.querySelector<HTMLTextAreaElement>("#fax-body")!.value,
      from_line:
        this.overlay.querySelector<HTMLInputElement>("#fax-from")!.value,
      signature_block:
        this.overlay.querySelector<HTMLTextAreaElement>("#fax-sig")!.value,
    };

    const blob = generate(params);
    const filename = buildFilename(
      profileData.name,
      profileData.id,
      insuranceName
    );
    download(blob, filename);
  }

  private saveConfig(): void {
    if (!this.overlay) return;
    const from_line =
      this.overlay.querySelector<HTMLInputElement>("#fax-from")!.value;
    const signature_block =
      this.overlay.querySelector<HTMLTextAreaElement>("#fax-sig")!.value;
    GM_setValue(CONFIG_KEY, { from_line, signature_block });
  }

  private loadConfig(): FaxConfig {
    const saved = GM_getValue<FaxConfig | string | null>(CONFIG_KEY, null);

    if (saved === null || saved === undefined || saved === "") {
      return { ...DEFAULT_FAX_CONFIG };
    }

    let parsed: Partial<FaxConfig>;
    if (typeof saved === "string") {
      try {
        parsed = JSON.parse(saved) as Partial<FaxConfig>;
      } catch {
        return { ...DEFAULT_FAX_CONFIG };
      }
    } else {
      parsed = saved;
    }

    return {
      from_line:
        typeof parsed.from_line === "string"
          ? parsed.from_line
          : DEFAULT_FAX_CONFIG.from_line,
      signature_block:
        typeof parsed.signature_block === "string"
          ? parsed.signature_block
          : DEFAULT_FAX_CONFIG.signature_block,
    };
  }

  private showToast(message: string, type: "success" | "error"): void {
    const toast = document.createElement("div");
    toast.className = `qa-toast qa-toast-${type}`;
    toast.textContent = message;
    toast.style.zIndex = "100010";
    (this.overlay || document.body).appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  private showCloseConfirm(onConfirm: () => void, message: string): void {
    document.getElementById("fax-close-confirm")?.remove();

    const box = document.createElement("div");
    box.id = "fax-close-confirm";
    box.className = "timesheet-confirm-overlay";
    box.innerHTML = `
      <div class="timesheet-confirm-box">
        <p>${this.esc(message)}</p>
        <div class="timesheet-confirm-actions">
          <button id="fax-close-cancel" class="template-modal-btn btn-cancel">取消</button>
          <button id="fax-close-confirm-btn" class="template-modal-btn btn-save">确认关闭</button>
        </div>
      </div>
    `;

    document.body.appendChild(box);

    box.querySelector("#fax-close-cancel")?.addEventListener("click", () => {
      box.remove();
    });
    box
      .querySelector("#fax-close-confirm-btn")
      ?.addEventListener("click", () => {
        box.remove();
        onConfirm();
      });
  }

  private openGeneralNoteModal(): void {
    if (!this.overlay) return;

    document.querySelector(".fax-note-modal-overlay")?.remove();

    const defaultNote = (
      this.overlay.querySelector<HTMLTextAreaElement>("#fax-body")?.value || ""
    ).trim();

    const safePatient = this.esc(this.options.profileData.name || "Patient");
    const safeAdmission = this.esc(this.options.profileData.id || "-");

    const noteOverlay = document.createElement("div");
    noteOverlay.className = "qa-note-modal-overlay fax-note-modal-overlay";
    noteOverlay.style.zIndex = "100004";
    noteOverlay.innerHTML = `
      <div class="qa-note-modal">
        <div class="qa-note-modal-header">
          <div class="qa-note-modal-title">📝 创建 General Notes - ${safePatient} (${safeAdmission})</div>
          <button class="qa-note-modal-close" type="button">&times;</button>
        </div>
        <div class="qa-note-modal-body">
          <div class="qa-note-section">
            <label class="qa-note-label" for="fax-note-full">General Notes 内容 (可编辑):</label>
            <textarea
              id="fax-note-full"
              class="qa-note-textarea"
              placeholder="请输入或编辑 General Notes 内容..."
              rows="15"
            ></textarea>
          </div>
        </div>
        <div class="qa-note-modal-footer">
          <button class="qa-note-btn qa-note-btn-cancel" type="button">取消</button>
          <button class="qa-note-btn qa-note-btn-submit" type="button">提交并关闭</button>
        </div>
      </div>
    `;

    const closeModal = () => {
      noteOverlay.remove();
      document.removeEventListener("keydown", escHandler);
    };

    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    noteOverlay
      .querySelector(".qa-note-modal-close")
      ?.addEventListener("click", closeModal);
    noteOverlay
      .querySelector(".qa-note-btn-cancel")
      ?.addEventListener("click", closeModal);

    noteOverlay
      .querySelector(".qa-note-btn-submit")
      ?.addEventListener("click", async () => {
        const submitBtn = noteOverlay.querySelector(
          ".qa-note-btn-submit"
        ) as HTMLButtonElement;
        const note = (
          noteOverlay.querySelector("#fax-note-full") as HTMLTextAreaElement
        )?.value?.trim();

        if (!note) {
          this.showToast("⚠️ General Notes 内容不能为空", "error");
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "提交中...";

        try {
          await this.submitGeneralNote(note);
          closeModal();
          this.showToast("✅ General Notes 已创建", "success");
        } catch (e) {
          console.error("[FaxPreviewModal] Failed to create General Notes:", e);
          submitBtn.disabled = false;
          submitBtn.textContent = "提交并关闭";
          this.showToast(`⚠️ 创建失败: ${(e as Error).message}`, "error");
        }
      });

    document.addEventListener("keydown", escHandler);
    document.body.appendChild(noteOverlay);

    const textarea = noteOverlay.querySelector(
      "#fax-note-full"
    ) as HTMLTextAreaElement;
    textarea.value = defaultNote;

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }, 50);
  }

  private resolvePatientProfileId(): number {
    const params = new URLSearchParams(window.location.search);
    let raw =
      params.get("PatientID") ||
      params.get("PatientId") ||
      params.get("Patientid") ||
      "";

    if (!raw) {
      for (const [key, value] of params.entries()) {
        if (key.toLowerCase() === "patientid" && value) {
          raw = value;
          break;
        }
      }
    }

    const parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      throw new Error("无法获取病人 Profile ID");
    }

    return parsed;
  }

  private async submitGeneralNote(noteMessage: string): Promise<void> {
    const params = await ApiParamProvider.getInstance().getParams();
    const baseUrl = ApiParamProvider.getTenantBaseUrl();

    const patientId = this.resolvePatientProfileId();
    const reason = await this.resolveCalendarNoteReason(baseUrl, patientId);
    const officeId = parseInt(params.vendorID, 10) || 469;

    const payload = {
      UserID: params.userID,
      PatientNoteId: -1,
      Message: encodeURIComponent(noteMessage),
      ReasonID: reason.id,
      ReasonText: encodeURIComponent(reason.text),
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
      Type: 0,
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

    const url = `${baseUrl}/Patient/PatientGeneralNotesIFrame.aspx/PatientSaveNote2`;
    const result = await this.postJson(url, payload);

    let inner = result?.d;
    if (typeof inner === "string") {
      try {
        inner = JSON.parse(inner);
      } catch {
        throw new Error("创建 Note 返回格式异常");
      }
    }

    if (Array.isArray(inner) && inner.length > 0 && inner[0]?.ErrorDetail) {
      throw new Error(inner[0].ErrorDetail);
    }
  }

  private async resolveCalendarNoteReason(
    baseUrl: string,
    patientId: number
  ): Promise<{ id: number; text: string }> {
    const url = `${baseUrl}/Patient/PatientGeneralNotesIFrame.aspx?PatientID=${patientId}`;
    const r = (await GM_fetch(url, {
      method: "GET",
      credentials: "include",
    })) as Response & { rawBody: Blob };
    const html = await r.rawBody.text();

    const doc = new DOMParser().parseFromString(html, "text/html");
    const target = Array.from(doc.querySelectorAll("option")).find((opt) =>
      /calendar\s*note/i.test((opt.textContent || "").trim())
    );

    if (target) {
      const reasonId = parseInt(target.getAttribute("value") || "", 10);
      if (Number.isFinite(reasonId)) {
        return {
          id: reasonId,
          text: (target.textContent || "Calendar Note").trim(),
        };
      }
    }

    const fromApi = await this.resolveCalendarNoteReasonFromNotificationApi();
    if (fromApi) return fromApi;

    throw new Error(
      "未找到 Calendar Note 的 ReasonID，请确认当前租户已配置该 Note 类型"
    );
  }

  private async resolveCalendarNoteReasonFromNotificationApi(): Promise<{
    id: number;
    text: string;
  } | null> {
    const params = await ApiParamProvider.getInstance().getParams();
    const messageApiBase = `https://app.hhaexchange.com/ENTP${params.version.replace(
      ".",
      ""
    )}010000`;

    const authHeaders = {
      appsecret: params.appSecret,
      appname: params.appName,
    };

    const offices = await this.postJsonWithHeaders(
      `${messageApiBase}/api/Common/GetAllOffices`,
      {
        appVersion: params.appVersion,
        version: params.version,
        minorVersion: params.minorVersion,
        userID: params.userID,
        SelectionType: "filter",
        PermissionName: "Smart Map Beta",
      },
      authHeaders
    );

    const officeIds = Array.isArray(offices)
      ? offices
          .filter(
            (o: { OfficeID: number; Type: string }) =>
              o.OfficeID > 0 && o.Type === "1"
          )
          .map((o: { OfficeID: number }) => o.OfficeID)
      : [];

    if (officeIds.length === 0) {
      return null;
    }

    const payerData = await this.postJsonWithHeaders(
      `${messageApiBase}/api/PayerNotification/GetContractPayersList`,
      {
        appVersion: params.appVersion,
        version: params.version,
        minorVersion: params.minorVersion,
        userID: params.userID,
        vendorId: "469",
        listOfficeId: officeIds,
        internalNote: "Both",
      },
      authHeaders
    );

    const payerList = Array.isArray(payerData?.ListPayers)
      ? payerData.ListPayers
      : [];
    const payerIds = payerList
      .map((p: { PayerId: number }) => p.PayerId)
      .filter((n: number) => Number.isFinite(n));
    const payerMap = payerList.map(
      (p: { PayerId: number; LinkedContractChhaId: number }) => ({
        key: p.PayerId,
        value: p.LinkedContractChhaId || 0,
      })
    );

    const reasons = await this.postJsonWithHeaders(
      `${messageApiBase}/api/PayerNotification/GetNotificationReasonsNewLook`,
      {
        appVersion: params.appVersion,
        version: params.version,
        minorVersion: params.minorVersion,
        userID: params.userID,
        ListPayerId: payerIds,
        InternalID: -1,
        ListPayerIdWithContractChhaId: payerMap,
        PayerCount: payerIds.length,
        CommunicationType: 2,
      },
      authHeaders
    );

    if (!Array.isArray(reasons)) {
      return null;
    }

    const normalized = reasons
      .map((r: { ReasonId?: number; Reason?: string }) => ({
        id: Number(r.ReasonId),
        text: String(r.Reason || "").trim(),
      }))
      .filter((r: { id: number; text: string }) => Number.isFinite(r.id));

    const exact = normalized.find(
      (r: { id: number; text: string }) =>
        r.text.toLowerCase() === "calendar note"
    );
    if (exact) return exact;

    const fuzzy = normalized.find((r: { id: number; text: string }) =>
      /calendar\s*note/i.test(r.text)
    );
    return fuzzy || null;
  }

  private async postJson(url: string, payload: unknown): Promise<any> {
    const r = (await GM_fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })) as Response & { rawBody: Blob };

    if (!r.ok) {
      throw new Error(`HTTP ${r.status}`);
    }

    const text = await r.rawBody.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private async postJsonWithHeaders(
    url: string,
    payload: unknown,
    extraHeaders: Record<string, string>
  ): Promise<any> {
    const r = (await GM_fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...extraHeaders,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })) as Response & { rawBody: Blob };

    if (!r.ok) {
      throw new Error(`HTTP ${r.status}`);
    }

    const text = await r.rawBody.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  close(): void {
    if (this.overlay) {
      const command = (
        this.overlay.querySelector<HTMLInputElement>("#fax-command")?.value ||
        ""
      ).trim();
      const body = (
        this.overlay.querySelector<HTMLTextAreaElement>("#fax-body")?.value ||
        ""
      ).trim();
      if (command !== "" || body !== "") {
        this.showCloseConfirm(
          () => this.destroy(),
          "⚠️ 你已有输入内容尚未下载，关闭将清空所有输入。确认关闭？"
        );
        return;
      }
    }
    this.destroy();
  }

  destroy(): void {
    if (this.escHandler) {
      document.removeEventListener("keydown", this.escHandler);
      this.escHandler = null;
    }
    if (this.wheelHandler && this.overlay) {
      this.overlay.removeEventListener("wheel", this.wheelHandler);
      this.wheelHandler = null;
    }
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    document.getElementById("fax-close-confirm")?.remove();
    this.options.onClose?.();
  }

  private esc(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
