# Work Plan: FR-027 Dashboard Navigation & My Tasks View

**Project:** NU Tasks Tracker - Dashboard Navigation Enhancement  
**Document Version:** 1.0  
**Last Updated:** December 19, 2025  
**Design Reference:** [design.md](./design.md)  
**PRD Reference:** [prd.md](./prd.md)  
**Progress Tracking:** [progress.md](./progress.md)

---

## Vision & Success Metrics

### Vision Statement
```
For NU Tasks Tracker users who manage tasks across multiple groups,
the Dashboard Navigation is a tabbed interface that enables 
unified task visibility and cross-group prioritization through 
filtering and sorting capabilities.
```

### Success Metrics

**User Adoption:**
- **Target:** 60% of active users click "My Tasks" tab within first week
- **Target:** 70% retention rate (users return to My Tasks in subsequent sessions)
- **Target:** 3+ My Tasks page views per user per week

**Usability:**
- **Target:** 40% of sessions use at least one filter
- **Target:** 30% of sessions use sorting
- **Target:** 10% improvement in task completion rate

**Performance:**
- **Target:** <2s page load time (p95)
- **Target:** <500ms filter response time (p95)
- **Target:** <300ms API response time (p95)
- **Target:** Zero 500 errors in first week

**Business:**
- **Target:** 15% increase in weekly active users
- **Target:** 20% increase in daily task interactions
- **Target:** Reduce user support tickets about "finding tasks" by 50%

---

## Timeline Overview

**Total Duration:** 4 weeks (8 sprints of 2-3 days each)  
**Total Epics:** 5  
**Total Stories:** 28  
**Estimated Effort:** 32 days with AI co-development

### Sprint Breakdown
- **Sprint 1-2:** Backend API Foundation (4 days)
- **Sprint 3-4:** Frontend Core Components (Client-First) (7 days)
- **Sprint 5-6:** Filters, Sorting & Integration (6 days)
- **Sprint 7:** Dashboard Refactoring & Routing (4 days)
- **Sprint 8:** Testing, Polish & i18n (5 days)
- **Sprint 9:** Performance Optimization & Launch (6 days)

---

## Epic 1: Backend API Infrastructure

**Description:** Build robust backend API to fetch, filter, and sort user tasks across all groups  
**Business Value:** Enables frontend to display consolidated task view with high performance  
**Success Criteria:**
- GET /tasks/my-tasks endpoint returns user tasks with <300ms response time
- Supports filtering by difficulty and status
- Supports sorting by difficulty, status, due date
- Pagination handles 500+ tasks efficiently
- 100% code coverage for service and repository layers

**Estimated Effort:** 4 days  
**Priority:** Critical (blocks all frontend work)  
**Dependencies:** None (extends existing infrastructure)

---

### Story BE-001: Create GET /tasks/my-tasks API Endpoint

**As a** backend developer **I want to** create a new controller endpoint **So that** the frontend can fetch all user tasks

**Acceptance Criteria:**
- [ ] Given authenticated user, when GET /tasks/my-tasks called, then returns 200 OK with tasks array
- [ ] Given invalid JWT, when endpoint called, then returns 401 Unauthorized
- [ ] Given valid request, when userId extracted from JWT claims, then queries only user's assigned tasks
- [ ] Given query params (difficulty, status, sortBy, sortOrder, page, pageSize), when provided, then passes to service layer
- [ ] Given invalid query params, when validation fails, then returns 400 Bad Request with error message

**Technical Notes:**
- File: `backend/src/TasksTracker.Api/Features/Tasks/Controllers/TasksController.cs`
- Extract userId from `ClaimTypes.NameIdentifier`
- Validate sortBy enum: ["difficulty", "status", "dueDate"]
- Validate sortOrder enum: ["asc", "desc"]
- Validate pageSize <= 100 (prevent abuse)
- Use existing authorization middleware (JWT)

**Dependencies:** None  
**Estimated Effort:** 0.5 days (4 hours)  
- Controller method: 1h
- Validation logic: 1h  
- Error handling: 1h
- Manual testing: 1h

**Priority:** Must Have

---

### Story BE-002: Implement GetUserTasksAsync Service Method

**As a** backend developer **I want to** implement service layer logic **So that** tasks are enriched with group names

**Acceptance Criteria:**
- [ ] Given userId and filters, when GetUserTasksAsync called, then builds MongoDB filter correctly
- [ ] Given difficulty filter, when applied, then returns only tasks matching difficulty
- [ ] Given status filter, when applied, then returns only tasks matching status
- [ ] Given multiple filters, when combined, then uses AND logic (e.g., HARD + IN_PROGRESS)
- [ ] Given task results, when group lookup needed, then enriches with group names from groupsRepository
- [ ] Given missing group, when task references deleted group, then returns "Unknown Group" as groupName

**Technical Notes:**
- File: `backend/src/TasksTracker.Api/Features/Tasks/Services/TaskService.cs`
- Use MongoDB FilterBuilder for dynamic filter construction
- Lookup groups by distinct groupIds from tasks (batch query)
- Map tasks to TaskWithGroupDto
- Handle edge case: tasks in deleted groups

**Dependencies:** BE-001  
**Estimated Effort:** 1 day (8 hours)  
- Service method: 3h
- Group enrichment logic: 2h
- Error handling: 1h
- Unit tests: 2h

**Priority:** Must Have

---

### Story BE-003: Implement FindUserTasksAsync Repository Method

**As a** backend developer **I want to** implement repository query logic **So that** tasks are fetched with filtering, sorting, and pagination

**Acceptance Criteria:**
- [ ] Given filter definition, when FindUserTasksAsync called, then queries MongoDB with filter
- [ ] Given sortBy and sortOrder, when query executed, then returns results in correct order
- [ ] Given page and pageSize, when query executed, then returns correct page of results using skip/limit
- [ ] Given 1000 tasks, when page 2 with pageSize 50 requested, then returns tasks 51-100
- [ ] Given sortBy="dueDate", when ascending order, then earliest due dates appear first

**Technical Notes:**
- File: `backend/src/TasksTracker.Api/Infrastructure/Repositories/TaskRepository.cs`
- Use MongoDB driver's Find() with Sort() and Skip()/Limit()
- Sort definition: `Builders<Task>.Sort.Ascending(sortBy)` or `.Descending()`
- Calculate skip: `(page - 1) * pageSize`
- Return List<TaskItem>

**Dependencies:** None (parallel with BE-002)  
**Estimated Effort:** 0.5 days (4 hours)  
- Repository method: 2h
- Pagination logic: 1h
- Integration tests: 1h

**Priority:** Must Have

---

### Story BE-004: Create TaskWithGroupDto Response Model

**As a** backend developer **I want to** define response DTO **So that** API returns task with group name

