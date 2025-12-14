declare module "*.less";
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Tampermonkey globals
declare const unsafeWindow: Window & typeof globalThis;
