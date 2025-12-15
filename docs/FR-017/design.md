# FR-017: Calendar Sync (External)

## Overview
Provide one-way calendar sync from the app to external calendars (Google Calendar, Outlook/Microsoft 365, Apple Calendar via ICS). Users can opt-in per group and per category to publish a read-only feed. The system generates ICS feeds and optionally pushes events via provider APIs for authenticated integrations.

## Goals
- Publish ICS feeds scoped by user and active group, with filters (categories, statuses).
- Optional OAuth integrations: Google Calendar and Microsoft 365 to create/update events.
- Respect user preferences (timezone, locale) from FR-016 and group scoping from FR-015.
- Keep external events updated on task changes (title, due date, status), with reasonable throttling.

## Non-Goals
- Two-way sync (external edits do not flow back).  
- Enterprise admin provisioning; personal user-level only.

## Data Model (MongoDB)
- CalendarSyncSettings
  - id
  - userId
  - groupId
  - enabled: boolean
  - filters: { categories?: string[], statuses?: string[] }
  - channels: { ics: boolean, google: boolean, outlook: boolean }
  - provider: {
      google?: { accountId, calendarId, accessTokenEncrypted, refreshTokenEncrypted },
      outlook?: { accountId, calendarId, accessTokenEncrypted, refreshTokenEncrypted }
    }
  - lastPushedAt, createdAt, updatedAt

Indexes: `{ userId, groupId }` unique.

## Backend API (Controllers)
- GET `/api/calendar-sync/settings` → returns settings for current `userId` and `activeGroupId`.
- PUT `/api/calendar-sync/settings` → upsert settings; validate filters and channels.
- GET `/api/calendar-sync/ics/{userId}/{groupId}/{token}` → returns ICS feed for that user+group if token matches.
- POST `/api/calendar-sync/google/connect` → start OAuth; callback saves tokens securely.
- POST `/api/calendar-sync/outlook/connect` → start OAuth; callback saves tokens securely.
- POST `/api/calendar-sync/push` → manual push (admin/user), schedules job if necessary.

Auth & Security:
- ICS feed secured with random `token` in URL; read-only. Token rotation supported.
- OAuth tokens stored encrypted (server-side KMS). Do not log tokens.

## Services
- `CalendarSyncService`
  - `GetSettingsAsync(userId, groupId)`
  - `UpsertSettingsAsync(userId, groupId, dto)`
  - `GenerateIcsAsync(userId, groupId)` → build ICS from tasks matching filters; timezone aware.
  - `PushGoogleAsync(userId, groupId)` → upsert events via Google Calendar API.
  - `PushOutlookAsync(userId, groupId)` → upsert events via Microsoft Graph.
  - `SchedulePushAsync(userId, groupId)` → enqueue Hangfire job.

- `IcsBuilder`
  - Builds `VEVENT` from tasks with `dueDate`, summary from task title, description links back to app, `STATUS` mapped from task status.

- `ProviderAccess`
  - `GoogleCalendarAccess`: list/create/update events; handle pagination and rate limits.
  - `OutlookCalendarAccess`: similar via Microsoft Graph.

## Repository
- `CalendarSyncSettingsRepository`: CRUD by `{ userId, groupId }`.
- Reuse `TaskRepository` queries with filters for building feeds.

## Jobs (Hangfire)
- `CalendarSyncJob(userId, groupId)`:
  - If ICS only: nothing needed (clients poll). If providers enabled: push changes.
  - Debounce frequent task changes (e.g., coalesce within 2 minutes).
  - Retry with backoff on provider errors; stop after N attempts.

## Validation (Controller)
- Categories exist in group; statuses are valid.
- Channels: at least one selected if `enabled`.
- OAuth connection required for push channels.

## ICS Format
- Use standard fields: `BEGIN:VCALENDAR`, `PRODID`, `VERSION:2.0`.
- For each task: `UID` (taskId), `DTSTAMP`, `DTSTART`/`DTEND` based on `dueDate` ± default duration (e.g., 30 minutes) or task duration if available.
- `SUMMARY`: task title; `DESCRIPTION`: app deep link; `STATUS`: `CONFIRMED/CANCELLED/TENTATIVE` mapped.
- Timezone: use `VTIMEZONE` or UTC with `Z`; prefer user timezone.

## Frontend (React)
- Settings page in Preferences → Calendar Sync tab.
- Show ICS feed URL with copy button and rotate token.
- Show connect buttons for Google/Outlook and status.
- Informational text: one-way sync; edits in external calendars do not return.

## Testing
Backend:
- Unit tests for ICS generation (timezones, status mapping, filters).
- Integration tests for settings upsert and ICS endpoint security.
- Mock provider access; verify push calls with retries.

Frontend:
- Render tab; simulate toggles and ensure payloads sent.

## Observability
- Log sync results counts; warn on provider throttling.
- Metrics: pushes attempted/succeeded/failed per provider.

## Edge Cases
- Tasks without `dueDate` excluded from ICS feed.
- Deleted tasks emit `CANCELLED` updates for providers.
- Token rotation invalidates old ICS URLs immediately.
