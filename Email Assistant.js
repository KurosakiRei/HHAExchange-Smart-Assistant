// ==UserScript==
// @name         邮件工作流助手 (v4.3 - 精简优化版)
// @namespace    http://tampermonkey.net/
// @version      4.3
// @description  移除了不存在的en.js语言包的加载，精简捆绑列表，最终修复初始化失败问题。
// @author       Your Senior Frontend Engineer (Final Final Version)
// @match        *://*/* // ***** 您需要修改这里 *****
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  // =================================================================================
  // SECTION 1: MANUAL BUNDLER FOR ALL TINYMCE ASSETS
  // =================================================================================

  const TINYMCE_BASE_URL = "https://unpkg.com/tinymce@6/";

  // JS组件列表 (移除了不存在的 'langs/en.js')
  const TINYMCE_JS_COMPONENTS = [
    "tinymce.min.js",
    "models/dom/model.min.js",
    "themes/silver/theme.min.js",
    "icons/default/icons.min.js",
    "plugins/lists/plugin.min.js",
    "plugins/link/plugin.min.js",
    "plugins/image/plugin.min.js",
    "plugins/charmap/plugin.min.js",
    "plugins/preview/plugin.min.js",
    "plugins/anchor/plugin.min.js",
    "plugins/searchreplace/plugin.min.js",
    "plugins/visualblocks/plugin.min.js",
    "plugins/code/plugin.min.js",
    "plugins/fullscreen/plugin.min.js",
    "plugins/insertdatetime/plugin.min.js",
    "plugins/media/plugin.min.js",
    "plugins/table/plugin.min.js",
    "plugins/help/plugin.min.js",
    "plugins/wordcount/plugin.min.js",
  ];

  // CSS组件列表
  const TINYMCE_CSS_COMPONENTS = {
    ui: "skins/ui/oxide/skin.min.css",
    content: "skins/content/default/content.min.css",
  };

  function fetchAsset(url) {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: "GET",
        url: url,
        onload: (response) => {
          if (response.status >= 200 && response.status < 300) {
            resolve(response.responseText);
          } else {
            reject(new Error(`加载资源失败: ${url}. 状态: ${response.status}`));
          }
        },
        onerror: (error) =>
          reject(new Error(`加载资源失败: ${url}. 错误: ${error}`)),
      });
    });
  }

  async function loadAndInjectJsBundle() {
    console.log("开始捆绑TinyMCE JS v4.3...");
    try {
      const promises = TINYMCE_JS_COMPONENTS.map((c) =>
        fetchAsset(TINYMCE_BASE_URL + c)
      );
      const contents = await Promise.all(promises);
      const bundle = contents.join("\n\n// --- Bundled ---\n\n");
      const scriptEl = document.createElement("script");
      scriptEl.type = "text/javascript";
      scriptEl.textContent = bundle;
      document.head.appendChild(scriptEl);
      console.log("TinyMCE JS捆绑包已成功注入！");
    } catch (error) {
      console.error("严重错误：构建TinyMCE JS捆绑包失败。", error);
      throw error;
    }
  }

  async function loadCssBundle() {
    console.log("开始加载TinyMCE CSS...");
    try {
      const uiCssPromise = fetchAsset(
        TINYMCE_BASE_URL + TINYMCE_CSS_COMPONENTS.ui
      );
      const contentCssPromise = fetchAsset(
        TINYMCE_BASE_URL + TINYMCE_CSS_COMPONENTS.content
      );
      const [ui, content] = await Promise.all([
        uiCssPromise,
        contentCssPromise,
      ]);
      console.log("TinyMCE CSS 已成功加载到内存！");
      return { ui, content };
    } catch (error) {
      console.error("严重错误：加载TinyMCE CSS失败。", error);
      throw error;
    }
  }

  // =================================================================================
  // SECTION 2: SCRIPT LOGIC
  // =================================================================================

  let tinyMceCss = {}; // 全局变量用于存储CSS文本

  const DEFAULT_CONFIG = [
    {
      id: "tpl_1663216681",
      name: "示例: 提取ID并使用富文本",
      email: {
        to: "manager@yourclinic.com",
        cc: "",
        subject: "护理员ID提取测试 - {{AIDE_ID_ONLY}}",
        body: `<p style="font-family: Arial; font-size: 14px;">你好,</p><p style="font-family: Arial; font-size: 14px;">从页面抓取到的原始文本是 <strong>{{AIDE_ID_RAW}}</strong>, 经过处理后，我们只提取了ID: <strong>{{AIDE_ID_ONLY}}</strong>。</p>`,
      },
      dataFields: [
        {
          key: "{{AIDE_ID_RAW}}",
          selector: "#ctl00_ContentPlaceHolder1_uxlblInfoAideInitials",
          process_type: "",
          process_rule: "",
        },
        {
          key: "{{AIDE_ID_ONLY}}",
          selector: "#ctl00_ContentPlaceHolder1_uxlblInfoAideInitials",
          process_type: "regex",
          process_rule: "\\d+",
        },
      ],
    },
  ];

  let templates = [];

  function findAndProcessElementText(field) {
    let value = findElementTextInFrames(field.selector);
    if (value && field.process_type && field.process_rule) {
      try {
        if (field.process_type === "regex") {
          const match = value.match(new RegExp(field.process_rule));
          value = match ? match[1] || match[0] : null;
        }
      } catch (e) {
        console.error(`处理规则执行失败 for key ${field.key}:`, e);
        return null;
      }
    }
    return value;
  }

  function findElementTextInFrames(selector) {
    function search(doc) {
      try {
        const element = doc.querySelector(selector);
        if (element) {
          return (
            element.textContent.trim() ||
            element.value.trim() ||
            element.innerText.trim()
          );
        }
        const iframes = doc.querySelectorAll("iframe");
        for (const iframe of iframes) {
          const result = search(
            iframe.contentDocument || iframe.contentWindow.document
          );
          if (result) return result;
        }
      } catch (e) {}
      return null;
    }
    return search(window.document);
  }

  function generateAndOpenEmail(template) {
    let { to, cc, subject, body } = template.email;
    let missingFields = [];
    for (const field of template.dataFields) {
      const value = findAndProcessElementText(field);
      const placeholder = new RegExp(
        field.key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
        "g"
      );
      if (value !== null && value !== "") {
        to = to.replace(placeholder, value);
        cc = cc.replace(placeholder, value);
        subject = subject.replace(placeholder, value);
        body = body.replace(placeholder, value);
      } else {
        missingFields.push(field.key);
      }
    }
    if (missingFields.length > 0) {
      alert(
        `无法生成邮件，因为以下信息未在页面上找到或处理失败：\n${missingFields.join(
          ", \n"
        )}`
      );
      return;
    }
    const baseUrl = "https://outlook.office.com/mail/deeplink/compose";
    const params = [
      `to=${encodeURIComponent(to)}`,
      `cc=${encodeURIComponent(cc)}`,
      `subject=${encodeURIComponent(subject)}`,
      `body=${encodeURIComponent(body)}`,
    ].join("&");
    window.open(`${baseUrl}?${params}`, "_blank");
  }

  function createUI() {
    GM_addStyle(`
            #email-assistant-btn { position: fixed; bottom: 20px; right: 20px; z-index: 9999; width: 50px; height: 50px; background-color: #0078d4; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.3); transition: transform 0.2s ease-in-out; }
            #email-assistant-btn:hover { transform: scale(1.1); }
            #email-assistant-menu { position: fixed; bottom: 80px; right: 20px; z-index: 9998; width: 250px; background-color: #f4f4f4; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); border: 1px solid #ccc; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
            .assistant-menu-item, .assistant-settings-btn { padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; text-align: left; font-size: 14px; transition: background-color 0.2s, color 0.2s; }
            .assistant-menu-item:hover { background-color: #0078d4; color: white; }
            .assistant-settings-btn { background-color: #6c757d; color: white; text-align: center; margin-top: 5px; }
            .assistant-settings-btn:hover { background-color: #5a6268; }
            #assistant-settings-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; }
            .modal-content { background-color: #fff; padding: 20px; border-radius: 8px; width: 90%; max-width: 900px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; }
            .template-editor, .template-list-item { margin-bottom: 15px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
            .template-list-item { display: flex; justify-content: space-between; align-items: center; }
            .template-editor label { display: block; margin-top: 10px; font-weight: bold; }
            .template-editor input { width: 98%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
            .data-fields-container { margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px; }
            .data-field-row { display: grid; grid-template-columns: 1fr 2fr 1fr 1fr 40px; gap: 10px; margin-bottom: 8px; align-items: center; }
            .data-field-row input { width: 100%; box-sizing: border-box; padding: 6px; }
            .modal-actions button, .template-actions button, .field-actions button { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; background-color: #0078d4; color: white; margin-right: 10px; }
            .btn-delete { background-color: #dc3545; }
            .btn-secondary { background-color: #6c757d; }
            .btn-delete-field { background-color: #dc3545; color: white; border: none; border-radius: 50%; width: 28px; height: 28px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; }
        `);
    const assistantButton = document.createElement("div");
    assistantButton.id = "email-assistant-btn";
    assistantButton.textContent = "📧";
    assistantButton.title = "邮件助手";
    assistantButton.onclick = toggleMainMenu;
    document.body.appendChild(assistantButton);
    const mainMenu = document.createElement("div");
    mainMenu.id = "email-assistant-menu";
    mainMenu.style.display = "none";
    document.body.appendChild(mainMenu);
    renderMainMenu();
  }

  function toggleMainMenu() {
    const menu = document.getElementById("email-assistant-menu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  }

  function renderMainMenu() {
    const menu = document.getElementById("email-assistant-menu");
    if (!menu) return;
    menu.innerHTML = "";
    templates.forEach((template) => {
      const item = document.createElement("button");
      item.className = "assistant-menu-item";
      item.textContent = template.name;
      item.onclick = () => {
        generateAndOpenEmail(template);
        toggleMainMenu();
      };
      menu.appendChild(item);
    });
    const settingsButton = document.createElement("button");
    settingsButton.className = "assistant-settings-btn";
    settingsButton.textContent = "⚙️ 设置";
    settingsButton.onclick = openSettingsModal;
    menu.appendChild(settingsButton);
  }

  function openSettingsModal() {
    if (document.getElementById("assistant-settings-modal")) return;
    const modal = document.createElement("div");
    modal.id = "assistant-settings-modal";
    modal.innerHTML = `
            <div class="modal-content">
                <div id="template-list-container">
                     <h2>邮件模板管理</h2>
                    <div id="template-list"></div>
                    <div class="modal-actions" style="margin-top: 20px;">
                        <button id="add-new-template-btn">＋ 新增模板</button>
                    </div>
                </div>
                <div id="template-editor-container" style="display:none;"></div>
                 <div class="modal-actions" style="margin-top: 20px; text-align: right; border-top: 1px solid #eee; padding-top: 15px;">
                    <button id="close-settings-btn" class="btn-secondary">关闭</button>
                </div>
            </div>`;
    document.body.appendChild(modal);
    document.getElementById("add-new-template-btn").onclick = () =>
      showTemplateEditor();
    document.getElementById("close-settings-btn").onclick = closeSettingsModal;
    renderTemplateList();
  }

  function closeSettingsModal() {
    const modal = document.getElementById("assistant-settings-modal");
    if (modal) modal.remove();
    renderMainMenu();
  }

  function renderTemplateList() {
    const listContainer = document.getElementById("template-list");
    listContainer.innerHTML = "";
    templates.forEach((template) => {
      const item = document.createElement("div");
      item.className = "template-list-item";
      item.innerHTML = `<span>${template.name}</span>
                <div class="template-actions">
                    <button data-id="${template.id}" class="btn-edit">编辑</button>
                    <button data-id="${template.id}" class="btn-delete">删除</button>
                </div>`;
      listContainer.appendChild(item);
    });
    listContainer
      .querySelectorAll(".btn-edit")
      .forEach(
        (btn) => (btn.onclick = (e) => showTemplateEditor(e.target.dataset.id))
      );
    listContainer
      .querySelectorAll(".btn-delete")
      .forEach(
        (btn) => (btn.onclick = (e) => deleteTemplate(e.target.dataset.id))
      );
  }

  function showTemplateEditor(templateId = null) {
    const isEditing = templateId !== null;
    const template = isEditing
      ? templates.find((t) => t.id === templateId)
      : { dataFields: [] };
    document.getElementById("template-list-container").style.display = "none";
    const editorContainer = document.getElementById(
      "template-editor-container"
    );
    editorContainer.style.display = "block";
    editorContainer.innerHTML = `
            <div class="template-editor">
                <h3>${isEditing ? "编辑" : "新增"}模板</h3>
                <label>模板名称:</label><input type="text" id="tpl-name" value="${
                  template.name || ""
                }">
                <label>收件人 (To):</label><input type="text" id="tpl-to" value="${
                  template.email?.to || ""
                }">
                <label>抄送 (CC):</label><input type="text" id="tpl-cc" value="${
                  template.email?.cc || ""
                }">
                <label>主题:</label><input type="text" id="tpl-subject" value="${
                  template.email?.subject || ""
                }">
                <label>正文 (富文本编辑器):</label><textarea id="tpl-body">${
                  template.email?.body?.trim() || ""
                }</textarea>
                <div class="data-fields-container">
                    <h4>数据字段</h4>
                    <div id="data-fields-list"></div>
                    <div class="field-actions" style="margin-top:10px;"><button id="add-field-btn">＋ 添加字段</button></div>
                </div>
                <div class="modal-actions" style="margin-top: 20px;">
                    <button id="save-template-btn">保存</button>
                    <button id="cancel-edit-btn" class="btn-secondary">取消</button>
                </div>
            </div>`;

    const fieldsList = document.getElementById("data-fields-list");
    const header = document.createElement("div");
    header.className = "data-field-row";
    header.innerHTML = `<strong>占位符</strong><strong>CSS选择器</strong><strong>处理类型</strong><strong>规则/表达式</strong><strong>操作</strong>`;
    fieldsList.appendChild(header);
    template.dataFields.forEach((field) => addDataFieldRow(fieldsList, field));
    document.getElementById("add-field-btn").onclick = () =>
      addDataFieldRow(fieldsList);
    document.getElementById("save-template-btn").onclick = () =>
      saveTemplate(templateId);
    document.getElementById("cancel-edit-btn").onclick = () => {
      tinymce.remove("#tpl-body");
      editorContainer.style.display = "none";
      document.getElementById("template-list-container").style.display =
        "block";
    };

    setTimeout(() => {
      if (typeof tinymce === "undefined") {
        alert("TinyMCE未能成功加载，富文本编辑器不可用。");
        return;
      }
      tinymce.init({
        selector: "#tpl-body",
        skin: false,
        content_css: false,
        content_style: tinyMceCss.content,
        // language: 'en', // Removed as English is default and doesn't need a language pack
        plugins:
          "lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount",
        toolbar:
          "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | charmap | removeformat",
        menubar: false,
        height: 300,
      });
    }, 100);
  }

  function addDataFieldRow(container, field = {}) {
    const row = document.createElement("div");
    row.className = "data-field-row";
    row.innerHTML = `
            <input type="text" placeholder="e.g. {{NAME}}" value="${
              field.key || ""
            }">
            <input type="text" placeholder="e.g. #name" value="${
              field.selector || ""
            }">
            <input type="text" placeholder="e.g. regex" value="${
              field.process_type || ""
            }">
            <input type="text" placeholder="e.g. \\d+" value="${
              field.process_rule || ""
            }">
            <button class="btn-delete-field">X</button>`;
    container.appendChild(row);
    row.querySelector(".btn-delete-field").onclick = () => row.remove();
  }

  function saveTemplate(templateId) {
    const isEditing = templateId !== null;
    const bodyContent = tinymce.get("tpl-body").getContent();
    const updatedTemplate = {
      id: isEditing ? templateId : `tpl_${Date.now()}`,
      name: document.getElementById("tpl-name").value.trim(),
      email: {
        to: document.getElementById("tpl-to").value.trim(),
        cc: document.getElementById("tpl-cc").value.trim(),
        subject: document.getElementById("tpl-subject").value.trim(),
        body: bodyContent,
      },
      dataFields: [],
    };
    if (!updatedTemplate.name) {
      alert("模板名称不能为空!");
      return;
    }
    document
      .querySelectorAll("#data-fields-list .data-field-row:not(:first-child)")
      .forEach((row) => {
        const inputs = row.querySelectorAll("input");
        const key = inputs[0].value.trim();
        const selector = inputs[1].value.trim();
        if (key && selector) {
          updatedTemplate.dataFields.push({
            key,
            selector,
            process_type: inputs[2].value.trim(),
            process_rule: inputs[3].value.trim(),
          });
        }
      });
    if (isEditing) {
      templates = templates.map((t) =>
        t.id === templateId ? updatedTemplate : t
      );
    } else {
      templates.push(updatedTemplate);
    }
    GM.setValue("email_assistant_templates", templates).then(() => {
      tinymce.remove("#tpl-body");
      document.getElementById("template-editor-container").style.display =
        "none";
      document.getElementById("template-list-container").style.display =
        "block";
      renderTemplateList();
      alert("模板保存成功!");
    });
  }

  function deleteTemplate(templateId) {
    if (confirm("确定要删除这个模板吗?")) {
      templates = templates.filter((t) => t.id !== templateId);
      GM.setValue("email_assistant_templates", templates).then(() => {
        renderTemplateList();
        alert("删除成功!");
      });
    }
  }

  async function init() {
    try {
      const jsPromise = loadAndInjectJsBundle();
      const cssPromise = loadCssBundle();

      // Wait for both bundles to be ready
      const [_, css] = await Promise.all([jsPromise, cssPromise]);

      // Store CSS and inject the UI part
      tinyMceCss = css;
      GM_addStyle(tinyMceCss.ui);

      // Load user configuration
      templates = await GM.getValue(
        "email_assistant_templates",
        DEFAULT_CONFIG
      );
      if (!templates || templates.length === 0) {
        templates = DEFAULT_CONFIG;
      }

      // Create the UI
      createUI();
    } catch (error) {
      alert("邮件助手初始化失败，必要资源加载出错。");
    }
  }

  window.addEventListener("load", init, false);
})();
