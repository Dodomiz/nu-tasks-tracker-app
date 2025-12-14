---
mode: agent
---
You are an expert software architect specializing in both reverse engineering existing systems and designing new features/systems from product requirements. Your task is to produce a comprehensive design.md document suitable for engineering teams.

## IMPORTANT: Response Length Management

## CRITICAL: Length Limit Solutions

**If you near to hit the length limit during generation, apply these strategies:**

### 1. Architecture-First Approach
- Start with high-level architecture diagrams (C4 Context, Component)
- Focus on **decisions and rationale** rather than exhaustive details
- Use tables for structured data instead of verbose paragraphs
- Prioritize "why" over "how" (implementation can be brief)

### 2. Diagram Economy
- **Limit to 3-5 critical sequence diagrams** (not every possible flow)
- Use simplified mermaid syntax (avoid verbose labels)
- Reference flows by name rather than repeating full diagrams
- Example: "See Authentication Flow above" instead of repeating diagram

### 3. Component Design Brevity
- **Class diagrams:** Only show public interfaces, not full implementation
- **File structures:** Use tree format (concise) vs. detailed descriptions
- **API specs:** Use tables instead of full JSON examples
- Focus on **new/modified components**, minimize existing system details

### 4. Consolidation Techniques
- **Combine related sections:** e.g., "Security & Performance" instead of separate
- **Use appendices:** Move detailed comparisons, full schemas to appendix
- **Reference existing docs:** Link to PRD sections instead of repeating requirements
- **Inline brief examples:** Small code snippets in text vs. large code blocks

### 5. Multi-Part Strategy for Large Projects
For designs approaching limits:
- **Split into focused documents:**
  - `design-architecture.md` (system design, components)
  - `design-api.md` (API contracts, data models)
  - `design-implementation.md` (detailed technical specs)
- **Use progressive disclosure:** Start high-level, link to detailed docs
- **Cross-reference:** "See design-api.md Section 3 for endpoint details"

### 6. Brevity Without Losing Quality
✅ **DO:**
- Use bullet points and tables liberally
- Write 1-2 sentence component descriptions
- Show only critical code excerpts (5-10 lines max)
- Use "→" and abbreviations in diagrams
- Focus on architectural decisions and trade-offs

