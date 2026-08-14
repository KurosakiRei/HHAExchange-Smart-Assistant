/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyAideSensitiveDataRestore,
  dobToDateInputValue,
  initAideSensitiveDataRestore,
  isDobMasked,
  isFeatureEnabled,
  isValidDob,
  isValidSsn,
  isSsnMasked,
} from "../AideSensitiveDataRestore";

function setGmValue(value: unknown): void {
  (globalThis as any).GM_getValue = (_key: string, _def?: unknown) => value;
}

function buildAideDom(): void {
  document.body.innerHTML = `
    <form id="aspnetForm">
      <input id="uxHfDtDOB" type="hidden" value="07/15/1956" />
      <input id="hidprevDOB" type="hidden" value="07/15/1956" />
      <input id="uxHfSSN" type="hidden" value="830-39-4421" />
      <input id="hidprevSSN" type="hidden" value="830-39-4421" />
      <p><span id="ctl00_ContentPlaceHolder1_uxlblInfoDOB">XX/XX/XXXX</span></p>
      <label id="uxTdPDOB"><span id="uxLblPDOB">XX/XX/XXXX</span></label>
      <p><span id="uxLblPSSN">XXX-XX-4421</span></p>
      <input id="uxDtDOB" type="date" />
      <input id="uxTxtSSN" readonly value="XXX-XX-4421" />
    </form>
  `;
}

function goToAideUrl(): void {
  window.history.pushState({}, "", "/Aide/Aide_ns.aspx?AideId=3632255");
}

beforeEach(() => {
  setGmValue(true);
  goToAideUrl();
});

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as any).__HHA_AIDE_SENSITIVE_RESTORED_FLAG__;
});

describe("正则与转换工具", () => {
  it("识别 DOB 掩码（大小写不敏感）", () => {
    expect(isDobMasked("XX/XX/XXXX")).toBe(true);
    expect(isDobMasked("xx/xx/xxxx")).toBe(true);
    expect(isDobMasked("07/15/1956")).toBe(false);
  });

  it("识别 SSN 掩码", () => {
    expect(isSsnMasked("XXX-XX-4421")).toBe(true);
    expect(isSsnMasked("830-39-4421")).toBe(false);
    expect(isSsnMasked("XXX-XX-XXXX")).toBe(false);
  });

  it("校验真实值格式", () => {
    expect(isValidDob("07/15/1956")).toBe(true);
    expect(isValidDob("XX/XX/XXXX")).toBe(false);
    expect(isValidDob("")).toBe(false);
    expect(isValidSsn("830-39-4421")).toBe(true);
    expect(isValidSsn("XXX-XX-4421")).toBe(false);
  });

  it("MM/DD/YYYY → YYYY-MM-DD 转换", () => {
    expect(dobToDateInputValue("07/15/1956")).toBe("1956-07-15");
    expect(dobToDateInputValue("XX/XX/XXXX")).toBeNull();
    expect(dobToDateInputValue("")).toBeNull();
  });
});