**Acceptance Criteria:**
- [ ] Given TaskWithGroupDto class, when defined, then includes all TaskItem properties
- [ ] Given TaskWithGroupDto, when instantiated, then includes GroupName property (string)
- [ ] Given null group name, when DTO created, then defaults to "Unknown Group"
- [ ] Given DTO serialization, when JSON returned, then all properties camelCase

**Technical Notes:**
- File: `backend/src/TasksTracker.Api/Features/Tasks/Models/TaskWithGroupDto.cs`
- Use C# record type for immutability
- Properties: Id, Name, Description, Difficulty, Status, DueAt, GroupId, GroupName, AssignedUserId
- Add JSON serialization attributes if needed

**Dependencies:** None  
**Estimated Effort:** 0.25 days (2 hours)  
- DTO definition: 30min
- Documentation: 30min
- Validation: 1h

**Priority:** Must Have

---

### Story BE-005: Add MongoDB Compound Indexes for Performance

**As a** backend developer **I want to** create database indexes **So that** queries on assignedUserId + filters are fast

**Acceptance Criteria:**
- [ ] Given compound index on (assignedUserId, difficulty, status), when created, then query uses index
- [ ] Given compound index on (assignedUserId, dueDate), when created, then sort by due date uses index
- [ ] Given compound index on (assignedUserId, status, dueDate), when created, then filtered sort uses index
- [ ] Given 10,000 tasks, when query with indexes, then execution time <50ms
- [ ] Given MongoDB Compass, when indexes inspected, then all 3 indexes visible

**Technical Notes:**
- MongoDB shell commands or migration script
- Index 1: `db.tasks.createIndex({ assignedUserId: 1, difficulty: 1, status: 1 })`
- Index 2: `db.tasks.createIndex({ assignedUserId: 1, dueDate: 1 })`
- Index 3: `db.tasks.createIndex({ assignedUserId: 1, status: 1, dueDate: 1 })`
- Use `db.tasks.getIndexes()` to verify
- Run explain() on queries to confirm index usage

**Dependencies:** BE-003 (test with actual queries)  
**Estimated Effort:** 0.5 days (4 hours)  
- Index creation script: 1h
- Testing with explain(): 2h
- Performance validation: 1h

**Priority:** Should Have (critical for performance at scale)

---

### Story BE-006: Add Rate Limiting Middleware for /tasks/my-tasks

**As a** backend developer **I want to** implement rate limiting **So that** API is protected from abuse

**Acceptance Criteria:**
- [ ] Given rate limit of 100 req/min per user, when user exceeds limit, then returns 429 Too Many Requests
- [ ] Given 429 response, when returned, then includes Retry-After header
- [ ] Given rate limit, when tracked per userId, then different users have separate quotas
- [ ] Given suspicious activity (>500 req/min), when detected, then logs warning to Serilog

**Technical Notes:**
- Use AspNetCoreRateLimit library or custom middleware
- Apply to /tasks/my-tasks endpoint specifically
- Store rate limit counters in memory (or Redis for distributed systems)
- Log violations for monitoring

**Dependencies:** BE-001  
**Estimated Effort:** 0.75 days (6 hours)  
- Middleware setup: 2h
- Configuration: 1h
- Testing: 2h
- Documentation: 1h

**Priority:** Should Have

---

### Story BE-007: Write Backend Unit & Integration Tests

**As a** QA engineer **I want to** comprehensive backend tests **So that** API is reliable

**Acceptance Criteria:**
- [ ] Given TasksController tests, when run, then covers happy path, auth failures, validation errors
- [ ] Given TaskService tests, when run, then covers filter combinations, group enrichment, edge cases
- [ ] Given TaskRepository tests, when run, then covers pagination, sorting, filtering with test database
- [ ] Given all tests, when executed, then 70%+ code coverage achieved
- [ ] Given integration tests, when run, then validates end-to-end flow (controller → service → repository)

**Technical Notes:**
- Use xUnit for testing framework
- Mock repositories in service tests
- Use in-memory MongoDB or test container for repository integration tests
- Test cases:
  - Valid filters return correct results
  - Invalid sortBy returns 400
  - Pagination returns correct pages
  - Multiple filters use AND logic
  - Tasks from deleted groups show "Unknown Group"

**Dependencies:** BE-001, BE-002, BE-003  
**Estimated Effort:** 1.5 days (12 hours)  
- Controller tests: 3h
- Service tests: 4h
- Repository tests: 3h
- Integration tests: 2h

**Priority:** Must Have

---

## Epic 2: Frontend Core Components (Client-First)

**Description:** Build React components for My Tasks view with filters and sorting  
**Business Value:** Users can see all tasks in one place and prioritize effectively  
**Success Criteria:**
- MyTasksTab renders task list with loading and empty states
- TaskFilters allow selecting difficulty and status
- TaskSort allows selecting sort field and order
- All components have 70%+ test coverage
- RTL support works correctly for Hebrew

**Estimated Effort:** 7 days  
**Priority:** Critical (core user-facing feature)  
**Dependencies:** Epic 1 (Backend API) partially blocking

---

### Story FE-001: Create DashboardNavigation Component

**As a** user **I want to** switch between My Groups and My Tasks **So that** I can access different views

**Acceptance Criteria:**
- [ ] Given DashboardNavigation rendered, when viewed, then shows two tabs: "My Groups" and "My Tasks"
- [ ] Given current route is /dashboard/groups, when viewed, then My Groups tab is highlighted
- [ ] Given current route is /dashboard/tasks, when viewed, then My Tasks tab is highlighted
- [ ] Given user clicks My Tasks tab, when clicked, then navigates to /dashboard/tasks
- [ ] Given user clicks My Groups tab, when clicked, then navigates to /dashboard/groups
- [ ] Given Hebrew language, when rendered, then tabs display in Hebrew with RTL layout

**Technical Notes:**
- File: `web/src/features/dashboard/components/DashboardNavigation.tsx`
- Use Headless UI `Tab.Group` component
- Use React Router `useNavigate()` and `useLocation()`
- Apply Tailwind CSS: blue bg for active tab, gray for inactive
- Responsive: full width on mobile, auto on desktop
- ARIA attributes: role="tablist", aria-selected

**Dependencies:** None  
**Estimated Effort:** 0.5 days (4 hours)  
- Component implementation: 2h
- Styling: 1h
- Unit tests: 1h

**Priority:** Must Have

---

### Story FE-002: Create TaskFilters Component

**As a** user **I want to** filter tasks by difficulty and status **So that** I can focus on specific types of tasks

