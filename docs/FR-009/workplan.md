# Work Plan: FR-009 Notifications & Reminders

## Vision & Metrics
For Users and Admins who need timely, configurable alerts,
the Notifications feature is a delivery and scheduling system that sends push/in-app reminders, summarizes tasks, and supports broadcasts with real-time unread counts.

- User: Event notifications delivered in ≤5s; daily summary at local 08:00; DND respected.
- Business: Raise completion rate toward 90%; maintain user control via preferences.
- Technical: Process 500K notifications/day; Hangfire jobs <1s per 100 users; 90-day TTL; at-least-once delivery.

## Timeline: 5 Epics, 18 Stories, 2 Sprints

## Epics

## Epic E1: Client UI – Notification Center & Badge
**Description:** Build inbox UI, unread badge in header, and preferences page.
**Business Value:** Improves engagement and control with transparent alerts.
**Success Criteria:** Users see notifications, mark read, filter, and configure schedules.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-401: Notification Center (Inbox)
**As a** User **I want to** view and manage notifications **So that** I stay informed

**Acceptance Criteria:**
- [ ] List with read/unread states, type icons, action links; filters by type/read.
- [ ] Pagination: default 50, max 100.

**Technical Notes:** React + TS; RTK Query `GET /api/notifications`; Tailwind.
**Dependencies:** Backend list endpoint.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-402: Unread Badge in Header
**As a** User **I want to** see unread count **So that** I notice new notifications

**Acceptance Criteria:**
- [ ] Real-time updates via SignalR; fallback polling every 60s.

**Technical Notes:** Hub `/hubs/notifications`; `GET /api/notifications/unread-count` fallback.
**Dependencies:** Backend hub + endpoint.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-403: Mark Read/Read-All
**As a** User **I want to** mark items as read **So that** my inbox stays tidy

**Acceptance Criteria:**
- [ ] Single and bulk read actions; badge decrements immediately.

**Technical Notes:** `PUT /api/notifications/{id}/read`; `POST /api/notifications/read-all`.
**Dependencies:** Backend endpoints.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-404: Notification Preferences Page
**As a** User **I want to** configure reminder times and DND **So that** alerts fit my schedule

**Acceptance Criteria:**
- [ ] Toggle types, set times (HH:mm), DND start/end; frequent mode.

**Technical Notes:** `PUT /api/preferences/notifications`; client-side validation.
**Dependencies:** Backend preferences.
**Estimated Effort:** S (3)
**Priority:** Must

## Epic E2: Backend – Core Notifications & FCM
**Description:** Implement notification entity, service, repository, endpoints, and FCM integration.
**Business Value:** Enables delivery, status tracking, and read/unread logic.
**Success Criteria:** Reliable, fast pushes; preferences enforced; TTL retention.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-405: Notification Entity, Repository, Service
**As a** Developer **I want to** persist and manage notifications **So that** UI can query and update

**Acceptance Criteria:**
- [ ] CRUD + mark read; unread count; indexes; 90-day TTL.

**Technical Notes:** MongoDB; repository pattern; standard response wrapper.
**Dependencies:** Existing infra.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-406: FCM Token Registration
**As a** User **I want to** register device token **So that** I can receive pushes

**Acceptance Criteria:**
- [ ] `POST /api/notifications/fcm-token` stores token with platform; handles invalidation.

**Technical Notes:** ServerAccess for FCM; token lifecycle.
**Dependencies:** User profile extension.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-407: Send Push via FCM
**As a** Developer **I want to** deliver push notifications **So that** users receive alerts promptly

**Acceptance Criteria:**
- [ ] `FCMServerAccess.SendToDeviceAsync` and topic support; idempotency; retry logic.

**Technical Notes:** Firebase Admin SDK; failure handling; deduplication.
**Dependencies:** US-405, US-406.
**Estimated Effort:** S (3)
**Priority:** Must

## Epic E3: Scheduling – Hangfire Jobs
**Description:** Background jobs for daily summary, reminders, and cleanup.
**Business Value:** Automates reminders respecting user timezone and DND.
**Success Criteria:** Jobs trigger reliably with proper schedule logic.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-408: Daily Summary Job
**As a** Developer **I want to** send morning summaries **So that** users plan their day

**Acceptance Criteria:**
- [ ] 08:00 per user timezone; DND respected; body includes task count.

