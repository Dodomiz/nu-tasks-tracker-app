# Development & Testing Execution Prompt 

## Purpose
Execute agile development sprints by implementing features from the workplan, conducting comprehensive testing, and maintaining high code quality with 60%+ code coverage across all technology stacks (React Native, .NET, Java, Python, TypeScript, etc.).

## Prerequisites
- Work plan exists (`docs/workplan.md`)
- Design document exists (`docs/design.md`)
- Development environment set up for your tech stack
- Version control initialized
- Build tools and test frameworks configured
- Don't start the work if prerequisites are not met, notify your human co-developer

## Core Principles

### Development Philosophy
1. **Follow the Plan**: Execute stories from workplan in priority order
2. **Design-Driven**: Implement according to design document specifications
3. **Develop Then Test**: Build working features first, then write comprehensive unit and integration tests
4. **Incremental Delivery**: Complete and validate each story before moving to next
5. **Ask When Unclear**: Consult your human co-developer for ambiguous requirements or if anything not clear
6. **Document Learnings**: Suggest to your human co-developer to capture to lessons-learned.md key insights and lessons learned to improve future stories


### Quality Gates
- ✅ **Code Coverage**: ≥60% for unit and integration tests combined
- ✅ **All Tests Pass**: 100% pass rate before story completion
- ✅ **Acceptance Criteria**: All checkboxes in story must be verified
- ✅ **No Critical Bugs**: Zero blocking issues before story marked done
- ✅ **Code Review Ready**: Clean, documented, idiomatic code
- ✅ **Lessons Documented**: Key insights captured in lessons-learned section

---

## Instructions

### Phase 1: Sprint Initialization

#### 1.1 Load Planning Documents
```bash
# Load work plan
cat docs/workplan.md

# Load design document
cat docs/design.md

# Check current sprint status in workplan
git log --oneline -10
```

#### 1.2 Identify Current Sprint and Stories
- Review sprint breakdown in workplan
- Identify current sprint number and goal
- List stories for current sprint with priorities
- Note any blockers or dependencies

#### 1.3 Set Up Development Environment
- Verify all required tools installed
- Check dependencies are up to date
- Ensure test framework configured
- Validate build pipeline works 


---

### Phase 2: Story Development Cycle

For each user story, follow this cycle:

#### 2.1 Story Analysis

**Read Story Details**:
- Story ID and title
- User persona and goal
- Acceptance criteria (all checkboxes)
- Technical notes
- Dependencies

**Create Development Plan**:
```markdown
## Story US-XXX Development Plan

### Understanding:
- What: [Feature description]
- Why: [Business value]
- Who: [User persona]

### Implementation Steps:
1. [ ] Create/update files: [list]
2. [ ] Write unit tests: [test cases]
3. [ ] Implement functionality: [approach]
4. [ ] Write integration tests: [scenarios]
5. [ ] Manual testing: [checklist]
6. [ ] Update documentation: [what]

### Success Criteria:
- [ ] All acceptance criteria met
- [ ] Code coverage ≥60%
- [ ] All tests pass
- [ ] Manual validation complete
```

**Ask Human Co-Developer** if:
- Acceptance criteria are ambiguous or incomplete
- Technical approach has multiple valid options and you need guidance
- Dependencies are unclear or blocked
- Estimated effort seems significantly off
- Requirements conflict with existing design

---

#### 2.2 Feature Implementation (Develop First)

**Step 1: Implement Core Functionality**

Build the feature according to design specifications, focusing on meeting acceptance criteria and handling expected use cases.

**Step 2: Build and Verify**

Run the project to verify implementation works (adapt commands to your tech stack):

```bash
# React Native / npm
npm start
npm run android  # or ios

# .NET
dotnet build
dotnet run

# Java / Maven
mvn clean install
mvn spring-boot:run

# Java / Gradle
./gradlew build
./gradlew bootRun

# Python
pip install -r requirements.txt
python app.py
```

