````prompt
# Work Plan Generation Prompt

## Purpose
Transform design documents into actionable agile work plans with epics and user stories following INVEST principles.

## Prerequisites
- Design document exists (`design.md`)
- Architecture and technical approach defined

## Instructions

### 1. Load Design Document
```bash
find . -name "design.md" -o -name "design-*.md" | grep -v node_modules
```

### 2. Define Vision & Metrics

**Vision Format:**
```
For [target users] who [need], 
the [product] is a [category] that [key benefit].
```

**Success Metrics:** Define measurable user, business, and technical outcomes.

### 3. Create Epics

**Epic Template:**
```markdown
## Epic [ID]: [Name]
**Description:** [Overview]
**Business Value:** [Why this matters]
**Success Criteria:** [Measurable outcomes]
**Estimated Effort:** [X sprints]
**Priority:** [Critical/High/Medium/Low]
```

### 4. Write User Stories (INVEST Principles)

**Story Template:**
```markdown
### Story [ID]: [Title]

**As a** [role] **I want to** [capability] **So that** [benefit]

**Acceptance Criteria:**
- [ ] Given [context], when [action], then [outcome]

**Technical Notes:** [Implementation hints]
**Dependencies:** [Prerequisites]
**Estimated Effort:** [X days with AI]
**Priority:** [Must/Should/Could/Won't Have]
```

**INVEST Checklist:**
- ✅ **Independent** - Can be developed standalone
- ✅ **Negotiable** - Details flexible, focus on "what" not "how"
- ✅ **Valuable** - Delivers tangible user/business benefit
- ✅ **Estimable** - Clear scope and complexity
- ✅ **Small** - Completable in 1 sprint (2-4 days with AI)
- ✅ **Testable** - Clear acceptance criteria

### 5. Estimate with AI Co-Development

**Productivity Multipliers:**
- CRUD/Boilerplate: 3-5x faster
- Business Logic: 2-3x faster
- Testing: 4-6x faster
- Documentation: 5-10x faster

**Story Points:**
- XS (1-2): 0.5-1 day
- S (3): 1-2 days
- M (5): 2-3 days
- L (8): 3-5 days
- XL (13+): Split into smaller stories

### 6. Prioritize (MoSCoW)

- **Must Have:** Critical for MVP, blocks other work
- **Should Have:** Important but not critical
- **Could Have:** Nice to have, low effort
- **Won't Have:** Out of scope

### 7. Create Sprint Plan

```markdown
## Sprint [N]: [Theme]
**Duration:** 2 weeks
**Sprint Goal:** [What will be achieved]
**Stories:** [List with effort and priority]
**Capacity:** [Team days] | **Committed:** [Story total]
```

**Tips:** Leave 20% buffer, balance quick wins with complex work, complete dependencies first.

### 8. Output Document Structure

```markdown
# Work Plan: [Project Name]

## Vision & Metrics
[Vision statement and success metrics]

## Timeline: [N] Epics, [M] Stories, [X] Sprints

## Epics
[Epic details with nested stories]

## Sprint Plan
[Sprint-by-sprint breakdown]

## Dependencies & Risks
[Technical/external dependencies and risk mitigation]

## Release Phases
- Phase 1 (MVP): [Sprints 1-3]
- Phase 2 (Enhancement): [Sprints 4-6]
- Phase 3 (Optimization): [Sprints 7+]
```

### 9. Validate

- [ ] Stories follow INVEST
- [ ] Estimates include AI assistance + 20% buffer
- [ ] Dependencies documented
- [ ] Each sprint delivers shippable value
- [ ] All stories have testable acceptance criteria

### 10. Save Work Plan

Save as `docs/workplan.md`

## Example Story

```markdown
### Story US-001: User Registration

**As a** new user **I want to** register with email **So that** I can access features

**Acceptance Criteria:**
- [ ] Valid email/password creates account
- [ ] Duplicate email shows error
- [ ] Welcome email sent on success
- [ ] Invalid email format rejected
- [ ] Password must be 8+ characters

**Technical Notes:** bcrypt for passwords, EF Core, RFC 5322 email validation

**Estimated Effort:** 2.25 days (API: 0.5d, DB: 0.5d, Tests: 1d, Review: 0.25d)

**Priority:** Must Have
```

## Best Practices

✅ Think vertical (UI → API → DB)  
✅ Prioritize user value early  
✅ Keep stories independent  
✅ Write clear acceptance criteria  
✅ Leverage AI for CRUD/tests/docs, human for design/review

## Anti-Patterns

❌ Stories spanning multiple sprints → ✅ Split into 1-3 day stories  
❌ Technical tasks → ✅ User-value focused stories  
❌ Vague criteria → ✅ Specific, testable outcomes  
❌ Tightly coupled stories → ✅ Independent, flexible ordering

````
