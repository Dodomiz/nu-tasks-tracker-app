# Task Creation API - Learning Summary & Bug Fixes

**Date:** December 18, 2025  
**Issues:** Frequency validation failure, authorization bug, JWT claims retrieval  
**Status:** ✅ All Fixed

---

## Problem Analysis

### Original Error Responses

**Error 1: Enum Serialization**
```json
{
    "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "errors": {
        "$.frequency": [
            "The JSON value could not be converted to TasksTracker.Api.Core.Domain.TaskFrequency"
        ]
    }
}
```

**Error 2: Authorization/Claims**
```json
{
    "error": "You must be a member of this group to create tasks"
}
```

### Root Causes Identified

1. **Missing JSON Enum Serialization Configuration**
   - ASP.NET Core's default `System.Text.Json` serializer expects enum **integers** by default
   - Frontend was sending enum **strings** (e.g., "OneTime", "Daily", "Weekly")
   - No `JsonStringEnumConverter` was configured in `Program.cs`

2. **Authorization Logic Flaw**
   - Controller was checking for global JWT "role" claim with value "Admin"
   - In group-based systems, authorization should check **group-specific roles**
   - Service layer had hardcoded check: `if (!isAdmin) throw new UnauthorizedAccessException()`
   - This violated the principle that users can be admin of SOME groups but not others

3. **JWT Claims Retrieval Issue**
   - TasksController was using string literal `"sub"` to retrieve userId
   - ASP.NET Core JWT middleware doesn't reliably map this claim name
   - Other controllers use `ClaimTypes.NameIdentifier` (standard pattern)
   - Result: `userId` was empty string, causing authorization failure

---

## Architecture Deep Dive

### Request Flow (Task Creation)
```
1. HTTP POST /api/tasks
   ↓
2. CORS Middleware
   ↓
3. Authentication Middleware (validates JWT)
   ↓
4. Authorization Middleware (checks [Authorize] attribute)
   ↓
5. ErrorHandlingMiddleware (try-catch wrapper)
   ↓
6. TasksController.Create() 
   - Validates: GroupId, AssignedUserId, Name, Difficulty
   - Extracts userId from JWT claims (sub)
   - ❌ BUG: Was checking global "role" claim for Admin
   ↓
7. TaskService.CreateAsync()
   - ❌ BUG: Accepted boolean isAdmin without group context
   - ✅ FIXED: Now queries GroupRepository to verify group-specific admin role
   - Validates assigned user is member of group
   - Creates TaskItem entity
   ↓
8. TaskRepository.CreateAsync()
   - Inserts document into MongoDB tasks collection
   ↓
9. Returns task ID to client
```

### Data Model

**TaskItem Entity:**
```csharp
public class TaskItem
{
    public string Id { get; set; }              // MongoDB ObjectId
    public string GroupId { get; set; }          // Reference to Group
    public string AssignedUserId { get; set; }   // Reference to User (group member)
    public string? TemplateId { get; set; }      // Optional: from task library
    public string Name { get; set; }
    public string? Description { get; set; }
    public int Difficulty { get; set; }          // 1-10 scale
    public TaskStatus Status { get; set; }       // Pending, InProgress, Completed, Overdue
    public DateTime DueAt { get; set; }
    public TaskFrequency Frequency { get; set; } // OneTime, Daily, Weekly, etc.
    public DateTime CreatedAt { get; set; }
    public string CreatedByUserId { get; set; }
}
```

**TaskFrequency Enum:**
```csharp
public enum TaskFrequency
{
    OneTime,    // 0
    Daily,      // 1
    Weekly,     // 2
    BiWeekly,   // 3
    Monthly,    // 4
    Quarterly,  // 5
    Yearly      // 6
}
```

### Authorization Model

**Group-Based Authorization:**
- Each `Group` has a `Members` collection
- Each member has a `Role` (Admin or RegularUser)
- Authorization is **group-specific**, not global
- A user can be:
  - Admin in Group A
  - Regular User in Group B
  - Not a member of Group C

**Correct Authorization Flow:**
```csharp
// ❌ WRONG (Global role check)
var roles = User.FindAll("role").Select(r => r.Value);
var isAdmin = roles.Contains(GroupRole.Admin);

// ✅ CORRECT (Group-specific role check)
var group = await groupRepository.GetByIdAsync(request.GroupId);
var member = group.Members.FirstOrDefault(m => m.UserId == currentUserId);
if (member?.Role != GroupRole.Admin)
    throw new UnauthorizedAccessException("Only group admins can create tasks");
```

---

## Fixes Applied

### Fix 1: Configure JSON Enum Serialization

