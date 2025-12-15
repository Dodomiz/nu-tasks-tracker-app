# Work Plan: Internationalization (i18n) & RTL Support

**Project:** NU Tasks Tracker - Web Client  
**Version:** 1.0  
**Created:** December 14, 2025  
**Based on:** [design-i18n.md](design-i18n.md)

---

## Vision & Metrics

### Product Vision

**For** global task management users **who** need to interact with the application in their native language,  
**the** NU Tasks Tracker **is a** multi-lingual SaaS platform **that** provides seamless language switching and native RTL support for Hebrew speakers.

### Success Metrics

**User Metrics:**
- 30% of users switch from default English to Hebrew within first session
- 90% of Hebrew users prefer RTL layout over LTR
- Language preference persistence rate: >95%
- User satisfaction score for localized experience: >4.5/5

**Technical Metrics:**
- Translation file load time: <100ms
- Zero layout shift during language switching
- Missing translation warnings in dev: 0
- Bundle size increase: <30KB

**Business Metrics:**
- Enable market expansion to Hebrew-speaking regions
- Reduce support tickets related to language/layout confusion by 80%
- Foundation for 5+ additional languages in next 6 months

---

## Timeline: 4 Epics, 17 Stories, 3 Sprints

**Total Estimated Effort:** 19.5 days (with AI co-development)  
**Target Completion:** Sprint 3 (6 weeks)

---

## Epics

### Epic E1: i18n Foundation Infrastructure
**Description:** Establish core i18n architecture with react-i18next, Redux integration, and configuration.

**Business Value:** Enables all future translation work and establishes consistent developer experience for internationalization.

**Success Criteria:**
- i18next configured and integrated with Redux
- Language detection working (browser → localStorage → fallback)
- Demo page shows "Hello World" in English/Hebrew
- Developer documentation complete

**Estimated Effort:** 1 sprint (2 weeks)  
**Priority:** Critical (Must Have)

---

### Epic E2: Component Translation Migration
**Description:** Replace all hardcoded strings in React components with translation keys.

**Business Value:** Makes UI content translatable and maintainable through centralized JSON files.

**Success Criteria:**
- 100% of Auth pages use translation keys
- 100% of Dashboard uses translation keys
- Language selector UI functional
- All translations extracted to JSON

**Estimated Effort:** 1 sprint (2 weeks)  
**Priority:** Critical (Must Have)

---

### Epic E3: Hebrew Translation & RTL Layout
**Description:** Add Hebrew translations and implement RTL layout support with Tailwind CSS utilities.

**Business Value:** Enables Hebrew-speaking users to use app in native language with proper right-to-left layout.

**Success Criteria:**
- Complete Hebrew translation file (100% coverage)
- RTL layout displays correctly (no visual bugs)
- Date/time formatting respects Hebrew locale
- Smooth switching between LTR and RTL

**Estimated Effort:** 0.75 sprint (1.5 weeks)  
**Priority:** High (Must Have for MVP)

---

### Epic E4: Polish & Production Readiness
**Description:** Performance optimization, TypeScript strict typing, testing, and production hardening.

**Business Value:** Ensures production-grade quality, maintainability, and developer experience.

**Success Criteria:**
- TypeScript autocomplete for translation keys
- <100ms translation loading
- Zero missing translation warnings
- Comprehensive test coverage

**Estimated Effort:** 0.5 sprint (1 week)  
**Priority:** High (Should Have)

---

## User Stories

### Epic E1: i18n Foundation Infrastructure

#### Story US-I18N-001: Install and Configure i18next

**As a** developer **I want to** install and configure react-i18next **So that** the app has a foundation for translations.

**Acceptance Criteria:**
- [ ] Given fresh install, when `npm install` runs, then i18next packages installed
- [ ] Given app startup, when i18next initializes, then configuration loads from `/src/i18n/config.ts`
- [ ] Given translation request, when key accessed, then correct language file loads
- [ ] Given missing translation, when key not found, then fallback to English with dev warning

