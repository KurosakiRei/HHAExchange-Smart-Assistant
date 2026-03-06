export class DocumentDropzone {
  private observer: MutationObserver | null = null;
  private isBound = false;
  private overlay: HTMLElement | null = null;

  constructor() {
    this.initObserver();
  }

  /**
   * Initialize MutationObserver to watch for the "Add Document" modal.
   */
  private initObserver() {
    // Determine if we are on a page/iframe that could contain the modal
    // It's safe to observe the body of the top window and inner iframes as the modal could be either.
    this.observer = new MutationObserver((mutations) => {
      // Look for the required elements for the Add Document modal
      const fileInput =
        document.querySelector('input[type="file"][name="fuUpload2"]') ||
        document.querySelector(".fileInput57");
      const docTypeSelect = document.getElementById("documentTypeDropdown");

      // We consider the modal "open" if we find the file input
      if (fileInput && !this.isBound) {
        this.bindDropzone(
          fileInput.closest("table, div.modal-content, body") as HTMLElement
        );
      } else if (!fileInput && this.isBound) {
        this.unbindDropzone();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial check in case it's already there
    const fileInput =
      document.querySelector('input[type="file"][name="fuUpload2"]') ||
      document.querySelector(".fileInput57");
    if (fileInput) {
      this.bindDropzone(
        fileInput.closest("table, div.modal-content, body") as HTMLElement
      );
    }
  }

  /**
   * Bind drag and drop events and inject overlay.
   */
  private bindDropzone(container: HTMLElement) {
    if (!container) return;
    this.isBound = true;
    console.log("[Epic 14] Add Document modal detected. Binding dropzone.");

    // Ensure the container is positioned relative to anchor the absolute overlay
    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }

    // Create the overlay element
    this.overlay = document.createElement("div");
    this.overlay.className = "document-dropzone-overlay";
    this.overlay.innerHTML = `
      <div class="dropzone-content">
        <div class="dropzone-icon">📁</div>
        <div class="dropzone-text">拖拽文件到这里进行智能上传</div>
      </div>
    `;

    // Append overlay to container
    container.appendChild(this.overlay);

    // Bind events to the container (not just overlay, to catch drags over the modal area)
    container.addEventListener("dragenter", this.onDragEnter);
    container.addEventListener("dragover", this.onDragOver);
    container.addEventListener("dragleave", this.onDragLeave);
    container.addEventListener("drop", this.onDrop);
  }

  /**
   * Unbind events and remove overlay to prevent memory leaks.
   */
  private unbindDropzone() {
    this.isBound = false;
    console.log("[Epic 14] Add Document modal closed. Unbinding dropzone.");

    if (this.overlay && this.overlay.parentNode) {
      const container = this.overlay.parentNode as HTMLElement;
      container.removeEventListener("dragenter", this.onDragEnter);
      container.removeEventListener("dragover", this.onDragOver);
      container.removeEventListener("dragleave", this.onDragLeave);
      container.removeEventListener("drop", this.onDrop);

      this.overlay.remove();
      this.overlay = null;
    }
  }

  private onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.overlay) {
      this.overlay.classList.add("active");
    }
  };

  private onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.overlay) {
      this.overlay.classList.add("active");
    }
  };

  private onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only remove active class if we are leaving the actual overlay and not just hovering over a child
    if (e.target === this.overlay) {
      this.overlay.classList.remove("active");
    }
  };

  private onDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.overlay) {
      this.overlay.classList.remove("active");
    }

    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      const originalFile = e.dataTransfer.files[0];
      console.log("[Epic 14] File dropped:", originalFile.name);

      // Story 14.3 - Prompt for rename
      const newFileName = await this.promptForRename(originalFile.name);
      if (!newFileName || newFileName.trim() === "") {
        console.log("[Epic 14] Rename cancelled or empty, aborting upload.");
        return;
      }

      // Story 14.4 - Reconstruct File
      const newFile = new File([originalFile], newFileName.trim(), {
        type: originalFile.type,
      });
      this.attachFileToInput(newFile);

      // Story 14.5 - Auto-fill form
      this.autoFillMetadata(newFileName.trim());
    }
  };

  /**
   * Prompts the user to rename the file. Pre-fills and selects the original name.
   * Returns a promise that resolves with the new name, or null if cancelled.
   */
  private promptForRename(originalName: string): Promise<string | null> {
    return new Promise((resolve) => {
      // Extract name without extension if possible for better UX
      const lastDotIndex = originalName.lastIndexOf(".");
      const hasExtension = lastDotIndex > 0;
      const baseName = hasExtension
        ? originalName.substring(0, lastDotIndex)
        : originalName;
      const extension = hasExtension
        ? originalName.substring(lastDotIndex)
        : "";

      const backdrop = document.createElement("div");
      backdrop.className = "document-rename-backdrop";

      const modal = document.createElement("div");
      modal.className = "document-rename-modal";

      modal.innerHTML = `
        <div class="rename-header">📝 重命名上传文档</div>
        <div class="rename-body">
          <label>新文件名:</label>
          <input type="text" id="rename-input" value="${baseName}" />
          ${hasExtension ? `<span class="rename-ext">${extension}</span>` : ""}
        </div>
        <div class="rename-footer">
          <button class="tracker-btn-secondary" id="rename-cancel">取消</button>
          <button class="tracker-btn-primary" id="rename-confirm">✓ 确认</button>
        </div>
      `;

      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);

      const input = modal.querySelector("#rename-input") as HTMLInputElement;
      const confirmBtn = modal.querySelector(
        "#rename-confirm"
      ) as HTMLButtonElement;
      const cancelBtn = modal.querySelector(
        "#rename-cancel"
      ) as HTMLButtonElement;

      // Focus and select the text for quick overtyping
      input.focus();
      input.select();

      const cleanup = () => {
        if (backdrop.parentNode) {
          backdrop.parentNode.removeChild(backdrop);
        }
      };

      const submitAction = () => {
        const value = input.value.trim();
        if (value) {
          resolve(value + extension);
        } else {
          resolve(null);
        }
        cleanup();
      };

      confirmBtn.addEventListener("click", submitAction);

      cancelBtn.addEventListener("click", () => {
        resolve(null);
        cleanup();
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submitAction();
        } else if (e.key === "Escape") {
          resolve(null);
          cleanup();
        }
      });
    });
  }

  /**
   * Applies the constructed File object to the hidden input and triggers change
   */
  private attachFileToInput(file: File) {
    const fileInput =
      document.querySelector('input[type="file"][name="fuUpload2"]') ||
      document.querySelector(".fileInput57");
    if (fileInput && fileInput instanceof HTMLInputElement) {
      console.log("[Epic 14] Attaching new file to input:", file.name);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;

      // Dispatch change event to trigger React/Vanilla listeners
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      console.error("[Epic 14] Target file input not found!");
    }
  }

  /**
   * Automatically sets the document type and populates the description
   */
  private autoFillMetadata(fileName: string) {
    console.log("[Epic 14] Auto-filling form elements...");

    // 1. Set Document Type to "General Notes" (value: 29132)
    const docTypeSelect = document.getElementById(
      "documentTypeDropdown"
    ) as HTMLSelectElement;
    if (docTypeSelect) {
      docTypeSelect.value = "29132";
      docTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // 2. Set description to the filename (without extension)
    const descTextarea = document.getElementById(
      "attachedDocumentDescription"
    ) as HTMLTextAreaElement;
    if (descTextarea) {
      const lastDotIndex = fileName.lastIndexOf(".");
      const baseName =
        lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;

      descTextarea.value = baseName;
      descTextarea.dispatchEvent(new Event("change", { bubbles: true }));
      descTextarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  /**
   * Stop observing (useful for cleanup if the script is stopped)
   */
  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.unbindDropzone();
  }
}

// Singleton initialization
let instance: DocumentDropzone | null = null;
export function initDocumentDropzone() {
  if (!instance) {
    instance = new DocumentDropzone();
  }
  return instance;
}
