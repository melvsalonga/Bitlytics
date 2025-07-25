# Enhanced Project Management & Development Rules

## Project Initialization Protocol

When starting a new project, ALWAYS follow this initialization sequence:

### 1. Project Documentation Foundation
Create the three core documentation files in this exact order:

#### A. requirements.md - User Stories & Acceptance Criteria
```markdown
# Requirements Document

## Introduction
[Brief project description, purpose, and goals]

## Requirements

### Requirement 1
**User Story:** As a [user type], I want [functionality], so that [benefit/value].

#### Acceptance Criteria
1. WHEN [condition] THEN the system SHALL [expected behavior]
2. WHEN [condition] THEN the system SHALL [expected behavior]
3. WHEN [condition] THEN the system SHALL [expected behavior]
4. WHEN [condition] THEN the system SHALL [expected behavior]
5. WHEN [condition] THEN the system SHALL [expected behavior]

[Continue for all requirements...]
```

#### B. design.md - System Architecture & Technical Specifications
```markdown
# [Project Name] System Design Document

## Overview
[Comprehensive project description with architecture overview]

## Architecture

### High-Level Architecture
```mermaid
graph TB
    [Create detailed system architecture diagram]
```

### Technology Stack
- **Frontend**: [Framework and version]
- **Backend**: [Framework and version]  
- **Database**: [Database system and ORM]
- **Authentication**: [Auth system]
- **Deployment**: [Deployment platform]
- **Styling**: [CSS framework]

### System Architecture Patterns
- [List architectural patterns being used]

## Components and Interfaces

### Core Components

#### 1. [Component Name]
```typescript
interface [ComponentInterface] {
  [Define all interfaces and types]
}
```

### API Endpoints Structure
#### [Category] Endpoints
- `[METHOD] /api/[route]` - [Description]

## Data Models

### Database Schema
```prisma
[Complete Prisma schema or equivalent]
```

## Error Handling

### Error Response Structure
```typescript
[Define error handling interfaces and patterns]
```

## Performance Considerations
[Performance optimization strategies]

## Security Considerations
[Security measures and best practices]

## Testing Strategy
[Comprehensive testing approach]

## Monitoring and Analytics
[Monitoring and analytics implementation]
```

#### C. tasks.md - Implementation Roadmap & Progress Tracking
```markdown
# Implementation Plan

## 📊 Progress Overview
- ✅ **Completed**: 0 tasks fully done
- 🟡 **In Progress**: 0 tasks
- ⏳ **Pending**: [X] tasks remaining
- **Total Progress**: 0% complete

## 📋 Implementation Tasks

- [ ] 1. **Project Setup**
   - [List specific setup tasks]
   - _Requirements: [Reference requirement numbers]_
   - _Status: ⏳ Not started_

- [ ] 2. **[Component Name]**
   - [List specific implementation tasks]
   - _Requirements: [Reference requirement numbers]_
   - _Status: ⏳ Not started_

[Continue for all major components...]

## Task Status Definitions
- ⏳ Todo: Task identified but not started
- 🟡 In Progress: Currently being worked on
- 🔴 Blocked: Cannot proceed due to dependency or issue
- 🧪 Testing: Implementation complete, under testing
- 👀 Review: Ready for code review
- ✅ Done: Completed and verified
- ⏸️ Deferred: Postponed to future iteration
```

### 2. Project Structure Guidelines

#### Directory Structure
```
project-name/
├── docs/
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
├── src/
├── tests/
├── README.md
└── .env.example
```

#### README.md Template
```markdown
# [Project Name]

[Brief description]

## Features
- [List key features]

## Tech Stack
- [List technologies]

## Getting Started
[Setup instructions]

## Documentation
- [requirements.md](docs/requirements.md) - Project requirements and user stories
- [design.md](docs/design.md) - System architecture and technical design
- [tasks.md](docs/tasks.md) - Implementation roadmap and progress tracking

## Contributing
[Contribution guidelines]
```

## Enhanced Project Management & Tracking Rules

### Pre-Implementation Phase
1. **Always read project documentation first:**
   - Review requirements.md for project specifications and constraints
   - Check design.md for architecture decisions and design patterns
   - Examine tasks.md for current task status and dependencies

2. **Validate understanding:**
   - Ensure clear understanding of user stories and acceptance criteria
   - Verify alignment with architectural decisions
   - Identify task dependencies and prerequisites

### Implementation Phase
1. **Update task tracking:**
   - Mark task status as "🟡 In Progress" 
   - Add timestamp and detailed status updates
   - Document any blockers or dependencies discovered