**Acceptance Criteria:**
- [ ] Given TaskFilters rendered, when viewed, then shows Difficulty and Status filter groups
- [ ] Given Difficulty filter, when clicked, then shows Easy, Medium, Hard options
- [ ] Given Status filter, when clicked, then shows Pending, In Progress, Completed options
- [ ] Given filter selected, when clicked, then button shows blue background (active state)
- [ ] Given filter active, when clicked again, then deselects filter (returns to null)
- [ ] Given any filter active, when viewed, then "Clear Filters" button appears
- [ ] Given "Clear Filters" clicked, when clicked, then resets all filters to null
- [ ] Given filters changed, when changed, then calls onFilterChange callback with new values
- [ ] Given mobile view, when rendered, then filters stack vertically

**Technical Notes:**
- File: `web/src/features/dashboard/components/TaskFilters.tsx`
- Props: `{ difficulty, status, onFilterChange, onClearFilters }`
- Use button elements with Tailwind classes
- Active state: `bg-blue-500 text-white`
- Inactive state: `border border-gray-300 text-gray-700`
- Translation keys: `tasks.filters.*`, `tasks.difficulty.*`, `tasks.status.*`

**Dependencies:** None  
**Estimated Effort:** 1 day (8 hours)  
- Component implementation: 3h
- Styling (desktop + mobile): 2h
- Translations: 1h
- Unit tests: 2h

**Priority:** Must Have

---

### Story FE-003: Create TaskSort Component

**As a** user **I want to** sort tasks by different criteria **So that** I can prioritize my work

**Acceptance Criteria:**
- [ ] Given TaskSort rendered, when viewed, then shows dropdown with current sort selection
- [ ] Given dropdown clicked, when opened, then shows 6 sort options (difficulty asc/desc, status asc/desc, due date asc/desc)
- [ ] Given sort option selected, when clicked, then dropdown closes and calls onSortChange
- [ ] Given sort changed, when applied, then dropdown button label updates to show current selection
- [ ] Given default state, when rendered, then "Due Date (Earliest First)" is selected

**Technical Notes:**
- File: `web/src/features/dashboard/components/TaskSort.tsx`
- Use Headless UI `Listbox` component
- Props: `{ sortBy, sortOrder, onSortChange }`
- Sort options array with value, label, field, order
- Translation keys: `tasks.sort.*`
- Checkmark icon for selected option

**Dependencies:** None  
**Estimated Effort:** 0.75 days (6 hours)  
- Component implementation: 3h
- Styling: 1h
- Translations: 1h
- Unit tests: 1h

**Priority:** Must Have

---

### Story FE-004: Create TaskCard Component for Individual Tasks

**As a** user **I want to** see task details in a card **So that** I can understand what needs to be done

**Acceptance Criteria:**
- [ ] Given TaskCard rendered, when viewed, then displays task name, description, difficulty, status, due date
- [ ] Given task with group name, when rendered, then shows group badge in top-right corner
- [ ] Given group badge clicked, when clicked, then navigates to group detail page (optional for v1)
- [ ] Given task card clicked, when clicked, then calls onClick callback with taskId
- [ ] Given difficulty, when displayed, then shows color-coded badge (easy=green, medium=yellow, hard=red)
- [ ] Given status, when displayed, then shows status pill (pending=gray, in-progress=blue, completed=green)
- [ ] Given due date, when displayed, then shows relative time (e.g., "in 3 days", "overdue by 2 days")
- [ ] Given overdue task, when rendered, then due date shows in red color

**Technical Notes:**
- File: `web/src/components/TaskCard.tsx` (NEW component, not enhancing existing)
- Props: `{ task: TaskWithGroup, onClick?, showGroupBadge? }`
- Use date-fns `formatDistanceToNow()` for relative dates
- Tailwind classes for badges and colors
- Hover effect: shadow and scale
- Responsive: full width on mobile, fixed width on desktop

**Dependencies:** None  
**Estimated Effort:** 1 day (8 hours)  
- Component implementation: 4h
- Styling: 2h
- Date formatting logic: 1h
- Unit tests: 1h

**Priority:** Must Have

---

### Story FE-005: Create TaskList Component with Virtualization

**As a** user **I want to** scroll through many tasks smoothly **So that** the app remains responsive with 500+ tasks

**Acceptance Criteria:**
- [ ] Given <50 tasks, when rendered, then displays simple list without virtualization
- [ ] Given 50+ tasks, when rendered, then uses react-window VariableSizeList for virtualization
- [ ] Given loading state, when isLoading=true, then displays 5 skeleton task cards
- [ ] Given no tasks, when tasks.length=0, then displays empty state message
- [ ] Given task card clicked, when clicked, then calls onTaskClick(taskId)
- [ ] Given virtualized list, when scrolling, then only visible rows are rendered (10-15 at a time)

**Technical Notes:**
- File: `web/src/features/dashboard/components/TaskList.tsx`
- Install react-window: `npm install react-window @types/react-window`
- Props: `{ tasks: TaskWithGroup[], isLoading, onTaskClick }`
- Use VariableSizeList with getItemSize callback (avg 120px per row)
- Empty state: "No tasks available" message with icon
- Use React.memo on TaskCard to prevent re-renders

**Dependencies:** FE-004 (TaskCard)  
**Estimated Effort:** 1 day (8 hours)  
- Basic list implementation: 2h
- Virtualization setup: 3h
- Loading/empty states: 1h
- Unit tests: 2h

**Priority:** Should Have (can start with simple list, add virtualization later)

---

### Story FE-006: Create MyTasksTab Container Component

**As a** user **I want to** see all my tasks with filters and sorting **So that** I can manage tasks across groups

**Acceptance Criteria:**
- [ ] Given MyTasksTab rendered, when mounted, then calls useGetMyTasksQuery with default filters (no filters, sortBy=dueDate, sortOrder=asc)
- [ ] Given filter changed, when user selects difficulty, then updates URL params and re-queries API
- [ ] Given filter changed, when user selects status, then updates URL params and re-queries API
- [ ] Given sort changed, when user selects sort option, then updates URL params and re-queries API
- [ ] Given multiple filters, when applied, then URL includes all params (e.g., ?difficulty=HARD&status=IN_PROGRESS&sortBy=dueDate)
- [ ] Given URL with params, when page loaded, then applies filters from URL (deep linking works)
- [ ] Given loading state, when data fetching, then shows loading indicator
- [ ] Given error state, when API fails, then displays error message with retry button
- [ ] Given tasks loaded, when displayed, then renders TaskList with tasks

**Technical Notes:**
- File: `web/src/features/dashboard/components/MyTasksTab.tsx`
- Use React Router `useSearchParams()` for URL state management
- Debounce filter changes (300ms) to reduce API calls
- Call useGetMyTasksQuery(filters) from RTK Query
- Render TaskFilters, TaskSort, TaskList components
- Handle loading, error, empty states
- Mobile: collapsible filter panel (drawer or accordion)

