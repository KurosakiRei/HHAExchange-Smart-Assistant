import { MultiTabPanel } from "../MultiTabPanel";
import { QuickSearchTab } from "../tabs/QuickSearchTab";
import { DateInputTab } from "../tabs/DateInputTab";
import { CSPBypassInjector } from "./CSPBypassInjector";

const OUTLOOK_MINI_STYLE_ID = "hha-outlook-mini-panel-style";
const OUTLOOK_MINI_CONTAINER_ID = "hha-outlook-mini-container";
const OUTLOOK_MINI_HANDLE_ID = "hha-outlook-mini-handle";
const OUTLOOK_MINI_PANEL_HOST_ID = "hha-outlook-mini-panel-host";
const OUTLOOK_MINI_BOOTSTRAP_FLAG = "__HHA_OUTLOOK_MINI_PANEL_BOOTSTRAPPED__";
const OUTLOOK_MINI_WATCHDOG_FLAG = "__HHA_OUTLOOK_MINI_PANEL_WATCHDOG__";
const MINI_HANDLE_SIZE = 48;
const MINI_MARGIN = 6;

const STORAGE = {
  POSITION: "hha_outlook_mini_panel_position",
  PANEL_KEY_PREFIX: "hha_outlook_mini_panel",
  DATE_PRESET: "hha_outlook_mini_date_preset",
} as const;

function isOutlookPage(targetWindow: Window): boolean {
  const hostname = targetWindow.location.hostname.toLowerCase();
  const pathname = targetWindow.location.pathname;
  if (hostname === "outlook.office.com" && pathname.startsWith("/mail"))
    return true;
  if (hostname === "outlook.cloud.microsoft" && pathname.startsWith("/mail"))
    return true;
  if (
    hostname === "webshell.suite.office.com" &&
    !pathname.startsWith("/iframe/")
  )
    return true;
  return false;
}

function resolveBootstrapContext(): {
  hostWindow: Window;
  hostDocument: Document;
} {
  try {
    const topWindow = window.top;
    if (
      topWindow &&
      topWindow !== window &&
      topWindow.location.hostname.toLowerCase() ===
        window.location.hostname.toLowerCase()
    ) {
      return {
        hostWindow: topWindow,
        hostDocument: topWindow.document,
      };
    }
  } catch (_) {
    // Cross-origin top window is not accessible. Fall back to current context.
  }

  return {
    hostWindow: window,
    hostDocument: document,
  };
}

