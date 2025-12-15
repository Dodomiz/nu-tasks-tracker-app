# Work Plan: FR-012 User Dashboard & Views

## Vision & Metrics
For users who need a quick overview and flexible task exploration,
the Dashboard & Views feature is a responsive UI with summaries, powerful filters, list + calendar modes, and real-time updates.

- User: Dashboard loads in ≤300ms; filters apply in ≤200ms; smooth mobile UX.
- Business: Improve completion rates by highlighting overdue/urgent tasks; reduce time-to-find with filters.
- Technical: Indexed queries, RTK Query, SignalR updates; calendar limited to performant ranges.

## Timeline: 4 Epics, 18 Stories, 2 Sprints

## Epics

## Epic E1: Client UI – Dashboard, Filters, Views
**Description:** Build summary widgets, filter panel with presets, list + calendar views.
**Business Value:** Boosts productivity and clarity.
**Success Criteria:** Users see accurate counts, filter tasks quickly, and switch views smoothly.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-701: Dashboard Summary Widgets
**As a** User **I want to** see today’s task counts **So that** I can prioritize

**Acceptance Criteria:**
- [ ] Total, completed, pending, overdue, due today/week.
- [ ] Loading skeletons; error states.

**Technical Notes:** RTK Query `GET /api/dashboard/summary`; Tailwind cards.
**Dependencies:** Backend summary endpoint.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-702: Filter Panel with Presets
**As a** User **I want to** filter by category, date, status, difficulty **So that** I can focus

**Acceptance Criteria:**
- [ ] Category multi-select, date presets (today/week/month), difficulty range, status checkboxes.
- [ ] Persist filters to localStorage.

**Technical Notes:** Redux slice; controlled inputs; debounce filter changes.
**Dependencies:** Backend filters endpoint.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-703: Task List View + Sorting
**As a** User **I want to** browse tasks in a list **So that** I can scan quickly

**Acceptance Criteria:**
- [ ] Sort by due date, difficulty, category; virtual scroll; load more.

**Technical Notes:** `GET /api/tasks/filter`; sort controls; VirtualList.
**Dependencies:** Backend filters endpoint.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-704: Calendar View Integration
**As a** User **I want to** see tasks on a calendar **So that** I can plan

**Acceptance Criteria:**
- [ ] Monthly/week/day modes; event clicks navigate to task.

**Technical Notes:** FullCalendar; `GET /api/tasks/calendar`.
**Dependencies:** Backend calendar endpoint.
**Estimated Effort:** M (5)
**Priority:** Should

## Epic E2: Backend – Summary, Filters, Calendar
**Description:** Implement summary aggregation, filtered queries, and calendar endpoints; add indexes.
**Business Value:** Enables fast, accurate data for the UI.
**Success Criteria:** <300ms dashboard, <200ms filter responses with indexes.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-705: DashboardService & Summary Endpoint
**As a** Developer **I want to** calculate daily counts **So that** the UI shows accurate metrics

**Acceptance Criteria:**
- [ ] `GET /api/dashboard/summary` with counts and upcoming tasks; 5-min cache.

**Technical Notes:** Redis cache; invalidate on task change.
**Dependencies:** TaskRepository.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-706: Filtered Tasks Endpoint
**As a** Developer **I want to** fetch tasks by filters **So that** users can refine views

**Acceptance Criteria:**
- [ ] `GET /api/tasks/filter` supports all filters and sorts; paginated.

**Technical Notes:** Mongo query builders; compound indexes.
**Dependencies:** TaskRepository.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-707: Calendar Tasks Endpoint
**As a** Developer **I want to** return events for a date range **So that** calendar renders efficiently

**Acceptance Criteria:**
- [ ] `GET /api/tasks/calendar` transforms tasks to event format.

**Technical Notes:** Date range query; color coding.
**Dependencies:** TaskRepository.
**Estimated Effort:** S (3)
**Priority:** Should

### Story US-708: Indexes & Optimization
**As a** Developer **I want to** add indexes **So that** queries stay fast

**Acceptance Criteria:**
- [ ] Create compound indexes for assignedTo/groupId/status/dueDate, category/dueDate, difficulty, createdAt.

**Technical Notes:** Repository init ensures indexes.
**Dependencies:** MongoDB.
**Estimated Effort:** XS (2)
**Priority:** Must

## Epic E3: Real-Time Updates
**Description:** Push task updates to dashboard via SignalR.
**Business Value:** Keeps data fresh and reduces manual refreshes.
**Success Criteria:** Live updates adjust counts and list items.
**Estimated Effort:** XS
**Priority:** High

### Story US-709: TaskUpdated Subscription
**As a** User **I want to** see live changes **So that** my dashboard stays accurate

**Acceptance Criteria:**
- [ ] Subscribe to group channel; update summary and cache on events.

**Technical Notes:** SignalR integration; RTK Query cache update.
**Dependencies:** TaskService events.
**Estimated Effort:** XS (2)
**Priority:** Should

## Epic E4: Tests – Unit, Integration, E2E
**Description:** Validate summary math, filter queries, calendar payloads, and UI interactions.
**Business Value:** Reliability and maintainability.
**Success Criteria:** ~70% coverage on dashboard domain.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-710: Unit – DashboardService & TaskRepository
**As a** Developer **I want to** test calculations and queries **So that** logic is solid

**Acceptance Criteria:**
- [ ] Summary counts; overdue detection; filter operators; sort correctness.

**Technical Notes:** xUnit; fixtures.
**Dependencies:** Backend stories.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-711: Integration – Endpoints
**As a** Developer **I want to** verify API contracts **So that** the UI works reliably

**Acceptance Criteria:**
- [ ] GET summary, GET filter, GET calendar with pagination.

**Technical Notes:** WebApplicationFactory; seeded tasks.
**Dependencies:** US-705, US-706, US-707.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-712: E2E – Dashboard UX
**As a** Developer **I want to** ensure smooth interactions **So that** users are productive

**Acceptance Criteria:**
- [ ] Load, filter, sort, switch view; mobile drawer behavior.

**Technical Notes:** Playwright; SignalR simulation.
**Dependencies:** Frontend stories.
**Estimated Effort:** S (3)
**Priority:** Should

## Sprint Plan

## Sprint 1: Backend Core + Dashboard UX
**Duration:** 2 weeks
**Sprint Goal:** Summary/filters/calendar endpoints; dashboard UI and filter panel.
**Stories:** US-705 (S), US-706 (M), US-707 (S), US-701 (S), US-702 (M), US-703 (M), US-710 (S)
**Capacity:** 10 days | **Committed:** ~23 points (incl. AI + buffer)

## Sprint 2: Real-Time + Calendar Polish + Tests
**Duration:** 2 weeks
**Sprint Goal:** SignalR updates, calendar polish, and coverage.
**Stories:** US-704 (M), US-709 (XS), US-708 (XS), US-711 (S), US-712 (S)
**Capacity:** 10 days | **Committed:** ~17 points (incl. AI + buffer)

## Dependencies & Risks
- Dependencies: FR-005 tasks; FR-003 categories; SignalR infra; optional Redis.
- Risks: Query performance; calendar event load; mobile UX.

## Release Phases
- Phase 1 (MVP): Sprints 1-2
- Phase 2 (Enhancement): Saved views, bulk actions, export
- Phase 3 (Optimization): Drag-drop scheduling, keyboard shortcuts
