# FR-022: Integrations & Webhooks

## Overview
Expose secure, group-scoped webhooks to notify external systems about task lifecycle events and allow inbound integrations to create/update tasks with guarded scopes. Provide a management UI, delivery retries, signatures, and event filtering.

## Goals
- Outbound webhooks: POST JSON to partner endpoints on events (created/updated/completed/approved/rejected/swapped).
- Inbound integrations: optional signed endpoints to create/update tasks and categories.
- Security: HMAC signatures, allowlist IPs, rotating secrets, scoped by `groupId`.
- Reliability: retry with backoff, dead-letter queue, delivery logs.
- Management: per-group webhook configs with event filters and headers.

## Non-Goals
- Full connector marketplace; focus on generic webhooks + simple inbound.

## Data Model (MongoDB)
- `WebhookConfig`
  - id, groupId, name, targetUrl, secret, enabled
  - events: { taskCreated, taskUpdated, taskCompleted, taskApproved, taskRejected, taskSwapped }
  - headers: Record<string,string>
  - retryPolicy: { maxAttempts: number, backoffSeconds: number }
  - createdAt, updatedAt

- `WebhookDelivery`
  - id, groupId, webhookId, eventType, payloadSummary, status: 'queued'|'delivered'|'failed'|'dead-letter', attempts, lastAttemptAt, errorMessage?

Indexes:
- `WebhookConfig.groupId`.
- `WebhookDelivery.groupId + webhookId`.

## Backend API (Controllers)
- Admin-only (group `admin/owner`):
  - GET `/api/integrations/webhooks` → list configs.
  - POST `/api/integrations/webhooks` → create.
  - PUT `/api/integrations/webhooks/{id}` → update; secret rotation supported.
  - DELETE `/api/integrations/webhooks/{id}` → soft delete.
  - GET `/api/integrations/webhooks/{id}/deliveries` → list delivery logs.
  - POST `/api/integrations/webhooks/{id}/replay/{deliveryId}` → replay failed.

- Inbound (optional, per group):
  - POST `/api/integrations/inbound/{groupId}/tasks` → create/update tasks.
    - Auth: HMAC signature `X-Signature: sha256=...` using shared secret; optional IP allowlist.

## Services
- `WebhookService`
  - `EmitAsync(groupId, eventType, payload)` → enqueue delivery per enabled configs.
  - `DeliverAsync(deliveryId)` → perform HTTP POST with headers + `X-Signature`.
  - `ReplayAsync(groupId, webhookId, deliveryId)`.

- `InboundIntegrationService`
  - Validate signature and group; map payload to `Task` upsert.

## Jobs (Hangfire)
- `WebhookDispatcherJob(groupId)` → drains queued deliveries, retries with backoff; marks dead-letter after `maxAttempts`.

## Payloads
- Common envelope:
  ```json
  {
    "event": "task.completed",
    "groupId": "...",
    "timestamp": "2025-12-15T12:34:56Z",
    "actorId": "...",
    "data": { /* task fields subset */ }
  }
  ```
- Include stable IDs and `updatedAt`; keep payloads compact.

## Security
- HMAC signatures over raw JSON + timestamp; include `X-Timestamp` header and reject if clock skew > 5 minutes.
- Secret rotation: store previous secret until rotation finalized.
- Do not log payloads with PII; log counts/statuses only.

## Frontend (React)
- Admin → Integrations tab:
  - Webhook list/create/edit with event filter checkboxes, headers, secret rotate.
  - Delivery log table with statuses and replay action.
  - Inbound config help and sample cURL.

## Testing
Backend:
- Signature verification; replay logic; retry/backoff correctness.
- Emission on task events (hook points in services from FR-008/013 etc.).

Frontend:
- Form validations; list filtering; replay triggers.

## Observability
- Metrics: deliveries attempted/succeeded/failed, dead-letter count.
- Alerts for high failure rates.

## Edge Cases
- Endpoint returns 2xx but slow: set reasonable timeouts.
- Partner downtime: backoff and eventually dead-letter.
- Multiple webhooks for same event: isolate failures per webhook.
