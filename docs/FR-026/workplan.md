# Work Plan: FR-026 Group Member Invitation System (Code-Based)

**Document Version:** 1.0  
**Created:** December 17, 2025  
**Status:** Ready for Implementation  
**Design Reference:** [design.md](./design.md)  
**PRD Reference:** [../prds/FR-026-group-member-invitation-system.md](../prds/FR-026-group-member-invitation-system.md)

---

## Vision & Metrics

**Vision:**
For group administrators who need flexible member onboarding,
the Code-Based Invitation System is a membership management feature
that enables controlled access through shareable codes with optional email restrictions.

**Success Metrics:**

**User Metrics:**
- Admins create invitations in <30 seconds
- 95% successful code redemptions on first attempt
- <5% support requests related to invitation confusion

**Business Metrics:**
- 40% reduction in manual member onboarding time
- 100% audit trail of all invitations (who invited whom, when)
- Zero security incidents from invitation abuse

**Technical Metrics:**
- Code generation: <10ms with zero collisions
- Redemption validation: <200ms end-to-end
- 70%+ code coverage for new components
- Database queries use indexes (100%)

---

## Timeline

**Total:** 2 Epics | 14 Stories | 2 Sprints (4 weeks)

**Sprint 1 (2 weeks):** Client-side UI + Backend Foundation  
**Sprint 2 (2 weeks):** Backend Completion + Integration + Testing

---

## Epic E1: Frontend - Invitation Management UI

**Description:** Implement React components for creating, viewing, and redeeming code-based invitations within the existing Members Management system.

**Business Value:** Provides intuitive UI for admins to generate shareable codes and users to join groups, reducing friction in the onboarding process.

**Success Criteria:**
- Invitations tab visible to group admins in Members Management modal
- Admins can create both email-specific and "any user" invitations
- Generated codes displayed with copy-to-clipboard functionality
- Invitations list shows all records with proper metadata (code, target, status, date)
- Redemption modal accessible from navigation with clear error messages
- All components follow existing Tailwind styling patterns
- Mobile responsive (stacks to cards on small screens)

**Estimated Effort:** 1 sprint (10 working days with AI assistance)

**Priority:** Critical (blocks user access to feature)

**Dependencies:** Existing Members Management modal structure

---

### Story US-026-001: InvitationsTab Component

**As a** group admin **I want to** access an "Invitations" tab in Members Management **So that** I can manage invitation codes separate from the members list.

**Acceptance Criteria:**
- [ ] Tab appears in MembersModal only for group admins
- [ ] Tab label shows "Invitations" with badge count of pending invites (e.g., "Invitations (3)")
- [ ] Tab content area displays CreateInviteForm and InvitationsRecordsList
- [ ] Switching tabs preserves state (no unnecessary re-renders)
- [ ] Non-admin users do not see the tab
- [ ] Empty state shows helpful message: "No invitations yet. Create your first invitation above."

**Technical Notes:**
- Extend existing MembersModal component
- Check `isAdmin` prop from group membership
- Use Tailwind tabs pattern from design system
- Badge component for pending count

**Dependencies:** None (extends existing component)

**Estimated Effort:** 0.5 days (component: 0.25d, styling: 0.25d)

**Priority:** Must Have

---

### Story US-026-002: CreateInviteForm Component

**As a** group admin **I want to** generate invitation codes with optional email restrictions **So that** I can control who can join my group.

**Acceptance Criteria:**
- [ ] Radio buttons for invitation type: "Specific Email" / "Any User"
- [ ] Email input field appears only when "Specific Email" selected
- [ ] Email validation (format: RFC 5322 basic pattern)
- [ ] "Generate Invitation Code" button (primary, full width)
- [ ] Success state displays generated code in copy-to-clipboard input
- [ ] "Copy Code" button with success toast on copy
- [ ] Helper text: "Share this code with the person you want to invite"
- [ ] Error messages display below form (red text, clear messaging)
- [ ] Form resets after successful generation
- [ ] Loading state shows spinner on button during API call

**Technical Notes:**
- Use Headless UI for radio group
- React Hook Form for validation
- `navigator.clipboard.writeText()` for copy functionality
- Call `useCreateInviteMutation` hook

**Dependencies:** US-026-006 (RTK Query endpoint)

**Estimated Effort:** 1.5 days (form: 0.5d, validation: 0.25d, copy UX: 0.25d, styling: 0.25d, integration: 0.25d)

