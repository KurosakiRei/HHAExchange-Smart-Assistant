import { BaseTab } from "./BaseTab";

/**
 * Status Tracking Tab
 * Story 7.2: 状态追踪 Tab 集成
 *
 * Wraps the existing VisitMonitor functionality
 */
export class StatusTrackingTab extends BaseTab {
  id = "status-tracking";
  label = "状态追踪";
  icon = "📊";

  private visitMonitorInitialized = false;
  private retryCount = 0;
  private maxRetries = 20; // 最多重试 20 次 (20 * 300ms = 6秒)

  async init(): Promise<void> {
    // VisitMonitor will be initialized when rendered
    this.initialized = true;
  }

  render(container: HTMLElement): void {
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

  private embedExistingVisitMonitor(container: HTMLElement): void {
    // Check if tracker-panel exists, retry if not
    const trackerPanel = document.getElementById("tracker-panel");

    if (trackerPanel) {
      this.embedVisitMonitorPanel(container);
      this.visitMonitorInitialized = true;
      console.log(
        "[StatusTrackingTab] VisitMonitor panel embedded successfully"
      );
    } else if (this.retryCount < this.maxRetries) {
      // Retry after delay
      this.retryCount++;
      console.log(
        `[StatusTrackingTab] Waiting for tracker-panel... (attempt ${this.retryCount}/${this.maxRetries})`
      );
      setTimeout(() => {
        this.embedExistingVisitMonitor(container);
      }, 300);
    } else {
      console.error(
        "[StatusTrackingTab] Failed to find tracker-panel after max retries"
      );
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
  private embedVisitMonitorPanel(container: HTMLElement): void {
    const trackerPanel = document.getElementById(
      "tracker-panel"
    ) as HTMLElement;

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
      const closeBtn = trackerPanel.querySelector(
        '[title*="关闭"], [title*="Close"]'
      ) as HTMLElement;
      if (closeBtn) {
        closeBtn.style.display = "none";
      }

      const minimizeBtn = trackerPanel.querySelector(
        '[title*="最小化"], [title*="Minimize"]'
      ) as HTMLElement;
      if (minimizeBtn) {
        minimizeBtn.style.display = "none";
      }

      // Append to our tab container
      container.appendChild(trackerPanel);

      // CRITICAL: Watch for display changes and force it to stay visible
      // VisitMonitor's bell click handler might try to change display
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "style"
          ) {
            const panel = mutation.target as HTMLElement;
            if (panel.style.display !== "block") {
              panel.style.display = "block";
              console.log(
                "[StatusTrackingTab] Forced tracker-panel to stay visible"
              );
            }
          }
        });
      });

      observer.observe(trackerPanel, {
        attributes: true,
        attributeFilter: ["style"],
      });

      console.log(
        "[StatusTrackingTab] VisitMonitor panel moved successfully (preserves event listeners)"
      );
    } else {
      console.warn(
        "[StatusTrackingTab] VisitMonitor panel not found, showing placeholder"
      );
      this.showPlaceholder(container);
    }
  }

  /**
   * Show placeholder if VisitMonitor panel cannot be found
   */
  private showPlaceholder(container: HTMLElement): void {
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

  onActivate(): void {
    console.log("[StatusTrackingTab] Activated");
  }

  onDeactivate(): void {
    console.log("[StatusTrackingTab] Deactivated");
  }
}
