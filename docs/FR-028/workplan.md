# Work Plan: Task Completion Admin Approval System (FR-028)

**Feature ID:** FR-028  
**Design Reference:** `/docs/FR-028/design.md`  
**PRD Reference:** `/docs/prds/FR-028-admin-approval-tasks.md`  
**Created:** December 23, 2025  
**Development Approach:** Client-First (UI → Backend → Integration)

---

## Vision & Metrics

### Vision Statement
**For** group administrators **who** need quality control over critical task completions,  
**the** Admin Approval System **is a** task workflow enhancement **that** enables explicit verification before tasks are marked complete, ensuring accountability and quality gates for high-value deliverables.

### Success Metrics

**User Metrics:**
- 15-20% of tasks created use approval requirement (indicates adoption for critical tasks)
- <2% error rate on invalid status transitions (clear UI guidance working)
- 95%+ user comprehension of approval indicator meaning (via tooltip engagement)

**Business Metrics:**
- Zero disruption to existing task workflows (backward compatibility validated)
- Admin approval turnaround time <24 hours average (measure admin responsiveness)
- 10% increase in task completion confidence (admin satisfaction survey)

**Technical Metrics:**
- API response time <200ms (no performance degradation)
- 80%+ test coverage for approval logic (quality assurance)
- Zero breaking changes to existing API contracts (backward compatibility)

---

## Timeline: 4 Epics, 19 Stories, 3 Sprints (6 weeks)

**Sprint 1 (Weeks 1-2):** Client-side foundation + TypeScript types  
**Sprint 2 (Weeks 3-4):** Backend implementation + API integration  
**Sprint 3 (Weeks 5-6):** Polish, testing, and release preparation

---

## Epic 1: Client-Side Data Models & Types

**Description:** Extend TypeScript interfaces and types to support approval flag and new status  
**Business Value:** Foundation for all UI work; enables mock approval workflow during development  
**Success Criteria:**  
- All task-related TypeScript interfaces include `requiresApproval` field
- `WaitingForApproval` status added to TaskStatus type
- No TypeScript compilation errors
- Types are backward compatible (optional fields)

**Estimated Effort:** 0.5 sprints (3-4 days)  
**Priority:** Critical (Blocks all other client work)

---

### Story US-001: Extend TaskResponse Interface

**As a** frontend developer  
**I want to** add `requiresApproval` field to TaskResponse interface  
**So that** task components can display approval indicators

**Acceptance Criteria:**
- [ ] `TaskResponse` interface includes `requiresApproval: boolean` field
- [ ] `TaskWithGroup` interface inherits approval field
- [ ] `TaskWithAssignee` interface inherits approval field
- [ ] TypeScript compilation succeeds with no errors
- [ ] Existing task data displays without errors (backward compatible)

**Technical Notes:**
- File: `web/src/features/tasks/api/tasksApi.ts`
- Add field to base `TaskResponse` interface
- All derived interfaces automatically include field
- Default handling for undefined values (treat as false)

**Dependencies:** None  
**Estimated Effort:** 0.5 days (with AI: interface updates, type checking)  
**Priority:** Must Have

---

### Story US-002: Extend Request DTOs with Approval Field

**As a** frontend developer  
**I want to** add optional `requiresApproval` field to CreateTaskRequest and UpdateTaskRequest  
**So that** task creation/editing forms can submit approval preference

**Acceptance Criteria:**
- [ ] `CreateTaskRequest` includes `requiresApproval?: boolean` (optional)
- [ ] `UpdateTaskRequest` includes `requiresApproval?: boolean` (optional)
- [ ] Field defaults to `undefined` when not provided
- [ ] RTK Query mutations accept new field without errors
- [ ] Existing task creation works without providing field

**Technical Notes:**
- File: `web/src/features/tasks/api/tasksApi.ts`
- Use optional field (`?`) for backward compatibility
- Backend will default to `false` if not provided

**Dependencies:** None  
**Estimated Effort:** 0.25 days  
**Priority:** Must Have

---

### Story US-003: Add WaitingForApproval to TaskStatus Type

**As a** frontend developer  
**I want to** extend TaskStatus type with `WaitingForApproval` value  
**So that** UI components can handle approval-pending state

**Acceptance Criteria:**
- [ ] TaskStatus type includes `'WaitingForApproval'` literal
- [ ] All status-related queries accept new status value
- [ ] TypeScript compilation succeeds
- [ ] Status filters support new status type
- [ ] No breaking changes to existing status handling

