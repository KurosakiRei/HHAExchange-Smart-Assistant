const {
  author,
  dependencies,
  repository,
  version,
} = require("../package.json");

module.exports = {
  name: "HHAExchange Smart Assistant",
  namespace: "https://kurosakirei.dev/",
  version: version,
  author: author,
  description: "Enhanced HHAExchange user experience with auto-fill forms, intelligent call handling, real-time visit monitoring, and multi-tab data synchronization for healthcare coordinators",
  "description:zh-CN": "增强 HHAExchange 用户体验：自动填表、智能来电处理、实时访视监控、多标签页数据同步，专为医疗协调员设计",
  license: "MIT",
  source: repository.url,
  // 使用 GitHub raw URL 从 dist 分支获取更新（仓库公开后可用）
  updateURL: "https://raw.githubusercontent.com/KurosakiRei/HHAExchange-Smart-Assistant/dist/index.prod.user.js",
  downloadURL: "https://raw.githubusercontent.com/KurosakiRei/HHAExchange-Smart-Assistant/dist/index.prod.user.js",
  match: ["*://app.hhaexchange.com/", "*://app.hhaexchange.com/*", "*://mt3.1voicetech.com/webapp/*", "*://outlook.office.com/*", "*://outlook.office.com/mail/*", "https://outlook.office.com/mail/*", "*://*.office.com/*"],
  require: [
    // 使用具体版本号确保兼容性
    `https://cdn.jsdelivr.net/npm/jquery@3.6.3/dist/jquery.min.js`,
    // TinyMCE is now manually bundled via TinyMCEBundler to bypass CSP
  ],
  grant: ["GM.xmlHttpRequest", "GM_openInTab", "GM_addStyle", "GM_setValue", "GM_getValue", "GM.addElement"],
  connect: ["app.hhaexchange.com", "reports.hhaexchange.com", "outlook.office.com", "unpkg.com"],
  "run-at": "document-idle",
};