**Priority:** Must Have

---

### Story US-026-003: InvitationsRecordsList Component

**As a** group admin **I want to** view all invitations for my group **So that** I can track pending and approved invitations.

**Acceptance Criteria:**
- [ ] Table displays: Code | Target | Invited By | Status | Created | Actions (future)
- [ ] Target column shows email or `<Badge>Any User</Badge>`
- [ ] Status column shows `<Badge color="yellow">Pending</Badge>` or `<Badge color="green">Approved</Badge>`
- [ ] Records sorted by creation date (newest first)
- [ ] Empty state shows when no invitations exist
- [ ] Mobile responsive: table converts to stacked cards on small screens (<640px)
- [ ] Loading skeleton while fetching data
- [ ] Error state with retry button if query fails

**Technical Notes:**
- Use `useGetGroupInvitesQuery(groupId)` hook
- StatusPill component for status badges (yellow/green variants)
- Table component from design system
- `formatDate()` utility for date formatting

**Dependencies:** US-026-007 (RTK Query endpoint)

**Estimated Effort:** 1 day (table: 0.5d, responsive: 0.25d, states: 0.25d)

**Priority:** Must Have

---

### Story US-026-004: InvitationRecordCard Component

**As a** group admin **I want to** see detailed information for each invitation **So that** I can understand who was invited and when.

**Acceptance Criteria:**
- [ ] Card displays: code (large, monospace font), target email/"Any User", invited by name, status badge, created date
- [ ] Copy button for code (inline, small icon button)
- [ ] Visual distinction between specific email (envelope icon) and any user (users icon)
- [ ] Approved invitations show "Used on [date]" with used by user name (if available)
- [ ] Pending invitations have subtle background color (gray-50 dark:gray-800)
- [ ] Card hover state provides affordance (subtle border change)

**Technical Notes:**
- Heroicons for icons (`EnvelopeIcon`, `UserGroupIcon`, `DocumentDuplicateIcon`)
- Tailwind card pattern
- Receives `invite: Invite` prop

**Dependencies:** US-026-003 (used within list)

**Estimated Effort:** 0.5 days (card: 0.25d, styling: 0.25d)

**Priority:** Should Have (enhances UX but list view sufficient for MVP)

---

### Story US-026-005: RedeemInviteModal Component

**As a** user **I want to** enter an invitation code to join a group **So that** I can become a member.

**Acceptance Criteria:**
- [ ] Modal accessible from navigation bar "Join Group" link
- [ ] Input field: "Enter Invitation Code" (8-char, uppercase, auto-format)
- [ ] Auto-uppercase transformation as user types
- [ ] Input validation: exactly 8 alphanumeric characters
- [ ] "Join Group" button (primary, disabled if code invalid format)
- [ ] Loading state on button during API call
- [ ] Success: Modal closes, toast notification "Successfully joined [Group Name]!", redirect to group dashboard
- [ ] Error messages display below input: "Invalid code", "Wrong email", "Already used", "Already a member"
- [ ] Error states have red text and error icon
- [ ] Modal can be closed with X button or Escape key

**Technical Notes:**
- Modal component from design system (likely Headless UI Dialog)
- Input masking/formatting: `value.toUpperCase().replace(/[^A-Z0-9]/g, '')`
- Call `useRedeemInviteMutation` hook
- React Router `useNavigate()` for redirect
- React Hot Toast for notifications

**Dependencies:** US-026-008 (RTK Query endpoint)

**Estimated Effort:** 1.5 days (modal: 0.5d, validation: 0.25d, error handling: 0.5d, redirect: 0.25d)

**Priority:** Must Have

---

### Story US-026-006: RTK Query - createInvite Endpoint

**As a** developer **I want to** define the createInvite API endpoint in RTK Query **So that** the CreateInviteForm can call the backend.

**Acceptance Criteria:**
- [ ] Mutation endpoint: `createInvite(groupId, email?)`
- [ ] Request: `POST /groups/{groupId}/invites` with body `{ email?: string }`
- [ ] Response type: `InviteResponse { code, email, groupId, createdAt }`
- [ ] Invalidates `Invite` tags for `groupId` (to refresh list)
- [ ] Proper error handling with typed errors
- [ ] TypeScript types defined in `types/invite.ts`