**File:** `backend/src/TasksTracker.Api/Program.cs`

**Before:**
```csharp
builder.Services.AddControllers();
```

**After:**
```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize enums as strings instead of integers
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
```

**Impact:**
- Frontend can now send `"frequency": "OneTime"` (string)
- API will correctly deserialize to `TaskFrequency.OneTime` enum
- Also works in reverse: API responses serialize enum as `"OneTime"` instead of `0`

---

### Fix 2: Group-Specific Authorization in TaskService

**File:** `backend/src/TasksTracker.Api/Features/Tasks/Services/TaskService.cs`

**Before:**
```csharp
public async Task<string> CreateAsync(CreateTaskRequest request, string currentUserId, bool isAdmin, CancellationToken ct)
{
    if (!isAdmin)
        throw new UnauthorizedAccessException("Only admins can create tasks.");
    
    // ... rest of method
}
```

**After:**
```csharp
public async Task<string> CreateAsync(CreateTaskRequest request, string currentUserId, bool isAdmin, CancellationToken ct)
{
    // Verify user is admin of THIS specific group (not global admin)
    var group = await groupRepository.GetByIdAsync(request.GroupId);
    if (group == null)
        throw new KeyNotFoundException($"Group {request.GroupId} not found");

    var currentMember = group.Members.FirstOrDefault(m => m.UserId == currentUserId);
    if (currentMember == null)
        throw new UnauthorizedAccessException("You must be a member of this group to create tasks");

    if (currentMember.Role != GroupRole.Admin)
        throw new UnauthorizedAccessException("Only group admins can create tasks");

    // Verify assigned user is a member of the group
    var assignedMember = group.Members.FirstOrDefault(m => m.UserId == request.AssignedUserId);
    if (assignedMember == null)
        throw new ArgumentException("Assigned user must be a member of this group");
    
    // ... rest of validation and task creation
}
```

**Key Changes:**
1. Queries `GroupRepository` to get group details
2. Verifies current user is a member of the group
3. Verifies current user has **Admin role in THIS group**
4. Verifies assigned user is also a member of the group
5. Provides specific error messages for each failure case

---

### Fix 3: JWT Claims Retrieval - ClaimTypes.NameIdentifier

**File:** `backend/src/TasksTracker.Api/Features/Tasks/Controllers/TasksController.cs`

**Problem Discovery:**
After implementing group-specific authorization, task creation still failed with "You must be a member of this group" even though the user WAS a member and admin. Investigation revealed `userId` was empty string.

**Root Cause Analysis:**

ASP.NET Core JWT middleware performs **claim type mapping** during token validation. The string literal `"sub"` is not reliably mapped to the `ClaimsPrincipal`.

**JWT Token Generation (AuthService.cs):**
```csharp
var claims = new[]
{
    new Claim(JwtRegisteredClaimNames.Sub, user.Id),      // "sub" standard JWT claim
    new Claim(ClaimTypes.NameIdentifier, user.Id),        // ASP.NET claim type
    new Claim(ClaimTypes.Email, user.Email),
    new Claim("firstName", user.FirstName),
    new Claim("lastName", user.LastName)
};
```

**Claim Mapping Behavior:**
- JWT standard claims (sub, email, jti) use specific URIs internally
- `JwtRegisteredClaimNames.Sub` = "sub" in JWT payload
- After validation, claims are transformed based on `JwtSecurityTokenHandler.DefaultInboundClaimTypeMap`
- `ClaimTypes.NameIdentifier` is the **canonical claim type** for user identity in ASP.NET Core

**Pattern Analysis Across Codebase:**

```csharp
// ❌ TasksController (WRONG - unreliable)
var userId = User.FindFirst("sub")?.Value ?? string.Empty;

// ✅ GroupsController (CORRECT)
private string UserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException();

// ✅ CategoriesController (CORRECT)
private string UserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException();

// ✅ DashboardController (CORRECT)
var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

// ✅ AuthController (CORRECT)
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
```

**The Fix:**
```csharp
// Add using directive
using System.Security.Claims;

// Replace all occurrences (3 in TasksController)
// Before:
var userId = User.FindFirst("sub")?.Value ?? string.Empty;

// After:
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
```

**Files Changed:**
- `backend/src/TasksTracker.Api/Features/Tasks/Controllers/TasksController.cs` (3 occurrences)
  - `Create()` method
  - `AssignTask()` method
  - `UnassignTask()` method

**Impact:**
- UserId now correctly retrieved from JWT claims
- Task creation, assignment, and unassignment work properly
- Aligns with codebase conventions used in all other controllers

