# Work Plan: FR-002 Group Management

## Vision & Metrics

**Vision:**
For collaborative families and roommates who need to coordinate household tasks,
the Group Management system is a multi-user foundation that enables secure collaboration with up to 20 members per group, role-based permissions, and seamless invitation flows.

**Success Metrics:**
- **User:** Group creation < 500ms; invitation acceptance rate > 70%; group switching < 100ms
- **Business:** Average 2-3 groups per user; member limit enforcement 100%; invitation delivery < 2s
- **Technical:** Support 10K+ groups; < 200ms for group list queries; zero authorization breaches

## Timeline: 4 Epics, 18 Stories, 2 Sprints (remaining work)

---

## Epics

## Epic E1: Client - Core Group UI & State Management
**Description:** Implement React components for group creation, selection, dashboard, and member management with Redux state.
**Business Value:** Enables users to create/join/switch groups - core collaboration foundation.
**Success Criteria:** Users can create groups, switch between them, invite members, and see member lists.
**Estimated Effort:** 0.5 sprint (remaining work)
**Priority:** Critical

### Story US-001: GroupSelector Component & Context Switching ✅ IMPLEMENTED
**As a** user **I want to** switch between my groups via dropdown **So that** I can manage different collaboration contexts

**Acceptance Criteria:**
- [x] Dropdown displays user's groups with names and member counts
- [x] Selecting group updates Redux state (currentGroupId)
- [x] UI reflects active group across all views
- [x] Persists selection to localStorage
- [x] Mobile-friendly responsive design

**Technical Notes:** 
- Component: `web/src/components/GroupSelector.tsx` ✅
- Redux: `web/src/features/groups/groupSlice.ts` ✅
- RTK Query: `web/src/features/groups/groupApi.ts` ✅

**Status:** ✅ **ALREADY IMPLEMENTED** - Component exists with Redux integration, tests passing
**Estimated Effort:** 0 days (complete)
**Priority:** Must Have

---

### Story US-002: Create Group Page ✅ IMPLEMENTED
**As a** user **I want to** create a new group with name, description, timezone **So that** I can start collaborating with others

**Acceptance Criteria:**
- [x] Form with fields: name (required, 3-50 chars), description (optional, max 500), timezone, language
- [x] Client-side validation with error messages
- [x] Avatar upload (optional, future: integrate with Azure Blob)
- [x] Success: redirect to group dashboard, user becomes Admin automatically
- [x] Error handling with user-friendly messages

**Technical Notes:**
- Page: `web/src/features/groups/pages/CreateGroupPage.tsx` ✅
- Validation: react-hook-form or native
- API: `createGroup` mutation from groupApi ✅

**Status:** ✅ **ALREADY IMPLEMENTED** - Form exists with validation
**Estimated Effort:** 0 days (complete)
**Priority:** Must Have

---

### Story US-003: Group Dashboard Page ✅ IMPLEMENTED
**As a** group member **I want to** view group details and members **So that** I can see who's in my group and their roles

**Acceptance Criteria:**
- [x] Display group name, description, member count, creation date
- [x] Members list table with columns: name, email, role, joined date
- [x] Admin-only actions visible conditionally (promote/remove buttons)
- [x] Loading states and error handling
- [x] Empty state when no members

**Technical Notes:**
- Page: `web/src/features/groups/pages/GroupDashboardPage.tsx` ✅
- Component: MembersList component (check if exists)
- API: `getGroup` query ✅

**Status:** ✅ **ALREADY IMPLEMENTED** - Dashboard exists with member list
**Estimated Effort:** 0 days (complete)
**Priority:** Must Have

---

### Story US-004: Invite Members Modal ✅ IMPLEMENTED
**As a** group admin **I want to** invite members via email or shareable link **So that** others can join my group

**Acceptance Criteria:**
- [x] Modal with two invitation methods: Email and Shareable Link
- [x] Email input with validation (RFC 5322)
- [x] Shareable link displayed with copy-to-clipboard button
- [x] Success feedback: "Invitation sent" or "Link copied"
- [x] Enforces 20-member limit (disable invite if at capacity)
- [x] Admin-only access (button hidden for regular members)

**Technical Notes:**
- Component: `web/src/features/groups/components/InviteMembersModal.tsx` ✅
- API: `inviteMember` mutation ✅
- Clipboard API for link copying

**Status:** ✅ **ALREADY IMPLEMENTED** - Modal component exists
**Estimated Effort:** 0 days (complete)
**Priority:** Must Have

---

