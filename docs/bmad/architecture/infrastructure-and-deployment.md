# Infrastructure and Deployment

### Infrastructure as Code
- **Managed By:** Platform (Vercel/Railway) configuration
- **Env Vars:** Manual configuration in dashboard

### Deployment Strategy
- **Frontend:** Git-push to Vercel (Auto-build & Deploy)
- **Backend:** Git-push to Railway/Render / Manual Docker build
- **CI/CD:** Basic CI on commit (Build check)

### Environments
- **Local:** Developer machine, Docker DB
- **Production:** Live environment, Managed DB

---
