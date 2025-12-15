# Work Plan: FR-015 Multi-Group Support

## Vision & Metrics
Enable users to create/join multiple groups, switch context seamlessly, and ensure strict per-group isolation across tasks, leaderboards, and notifications.
- Isolation: All operations scoped by `groupId` with membership checks.
- UX: Group switch reflects across views instantly; clear group headers.
- Performance: Negligible overhead from scoping; caches and websockets keyed by `groupId`.

## Epics

## Epic E1: Backend – Groups & Memberships
**Description:** Core entities, repositories, services, and controllers.
**Success Criteria:** Create/list/join groups and list members; active group endpoint.

### US-1001: Group & Membership Entities + Repos
- Acceptance: Models per design; Mongo indexes (`groups`, `memberships`).
- Tech: `GroupRepository`, `MembershipRepository` with CRUD and checks.

### US-1002: GroupService & GroupController
- Acceptance: `POST /api/groups`, `GET /api/groups`, `POST /api/groups/{id}/join`, `GET /api/groups/{id}/members`.
- Tech: Auth required; invite code validation; role assignment.

### US-1003: ContextService & Active Group API
- Acceptance: `PUT /api/context/active-group` updates `activeGroupId` after membership validation.
- Tech: Store on profile; return success.

## Epic E2: Backend – Scoping & Guards
**Description:** Enforce `groupId` scoping across repositories and caches; membership authorization filter.
**Success Criteria:** No cross-group reads/writes; cache/websocket keys include `groupId`.

### US-1004: GroupMembershipFilter
- Acceptance: Validates membership for requests requiring `groupId` using query or context.
- Tech: ASP.NET Core `IAsyncActionFilter` per design.

### US-1005: Repository Scoping Helpers
- Acceptance: Add `ScopeToGroup(groupId)` helper and apply across repositories minimally.
- Tech: Builders filter helpers; audits to confirm usage.

### US-1006: Cache & SignalR Keys
- Acceptance: Include `groupId` in Redis keys and SignalR groups (`group-{groupId}`).
- Tech: Update affected services (leaderboard, notifications, dashboard).

## Epic E3: Frontend – Group Switcher & State
**Description:** Dropdown for group switching; global context state; query updates.
**Success Criteria:** Switching updates UI and server queries; persists in localStorage.

### US-1007: Context Slice & Hook
- Acceptance: Redux slice with `activeGroupId`, actions `setActiveGroup`, selector hook.
- Tech: TypeScript, RTK.

### US-1008: GroupSwitcher Component
- Acceptance: Header dropdown listing user groups with role badges; persists selection; triggers refetch.
- Tech: Tailwind; accessibility; mobile-friendly.

### US-1009: Query Updates with groupId
- Acceptance: Add `groupId` param to queries/mutations and SignalR subscriptions; show group headers in pages.
- Tech: RTK Query; minor component updates.

## Epic E4: Tests – Unit, Integration, E2E
**Description:** Validate membership checks, scoping, cache keys, SignalR grouping, and UI switching.
**Success Criteria:** ~70% coverage; isolation guaranteed by tests.

### US-1010: Unit – Services & Filter
- Acceptance: Membership validation, active group set, filter behaviors.
- Tech: xUnit; Moq; FluentAssertions.

### US-1011: Integration – Isolation
- Acceptance: Cross-group data access blocked; endpoints require membership.
- Tech: WebApplicationFactory; seeded groups/users.

### US-1012: Frontend – Switcher & Queries
- Acceptance: Switch updates views; localStorage persistence; group name surfaced in headers and notifications.
- Tech: Vitest + RTL.

## Sprint Plan

## Sprint 1: Backend Core + Scoping
- US-1001, US-1002, US-1003, US-1004, US-1005

## Sprint 2: Frontend Switcher + Keys + Tests
- US-1006, US-1007, US-1008, US-1009, US-1010, US-1011, US-1012

## Dependencies & Risks
- Dependencies: Auth (FR-001), Tasks/Categories/Leaderboards/Notifications; frontend Redux slice addition.
- Risks: Missed scoping in legacy code; confusing UX; cache collisions. Mitigate with audits, headers, and key prefixes.

## Release Phases
- Phase 1: Core entities, scoping, and group switcher.
- Phase 2: Broader audit of all features and polish.
