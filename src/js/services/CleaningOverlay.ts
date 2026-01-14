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

export type PageType = "PREBILLING" | "CALL_MAINTENANCE";

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

export class CleaningOverlay {
    private static overlayId = "hha-cleaning-overlay";

    /**
     * 显示确认对话框
     * @returns Promise<boolean> - 用户是否确认
     */
    static showConfirmDialog(
        taskCount: number,
        pageType: PageType
    ): Promise<boolean> {
        return new Promise((resolve) => {
            // 移除可能存在的旧蒙版
            this.hide();

            const overlay = document.createElement("div");
            overlay.id = this.overlayId;
            overlay.style.cssText = OVERLAY_STYLES;

            const typeLabel =
                pageType === "PREBILLING" ? "POC Compliance" : "Duplicate Call";

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
    static show(current: number, total: number, taskInfo: string): void {
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
    static update(current: number, total: number, taskInfo: string): void {
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
    static showComplete(pageType: PageType): void {
        const overlay = document.getElementById(this.overlayId);
        if (!overlay) {
            // 如果不存在，创建一个
            this.show(1, 1, "");
        }

        const modal = document.getElementById("hha-cleaning-modal");
        if (!modal) return;

        const message =
            pageType === "PREBILLING"
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
    static showError(message: string): void {
        const modal = document.getElementById("hha-cleaning-modal");
        if (!modal) return;

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
    static hide(): void {
        document.getElementById(this.overlayId)?.remove();
    }

    /**
     * 检查蒙版是否存在
     */
    static isVisible(): boolean {
        return document.getElementById(this.overlayId) !== null;
    }
}
