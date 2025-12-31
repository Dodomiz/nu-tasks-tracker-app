# FR-029: In-App Notifications System - Workplan

**Feature:** In-App Notifications System  
**Status:** Planning  
**Created:** December 24, 2025  
**Estimated Completion:** 4 sprints (8-10 working days with AI assistance)

---

## Vision & Objectives

### Vision
Implement a comprehensive in-app notification system that keeps users informed of task assignments, status changes, approvals, and group activities through real-time UI updates and persistent notification storage.

### Success Criteria
1. Users receive notifications for all 6 defined event types
2. Notifications are retrievable from backend with pagination
3. Unread count displays in real-time in notification bell
4. Notifications marked as read persist across sessions
5. Polling mechanism is performant and reliable
6. All functionality is internationalized (EN/HE)

### Dependencies
- MongoDB database (existing)
- ASP.NET Core backend (existing)
- React frontend with RTK Query (existing)
- i18next localization (existing)
- camelCase JSON serialization (configured in FR-028)

---

## Epic Breakdown

### EP-029-1: Frontend Notification UI
**Objective:** Build user-facing notification components with client-first approach  
**Value:** Users can view and interact with notifications  
**Dependencies:** None (client-first design)  
**Estimated Effort:** 3-4 days with AI

**User Stories:**
1. US-029-101: NotificationBell component with unread count badge
2. US-029-102: NotificationModal component with scrollable list
3. US-029-103: NotificationItem component with formatted content
4. US-029-104: Mark notification as read functionality
5. US-029-105: Mark all notifications as read
6. US-029-106: Polling mechanism for real-time updates
7. US-029-107: Internationalization for notification messages

---

### EP-029-2: Backend Notification Infrastructure
**Objective:** Create domain model, persistence layer, and API endpoints  
**Value:** Enable storage and retrieval of notification data  
**Dependencies:** EP-029-1 (stories can be stubbed initially)  
**Estimated Effort:** 2-3 days with AI

**User Stories:**
1. US-029-201: Notification domain model with all fields
2. US-029-202: NotificationRepository with MongoDB operations
3. US-029-203: NotificationsController with CRUD endpoints
4. US-029-204: NotificationService business logic layer
5. US-029-205: MongoDB indexes for performance
6. US-029-206: DTOs for request/response models

---

### EP-029-3: Service Integration & Triggers
**Objective:** Integrate notification creation into existing services  
**Value:** Notifications are automatically generated from user actions  
**Dependencies:** EP-029-2 (backend infrastructure must exist)  
**Estimated Effort:** 2-3 days with AI

**User Stories:**
1. US-029-301: TaskService integration for task assignment
2. US-029-302: TaskService integration for status changes
3. US-029-303: TaskService integration for pending approvals
4. US-029-304: GroupService integration for member joins
5. US-029-305: GroupService integration for member removals
6. US-029-306: InvitationService integration for invitations

---

### EP-029-4: Testing & Quality Assurance
**Objective:** Ensure feature quality and prevent regressions  
**Value:** Reliable, bug-free notification system  
**Dependencies:** EP-029-1, EP-029-2, EP-029-3  
**Estimated Effort:** 1-2 days with AI

**User Stories:**
1. US-029-401: Backend unit tests for NotificationService
2. US-029-402: Backend integration tests for NotificationsController
3. US-029-403: Frontend component tests for notification UI
4. US-029-404: Regression tests for modified services

---

## Sprint Planning

### Sprint 1: Foundation & UI Components
**Duration:** 2-3 days  
**Goal:** Functional notification UI with stubbed backend  
**Stories:** US-029-101 to US-029-107 (EP-029-1 complete)

**Deliverables:**
- NotificationBell component with badge
- NotificationModal component with list
- NotificationItem component with formatting
- Mark as read functionality (local state initially)
- Polling mechanism implemented
- English/Hebrew translations

**Acceptance:**
- Notification bell renders with unread count
- Modal opens on bell click showing notification list
- Notifications display formatted content
- Mark as read updates UI instantly
- Polling triggers every 30 seconds
- UI works in both EN/HE languages

---

