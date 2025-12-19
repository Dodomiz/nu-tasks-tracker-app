M# FR-025 Implementation Progress

**Last Updated:** December 17, 2025  
**Overall Status:** ✅ Complete (100% - 19/19 stories)


## Progress Summary

| Epic | Total Stories | Completed | In Progress | Not Started |
|------|---------------|-----------|-------------|-------------|
| E1: Frontend Members Modal | 7 | 7 | 0 | 0 ✅ |
| E2: Frontend Group Tasks | 5 | 5 | 0 | 0 ✅ |
| E3: Backend Invites & Tasks API | 7 | 7 | 0 | 0 ✅ |
| **Total** | **19** | **19** | **0** | **0** ✅ |

**Completion:** 100% (19/19 stories)


## Epic E1: Frontend - Members Modal & Invites Management

### ✅ US-FR025-001: Create MembersModal Component Structure
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ New `MembersModal` with two tabs: Members | Invites
- ✅ Reuses existing `InviteMembersModal` inside the Invites tab
- ✅ Integrated into Group Dashboard (Manage Members button)
- ✅ Members tab now lists hydrated members (name, email, role, joinedAt)

**Files Created:**
- `web/src/features/groups/components/MembersModal.tsx`

**Files Modified:**
- `web/src/features/groups/pages/GroupDashboardPage.tsx` (replaced Invite modal with Members modal)
- `web/src/features/groups/groupApi.ts` (added `getGroupMembers` endpoint)

---

### ✅ US-FR025-003: Add RTK Query Endpoints for Members & Invites & Tasks
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ `inviteMember` mutation exists in `groupApi.ts`
- ✅ `removeMember` mutation exists and invalidates cache
- ✅ `getGroupMembers` query endpoint added
- ✅ `getGroupInvites` query endpoint added
- ✅ `resendInvite` mutation added
- ✅ `cancelInvite` mutation added
- ✅ GroupInvites tag type added to apiSlice for cache management
- ✅ All hooks exported and ready for use
- ✅ Task endpoints moved to apiSlice injection pattern
- ✅ `getTasks` query with filtering support (groupId, status, assignedTo, sortBy, order)
- ✅ `assignTask` and `unassignTask` mutations added
- ✅ All mutations properly invalidate caches

**Files Created:**
- `web/src/types/group.ts` (added InviteDto interface)

**Files Modified:**
- `web/src/features/groups/groupApi.ts` (added invite and member endpoints)
- `web/src/features/tasks/api/tasksApi.ts` (migrated to apiSlice injection, added assign/unassign)
- `web/src/app/api/apiSlice.ts` (added GroupInvites tag type)
- `web/src/app/store.ts` (removed separate tasksApi reducer, now uses apiSlice)

---

### ✅ US-FR025-002: Build Members Tab List
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ Members tab displays list of all members with proper styling
- ✅ Each member row shows avatar/initials, full name, email, role badge, and joined date
- ✅ Admin role badge styled distinctly (purple)
- ✅ Loading state with skeleton animation
- ✅ Empty state message
- ✅ Members sorted by role (Admins first) then joinedAt
- ✅ Responsive table layout with dark mode support

**Files Modified:**
- `web/src/features/groups/components/MembersModal.tsx`

---

### ✅ US-FR025-004: Build Invites Tab with Status Display
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ Invites tab displays list of all invites with status filtering
- ✅ Each invite row shows email, status chip, invited by, invited at
- ✅ Status chip styled with colors (Pending=yellow, Joined=green, Declined/Canceled=gray, Expired=red)
- ✅ Send count displayed when > 1
- ✅ Admin-only access control with appropriate messaging
- ✅ Loading state with skeleton animation
- ✅ Empty state message
- ✅ Responsive table layout with dark mode support

**Files Created:**
- `web/src/features/groups/components/InvitesTab.tsx`
- `web/src/components/StatusPill.tsx` (reusable status chip component)

**Files Modified:**
- `web/src/features/groups/components/MembersModal.tsx` (integrated InvitesTab)

---

### ✅ US-FR025-005: Implement Add Member (Invite) Form
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ Invite form embedded in Invites tab (admin-only)
- ✅ Reuses existing `InviteMembersModal` component for email input
- ✅ Email validation (RFC 5322 format)
- ✅ Success toast and automatic Invites list refresh
- ✅ Error handling for duplicates and network errors
- ✅ Form displayed in highlighted section above invites list

**Files Modified:**
- `web/src/features/groups/components/MembersModal.tsx`

---

