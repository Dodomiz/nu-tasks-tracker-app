# Work Plan: FR-019 Accessibility & Internationalization

## Vision & Metrics
Deliver WCAG 2.2 AA compliance and full i18n support with RTL, keyboard navigation, screen reader compatibility, and locale-based formatting.
- Accessibility: 0 critical axe violations; full keyboard nav.
- i18n: Locale switch updates text/direction; formatting respects timezone/locale.
- UX: High-contrast mode; focus visible; semantic HTML.

## Epics

## Epic E1: Accessibility – Core A11y Patterns
**Description:** Semantic HTML, keyboard nav, focus management, color contrast.
**Success Criteria:** WCAG 2.2 AA compliance; axe audits pass.

### US-1401: Semantic HTML & Landmarks
- Acceptance: Header, nav, main, aside, footer; proper roles.
- Tech: Audit existing components; refactor divs to semantic tags.

### US-1402: Keyboard Navigation & Focus Management
- Acceptance: Tab order logical; skip link; focus trap in modals; ESC closes dialogs.
- Tech: Custom hook for focus management; Tailwind focus-visible.

### US-1403: ARIA Labels & Roles
- Acceptance: Interactive controls labeled; forms with helper text and error messages.
- Tech: aria-label/aria-labelledby; follow WAI-ARIA patterns.

### US-1404: Color Contrast & High-Contrast Mode
- Acceptance: ≥4.5:1 text contrast; Tailwind high-contrast variant; focus ring contrast.
- Tech: Contrast checks; CSS variables for theming.

## Epic E2: Internationalization – i18n Setup & RTL
**Description:** react-i18next, resource bundles, locale switcher, RTL support.
**Success Criteria:** Locale switch updates text and direction; date/number formatting correct.

### US-1405: i18next Setup & Resource Files
- Acceptance: Initialize i18next; load resources from `/src/i18n/**`; namespacing by feature.
- Tech: I18nextProvider; useTranslation hooks; plurals/interpolation.

### US-1406: Locale Switcher & Persistence
- Acceptance: UI switcher with language list; persists via FR-016 preferences API.
- Tech: Redux selector for activeLocale; PUT /api/users/me/preferences/global.

### US-1407: RTL Support
- Acceptance: Apply `dir="rtl"` to html when locale requires; Tailwind RTL plugin; icon mirroring.
- Tech: tailwindcss-rtl; conditional dir attribute.

### US-1408: Date/Number Formatting
- Acceptance: Use Intl.DateTimeFormat and Intl.NumberFormat with user timezone/locale.
- Tech: Helpers using FR-016 preferences; consistent across components.

## Epic E3: A11y Components & Auditing
**Description:** Accessible Modal, Menu, Tooltip; axe integration.
**Success Criteria:** Components pass axe audits; screen reader testing validated.

### US-1409: Accessible Modal/Menu/Tooltip
- Acceptance: Focus trap, ESC, arrow keys for menus; ARIA patterns.
- Tech: Refactor existing components or adopt headlessui.

### US-1410: SkipLink & A11y Utilities
- Acceptance: Skip to content link; focus utility functions.
- Tech: SkipLink component; custom hooks.

### US-1411: Axe Auditing Integration
- Acceptance: axe-core in dev; Vitest a11y assertions.
- Tech: @axe-core/react; jest-axe or vitest-axe.

## Epic E4: Tests – A11y & i18n
**Description:** Validate keyboard nav, screen reader labels, locale switching, RTL.
**Success Criteria:** Comprehensive coverage of a11y and i18n flows.

### US-1412: Unit – Keyboard & Screen Reader
- Acceptance: Modal focus trap; menu arrow keys; getByRole queries succeed.
- Tech: Vitest + RTL; user-event for keyboard simulation.

### US-1413: Integration – Locale Switch & Formatting
- Acceptance: Locale switch updates text/dir; date formatting reflects timezone.
- Tech: Mock preferences; assert rendered strings.

### US-1414: Automated Axe Audits
- Acceptance: Run axe on key pages; catch violations.
- Tech: Vitest integration; CI check.

## Sprint Plan

## Sprint 1: A11y Patterns + i18n Setup
- US-1401, US-1402, US-1403, US-1404, US-1405, US-1406, US-1407, US-1408

## Sprint 2: A11y Components + Auditing + Tests
- US-1409, US-1410, US-1411, US-1412, US-1413, US-1414

## Dependencies & Risks
- Dependencies: FR-016 preferences (locale/timezone); existing components need refactoring.
- Risks: Incomplete string extraction; RTL layout issues. Mitigate with systematic audits and testing.

## Release Phases
- Phase 1: A11y patterns and i18n setup with en/he locales.
- Phase 2: Full component refactor and axe integration.
