# Work Plan: FR-007 AI-Powered Task Distribution

## Vision & Metrics
For Admins who want fair, efficient task assignment at scale,
the AI-Powered Distribution feature is a recommendation and assistance tool that proposes balanced assignments considering workload, preferences, and history.

- User: Generate preview assignments in <5s for 20×5; clear rationale per assignment.
- Business: Cut manual assignment time by ~70%; maintain variance ≤15%.
- Technical: OpenAI call ≤5s with <$0.50 per request; rule-based fallback; anonymized payloads.

## Timeline: 4 Epics, 14 Stories, 2 Sprints

## Epics

## Epic E1: Client UI – Distribution Wizard & Preview
**Description:** Provide an Admin wizard to configure constraints, run AI, preview assignments, and apply.
**Business Value:** Streamlines assignment while preserving human review.
**Success Criteria:** Admin sees assignments, confidence, rationale; can modify and apply.
**Estimated Effort:** 1 sprint
**Priority:** High

### Story US-201: Distribution Wizard (Configure)
**As a** Admin **I want to** configure distribution inputs **So that** AI has the proper context

**Acceptance Criteria:**
- [ ] Date range picker (max 30 days), user selection (all or subset), constraints.
- [ ] "Auto Distribute" button triggers generation.

**Technical Notes:** React + TS; Tailwind; RTK Query `POST /api/distribution/generate`.
**Dependencies:** Backend endpoint.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-202: Preview Assignments View
**As a** Admin **I want to** review proposed assignments **So that** I keep control

**Acceptance Criteria:**
- [ ] Table/cards show task → user, confidence (0-100%), rationale.
- [ ] Variance indicator; method badge (AI or Rule-Based).
- [ ] Poll preview until status Completed.

**Technical Notes:** RTK Query `GET /api/distribution/preview/{id}`; Tailwind UI.
**Dependencies:** US-201, backend preview.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-203: Modify & Apply Assignments
**As a** Admin **I want to** adjust and apply **So that** final distribution fits reality

**Acceptance Criteria:**
- [ ] Drag-drop or select reassignment per task.
- [ ] Apply sends modifications and shows final variance.

**Technical Notes:** RTK Query `POST /api/distribution/{id}/apply`; diff payload.
**Dependencies:** US-202, backend apply.
**Estimated Effort:** M (5)
**Priority:** Must

## Epic E2: Backend – AI Integration & Fallback
**Description:** Implement services to build prompt, call OpenAI, parse response; fallback to rule-based distribution.
**Business Value:** Reliable recommendations with guardrails.
**Success Criteria:** Valid assignments with rationale; robust fallback on errors.
**Estimated Effort:** 1 sprint
**Priority:** Critical

### Story US-204: OpenAIServerAccess + Config
**As a** Developer **I want to** integrate OpenAI securely **So that** we can request recommendations

**Acceptance Criteria:**
- [ ] ServerAccess component with `ChatCompletionAsync`; key via configuration.
- [ ] Anonymized payload (IDs, categories, stats only).

**Technical Notes:** IHttpClientFactory; retries; timeouts; JSON mode.
**Dependencies:** App settings.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-205: AIDistributionEngine – Prompt + Parse
**As a** Developer **I want to** build prompts and parse JSON **So that** we get structured assignments

**Acceptance Criteria:**
- [ ] System and user prompt built from tasks, workloads, preferences; output JSON.
- [ ] Parser validates shape; handles malformed responses.

**Technical Notes:** DTOs; JsonSerializer; defensive parsing.
**Dependencies:** US-204.
**Estimated Effort:** M (5)
**Priority:** Must

### Story US-206: Rule-BasedDistributor Fallback
**As a** Developer **I want to** assign fairly without AI **So that** feature is resilient

**Acceptance Criteria:**
- [ ] Algorithm sorts by difficulty and assigns to lowest workload with preference respect and availability exclusion.
- [ ] Confidence=0.5; method flag set to Rule-Based.

**Technical Notes:** Deterministic; unit tested; mirrors AI constraints.
**Dependencies:** WorkloadService; UserProfileService.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-207: DistributionService + Repository
**As a** Developer **I want to** orchestrate generation and preview storage **So that** UI can poll