**Technical Notes:**
- Install: `react-i18next`, `i18next`, `i18next-http-backend`, `i18next-browser-languagedetector`
- Configure in `/src/i18n/config.ts`
- Backend plugin loads `/public/locales/{lng}/translation.json`
- Language detector checks: localStorage → browser language → 'en'

**Dependencies:** None  
**Estimated Effort:** 0.5 days  
**Priority:** Must Have

---

#### Story US-I18N-002: Create Redux Language Slice

**As a** user **I want** my language preference to persist **So that** I don't need to re-select language on every visit.

**Acceptance Criteria:**
- [ ] Given language selection, when user chooses Hebrew, then Redux stores 'he' in state
- [ ] Given stored preference, when app loads, then previously selected language activates
- [ ] Given Redux state change, when language updates, then localStorage syncs automatically
- [ ] Given page refresh, when app initializes, then language preference restored from localStorage

**Technical Notes:**
- Create `/src/app/slices/languageSlice.ts`
- State: `{ current: 'en' | 'he', direction: 'ltr' | 'rtl' }`
- Use `redux-persist` for localStorage sync (already configured in store)
- Export `setLanguage(lang)` action

**Dependencies:** US-I18N-001  
**Estimated Effort:** 0.75 days  
**Priority:** Must Have

---

#### Story US-I18N-003: Wrap App with I18nextProvider

**As a** developer **I want** i18n context available globally **So that** all components can access translations.

**Acceptance Criteria:**
- [ ] Given App.tsx, when component tree renders, then I18nextProvider wraps all children
- [ ] Given i18next initialization, when complete, then app renders (no flash of untranslated content)
- [ ] Given language change, when i18next updates, then React re-renders with new translations
- [ ] Given HTML document, when language loads, then `<html dir="ltr|rtl">` attribute updates

**Technical Notes:**
- Update `/src/App.tsx` to wrap with `<I18nextProvider i18n={i18n}>`
- Use `useEffect` to update `document.documentElement.dir` on language change
- Add Suspense with loading fallback for async translation loading

**Dependencies:** US-I18N-001, US-I18N-002  
**Estimated Effort:** 0.5 days  
**Priority:** Must Have

---

#### Story US-I18N-004: Create English Translation File

**As a** developer **I want** all current UI text extracted to English JSON **So that** translations are centralized.

**Acceptance Criteria:**
- [ ] Given translation file, when opened, then all Auth text present as keys
- [ ] Given translation file, when opened, then all Dashboard text present as keys
- [ ] Given translation file, when opened, then common text (buttons, labels) present
- [ ] Given key structure, when reviewed, then follows convention `feature.page.element`

**Technical Notes:**
- Create `/public/locales/en/translation.json`
- Key structure: `common.*`, `auth.login.*`, `auth.register.*`, `dashboard.*`, `settings.*`
- Include placeholder interpolation: `"welcome": "Welcome, {{name}}!"`
- Total estimated keys: ~50-70 for MVP

**Dependencies:** US-I18N-001  
**Estimated Effort:** 1 day  
**Priority:** Must Have

---

#### Story US-I18N-005: Configure Tailwind RTL Plugin

**As a** developer **I want** Tailwind CSS to support RTL utilities **So that** I can easily style RTL layouts.

**Acceptance Criteria:**
- [ ] Given tailwind.config.js, when inspected, then `tailwindcss-rtl` plugin configured
- [ ] Given CSS build, when compiled, then RTL variant classes available (e.g., `rtl:mr-4`)
- [ ] Given component with `rtl:` prefix, when in RTL mode, then correct styles apply
- [ ] Given documentation, when developer reads, then RTL utility examples provided

**Technical Notes:**
- Install: `npm install -D tailwindcss-rtl`
- Add to `tailwind.config.js`: `plugins: [require('tailwindcss-rtl')]`
- Test with sample: `<div className="ml-4 rtl:mr-4">` (margin switches sides)

**Dependencies:** None  
**Estimated Effort:** 0.25 days  
**Priority:** Must Have

---

### Epic E2: Component Translation Migration

#### Story US-I18N-006: Migrate Login Page to Translation Keys