**Technical Notes:**
- File: `web/src/features/tasks/api/tasksApi.ts`
- Add to union type: `TaskStatus = ... | 'WaitingForApproval'`
- Update `TaskListQuery.status` and `MyTasksQuery.status` types

**Dependencies:** None  
**Estimated Effort:** 0.25 days  
**Priority:** Must Have

---

### Story US-004: Update Translation Keys for Approval Status

**As a** user  
**I want to** see approval status in my language (English/Hebrew)  
**So that** I understand approval workflow

**Acceptance Criteria:**
- [ ] English translation: `tasks.status.waitingForApproval: "Waiting for Approval"`
- [ ] Hebrew translation: `tasks.status.waitingForApproval: "ממתין לאישור"`
- [ ] Translation appears in status dropdowns/badges
- [ ] RTL display correct for Hebrew
- [ ] No missing translation warnings

**Technical Notes:**
- Files: 
  - `web/public/locales/en/translation.json`
  - `web/public/locales/he/translation.json`
- Add under `tasks.status` namespace
- Test with `getStatusLabel()` helper

**Dependencies:** US-003  
**Estimated Effort:** 0.5 days (includes testing both languages)  
**Priority:** Must Have

---

## Epic 2: Client-Side UI Components

**Description:** Build approval checkbox, indicator, and conditional status selector  
**Business Value:** User-facing approval workflow; enables admin control and visual differentiation  
**Success Criteria:**
- Approval checkbox visible only to admins in create/edit modals
- Approval indicator (shield icon) shows on all task displays
- Status selector shows context-appropriate options (member vs admin)
- All components pass accessibility audit (ARIA labels, keyboard nav)

**Estimated Effort:** 1 sprint (8-10 days)  
**Priority:** Critical

---

### Story US-005: Create ApprovalIndicator Component

**As a** user  
**I want to** see a visual indicator on approval-required tasks  
**So that** I know which tasks need admin verification

**Acceptance Criteria:**
- [ ] `ApprovalIndicator` component created in shared components
- [ ] Shows shield icon (ShieldCheckIcon from Heroicons)
- [ ] Displays tooltip on hover: "Requires admin approval"
- [ ] Only renders when `requiresApproval={true}`
- [ ] Supports size prop: `'sm' | 'md' | 'lg'`
- [ ] Has ARIA label for screen readers
- [ ] Color: amber-600 (warning/attention color)
- [ ] Component unit tests pass

**Technical Notes:**
- File: `web/src/components/ApprovalIndicator.tsx` (new)
- Use Headless UI Tooltip for accessibility
- Import `ShieldCheckIcon` from `@heroicons/react/24/outline`
- Props: `{ requiresApproval: boolean; status: TaskStatus; size?: 'sm'|'md'|'lg' }`

**Dependencies:** US-001, US-004  
**Estimated Effort:** 1 day (component + tests + storybook)  
**Priority:** Must Have

---

### Story US-006: Add Approval Checkbox to CreateTaskModal

**As an** admin  
**I want to** mark a task as requiring approval during creation  
**So that** members must submit for review before completion

**Acceptance Criteria:**
- [ ] Checkbox appears below difficulty field, above due date
- [ ] Label: "Requires Admin Approval" with help icon
- [ ] Tooltip explains: "If enabled, only admins can mark this task as completed"
- [ ] Only visible when `myRole === 'Admin'`
- [ ] Non-admins never see checkbox (no disabled state)
- [ ] Default unchecked (requiresApproval: false)
- [ ] Form submission includes `requiresApproval` value
- [ ] Component tests verify admin-only visibility

**Technical Notes:**
- File: `web/src/features/dashboard/components/CreateTaskFromGroupModal.tsx`
- Add state: `const [requiresApproval, setRequiresApproval] = useState(false)`
- Conditional render: `{isAdmin && <div>...</div>}`
- Include in mutation payload: `{ ...taskData, requiresApproval }`

**Dependencies:** US-002, US-005  
**Estimated Effort:** 1.5 days (modal update + tests)  
**Priority:** Must Have

---

### Story US-007: Add Approval Checkbox to EditTaskModal

**As an** admin  
**I want to** toggle approval requirement on existing tasks  
**So that** I can change approval policy as needs evolve

**Acceptance Criteria:**
- [ ] Checkbox pre-populated with task's current `requiresApproval` value
- [ ] Same styling and position as CreateTaskModal
- [ ] Only visible to admins
- [ ] Saves changed value on form submission
- [ ] History logs approval requirement change
- [ ] Component tests verify toggle functionality

