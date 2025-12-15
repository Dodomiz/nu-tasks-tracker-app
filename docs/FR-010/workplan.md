# Work Plan: FR-010 Messaging & Feedback

## Vision & Metrics
For group members who need to collaborate and recognize good work,
the Messaging & Feedback feature is a real-time chat and reactions system that delivers instant messages, records read receipts, and awards points via emoji feedback on completed tasks.

- User: Messages deliver in ≤2s; last 50 messages load in ≤500ms; read receipts accurate.
- Business: Increase engagement and positive feedback; tie social recognition to leaderboard.
- Technical: Sustain 100 concurrent websocket users; enforce message ≤2000 chars; 1 reaction/user/task.

## Timeline: 4 Epics, 16 Stories, 2 Sprints

## Epics

## Epic E1: Client UI – Chat & Reactions
**Description:** Build conversation list, message thread, input with @mentions, and reaction UI on task details.
**Business Value:** Enables collaboration and recognition immediately visible to users.
**Success Criteria:** Users can chat in real time and react to tasks with points applied.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-501: Conversation List
**As a** User **I want to** browse my chats **So that** I can find conversations quickly

**Acceptance Criteria:**
- [ ] Shows Direct conversations with last message preview, unread count, updated time.
- [ ] Clicking opens thread.

**Technical Notes:** React + TS; RTK Query `GET /api/conversations`; Tailwind.
**Dependencies:** Backend conversations endpoint.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-502: Message Thread + Read Receipts
**As a** User **I want to** view and send messages **So that** I can collaborate

**Acceptance Criteria:**
- [ ] Real-time new messages; read receipt banner ("Read HH:MM").
- [ ] Pagination loads older messages (50 per page).

**Technical Notes:** SignalR `MessageHub`; `GET/POST /api/conversations/:id/messages`; `PUT /api/conversations/:id/read`.
**Dependencies:** Backend messaging endpoints + hub.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-503: Message Input with @mentions
**As a** User **I want to** mention users **So that** they are notified

**Acceptance Criteria:**
- [ ] Autocomplete @username; converts to userId in payload.
- [ ] Mentioned users receive notification.

**Technical Notes:** Client parse mentions; supportive API logic.
**Dependencies:** Notifications (FR-009); Messaging endpoints.
**Estimated Effort:** S (3)
**Priority:** Should

### Story US-504: Task Reaction Picker
**As a** User **I want to** react to completed tasks **So that** I can recognize work

**Acceptance Criteria:**
- [ ] Picker with 7 emojis; disallow own-task reactions; update reaction allowed.
- [ ] Points reflected on target user (positive +5, negative -2).

**Technical Notes:** RTK Query `POST/GET/DELETE /api/tasks/:id/feedback`.
**Dependencies:** Backend feedback endpoints; PointService stub.
**Estimated Effort:** S (3)
**Priority:** Must

## Epic E2: Backend – Messaging & Feedback APIs
**Description:** Implement repositories, services, controllers, and SignalR hub.
**Business Value:** Reliable delivery, persistence, and points application.
**Success Criteria:** Endpoints meet SLAs; reactions enforce constraints; indexes support queries.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-505: Conversation & Message Entities + Repo
**As a** Developer **I want to** persist messages **So that** history and receipts work

**Acceptance Criteria:**
- [ ] Conversation and Message models; indexes; repository CRUD; history pagination.

**Technical Notes:** MongoDB; compound indexes; repository pattern.
**Dependencies:** Existing infra.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-506: MessageService & Controller
**As a** Developer **I want to** send and fetch messages **So that** users can chat

**Acceptance Criteria:**
- [ ] `POST /api/conversations/:id/messages`, `GET messages`, `PUT read`; mention parsing; notification triggers.

**Technical Notes:** SignalR integration; validation; status updates.
**Dependencies:** US-505; FR-009.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-507: FeedbackService & Controller
**As a** Developer **I want to** manage task reactions **So that** points are awarded/deducted correctly

**Acceptance Criteria:**
- [ ] `POST/GET/DELETE /api/tasks/:id/feedback`; upsert; block own-task; validate completed/approved.

**Technical Notes:** PointService stub; unique index (userId+taskId).
**Dependencies:** Tasks (FR-005), Points (FR-011 stub).
**Estimated Effort:** S (3)
**Priority:** Must

## Epic E3: Real-Time & Notifications
**Description:** Ensure instant delivery and alerts via SignalR and NotificationService.
**Business Value:** Improves responsiveness and engagement.
**Success Criteria:** Messages and receipts update live; mentions trigger notifications.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-508: SignalR MessageHub
**As a** Developer **I want to** broadcast messages and receipts **So that** users see updates instantly

**Acceptance Criteria:**
- [ ] Join/leave conversation groups; `MessageReceived`, `ReadReceiptUpdated`, typing indicator.

**Technical Notes:** ASP.NET Core SignalR; reconnect handling.
**Dependencies:** US-506.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-509: Message Notifications
**As a** Developer **I want to** alert recipients and mentions **So that** they respond quickly

**Acceptance Criteria:**
- [ ] Create `Message` notifications; integrate with FR-009.

**Technical Notes:** NotificationService; action URLs.
**Dependencies:** FR-009.
**Estimated Effort:** XS (2)
**Priority:** Should

## Epic E4: Tests – Unit & Integration
**Description:** Validate messaging, feedback, and point calculations.
**Business Value:** Confidence in correctness and performance.
**Success Criteria:** ~70% coverage across messaging/feedback.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-510: Unit – MessageService & FeedbackService
**As a** Developer **I want to** test core logic **So that** behavior is correct

**Acceptance Criteria:**
- [ ] Mentions parsing; read receipts; reaction upsert; own-task block; point mapping.

**Technical Notes:** xUnit; mocks; controlled datasets.
**Dependencies:** Backend stories.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-511: Integration – Messaging & Feedback APIs
**As a** Developer **I want to** verify endpoints **So that** UI contracts hold

**Acceptance Criteria:**
- [ ] Send message; get history; mark read; add/get/remove feedback with points updates.

**Technical Notes:** WebApplicationFactory; test Mongo; SignalR verified via hub test or mocked.
**Dependencies:** US-506, US-507.
**Estimated Effort:** S (3)
**Priority:** Must

## Sprint Plan

## Sprint 1: Backend Core + Chat UI
**Duration:** 2 weeks
**Sprint Goal:** Messaging entities/repos/services, basic chat UI and real-time delivery.
**Stories:** US-505 (M), US-506 (M), US-508 (S), US-501 (S), US-502 (M), US-510 (S)
**Capacity:** 10 days | **Committed:** ~23 points (incl. AI + buffer)

## Sprint 2: Feedback + Polish + Tests
**Duration:** 2 weeks
**Sprint Goal:** Feedback reactions with points, mentions, notifications, and coverage.
**Stories:** US-507 (S), US-503 (S), US-504 (S), US-509 (XS), US-511 (S)
**Capacity:** 10 days | **Committed:** ~16 points (incl. AI + buffer)

## Dependencies & Risks
- Dependencies: FR-005 tasks; FR-009 notifications; FR-011 points/leaderboard stub.
- Risks: SignalR scale; reaction spam; negative feedback abuse; mention parsing accuracy.

## Release Phases
- Phase 1 (MVP): Sprints 1-2
- Phase 2 (Enhancement): Group chats, editing/deleting, file attachments
- Phase 3 (Optimization): Search, encryption, scheduled messages