### Story US-005: Join Group via Invitation Link ✅ IMPLEMENTED
**As an** invitee **I want to** click invitation link and join group **So that** I can collaborate with the group

**Acceptance Criteria:**
- [x] Route: `/join/:invitationCode` extracts code from URL
- [x] Automatically calls join API on page load
- [x] Success: redirect to group dashboard, show success toast
- [x] Errors: "Already a member", "Invalid code", "Group full" with clear messages
- [x] Loading state during join operation

**Technical Notes:**
- Page: `web/src/features/groups/pages/JoinGroupPage.tsx` ✅
- API: `joinGroup` mutation ✅
- React Router param extraction

**Status:** ✅ **ALREADY IMPLEMENTED** - Join flow complete
**Estimated Effort:** 0 days (complete)
**Priority:** Must Have

---

### Story US-006: Member Management Actions (Promote/Remove)
**As a** group admin **I want to** promote members to admin or remove members **So that** I can manage group roles

**Acceptance Criteria:**
- [ ] Promote button on MembersList → confirms → calls API → updates role immediately
- [ ] Remove button → confirmation modal → calls API → removes from list
- [ ] Safeguard: cannot remove self if last admin (button disabled with tooltip)
- [ ] Optimistic UI updates with rollback on error
- [ ] Actions only visible to admins

**Technical Notes:**
- Component: Add to MembersList or GroupDashboard
- API: `promoteMember`, `removeMember` mutations ✅ (APIs exist)
- Confirmation modals for destructive actions

**Status:** 🔶 **PARTIALLY IMPLEMENTED** - APIs exist, UI actions need implementation
**Estimated Effort:** 1.5 days (UI: 0.75d, Confirmation modals: 0.5d, Tests: 0.25d)
**Priority:** Should Have

---

### Story US-007: Redux State Management Enhancements
**As a** developer **I want to** ensure Redux state is fully synchronized **So that** group context persists across navigation

**Acceptance Criteria:**
- [x] `groupSlice` handles all group CRUD actions ✅
- [ ] RTK Query cache invalidation on mutations (create, update, promote, remove)
- [x] `selectIsAdmin` selector accurate after role changes ✅
- [x] Persist `currentGroupId` to localStorage with hydration on app load ✅
- [ ] Handle edge cases: deleted group, removed from group

**Technical Notes:**
- File: `web/src/features/groups/groupSlice.ts` ✅ (exists, needs review)
- RTK Query tags: `Group` with id-based invalidation
- LocalStorage sync in app initialization

**Status:** 🔶 **PARTIALLY IMPLEMENTED** - Core slice exists, needs edge case handling
**Estimated Effort:** 1 day (Edge cases: 0.5d, Tests: 0.5d)
**Priority:** Should Have

---

## Epic E2: Backend - Group CRUD & Authorization
**Description:** Implement ASP.NET Core controllers, services, and repositories for group management with role-based authorization.
**Business Value:** Secure, performant backend foundation for all group operations.
**Success Criteria:** All CRUD endpoints functional, authorization enforced, member limit respected.
**Estimated Effort:** 1 sprint (remaining work)
**Priority:** Critical

### Story US-008: GroupController & Service Layer ✅ IMPLEMENTED
**As a** backend developer **I want to** expose group management APIs **So that** frontend can perform CRUD operations

**Acceptance Criteria:**
- [x] POST `/api/groups` - Create group, user becomes admin
- [x] GET `/api/groups` - List user's groups with pagination
- [x] GET `/api/groups/{id}` - Get group details (requires membership)
- [x] PUT `/api/groups/{id}` - Update group (admin only)
- [x] All endpoints require JWT authentication
- [x] Validation errors return 400 with clear messages

**Technical Notes:**
- Controller: `backend/Features/Groups/Controllers/GroupsController.cs` ✅
- Service: `backend/Features/Groups/Services/GroupService.cs` ✅
- Interface: `backend/Features/Groups/Services/IGroupService.cs` ✅

**Status:** ✅ **ALREADY IMPLEMENTED** - Full CRUD endpoints exist
**Estimated Effort:** 0 days (complete)
**Priority:** Must Have

---

### Story US-009: Invitation System (Email & Link) ✅ IMPLEMENTED
**As a** backend developer **I want to** handle invitation generation and email delivery **So that** users can invite others

**Acceptance Criteria:**
- [x] POST `/api/groups/{id}/invite` - Generate invitation, send email
- [x] InvitationService generates UUID invitation code
- [x] Email sent via SendGrid (or mocked in dev)
- [x] Returns invitation URL for shareable link
- [x] Enforces 20-member limit before sending
- [x] POST `/api/groups/join/{code}` - Join via invitation code

