# Work Plan: FR-018 Offline Support (Web)

## Vision & Metrics
Deliver resilient offline UX: cached reads, queued writes, and safe auto-retry.
- Availability: App shell loads offline; key views readable offline.
- Reliability: 0 data loss in queued mutations; clear conflict handling.
- Performance: ICS load not applicable; IndexedDB ops < 50ms median.

## Epics

## Epic E1: Caching & Service Worker
**Description:** Precache app shell; runtime caching for GETs.
**Success Criteria:** App loads offline; GETs fall back to cache with SW.

### US-1301: PWA Setup & Precache
- Acceptance: `vite-plugin-pwa` with `injectManifest`; precache index, assets, icons; manifest with offline-first basics.
- Tech: Workbox; Vite config; versioned cache.

### US-1302: Runtime Caching for API GETs
- Acceptance: Network-first with fallback to cache for `/api/**`; TTL tuning.
- Tech: Workbox routing & strategies; cache-only on offline.

## Epic E2: IndexedDB Cache & Queue
**Description:** Local stores for cached resources and pending mutations.
**Success Criteria:** Reads served from `cache`; writes enqueued to `queue` when offline.

### US-1303: IndexedDB Schema via `idb`
- Acceptance: `cache` and `queue` object stores; typed helpers; migrations.
- Tech: Keying scheme per design; `updatedAt` per entry.

### US-1304: RTK Query Base Query Wrapper
- Acceptance: Wrap `fetchBaseQuery`; offline detection; enqueue mutations; GET fallback to cache.
- Tech: Optimistic responses where safe; error mapping.

## Epic E3: Optimistic UI & Reconciliation
**Description:** Optimistic updates and conflict resolution.
**Success Criteria:** `syncPending` flows; conflict toasts; auto-refresh.

### US-1305: Optimistic Mutations
- Acceptance: Create/complete/approve/swap apply optimistic updates; mark `syncPending`.
- Tech: RTK Query `onQueryStarted` pattern; cache updates.

### US-1306: Queue Drainer & Backoff
- Acceptance: Drain on `online` with FIFO + exponential backoff; halt on 401/403; resume after re-auth.
- Tech: Background worker; visibilitychange trigger.

### US-1307: Conflict Detection & Handling
- Acceptance: Detect via 409 or `updatedAt`/ETag mismatch; refresh entity; surface toast; keep local note if needed.
- Tech: Minimal additions to entities to include `updatedAt` where missing.

## Epic E4: UI – Offline Indicators & Activity Panel
**Description:** Surface connectivity and queue state.
**Success Criteria:** Banner, pending list, per-item badges.

### US-1308: Connectivity Monitor & Banner
- Acceptance: Global banner on offline; auto-hide on online; attempts indicator.
- Tech: `navigator.onLine` + events; Redux slice for connectivity.

### US-1309: Activity Panel
- Acceptance: List queued items with retry/cancel; counts badge in header.
- Tech: Drawer component; Tailwind; accessible interactions.

### US-1310: Per-item `syncPending` Badges
- Acceptance: Task cards show pending state; clears on success.
- Tech: Conditional UI with Tailwind.

## Epic E5: Tests – Unit & E2E
**Description:** Validate offline caching, queueing, draining, and conflicts.
**Success Criteria:** High confidence in offline flows.

### US-1311: Unit – Base Query & DB Helpers
- Acceptance: Offline detection paths; enqueue; read from cache; backoff math.
- Tech: Vitest; idb mocks.

### US-1312: E2E – Offline/Online Cycles
- Acceptance: Playwright tests toggling offline; verify replay and UI indicators.
- Tech: Service worker-aware setup.

## Sprint Plan

## Sprint 1: SW + IndexedDB + BaseQuery
- US-1301, US-1302, US-1303, US-1304, US-1311

## Sprint 2: Optimistic UI + Drainer + Indicators + E2E
- US-1305, US-1306, US-1307, US-1308, US-1309, US-1310, US-1312

## Dependencies & Risks
- Dependencies: FR-015 active group (for keys); FR-016 preferences (locale/timezone for date rendering);
- Risks: Complex conflict scenarios; SW caching pitfalls; auth expiry during offline. Mitigate with careful scoping and halting on auth errors.

## Release Phases
- Phase 1: Read-only offline and queueing.
- Phase 2: Full optimistic flows and UI panel.