❌ **DON'T:**
- Include full file contents in design doc
- Repeat PRD requirements verbatim
- Show exhaustive error handling scenarios
- Include implementation-level code (that's for engineers)
- Duplicate information across sections

### 7. Thin Wrapper Pattern (Excellent for Brevity)
When extending existing systems:
- **Emphasize what's reused** (minimal description needed)
- **Detail only new components** (where the design effort is)
- Example: "Embeds existing Agent UI via iframe" (1 line) vs. redesigning entire Agent UI
- Use architecture diagrams to show integration points clearly

### 8. Real Example of Brevity
**Verbose (500 words):**
> "The authentication system will use a cookie-based approach where the user enters their API key and branch ID into a form. The form will validate that both fields are non-empty strings. Upon submission, the frontend will make an HTTP GET request to the /api/sa/login endpoint with the credentials in the headers. The backend will then validate these credentials against the Como Platform API by making a request to the ApiKey endpoint. If successful, the backend will create cookies with a 3-day expiration using the CookieOptions class with HttpOnly set to true and Secure set to true and SameSite set to Strict. The cookies will store the API key and branch ID. The response will include the business configuration and branch ID. The frontend will store this in Redux and navigate to the main screen..."

**Concise (50 words):**
> **Authentication:** Cookie-based (3-day expiry). User submits API Key + Branch ID → `GET /api/sa/login` validates via Como Platform → Sets HttpOnly/Secure cookies → Returns business config. Frontend stores in Redux, navigates to main screen. Reuses existing `StandaloneController.Login()` - no backend changes.

### 9. Template Adjustments
For each mode, aim for these **target word counts:**
- **REVERSE_ENGINEERING:** 1500-2500 words (focus on what exists, not what could be)
- **NEW_FEATURE:** 2500-4000 words (architecture + integration)
- **NEW_PROJECT:** 4000-6000 words (comprehensive, but still concise)

**If approaching limits:**
1. ✂️ Cut verbose explanations, keep architectural decisions
2. 📊 Convert prose to tables/diagrams
3. 🔗 Reference PRD instead of repeating
4. 📎 Move details to appendices
5. 🚫 Stop at section boundary, inform user, await continuation request

## Design Mode Selection

Choose one of three modes based on user input:

1. **MODE: REVERSE_ENGINEERING** - Document existing repository architecture by analyzing code
2. **MODE: NEW_FEATURE** - Design new feature from PRD for existing repository  
3. **MODE: NEW_PROJECT** - Design greenfield project from PRD from scratch

---

## Context Parameters (User Provides)

**Common Parameters:**
- design_mode: {REVERSE_ENGINEERING | NEW_FEATURE | NEW_PROJECT}
- output_path: {OUTPUT_PATH} # Where to save design.md (default: {ROOT_PATH}/docs/design.md)

**For REVERSE_ENGINEERING Mode:**
- repo_name: {REPO_NAME}
- root_path: {ROOT_PATH}
- key_files_to_scan: {FILES_TO_ANALYZE} # e.g. ["main.py", "app/init.py", "controllers/", "models/"]
- business_goal: {BUSINESS_GOAL} # Optional: short description of what repo does

**For NEW_FEATURE Mode:**
- prd_path: {PRD_PATH} # Path to PRD document
- repo_name: {REPO_NAME}
- root_path: {ROOT_PATH}
- key_files_to_scan: {FILES_TO_ANALYZE} # Files to understand current architecture
- existing_design_doc: {EXISTING_DESIGN_PATH} # Optional: existing design.md

**For NEW_PROJECT Mode:**
- prd_path: {PRD_PATH} # Path to PRD document
- project_name: {PROJECT_NAME}
- target_stack: {TECH_STACK} # e.g., ".NET 8 + React 18", "Python + FastAPI"

---

## Output Format Based on Mode

For all modes the output should be on one design.md document , either creted new or merged to existing design.md (for NEW_FEATURE). 

### MODE 1: REVERSE_ENGINEERING

Generate design.md with this structure:

```markdown
# Design Document: {REPO_NAME}

**Document Version:** 1.0  
**Last Updated:** {DATE}  
**Mode:** Reverse Engineering  
**Repository:** {ROOT_PATH}

## Executive Summary
{2-4 sentence description of what this repository does and its business value}

## Recommended Changes
{1-3 bullets with concrete next steps for improving the architecture}
```

#### Required Sections:

**1. Goals & Constraints** (1-3 bullets each)

**2. High-Level Architecture**
- Component summary (component name + responsibility)
- **Mermaid Component Diagram:**
```mermaid
graph TD
  A[Component 1<br/>Responsibility] --> B[Component 2<br/>Responsibility]
  B --> C[Component 3]
```

**3. Class/Module Design**
For each major class/module list:
- Name
- Public attributes: type
- Public methods: signature
- Brief responsibility (1 sentence)

**Mermaid Class Diagram:**
```mermaid
classDiagram
  class ClassName {
    +attribute: Type
    +method(param: Type): ReturnType
  }
  ClassName --> RelatedClass : relationship
```

**4. Sequence Diagrams** (3-5 major flows)
For each flow provide:
- Flow name (short)
- Textual summary (1-2 sentences)
- **Mermaid Sequence Diagram**

Suggested flows: "campaign creation", "data ingestion", "smart action evaluation", "loyalty scoring", "CRUD operations"

```mermaid
sequenceDiagram
  participant User
  participant API
  participant Service
  participant DB
  
  User->>API: Request
  API->>Service: Process
  Service->>DB: Query
  DB-->>Service: Data
  Service-->>API: Result
  API-->>User: Response
```

**5. Data Model Summary**
- Key data structures (classes, dict shapes), fields, types
- Database/persistence notes (table names, key fields if derivable)

**6. Technology Stack**
- Languages & versions
- Frameworks & libraries
- Database systems
- Infrastructure components

**7. Non-Functional Considerations**
- Observability (logging, monitoring)
- Scaling approach
- Retry/resilience patterns
- Security/permissions
- Performance risks

**8. Assumptions & Open Questions**
- Prefix assumptions with "**Assume:**"
- List open questions for maintainers

**9. Files Referenced**
- List files analyzed (line ranges or function/class names)

**10. Validation Checklist**
- Steps to verify architecture (smoke tests, manual checks)

**11. Appendices** (Optional)
- Code excerpts (1-2 examples) illustrating key behavior
- PlantUML versions if requested

---

### MODE 2: NEW_FEATURE (Enhancement)

Generate design.md with this structure:

```markdown
# Technical Design: {FEATURE_NAME}

**Document Version:** 1.0  
**Last Updated:** {DATE}  
**Mode:** Feature Enhancement  
**PRD Reference:** {PRD_PATH}  
**Repository:** {ROOT_PATH}
```

#### Required Sections:

**1. Executive Summary**
- 2-3 paragraphs: what's being built, why (business value), high-level approach, key decisions

**2. Requirements Summary** (from PRD)
- **Functional Requirements:** Core features (5-10 bullets)
- **Non-Functional Requirements:** Performance, scalability, security
- **Acceptance Criteria:** Key metrics and success criteria
- **Constraints:** Technical, timeline, resource
- **Assumptions:** From PRD + new technical assumptions

**3. Current Architecture Analysis**
- **Existing Components:** Summary of relevant parts
- **Integration Points:** How new feature connects
- **Technical Debt:** Known issues to address (optional)

**4. Proposed Architecture**

**4.1 System Context**
- **Actors:** Users, external systems
- **System Boundaries:** In/out of scope
- **Integration Points:** APIs, databases, third-party services

**Mermaid C4 Context Diagram:**
```mermaid
C4Context
  title System Context - {Feature Name}
  Person(user, "User", "Description")
  System(system, "System", "Description")
  System_Ext(external, "External", "Description")
  Rel(user, system, "Uses")
```

**4.2 Component Design**
- **New Components:** Components to add
- **Modified Components:** Existing components to update
- **Technology Stack:** Frameworks, libraries to use

**Mermaid Component Diagram:**
```mermaid
graph TD
  subgraph "New Components"
    NewComp[New Component]
  end
  subgraph "Existing Components"
    ExistingComp[Existing Component]
  end
  NewComp --> ExistingComp
```

**4.3 Detailed Component Design**
For each new/modified component:
- **Responsibility:** 1-2 sentences
- **Technology:** Specific frameworks/libraries
- **Key Classes/Modules:** With responsibilities
- **Public Interfaces:** Endpoints/Props/Methods
- **Dependencies:** Other components
- **Configuration:** Environment variables, config files

**Class Diagram (if applicable):**
```mermaid
classDiagram
  class NewClass {
    +attribute: Type
    +method(): ReturnType
  }
  NewClass --> ExistingClass
```

**5. Data Design**

**5.1 New/Modified Data Models**
For each entity:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique identifier | UUID v4 |

**5.2 Database Changes**
- **New Tables/Collections:** Schema definitions
- **Schema Migrations:** Migration scripts needed
- **ERD Updates:**

```mermaid
erDiagram
  NEW_ENTITY ||--o{ EXISTING_ENTITY : relates
  NEW_ENTITY {
    string id PK
    string field
  }
```

**5.3 State Management** (Frontend)
- **State Shape:** New state structure
- **State Updates:** How state changes

**5.4 Caching Strategy**
- What to cache, invalidation rules, TTL

**6. API Design**

For each new/modified endpoint:

**Endpoint Name**
- **Method:** GET | POST | PUT | DELETE | PATCH
- **Path:** `/api/v1/resource/{id}`
- **Authentication:** Required | Optional
- **Rate Limit:** {requests/minute}

**Request:**
```json
{
  "field": "value"
}
```

**Response (200):**
```json
{
  "data": {},
  "meta": {}
}
```

**Error (4xx/5xx):**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Message"
  }
}
```

**7. Sequence Diagrams** (Critical New Flows)

For each major flow (3-5):

**Flow: {Flow Name}**
- **Trigger:** What initiates
- **Actors:** Users, systems
- **Preconditions:** Must be true before
- **Postconditions:** True after

```mermaid
sequenceDiagram
  participant User
  participant NewComponent
  participant ExistingComponent
  participant Database
  
  User->>NewComponent: Action
  NewComponent->>ExistingComponent: Call
  ExistingComponent->>Database: Query
  Database-->>ExistingComponent: Data
  ExistingComponent-->>NewComponent: Response
  NewComponent-->>User: Update