**Step 3: Handle Edge Cases and Errors**

Add robust error handling:
- Null/undefined/empty inputs
- Network failures
- Validation errors
- Timeout scenarios
- Unexpected state transitions

**Step 4: Manual Verification**

Test the feature manually against acceptance criteria before writing automated tests.

---

#### 2.3 Write Unit Tests (After Implementation)

Now that the feature works, write comprehensive unit tests.

**Step 1: Create Test File**

Follow project conventions for test file location and naming.

**Step 2: Write Tests for Core Logic**

Cover all functions/methods, branches, and edge cases.

**Step 3: Test Edge Cases and Error Paths**

Write tests for:
- Null/undefined/empty inputs
- Boundary values (min, max, zero)
- Invalid data formats
- Error conditions
- Timeout scenarios

**Step 4: Run Unit Tests**

```bash
# React Native / Jest
npm test
npm test -- --coverage

# .NET
dotnet test
dotnet test --collect:"XPlat Code Coverage"

# Java / Maven
mvn test
mvn test jacoco:report

# Java / Gradle
./gradlew test
./gradlew test jacocoTestReport

# Python / pytest
pytest
pytest --cov=app tests/
```

**Step 5: Check Coverage**

Verify code coverage meets ≥60% target.

---

#### 2.4 Write Integration Tests

**Write Integration Tests**:
```typescript
// Example: WebView + Header integration test
describe('App Integration', () => {
  it('should render header and webview together', () => {
    const { getByText, getByTestId } = render(<App />);
    
    // Header visible
    expect(getByText('Loyalty Agent')).toBeTruthy();
    
    // WebView present
    expect(getByTestId('webview-container')).toBeTruthy();
  });

  it('should minimize app when button pressed', async () => {
    const { getByLabelText } = render(<App />);
    const minimizeBtn = getByLabelText('Minimize app');
    
    // Mock BackHandler
    const exitAppSpy = jest.spyOn(BackHandler, 'exitApp');
    
    fireEvent.press(minimizeBtn);
    
    expect(exitAppSpy).toHaveBeenCalled();
  });

  it('should handle webview load errors', async () => {
    const { getByTestId, findByText } = render(<App />);
    const webview = getByTestId('webview-container');
    
    // Simulate error
    fireEvent(webview, 'onError', {
      nativeEvent: { description: 'Network error' }
    });
    
    expect(await findByText(/Network error/i)).toBeTruthy();
  });
});
```

**Run Integration Tests**:
```bash
npm test -- --testPathPattern=integration --coverage
```

---

#### 2.5 Code Quality & Implementation Checklist

For each story, ensure:

**Code Quality**:
- [ ] TypeScript types defined (no `any` unless justified)
- [ ] ESLint passes with no warnings
- [ ] Code formatted with Prettier
- [ ] No console.log statements (use proper logging)
- [ ] Error handling implemented
- [ ] Edge cases considered

**Testing**:
- [ ] Unit tests for all functions/components
- [ ] Integration tests for workflows
- [ ] Edge cases tested (null, undefined, empty, error states)
- [ ] Mocks used appropriately
- [ ] Test names describe behavior clearly
- [ ] Code coverage ≥70%

**Documentation**:
- [ ] JSDoc comments for public APIs
- [ ] Complex logic explained with comments
- [ ] README updated if user-facing changes
- [ ] Type definitions documented

**Design Compliance**:
- [ ] Follows design.md specifications
- [ ] Uses constants from config files
- [ ] Matches component diagrams
- [ ] Implements sequence diagrams correctly

---

#### 2.6 Manual Testing

