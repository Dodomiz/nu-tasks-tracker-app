# FR-007 Progress: AI-Powered Task Distribution

**Started:** December 16, 2025  
**Status:** In Progress

## Sprint 1: AI Core + Wizard & Preview (Week 1-2)

### Session 1: December 16, 2025

#### ✅ Completed
- [ ] Read workplan and design documentation
- [ ] Created progress tracking file

#### ✅ Completed (Backend Core)
- [x] US-204: OpenAI ServerAccess + Config
  - Created `OpenAIServerAccess` with IHttpClientFactory
  - Added DTOs: ChatCompletionRequest, ChatCompletionResponse
  - Configured API key in appsettings.json
  - Registered HttpClient and service in DI
- [x] US-205: AIDistributionEngine – Prompt + Parse
  - Implemented prompt builder (system + user prompts)
  - JSON mode response parsing with validation
  - Confidence scores and rationale extraction
- [x] US-206: Rule-Based Fallback Distributor
  - Deterministic algorithm (difficulty-sorted, lowest workload)
  - Variance calculation
  - Fixed 0.5 confidence for rule-based assignments
- [x] US-207: DistributionService + Repository
  - Preview storage with 24h expiry
  - Background processing with async Task
  - AI-first with fallback to rule-based
  - Apply operation with modification support

#### ✅ Completed (Build Fixes)
- [x] Fixed all backend build errors
  - Fixed 8 ApiResponse.ErrorResponse calls with proper error codes
  - Fixed FindAsync parameter naming (page, categoryId, cancellationToken)
  - Fixed TaskStatus enum references (Core.Domain.TaskStatus)
  - Removed CategoryId reference from TaskItem
  - Fixed Count property/method access
  - Added GetMembersAsync to IGroupRepository
  - Added GetByIdsAsync to IUserRepository
  - Fixed User.DisplayName reference (use FirstName + LastName)
- [x] Build succeeds with 0 errors (8 warnings)

#### 🔄 In Progress (Frontend)
- [x] US-201: Distribution Wizard (basic form)
  - Added route `/groups/:groupId/distribution`
  - Form with date range, calls `POST /api/distribution/generate`
  - On success navigates to preview with `previewId`
- [x] US-202: Preview Assignments View (read-only)
  - Added route `/distribution/preview/:id`
  - Polls `GET /api/distribution/preview/{id}`
  - Displays status, stats, and assignments
- [ ] US-203: Modify & Apply Assignments
  - Apply button calls `POST /api/distribution/{id}/apply` (no modifications yet)
- [ ] US-210: Unit – Prompt & Parse

---

## Implementation Notes

### Technical Decisions
- Using IHttpClientFactory for OpenAI HTTP client
- JSON mode for structured responses
- Anonymized payloads (only IDs, no PII)
- 30-second timeout for AI requests
- Background processing for distribution generation
- 24-hour expiry for previews
- AI-first with automatic fallback to rule-based

### Files Created
**Infrastructure:**
- `/Infrastructure/ServerAccess/OpenAI/ChatCompletionModels.cs`
- `/Infrastructure/ServerAccess/OpenAI/IOpenAIServerAccess.cs`
- `/Infrastructure/ServerAccess/OpenAI/OpenAIServerAccess.cs`
- `/Infrastructure/Repositories/DistributionRepository.cs`

**Domain:**
- `/Core/Domain/DistributionPreview.cs`
- `/Core/Interfaces/IDistributionRepository.cs`

**Features:**
- `/Features/Distribution/Models/DistributionModels.cs`
- `/Features/Distribution/Services/AIDistributionEngine.cs`
- `/Features/Distribution/Services/RuleBasedDistributor.cs`
- `/Features/Distribution/Services/IDistributionService.cs`
- `/Features/Distribution/Services/DistributionService.cs`
- `/Features/Distribution/Controllers/DistributionController.cs`

**Web (Frontend):**
- `web/src/features/distribution/api/distributionApi.ts`
- `web/src/features/distribution/pages/DistributionWizardPage.tsx`
- `web/src/features/distribution/pages/DistributionPreviewPage.tsx`
- Routes added in `web/src/App.tsx`

**Configuration:**
- Updated `appsettings.json` with OpenAI section
- Updated `appsettings.Development.json` with API key placeholder
- Updated `Program.cs` with service registrations

### Blockers
- None currently

### Next Steps
1. ~~Test backend build~~ ✅ Build succeeds
2. Verify API endpoints work (manual testing or integration tests)
3. Start frontend implementation (US-201, US-202, US-203)
4. Implement unit tests (US-210, US-211, US-212)
