# Work Plan: Group Management (FR-002)

**Based on:** [design-group-management.md](design-group-management.md)  
**Created:** December 15, 2025  
**Target:** MVP Release  
**Strategy:** Frontend-first, then Backend, then Testing

---

## Vision & Metrics

**Vision:**
```
For NU users who need to collaborate with family, friends, or coworkers,
Group Management is a social coordination feature that enables
up to 20 members to share tasks, compete on leaderboards, and 
organize races together in isolated group spaces.
```

**Success Metrics:**

**User Metrics:**
- Group creation success rate: >95%
- Average groups per user: 2-3
- Invitation acceptance rate: >70% within 48 hours
- Group switching latency: <100ms

**Business Metrics:**
- % of users in at least one group: >60% within 30 days
- Multi-group adoption: >30% of users join 2+ groups
- Group retention: >80% of groups active after 30 days

**Technical Metrics:**
- Member limit enforcement: 100% (hard constraint)
- API response time: <500ms for group creation, <200ms for list
- Test coverage: >70% for group features
- Zero data leakage between groups

---

## Timeline Overview

**Total Scope:** 3 Epics, 18 User Stories, ~3-4 Sprints (6-8 weeks)

**Epic Breakdown:**
1. **Epic E1:** Frontend Foundation & Group UI (7 stories, 11.5 days)
2. **Epic E2:** Backend API & Data Layer (8 stories, 12 days)
3. **Epic E3:** Testing & Quality Assurance (3 stories, 6 days)

**Total Estimated Effort:** 29.5 days (with AI assistance + 20% buffer)

---

## Epic E1: Frontend Foundation & Group UI

**Description:** Build complete React UI for group management including state management, navigation, and all user-facing components.

**Business Value:** Users can interact with groups immediately; enables early UI/UX validation before backend investment.

**Success Criteria:**
- All group UI components render correctly
- Redux state management functional
- Mock API integration ready for backend connection
- Responsive design with RTL support
- Accessible (WCAG 2.1 AA)

**Estimated Effort:** 1.5 sprints (~11.5 days)  
**Priority:** Critical

---

### Story US-E1-001: Redux Group State Management

**As a** developer **I want to** implement Redux groupSlice **So that** group state is centralized and persistent

**Acceptance Criteria:**
- [ ] groupSlice created with state: `currentGroupId`, `groups[]`, `currentGroup`, `loading`, `error`
- [ ] Actions: `setCurrentGroup`, `addGroup`, `updateGroup`, `removeGroup`, `setGroups`
- [ ] Selectors: `selectCurrentGroup`, `selectGroups`, `selectCurrentGroupId`, `selectIsAdmin`
- [ ] State persisted to localStorage via redux-persist
- [ ] TypeScript types defined for Group, Member, Role enums

**Technical Notes:**
- Use Redux Toolkit `createSlice`
- Follow existing authSlice pattern
- Add to store configuration in `app/store.ts`

**Dependencies:** None

**Estimated Effort:** 1 day (slice: 0.5d, types: 0.25d, tests: 0.25d)

**Priority:** Must Have

---

### Story US-E1-002: RTK Query Group API Endpoints

**As a** developer **I want to** define RTK Query endpoints for groups **So that** frontend can call group APIs

**Acceptance Criteria:**
- [ ] `groupApi` injected into `apiSlice` with endpoints:
  - `getMyGroups: query<GroupsResponse, void>`
  - `getGroup: query<GroupResponse, string>`
  - `createGroup: mutation<GroupResponse, CreateGroupRequest>`
  - `inviteMember: mutation<InviteResponse, InviteMemberRequest>`
  - `joinGroup: mutation<GroupResponse, string>`
  - `promoteMember: mutation<void, PromoteMemberRequest>`
  - `removeMember: mutation<void, RemoveMemberRequest>`
- [ ] TypeScript interfaces match backend DTOs
- [ ] Tag invalidation configured for cache updates
- [ ] Mock API responses for development

**Technical Notes:**
- Use `injectEndpoints` pattern
- Add `providesTags` and `invalidatesTags` for optimistic updates
- Create mock handlers in MSW for development

**Dependencies:** US-E1-001

