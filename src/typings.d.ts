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
