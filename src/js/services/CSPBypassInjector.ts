type GMAddElementApi = {
  addElement?: (
    parent: Node,
    tagName: string,
    attributes?: Record<string, unknown>
  ) => Element;
};

declare const GM: GMAddElementApi | undefined;
declare const unsafeWindow:
  | (Window & typeof globalThis & { GM?: GMAddElementApi })
  | undefined;

function resolveGMApi(): GMAddElementApi | undefined {
  if (typeof GM !== "undefined" && GM?.addElement) {
    return GM;
  }

  const scopedWindow = window as Window & { GM?: GMAddElementApi };
  if (scopedWindow.GM?.addElement) {
    return scopedWindow.GM;
  }

  if (typeof unsafeWindow !== "undefined" && unsafeWindow?.GM?.addElement) {
    return unsafeWindow.GM;
  }

  return undefined;
}

export class CSPBypassInjector {
  /**
   * Check if GM.addElement API is available
   */
  static isAvailable(): boolean {
    return !!resolveGMApi()?.addElement;
  }

  /**
   * Inject Payload Script into the main world using GM.addElement
   */
  static injectPayloadScript(payload: string, id?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const gmApi = resolveGMApi();

        if (!gmApi?.addElement) {
          throw new Error(
            "GM.addElement not available. Please ensure your Tampermonkey version supports it."
          );
        }

        const options: any = {
          textContent: payload,
          type: "text/javascript",
        };
        if (id) options.id = id;

        // Use the privileged API to inject the script
        gmApi.addElement(document.body, "script", options);

        console.log("[CSPBypassInjector] Script injected successfully");
        resolve();
      } catch (error) {
        console.error("[CSPBypassInjector] Injection failed:", error);
        reject(error);
      }
    });
  }

  /**
   * Inject Styles into the main world using GM.addElement
   */
  static injectStyle(css: string, id?: string): void {
    const gmApi = resolveGMApi();

    const appendStyleElement = (): void => {
      const style = document.createElement("style");
      if (id) {
        style.id = id;
      }
      style.textContent = css;

      const target = document.head || document.documentElement || document.body;
      if (target) {
        target.appendChild(style);
      }
    };

    if (gmApi?.addElement) {
      const options: any = { textContent: css };
      if (id) options.id = id;
      const target = document.head || document.documentElement || document.body;
      if (target) {
        gmApi.addElement(target, "style", options);
        return;
      }

      // Retry once after DOM is ready in case script runs too early.
      window.addEventListener(
        "DOMContentLoaded",
        () => {
          const delayedTarget =
            document.head || document.documentElement || document.body;
          if (delayedTarget) {
            gmApi.addElement(delayedTarget, "style", options);
            return;
          }
          appendStyleElement();
        },
        { once: true }
      );
      return;
    }

    appendStyleElement();
  }
}