### Sprint 2: Backend Infrastructure
**Duration:** 2-3 days  
**Goal:** Complete backend API with persistence  
**Stories:** US-029-201 to US-029-206 (EP-029-2 complete)

**Deliverables:**
- Notification domain model in Core/Domain
- NotificationRepository with CRUD operations
- NotificationsController with 4 endpoints
- NotificationService with business logic
- MongoDB indexes created
- DTOs for all API operations

**Acceptance:**
- POST /api/notifications creates notification
- GET /api/notifications?userId=X returns user's notifications
- PUT /api/notifications/{id}/read marks as read
- PUT /api/notifications/read-all marks all as read
- MongoDB queries use indexes efficiently
- All endpoints return camelCase JSON

**Regression Requirements:**
- Verify existing TaskService unit tests still pass
- Verify GroupService integration tests unchanged
- Verify InvitationService endpoints work correctly

---

### Sprint 3: Integration & Polish
**Duration:** 2-3 days  
**Goal:** Connect notification triggers to user actions  
**Stories:** US-029-301 to US-029-306 (EP-029-3 complete)

**Deliverables:**
- TaskService creates notifications on assignment
- TaskService creates notifications on status change
- TaskService creates notifications on pending approval
- GroupService creates notifications on member join
- GroupService creates notifications on member removal
- InvitationService creates notifications on invitation

**Acceptance:**
- Assigning task triggers TASK_ASSIGNED notification
- Completing task triggers TASK_STATUS_CHANGED notification
- Submitting approval task triggers TASK_PENDING_APPROVAL notification
- Accepting invitation triggers GROUP_MEMBER_JOINED notification
- Removing member triggers GROUP_MEMBER_REMOVED notification
- Receiving invitation triggers GROUP_INVITATION_RECEIVED notification

**Regression Requirements:**
- All existing TaskService unit tests pass with notification code added
- Task assignment flow unchanged from user perspective
- Status change validation still enforced (FR-028 admin approval)
- Group invitation acceptance flow unchanged
- Member removal permissions still enforced

---

### Sprint 4: Testing & Launch
**Duration:** 1-2 days  
**Goal:** Comprehensive testing and production readiness  
**Stories:** US-029-401 to US-029-404 (EP-029-4 complete)

**Deliverables:**
- 70%+ backend test coverage for NotificationService
- Integration tests for all NotificationsController endpoints
- Frontend tests for NotificationBell, NotificationModal, NotificationItem
- Regression test suite for TaskService, GroupService, InvitationService

**Acceptance:**
- All new tests pass
- All existing tests pass (no regressions)
- Manual testing checklist completed
- Documentation updated (progress.md, README if needed)

**Production Readiness Checklist:**
- [ ] MongoDB indexes created in production
- [ ] API endpoints tested with real data
- [ ] Polling performance validated
- [ ] Memory leak testing completed
- [ ] Browser compatibility verified (Chrome, Safari, Firefox)
- [ ] RTL layout verified for Hebrew
- [ ] Error handling tested (network failures, server errors)

---

## User Stories (Detailed)

### US-029-101: NotificationBell Component
**As a** user  
**I want** to see a notification bell icon in the header  
**So that** I can access my notifications and see unread count

**Acceptance Criteria:**
1. Bell icon displays in top-right of app header
2. Unread count badge shows number > 0
3. Badge is amber/orange color for visibility
4. Clicking bell opens NotificationModal
5. Bell is accessible via keyboard (Tab + Enter)

**Technical Notes:**
- Use Heroicons bell-icon
- Badge uses Tailwind CSS absolute positioning
- Component integrates with NotificationModal
- RTK Query hook provides unread count

**Estimated Effort:** 4-6 hours with AI  
**Dependencies:** None

---

### US-029-102: NotificationModal Component
**As a** user  
**I want** to view my notifications in a modal overlay  
**So that** I can read details without navigating away

**Acceptance Criteria:**
1. Modal opens when notification bell clicked
2. Modal shows scrollable list of notifications (newest first)
3. Modal displays "No notifications" when empty
4. Modal has "Mark all as read" button at top
5. Clicking outside modal closes it
6. ESC key closes modal

