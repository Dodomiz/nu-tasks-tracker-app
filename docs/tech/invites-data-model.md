# Invites Data Model (Proposal)

Date: 2025-12-17
Status: Draft (for review)
Scope: Group membership invites lifecycle to support Members modal (FR: Members & Tasks Epic)

## Purpose
Enable admins to invite users to a group by email, track invite status (Pending/Joined/Declined/Canceled/Expired), and manage resend/cancel actions safely and efficiently.

## Collection: invites

Document shape (proposed minimal):
```json
{
  "_id": ObjectId,
  "groupId": ObjectId,
  "email": "user@example.com",
  "status": "Pending" | "Joined" | "Declined" | "Canceled" | "Expired",
  "token": "<opaque-token>",
  "invitedBy": ObjectId,          // userId of admin who invited
  "invitedAt": ISODate,
  "respondedAt": ISODate|null,    // when joined/declined
  "lastSentAt": ISODate|null,     // last email send timestamp
  "sendCount": 0,                 // resend counter
  "notes": "optional context"     // optional metadata
}
```

Notes:
- `token` is used to validate join flow from email link; generation/rotation policy TBD.
- `status=Joined` implies a member exists in `groups.members` for this email's userId (post-join binding is handled elsewhere).
- `status=Expired` is set by a scheduled job or evaluated at read-time if `invitedAt + N days` elapsed (policy TBD: default 14 days).

## Indexes (proposed)

- `{ groupId: 1, status: 1, invitedAt: -1 }`  // dashboard listing and filtering
- `{ email: 1, groupId: 1 }` uniquePartial on `status == "Pending"` // prevent duplicate pending invites per group
- `{ token: 1 }`  // validate invite link

Implementation suggestion for partial uniqueness:
- If MongoDB partial index is not preferred, enforce uniqueness in service layer: reject creating a new Pending invite when an active Pending exists for same `(groupId,email)`.

## Lifecycle & Transitions

- Create → `Pending`
- Accept (join) → `Joined` + set `respondedAt`
- Decline → `Declined` + set `respondedAt`
- Cancel (admin) → `Canceled`
- Expire (time-based) → `Expired` (job or read-time evaluation)
- Resend allowed only if `Pending`; increments `sendCount`, updates `lastSentAt`.

## Validation & Rules

- Email format validation (basic RFC compliance).
- Reject invite if:
  - Email already belongs to an existing member of the group.
  - A Pending invite for `(groupId,email)` already exists (within non-expired window).
- Last-admin protection is enforced on member removal (separate flow) — not relevant to invites.

## Data Access Patterns

- List invites for a group: filter by `groupId`, optionally by `status in [Pending, Declined, Joined]`, sort by `invitedAt desc`.
- Resend: update `lastSentAt`, `sendCount`.
- Cancel: set `status=Canceled`.
- Accept/Decline: set `status` accordingly and `respondedAt`.

## Email Delivery

- Use existing email infrastructure (ServerAccess) if available. If not, stub with logging for local/dev.
- Templates: subject/body TBD (localization-ready). Include invite link with `token`.

## Security & Privacy

- Do not expose invite email addresses to non-admins.
- Tokens are single-use; invalidate on acceptance/decline/cancel/expire.
- Avoid logging tokens, emails in plain text in production logs.

## Open Questions

- Default expiry window (e.g., 14 or 30 days)?
- Should we allow multiple Pending invites for same email if previous expired? (Proposed: yes, once expired.)
- Mapping email → userId on join: do we require verified email equality?
- Rate limiting resend attempts (e.g., max 3/day)?
