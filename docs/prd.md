# Product Requirements Document (PRD)
# NU - Tasks Management Application

**Document Version:** 1.1  
**Project Name:** NU (Tasks Tracker)  
**Date:** December 14, 2025  
**Status:** Active  
**Tech Stack:** ASP.NET Core (.NET 8), MongoDB, React Native (Expo), Next.js, Redux Toolkit

---

## 1. Executive Summary

**NU** is a cross-platform task management application designed for families, couples, roommates, and small businesses (up to 20 members per group). The platform addresses the challenge of unclear task ownership and unfair workload distribution through transparent task assignment, automated scheduling, smart notifications, and gamification features including leaderboards, competitive task races, and reward systems.

The application enables:
- Real-time task synchronization across mobile (iOS/Android) and web platforms
- AI-powered task distribution for fair workload balancing
- Public/private task visibility for sensitive assignments
- Competitive task races with rewards to boost engagement
- Recognition system for exceptional performance

Built with ASP.NET Core backend, MongoDB database, React Native mobile apps, and Next.js web application, NU provides seamless real-time updates and push notifications to ensure accountability and motivation in shared task management.

---

## 2. Problem Statement

**Core Problems:**
- **Unclear Responsibility:** Family members and roommates lack clarity about who is responsible for which tasks
- **Forgotten Tasks:** Recurring chores are frequently neglected or forgotten
- **Unequal Distribution:** No objective system to ensure fair workload distribution
- **No Accountability:** Difficulty tracking who completed what and when
- **Low Motivation:** Lack of recognition or incentive for consistent task completion

**Impact:**
- Frequent conflicts and arguments over household responsibilities
- Tasks remain incomplete or significantly delayed
- No historical record of individual contributions
- Perception of unfairness leads to frustration and resentment
- Manual task assignment consumes excessive time and energy

**Solution:**
NU provides a structured, transparent, and gamified approach with automated scheduling, difficulty-based fair distribution, AI-powered task assignment, competitive races, and reward systems to drive engagement and accountability.

---

## 3. Goals & Non-Goals

### Goals
1. **Transparency:** Enable all group members to view task assignments and completion status in real-time
2. **Fairness:** Ensure equal workload distribution using difficulty-based point systems (variance < 15%)
3. **Accountability:** Track all task actions with timestamps, approval workflows, and audit logs
4. **Automation:** Minimize manual scheduling through recurring tasks and AI-powered distribution
5. **Engagement:** Drive participation through gamification (leaderboards, races, rewards, badges)
6. **User Adoption:** Achieve 80% active usage within 2 weeks of group onboarding
7. **Task Completion:** Maintain 85% on-time task completion rate

### Non-Goals
- **Project Management:** NU is not designed for complex project workflows with dependencies, Gantt charts, or critical path analysis
- **Time Tracking:** Not a time-clock or billing system for professional services
- **Large Organizations:** Not optimized for groups exceeding 20 members or enterprise-scale deployments
- **Advanced Collaboration:** No built-in video conferencing, document editing, or file storage beyond task-related attachments
- **Financial Transactions:** Rewards are descriptive (e.g., "$50 gift card") but no payment processing or cryptocurrency integration

---

## 4. User Flows

### Flow 1: Admin Creates Group and Assigns First Tasks

**Actors:** Admin (Group Creator)

**Main Flow:**
1. Admin registers account → email verification → login
2. Admin creates new group (name, description, optional avatar)
3. Admin becomes group owner with Admin privileges
4. Admin invites members via email or shareable link
5. Admin creates tasks from library or custom
6. Admin assigns tasks to specific members with due dates
7. Admin sets recurring schedule (daily, weekly, monthly, custom)
8. Admin reviews distribution preview and confirms
9. Members receive notifications of new task assignments

**Decision Points:**
- If task library sufficient → select from library; else → create custom task
- If workload unbalanced → use AI distribution; else → manual assignment

**Edge Cases:**
- Invited member email not found → send invitation link
- Member declines invitation → Admin removes from pending list
- No tasks in preferred category → AI suggests alternative assignments

---

### Flow 2: Regular User Completes Task and Earns Points

**Actors:** Regular User