**Create Test Checklist** (based on acceptance criteria):
```markdown
## Manual Testing: US-XXX

### Test Environment:
- Device: [Android version]
- Build: [Debug/Release]
- Network: [WiFi/Mobile/Offline]

### Test Cases:
1. [ ] Happy path: [expected behavior]
   - Steps: [...]
   - Expected: [...]
   - Actual: [...]
   
2. [ ] Edge case: [scenario]
   - Steps: [...]
   - Expected: [...]
   - Actual: [...]
   
3. [ ] Error handling: [scenario]
   - Steps: [...]
   - Expected: [...]
   - Actual: [...]

### Bugs Found:
- [None / Bug description with severity]

### Screenshots/Videos:
- [Attach evidence of testing]
```

**Execute Manual Tests** (adapt to your tech stack):
- Build and run the application
- Execute test cases systematically
- Document results for each test case
- Capture evidence (screenshots/logs)

---

#### 2.7 Code Review Self-Check

Before marking story complete, review:

**Architecture**:
- [ ] Follows design patterns from design.md
- [ ] Component structure matches diagrams
- [ ] Separation of concerns maintained
- [ ] No circular dependencies

**Security**:
- [ ] No hardcoded credentials or API keys
- [ ] Input validation present
- [ ] Permissions requested appropriately
- [ ] Sensitive data not logged

**Performance**:
- [ ] No unnecessary re-renders (React)
- [ ] Large lists virtualized
- [ ] Images optimized
- [ ] Network requests efficient

**Accessibility**:
- [ ] Accessibility labels present
- [ ] Touch targets ≥44dp
- [ ] Color contrast sufficient
- [ ] Screen reader tested (if applicable)

**Ask Human Co-Developer**:
- "Can you review story US-XXX? Implementation complete with coverage at X%"
- "Found edge case [Y] not in acceptance criteria - should I handle it?"
- "Technical debt item [Z] - address now or defer to backlog?"

---

#### 2.8 Story Completion & Lessons Learned

**Mark Story Done** when all criteria met:
```markdown
### Story US-XXX: [Title] ✅ COMPLETE

**Implementation Summary**:
- Files created/modified: [list]
- Test coverage: X% (unit), Y% (integration)
- Manual tests: All passed
- Bugs found and fixed: [list or "None"]

**Acceptance Criteria Status**:
- [x] Criterion 1
- [x] Criterion 2
- [x] Criterion 3

**Commit**: [git commit SHA]

**Time Spent**: X hours (vs Y estimated)

**Key Learnings** ⭐:
[Document significant insights - see "Ask Human Co-Developer" below]

**Notes**: [Any deviations from plan, technical debt identified]
```

**Ask Human Co-Developer to Document Learnings** (when applicable):

If this story involved:
- Novel or complex challenges
- Discoveries that could help future stories
- Better approaches found mid-implementation
- Performance or architecture insights
- Technology-specific gotchas

Then ask:
```markdown
📚 **Lessons Learned - Story US-XXX**

During implementation, I discovered these insights:

**Key Findings**:
1. [Insight 1]
2. [Insight 2]

**Could Help Future Stories**:
- US-YYY: [How this applies]
- General pattern for: [context]

**Should we document this in**:
- [ ] design.md (architecture pattern)?
- [ ] README (troubleshooting)?
- [ ] Team knowledge base?

Please add any additional insights from reviewing this story.
```

**Update Workplan**:
- Mark story acceptance criteria checkboxes as complete in workplan.md
- Update sprint progress section (stories completed count, remaining effort)
- Note any scope changes or discoveries
- Add completion timestamp and metrics to story section

**Commit and Push**:
```bash
git add .
git commit -m "feat(US-XXX): [story title]

- Implemented [feature]
- Added tests with X% coverage
- All acceptance criteria met

Closes #XXX"

git push origin feature/US-XXX
```

---

### Phase 3: Code Coverage Management

#### 3.1 Measure Coverage

**Run Coverage Report**:
```bash
# Jest (React Native)
npm test -- --coverage --watchAll=false

# Generate HTML report
npm test -- --coverage --coverageReporters=html

# Open report
open coverage/index.html
```

**Analyze Coverage**:
- **Statements**: ≥70%
- **Branches**: ≥70%
- **Functions**: ≥70%
- **Lines**: ≥70%

