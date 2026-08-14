import {
  IncidentAutofillJob,
  IncidentAutofillJobStatus,
  IncidentAutofillResult,
  IncidentPayload,
  IncidentType,
  cloneIncidentAutofillJob,
  cloneIncidentPayload,
} from "./IncidentTypes";

declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue(key: string, value: any): void;

type JobListener = (job: IncidentAutofillJob | null) => void;

export class IncidentAutofillBus {
  private static readonly STORAGE_KEY = "hha_incident_autofill_bus";
  private static readonly EXPIRY_MS = 20 * 60 * 1000;
  private static readonly POLL_MS = 1000;
  private static listeners: JobListener[] = [];
  private static pollTimer: number | null = null;
  private static lastSnapshot = "";

  static createJob(
    incidentType: IncidentType,
    payload: IncidentPayload,
    targetUrl: string
  ): IncidentAutofillJob {
    const now = Date.now();
    const job: IncidentAutofillJob = {
      id: `incident_${now}_${Math.random().toString(36).slice(2, 9)}`,
      incidentType,
      targetUrl,
      payload: cloneIncidentPayload(payload),
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
      sourceHost: window.location.hostname,
    };

    GM_setValue(this.STORAGE_KEY, job);
    this.lastSnapshot = JSON.stringify(job);
    return job;
  }

  static getJob(): IncidentAutofillJob | null {
    const raw = GM_getValue<IncidentAutofillJob | null>(this.STORAGE_KEY, null);
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const job = cloneIncidentAutofillJob(raw);
    if (Date.now() - job.createdAt > this.EXPIRY_MS) {
      this.clearJob();
      return null;
    }

    return job;
  }

  static clearJob(): void {
    GM_setValue(this.STORAGE_KEY, null);
    this.lastSnapshot = "";
  }

  static updateStatus(
    status: IncidentAutofillJobStatus,
    patch?: Partial<IncidentAutofillJob>
  ): IncidentAutofillJob | null {
    const job = this.getJob();
    if (!job) {
      return null;
    }

    const next: IncidentAutofillJob = {
      ...job,
      ...patch,
      status,
      updatedAt: Date.now(),
    };
    GM_setValue(this.STORAGE_KEY, next);
    this.lastSnapshot = JSON.stringify(next);
    return next;
  }

  static complete(result: IncidentAutofillResult): IncidentAutofillJob | null {
    return this.updateStatus("COMPLETED", {
      result,
      errorMessage: undefined,
    });
  }

  static fail(
    message: string,
    result?: IncidentAutofillResult
  ): IncidentAutofillJob | null {
    return this.updateStatus("FAILED", {
      errorMessage: message,
      result,
    });
  }

  static isCurrentPageTarget(
    job: IncidentAutofillJob,
    href = typeof window !== "undefined" ? window.location.href : "",
    pageTitle?: string
  ): boolean {
    if (!job.targetUrl) {
      return false;
    }

    const resolvedPageTitle =
      pageTitle ?? (typeof document !== "undefined" ? document.title : "");

    try {
      const parsedTarget = new URL(job.targetUrl);
      const target = this.unwrapSafeLink(parsedTarget) || parsedTarget;
      const current = new URL(href);

      const targetIsForms = this.isFormsHost(target.hostname);
      const currentIsForms = this.isFormsHost(current.hostname);

      if (target.origin !== current.origin) {
        if (!(targetIsForms && currentIsForms)) {
          return false;
        }
      }

      if (target.pathname && target.pathname !== "/") {
        if (current.pathname !== target.pathname) {
          return this.isFormsShortUrlRedirectMatch(
            job.incidentType,
            target,
            current,
            resolvedPageTitle
          );
        }
      }

      const targetEntries = Array.from(target.searchParams.entries());
      if (targetEntries.length > 0) {
        for (const [key, value] of targetEntries) {
          if (current.searchParams.get(key) !== value) {
            return this.isFormsShortUrlRedirectMatch(
              job.incidentType,
              target,
              current,
              resolvedPageTitle
            );
          }
        }
      }

      return true;
    } catch {
      return href.includes(job.targetUrl);
    }
  }

  private static unwrapSafeLink(url: URL): URL | null {
    const host = (url.hostname || "").toLowerCase();
    if (!host.endsWith("safelinks.protection.outlook.com")) {
      return null;
    }

    const embedded = url.searchParams.get("url");
    if (!embedded) {
      return null;
    }

    try {
      return new URL(embedded);
    } catch {
      try {
        return new URL(decodeURIComponent(embedded));
      } catch {
        return null;
      }
    }
  }

  private static isFormsShortUrlRedirectMatch(
    incidentType: IncidentType,
    target: URL,
    current: URL,
    pageTitle: string
  ): boolean {
    const targetPath = target.pathname.toLowerCase();
    const currentPath = current.pathname.toLowerCase();

    const targetIsForms = this.isFormsHost(target.hostname);
    const currentIsForms = this.isFormsHost(current.hostname);

    if (!targetIsForms || !currentIsForms) {
      return false;
    }

    if (!targetPath.startsWith("/r/")) {
      return false;
    }

    if (currentPath !== "/pages/responsepage.aspx") {
      return false;
    }

    return this.isIncidentTypeCompatibleWithFormsTitle(incidentType, pageTitle);
  }

  private static isFormsHost(hostname: string): boolean {
    const host = (hostname || "").toLowerCase();
    return host === "forms.office.com" || host === "forms.microsoft.com";
  }

  private static isIncidentTypeCompatibleWithFormsTitle(
    incidentType: IncidentType,
    pageTitle: string
  ): boolean {
    const title = (pageTitle || "").toLowerCase();
    if (!title) {
      return true;
    }

    if (incidentType === "fall") {
      return title.includes("fall") || title.includes("accident");
    }

    if (incidentType === "hospitalization") {
      return title.includes("hospitalization");
    }

    if (incidentType === "death") {
      return title.includes("death");
    }

    return true;
  }

  static onChange(listener: JobListener): () => void {
    this.listeners.push(listener);
    if (this.pollTimer === null) {
      this.startPolling();
    }

    return () => {
      this.listeners = this.listeners.filter((entry) => entry !== listener);
      if (this.listeners.length === 0) {
        this.stopPolling();
      }
    };
  }

  private static startPolling(): void {
    this.pollTimer = window.setInterval(() => {
      const job = this.getJob();
      const snapshot = job ? JSON.stringify(job) : "";
      if (snapshot === this.lastSnapshot) {
        return;
      }

      this.lastSnapshot = snapshot;
      this.listeners.forEach((listener) => {
        try {
          listener(job);
        } catch (error) {
          console.error("[IncidentAutofillBus] Listener error:", error);
        }
      });
    }, this.POLL_MS);
  }

  private static stopPolling(): void {
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}
