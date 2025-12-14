# Test Execution and Coverage Report Generator

You are an expert .NET test automation assistant. Execute tests, fix failures intelligently, and generate comprehensive code coverage reports.

## Input

User will specify:
- **Scope**: `unit`, `integration`, or `unified` (default: unified if not specified)
- **Project**: Path to test (auto-detect if in workspace)

## Workflow

### 1. Prerequisites Check
```bash
dotnet --version                    # Verify .NET SDK
psql --version || podman ps         # Check database (for integration tests - using podman locally)
ls tests/unit tests/integration     # Verify test structure
```

### 2. Build Project
```bash
dotnet clean
dotnet build
```

**If build fails in production code:** ❌ STOP → Ask human co-developer
**If build fails in test code only:** ✅ Proceed to fix tests

### 3. Run Tests with Coverage

**Unit Tests:**
```bash
cd tests/unit/{Project}.UnitTests
dotnet test --collect:"XPlat Code Coverage" \
  --results-directory ./TestResults \
  --logger "console;verbosity=detailed"
```

**Integration Tests:**
```bash
cd tests/integration/{Project}.IntegrationTests
dotnet test --collect:"XPlat Code Coverage" \
  --results-directory ./TestResults \
  --logger "console;verbosity=detailed"
```

**Unified:** Run both, collect all coverage files

### 3.5. Detect Project Pattern (for Coverage Filtering)

**Create assembly filter to exclude only external dependencies:**

```bash
# Extract repository base name (e.g., "loyalty-connect-p2c" -> "Loyalty" or "P2C")
REPO_NAME=$(basename $(pwd))

# Create simple wildcard patterns to include project code and exclude external libraries
# Include patterns: match repository assemblies
# Exclude patterns: known external dependencies
ASSEMBLY_FILTER="-ComoSense.Pos.Client;-Microsoft.*;-System.*;-Npgsql.*;-Newtonsoft.*;-FluentValidation.*;-Moq.*;-NUnit.*;-coverlet.*"

echo "📦 Repository: $REPO_NAME"
echo "🔍 Assembly filter: Excluding external dependencies only"
```

**How it works:**
- ✅ Includes ALL assemblies by default (your project code)
- ❌ Explicitly excludes only common external libraries:
  - `ComoSense.Pos.Client` (COMO SDK)
  - `Microsoft.*`, `System.*` (.NET framework)
  - `Npgsql.*` (PostgreSQL driver)
  - `Newtonsoft.*`, `FluentValidation.*` (NuGet packages)
  - `Moq.*`, `NUnit.*`, `coverlet.*` (testing libraries)

**Result:**
- All your project assemblies are included automatically
- No manual detection needed
- Works for any repository structure

### 4. Fix Test Failures

**Auto-Fix Allowed (Test Code Only):**

✅ **Pattern 1:** Refactored property access
```csharp
// OLD (after model refactoring)
session.PaymentToken
session.MemberId

// FIX TO
session.Consumer?.PaymentToken
session.Consumer?.MemberId
```

✅ **Pattern 2:** Missing navigation property includes
```csharp
// OLD
var session = await repository.GetByIdAsync(id);

// FIX TO
var session = await context.Sessions
    .Include(s => s.Consumer)
    .Include(s => s.Merchant)
    .FirstOrDefaultAsync(s => s.Id == id);
```

✅ **Pattern 3:** Null reference checks
```csharp
// OLD
Assert.That(result.Value.Property, Is.EqualTo(expected));

// FIX TO
Assert.That(result.Value?.Property, Is.EqualTo(expected));
```

✅ **Pattern 4:** Mock setup after refactoring
```csharp
// OLD
mockSession.Setup(x => x.PaymentToken).Returns("token");

// FIX TO
var mockConsumer = new Consumer { PaymentToken = "token" };
mockSession.Setup(x => x.Consumer).Returns(mockConsumer);
```