**Dependencies:** FE-002 (TaskFilters), FE-003 (TaskSort), FE-005 (TaskList)  
**Estimated Effort:** 1.5 days (12 hours)  
- Component structure: 3h
- URL state management: 3h
- API integration: 2h
- Loading/error states: 2h
- Unit tests: 2h

**Priority:** Must Have

---

### Story FE-007: Create useGetMyTasksQuery RTK Query Hook

**As a** frontend developer **I want to** fetch user tasks from API **So that** MyTasksTab can display data

**Acceptance Criteria:**
- [ ] Given useGetMyTasksQuery hook, when called with filters, then makes GET /tasks/my-tasks request
- [ ] Given query params, when provided, then includes in URL query string (e.g., ?difficulty=HARD&status=IN_PROGRESS)
- [ ] Given response received, when successful, then caches data with 5min TTL
- [ ] Given duplicate request, when made within cache window, then returns cached data without API call
- [ ] Given task mutation (create/update/delete), when executed, then invalidates Task LIST tag
- [ ] Given error response, when API fails, then returns error object to component

**Technical Notes:**
- File: `web/src/app/api/tasksApi.ts` (extend existing slice)
- Endpoint: `getMyTasks: builder.query<TaskWithGroup[], GetMyTasksRequest>`
- Use RTK Query providesTags for cache management
- keepUnusedDataFor: 300 seconds (5min)
- Include JWT token in Authorization header (handled by apiSlice)

**Dependencies:** BE-001 (backend endpoint must exist)  
**Estimated Effort:** 0.5 days (4 hours)  
- Endpoint definition: 1h
- TypeScript types: 1h
- Cache tags setup: 1h
- Testing with MSW: 1h

**Priority:** Must Have

---

### Story FE-008: Write Frontend Component Unit Tests

**As a** QA engineer **I want to** test all new components **So that** they work correctly

**Acceptance Criteria:**
- [ ] Given DashboardNavigation tests, when run, then covers tab rendering, navigation, active states
- [ ] Given TaskFilters tests, when run, then covers filter selection, clear button, callbacks
- [ ] Given TaskSort tests, when run, then covers dropdown interaction, option selection
- [ ] Given TaskCard tests, when run, then covers rendering, click handler, badge display
- [ ] Given TaskList tests, when run, then covers loading, empty states, virtualization
- [ ] Given MyTasksTab tests, when run, then covers URL state, API integration, filter/sort interactions
- [ ] Given all tests, when executed, then 70%+ coverage achieved

**Technical Notes:**
- Use Vitest + React Testing Library
- Mock RTK Query hooks with MSW (Mock Service Worker)
- Test accessibility (ARIA attributes, keyboard navigation)
- Test i18n (English and Hebrew rendering)
- Snapshot tests for visual regression

**Dependencies:** FE-001 through FE-007  
**Estimated Effort:** 1.5 days (12 hours)  
- DashboardNavigation tests: 1h
- TaskFilters tests: 2h
- TaskSort tests: 1h
- TaskCard tests: 2h
- TaskList tests: 2h
- MyTasksTab tests: 3h
- Integration tests: 1h

**Priority:** Must Have

---

## Epic 3: Dashboard Refactoring & Routing

**Description:** Refactor existing DashboardPage to use tabbed navigation and preserve My Groups functionality  
**Business Value:** Seamless integration of new My Tasks view without breaking existing features  
**Success Criteria:**
- DashboardPage uses DashboardNavigation with two tabs
- My Groups tab preserves 100% of existing functionality
- React Router handles /dashboard/groups and /dashboard/tasks routes
- Zero regressions in group operations (create task, manage members, edit group)
- All existing tests pass without modification

**Estimated Effort:** 4 days  
**Priority:** Critical (high risk of breaking existing features)  
**Dependencies:** Epic 2 (frontend components)

---

### Story REF-001: Create Regression Test Suite for Current DashboardPage

**As a** QA engineer **I want to** comprehensive tests for existing DashboardPage **So that** refactoring doesn't break functionality

**Acceptance Criteria:**
- [ ] Given DashboardPage tests, when run, then covers all existing features (group grid, create task, manage members, edit group, logout)
- [ ] Given group card interactions, when tested, then verifies all click handlers work
- [ ] Given modals, when tested, then verifies CreateTaskModal, MemberListModal, ManageMembersModal open/close correctly
- [ ] Given API integration, when tested, then verifies useGetDashboardQuery is called correctly
- [ ] Given tests executed, when all pass, then baseline established for refactoring

**Technical Notes:**
- File: `web/src/features/dashboard/pages/__tests__/DashboardPage.test.tsx`
- Use Vitest + React Testing Library
- Mock all API calls with MSW
- Test happy paths and edge cases
- Create snapshots for visual regression

**Dependencies:** None  
**Estimated Effort:** 1 day (8 hours)  
- Test setup: 2h
- Core functionality tests: 4h
- Modal tests: 1h
- API integration tests: 1h

**Priority:** Must Have (MUST complete before refactoring)

---

### Story REF-002: Extract MyGroupsTab from DashboardPage

**As a** frontend developer **I want to** extract groups grid into separate component **So that** it can be used as a tab

**Acceptance Criteria:**
- [ ] Given MyGroupsTab component, when created, then contains all group grid rendering logic from DashboardPage
- [ ] Given MyGroupsTab, when rendered, then displays groups in grid layout (same as before)
- [ ] Given MyGroupsTab, when rendered, then handles create task, manage members, edit group actions
- [ ] Given MyGroupsTab, when rendered, then preserves all existing functionality (no regressions)
- [ ] Given DashboardPage tests, when run with MyGroupsTab, then all tests still pass

**Technical Notes:**
- File: `web/src/features/dashboard/components/MyGroupsTab.tsx`
- Copy group grid rendering logic from DashboardPage
- Preserve all useState, useAppSelector, useGetDashboardQuery hooks
- Keep modal state management
- No changes to behavior - pure extraction refactor

**Dependencies:** REF-001 (tests must exist first)  
**Estimated Effort:** 0.5 days (4 hours)  
- Extract component: 2h
- Verify functionality: 1h
- Update tests: 1h

**Priority:** Must Have

---

### Story REF-003: Update DashboardPage to Use Tabbed Navigation

**As a** frontend developer **I want to** integrate DashboardNavigation into DashboardPage **So that** users can switch between views

**Acceptance Criteria:**
- [ ] Given DashboardPage updated, when rendered, then shows DashboardNavigation component at top
- [ ] Given DashboardPage, when rendered, then includes React Router Outlet for tab content
- [ ] Given default route /, when accessed, then redirects to /dashboard/groups
- [ ] Given /dashboard/groups, when accessed, then renders MyGroupsTab
- [ ] Given /dashboard/tasks, when accessed, then renders MyTasksTab
- [ ] Given tab switch, when clicked, then content changes without page reload
- [ ] Given all regression tests, when run, then 100% pass (no broken functionality)