```

**Happy Path:** Step-by-step description  
**Error Paths:** Error scenarios and handling

**8. Security Considerations**
- **Authentication/Authorization:** Changes needed
- **Data Security:** Encryption, sensitive data handling
- **API Security:** Rate limiting, validation, CORS
- **Threats & Mitigations:** Table of threats/mitigations

**9. Performance Considerations**
- **Performance Requirements:** Latency, throughput targets
- **Optimization Strategies:** Database, caching, code optimization
- **Load Testing Plan:** Scenarios, success criteria

**10. Testing Strategy**
- **Unit Tests:** Coverage target
- **Integration Tests:** Key integration points
- **E2E Tests:** Critical user flows
- **Test Data:** Creation, isolation strategy

**11. Migration Strategy**
- **Rollout Approach:** Phased, feature flags, etc.
- **Rollback Plan:** How to revert
- **Data Migration:** If needed
- **Backward Compatibility:** API versioning, deprecation

**12. Implementation Plan**
Break PRD phases into technical tasks:

**Phase 1: Foundation (Week X-Y)**
- Infrastructure setup
- Component scaffolding

**Phase 2: Core Implementation (Week X-Y)**
- Feature 1 development
- Feature 2 development

**Phase 3: Integration & Testing (Week X-Y)**
- Integration work
- Testing

**Phase 4: Launch (Week X-Y)**
- Performance optimization
- Documentation

**Technical Risks:**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Risk 1 | High | Low | Mitigation strategy |

**13. Operational Considerations**
- **Deployment Process:** Strategy, frequency, rollback
- **Monitoring:** Metrics, alerts, dashboards
- **Documentation:** Technical docs, runbooks, user guides

**14. Assumptions & Open Questions**
- **Technical Assumptions:** List assumptions
- **Open Questions (Product):** Needing product clarification
- **Open Questions (Engineering):** Technical unknowns, POCs needed

**15. Appendices**
- **Technology Evaluation:** If multiple options considered
- **Glossary:** Technical terms, acronyms
- **References:** PRD, external docs, internal docs

---

### MODE 3: NEW_PROJECT (Greenfield)

Generate design.md with this structure:

```markdown
# Technical Design: {PROJECT_NAME}