### ✅ US-FR025-006: Implement Remove Member Action
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ Remove icon (trash) visible next to each member (Admin only)
- ✅ Confirmation dialog with warning message
- ✅ Last-admin protection check (prevents removing last admin)
- ✅ Success/error toast messages
- ✅ Cache invalidation on successful removal
- ✅ Loading state during removal operation

**Files Modified:**
- `web/src/features/groups/components/MembersModal.tsx` (added remove functionality)
- `web/src/features/groups/pages/GroupDashboardPage.tsx` (passed myRole and currentUserId props)

---

### ✅ US-FR025-007: Implement Resend/Cancel Invite Actions
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ Resend button (refresh icon) for Pending invites
- ✅ Cancel button (X icon) for Pending invites
- ✅ Confirmation dialog for cancel action
- ✅ Success/error toast messages
- ✅ Cache invalidation on successful actions
- ✅ Actions disabled while loading
- ✅ Actions only visible for Pending invites

**Files Created:**
- `web/src/features/groups/components/InvitesTab.tsx` (includes resend/cancel actions)

---

## Epic E2: Frontend - Group Tasks View & Filtering

### ✅ US-FR025-008: Create GroupTasksPanel Component Structure
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ GroupTasksPanel modal component with proper structure
- ✅ Opens from "View Tasks" button on group dashboard
- ✅ Close button and ESC key handler
- ✅ Focus trap implemented for accessibility
- ✅ Proper transitions using Headless UI Dialog
- ✅ Responsive layout supporting up to 4xl width

**Files Created:**
- `web/src/features/groups/components/GroupTasksPanel.tsx`

**Files Modified:**
- `web/src/features/groups/pages/GroupDashboardPage.tsx` (added View Tasks button and panel integration)

---

### ✅ US-FR025-009: Build Task List UI
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ Task list displays all tasks for the group
- ✅ Each task row shows name, status chip, due date, assignee avatar/initials, and assignee name
- ✅ Status chips color-coded (Completed=green, InProgress=blue, Overdue=red, Pending=gray)
- ✅ Loading state with message
- ✅ Empty state message
- ✅ Scrollable container with max height
- ✅ Total tasks count displayed in footer
- ✅ Dark mode support

**Files:**
- `web/src/features/groups/components/GroupTasksPanel.tsx`

---

### ✅ US-FR025-010: Add Filters (Status, Assignee)
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ Filter panel with toggle button (funnel icon)
- ✅ Status filter dropdown (All, Pending, InProgress, Completed, Overdue)
- ✅ Assignee filter dropdown (All Members + individual members)
- ✅ Filters automatically refetch tasks via RTK Query
- ✅ Filter state persists during session
- ✅ Responsive grid layout
- ✅ Dark mode support

**Files:**
- `web/src/features/groups/components/GroupTasksPanel.tsx`

---

### ✅ US-FR025-011: Add Sorting (Created, Updated)
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ Sort dropdown (Created At, Updated At)
- ✅ Sort order toggle button (↑ asc / ↓ desc)
- ✅ Sort automatically refetches tasks via RTK Query
- ✅ Default sort: CreatedAt descending
- ✅ Sort state persists during session
- ✅ Dark mode support

**Files:**
- `web/src/features/groups/components/GroupTasksPanel.tsx`

---

### ✅ US-FR025-012: Implement Inline Assign/Unassign UI
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ Assign dropdown shown for each task (Admin only)
- ✅ Dropdown populated with all group members
- ✅ Selecting a member immediately assigns the task
- ✅ Success/error toast messages
- ✅ Cache invalidation on successful assignment
- ✅ Loading state during assign/unassign operations
- ✅ Dropdown disabled while loading
- ✅ Admin role validation enforced

**Files:**
- `web/src/features/groups/components/GroupTasksPanel.tsx`

---

## Epic E3: Backend - Invites Collection & API Endpoints

### ✅ US-FR025-016: Enhance RemoveMember with Last-Admin Protection
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ Last-admin protection logic implemented in `GroupService.RemoveMemberAsync`
- ✅ Checks if target member is Admin and if adminCount == 1
- ✅ Throws `InvalidOperationException` with message "Cannot remove the last admin. Promote another member first."
- ✅ Protection applies regardless of who is removing (not just self-removal)
- ✅ Existing endpoint returns appropriate error via exception handling middleware
- ✅ Backend builds successfully with 0 errors

**Implementation:**
```csharp
if (targetMember.Role == GroupRole.Admin)
{
    var adminCount = group.Members.Count(m => m.Role == GroupRole.Admin);
    if (adminCount == 1)
    {
        throw new InvalidOperationException("Cannot remove the last admin. Promote another member first.");
    }
}
```

**Files Modified:**
- `backend/src/TasksTracker.Api/Features/Groups/Services/GroupService.cs` (RemoveMemberAsync method)

