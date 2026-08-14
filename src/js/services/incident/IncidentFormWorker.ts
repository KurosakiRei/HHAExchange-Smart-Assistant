import { IncidentAutofillBus } from "./IncidentAutofillBus";
import { IncidentAutofillOrchestrator } from "./IncidentAutofillOrchestrator";

export class IncidentFormWorker {
  private static started = false;
  private static processing = false;
  private static unsubscribe: (() => void) | null = null;
  private static visibilityBound = false;

  static init(): void {
    if (this.started) {
      return;
    }
    this.started = true;

    if (window.self !== window.top) {
      console.log("[IncidentFormWorker] Skip iframe context");
      return;
    }

    console.log("[IncidentFormWorker] Initialized on forms host");

    this.unsubscribe = IncidentAutofillBus.onChange(() => {
      void this.tryProcess();
    });

    if (!this.visibilityBound) {
      this.visibilityBound = true;
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          void this.tryProcess();
        }
      });
      window.addEventListener("focus", () => {
        void this.tryProcess();
      });
    }

    void this.tryProcess();
  }

  private static async tryProcess(): Promise<void> {
    if (this.processing) {
      return;
    }

    const job = IncidentAutofillBus.getJob();
    if (!job) {
      return;
    }

    if (job.status !== "PENDING" && job.status !== "OPENING") {
      return;
    }

    if (!IncidentAutofillBus.isCurrentPageTarget(job)) {
      return;
    }

    if (document.visibilityState === "hidden") {
      return;
    }

    this.processing = true;
    IncidentAutofillBus.updateStatus("PROCESSING");

    try {
      const orchestrator = new IncidentAutofillOrchestrator();
      const result = await orchestrator.run(job.payload, {
        root: document,
        allowNavigation: true,
        waitForRenderMs: 1200,
        maxNavigationSteps: 8,
        fieldInteractionDelayMs: 260,
        branchRevealWaitMs: 520,
      });

      IncidentAutofillBus.complete({
        ...result,
        jobId: job.id,
      });

      console.log("[IncidentFormWorker] Job completed:", job.id);
    } catch (error) {
      const message =
        (error as Error)?.message || "Unknown autofill worker error";
      IncidentAutofillBus.fail(message, {
        status: "FAILED",
        jobId: job.id,
        startedAt: Date.now(),
        endedAt: Date.now(),
        totalFields: 0,
        successCount: 0,
        failedFields: [
          {
            fieldId: "runtime",
            label: "Incident Worker",
            code: "runtime_error",
            reason: message,
            suggestion: "请刷新官方 Form 页面后重试自动填写。",
          },
        ],
        blockedActions: [],
        manualSubmitRequired: true,
      });
      console.error("[IncidentFormWorker] Job failed:", message);
    } finally {
      this.processing = false;
    }
  }
}