#### 3.2 Identify Coverage Gaps

**Find Untested Code**:
```bash
# Show uncovered lines
npm test -- --coverage --coverageReporters=text

# Check specific file
npm test -- src/components/MinimizeButton.tsx --coverage
```

**Common Coverage Gaps**:
- Error handling branches
- Edge cases (null, undefined, empty)
- Async operation timeouts
- Platform-specific code
- Native module bridges

#### 3.3 Write Missing Tests

**Example: Increase Branch Coverage**
```typescript
// Original code
export const formatDate = (date?: Date): string => {
  if (!date) return 'N/A'; // Branch 1
  return date.toISOString(); // Branch 2
};

// Add missing test for Branch 1
it('should return N/A when date is undefined', () => {
  expect(formatDate(undefined)).toBe('N/A');
});

it('should return N/A when date is null', () => {
  expect(formatDate(null as any)).toBe('N/A');
});
```

**Example: Cover Error Paths**
```typescript
// Original code
export const loadWebView = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Load failed:', error);
    return false;
  }
};

// Add error path test
it('should return false when network fails', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
  const result = await loadWebView('https://example.com');
  expect(result).toBe(false);
});
```

#### 3.4 Coverage Strategy by Component Type

**UI Components** (70-80% target):
- Render tests (snapshot or element presence)
- User interaction tests (onPress, onChange)
- Conditional rendering tests
- Accessibility tests

**Business Logic** (80-90% target):
- All input combinations
- All branches (if/else, switch)
- Error cases
- Boundary conditions

**Integration Points** (70-80% target):
- Happy path scenarios
- Error scenarios
- Timeout scenarios
- State transitions

**Utilities** (90-100% target):
- Pure functions should be 100%
- All edge cases
- All error cases

---

### Phase 4: Sprint Progress Tracking

#### 4.1 Daily Status Update

**Each Day, Document**:
```markdown
## Daily Status: [Date]

### Yesterday:
- ✅ Completed US-XXX: [Title]
- 🚧 In Progress US-YYY: [Title] (60% done)

### Today:
- 🎯 Complete US-YYY: [Title]
- 🎯 Start US-ZZZ: [Title]

### Blockers:
- [None / Description with ask for human]

### Metrics:
- Stories completed: X/Y for sprint
- Test coverage: X%
- Tests passing: X/Y
```

#### 4.2 Sprint Burndown

Track progress against sprint goal:
```markdown
## Sprint N Progress

**Sprint Goal**: [Goal from workplan]

**Capacity**: 10 days
**Committed**: 9.5 days
**Completed**: X days (Y%)
**Remaining**: Z days

### Stories Status:
- ✅ US-101: Project setup (0.5d) - DONE
- ✅ US-102: Android config (0.5d) - DONE
- 🚧 US-103: Permissions (0.25d) - IN PROGRESS
- ⏳ US-104: Constants (0.25d) - TODO
- ⏳ US-105: WebView (1d) - TODO

**Sprint Health**: 🟢 On Track / 🟡 At Risk / 🔴 Behind
```

#### 4.3 Risk Management

**Identify Risks Early**:
- Story taking >150% of estimate
- Test coverage below 70%
- Acceptance criteria ambiguous
- Technical blocker discovered
- Dependency not ready

**Escalate to Human Co-Developer**:
```markdown
⚠️ **Risk Identified**: Story US-XXX

**Issue**: [Description]
**Impact**: [Effect on sprint goal]
**Options**:
1. [Option A with pros/cons]
2. [Option B with pros/cons]

**Recommendation**: [Your suggested path]

**Need Decision By**: [Date/time]
```

---

### Phase 5: Sprint Completion

#### 5.1 Sprint Review Preparation