**Technical Notes:**
- Use Headless UI Dialog component
- Implement virtual scrolling if >100 notifications
- Loading state during fetch
- Error state with retry button

**Estimated Effort:** 6-8 hours with AI  
**Dependencies:** US-029-101

---

### US-029-103: NotificationItem Component
**As a** user  
**I want** to see formatted notification content  
**So that** I understand what action occurred

**Acceptance Criteria:**
1. Shows user avatar (or initials fallback)
2. Displays notification message in user's language
3. Shows relative timestamp (e.g., "2 minutes ago")
4. Unread notifications have visual distinction (bold, background)
5. Clicking notification marks it as read
6. Task-related notifications link to task details

**Technical Notes:**
- Use i18next for message templates
- date-fns for relative timestamps
- Conditional rendering based on notification type
- onClick handler marks as read + optional navigation

**Estimated Effort:** 6-8 hours with AI  
**Dependencies:** US-029-102

---

### US-029-104: Mark Notification as Read
**As a** user  
**I want** to mark notifications as read when I click them  
**So that** my unread count decreases and I know what I've seen

**Acceptance Criteria:**
1. Clicking notification sends PUT request to mark as read
2. Optimistic update changes UI immediately
3. Unread count badge decrements
4. Notification styling changes to "read" appearance
5. Error handling if request fails (revert optimistic update)

**Technical Notes:**
- RTK Query mutation for markAsRead
- Optimistic update with cache invalidation on error
- Update both notification list and unread count

**Estimated Effort:** 4-6 hours with AI  
**Dependencies:** US-029-103

---

### US-029-105: Mark All Notifications as Read
**As a** user  
**I want** to mark all notifications as read with one click  
**So that** I can quickly clear my notification list

**Acceptance Criteria:**
1. "Mark all as read" button at top of modal
2. Button sends PUT request to mark-all endpoint
3. All notifications update to "read" state
4. Unread count badge goes to 0
5. Button disables when count is already 0

**Technical Notes:**
- RTK Query mutation for markAllAsRead
- Optimistic update for all notifications
- Button styling indicates loading state

**Estimated Effort:** 3-4 hours with AI  
**Dependencies:** US-029-104

---

### US-029-106: Polling Mechanism for Real-Time Updates
**As a** user  
**I want** to receive new notifications without refreshing  
**So that** I stay informed of actions in real-time

**Acceptance Criteria:**
1. Polling triggers every 30 seconds when app is active
2. Polling stops when tab is inactive
3. Polling resumes when tab regains focus
4. New notifications appear in modal automatically
5. Unread count updates in real-time

**Technical Notes:**
- Use RTK Query pollingInterval with conditional logic
- Use document.visibilitychange event to pause/resume
- Consider exponential backoff on errors
- Debounce to avoid multiple simultaneous requests

**Estimated Effort:** 4-6 hours with AI  
**Dependencies:** US-029-102, US-029-103

---

### US-029-107: Internationalization for Notifications
**As a** user  
**I want** to see notifications in my chosen language  
**So that** I understand the content in my preferred language

**Acceptance Criteria:**
1. All notification messages use i18next translation keys
2. English translations complete
3. Hebrew translations complete
4. Notification content formats names/titles correctly
5. RTL layout works correctly for Hebrew
6. Relative timestamps localized

**Technical Notes:**
- Add notification keys to translation.json (EN/HE)
- Use t() function with interpolation for user names
- Test RTL rendering of notification items

**Estimated Effort:** 3-4 hours with AI  
**Dependencies:** US-029-103

---

### US-029-201: Notification Domain Model
**As a** developer  
**I want** a Notification domain entity  
**So that** I can store notification data in MongoDB

**Acceptance Criteria:**
1. Notification class in Core/Domain with all fields
2. Id, UserId, Type, Content, IsRead, CreatedAt fields
3. Enum for NotificationType with 6 values
4. Model validates required fields
5. CreatedAt defaults to current UTC time

**Technical Notes:**
- Follow existing Task.cs pattern
- Use BsonId and BsonElement attributes
- NotificationType enum matches PRD specification

**Estimated Effort:** 2-3 hours with AI  
**Dependencies:** None

---