**Technical Notes:**
- File: Component that renders edit task form (likely in GroupTasksPanel edit modal)
- Initialize state from task: `const [requiresApproval, setRequiresApproval] = useState(task.requiresApproval)`
- Use `useUpdateTaskMutation` with approval field

**Dependencies:** US-006 (reuse same UI pattern)  
**Estimated Effort:** 1 day (similar to create modal)  
**Priority:** Should Have

---

### Story US-008: Implement Conditional Status Selector Logic

**As a** group member  
**I want to** see only valid status options for my role  
**So that** I don't attempt unauthorized status changes

**As an** admin  
**I want to** see all status options including completion  
**So that** I can approve tasks

**Acceptance Criteria:**
- [ ] **Approval-required task + Member role:**
  - Shows: Pending, InProgress, WaitingForApproval
  - Hides: Completed
- [ ] **Approval-required task + Admin role:**
  - Shows: Pending, InProgress, WaitingForApproval, Completed
- [ ] **Standard task (requiresApproval=false):**
  - Existing behavior: assignee/admin can complete
- [ ] Status options compute dynamically based on `task.requiresApproval` and `myRole`
- [ ] Unit tests cover all role/approval combinations

**Technical Notes:**
- Files: 
  - `web/src/features/groups/components/GroupTasksPanel.tsx` (status dropdown)
  - `web/src/features/dashboard/components/MyTasksTab.tsx` (status selector)
- Use `useMemo` to compute available statuses:
  ```typescript
  const availableStatuses = useMemo(() => {
    if (task.requiresApproval) {
      return isAdmin 
        ? ['Pending', 'InProgress', 'WaitingForApproval', 'Completed']
        : ['Pending', 'InProgress', 'WaitingForApproval'];
    }
    return isAdmin || isAssignee 
      ? ['Pending', 'InProgress', 'Completed'] 
      : ['Pending', 'InProgress'];
  }, [task.requiresApproval, isAdmin, isAssignee]);
  ```

**Dependencies:** US-003, US-005  
**Estimated Effort:** 2 days (logic + tests for both components)  
**Priority:** Must Have

---

### Story US-009: Add Approval Indicator to GroupTasksPanel

**As an** admin viewing group tasks  
**I want to** see approval indicators on tasks  
**So that** I can quickly identify tasks needing verification

**Acceptance Criteria:**
- [ ] `<ApprovalIndicator />` component inserted next to task name in task list
- [ ] Indicator shows for all tasks with `requiresApproval={true}`
- [ ] Tooltip accessible on hover/focus
- [ ] Size: small (`size="sm"`) to fit in task card
- [ ] No layout shift when indicator appears/disappears
- [ ] Regression test: existing tasks without approval render correctly

**Technical Notes:**
- File: `web/src/features/groups/components/GroupTasksPanel.tsx`
- Add in task card JSX: `<ApprovalIndicator requiresApproval={task.requiresApproval} status={task.status} size="sm" />`
- Position: inline with task name, before difficulty badge

**Dependencies:** US-005, US-008  
**Estimated Effort:** 0.5 days (integration + visual QA)  
**Priority:** Must Have

---

### Story US-010: Add Approval Indicator to MyTasksTab

**As a** member viewing my tasks  
**I want to** see approval indicators on my assigned tasks  
**So that** I know which tasks require admin review

**Acceptance Criteria:**
- [ ] Approval indicator shows on TaskCard component
- [ ] Same visual treatment as GroupTasksPanel
- [ ] Help text explains approval process for members
- [ ] Indicator appears in all task list views (filters, search results)
- [ ] Regression test: existing task cards render correctly

**Technical Notes:**
- File: `web/src/features/dashboard/components/MyTasksTab.tsx`
- Also update `TaskCard.tsx` if approval indicator should be in shared card component
- Consistent positioning with GroupTasksPanel

**Dependencies:** US-009 (same pattern)  
**Estimated Effort:** 0.5 days  
**Priority:** Must Have

---

### Story US-011: Add WaitingForApproval Filter to GroupTasksPanel

**As an** admin  
**I want to** filter tasks by "Waiting for Approval" status  
**So that** I can quickly review pending approvals

