import { searchHhaByPhone } from "./IncomingCallHandler";

const HIGHLIGHT2CALL_BOOTSTRAP_FLAG = "__HHA_HIGHLIGHT2CALL_BOOTSTRAPPED__";

function isNodeLike(target: EventTarget | null): target is Node {
  return !!target && typeof (target as Node).nodeType === "number";
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

  // --- 脚本核心逻辑 ---

  // 使用类型注解，明确 popup 是一个 DIV 元素或 null
  let popup: HTMLDivElement | null = null;

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
   * 创建并显示功能弹窗
   * @param phoneNumber - 匹配到的电话号码字符串
   * @param mouseEvent - 触发弹窗的 MouseEvent 事件
   */
  function createPopup(phoneNumber: string, mouseEvent: MouseEvent): void {
    removePopup(); // 创建前先移除旧的

    // 创建弹窗容器
    popup = targetDocument.createElement("div");
    popup.id = "highlight-caller-popup";

    // 标准化电话号码（去除非数字，处理 11 位 -> 10 位）
    const cleanedNumber: string = normalizePhoneNumber(phoneNumber);

    // 验证号码长度（必须是 10 位）
    if (cleanedNumber.length !== 10) {
      console.log(
        "[Highlight2Call] 号码长度不正确，跳过弹窗:",
        phoneNumber,
        "->",
        cleanedNumber
      );
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

    targetDocument.body?.appendChild(popup);

    // --- 智能定位弹窗 ---
    const popupRect: DOMRect = popup.getBoundingClientRect();
    let top: number = mouseEvent.clientY + 15;
    let left: number = mouseEvent.clientX;

    // 防止弹窗超出视窗底部
    if (top + popupRect.height > targetWindow.innerHeight) {
      top = mouseEvent.clientY - popupRect.height - 15;
    }
    // 防止弹窗超出视窗右侧
    if (left + popupRect.width > targetWindow.innerWidth) {
      left = targetWindow.innerWidth - popupRect.width - 10;
    }

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;

    // --- 事件绑定 ---
    // 使用 <HTMLDivElement> 类型断言，确保 querySelector 返回正确的类型
    const closeButton = popup.querySelector<HTMLDivElement>(".hcp-close-btn");
    if (closeButton) {
      closeButton.addEventListener("click", removePopup);
    }

    const actionButtons =
      popup.querySelectorAll<HTMLAnchorElement>("a.hcp-button");
    actionButtons.forEach((btn) => {
      // 点击后延时关闭弹窗，确保链接跳转可以被触发
      btn.addEventListener("click", () => setTimeout(removePopup, 100));
    });

    // HHA 搜索按钮事件
    const searchHhaBtn =
      popup.querySelector<HTMLButtonElement>(".hcp-search-hha");
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

  function handleSelection(mouseSnapshot: {
    clientX: number;
    clientY: number;
    target: EventTarget | null;
  }): void {
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
    const selectedText = selectedTextFromDocument || selectedTextFromEditable;

    if (!selectedText) {
      removePopup();
      return;
    }

    const match: RegExpMatchArray | null = selectedText.match(PHONE_REGEX);
    if (!match) {
      removePopup();
      return;
    }

    const mouseEvent = {
      clientX: mouseSnapshot.clientX,
      clientY: mouseSnapshot.clientY,
    } as MouseEvent;
    createPopup(match[0], mouseEvent);
  }

  // 监听全局的 mouseup 事件
  targetDocument.addEventListener(
    "mouseup",
    (e: MouseEvent) => {
      const mouseSnapshot = {
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target,
      };

      targetWindow.setTimeout(() => handleSelection(mouseSnapshot), 0);
    },
    true
  );

  // 监听全局的 mousedown 事件，实现点击外部关闭弹窗
  targetDocument.addEventListener(
    "mousedown",
    (e: MouseEvent) => {
      if (popup && isNodeLike(e.target) && !popup.contains(e.target)) {
        removePopup();
      }
    },
    true
  );

  console.log("划词拨号/发短信助手 已启动。");
};