2. **Follow established patterns:**
   - Ensure new code aligns with existing architecture
   - Follow established naming conventions and patterns
   - Respect design decisions documented in design.md

### Post-Implementation Phase
1. **Complete task documentation:**
   - Mark completed tasks as "✅ Done" with completion timestamp
   - Add new tasks discovered during implementation
   - Update task status and progress overview

2. **Update project documentation:**
   - Document any changes to original requirements or design
   - Update design.md when making architectural changes
   - Add new requirements to requirements.md if scope changes

## Code Generation Standards

### Quality Requirements
- Always write clean, readable code with meaningful variable names
- Include comprehensive error handling with try-catch blocks
- Add inline comments explaining complex logic and business rules
- Follow language-specific conventions and style guides
- Generate unit tests for all new functions and methods
- Never hardcode sensitive data (API keys, passwords, tokens)
- Verify code meets requirements specified in project documentation

### Documentation Standards
- Generate clear README sections for new features
- Include usage examples and code samples
- Document API endpoints with parameters and responses
- Explain configuration options and environment variables
- Update inline documentation when modifying existing code
- Keep project docs synchronized with implementation changes

### Testing Requirements
- Create unit tests using appropriate testing frameworks
- Test both success and failure scenarios
- Include edge cases (null, empty, boundary values)
- Generate integration tests for API endpoints
- Use descriptive test names that explain the scenario
- Mock external dependencies in tests
- Verify tests cover requirements outlined in project documentation

## Security Requirements

- Validate and sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization checks
- Avoid deprecated or insecure libraries and methods
- Include HTTPS and secure configuration by default
- Log security events appropriately
- Cross-reference security requirements from requirements.md

## Error Handling Standards

- Always include appropriate error handling for operations that might fail
- Provide meaningful error messages for debugging
- Log errors with sufficient context
- Don't suppress errors without explicit justification
- Use language-specific error handling patterns
- Handle edge cases identified in requirements documentation

## Performance Guidelines

- Use appropriate data structures and algorithms
- Consider memory usage and resource management
- Avoid premature optimization
- Profile before making performance changes
- Use async/await patterns where appropriate
- Meet performance requirements specified in project docs

## Task Management Workflow

### Implementation Lifecycle
1. **Pre-Implementation:**
   - Read and understand current task from tasks.md
   - Review related requirements in requirements.md
   - Check design constraints in design.md
   - Identify dependencies and prerequisites

2. **During Implementation:**
   - Update task status to "🟡 In Progress"
   - Follow established coding standards
   - Implement according to design specifications
   - Write tests that verify requirements

3. **Post-Implementation:**
   - Update task status to "✅ Done" with completion timestamp
   - Document any deviations from original plan
   - Add new tasks if additional work is discovered
   - Update relevant documentation files

## Response Format Protocol

### Structure Requirements
1. **Start with context:** Reference relevant requirements and design decisions
2. **Explain reasoning:** Provide architectural decision rationale
3. **Offer alternatives:** Provide multiple approaches when alternatives exist
4. **Implementation guidance:** Include step-by-step implementation guidance
5. **Risk assessment:** Highlight potential gotchas or edge cases
6. **Tool recommendations:** Suggest relevant tools or libraries when helpful
7. **Task updates:** Specify what tasks were completed and what's next

### Language-Specific Standards
- **Python:** Follow PEP 8, use type hints, include docstrings
- **JavaScript/TypeScript:** Use ESLint rules, prefer const/let, include types
- **Java:** Follow Java conventions, use proper exception handling
- **C#:** Follow Microsoft conventions, use proper disposal patterns
- **Go:** Follow Go conventions, handle errors explicitly

## Quality Assurance Checklist

Before suggesting code, ensure it:
- ✅ Aligns with requirements in requirements.md
- ✅ Follows design patterns in design.md
- ✅ Addresses the specific task from tasks.md
- ✅ Compiles without warnings
- ✅ Includes proper error handling
- ✅ Has no obvious security vulnerabilities
- ✅ Follows established project conventions
- ✅ Includes relevant tests
- ✅ Is documented appropriately
- ✅ Updates task tracking appropriately

## Prohibited Actions

- Never generate code with hardcoded credentials
- Don't create code that executes unvalidated user input
- Avoid suggesting deprecated or insecure patterns
- Don't ignore error conditions or fail silently
- Never generate code that exposes sensitive system information
- Don't proceed without understanding project context from documentation files

## Communication Protocol

- Always explain what you're implementing
- Explain why based on requirements and design
- Identify what tasks are being updated
- Highlight any risks or concerns
- Suggest next steps for project progression
- Maintain professional and helpful tone
- Provide actionable recommendations
- Reference documentation appropriately
