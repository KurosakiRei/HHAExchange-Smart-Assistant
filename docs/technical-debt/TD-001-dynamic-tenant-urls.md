---
id: TD-001
title: Dynamic HHAExchange Tenant URL Detection
status: Fixed
created: 2026-02-19
fixed: 2026-02-19
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
