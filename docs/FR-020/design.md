# FR-020: Data Privacy & Account Controls

## Overview
Provide users with essential privacy and account management controls: view/download personal data, delete account (with group-aware consequences), session management, and consent/preferences audit. Align with common privacy expectations (GDPR-like principles) without introducing legal frameworks.

## Goals
- Data export: user can download a ZIP/JSON of their data (profile, preferences, tasks assigned, messages sent, notifications history where applicable).
- Account deletion: user can request deletion; apply group-scoped cleanup and reassignment rules.
- Session management: view active sessions/devices; revoke.
- Consent & preferences audit: log when preferences/consents change.

## Non-Goals
- Formal GDPR DPIA or SAR workflows beyond self-service export.
- Legal notifications (email to DPO) and complex retention policies.

## Data Model (MongoDB)
- `UserDeletionRequest`
  - id, userId, requestedAt, status: 'pending'|'processing'|'completed'|'failed', reason?

- `UserSession`
  - id, userId, deviceInfo, ipHash, createdAt, lastSeenAt, revokedAt?

- Audit (reuse existing logging or a lightweight `AuditLog` collection):
  - id, userId, type: 'preferences_update'|'consent_update'|'session_revoke'|'export_request'|'deletion_request', payloadSummary, createdAt.

Indexes:
- `UserDeletionRequest.userId` unique for active requests.
- `UserSession.userId`.

## Backend API (Controllers)
- GET `/api/privacy/export` → schedule export; returns job id.
- GET `/api/privacy/export/{jobId}` → download when ready (expires after N days).
- POST `/api/privacy/deletion` → create deletion request; validate constraints.
- GET `/api/privacy/sessions` → list active sessions.
- POST `/api/privacy/sessions/{sessionId}/revoke` → revoke session.
- GET `/api/privacy/audit` → list recent privacy-related audits for the user.

Auth:
- JWT required. Only self-service actions for current user.

## Services
- `PrivacyService`
  - `ScheduleExportAsync(userId)` → enqueue job to gather data and produce ZIP/JSON; create `AuditLog` entry.
  - `GetExportAsync(jobId, userId)` → authorize and stream.
  - `RequestDeletionAsync(userId, reason?)` → create `UserDeletionRequest`, validations.
  - `ListSessionsAsync(userId)` → reads from `UserSession` store; optionally integrate with auth provider tokens.
  - `RevokeSessionAsync(userId, sessionId)` → mark revoked; invalidate refresh tokens.
  - `ListAuditsAsync(userId)`.

- `ExportBuilder`
  - Collects: `User`, `UserPreferences`, tasks where `assigneeId==userId` (active and history), messages sent by user, notifications preferences and history if stored.
  - Formats JSON; bundles into ZIP with manifest.

- `DeletionProcessor`
  - Steps:
    1. Mark request as `processing`.
    2. For tasks assigned to the user: if `status` not completed, reassign to group admins or mark `unassigned` per policy; keep task history but remove PII of user where required.
    3. Remove `UserPreferences`, personal messages content if requested (or anonymize author to 'deleted-user').
    4. Deactivate `User` account; scrub email/displayName to placeholder; hard delete after retention period if required.
    5. Mark request as `completed`.
  - All operations are group-aware using `activeGroupId` context where relevant but operate across all groups where user is member.

## Jobs (Hangfire)
- `UserDataExportJob(userId)` → builds ZIP, stores temporarily (Blob/S3) with limited retention.
- `UserDeletionJob(userId, requestId)` → orchestrates deletion/anonymization steps with retries.

## Validation (Controller)
- Deletion safeguards: prevent deletion if user is sole admin of any group without a successor; require transfer first.
- Export size limits; paginate artifacts if needed.
- Session revoke only for own sessions.

## Security & Storage
- Export files stored encrypted at rest; pre-signed download URLs with short expiry.
- IP addresses stored as hashes; avoid storing sensitive PII unnecessarily.

## Frontend (React)
- Privacy page under Preferences:
  - Data Export: button to request export, status indicator, download when ready.
  - Account Deletion: explain consequences, confirmation modal (double-confirm), status tracking.
  - Sessions: list devices, last seen, revoke controls.
  - Audit log: recent changes.

## Testing
Backend:
- Export builder assembles correct datasets; redacts sensitive fields.
- Deletion processor respects safeguards and anonymizes content.
- Sessions listing/revoke flows.

Frontend:
- Render Privacy page; simulate export/deletion/session revoke; assert API calls and UI states.

## Observability
- Log export/deletion job outcomes; metrics for job durations and failures.
- Avoid logging PII; summarize counts.

## Edge Cases
- User in multiple groups with tasks in-flight; ensure consistent reassignment policy.
- Export requested and deletion requested concurrently; export cancels if deletion reaches `processing` stage.
- Session revoke while offline (FR-018): queued and processed on reconnect.
