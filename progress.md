## 2025-12-20 (GroupTasksPanel Hebrew Translations - COMPLETE ✅)
- **Goal:** Add Hebrew (i18n) translations for GroupTasksPanel component
- **Problem:** GroupTasksPanel had all hardcoded English text, including status values and UI labels
- **Solution:** Added comprehensive translation keys and helper function to translate status enum values
- **Translation Keys Added:**
  - `groupTasksPanel.title`: "Tasks — {{groupName}}" / "משימות — {{groupName}}"
  - `groupTasksPanel.filters.*`: Status, All Statuses, Assignee, All Members, Sort By, Created, Updated
  - `groupTasksPanel.loading`: "Loading tasks..." / "טוען משימות..."
  - `groupTasksPanel.noTasks`: "No tasks found." / "לא נמצאו משימות."
  - `groupTasksPanel.due`: "Due: {{date}}" / "יעד: {{date}}"
  - `groupTasksPanel.showingCount`: "Showing {{count}} of {{total}} tasks"
  - `groupTasksPanel.toast.*`: Success/error messages for assign and status update
  - Reused `tasks.status.*`: pending, inProgress, completed, overdue translations
- **Implementation Details:**
  - Added `getStatusLabel()` helper function to map status enum values to translations
  - Translates status in 3 places:
    1. Admin clickable status badge
    2. Non-admin read-only status badge
    3. Status dropdown options
  - All UI labels use translation keys
  - Date formatting respects language (already using `i18n.language`)
- **Files Modified (3):**
  - `web/public/locales/en/translation.json` - Added GroupTasksPanel English translations
  - `web/public/locales/he/translation.json` - Added GroupTasksPanel Hebrew translations  
  - `web/src/features/groups/components/GroupTasksPanel.tsx` - Added `getStatusLabel()`, updated all displays
- **Result:** GroupTasksPanel fully supports English and Hebrew, including all status values
- **Compilation:** ✅ No TypeScript errors

## 2025-12-19 (Group Tasks Panel Admin Status Control - COMPLETE ✅)
- **Goal:** Enable admins to change task status directly from Group Tasks Panel
- **Changes:**
  1. **Clickable Status Badge**: Status badge now clickable for admins (non-admins see regular badge)
  2. **Status Dropdown**: Same dropdown as MyTasksTab with all 4 statuses (Pending, InProgress, Completed, Overdue)
  3. **Admin-Only Feature**: Only group admins can change task status via this panel
  4. **Real-time Updates**: Uses RTK Query mutation with automatic cache invalidation
  5. **Toast Notifications**: Success/error feedback for status changes
  6. **Loading State**: Dropdown disabled during status update
- **Implementation Details:**
  - Added `useUpdateTaskStatusMutation` hook
  - Added `statusDropdownTaskId` state to track which task's dropdown is open
  - Status badge conditionally renders as button (admin) or span (non-admin)
  - Dropdown positioned absolutely with fixed backdrop for closing
  - Color-coded status indicators in dropdown menu
  - Highlights current status in dropdown
- **Files Modified (1):**
  - `web/src/features/groups/components/GroupTasksPanel.tsx` - Added status change functionality
- **UX Impact:**
  - Admins can quickly update task status without leaving the panel
  - Maintains authorization (backend validates admin role)
  - Consistent UI pattern across MyTasksTab and GroupTasksPanel
  - Non-admin users see status but cannot change it
- **Compilation:** ✅ No TypeScript errors

## 2025-12-19 (Task Count Display Fix - COMPLETE ✅)
- **Goal:** Fix "Showing 1 of {{total}} tasks" display issue in MyTasksTab
- **Problem:** Translation interpolation wasn't working because only `count` was passed but translation key expected both `count` and `total`
- **Solution:** Pass both parameters to i18next: `count: data.items.length` and `total: data.total`
- **Files Modified (1):**
  - `web/src/features/dashboard/components/MyTasksTab.tsx` - Fixed translation parameters
- **Result:** Now correctly displays "Showing X of Y tasks"
- **Compilation:** ✅ No TypeScript errors

## 2025-12-19 (Task Status Update Backend Endpoint - COMPLETE ✅)
- **Goal:** Implement backend PATCH endpoint for updating task status
- **Endpoint:** `PATCH /api/tasks/{taskId}/status`
- **Authorization:**
  - Assigned user can update their own task status
  - Group admins can update any task status in their group
  - Non-members or unauthorized users receive 403 Forbidden