**Technical Notes:**
- Extend `groupApi.ts` with `injectEndpoints`
- Follow existing mutation patterns
- Add to `groupApi` exports

**Dependencies:** None (frontend-only)

**Estimated Effort:** 0.5 days (endpoint: 0.25d, types: 0.25d)

**Priority:** Must Have

---

### Story US-026-007: RTK Query - getGroupInvites Endpoint

**As a** developer **I want to** define the getGroupInvites API endpoint in RTK Query **So that** the InvitationsRecordsList can fetch invitations.

**Acceptance Criteria:**
- [ ] Query endpoint: `getGroupInvites(groupId)`
- [ ] Request: `GET /groups/{groupId}/invites`
- [ ] Response type: `InvitesListResponse { invites: Invite[], total: number }`
- [ ] Provides `Invite` tags for each record and list
- [ ] Automatic refetching on invalidation
- [ ] Proper error handling

**Technical Notes:**
- Query builder in `groupApi.ts`
- TypeScript types for Invite and InvitesListResponse
- Follow existing query patterns

**Dependencies:** None (frontend-only)

**Estimated Effort:** 0.5 days (endpoint: 0.25d, types: 0.25d)

**Priority:** Must Have

---

### Story US-026-008: RTK Query - redeemInvite Endpoint

**As a** developer **I want to** define the redeemInvite API endpoint in RTK Query **So that** users can join groups via codes.

**Acceptance Criteria:**
- [ ] Mutation endpoint: `redeemInvite(code)`
- [ ] Request: `POST /invites/redeem` with body `{ code: string }`
- [ ] Response type: `RedeemInviteResponse { groupId, groupName, message }`
- [ ] Invalidates `Group` tags (LIST) to refresh user's groups
- [ ] Error handling with specific error codes: NOT_FOUND, FORBIDDEN, INVALID_OPERATION
- [ ] TypeScript types defined

**Technical Notes:**
- Global endpoint (not scoped to group)
- Mutation in `groupApi.ts`
- Parse error responses for display in modal

**Dependencies:** None (frontend-only)

**Estimated Effort:** 0.5 days (endpoint: 0.25d, error handling: 0.25d)

**Priority:** Must Have

---

### Story US-026-009: TypeScript Types for Invitations

**As a** developer **I want to** define TypeScript interfaces for invitation data **So that** the codebase is type-safe.

**Acceptance Criteria:**
- [ ] File: `web/src/types/invite.ts`
- [ ] Interfaces: `Invite`, `CreateInviteRequest`, `InviteResponse`, `InvitesListResponse`, `RedeemInviteRequest`, `RedeemInviteResponse`
- [ ] All properties properly typed (string, string | null, Date, enum)
- [ ] Exported for use across components
- [ ] JSDoc comments for clarity

**Technical Notes:**
- Follow existing type patterns in `types/group.ts`
- Use `string | null` for optional email field
- ISO date strings for timestamps

**Dependencies:** None

**Estimated Effort:** 0.25 days (types: 0.25d)

**Priority:** Must Have

---

## Epic E2: Backend - Code-Based Invitation API

**Description:** Implement .NET backend services, repositories, and controllers for code-based invitation CRUD operations, validation, and redemption logic.

**Business Value:** Provides secure, performant API for invitation management with proper authorization, validation, and audit trails.

**Success Criteria:**
- All API endpoints functional and documented
- Invite entity with MongoDB schema and indexes
- Code generation is cryptographically secure with zero collisions
- Redemption validates email match (if specified) and group membership
- Single-use codes (status transitions prevent reuse)
- Authorization enforced (admin creates/views, any auth user redeems)
- Error responses follow standard ApiResponse pattern
- Integration tests cover all endpoints with 70%+ coverage

**Estimated Effort:** 1 sprint (10 working days with AI assistance)

**Priority:** Critical (blocks frontend functionality)

**Dependencies:** Existing GroupService, GroupRepository, UserRepository

---

### Story US-026-010: Invite Domain Entity & Repository Interface

**As a** developer **I want to** define the Invite entity and repository interface **So that** invitations can be persisted to MongoDB.

