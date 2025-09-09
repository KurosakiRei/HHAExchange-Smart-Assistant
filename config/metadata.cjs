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
  // 'license': 'MIT',
  match: ["*://app.hhaexchange.com/", "*://app.hhaexchange.com/*","*://mt3.1voicetech.com/webapp/*"],
  require: [
    `https://cdn.jsdelivr.net/npm/jquery@${dependencies.jquery}/dist/jquery.min.js`,
  ],
  grant: ["GM.xmlHttpRequest","GM_openInTab", "GM_addStyle"],
  connect: ["app.hhaexchange.com"],
  "run-at": "document-idle",
};