function ensureStyles(targetDocument: Document): void {
  if (targetDocument.getElementById(OUTLOOK_MINI_STYLE_ID)) {
    return;
  }

  const css = `
    .hha-smart-panel {
      position: absolute;
      top: 0;
      width: 680px;
      height: 460px;
      max-height: 80vh;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      color: #333333;
    }

    .hha-smart-panel-header {
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      user-select: none;
    }

    .hha-smart-panel-title {
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hha-smart-panel-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      z-index: 1;
    }

    .hha-smart-content-wrapper {
      flex: 1;
      display: flex;
      overflow: hidden;
      min-height: 0;
      position: relative;
      isolation: isolate;
    }

    .hha-smart-tab-bar {
      width: 100px;
      min-width: 40px;
      background: #f7f8fa;
      border-right: 1px solid #e0e0e0;
      transition: width 0.2s ease;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: relative;
      z-index: 2;
    }

    .hha-smart-tab-bar.collapsed {
      width: 40px;
    }

    .hha-smart-tab-list {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .hha-smart-tab-item {
      position: relative;
      padding: 12px 8px;
      cursor: pointer;
      transition: background 0.15s ease;
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      border-bottom: 1px solid #f0f0f0;
    }

    .hha-smart-tab-item:hover {
      background: #f0f2f5;
    }

    .hha-smart-tab-item.active {
      background: #f0efff;
      color: #667eea;
      font-weight: 500;
    }

    .hha-smart-tab-icon {
      flex-shrink: 0;
      font-size: 18px;
      line-height: 1;
      width: 20px;
      text-align: center;
    }

    .hha-smart-tab-text {
      opacity: 1;
      transition: opacity 0.2s ease;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .hha-smart-tab-text::-webkit-scrollbar {
      width: 0;
      height: 0;
      display: none;
    }

    .hha-smart-tab-bar.collapsed .hha-smart-tab-text {
      opacity: 0;
      width: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .hha-smart-tab-indicator {
      position: absolute;
      left: 0;
      top: 0;
      width: 4px;
      height: 100%;
      background: #667eea;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 1;
    }

    .hha-smart-tab-item.active .hha-smart-tab-indicator {
      opacity: 1;
    }

    .hha-smart-tab-collapse-btn {
      padding: 4px;
      text-align: center;
      cursor: pointer;
      border-top: 1px solid #e0e0e0;
      transition: background 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      position: relative;
      z-index: 10;
    }

    .hha-smart-tab-collapse-btn:hover {
      background: #f0f2f5;
    }

    .hha-smart-collapse-icon {
      display: inline-block;
      transition: transform 0.2s ease;
      font-size: 11px;
      line-height: 1;
      width: 11px;
      height: 11px;
      text-align: center;
      color: #666666;
    }

    .hha-smart-tab-bar.collapsed .hha-smart-collapse-icon {
      transform: rotate(180deg);
    }

    .hha-smart-content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #ffffff;
      min-height: 0;
      position: relative;
      z-index: 1;
    }

    .hha-smart-tab-content {
      display: none !important;
      padding: 0;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      box-sizing: border-box;
      min-height: 0;
      position: relative;
      z-index: 0;
    }

    .hha-smart-tab-content.active {
      display: flex !important;
      flex-direction: column;
    }

    .hha-smart-panel-footer {
      height: 28px;
      background: #f7f8fa;
      border-top: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 16px;
      font-size: 12px;
      color: #666666;
      flex-shrink: 0;
    }

    .footer-branding {
      font-style: italic;
      opacity: 0.6;
      user-select: none;
    }

    .hha-smart-btn {
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .hha-smart-btn-primary {
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #667eea;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .hha-smart-btn-primary:hover:not(:disabled) {
      background: #5a6fd6;
    }

    .hha-smart-btn-secondary {
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #f7f8fa;
      color: #333333;
      border: 1px solid #e0e0e0;
    }

    .hha-smart-btn-secondary:hover:not(:disabled) {
      background: #f0f2f5;
      border-color: #a29bfe;
    }

    #${OUTLOOK_MINI_CONTAINER_ID} {
      position: fixed;
      top: 96px;
      right: 22px;
      z-index: 2147482400;
      user-select: none;
    }

    #${OUTLOOK_MINI_HANDLE_ID} {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: move;
      border: 1px solid rgba(255, 255, 255, 0.35);
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.24);
      font-size: 22px;
      transition: transform 0.16s ease, box-shadow 0.16s ease;
    }

    #${OUTLOOK_MINI_HANDLE_ID}:hover {
      transform: scale(1.06);
      box-shadow: 0 10px 22px rgba(0, 0, 0, 0.28);
    }

    #${OUTLOOK_MINI_PANEL_HOST_ID} {
      position: absolute;
      top: 0;
      width: 680px;
      display: none;
      z-index: 2;
    }
  `;

  if (targetDocument === document && CSPBypassInjector.isAvailable()) {
    CSPBypassInjector.injectStyle(css, OUTLOOK_MINI_STYLE_ID);
    return;
  }

  const style = targetDocument.createElement("style");
  style.id = OUTLOOK_MINI_STYLE_ID;
  style.textContent = css;
  (targetDocument.head || targetDocument.documentElement).appendChild(style);
}

interface MiniPanelPosition {
  left: number;
  top: number;
}

