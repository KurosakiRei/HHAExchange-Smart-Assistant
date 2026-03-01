export const OUTLOOK_DOM_CONTROLLER_ID = "hha-outlook-dom-controller";

export const OutlookDOMControllerPayload = `
(function() {
  'use strict';
  
  const SELECTORS = {
    newMailButton: 'button[aria-label="New mail"]',
    toField: 'div[aria-label="To"]',
    toFieldAlt: '[role="combobox"][aria-label="To"], input[aria-label="To"]',
    ccButton: 'button[aria-label="Cc"]',
    ccField: 'div[aria-label="Cc"]',
    subjectField: 'input[placeholder="Add a subject"], input[aria-label="Add a subject"], input[id$="_SUBJECT"]',
    bodyEditor: 'div[aria-label="Message body"], [role="textbox"][aria-label="Message body"], .ck-content',
    sendButton: 'button[aria-label="Send"]',
  };
  
  function fillRecipientField(selector, email) {
    const field = document.querySelector(selector);
    if (!field) {
      console.warn('[OutlookDOMController] Field not found:', selector);
      return false;
    }
    field.focus();
    
    if (field.tagName === 'INPUT') {
      field.value = email;
      // React synthetic event workaround
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      ).set;
      if (nativeInputValueSetter) {
          nativeInputValueSetter.call(field, email);
      }
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (field.isContentEditable) {
      // Modern Outlook uses contenteditable divs for addressing
      document.execCommand('insertText', false, email);
      field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }));
    } else {
      field.textContent = email;
    }
    
    console.log('[OutlookDOMController] Filled field:', selector, email);
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
      
      let isDraftEmpty = false;
      if (subjectInput && toInput) {
        const subjStr = subjectInput.value || '';
        const toStr = toInput.textContent ? toInput.textContent.trim() : (toInput.value || '');
        if (subjStr === '' && toStr === '') {
          isDraftEmpty = true;
          console.log('[OutlookDOMController] Found empty draft, reusing...');
        }
      }

      if (!isDraftEmpty) {
        let newMailBtn = document.querySelector(SELECTORS.newMailButton);
        if (!newMailBtn) {
          console.log('[OutlookDOMController] New mail button not found, trying Home tab...');
          const homeTabs = Array.from(document.querySelectorAll('button[role="tab"]')).filter(el => el.textContent === 'Home');
          if (homeTabs.length > 0) {
            homeTabs[0].click();
            await sleep(500);
            newMailBtn = document.querySelector(SELECTORS.newMailButton);
          }
        }
        
        if (!newMailBtn) {
           throw new Error('New mail button not found even after tab switch');
        }
        
        newMailBtn.click();
        await waitForElement(SELECTORS.subjectField, 5000);
      }
      
      if (task.to) {
        const selectors = [SELECTORS.toField, SELECTORS.toFieldAlt];
        for (const sel of selectors) {
          if (fillRecipientField(sel, task.to)) break;
        }
        await sleep(300);
      }
      
      if (task.cc) {
        const ccBtn = document.querySelector(SELECTORS.ccButton);
        if (ccBtn) ccBtn.click();
        await sleep(300);
        fillRecipientField(SELECTORS.ccField, task.cc);
        await sleep(300);
      }
      
      if (task.subject) {
        fillRecipientField(SELECTORS.subjectField, task.subject);
        await sleep(300);
      }
      
      if (task.body) {
        fillBodyEditor(task.body);
      }
      
      notifyTaskComplete('SUCCESS');
    } catch (error) {
      console.error('[OutlookDOMController] Error:', error);
      notifyTaskComplete('FAILED', error.message);
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