**As a** user **I want** the login page in my language **So that** I understand authentication prompts.

**Acceptance Criteria:**
- [ ] Given Login page, when viewed in English, then all text displays from `auth.login.*` keys
- [ ] Given Login page, when viewed in Hebrew, then all text displays in Hebrew (placeholder text until US-I18N-012)
- [ ] Given form labels, when rendered, then use `t('auth.login.email')`, `t('auth.login.password')`
- [ ] Given submit button, when rendered, then uses `t('auth.login.submit')`
- [ ] Given validation errors, when shown, then use translation keys

**Technical Notes:**
- Update `/src/features/auth/pages/LoginPage.tsx`
- Use `const { t } = useTranslation()` hook
- Replace all hardcoded strings with `t('key')` calls
- Keys: `auth.login.{title, email, password, submit, forgotPassword, noAccount, register}`

**Dependencies:** US-I18N-001, US-I18N-003, US-I18N-004  
**Estimated Effort:** 1 day  
**Priority:** Must Have

---

#### Story US-I18N-007: Migrate Register Page to Translation Keys

**As a** user **I want** the registration page in my language **So that** I understand signup requirements.

**Acceptance Criteria:**
- [ ] Given Register page, when viewed in English, then all text displays from `auth.register.*` keys
- [ ] Given form fields, when rendered, then labels use translation keys
- [ ] Given password requirements, when shown, then use translation keys
- [ ] Given success message, when displayed, then uses translation key

**Technical Notes:**
- Update `/src/features/auth/pages/RegisterPage.tsx`
- Keys: `auth.register.{title, firstName, lastName, email, password, confirmPassword, submit, hasAccount, login}`
- Include validation message keys

**Dependencies:** US-I18N-001, US-I18N-003, US-I18N-004  
**Estimated Effort:** 1 day  
**Priority:** Must Have

---

#### Story US-I18N-008: Migrate Profile & Password Reset Pages

**As a** user **I want** account management pages in my language **So that** I manage my profile confidently.

**Acceptance Criteria:**
- [ ] Given Profile page, when viewed, then all text uses translation keys
- [ ] Given Password Reset pages, when viewed, then all text uses translation keys
- [ ] Given success/error messages, when displayed, then use translation keys

**Technical Notes:**
- Update `/src/features/auth/pages/ProfilePage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`
- Keys: `auth.profile.*`, `auth.forgotPassword.*`, `auth.resetPassword.*`

**Dependencies:** US-I18N-001, US-I18N-003, US-I18N-004  
**Estimated Effort:** 1.5 days  
**Priority:** Should Have

---

#### Story US-I18N-009: Migrate Dashboard to Translation Keys

**As a** user **I want** the dashboard in my language **So that** I understand task management features.

**Acceptance Criteria:**
- [ ] Given Dashboard, when viewed, then welcome message shows `t('dashboard.welcome', { name })`
- [ ] Given task list, when empty, then shows `t('dashboard.noTasks')`
- [ ] Given navigation, when rendered, then menu items use translation keys
- [ ] Given action buttons, when displayed, then use translation keys

**Technical Notes:**
- Update `/src/pages/DashboardPage.tsx` (or equivalent)
- Keys: `dashboard.{title, welcome, myTasks, noTasks, createTask}`
- Use interpolation for user name: `t('dashboard.welcome', { name: user.firstName })`

**Dependencies:** US-I18N-001, US-I18N-003, US-I18N-004  
**Estimated Effort:** 1.25 days  
**Priority:** Must Have

---

#### Story US-I18N-010: Create Language Selector Component

**As a** user **I want** a language toggle button **So that** I can switch between English and Hebrew.

**Acceptance Criteria:**
- [ ] Given app header/navigation, when rendered, then language selector visible
- [ ] Given language selector, when clicked, then dropdown shows EN/HE options
- [ ] Given language option, when clicked, then UI switches language instantly
- [ ] Given language change, when complete, then selector shows current language

**Technical Notes:**
- Create `/src/components/LanguageSelector.tsx`
- Use `i18next.changeLanguage()` on selection
- Dispatch Redux `setLanguage()` action
- Show flag icons or language codes (EN/HE)
- Position in navigation bar or user menu