**Estimated Effort:** 1.5 days (endpoints: 0.75d, types: 0.5d, mocks: 0.25d)

**Priority:** Must Have

---

### Story US-E1-003: Group Selector Component

**As a** user **I want to** switch between groups via dropdown **So that** I can access different group contexts

**Acceptance Criteria:**
- [ ] Dropdown displays user's groups with name and avatar
- [ ] Current group highlighted
- [ ] Clicking group dispatches `setCurrentGroup` action
- [ ] Dropdown positioned in app header/navigation
- [ ] Loading state while fetching groups
- [ ] Empty state: "Create your first group" with CTA button
- [ ] Accessible keyboard navigation (arrow keys, Enter, Escape)
- [ ] RTL support for Hebrew

**Technical Notes:**
- Use Headless UI `Listbox` for accessibility
- Tailwind styling consistent with LanguageSelector
- Hook: `useAppSelector(selectGroups)`

**Dependencies:** US-E1-001, US-E1-002

**Estimated Effort:** 1.5 days (component: 0.75d, styling: 0.5d, accessibility: 0.25d)

**Priority:** Must Have

---

### Story US-E1-004: Create Group Page

**As a** user **I want to** create a new group **So that** I can invite members and collaborate

**Acceptance Criteria:**
- [ ] Form with fields: name (required, 3-50 chars), description (optional, max 500), timezone (dropdown), language (EN/HE)
- [ ] Avatar upload placeholder (future: Azure Blob integration)
- [ ] Client-side validation with error messages
- [ ] Submit calls `createGroup` mutation
- [ ] Success: redirect to `/groups/{id}/dashboard`
- [ ] Error: display API error message
- [ ] Form reset after successful submission
- [ ] Responsive layout, RTL support

**Technical Notes:**
- Use React Hook Form for validation
- Timezone dropdown: `Intl.supportedValuesOf('timeZone')`
- Follow existing form patterns (LoginPage, RegisterPage)

**Dependencies:** US-E1-002

**Estimated Effort:** 2 days (form: 1d, validation: 0.5d, integration: 0.5d)

**Priority:** Must Have

---

### Story US-E1-005: Group Dashboard Page

**As a** user **I want to** view group overview **So that** I can see members, settings, and quick actions

**Acceptance Criteria:**
- [ ] Displays group name, description, avatar, member count
- [ ] Shows member list (name, avatar, role, joined date)
- [ ] Admin sees "Invite Members" button
- [ ] Admin sees promote/remove actions per member
- [ ] Regular users see read-only view
- [ ] Loading state while fetching group details
- [ ] Error state if group not found or unauthorized
- [ ] Responsive grid layout, RTL support

**Technical Notes:**
- Route: `/groups/:groupId/dashboard`
- Hook: `useGetGroupQuery(groupId)`
- Conditional rendering based on `myRole` from GroupResponse

**Dependencies:** US-E1-002

**Estimated Effort:** 2 days (layout: 1d, conditional logic: 0.5d, styling: 0.5d)

**Priority:** Must Have

---

### Story US-E1-006: Invite Members Modal

**As an** admin **I want to** invite members via email or link **So that** I can grow my group

**Acceptance Criteria:**
- [ ] Modal with two tabs: "Email Invite" and "Shareable Link"
- [ ] Email tab: input field, "Send Invitation" button
- [ ] Email validation (RFC 5322)
- [ ] Success toast: "Invitation sent to {email}"
- [ ] Link tab: displays invitation URL with "Copy Link" button
- [ ] Click copies URL to clipboard, shows "Copied!" feedback
- [ ] Modal closes on Escape or backdrop click
- [ ] Error handling: member limit reached, already a member
- [ ] Only visible to Admins

**Technical Notes:**
- Use Headless UI `Dialog` for modal
- Clipboard API: `navigator.clipboard.writeText(url)`
- Hooks: `useInviteMemberMutation`, `useGetGroupQuery` for invitation code

**Dependencies:** US-E1-002, US-E1-005

**Estimated Effort:** 2 days (modal: 0.75d, tabs: 0.5d, clipboard: 0.25d, validation: 0.5d)

**Priority:** Must Have

---

### Story US-E1-007: Join Group via Invitation Page

