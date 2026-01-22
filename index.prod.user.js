// ==UserScript==
// @name                HHAExchange Smart Assistant
// @namespace           https://kurosakirei.dev/
// @version             3.9.5
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
// @match               *://outlook.office.com/*
// @match               *://outlook.office.com/mail/*
// @match               https://outlook.office.com/mail/*
// @match               *://*.office.com/*
// @require             https://cdn.jsdelivr.net/npm/jquery@3.6.3/dist/jquery.min.js
// @grant               GM.xmlHttpRequest
// @grant               GM_openInTab
// @grant               GM_addStyle
// @grant               GM_setValue
// @grant               GM_getValue
// @grant               GM.addElement
// @connect             app.hhaexchange.com
// @connect             reports.hhaexchange.com
// @connect             outlook.office.com
// @connect             unpkg.com
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
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 12 12\"%3E%3Cpath fill=\"%23666\" d=\"M6 9L1 4h10z\"/%3E%3C/svg%3E"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/**\n * Main Stylesheet Entry Point\n * \n * This file imports all component stylesheets.\n * Visit Monitor (Coordinator Tracker) styles are in coordinator-tracker.less\n */\n.hha-smart-panel {\n  position: absolute;\n  top: 0;\n  width: 680px;\n  height: 460px;\n  max-height: 80vh;\n  background: #ffffff;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n  font-size: 14px;\n  color: #333333;\n}\n.hha-smart-panel-header {\n  height: 40px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0 16px;\n  border-bottom: none;\n  cursor: move;\n  user-select: none;\n}\n.hha-smart-panel-title {\n  font-size: 14px;\n  font-weight: 600;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.hha-smart-panel-controls {\n  display: flex;\n  gap: 8px;\n  position: relative;\n  z-index: 100000;\n}\n.hha-smart-panel-btn {\n  width: 24px;\n  height: 24px;\n  border-radius: 2px;\n  background: rgba(255, 255, 255, 0.2);\n  border: none;\n  color: white;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: background 0.15s ease;\n  font-size: 14px;\n  padding: 0;\n  position: relative;\n  z-index: 100001;\n}\n.hha-smart-panel-btn:hover {\n  background: rgba(255, 255, 255, 0.3);\n}\n.hha-smart-panel-btn:active {\n  background: rgba(255, 255, 255, 0.4);\n}\n.hha-smart-panel-body {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  position: relative;\n  z-index: 1;\n}\n.hha-smart-content-wrapper {\n  flex: 1;\n  display: flex;\n  overflow: hidden;\n  min-height: 0;\n  position: relative;\n  isolation: isolate;\n}\n.hha-smart-tab-bar {\n  width: 100px;\n  min-width: 40px;\n  background: #f7f8fa;\n  border-right: 1px solid #e0e0e0;\n  transition: width 0.2s ease;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  flex-shrink: 0;\n  position: relative;\n  z-index: 2;\n}\n.hha-smart-tab-bar.collapsed {\n  width: 40px;\n}\n.hha-smart-tab-list {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n}\n.hha-smart-tab-list::-webkit-scrollbar {\n  width: 4px;\n}\n.hha-smart-tab-list::-webkit-scrollbar-thumb {\n  background: #e0e0e0;\n  border-radius: 2px;\n}\n.hha-smart-tab-item {\n  position: relative;\n  padding: 12px 8px;\n  cursor: pointer;\n  transition: background 0.15s ease;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  white-space: nowrap;\n  border-bottom: 1px solid #f0f0f0;\n}\n.hha-smart-tab-item:hover {\n  background: #f0f2f5;\n}\n.hha-smart-tab-item.active {\n  background: #f0efff;\n  color: #667eea;\n  font-weight: 500;\n}\n.hha-smart-tab-icon {\n  flex-shrink: 0;\n  font-size: 18px;\n  line-height: 1;\n  width: 20px;\n  text-align: center;\n}\n.hha-smart-tab-text {\n  opacity: 1;\n  transition: opacity 0.2s ease;\n  font-size: 13px;\n  overflow-x: auto;\n  overflow-y: hidden;\n  white-space: nowrap;\n  flex: 1;\n  scroll-behavior: smooth;\n}\n.hha-smart-tab-text::-webkit-scrollbar {\n  height: 0;\n  display: none;\n}\n.hha-smart-tab-bar.collapsed .hha-smart-tab-text {\n  opacity: 0;\n  width: 0;\n  overflow: hidden;\n  pointer-events: none;\n}\n.hha-smart-tab-indicator {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 4px;\n  height: 100%;\n  background: #667eea;\n  opacity: 0;\n  transition: opacity 0.2s ease;\n  z-index: 1;\n}\n.hha-smart-tab-item.active .hha-smart-tab-indicator {\n  opacity: 1;\n}\n.hha-smart-tab-collapse-btn {\n  padding: 8px;\n  text-align: center;\n  cursor: pointer;\n  border-top: 1px solid #e0e0e0;\n  transition: background 0.15s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 36px;\n  position: relative;\n  z-index: 10;\n}\n.hha-smart-tab-collapse-btn:hover {\n  background: #f0f2f5;\n}\n.hha-smart-collapse-icon {\n  display: inline-block;\n  transition: transform 0.2s ease;\n  font-size: 14px;\n  color: #666666;\n}\n.hha-smart-tab-bar.collapsed .hha-smart-collapse-icon {\n  transform: rotate(180deg);\n}\n.hha-smart-content-area {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  background: #ffffff;\n  min-height: 0;\n  position: relative;\n  z-index: 1;\n}\n.hha-smart-panel-footer {\n  height: 28px;\n  background: #f7f8fa;\n  border-top: 1px solid #e0e0e0;\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  padding: 0 16px;\n  font-size: 12px;\n  color: #666666;\n  flex-shrink: 0;\n}\n.footer-branding {\n  font-style: italic;\n  opacity: 0.6;\n  user-select: none;\n}\n.hha-smart-tab-content {\n  display: none !important;\n  padding: 0;\n  animation: fadeIn 0.2s ease;\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  box-sizing: border-box;\n  min-height: 0;\n  position: relative;\n  z-index: 0;\n}\n.hha-smart-tab-content.active {\n  display: flex !important;\n  flex-direction: column;\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.hha-smart-config-card {\n  background: #ffffff;\n  border-radius: 4px;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n  padding: 16px;\n  margin-bottom: 16px;\n  transition: box-shadow 0.2s ease;\n}\n.hha-smart-config-card:hover {\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n}\n.hha-smart-config-card-title {\n  font-size: 14px;\n  font-weight: 600;\n  color: #333333;\n  margin-bottom: 12px;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.hha-smart-config-card-body {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.hha-smart-btn {\n  border: none;\n  border-radius: 4px;\n  padding: 8px 16px;\n  font-size: 13px;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  font-weight: 500;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n}\n.hha-smart-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.hha-smart-btn-primary {\n  border: none;\n  border-radius: 4px;\n  padding: 8px 16px;\n  font-size: 13px;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  font-weight: 500;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  background: #667eea;\n  color: white;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.hha-smart-btn-primary:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.hha-smart-btn-primary:hover:not(:disabled) {\n  background: #5a6fd6;\n}\n.hha-smart-btn-primary:active:not(:disabled) {\n  background: #4c5ec2;\n}\n.hha-smart-btn-secondary {\n  border: none;\n  border-radius: 4px;\n  padding: 8px 16px;\n  font-size: 13px;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  font-weight: 500;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  background: #f7f8fa;\n  color: #333333;\n  border: 1px solid #e0e0e0;\n}\n.hha-smart-btn-secondary:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.hha-smart-btn-secondary:hover:not(:disabled) {\n  background: #f0f2f5;\n  border-color: #a29bfe;\n}\n.hha-smart-placeholder {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 32px;\n  text-align: center;\n  color: #666666;\n  min-height: 300px;\n}\n.hha-smart-placeholder-icon {\n  font-size: 48px;\n  margin-bottom: 16px;\n  opacity: 0.5;\n}\n.hha-smart-placeholder-title {\n  font-size: 16px;\n  font-weight: 600;\n  color: #333333;\n  margin-bottom: 8px;\n}\n.hha-smart-placeholder-text {\n  font-size: 14px;\n  color: #666666;\n}\n#highlight-caller-popup {\n  position: fixed;\n  z-index: 999999;\n  background-color: #ffffff;\n  border: 1px solid #dcdcdc;\n  border-radius: 8px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n  font-size: 14px;\n  color: #333;\n  padding: 12px;\n  min-width: 200px;\n}\n#highlight-caller-popup .hcp-title {\n  font-weight: 600;\n  font-size: 16px;\n  margin-bottom: 8px;\n}\n#highlight-caller-popup .hcp-number {\n  background-color: #f0f0f0;\n  padding: 4px 8px;\n  border-radius: 4px;\n  margin-bottom: 12px;\n  text-align: center;\n  font-weight: 500;\n}\n#highlight-caller-popup .hcp-actions {\n  display: flex;\n  justify-content: space-around;\n  gap: 10px;\n}\n#highlight-caller-popup .hcp-button {\n  display: inline-block;\n  text-decoration: none;\n  color: #fff;\n  background-color: #007bff;\n  padding: 8px 12px;\n  border-radius: 5px;\n  transition: background-color 0.2s;\n  flex-grow: 1;\n  text-align: center;\n}\n#highlight-caller-popup .hcp-button:hover {\n  background-color: #0056b3;\n}\n#highlight-caller-popup .hcp-close-btn {\n  position: absolute;\n  top: 5px;\n  right: 8px;\n  font-size: 20px;\n  color: #aaa;\n  cursor: pointer;\n  font-weight: bold;\n}\n#highlight-caller-popup .hcp-close-btn:hover {\n  color: #333;\n}\n#highlight-caller-popup .hcp-actions-full {\n  margin-top: 10px;\n}\n#highlight-caller-popup .hcp-search-hha {\n  width: 100%;\n  background-color: #28a745;\n  border: none;\n  cursor: pointer;\n  font-size: 14px;\n}\n#highlight-caller-popup .hcp-search-hha:hover {\n  background-color: #218838;\n}\n.manual-search-btn-hha {\n  background-color: #28a745;\n  color: white;\n  padding: 10px 15px;\n  margin: 10px 15px;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 16px;\n  font-weight: bold;\n  display: block;\n  text-align: center;\n}\n.manual-search-btn-hha:hover {\n  background-color: #218838;\n}\n#prebilling-selector-wrapper {\n  position: relative;\n  display: inline-block;\n}\n#prebilling-config-card {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  margin-top: 8px;\n  width: 380px;\n  max-height: 520px;\n  background: white;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);\n  z-index: 10000;\n  display: none;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  overflow: hidden;\n}\n#prebilling-config-card.show {\n  display: block;\n  animation: slideDown 0.2s ease-out;\n}\n@keyframes slideDown {\n  from {\n    opacity: 0;\n    transform: translateY(-10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n#prebilling-config-card .config-card-header {\n  padding: 12px 16px;\n  border-bottom: 1px solid #eee;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  border-radius: 8px 8px 0 0;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n#prebilling-config-card .config-card-header h3 {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: white;\n}\n#prebilling-config-card .config-card-header .config-close-btn {\n  background: transparent;\n  border: none;\n  color: white;\n  font-size: 20px;\n  cursor: pointer;\n  padding: 0 4px;\n  line-height: 1;\n  opacity: 0.8;\n  transition: opacity 0.2s;\n}\n#prebilling-config-card .config-card-header .config-close-btn:hover {\n  opacity: 1;\n}\n#prebilling-config-card .config-card-body {\n  padding: 16px;\n}\n#prebilling-config-card .config-card-body > label {\n  display: block;\n  margin-bottom: 8px;\n  font-weight: 600;\n  font-size: 13px;\n  color: #333;\n}\n#prebilling-config-card .config-card-body .config-search-input {\n  width: 100%;\n  padding: 10px 12px;\n  border: 1px solid #ddd;\n  border-radius: 6px;\n  margin-bottom: 12px;\n  font-size: 13px;\n  box-sizing: border-box;\n  transition: border-color 0.2s, box-shadow 0.2s;\n}\n#prebilling-config-card .config-card-body .config-search-input:focus {\n  outline: none;\n  border-color: #667eea;\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);\n}\n#prebilling-config-card .config-card-body .config-search-input::placeholder {\n  color: #999;\n}\n#prebilling-config-card .config-card-body .coordinator-list {\n  max-height: 280px;\n  overflow-y: auto;\n  border: 1px solid #eee;\n  border-radius: 6px;\n  padding: 8px;\n  background: #fafafa;\n}\n#prebilling-config-card .config-card-body .coordinator-list::-webkit-scrollbar {\n  width: 6px;\n}\n#prebilling-config-card .config-card-body .coordinator-list::-webkit-scrollbar-track {\n  background: #f1f1f1;\n  border-radius: 3px;\n}\n#prebilling-config-card .config-card-body .coordinator-list::-webkit-scrollbar-thumb {\n  background: #c1c1c1;\n  border-radius: 3px;\n}\n#prebilling-config-card .config-card-body .coordinator-list::-webkit-scrollbar-thumb:hover {\n  background: #999;\n}\n#prebilling-config-card .config-card-body .coordinator-list .coordinator-option {\n  padding: 8px 10px;\n  cursor: pointer;\n  border-radius: 4px;\n  margin-bottom: 2px;\n  display: flex;\n  align-items: center;\n  transition: background 0.15s;\n}\n#prebilling-config-card .config-card-body .coordinator-list .coordinator-option:hover {\n  background: #e8f0fe;\n}\n#prebilling-config-card .config-card-body .coordinator-list .coordinator-option:last-child {\n  margin-bottom: 0;\n}\n#prebilling-config-card .config-card-body .coordinator-list .coordinator-option input[type=\"checkbox\"] {\n  margin-right: 10px;\n  width: 16px;\n  height: 16px;\n  cursor: pointer;\n  accent-color: #667eea;\n}\n#prebilling-config-card .config-card-body .coordinator-list .coordinator-option label {\n  cursor: pointer;\n  font-size: 12px;\n  color: #333;\n  margin: 0;\n  flex: 1;\n  line-height: 1.4;\n  word-break: break-word;\n}\n#prebilling-config-card .config-card-body .config-summary {\n  margin-top: 12px;\n  font-size: 12px;\n  color: #666;\n  text-align: right;\n}\n#prebilling-config-card .config-card-body .config-summary span {\n  font-weight: 700;\n  color: #667eea;\n  font-size: 14px;\n}\n#prebilling-config-card .config-card-footer {\n  padding: 12px 16px;\n  border-top: 1px solid #eee;\n  display: flex;\n  gap: 10px;\n  background: #f8f9fa;\n}\n#prebilling-config-card .config-card-footer button {\n  flex: 1;\n  padding: 10px 16px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 13px;\n  font-weight: 500;\n  transition: all 0.2s;\n}\n#prebilling-config-card .config-card-footer button.btn-primary {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n}\n#prebilling-config-card .config-card-footer button.btn-primary:hover {\n  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);\n  transform: translateY(-1px);\n}\n#prebilling-config-card .config-card-footer button.btn-primary:active {\n  transform: translateY(0);\n}\n#prebilling-config-card .config-card-footer button.btn-secondary {\n  background: #e9ecef;\n  color: #495057;\n}\n#prebilling-config-card .config-card-footer button.btn-secondary:hover {\n  background: #dee2e6;\n}\n.prebilling-selector-btn {\n  transition: all 0.2s !important;\n}\n.prebilling-selector-btn:hover {\n  background: #f0f8ff !important;\n  border-color: #667eea !important;\n}\n#homepage-config-card {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  margin-top: 8px;\n  width: 380px;\n  max-height: 520px;\n  background: white;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);\n  z-index: 10000;\n  display: none;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  overflow: hidden;\n}\n#homepage-config-card.show {\n  display: block;\n  animation: slideDown 0.2s ease-out;\n}\n@keyframes slideDown {\n  from {\n    opacity: 0;\n    transform: translateY(-10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n#homepage-config-card .config-card-header {\n  padding: 12px 16px;\n  border-bottom: 1px solid #eee;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  border-radius: 8px 8px 0 0;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n#homepage-config-card .config-card-header h3 {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: white;\n}\n#homepage-config-card .config-card-header .config-close-btn {\n  background: transparent;\n  border: none;\n  color: white;\n  font-size: 20px;\n  cursor: pointer;\n  padding: 0 4px;\n  line-height: 1;\n  opacity: 0.8;\n  transition: opacity 0.2s;\n}\n#homepage-config-card .config-card-header .config-close-btn:hover {\n  opacity: 1;\n}\n#homepage-config-card .config-card-body {\n  padding: 16px;\n}\n#homepage-config-card .config-card-body > label {\n  display: block;\n  margin-bottom: 8px;\n  font-weight: 600;\n  font-size: 13px;\n  color: #333;\n}\n#homepage-config-card .config-card-body .config-search-input {\n  width: 100%;\n  padding: 10px 12px;\n  border: 1px solid #ddd;\n  border-radius: 6px;\n  margin-bottom: 12px;\n  font-size: 13px;\n  box-sizing: border-box;\n  transition: border-color 0.2s, box-shadow 0.2s;\n}\n#homepage-config-card .config-card-body .config-search-input:focus {\n  outline: none;\n  border-color: #667eea;\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);\n}\n#homepage-config-card .config-card-body .config-search-input::placeholder {\n  color: #999;\n}\n#homepage-config-card .config-card-body .coordinator-list {\n  max-height: 280px;\n  overflow-y: auto;\n  border: 1px solid #eee;\n  border-radius: 6px;\n  padding: 8px;\n  background: #fafafa;\n}\n#homepage-config-card .config-card-body .coordinator-list::-webkit-scrollbar {\n  width: 6px;\n}\n#homepage-config-card .config-card-body .coordinator-list::-webkit-scrollbar-track {\n  background: #f1f1f1;\n  border-radius: 3px;\n}\n#homepage-config-card .config-card-body .coordinator-list::-webkit-scrollbar-thumb {\n  background: #c1c1c1;\n  border-radius: 3px;\n}\n#homepage-config-card .config-card-body .coordinator-list::-webkit-scrollbar-thumb:hover {\n  background: #999;\n}\n#homepage-config-card .config-card-body .coordinator-list .coordinator-option {\n  padding: 8px 10px;\n  cursor: pointer;\n  border-radius: 4px;\n  margin-bottom: 2px;\n  display: flex;\n  align-items: center;\n  transition: background 0.15s;\n}\n#homepage-config-card .config-card-body .coordinator-list .coordinator-option:hover {\n  background: #e8f0fe;\n}\n#homepage-config-card .config-card-body .coordinator-list .coordinator-option:last-child {\n  margin-bottom: 0;\n}\n#homepage-config-card .config-card-body .coordinator-list .coordinator-option.hidden {\n  display: none;\n}\n#homepage-config-card .config-card-body .coordinator-list .coordinator-option input[type=\"radio\"] {\n  margin-right: 10px;\n  width: 16px;\n  height: 16px;\n  cursor: pointer;\n  accent-color: #667eea;\n}\n#homepage-config-card .config-card-body .coordinator-list .coordinator-option .coordinator-label {\n  cursor: pointer;\n  font-size: 12px;\n  color: #333;\n  margin: 0;\n  flex: 1;\n  line-height: 1.4;\n  word-break: break-word;\n}\n#homepage-config-card .config-card-body .coordinator-list .no-results {\n  text-align: center;\n  padding: 20px;\n  color: #999;\n  font-size: 13px;\n}\n#homepage-config-card .config-card-body .config-summary {\n  margin-top: 12px;\n  font-size: 12px;\n  color: #666;\n  text-align: right;\n}\n#homepage-config-card .config-card-body .config-summary span {\n  font-weight: 700;\n  color: #667eea;\n  font-size: 14px;\n}\n#homepage-config-card .config-card-footer {\n  padding: 12px 16px;\n  border-top: 1px solid #eee;\n  display: flex;\n  gap: 10px;\n  background: #f8f9fa;\n}\n#homepage-config-card .config-card-footer button {\n  flex: 1;\n  padding: 10px 16px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 13px;\n  font-weight: 500;\n  transition: all 0.2s;\n}\n#homepage-config-card .config-card-footer button.btn-primary {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n}\n#homepage-config-card .config-card-footer button.btn-primary:hover {\n  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);\n  transform: translateY(-1px);\n}\n#homepage-config-card .config-card-footer button.btn-primary:active {\n  transform: translateY(0);\n}\n#homepage-config-card .config-card-footer button.btn-secondary {\n  background: #e9ecef;\n  color: #495057;\n}\n#homepage-config-card .config-card-footer button.btn-secondary:hover {\n  background: #dee2e6;\n}\n.homepage-selector-btn {\n  transition: all 0.2s !important;\n}\n.homepage-selector-btn:hover {\n  background: #f0f8ff !important;\n  border-color: #667eea !important;\n}\n/**\n * QA Report Tab Styles\n * Epic 8: QA 报告功能\n *\n * 依赖: variables.less, multi-tab-panel.less\n * @author HHA Smart Assistant\n * @date 2026-01-08\n */\n.qa-report-tab {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow: hidden;\n}\n.qa-report-wrapper {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  gap: 0;\n}\n.qa-report-header {\n  display: none;\n}\n.qa-report-title {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: #333333;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.qa-report-toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 4px 16px;\n  background: #ffffff;\n  border-bottom: 1px solid #e0e0e0;\n  flex-shrink: 0;\n  height: 44px;\n  box-sizing: border-box;\n  gap: 8px;\n}\n.qa-toolbar-left {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex: 0 0 auto;\n  height: 28px;\n}\n.qa-toolbar-left > * {\n  margin: 0;\n  vertical-align: middle;\n}\n.qa-toolbar-actions {\n  display: flex;\n  align-items: center;\n  gap: 0;\n  flex: 0 0 auto;\n  height: 28px;\n}\n.qa-toolbar-actions .qa-load-btn {\n  border-radius: 2px 0 0 2px;\n  border-right: 1px solid rgba(255, 255, 255, 0.3);\n  height: 28px !important;\n  line-height: 26px;\n  padding: 0 14px;\n}\n.qa-toolbar-actions .qa-export-btn {\n  border-radius: 0 2px 2px 0;\n  height: 28px !important;\n  line-height: 26px;\n  padding: 0 14px;\n}\n.qa-toolbar-right {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  height: 28px;\n}\n.qa-select-label {\n  font-size: 13px;\n  color: #666666;\n  font-weight: 500;\n  line-height: 28px;\n  white-space: nowrap;\n}\n.qa-coordinator-select {\n  padding: 0 28px 0 10px;\n  border: 1px solid #e0e0e0;\n  border-radius: 2px;\n  background: white;\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n  background-repeat: no-repeat;\n  background-position: right 8px center;\n  background-size: 12px 12px;\n  font-size: 13px;\n  min-width: 180px;\n  max-width: 300px;\n  height: 28px !important;\n  line-height: 26px;\n  vertical-align: middle;\n  cursor: pointer;\n  box-sizing: border-box;\n  appearance: none;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n}\n.qa-coordinator-select:focus {\n  outline: none;\n  border-color: #667eea;\n  box-shadow: 0 0 0 2px #a29bfe;\n}\n.qa-coordinator-select:disabled {\n  background: #f7f8fa;\n  cursor: not-allowed;\n}\n.qa-load-btn {\n  padding: 0 14px;\n  font-size: 13px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  height: 28px;\n}\n.qa-load-btn:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n.qa-export-btn {\n  padding: 0 12px;\n  font-size: 13px;\n  background: #f7f8fa;\n  border: 1px solid #e0e0e0;\n  border-radius: 2px;\n  color: #333333;\n  cursor: pointer;\n  transition: all 0.2s;\n  height: 28px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.qa-export-btn:hover:not(:disabled) {\n  background: #f0f2f5;\n  border-color: #667eea;\n}\n.qa-export-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.qa-status-text {\n  font-size: 12px;\n  color: #666666;\n  white-space: nowrap;\n}\n.qa-view-toggle {\n  display: flex;\n  border: 1px solid #e0e0e0;\n  border-radius: 2px;\n  overflow: hidden;\n  height: 28px;\n}\n.qa-view-btn {\n  padding: 0 10px;\n  border: none;\n  background: white;\n  cursor: pointer;\n  font-size: 14px;\n  color: #666666;\n  transition: all 0.2s;\n  height: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.qa-view-btn:first-child {\n  border-right: 1px solid #e0e0e0;\n}\n.qa-view-btn:hover {\n  background: #f0f2f5;\n  color: #667eea;\n}\n.qa-view-btn.active {\n  background: #667eea;\n  color: white;\n}\n.qa-report-content-body {\n  flex: 1;\n  overflow: auto;\n  padding: 8px;\n  background: #f7f8fa;\n}\n.qa-empty-state {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n  text-align: center;\n  color: #666666;\n}\n.qa-empty-icon {\n  font-size: 48px;\n  margin-bottom: 16px;\n  opacity: 0.5;\n}\n.qa-empty-title {\n  font-size: 16px;\n  font-weight: 600;\n  color: #333333;\n  margin-bottom: 8px;\n}\n.qa-empty-text {\n  font-size: 13px;\n}\n.qa-report-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 13px;\n  background: white;\n  border-radius: 2px;\n  overflow: hidden;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n}\n.qa-report-table thead {\n  background: #f7f8fa;\n  position: sticky;\n  top: 0;\n  z-index: 10;\n}\n.qa-report-table thead th {\n  padding: 8px 16px;\n  text-align: left;\n  font-weight: 600;\n  color: #666666;\n  border-bottom: 2px solid #e0e0e0;\n  white-space: nowrap;\n}\n.qa-report-table thead th.sortable {\n  cursor: pointer;\n  user-select: none;\n  transition: background 0.15s;\n}\n.qa-report-table thead th.sortable:hover {\n  background: #e7eaf0;\n}\n.qa-report-table thead th.sortable .sort-icon {\n  margin-left: 4px;\n  font-size: 10px;\n  opacity: 0.5;\n  display: inline-block;\n  vertical-align: middle;\n}\n.qa-report-table thead th.sortable .sort-icon.sort-asc,\n.qa-report-table thead th.sortable .sort-icon.sort-desc {\n  opacity: 1;\n  color: #667eea;\n}\n.qa-report-table tbody tr {\n  border-bottom: 1px solid #f0f0f0;\n  transition: background 0.15s;\n}\n.qa-report-table tbody tr:hover {\n  background: #f0f2f5;\n}\n.qa-report-table tbody tr:last-child {\n  border-bottom: none;\n}\n.qa-report-table tbody td {\n  padding: 8px 16px;\n  vertical-align: middle;\n  user-select: text;\n  cursor: text;\n}\n.qa-report-table tbody td.col-action {\n  user-select: none;\n  cursor: default;\n}\n.qa-report-table .col-id {\n  width: 110px;\n  font-family: \"Monaco\", \"Menlo\", \"Consolas\", monospace;\n  color: #667eea;\n  font-weight: 500;\n}\n.qa-report-table .col-name {\n  width: auto;\n  min-width: 150px;\n  font-weight: 500;\n}\n.qa-report-table .col-phone {\n  width: 140px;\n}\n.qa-report-table .phone-loading {\n  color: #666666;\n  font-style: italic;\n  font-size: 13px;\n}\n.qa-report-table .phone-error {\n  color: #dc3545;\n  font-size: 13px;\n}\n.qa-report-table .phone-single {\n  color: #333333;\n  font-family: \"Monaco\", \"Menlo\", \"Consolas\", monospace;\n  font-size: 13px;\n}\n.qa-report-table .phone-single a {\n  color: #667eea;\n  text-decoration: none;\n}\n.qa-report-table .phone-single a:hover {\n  text-decoration: underline;\n}\n.qa-report-table .phone-multiple {\n  position: relative;\n  display: inline-block;\n  cursor: pointer;\n}\n.qa-report-table .phone-multiple .phone-trigger {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 6px;\n  background: rgba(102, 126, 234, 0.1);\n  border: 1px solid #667eea;\n  border-radius: 2px;\n  color: #667eea;\n  cursor: pointer;\n  font-size: 13px;\n  transition: all 0.2s;\n}\n.qa-report-table .phone-multiple .phone-trigger:hover {\n  background: #667eea;\n  color: white;\n}\n.qa-report-table .phone-multiple .phone-trigger .phone-count {\n  font-weight: 600;\n}\n.qa-report-table .phone-dropdown {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 1000;\n  min-width: 160px;\n  padding: 4px 0;\n  background: white;\n  border: 1px solid #e0e0e0;\n  border-radius: 2px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n  margin-top: 4px;\n}\n.qa-report-table .phone-dropdown .phone-item {\n  display: block;\n  padding: 4px 8px;\n  color: #333333;\n  font-family: \"Monaco\", \"Menlo\", \"Consolas\", monospace;\n  font-size: 13px;\n  text-decoration: none;\n  transition: background 0.15s;\n}\n.qa-report-table .phone-dropdown .phone-item:hover {\n  background: #f0f2f5;\n  color: #667eea;\n}\n.qa-report-table .col-qa {\n  width: 100px;\n  font-weight: 500;\n}\n.qa-report-table .col-action {\n  width: 50px;\n  text-align: center;\n}\n.phone-item {\n  font-family: \"Monaco\", \"Menlo\", \"Consolas\", monospace;\n  font-size: 12px;\n  color: #666666;\n}\n.phone-item + .phone-item {\n  margin-top: 2px;\n}\n.qa-never {\n  color: #dc3545 !important;\n  font-weight: 600;\n}\n.qa-action-btn {\n  padding: 4px 8px;\n  border: none;\n  background: transparent;\n  cursor: pointer;\n  font-size: 16px;\n  color: #666666;\n  border-radius: 2px;\n  transition: all 0.2s;\n}\n.qa-action-btn:hover {\n  background: #f0f2f5;\n  color: #667eea;\n}\n.qa-report-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n  gap: 8px;\n  padding: 8px;\n}\n.qa-card {\n  background: white;\n  border-radius: 2px;\n  padding: 16px;\n  border-left: 4px solid #e0e0e0;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n  transition: all 0.2s;\n  position: relative;\n  overflow: hidden;\n  user-select: text;\n}\n.qa-card:hover {\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n  transform: translateY(-2px);\n}\n.card-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 8px;\n}\n.card-name {\n  font-weight: 600;\n  font-size: 13px;\n  color: #333333;\n  flex: 1;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  padding-right: 8px;\n}\n.card-action-btn {\n  padding: 2px 6px;\n  border: none;\n  background: transparent;\n  cursor: pointer;\n  font-size: 14px;\n  color: #666666;\n  border-radius: 2px;\n  flex-shrink: 0;\n  user-select: none;\n}\n.card-action-btn:hover {\n  background: #f0f2f5;\n  color: #667eea;\n}\n.card-id {\n  font-family: \"Monaco\", \"Menlo\", \"Consolas\", monospace;\n  font-size: 12px;\n  color: #667eea;\n  margin-bottom: 8px;\n}\n.card-phones {\n  margin-bottom: 8px;\n}\n.card-phone {\n  font-family: \"Monaco\", \"Menlo\", \"Consolas\", monospace;\n  font-size: 12px;\n  color: #666666;\n}\n.card-phone + .card-phone {\n  margin-top: 2px;\n}\n.card-qa {\n  font-weight: 600;\n  font-size: 13px;\n  margin-bottom: 8px;\n}\n.card-priority-badge {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  padding: 2px 8px;\n  font-size: 12px;\n  color: white;\n  border-radius: 2px 0 0 0;\n  font-weight: 500;\n}\n.priority-critical .col-qa {\n  color: #dc3545;\n}\n.priority-high .col-qa {\n  color: #e74c3c;\n}\n.priority-medium-high .col-qa {\n  color: #fd7e14;\n}\n.priority-medium .col-qa {\n  color: #ffc107;\n}\n.priority-low-medium .col-qa {\n  color: #a8d08d;\n}\n.priority-low .col-qa {\n  color: #28a745;\n}\n.qa-export-menu {\n  background: white;\n  border: 1px solid #e0e0e0;\n  border-radius: 2px;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);\n  overflow: hidden;\n  z-index: 100000;\n  min-width: 140px;\n}\n.export-menu-item {\n  padding: 8px 16px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: background 0.15s;\n}\n.export-menu-item:hover {\n  background: #f0f2f5;\n  color: #667eea;\n}\n.export-menu-item + .export-menu-item {\n  border-top: 1px solid #f0f0f0;\n}\n.qa-action-menu {\n  background: white;\n  border: 1px solid #e0e0e0;\n  border-radius: 2px;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);\n  overflow: hidden;\n  z-index: 100000;\n  min-width: 180px;\n}\n.action-menu-item {\n  padding: 8px 16px;\n  cursor: pointer;\n  font-size: 13px;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  transition: background 0.15s;\n}\n.action-menu-item:hover {\n  background: #f0f2f5;\n  color: #667eea;\n}\n.action-menu-item + .action-menu-item {\n  border-top: 1px solid #f0f0f0;\n}\n.qa-toast {\n  position: fixed;\n  top: 24px;\n  left: 50%;\n  transform: translateX(-50%) translateY(-100%);\n  padding: 8px 24px;\n  border-radius: 2px;\n  font-size: 13px;\n  color: white;\n  z-index: 100001;\n  opacity: 0;\n  transition: all 0.3s ease;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);\n}\n.qa-toast.show {\n  transform: translateX(-50%) translateY(0);\n  opacity: 1;\n}\n.qa-toast.qa-toast-success {\n  background: #28a745;\n}\n.qa-toast.qa-toast-error {\n  background: #dc3545;\n}\n.qa-toast.qa-toast-info {\n  background: #667eea;\n}\n.qa-note-modal-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.5);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 100002;\n}\n.qa-note-modal {\n  background: white;\n  border-radius: 8px;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);\n  width: 90%;\n  max-width: 520px;\n  max-height: 90vh;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n}\n.qa-note-modal-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px;\n  border-bottom: 1px solid #e0e0e0;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n}\n.qa-note-modal-title {\n  font-size: 14px;\n  font-weight: 600;\n}\n.qa-note-modal-close {\n  background: none;\n  border: none;\n  color: white;\n  font-size: 20px;\n  cursor: pointer;\n  padding: 0;\n  width: 28px;\n  height: 28px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 2px;\n  transition: background 0.15s;\n}\n.qa-note-modal-close:hover {\n  background: rgba(255, 255, 255, 0.2);\n}\n.qa-note-modal-body {\n  padding: 16px;\n  overflow-y: auto;\n  flex: 1;\n}\n.qa-note-section {\n  margin-bottom: 16px;\n}\n.qa-note-section:last-child {\n  margin-bottom: 0;\n}\n.qa-note-label {\n  display: block;\n  font-size: 13px;\n  font-weight: 500;\n  color: #666666;\n  margin-bottom: 4px;\n}\n.qa-note-template {\n  padding: 8px 16px;\n  background: #f0f2f5;\n  border: 1px solid #e0e0e0;\n  border-radius: 2px;\n  font-size: 13px;\n  line-height: 1.5;\n  color: #333333;\n}\n.qa-note-textarea {\n  width: 100%;\n  padding: 8px 16px;\n  border: 1px solid #e0e0e0;\n  border-radius: 2px;\n  font-size: 13px;\n  font-family: inherit;\n  resize: vertical;\n  transition: border-color 0.2s, box-shadow 0.2s;\n}\n.qa-note-textarea:focus {\n  outline: none;\n  border-color: #667eea;\n  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);\n}\n.qa-note-textarea::placeholder {\n  color: #666666;\n}\n.qa-note-modal-footer {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  padding: 16px;\n  border-top: 1px solid #e0e0e0;\n  background: #f0f2f5;\n}\n.qa-note-btn {\n  padding: 4px 16px;\n  font-size: 13px;\n  border-radius: 2px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.qa-note-btn.qa-note-btn-cancel {\n  background: white;\n  border: 1px solid #e0e0e0;\n  color: #666666;\n}\n.qa-note-btn.qa-note-btn-cancel:hover {\n  background: #f0f2f5;\n  border-color: #666666;\n}\n.qa-note-btn.qa-note-btn-submit {\n  background: #667eea;\n  border: 1px solid #667eea;\n  color: white;\n}\n.qa-note-btn.qa-note-btn-submit:hover {\n  background: #5a6fd6;\n  border-color: #5a6fd6;\n}\n/**\n * Status Tracking Tab Styles\n * Epic 7: Multi-Tab Panel - 状态追踪 Tab\n *\n * 依赖: variables.less, multi-tab-panel.less\n * @author HHA Smart Assistant\n * @date 2026-01-08\n */\n.status-tracking-tab {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow: hidden;\n  padding: 0;\n}\n#status-tracking-wrapper {\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n#status-tracking-wrapper #tracker-panel {\n  background: #ffffff;\n}\n#status-tracking-wrapper #tracker-panel .tracker-view {\n  height: 100%;\n  overflow: hidden;\n  min-height: 0;\n}\n#status-tracking-wrapper #tracker-panel .tracker-view.hidden {\n  display: none !important;\n}\n#status-tracking-wrapper #tracker-panel .tracker-content {\n  flex: 1 1 auto;\n  min-height: 0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n}\n#status-tracking-wrapper #tracker-panel .tracker-content.tracker-content-empty {\n  padding: 0 !important;\n}\n#status-tracking-wrapper #tracker-panel .tracker-header,\n#status-tracking-wrapper #tracker-panel .tracker-footer {\n  flex-shrink: 0;\n}\n#status-tracking-wrapper #tracker-panel::-webkit-scrollbar,\n#status-tracking-wrapper #tracker-panel .tracker-content::-webkit-scrollbar {\n  width: 6px;\n}\n#status-tracking-wrapper #tracker-panel::-webkit-scrollbar-thumb,\n#status-tracking-wrapper #tracker-panel .tracker-content::-webkit-scrollbar-thumb {\n  background: #e0e0e0;\n  border-radius: 2px;\n}\n#status-tracking-wrapper #tracker-panel::-webkit-scrollbar-thumb:hover,\n#status-tracking-wrapper #tracker-panel .tracker-content::-webkit-scrollbar-thumb:hover {\n  background: #666666;\n}\n#status-tracking-wrapper #tracker-panel::-webkit-scrollbar-track,\n#status-tracking-wrapper #tracker-panel .tracker-content::-webkit-scrollbar-track {\n  background: #f7f8fa;\n}\n#status-tracking-wrapper #tracker-panel::-webkit-scrollbar-track,\n#status-tracking-wrapper #tracker-panel .tracker-content::-webkit-scrollbar-track {\n  background: #f7f8fa;\n}\n/* Empty State Styles - matches QA Report empty state */\n#status-tracking-wrapper .tracker-empty-state {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n  min-height: 200px;\n  padding: 40px 20px;\n  text-align: center;\n  color: #666;\n  background: #f7f8fa;\n}\n#status-tracking-wrapper .tracker-empty-state .tracker-empty-icon {\n  font-size: 48px;\n  margin-bottom: 16px;\n  opacity: 0.7;\n}\n#status-tracking-wrapper .tracker-empty-state .tracker-empty-title {\n  font-size: 18px;\n  font-weight: 600;\n  color: #333;\n  margin-bottom: 8px;\n}\n#status-tracking-wrapper .tracker-empty-state .tracker-empty-text {\n  font-size: 14px;\n  color: #888;\n}\n/**\n * Cleaner Tab Styles\n * Epic 11: POC 和 Duplicate Call 智能清理器\n */\n.cleaner-tab {\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  padding: 0;\n}\n.cleaner-wrapper {\n  flex: 1;\n  overflow-y: auto;\n  padding: 12px 16px;\n  display: flex;\n  flex-direction: column;\n  box-sizing: border-box;\n}\n/* Header */\n.cleaner-header {\n  margin-bottom: 12px;\n}\n.cleaner-title-row {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n.cleaner-title {\n  margin: 0;\n  font-size: 15px;\n  font-weight: 600;\n  color: #333;\n}\n.cleaner-page-tag {\n  font-size: 12px;\n  color: #666;\n  background: #f0f4f8;\n  padding: 3px 8px;\n  border-radius: 4px;\n  white-space: nowrap;\n}\n.cleaner-btn-refresh {\n  background: #f8f9fa;\n  border: none;\n  border-radius: 4px;\n  padding: 4px 8px;\n  font-size: 13px;\n  cursor: pointer;\n  transition: background 0.2s ease;\n  margin-left: auto;\n  outline: none;\n}\n.cleaner-btn-refresh:hover {\n  background: #e8f4fd;\n}\n.cleaner-btn-refresh:focus {\n  outline: none;\n}\n.cleaner-hint {\n  font-size: 12px;\n  color: #888;\n  margin-top: 8px;\n  font-style: italic;\n}\n/* Status */\n.cleaner-status {\n  text-align: center;\n  padding: 20px;\n  color: #666;\n}\n.cleaner-spinner {\n  animation: cleaner-spin 1s linear infinite;\n  display: inline-block;\n}\n@keyframes cleaner-spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n/* Toolbar */\n.cleaner-toolbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 12px;\n  padding: 10px 12px;\n  background: #f8f9fa;\n  border-radius: 6px;\n}\n.cleaner-select-all {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  font-size: 14px;\n  color: #333;\n  line-height: 1;\n}\n.cleaner-select-all input[type=\"checkbox\"] {\n  width: 16px;\n  height: 16px;\n  margin: 0;\n  cursor: pointer;\n  vertical-align: middle;\n}\n.cleaner-select-all span {\n  vertical-align: middle;\n}\n/* Buttons */\n.cleaner-btn-primary {\n  background: linear-gradient(135deg, #4a90d9, #357abd);\n  color: white;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 6px;\n  font-size: 14px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.cleaner-btn-primary:hover:not(:disabled) {\n  background: linear-gradient(135deg, #357abd, #2d6aa3);\n  transform: translateY(-1px);\n}\n.cleaner-btn-primary:disabled {\n  background: #ccc;\n  cursor: not-allowed;\n  transform: none;\n}\n.cleaner-btn-secondary {\n  background: white;\n  color: #666;\n  border: 1px solid #ddd;\n  padding: 8px 16px;\n  border-radius: 6px;\n  font-size: 14px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.cleaner-btn-secondary:hover {\n  background: #f5f5f5;\n  border-color: #ccc;\n}\n/* Records List */\n.cleaner-records-list {\n  max-height: 260px;\n  overflow-y: auto;\n  border: 1px solid #e0e0e0;\n  border-radius: 6px;\n  overscroll-behavior: contain;\n}\n.cleaner-record-item {\n  display: flex;\n  align-items: flex-start;\n  padding: 10px 12px;\n  border-bottom: 1px solid #f0f0f0;\n  transition: background 0.15s ease;\n}\n.cleaner-record-item:last-child {\n  border-bottom: none;\n}\n.cleaner-record-item:hover {\n  background: #f8f9fa;\n}\n.cleaner-record-item input[type=\"checkbox\"] {\n  width: 16px;\n  height: 16px;\n  margin-right: 10px;\n  margin-top: 2px;\n  cursor: pointer;\n}\n.cleaner-record-info {\n  flex: 1;\n  font-size: 13px;\n}\n.cleaner-record-info .record-main {\n  font-weight: 500;\n  color: #333;\n  margin-bottom: 4px;\n}\n.cleaner-record-info .record-detail {\n  color: #666;\n  font-size: 12px;\n}\n.cleaner-badge {\n  display: inline-block;\n  padding: 2px 8px;\n  border-radius: 12px;\n  font-size: 11px;\n  font-weight: 500;\n  margin-right: 8px;\n}\n.cleaner-badge.badge-poc {\n  background: #e3f2fd;\n  color: #1976d2;\n}\n.cleaner-badge.badge-poc-caregiver {\n  background: #fff3e0;\n  color: #f57c00;\n}\n/* Call Summary */\n.cleaner-call-summary {\n  text-align: center;\n  padding: 16px;\n  background: #e8f4fd;\n  border-radius: 8px;\n  margin-bottom: 12px;\n}\n.cleaner-call-summary .cleaner-call-count {\n  font-size: 15px;\n  color: #1976d2;\n}\n.cleaner-call-summary .cleaner-call-count strong {\n  font-size: 20px;\n  font-weight: 600;\n}\n.cleaner-call-details {\n  border: 1px solid #e0e0e0;\n  border-radius: 6px;\n  margin-top: 12px;\n  max-height: 250px;\n  overflow-y: auto;\n}\n.cleaner-call-item {\n  padding: 10px 12px;\n  border-bottom: 1px solid #f0f0f0;\n  font-size: 13px;\n  color: #333;\n}\n.cleaner-call-item:last-child {\n  border-bottom: none;\n}\n.cleaner-call-item::before {\n  content: \"•\";\n  color: #1976d2;\n  margin-right: 8px;\n}\n/* Empty State */\n.cleaner-empty-state {\n  text-align: center;\n  padding: 40px 20px;\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 300px;\n}\n.cleaner-empty-state .cleaner-empty-icon {\n  font-size: 48px;\n  margin-bottom: 12px;\n}\n.cleaner-empty-state .cleaner-hint {\n  font-size: 13px;\n  color: #666;\n}\n.cleaner-empty-state p {\n  font-size: 15px;\n  color: #4caf50;\n  font-weight: 500;\n  margin: 0;\n}\n/* No Page Detected */\n.cleaner-no-page-info {\n  text-align: left;\n  margin-top: 16px;\n  padding: 16px;\n  background: #f8f9fa;\n  border-radius: 8px;\n}\n.cleaner-no-page-info p {\n  margin: 0 0 12px 0;\n  font-size: 14px;\n  color: #333;\n}\n.cleaner-no-page-info ul {\n  margin: 0 0 12px 20px;\n  padding: 0;\n}\n.cleaner-no-page-info ul li {\n  margin-bottom: 8px;\n  font-size: 13px;\n  color: #555;\n}\n.cleaner-no-page-info .cleaner-hint {\n  color: #999;\n  font-size: 13px;\n  font-style: italic;\n  margin-bottom: 0;\n}\n/* Cleaning Overlay - 浅色半透明蒙版 */\n#hha-cleaning-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.15);\n  backdrop-filter: blur(2px);\n  z-index: 999999;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  pointer-events: all;\n  /* 旋转动画 */\n}\n#hha-cleaning-overlay .cleaning-modal {\n  background: white;\n  padding: 30px 40px;\n  border-radius: 12px;\n  text-align: center;\n  min-width: 400px;\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);\n  /* 确认对话框按钮 */\n}\n#hha-cleaning-overlay .cleaning-modal .cleaning-icon {\n  font-size: 48px;\n  margin-bottom: 15px;\n}\n#hha-cleaning-overlay .cleaning-modal .cleaning-icon.success {\n  color: #4CAF50;\n}\n#hha-cleaning-overlay .cleaning-modal h3 {\n  margin: 0 0 10px;\n  font-size: 20px;\n  color: #333;\n}\n#hha-cleaning-overlay .cleaning-modal p {\n  margin: 0;\n  color: #666;\n  font-size: 14px;\n}\n#hha-cleaning-overlay .cleaning-modal .progress-bar {\n  height: 8px;\n  background: #e0e0e0;\n  border-radius: 4px;\n  overflow: hidden;\n  margin: 20px 0;\n}\n#hha-cleaning-overlay .cleaning-modal .progress-bar .progress-fill {\n  height: 100%;\n  background: linear-gradient(90deg, #4CAF50, #8BC34A);\n  transition: width 0.3s ease;\n}\n#hha-cleaning-overlay .cleaning-modal .cleaning-warning {\n  color: #ff9800;\n  font-size: 14px;\n  margin-top: 15px;\n  font-weight: 500;\n}\n#hha-cleaning-overlay .cleaning-modal .success-note {\n  color: #666;\n  font-size: 14px;\n  margin-top: 10px;\n}\n#hha-cleaning-overlay .cleaning-modal .error-message {\n  color: #e53935;\n  font-size: 14px;\n  margin-top: 10px;\n}\n#hha-cleaning-overlay .cleaning-modal .btn-primary {\n  margin-top: 20px;\n  padding: 10px 30px;\n  background: #1976d2;\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 16px;\n}\n#hha-cleaning-overlay .cleaning-modal .btn-primary:hover {\n  background: #1565c0;\n}\n#hha-cleaning-overlay .cleaning-modal .cleaning-btn-close {\n  margin-top: 20px;\n  padding: 10px 30px;\n  background: #1976d2;\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 16px;\n}\n#hha-cleaning-overlay .cleaning-modal .cleaning-btn-close:hover {\n  background: #1565c0;\n}\n#hha-cleaning-overlay .cleaning-modal .dialog-buttons {\n  display: flex;\n  gap: 12px;\n  justify-content: center;\n  margin-top: 20px;\n}\n#hha-cleaning-overlay .cleaning-modal .dialog-buttons .btn-cancel {\n  padding: 10px 24px;\n  background: #f5f5f5;\n  color: #666;\n  border: 1px solid #ddd;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 14px;\n}\n#hha-cleaning-overlay .cleaning-modal .dialog-buttons .btn-cancel:hover {\n  background: #e0e0e0;\n}\n#hha-cleaning-overlay .cleaning-modal .dialog-buttons .btn-confirm {\n  padding: 10px 24px;\n  background: #4caf50;\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 14px;\n  font-weight: 500;\n}\n#hha-cleaning-overlay .cleaning-modal .dialog-buttons .btn-confirm:hover {\n  background: #43a047;\n}\n#hha-cleaning-overlay .spinning {\n  animation: cleaner-spin 1s linear infinite;\n}\n/**\n * Mail Builder Tab Styles\n * Epic 12: 智能邮件构筑助手\n */\n.mail-builder-tab {\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  padding: 0;\n}\n.mail-builder-wrapper {\n  flex: 1;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  box-sizing: border-box;\n}\n/* Header */\n.mail-builder-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 16px;\n  border-bottom: 1px solid #e0e0e0;\n  background: #fafbfc;\n  flex-shrink: 0;\n}\n.mail-builder-title {\n  margin: 0;\n  font-size: 15px;\n  font-weight: 600;\n  color: #333;\n}\n.mail-builder-page-tag {\n  font-size: 12px;\n  color: #666;\n  background: #e8f4fd;\n  padding: 4px 10px;\n  border-radius: 12px;\n  white-space: nowrap;\n}\n/* Main Content - 35% / 65% Split */\n.mail-builder-main {\n  flex: 1;\n  display: flex;\n  overflow: hidden;\n  min-height: 0;\n}\n.mail-builder-main.full-width .mail-builder-template-panel {\n  width: 100%;\n  border-left: none;\n}\n/* Left Info Panel (35%) */\n.mail-builder-info-panel {\n  width: 35%;\n  min-width: 200px;\n  border-right: 1px solid #e0e0e0;\n  padding: 12px;\n  display: flex;\n  flex-direction: column;\n  overflow-y: auto;\n  background: #fff;\n}\n.mail-builder-info-list {\n  flex: 1;\n}\n.mail-builder-info-item {\n  display: flex;\n  align-items: center;\n  padding: 8px 0;\n  border-bottom: 1px solid #f0f0f0;\n  gap: 8px;\n}\n.mail-builder-info-item:last-child {\n  border-bottom: none;\n}\n.info-label {\n  font-size: 12px;\n  color: #888;\n  min-width: 40px;\n  flex-shrink: 0;\n}\n.info-value {\n  flex: 1;\n  font-size: 13px;\n  color: #333;\n  font-weight: 500;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.info-copy-btn {\n  background: #f0f4f8;\n  border: none;\n  border-radius: 4px;\n  padding: 4px 6px;\n  font-size: 11px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  flex-shrink: 0;\n}\n.info-copy-btn:hover {\n  background: #e0e8f0;\n  transform: scale(1.05);\n}\n.info-copy-btn:active {\n  transform: scale(0.95);\n}\n/* Quick Copy Buttons */\n.mail-builder-quick-copy {\n  margin-top: 12px;\n  padding-top: 12px;\n  border-top: 1px solid #e0e0e0;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.quick-copy-btn {\n  background: linear-gradient(135deg, #4a90d9, #357abd);\n  color: white;\n  border: none;\n  padding: 8px 12px;\n  border-radius: 6px;\n  font-size: 12px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  text-align: center;\n}\n.quick-copy-btn:hover {\n  background: linear-gradient(135deg, #357abd, #2d6aa3);\n  transform: translateY(-1px);\n}\n.quick-copy-btn:active {\n  transform: translateY(0);\n}\n/* Right Template Panel (65%) */\n.mail-builder-template-panel {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  background: #fafbfc;\n}\n.mail-builder-template-tabs {\n  display: flex;\n  border-bottom: 1px solid #e0e0e0;\n  background: #fff;\n  flex-shrink: 0;\n}\n.template-tab-btn {\n  flex: 1;\n  padding: 10px 16px;\n  background: transparent;\n  border: none;\n  border-bottom: 2px solid transparent;\n  font-size: 13px;\n  color: #666;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.template-tab-btn:hover {\n  color: #333;\n  background: #f5f5f5;\n}\n.template-tab-btn.active {\n  color: #1976d2;\n  border-bottom-color: #1976d2;\n  font-weight: 500;\n}\n.mail-builder-template-content {\n  flex: 1;\n  padding: 16px;\n  overflow-y: auto;\n}\n.template-placeholder {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n  min-height: 200px;\n  color: #999;\n}\n.template-placeholder .template-placeholder-icon {\n  font-size: 48px;\n  margin-bottom: 12px;\n  opacity: 0.5;\n}\n.template-placeholder p {\n  margin: 0;\n  font-size: 14px;\n}\n.template-placeholder .template-hint {\n  margin-top: 8px;\n  font-size: 12px;\n  color: #bbb;\n}\n.mail-builder-template-actions {\n  display: flex;\n  gap: 8px;\n  padding: 12px;\n  border-top: 1px solid #e0e0e0;\n  background: #fff;\n  flex-shrink: 0;\n}\n.template-action-btn {\n  flex: 1;\n  padding: 8px 12px;\n  background: #f5f5f5;\n  border: 1px solid #e0e0e0;\n  border-radius: 6px;\n  font-size: 12px;\n  color: #666;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.template-action-btn:hover:not(:disabled) {\n  background: #e8e8e8;\n  color: #333;\n}\n.template-action-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n/* No Data State */\n.mail-builder-no-data {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n  color: #999;\n  font-size: 13px;\n}\n/* No Page Detected */\n.mail-builder-no-page-info {\n  text-align: left;\n  margin-top: 16px;\n  padding: 16px;\n  background: #f8f9fa;\n  border-radius: 8px;\n}\n.mail-builder-no-page-info p {\n  margin: 0 0 12px 0;\n  font-size: 14px;\n  color: #333;\n}\n.mail-builder-no-page-info ul {\n  margin: 0 0 12px 20px;\n  padding: 0;\n}\n.mail-builder-no-page-info ul li {\n  margin-bottom: 8px;\n  font-size: 13px;\n  color: #555;\n}\n.mail-builder-no-page-info .mail-builder-hint {\n  color: #999;\n  font-size: 13px;\n  font-style: italic;\n  margin-bottom: 0;\n}\n/* Template List */\n.template-list {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n.template-empty {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 200px;\n  color: #999;\n}\n.template-empty .template-empty-icon {\n  font-size: 48px;\n  margin-bottom: 12px;\n  opacity: 0.5;\n}\n.template-empty p {\n  margin: 0;\n  font-size: 14px;\n}\n.template-empty .template-hint {\n  margin-top: 8px;\n  font-size: 12px;\n  color: #bbb;\n}\n/* Template Card */\n.template-card {\n  background: #fff;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  padding: 12px;\n  transition: all 0.2s ease;\n}\n.template-card:hover {\n  border-color: #1976d2;\n  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);\n}\n.template-card-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 8px;\n}\n.template-name {\n  font-size: 14px;\n  font-weight: 600;\n  color: #333;\n}\n.template-target-badge {\n  font-size: 11px;\n  padding: 2px 8px;\n  border-radius: 12px;\n  background: #e3f2fd;\n  color: #1976d2;\n}\n.template-badges {\n  display: flex;\n  gap: 6px;\n  align-items: center;\n}\n.template-builtin-badge {\n  font-size: 10px;\n  padding: 2px 6px;\n  border-radius: 10px;\n  background: #fff3e0;\n  color: #f57c00;\n  font-weight: 500;\n}\n.template-card-preview {\n  margin-bottom: 10px;\n}\n.template-card-preview .template-subject {\n  font-size: 12px;\n  color: #666;\n}\n.template-card-actions {\n  display: flex;\n  gap: 8px;\n  justify-content: flex-end;\n}\n.template-card-btn {\n  padding: 4px 10px;\n  border-radius: 4px;\n  font-size: 12px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  border: 1px solid #e0e0e0;\n  background: #fff;\n}\n.template-card-btn.use-btn {\n  background: linear-gradient(135deg, #4a90d9, #357abd);\n  color: white;\n  border: none;\n}\n.template-card-btn.use-btn:hover {\n  background: linear-gradient(135deg, #357abd, #2d6aa3);\n}\n.template-card-btn.edit-btn,\n.template-card-btn.delete-btn {\n  background: #f5f5f5;\n}\n.template-card-btn.edit-btn:hover,\n.template-card-btn.delete-btn:hover {\n  background: #e0e0e0;\n}\n.template-card-btn.delete-btn:hover {\n  background: #ffebee;\n  border-color: #e53935;\n}\n/* Template Editor */\n.template-editor {\n  background: #fff;\n  border-radius: 8px;\n  overflow: hidden;\n}\n.editor-header {\n  padding: 12px 16px;\n  background: #f5f5f5;\n  border-bottom: 1px solid #e0e0e0;\n}\n.editor-header h4 {\n  margin: 0;\n  font-size: 15px;\n  font-weight: 600;\n  color: #333;\n}\n.editor-form {\n  padding: 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.form-group label {\n  font-size: 12px;\n  color: #666;\n  font-weight: 500;\n}\n.form-group input,\n.form-group select,\n.form-group textarea {\n  padding: 8px 10px;\n  border: 1px solid #e0e0e0;\n  border-radius: 6px;\n  font-size: 13px;\n  transition: border-color 0.2s ease;\n}\n.form-group input:focus,\n.form-group select:focus,\n.form-group textarea:focus {\n  outline: none;\n  border-color: #1976d2;\n}\n.form-group textarea {\n  resize: vertical;\n  min-height: 80px;\n  font-family: inherit;\n}\n.editor-actions {\n  display: flex;\n  gap: 10px;\n  justify-content: flex-end;\n  padding: 12px 16px;\n  border-top: 1px solid #e0e0e0;\n  background: #fafbfc;\n}\n.editor-btn {\n  padding: 8px 20px;\n  border-radius: 6px;\n  font-size: 13px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.editor-btn.cancel-btn {\n  background: #f5f5f5;\n  border: 1px solid #e0e0e0;\n  color: #666;\n}\n.editor-btn.cancel-btn:hover {\n  background: #e0e0e0;\n}\n.editor-btn.save-btn {\n  background: linear-gradient(135deg, #4a90d9, #357abd);\n  color: white;\n  border: none;\n}\n.editor-btn.save-btn:hover {\n  background: linear-gradient(135deg, #357abd, #2d6aa3);\n}\n/* Toast Notification */\n.mail-builder-toast {\n  position: fixed;\n  top: 20px;\n  left: 50%;\n  transform: translateX(-50%) translateY(-100px);\n  background: #333;\n  color: white;\n  padding: 10px 20px;\n  border-radius: 8px;\n  font-size: 14px;\n  z-index: 1000000;\n  opacity: 0;\n  transition: all 0.3s ease;\n  pointer-events: none;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n}\n.mail-builder-toast.show {\n  opacity: 1;\n  transform: translateX(-50%) translateY(0);\n}\n/* ============================================================================\n   Template Editor Modal\n   ============================================================================ */\n.template-modal-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.5);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 100002;\n  backdrop-filter: blur(2px);\n}\n.template-modal {\n  background: white;\n  border-radius: 12px;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);\n  width: 90%;\n  max-width: 700px;\n  max-height: 90vh;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n}\n.template-modal-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px 20px;\n  border-bottom: 1px solid #e0e0e0;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n}\n.template-modal-title {\n  font-size: 16px;\n  font-weight: 600;\n  margin: 0;\n}\n.template-modal-close {\n  background: none;\n  border: none;\n  color: white;\n  font-size: 20px;\n  cursor: pointer;\n  padding: 0;\n  width: 32px;\n  height: 32px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 6px;\n  transition: background 0.15s;\n}\n.template-modal-close:hover {\n  background: rgba(255, 255, 255, 0.2);\n}\n.template-modal-body {\n  padding: 20px;\n  overflow-y: auto;\n  flex: 1;\n  max-height: calc(90vh - 140px);\n}\n.template-form-group {\n  margin-bottom: 16px;\n}\n.template-form-group:last-child {\n  margin-bottom: 0;\n}\n.template-form-label {\n  display: block;\n  font-size: 13px;\n  font-weight: 500;\n  color: #555;\n  margin-bottom: 6px;\n}\n.template-form-input,\n.template-form-select {\n  width: 100%;\n  padding: 10px 12px;\n  border: 1px solid #ddd;\n  border-radius: 6px;\n  font-size: 14px;\n  transition: border-color 0.2s, box-shadow 0.2s;\n  box-sizing: border-box;\n}\n.template-form-input:focus,\n.template-form-select:focus {\n  outline: none;\n  border-color: #4a90d9;\n  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.15);\n}\n.template-form-row {\n  display: flex;\n  gap: 12px;\n}\n.template-form-row .template-form-group {\n  flex: 1;\n}\n/* TinyMCE wrapper */\n.template-body-editor {\n  border: 1px solid #ddd;\n  border-radius: 6px;\n  overflow: hidden;\n}\n.template-body-editor .tox-tinymce {\n  border: none !important;\n}\n.template-body-editor textarea {\n  width: 100%;\n  min-height: 150px;\n  padding: 12px;\n  border: none;\n  font-family: inherit;\n  font-size: 14px;\n  resize: vertical;\n  box-sizing: border-box;\n}\n.template-body-editor textarea:focus {\n  outline: none;\n}\n/* Custom Variables Section */\n.template-variables-section {\n  margin-top: 20px;\n  padding-top: 16px;\n  border-top: 1px solid #e0e0e0;\n}\n.template-variables-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 12px;\n}\n.template-variables-header h5 {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: #333;\n}\n.template-add-var-btn {\n  padding: 4px 10px;\n  font-size: 12px;\n  background: #e3f2fd;\n  color: #1976d2;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.template-add-var-btn:hover {\n  background: #bbdefb;\n}\n.template-variables-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 12px;\n}\n.template-variables-table th,\n.template-variables-table td {\n  padding: 8px 10px;\n  text-align: left;\n  border: 1px solid #e0e0e0;\n}\n.template-variables-table th {\n  background: #f5f5f5;\n  font-weight: 500;\n  color: #666;\n}\n.template-variables-table input {\n  width: 100%;\n  padding: 6px 8px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 12px;\n  box-sizing: border-box;\n}\n.template-variables-table input:focus {\n  outline: none;\n  border-color: #4a90d9;\n}\n.template-variables-table .var-delete-btn {\n  padding: 4px 8px;\n  background: #ffebee;\n  color: #e53935;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n}\n.template-variables-table .var-delete-btn:hover {\n  background: #ffcdd2;\n}\n.template-modal-footer {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  padding: 16px 20px;\n  border-top: 1px solid #e0e0e0;\n  background: #fafbfc;\n}\n.template-modal-btn {\n  padding: 10px 24px;\n  font-size: 14px;\n  font-weight: 500;\n  border-radius: 6px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.template-modal-btn.btn-cancel {\n  background: #f5f5f5;\n  border: 1px solid #ddd;\n  color: #666;\n}\n.template-modal-btn.btn-cancel:hover {\n  background: #e0e0e0;\n}\n.template-modal-btn.btn-save {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  border: none;\n  color: white;\n}\n.template-modal-btn.btn-save:hover {\n  background: linear-gradient(135deg, #5a6fd6 0%, #6b4199 100%);\n}\n/**\n * Visit Monitor (Coordinator Tracker) Styles\n * Epic 10: UI 现代化升级\n *\n * 依赖: variables.less\n * @author HHA Smart Assistant\n * @date 2026-01-12\n */\n#tracker-container {\n  position: fixed;\n  top: 20px;\n  right: 20px;\n  z-index: 99999;\n  user-select: none;\n  -webkit-user-select: none;\n}\n#tracker-drag-handle {\n  width: 48px;\n  height: 48px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n  font-size: 24px;\n  transition: all 0.15s ease;\n}\n#tracker-drag-handle:hover {\n  transform: scale(1.1);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n}\n#tracker-drag-handle:active {\n  transform: scale(0.95);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n#tracker-panel {\n  position: absolute;\n  top: 0;\n  width: 550px;\n  height: 480px;\n  background: #ffffff;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);\n  display: none;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  color: #333333;\n  overflow: hidden;\n  transition: height 0.3s ease;\n}\n.tracker-view {\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n  transition: transform 0.3s ease;\n}\n.tracker-view.hidden {\n  display: none;\n}\n.slide-in {\n  transform: translateX(0);\n}\n.slide-out {\n  transform: translateX(-100%);\n}\n.slide-in-from-right {\n  transform: translateX(100%);\n}\n.slide-out-to-right {\n  transform: translateX(100%);\n}\n.slide-in-from-left {\n  transform: translateX(-100%);\n}\n.tracker-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 4px 16px;\n  background: #ffffff;\n  border-bottom: 1px solid #e0e0e0;\n  flex-shrink: 0;\n  height: 44px;\n  box-sizing: border-box;\n  gap: 8px;\n}\n.tracker-header-left {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex: 0 0 auto;\n}\n.tracker-header-right {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.tracker-header h3 {\n  margin: 0;\n  font-size: 16px;\n  font-weight: 600;\n  color: #333333;\n}\n#last-refresh-time {\n  font-size: 13px;\n  color: #666666;\n  line-height: 28px;\n}\n.tracker-btn-primary {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  border: none;\n  color: white;\n  border-radius: 2px;\n  height: 28px;\n  padding: 0 14px;\n  font-size: 13px;\n  font-weight: 500;\n  cursor: pointer;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  transition: all 0.15s ease;\n}\n.tracker-btn-primary:hover:not(:disabled) {\n  filter: brightness(1.1);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.tracker-btn-primary:active:not(:disabled) {\n  transform: translateY(1px);\n}\n.tracker-btn-primary:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n.tracker-btn-secondary {\n  background: white;\n  border: 1px solid #e0e0e0;\n  color: #333333;\n  border-radius: 2px;\n  height: 28px;\n  padding: 0 14px;\n  font-size: 13px;\n  cursor: pointer;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  transition: all 0.15s ease;\n}\n.tracker-btn-secondary:hover:not(:disabled) {\n  border-color: #667eea;\n  color: #667eea;\n  background: #f0efff;\n}\n.tracker-btn-secondary:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n.tracker-btn-icon {\n  width: 28px;\n  height: 28px;\n  padding: 0;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 2px;\n  font-size: 16px;\n}\n.tracker-header-btn {\n  background: #f7f8fa;\n  border: 1px solid #e0e0e0;\n  padding: 0 14px;\n  height: 28px;\n  border-radius: 2px;\n  cursor: pointer;\n  font-size: 13px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  transition: all 0.15s ease;\n}\n.tracker-header-btn:hover:not(:disabled) {\n  border-color: #667eea;\n  color: #667eea;\n  background: #f0efff;\n}\n.tracker-header-btn:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n.back-btn {\n  font-size: 18px;\n  width: 28px;\n  height: 28px;\n  padding: 0;\n}\n.tracker-footer {\n  padding: 8px 16px;\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  border-top: 1px solid #e0e0e0;\n  background: #f7f8fa;\n  flex-shrink: 0;\n}\n.tracker-content {\n  flex: 1 1 auto;\n  padding: 8px 16px;\n  overflow-y: auto;\n  overflow-x: hidden;\n  overscroll-behavior: contain;\n  min-height: 0;\n}\n.tracker-content.tracker-content-empty {\n  padding: 0 !important;\n}\n.tracker-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 13px;\n}\n.tracker-table thead th {\n  background: #f7f8fa;\n  color: #333333;\n  font-weight: 600;\n  font-size: 13px;\n  text-align: center;\n  padding: 8px 16px;\n  border: none;\n  border-bottom: 2px solid #e0e0e0;\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  white-space: nowrap;\n}\n.tracker-table tbody tr {\n  border: none;\n  border-bottom: 1px solid #f0f0f0;\n  transition: background 0.15s ease;\n}\n.tracker-table tbody tr:hover {\n  background: #f0f2f5;\n}\n.tracker-table tbody tr:last-child {\n  border-bottom: none;\n}\n.tracker-table th,\n.tracker-table td {\n  padding: 8px 16px;\n  text-align: center;\n  vertical-align: middle;\n  border: none;\n}\n.tracker-table td {\n  font-size: 13px;\n}\n.tracker-table .col-coordinator {\n  text-align: left;\n  width: auto;\n  min-width: 150px;\n}\n.status-icon {\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  color: white;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 700;\n  font-size: 13px;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.status-icon:hover {\n  transform: scale(1.05);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n  opacity: 0.9;\n}\n.status-icon:active {\n  transform: scale(0.95);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.status-icon.status-disabled {\n  opacity: 0.5;\n  cursor: default;\n}\n.status-icon.status-disabled:hover {\n  transform: none;\n  opacity: 0.5;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.status-ok {\n  background-color: #28a745;\n}\n.status-error {\n  background-color: #dc3545;\n  animation: blink-animation 1.5s infinite;\n}\n@keyframes blink-animation {\n  0%,\n  100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.4;\n  }\n}\n.edit-list-actions {\n  text-align: right;\n  padding-right: 16px;\n}\n.edit-list-actions button {\n  font-size: 13px;\n  width: 28px;\n  height: 28px;\n  border: none;\n  border-radius: 50%;\n  cursor: pointer;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 600;\n  transition: all 0.15s ease;\n}\n.edit-list-actions button:hover:not(:disabled) {\n  filter: brightness(1.15);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n  transform: scale(1.05);\n}\n.edit-list-actions button:active:not(:disabled) {\n  transform: translateY(1px) scale(1.05);\n}\n.edit-list-actions button.add-btn {\n  background-color: #28a745;\n  color: white;\n}\n.edit-list-actions button.add-btn:hover:not(:disabled) {\n  background-color: #218838;\n}\n.edit-list-actions button.remove-btn {\n  background-color: #dc3545;\n  color: white;\n}\n.edit-list-actions button.remove-btn:hover:not(:disabled) {\n  background-color: #c82333;\n}\n.edit-list-actions button:disabled {\n  background-color: #e0e0e0;\n  color: #999999;\n  cursor: not-allowed;\n  opacity: 0.6;\n}\n.edit-list-actions button:disabled:hover {\n  filter: none;\n  box-shadow: none;\n  transform: none;\n}\n.loader {\n  text-align: center;\n  padding: 32px;\n}\n.spinner {\n  border: 4px solid #f0f0f0;\n  border-top: 4px solid #3498db;\n  border-radius: 50%;\n  width: 40px;\n  height: 40px;\n  animation: spin 1s linear infinite;\n  margin: 0 auto;\n}\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.tracker-toast {\n  position: fixed;\n  top: 20px;\n  left: 50%;\n  transform: translateX(-50%);\n  background-color: #333333;\n  color: white;\n  padding: 8px 16px;\n  border-radius: 4px;\n  z-index: 100000;\n  opacity: 0;\n  transition: opacity 0.3s ease, top 0.3s ease;\n  font-size: 13px;\n}\n.tracker-toast.show {\n  opacity: 1;\n  top: 40px;\n}\n.tracker-toast.success {\n  background-color: #28a745;\n}\n.tracker-toast.error {\n  background-color: #dc3545;\n}\n#details-popover {\n  position: fixed;\n  background: #ffffff;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);\n  min-width: 600px;\n  max-width: 90vw;\n  min-height: 400px;\n  max-height: 80vh;\n  display: flex;\n  flex-direction: column;\n  z-index: 100000;\n  overflow: hidden;\n}\n.popover-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 4px 16px;\n  background: #ffffff;\n  border-bottom: 1px solid #e0e0e0;\n  height: 44px;\n  box-sizing: border-box;\n  cursor: move;\n  flex-shrink: 0;\n}\n.popover-header h4 {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: #333333;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.popover-close-btn {\n  width: 28px;\n  height: 28px;\n  border: 1px solid #e0e0e0;\n  border-radius: 2px;\n  background: #ffffff;\n  color: #666666;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 16px;\n  transition: all 0.15s ease;\n}\n.popover-close-btn:hover {\n  border-color: #dc3545;\n  color: #dc3545;\n  background: #fff5f5;\n}\n.popover-content {\n  flex: 1;\n  overflow: auto;\n  padding: 8px;\n}\n.popover-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 13px;\n}\n.popover-table thead th {\n  background: #f7f8fa;\n  color: #333333;\n  font-weight: 600;\n  font-size: 12px;\n  text-align: left;\n  padding: 8px 16px;\n  border: none;\n  border-bottom: 2px solid #e0e0e0;\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  white-space: nowrap;\n}\n.popover-table tbody tr {\n  border: none;\n  border-bottom: 1px solid #f0f0f0;\n  transition: background 0.15s ease;\n}\n.popover-table tbody tr:hover {\n  background: #f0f2f5;\n}\n.popover-table tbody tr:last-child {\n  border-bottom: none;\n}\n.popover-table td {\n  padding: 8px 16px;\n  font-size: 12px;\n  color: #333333;\n  vertical-align: middle;\n}\n.note-cell {\n  max-width: 300px;\n  word-wrap: break-word;\n  white-space: pre-wrap;\n}\n.datetime-cell {\n  white-space: nowrap;\n}\n.popover-resize-handle {\n  position: absolute;\n  background: transparent;\n  z-index: 10;\n}\n.popover-resize-handle:hover {\n  background: rgba(102, 126, 234, 0.15);\n}\n.popover-resize-handle-s {\n  bottom: 0;\n  left: 16px;\n  right: 16px;\n  height: 4px;\n  cursor: s-resize;\n}\n.popover-resize-handle-w {\n  top: 16px;\n  bottom: 16px;\n  left: 0;\n  width: 8px;\n  cursor: w-resize;\n}\n.popover-resize-handle-e {\n  top: 16px;\n  bottom: 16px;\n  right: 0;\n  width: 8px;\n  cursor: e-resize;\n}\n.popover-resize-handle-se {\n  bottom: 0;\n  right: 0;\n  width: 16px;\n  height: 16px;\n  cursor: se-resize;\n  z-index: 11;\n  border-radius: 0 0 8px 0;\n}\n/* Empty State Styles - matches QA Report empty state */\n.tracker-empty-state {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n  min-height: 300px;\n  text-align: center;\n  color: #666666;\n  background: #f7f8fa;\n}\n.tracker-empty-state .tracker-empty-icon {\n  font-size: 48px;\n  margin-bottom: 16px;\n  opacity: 0.5;\n}\n.tracker-empty-state .tracker-empty-title {\n  font-size: 16px;\n  font-weight: 600;\n  color: #333333;\n  margin-bottom: 8px;\n}\n.tracker-empty-state .tracker-empty-text {\n  font-size: 13px;\n  color: #666666;\n}\n/* \n * ==========================================================================\n * Legacy Popover Styles (Details Popover)\n * These styles are for the patient details popover that appears\n * when clicking status icons in the Visit Monitor\n * ==========================================================================\n */\n#details-popover {\n  position: fixed;\n  z-index: 100001;\n  width: 800px;\n  max-width: 95vw;\n  max-height: 90vh;\n  background: #fff;\n  border-radius: 8px;\n  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);\n  border: 1px solid #ddd;\n  display: flex;\n  flex-direction: column;\n  opacity: 0;\n  transform: scale(0.95);\n  transition: opacity 0.2s ease-out, transform 0.2s ease-out;\n}\n#details-popover.visible {\n  opacity: 1;\n  transform: scale(1);\n}\n.popover-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 10px 15px;\n  background: #f1f1f1;\n  border-bottom: 1px solid #ddd;\n  flex-shrink: 0;\n  cursor: move;\n}\n.popover-header h4 {\n  margin: 0;\n  font-size: 15px;\n  font-weight: 600;\n}\n.popover-close-btn {\n  background: none;\n  border: none;\n  font-size: 24px;\n  line-height: 1;\n  cursor: pointer;\n  padding: 0 5px;\n  color: #666;\n}\n.popover-content {\n  padding: 5px;\n  overflow-y: auto;\n  flex-grow: 1;\n}\n#details-popover .popover-table {\n  color: #000 !important;\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 12px;\n}\n.popover-table th,\n.popover-table td {\n  border: 1px solid #eee;\n  padding: 6px 8px;\n  text-align: left;\n  white-space: nowrap;\n}\n.popover-table th {\n  background-color: #f9f9f9;\n  position: sticky;\n  top: 0;\n}\n/* Note Cell Styling */\n.popover-table td.note-cell {\n  white-space: normal !important;\n  max-width: 350px;\n  word-wrap: break-word;\n  overflow-wrap: break-word;\n  vertical-align: top;\n}\n/* Authorization Note Table */\n.auth-note-table {\n  width: 100%;\n  border-collapse: collapse;\n  background: #f8f9fa;\n  border: 1px solid #dee2e6;\n  border-radius: 4px;\n  margin-top: 6px;\n  font-size: 11px;\n}\n.auth-note-table th,\n.auth-note-table td {\n  border: 1px solid #dee2e6;\n  padding: 4px 8px;\n  text-align: left;\n  white-space: normal;\n  word-wrap: break-word;\n}\n.auth-note-table th {\n  background: #e9ecef;\n  font-weight: 600;\n  color: #495057;\n}\n.auth-note-table td {\n  color: #212529;\n  background: #fff;\n}\n/* Popover Resize Handle - Legacy (disabled, handled by coordinator-tracker.less) */\n/* \n.popover-resize-handle {\n    position: absolute;\n    right: 0;\n    bottom: 0;\n    width: 16px;\n    height: 16px;\n    cursor: nwse-resize;\n    background: linear-gradient(135deg, transparent 0%, transparent 50%, #999 50%, #999 100%);\n    border-bottom-right-radius: 8px;\n}\n\n.popover-resize-handle::before {\n    content: '';\n    position: absolute;\n    right: 4px;\n    bottom: 4px;\n    width: 4px;\n    height: 4px;\n    background: #666;\n    border-radius: 1px;\n}\n*/\n/* \n * ==========================================================================\n * Phone Tooltip Styles\n * Tooltip that appears when hovering over phone icons in patient rows\n * ==========================================================================\n */\n.phone-icon-wrapper {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n}\n.phone-icon {\n  margin-left: 8px;\n  color: #007bff;\n  cursor: pointer;\n}\n.phone-tooltip {\n  display: none;\n  position: absolute;\n  top: 100%;\n  left: 0;\n  width: 220px;\n  background: #fff;\n  border: 1px solid #ccc;\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);\n  border-radius: 4px;\n  padding: 10px;\n  z-index: 100002;\n}\n.phone-icon-wrapper:hover .phone-tooltip {\n  display: block;\n}\n.phone-tooltip-item {\n  display: flex;\n  justify-content: space-between;\n  padding: 4px 0;\n  border-bottom: 1px solid #f0f0f0;\n  font-size: 12px;\n}\n.phone-tooltip-item:last-child {\n  border-bottom: none;\n}\n.phone-tooltip-item label {\n  font-weight: bold;\n  color: #555;\n  margin-right: 10px;\n}\n.phone-tooltip-item span {\n  color: #000;\n}\n", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/style/prebilling-config-card.less":
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
___CSS_LOADER_EXPORT___.push([module.id, "#prebilling-selector-wrapper {\n  position: relative;\n  display: inline-block;\n}\n#prebilling-config-card {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  margin-top: 8px;\n  width: 380px;\n  max-height: 520px;\n  background: white;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);\n  z-index: 10000;\n  display: none;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  overflow: hidden;\n}\n#prebilling-config-card.show {\n  display: block;\n  animation: slideDown 0.2s ease-out;\n}\n@keyframes slideDown {\n  from {\n    opacity: 0;\n    transform: translateY(-10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n#prebilling-config-card .config-card-header {\n  padding: 12px 16px;\n  border-bottom: 1px solid #eee;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  border-radius: 8px 8px 0 0;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n#prebilling-config-card .config-card-header h3 {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: white;\n}\n#prebilling-config-card .config-card-header .config-close-btn {\n  background: transparent;\n  border: none;\n  color: white;\n  font-size: 20px;\n  cursor: pointer;\n  padding: 0 4px;\n  line-height: 1;\n  opacity: 0.8;\n  transition: opacity 0.2s;\n}\n#prebilling-config-card .config-card-header .config-close-btn:hover {\n  opacity: 1;\n}\n#prebilling-config-card .config-card-body {\n  padding: 16px;\n}\n#prebilling-config-card .config-card-body > label {\n  display: block;\n  margin-bottom: 8px;\n  font-weight: 600;\n  font-size: 13px;\n  color: #333;\n}\n#prebilling-config-card .config-card-body .config-search-input {\n  width: 100%;\n  padding: 10px 12px;\n  border: 1px solid #ddd;\n  border-radius: 6px;\n  margin-bottom: 12px;\n  font-size: 13px;\n  box-sizing: border-box;\n  transition: border-color 0.2s, box-shadow 0.2s;\n}\n#prebilling-config-card .config-card-body .config-search-input:focus {\n  outline: none;\n  border-color: #667eea;\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);\n}\n#prebilling-config-card .config-card-body .config-search-input::placeholder {\n  color: #999;\n}\n#prebilling-config-card .config-card-body .coordinator-list {\n  max-height: 280px;\n  overflow-y: auto;\n  border: 1px solid #eee;\n  border-radius: 6px;\n  padding: 8px;\n  background: #fafafa;\n}\n#prebilling-config-card .config-card-body .coordinator-list::-webkit-scrollbar {\n  width: 6px;\n}\n#prebilling-config-card .config-card-body .coordinator-list::-webkit-scrollbar-track {\n  background: #f1f1f1;\n  border-radius: 3px;\n}\n#prebilling-config-card .config-card-body .coordinator-list::-webkit-scrollbar-thumb {\n  background: #c1c1c1;\n  border-radius: 3px;\n}\n#prebilling-config-card .config-card-body .coordinator-list::-webkit-scrollbar-thumb:hover {\n  background: #999;\n}\n#prebilling-config-card .config-card-body .coordinator-list .coordinator-option {\n  padding: 8px 10px;\n  cursor: pointer;\n  border-radius: 4px;\n  margin-bottom: 2px;\n  display: flex;\n  align-items: center;\n  transition: background 0.15s;\n}\n#prebilling-config-card .config-card-body .coordinator-list .coordinator-option:hover {\n  background: #e8f0fe;\n}\n#prebilling-config-card .config-card-body .coordinator-list .coordinator-option:last-child {\n  margin-bottom: 0;\n}\n#prebilling-config-card .config-card-body .coordinator-list .coordinator-option input[type=\"checkbox\"] {\n  margin-right: 10px;\n  width: 16px;\n  height: 16px;\n  cursor: pointer;\n  accent-color: #667eea;\n}\n#prebilling-config-card .config-card-body .coordinator-list .coordinator-option label {\n  cursor: pointer;\n  font-size: 12px;\n  color: #333;\n  margin: 0;\n  flex: 1;\n  line-height: 1.4;\n  word-break: break-word;\n}\n#prebilling-config-card .config-card-body .config-summary {\n  margin-top: 12px;\n  font-size: 12px;\n  color: #666;\n  text-align: right;\n}\n#prebilling-config-card .config-card-body .config-summary span {\n  font-weight: 700;\n  color: #667eea;\n  font-size: 14px;\n}\n#prebilling-config-card .config-card-footer {\n  padding: 12px 16px;\n  border-top: 1px solid #eee;\n  display: flex;\n  gap: 10px;\n  background: #f8f9fa;\n}\n#prebilling-config-card .config-card-footer button {\n  flex: 1;\n  padding: 10px 16px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 13px;\n  font-weight: 500;\n  transition: all 0.2s;\n}\n#prebilling-config-card .config-card-footer button.btn-primary {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n}\n#prebilling-config-card .config-card-footer button.btn-primary:hover {\n  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);\n  transform: translateY(-1px);\n}\n#prebilling-config-card .config-card-footer button.btn-primary:active {\n  transform: translateY(0);\n}\n#prebilling-config-card .config-card-footer button.btn-secondary {\n  background: #e9ecef;\n  color: #495057;\n}\n#prebilling-config-card .config-card-footer button.btn-secondary:hover {\n  background: #dee2e6;\n}\n.prebilling-selector-btn {\n  transition: all 0.2s !important;\n}\n.prebilling-selector-btn:hover {\n  background: #f0f8ff !important;\n  border-color: #667eea !important;\n}\n", ""]);
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

/***/ "./node_modules/css-loader/dist/runtime/getUrl.js":
/***/ ((module) => {



module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url.default : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
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

/***/ }),

/***/ "./src/js/services/CleaningOverlay.ts":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CleaningOverlay: () => (/* binding */ CleaningOverlay)
/* harmony export */ });
/**
 * CleaningOverlay Service
 * Epic 11, Story 4: 清理蒙版和进度显示
 *
 * 功能：
 * - 确认对话框（清理前确认）
 * - 半透明蒙版（rgba(0,0,0,0.15) + blur）
 * - 进度条和当前任务信息
 * - 成功/错误状态显示
 *
 * 注意：使用内联样式确保在任何DOM上下文下都能正确显示
 */
// 内联样式常量
const OVERLAY_STYLES = `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(2px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
`;
const MODAL_STYLES = `
  background: white;
  padding: 30px 40px;
  border-radius: 12px;
  text-align: center;
  min-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;
const ICON_STYLES = `
  font-size: 48px;
  margin-bottom: 15px;
`;
const TITLE_STYLES = `
  margin: 0 0 10px;
  font-size: 20px;
  color: #333;
`;
const TEXT_STYLES = `
  margin: 0;
  color: #666;
  font-size: 14px;
`;
const WARNING_STYLES = `
  color: #ff9800;
  font-size: 14px;
  margin-top: 15px;
  font-weight: 500;
`;
const PROGRESS_BAR_STYLES = `
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
`;
const PROGRESS_FILL_STYLES = `
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
`;
const BTN_PRIMARY_STYLES = `
  margin-top: 20px;
  padding: 10px 30px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
`;
const BTN_CANCEL_STYLES = `
  padding: 10px 24px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
`;
const BTN_CONFIRM_STYLES = `
  padding: 10px 24px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
`;
const DIALOG_BUTTONS_STYLES = `
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
`;
class CleaningOverlay {
    /**
     * 显示确认对话框
     * @returns Promise<boolean> - 用户是否确认
     */
    static showConfirmDialog(taskCount, pageType) {
        return new Promise((resolve) => {
            // 移除可能存在的旧蒙版
            this.hide();
            const overlay = document.createElement("div");
            overlay.id = this.overlayId;
            overlay.style.cssText = OVERLAY_STYLES;
            const typeLabel = pageType === "PREBILLING" ? "POC Compliance" : "Duplicate Call";
            overlay.innerHTML = `
        <div style="${MODAL_STYLES}">
          <div style="${ICON_STYLES}">⚠️</div>
          <h3 style="${TITLE_STYLES}">确认清理</h3>
          <p style="${TEXT_STYLES}">即将清理 <strong>${taskCount}</strong> 个 ${typeLabel} 问题</p>
          <p style="${WARNING_STYLES}">清理过程中请勿操作页面</p>
          <div style="${DIALOG_BUTTONS_STYLES}">
            <button id="hha-overlay-btn-cancel" style="${BTN_CANCEL_STYLES}">取消</button>
            <button id="hha-overlay-btn-confirm" style="${BTN_CONFIRM_STYLES}">确认清理</button>
          </div>
        </div>
      `;
            document.body.appendChild(overlay);
            console.log("[CleaningOverlay] Confirmation dialog appended to body");
            // 事件处理
            document
                .getElementById("hha-overlay-btn-cancel")
                ?.addEventListener("click", () => {
                overlay.remove();
                resolve(false);
            });
            document
                .getElementById("hha-overlay-btn-confirm")
                ?.addEventListener("click", () => {
                overlay.remove();
                resolve(true);
            });
        });
    }
    /**
     * 显示清理进度蒙版
     */
    static show(current, total, taskInfo) {
        // 如果已存在，先移除
        this.hide();
        const overlay = document.createElement("div");
        overlay.id = this.overlayId;
        overlay.style.cssText = OVERLAY_STYLES;
        const percentage = Math.round((current / total) * 100);
        overlay.innerHTML = `
      <div style="${MODAL_STYLES}" id="hha-cleaning-modal">
        <div style="${ICON_STYLES} animation: spin 1s linear infinite;">⏳</div>
        <h3 id="cleaning-status" style="${TITLE_STYLES}">正在执行清理中 (${current}/${total})</h3>
        <p id="cleaning-current-task" style="${TEXT_STYLES}">正在处理: ${taskInfo}</p>
        <div style="${PROGRESS_BAR_STYLES}">
          <div id="hha-progress-fill" style="${PROGRESS_FILL_STYLES} width: ${percentage}%;"></div>
        </div>
        <p style="${WARNING_STYLES}">⚠️ 请勿操作页面，清理完成后将自动关闭</p>
      </div>
      <style>
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    `;
        document.body.appendChild(overlay);
        console.log("[CleaningOverlay] Progress overlay shown");
    }
    /**
     * 更新进度
     */
    static update(current, total, taskInfo) {
        const statusEl = document.getElementById("cleaning-status");
        const taskEl = document.getElementById("cleaning-current-task");
        const progressEl = document.getElementById("hha-progress-fill");
        if (statusEl) {
            statusEl.textContent = `正在执行清理中 (${current}/${total})`;
        }
        if (taskEl) {
            taskEl.textContent = `正在处理: ${taskInfo}`;
        }
        if (progressEl) {
            const percentage = Math.round((current / total) * 100);
            progressEl.style.width = `${percentage}%`;
        }
    }
    /**
     * 显示完成状态
     */
    static showComplete(pageType) {
        const overlay = document.getElementById(this.overlayId);
        if (!overlay) {
            // 如果不存在，创建一个
            this.show(1, 1, "");
        }
        const modal = document.getElementById("hha-cleaning-modal");
        if (!modal)
            return;
        const message = pageType === "PREBILLING"
            ? "🎉 恭喜，当前页面已清空 POC 问题！"
            : "🎉 恭喜，当前页面已清空 Duplicate Call 问题！";
        modal.innerHTML = `
      <div style="${ICON_STYLES} color: #4CAF50;">✅</div>
      <h3 style="${TITLE_STYLES}">${message}</h3>
      <p style="${TEXT_STYLES} margin-top: 10px;">所有符合条件的问题已处理完成</p>
      <button id="btn-close-overlay" style="${BTN_PRIMARY_STYLES}">关闭</button>
    `;
        document
            .getElementById("btn-close-overlay")
            ?.addEventListener("click", () => {
            this.hide();
        });
    }
    /**
     * 显示错误状态
     */
    static showError(message) {
        const modal = document.getElementById("hha-cleaning-modal");
        if (!modal)
            return;
        modal.innerHTML = `
      <div style="${ICON_STYLES} color: #e53935;">❌</div>
      <h3 style="${TITLE_STYLES}">清理过程中出错</h3>
      <p style="${TEXT_STYLES} color: #e53935; margin-top: 10px;">${message}</p>
      <button id="btn-close-overlay" style="${BTN_PRIMARY_STYLES}">关闭</button>
    `;
        document
            .getElementById("btn-close-overlay")
            ?.addEventListener("click", () => {
            this.hide();
        });
    }
    /**
     * 隐藏蒙版
     */
    static hide() {
        document.getElementById(this.overlayId)?.remove();
    }
    /**
     * 检查蒙版是否存在
     */
    static isVisible() {
        return document.getElementById(this.overlayId) !== null;
    }
}
CleaningOverlay.overlayId = "hha-cleaning-overlay";


/***/ }),

/***/ "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 12 12\"%3E%3Cpath fill=\"%23666\" d=\"M6 9L1 4h10z\"/%3E%3C/svg%3E":
/***/ ((module) => {

module.exports = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 12 12\"%3E%3Cpath fill=\"%23666\" d=\"M6 9L1 4h10z\"/%3E%3C/svg%3E";

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
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
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
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			792: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
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
const util_fetch = (url, options = {}) => {
  console.log(
    "Fetching url " + url.substring(0, 200) + (url.length > 200 ? "..." : "")
  );

  return new Promise((resolve, reject) => {
    const req = util_fetch(
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
  direction = "left",
  conditionFunc = null, // 自定义条件函数
  iframeSelector = null // 新增：iframe 选择器（如 '#ctl00_ContentPlaceHolder1_iframemsg'）
) => {
  // let intervalbtnGroup: string | number | NodeJS.Timer;
  let $btnGroup;

  setInterval(() => {
    // 获取查询上下文（主页面或 iframe）
    let context = document;
    if (iframeSelector) {
      const iframe = document.querySelector(iframeSelector);
      if (iframe && iframe.contentDocument) {
        context = iframe.contentDocument;
      } else {
        // iframe 还未加载，跳过本次检查
        return;
      }
    }

    // 在正确的上下文中查询原始按钮
    $btnGroup = $(originBtnSelector, context).parent();

    // 检查自定义条件（如果提供）
    const shouldShow = conditionFunc ? conditionFunc() : true;

    // 检查按钮是否已存在（在相同上下文中查询）
    const existingBtn = $(elId, context);

    // 如果条件不满足，隐藏已存在的按钮
    if (!shouldShow && existingBtn.length > 0) {
      existingBtn.hide();
      return;
    }

    // 如果条件满足，显示已存在的按钮
    if (shouldShow && existingBtn.length > 0) {
      existingBtn.show();
    }

    if ($btnGroup && existingBtn.length <= 0 && shouldShow) {
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


const POCResolver = async () => {
    console.log("clicked");
    POCTick();
    await POCReasonChooser();
    $(visitNotesSelector).val("task does not match plan of care");
    $(visitNotesSelector)[0].dispatchEvent(new Event("change"));
    // 如果需要验证（有星号标记），则填写验证信息
    if ($(visitVerifyStarSelector).length > 0) {
        // 点击 Caregiver 复选框
        $(visitAuditCaregiverSelector).trigger("click");
        /*     // 填写 Date Verified 字段（MM/DD/YYYY 格式）
            const dateVerifiedInput = document.getElementById(
              "uxtxtDateVerified"
            ) as HTMLInputElement;
            if (dateVerifiedInput) {
              const today = new Date();
              const month = String(today.getMonth() + 1).padStart(2, "0");
              const day = String(today.getDate()).padStart(2, "0");
              const year = today.getFullYear();
              const dateStr = `${month}/${day}/${year}`;
              dateVerifiedInput.value = dateStr;
              dateVerifiedInput.dispatchEvent(new Event("change", { bubbles: true }));
              console.log("[POCResolver] Date Verified set to:", dateStr);
            }
        
            // 填写 Time Verified 字段（HHmm 格式，如 1430）
            const timeVerifiedInput = document.getElementById(
              "uxtxttimeVerified"
            ) as HTMLInputElement;
            if (timeVerifiedInput) {
              const now = new Date();
              const hours = String(now.getHours()).padStart(2, "0");
              const minutes = String(now.getMinutes()).padStart(2, "0");
              const timeStr = `${hours}${minutes}`;
              timeVerifiedInput.value = timeStr;
              timeVerifiedInput.dispatchEvent(new Event("change", { bubbles: true }));
              console.log("[POCResolver] Time Verified set to:", timeStr);
            } */
    }
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
    // Wait for the second dropdown (Action) to populate
    if (flag) {
        flag = false;
        let maxRetries = 20; // 10 seconds
        while (maxRetries > 0) {
            if ($(visitActionOptionSelector).length > 1) {
                // > 1 assuming "Select" proper options
                break;
            }
            await sleep(500);
            maxRetries--;
        }
    }
    let select2 = $(visitActionSelector);
    // Ensure we re-query options after wait
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

const createNewQA = async () => await messageHandler("Quality Assurance", "Quality call made to pt, confirmed pt has not been admitted to hospital or rehab within the last 30 days. Pt is satisfied with current aide and or hours OR pt is interested in increase");
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

// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/style/prebilling-config-card.less
var prebilling_config_card = __webpack_require__("./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/style/prebilling-config-card.less");
;// ./src/style/prebilling-config-card.less

      
      
      
      
      
      
      
      
      

var prebilling_config_card_options = {};

prebilling_config_card_options.styleTagTransform = (styleTagTransform_default());
prebilling_config_card_options.setAttributes = (setAttributesWithoutAttributes_default());

      prebilling_config_card_options.insert = insertBySelector_default().bind(null, "head");
    
prebilling_config_card_options.domAPI = (styleDomAPI_default());
prebilling_config_card_options.insertStyleElement = (insertStyleElement_default());

var prebilling_config_card_update = injectStylesIntoStyleTag_default()(prebilling_config_card/* default */.A, prebilling_config_card_options);




       /* harmony default export */ const style_prebilling_config_card = (prebilling_config_card/* default */.A && prebilling_config_card/* default */.A.locals ? prebilling_config_card/* default */.A.locals : undefined);

;// ./src/js/Prebilling.ts



// ============================================================================
// Prebilling Selector - 配置化功能 (Epic-3)
// ============================================================================
// 获取页面上的 jQuery (UserScript 沙箱环境需要 unsafeWindow)
const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
const page$ = pageWindow.$;
// GM_storage key（使用 Tampermonkey 的持久化存储，不受网站 logout 影响）
const PREBILLING_CONFIG_KEY = "hha_prebilling_config";
// 默认 Coordinator IDs（向后兼容：Tao Yang）
const DEFAULT_COORDINATOR_IDS = ["75207"];
// 默认 Discipline IDs (Non Skilled=-1, PCA=-2, HHA=1)
const DEFAULT_DISCIPLINE_IDS = ["-1", "-2", "1"];
// 默认配置对象
const DEFAULT_CONFIG = {
    coordinators: DEFAULT_COORDINATOR_IDS,
    disciplines: DEFAULT_DISCIPLINE_IDS,
    lastUpdated: Date.now(),
};
// 内存存储 fallback（当 GM_storage 不可用时）
let memoryConfigFallback = null;
// 元素选择器
const COORDINATOR_SELECT_ID = "ddlCoordinatorMul";
const COORDINATOR_HIDDEN_ID = "ctl00_ContentPlaceHolder1_hdCoordinatorMul";
const DISCIPLINE_SELECT_ID = "ddlDiscipline";
const DISCIPLINE_HIDDEN_ID = "ctl00_ContentPlaceHolder1_hdDiscipline";
/**
 * 检测 GM_storage API 是否可用
 */
function isGMStorageAvailable() {
    return typeof GM_setValue === "function" && typeof GM_getValue === "function";
}
/**
 * 检测 multipleSelect 插件是否可用
 */
function isMultipleSelectAvailable() {
    return (typeof page$ !== "undefined" &&
        page$ !== null &&
        typeof page$.fn !== "undefined" &&
        typeof page$.fn.multipleSelect === "function");
}
/**
 * 获取当前保存的配置
 * 优先从 GM_storage 读取，若不可用则从内存 fallback 读取
 * 使用 GM_storage 替代 localStorage，因为网站 logout 会清除 localStorage
 */
function getPrebillingConfig() {
    // 优先尝试 GM_storage（Tampermonkey 持久化存储，不受网站影响）
    if (isGMStorageAvailable()) {
        try {
            const stored = GM_getValue(PREBILLING_CONFIG_KEY, null);
            if (stored) {
                const parsed = JSON.parse(stored);
                // 验证配置数据结构完整性
                if (parsed.coordinators && parsed.disciplines) {
                    console.log("[Prebilling] Config loaded from GM_storage:", parsed);
                    return parsed;
                }
                console.warn("[Prebilling] Config data incomplete, using default");
            }
        }
        catch (e) {
            console.warn("[Prebilling] Failed to parse config from GM_storage:", e);
        }
    }
    else {
        // GM_storage 不可用，使用内存 fallback
        if (memoryConfigFallback) {
            console.log("[Prebilling] Config loaded from memory fallback:", memoryConfigFallback);
            return memoryConfigFallback;
        }
        console.warn("[Prebilling] GM_storage unavailable, using default config");
    }
    // 返回默认配置的副本
    return { ...DEFAULT_CONFIG, lastUpdated: Date.now() };
}
/**
 * 保存配置
 * 优先保存到 GM_storage，若不可用则保存到内存 fallback
 */
function savePrebillingConfig(config) {
    const current = getPrebillingConfig();
    const updated = {
        ...current,
        ...config,
        lastUpdated: Date.now(),
    };
    if (isGMStorageAvailable()) {
        try {
            GM_setValue(PREBILLING_CONFIG_KEY, JSON.stringify(updated));
            console.log("[Prebilling] Config saved to GM_storage:", updated);
        }
        catch (e) {
            console.error("[Prebilling] Failed to save config to GM_storage:", e);
            // 降级到内存存储
            memoryConfigFallback = updated;
            console.log("[Prebilling] Config saved to memory fallback:", updated);
        }
    }
    else {
        // GM_storage 不可用，保存到内存
        memoryConfigFallback = updated;
        console.log("[Prebilling] Config saved to memory fallback:", updated);
    }
}
/**
 * 初始化配置
 * 首次使用时保存默认配置，确保配置存在
 */
function initPrebillingConfig() {
    // 检查是否已存在配置
    if (isGMStorageAvailable()) {
        const existing = GM_getValue(PREBILLING_CONFIG_KEY, null);
        if (existing) {
            try {
                const parsed = JSON.parse(existing);
                if (parsed.coordinators && parsed.disciplines) {
                    console.log("[Prebilling] Existing config found:", parsed);
                    return parsed;
                }
            }
            catch (e) {
                console.warn("[Prebilling] Existing config corrupted, resetting");
            }
        }
    }
    else if (memoryConfigFallback) {
        console.log("[Prebilling] Using existing memory fallback config:", memoryConfigFallback);
        return memoryConfigFallback;
    }
    // 保存默认配置
    const defaultConfig = { ...DEFAULT_CONFIG, lastUpdated: Date.now() };
    savePrebillingConfig(defaultConfig);
    console.log("[Prebilling] Default config initialized:", defaultConfig);
    return defaultConfig;
}
/**
 * 重置配置为默认值
 */
function resetPrebillingConfig() {
    const defaultConfig = { ...DEFAULT_CONFIG, lastUpdated: Date.now() };
    savePrebillingConfig(defaultConfig);
    console.log("[Prebilling] Config reset to default:", defaultConfig);
    return defaultConfig;
}
/**
 * 获取所有可用的 Coordinator 选项
 * 使用原生 DOM API 避免触发 jQuery/multipleSelect 的事件
 */
function getCoordinatorOptions() {
    const options = [];
    // 使用原生 DOM API 而不是 jQuery，避免触发任何插件事件
    const selectEl = document.getElementById(COORDINATOR_SELECT_ID);
    if (!selectEl) {
        console.warn("[Prebilling] Coordinator select not found");
        return options;
    }
    // 直接遍历原生 option 元素
    const optionEls = selectEl.querySelectorAll("option");
    optionEls.forEach((opt) => {
        const value = opt.value;
        const text = opt.textContent || "";
        if (value && value !== "") {
            options.push({ value, text });
        }
    });
    return options;
}
/**
 * 使用 multipleSelect API 选择 Coordinator
 * @param coordinatorIds - 要选择的 Coordinator ID 数组
 */
function selectCoordinatorByAPI(coordinatorIds) {
    const $select = page$(`#${COORDINATOR_SELECT_ID}`);
    if (!$select || $select.length === 0) {
        console.error("[Prebilling] Coordinator select element not found");
        return false;
    }
    if (!isMultipleSelectAvailable()) {
        console.error("[Prebilling] multipleSelect plugin not available");
        return false;
    }
    try {
        // 1. 清空所有选择
        $select.multipleSelect("uncheckAll");
        // 2. 设置指定的 coordinator
        $select.multipleSelect("setSelects", coordinatorIds);
        // 3. 关键修复：启用 multipleSelect 控件
        // 页面的 GetSelectedIDsJSON() 函数检查 isEnabled 状态
        // 如果 isEnabled 为 false，它会返回 null 而不是实际选择的值
        // 这会导致搜索时 CoordinatorMulFrm:"null"，忽略 coordinator 过滤
        $select.multipleSelect("enable");
        // 4. 同步更新隐藏字段
        const hdCoord = document.getElementById(COORDINATOR_HIDDEN_ID);
        if (hdCoord) {
            hdCoord.value = coordinatorIds.join(",");
        }
        console.log("[Prebilling] Coordinator selected and enabled:", coordinatorIds);
        return true;
    }
    catch (e) {
        console.error("[Prebilling] Failed to set coordinator:", e);
        return false;
    }
}
/**
 * 使用 multipleSelect API 选择 Discipline
 * @param disciplineIds - 要选择的 Discipline ID 数组
 */
function selectDisciplineByAPI(disciplineIds) {
    const $select = page$(`#${DISCIPLINE_SELECT_ID}`);
    if (!$select || $select.length === 0) {
        console.error("[Prebilling] Discipline select element not found");
        return false;
    }
    if (!isMultipleSelectAvailable()) {
        console.error("[Prebilling] multipleSelect plugin not available");
        return false;
    }
    try {
        // 1. 清空所有选择
        $select.multipleSelect("uncheckAll");
        // 2. 设置指定的 discipline
        $select.multipleSelect("setSelects", disciplineIds);
        // 3. 关键修复：启用 multipleSelect 控件
        // 页面的 GetSelectedIDsJSON() 函数检查 isEnabled 状态
        // 如果 isEnabled 为 false，它会返回 null 而不是实际选择的值
        $select.multipleSelect("enable");
        // 4. 同步更新隐藏字段
        const hdDiscipline = document.getElementById(DISCIPLINE_HIDDEN_ID);
        if (hdDiscipline) {
            hdDiscipline.value = disciplineIds.join(",");
        }
        console.log("[Prebilling] Discipline selected and enabled:", disciplineIds);
        return true;
    }
    catch (e) {
        console.error("[Prebilling] Failed to set discipline:", e);
        return false;
    }
}
/**
 * Prebilling Selector 主函数
 * 使用 multipleSelect API 设置筛选条件并执行搜索
 */
const prebillingSelector = async () => {
    // 初始化配置（确保配置存在）
    initPrebillingConfig();
    // 设置日期为昨天
    page$(prebillingToDateSelector).val(getYesterdayFormatted());
    // 加载配置
    const config = getPrebillingConfig();
    // 使用 API 设置 Discipline（无需展开面板，直接通过 API 操作）
    selectDisciplineByAPI(config.disciplines);
    // 使用 API 设置 Coordinator（无需展开面板，直接通过 API 操作）
    selectCoordinatorByAPI(config.coordinators);
    // 等待 UI 更新
    await sleep(100);
    // 点击搜索
    page$(prebillingSearchButtonSelector)[0].click();
    // 保持高级筛选展开状态（不再收起，避免闪烁）
    // await sleep(100);
    // page$(prebillingAdvancedFilterButtonSelector)[0].click();
    console.log("[Prebilling] Search executed with config:", config);
};
// ============================================================================
// Story 3: Hover 配置卡片 UI
// ============================================================================
/** 临时选中的 coordinator IDs（用于配置卡片中的选择状态） */
let tempSelectedCoordinators = [];
/**
 * 创建配置卡片 DOM 结构
 */
function createConfigCardDOM() {
    const card = document.createElement("div");
    card.id = "prebilling-config-card";
    card.innerHTML = `
    <div class="config-card-header">
      <h3>📋 Prebilling Selector 配置</h3>
      <button class="config-close-btn" id="config-close-x">×</button>
    </div>
    <div class="config-card-body">
      <label>Coordinator 选择:</label>
      <input 
        type="text" 
        id="coordinator-search" 
        placeholder="🔍 搜索 coordinator..."
        class="config-search-input"
      />
      <div class="coordinator-list" id="coordinator-options">
        <!-- 动态生成 checkbox 列表 -->
      </div>
      <div class="config-summary">
        已选择: <span id="selected-count">0</span> 个 coordinator
      </div>
    </div>
    <div class="config-card-footer">
      <button id="save-config-btn" class="btn-primary">💾 保存配置</button>
      <button id="cancel-config-btn" class="btn-secondary">❌ 取消</button>
    </div>
  `;
    return card;
}
/**
 * 渲染 coordinator 列表到配置卡片
 */
function renderCoordinatorList(options, selectedIds) {
    const container = document.getElementById("coordinator-options");
    if (!container)
        return;
    container.innerHTML = "";
    options.forEach((opt) => {
        const checked = selectedIds.includes(opt.value) ? "checked" : "";
        const div = document.createElement("div");
        div.className = "coordinator-option";
        div.innerHTML = `
      <input 
        type="checkbox" 
        id="coord-${opt.value}" 
        value="${opt.value}"
        ${checked}
      />
      <label for="coord-${opt.value}">${opt.text}</label>
    `;
        container.appendChild(div);
    });
    updateSelectedCount();
}
/**
 * 更新已选择的 coordinator 数量显示
 */
function updateSelectedCount() {
    const checkboxes = document.querySelectorAll("#coordinator-options input[type='checkbox']:checked");
    const countEl = document.getElementById("selected-count");
    if (countEl) {
        countEl.textContent = String(checkboxes.length);
    }
}
/**
 * 搜索过滤 coordinator 列表
 */
function filterCoordinators(searchTerm) {
    const term = searchTerm.toLowerCase();
    const options = document.querySelectorAll(".coordinator-option");
    options.forEach((opt) => {
        const text = opt.textContent?.toLowerCase() || "";
        opt.style.display = text.includes(term) ? "" : "none";
    });
}
/**
 * 显示配置卡片
 */
function showConfigCard() {
    const card = document.getElementById("prebilling-config-card");
    if (card) {
        // 加载当前配置
        const config = getPrebillingConfig();
        tempSelectedCoordinators = [...config.coordinators];
        // 检查页面组件是否已完全加载（选项已填充）
        const options = getCoordinatorOptions();
        if (options.length === 0) {
            // 组件还在加载中，显示加载提示
            const container = document.getElementById("coordinator-options");
            if (container) {
                container.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #666;">
            ⏳ 正在加载 Coordinator 列表...<br/>
            <small>请稍后再试，或等待页面完全加载后再打开此配置卡片</small>
          </div>
        `;
            }
        }
        else {
            // 组件已加载，渲染列表
            renderCoordinatorList(options, tempSelectedCoordinators);
        }
        // 清空搜索框
        const searchInput = document.getElementById("coordinator-search");
        if (searchInput) {
            searchInput.value = "";
        }
        card.classList.add("show");
        console.log("[Prebilling] Config card shown");
    }
}
/**
 * 隐藏配置卡片
 */
function hideConfigCard() {
    const card = document.getElementById("prebilling-config-card");
    if (card) {
        card.classList.remove("show");
        console.log("[Prebilling] Config card hidden");
    }
}
/**
 * 保存配置卡片中的选择
 */
function saveConfigFromCard() {
    const selectedIds = [];
    const checkboxes = document.querySelectorAll("#coordinator-options input[type='checkbox']:checked");
    checkboxes.forEach((cb) => {
        selectedIds.push(cb.value);
    });
    if (selectedIds.length === 0) {
        alert("⚠️ 请至少选择一个 Coordinator");
        return;
    }
    // 只保存到 GM_storage，不修改页面组件
    // 配置会在用户点击搜索按钮时应用
    savePrebillingConfig({ coordinators: selectedIds });
    hideConfigCard();
    // 更新按钮文字显示选中数量
    updateButtonText(selectedIds.length);
    // 显示保存成功提示
    console.log(`[Prebilling] Config saved! Selected ${selectedIds.length} coordinators:`, selectedIds);
}
/**
 * 更新按钮文字
 */
function updateButtonText(count) {
    const btn = document.getElementById("prebillingSelector");
    if (btn) {
        btn.value = `Search by Coordinator(s) [${count}]`;
    }
}
/**
 * 初始化配置卡片事件监听
 */
function initConfigCardEvents() {
    let hoverTimer = null;
    let isCardHovered = false;
    const btn = document.querySelector(".prebilling-selector-btn");
    const card = document.getElementById("prebilling-config-card");
    if (!btn || !card) {
        console.warn("[Prebilling] Button or card not found for event binding");
        return;
    }
    // 按钮 hover 显示卡片
    btn.addEventListener("mouseenter", () => {
        hoverTimer = window.setTimeout(() => {
            showConfigCard();
        }, 300);
    });
    btn.addEventListener("mouseleave", () => {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
        // 延迟检查是否应该隐藏卡片
        setTimeout(() => {
            if (!isCardHovered) {
                hideConfigCard();
            }
        }, 200);
    });
    // 卡片 hover 保持显示
    card.addEventListener("mouseenter", () => {
        isCardHovered = true;
    });
    card.addEventListener("mouseleave", () => {
        isCardHovered = false;
        setTimeout(() => {
            if (!isCardHovered) {
                hideConfigCard();
            }
        }, 200);
    });
    // 搜索框输入过滤
    const searchInput = document.getElementById("coordinator-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            filterCoordinators(e.target.value);
        });
    }
    // Checkbox 变化更新计数
    const optionsContainer = document.getElementById("coordinator-options");
    if (optionsContainer) {
        optionsContainer.addEventListener("change", (e) => {
            if (e.target.tagName === "INPUT") {
                updateSelectedCount();
            }
        });
    }
    // 保存按钮
    const saveBtn = document.getElementById("save-config-btn");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            saveConfigFromCard();
        });
    }
    // 取消按钮
    const cancelBtn = document.getElementById("cancel-config-btn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            hideConfigCard();
        });
    }
    // 关闭 X 按钮
    const closeBtn = document.getElementById("config-close-x");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            hideConfigCard();
        });
    }
    console.log("[Prebilling] Config card events initialized");
}
/**
 * 初始化配置卡片 UI
 * 在按钮插入后调用
 */
function initConfigCardUI() {
    // 等待按钮存在
    const checkBtn = setInterval(() => {
        const btn = document.querySelector(".prebilling-selector-btn");
        if (btn) {
            clearInterval(checkBtn);
            // 创建包装容器
            const wrapper = document.createElement("div");
            wrapper.id = "prebilling-selector-wrapper";
            wrapper.style.cssText = "position: relative; display: inline-block;";
            // 将按钮移入容器
            btn.parentNode?.insertBefore(wrapper, btn);
            wrapper.appendChild(btn);
            // 创建配置卡片并添加到容器
            const card = createConfigCardDOM();
            wrapper.appendChild(card);
            // 初始化事件
            initConfigCardEvents();
            // 更新按钮文字显示当前配置的 coordinator 数量
            const config = getPrebillingConfig();
            updateButtonText(config.coordinators.length);
            // 修复 multipleSelect UI 不刷新的问题（Bug 2 fix）
            // 在某些情况下（如 bfcache 恢复），multipleSelect 显示层不会自动更新
            fixMultipleSelectUI();
            console.log("[Prebilling] Config card UI initialized");
        }
    }, 500);
    // 10 秒后停止检查
    setTimeout(() => clearInterval(checkBtn), 10000);
}
/**
 * 修复 multipleSelect 组件 UI 不刷新的问题，并重新应用保存的配置
 * 当页面从 bfcache 恢复或刷新时：
 * 1. 刷新 multipleSelect UI 显示层
 * 2. 重新应用用户保存的 coordinator 和 discipline 配置
 */
function fixMultipleSelectUI() {
    // 延迟执行，等待页面完全加载
    setTimeout(() => {
        if (!isMultipleSelectAvailable()) {
            console.log("[Prebilling] multipleSelect not available, skipping UI fix");
            return;
        }
        try {
            // 1. 先刷新主要的 multipleSelect 组件 UI
            const selectIds = [
                "ddlContract",
                "ddlCoordinatorMul",
                "ddlDiscipline",
                "ddlPatientTeam",
                "ddlPatientLocation",
            ];
            selectIds.forEach((id) => {
                const $select = page$(`#${id}`);
                if ($select && $select.length > 0) {
                    try {
                        $select.multipleSelect("refresh");
                    }
                    catch (e) {
                        // 某些组件可能还没初始化，忽略错误
                    }
                }
            });
            console.log("[Prebilling] multipleSelect UI refresh completed");
            // 2. 重新应用保存的配置（关键修复！）
            // 页面刷新后，组件会恢复到默认的 "All selected" 状态
            // 我们需要重新设置用户保存的 coordinator 和 discipline 选择
            const config = getPrebillingConfig();
            // 应用 Coordinator 配置
            if (config.coordinators && config.coordinators.length > 0) {
                selectCoordinatorByAPI(config.coordinators);
                console.log("[Prebilling] Coordinator config re-applied:", config.coordinators);
            }
            // 应用 Discipline 配置
            if (config.disciplines && config.disciplines.length > 0) {
                selectDisciplineByAPI(config.disciplines);
                console.log("[Prebilling] Discipline config re-applied:", config.disciplines);
            }
            // 更新按钮显示
            updateButtonText(config.coordinators.length);
        }
        catch (e) {
            console.warn("[Prebilling] Failed to fix multipleSelect UI:", e);
        }
    }, 1500); // 延迟 1.5 秒，确保页面 AJAX 数据已加载
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


// ==================== 常量定义 ====================
/** Active 状态列表 (包括 Hospitalized，因为需要同等关注) */
const ACTIVE_STATUSES = [
    "Active",
    "Hospitalized",
];
/** Non-Active 状态列表 */
const NON_ACTIVE_STATUSES = [
    "Discharged",
    "Hold",
    "Waiting",
];
// ==================== 配置区域 ====================
const AIDE_SEARCH_URL = "https://app.hhaexchange.com/ENT2507010000/Aide/AideSearchXSLT_ns.aspx?FirstName=&Phone=";
const AIDE_SEARCH_PARAMS = "&LastName=&Type=-1&Discipline=-1&CaregiverCode=&ALtCaregiverCode=&Status=-1&SSN=&CaregiverTeamID=-1&FromVisitEdit=0&CaregiverLocationID=-1&CaregiverBranchID=-1&VisitDate=&office=469,5137,5139,6475,14849&DOB=&pg=1&sort=&ord=ASC&FromPage=";
const AIDE_PROFILE_URL_TEMPLATE = "https://app.hhaexchange.com/ENT2507010000/Aide/Aide_ns.aspx?AideId={ID}";
const PATIENT_SEARCH_URL = "https://app.hhaexchange.com/ENT2507010000/Patient/PatientSearchXSLT_ns.aspx?FirstName=&LastName=&StatusID=-1&PatientID=&MRNumber=&CoordinatorId=-1&Source=-1&PatientNumber=&HomePhone=";
const PATIENT_SEARCH_PARAMS = "&AltPatientID=&TeamID=-1&LocationID=-1&BranchID=-1&DisciplineID=0&Default=false&pg=1&sort=&ord=ASC&OfficeIds=469,5137,5139,6475,14849&MedicaidID=";
const PATIENT_PROFILE_URL_TEMPLATE = "https://app.hhaexchange.com/ENT2507010000/Patient/InternalPatientInfo_ns.aspx?PatientId={ID}";
// ==================== 状态变量 ====================
let lastCallWasIncoming = false;
/** 当前搜索的电话号码（用于高亮显示） */
let currentSearchPhone = "";
// ==================== 工具函数 ====================
/**
 * 判断给定的状态是否为 Active 状态
 * Active 状态包括: Active, Hospitalized
 * @param status - Patient 的状态字符串
 * @returns 是否为 Active 状态
 */
function isActiveStatus(status) {
    return ACTIVE_STATUSES.some((activeStatus) => status.toLowerCase() === activeStatus.toLowerCase());
}
/**
 * HHA 风格的 CSS 样式
 * 用于在弹窗中复现 HHAeXchange 原版的表格样式
 */
const HHA_STYLE_CSS = `
<style>
  /* 基础样式重置 */
  body {
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    background-color: #fff;
    margin: 0;
    padding: 10px;
  }

  /* 隐藏不需要的链接和元素 */
  a[href*="uxfrmSearchXSLT"],
  a[id*="uxfrmSearchXSLT"],
  a#uxfrmSearchXSLT,
  form[id*="uxfrmSearch"],
  [id="uxfrmSearchXSLT"],
  a[href*="LastName"][href*="FirstName"] {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    width: 0 !important;
    overflow: hidden !important;
    position: absolute !important;
    left: -9999px !important;
  }

  /* 分页列表友好显示 */
  ul:has(li a[href*="Page"]),
  ul:has(li:first-child a[href*="First"]),
  ul:has(li > a) {
    list-style: none !important;
    padding: 5px 10px !important;
    margin: 10px 0 !important;
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
    align-items: center !important;
    background-color: #f5f5f5 !important;
    border-radius: 4px !important;
  }

  ul:has(li a[href*="Page"]) li,
  ul:has(li:first-child a[href*="First"]) li,
  ul:has(li > a) li {
    display: inline !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  ul:has(li a[href*="Page"]) li::before,
  ul:has(li:first-child a[href*="First"]) li::before,
  ul:has(li > a) li::before {
    content: none !important;
  }

  ul:has(li a[href*="Page"]) li a,
  ul:has(li:first-child a[href*="First"]) li a {
    color: #0066cc !important;
    text-decoration: none !important;
    padding: 4px 8px !important;
    border: 1px solid #ddd !important;
    border-radius: 3px !important;
    background-color: #fff !important;
    transition: background-color 0.2s !important;
  }

  ul:has(li a[href*="Page"]) li a:hover,
  ul:has(li:first-child a[href*="First"]) li a:hover {
    background-color: #e6f2ff !important;
  }

  /* 通用分页 UL 样式 - 作为后备 */
  body ul {
    list-style-type: none;
  }

  /* 表格基础样式 */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    background-color: #fff;
  }

  /* 表头样式 - HHA 深蓝色风格 */
  table thead tr,
  table tr.header,
  table tr:first-child:has(th),
  table tr:has(a[href*="sortable"]) {
    background-color: #0d3e61 !important;
    color: #fff !important;
  }

  table th,
  table thead td,
  table tr.header td,
  table tr:has(a[href*="sortable"]) td {
    background-color: #0d3e61 !important;
    color: #fff !important;
    padding: 10px 8px;
    text-align: left;
    font-weight: 600;
    border: 1px solid #0a2d47;
    white-space: nowrap;
  }

  table th a,
  table thead td a,
  table tr.header td a,
  table tr:has(a[href*="sortable"]) td a {
    color: #fff !important;
    text-decoration: none;
  }

  table th a:hover,
  table thead td a:hover {
    text-decoration: underline;
  }

  /* 表格数据行样式 */
  table tbody tr,
  table tr:not(:first-child):not(.header):not(:has(a[href*="sortable"])) {
    background-color: #fff;
  }

  table tbody tr:nth-child(even),
  table tr:nth-child(even):not(:first-child):not(.header):not(:has(a[href*="sortable"])) {
    background-color: #f8f9fa;
  }

  table tbody tr:hover,
  table tr:hover:not(:first-child):not(.header):not(:has(a[href*="sortable"])) {
    background-color: #e9ecef;
  }

  table td {
    padding: 8px;
    border: 1px solid #dee2e6;
    vertical-align: middle;
  }

  /* 链接样式 */
  a {
    color: #0d6efd;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
    color: #0a58ca;
  }

  /* 可点击的名字链接 */
  a[href*="javascript:"] {
    color: #0d6efd;
    cursor: pointer;
    font-weight: 500;
  }

  a[href*="javascript:"]:hover {
    text-decoration: underline;
  }

  /* Active 状态标签样式 */
  td:has(> span:contains("Active")),
  td:contains("Active") {
    color: #198754;
  }

  /* 手动匹配 Active 状态 - 使用边框 */
  span.status-active,
  .status-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  /* 分页样式 */
  .pagination,
  ul:has(li:contains("Page")),
  div:has(> a:contains("Next")),
  div:has(> a:contains("Previous")) {
    margin: 10px 0;
    padding: 10px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #666;
  }

  /* 搜索结果标题 */
  h2, h3 {
    color: #0d3e61;
    margin: 15px 0 10px 0;
    font-size: 16px;
    font-weight: 600;
  }

  /* 隐藏空的或不需要的行 */
  tr:empty,
  td:empty:only-child {
    display: none;
  }

  /* 电话号码高亮保持 */
  span[style*="background-color: #ffff00"] {
    background-color: #ffff00 !important;
    padding: 1px 3px !important;
    border-radius: 2px !important;
    font-weight: bold !important;
  }

  /* 修复表格内的文字换行 */
  td {
    word-break: break-word;
  }

  /* 响应式调整 */
  @media (max-width: 1200px) {
    table {
      font-size: 13px;
    }
    table th, table td {
      padding: 6px;
    }
  }
</style>
`;
/**
 * 在 HTML 中注入 HHA 风格的 CSS 样式
 * @param html - 原始 HTML 字符串
 * @returns 处理后的 HTML 字符串
 */
function injectHhaStyles(html) {
    // 在 </head> 前注入样式，如果没有 head 标签则在开头添加
    if (html.includes("</head>")) {
        return html.replace("</head>", HHA_STYLE_CSS + "</head>");
    }
    else if (html.includes("<body")) {
        return html.replace("<body", HHA_STYLE_CSS + "<body");
    }
    else {
        return HHA_STYLE_CSS + html;
    }
}
/**
 * 清理 HTML 中的无用元素，移除用户不需要看到的链接和表单
 * @param html - 原始 HTML 字符串
 * @returns 清理后的 HTML 字符串
 */
function cleanupHtml(html) {
    // 移除 uxfrmSearchXSLT 相关的链接和表单（包含 URL 参数的那种长链接）
    // 匹配: <a ...id="uxfrmSearchXSLT"...>...</a>
    html = html.replace(/<a[^>]*id\s*=\s*["']?uxfrmSearchXSLT["']?[^>]*>[\s\S]*?<\/a>/gi, "");
    // 移除 href 中包含 uxfrmSearchXSLT 的链接
    html = html.replace(/<a[^>]*href\s*=\s*["'][^"']*uxfrmSearchXSLT[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "");
    // 移除 uxfrmSearch 相关的表单
    html = html.replace(/<form[^>]*id\s*=\s*["']?uxfrmSearch[^"']*["']?[^>]*>[\s\S]*?<\/form>/gi, "");
    // 移除那些包含完整 URL 参数的链接文本 (如 "&LastName=...&FirstName=..." 这种)
    html = html.replace(/<a[^>]*>[^<]*(&amp;|\&)LastName=[^<]*<\/a>/gi, "");
    return html;
}
/**
 * 在 HTML 中高亮指定的电话号码
 * @param html - 原始 HTML 字符串
 * @param phoneNumber - 要高亮的电话号码 (格式: xxx-xxx-xxxx)
 * @returns 处理后的 HTML 字符串
 */
function highlightPhoneNumber(html, phoneNumber) {
    if (!phoneNumber)
        return html;
    // 生成多种格式的电话号码进行匹配
    const digits = phoneNumber.replace(/\D/g, "");
    const formats = [
        phoneNumber, // xxx-xxx-xxxx
        digits, // xxxxxxxxxx
        `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`, // (xxx) xxx-xxxx
        `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`, // xxx.xxx.xxxx
        `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`, // xxx xxx xxxx
    ];
    // 转义正则特殊字符并创建匹配模式
    const escapedFormats = formats.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(`(${escapedFormats.join("|")})`, "g");
    // 替换为高亮版本（避免在标签内替换）
    return html.replace(pattern, '<span style="background-color: #ffff00; padding: 1px 3px; border-radius: 2px; font-weight: bold;">$1</span>');
}
/**
 * 为 HTML 注入重定向脚本，使点击链接能正常跳转到 profile 页面
 * @param html - 原始 HTML 字符串
 * @param type - 搜索类型 'aide' 或 'patient'
 * @returns 处理后的 HTML 字符串
 */
function injectRedirectScript(html, type) {
    const profileUrlTemplate = type === "aide" ? AIDE_PROFILE_URL_TEMPLATE : PATIENT_PROFILE_URL_TEMPLATE;
    const functionName = type === "aide" ? "RedirectToAidePage" : "RedirectToPatientPage";
    const script = `
<script>
function ${functionName}(id) {
  window.open('${profileUrlTemplate}'.replace('{ID}', id), '_blank');
}
function RedirectToAidePage(id) {
  window.open('${AIDE_PROFILE_URL_TEMPLATE}'.replace('{ID}', id), '_blank');
}
function RedirectToPatientPage(id) {
  window.open('${PATIENT_PROFILE_URL_TEMPLATE}'.replace('{ID}', id), '_blank');
}
</script>
`;
    // 在 </head> 或 </body> 前注入脚本
    if (html.includes("</head>")) {
        return html.replace("</head>", script + "</head>");
    }
    else if (html.includes("</body>")) {
        return html.replace("</body>", script + "</body>");
    }
    else {
        return html + script;
    }
}
/**
 * 处理 HTML: 注入样式 + 高亮电话号码 + 注入重定向脚本
 * @param html - 原始 HTML
 * @param type - 搜索类型
 * @param phoneNumber - 要高亮的电话号码
 * @returns 处理后的 HTML
 */
function processHtmlForDisplay(html, type, phoneNumber) {
    let processed = html;
    processed = cleanupHtml(processed); // 先清理无用元素
    processed = injectHhaStyles(processed); // 注入 HHA 风格样式
    processed = highlightPhoneNumber(processed, phoneNumber);
    processed = injectRedirectScript(processed, type);
    return processed;
}
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
 * 以弹窗形式打开一个URL或HTML内容
 * 使用 Blob URL 避免 data URL 的长度限制和编码问题
 * @param urlOrHtml - 要打开的网址或HTML字符串
 * @param windowName - 弹窗的名称, 相同的名称会覆盖已打开的弹窗
 * @param isHtml - 是否为HTML内容（默认false，表示是URL）
 */
function openInPopup(urlOrHtml, windowName = "HHA_Search_Result", isHtml = false) {
    const windowFeatures = "width=1200,height=900,resizable=yes,scrollbars=yes,status=yes";
    if (isHtml) {
        // 使用 Blob URL 避免 data URL 的编码问题和长度限制
        const blob = new Blob([urlOrHtml], { type: "text/html;charset=utf-8" });
        const blobUrl = URL.createObjectURL(blob);
        const popup = window.open(blobUrl, windowName, windowFeatures);
        // 在新窗口加载后释放 Blob URL 以避免内存泄漏
        if (popup) {
            popup.addEventListener("load", () => {
                URL.revokeObjectURL(blobUrl);
            });
            // 备用清理：如果 load 事件未触发，5秒后自动清理
            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        }
        else {
            // 如果弹窗被阻止，立即清理
            URL.revokeObjectURL(blobUrl);
            console.warn("弹窗被浏览器阻止，请允许弹窗后重试");
        }
    }
    else {
        window.open(urlOrHtml, windowName, windowFeatures);
    }
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
 * 解析 Patient (病人) 的搜索结果
 *
 * 核心逻辑 (基于 ADR-005):
 * 1. 统计 Active 状态 (Active, Hospitalized) 的结果数量
 * 2. 如果 activeCount === 1 → 返回该 Active 结果的 profile URL
 * 3. 如果 activeCount === 0 且 totalCount === 1 → 返回唯一结果的 profile URL
 * 4. 其他情况 → 返回原始 HTML 让用户判断
 *
 * @param html - HHAeXchange返回的Patient搜索结果页HTML字符串
 * @returns 一个包含搜索结果信息的对象
 */
function handlePatientSearchResult(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const resultsTable = doc.querySelector("#tdSearchResults");
    if (!resultsTable) {
        return { count: 0, activeCount: 0, rawHtml: html };
    }
    // 获取结果总数
    let resultCount = -1;
    const heading = doc.querySelector("h2");
    if (heading) {
        const match = heading.textContent?.match(/\((\d+)\)/);
        if (match && match[1])
            resultCount = parseInt(match[1], 10);
    }
    const resultRows = resultsTable.querySelectorAll("tbody tr");
    if (resultCount === -1) {
        resultCount = resultRows.length;
    }
    // 无结果
    if (resultCount === 0) {
        return { count: 0, activeCount: 0, rawHtml: html };
    }
    const rowInfos = Array.from(resultRows).map((row) => {
        // 获取 Status（通常在特定列，通过检查行内容获取）
        const statusText = row.textContent || "";
        let status = "Unknown";
        // 检查所有已知状态
        for (const s of [...ACTIVE_STATUSES, ...NON_ACTIVE_STATUSES]) {
            // 使用单词边界匹配，避免部分匹配
            const regex = new RegExp(`\\b${s}\\b`, "i");
            if (regex.test(statusText)) {
                status = s;
                break;
            }
        }
        // 获取 profile ID
        const link = row.querySelector('a[onclick*="RedirectToPatientPage"]');
        const match = link
            ?.getAttribute("onclick")
            ?.match(/RedirectToPatientPage\((\d+)/);
        const profileId = match ? match[1] : null;
        return { row, status, profileId };
    });
    // 筛选 Active 状态的行
    const activeRows = rowInfos.filter((info) => isActiveStatus(info.status));
    const activeCount = activeRows.length;
    console.log(`[Patient Search] Total: ${resultCount}, Active: ${activeCount}`, rowInfos.map((r) => ({ status: r.status, id: r.profileId })));
    // 核心决策逻辑
    // Case 1: 恰好 1 个 Active 结果 → 跳转
    if (activeCount === 1 && activeRows[0].profileId) {
        return {
            count: resultCount,
            activeCount: 1,
            finalUrl: PATIENT_PROFILE_URL_TEMPLATE.replace("{ID}", activeRows[0].profileId),
            rawHtml: html,
        };
    }
    // Case 2: 0 个 Active 结果，但总共只有 1 个结果 → 跳转
    if (activeCount === 0 && resultCount === 1 && rowInfos[0].profileId) {
        return {
            count: 1,
            activeCount: 0,
            finalUrl: PATIENT_PROFILE_URL_TEMPLATE.replace("{ID}", rowInfos[0].profileId),
            rawHtml: html,
        };
    }
    // Case 3: 其他情况 → 返回原始 HTML 让用户判断
    return { count: resultCount, activeCount, rawHtml: html };
}
/**
 * 创建一个上下分栏的HTML页面来同时显示两个搜索结果
 * 不使用 iframe，直接将内容嵌入到可滚动的 div 中
 * @param aideResult - Aide的搜索结果对象
 * @param patientResult - Patient的搜索结果对象
 */
function displayCombinedResults(aideResult, patientResult, phoneNumber = currentSearchPhone) {
    console.log("两边都有结果，创建合并视图...");
    /**
     * 使用 DOMParser 从原始 HTML 提取搜索结果表格及相关内容
     * 这是最稳定可靠的方法，不依赖字符串正则替换
     */
    const extractAndCleanContent = (html, type) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        // 找到搜索结果表格 - 尝试多种选择器
        let table = doc.querySelector("#tdSearchResults");
        if (!table) {
            // 备选：查找包含数据的表格
            table = doc.querySelector("table[id*='Search']");
        }
        if (!table) {
            // 再备选：查找 tbody 有内容的表格
            const tables = doc.querySelectorAll("table");
            for (const t of tables) {
                if (t.querySelector("tbody tr")) {
                    table = t;
                    break;
                }
            }
        }
        if (!table) {
            console.warn(`[${type}] 未找到搜索结果表格，HTML 长度: ${html.length}`);
            console.warn(`[${type}] HTML 前500字符:`, html.substring(0, 500));
            return `<p style="color: #666; padding: 20px;">未找到搜索结果</p>`;
        }
        // 在表格内移除不需要的元素（包括屏幕阅读器专用元素）
        const unwantedSelectors = [
            'a[id*="uxfrmSearchXSLT"]',
            'a[href*="uxfrmSearchXSLT"]',
            'form[id*="uxfrmSearch"]',
            'input[type="hidden"]',
            "script",
            ".show-for-sr", // 屏幕阅读器专用文字（如 "View Patient Details", "Patient Id"）
            '[class*="show-for-sr"]', // 匹配任何包含此类的元素
        ];
        unwantedSelectors.forEach((sel) => {
            table.querySelectorAll(sel).forEach((el) => el.remove());
        });
        // 移除原始页面的标题行（如 "Caregiver search results (1)"）
        const captionRow = table.querySelector('caption, tr.title-row, [class*="title"]');
        if (captionRow)
            captionRow.remove();
        // 清理表头：移除 "sortable column head" 等多余文字
        table.querySelectorAll("th, thead td").forEach((th) => {
            const link = th.querySelector("a");
            if (link) {
                // 只保留链接的文字内容
                th.textContent = link.textContent?.trim() || "";
            }
            else {
                // 清理多余的空白、换行符和 "sortable column head"
                let text = th.textContent || "";
                text = text.replace(/sortable\s*column\s*head/gi, ""); // 移除这段文字
                text = text.replace(/[\r\n\t]+/g, " "); // 换行变空格
                text = text.replace(/\s+/g, " ").trim(); // 多空格变单空格
                th.textContent = text;
            }
        });
        // 清理数据单元格
        table.querySelectorAll("tbody td, tr td").forEach((td) => {
            // 已经通过 unwantedSelectors 移除了 .show-for-sr 元素
            // 现在清理文本节点中的多余空白
            td.childNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    let text = node.textContent || "";
                    text = text
                        .replace(/[\r\n\t]+/g, " ")
                        .replace(/\s+/g, " ")
                        .trim();
                    node.textContent = text;
                }
            });
            // 移除空的 <br> 和多余换行
            td.querySelectorAll("br").forEach((br) => {
                if (!br.nextSibling || !br.nextSibling.textContent?.trim()) {
                    br.remove();
                }
            });
        });
        // Aide 表格：移除空的 Action 列（最后一列）
        if (type === "aide") {
            const headerCells = table.querySelectorAll("thead tr th, thead tr td");
            const lastHeaderIndex = headerCells.length - 1;
            const lastHeader = headerCells[lastHeaderIndex];
            // 检查最后一列是否是 Action 且内容为空
            if (lastHeader &&
                lastHeader.textContent?.trim().toLowerCase() === "action") {
                // 检查所有数据行的最后一列是否都为空
                const rows = table.querySelectorAll("tbody tr");
                let allEmpty = true;
                rows.forEach((row) => {
                    const cells = row.querySelectorAll("td");
                    const lastCell = cells[cells.length - 1];
                    if (lastCell && lastCell.textContent?.trim()) {
                        allEmpty = false;
                    }
                });
                if (allEmpty) {
                    // 移除表头的 Action 列
                    lastHeader.remove();
                    // 移除每行的最后一列
                    rows.forEach((row) => {
                        const cells = row.querySelectorAll("td");
                        const lastCell = cells[cells.length - 1];
                        if (lastCell)
                            lastCell.remove();
                    });
                }
            }
        }
        // 构建输出（不再需要额外标题，因为 panel-header 已经显示了）
        return table.outerHTML;
    };
    // 直接从原始 HTML 提取内容（不做字符串级别的清理，避免破坏 DOM）
    let aideBody = extractAndCleanContent(aideResult.rawHtml, "aide");
    let patientBody = extractAndCleanContent(patientResult.rawHtml, "patient");
    // 高亮电话号码
    aideBody = highlightPhoneNumber(aideBody, phoneNumber);
    patientBody = highlightPhoneNumber(patientBody, phoneNumber);
    const combinedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HHA Combined Search Results</title>
  <style>
    body, html { 
      margin: 0; 
      padding: 0; 
      height: 100%; 
      overflow: hidden; 
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; 
    }
    .container { 
      display: flex; 
      flex-direction: column; 
      height: 100%; 
    }
    .panel { 
      flex: 1; 
      border-bottom: 2px solid #0d3e61; 
      overflow: hidden; 
      display: flex; 
      flex-direction: column;
      min-height: 0;
    }
    .panel:last-child {
      border-bottom: none;
    }
    .panel-header { 
      margin: 0; 
      padding: 10px 15px; 
      background-color: #0d3e61; 
      color: #fff;
      font-size: 16px; 
      font-weight: 600;
      flex-shrink: 0;
    }
    .panel-content { 
      flex: 1;
      overflow: auto; 
      padding: 10px;
      background-color: #fff;
    }
    /* 在 panel-content 内部应用的样式 */
    .panel-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    .panel-content table th,
    .panel-content table td {
      padding: 8px;
      border: 1px solid #dee2e6;
      text-align: left;
    }
    .panel-content table thead tr,
    .panel-content table tr:first-child:has(th) {
      background-color: #0d3e61 !important;
      color: #fff !important;
    }
    .panel-content table th,
    .panel-content table thead th,
    .panel-content table thead td {
      background-color: #0d3e61 !important;
      color: #fff !important;
      font-weight: 600;
    }
    /* 确保表头内的链接也是白色 */
    .panel-content table th a,
    .panel-content table thead a {
      color: #fff !important;
    }
    .panel-content table tbody tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    .panel-content table tbody tr:hover {
      background-color: #e9ecef;
    }
    .panel-content a {
      color: #0d6efd;
      text-decoration: none;
    }
    .panel-content a:hover {
      text-decoration: underline;
    }
    /* 隐藏不需要的元素 */
    .panel-content a[href*="uxfrmSearchXSLT"],
    .panel-content a[id*="uxfrmSearchXSLT"],
    .panel-content form[id*="uxfrmSearch"] {
      display: none !important;
    }
    /* 分页样式 */
    .panel-content ul {
      list-style: none;
      padding: 5px 10px;
      margin: 10px 0;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .panel-content ul li {
      display: inline;
    }
    .panel-content ul li::before {
      content: none;
    }
    .panel-content ul li a {
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 3px;
      background-color: #fff;
    }
    /* 电话高亮 */
    .panel-content span[style*="background-color: #ffff00"] {
      background-color: #ffff00 !important;
      padding: 1px 3px !important;
      border-radius: 2px !important;
      font-weight: bold !important;
    }
  </style>
  <script>
    function RedirectToAidePage(id) {
      window.open('${AIDE_PROFILE_URL_TEMPLATE}'.replace('{ID}', id), '_blank');
    }
    function RedirectToPatientPage(id) {
      window.open('${PATIENT_PROFILE_URL_TEMPLATE}'.replace('{ID}', id), '_blank');
    }
  </script>
</head>
<body>
  <div class="container">
    <div class="panel">
      <h2 class="panel-header">Caregiver (护工) 搜索结果 (${aideResult.count} 条)</h2>
      <div class="panel-content">${aideBody}</div>
    </div>
    <div class="panel">
      <h2 class="panel-header">Patient (病人) 搜索结果 (${patientResult.count} 条${patientResult.activeCount !== undefined
        ? `, Active: ${patientResult.activeCount}`
        : ""})</h2>
      <div class="panel-content">${patientBody}</div>
    </div>
  </div>
</body>
</html>`;
    openInPopup(combinedHtml, "HHA_Combined_Result", true);
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
            const result = handler(html);
            result.searchUrl = searchUrl; // 保存原始搜索URL
            return result;
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
            // 保存当前搜索号码用于高亮显示
            currentSearchPhone = formattedNumber;
            console.log(`号码 ${formattedNumber}, 开始并行搜索 Aide 和 Patient...`);
            const [aideResult, patientResult] = await Promise.all([
                fetchHhaData("aide", formattedNumber),
                fetchHhaData("patient", formattedNumber),
            ]);
            const hasAideResult = aideResult.count > 0;
            const hasPatientResult = patientResult.count > 0;
            if (hasAideResult && !hasPatientResult) {
                // 只有 Aide 结果
                if (aideResult.count === 1 && aideResult.finalUrl) {
                    openInPopup(aideResult.finalUrl);
                }
                else {
                    // 多个结果：处理 HTML 后显示（高亮 + 点击跳转）
                    const processedHtml = processHtmlForDisplay(aideResult.rawHtml, "aide", formattedNumber);
                    openInPopup(processedHtml, "HHA_Search_Result", true);
                }
            }
            else if (!hasAideResult && hasPatientResult) {
                // 只有 Patient 结果
                if (patientResult.finalUrl) {
                    // finalUrl 存在说明已定位到唯一结果
                    openInPopup(patientResult.finalUrl);
                }
                else {
                    // 多个结果：处理 HTML 后显示（高亮 + 点击跳转）
                    const processedHtml = processHtmlForDisplay(patientResult.rawHtml, "patient", formattedNumber);
                    openInPopup(processedHtml, "HHA_Search_Result", true);
                }
            }
            else if (hasAideResult && hasPatientResult) {
                displayCombinedResults(aideResult, patientResult, formattedNumber);
            }
            else {
                alert(`电话号码 [${formattedNumber}] 在 HHAeXchange 中未找到对应的护工或病人。`);
            }
            return true;
        }
    }
    return false;
}
// 按钮文本常量
const SEARCH_BTN_TEXT_DEFAULT = "在HHA中搜索此号码 (Aide & Patient)";
const SEARCH_BTN_TEXT_SEARCHING = "⏳ 正在HHA中搜索...";
/**
 * 设置搜索按钮的状态（搜索中/默认）
 * @param button - 搜索按钮元素
 * @param isSearching - 是否正在搜索
 */
function setSearchButtonState(button, isSearching) {
    button.textContent = isSearching
        ? SEARCH_BTN_TEXT_SEARCHING
        : SEARCH_BTN_TEXT_DEFAULT;
    button.disabled = isSearching;
    button.style.opacity = isSearching ? "0.7" : "1";
    button.style.cursor = isSearching ? "not-allowed" : "pointer";
}
/**
 * 在通话信息面板中注入一个手动搜索按钮
 * @param callInfoPanel - 将要注入按钮的目标DOM元素
 * @param isSearching - 初始状态是否为"搜索中"
 * @returns 创建的按钮元素，如果已存在则返回已存在的按钮
 */
function injectManualSearchButton(callInfoPanel, isSearching = false) {
    // 检查是否已存在按钮
    const existingButton = callInfoPanel.querySelector(".manual-search-btn-hha");
    if (existingButton)
        return existingButton;
    const button = document.createElement("button");
    button.className = "manual-search-btn-hha";
    setSearchButtonState(button, isSearching);
    button.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (button.disabled)
            return; // 如果按钮已禁用，不执行任何操作
        setSearchButtonState(button, true);
        const success = await extractAndInitiateSearch(callInfoPanel);
        if (!success)
            alert("未能在当前通话信息中找到有效的外部电话号码！");
        setSearchButtonState(button, false);
    });
    const header = callInfoPanel.querySelector(".call-info-header");
    header
        ? header.insertAdjacentElement("afterend", button)
        : callInfoPanel.prepend(button);
    return button;
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
                        // 先注入按钮，显示"搜索中"状态
                        const button = injectManualSearchButton(callInfoPanel, true);
                        // 执行自动搜索
                        await extractAndInitiateSearch(callInfoPanel);
                        // 搜索完成后，将按钮恢复为默认状态
                        setSearchButtonState(button, false);
                        lastCallWasIncoming = false;
                    }
                    else {
                        // 非来电情况，注入默认状态的按钮
                        injectManualSearchButton(callInfoPanel, false);
                    }
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
/**
 * 通过电话号码搜索 HHA (供外部模块调用)
 * @param phoneNumber - 电话号码字符串 (任意格式，会自动格式化)
 * @returns 是否成功发起搜索
 */
async function searchHhaByPhone(phoneNumber) {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!formattedNumber) {
        alert(`无效的电话号码格式: ${phoneNumber}`);
        return false;
    }
    // 保存当前搜索号码用于高亮显示
    currentSearchPhone = formattedNumber;
    console.log(`[HHA Search] 外部调用: ${formattedNumber}, 开始并行搜索...`);
    const [aideResult, patientResult] = await Promise.all([
        fetchHhaData("aide", formattedNumber),
        fetchHhaData("patient", formattedNumber),
    ]);
    const hasAideResult = aideResult.count > 0;
    const hasPatientResult = patientResult.count > 0;
    if (hasAideResult && !hasPatientResult) {
        if (aideResult.count === 1 && aideResult.finalUrl) {
            openInPopup(aideResult.finalUrl);
        }
        else {
            const processedHtml = processHtmlForDisplay(aideResult.rawHtml, "aide", formattedNumber);
            openInPopup(processedHtml, "HHA_Search_Result", true);
        }
    }
    else if (!hasAideResult && hasPatientResult) {
        if (patientResult.finalUrl) {
            openInPopup(patientResult.finalUrl);
        }
        else {
            const processedHtml = processHtmlForDisplay(patientResult.rawHtml, "patient", formattedNumber);
            openInPopup(processedHtml, "HHA_Search_Result", true);
        }
    }
    else if (hasAideResult && hasPatientResult) {
        displayCombinedResults(aideResult, patientResult, formattedNumber);
    }
    else {
        alert(`电话号码 [${formattedNumber}] 在 HHAeXchange 中未找到对应的护工或病人。`);
    }
    return true;
}
const incomingCallHandler = async () => {
    console.log("HHAeXchange 电话助手 v5.5 (HTML清理+分页样式优化) 已启动。");
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
    // 支持多种格式: 1234567890, 123-456-7890, (123) 456-7890, 123.456.7890, +1 123-456-7890 等
    const PHONE_REGEX = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
    /**
     * 标准化电话号码：去除非数字字符，处理 11 位以 1 开头的号码
     * @param phoneNumber - 匹配到的电话号码字符串
     * @returns 标准化后的 10 位纯数字号码
     */
    function normalizePhoneNumber(phoneNumber) {
        let digits = phoneNumber.replace(/\D/g, "");
        // 如果是 11 位且以 1 开头（美国国家代码），去掉开头的 1
        if (digits.length === 11 && digits.startsWith("1")) {
            digits = digits.substring(1);
        }
        return digits;
    }
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
        // 标准化电话号码（去除非数字，处理 11 位 -> 10 位）
        const cleanedNumber = normalizePhoneNumber(phoneNumber);
        // 验证号码长度（必须是 10 位）
        if (cleanedNumber.length !== 10) {
            console.log("[Highlight2Call] 号码长度不正确，跳过弹窗:", phoneNumber, "->", cleanedNumber);
            return;
        }
        // 使用 target="_top" 来避免在 iframe 中导航失败的问题
        popup.innerHTML = `
            <div class="hcp-title">请选择操作</div>
            <div class="hcp-number">${phoneNumber}</div>
            <div class="hcp-actions">
                <a href="tel:${cleanedNumber}" class="hcp-button" target="_top">📞 打电话</a>
                <a href="sms:${cleanedNumber}" class="hcp-button" target="_top">💬 发短信</a>
            </div>
            <div class="hcp-actions-full">
                <button class="hcp-button hcp-search-hha" data-phone="${cleanedNumber}">🔍 在HHA搜索</button>
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
        const actionButtons = popup.querySelectorAll("a.hcp-button");
        actionButtons.forEach((btn) => {
            // 点击后延时关闭弹窗，确保链接跳转可以被触发
            btn.addEventListener("click", () => setTimeout(removePopup, 100));
        });
        // HHA 搜索按钮事件
        const searchHhaBtn = popup.querySelector(".hcp-search-hha");
        if (searchHhaBtn) {
            searchHhaBtn.addEventListener("click", async () => {
                const phone = searchHhaBtn.dataset.phone;
                if (phone) {
                    removePopup();
                    await searchHhaByPhone(phone);
                }
            });
        }
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
    // --- TAB SYNC MANAGER (升级版：支持跨域名多 Tab 同步) ---
    /**
     * TabSyncManager - 管理多 Tab 之间的数据同步（支持跨域名）
     *
     * 功能：
     * - 使用 GM_setValue/GM_getValue 存储共享数据，实现跨域名数据持久化
     * - 使用 BroadcastChannel 实时通知同域名内的其他 Tab
     * - 使用轮询机制检测跨域名的数据更新
     * - 提供缓存新鲜度判断，决定是否需要重新请求 API
     * - 边缘情况处理（降级、错误处理）
     *
     * 升级说明：
     * - 从 localStorage 升级到 GM_setValue，实现 app.hhaexchange.com 和 mt3.1voicetech.com 之间的数据共享
     * - BroadcastChannel 仍用于同域名实时通知，跨域通过轮询实现
     *
     * @see docs/adr/001-multi-tab-sync.md - 架构决策记录
     * @see docs/stories/epic-1-multi-tab-sync.md - Epic 详情
     */
    class TabSyncManager {
        constructor() {
            /** BroadcastChannel 实例，用于同域名 Tab 间实时通信 */
            this.channel = null;
            /** 消息回调函数 */
            this.messageCallback = null;
            /** 跨域轮询定时器 ID */
            this.pollIntervalId = null;
            /** 上次检查的缓存时间戳（用于检测跨域更新） */
            this.lastKnownTimestamp = 0;
            // --- 常量配置 ---
            /** GM_setValue 缓存键名（跨域共享） */
            this.CACHE_KEY = "hha_visit_monitor_cache";
            /** BroadcastChannel 频道名称（同域名内使用） */
            this.CHANNEL_NAME = "hha-visit-monitor-sync";
            /** 缓存新鲜阈值：30秒内视为新鲜，直接使用 */
            this.FRESH_THRESHOLD = 30 * 1000;
            /** 缓存过期阈值：2分钟后视为过期，必须刷新 */
            this.STALE_THRESHOLD = 2 * 60 * 1000;
            /** 跨域轮询间隔：5秒检查一次是否有其他域名的更新 */
            this.POLL_INTERVAL = 5 * 1000;
            // 生成唯一的 Tab ID（包含域名信息以便调试）
            const domain = window.location.hostname.split(".")[0];
            this.tabId = `${domain}_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 9)}`;
            // 检测 BroadcastChannel 支持
            this.channelSupported = typeof BroadcastChannel !== "undefined";
            if (this.channelSupported) {
                try {
                    this.channel = new BroadcastChannel(this.CHANNEL_NAME);
                    console.log(`[TabSyncManager] Tab ${this.tabId} initialized with BroadcastChannel (same-origin realtime)`);
                }
                catch (e) {
                    console.warn("[TabSyncManager] Failed to create BroadcastChannel:", e);
                    this.channel = null;
                }
            }
            else {
                console.warn("[TabSyncManager] BroadcastChannel not supported, using polling only");
            }
            // 初始化时记录当前缓存时间戳
            const cached = this.getCachedData();
            if (cached) {
                this.lastKnownTimestamp = cached.timestamp;
            }
            // 注册 Tab 关闭清理
            window.addEventListener("beforeunload", () => this.cleanup());
            console.log(`[TabSyncManager] Initialized with cross-domain support via GM_setValue`);
        }
        /**
         * 从 GM_getValue 获取缓存的数据（跨域共享）
         * @returns 缓存数据，如果不存在或解析失败则返回 null
         */
        getCachedData() {
            try {
                const stored = GM_getValue(this.CACHE_KEY, "");
                if (!stored)
                    return null;
                const parsed = JSON.parse(stored);
                // 增强数据结构验证
                if (!this.isValidCacheData(parsed)) {
                    console.warn("[TabSyncManager] Invalid cache structure, clearing corrupted data");
                    this.clearCache();
                    return null;
                }
                return parsed;
            }
            catch (e) {
                // JSON 解析错误处理
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
         * 验证缓存数据结构是否有效
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
         * 将数据保存到 GM_setValue（跨域共享）
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
                // 检查数据大小
                const sizeKB = new Blob([jsonStr]).size / 1024;
                if (sizeKB > 4096) {
                    // 4MB 警告阈值
                    console.warn(`[TabSyncManager] Cache size is large: ${sizeKB.toFixed(1)}KB`);
                }
                GM_setValue(this.CACHE_KEY, jsonStr);
                this.lastKnownTimestamp = cacheData.timestamp;
                console.log(`[TabSyncManager] Cache updated by Tab ${this.tabId}, size: ${sizeKB.toFixed(1)}KB (cross-domain shared)`);
            }
            catch (e) {
                console.error("[TabSyncManager] Failed to save cache:", e);
            }
        }
        /**
         * 通过 BroadcastChannel 向同域名的其他 Tab 广播消息
         * 注意：跨域名的 Tab 通过轮询机制获取更新
         * @param message - 要广播的消息
         */
        broadcast(message) {
            if (this.channel) {
                try {
                    this.channel.postMessage(message);
                    console.log(`[TabSyncManager] Broadcasted ${message.type} from Tab ${this.tabId} (same-origin)`);
                }
                catch (e) {
                    console.error("[TabSyncManager] Failed to broadcast message:", e);
                }
            }
            // 跨域名的 Tab 会通过轮询机制检测到 GM_setValue 的更新
        }
        /**
         * 注册消息监听器
         * - BroadcastChannel: 用于同域名实时通知
         * - 轮询: 用于跨域名数据同步检测
         * @param callback - 收到消息时的回调函数
         */
        onMessage(callback) {
            this.messageCallback = callback;
            // 方案 1: BroadcastChannel（同域名实时通知）
            if (this.channel) {
                this.channel.onmessage = (event) => {
                    callback(event.data);
                };
                this.channel.onmessageerror = (event) => {
                    console.error("[TabSyncManager] BroadcastChannel message error:", event);
                };
            }
            // 方案 2: 轮询（跨域名数据同步）
            // GM_setValue 的变化不会触发事件，所以需要轮询检测
            this.startCrossOriginPolling();
            console.log(`[TabSyncManager] Message listeners registered (BroadcastChannel: ${!!this
                .channel}, CrossOriginPolling: ${this.POLL_INTERVAL}ms)`);
        }
        /**
         * 启动跨域轮询，定期检查是否有其他域名的更新
         */
        startCrossOriginPolling() {
            if (this.pollIntervalId) {
                clearInterval(this.pollIntervalId);
            }
            this.pollIntervalId = window.setInterval(() => {
                this.checkForCrossOriginUpdates();
            }, this.POLL_INTERVAL);
            console.log(`[TabSyncManager] Cross-origin polling started (interval: ${this.POLL_INTERVAL}ms)`);
        }
        /**
         * 检查是否有跨域更新
         * 如果检测到其他 Tab（可能来自其他域名）更新了数据，则触发回调
         */
        checkForCrossOriginUpdates() {
            const cached = this.getCachedData();
            if (!cached)
                return;
            // 检查是否有新的更新（时间戳变化 + 不是自己更新的）
            if (cached.timestamp > this.lastKnownTimestamp &&
                cached.sourceTabId !== this.tabId) {
                console.log(`[TabSyncManager] Cross-origin update detected from Tab ${cached.sourceTabId}`);
                // 更新已知时间戳
                this.lastKnownTimestamp = cached.timestamp;
                // 触发回调
                if (this.messageCallback) {
                    this.messageCallback({
                        type: "DATA_UPDATED",
                        sourceTabId: cached.sourceTabId,
                        timestamp: cached.timestamp,
                    });
                }
            }
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
         * 停止跨域轮询
         */
        stopCrossOriginPolling() {
            if (this.pollIntervalId) {
                clearInterval(this.pollIntervalId);
                this.pollIntervalId = null;
                console.log(`[TabSyncManager] Cross-origin polling stopped`);
            }
        }
        /**
         * 清理资源，在 Tab 关闭时调用
         */
        cleanup() {
            // 停止跨域轮询
            this.stopCrossOriginPolling();
            if (this.channel) {
                // 通知同域名的其他 Tab 本 Tab 即将关闭
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
         * 清除缓存（跨域共享）
         */
        clearCache() {
            try {
                GM_setValue(this.CACHE_KEY, "");
                this.lastKnownTimestamp = 0;
                console.log(`[TabSyncManager] Cache cleared`);
            }
            catch (e) {
                console.error("[TabSyncManager] Failed to clear cache:", e);
            }
        }
        /**
         * 获取调试信息
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
                crossOriginPolling: !!this.pollIntervalId,
                lastKnownTimestamp: this.lastKnownTimestamp,
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
              <div class="tracker-header-left">
                <span id="last-refresh-time">⏰ 上次更新: --:--:--</span>
              </div>
              <div class="tracker-header-right">
                <button id="edit-list-btn" class="tracker-btn-secondary">📝 选择要追踪的辅导员</button>
              </div>
            </div>
            <div class="tracker-content"><table class="tracker-table"><thead><tr>
                    <th style="width:40px;">编号</th>
                    <th class="col-coordinator">辅导员 (Ext.)</th>
                    <th style="width:80px;">上班钟</th>
                    <th style="width:80px;">下班钟</th>
                    <th style="width:80px;">异常打钟</th>
                    <th style="width:80px;">消息</th>
                </tr></thead><tbody id="tracking-table-body"></tbody></table></div>
        </div>
        <div id="editing-view" class="tracker-view hidden">
            <div class="tracker-header">
              <div class="tracker-header-left">
                <button id="back-btn" class="tracker-btn-icon tracker-btn-secondary">←</button>
                <h3>编辑追踪列表</h3>
              </div>
            </div>
            <div id="editing-content" class="tracker-content"></div>
            <div class="tracker-footer">
              <button id="cancel-btn" class="tracker-btn-secondary">取消</button>
              <button id="save-btn" class="tracker-btn-primary">💾 保存</button>
            </div>
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
            timeEl.textContent = `上次更新: ${date.toLocaleTimeString()}`;
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
            // 1. 设置 toView 初始位置在右边
            toView.style.transform = "translateX(100%)";
            // 2. 强制浏览器渲染
            toView.offsetHeight;
            // 3. 添加 transition 并移动到中间
            toView.style.transition = "transform 0.3s ease-in-out";
            toView.style.transform = "translateX(0)";
            // 4. fromView 向左滑出
            fromView.style.transition = "transform 0.3s ease-in-out";
            fromView.style.transform = "translateX(-100%)";
        }
        else {
            // 后退动画：从左往右
            // 1. 设置 toView 初始位置在左边
            toView.style.transform = "translateX(-100%)";
            // 2. 强制浏览器渲染
            toView.offsetHeight;
            // 3. 添加 transition 并移动到中间
            toView.style.transition = "transform 0.3s ease-in-out";
            toView.style.transform = "translateX(0)";
            // 4. fromView 向右滑出
            fromView.style.transition = "transform 0.3s ease-in-out";
            fromView.style.transform = "translateX(100%)";
        }
        setTimeout(() => {
            fromView.classList.add("hidden");
            // 清理 inline styles
            fromView.style.transform = "";
            fromView.style.transition = "";
        }, 300);
    }
    function loadTrackedCoordinators() {
        try {
            // 使用 GM_getValue 实现跨域名同步（在 mt3.1voicetech.com 和 app.hhaexchange.com 之间共享）
            const stored = GM_getValue(STORAGE_KEY, "");
            trackedCoordinators = stored ? JSON.parse(stored) : [];
        }
        catch (error) {
            console.error("Failed to load or parse tracked coordinators from GM_getValue:", error);
            trackedCoordinators = [];
        }
    }
    function saveTrackedCoordinators() {
        try {
            // 使用 GM_setValue 实现跨域名同步
            GM_setValue(STORAGE_KEY, JSON.stringify(trackedCoordinators));
        }
        catch (error) {
            console.error("Failed to save tracked coordinators to GM_setValue:", error);
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
    // 缓存从 app.hhaexchange.com 获取的 API 参数
    let cachedMessageApiParams = null;
    /**
     * 获取消息 API 所需的基础参数
     * 优先从页面全局变量获取，如果不存在则从 app.hhaexchange.com 动态获取
     * 这解决了在 mt3.1voicetech.com 上无法获取认证参数的问题
     */
    async function getMessageApiParams() {
        // 如果已缓存，直接返回
        if (cachedMessageApiParams) {
            console.log("[VisitMonitor] getMessageApiParams: using cached params");
            return cachedMessageApiParams;
        }
        // 尝试从页面全局变量获取
        const win = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window);
        let params = {
            appVersion: win.gnAppVersion || "ENT",
            version: win.gnVersion || "25.07",
            minorVersion: win.gnMinorVersion || "1.0",
            userID: String(win.gnUserID || ""),
            appSecret: win.gnApSc || "",
            appName: win.gnApNm || "ENT",
        };
        // 如果关键参数缺失（如在 mt3.1voicetech.com 上），则从 app.hhaexchange.com 动态获取
        if (!params.userID || !params.appSecret) {
            console.log("[VisitMonitor] getMessageApiParams: page params missing, fetching from app.hhaexchange.com...");
            try {
                const initialUrl = "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
                const r = (await GM_fetch(initialUrl, {
                    method: "GET",
                }));
                const textResult = await r.rawBody.text();
                const getParam = (name) => textResult.match(new RegExp(`var\\s+${name}\\s*=\\s*['"]([^'"]+)['"];`))?.[1];
                params = {
                    userID: getParam("gnUserID") || "",
                    appSecret: getParam("gnApSc") || "",
                    appVersion: getParam("gnAppVersion") || "ENT",
                    version: getParam("gnVersion") || "25.07",
                    minorVersion: getParam("gnMinorVersion") || "1.0",
                    appName: getParam("gnApNm") || "ENT",
                };
                if (!params.userID || !params.appSecret) {
                    console.error("[VisitMonitor] getMessageApiParams: Failed to extract params from app.hhaexchange.com");
                }
                else {
                    console.log("[VisitMonitor] getMessageApiParams: Successfully fetched from app.hhaexchange.com");
                }
            }
            catch (error) {
                console.error("[VisitMonitor] getMessageApiParams: Error fetching from app.hhaexchange.com:", error);
            }
        }
        // 缓存参数
        cachedMessageApiParams = params;
        console.log("[VisitMonitor] getMessageApiParams:", params);
        return params;
    }
    /**
     * 获取消息 API 的 base URL
     */
    async function getMessageApiBaseUrl() {
        const params = await getMessageApiParams();
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
        const baseUrl = await getMessageApiBaseUrl();
        const params = await getMessageApiParams();
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
        // 检查 API 状态码 - 非 200 时返回空数据
        if (res.status !== 200) {
            console.warn(`[VisitMonitor] getMessageContractPayers - API returned status ${res.status}, skipping`);
            return { payers: "", payerIdWithContractChhaId: [] };
        }
        const data = JSON.parse(rawText);
        const payerList = data?.ListPayers || [];
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
        const baseUrl = await getMessageApiBaseUrl();
        const params = await getMessageApiParams();
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
            // 检查 API 状态码 - 非 200 时返回空数据
            if (res.status !== 200) {
                console.warn(`[VisitMonitor] getMessageReasonIds - API returned status ${res.status}, skipping`);
                return "";
            }
            const data = JSON.parse(rawText);
            console.log("[VisitMonitor] getMessageReasonIds - data length:", data?.length);
            // 检查 data 是否为数组
            if (!Array.isArray(data)) {
                console.warn("[VisitMonitor] getMessageReasonIds - data is not an array, skipping", typeof data);
                return "";
            }
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
        const baseUrl = await getMessageApiBaseUrl();
        const params = await getMessageApiParams();
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
            // 检查 API 状态码 - 非 200 时返回空数据（常见于跨域认证问题）
            if (res.status !== 200) {
                console.warn(`[VisitMonitor] getMessageOfficeIds - API returned status ${res.status}, skipping message tracking`);
                return "";
            }
            const data = JSON.parse(rawText);
            console.log("[VisitMonitor] getMessageOfficeIds - data length:", data?.length);
            // 检查 data 是否为数组
            if (!Array.isArray(data)) {
                console.warn("[VisitMonitor] getMessageOfficeIds - data is not an array, skipping", typeof data);
                return "";
            }
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
            const baseUrl = await getMessageApiBaseUrl();
            const params = await getMessageApiParams();
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
            const data = JSON.parse(rawText);
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
        // 获取 tracker-content 容器和表格元素
        const trackerContent = document.querySelector("#tracking-view .tracker-content");
        const trackerTable = trackerContent?.querySelector(".tracker-table");
        if (trackedCoordinators.length === 0) {
            // 隐藏表格，显示类似 QA 报告的居中提示
            if (trackerTable)
                trackerTable.style.display = "none";
            // 添加空状态类以移除 padding
            trackerContent.classList.add("tracker-content-empty");
            // 创建或更新空状态提示
            let emptyState = trackerContent.querySelector(".tracker-empty-state");
            if (!emptyState) {
                emptyState = document.createElement("div");
                emptyState.className = "tracker-empty-state";
                trackerContent.appendChild(emptyState);
            }
            emptyState.innerHTML = `
        <div class="tracker-empty-icon">📊</div>
        <div class="tracker-empty-title">状态追踪</div>
        <div class="tracker-empty-text">请选择要追踪的辅导员</div>
      `;
            emptyState.style.display = "flex";
            return;
        }
        // 有数据时显示表格，隐藏空状态，移除空状态类
        if (trackerTable)
            trackerTable.style.display = "";
        trackerContent.classList.remove("tracker-content-empty");
        const emptyState = trackerContent?.querySelector(".tracker-empty-state");
        if (emptyState)
            emptyState.style.display = "none";
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
            // Add disabled class for zero-count status icons
            const clockInClass = `status-icon ${clockInStatus}${clockInCount === 0 ? " status-disabled" : ""}`;
            const clockOutClass = `status-icon ${clockOutStatus}${clockOutCount === 0 ? " status-disabled" : ""}`;
            const anomalyClass = `status-icon ${anomalyStatus}${anomalyCount === 0 ? " status-disabled" : ""}`;
            const messageClass = `status-icon ${messageStatus}${messageCount === 0 ? " status-disabled" : ""}`;
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td class="col-coordinator">${coordinator.name}</td>
                    <td><div class="${clockInClass}" data-coordinator-id="${coordinator.id}" data-call-type="2">${clockInCount}</div></td>
                    <td><div class="${clockOutClass}" data-coordinator-id="${coordinator.id}" data-call-type="3">${clockOutCount}</div></td>
                    <td><div class="${anomalyClass}" data-coordinator-id="${coordinator.id}" data-call-type="anomaly">${anomalyCount}</div></td>
                    <td><div class="${messageClass}" data-coordinator-id="${coordinator.id}" data-call-type="message">${messageCount}</div></td>
                </tr>`;
        })
            .join("");
        trackingTableBody.innerHTML = rowsHtml;
    }
    // FIX 2: 移除函数参数，使其直接使用上层作用域的 allCoordinators 状态变量
    function renderEditingView() {
        const tableHtml = `
            <table class="tracker-table">
                <thead><tr><th class="col-coordinator">所有可用 Coordinator</th><th>操作</th></tr></thead>
                <tbody id="editing-table-body">
                    ${allCoordinators
            .map((c) => `
                        <tr data-id="${c.id}">
                            <td class="col-coordinator">${c.name}</td>
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
    function makeMultiDirectionResizable(element) {
        // 只创建左(w)、右(e)、底(s)边和右下角(se)的resize handle
        const directions = ["e", "se", "s", "w"];
        directions.forEach((direction) => {
            const handle = document.createElement("div");
            handle.className = `popover-resize-handle popover-resize-handle-${direction}`;
            element.appendChild(handle);
            let isResizing = false;
            let startX = 0;
            let startY = 0;
            let startWidth = 0;
            let startHeight = 0;
            let startLeft = 0;
            let startTop = 0;
            let overlay = null;
            const onMouseDown = (e) => {
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = element.offsetWidth;
                startHeight = element.offsetHeight;
                // 使用 getBoundingClientRect() 获取正确的位置（因为 popover 使用 position: fixed）
                const rect = element.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;
                // 创建透明遮罩层
                overlay = document.createElement("div");
                overlay.style.cssText =
                    "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;";
                document.body.appendChild(overlay);
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
                const minWidth = 400;
                const minHeight = 300;
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;
                // 根据方向计算新尺寸和位置
                if (direction.includes("e")) {
                    newWidth = Math.max(minWidth, startWidth + deltaX);
                }
                if (direction.includes("w")) {
                    const possibleWidth = startWidth - deltaX;
                    if (possibleWidth >= minWidth) {
                        newWidth = possibleWidth;
                        newLeft = startLeft + deltaX;
                    }
                }
                if (direction.includes("s")) {
                    newHeight = Math.max(minHeight, startHeight + deltaY);
                }
                if (direction.includes("n")) {
                    const possibleHeight = startHeight - deltaY;
                    if (possibleHeight >= minHeight) {
                        newHeight = possibleHeight;
                        newTop = startTop + deltaY;
                    }
                }
                element.style.width = `${newWidth}px`;
                element.style.height = `${newHeight}px`;
                element.style.left = `${newLeft}px`;
                element.style.top = `${newTop}px`;
                e.preventDefault();
                e.stopPropagation();
            };
            const onMouseUp = (e) => {
                if (!isResizing)
                    return;
                isResizing = false;
                document.body.style.userSelect = "";
                if (overlay) {
                    overlay.remove();
                    overlay = null;
                }
                document.removeEventListener("mousemove", onMouseMove, true);
                document.removeEventListener("mouseup", onMouseUp, true);
                e.preventDefault();
                e.stopPropagation();
            };
            handle.addEventListener("mousedown", onMouseDown);
        });
    }
    // 保留旧的单方向调整大小功能以兼容
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
            overlay = document.createElement("div");
            overlay.style.cssText =
                "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;cursor:nwse-resize;";
            document.body.appendChild(overlay);
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
            return `<td>${detail.patientName}</td>`;
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
                <div class="phone-icon-wrapper">
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
                    <td>${d.assignmentId}</td>
                    <td>${d.admissionId}</td>
                    <td>${d.caregiverName}</td>
                    <td>${d.visitDate}</td>
                    <td>${d.coordinators}</td>
                    <td>${d.schedule}</td>
                    <td>${d.contract}</td>
                    <td>${d.discipline}</td>
                    <td>${d.serviceCode}</td>
                    <td>${d.caregiverTeam}</td>
                </tr>`)
                .join("");
            tableHtml = `
            <thead><tr>
                <th>Patient Name</th>
                <th>Assignment ID</th>
                <th>Admission ID</th>
                <th>Caregiver Name</th>
                <th>Visit Date</th>
                <th>Coordinators</th>
                <th>Schedule</th>
                <th>Contract</th>
                <th>Discipline</th>
                <th>Service Code</th>
                <th>Caregiver Team</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
        `;
        }
        else if (callType === "anomaly") {
            const details = data.details;
            const tableRows = details
                .map((d) => `
            <tr>
                    <td>${d.assignId}</td><td>${d.caregiverCode}</td>
                    <td>${d.caregiverName}</td><td>${d.officeName}</td>
                    <td>${d.caregiverPhone}</td><td>${d.caregiverTeam}</td>
                    <td>${d.patientName}</td><td>${d.callDate}</td>
                    <td>${d.callTime}</td><td>${d.callType}</td>
                    <td>${d.callerId}</td><td>${d.status}</td>
                </tr>`)
                .join("");
            tableHtml = `
            <thead>
            <tr>
                <th>Assign. ID#</th>
                <th>Caregiver Code</th>
                <th>Caregiver Name</th>
                <th>Office Name</th>
                <th>Caregiver Phone</th>
                <th>Caregiver Team</th>
                <th>Patient Name</th>
                <th>Call Date</th>
                <th>Call Time</th>
                <th>Call Type</th>
                <th>Caller ID</th>
                <th>Status</th>
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
                    <td>${d.memberName}</td>
                    <td>${d.payerName}</td>
                    <td>${d.reason}</td>
                    <td class="note-cell">${formattedNote}</td>
                    <td class="datetime-cell">${d.createdDateTimeDisplay}</td>
                </tr>`;
            })
                .join("");
            tableHtml = `
            <thead>
            <tr>
                <th>Member Name</th>
                <th>Payer</th>
                <th>Reason</th>
                <th>Note</th>
                <th>DateTime</th>
            </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        `;
        }
        else {
            // 备用情况
            tableHtml = `<tbody><tr><td>未知的数据类型</td></tr></tbody>`;
        }
        // --- 4. 组装：将头部、内容和表格组装成完整的 Popover HTML ---
        popover.innerHTML = `
        <div class="popover-header"><h4>📋 详情列表（最新10条） <span class="record-count">(${data.count} 条记录)</span></h4><button class="popover-close-btn">&times;</button></div>
            <div class="popover-content"><table class="popover-table">${tableHtml}</table></div>
        `;
        // --- 5. 注入与激活 ---
        document.body.appendChild(popover);
        // 激活拖拽功能
        const popoverHeader = popover.querySelector(".popover-header");
        if (popoverHeader) {
            makeDraggable(popover, popoverHeader);
        }
        // 激活多方向调整大小功能 (8个方向)
        makeMultiDirectionResizable(popover);
        // 防止滚动穿透：为 popover-content 添加滚动穿透防止
        const popoverContent = popover.querySelector(".popover-content");
        if (popoverContent) {
            popoverContent.addEventListener("wheel", (e) => {
                const target = e.currentTarget;
                const scrollTop = target.scrollTop;
                const scrollHeight = target.scrollHeight;
                const clientHeight = target.clientHeight;
                const deltaY = e.deltaY;
                // 如果滚动到顶部且继续向上滚动，或滚动到底部且继续向下滚动，则阻止默认行为
                if ((scrollTop === 0 && deltaY < 0) ||
                    (scrollTop + clientHeight >= scrollHeight && deltaY > 0)) {
                    e.preventDefault();
                }
                // 阻止事件冒泡到页面
                e.stopPropagation();
            });
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


// GM_storage keys
const HOMEPAGE_CONFIG_KEY = "hha_homepage_config";
const COORDINATOR_CACHE_KEY = "hha_coordinator_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟
// 标志：是否已经加载过coordinators
let coordinatorsLoadedOnce = false;
// 默认配置（向后兼容：Tao Yang）
const HomePage_DEFAULT_CONFIG = {
    coordinatorID: "75207",
    coordinatorText: "Tao Yang ext.503 TYang@alwaysNY.net",
    status: "1", // Open
    lastUpdated: Date.now(),
};
// ============================================================================
// Story 2: GM_storage 配置管理函数
// ============================================================================
/**
 * 检测 GM_storage API 是否可用
 */
function HomePage_isGMStorageAvailable() {
    return typeof GM_setValue === "function" && typeof GM_getValue === "function";
}
/**
 * 获取当前保存的配置
 */
function getHomePageConfig() {
    if (HomePage_isGMStorageAvailable()) {
        try {
            const stored = GM_getValue(HOMEPAGE_CONFIG_KEY);
            if (stored) {
                const config = JSON.parse(stored);
                console.log("[HomePage] Config loaded from GM_storage:", config);
                return config;
            }
        }
        catch (error) {
            console.error("[HomePage] Failed to load config from GM_storage:", error);
        }
    }
    console.log("[HomePage] Using default config");
    return { ...HomePage_DEFAULT_CONFIG, lastUpdated: Date.now() };
}
/**
 * 保存配置
 */
function saveHomePageConfig(config) {
    const current = getHomePageConfig();
    const updated = {
        ...current,
        ...config,
        lastUpdated: Date.now(),
    };
    if (HomePage_isGMStorageAvailable()) {
        try {
            GM_setValue(HOMEPAGE_CONFIG_KEY, JSON.stringify(updated));
            console.log("[HomePage] Config saved to GM_storage:", updated);
        }
        catch (error) {
            console.error("[HomePage] Failed to save config to GM_storage:", error);
        }
    }
}
/**
 * 重置为默认配置
 */
function resetHomePageConfig() {
    saveHomePageConfig(HomePage_DEFAULT_CONFIG);
    console.log("[HomePage] Config reset to default");
}
// ============================================================================
// Story 2: API 数据获取函数
// ============================================================================
/**
 * 从页面获取 AppSecret（从任意请求头中提取）
 */
function getAppSecretFromPage() {
    // 方法1: 从 meta 标签读取
    const metaSecret = document.querySelector('meta[name="appsecret"]');
    if (metaSecret) {
        const content = metaSecret.getAttribute("content");
        if (content)
            return content;
    }
    // 方法2: 从全局变量读取（如果页面有暴露）
    const win = window;
    if (win.AppSecret) {
        return win.AppSecret;
    }
    // 方法3: 使用实测默认值
    return "79BB4FCD-9884-4652-B77F-6077F363193D";
}
/**
 * 获取当前用户 ID（从页面 cookie 或全局变量）
 */
function getUserIDFromPage() {
    // 方法1: 从 hhaKeyWordConfiguration cookie 读取
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "hhaKeyWordConfiguration") {
            const match = value.match(/UserId=(\d+)/);
            if (match) {
                console.log("[HomePage] UserID from cookie:", match[1]);
                return match[1];
            }
        }
    }
    // 方法2: 从全局变量读取
    const win = window;
    if (win.currentUserID) {
        console.log("[HomePage] UserID from window.currentUserID:", win.currentUserID.toString());
        return win.currentUserID.toString();
    }
    // 方法3: 尝试从顶层window读取
    try {
        const topWin = window.top;
        if (topWin && topWin !== window) {
            // 尝试从top window的cookie读取
            const topCookies = topWin.document.cookie.split(";");
            for (const cookie of topCookies) {
                const [name, value] = cookie.trim().split("=");
                if (name === "hhaKeyWordConfiguration") {
                    const match = value.match(/UserId=(\d+)/);
                    if (match) {
                        console.log("[HomePage] UserID from top window cookie:", match[1]);
                        return match[1];
                    }
                }
            }
            // 尝试从top window全局变量读取
            if (topWin.currentUserID) {
                console.log("[HomePage] UserID from top window.currentUserID:", topWin.currentUserID.toString());
                return topWin.currentUserID.toString();
            }
        }
    }
    catch (e) {
        // 跨域限制，无法访问top window
        console.warn("[HomePage] Cannot access top window:", e);
    }
    // 使用实测默认值
    console.warn("[HomePage] Using hardcoded userID fallback: 184885");
    return "184885";
}
/**
 * 获取 Office IDs（从页面上下文）
 */
function getOfficeIDsFromPage() {
    // 尝试从页面全局变量获取
    const win = window;
    // 如果页面有 offices 数组
    if (win.offices && Array.isArray(win.offices)) {
        const ids = win.offices.map((o) => o.OfficeID || o.id);
        return {
            OfficeIDs: ids.join(","),
            OfficeXML: ids.map((id) => ({ OfficeID: id })),
        };
    }
    // 使用实测默认值（从成功请求中提取）
    return {
        OfficeIDs: "469,5137,5139,6475,14849",
        OfficeXML: [
            { OfficeID: 469 },
            { OfficeID: 5137 },
            { OfficeID: 5139 },
            { OfficeID: 6475 },
            { OfficeID: 14849 },
        ],
    };
}
/**
 * 从 API 获取所有 Coordinators
 * API: POST /api/Common/GetAllCoordinators
 * 实测返回: 26 个 coordinator 对象
 */
async function fetchCoordinatorsFromAPI() {
    const apiUrl = "/ENTP2507010000//api/Common//GetAllCoordinators";
    try {
        const appSecret = getAppSecretFromPage();
        const userID = getUserIDFromPage();
        const officeData = getOfficeIDsFromPage();
        // 构建完整的请求体（与成功请求一致）
        const requestBody = {
            appVersion: "ENT",
            version: "25.07",
            minorVersion: "1.0",
            userID: userID,
            OfficeIDs: officeData.OfficeIDs,
            OfficeXML: officeData.OfficeXML,
        };
        console.log("[HomePage] Fetching coordinators with body:", requestBody);
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                AppSecret: appSecret,
                AppName: "ENT",
            },
            body: JSON.stringify(requestBody),
        });
        if (response.ok) {
            const data = await response.json();
            console.log(`[HomePage] Fetched ${data.length} coordinators from API`);
            return data;
        }
        else {
            console.error("[HomePage] API returned error:", response.status, response.statusText);
        }
    }
    catch (error) {
        console.error("[HomePage] Failed to fetch coordinators:", error);
    }
    return [];
}
/**
 * 强制清除coordinator缓存
 */
function clearCoordinatorCache() {
    if (HomePage_isGMStorageAvailable()) {
        GM_setValue(COORDINATOR_CACHE_KEY, "");
        console.log("[HomePage] Coordinator cache cleared");
    }
}
/**
 * 带缓存的 Coordinator 获取（避免重复请求）
 */
async function getCoordinators(forceRefresh = false) {
    const now = Date.now();
    // 如果强制刷新，先清除缓存
    if (forceRefresh) {
        clearCoordinatorCache();
        console.log("[HomePage] Force refresh: clearing cache");
    }
    // 1. 先从缓存读取
    if (!forceRefresh && HomePage_isGMStorageAvailable()) {
        try {
            const cached = GM_getValue(COORDINATOR_CACHE_KEY);
            if (cached) {
                const cacheData = JSON.parse(cached);
                // 检查缓存是否过期
                if (now - cacheData.timestamp < CACHE_TTL) {
                    console.log(`[HomePage] Using cached coordinators (${cacheData.data.length} items)`);
                    return cacheData.data;
                }
                console.log("[HomePage] Cache expired, fetching from API...");
            }
        }
        catch (error) {
            console.error("[HomePage] Failed to read cache:", error);
        }
    }
    // 2. 缓存过期或不存在，从 API 获取
    const coordinators = await fetchCoordinatorsFromAPI();
    // 3. 保存到缓存
    if (coordinators.length > 0 && HomePage_isGMStorageAvailable()) {
        const cacheData = {
            data: coordinators,
            timestamp: now,
        };
        GM_setValue(COORDINATOR_CACHE_KEY, JSON.stringify(cacheData));
        console.log("[HomePage] Coordinators cached successfully");
    }
    return coordinators;
}
// ============================================================================
// Story 4: API-First 搜索实现
// ============================================================================
/**
 * 获取目标 iframe（#ctl00_ContentPlaceHolder1_iframemsg）
 */
function getTargetIframe() {
    return document.getElementById("ctl00_ContentPlaceHolder1_iframemsg");
}
/**
 * 直接调用 PayerNotificationSearch API 执行搜索
 * 优点：绕过 UI 级联依赖，速度快（< 500ms）
 *
 * @returns 成功返回 true，失败返回 false
 */
async function executeSearchByAPI() {
    const config = getHomePageConfig();
    try {
        const appSecret = getAppSecretFromPage();
        const userID = getUserIDFromPage();
        const officeData = getOfficeIDsFromPage();
        const apiUrl = "/ENTP2507010000/api/PayerNotification/PayerNotificationSearch";
        // 构建请求体（匹配成功的请求格式）
        const requestBody = {
            appVersion: "ENT",
            version: "25.07",
            minorVersion: "1.0",
            userID: userID,
            MessageType: -1,
            Status: parseInt(config.status),
            ProviderId: "469", // 从 officeData 提取主 office ID
            IsConversation: 0,
            KeySearch: "",
            Pagination: {
                PageNumber: 1,
                SortItem: "CreatedDate",
                SortOrder: "DESC",
                PageSize: "50",
            },
            IsNewLook: true,
            CommunicationType: 1, // 1=Non-Patient, 2=Patient
            UserName: "", // 留空或从页面获取
            NoOfDays: 1,
            UseMirrorConnection: true,
            Internal: 2,
            IsServicePortalNote: 0,
            CoordinatorID: parseInt(config.coordinatorID),
            Payers: "", // 留空表示 All
            FromDate: "",
            ToDate: "",
            OfficeIDs: officeData.OfficeIDs,
            ReasonIDs: "", // 留空表示 All
        };
        console.log("[HomePage] API request:", requestBody);
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                AppSecret: appSecret,
                AppName: "ENT",
            },
            body: JSON.stringify(requestBody),
        });
        if (response.ok) {
            const data = await response.json();
            console.log("[HomePage] API search succeeded, results:", data);
            // 触发页面刷新以显示搜索结果
            // Angular 应用会自动更新 UI
            return true;
        }
        else {
            console.error("[HomePage] API search failed:", response.status, response.statusText);
            return false;
        }
    }
    catch (error) {
        console.error("[HomePage] API search error:", error);
        return false;
    }
}
/**
 * 传统 UI 自动化方式（回退方案）
 * 保留原有逻辑作为 API 失败时的 fallback
 */
async function legacyUIAutomation() {
    const config = getHomePageConfig();
    const iframe = getTargetIframe();
    if (!iframe) {
        console.error("[HomePage] Iframe not found");
        return false;
    }
    const doc = iframe.contentDocument;
    if (!doc) {
        console.error("[HomePage] Iframe document not accessible");
        return false;
    }
    try {
        await sleep(100);
        // 使用 iframe 的 document 作为 jQuery context
        const $iframe = (selector) => $(selector, doc);
        // 1. 设置 Communication Type = "Patient"
        const communicationType = $iframe(homePageCommunicationTypeSelector);
        for (const option of $iframe(homePageCommunicationTypeOptionSelector)) {
            if ("Patient" == option.innerText) {
                communicationType.val(option.getAttribute("value"));
                communicationType[0].dispatchEvent(new Event("change"));
                console.log("[HomePage] Communication Type set to Patient");
                break;
            }
        }
        // 等待 Coordinator 下拉菜单出现（最多等待 3 秒）
        let coordinator = $iframe(homePageCoordinatorSelector);
        let retries = 0;
        const maxRetries = 30; // 30 * 100ms = 3 秒
        while (coordinator.length === 0 && retries < maxRetries) {
            await sleep(100);
            coordinator = $iframe(homePageCoordinatorSelector);
            retries++;
        }
        if (coordinator.length === 0) {
            console.error("[HomePage] Coordinator dropdown not found after waiting");
            return false;
        }
        console.log("[HomePage] Coordinator dropdown found after", retries * 100, "ms");
        // 2. 设置 Coordinator（使用配置的 ID）
        // 注意：Angular 下拉菜单的 option value 是 coordinatorID（如 "8058"）
        let coordinatorFound = false;
        for (const option of $iframe(homePageCoordinatorOptionSelector)) {
            const optionValue = option.getAttribute("value");
            // 使用 coordinatorID 来匹配
            if (optionValue === config.coordinatorID) {
                coordinator.val(optionValue);
                coordinator[0].dispatchEvent(new Event("change"));
                coordinatorFound = true;
                console.log("[HomePage] Coordinator set via UI:", config.coordinatorText, "(ID:", config.coordinatorID, ")");
                break;
            }
        }
        if (!coordinatorFound) {
            console.error("[HomePage] Coordinator not found in dropdown. ID:", config.coordinatorID, "Text:", config.coordinatorText);
            // 输出所有可用选项以便调试
            const availableOptions = $iframe(homePageCoordinatorOptionSelector)
                .map((i, el) => $(el).val())
                .get();
            console.error("[HomePage] Available coordinator IDs:", availableOptions);
            return false;
        }
        await sleep(300);
        // 3. 设置 Status（使用配置的 status）
        const status = $iframe(homePagestatusSelector);
        const statusMap = {
            "-1": "All",
            "1": "Open",
            "2": "Closed",
        };
        const statusText = statusMap[config.status] || "Open";
        for (const option of $iframe(homePagestatusOptionSelector)) {
            if (statusText == option.innerText) {
                status.val(option.getAttribute("value"));
                status[0].dispatchEvent(new Event("change"));
                break;
            }
        }
        await sleep(100);
        // 4. 点击搜索按钮
        $iframe(homePageSearchButtonSelector)[0].click();
        console.log("[HomePage] UI automation search triggered");
        return true;
    }
    catch (error) {
        console.error("[HomePage] Legacy UI automation error:", error);
        return false;
    }
}
/**
 * HomePage Selector 主函数（UI-First 策略）
 * 使用 UI 自动化触发 Angular 原生搜索，确保结果正确显示
 * 注意：直接 API 调用不会触发 Angular 数据绑定更新 UI
 */
const homePageSelector = async () => {
    console.log("[HomePage] ========== Button Clicked ==========");
    console.log("[HomePage] Selector started (UI-First mode)");
    // 检查配置
    const config = getHomePageConfig();
    console.log("[HomePage] Current config:", config);
    if (!config.coordinatorID) {
        console.error("[HomePage] No coordinator configured");
        alert("⚠️ Please configure a coordinator first (hover over the button)");
        return;
    }
    // 使用 UI 自动化触发搜索（Angular 应用需要通过原生 UI 交互来更新视图）
    console.log("[HomePage] Using UI automation to trigger Angular search...");
    const uiSuccess = await legacyUIAutomation();
    if (uiSuccess) {
        console.log("[HomePage] ✅ UI automation search succeeded");
    }
    else {
        console.error("[HomePage] ❌ UI automation failed");
        alert("❌ Search failed. Please try again or search manually.");
    }
    console.log("[HomePage] =========================================");
};
/**
 * 检测当前是否在 Linked Communication Tab (#msg)
 */
function isLinkedCommunicationTab() {
    return window.location.hash === "#msg";
}
/**
 * 初始化 hashchange 监听器
 * 当用户切换 Tab 时，自动显示/隐藏按钮
 */
function initHashChangeListener() {
    window.addEventListener("hashchange", () => {
        const btn = document.getElementById("homePageSelector");
        if (btn) {
            btn.style.display = isLinkedCommunicationTab() ? "" : "none";
        }
    });
    console.log("[HomePage] Hash change listener initialized");
}
// ============================================================================
// Story 3: 配置卡片 UI 函数
// ============================================================================
/**
 * 渲染 coordinator 列表（单选 radio）
 */
function HomePage_renderCoordinatorList(options, selectedId) {
    const container = document.getElementById("hp-coordinator-options");
    if (!container)
        return;
    container.innerHTML = "";
    if (options.length === 0) {
        container.innerHTML =
            '<div class="no-results">⚠️ No coordinators available</div>';
        return;
    }
    options.forEach((opt) => {
        // Use String() to ensure consistent type comparison
        const checked = String(opt.CoordinatorID) === String(selectedId) ? "checked" : "";
        const div = document.createElement("div");
        div.className = "coordinator-option";
        div.setAttribute("data-coordinator-id", opt.CoordinatorID);
        div.setAttribute("data-coordinator-name", opt.CoordinatorName);
        div.innerHTML = `
      <input type="radio" 
             name="hp-coordinator" 
             id="hp-coord-${opt.CoordinatorID}" 
             value="${opt.CoordinatorID}"
             aria-label="${opt.CoordinatorName}"
             ${checked}>
      <label class="coordinator-label" for="hp-coord-${opt.CoordinatorID}">
        ${opt.CoordinatorName}
      </label>
    `;
        container.appendChild(div);
    });
}
/**
 * 初始化搜索/过滤功能
 */
function initCoordinatorSearch() {
    const searchInput = document.getElementById("hp-coordinator-search");
    if (!searchInput)
        return;
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();
        const options = document.querySelectorAll(".coordinator-option");
        let visibleCount = 0;
        options.forEach((option) => {
            const name = option.getAttribute("data-coordinator-name") || "";
            if (name.toLowerCase().includes(query)) {
                option.classList.remove("hidden");
                visibleCount++;
            }
            else {
                option.classList.add("hidden");
            }
        });
        // 显示无结果提示
        const container = document.getElementById("hp-coordinator-options");
        if (container) {
            const noResults = container.querySelector(".no-results");
            if (visibleCount === 0 && !noResults) {
                const div = document.createElement("div");
                div.className = "no-results";
                div.textContent = "🔍 No coordinators found";
                container.appendChild(div);
            }
            else if (visibleCount > 0 && noResults) {
                noResults.remove();
            }
        }
    });
}
/**
 * 更新按钮文本显示选中的 Coordinator
 */
function HomePage_updateButtonText(btn, coordinatorText) {
    // 提取前两个单词作为按钮显示（如 "Tao Yang"）
    const words = coordinatorText.split(/\s+/);
    const shortName = words.slice(0, 2).join(" ");
    btn.value = `Search: ${shortName}`;
}
/**
 * 保存配置按钮处理
 */
function handleSaveConfiguration() {
    console.log("[HomePage] handleSaveConfiguration called");
    const selectedRadio = document.querySelector('input[name="hp-coordinator"]:checked');
    if (!selectedRadio) {
        console.warn("[HomePage] No coordinator selected");
        alert("⚠️ Please select a coordinator");
        return;
    }
    const coordinatorID = selectedRadio.value;
    const optionDiv = selectedRadio.closest(".coordinator-option");
    const coordinatorText = optionDiv?.getAttribute("data-coordinator-name") || "";
    console.log("[HomePage] Saving config:", { coordinatorID, coordinatorText });
    // 保存配置
    saveHomePageConfig({
        coordinatorID,
        coordinatorText,
        status: "1", // 默认使用 Open 状态
    });
    // 更新按钮文本
    const btn = document.getElementById("homePageSelector");
    if (btn) {
        HomePage_updateButtonText(btn, coordinatorText);
        console.log("[HomePage] Button text updated to:", btn.value);
    }
    // 关闭配置卡片
    HomePage_hideConfigCard();
    console.log("[HomePage] ✅ Configuration saved successfully");
    // Note: No alert popup - user feedback via button text update
}
/**
 * 取消/关闭配置卡片
 */
function HomePage_hideConfigCard() {
    const card = document.getElementById("homepage-config-card");
    if (card) {
        card.classList.remove("show");
        setTimeout(() => {
            card.style.display = "none";
        }, 200);
    }
    // 重置搜索框
    const searchInput = document.getElementById("hp-coordinator-search");
    if (searchInput) {
        searchInput.value = "";
        // 触发 input 事件重置过滤
        searchInput.dispatchEvent(new Event("input"));
    }
}
/**
 * 显示配置卡片
 */
async function HomePage_showConfigCard() {
    const card = document.getElementById("homepage-config-card");
    if (!card) {
        console.error("[HomePage] Config card not found");
        return;
    }
    console.log("[HomePage] Showing config card...");
    // 获取配置
    const config = getHomePageConfig();
    // 第一次显示时强制刷新缓存
    const forceRefresh = !coordinatorsLoadedOnce;
    if (forceRefresh) {
        console.log("[HomePage] First time showing card, forcing cache refresh");
        coordinatorsLoadedOnce = true;
    }
    // 获取 Coordinator 列表
    const options = await getCoordinators(forceRefresh);
    if (options.length > 0) {
        HomePage_renderCoordinatorList(options, config.coordinatorID);
    }
    else {
        const container = document.getElementById("hp-coordinator-options");
        if (container) {
            container.innerHTML =
                '<div class="no-results">⚠️ Failed to load coordinators</div>';
        }
    }
    // 显示卡片 - CRITICAL: 必须先设置display再添加class
    card.style.display = "block";
    setTimeout(() => {
        card.classList.add("show");
    }, 10);
    console.log("[HomePage] Config card displayed");
}
/**
 * 初始化配置卡片事件监听
 * - Hover 显示/隐藏逻辑
 * - 保存/取消按钮事件
 * - 键盘导航支持
 */
function HomePage_initConfigCardEvents() {
    let hoverTimer = null;
    let hideTimer = null;
    let isCardHovered = false;
    const btn = document.getElementById("homePageSelector");
    const card = document.getElementById("homepage-config-card");
    if (!btn || !card)
        return;
    // 按钮 hover 显示卡片（延迟 300ms）
    btn.addEventListener("mouseenter", () => {
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
        hoverTimer = window.setTimeout(() => {
            HomePage_showConfigCard();
        }, 300);
    });
    btn.addEventListener("mouseleave", () => {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
        if (!isCardHovered) {
            hideTimer = window.setTimeout(() => {
                HomePage_hideConfigCard();
            }, 200);
        }
    });
    // 卡片 hover 保持显示
    card.addEventListener("mouseenter", () => {
        isCardHovered = true;
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
    });
    card.addEventListener("mouseleave", () => {
        isCardHovered = false;
        hideTimer = window.setTimeout(() => {
            HomePage_hideConfigCard();
        }, 200);
    });
    // 保存按钮
    const saveBtn = document.getElementById("hp-save-config-btn");
    saveBtn?.addEventListener("click", handleSaveConfiguration);
    // 取消/关闭按钮
    const cancelBtn = document.getElementById("hp-cancel-config-btn");
    const closeBtn = document.getElementById("hp-config-close-x");
    cancelBtn?.addEventListener("click", HomePage_hideConfigCard);
    closeBtn?.addEventListener("click", HomePage_hideConfigCard);
    // 键盘支持（Escape 关闭卡片）
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && card.classList.contains("show")) {
            HomePage_hideConfigCard();
        }
    });
    // Enter 键保存（当焦点在配置卡片内时）
    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" &&
            e.target instanceof HTMLInputElement &&
            e.target.type === "radio") {
            handleSaveConfiguration();
        }
    });
    // 初始化搜索过滤
    initCoordinatorSearch();
    console.log("[HomePage] Config card events initialized");
}
/**
 * 初始化配置卡片 UI
 * 创建 HTML 结构并附加到按钮
 */
function initHomePageConfigCardUI() {
    // 等待按钮创建
    const checkBtn = setInterval(() => {
        const btn = document.getElementById("homePageSelector");
        if (btn) {
            clearInterval(checkBtn);
            // 检查是否已创建配置卡片
            if (document.getElementById("homepage-config-card")) {
                console.log("[HomePage] Config card already exists");
                return;
            }
            // 创建配置卡片 HTML
            const cardHTML = `
        <div id="homepage-config-card" role="dialog" aria-label="Coordinator Selection">
          <div class="config-card-header">
            <h3>🔍 Search by Coordinator 配置</h3>
            <button class="config-close-btn" id="hp-config-close-x" aria-label="Close configuration">×</button>
          </div>
          <div class="config-card-body">
            <label for="hp-coordinator-search">选择 Coordinator:</label>
            <input type="text" 
                   id="hp-coordinator-search" 
                   class="config-search-input" 
                   placeholder="搜索 Coordinator..."
                   aria-label="Search coordinators">
            <div id="hp-coordinator-options" 
                 class="coordinator-list" 
                 role="radiogroup" 
                 aria-label="Coordinator options">
              <!-- Coordinator options will be rendered here -->
            </div>
          </div>
          <div class="config-card-footer">
            <button id="hp-save-config-btn" class="btn-primary" aria-label="Save configuration">💾 保存配置</button>
            <button id="hp-cancel-config-btn" class="btn-secondary" aria-label="Cancel">❌ 取消</button>
          </div>
        </div>
      `;
            // 将卡片附加到按钮的父元素
            const btnParent = btn.parentElement;
            if (btnParent) {
                // 创建临时容器
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = cardHTML;
                const card = tempDiv.firstElementChild;
                if (card) {
                    btnParent.appendChild(card);
                    console.log("[HomePage] Config card UI created");
                    // 初始化事件监听
                    HomePage_initConfigCardEvents();
                    // 根据当前配置更新按钮文本
                    const config = getHomePageConfig();
                    // Update button text if coordinatorID is configured (any saved coordinator)
                    if (config.coordinatorID && config.coordinatorText) {
                        HomePage_updateButtonText(btn, config.coordinatorText);
                        console.log("[HomePage] Button text restored from saved config:", config.coordinatorText);
                    }
                }
            }
        }
    }, 1000);
}

;// ./src/js/MultiTabPanel.ts
/**
 * LocalStorage Keys for Multi-Tab Panel
 */
const STORAGE_KEYS = {
    ACTIVE_TAB: "hha_smart_assistant_active_tab",
    TAB_BAR_COLLAPSED: "hha_smart_assistant_tab_bar_collapsed",
};
/**
 * Multi-Tab Panel System
 * Reference: ADR 007 - Multi-tab Panel Architecture
 *
 * Features:
 * - Left sidebar tab navigation
 * - Collapsible tab bar (80px → 40px)
 * - LocalStorage state persistence
 * - Show/Hide DOM switching (state preserved)
 */
class MultiTabPanel {
    constructor(container, config = {}) {
        this.panelEl = null;
        this.tabBarEl = null;
        this.contentAreaEl = null;
        this.tabs = new Map();
        this.tabContents = new Map();
        this.activeTabId = "";
        this.isCollapsed = false;
        this.container = container;
        this.config = {
            title: config.title ?? "HHAexchange Smart Assistant",
            defaultTabId: config.defaultTabId ?? "",
            showHeaderControls: config.showHeaderControls ?? false,
            initialCollapsed: config.initialCollapsed ?? false,
        };
        this.loadState();
    }
    /**
     * Register a tab
     */
    registerTab(tab) {
        this.tabs.set(tab.id, tab);
        // Set default active tab if not set
        if (!this.activeTabId) {
            this.activeTabId = tab.id;
        }
    }
    /**
     * Initialize and render the panel
     */
    async init() {
        this.render();
        await this.initializeDefaultTab();
    }
    /**
     * Render the panel structure
     */
    render() {
        // Create panel container
        this.panelEl = document.createElement("div");
        this.panelEl.className = "hha-smart-panel";
        // Render header
        const header = this.renderHeader();
        this.panelEl.appendChild(header);
        // Render body (tab bar + content area)
        const body = this.renderBody();
        this.panelEl.appendChild(body);
        this.container.appendChild(this.panelEl);
        // Apply collapsed state
        if (this.isCollapsed) {
            this.tabBarEl?.classList.add("collapsed");
        }
    }
    /**
     * Render panel header
     */
    renderHeader() {
        const header = document.createElement("div");
        header.className = "hha-smart-panel-header";
        // Title
        const title = document.createElement("div");
        title.className = "hha-smart-panel-title";
        title.textContent = this.config.title;
        header.appendChild(title);
        // Controls - only show if showHeaderControls is true
        if (this.config.showHeaderControls) {
            const controls = document.createElement("div");
            controls.className = "hha-smart-panel-controls";
            // Minimize button
            const minimizeBtn = document.createElement("button");
            minimizeBtn.className = "hha-smart-panel-btn";
            minimizeBtn.innerHTML = "−";
            minimizeBtn.title = "Minimize";
            minimizeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.minimize();
            });
            // Close button
            const closeBtn = document.createElement("button");
            closeBtn.className = "hha-smart-panel-btn";
            closeBtn.innerHTML = "×";
            closeBtn.title = "Close";
            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.close();
            });
            controls.appendChild(minimizeBtn);
            controls.appendChild(closeBtn);
            header.appendChild(controls);
        }
        return header;
    }
    /**
     * Render panel body
     */
    renderBody() {
        const body = document.createElement("div");
        body.className = "hha-smart-panel-body";
        // Content wrapper (tab bar + content area in a row)
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "hha-smart-content-wrapper";
        // Tab bar
        this.tabBarEl = this.renderTabBar();
        contentWrapper.appendChild(this.tabBarEl);
        // Content area
        this.contentAreaEl = this.renderContentArea();
        contentWrapper.appendChild(this.contentAreaEl);
        body.appendChild(contentWrapper);
        // Footer
        const footer = this.renderFooter();
        body.appendChild(footer);
        return body;
    }
    /**
     * Render tab bar
     */
    renderTabBar() {
        const tabBar = document.createElement("div");
        tabBar.className = "hha-smart-tab-bar";
        // Tab list
        const tabList = document.createElement("div");
        tabList.className = "hha-smart-tab-list";
        this.tabs.forEach((tab) => {
            const tabItem = this.renderTabItem(tab);
            tabList.appendChild(tabItem);
        });
        tabBar.appendChild(tabList);
        // Collapse button
        const collapseBtn = this.renderCollapseButton();
        tabBar.appendChild(collapseBtn);
        return tabBar;
    }
    /**
     * Render a single tab item
     */
    renderTabItem(tab) {
        const tabItem = document.createElement("div");
        tabItem.className = "hha-smart-tab-item";
        tabItem.dataset.tabId = tab.id;
        if (tab.id === this.activeTabId) {
            tabItem.classList.add("active");
        }
        // Indicator
        const indicator = document.createElement("div");
        indicator.className = "hha-smart-tab-indicator";
        // Icon
        const icon = document.createElement("span");
        icon.className = "hha-smart-tab-icon";
        icon.textContent = tab.icon;
        // Text
        const text = document.createElement("span");
        text.className = "hha-smart-tab-text";
        text.textContent = tab.label;
        tabItem.appendChild(indicator);
        tabItem.appendChild(icon);
        tabItem.appendChild(text);
        // Click event
        tabItem.addEventListener("click", () => {
            this.switchTab(tab.id);
        });
        return tabItem;
    }
    /**
     * Render collapse button
     * 参考 VisitMonitor.ts 的按钮实现，确保可点击
     */
    renderCollapseButton() {
        const collapseBtn = document.createElement("div");
        collapseBtn.className = "hha-smart-tab-collapse-btn";
        collapseBtn.title = "Collapse/Expand";
        // 确保按钮在顶层且可点击
        collapseBtn.style.cssText =
            "position: relative; z-index: 10; cursor: pointer;";
        const icon = document.createElement("span");
        icon.className = "hha-smart-collapse-icon";
        icon.textContent = "◀";
        collapseBtn.appendChild(icon);
        // 使用mousedown+click双重确保事件触发
        collapseBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.toggleCollapse();
        });
        return collapseBtn;
    }
    /**
     * Render content area
     */
    renderContentArea() {
        const contentArea = document.createElement("div");
        contentArea.className = "hha-smart-content-area";
        // Create content containers for each tab
        this.tabs.forEach((tab) => {
            const contentDiv = document.createElement("div");
            contentDiv.className = "hha-smart-tab-content";
            contentDiv.dataset.tabId = tab.id;
            if (tab.id === this.activeTabId) {
                contentDiv.classList.add("active");
            }
            this.tabContents.set(tab.id, contentDiv);
            contentArea.appendChild(contentDiv);
        });
        return contentArea;
    }
    /**
     * Render footer with branding
     */
    renderFooter() {
        const footer = document.createElement("div");
        footer.className = "hha-smart-panel-footer";
        const branding = document.createElement("div");
        branding.className = "footer-branding";
        branding.textContent = "Powered by KurosakiRei";
        footer.appendChild(branding);
        return footer;
    }
    /**
     * Initialize the default active tab
     */
    async initializeDefaultTab() {
        const tab = this.tabs.get(this.activeTabId);
        if (!tab)
            return;
        const container = this.tabContents.get(this.activeTabId);
        if (!container)
            return;
        // CRITICAL: Render first to create DOM elements, then init to load data
        tab.render(container);
        await tab.init();
    }
    /**
     * Switch to a different tab
     */
    async switchTab(tabId) {
        if (tabId === this.activeTabId)
            return;
        const tab = this.tabs.get(tabId);
        if (!tab)
            return;
        // Deactivate current tab
        const currentTab = this.tabs.get(this.activeTabId);
        currentTab?.onDeactivate?.();
        // Update active state
        this.activeTabId = tabId;
        this.saveActiveTab();
        // Update UI - this controls which tab content is visible via CSS
        this.updateTabBarUI();
        this.updateContentAreaUI();
        // Initialize and render new tab if not yet done
        const container = this.tabContents.get(tabId);
        if (container && container.children.length === 0) {
            // CRITICAL: Render first to create DOM elements, then init to load data
            tab.render(container);
            if (!tab.initialized) {
                await tab.init();
            }
        }
        // Activate new tab
        tab.onActivate?.();
    }
    /**
     * Update tab bar UI to reflect active state
     */
    updateTabBarUI() {
        const tabItems = this.tabBarEl?.querySelectorAll(".hha-smart-tab-item");
        tabItems?.forEach((item) => {
            const tabId = item.dataset.tabId;
            if (tabId === this.activeTabId) {
                item.classList.add("active");
            }
            else {
                item.classList.remove("active");
            }
        });
    }
    /**
     * Update content area UI to show active tab
     */
    updateContentAreaUI() {
        this.tabContents.forEach((content, tabId) => {
            if (tabId === this.activeTabId) {
                content.classList.add("active");
            }
            else {
                content.classList.remove("active");
            }
        });
    }
    /**
     * Toggle tab bar collapse state
     */
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.saveCollapseState();
        if (this.isCollapsed) {
            this.tabBarEl?.classList.add("collapsed");
        }
        else {
            this.tabBarEl?.classList.remove("collapsed");
        }
    }
    /**
     * Minimize panel (hide)
     */
    minimize() {
        if (this.panelEl) {
            this.panelEl.style.display = "none";
        }
    }
    /**
     * Close panel (hide, not destroy)
     * This allows the panel to be reopened without losing state
     */
    close() {
        // Hide the container (parent of panelEl)
        if (this.container) {
            this.container.style.display = "none";
            console.log("[MultiTabPanel] Panel closed (hidden)");
        }
    }
    /**
     * Show panel
     */
    show() {
        if (this.panelEl) {
            this.panelEl.style.display = "flex";
        }
    }
    // ===== LocalStorage State Management =====
    loadState() {
        // Load active tab
        const savedTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
        if (savedTab) {
            this.activeTabId = savedTab;
        }
        else if (this.config.defaultTabId) {
            this.activeTabId = this.config.defaultTabId;
        }
        // Load collapse state
        const collapsed = localStorage.getItem(STORAGE_KEYS.TAB_BAR_COLLAPSED);
        this.isCollapsed = collapsed === "true" || this.config.initialCollapsed;
    }
    saveActiveTab() {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, this.activeTabId);
    }
    saveCollapseState() {
        localStorage.setItem(STORAGE_KEYS.TAB_BAR_COLLAPSED, String(this.isCollapsed));
    }
}

;// ./src/js/tabs/BaseTab.ts
/**
 * Base Tab Abstract Class
 * Provides common functionality for all tabs
 */
class BaseTab {
    constructor() {
        this.container = null;
        this.initialized = false;
    }
    async init() {
        // Override in subclass if initialization is needed
    }
    destroy() {
        if (this.container) {
            this.container.innerHTML = "";
            this.container = null;
        }
        this.initialized = false;
    }
    onActivate() {
        // Override in subclass if needed
    }
    onDeactivate() {
        // Override in subclass if needed
    }
    /**
     * Create a config card UI component
     */
    createConfigCard(title, content) {
        const card = document.createElement("div");
        card.className = "hha-smart-config-card";
        const titleEl = document.createElement("div");
        titleEl.className = "hha-smart-config-card-title";
        titleEl.textContent = title;
        const bodyEl = document.createElement("div");
        bodyEl.className = "hha-smart-config-card-body";
        bodyEl.appendChild(content);
        card.appendChild(titleEl);
        card.appendChild(bodyEl);
        return card;
    }
    /**
     * Create a primary button
     */
    createButton(text, onClick, isPrimary = true) {
        const button = document.createElement("button");
        button.className = isPrimary
            ? "hha-smart-btn-primary"
            : "hha-smart-btn-secondary";
        button.textContent = text;
        button.addEventListener("click", onClick);
        return button;
    }
    /**
     * Create a placeholder UI
     */
    createPlaceholder(icon, title, text) {
        const placeholder = document.createElement("div");
        placeholder.className = "hha-smart-placeholder";
        placeholder.innerHTML = `
      <div class="hha-smart-placeholder-icon">${icon}</div>
      <div class="hha-smart-placeholder-title">${title}</div>
      <div class="hha-smart-placeholder-text">${text}</div>
    `;
        return placeholder;
    }
}

;// ./src/js/tabs/StatusTrackingTab.ts

/**
 * Status Tracking Tab
 * Story 7.2: 状态追踪 Tab 集成
 *
 * Wraps the existing VisitMonitor functionality
 */
class StatusTrackingTab extends BaseTab {
    constructor() {
        super(...arguments);
        this.id = "status-tracking";
        this.label = "状态追踪";
        this.icon = "📊";
        this.visitMonitorInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 20; // 最多重试 20 次 (20 * 300ms = 6秒)
    }
    async init() {
        // VisitMonitor will be initialized when rendered
        this.initialized = true;
    }
    render(container) {
        this.container = container;
        // 只添加 status-tracking-tab class，不要覆盖原有的 class
        container.classList.add("status-tracking-tab");
        // Create a wrapper for the visit monitor
        const wrapper = document.createElement("div");
        wrapper.id = "status-tracking-wrapper";
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";
        container.appendChild(wrapper);
        // The VisitMonitor has already been initialized by main()
        // We just need to wait for it and embed it
        if (!this.visitMonitorInitialized) {
            this.retryCount = 0;
            this.embedExistingVisitMonitor(wrapper);
        }
    }
    embedExistingVisitMonitor(container) {
        // Check if tracker-panel exists, retry if not
        const trackerPanel = document.getElementById("tracker-panel");
        if (trackerPanel) {
            this.embedVisitMonitorPanel(container);
            this.visitMonitorInitialized = true;
            console.log("[StatusTrackingTab] VisitMonitor panel embedded successfully");
        }
        else if (this.retryCount < this.maxRetries) {
            // Retry after delay
            this.retryCount++;
            console.log(`[StatusTrackingTab] Waiting for tracker-panel... (attempt ${this.retryCount}/${this.maxRetries})`);
            setTimeout(() => {
                this.embedExistingVisitMonitor(container);
            }, 300);
        }
        else {
            console.error("[StatusTrackingTab] Failed to find tracker-panel after max retries");
            // Show error message in container
            container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #666;">
          <p>⚠️ 无法加载状态追踪面板</p>
          <p style="font-size: 12px;">请刷新页面重试</p>
        </div>
      `;
        }
    }
    /**
     * Find and embed the VisitMonitor panel into our tab container
     *
     * CRITICAL FIX (Epic 7, Story 7.2):
     * - Move the original tracker-panel (NOT clone) to preserve event listeners
     * - cloneNode(true) does NOT copy addEventListener bindings
     * - This fixes "编辑追踪列表" button click handler not working
     *
     * ARCHITECTURE:
     * - tracker-panel is moved from tracker-container into our tab
     * - The bell button (tracker-drag-handle) stays in tracker-container
     * - When Multi-Tab Panel is hidden, we move tracker-panel back to tracker-container
     */
    embedVisitMonitorPanel(container) {
        const trackerPanel = document.getElementById("tracker-panel");
        if (trackerPanel) {
            // CRITICAL: Move (not clone) the original panel to preserve all event listeners
            // Remove from tracker-container
            if (trackerPanel.parentElement) {
                trackerPanel.parentElement.removeChild(trackerPanel);
            }
            // Reset positioning styles to fit in tab container
            // CRITICAL: 必须设置 display: block 因为 VisitMonitor 可能设置了 display: none
            // Epic 10 修复: 使用 height: 100% 填充父容器，避免内容溢出
            trackerPanel.style.cssText = `
        display: flex !important;
        flex-direction: column !important;
        position: static !important;
        width: 100% !important;
        max-width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow: hidden !important;
        top: auto !important;
        left: auto !important;
        right: auto !important;
        bottom: auto !important;
        transform: none !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        z-index: 1 !important;
      `;
            // Hide close/minimize buttons in embedded version
            const closeBtn = trackerPanel.querySelector('[title*="关闭"], [title*="Close"]');
            if (closeBtn) {
                closeBtn.style.display = "none";
            }
            const minimizeBtn = trackerPanel.querySelector('[title*="最小化"], [title*="Minimize"]');
            if (minimizeBtn) {
                minimizeBtn.style.display = "none";
            }
            // Append to our tab container
            container.appendChild(trackerPanel);
            // CRITICAL: Watch for display changes and force it to stay visible
            // VisitMonitor's bell click handler might try to change display
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "attributes" &&
                        mutation.attributeName === "style") {
                        const panel = mutation.target;
                        if (panel.style.display !== "block") {
                            panel.style.display = "block";
                            console.log("[StatusTrackingTab] Forced tracker-panel to stay visible");
                        }
                    }
                });
            });
            observer.observe(trackerPanel, {
                attributes: true,
                attributeFilter: ["style"],
            });
            console.log("[StatusTrackingTab] VisitMonitor panel moved successfully (preserves event listeners)");
        }
        else {
            console.warn("[StatusTrackingTab] VisitMonitor panel not found, showing placeholder");
            this.showPlaceholder(container);
        }
    }
    /**
     * Show placeholder if VisitMonitor panel cannot be found
     */
    showPlaceholder(container) {
        const placeholder = document.createElement("div");
        placeholder.className = "hha-smart-config-card";
        placeholder.innerHTML = `
      <div class="hha-smart-config-card-title">📊 状态追踪</div>
      <div class="hha-smart-config-card-body">
        <p style="color: #666; margin-bottom: 12px;">
          正在加载 Visit Monitor 功能...
        </p>
        <p style="color: #999; font-size: 13px;">
          即将支持：
        </p>
        <ul style="color: #999; font-size: 13px; margin-left: 20px;">
          <li>Coordinator 筛选</li>
          <li>实时状态追踪</li>
          <li>异常打钟监控</li>
          <li>消息通知</li>
        </ul>
      </div>
    `;
        container.appendChild(placeholder);
    }
    onActivate() {
        console.log("[StatusTrackingTab] Activated");
    }
    onDeactivate() {
        console.log("[StatusTrackingTab] Deactivated");
    }
}

;// ./src/js/services/ApiParamProvider.ts
/**
 * ApiParamProvider - Shared API Parameter Provider (Singleton)
 *
 * This module provides a centralized way to obtain API parameters needed for
 * HHAexchange API calls. It supports fetching parameters from both:
 * - app.hhaexchange.com (main application)
 * - reports.hhaexchange.com (reports domain)
 *
 * @author HHA Smart Assistant
 * @date 2026-01-08
 * @see docs/stories/epic-8-qa-report-feature.md - Story 8.1
 * @see docs/adr/008-qa-report-tab-implementation.md
 */

// ============================================================================
// Constants
// ============================================================================
const CALL_MAINTENANCE_URL = "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes cache
// ============================================================================
// ApiParamProvider Class (Singleton)
// ============================================================================
/**
 * ApiParamProvider - Singleton class for managing API parameters
 *
 * Features:
 * - Single instance across all modules (singleton pattern)
 * - Supports both app and reports domains
 * - Automatic caching with configurable expiry
 * - ViewState parsing and updating
 *
 * Usage:
 * ```typescript
 * const provider = ApiParamProvider.getInstance();
 * const params = await provider.getParams();
 * ```
 */
class ApiParamProvider {
    /**
     * Private constructor to enforce singleton pattern
     */
    constructor() {
        // Cached parameters
        this.appParams = null;
        this.reportsParams = null;
        this.cacheTimestamp = 0;
        console.log("[ApiParamProvider] Singleton instance created");
    }
    /**
     * Get the singleton instance of ApiParamProvider
     */
    static getInstance() {
        if (!ApiParamProvider.instance) {
            ApiParamProvider.instance = new ApiParamProvider();
        }
        return ApiParamProvider.instance;
    }
    /**
     * Reset the singleton instance (for testing purposes)
     */
    static resetInstance() {
        ApiParamProvider.instance = null;
    }
    // ==========================================================================
    // Public Methods
    // ==========================================================================
    /**
     * Get API parameters for app.hhaexchange.com
     * @returns Full API parameters including ViewState
     */
    async getParams() {
        // Return cached params if still valid
        if (this.appParams && !this.isCacheExpired()) {
            console.log("[ApiParamProvider] Returning cached app params");
            return this.appParams;
        }
        console.log("[ApiParamProvider] Fetching app params from CallMaintenance...");
        this.appParams = await this.fetchFromAppPage();
        this.cacheTimestamp = Date.now();
        return this.appParams;
    }
    /**
     * Get session info for reports.hhaexchange.com
     * @returns Session info for reports API calls
     */
    getReportsSessionInfo() {
        // Return cached params if available
        if (this.reportsParams) {
            return this.reportsParams;
        }
        // Try to extract from current page
        this.reportsParams = this.extractFromReportsPage();
        return this.reportsParams;
    }
    /**
     * Get session info, automatically detecting source
     * @returns Session info for API calls
     */
    async getSessionInfo() {
        // Try reports page first if we're on reports domain
        if (this.isReportsPage()) {
            const reportsInfo = this.getReportsSessionInfo();
            if (reportsInfo) {
                return reportsInfo;
            }
        }
        // Fall back to app params
        const appParams = await this.getParams();
        return {
            sessionId: appParams.sessionID,
            userId: appParams.userID,
            officeIds: "", // Need to get from JWT token
            version: appParams.version,
            minorVersion: appParams.minorVersion,
            appVersion: appParams.appVersion,
        };
    }
    /**
     * Parse ViewState from HTML and update cached params
     * @param htmlText - HTML content containing ViewState
     * @returns Extracted ViewState values
     */
    parseViewState(htmlText) {
        const viewState = this.getInputValue("__VIEWSTATE", htmlText);
        const viewStateGenerator = this.getInputValue("__VIEWSTATEGENERATOR", htmlText);
        // Update cached params if available
        if (this.appParams) {
            if (viewState) {
                this.appParams.viewState = viewState;
            }
            if (viewStateGenerator) {
                this.appParams.viewStateGenerator = viewStateGenerator;
            }
        }
        return {
            viewState: viewState || "",
            viewStateGenerator: viewStateGenerator || "",
        };
    }
    /**
     * Check if we're on the reports.hhaexchange.com domain
     */
    isReportsPage() {
        return window.location.hostname.includes("reports.hhaexchange.com");
    }
    /**
     * Check if we're on the app.hhaexchange.com domain
     */
    isAppPage() {
        return window.location.hostname.includes("app.hhaexchange.com");
    }
    /**
     * Clear all cached parameters
     */
    clearCache() {
        this.appParams = null;
        this.reportsParams = null;
        this.cacheTimestamp = 0;
        console.log("[ApiParamProvider] Cache cleared");
    }
    /**
     * Get office IDs from JWT token
     */
    getOfficeIdsFromToken() {
        try {
            const tokenMatch = document.cookie.match(/HHAX_ENT_AccessToken=([^;]+)/);
            if (tokenMatch) {
                const payload = JSON.parse(atob(tokenMatch[1].split(".")[1]));
                return payload.pid || "";
            }
        }
        catch (e) {
            console.warn("[ApiParamProvider] Failed to parse JWT token:", e);
        }
        return "";
    }
    // ==========================================================================
    // Private Methods
    // ==========================================================================
    /**
     * Check if cache has expired
     */
    isCacheExpired() {
        return Date.now() - this.cacheTimestamp > CACHE_EXPIRY_MS;
    }
    /**
     * Fetch API parameters from app.hhaexchange.com CallMaintenance page
     */
    async fetchFromAppPage() {
        const r = (await GM_fetch(CALL_MAINTENANCE_URL, {
            method: "GET",
        }));
        const text = await r.rawBody.text();
        const params = {
            userID: this.getParamFromText("userID", text),
            appSecret: this.getParamFromText("appSecret", text),
            appVersion: this.getParamFromText("appVersion", text),
            version: this.getParamFromText("version", text),
            minorVersion: this.getParamFromText("minorVersion", text),
            appName: this.getParamFromText("appName", text),
            sessionID: this.getParamFromText("sessionID", text),
            vendorID: this.getParamFromText("vendorID", text),
            viewState: this.getInputValue("__VIEWSTATE", text),
            viewStateGenerator: this.getInputValue("__VIEWSTATEGENERATOR", text),
        };
        // Validate all required parameters
        for (const [key, value] of Object.entries(params)) {
            if (!value) {
                throw new Error(`[ApiParamProvider] Failed to extract critical API parameter: ${key}`);
            }
        }
        console.log("[ApiParamProvider] App params cached successfully");
        return params;
    }
    /**
     * Extract session info from reports.hhaexchange.com page
     */
    extractFromReportsPage() {
        try {
            // From cookie
            const sessionMatch = document.cookie.match(/HHAX_Session=([^;]+)/);
            if (!sessionMatch) {
                console.warn("[ApiParamProvider] HHAX_Session cookie not found");
                return null;
            }
            // From JWT token
            const tokenMatch = document.cookie.match(/HHAX_ENT_AccessToken=([^;]+)/);
            let userId = "";
            let officeIds = "";
            if (tokenMatch) {
                try {
                    const payload = JSON.parse(atob(tokenMatch[1].split(".")[1]));
                    userId = payload.uid || "";
                    officeIds = payload.pid || "";
                }
                catch (e) {
                    console.warn("[ApiParamProvider] JWT parse error:", e);
                }
            }
            // From hidden fields or URL
            const hdnUserID = document.getElementById("ctl00_ContentPlaceHolder1_hdnUserID")?.value;
            const hdnOfficeID = document.getElementById("ctl00_ContentPlaceHolder1_hdnOfficeID")?.value;
            const hdnVersion = document.getElementById("ctl00_ContentPlaceHolder1_hdnVersion")?.value;
            const hdnMinorVersion = document.getElementById("ctl00_ContentPlaceHolder1_hdnMinorVersion")?.value;
            const hdnAppVersion = document.getElementById("ctl00_ContentPlaceHolder1_hdnAppVersion")?.value;
            const urlParams = new URLSearchParams(window.location.search);
            return {
                sessionId: sessionMatch[1],
                userId: hdnUserID || userId,
                officeIds: hdnOfficeID || officeIds,
                version: hdnVersion || urlParams.get("Version") || "25.07",
                minorVersion: hdnMinorVersion || urlParams.get("MinorVersion") || "1.00",
                appVersion: hdnAppVersion || urlParams.get("AppVersion") || "ENT",
            };
        }
        catch (e) {
            console.error("[ApiParamProvider] Failed to extract reports session info:", e);
            return null;
        }
    }
    /**
     * Extract parameter value from text using regex
     * Pattern: key: 'value'
     */
    getParamFromText(key, sourceText) {
        const regex = new RegExp(`${key}\\s*:\\s*'([^']+)'`);
        const match = sourceText.match(regex);
        return match ? match[1] : null;
    }
    /**
     * Extract hidden input value from HTML
     */
    getInputValue(id, sourceText) {
        const match = sourceText.match(new RegExp(`id="${id}"[\\s\\S]*?value="([^"]*)"`));
        return match ? match[1] : null;
    }
}
// ============================================================================
// Export default instance for convenience
// ============================================================================
const apiParamProvider = ApiParamProvider.getInstance();
/* harmony default export */ const services_ApiParamProvider = ((/* unused pure expression or super */ null && (ApiParamProvider)));

;// ./src/js/tabs/QAReportTab.ts



// ============================================================================
// Constants
// ============================================================================
const QAReportTab_STORAGE_KEYS = {
    VIEW_MODE: "hha_qa_report_view_mode",
    LAST_COORDINATOR: "hha_qa_report_last_coordinator",
};
// Story 9.3 & 9.5: 病人搜索 API URL
const PATIENT_SEARCH_BY_NUMBER_URL = "https://app.hhaexchange.com/ENT2507010000/Patient/PatientSearchXSLT_ns.aspx" +
    "?FirstName=&LastName=&StatusID=-1&PatientID=&MRNumber=&CoordinatorId=-1" +
    "&Source=-1&PatientNumber={ADMISSION_ID}&HomePhone=";
const QAReportTab_PATIENT_SEARCH_PARAMS = "&AltPatientID=&TeamID=-1&LocationID=-1&BranchID=-1&DisciplineID=0" +
    "&Default=false&pg=1&sort=&ord=ASC&OfficeIds=469,5137,5139,6475,14849&MedicaidID=";
// Story 9.5: 病人详情页 URL
const QAReportTab_PATIENT_PROFILE_URL_TEMPLATE = "https://app.hhaexchange.com/ENT2507010000/Patient/InternalPatientInfo_ns.aspx?PatientId={ID}";
const PRIORITY_COLORS = {
    critical: "#dc3545", // 从未联系 - 深红
    high: "#e74c3c", // >120天 - 红
    "medium-high": "#fd7e14", // 90-120天 - 橙
    medium: "#ffc107", // 30-90天 - 黄
    "low-medium": "#a8d08d", // 15-30天 - 浅绿
    low: "#28a745", // <15天 - 绿
};
const PRIORITY_LABELS = {
    critical: "从未联系",
    high: ">120天",
    "medium-high": "90-120天",
    medium: "30-90天",
    "low-medium": "15-30天",
    low: "<15天",
};
// ============================================================================
// QAReportTab Class
// ============================================================================
class QAReportTab extends BaseTab {
    constructor() {
        super();
        this.id = "qa-report";
        this.label = "QA 报告";
        this.icon = "📋";
        this.coordinators = [];
        this.selectedCoordinatorId = "";
        this.qaReportData = [];
        this.viewMode = "list";
        this.isLoading = false;
        this.cachedOfficeIds = null; // Cache complete OfficeIDs from API
        this.officeIdsCacheTimestamp = 0; // Cache timestamp for OfficeIDs
        // Story 9.1: 排序状态
        this.sortState = { column: null, direction: "none" };
        this.originalData = []; // 保存原始顺序用于重置
        // Story 9.3 & 9.5: 病人详情缓存 (电话号码和 Profile ID)
        this.patientDetailsCache = new Map();
        // DOM Elements
        this.toolbarEl = null;
        this.contentBodyEl = null;
        this.coordinatorSelectEl = null;
        this.loadBtnEl = null;
        this.exportBtnEl = null;
        this.viewToggleEl = null;
        /**
         * Delegated click handler for phone buttons
         */
        this.handlePhoneButtonClick = (e) => {
            const target = e.target;
            if (target.classList.contains("phone-multiple")) {
                e.stopPropagation();
                const phonesData = target.getAttribute("data-phones");
                if (phonesData) {
                    try {
                        const phones = JSON.parse(decodeURIComponent(phonesData));
                        this.showPhoneDropdown(phones, target);
                    }
                    catch (err) {
                        console.error("[QAReportTab] Failed to parse phone data:", err);
                    }
                }
            }
        };
        /**
         * Initialize reports.hhaexchange.com session by accessing a report page
         * This establishes the necessary cookies for AjaxPro API calls
         *
         * @see Similar to VisitMonitor's apiParamProvider.get() which fetches CallMaintenance page
         */
        this.reportsSessionInitialized = false;
        this.apiProvider = ApiParamProvider.getInstance();
        this.loadState();
    }
    async init() {
        // 避免重复初始化 - 使用单独的标志
        if (this.initialized) {
            return;
        }
        try {
            await this.fetchCoordinators();
            this.initialized = true;
        }
        catch (e) {
            console.error("[QAReportTab] Init failed:", e);
        }
    }
    render(container) {
        this.container = container;
        // 只添加 qa-report-tab class，不要覆盖原有的 class
        container.classList.add("qa-report-tab");
        // Create main structure
        const wrapper = document.createElement("div");
        wrapper.className = "qa-report-wrapper";
        // Header with title
        const header = document.createElement("div");
        header.className = "qa-report-header";
        header.innerHTML = `<h3 class="qa-report-title">📋 QA 报告</h3>`;
        wrapper.appendChild(header);
        // Toolbar
        this.toolbarEl = this.createToolbar();
        wrapper.appendChild(this.toolbarEl);
        // Content body
        this.contentBodyEl = document.createElement("div");
        this.contentBodyEl.className = "qa-report-content-body";
        wrapper.appendChild(this.contentBodyEl);
        // Initial empty state
        this.renderEmptyState();
        container.appendChild(wrapper);
        // 注意：不要在这里设置 this.initialized = true
        // initialized 标志只在 init() 成功完成后设置
    }
    // ==========================================================================
    // Toolbar Creation
    // ==========================================================================
    createToolbar() {
        const toolbar = document.createElement("div");
        toolbar.className = "qa-report-toolbar";
        // Left section: Coordinator select
        const leftSection = document.createElement("div");
        leftSection.className = "qa-toolbar-left";
        const selectLabel = document.createElement("label");
        selectLabel.className = "qa-select-label";
        selectLabel.textContent = "辅导员:";
        this.coordinatorSelectEl = document.createElement("select");
        this.coordinatorSelectEl.className = "qa-coordinator-select";
        this.coordinatorSelectEl.innerHTML = '<option value="">加载中...</option>';
        leftSection.appendChild(selectLabel);
        leftSection.appendChild(this.coordinatorSelectEl);
        // Actions section: Button group (Load + Export)
        const actionsSection = document.createElement("div");
        actionsSection.className = "qa-toolbar-actions";
        this.loadBtnEl = document.createElement("button");
        this.loadBtnEl.className = "hha-smart-btn-primary qa-load-btn";
        this.loadBtnEl.innerHTML = "🔄 加载";
        this.loadBtnEl.addEventListener("click", () => this.handleLoad());
        this.exportBtnEl = document.createElement("button");
        this.exportBtnEl.className = "hha-smart-btn-secondary qa-export-btn";
        this.exportBtnEl.innerHTML = "📥 导出";
        this.exportBtnEl.disabled = true;
        this.exportBtnEl.addEventListener("click", () => this.showExportMenu());
        actionsSection.appendChild(this.loadBtnEl);
        actionsSection.appendChild(this.exportBtnEl);
        // Right section: View toggle
        const rightSection = document.createElement("div");
        rightSection.className = "qa-toolbar-right";
        this.viewToggleEl = this.createViewToggle();
        rightSection.appendChild(this.viewToggleEl);
        toolbar.appendChild(leftSection);
        toolbar.appendChild(actionsSection);
        toolbar.appendChild(rightSection);
        return toolbar;
    }
    createViewToggle() {
        const toggle = document.createElement("div");
        toggle.className = "qa-view-toggle";
        const listBtn = document.createElement("button");
        listBtn.className = `qa-view-btn ${this.viewMode === "list" ? "active" : ""}`;
        listBtn.innerHTML = "≡";
        listBtn.title = "列表视图";
        listBtn.addEventListener("click", () => this.setViewMode("list"));
        const gridBtn = document.createElement("button");
        gridBtn.className = `qa-view-btn ${this.viewMode === "grid" ? "active" : ""}`;
        gridBtn.innerHTML = "⊞";
        gridBtn.title = "九宫格视图";
        gridBtn.addEventListener("click", () => this.setViewMode("grid"));
        toggle.appendChild(listBtn);
        toggle.appendChild(gridBtn);
        return toggle;
    }
    // ==========================================================================
    // Data Fetching
    // ==========================================================================
    async fetchCoordinators() {
        try {
            const sessionInfo = await this.getSessionInfo();
            const url = this.buildCoordinatorApiUrl(sessionInfo);
            const response = await this.gmGet(url);
            this.coordinators = response || [];
            this.populateCoordinatorSelect();
        }
        catch (e) {
            console.error("[QAReportTab] Failed to fetch coordinators:", e);
            this.showError("获取 Coordinator 列表失败");
        }
    }
    buildCoordinatorApiUrl(sessionInfo) {
        const params = new URLSearchParams({
            MethodName: "GetCoordinatorforOffice_WithNoCoordinator",
            UserID: sessionInfo.userId,
            OfficeIDs: sessionInfo.officeIds,
            Version: sessionInfo.version,
            MinorVersion: sessionInfo.minorVersion,
            AppVersion: sessionInfo.appVersion,
        });
        return `https://reports.hhaexchange.com/HHAReportsML/Handler/Contracts.ashx/BindContract?${params}`;
    }
    populateCoordinatorSelect() {
        if (!this.coordinatorSelectEl) {
            console.error("[QAReportTab] coordinatorSelectEl is null!");
            return;
        }
        this.coordinatorSelectEl.innerHTML =
            '<option value="">-- 选择辅导员 --</option>';
        // Filter out "No Coordinator" option
        const validCoordinators = this.coordinators.filter((c) => c.ID !== "-3");
        validCoordinators.forEach((coordinator) => {
            const option = document.createElement("option");
            option.value = coordinator.ID;
            // 去除邮箱地址，只保留名字和分机号（例如："Anna O. Russian Sup ext.141" 而不是 "Anna O. Russian Sup ext.141 AOzhigova@alwaysny.net"）
            const displayText = coordinator.Text.replace(/\s+[\w.-]+@[\w.-]+$/i, "").trim();
            option.textContent = displayText;
            this.coordinatorSelectEl.appendChild(option);
        });
        // Restore last selected
        const lastSelected = localStorage.getItem(QAReportTab_STORAGE_KEYS.LAST_COORDINATOR);
        if (lastSelected && validCoordinators.some((c) => c.ID === lastSelected)) {
            this.coordinatorSelectEl.value = lastSelected;
            this.selectedCoordinatorId = lastSelected;
        }
        this.coordinatorSelectEl.addEventListener("change", (e) => {
            this.selectedCoordinatorId = e.target.value;
            localStorage.setItem(QAReportTab_STORAGE_KEYS.LAST_COORDINATOR, this.selectedCoordinatorId);
        });
    }
    async handleLoad() {
        if (!this.selectedCoordinatorId) {
            this.showError("请先选择一个 Coordinator");
            return;
        }
        if (this.isLoading)
            return;
        this.setLoading(true);
        try {
            // Step 1: Fetch Census data
            const censusPatients = await this.fetchCensusData();
            // Step 2: Fetch Patient General Notes
            const qaNotes = await this.fetchQANotes();
            // Step 3: Merge and sort data
            this.qaReportData = this.mergeAndSortData(censusPatients, qaNotes);
            console.log(`[QAReportTab] Loaded: ${censusPatients.length} patients, ${qaNotes.length} notes → ${this.qaReportData.length} items`);
            // Step 4: Render
            this.renderData();
            this.exportBtnEl.disabled = false;
            this.showSuccess(`已加载 ${this.qaReportData.length} 个病人数据`);
        }
        catch (e) {
            console.error("[QAReportTab] Load error:", e);
            this.showError("加载失败: " + e.message);
        }
        finally {
            this.setLoading(false);
        }
    }
    async fetchCensusData() {
        // CRITICAL: Initialize reports session first to establish cookies
        await this.initializeReportsSession();
        const sessionInfo = await this.getSessionInfo();
        // Build UserDataXML for Census API
        const userDataXML = `<Params>
      <Param StatusIDs="3,4,8"/>
      <Param OfficeIDs="${sessionInfo.officeIds}"/>
      <Param CoordinatorIDs="${this.selectedCoordinatorId}"/>
      <Param PatientLocationIDs="-1"/>
      <Param PatientBranchIDs="-1"/>
      <Param PatientTeamIDs="-1"/>
      <Param ContractIDs="-1"/>
      <Param IsDefaultPatient="0"/>
      <Param Version="${sessionInfo.version}"/>
      <Param MinorVersion="${sessionInfo.minorVersion}"/>
      <Param AppVersion="${sessionInfo.appVersion}"/>
    </Params>`.replace(/\s+/g, " ");
        console.log(`[QAReportTab] Census API params: StatusIDs=3,4,8, CoordinatorID=${this.selectedCoordinatorId}, OfficeIDs=${sessionInfo.officeIds}`);
        // Call Census API to get report GUID
        const bindDataUrl = "https://reports.hhaexchange.com/HHAReportsML/ajaxpro/Reports_CensusbyCoordinator,HHAExchangeUI.ashx";
        const response = await this.gmPostAjaxPro(bindDataUrl, "BindData", {
            UserDataXML: userDataXML,
        });
        // Response format: "GUID";/*
        const guid = response.replace(/[";/*]/g, "").trim();
        if (!guid) {
            throw new Error("Census API 返回空 GUID");
        }
        // Fetch and parse ALL pages of report HTML
        const reportUrl = `https://reports.hhaexchange.com/HHAReportsML/Reports/Reports.aspx?UserDataXML=${guid}&ReportName=Census%20by%20Coordinator&ReportTitle=Census%20by%20Coordinator`;
        const allPatients = [];
        // Fetch first page and get total pages
        const { html: firstPageHtml, totalPages, formFields, } = await this.fetchReportFirstPage(reportUrl);
        const firstPagePatients = this.parseCensusReport(firstPageHtml);
        allPatients.push(...firstPagePatients);
        console.log(`[QAReportTab] Census page 1/${totalPages}: ${firstPagePatients.length} patients`);
        // Fetch remaining pages if more than one page
        if (totalPages > 1) {
            for (let page = 2; page <= totalPages; page++) {
                try {
                    const pageHtml = await this.fetchReportPage(reportUrl, page, formFields);
                    const pagePatients = this.parseCensusReport(pageHtml);
                    allPatients.push(...pagePatients);
                    console.log(`[QAReportTab] Census page ${page}/${totalPages}: ${pagePatients.length} patients`);
                }
                catch (e) {
                    console.error(`[QAReportTab] Failed to fetch Census page ${page}:`, e);
                }
            }
        }
        // Deduplicate by admissionId (in case of page overlaps)
        const uniquePatients = Array.from(new Map(allPatients.map((p) => [p.admissionId, p])).values());
        console.log(`[QAReportTab] Census total: ${uniquePatients.length} patients from ${totalPages} pages (before dedup: ${allPatients.length})`);
        return uniquePatients;
    }
    /**
     * Parse Census by Coordinator report HTML to extract patient data.
     * ASP.NET ReportViewer uses uppercase HTML tags (TR, TD, DIV).
     */
    parseCensusReport(html) {
        const patients = [];
        try {
            // Find all AHC-XXXXXX or AMD-XXXXXX Admission IDs (6 OR 7 digits)
            const admissionIdRegex = /(AHC|AMD)-\d{6,7}/g;
            const allIds = html.match(admissionIdRegex) || [];
            // Log IDs found for debugging
            console.log(`[QAReportTab] Census IDs found in page: ${allIds.length}`, allIds.slice(0, 5).join(", ") + "...");
            // Process each unique ID
            const processedIds = new Set();
            allIds.forEach((admissionId) => {
                if (processedIds.has(admissionId))
                    return;
                processedIds.add(admissionId);
                // Find ID position in HTML (format: >AHC-XXXXXX<)
                let idPos = html.indexOf(`>${admissionId}<`);
                if (idPos === -1) {
                    idPos = html.indexOf(admissionId);
                }
                if (idPos === -1)
                    return;
                // Find containing <TR> (ASP.NET uses uppercase)
                let trStart = html.lastIndexOf("<TR", idPos);
                if (trStart === -1)
                    trStart = html.lastIndexOf("<tr", idPos);
                if (trStart === -1)
                    return;
                // Find closing </TR>
                let trEnd = html.indexOf("</TR>", idPos);
                if (trEnd === -1)
                    trEnd = html.indexOf("</tr>", idPos);
                if (trEnd === -1)
                    return;
                trEnd += 5; // Include </TR>
                const rowHtml = html.substring(trStart, trEnd);
                // Verify it's a data row (has VALIGN="top")
                if (!rowHtml.includes('VALIGN="top"') &&
                    !rowHtml.includes('valign="top"')) {
                    return;
                }
                // Extract cell values from <TD><DIV>VALUE</DIV></TD> structure
                const tdDivRegex = /<TD[^>]*>(?:<DIV[^>]*>)?([^<]*)(?:<\/DIV>)?<\/TD>/gi;
                const cellValues = [];
                let cellMatch;
                while ((cellMatch = tdDivRegex.exec(rowHtml)) !== null) {
                    const value = cellMatch[1].trim();
                    if (value)
                        cellValues.push(value);
                }
                // Fallback: extract <DIV> contents directly
                if (cellValues.length < 3) {
                    const divRegex = /<DIV[^>]*>([^<]+)<\/DIV>/gi;
                    let divMatch;
                    while ((divMatch = divRegex.exec(rowHtml)) !== null) {
                        const value = divMatch[1].trim();
                        if (value)
                            cellValues.push(value);
                    }
                }
                // Need at least 3 cells (row#, ID, name)
                if (cellValues.length < 3)
                    return;
                // Find admissionId position in cell values
                const idIndex = cellValues.findIndex((v) => v === admissionId);
                if (idIndex === -1)
                    return;
                // Extract fields relative to ID position
                // Expected: [rowNum, admissionId, patientName, address, coordinator, contract, status, startDate]
                const patientName = cellValues[idIndex + 1] || "";
                const address = cellValues[idIndex + 2] || "";
                const coordinator = cellValues[idIndex + 3] || "";
                const primaryContract = cellValues[idIndex + 4] || "";
                const status = cellValues[idIndex + 5] || "Active";
                const startDate = cellValues[idIndex + 6] || "";
                // Extract phone numbers from all fields
                const phones = [];
                const allText = cellValues.join(" ");
                const phoneMatches = allText.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/g) || [];
                phoneMatches.forEach((phone, idx) => {
                    phones.push({
                        label: idx === 0 ? "Primary" : `Phone ${idx + 1}`,
                        phone: this.formatPhone(phone),
                    });
                });
                patients.push({
                    admissionId,
                    patientName,
                    address,
                    phones,
                    coordinator,
                    primaryContract,
                    status,
                    startDate,
                });
            });
            console.log(`[QAReportTab] Census parsed: ${patients.length} patients`);
        }
        catch (e) {
            console.error("[QAReportTab] Census parse error:", e);
        }
        return patients;
    }
    async fetchQANotes() {
        // CRITICAL: Initialize reports session first to establish cookies
        await this.initializeReportsSession();
        const sessionInfo = await this.getSessionInfo();
        // Calculate date range (1 year ago to today)
        // NOTE: Use millisecond calculation because Date.setFullYear() is broken in HHA page environment
        const today = new Date();
        const oneYearMs = 365 * 24 * 60 * 60 * 1000;
        const oneYearAgo = new Date(today.getTime() - oneYearMs);
        // Format date as MM/DD/YYYY with leading zeros (matches HHA report format)
        const formatDate = (d) => {
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${month}/${day}/${d.getFullYear()}`;
        };
        const fromDateStr = formatDate(oneYearAgo);
        const toDateStr = formatDate(today);
        console.log(`[QAReportTab] QA Notes date range: ${fromDateStr} to ${toDateStr}`);
        console.log(`[QAReportTab] QA Notes API params: OfficeIDs=${sessionInfo.officeIds}, CoordinatorID=${this.selectedCoordinatorId}`);
        // Build UserDataXML for Patient General Notes API (与 PatientGeneralNotesReport.ts 格式一致)
        const userDataXML = `<Params>` +
            `<Param OfficeIDs="${sessionInfo.officeIds}"/>` +
            `<Param FromDate="${formatDate(oneYearAgo)}"/>` +
            `<Param ToDate="${formatDate(today)}"/>` +
            `<Param StatusID="-1"/>` +
            `<Param ReasonID="2289535"/>` + // Quality Assurance
            `<Param ChhaID="-1"/>` +
            `<Param PatientID="-1"/>` +
            `<Param CoordinatorID="${this.selectedCoordinatorId}"/>` +
            `<Param Priority="-1"/>` +
            `<Param IsCallFromPatientProfile="0"/>` +
            `<Param CallerInfo="SSRS"/>` +
            `<Param AppVersion="${sessionInfo.appVersion}"/>` +
            `<Param Version="${sessionInfo.version}"/>` +
            `<Param MinorVersion="${sessionInfo.minorVersion}"/>` +
            `</Params>`;
        // Call Patient General Notes API (正确的URL)
        const apiUrl = "https://reports.hhaexchange.com/HHAReportsML/Reports/PatientGeneralNotesRpt.aspx/BindData";
        const response = await this.gmPost(apiUrl, { UserDataXML: userDataXML });
        // Response format: { d: "GUID" }
        const guid = response?.d;
        if (!guid) {
            console.warn("[QAReportTab] No QA notes found");
            return [];
        }
        // Fetch and parse ALL pages of report HTML
        const reportUrl = `https://reports.hhaexchange.com/HHAReportsML/Reports/Reports.aspx?UserDataXML=${guid}&ReportName=Patient%20General%20Notes&ReportTitle=Patient%20General%20Notes`;
        const allNotes = [];
        // Fetch first page and get total pages
        const { html: firstPageHtml, totalPages, formFields, } = await this.fetchReportFirstPage(reportUrl);
        const firstPageNotes = this.parseQANotesReport(firstPageHtml);
        allNotes.push(...firstPageNotes);
        console.log(`[QAReportTab] QA Notes page 1/${totalPages}: ${firstPageNotes.length} notes`);
        // Fetch remaining pages if more than one page
        if (totalPages > 1) {
            for (let page = 2; page <= totalPages; page++) {
                try {
                    const pageHtml = await this.fetchReportPage(reportUrl, page, formFields);
                    const pageNotes = this.parseQANotesReport(pageHtml);
                    allNotes.push(...pageNotes);
                    console.log(`[QAReportTab] QA Notes page ${page}/${totalPages}: ${pageNotes.length} notes`);
                }
                catch (e) {
                    console.error(`[QAReportTab] Failed to fetch QA Notes page ${page}:`, e);
                }
            }
        }
        console.log(`[QAReportTab] QA Notes total: ${allNotes.length} notes from ${totalPages} pages`);
        return allNotes;
    }
    parseQANotesReport(html) {
        const notes = [];
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            // Extract all text content from the report
            const fullText = doc.body.textContent || "";
            // Split by "Quality Assurance" followed by contract/note info
            // Pattern: ...Quality Assurance[Contract][Note Text]Closed by...
            // We need to split on the pattern where "Closed" appears before date
            // Find all patterns of: Closed[Date][Time][User][AHC-XXXXXX or AMD-XXXXXX]
            const recordPattern = /Closed(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2})([^\s]+)((?:AHC|AMD)-\d{6,7})/g;
            const matches = [...fullText.matchAll(recordPattern)];
            console.log(`[QAReportTab] Found ${matches.length} QA Note records`);
            matches.forEach((match, index) => {
                const createdDate = match[1]; // e.g., "05/02/2025 14:13"
                const admissionId = match[3]; // e.g., "AHC-908035"
                // Extract just the date part (MM/DD/YYYY)
                const dateOnly = createdDate.split(" ")[0];
                notes.push({
                    admissionId: admissionId,
                    patientName: "",
                    createdDate: dateOnly,
                    note: "",
                    coordinator: "",
                });
            });
            console.log(`[QAReportTab] QA Notes parsed: ${notes.length} notes`);
        }
        catch (e) {
            console.error("[QAReportTab] QA Notes parse error:", e);
        }
        return notes;
    }
    // ==========================================================================
    // Data Processing (Story 8.5)
    // ==========================================================================
    mergeAndSortData(censusPatients, qaNotes) {
        // Build a map of latest QA note by admission ID
        const qaMap = new Map();
        qaNotes.forEach((note) => {
            const existing = qaMap.get(note.admissionId);
            if (!existing ||
                this.compareDates(note.createdDate, existing.createdDate) > 0) {
                qaMap.set(note.admissionId, note);
            }
        });
        // Merge with census patients
        const reportItems = censusPatients.map((patient) => {
            const qaNote = qaMap.get(patient.admissionId);
            const daysAgo = qaNote ? this.calculateDaysAgo(qaNote.createdDate) : null;
            return {
                admissionId: patient.admissionId,
                patientName: patient.patientName,
                phones: patient.phones,
                address: patient.address,
                lastQADaysAgo: daysAgo,
                lastQADate: qaNote?.createdDate || null,
                lastQANote: qaNote?.note || null,
                priority: this.calculatePriority(daysAgo),
                coordinator: patient.coordinator,
                primaryContract: patient.primaryContract,
            };
        });
        // Sort: 从未联系优先，然后按天数降序
        reportItems.sort((a, b) => {
            // 从未联系的排最前
            if (a.lastQADaysAgo === null && b.lastQADaysAgo !== null)
                return -1;
            if (a.lastQADaysAgo !== null && b.lastQADaysAgo === null)
                return 1;
            if (a.lastQADaysAgo === null && b.lastQADaysAgo === null)
                return 0;
            // 天数多的排前面
            return b.lastQADaysAgo - a.lastQADaysAgo;
        });
        // Story 9.1: 保存原始顺序用于重置
        this.originalData = [...reportItems];
        // 重置排序状态
        this.sortState = { column: null, direction: "none" };
        return reportItems;
    }
    calculateDaysAgo(dateStr) {
        try {
            const date = new Date(dateStr);
            const today = new Date();
            const diffTime = today.getTime() - date.getTime();
            return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
        catch {
            return 0;
        }
    }
    calculatePriority(daysAgo) {
        if (daysAgo === null)
            return "critical";
        if (daysAgo > 120)
            return "high";
        if (daysAgo > 90)
            return "medium-high";
        if (daysAgo > 30)
            return "medium";
        if (daysAgo > 15)
            return "low-medium";
        return "low";
    }
    compareDates(date1, date2) {
        return new Date(date1).getTime() - new Date(date2).getTime();
    }
    // ==========================================================================
    // Sorting (Story 9.1)
    // ==========================================================================
    /**
     * 处理表头排序点击
     * 三态循环: none → asc → desc → none
     */
    handleSort(column) {
        if (this.sortState.column === column) {
            // 同一列：切换状态 none → asc → desc → none
            const nextDirection = {
                none: "asc",
                asc: "desc",
                desc: "none",
            };
            this.sortState.direction = nextDirection[this.sortState.direction];
            if (this.sortState.direction === "none") {
                this.sortState.column = null;
            }
        }
        else {
            // 新列：从 asc 开始
            this.sortState.column = column;
            this.sortState.direction = "asc";
        }
        this.applySorting();
        this.renderData();
    }
    /**
     * 应用当前排序状态到数据
     */
    applySorting() {
        if (this.sortState.direction === "none" || !this.sortState.column) {
            // 恢复原始顺序
            this.qaReportData = [...this.originalData];
            return;
        }
        const multiplier = this.sortState.direction === "asc" ? 1 : -1;
        this.qaReportData = [...this.originalData].sort((a, b) => {
            switch (this.sortState.column) {
                case "id":
                    return multiplier * a.admissionId.localeCompare(b.admissionId);
                case "name":
                    return multiplier * a.patientName.localeCompare(b.patientName);
                case "lastQA":
                    // null (从未联系) 视为最大值，在升序时排最后，降序时排最前
                    const aVal = a.lastQADaysAgo ?? Infinity;
                    const bVal = b.lastQADaysAgo ?? Infinity;
                    return multiplier * (aVal - bVal);
                default:
                    return 0;
            }
        });
    }
    /**
     * 获取排序图标
     */
    getSortIcon(column) {
        if (this.sortState.column !== column ||
            this.sortState.direction === "none") {
            return '<span class="sort-icon sort-none">⇅</span>';
        }
        return this.sortState.direction === "asc"
            ? '<span class="sort-icon sort-asc">▲</span>'
            : '<span class="sort-icon sort-desc">▼</span>';
    }
    // ==========================================================================
    // Rendering (Story 8.6, 8.7, 8.8)
    // ==========================================================================
    // ==========================================================================
    // Patient Details (Story 9.3 & 9.5)
    // ==========================================================================
    /**
     * 获取病人详情（电话号码和 Profile ID）
     * 使用缓存避免重复请求
     */
    async getPatientDetails(admissionId) {
        // 检查缓存
        if (this.patientDetailsCache.has(admissionId)) {
            return this.patientDetailsCache.get(admissionId);
        }
        try {
            const result = await this.fetchPatientDetails(admissionId);
            this.patientDetailsCache.set(admissionId, result);
            return result;
        }
        catch (e) {
            console.error(`[QAReportTab] Failed to fetch patient details for ${admissionId}:`, e);
            return { phones: [], profileId: null };
        }
    }
    /**
     * 通过 Admission ID 获取病人电话号码和 Profile ID
     */
    async fetchPatientDetails(admissionId) {
        try {
            const url = PATIENT_SEARCH_BY_NUMBER_URL.replace("{ADMISSION_ID}", admissionId) +
                QAReportTab_PATIENT_SEARCH_PARAMS +
                `&_=${Date.now()}`;
            const response = await GM_fetch(url, {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) {
                console.error(`[QAReportTab] Failed to fetch patient details for ${admissionId}: HTTP ${response.status}`);
                throw new Error(`HTTP ${response.status}`);
            }
            const html = await response.text();
            return this.parsePatientSearchResult(html);
        }
        catch (error) {
            console.error(`[QAReportTab] Error fetching patient details for ${admissionId}:`, error);
            throw error;
        }
    }
    /**
     * 解析搜索结果 HTML，提取电话号码和 Profile ID
     */
    parsePatientSearchResult(html) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const rows = doc.querySelectorAll("#tdSearchResults tbody tr");
        if (rows.length === 0) {
            return { phones: [], profileId: null };
        }
        // 取第一行结果
        const row = rows[0];
        const cells = row.querySelectorAll("td");
        // 更健壮的电话号码查找：遍历所有单元格，找到包含电话号码格式的单元格
        // 电话号码格式: "332-265-6219, 929-685-6363, 347-323-3536" 或单个号码
        // 严格匹配：必须是 xxx-xxx-xxxx 或 xxx.xxx.xxxx 或 xxxxxxxxxx 格式，且只包含数字和分隔符
        let phones = [];
        // 匹配整个字符串为电话号码格式（3位-3位-4位，分隔符可选）
        const strictPhonePattern = /^\d{3}[-.]?\d{3}[-.]?\d{4}$/;
        for (let i = 0; i < cells.length; i++) {
            const cellText = cells[i]?.textContent?.trim() || "";
            // 先检查单元格是否包含电话号码特征（去掉非数字字符后至少10位）
            const digitsOnly = cellText.replace(/\D/g, "");
            if (digitsOnly.length >= 10) {
                // 按逗号分割，每个部分独立验证
                const parts = cellText.split(",").map((p) => p.trim());
                const validPhones = parts.filter((p) => strictPhonePattern.test(p));
                if (validPhones.length > 0) {
                    phones = validPhones;
                    break; // 找到第一个有效的电话单元格就停止
                }
            }
        }
        // Profile ID 从 onclick 属性提取
        const link = row.querySelector('a[onclick*="RedirectToPatientPage"]');
        const onclickAttr = link?.getAttribute("onclick") || "";
        const match = onclickAttr.match(/RedirectToPatientPage\((\d+)/);
        const profileId = match ? match[1] : null;
        return { phones, profileId };
    }
    /**
     * 显示电话号码下拉框
     */
    showPhoneDropdown(phones, anchorEl) {
        // 移除已有下拉框
        document.querySelector(".phone-dropdown")?.remove();
        const dropdown = document.createElement("div");
        dropdown.className = "phone-dropdown";
        phones.forEach((phone) => {
            const item = document.createElement("a");
            item.className = "phone-dropdown-item";
            item.href = `tel:${phone.replace(/\D/g, "")}`;
            item.innerHTML = `📞 ${phone}`;
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                // tel: 协议会自动处理
            });
            dropdown.appendChild(item);
        });
        // 定位到锚点元素下方
        const rect = anchorEl.getBoundingClientRect();
        const dropdownWidth = 160; // minWidth
        // 计算 left 位置，确保不超出屏幕右边缘
        let leftPos = rect.left;
        const viewportWidth = window.innerWidth;
        if (leftPos + dropdownWidth > viewportWidth - 10) {
            // 如果会超出右边缘，则向左调整
            leftPos = viewportWidth - dropdownWidth - 10;
        }
        // 确保不会超出左边缘
        if (leftPos < 10) {
            leftPos = 10;
        }
        // 设置完整的内联样式（因为 dropdown 添加到 body，CSS 选择器无法匹配）
        // z-index 必须高于面板容器的 99999
        Object.assign(dropdown.style, {
            position: "fixed",
            top: `${rect.bottom + 4}px`,
            left: `${leftPos}px`,
            zIndex: "100001",
            minWidth: `${dropdownWidth}px`,
            padding: "4px 0",
            background: "white",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        });
        // 设置下拉项样式并添加 hover 效果
        dropdown.querySelectorAll(".phone-dropdown-item").forEach((item) => {
            const el = item;
            // 设置基础样式
            Object.assign(el.style, {
                display: "block",
                padding: "8px 12px",
                color: "#333",
                fontFamily: "Monaco, Menlo, Consolas, monospace",
                fontSize: "13px",
                textDecoration: "none",
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
            });
            // 添加 hover 效果
            el.addEventListener("mouseenter", () => {
                el.style.background = "#f5f5f5";
                el.style.color = "#1890ff";
            });
            el.addEventListener("mouseleave", () => {
                el.style.background = "";
                el.style.color = "#333";
            });
        });
        // 点击外部关闭
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
            }
        };
        setTimeout(() => document.addEventListener("click", closeHandler), 0);
        document.body.appendChild(dropdown);
    }
    /**
     * 渲染电话号码单元格
     */
    renderPhoneCell(item, td) {
        td.className = "col-phone phone-cell";
        td.innerHTML = '<span class="phone-loading">加载中...</span>';
        // 异步获取电话号码
        this.getPatientDetails(item.admissionId)
            .then((details) => {
            if (details.phones.length === 0) {
                td.innerHTML = '<span class="phone-none">-</span>';
            }
            else if (details.phones.length === 1) {
                // 单个电话号码：直接显示，可点击拨打
                const phone = details.phones[0];
                td.innerHTML = `<a class="phone-single" href="tel:${phone.replace(/\D/g, "")}">${phone}</a>`;
            }
            else {
                // 多个电话号码：显示 ⋯，点击展开下拉框
                // Store phones data on the element for event delegation
                td.innerHTML = `<button class="phone-multiple" data-phones="${encodeURIComponent(JSON.stringify(details.phones))}" title="点击查看 ${details.phones.length} 个电话">⋯</button>`;
            }
        })
            .catch(() => {
            td.innerHTML = '<span class="phone-error">获取失败</span>';
        });
    }
    renderData() {
        if (!this.contentBodyEl)
            return;
        // 如果没有数据，显示空状态
        if (this.qaReportData.length === 0) {
            this.renderEmptyState("无数据", "当前 Coordinator 没有找到病人数据");
            return;
        }
        if (this.viewMode === "list") {
            this.renderListView();
        }
        else {
            this.renderGridView();
        }
    }
    renderEmptyState(title = "QA 报告", message = "选择辅导员并点击'加载'开始") {
        if (!this.contentBodyEl)
            return;
        this.contentBodyEl.innerHTML = `
      <div class="qa-empty-state">
        <div class="qa-empty-icon">📋</div>
        <div class="qa-empty-title">${title}</div>
        <div class="qa-empty-text">${message}</div>
      </div>
    `;
    }
    renderListView() {
        if (!this.contentBodyEl)
            return;
        const table = document.createElement("table");
        table.className = "qa-report-table";
        // Header with sortable columns (Story 9.1)
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        // ID 列 - 可排序
        const thId = document.createElement("th");
        thId.className = "col-id sortable";
        thId.innerHTML = `ID ${this.getSortIcon("id")}`;
        thId.addEventListener("click", () => this.handleSort("id"));
        headerRow.appendChild(thId);
        // 病人姓名列 - 可排序
        const thName = document.createElement("th");
        thName.className = "col-name sortable";
        thName.innerHTML = `病人姓名 ${this.getSortIcon("name")}`;
        thName.addEventListener("click", () => this.handleSort("name"));
        headerRow.appendChild(thName);
        // 电话号码列 - 不可排序 (Story 9.3)
        const thPhone = document.createElement("th");
        thPhone.className = "col-phone";
        thPhone.textContent = "电话号码";
        headerRow.appendChild(thPhone);
        // 上次 QA 列 - 可排序
        const thLastQA = document.createElement("th");
        thLastQA.className = "col-qa sortable";
        thLastQA.innerHTML = `上次 QA ${this.getSortIcon("lastQA")}`;
        thLastQA.addEventListener("click", () => this.handleSort("lastQA"));
        headerRow.appendChild(thLastQA);
        // 操作列 - 不可排序
        const thAction = document.createElement("th");
        thAction.className = "col-action";
        thAction.textContent = "操作";
        headerRow.appendChild(thAction);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        // Body
        const tbody = document.createElement("tbody");
        this.qaReportData.forEach((item) => {
            const tr = document.createElement("tr");
            tr.className = `priority-${item.priority}`;
            const qaDisplay = this.formatQADisplay(item.lastQADaysAgo);
            const qaClass = item.lastQADaysAgo === null ? "qa-never" : "";
            // Create row with static cells
            const qaTooltip = item.lastQADate || "从未联系";
            tr.innerHTML = `
        <td class="col-id">${item.admissionId}</td>
        <td class="col-name">${item.patientName}</td>
        <td class="col-phone"></td>
        <td class="col-qa ${qaClass}" style="border-left: 4px solid ${PRIORITY_COLORS[item.priority]}" title="${qaTooltip}">${qaDisplay}</td>
        <td class="col-action">
          <button class="qa-action-btn" data-id="${item.admissionId}">⋮</button>
        </td>
      `;
            // Async render phone cell (Story 9.3)
            const phoneCell = tr.querySelector(".col-phone");
            if (phoneCell) {
                this.renderPhoneCell(item, phoneCell);
            }
            // Action button click handler
            const actionBtn = tr.querySelector(".qa-action-btn");
            actionBtn?.addEventListener("click", (e) => {
                e.stopPropagation();
                this.showActionMenu(item, actionBtn);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        this.contentBodyEl.innerHTML = "";
        this.contentBodyEl.appendChild(table);
        // Event delegation for phone-multiple buttons (fix: inline addEventListener doesn't work in async context)
        this.setupPhoneButtonDelegation();
    }
    /**
     * Setup event delegation for phone-multiple buttons
     * This is needed because buttons created in async Promise callbacks don't retain event handlers
     */
    setupPhoneButtonDelegation() {
        if (!this.contentBodyEl)
            return;
        // Remove existing handler if any
        this.contentBodyEl.removeEventListener("click", this.handlePhoneButtonClick);
        // Add delegated click handler
        this.contentBodyEl.addEventListener("click", this.handlePhoneButtonClick);
    }
    renderGridView() {
        if (!this.contentBodyEl)
            return;
        const grid = document.createElement("div");
        grid.className = "qa-report-grid";
        this.qaReportData.forEach((item) => {
            const card = document.createElement("div");
            card.className = `qa-card priority-${item.priority}`;
            card.style.borderLeftColor = PRIORITY_COLORS[item.priority];
            card.style.backgroundColor = this.hexToRgba(PRIORITY_COLORS[item.priority], 0.08);
            const qaTooltip = item.lastQADate || "从未联系";
            card.innerHTML = `
        <div class="card-header">
          <span class="card-name">${item.patientName}</span>
          <button class="card-action-btn" data-id="${item.admissionId}">⋮</button>
        </div>
        <div class="card-id">${item.admissionId}</div>
        <div class="card-phones"></div>
        <div class="card-qa" style="color: ${PRIORITY_COLORS[item.priority]}" title="${qaTooltip}">
          ${this.formatQADisplay(item.lastQADaysAgo)}
        </div>
        <div class="card-priority-badge" style="background: ${PRIORITY_COLORS[item.priority]}">
          ${PRIORITY_LABELS[item.priority]}
        </div>
      `;
            // Async render phone cell (Story 9.3)
            const phoneContainer = card.querySelector(".card-phones");
            if (phoneContainer) {
                this.renderPhoneCell(item, phoneContainer);
            }
            // Action button click handler
            const actionBtn = card.querySelector(".card-action-btn");
            actionBtn?.addEventListener("click", (e) => {
                e.stopPropagation();
                this.showActionMenu(item, actionBtn);
            });
            grid.appendChild(card);
        });
        this.contentBodyEl.innerHTML = "";
        this.contentBodyEl.appendChild(grid);
        // Event delegation for phone-multiple buttons
        this.setupPhoneButtonDelegation();
    }
    formatQADisplay(daysAgo) {
        if (daysAgo === null)
            return "从未联系";
        if (daysAgo === 0)
            return "今天";
        if (daysAgo === 1)
            return "昨天";
        return `${daysAgo} 天前`;
    }
    formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    }
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // ==========================================================================
    // View Toggle (Story 8.8)
    // ==========================================================================
    setViewMode(mode) {
        if (this.viewMode === mode)
            return;
        this.viewMode = mode;
        localStorage.setItem(QAReportTab_STORAGE_KEYS.VIEW_MODE, mode);
        // Update toggle buttons
        const buttons = this.viewToggleEl?.querySelectorAll(".qa-view-btn");
        buttons?.forEach((btn, index) => {
            btn.classList.toggle("active", (index === 0 && mode === "list") || (index === 1 && mode === "grid"));
        });
        // Re-render if data exists
        if (this.qaReportData.length > 0) {
            this.renderData();
        }
    }
    // ==========================================================================
    // Export (Story 8.9)
    // ==========================================================================
    showExportMenu() {
        // Remove existing menu
        document.querySelector(".qa-export-menu")?.remove();
        const menu = document.createElement("div");
        menu.className = "qa-export-menu";
        menu.innerHTML = `
      <div class="export-menu-item" data-format="csv">📄 导出 CSV</div>
      <div class="export-menu-item" data-format="json">📋 导出 JSON</div>
    `;
        // Position menu near export button
        const btnRect = this.exportBtnEl.getBoundingClientRect();
        menu.style.position = "fixed";
        menu.style.top = `${btnRect.bottom + 4}px`;
        menu.style.left = `${btnRect.left}px`;
        // Click handlers
        menu.querySelectorAll(".export-menu-item").forEach((item) => {
            item.addEventListener("click", () => {
                const format = item.dataset.format;
                if (format === "csv")
                    this.exportToCSV();
                else if (format === "json")
                    this.exportToJSON();
                menu.remove();
            });
        });
        // Close on outside click
        const closeHandler = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener("click", closeHandler);
            }
        };
        setTimeout(() => document.addEventListener("click", closeHandler), 0);
        document.body.appendChild(menu);
    }
    exportToCSV() {
        const BOM = "\uFEFF";
        const headers = [
            "Admission ID",
            "Patient Name",
            "Phone",
            "Last QA",
            "Priority",
        ];
        const rows = this.qaReportData.map((item) => [
            item.admissionId,
            item.patientName,
            item.phones.map((p) => p.phone).join("; "),
            item.lastQADaysAgo === null ? "Never" : `${item.lastQADaysAgo} days ago`,
            PRIORITY_LABELS[item.priority],
        ]);
        const csv = BOM +
            [headers, ...rows]
                .map((row) => row.map((cell) => `"${cell}"`).join(","))
                .join("\n");
        const coordinatorName = this.getSelectedCoordinatorName();
        const date = new Date().toISOString().split("T")[0];
        this.downloadFile(csv, `QA_Report_${coordinatorName}_${date}.csv`, "text/csv");
    }
    exportToJSON() {
        const json = JSON.stringify(this.qaReportData, null, 2);
        const coordinatorName = this.getSelectedCoordinatorName();
        const date = new Date().toISOString().split("T")[0];
        this.downloadFile(json, `QA_Report_${coordinatorName}_${date}.json`, "application/json");
    }
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    getSelectedCoordinatorName() {
        const coordinator = this.coordinators.find((c) => c.ID === this.selectedCoordinatorId);
        return coordinator?.Text?.split(" ")[0] || "Unknown";
    }
    // ==========================================================================
    // Action Menu (Story 8.10)
    // ==========================================================================
    showActionMenu(item, anchorEl) {
        // Remove existing menu
        document.querySelector(".qa-action-menu")?.remove();
        const menu = document.createElement("div");
        menu.className = "qa-action-menu";
        menu.innerHTML = `
      <div class="action-menu-item" data-action="create-note">📝 快速创建 QA Note</div>
      <div class="action-menu-item" data-action="view-patient">📋 查看病人详情</div>
    `;
        // Position menu near anchor
        const rect = anchorEl.getBoundingClientRect();
        menu.style.position = "fixed";
        menu.style.top = `${rect.bottom + 4}px`;
        menu.style.left = `${rect.left - 150}px`;
        // Click handlers
        menu.querySelectorAll(".action-menu-item").forEach((menuItem) => {
            menuItem.addEventListener("click", () => {
                const action = menuItem.dataset.action;
                this.handleAction(action, item);
                menu.remove();
            });
        });
        // Close on outside click
        const closeHandler = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener("click", closeHandler);
            }
        };
        setTimeout(() => document.addEventListener("click", closeHandler), 0);
        document.body.appendChild(menu);
    }
    handleAction(action, item) {
        switch (action) {
            case "create-note":
                this.showQuickNoteModal(item);
                break;
            case "view-patient":
                // Story 9.5: Open patient profile using cached Profile ID
                this.openPatientProfile(item);
                break;
        }
    }
    /**
     * Story 9.5: Open patient profile in new tab using Profile ID
     */
    async openPatientProfile(item) {
        try {
            const details = await this.getPatientDetails(item.admissionId);
            if (details.profileId) {
                const url = QAReportTab_PATIENT_PROFILE_URL_TEMPLATE.replace("{ID}", details.profileId);
                window.open(url, "_blank");
            }
            else {
                this.showError("无法获取病人资料链接");
            }
        }
        catch (error) {
            console.error("[QAReportTab] Failed to get patient profile:", error);
            this.showError("获取病人信息失败");
        }
    }
    /**
     * Story 9.3: Handle call action using cached phone numbers
     */
    async handleCallAction(item) {
        try {
            const details = await this.getPatientDetails(item.admissionId);
            if (details.phones.length === 0) {
                this.showError("没有可用的电话号码");
            }
            else if (details.phones.length === 1) {
                window.open(`tel:${details.phones[0]}`, "_self");
            }
            else {
                // Multiple phones - let user choose
                this.showInfo(`该病人有 ${details.phones.length} 个电话号码，请从表格中选择拨打`);
            }
        }
        catch (error) {
            console.error("[QAReportTab] Failed to get phone numbers:", error);
            this.showError("获取电话号码失败");
        }
    }
    /**
     * Story 9.6: Show quick note creation modal
     */
    showQuickNoteModal(item) {
        // Remove existing modal if any
        document.querySelector(".qa-note-modal-overlay")?.remove();
        // Default QA note template
        const defaultNote = `Quality call made to pt, confirmed pt has not been admitted to hospital or rehab within the last 30 days. Pt is satisfied with current aide and or hours OR pt is interested in increase`;
        // Create modal overlay
        const overlay = document.createElement("div");
        overlay.className = "qa-note-modal-overlay";
        overlay.innerHTML = `
      <div class="qa-note-modal">
        <div class="qa-note-modal-header">
          <div class="qa-note-modal-title">
            📝 快速创建 QA Note - ${item.patientName} (${item.admissionId})
          </div>
          <button class="qa-note-modal-close" type="button">×</button>
        </div>
        <div class="qa-note-modal-body">
          <div class="qa-note-section">
            <label class="qa-note-label">将提交以下 QA 记录:</label>
            <div class="qa-note-template">${defaultNote}</div>
          </div>
          <div class="qa-note-section">
            <label class="qa-note-label" for="qa-additional-note">附加备注 (可选):</label>
            <textarea 
              id="qa-additional-note" 
              class="qa-note-textarea" 
              placeholder="在此输入任何附加信息..."
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="qa-note-modal-footer">
          <button class="qa-note-btn qa-note-btn-cancel" type="button">取消</button>
          <button class="qa-note-btn qa-note-btn-submit" type="button">提交并关闭</button>
        </div>
      </div>
    `;
        // Event handlers
        const closeModal = () => overlay.remove();
        // Close button
        overlay
            .querySelector(".qa-note-modal-close")
            ?.addEventListener("click", closeModal);
        // Cancel button
        overlay
            .querySelector(".qa-note-btn-cancel")
            ?.addEventListener("click", closeModal);
        // Submit button
        overlay
            .querySelector(".qa-note-btn-submit")
            ?.addEventListener("click", () => {
            const additionalNote = overlay.querySelector("#qa-additional-note")?.value?.trim();
            console.log("[QAReportTab] Submit QA Note:", {
                admissionId: item.admissionId,
                patientName: item.patientName,
                defaultNote,
                additionalNote,
            });
            closeModal();
            this.showInfo("功能开发中 - QA Note 创建将在后续版本实现");
        });
        // ESC key to close
        const escHandler = (e) => {
            if (e.key === "Escape") {
                closeModal();
                document.removeEventListener("keydown", escHandler);
            }
        };
        document.addEventListener("keydown", escHandler);
        // Append to body
        document.body.appendChild(overlay);
        // Focus on textarea
        setTimeout(() => {
            overlay.querySelector("#qa-additional-note")?.focus();
        }, 100);
    }
    // ==========================================================================
    // Utilities
    // ==========================================================================
    /**
     * Get complete OfficeIDs dynamically from API
     * The JWT token only contains a single office (469), but we need all offices for complete data.
     * This implementation is ported from VisitMonitor.ts getMessageOfficeIds()
     */
    async getCompleteOfficeIds() {
        // Use cached value if available (5 minute cache)
        const CACHE_EXPIRY_MS = 5 * 60 * 1000;
        const now = Date.now();
        if (this.cachedOfficeIds &&
            this.officeIdsCacheTimestamp &&
            now - this.officeIdsCacheTimestamp < CACHE_EXPIRY_MS) {
            console.log(`[QAReportTab] Using cached OfficeIDs: ${this.cachedOfficeIds}`);
            return this.cachedOfficeIds;
        }
        try {
            // Get API params from session
            const session = await this.apiProvider.getSessionInfo();
            // Get appSecret from ApiParamProvider
            const fullParams = await this.apiProvider.getParams();
            // Build base URL dynamically
            const baseUrl = `https://app.hhaexchange.com/ENTP${session.version.replace(".", "")}010000`;
            console.log(`[QAReportTab] Fetching OfficeIDs from: ${baseUrl}/api/Common/GetAllOffices`);
            const response = await this.gmPostWithHeaders(`${baseUrl}/api/Common/GetAllOffices`, {
                appVersion: session.appVersion,
                version: session.version,
                minorVersion: session.minorVersion,
                userID: session.userId,
                SelectionType: "filter",
                PermissionName: "Smart Map Beta",
            }, {
                appsecret: fullParams.appSecret,
                appname: session.appVersion,
            });
            // Check if response is valid array
            if (!Array.isArray(response)) {
                console.warn(`[QAReportTab] GetAllOffices returned non-array, falling back to JWT token`);
                return this.apiProvider.getOfficeIdsFromToken();
            }
            // Only include Type: "1" offices (actual offices, not groups/parents)
            const officeIds = response
                .filter((o) => o.OfficeID > 0 && o.Type === "1")
                .map((o) => o.OfficeID)
                .join(",");
            if (!officeIds) {
                console.warn(`[QAReportTab] No valid offices found, falling back to JWT token`);
                return this.apiProvider.getOfficeIdsFromToken();
            }
            // Cache the result
            this.cachedOfficeIds = officeIds;
            this.officeIdsCacheTimestamp = now;
            console.log(`[QAReportTab] Fetched complete OfficeIDs: ${this.cachedOfficeIds}`);
            return this.cachedOfficeIds;
        }
        catch (e) {
            console.error("[QAReportTab] Failed to fetch complete OfficeIDs:", e);
            // Fall back to JWT token on error
            return this.apiProvider.getOfficeIdsFromToken();
        }
    }
    async getSessionInfo() {
        const session = await this.apiProvider.getSessionInfo();
        // Get complete OfficeIDs dynamically from API
        // JWT token only has single office (469), but we need all offices for complete data
        const completeOfficeIds = await this.getCompleteOfficeIds();
        session.officeIds = completeOfficeIds;
        return session;
    }
    async initializeReportsSession() {
        // Only initialize once per page load
        if (this.reportsSessionInitialized) {
            return;
        }
        try {
            const sessionInfo = await this.getSessionInfo();
            // Access Census by Coordinator report page to establish session
            const reportUrl = `https://reports.hhaexchange.com/HHAReportsML/Reports/CensusbyCoordinator.aspx?s=${sessionInfo.sessionId}&Version=${sessionInfo.version}&MinorVersion=${sessionInfo.minorVersion}&AppVersion=${sessionInfo.appVersion}`;
            console.log("[QAReportTab] Initializing reports session...");
            const response = await GM_fetch(reportUrl, {
                method: "GET",
                credentials: "include", // Include cookies
            });
            if (!response.ok) {
                console.warn(`[QAReportTab] Session init returned HTTP ${response.status}`);
            }
            // Mark as initialized
            this.reportsSessionInitialized = true;
            console.log("[QAReportTab] Reports session initialized successfully");
        }
        catch (e) {
            console.error("[QAReportTab] Failed to initialize reports session:", e);
            // Don't throw - allow API calls to proceed and fail with better error messages
        }
    }
    setLoading(loading) {
        this.isLoading = loading;
        if (this.loadBtnEl) {
            this.loadBtnEl.disabled = loading;
            this.loadBtnEl.innerHTML = loading ? "⏳ 加载中..." : "🔄 加载";
        }
    }
    showError(message) {
        this.showToast(message, "error");
    }
    showSuccess(message) {
        this.showToast(message, "success");
    }
    showInfo(message) {
        this.showToast(message, "info");
    }
    showToast(message, type) {
        const toast = document.createElement("div");
        toast.className = `qa-toast qa-toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add("show"), 10);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    loadState() {
        const savedView = localStorage.getItem(QAReportTab_STORAGE_KEYS.VIEW_MODE);
        if (savedView) {
            this.viewMode = savedView;
        }
    }
    // ==========================================================================
    // GM API Wrappers (使用 GM_fetch 而非 GM_xmlhttpRequest)
    // ==========================================================================
    async gmGet(url) {
        const response = await GM_fetch(url, {
            method: "GET",
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const text = await response.rawBody.text();
        try {
            return JSON.parse(text);
        }
        catch {
            return text;
        }
    }
    async gmGetText(url) {
        const response = await GM_fetch(url, {
            method: "GET",
            credentials: "include", // 包含cookies用于身份验证
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.rawBody.text();
    }
    /**
     * Fetch the first page of ASP.NET ReportViewer report and extract pagination info
     * Returns HTML content, total pages, and form fields for subsequent page requests
     */
    async fetchReportFirstPage(url) {
        // Step 1: Initial GET request to get __VIEWSTATE and all form fields
        const initialResponse = await GM_fetch(url, {
            method: "GET",
            credentials: "include",
        });
        if (!initialResponse.ok) {
            throw new Error(`Initial GET failed: HTTP ${initialResponse.status}`);
        }
        const initialHtml = await initialResponse.rawBody.text();
        // Extract ALL hidden form fields from initial response
        const formFields = this.extractAllFormFields(initialHtml);
        if (!formFields["__VIEWSTATE"]) {
            console.warn("[QAReportTab] __VIEWSTATE not found, using initial HTML");
            return { html: initialHtml, totalPages: 1, formFields };
        }
        // Step 2: Build async POST request for first page
        const asyncText = await this.postReportPage(url, formFields);
        // Step 3: Parse response and extract total pages
        const html = this.parseUpdatePanelResponse(asyncText);
        const totalPages = this.extractTotalPages(html);
        // Update formFields with new __VIEWSTATE from response
        const newViewState = this.extractViewStateFromResponse(asyncText);
        if (newViewState) {
            formFields["__VIEWSTATE"] = newViewState;
        }
        return { html, totalPages, formFields };
    }
    /**
     * Fetch a specific page of ASP.NET ReportViewer report
     */
    async fetchReportPage(url, pageNumber, formFields) {
        // Build form data for page navigation
        const formData = new URLSearchParams();
        // For page navigation, use the CurrentPage control as EVENTTARGET
        formData.append("ScriptManager1", "ScriptManager1|ReportViewer$ctl05$ctl00$CurrentPage");
        formData.append("__EVENTTARGET", "ReportViewer$ctl05$ctl00$CurrentPage");
        formData.append("__EVENTARGUMENT", "");
        // Add __VIEWSTATE and __VIEWSTATEGENERATOR
        formData.append("__VIEWSTATE", formFields["__VIEWSTATE"]);
        if (formFields["__VIEWSTATEGENERATOR"]) {
            formData.append("__VIEWSTATEGENERATOR", formFields["__VIEWSTATEGENERATOR"]);
        }
        // Add all ReportViewer control fields with the new page number
        formData.append("ReportViewer$ctl03$ctl00", formFields["ReportViewer$ctl03$ctl00"] || "");
        formData.append("ReportViewer$ctl03$ctl01", formFields["ReportViewer$ctl03$ctl01"] || "");
        formData.append("ReportViewer$ctl10", formFields["ReportViewer$ctl10"] || "ltr");
        formData.append("ReportViewer$ctl11", formFields["ReportViewer$ctl11"] || "standards");
        formData.append("ReportViewer$AsyncWait$HiddenCancelField", "False");
        formData.append("ReportViewer$ToggleParam$store", "");
        formData.append("ReportViewer$ToggleParam$collapse", "false");
        // CRITICAL: Set the page number here
        formData.append("ReportViewer$ctl05$ctl00$CurrentPage", String(pageNumber));
        formData.append("ReportViewer$ctl05$ctl03$ctl00", formFields["ReportViewer$ctl05$ctl03$ctl00"] || "");
        formData.append("ReportViewer$ctl08$ClientClickedId", "");
        formData.append("ReportViewer$ctl07$store", "");
        formData.append("ReportViewer$ctl07$collapse", "false");
        formData.append("ReportViewer$ctl09$VisibilityState$ctl00", "ReportPage");
        formData.append("ReportViewer$ctl09$ScrollPosition", "");
        formData.append("ReportViewer$ctl09$ReportControl$ctl02", "");
        formData.append("ReportViewer$ctl09$ReportControl$ctl03", "");
        formData.append("ReportViewer$ctl09$ReportControl$ctl04", "100");
        formData.append("__ASYNCPOST", "true");
        const asyncResponse = await GM_fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-MicrosoftAjax": "Delta=true",
                "X-Requested-With": "XMLHttpRequest",
            },
            credentials: "include",
            body: formData.toString(),
        });
        if (!asyncResponse.ok) {
            throw new Error(`Page ${pageNumber} POST failed: HTTP ${asyncResponse.status}`);
        }
        const asyncText = await asyncResponse.rawBody.text();
        const html = this.parseUpdatePanelResponse(asyncText);
        // Update formFields with new __VIEWSTATE for next page
        const newViewState = this.extractViewStateFromResponse(asyncText);
        if (newViewState) {
            formFields["__VIEWSTATE"] = newViewState;
        }
        return html;
    }
    /**
     * Post request to get report page content
     */
    async postReportPage(url, formFields) {
        const formData = new URLSearchParams();
        // Add special async postback fields FIRST (order matters for ASP.NET)
        formData.append("ScriptManager1", "ScriptManager1|ReportViewer$ctl09$Reserved_AsyncLoadTarget");
        formData.append("__EVENTTARGET", "ReportViewer$ctl09$Reserved_AsyncLoadTarget");
        formData.append("__EVENTARGUMENT", "");
        // Add __VIEWSTATE and __VIEWSTATEGENERATOR
        formData.append("__VIEWSTATE", formFields["__VIEWSTATE"]);
        if (formFields["__VIEWSTATEGENERATOR"]) {
            formData.append("__VIEWSTATEGENERATOR", formFields["__VIEWSTATEGENERATOR"]);
        }
        // Add all ReportViewer control fields
        formData.append("ReportViewer$ctl03$ctl00", formFields["ReportViewer$ctl03$ctl00"] || "");
        formData.append("ReportViewer$ctl03$ctl01", formFields["ReportViewer$ctl03$ctl01"] || "");
        formData.append("ReportViewer$ctl10", formFields["ReportViewer$ctl10"] || "ltr");
        formData.append("ReportViewer$ctl11", formFields["ReportViewer$ctl11"] || "standards");
        formData.append("ReportViewer$AsyncWait$HiddenCancelField", formFields["ReportViewer$AsyncWait$HiddenCancelField"] || "False");
        formData.append("ReportViewer$ToggleParam$store", formFields["ReportViewer$ToggleParam$store"] || "");
        formData.append("ReportViewer$ToggleParam$collapse", formFields["ReportViewer$ToggleParam$collapse"] || "false");
        formData.append("ReportViewer$ctl05$ctl00$CurrentPage", formFields["ReportViewer$ctl05$ctl00$CurrentPage"] || "");
        formData.append("ReportViewer$ctl05$ctl03$ctl00", formFields["ReportViewer$ctl05$ctl03$ctl00"] || "");
        formData.append("ReportViewer$ctl08$ClientClickedId", formFields["ReportViewer$ctl08$ClientClickedId"] || "");
        formData.append("ReportViewer$ctl07$store", formFields["ReportViewer$ctl07$store"] || "");
        formData.append("ReportViewer$ctl07$collapse", formFields["ReportViewer$ctl07$collapse"] || "false");
        formData.append("ReportViewer$ctl09$VisibilityState$ctl00", formFields["ReportViewer$ctl09$VisibilityState$ctl00"] || "None");
        formData.append("ReportViewer$ctl09$ScrollPosition", formFields["ReportViewer$ctl09$ScrollPosition"] || "");
        formData.append("ReportViewer$ctl09$ReportControl$ctl02", formFields["ReportViewer$ctl09$ReportControl$ctl02"] || "");
        formData.append("ReportViewer$ctl09$ReportControl$ctl03", formFields["ReportViewer$ctl09$ReportControl$ctl03"] || "");
        formData.append("ReportViewer$ctl09$ReportControl$ctl04", formFields["ReportViewer$ctl09$ReportControl$ctl04"] || "100");
        formData.append("__ASYNCPOST", "true");
        const asyncResponse = await GM_fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-MicrosoftAjax": "Delta=true",
                "X-Requested-With": "XMLHttpRequest",
            },
            credentials: "include",
            body: formData.toString(),
        });
        if (!asyncResponse.ok) {
            throw new Error(`Async POST failed: HTTP ${asyncResponse.status}`);
        }
        return await asyncResponse.rawBody.text();
    }
    /**
     * Extract total page count from report HTML
     * Looks for pattern like "Page 1 of 3" or "Page  1 of 3"
     */
    extractTotalPages(html) {
        // Pattern: "Page  X of Y" (ASP.NET ReportViewer format)
        const pageMatch = html.match(/Page\s+\d+\s+of\s+(\d+)/i);
        if (pageMatch) {
            return parseInt(pageMatch[1], 10);
        }
        return 1; // Default to 1 page if pattern not found
    }
    /**
     * Extract new __VIEWSTATE from async postback response
     */
    extractViewStateFromResponse(response) {
        // Format: |length|hiddenField|__VIEWSTATE|value|
        const viewStateMatch = response.match(/\|(\d+)\|hiddenField\|__VIEWSTATE\|([^|]+)\|/);
        if (viewStateMatch) {
            return viewStateMatch[2];
        }
        return null;
    }
    /**
     * Fetch ASP.NET ReportViewer report using async postback
     * The ReportViewer uses UpdatePanel which requires a two-step process:
     * 1. Initial GET to get __VIEWSTATE and ALL form fields
     * 2. Async POST to trigger report rendering (AsyncLoadTarget) with ALL fields
     *
     * CRITICAL: The server returns different content based on which form fields are sent.
     * We must send ALL hidden form fields to get the full report with ReportArea panel.
     */
    async fetchReportWithAsyncPostback(url) {
        // Step 1: Initial GET request to get __VIEWSTATE and all form fields
        const initialResponse = await GM_fetch(url, {
            method: "GET",
            credentials: "include",
        });
        if (!initialResponse.ok) {
            throw new Error(`Initial GET failed: HTTP ${initialResponse.status}`);
        }
        const initialHtml = await initialResponse.rawBody.text();
        // Extract ALL hidden form fields from initial response
        const formFields = this.extractAllFormFields(initialHtml);
        if (!formFields["__VIEWSTATE"]) {
            console.warn("[QAReportTab] __VIEWSTATE not found, using initial HTML");
            return initialHtml;
        }
        // Step 2: Build async POST request with ALL form fields
        // This mimics exactly what the browser does for UpdatePanel async postback
        const formData = new URLSearchParams();
        // Add special async postback fields FIRST (order matters for ASP.NET)
        formData.append("ScriptManager1", "ScriptManager1|ReportViewer$ctl09$Reserved_AsyncLoadTarget");
        formData.append("__EVENTTARGET", "ReportViewer$ctl09$Reserved_AsyncLoadTarget");
        formData.append("__EVENTARGUMENT", "");
        // Add __VIEWSTATE and __VIEWSTATEGENERATOR
        formData.append("__VIEWSTATE", formFields["__VIEWSTATE"]);
        if (formFields["__VIEWSTATEGENERATOR"]) {
            formData.append("__VIEWSTATEGENERATOR", formFields["__VIEWSTATEGENERATOR"]);
        }
        // Add all ReportViewer control fields (these are CRITICAL for getting full report)
        formData.append("ReportViewer$ctl03$ctl00", formFields["ReportViewer$ctl03$ctl00"] || "");
        formData.append("ReportViewer$ctl03$ctl01", formFields["ReportViewer$ctl03$ctl01"] || "");
        formData.append("ReportViewer$ctl10", formFields["ReportViewer$ctl10"] || "ltr");
        formData.append("ReportViewer$ctl11", formFields["ReportViewer$ctl11"] || "standards");
        formData.append("ReportViewer$AsyncWait$HiddenCancelField", formFields["ReportViewer$AsyncWait$HiddenCancelField"] || "False");
        formData.append("ReportViewer$ToggleParam$store", formFields["ReportViewer$ToggleParam$store"] || "");
        formData.append("ReportViewer$ToggleParam$collapse", formFields["ReportViewer$ToggleParam$collapse"] || "false");
        formData.append("ReportViewer$ctl05$ctl00$CurrentPage", formFields["ReportViewer$ctl05$ctl00$CurrentPage"] || "");
        formData.append("ReportViewer$ctl05$ctl03$ctl00", formFields["ReportViewer$ctl05$ctl03$ctl00"] || "");
        formData.append("ReportViewer$ctl08$ClientClickedId", formFields["ReportViewer$ctl08$ClientClickedId"] || "");
        formData.append("ReportViewer$ctl07$store", formFields["ReportViewer$ctl07$store"] || "");
        formData.append("ReportViewer$ctl07$collapse", formFields["ReportViewer$ctl07$collapse"] || "false");
        formData.append("ReportViewer$ctl09$VisibilityState$ctl00", formFields["ReportViewer$ctl09$VisibilityState$ctl00"] || "None");
        formData.append("ReportViewer$ctl09$ScrollPosition", formFields["ReportViewer$ctl09$ScrollPosition"] || "");
        formData.append("ReportViewer$ctl09$ReportControl$ctl02", formFields["ReportViewer$ctl09$ReportControl$ctl02"] || "");
        formData.append("ReportViewer$ctl09$ReportControl$ctl03", formFields["ReportViewer$ctl09$ReportControl$ctl03"] || "");
        formData.append("ReportViewer$ctl09$ReportControl$ctl04", formFields["ReportViewer$ctl09$ReportControl$ctl04"] || "100");
        // Add async post flag LAST
        formData.append("__ASYNCPOST", "true");
        const asyncResponse = await GM_fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-MicrosoftAjax": "Delta=true",
                "X-Requested-With": "XMLHttpRequest",
            },
            credentials: "include",
            body: formData.toString(),
        });
        if (!asyncResponse.ok) {
            throw new Error(`Async POST failed: HTTP ${asyncResponse.status}`);
        }
        const asyncText = await asyncResponse.rawBody.text();
        // Step 3: Parse UpdatePanel response to extract HTML
        // Response format: 1|#||4|length|updatePanel|panelId|<html content>|...
        const reportHtml = this.parseUpdatePanelResponse(asyncText);
        return reportHtml;
    }
    /**
     * Extract all form fields (hidden inputs) from HTML
     * This is critical for ASP.NET UpdatePanel to return the correct content
     */
    extractAllFormFields(html) {
        const fields = {};
        // Match all hidden input fields and text inputs
        const inputRegex = /<input[^>]*type=["']?(?:hidden|text)["']?[^>]*>/gi;
        const matches = html.match(inputRegex) || [];
        for (const input of matches) {
            // Extract name and value attributes
            const nameMatch = input.match(/name=["']([^"']+)["']/i);
            const valueMatch = input.match(/value=["']([^"']*)["']/i);
            if (nameMatch) {
                const name = nameMatch[1];
                const value = valueMatch ? valueMatch[1] : "";
                // Decode HTML entities in the value
                fields[name] = this.decodeHtmlEntities(value);
            }
        }
        return fields;
    }
    /**
     * Decode HTML entities in a string
     */
    decodeHtmlEntities(str) {
        return str
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, "/");
    }
    /**
     * Parse ASP.NET UpdatePanel response format to extract HTML content
     * Format: 1|#||4|length|updatePanel|panelId|content|length|updatePanel|panelId|content|...
     *
     * The key insight is that we need to use the LENGTH prefix to properly extract content,
     * because the content itself may contain pipe characters.
     */
    parseUpdatePanelResponse(response) {
        // Strategy: Look for ReportArea panel using regex with length-based extraction
        // The actual format from browser is: |62065|updatePanel|ReportViewer_ctl09_ReportArea|<content>
        // Try multiple regex patterns to find ReportArea
        const patterns = [
            /\|(\d+)\|updatePanel\|ReportViewer_ctl09_ReportArea\|/, // Exact match
            /\|(\d+)\|updatePanel\|([^|]*ReportArea[^|]*)\|/, // Contains ReportArea
            /\|(\d+)\|updatePanel\|(ReportViewer_ctl09[^|]*)\|/, // Any ctl09 panel
        ];
        for (const pattern of patterns) {
            const match = response.match(pattern);
            if (match) {
                const contentLength = parseInt(match[1], 10);
                const matchEnd = match.index + match[0].length;
                // Extract content starting from matchEnd with the specified length
                const content = response.substring(matchEnd, matchEnd + contentLength);
                // Verify content has patient data patterns
                if (content.includes("AHC-") ||
                    content.includes("AMD-") ||
                    content.includes('VALIGN="top"')) {
                    return content;
                }
            }
        }
        // Fallback: Try to find any large HTML content with patient data patterns
        // Look for DIV with report content that contains patient data
        const divMatch = response.match(/<DIV[^>]*dir="LTR"[^>]*>[\s\S]*?(?=<\/DIV>)/gi);
        if (divMatch) {
            // Find the largest DIV that contains patient ID patterns
            const patientDivs = divMatch.filter((d) => d.includes("AHC-") || d.includes("AMD-"));
            if (patientDivs.length > 0) {
                const largestPatientDiv = patientDivs.reduce((a, b) => a.length > b.length ? a : b);
                return largestPatientDiv;
            }
        }
        // Look for table content that might contain patient rows
        const tableMatch = response.match(/<TABLE[^>]*CELLSPACING[^>]*>[\s\S]*?<\/TABLE>/gi);
        if (tableMatch) {
            // Find tables that contain patient data
            const patientTables = tableMatch.filter((t) => t.includes("AHC-") || t.includes("AMD-"));
            if (patientTables.length > 0) {
                return patientTables.reduce((a, b) => (a.length > b.length ? a : b));
            }
            // If no patient tables, still return the largest table
            return tableMatch.reduce((a, b) => (a.length > b.length ? a : b));
        }
        // Last resort: return the whole response
        return response;
    }
    async gmPost(url, data) {
        const response = await GM_fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
            },
            credentials: "include", // 包含cookies用于身份验证
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const text = await response.rawBody.text();
        try {
            return JSON.parse(text);
        }
        catch {
            return text;
        }
    }
    /**
     * POST request with custom headers (for app.hhaexchange.com APIs)
     */
    async gmPostWithHeaders(url, data, customHeaders) {
        const response = await GM_fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                ...customHeaders,
            },
            credentials: "include",
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const text = await response.rawBody.text();
        try {
            return JSON.parse(text);
        }
        catch {
            return text;
        }
    }
    async gmPostAjaxPro(url, method, data) {
        const response = await GM_fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain; charset=UTF-8",
                "X-AjaxPro-Method": method,
            },
            credentials: "include", // 包含cookies用于身份验证
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.rawBody.text();
    }
}

;// ./src/js/services/PageDetector.ts
/**
 * PageDetector Service
 * Epic 11, Story 1: 页面检测服务
 *
 * 识别当前页面类型：
 * - PREBILLING: PrebillingReportInternal_ns.aspx
 * - CALL_MAINTENANCE: CallMaintenance_ns.aspx
 * - UNKNOWN: 其他页面
 */
class PageDetector {
    /**
     * 检测当前页面类型
     */
    static detectPageType() {
        const url = window.location.href;
        if (url.includes("PrebillingReportInternal_ns.aspx")) {
            return "PREBILLING";
        }
        if (url.includes("CallMaintenance_ns.aspx")) {
            return "CALL_MAINTENANCE";
        }
        return "UNKNOWN";
    }
    /**
     * 获取当前页面类型（缓存版本）
     */
    static getCurrentPageType() {
        this.currentPageType = this.detectPageType();
        return this.currentPageType;
    }
    /**
     * 注册页面变化监听器
     */
    static onPageChange(callback) {
        this.listeners.push(callback);
        // 首次调用时启动监听
        if (this.checkInterval === null) {
            this.startWatching();
        }
    }
    /**
     * 移除页面变化监听器
     */
    static offPageChange(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
        // 如果没有监听器，停止监听
        if (this.listeners.length === 0 && this.checkInterval !== null) {
            this.stopWatching();
        }
    }
    /**
     * 开始监听 URL 变化
     * 使用轮询方式检测，因为 HHAExchange 可能使用 iframe 或其他方式导航
     */
    static startWatching() {
        this.currentPageType = this.detectPageType();
        // 每 500ms 检查一次 URL 变化
        this.checkInterval = window.setInterval(() => {
            const newPageType = this.detectPageType();
            if (newPageType !== this.currentPageType) {
                console.log(`[PageDetector] Page changed: ${this.currentPageType} -> ${newPageType}`);
                this.currentPageType = newPageType;
                this.notifyListeners(newPageType);
            }
        }, 500);
        console.log("[PageDetector] Started watching for page changes");
    }
    /**
     * 停止监听 URL 变化
     */
    static stopWatching() {
        if (this.checkInterval !== null) {
            window.clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log("[PageDetector] Stopped watching for page changes");
        }
    }
    /**
     * 通知所有监听器
     */
    static notifyListeners(pageType) {
        this.listeners.forEach((callback) => {
            try {
                callback(pageType);
            }
            catch (error) {
                console.error("[PageDetector] Error in listener callback:", error);
            }
        });
    }
    /**
     * 获取页面友好名称
     */
    static getPageDisplayName(pageType) {
        switch (pageType) {
            case "PREBILLING":
                return "Prebilling Report Internal";
            case "CALL_MAINTENANCE":
                return "Call Maintenance";
            default:
                return "未知页面";
        }
    }
    /**
     * 清理资源
     */
    static cleanup() {
        this.stopWatching();
        this.listeners = [];
    }
}
PageDetector.currentPageType = "UNKNOWN";
PageDetector.listeners = [];
PageDetector.checkInterval = null;

;// ./src/js/services/PrebillingTableParser.ts
/**
 * PrebillingTableParser Service
 * Epic 11, Story 2: Prebilling 表格解析器
 *
 * 解析 Prebilling Report 表格，识别可清理的 POC 问题：
 * - POC Only: 仅包含 "POC Compliance"
 * - POC + Caregiver: 包含 "POC Compliance" 和 "Caregiver Compliance"（顺序无关）
 */
/**
 * 表格列索引映射
 */
const COLUMN_INDEX = {
    VISIT_DATE: 0,
    ADMISSION_ID: 1,
    PATIENT: 2,
    OFFICE: 3,
    CONTRACT: 4,
    CAREGIVER: 5,
    SERVICE_CODE: 6,
    COORDINATOR: 7,
    SCHEDULED_TIME: 8,
    VISIT_TIME: 9,
    DISCIPLINES: 10,
    TF: 11,
    PROBLEMS: 12,
    ACTIONS: 13,
};
/**
 * 表格选择器
 * 注意：实际表格 ID 是 #tblDetails（由 XSLT 渲染）
 */
const SELECTORS = {
    TABLE_CONTAINER: "#ctl00_ContentPlaceHolder1_divPrebillingReportInternalScroll",
    TABLE: "#tblDetails",
    TABLE_BODY: "#tblDetails tbody",
    EDIT_BUTTON: 'a[name="imgEditInternal"]',
};
class PrebillingTableParser {
    /**
     * 解析表格，返回符合 POC 清理条件的 visit 记录
     *
     * 清理条件：
     * 1. 仅包含 "POC Compliance"
     * 2. 仅包含 "POC Compliance" + "Caregiver Compliance"（顺序无关）
     */
    static async parseTable() {
        console.log("[PrebillingTableParser] Starting table analysis...");
        const records = [];
        // 使用 requestIdleCallback 进行异步解析，避免阻塞 UI
        return new Promise((resolve) => {
            const parseRows = () => {
                try {
                    // 先尝试在主文档中找到表格
                    let table = document.querySelector(SELECTORS.TABLE);
                    // 如果主文档中找不到，尝试在所有 iframe 中搜索
                    if (!table) {
                        console.log("[PrebillingTableParser] Table not found in main document, searching iframes...");
                        table = PrebillingTableParser.searchTableInAllFrames(window, SELECTORS.TABLE);
                    }
                    if (!table) {
                        console.warn("[PrebillingTableParser] Table not found with selector:", SELECTORS.TABLE);
                        console.log("[PrebillingTableParser] Available tables in main document:", Array.from(document.querySelectorAll("table")).map((t) => t.id));
                        resolve([]);
                        return;
                    }
                    console.log("[PrebillingTableParser] Table found:", table.id);
                    // 尝试找 tbody，如果没有则直接从 table 查找 tr
                    const tbody = table.querySelector("tbody");
                    const rows = tbody
                        ? tbody.querySelectorAll("tr")
                        : table.querySelectorAll("tr");
                    console.log(`[PrebillingTableParser] Found ${rows.length} rows to analyze (using ${tbody ? "tbody" : "table directly"})`);
                    // Debug: Log first 3 rows structure
                    for (let i = 0; i < Math.min(3, rows.length); i++) {
                        const cells = rows[i].querySelectorAll("td");
                        console.log(`[PrebillingTableParser] Row ${i}: ${cells.length} cells, Problems cell text: "${cells[COLUMN_INDEX.PROBLEMS]?.textContent?.trim() || "N/A"}"`);
                    }
                    rows.forEach((row, index) => {
                        const cells = row.querySelectorAll("td");
                        if (cells.length < COLUMN_INDEX.ACTIONS + 1) {
                            // 跳过不完整的行
                            return;
                        }
                        const problemsText = PrebillingTableParser.getCellText(cells[COLUMN_INDEX.PROBLEMS]);
                        const matchType = PrebillingTableParser.checkPOCMatch(problemsText);
                        // Debug: Log POC detection for first 5 rows with problems
                        if (index < 5 && problemsText) {
                            console.log(`[PrebillingTableParser] Row ${index}: Problems="${problemsText}", Match=${matchType}`);
                        }
                        if (matchType) {
                            const record = {
                                rowIndex: index,
                                rowElement: row,
                                visitDate: PrebillingTableParser.getCellText(cells[COLUMN_INDEX.VISIT_DATE]),
                                admissionId: PrebillingTableParser.getCellText(cells[COLUMN_INDEX.ADMISSION_ID]),
                                patientName: PrebillingTableParser.getCellText(cells[COLUMN_INDEX.PATIENT]),
                                contract: PrebillingTableParser.getCellText(cells[COLUMN_INDEX.CONTRACT]),
                                caregiverName: PrebillingTableParser.getCellText(cells[COLUMN_INDEX.CAREGIVER]),
                                scheduledTime: PrebillingTableParser.getCellText(cells[COLUMN_INDEX.SCHEDULED_TIME]),
                                visitTime: PrebillingTableParser.getCellText(cells[COLUMN_INDEX.VISIT_TIME]),
                                matchType,
                                problemsText,
                            };
                            records.push(record);
                        }
                    });
                    console.log(`[PrebillingTableParser] Found ${records.length} records matching POC criteria`);
                    resolve(records);
                }
                catch (error) {
                    console.error("[PrebillingTableParser] Error parsing table:", error);
                    resolve([]);
                }
            };
            // 使用 requestIdleCallback 进行异步解析
            if ("requestIdleCallback" in window) {
                requestIdleCallback(parseRows, { timeout: 3000 });
            }
            else {
                // 降级方案
                setTimeout(parseRows, 0);
            }
        });
    }
    /**
     * 检查问题文本是否符合 POC 清理条件
     *
     * 匹配规则（严格模式）：
     * - POC_ONLY: 仅包含 "POC Compliance"（没有其他问题类型）
     * - POC_AND_CAREGIVER: 仅包含 "POC Compliance" 和 "Caregiver Compliance"（没有其他问题类型）
     *
     * 注意：如果存在其他问题类型（如 "Timesheet Not Approved"），则不匹配
     *
     * @returns 匹配类型或 null（不匹配）
     */
    static checkPOCMatch(problemsText) {
        if (!problemsText) {
            return null;
        }
        // 用逗号分隔问题列表，支持 ", " 和 "," 两种格式
        const problems = problemsText
            .split(/,\s*/)
            .map((p) => p.trim().toLowerCase())
            .filter((p) => p.length > 0);
        if (problems.length === 0) {
            return null;
        }
        // 定义允许的问题类型
        const allowedProblems = new Set(["poc compliance", "caregiver compliance"]);
        // 检查所有问题是否都在允许列表中
        const allAllowed = problems.every((p) => allowedProblems.has(p));
        if (!allAllowed) {
            // 存在不允许的问题类型，不匹配
            return null;
        }
        // 检查是否包含 POC Compliance（必须有）
        const hasPOC = problems.includes("poc compliance");
        if (!hasPOC) {
            return null;
        }
        // 检查是否包含 Caregiver Compliance
        const hasCaregiver = problems.includes("caregiver compliance");
        if (hasCaregiver) {
            return "POC_AND_CAREGIVER";
        }
        return "POC_ONLY";
    }
    /**
     * 获取单元格文本内容（清理空白字符）
     */
    static getCellText(cell) {
        return cell?.textContent?.trim().replace(/\s+/g, " ") || "";
    }
    /**
     * 获取 visit 的 Edit 按钮
     */
    static getEditButton(record) {
        const actionCell = record.rowElement.querySelectorAll("td")[COLUMN_INDEX.ACTIONS];
        if (!actionCell)
            return null;
        return actionCell.querySelector(SELECTORS.EDIT_BUTTON);
    }
    /**
     * 获取表格是否存在
     */
    static isTablePresent() {
        return document.querySelector(SELECTORS.TABLE) !== null;
    }
    /**
     * 获取表格总行数
     */
    static getTotalRowCount() {
        const tableBody = document.querySelector(SELECTORS.TABLE_BODY);
        if (!tableBody)
            return 0;
        return tableBody.querySelectorAll("tr").length;
    }
    /**
     * 在所有 frames 中搜索表格元素
     * 支持多层 iframe 嵌套的页面结构
     */
    static searchTableInAllFrames(win, selector) {
        let result = null;
        function searchWindow(currentWindow) {
            try {
                if (currentWindow.document) {
                    const foundElement = currentWindow.document.querySelector(selector);
                    if (foundElement) {
                        result = foundElement;
                        console.log("[PrebillingTableParser] Table found in frame");
                        return true; // 找到了，停止搜索
                    }
                }
            }
            catch (e) {
                // 跨域 iframe 无法访问，静默忽略
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
                // 无法访问 frames，静默忽略
            }
            return false; // 当前window和子frames都没找到
        }
        searchWindow(win);
        return result;
    }
}

;// ./src/js/services/CallMaintenanceTableParser.ts
/**
 * CallMaintenanceTableParser
 *
 * Epic 11 - Story 7: 解析 Call Maintenance 表格
 * 筛选出 status 为 "Duplicate Call" 的记录
 *
 * 表格结构:
 * - 表格: #ctl00_ContentPlaceHolder1_uxGvSearch
 * - Status 列: Column Index 9
 * - Duplicate Call 记录需要点击 Reject 按钮清理
 */
/**
 * 表格列索引
 * 基于 Call Maintenance 表格结构
 */
const CallMaintenanceTableParser_COLUMN_INDEX = {
    ASSIGN_CODE: 0,
    CAREGIVER_CODE: 1,
    CAREGIVER_NAME: 2,
    OFFICE_NAME: 3, // 省略
    CAREGIVER_PHONE: 4, // 省略
    CAREGIVER_TEAM: 5, // 省略
    PATIENT_NAME: 6,
    CALL_DATE: 7,
    CALL_TIME: 8,
    CALL_TYPE: 9,
    CALLER_ID: 10,
    STATUS: 11,
    TF: 12, // 省略
    ACTION: 13
};
/**
 * 选择器常量
 */
const CallMaintenanceTableParser_SELECTORS = {
    TABLE: "#ctl00_ContentPlaceHolder1_uxGvSearch",
    TABLE_BODY: "#ctl00_ContentPlaceHolder1_uxGvSearch tbody",
    REJECT_BUTTON: 'a[id*="uxbtnRejectCall"]'
};
class CallMaintenanceTableParser {
    /**
     * 解析表格，返回 Duplicate Call 记录
     */
    static async parseTable() {
        console.log("[CallMaintenanceTableParser] Starting table analysis...");
        const records = [];
        return new Promise((resolve) => {
            const parseRows = () => {
                try {
                    // 先在主文档中查找表格
                    let table = document.querySelector(CallMaintenanceTableParser_SELECTORS.TABLE);
                    // 如果主文档中找不到，尝试在 iframes 中搜索
                    if (!table) {
                        console.log("[CallMaintenanceTableParser] Table not found in main document, searching iframes...");
                        table = CallMaintenanceTableParser.searchTableInAllFrames(window, CallMaintenanceTableParser_SELECTORS.TABLE);
                    }
                    if (!table) {
                        console.warn("[CallMaintenanceTableParser] Table not found with selector:", CallMaintenanceTableParser_SELECTORS.TABLE);
                        resolve([]);
                        return;
                    }
                    console.log("[CallMaintenanceTableParser] Table found:", table.id);
                    // 获取所有行
                    const tbody = table.querySelector("tbody");
                    const rows = tbody
                        ? Array.from(tbody.querySelectorAll("tr"))
                        : Array.from(table.querySelectorAll("tr"));
                    console.log(`[CallMaintenanceTableParser] Found ${rows.length} rows`);
                    let duplicateCount = 0;
                    rows.forEach((row, index) => {
                        const cells = row.querySelectorAll("td");
                        // 跳过无效行（没有足够列或是标题行）
                        if (cells.length < CallMaintenanceTableParser_COLUMN_INDEX.STATUS + 1) {
                            return;
                        }
                        // 检查是否是 Duplicate Call
                        const statusText = CallMaintenanceTableParser.getCellText(cells[CallMaintenanceTableParser_COLUMN_INDEX.STATUS]);
                        if (statusText.toLowerCase().includes("duplicate call")) {
                            duplicateCount++;
                            const record = {
                                rowIndex: index,
                                rowElement: row,
                                assignCode: CallMaintenanceTableParser.getCellText(cells[CallMaintenanceTableParser_COLUMN_INDEX.ASSIGN_CODE]),
                                caregiverCode: CallMaintenanceTableParser.getCellText(cells[CallMaintenanceTableParser_COLUMN_INDEX.CAREGIVER_CODE]),
                                caregiverName: CallMaintenanceTableParser.getCellText(cells[CallMaintenanceTableParser_COLUMN_INDEX.CAREGIVER_NAME]),
                                patientName: CallMaintenanceTableParser.getCellText(cells[CallMaintenanceTableParser_COLUMN_INDEX.PATIENT_NAME]),
                                callDate: CallMaintenanceTableParser.getCellText(cells[CallMaintenanceTableParser_COLUMN_INDEX.CALL_DATE]),
                                callTime: CallMaintenanceTableParser.getCellText(cells[CallMaintenanceTableParser_COLUMN_INDEX.CALL_TIME]),
                                callType: CallMaintenanceTableParser.getCellText(cells[CallMaintenanceTableParser_COLUMN_INDEX.CALL_TYPE]),
                                callerId: CallMaintenanceTableParser.getCellText(cells[CallMaintenanceTableParser_COLUMN_INDEX.CALLER_ID])
                            };
                            records.push(record);
                            console.log(`[CallMaintenanceTableParser] Found Duplicate Call #${duplicateCount}:`, record.caregiverName, record.patientName, record.callDate, record.callTime);
                        }
                    });
                    console.log(`[CallMaintenanceTableParser] Analysis complete. Found ${records.length} Duplicate Call records`);
                    resolve(records);
                }
                catch (error) {
                    console.error("[CallMaintenanceTableParser] Error parsing table:", error);
                    resolve([]);
                }
            };
            // 使用 requestIdleCallback 避免阻塞 UI
            if ("requestIdleCallback" in window) {
                requestIdleCallback(parseRows, { timeout: 3000 });
            }
            else {
                setTimeout(parseRows, 100);
            }
        });
    }
    /**
     * 获取单元格文本内容
     */
    static getCellText(cell) {
        return cell?.textContent?.trim().replace(/\s+/g, " ") || "";
    }
    /**
     * 获取 Reject 按钮
     */
    static getRejectButton(record) {
        const actionCell = record.rowElement.querySelectorAll("td")[CallMaintenanceTableParser_COLUMN_INDEX.ACTION];
        if (!actionCell)
            return null;
        return actionCell.querySelector(CallMaintenanceTableParser_SELECTORS.REJECT_BUTTON);
    }
    /**
     * 获取表格是否存在
     */
    static isTablePresent() {
        return document.querySelector(CallMaintenanceTableParser_SELECTORS.TABLE) !== null;
    }
    /**
     * 获取表格总行数
     */
    static getTotalRowCount() {
        const tableBody = document.querySelector(CallMaintenanceTableParser_SELECTORS.TABLE_BODY);
        if (!tableBody) {
            // 尝试在 iframes 中搜索
            const table = CallMaintenanceTableParser.searchTableInAllFrames(window, CallMaintenanceTableParser_SELECTORS.TABLE);
            if (table) {
                const tbody = table.querySelector("tbody");
                return tbody
                    ? tbody.querySelectorAll("tr").length
                    : table.querySelectorAll("tr").length;
            }
            return 0;
        }
        return tableBody.querySelectorAll("tr").length;
    }
    /**
     * 在所有 frames 中搜索表格元素
     */
    static searchTableInAllFrames(win, selector) {
        let result = null;
        function searchWindow(currentWindow) {
            try {
                if (currentWindow.document) {
                    const foundElement = currentWindow.document.querySelector(selector);
                    if (foundElement) {
                        result = foundElement;
                        console.log("[CallMaintenanceTableParser] Table found in frame");
                        return true;
                    }
                }
            }
            catch (e) {
                // 跨域 iframe 无法访问，静默忽略
            }
            try {
                for (let i = 0; i < currentWindow.frames.length; i++) {
                    const frame = currentWindow.frames[i];
                    if (searchWindow(frame)) {
                        return true;
                    }
                }
            }
            catch (e) {
                // 无法访问 frames，静默忽略
            }
            return false;
        }
        searchWindow(win);
        return result;
    }
}

// EXTERNAL MODULE: ./src/js/services/CleaningOverlay.ts
var CleaningOverlay = __webpack_require__("./src/js/services/CleaningOverlay.ts");
;// ./src/js/services/CleaningController.ts
/**
 * CleaningController Service
 * Epic 11, Story 5: 清理控制器和任务持久化
 *
 * 功能：
 * - 使用 GM_setValue/GM_getValue 存储任务队列
 * - 页面加载时检查未完成任务
 * - 页面刷新后自动恢复清理进度
 * - 任务完成后清除队列
 */

// GM Storage Key
const CLEANING_QUEUE_KEY = "hha_cleaner_task_queue";
class CleaningController {
    /**
     * 检查是否有待处理的清理任务
     * 在页面加载时调用
     */
    static async checkPendingTasks() {
        const queue = GM_getValue(CLEANING_QUEUE_KEY, null);
        if (!queue || queue.status !== "IN_PROGRESS") {
            return false;
        }
        console.log("[CleaningController] Found pending tasks, resuming...", queue);
        // 检查是否全部完成
        if (queue.currentIndex >= queue.tasks.length) {
            queue.status = "COMPLETED";
            GM_setValue(CLEANING_QUEUE_KEY, queue);
            CleaningOverlay.CleaningOverlay.showComplete(queue.pageType);
            return true;
        }
        // 显示蒙版并继续
        const currentTask = queue.tasks[queue.currentIndex];
        CleaningOverlay.CleaningOverlay.show(queue.currentIndex + 1, queue.tasks.length, this.getTaskInfo(currentTask, queue.pageType));
        // 更新蒙版状态提示
        CleaningOverlay.CleaningOverlay.update(queue.currentIndex + 1, queue.tasks.length, `${this.getTaskInfo(currentTask, queue.pageType)} (等待页面加载...)`);
        // 智能等待表格加载，最长等待 15 秒
        this.waitForTable(queue.pageType, 15000)
            .then(() => {
            // 表格加载完成，执行任务
            console.log("[CleaningController] Table loaded, executing task...");
            // 再次更新蒙版状态
            CleaningOverlay.CleaningOverlay.update(queue.currentIndex + 1, queue.tasks.length, this.getTaskInfo(currentTask, queue.pageType));
            this.executeCurrentTask(queue);
        })
            .catch((error) => {
            console.warn("[CleaningController] Initial wait table failed, trying recovery options...", error);
            // Recovery mechanism for Prebilling: Click Search button if table is missing
            // This is common after a page reload where the search results are cleared
            if (queue.pageType === "PREBILLING") {
                const searchBtn = (document.querySelector("#prebillingSelector") ||
                    document.querySelector("#ctl00_ContentPlaceHolder1_uxSearchPrebilling") ||
                    document.querySelector("#ctl00_ContentPlaceHolder1_btnSearch"));
                if (searchBtn) {
                    console.log("[CleaningController] Found Search button (" +
                        searchBtn.id +
                        "), clicking to refresh table...");
                    const isCustomBtn = searchBtn.id === "prebillingSelector";
                    searchBtn.click();
                    // Retry waiting for table
                    CleaningOverlay.CleaningOverlay.update(queue.currentIndex + 1, queue.tasks.length, `${this.getTaskInfo(currentTask, queue.pageType)} (正在刷新表格...)`);
                    // Important: Add delay if using custom button to allow event propagation and async loading start
                    const delayMs = isCustomBtn ? 1500 : 500;
                    setTimeout(() => {
                        this.waitForTable(queue.pageType, 15000)
                            .then(() => {
                            console.log("[CleaningController] Table loaded after auto-search, executing task...");
                            this.executeCurrentTask(queue);
                        })
                            .catch((retryError) => {
                            console.error("[CleaningController] Retry failed:", retryError);
                            queue.status = "FAILED";
                            GM_setValue(CLEANING_QUEUE_KEY, queue);
                            CleaningOverlay.CleaningOverlay.showError(`无法加载表格。尝试自动搜索失败。\n请手动点击搜索按钮，脚本将尝试恢复。`);
                        });
                    }, delayMs);
                    return;
                }
            }
            console.error("[CleaningController] Timeout waiting for table:", error);
            queue.status = "FAILED";
            GM_setValue(CLEANING_QUEUE_KEY, queue);
            CleaningOverlay.CleaningOverlay.showError(`页面加载超时，无法找到表格。\n请手动刷新页面，脚本将尝试恢复。`);
        });
        return true;
    }
    /**
     * 启动清理流程
     * 支持 POC 记录 (VisitRecord) 和 Call 记录
     */
    static async startCleaning(records, pageType) {
        // 转换为任务列表
        const tasks = records.map((record) => {
            if (pageType === "PREBILLING") {
                // POC 记录
                const visitRecord = record;
                return {
                    completed: false,
                    rowIndex: visitRecord.rowIndex,
                    visitDate: visitRecord.visitDate,
                    patientName: visitRecord.patientName,
                    admissionId: visitRecord.admissionId,
                    scheduledTime: visitRecord.scheduledTime,
                    visitTime: visitRecord.visitTime,
                    matchType: visitRecord.matchType,
                };
            }
            else {
                // Call 记录
                const callRecord = record;
                return {
                    completed: false,
                    // Extract specific properties for call task...
                    ...callRecord,
                }; // Cast for now
            }
        });
        console.log(`[CleaningController] Starting batch cleaning for ${tasks.length} items.`);
        console.log("[CleaningController] Queue Tasks:", tasks);
        // 创建任务队列
        const queue = {
            pageType,
            tasks,
            currentIndex: 0,
            startTime: Date.now(),
            status: "IN_PROGRESS",
        };
        // 保存到 GM_setValue
        GM_setValue(CLEANING_QUEUE_KEY, queue);
        console.log("[CleaningController] Started cleaning with", tasks.length, "tasks");
        // 显示蒙版
        CleaningOverlay.CleaningOverlay.show(1, tasks.length, this.getTaskInfo(tasks[0], pageType));
        // 执行第一个任务
        await this.executeCurrentTask(queue);
    }
    /**
     * 执行当前任务
     */
    static async executeCurrentTask(queue) {
        const task = queue.tasks[queue.currentIndex];
        try {
            if (queue.pageType === "PREBILLING") {
                await this.executePOCClean(task);
            }
            else {
                await this.executeCallReject(task);
            }
            // 注意：索引增加已移到各自的确认对话框处理函数中
            // - POC 任务：handleConfirmationDialog (在 index.ts 中)
            // - Call 任务：handleCallRejectConfirmation (在本类中)
            // 这确保索引在点击 OK 之前更新，页面刷新后能正确继续下一个任务
            // 页面会自动刷新，不需要手动触发下一个任务
        }
        catch (error) {
            console.error("[CleaningController] Task execution error:", error);
            task.error = error instanceof Error ? error.message : String(error);
            queue.status = "FAILED";
            GM_setValue(CLEANING_QUEUE_KEY, queue);
            CleaningOverlay.CleaningOverlay.showError(task.error);
        }
    }
    /**
     * 执行 POC 清理
     * 点击 Edit 按钮导航到 visit 详情页
     */
    static async executePOCClean(task) {
        console.log("[CleaningController] Executing POC clean for:", task.patientName);
        // 查找对应的表格行
        const table = document.querySelector("#tblDetails");
        if (!table) {
            throw new Error("Table not found");
        }
        const tbody = table.querySelector("tbody");
        const rows = tbody
            ? tbody.querySelectorAll("tr")
            : table.querySelectorAll("tr");
        // 通过 rowIndex 或匹配关键信息找到行
        // Verify or find the row using Admission ID and Patient Name (Prioritize exact match over rowIndex)
        // After a table reload/search, the rowIndex might have changed order.
        let targetRow = null;
        let foundByMatch = false;
        // First try to find by matching Admission ID and Patient Name
        for (const row of rows) {
            const cells = row.querySelectorAll("td");
            if (cells.length < 10)
                continue;
            // Normalize spaces to match PrebillingTableParser logic
            const admissionId = cells[1]?.textContent?.trim().replace(/\s+/g, " ");
            const patientName = cells[2]?.textContent?.trim().replace(/\s+/g, " ");
            if (admissionId === task.admissionId &&
                patientName?.includes(task.patientName || "")) {
                console.log(`[CleaningController] Searching Row: Matched ${task.patientName} (${task.admissionId})`);
                targetRow = row;
                foundByMatch = true;
                console.log(`[CleaningController] Found row by match for ${task.patientName} (${task.admissionId})`);
                break;
            }
        }
        // Fallback to rowIndex ONLY if match failed and rowIndex seems plausible (but risky)
        if (!foundByMatch && task.rowIndex !== undefined && rows[task.rowIndex]) {
            console.warn(`[CleaningController] Could not find by match, falling back to rowIndex ${task.rowIndex} for ${task.patientName}`);
            // Check if the row actually matches?
            const fallbackRow = rows[task.rowIndex];
            const cells = fallbackRow.querySelectorAll("td");
            const admissionId = cells[1]?.textContent?.trim();
            if (admissionId === task.admissionId) {
                targetRow = fallbackRow;
            }
            else {
                console.error(`[CleaningController] RowIndex ${task.rowIndex} mismatch! Expected ${task.admissionId}, found ${admissionId}`);
                // Do not use it if it mismatches
            }
        }
        // Confirm found
        if (!targetRow) {
            throw new Error(`Row not found for ${task.patientName} (${task.admissionId})`);
        }
        // 查找 Edit 按钮
        const editButton = targetRow.querySelector('a[name="imgEditInternal"]');
        if (!editButton) {
            throw new Error("Edit button not found");
        }
        // Update overlay to indicate navigation
        const queue = GM_getValue(CLEANING_QUEUE_KEY, null);
        if (queue) {
            CleaningOverlay.CleaningOverlay.update(queue.currentIndex + 1, queue.tasks.length, `${this.getTaskInfo(task, queue.pageType)} (正在打开详情页...)`);
        }
        // 点击 Edit 按钮，页面会导航到详情页
        editButton.click();
        // 页面会重新加载，在详情页会检测到待处理任务并执行 POCResolver
    }
    /**
     * 执行 Call Reject
     * 点击 Reject 按钮，然后处理确认对话框
     */
    static async executeCallReject(task) {
        console.log("[CleaningController] Executing Call reject for:", task.caregiverName);
        // 查找 Call Maintenance 表格
        const table = document.querySelector("#ctl00_ContentPlaceHolder1_uxGvSearch");
        if (!table) {
            throw new Error("Call Maintenance table not found");
        }
        const tbody = table.querySelector("tbody");
        const rows = tbody
            ? tbody.querySelectorAll("tr")
            : table.querySelectorAll("tr");
        // 通过 assignCode 和其他信息查找行
        let targetRow = null;
        for (const row of rows) {
            const cells = row.querySelectorAll("td");
            if (cells.length < 10)
                continue;
            const assignCode = cells[0]?.textContent?.trim();
            const caregiverName = cells[2]?.textContent?.trim();
            if (assignCode === task.assignCode &&
                caregiverName?.includes(task.caregiverName || "")) {
                targetRow = row;
                break;
            }
        }
        if (!targetRow) {
            throw new Error(`Row not found for ${task.caregiverName}`);
        }
        // 查找 Reject 按钮
        const rejectButton = targetRow.querySelector('a[id*="uxbtnRejectCall"]');
        if (!rejectButton) {
            throw new Error("Reject button not found");
        }
        // 点击 Reject 按钮
        console.log("[CleaningController] Clicking Reject button...");
        rejectButton.click();
        // 处理 "Confirm Call Rejection" 对话框
        // 对话框 ID: #confirmDelete, 确认按钮: button.primary
        setTimeout(() => {
            this.handleCallRejectConfirmation();
        }, 500);
    }
    /**
     * 处理 Call Reject 确认对话框
     * 对话框结构: #confirmDelete.reveal.hhax-modal
     * 确认按钮: button.button.primary (文字 "Ok")
     */
    static handleCallRejectConfirmation(retryCount = 0) {
        const MAX_RETRIES = 15;
        console.log(`[CleaningController] Looking for Call Reject confirmation dialog (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        // 精确选择器，基于调试发现的结构
        const selectors = [
            "#confirmDelete button.primary",
            "#confirmDelete button.button.primary",
            ".hhax-modal button.primary",
            ".reveal button.primary",
        ];
        let okButton = null;
        for (const selector of selectors) {
            const btn = document.querySelector(selector);
            if (btn && btn.offsetParent !== null) {
                okButton = btn;
                break;
            }
        }
        if (okButton) {
            // 在点击 OK 之前，增加任务索引
            try {
                const queue = GM_getValue(CLEANING_QUEUE_KEY, null);
                if (queue && queue.status === "IN_PROGRESS") {
                    queue.tasks[queue.currentIndex].completed = true;
                    queue.currentIndex++;
                    GM_setValue(CLEANING_QUEUE_KEY, queue);
                    console.log(`[CleaningController] Task index advanced to ${queue.currentIndex}/${queue.tasks.length}`);
                }
            }
            catch (e) {
                console.error("[CleaningController] Failed to update task queue:", e);
            }
            console.log("[CleaningController] Clicking Call Reject confirmation OK button...");
            okButton.click();
            // 点击后页面会刷新
        }
        else if (retryCount < MAX_RETRIES) {
            setTimeout(() => this.handleCallRejectConfirmation(retryCount + 1), 300);
        }
        else {
            console.log("[CleaningController] No Call Reject confirmation dialog found (may not be needed)");
        }
    }
    /**
     * 获取任务信息描述
     */
    static getTaskInfo(task, pageType) {
        if (pageType === "PREBILLING") {
            return `${task.patientName} - ${task.admissionId}`;
        }
        else {
            return `${task.caregiverName} - ${task.callDate}`;
        }
    }
    /**
     * 清除队列
     */
    static clearQueue() {
        GM_setValue(CLEANING_QUEUE_KEY, null);
        console.log("[CleaningController] Queue cleared");
    }
    /**
     * 获取当前队列状态
     */
    static getQueue() {
        return GM_getValue(CLEANING_QUEUE_KEY, null);
    }
    /**
     * 中止清理
     */
    static abortCleaning() {
        const queue = this.getQueue();
        if (queue) {
            queue.status = "FAILED";
            GM_setValue(CLEANING_QUEUE_KEY, queue);
        }
        CleaningOverlay.CleaningOverlay.hide();
    }
    /**
     * 等待表格元素加载完成
     * @param pageType 页面类型
     * @param timeoutMs 超时时间（毫秒）
     */
    static waitForTable(pageType, timeoutMs) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const selector = pageType === "PREBILLING"
                ? "#ctl00_ContentPlaceHolder1_divPrebillingReportInternalScroll" // Prebilling 容器
                : "#ctl00_ContentPlaceHolder1_uxGvSearch"; // Call Maintenance 表格
            const check = () => {
                const element = document.querySelector(selector);
                // 确保元素不仅存在，而且有内容（行数 > 0）
                // 对于 Call Maintenance，至少应该有 header row
                let isReady = false;
                if (element) {
                    if (pageType === "PREBILLING") {
                        // Check for the actual data table, not just the container
                        const dataTable = document.querySelector("#tblDetails");
                        isReady = !!dataTable; // Prebilling table must exist
                    }
                    else {
                        // Call Maintenance 表格应该有 tbody 或 tr
                        const table = element;
                        isReady = table.rows.length > 0;
                    }
                }
                if (isReady) {
                    resolve();
                    return;
                }
                if (Date.now() - startTime > timeoutMs) {
                    reject(new Error(`Timeout waiting for selector: ${selector}`));
                    return;
                }
                // 使用 requestAnimationFrame 或 setTimeout 轮询
                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(check);
                }
                else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }
}

;// ./src/js/tabs/CleanerTab.ts






/**
 * Cleaner Tab
 * Epic 11: POC 和 Duplicate Call 智能清理器
 *
 * 功能：
 * - 自动检测当前页面（Prebilling / Call Maintenance）
 * - 在 Prebilling 页面显示 POC 清理器
 * - 在 Call Maintenance 页面显示 Duplicate Call 清理器
 * - 非目标页面显示提示信息
 */
class CleanerTab extends BaseTab {
    constructor() {
        super(...arguments);
        this.id = "cleaner";
        this.label = "清理器";
        this.icon = "🧹";
        this.currentPageType = "UNKNOWN";
        this.pageChangeHandler = null;
        /** POC 清理器：解析到的 visit 记录 */
        this.visitRecords = [];
        /** POC 清理器：选中的记录索引 */
        this.selectedIndices = new Set();
        /** 自动刷新定时器 */
        this.pollingTimer = null;
        /** 上一次检测到的表格行数（用于检测变化） */
        this.lastTableRowCount = 0;
        /** Call 清理器：解析到的 Duplicate Call 记录 */
        this.callRecords = [];
        /** Call 清理器：是否显示详情 */
        this.showCallDetails = false;
        /** Call 清理器：事件处理器是否已设置（防止重复添加监听器） */
        this.callEventHandlersSet = false;
    }
    async init() {
        this.initialized = true;
        console.log("[CleanerTab] Initialized");
    }
    render(container) {
        this.container = container;
        container.classList.add("cleaner-tab");
        // 检测当前页面类型
        this.currentPageType = PageDetector.getCurrentPageType();
        // 渲染对应的 UI
        this.renderContent();
        // 监听页面变化
        this.pageChangeHandler = (pageType) => {
            if (pageType !== this.currentPageType) {
                this.currentPageType = pageType;
                this.renderContent();
            }
        };
        PageDetector.onPageChange(this.pageChangeHandler);
    }
    /**
     * 根据页面类型渲染内容
     */
    renderContent() {
        if (!this.container)
            return;
        // 清空容器
        this.container.innerHTML = "";
        switch (this.currentPageType) {
            case "PREBILLING":
                this.renderPrebillingCleaner();
                break;
            case "CALL_MAINTENANCE":
                this.renderCallCleaner();
                break;
            default:
                this.renderNoPageDetected();
                break;
        }
    }
    /**
     * 渲染 POC 清理器界面
     */
    renderPrebillingCleaner() {
        if (!this.container)
            return;
        const wrapper = document.createElement("div");
        wrapper.className = "cleaner-wrapper";
        wrapper.innerHTML = `
      <div class="cleaner-header">
        <div class="cleaner-title-row">
          <h3 class="cleaner-title">🧹 POC Compliance 清理器</h3>
          <span class="cleaner-page-tag">📍 当前页面: ${PageDetector.getPageDisplayName(this.currentPageType)}</span>
          <button id="cleaner-refresh-btn" class="cleaner-btn-refresh" title="刷新分析">🔄</button>
        </div>
      </div>
      
      <div class="cleaner-status" id="cleaner-analysis-status">
        <span class="cleaner-spinner">⏳</span> 正在分析表格...
      </div>
      
      <div class="cleaner-records-container" id="cleaner-records-container" style="display: none;">
        <div class="cleaner-toolbar">
          <label class="cleaner-select-all">
            <input type="checkbox" id="cleaner-select-all-checkbox">
            <span>全选</span>
          </label>
          <button id="cleaner-clean-btn" class="cleaner-btn-primary" disabled>
            清理选中项 (0)
          </button>
        </div>
        
        <div class="cleaner-records-list" id="cleaner-records-list">
          <!-- 动态填充记录 -->
        </div>
      </div>
      
      <div class="cleaner-empty-state" id="cleaner-empty-state" style="display: none;">
        <div class="cleaner-empty-icon">✅</div>
        <p>当前页面已清空 POC 问题！</p>
        <p class="cleaner-hint">💡 如果表格有数据但未显示，请先点击 "Search by Coordinator(s)" 按钮搜索，然后点击 🔄 刷新</p>
      </div>
    `;
        this.container.appendChild(wrapper);
        // 刷新按钮事件监听
        const refreshBtn = document.getElementById("cleaner-refresh-btn");
        refreshBtn?.addEventListener("click", () => {
            console.log("[CleanerTab] Manual refresh triggered");
            this.analyzePrebillingTable(); // 重新分析表格
        });
        // 启动自动轮询
        this.startPolling();
        // 调用 PrebillingTableParser 分析表格
        this.analyzePrebillingTable();
    }
    /**
     * 渲染 Duplicate Call 清理器界面
     */
    renderCallCleaner() {
        if (!this.container)
            return;
        const wrapper = document.createElement("div");
        wrapper.className = "cleaner-wrapper";
        wrapper.innerHTML = `
      <div class="cleaner-header">
        <div class="cleaner-title-row">
          <h3 class="cleaner-title">🧹 Duplicate Call 清理器</h3>
          <span class="cleaner-page-tag">📍 当前页面: ${PageDetector.getPageDisplayName(this.currentPageType)}</span>
          <button id="cleaner-refresh-btn" class="cleaner-btn-refresh" title="刷新分析">🔄</button>
        </div>
      </div>
      
      <div class="cleaner-status" id="cleaner-analysis-status">
        <span class="cleaner-spinner">⏳</span> 正在分析表格...
      </div>
      
      <div class="cleaner-call-container" id="cleaner-call-container" style="display: none;">
        <div class="cleaner-call-summary">
          <span class="cleaner-call-count">📊 检测到 <strong id="cleaner-call-count-num">0</strong> 个 Duplicate Call</span>
        </div>
        
        <div class="cleaner-toolbar">
          <button id="cleaner-toggle-details" class="cleaner-btn-secondary">
            ▼ 显示详情
          </button>
          <button id="cleaner-clean-all-btn" class="cleaner-btn-primary" disabled>
            一键清理全部
          </button>
        </div>
        
        <div class="cleaner-call-details" id="cleaner-call-details" style="display: none;">
          <!-- 动态填充详情 -->
        </div>
      </div>
      
      <div class="cleaner-empty-state" id="cleaner-empty-state" style="display: none;">
        <div class="cleaner-empty-icon">✅</div>
        <p>当前页面已清空 Duplicate Call 问题！</p>
        <p class="cleaner-hint">💡 如果表格有数据但未显示，请先执行搜索，然后点击 🔄 刷新</p>
      </div>
    `;
        this.container.appendChild(wrapper);
        // 重置事件处理器标志（新渲染时需要重新设置）
        this.callEventHandlersSet = false;
        // 刷新按钮事件监听
        const refreshBtn = document.getElementById("cleaner-refresh-btn");
        refreshBtn?.addEventListener("click", () => {
            console.log("[CleanerTab] Manual refresh triggered (Call Maintenance)");
            this.analyzeCallMaintenanceTable();
        });
        // 启动自动轮询
        this.startCallPolling();
        // 调用 CallMaintenanceTableParser 分析表格
        this.analyzeCallMaintenanceTable();
    }
    /**
     * 渲染未检测到有效页面的提示
     */
    renderNoPageDetected() {
        if (!this.container)
            return;
        const placeholder = this.createPlaceholder("⚠️", "未检测到有效页面", "");
        // 添加支持的页面列表
        const infoDiv = document.createElement("div");
        infoDiv.className = "cleaner-no-page-info";
        infoDiv.innerHTML = `
      <p>清理器目前支持以下页面：</p>
      <ul>
        <li><strong>Prebilling Report Internal</strong> - POC Compliance 清理</li>
        <li><strong>Call Maintenance</strong> - Duplicate Call 清理</li>
      </ul>
      <p class="cleaner-hint">请导航到上述页面之一来使用清理功能。</p>
    `;
        placeholder.appendChild(infoDiv);
        this.container.appendChild(placeholder);
    }
    /**
     * 分析 Prebilling 表格
     * Story 2 & 3: 使用 PrebillingTableParser 解析并渲染列表
     */
    async analyzePrebillingTable() {
        const statusEl = document.getElementById("cleaner-analysis-status");
        const recordsContainer = document.getElementById("cleaner-records-container");
        const emptyState = document.getElementById("cleaner-empty-state");
        try {
            // 调用真实的解析器
            this.visitRecords = await PrebillingTableParser.parseTable();
            this.selectedIndices.clear();
            if (statusEl)
                statusEl.style.display = "none";
            if (this.visitRecords.length === 0) {
                // 无符合条件的记录，显示成功状态
                if (emptyState)
                    emptyState.style.display = "flex";
                if (recordsContainer)
                    recordsContainer.style.display = "none";
            }
            else {
                // 有记录，渲染列表
                if (emptyState)
                    emptyState.style.display = "none";
                if (recordsContainer)
                    recordsContainer.style.display = "block";
                this.renderPrebillingRecordsList();
                this.setupPrebillingEventHandlers();
            }
        }
        catch (error) {
            console.error("[CleanerTab] Error analyzing Prebilling table:", error);
            if (statusEl) {
                statusEl.innerHTML = `<span style="color: #e53935;">❌ 分析表格时出错</span>`;
            }
        }
    }
    /**
     * 渲染 POC 记录列表
     */
    renderPrebillingRecordsList() {
        const listEl = document.getElementById("cleaner-records-list");
        if (!listEl)
            return;
        listEl.innerHTML = this.visitRecords
            .map((record, index) => `
      <div class="cleaner-record-item" data-index="${index}">
        <input type="checkbox" class="cleaner-record-checkbox" data-index="${index}">
        <div class="cleaner-record-info">
          <div class="record-main">
            <span class="cleaner-badge ${record.matchType === "POC_ONLY"
            ? "badge-poc"
            : "badge-poc-caregiver"}">
              ${record.matchType === "POC_ONLY" ? "POC" : "POC+CG"}
            </span>
            ${record.patientName} | ${record.admissionId}
          </div>
          <div class="record-detail">
            📅 ${record.visitDate} | 🕐 ${record.scheduledTime}
          </div>
        </div>
      </div>
    `)
            .join("");
        this.updateCleanButtonState();
    }
    /**
     * 设置 Prebilling 清理器的事件处理器
     */
    setupPrebillingEventHandlers() {
        const selectAllCheckbox = document.getElementById("cleaner-select-all-checkbox");
        const cleanBtn = document.getElementById("cleaner-clean-btn");
        // 全选/取消全选
        selectAllCheckbox?.addEventListener("change", () => {
            const checkboxes = document.querySelectorAll(".cleaner-record-checkbox");
            if (selectAllCheckbox.checked) {
                this.selectedIndices = new Set(this.visitRecords.map((_, i) => i));
                checkboxes.forEach((cb) => (cb.checked = true));
            }
            else {
                this.selectedIndices.clear();
                checkboxes.forEach((cb) => (cb.checked = false));
            }
            this.updateCleanButtonState();
        });
        // 单个复选框
        document
            .querySelectorAll(".cleaner-record-checkbox")
            .forEach((checkbox) => {
            checkbox.addEventListener("change", (e) => {
                const target = e.target;
                const index = parseInt(target.dataset.index || "0", 10);
                if (target.checked) {
                    this.selectedIndices.add(index);
                }
                else {
                    this.selectedIndices.delete(index);
                }
                // 更新全选状态
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked =
                        this.selectedIndices.size === this.visitRecords.length;
                }
                this.updateCleanButtonState();
            });
        });
        // 清理按钮（Story 4-6 实现真实清理逻辑）
        cleanBtn?.addEventListener("click", () => {
            this.handleCleanSelectedVisits();
        });
    }
    /**
     * 更新清理按钮状态
     */
    updateCleanButtonState() {
        const cleanBtn = document.getElementById("cleaner-clean-btn");
        if (!cleanBtn)
            return;
        const count = this.selectedIndices.size;
        cleanBtn.textContent = `清理选中项 (${count})`;
        cleanBtn.disabled = count === 0;
    }
    /**
     * 处理清理选中的 visits
     * Story 4-6: 显示确认对话框并启动清理
     */
    async handleCleanSelectedVisits() {
        const selectedRecords = Array.from(this.selectedIndices).map((i) => this.visitRecords[i]);
        if (selectedRecords.length === 0) {
            return;
        }
        console.log("[CleanerTab] Selected records for cleaning:", selectedRecords);
        // 显示确认对话框
        const confirmed = await CleaningOverlay.CleaningOverlay.showConfirmDialog(selectedRecords.length, "PREBILLING");
        if (!confirmed) {
            console.log("[CleanerTab] User cancelled cleaning");
            return;
        }
        // 启动清理流程
        await CleaningController.startCleaning(selectedRecords, "PREBILLING");
    }
    /**
     * 分析 Call Maintenance 表格
     * Story 7: 使用 CallMaintenanceTableParser 解析并渲染
     */
    async analyzeCallMaintenanceTable() {
        const statusEl = document.getElementById("cleaner-analysis-status");
        const callContainer = document.getElementById("cleaner-call-container");
        const emptyState = document.getElementById("cleaner-empty-state");
        try {
            // 调用真实的解析器
            this.callRecords = await CallMaintenanceTableParser.parseTable();
            if (statusEl)
                statusEl.style.display = "none";
            if (this.callRecords.length === 0) {
                // 无 Duplicate Call，显示成功状态
                if (emptyState)
                    emptyState.style.display = "flex";
                if (callContainer)
                    callContainer.style.display = "none";
            }
            else {
                // 有记录，显示 UI
                if (emptyState)
                    emptyState.style.display = "none";
                if (callContainer)
                    callContainer.style.display = "block";
                // 更新数量
                const countEl = document.getElementById("cleaner-call-count-num");
                if (countEl)
                    countEl.textContent = String(this.callRecords.length);
                // 启用清理按钮
                const cleanBtn = document.getElementById("cleaner-clean-all-btn");
                if (cleanBtn)
                    cleanBtn.disabled = false;
                // 渲染详情列表
                this.renderCallDetailsList();
                // 设置事件处理器 - 只在首次设置，避免重复添加监听器
                if (!this.callEventHandlersSet) {
                    this.setupCallEventHandlers();
                    this.callEventHandlersSet = true;
                }
                else {
                    // 更新 toggle 按钮和详情显示状态（保持之前的展开/收起状态）
                    this.updateCallToggleState();
                }
            }
        }
        catch (error) {
            console.error("[CleanerTab] Error analyzing Call Maintenance table:", error);
            if (statusEl) {
                statusEl.innerHTML = `<span style="color: #e53935;">❌ 分析表格时出错</span>`;
            }
        }
    }
    /**
     * 渲染 Duplicate Call 详情列表
     */
    renderCallDetailsList() {
        const detailsContainer = document.getElementById("cleaner-call-details");
        if (!detailsContainer)
            return;
        detailsContainer.innerHTML = this.callRecords
            .map((record) => `
      <div class="cleaner-call-item">
        • ${record.assignCode} | ${record.caregiverName} | ${record.patientName || "-"} | ${record.callDate} ${record.callTime}
      </div>
    `)
            .join("");
    }
    /**
     * 设置 Call 清理器事件处理器
     */
    setupCallEventHandlers() {
        // 切换详情显示
        const toggleBtn = document.getElementById("cleaner-toggle-details");
        const detailsContainer = document.getElementById("cleaner-call-details");
        toggleBtn?.addEventListener("click", () => {
            this.showCallDetails = !this.showCallDetails;
            if (toggleBtn) {
                toggleBtn.textContent = this.showCallDetails
                    ? "▲ 隐藏详情"
                    : "▼ 显示详情";
            }
            if (detailsContainer) {
                detailsContainer.style.display = this.showCallDetails
                    ? "block"
                    : "none";
            }
        });
        // 一键清理全部按钮
        const cleanAllBtn = document.getElementById("cleaner-clean-all-btn");
        cleanAllBtn?.addEventListener("click", () => {
            this.handleCleanAllCalls();
        });
    }
    /**
     * 更新 toggle 按钮和详情显示状态（不重新添加事件监听器）
     * 用于轮询刷新时保持展开/收起状态
     */
    updateCallToggleState() {
        const toggleBtn = document.getElementById("cleaner-toggle-details");
        const detailsContainer = document.getElementById("cleaner-call-details");
        if (toggleBtn) {
            toggleBtn.textContent = this.showCallDetails
                ? "▲ 隐藏详情"
                : "▼ 显示详情";
        }
        if (detailsContainer) {
            detailsContainer.style.display = this.showCallDetails ? "block" : "none";
        }
    }
    /**
     * 处理一键清理全部 Duplicate Calls
     */
    async handleCleanAllCalls() {
        if (this.callRecords.length === 0)
            return;
        // 显示确认对话框
        const confirmed = await CleaningOverlay.CleaningOverlay.showConfirmDialog(this.callRecords.length, "CALL_MAINTENANCE");
        if (!confirmed) {
            console.log("[CleanerTab] User cancelled Call cleaning");
            return;
        }
        // 启动清理流程
        await CleaningController.startCleaning(this.callRecords.map((record) => ({
            assignCode: record.assignCode,
            caregiverName: record.caregiverName,
            patientName: record.patientName,
            callDate: record.callDate,
            callTime: record.callTime,
            rowElement: record.rowElement,
        })), "CALL_MAINTENANCE");
    }
    onActivate() {
        console.log("[CleanerTab] Activated");
        // 重新检测页面类型
        this.currentPageType = PageDetector.getCurrentPageType();
        // 每次激活都重新渲染，确保在表格数据加载后能够重新分析
        this.renderContent();
    }
    onDeactivate() {
        console.log("[CleanerTab] Deactivated");
        // 停止轮询（当 tab 不可见时节省资源）
        this.stopPolling();
    }
    destroy() {
        // 停止轮询
        this.stopPolling();
        // 移除页面变化监听器
        if (this.pageChangeHandler) {
            PageDetector.offPageChange(this.pageChangeHandler);
            this.pageChangeHandler = null;
        }
        super.destroy();
    }
    /**
     * 启动自动轮询
     * 每隔一段时间检测表格是否有变化
     */
    startPolling() {
        // 先停止现有的轮询
        this.stopPolling();
        // 只在 Prebilling 页面启动轮询
        if (this.currentPageType !== "PREBILLING") {
            return;
        }
        console.log("[CleanerTab] Starting auto-polling (interval: " +
            CleanerTab.POLLING_INTERVAL +
            "ms)");
        this.pollingTimer = setInterval(() => {
            // 检测表格行数是否变化
            const currentRowCount = PrebillingTableParser.getTotalRowCount();
            if (currentRowCount !== this.lastTableRowCount) {
                console.log(`[CleanerTab] Table changed: ${this.lastTableRowCount} -> ${currentRowCount} rows`);
                this.lastTableRowCount = currentRowCount;
                // 只有当有新数据时才重新分析
                if (currentRowCount > 0) {
                    this.analyzePrebillingTable();
                }
            }
        }, CleanerTab.POLLING_INTERVAL);
    }
    /**
     * 停止自动轮询
     */
    stopPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
            console.log("[CleanerTab] Polling stopped");
        }
    }
    /**
     * 启动 Call Maintenance 自动轮询
     */
    startCallPolling() {
        // 先停止现有的轮询
        this.stopPolling();
        // 只在 Call Maintenance 页面启动轮询
        if (this.currentPageType !== "CALL_MAINTENANCE") {
            return;
        }
        console.log("[CleanerTab] Starting Call Maintenance auto-polling (interval: " +
            CleanerTab.POLLING_INTERVAL +
            "ms)");
        this.pollingTimer = setInterval(() => {
            // 检测表格行数是否变化
            const currentRowCount = CallMaintenanceTableParser.getTotalRowCount();
            if (currentRowCount !== this.lastTableRowCount) {
                console.log(`[CleanerTab] Call table changed: ${this.lastTableRowCount} -> ${currentRowCount} rows`);
                this.lastTableRowCount = currentRowCount;
                // 只有当有新数据时才重新分析
                if (currentRowCount > 0) {
                    this.analyzeCallMaintenanceTable();
                }
            }
        }, CleanerTab.POLLING_INTERVAL);
    }
}
/** 自动轮询间隔（毫秒） */
CleanerTab.POLLING_INTERVAL = 5000;

;// ./src/js/services/ProfileDataExtractor.ts
/**
 * ProfileDataExtractor Service
 * Epic 12, Story 1 & 2: 页面数据提取服务
 *
 * 识别当前页面类型并从 DOM 提取病人/护理员信息：
 * - PATIENT_INTERNAL: InternalPatientInfo_ns.aspx
 * - PATIENT_NS: Patient_ns.aspx
 * - CAREGIVER: Aide_ns.aspx
 * - UNKNOWN: 其他页面
 */
/**
 * CSS 选择器配置
 * 基于 Chrome MCP DOM 分析结果
 */
const ProfileDataExtractor_SELECTORS = {
    // 病人 InternalPatientInfo 页面
    PATIENT_INTERNAL: {
        name: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientName",
        id: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientNumber", // 小写 d
        dob: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientDOB",
        address: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblAddress",
        insurance: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblContracts",
    },
    // 病人 Patient_ns 页面
    PATIENT_NS: {
        name: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientName",
        id: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientNumber", // 大写 ID
        dob: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientDOB",
        address: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblAddress",
        insurance: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblChhaName", // 不同字段
    },
    // 护理员 Aide_ns 页面
    CAREGIVER: {
        name: "#ctl00_ContentPlaceHolder1_uxlblInfoName",
        id: "#ctl00_ContentPlaceHolder1_uxlblInfoAideInitials",
        dob: "#ctl00_ContentPlaceHolder1_uxlblInfoDOB",
        address: "#uxHyPAddress",
        addressFallback: "#lblInfoAddress",
    },
};
class ProfileDataExtractor {
    /**
     * 检测当前页面类型
     */
    static detectPageType() {
        const url = window.location.href;
        if (url.includes("InternalPatientInfo_ns.aspx")) {
            return "PATIENT_INTERNAL";
        }
        if (url.includes("Patient_ns.aspx")) {
            return "PATIENT_NS";
        }
        if (url.includes("Aide_ns.aspx")) {
            return "CAREGIVER";
        }
        return "UNKNOWN";
    }
    /**
     * 获取当前页面类型（缓存版本）
     */
    static getCurrentPageType() {
        this.currentPageType = this.detectPageType();
        return this.currentPageType;
    }
    /**
     * 提取页面数据
     */
    static extract() {
        const pageType = this.detectPageType();
        switch (pageType) {
            case "PATIENT_INTERNAL":
                return this.extractPatientInternal();
            case "PATIENT_NS":
                return this.extractPatientNs();
            case "CAREGIVER":
                return this.extractCaregiver();
            default:
                return null;
        }
    }
    /**
     * 从 InternalPatientInfo 页面提取数据
     */
    static extractPatientInternal() {
        const selectors = ProfileDataExtractor_SELECTORS.PATIENT_INTERNAL;
        return {
            type: "PATIENT",
            name: this.getText(selectors.name),
            id: this.getText(selectors.id),
            dob: this.getText(selectors.dob),
            address: this.getText(selectors.address),
            phone: this.getPhoneFromTelLink(),
            insurance: this.getText(selectors.insurance),
        };
    }
    /**
     * 从 Patient_ns 页面提取数据
     */
    static extractPatientNs() {
        const selectors = ProfileDataExtractor_SELECTORS.PATIENT_NS;
        return {
            type: "PATIENT",
            name: this.getText(selectors.name),
            id: this.getText(selectors.id),
            dob: this.getText(selectors.dob),
            address: this.getText(selectors.address),
            phone: this.getPhoneFromTelLink(),
            insurance: this.getText(selectors.insurance),
        };
    }
    /**
     * 从 Aide_ns 页面提取数据
     */
    static extractCaregiver() {
        const selectors = ProfileDataExtractor_SELECTORS.CAREGIVER;
        // 地址尝试两个选择器
        let address = this.getText(selectors.address);
        if (!address) {
            address = this.getText(selectors.addressFallback);
        }
        return {
            type: "CAREGIVER",
            name: this.getText(selectors.name),
            id: this.getText(selectors.id),
            dob: this.getText(selectors.dob),
            address: address,
            phone: this.getPhoneFromTelLink(),
        };
    }
    /**
     * 获取元素文本内容
     */
    static getText(selector) {
        const el = document.querySelector(selector);
        return el?.textContent?.trim() || "";
    }
    /**
     * 从 tel: 链接提取电话号码
     */
    static getPhoneFromTelLink() {
        const telLink = document.querySelector('a[href^="tel:"]');
        if (telLink) {
            // 从 href="tel:917-622-0826" 提取号码
            const href = telLink.getAttribute("href") || "";
            return href.replace("tel:", "").trim();
        }
        return "";
    }
    /**
     * 注册页面变化监听器
     */
    static onPageChange(callback) {
        this.listeners.push(callback);
        // 首次调用时启动监听
        if (this.checkInterval === null) {
            this.startWatching();
        }
    }
    /**
     * 移除页面变化监听器
     */
    static offPageChange(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
        // 如果没有监听器，停止监听
        if (this.listeners.length === 0 && this.checkInterval !== null) {
            this.stopWatching();
        }
    }
    /**
     * 开始监听 URL 变化
     */
    static startWatching() {
        this.currentPageType = this.detectPageType();
        // 每 500ms 检查一次 URL 变化
        this.checkInterval = window.setInterval(() => {
            const newPageType = this.detectPageType();
            if (newPageType !== this.currentPageType) {
                console.log(`[ProfileDataExtractor] Page changed: ${this.currentPageType} -> ${newPageType}`);
                this.currentPageType = newPageType;
                this.notifyListeners(newPageType);
            }
        }, 500);
        console.log("[ProfileDataExtractor] Started watching for page changes");
    }
    /**
     * 停止监听 URL 变化
     */
    static stopWatching() {
        if (this.checkInterval !== null) {
            window.clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log("[ProfileDataExtractor] Stopped watching for page changes");
        }
    }
    /**
     * 通知所有监听器
     */
    static notifyListeners(pageType) {
        this.listeners.forEach((callback) => {
            try {
                callback(pageType);
            }
            catch (error) {
                console.error("[ProfileDataExtractor] Error in listener callback:", error);
            }
        });
    }
    /**
     * 获取页面友好名称
     */
    static getPageDisplayName(pageType) {
        switch (pageType) {
            case "PATIENT_INTERNAL":
            case "PATIENT_NS":
                return "病人主页";
            case "CAREGIVER":
                return "护理员主页";
            default:
                return "未知页面";
        }
    }
    /**
     * 判断是否为 Profile 页面
     */
    static isProfilePage(pageType) {
        return pageType !== "UNKNOWN";
    }
    /**
     * 清理资源
     */
    static cleanup() {
        this.stopWatching();
        this.listeners = [];
    }
}
ProfileDataExtractor.currentPageType = "UNKNOWN";
ProfileDataExtractor.listeners = [];
ProfileDataExtractor.checkInterval = null;

;// ./src/js/services/TemplateManager.ts
/**
 * TemplateManager Service
 * Epic 12, Story 3: 模板管理器
 *
 * 处理自定义邮件模板的 CRUD 和导入导出
 * 使用 GM_setValue 持久化存储
 */
/**
 * 模板管理器
 */
class TemplateManager {
    /**
     * 获取所有模板
     */
    static getAll() {
        try {
            const stored = GM_getValue(this.STORAGE_KEY, "[]");
            return JSON.parse(stored);
        }
        catch (error) {
            console.error("[TemplateManager] Error parsing templates:", error);
            return [];
        }
    }
    /**
     * 根据 ID 获取模板
     */
    static getById(templateId) {
        const templates = this.getAll();
        return templates.find((t) => t.id === templateId) || null;
    }
    /**
     * 保存模板（新增或更新）
     */
    static save(template) {
        const templates = this.getAll();
        const now = Date.now();
        if (template.id) {
            // 更新现有模板
            const index = templates.findIndex((t) => t.id === template.id);
            if (index >= 0) {
                const updated = {
                    ...templates[index],
                    ...template,
                    id: template.id,
                    updatedAt: now,
                };
                templates[index] = updated;
                this.saveAll(templates);
                console.log("[TemplateManager] Updated template:", updated.name);
                return updated;
            }
        }
        // 新增模板
        const newTemplate = {
            ...template,
            id: this.generateId(),
            createdAt: now,
            updatedAt: now,
        };
        templates.push(newTemplate);
        this.saveAll(templates);
        console.log("[TemplateManager] Created template:", newTemplate.name);
        return newTemplate;
    }
    /**
     * 删除模板
     */
    static delete(templateId) {
        const templates = this.getAll();
        const index = templates.findIndex((t) => t.id === templateId);
        if (index >= 0) {
            const deleted = templates.splice(index, 1)[0];
            this.saveAll(templates);
            console.log("[TemplateManager] Deleted template:", deleted.name);
            return true;
        }
        return false;
    }
    /**
     * 导出为 JSON 文件下载
     */
    static exportToFile() {
        const templates = this.getAll();
        const json = JSON.stringify(templates, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hha-mail-templates-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("[TemplateManager] Exported", templates.length, "templates");
    }
    /**
     * 从文件导入
     * @returns 导入的模板数量
     */
    static async importFromFile(file) {
        const text = await file.text();
        let imported;
        try {
            imported = JSON.parse(text);
        }
        catch (error) {
            throw new Error("无法解析 JSON 文件，请检查文件格式。");
        }
        if (!Array.isArray(imported)) {
            throw new Error("导入的数据格式不正确，应为模板数组。");
        }
        // 验证模板结构
        for (const template of imported) {
            if (!template.name || !template.subject) {
                throw new Error(`模板 "${template.name || "未知"}" 缺少必要字段。`);
            }
        }
        // 合并到现有模板（按 ID 去重）
        const existing = this.getAll();
        const existingIds = new Set(existing.map((t) => t.id));
        let addedCount = 0;
        for (const template of imported) {
            if (!existingIds.has(template.id)) {
                // 确保有时间戳
                if (!template.createdAt)
                    template.createdAt = Date.now();
                if (!template.updatedAt)
                    template.updatedAt = Date.now();
                existing.push(template);
                addedCount++;
            }
        }
        this.saveAll(existing);
        console.log("[TemplateManager] Imported", addedCount, "new templates");
        return addedCount;
    }
    /**
     * 根据页面类型筛选模板
     */
    static getByPageType(pageType) {
        return this.getAll().filter((t) => t.targetPageType === pageType || t.targetPageType === "ANY");
    }
    /**
     * 保存所有模板到 GM_setValue
     */
    static saveAll(templates) {
        GM_setValue(this.STORAGE_KEY, JSON.stringify(templates));
    }
    /**
     * 生成唯一 ID
     */
    static generateId() {
        return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 创建默认示例模板（仅用于首次使用）
     */
    static createDefaultTemplates() {
        const templates = this.getAll();
        if (templates.length > 0)
            return;
        // 创建示例模板
        this.save({
            name: "护理员请假通知",
            targetPageType: "CAREGIVER",
            to: "scheduler@example.com",
            cc: "",
            subject: "Aide: {{aide_name}} {{aide_id}} Vacation Request",
            body: `Hi,

Please be advised that the following caregiver is requesting time off:

Name: {{aide_name}}
ID: {{aide_id}}

Thank you.`,
            variables: [
                {
                    placeholder: "{{aide_name}}",
                    selector: "#ctl00_ContentPlaceHolder1_uxlblInfoName",
                    method: "text",
                },
                {
                    placeholder: "{{aide_id}}",
                    selector: "#ctl00_ContentPlaceHolder1_uxlblInfoAideInitials",
                    method: "text",
                },
            ],
        });
        this.save({
            name: "病人信息请求",
            targetPageType: "PATIENT",
            to: "info@example.com",
            cc: "",
            subject: "Patient: {{patient_name}} {{patient_id}} - Information Request",
            body: `Hi,

I am requesting information for the following patient:

Name: {{patient_name}}
ID: {{patient_id}}

Thank you.`,
            variables: [
                {
                    placeholder: "{{patient_name}}",
                    selector: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientName",
                    method: "text",
                },
                {
                    placeholder: "{{patient_id}}",
                    selector: "#ctl00_ContentPlaceHolder1_PatientInfo1_uxLblPatientNumber",
                    method: "text",
                },
            ],
        });
        console.log("[TemplateManager] Created default templates");
    }
}
TemplateManager.STORAGE_KEY = "hha_mail_templates";

;// ./src/js/services/TemplateEngine.ts
/**
 * TemplateEngine Service
 * Epic 12, Story 4: 模板变量替换引擎
 *
 * 处理模板中的变量占位符替换
 * 支持内置变量和自定义 CSS 选择器变量
 */
/**
 * 模板变量引擎
 */
class TemplateEngine {
    /**
     * 渲染模板
     * 将模板中的变量替换为实际值
     */
    static render(template, profileData) {
        return {
            to: this.replaceVariables(template.to, profileData, template.variables),
            cc: this.replaceVariables(template.cc || "", profileData, template.variables),
            subject: this.replaceVariables(template.subject, profileData, template.variables),
            body: this.replaceVariables(template.body, profileData, template.variables),
        };
    }
    /**
     * 替换字符串中的变量
     */
    static replaceVariables(text, profileData, customVariables) {
        if (!text)
            return text;
        let result = text;
        // 1. 替换内置变量
        if (profileData) {
            for (const [placeholder, getter] of Object.entries(this.BUILTIN_VARIABLES)) {
                if (result.includes(placeholder)) {
                    const value = getter(profileData);
                    result = result.split(placeholder).join(value);
                }
            }
        }
        // 2. 替换自定义变量（通过 CSS 选择器获取）
        for (const variable of customVariables) {
            if (result.includes(variable.placeholder)) {
                const value = this.extractValueBySelector(variable);
                result = result.split(variable.placeholder).join(value);
            }
        }
        // 3. 清理未替换的变量（替换为空字符串）
        result = result.replace(/\{\{[^}]+\}\}/g, "");
        return result;
    }
    /**
     * 通过 CSS 选择器提取值
     */
    static extractValueBySelector(variable) {
        try {
            const element = document.querySelector(variable.selector);
            if (!element)
                return "";
            switch (variable.method) {
                case "text":
                    return element.textContent?.trim() || "";
                case "val":
                    return element.value?.trim() || "";
                case "attr":
                    return variable.attrName
                        ? element.getAttribute(variable.attrName) || ""
                        : "";
                default:
                    return element.textContent?.trim() || "";
            }
        }
        catch (error) {
            console.error(`[TemplateEngine] Error extracting value for ${variable.placeholder}:`, error);
            return "";
        }
    }
    /**
     * 解析模板中使用的变量列表
     */
    static parseVariables(text) {
        const regex = /\{\{([^}]+)\}\}/g;
        const variables = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            const placeholder = `{{${match[1]}}}`;
            if (!variables.includes(placeholder)) {
                variables.push(placeholder);
            }
        }
        return variables;
    }
    /**
     * 检查变量是否为内置变量
     */
    static isBuiltinVariable(placeholder) {
        return placeholder in this.BUILTIN_VARIABLES;
    }
    /**
     * 获取所有内置变量列表
     */
    static getBuiltinVariables() {
        return Object.keys(this.BUILTIN_VARIABLES);
    }
    /**
     * 预览模板渲染结果
     * 用于在编辑器中实时预览
     */
    static preview(template, profileData) {
        return {
            to: this.replaceVariables(template.to || "", profileData, []),
            cc: this.replaceVariables(template.cc || "", profileData, []),
            subject: this.replaceVariables(template.subject || "", profileData, []),
            body: this.replaceVariables(template.body || "", profileData, []),
        };
    }
}
/**
 * 内置变量映射
 * 这些变量可以直接使用 ProfileData 中的数据
 */
TemplateEngine.BUILTIN_VARIABLES = {
    // 病人相关变量
    "{{patient_name}}": (data) => (data.type === "PATIENT" ? data.name : ""),
    "{{patient_id}}": (data) => (data.type === "PATIENT" ? data.id : ""),
    "{{patient_dob}}": (data) => data.type === "PATIENT" ? data.dob || "" : "",
    "{{patient_phone}}": (data) => data.type === "PATIENT" ? data.phone || "" : "",
    "{{patient_address}}": (data) => data.type === "PATIENT" ? data.address || "" : "",
    "{{patient_insurance}}": (data) => data.type === "PATIENT" ? data.insurance || "" : "",
    // 护理员相关变量
    "{{aide_name}}": (data) => (data.type === "CAREGIVER" ? data.name : ""),
    "{{aide_id}}": (data) => (data.type === "CAREGIVER" ? data.id : ""),
    "{{caregiver_name}}": (data) => data.type === "CAREGIVER" ? data.name : "",
    "{{caregiver_id}}": (data) => (data.type === "CAREGIVER" ? data.id : ""),
    "{{caregiver_dob}}": (data) => data.type === "CAREGIVER" ? data.dob || "" : "",
    "{{caregiver_phone}}": (data) => data.type === "CAREGIVER" ? data.phone || "" : "",
    "{{caregiver_address}}": (data) => data.type === "CAREGIVER" ? data.address || "" : "",
    // 通用变量
    "{{name}}": (data) => data.name,
    "{{id}}": (data) => data.id,
    "{{dob}}": (data) => data.dob || "",
    "{{phone}}": (data) => data.phone || "",
    "{{address}}": (data) => data.address || "",
    // 日期变量
    "{{today}}": () => new Date().toLocaleDateString("en-US"),
    "{{today_cn}}": () => new Date().toLocaleDateString("zh-CN"),
    "{{now}}": () => new Date().toLocaleString("en-US"),
};

;// ./src/js/services/MailService.ts
/**
 * MailService - 跨 Tab 邮件任务通讯服务
 * Epic 12, Story 7: 独立的跨 Tab 通讯服务
 *
 * 职责：
 * - HHA Tab 发送邮件任务到 Outlook Tab
 * - 使用 GM_setValue 实现跨域数据共享
 * - 轮询检测任务更新
 *
 * 独立实现：不依赖 VisitMonitor.ts 的 TabSyncManager
 */
/**
 * MailService 类
 * 独立的跨 Tab 通讯服务
 */
class MailService {
    /**
     * 初始化服务
     */
    static init() {
        this.tabId = this.generateTabId();
        console.log("[MailService] Initialized with tabId:", this.tabId);
    }
    /**
     * 生成唯一的 Tab ID
     */
    static generateTabId() {
        return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 获取当前 Tab ID
     */
    static getTabId() {
        if (!this.tabId) {
            this.init();
        }
        return this.tabId;
    }
    /**
     * 发送邮件任务（HHA 端调用）
     */
    static sendMailTask(task) {
        const taskId = `task_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        const payload = {
            id: taskId,
            status: "PENDING",
            data: task,
            timestamp: Date.now(),
            sourceTabId: this.getTabId(),
        };
        GM_setValue(this.TASK_KEY, JSON.stringify(payload));
        console.log("[MailService] Sent mail task:", taskId, task);
        return taskId;
    }
    /**
     * 获取当前任务载荷
     */
    static getTaskPayload() {
        try {
            const stored = GM_getValue(this.TASK_KEY, "");
            if (!stored)
                return null;
            const payload = JSON.parse(stored);
            // 检查是否过期
            if (Date.now() - payload.timestamp > this.TASK_EXPIRY) {
                console.log("[MailService] Task expired, clearing...");
                this.clearTask();
                return null;
            }
            return payload;
        }
        catch (error) {
            console.error("[MailService] Error parsing task payload:", error);
            return null;
        }
    }
    /**
     * 开始监听任务（Outlook 端调用）
     */
    static startListening(callback) {
        this.taskListeners.push(callback);
        if (this.pollingTimer === null) {
            this.startPolling();
        }
    }
    /**
     * 停止监听
     */
    static stopListening(callback) {
        if (callback) {
            const index = this.taskListeners.indexOf(callback);
            if (index > -1) {
                this.taskListeners.splice(index, 1);
            }
        }
        else {
            this.taskListeners = [];
        }
        if (this.taskListeners.length === 0) {
            this.stopPolling();
        }
    }
    /**
     * 监听任务状态变化（HHA 端调用）
     */
    static onStatusChange(callback) {
        this.statusListeners.push(callback);
        if (this.pollingTimer === null) {
            this.startPolling();
        }
    }
    /**
     * 停止监听状态变化
     */
    static offStatusChange(callback) {
        if (callback) {
            const index = this.statusListeners.indexOf(callback);
            if (index > -1) {
                this.statusListeners.splice(index, 1);
            }
        }
        else {
            this.statusListeners = [];
        }
    }
    /**
     * 开始轮询
     */
    static startPolling() {
        if (this.pollingTimer !== null)
            return;
        console.log("[MailService] Starting polling...");
        this.pollingTimer = window.setInterval(() => {
            const payload = this.getTaskPayload();
            if (payload) {
                // 通知状态监听器
                this.statusListeners.forEach((cb) => {
                    try {
                        cb(payload);
                    }
                    catch (e) {
                        console.error("[MailService] Status callback error:", e);
                    }
                });
                // 检查是否有待处理的任务（Outlook 端）
                if (payload.status === "PENDING" &&
                    payload.id !== this.lastProcessedTaskId) {
                    this.lastProcessedTaskId = payload.id;
                    // 标记为处理中
                    this.updateTaskStatus(payload.id, "PROCESSING");
                    // 通知任务监听器
                    this.taskListeners.forEach((cb) => {
                        try {
                            cb(payload.data, payload.id);
                        }
                        catch (e) {
                            console.error("[MailService] Task callback error:", e);
                        }
                    });
                }
            }
        }, this.POLL_INTERVAL);
    }
    /**
     * 停止轮询
     */
    static stopPolling() {
        if (this.pollingTimer !== null) {
            window.clearInterval(this.pollingTimer);
            this.pollingTimer = null;
            console.log("[MailService] Polling stopped");
        }
    }
    /**
     * 更新任务状态
     */
    static updateTaskStatus(taskId, status, error) {
        const payload = this.getTaskPayload();
        if (payload && payload.id === taskId) {
            payload.status = status;
            if (error)
                payload.error = error;
            payload.timestamp = Date.now();
            GM_setValue(this.TASK_KEY, JSON.stringify(payload));
            console.log("[MailService] Updated task status:", taskId, status);
        }
    }
    /**
     * 报告任务完成（Outlook 端调用）
     */
    static reportComplete(taskId) {
        this.updateTaskStatus(taskId, "COMPLETED");
        console.log("[MailService] Task completed:", taskId);
    }
    /**
     * 报告任务失败（Outlook 端调用）
     */
    static reportFailed(taskId, error) {
        this.updateTaskStatus(taskId, "FAILED", error);
        console.log("[MailService] Task failed:", taskId, error);
    }
    /**
     * 清除任务
     */
    static clearTask() {
        GM_setValue(this.TASK_KEY, "");
    }
    /**
     * 检查是否在 Outlook 页面
     */
    static isOutlookPage() {
        return window.location.hostname === "outlook.office.com";
    }
    /**
     * 检查是否在 HHA 页面
     */
    static isHHAPage() {
        return window.location.hostname.includes("hhaexchange.com");
    }
    /**
     * 清理资源
     */
    static cleanup() {
        this.stopPolling();
        this.taskListeners = [];
        this.statusListeners = [];
    }
}
MailService.TASK_KEY = "hha_mail_service_bus";
MailService.POLL_INTERVAL = 1000; // 1秒轮询
MailService.TASK_EXPIRY = 5 * 60 * 1000; // 5分钟过期
MailService.tabId = "";
MailService.pollingTimer = null;
MailService.taskListeners = [];
MailService.statusListeners = [];
MailService.lastProcessedTaskId = "";

;// ./src/js/services/BuiltinTemplates.ts
/**
 * BuiltinTemplates - 内置邮件模板
 * Epic 12, Story 9: 预设常用模板
 *
 * 注意：内置模板需要根据实际业务需求单独实现
 * 目前暂时清空，后续再添加
 */
/**
 * 内置模板列表
 * TODO: 根据实际业务需求添加内置模板
 */
const BUILTIN_TEMPLATES = [];
/**
 * 获取所有内置模板
 */
function getBuiltinTemplates() {
    return BUILTIN_TEMPLATES;
}
/**
 * 根据页面类型获取内置模板
 */
function getBuiltinTemplatesByType(pageType) {
    return BUILTIN_TEMPLATES.filter((t) => t.targetPageType === pageType || t.targetPageType === "ANY");
}
/**
 * 检查是否为内置模板
 */
function isBuiltinTemplate(templateId) {
    return templateId.startsWith("builtin_");
}

;// ./src/js/services/CSPBypassInjector.ts
/**
 * CSPBypassInjector - CSP 绕过注入器
 * Epic 12, Story 11: CSP 合规的 Outlook 集成重构
 *
 * 职责：
 * - 使用 GM.addElement 将 JavaScript 注入到页面主世界
 * - 绕过 Outlook 的 script-src CSP 限制
 * - 提供样式注入功能
 *
 * 原理：
 * - Tampermonkey 作为浏览器扩展拥有特权上下文
 * - 通过 GM.addElement 发起的 DOM 注入被浏览器视为"扩展操作"
 * - 豁免于页面的 CSP 检查（CSP Level 3 规范推荐行为）
 *
 * @see https://www.tampermonkey.net/documentation.php#api:GM.addElement
 */
/**
 * CSPBypassInjector 类
 * 封装 Tampermonkey 的 GM.addElement API 用于 CSP 绕过
 */
class CSPBypassInjector {
    /**
     * 检查 GM.addElement API 是否可用
     * @returns true 如果 API 可用
     */
    static isAvailable() {
        return typeof GM !== "undefined" && typeof GM.addElement === "function";
    }
    /**
     * 注入 Payload 脚本到页面主世界
     * 使用 GM.addElement 绕过 CSP 的 script-src 限制
     *
     * @param payload - 要注入的 JavaScript 代码字符串
     * @param id - 可选的脚本标识符，用于防止重复注入
     * @returns Promise<void> - 注入完成后 resolve
     * @throws Error - 如果 GM.addElement 不可用
     */
    static injectPayloadScript(payload, id) {
        return new Promise((resolve, reject) => {
            try {
                // 检查是否已注入过（防止重复注入）
                if (id && this.injectedScripts.has(id)) {
                    console.log(`[CSPBypassInjector] Script "${id}" already injected, skipping`);
                    resolve();
                    return;
                }
                // 检查 GM.addElement API 是否可用
                if (!this.isAvailable()) {
                    throw new Error("GM.addElement not available. Please upgrade Tampermonkey to version 4.10 or later.");
                }
                // 使用特权 API 注入脚本
                // GM.addElement 创建的元素被视为扩展注入，绕过页面 CSP
                GM.addElement(document.body, "script", {
                    textContent: payload,
                    type: "text/javascript",
                });
                // 记录已注入的脚本
                if (id) {
                    this.injectedScripts.add(id);
                }
                console.log(`[CSPBypassInjector] Script${id ? ` "${id}"` : ""} injected successfully`);
                resolve();
            }
            catch (error) {
                console.error("[CSPBypassInjector] Injection failed:", error);
                reject(error);
            }
        });
    }
    /**
     * 注入样式到页面
     * 使用 GM.addElement 绕过 CSP 的 style-src 限制
     *
     * @param css - CSS 样式字符串
     * @param id - 可选的样式标识符，用于防止重复注入
     */
    static injectStyle(css, id) {
        try {
            // 检查是否已注入过
            if (id && this.injectedScripts.has(`style_${id}`)) {
                console.log(`[CSPBypassInjector] Style "${id}" already injected, skipping`);
                return;
            }
            if (!this.isAvailable()) {
                // 回退到 GM_addStyle（如果可用）
                if (typeof GM_addStyle === "function") {
                    GM_addStyle(css);
                    console.log(`[CSPBypassInjector] Style${id ? ` "${id}"` : ""} injected via GM_addStyle fallback`);
                    return;
                }
                console.warn("[CSPBypassInjector] GM.addElement not available for style injection");
                return;
            }
            // 使用 GM.addElement 注入样式
            GM.addElement(document.head, "style", {
                textContent: css,
            });
            // 记录已注入的样式
            if (id) {
                this.injectedScripts.add(`style_${id}`);
            }
            console.log(`[CSPBypassInjector] Style${id ? ` "${id}"` : ""} injected successfully`);
        }
        catch (error) {
            console.error("[CSPBypassInjector] Style injection failed:", error);
        }
    }
    /**
     * 检查脚本是否已注入
     * @param id - 脚本标识符
     * @returns true 如果已注入
     */
    static isInjected(id) {
        return this.injectedScripts.has(id);
    }
    /**
     * 清除注入记录（用于测试或重新注入）
     */
    static clearInjectionRecord() {
        this.injectedScripts.clear();
        console.log("[CSPBypassInjector] Injection records cleared");
    }
}
CSPBypassInjector.injectedScripts = new Set();

;// ./src/js/services/TinyMCEBundler.ts
/**
 * TinyMCE Bundler Service
 *
 * Manually loads TinyMCE components using GM.xmlHttpRequest to bypass CSP restrictions.
 * Uses CSPBypassInjector for proper script/style injection.
 */

const TINYMCE_BASE_URL = "https://unpkg.com/tinymce@6/";
// JS components to bundle (simplified list for basic functionality)
const TINYMCE_JS_COMPONENTS = [
    "tinymce.min.js",
    "models/dom/model.min.js",
    "themes/silver/theme.min.js",
    "icons/default/icons.min.js",
    "plugins/lists/plugin.min.js",
    "plugins/link/plugin.min.js",
];
// CSS components
const TINYMCE_CSS_COMPONENTS = {
    ui: "skins/ui/oxide/skin.min.css",
    content: "skins/content/default/content.min.css",
};
// Cached CSS content
let tinyMceCss = null;
let isLoaded = false;
let loadingPromise = null;
/**
 * Fetch a single asset using GM.xmlHttpRequest
 */
function fetchAsset(url) {
    return new Promise((resolve, reject) => {
        // Use the GM object's xmlHttpRequest method
        if (typeof GM !== "undefined" && GM.xmlHttpRequest) {
            GM.xmlHttpRequest({
                method: "GET",
                url: url,
                onload: (response) => {
                    if (response.status >= 200 && response.status < 300) {
                        resolve(response.responseText);
                    }
                    else {
                        reject(new Error(`Failed to load: ${url}. Status: ${response.status}`));
                    }
                },
                onerror: (error) => {
                    reject(new Error(`Failed to load: ${url}. Error: ${error}`));
                },
            });
        }
        else {
            // Fallback to fetch (may fail due to CSP)
            fetch(url)
                .then((response) => {
                if (response.ok) {
                    return response.text();
                }
                throw new Error(`Failed to load: ${url}`);
            })
                .then(resolve)
                .catch(reject);
        }
    });
}
/**
 * Load and inject the TinyMCE JS bundle
 */
async function loadAndInjectJsBundle() {
    console.log("[TinyMCEBundler] Loading TinyMCE JS components...");
    try {
        const promises = TINYMCE_JS_COMPONENTS.map((c) => fetchAsset(TINYMCE_BASE_URL + c));
        const contents = await Promise.all(promises);
        const bundle = contents.join("\n\n// --- Bundled ---\n\n");
        // Use CSPBypassInjector for proper CSP bypass via GM.addElement
        if (CSPBypassInjector.isAvailable()) {
            await CSPBypassInjector.injectPayloadScript(bundle, "tinymce-bundle");
            console.log("[TinyMCEBundler] TinyMCE JS bundle injected via CSPBypassInjector!");
        }
        else {
            // Fallback to direct injection (may be blocked by CSP)
            console.warn("[TinyMCEBundler] CSPBypassInjector not available, using fallback");
            const scriptEl = document.createElement("script");
            scriptEl.type = "text/javascript";
            scriptEl.textContent = bundle;
            document.head.appendChild(scriptEl);
            console.log("[TinyMCEBundler] TinyMCE JS bundle injected via fallback!");
        }
    }
    catch (error) {
        console.error("[TinyMCEBundler] Failed to build TinyMCE JS bundle:", error);
        throw error;
    }
}
/**
 * Wait for window.tinymce to become available after script injection
 * Note: We use unsafeWindow because TinyMCE is injected into the page's window context,
 * not the userscript's sandboxed window
 */
function waitForTinyMCE(timeout = 30000) {
    // Get reference to page's window object (unsafeWindow in Tampermonkey, or regular window)
    const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        let checkCount = 0;
        const check = () => {
            checkCount++;
            if (typeof pageWindow.tinymce !== "undefined") {
                console.log(`[TinyMCEBundler] TinyMCE detected after ${checkCount} checks (${Date.now() - startTime}ms)`);
                resolve();
                return;
            }
            if (Date.now() - startTime > timeout) {
                console.error(`[TinyMCEBundler] Timeout after ${checkCount} checks (${timeout}ms)`);
                reject(new Error("Timeout waiting for TinyMCE to be available"));
                return;
            }
            setTimeout(check, 100);
        };
        check();
    });
}
/**
 * Load the TinyMCE CSS components
 */
async function loadCssBundle() {
    console.log("[TinyMCEBundler] Loading TinyMCE CSS...");
    try {
        const uiCssPromise = fetchAsset(TINYMCE_BASE_URL + TINYMCE_CSS_COMPONENTS.ui);
        const contentCssPromise = fetchAsset(TINYMCE_BASE_URL + TINYMCE_CSS_COMPONENTS.content);
        const [ui, content] = await Promise.all([uiCssPromise, contentCssPromise]);
        console.log("[TinyMCEBundler] TinyMCE CSS loaded successfully!");
        return { ui, content };
    }
    catch (error) {
        console.error("[TinyMCEBundler] Failed to load TinyMCE CSS:", error);
        throw error;
    }
}
/**
 * TinyMCE Bundler - provides methods to load and initialize TinyMCE
 */
const TinyMCEBundler = {
    /**
     * Check if TinyMCE is loaded
     */
    isLoaded() {
        // Use unsafeWindow since TinyMCE is injected into the page's window context
        const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        return isLoaded && typeof pageWindow.tinymce !== "undefined";
    },
    /**
     * Get the cached CSS content
     */
    getCss() {
        return tinyMceCss;
    },
    /**
     * Load TinyMCE (call this once at app startup or when first needed)
     */
    async load() {
        if (isLoaded) {
            return;
        }
        if (loadingPromise) {
            return loadingPromise;
        }
        loadingPromise = (async () => {
            try {
                const jsPromise = loadAndInjectJsBundle();
                const cssPromise = loadCssBundle();
                const [_, css] = await Promise.all([jsPromise, cssPromise]);
                tinyMceCss = css;
                // Inject UI CSS globally using CSPBypassInjector
                if (CSPBypassInjector.isAvailable()) {
                    CSPBypassInjector.injectStyle(tinyMceCss.ui, "tinymce-ui-css");
                }
                else if (typeof GM_addStyle !== "undefined") {
                    GM_addStyle(tinyMceCss.ui);
                }
                else {
                    const styleEl = document.createElement("style");
                    styleEl.textContent = tinyMceCss.ui;
                    document.head.appendChild(styleEl);
                }
                isLoaded = true;
                console.log("[TinyMCEBundler] TinyMCE fully loaded!");
            }
            catch (error) {
                console.error("[TinyMCEBundler] Failed to load TinyMCE:", error);
                loadingPromise = null;
                throw error;
            }
        })();
        return loadingPromise;
    },
    /**
     * Initialize TinyMCE on a selector
     */
    async init(selector, options = {}) {
        // Start loading TinyMCE bundles (if not already)
        await this.load();
        // Wait for window.tinymce to be available (script execution may be slow)
        console.log("[TinyMCEBundler] Waiting for window.tinymce...");
        await waitForTinyMCE();
        console.log("[TinyMCEBundler] window.tinymce is available!");
        // Use unsafeWindow to access TinyMCE in page context
        const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        const tinymce = pageWindow.tinymce;
        return tinymce.init({
            selector,
            skin: false,
            content_css: false,
            content_style: tinyMceCss?.content || "",
            plugins: "lists link",
            toolbar: "undo redo | bold italic underline strikethrough | bullist numlist | link | removeformat",
            menubar: false,
            statusbar: false,
            branding: false,
            resize: false,
            height: 200,
            ...options,
        });
    },
    /**
     * Remove TinyMCE instance by selector
     */
    remove(selector) {
        const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        if (typeof pageWindow.tinymce !== "undefined") {
            const editor = pageWindow.tinymce.get(selector.replace("#", ""));
            if (editor) {
                editor.remove();
            }
        }
    },
    /**
     * Get content from TinyMCE editor
     */
    getContent(selector, format = "html") {
        const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        if (typeof pageWindow.tinymce !== "undefined") {
            const editor = pageWindow.tinymce.get(selector.replace("#", ""));
            if (editor) {
                return editor.getContent({ format });
            }
        }
        return "";
    },
};

;// ./src/js/tabs/MailBuilderTab.ts







/**
 * Mail Builder Tab
 * Epic 12: 智能邮件构筑助手
 *
 * 功能：
 * - 自动检测当前页面（病人 / 护理员）
 * - 从页面 DOM 提取关键信息
 * - 左侧展示提取的信息，支持一键复制
 * - 右侧管理邮件模板（内置 + 自定义）
 */
class MailBuilderTab extends BaseTab {
    constructor() {
        super(...arguments);
        this.id = "mail-builder";
        this.label = "邮件助手";
        this.icon = "📧";
        this.currentPageType = "UNKNOWN";
        this.profileData = null;
        this.pageChangeHandler = null;
        // Template state
        this.templates = [];
        this.activeTemplateTab = "custom";
        this.editingTemplate = null;
        this.isEditorOpen = false;
    }
    async init() {
        this.initialized = true;
        // Load templates
        this.templates = TemplateManager.getAll();
        // Create default templates if none exist
        if (this.templates.length === 0) {
            TemplateManager.createDefaultTemplates();
            this.templates = TemplateManager.getAll();
        }
        console.log("[MailBuilderTab] Initialized with", this.templates.length, "templates");
    }
    render(container) {
        this.container = container;
        container.classList.add("mail-builder-tab");
        // 每次渲染时重新加载模板（解决页面刷新后模板不显示的问题）
        this.templates = TemplateManager.getAll();
        // 检测当前页面类型
        this.currentPageType = ProfileDataExtractor.getCurrentPageType();
        this.profileData = ProfileDataExtractor.extract();
        // 渲染对应的 UI
        this.renderContent();
        // 监听页面变化
        this.pageChangeHandler = (pageType) => {
            if (pageType !== this.currentPageType) {
                this.currentPageType = pageType;
                this.profileData = ProfileDataExtractor.extract();
                this.renderContent();
            }
        };
        ProfileDataExtractor.onPageChange(this.pageChangeHandler);
    }
    /**
     * 根据页面类型渲染内容
     */
    renderContent() {
        if (!this.container)
            return;
        // 清空容器
        this.container.innerHTML = "";
        // 始终渲染主布局，根据页面类型决定是否显示左侧信息面板
        this.renderMainLayout();
    }
    /**
     * 渲染主布局
     * - 在个人信息页面：35% 左侧信息区 + 65% 右侧模板区
     * - 在其他页面：100% 模板区
     */
    renderMainLayout() {
        if (!this.container)
            return;
        const isProfilePage = ProfileDataExtractor.isProfilePage(this.currentPageType);
        const wrapper = document.createElement("div");
        wrapper.className = "mail-builder-wrapper";
        // Header
        const header = this.renderHeader();
        wrapper.appendChild(header);
        // 主内容区
        const mainContent = document.createElement("div");
        mainContent.className = isProfilePage
            ? "mail-builder-main"
            : "mail-builder-main full-width";
        // 仅在个人信息页面显示左侧信息面板
        if (isProfilePage) {
            const infoPanel = this.renderInfoPanel();
            mainContent.appendChild(infoPanel);
        }
        // 右侧模板面板（或全宽模板面板）
        const templatePanel = this.renderTemplatePanel();
        mainContent.appendChild(templatePanel);
        wrapper.appendChild(mainContent);
        this.container.appendChild(wrapper);
    }
    /**
     * 渲染 Header
     */
    renderHeader() {
        const header = document.createElement("div");
        header.className = "mail-builder-header";
        header.innerHTML = `
      <h3 class="mail-builder-title">📧 邮件助手</h3>
      <span class="mail-builder-page-tag">当前页面：${ProfileDataExtractor.getPageDisplayName(this.currentPageType)}</span>
    `;
        return header;
    }
    /**
     * 渲染左侧信息面板
     */
    renderInfoPanel() {
        const panel = document.createElement("div");
        panel.className = "mail-builder-info-panel";
        if (!this.profileData) {
            panel.innerHTML = `
        <div class="mail-builder-no-data">
          <span>⚠️ 无法提取页面数据</span>
        </div>
      `;
            return panel;
        }
        // 构建信息字段列表
        const fields = this.buildFieldsList();
        panel.innerHTML = `
      <div class="mail-builder-info-list">
        ${fields
            .map((field) => `
          <div class="mail-builder-info-item">
            <span class="info-label">${field.label}:</span>
            <span class="info-value" title="${field.value}">${this.truncateText(field.value, 20)}</span>
            <button class="info-copy-btn" data-value="${this.escapeHtml(field.value)}" title="复制">📋</button>
          </div>
        `)
            .join("")}
      </div>
      <div class="mail-builder-quick-copy">
        <button class="quick-copy-btn" id="copy-name-id">📋 复制 名字+ID</button>
      </div>
    `;
        // 添加事件监听
        this.setupCopyHandlers(panel);
        return panel;
    }
    /**
     * 构建字段列表
     */
    buildFieldsList() {
        if (!this.profileData)
            return [];
        const fields = [
            { label: "名字", value: this.profileData.name },
            { label: "ID", value: this.profileData.id },
        ];
        if (this.profileData.dob) {
            fields.push({ label: "生日", value: this.profileData.dob });
        }
        if (this.profileData.phone) {
            fields.push({ label: "电话", value: this.profileData.phone });
        }
        if (this.profileData.address) {
            fields.push({ label: "地址", value: this.profileData.address });
        }
        if (this.profileData.insurance) {
            fields.push({ label: "保险", value: this.profileData.insurance });
        }
        return fields;
    }
    /**
     * 渲染右侧模板面板
     */
    renderTemplatePanel() {
        const panel = document.createElement("div");
        panel.className = "mail-builder-template-panel";
        panel.id = "mail-builder-template-panel";
        // 模板 Tabs
        const tabs = document.createElement("div");
        tabs.className = "mail-builder-template-tabs";
        tabs.innerHTML = `
            <button class="template-tab-btn ${this.activeTemplateTab === "builtin" ? "active" : ""}" data-tab="builtin">内置模板</button>
            <button class="template-tab-btn ${this.activeTemplateTab === "custom" ? "active" : ""}" data-tab="custom">自定义模板</button>
        `;
        panel.appendChild(tabs);
        // 模板内容区 - 始终显示模板列表
        const content = document.createElement("div");
        content.className = "mail-builder-template-content";
        content.id = "template-content-area";
        content.appendChild(this.renderTemplateList());
        panel.appendChild(content);
        // 底部操作按钮
        const actions = document.createElement("div");
        actions.className = "mail-builder-template-actions";
        actions.innerHTML = `
            <button class="template-action-btn" id="add-template-btn">+ 添加模板</button>
            <button class="template-action-btn" id="export-btn">⬇ 导出</button>
            <button class="template-action-btn" id="import-btn">⬆ 导入</button>
            <input type="file" id="import-file-input" accept=".json" style="display: none;">
        `;
        panel.appendChild(actions);
        // 设置事件处理
        this.setupTemplatePanelHandlers(panel);
        return panel;
    }
    /**
     * 渲染模板列表
     */
    renderTemplateList() {
        const list = document.createElement("div");
        list.className = "template-list";
        // 根据当前 tab 筛选模板
        const filteredTemplates = this.activeTemplateTab === "builtin"
            ? getBuiltinTemplates()
            : this.templates;
        if (filteredTemplates.length === 0) {
            list.innerHTML = `
                <div class="template-empty">
                    <div class="template-empty-icon">📝</div>
                    <p>暂无自定义模板</p>
                    <p class="template-hint">点击下方 "+ 添加模板" 创建您的第一个模板</p>
                </div>
            `;
        }
        else {
            filteredTemplates.forEach((template) => {
                const card = this.renderTemplateCard(template);
                list.appendChild(card);
            });
        }
        return list;
    }
    /**
     * 渲染单个模板卡片
     */
    renderTemplateCard(template) {
        const card = document.createElement("div");
        card.className = "template-card";
        card.dataset.templateId = template.id;
        const isBuiltin = isBuiltinTemplate(template.id);
        const targetLabel = template.targetPageType === "PATIENT"
            ? "病人"
            : template.targetPageType === "CAREGIVER"
                ? "护理员"
                : "通用";
        // 内置模板不显示编辑/删除按钮
        const actionButtons = isBuiltin
            ? `
                <button class="template-card-btn use-btn" data-id="${template.id}" title="复制到剪贴板">📋 复制</button>
                <button class="template-card-btn outlook-btn" data-id="${template.id}" title="发送到 Outlook">📧 Outlook</button>
            `
            : `
                <button class="template-card-btn use-btn" data-id="${template.id}" title="复制到剪贴板">📋 复制</button>
                <button class="template-card-btn outlook-btn" data-id="${template.id}" title="发送到 Outlook">📧 Outlook</button>
                <button class="template-card-btn edit-btn" data-id="${template.id}" title="编辑">✏️</button>
                <button class="template-card-btn delete-btn" data-id="${template.id}" title="删除">🗑️</button>
            `;
        card.innerHTML = `
            <div class="template-card-header">
                <span class="template-name">${this.escapeHtml(template.name)}</span>
                <div class="template-badges">
                    ${isBuiltin
            ? '<span class="template-builtin-badge">内置</span>'
            : ""}
                    <span class="template-target-badge">${targetLabel}</span>
                </div>
            </div>
            <div class="template-card-preview">
                <span class="template-subject">📧 ${this.escapeHtml(this.truncateText(template.subject, 40))}</span>
            </div>
            <div class="template-card-actions">
                ${actionButtons}
            </div>
        `;
        return card;
    }
    /**
     * 渲染模板编辑器
     */
    renderTemplateEditor() {
        const editor = document.createElement("div");
        editor.className = "template-editor";
        const template = this.editingTemplate;
        const isNew = !template?.id;
        editor.innerHTML = `
            <div class="editor-header">
                <h4>${isNew ? "新建模板" : "编辑模板"}</h4>
            </div>
            <div class="editor-form">
                <div class="form-group">
                    <label>模板名称 *</label>
                    <input type="text" id="tpl-name" value="${this.escapeHtml(template?.name || "")}" placeholder="例：护理员请假通知">
                </div>
                <div class="form-group">
                    <label>适用页面</label>
                    <select id="tpl-target">
                        <option value="ANY" ${template?.targetPageType === "ANY" ? "selected" : ""}>通用</option>
                        <option value="PATIENT" ${template?.targetPageType === "PATIENT"
            ? "selected"
            : ""}>病人页面</option>
                        <option value="CAREGIVER" ${template?.targetPageType === "CAREGIVER"
            ? "selected"
            : ""}>护理员页面</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>收件人 (To)</label>
                    <input type="text" id="tpl-to" value="${this.escapeHtml(template?.to || "")}" placeholder="email@example.com">
                </div>
                <div class="form-group">
                    <label>抄送 (CC)</label>
                    <input type="text" id="tpl-cc" value="${this.escapeHtml(template?.cc || "")}" placeholder="可选">
                </div>
                <div class="form-group">
                    <label>主题 *</label>
                    <input type="text" id="tpl-subject" value="${this.escapeHtml(template?.subject || "")}" placeholder="使用 {{变量名}} 插入动态内容">
                </div>
                <div class="form-group">
                    <label>正文 *</label>
                    <textarea id="tpl-body" rows="6" placeholder="使用 {{变量名}} 插入动态内容">${this.escapeHtml(template?.body || "")}</textarea>
                </div>
            </div>
            <div class="editor-actions">
                <button class="editor-btn cancel-btn" id="editor-cancel">取消</button>
                <button class="editor-btn save-btn" id="editor-save">保存</button>
            </div>
        `;
        return editor;
    }
    /**
     * 设置模板面板事件处理
     */
    setupTemplatePanelHandlers(panel) {
        // Tab 切换
        panel.querySelectorAll(".template-tab-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget;
                const tab = target.dataset.tab;
                if (tab !== this.activeTemplateTab) {
                    this.activeTemplateTab = tab;
                    this.refreshTemplatePanel();
                }
            });
        });
        // 添加模板按钮
        const addBtn = panel.querySelector("#add-template-btn");
        addBtn?.addEventListener("click", () => {
            this.openEditor(null);
        });
        // 导出按钮
        const exportBtn = panel.querySelector("#export-btn");
        exportBtn?.addEventListener("click", () => {
            TemplateManager.exportToFile();
            this.showToast("✅ 模板已导出");
        });
        // 导入按钮
        const importBtn = panel.querySelector("#import-btn");
        const importInput = panel.querySelector("#import-file-input");
        importBtn?.addEventListener("click", () => {
            importInput?.click();
        });
        importInput?.addEventListener("change", async (e) => {
            const file = e.target.files?.[0];
            if (file) {
                try {
                    const count = await TemplateManager.importFromFile(file);
                    this.templates = TemplateManager.getAll();
                    this.refreshTemplatePanel();
                    this.showToast(`✅ 导入了 ${count} 个模板`);
                }
                catch (error) {
                    this.showToast(`❌ ${error.message}`);
                }
                importInput.value = "";
            }
        });
        // 模板卡片操作按钮
        panel.querySelectorAll(".use-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                if (id)
                    this.useTemplate(id);
            });
        });
        panel.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                if (id) {
                    // 每次编辑时从存储重新加载模板，避免使用过期的缓存数据
                    this.templates = TemplateManager.getAll();
                    const template = this.templates.find((t) => t.id === id);
                    if (template)
                        this.openEditor(template);
                }
            });
        });
        panel.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                if (id)
                    this.deleteTemplate(id);
            });
        });
        // Outlook 按钮
        panel.querySelectorAll(".outlook-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                if (id)
                    this.sendToOutlook(id);
            });
        });
        // 编辑器按钮
        const cancelBtn = panel.querySelector("#editor-cancel");
        cancelBtn?.addEventListener("click", () => {
            this.closeEditor();
        });
        const saveBtn = panel.querySelector("#editor-save");
        saveBtn?.addEventListener("click", () => {
            this.saveTemplate();
        });
    }
    /**
     * 打开模板编辑器 (模态框)
     */
    openEditor(template) {
        this.editingTemplate = template
            ? { ...template }
            : {
                id: "",
                name: "",
                targetPageType: "ANY",
                to: "",
                cc: "",
                subject: "",
                body: "",
                variables: [],
                createdAt: 0,
                updatedAt: 0,
            };
        this.isEditorOpen = true;
        this.showEditorModal();
    }
    /**
     * 显示编辑器模态框
     */
    showEditorModal() {
        const template = this.editingTemplate;
        const isNew = !template?.id;
        // 创建模态框覆盖层
        const overlay = document.createElement("div");
        overlay.className = "template-modal-overlay";
        overlay.id = "template-modal-overlay";
        // 构建数据字段 HTML
        const dataFieldsHtml = this.buildDataFieldsHtml(template?.variables || []);
        overlay.innerHTML = `
            <div class="template-modal">
                <div class="template-modal-header">
                    <h3 class="template-modal-title">${isNew ? "新建模板" : "编辑模板"}</h3>
                    <button class="template-modal-close" id="modal-close-btn">&times;</button>
                </div>
                <div class="template-modal-body">
                    <div class="template-form-group">
                        <label class="template-form-label">模板名称 *</label>
                        <input type="text" class="template-form-input" id="modal-tpl-name" 
                            value="${this.escapeHtml(template?.name || "")}" 
                            placeholder="例：护理员请假通知">
                    </div>
                    <div class="template-form-group">
                        <label class="template-form-label">收件人 (To)</label>
                        <input type="text" class="template-form-input" id="modal-tpl-to" 
                            value="${this.escapeHtml(template?.to || "")}" 
                            placeholder="email@example.com">
                    </div>
                    <div class="template-form-group">
                        <label class="template-form-label">抄送 (CC)</label>
                        <input type="text" class="template-form-input" id="modal-tpl-cc" 
                            value="${this.escapeHtml(template?.cc || "")}" 
                            placeholder="可选，多个邮箱用逗号分隔">
                    </div>
                    <div class="template-form-row">
                        <div class="template-form-group">
                            <label class="template-form-label">主题 *</label>
                            <input type="text" class="template-form-input" id="modal-tpl-subject" 
                                value="${this.escapeHtml(template?.subject || "")}" 
                                placeholder="使用 {{变量名}} 插入动态内容">
                        </div>
                        <div class="template-form-group" style="flex: 0 0 140px;">
                            <label class="template-form-label">适用页面</label>
                            <select class="template-form-select" id="modal-tpl-target">
                                <option value="ANY" ${template?.targetPageType === "ANY"
            ? "selected"
            : ""}>通用</option>
                                <option value="PATIENT" ${template?.targetPageType === "PATIENT"
            ? "selected"
            : ""}>病人页面</option>
                                <option value="CAREGIVER" ${template?.targetPageType === "CAREGIVER"
            ? "selected"
            : ""}>护理员页面</option>
                            </select>
                        </div>
                    </div>
                    <div class="template-form-group">
                        <label class="template-form-label">正文 (富文本编辑器) *</label>
                        <div class="template-placeholder-hint" style="font-size: 12px; color: #666; margin-bottom: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
                            <strong>💡 可用占位符:</strong> 
                            <span style="font-family: monospace; color: #0066cc;">{{aide_name}}</span>, 
                            <span style="font-family: monospace; color: #0066cc;">{{aide_id}}</span>, 
                            <span style="font-family: monospace; color: #0066cc;">{{patient_name}}</span>, 
                            <span style="font-family: monospace; color: #0066cc;">{{patient_id}}</span>
                            <br><small style="color: #999;">在下方"数据字段"区域可以添加自定义占位符</small>
                        </div>
                        <div class="template-body-editor">
                            <textarea id="modal-tpl-body">${this.escapeHtml(template?.body || "")}</textarea>
                        </div>
                    </div>
                    
                    <!-- 数据字段部分 -->
                    <div class="template-variables-section">
                        <div class="template-variables-header">
                            <h5>数据字段</h5>
                            <button type="button" class="template-add-var-btn" id="add-var-btn">+ 添加字段</button>
                        </div>
                        <table class="template-variables-table">
                            <thead>
                                <tr>
                                    <th style="width: 15%;">占位符</th>
                                    <th style="width: 35%;">CSS选择器</th>
                                    <th style="width: 15%;">处理类型</th>
                                    <th style="width: 25%;">规则/表达式</th>
                                    <th style="width: 10%;">操作</th>
                                </tr>
                            </thead>
                            <tbody id="var-fields-body">
                                ${dataFieldsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="template-modal-footer">
                    <button class="template-modal-btn btn-cancel" id="modal-cancel-btn">取消</button>
                    <button class="template-modal-btn btn-save" id="modal-save-btn">保存模板</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        // 禁用 body 滚动
        document.body.style.overflow = "hidden";
        // 设置事件处理
        this.setupModalHandlers(overlay);
        // 初始化 TinyMCE
        this.initTinyMCE();
    }
    /**
     * 构建数据字段 HTML
     */
    buildDataFieldsHtml(variables) {
        if (!variables || variables.length === 0) {
            return "";
        }
        return variables
            .map((v, idx) => `
            <tr data-var-idx="${idx}">
                <td><input type="text" class="var-key" value="${this.escapeHtml(v.key || "")}" placeholder="e.g. {{name}}"></td>
                <td><input type="text" class="var-selector" value="${this.escapeHtml(v.selector || "")}" placeholder="e.g. #elementId"></td>
                <td><input type="text" class="var-process-type" value="${this.escapeHtml(v.process_type || "")}" placeholder="e.g. regex"></td>
                <td><input type="text" class="var-process-rule" value="${this.escapeHtml(v.process_rule || "")}" placeholder="e.g. \\d+"></td>
                <td style="text-align: center;"><button type="button" class="var-delete-btn" data-idx="${idx}">✕</button></td>
            </tr>
        `)
            .join("");
    }
    /**
     * 添加新的数据字段行
     */
    addVariableRow() {
        const tbody = document.getElementById("var-fields-body");
        if (!tbody)
            return;
        const idx = tbody.querySelectorAll("tr").length;
        const row = document.createElement("tr");
        row.dataset.varIdx = String(idx);
        row.innerHTML = `
            <td><input type="text" class="var-key" value="" placeholder="e.g. {{name}}"></td>
            <td><input type="text" class="var-selector" value="" placeholder="e.g. #elementId"></td>
            <td><input type="text" class="var-process-type" value="" placeholder="e.g. regex"></td>
            <td><input type="text" class="var-process-rule" value="" placeholder="e.g. \\d+"></td>
            <td style="text-align: center;"><button type="button" class="var-delete-btn" data-idx="${idx}">✕</button></td>
        `;
        tbody.appendChild(row);
        // 绑定删除按钮
        row.querySelector(".var-delete-btn")?.addEventListener("click", () => {
            row.remove();
        });
    }
    /**
     * 收集数据字段
     */
    collectVariables() {
        const rows = document.querySelectorAll("#var-fields-body tr");
        const variables = [];
        rows.forEach((row) => {
            const key = row.querySelector(".var-key")?.value.trim();
            const selector = row.querySelector(".var-selector")?.value.trim();
            const process_type = row.querySelector(".var-process-type")?.value.trim();
            const process_rule = row.querySelector(".var-process-rule")?.value.trim();
            if (key && selector) {
                variables.push({ key, selector, process_type, process_rule });
            }
        });
        return variables;
    }
    /**
     * 初始化 TinyMCE 编辑器
     */
    async initTinyMCE() {
        try {
            // 先清理任何现有的 TinyMCE 实例（防止重复初始化导致的问题）
            this.cleanupTinyMCE();
            // 使用 TinyMCEBundler 加载并初始化 TinyMCE
            await TinyMCEBundler.init("#modal-tpl-body", {
                height: 350,
            });
            console.log("[MailBuilderTab] TinyMCE initialized successfully");
        }
        catch (error) {
            console.warn("[MailBuilderTab] TinyMCE failed to load, using textarea fallback", error);
        }
    }
    /**
     * 清理 TinyMCE 实例
     */
    cleanupTinyMCE() {
        try {
            // TinyMCE 在 unsafeWindow（页面主世界）中，不是在 window 中
            const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
            if (typeof pageWindow.tinymce !== "undefined") {
                const editor = pageWindow.tinymce.get("modal-tpl-body");
                if (editor) {
                    editor.remove();
                    console.log("[MailBuilderTab] Cleaned up existing TinyMCE instance");
                }
            }
        }
        catch (e) {
            console.warn("[MailBuilderTab] Failed to cleanup TinyMCE:", e);
        }
    }
    /**
     * 设置模态框事件处理
     */
    setupModalHandlers(overlay) {
        // 关闭按钮
        const closeBtn = overlay.querySelector("#modal-close-btn");
        closeBtn?.addEventListener("click", () => this.closeEditor());
        // 取消按钮
        const cancelBtn = overlay.querySelector("#modal-cancel-btn");
        cancelBtn?.addEventListener("click", () => this.closeEditor());
        // 保存按钮
        const saveBtn = overlay.querySelector("#modal-save-btn");
        saveBtn?.addEventListener("click", () => this.saveTemplate());
        // 添加字段按钮
        const addVarBtn = overlay.querySelector("#add-var-btn");
        addVarBtn?.addEventListener("click", () => this.addVariableRow());
        // 删除字段按钮（已有行）
        overlay.querySelectorAll(".var-delete-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.target.closest("tr")?.remove();
            });
        });
        // 点击遮罩关闭
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                this.closeEditor();
            }
        });
        // ESC 键关闭
        const escHandler = (e) => {
            if (e.key === "Escape") {
                this.closeEditor();
                document.removeEventListener("keydown", escHandler);
            }
        };
        document.addEventListener("keydown", escHandler);
    }
    /**
     * 关闭编辑器
     */
    closeEditor() {
        // 销毁 TinyMCE 实例（使用 unsafeWindow 因为 TinyMCE 在页面主世界）
        this.cleanupTinyMCE();
        // 移除模态框
        const overlay = document.querySelector("#template-modal-overlay");
        if (overlay) {
            overlay.remove();
        }
        // 恢复 body 滚动
        document.body.style.overflow = "";
        this.editingTemplate = null;
        this.isEditorOpen = false;
    }
    /**
     * 保存模板
     */
    saveTemplate() {
        const nameInput = document.querySelector("#modal-tpl-name");
        const targetSelect = document.querySelector("#modal-tpl-target");
        const toInput = document.querySelector("#modal-tpl-to");
        const ccInput = document.querySelector("#modal-tpl-cc");
        const subjectInput = document.querySelector("#modal-tpl-subject");
        // 获取 TinyMCE 内容，如果 TinyMCE 不存在则使用 textarea
        // TinyMCE 在 unsafeWindow（页面主世界）中
        let body = "";
        const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        if (typeof pageWindow.tinymce !== "undefined") {
            const editor = pageWindow.tinymce.get("modal-tpl-body");
            if (editor) {
                body = editor.getContent({ format: "html" }); // 获取 HTML 格式
            }
        }
        if (!body) {
            const bodyInput = document.querySelector("#modal-tpl-body");
            body = bodyInput?.value.trim() || "";
        }
        const name = nameInput?.value.trim();
        const subject = subjectInput?.value.trim();
        if (!name || !subject || !body) {
            this.showToast("❌ 请填写必填字段");
            return;
        }
        const templateData = {
            id: this.editingTemplate?.id || undefined,
            name,
            targetPageType: targetSelect?.value,
            to: toInput?.value.trim() || "",
            cc: ccInput?.value.trim() || "",
            subject,
            body,
            variables: this.collectVariables(),
        };
        TemplateManager.save(templateData);
        this.templates = TemplateManager.getAll();
        this.showToast("✅ 模板已保存");
        this.closeEditor();
        this.refreshTemplatePanel();
    }
    /**
     * 删除模板
     */
    deleteTemplate(templateId) {
        // 每次删除时从存储重新加载模板，避免使用过期的缓存数据
        this.templates = TemplateManager.getAll();
        const template = this.templates.find((t) => t.id === templateId);
        if (!template)
            return;
        if (confirm(`确定要删除模板 "${template.name}" 吗？`)) {
            TemplateManager.delete(templateId);
            this.templates = TemplateManager.getAll();
            this.refreshTemplatePanel();
            this.showToast("✅ 模板已删除");
        }
    }
    /**
     * 查找模板（包括内置和自定义）
     */
    findTemplateById(templateId) {
        // 每次查找时从存储重新加载模板，避免使用过期的缓存数据
        this.templates = TemplateManager.getAll();
        // 先在自定义模板中查找
        let template = this.templates.find((t) => t.id === templateId);
        if (!template) {
            // 再在内置模板中查找
            template = getBuiltinTemplates().find((t) => t.id === templateId);
        }
        return template;
    }
    /**
     * 使用模板
     */
    useTemplate(templateId) {
        const template = this.findTemplateById(templateId);
        if (!template)
            return;
        // 使用 TemplateEngine 进行变量替换
        const rendered = TemplateEngine.render(template, this.profileData);
        const content = `To: ${rendered.to}\nCC: ${rendered.cc}\nSubject: ${rendered.subject}\n\n${rendered.body}`;
        this.copyToClipboard(content);
        this.showToast("✅ 模板内容已复制（变量已替换）");
    }
    /**
     * 发送到 Outlook
     */
    sendToOutlook(templateId) {
        const template = this.findTemplateById(templateId);
        if (!template)
            return;
        // 使用 TemplateEngine 进行变量替换
        const rendered = TemplateEngine.render(template, this.profileData);
        // 通过 MailService 发送任务
        const taskId = MailService.sendMailTask({
            to: rendered.to,
            cc: rendered.cc,
            subject: rendered.subject,
            body: rendered.body,
        });
        this.showToast("📧 已发送到 Outlook，请切换到 Outlook 标签页");
        console.log("[MailBuilderTab] Sent mail task:", taskId);
        // 监听任务状态
        const statusHandler = (payload) => {
            if (payload.id === taskId) {
                if (payload.status === "COMPLETED") {
                    this.showToast("✅ Outlook 已准备好邮件");
                    MailService.offStatusChange(statusHandler);
                }
                else if (payload.status === "FAILED") {
                    this.showToast(`❌ Outlook 错误: ${payload.error}`);
                    MailService.offStatusChange(statusHandler);
                }
            }
        };
        MailService.onStatusChange(statusHandler);
    }
    /**
     * 刷新模板面板
     */
    refreshTemplatePanel() {
        const panel = document.querySelector("#mail-builder-template-panel");
        if (panel && panel.parentElement) {
            const newPanel = this.renderTemplatePanel();
            panel.parentElement.replaceChild(newPanel, panel);
        }
    }
    /**
     * 设置复制按钮事件处理
     */
    setupCopyHandlers(panel) {
        // 单字段复制按钮
        panel.querySelectorAll(".info-copy-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget;
                const value = target.dataset.value || "";
                this.copyToClipboard(value);
            });
        });
        // 快捷复制：名字+ID
        const copyNameIdBtn = panel.querySelector("#copy-name-id");
        copyNameIdBtn?.addEventListener("click", () => {
            if (this.profileData) {
                const text = `${this.profileData.name} ${this.profileData.id}`;
                this.copyToClipboard(text);
            }
        });
    }
    /**
     * 复制到剪贴板
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast("✅ 已复制");
        }
        catch (error) {
            console.error("[MailBuilderTab] Copy failed:", error);
            this.showToast("❌ 复制失败");
        }
    }
    /**
     * 显示 Toast 提示
     */
    showToast(message) {
        // 检查是否已有 toast
        let toast = document.querySelector(".mail-builder-toast");
        if (toast) {
            toast.remove();
        }
        toast = document.createElement("div");
        toast.className = "mail-builder-toast";
        toast.textContent = message;
        document.body.appendChild(toast);
        // 动画显示
        requestAnimationFrame(() => {
            toast.classList.add("show");
        });
        // 2秒后隐藏
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
    /**
     * 渲染未检测到 Profile 页面的提示
     */
    renderNoProfileDetected() {
        if (!this.container)
            return;
        const placeholder = this.createPlaceholder("📧", "未检测到个人信息页面", "");
        // 添加支持的页面列表
        const infoDiv = document.createElement("div");
        infoDiv.className = "mail-builder-no-page-info";
        infoDiv.innerHTML = `
      <p>邮件助手目前支持以下页面：</p>
      <ul>
        <li><strong>Patient Info</strong> - 病人信息页</li>
        <li><strong>Internal Patient Info</strong> - 病人内部信息页</li>
        <li><strong>Aide Info</strong> - 护理员信息页</li>
      </ul>
      <p class="mail-builder-hint">请导航到上述页面之一来使用邮件助手功能。</p>
    `;
        placeholder.appendChild(infoDiv);
        this.container.appendChild(placeholder);
    }
    /**
     * 截断文本
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength) + "...";
    }
    /**
     * HTML 转义
     */
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
    onActivate() {
        console.log("[MailBuilderTab] Activated");
        // 重新检测页面类型
        this.currentPageType = ProfileDataExtractor.getCurrentPageType();
        this.profileData = ProfileDataExtractor.extract();
        // 每次激活都重新渲染
        this.renderContent();
    }
    onDeactivate() {
        console.log("[MailBuilderTab] Deactivated");
    }
    destroy() {
        // 移除页面变化监听器
        if (this.pageChangeHandler) {
            ProfileDataExtractor.offPageChange(this.pageChangeHandler);
            this.pageChangeHandler = null;
        }
        super.destroy();
    }
}

;// ./src/js/services/OutlookDOMControllerPayload.ts
/**
 * OutlookDOMControllerPayload - Outlook DOM 控制器负载脚本
 * Epic 12, Story 11: CSP 合规的 Outlook 集成重构
 *
 * 重要说明：
 * - 这段代码会被序列化为字符串，通过 GM.addElement 注入到页面主世界执行
 * - 因此必须是完全自包含的 IIFE (Immediately Invoked Function Expression)
 * - 不能依赖外部模块或 TypeScript 特性
 * - 所有依赖必须内联在此文件中
 *
 * 功能：
 * - 在 Outlook 页面主世界中运行
 * - 提供邮件自动填充功能
 * - 通过 CustomEvent 与 OutlookAdapter 通信
 */
/**
 * Outlook DOM Controller Payload
 * 这是一个自包含的 JavaScript 代码字符串，将被注入到 Outlook 页面
 */
const OutlookDOMControllerPayload = `
(function() {
  'use strict';

  // 防止重复初始化
  if (window.HHAOutlookController) {
    console.log('[OutlookDOMController] Already initialized, skipping');
    return;
  }

  console.log('[OutlookDOMController] Initializing...');

  /**
   * Outlook DOM 选择器
   * 基于浏览器远程调试确认 (2026-01)
   * 使用 EditorClass[id] 定位收件人字段
   */
  var SELECTORS = {
    // 新邮件按钮
    newMailButton: 'button[aria-label="New mail"]',
    newMailButtonAlt: '[data-testid="new-message-button"]',

    // 收件人字段 - 通过父容器的 _TO, _CC 后缀定位（更可靠）
    // 旧选择器 div.EditorClass[id="0"] 可能与其他元素冲突
    toField: 'div[id$="_TO"] .EditorClass, div.EditorClass[id="0"]',
    ccField: 'div[id$="_CC"] .EditorClass, div.EditorClass[id="1"]',

    // 主题字段
    subjectField: 'input[aria-label="Subject"]',
    subjectFieldAlt: 'input[placeholder="Add a subject"]',

    // 邮件正文编辑器
    bodyEditor: 'div[aria-label="Message body"]',

    // 发送按钮
    sendButton: 'button[aria-label="Send"]',
    sendButtonAlt: '[data-testid="send-button"]',

    // 丢弃/关闭按钮 (用于关闭已打开的草稿)
    discardButton: 'button[aria-label="Discard"]',
    discardConfirmButton: 'button[data-testid="confirmDialogPrimaryButton"], .ms-Dialog-main button.ms-Button--primary'
  };

  /**
   * 工具函数：等待元素出现
   * @param {string} selector - CSS 选择器
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<Element>}
   */
  function waitForElement(selector, timeout) {
    return new Promise(function(resolve, reject) {
      var startTime = Date.now();
      
      function check() {
        var el = document.querySelector(selector);
        if (el) {
          resolve(el);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Element ' + selector + ' not found within ' + timeout + 'ms'));
        } else {
          requestAnimationFrame(check);
        }
      }
      
      check();
    });
  }

  /**
   * 工具函数：延迟
   * @param {number} ms - 毫秒数
   * @returns {Promise<void>}
   */
  function sleep(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
  }

  /**
   * 关闭已存在的草稿窗口（如果有）
   * 检测：如果存在邮件正文区域但没有新邮件按钮，则说明窗口已打开
   * @returns {Promise<boolean>} - 是否成功关闭了现有草稿
   */
  async function closeExistingDraft() {
    var bodyEditor = document.querySelector(SELECTORS.bodyEditor);
    var newMailBtn = document.querySelector(SELECTORS.newMailButton) || 
                     document.querySelector(SELECTORS.newMailButtonAlt);
    
    // 如果存在正文区域但没有新邮件按钮，说明草稿窗口已打开
    if (bodyEditor && !newMailBtn) {
      console.log('[OutlookDOMController] Existing draft detected, attempting to close...');
      
      // 尝试点击丢弃按钮
      var discardBtn = document.querySelector(SELECTORS.discardButton);
      if (discardBtn) {
        discardBtn.click();
        await sleep(500);
        
        // 等待确认对话框并点击确认
        var confirmBtn = document.querySelector(SELECTORS.discardConfirmButton);
        if (confirmBtn) {
          confirmBtn.click();
          console.log('[OutlookDOMController] Clicked discard confirm button');
          await sleep(800); // 等待对话框关闭
        }
        
        console.log('[OutlookDOMController] Existing draft closed');
        return true;
      } else {
        console.warn('[OutlookDOMController] Discard button not found, cannot close existing draft');
      }
    }
    
    return false;
  }

  /**
   * 填充输入字段（支持 React 合成事件）
   * @param {string|string[]} selectors - CSS 选择器或选择器数组
   * @param {string} value - 要填充的值
   * @returns {boolean} - 是否成功
   */
  function fillInputField(selectors, value) {
    var selectorList = Array.isArray(selectors) ? selectors : [selectors];
    
    for (var i = 0; i < selectorList.length; i++) {
      var selector = selectorList[i];
      var field = document.querySelector(selector);
      
      if (field) {
        // 聚焦字段
        field.focus();
        
        // 使用原生 setter 设置值（兼容 React）
        var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        );
        
        if (nativeInputValueSetter && nativeInputValueSetter.set) {
          nativeInputValueSetter.set.call(field, value);
        } else {
          field.value = value;
        }
        
        // 触发事件
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
        
        console.log('[OutlookDOMController] Filled field:', selector, '->', value.substring(0, 30) + (value.length > 30 ? '...' : ''));
        return true;
      }
    }
    
    console.warn('[OutlookDOMController] Field not found:', selectorList.join(' | '));
    return false;
  }

  /**
   * 填充 EditorClass 类型的字段（To/Cc 使用这种）
   * Outlook 的收件人字段是复杂的 div，需要模拟键入
   * @param {string} containerSelector - EditorClass 容器选择器（可以是逗号分隔的多个选择器）
   * @param {string} value - 要填充的值（邮箱地址）
   * @returns {boolean} - 是否成功
   */
  function fillEditorClassField(containerSelector, value) {
    // 支持逗号分隔的多个选择器（按顺序尝试）
    var selectors = containerSelector.split(',').map(function(s) { return s.trim(); });
    var container = null;
    
    for (var i = 0; i < selectors.length; i++) {
      container = document.querySelector(selectors[i]);
      if (container) {
        console.log('[OutlookDOMController] Found EditorClass with selector:', selectors[i]);
        break;
      }
    }
    
    if (!container) {
      console.warn('[OutlookDOMController] EditorClass container not found:', containerSelector);
      return false;
    }
    
    // 聚焦容器
    container.focus();
    container.click();
    
    // 尝试找到可编辑区域
    var editable = container.querySelector('[contenteditable="true"]') || 
                   container.querySelector('[role="textbox"]') ||
                   container;
    
    if (editable) {
      editable.focus();
      
      // 使用 innerText 设置内容（比 execCommand 更可靠）
      editable.innerText = value;
      
      // 触发事件让 Outlook 识别输入
      editable.dispatchEvent(new Event('input', { bubbles: true }));
      editable.dispatchEvent(new Event('change', { bubbles: true }));
      editable.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      
      console.log('[OutlookDOMController] Filled EditorClass field:', containerSelector, '->', value);
      return true;
    }
    
    console.warn('[OutlookDOMController] No editable area in container:', containerSelector);
    return false;
  }

  /**
   * 填充邮件正文（在开头插入内容，保留签名）
   * 关键：不使用 selectAll + delete，而是将光标移到开头插入
   * @param {string} htmlBody - HTML 格式的邮件正文
   * @returns {boolean} - 是否成功
   */
  function fillBodyEditor(htmlBody) {
    var editor = document.querySelector(SELECTORS.bodyEditor);
    
    if (!editor) {
      console.warn('[OutlookDOMController] Body editor not found');
      return false;
    }
    
    // 聚焦编辑器
    editor.focus();
    
    // 将光标移动到编辑器开头（保留签名）
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(editor, 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    
    // 规范化内容：处理 HTML 和纯文本两种情况
    // 1. 将 </p><p> 转换为双换行（段落之间保留空行）
    // 2. 移除单独的 <p> 和 </p> 标签
    // 3. 将纯文本 \\n 转换为 <br>
    // 注意：不要合并连续的 <br>，因为用户可能故意留空行
    var normalizedHtml = htmlBody
      .replace(/<\\/p>\\s*<p>/gi, '<br><br>')  // </p><p> -> 双换行保留段落间隔
      .replace(/<p>/gi, '')                    // 移除开始 <p>
      .replace(/<\\/p>/gi, '')                 // 移除结束 </p>
      .replace(/\\r?\\n/g, '<br>');             // \\n -> <br>
    
    console.log('[OutlookDOMController] Normalized body content, inserting...');
    
    // 在开头插入 HTML 内容
    document.execCommand('insertHTML', false, normalizedHtml + '<br><br>');
    
    // 触发 input 事件
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('[OutlookDOMController] Body filled successfully (signature preserved)');
    return true;
  }

  /**
   * 通知任务完成状态（通过 CustomEvent）
   * @param {string} status - 'SUCCESS' 或 'FAILED'
   * @param {string|null} error - 错误信息（如果有）
   */
  function notifyTaskComplete(status, error) {
    document.dispatchEvent(new CustomEvent('hha-outlook-task-complete', {
      detail: { status: status, error: error || null }
    }));
    console.log('[OutlookDOMController] Task complete notification sent:', status);
  }

  /**
   * 主执行流程：执行邮件任务
   * @param {Object} task - 邮件任务对象
   * @param {string} task.to - 收件人
   * @param {string} [task.cc] - 抄送
   * @param {string} task.subject - 主题
   * @param {string} task.body - 正文（HTML）
   */
  async function executeMailTask(task) {
    console.log('[OutlookDOMController] Executing mail task:', task);
    
    try {
      // 0. 先关闭已存在的草稿窗口（如果有）
      var closedDraft = await closeExistingDraft();
      if (closedDraft) {
        console.log('[OutlookDOMController] Closed existing draft, waiting for UI to stabilize...');
        await sleep(1000);
      }
      
      // 1. 点击新建邮件按钮（可能需要短暂等待按钮出现）
      var newMailBtn = null;
      for (var attempt = 0; attempt < 5; attempt++) {
        newMailBtn = document.querySelector(SELECTORS.newMailButton) || 
                     document.querySelector(SELECTORS.newMailButtonAlt);
        if (newMailBtn) break;
        await sleep(300);
      }
      
      if (!newMailBtn) {
        throw new Error('New mail button not found');
      }
      
      newMailBtn.click();
      console.log('[OutlookDOMController] Clicked New Mail button');
      
      // 2. 等待编辑器加载
      try {
        await waitForElement(SELECTORS.subjectField, 5000);
      } catch (e) {
        await waitForElement(SELECTORS.subjectFieldAlt, 3000);
      }
      await sleep(500); // 额外等待确保 UI 稳定
      
      // 3. 填充 To 字段 - 直接使用 EditorClass[id="0"]
      if (task.to) {
        // 添加分号让 Outlook 识别为收件人
        var toEmail = task.to.endsWith(';') ? task.to : task.to + ';';
        fillEditorClassField(SELECTORS.toField, toEmail);
        await sleep(300);
        // 移开焦点以触发收件人解析
        var subjectInput = document.querySelector(SELECTORS.subjectField);
        if (subjectInput) subjectInput.focus();
        await sleep(200);
      }
      
      // 4. 填充 CC 字段（如果有）- 直接使用 EditorClass[id="1"]
      if (task.cc) {
        var ccEmail = task.cc.endsWith(';') ? task.cc : task.cc + ';';
        fillEditorClassField(SELECTORS.ccField, ccEmail);
        await sleep(300);
        // 移开焦点
        var subjectInput = document.querySelector(SELECTORS.subjectField);
        if (subjectInput) subjectInput.focus();
        await sleep(200);
      }
      
      // 5. 填充主题
      fillInputField([SELECTORS.subjectField, SELECTORS.subjectFieldAlt], task.subject);
      await sleep(300);
      
      // 6. 填充正文
      fillBodyEditor(task.body);
      
      // 7. 报告成功
      notifyTaskComplete('SUCCESS', null);
      
    } catch (error) {
      console.error('[OutlookDOMController] Error:', error);
      notifyTaskComplete('FAILED', error.message || String(error));
    }
  }

  // ===== 暴露到全局供 OutlookAdapter 调用 =====
  window.HHAOutlookController = {
    executeMailTask: executeMailTask,
    version: '1.0.0',
    selectors: SELECTORS
  };

  console.log('[OutlookDOMController] Loaded and ready (v1.0.0)');
})();
`;
/**
 * Payload 脚本的标识符，用于防止重复注入
 */
const OUTLOOK_DOM_CONTROLLER_ID = "hha-outlook-dom-controller";

;// ./src/js/services/OutlookAdapter.ts
/**
 * OutlookAdapter - Outlook Web 自动化适配器 (CSP-Compliant)
 * Epic 12, Story 11: CSP 合规的 Outlook 集成重构
 *
 * 职责：
 * - 在 Outlook Web 页面监听邮件任务
 * - 使用 GM.addElement 注入 DOM Controller 到主世界
 * - 通过 CustomEvent 与注入的脚本通信
 *
 * 重构说明：
 * - 原实现直接使用 DOM API 操作，被 Outlook CSP 阻止
 * - 新实现使用 CSPBypassInjector 注入自包含的控制器脚本
 * - 控制器在页面主世界运行，不受 CSP 限制
 *
 * 注意：仅在 https://outlook.office.com/* 页面运行
 *
 * @see docs/guides/Outlook CSP 绕过 Userscript 方案.md
 */



/**
 * OutlookAdapter 类
 * CSP 合规的 Outlook Web 自动化适配器
 */
class OutlookAdapter {
    /**
     * 初始化适配器（仅在 Outlook 页面调用）
     */
    static init() {
        const hostname = window.location.hostname;
        const isOutlook = MailService.isOutlookPage();
        console.log("[OutlookAdapter] Checking page...", {
            hostname,
            isOutlook,
            href: window.location.href.substring(0, 50),
        });
        if (!isOutlook) {
            console.log("[OutlookAdapter] Not on Outlook page, skipping init");
            return;
        }
        console.log("[OutlookAdapter] Initializing on Outlook page (CSP-Compliant)...");
        MailService.init();
        // 注入 DOM Controller 到主世界（使用 GM.addElement 绕过 CSP）
        this.injectDOMController();
        // 开始监听邮件任务
        this.startListening();
        // 创建状态 Toast（使用 GM.addElement 绕过 CSP）
        this.createStatusToast();
        console.log("[OutlookAdapter] Initialization complete!");
    }
    /**
     * 注入 DOM Controller（仅执行一次）
     * 使用 CSPBypassInjector 将控制器脚本注入到页面主世界
     */
    static async injectDOMController() {
        if (this.controllerInjected) {
            console.log("[OutlookAdapter] DOM Controller already injected");
            return;
        }
        try {
            // 检查 GM.addElement 是否可用
            if (!CSPBypassInjector.isAvailable()) {
                console.error("[OutlookAdapter] GM.addElement not available. Please upgrade Tampermonkey to version 4.10 or later.");
                this.showStatus("❌ 请升级 Tampermonkey 到 4.10 或更高版本", true);
                return;
            }
            // 使用 CSPBypassInjector 注入控制器脚本
            await CSPBypassInjector.injectPayloadScript(OutlookDOMControllerPayload, OUTLOOK_DOM_CONTROLLER_ID);
            this.controllerInjected = true;
            console.log("[OutlookAdapter] DOM Controller injected successfully");
        }
        catch (error) {
            console.error("[OutlookAdapter] Failed to inject DOM Controller:", error);
            this.showStatus(`❌ 注入失败: ${error.message}`, true);
        }
    }
    /**
     * 开始监听任务
     */
    static startListening() {
        if (this.isListening)
            return;
        this.isListening = true;
        MailService.startListening((task, taskId) => {
            console.log("[OutlookAdapter] Received task:", taskId, task);
            this.handleMailTask(task, taskId);
        });
        console.log("[OutlookAdapter] Started listening for mail tasks");
    }
    /**
     * 处理邮件任务（调用注入的 Controller）
     */
    static async handleMailTask(task, taskId) {
        try {
            this.showStatus("📧 正在打开新邮件...");
            // 确保 Controller 已注入
            if (!this.controllerInjected) {
                await this.injectDOMController();
            }
            // 等待 Controller 就绪
            // 注意：使用 unsafeWindow 访问页面主世界中的 Controller
            if (!unsafeWindow.HHAOutlookController) {
                await this.waitForController();
            }
            // 监听完成事件
            const completePromise = new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    document.removeEventListener("hha-outlook-task-complete", handler);
                    reject(new Error("Task execution timeout (10s)"));
                }, 10000);
                const handler = (e) => {
                    clearTimeout(timeoutId);
                    const { status, error } = e.detail;
                    document.removeEventListener("hha-outlook-task-complete", handler);
                    if (status === "SUCCESS") {
                        resolve();
                    }
                    else {
                        reject(new Error(error || "Unknown error"));
                    }
                };
                document.addEventListener("hha-outlook-task-complete", handler);
            });
            // 调用注入的 Controller（使用 unsafeWindow）
            this.showStatus("📝 正在填充邮件内容...");
            unsafeWindow.HHAOutlookController.executeMailTask(task);
            // 等待完成
            await completePromise;
            this.showStatus("✅ 邮件已准备就绪！");
            MailService.reportComplete(taskId);
            // 3秒后隐藏状态
            setTimeout(() => this.hideStatus(), 3000);
        }
        catch (error) {
            const errorMsg = error.message;
            console.error("[OutlookAdapter] Error handling mail task:", error);
            this.showStatus(`❌ 错误: ${errorMsg}`, true);
            MailService.reportFailed(taskId, errorMsg);
            // 5秒后隐藏状态
            setTimeout(() => this.hideStatus(), 5000);
        }
    }
    /**
     * 等待 Controller 加载
     * 使用 unsafeWindow 访问页面主世界中的 Controller
     */
    static waitForController(timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const check = () => {
                if (unsafeWindow.HHAOutlookController) {
                    console.log("[OutlookAdapter] Controller ready, version:", unsafeWindow.HHAOutlookController.version);
                    resolve();
                }
                else if (Date.now() - startTime > timeout) {
                    reject(new Error("Controller not loaded within timeout"));
                }
                else {
                    requestAnimationFrame(check);
                }
            };
            check();
        });
    }
    /**
     * 创建状态 Toast
     * 使用 GM.addElement 绕过 CSP 的 style-src 限制
     */
    static createStatusToast() {
        if (this.statusToast)
            return;
        // 注入 Toast 样式
        const toastStyles = `
      #hha-outlook-status {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: none;
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transition: opacity 0.3s ease;
      }
      #hha-outlook-status.error {
        background: #e53935;
      }
      #hha-outlook-status.visible {
        display: block;
      }
    `;
        // 使用 CSPBypassInjector 注入样式
        CSPBypassInjector.injectStyle(toastStyles, "outlook-status-toast");
        // 创建 Toast 元素
        this.statusToast = document.createElement("div");
        this.statusToast.id = "hha-outlook-status";
        document.body.appendChild(this.statusToast);
        console.log("[OutlookAdapter] Status toast created");
    }
    /**
     * 显示状态
     */
    static showStatus(message, isError = false) {
        if (!this.statusToast) {
            this.createStatusToast();
        }
        if (this.statusToast) {
            this.statusToast.textContent = message;
            this.statusToast.className = isError ? "error visible" : "visible";
        }
    }
    /**
     * 隐藏状态
     */
    static hideStatus() {
        if (this.statusToast) {
            this.statusToast.className = "";
        }
    }
    /**
     * 点击发送按钮（可选功能）
     * 注意：此功能需要用户确认，不自动执行
     */
    static async clickSend() {
        if (!unsafeWindow.HHAOutlookController) {
            console.error("[OutlookAdapter] Controller not available");
            return false;
        }
        const sendBtn = document.querySelector('button[aria-label="Send"]') ||
            document.querySelector('[data-testid="send-button"]');
        if (sendBtn) {
            sendBtn.click();
            console.log("[OutlookAdapter] Clicked Send button");
            return true;
        }
        console.error("[OutlookAdapter] Send button not found");
        return false;
    }
    /**
     * 清理资源
     */
    static cleanup() {
        this.isListening = false;
        MailService.stopListening();
        if (this.statusToast) {
            this.statusToast.remove();
            this.statusToast = null;
        }
        console.log("[OutlookAdapter] Cleaned up");
    }
}
OutlookAdapter.isListening = false;
OutlookAdapter.controllerInjected = false;
OutlookAdapter.statusToast = null;

;// ./package.json
const package_namespaceObject = {"rE":"3.9.5"};
;// ./src/index.ts






















async function src_main() {
    console.log("HHA Exchange Smart Assistant " + package_namespaceObject.rE + " : script start");
    // Set a global flag to indicate script is running (for debugging)
    window.HHA_SMART_ASSISTANT_STARTED = true;
    window.HHA_SMART_ASSISTANT_VERSION = package_namespaceObject.rE;
    // Initialize OutlookAdapter if on Outlook page
    OutlookAdapter.init();
    // Preload TinyMCE in the background (fire and forget)
    // This gives it time to load before user opens the mail template editor
    TinyMCEBundler.load().catch((err) => {
        console.warn("[main] TinyMCE preload failed (will retry on modal open):", err);
    });
    incomingCallHandler();
    async function FetchTester() {
        try {
            // 构造目标网站的搜索URL
            // const searchUrl = `https://your-search-site.com/search?q=${number}`; // <--- [!] 修改为实际的搜索URL格式
            // console.log('正在搜索:', searchUrl);
            let SearchCGphone = "https://app.hhaexchange.com/ENT2507010000/Aide/AideSearchXSLT_ns.aspx?FirstName=&Phone=347-265-3886&LastName=&Type=2&Discipline=-1&CaregiverCode=&ALtCaregiverCode=&Status=-1&SSN=&CaregiverTeamID=-1&FromVisitEdit=0&CaregiverLocationID=-1&CaregiverBranchID=-1&VisitDate=&office=469,5137,5139,6475,14849&DOB=&pg=1&sort=&ord=ASC&FromPage=&_=1755108928644";
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
        class: "button hollow prebilling-selector-btn",
        value: "Search by Coordinator(s)",
    });
    let $HomePageSelector = $("<input/>").text("").attr({
        type: "button",
        id: "homePageSelector",
        name: "homePageSelector",
        class: "button hollow homepage-selector-btn",
        value: "Search by Coordinator",
    });
    assignIntervalTimer(homePageSearchButtonSelector, $HomePageSelector, "#homePageSelector", homePageSelector, [], "left", () => window.location.hash === "#msg", // 只在 #msg 锚点显示
    "#ctl00_ContentPlaceHolder1_iframemsg" // iframe 选择器
    );
    assignIntervalTimer(prebillingSearchButtonSelector, $prebillingSelector, "#prebillingSelector", prebillingSelector);
    // 初始化 Prebilling 配置卡片 UI (Story 3)
    initConfigCardUI();
    // 初始化 HomePage hashchange 监听器 (Epic 4, Story 1)
    initHashChangeListener();
    // 初始化 HomePage 配置卡片 UI (Epic 4, Story 3)
    initHomePageConfigCardUI();
    assignIntervalTimer(newMessageButtonSelector, $newQABtn, "#newQABtn", createNewQA);
    assignIntervalTimer(newMessageButtonSelector, $newWelcomeCall, "#newWelcomecallBtn", createWelcomeCall);
    assignIntervalTimer(saveButtonSelector, $POCBtn, "#uxBtnPOC", POCResolver);
    assignIntervalTimer(saveButtonSelector, $missedInOutBtn, "#missedInOutBtn", missedCallResolver, ["Attendant failed to call in and out"]);
    assignIntervalTimer(saveButtonSelector, $missedOutBtn, "#missedOutBtn", missedCallResolver, ["Attendant failed to call out"]);
    assignIntervalTimer(saveButtonSelector, $missedInBtn, "#missedInBtn", missedCallResolver, ["Attendant failed to call in"]);
    assignIntervalTimer(documentManagementSaveButtonSelector, $copyDescrpBtn, "#uxBtnCopyToDescrp", copyAttachmentToDescrp);
    visitMonitor(); // Create floating button and background tracking
    highlight2Call();
    // Initialize Multi-Tab Panel (Epic 7: Story 7.1, 7.2, 7.3)
    // This will be shown when clicking the floating button
    initMultiTabPanel();
    // Epic 11: Check for pending cleaning tasks on page load
    // This enables automatic resume of cleaning after page refresh
    checkAndResumeCleaningTasks();
}
/**
 * Initialize Multi-Tab Panel System
 * Epic 7: Multi-Tab Panel System
 *
 * 关键架构（参考 VisitMonitor.ts）：
 * - Multi-Tab Panel 作为 tracker-container 的子元素
 * - 这样拖动铃铛时，整个container（包括panel）会一起移动
 * - 铃铛点击控制panel显示/隐藏
 */
function initMultiTabPanel() {
    // IMPORTANT: Only run in top window, not in iframes
    if (window.self !== window.top) {
        return;
    }
    console.log("[Epic 7] Initializing Multi-Tab Panel System...");
    // Wait for VisitMonitor to create tracker-container
    waitForTrackerContainer();
}
/**
 * Wait for tracker-container to exist, then embed our panel inside it
 */
function waitForTrackerContainer(retryCount = 0) {
    const MAX_RETRIES = 40; // 20 seconds max
    const trackerContainer = document.getElementById("tracker-container");
    const dragHandle = document.getElementById("tracker-drag-handle");
    const trackerPanel = document.getElementById("tracker-panel");
    if (trackerContainer && dragHandle) {
        // tracker-container exists, now embed our panel
        embedMultiTabPanel(trackerContainer, dragHandle, trackerPanel);
    }
    else if (retryCount < MAX_RETRIES) {
        setTimeout(() => waitForTrackerContainer(retryCount + 1), 500);
    }
    else {
        console.error("[Epic 7] tracker-container not found after max retries");
    }
}
/**
 * Embed Multi-Tab Panel inside tracker-container
 * This way it will move together when dragging the bell button
 */
function embedMultiTabPanel(trackerContainer, dragHandle, trackerPanel) {
    // CRITICAL FIX: 立即克隆铃铛移除 VisitMonitor 的所有事件监听器
    // 必须在异步操作之前完成，防止用户在初始化期间点击铃铛触发旧的 handler
    const newDragHandle = dragHandle.cloneNode(true);
    dragHandle.parentNode?.replaceChild(newDragHandle, dragHandle);
    console.log("[Epic 7] Bell button cloned to remove VisitMonitor handlers");
    // Create our panel container as a SIBLING to tracker-panel inside tracker-container
    const container = document.createElement("div");
    container.id = "hha-smart-multi-tab-container";
    // 使用和tracker-panel相同的定位方式（相对于container）
    // CRITICAL: 必须设置 width，否则 container 宽度为 0，getBoundingClientRect 无法正确计算位置
    container.style.cssText = `
    position: absolute;
    top: 0;
    width: 680px;
    display: none;
    z-index: 99998;
  `;
    // Append INSIDE tracker-container (not body)
    trackerContainer.appendChild(container);
    // Create panel instance
    const panel = new MultiTabPanel(container, {
        title: "HHAexchange Smart Assistant",
        defaultTabId: "status-tracking",
        initialCollapsed: false,
        showHeaderControls: false, // 不显示最小化/关闭按钮，用铃铛控制
    });
    // Register tabs
    panel.registerTab(new StatusTrackingTab());
    panel.registerTab(new QAReportTab());
    panel.registerTab(new CleanerTab());
    panel.registerTab(new MailBuilderTab());
    // Initialize panel
    panel
        .init()
        .then(() => {
        console.log("[Epic 7] Multi-Tab Panel embedded in tracker-container");
        // Hook bell button click - 使用已克隆的新铃铛
        setupBellClickHandler(container, newDragHandle, trackerPanel);
    })
        .catch((error) => {
        console.error("[Epic 7] Failed to initialize Multi-Tab Panel:", error);
    });
}
/**
 * Setup click handler on bell button to toggle Multi-Tab Panel
 * 参考 VisitMonitor.ts initializeDragAndClick() 的实现
 *
 * 注意：传入的 dragHandle 已经是在 embedMultiTabPanel 中克隆过的新节点
 */
function setupBellClickHandler(panelContainer, dragHandle, trackerPanel) {
    let hasDragged = false;
    // dragHandle 已经是克隆过的节点，不需要再克隆
    // 重新实现拖动功能（参考 VisitMonitor makeDraggable）
    const trackerContainer = dragHandle.parentElement;
    let isDragging = false;
    let offsetX = 0, offsetY = 0;
    dragHandle.style.cursor = "move";
    const onMouseDown = (e) => {
        isDragging = true;
        hasDragged = false; // 重置拖动标志
        const rect = trackerContainer.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };
    const onMouseMove = (e) => {
        if (!isDragging)
            return;
        hasDragged = true; // 标记为已拖动
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;
        // 边界检测
        const margin = 5;
        if (newX < margin)
            newX = margin;
        if (newY < margin)
            newY = margin;
        if (newX + trackerContainer.offsetWidth > window.innerWidth - margin) {
            newX = window.innerWidth - trackerContainer.offsetWidth - margin;
        }
        if (newY + trackerContainer.offsetHeight > window.innerHeight - margin) {
            newY = window.innerHeight - trackerContainer.offsetHeight - margin;
        }
        // 设置位置
        trackerContainer.style.right = "auto";
        trackerContainer.style.bottom = "auto";
        trackerContainer.style.left = `${newX}px`;
        trackerContainer.style.top = `${newY}px`;
    };
    const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };
    dragHandle.addEventListener("mousedown", onMouseDown);
    // 使用capture阶段拦截click，完全控制点击行为
    dragHandle.addEventListener("click", (e) => {
        if (hasDragged) {
            console.log("[Epic 7] Drag detected, skipping panel toggle");
            hasDragged = false;
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        const isVisible = panelContainer.style.display !== "none";
        if (!isVisible) {
            // CRITICAL: 立即隐藏原来的tracker-panel，防止在页面刚加载时点击铃铛显示旧面板
            if (trackerPanel) {
                trackerPanel.style.display = "none";
            }
            // 显示我们的面板
            positionPanelRelativeToHandle(panelContainer, dragHandle);
            panelContainer.style.display = "block";
            console.log("[Epic 7] Multi-Tab Panel opened");
        }
        else {
            // 隐藏面板
            panelContainer.style.display = "none";
            console.log("[Epic 7] Multi-Tab Panel closed");
        }
    }, true); // capture phase
    console.log("[Epic 7] Bell click handler setup complete (drag functionality restored)");
}
/**
 * Position panel relative to drag handle (bell button)
 * 完全参照 VisitMonitor.ts 的鲁棒实现（第 2806-2814 行）
 */
function positionPanelRelativeToHandle(panel, handle) {
    const w = window.innerWidth;
    const r = handle.getBoundingClientRect();
    // VisitMonitor 的简单判断：铃铛中心在左半边 → 面板放右边，否则放左边
    if (r.left + r.width / 2 < w / 2) {
        panel.style.left = `${handle.offsetWidth + 10}px`;
        panel.style.right = "auto";
        console.log("[Epic 7] Panel positioned RIGHT (handle in left half):", {
            handleCenterX: r.left + r.width / 2,
            viewportHalf: w / 2,
            leftValue: `${handle.offsetWidth + 10}px`,
        });
    }
    else {
        panel.style.right = `${handle.offsetWidth + 10}px`;
        panel.style.left = "auto";
        console.log("[Epic 7] Panel positioned LEFT (handle in right half):", {
            handleCenterX: r.left + r.width / 2,
            viewportHalf: w / 2,
            rightValue: `${handle.offsetWidth + 10}px`,
        });
    }
}
/**
 * Epic 11: Check and Resume Cleaning Tasks
 *
 * Called on every page load to:
 * 1. Check for pending cleaning tasks in GM_getValue
 * 2. If on visit detail page with pending task, auto-execute POCResolver
 * 3. Resume cleaning progress display
 */
async function checkAndResumeCleaningTasks() {
    // Wait loop to detect page type (Visit Detail OR Prebilling List)
    // We need to wait because elements might not be immediately available on document.ready
    const detectPageType = async (retries = 20) => {
        // 1. Check for Visit Detail Page specific element (Dropdowns or Headers)
        if ($(visitReasonSelector).length > 0 ||
            window.location.href.includes("NonSkilledVisitInfo_ns.aspx")) {
            return "DETAIL";
        }
        // 2. Check for Prebilling List specific element (Container or Search Button)
        // Note: Prebilling page also has a search button, Detail page does NOT
        if ($("#ctl00_ContentPlaceHolder1_divPrebillingReportInternalScroll").length >
            0 ||
            $(prebillingSearchButtonSelector).length > 0 ||
            $("#prebillingSelector").length > 0) {
            return "LIST";
        }
        if (retries <= 0)
            return "UNKNOWN";
        await new Promise((r) => setTimeout(r, 500));
        return detectPageType(retries - 1);
    };
    const pageType = await detectPageType();
    console.log(`[Epic 11] Page Type Detected: ${pageType}`);
    if (pageType === "DETAIL") {
        // 获取待处理的任务队列
        const queue = CleaningController.getQueue();
        if (queue &&
            queue.status === "IN_PROGRESS" &&
            queue.pageType === "PREBILLING") {
            console.log("[Epic 11] Visit detail page detected with pending POC task");
            // 延迟执行，确保页面完全加载
            setTimeout(async () => {
                try {
                    // 导入并执行 POCResolver
                    const { CleaningOverlay } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, "./src/js/services/CleaningOverlay.ts"));
                    // 显示蒙版 (Important: Update text because previous page might have left it at 'Refreshing table...')
                    CleaningOverlay.show(queue.currentIndex + 1, queue.tasks.length, "正在处理 POC... (已进入详情页)");
                    // 执行 POC 清理
                    setTimeout(async () => {
                        await POCResolver();
                        // 点击保存按钮
                        setTimeout(() => {
                            // 尝试多种选择器找到保存按钮
                            let saveButton = document.getElementById("uxBtnSaveVisit");
                            if (!saveButton) {
                                // 回退到完整 ID 选择器
                                saveButton = document.getElementById("ctl00_ContentPlaceHolder1_uxBtnSaveVisit");
                            }
                            if (!saveButton) {
                                // 使用 querySelector 查找任何匹配的保存按钮
                                saveButton = document.querySelector('[id$="uxBtnSaveVisit"]');
                            }
                            if (saveButton) {
                                console.log("[Epic 11] Clicking save button...", saveButton.id);
                                saveButton.click();
                                // 处理保存后可能弹出的确认对话框
                                // HHAeXchange 会弹出 "HHAeXchange - Confirm" 对话框，需要点击 OK
                                setTimeout(() => {
                                    handleConfirmationDialog();
                                }, 500);
                                // 页面会刷新回 Prebilling Report，在那里会继续下一个任务
                            }
                            else {
                                console.error("[Epic 11] Save button not found with any selector");
                                CleaningOverlay.showError("Save button not found");
                            }
                        }, 1000);
                    }, 500);
                }
                catch (error) {
                    console.error("[Epic 11] Auto POC execution failed:", error);
                }
            }, 1500);
            return;
        }
    }
    else if (pageType === "LIST") {
        // 不在详情页，检查是否有待恢复的任务（在 Prebilling 或 Call Maintenance 页面）
        const hasPendingTasks = await CleaningController.checkPendingTasks();
        if (hasPendingTasks) {
            console.log("[Epic 11] Cleaning tasks resumed (List Page)");
        }
    }
    else {
        // UNKNOWN or Timeout
        // Can't confirm page type, so safe to do nothing or check generic logic
        // But we should verify if 'checkPendingTasks' is safe to run?
        // If we run it here, it might trigger false "Refreshing table" error.
        // Better to check queue first.
        const queue = CleaningController.getQueue();
        if (queue && queue.status === "IN_PROGRESS") {
            // If we are stuck in UNKNOWN state but have tasks...
            // Maybe just wait a bit longer?
            console.warn("[Epic 11] Could not detect page type, but tasks are pending.");
        }
    }
}
/**
 * Handle HHAeXchange confirmation dialogs that appear after Save
 *
 * 基于用户提供的 HTML，对话框结构如下：
 * - 对话框容器: #confirmation.reveal.hhax-modal
 * - OK 按钮: button.button.primary.yes
 *
 * 关键发现：对话框在 window.top（主文档）中，但脚本运行在 iframe 内
 * 必须使用 window.top.document 来访问对话框
 */
function handleConfirmationDialog(retryCount = 0) {
    const MAX_RETRIES = 15; // 最多重试 15 次，每次间隔 300ms，共 4.5 秒
    console.log(`[Epic 11] Looking for confirmation dialog (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    // 基于用户提供的 HTML 的精确选择器
    const selectors = [
        // 用户提供的准确选择器
        "#confirmation button.button.primary.yes",
        "#confirmation .footer button.button.primary",
        "#confirmation button.primary",
        ".hhax-modal button.button.primary.yes",
        ".reveal button.button.primary.yes",
        // 回退选择器
        "button.button.primary.yes",
        ".footer button.primary",
    ];
    let okButton = null;
    // ★★★ 关键修复：首先在 window.top（主文档）中搜索 ★★★
    // 因为脚本运行在 iframe 内，但确认对话框在主文档中
    try {
        if (window.top && window.top.document) {
            okButton = findOkButtonInDocument(window.top.document, selectors);
            if (okButton) {
                console.log("[Epic 11] Found OK button in window.top.document");
            }
        }
    }
    catch (e) {
        console.log("[Epic 11] Cannot access window.top.document:", e);
    }
    // 如果没找到，在当前文档中搜索（可能脚本在主文档运行）
    if (!okButton) {
        okButton = findOkButtonInDocument(document, selectors);
    }
    // 如果还没找到，在所有 iframe 中搜索
    if (!okButton) {
        okButton = findOkButtonInAllFrames(window, selectors);
    }
    if (okButton) {
        // ★★★ 关键修复：在点击 OK 之前，增加任务索引 ★★★
        // 这样页面刷新后，checkPendingTasks 会处理下一个任务
        try {
            const queue = CleaningController.getQueue();
            if (queue && queue.status === "IN_PROGRESS") {
                // 标记当前任务完成
                queue.tasks[queue.currentIndex].completed = true;
                // 增加索引
                queue.currentIndex++;
                // 保存更新的队列
                GM_setValue("hha_cleaner_task_queue", queue);
                console.log(`[Epic 11] Task index advanced to ${queue.currentIndex}/${queue.tasks.length}`);
            }
        }
        catch (e) {
            console.error("[Epic 11] Failed to update task queue:", e);
        }
        console.log("[Epic 11] Found and clicking confirmation dialog OK button...");
        okButton.click();
        // 点击后页面会刷新
        // CRITICAL FIX: Ensure parent page reloads if the modal/dialog close action fails to trigger it
        console.log("[Epic 11] Waiting 3s for page reload, otherwise forcing reload of top window...");
        setTimeout(() => {
            try {
                if (window.top) {
                    console.log("[Epic 11] Forcing top window reload...");
                    window.top.location.reload();
                }
                else {
                    window.location.reload();
                }
            }
            catch (e) {
                console.error("Failed to reload top window:", e);
                window.location.reload();
            }
        }, 3000);
    }
    else if (retryCount < MAX_RETRIES) {
        // 对话框可能还没出现，重试
        setTimeout(() => handleConfirmationDialog(retryCount + 1), 300);
    }
    else {
        // Possible scenario: Save successful without confirmation dialog
        console.log("[Epic 11] No confirmation dialog found after retries. Assuming silent success and advancing task.");
        // CRITICAL FIX: Ensure we advance the task index even if no dialog appeared
        // This prevents the "stuck" issue where the script keeps retrying the same task
        try {
            const queue = CleaningController.getQueue();
            if (queue && queue.status === "IN_PROGRESS") {
                queue.tasks[queue.currentIndex].completed = true;
                queue.currentIndex++;
                GM_setValue("hha_cleaner_task_queue", queue);
                console.log(`[Epic 11] Task index advanced (fallback) to ${queue.currentIndex}/${queue.tasks.length}`);
            }
        }
        catch (e) {
            console.error("[Epic 11] Failed to update task queue (fallback):", e);
        }
    }
}
/**
 * 在指定文档中查找 OK 按钮
 */
function findOkButtonInDocument(doc, selectors) {
    for (const selector of selectors) {
        try {
            const btn = doc.querySelector(selector);
            if (btn) {
                // 检查是否可见
                const style = doc.defaultView?.getComputedStyle(btn);
                if (style &&
                    style.display !== "none" &&
                    style.visibility !== "hidden") {
                    console.log("[Epic 11] Found OK button with selector:", selector);
                    return btn;
                }
            }
        }
        catch (e) {
            // 选择器可能无效，静默忽略
        }
    }
    return null;
}
/**
 * 在所有 iframe 中递归查找 OK 按钮
 */
function findOkButtonInAllFrames(win, selectors) {
    // 遍历所有 frames
    try {
        for (let i = 0; i < win.frames.length; i++) {
            try {
                const frame = win.frames[i];
                if (frame && frame.document) {
                    // 在这个 frame 的文档中查找
                    const btn = findOkButtonInDocument(frame.document, selectors);
                    if (btn) {
                        return btn;
                    }
                    // 递归搜索嵌套的 iframes
                    const nestedBtn = findOkButtonInAllFrames(frame, selectors);
                    if (nestedBtn) {
                        return nestedBtn;
                    }
                }
            }
            catch (e) {
                // 跨域 iframe 无法访问，静默忽略
            }
        }
    }
    catch (e) {
        // 无法访问 frames，静默忽略
    }
    return null;
}
src_main().catch((e) => {
    console.log(e);
});

/******/ })()
;