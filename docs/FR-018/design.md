# FR-018: Offline Support (Web)

## Overview
Enable resilient offline usage for the web app: read cached data, queue mutations while offline, and auto-retry when connectivity is restored. Use service workers, IndexedDB for cache and queue, and RTK Query with persistence.

## Goals
- Offline-ready shell: load app, static assets, and last-known state.
- Read: show cached lists (tasks, categories) and detail views when offline.
- Write: queue mutations (create/complete/approve/swap) and replay safely.
- Conflict handling: detect server changes; apply reconciliation rules.
- UX: clear offline indicators, activity queue status, manual retry.

## Non-Goals
- Full offline parity for all features (exports, OAuth sync).  
- Mobile PWA install specifics beyond basic manifest.

## Architecture
- Service Worker (Vite): precache core assets (App shell), runtime caching for API GETs with stale-while-revalidate.
- IndexedDB: two stores
  - `cache`: entity caches (tasks, categories, dashboard summaries).
  - `queue`: pending mutations with payload, endpoint, headers, createdAt.
- RTK Query: custom baseQuery wrapper to detect offline and enqueue writes; hydrate queries from cache.
- Connectivity Monitor: listens to `navigator.onLine`, `online/offline` events, performs background drain.

## Data & Storage
- IndexedDB schema via `idb` library:
  - `cache`: key space by resource (`tasks:list:{groupId}`, `tasks:detail:{taskId}`, `categories:list:{groupId}`) storing JSON + `updatedAt`.
  - `queue`: auto-increment `id`, fields: `{ method, url, body, headers, groupId, userId, createdAt, attempts }`.

## Frontend Implementation
- Service Worker:
  - Use `workbox` or `vite-plugin-pwa` with `injectManifest`.
  - Precache: `index.html`, main chunks, CSS, icons.
  - Runtime caching: GET `/api/**` with network-first fallback to cache; cache successful responses with short TTL.

- RTK Query baseQuery:
  - Wrap `fetchBaseQuery`; on offline or fetch failure with `TypeError: Failed to fetch`, enqueue mutation to `queue` and return optimistic response if possible.
  - For GETs, attempt IndexedDB cache read when offline.

- Optimistic UI & Reconciliation:
  - For `createTask`, `completeTask`, `approveTask`, `swapRequest`: apply optimistic updates; mark entities with `syncPending=true`.
  - On drain success: clear `syncPending` and refresh queries.
  - On conflict (HTTP 409 or diff on ETag/updatedAt): show toast, refresh entity, optionally keep local note.

- Queue Drainer:
  - Background task runs when online; processes `queue` in FIFO, with exponential backoff.
  - Groups requests by endpoint type where safe (e.g., batch complete), otherwise single.
  - Stop on auth errors (401/403); require manual re-login.

- UI
  - Global offline banner with reconnect attempts.
  - Activity panel listing pending sync items, with retry/cancel.
  - Per-item badges `syncPending` on task cards.

## Backend Considerations
- No new endpoints; rely on existing Controllers.  
- Recommend ETag support and `updatedAt` on entities to help conflict detection.  
- Rate-limit replay safely; idempotent endpoints preferred (e.g., completion can be safely repeated).

## Testing
- Frontend:
  - Simulate offline via `vi.spyOn(navigator, 'onLine', ...)` and `dispatchEvent(new Event('offline'))`.
  - Verify GET falls back to cache; mutations go to queue.
  - Drain on `online` event; confirm retries and optimistic reconciliation.

- E2E (optional):
  - Playwright: toggle offline, operate UI, toggle online, assert server state reconciles.

## Observability
- Track queue length, retry counts, conflict occurrences.
- Persist lightweight telemetry in memory; do not leak PII.

## Security & Privacy
- Store only necessary data in IndexedDB; avoid secrets.  
- Headers: store auth token only if necessary and short-lived; prefer re-fetching fresh token at drain time.

## Edge Cases
- User switches `activeGroupId` while offline: queue still records `groupId`; upon drain, use recorded value.
- Tasks deleted on server while offline: local cached detail invalidates upon refresh.
- Long offline periods: cap queue size; oldest dropped with warning.