### US-029-202: NotificationRepository
**As a** developer  
**I want** a NotificationRepository for data access  
**So that** I can perform CRUD operations on notifications

**Acceptance Criteria:**
1. Repository in Features/Notifications/Repositories
2. CreateAsync method for new notifications
3. GetByUserIdAsync method with pagination
4. MarkAsReadAsync method for single notification
5. MarkAllAsReadAsync method for user's notifications
6. GetUnreadCountAsync method for badge

**Technical Notes:**
- Inject IMongoDatabase dependency
- Use MongoDB.Driver for all operations
- Follow existing TaskRepository pattern
- Return Task<T> for all async methods

**Estimated Effort:** 4-6 hours with AI  
**Dependencies:** US-029-201

---

### US-029-203: NotificationsController
**As a** developer  
**I want** REST API endpoints for notifications  
**So that** the frontend can interact with notification data

**Acceptance Criteria:**
1. NotificationsController in Features/Notifications/Controllers
2. POST /api/notifications endpoint (admin/system use)
3. GET /api/notifications?userId=X&skip=0&take=50 endpoint
4. PUT /api/notifications/{id}/read endpoint
5. PUT /api/notifications/read-all?userId=X endpoint
6. All endpoints use [Authorize] attribute

**Technical Notes:**
- Follow existing TasksController pattern
- Use DTOs for all request/response models
- Return appropriate HTTP status codes (200, 201, 404)
- Validate userId matches authenticated user (except admins)

**Estimated Effort:** 4-6 hours with AI  
**Dependencies:** US-029-204

---

### US-029-204: NotificationService Business Logic
**As a** developer  
**I want** a NotificationService for business logic  
**So that** I can encapsulate notification rules and validation

**Acceptance Criteria:**
1. NotificationService in Features/Notifications/Services
2. CreateNotificationAsync method with validation
3. GetUserNotificationsAsync with pagination
4. MarkAsReadAsync with ownership validation
5. MarkAllAsReadAsync with ownership validation
6. GetUnreadCountAsync for user

**Technical Notes:**
- Inject NotificationRepository dependency
- Validate user ownership before marking as read
- Log notification creation for debugging
- Use async/await throughout

**Estimated Effort:** 4-6 hours with AI  
**Dependencies:** US-029-202

---

### US-029-205: MongoDB Indexes for Performance
**As a** developer  
**I want** MongoDB indexes on notification queries  
**So that** queries perform efficiently at scale

**Acceptance Criteria:**
1. Compound index on (UserId, CreatedAt DESC)
2. Compound index on (UserId, IsRead, CreatedAt DESC)
3. Index creation script in backend/scripts
4. Indexes validated with explain() command

**Technical Notes:**
- Create CreateMongoIndexes.js script
- Run script in MongoDB shell or with driver
- Document index rationale in comments
- Consider TTL index for old notifications (optional)

**Estimated Effort:** 2-3 hours with AI  
**Dependencies:** US-029-202

---

### US-029-206: DTOs for Request/Response Models
**As a** developer  
**I want** DTOs for all notification API operations  
**So that** I have type-safe contracts between frontend/backend

**Acceptance Criteria:**
1. NotificationResponse DTO with all fields
2. CreateNotificationRequest DTO
3. GetNotificationsRequest DTO with pagination
4. DTOs serialize to camelCase JSON

**Technical Notes:**
- DTOs in Features/Notifications/Models
- Follow existing TaskResponse.cs pattern
- Use JsonPropertyName if camelCase not automatic
- DTOs match TypeScript interfaces on frontend

**Estimated Effort:** 2-3 hours with AI  
**Dependencies:** US-029-201

---

### US-029-301: TaskService Integration - Task Assignment
**As a** developer  
**I want** TaskService to create notifications when tasks are assigned  
**So that** users are notified of new assignments

**Acceptance Criteria:**
1. AssignAsync method creates TASK_ASSIGNED notification
2. Notification sent to assigned user (not assigner)
3. Content includes task title and assigner name
4. Notification created in same transaction context
5. Error in notification creation doesn't block task assignment

**Technical Notes:**
- Inject NotificationService into TaskService
- Call CreateNotificationAsync after task assignment
- Use try-catch to isolate notification errors
- Log notification failures without throwing