**Technical Notes:**
- File: `web/src/features/dashboard/pages/DashboardPage.tsx`
- Import DashboardNavigation, MyGroupsTab, MyTasksTab
- Use React Router `<Routes>` and `<Route>` for nested routing
- Update App.tsx routes to support /dashboard/groups and /dashboard/tasks
- Preserve header with user info and logout button

**Dependencies:** REF-002, FE-001, FE-006  
**Estimated Effort:** 1 day (8 hours)  
- Refactor DashboardPage: 3h
- Update routing: 2h
- Test all flows: 2h
- Fix any regressions: 1h

**Priority:** Must Have

---

### Story REF-004: Update App.tsx Routing Configuration

**As a** frontend developer **I want to** configure routes for dashboard tabs **So that** deep linking works

**Acceptance Criteria:**
- [ ] Given App.tsx routes, when updated, then includes /dashboard as parent route
- [ ] Given /dashboard accessed directly, when loaded, then redirects to /dashboard/groups (default)
- [ ] Given /dashboard/groups route, when accessed, then renders DashboardPage with MyGroupsTab
- [ ] Given /dashboard/tasks route, when accessed, then renders DashboardPage with MyTasksTab
- [ ] Given protected routes, when unauthenticated user accesses, then redirects to /login
- [ ] Given authenticated user, when navigates between tabs, then URL updates correctly

**Technical Notes:**
- File: `web/src/App.tsx`
- Update existing "/" route to "/dashboard" with child routes
- Use React Router v6 nested routes pattern
- Add `<Navigate>` for default redirect
- Preserve authentication guard

**Dependencies:** REF-003  
**Estimated Effort:** 0.5 days (4 hours)  
- Route configuration: 2h
- Testing navigation: 1h
- Update E2E tests: 1h

**Priority:** Must Have

---

### Story REF-005: Add Feature Flag for Gradual Rollout

**As a** product manager **I want to** control feature visibility **So that** we can gradually roll out to users

**Acceptance Criteria:**
- [ ] Given feature flag `enable_my_tasks_tab`, when set to false, then My Tasks tab is hidden
- [ ] Given feature flag false, when user accesses /dashboard/tasks, then redirects to /dashboard/groups
- [ ] Given feature flag true, when dashboard rendered, then My Tasks tab is visible
- [ ] Given feature flag config, when updated, then changes reflect without redeployment (via env variable)

**Technical Notes:**
- Create `web/src/config/features.ts` with feature flag configuration
- Use environment variable: `VITE_ENABLE_MY_TASKS_TAB`
- Create `useFeatureFlag()` hook
- Conditionally render My Tasks tab in DashboardNavigation
- Default to false in production, true in development

**Dependencies:** REF-004  
**Estimated Effort:** 0.5 days (4 hours)  
- Feature flag setup: 1h
- Hook implementation: 1h
- Integration: 1h
- Testing: 1h

**Priority:** Should Have

---

### Story REF-006: Run Full Regression Test Suite

**As a** QA engineer **I want to** verify no regressions **So that** existing features still work

**Acceptance Criteria:**
- [ ] Given all frontend tests, when run, then 100% pass
- [ ] Given My Groups tab, when tested manually, then all features work (create task, manage members, edit group, logout)
- [ ] Given My Tasks tab, when tested manually, then loads tasks, filters work, sorting works
- [ ] Given navigation, when tested, then switching between tabs works smoothly
- [ ] Given deep links, when tested, then /dashboard/groups and /dashboard/tasks load correctly
- [ ] Given Hebrew language, when tested, then RTL layout works correctly on both tabs

**Technical Notes:**
- Run `npm test` for unit tests
- Run Playwright E2E tests for full flows
- Manual QA checklist for critical paths
- Test on Chrome, Firefox, Safari (desktop)
- Test on iOS Safari, Android Chrome (mobile)

**Dependencies:** REF-003, REF-004  
**Estimated Effort:** 1 day (8 hours)  
- Automated test execution: 2h
- Manual QA testing: 4h
- Bug fixes: 2h

**Priority:** Must Have

---

## Epic 4: Internationalization (i18n)

**Description:** Add translations for all new UI elements in English and Hebrew with RTL support  
**Business Value:** Maintain bilingual support for Hebrew-speaking users  
**Success Criteria:**
- All new translation keys added to en and he files
- Hebrew translations reviewed by native speaker
- RTL layout works correctly on My Tasks tab
- Filter and sort labels display correctly in both languages

**Estimated Effort:** 1.5 days  
**Priority:** Must Have (required for Hebrew users)  
**Dependencies:** Epic 2 (components exist)

---

### Story I18N-001: Add English Translation Keys

**As a** developer **I want to** add English translations **So that** UI labels are localized

**Acceptance Criteria:**
- [ ] Given translation file, when opened, then includes dashboard.myTasks key
- [ ] Given translation file, when opened, then includes all tasks.filters.* keys (difficulty, status, clear)
- [ ] Given translation file, when opened, then includes all tasks.sort.* keys (6 sort options)
- [ ] Given translation file, when opened, then includes all tasks.emptyState.* keys (noTasks, noMatchingTasks, clearFiltersButton)
- [ ] Given translation file, when opened, then includes all tasks.difficulty.* and tasks.status.* enum labels

**Technical Notes:**
- File: `web/public/locales/en/translation.json`
- Add under existing "dashboard" and "tasks" sections
- Follow existing naming conventions (camelCase keys)
- Refer to design.md Section 8 for complete key list

**Dependencies:** None  
**Estimated Effort:** 0.25 days (2 hours)  
- Add keys: 1h
- Review and format: 1h

**Priority:** Must Have

---

### Story I18N-002: Add Hebrew Translation Keys

**As a** developer **I want to** add Hebrew translations **So that** Hebrew-speaking users can use the feature

**Acceptance Criteria:**
- [ ] Given Hebrew translation file, when opened, then includes all keys from English file
- [ ] Given Hebrew translations, when displayed, then use correct Hebrew terms (verified by native speaker)
- [ ] Given filter labels, when displayed, then read naturally in Hebrew
- [ ] Given sort options, when displayed, then use proper Hebrew grammar (e.g., "מיין לפי...")

**Technical Notes:**
- File: `web/public/locales/he/translation.json`
- Mirror structure from English file
- Use proper Hebrew translations (not Google Translate)
- Coordinate with native Hebrew speaker for review
- Refer to design.md Section 8 for translations

**Dependencies:** I18N-001  
**Estimated Effort:** 0.5 days (4 hours)  
- Translate keys: 2h
- Native speaker review: 1h
- Corrections: 1h

**Priority:** Must Have

---

### Story I18N-003: Test RTL Layout for My Tasks Tab

**As a** QA engineer **I want to** verify RTL layout **So that** Hebrew users have good UX

