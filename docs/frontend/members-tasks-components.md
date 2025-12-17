# Frontend Components Breakdown: Members & Group Tasks

Date: 2025-12-17
Status: Draft (for review)
Scope: UI/UX implementation plan for Members modal and Group Tasks list opened from Group Card

## High-Level UX
- Entry points from Group Card:
  - Members button → `MembersModal` with tabs: Members | Invites
  - Tasks button → `GroupTasksPanel` (drawer/modal) with filters/sorts, list + detail panel
- Keep UI aligned with existing Tailwind conventions and accessibility patterns.

## Components

### 1) MembersModal
- Location: `web/src/features/groups/components/MembersModal.tsx` (new)
- Props: `{ groupId: string, isOpen: boolean, onClose: () => void }`
- Tabs: Members | Invites
- Members Tab:
  - `MemberRow`: avatar/initials, First Last, Role badge (Admin/Member), joinedAt
  - Action (Admin only): Remove member → confirm → service call → refresh
  - Last-admin protection: block with warning toast
- Invites Tab:
  - `InviteRow`: email, status chip (Pending/Joined/Declined), invitedAt, invitedBy
  - Actions (Admin only): Resend, Cancel (only when Pending)
  - `InviteForm`: email input + submit → create invite → toast → refresh
- State/UX:
  - Loading skeletons per list
  - Empty states (no members/invites)
  - Errors surfaced via toasts
  - Focus trap, ESC to close, return focus to trigger

### 2) GroupTasksPanel
- Location: `web/src/features/tasks/components/GroupTasksPanel.tsx` (new)
- Props: `{ groupId: string, isOpen: boolean, onClose: () => void }`
- Header: title + group name, close button
- Controls:
  - Filter: Status (Pending/InProgress/Completed)
  - Filter: Assignee (All + members)
  - Sort: CreatedDate | UpdatedDate (asc/desc)
- List: `GroupTaskRow`
  - Fields: Task Name, Assignee (avatar/initials + name), Status chip
  - Click → opens `TaskDetailsSidePanel` (inline) for quick triage
- Inline Actions (Admin only): Assign/Unassign from row or details panel
- Empty & loading states matching design system

### 3) Shared UI
- `Avatar` / `InitialsAvatar` (reuse existing)
- `RoleBadge` (Admin/Member)
- `StatusPill` (Pending/InProgress/Completed)
- `ConfirmDialog` (reuse existing pattern)
- `SearchInput` (optional for members)

## Data Fetching (RTK Query)
- Endpoints (names illustrative, contract TBD):
  - `useGetGroupMembersQuery(groupId)`
  - `useGetGroupInvitesQuery(groupId)`
  - `useCreateInviteMutation()`
  - `useCancelInviteMutation()` / `useResendInviteMutation()`
  - `useRemoveMemberMutation()`
  - `useGetGroupTasksQuery({ groupId, status?, assigneeId?, sort?, order? })`
  - `useAssignTaskMutation()` / `useUnassignTaskMutation()`
- Caching/Invalidation:
  - On invite create/cancel/resend → invalidate `GroupInvites(groupId)`
  - On remove member → invalidate `GroupMembers(groupId)`, `GroupTasks(groupId)` (assignees)
  - On assign/unassign → invalidate `GroupTasks(groupId)` and task detail cache key

## Access Control
- Show/hide admin-only actions based on `myRole` (from group context or user role API).
- Ensure server-side authorization also enforced (backend validation required).

## State & Persistence
- Persist Filters/Sort by `groupId` in `localStorage` (key: `groupTasks:<groupId>`).
- Clear state on group change or modal close if desired (TBD).

## Accessibility
- Modals/panels must have focus trap, keyboard navigation, labelled headings.
- Use `aria-live` regions for async success/error toasts if applicable.

## Testing (Vitest + RTL)
- MembersModal renders tabs and lists; admin actions gated.
- InviteForm validates email; shows errors and success.
- GroupTasksPanel filters and sorts correctly.
- Assign/Unassign invokes mutations and updates UI after invalidation.
- Accessibility snapshots: focus order, ARIA labels.

## Open Questions
- Self-assign policy: allowed for Members? If yes, restrict to unassigned tasks only?
- Should Invites tab show Canceled/Expired with a toggle? (default hide)
- Do we surface pagination for long lists (>50 rows)? (TBD)