**Acceptance Criteria:**
- [ ] Invite entity class: `Id`, `GroupId`, `Code`, `Email` (nullable), `InvitedBy`, `Status` (enum: Pending/Approved), `UsedBy` (nullable), `CreatedAt`, `UsedAt` (nullable)
- [ ] BsonId and BsonElement attributes for MongoDB mapping
- [ ] InviteStatus enum: Pending, Approved
- [ ] IInvitesRepository interface with methods:
  - `CreateAsync(Invite)`
  - `GetByCodeAsync(string code)`
  - `GetByGroupIdAsync(string groupId, InviteStatus? status)`
  - `UpdateAsync(Invite)`
  - `CodeExistsAsync(string code)`
  - `EnsureIndexesAsync()`
- [ ] Interface registered in DI

**Technical Notes:**
- File: `backend/Core/Domain/Invite.cs`
- Interface: `backend/Core/Interfaces/IInvitesRepository.cs`
- Follow existing entity patterns (Group, User)

**Dependencies:** None

**Estimated Effort:** 0.5 days (entity: 0.25d, interface: 0.25d)

**Priority:** Must Have

---

### Story US-026-011: InvitesRepository Implementation

**As a** developer **I want to** implement the InvitesRepository **So that** invitations can be stored and queried in MongoDB.

**Acceptance Criteria:**
- [ ] InvitesRepository class extends BaseRepository<Invite>
- [ ] GetByCodeAsync: finds invite by code (case-insensitive)
- [ ] GetByGroupIdAsync: finds all invites for group, optional status filter, sorted by CreatedAt desc
- [ ] UpdateAsync: replaces invite document
- [ ] CodeExistsAsync: checks if code exists (for uniqueness)
- [ ] EnsureIndexesAsync: creates indexes (unique on `code`, compound on `groupId+status`)
- [ ] Repository registered in DI
- [ ] Unit tests for all methods with InMemory MongoDB

**Technical Notes:**
- File: `backend/Infrastructure/Repositories/InvitesRepository.cs`
- Use MongoDB.Driver FilterDefinition builders
- Indexes: `{ code: 1 }` (unique), `{ groupId: 1, status: 1 }`

**Dependencies:** US-026-010

**Estimated Effort:** 1 day (implementation: 0.5d, tests: 0.5d)

**Priority:** Must Have

---

### Story US-026-012: CodeGeneratorService Utility

**As a** developer **I want to** create a service to generate unique invitation codes **So that** codes are cryptographically secure.

**Acceptance Criteria:**
- [ ] CodeGeneratorService class with `GenerateCode()` method
- [ ] Generates 8-character uppercase alphanumeric codes
- [ ] Uses `RandomNumberGenerator` (cryptographically secure)
- [ ] Character set: A-Z, 0-9 (36 chars)
- [ ] Service registered as singleton in DI
- [ ] Unit tests verify:
  - Code is exactly 8 characters
  - Code is uppercase alphanumeric only
  - 10,000 generated codes have zero duplicates (collision test)

**Technical Notes:**
- File: `backend/Core/Services/CodeGeneratorService.cs`
- Namespace: `System.Security.Cryptography`
- Example output: "A7B9C2XZ"

**Dependencies:** None

**Estimated Effort:** 0.5 days (service: 0.25d, tests: 0.25d)

**Priority:** Must Have

---

### Story US-026-013: IInvitesService Interface & DTOs

**As a** developer **I want to** define the IInvitesService interface and DTOs **So that** the service contract is clear.

**Acceptance Criteria:**
- [ ] IInvitesService interface with methods:
  - `CreateInviteAsync(groupId, adminUserId, email?, cancellationToken)`
  - `GetGroupInvitesAsync(groupId, userId, cancellationToken)`
  - `RedeemInviteAsync(code, userId, userEmail, cancellationToken)`
- [ ] DTOs (records):
  - CreateInviteRequest `{ Email?: string }`
  - InviteResponse `{ Code, Email?, GroupId, CreatedAt }`
  - RedeemInviteRequest `{ Code }`
  - RedeemInviteResponse `{ GroupId, GroupName, Message }`
  - InviteDto `{ Id, GroupId, Code, Email?, InvitedBy, InvitedByName, Status, UsedBy?, CreatedAt, UsedAt? }`
  - InvitesListResponse `{ Invites: List<InviteDto>, Total }`
- [ ] Interface and DTOs registered in DI (if needed)

**Technical Notes:**
- Files: `backend/Features/Groups/Services/IInvitesService.cs`, `backend/Features/Groups/Models/InviteDtos.cs`
- Use record types for DTOs (immutable)

**Dependencies:** US-026-010