**Acceptance Criteria:**
- [ ] Given Hebrew language selected, when My Tasks tab viewed, then layout flips to RTL (filters on right, content on left)
- [ ] Given tab navigation, when Hebrew active, then My Tasks tab appears on right (RTL order)
- [ ] Given task cards, when viewed, then text aligns right and icons flip correctly
- [ ] Given filter buttons, when viewed, then layout flows RTL (no visual glitches)
- [ ] Given dropdown menus, when opened, then align correctly in RTL
- [ ] Given mobile view, when tested, then RTL layout works on small screens

**Technical Notes:**
- Test with `dir="rtl"` attribute on HTML element
- Verify Tailwind RTL utilities work correctly
- Check for hardcoded left/right margins (should use start/end)
- Test on actual Hebrew language setting, not just dev tools
- Use browser dev tools to inspect element positioning

**Dependencies:** I18N-002, FE-006 (MyTasksTab)  
**Estimated Effort:** 0.75 days (6 hours)  
- Desktop testing: 2h
- Mobile testing: 2h
- Bug fixes: 2h

**Priority:** Must Have

---

## Epic 5: Performance Optimization & Launch Preparation

**Description:** Optimize performance, conduct load testing, and prepare for production launch  
**Business Value:** Ensure feature can handle production load and provides good UX  
**Success Criteria:**
- Page load time <2s (p95)
- API response time <300ms (p95)
- Filter response <500ms (p95)
- Load testing validates 10,000 concurrent users
- Monitoring and alerting configured

**Estimated Effort:** 6 days  
**Priority:** Critical (required before launch)  
**Dependencies:** All previous epics

---

### Story PERF-001: Optimize React Rendering with Memoization

**As a** frontend developer **I want to** prevent unnecessary re-renders **So that** UI is performant

**Acceptance Criteria:**
- [ ] Given TaskCard, when wrapped in React.memo, then re-renders only when props change
- [ ] Given TaskList, when parent re-renders, then child TaskCards don't re-render unnecessarily
- [ ] Given filter changes, when applied, then only affected components re-render
- [ ] Given React DevTools Profiler, when recording, then shows minimal unnecessary renders

**Technical Notes:**
- Wrap TaskCard in React.memo with custom comparison function
- Use useMemo for expensive calculations (e.g., filtering, sorting)
- Use useCallback for event handlers passed to children
- Analyze with React DevTools Profiler

**Dependencies:** FE-004, FE-005  
**Estimated Effort:** 0.5 days (4 hours)  
- Add memoization: 2h
- Profiling and validation: 2h

**Priority:** Should Have

---

### Story PERF-002: Implement Debounced Filtering

**As a** user **I want to** smooth filter changes **So that** app doesn't make excessive API calls

**Acceptance Criteria:**
- [ ] Given filter changed, when user clicks rapidly, then API called only after 300ms pause
- [ ] Given debounced call, when pending, then shows loading indicator
- [ ] Given user clears filters, when clicked, then immediately triggers API call (no debounce)

**Technical Notes:**
- Use lodash debounce or custom hook
- Apply debounce in MyTasksTab component
- Debounce duration: 300ms
- Show loading spinner during debounce period

**Dependencies:** FE-006  
**Estimated Effort:** 0.25 days (2 hours)  
- Implement debounce: 1h
- Testing: 1h

**Priority:** Should Have

---

### Story PERF-003: Add Backend Caching with Redis (Optional for v2)

**As a** backend developer **I want to** cache frequent queries **So that** database load is reduced

**Acceptance Criteria:**
- [ ] Given popular filter combination, when queried, then result cached in Redis for 5 minutes
- [ ] Given cached result, when available, then returned without database query
- [ ] Given task mutation, when executed, then invalidates related cache entries
- [ ] Given Redis unavailable, when query made, then falls back to database query (graceful degradation)

**Technical Notes:**
- Install StackExchange.Redis package
- Cache key format: `tasks:user:{userId}:filters:{hash}`
- TTL: 300 seconds (5 minutes)
- Invalidate on task create/update/delete

**Dependencies:** BE-002  
**Estimated Effort:** 1 day (8 hours)  
- Redis setup: 2h
- Caching logic: 3h
- Invalidation strategy: 2h
- Testing: 1h

**Priority:** Could Have (nice to have, not MVP)

---

### Story PERF-004: Conduct Load Testing with 10K Concurrent Users

**As a** DevOps engineer **I want to** load test the feature **So that** we know it can handle production traffic

**Acceptance Criteria:**
- [ ] Given load test with 10,000 concurrent users, when run, then API response time <300ms (p95)
- [ ] Given load test, when run, then database CPU usage <70%
- [ ] Given load test, when run, then zero 500 errors occur
- [ ] Given load test, when run, then frontend load time <2s (p95)
- [ ] Given results, when analyzed, then identifies bottlenecks and optimization opportunities

**Technical Notes:**
- Use k6, JMeter, or Artillery for load testing
- Test scenarios:
  - 10,000 users navigating to My Tasks tab
  - 5,000 users applying filters simultaneously
  - 3,000 users changing sort order
- Monitor MongoDB performance (slow query log)
- Monitor backend CPU, memory, network

**Dependencies:** BE-001, BE-002, BE-003, FE-007  
**Estimated Effort:** 1.5 days (12 hours)  
- Test script setup: 3h
- Test execution: 4h
- Analysis and optimization: 3h
- Re-test: 2h

**Priority:** Should Have

---

### Story PERF-005: Set Up Monitoring and Alerts

**As a** DevOps engineer **I want to** monitor feature performance **So that** we detect issues quickly

**Acceptance Criteria:**
- [ ] Given Serilog logs, when errors occur, then logged with context (userId, query params)
- [ ] Given DataDog/New Relic, when configured, then tracks API response times, error rates
- [ ] Given alert threshold, when API response time >500ms, then sends Slack notification
- [ ] Given alert threshold, when error rate >1%, then sends email notification
- [ ] Given dashboard, when viewed, then shows key metrics (request rate, p95 latency, error rate)

**Technical Notes:**
- Configure Serilog to log to file and cloud (e.g., Seq, Datadog)
- Set up APM (Application Performance Monitoring)
- Create dashboard with key metrics
- Configure alerts for:
  - API latency >500ms (p95)
  - Error rate >1%
  - Database slow queries >1s

**Dependencies:** BE-001  
**Estimated Effort:** 1 day (8 hours)  
- Logging setup: 2h
- APM configuration: 3h
- Dashboard creation: 2h
- Alert configuration: 1h

**Priority:** Must Have

---

### Story PERF-006: Write Playwright E2E Tests for Critical Flows

**As a** QA engineer **I want to** automated E2E tests **So that** we catch regressions before production