**Compile Sprint Deliverables**:
```markdown
## Sprint N Review: [Theme]

**Sprint Goal**: [Goal] - ✅ ACHIEVED / ⚠️ PARTIALLY / ❌ NOT MET

### Completed Stories (X/Y):
- ✅ US-101: Project setup - Demo: [build runs]
- ✅ US-102: Android config - Demo: [APK installs]
[...]

### Demo Script:
1. Show [feature A]
2. Demonstrate [workflow B]
3. Display [metrics/tests]

### Metrics:
- Code coverage: X% (target: ≥70%)
- Tests: X passing, Y total
- Bugs found: X (all fixed)
- APK size: X MB (target: <30MB)

### Incomplete/Deferred:
- [Story if any, with reason]

### Technical Debt:
- [Items to track]
```

**Ask Human Co-Developer**:
- "Sprint N complete. Ready for demo on [date]?"
- "Should we demo [specific feature] or [alternative]?"

#### 5.2 Sprint Retrospective

**Reflect on Sprint**:
```markdown
## Sprint N Retrospective

### What Went Well ✅:
- [Positive items]
- Test coverage achieved: X%
- All stories met acceptance criteria

### What Could Improve 🔄:
- [Improvement areas]
- Story estimates were off by X%
- Needed clarification on Y

### Action Items 🎯:
- [ ] [Improvement action]
- [ ] [Process change]

### Learnings 📚:
- [Technical or process learnings]
```

#### 5.3 Prepare Next Sprint

**Review Workplan**:
- Mark completed stories
- Update estimates based on actuals
- Identify next sprint stories
- Note dependencies

**Environment Check**:
- Update dependencies if needed
- Clean up test data
- Verify CI/CD pipeline

---

### Phase 6: Continuous Quality

#### 6.1 Test Maintenance

**Keep Tests Healthy**:
- Fix flaky tests immediately
- Update tests when requirements change
- Refactor duplicated test code
- Keep test data realistic

**Test Pyramid Balance**:
- 70% Unit tests (fast, isolated)
- 20% Integration tests (component interaction)
- 10% E2E tests (full user flows)

#### 6.2 Code Quality Monitoring

**Run Quality Checks**:
```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Test coverage
npm test -- --coverage --watchAll=false

# Bundle size
npm run analyze-bundle
```

**Quality Metrics Dashboard**:
```markdown
## Quality Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Test Coverage | X% | ≥70% | 🟢 |
| Tests Passing | Y/Y | 100% | 🟢 |
| ESLint Errors | 0 | 0 | 🟢 |
| TypeScript Errors | 0 | 0 | 🟢 |
| APK Size | X MB | <30MB | 🟢 |
| Build Time | X sec | <60sec | 🟢 |
```

#### 6.3 Documentation Updates

**Keep Documentation Current**:
- Update README with new features
- Document breaking changes
- Add troubleshooting entries
- Update architecture diagrams if structure changes

---

## Testing Patterns & Examples

### Unit Testing Patterns

#### React Component Testing
```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { WebViewContainer } from '../WebViewContainer';

describe('WebViewContainer', () => {
  it('should render webview with correct URL', () => {
    const { getByTestId } = render(<WebViewContainer />);
    const webview = getByTestId('webview');
    expect(webview.props.source.uri).toBe('https://agent.qa.comosense.com/public/standalone');
  });

  it('should show loading indicator while loading', () => {
    const { getByTestId, queryByTestId } = render(<WebViewContainer />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
    
    // Simulate load end
    fireEvent(getByTestId('webview'), 'onLoadEnd');
    
    expect(queryByTestId('loading-indicator')).toBeNull();
  });

  it('should handle permission requests', async () => {
    const { getByTestId } = render(<WebViewContainer />);
    const webview = getByTestId('webview');
    
    const mockRequest = {
      nativeEvent: {
        resources: ['camera'],
      },
    };
    
    fireEvent(webview, 'onPermissionRequest', mockRequest);
    
    await waitFor(() => {
      // Verify permission dialog shown or granted
    });
  });
});
```

#### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useNetworkStatus } from '../useNetworkStatus';

