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
  // 使用 GreasyFork 作为更新源（私有仓库也能自动更新）
  // TODO: 将 YOUR_SCRIPT_ID 替换为你在 GreasyFork 上的实际脚本 ID
  updateURL: "https://update.greasyfork.org/scripts/YOUR_SCRIPT_ID/HHAExchange%20Smart%20Assistant.user.js",
  downloadURL: "https://update.greasyfork.org/scripts/YOUR_SCRIPT_ID/HHAExchange%20Smart%20Assistant.user.js",
  match: ["*://app.hhaexchange.com/", "*://app.hhaexchange.com/*","*://mt3.1voicetech.com/webapp/*"],
  require: [
    // 使用具体版本号而不是版本范围（GreasyFork 要求）
    `https://cdn.jsdelivr.net/npm/jquery@3.6.3/dist/jquery.min.js`,
  ],
  grant: ["GM.xmlHttpRequest","GM_openInTab", "GM_addStyle"],
  connect: ["app.hhaexchange.com"],
  "run-at": "document-idle",
};