**Estimated Effort:** 3-4 hours with AI  
**Dependencies:** US-029-204

**Regression Testing:**
- Verify all existing TaskService unit tests pass
- Verify task assignment flow unchanged
- Verify task appears in assignee's task list
- Verify group task counts update correctly

---

### US-029-302: TaskService Integration - Status Changes
**As a** developer  
**I want** TaskService to create notifications on status changes  
**So that** relevant users are informed of progress

**Acceptance Criteria:**
1. UpdateStatusAsync creates TASK_STATUS_CHANGED notification
2. Notification sent to task creator (not status changer)
3. Content includes task title, old status, new status
4. Notification not created for status changes by task creator
5. Works with admin approval flow (FR-028)

**Technical Notes:**
- Check if user is task creator before notifying
- Include status names in notification content
- Ensure PendingApproval status handled correctly

**Estimated Effort:** 3-4 hours with AI  
**Dependencies:** US-029-301

**Regression Testing:**
- Verify admin approval logic still enforced (FR-028)
- Verify status dropdown filtering unchanged
- Verify task status persists correctly
- Verify optimistic updates work correctly

---

### US-029-303: TaskService Integration - Pending Approvals
**As a** developer  
**I want** TaskService to notify admins when approval needed  
**So that** admins can review and approve tasks promptly

**Acceptance Criteria:**
1. UpdateStatusAsync creates TASK_PENDING_APPROVAL notification
2. Notification sent to all group admins
3. Content includes task title and submitter name
4. Only triggered when transitioning to PendingApproval
5. Not triggered if task doesn't require approval

**Technical Notes:**
- Query GroupService or repository for admin users
- Create notification for each admin
- Check task.RequiresAdminApproval flag

**Estimated Effort:** 4-5 hours with AI  
**Dependencies:** US-029-302

**Regression Testing:**
- Verify non-admin cannot mark approval tasks as Completed
- Verify admin can approve from PendingApproval
- Verify client-side validation in GroupTasksPanel unchanged
- Verify TaskCard approval badge displays correctly

---

### US-029-304: GroupService Integration - Member Joins
**As a** developer  
**I want** GroupService to notify when members join groups  
**So that** group members are aware of new participants

**Acceptance Criteria:**
1. AcceptInvitationAsync creates GROUP_MEMBER_JOINED notification
2. Notification sent to all existing group members
3. Content includes new member name and group name
4. Not sent to the joining member themselves

**Technical Notes:**
- Query group members before accepting invitation
- Create notification for each existing member
- Use group name from Group entity

**Estimated Effort:** 3-4 hours with AI  
**Dependencies:** US-029-204

**Regression Testing:**
- Verify invitation acceptance flow unchanged
- Verify group member list updates correctly
- Verify new member gains proper permissions
- Verify InvitationStatus updated to Accepted

---

### US-029-305: GroupService Integration - Member Removals
**As a** developer  
**I want** GroupService to notify when members are removed  
**So that** remaining members and removed member are informed

**Acceptance Criteria:**
1. RemoveMemberAsync creates GROUP_MEMBER_REMOVED notification
2. Notification sent to removed member
3. Notification sent to all remaining group members
4. Content includes removed member name and group name

**Technical Notes:**
- Create notification before removing member (to access group data)
- Separate notifications for removed member vs. remaining members
- Use different content for each audience

**Estimated Effort:** 3-4 hours with AI  
**Dependencies:** US-029-304

**Regression Testing:**
- Verify member removal permissions enforced (only admins)
- Verify removed member loses access to group tasks
- Verify group member count decrements correctly
- Verify member removal appears in audit log (if exists)

---

### US-029-306: InvitationService Integration - Invitations
**As a** developer  
**I want** InvitationService to notify users of group invitations  
**So that** users know they've been invited to join groups

**Acceptance Criteria:**
1. CreateInvitationAsync creates GROUP_INVITATION_RECEIVED notification
2. Notification sent to invitee
3. Content includes inviter name and group name
4. Notification links to invitation in UI (optional)

**Technical Notes:**
- Create notification immediately after invitation created
- Include invitation ID in content for linking
- Handle email vs. userId invitations appropriately

