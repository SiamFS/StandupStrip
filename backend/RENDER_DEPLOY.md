# 🚀 Render.com Deployment - Complete Guide

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [x] Code pushed to GitHub (`git push origin main`)
- [x] GitHub account
- [x] NeonDB credentials ready
- [x] Gemini API key
- [x] Gmail app password

---

## Step 1: Sign Up for Render

1. Go to **https://dashboard.render.com/register**
2. Click **"Sign up with GitHub"**
3. Authorize Render to access your repositories

---

## Step 2: Create New Web Service

1. In Render Dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. Choose **"Build and deploy from a Git repository"**
4. Click **"Next"**

---

## Step 3: Connect Repository

1. Find your repository in the list
2. Click **"Connect"** next to it
3. If not visible, click **"Configure account"** to grant access

---

## Step 4: Configure Service

Fill in these fields:

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `standupstrip-backend` | Your service URL will be `standupstrip-backend.onrender.com` |
| **Region** | `Singapore` | Closest to NeonDB (ap-southeast-1) |
| **Branch** | `main` | Auto-deploys on push to this branch |
| **Root Directory** | `backend` | ⚠️ IMPORTANT: Set this! |
| **Language** | `Docker` | Select from dropdown |
| **Dockerfile Path** | `backend/Dockerfile` | Path relative to repo root |

---

## Step 5: Choose Instance Type

- Select **"Free"** plan
- Note: Free services spin down after 15 min inactivity

---

## Step 6: Add Environment Variables

Click **"Advanced"** → Scroll to **"Environment Variables"**

Click **"Add Environment Variable"** for each:

### Database (6 variables)
```
DB_STATUS = cloud
CLOUD_DATABASE_URL = jdbc:postgresql://your-neon-host.aws.neon.tech:5432/neondb?sslmode=require
CLOUD_DATABASE_USERNAME = your_neon_username
CLOUD_DATABASE_PASSWORD = your_neon_password_here
DATABASE_URL = jdbc:postgresql://your-neon-host.aws.neon.tech:5432/neondb?sslmode=require
DATABASE_USERNAME = your_neon_username
DATABASE_PASSWORD = your_neon_password_here
```
> ⚠️ **Get from NeonDB Dashboard**: https://console.neon.tech/

### JWT (2 variables)
```
JWT_SECRET = your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRATION = 86400000
```
> 💡 **Generate a secure random string** (32+ characters)

### Gemini AI (3 variables)
```
GEMINI_API_KEY = your_gemini_api_key_here
GEMINI_API_URL = https://generativelanguage.googleapis.com/v1beta
GEMINI_MODEL = gemini-2.0-flash-exp
```
> ⚠️ **Get API Key from**: https://aistudio.google.com/apikey

### Email (2 variables)
```
MAIL_USERNAME = your_email@gmail.com
MAIL_PASSWORD = your_gmail_app_password_here
```
> ⚠️ **Use Gmail App Password**, not your regular Gmail password
> Generate at: https://myaccount.google.com/apppasswords

### Frontend (1 variable)
```
FRONTEND_URL = http://localhost:3000
```
*(Update to your Vercel URL after deploying frontend)*

---

## Step 7: Deploy!

1. Click **"Create Web Service"** at the bottom
2. Render starts building your Docker image
3. Watch build logs in real-time

**Build Timeline** (~5-10 minutes):
```
✅ Cloning repository...
✅ Building Docker image (Stage 1: Maven)...
✅ Building Docker image (Stage 2: Runtime)...
✅ Starting service...
✅ Health check passing (/hello endpoint)
✅ Deploy live!
```

---

## Step 8: Verify Deployment

### Your Service URL:
```
https://standupstrip-backend.onrender.com
```

### Test Health Endpoint:
```bash
curl https://standupstrip-backend.onrender.com/hello
```

**Expected Response:**
```json
{
  "status": "healthy",
  "message": "Hello from StandUpStrip API! 👋",
  "timestamp": "2026-01-05T..."
}
```

### Test Registration:
```bash
curl -X POST https://standupstrip-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🎯 What Happens After Deployment

### Automatic Redeployment
Every time you push to `main` branch:
```bash
git add .
git commit -m "feat: update feature"
git push origin main
```
Render automatically rebuilds and redeploys! 🚀

### Monitoring
- **Logs**: View real-time application logs
- **Metrics**: Monitor CPU/Memory usage
- **Events**: See deployment history

---

## ⚠️ Important Notes

### Free Tier Behavior
- **Spin down**: After 15 minutes of inactivity
- **Cold start**: First request takes 30-60 seconds
- **Hours**: 750 hours/month (enough for 24/7)

### Database
- Ensure NeonDB is active (not suspended)
- Connection uses SSL (`sslmode=require`)

### Environment Variables
- Can be updated anytime in Dashboard → Environment
- Changes trigger automatic redeploy

---

## 🐛 Troubleshooting

### Build Fails
**Check:**
- Root Directory = `backend`
- Dockerfile Path = `backend/Dockerfile`
- Language = `Docker`

### Database Connection Error
**Fix:**
- Verify NeonDB credentials
- Check `sslmode=require` in URL
- Ensure NeonDB is not suspended

### Service Crashes
**Check:**
- All 14 environment variables are set
- JWT_SECRET is 32+ characters
- GEMINI_API_KEY is valid
- Email password is app password (not regular password)

---

## 📊 Next Steps

1. ✅ Backend deployed on Render
2. ⬜ Deploy frontend to Vercel
3. ⬜ Update `FRONTEND_URL` in Render
4. ⬜ Test full application

---

**Your backend is now live! 🎉**

Access it at: `https://standupstrip-backend.onrender.com`