**Estimated Effort:** 0.5 days (interface: 0.25d, DTOs: 0.25d)

**Priority:** Must Have

---

### Story US-026-014: InvitesService - CreateInviteAsync

**As a** group admin **I want to** create invitation codes via the service **So that** business logic is centralized and tested.

**Acceptance Criteria:**
- [ ] Validates user is group admin (calls `GroupService.IsGroupAdminAsync`)
- [ ] Validates email format if provided (RFC 5322 regex)
- [ ] Checks if user already a member (if email specified)
- [ ] Generates unique code (calls CodeGeneratorService, retries up to 10 times if collision)
- [ ] Creates Invite entity with groupId, code, email (nullable, lowercased), invitedBy, status=Pending, createdAt
- [ ] Saves to repository
- [ ] Logs invitation creation
- [ ] Returns InviteResponse
- [ ] Throws UnauthorizedAccessException if not admin
- [ ] Throws ArgumentException if email invalid
- [ ] Throws InvalidOperationException if user already member or code generation fails
- [ ] Unit tests cover all paths (admin/non-admin, valid/invalid email, collision handling)

**Technical Notes:**
- File: `backend/Features/Groups/Services/InvitesService.cs`
- Inject: IInvitesRepository, IGroupService, IUserRepository, CodeGeneratorService, ILogger
- Email lowercase: `email?.ToLowerInvariant()`

**Dependencies:** US-026-012, US-026-013

**Estimated Effort:** 1.5 days (implementation: 0.75d, tests: 0.75d)

**Priority:** Must Have

---

### Story US-026-015: InvitesService - RedeemInviteAsync

**As a** user **I want to** redeem invitation codes via the service **So that** I can join groups securely.

**Acceptance Criteria:**
- [ ] Finds invite by code (case-insensitive: `code.ToUpperInvariant()`)
- [ ] Throws KeyNotFoundException if code not found
- [ ] Checks status is Pending (throws InvalidOperationException if Approved)
- [ ] Validates email match if invite has email (case-insensitive comparison)
- [ ] Throws UnauthorizedAccessException if email mismatch
- [ ] Checks user not already member (calls `GroupService.IsMemberAsync`)
- [ ] Throws InvalidOperationException if already member
- [ ] Adds user to group (calls `GroupService.AddMemberAsync` with "RegularUser" role)
- [ ] Updates invite: status=Approved, usedBy=userId, usedAt=now
- [ ] Saves updated invite
- [ ] Logs redemption
- [ ] Returns RedeemInviteResponse with groupId, groupName, message
- [ ] Unit tests cover all validation paths

**Technical Notes:**
- Complex validation logic - ensure all edge cases tested
- Email comparison: `string.Equals(invite.Email, userEmail, StringComparison.OrdinalIgnoreCase)`

**Dependencies:** US-026-013, US-026-014 (service skeleton)

**Estimated Effort:** 2 days (implementation: 1d, tests: 1d)

**Priority:** Must Have

---

### Story US-026-016: InvitesService - GetGroupInvitesAsync

**As a** group admin **I want to** retrieve all invitations for my group **So that** I can view the list in the UI.

**Acceptance Criteria:**
- [ ] Validates user is group admin (throws UnauthorizedAccessException if not)
- [ ] Queries repository for all invites by groupId (no status filter)
- [ ] For each invite, fetches invitedBy user to populate `invitedByName`
- [ ] Maps to InviteDto list
- [ ] Returns List<InviteDto> with all metadata
- [ ] Unit tests verify admin check and user name population

**Technical Notes:**
- Consider N+1 query issue: fetch all inviter user IDs first, then batch query users
- Fallback to "Unknown" if user not found

**Dependencies:** US-026-013

**Estimated Effort:** 1 day (implementation: 0.5d, tests: 0.5d)

**Priority:** Must Have

---

### Story US-026-017: GroupsController - POST /groups/{id}/invites

**As a** group admin **I want to** call the API to create invitations **So that** the frontend can generate codes.

**Acceptance Criteria:**
- [ ] Endpoint: `POST /api/groups/{groupId}/invites`
- [ ] Request body: `CreateInviteRequest { email?: string }`
- [ ] Authorization: `[Authorize]` + group admin check
- [ ] Calls `InvitesService.CreateInviteAsync(groupId, UserId, email)`
- [ ] Returns 201 Created with InviteResponse
- [ ] Returns 400 if validation fails (ArgumentException, InvalidOperationException)
- [ ] Returns 403 if not admin (UnauthorizedAccessException)
- [ ] Returns 500 for unexpected errors
- [ ] Logs request with groupId, userId, email presence
- [ ] Integration tests verify all status codes

