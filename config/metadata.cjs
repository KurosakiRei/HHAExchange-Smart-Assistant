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
  updateURL: "https://github.com/KurosakiRei/HHAExchange-Smart-Assistant/releases/latest/download/index.prod.user.js",
  downloadURL: "https://github.com/KurosakiRei/HHAExchange-Smart-Assistant/releases/latest/download/index.prod.user.js",
  // 'license': 'MIT',
  match: ["*://app.hhaexchange.com/", "*://app.hhaexchange.com/*","*://mt3.1voicetech.com/webapp/*"],
  require: [
    `https://cdn.jsdelivr.net/npm/jquery@${dependencies.jquery}/dist/jquery.min.js`,
  ],
  grant: ["GM.xmlHttpRequest","GM_openInTab", "GM_addStyle"],
  connect: ["app.hhaexchange.com"],
  "run-at": "document-idle",
};