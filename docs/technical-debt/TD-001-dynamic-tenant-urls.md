---
id: TD-001
title: Dynamic HHAExchange Tenant URL Detection
status: Fixed
created: 2026-02-19
fixed: 2026-02-19
last-updated: 2026-03-19
severity: Critical
components:
  - VisitMonitor.ts
  - ApiParamProvider.ts
  - IncomingCallHandler.ts
  - QAReportTab.ts
---

## Summary

Fixed a critical system-wide issue where API calls were hardcoded to use a specific tenant version path (`ENT2507010000`). When HHAExchange upgraded their servers to `ENT2602010000` (v26.02) in Feb 2026, the hardcoded paths became invalid, causing the server to detect cross-tenant unauthorized access and immediately terminate the user's session.

## Root Cause

The codebase contained 16 instances of hardcoded URLs like:
`https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx`

The server enforces strict tenant path matching. If a user logged into `ENT2602010000` makes an API call to `ENT2507010000`, the session is invalidated.

## Resolution

Implemented a dynamic tenant base URL detection strategy.

### Code Changes

1.  **`VisitMonitor.ts`**: Added file-level helper `detectTenantBaseUrl()` which reads `window.location.pathname` (or script src/href fallbacks) to determine the current running tenant path (e.g., `ENT2602010000`).
2.  **`ApiParamProvider.ts`**: Added `detectTenantBaseUrl()` and a public static method `getTenantBaseUrl()` for other modules to use.
3.  **`IncomingCallHandler.ts` & `QAReportTab.ts`**: Replaced all hardcoded constants with dynamic values using the helper.

### Future Prevention

- **Do not hardcode `ENT` paths.** Always use `ApiParamProvider.getTenantBaseUrl()` or `detectTenantBaseUrl()`.
- **HHAWS Paths**: The Web Service path `/HHAWSENT.../` follows the same versioning pattern and is now also dynamic:
  ```typescript
  const HHAWS_BASE_PATH = `/HHAWS${TENANT_BASE_URL.replace("https://app.hhaexchange.com/", "")}/`;
  ```

## Verification

- Verified via `grep` that zero occurrences of `ENT2507010000` remain in the production source code.
- Confirmed logic handles any future version (e.g., `ENT27...`, `ENT28...`) without code changes.

---

## Follow-up: ENT2603010000 Upgrade (2026-03-19)

### New Finding

When HHAExchange upgraded to `ENT2603010000` (v26.03), the original `detectTenantBaseUrl()` still correctly identified `/ENT2603010000/` on the main page. However, the Home page (`Home_ns.aspx`) iframes were found to use **different URL prefix patterns** that the original regex (`/\/(ENT\d+)\//`) did not recognise:

| iframe ID | URL pattern | Scripts loaded from |
|---|---|---|
| `iframeNotisessioncreation` | `/HHANotification2603010000/default.aspx` | `HHANotification2603010000/…` only |
| `iframeevent` | `/ENT2603010000/Events/…` | Correctly detected ✓ |
| `iframesysnoti` | `/HHANotification2603010000/ManageNotification_ns.aspx` | `HHANotification2603010000/…` only |
| `iframesentmessages` | `/HHANotification2603010000/SentMessages_ns.aspx` | `HHANotification2603010000/…` only |
| `iframesentodo` | `/HHANotification2603010000/SentTodo_ns.aspx` | `HHANotification2603010000/…` only |
| `iframemsg` | `/ENTP2603010000/clientapp/…` | Unknown |

Because `HHANotification` iframes load **no scripts from `/ENT…/` paths**, all three original detection methods failed, and the stale `ENT2602010000` fallback was used. This is the root cause of the residual session-kill issue in ENT2603.

In ENT2602 this was accidentally harmless because the fallback happened to match the live tenant. After the upgrade the fallback was one version behind.

### Fix Applied

Extended `detectTenantBaseUrl()` in all three files to:

1. **Recognise `HHANotification{version}` and `ENTP{version}` URL patterns** — the 10-digit version number is identical to the `ENT` prefix version, so `ENT{version}` is derived directly.
2. **Added Method 4 (parent-window lookup)** — for same-origin iframes (all `app.hhaexchange.com` frames) this succeeds even if none of the local URL/script methods work.
3. **Updated stale fallback** from `ENT2602010000` → `ENT2603010000`.

```typescript
function extractVersion(url: string): string | null {
  const m1 = url.match(/\/ENT(\d+)\//);
  if (m1) return m1[1];
  const m2 = url.match(/\/(?:HHANotification|ENTP)(\d+)\//);
  if (m2) return m2[1];
  return null;
}
// … Method 4 …
try {
  if (window.parent !== window) {
    const r4 = extractVersion(window.parent.location.href);
    if (r4) return `https://app.hhaexchange.com/ENT${r4}`;
  }
} catch (_) { /* cross-origin parent, skip */ }
```

### Future Prevention

- If HHAExchange introduces further URL prefixes (e.g., `HHAPortal{version}`, `API{version}`), add them to the non-capturing alternation group in `extractVersion()`: `\/(?:HHANotification|ENTP|NewPrefix)(\d+)\/`.
- The parent-window Method 4 provides a universal safety net for same-origin iframes regardless of their prefix.