**Estimated Effort:** 3-4 hours with AI  
**Dependencies:** US-029-204

**Regression Testing:**
- Verify invitation creation flow unchanged
- Verify email invitations still sent (if feature exists)
- Verify invitation status displays correctly
- Verify expired invitations handled correctly

---

### US-029-401: Backend Unit Tests for NotificationService
**As a** developer  
**I want** comprehensive unit tests for NotificationService  
**So that** I can trust the business logic is correct

**Acceptance Criteria:**
1. Test CreateNotificationAsync success case
2. Test CreateNotificationAsync validation failure
3. Test GetUserNotificationsAsync pagination
4. Test MarkAsReadAsync ownership validation
5. Test MarkAllAsReadAsync for user
6. Test GetUnreadCountAsync accuracy
7. 70%+ code coverage for NotificationService

**Technical Notes:**
- Use xUnit test framework
- Mock NotificationRepository with Moq
- Test edge cases (null values, empty results)
- Follow existing TaskServiceTests.cs pattern

**Estimated Effort:** 4-5 hours with AI  
**Dependencies:** US-029-204

---

### US-029-402: Backend Integration Tests for NotificationsController
**As a** developer  
**I want** integration tests for NotificationsController endpoints  
**So that** I can verify API contracts and behavior

**Acceptance Criteria:**
1. Test POST /api/notifications returns 201
2. Test GET /api/notifications returns paginated results
3. Test PUT /api/notifications/{id}/read returns 200
4. Test PUT /api/notifications/read-all returns 200
5. Test authorization (401 without token)
6. Test validation (400 for invalid requests)

**Technical Notes:**
- Use WebApplicationFactory for integration tests
- Test against real MongoDB or in-memory database
- Verify response DTOs match expected shape
- Test pagination behavior (skip/take)

**Estimated Effort:** 4-5 hours with AI  
**Dependencies:** US-029-203

---

### US-029-403: Frontend Component Tests
**As a** developer  
**I want** tests for notification UI components  
**So that** I can prevent UI regressions

**Acceptance Criteria:**
1. Test NotificationBell renders with unread count
2. Test NotificationBell opens modal on click
3. Test NotificationModal renders notification list
4. Test NotificationItem marks as read on click
5. Test mark all as read button functionality
6. Test polling mechanism starts/stops correctly

**Technical Notes:**
- Use Vitest + React Testing Library
- Mock RTK Query hooks with MSW or manual mocks
- Test user interactions with fireEvent/userEvent
- Test loading/error states

**Estimated Effort:** 5-6 hours with AI  
**Dependencies:** US-029-101 to US-029-107

---

### US-029-404: Regression Tests for Modified Services
**As a** developer  
**I want** regression tests for TaskService, GroupService, InvitationService  
**So that** I can ensure notification integration didn't break existing features

**Acceptance Criteria:**
1. All existing TaskService tests pass
2. All existing GroupService tests pass
3. All existing InvitationService tests pass
4. New tests for notification trigger paths
5. Test notification creation failures don't block operations

**Technical Notes:**
- Run full test suite: `dotnet test`
- Add tests for notification error scenarios
- Mock NotificationService in existing service tests
- Verify services still work without notifications

**Estimated Effort:** 3-4 hours with AI  
**Dependencies:** US-029-301 to US-029-306

---

## Risk Management

### High-Priority Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Polling performance degrades with many users | High | Medium | Implement exponential backoff, monitor performance, consider WebSockets later |
| MongoDB query performance at scale | High | Low | Create proper indexes, test with realistic data volumes, optimize queries |
| Notification creation failures break user flows | High | Low | Use try-catch isolation, log failures, don't block primary operations |

### Medium-Priority Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Unread count synchronization issues | Medium | Medium | Use optimistic updates, invalidate cache on errors, test edge cases |
| Translation quality for Hebrew | Medium | Low | Review with native speaker, test RTL layout, iterate on wording |
| Excessive notification volume annoys users | Medium | Medium | Group similar notifications, add user preferences later, monitor feedback |

