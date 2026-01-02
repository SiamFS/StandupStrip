# StandUpStrip — Technical Design Document

**Version:** 1.0  
**Date:** January 2026  
**Status:** Implementation Ready

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Browser    │  │   Mobile     │  │   API        │                  │
│  │   (Next.js)  │  │   (Future)   │  │   Clients    │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
└─────────┼─────────────────┼─────────────────┼──────────────────────────┘
          │                 │                 │
          └────────────────┬┴─────────────────┘
                           │ HTTPS/REST
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Spring Boot Application                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │   Security  │  │   CORS      │  │   Rate Limiter          │  │   │
│  │  │   Filter    │  │   Config    │  │   (Future)              │  │   │
│  │  └──────┬──────┘  └─────────────┘  └─────────────────────────┘  │   │
│  │         │                                                        │   │
│  │         ▼                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │                   REST Controllers                       │    │   │
│  │  │  Auth | Teams | Standups | Summaries | Users            │    │   │
│  │  └─────────────────────────┬───────────────────────────────┘    │   │
│  │                            │                                     │   │
│  │                            ▼                                     │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │                   Service Layer                          │    │   │
│  │  │  AuthService | TeamService | StandupService | AIService │    │   │
│  │  └─────────────────────────┬───────────────────────────────┘    │   │
│  │                            │                                     │   │
│  │              ┌─────────────┴─────────────┐                      │   │
│  │              ▼                           ▼                      │   │
│  │  ┌─────────────────────┐    ┌─────────────────────┐            │   │
│  │  │   JPA Repositories  │    │   External APIs     │            │   │
│  │  └──────────┬──────────┘    │   (Gemini AI)       │            │   │
│  │             │               └─────────────────────┘            │   │
│  └─────────────┼──────────────────────────────────────────────────┘   │
└────────────────┼──────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      PostgreSQL Database                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │ users   │ │ teams   │ │ team_   │ │standups │ │standup_ │   │   │
│  │  │         │ │         │ │ members │ │         │ │summaries│   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend | Next.js (App Router) | 15.x |
| Frontend Runtime | React | 19.x |
| Frontend Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.x |
| Form Handling | Formik + Yup | 2.x |
| Backend | Spring Boot | 4.0.x |
| Backend Language | Java | 21 |
| Security | Spring Security + JWT | - |
| ORM | Spring Data JPA + Hibernate | - |
| Database | PostgreSQL | 15+ |
| AI Provider | Google Gemini | 2.0 Flash |

---

## 2. Backend Architecture

### 2.1 Package Structure

```
com.standupstrip.backend/
├── BackendApplication.java          # Main entry point
│
├── config/
│   ├── SecurityConfig.java          # Spring Security configuration
│   ├── CorsConfig.java              # CORS settings
│   └── AIConfig.java                # Gemini API configuration
│
├── controller/
│   ├── AuthController.java          # POST /api/auth/*
│   ├── TeamController.java          # /api/teams/*
│   ├── StandupController.java       # /api/standups/*
│   ├── SummaryController.java       # /api/summaries/*
│   └── UserController.java          # /api/users/*
│
├── service/
│   ├── AuthService.java             # Authentication logic
│   ├── TeamService.java             # Team CRUD + membership
│   ├── StandupService.java          # Standup CRUD
│   ├── SummaryService.java          # Summary generation
│   ├── AIService.java               # Gemini integration
│   └── UserService.java             # User management
│
├── repository/
│   ├── UserRepository.java
│   ├── TeamRepository.java
│   ├── TeamMemberRepository.java
│   ├── StandupRepository.java
│   └── StandupSummaryRepository.java
│
├── entity/
│   ├── User.java
│   ├── Team.java
│   ├── TeamMember.java
│   ├── Standup.java
│   └── StandupSummary.java
│
├── dto/
│   ├── request/
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── CreateTeamRequest.java
│   │   ├── UpdateTeamRequest.java
│   │   ├── CreateStandupRequest.java
│   │   └── AddMemberRequest.java
│   └── response/
│       ├── AuthResponse.java
│       ├── UserResponse.java
│       ├── TeamResponse.java
│       ├── StandupResponse.java
│       └── SummaryResponse.java
│
├── security/
│   ├── JwtAuthenticationFilter.java
│   ├── JwtUtil.java
│   └── SecurityHelper.java
│
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── BadRequestException.java
│   └── UnauthorizedException.java
│
└── util/
    └── EntityMapper.java
```

### 2.2 Security Implementation

#### JWT Token Flow

```
┌──────────┐     1. POST /api/auth/login        ┌──────────────┐
│  Client  │ ─────────────────────────────────▶ │  AuthController│
└──────────┘   { email, password }              └───────┬──────┘
                                                        │
                                                        ▼
                                                ┌──────────────┐
                                                │  AuthService │
                                                │  - verify pw │
                                                │  - gen JWT   │
                                                └───────┬──────┘
                                                        │
     2. Response                                        │
┌──────────┐     { token, user }                        │
│  Client  │ ◀─────────────────────────────────────────┘
└──────────┘

     3. Subsequent requests
┌──────────┐     Authorization: Bearer <token>  ┌──────────────┐
│  Client  │ ─────────────────────────────────▶ │  JwtFilter   │
└──────────┘                                    │  - validate  │
                                                │  - extract   │
                                                │    userId    │
                                                └───────┬──────┘
                                                        │
                                                        ▼
                                                ┌──────────────┐
                                                │  Controller  │
                                                │  (protected) │
                                                └──────────────┘
```