**Acceptance Criteria:**
- [ ] Status filter dropdown includes "Waiting for Approval" option
- [ ] Selecting filter shows only tasks with `status === 'WaitingForApproval'`
- [ ] Filter count badge shows number of approval-pending tasks
- [ ] Filter state persists in URL query params
- [ ] "All Statuses" option shows tasks with all statuses including WaitingForApproval

**Technical Notes:**
- File: `web/src/features/groups/components/GroupTasksPanel.tsx`
- Add to existing status filter: `<option value="WaitingForApproval">{t('tasks.status.waitingForApproval')}</option>`
- RTK Query automatically handles new status value in `status` query param

**Dependencies:** US-003, US-008  
**Estimated Effort:** 0.5 days  
**Priority:** Should Have

---

### Story US-012: Add Approval Translation Keys

**As a** user  
**I want to** see all approval UI elements in my language  
**So that** I understand the approval workflow

**Acceptance Criteria:**
- [ ] **English translations added:**
  - `tasks.requiresApproval: "Requires Admin Approval"`
  - `tasks.requiresApprovalHint: "This task must be approved by an admin before completion"`
  - `createTask.requiresApprovalLabel: "Requires Admin Approval"`
  - `createTask.requiresApprovalHelp: "If enabled, only admins can mark this task as completed"`
  - `groupTasksPanel.approvalIndicator: "Approval Required"`
  - `groupTasksPanel.filters.waitingForApproval: "Waiting for Approval"`
- [ ] **Hebrew translations added** (RTL-compatible)
- [ ] All translation keys used in components
- [ ] No missing translation warnings in console
- [ ] RTL display tested and correct

**Technical Notes:**
- Files: 
  - `web/public/locales/en/translation.json`
  - `web/public/locales/he/translation.json`
- Hebrew translations (from design doc):
  - `tasks.requiresApproval: "דורש אישור מנהל"`
  - `tasks.requiresApprovalHint: "משימה זו חייבת לקבל אישור מנהל לפני השלמה"`
  - etc.

**Dependencies:** US-004  
**Estimated Effort:** 0.5 days (translations + RTL testing)  
**Priority:** Must Have

---

## Epic 3: Backend Implementation

**Description:** Extend domain model, add database field, implement approval validation logic  
**Business Value:** Server-side enforcement of approval rules; data persistence  
**Success Criteria:**
- Database migration adds `requiresApproval` field (default: false)
- TaskStatus enum includes `WaitingForApproval`
- Service layer enforces approval-only-admin-can-complete rule
- API endpoints accept and return approval field
- All backend unit tests pass

**Estimated Effort:** 1 sprint (8-10 days)  
**Priority:** Critical

---

### Story US-013: Add RequiresApproval Field to TaskItem Domain Model

**As a** backend developer  
**I want to** add `RequiresApproval` boolean property to TaskItem  
**So that** approval requirement persists in database

**Acceptance Criteria:**
- [ ] `TaskItem.cs` includes `public bool RequiresApproval { get; set; } = false;`
- [ ] Property has default value `false` for backward compatibility
- [ ] No BsonAttribute needed (standard boolean serialization)
- [ ] Entity compiles without errors
- [ ] Existing tasks load correctly (undefined field treated as false)

**Technical Notes:**
- File: `backend/src/TasksTracker.Api/Core/Domain/Task.cs`
- Add after `CreatedByUserId` property
- MongoDB driver automatically handles boolean fields

**Dependencies:** None  
**Estimated Effort:** 0.25 days  
**Priority:** Must Have

---

### Story US-014: Extend TaskStatus Enum with WaitingForApproval

**As a** backend developer  
**I want to** add `WaitingForApproval` value to TaskStatus enum  
**So that** tasks can be in approval-pending state

**Acceptance Criteria:**
- [ ] `TaskStatus` enum includes `WaitingForApproval = 2` (explicit value for serialization safety)
- [ ] Enum order: Pending, InProgress, WaitingForApproval, Completed, Overdue
- [ ] No breaking changes to existing status values
- [ ] MongoDB serialization/deserialization works correctly
- [ ] Enum compiles and all existing usages still work

**Technical Notes:**
- File: `backend/src/TasksTracker.Api/Core/Domain/Task.cs`
- Insert `WaitingForApproval` after `InProgress` before `Completed`
- Use explicit int values:
  ```csharp
  public enum TaskStatus
  {
      Pending = 0,
      InProgress = 1,
      WaitingForApproval = 2,  // NEW
      Completed = 3,
      Overdue = 4
  }
  ```