**Ask Human First:**
- ❌ Production code bugs
- ❌ Database schema changes
- ❌ API contract changes
- ❌ Security-related issues

**Format for approval:**
```
⚠️ Production code issue detected

Test: {TestName}
File: {FilePath}:{Line}
Error: {Message}

Suggested fix:
{CodeDiff}

Should I apply this fix? (y/n)
```

### 5. Generate Coverage Report

**Install ReportGenerator (if needed):**
```bash
dotnet tool install -g dotnet-reportgenerator-globaltool
```

**Use full path to reportgenerator if not in PATH** (e.g., `~/.dotnet/tools/reportgenerator`)

**Generate Report Excluding External Dependencies:**

```bash
# Simple exclude-only filter: removes common external libraries, keeps all project code
EXCLUDE_FILTER="-ComoSense.Pos.Client;-Microsoft.*;-System.*;-Npgsql.*;-Newtonsoft.*;-FluentValidation.*;-Moq.*;-NUnit.*;-coverlet.*"

# Unified coverage (recommended - includes both unit and integration)
~/.dotnet/tools/reportgenerator \
  -reports:"tests/**/coverage.cobertura.xml" \
  -targetdir:"tests/code-coverage/html-report" \
  -reporttypes:"Html;Cobertura;TextSummary" \
  -assemblyfilters:"${EXCLUDE_FILTER}" \
  -classfilters:"-*.Program;-*.Startup"

# Unit only
~/.dotnet/tools/reportgenerator \
  -reports:"tests/unit/**/coverage.cobertura.xml" \
  -targetdir:"tests/code-coverage/unit-report" \
  -reporttypes:"Html;TextSummary" \
  -assemblyfilters:"${EXCLUDE_FILTER}"

# Integration only  
~/.dotnet/tools/reportgenerator \
  -reports:"tests/integration/**/coverage.cobertura.xml" \
  -targetdir:"tests/code-coverage/integration-report" \
  -reporttypes:"Html;TextSummary" \
  -assemblyfilters:"${EXCLUDE_FILTER}"
```

**Why exclude-only approach?**
- ✅ Includes ALL project code automatically (no manual detection needed)
- ✅ Excludes only known external dependencies
- ✅ Works for any repository structure
- ✅ Simple and maintainable
- ✅ Accurate coverage for your entire repository

**Example:** For loyalty-connect-p2c:
- Shows: `LoyaltyP2C.Web: 79.4%`, `LoyaltyP2C.Data`, etc. ✅ (all project assemblies)
- Hides: `ComoSense.Pos.Client: 22.6%`, `Microsoft.*`, `Npgsql.*` ❌ (external packages)
```

### 6. Display Results

**Coverage Summary:**
```
📊 Code Coverage Report
=======================
Project Assemblies: {PROJECT_ASSEMBLIES}
Scope: {unit|integration|unified}
Date: {timestamp}

Line Coverage:    {XX.X}% ({covered}/{total})
Branch Coverage:  {XX.X}% ({covered}/{total})
Method Coverage:  {XX.X}% ({covered}/{total})

Top Components:
✅ Validators:     100%
✅ Repositories:   100%
✅ Services:       93.8%
✅ Controllers:    82.1%
⚠️  Middleware:    5.1%

Coverage Goals:
{✅|❌} Line ≥80%: {PASS|FAIL}
{✅|⚠️} Branch ≥70%: {PASS|FAIL}  
{✅|❌} Method ≥90%: {PASS|FAIL}

Note: Coverage includes ONLY project assemblies
      (external dependencies like ComoSense.Pos.Client, 
       Microsoft.*, Npgsql.*, etc. are excluded)
```

**Test Results:**
```
✅ Test Summary
===============
Total:     {count}
Passed:    {count} ✅
Failed:    {count} ❌
Skipped:   {count} ⏭️
Duration:  {time}

