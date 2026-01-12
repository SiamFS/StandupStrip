# Information Architecture (IA)

### Site Map

```mermaid
graph TD
    Login[Login/Register] --> Dashboard[Main Dashboard]
    Dashboard --> CreateTeam[Create Team Modal]
    Dashboard --> JoinTeam[Join Team Modal]
    Dashboard --> TeamView[Team Dashboard]
    TeamView --> Submit[Submit Standup Modal]
    TeamView --> Summary[AI Summary Modal]
    TeamView --> History[History/Date Picker]
    TeamView --> Settings[Team Settings]
    Settings --> Invite[Invite Code]
    Settings --> Members[Member Mgmt]
    Settings --> Danger[Delete Team]
```

### Navigation Structure
- **Global:** Top Bar (Logo, User Profile Dropdown)
- **Primary:** Dashboard (Team List) -> Team Detail
- **Contextual:** Within Team Detail (Date Navigation, Action Buttons)

---
