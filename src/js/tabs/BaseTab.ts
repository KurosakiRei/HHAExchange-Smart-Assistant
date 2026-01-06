/**
 * Base Tab Interface
 * All tabs must implement this interface
 */
export interface ITab {
  /** Unique tab ID */
  id: string;
  /** Tab display label */
  label: string;
  /** Tab icon (emoji or unicode) */
  icon: string;
  /** Initialize the tab content */
  init(): Promise<void> | void;
  /** Render tab content to container */
  render(container: HTMLElement): void;
  /** Clean up resources when tab is destroyed */
  destroy?(): void;
  /** Called when tab becomes active */
  onActivate?(): void;
  /** Called when tab becomes inactive */
  onDeactivate?(): void;
}

/**
 * Base Tab Abstract Class
 * Provides common functionality for all tabs
 */
export abstract class BaseTab implements ITab {
  abstract id: string;
  abstract label: string;
  abstract icon: string;

  protected container: HTMLElement | null = null;
  protected initialized: boolean = false;

  async init(): Promise<void> {
    // Override in subclass if initialization is needed
  }

  abstract render(container: HTMLElement): void;

  destroy(): void {
    if (this.container) {
      this.container.innerHTML = "";
      this.container = null;
    }
    this.initialized = false;
  }

  onActivate(): void {
    // Override in subclass if needed
  }

  onDeactivate(): void {
    // Override in subclass if needed
  }

  /**
   * Create a config card UI component
   */
  protected createConfigCard(title: string, content: HTMLElement): HTMLElement {
    const card = document.createElement("div");
    card.className = "hha-smart-config-card";

    const titleEl = document.createElement("div");
    titleEl.className = "hha-smart-config-card-title";
    titleEl.textContent = title;

    const bodyEl = document.createElement("div");
    bodyEl.className = "hha-smart-config-card-body";
    bodyEl.appendChild(content);

    card.appendChild(titleEl);
    card.appendChild(bodyEl);

    return card;
  }

  /**
   * Create a primary button
   */
  protected createButton(
    text: string,
    onClick: () => void,
    isPrimary: boolean = true
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = isPrimary
      ? "hha-smart-btn-primary"
      : "hha-smart-btn-secondary";
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
  }

  /**
   * Create a placeholder UI
   */
  protected createPlaceholder(
    icon: string,
    title: string,
    text: string
  ): HTMLElement {
    const placeholder = document.createElement("div");
    placeholder.className = "hha-smart-placeholder";

    placeholder.innerHTML = `
      <div class="hha-smart-placeholder-icon">${icon}</div>
      <div class="hha-smart-placeholder-title">${title}</div>
      <div class="hha-smart-placeholder-text">${text}</div>
    `;

    return placeholder;
  }
}