**Dependencies:** US-I18N-002, US-I18N-003  
**Estimated Effort:** 1 day  
**Priority:** Must Have

---

#### Story US-I18N-011: Migrate Common Components

**As a** developer **I want** shared components translated **So that** buttons, modals, and alerts support i18n.

**Acceptance Criteria:**
- [ ] Given Button component, when rendered, then text uses translation keys
- [ ] Given Modal component, when displayed, then title/actions use translation keys
- [ ] Given Alert/Toast, when shown, then messages use translation keys
- [ ] Given Loading spinner, when active, then text uses translation key

**Technical Notes:**
- Update `/src/components/*` shared components
- Keys: `common.{save, cancel, close, delete, confirm, loading, error, success}`
- Pass translation keys as props or default to common keys

**Dependencies:** US-I18N-001, US-I18N-003, US-I18N-004  
**Estimated Effort:** 1.5 days  
**Priority:** Should Have

---

### Epic E3: Hebrew Translation & RTL Layout

#### Story US-I18N-012: Create Hebrew Translation File

**As a** Hebrew-speaking user **I want** all UI text in Hebrew **So that** I use the app in my native language.

**Acceptance Criteria:**
- [ ] Given Hebrew file, when opened, then all keys from English file present
- [ ] Given Hebrew file, when reviewed by native speaker, then translations accurate and natural
- [ ] Given Hebrew text, when rendered, then proper Hebrew characters display (no encoding issues)
- [ ] Given interpolated text, when shown, then variables correctly positioned in Hebrew grammar

**Technical Notes:**
- Create `/public/locales/he/translation.json`
- Mirror structure of `en/translation.json`
- Use professional translator or native Hebrew speaker for accuracy
- Test character encoding (UTF-8)
- Consider gender/plural forms where applicable

**Dependencies:** US-I18N-004  
**Estimated Effort:** 2 days (includes translation + review)  
**Priority:** Must Have

---

#### Story US-I18N-013: Implement RTL Layout for Auth Pages

**As a** Hebrew user **I want** login/register pages in RTL layout **So that** forms feel natural.

**Acceptance Criteria:**
- [ ] Given Hebrew language, when Login page loads, then text aligns right
- [ ] Given Hebrew language, when form inputs render, then labels align right
- [ ] Given Hebrew language, when buttons render, then positioned appropriately for RTL
- [ ] Given LTR language, when page loads, then layout remains left-aligned (no regression)

**Technical Notes:**
- Use Tailwind RTL utilities: `text-right rtl:text-right`, `ml-4 rtl:mr-4`
- Update `/src/features/auth/pages/*` with RTL-aware classes
- Test flexbox/grid direction reversal
- Ensure icons position correctly (e.g., arrow icons should flip)

**Dependencies:** US-I18N-005, US-I18N-006, US-I18N-007, US-I18N-012  
**Estimated Effort:** 1.5 days  
**Priority:** Must Have

---

#### Story US-I18N-014: Implement RTL Layout for Dashboard

**As a** Hebrew user **I want** dashboard in RTL layout **So that** navigation and content feel natural.

**Acceptance Criteria:**
- [ ] Given Hebrew language, when Dashboard loads, then navigation menu aligns right
- [ ] Given Hebrew language, when task list renders, then items align right
- [ ] Given Hebrew language, when sidebar present, then positions on left (not right)
- [ ] Given language switch, when changed, then layout smoothly transitions (no jump)

**Technical Notes:**
- Update `/src/pages/DashboardPage.tsx` and related components
- Test navigation menu reversal
- Ensure dropdowns and popovers position correctly in RTL
- Use `useRTL()` custom hook for conditional logic if needed

**Dependencies:** US-I18N-005, US-I18N-009, US-I18N-012  
**Estimated Effort:** 2 days  
**Priority:** Must Have

---

#### Story US-I18N-015: Add Locale-Aware Date/Time Formatting

**As a** user **I want** dates formatted per my locale **So that** timestamps feel native.