describe("applyAideSensitiveDataRestore", () => {
  it("恢复三个显示位（两处 DOB + 一处 SSN）", () => {
    buildAideDom();
    applyAideSensitiveDataRestore();

    expect(
      document.getElementById("ctl00_ContentPlaceHolder1_uxlblInfoDOB")
        ?.textContent
    ).toBe("07/15/1956");
    expect(document.getElementById("uxLblPDOB")?.textContent).toBe(
      "07/15/1956"
    );
    expect(document.getElementById("uxLblPSSN")?.textContent).toBe(
      "830-39-4421"
    );
  });

  it("恢复编辑态控件（date input + readonly SSN input）", () => {
    buildAideDom();
    applyAideSensitiveDataRestore();

    const dobInput = document.getElementById("uxDtDOB") as HTMLInputElement;
    const ssnInput = document.getElementById("uxTxtSSN") as HTMLInputElement;
    expect(dobInput.value).toBe("1956-07-15");
    expect(ssnInput.value).toBe("830-39-4421");
  });

  it("幂等：连续两次运行结果不变", () => {
    buildAideDom();
    applyAideSensitiveDataRestore();
    const first = document.body.innerHTML;
    applyAideSensitiveDataRestore();
    expect(document.body.innerHTML).toBe(first);

    expect(
      document
        .getElementById("ctl00_ContentPlaceHolder1_uxlblInfoDOB")
        ?.getAttribute("data-hha-sensitive-restored")
    ).toBe("1");
  });

  it("官方重渲染后（重新出现掩码）可再次恢复", () => {
    buildAideDom();
    applyAideSensitiveDataRestore();
    const span = document.getElementById(
      "ctl00_ContentPlaceHolder1_uxlblInfoDOB"
    ) as HTMLSpanElement;
    span.textContent = "XX/XX/XXXX";
    span.removeAttribute("data-hha-sensitive-restored");

    applyAideSensitiveDataRestore();
    expect(span.textContent).toBe("07/15/1956");
  });

  it("隐藏字段缺失或格式非法时不写入任何值", () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentPlaceHolder1_uxlblInfoDOB">XX/XX/XXXX</span>
      <span id="uxLblPDOB">XX/XX/XXXX</span>
      <span id="uxLblPSSN">XXX-XX-4421</span>
      <input id="uxHfDtDOB" type="hidden" value="" />
      <input id="uxHfSSN" type="hidden" value="not-a-ssn" />
    `;
    applyAideSensitiveDataRestore();

    expect(
      document.getElementById("ctl00_ContentPlaceHolder1_uxlblInfoDOB")
        ?.textContent
    ).toBe("XX/XX/XXXX");
    expect(document.getElementById("uxLblPDOB")?.textContent).toBe(
      "XX/XX/XXXX"
    );
    expect(document.getElementById("uxLblPSSN")?.textContent).toBe(
      "XXX-XX-4421"
    );
  });

  it("已显示真实值的页面不做重复写入（真实值优先）", () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentPlaceHolder1_uxlblInfoDOB">07/15/1956</span>
      <input id="uxHfDtDOB" type="hidden" value="07/15/1956" />
    `;
    applyAideSensitiveDataRestore();
    const span = document.getElementById(
      "ctl00_ContentPlaceHolder1_uxlblInfoDOB"
    ) as HTMLSpanElement;
    expect(span.textContent).toBe("07/15/1956");
    expect(span.getAttribute("data-hha-sensitive-restored")).toBeNull();
  });
});

describe("initAideSensitiveDataRestore", () => {
  it("Aide_ns 页面初始化即恢复且窗口级幂等", () => {
    buildAideDom();
    initAideSensitiveDataRestore();
    expect(
      document.getElementById("ctl00_ContentPlaceHolder1_uxlblInfoDOB")
        ?.textContent
    ).toBe("07/15/1956");

    // 再次调用不重复初始化（标记已存在）
    document.getElementById(
      "ctl00_ContentPlaceHolder1_uxlblInfoDOB"
    )!.textContent = "XX/XX/XXXX";
    initAideSensitiveDataRestore();
    expect(
      document.getElementById("ctl00_ContentPlaceHolder1_uxlblInfoDOB")
        ?.textContent
    ).toBe("XX/XX/XXXX"); // 观察器尚未触发（防抖），且不会二次初始化
  });

  it("非 Aide_ns 页面直接返回", () => {
    window.history.pushState(
      {},
      "",
      "/Patient/InternalPatientInfo_ns.aspx?PatientID=1"
    );
    buildAideDom();
    initAideSensitiveDataRestore();
    expect(
      document.getElementById("ctl00_ContentPlaceHolder1_uxlblInfoDOB")
        ?.textContent
    ).toBe("XX/XX/XXXX");
  });

  it("开关关闭时 isFeatureEnabled=false 且 init 不恢复", () => {
    setGmValue(false);
    expect(isFeatureEnabled()).toBe(false);

    buildAideDom();
    initAideSensitiveDataRestore();
    expect(
      document.getElementById("ctl00_ContentPlaceHolder1_uxlblInfoDOB")
        ?.textContent
    ).toBe("XX/XX/XXXX");
  });
});
