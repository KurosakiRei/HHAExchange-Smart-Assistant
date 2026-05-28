import { searchHhaById, searchHhaByPhone } from "./IncomingCallHandler";

const HIGHLIGHT2CALL_BOOTSTRAP_FLAG = "__HHA_HIGHLIGHT2CALL_BOOTSTRAPPED__";

function isNodeLike(target: EventTarget | null): target is Node {
  return !!target && typeof (target as Node).nodeType === "number";
}

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as {
    tagName?: string;
    isContentEditable?: boolean;
  } | null;

  if (!el) {
    return false;
  }

  const tagName = el.tagName?.toUpperCase();
  return (
    tagName === "INPUT" || tagName === "TEXTAREA" || !!el.isContentEditable
  );
}

export const highlight2Call = (
  targetWindow: Window = window,
  targetDocument: Document = document
) => {
  if ((targetWindow as any)[HIGHLIGHT2CALL_BOOTSTRAP_FLAG]) {
    return;
  }
  (targetWindow as any)[HIGHLIGHT2CALL_BOOTSTRAP_FLAG] = true;

  // --- 配置区域 ---
  // 用于匹配电话号码的正则表达式
  // 支持多种格式: 1234567890, 123-456-7890, (123) 456-7890, 123.456.7890, +1 123-456-7890 等
  const PHONE_REGEX: RegExp =
    /(?:\+?1[\s().-]*)?\(?\d{3}\)?[\s().-]*\d{3}[\s().-]*\d{4}/;
  const HHA_ID_REGEX: RegExp = /\b(?:AHC|AMD)-\d{4,6}\b/i;

  /**
   * 标准化电话号码：去除非数字字符，处理 11 位以 1 开头的号码
   * @param phoneNumber - 匹配到的电话号码字符串
   * @returns 标准化后的 10 位纯数字号码
   */
  function normalizePhoneNumber(phoneNumber: string): string {
    let digits = phoneNumber.replace(/\D/g, "");
    // 如果是 11 位且以 1 开头（美国国家代码），去掉开头的 1
    if (digits.length === 11 && digits.startsWith("1")) {
      digits = digits.substring(1);
    }
    return digits;
  }

  function normalizeHhaId(rawId: string): string {
    return rawId.trim().toUpperCase();
  }

  function applyPopupStyles(
    container: HTMLDivElement,
    titleEl: HTMLDivElement,
    numberEl: HTMLDivElement,
    closeButton: HTMLDivElement,
    actionsContainer: HTMLDivElement,
    fullActionsContainer: HTMLDivElement,
    primaryButtons: (HTMLAnchorElement | HTMLButtonElement)[]
  ): void {
    container.style.position = "fixed";
    container.style.zIndex = "999999";
    container.style.backgroundColor = "#ffffff";
    container.style.border = "1px solid #dcdcdc";
    container.style.borderRadius = "8px";
    container.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    container.style.fontFamily =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    container.style.fontSize = "14px";
    container.style.color = "#333";
    container.style.padding = "12px";
    container.style.minWidth = "220px";

    titleEl.style.fontWeight = "600";
    titleEl.style.fontSize = "16px";
    titleEl.style.marginBottom = "8px";

    numberEl.style.backgroundColor = "#f0f0f0";
    numberEl.style.padding = "4px 8px";
    numberEl.style.borderRadius = "4px";
    numberEl.style.marginBottom = "12px";
    numberEl.style.textAlign = "center";
    numberEl.style.fontWeight = "500";

    actionsContainer.style.display = "flex";
    actionsContainer.style.justifyContent = "space-around";
    actionsContainer.style.gap = "10px";

    fullActionsContainer.style.marginTop = "10px";

    primaryButtons.forEach((btn) => {
      btn.style.display = "inline-block";
      btn.style.textDecoration = "none";
      btn.style.color = "#fff";
      btn.style.padding = "8px 12px";
      btn.style.borderRadius = "5px";
      btn.style.transition = "background-color 0.2s";
      btn.style.flexGrow = "1";
      btn.style.textAlign = "center";
      btn.style.border = "none";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "14px";
      btn.style.backgroundColor = "#007bff";
    });

    closeButton.style.position = "absolute";
    closeButton.style.top = "5px";
    closeButton.style.right = "8px";
    closeButton.style.fontSize = "20px";
    closeButton.style.color = "#aaa";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontWeight = "bold";

    closeButton.addEventListener("mouseenter", () => {
      closeButton.style.color = "#333";
    });
    closeButton.addEventListener("mouseleave", () => {
      closeButton.style.color = "#aaa";
    });
  }

  function createPopupShell(
    titleText: string,
    valueText: string,
    mouseEvent: MouseEvent
  ): {
    container: HTMLDivElement;
    actionsContainer: HTMLDivElement;
    fullActionsContainer: HTMLDivElement;
  } {
    removePopup();

    popup = targetDocument.createElement("div");
    popup.id = "highlight-caller-popup";

    const title = targetDocument.createElement("div");
    title.className = "hcp-title";
    title.textContent = titleText;

    const number = targetDocument.createElement("div");
    number.className = "hcp-number";
    number.textContent = valueText;

    const actions = targetDocument.createElement("div");
    actions.className = "hcp-actions";

    const fullActions = targetDocument.createElement("div");
    fullActions.className = "hcp-actions-full";

    const closeButton = targetDocument.createElement("div");
    closeButton.className = "hcp-close-btn";
    closeButton.title = "关闭";
    closeButton.textContent = "×";

    popup.appendChild(title);
    popup.appendChild(number);
    popup.appendChild(actions);
    popup.appendChild(fullActions);
    popup.appendChild(closeButton);

    applyPopupStyles(
      popup,
      title,
      number,
      closeButton,
      actions,
      fullActions,
      []
    );

    targetDocument.body?.appendChild(popup);

    const popupRect: DOMRect = popup.getBoundingClientRect();
    let top: number = mouseEvent.clientY + 15;
    let left: number = mouseEvent.clientX;

    if (top + popupRect.height > targetWindow.innerHeight) {
      top = mouseEvent.clientY - popupRect.height - 15;
    }
    if (left + popupRect.width > targetWindow.innerWidth) {
      left = targetWindow.innerWidth - popupRect.width - 10;
    }

    popup.style.top = `${Math.max(8, top)}px`;
    popup.style.left = `${Math.max(8, left)}px`;

    closeButton.addEventListener("click", () => {
      markPopupInteraction();
      clearSelection();
      removePopup();
    });

    return {
      container: popup,
      actionsContainer: actions,
      fullActionsContainer: fullActions,
    };
  }

  // --- 脚本核心逻辑 ---

  // 使用类型注解，明确 popup 是一个 DIV 元素或 null
  let popup: HTMLDivElement | null = null;
  let suppressMouseUpUntil = 0;
  let lastHandledMouseUpEvent: MouseEvent | null = null;
  let lastHandledMouseDownEvent: MouseEvent | null = null;

  function markPopupInteraction(): void {
    suppressMouseUpUntil = Date.now() + 400;
  }

  function clearSelection(): void {
    try {
      targetWindow.getSelection()?.removeAllRanges();
    } catch {
      // ignore selection API errors
    }
  }

  function normalizeSelectionTextForMatch(text: string): string {
    return text
      .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, "")
      .replace(/[\u00a0\u2007\u202f]/g, " ")
      .replace(/－/g, "-")
      .replace(/[０-９]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 0xfee0)
      )
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");
  }

  function getSelectedTextFromEditableTarget(
    target: EventTarget | null
  ): string {
    const el = target as {
      tagName?: string;
      value?: string;
      selectionStart?: number | null;
      selectionEnd?: number | null;
    } | null;
    if (!el) {
      return "";
    }

    const tagName = el.tagName?.toUpperCase();
    if (tagName !== "INPUT" && tagName !== "TEXTAREA") {
      return "";
    }

    const value = typeof el.value === "string" ? el.value : "";
    const start =
      typeof el.selectionStart === "number" ? el.selectionStart : null;
    const end = typeof el.selectionEnd === "number" ? el.selectionEnd : null;
    if (start === null || end === null || end <= start) {
      return "";
    }

    return value.slice(start, end).trim();
  }

  /**
   * 从 DOM 中移除已存在的弹窗
   */
  function removePopup(): void {
    if (popup) {
      popup.remove();
      popup = null;
    }
  }

  /**
   * 创建并显示电话号码功能弹窗
   */
  function createPhonePopup(phoneNumber: string, mouseEvent: MouseEvent): void {
    const cleanedNumber: string = normalizePhoneNumber(phoneNumber);
    if (cleanedNumber.length !== 10) {
      console.log(
        "[Highlight2Call] 号码长度不正确，跳过弹窗:",
        phoneNumber,
        "->",
        cleanedNumber
      );
      return;
    }

    const shell = createPopupShell("请选择操作", phoneNumber, mouseEvent);

    const telButton = targetDocument.createElement("a");
    telButton.className = "hcp-button";
    telButton.href = `tel:${cleanedNumber}`;
    telButton.target = "_top";
    telButton.textContent = "📞 打电话";

    const smsButton = targetDocument.createElement("a");
    smsButton.className = "hcp-button";
    smsButton.href = `sms:${cleanedNumber}`;
    smsButton.target = "_top";
    smsButton.textContent = "💬 发短信";

    const searchButton = targetDocument.createElement("button");
    searchButton.className = "hcp-button hcp-search-hha";
    searchButton.textContent = "🔍 在HHAeXchange搜索";
    searchButton.dataset.phone = cleanedNumber;
    searchButton.style.width = "100%";
    searchButton.style.backgroundColor = "#28a745";

    applyPopupStyles(
      shell.container,
      shell.container.querySelector<HTMLDivElement>(".hcp-title")!,
      shell.container.querySelector<HTMLDivElement>(".hcp-number")!,
      shell.container.querySelector<HTMLDivElement>(".hcp-close-btn")!,
      shell.actionsContainer,
      shell.fullActionsContainer,
      [telButton, smsButton, searchButton]
    );
    searchButton.style.backgroundColor = "#28a745";

    telButton.addEventListener("mouseenter", () => {
      telButton.style.backgroundColor = "#0056b3";
    });
    telButton.addEventListener("mouseleave", () => {
      telButton.style.backgroundColor = "#007bff";
    });
    smsButton.addEventListener("mouseenter", () => {
      smsButton.style.backgroundColor = "#0056b3";
    });
    smsButton.addEventListener("mouseleave", () => {
      smsButton.style.backgroundColor = "#007bff";
    });
    searchButton.addEventListener("mouseenter", () => {
      searchButton.style.backgroundColor = "#218838";
    });
    searchButton.addEventListener("mouseleave", () => {
      searchButton.style.backgroundColor = "#28a745";
    });

    shell.actionsContainer.appendChild(telButton);
    shell.actionsContainer.appendChild(smsButton);
    shell.fullActionsContainer.appendChild(searchButton);

    [telButton, smsButton].forEach((btn) => {
      btn.addEventListener("click", () => {
        markPopupInteraction();
        clearSelection();
        targetWindow.setTimeout(removePopup, 100);
      });
    });

    searchButton.addEventListener("click", async () => {
      const phone = searchButton.dataset.phone;
      if (!phone) {
        return;
      }

      markPopupInteraction();
      clearSelection();
      removePopup();
      await searchHhaByPhone(phone);
    });
  }

  /**
   * 创建并显示 ID 搜索弹窗
   */
  function createIdPopup(normalizedId: string, mouseEvent: MouseEvent): void {
    const shell = createPopupShell("ID 快速搜索", normalizedId, mouseEvent);

    const searchButton = targetDocument.createElement("button");
    searchButton.className = "hcp-button hcp-search-hha";
    searchButton.textContent = "🔍 在HHAeXchange搜索";
    searchButton.dataset.id = normalizedId;
    searchButton.style.width = "100%";
    searchButton.style.backgroundColor = "#28a745";

    applyPopupStyles(
      shell.container,
      shell.container.querySelector<HTMLDivElement>(".hcp-title")!,
      shell.container.querySelector<HTMLDivElement>(".hcp-number")!,
      shell.container.querySelector<HTMLDivElement>(".hcp-close-btn")!,
      shell.actionsContainer,
      shell.fullActionsContainer,
      [searchButton]
    );
    searchButton.style.backgroundColor = "#28a745";

    searchButton.addEventListener("mouseenter", () => {
      searchButton.style.backgroundColor = "#218838";
    });
    searchButton.addEventListener("mouseleave", () => {
      searchButton.style.backgroundColor = "#28a745";
    });

    shell.actionsContainer.style.display = "none";
    shell.fullActionsContainer.appendChild(searchButton);

    searchButton.addEventListener("click", async () => {
      const id = searchButton.dataset.id;
      if (!id) {
        return;
      }

      markPopupInteraction();
      clearSelection();
      removePopup();
      await searchHhaById(id);
    });
  }

  function handleSelection(mouseSnapshot: {
    clientX: number;
    clientY: number;
    target: EventTarget | null;
    selectedTextFromDocumentSnapshot?: string;
    selectedTextFromEditableSnapshot?: string;
  }): void {
    if (Date.now() < suppressMouseUpUntil) {
      return;
    }

    if (
      popup &&
      isNodeLike(mouseSnapshot.target) &&
      popup.contains(mouseSnapshot.target)
    ) {
      return;
    }

    const selectedTextFromDocument: string =
      targetWindow.getSelection()?.toString().trim() ?? "";
    const selectedTextFromEditable: string = getSelectedTextFromEditableTarget(
      mouseSnapshot.target
    );

    const selectedTextFromDocumentFinal =
      selectedTextFromDocument ||
      mouseSnapshot.selectedTextFromDocumentSnapshot ||
      "";
    const selectedTextFromEditableFinal =
      selectedTextFromEditable ||
      mouseSnapshot.selectedTextFromEditableSnapshot ||
      "";

    const selectedText = isEditableTarget(mouseSnapshot.target)
      ? selectedTextFromEditableFinal
      : selectedTextFromDocumentFinal || selectedTextFromEditableFinal;

    if (!selectedText) {
      removePopup();
      return;
    }

    const matchSourceText = normalizeSelectionTextForMatch(selectedText);

    const mouseEvent = {
      clientX: mouseSnapshot.clientX,
      clientY: mouseSnapshot.clientY,
    } as MouseEvent;

    const idMatch: RegExpMatchArray | null =
      matchSourceText.match(HHA_ID_REGEX);
    if (idMatch?.[0]) {
      createIdPopup(normalizeHhaId(idMatch[0]), mouseEvent);
      return;
    }

    const phoneMatch: RegExpMatchArray | null =
      matchSourceText.match(PHONE_REGEX);
    if (phoneMatch?.[0]) {
      createPhonePopup(phoneMatch[0], mouseEvent);
      return;
    }

    removePopup();
  }

  // 以 document capture 为主，window capture 为兜底；通过事件对象去重避免双触发。
  const handleMouseUpCapture = (e: MouseEvent): void => {
    if (lastHandledMouseUpEvent === e) {
      return;
    }
    lastHandledMouseUpEvent = e;

    if (popup && isNodeLike(e.target) && popup.contains(e.target)) {
      markPopupInteraction();
      return;
    }

    const mouseSnapshot = {
      clientX: e.clientX,
      clientY: e.clientY,
      target: e.target,
      selectedTextFromDocumentSnapshot:
        targetWindow.getSelection()?.toString().trim() ?? "",
      selectedTextFromEditableSnapshot: getSelectedTextFromEditableTarget(
        e.target
      ),
    };

    targetWindow.setTimeout(() => handleSelection(mouseSnapshot), 0);
  };

  const handleMouseDownCapture = (e: MouseEvent): void => {
    if (lastHandledMouseDownEvent === e) {
      return;
    }
    lastHandledMouseDownEvent = e;

    if (popup && isNodeLike(e.target) && popup.contains(e.target)) {
      markPopupInteraction();
      return;
    }

    if (popup && isNodeLike(e.target) && !popup.contains(e.target)) {
      removePopup();
    }
  };

  targetWindow.addEventListener("mouseup", handleMouseUpCapture, true);
  targetDocument.addEventListener("mouseup", handleMouseUpCapture, true);
  targetWindow.addEventListener("mousedown", handleMouseDownCapture, true);
  targetDocument.addEventListener("mousedown", handleMouseDownCapture, true);

  console.log("划词拨号/ID 搜索助手 已启动。");
};
