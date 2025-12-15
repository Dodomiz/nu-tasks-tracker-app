# Work Plan: FR-005 Task Creation & Assignment

## Vision & Metrics
For Admins who need to create and assign tasks to group members with clear deadlines,
the Task Management feature is a workflow tool that enables one-time and recurring task creation, assignment, and status tracking.

- User: 90% of admins can create and assign a task in under 60 seconds; assignees see tasks immediately.
- Business: Increase task completion rate by 20% in first month; reduce admin overhead for recurring tasks by 50%.
- Technical: POST task response < 200ms; recurring instance generation for 30 days < 100ms; support up to 500 active tasks per group; indexes on groupId/assignedTo/status/dueDate.

## Timeline: 4 Epics, 16 Stories, 2 Sprints

## Epics

## Epic E1: Client UI – Task Creation & Assignment
**Description:** Build vertical slice in the web app to create one-time and recurring tasks, assign to members, and display upcoming tasks.
**Business Value:** Enables immediate admin productivity and assignee visibility.
**Success Criteria:** Admin can create one-time and weekly tasks; assignee sees tasks in My Tasks and Calendar views.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-001: Task Create Form (One-time)
**As a** Admin **I want to** create a one-time task **So that** I can assign work with a due date

**Acceptance Criteria:**
- [ ] Given admin privileges, when I open "Create Task", then I can enter name (<=100), description (<=1000), category, difficulty (1-10), assignee, due date/time.
- [ ] Given valid inputs, when I submit, then task is created and I see success confirmation.
- [ ] Given invalid inputs (e.g., past due date), then I see field errors.

**Technical Notes:** React + TypeScript; RTK Query mutation `POST /api/tasks`; Tailwind components; reuse category and group member selectors.
**Dependencies:** Categories (FR-003), Groups (FR-002) queries.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-002: Recurring Pattern UI (Daily/Weekly/Monthly)
**As a** Admin **I want to** configure recurring tasks **So that** tasks repeat automatically

**Acceptance Criteria:**
- [ ] Frequency picker: One-time, Daily, Weekly (daysOfWeek), Monthly.
- [ ] Interval input (default 1) and optional end date (<= +365 days).
- [ ] Toggle "isRecurring" shows relevant fields; validation rules enforced client-side.

**Technical Notes:** Controlled inputs; date/time picker; schema validation via Zod or local validation; shape aligned to API.
**Dependencies:** US-001.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-003: Assignee Selector (Group Members)
**As a** Admin **I want to** choose assignee from active group members **So that** I assign valid users

**Acceptance Criteria:**
- [ ] Dropdown lists active group members from current group.
- [ ] Non-members cannot be selected; disabled state shows why.

**Technical Notes:** RTK Query to Groups API; caching; loading states.
**Dependencies:** Groups API availability.
**Estimated Effort:** XS (2)
**Priority:** Must

### Story US-004: My Tasks List for Assignee
**As a** User **I want to** view my assigned tasks **So that** I know my workload

**Acceptance Criteria:**
- [ ] Paginated list (default 20) with name, category, difficulty, due date, status.
- [ ] Overdue tasks show indicator.
- [ ] Filters: status and category.

**Technical Notes:** RTK Query `GET /api/tasks` with `assignedTo` filter; infinite/paged list.
**Dependencies:** Backend list endpoint.
**Estimated Effort:** S (3)
**Priority:** Should

### Story US-005: Calendar View (Upcoming Instances)
**As a** User **I want to** see upcoming tasks on a calendar **So that** I can plan work

**Acceptance Criteria:**
- [ ] Monthly/weekly calendar shows next 30 days tasks.
- [ ] Recurring parent tasks show instances; clicking opens details.

**Technical Notes:** Lightweight calendar component; map tasks by `dueDate`.
**Dependencies:** Backend recurring generation.
**Estimated Effort:** M (5)
**Priority:** Should

## Epic E2: Backend – Task CRUD & Recurrence
**Description:** Implement Task API with validation, persistence, and recurring instance generation for 30 days.
**Business Value:** Core functionality and data integrity; enables UI.
**Success Criteria:** All endpoints return correct data and enforce rules; indexes optimized.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-006: Define Task Entity & Repository
**As a** Developer **I want to** model Task data **So that** we can persist and query tasks efficiently

**Acceptance Criteria:**
- [ ] Task entity, DTOs, and status enum implemented.
- [ ] Repository CRUD and filtered queries with pagination.
- [ ] MongoDB indexes: groupId+status, assignedTo+dueDate, groupId+dueDate, isRecurring+parentTaskId.

**Technical Notes:** ASP.NET Core Controllers; MongoDB driver; repository pattern per repo conventions.
**Dependencies:** Existing infra (Serilog, Auth, Group/Category services).
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-007: Create Task Endpoint with Validation
**As a** Admin **I want to** create tasks securely **So that** we maintain integrity

**Acceptance Criteria:**
- [ ] `POST /api/tasks` validates name, difficulty, due date, categoryId, assignee membership.
- [ ] Stores UTC datetime; sets status to Pending.
- [ ] Returns 201 with TaskResponse.

**Technical Notes:** Controller validation; service orchestrates; errors via middleware.
**Dependencies:** US-006; Group/Category services.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-008: Recurring Tasks Generation (30-Day Window)
**As a** Admin **I want to** auto-generate upcoming instances **So that** users can plan

