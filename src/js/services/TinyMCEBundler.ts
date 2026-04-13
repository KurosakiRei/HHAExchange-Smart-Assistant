/**
 * TinyMCE Bundler Service
 *
 * Manually loads TinyMCE components using GM.xmlHttpRequest to bypass CSP restrictions.
 * Uses CSPBypassInjector for proper script/style injection.
 */

import { CSPBypassInjector } from "./CSPBypassInjector";

declare const GM: {
  xmlHttpRequest: (options: {
    method: string;
    url: string;
    onload: (response: { status: number; responseText: string }) => void;
    onerror: (error: any) => void;
  }) => void;
};
declare const GM_addStyle: (css: string) => void;
declare const unsafeWindow: Window;

const TINYMCE_BASE_URL = "https://unpkg.com/tinymce@5.10.9/";

// JS components to bundle (TinyMCE 5.x — no model file needed)
const TINYMCE_JS_COMPONENTS = [
  "tinymce.min.js",
  "themes/silver/theme.min.js",
  "icons/default/icons.min.js",
  "plugins/lists/plugin.min.js",
  "plugins/link/plugin.min.js",
];

// CSS components
const TINYMCE_CSS_COMPONENTS = {
  ui: "skins/ui/oxide/skin.min.css",
  content: "skins/content/default/content.min.css",
};

interface TinyMceCss {
  ui: string;
  content: string;
}

// Cached CSS content
let tinyMceCss: TinyMceCss | null = null;
let isLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Fetch a single asset using GM.xmlHttpRequest
 */
function fetchAsset(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Use the GM object's xmlHttpRequest method
    if (typeof GM !== "undefined" && GM.xmlHttpRequest) {
      GM.xmlHttpRequest({
        method: "GET",
        url: url,
        onload: (response: any) => {
          if (response.status >= 200 && response.status < 300) {
            resolve(response.responseText);
          } else {
            reject(
              new Error(`Failed to load: ${url}. Status: ${response.status}`)
            );
          }
        },
        onerror: (error: any) => {
          reject(new Error(`Failed to load: ${url}. Error: ${error}`));
        },
      });
    } else {
      // Fallback to fetch (may fail due to CSP)
      fetch(url)
        .then((response) => {
          if (response.ok) {
            return response.text();
          }
          throw new Error(`Failed to load: ${url}`);
        })
        .then(resolve)
        .catch(reject);
    }
  });
}

/**
 * Load and inject the TinyMCE JS bundle
 */
async function loadAndInjectJsBundle(): Promise<void> {
  console.log("[TinyMCEBundler] Loading TinyMCE JS components...");
  try {
    const promises = TINYMCE_JS_COMPONENTS.map((c) =>
      fetchAsset(TINYMCE_BASE_URL + c)
    );
    const contents = await Promise.all(promises);
    const bundle = contents.join("\n\n// --- Bundled ---\n\n");

    // Use CSPBypassInjector for proper CSP bypass via GM.addElement
    if (CSPBypassInjector.isAvailable()) {
      await CSPBypassInjector.injectPayloadScript(bundle, "tinymce-bundle");
      console.log(
        "[TinyMCEBundler] TinyMCE JS bundle injected via CSPBypassInjector!"
      );
    } else {
      // Fallback to direct injection (may be blocked by CSP)
      console.warn(
        "[TinyMCEBundler] CSPBypassInjector not available, using fallback"
      );
      const scriptEl = document.createElement("script");
      scriptEl.type = "text/javascript";
      scriptEl.textContent = bundle;
      document.head.appendChild(scriptEl);
      console.log("[TinyMCEBundler] TinyMCE JS bundle injected via fallback!");
    }
  } catch (error) {
    console.error("[TinyMCEBundler] Failed to build TinyMCE JS bundle:", error);
    throw error;
  }
}

/**
 * Wait for window.tinymce to become available after script injection
 * Note: We use unsafeWindow because TinyMCE is injected into the page's window context,
 * not the userscript's sandboxed window
 */
function waitForTinyMCE(timeout: number = 30000): Promise<void> {
  // Get reference to page's window object (unsafeWindow in Tampermonkey, or regular window)
  const pageWindow =
    typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let checkCount = 0;

    const check = () => {
      checkCount++;
      if (typeof (pageWindow as any).tinymce !== "undefined") {
        console.log(
          `[TinyMCEBundler] TinyMCE detected after ${checkCount} checks (${
            Date.now() - startTime
          }ms)`
        );
        resolve();
        return;
      }

      if (Date.now() - startTime > timeout) {
        console.error(
          `[TinyMCEBundler] Timeout after ${checkCount} checks (${timeout}ms)`
        );
        reject(new Error("Timeout waiting for TinyMCE to be available"));
        return;
      }

      setTimeout(check, 100);
    };

    check();
  });
}

/**
 * Load the TinyMCE CSS components
 */
