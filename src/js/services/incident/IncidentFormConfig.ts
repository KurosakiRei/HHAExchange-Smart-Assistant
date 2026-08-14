import { IncidentType } from "./IncidentTypes";

export interface IncidentFormConfigState {
  hospitalizationUrl: string;
  fallUrl: string;
  deathUrl: string;
}

const DEFAULT_CONFIG: IncidentFormConfigState = {
  hospitalizationUrl: "https://forms.office.com/r/uKKpdsus4H",
  fallUrl: "https://forms.office.com/r/gbMzuZavDr",
  deathUrl: "https://forms.office.com/r/ZqGQfwR7Np",
};

function normalizeUrl(raw: string): string {
  const value = (raw || "").trim();
  if (!value) {
    return "";
  }

  try {
    return new URL(value).toString();
  } catch {
    return value;
  }
}

export class IncidentFormConfig {
  static getConfig(): IncidentFormConfigState {
    return {
      hospitalizationUrl: normalizeUrl(DEFAULT_CONFIG.hospitalizationUrl),
      fallUrl: normalizeUrl(DEFAULT_CONFIG.fallUrl),
      deathUrl: normalizeUrl(DEFAULT_CONFIG.deathUrl),
    };
  }

  static getUrlForIncident(incidentType: IncidentType): string {
    const config = this.getConfig();
    if (incidentType === "hospitalization") {
      return config.hospitalizationUrl;
    }
    if (incidentType === "fall") {
      return config.fallUrl;
    }
    return config.deathUrl;
  }
}