**Acceptance Criteria:**
- [ ] Given English locale, when date shown, then format: "Jan 15, 2025"
- [ ] Given Hebrew locale, when date shown, then format: "15 בינואר 2025"
- [ ] Given relative time, when displayed, then uses locale (e.g., "2 hours ago" / "לפני שעתיים")
- [ ] Given time format, when shown, then respects locale (12h vs 24h)

**Technical Notes:**
- Use `Intl.DateTimeFormat` for locale-aware formatting
- Create utility: `/src/utils/dateFormatter.ts`
- Integrate with i18next language state
- Consider using `date-fns` with locale support for relative time

**Dependencies:** US-I18N-002, US-I18N-012  
**Estimated Effort:** 1 day  
**Priority:** Should Have

---

### Epic E4: Polish & Production Readiness

#### Story US-I18N-016: Add TypeScript Types for Translation Keys

**As a** developer **I want** TypeScript autocomplete for translation keys **So that** I avoid typos and find keys easily.

**Acceptance Criteria:**
- [ ] Given translation key, when typing `t('`, then IDE shows autocomplete suggestions
- [ ] Given invalid key, when typed, then TypeScript error shown at compile time
- [ ] Given interpolation, when used, then TypeScript validates variable names
- [ ] Given new translation added, when JSON updated, then types auto-regenerate

**Technical Notes:**
- Create `/src/i18n/types.ts` with generated types from JSON
- Use `i18next-typescript` or custom type generation script
- Configure VSCode for autocomplete
- Add npm script: `npm run i18n:types` to regenerate

**Dependencies:** US-I18N-004  
**Estimated Effort:** 1 day  
**Priority:** Should Have

---

#### Story US-I18N-017: Add i18n Unit Tests

**As a** developer **I want** tests for i18n functionality **So that** regressions are caught early.

**Acceptance Criteria:**
- [ ] Given i18n config, when tested, then initializes correctly
- [ ] Given language change, when triggered, then Redux state updates
- [ ] Given missing key, when accessed, then fallback works correctly
- [ ] Given RTL switch, when language changes, then `dir` attribute updates

**Technical Notes:**
- Create `/src/i18n/__tests__/i18n.test.ts`
- Test `useTranslation()` hook with `@testing-library/react`
- Mock i18next in component tests
- Test language selector component
- Coverage target: >80%

**Dependencies:** US-I18N-001 through US-I18N-015  
**Estimated Effort:** 2 days  
**Priority:** Should Have

---

## Sprint Plan

### Sprint 1: Foundation & Configuration

**Duration:** 2 weeks (Dec 16 - Dec 27, 2025)  
**Sprint Goal:** Establish i18n infrastructure and extract English translations

**Stories:**
- US-I18N-001: Install and Configure i18next (0.5d)
- US-I18N-002: Create Redux Language Slice (0.75d)
- US-I18N-003: Wrap App with I18nextProvider (0.5d)
- US-I18N-004: Create English Translation File (1d)
- US-I18N-005: Configure Tailwind RTL Plugin (0.25d)
- US-I18N-006: Migrate Login Page (1d)
- US-I18N-007: Migrate Register Page (1d)
- US-I18N-010: Create Language Selector Component (1d)

**Capacity:** 10 days | **Committed:** 6 days  
**Buffer:** 40% (for integration testing, documentation, code review)

**Deliverable:** App with English translations, working language selector (Hebrew shows English text), RTL infrastructure ready

---

### Sprint 2: Component Migration & Hebrew Translation

**Duration:** 2 weeks (Dec 30, 2025 - Jan 10, 2026)  
**Sprint Goal:** Complete component migration and add Hebrew translations with RTL

**Stories:**
- US-I18N-008: Migrate Profile & Password Reset Pages (1.5d)
- US-I18N-009: Migrate Dashboard (1.25d)
- US-I18N-011: Migrate Common Components (1.5d)
- US-I18N-012: Create Hebrew Translation File (2d)
- US-I18N-013: Implement RTL Layout for Auth Pages (1.5d)
- US-I18N-014: Implement RTL Layout for Dashboard (2d)

