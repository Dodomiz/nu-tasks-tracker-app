# Progress - 2025-12-15

## Epic E3: Testing & Quality Assurance

- Added backend xUnit test project: backend/tests/TasksTracker.Api.Tests
- Installed test dependencies: xUnit, FluentAssertions, Moq, Microsoft.NET.Test.Sdk, coverlet.collector
- Wrote unit tests for GroupService (create, auth checks, update/delete rules)
- Wrote unit tests for InvitationService (validate code, build URL from config)
- Registered test project in solution and verified tests pass (9 tests)
- Verified existing frontend Vitest suite passes (28 tests)
 - Added RTL tests: GroupSelector (empty state, list render) and CreateGroupPage (validation, submit success)
 - Polyfilled ResizeObserver for JSDOM via web/src/test/setup.ts and configured Vitest setupFiles
 - Frontend tests now: 32 passing

### Integration
- Added integration tests project: backend/tests/TasksTracker.Api.IntegrationTests
- Introduced partial Program for WebApplicationFactory
- Implemented CustomWebApplicationFactory with TestAuthHandler and mocked IGroupService
- Added tests: /health returns healthy; GET /api/Groups returns mocked empty list
- All integration tests passing (2 tests)

### CI & Coverage
- Updated CI workflow (.github/workflows/ci.yml) to collect and upload coverage for backend (coverlet) and frontend (Vitest)
- Added frontend coverage script: `npm run test:coverage`

Next:
- Add API integration tests using WebApplicationFactory and TestServer
- Expand frontend tests for group UI components (GroupSelector, CreateGroupPage)
- Add coverage reporting for CI
