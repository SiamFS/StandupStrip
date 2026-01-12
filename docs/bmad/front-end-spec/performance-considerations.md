# Performance Considerations

### Performance Goals
- **Page Load:** < 1.5s (LCP)
- **Interaction Response:** < 100ms (INP)
- **AI Wait:** < 10s (Show clear "Thinking..." state)

### Design Strategies
- **Optimistic UI:** (Future) Show submission immediately before API confirms.
- **Skeletons:** Reduce perceived load time.
- **Client-side Caching:** React Query for instant navigation between dates.

---
