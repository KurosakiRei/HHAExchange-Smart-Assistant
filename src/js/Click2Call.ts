export const click2Call = () => {
  // 你明确知道的 ID 列表
  const TARGET_IDS = ["ctl00_ContentPlaceHolder1_PatientInfo1_uxltHomePhone"];

  // 只在目标网站上生效
  const URL_PATTERNS = [/app\.hhaexchange\.com\/ENT2507010000\/Patient.*/];

  function isTargetSite() {
    return URL_PATTERNS.some((pattern) => pattern.test(location.href));
  }

  // 主逻辑
  window.addEventListener("DOMContentLoaded", () => {
    isTargetSite();
    console.log(isTargetSite());
  });
};