**Technical Notes:**
- Add to existing GroupsController
- Use ApiResponse<InviteResponse> wrapper
- CreatedAtAction references GetGroupInvites

**Dependencies:** US-026-014

**Estimated Effort:** 0.75 days (controller: 0.5d, tests: 0.25d)

**Priority:** Must Have

---

### Story US-026-018: GroupsController - GET /groups/{id}/invites

**As a** group admin **I want to** call the API to list invitations **So that** the frontend can display them.

**Acceptance Criteria:**
- [ ] Endpoint: `GET /api/groups/{groupId}/invites`
- [ ] Authorization: `[Authorize]` + group admin check
- [ ] Calls `InvitesService.GetGroupInvitesAsync(groupId, UserId)`
- [ ] Returns 200 OK with InvitesListResponse
- [ ] Returns 403 if not admin
- [ ] Returns 500 for unexpected errors
- [ ] Integration tests verify authorization and response structure

**Technical Notes:**
- Add to existing GroupsController
- Use ApiResponse<InvitesListResponse> wrapper

**Dependencies:** US-026-016

**Estimated Effort:** 0.5 days (controller: 0.25d, tests: 0.25d)

**Priority:** Must Have

---

### Story US-026-019: InvitesController - POST /invites/redeem

**As a** user **I want to** call the API to redeem codes **So that** I can join groups.

**Acceptance Criteria:**
- [ ] New controller: InvitesController at `/api/invites`
- [ ] Endpoint: `POST /api/invites/redeem`
- [ ] Request body: `RedeemInviteRequest { code }`
- [ ] Authorization: `[Authorize]` (any authenticated user)
- [ ] Extracts userId from JWT claims (`ClaimTypes.NameIdentifier`)
- [ ] Extracts userEmail from JWT claims (`ClaimTypes.Email`)
- [ ] Calls `InvitesService.RedeemInviteAsync(code, userId, userEmail)`
- [ ] Returns 200 OK with RedeemInviteResponse
- [ ] Returns 404 if code not found (KeyNotFoundException)
- [ ] Returns 403 if email mismatch (UnauthorizedAccessException)
- [ ] Returns 400 if already used or already member (InvalidOperationException)
- [ ] Returns 500 for unexpected errors
- [ ] Code normalized to uppercase before processing
- [ ] Integration tests cover all scenarios

**Technical Notes:**
- File: `backend/Features/Groups/Controllers/InvitesController.cs`
- Claims extraction: `User.FindFirst(ClaimTypes.Email)?.Value`
- ApiResponse<RedeemInviteResponse> wrapper

**Dependencies:** US-026-015

**Estimated Effort:** 1 day (controller: 0.5d, tests: 0.5d)

**Priority:** Must Have

---

### Story US-026-020: MongoDB Indexes & Migration

**As a** developer **I want to** ensure database indexes exist **So that** queries are performant.

**Acceptance Criteria:**
- [ ] Unique index on `code` field
- [ ] Compound index on `{ groupId: 1, status: 1 }`
- [ ] Index on `{ groupId: 1, createdAt: -1 }` for sorted queries
- [ ] EnsureIndexesAsync() called during application startup
- [ ] Migration script documented in `docs/FR-026/migration.md`
- [ ] Verify indexes via MongoDB Compass or CLI

**Technical Notes:**
- Call `invitesRepository.EnsureIndexesAsync()` in Program.cs during startup
- Document manual index creation commands for production

**Dependencies:** US-026-011

**Estimated Effort:** 0.5 days (implementation: 0.25d, documentation: 0.25d)

**Priority:** Must Have

---

### Story US-026-021: Dependency Injection Registration

**As a** developer **I want to** register all services in DI **So that** the application can resolve dependencies.

**Acceptance Criteria:**
- [ ] `builder.Services.AddScoped<IInvitesRepository, InvitesRepository>()`
- [ ] `builder.Services.AddScoped<IInvitesService, InvitesService>()`
- [ ] `builder.Services.AddSingleton<CodeGeneratorService>()`
- [ ] Verify no DI resolution errors on startup
- [ ] Documentation in `docs/FR-026/implementation-notes.md`

