# Work Plan: FR-025 Group Members & Tasks from Group Card

**Version:** 1.0  
**Date:** December 17, 2025  
**Design Reference:** [design.md](design.md)  
**PRD Reference:** [docs/prds/FR-025-group-members-and-tasks.md](../prds/FR-025-group-members-and-tasks.md)

---

## Vision & Metrics

**Vision:**
For group admins and members who need efficient group management and task triage, FR-025 is a contextual UI enhancement that reduces navigation friction by 50% and clarifies invite lifecycle with Pending/Joined/Declined states visible in one place.

**Success Metrics:**
- **User:** 80% of active groups use Members/Tasks modals within 2 weeks of launch
- **Business:** 50% reduction in navigation clicks for task assignment and member management
- **Technical:** P95 latency <150ms for list queries; <300ms for assign/unassign; <1% error rate for invite send

---

## Timeline: 3 Epics, 15 Stories, 3 Sprints (6 weeks)

**Estimated Total Effort:** 18.5 days with AI co-development

**Release Phases:**
- **Phase 1 (MVP):** Sprint 1-2 (Frontend + Backend Core) - Weeks 1-4
- **Phase 2 (Enhancement):** Sprint 3 (Polish + Testing) - Weeks 5-6

---

## Epic E1: Frontend - Members Modal & Invites Management

**Description:** Build Members modal with tabs (Members | Invites), admin actions (add/remove/resend/cancel), and state management with RTK Query.

**Business Value:** Centralizes member management; eliminates navigation friction; provides invite status transparency.

**Success Criteria:**
- Members modal opens from group card
- Admin can invite via email; pending invite appears in Invites tab
- Admin can remove member (with last-admin protection warning)
- Admin can resend/cancel pending invites
- Members see view-only lists

**Estimated Effort:** 1.5 sprints (7 days)

**Priority:** Critical

---

### Story US-FR025-001: Create MembersModal Component Structure

**As a** group admin **I want to** open a Members modal from the group card **So that** I can manage members and invites in one place

**Acceptance Criteria:**
- [ ] MembersModal component renders with tabs: Members | Invites
- [ ] Modal opens when clicking "Members" button on group card
- [ ] Modal has close button and ESC key handler
- [ ] Focus trap implemented for accessibility
- [ ] Modal uses Headless UI Dialog with Transition
- [ ] Returns focus to trigger button on close

**Technical Notes:**
- Location: `web/src/features/groups/components/MembersModal.tsx`
- Props: `{ groupId: string, isOpen: boolean, onClose: () => void }`
- Use Headless UI Tab component for tabbed interface
- Add Members/Tasks buttons to GroupCard if not present

**Dependencies:** None

