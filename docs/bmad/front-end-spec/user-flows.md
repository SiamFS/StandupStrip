# User Flows

### Standup Submission Flow
**User Goal:** Submit daily update quickly.
**Entry Points:** Team Dashboard -> "Submit Standup" Button.

```mermaid
graph LR
    A[Click Submit] --> B[Modal Opens]
    B --> C{Form Filled?}
    C -- No --> D[Inputs Disabled]
    C -- Yes --> E[Click Submit]
    E --> F[API Call]
    F --> G[Success Toast]
    G --> H[Dashboard Refresh]
```

**Edge Cases:**
- User already submitted today: Show "Edit" button/modal instead.
- API Error: Show error toast, keep modal open with data preserved.

### AI Summary Generation Flow
**User Goal:** Get a quick synthesis of team activity.
**Entry Points:** Team Dashboard -> "Generate Summary" Button.

```mermaid
graph LR
    A[Click Generate] --> B[Show Loading State]
    B --> C[API Processing]
    C --> D[Summary Created]
    D --> E[Open Summary Modal]
    E --> F[Markdown Rendered]
```

---
