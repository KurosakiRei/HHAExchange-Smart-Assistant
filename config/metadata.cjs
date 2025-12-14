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
  source: repository.url,
  // 使用 GreasyFork 作为更新源（私有仓库也能自动更新）
  // TODO: 将 YOUR_SCRIPT_ID 替换为你在 GreasyFork 上的实际脚本 ID
  updateURL: "https://update.greasyfork.org/scripts/YOUR_SCRIPT_ID/HHAExchange%20Smart%20Assistant.user.js",
  downloadURL: "https://update.greasyfork.org/scripts/YOUR_SCRIPT_ID/HHAExchange%20Smart%20Assistant.user.js",
  // 'license': 'MIT',
  match: ["*://app.hhaexchange.com/", "*://app.hhaexchange.com/*","*://mt3.1voicetech.com/webapp/*"],
  require: [
    `https://cdn.jsdelivr.net/npm/jquery@${dependencies.jquery}/dist/jquery.min.js`,
  ],
  grant: ["GM.xmlHttpRequest","GM_openInTab", "GM_addStyle"],
  connect: ["app.hhaexchange.com"],
  "run-at": "document-idle",
};