#### Security Configuration

```java
// Endpoints security matrix
PublicEndpoints:
  - POST /api/auth/register
  - POST /api/auth/login
  - GET  /health
  - GET  /

ProtectedEndpoints (require valid JWT):
  - ALL  /api/teams/**
  - ALL  /api/standups/**
  - ALL  /api/summaries/**
  - ALL  /api/users/**
```

### 2.3 Database Schema

```sql
-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Teams table
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invite_code VARCHAR(8) UNIQUE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_owner ON teams(owner_user_id);
CREATE INDEX idx_teams_invite_code ON teams(invite_code);

-- Team members table
CREATE TABLE team_members (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Standups table
CREATE TABLE standups (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    yesterday_text TEXT NOT NULL,
    today_text TEXT NOT NULL,
    blockers_text TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, user_id, date)
);

CREATE INDEX idx_standups_team_date ON standups(team_id, date);
CREATE INDEX idx_standups_user ON standups(user_id);

-- Standup summaries table
CREATE TABLE standup_summaries (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    summary_text TEXT NOT NULL,
    generated_by_ai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, date)
);

CREATE INDEX idx_summaries_team_date ON standup_summaries(team_id, date);
```

---

## 3. Frontend Architecture

### 3.1 Directory Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout + AuthProvider
│   ├── page.tsx                  # Dashboard (/ route)
│   ├── globals.css               # Global styles
│   │
│   ├── login/
│   │   └── page.tsx              # Login form
│   │
│   ├── register/
│   │   └── page.tsx              # Registration form
│   │
│   ├── profile/
│   │   └── page.tsx              # User profile page
│   │
│   ├── join/
│   │   └── [code]/
│   │       └── page.tsx          # Join team via invite code
│   │
│   └── teams/
│       ├── page.tsx              # Teams list
│       └── [id]/
│           ├── page.tsx          # Team dashboard
│           └── settings/
│               └── page.tsx      # Team settings (owner only)
│
├── components/
│   ├── Layout.tsx                # Main app layout with sidebar
│   ├── StandupList.tsx           # Displays list of standups
│   ├── StandupCard.tsx           # Individual standup card
│   ├── CreateTeamModal.tsx       # Modal for creating team
│   ├── CreateStandupModal.tsx    # Modal for submitting standup
│   ├── EditStandupModal.tsx      # Modal for editing standup
│   ├── AddMemberModal.tsx        # Modal for adding member
│   ├── SummaryModal.tsx          # Modal for viewing summary
│   └── ui/                       # Reusable UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Textarea.tsx
│       └── Label.tsx
│
├── context/
│   └── AuthContext.tsx           # Authentication state
│
├── lib/
│   ├── api.ts                    # HTTP client wrapper
│   ├── endpoints.ts              # API endpoint constants
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # Utility functions
│
└── public/
    └── (static assets)
```

### 3.2 State Management

#### Authentication Context

```typescript
interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

// Persisted to localStorage:
// - token: JWT string
// - user: { id, name, email }
```

### 3.3 API Client

```typescript
class ApiClient {
    private static getToken(): string | null;
    
    private static async request<T>(
        endpoint: string, 
        options: RequestOptions
    ): Promise<T>;
    