- **Implementation Details:**
  1. **UpdateTaskStatusRequest DTO**: Simple request with `Status` property (enum: Pending, InProgress, Completed, Overdue)
  2. **ITaskService.UpdateTaskStatusAsync**: Added method signature with fully qualified `Core.Domain.TaskStatus`
  3. **TaskService.UpdateTaskStatusAsync**: Full implementation with authorization checks:
     - Validates task exists (404 if not found)
     - Validates group exists (404 if not found)
     - Validates user is group member (403 if not)
     - Allows update if user is assignee OR group admin
     - Updates task status in database
  4. **TasksController PATCH endpoint**: RESTful endpoint with error handling:
     - Returns 200 OK on success
     - Returns 404 Not Found if task/group doesn't exist
     - Returns 403 Forbidden if unauthorized
- **Files Created (1):**
  - `backend/src/TasksTracker.Api/Features/Tasks/Models/UpdateTaskStatusRequest.cs` - Request DTO
- **Files Modified (3):**
  - `backend/src/TasksTracker.Api/Features/Tasks/Services/ITaskService.cs` - Added method signature
  - `backend/src/TasksTracker.Api/Features/Tasks/Services/TaskService.cs` - Implemented business logic
  - `backend/src/TasksTracker.Api/Features/Tasks/Controllers/TasksController.cs` - Added PATCH endpoint
- **Security Considerations:**
  - Requires JWT authentication (`[Authorize]`)
  - Validates user is assigned to task or is group admin
  - Prevents unauthorized status changes
  - Group membership verification prevents cross-group access
- **Technical Notes:**
  - Used fully qualified `Core.Domain.TaskStatus` to avoid conflict with `System.Threading.Tasks.TaskStatus`
  - Follows existing controller patterns (validation, error handling, response format)
  - Follows service layer patterns (authorization checks, repository updates)
- **Compilation:** ✅ Backend builds successfully with 0 errors
- **Integration:** ✅ Frontend RTK Query mutation already wired and ready to use this endpoint

## 2025-12-19 (My Tasks Tab Color Scheme Fix - COMPLETE ✅)
- **Goal:** Fix color scheme to match Groups tab style and resolve status dropdown readability issue
- **Problem:** Dark text on dark background in status dropdown made it unreadable; gradients and fancy colors didn't match the clean Groups tab design
- **Changes:**
  1. **Simplified Card Design**: Removed gradients, now uses clean white background with simple border
  2. **Fixed Status Dropdown**: Changed dropdown text to `text-gray-900` (dark gray) on white background for perfect readability
  3. **Consistent Color Palette**: Matched Groups tab colors:
     - Difficulty: green (easy), yellow (medium), red (hard)
     - Status: gray (pending), blue (in progress), green (completed), red (overdue)
     - Group badge: purple
  4. **Removed Dark Mode Complexity**: Using simple light colors that work well without dark mode variants
  5. **Simplified Header**: Removed gradient background, now simple title with gray subtitle
  6. **Clean Badges**: Changed from `rounded-lg` to `rounded-full` to match Groups tab pill-style badges
- **Files Modified (2):**
  - `web/src/features/dashboard/components/TaskCard.tsx` - Simplified design, fixed dropdown colors
  - `web/src/features/dashboard/components/MyTasksTab.tsx` - Removed gradient header, simplified styling
- **UX Impact:**
  - Status dropdown now perfectly readable with dark text on white background
  - Visual consistency between Groups and Tasks tabs
  - Cleaner, more professional appearance
  - No more eye-strain from color schemes
- **Compilation:** ✅ No TypeScript errors (verified via npm run build)

## 2025-12-19 (My Tasks Tab UX Enhancements - COMPLETE ✅)
- **Goal:** Improve My Tasks tab with interactive status changes, better typography, and friendlier colors
- **Changes:**
  1. **Interactive Status Change**: Clicking task status badge now shows dropdown with all 4 statuses
     - Statuses: Pending, InProgress, Completed, Overdue
     - Uses RTK Query mutation (updateTaskStatus) with loading spinner
     - Dropdown closes on selection or backdrop click
     - Updates cache automatically after status change
  2. **Bold "Sort by" Label**: Changed sort label from font-medium to font-bold for better visibility
  3. **Friendlier Color Scheme**:
     - Warmer palette: emerald (easy), amber (medium), rose (hard), sky (in progress), slate (pending/completed)
     - Gradient backgrounds: Header uses bg-gradient-to-r from-blue-50 to-indigo-50
     - Card gradients: bg-gradient-to-br from-white to-gray-50
     - Enhanced shadows, rounded corners (rounded-xl), better hover effects
     - Group badges with purple-to-pink gradient
