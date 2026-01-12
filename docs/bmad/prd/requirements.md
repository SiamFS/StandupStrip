# Requirements

### Functional Requirements

**FR1:** Users must be able to register with email and password, with email verification required before full access  
**FR2:** Users must be able to create teams with unique invite codes for member joining  
**FR3:** Team owners must be able to invite members via shareable 8-character codes (no approval workflow)  
**FR4:** Team members must be able to submit daily standups with three fields: Yesterday, Today, Blockers  
**FR5:** Users must be able to edit or delete their own standup submissions on the same day only  
**FR6:** Team owners must be able to generate AI-powered daily summaries with one click  
**FR7:** All team members must be able to view AI-generated summaries for any date  
**FR8:** Users must be able to view a participation heatmap showing submission frequency over 6 months  
**FR9:** Team owners must be able to delete teams with password verification to prevent accidental loss  
**FR10:** Users must be able to navigate 7 days of standup history with a date picker  
**FR11:** Users must be able to reset forgotten passwords via email token  
**FR12:** Team owners must be able to remove team members  
**FR13:** Users must be able to update their profile information (name, email)  
**FR14:** The system must prevent duplicate standup submissions for the same user/team/date  
**FR15:** Team owners must be able to generate weekly AI summaries aggregating 7 days of standups

### Non-Functional Requirements

**NFR1:** Page load time must be under 2 seconds on standard broadband connections  
**NFR2:** API response time must be under 500ms for all non-AI endpoints  
**NFR3:** AI summary generation must complete within 10 seconds  
**NFR4:** The application must be responsive and functional on mobile devices (320px+ width)  
**NFR5:** The application must support modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)  
**NFR6:** User passwords must be hashed with bcrypt (10+ rounds)  
**NFR7:** JWT tokens must expire after 24 hours  
**NFR8:** The application must handle 100 concurrent users without performance degradation  
**NFR9:** Database queries must use indexes for team_id, user_id, and date fields  
**NFR10:** The application must be deployable on free-tier cloud infrastructure (Vercel, Railway)  
**NFR11:** All API endpoints must return consistent JSON error formats  
**NFR12:** The application must meet WCAG 2.1 AA accessibility standards  
**NFR13:** Email verification tokens must expire after 24 hours  
**NFR14:** Password reset tokens must expire after 1 hour

---