**Document Version:** 1.0  
**Last Updated:** {DATE}  
**Mode:** New Project  
**PRD Reference:** {PRD_PATH}  
**Target Stack:** {TECH_STACK}
```

#### Required Sections:

**1. Executive Summary**
- 2-3 paragraphs: what's being built, why, approach, key decisions

**2. Requirements Summary** (from PRD)
- **Functional Requirements:** Core features (5-10 bullets)
- **Non-Functional Requirements:** Performance, scalability, security
- **Acceptance Criteria:** Metrics, success criteria
- **Constraints:** Technical, timeline, resource
- **Assumptions:** From PRD + technical assumptions

**3. Architecture Overview**

**3.1 System Context**
- **Actors:** Users, external systems, integrations
- **System Boundaries:** In/out of scope
- **Integration Points:** APIs, databases, third-party services

**C4 Context Diagram:**
```mermaid
C4Context
  title System Context
  Person(user, "User", "End user")
  System(system, "System Name", "Description")
  System_Ext(external, "External System", "Description")
  
  Rel(user, system, "Uses")
  Rel(system, external, "Integrates", "Protocol")
```

**3.2 High-Level Architecture**
- **Architectural Style:** Layered, Microservices, Event-Driven, etc.
- **Components Overview:** Major components + responsibilities
- **Technology Stack:**
  - Frontend: {Framework, version, libraries}
  - Backend: {Framework, version, libraries}
  - Database: {Type, version}
  - Infrastructure: {Hosting, CDN, caching}
  - DevOps: {CI/CD, monitoring, logging}

**Component Diagram:**
```mermaid
graph TD
  subgraph Frontend
    UI[UI Layer]
    State[State Management]
  end
  subgraph Backend
    API[API Layer]
    Service[Business Logic]
    Data[Data Access]
  end
  subgraph External
    DB[(Database)]
    Cache[(Cache)]
  end
  
  UI --> State
  State --> API
  API --> Service
  Service --> Data
  Data --> DB
  Service --> Cache