- **Files Modified (3):**
  - `web/src/features/tasks/api/tasksApi.ts` - Added updateTaskStatus mutation (PATCH /tasks/{taskId}/status)
  - `web/src/features/dashboard/components/MyTasksTab.tsx` - Color scheme improvements, bold label, gradient header
  - `web/src/features/dashboard/components/TaskCard.tsx` - Complete rewrite with status dropdown and improved design
- **Implementation Details:**
  - TaskCard: useState for dropdown visibility, stopPropagation on status button, backdrop overlay for dismissal
  - API mutation invalidates 3 cache tags: specific task, LIST, and MY_TASKS
  - Loading state shows spinner icon during update
  - Error handling logs to console (can be extended with toast notifications)
- **UX Impact:**
  - Users can quickly change task status without opening task details
  - Warmer colors create more approachable, friendly interface
  - Better visual hierarchy with bold labels and gradients
  - Improved hover feedback with scale and shadow transitions
- **Compilation:** ✅ No TypeScript errors (verified via npm run build)
- **Note:** Backend PATCH endpoint may need implementation/verification

## 2025-12-19 (Task Creation UX Improvements - COMPLETE ✅)
- **Goal:** Improve task creation form with better defaults and translations
- **Changes:**
  1. **Due Date Default**: Changed from current time to end of day (23:59)
     - Users creating tasks typically want them due by end of day, not at creation time
  2. **Difficulty Default**: Changed from 1 to 5 (mid-range)
     - More reasonable starting point for task difficulty assessment
  3. **Modal Width**: Increased from max-w-2xl to max-w-3xl
     - Prevents datetime input value from being cut off
     - Better spacing for all form fields
  4. **Translations Added**:
     - `dashboard.createTaskInGroup`: "Create Task in {{groupName}}" / "צור משימה ב{{groupName}}"
     - `dashboard.taskWillBeCreatedIn`: Full description in both English and Hebrew
- **Files Modified (4):**
  - `web/src/components/CreateTaskForm.tsx` - Updated defaults for dueAt and difficulty
  - `web/src/components/Modal.tsx` - Increased max width
  - `web/public/locales/en/translation.json` - Added English translations
  - `web/public/locales/he/translation.json` - Added Hebrew translations
- **UX Impact:**
  - Better default values reduce user input time
  - Wider modal improves readability
  - Proper translations for Hebrew users
- **Compilation:** ✅ No TypeScript errors

## 2025-12-19 (Task Creation Default Due Date - COMPLETE ✅)
- **Goal:** Set default due date to today when creating a new task
- **Frontend Changes:**
  - Updated CreateTaskForm component to initialize dueAt state with current date/time
  - Created getDefaultDueDate helper function to format date for datetime-local input
  - Format: `YYYY-MM-DDTHH:MM` (ISO 8601 compatible with datetime-local input)
- **Files Modified (1):**
  - `web/src/components/CreateTaskForm.tsx` - Added default due date initialization
- **UX Improvement:** 
  - Users no longer need to manually set the date when creating tasks due today
  - Default value is pre-populated but still editable
  - Reduces clicks and improves task creation workflow
- **Compilation:** ✅ No TypeScript errors

## 2025-12-19 (Static Files Serving Configuration - COMPLETE ✅)
- **Goal:** Configure backend to serve static files (like images/logos) from `/static` URL path
- **Backend Changes:**
  - Added `UseStaticFiles` middleware configuration in Program.cs
  - Configured PhysicalFileProvider to serve files from `static/` directory
  - Set RequestPath to `/static` for URL mapping
  - Updated .csproj to copy static files to output directory during build