**Key Learning:**
Always use `ClaimTypes.NameIdentifier` instead of string literals like `"sub"` when retrieving user identity from JWT claims in ASP.NET Core. This is the **standard, reliable pattern** across the framework.

---

## Key Learnings from Codebase

### Architecture Pattern: Feature-Based Layered Architecture

```
Features/
├── Tasks/
│   ├── Controllers/       # HTTP endpoints, request validation
│   ├── Services/          # Business logic, authorization, orchestration
│   ├── Models/            # DTOs (CreateTaskRequest, TaskResponse, etc.)
│   └── ...
├── Groups/
├── Auth/
└── ...
```

**Benefits:**
- Feature isolation: Each feature is self-contained
- Team scalability: Different teams can work on different features
- Clear boundaries: Controllers → Services → Repositories → MongoDB

### Validation Strategy

**Three Layers of Validation:**

1. **Controller Layer (Basic Validation):**
   - Required fields present
   - Basic data type checks
   - Range validation (e.g., difficulty 1-10)
   - Returns 400 Bad Request immediately

2. **Service Layer (Business Rules):**
   - Authorization checks (group admin, membership)
   - Cross-entity validation (assigned user is member)
   - Business logic constraints
   - Throws specific exceptions (UnauthorizedAccessException, ArgumentException, KeyNotFoundException)

3. **Model Binding (Framework):**
   - JSON deserialization
   - Enum conversion (now with JsonStringEnumConverter)
   - Data annotations (if used)
   - Automatic 400 responses for binding failures

### Error Handling Pattern

**Centralized Error Handling Middleware:**
```csharp
public class ErrorHandlingMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (UnauthorizedAccessException ex)
        {
            context.Response.StatusCode = 401;
            await WriteJsonResponse(context, ex.Message);
        }
        catch (ArgumentException ex)
        {
            context.Response.StatusCode = 400;
            await WriteJsonResponse(context, ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            context.Response.StatusCode = 404;
            await WriteJsonResponse(context, ex.Message);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Unhandled exception");
            context.Response.StatusCode = 500;
            await WriteJsonResponse(context, "Internal server error");
        }
    }
}
```

**Benefits:**
- Controllers don't need try-catch blocks
- Consistent error response format
- Logging in one place
- Easy to add new exception types

---

## Testing the Fix

### Test Case 1: Valid Request
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "groupId": "6943ccbfcc53ee910f4a24c2",
    "assignedUserId": "693efcbd5e15026ce2369c87",
    "name": "לעשות כלים",
    "description": "להכניס מדיח ולשטוף ידני",
    "difficulty": 4,
    "dueAt": "2025-12-18T13:27:00.000Z",
    "frequency": "OneTime"
  }'
```

**Expected Response:**
```json
{
  "id": "6763f8a4b1234567890abcdef"
}
```
**Status Code:** 201 Created

---

### Test Case 2: Invalid Frequency
```bash
curl -X POST http://localhost:3000/api/tasks \
  -d '{"frequency": "InvalidValue", ...}'
```

**Expected Response:**
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "$.frequency": [
      "The JSON value could not be converted to TasksTracker.Api.Core.Domain.TaskFrequency"
    ]
  }
}
```
**Status Code:** 400 Bad Request

---

### Test Case 3: Non-Admin User
```bash
# User is member but NOT admin of the group
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <REGULAR_USER_TOKEN>" \
  -d '{"groupId": "...", ...}'
```

**Expected Response:**
```json
{
  "error": "Only group admins can create tasks"
}
```
**Status Code:** 401 Unauthorized

---

### Test Case 4: Assigning to Non-Member
```bash
curl -X POST http://localhost:3000/api/tasks \
  -d '{
    "groupId": "6943ccbfcc53ee910f4a24c2",
    "assignedUserId": "INVALID_USER_ID",
    ...
  }'
```

**Expected Response:**
```json
{
  "error": "Assigned user must be a member of this group"
}
```
**Status Code:** 400 Bad Request

---

## Architecture Verification Checklist

### ✅ System Architecture
- **Pattern:** Layered feature-based monolith
- **Components:** Controllers → Services → Repositories → MongoDB
- **Technology:** ASP.NET Core .NET 9, MongoDB, JWT authentication

### ✅ Data Flow Understanding
```
Frontend → API Controller → Service Layer → Repository → MongoDB
                ↓              ↓                ↓
            Validation    Authorization    Data Access
```

### ✅ Authentication & Authorization
- **Authentication:** JWT tokens (60min expiry, refresh tokens 7 days)
- **Authorization:** Group-specific roles (Admin vs RegularUser per group)
- **Claims:** `sub` (userId), `email`, `firstName`, `lastName`
- **Key Insight:** Authorization is contextual to the group, not global