**Technical Notes:** Hangfire recurring job; timezone grouping; conversions.
**Dependencies:** TaskRepository; Preferences.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-409: Reminder Job (Configurable + Frequent Mode)
**As a** Developer **I want to** send time-based reminders **So that** users get nudges

**Acceptance Criteria:**
- [ ] Configurable times; frequent mode 7-11 PM every 30 min; DND logic.

**Technical Notes:** Hangfire 30-min schedule; user-time checks.
**Dependencies:** Preferences; TaskRepository.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-410: Cleanup Job (TTL/Backup)
**As a** Developer **I want to** purge old notifications **So that** storage remains manageable

**Acceptance Criteria:**
- [ ] 90-day TTL + daily cleanup at 2:00 AM UTC.

**Technical Notes:** TTL index + job.
**Dependencies:** US-405.
**Estimated Effort:** XS (2)
**Priority:** Should

## Epic E4: Real-Time & Admin Broadcast
**Description:** SignalR hub for unread count; broadcast endpoint and UI.
**Business Value:** Immediate feedback and announcements.
**Success Criteria:** Live badge updates; broadcasts reach intended audience.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-411: SignalR NotificationHub
**As a** Developer **I want to** push unread count changes **So that** the UI updates instantly

**Acceptance Criteria:**
- [ ] Hub groups by user ID; unread count event after creation/mark read.

**Technical Notes:** ASP.NET Core SignalR; auto-reconnect.
**Dependencies:** US-405.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-412: Admin Broadcast Endpoint & UI
**As a** Admin **I want to** send announcements **So that** groups are notified

**Acceptance Criteria:**
- [ ] `POST /api/notifications/broadcast` and modal UI; summary response.

**Technical Notes:** FCM topic or per-token loop; rate limits.
**Dependencies:** US-407.
**Estimated Effort:** S (3)
**Priority:** Should

## Epic E5: Tests – Unit, Integration, Jobs
**Description:** Verify service logic, endpoints, and job scheduling behavior.
**Business Value:** Ensures reliability and user trust.
**Success Criteria:** ~70% coverage on notification domain.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-413: Unit – DND, Read/Unread, Unread Count
**As a** Developer **I want to** test critical logic **So that** behavior is correct

**Acceptance Criteria:**
- [ ] Overnight DND edge cases; mark read; unread count scope (last 7 days).

**Technical Notes:** xUnit; time conversions.
**Dependencies:** US-405.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-414: Integration – Notification APIs
**As a** Developer **I want to** verify endpoints **So that** UI contracts hold

**Acceptance Criteria:**
- [ ] List, mark read, read-all, preferences, FCM token registration.

**Technical Notes:** WebApplicationFactory; seeded user/profile.
**Dependencies:** US-405, US-406.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-415: Job Behavior – Summary & Reminders
**As a** Developer **I want to** validate schedule logic **So that** jobs respect timezone/DND

**Acceptance Criteria:**
- [ ] Summary at 08:00 local; reminders at configured times; frequent-mode windows.

**Technical Notes:** Testable job methods with injected clock; stub repositories.
**Dependencies:** US-408, US-409.
**Estimated Effort:** S (3)
**Priority:** Should

## Sprint Plan

## Sprint 1: Backend Core + UI Basics
**Duration:** 2 weeks
**Sprint Goal:** Core notification service, FCM token registration, inbox + badge.
**Stories:** US-405 (M), US-406 (S), US-407 (S), US-401 (M), US-402 (S), US-403 (S), US-413 (S), US-414 (S)
**Capacity:** 10 days | **Committed:** ~25 points (incl. AI + buffer)

## Sprint 2: Scheduling, Real-Time, Preferences, Broadcast
**Duration:** 2 weeks
**Sprint Goal:** Jobs, preferences, SignalR hub, and broadcast.
**Stories:** US-408 (S), US-409 (S), US-410 (XS), US-404 (S), US-411 (S), US-412 (S), US-415 (S)
**Capacity:** 10 days | **Committed:** ~21 points (incl. AI + buffer)

## Dependencies & Risks
- Dependencies: FCM setup; FR-005 (tasks); FR-008 (approval/rejection events); FR-010 (messages).
- Risks: Timezone/DND complexity; push permissions; rate limits; large-scale throughput.

## Release Phases
- Phase 1 (MVP): Sprints 1-2
- Phase 2 (Enhancement): Email/SMS fallback, smart scheduling
- Phase 3 (Optimization): Analytics, grouping, advanced permissions
