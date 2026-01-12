# Epic 5: Analytics & Participation Tracking

**Expanded Goal:** Provide visual participation tracking via GitHub-style heatmap and enable 7-day history navigation to support team accountability and historical review.

### Story 5.1: Participation Heatmap

**As a** team member,  
**I want** to see a participation heatmap,  
**so that** I can visualize submission consistency across the team.

**Acceptance Criteria:**
1. Team dashboard displays heatmap below standups section
2. Heatmap shows last 6 months of data (rows = months, cells = days)
3. Cell color intensity represents submission count (0=gray, 1-2=light green, 3-4=medium green, 5+=dark green)
4. Hovering over cell shows tooltip with date and submission count
5. Heatmap has member filter dropdown (default: All Members)
6. Selecting individual member filters heatmap to their submissions only

### Story 5.2: 7-Day History Navigation

**As a** team member,  
**I want** to navigate the last 7 days of standups,  
**so that** I can review recent team activity.

**Acceptance Criteria:**
1. Date picker highlights dates with standups (indicator dots)
2. Clicking previous 7 days loads standups for that date
3. Summaries persist and are viewable for historical dates
4. Navigation is instant (< 500ms)
5. URL updates with selected date for shareable links

---