**Acceptance Criteria:**
- [ ] When `isRecurring=true`, generate instances for next 30 days according to pattern.
- [ ] Parent carries `recurringPattern`; instances reference parent via `parentTaskId`.
- [ ] End date limited to +365 days; weekly respects `daysOfWeek`.

**Technical Notes:** `RecurringTaskGenerator`; batch insert; efficient queries.
**Dependencies:** US-007.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-009: Get Tasks Endpoint with Filters
**As a** User **I want to** list tasks **So that** I can view workload

**Acceptance Criteria:**
- [ ] `GET /api/tasks` supports groupId, status, assignedTo, categoryId, page, pageSize.
- [ ] Returns paginated data with `isOverdue` computed.

**Technical Notes:** Repository filtering with indexes; service adds overdue flag.
**Dependencies:** US-006.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-010: Update Status Endpoint
**As a** Assignee/Admin **I want to** change status **So that** progress is tracked

**Acceptance Criteria:**
- [ ] `PUT /api/tasks/{id}/status` allows InProgress or Completed; validates transitions.
- [ ] Assignee or Admin only; timestamps recorded.

**Technical Notes:** Controller auth; service rules.
**Dependencies:** US-006.
**Estimated Effort:** S (3)
**Priority:** Should

### Story US-011: Update & Delete (Admin)
**As a** Admin **I want to** edit or delete tasks **So that** I can manage work

**Acceptance Criteria:**
- [ ] `PUT /api/tasks/{id}` partial updates with rules (no groupId change; reassign triggers notification stub).
- [ ] `DELETE /api/tasks/{id}` soft deletes; recurring parent cascades.

**Technical Notes:** Soft delete flag; update validations; future notification integration.
**Dependencies:** US-006.
**Estimated Effort:** S (3)
**Priority:** Should

## Epic E3: Tests – Unit & Integration
**Description:** Ensure correctness through unit tests (service logic) and integration tests (controller endpoints).
**Business Value:** Prevent regressions and enforce rules.
**Success Criteria:** Green test suite; coverage ~70% on Task domain.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-012: Unit Tests – TaskService & Recurrence
**As a** Developer **I want to** validate core logic **So that** business rules are enforced

**Acceptance Criteria:**
- [ ] Validate assignee and category checks; default Pending status.
- [ ] Recurrence generator daily/weekly/monthly.
- [ ] Invalid transitions rejected.

**Technical Notes:** xUnit; mocks for services; edge cases.
**Dependencies:** Backend stories.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-013: Integration Tests – Create & List
**As a** Developer **I want to** verify endpoints **So that** API contracts hold

**Acceptance Criteria:**
- [ ] POST success & validation failures; recurring parent + instances.
- [ ] GET filters; pagination; overdue flag.

**Technical Notes:** WebApplicationFactory; seeded test data; test Mongo setup.
**Dependencies:** Backend stories.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-014: Integration Tests – Update & Delete
**As a** Developer **I want to** ensure update/delete rules **So that** data integrity is maintained

**Acceptance Criteria:**
- [ ] PUT status and admin update rules.
- [ ] DELETE soft delete; parent cascade.

**Technical Notes:** Similar to US-013.
**Dependencies:** Backend stories.
**Estimated Effort:** S (3)
**Priority:** Should

## Epic E4: Sprint Operations & Hardening
**Description:** Background overdue computation stub and DX.
**Business Value:** Improves reliability and maintainability.
**Success Criteria:** Overdue computed on-demand; indexes verified; logs clean.
**Estimated Effort:** XS
**Priority:** Medium

### Story US-015: Overdue On-Demand Check
**As a** Developer **I want to** compute overdue in queries **So that** users see accurate status

**Acceptance Criteria:**
- [ ] GET logic marks Overdue when `dueDate < now` and not Completed.

**Technical Notes:** Service layer check.
**Dependencies:** US-009.
**Estimated Effort:** XS (2)
**Priority:** Should

### Story US-016: Index Verification & Performance
**As a** Developer **I want to** validate indexes **So that** queries perform well

**Acceptance Criteria:**
- [ ] Ensure all required indexes exist; add migration/init step.

**Technical Notes:** Startup initialization; repo index creation.
**Dependencies:** US-006.
**Estimated Effort:** XS (2)
**Priority:** Should

## Sprint Plan

## Sprint 1: Client + Core Backend
**Duration:** 2 weeks
**Sprint Goal:** Admin can create one-time/weekly tasks; assignee sees tasks list.
**Stories:** US-001 (S), US-002 (S), US-003 (XS), US-006 (M), US-007 (S), US-009 (S), US-015 (XS)
**Capacity:** 10 days | **Committed:** ~19 points (incl. AI + buffer)

## Sprint 2: Recurrence + Updates + Tests
**Duration:** 2 weeks
**Sprint Goal:** Recurrence generation, status update, delete, calendar, tests.
**Stories:** US-004 (S), US-005 (M), US-008 (M), US-010 (S), US-011 (S), US-012 (S), US-013 (S), US-014 (S), US-016 (XS)
**Capacity:** 10 days | **Committed:** ~28 points (incl. AI + buffer)

## Dependencies & Risks
- Dependencies: FR-002 Groups, FR-003 Categories; future FR-009 Notifications.
- Risks: Recurrence performance; timezone consistency; user understanding of parent/instance.

## Release Phases
- Phase 1 (MVP): Sprints 1-2
- Phase 2 (Enhancement): Future calendar refinements, notifications
- Phase 3 (Optimization): Background jobs, history, leaderboard tie-ins