- **Files Modified (2):**
  - `backend/src/TasksTracker.Api/Program.cs` - Added static files middleware with custom path
  - `backend/src/TasksTracker.Api/TasksTracker.Api.csproj` - Added ItemGroup to copy static/** files
- **Usage:** 
  - Place files in: `backend/src/TasksTracker.Api/static/`
  - Access via URL: `http://localhost:5199/static/filename.ext`
  - Example: `NuKvarLogo.png` → `http://localhost:5199/static/NuKvarLogo.png`
- **Build Verification:** ✅ Static files copied to `bin/Debug/net9.0/static/` directory
- **Compilation:** ✅ Backend builds successfully with no errors

## 2025-01-XX (Group Member Role Management - COMPLETE ✅)
- **Goal:** Allow group admins to promote members to admin or demote admins to regular users
- **Backend Changes:**
  - Added `DemoteMemberAsync` method to IGroupService and GroupService
  - Business logic: Validates requesting user is admin, prevents demoting last admin, updates role to RegularUser
  - Added POST `/groups/{groupId}/members/{userId}/demote` endpoint in GroupsController
  - Authorization via `[RequireGroupAdmin]` attribute
  - Error handling: NOT_FOUND, INVALID_OPERATION (last admin), NOT_ADMIN, SERVER_ERROR
- **Frontend Changes:**
  - Added `DemoteMemberRequest` type interface (groupId, userId)
  - Added `demoteMember` RTK Query mutation with cache invalidation
  - Updated MembersModal to show role toggle buttons:
    * RegularUser members show "Promote to Admin" button (blue up arrow)
    * Admin members show "Demote to User" button (orange down arrow)
    * Last admin demote button is disabled with tooltip
    * Users cannot change their own role (buttons disabled with "Cannot change your own role" tooltip)
  - Added confirmation modals for both promote and demote actions
  - Import icons: ArrowUpIcon, ArrowDownIcon from heroicons
  - Fixed button click handlers: Added event.stopPropagation() to prevent table row click interference
  - Self-role protection: Buttons disabled when viewing own user profile
- **Backend Files Modified (3):**
  - `backend/Features/Groups/Services/IGroupService.cs` - Added DemoteMemberAsync signature
  - `backend/Features/Groups/Services/GroupService.cs` - Full implementation with last-admin protection
  - `backend/Features/Groups/Controllers/GroupsController.cs` - Added POST /demote endpoint
- **Frontend Files Modified (3):**
  - `web/src/types/group.ts` - Added DemoteMemberRequest interface
  - `web/src/features/groups/groupApi.ts` - Added demoteMember mutation and exported hook
  - `web/src/features/groups/components/MembersModal.tsx` - Updated UI with role toggle buttons, confirmations, and click handlers
- **Key Features:**
  - Bidirectional role management (promote AND demote)
  - Last admin protection prevents orphaned groups
  - Self-role protection prevents users from changing own role
  - Event propagation handling fixes button click issues
  - Confirmation modals with clear messaging
  - Loading states during role changes
  - Toast notifications for success/error
  - Cache invalidation refreshes member list automatically
- **Bug Fix:** Arrow buttons not working - Fixed by adding `e.stopPropagation()` to button onClick handlers and preventing self-role changes
- **Compilation:** ✅ Backend API compiles, Frontend has pre-existing unrelated test config errors

## 2025-01-XX (RTK Query Cache Invalidation Fix - COMPLETE ✅)
- **Issue:** After creating a group, navigating back to dashboard didn't show the new group until page refresh
- **Root Cause:** Dashboard uses `getDashboard` query with `DASHBOARD` tag, but `createGroup` mutation only invalidated `LIST` tag
- **Solution:** Updated all group-modifying mutations to invalidate both `LIST` and `DASHBOARD` tags for proper cache synchronization
- **Mutations Fixed (4):**
  - `createGroup` - Now invalidates `['LIST', 'DASHBOARD']`
  - `updateGroup` - Now invalidates `[specific group, 'LIST', 'DASHBOARD']`
  - `joinGroup` - Now invalidates `['LIST', 'DASHBOARD']`
  - `redeemCodeInvite` - Now invalidates `['LIST', 'DASHBOARD']`
- **Files Modified (1):**
  - `web/src/features/groups/groupApi.ts` - Updated invalidatesTags for 4 mutations
- **RTK Query Architecture:**
  - Dashboard page uses `useGetDashboardQuery` → provides tag `{ type: 'Group', id: 'DASHBOARD' }`
  - Groups list uses `getMyGroups` → provides tag `{ type: 'Group', id: 'LIST' }`
  - Mutations must invalidate all relevant tags to trigger refetch
- **Result:** ✅ Creating/joining/updating groups now instantly updates dashboard without manual refresh
- **Compilation:** ✅ Frontend compiles successfully

## 2025-01-XX (Group Dashboard Enhancements - COMPLETE ✅)
- **Goal:** Improve group details page navigation and enable inline editing
- **Changes:**
  - Fixed back button to navigate to `/dashboard` instead of browser history
  - Added inline edit mode for all group fields (name, description, avatarUrl, category)
  - Edit mode only visible to admins with "Edit Group" button
  - Form includes Save/Cancel buttons with loading states
  - Category dropdown with emoji labels (home, work, school, personal, hobbies, fitness, finance)
  - Real-time updates via RTK Query mutation
  - Toast notifications for success/error feedback
- **Frontend Files Modified (1):**
  - `web/src/features/groups/pages/GroupDashboardPage.tsx` - Added edit state, handlers, and conditional UI
- **Features Added:**
  - Inline editing toggle (isEditing state)
  - Edit form with controlled inputs for all fields
  - handleStartEdit: Populates form with current group data
  - handleSaveEdit: Calls useUpdateGroupMutation with validation
  - handleCancelEdit: Resets form and exits edit mode
- **UX Improvements:**
  - Back button text changed to "Back to Dashboard" for clarity
  - Edit button appears next to "Manage Members" for admins
  - Fields disabled during save operation
  - Save button disabled if name is empty
- **Compilation:** ✅ Frontend compiles successfully

## 2025-01-XX (Create Group Simplification - COMPLETE ✅)
- **Goal:** Simplify group creation UX by removing unnecessary fields and adding categorization
- **Changes:**
  - Removed language selection field (rely on i18n)
  - Removed timezone selection field (use browser locale, store UTC)
  - Added category dropdown with 8 predefined options (home, work, school, personal, hobbies, fitness, finance, custom)
  - Added custom category text input with validation (required, max 30 chars)
- **Frontend Files Modified (8):**
  - `web/src/features/groups/pages/CreateGroupPage.tsx` - Refactored form (removed 2 fields, added category)
  - `web/src/features/groups/pages/GroupDashboardPage.tsx` - Updated to display category
  - `web/src/types/group.ts` - Updated interfaces (CreateGroupRequest, UpdateGroupRequest, Group)
  - `web/src/features/groups/__tests__/groupSlice.test.ts` - Updated mock data
  - `web/src/features/dashboard/components/CreateTaskFromGroupModal.tsx` - Updated mock group
  - `web/src/features/groups/components/InviteForm.tsx` - Removed unused parameter
  - `web/src/features/groups/components/MembersModal.tsx` - Code cleanup
  - `web/src/features/groups/groupApi.ts` - Removed unused import
- **Backend Files Modified (4):**
  - `backend/src/TasksTracker.Api/Features/Groups/Models/GroupModels.cs` - Updated DTOs with category field, validation [StringLength(30)]
  - `backend/src/TasksTracker.Api/Core/Domain/Group.cs` - BSON mapping updated: `[BsonElement("category")]`, default "home"
  - `backend/src/TasksTracker.Api/Features/Groups/Extensions/GroupMappingExtensions.cs` - Updated all 3 mappings (ToGroupResponse, ToGroup, UpdateFrom)
  - `backend/tests/TasksTracker.Api.Tests/Groups/GroupServiceTests.cs` - Updated test data with category field
- **Database Model:**
  - ✅ MongoDB Group document now has `category` field with default "home"
  - ✅ Removed `timezone` and `language` fields from BSON mapping
  - ✅ No index changes needed (no indexes on removed fields)
  - ✅ Backward compatible: existing groups will use default, new groups will have category
- **Verification:**
  - ✅ Frontend compiles successfully
  - ✅ Backend API compiles successfully
  - ✅ No references to language/timezone in Group-related code
  - ✅ Category field properly validated (required, max 30 chars)
  - ✅ All mapping layers updated (Controller → Service → Repository → MongoDB)
- **Documentation:** [docs/create-group-simplification.md](docs/create-group-simplification.md)

## 2025-12-17 (FR-026: Code-Based Invitations - COMPLETE ✅)
- **Epic:** Group Member Invitation System (Code-Based)
- **Status:** 100% complete (21 of 21 stories done)
- **Backend Files Created:**
  - `/backend/Core/Domain/CodeInvite.cs` - Entity with code, email (nullable), status, timestamps
  - `/backend/Core/Interfaces/ICodeInvitesRepository.cs` - Repository interface with 6 methods
  - `/backend/Core/Services/CodeGeneratorService.cs` - 8-char alphanumeric code generator (RNG)
  - `/backend/Infrastructure/Repositories/CodeInvitesRepository.cs` - Repository with MongoDB indexes
  - `/backend/Features/Groups/Models/CodeInviteModels.cs` - 6 DTOs (Create, Response, Redeem, List)
  - `/backend/Features/Groups/Services/ICodeInvitesService.cs` - Service interface (3 methods)
  - `/backend/Features/Groups/Services/CodeInvitesService.cs` - Full service implementation (220 lines)
  - `/backend/Features/Groups/Controllers/CodeInvitesController.cs` - Redemption controller
- **Backend Files Modified:**
  - `/backend/Features/Groups/Controllers/GroupsController.cs` - Added 2 endpoints (POST/GET code-invites)
  - `/backend/src/TasksTracker.Api/Program.cs` - DI registration + indexes initialization
- **Frontend Files Created:**
  - `/web/src/types/invite.ts` - TypeScript interfaces (6 interfaces, 5 prop types)
  - `/web/src/features/groups/components/CodeInvitationsTab.tsx` - Tab container with info banner
  - `/web/src/features/groups/components/CreateCodeInviteForm.tsx` - Form with radio buttons + copy
  - `/web/src/features/groups/components/CodeInvitationsList.tsx` - Table with copy buttons
  - `/web/src/features/groups/components/RedeemCodeInviteModal.tsx` - Modal with uppercase input
- **Frontend Files Modified:**
  - `/web/src/features/groups/components/MembersModal.tsx` - Added 3rd tab "Code Invites"
  - `/web/src/features/groups/groupApi.ts` - 3 RTK Query endpoints (create, get, redeem)
  - `/web/src/app/api/apiSlice.ts` - Added 'CodeInvite' tag type
- **Database:** Separate `codeInvites` collection with 3 indexes (code unique, groupId+status, groupId+createdAt)
- **Stories Completed:** All 21 (9 frontend + 12 backend)
- **Total Lines:** ~1,500 lines of production code
- **Documentation:** [docs/FR-026/progress.md](docs/FR-026/progress.md), [docs/FR-026/design.md](docs/FR-026/design.md), [docs/FR-026/workplan.md](docs/FR-026/workplan.md)

## 2025-12-17 (FR-024: Backend fix + API wiring)
- Fixed backend build by cleaning duplicated/corrupted DashboardService implementation.
- Verified solution builds (0 errors) via dotnet build.
- Added web endpoint: web/src/features/dashboard/api/dashboardApi.ts (RTK Query via apiSlice).
- Switched DashboardPage to use /api/dashboard instead of mock data.
- Verified frontend bundles with npx vite build.

## 2025-12-17 (FR-024: Groups Dashboard - Sprint 1)
- **Epic:** Groups Overview & Task Creation Dashboard (Frontend Foundation)
- **Sprint 1 Progress:** 87.5% complete (7 of 8 stories done)
- **Files Created:**
  - `/web/src/types/dashboard.ts` - TypeScript types for dashboard (MemberSummary, GroupCardDto, DashboardResponse)
  - `/web/src/features/dashboard/components/MemberAvatarStack.tsx` - Avatar stack with crown badges (150 lines)
  - `/web/src/features/dashboard/components/GroupCard.tsx` - Group card component (192 lines)
  - `/web/src/features/dashboard/components/GroupCardSkeleton.tsx` - Loading skeleton (40 lines)
  - `/web/src/features/dashboard/components/EmptyGroupsState.tsx` - Empty state UI (80 lines)
  - `/web/src/features/dashboard/components/CreateTaskFromGroupModal.tsx` - Task creation modal (140 lines)
  - `/web/src/features/dashboard/components/MemberListModal.tsx` - Member list with search (240 lines)
  - `/web/src/features/dashboard/hooks/useMockDashboard.ts` - Mock data hook (110 lines)
- **Files Refactored:**
  - `/web/src/features/dashboard/pages/DashboardPage.tsx` - Replaced welcome page with groups grid (180 lines)
- **Stories Completed:**
  - ✅ US-024-01: Group Card Component
  - ✅ US-024-02: Member Avatar Stack Component
  - ✅ US-024-03: Groups Dashboard Page Container
  - ✅ US-024-04: Skeleton & Empty States
  - ✅ US-024-06: Task Creation Modal from Group Card
  - ✅ US-024-07: Task API Integration (verified existing API)
  - ✅ US-024-08: Member List Expansion Modal
- **Pending:** US-024-05 (Accessibility Audit)
- **Total Lines:** ~1,200 lines of production code
- **Documentation:** [docs/FR-024/progress.md](docs/FR-024/progress.md), [docs/FR-024/workplan.md](docs/FR-024/workplan.md), [docs/FR-024/design.md](docs/FR-024/design.md)

## 2025-12-15 (UI Consolidation)
- Consolidated task forms: Dashboard now uses production `web/src/components/CreateTaskForm.tsx`.
- Removed old form usage and updated toasts (centralized) with i18n strings.
- Added empty-state handling for member dropdown; disabled submit when no members.
## 2025-12-15
# Progress - 2025-12-15
## FR-004: Task Library - Epic E4 Complete (Testing & Data Seeding)

### Backend Unit Tests

### Backend Integration Tests

### System Template Seeding
	- Idempotent seeding (checks if templates exist before seeding)
	- Category name-to-ID mapping
	- String-to-enum frequency conversion
	- Error handling and comprehensive logging

### Files Created

### Test Summary

### Status
 Implemented FR-005 (initial backend): added `TaskItem` domain, `ITaskRepository` + `TaskRepository`, `ITaskService` + `TaskService`, and `TasksController` POST create endpoint with admin validation.
 
 Added workplans:
 - FR-005: [docs/FR-005/workplan.md](docs/FR-005/workplan.md)
 - FR-006: [docs/FR-006/workplan.md](docs/FR-006/workplan.md)
 - FR-007: [docs/FR-007/workplan.md](docs/FR-007/workplan.md)
 - FR-008: [docs/FR-008/workplan.md](docs/FR-008/workplan.md)
 - FR-009: [docs/FR-009/workplan.md](docs/FR-009/workplan.md)
 - FR-010: [docs/FR-010/workplan.md](docs/FR-010/workplan.md)
	- FR-011: [docs/FR-011/workplan.md](docs/FR-011/workplan.md)
	- FR-012: [docs/FR-012/workplan.md](docs/FR-012/workplan.md)
	- FR-013: [docs/FR-013/workplan.md](docs/FR-013/workplan.md)
	- FR-014: [docs/FR-014/workplan.md](docs/FR-014/workplan.md)
	- FR-015: [docs/FR-015/workplan.md](docs/FR-015/workplan.md)
    - FR-016: [docs/FR-016/workplan.md](docs/FR-016/workplan.md)
	    - FR-017: [docs/FR-017/workplan.md](docs/FR-017/workplan.md)
        - FR-018: [docs/FR-018/workplan.md](docs/FR-018/workplan.md)
        - FR-019: [docs/FR-019/workplan.md](docs/FR-019/workplan.md)
        - FR-020: [docs/FR-020/workplan.md](docs/FR-020/workplan.md)
        - FR-021: [docs/FR-021/workplan.md](docs/FR-021/workplan.md)
        - FR-022: [docs/FR-022/workplan.md](docs/FR-022/workplan.md)
        - FR-023: [docs/FR-023/workplan.md](docs/FR-023/workplan.md)
 Registered repository/service in DI and verified build passes.


## 2025-12-15 (UI/UX Enhancements)
- Added global Toaster component [web/src/components/Toaster.tsx](web/src/components/Toaster.tsx) rendering notifications slice toasts with framer-motion.
- Integrated Toaster at app root in [web/src/App.tsx](web/src/App.tsx).
- Enhanced [web/src/components/CreateTaskForm.tsx](web/src/components/CreateTaskForm.tsx) with shake animation on validation errors.
- Upgraded [web/src/components/Modal.tsx](web/src/components/Modal.tsx) to use framer-motion AnimatePresence for smooth transitions.
---


## FR-004: Task Library - Epic E3 Complete (Admin Template Management UI)

### Frontend Admin UI
- Created TemplateForm component supporting create/edit modes with validation (react-hook-form)
- Built DeleteTemplateModal with keyboard navigation (ESC, focus trap) and confirmation workflow
- Implemented TemplateManagement page with template list, search/filters, and CRUD operations
- Added routing to App.tsx: `/groups/:groupId/templates` for admin template management
- Installed react-hook-form dependency for form state management
- All components follow existing Tailwind CSS patterns and are mobile-responsive

### Features Implemented
- US-010: Create custom template form with category selection, difficulty slider, frequency dropdown
- US-011: Edit mode for group templates (system templates show read-only warning)
- US-012: Delete confirmation modal with soft delete support
- US-013: Dedicated management page with system/custom template separation

### Files Created
- web/src/features/templates/components/TemplateForm.tsx
- web/src/features/templates/components/DeleteTemplateModal.tsx
- web/src/features/templates/pages/TemplateManagement.tsx

### Status
Epic E3 complete. Ready for Epic E4 (Testing & Data Seeding).

---

## FR-004: Task Library - Epic E2 Complete (Backend Template Management)

### Backend Implementation
- Created TaskTemplate domain model with TaskFrequency enum, validation attributes, soft delete support
- Implemented ITemplateRepository with CRUD operations, compound MongoDB indexes, soft delete handling
- Built TemplateService with business logic: admin authorization, category validation, duplicate name checking, system template protection
- Created TemplatesController with 5 REST endpoints (GET list, GET by ID, POST create, PUT update, DELETE soft delete)
- Registered TemplateRepository and TemplateService in Program.cs dependency injection
- All endpoints require JWT authentication with admin role for mutations

### Integration Guide
- Created task-template-integration-guide.md documenting how to extend Task entity when implemented
- Includes domain model changes (TemplateId, TemplateName fields), service logic, error handling, test cases
- US-009 blocked until Task feature (FR-001) is implemented

### Files Created
- backend/src/TasksTracker.Api/Core/Domain/TaskTemplate.cs
- backend/src/TasksTracker.Api/Core/Interfaces/ITemplateRepository.cs
- backend/src/TasksTracker.Api/Infrastructure/Repositories/TemplateRepository.cs
- backend/src/TasksTracker.Api/Features/Templates/Models/TemplateModels.cs
- backend/src/TasksTracker.Api/Features/Templates/Extensions/TemplateExtensions.cs
- backend/src/TasksTracker.Api/Features/Templates/Services/ITemplateService.cs
- backend/src/TasksTracker.Api/Features/Templates/Services/TemplateService.cs
- backend/src/TasksTracker.Api/Features/Templates/Controllers/TemplatesController.cs
- docs/task-template-integration-guide.md

### Status
Epic E2 complete. Ready for Epic E3 (Admin Template Management UI) and Epic E4 (Testing & Data Seeding).

---

## Epic E3: Testing & Quality Assurance (Previous Work)

- Added backend xUnit test project: backend/tests/TasksTracker.Api.Tests
- Installed test dependencies: xUnit, FluentAssertions, Moq, Microsoft.NET.Test.Sdk, coverlet.collector
- Wrote unit tests for GroupService (create, auth checks, update/delete rules)
- Wrote unit tests for InvitationService (validate code, build URL from config)
- Registered test project in solution and verified tests pass (9 tests)
- Verified existing frontend Vitest suite passes (28 tests)
 - Added RTL tests: GroupSelector (empty state, list render) and CreateGroupPage (validation, submit success)
 - Polyfilled ResizeObserver for JSDOM via web/src/test/setup.ts and configured Vitest setupFiles
 - Frontend tests now: 32 passing

### Integration
- Added integration tests project: backend/tests/TasksTracker.Api.IntegrationTests
- Introduced partial Program for WebApplicationFactory
- Implemented CustomWebApplicationFactory with TestAuthHandler and mocked IGroupService
- Added tests: /health returns healthy; GET /api/Groups returns mocked empty list
- All integration tests passing (2 tests)

### CI & Coverage
- Updated CI workflow (.github/workflows/ci.yml) to collect and upload coverage for backend (coverlet) and frontend (Vitest)
- Added frontend coverage script: `npm run test:coverage`
