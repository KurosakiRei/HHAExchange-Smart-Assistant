declare module "*.less";
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Tampermonkey globals
declare const unsafeWindow: Window & typeof globalThis;

// Tampermonkey storage API
declare function GM_setValue(key: string, value: any): void;
declare function GM_getValue<T>(key: string, defaultValue?: T): T;

// Tampermonkey tab API
declare function GM_openInTab(
  url: string,
  options?: { active?: boolean; insert?: boolean; setParent?: boolean }
): { close(): void };

// Chrome Extension APIs (available when script runs on chrome-extension:// TM options page)
declare namespace chrome {
  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      status?: string;
      windowId?: number;
    }
    function query(
      queryInfo: { url?: string | string[] },
      callback: (tabs: Tab[]) => void
    ): void;
    function get(tabId: number, callback: (tab: Tab) => void): void;
    function create(
      properties: { url: string; active?: boolean },
      callback?: (tab: Tab) => void
    ): void;
    function update(
      tabId: number,
      updateProperties: { active?: boolean },
      callback?: (tab?: Tab) => void
    ): void;
  }
  namespace windows {
    function update(
      windowId: number,
      updateInfo: { focused?: boolean },
      callback?: () => void
    ): void;
  }
  namespace scripting {
    interface InjectionTarget {
      tabId: number;
      allFrames?: boolean;
    }
    interface ScriptInjection<Args extends any[], Result> {
      target: InjectionTarget;
      world?: "MAIN" | "ISOLATED";
      func?: (...args: Args) => Result;
      args?: Args;
      files?: string[];
    }
    interface InjectionResult<Result> {
      documentId: string;
      frameId: number;
      result?: Result;
    }
    function executeScript<Args extends any[], Result>(
      injection: ScriptInjection<Args, Result>,
      callback?: (results: InjectionResult<Result>[]) => void
    ): void;
  }
  namespace runtime {
    const lastError: { message?: string } | undefined;
  }
}

// Tampermonkey GM.* API (Promise-based)
declare namespace GM {
  /**
   * GM.addElement - Creates a DOM element with privileged context to bypass CSP
   * @see https://www.tampermonkey.net/documentation.php#api:GM.addElement
   */
  function addElement<K extends keyof HTMLElementTagNameMap>(
    parentNode: Node,
    tagName: K,
    attributes?: Record<string, any>
  ): HTMLElementTagNameMap[K];

  function addElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes?: Record<string, any>
  ): HTMLElementTagNameMap[K];
}
