export class CSPBypassInjector {
  /**
   * Check if GM.addElement API is available
   */
  static isAvailable(): boolean {
    // @ts-ignore
    const GM = window.GM || unsafeWindow?.GM;
    return !!GM?.addElement;
  }

  /**
   * Inject Payload Script into the main world using GM.addElement
   */
  static injectPayloadScript(payload: string, id?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // @ts-ignore
        const GM = window.GM || unsafeWindow?.GM;

        if (!GM?.addElement) {
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
        GM.addElement(document.body, "script", options);

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
    // @ts-ignore
    const GM = window.GM || unsafeWindow?.GM;
    if (GM?.addElement) {
      const options: any = { textContent: css };
      if (id) options.id = id;
      GM.addElement(document.head, "style", options);
    }
  }
}
