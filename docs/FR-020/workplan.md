# Work Plan: FR-020 Data Privacy & Account Controls

## Vision & Metrics
Provide self-service data export, account deletion, session management, and audit logs with group-aware safeguards.
- Export: Generate ZIP in ≤5s for typical volumes; secure pre-signed URLs.
- Deletion: Safeguards prevent orphaned groups; reassignment rules clear.
- Sessions: List/revoke in real-time; audit trail complete.

## Epics

## Epic E1: Backend – Data Export
**Description:** Schedule export job; build ZIP with user data; secure download.
**Success Criteria:** Users can request export; download when ready; data complete.

### US-1501: Export Job & Builder
- Acceptance: `ScheduleExportAsync` enqueues job; `ExportBuilder` collects User, UserPreferences, tasks, messages, notifications; produces ZIP with manifest.
- Tech: Hangfire; temporary Blob/S3 storage; encrypted at rest; limited retention.

### US-1502: Export Endpoints
- Acceptance: `GET /api/privacy/export` schedules; `GET /api/privacy/export/{jobId}` streams when ready.
- Tech: Controllers; job status polling; pre-signed URLs with short expiry.

## Epic E2: Backend – Account Deletion
**Description:** Deletion request with group safeguards; anonymization processor.
**Success Criteria:** Users can delete account; safeguards enforced; PII scrubbed.

### US-1503: Deletion Request & Safeguards
- Acceptance: `POST /api/privacy/deletion` creates request; validate not sole admin without successor.
- Tech: `UserDeletionRequest` entity; validation logic.

### US-1504: Deletion Processor Job
- Acceptance: `UserDeletionJob` reassigns/unassigns tasks; removes UserPreferences; anonymizes messages; deactivates User; marks completed.
- Tech: Hangfire; group-aware; retries; status tracking.

## Epic E3: Backend – Session Management & Audit
**Description:** List sessions; revoke; log privacy actions.
**Success Criteria:** Users view sessions; revoke works; audit log accessible.

### US-1505: Session Management
- Acceptance: `GET /api/privacy/sessions` lists; `POST /api/privacy/sessions/{sessionId}/revoke` marks revoked.
- Tech: `UserSession` entity; IP hashes; integration with auth tokens.

### US-1506: Audit Logging
- Acceptance: `GET /api/privacy/audit` returns recent privacy-related audits (export, deletion, session revoke, preferences updates).
- Tech: AuditLog entity; types filtering.

## Epic E4: Frontend – Privacy Page
**Description:** UI for export, deletion, sessions, and audit.
**Success Criteria:** Users can request export/deletion; view sessions; see audit log.

### US-1507: RTK Query Endpoints
- Acceptance: `requestExport`, `getExportStatus`, `downloadExport`, `requestDeletion`, `listSessions`, `revokeSession`, `listAudits`.
- Tech: Typed endpoints; polling for export status.

### US-1508: Privacy Page UI
- Acceptance: Data Export section with status; Account Deletion with double-confirm modal; Sessions list with revoke; Audit log table.
- Tech: Tailwind; accessibility; informative warnings.

## Epic E5: Tests – Unit & Integration
**Description:** Validate export/deletion/session flows and edge cases.
**Success Criteria:** ~70% coverage; safeguards tested.

### US-1509: Unit – ExportBuilder & DeletionProcessor
- Acceptance: Export assembles correct datasets; deletion respects safeguards and anonymizes.
- Tech: xUnit; fixtures.

### US-1510: Integration – Privacy Endpoints
- Acceptance: Export/deletion/session/audit flows; auth required.
- Tech: WebApplicationFactory; seeded data.

### US-1511: Frontend – Privacy Page
- Acceptance: Render tabs; simulate actions; assert API calls and UI states.
- Tech: Vitest + RTL.

## Sprint Plan

## Sprint 1: Export + Deletion Backend
- US-1501, US-1502, US-1503, US-1504, US-1509

## Sprint 2: Sessions + Audit + Frontend + Tests
- US-1505, US-1506, US-1507, US-1508, US-1510, US-1511

## Dependencies & Risks
- Dependencies: FR-015 groups; FR-005 tasks; FR-010 messages; storage for export files.
- Risks: Large exports timeout; sole admin deletion blocked; session revoke race. Mitigate with pagination, safeguards, status tracking.

## Release Phases
- Phase 1: Export and session management.
- Phase 2: Account deletion with full anonymization.
