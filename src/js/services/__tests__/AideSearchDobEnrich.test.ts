/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GM_fetch from "@trim21/gm-fetch";
import {
  enrichAideSearchDob,
  extractAideDobFromProfileHtml,
  resetAideDobEnrichCacheForTests,
} from "../HhaSearchService";

vi.mock("@trim21/gm-fetch", () => ({ default: vi.fn() }));

const mockFetch = GM_fetch as unknown as ReturnType<typeof vi.fn>;

const SEARCH_HTML = `
<table id="tdSearchResults">
  <thead>
    <tr>
      <th>Caregiver</th><th>SSN</th><th>Office(s)</th><th>Date of Birth</th><th>Phone</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a onclick="RedirectToAidePage(3632255);" href="#">Fu GuiZhi</a><br><small>AHC-19158</small></td>
      <td>XXX-XX-4421</td>
      <td>Always Home Care</td>
      <td>XX/XX/XXXX</td>
      <td>929-300-8723</td>
    </tr>
    <tr>
      <td><a onclick="RedirectToAidePage(2201746);" href="#">Wang XiaoLi</a></td>
      <td>XXX-XX-1111</td>
      <td>Always Home Care</td>
      <td>XX/XX/XXXX</td>
      <td>555-000-1111</td>
    </tr>
  </tbody>
</table>`;

const PROFILE_HTML_OK = `<html><body><input id="uxHfDtDOB" type="hidden" value="07/15/1956" /></body></html>`;

function okResponse(html: string): unknown {
  return {
    status: 200,
    rawBody: { text: async () => html },
  };
}

function dobCellOf(html: string, rowIndex: number): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const rows = doc.querySelectorAll("tbody tr");
  const cells = rows[rowIndex]?.querySelectorAll("td");
  return cells?.[3]?.textContent?.trim() ?? "";
}

function ssnCellOf(html: string, rowIndex: number): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const rows = doc.querySelectorAll("tbody tr");
  const cells = rows[rowIndex]?.querySelectorAll("td");
  return cells?.[1]?.textContent?.trim() ?? "";
}

function buildSearchHtml(rowCount: number): string {
  const rows = Array.from({ length: rowCount }, (_, i) => {
    const id = 1000 + i;
    return `<tr><td><a onclick="RedirectToAidePage(${id});">Aide${i}</a></td><td>XXX-XX-000${i}</td><td>Office</td><td>XX/XX/XXXX</td><td>555-${i}</td></tr>`;
  }).join("\n");
  return `<table id="tdSearchResults"><thead><tr><th>Caregiver</th><th>SSN</th><th>Office(s)</th><th>Date of Birth</th><th>Phone</th></tr></thead><tbody>${rows}</tbody></table>`;
}

beforeEach(() => {
  mockFetch.mockReset();
  resetAideDobEnrichCacheForTests();
  (globalThis as any).GM_getValue = (_key: string, _def?: unknown) => true;
});

afterEach(() => {
  mockFetch.mockReset();
  resetAideDobEnrichCacheForTests();
});

describe("extractAideDobFromProfileHtml", () => {
  it("从 uxHfDtDOB 提取真实 DOB", () => {
    expect(extractAideDobFromProfileHtml(PROFILE_HTML_OK)).toBe("07/15/1956");
  });

  it("主字段缺失时回退 hidprevDOB", () => {
    const html = `<html><body><input id="hidprevDOB" type="hidden" value="01/02/1990" /></body></html>`;
    expect(extractAideDobFromProfileHtml(html)).toBe("01/02/1990");
  });

  it("值非法时返回 null", () => {
    const html = `<html><body><input id="uxHfDtDOB" type="hidden" value="XX/XX/XXXX" /></body></html>`;
    expect(extractAideDobFromProfileHtml(html)).toBeNull();
  });
});

