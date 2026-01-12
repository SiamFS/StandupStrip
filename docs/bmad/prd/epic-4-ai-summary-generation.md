# Epic 4: AI Summary Generation

**Expanded Goal:** Integrate Google Gemini API to generate AI-powered daily and weekly summaries that synthesize team standups into executive-friendly reports with Overview, Key Themes, and Blockers sections.

### Story 4.1: Daily AI Summary Generation

**As a** team owner,  
**I want** to generate an AI summary of today's standups,  
**so that** I can quickly understand team progress without reading every update.

**Acceptance Criteria:**
1. Team dashboard shows "Generate AI Summary" button if no summary exists for selected date
2. Clicking button triggers Gemini API call with all standups for that date
3. Loading spinner shows "Generating AI summary..." during API call
4. Summary is saved to database with `generated_by_ai=true`
5. Summary modal opens automatically on completion
6. Summary includes three sections: Overview, Key Themes, Blockers
7. If Gemini API fails, fallback to simple text aggregation
8. Generation completes within 10 seconds

### Story 4.2: View AI Summary

**As a** team member,  
**I want** to view the AI-generated summary,  
**so that** I can see the synthesized team update.

**Acceptance Criteria:**
1. Team dashboard shows "View Summary" button if summary exists for selected date
2. Clicking button opens modal with markdown-rendered summary
3. Modal has "Copy Text" button to copy summary to clipboard
4. Summary is formatted with headings, bullets, and bold text
5. Modal is scrollable if content exceeds viewport height

### Story 4.3: Weekly AI Summary

**As a** team owner,  
**I want** to generate a weekly summary,  
**so that** I can provide stakeholders with a 7-day rollup.

**Acceptance Criteria:**
1. Team dashboard has "Generate Weekly Summary" button (owner-only)
2. Clicking button aggregates standups from last 7 days
3. Gemini API generates summary with weekly themes and trends
4. Weekly summary is saved with `summary_type=weekly`
5. Weekly summary modal displays aggregated insights
6. Generation completes within 15 seconds

---
