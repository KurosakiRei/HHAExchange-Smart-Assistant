import { BaseTab } from "./BaseTab";

/**
 * QA Report Tab (Placeholder)
 * Story 7.3: QA 报告 Tab 占位符
 */
export class QAReportTab extends BaseTab {
  id = "qa-report";
  label = "QA 报告";
  icon = "📋";

  render(container: HTMLElement): void {
    this.container = container;

    const placeholder = this.createPlaceholder(
      "📋",
      "QA 报告功能",
      "功能规划中，敬请期待..."
    );

    container.appendChild(placeholder);
  }
}