**Estimated Effort:** 1 day (Component: 0.5d, Integration: 0.25d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-002: Build Members Tab List

**As a** group member **I want to** see all group members with their roles **So that** I know who is in my group

**Acceptance Criteria:**
- [ ] Members tab displays list of all members
- [ ] Each member row shows: Avatar/Initials (32px), First Last name, Role badge (Admin/Member), JoinedAt (relative time)
- [ ] Admin role badge styled distinctly (e.g., gold/blue)
- [ ] Loading state shows skeleton rows with shimmer
- [ ] Empty state: "No members yet. Invite someone to get started!"
- [ ] List sorted by role (Admins first) then joinedAt

**Technical Notes:**
- Component: `MembersTab.tsx`
- Use RTK Query: `useGetGroupMembersQuery(groupId)`
- Reuse Avatar/InitialsAvatar components from design system
- Use date-fns or Intl.RelativeTimeFormat for relative dates

**Dependencies:** US-FR025-001

**Estimated Effort:** 1.5 days (UI: 0.75d, Query integration: 0.5d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-003: Add RTK Query Endpoints for Members

**As a** developer **I want** RTK Query endpoints for group members **So that** the UI can fetch and cache member data

**Acceptance Criteria:**
- [ ] `getGroupMembers` query endpoint added to groupApi
- [ ] Endpoint: `GET /api/groups/{groupId}/members`
- [ ] Returns: `MemberDto[]` with userId, firstName, lastName, role, joinedAt
- [ ] Provides cache tag: `['GroupMembers', groupId]`
- [ ] Query auto-refetches on member add/remove

**Technical Notes:**
- File: `web/src/features/groups/groupApi.ts`
- TypeScript types: `MemberDto` interface in `types/group.ts`
- Cache invalidation on `removeMember` and invite accept

**Dependencies:** None (parallel with US-FR025-002)

**Estimated Effort:** 0.5 day

**Priority:** Must Have

---

### Story US-FR025-004: Build Invites Tab with Status Display

**As a** group admin **I want to** see all pending, joined, and declined invites **So that** I can track who I've invited

**Acceptance Criteria:**
- [ ] Invites tab displays list of invites filtered by status (Pending/Joined/Declined)
- [ ] Each invite row shows: Email, Status chip (Pending=yellow, Joined=green, Declined=gray), InvitedBy name, InvitedAt (relative)
- [ ] Status chip styled with Tailwind colors
- [ ] Admin sees Resend/Cancel buttons for Pending invites only
- [ ] Non-admin members see empty state or "Access restricted"
- [ ] Loading state shows skeleton rows

**Technical Notes:**
- Component: `InvitesTab.tsx`
- Use RTK Query: `useGetGroupInvitesQuery(groupId)`
- Status chip component: reusable `StatusPill.tsx`

**Dependencies:** US-FR025-001

**Estimated Effort:** 1.5 days (UI: 0.75d, Query integration: 0.5d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-005: Implement Add Member (Invite) Form

**As a** group admin **I want to** invite a member via email **So that** they can join my group

**Acceptance Criteria:**
- [ ] "Add Member" button visible to admins in Members tab
- [ ] Clicking opens InviteForm (inline or dialog)
- [ ] Form has email input with validation (RFC 5322 format)
- [ ] Submit button disabled while loading
- [ ] Success: toast "Invite sent to {email}"; form resets; Invites tab refreshes
- [ ] Error: shows toast with message (duplicate email, already a member, network error)
- [ ] Duplicate pending invite shows: "Pending invite already sent. Use Resend button."

**Technical Notes:**
- Component: `InviteForm.tsx` (can be embedded in InvitesTab)
- Use RTK Query: `useCreateInviteMutation()`
- Email validation regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Invalidates cache: `['GroupInvites', groupId]`

**Dependencies:** US-FR025-004

**Estimated Effort:** 1 day (Form: 0.5d, Validation: 0.25d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-006: Implement Remove Member Action

**As a** group admin **I want to** remove a member from the group **So that** I can manage membership

**Acceptance Criteria:**
- [ ] Remove icon (trash/X) visible next to each member (Admin only)
- [ ] Clicking shows confirmation dialog: "Remove {name} from {group}?"
- [ ] If removing last admin: shows error toast "Cannot remove the last admin. Promote another member first." and blocks action
- [ ] Success: member removed from list; toast "Member removed"; cache invalidated
- [ ] Error: shows toast with error message

**Technical Notes:**
- Use RTK Query: `useRemoveMemberMutation({ groupId, userId })`
- Confirm dialog: reuse ConfirmDialog component
- Server enforces last-admin protection; UI shows preemptive warning if detected

**Dependencies:** US-FR025-002

**Estimated Effort:** 1 day (UI: 0.5d, Logic: 0.25d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-007: Implement Resend/Cancel Invite Actions

**As a** group admin **I want to** resend or cancel a pending invite **So that** I can manage invite lifecycle

**Acceptance Criteria:**
- [ ] Resend button visible for Pending invites (Admin only)
- [ ] Clicking Resend: shows toast "Invite resent to {email}"; sendCount increments
- [ ] Cancel button visible for Pending invites (Admin only)
- [ ] Clicking Cancel: shows confirm dialog; on confirm sets status=Canceled; invite hidden from default view
- [ ] Success/error toasts for both actions
- [ ] Cache invalidated after mutations

**Technical Notes:**
- Use RTK Query: `useResendInviteMutation({ groupId, inviteId })`, `useCancelInviteMutation({ groupId, inviteId })`
- Mutations invalidate `['GroupInvites', groupId]`

**Dependencies:** US-FR025-004

**Estimated Effort:** 0.75 day (Actions: 0.5d, Tests: 0.25d)

**Priority:** Must Have

---

## Epic E2: Frontend - Group Tasks View & Filtering

**Description:** Build GroupTasksPanel (drawer/modal) with task list, filters (status, assignee), sorting, and inline assign/unassign.

**Business Value:** Accelerates task triage; reduces clicks for assignment; provides group-scoped task visibility.

**Success Criteria:**
- Tasks panel opens from group card
- Admin can filter by status/assignee and sort by created/updated
- Admin can assign/unassign tasks inline
- Filters persist per group in localStorage

**Estimated Effort:** 1 sprint (5 days)

**Priority:** Critical

---

### Story US-FR025-008: Create GroupTasksPanel Component

**As a** group member **I want to** open a Tasks view from the group card **So that** I can see all group tasks in one place

**Acceptance Criteria:**
- [ ] GroupTasksPanel component renders as drawer/modal
- [ ] Opens when clicking "Tasks" button on group card
- [ ] Header shows: "Tasks in {groupName}" and close button
- [ ] Panel has filters row: Status dropdown, Assignee dropdown
- [ ] Panel has sort row: "Sort by: Created (desc)" toggle
- [ ] Panel has task list area
- [ ] Close button and ESC key close the panel

**Technical Notes:**
- Location: `web/src/features/tasks/components/GroupTasksPanel.tsx` (or groups feature)
- Props: `{ groupId: string, isOpen: boolean, onClose: () => void }`
- Use Headless UI Dialog or Transition for drawer animation

**Dependencies:** None

**Estimated Effort:** 1 day (Component: 0.5d, Layout: 0.25d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-009: Build Task List with Assignee Display

**As a** group member **I want to** see all tasks in a group **So that** I can understand task distribution

**Acceptance Criteria:**
- [ ] Task list displays: Task Name, Assignee (avatar + name or "Unassigned"), Status chip (Pending/InProgress/Completed)
- [ ] Each row is clickable and opens TaskDetailsSidePanel (optional in v1; can defer)
- [ ] Loading state shows skeleton rows
- [ ] Empty state: "No tasks match your filters."
- [ ] List virtualized if >100 items (optional; defer if needed)

**Technical Notes:**
- Component: `GroupTaskRow.tsx`
- Use RTK Query: `useGetGroupTasksQuery({ groupId, status?, assigneeId?, sortBy?, order? })`
- Assignee avatar: reuse Avatar component; fallback initials if no photo

**Dependencies:** US-FR025-008

**Estimated Effort:** 1.5 days (UI: 0.75d, Query integration: 0.5d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-010: Implement Task Filters (Status & Assignee)

**As a** group admin **I want to** filter tasks by status and assignee **So that** I can focus on specific tasks

**Acceptance Criteria:**
- [ ] Status dropdown: All, Pending, InProgress, Completed (default: All)
- [ ] Assignee dropdown: All, {list of member names} (default: All)
- [ ] Selecting filter updates query params and refetches tasks
- [ ] Filter state persists in localStorage key: `groupTasks:${groupId}`
- [ ] On modal open: reads persisted filters from localStorage
- [ ] On filter change: writes to localStorage and triggers query

**Technical Notes:**
- Use RTK Query with query params: `useGetGroupTasksQuery({ groupId, status, assigneeId })`
- localStorage: `JSON.parse(localStorage.getItem(key)) || { status: null, assigneeId: null }`
- Debounce filter changes by 300ms (optional optimization)

**Dependencies:** US-FR025-009

**Estimated Effort:** 1 day (Filters: 0.5d, Persistence: 0.25d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-011: Implement Task Sorting (Created/Updated)

**As a** group member **I want to** sort tasks by creation or update date **So that** I can prioritize recent or oldest tasks

**Acceptance Criteria:**
- [ ] Sort control: "Sort by: Created (desc)" toggle button or dropdown
- [ ] Options: Created (asc), Created (desc), Updated (asc), Updated (desc)
- [ ] Default: Created (desc)
- [ ] Selecting sort refetches tasks with new order
- [ ] Sort persists in localStorage with filters

**Technical Notes:**
- Query params: `sortBy=createdAt&order=desc`
- localStorage: store `{ sortBy, order }` alongside filters

**Dependencies:** US-FR025-010

**Estimated Effort:** 0.5 day

**Priority:** Should Have

---

### Story US-FR025-012: Implement Inline Task Assign/Unassign

**As a** group admin **I want to** assign or unassign tasks inline **So that** I can update assignments quickly

**Acceptance Criteria:**
- [ ] Each task row has Assign dropdown (Admin only)
- [ ] Dropdown shows: {list of member names} + "Unassign"
- [ ] Selecting member: calls assignTask mutation; row updates immediately (optimistic)
- [ ] Selecting "Unassign": calls unassignTask mutation; shows "Unassigned"
- [ ] Success: cache invalidated; toast "Task assigned to {name}"
- [ ] Error: rollback optimistic update; show error toast

**Technical Notes:**
- Use RTK Query: `useAssignTaskMutation({ taskId, userId })`, `useUnassignTaskMutation({ taskId })`
- Optimistic update: update local cache before server response
- Invalidates: `['GroupTasks', groupId]`, `['Task', taskId]`

**Dependencies:** US-FR025-009

**Estimated Effort:** 1.5 days (UI: 0.5d, Mutations: 0.5d, Optimistic: 0.25d, Tests: 0.25d)

**Priority:** Must Have

---

## Epic E3: Backend - Invites Collection & API Endpoints

**Description:** Create invites collection, InvitesRepository, InvitesService, and REST endpoints for invite lifecycle management.

**Business Value:** Enables email-based invites with Pending/Joined/Declined tracking; enforces last-admin protection; supports member management.

**Success Criteria:**
- invites collection created with indexes
- Admin can create invite via POST /api/groups/{id}/invites
- Admin can resend/cancel invites
- Last-admin protection enforced on member removal
- Tasks endpoint supports group-scoped filtering

**Estimated Effort:** 1.5 sprints (6.5 days)

**Priority:** Critical

---

### Story US-FR025-013: Create Invite Domain Model & Repository

**As a** backend developer **I want** Invite domain model and repository **So that** I can store and query invites

**Acceptance Criteria:**
- [ ] Invite.cs domain model created with properties: Id, GroupId, Email, Status (enum), Token, InvitedBy, InvitedAt, RespondedAt, LastSentAt, SendCount
- [ ] InviteStatus enum: Pending, Joined, Declined, Canceled, Expired
- [ ] IInvitesRepository interface with methods: CreateAsync, GetByIdAsync, GetByTokenAsync, GetByGroupIdAsync, GetPendingInviteAsync, UpdateAsync, DeleteAsync
- [ ] InvitesRepository implementation using MongoDB
- [ ] MongoDB indexes created: `{ groupId: 1, status: 1, invitedAt: -1 }`, `{ email: 1, groupId: 1 }` (unique partial for Pending), `{ token: 1 }`

**Technical Notes:**
- Files: `Core/Domain/Invite.cs`, `Core/Interfaces/IInvitesRepository.cs`, `Infrastructure/Data/InvitesRepository.cs`
- MongoDB collection: `invites`
- Partial unique index: `partialFilterExpression: { status: "Pending" }`

**Dependencies:** None

**Estimated Effort:** 1.5 days (Model: 0.25d, Repo: 0.75d, Indexes: 0.25d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-014: Build InvitesService with Create/Resend/Cancel

**As a** backend developer **I want** InvitesService to manage invite lifecycle **So that** business logic is centralized

**Acceptance Criteria:**
- [ ] InvitesService.CreateInviteAsync: validates email format, checks if already member or pending invite, generates token (GUID), creates invite, sends email, returns DTO
- [ ] InvitesService.ResendInviteAsync: validates user is admin, checks status=Pending, increments sendCount, updates lastSentAt, resends email
- [ ] InvitesService.CancelInviteAsync: validates admin, checks Pending, sets status=Canceled + respondedAt
- [ ] InvitesService.GetGroupInvitesAsync: returns invites for group (Admin: all; Member: empty or own only per policy)
- [ ] Email sending via existing InvitationService (logs URL in dev; integrates SendGrid in prod)

**Technical Notes:**
- File: `Features/Groups/Services/InvitesService.cs`, `IInvitesService.cs`
- Dependencies: IInvitesRepository, IGroupRepository, IUserRepository, IEmailService (stub), ILogger
- Email validation: regex + length check (max 254 chars)
- Token: `Guid.NewGuid().ToString()`

**Dependencies:** US-FR025-013

**Estimated Effort:** 2 days (Create: 0.75d, Resend/Cancel: 0.5d, GetInvites: 0.5d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-015: Add Invites Endpoints to GroupsController

**As a** frontend developer **I want** REST endpoints for invites **So that** the UI can manage invites

**Acceptance Criteria:**
- [ ] POST /api/groups/{groupId}/invites: creates invite; returns InviteDto; Admin-only
- [ ] GET /api/groups/{groupId}/invites: returns InviteDto[]; Admin-only
- [ ] POST /api/groups/{groupId}/invites/{inviteId}/resend: resends email; returns 200; Admin-only
- [ ] DELETE /api/groups/{groupId}/invites/{inviteId}: cancels invite; returns 204; Admin-only
- [ ] All endpoints validate user is group member and Admin role
- [ ] Error responses: 400 (validation), 403 (not admin), 404 (invite not found)

**Technical Notes:**
- File: `Features/Groups/Controllers/GroupsController.cs` (or new InvitesController)
- Use [Authorize] + custom role check or attribute
- Request/Response DTOs: CreateInviteRequest, InviteDto

**Dependencies:** US-FR025-014

**Estimated Effort:** 1 day (Endpoints: 0.5d, Validation: 0.25d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-016: Enhance RemoveMember with Last-Admin Protection

**As a** backend developer **I want** last-admin protection in RemoveMemberAsync **So that** groups always have at least one admin

**Acceptance Criteria:**
- [ ] GroupService.RemoveMemberAsync checks if removing user is last admin
- [ ] If last admin: throws InvalidOperationException with message "Cannot remove the last admin. Promote another member first."
- [ ] Controller catches exception and returns 400 Bad Request with error message
- [ ] Unit test verifies last-admin protection logic
- [ ] Integration test verifies endpoint returns 400 when removing last admin

**Technical Notes:**
- File: `Features/Groups/Services/GroupService.cs`
- Logic: `var admins = group.Members.Where(m => m.Role == GroupRole.Admin).ToList(); if (admins.Count == 1 && admins[0].UserId == userIdToRemove) { throw... }`

**Dependencies:** None (enhancement to existing endpoint)

**Estimated Effort:** 0.5 day (Logic: 0.25d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-017: Add GET /api/groups/{id}/members Endpoint

**As a** frontend developer **I want** an endpoint to fetch group members with details **So that** the Members tab can display member list

**Acceptance Criteria:**
- [ ] GET /api/groups/{groupId}/members: returns MemberDto[] with userId, firstName, lastName, role, joinedAt
- [ ] Members list hydrated with user details (batch query)
- [ ] Endpoint accessible to all group members (not Admin-only)
- [ ] Returns 403 if user not a group member
- [ ] Sorted by role (Admin first) then joinedAt

**Technical Notes:**
- File: `Features/Groups/Controllers/GroupsController.cs`
- Service method: `GetGroupMembersAsync(groupId, userId)` in GroupService
- Batch user hydration: `userRepository.GetByIdsAsync(userIds)`

**Dependencies:** None

**Estimated Effort:** 1 day (Endpoint: 0.5d, Hydration: 0.25d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-018: Extend TaskService with Group-Scoped Filtering

**As a** frontend developer **I want** task endpoint to support group-scoped filtering **So that** the Tasks panel can filter and sort tasks

**Acceptance Criteria:**
- [ ] GET /api/tasks?groupId={id}&status={status}&assigneeId={id}&sortBy={field}&order={asc|desc}&page={n}: returns TaskListResponse
- [ ] Filters: groupId (required), status (optional), assigneeId (optional)
- [ ] Sort: sortBy (createdAt|updatedAt), order (asc|desc); default: createdAt desc
- [ ] Pagination: page, pageSize (default 50)
- [ ] Response includes total count and hydrated assignee names
- [ ] Endpoint accessible to all group members

**Technical Notes:**
- File: `Features/Tasks/Services/TaskService.cs`, `Controllers/TasksController.cs`
- MongoDB filter builder with compound conditions
- Batch user hydration for assignee names
- Index required: `{ groupId: 1, status: 1, updatedAt: -1 }`

**Dependencies:** None

**Estimated Effort:** 1.5 days (Service: 0.75d, Endpoint: 0.5d, Tests: 0.25d)

**Priority:** Must Have

---

### Story US-FR025-019: Implement PATCH /api/tasks/{id}/assign & /unassign

**As a** frontend developer **I want** endpoints to assign/unassign tasks **So that** admins can update task assignments

**Acceptance Criteria:**
- [ ] PATCH /api/tasks/{taskId}/assign: body `{ userId }`, updates assignedUserId, returns TaskDto; Admin-only
- [ ] PATCH /api/tasks/{taskId}/unassign: sets assignedUserId to null, returns TaskDto; Admin-only
- [ ] Validates task exists and user is group member
- [ ] Validates userId exists and is member of task's group
- [ ] Returns 403 if not admin; 404 if task not found; 400 if userId invalid
- [ ] Invalidates cache tags appropriately

**Technical Notes:**
- Files: `Features/Tasks/Services/TaskService.cs`, `Controllers/TasksController.cs`
- Methods: `AssignTaskAsync(taskId, userId, requestingUserId)`, `UnassignTaskAsync(taskId, requestingUserId)`
- Admin check: verify requesting user has Admin role in task's group

**Dependencies:** None

**Estimated Effort:** 1 day (Endpoints: 0.5d, Validation: 0.25d, Tests: 0.25d)

**Priority:** Must Have

---

## Sprint Plan

### Sprint 1: Frontend Members Modal & RTK Query Setup
**Duration:** 2 weeks  
**Sprint Goal:** Launch Members modal with view/add/remove functionality and invite lifecycle management

**Stories:**
- US-FR025-001: Create MembersModal Component Structure (1d) - Must Have
- US-FR025-002: Build Members Tab List (1.5d) - Must Have
- US-FR025-003: Add RTK Query Endpoints for Members (0.5d) - Must Have
- US-FR025-004: Build Invites Tab with Status Display (1.5d) - Must Have
- US-FR025-005: Implement Add Member (Invite) Form (1d) - Must Have
- US-FR025-006: Implement Remove Member Action (1d) - Must Have
- US-FR025-007: Implement Resend/Cancel Invite Actions (0.75d) - Must Have

**Capacity:** 10 days | **Committed:** 7.25 days | **Buffer:** 2.75 days (28%)

---

### Sprint 2: Frontend Group Tasks View & Backend Invites Infrastructure
**Duration:** 2 weeks  
**Sprint Goal:** Launch Group Tasks panel with filtering/sorting and complete backend invite lifecycle support

**Stories (Frontend):**
- US-FR025-008: Create GroupTasksPanel Component (1d) - Must Have
- US-FR025-009: Build Task List with Assignee Display (1.5d) - Must Have
- US-FR025-010: Implement Task Filters (Status & Assignee) (1d) - Must Have
- US-FR025-011: Implement Task Sorting (Created/Updated) (0.5d) - Should Have
- US-FR025-012: Implement Inline Task Assign/Unassign (1.5d) - Must Have

**Stories (Backend):**
- US-FR025-013: Create Invite Domain Model & Repository (1.5d) - Must Have
- US-FR025-014: Build InvitesService with Create/Resend/Cancel (2d) - Must Have
- US-FR025-015: Add Invites Endpoints to GroupsController (1d) - Must Have

**Capacity:** 10 days | **Committed:** 10 days | **Buffer:** 0 days (tight; prioritize Must Have)

---

### Sprint 3: Backend Task Endpoints & Polish
**Duration:** 2 weeks  
**Sprint Goal:** Complete task filtering/assignment endpoints, add last-admin protection, comprehensive testing

**Stories:**
- US-FR025-016: Enhance RemoveMember with Last-Admin Protection (0.5d) - Must Have
- US-FR025-017: Add GET /api/groups/{id}/members Endpoint (1d) - Must Have
- US-FR025-018: Extend TaskService with Group-Scoped Filtering (1.5d) - Must Have
- US-FR025-019: Implement PATCH /api/tasks/{id}/assign & /unassign (1d) - Must Have
- **Integration Testing:** End-to-end tests for invite lifecycle, member removal, task assignment (2d)
- **UI Polish:** Loading states, error handling, accessibility audit (1.5d)
- **Documentation:** Update API docs, add runbook for invite email setup (0.5d)

**Capacity:** 10 days | **Committed:** 8 days | **Buffer:** 2 days (20%)

---

## Dependencies & Risks

### Technical Dependencies
| Dependency | Impact | Mitigation |
|------------|--------|------------|
| Email service (SendGrid/SMTP) | Invites log URLs in dev; no actual emails sent | Document manual invite link sharing; prioritize SendGrid integration in follow-up epic |
| MongoDB indexes on invites collection | Slow queries without indexes | Create indexes in migration script before deploying backend |
| Existing TaskService | Must support filtering/sorting | Extend service methods; add indexes to tasks collection |

### External Dependencies
- None (self-contained feature)

### Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Last-admin edge case not caught client-side | Medium | Group locked without admin | Enforce server-side; add client-side check for UX |
| Large task lists (500+) slow filtering | Low | Poor UX for large groups | Implement pagination; add cursor-based pagination if needed |
| Email deliverability issues | Medium | Users don't receive invites | Log invite URLs; add "Copy invite link" button in UI |
| Cache invalidation complexity | Low | Stale data after member removal | Invalidate both GroupMembers and GroupTasks caches |

---

## Release Phases

**Phase 1 (MVP) - Sprints 1-2:**
- Members modal with add/remove/resend/cancel
- Group Tasks panel with filters/sorting
- Backend invites API and task filtering
- Deliverable: Functional member and task management from group card

**Phase 2 (Polish) - Sprint 3:**
- Last-admin protection
- Full task assignment endpoints
- Integration testing and accessibility
- Deliverable: Production-ready feature with <1% error rate

**Post-Launch (Future Enhancements):**
- Real-time updates via SignalR for member/task changes
- Self-assign policy for non-admin members
- Email template localization (EN/HE)
- Invite expiry automation (scheduled job)
- Rate limiting for resends (max 3/day per invite)

---

## Validation Checklist

- [x] Stories follow INVEST principles
- [x] Estimates include AI co-development productivity (2-5x multipliers)
- [x] 20-28% buffer included in sprint plans
- [x] Dependencies documented and ordered
- [x] Each sprint delivers shippable, testable value
- [x] All stories have clear, testable acceptance criteria
- [x] Client-side stories prioritized before backend (per request)
- [x] Critical path identified: Members modal → Invites API → Tasks panel → Task endpoints

---

**Work Plan Status:** Ready for implementation  
**Next Steps:** Review with team → assign stories → begin Sprint 1 → track progress in progress.md
