# Data Models

### User
**Purpose:** Represents a registered user of the system.
**Key Attributes:**
- `id`: Long (PK)
- `email`: String (Unique, Indexed)
- `password_hash`: String
- `verified`: Boolean
- `created_at`: Timestamp
**Relationships:**
- One-to-Many with `TeamMember`
- One-to-Many with `Standup`

### Team
**Purpose:** Represents a group of users sharing standups.
**Key Attributes:**
- `id`: Long (PK)
- `name`: String
- `invite_code`: String (Unique, Indexed)
- `owner_id`: Long (FK to User)
- `deleted`: Boolean (Soft delete)
**Relationships:**
- One-to-Many with `TeamMember`
- One-to-One with `User` (Owner)

### Standup
**Purpose:** A daily status update from a user.
**Key Attributes:**
- `id`: Long (PK)
- `user_id`: Long (FK)
- `team_id`: Long (FK)
- `date`: LocalDate
- `yesterday_text`: Text
- `today_text`: Text
- `blockers_text`: Text
**Relationships:**
- Many-to-One with `User`
- Many-to-One with `Team`

### StandupSummary
**Purpose:** AI-generated summary of standups for a team/date.
**Key Attributes:**
- `id`: Long (PK)
- `team_id`: Long (FK)
- `date`: LocalDate
- `content`: Text (Markdown)
- `type`: Enum (DAILY, WEEKLY)
**Relationships:**
- Many-to-One with `Team`

---
