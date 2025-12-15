# Work Plan: FR-017 Calendar Sync (External)

## Vision & Metrics
Provide one-way calendar sync per user+group via ICS feeds and optional provider pushes (Google, Outlook), respecting preferences and scoping.
- Performance: ICS generation ≤300ms for typical ranges; push jobs resilient.
- Security: Tokenized ICS URLs; encrypted OAuth tokens; no secrets in logs.
- Reliability: Debounced, retry-backed push flows; robust timezone handling.

## Epics

## Epic E1: Backend – Settings & ICS
**Description:** Settings CRUD, ICS feed generation, validation and security.
**Success Criteria:** Users can enable sync, fetch ICS, and rotate tokens.

### US-1201: CalendarSyncSettings Repository & Service
- Acceptance: CRUD by `{ userId, groupId }`; unique index; filters validation.
- Tech: Mongo; DTOs; updatedAt tracking.

### US-1202: Settings Controller
- Acceptance: `GET /api/calendar-sync/settings`, `PUT /api/calendar-sync/settings` with validation and membership checks.
- Tech: ASP.NET Core Controllers; FR-015 membership validation.

### US-1203: ICS Endpoint & Builder
- Acceptance: `GET /api/calendar-sync/ics/{userId}/{groupId}/{token}` returns valid ICS for filtered tasks; timezone-aware.
- Tech: `IcsBuilder` producing `VCALENDAR` + `VEVENT`; task filters via `TaskRepository`.

## Epic E2: Backend – Provider Push (OAuth)
**Description:** Connect accounts and push updates to external calendars.
**Success Criteria:** Users can connect Google/Outlook; pushes succeed with retries.

### US-1204: OAuth Connect & Token Storage
- Acceptance: `POST /api/calendar-sync/google/connect` and `/outlook/connect` initiate flows; callbacks save encrypted tokens.
- Tech: ProviderAccess scaffolds; KMS/DPAPI; never log tokens.

### US-1205: Push Services & Job
- Acceptance: `POST /api/calendar-sync/push` schedules `CalendarSyncJob`; job debounces and retries; maps create/update/delete.
- Tech: Hangfire; `GoogleCalendarAccess`, `OutlookCalendarAccess` abstractions.

## Epic E3: Frontend – Preferences Tab
**Description:** Settings UI in Preferences with ICS URL, token rotation, and provider connect.
**Success Criteria:** Users enable channels, copy ICS URL, and connect providers.

### US-1206: RTK Query Endpoints
- Acceptance: `getCalendarSyncSettings`, `updateCalendarSyncSettings`, `pushCalendarSync`.
- Tech: Typed endpoints; error handling.

### US-1207: Calendar Sync Tab UI
- Acceptance: Toggles for channels; ICS URL display + copy; rotate token; connect buttons and status.
- Tech: Tailwind; informative copy; warnings for one-way sync.

## Epic E4: Tests – Unit & Integration
**Description:** Validate ICS generation, settings flows, endpoint security, and job behavior.
**Success Criteria:** ~70% coverage; provider access mocked.

### US-1208: Unit – IcsBuilder
- Acceptance: Timezone correctness; status mapping; filters applied; exclude tasks without dueDate.
- Tech: xUnit; FluentAssertions.

### US-1209: Integration – Settings & ICS Endpoint
- Acceptance: Settings upsert; ICS secured via token; membership required.
- Tech: WebApplicationFactory; seeded tasks and groups.

### US-1210: Job & Push Flow
- Acceptance: Debounced pushes; retry/backoff on provider errors; cancellation updates.
- Tech: Hangfire test harness; mocked ProviderAccess.

## Sprint Plan

## Sprint 1: Settings + ICS + Tests
- US-1201, US-1202, US-1203, US-1208, US-1209

## Sprint 2: Provider Push + Frontend
- US-1204, US-1205, US-1206, US-1207, US-1210

## Dependencies & Risks
- Dependencies: FR-015 group scoping; FR-016 preferences (timezone/locale); FR-005 tasks.
- Risks: Provider rate limits; token storage security; ICS URL leakage. Mitigate with debounce, encryption, rotation.

## Release Phases
- Phase 1: ICS feeds and settings.
- Phase 2: OAuth providers and push jobs.