**Dependencies:** None  
**Estimated Effort:** 0.25 days  
**Priority:** Must Have

---

### Story US-015: Run Database Migration for RequiresApproval Field

**As a** DevOps engineer  
**I want to** run a MongoDB migration script  
**So that** all existing tasks have `requiresApproval: false`

**Acceptance Criteria:**
- [ ] Migration script adds `requiresApproval: false` to all tasks missing field
- [ ] Script is idempotent (can run multiple times safely)
- [ ] Execution time logged and acceptable (<5 seconds for 10k tasks)
- [ ] No data loss or corruption
- [ ] Rollback plan documented

**Technical Notes:**
- Create script: `backend/scripts/migrations/add-requires-approval-field.js`
- MongoDB command:
  ```javascript
  db.tasks.updateMany(
    { requiresApproval: { $exists: false } },
    { $set: { requiresApproval: false } }
  );
  ```
- Test on staging database first
- Document in `backend/scripts/README.md`

**Dependencies:** US-013  
**Estimated Effort:** 0.5 days (script + testing + docs)  
**Priority:** Must Have

---

### Story US-016: Update DTOs with RequiresApproval Field

**As a** backend developer  
**I want to** add `RequiresApproval` to request and response DTOs  
**So that** API contracts include approval field

**Acceptance Criteria:**
- [ ] `CreateTaskRequest` includes `public bool RequiresApproval { get; set; } = false;`
- [ ] `UpdateTaskRequest` includes `public bool? RequiresApproval { get; set; }` (nullable)
- [ ] `TaskResponse` includes `public bool RequiresApproval { get; set; }`
- [ ] DTOs compile without errors
- [ ] Swagger documentation includes new fields
- [ ] API contracts remain backward compatible

**Technical Notes:**
- Files:
  - `backend/src/TasksTracker.Api/Features/Tasks/Models/CreateTaskRequest.cs`
  - `backend/src/TasksTracker.Api/Features/Tasks/Models/UpdateTaskRequest.cs`
  - `backend/src/TasksTracker.Api/Features/Tasks/Models/TaskResponse.cs`
- CreateTask defaults to `false`
- UpdateTask is nullable (only update if provided)

**Dependencies:** US-013  
**Estimated Effort:** 0.5 days  
**Priority:** Must Have

---

### Story US-017: Implement Approval Validation in TaskService

**As a** backend developer  
**I want to** enforce approval-only-admin-can-complete rule  
**So that** members cannot bypass approval workflow

**Acceptance Criteria:**
- [ ] `UpdateTaskStatusAsync` validates:
  - If `task.RequiresApproval == true` AND `newStatus == Completed`
  - Then require `requestingMember.Role == GroupRole.Admin`
  - Else throw `UnauthorizedAccessException` with message: "Only group admins can mark approval-required tasks as completed"
- [ ] Existing status validation logic preserved (assignee/admin can update non-approval tasks)
- [ ] History logs `CompletionApproved` when admin completes approval-required task
- [ ] History logs `StatusChanged` for other status transitions
- [ ] Unit tests cover all approval scenarios

**Technical Notes:**
- File: `backend/src/TasksTracker.Api/Features/Tasks/Services/TaskService.cs`
- Add validation in `UpdateTaskStatusAsync` method before status update:
  ```csharp
  if (task.RequiresApproval && newStatus == TaskStatus.Completed)
  {
      if (requestingMember.Role != GroupRole.Admin)
      {
          throw new UnauthorizedAccessException(
              "Only group admins can mark approval-required tasks as completed");
      }
  }
  ```

**Dependencies:** US-013, US-014, US-016  
**Estimated Effort:** 1.5 days (implementation + unit tests)  
**Priority:** Must Have

---

### Story US-018: Add Approval Requirement Validation to CreateTask

**As a** backend developer  
**I want to** validate only admins can set `requiresApproval=true`  
**So that** members cannot create approval-required tasks

**Acceptance Criteria:**
- [ ] `CreateAsync` validates group admin role before accepting `requiresApproval=true`
- [ ] If `request.RequiresApproval == true` and user is not admin:
  - Return 403 Forbidden
  - Message: "Only group admins can create approval-required tasks"
- [ ] Members can create tasks with `requiresApproval=false` (default)
- [ ] Task creation history logs approval requirement if true
- [ ] Unit tests cover admin vs member scenarios

