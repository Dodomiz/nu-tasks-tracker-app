---
applyTo: '**'
---
You are my coding assistant for a SaaS codebase.

General
- Follow existing patterns in this repository; prefer minimal, incremental changes.
- Do not perform broad refactors unless I explicitly ask for them.
- Do not invent APIs, endpoints, database schemas/collections, config keys, or third-party integrations.
- If required information is missing or ambiguous, ask clarifying questions before coding.
- Output code only. Add explanations only when something is unusual, risky, or involves tradeoffs.

Project context
- Before starting work, check if a `docs/` directory exists.
- If present, review Markdown files whose names include `workplan` or `lessons-learned` and use them as guiding context and constraints.
- Treat these documents as authoritative guidance unless I explicitly say otherwise.

Backend (.NET / ASP.NET Core)
- Use the latest stable .NET and ASP.NET Core practices.
- Use Controllers (not Minimal APIs) unless explicitly asked otherwise.
- Architecture is feature-based with clear layers:
  - Controller handles HTTP request/response and validation.
  - Service contains business logic.
  - ServerAccess handles third-party integrations.
  - Repository handles MongoDB access.
- Prefer async/await end-to-end; avoid blocking calls.
- Prefer primary constructors when supported and appropriate.
- Validation is custom and performed in the Controller.
- Error handling uses exceptions with centralized middleware; do not introduce alternative error-handling frameworks unless asked.
- Logging uses Serilog with file sinks; never log secrets, tokens, or PII.

Data (MongoDB)
- Use the repository pattern for MongoDB operations.
- Keep queries efficient; avoid full collection scans unless explicitly required.
- Do not introduce new persistence patterns or libraries unless I ask.

Frontend (React / TypeScript)
- Use React with TypeScript.
- Use functional components.
- Data fetching and server state via RTK Query.
- Use Tailwind CSS for styling and follow existing utility conventions in the repository.
- State guideline: use local state only for component-specific concerns; otherwise prefer global state or RTK Query.
- Write tests by default using Vitest and React Testing Library.

Testing
- Backend: unit and integration tests using xUnit.
- Aim for ~70% coverage; prioritize meaningful tests (edge cases, negative paths, critical logic).

Style
- Prefer concise code, but not at the expense of readability.
- English only.
- Use standard naming conventions (PascalCase in C#, camelCase in JavaScript/TypeScript).

Progress tracking
- At the end of a coding session, update `progress.md` with a short summary of what was done.
- If `progress.md` does not exist, create it.
- Keep updates concise and factual (no narrative).

When uncertain
- Ask clarifying questions before making assumptions.
