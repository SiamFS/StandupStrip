# Epic 2: Team Management

**Expanded Goal:** Enable users to create teams, generate invite codes for member joining, and manage team settings. Team owners have full control over team configuration, member management, and team deletion with password verification.

### Story 2.1: Team Creation

**As a** logged-in user,  
**I want** to create a new team,  
**so that** I can organize standups with my team members.

**Acceptance Criteria:**
1. Dashboard has "Create Team" button opening modal
2. Modal accepts team name (min 3 characters, max 50)
3. Team is created with logged-in user as owner
4. Unique 8-character invite code is generated automatically
5. User is added to team as first member
6. User is redirected to new team dashboard after creation

### Story 2.2: Team Invitation via Code

**As a** team owner,  
**I want** to share an invite code,  
**so that** others can join my team without approval workflow.

**Acceptance Criteria:**
1. Team settings page displays invite code with "Copy Link" button
2. Invite link format: `{frontend_url}/join/{code}`
3. Clicking "Copy Link" copies full URL to clipboard with success toast
4. Non-members visiting `/join/{code}` are automatically added to team
5. Already-joined members see "You're already in this team" message
6. Invalid codes return 404 error

### Story 2.3: Team Settings Management

**As a** team owner,  
**I want** to manage team settings,  
**so that** I can rename the team, regenerate invite codes, and view members.

**Acceptance Criteria:**
1. Team dashboard has "Settings" button (owner-only, hidden for members)
2. Settings page shows team name with inline edit capability
3. Settings page displays current invite code with "Regenerate Code" button
4. Regenerating code creates new 8-character code and invalidates old one
5. Settings page lists all team members with role (Owner/Member)
6. Owner can remove members (confirmation dialog required)
7. Non-owners accessing settings page receive 403 error

### Story 2.4: Secure Team Deletion

**As a** team owner,  
**I want** to delete my team with password verification,  
**so that** I can remove teams I no longer need while preventing accidental deletion.

**Acceptance Criteria:**
1. Settings page has "Delete Team" button in danger zone
2. Clicking "Delete Team" opens password verification modal
3. User must enter current password to confirm deletion
4. Incorrect password returns error
5. Successful deletion soft-deletes team (sets `deleted=true`)
6. User is redirected to dashboard with success toast
7. Deleted teams are hidden from all queries

---
