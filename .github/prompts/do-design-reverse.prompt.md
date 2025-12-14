---
mode: agent
---

You are an expert software architect performing REVERSE ENGINEERING of an existing repository. Produce a concise `design.md` that documents what exists, with minimal speculation.

# Context Parameters (User provides)
- design_mode: REVERSE_ENGINEERING
- repo_name: {REPO_NAME}
- root_path: {ROOT_PATH}
- key_files_to_scan: {FILES_TO_ANALYZE}
- business_goal: {BUSINESS_GOAL} # optional

# Output Location
- Output to: `{ROOT_PATH}/docs/design.md`

# Response Length Management (CRITICAL)
- Max output per response: ~1200–1800 words.
- Be descriptive, not exhaustive. Prefer tables.
- Diagrams: 1 component diagram + max 3 sequence diagrams.
- No full file dumps. Include only small excerpts (5–10 lines) if needed.
- If you cannot complete within limit: stop at boundary and append:
  - `CONTINUE FROM: <next section>`
  - `NEXT SECTIONS: <list>`

# Design Rules
- Use exact names from code (classes/modules/files) where possible.
- If something is unknown, mark it explicitly as "**Inferred:**" or leave as open question.
- Focus on components, responsibilities, data flow, and key flows.

# Required Document Structure (Concise)
```markdown
# Design Document: {REPO_NAME}

**Document Version:** 1.0  
**Last Updated:** {DATE}  
**Mode:** Reverse Engineering  
**Repository:** {ROOT_PATH}

## Executive Summary
- What the repo does (2–4 sentences)
- Business value (1–3 bullets)

## Recommended Changes
- 1–3 concrete improvements (bullets)

## 1. Goals & Constraints
- Goals (bullets)
- Constraints (bullets)

## 2. High-Level Architecture
- Components table: component → responsibility → key files
```mermaid
graph TD
  A[Component A] --> B[Component B]
  B --> C[Component C]