describe('useNetworkStatus', () => {
  it('should return online status', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it('should update when network changes', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus());
    
    act(() => {
      // Simulate network disconnection
      window.dispatchEvent(new Event('offline'));
    });
    
    await waitForNextUpdate();
    expect(result.current.isOnline).toBe(false);
  });
});
```

### Integration Testing Patterns

#### Multi-Component Integration
```typescript
describe('App Integration Tests', () => {
  it('should handle full minimize flow', async () => {
    const { getByLabelText, getByTestId } = render(<App />);
    
    // Initial state
    expect(getByTestId('webview-container')).toBeTruthy();
    
    // Tap minimize
    const minimizeBtn = getByLabelText('Minimize app');
    fireEvent.press(minimizeBtn);
    
    // Verify app moves to background
    await waitFor(() => {
      expect(BackHandler.exitApp).toHaveBeenCalled();
    });
  });

  it('should preserve webview state during lifecycle', async () => {
    const { getByTestId } = render(<App />);
    const webview = getByTestId('webview-container');
    
    // Load page and scroll
    fireEvent(webview, 'onLoadEnd');
    fireEvent.scroll(webview, { nativeEvent: { contentOffset: { y: 100 } } });
    
    // Simulate app pause
    act(() => {
      AppState.currentState = 'background';
    });
    
    // Simulate app resume
    act(() => {
      AppState.currentState = 'active';
    });
    
    // Verify scroll position preserved
    expect(webview.props.scrollY).toBe(100);
  });
});
```

### E2E Testing Patterns (Optional)

#### Detox E2E Tests
```typescript
describe('Loyalty Agent E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should launch and load web app', async () => {
    await expect(element(by.text('Loyalty Agent'))).toBeVisible();
    await waitFor(element(by.id('webview-container')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should minimize and restore app', async () => {
    await element(by.label('Minimize app')).tap();
    await device.sendToHome();
    await device.launchApp({ newInstance: false });
    await expect(element(by.id('webview-container'))).toBeVisible();
  });
});
```

---

## Common Scenarios & Solutions

### Scenario 1: Story Blocked by External Dependency

**Problem**: Backend API not ready for integration test

**Solution**:
```typescript
// Mock the dependency
jest.mock('../services/api', () => ({
  fetchTransactions: jest.fn().mockResolvedValue([
    { id: '1', amount: 100 },
    { id: '2', amount: 200 },
  ]),
}));

// Test against mock
it('should display transactions', async () => {
  const { findByText } = render(<TransactionList />);
  expect(await findByText('$100')).toBeTruthy();
  expect(await findByText('$200')).toBeTruthy();
});
```

**Ask Human Co-Developer**:
- "Backend API not ready. Mock data structure: [show mock]. Is this accurate?"

### Scenario 2: Low Test Coverage on Complex Component

**Problem**: Coverage at 55%, target is 70%

**Solution**:
1. Run coverage report to find untested lines
2. Identify missing test scenarios:
   - Error states
   - Edge cases
   - Conditional branches
3. Add targeted tests:

```typescript
// Add error state test
it('should handle load error gracefully', () => {
  const { getByText } = render(<WebViewContainer />);
  fireEvent(getByTestId('webview'), 'onError', {
    nativeEvent: { description: 'SSL Error' }
  });
  expect(getByText(/error/i)).toBeTruthy();
});

// Add edge case test
it('should handle empty URL', () => {
  const { getByTestId } = render(<WebViewContainer url="" />);
  expect(getByTestId('error-screen')).toBeTruthy();
});
```

### Scenario 3: Acceptance Criteria Ambiguous

**Problem**: Story says "handle errors" but doesn't specify which errors

**Ask Human Co-Developer**:
```markdown
❓ **Clarification Needed**: US-302 Error Handling

**Story Says**: "Handle WebView errors gracefully"

**Unclear**:
1. Which error types? (Network, SSL, HTTP 500, timeout, CORS?)
2. User experience for each? (Retry button, error message, fallback?)
3. Should errors be logged to backend?

