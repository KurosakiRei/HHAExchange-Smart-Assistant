export type DateFormatPreset =
  | "compactSameYear"
  | "compactSameYearDash"
  | "compactSameYearDot"
  | "fullYear"
  | "fullYearDash"
  | "fullYearDot"
  | "monthDayOnly"
  | "monthDayOnlyDash"
  | "monthDayOnlyDot";

type DateFormatMode = "compactSameYear" | "fullYear" | "monthDayOnly";

interface DatePresetConfig {
  mode: DateFormatMode;
  separator: "/" | "-" | ".";
}

export const DATE_FORMAT_PRESET_OPTIONS: Array<{
  value: DateFormatPreset;
  label: string;
}> = [
  { value: "compactSameYear", label: "同年紧凑（MM/DD, ... /YYYY）" },
  { value: "compactSameYearDash", label: "同年紧凑（MM-DD, ... -YYYY）" },
  { value: "compactSameYearDot", label: "同年紧凑（MM.DD, ... .YYYY）" },
  { value: "fullYear", label: "完整日期（MM/DD/YYYY）" },
  { value: "fullYearDash", label: "完整日期（MM-DD-YYYY）" },
  { value: "fullYearDot", label: "完整日期（MM.DD.YYYY）" },
  { value: "monthDayOnly", label: "仅月日（MM/DD）" },
  { value: "monthDayOnlyDash", label: "仅月日（MM-DD）" },
  { value: "monthDayOnlyDot", label: "仅月日（MM.DD）" },
];

const DATE_PRESET_CONFIGS: Record<DateFormatPreset, DatePresetConfig> = {
  compactSameYear: { mode: "compactSameYear", separator: "/" },
  compactSameYearDash: { mode: "compactSameYear", separator: "-" },
  compactSameYearDot: { mode: "compactSameYear", separator: "." },
  fullYear: { mode: "fullYear", separator: "/" },
  fullYearDash: { mode: "fullYear", separator: "-" },
  fullYearDot: { mode: "fullYear", separator: "." },
  monthDayOnly: { mode: "monthDayOnly", separator: "/" },
  monthDayOnlyDash: { mode: "monthDayOnly", separator: "-" },
  monthDayOnlyDot: { mode: "monthDayOnly", separator: "." },
};

const DATE_PRESET_SET = new Set<DateFormatPreset>(
  DATE_FORMAT_PRESET_OPTIONS.map((option) => option.value)
);

export function isDateFormatPreset(value: unknown): value is DateFormatPreset {
  return (
    typeof value === "string" && DATE_PRESET_SET.has(value as DateFormatPreset)
  );
}