**Capacity:** 10 days | **Committed:** 9.75 days  
**Buffer:** 2.5% (tight sprint, prioritize must-haves)

**Deliverable:** Fully translated app in English and Hebrew with working RTL layouts

---

### Sprint 3: Polish & Production Readiness

**Duration:** 1 week (Jan 13 - Jan 17, 2026)  
**Sprint Goal:** Production hardening, testing, and developer experience improvements

**Stories:**
- US-I18N-015: Add Locale-Aware Date/Time Formatting (1d)
- US-I18N-016: Add TypeScript Types for Translation Keys (1d)
- US-I18N-017: Add i18n Unit Tests (2d)

**Capacity:** 5 days | **Committed:** 4 days  
**Buffer:** 20%

**Deliverable:** Production-ready i18n feature with tests, TypeScript support, and locale formatting

---

## Dependencies & Risks

### Technical Dependencies

| Dependency | Impact | Mitigation |
|------------|--------|------------|
| **Redux Store Config** | Must be compatible with i18next | Already using redux-persist, straightforward integration |
| **Tailwind CSS** | RTL plugin compatibility | Well-established plugin, low risk |
| **Existing Components** | May have hardcoded strings | Systematic extraction, use grep to find all strings |
| **API Error Messages** | Currently English-only | Client-side translation mapping for now, backend i18n in future |

### External Dependencies

| Dependency | Impact | Mitigation |
|------------|--------|------------|
| **Professional Translation** | Hebrew translation quality | Use native speaker or professional service, budget 2 days |
| **Browser Compatibility** | Intl API support | All modern browsers supported, add polyfill for old browsers |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Incomplete Translation Coverage** | Medium | Medium | Fallback to English, dev warnings for missing keys |
| **RTL Layout Bugs** | High | Medium | Thorough testing with Hebrew users, use Tailwind RTL utilities |
| **Performance Impact** | Low | Low | Lazy load translations, measure with Lighthouse |
| **Developer Adoption** | Medium | Medium | Clear documentation, simple API, TypeScript autocomplete |
| **Translation Maintenance** | Medium | High | Centralized JSON files, version control, clear process |

---

## Release Phases

### Phase 1 (MVP): Sprints 1-2
**Goal:** Core i18n functionality with English and Hebrew support

**Deliverables:**
- ✅ i18n infrastructure (react-i18next + Redux)
- ✅ All components using translation keys
- ✅ English and Hebrew translation files
- ✅ RTL layout support
- ✅ Language selector UI

**Acceptance:** User can switch between English LTR and Hebrew RTL seamlessly

---

### Phase 2 (Enhancement): Sprint 3
**Goal:** Production quality and developer experience

**Deliverables:**
- ✅ Locale-aware date/time formatting
- ✅ TypeScript autocomplete for translation keys
- ✅ Comprehensive test coverage
- ✅ Performance optimization (<100ms load)

**Acceptance:** Production-ready with >80% test coverage, zero missing translations

---

### Phase 3 (Future): Post-MVP
**Goal:** Expansion and advanced features

**Potential Stories:**
- Add 3rd language (Arabic, Spanish, Russian)
- Translation management UI for non-developers
- Backend API error message localization
- SEO: Localized meta tags and URLs
- A/B testing for translation variants
- Advanced pluralization rules

---

## Validation Checklist

- [x] Stories follow INVEST principles
- [x] Estimates include AI assistance (2-5x productivity multiplier)
- [x] 20%+ buffer in sprint planning
- [x] Dependencies documented and sequenced
- [x] Each sprint delivers shippable value
- [x] All stories have testable acceptance criteria
- [x] Technical notes provide implementation guidance
- [x] Priorities aligned with business value (MoSCoW)

---

**Document Status:** COMPLETE  
**Next Steps:**  
1. Review workplan with stakeholders
2. Begin Sprint 1 on Dec 16, 2025
3. Daily standups to track progress
4. Sprint retrospectives after each sprint

**Estimated Completion:** January 17, 2026 (3 sprints)
