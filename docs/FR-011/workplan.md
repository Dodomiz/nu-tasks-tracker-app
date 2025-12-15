# Work Plan: FR-011 Leaderboard & Gamification

## Vision & Metrics
For group members and admins who want motivation and visibility into progress,
the Leaderboard & Gamification feature is a points-and-badges system that ranks users by activity, awards achievements, and updates in near real time.

- User: Leaderboard view loads in ≤200ms for 100 users; rank updates within ≤5s after point changes.
- Business: Drive engagement and completion with competitive rankings; highlight achievements.
- Technical: Redis cache with 5-min TTL; atomic point updates; archive monthly snapshots.

## Timeline: 4 Epics, 16 Stories, 2 Sprints

## Epics

## Epic E1: Client UI – Leaderboard & Badges
**Description:** Build leaderboard views (period selector), user profile stats, and badge gallery.
**Business Value:** Immediate visibility of progress and recognition.
**Success Criteria:** Users see ranks, points breakdown, completion %, and badges with medals for top 3.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-601: Leaderboard Table (Top 100)
**As a** User **I want to** view rankings **So that** I can compare progress

**Acceptance Criteria:**
- [ ] Period selector (week/month/quarter/year); medals for top 3; pagination up to 100.

**Technical Notes:** React + TS; RTK Query `GET /api/leaderboard/{groupId}`; Tailwind.
**Dependencies:** Backend leaderboard endpoint.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-602: User Profile Stats Card
**As a** User **I want to** view my stats **So that** I understand my performance

**Acceptance Criteria:**
- [ ] Points breakdown, completion rate, streak, badges list.

**Technical Notes:** RTK Query `GET /api/leaderboard/users/{userId}/stats`.
**Dependencies:** Backend stats endpoint.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-603: Badge Gallery
**As a** User **I want to** browse badges **So that** I can aim for achievements

**Acceptance Criteria:**
- [ ] Earned and available badges; rarity labels; details modal.

**Technical Notes:** `GET /api/badges/available`, `GET /api/badges/users/{userId}`.
**Dependencies:** Backend badge endpoints.
**Estimated Effort:** S (3)
**Priority:** Should

## Epic E2: Backend – Points, Leaderboard, Badges
**Description:** Implement point tracking, ranking, caching, badge unlock logic, and reset snapshots.
**Business Value:** Accurate and performant rankings with achievements.
**Success Criteria:** Atomic updates; cache invalidation; historical archiving.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-604: UserPoints Entity & Repository
**As a** Developer **I want to** store period points **So that** leaderboard queries are efficient

**Acceptance Criteria:**
- [ ] Entity, indexes, CRUD; unique (userId+groupId+period).

**Technical Notes:** MongoDB; compound indexes for queries.
**Dependencies:** Existing infra.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-605: PointService Integration
**As a** Developer **I want to** award/deduct points **So that** totals update correctly

**Acceptance Criteria:**
- [ ] `AwardPointsAsync` and `DeductPointsAsync`; breakdown updates; streak; cache invalidation.

**Technical Notes:** Transactions; audit via PointTransaction; ties to FR-008/FR-010.
**Dependencies:** Tasks/Feedback services.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-606: LeaderboardService & Controller
**As a** Developer **I want to** rank users **So that** the leaderboard displays correctly

**Acceptance Criteria:**
- [ ] Sorting rules; cache with 5-min TTL; GET endpoints.

**Technical Notes:** Redis; tie-breakers; user and badge hydration.
**Dependencies:** US-604, US-605.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-607: BadgeService & Controller
**As a** Developer **I want to** unlock and fetch badges **So that** users see achievements

**Acceptance Criteria:**
- [ ] Check unlocks on point updates; notify on unlock; badge endpoints.

**Technical Notes:** Seed predefined badges; criteria logic.
**Dependencies:** US-605.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-608: Reset & History Snapshots
**As a** Admin **I want to** archive and reset leaderboards **So that** new periods start clean

**Acceptance Criteria:**
- [ ] Snapshot creation; reset points; cache clear; notification broadcast.

**Technical Notes:** Hangfire scheduled job; manual POST endpoint.
**Dependencies:** US-606.
**Estimated Effort:** S (3)
**Priority:** Should

## Epic E3: Real-Time Updates
**Description:** Reflect rank changes within 5s of point awards.
**Business Value:** Keeps users engaged and informed.
**Success Criteria:** Cache invalidated and refreshed promptly; UI signals changes.
**Estimated Effort:** XS
**Priority:** High

### Story US-609: Cache Invalidation & SignalR Event
**As a** Developer **I want to** refresh leaderboard quickly **So that** users see updates

**Acceptance Criteria:**
- [ ] Invalidate cache on point change; emit `LeaderboardUpdated` via SignalR.

**Technical Notes:** Hook from PointService; client listens for refresh.
**Dependencies:** US-606.
**Estimated Effort:** XS (2)
**Priority:** Should

## Epic E4: Tests – Unit & Integration
**Description:** Validate point math, ranking, badge unlocks, and reset flows.
**Business Value:** Confidence and maintainability.
**Success Criteria:** ~70% coverage on gamification domain.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-610: Unit – PointService & BadgeService
**As a** Developer **I want to** test formulas **So that** math stays correct

**Acceptance Criteria:**
- [ ] Award/deduct flows; streaks; badge unlock criteria; cache invalidation.

**Technical Notes:** xUnit; fixtures; mocks.
**Dependencies:** Backend stories.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-611: Integration – Leaderboard APIs
**As a** Developer **I want to** verify endpoints **So that** UI contracts hold

**Acceptance Criteria:**
- [ ] GET rankings, history, stats; POST reset archives and clears.

**Technical Notes:** WebApplicationFactory; test Redis (embedded or mock).
**Dependencies:** US-606, US-608.
**Estimated Effort:** S (3)
**Priority:** Must

## Sprint Plan

## Sprint 1: Points + Leaderboard + UI
**Duration:** 2 weeks
**Sprint Goal:** Point system integration, leaderboard endpoints, core UI.
**Stories:** US-604 (M), US-605 (M), US-606 (S), US-601 (M), US-602 (S), US-610 (S)
**Capacity:** 10 days | **Committed:** ~22 points (incl. AI + buffer)

## Sprint 2: Badges, Reset, Real-Time, Tests
**Duration:** 2 weeks
**Sprint Goal:** Badge system, reset snapshots, real-time updates, and coverage.
**Stories:** US-607 (S), US-608 (S), US-603 (S), US-609 (XS), US-611 (S)
**Capacity:** 10 days | **Committed:** ~18 points (incl. AI + buffer)

## Dependencies & Risks
- Dependencies: FR-008 approvals, FR-010 feedback points, FR-009 notifications, Redis infra.
- Risks: Transactional correctness; caching consistency; badge criteria edge cases.

## Release Phases
- Phase 1 (MVP): Sprints 1-2
- Phase 2 (Enhancement): Team leaderboards, custom badges
- Phase 3 (Optimization): Decay, predictions, seasonal events