**Technical Notes:**
- File: `backend/Program.cs`
- Singleton for CodeGeneratorService (stateless, thread-safe)

**Dependencies:** US-026-011, US-026-012, US-026-013

**Estimated Effort:** 0.25 days (registration: 0.25d)

**Priority:** Must Have

---

## Sprint Plan

### Sprint 1: Frontend UI & Backend Foundation (2 weeks)

**Sprint Goal:** Deliver functional invitation UI and backend foundation (entities, repositories, services).

**Capacity:** 10 days

**Stories:**

| Story ID | Title | Effort | Priority | Status |
|----------|-------|--------|----------|--------|
| US-026-009 | TypeScript Types | 0.25d | Must | 🟡 Sprint 1 |
| US-026-001 | InvitationsTab Component | 0.5d | Must | 🟡 Sprint 1 |
| US-026-006 | RTK Query - createInvite | 0.5d | Must | 🟡 Sprint 1 |
| US-026-007 | RTK Query - getGroupInvites | 0.5d | Must | 🟡 Sprint 1 |
| US-026-008 | RTK Query - redeemInvite | 0.5d | Must | 🟡 Sprint 1 |
| US-026-002 | CreateInviteForm | 1.5d | Must | 🟡 Sprint 1 |
| US-026-003 | InvitationsRecordsList | 1d | Must | 🟡 Sprint 1 |
| US-026-005 | RedeemInviteModal | 1.5d | Must | 🟡 Sprint 1 |
| US-026-010 | Invite Entity & Interface | 0.5d | Must | 🟡 Sprint 1 |
| US-026-011 | InvitesRepository | 1d | Must | 🟡 Sprint 1 |
| US-026-012 | CodeGeneratorService | 0.5d | Must | 🟡 Sprint 1 |
| US-026-013 | IInvitesService & DTOs | 0.5d | Must | 🟡 Sprint 1 |
| US-026-021 | DI Registration | 0.25d | Must | 🟡 Sprint 1 |

**Total:** 9 days | **Buffer:** 1 day (10% contingency)

**Milestone:** By end of Sprint 1, UI components ready (mocked endpoints), backend entities and repositories tested.

---

### Sprint 2: Backend Completion & Integration (2 weeks)

**Sprint Goal:** Complete backend services and controllers, integrate frontend with backend, perform E2E testing.

**Capacity:** 10 days

**Stories:**

| Story ID | Title | Effort | Priority | Status |
|----------|-------|--------|----------|--------|
| US-026-014 | InvitesService - CreateInviteAsync | 1.5d | Must | 🟡 Sprint 2 |
| US-026-015 | InvitesService - RedeemInviteAsync | 2d | Must | 🟡 Sprint 2 |
| US-026-016 | InvitesService - GetGroupInvitesAsync | 1d | Must | 🟡 Sprint 2 |
| US-026-017 | GroupsController - POST invites | 0.75d | Must | 🟡 Sprint 2 |
| US-026-018 | GroupsController - GET invites | 0.5d | Must | 🟡 Sprint 2 |
| US-026-019 | InvitesController - POST redeem | 1d | Must | 🟡 Sprint 2 |
| US-026-020 | MongoDB Indexes & Migration | 0.5d | Must | 🟡 Sprint 2 |
| US-026-004 | InvitationRecordCard (optional) | 0.5d | Should | 🟡 Sprint 2 |
| **Integration & Testing** | E2E tests, bug fixes, polish | 2.25d | Must | 🟡 Sprint 2 |

**Total:** 10 days (includes integration buffer)

**Milestone:** By end of Sprint 2, feature fully functional end-to-end, tested, and ready for production.

---

## Dependencies & Risks

### Internal Dependencies

| Dependency | Impact | Status |
|------------|--------|--------|
| GroupService.IsGroupAdminAsync() | Required for admin authorization | ✅ Exists |
| GroupService.IsMemberAsync() | Required for duplicate check | ✅ Exists |
| GroupService.AddMemberAsync() | Required for redemption | ✅ Exists |
| UserRepository.GetByEmailAsync() | Optional for member check | ✅ Exists |
| UserRepository.GetByIdAsync() | Required for invitedByName | ✅ Exists |
| MembersModal component | Host for InvitationsTab | ✅ Exists |

### External Dependencies

