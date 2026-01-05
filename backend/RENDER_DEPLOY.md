# Render.com Deployment Guide

## Quick Deploy Steps

### 1. Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repo: `SiamFS/StandupStrip`
4. Select the repository

### 2. Configure Service
| Setting | Value |
|---------|-------|
| **Name** | `standupstrip-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Docker` |
| **Region** | `Singapore` (closest to Neon DB) |
| **Plan** | Free |

### 3. Set Environment Variables
In Render Dashboard → Environment → Add the following:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `jdbc:postgresql://ep-billowing-wave-a1xwoegt-pooler.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require` |
| `DATABASE_USERNAME` | `neondb_owner` |
| `DATABASE_PASSWORD` | `npg_RH4xpsXQCW6v` |
| `DB_STATUS` | `cloud` |
| `JWT_SECRET` | `your-super-secret-jwt-key-at-least-32-characters-long` |
| `JWT_EXPIRATION` | `86400000` |
| `GEMINI_API_KEY` | Your Gemini API key |
| `GEMINI_API_URL` | `https://generativelanguage.googleapis.com/v1beta` |
| `GEMINI_MODEL` | `gemini-3-flash-preview` |
| `MAIL_USERNAME` | Your Gmail address |
| `MAIL_PASSWORD` | Your Gmail App Password |
| `FRONTEND_URL` | Your frontend URL (after deploying) |

### 4. Deploy
Click **Create Web Service** and wait for deployment (~5 minutes first time)

---

## Testing Deployed API

Once deployed, test your API:
```bash
curl https://your-app-name.onrender.com/hello
```

Expected response:
```json
{"application":"StandUpStrip API","version":"1.0.0","status":"running"...}
```

---

## Important Notes

### Free Tier Limitations
- ⚠️ Free services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds
- Consider upgrading for production use

### Docker Build
- Uses multi-stage build for smaller image size
- Based on Eclipse Temurin JDK 21 Alpine
- Final image is ~200MB

### Health Check
- Render checks `/hello` endpoint
- Service marked healthy when response is 200

---

## Troubleshooting

### Build Fails
- Check Render logs for Maven errors
- Ensure all dependencies are in `pom.xml`

### Database Connection Error
- Verify Neon DB credentials
- Ensure `sslmode=require` is in DATABASE_URL
- Check if Neon DB allows connections from Render IPs

### App Crashes on Start
- Check environment variables are set correctly
- Verify JWT_SECRET is at least 32 characters
