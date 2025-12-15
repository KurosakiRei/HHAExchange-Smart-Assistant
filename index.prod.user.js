// ==UserScript==
// @name                HHAExchange Smart Assistant
// @namespace           https://kurosakirei.dev/
// @version             3.2.1
// @author              KurosakiRei <kurosakirei@outlook.com>
// @description         Enhanced HHAExchange user experience with auto-fill forms, intelligent call handling, real-time visit monitoring, and multi-tab data synchronization for healthcare coordinators
// @description:zh-CN   增强 HHAExchange 用户体验：自动填表、智能来电处理、实时访视监控、多标签页数据同步，专为医疗协调员设计
// @license             MIT
// @source              https://github.com/KurosakiRei/HHAExchange-Smart-Assistant
// @updateURL           https://raw.githubusercontent.com/KurosakiRei/HHAExchange-Smart-Assistant/dist/index.prod.user.js
// @downloadURL         https://raw.githubusercontent.com/KurosakiRei/HHAExchange-Smart-Assistant/dist/index.prod.user.js
// @match               *://app.hhaexchange.com/
// @match               *://app.hhaexchange.com/*
// @match               *://mt3.1voicetech.com/webapp/*
// @require             https://cdn.jsdelivr.net/npm/jquery@3.6.3/dist/jquery.min.js
// @grant               GM.xmlHttpRequest
// @grant               GM_openInTab
// @grant               GM_addStyle
// @connect             app.hhaexchange.com
// @run-at              document-idle
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/style/main.less":
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/css-loader/dist/runtime/noSourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "#highlight-caller-popup {\n  position: fixed;\n  z-index: 999999;\n  background-color: #ffffff;\n  border: 1px solid #dcdcdc;\n  border-radius: 8px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n  font-size: 14px;\n  color: #333;\n  padding: 12px;\n  min-width: 200px;\n}\n#highlight-caller-popup .hcp-title {\n  font-weight: 600;\n  font-size: 16px;\n  margin-bottom: 8px;\n}\n#highlight-caller-popup .hcp-number {\n  background-color: #f0f0f0;\n  padding: 4px 8px;\n  border-radius: 4px;\n  margin-bottom: 12px;\n  text-align: center;\n  font-weight: 500;\n}\n#highlight-caller-popup .hcp-actions {\n  display: flex;\n  justify-content: space-around;\n  gap: 10px;\n}\n#highlight-caller-popup .hcp-button {\n  display: inline-block;\n  text-decoration: none;\n  color: #fff;\n  background-color: #007bff;\n  padding: 8px 12px;\n  border-radius: 5px;\n  transition: background-color 0.2s;\n  flex-grow: 1;\n  text-align: center;\n}\n#highlight-caller-popup .hcp-button:hover {\n  background-color: #0056b3;\n}\n#highlight-caller-popup .hcp-close-btn {\n  position: absolute;\n  top: 5px;\n  right: 8px;\n  font-size: 20px;\n  color: #aaa;\n  cursor: pointer;\n  font-weight: bold;\n}\n#highlight-caller-popup .hcp-close-btn:hover {\n  color: #333;\n}\n.manual-search-btn-hha {\n  background-color: #28a745;\n  color: white;\n  padding: 10px 15px;\n  margin: 10px 15px;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 16px;\n  font-weight: bold;\n  display: block;\n  text-align: center;\n}\n.manual-search-btn-hha:hover {\n  background-color: #218838;\n}\n/* --- General Container --- */\n#tracker-container {\n  position: fixed;\n  top: 20px;\n  right: 20px;\n  z-index: 99999;\n  user-select: none;\n  -webkit-user-select: none;\n}\n#tracker-drag-handle {\n  width: 48px;\n  height: 48px;\n  background-color: #007bff;\n  color: white;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: move;\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\n  font-size: 24px;\n  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;\n}\n#tracker-drag-handle:hover {\n  transform: scale(1.1);\n}\n#tracker-drag-handle:active {\n  transform: scale(0.95);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\n}\n/* --- Panel & Views --- */\n#tracker-panel {\n  position: absolute;\n  top: 0;\n  width: 550px;\n  min-height: 500px;\n  background: #f9f9f9;\n  border: 1px solid #ccc;\n  border-radius: 8px;\n  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);\n  display: none;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  color: #333;\n  overflow: hidden;\n}\n.tracker-view {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  top: 0;\n  left: 0;\n  display: flex;\n  flex-direction: column;\n  transition: transform 0.3s ease-in-out;\n}\n.tracker-view.hidden {\n  display: none;\n}\n/* View Transition Animations */\n.slide-in {\n  transform: translateX(0);\n}\n.slide-out {\n  transform: translateX(-100%);\n}\n.slide-in-from-right {\n  transform: translateX(100%);\n}\n/* --- Header --- */\n.tracker-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 10px 15px;\n  background: #f1f1f1;\n  border-bottom: 1px solid #ddd;\n  flex-shrink: 0;\n}\n.tracker-header h3 {\n  margin: 0;\n  font-size: 16px;\n  font-weight: 600;\n}\n.tracker-header-btn {\n  background: #e0e0e0;\n  border: 1px solid #ccc;\n  padding: 4px 10px;\n  border-radius: 5px;\n  cursor: pointer;\n}\n.tracker-header-btn:hover {\n  background: #d4d4d4;\n}\n.back-btn {\n  font-size: 20px;\n  padding: 0 10px;\n}\n/* --- 4. 内容与表格 --- */\n.tracker-content {\n  flex-grow: 1;\n  padding: 10px;\n  overflow-y: auto;\n}\n.tracker-table {\n  width: 100%;\n  border-collapse: collapse;\n}\n.tracker-table th,\n.tracker-table td {\n  border: 1px solid #ddd;\n  padding: 8px 12px;\n  text-align: center;\n  vertical-align: middle;\n}\n.tracker-table th {\n  background-color: #e9ecef;\n  font-size: 14px;\n}\n.tracker-table td {\n  font-size: 13px;\n}\n.tracker-table .col-coordinator {\n  text-align: left;\n  width: auto;\n  min-width: 150px;\n}\n.status-icon {\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  color: white;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: bold;\n  font-size: 14px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.status-icon:hover {\n  opacity: 0.8;\n  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);\n}\n.status-ok {\n  background-color: #28a745;\n}\n.status-error {\n  background-color: #dc3545;\n  animation: blink-animation 1.5s infinite;\n}\n@keyframes blink-animation {\n  0% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.4;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n/* --- Edit View Specifics --- */\n.edit-list-actions button {\n  font-size: 18px;\n  width: 36px;\n  height: 36px;\n  border: none;\n  border-radius: 50%;\n  cursor: pointer;\n  transition: background-color 0.2s;\n}\n.edit-list-actions button.add-btn {\n  background-color: #28a745;\n  color: white;\n}\n.edit-list-actions button.remove-btn {\n  background-color: #dc3545;\n  color: white;\n}\n.edit-list-actions button:disabled {\n  background-color: #ccc;\n  cursor: not-allowed;\n}\n.tracker-footer {\n  padding: 10px;\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  border-top: 1px solid #ddd;\n  background: #f1f1f1;\n  flex-shrink: 0;\n}\n/* --- Loader --- */\n.loader {\n  text-align: center;\n  padding: 40px;\n}\n.spinner {\n  border: 4px solid #f3f3f3;\n  border-top: 4px solid #3498db;\n  border-radius: 50%;\n  width: 40px;\n  height: 40px;\n  animation: spin 1s linear infinite;\n  margin: 0 auto;\n}\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n/* --- Toast Notification --- */\n.tracker-toast {\n  position: fixed;\n  top: 20px;\n  left: 50%;\n  transform: translateX(-50%);\n  background-color: #333;\n  color: white;\n  padding: 10px 20px;\n  border-radius: 5px;\n  z-index: 10000;\n  opacity: 0;\n  transition: opacity 0.3s, bottom 0.3s;\n}\n.tracker-toast.show {\n  opacity: 1;\n  top: 40px;\n}\n.tracker-toast.success {\n  background-color: #28a745;\n}\n.tracker-toast.error {\n  background-color: #dc3545;\n}\n/* --- 7. Details Popover (气泡) --- */\n#details-popover {\n  position: fixed;\n  z-index: 10001;\n  /* Must be higher than the panel */\n  /* MODIFIED: 增加宽度以容纳更多列 */\n  width: 800px;\n  max-width: 95vw;\n  max-height: 90vh;\n  /* 提高最大高度限制 */\n  background: #fff;\n  border-radius: 8px;\n  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);\n  border: 1px solid #ddd;\n  display: flex;\n  flex-direction: column;\n  /* Initial state for fade-in animation */\n  opacity: 0;\n  transform: scale(0.95);\n  transition: opacity 0.2s ease-out, transform 0.2s ease-out;\n  /* FIX: 提高 z-index, 确保它在所有元素之上 */\n  z-index: 100001;\n}\n#details-popover.visible {\n  opacity: 1;\n  transform: scale(1);\n}\n.popover-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 10px 15px;\n  background: #f1f1f1;\n  border-bottom: 1px solid #ddd;\n  flex-shrink: 0;\n  cursor: move;\n  /* ADDED: 让用户知道这里可以拖动 */\n}\n.popover-header h4 {\n  margin: 0;\n  font-size: 15px;\n  font-weight: 600;\n}\n.popover-close-btn {\n  background: none;\n  border: none;\n  font-size: 24px;\n  line-height: 1;\n  cursor: pointer;\n  padding: 0 5px;\n  color: #666;\n}\n.popover-content {\n  padding: 5px;\n  overflow-y: auto;\n  flex-grow: 1;\n}\n#details-popover .popover-table {\n  color: #000 !important;\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 12px;\n}\n.popover-table th,\n.popover-table td {\n  border: 1px solid #eee;\n  padding: 6px 8px;\n  text-align: left;\n  white-space: nowrap;\n}\n.popover-table th {\n  background-color: #f9f9f9;\n  position: sticky;\n  top: 0;\n}\n/* --- Note Cell Styling --- */\n.popover-table td.note-cell {\n  white-space: normal !important;\n  /* 允许换行 */\n  max-width: 350px;\n  word-wrap: break-word;\n  overflow-wrap: break-word;\n  vertical-align: top;\n}\n/* --- Authorization Note Table (格式化后的内容) --- */\n.auth-note-table {\n  width: 100%;\n  border-collapse: collapse;\n  background: #f8f9fa;\n  border: 1px solid #dee2e6;\n  border-radius: 4px;\n  margin-top: 6px;\n  font-size: 11px;\n}\n.auth-note-table th,\n.auth-note-table td {\n  border: 1px solid #dee2e6;\n  padding: 4px 8px;\n  text-align: left;\n  white-space: normal;\n  word-wrap: break-word;\n}\n.auth-note-table th {\n  background: #e9ecef;\n  font-weight: 600;\n  color: #495057;\n}\n.auth-note-table td {\n  color: #212529;\n  background: #fff;\n}\n/* --- Popover Resize Handle --- */\n.popover-resize-handle {\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  width: 16px;\n  height: 16px;\n  cursor: nwse-resize;\n  background: linear-gradient(135deg, transparent 0%, transparent 50%, #999 50%, #999 100%);\n  border-bottom-right-radius: 8px;\n}\n.popover-resize-handle::before {\n  content: '';\n  position: absolute;\n  right: 4px;\n  bottom: 4px;\n  width: 4px;\n  height: 4px;\n  background: #666;\n  border-radius: 1px;\n}\n/* --- 8. Phone Tooltip (新增) --- */\n.phone-icon-wrapper {\n  position: relative;\n  /* 为内部的 tooltip 提供定位上下文 */\n  display: inline-flex;\n  align-items: center;\n}\n.phone-icon {\n  margin-left: 8px;\n  color: #007bff;\n  cursor: pointer;\n}\n.phone-tooltip {\n  display: none;\n  /* 默认隐藏 */\n  position: absolute;\n  top: 100%;\n  /* 显示在图标正下方 */\n  left: 0;\n  width: 220px;\n  background: #fff;\n  border: 1px solid #ccc;\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);\n  border-radius: 4px;\n  padding: 10px;\n  z-index: 100002;\n  /* 确保在气泡本身之上 */\n}\n/* 核心交互：当鼠标悬浮在 wrapper 上时，显示 tooltip */\n.phone-icon-wrapper:hover .phone-tooltip {\n  display: block;\n}\n.phone-tooltip-item {\n  display: flex;\n  justify-content: space-between;\n  padding: 4px 0;\n  border-bottom: 1px solid #f0f0f0;\n  font-size: 12px;\n}\n.phone-tooltip-item:last-child {\n  border-bottom: none;\n}\n.phone-tooltip-item label {\n  font-weight: bold;\n  color: #555;\n  margin-right: 10px;\n}\n.phone-tooltip-item span {\n  color: #000;\n}\n", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/noSourceMaps.js":
/***/ ((module) => {



module.exports = function (i) {
  return i[1];
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/***/ ((module) => {



var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/***/ ((module) => {



var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js
var injectStylesIntoStyleTag = __webpack_require__("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
var injectStylesIntoStyleTag_default = /*#__PURE__*/__webpack_require__.n(injectStylesIntoStyleTag);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleDomAPI.js
var styleDomAPI = __webpack_require__("./node_modules/style-loader/dist/runtime/styleDomAPI.js");
var styleDomAPI_default = /*#__PURE__*/__webpack_require__.n(styleDomAPI);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertBySelector.js
var insertBySelector = __webpack_require__("./node_modules/style-loader/dist/runtime/insertBySelector.js");
var insertBySelector_default = /*#__PURE__*/__webpack_require__.n(insertBySelector);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js
var setAttributesWithoutAttributes = __webpack_require__("./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
var setAttributesWithoutAttributes_default = /*#__PURE__*/__webpack_require__.n(setAttributesWithoutAttributes);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertStyleElement.js
var insertStyleElement = __webpack_require__("./node_modules/style-loader/dist/runtime/insertStyleElement.js");
var insertStyleElement_default = /*#__PURE__*/__webpack_require__.n(insertStyleElement);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleTagTransform.js
var styleTagTransform = __webpack_require__("./node_modules/style-loader/dist/runtime/styleTagTransform.js");
var styleTagTransform_default = /*#__PURE__*/__webpack_require__.n(styleTagTransform);
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/style/main.less
var main = __webpack_require__("./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/style/main.less");
;// ./src/style/main.less

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (styleTagTransform_default());
options.setAttributes = (setAttributesWithoutAttributes_default());

      options.insert = insertBySelector_default().bind(null, "head");
    
options.domAPI = (styleDomAPI_default());
options.insertStyleElement = (insertStyleElement_default());

var update = injectStylesIntoStyleTag_default()(main/* default */.A, options);




       /* harmony default export */ const style_main = (main/* default */.A && main/* default */.A.locals ? main/* default */.A.locals : undefined);

;// ./src/utils/templates&const.ts
const saveButtonSelector = "#uxBtnSaveVisit";
const visitActionSelector = "#ddlEditAction";
const visitActionOptionSelector = "#ddlEditAction > option";
const visitReasonSelector = "#ddlReason";
const visitReasonOptionSelector = "#ddlReason > option";
const visitNotesSelector = "#txtNotes";
const visitVerifyStarSelector = "#uxlblVerifiedBy";
const visitAuditCaregiverSelector = "#uxChkCaregiver";
const visitAuditPatientSelector = "#uxChkPatient";
const visitScheduleTimeSelector = "#lblScheduledTime";
const visitStartTimeInputSelector = "#txtVisitStartTime";
const visitEndTimeInputSelector = "#txtVisitEndTime";
const documentManagementSaveButtonSelector = "#AddEditDocumentModalSaveBtn";
const attachmentFilenameSelector = "#lblFileName";
const documentManagementDescrptionSelector = "#attachedDocumentDescription";
/* export const newMessageButtonSelector =
  "#nonServicePortalMessageFieldsContainer > tr.action-options > td > input:nth-child(2)"; */
const newMessageButtonSelector = "#htmlmodal #BtnCancel";
const newMessageReasonSelector = "#ddlReasonList1";
const newMessageReasonOptionSelector = "#ddlReasonList1 > option";
const newMessageNoteSelector = "#txtNote";
const newMessagePatientNameSelecotr = "#txtMember";
const homePageSearchButtonSelector = "#btnSearch";
const homePageCommunicationTypeSelector = "#ddlCommunicationType";
const homePageCommunicationTypeOptionSelector = "#ddlCommunicationType > option";
const homePageCoordinatorSelector = "#ddlCoordinator";
const homePageCoordinatorOptionSelector = "#ddlCoordinator > option";
const homePagestatusSelector = "#ddlstatus";
const homePagestatusOptionSelector = "#ddlstatus > option";
const prebillingSearchButtonSelector = "#ctl00_ContentPlaceHolder1_uxSearchPrebilling";
const prebillingToDateSelector = "#ctl00_ContentPlaceHolder1_uxDtToDate";
const prebillingAdvancedFilterButtonSelector = "#accordion-label";
const prebillingDisciplineButtonSelector = "#discipid_choice";
const prebillingDisciplineOptionSelectAllSelector = "#discipid_listbox > .ms-select-all > label > input";
const prebillingDisciplineOptionSelector = "#discipid_listbox > li > label > span.text-wrap-div";
const prebillingCoordinatorButtonSelector = "#coordid_choice";
const prebillingCoordinatorOptionSelectAllSelector = "#coordid_fieldset ul > .ms-select-all > label > input";
const prebillingCoordinatorOptionSelector = "#coordid_listbox > li > label > span.text-wrap-div";
const prebillingSearchResultsSelector = "#tblDetails";
const prebillingVisitAdmissionIdSelector = "#ucVisitHeader_lblAdmissionID";
const prebillingVisitDateSelector = "#ucVisitHeader_lblVisitDate";
const prebillingVisitScheduledTimeSelector = "#lblScheduledTime";
const visitPatientNameSelector = "#ucVisitHeader_lblPatientName";
const visitDateSelector = "#ucVisitHeader_lblVisitDate";
const visitDutySelector = "#tdDutySheet tbody tr td:contains";
const caregiverInfoNameSelector = "#ctl00_ContentPlaceHolder1_uxlblInfoName";
// --- incomingCallHandler ---
const TOAST_CONTAINER_SELECTOR = ".Vue-Toastification__container.bottom-left";
const TOAST_TOAST_SELECTOR = ".Vue-Toastification__toast";
const TOAST_TOAST_WRAPPER_SELECTOR = ".call-toast-wrapper";
const CALL_STATE_SELECTOR = ".CallStateAndIconWrapper__CallState";
const MAIN_CONTENT_SELECTOR = ".main-content";
const CALL_INFO_PANEL_SELECTOR = "div.call-info";
const PHONE_NUMBER_CONTAINER_SELECTOR = ".contact-otherinfo";

;// ./node_modules/@trim21/gm-fetch/dist/index.mjs
function parseRawHeaders(h) {
    const s = h.trim();
    if (!s) {
        return new Headers();
    }
    const array = s.split("\r\n").map((value) => {
        let s = value.split(":");
        return [s[0].trim(), s[1].trim()];
    });
    return new Headers(array);
}
function parseGMResponse(req, res) {
    // workaround TamperMonkey bug(?) where sometimes response is string despite responseType being "blob"
    const headers = parseRawHeaders(res.responseHeaders);
    const body = typeof res.response === "string"
        ? new Blob([res.response], { type: headers.get("Content-Type") || "text/plain" })
        : res.response;
    return new ResImpl(body, {
        statusCode: res.status,
        statusText: res.statusText,
        headers,
        finalUrl: res.finalUrl,
        redirected: res.finalUrl === req.url,
    });
}
class ResImpl {
    constructor(body, init) {
        this.rawBody = body;
        this.init = init;
        this.body = body.stream();
        const { headers, statusCode, statusText, finalUrl, redirected } = init;
        this.headers = headers;
        this.status = statusCode;
        this.statusText = statusText;
        this.url = finalUrl;
        this.type = "basic";
        this.redirected = redirected;
        this._bodyUsed = false;
    }
    get bodyUsed() {
        return this._bodyUsed;
    }
    get ok() {
        return this.status < 300;
    }
    arrayBuffer() {
        if (this.bodyUsed) {
            throw new TypeError("Failed to execute 'arrayBuffer' on 'Response': body stream already read");
        }
        this._bodyUsed = true;
        return this.rawBody.arrayBuffer();
    }
    blob() {
        if (this.bodyUsed) {
            throw new TypeError("Failed to execute 'blob' on 'Response': body stream already read");
        }
        this._bodyUsed = true;
        // `slice` will use empty string as default value, so need to pass all arguments.
        return Promise.resolve(this.rawBody.slice(0, this.rawBody.size, this.rawBody.type));
    }
    clone() {
        if (this.bodyUsed) {
            throw new TypeError("Failed to execute 'clone' on 'Response': body stream already read");
        }
        return new ResImpl(this.rawBody, this.init);
    }
    formData() {
        if (this.bodyUsed) {
            throw new TypeError("Failed to execute 'formData' on 'Response': body stream already read");
        }
        this._bodyUsed = true;
        return this.rawBody.text().then(decode);
    }
    async json() {
        if (this.bodyUsed) {
            throw new TypeError("Failed to execute 'json' on 'Response': body stream already read");
        }
        this._bodyUsed = true;
        return JSON.parse(await this.rawBody.text());
    }
    text() {
        if (this.bodyUsed) {
            throw new TypeError("Failed to execute 'text' on 'Response': body stream already read");
        }
        this._bodyUsed = true;
        return this.rawBody.text();
    }
    async bytes() {
        if (this.bodyUsed) {
            throw new TypeError("Failed to execute 'bytes' on 'Response': body stream already read");
        }
        this._bodyUsed = true;
        return new Uint8Array(await this.rawBody.arrayBuffer());
    }
}
function decode(body) {
    const form = new FormData();
    body
        .trim()
        .split("&")
        .forEach(function (bytes) {
        if (bytes) {
            const split = bytes.split("=");
            const name = split.shift()?.replace(/\+/g, " ");
            const value = split.join("=").replace(/\+/g, " ");
            form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
    });
    return form;
}

async function GM_fetch(input, init) {
    const request = new Request(input, init);
    let data;
    if (init?.body) {
        data = await request.text();
    }
    return await XHR(request, init, data);
}
function XHR(request, init, data) {
    return new Promise((resolve, reject) => {
        if (request.signal && request.signal.aborted) {
            return reject(new DOMException("Aborted", "AbortError"));
        }
        GM.xmlHttpRequest({
            url: request.url,
            method: gmXHRMethod(request.method.toUpperCase()),
            headers: Object.fromEntries(new Headers(init?.headers).entries()),
            data: data,
            responseType: "blob",
            onload(res) {
                try {
                    resolve(parseGMResponse(request, res));
                }
                catch (e) {
                    reject(e);
                }
            },
            onabort() {
                reject(new DOMException("Aborted", "AbortError"));
            },
            ontimeout() {
                reject(new TypeError("Network request failed, timeout"));
            },
            onerror(err) {
                reject(new TypeError("Failed to fetch: " + err.finalUrl));
            },
        });
    });
}
const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "TRACE", "OPTIONS", "CONNECT"];
// a ts type helper to narrow type
function includes(array, element) {
    return array.includes(element);
}
function gmXHRMethod(method) {
    if (includes(httpMethods, method)) {
        return method;
    }
    throw new Error(`unsupported http method ${method}`);
}


//# sourceMappingURL=index.mjs.map

;// ./src/utils/util.js
// import https from "https";

const tlsCiphers = (/* unused pure expression or super */ null && ([
  "TLS_CHACHA20_POLY1305_SHA256",
  "TLS_AES_128_GCM_SHA256",
  "TLS_AES_256_GCM_SHA384",
  "ECDHE-ECDSA-CHACHA20-POLY1305",
  "ECDHE-RSA-CHACHA20-POLY1305",
  "ECDHE-ECDSA-AES128-SHA256",
  "ECDHE-RSA-AES128-SHA256",
  "ECDHE-ECDSA-AES256-GCM-SHA384",
  "ECDHE-RSA-AES256-GCM-SHA384",
  "ECDHE-ECDSA-AES128-SHA",
  "ECDHE-RSA-AES128-SHA",
  "ECDHE-ECDSA-AES256-SHA",
  "ECDHE-RSA-AES256-SHA",
  "RSA-PSK-AES128-GCM-SHA256",
  "RSA-PSK-AES256-GCM-SHA384",
  "RSA-PSK-AES128-CBC-SHA",
  "RSA-PSK-AES256-CBC-SHA",
]));

const tlsSigAlgs = (/* unused pure expression or super */ null && ([
  "ecdsa_secp256r1_sha256",
  "rsa_pss_rsae_sha256",
  "rsa_pkcs1_sha256",
  "ecdsa_secp384r1_sha384",
  "rsa_pss_rsae_sha384",
  "rsa_pkcs1_sha384",
  "rsa_pss_rsae_sha512",
  "rsa_pkcs1_sha512",
  "rsa_pkcs1_sha1",
]));

// all my homies hate node-fetch
const fetch = (url, options = {}) => {
  console.log(
    "Fetching url " + url.substring(0, 200) + (url.length > 200 ? "..." : "")
  );

  return new Promise((resolve, reject) => {
    const req = fetch(
      url,
      {
        agent: options.proxy,
        method: options.method || "GET",
        headers: {
          cookie: "dummy=cookie", // set dummy cookie, helps with cloudflare 1020
          "Accept-Language": "en-US,en;q=0.5", // same as above
          ...options.headers,
        },
        ciphers: tlsCiphers.join(":"),
        sigalgs: tlsSigAlgs.join(":"),
        minVersion: "TLSv1.3",
      },
      (resp) => {
        const res = {
          statusCode: resp.statusCode,
          headers: resp.headers,
        };
        let chunks = [];
        resp.on("data", (chunk) => chunks.push(chunk));
        resp.on("end", () => {
          res.body = Buffer.concat(chunks).toString(options.encoding || "utf8");
          resolve(res);
        });
        resp.on("error", (err) => {
          console.error(err);
          reject(err);
        });
      }
    );

    req.write(options.body || "");
    req.end();
    req.on("error", (err) => {
      console.error(err);
      reject(err);
    });
  });
};

const parseSetCookie = (setCookie) => {
  if (!setCookie) {
    return {};
  }

  const cookies = {};
  for (const cookie of setCookie) {
    const sep = cookie.indexOf("=");
    cookies[cookie.slice(0, sep)] = cookie.slice(sep + 1, cookie.indexOf(";"));
  }
  return cookies;
};

const stringifyCookies = (cookies) => {
  const cookieList = [];
  for (let [key, value] of Object.entries(cookies)) {
    cookieList.push(key + "=" + value);
  }
  return cookieList.join("; ");
};

// misc utils

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const promiseTimeout = async (promise, ms, valueIfTimeout = null) => {
  return await Promise.race([promise, wait(ms).then(() => valueIfTimeout)]);
};

const findKeyOfValue = (obj, value) =>
  Object.keys(obj).find((key) => obj[key] === value);

const calcLength = (any) => {
  if (!isNaN(any)) any = any.toString();
  return any.length;
};

const removeFileExtension = (filename) => {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename; // 没有.则返回原字符串
  return filename.substring(0, lastDotIndex);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const assignIntervalTimer = (
  originBtnSelector,
  JQel,
  elId,
  bindFunc,
  param,
  direction = "left"
) => {
  // let intervalbtnGroup: string | number | NodeJS.Timer;
  let $btnGroup;

  setInterval(() => {
    $btnGroup = $(originBtnSelector).parent();
    if ($btnGroup && $(elId).length <= 0) {
      if (direction == "left") {
        $btnGroup.prepend(JQel);
      } else if (direction == "right") {
        $btnGroup.append(JQel);
      } else {
        $btnGroup.prepend(JQel);
      }
      if (param?.length > 0) {
        JQel.on("click", () => bindFunc(...param));
      } else {
        JQel.on("click", () => bindFunc());
      }

      // clearInterval(intervalbtnGroup)
    }

    //#ctl00_ContentPlaceHolder1_uxGvSearch   FOR CALLMAINTANANCE TABLE ID

    // console.log("cookies:", getAllCookies());
  }, 1000);
};

const getYesterdayFormatted = () => {
  const today = new Date();
  today.setDate(today.getDate() - 1); // 获取前一天

  const mm = String(today.getMonth() + 1).padStart(2, "0"); // 月份是从0开始的
  const dd = String(today.getDate()).padStart(2, "0");
  const yyyy = today.getFullYear();

  // return `${mm}/${dd}/${yyyy}`;
  return `${yyyy}-${mm}-${dd}`;
};

const getTodayMMDD = () => {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
};

const convertMilitaryTime = (timeStr) => {
  if (!/^\d{4}$/.test(timeStr)) {
    throw new Error("Please enter a 4-digits string, Ex. '0930', '1600'");
  }

  const hours24 = parseInt(timeStr.slice(0, 2), 10);
  const minutes = parseInt(timeStr.slice(2), 10);

  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return minutes === 0
    ? `${hours12}${period}`
    : `${hours12}:${minutes.toString().padStart(2, "0")}${period}`;
};

const searchElementInAllFrames = (win, selector) => {
  let result = null;

  function searchWindow(currentWindow) {
    try {
      if (currentWindow.document) {
        const foundElement =
          currentWindow.document.querySelector < HTMLElement > selector;
        if (foundElement) {
          result = foundElement;
          return true; // 找到了，停止搜索
        }
      }
    } catch (e) {
      console.warn("无法访问的 window:", e);
    }

    try {
      for (let i = 0; i < currentWindow.frames.length; i++) {
        const frame = currentWindow.frames[i];
        if (searchWindow(frame)) {
          return true; // 子frame中找到了，停止搜索
        }
      }
    } catch (e) {
      console.warn("无法访问 frames:", e);
    }

    return false; // 当前window和子frames都没找到
  }

  searchWindow(win);
  return result;
};

;// ./src/js/POC.ts


const POCResolver = () => {
    console.log("clicked");
    POCTick();
    POCReasonChooser();
    $(visitNotesSelector).val("task does not match plan of care");
    $(visitNotesSelector)[0].dispatchEvent(new Event("change"));
    if ($(visitVerifyStarSelector).length > 0)
        $(visitAuditCaregiverSelector).click();
};
function POCSafeTick(el) {
    if ($(el).parent().find("td:last-child > span").css("display") == "none") {
        $(el).parent().find("td:first-child input")[0].click();
    }
}
function POCTick() {
    let pocList = ["101", "107", "111", "112", "411", "502", "511"];
    for (const dutyNum of pocList) {
        POCSafeTick($(`${visitDutySelector}("${dutyNum}")`)[0]);
    }
    if ("0800-0800" == $(visitScheduleTimeSelector).text()) {
        POCSafeTick($(`${visitDutySelector}("801")`)[0]);
        POCSafeTick($(`${visitDutySelector}("802")`)[0]);
    }
}
async function POCReasonChooser() {
    let expectedReasonList = [
        "Other",
        "Attendant's identification number (s) does not match the scheduled shift or task discrepancy/task does not match plan of care",
    ], expectedActionList = [
        "Other",
        "Confirmed with the client or the client's family member/representative and documented",
        "Confirmed visit with the client or the client's family member/representative and documented",
    ];
    let select1 = $(visitReasonSelector);
    let flag = false;
    for (const expectedReason of expectedReasonList) {
        //expectedReason = other
        for (const reason of $(visitReasonOptionSelector)) {
            if (expectedReason == reason.innerText) {
                select1.val(reason.value);
                select1[0].dispatchEvent(new Event("change"));
                flag = true;
                break;
            }
        }
        if (flag)
            break;
    }
    flag = false;
    await sleep(500);
    let select2 = $(visitActionSelector);
    for (const expectedAction of expectedActionList) {
        //expectedReason = other
        for (const action of $(visitActionOptionSelector)) {
            if (expectedAction == action.innerText) {
                select2.val(action.value);
                select2[0].dispatchEvent(new Event("change"));
                flag = true;
                break;
            }
        }
        if (flag)
            break;
    }
    /*   for (const reason of $("#ddlReason > option")) {
          // console.log(reason.innerText)
          if(reason.innerText == "Attendant's identification number (s) does not match the scheduled shift or task discrepancy/task does not match plan of care"){
            select1.val((reason as HTMLOptionElement).value)
            select1[0].dispatchEvent(new Event("change"))
      
            let select2 = $('#ddlEditAction')
            for (const action of $("#ddlEditAction > option")) {
              if(action.innerText == "Other"){
                select2.val((action as HTMLOptionElement).value)
                select2[0].dispatchEvent(new Event("change"))
                break
              }
              if(action.innerText == "Other"){
                select2.val((action as HTMLOptionElement).value)
                select2[0].dispatchEvent(new Event("change"))
                break
              }
            }
          }
        } */
}

;// ./src/js/DocManagement.ts


const copyAttachmentToDescrp = () => {
    $(documentManagementDescrptionSelector).val(removeFileExtension($(attachmentFilenameSelector).attr("title")));
    $(documentManagementDescrptionSelector)[0].dispatchEvent(new Event("change"));
};

;// ./src/js/NewMessageHandler.ts

const createNewQA = async () => await messageHandler("Quality Assurance", "Today, I made a random call with the patient. The patient is well and very satisfied with the services.");
const createWelcomeCall = async () => {
    await messageHandler("Welcome call", `I spoke to PT ${$(newMessagePatientNameSelecotr).val()} and introduced myself and Always Home Care. PT. speaks Mandarin/Fuzhounese, no pets, no smoking/drinking, use cane and the address/schedule was confirmed.`);
};
async function messageHandler(reason, notes) {
    let expectedReason = reason;
    let select = $(newMessageReasonSelector);
    for (const reason of $(newMessageReasonOptionSelector)) {
        console.log(reason);
        if (expectedReason == reason.innerText) {
            select.val(reason.getAttribute("value"));
            select[0].dispatchEvent(new Event("change"));
            break;
        }
    }
    $(newMessageNoteSelector).val(notes);
    $(newMessageNoteSelector)[0].dispatchEvent(new Event("change"));
}

;// ./src/js/Prebilling.ts


const prebillingSelector = async () => {
    $(prebillingToDateSelector).val(getYesterdayFormatted());
    await sleep(100);
    $(prebillingAdvancedFilterButtonSelector)[0].click();
    await selectDiscipline();
    await selectCoordinator();
    $(prebillingSearchButtonSelector)[0].click();
    await sleep(100);
    $(prebillingAdvancedFilterButtonSelector)[0].click();
    /*     parent.document.getElementById('ctl00_ContentPlaceHolder1_iframe').style.visibility = 'hidden';
      parent.document.getElementById('ctl00_ContentPlaceHolder1_hdnPg').value = 0;
      parent.document.getElementById('ctl00_ContentPlaceHolder1_hdnRefresh').value = 1;
      parent.document.getElementById('ctl00_ContentPlaceHolder1_hdnOffSet').value = 0;
      parent.document.getElementById('ctl00_ContentPlaceHolder1_uxRefresh').style.visibility = 'hidden';
      return FillPrebillingReviewFrameNewScroll('ctl00_ContentPlaceHolder1_uxPatientName','ctl00_ContentPlaceHolder1_uxPatientId','ctl00_ContentPlaceHolder1_hdDiscipline','ctl00_ContentPlaceHolder1_hdCoordinatorMul','ctl00_ContentPlaceHolder1_hdContract','ctl00_ContentPlaceHolder1_uxAideCode','ctl00_ContentPlaceHolder1_uxAideName','ctl00_ContentPlaceHolder1_uxDtFromDate','ctl00_ContentPlaceHolder1_uxDtToDate','ctl00_ContentPlaceHolder1_uxchkType','2'); */
};
async function selectDiscipline() {
    await sleep(100);
    $(prebillingDisciplineButtonSelector)[0].click();
    await sleep(400);
    $(prebillingDisciplineOptionSelectAllSelector)[0].click();
    let expectedRole = ["Non Skilled", "PCA", "HHA"];
    for (const element of $(prebillingDisciplineOptionSelector)) {
        if (expectedRole.includes(element.innerText)) {
            /* if(!element.parentElement.parentElement.parentElement.classList.contains("selected")) */
            // console.log($(element.previousSibling)[0])
            $(element.previousSibling)[0].click();
        }
    }
    await sleep(100);
    $(prebillingDisciplineButtonSelector)[0].click();
}
//Tao Yang ext.503 TYang@alwaysNY.net
async function selectCoordinator() {
    await sleep(100);
    $(prebillingCoordinatorButtonSelector)[0].click();
    await sleep(300);
    $(prebillingCoordinatorOptionSelectAllSelector)[0].click();
    let expectedCoordinatorList = ["Tao Yang ext.503 TYang@alwaysNY.net"];
    for (const element of $(prebillingCoordinatorOptionSelector)) {
        if (expectedCoordinatorList.includes(element.innerText)) {
            /* if(!element.parentElement.parentElement.parentElement.classList.contains("selected")) */
            // $(element.previousSibling).find("input")[0].click();
            $(element.previousSibling)[0].click();
        }
    }
    await sleep(100);
    $(prebillingCoordinatorButtonSelector)[0].click();
}

;// ./src/js/MissedCall.ts


const templateForReason = {
    "Attendant failed to call in": (patientName, aideName, schedule) => `I spoke to patient ${patientName} and aide ${aideName} on ${getTodayMMDD()}. The patient confirmed that ${aideName} arrived at ${schedule.startTime}. I spoke to the aide, who stated they forgot to clock in. The aide was reminded to clock in and out for every shift, and a counseling note was placed on their profile.`,
    "Attendant failed to call out": (patientName, aideName, schedule) => `I spoke to patient ${patientName} on ${getTodayMMDD()}. The patient confirmed that aide ${aideName} left at ${schedule.endTime}. I contacted the aide, who stated they forgot to clock out. The aide was reminded to clock in and out for every shift, and a counseling note was placed on their profile. A timesheet will be submitted for this.`,
    "Attendant failed to call in and out": (patientName, aideName, schedule) => `I spoke to patient ${patientName} and aide ${aideName} on ${getTodayMMDD()}. The patient confirmed that ${aideName} arrived at ${schedule.startTime} and left at ${schedule.endTime}. I spoke to the aide, who stated they forgot to clock in and out. The aide was reminded to clock in and out for every shift, and a counseling note was placed on their profile. A timesheet will be submitted for this.`,
};
const missedCallResolver = async (reason) => {
    let aideName = getAideName(), patientName = $(visitPatientNameSelector).text();
    missedCallTimeInputer(reason);
    await missedCalledReasonChooser(reason);
    $(visitNotesSelector).val(templateForReason[reason](patientName, aideName, getScheduleTime()));
    $(visitNotesSelector)[0].dispatchEvent(new Event("change"));
    if ($(visitVerifyStarSelector).length > 0)
        $(visitAuditPatientSelector).click();
};
/* export const missedOutResolver = async() => {
    let aideName = getAideName(),
        patientName = $(visitPatientNameSelector)
    
    await MissCalledReasonChooser("Attendant failed to call out")
    $(visitNotesSelector).val(templateForReason["Attendant failed to call in"](patientName, aideName, getScheduleTime()))
    $(visitNotesSelector)[0].dispatchEvent(new Event("change"))
    if ($(visitVerifyStarSelector).length > 0) $(visitAuditPatientSelector).click()
}

export const missedInOutResolver = async() => {
    let aideName = getAideName(),
        patientName = $(visitPatientNameSelector)
    
    await MissCalledReasonChooser("Attendant failed to call in and out")
    $(visitNotesSelector).val(templateForReason["Attendant failed to call in"](patientName, aideName, getScheduleTime()))
    $(visitNotesSelector)[0].dispatchEvent(new Event("change"))
    if ($(visitVerifyStarSelector).length > 0) $(visitAuditPatientSelector).click()
} */
function getAideName() {
    let aideName, flag = false;
    // 2 Windows: 0-topWindow, 1-popupWindow
    let topWidow = window.parent;
    // 1. On patient page
    if (!flag) {
        let aideLinks = topWidow[0].document.querySelectorAll("#aidelink");
        for (const aideLink of aideLinks) {
            if (aideLink.getAttribute("onClick").includes($(visitDateSelector).text())) {
                aideName = aideLink.innerHTML.trim();
                flag = true;
                break;
            }
        }
    }
    // 2. On caregiver page
    if (!flag) {
        let result = MissedCall_searchElementInAllFrames(window.top, caregiverInfoNameSelector);
        if (result != null) {
            aideName = result.innerText.trim();
            flag = true;
        }
    }
    // 3. On CHHA Patient page
    if (!flag) {
        let hhaxLinks = topWidow[0].document.querySelectorAll(".hhax-link");
        // let hhaxLinks = searchElementInAllFrames(window.top,".hhax-link");
        // console.log(hhaxLinks)
        for (const hhaxLink of hhaxLinks) {
            if (hhaxLink.getAttribute("onClick").includes($(visitDateSelector).text())) {
                // aideName = hhaxLink.innerHTML.trim();
                // console.log(hhaxLink)
                // console.log($(hhaxLink).parent())
                aideName = $(hhaxLink)
                    .parent()
                    .find("a[onclick^='OpenAideProfileMax'")[0]
                    .innerText.trim();
                flag = true;
                break;
            }
        }
        // console.log(hhaxLinks)
        /*     for (const hhaxLink of hhaxLinks) {
              console.log(hhaxLink)
                  if (
                !flag &&
                aideLink.getAttribute("onClick").includes($(visitDateSelector).text())
              ) {
                aideName = aideLink.innerHTML.trim();
                flag = true;
                break;
              }
            } */
    }
    // 4. On CHHA Prebilling page
    if (!flag) {
        let table = MissedCall_searchElementInAllFrames(window.top, prebillingSearchResultsSelector);
        // console.log(table)
        let list = table.querySelectorAll("tbody > tr");
        for (const visit of list) {
            let date = visit.querySelector("td:nth-child(1)");
            let id = visit.querySelector("td:nth-child(2) > a");
            let time = visit.querySelector("td:nth-child(9)");
            //ucVisitHeader_lblAdmissionID
            //ucVisitHeader_lblVisitDate
            //lblScheduledTime
            // console.log($("#ucVisitHeader_lblAdmissionID").text())
            // console.log($("#ucVisitHeader_lblVisitDate").text())
            // console.log($("#lblScheduledTime").text())
            if (date?.innerText ==
                $(prebillingVisitDateSelector).text() &&
                id.innerText ==
                    $(prebillingVisitAdmissionIdSelector).text() &&
                time.innerText ==
                    $(prebillingVisitScheduledTimeSelector).text()) {
                aideName = visit.querySelector("td:nth-child(6) > a").innerText
                    .split("\n")[0]
                    .trim();
                flag = true;
                break;
            }
        }
    }
    if (!flag) {
        aideName = "AideNotFound";
        alert("AideNotFound");
    }
    return aideName;
}
function MissedCall_searchElementInAllFrames(win, selector) {
    let result = null;
    function searchWindow(currentWindow) {
        try {
            if (currentWindow.document) {
                const foundElement = currentWindow.document.querySelector(selector);
                if (foundElement) {
                    result = foundElement;
                    return true; // 找到了，停止搜索
                }
            }
        }
        catch (e) {
            console.warn("无法访问的 window:", e);
        }
        try {
            for (let i = 0; i < currentWindow.frames.length; i++) {
                const frame = currentWindow.frames[i];
                if (searchWindow(frame)) {
                    return true; // 子frame中找到了，停止搜索
                }
            }
        }
        catch (e) {
            console.warn("无法访问 frames:", e);
        }
        return false; // 当前window和子frames都没找到
    }
    searchWindow(win);
    return result;
}
function missedCallTimeInputer(reason) {
    if (reason == "Attendant failed to call in") {
        $(visitStartTimeInputSelector).val($(visitScheduleTimeSelector).text().split("-")[0]);
        $(visitStartTimeInputSelector)[0].dispatchEvent(new Event("change"));
    }
    else if (reason == "Attendant failed to call out") {
        $(visitEndTimeInputSelector).val($(visitScheduleTimeSelector).text().split("-")[1]);
        $(visitEndTimeInputSelector)[0].dispatchEvent(new Event("change"));
    }
    else if (reason == "Attendant failed to call in and out") {
        $(visitStartTimeInputSelector).val($(visitScheduleTimeSelector).text().split("-")[0]);
        $(visitStartTimeInputSelector)[0].dispatchEvent(new Event("change"));
        $(visitEndTimeInputSelector).val($(visitScheduleTimeSelector).text().split("-")[1]);
        $(visitEndTimeInputSelector)[0].dispatchEvent(new Event("change"));
    }
    else {
        console.log("Something went error");
    }
}
async function missedCalledReasonChooser(reason) {
    let expectedReason = reason, expectedAction = "Confirmed visit with the client or the client's family member/representative and documented";
    let select1 = $(visitReasonSelector);
    for (const reason of $(visitReasonOptionSelector)) {
        if (expectedReason == reason.innerText) {
            select1.val(reason.value);
            select1[0].dispatchEvent(new Event("change"));
            break;
        }
    }
    await sleep(500);
    let select2 = $(visitActionSelector);
    for (const action of $(visitActionOptionSelector)) {
        if (expectedAction == action.innerText) {
            select2.val(action.value);
            select2[0].dispatchEvent(new Event("change"));
            break;
        }
    }
}
function getScheduleTime() {
    return {
        startTime: convertMilitaryTime($(visitScheduleTimeSelector).text().split("-")[0]),
        endTime: convertMilitaryTime($(visitScheduleTimeSelector).text().split("-")[1]),
    };
}

;// ./src/js/IncomingCallHandler.ts


// --- 配置区域 (请根据需要修改) ---
const AIDE_SEARCH_URL = "https://app.hhaexchange.com/ENT2507010000/Aide/AideSearchXSLT_ns.aspx?FirstName=&Phone=";
const AIDE_SEARCH_PARAMS = "&LastName=&Type=-1&Discipline=-1&CaregiverCode=&ALtCaregiverCode=&Status=1&SSN=&CaregiverTeamID=-1&FromVisitEdit=0&CaregiverLocationID=-1&CaregiverBranchID=-1&VisitDate=&office=469,5137,5139,6475,14849&DOB=&pg=1&sort=&ord=ASC&FromPage=";
const AIDE_PROFILE_URL_TEMPLATE = "https://app.hhaexchange.com/ENT2507010000/Aide/Aide_ns.aspx?AideId={ID}";
const PATIENT_SEARCH_URL = "https://app.hhaexchange.com/ENT2507010000/Patient/PatientSearchXSLT_ns.aspx?FirstName=&LastName=&StatusID=-1&PatientID=&MRNumber=&CoordinatorId=-1&Source=-1&PatientNumber=&HomePhone=";
const PATIENT_SEARCH_PARAMS = "&AltPatientID=&TeamID=-1&LocationID=-1&BranchID=-1&DisciplineID=0&Default=false&pg=1&sort=&ord=ASC&OfficeIds=469,5137,5139,6475,14849&MedicaidID=";
const PATIENT_PROFILE_URL_TEMPLATE = "https://app.hhaexchange.com/ENT2507010000/Patient/InternalPatientInfo_ns.aspx?PatientId={ID}";
// --- 脚本核心逻辑 ---
let lastCallWasIncoming = false;
/**
 * 格式化电话号码为 HHAeXchange 接受的格式 (e.g., 917-415-2489)
 * @param rawNumber - 从页面提取的原始号码字符串
 * @returns 格式化后的号码字符串, 如果格式无效则返回 null
 */
function formatPhoneNumber(rawNumber) {
    if (!rawNumber)
        return null;
    const digits = rawNumber.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) {
        return `${digits.substring(1, 4)}-${digits.substring(4, 7)}-${digits.substring(7)}`;
    }
    else if (digits.length === 10) {
        return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    return null;
}
/**
 * 以弹窗形式打开一个URL
 * @param url - 要打开的网址
 * @param windowName - 弹窗的名称, 相同的名称会覆盖已打开的弹窗
 */
function openInPopup(url, windowName = "HHA_Search_Result") {
    const windowFeatures = "width=1200,height=900,resizable=yes,scrollbars=yes,status=yes";
    window.open(url, windowName, windowFeatures);
}
/**
 * 解析 Aide (护工) 的搜索结果
 * @param html - HHAeXchange返回的Aide搜索结果页HTML字符串
 * @returns 一个包含搜索结果信息的对象
 */
function handleAideSearchResult(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const resultsTable = doc.querySelector("#tdSearchResults");
    if (!resultsTable)
        return { count: 0, rawHtml: html };
    let resultCount = -1;
    const heading = doc.querySelector('h2[aria-describedby="tdSearchResults"]');
    if (heading) {
        const match = heading.textContent?.match(/\((\d+)\)/);
        if (match && match[1])
            resultCount = parseInt(match[1], 10);
    }
    if (resultCount === -1) {
        // Fallback
        resultCount = resultsTable.querySelectorAll("tbody tr").length;
    }
    if (resultCount === 1) {
        const row = resultsTable.querySelector("tbody tr");
        const link = row?.querySelector('a[onclick*="RedirectToAidePage"]');
        const match = link
            ?.getAttribute("onclick")
            ?.match(/RedirectToAidePage\((\d+)\)/);
        if (match && match[1]) {
            return {
                count: 1,
                finalUrl: AIDE_PROFILE_URL_TEMPLATE.replace("{ID}", match[1]),
                rawHtml: html,
            };
        }
    }
    return { count: resultCount, rawHtml: html };
}
/**
 * 解析 Patient (病人) 的搜索结果, 包含特殊过滤逻辑
 * @param html - HHAeXchange返回的Patient搜索结果页HTML字符串
 * @returns 一个包含搜索结果信息的对象
 */
function handlePatientSearchResult(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const resultsTable = doc.querySelector("#tdSearchResults");
    if (!resultsTable)
        return { count: 0, rawHtml: html };
    let resultCount = -1;
    const heading = doc.querySelector("h2");
    if (heading) {
        const match = heading.textContent?.match(/\((\d+)\)/);
        if (match && match[1])
            resultCount = parseInt(match[1], 10);
    }
    const resultRows = resultsTable.querySelectorAll("tbody tr");
    if (resultCount === -1) {
        // Fallback
        resultCount = resultRows.length;
    }
    if (resultCount === 1 && resultRows.length === 1) {
        const link = resultRows[0].querySelector('a[onclick*="RedirectToPatientPage"]');
        const match = link
            ?.getAttribute("onclick")
            ?.match(/RedirectToPatientPage\((\d+)/);
        if (match && match[1]) {
            return {
                count: 1,
                finalUrl: PATIENT_PROFILE_URL_TEMPLATE.replace("{ID}", match[1]),
                rawHtml: html,
            };
        }
    }
    else if (resultCount === 2 && resultRows.length === 2) {
        const activeRows = Array.from(resultRows).filter((row) => !row.textContent?.includes("Waiting"));
        if (activeRows.length === 1) {
            const link = activeRows[0].querySelector('a[onclick*="RedirectToPatientPage"]');
            const match = link
                ?.getAttribute("onclick")
                ?.match(/RedirectToPatientPage\((\d+)/);
            if (match && match[1]) {
                return {
                    count: 1,
                    finalUrl: PATIENT_PROFILE_URL_TEMPLATE.replace("{ID}", match[1]),
                    rawHtml: html,
                };
            }
        }
    }
    return { count: resultCount, rawHtml: html };
}
/**
 * 创建一个上下分栏的HTML页面来同时显示两个搜索结果
 * @param aideResult - Aide的搜索结果对象
 * @param patientResult - Patient的搜索结果对象
 */
function displayCombinedResults(aideResult, patientResult) {
    console.log("两边都有结果，创建合并视图...");
    const combinedHtml = `
        <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>HHA Combined Search Results</title>
            <style>
                body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: sans-serif; }
                .container { display: flex; flex-direction: column; height: 100%; }
                .panel { flex: 1; border: 1px solid #ccc; overflow: hidden; display: flex; flex-direction: column; }
                .panel h2 { margin: 0; padding: 10px; background-color: #f0f0f0; border-bottom: 1px solid #ccc; font-size: 16px; }
                .panel iframe { flex-grow: 1; border: none; width: 100%; height: 100%; }
            </style>
        </head><body>
            <div class="container">
                <div class="panel">
                    <h2>Aide (护工) 搜索结果 (${aideResult.count} a result)</h2>
                    <iframe srcdoc="${aideResult.rawHtml.replace(/"/g, "&quot;")}"></iframe>
                </div>
                <div class="panel">
                    <h2>Patient (病人) 搜索结果 (${patientResult.count} a result)</h2>
                    <iframe srcdoc="${patientResult.rawHtml.replace(/"/g, "&quot;")}"></iframe>
                </div>
            </div>
        </body></html>`;
    openInPopup(`data:text/html;charset=utf-8,${encodeURIComponent(combinedHtml)}`, "HHA_Combined_Result");
}
/**
 * 通用的后台搜索函数, 使用 GM_fetch
 * @param type - 搜索类型, 'aide' 或 'patient'
 * @param formattedNumber - 格式化后的电话号码
 * @returns 一个解析后的搜索结果对象的 Promise
 */
async function fetchHhaData(type, formattedNumber) {
    let baseUrl, params, handler;
    if (type === "aide") {
        [baseUrl, params, handler] = [
            AIDE_SEARCH_URL,
            AIDE_SEARCH_PARAMS,
            handleAideSearchResult,
        ];
    }
    else {
        [baseUrl, params, handler] = [
            PATIENT_SEARCH_URL,
            PATIENT_SEARCH_PARAMS,
            handlePatientSearchResult,
        ];
    }
    const searchUrl = `${baseUrl}${formattedNumber}${params}&_=${new Date().getTime()}`;
    try {
        const r = (await GM_fetch(searchUrl));
        if (r.status >= 200 && r.status < 400) {
            const html = await r.rawBody.text();
            return handler(html);
        }
        console.error(`HHA ${type} search failed with status: ${r.status}`);
        return { count: 0, rawHtml: `Request Failed: ${r.status}` };
    }
    catch (error) {
        console.error(`HHA ${type} search network error:`, error);
        return { count: 0, rawHtml: "Network Error" };
    }
}
/**
 * 核心调度函数：提取号码并发起并行搜索, 然后根据结果决定如何显示
 * @param callInfoPanel - 包含电话号码信息的DOM元素
 * @returns 如果成功发起搜索则返回 true, 否则返回 false
 */
async function extractAndInitiateSearch(callInfoPanel) {
    const numElement = callInfoPanel?.querySelector(PHONE_NUMBER_CONTAINER_SELECTOR);
    if (numElement && !numElement.textContent?.includes("ext:")) {
        const formattedNumber = formatPhoneNumber(numElement.textContent);
        if (formattedNumber) {
            console.log(`号码 ${formattedNumber}, 开始并行搜索 Aide 和 Patient...`);
            const [aideResult, patientResult] = await Promise.all([
                fetchHhaData("aide", formattedNumber),
                fetchHhaData("patient", formattedNumber),
            ]);
            const hasAideResult = aideResult.count > 0;
            const hasPatientResult = patientResult.count > 0;
            if (hasAideResult && !hasPatientResult) {
                aideResult.count === 1 && aideResult.finalUrl
                    ? openInPopup(aideResult.finalUrl)
                    : openInPopup(`data:text/html;charset=utf-8,${encodeURIComponent(aideResult.rawHtml)}`);
            }
            else if (!hasAideResult && hasPatientResult) {
                patientResult.count === 1 && patientResult.finalUrl
                    ? openInPopup(patientResult.finalUrl)
                    : openInPopup(`data:text/html;charset=utf-8,${encodeURIComponent(patientResult.rawHtml)}`);
            }
            else if (hasAideResult && hasPatientResult) {
                displayCombinedResults(aideResult, patientResult);
            }
            else {
                alert(`电话号码 [${formattedNumber}] 在 HHAeXchange 中未找到对应的护工或病人。`);
            }
            return true;
        }
    }
    return false;
}
/**
 * 在通话信息面板中注入一个手动搜索按钮
 * @param callInfoPanel - 将要注入按钮的目标DOM元素
 */
function injectManualSearchButton(callInfoPanel) {
    if (callInfoPanel.querySelector(".manual-search-btn-hha"))
        return;
    const button = document.createElement("button");
    button.textContent = "在HHA中搜索此号码 (Aide & Patient)";
    button.className = "manual-search-btn-hha";
    button.addEventListener("click", async (e) => {
        e.stopPropagation();
        button.textContent = "正在搜索...";
        const success = await extractAndInitiateSearch(callInfoPanel);
        if (!success)
            alert("未能在当前通话信息中找到有效的外部电话号码！");
        button.textContent = "在HHA中搜索此号码 (Aide & Patient)";
    });
    const header = callInfoPanel.querySelector(".call-info-header");
    header
        ? header.insertAdjacentElement("afterend", button)
        : callInfoPanel.prepend(button);
}
/**
 * 监视主面板的变化, 以触发自动搜索或注入按钮
 * @param mainPanel - 要监视的主内容区DOM元素
 */
function observeMainPanel(mainPanel) {
    const observer = new MutationObserver(async (mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.addedNodes.length > 0) {
                const callInfoPanel = mainPanel.querySelector(CALL_INFO_PANEL_SELECTOR);
                if (callInfoPanel &&
                    !callInfoPanel.hasAttribute("data-hha-processed")) {
                    callInfoPanel.setAttribute("data-hha-processed", "true");
                    if (lastCallWasIncoming) {
                        await extractAndInitiateSearch(callInfoPanel);
                        lastCallWasIncoming = false; // 在此处消费并重置flag，解决竞态条件
                    }
                    injectManualSearchButton(callInfoPanel);
                }
            }
        }
    });
    observer.observe(mainPanel, { childList: true, subtree: true });
}
/**
 * 监视来电通知 (Toast) 的出现
 * @param toastContainer - 包含通知的DOM元素容器
 */
function observeToasts(toastContainer) {
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node instanceof HTMLElement && node.matches(TOAST_TOAST_SELECTOR)) {
                    const callState = node
                        .querySelector(CALL_STATE_SELECTOR)
                        ?.textContent?.trim();
                    if (callState === "Incoming") {
                        lastCallWasIncoming = true; // 只在这里设置flag为true
                        node
                            .querySelector(TOAST_TOAST_WRAPPER_SELECTOR)
                            ?.click();
                    }
                }
            });
        });
    });
    observer.observe(toastContainer, { childList: true });
}
/**
 * 等待页面上某个元素加载完成
 * @param selector - 元素的CSS选择器
 * @returns 返回一个Promise, resolve时提供找到的元素
 */
function waitForElement(selector) {
    return new Promise((resolve) => {
        const el = document.querySelector(selector);
        if (el)
            return resolve(el);
        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                resolve(el);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
}
const incomingCallHandler = async () => {
    console.log("HHAeXchange 电话助手 v4.2 (并行搜索/TS/注释版) 已启动。");
    const toastContainer = await waitForElement(TOAST_CONTAINER_SELECTOR);
    const mainContent = await waitForElement(MAIN_CONTENT_SELECTOR);
    console.log("关键元素已找到，正在启动监视器...");
    observeToasts(toastContainer);
    observeMainPanel(mainContent);
};

;// ./src/js/Highlight2Call.ts
const highlight2Call = () => {
    // --- 配置区域 ---
    // 用于匹配电话号码的正则表达式
    const PHONE_REGEX = /(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/;
    // --- 脚本核心逻辑 ---
    // 使用类型注解，明确 popup 是一个 DIV 元素或 null
    let popup = null;
    /**
     * 从 DOM 中移除已存在的弹窗
     */
    function removePopup() {
        if (popup) {
            popup.remove();
            popup = null;
        }
    }
    /**
     * 创建并显示功能弹窗
     * @param phoneNumber - 匹配到的电话号码字符串
     * @param mouseEvent - 触发弹窗的 MouseEvent 事件
     */
    function createPopup(phoneNumber, mouseEvent) {
        removePopup(); // 创建前先移除旧的
        // 创建弹窗容器
        popup = document.createElement("div");
        popup.id = "highlight-caller-popup";
        // 清理电话号码，只保留数字
        const cleanedNumber = phoneNumber.replace(/\D/g, "");
        // 使用 target="_top" 来避免在 iframe 中导航失败的问题
        popup.innerHTML = `
            <div class="hcp-title">请选择操作</div>
            <div class="hcp-number">${phoneNumber}</div>
            <div class="hcp-actions">
                <a href="tel:${cleanedNumber}" class="hcp-button" target="_top">📞 打电话</a>
                <a href="sms:${cleanedNumber}" class="hcp-button" target="_top">💬 发短信</a>
            </div>
            <div class="hcp-close-btn" title="关闭">×</div>
        `;
        document.body.appendChild(popup);
        // --- 智能定位弹窗 ---
        const popupRect = popup.getBoundingClientRect();
        let top = mouseEvent.clientY + 15;
        let left = mouseEvent.clientX;
        // 防止弹窗超出视窗底部
        if (top + popupRect.height > window.innerHeight) {
            top = mouseEvent.clientY - popupRect.height - 15;
        }
        // 防止弹窗超出视窗右侧
        if (left + popupRect.width > window.innerWidth) {
            left = window.innerWidth - popupRect.width - 10;
        }
        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;
        // --- 事件绑定 ---
        // 使用 <HTMLDivElement> 类型断言，确保 querySelector 返回正确的类型
        const closeButton = popup.querySelector(".hcp-close-btn");
        if (closeButton) {
            closeButton.addEventListener("click", removePopup);
        }
        const actionButtons = popup.querySelectorAll(".hcp-button");
        actionButtons.forEach((btn) => {
            // 点击后延时关闭弹窗，确保链接跳转可以被触发
            btn.addEventListener("click", () => setTimeout(removePopup, 100));
        });
    }
    // 监听全局的 mouseup 事件
    document.addEventListener("mouseup", (e) => {
        // 如果事件目标在弹窗内，则不处理
        if (popup && popup.contains(e.target)) {
            return;
        }
        const selectedText = window.getSelection()?.toString().trim() ?? "";
        if (selectedText) {
            const match = selectedText.match(PHONE_REGEX);
            if (match) {
                const phoneNumber = match[0];
                createPopup(phoneNumber, e);
            }
            else {
                removePopup();
            }
        }
        else {
            removePopup();
        }
    });
    // 监听全局的 mousedown 事件，实现点击外部关闭弹窗
    document.addEventListener("mousedown", (e) => {
        if (popup && !popup.contains(e.target)) {
            removePopup();
        }
    });
    console.log("划词拨号/发短信助手 已启动。");
};

;// ./src/js/VisitMonitor.ts

const visitMonitor = async () => {
    // --- FIX 1: 三层防御机制，彻底杜绝脚本重复执行 ---
    // 第 1 层：检查是否在iframe中运行
    if (window.self !== window.top) {
        console.log("Status Tracker script stopped: running in an iframe.");
        return;
    }
    // 第 2 层：检查 DOM 中是否已存在UI，如果存在，说明已运行过，立即退出。
    if (document.getElementById("tracker-container")) {
        console.log("Status Tracker script stopped: UI container already exists in the DOM.");
        return;
    }
    // 第 3 层：检查全局标志位，但只有在DOM也存在时才阻止执行
    // 如果DOM不存在但标志存在，说明页面重新加载了，需要重新初始化
    const hasUI = document.getElementById("tracker-container") !== null;
    const hasFlag = window.top.visitMonitorHasRun;
    if (hasFlag && hasUI) {
        console.log("Status Tracker script stopped: already running with UI present.");
        return;
    }
    // 如果到这里，要么标志不存在，要么UI不存在（页面重载），设置标志并继续
    window.top.visitMonitorHasRun = true;
    // --- 状态与常量 ---
    const STORAGE_KEY = "hha_coordinator_tracker_list";
    let trackedCoordinators = [];
    let allCoordinators = [];
    let tempTrackedIds = new Set();
    // 新增：用于缓存追踪结果和 Office IDs
    const statusDataCache = new Map();
    let officeIdString = null;
    // --- TAB SYNC MANAGER (Story 1 & 4: Plan D 多 Tab 同步 + 边缘情况处理) ---
    /**
     * TabSyncManager - 管理多 Tab 之间的数据同步
     *
     * 功能：
     * - 使用 localStorage 存储共享数据，实现跨 Tab 数据持久化
     * - 使用 BroadcastChannel 实时通知其他 Tab 数据更新
     * - 提供缓存新鲜度判断，决定是否需要重新请求 API
     * - Story 4: 边缘情况处理（降级、错误处理、storage 事件备用）
     *
     * @see docs/adr/001-multi-tab-sync.md - 架构决策记录
     * @see docs/stories/epic-1-multi-tab-sync.md - Epic 详情
     */
    class TabSyncManager {
        constructor() {
            /** BroadcastChannel 实例，用于 Tab 间实时通信 */
            this.channel = null;
            /** storage 事件回调（用于 BroadcastChannel 不可用时的备用方案） */
            this.storageCallback = null;
            // --- 常量配置 ---
            /** localStorage 缓存键名 */
            this.CACHE_KEY = "hha_visit_monitor_cache";
            /** BroadcastChannel 频道名称 */
            this.CHANNEL_NAME = "hha-visit-monitor-sync";
            /** 缓存新鲜阈值：30秒内视为新鲜，直接使用 */
            this.FRESH_THRESHOLD = 30 * 1000;
            /** 缓存过期阈值：2分钟后视为过期，必须刷新 */
            this.STALE_THRESHOLD = 2 * 60 * 1000;
            // 生成唯一的 Tab ID
            this.tabId = `tab_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 9)}`;
            // 检测 BroadcastChannel 支持
            this.channelSupported = typeof BroadcastChannel !== "undefined";
            if (this.channelSupported) {
                try {
                    this.channel = new BroadcastChannel(this.CHANNEL_NAME);
                    console.log(`[TabSyncManager] Tab ${this.tabId} initialized with BroadcastChannel`);
                }
                catch (e) {
                    console.warn("[TabSyncManager] Failed to create BroadcastChannel:", e);
                    this.channel = null;
                }
            }
            else {
                console.warn("[TabSyncManager] BroadcastChannel not supported, falling back to localStorage + storage event");
            }
            // 注册 Tab 关闭清理
            window.addEventListener("beforeunload", () => this.cleanup());
        }
        /**
         * 从 localStorage 获取缓存的数据
         * Story 4: 增强数据验证和错误处理
         * @returns 缓存数据，如果不存在或解析失败则返回 null
         */
        getCachedData() {
            try {
                const stored = localStorage.getItem(this.CACHE_KEY);
                if (!stored)
                    return null;
                const parsed = JSON.parse(stored);
                // Story 4: 增强数据结构验证
                if (!this.isValidCacheData(parsed)) {
                    console.warn("[TabSyncManager] Invalid cache structure, clearing corrupted data");
                    this.clearCache();
                    return null;
                }
                return parsed;
            }
            catch (e) {
                // Story 4: JSON 解析错误处理
                if (e instanceof SyntaxError) {
                    console.error("[TabSyncManager] JSON parse error, clearing corrupted cache:", e.message);
                    this.clearCache();
                }
                else {
                    console.error("[TabSyncManager] Failed to read cached data:", e);
                }
                return null;
            }
        }
        /**
         * Story 4: 验证缓存数据结构是否有效
         * @param data - 待验证的数据
         */
        isValidCacheData(data) {
            if (!data || typeof data !== "object")
                return false;
            const obj = data;
            // 检查必需字段
            if (typeof obj.timestamp !== "number")
                return false;
            if (typeof obj.sourceTabId !== "string")
                return false;
            if (!obj.data || typeof obj.data !== "object")
                return false;
            // 检查 timestamp 是否合理（不超过 24 小时）
            const age = Date.now() - obj.timestamp;
            if (age < 0 || age > 24 * 60 * 60 * 1000) {
                console.warn("[TabSyncManager] Cache timestamp out of reasonable range");
                return false;
            }
            return true;
        }
        /**
         * 将数据保存到 localStorage
         * Story 4: 增强错误处理和重试机制
         * @param data - Map<string, TrackedData> 格式的状态数据
         */
        setCachedData(data) {
            try {
                // 将 Map 转换为普通对象以便 JSON 序列化
                const dataObj = {};
                data.forEach((value, key) => {
                    dataObj[key] = value;
                });
                const cacheData = {
                    data: dataObj,
                    timestamp: Date.now(),
                    sourceTabId: this.tabId,
                };
                const jsonStr = JSON.stringify(cacheData);
                // Story 4: 检查数据大小（localStorage 限制约 5MB）
                const sizeKB = new Blob([jsonStr]).size / 1024;
                if (sizeKB > 4096) {
                    // 4MB 警告阈值
                    console.warn(`[TabSyncManager] Cache size is large: ${sizeKB.toFixed(1)}KB`);
                }
                localStorage.setItem(this.CACHE_KEY, jsonStr);
                console.log(`[TabSyncManager] Cache updated by Tab ${this.tabId}, size: ${sizeKB.toFixed(1)}KB`);
            }
            catch (e) {
                this.handleStorageError(e);
            }
        }
        /**
         * 通过 BroadcastChannel 向其他 Tab 广播消息
         * @param message - 要广播的消息
         */
        broadcast(message) {
            if (this.channel) {
                try {
                    this.channel.postMessage(message);
                    console.log(`[TabSyncManager] Broadcasted ${message.type} from Tab ${this.tabId}`);
                }
                catch (e) {
                    console.error("[TabSyncManager] Failed to broadcast message:", e);
                }
            }
            // Story 4: BroadcastChannel 不可用时，storage 事件会自动触发其他 Tab
            // 不需要额外操作，setCachedData 会触发 storage 事件
        }
        /**
         * 注册消息监听器
         * Story 4: 同时注册 BroadcastChannel 和 storage 事件（备用方案）
         * @param callback - 收到消息时的回调函数
         */
        onMessage(callback) {
            this.storageCallback = callback;
            // 方案 1: BroadcastChannel（优先）
            if (this.channel) {
                this.channel.onmessage = (event) => {
                    callback(event.data);
                };
                // Story 4: 处理 BroadcastChannel 错误
                this.channel.onmessageerror = (event) => {
                    console.error("[TabSyncManager] BroadcastChannel message error:", event);
                };
            }
            // 方案 2: storage 事件（备用，当 BroadcastChannel 不可用或出错时）
            window.addEventListener("storage", (event) => {
                // 只关注我们的缓存键
                if (event.key !== this.CACHE_KEY)
                    return;
                // 只处理其他 Tab 的修改
                if (!event.newValue)
                    return;
                try {
                    const newData = JSON.parse(event.newValue);
                    // 防止自己触发自己
                    if (newData.sourceTabId === this.tabId)
                        return;
                    console.log(`[TabSyncManager] Storage event detected from Tab ${newData.sourceTabId}`);
                    // 如果 BroadcastChannel 不可用，使用 storage 事件作为备用
                    if (!this.channel && this.storageCallback) {
                        this.storageCallback({
                            type: "DATA_UPDATED",
                            sourceTabId: newData.sourceTabId,
                            timestamp: newData.timestamp,
                        });
                    }
                }
                catch (e) {
                    console.error("[TabSyncManager] Failed to parse storage event data:", e);
                }
            });
            console.log(`[TabSyncManager] Message listeners registered (BroadcastChannel: ${!!this
                .channel}, Storage: true)`);
        }
        /**
         * 判断缓存的新鲜度，决定是否需要重新请求 API
         * @param cachedTimestamp - 缓存的时间戳
         * @returns 'USE' | 'USE_AND_REFRESH' | 'REFRESH'
         *   - USE: 缓存新鲜（<30s），直接使用，不请求 API
         *   - USE_AND_REFRESH: 缓存可用但需刷新（30s-2min），先显示再后台刷新
         *   - REFRESH: 缓存过期（>2min），必须立即刷新
         */
        shouldFetchFresh(cachedTimestamp) {
            const age = Date.now() - cachedTimestamp;
            if (age < this.FRESH_THRESHOLD) {
                return "USE";
            }
            else if (age < this.STALE_THRESHOLD) {
                return "USE_AND_REFRESH";
            }
            else {
                return "REFRESH";
            }
        }
        /**
         * 清理资源，在 Tab 关闭时调用
         */
        cleanup() {
            if (this.channel) {
                // 通知其他 Tab 本 Tab 即将关闭
                this.broadcast({
                    type: "TAB_CLOSING",
                    sourceTabId: this.tabId,
                    timestamp: Date.now(),
                });
                this.channel.close();
                this.channel = null;
            }
            console.log(`[TabSyncManager] Tab ${this.tabId} cleanup complete`);
        }
        /**
         * Story 4: 增强的 localStorage 存储错误处理
         * @param error - 错误对象
         */
        handleStorageError(error) {
            console.error("[TabSyncManager] Storage error:", error.name, error.message);
            if (error.name === "QuotaExceededError") {
                console.warn("[TabSyncManager] Storage quota exceeded, attempting cleanup...");
                this.clearCache();
                // 清理其他可能的旧数据（如果需要）
                this.cleanupOldStorageData();
            }
            else if (error.name === "SecurityError") {
                // 隐私模式或其他安全限制
                console.error("[TabSyncManager] Storage access denied (possibly private browsing mode)");
            }
        }
        /**
         * Story 4: 清理旧的存储数据以释放空间
         */
        cleanupOldStorageData() {
            try {
                // 清理与本应用相关的其他旧缓存
                const keysToCheck = ["hha_visit_monitor_", "hha_coordinator_"];
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (key &&
                        keysToCheck.some((prefix) => key.startsWith(prefix)) &&
                        key !== this.CACHE_KEY) {
                        // 检查是否是旧数据（超过 7 天）
                        try {
                            const data = localStorage.getItem(key);
                            if (data) {
                                const parsed = JSON.parse(data);
                                if (parsed.timestamp &&
                                    Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
                                    localStorage.removeItem(key);
                                    console.log(`[TabSyncManager] Cleaned up old storage: ${key}`);
                                }
                            }
                        }
                        catch {
                            // 无法解析的数据，可能是旧格式，删除
                            localStorage.removeItem(key);
                        }
                    }
                }
            }
            catch (e) {
                console.error("[TabSyncManager] Failed to cleanup old storage data:", e);
            }
        }
        /**
         * 清除缓存数据
         */
        clearCache() {
            try {
                localStorage.removeItem(this.CACHE_KEY);
                console.log("[TabSyncManager] Cache cleared");
            }
            catch (e) {
                console.error("[TabSyncManager] Failed to clear cache:", e);
            }
        }
        /**
         * Story 4: 获取调试信息
         */
        getDebugInfo() {
            return {
                tabId: this.tabId,
                channelSupported: this.channelSupported,
                channelActive: !!this.channel,
                cacheKey: this.CACHE_KEY,
                hasCachedData: !!this.getCachedData(),
                cachedDataAge: this.getCachedData()?.timestamp
                    ? `${((Date.now() - this.getCachedData().timestamp) / 1000).toFixed(1)}s`
                    : "N/A",
            };
        }
    }
    // 实例化 TabSyncManager（供后续 Story 使用）
    const tabSyncManager = new TabSyncManager();
    // --- REWRITTEN: 全新的 API 参数管理器 ---
    const apiParamProvider = {
        params: null,
        /**
         * 获取并缓存所有API请求所需的基础参数
         */
        async get() {
            // 如果已经缓存了参数，直接返回
            if (this.params)
                return this.params;
            console.log("Fetching API parameters for the first time...");
            const url = "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
            const r = (await GM_fetch(url, { method: "GET" }));
            const text = await r.rawBody.text();
            /**
             * 辅助函数：使用正则表达式从大段文本中精确提取指定键的值
             * @param key 要查找的键 (例如 'userID')
             * @param sourceText 从中查找的源文本
             */
            const getParamFromText = (key, sourceText) => {
                // 正则表达式查找类似 'key: 'value'' 的模式
                const regex = new RegExp(`${key}\\s*:\\s*'([^']+)'`);
                const match = sourceText.match(regex);
                // 如果匹配成功，返回捕获组1 (也就是单引号里的值)
                return match ? match[1] : null;
            };
            /**
             * 辅助函数：从HTML中提取隐藏input的值
             */
            const getInputValue = (id, sourceText) => {
                const match = sourceText.match(new RegExp(`id="${id}"[\\s\\S]*?value="([^"]*)"`));
                return match ? match[1] : null;
            };
            // 组装并缓存所有参数
            this.params = {
                userID: getParamFromText("userID", text),
                appSecret: getParamFromText("appSecret", text),
                appVersion: getParamFromText("appVersion", text),
                version: getParamFromText("version", text),
                minorVersion: getParamFromText("minorVersion", text),
                appName: getParamFromText("appName", text),
                sessionID: getParamFromText("sessionID", text),
                vendorID: getParamFromText("vendorID", text),
                viewState: getInputValue("__VIEWSTATE", text),
                viewStateGenerator: getInputValue("__VIEWSTATEGENERATOR", text),
            };
            // 进行一次严格的检查，确保所有关键参数都已成功获取
            for (const [key, value] of Object.entries(this.params)) {
                if (!value) {
                    throw new Error(`Failed to extract critical API parameter: ${key}`);
                }
            }
            console.log("API parameters cached successfully:", this.params);
            return this.params;
        },
        /**
         * 从 HTML 文本中解析并更新 ViewState
         */
        parseViewState(htmlText) {
            const getInputValue = (id, sourceText) => {
                const match = sourceText.match(new RegExp(`id="${id}"[\\s\\S]*?value="([^"]*)"`));
                return match ? match[1] : null;
            };
            const viewState = getInputValue("__VIEWSTATE", htmlText);
            const viewStateGenerator = getInputValue("__VIEWSTATEGENERATOR", htmlText);
            if (viewState && this.params) {
                this.params.viewState = viewState;
            }
            if (viewStateGenerator && this.params) {
                this.params.viewStateGenerator = viewStateGenerator;
            }
            return {
                viewState: viewState || "",
                viewStateGenerator: viewStateGenerator || "",
            };
        },
    };
    // --- 2. HTML 结构创建 ---
    const container = document.createElement("div");
    container.id = "tracker-container";
    const dragHandle = document.createElement("div");
    dragHandle.id = "tracker-drag-handle";
    dragHandle.innerHTML = "🔔";
    const panel = document.createElement("div");
    panel.id = "tracker-panel";
    panel.innerHTML = `
         <div id="tracking-view" class="tracker-view">
            <div class="tracker-header">
              <h3 style="color: #333 !important;">各类状态追踪<span id="last-refresh-time" style="font-size: 11px; color: #666; margin-left: 8px;"></span></h3>
              <button id="edit-list-btn" class="tracker-header-btn">编辑追踪列表</button>
            </div>
            <div class="tracker-content"><table class="tracker-table"><thead><tr>
                    <th style="width:40px;color: #333 !important;">编号</th>
                    <th style="width:40px;color: #333 !important;"class="col-coordinator">辅导员 (Ext.)</th>
                    <th style="width:80px;color: #333 !important;">上班钟</th>
                    <th style="width:80px;color: #333 !important;">下班钟</th>
                    <th style="width:80px;color: #333 !important;">异常打钟</th>
                    <th style="width:80px;color: #333 !important;">消息</th>
                </tr></thead><tbody id="tracking-table-body"></tbody></table></div>
        </div>
        <div id="editing-view" class="tracker-view hidden">
            <div class="tracker-header"><button id="back-btn" class="tracker-header-btn back-btn">←</button><h3 style="color: #333 !important;">编辑追踪列表</h3></div>
            <div id="editing-content" class="tracker-content"></div>
            <div class="tracker-footer"><button id="cancel-btn" class="tracker-header-btn">取消</button><button id="save-btn" class="tracker-header-btn" style="background-color:#007bff;color:white">保存</button></div>
        </div>
    `;
    container.appendChild(dragHandle);
    container.appendChild(panel);
    document.body.appendChild(container);
    // --- 3. DOM 元素获取 ---
    const trackingView = document.getElementById("tracking-view");
    const editingView = document.getElementById("editing-view");
    const trackingTableBody = document.getElementById("tracking-table-body");
    const editingContent = document.getElementById("editing-content");
    // --- 5. 核心功能逻辑 ---
    // --- Story 2: 缓存恢复辅助函数 ---
    /**
     * 从缓存数据恢复到 statusDataCache
     * @param data - Record<string, TrackedData> 格式的缓存数据
     */
    function restoreFromCache(data) {
        statusDataCache.clear();
        for (const [key, value] of Object.entries(data)) {
            statusDataCache.set(key, value);
        }
        console.log(`[Story2] Restored ${Object.keys(data).length} items from cache`);
    }
    /**
     * 更新 UI 上的"上次更新时间"显示
     * @param timestamp - 时间戳
     */
    function updateLastRefreshTime(timestamp) {
        const timeEl = document.getElementById("last-refresh-time");
        if (timeEl) {
            const date = new Date(timestamp);
            timeEl.textContent = `（上次更新: ${date.toLocaleTimeString()}）`;
        }
    }
    function showToast(message, type) {
        const toast = document.createElement("div");
        toast.className = `tracker-toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add("show");
        }, 10);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2500);
    }
    function switchView(fromView, toView, direction = "forward") {
        toView.classList.remove("hidden");
        if (direction === "forward") {
            // 前进动画：从右往左
            toView.classList.add("slide-in-from-right");
            requestAnimationFrame(() => {
                fromView.classList.add("slide-out");
                toView.classList.add("slide-in");
                toView.classList.remove("slide-in-from-right");
            });
        }
        else {
            // 后退动画：从左往右
            toView.classList.add("slide-in-from-left");
            requestAnimationFrame(() => {
                fromView.classList.add("slide-out-to-right");
                toView.classList.add("slide-in");
                toView.classList.remove("slide-in-from-left");
            });
        }
        setTimeout(() => {
            fromView.classList.remove("slide-in", "slide-out", "slide-out-to-right");
            fromView.classList.add("hidden");
        }, 300);
    }
    function loadTrackedCoordinators() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            trackedCoordinators = stored ? JSON.parse(stored) : [];
        }
        catch (error) {
            console.error("Failed to load or parse tracked coordinators from localStorage:", error);
            trackedCoordinators = [];
        }
    }
    function saveTrackedCoordinators() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trackedCoordinators));
        }
        catch (error) {
            console.error("Failed to save tracked coordinators to localStorage:", error);
            showToast("保存失败", "error");
        }
    }
    async function fetchAllCoordinators() {
        console.log("Step 1: Fetching initial params...");
        const initialUrl = "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
        const r = (await GM_fetch(initialUrl, { method: "GET" }));
        const textResult = await r.rawBody.text();
        const getParam = (name) => textResult.match(new RegExp(`var\\s+${name}\\s*=\\s*['"]([^'"]+)['"];`))?.[1];
        const apiParams = {
            userID: getParam("gnUserID"),
            appSecret: getParam("gnApSc"),
            appVersion: getParam("gnAppVersion"),
            version: getParam("gnVersion"),
            minorVersion: getParam("gnMinorVersion"),
            appName: getParam("gnApNm"),
        };
        if (!apiParams.userID || !apiParams.appSecret) {
            throw new Error("Failed to extract initial API parameters.");
        }
        console.log("Step 2: Fetching office IDs...");
        const officeIds = await getOfficeIds();
        console.log("Step 3: Fetching coordinators...");
        const coordinatorUrl = `${initialUrl}/GetCoordinatorForOffice`;
        const officeXml = `<Offices>${officeIds
            .split(",")
            .map((id) => `<Office ID="${id}"/>`)
            .join("")}</Offices>`;
        // FIXED: Corrected the GM_fetch call and response handling
        const coordinatorRes = await GM_fetch(coordinatorUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({ officeXml }),
        });
        const coordinatorText = await coordinatorRes.rawBody.text();
        const coordinatorData = JSON.parse(coordinatorText);
        const coordinatorsRaw = JSON.parse(coordinatorData.d);
        const coordinators = coordinatorsRaw
            .map((c) => ({
            id: c.CoordinatorID,
            name: c.CoordinatorName.match(/.*?ext\.\s*\d+|[^\s@]+(?:\s+[^\s@]+)*/)?.[0] || c.CoordinatorName,
        }))
            .filter((c) => c.name.toLowerCase() !== "default");
        console.log("Step 3 Success. Found coordinators:", coordinators.length);
        return coordinators.sort((a, b) => a.name.localeCompare(b.name));
    }
    // --- 全新的追踪数据获取与解析 ---
    // --- 消息监控相关的缓存 ---
    let messageApiCache = {
        payers: null,
        payerIdWithContractChhaId: null,
        reasonIds: null,
        officeIds: null,
        timestamp: 0,
    };
    /**
     * 获取消息 API 所需的基础参数（从页面全局变量获取）
     * 这些变量在 HHAExchange 页面加载时已经存在
     * 注意：由于 Tampermonkey 运行在沙盒中，需要使用 unsafeWindow 访问页面全局变量
     */
    function getMessageApiParams() {
        // 尝试使用 unsafeWindow（Tampermonkey 提供的真实页面 window）
        // 如果不可用，回退到普通 window
        const win = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window);
        const params = {
            appVersion: win.gnAppVersion || "ENT",
            version: win.gnVersion || "25.07",
            minorVersion: win.gnMinorVersion || "1.0",
            userID: String(win.gnUserID || ""),
            appSecret: win.gnApSc || "",
            appName: win.gnApNm || "ENT",
        };
        console.log("[VisitMonitor] getMessageApiParams:", params);
        return params;
    }
    /**
     * 获取消息 API 的 base URL
     */
    function getMessageApiBaseUrl() {
        const params = getMessageApiParams();
        return `https://app.hhaexchange.com/ENTP${params.version.replace(".", "")}010000`;
    }
    /**
     * 获取消息 API 所需的 OfficeIDs (数组形式，用于其他API调用)
     */
    async function getMessageOfficeIdsArray() {
        const officeIds = await getMessageOfficeIds();
        return officeIds
            .split(",")
            .map(Number)
            .filter((n) => n > 0);
    }
    /**
     * 获取消息 API 所需的 Contract Payers 列表（包含 LinkedContractChhaId 映射）
     * 使用 GetContractPayersList API (正确的API)
     */
    async function getMessageContractPayers() {
        if (messageApiCache.payers && messageApiCache.payerIdWithContractChhaId) {
            return {
                payers: messageApiCache.payers,
                payerIdWithContractChhaId: messageApiCache.payerIdWithContractChhaId,
            };
        }
        const baseUrl = getMessageApiBaseUrl();
        const params = getMessageApiParams();
        const officeIds = await getMessageOfficeIdsArray();
        console.log("[VisitMonitor] getMessageContractPayers - fetching from:", `${baseUrl}/api/PayerNotification/GetContractPayersList`);
        console.log("[VisitMonitor] getMessageContractPayers - using officeIds:", officeIds);
        const res = (await GM_fetch(`${baseUrl}/api/PayerNotification/GetContractPayersList`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                appsecret: params.appSecret,
                appname: params.appName,
            },
            body: JSON.stringify({
                appVersion: params.appVersion,
                version: params.version,
                minorVersion: params.minorVersion,
                userID: params.userID,
                vendorId: "469", // ProviderId
                listOfficeId: officeIds,
                internalNote: "Both",
            }),
        }));
        const rawText = await res.rawBody.text();
        console.log("[VisitMonitor] getMessageContractPayers - response status:", res.status);
        const data = JSON.parse(rawText);
        const payerList = data.ListPayers || [];
        console.log("[VisitMonitor] getMessageContractPayers - payer count:", payerList.length);
        // 提取 PayerId 列表
        const payerIds = payerList
            .map((p) => p.PayerId)
            .join(",");
        // 构建 PayerId -> LinkedContractChhaId 映射
        const payerIdWithContractChhaId = payerList.map((p) => ({
            key: p.PayerId,
            value: p.LinkedContractChhaId || 0,
        }));
        messageApiCache.payers = payerIds;
        messageApiCache.payerIdWithContractChhaId = payerIdWithContractChhaId;
        console.log("[VisitMonitor] getMessageContractPayers - result payers:", payerIds.substring(0, 80) + "...");
        return { payers: payerIds, payerIdWithContractChhaId };
    }
    /**
     * 获取消息 API 所需的 Payers 列表 (向后兼容的简化版本)
     */
    async function getMessagePayers() {
        const { payers } = await getMessageContractPayers();
        return payers;
    }
    /**
     * 获取消息 API 所需的 ReasonIDs
     */
    async function getMessageReasonIds() {
        if (messageApiCache.reasonIds)
            return messageApiCache.reasonIds;
        const baseUrl = getMessageApiBaseUrl();
        const params = getMessageApiParams();
        try {
            // 首先获取 Contract Payers 数据（包含 PayerId 和 LinkedContractChhaId 映射）
            const { payers, payerIdWithContractChhaId } = await getMessageContractPayers();
            const payerIds = payers
                ? payers
                    .split(",")
                    .map(Number)
                    .filter((n) => n > 0)
                : [];
            console.log("[VisitMonitor] getMessageReasonIds - fetching from:", `${baseUrl}/api/PayerNotification/GetNotificationReasonsNewLook`);
            console.log("[VisitMonitor] getMessageReasonIds - using", payerIds.length, "payers");
            const res = (await GM_fetch(`${baseUrl}/api/PayerNotification/GetNotificationReasonsNewLook`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    appsecret: params.appSecret,
                    appname: params.appName,
                },
                body: JSON.stringify({
                    appVersion: params.appVersion,
                    version: params.version,
                    minorVersion: params.minorVersion,
                    userID: params.userID,
                    ListPayerId: payerIds,
                    InternalID: -1,
                    // 使用正确的映射：key = PayerId, value = LinkedContractChhaId
                    ListPayerIdWithContractChhaId: payerIdWithContractChhaId,
                    PayerCount: payerIds.length,
                    CommunicationType: 2, // Patient type - 这里用数字类型
                }),
            }));
            const rawText = await res.rawBody.text();
            console.log("[VisitMonitor] getMessageReasonIds - response status:", res.status);
            const data = JSON.parse(rawText);
            console.log("[VisitMonitor] getMessageReasonIds - data length:", data?.length);
            const reasonIds = data
                .map((r) => r.ReasonId)
                .join(",");
            console.log("[VisitMonitor] getMessageReasonIds - result:", reasonIds.substring(0, 100) + "...");
            messageApiCache.reasonIds = reasonIds;
            return reasonIds;
        }
        catch (error) {
            console.error("[VisitMonitor] getMessageReasonIds - error:", error);
            return "";
        }
    }
    /**
     * 获取消息 API 所需的 OfficeIDs
     * 只包含 Type: "1" 的实际 Office，排除 Type: "0" 的分组/父级
     */
    async function getMessageOfficeIds() {
        if (messageApiCache.officeIds)
            return messageApiCache.officeIds;
        const baseUrl = getMessageApiBaseUrl();
        const params = getMessageApiParams();
        try {
            console.log("[VisitMonitor] getMessageOfficeIds - fetching from:", `${baseUrl}/api/Common/GetAllOffices`);
            const res = (await GM_fetch(`${baseUrl}/api/Common/GetAllOffices`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    appsecret: params.appSecret,
                    appname: params.appName,
                },
                body: JSON.stringify({
                    appVersion: params.appVersion,
                    version: params.version,
                    minorVersion: params.minorVersion,
                    userID: params.userID,
                    SelectionType: "filter",
                    PermissionName: "Smart Map Beta",
                }),
            }));
            const rawText = await res.rawBody.text();
            console.log("[VisitMonitor] getMessageOfficeIds - response status:", res.status);
            const data = JSON.parse(rawText);
            console.log("[VisitMonitor] getMessageOfficeIds - data length:", data?.length);
            // 只包含 Type: "1" 的实际 Office，排除 Type: "0" 的分组/父级（如 OfficeID 720）
            const officeIds = data
                .filter((o) => o.OfficeID > 0 && o.Type === "1")
                .map((o) => o.OfficeID)
                .join(",");
            console.log("[VisitMonitor] getMessageOfficeIds - result:", officeIds);
            messageApiCache.officeIds = officeIds;
            return officeIds;
        }
        catch (error) {
            console.error("[VisitMonitor] getMessageOfficeIds - error:", error);
            return "";
        }
    }
    /**
     * 获取指定 Coordinator 的消息通知
     * @param coordinatorId - Coordinator ID
     * @returns TrackedData 包含消息数量和详情
     */
    async function fetchMessageReport(coordinatorId) {
        try {
            const baseUrl = getMessageApiBaseUrl();
            const params = getMessageApiParams();
            // 先获取 payers（因为 reasonIds 依赖它）
            const payers = await getMessagePayers();
            // 然后并行获取 reasonIds 和 officeIds
            const [reasonIds, officeIds] = await Promise.all([
                getMessageReasonIds(),
                getMessageOfficeIds(),
            ]);
            console.log("[VisitMonitor] fetchMessageReport - got payers:", payers ? payers.substring(0, 50) + "..." : "(empty)");
            console.log("[VisitMonitor] fetchMessageReport - got reasonIds:", reasonIds ? reasonIds.substring(0, 50) + "..." : "(empty)");
            console.log("[VisitMonitor] fetchMessageReport - got officeIds:", officeIds || "(empty)");
            const requestBody = {
                appVersion: params.appVersion,
                version: params.version,
                minorVersion: params.minorVersion,
                userID: params.userID,
                MessageType: -1,
                Status: "1", // 1 = Open, -1 = All (字符串类型)
                ProviderId: "469", // VendorID - hardcoded for now, could be made dynamic
                IsConversation: 0,
                KeySearch: "",
                Pagination: {
                    PageNumber: 1,
                    SortItem: "CreatedDate",
                    SortOrder: "DESC",
                    PageSize: "50",
                },
                IsNewLook: true,
                CommunicationType: "2", // 2 = Patient type (字符串类型)
                UserName: "", // Will be filled if needed
                NoOfDays: 1,
                UseMirrorConnection: true,
                Internal: -1,
                IsServicePortalNote: 0,
                CoordinatorID: String(coordinatorId), // 转为字符串
                Payers: payers,
                FromDate: "",
                ToDate: "",
                OfficeIDs: officeIds,
                ReasonIDs: reasonIds,
            };
            console.log("[VisitMonitor] fetchMessageReport - Request URL:", `${baseUrl}/api/PayerNotification/PayerNotificationSearch`);
            console.log("[VisitMonitor] fetchMessageReport - Request Body:", JSON.stringify(requestBody, null, 2));
            const res = (await GM_fetch(`${baseUrl}/api/PayerNotification/PayerNotificationSearch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    appsecret: params.appSecret,
                    appname: params.appName,
                },
                body: JSON.stringify(requestBody),
            }));
            const rawText = await res.rawBody.text();
            console.log("[VisitMonitor] fetchMessageReport - Response status:", res.status);
            console.log("[VisitMonitor] fetchMessageReport - Response raw:", rawText.substring(0, 500));
            const data = JSON.parse(rawText);
            console.log("[VisitMonitor] fetchMessageReport - Parsed data length:", data?.length);
            // 解析消息数据
            const details = data.map((item) => {
                const createdDate = item.CreatedDate || "";
                const createdTime = item.CreatedTime || "";
                const dateHoverDisplay = item.CreatedDateHoverDisplay || "";
                // 格式化日期时间显示："MM/DD/YYYY HH:MM:SS AM/PM (Yesterday)"
                let dateTimeDisplay = "";
                if (dateHoverDisplay) {
                    // dateHoverDisplay 格式如 "Sat Dec 13 12:13 PM" 或 "Thu Dec 12 09:46 AM"
                    // 从 dateHoverDisplay 中提取实际日期
                    const now = new Date();
                    let actualDate;
                    // 尝试从 dateHoverDisplay 中解析日期
                    // 格式: "DayOfWeek Month Day HH:MM AM/PM"
                    const dateMatch = dateHoverDisplay.match(/\w{3}\s+(\w{3})\s+(\d{1,2})\s+(\d{1,2}):(\d{2})\s+(\w{2})/);
                    if (dateMatch) {
                        const [, monthStr, dayStr, hourStr, minuteStr, ampm] = dateMatch;
                        const monthMap = {
                            Jan: 0,
                            Feb: 1,
                            Mar: 2,
                            Apr: 3,
                            May: 4,
                            Jun: 5,
                            Jul: 6,
                            Aug: 7,
                            Sep: 8,
                            Oct: 9,
                            Nov: 10,
                            Dec: 11,
                        };
                        const month = monthMap[monthStr];
                        const day = parseInt(dayStr);
                        let year = now.getFullYear();
                        // 如果日期在未来（例如 12月底显示 1月初的消息），则是去年
                        if (month > now.getMonth() ||
                            (month === now.getMonth() && day > now.getDate())) {
                            year--;
                        }
                        actualDate = new Date(year, month, day);
                    }
                    else {
                        // 回退到原有逻辑
                        if (createdDate === "Yesterday") {
                            actualDate = new Date(now);
                            actualDate.setDate(actualDate.getDate() - 1);
                        }
                        else if (createdDate === "Today") {
                            actualDate = new Date(now);
                        }
                        else {
                            actualDate = new Date(createdDate);
                        }
                    }
                    // 格式化为 MM/DD/YYYY HH:MM:SS AM/PM
                    const month = String(actualDate.getMonth() + 1).padStart(2, "0");
                    const day = String(actualDate.getDate()).padStart(2, "0");
                    const year = actualDate.getFullYear();
                    // 从 createdTime 中提取时间部分（如 "12:13:26 PM"）
                    const timeStr = createdTime || "";
                    dateTimeDisplay = `${month}/${day}/${year} ${timeStr} (${createdDate})`;
                }
                else {
                    dateTimeDisplay = `${createdDate} ${createdTime}`;
                }
                return {
                    notificationId: item.NotificationId,
                    patientId: item.PatientId,
                    memberName: item.MemberName?.trim() || "",
                    payerName: item.PayerName || "",
                    reason: item.Reason || "",
                    note: item.Note || "",
                    status: item.Status || "",
                    createdDate: createdDate,
                    createdTime: createdTime,
                    createdDateTimeDisplay: dateTimeDisplay,
                    createdDateHoverDisplay: dateHoverDisplay,
                    coordinatorName: item.CoordinatorName || "",
                    officeName: item.OfficeName || "",
                    fromUserName: item.FromUserName || "",
                    canReplyClose: item.CanReplyClose || false,
                    isPatientNote: item.IsPatientNote || false,
                };
            });
            // TotalRecords 在每个 item 中都有，取第一个即可
            const count = data.length > 0 ? data[0].TotalRecords || data.length : 0;
            return {
                count,
                details,
                timestamp: Date.now(),
            };
        }
        catch (error) {
            console.error(`Failed to fetch message report for coordinator ${coordinatorId}:`, error);
            return {
                count: 0,
                details: [],
                timestamp: Date.now(),
            };
        }
    }
    /**
     * 获取并缓存所有 Office IDs
     */
    async function getOfficeIds() {
        if (officeIdString)
            return officeIdString;
        const r = (await GM_fetch("https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx", { method: "GET" }));
        const textResult = await r.rawBody.text();
        const getParam = (name) => textResult.match(new RegExp(`var\\s+${name}\\s*=\\s*['"]([^'"]+)['"];`))?.[1];
        const apiParams = {
            userID: getParam("gnUserID"),
            appSecret: getParam("gnApSc"),
            appVersion: getParam("gnAppVersion"),
            version: getParam("gnVersion"),
            minorVersion: getParam("gnMinorVersion"),
            appName: getParam("gnApNm"),
        };
        const officeUrl = `https://app.hhaexchange.com/HHAWS${apiParams.appVersion}${apiParams.version.replace(".", "")}010000/Office.asmx/GetAllOffices`;
        const officePayload = {
            ...apiParams,
            IPAddress: "127.0.0.1",
            PayrollSetupID: "-1",
            permissionName: "",
            selectedOfficeID: "-1",
            selectionType: "Filter",
        };
        // FIXED: Corrected the GM_fetch call and response handling
        const officeRes = (await GM_fetch(officeUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify(officePayload),
        }));
        const officeText = await officeRes.rawBody.text();
        const officeData = JSON.parse(officeText);
        const offices = JSON.parse(officeData.d);
        const officeIDs = offices
            .map((o) => o.OfficeID)
            .filter((id) => id > 0);
        officeIdString = officeIDs.join(",");
        return officeIdString;
    }
    /**
     * 解析返回的HTML报告
     */
    function parseCallReport(htmlText) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const caption = doc.querySelector("#tdSearchResults caption");
        const captionText = caption?.textContent || "";
        const countMatch = captionText.match(/\((\d+)\)/);
        const count = countMatch ? parseInt(countMatch[1], 10) : 0;
        if (count === 0) {
            return { count: 0, details: [] };
        }
        const details = [];
        const rows = doc.querySelectorAll("#tdSearchResults tbody tr");
        rows.forEach((row) => {
            const cells = Array.from(row.querySelectorAll("td"));
            if (cells.length < 11)
                return;
            // FIX: 分离 Patient Name 和电话号码
            const patientCell = cells[0];
            const patientName = patientCell.querySelector("a")?.textContent?.trim() || "";
            const phones = [];
            const phoneDropdown = patientCell.querySelector(".dropdown-pane");
            if (phoneDropdown) {
                phoneDropdown.querySelectorAll(".mb05").forEach((item) => {
                    const label = item.querySelector("label")?.textContent?.trim();
                    const phone = item.querySelector("span")?.textContent?.trim();
                    if (label && phone) {
                        phones.push({ label, phone });
                    }
                });
            }
            details.push({
                patientName,
                phones,
                assignmentId: cells[1]?.textContent?.trim() || "",
                admissionId: cells[2]?.textContent?.trim() || "",
                caregiverName: cells[3]?.textContent?.trim() || "",
                visitDate: cells[4]?.textContent?.trim() || "",
                coordinators: cells[5]?.textContent?.trim() || "",
                schedule: cells[6]?.textContent?.trim() || "",
                contract: cells[7]?.textContent?.trim() || "",
                discipline: cells[8]?.textContent?.trim() || "",
                serviceCode: cells[9]?.textContent?.trim() || "",
                caregiverTeam: cells[10]?.textContent?.trim() || "",
            });
        });
        return { count, details };
    }
    /**
     * 获取单个状态报告 (上班钟或下班钟)
     */
    async function fetchStatusReport(coordinatorId, callType, officeIds) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
        const toDate = `${yyyy}-${mm}-${dd} 23:59:00`;
        const time = Date.now();
        const url = new URL("https://app.hhaexchange.com/ENT2507010000/Call/CallReportsXSLT_ns.aspx");
        const params = url.searchParams;
        params.set("CallType", callType.toString());
        params.set("VendorID", "469"); // This might need to be dynamic later
        params.set("CoordinatorID", coordinatorId.toString());
        params.set("FromDate", fromDate);
        params.set("ToDate", toDate);
        params.set("time", time.toString());
        params.set("OfficeId", officeIds);
        // Add other static params
        params.set("sort", "VisitDate");
        params.set("ord", "DESC");
        params.set("Source", "-1");
        params.set("CaregiverTeamID", "-1");
        params.set("SkillType", "-1");
        params.set("HideVisitWithTimeSheetRequired", "false");
        params.set("TimesheetRequired", "-1");
        params.set("PatientTeamID", "-1");
        params.set("PatientLocationID", "-1");
        params.set("PatientBranchID", "-1");
        params.set("CaregiverLocationID", "-1");
        params.set("CaregiverBranchID", "-1");
        params.set("DisciplineIDs", "0");
        const response = await GM_fetch(url.toString(), { method: "GET" });
        const htmlText = await response.rawBody.text();
        const parsedData = parseCallReport(htmlText);
        return { ...parsedData, timestamp: Date.now() };
    }
    // --- 追踪数据获取与解析 ---
    /**
     * 获取“异常打钟”报告
     */
    async function fetchAnomalyReport(coordinatorId) {
        const apiParams = await apiParamProvider.get();
        const url = `https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx?VisitStatus=13&s=${apiParams.sessionID}&Version=${apiParams.version}&MinorVersion=${apiParams.minorVersion}&AppVersion=${apiParams.appVersion}`;
        const today = new Date();
        // ASP.NET 页面期望 MM/dd/yyyy 格式
        const toDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;
        // 使用 URLSearchParams 来构建一个与浏览器完全一致的 Form Data
        const formData = new URLSearchParams();
        // --- Form Data (严格按照您提供的列表构建) ---
        // 动态替换的关键参数
        formData.append("__VIEWSTATE", apiParams.viewState);
        formData.append("__VIEWSTATEGENERATOR", apiParams.viewStateGenerator);
        formData.append("ctl00$ucMenu$hidMenuUserId", apiParams.userID);
        formData.append("ctl00$hdnSessionID", apiParams.sessionID);
        formData.append("ctl00$hdnAppVersion", apiParams.appVersion);
        formData.append("ctl00$hdnVersion", apiParams.version);
        formData.append("ctl00$hdnMinorVersion", apiParams.minorVersion);
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnuserid", apiParams.userID);
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnappVersion", apiParams.appVersion);
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnversion", apiParams.version);
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnminorVersion", apiParams.minorVersion);
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnAppSecret", apiParams.appSecret);
        // 注意: IPAddress 最好不要硬编码，但如果服务器不校验，则可以使用一个占位符
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnIpAddress", "127.0.0.1");
        // Office IDs
        const officeIds = officeIdString || (await getOfficeIds());
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnOffices", officeIds);
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnAllOffices", officeIds);
        formData.append("ctl00$ContentPlaceHolder1$hdnSelectedOffices", officeIds);
        // 用户与日期参数
        formData.append("ctl00$ContentPlaceHolder1$uxDdlCoordinator", coordinatorId.toString());
        formData.append("ctl00$ContentPlaceHolder1$hdnSelectedCoordinator", coordinatorId.toString());
        formData.append("ctl00$ContentPlaceHolder1$uxDtFromDate", "08/04/2025"); // 根据要求固定 (注意格式)
        formData.append("ctl00$ContentPlaceHolder1$uxDtToDate", toDate);
        // ContentPlaceHolder1 下的其他动态参数
        formData.append("ctl00$ContentPlaceHolder1$hdnUserID", apiParams.userID);
        formData.append("ctl00$ContentPlaceHolder1$hdnAppVersion", apiParams.appVersion);
        formData.append("ctl00$ContentPlaceHolder1$hdnVersion", apiParams.version);
        formData.append("ctl00$ContentPlaceHolder1$hdnMinorVersion", apiParams.minorVersion);
        formData.append("ctl00$ContentPlaceHolder1$hdnServicePath", "/HHAWSENT2507010000/");
        formData.append("ctl00$ContentPlaceHolder1$hdnAppName", apiParams.appName);
        formData.append("ctl00$ContentPlaceHolder1$hdnAppSecret", apiParams.appSecret);
        formData.append("ctl00$ContentPlaceHolder1$hdnWSURL", "/HHAWSENT2507010000/");
        formData.append("ctl00$ContentPlaceHolder1$hdnSessionId", apiParams.sessionID);
        formData.append("ctl00$ContentPlaceHolder1$hdnVendorID", apiParams.vendorID);
        // 静态参数 (完全复制)
        formData.append("__LASTFOCUS", "");
        formData.append("__EVENTTARGET", "");
        formData.append("__EVENTARGUMENT", "");
        formData.append("ctl00$hidUserMessageID", "");
        formData.append("ctl00$ucMenu$hidAgenciesUsingNewPendingPlacementVendor", "true");
        formData.append("ctl00$ucMenu$hidMenuVendorId", "469");
        formData.append("ctl00$hdnShowCmpArtMenu", "0");
        formData.append("ctl00$hdnMobileChatAppVersionID", "34");
        formData.append("ctl00$hdnChatAccess", "False");
        formData.append("ctl00$hdnProviderAppVersionID", "101");
        formData.append("ctl00$hdnIsOldHistoryEnabled", "0");
        formData.append("ctl00$hdnIsNewHistoryEnabled", "1");
        formData.append("ctl00$hdnHistoryViewerUrl", "https://app.hhaexchange.com/history/");
        formData.append("ctl00$hdnWebcomponentsLibraryUrl", "https://unpkg.com/foundation-web-components/umd/webcomponents.js");
        formData.append("ctl00$hdnFileSizeText", "20");
        formData.append("ctl00$hdnFileSizeLimit", "20971520");
        formData.append("selectAll", "on");
        // 对于有多个同名键的情况，需要多次 append
        const officeIdList = officeIds.split(",");
        officeIdList.forEach((id) => formData.append("selectItem", id));
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnWebURL", "/HHAWSENT2507010000/Office.asmx");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnCallbackFunction", "UpdateOfficeData();");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnSingleSelect", "false");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnIsDisable", "false");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnWidth", "178");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnAutoPostback", "False");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnDefaultText", "Select one or more...");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnOnClientSideLoad", "bindedOn();");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnPermissionName", "");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnSelectionType", "Filter");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnRevokeMethod", "");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnSelectAllRevokeMethod", "");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnOnOpenFunction", "OnOpen();");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnOnCloseNoChangeFunction", "OnClientClose();");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnGetDependentControls", "");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnOnSingleSelect", "");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnEmptyDisable", "false");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnNoOffice", "false");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnShowUnassignedOfficeForReferrals", "false");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnSetOfficeSelectionValue", "");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnPayrollSetupID", "-1");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnCaregiverID", "");
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnCustomeMethod", "");
        // hdnOfficeNames 最好动态生成，但如果固定也可以
        formData.append("ctl00$ContentPlaceHolder1$divOffice$hdnOfficeNames", "Always Home Care,AHC – New York,AHC -- Richmond,Private Duty Expert,Always NHTD/TBI");
        formData.append("ctl00$ContentPlaceHolder1$uxtxtFromTime", "");
        formData.append("ctl00$ContentPlaceHolder1$uxtxtToTime", "");
        formData.append("ctl00$ContentPlaceHolder1$uxTxtAideFirstName", "");
        formData.append("ctl00$ContentPlaceHolder1$uxTxtAideLastName", "");
        formData.append("ctl00$ContentPlaceHolder1$txtCaregiverCode", "");
        formData.append("ctl00$ContentPlaceHolder1$uxDdlTeam", "-1");
        formData.append("ctl00$ContentPlaceHolder1$hdnSelectedCaregiverTeam", "");
        formData.append("ctl00$ContentPlaceHolder1$uxDdlCaregiverLocation", "-1");
        formData.append("ctl00$ContentPlaceHolder1$hdnSelectedCaregiverLocation", "");
        formData.append("ctl00$ContentPlaceHolder1$uxDdlCaregiverBranch", "-1");
        formData.append("ctl00$ContentPlaceHolder1$hdnSelectedCaregiverBranch", "");
        formData.append("ctl00$ContentPlaceHolder1$uxTxtAssignmentID", "");
        formData.append("ctl00$ContentPlaceHolder1$uxTxtAdmissionID", "");
        formData.append("ctl00$ContentPlaceHolder1$uxDdlContract", "-1");
        formData.append("ctl00$ContentPlaceHolder1$hdnSelectedContract", "");
        // 多个 selectItem
        const maintenanceStatus = [
            "9",
            "15",
            "19",
            "24",
            "11",
            "10",
            "14",
            "16",
            "12",
            "22",
            "23",
            "18",
            "20",
            "21",
            "13",
            "8",
            "43",
            "25",
            "26",
            "27",
            "36",
            "33",
            "34",
            "29",
            "32",
        ];
        maintenanceStatus.forEach((item) => formData.append("selectItem", item));
        formData.append("ctl00$ContentPlaceHolder1$hdnCallerInfo", "");
        formData.append("ctl00$ContentPlaceHolder1$hdnBroadcastReceivedPageSize", "25");
        formData.append("ctl00$ContentPlaceHolder1$hdnAltCaregiverValue", "Caregiver");
        formData.append("ctl00$ContentPlaceHolder1$hdnAltPatientValue", "Patient");
        formData.append("ctl00$ContentPlaceHolder1$hdnAltFOBValue", "FOB");
        formData.append("ctl00$ContentPlaceHolder1$hdnIsBeaconDeviceEnable", "691,651,262,339,959,338,370,155,180,243,848,216,241,194,939,543,709,1730,377,674,733,801,744");
        formData.append("ctl00$ContentPlaceHolder1$hdnddlMaintenanceStatus", maintenanceStatus.join(","));
        formData.append("ctl00$ContentPlaceHolder1$uxTxtPatientFirstName", "");
        formData.append("ctl00$ContentPlaceHolder1$uxTxtPatientLastName", "");
        formData.append("ctl00$ContentPlaceHolder1$uxDdlPatientTeam", "-1");
        formData.append("ctl00$ContentPlaceHolder1$hdnSelectedPatientTeam", "");
        formData.append("ctl00$ContentPlaceHolder1$uxDdlPatientLocation", "-1");
        formData.append("ctl00$ContentPlaceHolder1$hdnSelectedPatientLocation", "");
        formData.append("ctl00$ContentPlaceHolder1$uxDdlPatientBranch", "-1");
        formData.append("ctl00$ContentPlaceHolder1$hdnSelectedPatientBranch", "");
        formData.append("ctl00$ContentPlaceHolder1$uxBtnSearch", "Search");
        formData.append("ctl00$ContentPlaceHolder1$hdnCallReprocessLimit", "1000");
        // GvSearch controls are likely not needed as they are response-related
        formData.append("ctl00$ContentPlaceHolder1$uxDdlVendor", "469");
        formData.append("ctl00$ContentPlaceHolder1$uxHidRefresh", "");
        formData.append("ctl00$ContentPlaceHolder1$uxHidValidateScheduleOvertime", "True");
        formData.append("ctl00$ContentPlaceHolder1$uxHidScheduleOvertimePwd", "");
        formData.append("ctl00$ContentPlaceHolder1$uxHidAideID", "");
        formData.append("ctl00$ContentPlaceHolder1$uxHidAideCode", "");
        formData.append("ctl00$ContentPlaceHolder1$uxHidFromCallDashBoard", "1");
        formData.append("ctl00$ContentPlaceHolder1$hdnFromTime", "");
        formData.append("ctl00$ContentPlaceHolder1$hdnToTime", "");
        formData.append("ctl00$ContentPlaceHolder1$hidProviderURL", "https://app.hhaexchange.com/PROVIDER2507010000/caregiver-availability");
        formData.append("ctl00$ContentPlaceHolder1$hdnEditSkilledSchedule", "True");
        formData.append("ctl00$ContentPlaceHolder1$hdnEditNonSkillSchedule", "True");
        formData.append("ctl00$ContentPlaceHolder1$hdnEditPayrollInfoAfterPayroll", "False");
        formData.append("ctl00$ContentPlaceHolder1$hdnEditPayrollInfoAfterBilling", "False");
        formData.append("ctl00$ContentPlaceHolder1$hdnInternalEditScheduleTime", "True");
        formData.append("ctl00$ContentPlaceHolder1$hdnLinkCall", "True");
        formData.append("ctl00$ContentPlaceHolder1$hdnAllowLinkingUnrecognizedNumber", "True");
        formData.append("ctl00$ContentPlaceHolder1$hdnEditPatientProfile", "False");
        formData.append("ctl00$ContentPlaceHolder1$hdnReportPagePath", "https://reports.hhaexchange.com/HHAReportsML/Reports/");
        formData.append("ctl00$ContentPlaceHolder1$hdnReportServicepath", "http://AWSProdWebRP2/HHAReportsWS/ReportWebService.asmx");
        formData.append("ctl00$ContentPlaceHolder1$hdnControlID", "");
        formData.append("ctl00$ContentPlaceHolder1$hdnCallDashboardCorrections", "");
        formData.append("ctl00$ContentPlaceHolder1$hdnHistoryData", "");
        formData.append("ctl00$ContentPlaceHolder1$hdnIspopupOpen", "");
        formData.append("ctl00$ContentPlaceHolder1$hdnKafkaWebAPIPath", "/HHAXKafkaAPI20070100/api/");
        formData.append("ctl00$ContentPlaceHolder1$hdnHistoryURL", "/HHAHistory/");
        formData.append("ctl00$ContentPlaceHolder1$hdnMessageType", "2");
        formData.append("ctl00$ContentPlaceHolder1$hdnMessageSource", "3");
        formData.append("ctl00$ContentPlaceHolder1$hdnAllowLinkingUnrecognizedFOB", "True");
        formData.append("ctl00$ContentPlaceHolder1$hdnAllowLinkingUnrecognizedGPS", "True");
        const response = await GM_fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch anomaly report: ${response.status} ${response.statusText}`);
        }
        const htmlText = await response.rawBody.text();
        return { ...parseAnomalyReport(htmlText), timestamp: Date.now() };
    }
    /**
     * 解析异常打钟报告 HTML
     */
    function parseAnomalyReport(htmlText) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const countSpan = doc.querySelector("#ctl00_ContentPlaceHolder1_uxlblSearchCount");
        const countMatch = countSpan?.textContent?.match(/\((\d+)\)/);
        const count = countMatch ? parseInt(countMatch[1], 10) : 0;
        const { viewState, viewStateGenerator } = apiParamProvider.parseViewState(htmlText);
        const details = [];
        if (count > 0) {
            const rows = doc.querySelectorAll("#ctl00_ContentPlaceHolder1_uxGvSearch > tbody > tr");
            rows.forEach((row) => {
                const cells = Array.from(row.querySelectorAll("td"));
                if (cells.length < 12)
                    return;
                // FIX: 电话号码换行处理
                let phoneHtml = cells[4]?.innerHTML || "";
                phoneHtml = phoneHtml
                    .replace(/Phone2:/g, "<br>Phone2:")
                    .replace(/Phone3:/g, "<br>Phone3:");
                // FIX: 只获取 Status 标题
                const statusCell = cells[11];
                const statusText = statusCell
                    ?.querySelector('span[id*="uxlblStatus"]')
                    ?.textContent?.trim() ||
                    statusCell?.textContent?.trim() ||
                    "";
                details.push({
                    assignId: cells[0]?.textContent?.trim() || "",
                    caregiverCode: cells[1]?.textContent?.trim() || "",
                    caregiverName: cells[2]?.textContent?.trim() || "",
                    officeName: cells[3]?.textContent?.trim() || "",
                    caregiverPhone: phoneHtml,
                    caregiverTeam: cells[5]?.textContent?.trim() || "",
                    patientName: cells[6]?.textContent?.trim() || "",
                    callDate: cells[7]?.textContent?.trim() || "",
                    callTime: cells[8]?.textContent?.trim() || "",
                    callType: cells[9]?.textContent
                        ?.trim()
                        .replace(/History/gi, "")
                        .trim() || "", // FIX: 移除 "History"
                    callerId: cells[10]?.textContent?.trim() || "",
                    status: statusText,
                });
            });
        }
        return { count, details, viewState, viewStateGenerator };
    }
    // --- 视图渲染 (renderTrackingView 已更新) ---
    function renderTrackingView() {
        if (trackedCoordinators.length === 0) {
            trackingTableBody.innerHTML = `<tr><td colspan="6" style="color: #333 !important;">没有正在追踪的 Coordinator</td></tr>`; // colspan 改为 6
            return;
        }
        const rowsHtml = trackedCoordinators
            .map((coordinator, index) => {
            const clockInData = statusDataCache.get(`${coordinator.id}-2`);
            const clockOutData = statusDataCache.get(`${coordinator.id}-3`);
            const anomalyData = statusDataCache.get(`${coordinator.id}-anomaly`);
            const messageData = statusDataCache.get(`${coordinator.id}-message`);
            const clockInCount = clockInData?.count ?? 0;
            const clockOutCount = clockOutData?.count ?? 0;
            const anomalyCount = anomalyData?.count ?? 0;
            const messageCount = messageData?.count ?? 0;
            const clockInStatus = clockInCount > 0 ? "status-error" : "status-ok";
            const clockOutStatus = clockOutCount > 0 ? "status-error" : "status-ok";
            const anomalyStatus = anomalyCount > 0 ? "status-error" : "status-ok";
            const messageStatus = messageCount > 0 ? "status-error" : "status-ok";
            return `
                <tr>
                    <td style="color: #333 !important;">${index + 1}</td>
                    <td class="col-coordinator" style="color: #333 !important;">${coordinator.name}</td>
                    <td><div class="status-icon ${clockInStatus}" data-coordinator-id="${coordinator.id}" data-call-type="2">${clockInCount}</div></td>
                    <td><div class="status-icon ${clockOutStatus}" data-coordinator-id="${coordinator.id}" data-call-type="3">${clockOutCount}</div></td>
                    <td><div class="status-icon ${anomalyStatus}" data-coordinator-id="${coordinator.id}" data-call-type="anomaly">${anomalyCount}</div></td>
                    <td><div class="status-icon ${messageStatus}" data-coordinator-id="${coordinator.id}" data-call-type="message">${messageCount}</div></td>
                </tr>`;
        })
            .join("");
        trackingTableBody.innerHTML = rowsHtml;
    }
    // FIX 2: 移除函数参数，使其直接使用上层作用域的 allCoordinators 状态变量
    function renderEditingView() {
        const tableHtml = `
            <table class="tracker-table">
                <thead><tr><th style="color: #333 !important;"class="col-coordinator">所有可用 Coordinator</th><th style="color: #333 !important;">操作</th></tr></thead>
                <tbody id="editing-table-body">
                    ${allCoordinators
            .map((c) => `
                        <tr data-id="${c.id}">
                            <td class="col-coordinator" style="color: #333 !important;">${c.name}</td>
                            <td class="edit-list-actions">
                                <button class="${tempTrackedIds.has(c.id)
            ? "remove-btn"
            : "add-btn"}" data-id="${c.id}" data-name="${c.name}">
                                    ${tempTrackedIds.has(c.id) ? "−" : "+"}
                                </button>
                            </td>
                        </tr>
                    `)
            .join("")}
                </tbody>
            </table>`;
        editingContent.innerHTML = tableHtml;
    }
    // --- 追踪循环 (Story 2: 集成缓存检查逻辑) ---
    async function runTrackingUpdate() {
        if (trackedCoordinators.length === 0)
            return;
        console.log(`[${new Date().toLocaleTimeString()}] Running tracking update...`);
        // --- Story 2: 缓存检查逻辑 ---
        const cached = tabSyncManager.getCachedData();
        if (cached) {
            const decision = tabSyncManager.shouldFetchFresh(cached.timestamp);
            console.log(`[Story2] Cache decision: ${decision}, age: ${Date.now() - cached.timestamp}ms`);
            if (decision === "USE") {
                // 缓存新鲜（<30s），直接使用，跳过 API 请求
                restoreFromCache(cached.data);
                renderTrackingView();
                updateLastRefreshTime(cached.timestamp);
                console.log("[Story2] Using fresh cache, skipping API call");
                return;
            }
            if (decision === "USE_AND_REFRESH") {
                // 缓存可用但需刷新（30s-2min），先显示缓存数据
                restoreFromCache(cached.data);
                renderTrackingView();
                updateLastRefreshTime(cached.timestamp);
                console.log("[Story2] Using stale cache, will refresh in background");
                // 继续执行下面的 API 调用进行后台刷新
            }
            // decision === 'REFRESH': 缓存过期，直接执行 API 调用
        }
        // --- 原有的 API 调用逻辑 ---
        try {
            const officeIds = await getOfficeIds();
            const promises = [];
            for (const coordinator of trackedCoordinators) {
                // 上班钟 (CallType=2)
                promises.push(fetchStatusReport(coordinator.id, 2, officeIds)
                    .then((data) => {
                    statusDataCache.set(`${coordinator.id}-2`, data);
                })
                    .catch((err) => console.error(err)));
                // 下班钟 (CallType=3)
                promises.push(fetchStatusReport(coordinator.id, 3, officeIds)
                    .then((data) => {
                    statusDataCache.set(`${coordinator.id}-3`, data);
                })
                    .catch((err) => console.error(err)));
                // 异常打钟
                promises.push(fetchAnomalyReport(coordinator.id)
                    .then((data) => {
                    statusDataCache.set(`${coordinator.id}-anomaly`, data);
                })
                    .catch((err) => console.error(err)));
                // 消息监控
                promises.push(fetchMessageReport(coordinator.id)
                    .then((data) => {
                    statusDataCache.set(`${coordinator.id}-message`, data);
                })
                    .catch((err) => console.error(err)));
            }
            await Promise.allSettled(promises);
            renderTrackingView();
            // --- Story 2 & 3: API 完成后保存缓存、广播并更新时间 ---
            const now = Date.now();
            tabSyncManager.setCachedData(statusDataCache);
            // Story 3: 广播数据更新通知给其他 Tab
            tabSyncManager.broadcast({
                type: "DATA_UPDATED",
                sourceTabId: tabSyncManager.tabId,
                timestamp: now,
            });
            updateLastRefreshTime(now);
            console.log(`[Story3] Tracking update complete. Broadcasted to other tabs.`);
        }
        catch (error) {
            console.error("Failed to run tracking update:", error);
            showToast("追踪数据更新失败", "error");
        }
    }
    // --- NEW: 可复用的拖拽函数 (已修复) ---
    /**
     * 使一个元素可以通过其句柄进行拖拽
     * @param draggableElement 需要被拖动的元素
     * @param handleElement 鼠标按下的句柄元素
     */
    function makeDraggable(draggableElement, handleElement) {
        let isDragging = false;
        let offsetX = 0, offsetY = 0;
        handleElement.style.cursor = "move";
        const onMouseDown = (e) => {
            isDragging = true;
            const rect = draggableElement.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        };
        const onMouseMove = (e) => {
            if (!isDragging)
                return;
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;
            // 边界检测 (不变)
            const margin = 5;
            if (newX < margin)
                newX = margin;
            if (newY < margin)
                newY = margin;
            if (newX + draggableElement.offsetWidth > window.innerWidth - margin) {
                newX = window.innerWidth - draggableElement.offsetWidth - margin;
            }
            if (newY + draggableElement.offsetHeight > window.innerHeight - margin) {
                newY = window.innerHeight - draggableElement.offsetHeight - margin;
            }
            // FIX: 在设置 left 和 top 的同时，清除 right 和 bottom 的影响
            draggableElement.style.right = "auto";
            draggableElement.style.bottom = "auto";
            draggableElement.style.left = `${newX}px`;
            draggableElement.style.top = `${newY}px`;
        };
        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
        handleElement.addEventListener("mousedown", onMouseDown);
    }
    /**
     * 格式化Authorization Note内容
     * 解析原始HTML表格，完整保留所有列（Edited Fields, Previous Value, New Value）
     */
    function formatAuthorizationNote(note) {
        if (!note)
            return "";
        // 检查是否包含Authorization相关的HTML表格
        if (note.includes("<table") &&
            (note.includes("Edited Fields") || note.includes("Previous Value"))) {
            try {
                // 创建临时DOM解析HTML
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = note;
                // 提取表格前的文字描述
                const textContent = note.replace(/<table[\s\S]*<\/table>/gi, "").trim();
                const descriptionText = textContent.replace(/<[^>]+>/g, "").trim();
                // 解析表格 - 获取表头和数据
                const table = tempDiv.querySelector("table");
                if (table) {
                    const headerRow = table.querySelector("tr");
                    const headers = [];
                    headerRow?.querySelectorAll("th, td").forEach((cell) => {
                        headers.push(cell.textContent?.trim() || "");
                    });
                    // 获取数据行
                    const dataRows = table.querySelectorAll("tr");
                    const tableData = [];
                    dataRows.forEach((row, index) => {
                        if (index === 0 && row.querySelector("th"))
                            return; // 跳过表头行
                        const cells = [];
                        row.querySelectorAll("td").forEach((cell) => {
                            cells.push(cell.textContent?.trim() || "");
                        });
                        if (cells.length > 0 && cells.some((c) => c)) {
                            tableData.push({ cells });
                        }
                    });
                    // 生成紧凑表格
                    if (tableData.length > 0) {
                        let result = descriptionText
                            ? `<div style="margin-bottom:6px;">${descriptionText}</div>`
                            : "";
                        result += '<table class="auth-note-table"><thead><tr>';
                        // 表头
                        headers.forEach((h) => {
                            result += `<th>${h}</th>`;
                        });
                        result += "</tr></thead><tbody>";
                        // 数据行
                        tableData.forEach((row) => {
                            result += "<tr>";
                            row.cells.forEach((cell) => {
                                result += `<td>${cell}</td>`;
                            });
                            result += "</tr>";
                        });
                        result += "</tbody></table>";
                        return result;
                    }
                }
            }
            catch (e) {
                // 解析失败，回退到纯文本
            }
        }
        // 如果不是Authorization表格或解析失败，移除HTML标签返回纯文本
        return note
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }
    // 调整大小功能 (修复：移除最大尺寸限制，使用capture捕获事件，添加iframe遮罩)
    function makeResizable(element, handleElement) {
        let isResizing = false;
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;
        let overlay = null;
        handleElement.style.cursor = "nwse-resize";
        const onMouseDown = (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = element.offsetWidth;
            startHeight = element.offsetHeight;
            // 创建透明遮罩层覆盖整个页面，防止iframe或其他元素抦截鼠标事件
            overlay = document.createElement("div");
            overlay.style.cssText =
                "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;cursor:nwse-resize;";
            document.body.appendChild(overlay);
            // 防止拖动时选中文字
            document.body.style.userSelect = "none";
            document.addEventListener("mousemove", onMouseMove, true);
            document.addEventListener("mouseup", onMouseUp, true);
            e.preventDefault();
            e.stopPropagation();
        };
        const onMouseMove = (e) => {
            if (!isResizing)
                return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            // 计算新尺寸，只有最小限制，没有最大限制
            const newWidth = Math.max(400, startWidth + deltaX);
            const newHeight = Math.max(300, startHeight + deltaY);
            element.style.width = `${newWidth}px`;
            element.style.height = `${newHeight}px`;
            e.preventDefault();
            e.stopPropagation();
        };
        const onMouseUp = (e) => {
            if (!isResizing)
                return;
            isResizing = false;
            document.body.style.userSelect = "";
            // 移除遮罩层
            if (overlay) {
                overlay.remove();
                overlay = null;
            }
            document.removeEventListener("mousemove", onMouseMove, true);
            document.removeEventListener("mouseup", onMouseUp, true);
            e.preventDefault();
            e.stopPropagation();
        };
        handleElement.addEventListener("mousedown", onMouseDown);
    }
    // --- 详情气泡 (Popover) ---
    /**
     * 辅助函数：专门用于渲染病人姓名单元格（<td>）
     * 如果有电话号码，则会生成带有悬浮提示的HTML
     * @param detail
     * @returns 返回一个完整的 <td>...</td> HTML字符串
     */
    function renderPatientNameCell(detail) {
        // 如果没有电话或电话列表为空，则只返回简单的姓名单元格
        if (!detail.phones || detail.phones.length === 0) {
            return `<td style="color: #333 !important;">${detail.patientName}</td>`;
        }
        // 如果有电话，则生成带有悬浮提示的复杂HTML
        const phoneItems = detail.phones
            .map((p) => `
        <div class="phone-tooltip-item">
                <label>${p.label}</label>
                <span>${p.phone}</span>
            </div>
        `)
            .join("");
        return `
            <td>
                <div class="phone-icon-wrapper" style="color: #333 !important;">
                    <span>${detail.patientName}</span>
                    <span class="phone-icon">📞</span>
                    <div class="phone-tooltip">${phoneItems}</div>
                </div>
            </td>
    `;
    }
    /**
     * 显示详情气泡 (Popover)
     * @param data 从缓存中获取的数据
     * @param callType 数据类型 (2, 3, 'anomaly')，用于决定渲染哪个表格
     * @param targetElement 用户点击的图标元素，用于定位
     */
    function showDetailsPopover(data, callType, targetElement) {
        // 1. 清理：移除任何已存在的气泡，确保页面上只有一个
        document.getElementById("details-popover")?.remove();
        // 2. 创建：创建新的气泡容器
        const popover = document.createElement("div");
        popover.id = "details-popover";
        let tableHtml;
        // --- 3. 渲染：根据 callType 决定渲染哪种表格 ---
        if (callType == 2 || callType == 3) {
            const details = data.details;
            const tableRows = details
                .map((d) => `
            <tr>
                    ${renderPatientNameCell(d)}
                    <td style="color: #333 !important;">${d.assignmentId}</td>
                    <td style="color: #333 !important;">${d.admissionId}</td>
                    <td style="color: #333 !important;">${d.caregiverName}</td>
                    <td style="color: #333 !important;">${d.visitDate}</td>
                    <td style="color: #333 !important;">${d.coordinators}</td>
                    <td style="color: #333 !important;">${d.schedule}</td>
                    <td style="color: #333 !important;">${d.contract}</td>
                    <td style="color: #333 !important;">${d.discipline}</td>
                    <td style="color: #333 !important;">${d.serviceCode}</td>
                    <td style="color: #333 !important;">${d.caregiverTeam}</td>
                </tr>`)
                .join("");
            tableHtml = `
            <thead><tr>
                <th>Patient Name</th><th>Assignment ID</th><th>Admission ID</th>
                <th>Caregiver Name</th><th>Visit Date</th><th>Coordinators</th>
                <th>Schedule</th><th>Contract</th><th>Discipline</th>
                <th>Service Code</th><th>Caregiver Team</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
        `;
        }
        else if (callType === "anomaly") {
            const details = data.details;
            const tableRows = details
                .map((d) => `
            <tr>
                    <td style="color: #333 !important;">${d.assignId}</td><td style="color: #333 !important;">${d.caregiverCode}</td>
                    <td style="color: #333 !important;">${d.caregiverName}</td><td style="color: #333 !important;">${d.officeName}</td>
                    <td style="color: #333 !important;">${d.caregiverPhone}</td><td style="color: #333 !important;">${d.caregiverTeam}</td>
                    <td style="color: #333 !important;">${d.patientName}</td><td style="color: #333 !important;">${d.callDate}</td>
                    <td style="color: #333 !important;">${d.callTime}</td><td style="color: #333 !important;">${d.callType}</td>
                    <td style="color: #333 !important;">${d.callerId}</td><td style="color: #333 !important;">${d.status}</td>
                </tr>`)
                .join("");
            tableHtml = `
            <thead>
            <tr>
                <th style="color: #333 !important;">Assign. ID#</th>
                <th style="color: #333 !important;">Caregiver Code</th>
                <th style="color: #333 !important;">Caregiver Name</th>
                <th style="color: #333 !important;">Office Name</th>
                <th style="color: #333 !important;">Caregiver Phone</th>
                <th style="color: #333 !important;">Caregiver Team</th>
                <th style="color: #333 !important;">Patient Name</th>
                <th style="color: #333 !important;">Call Date</th>
                <th style="color: #333 !important;">Call Time</th>
                <th style="color: #333 !important;">Call Type</th>
                <th style="color: #333 !important;">Caller ID</th>
                <th style="color: #333 !important;">Status</th>
            </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        `;
        }
        else if (callType === "message") {
            const details = data.details;
            const tableRows = details
                .map((d) => {
                // 格式化Note内容：解析Authorization Note中的表格数据
                const formattedNote = formatAuthorizationNote(d.note);
                return `
            <tr>
                    <td style="color: #333 !important;">${d.memberName}</td>
                    <td style="color: #333 !important;">${d.payerName}</td>
                    <td style="color: #333 !important;">${d.reason}</td>
                    <td style="color: #333 !important;" class="note-cell">${formattedNote}</td>
                    <td style="color: #333 !important; white-space: nowrap;">${d.createdDateTimeDisplay}</td>
                </tr>`;
            })
                .join("");
            tableHtml = `
            <thead>
            <tr>
                <th style="color: #333 !important;">Member Name</th>
                <th style="color: #333 !important;">Payer</th>
                <th style="color: #333 !important;">Reason</th>
                <th style="color: #333 !important;">Note</th>
                <th style="color: #333 !important;">DateTime</th>
            </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        `;
        }
        else {
            // 备用情况
            tableHtml = `<tbody><tr><td style="color: #333 !important;">未知的数据类型</td></tr></tbody>`;
        }
        // --- 4. 组装：将头部、内容和表格组装成完整的 Popover HTML ---
        popover.innerHTML = `
        <div class="popover-header"><h4 style="color: #333 !important;">详情列表（只显示最新10条） (${data.count} 条记录)</h4><button class="popover-close-btn">&times;</button></div>
            <div class="popover-content"><table class="popover-table">${tableHtml}</table></div>
            <div class="popover-resize-handle"></div>
        `;
        // --- 5. 注入与激活 ---
        document.body.appendChild(popover);
        // 激活拖拽功能
        const popoverHeader = popover.querySelector(".popover-header");
        if (popoverHeader) {
            makeDraggable(popover, popoverHeader);
        }
        // 激活调整大小功能
        const resizeHandle = popover.querySelector(".popover-resize-handle");
        if (resizeHandle) {
            makeResizable(popover, resizeHandle);
        }
        // 智能定位
        const targetRect = targetElement.getBoundingClientRect();
        const popoverHeight = popover.offsetHeight;
        const popoverWidth = popover.offsetWidth;
        const margin = 10;
        let top = targetRect.bottom + 5;
        if (top + popoverHeight > window.innerHeight - margin)
            top = targetRect.top - popoverHeight - 5;
        if (top < margin)
            top = margin;
        let left = targetRect.left;
        if (left + popoverWidth > window.innerWidth - margin)
            left = targetRect.right - popoverWidth;
        if (left < margin)
            left = margin;
        popover.style.top = `${top}px`;
        popover.style.left = `${left}px`;
        // 绑定关闭事件
        popover
            .querySelector(".popover-close-btn")
            ?.addEventListener("click", () => popover.remove());
        // 触发淡入动画
        requestAnimationFrame(() => popover.classList.add("visible"));
    }
    // --- NEW: Show message detail popup ---
    function showMessageDetail(cell) {
        const popup = document.getElementById("message-detail-popup");
        const backdrop = document.getElementById("message-detail-backdrop");
        const title = document.getElementById("popup-title");
        const content = document.getElementById("popup-content");
        const closeBtn = document.getElementById("close-popup-btn");
        if (!popup || !backdrop || !title || !content || !closeBtn)
            return;
        const fullNote = cell.dataset.fullNote || "";
        const member = cell.dataset.member || "";
        const payer = cell.dataset.payer || "";
        const reason = cell.dataset.reason || "";
        const priority = cell.dataset.priority || "Normal";
        const caregiver = cell.dataset.caregiver || "";
        const patient = cell.dataset.patient || "";
        const created = cell.dataset.created || "";
        // Set title
        title.textContent = payer || "Message Details";
        // Build content HTML (similar to original popup structure)
        const contentHtml = `
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 20px; font-size: 14px;">
        <div style="font-weight: bold;">From</div>
        <div>${payer}</div>
        
        <div style="font-weight: bold;">Created</div>
        <div>${created}</div>
        
        <div style="font-weight: bold;">To</div>
        <div>${member}</div>
        
        <div style="font-weight: bold;">Reason</div>
        <div>${reason}</div>
        
        ${caregiver
            ? `<div style="font-weight: bold;">Caregiver</div><div>${caregiver}</div>`
            : ""}
        
        <div style="font-weight: bold;">Priority</div>
        <div>${priority}</div>
        
        ${patient
            ? `<div style="font-weight: bold;">Patient</div><div>${patient}</div>`
            : ""}
      </div>
      
      <div style="margin-top: 20px;">
        <div style="font-weight: bold; margin-bottom: 10px;">Message</div>
        <div style="padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; max-height: 400px; overflow: auto;">
          ${fullNote}
        </div>
      </div>
    `;
        content.innerHTML = contentHtml;
        // Show popup and backdrop
        popup.style.display = "block";
        backdrop.style.display = "block";
        // Close handlers
        const closePopup = () => {
            popup.style.display = "none";
            backdrop.style.display = "none";
        };
        closeBtn.onclick = closePopup;
        backdrop.onclick = closePopup;
        // ESC key to close
        const escHandler = (e) => {
            if (e.key === "Escape") {
                closePopup();
                document.removeEventListener("keydown", escHandler);
            }
        };
        document.addEventListener("keydown", escHandler);
    }
    // --- REFACTORED: 拖拽与点击逻辑 ---
    function initializeDragAndClick() {
        let hasDragged = false;
        // 主面板拖拽
        makeDraggable(container, dragHandle);
        // 点击/拖拽区分
        dragHandle.addEventListener("mousedown", () => {
            hasDragged = false;
        });
        dragHandle.addEventListener("mousemove", () => {
            hasDragged = true;
        });
        dragHandle.addEventListener("click", () => {
            if (hasDragged)
                return;
            const isVisible = panel.style.display === "flex";
            if (isVisible) {
                panel.style.display = "none";
            }
            else {
                console.log("Panel opened. Syncing with localStorage...");
                loadTrackedCoordinators();
                renderTrackingView();
                console.log("Triggering immediate data fetch...");
                runTrackingUpdate();
                panel.style.display = "flex";
                // Position panel
                const w = window.innerWidth, r = dragHandle.getBoundingClientRect();
                if (r.left + r.width / 2 < w / 2) {
                    panel.style.left = `${dragHandle.offsetWidth + 10}px`;
                    panel.style.right = "auto";
                }
                else {
                    panel.style.right = `${dragHandle.offsetWidth + 10}px`;
                    panel.style.left = "auto";
                }
            }
        });
    }
    function attachAllEventListeners() {
        initializeDragAndClick();
        const editListBtn = document.getElementById("edit-list-btn");
        editListBtn.addEventListener("click", async () => {
            editingContent.innerHTML = `
            <div class="loader">
                <div class="spinner"></div>
                <p>正在加载人员列表...</p>
            </div>
        `;
            switchView(trackingView, editingView);
            tempTrackedIds = new Set(trackedCoordinators.map((c) => c.id));
            try {
                allCoordinators = await fetchAllCoordinators();
                renderEditingView();
            }
            catch (error) {
                console.error("Error fetching coordinator list:", error);
                showToast("获取人员列表时出错", "error");
                editingContent.innerHTML = `
                <p style="text-align:center;color:red">
                    加载失败，请稍后重试。
                </p>
            `;
            }
        });
        const editingContent = document.getElementById("editing-content");
        editingContent.addEventListener("click", (e) => {
            const target = e.target;
            if (target.tagName !== "BUTTON")
                return;
            const id = parseInt(target.dataset.id, 10);
            if (tempTrackedIds.has(id)) {
                tempTrackedIds.delete(id);
                target.textContent = "+";
                target.className = "add-btn";
            }
            else {
                tempTrackedIds.add(id);
                target.textContent = "−";
                target.className = "remove-btn";
            }
        });
        const handleGoBack = () => {
            switchView(editingView, trackingView, "backward");
            editingContent.innerHTML = "";
        };
        const backBtn = document.getElementById("back-btn");
        backBtn.addEventListener("click", handleGoBack);
        const cancelBtn = document.getElementById("cancel-btn");
        cancelBtn.addEventListener("click", handleGoBack);
        const saveBtn = document.getElementById("save-btn");
        saveBtn.addEventListener("click", () => {
            trackedCoordinators = allCoordinators.filter((c) => tempTrackedIds.has(c.id));
            saveTrackedCoordinators();
            renderTrackingView();
            showToast("保存成功", "success");
            handleGoBack();
        });
        // --- 主追踪列表的点击事件 (已更新) ---
        const trackingTableBody = document.getElementById("tracking-table-body");
        trackingTableBody.addEventListener("click", (e) => {
            const target = e.target;
            if (target.classList.contains("status-icon")) {
                const coordinatorId = target.dataset.coordinatorId;
                const callType = target.dataset.callType; // 类型断言
                if (!coordinatorId || !callType)
                    return;
                const cacheKey = `${coordinatorId}-${callType}`;
                const data = statusDataCache.get(cacheKey);
                if (data && data.count > 0) {
                    showDetailsPopover(data, callType, target);
                }
                else if (data && data.count === 0) {
                    showToast("没有需要处理的记录", "success");
                }
                else {
                    showToast("暂无数据或正在加载中...", "success");
                }
            }
        });
    }
    // --- 初始化 (Story 3: 添加跨 Tab 消息监听) ---
    function initialize() {
        loadTrackedCoordinators();
        renderTrackingView();
        attachAllEventListeners();
        // --- Story 3: 注册 BroadcastChannel 消息监听 ---
        tabSyncManager.onMessage((msg) => {
            // 检查 sourceTabId 防止自我触发更新
            if (msg.type === "DATA_UPDATED" &&
                msg.sourceTabId !== tabSyncManager.tabId) {
                console.log(`[Story3] Tab ${tabSyncManager.tabId} received DATA_UPDATED from Tab ${msg.sourceTabId}`);
                // 从 localStorage 读取最新缓存数据
                const cached = tabSyncManager.getCachedData();
                if (cached) {
                    restoreFromCache(cached.data);
                    renderTrackingView();
                    updateLastRefreshTime(cached.timestamp);
                    console.log(`[Story3] UI updated from broadcast, timestamp: ${new Date(cached.timestamp).toLocaleTimeString()}`);
                }
            }
            else if (msg.type === "TAB_CLOSING") {
                console.log(`[Story3] Tab ${msg.sourceTabId} is closing`);
            }
        });
        runTrackingUpdate();
        setInterval(runTrackingUpdate, 120000); // 间隔已更新为 2 分钟
    }
    initialize();
    /*     try {
              let CallMaintenance_ns =
                  "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
              const r = (await GM_fetch(CallMaintenance_ns, {
                  method: "GET",
              })) as Response & { rawBody: Blob };
              console.log("r", r);
              const result = await r.rawBody.text();
              console.log("text:", result);
          } catch (error) {
              console.error(error);
          } */
};

;// ./src/js/HomePage.ts


const homePageSelector = async () => {
    await sleep(100);
    let communicationType = $(homePageCommunicationTypeSelector);
    for (const option of $(homePageCommunicationTypeOptionSelector)) {
        if ("Patient" == option.innerText) {
            communicationType.val(option.getAttribute("value"));
            communicationType[0].dispatchEvent(new Event("change"));
            break;
        }
    }
    await sleep(500);
    let coordinator = $(homePageCoordinatorSelector);
    for (const option of $(homePageCoordinatorOptionSelector)) {
        if ("Tao Yang ext.503 TYang@alwaysNY.net" == option.innerText) {
            coordinator.val(option.getAttribute("value"));
            coordinator[0].dispatchEvent(new Event("change"));
            break;
        }
    }
    await sleep(300);
    let status = $(homePagestatusSelector);
    for (const option of $(homePagestatusOptionSelector)) {
        console.log(option);
        if ("Open" == option.innerText) {
            status.val(option.getAttribute("value"));
            status[0].dispatchEvent(new Event("change"));
            break;
        }
    }
    await sleep(100);
    $(homePageSearchButtonSelector)[0].click();
};

;// ./src/index.ts













async function src_main() {
    console.log("HHA Exchange Smart Assistant: script start");
    incomingCallHandler();
    async function FetchTester() {
        try {
            // 构造目标网站的搜索URL
            // const searchUrl = `https://your-search-site.com/search?q=${number}`; // <--- [!] 修改为实际的搜索URL格式
            // console.log('正在搜索:', searchUrl);
            let SearchCGphone = "https://app.hhaexchange.com/ENT2507010000/Aide/AideSearchXSLT_ns.aspx?FirstName=&Phone=347-265-3886&LastName=&Type=2&Discipline=-1&CaregiverCode=&ALtCaregiverCode=&Status=1&SSN=&CaregiverTeamID=-1&FromVisitEdit=0&CaregiverLocationID=-1&CaregiverBranchID=-1&VisitDate=&office=469,5137,5139,6475,14849&DOB=&pg=1&sort=&ord=ASC&FromPage=&_=1755108928644";
            let missIn = "https://app.hhaexchange.com/ENT2507010000/Call/CallReportsXSLT_ns.aspx?CallType=2&VendorID=469&CoordinatorID=69419&PatientNumber=&PatientName=&AideName=&AssignmentID=&sort=VisitDate&ord=DESC&Source=-1&CaregiverTeamID=-1&SkillType=-1&HideVisitWithTimeSheetRequired=false&FromDate=2025-08-13%2000:00:00&ToDate=2025-08-13%2023:59:00&TimesheetRequired=-1&PatientTeamID=-1&PatientLocationID=-1&PatientBranchID=-1&CaregiverLocationID=-1&CaregiverBranchID=-1&time=1755113664818&OfficeId=469,5137,5139,6475,14849&DisciplineIDs=0";
            let CallMaintenance_ns = "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
            const r = (await GM_fetch(CallMaintenance_ns, {
                method: "GET",
            }));
            console.log("r", r);
            const text = await r.rawBody.text();
            console.log("text:", text);
        }
        catch (error) {
            console.error(error);
        }
    }
    setInterval(() => {
        // FetchTester()
    }, 10000);
    let $missedInBtn = $("<input/>").text("Missed In").attr({
        type: "button",
        id: "missedInBtn",
        name: "missedInBtn",
        class: "button hollow",
        tabindex: "1",
        value: "Missed In",
    });
    let $missedOutBtn = $("<input/>").text("Missed Out").attr({
        type: "button",
        id: "missedOutBtn",
        name: "missedOutBtn",
        class: "button hollow",
        tabindex: "1",
        value: "Missed Out",
    });
    let $missedInOutBtn = $("<input/>").text("Missed In/Out").attr({
        type: "button",
        id: "missedInOutBtn",
        name: "missedInOutBtn",
        class: "button hollow",
        tabindex: "1",
        value: "Missed In&Out",
    });
    let $POCBtn = $("<input/>").text("POC").attr({
        type: "button",
        id: "uxBtnPOC",
        name: "uxBtnPOC",
        class: "button hollow",
        tabindex: "1",
        value: "POC",
    });
    let $copyDescrpBtn = $("<input/>")
        .text("Copy Attachment To Descrption")
        .attr({
        type: "button",
        id: "uxBtnCopyToDescrp",
        name: "uxBtnCopyToDescrp",
        class: "button hollow",
        tabindex: "1",
        value: "Copy Attachment To Descrption",
    });
    let $newQABtn = $("<input/>").text("").attr({
        type: "button",
        id: "newQABtn",
        name: "newQABtn",
        class: "button hollow",
        value: "New QA",
    });
    let $newWelcomeCall = $("<input/>").text("").attr({
        type: "button",
        id: "newWelcomecallBtn",
        name: "newWelcomecallBtn",
        class: "button hollow",
        value: "New Welcome Call",
    });
    let $prebillingSelector = $("<input/>").text("").attr({
        type: "button",
        id: "prebillingSelector",
        name: "prebillingSelector",
        class: "button hollow",
        value: "Prebilling Selector: Tao",
    });
    let $HomePageSelector = $("<input/>").text("").attr({
        type: "button",
        id: "homePageSelector",
        name: "homePageSelector",
        class: "button hollow",
        value: "Home Page Selector: Tao",
    });
    assignIntervalTimer(homePageSearchButtonSelector, $HomePageSelector, "#homePageSelector", homePageSelector);
    assignIntervalTimer(prebillingSearchButtonSelector, $prebillingSelector, "#prebillingSelector", prebillingSelector);
    assignIntervalTimer(newMessageButtonSelector, $newQABtn, "#newQABtn", createNewQA);
    assignIntervalTimer(newMessageButtonSelector, $newWelcomeCall, "#newWelcomecallBtn", createWelcomeCall);
    assignIntervalTimer(saveButtonSelector, $POCBtn, "#uxBtnPOC", POCResolver);
    assignIntervalTimer(saveButtonSelector, $missedInOutBtn, "#missedInOutBtn", missedCallResolver, ["Attendant failed to call in and out"]);
    assignIntervalTimer(saveButtonSelector, $missedOutBtn, "#missedOutBtn", missedCallResolver, ["Attendant failed to call out"]);
    assignIntervalTimer(saveButtonSelector, $missedInBtn, "#missedInBtn", missedCallResolver, ["Attendant failed to call in"]);
    assignIntervalTimer(documentManagementSaveButtonSelector, $copyDescrpBtn, "#uxBtnCopyToDescrp", copyAttachmentToDescrp);
    visitMonitor();
    highlight2Call();
    /* async function sendStaticPostRequest2() {
  
      // 1. 定义请求的目标 URL (不包含 QueryString)
      const baseUrl = "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
  
      // 2. 定义 QueryString 部分
      const queryString = "VisitStatus=13&s=4039BA72-3890-44CC-AC90-7582784E28E0&Version=25.07&MinorVersion=1.00&AppVersion=ENT";
  
      // 完整的请求 URL
      const fullUrl = `${baseUrl}?${queryString}`;
  
      // 3. 定义您提供的完整载荷 (Payload)
      // 注意：这是一个非常长的字符串，其中包含了所有表单数据
      const fullPayload = "__LASTFOCUS=&__EVENTTARGET=ctl00%24ContentPlaceHolder1%24uxGvSearch&__EVENTARGUMENT=Page%242&__VIEWSTATE=%2FwEPDwUJOTA4OTQ1MzUzDxYCHhNWYWxpZGF0ZVJlcXVlc3RNb2RlAgEWAmYPZBYQAgEPDxYGHglGb250X0JvbGRnHgxGb3JtYXRTdHJpbmcFCFRhbyBZYW5nHgRfIVNCAoAQZGQCAg8PFgIeBFRleHQFFUFsd2F5cyBIb21lIENhcmUgSW5jLmRkAgQPDxYGHwFnHwIFCFRhbyBZYW5nHwMCgBBkZAIFDw8WAh8EBRVBbHdheXMgSG9tZSBDYXJlIEluYy5kZAIGD2QWBAIHD2QWAgIBD2QWAgIHDxYCHglpbm5lcmh0bWwFrQc8VUwgaWQ9J25hdmlnYXRpb24nIGNsYXNzPSduYXZpZ2F0aW9uJz48bGkgaWQ9J3BhcmVudG1lbnVpZDAnPjxhIHN0eWxlPSdjdXJzb3I6IHBvaW50ZXI7Jz5Ib21lPC9hPjx1bCBjbGFzcz0nc3VibWVudSc%2BPGxpPjxhPkxvYWRpbmcuLi48L2E%2BPC9saT48L3VsPjxsaSBpZD0ncGFyZW50bWVudWlkMSc%2BPGEgc3R5bGU9J2N1cnNvcjogcG9pbnRlcjsnPlBhdGllbnQ8L2E%2BPHVsIGNsYXNzPSdzdWJtZW51Jz48bGk%2BPGE%2BTG9hZGluZy4uLjwvYT48L2xpPjwvdWw%2BPGxpIGlkPSdwYXJlbnRtZW51aWQyJz48YSBzdHlsZT0nY3Vyc29yOiBwb2ludGVyOyc%2BQ2FyZWdpdmVyPC9hPjx1bCBjbGFzcz0nc3VibWVudSc%2BPGxpPjxhPkxvYWRpbmcuLi48L2E%2BPC9saT48L3VsPjxsaSBpZD0ncGFyZW50bWVudWlkMyc%2BPGEgc3R5bGU9J2N1cnNvcjogcG9pbnRlcjsnPlZpc2l0PC9hPjx1bCBjbGFzcz0nc3VibWVudSc%2BPGxpPjxhPkxvYWRpbmcuLi48L2E%2BPC9saT48L3VsPjxsaSBpZD0ncGFyZW50bWVudWlkNCc%2BPGEgc3R5bGU9J2N1cnNvcjogcG9pbnRlcjsnPkFjdGlvbjwvYT48dWwgY2xhc3M9J3N1Ym1lbnUnPjxsaT48YT5Mb2FkaW5nLi4uPC9hPjwvbGk%2BPC91bD48bGkgaWQ9J3BhcmVudG1lbnVpZDUnPjxhIHN0eWxlPSdjdXJzb3I6IHBvaW50ZXI7Jz5CaWxsaW5nPC9hPjx1bCBjbGFzcz0nc3VibWVudSc%2BPGxpPjxhPkxvYWRpbmcuLi48L2E%2BPC9saT48L3VsPjxsaSBpZD0ncGFyZW50bWVudWlkNic%2BPGEgc3R5bGU9J2N1cnNvcjogcG9pbnRlcjsnPlJlcG9ydDwvYT48dWwgY2xhc3M9J3N1Ym1lbnUnPjxsaT48YT5Mb2FkaW5nLi4uPC9hPjwvbGk%2BPC91bD48bGkgaWQ9J3BhcmVudG1lbnVpZDcnPjxhIHN0eWxlPSdjdXJzb3I6IHBvaW50ZXI7Jz5BZG1pbjwvYT48dWwgY2xhc3M9J3N1Ym1lbnUnPjxsaT48YT5Mb2FkaW5nLi4uPC9hPjwvbGk%2BPC91bD48L1VMPmQCCQ9kFhxmD2QWBgIBDxYCHgVjbGFzcwUhdGFicy10aXRsZSB0ZXh0LWNlbnRlciBjdXJyZW50dGFiFgICAQ8PZBYCHg1hcmlhLXNlbGVjdGVkBQR0cnVlZAIJDxYCHgdWaXNpYmxlaGQCEw8PFgIfBAUMU2VhcmNoIENhbGxzZGQCBg8PZBYEHgpvbmtleXByZXNzBRNyZXR1cm4gT25LZXlQcmVzcygpHgZvbmJsdXIFZHZhbGlkYXRlSEhNTUNhbGxEYXNoYm9hcmQoJ2N0bDAwX0NvbnRlbnRQbGFjZUhvbGRlcjFfdXh0eHRGcm9tVGltZScsJ2ZoaG1tJywnZnJvbXRpbWVycm9ycycsIGZhbHNlKTtkAggPD2QWBB8JBRNyZXR1cm4gT25LZXlQcmVzcygpHwoFYHZhbGlkYXRlSEhNTUNhbGxEYXNoYm9hcmQoJ2N0bDAwX0NvbnRlbnRQbGFjZUhvbGRlcjFfdXh0eHRUb1RpbWUnLCd0aGhtbScsJ3RvdGltZXJyb3JzJywgZmFsc2UpO2QCKA8QZGQWAWZkAjQPD2QWAh4Hb25jbGljawUYcmV0dXJuIFZhbGlkYXRlU2VhcmNoKCk7ZAI2Dw8WAh8EBQtEaXNwbGF5R3JpZGRkAjcPD2QWBB8LBR1vcGVuUHJvdmlkZXIoKTsgcmV0dXJuIGZhbHNlOx4Jb25rZXlkb3duBShpZiAoZXZlbnQua2V5Q29kZSA9PSAxMykgb3BlblByb3ZpZGVyKCk7ZAI5DxYCHwhnFgQCAQ8PFgIfBAUEKDE5KWRkAgkPPCsAEQMADxYGHgtfIURhdGFCb3VuZGceDERhdGFTb3VyY2VJRAULdXhPZHNTZWFyY2geC18hSXRlbUNvdW50AhNkARAWAQIHFgE8KwAFAQAWAh4KSGVhZGVyVGV4dAWTAUNhbGwgRGF0ZTxzcGFuIHJvbGU9J2xpbmsnIGFyaWEtbGFiZWw9J2FjdGl2YXRlIHRvIHNvcnQgY29sdW1uIGFzY2VuZGluZycgc3R5bGU9J2ZvbnQtZmFtaWx5OiBXZWJkaW5nczsgJz4gPHNwYW4gYXJpYS1oaWRkZW49J3RydWUnPjY8L3NwYW4%2BPC9zcGFuPhYBZgwUKwAAFgJmD2QWFAIBD2QWGGYPDxYCHwQFBjU1Mjg3N2RkAgEPZBYCZg8PFgQfBAUFMjI4NTUeC05hdmlnYXRlVXJsBQEjFgIeB09uQ2xpY2sFrAFqYXZhc2NyaXB0OndpbmRvdy5vcGVuKCcuLi9BaWRlL0FpZGUuYXNweD9BaWRlSWQ9NDM4NDA4NCZUYWI9NCcsJ0FpZGUnLCdtZW51YmFyPTAsc3RhdHVzYmFyPTAsdG9wPTAsbGVmdD0wLCByZXNpemFibGU9MSx3aWR0aD0xMDAwLGhlaWdodD02ODAsc2Nyb2xsYmFycz15ZXMnKTtyZXR1cm4gZmFsc2U7ZAICD2QWAgICDxUBGWRpdkNhcmVnaXZlckluZm8yNjE0NjcwMTRkAgMPZBYCAgEPFgIfBAUhQWx3YXlzIEhvbWUgQ2FyZSwgQWx3YXlzIE5IVEQvVEJJZAIFDw8WAh8EBQ1UZWFtIDh0aCBBdmUuZGQCBg9kFgICAQ8PFgIfBGVkZAIHDw8WAh8EBQowOS8wMS8yMDI1ZGQCCA8PFgIfBAUFMjA6MDRkZAIJD2QWCgIBDw8WBB8EBQNPVVQfCGhkZAIDDw8WBB8EBQNPVVQfEQUBIxYEHxIFJ1N3aXRjaENhbGxUeXBlKCdPVVQnLCcyNjE0NjcwMTQnLCB0aGlzKR4IVGFiSW5kZXgFATBkAgUPDxYEHwQFAyg2KR8RBQEjFgQfCwXDAWphdmFzY3JpcHQ6cmV0dXJuIHNob3dQb3B1cFdpdGhFbGVtZW50SWQoJy4uL0NhbGwvUGVyZm9ybWVkRHV0aWVzX25zLmFzcHg%2FTWFpbnRlbmFuY2VJRD0yNjE0NjcwMTQmUGF0aWVudElEPTAmVmlzaXRJRD0wJlVzZXJJRD0xODQ4ODUnLCdjb250ZW50JywnbWVkaXVtJywnRVZWIGFuZCBEdXR5IEluZm9ybWF0aW9uJywnNDAwcHgnLHRoaXMpOx8TBQEwZAIHD2QWAgIBDw8WAh8IZxYEHwsFbiByZXR1cm4gVmlld1dpbk9wZW5IaXN0b3J5KCc0MDM5QkE3Mi0zODkwLTQ0Q0MtQUM5MC03NTgyNzg0RTI4RTAnLCcvSEhBSGlzdG9yeS8nLCdIaXNJc0NhbGxUeXBlJywnMjYxNDY3MDE0Jyk7HwwFgQFpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInKSBWaWV3V2luT3Blbkhpc3RvcnkoJzQwMzlCQTcyLTM4OTAtNDRDQy1BQzkwLTc1ODI3ODRFMjhFMCcsJy9ISEFIaXN0b3J5LycsJ0hpc0lzQ2FsbFR5cGUnLCcyNjE0NjcwMTQnKTsWAmYPFgIfCGhkAgkPZBYCAgEPDxYCHwhnFgQeCmFyaWEtbGFiZWwFB0hpc3RvcnkeBHJvbGUFBGxpbmsWAmYPFgIfCGhkAgoPZBYCAgIPFQEWZGl2Q2FsbGVySW5mbzI2MTQ2NzAxNGQCCw9kFhACAQ8WAh8IaGQCAw8WAh8IaGQCBA8VAmZUaGUgQ2FyZWdpdmVyIGlzIGNhbGxpbmcgZnJvbSBhIHBob25lIG51bWJlciBub3QgcmVjb2duaXplZCBhcyBiZWxvbmdpbmcgdG8gYW55IFBhdGllbnQgaW4gdGhlIHN5c3RlbS4WUGhvbmUgTnVtYmVyIE5vdCBGb3VuZGQCBQ8PFgIfBAUWUGhvbmUgTnVtYmVyIE5vdCBGb3VuZGRkAgYPFQFmVGhlIENhcmVnaXZlciBpcyBjYWxsaW5nIGZyb20gYSBwaG9uZSBudW1iZXIgbm90IHJlY29nbml6ZWQgYXMgYmVsb25naW5nIHRvIGFueSBQYXRpZW50IGluIHRoZSBzeXN0ZW0uZAIHDxYEHwRlHwhoZAIJDxYEHwQFCTI2MTQ2NzAxNB8IaGQCCw8PFgIfCGhkZAIMD2QWAgIBDw9kFgIfCwVGamF2YXNjcmlwdDogY2FsbEhIQUNHU2VydmljZSA9IDA7cmV0dXJuIFJlamVjdENhbGwoJzI2MTQ2NzAxNCcsIHRoaXMpO2QCAg9kFhhmDw8WAh8EBQYyMzQ3ODJkZAIBD2QWAmYPDxYEHwQFBTE2MTg5HxEFASMWAh8SBawBamF2YXNjcmlwdDp3aW5kb3cub3BlbignLi4vQWlkZS9BaWRlLmFzcHg%2FQWlkZUlkPTI0NjM3ODQmVGFiPTQnLCdBaWRlJywnbWVudWJhcj0wLHN0YXR1c2Jhcj0wLHRvcD0wLGxlZnQ9MCwgcmVzaXphYmxlPTEsd2lkdGg9MTAwMCxoZWlnaHQ9NjgwLHNjcm9sbGJhcnM9eWVzJyk7cmV0dXJuIGZhbHNlO2QCAg9kFgICAg8VARlkaXZDYXJlZ2l2ZXJJbmZvMjYxNDYwMTEwZAIDD2QWAgIBDxYCHwQFEEFsd2F5cyBIb21lIENhcmVkAgUPDxYCHwQFDVRlYW0gOHRoIEF2ZS5kZAIGD2QWAgIBDw8WAh8EBRNNQSBYSVVNRUkgKDkwNjA5NCkgZGQCBw8PFgIfBAUKMDkvMDEvMjAyNWRkAggPDxYCHwQFBTE4OjE0ZGQCCQ9kFgoCAQ8PFgQfBAUDT1VUHwhoZGQCAw8PFgQfBAUDT1VUHxEFASMWBB8SBSdTd2l0Y2hDYWxsVHlwZSgnT1VUJywnMjYxNDYwMTEwJywgdGhpcykfEwUBMGQCBQ8PFgQfBAUEKDE0KR8RBQEjFgQfCwXKAWphdmFzY3JpcHQ6cmV0dXJuIHNob3dQb3B1cFdpdGhFbGVtZW50SWQoJy4uL0NhbGwvUGVyZm9ybWVkRHV0aWVzX25zLmFzcHg%2FTWFpbnRlbmFuY2VJRD0yNjE0NjAxMTAmUGF0aWVudElEPTE0NTgwNjc3JlZpc2l0SUQ9MCZVc2VySUQ9MTg0ODg1JywnY29udGVudCcsJ21lZGl1bScsJ0VWViBhbmQgRHV0eSBJbmZvcm1hdGlvbicsJzQwMHB4Jyx0aGlzKTsfEwUBMGQCBw9kFgICAQ8PFgIfCGcWBB8LBW4gcmV0dXJuIFZpZXdXaW5PcGVuSGlzdG9yeSgnNDAzOUJBNzItMzg5MC00NENDLUFDOTAtNzU4Mjc4NEUyOEUwJywnL0hIQUhpc3RvcnkvJywnSGlzSXNDYWxsVHlwZScsJzI2MTQ2MDExMCcpOx8MBYEBaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJykgVmlld1dpbk9wZW5IaXN0b3J5KCc0MDM5QkE3Mi0zODkwLTQ0Q0MtQUM5MC03NTgyNzg0RTI4RTAnLCcvSEhBSGlzdG9yeS8nLCdIaXNJc0NhbGxUeXBlJywnMjYxNDYwMTEwJyk7FgJmDxYCHwhoZAIJD2QWAgIBDw8WAh8IZxYEHxQFB0hpc3RvcnkfFQUEbGluaxYCZg8WAh8IaGQCCg9kFgICAg8VARZkaXZDYWxsZXJJbmZvMjYxNDYwMTEwZAILD2QWEAIBDxYCHwhoZAIDDxYCHwhoZAIEDxUCqQFDYXJlZ2l2ZXIgcGxhY2luZyB0aGUgRVZWIGlzIG5vdCBzY2hlZHVsZWQgdG8gd29yayBmb3IgdGhlIHZpc2l0LiBUaGUgQ2FyZWdpdmVyIHNjaGVkdWxlZCB0byB3b3JrIHRoZSB2aXNpdCBoYXMgbm90IA0KICAgICAgICAgICAgICAgICAgIGFscmVhZHkgcGxhY2VkIGEgc3VjY2Vzc2Z1bCBFVlYuHURpZmZlcmVudCBDYXJlZ2l2ZXIgU2NoZWR1bGVkZAIFDw8WAh8EBR1EaWZmZXJlbnQgQ2FyZWdpdmVyIFNjaGVkdWxlZGRkAgYPFQGpAUNhcmVnaXZlciBwbGFjaW5nIHRoZSBFVlYgaXMgbm90IHNjaGVkdWxlZCB0byB3b3JrIGZvciB0aGUgdmlzaXQuIFRoZSBDYXJlZ2l2ZXIgc2NoZWR1bGVkIHRvIHdvcmsgdGhlIHZpc2l0IGhhcyBub3QgDQogICAgICAgICAgICAgICAgICAgYWxyZWFkeSBwbGFjZWQgYSBzdWNjZXNzZnVsIEVWVi5kAgcPFgQfBGUfCGhkAgkPFgQfBAUJMjYxNDYwMTEwHwhoZAILDw8WAh8IaGRkAgwPZBYCAgEPD2QWAh8LBUZqYXZhc2NyaXB0OiBjYWxsSEhBQ0dTZXJ2aWNlID0gMDtyZXR1cm4gUmVqZWN0Q2FsbCgnMjYxNDYwMTEwJywgdGhpcyk7ZAIDD2QWGGYPDxYCHwQFBjk0MjYzNGRkAgEPZBYCZg8PFgQfBAUFMTgzNjQfEQUBIxYCHxIFrAFqYXZhc2NyaXB0OndpbmRvdy5vcGVuKCcuLi9BaWRlL0FpZGUuYXNweD9BaWRlSWQ9MzQ1NzQ2NCZUYWI9NCcsJ0FpZGUnLCdtZW51YmFyPTAsc3RhdHVzYmFyPTAsdG9wPTAsbGVmdD0wLCByZXNpemFibGU9MSx3aWR0aD0xMDAwLGhlaWdodD02ODAsc2Nyb2xsYmFycz15ZXMnKTtyZXR1cm4gZmFsc2U7ZAICD2QWAgICDxUBGWRpdkNhcmVnaXZlckluZm8yNjE0MDQxNzRkAgMPZBYCAgEPFgIfBAUQQWx3YXlzIEhvbWUgQ2FyZWQCBQ8PFgIfBAUOVGVhbSBDaGluYXRvd25kZAIGD2QWAgIBDw8WAh8EBRRMZWUgQ3VpbWVpICg5MDczMzUpIGRkAgcPDxYCHwQFCjA4LzMxLzIwMjVkZAIIDw8WAh8EBQUyMDo1OGRkAgkPZBYKAgEPDxYEHwQFA09VVB8IaGRkAgMPDxYEHwQFA09VVB8RBQEjFgQfEgUnU3dpdGNoQ2FsbFR5cGUoJ09VVCcsJzI2MTQwNDE3NCcsIHRoaXMpHxMFATBkAgUPDxYEHwQFAyg4KR8RBQEjFgQfCwXKAWphdmFzY3JpcHQ6cmV0dXJuIHNob3dQb3B1cFdpdGhFbGVtZW50SWQoJy4uL0NhbGwvUGVyZm9ybWVkRHV0aWVzX25zLmFzcHg%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8EBQNPVVQfCGhkZAIDDw8WBB8EBQNPVVQfEQUBIxYEHxIFJ1N3aXRjaENhbGxUeXBlKCdPVVQnLCcyNjEzMjEzNTQnLCB0aGlzKR8TBQEwZAIFDw8WBB8EBQMoOCkfEQUBIxYEHwsFygFqYXZhc2NyaXB0OnJldHVybiBzaG93UG9wdXBXaXRoRWxlbWVudElkKCcuLi9DYWxsL1BlcmZvcm1lZER1dGllc19ucy5hc3B4P01haW50ZW5hbmNlSUQ9MjYxMzIxMzU0JlBhdGllbnRJRD0xOTg2OTg1NCZWaXNpdElEPTAmVXNlcklEPTE4NDg4NScsJ2NvbnRlbnQnLCdtZWRpdW0nLCdFVlYgYW5kIER1dHkgSW5mb3JtYXRpb24nLCc0MDBweCcsdGhpcyk7HxMFATBkAgcPZBYCAgEPDxYCHwhnFgQfCwVuIHJldHVybiBWaWV3V2luT3Blbkhpc3RvcnkoJzQwMzlCQTcyLTM4OTAtNDRDQy1BQzkwLTc1ODI3ODRFMjhFMCcsJy9ISEFIaXN0b3J5LycsJ0hpc0lzQ2FsbFR5cGUnLCcyNjEzMjEzNTQnKTsfDAWBAWlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIFZpZXdXaW5PcGVuSGlzdG9yeSgnNDAzOUJBNzItMzg5MC00NENDLUFDOTAtNzU4Mjc4NEUyOEUwJywnL0hIQUhpc3RvcnkvJywnSGlzSXNDYWxsVHlwZScsJzI2MTMyMTM1NCcpOxYCZg8WAh8IaGQCCQ9kFgICAQ8PFgIfCGcWBB8UBQdIaXN0b3J5HxUFBGxpbmsWAmYPFgIfCGhkAgoPZBYCAgIPFQEWZGl2Q2FsbGVySW5mbzI2MTMyMTM1NGQCCw9kFhACAQ8WAh8IaGQCAw8WAh8IaGQCBA8VAj9ObyBTY2hlZHVsZSBPcGVuaW5nIFdoZW4gbm9uZSBvZiB0aGUgYWJvdmUgY2FzZXMgaXMgYXBwbGljYWJsZS4TTm8gU2NoZWR1bGUgT3BlbmluZ2QCBQ8PFgIfBAUTTm8gU2NoZWR1bGUgT3BlbmluZ2RkAgYPFQE%2FTm8gU2NoZWR1bGUgT3BlbmluZyBXaGVuIG5vbmUgb2YgdGhlIGFib3ZlIGNhc2VzIGlzIGFwcGxpY2FibGUuZAIHDxYEHwRlHwhoZAIJDxYEHwQFCTI2MTMyMTM1NB8IaGQCCw8PFgIfCGhkZAIMD2QWAgIBDw9kFgIfCwVGamF2YXNjcmlwdDogY2FsbEhIQUNHU2VydmljZSA9IDA7cmV0dXJuIFJlamVjdENhbGwoJzI2MTMyMTM1NCcsIHRoaXMpO2QCBg9kFhhmDw8WAh8EBQY2OTExMTlkZAIBD2QWAmYPDxYEHwQFBTEzMjU1HxEFASMWAh8SBawBamF2YXNjcmlwdDp3aW5kb3cub3BlbignLi4vQWlkZS9BaWRlLmFzcHg%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%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%2FQWlkZUlkPTQ2MjE2MTEmVGFiPTQnLCdBaWRlJywnbWVudWJhcj0wLHN0YXR1c2Jhcj0wLHRvcD0wLGxlZnQ9MCwgcmVzaXphYmxlPTEsd2lkdGg9MTAwMCxoZWlnaHQ9NjgwLHNjcm9sbGJhcnM9eWVzJyk7cmV0dXJuIGZhbHNlO2QCAg9kFgICAg8VARlkaXZDYXJlZ2l2ZXJJbmZvMjYwMjEyNDkyZAIDD2QWAgIBDxYCHwQFIUFsd2F5cyBIb21lIENhcmUsIEFsd2F5cyBOSFREL1RCSWQCBQ8PFgIfBAUNVGVhbSBGbHVzaGluZ2RkAgYPZBYCAgEPDxYCHwRlZGQCBw8PFgIfBAUKMDgvMTAvMjAyNWRkAggPDxYCHwQFBTIwOjEwZGQCCQ9kFgoCAQ8PFgQfBAUDT1VUHwhoZGQCAw8PFgQfBAUDT1VUHxEFASMWBB8SBSdTd2l0Y2hDYWxsVHlwZSgnT1VUJywnMjYwMjEyNDkyJywgdGhpcykfEwUBMGQCBQ8PFgQfBAUDKDcpHxEFASMWBB8LBcMBamF2YXNjcmlwdDpyZXR1cm4gc2hvd1BvcHVwV2l0aEVsZW1lbnRJZCgnLi4vQ2FsbC9QZXJmb3JtZWREdXRpZXNfbnMuYXNweD9NYWludGVuYW5jZUlEPTI2MDIxMjQ5MiZQYXRpZW50SUQ9MCZWaXNpdElEPTAmVXNlcklEPTE4NDg4NScsJ2NvbnRlbnQnLCdtZWRpdW0nLCdFVlYgYW5kIER1dHkgSW5mb3JtYXRpb24nLCc0MDBweCcsdGhpcyk7HxMFATBkAgcPZBYCAgEPDxYCHwhnFgQfCwVuIHJldHVybiBWaWV3V2luT3Blbkhpc3RvcnkoJzQwMzlCQTcyLTM4OTAtNDRDQy1BQzkwLTc1ODI3ODRFMjhFMCcsJy9ISEFIaXN0b3J5LycsJ0hpc0lzQ2FsbFR5cGUnLCcyNjAyMTI0OTInKTsfDAWBAWlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIFZpZXdXaW5PcGVuSGlzdG9yeSgnNDAzOUJBNzItMzg5MC00NENDLUFDOTAtNzU4Mjc4NEUyOEUwJywnL0hIQUhpc3RvcnkvJywnSGlzSXNDYWxsVHlwZScsJzI2MDIxMjQ5MicpOxYCZg8WAh8IaGQCCQ9kFgICAQ8PFgIfCGcWBB8UBQdIaXN0b3J5HxUFBGxpbmsWAmYPFgIfCGhkAgoPZBYCAgIPFQEWZGl2Q2FsbGVySW5mbzI2MDIxMjQ5MmQCCw9kFhACAQ8WAh8IaGQCAw8WAh8IaGQCBA8VAmZUaGUgQ2FyZWdpdmVyIGlzIGNhbGxpbmcgZnJvbSBhIHBob25lIG51bWJlciBub3QgcmVjb2duaXplZCBhcyBiZWxvbmdpbmcgdG8gYW55IFBhdGllbnQgaW4gdGhlIHN5c3RlbS4WUGhvbmUgTnVtYmVyIE5vdCBGb3VuZGQCBQ8PFgIfBAUWUGhvbmUgTnVtYmVyIE5vdCBGb3VuZGRkAgYPFQFmVGhlIENhcmVnaXZlciBpcyBjYWxsaW5nIGZyb20gYSBwaG9uZSBudW1iZXIgbm90IHJlY29nbml6ZWQgYXMgYmVsb25naW5nIHRvIGFueSBQYXRpZW50IGluIHRoZSBzeXN0ZW0uZAIHDxYEHwRlHwhoZAIJDxYEHwQFCTI2MDIxMjQ5Mh8IaGQCCw8PFgIfCGhkZAIMD2QWAgIBDw9kFgIfCwVGamF2YXNjcmlwdDogY2FsbEhIQUNHU2VydmljZSA9IDA7cmV0dXJuIFJlamVjdENhbGwoJzI2MDIxMjQ5MicsIHRoaXMpO2QCCg8PFgIfCGhkZAI6D2QWAgIBDxAPFgIfDWdkEBUBFUFsd2F5cyBIb21lIENhcmUgSW5jLhUBAzQ2ORQrAwFnZGQCPA8PFgIfBGVkZAI9DxYCHwhnFgICAQ8WAh8IaGQCPw8WAh4QT25Qcm9wZXJ0eUNoYW5nZQU5X19kb1Bvc3RCYWNrKCdjdGwwMCRDb250ZW50UGxhY2VIb2xkZXIxJHV4QnRuUmVmcmVzaCcsJycpZAJBDxYCHghJbnRlcnZhbAKAjI2eAmQCYA8WAh8FBWc0NzI2OTMwLDQwNTM3NTYsMzYzNzQwOSw0NjIxNjExLDM5OTk0MjUsNDI2MTczOCwxMjE1NDM5LDQzODQwODQsMjQ2Mzc4NCwzNDU3NDY0LDQwMzcxMjQsMTU4NDg3OCwxNzkyNzUzZAIHDw8WAh8EBRNFbnRlcnByaXNlIDI1LjA3LjAxZGQCCA8PFgIfBAURQVdTUFJPRFdFQjYgOiA0NDNkZAIKDw8WAh8EBRQwOS8xMC8yNSAyOjA0IEFNIEVTVGRkGAIFHl9fQ29udHJvbHNSZXF1aXJlUG9zdEJhY2tLZXlfXxYDBRhjdGwwMCRMb2dpblN0YXR1czEkY3RsMDEFGGN0bDAwJExvZ2luU3RhdHVzMSRjdGwwMwUPY3RsMDAkaW1nYnRuVVJMBSRjdGwwMCRDb250ZW50UGxhY2VIb2xkZXIxJHV4R3ZTZWFyY2gPPCsADAICAgEIAgJk15TMfkuLKjcRsINtjIjpSocVgOo%3D&__VIEWSTATEGENERATOR=C2AFDDB1&ctl00%24hidUserMessageID=&ctl00%24ucMenu%24hidAgenciesUsingNewPendingPlacementVendor=true&ctl00%24ucMenu%24hidMenuUserId=184885&ctl00%24ucMenu%24hidMenuVendorId=469&ctl00%24hdnShowCmpArtMenu=0&ctl00%24hdnSessionID=4039BA72-3890-44CC-AC90-7582784E28E0&ctl00%24hdnAppVersion=ENT&ctl00%24hdnVersion=25.07&ctl00%24hdnMinorVersion=1.0&ctl00%24hdnMobileChatAppVersionID=34&ctl00%24hdnChatAccess=False&ctl00%24hdnProviderAppVersionID=101&ctl00%24hdnIsOldHistoryEnabled=0&ctl00%24hdnIsNewHistoryEnabled=1&ctl00%24hdnHistoryViewerUrl=https%3A%2F%2Fapp.hhaexchange.com%2Fhistory%2F&ctl00%24hdnWebcomponentsLibraryUrl=https%3A%2F%2Funpkg.com%2Ffoundation-web-components%2Fumd%2Fwebcomponents.js&ctl00%24hdnFileSizeText=20&ctl00%24hdnFileSizeLimit=20971520&selectAll=on&selectItem=469&selectItem=5137&selectItem=5139&selectItem=6475&selectItem=14849&ctl00%24ContentPlaceHolder1%24divOffice%24hdnuserid=184885&ctl00%24ContentPlaceHolder1%24divOffice%24hdnappVersion=ENT&ctl00%24ContentPlaceHolder1%24divOffice%24hdnversion=25.07&ctl00%24ContentPlaceHolder1%24divOffice%24hdnminorVersion=1.0&ctl00%24ContentPlaceHolder1%24divOffice%24hdnWebURL=%2FHHAWSENT2507010000%2FOffice.asmx&ctl00%24ContentPlaceHolder1%24divOffice%24hdnAppName=ENT&ctl00%24ContentPlaceHolder1%24divOffice%24hdnAppSecret=79BB4FCD-9884-4652-B77F-6077F363193D&ctl00%24ContentPlaceHolder1%24divOffice%24hdnIpAddress=142.255.97.104&ctl00%24ContentPlaceHolder1%24divOffice%24hdnOffices=469%2C5137%2C5139%2C6475%2C14849&ctl00%24ContentPlaceHolder1%24divOffice%24hdnCallbackFunction=UpdateOfficeData%28%29%3B&ctl00%24ContentPlaceHolder1%24divOffice%24hdnSingleSelect=false&ctl00%24ContentPlaceHolder1%24divOffice%24hdnIsDisable=false&ctl00%24ContentPlaceHolder1%24divOffice%24hdnWidth=178&ctl00%24ContentPlaceHolder1%24divOffice%24hdnAutoPostback=False&ctl00%24ContentPlaceHolder1%24divOffice%24hdnDefaultText=Select+one+or+more...&ctl00%24ContentPlaceHolder1%24divOffice%24hdnOnClientSideLoad=bindedOn%28%29%3B&ctl00%24ContentPlaceHolder1%24divOffice%24hdnPermissionName=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnSelectionType=Filter&ctl00%24ContentPlaceHolder1%24divOffice%24hdnRevokeMethod=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnSelectAllRevokeMethod=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnOnOpenFunction=OnOpen%28%29%3B&ctl00%24ContentPlaceHolder1%24divOffice%24hdnOnCloseNoChangeFunction=OnClientClose%28%29%3B&ctl00%24ContentPlaceHolder1%24divOffice%24hdnGetDependentControls=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnOnSingleSelect=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnEmptyDisable=false&ctl00%24ContentPlaceHolder1%24divOffice%24hdnNoOffice=false&ctl00%24ContentPlaceHolder1%24divOffice%24hdnShowUnassignedOfficeForReferrals=false&ctl00%24ContentPlaceHolder1%24divOffice%24hdnSetOfficeSelectionValue=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnPayrollSetupID=-1&ctl00%24ContentPlaceHolder1%24divOffice%24hdnCaregiverID=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnCustomeMethod=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnOfficeNames=Always+Home+Care%2CAHC+%E2%80%93+New+York%2CAHC+--+Richmond%2CPrivate+Duty+Expert%2CAlways+NHTD%2FTBI&ctl00%24ContentPlaceHolder1%24divOffice%24hdnAllOffices=469%2C5137%2C5139%2C6475%2C14849&ctl00%24ContentPlaceHolder1%24hdnSelectedOffices=469%2C5137%2C5139%2C6475%2C14849&ctl00%24ContentPlaceHolder1%24uxDdlCoordinator=74093&ctl00%24ContentPlaceHolder1%24hdnSelectedCoordinator=74093&ctl00%24ContentPlaceHolder1%24uxDtFromDate=2025-08-04&ctl00%24ContentPlaceHolder1%24uxtxtFromTime=&ctl00%24ContentPlaceHolder1%24uxDtToDate=2025-09-10&ctl00%24ContentPlaceHolder1%24uxtxtToTime=&ctl00%24ContentPlaceHolder1%24uxTxtAideFirstName=&ctl00%24ContentPlaceHolder1%24uxTxtAideLastName=&ctl00%24ContentPlaceHolder1%24txtCaregiverCode=&ctl00%24ContentPlaceHolder1%24uxDdlTeam=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedCaregiverTeam=&ctl00%24ContentPlaceHolder1%24uxDdlCaregiverLocation=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedCaregiverLocation=&ctl00%24ContentPlaceHolder1%24uxDdlCaregiverBranch=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedCaregiverBranch=&ctl00%24ContentPlaceHolder1%24uxTxtAssignmentID=&ctl00%24ContentPlaceHolder1%24uxTxtAdmissionID=&ctl00%24ContentPlaceHolder1%24uxDdlContract=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedContract=&selectItem=9&selectItem=15&selectItem=19&selectItem=24&selectItem=11&selectItem=10&selectItem=14&selectItem=16&selectItem=12&selectItem=22&selectItem=23&selectItem=18&selectItem=20&selectItem=21&selectItem=13&selectItem=8&selectItem=43&selectItem=25&selectItem=26&selectItem=27&selectItem=36&selectItem=33&selectItem=34&selectItem=29&selectItem=32&ctl00%24ContentPlaceHolder1%24hdnUserID=184885&ctl00%24ContentPlaceHolder1%24hdnAppVersion=ENT&ctl00%24ContentPlaceHolder1%24hdnVersion=25.07&ctl00%24ContentPlaceHolder1%24hdnMinorVersion=1.0&ctl00%24ContentPlaceHolder1%24hdnCallerInfo=&ctl00%24ContentPlaceHolder1%24hdnServicePath=%2FHHAWSENT2507010000%2F&ctl00%24ContentPlaceHolder1%24hdnAppName=ENT&ctl00%24ContentPlaceHolder1%24hdnAppSecret=79BB4FCD-9884-4652-B77F-6077F363193D&ctl00%24ContentPlaceHolder1%24hdnWSURL=%2FHHAWSENT2507010000%2F&ctl00%24ContentPlaceHolder1%24hdnBroadcastReceivedPageSize=25&ctl00%24ContentPlaceHolder1%24hdnAltCaregiverValue=Caregiver&ctl00%24ContentPlaceHolder1%24hdnAltPatientValue=Patient&ctl00%24ContentPlaceHolder1%24hdnAltFOBValue=FOB&ctl00%24ContentPlaceHolder1%24hdnIsBeaconDeviceEnable=691%2C651%2C262%2C339%2C959%2C338%2C370%2C155%2C180%2C243%2C848%2C216%2C241%2C194%2C939%2C543%2C709%2C1730%2C377%2C674%2C733%2C801%2C744&ctl00%24ContentPlaceHolder1%24hdnddlMaintenanceStatus=9%2C15%2C19%2C24%2C11%2C10%2C14%2C16%2C12%2C22%2C23%2C18%2C20%2C21%2C13%2C8%2C43%2C25%2C26%2C27%2C36%2C33%2C34%2C29%2C32&ctl00%24ContentPlaceHolder1%24uxTxtPatientFirstName=&ctl00%24ContentPlaceHolder1%24uxTxtPatientLastName=&ctl00%24ContentPlaceHolder1%24uxDdlPatientTeam=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedPatientTeam=&ctl00%24ContentPlaceHolder1%24uxDdlPatientLocation=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedPatientLocation=&ctl00%24ContentPlaceHolder1%24uxDdlPatientBranch=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedPatientBranch=&ctl00%24ContentPlaceHolder1%24hdnCallReprocessLimit=1000&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl02%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl03%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl04%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl05%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl06%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl07%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl08%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl09%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl10%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxDdlVendor=469&ctl00%24ContentPlaceHolder1%24uxHidRefresh=&ctl00%24ContentPlaceHolder1%24uxHidValidateScheduleOvertime=True&ctl00%24ContentPlaceHolder1%24uxHidScheduleOvertimePwd=&ctl00%24ContentPlaceHolder1%24uxHidAideID=&ctl00%24ContentPlaceHolder1%24uxHidAideCode=&ctl00%24ContentPlaceHolder1%24uxHidFromCallDashBoard=1&ctl00%24ContentPlaceHolder1%24hdnFromTime=&ctl00%24ContentPlaceHolder1%24hdnToTime=&ctl00%24ContentPlaceHolder1%24hidProviderURL=https%3A%2F%2Fapp.hhaexchange.com%2FPROVIDER2507010000%2Fcaregiver-availability&ctl00%24ContentPlaceHolder1%24hdnEditSkilledSchedule=True&ctl00%24ContentPlaceHolder1%24hdnEditNonSkillSchedule=True&ctl00%24ContentPlaceHolder1%24hdnEditPayrollInfoAfterPayroll=False&ctl00%24ContentPlaceHolder1%24hdnEditPayrollInfoAfterBilling=False&ctl00%24ContentPlaceHolder1%24hdnInternalEditScheduleTime=True&ctl00%24ContentPlaceHolder1%24hdnLinkCall=True&ctl00%24ContentPlaceHolder1%24hdnAllowLinkingUnrecognizedNumber=True&ctl00%24ContentPlaceHolder1%24hdnEditPatientProfile=False&ctl00%24ContentPlaceHolder1%24hdnReportPagePath=https%3A%2F%2Freports.hhaexchange.com%2FHHAReportsML%2FReports%2F&ctl00%24ContentPlaceHolder1%24hdnReportServicepath=http%3A%2F%2FAWSProdWebRP2%2FHHAReportsWS%2FReportWebService.asmx&ctl00%24ContentPlaceHolder1%24hdnSessionId=4039BA72-3890-44CC-AC90-7582784E28E0&ctl00%24ContentPlaceHolder1%24hdnControlID=&ctl00%24ContentPlaceHolder1%24hdnCallDashboardCorrections=&ctl00%24ContentPlaceHolder1%24hdnVendorID=469&ctl00%24ContentPlaceHolder1%24hdnHistoryData=&ctl00%24ContentPlaceHolder1%24hdnIspopupOpen=&ctl00%24ContentPlaceHolder1%24hdnKafkaWebAPIPath=%2FHHAXKafkaAPI20070100%2Fapi%2F&ctl00%24ContentPlaceHolder1%24hdnHistoryURL=%2FHHAHistory%2F&ctl00%24ContentPlaceHolder1%24hdnMessageType=2&ctl00%24ContentPlaceHolder1%24hdnMessageSource=3&ctl00%24ContentPlaceHolder1%24hdnAllowLinkingUnrecognizedFOB=True&ctl00%24ContentPlaceHolder1%24hdnAllowLinkingUnrecognizedGPS=True";
  
      try {
        console.log(`Sending POST request to: ${fullUrl}`);
  
        // 4. 发送 GM_fetch 请求
        const response = await GM_fetch(fullUrl, {
          method: 'POST',
          headers: {
            // 这个 Content-Type 告诉服务器我们发送的是URL编码的表单数据
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            // 根据我们之前的分析，Referer头是必需的
            'Referer': fullUrl
          },
          // 直接将完整的载荷字符串作为 body
          body: fullPayload
        });
  
        // 5. 处理响应
        if (response.ok) {
          console.log("Request successful! Status:", response.status);
          // 获取响应的HTML内容
          const responseHtml = await (response as any).rawBody.text();
          console.log("Response HTML (first 500 chars):", responseHtml);
          // 在这里，您可以添加解析 responseHtml 的代码
          // 例如： const data = parseAnomalyReport(responseHtml);
  
          // 返回HTML以便后续处理
          return responseHtml;
        } else {
          console.error(`Request failed! Status: ${response.status} ${response.statusText}`);
          // 返回错误信息
          return `Error: ${response.status} ${response.statusText}`;
        }
  
      } catch (error) {
        console.error("An error occurred during the fetch operation:", error);
        return `Error: ${error}`;
      }
    }
  
    async function sendStaticPostRequest1() {
  
      // 1. 定义请求的目标 URL (不包含 QueryString)
      const baseUrl = "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
  
      // 2. 定义 QueryString 部分
      const queryString = "VisitStatus=13&s=4039BA72-3890-44CC-AC90-7582784E28E0&Version=25.07&MinorVersion=1.00&AppVersion=ENT";
  
      // 完整的请求 URL
      const fullUrl = `${baseUrl}?${queryString}`;
  
      // 3. 定义您提供的完整载荷 (Payload)
      // 注意：这是一个非常长的字符串，其中包含了所有表单数据
      const fullPayload = "__LASTFOCUS=&__EVENTTARGET=ctl00%24ContentPlaceHolder1%24uxGvSearch&__EVENTARGUMENT=Page%241&__VIEWSTATE=%2FwEPDwUJOTA4OTQ1MzUzDxYCHhNWYWxpZGF0ZVJlcXVlc3RNb2RlAgEWAmYPZBYQAgEPDxYGHglGb250X0JvbGRnHgxGb3JtYXRTdHJpbmcFCFRhbyBZYW5nHgRfIVNCAoAQZGQCAg8PFgIeBFRleHQFFUFsd2F5cyBIb21lIENhcmUgSW5jLmRkAgQPDxYGHwFnHwIFCFRhbyBZYW5nHwMCgBBkZAIFDw8WAh8EBRVBbHdheXMgSG9tZSBDYXJlIEluYy5kZAIGD2QWBAIHD2QWAgIBD2QWAgIHDxYCHglpbm5lcmh0bWwFrQc8VUwgaWQ9J25hdmlnYXRpb24nIGNsYXNzPSduYXZpZ2F0aW9uJz48bGkgaWQ9J3BhcmVudG1lbnVpZDAnPjxhIHN0eWxlPSdjdXJzb3I6IHBvaW50ZXI7Jz5Ib21lPC9hPjx1bCBjbGFzcz0nc3VibWVudSc%2BPGxpPjxhPkxvYWRpbmcuLi48L2E%2BPC9saT48L3VsPjxsaSBpZD0ncGFyZW50bWVudWlkMSc%2BPGEgc3R5bGU9J2N1cnNvcjogcG9pbnRlcjsnPlBhdGllbnQ8L2E%2BPHVsIGNsYXNzPSdzdWJtZW51Jz48bGk%2BPGE%2BTG9hZGluZy4uLjwvYT48L2xpPjwvdWw%2BPGxpIGlkPSdwYXJlbnRtZW51aWQyJz48YSBzdHlsZT0nY3Vyc29yOiBwb2ludGVyOyc%2BQ2FyZWdpdmVyPC9hPjx1bCBjbGFzcz0nc3VibWVudSc%2BPGxpPjxhPkxvYWRpbmcuLi48L2E%2BPC9saT48L3VsPjxsaSBpZD0ncGFyZW50bWVudWlkMyc%2BPGEgc3R5bGU9J2N1cnNvcjogcG9pbnRlcjsnPlZpc2l0PC9hPjx1bCBjbGFzcz0nc3VibWVudSc%2BPGxpPjxhPkxvYWRpbmcuLi48L2E%2BPC9saT48L3VsPjxsaSBpZD0ncGFyZW50bWVudWlkNCc%2BPGEgc3R5bGU9J2N1cnNvcjogcG9pbnRlcjsnPkFjdGlvbjwvYT48dWwgY2xhc3M9J3N1Ym1lbnUnPjxsaT48YT5Mb2FkaW5nLi4uPC9hPjwvbGk%2BPC91bD48bGkgaWQ9J3BhcmVudG1lbnVpZDUnPjxhIHN0eWxlPSdjdXJzb3I6IHBvaW50ZXI7Jz5CaWxsaW5nPC9hPjx1bCBjbGFzcz0nc3VibWVudSc%2BPGxpPjxhPkxvYWRpbmcuLi48L2E%2BPC9saT48L3VsPjxsaSBpZD0ncGFyZW50bWVudWlkNic%2BPGEgc3R5bGU9J2N1cnNvcjogcG9pbnRlcjsnPlJlcG9ydDwvYT48dWwgY2xhc3M9J3N1Ym1lbnUnPjxsaT48YT5Mb2FkaW5nLi4uPC9hPjwvbGk%2BPC91bD48bGkgaWQ9J3BhcmVudG1lbnVpZDcnPjxhIHN0eWxlPSdjdXJzb3I6IHBvaW50ZXI7Jz5BZG1pbjwvYT48dWwgY2xhc3M9J3N1Ym1lbnUnPjxsaT48YT5Mb2FkaW5nLi4uPC9hPjwvbGk%2BPC91bD48L1VMPmQCCQ9kFhxmD2QWBgIBDxYCHgVjbGFzcwUhdGFicy10aXRsZSB0ZXh0LWNlbnRlciBjdXJyZW50dGFiFgICAQ8PZBYCHg1hcmlhLXNlbGVjdGVkBQR0cnVlZAIJDxYCHgdWaXNpYmxlaGQCEw8PFgIfBAUMU2VhcmNoIENhbGxzZGQCBg8PZBYEHgpvbmtleXByZXNzBRNyZXR1cm4gT25LZXlQcmVzcygpHgZvbmJsdXIFZHZhbGlkYXRlSEhNTUNhbGxEYXNoYm9hcmQoJ2N0bDAwX0NvbnRlbnRQbGFjZUhvbGRlcjFfdXh0eHRGcm9tVGltZScsJ2ZoaG1tJywnZnJvbXRpbWVycm9ycycsIGZhbHNlKTtkAggPD2QWBB8JBRNyZXR1cm4gT25LZXlQcmVzcygpHwoFYHZhbGlkYXRlSEhNTUNhbGxEYXNoYm9hcmQoJ2N0bDAwX0NvbnRlbnRQbGFjZUhvbGRlcjFfdXh0eHRUb1RpbWUnLCd0aGhtbScsJ3RvdGltZXJyb3JzJywgZmFsc2UpO2QCKA8QZGQWAWZkAjQPD2QWAh4Hb25jbGljawUYcmV0dXJuIFZhbGlkYXRlU2VhcmNoKCk7ZAI2Dw8WAh8EBQtEaXNwbGF5R3JpZGRkAjcPD2QWBB8LBR1vcGVuUHJvdmlkZXIoKTsgcmV0dXJuIGZhbHNlOx4Jb25rZXlkb3duBShpZiAoZXZlbnQua2V5Q29kZSA9PSAxMykgb3BlblByb3ZpZGVyKCk7ZAI5DxYCHwhnFgQCAQ8PFgIfBAUEKDE5KWRkAgkPPCsAEQMADxYGHgtfIURhdGFCb3VuZGceDERhdGFTb3VyY2VJRAULdXhPZHNTZWFyY2geC18hSXRlbUNvdW50AhNkARAWAQIHFgE8KwAFAQAWAh4KSGVhZGVyVGV4dAWTAUNhbGwgRGF0ZTxzcGFuIHJvbGU9J2xpbmsnIGFyaWEtbGFiZWw9J2FjdGl2YXRlIHRvIHNvcnQgY29sdW1uIGFzY2VuZGluZycgc3R5bGU9J2ZvbnQtZmFtaWx5OiBXZWJkaW5nczsgJz4gPHNwYW4gYXJpYS1oaWRkZW49J3RydWUnPjY8L3NwYW4%2BPC9zcGFuPhYBZgwUKwAAFgJmD2QWFAIBD2QWGGYPDxYCHwQFBjU1Mjg3N2RkAgEPZBYCZg8PFgQfBAUFMjI4NTUeC05hdmlnYXRlVXJsBQEjFgIeB09uQ2xpY2sFrAFqYXZhc2NyaXB0OndpbmRvdy5vcGVuKCcuLi9BaWRlL0FpZGUuYXNweD9BaWRlSWQ9NDM4NDA4NCZUYWI9NCcsJ0FpZGUnLCdtZW51YmFyPTAsc3RhdHVzYmFyPTAsdG9wPTAsbGVmdD0wLCByZXNpemFibGU9MSx3aWR0aD0xMDAwLGhlaWdodD02ODAsc2Nyb2xsYmFycz15ZXMnKTtyZXR1cm4gZmFsc2U7ZAICD2QWAgICDxUBGWRpdkNhcmVnaXZlckluZm8yNjE0NjcwMTRkAgMPZBYCAgEPFgIfBAUhQWx3YXlzIEhvbWUgQ2FyZSwgQWx3YXlzIE5IVEQvVEJJZAIFDw8WAh8EBQ1UZWFtIDh0aCBBdmUuZGQCBg9kFgICAQ8PFgIfBGVkZAIHDw8WAh8EBQowOS8wMS8yMDI1ZGQCCA8PFgIfBAUFMjA6MDRkZAIJD2QWCgIBDw8WBB8EBQNPVVQfCGhkZAIDDw8WBB8EBQNPVVQfEQUBIxYEHxIFJ1N3aXRjaENhbGxUeXBlKCdPVVQnLCcyNjE0NjcwMTQnLCB0aGlzKR4IVGFiSW5kZXgFATBkAgUPDxYEHwQFAyg2KR8RBQEjFgQfCwXDAWphdmFzY3JpcHQ6cmV0dXJuIHNob3dQb3B1cFdpdGhFbGVtZW50SWQoJy4uL0NhbGwvUGVyZm9ybWVkRHV0aWVzX25zLmFzcHg%2FTWFpbnRlbmFuY2VJRD0yNjE0NjcwMTQmUGF0aWVudElEPTAmVmlzaXRJRD0wJlVzZXJJRD0xODQ4ODUnLCdjb250ZW50JywnbWVkaXVtJywnRVZWIGFuZCBEdXR5IEluZm9ybWF0aW9uJywnNDAwcHgnLHRoaXMpOx8TBQEwZAIHD2QWAgIBDw8WAh8IZxYEHwsFbiByZXR1cm4gVmlld1dpbk9wZW5IaXN0b3J5KCc0MDM5QkE3Mi0zODkwLTQ0Q0MtQUM5MC03NTgyNzg0RTI4RTAnLCcvSEhBSGlzdG9yeS8nLCdIaXNJc0NhbGxUeXBlJywnMjYxNDY3MDE0Jyk7HwwFgQFpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInKSBWaWV3V2luT3Blbkhpc3RvcnkoJzQwMzlCQTcyLTM4OTAtNDRDQy1BQzkwLTc1ODI3ODRFMjhFMCcsJy9ISEFIaXN0b3J5LycsJ0hpc0lzQ2FsbFR5cGUnLCcyNjE0NjcwMTQnKTsWAmYPFgIfCGhkAgkPZBYCAgEPDxYCHwhnFgQeCmFyaWEtbGFiZWwFB0hpc3RvcnkeBHJvbGUFBGxpbmsWAmYPFgIfCGhkAgoPZBYCAgIPFQEWZGl2Q2FsbGVySW5mbzI2MTQ2NzAxNGQCCw9kFhACAQ8WAh8IaGQCAw8WAh8IaGQCBA8VAmZUaGUgQ2FyZWdpdmVyIGlzIGNhbGxpbmcgZnJvbSBhIHBob25lIG51bWJlciBub3QgcmVjb2duaXplZCBhcyBiZWxvbmdpbmcgdG8gYW55IFBhdGllbnQgaW4gdGhlIHN5c3RlbS4WUGhvbmUgTnVtYmVyIE5vdCBGb3VuZGQCBQ8PFgIfBAUWUGhvbmUgTnVtYmVyIE5vdCBGb3VuZGRkAgYPFQFmVGhlIENhcmVnaXZlciBpcyBjYWxsaW5nIGZyb20gYSBwaG9uZSBudW1iZXIgbm90IHJlY29nbml6ZWQgYXMgYmVsb25naW5nIHRvIGFueSBQYXRpZW50IGluIHRoZSBzeXN0ZW0uZAIHDxYEHwRlHwhoZAIJDxYEHwQFCTI2MTQ2NzAxNB8IaGQCCw8PFgIfCGhkZAIMD2QWAgIBDw9kFgIfCwVGamF2YXNjcmlwdDogY2FsbEhIQUNHU2VydmljZSA9IDA7cmV0dXJuIFJlamVjdENhbGwoJzI2MTQ2NzAxNCcsIHRoaXMpO2QCAg9kFhhmDw8WAh8EBQYyMzQ3ODJkZAIBD2QWAmYPDxYEHwQFBTE2MTg5HxEFASMWAh8SBawBamF2YXNjcmlwdDp3aW5kb3cub3BlbignLi4vQWlkZS9BaWRlLmFzcHg%2FQWlkZUlkPTI0NjM3ODQmVGFiPTQnLCdBaWRlJywnbWVudWJhcj0wLHN0YXR1c2Jhcj0wLHRvcD0wLGxlZnQ9MCwgcmVzaXphYmxlPTEsd2lkdGg9MTAwMCxoZWlnaHQ9NjgwLHNjcm9sbGJhcnM9eWVzJyk7cmV0dXJuIGZhbHNlO2QCAg9kFgICAg8VARlkaXZDYXJlZ2l2ZXJJbmZvMjYxNDYwMTEwZAIDD2QWAgIBDxYCHwQFEEFsd2F5cyBIb21lIENhcmVkAgUPDxYCHwQFDVRlYW0gOHRoIEF2ZS5kZAIGD2QWAgIBDw8WAh8EBRNNQSBYSVVNRUkgKDkwNjA5NCkgZGQCBw8PFgIfBAUKMDkvMDEvMjAyNWRkAggPDxYCHwQFBTE4OjE0ZGQCCQ9kFgoCAQ8PFgQfBAUDT1VUHwhoZGQCAw8PFgQfBAUDT1VUHxEFASMWBB8SBSdTd2l0Y2hDYWxsVHlwZSgnT1VUJywnMjYxNDYwMTEwJywgdGhpcykfEwUBMGQCBQ8PFgQfBAUEKDE0KR8RBQEjFgQfCwXKAWphdmFzY3JpcHQ6cmV0dXJuIHNob3dQb3B1cFdpdGhFbGVtZW50SWQoJy4uL0NhbGwvUGVyZm9ybWVkRHV0aWVzX25zLmFzcHg%2FTWFpbnRlbmFuY2VJRD0yNjE0NjAxMTAmUGF0aWVudElEPTE0NTgwNjc3JlZpc2l0SUQ9MCZVc2VySUQ9MTg0ODg1JywnY29udGVudCcsJ21lZGl1bScsJ0VWViBhbmQgRHV0eSBJbmZvcm1hdGlvbicsJzQwMHB4Jyx0aGlzKTsfEwUBMGQCBw9kFgICAQ8PFgIfCGcWBB8LBW4gcmV0dXJuIFZpZXdXaW5PcGVuSGlzdG9yeSgnNDAzOUJBNzItMzg5MC00NENDLUFDOTAtNzU4Mjc4NEUyOEUwJywnL0hIQUhpc3RvcnkvJywnSGlzSXNDYWxsVHlwZScsJzI2MTQ2MDExMCcpOx8MBYEBaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJykgVmlld1dpbk9wZW5IaXN0b3J5KCc0MDM5QkE3Mi0zODkwLTQ0Q0MtQUM5MC03NTgyNzg0RTI4RTAnLCcvSEhBSGlzdG9yeS8nLCdIaXNJc0NhbGxUeXBlJywnMjYxNDYwMTEwJyk7FgJmDxYCHwhoZAIJD2QWAgIBDw8WAh8IZxYEHxQFB0hpc3RvcnkfFQUEbGluaxYCZg8WAh8IaGQCCg9kFgICAg8VARZkaXZDYWxsZXJJbmZvMjYxNDYwMTEwZAILD2QWEAIBDxYCHwhoZAIDDxYCHwhoZAIEDxUCqQFDYXJlZ2l2ZXIgcGxhY2luZyB0aGUgRVZWIGlzIG5vdCBzY2hlZHVsZWQgdG8gd29yayBmb3IgdGhlIHZpc2l0LiBUaGUgQ2FyZWdpdmVyIHNjaGVkdWxlZCB0byB3b3JrIHRoZSB2aXNpdCBoYXMgbm90IA0KICAgICAgICAgICAgICAgICAgIGFscmVhZHkgcGxhY2VkIGEgc3VjY2Vzc2Z1bCBFVlYuHURpZmZlcmVudCBDYXJlZ2l2ZXIgU2NoZWR1bGVkZAIFDw8WAh8EBR1EaWZmZXJlbnQgQ2FyZWdpdmVyIFNjaGVkdWxlZGRkAgYPFQGpAUNhcmVnaXZlciBwbGFjaW5nIHRoZSBFVlYgaXMgbm90IHNjaGVkdWxlZCB0byB3b3JrIGZvciB0aGUgdmlzaXQuIFRoZSBDYXJlZ2l2ZXIgc2NoZWR1bGVkIHRvIHdvcmsgdGhlIHZpc2l0IGhhcyBub3QgDQogICAgICAgICAgICAgICAgICAgYWxyZWFkeSBwbGFjZWQgYSBzdWNjZXNzZnVsIEVWVi5kAgcPFgQfBGUfCGhkAgkPFgQfBAUJMjYxNDYwMTEwHwhoZAILDw8WAh8IaGRkAgwPZBYCAgEPD2QWAh8LBUZqYXZhc2NyaXB0OiBjYWxsSEhBQ0dTZXJ2aWNlID0gMDtyZXR1cm4gUmVqZWN0Q2FsbCgnMjYxNDYwMTEwJywgdGhpcyk7ZAIDD2QWGGYPDxYCHwQFBjk0MjYzNGRkAgEPZBYCZg8PFgQfBAUFMTgzNjQfEQUBIxYCHxIFrAFqYXZhc2NyaXB0OndpbmRvdy5vcGVuKCcuLi9BaWRlL0FpZGUuYXNweD9BaWRlSWQ9MzQ1NzQ2NCZUYWI9NCcsJ0FpZGUnLCdtZW51YmFyPTAsc3RhdHVzYmFyPTAsdG9wPTAsbGVmdD0wLCByZXNpemFibGU9MSx3aWR0aD0xMDAwLGhlaWdodD02ODAsc2Nyb2xsYmFycz15ZXMnKTtyZXR1cm4gZmFsc2U7ZAICD2QWAgICDxUBGWRpdkNhcmVnaXZlckluZm8yNjE0MDQxNzRkAgMPZBYCAgEPFgIfBAUQQWx3YXlzIEhvbWUgQ2FyZWQCBQ8PFgIfBAUOVGVhbSBDaGluYXRvd25kZAIGD2QWAgIBDw8WAh8EBRRMZWUgQ3VpbWVpICg5MDczMzUpIGRkAgcPDxYCHwQFCjA4LzMxLzIwMjVkZAIIDw8WAh8EBQUyMDo1OGRkAgkPZBYKAgEPDxYEHwQFA09VVB8IaGRkAgMPDxYEHwQFA09VVB8RBQEjFgQfEgUnU3dpdGNoQ2FsbFR5cGUoJ09VVCcsJzI2MTQwNDE3NCcsIHRoaXMpHxMFATBkAgUPDxYEHwQFAyg4KR8RBQEjFgQfCwXKAWphdmFzY3JpcHQ6cmV0dXJuIHNob3dQb3B1cFdpdGhFbGVtZW50SWQoJy4uL0NhbGwvUGVyZm9ybWVkRHV0aWVzX25zLmFzcHg%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8EBQNPVVQfCGhkZAIDDw8WBB8EBQNPVVQfEQUBIxYEHxIFJ1N3aXRjaENhbGxUeXBlKCdPVVQnLCcyNjEzMjEzNTQnLCB0aGlzKR8TBQEwZAIFDw8WBB8EBQMoOCkfEQUBIxYEHwsFygFqYXZhc2NyaXB0OnJldHVybiBzaG93UG9wdXBXaXRoRWxlbWVudElkKCcuLi9DYWxsL1BlcmZvcm1lZER1dGllc19ucy5hc3B4P01haW50ZW5hbmNlSUQ9MjYxMzIxMzU0JlBhdGllbnRJRD0xOTg2OTg1NCZWaXNpdElEPTAmVXNlcklEPTE4NDg4NScsJ2NvbnRlbnQnLCdtZWRpdW0nLCdFVlYgYW5kIER1dHkgSW5mb3JtYXRpb24nLCc0MDBweCcsdGhpcyk7HxMFATBkAgcPZBYCAgEPDxYCHwhnFgQfCwVuIHJldHVybiBWaWV3V2luT3Blbkhpc3RvcnkoJzQwMzlCQTcyLTM4OTAtNDRDQy1BQzkwLTc1ODI3ODRFMjhFMCcsJy9ISEFIaXN0b3J5LycsJ0hpc0lzQ2FsbFR5cGUnLCcyNjEzMjEzNTQnKTsfDAWBAWlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIFZpZXdXaW5PcGVuSGlzdG9yeSgnNDAzOUJBNzItMzg5MC00NENDLUFDOTAtNzU4Mjc4NEUyOEUwJywnL0hIQUhpc3RvcnkvJywnSGlzSXNDYWxsVHlwZScsJzI2MTMyMTM1NCcpOxYCZg8WAh8IaGQCCQ9kFgICAQ8PFgIfCGcWBB8UBQdIaXN0b3J5HxUFBGxpbmsWAmYPFgIfCGhkAgoPZBYCAgIPFQEWZGl2Q2FsbGVySW5mbzI2MTMyMTM1NGQCCw9kFhACAQ8WAh8IaGQCAw8WAh8IaGQCBA8VAj9ObyBTY2hlZHVsZSBPcGVuaW5nIFdoZW4gbm9uZSBvZiB0aGUgYWJvdmUgY2FzZXMgaXMgYXBwbGljYWJsZS4TTm8gU2NoZWR1bGUgT3BlbmluZ2QCBQ8PFgIfBAUTTm8gU2NoZWR1bGUgT3BlbmluZ2RkAgYPFQE%2FTm8gU2NoZWR1bGUgT3BlbmluZyBXaGVuIG5vbmUgb2YgdGhlIGFib3ZlIGNhc2VzIGlzIGFwcGxpY2FibGUuZAIHDxYEHwRlHwhoZAIJDxYEHwQFCTI2MTMyMTM1NB8IaGQCCw8PFgIfCGhkZAIMD2QWAgIBDw9kFgIfCwVGamF2YXNjcmlwdDogY2FsbEhIQUNHU2VydmljZSA9IDA7cmV0dXJuIFJlamVjdENhbGwoJzI2MTMyMTM1NCcsIHRoaXMpO2QCBg9kFhhmDw8WAh8EBQY2OTExMTlkZAIBD2QWAmYPDxYEHwQFBTEzMjU1HxEFASMWAh8SBawBamF2YXNjcmlwdDp3aW5kb3cub3BlbignLi4vQWlkZS9BaWRlLmFzcHg%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%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%2FQWlkZUlkPTQ2MjE2MTEmVGFiPTQnLCdBaWRlJywnbWVudWJhcj0wLHN0YXR1c2Jhcj0wLHRvcD0wLGxlZnQ9MCwgcmVzaXphYmxlPTEsd2lkdGg9MTAwMCxoZWlnaHQ9NjgwLHNjcm9sbGJhcnM9eWVzJyk7cmV0dXJuIGZhbHNlO2QCAg9kFgICAg8VARlkaXZDYXJlZ2l2ZXJJbmZvMjYwMjEyNDkyZAIDD2QWAgIBDxYCHwQFIUFsd2F5cyBIb21lIENhcmUsIEFsd2F5cyBOSFREL1RCSWQCBQ8PFgIfBAUNVGVhbSBGbHVzaGluZ2RkAgYPZBYCAgEPDxYCHwRlZGQCBw8PFgIfBAUKMDgvMTAvMjAyNWRkAggPDxYCHwQFBTIwOjEwZGQCCQ9kFgoCAQ8PFgQfBAUDT1VUHwhoZGQCAw8PFgQfBAUDT1VUHxEFASMWBB8SBSdTd2l0Y2hDYWxsVHlwZSgnT1VUJywnMjYwMjEyNDkyJywgdGhpcykfEwUBMGQCBQ8PFgQfBAUDKDcpHxEFASMWBB8LBcMBamF2YXNjcmlwdDpyZXR1cm4gc2hvd1BvcHVwV2l0aEVsZW1lbnRJZCgnLi4vQ2FsbC9QZXJmb3JtZWREdXRpZXNfbnMuYXNweD9NYWludGVuYW5jZUlEPTI2MDIxMjQ5MiZQYXRpZW50SUQ9MCZWaXNpdElEPTAmVXNlcklEPTE4NDg4NScsJ2NvbnRlbnQnLCdtZWRpdW0nLCdFVlYgYW5kIER1dHkgSW5mb3JtYXRpb24nLCc0MDBweCcsdGhpcyk7HxMFATBkAgcPZBYCAgEPDxYCHwhnFgQfCwVuIHJldHVybiBWaWV3V2luT3Blbkhpc3RvcnkoJzQwMzlCQTcyLTM4OTAtNDRDQy1BQzkwLTc1ODI3ODRFMjhFMCcsJy9ISEFIaXN0b3J5LycsJ0hpc0lzQ2FsbFR5cGUnLCcyNjAyMTI0OTInKTsfDAWBAWlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIFZpZXdXaW5PcGVuSGlzdG9yeSgnNDAzOUJBNzItMzg5MC00NENDLUFDOTAtNzU4Mjc4NEUyOEUwJywnL0hIQUhpc3RvcnkvJywnSGlzSXNDYWxsVHlwZScsJzI2MDIxMjQ5MicpOxYCZg8WAh8IaGQCCQ9kFgICAQ8PFgIfCGcWBB8UBQdIaXN0b3J5HxUFBGxpbmsWAmYPFgIfCGhkAgoPZBYCAgIPFQEWZGl2Q2FsbGVySW5mbzI2MDIxMjQ5MmQCCw9kFhACAQ8WAh8IaGQCAw8WAh8IaGQCBA8VAmZUaGUgQ2FyZWdpdmVyIGlzIGNhbGxpbmcgZnJvbSBhIHBob25lIG51bWJlciBub3QgcmVjb2duaXplZCBhcyBiZWxvbmdpbmcgdG8gYW55IFBhdGllbnQgaW4gdGhlIHN5c3RlbS4WUGhvbmUgTnVtYmVyIE5vdCBGb3VuZGQCBQ8PFgIfBAUWUGhvbmUgTnVtYmVyIE5vdCBGb3VuZGRkAgYPFQFmVGhlIENhcmVnaXZlciBpcyBjYWxsaW5nIGZyb20gYSBwaG9uZSBudW1iZXIgbm90IHJlY29nbml6ZWQgYXMgYmVsb25naW5nIHRvIGFueSBQYXRpZW50IGluIHRoZSBzeXN0ZW0uZAIHDxYEHwRlHwhoZAIJDxYEHwQFCTI2MDIxMjQ5Mh8IaGQCCw8PFgIfCGhkZAIMD2QWAgIBDw9kFgIfCwVGamF2YXNjcmlwdDogY2FsbEhIQUNHU2VydmljZSA9IDA7cmV0dXJuIFJlamVjdENhbGwoJzI2MDIxMjQ5MicsIHRoaXMpO2QCCg8PFgIfCGhkZAI6D2QWAgIBDxAPFgIfDWdkEBUBFUFsd2F5cyBIb21lIENhcmUgSW5jLhUBAzQ2ORQrAwFnZGQCPA8PFgIfBGVkZAI9DxYCHwhnFgICAQ8WAh8IaGQCPw8WAh4QT25Qcm9wZXJ0eUNoYW5nZQU5X19kb1Bvc3RCYWNrKCdjdGwwMCRDb250ZW50UGxhY2VIb2xkZXIxJHV4QnRuUmVmcmVzaCcsJycpZAJBDxYCHghJbnRlcnZhbAKAjI2eAmQCYA8WAh8FBWc0NzI2OTMwLDQwNTM3NTYsMzYzNzQwOSw0NjIxNjExLDM5OTk0MjUsNDI2MTczOCwxMjE1NDM5LDQzODQwODQsMjQ2Mzc4NCwzNDU3NDY0LDQwMzcxMjQsMTU4NDg3OCwxNzkyNzUzZAIHDw8WAh8EBRNFbnRlcnByaXNlIDI1LjA3LjAxZGQCCA8PFgIfBAURQVdTUFJPRFdFQjYgOiA0NDNkZAIKDw8WAh8EBRQwOS8xMC8yNSAyOjA0IEFNIEVTVGRkGAIFHl9fQ29udHJvbHNSZXF1aXJlUG9zdEJhY2tLZXlfXxYDBRhjdGwwMCRMb2dpblN0YXR1czEkY3RsMDEFGGN0bDAwJExvZ2luU3RhdHVzMSRjdGwwMwUPY3RsMDAkaW1nYnRuVVJMBSRjdGwwMCRDb250ZW50UGxhY2VIb2xkZXIxJHV4R3ZTZWFyY2gPPCsADAICAgEIAgJk15TMfkuLKjcRsINtjIjpSocVgOo%3D&__VIEWSTATEGENERATOR=C2AFDDB1&ctl00%24hidUserMessageID=&ctl00%24ucMenu%24hidAgenciesUsingNewPendingPlacementVendor=true&ctl00%24ucMenu%24hidMenuUserId=184885&ctl00%24ucMenu%24hidMenuVendorId=469&ctl00%24hdnShowCmpArtMenu=0&ctl00%24hdnSessionID=4039BA72-3890-44CC-AC90-7582784E28E0&ctl00%24hdnAppVersion=ENT&ctl00%24hdnVersion=25.07&ctl00%24hdnMinorVersion=1.0&ctl00%24hdnMobileChatAppVersionID=34&ctl00%24hdnChatAccess=False&ctl00%24hdnProviderAppVersionID=101&ctl00%24hdnIsOldHistoryEnabled=0&ctl00%24hdnIsNewHistoryEnabled=1&ctl00%24hdnHistoryViewerUrl=https%3A%2F%2Fapp.hhaexchange.com%2Fhistory%2F&ctl00%24hdnWebcomponentsLibraryUrl=https%3A%2F%2Funpkg.com%2Ffoundation-web-components%2Fumd%2Fwebcomponents.js&ctl00%24hdnFileSizeText=20&ctl00%24hdnFileSizeLimit=20971520&selectAll=on&selectItem=469&selectItem=5137&selectItem=5139&selectItem=6475&selectItem=14849&ctl00%24ContentPlaceHolder1%24divOffice%24hdnuserid=184885&ctl00%24ContentPlaceHolder1%24divOffice%24hdnappVersion=ENT&ctl00%24ContentPlaceHolder1%24divOffice%24hdnversion=25.07&ctl00%24ContentPlaceHolder1%24divOffice%24hdnminorVersion=1.0&ctl00%24ContentPlaceHolder1%24divOffice%24hdnWebURL=%2FHHAWSENT2507010000%2FOffice.asmx&ctl00%24ContentPlaceHolder1%24divOffice%24hdnAppName=ENT&ctl00%24ContentPlaceHolder1%24divOffice%24hdnAppSecret=79BB4FCD-9884-4652-B77F-6077F363193D&ctl00%24ContentPlaceHolder1%24divOffice%24hdnIpAddress=142.255.97.104&ctl00%24ContentPlaceHolder1%24divOffice%24hdnOffices=469%2C5137%2C5139%2C6475%2C14849&ctl00%24ContentPlaceHolder1%24divOffice%24hdnCallbackFunction=UpdateOfficeData%28%29%3B&ctl00%24ContentPlaceHolder1%24divOffice%24hdnSingleSelect=false&ctl00%24ContentPlaceHolder1%24divOffice%24hdnIsDisable=false&ctl00%24ContentPlaceHolder1%24divOffice%24hdnWidth=178&ctl00%24ContentPlaceHolder1%24divOffice%24hdnAutoPostback=False&ctl00%24ContentPlaceHolder1%24divOffice%24hdnDefaultText=Select+one+or+more...&ctl00%24ContentPlaceHolder1%24divOffice%24hdnOnClientSideLoad=bindedOn%28%29%3B&ctl00%24ContentPlaceHolder1%24divOffice%24hdnPermissionName=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnSelectionType=Filter&ctl00%24ContentPlaceHolder1%24divOffice%24hdnRevokeMethod=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnSelectAllRevokeMethod=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnOnOpenFunction=OnOpen%28%29%3B&ctl00%24ContentPlaceHolder1%24divOffice%24hdnOnCloseNoChangeFunction=OnClientClose%28%29%3B&ctl00%24ContentPlaceHolder1%24divOffice%24hdnGetDependentControls=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnOnSingleSelect=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnEmptyDisable=false&ctl00%24ContentPlaceHolder1%24divOffice%24hdnNoOffice=false&ctl00%24ContentPlaceHolder1%24divOffice%24hdnShowUnassignedOfficeForReferrals=false&ctl00%24ContentPlaceHolder1%24divOffice%24hdnSetOfficeSelectionValue=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnPayrollSetupID=-1&ctl00%24ContentPlaceHolder1%24divOffice%24hdnCaregiverID=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnCustomeMethod=&ctl00%24ContentPlaceHolder1%24divOffice%24hdnOfficeNames=Always+Home+Care%2CAHC+%E2%80%93+New+York%2CAHC+--+Richmond%2CPrivate+Duty+Expert%2CAlways+NHTD%2FTBI&ctl00%24ContentPlaceHolder1%24divOffice%24hdnAllOffices=469%2C5137%2C5139%2C6475%2C14849&ctl00%24ContentPlaceHolder1%24hdnSelectedOffices=469%2C5137%2C5139%2C6475%2C14849&ctl00%24ContentPlaceHolder1%24uxDdlCoordinator=74093&ctl00%24ContentPlaceHolder1%24hdnSelectedCoordinator=74093&ctl00%24ContentPlaceHolder1%24uxDtFromDate=2025-08-04&ctl00%24ContentPlaceHolder1%24uxtxtFromTime=&ctl00%24ContentPlaceHolder1%24uxDtToDate=2025-09-10&ctl00%24ContentPlaceHolder1%24uxtxtToTime=&ctl00%24ContentPlaceHolder1%24uxTxtAideFirstName=&ctl00%24ContentPlaceHolder1%24uxTxtAideLastName=&ctl00%24ContentPlaceHolder1%24txtCaregiverCode=&ctl00%24ContentPlaceHolder1%24uxDdlTeam=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedCaregiverTeam=&ctl00%24ContentPlaceHolder1%24uxDdlCaregiverLocation=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedCaregiverLocation=&ctl00%24ContentPlaceHolder1%24uxDdlCaregiverBranch=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedCaregiverBranch=&ctl00%24ContentPlaceHolder1%24uxTxtAssignmentID=&ctl00%24ContentPlaceHolder1%24uxTxtAdmissionID=&ctl00%24ContentPlaceHolder1%24uxDdlContract=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedContract=&selectItem=9&selectItem=15&selectItem=19&selectItem=24&selectItem=11&selectItem=10&selectItem=14&selectItem=16&selectItem=12&selectItem=22&selectItem=23&selectItem=18&selectItem=20&selectItem=21&selectItem=13&selectItem=8&selectItem=43&selectItem=25&selectItem=26&selectItem=27&selectItem=36&selectItem=33&selectItem=34&selectItem=29&selectItem=32&ctl00%24ContentPlaceHolder1%24hdnUserID=184885&ctl00%24ContentPlaceHolder1%24hdnAppVersion=ENT&ctl00%24ContentPlaceHolder1%24hdnVersion=25.07&ctl00%24ContentPlaceHolder1%24hdnMinorVersion=1.0&ctl00%24ContentPlaceHolder1%24hdnCallerInfo=&ctl00%24ContentPlaceHolder1%24hdnServicePath=%2FHHAWSENT2507010000%2F&ctl00%24ContentPlaceHolder1%24hdnAppName=ENT&ctl00%24ContentPlaceHolder1%24hdnAppSecret=79BB4FCD-9884-4652-B77F-6077F363193D&ctl00%24ContentPlaceHolder1%24hdnWSURL=%2FHHAWSENT2507010000%2F&ctl00%24ContentPlaceHolder1%24hdnBroadcastReceivedPageSize=25&ctl00%24ContentPlaceHolder1%24hdnAltCaregiverValue=Caregiver&ctl00%24ContentPlaceHolder1%24hdnAltPatientValue=Patient&ctl00%24ContentPlaceHolder1%24hdnAltFOBValue=FOB&ctl00%24ContentPlaceHolder1%24hdnIsBeaconDeviceEnable=691%2C651%2C262%2C339%2C959%2C338%2C370%2C155%2C180%2C243%2C848%2C216%2C241%2C194%2C939%2C543%2C709%2C1730%2C377%2C674%2C733%2C801%2C744&ctl00%24ContentPlaceHolder1%24hdnddlMaintenanceStatus=9%2C15%2C19%2C24%2C11%2C10%2C14%2C16%2C12%2C22%2C23%2C18%2C20%2C21%2C13%2C8%2C43%2C25%2C26%2C27%2C36%2C33%2C34%2C29%2C32&ctl00%24ContentPlaceHolder1%24uxTxtPatientFirstName=&ctl00%24ContentPlaceHolder1%24uxTxtPatientLastName=&ctl00%24ContentPlaceHolder1%24uxDdlPatientTeam=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedPatientTeam=&ctl00%24ContentPlaceHolder1%24uxDdlPatientLocation=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedPatientLocation=&ctl00%24ContentPlaceHolder1%24uxDdlPatientBranch=-1&ctl00%24ContentPlaceHolder1%24hdnSelectedPatientBranch=&ctl00%24ContentPlaceHolder1%24hdnCallReprocessLimit=1000&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl02%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl03%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl04%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl05%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl06%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl07%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl08%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl09%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxGvSearch%24ctl10%24hdnNotesRequired=&ctl00%24ContentPlaceHolder1%24uxDdlVendor=469&ctl00%24ContentPlaceHolder1%24uxHidRefresh=&ctl00%24ContentPlaceHolder1%24uxHidValidateScheduleOvertime=True&ctl00%24ContentPlaceHolder1%24uxHidScheduleOvertimePwd=&ctl00%24ContentPlaceHolder1%24uxHidAideID=&ctl00%24ContentPlaceHolder1%24uxHidAideCode=&ctl00%24ContentPlaceHolder1%24uxHidFromCallDashBoard=1&ctl00%24ContentPlaceHolder1%24hdnFromTime=&ctl00%24ContentPlaceHolder1%24hdnToTime=&ctl00%24ContentPlaceHolder1%24hidProviderURL=https%3A%2F%2Fapp.hhaexchange.com%2FPROVIDER2507010000%2Fcaregiver-availability&ctl00%24ContentPlaceHolder1%24hdnEditSkilledSchedule=True&ctl00%24ContentPlaceHolder1%24hdnEditNonSkillSchedule=True&ctl00%24ContentPlaceHolder1%24hdnEditPayrollInfoAfterPayroll=False&ctl00%24ContentPlaceHolder1%24hdnEditPayrollInfoAfterBilling=False&ctl00%24ContentPlaceHolder1%24hdnInternalEditScheduleTime=True&ctl00%24ContentPlaceHolder1%24hdnLinkCall=True&ctl00%24ContentPlaceHolder1%24hdnAllowLinkingUnrecognizedNumber=True&ctl00%24ContentPlaceHolder1%24hdnEditPatientProfile=False&ctl00%24ContentPlaceHolder1%24hdnReportPagePath=https%3A%2F%2Freports.hhaexchange.com%2FHHAReportsML%2FReports%2F&ctl00%24ContentPlaceHolder1%24hdnReportServicepath=http%3A%2F%2FAWSProdWebRP2%2FHHAReportsWS%2FReportWebService.asmx&ctl00%24ContentPlaceHolder1%24hdnSessionId=4039BA72-3890-44CC-AC90-7582784E28E0&ctl00%24ContentPlaceHolder1%24hdnControlID=&ctl00%24ContentPlaceHolder1%24hdnCallDashboardCorrections=&ctl00%24ContentPlaceHolder1%24hdnVendorID=469&ctl00%24ContentPlaceHolder1%24hdnHistoryData=&ctl00%24ContentPlaceHolder1%24hdnIspopupOpen=&ctl00%24ContentPlaceHolder1%24hdnKafkaWebAPIPath=%2FHHAXKafkaAPI20070100%2Fapi%2F&ctl00%24ContentPlaceHolder1%24hdnHistoryURL=%2FHHAHistory%2F&ctl00%24ContentPlaceHolder1%24hdnMessageType=2&ctl00%24ContentPlaceHolder1%24hdnMessageSource=3&ctl00%24ContentPlaceHolder1%24hdnAllowLinkingUnrecognizedFOB=True&ctl00%24ContentPlaceHolder1%24hdnAllowLinkingUnrecognizedGPS=True";
  
      try {
        console.log(`Sending POST request to: ${fullUrl}`);
  
        // 4. 发送 GM_fetch 请求
        const response = await GM_fetch(fullUrl, {
          method: 'POST',
          headers: {
            // 这个 Content-Type 告诉服务器我们发送的是URL编码的表单数据
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            // 根据我们之前的分析，Referer头是必需的
            'Referer': fullUrl
          },
          // 直接将完整的载荷字符串作为 body
          body: fullPayload
        });
  
        // 5. 处理响应
        if (response.ok) {
          console.log("Request successful! Status:", response.status);
          // 获取响应的HTML内容
          const responseHtml = await (response as any).rawBody.text();
          console.log("Response HTML (first 500 chars):", responseHtml);
          // 在这里，您可以添加解析 responseHtml 的代码
          // 例如： const data = parseAnomalyReport(responseHtml);
  
          // 返回HTML以便后续处理
          return responseHtml;
        } else {
          console.error(`Request failed! Status: ${response.status} ${response.statusText}`);
          // 返回错误信息
          return `Error: ${response.status} ${response.statusText}`;
        }
  
      } catch (error) {
        console.error("An error occurred during the fetch operation:", error);
        return `Error: ${error}`;
      }
    }
  
    sendStaticPostRequest2().then(result => {
      console.log("Request2 finished.");
    });
  
    sendStaticPostRequest1().then(result => {
      console.log("Request1 finished.");
    }); */
}
src_main().catch((e) => {
    console.log(e);
});

/******/ })()
;