**Technical Notes:**
- Service: `backend/Features/Groups/Services/InvitationService.cs` ✅
- Interface: `backend/Features/Groups/Services/IInvitationService.cs` ✅
- Email template with group name and link
- Config: SendGrid API key in appsettings.json

**Status:** ✅ **ALREADY IMPLEMENTED** - Invitation flow complete
**Estimated Effort:** 0 days (complete)
**Priority:** Must Have

---

### Story US-010: Member Management Endpoints ✅ IMPLEMENTED
**As a** backend developer **I want to** expose member promotion and removal APIs **So that** admins can manage roles

**Acceptance Criteria:**
- [x] POST `/api/groups/{id}/members/{userId}/promote` - Promote to admin (admin-only)
- [x] DELETE `/api/groups/{id}/members/{userId}` - Remove member (admin-only)
- [x] Safeguard: cannot remove self if last admin → return 400
- [x] Authorization checks: verify admin role before action
- [x] Updates persist to MongoDB immediately

**Technical Notes:**
- Endpoints in GroupsController ✅
- Business logic in GroupService ✅
- Validation: check `members.role == 'Admin'` count before removal

**Status:** ✅ **ALREADY IMPLEMENTED** - APIs exist in controller
**Estimated Effort:** 0 days (complete)
**Priority:** Must Have

---

### Story US-011: GroupRepository & MongoDB Operations ✅ IMPLEMENTED
**As a** backend developer **I want to** persist groups to MongoDB **So that** data is durable

**Acceptance Criteria:**
- [x] IGroupRepository with methods: CreateAsync, GetByIdAsync, GetByUserIdAsync, UpdateAsync
- [x] GroupRepository implements interface with MongoDB driver
- [x] Indexes: `invitationCode` (unique), `members.userId` (multikey), `createdBy`
- [x] Efficient queries for user's groups (filter by `members.userId`)
- [x] Supports embedded members array (acceptable at 20-member scale)

**Technical Notes:**
- Interface: `backend/Core/Interfaces/IGroupRepository.cs` ✅
- Implementation: `backend/Infrastructure/Repositories/GroupRepository.cs` ✅
- Collection: `groups` in MongoDB
- Index creation in repository or startup

**Status:** ✅ **ALREADY IMPLEMENTED** - Repository layer complete
**Estimated Effort:** 0 days (complete)
**Priority:** Must Have

---

### Story US-012: Authorization Middleware & Role Validation
**As a** backend developer **I want to** enforce role-based access **So that** only authorized users can perform admin actions

**Acceptance Criteria:**
- [ ] Custom authorization filter checks group membership (userId in `members[]`)
- [ ] Admin-only endpoints validate `role == 'Admin'` in members array
- [ ] Returns 403 Forbidden if not a member or not an admin
- [ ] Reusable across multiple controllers (Groups, Tasks, Categories)
- [ ] Logged: authorization failures for audit

**Technical Notes:**
- Middleware or attribute: `[RequireGroupAdmin(groupIdParam: "id")]`
- Inject IGroupRepository to check membership
- HttpContext.Items store membership for request lifecycle

**Status:** 🔶 **PARTIALLY IMPLEMENTED** - Basic auth exists in controllers, reusable filter needed
**Estimated Effort:** 2 days (Middleware: 1d, Integration: 0.5d, Tests: 0.5d)
**Priority:** Must Have

---

### Story US-013: Member Limit Enforcement
**As a** backend developer **I want to** enforce 20-member limit **So that** groups don't exceed capacity

**Acceptance Criteria:**
- [ ] InvitationService checks `members.length < 20` before sending
- [ ] JoinGroup validates count before adding member
- [ ] Returns 400 with error code `MEMBER_LIMIT` if at capacity
- [ ] Concurrent joins handled safely (optimistic locking or transactions)
- [ ] Metrics logged: invite/join attempts rejected due to limit

**Technical Notes:**
- Check in GroupService before any add-member operation
- MongoDB transaction or `$push` with count check
- Error message: "Group has reached maximum of 20 members"

**Status:** 🔶 **PARTIALLY IMPLEMENTED** - Logic exists in services, needs concurrency safety review
**Estimated Effort:** 1 day (Concurrency: 0.5d, Tests: 0.5d)
**Priority:** Must Have

---