| Dependency | Impact | Mitigation |
|------------|--------|------------|
| MongoDB | Core data storage | Local instance for dev, staging env for integration tests |
| JWT authentication | User identity for redemption | Already implemented, verify email claim exists |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Code collision (duplicate codes) | Low | High | Retry logic (10 attempts), collision unit tests, monitor in production |
| Email privacy concerns | Medium | Medium | Document email visibility, consider masking in future |
| User confusion (email vs any user) | Medium | Low | Clear UI labels, helper text, icons |
| Performance (N+1 queries for inviter names) | Low | Medium | Batch query users if >10 invites, consider caching |
| JWT missing email claim | Low | High | Validate JWT structure during auth setup, fallback error message |

---

## Release Phases

### Phase 1: MVP (Sprints 1-2) - Week 1-4
**Goal:** Core functionality for creating, viewing, and redeeming invitations.

**Features:**
- ✅ Create email-specific invitations
- ✅ Create "any user" invitations
- ✅ View all invitations (admin only)
- ✅ Redeem invitation codes
- ✅ Validation and error handling
- ✅ Authorization enforcement

**Success Criteria:** Admins can generate codes, users can join groups, no security issues.

---

### Phase 2: Enhancements (Future) - Post-MVP
**Goal:** Improve UX and add advanced features.

**Features:**
- 🔄 Invitation expiration (add `expiresAt` field, cron job for cleanup)
- 🔄 Revoke pending invitations (DELETE endpoint, UI button)
- 🔄 Email notifications (SendGrid integration, send on creation/redemption)
- 🔄 Rate limiting (prevent abuse, limit redemption attempts)
- 🔄 Email privacy (mask emails in admin view: "j***@example.com")
- 🔄 Bulk invitation generation (CSV upload, multiple emails)

---

### Phase 3: Analytics & Optimization (Future) - Post-Enhancement
**Goal:** Provide insights and optimize performance.

**Features:**
- 📊 Invitation analytics dashboard (redemption rate, average time to redeem)
- 📊 Admin reports (who invited most members, pending invites aging)
- ⚡ Performance optimization (caching, pagination for large groups)
- ⚡ Archive old invitations (soft delete after 90 days, reduce query load)

---

## Validation Checklist

- [x] Stories follow INVEST principles
- [x] Estimates include AI assistance (2-5x multiplier) + 20% buffer
- [x] Dependencies documented and validated
- [x] Each sprint delivers shippable value
- [x] All stories have testable acceptance criteria
- [x] Authorization and security considered
- [x] Database performance addressed (indexes)
- [x] Error handling standardized
- [x] Mobile responsiveness included
- [x] Integration tests planned

---

## Notes for Developers

### AI Co-Development Strategy

**High AI Productivity (3-5x):**
- CRUD operations (repositories)
- Boilerplate (entities, DTOs, interfaces)
- UI components (forms, tables, modals)
- Unit tests (standard patterns)
- Documentation

**Medium AI Productivity (2-3x):**
- Business logic (validation, redemption flow)
- Error handling edge cases
- Integration tests
- Complex UI interactions

**Human-Led (1-1.5x):**
- Architecture decisions (already in design)
- Security review (authorization, validation)
- Code review and refactoring
- UX polish and edge case discovery

### Testing Strategy

**Unit Tests (70% coverage target):**
- All service methods (success + error paths)
- Repository methods (query logic)
- Code generator (collision test)
- UI component logic (form validation, state)

**Integration Tests:**
- All API endpoints (auth, validation, success)
- Database operations (indexes, queries)

**E2E Tests:**
- Create invitation → display in list
- Redeem invitation → join group
- Error scenarios (invalid code, wrong email)

### Code Quality

- Follow existing patterns (GroupService, groupApi)
- Consistent naming (PascalCase C#, camelCase TS)
- Error messages user-friendly
- Logging for audit trail
- Comments for complex logic only

---

**Document Status:** ✅ Ready for Implementation  
**Next Steps:**
1. Review workplan with team
2. Set up project board (GitHub Projects / Jira)
3. Assign stories to developers
4. Begin Sprint 1 (Frontend + Backend Foundation)
5. Daily standups to track progress
6. Sprint review/demo at end of each sprint

---

**Estimated Total Effort:** 19 days  
**With 20% Buffer:** ~23 days (4.6 weeks ≈ 2 sprints)  
**Target Completion:** End of Sprint 2 (Week 4)
