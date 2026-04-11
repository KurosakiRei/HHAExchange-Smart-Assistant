/**
 * InsuranceMatcher Utility
 * Epic 17, Story 17-4: 根据显示名匹配 insurances.json 条目
 */
import insurancesData from "../../assets/insurances.json";

export interface InsuranceRecord {
  company_name: string;
  aliases: string[];
  phone: string;
  fax: string;
}

const insurances = insurancesData as InsuranceRecord[];

/**
 * 根据保险显示名从 insurances.json 中匹配条目。
 * 匹配顺序：
 *  1. company_name 精确匹配（忽略大小写）
 *  2. aliases 数组任一精确匹配（忽略大小写）
 *  3. 返回 null
 */
export function matchInsurance(displayName: string): InsuranceRecord | null {
  if (!displayName) return null;
  const needle = displayName.trim().toLowerCase();

  for (const record of insurances) {
    if (record.company_name.toLowerCase() === needle) {
      return record;
    }
    if (record.aliases.some((alias) => alias.toLowerCase() === needle)) {
      return record;
    }
  }

  return null;
}