**Note:** Unit tests deferred to Sprint 3 integration testing phase.

---

**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ POST `/api/groups/{groupId}/invites` - create invite (calls IInvitesService.CreateInviteAsync)
- ✅ GET `/api/groups/{groupId}/invites` - list invites (calls IInvitesService.GetGroupInvitesAsync)
- ✅ POST `/api/groups/{groupId}/invites/{inviteId}/resend` - resend invite email
- ✅ DELETE `/api/groups/{groupId}/invites/{inviteId}` - cancel invite
- ✅ [RequireGroupAdmin] authorization on all endpoints
- ✅ API documentation comments (XML docs)
- ✅ IInvitesService injected into GroupsController constructor


### ✅ US-FR025-013: Create Invite Domain Model & Repository
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ `Invite.cs` domain model with all required properties (Id, GroupId, Email, Status, Token, InvitedBy, InvitedAt, RespondedAt, LastSentAt, SendCount, Notes)
- ✅ `InviteStatus` enum (Pending, Joined, Declined, Canceled, Expired)
- ✅ `IInvitesRepository` interface with all CRUD methods
- ✅ `InvitesRepository` implementation using MongoDB
- ✅ MongoDB indexes created automatically on startup:
  - Compound index: `{ groupId: 1, status: 1, invitedAt: -1 }` for listing/filtering
  - Unique partial index: `{ email: 1, groupId: 1 }` for preventing duplicate pending invites
  - Token index: `{ token: 1 }` for join validation
- ✅ Repository registered in DI (Program.cs)
- ✅ Duplicate pending invite handling via MongoWriteException
- ✅ Backend builds successfully with 0 errors

**Files Created:**
- `backend/src/TasksTracker.Api/Core/Domain/Invite.cs`
- `backend/src/TasksTracker.Api/Core/Interfaces/IInvitesRepository.cs`
- `backend/src/TasksTracker.Api/Infrastructure/Data/InvitesRepository.cs`

**Files Modified:**
- `backend/src/TasksTracker.Api/Program.cs` (added IInvitesRepository registration)

---

### ✅ US-FR025-014: Build InvitesService with Create/Resend/Cancel
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ `IInvitesService` interface with all methods (CreateInviteAsync, ResendInviteAsync, CancelInviteAsync, GetGroupInvitesAsync)
- ✅ `InvitesService` implementation with full business logic
- ✅ Email validation (RFC 5322 regex, max length 254)
- ✅ Duplicate pending invite prevention (throws InvalidOperationException)
- ✅ Already-a-member check (queries users by email)
- ✅ Group capacity check (max members from settings)
- ✅ Token generation (GUID)
- ✅ Admin-only authorization for all invite actions
- ✅ Resend logic: increments sendCount, updates lastSentAt
- ✅ Cancel logic: sets status=Canceled, respondedAt=now
- ✅ GetGroupInvitesAsync: filters Canceled invites; Admin-only visibility
- ✅ User hydration for invitedBy names (batch lookup)
- ✅ Service registered in DI (Program.cs)
- ✅ Backend builds successfully with 0 errors

**Files Created:**
- `backend/src/TasksTracker.Api/Features/Groups/Services/IInvitesService.cs`
- `backend/src/TasksTracker.Api/Features/Groups/Services/InvitesService.cs`

**Files Modified:**


### ✅ US-FR025-017: Add GET /api/groups/{id}/members Endpoint
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ `GetGroupMembersAsync` method in GroupService
- ✅ GET `/api/groups/{groupId}/members` endpoint in GroupsController
- ✅ Hydrated member details (firstName, lastName, email) via batch user lookup
- ✅ Sorting by role (Admin first) then joinedAt
- ✅ Accessible to all group members (not Admin-only)
- ✅ Proper error responses (404, 403, 500) with ApiResponse wrapper
- ✅ Backend builds successfully with 0 errors

**Files Modified:**
- `backend/src/TasksTracker.Api/Features/Groups/Services/IGroupService.cs` (added GetGroupMembersAsync method)
- `backend/src/TasksTracker.Api/Features/Groups/Services/GroupService.cs` (implemented GetGroupMembersAsync with hydration and sorting)
- `backend/src/TasksTracker.Api/Features/Groups/Controllers/GroupsController.cs` (added GET /members endpoint)


### ✅ US-FR025-018: Extend TaskService with Group-Scoped Filtering
**Status:** ✅ Complete (100%) - Already Implemented