**As a** user **I want to** join group via invitation link **So that** I can become a member

**Acceptance Criteria:**
- [ ] Route: `/groups/join/:invitationCode`
- [ ] Displays group name, description, member count (preview before joining)
- [ ] "Join Group" button calls `joinGroup` mutation
- [ ] Success: redirect to `/groups/{id}/dashboard`
- [ ] Error states:
  - Invalid code: "Invitation link is invalid"
  - Already member: "You're already in this group" with link to dashboard
  - Member limit: "Group is full (20/20 members)"
- [ ] Loading state during join operation
- [ ] Not authenticated: redirect to login with return URL

**Technical Notes:**
- Extract code from URL params: `useParams<{ invitationCode }>()`
- Hook: `useJoinGroupMutation()`
- Optimistic update: add group to Redux state immediately

**Dependencies:** US-E1-002

**Estimated Effort:** 1.5 days (page: 0.75d, error handling: 0.5d, auth redirect: 0.25d)

**Priority:** Must Have

---

## Epic E2: Backend API & Data Layer

**Description:** Implement .NET backend with MongoDB for group management, including all CRUD operations, invitation system, and member management.

**Business Value:** Enables persistent group data, multi-user collaboration, and secure authorization.

**Success Criteria:**
- All API endpoints functional and documented
- MongoDB schema with indexes
- Member limit enforcement (100%)
- Email invitations via SendGrid
- Authorization middleware validates group membership
- API response times: <500ms create, <200ms list

**Estimated Effort:** 1.5 sprints (~12 days)  
**Priority:** Critical

---

### Story US-E2-001: MongoDB Group Schema & Repository

**As a** developer **I want to** define Group entity and repository **So that** groups are persisted to MongoDB

**Acceptance Criteria:**
- [ ] `Group` entity class with properties: Id, Name, Description, AvatarUrl, Timezone, Language, InvitationCode, CreatedBy, Members[], Settings, CreatedAt, UpdatedAt, SchemaVersion
- [ ] `Member` embedded type: UserId, Role (enum), JoinedAt, InvitedBy
- [ ] `GroupRepository` with methods:
  - `CreateAsync(Group)`
  - `GetByIdAsync(string id)`
  - `GetByInvitationCodeAsync(string code)`
  - `GetUserGroupsAsync(string userId)`
  - `UpdateAsync(Group)`
  - `DeleteAsync(string id)` (soft delete)
- [ ] Indexes: `InvitationCode` (unique), `Members.UserId` (multikey), `CreatedBy`
- [ ] Repository registered in DI container

**Technical Notes:**
- Use MongoDB.Driver with `IMongoCollection<Group>`
- Follow existing UserRepository pattern
- Primary constructor for DI

**Dependencies:** None

**Estimated Effort:** 2 days (entity: 0.5d, repository: 1d, indexes: 0.25d, DI: 0.25d)

**Priority:** Must Have

---

### Story US-E2-002: Group DTOs & Mapping

**As a** developer **I want to** define request/response DTOs **So that** API contracts are type-safe

**Acceptance Criteria:**
- [ ] DTOs created:
  - `CreateGroupRequest` (Name, Description, AvatarUrl, Timezone, Language)
  - `UpdateGroupRequest` (same as Create)
  - `GroupResponse` (Id, Name, Description, AvatarUrl, Timezone, Language, InvitationCode, MemberCount, Members[], MyRole, CreatedAt)
  - `MemberDto` (UserId, FirstName, LastName, Email, Role, JoinedAt)
  - `InviteMemberRequest` (Email)
  - `InviteResponse` (Message, InvitationUrl)
  - `GroupsResponse` (Groups[], Total)
- [ ] Mapping extension methods: `ToGroupResponse(Group, string userId)`
- [ ] Validation attributes on DTOs (e.g., `[Required]`, `[StringLength]`)

**Technical Notes:**
- Place in `Features/Groups/Models/`
- Use record types for immutability
- Follow existing auth DTOs pattern

**Dependencies:** US-E2-001

**Estimated Effort:** 1 day (DTOs: 0.5d, mapping: 0.25d, validation: 0.25d)

**Priority:** Must Have

---

### Story US-E2-003: GroupService - CRUD Operations

