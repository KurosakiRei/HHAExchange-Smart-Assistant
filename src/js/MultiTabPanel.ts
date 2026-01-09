import { ITab } from "./tabs/BaseTab";

/**
 * LocalStorage Keys for Multi-Tab Panel
 */
const STORAGE_KEYS = {
  ACTIVE_TAB: "hha_smart_assistant_active_tab",
  TAB_BAR_COLLAPSED: "hha_smart_assistant_tab_bar_collapsed",
} as const;

/**
 * Multi-Tab Panel Configuration
 */
interface MultiTabPanelConfig {
  /** Panel title */
  title?: string;
  /** Default active tab ID */
  defaultTabId?: string;
  /** Initial collapsed state */
  initialCollapsed?: boolean;
  /** Show header controls (minimize/close buttons) - default false */
  showHeaderControls?: boolean;
}

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
export class MultiTabPanel {
  private container: HTMLElement;
  private panelEl: HTMLElement | null = null;
  private tabBarEl: HTMLElement | null = null;
  private contentAreaEl: HTMLElement | null = null;

  private tabs: Map<string, ITab> = new Map();
  private tabContents: Map<string, HTMLElement> = new Map();
  private activeTabId: string = "";
  private isCollapsed: boolean = false;

  private config: Required<MultiTabPanelConfig>;

  constructor(container: HTMLElement, config: MultiTabPanelConfig = {}) {
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
  registerTab(tab: ITab): void {
    this.tabs.set(tab.id, tab);

    // Set default active tab if not set
    if (!this.activeTabId) {
      this.activeTabId = tab.id;
    }
  }

  /**
   * Initialize and render the panel
   */
  async init(): Promise<void> {
    this.render();
    await this.initializeDefaultTab();
  }

  /**
   * Render the panel structure
   */
  private render(): void {
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
  private renderHeader(): HTMLElement {
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
  private renderBody(): HTMLElement {
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
  private renderTabBar(): HTMLElement {
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
  private renderTabItem(tab: ITab): HTMLElement {
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
  private renderCollapseButton(): HTMLElement {
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
  private renderContentArea(): HTMLElement {
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
  private renderFooter(): HTMLElement {
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
  private async initializeDefaultTab(): Promise<void> {
    const tab = this.tabs.get(this.activeTabId);
    if (!tab) return;

    const container = this.tabContents.get(this.activeTabId);
    if (!container) return;

    // CRITICAL: Render first to create DOM elements, then init to load data
    tab.render(container);
    await tab.init();
  }

  /**
   * Switch to a different tab
   */
  async switchTab(tabId: string): Promise<void> {
    if (tabId === this.activeTabId) return;

    const tab = this.tabs.get(tabId);
    if (!tab) return;

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
  private updateTabBarUI(): void {
    const tabItems = this.tabBarEl?.querySelectorAll(".hha-smart-tab-item");
    tabItems?.forEach((item) => {
      const tabId = (item as HTMLElement).dataset.tabId;
      if (tabId === this.activeTabId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  /**
   * Update content area UI to show active tab
   */
  private updateContentAreaUI(): void {
    this.tabContents.forEach((content, tabId) => {
      if (tabId === this.activeTabId) {
        content.classList.add("active");
      } else {
        content.classList.remove("active");
      }
    });
  }

  /**
   * Toggle tab bar collapse state
   */
  private toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.saveCollapseState();

    if (this.isCollapsed) {
      this.tabBarEl?.classList.add("collapsed");
    } else {
      this.tabBarEl?.classList.remove("collapsed");
    }
  }

  /**
   * Minimize panel (hide)
   */
  private minimize(): void {
    if (this.panelEl) {
      this.panelEl.style.display = "none";
    }
  }

  /**
   * Close panel (hide, not destroy)
   * This allows the panel to be reopened without losing state
   */
  private close(): void {
    // Hide the container (parent of panelEl)
    if (this.container) {
      this.container.style.display = "none";
      console.log("[MultiTabPanel] Panel closed (hidden)");
    }
  }

  /**
   * Show panel
   */
  show(): void {
    if (this.panelEl) {
      this.panelEl.style.display = "flex";
    }
  }

  // ===== LocalStorage State Management =====

  private loadState(): void {
    // Load active tab
    const savedTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    if (savedTab) {
      this.activeTabId = savedTab;
    } else if (this.config.defaultTabId) {
      this.activeTabId = this.config.defaultTabId;
    }

    // Load collapse state
    const collapsed = localStorage.getItem(STORAGE_KEYS.TAB_BAR_COLLAPSED);
    this.isCollapsed = collapsed === "true" || this.config.initialCollapsed;
  }

  private saveActiveTab(): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, this.activeTabId);
  }

  private saveCollapseState(): void {
    localStorage.setItem(
      STORAGE_KEYS.TAB_BAR_COLLAPSED,
      String(this.isCollapsed)
    );
  }
}
