# FR-023: Mobile App Alignment (Shared)

## Overview
Align mobile and web feature parity using a shared TypeScript package for domain models, validation, and API clients; reuse RTK Query endpoints and Tailwind style tokens where feasible. Ensure consistent behavior across platforms for tasks, messaging, notifications, and preferences.

## Goals
- Shared `@tasks-tracker/shared` package with models, types, validation schemas, utilities, and API client.
- Mobile app implements core flows: auth, dashboard, tasks CRUD, categories, messaging, notifications, preferences.
- Consistent theming (light/dark), i18n, and accessibility considerations adapted for mobile.
- Offline support baseline on mobile mirroring FR-018.

## Non-Goals
- Full native-only features beyond parity and platform adaptations.

## Shared Package
- Contents (in `shared/`):
  - Types: `Task`, `Category`, `User`, `Group`, `UserPreferences`, `SwapRequest`, `Notification`, etc.
  - Validation: `zod` schemas mirroring backend DTOs.
  - API: lightweight client wrapping fetch with token injection and error handling; endpoints definitions parity with web.
  - Utilities: date/time formatting, locale helpers, mapping functions.
  - Constants: enums and status maps.
- Build: `tsup` or `tsc` with ES modules + CommonJS output for web and mobile.

## Mobile App (React Native)
- Navigation: stack + tabs (Dashboard, Tasks, Messages, Settings).
- State: Redux Toolkit + RTK Query using shared endpoints.
- Theming: use RN-tailwind library or style tokens ported from web; support system theme.
- i18n: `react-i18next` shared resources.
- Offline: use `@react-native-async-storage/async-storage` for cache and queue similar to IndexedDB approach.
- Notifications: integrate FCM for push; respect quiet hours from preferences.

## API Alignment
- Base URL and endpoints same as web.
- Auth: JWT; token storage via secure storage on mobile.
- Error handling: consistent ApiResponse envelope.

## Testing
- Shared: unit tests for schemas and utilities.
- Mobile: component tests with React Native Testing Library; integration around navigation and RTK Query.
- End-to-end (optional): Detox for core flows.

## CI/CD
- Build shared package versioned; publish to local workspace and optionally private registry.
- Mobile: fastlane workflows for iOS/Android build pipelines.

## Observability
- Minimal telemetry shared; avoid PII.
- Error reporting via platform-appropriate mechanisms.

## Edge Cases
- Platform differences (date pickers, file uploads for task completion photos) handled via native modules or alternatives.
- Network variability: adjust retry/backoff for mobile.