**Completed:**
- ✅ TaskListQuery already supports groupId, status, assignedTo filtering
- ✅ GET `/api/tasks` endpoint accepts query parameters
- ✅ Sorting by CreatedAt, UpdatedAt supported
- ✅ Pagination with page and pageSize parameters
- ✅ Backend builds successfully with 0 errors

**Note:** This functionality was already implemented in the existing TaskService.

**Files:**
- `backend/src/TasksTracker.Api/Features/Tasks/Models/TaskListQuery.cs`
- `backend/src/TasksTracker.Api/Features/Tasks/Services/TaskService.cs`
- `backend/src/TasksTracker.Api/Features/Tasks/Controllers/TasksController.cs`

---

### ✅ US-FR025-019: Implement PATCH /api/tasks/{id}/assign & /unassign
**Status:** ✅ Complete (100%) - December 17, 2025

**Completed:**
- ✅ `AssignTaskAsync` method in TaskService with admin validation
- ✅ `UnassignTaskAsync` method in TaskService (reassigns to requesting admin)
- ✅ PATCH `/api/tasks/{taskId}/assign` endpoint in TasksController
- ✅ PATCH `/api/tasks/{taskId}/unassign` endpoint in TasksController
- ✅ Admin role validation (only group admins can assign/unassign)
- ✅ Group membership validation (assignee must be a member)
- ✅ Proper error responses (404, 403, 400)
- ✅ `AssignTaskRequest` model with AssigneeUserId property
- ✅ Backend builds successfully with 0 errors

**Files Created:**
- `backend/src/TasksTracker.Api/Features/Tasks/Models/CreateTaskRequest.cs` (added AssignTaskRequest class)

**Files Modified:**
- `backend/src/TasksTracker.Api/Features/Tasks/Services/ITaskService.cs` (added AssignTaskAsync, UnassignTaskAsync methods)
- `backend/src/TasksTracker.Api/Features/Tasks/Services/TaskService.cs` (injected IGroupRepository, IUserRepository; implemented assign/unassign with validation)
- `backend/src/TasksTracker.Api/Features/Tasks/Controllers/TasksController.cs` (added PATCH /assign and /unassign endpoints)

---

## ✅ FR-025 Complete!

### Summary of Delivered Features

#### Epic E1: Frontend - Members Modal & Invites Management (7/7 ✅)
1. ✅ Tabbed MembersModal with Members | Invites tabs
2. ✅ Members tab with sortable list, role badges, and remove actions
3. ✅ Invites tab with status tracking (Pending/Joined/Declined/Canceled/Expired)
4. ✅ Add Member (Invite) form with email validation
5. ✅ Remove member action with last-admin protection
6. ✅ Resend/Cancel invite actions for pending invites
7. ✅ RTK Query endpoints for all member and invite operations

#### Epic E2: Frontend - Group Tasks View & Filtering (5/5 ✅)
1. ✅ GroupTasksPanel modal component with proper structure
2. ✅ Task list UI with status chips and assignee avatars
3. ✅ Filters for status and assignee
4. ✅ Sorting by Created At / Updated At (asc/desc)
5. ✅ Inline assign/unassign UI (Admin-only)

#### Epic E3: Backend - Invites Collection & API Endpoints (7/7 ✅)
1. ✅ Invite domain model with repository and MongoDB indexes
2. ✅ InvitesService with create/resend/cancel logic
3. ✅ Complete invites API endpoints (POST, GET, resend, cancel)
4. ✅ Last-admin protection in RemoveMemberAsync
5. ✅ GET /members endpoint with hydration and sorting
6. ✅ Task filtering with groupId, status, assignedTo parameters (already existed)
7. ✅ PATCH /assign and /unassign endpoints with admin validation

### Key Technical Achievements
- **State Management:** Migrated tasksApi to apiSlice injection pattern for unified caching
- **Cache Invalidation:** Proper tag-based cache invalidation across all mutations
- **Dark Mode:** Full dark mode support across all new components
- **Accessibility:** Focus traps, ESC handlers, and ARIA labels implemented
- **Error Handling:** Comprehensive error handling with user-friendly toast messages
- **Responsive Design:** Mobile-friendly layouts with responsive tables and modals
- **Type Safety:** Full TypeScript coverage with proper interfaces and types

### Files Created
**Frontend:**
- `web/src/features/groups/components/InvitesTab.tsx`
- `web/src/features/groups/components/GroupTasksPanel.tsx`
- `web/src/components/StatusPill.tsx`

**Backend:**
- All backend files were already created in previous work sessions

**Types:**
- Added `InviteDto` interface to `web/src/types/group.ts`

