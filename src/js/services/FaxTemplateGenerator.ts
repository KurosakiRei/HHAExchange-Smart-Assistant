/**
 * FaxTemplateGenerator Service
 * Epic 17, Story 17-5: 渲染 fax_cover_sheet.docx 模板并触发下载
 */
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import templateBase64 from "../../assets/fax_cover_sheet.docx";

export interface FaxParams {
  // 自动填充（只读）
  insurance_name: string;
  insurance_fax: string;
  insurance_phone: string;
  date: string; // MM/DD/YYYY
  patient_name: string;
  patient_dob: string;
  // 用户每次输入
  pages: string; // 默认 '1'
  command: string;
  body: string;
  // 用户配置（持久化）
  from_line: string;
  signature_block: string;
}

/**
 * 将 FaxParams 渲染进模板，返回 Blob。
 * docxtemplater 启用 linebreaks: true，{body} / {signature_block} 中 \n 转为 <w:br/>。
 */
export function generate(params: FaxParams): Blob {
  // templateBase64 由 webpack asset/inline 生成：可能是 "data:...;base64,<b64>" 或裸 base64
  const b64 = templateBase64.includes(",")
    ? templateBase64.split(",")[1]
    : templateBase64;
  const binary = atob(b64);

  const zip = new PizZip(binary, { base64: false });
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(params);

  const blob = doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  return blob;
}

/**
 * 触发浏览器 Save As 下载。
 * filename 格式：PatientName AdmissionID InsuranceName MMDDYYYY.docx
 */
export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 生成文件名，格式：PatientName AdmissionID InsuranceName MMDDYYYY.docx
 */
export function buildFilename(
  patientName: string,
  patientId: string,
  insuranceName: string
): string {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const yyyy = today.getFullYear();
  const dateStr = `${mm}${dd}${yyyy}`;

  const parts = [patientName, patientId, insuranceName, dateStr].map((s) =>
    (s || "").replace(/[\\/:*?"<>|]/g, "").trim()
  );

  return parts.filter(Boolean).join(" ") + ".docx";
}