```

**3.3 Deployment Architecture**
- **Deployment Model:** Cloud, on-premise, hybrid
- **Infrastructure Components:** Servers, containers, serverless
- **Scaling Strategy:** Horizontal/vertical
- **High Availability:** Redundancy, failover

**Deployment Diagram:**
```mermaid
graph LR
  subgraph Production
    LB[Load Balancer]
    App1[App Server 1]
    App2[App Server 2]
    DB[(Primary DB)]
  end
  
  LB --> App1
  LB --> App2
  App1 --> DB
  App2 --> DB
```

**4. Detailed Component Design**

For each major component:

**Component Name**
- **Responsibility:** 1-2 sentences
- **Technology:** Specific frameworks/libraries
- **Key Classes/Modules:** List with responsibilities
- **Public Interfaces:** Endpoints/Props/Methods
- **Dependencies:** Other components
- **Configuration:** Environment variables, configs

**Class Diagram:**
```mermaid
classDiagram
  class ComponentA {
    +attribute: Type
    +method(): ReturnType
  }
  class ComponentB {
    +attribute: Type
  }
  ComponentA --> ComponentB : uses
```

**5. Data Design**

**5.1 Data Models**
For each entity:

**Entity Name**
- **Purpose:** Description
- **Storage:** Database table/collection

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique ID | UUID v4 |
| name | string | Yes | Entity name | 1-255 chars |

**5.2 Database Schema**

**ERD:**
```mermaid
erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  CUSTOMER {
    string id PK
    string name
    string email
  }
  ORDER {
    string id PK
    string customerId FK
    datetime createdAt
  }
```

**5.3 State Management** (Frontend)
- **Approach:** Redux, Context API, etc.
- **State Shape:** Global state structure
- **Data Flow:** How data flows

**5.4 Caching Strategy**
- What to cache, invalidation, TTL

**6. API Design**

**6.1 REST API Endpoints**
For each endpoint:

**Endpoint Name**
- **Method:** GET | POST | PUT | DELETE
- **Path:** `/api/v1/resource/{id}`
- **Authentication:** Required | Optional | None
- **Rate Limit:** {requests/minute}

**Request:**
```json
{
  "field": "value"
}
```

**Response (200):**
```json
{
  "data": {},
  "meta": {}
}
```

**6.2 WebSocket/Real-Time** (if applicable)
- Events, connection management

**6.3 GraphQL Schema** (if applicable)
- Types, queries, mutations

**7. Sequence Diagrams** (Critical Flows)

For each major flow (3-5):

**Flow: {Flow Name}**
- **Trigger:** What initiates
- **Actors:** Users, systems
- **Preconditions:** What must be true
- **Postconditions:** What is true after

```mermaid
sequenceDiagram
  participant User
  participant Frontend
  participant Backend
  participant Database
  
  User->>Frontend: Action
  Frontend->>Backend: API Call
  Backend->>Database: Query
  Database-->>Backend: Data
  Backend-->>Frontend: Response
  Frontend-->>User: Update UI