**Main Flow:**
1. User opens app → views today's task list
2. User selects task → marks "In Progress"
3. User completes task → marks "Completed"
4. User adds optional notes and/or photo proof
5. Admin receives notification for approval
6. Admin reviews and approves → task status changes to "Approved"
7. User earns points (difficulty × 10 + on-time bonus + feedback)
8. Leaderboard updates with new ranking
9. User receives feedback notification (👍 🎉 ⭐)

**Decision Points:**
- If task requires approval → await Admin confirmation; else → auto-approve
- If completed on-time → +10% bonus points; else → base points only
- If Admin rejects → user receives redo request notification

**Edge Cases:**
- User forgets to mark completed → auto-reminder at 7 PM
- Task overdue → status changes to "Overdue", no bonus points
- Network offline → task cached locally, syncs when online

---

### Flow 3: Admin Creates Race with Reward

**Actors:** Admin

**Main Flow:**
1. Admin navigates to "Races" section → clicks "Create Race"
2. Admin enters race name, description, reward details (text + optional image)
3. Admin selects race tasks (from existing or creates new)
4. Admin sets race period (start date/time, end date/time)
5. Admin selects participants (all members or specific users)
6. Admin defines winning criteria (most tasks completed or highest points)
7. Admin reviews and publishes race
8. Participants receive race start notification
9. Users view race dashboard with real-time leaderboard
10. Race ends → winner announced via notification
11. Winner's reward displayed in profile "My Rewards" section

**Decision Points:**
- If tie occurs → apply tiebreaker (first to finish or split reward)
- If participant leaves group → remove from race automatically

**Edge Cases:**
- No participants complete any tasks → race ends with no winner
- Multiple races overlap → users see combined task list with race indicators
- Admin deletes race mid-competition → participants notified, tasks remain assigned

---

### Flow 4: Admin Awards Reward for Exceptional Performance

**Actors:** Admin

**Main Flow:**
1. Admin reviews completed task history
2. Admin selects one or multiple completed tasks
3. Admin clicks "Award Reward" button
4. Admin enters reward description (e.g., "Movie night of your choice")
5. Admin optionally adds reward image and notes
6. Admin selects recipient(s) and confirms
7. Recipient receives notification: "You earned a reward!"
8. Reward appears in user's "My Rewards" section with associated task(s)
9. Admin marks reward as "Claimed" when fulfilled

**Decision Points:**
- If multiple users completed task → award to one or all
- If reward budget constrained → Admin adjusts reward value

**Edge Cases:**
- User no longer in group → reward notification fails gracefully
- Reward not claimed within 30 days → reminder notification sent

---

### Flow 5: User Requests Task Swap

**Actors:** Regular User, Another User, Admin

**Main Flow:**
1. User views assigned task → clicks "Request Swap"
2. User selects another member to swap with
3. System sends swap request notification to target member
4. Target member accepts or declines
5. If accepted → Admin receives approval request
6. Admin reviews swap rationale and approves/rejects
7. If approved → tasks reassigned, notifications sent to both users
8. Task history logs swap action with timestamp

**Decision Points:**
- If target declines → requester notified, can request from different member
- If Admin rejects → both users notified with rejection reason

**Edge Cases:**
- Target user unavailable for swap period → system suggests alternative members
- Both tasks have different difficulty → Admin adjusts point allocation if needed

---

## 5. Functional Requirements

### FR-001: User Authentication & Authorization
- Email/password registration with validation (min 8 chars, uppercase, lowercase, digit)
- Email verification via link
- Login with JWT (60 min expiry) and refresh tokens (7 days)
- Password reset via email
- Account lockout after 5 failed login attempts
- Future: OAuth login (Google, Facebook, Apple)

### FR-002: Group Management
- Create group (name, description, avatar, timezone, language)
- Invite members via email or shareable link (max 20 members)
- Admin can promote users, remove members
- Users can join multiple groups
- Switch between groups via dropdown/tabs

### FR-003: Category Management
- System-provided default categories: House, Yard, Pets, Studies, Work, Vehicle, Finance, Shopping, Health, Other
- Each category has icon and color
- Admin can create/edit/delete custom categories
- Categories can be group-specific or global

