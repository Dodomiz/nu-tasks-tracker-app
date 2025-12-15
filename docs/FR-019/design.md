# FR-019: Accessibility & Internationalization

## Overview
Ensure the application is accessible and usable for all users and supports internationalization (i18n) across locales, including RTL languages. Implement WCAG 2.2 AA standards, keyboard navigation, screen reader compatibility, and localized content with date/number formatting.

## Goals
- WCAG 2.2 AA compliance for core flows.
- Full keyboard navigation and focus management.
- Screen reader semantics: landmarks, roles, labels.
- i18n: strings externalized, locale switching, RTL support.
- Date/number formatting respecting user locale/timezone (FR-016).
- High-contrast mode and color contrast checks.

## Non-Goals
- Full translation service pipeline (human workflows out of scope).  
- Multi-lingual content authoring beyond UI strings.

## Accessibility (A11y)
- Semantics:
  - Use semantic HTML; provide `role` only when necessary.
  - Landmarks: `header`, `nav`, `main`, `aside`, `footer`.
  - Labels: `aria-label`/`aria-labelledby` for interactive controls.
- Keyboard:
  - Tab order logical; `Skip to content` link.
  - Focus visible and trapped in modals; ESC closes dialogs.
  - Shortcuts: announce and allow disabling in preferences.
- Components:
  - Buttons/links with proper states; disabled vs aria-disabled.
  - Dialogs, menus, tooltips follow WAI-ARIA Authoring Practices.
  - Forms: label association, error messaging, helper text.
- Color & Contrast:
  - Tailwind theme supports high-contrast variant; ensure ≥4.5:1 text contrast.
  - Focus ring meets contrast; avoid color-only cues.
- Media:
  - Images have `alt`; avatars decorative use empty alt.
  - Video (if any) provides captions.

## Internationalization (i18n)
- Library: `react-i18next` with `i18next`.
- Structure:
  - Resource bundles per locale: `en`, `he`, etc.
  - Namespacing by feature: `tasks`, `dashboard`, `auth`, `common`.
  - Plurals and interpolation handled by i18n library.
- Locale Switching:
  - Source of truth in `UserPreferences.global.locale` (FR-016).
  - UI switcher with language list; persists via preferences API.
  - RTL support via `tailwindcss-rtl` plugin and `dir="rtl"` when appropriate.
- Formatting:
  - Use `Intl.DateTimeFormat` and `Intl.NumberFormat`.
  - Timezone from `UserPreferences.global.timezone`.

## Backend
- Provide locale-aware text for server-generated artifacts where applicable (e.g., exported reports headers).
- Keep backend messages minimal; UI handles most localization.

## Frontend Implementation
- Setup i18n:
  - Initialize `i18next` in app entry; load resources from `/src/i18n/**`.
  - Wrap app with `I18nextProvider`; use `useTranslation()` hooks.
- RTL:
  - Apply `dir="rtl"` to `html` when locale requires; toggle Tailwind RTL.
  - Verify spacing/margins/paddings and icon mirroring.
- A11y utilities:
  - Focus management hook; `SkipLink` component.
  - Accessible components: Modal, Menu, Tooltip following ARIA patterns.
- Auditing:
  - Include `axe-core` in development for linting a11y.
  - Run `@testing-library/jest-dom` a11y assertions in tests.

## Testing
- Unit/Component:
  - Keyboard navigation on modals/menus; focus trap correctness.
  - Screen reader labels present; `getByRole` queries succeed.
- Integration:
  - Locale switch updates text and direction.
  - Date formatting reflects timezone.
- Automated a11y audits:
  - Vitest with `axe` to catch common violations.

## Observability
- Minimal: log locale changes and a11y mode toggles (non-PII).

## Migration
- Extract strings from existing components into resource files; begin with `common` and `tasks`.
- Add default locales `en` and `he` to demonstrate LTR/RTL.

## Edge Cases
- Mixed-direction content (RTL with LTR snippets) handled using `dir` on specific elements.
- Long text wrapping/responsive truncation must maintain readability.
