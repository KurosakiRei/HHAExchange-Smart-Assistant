export type M11QFaxMode = "builtin" | "custom";

export interface M11QBuiltinFaxOption {
  id: string;
  label: string;
  fax: string;
}

export interface M11QFaxConfig {
  mode: M11QFaxMode;
  builtinId: string;
  customFax: string;
  remember: boolean;
}

const STORAGE_KEY = "hha_m11q_fax_config";
const DEFAULT_BUILTIN_ID = "8av";

const BUILTIN_FAX_OPTIONS: ReadonlyArray<M11QBuiltinFaxOption> = [
  { id: "main", label: "Main", fax: "718-646-0680" },
  { id: "queens", label: "Queens", fax: "718-943-0902" },
  { id: "flushing", label: "Flushing", fax: "718-353-2571" },
  { id: "8av", label: "8AV", fax: "718-676-0957" },
  { id: "chinatown", label: "Chinatown", fax: "646-448-4353" },
];

const DEFAULT_CONFIG: M11QFaxConfig = {
  mode: "builtin",
  builtinId: DEFAULT_BUILTIN_ID,
  customFax: "",
  remember: true,
};

function sanitizeFax(value: string): string {
  return (value || "").trim();
}

export class M11QConfigService {
  static getBuiltinFaxOptions(): ReadonlyArray<M11QBuiltinFaxOption> {
    return BUILTIN_FAX_OPTIONS;
  }

  static getBuiltinById(id: string): M11QBuiltinFaxOption | undefined {
    return BUILTIN_FAX_OPTIONS.find((item) => item.id === id);
  }

  static getDefaultConfig(): M11QFaxConfig {
    return { ...DEFAULT_CONFIG };
  }

  static load(): M11QFaxConfig {
    const saved = GM_getValue<Partial<M11QFaxConfig> | null>(STORAGE_KEY, null);
    if (!saved || typeof saved !== "object") {
      return this.getDefaultConfig();
    }

    const config: M11QFaxConfig = {
      mode: saved.mode === "custom" ? "custom" : "builtin",
      builtinId:
        typeof saved.builtinId === "string"
          ? saved.builtinId
          : DEFAULT_BUILTIN_ID,
      customFax: sanitizeFax(
        typeof saved.customFax === "string" ? saved.customFax : ""
      ),
      remember: saved.remember !== false,
    };

    if (!config.remember) {
      return this.getDefaultConfig();
    }

    if (!this.getBuiltinById(config.builtinId)) {
      config.builtinId = DEFAULT_BUILTIN_ID;
    }

    if (config.mode === "custom" && !config.customFax) {
      config.mode = "builtin";
    }

    return config;
  }

  static save(config: M11QFaxConfig): void {
    if (!config.remember) {
      GM_setValue(STORAGE_KEY, this.getDefaultConfig());
      return;
    }

    const normalized: M11QFaxConfig = {
      mode: config.mode === "custom" ? "custom" : "builtin",
      builtinId:
        this.getBuiltinById(config.builtinId)?.id || DEFAULT_BUILTIN_ID,
      customFax: sanitizeFax(config.customFax),
      remember: true,
    };

    if (normalized.mode === "custom" && !normalized.customFax) {
      normalized.mode = "builtin";
    }

    GM_setValue(STORAGE_KEY, normalized);
  }

  static resolveFaxNumber(
    config: Pick<M11QFaxConfig, "mode" | "builtinId" | "customFax">
  ): string {
    if (config.mode === "custom") {
      return sanitizeFax(config.customFax);
    }

    return (
      this.getBuiltinById(config.builtinId)?.fax ||
      this.getBuiltinById(DEFAULT_BUILTIN_ID)!.fax
    );
  }

  static formatOptionLabel(option: M11QBuiltinFaxOption): string {
    return `${option.label} - ${option.fax}`;
  }
}