async function loadCssBundle(): Promise<TinyMceCss> {
  console.log("[TinyMCEBundler] Loading TinyMCE CSS...");
  try {
    const uiCssPromise = fetchAsset(
      TINYMCE_BASE_URL + TINYMCE_CSS_COMPONENTS.ui
    );
    const contentCssPromise = fetchAsset(
      TINYMCE_BASE_URL + TINYMCE_CSS_COMPONENTS.content
    );
    const [ui, content] = await Promise.all([uiCssPromise, contentCssPromise]);
    console.log("[TinyMCEBundler] TinyMCE CSS loaded successfully!");
    return { ui, content };
  } catch (error) {
    console.error("[TinyMCEBundler] Failed to load TinyMCE CSS:", error);
    throw error;
  }
}

/**
 * TinyMCE Bundler - provides methods to load and initialize TinyMCE
 */
export const TinyMCEBundler = {
  /**
   * Check if TinyMCE is loaded
   */
  isLoaded(): boolean {
    // Use unsafeWindow since TinyMCE is injected into the page's window context
    const pageWindow =
      typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    return isLoaded && typeof (pageWindow as any).tinymce !== "undefined";
  },

  /**
   * Get the cached CSS content
   */
  getCss(): TinyMceCss | null {
    return tinyMceCss;
  },

  /**
   * Load TinyMCE (call this once at app startup or when first needed)
   */
  async load(): Promise<void> {
    if (isLoaded) {
      return;
    }

    if (loadingPromise) {
      return loadingPromise;
    }

    loadingPromise = (async () => {
      try {
        const jsPromise = loadAndInjectJsBundle();
        const cssPromise = loadCssBundle();

        const [_, css] = await Promise.all([jsPromise, cssPromise]);
        tinyMceCss = css;

        // Inject UI CSS globally using CSPBypassInjector
        if (CSPBypassInjector.isAvailable()) {
          CSPBypassInjector.injectStyle(tinyMceCss.ui, "tinymce-ui-css");
        } else if (typeof GM_addStyle !== "undefined") {
          GM_addStyle(tinyMceCss.ui);
        } else {
          const styleEl = document.createElement("style");
          styleEl.textContent = tinyMceCss.ui;
          document.head.appendChild(styleEl);
        }

        isLoaded = true;
        console.log("[TinyMCEBundler] TinyMCE fully loaded!");
      } catch (error) {
        console.error("[TinyMCEBundler] Failed to load TinyMCE:", error);
        loadingPromise = null;
        throw error;
      }
    })();

    return loadingPromise;
  },

  /**
   * Initialize TinyMCE on a selector
   */
  async init(selector: string, options: any = {}): Promise<any> {
    // Start loading TinyMCE bundles (if not already)
    await this.load();

    // Wait for window.tinymce to be available (script execution may be slow)
    console.log("[TinyMCEBundler] Waiting for window.tinymce...");
    await waitForTinyMCE();
    console.log("[TinyMCEBundler] window.tinymce is available!");

    // Use unsafeWindow to access TinyMCE in page context
    const pageWindow =
      typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    const tinymce = (pageWindow as any).tinymce;

    // Set baseURL explicitly so TinyMCE doesn't auto-detect it from the inline
    // script tag (which has no src attribute), which can produce incorrect URLs
    // that cause the editor to hang during initialization.
    try {
      (tinymce as any).baseURL = "https://unpkg.com/tinymce@5.10.9";
    } catch (_) {
      /* noop */
    }
    try {
      (tinymce as any).suffix = ".min";
    } catch (_) {
      /* noop */
    }

    return tinymce.init({
      selector,
      skin: false,
      content_css: false,
      content_style:
        (tinyMceCss?.content || "") +
        " body { font-size: 13px; font-family: Arial, sans-serif; }",
      plugins: "lists link",
      toolbar:
        "bold italic underline strikethrough | bullist numlist | link | removeformat",
      menubar: false,
      statusbar: false,
      branding: false,
      resize: false,
      height: 200,
      ...options,
    });
  },

  /**
   * Remove TinyMCE instance by selector
   */
  remove(selector: string): void {
    try {
      const pageWindow =
        typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      if (typeof (pageWindow as any).tinymce !== "undefined") {
        const editor = (pageWindow as any).tinymce.get(
          selector.replace("#", "")
        );
        if (editor) {
          editor.remove();
        }
      }
    } catch (e) {
      console.warn("[TinyMCEBundler] Error removing editor:", e);
    }
  },

  /**
   * Get content from TinyMCE editor
   */
  getContent(selector: string, format: string = "html"): string {
    try {
      const pageWindow =
        typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      if (typeof (pageWindow as any).tinymce !== "undefined") {
        const editor = (pageWindow as any).tinymce.get(
          selector.replace("#", "")
        );
        if (editor) {
          return editor.getContent({ format });
        }
      }
    } catch (e) {
      console.warn("[TinyMCEBundler] Error getting content:", e);
    }
    return "";
  },
};
