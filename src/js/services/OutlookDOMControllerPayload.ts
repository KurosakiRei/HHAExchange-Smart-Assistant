export const OUTLOOK_DOM_CONTROLLER_ID = "hha-outlook-dom-controller";

export const OutlookDOMControllerPayload = `
(function() {
  'use strict';
  
  const SELECTORS = {
    // 新旧 Outlook 使用不同的 aria-label，全部覆盖
    newMailButton: 'button[aria-label="New mail"], button[aria-label="New message"], div[role="button"][aria-label="New mail"], [data-testid="newMailButton"]',
    toField: 'div[aria-label="To"]',
    toFieldAlt: '[role="combobox"][aria-label="To"], input[aria-label="To"]',
    ccButton: 'button[aria-label="Cc"]',
    ccField: 'div[aria-label="Cc"]',
    subjectField: 'input[placeholder="Add a subject"], input[aria-label="Add a subject"], input[id$="_SUBJECT"]',
    bodyEditor: 'div[aria-label="Message body"], [role="textbox"][aria-label="Message body"], .ck-content',
    sendButton: 'button[aria-label="Send"]',
  };
  
  // fillRecipientField is async to support per-address confirmation delays
  async function fillRecipientField(selector, address) {
    const field = document.querySelector(selector);
    if (!field) {
      console.warn('[OutlookDOMController] Field not found:', selector);
      return false;
    }
    field.focus();

    if (field.tagName === 'INPUT') {
      // Subject field is a React-controlled <input>.
      // execCommand('insertText') updates both the DOM value AND React's _valueTracker,
      // so React sees no delta and its internal state stays at "". On next re-render
      // React resets the DOM value back to "" — that's why subject disappears on click.
      // Fix: reset _valueTracker to "" AFTER setting the value so React detects the change.
      field.select();
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      if (nativeSetter) nativeSetter.call(field, address);
      // Reset tracker so React sees: tracked="" vs current=address → fires onChange
      if (field._valueTracker) field._valueTracker.setValue('');
      field.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: address, inputType: 'insertText' }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      // Blur forces Outlook's draft store to commit the value immediately.
      // Without this, the draft store still has "" and re-renders reset the field.
      field.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    } else if (field.isContentEditable) {
      // Modern Outlook uses contenteditable divs for To/CC addressing.
      // Strategy: type each address, wait for Outlook's floating suggestion dropdown,
      // then click the first suggestion button. Fall back to Enter if no suggestion appears.
      const emails = address.split(/[,;]\s*/);
      for (let i = 0; i < emails.length; i++) {
        const singleEmail = emails[i].trim();
        if (!singleEmail) continue;

        // Re-query each iteration — DOM refs shift after each confirmation
        const currentField = document.querySelector(selector);
        if (!currentField) break;

        // Use click() not focus() — triggers React's synthetic mouse/focus events
        currentField.click();
        await sleep(50);

        document.execCommand('insertText', false, singleEmail);
        await sleep(300); // Wait for Outlook's floating suggestion dropdown to render

        // Outlook renders suggestions in: [role="listbox"] > ul[class*="FloatingSuggestions"] > li > div > button[role="option"]
        const suggestionBtn = document.querySelector(
          'ul[class*="FloatingSuggestions"] button[role="option"]'
        );
        if (suggestionBtn) {
          suggestionBtn.click();
          await sleep(200);
        } else {
          // No suggestion dropdown (external/unknown email) — confirm with Enter
          currentField.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true
          }));
          await sleep(50);
          currentField.dispatchEvent(new KeyboardEvent('keyup', {
            key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true
          }));
          await sleep(300);
        }
      }
    } else {
      field.textContent = address;
    }

    console.log('[OutlookDOMController] Filled field:', selector, address);
    return true;
  }
  
  function fillBodyEditor(htmlBody) {
    const editor = document.querySelector(SELECTORS.bodyEditor);
    if (!editor) {
      console.warn('[OutlookDOMController] Body editor not found');
      return false;
    }
    editor.focus();
    
    // Put cursor at the very beginning of the editor
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      
      // Attempt to wrap content in a paragraph and insert before the signature
      if (editor.firstChild) {
        range.setStartBefore(editor.firstChild);
        range.collapse(true);
      } else {
        range.selectNodeContents(editor);
        range.collapse(true);
      }
      
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Insert without wiping existing text
    document.execCommand('insertHTML', false, htmlBody + '<br><br>');
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('[OutlookDOMController] Filled body (prepended)');
    return true;
  }
  
  async function executeMailTask(task) {
    try {
      let subjectInput = document.querySelector(SELECTORS.subjectField);
      let toInput = document.querySelector(SELECTORS.toField) || document.querySelector(SELECTORS.toFieldAlt);
      let sendButton = document.querySelector(SELECTORS.sendButton);

      // Require Send button to confirm an actual compose window is open (not just inbox read-mode)
      let isDraftEmpty = false;
      if (subjectInput && toInput && sendButton) {
        const subjStr = subjectInput.value || '';
        const toStr = toInput.textContent ? toInput.textContent.trim() : (toInput.value || '');
        if (subjStr === '' && toStr === '') {
          isDraftEmpty = true;
          console.log('[OutlookDOMController] Found empty draft, reusing...');
        }
      }

      if (!isDraftEmpty) {
        // 新 Outlook 用 React 渲染，按钮可能在 document-idle 后才挂载，用 waitForElement 等待
        let newMailBtn;
        try {
          console.log('[OutlookDOMController] Waiting for New mail button...');
          newMailBtn = await waitForElement(SELECTORS.newMailButton, 8000);
        } catch (e) {
          throw new Error('New mail button not found after 8s. Selectors tried: ' + SELECTORS.newMailButton);
        }
        
        newMailBtn.click();
        await waitForElement(SELECTORS.subjectField, 5000);
        await sleep(500); // Allow React to finish mounting compose window event handlers
      }
      
      if (task.to) {
        let toFilled = false;
        for (const sel of [SELECTORS.toField, SELECTORS.toFieldAlt]) {
          if (document.querySelector(sel)) {
            await fillRecipientField(sel, task.to);
            toFilled = true;
            break;
          }
        }
        if (!toFilled) console.warn('[OutlookDOMController] To field not found with any selector');
      }
      
      if (task.cc) {
        const ccBtn = document.querySelector(SELECTORS.ccButton);
        if (ccBtn) { ccBtn.click(); await sleep(300); }
        await fillRecipientField(SELECTORS.ccField, task.cc);
      }
      
      if (task.subject) {
        // Re-focus subject after To/CC fills so the field is active for our setter
        const subjectField = document.querySelector(SELECTORS.subjectField);
        if (subjectField) {
          subjectField.focus();
          await sleep(50);
        }
        await fillRecipientField(SELECTORS.subjectField, task.subject);
        await sleep(100);
      }
      
      if (task.body) {
        fillBodyEditor(task.body);
      }

      if (task.attachments && task.attachments.length > 0) {
        await attachFiles(task.attachments);
      }
      
      notifyTaskComplete('SUCCESS');
    } catch (error) {
      console.error('[OutlookDOMController] Error:', error);
      notifyTaskComplete('FAILED', error.message);
    }
  }
  
  /**
   * Attach files to the Outlook compose window.
   * Decodes base64 attachments and injects them via the hidden file input Outlook exposes.
   * Falls back to clipboard (image types only) if the file input is not found.
   */
  async function attachFiles(attachments) {
    const files = attachments.map(att => {
      const binary = atob(att.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new File([bytes], att.name, { type: att.type });
    });

    // Wait for the compose toolbar to finish rendering
    await sleep(800);

    // Outlook Web exposes two types of file inputs in the Ribbon:
    //   1. input[accept="image/*"]  -> inline picture insertion (NOT what we want)
    //   2. input (no accept / empty accept) -> file attachment (what we want)
    // Use :not([accept="image/*"]) to guarantee we never hit the inline-image input.
    var fileInput = /** @type {HTMLInputElement|null} */ (document.querySelector(
      'input[type="file"][data-testid="local-computer-filein"]:not([accept="image/*"])'
    ));

    if (fileInput) {
      const dt = new DataTransfer();
      files.forEach(f => dt.items.add(f));
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      fileInput.dispatchEvent(new Event('input',  { bubbles: true }));
      console.log('[OutlookDOMController] Attached', files.length, 'file(s) as attachment(s) via', fileInput.getAttribute('data-testid'));
      await sleep(1000);
    } else {
      console.warn('[OutlookDOMController] Attachment file input not found — files not attached');
    }
  }

  function waitForElement(selector, timeout) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        const el = document.querySelector(selector);
        if (el) {
          resolve(el);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error("Element " + selector + " not found within " + timeout + "ms"));
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  }
  
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
  
  function notifyTaskComplete(status, error = null) {
    document.dispatchEvent(new CustomEvent('hha-outlook-task-complete', {
      detail: { status, error }
    }));
  }
  
  window.HHAOutlookController = {
    executeMailTask
  };
  
  console.log('[OutlookDOMController] Loaded and ready');
})();
`;