**As a** developer **I want to** implement GroupService **So that** business logic is centralized

**Acceptance Criteria:**
- [ ] `GroupService` with methods:
  - `CreateGroupAsync(CreateGroupRequest, string userId)` - generates UUID invitation code, adds creator as Admin
  - `GetGroupAsync(string groupId, string userId)` - validates membership
  - `GetUserGroupsAsync(string userId)` - returns user's groups
  - `UpdateGroupAsync(string groupId, UpdateGroupRequest, string userId)` - Admin only
  - `DeleteGroupAsync(string groupId, string userId)` - Admin only (future)
- [ ] Validation logic:
  - Name length (3-50 chars)
  - Member is in group before returning data
  - Only Admins can update/delete
- [ ] Generates UUID v4 for invitation code
- [ ] Service registered in DI

**Technical Notes:**
- Use `Guid.NewGuid().ToString()` for invitation code
- Inject `IGroupRepository`, `ILogger<GroupService>`
- Primary constructor

**Dependencies:** US-E2-001, US-E2-002

**Estimated Effort:** 2 days (CRUD: 1.25d, validation: 0.5d, DI: 0.25d)

**Priority:** Must Have

---

### Story US-E2-004: InvitationService & Email Integration

**As a** developer **I want to** implement invitation system **So that** users can invite via email

**Acceptance Criteria:**
- [ ] `InvitationService` with methods:
  - `SendInvitationAsync(string email, string groupName, string invitationCode)`
  - `ValidateInvitationCodeAsync(string code)` - checks if code exists
- [ ] Email template with:
  - Group name
  - Invitation link: `{frontendUrl}/groups/join/{code}`
  - Sender name (who invited)
- [ ] `EmailServerAccess` extended (or reused from existing)
- [ ] SendGrid integration configured in appsettings.json
- [ ] Async email sending (fire-and-forget, log failures)

**Technical Notes:**
- Use SendGrid SDK: `SendGridClient`
- Email template: HTML with responsive design
- Config keys: `SendGrid:ApiKey`, `SendGrid:FromEmail`, `App:FrontendUrl`

**Dependencies:** US-E2-001

**Estimated Effort:** 1.5 days (service: 0.75d, email template: 0.5d, config: 0.25d)

**Priority:** Must Have

---

### Story US-E2-005: GroupController - Group CRUD Endpoints

**As a** developer **I want to** implement group CRUD endpoints **So that** frontend can manage groups

**Acceptance Criteria:**
- [ ] Endpoints implemented:
  - `POST /api/groups` → CreateGroupAsync (JWT required)
  - `GET /api/groups` → GetUserGroupsAsync (JWT required, pagination)
  - `GET /api/groups/{id}` → GetGroupAsync (JWT required, membership validated)
  - `PUT /api/groups/{id}` → UpdateGroupAsync (JWT + Admin role)
  - `DELETE /api/groups/{id}` → DeleteGroupAsync (JWT + Admin role, future)
- [ ] Request validation in controller
- [ ] Authorization checks for Admin actions
- [ ] Error responses: 400 (validation), 403 (forbidden), 404 (not found)
- [ ] Swagger documentation with examples

**Technical Notes:**
- Use `[Authorize]` attribute
- HttpContext.User.FindFirst(ClaimTypes.NameIdentifier) for userId
- Follow existing AuthController pattern

**Dependencies:** US-E2-003

**Estimated Effort:** 1.5 days (endpoints: 1d, validation: 0.25d, Swagger: 0.25d)

**Priority:** Must Have

---

### Story US-E2-006: GroupController - Invitation Endpoints

**As a** developer **I want to** implement invitation endpoints **So that** users can invite and join

**Acceptance Criteria:**
- [ ] Endpoints implemented:
  - `POST /api/groups/{id}/invite` → InviteMemberAsync (JWT + Admin)
  - `POST /api/groups/join/{code}` → JoinGroupAsync (JWT required)
- [ ] Invite endpoint:
  - Validates admin role
  - Checks member count < 20
  - Sends email via InvitationService
  - Returns invitation URL
- [ ] Join endpoint:
  - Validates invitation code
  - Checks if user already member
  - Checks member count < 20
  - Adds user as RegularUser
  - Returns GroupResponse