### FR-004: Task Library
- Global task library with predefined tasks (name, category, description, difficulty 1-10, default frequency, duration)
- Admin can add custom tasks to group library
- Regular users can request new tasks (requires Admin approval)

### FR-005: Task Creation & Assignment
- Create tasks from library or scratch
- Assign to specific users with deadline (date + time)
- Set frequency: One-time, Daily, Weekly, Bi-weekly, Monthly, Quarterly, Yearly, Custom
- Task status: Pending, In Progress, Completed, Overdue
- Admin can edit, reassign, or delete tasks

### FR-006: Difficulty Levels & Workload Balancing
- Difficulty scale 1-10
- Calculate total workload per user (sum of difficulty points)
- Display workload in Admin dashboard
- Target: workload variance < 15% across users

### FR-007: AI-Powered Task Distribution
- "Auto Distribute" feature considers: current workload, preferences, history, availability, fairness
- Admin selects date range and users
- Preview distribution before confirmation
- Users mark category preferences and unavailability dates

### FR-008: Task Completion & Approval
- Users mark tasks as completed with optional notes and photo proof
- Admin approval required (configurable per task)
- Admin can reject and request redo
- On-time completion earns 10% bonus points
- Completed tasks show timestamp and user

### FR-009: Notifications & Reminders
- Daily summary at 8:00 AM: "You have X tasks today"
- Reminders at 3:00 PM, 5:00 PM, 6:00 PM
- Frequent reminders every 30 min from 7:00-11:00 PM (optional)
- Customizable notification times and Do Not Disturb hours
- Notifications for: new task, approval/rejection, messages, feedback
- Admin broadcast notifications
- Badge shows unread count

### FR-010: Messaging & Feedback
- Private messages between members with read receipts
- Persistent messaging history
- Quick feedback reactions: 👍 👎 💪 🎉 ⭐ 🔥 ❤️
- Feedback contributes to leaderboard (positive +5 points, negative -2 points)

### FR-011: Leaderboard & Gamification
- Points formula: `(Difficulty × 10) + On-Time Bonus (10%) + Feedback Points`
- Rankings: weekly, monthly, quarterly, yearly
- Display: rank, name, points, completion %, badges
- Top 3 users: 🥇 🥈 🥉
- Earn badges for milestones (e.g., "100 tasks completed")
- Leaderboard resets monthly (configurable)

### FR-012: User Dashboard & Views
- Today's summary: total tasks, completed, pending
- Views: My Tasks / All Tasks / Group-specific
- Filters: category, date, difficulty, status
- Sort by: due date, difficulty, category
- Calendar view and list view

### FR-013: Task Swap Requests
- Request to swap tasks with another member
- Requires Admin approval
- Notifications to all parties
- Logged in task history

### FR-014: Reports & Analytics
- Group statistics: total tasks, completion rate, average completion time
- Export reports (CSV, PDF)
- Visual charts: bar, line, progress bars
- Category breakdown and trend analysis

### FR-015: Multi-Group Support
- Create or join multiple groups
- Independent settings, tasks, leaderboards per group
- Notifications indicate group context

### FR-016: User Profile & Preferences
- Edit profile photo, name, email, password
- Set preferred/disliked categories
- Mark unavailability periods
- Language selection (English/Hebrew)
- Configure notification preferences

### FR-017: Task History & Audit Log
- Log all actions: creation, assignment, completion, rejection
- Include timestamp, user, action type
- Admin access to audit logs
- Retain logs for 12 months

### FR-018: Search & Filters
- Search tasks by name or description
- Filters: category, assigned user, status, date range
- Partial match and autocomplete support

### FR-019: Onboarding & Tutorial
- Welcome tutorial explaining key features
- Pre-populated sample tasks for demo
- Skip tutorial option
- Tooltips for first-time actions

### FR-020: Public & Private Tasks
- Admin marks tasks as "Public" or "Private"
- Public tasks visible to all members
- Private tasks visible only to assigned user and Admins
- Private tasks show generic label in activity feed
- Default setting: Public

