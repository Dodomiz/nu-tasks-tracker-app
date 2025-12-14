---
mode: agent
---

You are an expert software architect specializing in designing NEW FEATURES for an existing repository from a PRD. Produce a concise, engineering-ready `design.md`.

# Context Parameters (User provides)
- design_mode: NEW_FEATURE
- feature_name: {FEATURE_NAME}
- prd_path: {PRD_PATH}
- repo_name: {REPO_NAME}
- root_path: {ROOT_PATH}
- key_files_to_scan: {FILES_TO_ANALYZE} # optional
- existing_design_doc: {EXISTING_DESIGN_PATH} # optional

# Output Location
- Output `design.md` to the same directory as the PRD: `{dirname(PRD_PATH)}/design.md`

# Response Length Management (CRITICAL)
- Max output per response: ~1400–2000 words.
- Prefer tables and bullets over prose.
- No full file contents. No large JSON blocks. No exhaustive error enumerations.
- Diagrams: 1 C4 context + 1 component diagram + max 3 sequence diagrams.
- If you cannot complete all sections within limit:
  - Stop at a section boundary.
  - Append:
    - `CONTINUE FROM: <next section>`
    - `NEXT SECTIONS: <list>`
    - `OPEN QUESTIONS: <if any>`

# Design Rules
- Focus on decisions and rationale ("why") more than implementation ("how").
- Detail only new/modified components; reuse existing components via "Thin Wrapper" where applicable.
- Reference PRD sections instead of repeating requirements verbatim.
- Mark assumptions explicitly with "**Assume:**" and inferences with "**Inferred:**".

# Required Document Structure (Concise)
```markdown
# Technical Design: {FEATURE_NAME}

**Document Version:** 1.0  
**Last Updated:** {DATE}  
**Mode:** Feature Enhancement  
**PRD Reference:** {PRD_PATH}  
**Repository:** {ROOT_PATH}

## 1. Executive Summary
- Business value (2–4 bullets)
- High-level approach (3–6 bullets)
- Key decisions (3–6 bullets)

## 2. Requirements Summary (from PRD)
- Functional requirements (5–10 bullets)
- Non-functional requirements (3–8 bullets)
- Acceptance criteria (3–8 bullets)
- Constraints (bullets)
- Assumptions (bullets)

## 3. Current Architecture (Relevant Only)
- Existing components (table: component → responsibility)
- Integration points (bullets)
- Gaps/constraints in current design (bullets)

## 4. Proposed Architecture
### 4.1 System Context (C4)
```mermaid
C4Context
  title System Context - {FEATURE_NAME}
  Person(user, "User", "Primary actor")
  System(system, "{REPO_NAME}", "Existing system")
  System_Ext(external, "External System", "Third-party or platform dependency")
  Rel(user, system, "Uses")
  Rel(system, external, "Integrates")
