# Work Plan: FR-021 Admin Panel & Governance

## Vision & Metrics
Provide group admins with governance tools: role management, category CRUD/merge/retire, policy configuration, and audit/moderation.
- Usability: Admin panel accessible; actions clear; safeguards enforced.
- Reliability: Audited changes; cascading updates safe.
- Performance: Category merge batched for large task volumes.

## Epics

## Epic E1: Backend – Role & Membership Management
**Description:** Invite, role changes, remove members with safeguards.
**Success Criteria:** Admins can manage memberships; owner transfer works.

### US-1601: Membership Endpoints
- Acceptance: `GET /api/admin/members`, `POST /api/admin/members/invite`, `POST /api/admin/members/{userId}/role`, `DELETE /api/admin/members/{userId}`.
- Tech: Controllers; validate admin/owner role; safeguards for owner removal.

### US-1602: AdminService – Membership Logic
- Acceptance: Invite sends email/push; role changes logged; remove cascades with reassignment.
- Tech: AdminService methods; AuditLog integration.

## Epic E2: Backend – Category Governance
**Description:** CRUD categories; merge/retire with task updates.
**Success Criteria:** Admins can manage categories; merge updates tasks safely.

### US-1603: Category Admin Endpoints
- Acceptance: `GET /api/admin/categories` (all including retired), `POST`, `PUT`, `POST /api/admin/categories/{categoryId}/merge`, `POST /api/admin/categories/{categoryId}/retire`.
- Tech: Controllers; membership scoped.

### US-1604: AdminService – Category Merge & Retire
- Acceptance: Merge updates tasks to `mergeIntoCategoryId` in batch; retire sets `visible=false` + `retiredAt`.
- Tech: Batched updates; transaction if needed; audit logged.

## Epic E3: Backend – Policies & Auditing
**Description:** Configure group policies; audit trail for admin actions.
**Success Criteria:** Policies persisted and applied; audit queryable.

### US-1605: Policy Endpoints
- Acceptance: `GET /api/admin/policies`, `PUT /api/admin/policies` (notifications default, quiet hours, assignment rules, difficulty weights).
- Tech: Controllers; validation (positive weights, reasonable constraints).

### US-1606: Audit & Moderation Endpoints
- Acceptance: `GET /api/admin/audit` with filters; `POST /api/admin/moderation/flag`, `POST /api/admin/moderation/{entity}/{id}/revert`.
- Tech: AuditService; flag storage; revert logic limited to reversible actions.

## Epic E4: Frontend – Admin Panel UI
**Description:** Admin route with tabs for Members, Categories, Policies, Audit/Moderation.
**Success Criteria:** Admins access panel; perform actions; see audit trail.

### US-1607: RTK Query Admin Endpoints
- Acceptance: All admin endpoints typed; error handling.
- Tech: RTK Query; role-based access checks.

### US-1608: Admin Panel Pages
- Acceptance: Members & Roles (list, invite, role change, remove); Categories (list, create, edit, merge, retire); Policies (form with inputs); Audit & Moderation (table, filters, actions).
- Tech: Tailwind; tables with sorting; modals; accessibility.

### US-1609: Category Merge UI
- Acceptance: Pick target; preview affected tasks count; confirm.
- Tech: Modal with search; confirmation.

## Epic E5: Tests – Unit & Integration & Frontend
**Description:** Validate admin flows and safeguards.
**Success Criteria:** ~70% coverage; guardrails tested.

### US-1610: Unit – AdminService
- Acceptance: Role change guardrails; category merge logic; policy validation.
- Tech: xUnit; Moq.

### US-1611: Integration – Admin Endpoints
- Acceptance: Membership flows; category merge updates tasks; policy updates persisted.
- Tech: WebApplicationFactory; seeded data.

### US-1612: Frontend – Admin Panel
- Acceptance: Role-based access; forms validate; audit list filters.
- Tech: Vitest + RTL.

## Sprint Plan

## Sprint 1: Backend Membership + Categories + Policies
- US-1601, US-1602, US-1603, US-1604, US-1605, US-1610, US-1611

## Sprint 2: Audit/Moderation + Frontend
- US-1606, US-1607, US-1608, US-1609, US-1612

## Dependencies & Risks
- Dependencies: FR-015 groups/memberships; FR-003 categories; FR-005 tasks.
- Risks: Large task volumes on merge; conflicting policy updates; accidental owner removal. Mitigate with batching, audits, safeguards.

## Release Phases
- Phase 1: Membership and categories.
- Phase 2: Policies and audit/moderation.