- [ ] Error handling: member limit, already member, invalid code

**Technical Notes:**
- Extract userId from JWT claims
- Use optimistic concurrency for member array updates
- Log invitation sends for audit

**Dependencies:** US-E2-003, US-E2-004

**Estimated Effort:** 2 days (invite: 1d, join: 0.75d, validation: 0.25d)

**Priority:** Must Have

---

### Story US-E2-007: GroupController - Member Management Endpoints

**As a** developer **I want to** implement member promote/remove endpoints **So that** admins can manage roles

**Acceptance Criteria:**
- [ ] Endpoints implemented:
  - `POST /api/groups/{id}/members/{userId}/promote` → PromoteMemberAsync (JWT + Admin)
  - `DELETE /api/groups/{id}/members/{userId}` → RemoveMemberAsync (JWT + Admin)
- [ ] Promote:
  - Updates member role to Admin
  - Returns 200 OK
- [ ] Remove:
  - Prevents removing self if last Admin
  - Removes member from array
  - Returns 204 No Content
- [ ] Authorization: only Admins can perform actions
- [ ] Validation: userId exists in members array

**Technical Notes:**
- Use MongoDB update operators: `$set` for promote, `$pull` for remove
- Check count of Admins before allowing self-removal

**Dependencies:** US-E2-003

**Estimated Effort:** 1.5 days (promote: 0.5d, remove: 0.75d, validation: 0.25d)

**Priority:** Must Have

---

### Story US-E2-008: Authorization Middleware for Group Access

**As a** developer **I want to** implement group authorization middleware **So that** non-members cannot access group data

**Acceptance Criteria:**
- [ ] Middleware validates:
  - User is authenticated (JWT valid)
  - User is member of requested group (check `groups.members.userId`)
- [ ] Applied to all `/api/groups/{id}/*` routes
- [ ] Returns 403 Forbidden if not a member
- [ ] Attaches group to HttpContext for downstream use
- [ ] Cached for request lifetime (avoid multiple DB queries)

**Technical Notes:**
- Create `GroupAuthorizationHandler` implementing `IAuthorizationHandler`
- Register in DI: `services.AddAuthorization(options => ...)`
- Use `[Authorize(Policy = "GroupMember")]` attribute

**Dependencies:** US-E2-001, US-E2-005

**Estimated Effort:** 1.5 days (middleware: 1d, policy: 0.25d, testing: 0.25d)

**Priority:** Should Have

---

## Epic E3: Testing & Quality Assurance

**Description:** Comprehensive testing at unit, integration, and E2E levels to ensure reliability and catch regressions.

**Business Value:** Prevents bugs in production, ensures member limit enforcement, validates authorization rules.

**Success Criteria:**
- Unit test coverage: >70%
- Integration tests for all critical flows
- E2E smoke tests for create/invite/join
- All tests passing in CI pipeline

**Estimated Effort:** 1 sprint (~6 days)  
**Priority:** High

---

### Story US-E3-001: Backend Unit Tests

**As a** developer **I want to** write unit tests for backend **So that** business logic is validated

**Acceptance Criteria:**
- [ ] GroupService tests:
  - CreateGroup: generates invitation code, adds creator as Admin
  - GetGroup: returns group for member, throws for non-member
  - InviteMember: enforces 20-member limit, prevents duplicate invites
  - PromoteMember: updates role correctly
  - RemoveMember: prevents removing last Admin
- [ ] GroupRepository tests:
  - CRUD operations
  - Query by invitation code
  - GetUserGroups returns correct groups
- [ ] Test coverage: >70% for group features

**Technical Notes:**
- Use xUnit + Moq
- Mock IGroupRepository in service tests
- Use in-memory MongoDB for repository tests

**Dependencies:** US-E2-001, US-E2-003

**Estimated Effort:** 2.5 days (service: 1.5d, repository: 1d)

**Priority:** Must Have

---

### Story US-E3-002: Backend Integration Tests

**As a** developer **I want to** write integration tests **So that** API endpoints are validated

