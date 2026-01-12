# Epic 3: Standup Submission & Viewing

**Expanded Goal:** Allow team members to submit daily standups with Yesterday/Today/Blockers fields, view all team standups for any date, and edit/delete their own submissions on the same day.

### Story 3.1: Daily Standup Submission

**As a** team member,  
**I want** to submit my daily standup,  
**so that** my team knows what I worked on, what I'm doing today, and if I'm blocked.

**Acceptance Criteria:**
1. Team dashboard has "Submit Standup" button
2. Modal opens with 3 text areas: Yesterday (required, max 2000 chars), Today (required, max 2000 chars), Blockers (optional, max 1000 chars)
3. Character counters update live and turn red when limit exceeded
4. Submit button is disabled until Yesterday and Today are filled
5. Submitting creates standup record with current date
6. Duplicate submission for same user/team/date returns 409 error
7. Successful submission closes modal and refreshes dashboard with success toast

### Story 3.2: View Team Standups

**As a** team member,  
**I want** to view all standups for my team on a selected date,  
**so that** I can see what everyone is working on.

**Acceptance Criteria:**
1. Team dashboard displays date picker defaulting to today
2. Changing date fetches standups for that date
3. Standups are displayed as cards showing user name, timestamp, and all three fields
4. Members who haven't submitted show as "No standup submitted" cards
5. Empty state message shown if no standups exist for date
6. Loading skeleton cards shown during fetch

### Story 3.3: Edit Own Standup

**As a** team member,  
**I want** to edit my standup on the same day,  
**so that** I can correct mistakes or add forgotten details.

**Acceptance Criteria:**
1. Own standup cards show "Edit" button (only on submission date)
2. Clicking "Edit" opens modal pre-filled with current values
3. User can modify any of the three fields
4. Submitting update saves changes and refreshes dashboard
5. Edit button is hidden if viewing past dates

### Story 3.4: Delete Own Standup

**As a** team member,  
**I want** to delete my standup on the same day,  
**so that** I can remove accidental or incorrect submissions.

**Acceptance Criteria:**
1. Own standup cards show "Delete" button (only on submission date)
2. Clicking "Delete" opens confirmation dialog
3. Confirming deletion removes standup record
4. Dashboard refreshes showing "No standup submitted" for user
5. Delete button is hidden if viewing past dates

---