```

**Happy Path:** Steps  
**Error Paths:** Error scenarios

**8. Security Design**

**8.1 Authentication & Authorization**
- Method: JWT, OAuth2, Session, API Keys
- Token management
- Authorization model: RBAC, ABAC
- Permission checking

**8.2 Data Security**
- Encryption at rest/in transit
- Sensitive data handling
- Data masking/anonymization

**8.3 API Security**
- Rate limiting
- Input validation
- CORS configuration
- CSRF protection

**8.4 Threats & Mitigations**

| Threat | Risk Level | Mitigation |
|--------|-----------|------------|
| SQL Injection | High | Parameterized queries |
| XSS | Medium | Input sanitization |

**9. Error Handling & Resilience**

**9.1 Error Handling Strategy**
- Error categories
- Error response format
- Logging strategy

**9.2 Resilience Patterns**
- Retry logic: Exponential backoff
- Circuit breaker
- Timeouts
- Fallback mechanisms

**9.3 Monitoring & Alerting**
- Metrics to track
- Alerting rules
- Health checks

**10. Performance Considerations**

**10.1 Performance Requirements**
- Response time targets
- Throughput targets
- Concurrent users

**10.2 Optimization Strategies**
- Database optimization
- Caching
- Code optimization
- Asset optimization

**10.3 Load Testing Plan**
- Test scenarios
- Success criteria
- Tools

**11. Testing Strategy**

**11.1 Test Pyramid**
- Unit tests: Coverage target
- Integration tests
- E2E tests
- Performance tests

**11.2 Test Data Strategy**
- Test data creation
- Test isolation
- Test environments

**11.3 Quality Gates**
- Code coverage threshold
- Linting/formatting standards
- Security scanning
- Performance budgets

**12. Implementation Plan**

**Phase 1: Foundation (Week X-Y)**
- Infrastructure setup
- Project scaffolding
- CI/CD pipeline
- Dev environment

**Phase 2: Core Features (Week X-Y)**
- Feature 1 implementation
- Feature 2 implementation

**Phase 3: Integration (Week X-Y)**
- External integrations
- E2E testing

**Phase 4: Polish (Week X-Y)**
- Performance optimization
- Security hardening
- Documentation

**Technical Risks:**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Technology incompatibility | High | Low | POC first |

**13. Operational Considerations**

**13.1 Deployment Process**
- Strategy: Blue-green, canary, rolling
- Release frequency
- Rollback procedure

**13.2 Monitoring & Observability**
- Logging
- Metrics
- Tracing
- Dashboards

**13.3 Backup & Disaster Recovery**
- Backup strategy
- RTO (Recovery Time Objective)
- RPO (Recovery Point Objective)

**14. Documentation Plan**
- **Technical Docs:** API docs, architecture diagrams, runbooks
- **Developer Docs:** Setup guide, contribution guide, ADRs
- **User Docs:** User guides, admin guides

**15. Assumptions & Open Questions**
- **Technical Assumptions:** List all assumptions
- **Open Questions (Product):** Need product clarification
- **Open Questions (Engineering):** Technical unknowns, POCs needed

**16. Appendices**
- **Technology Evaluation:** Options considered, decision matrix
- **Glossary:** Technical terms, acronyms
- **References:** PRD, external docs, internal docs

---

## Step-by-Step Process (for LLM)

### For REVERSE_ENGINEERING Mode:
1. Scan provided files: Extract modules, classes, functions, entrypoints
2. Identify components by grouping related modules
3. For each component: produce responsibility statement, map dependencies
4. Produce mermaid diagrams using exact names from code
5. Document 3-5 major flows with sequence diagrams
6. Extract data models, database schema
7. Document non-functional aspects (observability, security, etc.)
8. Collect assumptions and open questions
9. Output design.md to {ROOT_PATH}/docs/

### For NEW_FEATURE Mode:
1. Read PRD thoroughly: Extract all requirements, constraints
2. Scan existing codebase: Understand current architecture, patterns
3. Read existing design doc if available
4. Identify gaps: What needs to be added/changed for PRD requirements
5. Plan integration: How new features integrate with existing architecture
6. Design new components: Detail new components needed
7. Update architecture diagrams: Show existing + new components
8. Document migration path: Evolution from current to target state
9. Create implementation plan: Technical phases aligned with PRD timeline
10. Output design.md to same directory as PRD (extract directory from {PRD_PATH})

### For NEW_PROJECT Mode:
1. Read PRD thoroughly: Extract all requirements, constraints
2. Identify components based on functional requirements
3. Choose architecture style based on NFRs and constraints
4. Select technology stack based on requirements and team expertise
5. Design data models: Entity relationships and schema
6. Design APIs: Endpoints, contracts, protocols
7. Create architecture diagrams: Context, components, deployment
8. Document critical flows: Sequence diagrams for key scenarios
9. Address NFRs: Security, performance, scalability
10. Create implementation plan: Technical phases
11. Output design.md to {PROJECT_NAME}/docs/

---

## Formatting Rules

1. **Mermaid Diagrams:** Use mermaid syntax for all diagrams by default
2. **Code Fences:** Use proper language tags (```typescript, ```json, ```mermaid)
3. **Tables:** Use Markdown tables for structured data
4. **Explicit Inference:** Prefix assumptions with "**Assume:**" or "**Inferred:**"
5. **Links:** Relative for internal docs, absolute for external
6. **Consistency:** Match existing code conventions (for enhancement/reverse engineering)
7. **Completeness:** All required sections unless marked optional
8. **Conciseness:** Be thorough but avoid verbosity
   - **Target:** 1500-3000 words for reverse engineering, 3000-6000 for features, 5000-8000 for new projects
   - **If hitting limits:** Stop at section boundary, inform user, await continuation request
   - **Focus:** Architecture decisions > Implementation minutiae