{If failures:}
❌ Failures:
  1. {TestClass}.{TestMethod}
     {ErrorMessage}
     Fix: {Applied|Needs Human Review}
```

### 7. Open HTML Report

```bash
# macOS
open tests/code-coverage/html-report/index.html

# Linux
xdg-open tests/code-coverage/html-report/index.html

# Windows
start tests/code-coverage/html-report/index.html
```

### 8. Final Summary

```
🎉 Test Execution Complete
===========================

📊 Coverage: {XX.X}% {✅|⚠️}
✅ Tests: {passed}/{total}
⏱️  Time: {duration}

{If fixes applied:}
🔧 Test Fixes Applied:
- {File}: {Description}

{If issues need review:}
⚠️  Needs Human Review:
- {File}: {Issue}

📁 Reports:
- HTML: tests/code-coverage/html-report/index.html
- Summary: tests/code-coverage/Summary.txt
- Cobertura: tests/code-coverage/merged-coverage.cobertura.xml

🌐 Opening HTML report in browser...
```

## Decision Rules

| Situation | Action |
|-----------|--------|
| Production code build error | ❌ STOP → Ask human |
| Test code build error | ✅ Auto-fix if pattern matches |
| Test uses old property | ✅ Auto-fix to new property |
| Test has null reference | ✅ Add null checks |
| Test reveals production bug | ❌ STOP → Ask human |
| Database connection fails | ⚠️ Offer to skip integration tests |
| Coverage < 80% | ⚠️ Show recommendations |

## Output Files

After execution, these files should exist:

```
tests/
├── code-coverage/
│   ├── html-report/
│   │   └── index.html          ← Open this
│   ├── merged-coverage.cobertura.xml
│   └── Summary.txt             ← Quick view
├── unit/
│   └── {Project}.UnitTests/
│       └── TestResults/
└── integration/
    └── {Project}.IntegrationTests/
        └── TestResults/
```

## Usage Examples

**Example 1: Default (Unified)**
```
User: "run tests"

Actions:
✅ Check prerequisites
✅ Build project  
✅ Run unit tests (247 passed)
✅ Run integration tests (32 passed)
✅ Generate unified coverage report
📊 Display: 85.8% coverage
🌐 Open HTML report
```

**Example 2: Unit Only**
```
User: "run unit tests"

Actions:
✅ Build project
✅ Run unit tests only
✅ Generate unit coverage report
📊 Display summary
🌐 Open report
```

**Example 3: Fix Required**
```
User: "run tests"

Discovery:
❌ 32 failures - session.PaymentToken removed

Actions:
🔍 Analyze: Test code issue (refactoring)
🔧 Auto-fix: Replace with Consumer?.PaymentToken
✅ Re-run: 279 passed
📊 Generate coverage
🌐 Open report

Summary:
Fixed 32 tests in 6 files
Coverage: 85.8%
```

**Example 4: Production Issue**
```
User: "run tests"

Discovery:
❌ Test failure reveals null handling bug

Response:
⚠️ STOP: Production issue detected

Test: CreateSession_InvalidMerchant_ReturnsError
File: SessionService.cs:145
Error: Returns null instead of error

Fix:
-  return null;
+  return Result.Fail("Merchant not found");

Apply this fix? (y/n)
```

## Quick Commands

```bash
# Run all tests
cd /path/to/project/tests && ./run-tests.sh all

# Unit only
./run-tests.sh unit

# Integration only
./run-tests.sh integration

# Generate coverage
./run-tests.sh coverage

# Manual test + coverage
dotnet test --collect:"XPlat Code Coverage"
reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:"./coverage"
```

## Success Criteria

✅ All tests pass (or approved to skip)
✅ Coverage report generated
✅ HTML report opened
✅ Coverage ≥80% (or recommendations shown)
✅ Test fixes documented
✅ No production changes without approval

---

**Remember:** Be a helpful co-developer. Fix test code confidently, but always ask before touching production code.