**Acceptance Criteria:**
- [ ] Given E2E test, when run, then navigates to My Tasks tab and verifies task list loads
- [ ] Given E2E test, when run, then applies difficulty filter and verifies results update
- [ ] Given E2E test, when run, then applies status filter and verifies results update
- [ ] Given E2E test, when run, then changes sort order and verifies task order changes
- [ ] Given E2E test, when run, then switches between My Groups and My Tasks tabs
- [ ] Given E2E test, when run, then verifies deep linking to /dashboard/tasks works
- [ ] Given E2E test, when run, then tests Hebrew language and RTL layout

**Technical Notes:**
- Use Playwright for E2E testing
- Test files: `web/e2e/dashboard-navigation.spec.ts`
- Run against local dev server or staging environment
- Include screenshots on failure
- Run in CI/CD pipeline

**Dependencies:** All frontend and backend stories  
**Estimated Effort:** 1.5 days (12 hours)  
- Test setup: 2h
- Navigation tests: 2h
- Filter/sort tests: 3h
- i18n tests: 2h
- CI integration: 3h

**Priority:** Must Have

---

### Story PERF-007: Create Launch Checklist and Runbook

**As a** product manager **I want to** launch checklist **So that** we don't miss any steps

**Acceptance Criteria:**
- [ ] Given launch checklist, when reviewed, then includes all pre-launch tasks (testing, performance, monitoring, docs)
- [ ] Given runbook, when created, then includes rollback plan in case of issues
- [ ] Given runbook, when created, then includes monitoring instructions (what to watch, where to check)
- [ ] Given runbook, when created, then includes troubleshooting guide (common issues, solutions)
- [ ] Given feature flag, when in runbook, then includes instructions for enabling/disabling

**Technical Notes:**
- Create `docs/FR-027/launch-checklist.md`
- Create `docs/FR-027/runbook.md`
- Include:
  - Pre-launch checklist (tests pass, performance validated, monitoring configured)
  - Rollout plan (5% → 25% → 100%)
  - Rollback procedure (disable feature flag, revert deployment)
  - Monitoring dashboards (links, key metrics)
  - Known issues and workarounds

**Dependencies:** None  
**Estimated Effort:** 0.5 days (4 hours)  
- Checklist creation: 1h
- Runbook creation: 2h
- Review and updates: 1h

**Priority:** Must Have

---

## Sprint Plan

### Sprint 1: Backend Foundation (Dec 19-20, 2025) - 2 days

**Sprint Goal:** Complete backend API for fetching, filtering, and sorting user tasks

**Stories:**
- BE-004: TaskWithGroupDto (0.25d) - Must Have
- BE-001: API Endpoint (0.5d) - Must Have
- BE-002: Service Method (1d) - Must Have
- BE-003: Repository Method (0.5d) - Must Have

**Capacity:** 2 days | **Committed:** 2.25 days  
**Risk:** Slightly over capacity, prioritize BE-001/002/003 if needed

---

### Sprint 2: Backend Testing & Optimization (Dec 21-22, 2025) - 2 days

**Sprint Goal:** Ensure backend is production-ready with tests and performance optimizations

**Stories:**
- BE-005: MongoDB Indexes (0.5d) - Should Have
- BE-006: Rate Limiting (0.75d) - Should Have
- BE-007: Unit & Integration Tests (1.5d) - Must Have

**Capacity:** 2 days | **Committed:** 2.75 days  
**Risk:** Slightly over capacity, may need to defer BE-006 to next sprint

---

### Sprint 3: Frontend Core - Filters & Sort (Dec 23-24, 2025) - 2 days

**Sprint Goal:** Build reusable filter and sort components

**Stories:**
- FE-001: DashboardNavigation (0.5d) - Must Have
- FE-002: TaskFilters (1d) - Must Have
- FE-003: TaskSort (0.75d) - Must Have

**Capacity:** 2 days | **Committed:** 2.25 days  
**Balance:** Good capacity with quick wins

---

### Sprint 4: Frontend Core - Task Display (Dec 25-27, 2025) - 3 days

**Sprint Goal:** Build task card and list components

**Stories:**
- FE-004: TaskCard (1d) - Must Have
- FE-005: TaskList with Virtualization (1d) - Should Have
- FE-007: RTK Query Hook (0.5d) - Must Have

**Capacity:** 3 days | **Committed:** 2.5 days  
**Balance:** Under capacity, good buffer for testing

---

### Sprint 5: Frontend Integration (Dec 28-30, 2025) - 3 days

**Sprint Goal:** Integrate all components into MyTasksTab

**Stories:**
- FE-006: MyTasksTab Container (1.5d) - Must Have
- FE-008: Component Unit Tests (1.5d) - Must Have

**Capacity:** 3 days | **Committed:** 3 days  
**Balance:** Full capacity, critical integration sprint

---

### Sprint 6: Dashboard Refactoring - Part 1 (Dec 31, 2025 - Jan 1, 2026) - 2 days

**Sprint Goal:** Safely refactor DashboardPage with regression tests

**Stories:**
- REF-001: Regression Test Suite (1d) - Must Have
- REF-002: Extract MyGroupsTab (0.5d) - Must Have
- REF-003: Update DashboardPage (1d) - Must Have

**Capacity:** 2 days | **Committed:** 2.5 days  
**Risk:** High-risk refactor, may need extra buffer

---

### Sprint 7: Dashboard Refactoring - Part 2 (Jan 2-3, 2026) - 2 days

**Sprint Goal:** Complete routing and feature flag setup

**Stories:**
- REF-004: Update Routing (0.5d) - Must Have
- REF-005: Feature Flag (0.5d) - Should Have
- REF-006: Regression Testing (1d) - Must Have

**Capacity:** 2 days | **Committed:** 2 days  
**Balance:** Good capacity for final testing

---

### Sprint 8: Internationalization (Jan 4-5, 2026) - 2 days

**Sprint Goal:** Add translations and test RTL layout

**Stories:**
- I18N-001: English Translations (0.25d) - Must Have
- I18N-002: Hebrew Translations (0.5d) - Must Have
- I18N-003: RTL Testing (0.75d) - Must Have

**Capacity:** 2 days | **Committed:** 1.5 days  
**Balance:** Under capacity, buffer for polish

---

### Sprint 9: Performance & Launch (Jan 6-9, 2026) - 4 days

**Sprint Goal:** Optimize, test at scale, and prepare for launch

**Stories:**
- PERF-001: React Memoization (0.5d) - Should Have
- PERF-002: Debounced Filtering (0.25d) - Should Have
- PERF-004: Load Testing (1.5d) - Should Have
- PERF-005: Monitoring & Alerts (1d) - Must Have
- PERF-006: E2E Tests (1.5d) - Must Have
- PERF-007: Launch Checklist (0.5d) - Must Have