**Technical Notes:**
- File: `backend/src/TasksTracker.Api/Features/Tasks/Services/TaskService.cs`
- Add validation in `CreateAsync` after group admin check:
  ```csharp
  if (request.RequiresApproval && currentMember.Role != GroupRole.Admin)
  {
      throw new UnauthorizedAccessException(
          "Only group admins can create approval-required tasks");
  }
  ```

**Dependencies:** US-016, US-017  
**Estimated Effort:** 1 day  
**Priority:** Must Have

---

### Story US-019: Add Approval Requirement Change Logging to UpdateTask

**As an** admin  
**I want to** see history when approval requirement changes  
**So that** I can audit approval policy modifications

**Acceptance Criteria:**
- [ ] `UpdateTaskAsync` detects when `RequiresApproval` value changes
- [ ] Logs `TaskHistoryAction.Updated` with changes:
  - `["OldRequiresApproval"] = task.RequiresApproval.ToString()`
  - `["NewRequiresApproval"] = request.RequiresApproval.ToString()`
- [ ] Only logs if value actually changes (not every update)
- [ ] Existing update history logic preserved
- [ ] History visible in task history modal

**Technical Notes:**
- File: `backend/src/TasksTracker.Api/Features/Tasks/Services/TaskService.cs`
- In `UpdateTaskAsync`, add to changes dictionary if modified:
  ```csharp
  if (request.RequiresApproval.HasValue && 
      request.RequiresApproval != task.RequiresApproval)
  {
      changes["OldRequiresApproval"] = task.RequiresApproval.ToString();
      changes["NewRequiresApproval"] = request.RequiresApproval.Value.ToString();
      task.RequiresApproval = request.RequiresApproval.Value;
  }
  ```

**Dependencies:** US-017  
**Estimated Effort:** 0.5 days  
**Priority:** Should Have

---

## Epic 4: Integration, Testing & Documentation

**Description:** End-to-end testing, regression tests, performance validation, documentation  
**Business Value:** Quality assurance, prevents regressions, enables future maintenance  
**Success Criteria:**
- 80%+ code coverage on approval logic
- All regression tests pass (existing functionality unaffected)
- Performance benchmarks met (<200ms API response)
- Documentation complete (API docs, user guide, progress log)

**Estimated Effort:** 0.5 sprints (4-5 days)  
**Priority:** High

---

### Story US-020: Write Backend Unit Tests for Approval Validation

**As a** QA engineer  
**I want to** comprehensive unit tests for approval logic  
**So that** approval rules are enforced correctly

**Acceptance Criteria:**
- [ ] Test: Admin can create approval-required task ✅
- [ ] Test: Member cannot create approval-required task → 403 ❌
- [ ] Test: Admin can complete approval-required task ✅
- [ ] Test: Member cannot complete approval-required task → 403 ❌
- [ ] Test: Member can submit task for approval (WaitingForApproval) ✅
- [ ] Test: Approval requirement change logs history ✅
- [ ] Test: Completion of approval task logs CompletionApproved ✅
- [ ] Test: Standard tasks (requiresApproval=false) work as before ✅
- [ ] All tests pass, 80%+ coverage on TaskService approval paths

**Technical Notes:**
- File: `backend/tests/TasksTracker.Api.Tests/Tasks/TaskServiceTests.cs`
- Use xUnit + Moq for mocking repositories
- Test class: `ApprovalWorkflowTests`

**Dependencies:** US-017, US-018, US-019  
**Estimated Effort:** 2 days (8 test cases + setup)  
**Priority:** Must Have

---

### Story US-021: Write Frontend Component Tests for Approval UI

**As a** frontend developer  
**I want to** test approval UI components  
**So that** conditional rendering and accessibility work correctly

**Acceptance Criteria:**
- [ ] Test: Approval checkbox only visible to admins (CreateTaskModal) ✅
- [ ] Test: Approval indicator renders when requiresApproval=true ✅
- [ ] Test: Approval indicator has ARIA label ✅
- [ ] Test: Member status selector hides Completed for approval tasks ✅
- [ ] Test: Admin status selector shows all statuses ✅
- [ ] Test: WaitingForApproval filter works in GroupTasksPanel ✅
- [ ] All tests pass with Vitest + React Testing Library

**Technical Notes:**
- Files:
  - `web/src/components/__tests__/ApprovalIndicator.test.tsx`
  - `web/src/features/dashboard/components/__tests__/CreateTaskFromGroupModal.test.tsx`
  - `web/src/features/groups/components/__tests__/GroupTasksPanel.test.tsx`