**Acceptance Criteria:**
- [ ] Save preview with assignments, stats, method; 24h expiry.
- [ ] Provide preview fetch and apply operations.

**Technical Notes:** Repository pattern; DTOs; variance compute.
**Dependencies:** US-205, US-206.
**Estimated Effort:** M (5)
**Priority:** Must

## Epic E3: Data – User Preferences & History
**Description:** Extend profile for preferences and availability; expose CRUD.
**Business Value:** Improves recommendation quality.
**Success Criteria:** Admins/users can set preferences; engine consumes them.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-208: User Preferences Schema & Service
**As a** Developer **I want to** store preferences/availability **So that** distribution respects user constraints

**Acceptance Criteria:**
- [ ] Extend `UserProfile` with `categoryPreferences`, `unavailableDates`.
- [ ] CRUD endpoint to update preferences.

**Technical Notes:** Repository; validation; timestamps.
**Dependencies:** Existing profile infra.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-209: Historical Completion Stats
**As a** Developer **I want to** compute on-time rates **So that** AI considers performance

**Acceptance Criteria:**
- [ ] Repository method to aggregate completion by category per user.
- [ ] Service exposes stats to engine.

**Technical Notes:** Mongo aggregate; optional nightly update.
**Dependencies:** Tasks data.
**Estimated Effort:** S (3)
**Priority:** Should

## Epic E4: Tests – Unit & Integration
**Description:** Validate AI engine, fallback algorithm, and endpoints.
**Business Value:** Ensures reliability and trust.
**Success Criteria:** ~70% coverage across distribution domain.
**Estimated Effort:** 0.5 sprint
**Priority:** High

### Story US-210: Unit – Prompt & Parse
**As a** Developer **I want to** assert prompt and parser correctness **So that** AI communication is robust

**Acceptance Criteria:**
- [ ] Prompt includes workloads, preferences, availability constraints.
- [ ] Parser handles valid/malformed JSON; yields assignments list.

**Technical Notes:** Mocks; fixture data.
**Dependencies:** US-205.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-211: Unit – Rule-Based Fallback
**As a** Developer **I want to** verify fairness without AI **So that** we can trust fallback

**Acceptance Criteria:**
- [ ] Assigns respecting preferences/unavailability; minimizes variance.

**Technical Notes:** Controlled inputs; variance assertions.
**Dependencies:** US-206.
**Estimated Effort:** S (3)
**Priority:** Must

### Story US-212: Integration – Generate/Preview/Apply
**As a** Developer **I want to** validate the end-to-end flow **So that** the UI works reliably

**Acceptance Criteria:**
- [ ] Generate success with OpenAI mock; preview shows assignments.
- [ ] Error triggers fallback; preview method=Rule-Based.
- [ ] Apply performs batch assignment and returns final variance.

**Technical Notes:** WebApplicationFactory; mocked ServerAccess; test Mongo.
**Dependencies:** Backend stories.
**Estimated Effort:** S (3)
**Priority:** Must

## Sprint Plan

## Sprint 1: AI Core + Wizard & Preview
**Duration:** 2 weeks
**Sprint Goal:** OpenAI integration, prompt/parsing, preview UI.
**Stories:** US-204 (S), US-205 (M), US-207 (M), US-201 (S), US-202 (M), US-210 (S)
**Capacity:** 10 days | **Committed:** ~22 points (incl. AI + buffer)

## Sprint 2: Fallback, Preferences, Apply, Tests
**Duration:** 2 weeks
**Sprint Goal:** Rule-based fallback, user prefs, apply flow, and coverage.
**Stories:** US-206 (S), US-208 (S), US-209 (S), US-203 (M), US-211 (S), US-212 (S)
**Capacity:** 10 days | **Committed:** ~22 points (incl. AI + buffer)

## Dependencies & Risks
- Dependencies: FR-005 tasks; FR-006 workloads; user profiles.
- Risks: API cost/latency; privacy; explainability; fallback quality.

## Release Phases
- Phase 1 (MVP): Sprints 1-2
- Phase 2 (Enhancement): Caching, multi-model options, better UX
- Phase 3 (Optimization): Active learning, advanced constraints
