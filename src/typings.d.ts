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
