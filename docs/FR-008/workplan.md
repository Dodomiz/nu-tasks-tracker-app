# Work Plan: FR-008 Task Completion & Approval

## Vision & Metrics
For Users and Admins who need verified task completion and fair recognition,
the Completion & Approval feature is a workflow that captures evidence, supports review, and awards points on approval.

- User: Submit completion with notes/photos in <10s; clear feedback on approval/rejection.
- Business: Reduce disputes with audit trail; motivate on-time completion through points.
- Technical: Approval action <200ms; photo upload validated and stored with 90-day retention; robust status transitions.

## Timeline: 4 Epics, 15 Stories, 2 Sprints

## Epics

## Epic E1: Client UI – Completion & Approval
**Description:** Build user flow to submit completion with photos; admin review UI to approve/reject.
**Business Value:** Ensures accountability and quality; improves user motivation.
**Success Criteria:** Users submit photos; admins approve/reject with rationale; UI reflects points and status.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-301: Task Completion Form (Notes + Photos)
**As a** User **I want to** submit completion with evidence **So that** my work can be verified

**Acceptance Criteria:**
- [ ] Multipart upload up to 3 photos (≤5MB each; JPEG/PNG/HEIC) with notes (≤500 chars).
- [ ] Client validates size/format; optional compression.

**Technical Notes:** React + TS; FormData; Tailwind; integrates `POST /api/tasks/{id}/complete`.
**Dependencies:** Backend completion endpoint.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-302: Admin Approval Modal
**As a** Admin **I want to** review submissions **So that** I can approve or reject

**Acceptance Criteria:**
- [ ] Modal displays photos, notes, timestamps, on-time flag.
- [ ] Actions: Approve (optional feedback), Reject (reason required, ≤500 chars).

**Technical Notes:** RTK Query `POST /api/tasks/{id}/approve|reject`; gallery/lightbox.
**Dependencies:** Backend approval endpoints.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-303: Status Indicators & History
**As a** User/Admin **I want to** see status and history **So that** I understand progress

**Acceptance Criteria:**
- [ ] Task card shows Pending/InProgress/Completed/Approved/Rejected.
- [ ] History timeline shows status changes and actors.

**Technical Notes:** `GET /api/tasks/{id}/history` or included in task details.
**Dependencies:** Backend history logging.
**Estimated Effort:** S (3)
**Priority:** Should

## Epic E2: Backend – Completion, Approval, Storage
**Description:** Implement endpoints for completion submission, approval/rejection, photo upload, and status transitions.
**Business Value:** Core workflow and data integrity.
**Success Criteria:** Validated uploads; correct points and notifications; audit trail maintained.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-304: Status Transition Logic
**As a** Developer **I want to** enforce valid state changes **So that** workflow remains consistent

**Acceptance Criteria:**
- [ ] Validate transitions: Pending→InProgress→Completed→Approved/Rejected; reject invalid.

**Technical Notes:** Service-level state machine.
**Dependencies:** Task entity.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-305: Submit Completion Endpoint
**As a** Assignee **I want to** submit completion **So that** admins can review

**Acceptance Criteria:**
- [ ] `POST /api/tasks/{id}/complete` accepts notes and up to 3 photos; enforces difficulty-based photo requirement.
- [ ] Sets wasOnTime; requiresApproval respected.

**Technical Notes:** StorageServerAccess; multipart handling; validation.
**Dependencies:** Storage integration; US-304.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-306: Approve & Reject Endpoints
**As a** Admin **I want to** finalize outcomes **So that** points and feedback are captured

**Acceptance Criteria:**
- [ ] `POST /api/tasks/{id}/approve` awards points; `POST /api/tasks/{id}/reject` resets to Pending with reason.

**Technical Notes:** PointService stub; notifications stub; audit history.
**Dependencies:** US-304, US-305.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-307: Photo Storage Integration
**As a** Developer **I want to** store images safely **So that** evidence persists briefly

**Acceptance Criteria:**
- [ ] Upload to Blob/S3; create thumbnails; enforce retention (90 days).

**Technical Notes:** StorageServerAccess; signed URLs.
**Dependencies:** Configured storage.
**Estimated Effort:** M (5)
**Priority:** Should

## Epic E3: Tests – Unit & Integration
**Description:** Validate transitions, photo validation, approval logic, and points.
**Business Value:** Prevent regressions and disputes.
**Success Criteria:** ~70% coverage; green suite.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-308: Unit Tests – State & Points
**As a** Developer **I want to** test rules **So that** correctness is assured

**Acceptance Criteria:**
- [ ] Valid/invalid transitions; on-time bonus; photo requirement by difficulty.

**Technical Notes:** xUnit; mocks.
**Dependencies:** Backend stories.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-309: Integration Tests – Complete/Approve/Reject
**As a** Developer **I want to** verify endpoints **So that** the UI contract holds

**Acceptance Criteria:**
- [ ] Complete with photos; approve awards points; reject returns to Pending.

**Technical Notes:** WebApplicationFactory; test storage.
**Dependencies:** US-305, US-306.
**Estimated Effort:** S (3)
**Priority:** Must

## Epic E4: Notifications & History
**Description:** Send status change notifications and persist history timeline.
**Business Value:** Transparency and user feedback.
**Success Criteria:** Users/admins informed; audit maintained.
**Estimated Effort:** XS
**Priority:** Medium

### Story US-310: Notification Stubs
**As a** Developer **I want to** trigger alerts **So that** users stay informed

**Acceptance Criteria:**
- [ ] Notify on completion submission, approval, rejection (stubs until FR-009).

**Technical Notes:** Logging or mock service.
**Dependencies:** Backend endpoints.
**Estimated Effort:** XS (2)
**Priority:** Should

### Story US-311: History Logging
**As a** Developer **I want to** record actions **So that** we have an audit trail

**Acceptance Criteria:**
- [ ] Append-only history entries for status changes.

**Technical Notes:** Embedded history array on Task; server timestamps.
**Dependencies:** US-304, US-306.
**Estimated Effort:** XS (2)
**Priority:** Should

## Sprint Plan

## Sprint 1: Backend Core + User Completion
**Duration:** 2 weeks
**Sprint Goal:** Status transitions, completion submission (notes/photos), basic approval.
**Stories:** US-304 (S), US-305 (M), US-306 (S), US-301 (S), US-310 (XS), US-308 (S)
**Capacity:** 10 days | **Committed:** ~18 points (incl. AI + buffer)

## Sprint 2: Storage, Admin Review, History, Tests
**Duration:** 2 weeks
**Sprint Goal:** Photo storage, approval modal, history logging, integration tests.
**Stories:** US-307 (M), US-302 (M), US-303 (S), US-309 (S), US-311 (XS)
**Capacity:** 10 days | **Committed:** ~20 points (incl. AI + buffer)

## Dependencies & Risks
- Dependencies: FR-005 Task entity/status; FR-009 Notifications (stub now); FR-011 Points/Leaderboard.
- Risks: Photo handling performance; retention policy enforcement; race conditions on concurrent approvals.

## Release Phases
- Phase 1 (MVP): Sprints 1-2
- Phase 2 (Enhancement): Real notifications, richer gallery, admin queues
- Phase 3 (Optimization): Server-side compression, CDN tuning, audit exports