export interface DateRange {
  start: string;
  end: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const CANONICAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toUtcDate(date: string): Date | null {
  if (!CANONICAL_DATE_PATTERN.test(date)) {
    return null;
  }

  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const canonical = toCanonicalDate(parsed);
  return canonical === date ? parsed : null;
}

function toCanonicalDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatMonthDay(date: string, separator: "/" | "-" | "."): string {
  return `${date.slice(5, 7)}${separator}${date.slice(8, 10)}`;
}

function formatMonthDayYear(date: string, separator: "/" | "-" | "."): string {
  return `${date.slice(5, 7)}${separator}${date.slice(
    8,
    10
  )}${separator}${date.slice(0, 4)}`;
}

function dayDiff(prev: string, next: string): number {
  const prevDate = toUtcDate(prev);
  const nextDate = toUtcDate(next);
  if (!prevDate || !nextDate) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.round((nextDate.getTime() - prevDate.getTime()) / DAY_MS);
}

function compareCanonical(a: string, b: string): number {
  return a.localeCompare(b);
}

function listDatesInRange(startDate: string, endDate: string): string[] {
  const normalizedStart = normalizeCanonicalDate(startDate);
  const normalizedEnd = normalizeCanonicalDate(endDate);
  if (!normalizedStart || !normalizedEnd) {
    return [];
  }

  const start = toUtcDate(normalizedStart);
  const end = toUtcDate(normalizedEnd);
  if (!start || !end) {
    return [];
  }

  const [from, to] =
    start.getTime() <= end.getTime() ? [start, end] : [end, start];

  const dates: string[] = [];
  const cursor = new Date(from.getTime());
  while (cursor.getTime() <= to.getTime()) {
    dates.push(toCanonicalDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function resolvePresetConfig(preset: DateFormatPreset): DatePresetConfig {
  return DATE_PRESET_CONFIGS[preset] ?? DATE_PRESET_CONFIGS.compactSameYear;
}

/**
 * Normalize date to canonical YYYY-MM-DD; returns null when invalid.
 */
export function normalizeCanonicalDate(date: string): string | null {
  const trimmed = date.trim();
  if (!trimmed) {
    return null;
  }

  const utcDate = toUtcDate(trimmed);
  return utcDate ? toCanonicalDate(utcDate) : null;
}

/**
 * Compress selected dates into continuous ranges.
 */
export function mergeContinuousRanges(dates: string[]): DateRange[] {
  const normalized = dates
    .map((date) => normalizeCanonicalDate(date))
    .filter((date): date is string => Boolean(date));

  if (normalized.length === 0) {
    return [];
  }

  const uniqueSorted = Array.from(new Set(normalized)).sort(compareCanonical);
  const ranges: DateRange[] = [];

  let start = uniqueSorted[0];
  let end = uniqueSorted[0];

  for (let i = 1; i < uniqueSorted.length; i++) {
    const current = uniqueSorted[i];
    if (dayDiff(end, current) === 1) {
      end = current;
      continue;
    }

    ranges.push({ start, end });
    start = current;
    end = current;
  }

  ranges.push({ start, end });
  return ranges;
}

export class DateComposerService {
  private selectedDates: Set<string> = new Set();
  private preset: DateFormatPreset = "compactSameYear";

  constructor(
    initialDates: string[] = [],
    preset: DateFormatPreset = "compactSameYear"
  ) {
    this.setDates(initialDates);
    this.setPreset(preset);
  }

  toggleDate(date: string): void {
    const canonical = normalizeCanonicalDate(date);
    if (!canonical) {
      return;
    }

    if (this.selectedDates.has(canonical)) {
      this.selectedDates.delete(canonical);
      return;
    }

    this.selectedDates.add(canonical);
  }

  hasDate(date: string): boolean {
    const canonical = normalizeCanonicalDate(date);
    if (!canonical) {
      return false;
    }
    return this.selectedDates.has(canonical);
  }

  setDateSelection(date: string, selected: boolean): void {
    const canonical = normalizeCanonicalDate(date);
    if (!canonical) {
      return;
    }

    if (selected) {
      this.selectedDates.add(canonical);
      return;
    }

    this.selectedDates.delete(canonical);
  }

  setDates(dates: string[]): void {
    this.selectedDates.clear();
    for (const date of dates) {
      const canonical = normalizeCanonicalDate(date);
      if (canonical) {
        this.selectedDates.add(canonical);
      }
    }
  }

  clear(): void {
    this.selectedDates.clear();
  }

  getSelectedDates(): string[] {
    return Array.from(this.selectedDates).sort(compareCanonical);
  }

  setPreset(preset: DateFormatPreset): void {
    this.preset = isDateFormatPreset(preset) ? preset : "compactSameYear";
  }

  getPreset(): DateFormatPreset {
    return this.preset;
  }

  /**
   * Add all dates in an inclusive range.
   */
  selectRange(startDate: string, endDate: string): void {
    this.setRangeSelection(startDate, endDate, true);
  }

  getRangeDates(startDate: string, endDate: string): string[] {
    return listDatesInRange(startDate, endDate);
  }

  setRangeSelection(
    startDate: string,
    endDate: string,
    selected: boolean
  ): void {
    const range = listDatesInRange(startDate, endDate);
    for (const date of range) {
      this.setDateSelection(date, selected);
    }
  }

  clone(): DateComposerService {
    return new DateComposerService(this.getSelectedDates(), this.preset);
  }

  buildDisplayText(): string {
    const selected = this.getSelectedDates();
    if (selected.length === 0) {
      return "";
    }

    const ranges = mergeContinuousRanges(selected);
    const presetConfig = resolvePresetConfig(this.preset);

    if (presetConfig.mode === "monthDayOnly") {
      return ranges
        .map((range) =>
          range.start === range.end
            ? formatMonthDay(range.start, presetConfig.separator)
            : `${formatMonthDay(
                range.start,
                presetConfig.separator
              )} - ${formatMonthDay(range.end, presetConfig.separator)}`
        )
        .join(", ");
    }

    if (presetConfig.mode === "fullYear") {
      return ranges
        .map((range) =>
          range.start === range.end
            ? formatMonthDayYear(range.start, presetConfig.separator)
            : `${formatMonthDayYear(
                range.start,
                presetConfig.separator
              )} - ${formatMonthDayYear(range.end, presetConfig.separator)}`
        )
        .join(", ");
    }

    const years = new Set(selected.map((date) => date.slice(0, 4)));
    if (years.size === 1) {
      const year = selected[0].slice(0, 4);
      const body = ranges
        .map((range) =>
          range.start === range.end
            ? formatMonthDay(range.start, presetConfig.separator)
            : `${formatMonthDay(
                range.start,
                presetConfig.separator
              )} - ${formatMonthDay(range.end, presetConfig.separator)}`
        )
        .join(", ");
      return `${body}${presetConfig.separator}${year}`;
    }

    return ranges
      .map((range) => {
        const startYear = range.start.slice(0, 4);
        const endYear = range.end.slice(0, 4);

        if (range.start === range.end) {
          return formatMonthDayYear(range.start, presetConfig.separator);
        }

        if (startYear === endYear) {
          return `${formatMonthDay(
            range.start,
            presetConfig.separator
          )} - ${formatMonthDayYear(range.end, presetConfig.separator)}`;
        }

        return `${formatMonthDayYear(
          range.start,
          presetConfig.separator
        )} - ${formatMonthDayYear(range.end, presetConfig.separator)}`;
      })
      .join(", ");
  }
}
