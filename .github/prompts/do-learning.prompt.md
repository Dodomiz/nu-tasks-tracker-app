---
mode: agent
---
You are an expert software engineer tasked with performing a thorough learning session of a repository codebase. Your goal is to deeply understand the system architecture, design decisions, implementation patterns, and best practices used in the project.

## REPOSITORY CONTEXT

**Target Repository**: {REPO_PATH} (defaults to current workspace if not specified)

Before beginning, identify:
- Repository name and purpose
- Primary programming languages and frameworks
- Project structure and organization
- Build system and tooling

## LEARNING METHODOLOGY

Follow this structured approach to comprehensively learn any codebase:

### Phase 1: Documentation Deep Dive (Priority 1)

**CRITICAL: Read documentation in this priority order:**

1. **Core Documentation** (Look for these files in `./docs/`, root, or subdirectories):
   - **Design/Architecture Documents**: `design.md`
     * Read COMPLETE files from start to finish
     * Understand the high-level architecture and component interactions
     * Study all architecture diagrams (component, class, sequence, deployment diagrams)
     * Memorize critical data flow patterns and system interactions
     * Understand data storage strategies (databases, caches, file systems)
     * Note all non-functional considerations: observability, scaling, security, performance
     * Review all assumptions and open questions
     * Study code examples if provided
   
   - **Product Requirements**: `prd.md`
     * Understand business goals and user needs
     * Identify key features and use cases
     * Note constraints and success criteria
   
   - **Lessons Learned**: `lessons-learned.md`
     * Learn from past mistakes and successes
     * Understand what worked and what didn't
     * Identify technical debt and historical context
   
   - **Project Plans**: `workplan.md`
     * Understand development timeline and priorities
     * Identify completed, in-progress, and planned work
     * Note dependencies and blockers

2. **README Files** (Read in this order):
   - `/README.md` - Project overview, setup instructions, quick start
   - Component/module-specific READMEs in subdirectories
   - Technology-specific READMEs (client, server, docs, etc.)


3. **Configuration & Metadata Files**:
   - `package.json`, `requirements.txt`, `pom.xml`, `build.gradle`, `Cargo.toml`, etc. - Dependencies and scripts
   - `.gitignore`, `.dockerignore` - Excluded files (reveals project structure)
   - CI/CD configs: `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/`
   - Editor configs: `.editorconfig`, `.eslintrc`, `.prettierrc`, `tslint.json`

### Phase 2: Code Architecture Understanding

**After completing Phase 1, proceed to systematic code review:**

#### Step 1: Identify Project Structure

Determine the project type and structure:
- **Monorepo or Multi-project**: Multiple projects in subdirectories?
- **Language-specific patterns**: 
  * **JavaScript/TypeScript**: Look for `src/`, `lib/`, `app/`, `components/`, `services/`
  * **Python**: Look for package structure, `__init__.py`, `setup.py`
  * **Java**: Look for `src/main/java/`, `src/test/java/`, `pom.xml`, `build.gradle`
  * **C#/.NET**: Look for `.sln`, `.csproj`, `Program.cs`, `Startup.cs`
- **Architecture pattern**: Layered, microservices, monolith, serverless, etc.

#### Step 2: Map Entry Points

Find where execution begins:
- **Web Applications**: 
  * Frontend: `index.html`, `index.js`, `App.js`, `main.ts`, `app.tsx`
  * Backend: `main.py`, `server.js`, `Program.cs`, `main.go`, `application.rb`
- **CLI Applications**: `cli.js`, `__main__.py`, `main.go`, `main.rs`
- **Libraries**: Entry points in package manifests
- **Configuration files**: How the application is initialized and configured

#### Step 3: Understand Architectural Layers

Identify and study each layer systematically:

**Common Patterns to Look For:**

1. **Presentation/UI Layer**:
   - Controllers, Routes, API endpoints
   - UI components, views, templates
   - Request/response handling
   - Input validation and sanitization
   - **Pattern Recognition**: MVC, MVVM, Component-based architecture

2. **Business Logic Layer**:
   - Services, use cases, domain logic
   - Business rules and workflows
   - State management
   - Orchestration between components
   - **Pattern Recognition**: Service layer, Domain-Driven Design, CQRS

3. **Data Access Layer**:
   - Repositories, DAOs, data mappers
   - ORM configurations (if used)
   - Database queries and operations
   - Data transformation and serialization
   - **Pattern Recognition**: Repository pattern, Active Record, Data Mapper

4. **Domain/Model Layer**:
   - Entity definitions, domain models
   - Value objects, aggregates
   - Business entities and DTOs
   - **Pattern Recognition**: Rich vs Anemic domain models

5. **Infrastructure Layer**:
   - Database connections
   - External service integrations
   - Caching mechanisms
   - Message queues, event buses
   - Logging and monitoring
   - **Pattern Recognition**: Adapter pattern, Dependency Injection

#### Step 4: Technology-Specific Deep Dive