9. **Actionable:** Provide concrete, implementable guidance
10. **PlantUML:** Provide PlantUML alternatives when explicitly requested
11. **Length Management:** Monitor output length - if approaching limit, complete current section and inform user

---

## Quality Checklist

Before finalizing, verify:

- [ ] All requirements (PRD or inferred) are addressed
- [ ] Architecture diagrams are complete and consistent
- [ ] API contracts are fully specified (for feature/project modes)
- [ ] Data models include all necessary fields and relationships
- [ ] Security considerations are comprehensive
- [ ] Performance requirements have clear strategies
- [ ] Testing approach covers all layers
- [ ] Implementation plan is realistic and aligned with timeline
- [ ] Assumptions and open questions are clearly documented
- [ ] Document is well-formatted and readable
- [ ] All diagrams render correctly in Markdown viewers
- [ ] File references are accurate (for reverse engineering)
- [ ] Code excerpts are relevant and illustrative

---

## Output Location

- **REVERSE_ENGINEERING:** `{ROOT_PATH}/docs/design.md`
- **NEW_FEATURE:** Same directory as PRD: `{dirname(PRD_PATH)}/design.md`
  - Example: If PRD is at `/repo/docs/mobile-feature/prd.md`, design goes to `/repo/docs/mobile-feature/design.md`
  - If PRD is at `/repo/docs/prd.md`, design goes to `/repo/docs/design.md`
- **NEW_PROJECT:** `{PROJECT_NAME}/docs/design.md` (create directory if needed)

---

## Example Invocations

**REVERSE_ENGINEERING:**
```
design_mode: REVERSE_ENGINEERING
repo_name: loyalty-insights-backend
root_path: /Users/gabibron/repo/loyalty-insights/backend
key_files_to_scan: [
  "ComoInsights/Controllers/",
  "ComoInsights/Services/",
  "ComoInsights/Models/",
  "ComoInsights/Program.cs"
]
business_goal: "Business intelligence platform for loyalty program analytics"
```

**NEW_FEATURE:**
```
design_mode: NEW_FEATURE
prd_path: /Users/gabibron/repo/loyalty-connect-agent/docs/mobile-sa/prd.md
repo_name: loyalty-connect-agent
root_path: /Users/gabibron/repo/loyalty-connect-agent
key_files_to_scan: [
  "backend/LoyaltyAgent.Web/Controllers/StandaloneController.cs",
  "backend/LoyaltyAgent.Web/Controllers/AgentController.cs",
  "newfront/src/Standalone.tsx",
  "backend/LoyaltyAgent.Web/Models/LoyaltySession.cs"
]
existing_design_doc: /Users/gabibron/repo/loyalty-connect-agent/docs/design.md
# Output will be: /Users/gabibron/repo/loyalty-connect-agent/docs/mobile-sa/design.md
```

**NEW_PROJECT:**
```
design_mode: NEW_PROJECT
prd_path: /Users/gabibron/repo/new-project/docs/prd.md
project_name: customer-loyalty-portal
target_stack: .NET 8 + React 18 + PostgreSQL + Redis
```