describe("enrichAideSearchDob", () => {
  it("替换 DOB 列且保持 SSN 列掩码", async () => {
    mockFetch.mockResolvedValue(okResponse(PROFILE_HTML_OK));
    const enriched = await enrichAideSearchDob(SEARCH_HTML);

    expect(dobCellOf(enriched, 0)).toBe("07/15/1956");
    expect(dobCellOf(enriched, 1)).toBe("07/15/1956");
    expect(ssnCellOf(enriched, 0)).toBe("XXX-XX-4421");
  });

  it("请求 URL 使用 AideProfile_ns.aspx 且带 AideID", async () => {
    mockFetch.mockResolvedValue(okResponse(PROFILE_HTML_OK));
    await enrichAideSearchDob(SEARCH_HTML);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/Aide/AideProfile_ns.aspx?AideID=3632255")
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/Aide/AideProfile_ns.aspx?AideID=2201746")
    );
  });

  it("单行失败不影响其他行且保留掩码", async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(PROFILE_HTML_OK))
      .mockRejectedValueOnce(new Error("network down"));
    const enriched = await enrichAideSearchDob(SEARCH_HTML);

    expect(dobCellOf(enriched, 0)).toBe("07/15/1956");
    expect(dobCellOf(enriched, 1)).toBe("XX/XX/XXXX");
  });

  it("同一 AideID 跨调用只请求一次（会话缓存）", async () => {
    mockFetch.mockResolvedValue(okResponse(PROFILE_HTML_OK));
    const singleRow = `<table id="tdSearchResults"><thead><tr><th>Caregiver</th><th>Date of Birth</th></tr></thead><tbody><tr><td><a onclick="RedirectToAidePage(3632255);">A</a></td><td>XX/XX/XXXX</td></tr></tbody></table>`;

    await enrichAideSearchDob(singleRow);
    await enrichAideSearchDob(singleRow);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("开关关闭时不发请求并原样返回", async () => {
    (globalThis as any).GM_getValue = (_key: string, _def?: unknown) => false;
    const out = await enrichAideSearchDob(SEARCH_HTML);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(dobCellOf(out, 0)).toBe("XX/XX/XXXX");
  });

  it("无表格或无 DOB 列时原样返回", async () => {
    expect(await enrichAideSearchDob("<p>no table</p>")).toBe(
      "<p>no table</p>"
    );

    const noDobCol = `<table id="tdSearchResults"><thead><tr><th>Caregiver</th><th>Phone</th></tr></thead><tbody><tr><td><a onclick="RedirectToAidePage(1);">A</a></td><td>555</td></tr></tbody></table>`;
    const out = await enrichAideSearchDob(noDobCol);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(out).toContain("<table");
  });

  it("档案响应无真实 DOB 时保留掩码", async () => {
    mockFetch.mockResolvedValue(
      okResponse(
        `<html><body><input id="uxHfDtDOB" type="hidden" value="XX/XX/XXXX" /></body></html>`
      )
    );
    const enriched = await enrichAideSearchDob(SEARCH_HTML);
    expect(dobCellOf(enriched, 0)).toBe("XX/XX/XXXX");
  });

  it("全部失败时保留全部掩码且不抛错", async () => {
    mockFetch.mockRejectedValue(new Error("boom"));
    const enriched = await enrichAideSearchDob(SEARCH_HTML);

    expect(dobCellOf(enriched, 0)).toBe("XX/XX/XXXX");
    expect(dobCellOf(enriched, 1)).toBe("XX/XX/XXXX");
  });

  it("并发上限 3：同时最多 3 个在途请求", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const pending: Array<() => void> = [];
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          inFlight++;
          maxInFlight = Math.max(maxInFlight, inFlight);
          pending.push(() => {
            inFlight--;
            resolve(okResponse(PROFILE_HTML_OK));
          });
        })
    );

    const promise = enrichAideSearchDob(buildSearchHtml(5));
    await new Promise((r) => setTimeout(r, 20));
    const settledMax = maxInFlight;

    // 分波放行：5 个任务 ÷ 并发 3 → 最多两波，循环放行直到全部完成
    for (let i = 0; i < 3; i++) {
      pending.splice(0).forEach((fn) => fn());
      await new Promise((r) => setTimeout(r, 10));
    }
    await promise;

    expect(settledMax).toBeLessThanOrEqual(3);
  });
});