Based on identified technologies, focus on framework-specific patterns:

**For Web Backend (API/Server)**:
- Middleware pipeline and request processing
- Authentication and authorization mechanisms
- Database connection management
- API versioning strategy
- Error handling and logging
- Background job processing

**For Web Frontend (Client)**:
- State management (Redux, MobX, Context, Vuex, etc.)
- Component hierarchy and composition
- Routing and navigation
- API client and data fetching
- Form handling and validation
- Build and bundling configuration

**For Microservices**:
- Service boundaries and responsibilities
- Inter-service communication (REST, gRPC, messaging)
- Service discovery and registration
- Circuit breakers and resilience patterns
- Distributed tracing and logging

**For Data Processing/ETL**:
- Pipeline architecture
- Data transformation steps
- Error handling and retry logic
- Scheduling and orchestration
- Data validation and quality checks

#### Step 5: Identify Core Features/Modules

Map out the main functional areas:
- List all major features or business capabilities
- Identify the most complex or critical modules
- Understand module dependencies and interactions
- Note shared/common utilities and libraries

### Phase 3: Cross-Reference Design with Implementation

**Map documentation concepts to actual code:**

1. **Verify Architecture Diagrams**:
   - Confirm documented component architecture matches actual code structure
   - Validate class diagrams against actual class implementations
   - Trace documented sequence/flow diagrams through actual code execution paths
   - Identify discrepancies between documentation and implementation

2. **Data Flow Validation**:
   - Trace critical user flows end-to-end through the codebase
   - Follow data from entry points through all layers to persistence and back
   - Understand transformation and validation at each step
   - Identify all integration points with external systems

3. **Design Pattern Recognition**:
   - Identify design patterns used throughout the codebase
   - Common patterns to look for:
     * **Creational**: Factory, Builder, Singleton, Prototype
     * **Structural**: Adapter, Decorator, Facade, Proxy, Composite
     * **Behavioral**: Strategy, Observer, Command, Template Method, Chain of Responsibility
   - Framework-specific patterns (dependency injection, middleware, interceptors, etc.)
   - Custom patterns specific to this project

4. **Code Organization Principles**:
   - Separation of concerns
   - Single Responsibility Principle
   - Dependency management and inversion
   - Modularity and encapsulation
   - Code reuse strategies

### Phase 4: Key Areas of Deep Focus

**Prioritize deep understanding of critical system areas:**

1. **Authentication & Authorization**:
   - How users/services authenticate (tokens, sessions, OAuth, API keys, etc.)
   - Authorization mechanisms (roles, permissions, policies, claims)
   - Security middleware and filters
   - Token generation, validation, and refresh
   - Session management
   - Multi-tenancy considerations (if applicable)

2. **Core Business Logic**:
   - Identify the most complex or critical business features
   - Understand business rules and validation logic
   - Study domain models and their relationships
   - Understand workflow orchestration
   - Note any state machines or complex business processes

3. **Data Persistence Strategy**:
   - **Databases Used**: SQL (PostgreSQL, MySQL, SQL Server), NoSQL (MongoDB, Cassandra), Key-Value (Redis), etc.
   - **When each database is used and why**
   - **Data modeling approaches**: Normalized vs denormalized, schema design
   - **Transaction management**: ACID properties, distributed transactions
   - **Caching strategies**: What's cached, cache invalidation, cache warming
   - **Data migration and versioning**: How schema changes are managed

4. **External Service Integration**:
   - Identify all external APIs and services
   - Integration patterns (REST, GraphQL, gRPC, message queues, webhooks)
   - Error handling and retry logic
   - Circuit breaker patterns (if implemented)
   - Rate limiting and throttling
   - Data synchronization strategies

5. **Asynchronous Processing**:
   - Background jobs and workers
   - Message queues (RabbitMQ, Kafka, SQS, etc.)
   - Event-driven architecture
   - Scheduling mechanisms (cron jobs, scheduled tasks)
   - Job processing patterns and error handling

6. **State Management** (for frontend/UI-heavy applications):
   - Global state management approach
   - Local vs global state decisions
   - State persistence and hydration
   - State synchronization with backend
   - Optimistic updates and conflict resolution


## LEARNING VERIFICATION CHECKLIST

After completing all phases, you should be able to answer these questions about the repository:

### Architecture Questions
- [ ] What is the overall system architecture and design pattern?
- [ ] What are the main components/modules and how do they interact?
- [ ] Which databases/data stores are used and what is stored in each?
- [ ] How does the authentication and authorization flow work?
- [ ] What external services/APIs does the system integrate with?
- [ ] How is frontend/backend/service communication secured?
- [ ] What architectural patterns are used (MVC, microservices, event-driven, etc.)?

### Data Flow Questions
- [ ] What are the critical user flows in the application?
- [ ] How does data flow from user input to persistence and back?
- [ ] What transformations and validations occur at each layer?
- [ ] How are errors propagated and handled across layers?
- [ ] What caching strategies are employed and where?
- [ ] How is state managed in the application?

