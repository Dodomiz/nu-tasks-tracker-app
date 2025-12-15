# Work Plan: FR-014 Reports & Analytics

## Vision & Metrics
Deliver performant, insightful reports for admins and users: fast aggregations, clear charts, exports, and nightly snapshots.
- Performance: Aggregations < 800ms for 10K tasks; exports < 5s.
- Reliability: Snapshot job < 2m per group; cache hot paths (15m TTL).
- Usability: Responsive charts; simple filters; consistent CSV/PDF outputs.

## Epics

## Epic E1: Backend – Aggregations & Endpoints
**Description:** Implement analytics repository pipelines and service methods; expose reporting endpoints.
**Success Criteria:** Group/user reports return accurate data within performance budgets.

### US-901: AnalyticsRepository Pipelines
- Acceptance: Implement counts, avg completion time, category breakdown, trends pipelines per design.
- Tech: MongoDB Aggregation; indexes; careful `$match` on date ranges.

### US-902: AnalyticsService – Group & User Reports
- Acceptance: Compose results; compute completionRate; guard invalid ranges.
- Tech: Methods `GetGroupStatsAsync`, `GetCategoryBreakdownAsync`, `GetTrendsAsync`, `GetUserReportAsync`.

### US-903: ReportsController Endpoints
- Acceptance: `GET /api/reports/group`, `GET /api/reports/user`; inputs validated; auth enforced.
- Tech: Controllers (ASP.NET Core), DTOs, pagination where applicable.

## Epic E2: Snapshots & Caching
**Description:** Nightly snapshot job; Redis cache for hot queries.
**Success Criteria:** Snapshot generated nightly per group; cache used by default for group reports.

### US-904: SnapshotJob & Snapshot Model
- Acceptance: Generate 90-day snapshot per group; persist to `analyticsSnapshots` with indexes.
- Tech: Hangfire recurring job; repository save/load; TTL/indexes per design.

### US-905: Redis Caching Layer
- Acceptance: Cache group reports for 15 minutes; invalidate on significant task updates.
- Tech: IDistributedCache/Redis integration; keys by `groupId+range`.

## Epic E3: Exports (CSV/PDF)
**Description:** Export APIs generating CSV and PDF.
**Success Criteria:** CSV and PDF downloads work reliably within time limits.

### US-906: CSV Exporter
- Acceptance: `GET /api/reports/export/csv` streams CSV for selected range.
- Tech: ExportService `GenerateCsvAsync` with RFC4180 compliance; proper headers.

### US-907: PDF Exporter
- Acceptance: `GET /api/reports/export/pdf` renders charts/tables to PDF.
- Tech: ExportService `GeneratePdfAsync` via Playwright/Chromium; rate limiting.

## Epic E4: Frontend – Reports Dashboard
**Description:** Build charts, widgets, filters, and export buttons.
**Success Criteria:** Interactive, responsive UI showing accurate data; exports trigger server endpoints.

### US-908: ReportsDashboard Page
- Acceptance: Widgets for totals/completion rate/avg time; charts for category (bar), trends (line), progress bars for overdue/completed.
- Tech: Chart.js; Tailwind; skeletons; localStorage filter persistence.

### US-909: Filters & Exports Integration
- Acceptance: Date range, category, status filters; CSV/PDF export buttons.
- Tech: RTK Query endpoints; debounced queries; download handling.

## Epic E5: Tests – Unit, Integration, E2E
**Description:** Validate pipelines, endpoints, snapshot job, and UI.
**Success Criteria:** ~70% coverage with edge/negative cases.

### US-910: Unit – AnalyticsRepository & Service
- Acceptance: Counts, avg time edge cases; category math; trend boundaries.
- Tech: xUnit; fixtures with seeded data.

### US-911: Integration – ReportsController
- Acceptance: Group/user endpoints with ranges; invalid range 400; auth guards.
- Tech: WebApplicationFactory; seeded tasks/feedback.

### US-912: Snapshot Job & Cache
- Acceptance: Nightly job generates snapshot; cache hits reduce latency; invalidation works.
- Tech: Hangfire test harness; Redis test doubles if needed.

### US-913: Frontend Component Tests
- Acceptance: Charts render with sample data; filters debounce; exports trigger calls.
- Tech: Vitest + RTL; Chart.js mocking.

## Sprint Plan

## Sprint 1: Backend Aggregations + Endpoints
- US-901, US-902, US-903, US-910, US-911

## Sprint 2: Snapshots, Caching, Exports, Frontend
- US-904, US-905, US-906, US-907, US-908, US-909, US-912, US-913

## Dependencies & Risks
- Dependencies: FR-005, FR-008, FR-010; Redis/Hangfire setup; headless Chromium.
- Risks: Heavy aggregations; PDF complexity; cache invalidation. Mitigate with indexes, snapshot usage, rate limits.

## Release Phases
- Phase 1: Aggregations + endpoints.
- Phase 2: Snapshots + caching + exports + dashboard.