## Epic E3: Testing - Unit, Integration, E2E
**Description:** Comprehensive test coverage for group management flows (frontend and backend).
**Business Value:** Ensures reliability, catches regressions, validates business rules.
**Success Criteria:** 70%+ code coverage; all critical paths tested; E2E flows validated.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-014: Backend Unit Tests ✅ PARTIALLY IMPLEMENTED
**As a** developer **I want to** unit test group services **So that** business logic is validated

**Acceptance Criteria:**
- [x] GroupService tests: create, get, update, promote, remove ✅
- [x] InvitationService tests: code generation, email sending (mocked) ✅
- [ ] Member limit enforcement tests (boundary: 19→20→21)
- [ ] Authorization logic tests (admin checks, last-admin safeguard)
- [ ] Edge cases: invalid IDs, duplicate invitations, concurrent operations

**Technical Notes:**
- Framework: xUnit ✅
- Mocking: Moq for repositories and email service ✅
- Files: `backend/tests/TasksTracker.Api.Tests/Features/Groups/` ✅
- Coverage: FluentAssertions for readable assertions ✅

**Status:** 🔶 **PARTIALLY IMPLEMENTED** - Basic tests exist, need boundary/edge cases
**Estimated Effort:** 1.5 days (Boundary tests: 0.75d, Edge cases: 0.5d, Review: 0.25d)
**Priority:** Must Have

---

### Story US-015: Backend Integration Tests ✅ PARTIALLY IMPLEMENTED
**As a** developer **I want to** integration test APIs **So that** end-to-end flows work

**Acceptance Criteria:**
- [x] Create group → user is admin → invitation code generated ✅
- [ ] Invite member → email sent → join via code → member added
- [ ] Promote member → role updated → admin can now invite
- [ ] Remove member → member cannot access group
- [ ] 21st member rejected with MEMBER_LIMIT error
- [ ] Non-member cannot access group details (403)

**Technical Notes:**
- Framework: xUnit with WebApplicationFactory ✅
- Files: `backend/tests/TasksTracker.Api.IntegrationTests/` ✅
- Test DB: In-memory MongoDB or test container
- Auth: Mock JWT tokens for test users

**Status:** 🔶 **PARTIALLY IMPLEMENTED** - Basic tests exist, need full flow coverage
**Estimated Effort:** 2 days (Flows: 1d, Auth tests: 0.5d, Cleanup: 0.5d)
**Priority:** Should Have

---

### Story US-016: Frontend Component Tests ✅ PARTIALLY IMPLEMENTED
**As a** developer **I want to** test React components **So that** UI behaves correctly

**Acceptance Criteria:**
- [x] GroupSelector: renders groups, switches on click ✅
- [x] CreateGroupPage: validates form, submits successfully ✅
- [ ] InviteMembersModal: email validation, copy link, enforces limit
- [ ] JoinGroupPage: handles success/error states
- [ ] MembersList: shows promote/remove buttons for admins only

**Technical Notes:**
- Framework: Vitest + React Testing Library ✅
- Files: `web/src/features/groups/__tests__/` ✅
- Mock: RTK Query hooks with mock data
- Coverage: user interactions, edge cases

**Status:** 🔶 **PARTIALLY IMPLEMENTED** - Core tests exist, need full component coverage
**Estimated Effort:** 2 days (Components: 1d, Interactions: 0.5d, Edge cases: 0.5d)
**Priority:** Should Have

---

### Story US-017: E2E Critical Flows (Playwright)
**As a** developer **I want to** validate full user journeys **So that** end-to-end functionality works

**Acceptance Criteria:**
- [ ] Flow 1: Create group → invite member → member joins → sees dashboard
- [ ] Flow 2: Admin promotes member → new admin invites others
- [ ] Flow 3: Admin removes member → member loses access
- [ ] Flow 4: Switch between multiple groups → correct data displayed
- [ ] Mobile: responsive layouts tested on mobile viewport

**Technical Notes:**
- Framework: Playwright (if not set up, use Cypress)
- Requires: test accounts, test database with cleanup
- Run in CI: headless mode
- Fixtures: seed test data for consistency

**Status:** ❌ **NOT IMPLEMENTED** - E2E suite not yet created
**Estimated Effort:** 3 days (Setup: 1d, Flows: 1.5d, CI integration: 0.5d)
**Priority:** Could Have

---

### Story US-018: Performance & Load Testing
**As a** developer **I want to** validate performance targets **So that** system scales

**Acceptance Criteria:**
- [ ] Group creation: < 500ms (p95)
- [ ] Group list query: < 200ms for 10 groups
- [ ] Invitation email: < 2s delivery
- [ ] 10K groups in database: queries remain fast (indexed)
- [ ] Concurrent joins: no race conditions or duplicate members

