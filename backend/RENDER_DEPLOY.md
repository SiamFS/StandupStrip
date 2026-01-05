# Render.com Deployment Guide for StandUpStrip

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub repository with your code
- ✅ NeonDB database created (https://console.neon.tech/)
- ✅ Gemini API key (https://aistudio.google.com/apikey)
- ✅ Gmail App Password for email verification

---

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Commit all changes** to your GitHub repository
2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: prepare for Render deployment"
   git push origin main
   ```

### Step 2: Create Render Account

1. Go to [Render.com](https://render.com/)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Deploy Backend Service

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. **Connect Repository**:
   - Find and select your repository
   - Click "Connect"

4. **Configure Service**:
   | Setting | Value |
   |---------|-------|
   | **Name** | `standupstrip-backend` |
   | **Root Directory** | `backend` |
   | **Environment** | `Docker` |
   | **Region** | `Singapore` (closest to NeonDB) |
   | **Branch** | `main` |
   | **Plan** | `Free` |

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):

   **Database Configuration:**
   ```
   DB_STATUS = cloud
   
   CLOUD_DATABASE_URL = jdbc:postgresql://your-neon-host.neon.tech:5432/neondb?sslmode=require
   CLOUD_DATABASE_USERNAME = neondb_owner
   CLOUD_DATABASE_PASSWORD = your_neon_password
   
   DATABASE_URL = jdbc:postgresql://your-neon-host.neon.tech:5432/neondb?sslmode=require
   DATABASE_USERNAME = neondb_owner
   DATABASE_PASSWORD = your_neon_password
   ```

   **JWT Configuration:**
   ```
   JWT_SECRET = your-super-secret-jwt-key-at-least-32-characters-long
   JWT_EXPIRATION = 86400000
   ```

   **Gemini AI:**
   ```
   GEMINI_API_KEY = your_gemini_api_key
   GEMINI_API_URL = https://generativelanguage.googleapis.com/v1beta
   GEMINI_MODEL = gemini-2.0-flash-exp
   ```

   **Email (Gmail SMTP):**
   ```
   MAIL_USERNAME = your_email@gmail.com
   MAIL_PASSWORD = your_gmail_app_password
   ```

   **Frontend URL:**
   ```
   FRONTEND_URL = https://your-frontend-url.vercel.app
   ```
   *(Update this after deploying frontend)*

6. **Click "Create Web Service"**

7. **Wait for deployment** (~5-10 minutes for first build)

### Step 4: Verify Deployment

1. **Check build logs** in Render dashboard
2. **Test health endpoint**:
   ```bash
   curl https://standupstrip-backend.onrender.com/hello
   ```
   
   Expected response:
   ```json
   {
     "status": "healthy",
     "message": "Hello from StandUpStrip API! 👋",
     "timestamp": "2026-01-05T..."
   }
   ```

3. **Test registration endpoint**:
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

## Important Notes

### Free Tier Limitations

⚠️ **Render Free Tier:**
- Services spin down after **15 minutes** of inactivity
- First request after spin-down takes **30-60 seconds** (cold start)
- 750 hours/month free (enough for 1 service running 24/7)

### Database Connection

- Ensure your NeonDB allows connections from Render
- Use `sslmode=require` in connection string
- NeonDB free tier: 0.5 GB storage, 1 compute unit

### Environment Variables

- **Never commit** `.env` file to Git
- Set all sensitive values in Render dashboard
- Update `FRONTEND_URL` after deploying frontend

---

## Troubleshooting

### Build Fails

**Error: "Maven build failed"**
```bash
# Check logs for specific error
# Common fixes:
# 1. Ensure Java 21 is specified in Dockerfile
# 2. Check pom.xml for dependency issues
# 3. Verify Dockerfile path is correct
```

### Database Connection Error

**Error: "Could not connect to database"**
```
Solutions:
1. Verify DATABASE_URL format includes ?sslmode=require
2. Check NeonDB credentials are correct
3. Ensure DB_STATUS=cloud is set
4. Verify NeonDB is active (not suspended)
```

### Application Crashes on Startup

**Error: "Application failed to start"**
```
Check:
1. JWT_SECRET is at least 32 characters
2. All required env vars are set
3. GEMINI_API_KEY is valid
4. Email credentials are correct (app password, not regular password)
```

### Health Check Failing

**Error: "Health check failed"**
```
1. Verify /hello endpoint works locally
2. Check application logs in Render
3. Ensure PORT environment variable is handled correctly
```

---

## Updating Deployment

### Auto-Deploy (Recommended)

Render automatically deploys when you push to `main` branch:
```bash
git add .
git commit -m "fix: update feature"
git push origin main
```

### Manual Deploy

1. Go to Render dashboard
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"

---

## Monitoring

### View Logs

1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. Filter by:
   - **Build logs**: See Maven build output
   - **Deploy logs**: See application startup
   - **Runtime logs**: See application logs

### Check Metrics

1. Go to "Metrics" tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Request count
   - Response time

---

## Next Steps

1. ✅ Deploy backend to Render
2. ⬜ Deploy frontend to Vercel/Netlify
3. ⬜ Update `FRONTEND_URL` in Render env vars
4. ⬜ Test email verification flow
5. ⬜ Test full application workflow

---

## Support

- **Render Docs**: https://render.com/docs
- **NeonDB Docs**: https://neon.tech/docs
- **Issues**: Check application logs in Render dashboard
