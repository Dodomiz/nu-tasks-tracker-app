# Work Plan: FR-023 Mobile App Alignment (Shared)

## Vision & Metrics
Align mobile and web via shared TypeScript package; implement core flows on React Native; ensure consistent UX.
- Parity: Core features (auth, tasks, messaging, notifications, preferences) on mobile.
- Reusability: Shared package reduces duplication; validation/types consistent.
- Performance: Offline support baseline; responsive UI.

## Epics

## Epic E1: Shared Package – Models & API Client
**Description:** Create `@tasks-tracker/shared` with types, validation, utilities, API client.
**Success Criteria:** Web and mobile import shared package; types consistent.

### US-1801: Shared Package Setup
- Acceptance: tsup/tsc build; ES modules + CommonJS; published to workspace.
- Tech: Monorepo structure; package.json with exports.

### US-1802: Types & Validation Schemas
- Acceptance: Task, Category, User, Group, UserPreferences, SwapRequest, Notification, etc.; zod schemas mirroring backend DTOs.
- Tech: TypeScript; zod.

### US-1803: API Client
- Acceptance: Lightweight fetch wrapper; token injection; error handling; endpoints definitions parity with web.
- Tech: Typed functions per endpoint; shared with RTK Query.

### US-1804: Utilities & Constants
- Acceptance: Date/time formatting; locale helpers; enums and status maps.
- Tech: Reusable helpers.

## Epic E2: Mobile App – Navigation & State
**Description:** React Native app with stack + tabs; Redux + RTK Query.
**Success Criteria:** Navigation works; state management consistent with web.

### US-1805: Mobile App Scaffolding
- Acceptance: React Native project; navigation (React Navigation); Redux Toolkit setup.
- Tech: Expo or bare RN; stack + tabs.

### US-1806: RTK Query Integration
- Acceptance: Use shared endpoints; baseQuery with token storage (secure storage).
- Tech: @react-native-async-storage/async-storage or secure storage; RTK Query.

## Epic E3: Mobile App – Core Flows
**Description:** Implement auth, dashboard, tasks, messaging, notifications, preferences.
**Success Criteria:** Feature parity with web for core flows.

### US-1807: Auth & Dashboard
- Acceptance: Login/register; dashboard with summary; navigation to tasks.
- Tech: Screens; API calls; state.

### US-1808: Tasks CRUD
- Acceptance: List, create, update, complete; categories; filters.
- Tech: Screens; forms; optimistic updates.

### US-1809: Messaging & Notifications
- Acceptance: Conversations list; send/receive messages; FCM push notifications.
- Tech: Screens; SignalR integration; FCM setup.

### US-1810: Preferences
- Acceptance: Profile edit; preferences (locale, theme, timezone, notifications).
- Tech: Settings screen; forms; apply theme/locale.

## Epic E4: Theming, i18n, Offline
**Description:** Consistent theming, i18n, and offline support on mobile.
**Success Criteria:** Theme/locale switch works; offline queue functional.

### US-1811: Theming & i18n
- Acceptance: RN-tailwind or style tokens; react-i18next with shared resources; system theme support.
- Tech: Style library; i18n config.

### US-1812: Offline Support
- Acceptance: Cache and queue in async-storage; replay on online; similar to FR-018.
- Tech: Custom baseQuery wrapper; optimistic UI; drainer logic.

## Epic E5: Tests & CI/CD
**Description:** Test shared package and mobile app; set up build pipelines.
**Success Criteria:** Unit/component tests pass; CI builds mobile app.

### US-1813: Shared Package Tests
- Acceptance: Unit tests for schemas and utilities.
- Tech: Vitest or Jest.

### US-1814: Mobile App Tests
- Acceptance: Component tests with React Native Testing Library; integration around navigation.
- Tech: Jest; detox optional for E2E.

### US-1815: CI/CD Pipelines
- Acceptance: Build shared package; build mobile (iOS/Android); optional fastlane.
- Tech: GitHub Actions or similar; versioning.

## Sprint Plan

## Sprint 1: Shared Package + Mobile Scaffolding
- US-1801, US-1802, US-1803, US-1804, US-1805, US-1806, US-1813

## Sprint 2: Core Flows + Theming + Offline + Tests + CI
- US-1807, US-1808, US-1809, US-1810, US-1811, US-1812, US-1814, US-1815

## Dependencies & Risks
- Dependencies: Web features (FR-005 onwards); backend APIs stable.
- Risks: Platform differences (file uploads, date pickers); network variability. Mitigate with native modules and adjusted retry logic.

## Release Phases
- Phase 1: Shared package and mobile auth/dashboard/tasks.
- Phase 2: Full parity with messaging, notifications, preferences, offline.