### FR-021: Task Races with Rewards
- Admin creates race (name, description, reward, optional image)
- Select race tasks and participants
- Set race period (start/end date-time)
- Winner criteria: most tasks completed or highest points
- Tie-breaker: completion time or split reward
- Real-time race leaderboard
- Winner announcement via notification
- Multiple simultaneous races supported
- Archive completed races in race history

### FR-022: Rewards for Completed Tasks
- Admin selects completed tasks and awards reward
- Reward details: description, optional value/image, notes
- Notification sent to recipient(s)
- Rewards displayed in user profile "My Rewards" section
- Admin marks reward as "Claimed"
- Reward history visible to recipient and Admins only

### FR-023: Offline Mode (Future)
- View tasks offline
- Task completion syncs when online
- Conflict resolution: last write wins

---

## 6. Technical Considerations

### Architecture
- **Backend:** ASP.NET Core 8 (C#) with feature-based structure
  - Controller → HTTP request/response, validation
  - Service → business logic
  - ServerAccess → third-party integrations
  - Repository → MongoDB access
- **Database:** MongoDB (document-based, flexible schema)
- **Frontend Mobile:** React Native (Expo) with NativeWind, Redux Toolkit, React Navigation
- **Frontend Web:** Next.js 15 (React 19) with Tailwind CSS, Redux Toolkit
- **Real-time:** SignalR for live updates
- **Authentication:** JWT tokens with refresh mechanism
- **State Management:** Redux Toolkit with RTK Query for server state
- **API Client:** Axios

### External Dependencies
- **Push Notifications:** Firebase Cloud Messaging (FCM) for Android, Apple Push Notification Service (APNS) for iOS
- **AI:** OpenAI API (GPT-4) for intelligent task distribution
- **Email:** SendGrid or SMTP for verification and password reset
- **Logging:** Serilog with file sinks
- **API Documentation:** Swagger/OpenAPI

### Performance
- API response time < 200ms for 95% of requests
- Mobile app launch time < 2 seconds
- Web app initial load time < 3 seconds
- Real-time notifications delivered within 1 second
- Support up to 10,000 concurrent users

### Security
- HTTPS only for all API endpoints
- JWT signed with 256-bit key
- Passwords hashed using ASP.NET Core Identity (PBKDF2)
- Parameterized queries via EF Core/MongoDB driver
- Input sanitization for XSS prevention
- CORS configured for known origins
- Rate limiting on authentication endpoints (max 5 attempts/min)
- Sensitive data never logged

### Scalability
- Horizontal scaling via load balancer
- MongoDB connection pooling (max 100 connections)
- Caching for frequently accessed data (Redis recommended)
- Pagination for large datasets (default 20 items/page)

### Reliability
- System uptime: 99.5% (excluding maintenance)
- Automated database backups daily at 2:00 AM
- Graceful degradation if external services fail
- Error logging with Serilog
- Health check endpoint (`/health`)

### Compatibility
- Backend: .NET 8 runtime
- Database: MongoDB 4.4+
- Mobile: iOS 14+, Android 10+, React Native 0.72+, Expo SDK 49+
- Web: Chrome, Firefox, Safari, Edge (latest 2 versions), Next.js 15+, React 19+

### Internationalization
- Support English and Hebrew
- Externalized UI strings in translation files
- Localized date/time and currency formats
- RTL (Right-to-Left) support for Hebrew

### Data Privacy
- GDPR compliance: data export and deletion on request
- Deleted accounts permanently removed after 30 days
- Privacy policy and terms displayed during registration
- User data retained while account active

---

## 7. Success Metrics

### Adoption & Engagement
- **User Adoption:** 80% of invited group members actively use app within 2 weeks
- **Daily Active Users (DAU):** 65% of registered users open app daily
- **Retention Rate:** 70% of users still active after 30 days

### Task Management
- **Task Completion Rate:** 85% of assigned tasks completed on time
- **Notification Response:** 70% of users respond to notifications within 2 hours
- **Recurring Task Automation:** 60% of tasks set as recurring within first month

### Fairness & Distribution
- **Workload Variance:** < 15% variance in total difficulty points across users
- **AI Distribution Adoption:** 40% of groups use AI distribution at least once per month
- **Swap Requests:** < 10% of tasks result in swap requests (indicates good initial distribution)

### Gamification Impact
- **Leaderboard Engagement:** 75% of users view leaderboard at least weekly
- **Race Participation:** 50% of groups create at least one race per month
- **Reward Giving:** 30% of groups award at least one reward per month

### Technical Performance
- **API Response Time:** 95% of requests < 200ms
- **App Crash Rate:** < 1% of sessions
- **Push Notification Delivery:** > 95% delivered within 2 seconds

### User Satisfaction
- **App Store Rating:** Average 4.5/5 stars within 6 months
- **Net Promoter Score (NPS):** > 50
- **Support Tickets:** < 5 tickets per 100 active users per month

---

## 8. Open Questions / Risks

### Open Questions
1. **AI Task Distribution Algorithm:** What specific factors should AI prioritize? (user preferences, historical performance, current workload, time of day, day of week?)
2. **Reward Fulfillment:** How to track whether physical/digital rewards are actually delivered? Should app include a "redeem" workflow?
3. **Race Tie-Breaker:** Should default be "first to finish" or "split reward"? Should this be configurable per race?
4. **Private Task Display:** Should private tasks show difficulty points on leaderboard or hide points entirely?
5. **Multi-Language Expansion:** Beyond English and Hebrew, which languages should be prioritized based on target markets?
6. **Offline Sync Conflicts:** For task completion conflicts, is "last write wins" sufficient or should we implement conflict resolution UI?
7. **Subscription Model:** Should premium features (AI distribution, unlimited races, advanced analytics) require paid subscription?

### Risks
1. **AI API Costs:** OpenAI API usage may become expensive at scale
   - **Mitigation:** Cache common distribution patterns, implement rate limiting, offer manual distribution as free alternative
2. **Push Notification Delivery:** FCM/APNS may have delays or failures
   - **Mitigation:** Implement in-app notification fallback, allow users to manually refresh
3. **User Adoption Resistance:** Family members may resist structured task management
   - **Mitigation:** Emphasize fairness benefits, provide flexible onboarding, allow customization
4. **Leaderboard Gaming:** Users may mark tasks complete without actually doing them
   - **Mitigation:** Require photo proof for high-difficulty tasks, Admin approval workflow
5. **MongoDB Data Migration:** If schema changes significantly, migration may be complex
   - **Mitigation:** Version schema documents, implement backward-compatible changes, maintain migration scripts
6. **Race Feature Misuse:** Groups may create excessive races, causing notification fatigue
   - **Mitigation:** Limit concurrent races per group (e.g., max 3), provide race notification settings
7. **Privacy Concerns:** Private task feature may not be sufficient for sensitive scenarios
   - **Mitigation:** Clearly document privacy boundaries, allow users to opt-out of leaderboard entirely
8. **Performance at Scale:** Real-time updates via SignalR may strain server with 10,000+ concurrent users
   - **Mitigation:** Implement connection throttling, use Redis backplane for load balancing

---

## Appendix

### Glossary
- **Admin:** User with elevated privileges to manage group, create tasks, approve completions
- **Regular User:** Standard group member who completes assigned tasks
- **Task:** Unit of work with name, description, difficulty, assignee, deadline
- **Race:** Time-bound competition where users complete tasks to win a reward
- **Reward:** Recognition given by Admin for task completion (with or without race)
- **Leaderboard:** Ranking of users based on points earned from completed tasks
- **Difficulty:** Numeric scale 1-10 representing task complexity and effort required
- **Workload:** Sum of difficulty points for all assigned tasks per user

### Related Documents
- [Design Document](DESIGN-tasks-tracker-2025-01-24.md) - Technical architecture and implementation details
- [Lessons Learned](lessons-learned.md) - Project insights and best practices
- [Progress Log](progress.md) - Development progress tracking
- [Tasks Backlog](TASKS-2025-01-24.md) - Feature backlog and sprint planning

### Version History
- **v1.0** (January 23, 2025): Initial PRD with core features
- **v1.1** (January 24, 2025): Added Public/Private tasks (FR-021), Task Races (FR-022), Rewards (FR-023)
- **v1.2** (December 14, 2025): Reformatted for my-tasks-tracker-app project, clarified tech stack (MongoDB), updated architecture alignment