function loadPosition(): MiniPanelPosition | null {
  try {
    const raw = localStorage.getItem(STORAGE.POSITION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MiniPanelPosition;
    if (typeof parsed.left !== "number" || typeof parsed.top !== "number") {
      return null;
    }
    return parsed;
  } catch (_) {
    return null;
  }
}

function savePosition(position: MiniPanelPosition): void {
  try {
    localStorage.setItem(STORAGE.POSITION, JSON.stringify(position));
  } catch (_) {
    /* ignore */
  }
}

export class OutlookMiniPanel {
  static init(): void {
    const { hostWindow, hostDocument } = resolveBootstrapContext();

    if (!isOutlookPage(hostWindow)) {
      return;
    }

    this.ensureWatchdog(hostWindow);

    if (!hostDocument.body) {
      hostDocument.addEventListener(
        "DOMContentLoaded",
        () => {
          OutlookMiniPanel.init();
        },
        { once: true }
      );
      return;
    }

    const existingContainer = hostDocument.getElementById(
      OUTLOOK_MINI_CONTAINER_ID
    );

    if (existingContainer) {
      (hostWindow as any)[OUTLOOK_MINI_BOOTSTRAP_FLAG] = true;
      return;
    }

    if ((hostWindow as any)[OUTLOOK_MINI_BOOTSTRAP_FLAG]) {
      console.warn(
        "[OutlookMiniPanel] Bootstrap flag was set but container is missing. Recreating mini panel."
      );
      (hostWindow as any)[OUTLOOK_MINI_BOOTSTRAP_FLAG] = false;
    }

    if ((hostWindow as any)[OUTLOOK_MINI_BOOTSTRAP_FLAG]) {
      return;
    }

    ensureStyles(hostDocument);
    this.bootstrap(hostWindow, hostDocument);
    (hostWindow as any)[OUTLOOK_MINI_BOOTSTRAP_FLAG] = true;
  }

  private static ensureWatchdog(hostWindow: Window): void {
    const state = hostWindow as Window & Record<string, unknown>;
    if (state[OUTLOOK_MINI_WATCHDOG_FLAG]) {
      return;
    }

    state[OUTLOOK_MINI_WATCHDOG_FLAG] = window.setInterval(() => {
      try {
        if (!isOutlookPage(hostWindow) || !hostWindow.document.body) {
          return;
        }

        const containerMissing = !hostWindow.document.getElementById(
          OUTLOOK_MINI_CONTAINER_ID
        );

        if (containerMissing) {
          state[OUTLOOK_MINI_BOOTSTRAP_FLAG] = false;
          OutlookMiniPanel.init();
        }
      } catch {
        // Ignore transient access errors while Outlook is re-rendering.
      }
    }, 2000);
  }

  private static bootstrap(hostWindow: Window, hostDocument: Document): void {
    const container = hostDocument.createElement("div");
    container.id = OUTLOOK_MINI_CONTAINER_ID;

    const handle = hostDocument.createElement("div");
    handle.id = OUTLOOK_MINI_HANDLE_ID;
    handle.textContent = "🔔";

    const panelHost = hostDocument.createElement("div");
    panelHost.id = OUTLOOK_MINI_PANEL_HOST_ID;

    this.applyInlineFallbackStyles(container, handle, panelHost);

    container.appendChild(handle);
    container.appendChild(panelHost);
    hostDocument.body.appendChild(container);

    const savedPosition = loadPosition();
    if (savedPosition) {
      const clamped = this.clampPosition(
        savedPosition.left,
        savedPosition.top,
        hostWindow,
        container
      );
      container.style.left = `${clamped.left}px`;
      container.style.top = `${clamped.top}px`;
      container.style.right = "auto";
    }

    const panel = new MultiTabPanel(panelHost, {
      title: "Outlook Smart Assistant",
      defaultTabId: "quick-search",
      initialCollapsed: false,
      showHeaderControls: false,
      storageKeyPrefix: STORAGE.PANEL_KEY_PREFIX,
    });

    panel.registerTab(new QuickSearchTab());
    panel.registerTab(
      new DateInputTab({
        presetStorageKey: STORAGE.DATE_PRESET,
        showOutlookHint: true,
      })
    );

    panel
      .init()
      .then(() => {
        this.setupDragAndToggle(
          hostWindow,
          hostDocument,
          container,
          handle,
          panelHost
        );
        console.log("[OutlookMiniPanel] Initialized");
      })
      .catch((error) => {
        console.error("[OutlookMiniPanel] Failed to initialize:", error);
      });
  }

  private static applyInlineFallbackStyles(
    container: HTMLElement,
    handle: HTMLElement,
    panelHost: HTMLElement
  ): void {
    container.style.position = "fixed";
    container.style.top = "96px";
    container.style.right = "22px";
    container.style.zIndex = "2147482400";
    container.style.userSelect = "none";

    handle.style.width = `${MINI_HANDLE_SIZE}px`;
    handle.style.height = `${MINI_HANDLE_SIZE}px`;
    handle.style.borderRadius = "50%";
    handle.style.background =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    handle.style.color = "#ffffff";
    handle.style.display = "flex";
    handle.style.alignItems = "center";
    handle.style.justifyContent = "center";
    handle.style.cursor = "move";
    handle.style.border = "1px solid rgba(255, 255, 255, 0.35)";
    handle.style.boxShadow = "0 8px 18px rgba(0, 0, 0, 0.24)";
    handle.style.fontSize = "22px";

    panelHost.style.position = "absolute";
    panelHost.style.top = "0";
    panelHost.style.width = "680px";
    panelHost.style.display = "none";
    panelHost.style.zIndex = "2";
  }

  private static clampPosition(
    left: number,
    top: number,
    hostWindow: Window,
    container: HTMLElement
  ): MiniPanelPosition {
    const width = container.offsetWidth || MINI_HANDLE_SIZE;
    const height = container.offsetHeight || MINI_HANDLE_SIZE;
    return {
      left: Math.max(
        MINI_MARGIN,
        Math.min(left, hostWindow.innerWidth - width - MINI_MARGIN)
      ),
      top: Math.max(
        MINI_MARGIN,
        Math.min(top, hostWindow.innerHeight - height - MINI_MARGIN)
      ),
    };
  }

  private static setupDragAndToggle(
    hostWindow: Window,
    hostDocument: Document,
    container: HTMLElement,
    handle: HTMLElement,
    panelHost: HTMLElement
  ): void {
    let isDragging = false;
    let hasDragged = false;
    let offsetX = 0;
    let offsetY = 0;

    const onMouseMove = (event: MouseEvent): void => {
      if (!isDragging) return;
      hasDragged = true;

      let left = event.clientX - offsetX;
      let top = event.clientY - offsetY;

      const clamped = this.clampPosition(left, top, hostWindow, container);
      left = clamped.left;
      top = clamped.top;

      container.style.left = `${left}px`;
      container.style.top = `${top}px`;
      container.style.right = "auto";

      this.positionPanel(hostWindow, panelHost, handle);
    };

    const onMouseUp = (): void => {
      if (!isDragging) return;
      isDragging = false;
      hostDocument.removeEventListener("mousemove", onMouseMove);
      hostDocument.removeEventListener("mouseup", onMouseUp);

      const rect = container.getBoundingClientRect();
      savePosition({ left: rect.left, top: rect.top });
    };

    handle.addEventListener("mousedown", (event) => {
      isDragging = true;
      hasDragged = false;
      const rect = container.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      hostDocument.addEventListener("mousemove", onMouseMove);
      hostDocument.addEventListener("mouseup", onMouseUp);
    });

    handle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (hasDragged) {
        hasDragged = false;
        return;
      }

      const isVisible = panelHost.style.display !== "none";
      if (isVisible) {
        panelHost.style.display = "none";
        return;
      }

      this.positionPanel(hostWindow, panelHost, handle);
      panelHost.style.display = "block";
    });
  }

  private static positionPanel(
    hostWindow: Window,
    panelHost: HTMLElement,
    handle: HTMLElement
  ): void {
    const viewportWidth = hostWindow.innerWidth;
    const handleRect = handle.getBoundingClientRect();
    const isHandleOnLeftHalf =
      handleRect.left + handleRect.width / 2 < viewportWidth / 2;

    if (isHandleOnLeftHalf) {
      panelHost.style.left = `${handle.offsetWidth + 10}px`;
      panelHost.style.right = "auto";
      return;
    }

    panelHost.style.right = `${handle.offsetWidth + 10}px`;
    panelHost.style.left = "auto";
  }
}