- Use `@testing-library/react` for rendering
- Mock `myRole` prop to test admin vs member views

**Dependencies:** US-005, US-006, US-008, US-009  
**Estimated Effort:** 2 days (6 test suites)  
**Priority:** Must Have

---

### Story US-022: Run Regression Tests on Existing Task Workflows

**As a** QA engineer  
**I want to** verify existing task functionality unaffected  
**So that** we maintain backward compatibility

**Acceptance Criteria:**
- [ ] Existing tasks without `requiresApproval` field load and display correctly
- [ ] Task creation without approval checkbox works as before
- [ ] Task status updates work for standard tasks (no approval)
- [ ] Task editing preserves all existing fields
- [ ] GroupTasksPanel shows tasks correctly
- [ ] MyTasksTab displays user tasks correctly
- [ ] No performance degradation (API response times within 10% of baseline)
- [ ] No console errors or warnings

**Technical Notes:**
- Test plan:
  1. Create task without approval → assign → complete (member flow)
  2. Edit existing task → verify no approval field added
  3. Filter tasks by Pending/InProgress/Completed → verify results
  4. Load 100 tasks → check render time
- Run on staging with existing task data

**Dependencies:** All US-001 to US-019  
**Estimated Effort:** 1 day (manual + automated regression suite)  
**Priority:** Must Have

---

### Story US-023: Update API Documentation with Approval Fields

**As a** API consumer  
**I want to** see approval fields documented in API reference  
**So that** I understand new request/response structures

**Acceptance Criteria:**
- [ ] Swagger/OpenAPI docs include `requiresApproval` field on:
  - POST /api/tasks (CreateTaskRequest)
  - PUT /api/tasks/{id} (UpdateTaskRequest)
  - GET /api/tasks (TaskResponse)
- [ ] Field descriptions explain approval workflow
- [ ] Examples show approval-required and standard tasks
- [ ] Swagger UI renders correctly

**Technical Notes:**
- Add XML comments to DTOs:
  ```csharp
  /// <summary>
  /// Indicates if admin approval is required before task completion.
  /// Only group admins can set this to true. Defaults to false.
  /// </summary>
  public bool RequiresApproval { get; set; } = false;
  ```
- Swagger reads XML comments automatically

**Dependencies:** US-016  
**Estimated Effort:** 0.5 days  
**Priority:** Should Have

---

### Story US-024: Update User Guide with Approval Workflow

**As a** user  
**I want to** learn how to use approval feature  
**So that** I can create and manage approval-required tasks

**Acceptance Criteria:**
- [ ] Documentation includes:
  - How to create approval-required task (admin)
  - How to submit task for approval (member)
  - How to approve task completion (admin)
  - How to filter approval-pending tasks
  - Screenshot of approval indicator
- [ ] Available in English and Hebrew
- [ ] Accessible from in-app help menu

**Technical Notes:**
- File: Create `docs/user-guide/approval-workflow.md`
- Include screenshots from staging environment
- Link from main user guide

**Dependencies:** All implementation complete  
**Estimated Effort:** 1 day (writing + screenshots + translation)  
**Priority:** Should Have

---

## Sprint Plan

### Sprint 1: Client-Side Foundation (Weeks 1-2)

**Sprint Goal:** Complete all TypeScript types and UI components for approval workflow

**Stories:**
- [ ] US-001: Extend TaskResponse Interface (0.5d)
- [ ] US-002: Extend Request DTOs (0.25d)
- [ ] US-003: Add WaitingForApproval Status (0.25d)
- [ ] US-004: Translation Keys for Status (0.5d)
- [ ] US-005: Create ApprovalIndicator Component (1d)
- [ ] US-006: Approval Checkbox in CreateTaskModal (1.5d)
- [ ] US-007: Approval Checkbox in EditTaskModal (1d)
- [ ] US-008: Conditional Status Selector Logic (2d)
- [ ] US-009: Approval Indicator in GroupTasksPanel (0.5d)
- [ ] US-010: Approval Indicator in MyTasksTab (0.5d)
- [ ] US-011: WaitingForApproval Filter (0.5d)
- [ ] US-012: Approval Translation Keys (0.5d)

**Capacity:** 10 days | **Committed:** 9.5 days  
**Buffer:** 5% (quick wins, low risk)

**Demo:** Functional approval UI with mock data; admin can create approval tasks, member sees conditional status options

---

### Sprint 2: Backend & Integration (Weeks 3-4)

