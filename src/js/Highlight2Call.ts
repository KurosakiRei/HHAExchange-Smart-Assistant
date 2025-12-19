import { searchHhaByPhone } from "./IncomingCallHandler";

export const highlight2Call = () => {
  // --- 配置区域 ---
  // 用于匹配电话号码的正则表达式
  const PHONE_REGEX: RegExp = /(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/;

  // --- 脚本核心逻辑 ---

  // 使用类型注解，明确 popup 是一个 DIV 元素或 null
  let popup: HTMLDivElement | null = null;

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
    popup = document.createElement("div");
    popup.id = "highlight-caller-popup";

    // 清理电话号码，只保留数字
    const cleanedNumber: string = phoneNumber.replace(/\D/g, "");

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
    const popupRect: DOMRect = popup.getBoundingClientRect();
    let top: number = mouseEvent.clientY + 15;
    let left: number = mouseEvent.clientX;

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

  // 监听全局的 mouseup 事件
  document.addEventListener("mouseup", (e: MouseEvent) => {
    // 如果事件目标在弹窗内，则不处理
    if (popup && popup.contains(e.target as Node)) {
      return;
    }

    const selectedText: string = window.getSelection()?.toString().trim() ?? "";

    if (selectedText) {
      const match: RegExpMatchArray | null = selectedText.match(PHONE_REGEX);

      if (match) {
        const phoneNumber: string = match[0];
        createPopup(phoneNumber, e);
      } else {
        removePopup();
      }
    } else {
      removePopup();
    }
  });

  // 监听全局的 mousedown 事件，实现点击外部关闭弹窗
  document.addEventListener("mousedown", (e: MouseEvent) => {
    if (popup && !popup.contains(e.target as Node)) {
      removePopup();
    }
  });

  console.log("划词拨号/发短信助手 已启动。");
};
