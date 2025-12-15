# FR-021: Admin Panel & Governance

## Overview
Provide admin capabilities for group and tenant governance: manage memberships and roles, configure categories and difficulty schemes, audit activities, moderate content, and set operational policies (notifications, quiet hours, task assignment constraints). Scoped by multi-group model (FR-015).

## Goals
- Role management: assign roles (owner/admin/member) per group.
- Membership: invite/remove users; pending requests; transfers of ownership.
- Category governance: CRUD categories, merge/retire, visibility.
- Difficulty scheme: define allowed difficulty values per group; weights for points.
- Policies: notification defaults, quiet hours, assignment rules (e.g., max concurrent tasks).
- Auditing & moderation: view recent actions, revert certain operations, flag content.

## Non-Goals
- Billing and tenant-level payments.  
- SSO provisioning beyond manual invites.

## Data Model (MongoDB)
- `Group` (existing): add governance fields
  - policy: {
      notificationsDefault: { channels: { tasks, messages, alerts }, quietHours? },
      assignmentRules: { maxConcurrentTasks?: number, allowSelfAssign?: boolean },
      difficultyWeights: { easy: number, medium: number, hard: number }
    }

- `GroupMembership` (existing): role enum extended: 'owner'|'admin'|'member'.

- `Category` (existing): add fields `visible: boolean`, `retiredAt?`, `mergeIntoCategoryId?`.

- `AuditLog` (shared): include admin actions types: 'category_update', 'policy_update', 'role_change', 'membership_invite', 'moderation_action'.

Indexes:
- `GroupMembership.groupId + userId` unique.
- `Category.groupId + name` unique; add partial index for `visible=true`.

## Backend API (Controllers)
- Admin endpoints require role `admin` or `owner` in `activeGroupId`.

- Membership & Roles
  - GET `/api/admin/members` → list members with roles.
  - POST `/api/admin/members/invite` → invite by email.
  - POST `/api/admin/members/{userId}/role` → change role.
  - DELETE `/api/admin/members/{userId}` → remove; safeguards for owner.

- Categories
  - GET `/api/admin/categories` → list all including retired.
  - POST `/api/admin/categories` → create.
  - PUT `/api/admin/categories/{categoryId}` → update (name, visible, etc.).
  - POST `/api/admin/categories/{categoryId}/merge` → merge into another; reassign tasks.
  - POST `/api/admin/categories/{categoryId}/retire` → mark retired.

- Policies
  - GET `/api/admin/policies` → current group policies.
  - PUT `/api/admin/policies` → update policies (notifications default, quiet hours, assignment rules, difficulty weights).

- Auditing & Moderation
  - GET `/api/admin/audit` → recent actions with filters.
  - POST `/api/admin/moderation/flag` → flag content (task/message) with reason.
  - POST `/api/admin/moderation/{entity}/{id}/revert` → revert last action if reversible.

## Services
- `AdminService`
  - Membership: invite (send email/push), role changes with guardrails, remove with cascading effects.
  - Categories: merge (update tasks to `mergeIntoCategoryId`), retire sets `visible=false` + `retiredAt`.
  - Policies: validate and persist; propagate defaults to new users via `UserPreferences` seeding.
  - Moderation: record flags; optionally soft-hide content pending review.

- `AuditService` → writes admin action logs; query with filters.

## Validation (Controller)
- Owner cannot be removed unless ownership transferred.
- Difficulty weights must be positive; sum may be normalized.
- Assignment rules constraints: `maxConcurrentTasks` reasonable bounds.
- Category merge: target must exist and be visible.

## Frontend (React)
- Admin Panel route visible to `admin/owner` only.
- Sections: Members & Roles, Categories, Policies, Audit & Moderation.
- Tables with sorting/filtering; modals for edits.
- Category merge UI: pick target, preview affected tasks count.
- Policy editor: inputs for notification defaults, quiet hours, assignment rules, difficulty weights.

## Testing
Backend:
- Role change guardrails; owner transfer.
- Category merge updates tasks and marks original.
- Policy updates persisted and returned.

Frontend:
- Role-based access; forms validations; audit list filtering.

## Observability
- Log admin actions; metrics for moderation volume and policy changes.

## Edge Cases
- Large task volumes on merge: batch updates.
- Conflicting policy updates: last-write-wins with audit trail.
- Member removal with in-flight tasks: reassignment policy required.
