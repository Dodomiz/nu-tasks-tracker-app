# FR-028 API Documentation: Admin Approval System

## Overview

The Admin Approval System introduces a new approval workflow for tasks, allowing group administrators to require approval before tasks can be marked as completed.

## API Changes

### Task Model

#### New Fields

**RequiresApproval** (boolean)
- Indicates whether a task requires admin approval before completion
- Default: `false`
- Admin-only: Only group admins can set this field to `true` during task creation
- Once set, members cannot mark the task as `Completed`

**Status** (enum) - New Value

**WaitingForApproval** (TaskStatus)
- New status value added to the existing `TaskStatus` enum
- Available values: `NotStarted`, `InProgress`, `WaitingForApproval`, `Completed`
- Members can set approval-required tasks to this status to signal they need admin review
- Only visible in status dropdown when `RequiresApproval` is `true`

---

## Endpoints

### POST /api/tasks

Creates a new task.

#### Request Body

```json
{
  "groupId": "string",
  "assignedUserId": "string",
  "name": "string",
  "difficulty": 1-10,
  "dueAt": "2024-01-15T00:00:00Z",
  "frequency": "OneTime|Daily|Weekly|Monthly|Yearly",
  "requiresApproval": false  // NEW: Admin-only field
}
```

#### Authorization Rules

- **RequiresApproval = true**: Only group admins can create such tasks
- **RequiresApproval = false or omitted**: Any group member can create the task (existing behavior)

#### Response

```json
{
  "id": "string",
  "groupId": "string",
  "assignedUserId": "string",
  "name": "string",
  "difficulty": 5,
  "status": "NotStarted",
  "dueAt": "2024-01-15T00:00:00Z",
  "frequency": "OneTime",
  "requiresApproval": false,  // NEW field
  "createdBy": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Error Responses

**401 Unauthorized** - Member attempts to create approval-required task
```json
{
  "message": "Only group admins can create tasks"
}
```

---

### PATCH /api/tasks/{taskId}

Updates an existing task.

#### Request Body

```json
{
  "name": "string",
  "difficulty": 1-10,
  "status": "NotStarted|InProgress|WaitingForApproval|Completed",  // NEW status value
  "dueAt": "2024-01-15T00:00:00Z",
  "assignedUserId": "string",
  "requiresApproval": false  // NEW: Can be updated
}
```

#### Authorization Rules for Status Updates

- **Setting status to `WaitingForApproval`**: Any group member (if task has `RequiresApproval = true`)
- **Setting status to `Completed` on approval-required task**: Admin only
- **Setting status to `Completed` on regular task**: Any group member (existing behavior)

#### Response

Same as POST response above.

#### Error Responses

**401 Unauthorized** - Member attempts to complete approval-required task
```json
{
  "message": "Only group admins can complete tasks that require approval"
}
```

---

### GET /api/tasks

Retrieves tasks. No changes to request/response structure.

#### Response Array Item

```json
{
  "id": "string",
  "groupId": "string",
  "assignedUserId": "string",
  "name": "string",
  "difficulty": 5,
  "status": "WaitingForApproval",  // NEW possible value
  "dueAt": "2024-01-15T00:00:00Z",
  "frequency": "OneTime",
  "requiresApproval": true,  // NEW field
  "createdBy": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## History Tracking

All changes to the `RequiresApproval` field are logged in task history:

```json
{
  "taskId": "string",
  "changedBy": "string",
  "changedAt": "2024-01-01T10:30:00Z",
  "fieldName": "RequiresApproval",
  "oldValue": "false",
  "newValue": "true"
}
```

---

## Migration

Existing tasks will automatically have `RequiresApproval` set to `false` to preserve existing behavior.

Run migration script:
```bash
node backend/scripts/migrations/add-requires-approval-field.js
```

---

## Backward Compatibility

- Existing tasks behave identically (no approval requirement)
- Existing status values remain unchanged
- API clients that don't send `requiresApproval` will default to `false`
- Frontend applications that don't display the `WaitingForApproval` status will still function

---

## Frontend Integration

### UI Indicators

Tasks with `requiresApproval: true` display an amber warning icon (⚠️) to indicate approval is required.

### Status Selector Logic

The status dropdown dynamically filters available options:

| User Role | Task Type | Available Statuses |
|-----------|-----------|-------------------|
| Admin | Approval-required | NotStarted, InProgress, WaitingForApproval, Completed |
| Member | Approval-required | NotStarted, InProgress, WaitingForApproval |
| Admin/Assignee | Regular | NotStarted, InProgress, Completed |
| Observer | Regular | NotStarted, InProgress |

### Filter Options

Tasks can be filtered by `requiresApproval` field:
- "All Tasks" (default)
- "Requires Approval" (`requiresApproval: true`)
- "Standard Tasks" (`requiresApproval: false`)

---

## Examples

### Example 1: Admin Creates Approval-Required Task

**Request:**
```bash
POST /api/tasks
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "groupId": "507f1f77bcf86cd799439012",
  "assignedUserId": "507f1f77bcf86cd799439013",
  "name": "Review monthly budget",
  "difficulty": 7,
  "dueAt": "2024-02-01T00:00:00Z",
  "frequency": "Monthly",
  "requiresApproval": true
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "groupId": "507f1f77bcf86cd799439012",
  "assignedUserId": "507f1f77bcf86cd799439013",
  "name": "Review monthly budget",
  "difficulty": 7,
  "status": "NotStarted",
  "dueAt": "2024-02-01T00:00:00Z",
  "frequency": "Monthly",
  "requiresApproval": true,
  "createdBy": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Example 2: Member Submits Task for Approval

**Request:**
```bash
PATCH /api/tasks/507f1f77bcf86cd799439014
Authorization: Bearer <member-token>
Content-Type: application/json

{
  "status": "WaitingForApproval"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "status": "WaitingForApproval",
  "updatedAt": "2024-01-20T14:00:00Z",
  ...
}
```

### Example 3: Member Attempts to Complete Approval-Required Task (Fails)

**Request:**
```bash
PATCH /api/tasks/507f1f77bcf86cd799439014
Authorization: Bearer <member-token>
Content-Type: application/json

{
  "status": "Completed"
}
```

**Response:**
```json
HTTP 401 Unauthorized

{
  "message": "Only group admins can complete tasks that require approval"
}
```

### Example 4: Admin Approves Task

**Request:**
```bash
PATCH /api/tasks/507f1f77bcf86cd799439014
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "Completed"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "status": "Completed",
  "updatedAt": "2024-01-21T09:15:00Z",
  ...
}
```

---

## Testing

Comprehensive test coverage includes:
- Unit tests for authorization rules
- Validation of approval workflow
- History tracking verification
- Regression tests for existing functionality

Run tests:
```bash
# Backend
dotnet test

# Frontend
cd web && npm test
```