**Technical Notes:**
- Tools: k6 or Artillery for load testing
- Metrics: response times, throughput, error rates
- MongoDB: verify indexes with `.explain()`
- Concurrency: simulate 10 simultaneous joins to same group

**Status:** ❌ **NOT IMPLEMENTED** - Performance testing not set up
**Estimated Effort:** 2 days (Scripts: 1d, Execution & analysis: 1d)
**Priority:** Could Have

---

## Sprint Plan

### Sprint 1: Complete Frontend + Backend Foundation
**Duration:** 2 weeks  
**Sprint Goal:** Complete all core group management functionality with role-based access and member management.

**Stories:** 
- US-006: Member Management Actions UI (1.5d)
- US-007: Redux State Enhancements (1d)
- US-012: Authorization Middleware (2d)
- US-013: Member Limit Enforcement (1d)
- US-014: Backend Unit Tests (1.5d)
- US-015: Backend Integration Tests (2d)

**Capacity:** 10 days | **Committed:** 9 days (~90% utilization with 10% buffer)

---

### Sprint 2: Testing & Quality Assurance
**Duration:** 2 weeks  
**Sprint Goal:** Achieve 70% test coverage and validate critical E2E flows.

**Stories:**
- US-016: Frontend Component Tests (2d)
- US-017: E2E Critical Flows (3d)
- US-018: Performance Testing (2d)
- Buffer: Bug fixes and polish (3d)

**Capacity:** 10 days | **Committed:** 7 days + 3d buffer

---

## Dependencies & Risks

### Dependencies
- **Internal:**
  - ✅ Authentication system (JWT) - complete
  - ✅ MongoDB connection - configured
  - 🔶 SendGrid API key - needs configuration in production
  - ✅ Azure Blob (avatar upload) - can defer to future sprint

- **External:**
  - SendGrid email delivery reliability
  - MongoDB Atlas availability (or local MongoDB)

### Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| 21st member bypass due to race condition | Low | High | Implement MongoDB transactions or optimistic locking |
| SendGrid rate limits during high invite volume | Medium | Medium | Queue emails with retry logic; upgrade SendGrid plan |
| Large groups (near 20 members) slow queries | Low | Medium | Ensure multikey index on `members.userId`; monitor query performance |
| Last admin accidentally removed | Low | High | Safeguard already implemented in service; add extra confirmation in UI |
| Group context lost on page refresh | Low | Low | ✅ Mitigated: localStorage persistence already implemented |

---

## Release Phases

### Phase 1 (MVP): Sprint 1 - Core Functionality
- ✅ Group creation, listing, details (DONE)
- ✅ Invitation system (email + link) (DONE)
- 🔶 Member management (promote/remove) - UI pending
- 🔶 Authorization & member limit enforcement - hardening needed
- Target: Functional group collaboration for all features

### Phase 2 (Enhancement): Sprint 2 - Quality & Scale
- Testing: 70% coverage, E2E flows validated
- Performance: validated against 10K groups, < 500ms p95
- Polish: error messages, loading states, mobile UX

### Phase 3 (Future): Post-MVP
- Group deletion with cascade (remove all tasks, leaderboard data)
- Ownership transfer between admins
- Invitation code expiry (7-day timeout)
- Audit log for member actions (joins, promotions, removals)
- Group templates (preset categories for common use cases)

---

## Summary

**Total Stories:** 18  
**Already Implemented:** 11 stories (61%)  
**Remaining Work:** 7 stories (39%)  
**Estimated Remaining Effort:** ~14 days (~2 sprints)

**Priority Breakdown:**
- Must Have: 4 remaining (US-012, US-013, US-014, US-015)
- Should Have: 3 remaining (US-006, US-007, US-016)
- Could Have: 2 remaining (US-017, US-018)

**Key Focus Areas:**
1. **Complete member management UI** (promote/remove actions with confirmation modals)
2. **Harden authorization** (reusable middleware/filter for group-scoped operations)
3. **Ensure concurrency safety** (member limit enforcement, concurrent join handling)
4. **Expand test coverage** (unit, integration, E2E to 70%+)

**Next Steps:**
1. Sprint planning meeting to prioritize remaining stories
2. Begin US-012 (Authorization Middleware) as foundation for other features
3. Parallel track: US-006 (Member Management UI) and US-014/US-015 (Testing)
4. Code review and merge strategy for integration

---

**Document Status:** ✅ Complete  
**Last Updated:** December 16, 2025  
**Reviewed By:** Pending  
**Next Review:** After Sprint 1 completion