**Acceptance Criteria:**
- [ ] Tests for critical flows:
  - Create group → user is Admin → invitation code generated
  - Invite member → email sent → join via code → member added
  - Promote member → role updated → can invite others
  - Remove member → member cannot access group
  - 21st member invite → returns 400 with member limit error
- [ ] Use WebApplicationFactory for in-memory API
- [ ] Test database isolation (separate DB per test)
- [ ] All tests passing locally and in CI

**Technical Notes:**
- Use xUnit + WebApplicationFactory
- Configure test MongoDB instance
- Clean up test data after each test

**Dependencies:** US-E2-005, US-E2-006, US-E2-007

**Estimated Effort:** 2 days (flows: 1.5d, setup: 0.5d)

**Priority:** Must Have

---

### Story US-E3-003: Frontend & E2E Tests

**As a** developer **I want to** write frontend and E2E tests **So that** UI is validated

**Acceptance Criteria:**
- [ ] Frontend unit tests:
  - groupSlice: actions update state correctly
  - GroupSelector: renders groups, switches on click
  - CreateGroupPage: validates input, calls mutation
- [ ] E2E tests (Playwright):
  - Create group flow: login → create group → redirects to dashboard
  - Invite flow: admin invites → email link → join → member sees dashboard
  - Group switching: user in 2 groups → switches via dropdown → data updates
- [ ] All tests passing in CI

**Technical Notes:**
- Use Vitest + React Testing Library for unit tests
- Use Playwright for E2E tests
- Mock API responses in unit tests

**Dependencies:** US-E1-001 through US-E1-007

**Estimated Effort:** 1.5 days (unit: 0.75d, E2E: 0.75d)

**Priority:** Should Have

---

## Sprint Plan

### Sprint 1: Frontend Foundation (2 weeks)

**Sprint Goal:** Users can interact with group UI and manage groups (with mock APIs)

**Stories:**
- US-E1-001: Redux Group State (1d) - Must Have ✅
- US-E1-002: RTK Query Endpoints (1.5d) - Must Have ✅
- US-E1-003: Group Selector (1.5d) - Must Have ✅
- US-E1-004: Create Group Page (2d) - Must Have ✅
- US-E1-005: Group Dashboard (2d) - Must Have ✅

**Capacity:** 10 days | **Committed:** 8 days | **Buffer:** 20%

---

### Sprint 2: Complete Frontend & Backend Foundation (2 weeks)

**Sprint Goal:** Backend API functional with database persistence; complete frontend UI

**Stories:**
- US-E1-006: Invite Members Modal (2d) - Must Have ✅
- US-E1-007: Join Group Page (1.5d) - Must Have ✅
- US-E2-001: MongoDB Schema & Repository (2d) - Must Have ✅
- US-E2-002: DTOs & Mapping (1d) - Must Have ✅
- US-E2-003: GroupService CRUD (2d) - Must Have ✅
- US-E2-004: InvitationService (1.5d) - Must Have ✅

**Capacity:** 10 days | **Committed:** 10 days | **Buffer:** 0% (tight sprint)

---

### Sprint 3: Backend Completion & Authorization (2 weeks)

**Sprint Goal:** All API endpoints functional with authorization; invitation system working

**Stories:**
- US-E2-005: GroupController CRUD (1.5d) - Must Have ✅
- US-E2-006: Invitation Endpoints (2d) - Must Have ✅
- US-E2-007: Member Management (1.5d) - Must Have ✅
- US-E2-008: Authorization Middleware (1.5d) - Should Have ✅

**Capacity:** 10 days | **Committed:** 6.5 days | **Buffer:** 35% (polish time)

---

### Sprint 4: Testing & Production Readiness (2 weeks)

**Sprint Goal:** Comprehensive tests passing, ready for production deployment

**Stories:**
- US-E3-001: Backend Unit Tests (2.5d) - Must Have ✅
- US-E3-002: Backend Integration Tests (2d) - Must Have ✅
- US-E3-003: Frontend & E2E Tests (1.5d) - Should Have ✅

**Capacity:** 10 days | **Committed:** 6 days | **Buffer:** 40% (regression testing, polish)

---

## Dependencies & Risks

### Critical Dependencies