    static get<T>(url: string): Promise<T>;
    static post<T>(url: string, body: any): Promise<T>;
    static put<T>(url: string, body: any): Promise<T>;
    static delete<T>(url: string): Promise<T>;
}
```

---

## 4. API Contract Specification

### 4.1 Authentication APIs

#### POST /api/auth/register

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | 1-255 chars |
| email | string | Yes | Valid email, unique |
| password | string | Yes | Min 8 chars |

**Response 201:**
```json
{
  "token": "eyJhbG...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- 400: Validation errors
- 409: Email already exists

---

#### POST /api/auth/login

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

**Response 200:** Same as register

**Errors:**
- 401: Invalid credentials

---

### 4.2 Team APIs

#### POST /api/teams

Creates a new team. Authenticated user becomes owner.

**Request:**
```json
{
  "name": "Engineering Team"
}
```

**Response 201:**
```json
{
  "id": 1,
  "name": "Engineering Team",
  "ownerUserId": 5,
  "inviteCode": "AB12CD34",
  "createdAt": "2026-01-02T10:00:00Z"
}
```

---

#### GET /api/teams

Returns all teams the authenticated user is a member of.

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Engineering Team",
    "ownerUserId": 5,
    "inviteCode": "AB12CD34",
    "createdAt": "2026-01-02T10:00:00Z"
  }
]
```

---

#### GET /api/teams/{id}

Returns team details.

**Response 200:** Single team object

**Errors:**
- 404: Team not found

---

#### GET /api/teams/{id}/members

Returns list of team members.

**Response 200:**
```json
[
  {
    "id": 5,
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

---

#### POST /api/teams/join/{code}

Joins a team using invite code. User must be authenticated.

**Response 201:** Empty (No Content)

**Errors:**
- 400: Already a member
- 404: Invalid invite code

---

#### DELETE /api/teams/{id}

Soft deletes a team. Only owner can delete.

**Response 204:** No Content

**Errors:**
- 403: Not owner
- 404: Team not found

---

### 4.3 Standup APIs

#### POST /api/standups/teams/{teamId}

Creates a standup for today.

**Request:**
```json
{
  "yesterdayText": "Completed API integration",
  "todayText": "Working on dashboard",
  "blockersText": "Need design review"
}
```

**Response 201:**
```json
{
  "id": 1,
  "teamId": 1,
  "userId": 5,
  "userName": "John Doe",
  "date": "2026-01-02",
  "yesterdayText": "Completed API integration",
  "todayText": "Working on dashboard",
  "blockersText": "Need design review",
  "createdAt": "2026-01-02T10:30:00Z"
}
```

**Errors:**
- 400: Already submitted today
- 403: Not a team member

---

#### GET /api/standups/teams/{teamId}?date=YYYY-MM-DD

Returns all standups for a team on a given date.

**Response 200:** Array of standup objects

---

#### PUT /api/standups/{id}

Updates a standup. Only owner, same day only.

**Response 200:** Updated standup object

**Errors:**
- 400: Cannot edit past standup
- 403: Not your standup

---

#### DELETE /api/standups/{id}

Deletes a standup. Only owner can delete.

**Response 204:** No Content

---

### 4.4 Summary APIs

#### POST /api/summaries/teams/{teamId}/generate?date=YYYY-MM-DD

Generates AI summary for the given date.

**Response 201:**
```json
{
  "id": 1,
  "teamId": 1,
  "date": "2026-01-02",
  "summaryText": "## Team Summary\n\n...",
  "generatedByAi": true,
  "createdAt": "2026-01-02T11:00:00Z"
}
```

**Errors:**
- 400: No standups to summarize

---

#### GET /api/summaries/teams/{teamId}?date=YYYY-MM-DD

Returns summary for the given date.

**Response 200:** Summary object or empty

---

## 5. AI Integration

### 5.1 Gemini API Integration

**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

**Prompt Template:**
```
You are an assistant that summarizes daily team standup updates.

Given the following standup submissions from team members, generate a concise summary with:
1. A brief overview (2-3 sentences)
2. Key themes/work areas organized by topic
3. Blockers that need attention, grouped by theme

Format the output in Markdown.

---
TEAM STANDUPS FOR {date}:

{for each standup:}
**{userName}**
- Yesterday: {yesterdayText}
- Today: {todayText}
- Blockers: {blockersText || "None"}

---

Generate the summary:
```

### 5.2 Fallback Strategy

When Gemini API is unavailable:

```
## Team Summary — {date}

### Overview
{count} team members submitted standups for today.

### Yesterday's Progress
{bulleted list of yesterday items}

### Today's Focus
{bulleted list of today items}

### Blockers
{bulleted list of blockers, or "No blockers reported"}
```

---

## 6. Error Handling

### 6.1 Error Response Format

All API errors return:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Descriptive error message",
  "timestamp": "2026-01-02T10:00:00Z"
}
```

### 6.2 Error Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| 400 | Bad Request | Validation errors, duplicate standup |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Not owner, not team member |
| 404 | Not Found | Invalid ID, deleted resource |
| 409 | Conflict | Email already exists |
| 500 | Server Error | Unexpected backend error |

---

## 7. Environment Configuration

### 7.1 Backend (.env)

```properties
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/standupstrip
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRATION=86400000

# AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
```

### 7.2 Frontend (.env.local)

```properties
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 8. Deployment Architecture

### 8.1 Recommended Setup

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Next.js Frontend                        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Railway / Render                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Spring Boot Backend (JAR)                  │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PostgreSQL Database                     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Testing Strategy

### 9.1 Backend Tests

```
tests/
├── unit/
│   ├── service/
│   │   ├── AuthServiceTest.java
│   │   ├── TeamServiceTest.java
│   │   └── StandupServiceTest.java
│   └── util/
│       └── JwtUtilTest.java
│
└── integration/
    ├── AuthControllerTest.java
    ├── TeamControllerTest.java
    └── StandupControllerTest.java
```

### 9.2 Frontend Tests

```
__tests__/
├── components/
│   ├── StandupCard.test.tsx
│   └── CreateTeamModal.test.tsx
│
└── pages/
    ├── login.test.tsx
    └── dashboard.test.tsx
```

---

## 10. Performance Considerations

| Area | Target | Implementation |
|------|--------|----------------|
| API Response | < 500ms | Database indexing, connection pooling |
| Page Load | < 2s | Next.js SSR, code splitting |
| AI Generation | < 10s | Timeout handling, loading states |
| Database Queries | < 100ms | Proper indexes, avoid N+1 |

---

**Document Status:** Ready for Implementation
