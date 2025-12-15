# Work Plan: FR-013 Task Swap Requests

## Vision & Metrics
Enable fair, controlled task swaps between members with mandatory admin approval, strong validation, audit logging, and notifications.
- UX: Create/review actions respond in ≤250ms; clear statuses.
- Reliability: Atomic reassignment; no inconsistent states; full audit trail.
- Adoption: Reduce manual reassignment requests; improve perceived fairness.

## Epics

## Epic E1: Client UI – Request & Review
**Description:** Modal to initiate A↔B swaps; admin list to approve/reject; status badges/timeline on task detail.
**Success Criteria:** Users can request swaps; admins can approve/reject; statuses visible.

### US-801: SwapRequestModal (Member)
- Acceptance: Select target user and task; add optional reason; validate basic client rules; submit.
- Tech: RTK Query `POST /api/swaps`; Tailwind modal; debounced search for target tasks.

### US-802: Task Detail – Swap Status & Timeline
- Acceptance: Display pending/approved/rejected badges; compact timeline item; link to request.
- Tech: RTK Query reads `GET /api/swaps?role=requester|target`.

### US-803: AdminSwapReviewList
- Acceptance: Filter by status/group; approve/reject with decision reason.
- Tech: `GET /api/swaps`; actions `POST /api/swaps/:id/approve|reject`.

## Epic E2: Backend – Core Workflow & Validation
**Description:** Entity, repository, service, controller with validation and audit.
**Success Criteria:** Create/approve/reject flows pass acceptance criteria; robust errors.

### US-804: SwapRequest Entity & Repository
- Acceptance: Model fields per design; indexes created on startup.
- Tech: Mongo collection `swapRequests`; indexes for groupId/status/expiresAt, requester/target, TTL cleanup.

### US-805: ValidationService Rules
- Acceptance: Enforce group match, assignment, statuses, difficulty ≤2 unless override, deadline ≥2h, max 3 active; duplicate pending guard.
- Tech: Service methods `ValidateEligibility`, `ValidateFairness`, `ValidateDeadlines`.

### US-806: SwapRequestService – Create/Approve/Reject
- Acceptance: Create sets status Pending + expiresAt 48h; approve performs atomic reassignment, logs history, notifies; reject sets status and notifies.
- Tech: Transactions with Mongo; optimistic locking using task version; NotificationService integration.

### US-807: SwapRequestController Endpoints
- Acceptance: `POST /api/swaps`, `POST /api/swaps/{id}/approve`, `POST /api/swaps/{id}/reject`, `GET /api/swaps` with role/status filters.
- Tech: Controllers with validation; DTOs; authentication/authorization checks.

## Epic E3: Concurrency & Audit
**Description:** Atomic reassignment and append-only audit logs.
**Success Criteria:** No partial swaps; history entries on both tasks.

### US-808: Atomic Reassignment
- Acceptance: Two task updates and swap status change committed together; retry on conflict.
- Tech: MongoDB transactions; version field on tasks.

### US-809: Audit Logging
- Acceptance: Append `SwapApproved`/`SwapRejected` to both task histories with references.
- Tech: Extend TaskService history API minimally; avoid broad refactors.

## Epic E4: Tests – Unit & Integration
**Description:** Validate rules, endpoints, and concurrency.
**Success Criteria:** ~70% coverage; negative/edge cases covered.

### US-810: Unit – ValidationService & SwapRequestService
- Acceptance: Difficulty gap, deadline window, max active, duplicate pending, approve path.
- Tech: xUnit; FluentAssertions; Moq.

### US-811: Integration – Controller Endpoints
- Acceptance: Create/approve/reject/list scenarios; auth roles; pagination.
- Tech: WebApplicationFactory; seeded tasks/users.

### US-812: Concurrency – Approve Collisions
- Acceptance: Two concurrent approvals for same swap resolve safely; one succeeds, one 409.
- Tech: Transaction tests; simulated parallel calls.

## Sprint Plan

## Sprint 1: Backend Core + Member UI
- US-804, US-805, US-806, US-807, US-801, US-802, US-810

## Sprint 2: Admin UI + Concurrency + Audit + Integration
- US-803, US-808, US-809, US-811, US-812

## Dependencies & Risks
- Dependencies: FR-005 (tasks), FR-009 (notifications), optional FR-006 (workload caps Phase 2).
- Risks: Concurrency race; admin backlog; abuse. Mitigate with transactions, reminders, rate limits.

## Release Phases
- Phase 1: Direct A↔B swaps with admin approval.
- Phase 2: Any-task offers and workload caps.
