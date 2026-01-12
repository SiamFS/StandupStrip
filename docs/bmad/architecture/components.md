# Components

### AuthComponent
**Responsibility:** Handles registration, login, token generation, and email verification.
**Key Interfaces:** `register()`, `login()`, `verifyEmail()`, `resetPassword()`
**Dependencies:** `UserRepository`, `EmailService`

### TeamComponent
**Responsibility:** Manages team lifecycle, membership changes, and settings.
**Key Interfaces:** `createTeam()`, `joinTeam()`, `removeMember()`
**Dependencies:** `TeamRepository`, `TeamMemberRepository`, `UserRepository`

### StandupComponent
**Responsibility:** CRUD operations for daily standups.
**Key Interfaces:** `submitStandup()`, `getStandupsByDate()`, `getHistory()`
**Dependencies:** `StandupRepository`, `TeamRepository`

### AIIntegrationComponent
**Responsibility:** Interacts with Google Gemini API to generate summaries.
**Key Interfaces:** `generateDailySummary()`, `generateWeeklySummary()`
**Dependencies:** `StandupRepository`, `GeminiClient`

---
