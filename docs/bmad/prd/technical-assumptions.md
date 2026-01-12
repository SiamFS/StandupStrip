# Technical Assumptions

### Repository Structure

**Monorepo** — Single repository with `frontend/` and `backend/` directories

- Shared documentation in `docs/`
- Separate deployment pipelines for frontend and backend
- Git-based version control with feature branch workflow

### Service Architecture

**Monolith Architecture** — Single Spring Boot backend, single Next.js frontend

- Backend: RESTful API with layered architecture (Controller → Service → Repository)
- Frontend: Next.js App Router with React Server Components
- Database: Single PostgreSQL instance (normalized relational schema)
- AI Service: External Google Gemini API integration (abstracted via service interface)

**Rationale:** MVP scope doesn't justify microservices complexity; monolith enables faster development and simpler deployment.

### Testing Requirements

**Unit + Integration Testing**

- Backend: JUnit 5 for unit tests, Spring Boot Test for integration tests
- Frontend: Jest + React Testing Library for component tests
- API Testing: Postman collection for manual testing
- E2E Testing: Planned for Phase 2 (Playwright/Cypress)

**Rationale:** Unit and integration tests provide sufficient coverage for MVP; E2E tests deferred to reduce initial complexity.

### Additional Technical Assumptions and Requests

- **Java 21** required for backend (trainee skill development requirement)
- **Next.js 15** with App Router (modern React patterns, SSR capability)
- **PostgreSQL 15+** for database (ACID compliance, JSON support, free tier availability)
- **JWT Authentication** (stateless, horizontally scalable)
- **Google Gemini 2.0 Flash** for AI (cost-effective at <$0.01/summary, fast response)
- **Vercel** for frontend hosting (automatic deployments, edge network)
- **Railway/Render** for backend hosting (free tier, containerized deployment)
- **Neon DB** for production PostgreSQL (managed, free tier)
- **Gmail SMTP** for MVP email (free), **Resend** for production (better deliverability)
- **Environment Variables** for configuration (`.env` local, platform env vars production)
- **No Slack/Workspace Integration** for MVP (intentional simplification)

---
