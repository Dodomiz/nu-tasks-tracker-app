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
