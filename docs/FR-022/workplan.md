# Work Plan: FR-022 Integrations & Webhooks

## Vision & Metrics
Expose secure, group-scoped webhooks for task lifecycle events and inbound integrations with HMAC signatures and retry logic.
- Reliability: Retries with backoff; dead-letter queue; delivery logs.
- Security: HMAC signatures; secret rotation; IP allowlists.
- Manageability: UI for webhook configs; event filters; replay failed.

## Epics

## Epic E1: Backend – Outbound Webhooks
**Description:** Config management; event emission; delivery with retries.
**Success Criteria:** Webhooks fire on task events; retries work; delivery logs accessible.

### US-1701: WebhookConfig Repository & Service
- Acceptance: CRUD for `WebhookConfig` per group; secret generation/rotation.
- Tech: Mongo; DTOs; admin auth required.

### US-1702: Webhook Delivery & Dispatcher Job
- Acceptance: `EmitAsync` enqueues delivery per enabled configs; `DeliverAsync` performs POST with HMAC signature; retries with backoff; marks dead-letter.
- Tech: Hangfire; `WebhookDelivery` entity; HTTP client with timeout.

### US-1703: Webhook Management Endpoints
- Acceptance: `GET /api/integrations/webhooks`, `POST`, `PUT`, `DELETE`, `GET /api/integrations/webhooks/{id}/deliveries`, `POST /api/integrations/webhooks/{id}/replay/{deliveryId}`.
- Tech: Controllers; admin-only.

## Epic E2: Backend – Inbound Integrations
**Description:** Signed endpoints for external systems to create/update tasks.
**Success Criteria:** HMAC validated; tasks created/updated; IP allowlist optional.

### US-1704: Inbound Integration Endpoint
- Acceptance: `POST /api/integrations/inbound/{groupId}/tasks` with HMAC signature; validate and upsert task.
- Tech: Controllers; signature verification; InboundIntegrationService.

### US-1705: Signature Validation & IP Allowlist
- Acceptance: Verify `X-Signature` using shared secret; reject if clock skew > 5 min; optional IP allowlist check.
- Tech: Middleware/service; config per group.

## Epic E3: Event Hooks in Services
**Description:** Emit webhook events from task lifecycle services.
**Success Criteria:** Task events trigger webhook emissions.

### US-1706: Emit Events on Task Changes
- Acceptance: TaskService methods (create, update, complete, approve, reject, swap) call `WebhookService.EmitAsync`.
- Tech: Minimal service changes; event payloads per design.

## Epic E4: Frontend – Integrations UI
**Description:** Admin UI for webhook configs and inbound help.
**Success Criteria:** Admins create/edit webhooks; view deliveries; replay.

### US-1707: RTK Query Integrations Endpoints
- Acceptance: All webhook endpoints typed; delivery logs polling.
- Tech: RTK Query.

### US-1708: Integrations Page
- Acceptance: Webhook list/create/edit with event filters, headers, secret rotate; delivery log table with replay; inbound config help and sample cURL.
- Tech: Tailwind; modals; tables; accessibility.

## Epic E5: Tests – Unit & Integration
**Description:** Validate signature, retry logic, emission hooks, and UI.
**Success Criteria:** ~70% coverage; security validated.

### US-1709: Unit – WebhookService & Signature
- Acceptance: HMAC verification; retry/backoff math; secret rotation.
- Tech: xUnit; Moq for HTTP.

### US-1710: Integration – Webhook Flows
- Acceptance: Emit on task events; delivery logs created; replay works; inbound creates tasks.
- Tech: WebApplicationFactory; seeded webhooks and tasks.

### US-1711: Frontend – Integrations Page
- Acceptance: Form validations; list filtering; replay triggers.
- Tech: Vitest + RTL.

## Sprint Plan

## Sprint 1: Outbound Webhooks + Event Emission
- US-1701, US-1702, US-1703, US-1706, US-1709, US-1710

## Sprint 2: Inbound + Frontend + Tests
- US-1704, US-1705, US-1707, US-1708, US-1711

## Dependencies & Risks
- Dependencies: FR-005/008/013 task services; admin panel (FR-021).
- Risks: Partner downtime; large payloads; signature mismatches. Mitigate with timeouts, retries, dead-letter queue.

## Release Phases
- Phase 1: Outbound webhooks with retries.
- Phase 2: Inbound integrations and full UI.