### Files Modified
**Frontend:**
- `web/src/features/groups/components/MembersModal.tsx`
- `web/src/features/groups/pages/GroupDashboardPage.tsx`
- `web/src/features/groups/groupApi.ts`
- `web/src/features/tasks/api/tasksApi.ts`
- `web/src/app/api/apiSlice.ts`
- `web/src/app/store.ts`
- `web/src/types/group.ts`

**Backend:**
- All backend modifications were completed in previous work sessions

---

## Testing Recommendations

### Manual Testing Checklist
- [ ] Open Members modal and verify Members tab shows all members
- [ ] Verify Admin sees "Remove" button, non-admin does not
- [ ] Test removing a member (not last admin)
- [ ] Test last-admin protection (should show error)
- [ ] Open Invites tab and verify invite form appears for admins
- [ ] Send an invite and verify it appears in the list with Pending status
- [ ] Test Resend button on a pending invite
- [ ] Test Cancel button with confirmation dialog
- [ ] Open Group Tasks panel via "View Tasks" button
- [ ] Verify tasks load with proper assignee names and avatars
- [ ] Test status filter (All, Pending, InProgress, Completed, Overdue)
- [ ] Test assignee filter
- [ ] Test sorting by Created/Updated (asc/desc)
- [ ] Test inline task assignment (admin only)
- [ ] Verify non-admin members cannot see assign dropdown
- [ ] Test all features in dark mode
- [ ] Test responsive layouts on mobile devices

### Automated Testing (Future Work)
- Unit tests for all new components
- Integration tests for RTK Query endpoints
- E2E tests for critical user flows
- Accessibility tests with axe-core

---

## Next Steps (Post-FR-025)

1. **Immediate:**
   - Test all features manually
   - Fix any bugs discovered during testing
   - Update main progress.md in docs/

2. **Short-term:**
   - Add unit tests for new components
   - Update user documentation
   - Create demo video/screenshots

3. **Future Enhancements:**
   - Real-time updates via SignalR for invites and task assignments
   - Role change/promotion UI in Members modal
   - Self-assign policy configuration
   - Bulk invite functionality
   - Export members/tasks to CSV

---

**Completion Date:** December 17, 2025  
**Total Implementation Time:** 1 day with AI co-development  
**Lines of Code Added:** ~1000+ (frontend) + backend already complete

---

## Bug Fixes

### Fix 1: "Manage Members" Button Not Always Visible
**Issue:** Button wasn't consistently appearing for group admins due to state synchronization issue between Redux state and RTK Query cache.

**Root Cause:** The button visibility checked `selectIsAdmin` selector which looked at `state.group.currentGroup?.myRole`, but group data was stored in RTK Query cache, not Redux state.

**Solution:** Changed to use `group?.myRole === 'Admin'` directly from RTK Query result.

**Files Modified:** 
- `web/src/features/groups/pages/GroupDashboardPage.tsx`

---

### Fix 2: Invites Modal Cannot Be Closed
**Issue:** When opening the Invites tab in Members modal, users couldn't close the parent modal because of a modal-within-modal conflict.

**Root Cause:** `InviteMembersModal` is a full modal component with `Dialog`, `Transition`, and backdrop. When embedded inside the MembersModal's Invites tab, it created nested modals causing interference.

**Solution:** Created new `InviteForm` component - a lightweight inline form without modal wrapper, specifically for embedding in the Invites tab.

**Files Created:**
- `web/src/features/groups/components/InviteForm.tsx` (200 lines) - Inline invite form component

**Files Modified:**
- `web/src/features/groups/components/MembersModal.tsx` - Replaced InviteMembersModal with InviteForm

---

### Enhancement 3: Manage Members on Dashboard
**Change:** Added Manage Members functionality to group cards on the dashboard.

**Modifications:**
1. **Removed buttons**: Invite and Settings buttons removed from group cards
2. **Added Edit icon**: Edit icon button in top right corner (admins only) to edit group settings
3. **Added Manage Members button**: New button for admins to manage group members directly from dashboard
4. **Modal integration**: Integrated MembersModal from groups feature into dashboard

**Files Created:**
- `web/src/features/dashboard/components/ManageMembersModalWrapper.tsx` - Wrapper that fetches group data and renders MembersModal

**Files Modified:**
- `web/src/features/dashboard/components/GroupCard.tsx` - Updated UI with edit icon and Manage Members button
- `web/src/features/dashboard/pages/DashboardPage.tsx` - Added Manage Members modal integration
- `web/src/features/groups/components/MembersModal.tsx` - Made `invitationCode` optional for dashboard use

**User Experience Improvements:**
- Cleaner group card interface with fewer buttons
- Direct access to member management from dashboard
- Edit icon provides clear visual indication for group settings access
- Consistent fixed modal height for better UX