| Dependency | Impact | Mitigation |
|------------|--------|------------|
| SendGrid API Key | Email invitations blocked | Use mock email service for development, add to appsettings before production |
| MongoDB indexes | Slow queries at scale | Create indexes in US-E2-001, validate with explain() |
| JWT claims extension | Group context unavailable | Extend existing JWT generation, test thoroughly |
| Azure Blob (avatar upload) | No avatar support | Skip for MVP, add in future sprint |

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MongoDB member array performance at scale | Low | Medium | Test with 20 members, monitor query times |
| Concurrent member operations (race conditions) | Medium | High | Use optimistic concurrency with version field |
| Email deliverability (spam filters) | Medium | Medium | SendGrid best practices, SPF/DKIM records |
| Frontend state desync after switching groups | Low | High | Clear derived state when group changes |

### External Dependencies

- **SendGrid:** Email delivery service (SLA: 99.9%)
- **MongoDB Atlas:** Database hosting (SLA: 99.95%)
- **Azure Blob Storage:** Avatar storage (future, not blocking)

---

## Release Phases

### Phase 1: MVP (Sprints 1-3, ~6 weeks)
**Deliverables:**
- ✅ Create group with name, description, timezone, language
- ✅ Invite members via email and shareable link
- ✅ Join group via invitation
- ✅ Admin can promote/remove members
- ✅ Switch between groups via dropdown
- ✅ Member limit enforced (20 max)
- ✅ Authorization prevents non-member access

**Release Criteria:**
- All Must Have stories completed
- Backend unit tests passing (>70% coverage)
- Integration tests for critical flows passing
- Manual QA on staging environment
- SendGrid configured for production

---

### Phase 2: Enhancement (Sprint 4, ~2 weeks)
**Deliverables:**
- ✅ Comprehensive test suite (unit + integration + E2E)
- ✅ Authorization middleware with policy-based access
- ✅ Performance validation (API response times)
- ✅ Error handling polish (user-friendly messages)

**Release Criteria:**
- All Should Have stories completed
- E2E tests passing in CI
- Load testing with 10K groups
- Monitoring and alerting configured

---

### Phase 3: Future Enhancements (Post-MVP)
**Backlog:**
- Avatar upload to Azure Blob
- Group deletion with cascade (tasks, races)
- Invitation code expiry (7-day TTL)
- Group ownership transfer
- Member activity audit log
- Group templates (presets for common use cases)
- Push notifications for invitations

---

## Success Validation

### Acceptance Checklist (MVP)
- [ ] User can create group and becomes Admin
- [ ] Admin can invite via email → recipient receives link → joins successfully
- [ ] Admin can share invitation link → recipient joins without email
- [ ] 21st member invite returns clear error message
- [ ] Admin can promote member → member gains Admin privileges
- [ ] Admin can remove member → member loses access
- [ ] User in 2+ groups can switch via dropdown → correct data loads
- [ ] Non-member cannot access group data (403 error)
- [ ] All API response times meet SLA (<500ms create, <200ms list)
- [ ] Test coverage >70% for group features
- [ ] CI pipeline passing (backend + frontend)

### User Acceptance Testing Scenarios
1. **Happy Path:** Create group → invite friend → friend joins → complete task together → see on leaderboard
2. **Admin Actions:** Promote user → new admin invites more members → remove inactive member
3. **Error Handling:** Try joining full group (20/20) → see clear error → contact admin for help
4. **Multi-Group:** Join work group + family group → switch between them → tasks isolated

---

## Effort Summary

| Epic | Stories | Estimated Days | Priority |
|------|---------|----------------|----------|
| E1: Frontend Foundation | 7 | 11.5 | Critical |
| E2: Backend API | 8 | 12 | Critical |
| E3: Testing | 3 | 6 | High |
| **Total** | **18** | **29.5** | - |

**With AI Assistance Multipliers:**
- CRUD/Boilerplate: 5x faster
- Business Logic: 2.5x faster
- Testing: 5x faster

**Sprint Timeline:** 4 sprints × 2 weeks = 8 weeks calendar time (1 developer + AI)

**Buffer:** 20% built into estimates for debugging, code review, documentation

---

**Work Plan Status:** ✅ Ready for Implementation  
**Next Action:** Begin Sprint 1 with US-E1-001 (Redux Group State)