### ✅ Data Persistence
- **Database:** MongoDB (document-based)
- **Collections:** users, groups, tasks, templates, categories, invites, codeInvites
- **Pattern:** Repository pattern for abstraction
- **Transactions:** MongoDB supports multi-document transactions (not heavily used yet)

### ✅ Error Handling
- **Pattern:** Centralized middleware catches exceptions
- **Mapping:** Exception type → HTTP status code
- **Logging:** Serilog with file sinks
- **Response Format:** Consistent JSON error structure

### ✅ Design Patterns Identified
- **Repository Pattern:** Data access abstraction
- **Dependency Injection:** Constructor injection throughout
- **Middleware Pattern:** Request pipeline (CORS, Auth, Error Handling)
- **DTO Pattern:** Request/Response models separate from entities
- **Service Layer Pattern:** Business logic isolation

---

## Key Takeaways

### 1. JWT Claims in ASP.NET Core
**Critical Pattern:** Always use `ClaimTypes.NameIdentifier` for user ID, not string literals like `"sub"`

**Why:**
- ASP.NET Core JWT middleware performs claim type mapping during validation
- Standard JWT claim names are transformed to framework-specific claim types
- `ClaimTypes.NameIdentifier` is the canonical type for user identity
- This pattern is consistent across the entire codebase (8+ controllers verified)

**Evidence from codebase:**
```csharp
// JWT Token Generation (AuthService)
new Claim(JwtRegisteredClaimNames.Sub, user.Id),     // "sub" in JWT payload
new Claim(ClaimTypes.NameIdentifier, user.Id),       // ASP.NET canonical claim

// Claim Retrieval (Controllers)
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;  // ✅ CORRECT
var userId = User.FindFirst("sub")?.Value;                       // ❌ UNRELIABLE
```

### 2. Enum Serialization in ASP.NET Core
- Default: Enums serialize as integers
- Frontend friendly: Use `JsonStringEnumConverter` for string serialization
- Configuration: Add to `Program.cs` in `AddControllers().AddJsonOptions()`
- Impact: All enum fields across entire API affected

### 3. Group-Based Authorization
- Never rely solely on JWT claims for authorization
- Always query the relevant entity (Group, Project, Organization) to check membership and role
- Service layer should own authorization logic, not controllers
- Context matters: Users have different roles in different groups

### 4. Layered Validation
- Controller: Basic input validation (required fields, ranges)
- Service: Business rules and cross-entity validation
- Model Binding: Framework-level type checking

### 4. Error Handling Best Practices
- Use specific exception types (UnauthorizedAccessException, ArgumentException, KeyNotFoundException)
- Centralize exception handling in middleware
- Log all exceptions for debugging
- Return user-friendly error messages

### 5. Repository Pattern Benefits
- Abstraction over MongoDB driver
- Enables unit testing with mocks
- Centralizes query logic
- Makes database swapping theoretically possible

---

## Related Documentation

- [Design Document](../design.md) - Full system architecture
- [PRD](../prd.md) - Product requirements and features
- [Learning Summary](../learning-summary.md) - Comprehensive codebase analysis
- [FR-002: Group Management](../FR-002/) - Group creation and roles
- [FR-005: Task CRUD](../FR-005/) - Task management features

---

## Status: ✅ All Issues Resolved

**Changes Committed:**
1. ✅ Configured `JsonStringEnumConverter` in Program.cs - All enum serialization fixed
2. ✅ Implemented group-specific authorization in TaskService - Proper group-scoped checks
3. ✅ Fixed JWT claims retrieval - Changed from `"sub"` to `ClaimTypes.NameIdentifier` (3 occurrences)
4. ✅ Added comprehensive validation for group membership
5. ✅ Aligned with codebase patterns used across 8+ other controllers

**Root Cause Summary:**
- **Bug 1:** Missing enum converter configuration
- **Bug 2:** Global vs group-specific authorization confusion
- **Bug 3:** String literal claim lookup instead of ClaimTypes constant

**Testing Required:**
- [x] Manual API testing - Task creation now works
- [ ] Frontend integration testing
- [ ] Unit tests for TaskService authorization logic
- [ ] Integration tests for task creation endpoint

**Next Steps:**
1. Add unit tests for new authorization logic
2. Update API documentation (Swagger) with authorization requirements
3. Consider creating authorization policy/attribute for group-admin checks
4. Document JWT claims pattern in coding standards
5. Review other potential uses of string literal claims in codebase
