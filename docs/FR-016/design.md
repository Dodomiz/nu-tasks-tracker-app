# FR-016: User Profile & Preferences

## Overview
Enable users to manage personal profile details and app preferences (locale, theme, notification settings, default views), with multi-group awareness introduced in FR-015. Persist preferences per user and optionally per group, applying them consistently across backend services and frontend UI.

## Goals
- Edit profile: display name, avatar, bio.
- Global preferences: language/locale, timezone, theme (light/dark/system), density (compact/comfortable).
- Notification preferences: push, email, in-app, quiet hours (DND), per-channel toggles for tasks/messages/alerts.
- Group-scoped overrides: allow per-group notification rules and default views.
- Default views: list vs calendar, default filters.
- Privacy controls: who can view profile elements (group members vs everyone in tenant).

## Non-Goals
- SSO profile sync (future).  
- Advanced compliance preferences (e.g., data export/erasure flows handled in FR-020+).

## Data Model (MongoDB)
Collections reuse `User` and introduce `UserPreferences`.

- User
  - id
  - email
  - displayName
  - avatarUrl
  - bio
  - createdAt, updatedAt

- UserPreferences
  - id
  - userId (unique index)
  - global: {
      locale: string,
      timezone: string,
      theme: 'light'|'dark'|'system',
      density: 'compact'|'comfortable',
      notifications: {
        pushEnabled: boolean,
        emailEnabled: boolean,
        inAppEnabled: boolean,
        quietHours: { start: string, end: string, timezone?: string },
        channels: {
          tasks: boolean,
          messages: boolean,
          alerts: boolean
        }
      },
      defaults: {
        view: 'list'|'calendar',
        filters: {
          status?: string[],
          categories?: string[],
          difficulty?: ('easy'|'medium'|'hard')[],
        }
      },
      privacy: {
        profileVisibility: 'group'|'tenant'
      }
    }
  - perGroup: Array<{
      groupId: string,
      notifications?: {
        pushEnabled?: boolean,
        emailEnabled?: boolean,
        inAppEnabled?: boolean,
        quietHours?: { start: string, end: string, timezone?: string },
        channels?: { tasks?: boolean, messages?: boolean, alerts?: boolean }
      },
      defaults?: { view?: 'list'|'calendar', filters?: { status?: string[], categories?: string[], difficulty?: ('easy'|'medium'|'hard')[] } }
    }>
  - createdAt, updatedAt

Indexes:
- `UserPreferences.userId` unique.
- `User.email` unique.
- `UserPreferences.perGroup.groupId` partial index via compound `{ userId, perGroup.groupId }` for query efficiency.

## Backend API (Controllers)
Use Controllers. Validation in Controller; services handle business logic.

- GET `/api/users/me` → returns `User` and effective preferences (merged global + activeGroup overrides).
- PUT `/api/users/me` → update displayName, avatarUrl, bio.
- GET `/api/users/me/preferences` → returns raw `UserPreferences` document and effective derived values.
- PUT `/api/users/me/preferences/global` → update global preferences (validate ranges for quiet hours, enum values).
- PUT `/api/users/me/preferences/group/{groupId}` → upsert per-group overrides (authorization: user must be member of group).
- DELETE `/api/users/me/preferences/group/{groupId}` → remove group override.

Auth & Scoping:
- Require JWT. Use `activeGroupId` from FR-015 for deriving effective preferences when relevant.
- Controller validates `groupId` membership via `GroupMembershipRepository`.

## Services
- `UserService`
  - `GetMeAsync(userId)` → returns `User`.
  - `UpdateMeAsync(userId, dto)` → updates profile, prevents email changes here.

- `UserPreferencesService`
  - `GetRawAsync(userId)` → returns `UserPreferences`.
  - `GetEffectiveAsync(userId, activeGroupId)` → merges global + per-group override for notifications/defaults.
  - `UpdateGlobalAsync(userId, GlobalPreferencesDto)` → validation: enums, quiet hours times, filter sanity.
  - `UpsertGroupOverrideAsync(userId, groupId, GroupPreferencesDto)` → membership check, merge semantics.
  - `RemoveGroupOverrideAsync(userId, groupId)` → delete override.

Merge rules:
- Effective = global, then apply perGroup[groupId] overrides (only provided fields).
- Quiet hours normalization to ISO times; timezone fallback to `global.timezone`.

## Repositories
- `UserRepository` (Mongo): CRUD for User, get by email.
- `UserPreferencesRepository` (Mongo): by userId, update subdocuments for perGroup efficiently (array filters), partial updates.

## Validation (Controller)
- Theme: light|dark|system.
- Density: compact|comfortable.
- Locale: BCP 47 tag (e.g., en-US), known list (frontend can provide).
- Timezone: IANA TZ database (e.g., America/Los_Angeles).
- Quiet hours: `start` and `end` 24h HH:mm strings; if `start == end` → disabled.
- Filters: max sizes (e.g., status ≤ 6, categories ≤ 20) to avoid bloated prefs.
- Group override: ensure user is group member.

## Caching
- Redis keys:
  - `user:prefs:{userId}` → raw prefs.
  - `user:prefs:eff:{userId}:{groupId}` → effective prefs. Invalidate on updates.

## Frontend (React + RTK Query + Tailwind)
- RTK Query endpoints:
  - `getMe`, `updateMe`.
  - `getPreferences`, `updateGlobalPreferences`, `upsertGroupPreferences`, `removeGroupPreferences`.
- Components:
  - Profile page: avatar upload (to Blob/S3, reuse Storage access pattern from FR-008), displayName, bio.
  - Preferences page: tabs (General, Notifications, Defaults, Privacy, Group Overrides).
  - Controls: locale select, timezone select, theme toggle, density radio, quiet hours time pickers, channel toggles, default view selector, filter chips.
  - Group Overrides tab: current `activeGroupId`, list and edit overrides.
- Apply preferences:
  - Theme/density via Tailwind classes and root state.
  - Locale/Timezone used for date formatting and scheduler; default view applied in Dashboard (FR-012).
  - Notification toggles affect FCM subscription topics client-side (opt-in/out).

## Testing
Backend (xUnit):
- `UserPreferencesServiceTests`:
  - Merge effective preferences with/without group override.
  - Validation failures (invalid enum, quiet hours range, non-member group).
  - Cache invalidation.

Frontend (Vitest + RTL):
- Render Preferences page; verify toggles update local state and dispatch `update` mutations.
- Group Overrides tab behavior with activeGroup.
- Theme application to root class list.

## Observability
- Serilog: log preference updates (non-PII), include userId and changed fields count.
- Avoid logging secrets or full documents.

## Migration/Seeding
- On first login, create default `UserPreferences` for user if missing.
- Backfill locale/timezone to sensible defaults (`en-US`, system TZ) when unknown.

## Edge Cases
- Quiet hours crossing midnight (e.g., 22:00–06:00) supported; evaluation logic in Notification pipeline (FR-009) respects effective quiet hours.
- If `perGroup` override exists for inactive group, it remains stored; effective selection based on `activeGroupId`.

## Open Questions
- Email notifications are stubbed; actual email provider TBD.
- Avatar moderation/storage tier limits TBD.
