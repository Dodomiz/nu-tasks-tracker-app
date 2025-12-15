# Work Plan: FR-016 User Profile & Preferences

## Vision & Metrics
Empower users to manage personal profiles and preferences with multi-group awareness, consistent application across backend services and frontend UI.
- Performance: `GET me/preferences` in ≤150ms with cache; updates in ≤250ms.
- Reliability: Effective merge honors global + per-group overrides; robust validation.
- UX: Clear tabs, sensible defaults, instant theme/density changes.

## Epics

## Epic E1: Backend – Users & Preferences APIs
**Description:** Add controllers, services, repositories for profile and preferences with merge logic and caching.
**Success Criteria:** All endpoints return correct data; updates validate and persist; cache invalidation works.

### US-1101: UserRepository & Service
- Acceptance: `GetMeAsync`, `UpdateMeAsync` (displayName, avatarUrl, bio); no email changes.
- Tech: Mongo CRUD; unique email index.

### US-1102: UserPreferencesRepository & Service
- Acceptance: `GetRawAsync`, `GetEffectiveAsync(userId, activeGroupId)` merge global + per-group; `UpdateGlobalAsync`; `UpsertGroupOverrideAsync`; `RemoveGroupOverrideAsync`.
- Tech: Array filters for `perGroup`; partial updates; Redis cache for raw/effective.

### US-1103: UsersController & PreferencesController
- Acceptance: `GET /api/users/me`, `PUT /api/users/me`; `GET /api/users/me/preferences`; `PUT /api/users/me/preferences/global`; `PUT /api/users/me/preferences/group/{groupId}`; `DELETE /api/users/me/preferences/group/{groupId}`.
- Tech: Controllers with validation; membership check via `GroupMembershipRepository`.

## Epic E2: Validation & Caching
**Description:** Enforce enums/ranges; cache effective prefs per group; invalidate on changes.
**Success Criteria:** Invalid inputs rejected; cache reflects updates immediately.

### US-1104: Validation Rules
- Acceptance: Theme `light|dark|system`, density `compact|comfortable`, locale BCP 47, timezone IANA, quiet hours HH:mm and crossing-midnight supported, filters size caps.
- Tech: Controller validators; helper for quiet hours normalization.

### US-1105: Redis Cache Keys
- Acceptance: `user:prefs:{userId}` and `user:prefs:eff:{userId}:{groupId}` with invalidation on any update.
- Tech: IDistributedCache integration; TTL 30m.

## Epic E3: Frontend – Profile & Preferences UI
**Description:** Profile page and Preferences page with tabs and group overrides.
**Success Criteria:** Users edit profile; update global and per-group preferences; immediate theme/density updates.

### US-1106: RTK Query Endpoints
- Acceptance: `getMe`, `updateMe`, `getPreferences`, `updateGlobalPreferences`, `upsertGroupPreferences`, `removeGroupPreferences`.
- Tech: Typed services; error handling; optimistic UI where safe.

### US-1107: Profile Page
- Acceptance: Avatar upload (reuse FR-008 pattern), displayName input, bio textarea; save.
- Tech: Tailwind; storage integration; validation messages.

### US-1108: Preferences Page with Tabs
- Acceptance: General (locale/timezone/theme/density), Notifications (push/email/in-app, quiet hours, channels), Defaults (view, filters), Privacy (profileVisibility), Group Overrides (active group, edit overrides).
- Tech: Controlled inputs; time pickers; chips; persistence.

### US-1109: Apply Preferences
- Acceptance: Theme/density applied to root; locale/timezone used by date formatting; default view used in Dashboard (FR-012); notification topics adjusted client-side.
- Tech: Tailwind class toggles; i18n; FCM topic subscriptions.

## Epic E4: Tests – Unit & Integration & Frontend
**Description:** Validate merge logic, validations, endpoints, and UI flows.
**Success Criteria:** ~70% coverage with edge cases.

### US-1110: Unit – UserPreferencesService
- Acceptance: Merge global and per-group; quiet hours normalization; invalid enum/time rejected.
- Tech: xUnit; FluentAssertions.

### US-1111: Integration – Controllers
- Acceptance: GET/PUT flows for me and preferences; group override auth; cache invalidation checks.
- Tech: WebApplicationFactory; seeded users/groups.

### US-1112: Frontend – Preferences & Profile
- Acceptance: Tabs render; toggles update; group overrides respect `activeGroupId`.
- Tech: Vitest + RTL.

## Sprint Plan

## Sprint 1: Backend Core + Validation + Cache
- US-1101, US-1102, US-1103, US-1104, US-1105, US-1110, US-1111

## Sprint 2: Frontend UI + Application
- US-1106, US-1107, US-1108, US-1109, US-1112

## Dependencies & Risks
- Dependencies: FR-015 `activeGroupId`; FR-008 storage; FR-009 notifications.
- Risks: Preference bloat; misapplied overrides; cache staleness. Mitigate with caps, merge tests, invalidation.

## Release Phases
- Phase 1: Backend APIs and merge logic.
- Phase 2: Frontend UI and application of preferences.
