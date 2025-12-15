# Work Plan: FR-006 Difficulty Levels & Workload Balancing

## Vision & Metrics
For Admins who need visibility and control over fair task distribution,
the Workload Balancing feature is an analytics and guidance tool that quantifies difficulty-based workload and previews assignment impact.

- User: Admins see accurate per-user workload and variance within 50ms; warnings appear when imbalance exceeds thresholds.
- Business: Reduce workload variance to ≤15% across groups; improve satisfaction and perceived fairness.
- Technical: Group workload summary API < 50ms for ≤20 members; polling-friendly responses; no new collections.

## Timeline: 3 Epics, 12 Stories, 2 Sprints

## Epics

## Epic E1: Client UI – Admin Workload Dashboard & Preview
**Description:** Build dashboard to visualize per-user workload and variance; add preview in task creation.
**Business Value:** Empowers informed assignment decisions, reduces imbalance.
**Success Criteria:** Admin sees workloads, variance color-coded; preview highlights threshold exceedance.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-101: Workload Dashboard Page
**As a** Admin **I want to** view group workloads **So that** I can assess balance

**Acceptance Criteria:**
- [ ] Bar chart shows per-user total difficulty and task count.
- [ ] Group stats show average, min/max, variance, threshold status.
- [ ] Auto-refresh every 30 seconds.

**Technical Notes:** React + TS; RTK Query `GET /api/workload/group/{groupId}`; Chart.js/Recharts; Tailwind components.
**Dependencies:** Backend workload API.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-102: Variance Indicator & Tooltip
**As a** Admin **I want to** understand imbalance **So that** I can take action

**Acceptance Criteria:**
- [ ] Green/Yellow/Red indicator based on thresholds (<10%, 10-15%, ≥15%).
- [ ] Tooltip explains variance formula and recommendations.

**Technical Notes:** Badge component; computed from API response.
**Dependencies:** US-101.
**Estimated Effort:** XS (2)
**Priority:** Must

### Story US-103: Filter by Difficulty Range
**As a** Admin **I want to** view tasks by difficulty buckets **So that** I can focus on hard tasks

**Acceptance Criteria:**
- [ ] Selector: All, Easy (1-3), Medium (4-6), Hard (7-10).
- [ ] Dashboard updates to show filtered workloads.

**Technical Notes:** RTK Query `GET /api/workload/group/{groupId}/by-difficulty?range=...`.
**Dependencies:** Backend range endpoint.
**Estimated Effort:** S (3)
**Priority:** Should

### Story US-104: Task Creation Preview Modal
**As a** Admin **I want to** preview workload impact **So that** I avoid imbalance

**Acceptance Criteria:**
- [ ] Button "Preview Impact" on task form opens modal with current vs new workload and variance.
- [ ] If threshold would be exceeded (≥15%), show red warning and recommendation.

**Technical Notes:** RTK Query `GET /api/workload/preview`; integrates with FR-005 form.
**Dependencies:** FR-005 Create Task UI; Backend preview endpoint.
**Estimated Effort:** S (3)
**Priority:** Must

## Epic E2: Backend – Workload Calculation & APIs
**Description:** Implement service to aggregate difficulty points and expose workload summary/preview endpoints.
**Business Value:** Accurate metrics enabling client features.
**Success Criteria:** Fast, correct responses and variance computation.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-105: WorkloadService Core Calculation
**As a** Developer **I want to** compute per-user workload **So that** the dashboard is accurate

**Acceptance Criteria:**
- [ ] Aggregate pending+in-progress tasks per assignee; include zero-workload members.
- [ ] DTOs: `WorkloadMetrics`, `UserWorkload` with totals and percentages.

**Technical Notes:** Repository aggregation; service variance formula; exclude overdue.
**Dependencies:** TaskRepository; GroupService.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-106: Group Workload Endpoint
**As a** Admin **I want to** fetch workload summary **So that** I can visualize distribution

**Acceptance Criteria:**
- [ ] `GET /api/workload/group/{groupId}` returns metrics and per-user workloads.
- [ ] Authorization for group members; admin view emphasized.

**Technical Notes:** Controller + service; validation; standard response wrapper.
**Dependencies:** US-105.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-107: Workload Preview Endpoint
**As a** Admin **I want to** preview impact before assigning **So that** I maintain balance

**Acceptance Criteria:**
- [ ] `GET /api/workload/preview?groupId&id&assignedTo&difficulty` returns current vs new variance and recommendation.

**Technical Notes:** Service computes hypothetical change; suggest lowest workload member.
**Dependencies:** US-105.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-108: Range Filter Endpoint
**As a** Admin **I want to** filter by difficulty ranges **So that** I can focus analyses

**Acceptance Criteria:**
- [ ] `GET /api/workload/group/{groupId}/by-difficulty?range=easy|medium|hard` filters workload.

**Technical Notes:** Range mapping: 1-3, 4-6, 7-10; reuse aggregation.
**Dependencies:** US-105.
**Estimated Effort:** S (3)
**Priority:** Should

## Epic E3: Tests – Unit & Integration
**Description:** Validate workload formulas, edge cases, and endpoints.
**Business Value:** Confidence in fairness metrics.
**Success Criteria:** ~70% coverage on workload domain.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-109: Unit Tests – Variance & Preview
**As a** Developer **I want to** test calculations **So that** edge cases are covered

**Acceptance Criteria:**
- [ ] Variance correct for diverse workloads; single-member -> 0; zero tasks -> 0.
- [ ] Preview detects threshold exceedance and suggests lowest workload.

**Technical Notes:** xUnit; controlled datasets.
**Dependencies:** Backend stories.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-110: Integration Tests – Summary Endpoint
**As a** Developer **I want to** verify API responses **So that** UI contracts hold

**Acceptance Criteria:**
- [ ] `GET /api/workload/group/{groupId}` returns metrics; forbidden for non-members.

**Technical Notes:** WebApplicationFactory; seeded tasks; test Mongo.
**Dependencies:** US-106.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-111: Integration Tests – Preview & Range
**As a** Developer **I want to** ensure endpoints behave **So that** UI features work reliably

**Acceptance Criteria:**
- [ ] `GET /api/workload/preview` returns deltas and recommendation.
- [ ] `GET /api/workload/group/{groupId}/by-difficulty` filters correctly.

**Technical Notes:** Similar to US-110.
**Dependencies:** US-107, US-108.
**Estimated Effort:** S (3)
**Priority:** Should

## Sprint Plan

## Sprint 1: Backend Core + Dashboard
**Duration:** 2 weeks
**Sprint Goal:** Implement workload calculation & summary API; basic dashboard visualization.
**Stories:** US-105 (M), US-106 (S), US-101 (M), US-102 (XS), US-110 (S)
**Capacity:** 10 days | **Committed:** ~18 points (incl. AI + buffer)

## Sprint 2: Preview, Filters, and Tests
**Duration:** 2 weeks
**Sprint Goal:** Preview endpoint & modal; difficulty range filter; test coverage.
**Stories:** US-107 (S), US-108 (S), US-103 (S), US-104 (S), US-109 (S), US-111 (S)
**Capacity:** 10 days | **Committed:** ~22 points (incl. AI + buffer)

## Dependencies & Risks
- Dependencies: FR-005 Task status/difficulty; FR-002 Groups.
- Risks: Misinterpretation of variance; performance for large groups; UI clarity.

## Release Phases
- Phase 1 (MVP): Sprints 1-2
- Phase 2 (Enhancement): Real-time via SignalR; caching; historical analytics
- Phase 3 (Optimization): AI suggestions (FR-007), leaderboard integration (FR-011)
