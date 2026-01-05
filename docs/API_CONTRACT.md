# StandUpStrip — API Contract Documentation

**Version:** 1.0  
**Base URL:** `http://localhost:8080`  
**Authentication:** Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Teams](#3-teams)
4. [Standups](#4-standups)
5. [Summaries](#5-summaries)
6. [Statistics](#6-statistics)
7. [Error Responses](#7-error-responses)

---

## 1. Authentication

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 1-255 characters |
| email | string | Yes | Valid email format, unique |
| password | string | Yes | Minimum 8 characters |

**Success Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Validation error (invalid email, short password) |
| 409 | Email already registered |

---

### POST /api/auth/login

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 | Invalid email or password |

---

### GET /api/auth/verify

Verify user email address using token from email link.

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| token | string | Yes |

**Success Response (200 OK):**
```
Email verified successfully. You can now login.
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid or expired token |

---

### POST /api/auth/forgot-password

Initiate password reset. Sends reset email if user exists.

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| email | string | Yes |

**Success Response (200 OK):** Empty body (always returns 200 for security)

---

### POST /api/auth/reset-password

Reset password using token from email link.

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| token | string | Yes |
| password | string | Yes |

**Success Response (200 OK):** Empty body

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid or expired token |

---

### POST /api/auth/resend-verification

Resend verification email to current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```
Verification email sent successfully.
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 | Not authenticated |
| 400 | Email already verified |

---

### POST /api/auth/verify-password

Verify current user's password (used for sensitive operations like team deletion).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "password": "currentPassword123"
}
```

**Success Response (200 OK):** Empty body

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 | Invalid password |

---

## 2. Users

### GET /api/users/{id}

Get user profile by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid token |
| 404 | User not found |

---

### PUT /api/users/{id}

Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated"
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Updated",
  "email": "john@example.com"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid token |
| 403 | Cannot update other user's profile |
| 404 | User not found |

---

## 3. Teams

### POST /api/teams

Create a new team. Authenticated user becomes owner.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Engineering Team"
}
```

**Success Response (201 Created):**
```json
{
  "id": 1,
  "name": "Engineering Team",
  "ownerUserId": 1,
  "inviteCode": "AB12CD34",
  "createdAt": "2026-01-02T10:00:00Z"
}
```

---

### GET /api/teams

Get all teams the authenticated user is a member of.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Engineering Team",
    "ownerUserId": 1,
    "inviteCode": "AB12CD34",
    "createdAt": "2026-01-02T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Design Team",
    "ownerUserId": 5,
    "inviteCode": "XY99ZZ11",
    "createdAt": "2026-01-01T08:00:00Z"
  }
]
```

---

### GET /api/teams/{id}

Get team details by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Engineering Team",
  "ownerUserId": 1,
  "inviteCode": "AB12CD34",
  "createdAt": "2026-01-02T10:00:00Z"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 404 | Team not found or deleted |

---

### PUT /api/teams/{id}

Update team details. Only owner can update.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Team Name"
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Updated Team Name",
  "ownerUserId": 1,
  "inviteCode": "AB12CD34",
  "createdAt": "2026-01-02T10:00:00Z"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 403 | Not team owner |
| 404 | Team not found |

---

### DELETE /api/teams/{id}

Soft delete a team. Only owner can delete.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (204 No Content)**

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 403 | Not team owner |
| 404 | Team not found |

---

### GET /api/teams/{id}/members

Get all members of a team.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  {
    "id": 5,
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
]
```

---

### POST /api/teams/{id}/members

Add a member to team by email. Only owner can add.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "MEMBER"
}
```

**Success Response (201 Created):** Empty body

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | User already a member |
| 403 | Not team owner |
| 404 | User not found with email |

---

### DELETE /api/teams/{id}/members/{userId}

Remove a member from team. Only owner can remove.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (204 No Content)**

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Cannot remove owner |
| 403 | Not team owner |
| 404 | Member not found |

---

### GET /api/teams/join/{code}

Preview team before joining.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Engineering Team",
  "ownerUserId": 1,
  "inviteCode": "AB12CD34",
  "createdAt": "2026-01-02T10:00:00Z"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 404 | Invalid invite code |

---

### POST /api/teams/join/{code}

Join a team using invite code.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (201 Created):** Empty body

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Already a member |
| 404 | Invalid invite code |

---

## 4. Standups

### POST /api/standups/teams/{teamId}

Submit a daily standup. One per user per team per day.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "yesterdayText": "Completed API integration and wrote tests",
  "todayText": "Working on dashboard UI components",
  "blockersText": "Waiting for design review"
}
```

**Field Validation:**
| Field | Type | Required | Max Length |
|-------|------|----------|------------|
| yesterdayText | string | Yes | 2000 chars |
| todayText | string | Yes | 2000 chars |
| blockersText | string | No | 1000 chars |

**Success Response (201 Created):**
```json
{
  "id": 1,
  "teamId": 1,
  "userId": 1,
  "userName": "John Doe",
  "date": "2026-01-02",
  "yesterdayText": "Completed API integration and wrote tests",
  "todayText": "Working on dashboard UI components",
  "blockersText": "Waiting for design review",
  "createdAt": "2026-01-02T10:30:00Z"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Already submitted today |
| 403 | Not a team member |

---

### GET /api/standups/teams/{teamId}?date=YYYY-MM-DD

Get all standups for a team on a specific date.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| date | string (YYYY-MM-DD) | No | Today |

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "teamId": 1,
    "userId": 1,
    "userName": "John Doe",
    "date": "2026-01-02",
    "yesterdayText": "Completed API integration",
    "todayText": "Working on dashboard",
    "blockersText": "Need design review",
    "createdAt": "2026-01-02T10:30:00Z"
  },
  {
    "id": 2,
    "teamId": 1,
    "userId": 5,
    "userName": "Jane Smith",
    "date": "2026-01-02",
    "yesterdayText": "Finished mockups",
    "todayText": "Starting frontend implementation",
    "blockersText": null,
    "createdAt": "2026-01-02T09:15:00Z"
  }
]
```

---

### GET /api/standups/teams/{teamId}/range

Get standups within a date range.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| startDate | string (YYYY-MM-DD) | Yes |
| endDate | string (YYYY-MM-DD) | Yes |

**Success Response (200 OK):** Array of standup objects

---

### PUT /api/standups/{id}

Update an existing standup. Only same-day edits allowed.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "yesterdayText": "Updated yesterday text",
  "todayText": "Updated today text",
  "blockersText": "Updated blockers"
}
```

**Success Response (200 OK):** Updated standup object

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Cannot edit past standups |
| 403 | Not your standup |
| 404 | Standup not found |

---

### DELETE /api/standups/{id}

Delete a standup.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (204 No Content)**

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 403 | Not your standup |
| 404 | Standup not found |

---

## 5. Summaries

### POST /api/summaries/teams/{teamId}/generate?date=YYYY-MM-DD

Generate an AI summary for a specific date.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| date | string (YYYY-MM-DD) | No | Today |

**Success Response (201 Created):**
```json
{
  "id": 1,
  "teamId": 1,
  "date": "2026-01-02",
  "summaryText": "## Team Summary — January 2, 2026\n\n### Overview\nThe team made significant progress on both backend and frontend development. 2 of 3 team members submitted standups.\n\n### Key Themes\n- **API Development:** Completed integration work (John)\n- **Frontend:** Dashboard UI components in progress (John)\n- **Design:** Mockups completed, moving to implementation (Jane)\n\n### Blockers\n1. **Design Review Needed** — John is waiting for design feedback",
  "generatedByAi": true,
  "createdAt": "2026-01-02T11:00:00Z"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | No standups to summarize |
| 403 | Not a team member |

---

### GET /api/summaries/teams/{teamId}?date=YYYY-MM-DD

Get summary for a specific date.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| date | string (YYYY-MM-DD) | No | Today |

**Success Response (200 OK):** Summary object or empty

---

### GET /api/summaries/teams/{teamId}/range

Get summaries within a date range.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| startDate | string (YYYY-MM-DD) | Yes |
| endDate | string (YYYY-MM-DD) | Yes |

**Success Response (200 OK):** Array of summary objects

---

### POST /api/summaries/teams/{teamId}/weekly

Generate an AI-powered weekly summary for the team and email it to the owner.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Weekly summary generated and sent to your email!"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | No standups in the last 7 days |
| 403 | Not team owner |

---

## 6. Statistics

### GET /api/stats/teams/{teamId}/heatmap

Get participation heatmap data (GitHub-style contribution graph).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| months | integer | No | 6 |

**Success Response (200 OK):**
```json
[
  {
    "date": "2026-01-02",
    "count": 5,
    "level": 2
  },
  {
    "date": "2026-01-01", 
    "count": 3,
    "level": 1
  }
]
```

**Level Scale:**
| Level | Count Range |
|-------|-------------|
| 0 | No standups |
| 1 | 1-2 standups |
| 2 | 3-4 standups |
| 3 | 5-6 standups |
| 4 | 7+ standups |

---

## 7. Error Responses

### Standard Error Format

All error responses follow this structure:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Descriptive error message here",
  "timestamp": "2026-01-02T10:00:00Z",
  "path": "/api/standups/teams/1"
}
```

### HTTP Status Codes

| Code | Name | Description |
|------|------|-------------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, business rule violation |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Not authorized for this action |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (e.g., email) |
| 500 | Internal Server Error | Unexpected server error |

---

## 7. Common Headers

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

### Response Headers

```
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:3000
```

---

## 8. Rate Limiting (Future)

| Endpoint Pattern | Limit |
|------------------|-------|
| /api/auth/* | 10 requests/minute |
| /api/summaries/*/generate | 5 requests/minute |
| All other endpoints | 60 requests/minute |

---

**Document Status:** Implementation Ready