### Low-Priority Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Browser compatibility issues | Low | Low | Test in Chrome, Safari, Firefox; use standard APIs |
| Memory leaks from polling | Low | Low | Clean up intervals on unmount, test with DevTools profiler |

---

## AI-Assisted Development Notes

### Productivity Multipliers
- **CRUD Operations:** 3-5x faster (models, repositories, DTOs)
- **Business Logic:** 2-3x faster (services, validation)
- **Frontend Components:** 2-3x faster (React components, hooks)
- **Testing:** 2-3x faster (test scaffolding, mocking)

### AI Strengths
- Boilerplate code generation (models, DTOs, repositories)
- Pattern replication (following existing TaskService, etc.)
- Test case generation (happy path, edge cases)
- Translation file updates (JSON structure)

### Human Required
- UX decisions (notification grouping, timing)
- Performance tuning (query optimization, polling intervals)
- Edge case identification (race conditions, error scenarios)
- Final acceptance testing (manual verification)

---

## Dependencies

### External Dependencies
- MongoDB 5.0+ (existing)
- .NET 9 (existing)
- React 18 (existing)
- RTK Query (existing)
- date-fns (may need to install)

### Internal Dependencies
```
EP-029-1 (Frontend UI) → EP-029-2 (Backend API) → EP-029-3 (Integration)
                                                ↓
                                          EP-029-4 (Testing)
```

**Critical Path:**
1. US-029-101 (NotificationBell)
2. US-029-102 (NotificationModal)
3. US-029-103 (NotificationItem)
4. US-029-201 (Domain Model)
5. US-029-202 (Repository)
6. US-029-204 (Service)
7. US-029-203 (Controller)
8. US-029-301 to US-029-306 (Integration triggers)

---

## Definition of Done

### Story-Level DoD
- [ ] Code implemented and follows existing patterns
- [ ] Unit tests written with 70%+ coverage
- [ ] Integration tests pass (if applicable)
- [ ] Code reviewed (or AI-verified for patterns)
- [ ] Localization complete (EN/HE)
- [ ] Manual testing completed
- [ ] No regressions introduced

### Epic-Level DoD
- [ ] All stories in epic complete
- [ ] End-to-end testing completed
- [ ] Performance testing completed
- [ ] Documentation updated
- [ ] Acceptance criteria met

### Release-Level DoD
- [ ] All epics complete
- [ ] Full regression test suite passes
- [ ] Production readiness checklist complete
- [ ] MongoDB indexes created in production
- [ ] Monitoring/logging verified
- [ ] Rollback plan documented

---

## Monitoring & Success Metrics

### Technical Metrics
- API response time: <200ms for notification queries
- Polling overhead: <1% CPU on client
- MongoDB query performance: All queries use indexes
- Test coverage: 70%+ for new code
- Zero regressions: All existing tests pass

### User Metrics (Post-Launch)
- Notification delivery success rate: >99%
- Average time to read notification: <5 minutes
- Mark-as-read success rate: >95%
- User satisfaction with notifications: >4/5 (survey)

### Operational Metrics
- Notification creation failures: <0.1%
- Database write latency: <50ms p95
- Polling error rate: <1%
- Memory usage growth: <5MB over 1 hour session

---

## Rollback Plan

### Immediate Rollback (P0 Issues)
If critical bugs discovered:
1. Disable polling in frontend (feature flag or code comment)
2. Remove notification triggers from services (comment out)
3. Keep backend API endpoints (safe, just unused)
4. Revert in stages: Integration → Backend → Frontend

### Partial Rollback (P1 Issues)
If specific notification type problematic:
1. Disable specific notification type in NotificationFactory
2. Keep other notification types active
3. Fix issue and re-enable

### Data Cleanup
If rollback required:
1. Notifications collection can remain (no harm)
2. Optionally clear: `db.notifications.deleteMany({})`
3. No schema migrations to revert

---

## Next Steps

1. Review and approve this workplan
2. Create Sprint 1 task board with US-029-101 to US-029-107
3. Set up MongoDB indexes script
4. Begin frontend component implementation (client-first)
5. Update progress.md after each story completion

---

**Last Updated:** December 24, 2025  
**Version:** 1.0  
**Status:** Ready for Implementation