**My Assumption**:
- Handle: Network, SSL, HTTP 500, timeout
- UX: Error screen with retry button
- Logging: Console only (no backend)

**Please Confirm or Correct**: [...]
```

### Scenario 4: Performance Issue Discovered

**Problem**: WebView load time > 5 seconds

**Solution**:
1. Profile the issue:
```bash
# React Native performance monitor
adb shell setprop debug.firebase.perf true

# Chrome DevTools
chrome://inspect
```

2. Implement optimization:
```typescript
// Preload WebView
const preloadWebView = () => {
  const webview = new WebView();
  webview.loadUrl('https://agent.qa.comosense.com/public/standalone');
};

// Cache resources
const webViewConfig = {
  cacheEnabled: true,
  cacheMode: 'LOAD_CACHE_ELSE_NETWORK',
};
```

3. Verify improvement with test:
```typescript
it('should load within 3 seconds', async () => {
  const startTime = Date.now();
  const { getByTestId } = render(<WebViewContainer />);
  
  await waitFor(() => {
    expect(getByTestId('webview-loaded')).toBeTruthy();
  }, { timeout: 3000 });
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
});
```

---

## Success Criteria & Exit Conditions

### Sprint Success Criteria
- [ ] All committed stories completed (100%)
- [ ] All acceptance criteria met
- [ ] Code coverage ≥70%
- [ ] All tests passing (100%)
- [ ] No critical bugs
- [ ] Sprint goal achieved
- [ ] Demo ready

### Project Success Criteria
- [ ] All MVP features implemented (Phase 1)
- [ ] All web app features functional
- [ ] Error handling complete
- [ ] Performance targets met
- [ ] Documentation complete
- [ ] Ready for production deployment

---

## Anti-Patterns to Avoid

❌ **Don't Skip Tests**: "I'll add tests later" → Technical debt accumulates  
✅ **Do Write Tests First**: TDD ensures coverage and design

❌ **Don't Ignore Coverage Gaps**: "67% is close enough to 70%" → Quality bar slips  
✅ **Do Hit Coverage Target**: Add tests until ≥70%

❌ **Don't Assume Requirements**: "I think they want..." → Rework later  
✅ **Do Ask When Unclear**: Clarify with human co-developer

❌ **Don't Batch Story Completion**: "I'll mark them all done at end" → Lost visibility  
✅ **Do Complete Stories Incrementally**: One at a time with validation

❌ **Don't Commit Broken Code**: "It mostly works" → Breaks other developers  
✅ **Do Keep Main Branch Green**: All tests passing before commit

❌ **Don't Overengineer**: "Let me add 10 more features" → Scope creep  
✅ **Do Follow Workplan**: Stick to story scope

---

## Quick Reference Commands

### Development
```bash
# Start development
npm start

# Run on Android
npx react-native run-android

# Build debug APK
cd android && ./gradlew assembleDebug

# Install APK
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- MinimizeButton.test.tsx

# Run in watch mode
npm test -- --watch

# Update snapshots
npm test -- -u
```

### Quality Checks
```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Format
npm run format

# All checks
npm run validate
```

### Debugging
```bash
# View logs
adb logcat | grep -E "Como|Loyalty|ReactNative"

# Chrome DevTools
chrome://inspect

# React Native Debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

---

## Workflow Summary

```
1. Load workplan + design
2. Identify current sprint and progress
3. For each story:
   a. Analyze requirements
   b. Write failing tests
   c. Implement feature
   d. Make tests pass
   e. Refactor
   f. Integration test
   g. Manual test
   h. Check coverage ≥70%
   i. Self code review
   j. Commit
   k. Mark story done
   l. Document lessons learned if any key insights were discovered that will help future stories
4. Track sprint progress
5. Sprint review & retrospective
6. Repeat for next sprint
```

**Always remember**: When in doubt, ask your human co-developer! 🤝

---