**Sprint Goal:** Complete backend implementation, integrate with frontend, validate end-to-end workflow

**Stories:**
- [ ] US-013: Add RequiresApproval to Domain Model (0.25d)
- [ ] US-014: Extend TaskStatus Enum (0.25d)
- [ ] US-015: Database Migration Script (0.5d)
- [ ] US-016: Update DTOs (0.5d)
- [ ] US-017: Approval Validation in TaskService (1.5d)
- [ ] US-018: CreateTask Admin Validation (1d)
- [ ] US-019: UpdateTask History Logging (0.5d)
- [ ] US-020: Backend Unit Tests (2d)
- [ ] **Integration:** Wire frontend RTK Query to backend API (1d)
- [ ] **Integration:** End-to-end approval workflow testing (1d)

**Capacity:** 10 days | **Committed:** 8.5 days  
**Buffer:** 15% (backend complexity, integration risk)

**Demo:** Full approval workflow: admin creates approval task → member submits → admin approves → history logged

---

### Sprint 3: Testing, Polish & Release (Weeks 5-6)

**Sprint Goal:** Complete testing, documentation, and release preparation

**Stories:**
- [ ] US-021: Frontend Component Tests (2d)
- [ ] US-022: Regression Tests (1d)
- [ ] US-023: API Documentation (0.5d)
- [ ] US-024: User Guide (1d)
- [ ] **Polish:** Accessibility audit + fixes (1d)
- [ ] **Polish:** Cross-browser testing (0.5d)
- [ ] **Polish:** Performance benchmarking (0.5d)
- [ ] **Release:** Code review (0.5d)
- [ ] **Release:** Staging deployment + smoke tests (0.5d)
- [ ] **Release:** Production deployment (0.5d)

**Capacity:** 10 days | **Committed:** 8 days  
**Buffer:** 20% (QA, bug fixes, release prep)

**Demo:** Feature complete, tested, documented, ready for production release

---

## Dependencies & Risks

### Technical Dependencies
- ✅ MongoDB 4.4+ supports boolean fields
- ✅ .NET enum extension is non-breaking
- ✅ React Heroicons has ShieldCheckIcon
- ✅ Existing TaskHistory infrastructure

### External Dependencies
- None (fully internal feature)

### Dependency Chain
```
Sprint 1 (Client Types) → Sprint 2 (Backend + Integration) → Sprint 3 (Testing + Release)
```

**Critical Path:** US-001→US-005→US-008→US-013→US-017→US-020→US-022

### Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Enum serialization breaks existing tasks | High | Low | Use explicit int values; test deserialization |
| Performance degradation on task queries | Medium | Low | Monitor query times; add index if >100ms |
| User confusion on approval workflow | Medium | Medium | Clear tooltips, help text, user guide |
| Admin bottleneck on approvals | High | Medium | Make approval opt-in (not default); add filter for quick triage |
| Scope creep (rejection workflow) | Medium | High | Document non-goals; defer to Phase 2 |

---

## Release Phases

### Phase 1 (MVP): Sprints 1-3 (6 weeks)
**Deliverables:**
- Approval checkbox in task creation/editing (admin only)
- Approval indicator on all task displays
- Conditional status selector (member vs admin)
- WaitingForApproval status support
- Backend validation and history logging
- Full test coverage and documentation

**Success Criteria:**
- All 24 user stories complete
- 80%+ test coverage
- Zero critical bugs
- API response time <200ms

### Phase 2 (Enhancements): Future
**Potential Features (not in scope):**
- Approval rejection with feedback
- Approval notifications (email/push)
- Approval analytics dashboard
- Multi-level approval chains
- Approval delegation
- Approval SLA/deadlines

---

## Validation Checklist

- [x] Stories follow INVEST principles
- [x] Estimates include AI assistance (2-5x productivity multiplier)
- [x] 20% buffer in sprint capacity
- [x] Dependencies documented and sequenced correctly
- [x] Each sprint delivers shippable value
- [x] All stories have testable acceptance criteria
- [x] Regression testing explicitly planned
- [x] Client-first approach maintained (Sprint 1 = UI, Sprint 2 = Backend)
- [x] Backward compatibility validated in testing phase

---

**Work Plan Status:** Ready for Implementation  
**Next Steps:**
1. Team review and approval
2. Create GitHub issues/Jira tickets from user stories
3. Begin Sprint 1 (Client-Side Foundation)
4. Daily standups to track progress
