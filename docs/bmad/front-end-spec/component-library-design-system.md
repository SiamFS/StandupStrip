# Component Library / Design System

### Design System Approach
Leverage **shadcn/ui** (built on Radix UI + Tailwind CSS) for a robust, accessible foundation. Custom components built on top of these primitives.

### Core Components

#### `StandupCard`
- **Purpose:** Display single user entry.
- **Variants:** Own (Approachable/Editable) vs Others (Read-only).
- **States:** Loading (Skeleton), Error, Empty.

#### `ParticipationHeatmap`
- **Purpose:** Visual activity history.
- **Usage:** Displays last 6 months. Tooltip on hover.

#### `SummaryModal`
- **Purpose:** Display Markdown content from AI.
- **Usage:** Clean typography, distinct headers for "Overview", "Themes", "Blockers".

---
