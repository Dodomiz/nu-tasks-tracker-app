# Work Plan: Task Library (FR-004)

**Document Version:** 1.0  
**Last Updated:** December 15, 2025  
**Design Reference:** [design-task-library.md](design-task-library.md)  
**PRD Reference:** [prd.md](prd.md#fr-004-task-library)

---

## Vision & Metrics

### Vision Statement
For **family admins and group managers** who **repeatedly create similar tasks each week**,  
the **Task Library** is a **reusable template system** that **reduces task creation time by 70% and ensures consistent difficulty scoring across the group**.

### Success Metrics

**User Adoption:**
- 60% of tasks created from templates within 1 month of launch
- 40% of groups create at least 1 custom template within 2 weeks
- 70% reduction in average task creation time (measured via analytics)

**Technical Performance:**
- Template list loads in <100ms (P95) for 500 templates
- Task creation from template completes in <200ms end-to-end (P95)
- Template filter queries execute in <10ms using MongoDB indexes

**User Satisfaction:**
- "Task library" feature rated 4.5/5 stars in user surveys
- <5 support tickets per 100 groups related to template confusion

---

## Timeline Overview

**Total:** 4 Epics | 16 User Stories | 3 Sprints (6 weeks)

**Release Phases:**
- **Phase 1 (MVP):** Sprints 1-2 – Core template functionality (client + backend + basic tests)
- **Phase 2 (Enhancement):** Sprint 3 – Admin management UI, comprehensive testing, data seeding
- **Phase 3 (Future):** Post-MVP – User-requested templates, versioning, AI generation

---

## Epics

### Epic E1: Template Discovery & Selection (Client-Side)
**Description:** Enable admins to browse, search, and select templates when creating tasks  
**Business Value:** Reduces cognitive load and task creation time by providing pre-configured options  
**Success Criteria:**
- Admin can view combined list of global + group templates
- Template selection pre-fills task creation form
- Search/filter by category and difficulty works in <50ms
**Estimated Effort:** 1.5 sprints (6 days with AI)  
**Priority:** Critical – Must Have for MVP

### Epic E2: Template Data Management (Backend)
**Description:** Backend infrastructure for storing, retrieving, and managing task templates  
**Business Value:** Provides scalable, performant foundation for template system  
**Success Criteria:**
- Templates stored in separate `taskLibrary` MongoDB collection
- API supports CRUD operations with proper authorization
- System templates read-only, group templates admin-editable
**Estimated Effort:** 1 sprint (4 days with AI)  
**Priority:** Critical – Must Have for MVP

### Epic E3: Admin Template Management (Client-Side)
**Description:** Admin UI for creating and managing custom group templates  
**Business Value:** Enables groups to extend library with domain-specific tasks  
**Success Criteria:**
- Admin can create custom templates with all task metadata
- Admin can edit/delete group templates (not system templates)
- Template list shows clear distinction between global and custom
**Estimated Effort:** 1 sprint (4 days with AI)  
**Priority:** High – Should Have for MVP

### Epic E4: Testing & Data Seeding
**Description:** Comprehensive test coverage and initial template data  
**Business Value:** Ensures reliability and provides immediate value at launch  
**Success Criteria:**
- 70%+ code coverage for template features
- 50-100 predefined system templates seeded on startup
- Integration tests validate end-to-end workflows
**Estimated Effort:** 0.5 sprints (2 days with AI)  
**Priority:** High – Should Have for MVP

---

## User Stories by Epic

### Epic E1: Template Discovery & Selection (Client-Side)

#### Story US-001: View Available Templates
**As an** admin **I want to** view a list of available task templates **So that** I can quickly select pre-configured tasks instead of creating from scratch

**Acceptance Criteria:**
- [ ] GET request to `/api/groups/{groupId}/templates` returns combined list of system + group templates
- [ ] Template list displays: name, category, difficulty level, duration estimate
- [ ] System templates visually distinguished from group templates (e.g., badge or icon)
- [ ] Templates grouped by category with collapsible sections
- [ ] Empty state shows "No templates available" message

**Technical Notes:**
- Create `templatesApi.ts` in `web/src/app/api/` using RTK Query
- Add `useGetTemplatesQuery(groupId)` hook
- Template response includes: `id, name, description, categoryId, difficultyLevel, estimatedDurationMinutes, defaultFrequency, isSystemTemplate`

**Dependencies:** None (can use mock data initially)

**Estimated Effort:** 1.5 days
- API integration: 0.5d
- Component creation: 0.5d
- Styling with Tailwind: 0.25d
- Review/refinement: 0.25d

**Priority:** Must Have

---

#### Story US-002: Search and Filter Templates
**As an** admin **I want to** search and filter templates by name, category, and difficulty **So that** I can quickly find the right template from a large library

**Acceptance Criteria:**
- [ ] Search input filters templates by name (case-insensitive, real-time)
- [ ] Category dropdown filters to specific category or "All Categories"
- [ ] Difficulty range slider filters templates (e.g., 1-3, 4-7, 8-10)
- [ ] Filters combine (AND logic): search + category + difficulty
- [ ] Filter state persists during session (local component state)
- [ ] Clear filters button resets all filters

**Technical Notes:**
- Use `useMemo` to filter templates client-side (no server round-trip)
- Debounce search input with 300ms delay
- Store filter state in component using `useState`
- Tailwind for responsive filter UI (mobile: stacked, desktop: inline)

**Dependencies:** US-001 (requires template list)

**Estimated Effort:** 1 day
- Search implementation: 0.25d
- Filter controls: 0.25d
- Filter logic: 0.25d
- UI polish: 0.25d

**Priority:** Should Have

---

#### Story US-003: Template Selection in Task Form
**As an** admin **I want to** select a template when creating a task and have it pre-fill the form **So that** I don't need to manually enter repetitive task details

**Acceptance Criteria:**
- [ ] Task creation form includes "Create from Template" toggle
- [ ] When enabled, shows template picker dropdown (searchable, grouped by category)
- [ ] Selecting template pre-fills: name, description, category, difficulty, frequency
- [ ] Pre-filled values are editable (admin can override template defaults)
- [ ] Clearing selection resets form to empty state
- [ ] Form shows "Based on template: [Template Name]" when template selected

**Technical Notes:**
- Extend existing `TaskForm.tsx` component in `web/src/features/tasks/components/`
- Create `TemplatePicker` as separate component (reusable)
- Use React Hook Form's `setValue()` to populate form fields
- Store `templateId` in hidden field for backend submission

**Dependencies:** US-001 (requires template data)

**Estimated Effort:** 2 days
- TemplatePicker component: 0.75d
- TaskForm integration: 0.5d
- Form pre-fill logic: 0.5d
- Testing/refinement: 0.25d

**Priority:** Must Have

---

#### Story US-004: Template Preview Modal
**As an** admin **I want to** preview template details before selecting it **So that** I understand what fields will be pre-filled

**Acceptance Criteria:**
- [ ] Clicking template name/info icon opens preview modal
- [ ] Modal displays: name, description, category, difficulty, duration, default frequency
- [ ] Modal includes "Use This Template" button (closes modal and selects template)
- [ ] Modal includes "Cancel" button (closes without selecting)
- [ ] Modal is keyboard accessible (ESC to close, focus trap)

**Technical Notes:**
- Create `TemplatePreviewModal.tsx` component
- Use existing modal component pattern from codebase
- Tailwind modal styling with backdrop blur
- Accessibility: `role="dialog"`, `aria-labelledby`, `aria-describedby`

**Dependencies:** US-001 (requires template data)

**Estimated Effort:** 1 day
- Modal component: 0.5d
- Integration with template list: 0.25d
- Accessibility testing: 0.25d

**Priority:** Could Have

---

### Epic E2: Template Data Management (Backend)

#### Story US-005: TaskTemplate Domain Model
**As a** developer **I want to** create the TaskTemplate domain model **So that** templates can be stored and retrieved from MongoDB

**Acceptance Criteria:**
- [ ] `TaskTemplate.cs` created in `backend/src/TasksTracker.Api/Core/Domain/`
- [ ] Includes fields: Id, Name, Description, CategoryId, DifficultyLevel, EstimatedDurationMinutes, DefaultFrequency, IsSystemTemplate, GroupId, CreatedAt, UpdatedAt, CreatedBy, IsDeleted, DeletedAt
- [ ] Uses `[BsonId]` and `[BsonRepresentation]` attributes for MongoDB serialization
- [ ] DifficultyLevel constrained to 1-10 (validation attribute)
- [ ] DefaultFrequency uses enum: OneTime, Daily, Weekly, BiWeekly, Monthly, Quarterly, Yearly

**Technical Notes:**
- Follow existing domain model patterns (see `Category.cs`, `Group.cs`)
- Use primary constructor for cleaner syntax (.NET 9)
- Add XML documentation comments for public properties

**Dependencies:** None

**Estimated Effort:** 0.5 days
- Model creation: 0.25d
- Validation attributes: 0.25d

**Priority:** Must Have

---

#### Story US-006: TemplateRepository
**As a** developer **I want to** create a repository for TaskTemplate CRUD operations **So that** services can interact with the taskLibrary collection

**Acceptance Criteria:**
- [ ] `TemplateRepository.cs` created in `backend/src/TasksTracker.Api/Infrastructure/Repositories/`
- [ ] Inherits from `BaseRepository<TaskTemplate>`
- [ ] Implements `ITemplateRepository` interface
- [ ] Method: `GetTemplatesForGroupAsync(groupId)` returns system + group templates (excludes soft-deleted)
- [ ] Method: `GetByIdAsync(id)` includes soft-delete check
- [ ] MongoDB collection name: `"taskLibrary"`
- [ ] Compound index created: `{ GroupId: 1, IsSystemTemplate: 1, IsDeleted: 1 }`

**Technical Notes:**
- Use `IMongoCollection<TaskTemplate>` from `MongoDbContext`
- Filter: `isDeleted == false && (isSystemTemplate == true || groupId == X)`
- Index creation in repository constructor (if not exists)

**Dependencies:** US-005 (requires TaskTemplate model)

**Estimated Effort:** 0.75 days
- Repository implementation: 0.5d
- Index configuration: 0.25d

**Priority:** Must Have

---

#### Story US-007: TemplateService Business Logic
**As a** developer **I want to** implement TemplateService **So that** template CRUD operations include validation and authorization

**Acceptance Criteria:**
- [ ] `TemplateService.cs` created in `backend/src/TasksTracker.Api/Features/Tasks/Services/`
- [ ] Method: `GetTemplatesAsync(groupId, filters)` returns filtered templates
- [ ] Method: `CreateTemplateAsync(groupId, request, userId)` validates input and creates group template
- [ ] Method: `UpdateTemplateAsync(id, request, userId)` allows editing group templates only (not system)
- [ ] Method: `DeleteTemplateAsync(id, userId)` soft-deletes group templates only
- [ ] Validation: name required (max 100 chars), difficulty 1-10, valid frequency enum
- [ ] Authorization: Only admins can create/edit/delete group templates
- [ ] Category validation: Calls `CategoryService.ValidateCategoryAsync()` if categoryId provided

**Technical Notes:**
- Use primary constructor to inject `ITemplateRepository`, `ICategoryService`
- Throw `ValidationException` for invalid input
- Throw `UnauthorizedAccessException` for system template edit attempts
- Return `TemplateDto` objects (map from domain model)

**Dependencies:** US-006 (requires repository), Existing `CategoryService`

**Estimated Effort:** 1.5 days
- CRUD methods: 0.75d
- Validation logic: 0.5d
- Error handling: 0.25d

**Priority:** Must Have

---

#### Story US-008: Template API Endpoints
**As an** admin **I want to** access template REST API endpoints **So that** I can retrieve and manage templates via HTTP

**Acceptance Criteria:**
- [ ] `TemplateController.cs` created in `backend/src/TasksTracker.Api/Features/Tasks/Controllers/`
- [ ] `GET /api/groups/{groupId}/templates` – List templates (optional query params: categoryId, difficulty, frequency)
- [ ] `GET /api/groups/{groupId}/templates/{id}` – Get template by ID
- [ ] `POST /api/groups/{groupId}/templates` – Create group template (admin only)
- [ ] `PUT /api/groups/{groupId}/templates/{id}` – Update group template (admin only)
- [ ] `DELETE /api/groups/{groupId}/templates/{id}` – Delete group template (admin only)
- [ ] All endpoints require JWT authentication (`[Authorize]`)
- [ ] Create/Update/Delete require admin role verification
- [ ] Returns standardized error responses (400, 403, 404)

**Technical Notes:**
- Use `[ApiController]` and `[Route("api/groups/{groupId}/templates")]` attributes
- Inject `ITemplateService` via constructor
- Use `[FromRoute]`, `[FromBody]`, `[FromQuery]` parameter binding
- Return `ActionResult<T>` for proper HTTP status codes

**Dependencies:** US-007 (requires service layer)

**Estimated Effort:** 1 day
- Controller setup: 0.25d
- Endpoint implementation: 0.5d
- Error handling: 0.25d

**Priority:** Must Have

---

#### Story US-009: Extend Task Creation with TemplateId
**As a** developer **I want to** extend task creation to accept templateId **So that** tasks can be created from templates with pre-filled data

**Acceptance Criteria:**
- [ ] `Task.cs` domain model extended with `TemplateId` and `TemplateName` fields
- [ ] `CreateTaskRequest` accepts optional `templateId` parameter
- [ ] `TaskService.CreateTaskAsync()` checks if `templateId` provided
- [ ] If templateId present: load template, validate access (system or group-scoped), populate task fields
- [ ] If templateId invalid/deleted: return `400 Bad Request: "Template not found"`
- [ ] Task created with `templateId` and `templateName` (snapshot for audit trail)
- [ ] Existing task creation workflow unchanged if no templateId provided

**Technical Notes:**
- Inject `ITemplateRepository` into `TaskService`
- Template access check: `isSystemTemplate || template.groupId == task.groupId`
- Map template fields to task: name, description, categoryId, difficultyLevel, defaultFrequency (override if request specifies)
- Handle deleted category fallback to "General"

**Dependencies:** US-007 (requires template service), Existing `TaskService`

**Estimated Effort:** 1.5 days
- Model extension: 0.25d
- Service logic: 0.75d
- Validation/error handling: 0.5d

**Priority:** Must Have

---

### Epic E3: Admin Template Management (Client-Side)

#### Story US-010: Create Custom Template Form
**As an** admin **I want to** create a custom group template **So that** I can add domain-specific tasks to our library

**Acceptance Criteria:**
- [ ] "Manage Templates" page accessible from group settings/admin dashboard
- [ ] "Add Custom Template" button opens template creation form
- [ ] Form fields: name (required), description (optional), category (dropdown), difficulty (1-10 slider), duration estimate (minutes input), default frequency (dropdown)
- [ ] Form validates: name required, difficulty 1-10, positive duration
- [ ] Submitting form calls `POST /api/groups/{groupId}/templates`
- [ ] Success: form resets, template added to list, success toast notification
- [ ] Error: displays error message below form

**Technical Notes:**
- Create `TemplateForm.tsx` in `web/src/features/tasks/components/`
- Use React Hook Form for validation
- Create `useCreateTemplateMutation()` RTK Query hook
- Tailwind form styling consistent with existing task forms
- Mobile-responsive (stacked layout on small screens)

**Dependencies:** US-008 (requires POST endpoint)

**Estimated Effort:** 1.5 days
- Form component: 0.75d
- API integration: 0.25d
- Validation/error handling: 0.25d
- UI polish: 0.25d

**Priority:** Should Have

---

#### Story US-011: Edit Group Template
**As an** admin **I want to** edit custom group templates **So that** I can update task details as needs change

**Acceptance Criteria:**
- [ ] Template list shows "Edit" button for group templates (not system templates)
- [ ] Clicking "Edit" opens template form pre-filled with current values
- [ ] Form allows editing: name, description, category, difficulty, duration, frequency
- [ ] Submitting form calls `PUT /api/groups/{groupId}/templates/{id}`
- [ ] Success: template list refreshes, success toast notification
- [ ] Editing system template shows disabled form with "System templates are read-only" message

**Technical Notes:**
- Reuse `TemplateForm.tsx` component (edit mode)
- Create `useUpdateTemplateMutation()` RTK Query hook
- Pre-fill form using `setValue()` from React Hook Form
- Check `isSystemTemplate` flag to disable edit UI

**Dependencies:** US-010 (requires form component), US-008 (requires PUT endpoint)

**Estimated Effort:** 1 day
- Edit mode logic: 0.5d
- API integration: 0.25d
- UI updates: 0.25d

**Priority:** Should Have

---

#### Story US-012: Delete Group Template
**As an** admin **I want to** delete custom group templates **So that** I can remove templates we no longer use

**Acceptance Criteria:**
- [ ] Template list shows "Delete" button for group templates (not system templates)
- [ ] Clicking "Delete" shows confirmation modal: "Delete template '[Name]'? Tasks created from this template will not be affected."
- [ ] Confirming calls `DELETE /api/groups/{groupId}/templates/{id}`
- [ ] Success: template removed from list, success toast notification
- [ ] Error: displays error message in modal
- [ ] System templates have no delete button

**Technical Notes:**
- Create confirmation modal component (or reuse existing)
- Create `useDeleteTemplateMutation()` RTK Query hook
- Optimistic update: remove from UI immediately, rollback on error
- Handle 403 error if attempting to delete system template

**Dependencies:** US-008 (requires DELETE endpoint)

**Estimated Effort:** 0.75 days
- Delete confirmation: 0.25d
- API integration: 0.25d
- Optimistic updates: 0.25d

**Priority:** Should Have

---

#### Story US-013: Template Management Page
**As an** admin **I want to** access a dedicated template management page **So that** I can view, create, edit, and delete templates in one place

**Acceptance Criteria:**
- [ ] "Manage Templates" link in group settings menu (admin only)
- [ ] Page displays combined list of system + group templates
- [ ] System templates shown with read-only badge
- [ ] Group templates have "Edit" and "Delete" actions
- [ ] "Add Custom Template" button at top of page
- [ ] Search and filter controls (reuse from US-002)
- [ ] Responsive design (mobile: stacked list, desktop: table view)

**Technical Notes:**
- Create `TemplateManagement.tsx` page in `web/src/features/tasks/pages/`
- Reuse `TemplatePicker` search/filter logic
- Add route: `/groups/:groupId/templates`
- Protect route with admin role check
- Display count: "X system templates, Y custom templates"

**Dependencies:** US-001 (template list), US-010 (create form), US-011 (edit), US-012 (delete)

**Estimated Effort:** 1.25 days
- Page layout: 0.5d
- Component integration: 0.5d
- Routing/authorization: 0.25d

**Priority:** Should Have

---

### Epic E4: Testing & Data Seeding

#### Story US-014: Backend Unit Tests
**As a** developer **I want to** write unit tests for template services and repositories **So that** I can ensure business logic correctness

**Acceptance Criteria:**
- [ ] `TemplateServiceTests.cs` in `backend/tests/TasksTracker.Api.Tests/Tasks/`
- [ ] Tests cover: CreateTemplate (valid/invalid), UpdateTemplate (group/system), DeleteTemplate (soft delete), GetTemplates (filters)
- [ ] Mock `ITemplateRepository` and `ICategoryService` dependencies
- [ ] Tests validate: authorization checks, input validation, error handling
- [ ] Minimum 70% code coverage for `TemplateService`
- [ ] All tests pass with green status

**Technical Notes:**
- Use xUnit framework
- Use Moq for mocking dependencies
- Test naming convention: `MethodName_Scenario_ExpectedOutcome`
- Include edge cases: null inputs, deleted templates, invalid IDs

**Dependencies:** US-007 (requires service implementation)

**Estimated Effort:** 1 day
- Test setup: 0.25d
- Test implementation: 0.5d
- Edge case coverage: 0.25d

**Priority:** Should Have

---

#### Story US-015: Backend Integration Tests
**As a** developer **I want to** write integration tests for template API endpoints **So that** I can validate end-to-end workflows

**Acceptance Criteria:**
- [ ] `TemplateControllerTests.cs` in `backend/tests/TasksTracker.Api.IntegrationTests/Tasks/`
- [ ] Tests cover: GET templates (combined list), POST template (admin), PUT template (group only), DELETE template (soft delete), POST task with templateId
- [ ] Tests use real MongoDB test database (in-memory or test container)
- [ ] Tests validate HTTP status codes (200, 201, 400, 403, 404)
- [ ] Tests validate response JSON structure
- [ ] Cleanup test data after each test (database reset)

**Technical Notes:**
- Use `WebApplicationFactory<Program>` for integration testing
- Seed test data (system + group templates) in test setup
- Use `HttpClient` to call API endpoints
- Assert response using `FluentAssertions` or xUnit assertions

**Dependencies:** US-008 (requires API endpoints), US-009 (task integration)

**Estimated Effort:** 1.5 days
- Test infrastructure: 0.5d
- Endpoint tests: 0.75d
- Cleanup/refactoring: 0.25d

**Priority:** Should Have

---

#### Story US-016: Frontend Component Tests
**As a** developer **I want to** write tests for template React components **So that** I can ensure UI behavior correctness

**Acceptance Criteria:**
- [ ] Tests for `TemplatePicker.tsx`: renders list, filters work, selection emits event
- [ ] Tests for `TemplateForm.tsx`: validates input, submits data, displays errors
- [ ] Tests for `TemplatePreviewModal.tsx`: displays template data, closes on cancel/ESC
- [ ] Use Vitest + React Testing Library
- [ ] Mock RTK Query hooks with `msw` (Mock Service Worker)
- [ ] All tests pass with green status

**Technical Notes:**
- Test files: `*.test.tsx` in `web/src/features/tasks/components/__tests__/`
- Use `render()` from React Testing Library
- Use `userEvent` for interactions (click, type)
- Mock API responses with `msw` handlers
- Assert DOM elements with `screen.getByRole()`, `screen.getByText()`

**Dependencies:** US-003 (TemplatePicker), US-010 (TemplateForm), US-004 (Modal)

**Estimated Effort:** 1.5 days
- Test setup: 0.25d
- Component tests: 1d
- Mock configuration: 0.25d

**Priority:** Could Have

---

#### Story US-017: Seed System Templates
**As a** developer **I want to** seed initial system templates on application startup **So that** groups have a library of common tasks immediately available

**Acceptance Criteria:**
- [ ] `SeedTaskTemplates.cs` utility class in `backend/src/TasksTracker.Api/Infrastructure/Data/`
- [ ] Loads 50-100 templates from JSON file (`task-templates-seed.json`)
- [ ] Templates grouped by category: Household (20), Business (15), Personal (10), Fitness (5), Other (10)
- [ ] Seeds run on application startup if `taskLibrary` collection is empty
- [ ] Seed data includes: name, description, category name (mapped to ID), difficulty, duration, frequency
- [ ] Idempotent: running multiple times doesn't duplicate templates

**Technical Notes:**
- Call seed method in `Program.cs` startup configuration
- Check template count: `if (await templateRepo.CountAsync() == 0) { await SeedTemplates(); }`
- Map category names to IDs using `CategoryRepository.FindByNameAsync()`
- Set `isSystemTemplate = true`, `groupId = null`, `createdBy = "system"`
- Log seed completion: "Seeded X task templates"

**Dependencies:** US-006 (repository), Existing categories

**Estimated Effort:** 1 day
- Seed script: 0.5d
- JSON data file: 0.25d
- Startup integration: 0.25d

**Priority:** Should Have

---

## Sprint Plan

### Sprint 1: Client-Side Foundation (2 weeks)
**Sprint Goal:** Admin can view and select templates to pre-fill task creation form

**Stories:**
- US-001: View Available Templates (1.5d) – Must Have
- US-002: Search and Filter Templates (1d) – Should Have
- US-003: Template Selection in Task Form (2d) – Must Have
- US-004: Template Preview Modal (1d) – Could Have

**Capacity:** 10 team days  
**Committed:** 5.5 days (including buffer)  
**Deliverable:** Working template picker in task creation flow (can use mock data)

---

### Sprint 2: Backend Infrastructure (2 weeks)
**Sprint Goal:** Backend API supports template CRUD and task creation from templates

**Stories:**
- US-005: TaskTemplate Domain Model (0.5d) – Must Have
- US-006: TemplateRepository (0.75d) – Must Have
- US-007: TemplateService Business Logic (1.5d) – Must Have
- US-008: Template API Endpoints (1d) – Must Have
- US-009: Extend Task Creation with TemplateId (1.5d) – Must Have

**Capacity:** 10 team days  
**Committed:** 5.25 days (including buffer)  
**Deliverable:** Functional template API with task integration

---

### Sprint 3: Admin Management & Testing (2 weeks)
**Sprint Goal:** Complete admin template management UI and comprehensive testing

**Stories:**
- US-010: Create Custom Template Form (1.5d) – Should Have
- US-011: Edit Group Template (1d) – Should Have
- US-012: Delete Group Template (0.75d) – Should Have
- US-013: Template Management Page (1.25d) – Should Have
- US-014: Backend Unit Tests (1d) – Should Have
- US-015: Backend Integration Tests (1.5d) – Should Have
- US-016: Frontend Component Tests (1.5d) – Could Have
- US-017: Seed System Templates (1d) – Should Have

**Capacity:** 10 team days  
**Committed:** 9.5 days (ambitious but achievable with AI assistance)  
**Deliverable:** Production-ready task library feature with test coverage

---

## Dependencies & Risks

### Technical Dependencies

| Dependency | Impacts | Mitigation |
|------------|---------|------------|
| **Existing CategoryService** | Template-category validation (US-007) | Reuse existing API; fallback to "General" if category deleted |
| **TaskService/TaskRepository** | Task creation integration (US-009) | Well-established pattern; low risk |
| **MongoDB indexes** | Template query performance (US-006) | Create indexes in repository constructor; monitor slow queries |
| **RTK Query setup** | Frontend API calls (US-001, US-010) | Existing pattern in codebase; reuse for consistency |
| **React Hook Form** | Form validation (US-010, US-011) | Already used in TaskForm; extend existing patterns |

### External Dependencies
- **MongoDB 4.4+:** Required for compound indexes
- **JSON seed file:** Template data must be curated before Sprint 3

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Category deletion breaks templates** | Medium | High | Implement fallback to "General" category; warn admin before category delete |
| **Template proliferation** | Low | Medium | Add pagination + search early; consider 100-template limit per group |
| **Scope creep (user-requested templates)** | High | Medium | Defer to Phase 3; focus MVP on admin-managed templates |
| **i18n translation workload** | Medium | High | Start with English only; add Hebrew in Phase 2 |
| **Performance degradation with 500+ templates** | Medium | Low | Implement client-side caching; paginate if needed (currently load all) |
| **Testing timeline overrun** | Medium | Medium | Prioritize unit tests (US-014) over component tests (US-016 = Could Have) |

---

## Release Phases

### Phase 1 (MVP): Sprints 1-2
**Scope:** Core template functionality
- ✅ View and select templates (client)
- ✅ Search and filter templates (client)
- ✅ Backend CRUD API for templates
- ✅ Task creation from templates
- ✅ Basic error handling

**Excludes:** Admin management UI, comprehensive tests, data seeding

### Phase 2 (Enhancement): Sprint 3
**Scope:** Complete admin experience
- ✅ Custom template creation/editing/deletion
- ✅ Template management page
- ✅ Unit and integration tests
- ✅ 50-100 seeded system templates
- ✅ Production-ready error handling

**Excludes:** User-requested templates, versioning, i18n (Hebrew)

### Phase 3 (Future): Post-MVP
**Scope:** Advanced features
- User-requested templates with approval workflow
- Template versioning and revision history
- Template sharing between groups
- AI-generated templates from natural language
- Hebrew localization for template names/descriptions
- Advanced analytics (most-used templates, completion rates)

---

## Validation Checklist

- [x] Stories follow INVEST principles (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- [x] Estimates include AI assistance multiplier (3-5x for CRUD, 4-6x for tests)
- [x] 20% buffer included in sprint capacity (10 days capacity vs 5-9.5 days committed)
- [x] Dependencies documented for each story
- [x] Each sprint delivers shippable value (Sprint 1: client demo, Sprint 2: functional API, Sprint 3: production-ready)
- [x] All stories have testable acceptance criteria
- [x] Prioritization follows user request: client → backend → tests
- [x] Critical path identified: US-001 → US-003 (client) → US-005→US-006→US-007→US-008 (backend) → US-009 (integration)

---

## Success Criteria

**Definition of Done (Per Story):**
- [ ] Code implemented and peer reviewed
- [ ] Acceptance criteria met and verified
- [ ] Unit tests written and passing (backend stories)
- [ ] Integration/component tests written (if applicable)
- [ ] Documentation updated (API docs, README)
- [ ] No critical bugs or regressions
- [ ] Deployed to staging environment

**Definition of Done (Per Sprint):**
- [ ] All committed stories completed
- [ ] Sprint demo conducted with stakeholders
- [ ] Retrospective completed with action items
- [ ] Velocity and burn-down tracked
- [ ] Technical debt documented (if any)

**Definition of Done (MVP - End of Sprint 3):**
- [ ] 60% of tasks created from templates within 2 weeks (tracked via analytics)
- [ ] Template list loads in <100ms (P95)
- [ ] Task creation from template completes in <200ms (P95)
- [ ] 70%+ code coverage for template features
- [ ] Feature documented in user guide
- [ ] Zero P0/P1 bugs in production
- [ ] User feedback collected and rated 4+/5

---

**Document End**