**Capacity:** 4 days | **Committed:** 5.25 days  
**Risk:** Over capacity, prioritize Must Have items (PERF-005, PERF-006, PERF-007)

---

## Dependencies & Risks

### Critical Path Dependencies

```
BE-001 (API Endpoint)
  ↓
BE-002 (Service) → BE-007 (Tests)
  ↓                      ↓
BE-003 (Repository) → BE-005 (Indexes)
  ↓
FE-007 (RTK Query)
  ↓
FE-006 (MyTasksTab) → FE-008 (Tests)
  ↓
REF-003 (Dashboard Refactor)
  ↓
REF-006 (Regression Tests)
  ↓
PERF-006 (E2E Tests)
```

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **DashboardPage refactor breaks existing features** | High | Critical | REF-001: Create comprehensive regression tests BEFORE refactoring. Use feature flag to control rollout. |
| **Performance degradation with 500+ tasks** | Medium | High | FE-005: Implement virtualization early. BE-005: Add indexes. PERF-004: Load test before launch. |
| **MongoDB query performance issues** | Medium | High | BE-005: Add compound indexes. PERF-003: Consider Redis caching. Monitor slow query log. |
| **RTL layout bugs in Hebrew** | Medium | Medium | I18N-003: Dedicated RTL testing sprint. Use Tailwind RTL utilities. QA review by Hebrew speaker. |
| **API rate limit issues during launch** | Low | Medium | BE-006: Implement rate limiting early. PERF-004: Load test to validate limits. Monitor API usage. |
| **Cache invalidation bugs** | Low | High | FE-007: Use RTK Query tag-based invalidation. FE-008: Test cache behavior thoroughly. |
| **Translation quality issues** | Medium | Low | I18N-002: Review by native Hebrew speaker. Avoid auto-translation tools. |
| **Timeline delays due to over-ambitious estimates** | Medium | Medium | Leave 20% buffer in each sprint. Prioritize Must Have over Should Have. Use feature flag to ship incrementally. |

### External Dependencies

- **None:** All dependencies are internal to the project (no third-party integrations)

### Team Dependencies

- **Native Hebrew Speaker:** Required for I18N-002 (Hebrew translation review)
- **DevOps Engineer:** Required for PERF-005 (monitoring setup) and deployment
- **QA Engineer:** Required for REF-006 and PERF-006 (regression and E2E testing)

---

## Release Phases

### Phase 1: MVP (Sprints 1-7) - Core Functionality
**Duration:** 3 weeks  
**Goal:** Deliver My Tasks view with filtering, sorting, and basic functionality

**Included:**
- Backend API with filters and sorting
- Frontend My Tasks tab with filters and sort
- Dashboard refactoring with tabbed navigation
- Basic testing and i18n

**Success Criteria:**
- Users can view all tasks in My Tasks tab
- Filters and sorting work correctly
- No regressions in My Groups functionality
- English and Hebrew translations complete

---

### Phase 2: Polish & Performance (Sprints 8-9) - Production-Ready
**Duration:** 1 week  
**Goal:** Optimize performance and prepare for production launch

**Included:**
- Performance optimizations (memoization, debouncing)
- Load testing and monitoring setup
- E2E test coverage
- Launch checklist and runbook

**Success Criteria:**
- Page load <2s, API response <300ms
- 70%+ test coverage
- Monitoring and alerts configured
- Rollback plan documented

---

### Phase 3: Enhancements (Post-Launch) - Out of Scope for MVP
**Duration:** TBD  
**Goal:** Add advanced features based on user feedback

**Potential Features:**
- Saved filter presets
- Bulk task actions
- Redis caching for performance
- Advanced analytics
- Calendar view
- Task dependencies

---

## Definition of Done

### Story-Level DoD
- [ ] Code implemented and reviewed (peer review or AI-assisted review)
- [ ] Unit tests written and passing (70%+ coverage)
- [ ] Component renders correctly in English and Hebrew
- [ ] No console errors or warnings
- [ ] Acceptance criteria verified manually
- [ ] Code committed to feature branch

### Epic-Level DoD
- [ ] All stories in epic completed
- [ ] Integration tests passing
- [ ] Feature tested end-to-end manually
- [ ] Performance acceptable (<2s load, <500ms filter)
- [ ] Documentation updated (if applicable)
- [ ] Feature reviewed by product manager

### Release-Level DoD
- [ ] All epics completed
- [ ] Regression tests passing (zero regressions)
- [ ] E2E tests passing
- [ ] Load testing completed (10K users)
- [ ] Monitoring and alerts configured
- [ ] Rollback plan documented
- [ ] Stakeholder approval obtained
- [ ] Feature flag configured for gradual rollout

---

## Retrospective & Continuous Improvement

### After Each Sprint:
1. **Review velocity:** Did we complete committed stories?
2. **Identify blockers:** What slowed us down?
3. **Adjust estimates:** Were estimates accurate? Update for next sprint.
4. **Celebrate wins:** Quick wins and milestones achieved.

### After Release:
1. **Measure success metrics:** Track adoption, performance, errors
2. **Collect user feedback:** In-app surveys, support tickets, analytics
3. **Identify improvements:** What would we do differently?
4. **Plan Phase 3:** Prioritize enhancements based on feedback

---

## Appendix: Estimation Methodology

### AI Co-Development Productivity Multipliers

**CRUD/Boilerplate:** 3-5x faster
- API endpoints: 0.5d instead of 2d
- DTO definitions: 2h instead of 1d

**Business Logic:** 2-3x faster
- Service methods: 1d instead of 2-3d
- Complex filtering: 1d instead of 2d

**React Components:** 2-3x faster
- Simple components: 0.5d instead of 1-2d
- Complex containers: 1.5d instead of 3-4d

**Testing:** 4-6x faster
- Unit tests: 1.5d instead of 6-8d
- Component tests: 2h instead of 1d

**Documentation:** 5-10x faster
- API docs: 1h instead of 4-8h
- Runbooks: 2h instead of 1-2d

### Story Point Scale

- **XS (1-2 points):** 0.5-1 day - Simple component, DTO, or config change
- **S (3 points):** 1-2 days - Moderate component with logic and tests
- **M (5 points):** 2-3 days - Complex component or service method with integration
- **L (8 points):** 3-5 days - Major refactor or multiple interrelated components
- **XL (13+ points):** Split into smaller stories (too large for 1 sprint)

### Buffer Recommendations

- **Individual stories:** Add 20% buffer for unexpected issues
- **Sprint planning:** Reserve 20% capacity for bugs and support
- **High-risk stories (refactors):** Add 50% buffer for regressions and fixes

---

**Document Status:** READY FOR REVIEW  
**Next Steps:**
1. Review workplan with engineering team
2. Adjust estimates based on team feedback
3. Obtain stakeholder approval
4. Begin Sprint 1 on December 19, 2025