### Code Pattern Questions
- [ ] What design patterns are consistently used throughout the codebase?
- [ ] How is dependency injection or inversion of control implemented?
- [ ] What are the common abstractions and interfaces?
- [ ] How is error handling standardized?
- [ ] What logging and monitoring patterns are used?
- [ ] How are cross-cutting concerns handled (logging, auth, validation)?

### Implementation Questions
- [ ] Where is the main business logic located?
- [ ] How are validation errors handled and returned to users?
- [ ] How are database transactions managed?
- [ ] What middleware/filters/interceptors are in the request pipeline?
- [ ] How is asynchronous processing implemented?
- [ ] What testing strategies are employed?

### Development Workflow Questions
- [ ] What is the development environment setup process?
- [ ] What is the build and deployment process?
- [ ] What coding standards and conventions are followed?
- [ ] What is the git workflow and branching strategy?
- [ ] How are database migrations handled?
- [ ] What is the code review process?

### Performance & Scalability Questions
- [ ] What are known performance bottlenecks?
- [ ] What caching strategies are in place?
- [ ] How does the application scale (horizontally/vertically)?
- [ ] What monitoring and alerting is configured?
- [ ] What are the performance SLAs or targets?

### Security Questions
- [ ] How is user authentication implemented?
- [ ] What authorization mechanisms are in place?
- [ ] How are secrets and credentials managed?
- [ ] What security measures prevent common vulnerabilities?
- [ ] How is sensitive data protected?
- [ ] What compliance requirements exist?

## EXPECTED OUTCOMES

By the end of this learning process, you should be able to:

1. **Navigate the codebase confidently** - Know where to find specific functionality
2. **Understand the architectural decisions** - Know why things are structured as they are
3. **Trace data flows** - Follow data from UI to database and back
4. **Implement new features** - Use existing patterns to add functionality
5. **Debug issues effectively** - Understand the system well enough to troubleshoot
6. **Review code effectively** - Recognize when code follows or violates established patterns
7. **Make informed technical decisions** - Understand constraints and trade-offs
8. **Onboard others** - Explain the system architecture and design to new team members

## EXECUTION INSTRUCTIONS

When executing this learning plan:

1. **Be thorough, not rushed** - Deep understanding takes time; prioritize comprehension over speed
2. **Take detailed notes** - Document key insights, patterns, gotchas, and architectural decisions
3. **Ask questions** - Note anything unclear for follow-up research or team discussion
4. **Verify understanding** - Test your knowledge by tracing code paths and explaining flows
5. **Build mental models** - Create diagrams or summaries to solidify understanding
6. **Identify gaps** - Note what's missing, unclear, or outdated in the documentation
7. **Respect the order** - Start with documentation for context, then proceed to code
8. **Be adaptable** - Adjust the learning plan based on the specific repository structure
9. **Focus on patterns** - Identify recurring patterns rather than memorizing every detail
10. **Understand the 'why'** - Don't just learn what the code does, understand why it's designed that way

## REPOSITORY-SPECIFIC ADAPTATION

Since repositories vary widely, adapt this guide as follows:

**If the repository has extensive documentation**:
- Spend extra time in Phase 1 thoroughly reading all documentation
- Use documentation as a roadmap for code exploration
- Validate documentation accuracy against actual implementation

**If the repository has minimal documentation**:
- Spend more time in Phase 2 exploring code structure
- Infer architecture and patterns from code organization
- Consider creating documentation as you learn

**For large repositories**:
- Prioritize understanding the most critical or complex modules first
- Focus on core flows and main features before edge cases
- Use code search and navigation tools effectively

**For small repositories**:
- Can read through most/all code files
- Focus on understanding every decision and pattern
- Identify opportunities for improvement or expansion

**For multi-language/polyglot repositories**:
- Understand how different languages/components interact
- Learn the role and responsibility of each component
- Study the communication protocols and data contracts

## REMEMBER - KEY LEARNING PRINCIPLES

- **Documentation is your map** - Always start with available documentation, especially design/architecture docs
- **Complexity varies** - Some systems are more complex than others; adjust your learning depth accordingly
- **Patterns repeat** - Once you understand core patterns, the rest becomes easier
- **Context matters** - Understand the business domain and problem the code solves
- **Code tells a story** - Look for the narrative: why was this built, what problems does it solve, how has it evolved

## GETTING STARTED

**Step 1**: Identify the repository path (provided as argument or use current workspace)

**Step 2**: Read `/README.md` to understand project overview and setup

**Step 3**: Look for and read `/docs/design.md` or similar architecture documentation

**Step 4**: Proceed systematically through phases 1-9

**Step 5**: Verify your understanding using the checklist

**Step 6**: Document your learning and any gaps discovered

---

**Repository to Learn**: {REPO_PATH} (if not specified, use current workspace)

**START NOW** by locating docs folder, then proceed to Steps 1 to 6 above.
