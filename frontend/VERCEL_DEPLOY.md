# 🚀 Vercel Deployment Guide for StandUpStrip Frontend

## ✅ Prerequisites

Before deploying, ensure:

- [x] Backend deployed on Render (get the URL)
- [x] Code pushed to GitHub
- [x] GitHub account

---

## Step 1: Sign Up for Vercel

1. Go to **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your repositories

---

## Step 2: Import Project

1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Click **"Import"** next to your repository
3. If not visible, click **"Adjust GitHub App Permissions"**

---

## Step 3: Configure Project

### Framework Preset
- Vercel auto-detects **Next.js** ✅

### Root Directory
- Set to: **`frontend`** ⚠️ IMPORTANT!

### Build Settings (Auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

## Step 4: Add Environment Variables

Click **"Environment Variables"** section

Add this variable:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://standupstrip-backend.onrender.com` | Production, Preview, Development |

**Replace** `standupstrip-backend` with your actual Render service name!

---

## Step 5: Deploy!

1. Click **"Deploy"**
2. Wait ~2-3 minutes for build
3. Your site will be live at: `https://your-project.vercel.app`

---

## Step 6: Update Backend FRONTEND_URL

1. Go to **Render Dashboard** → Your backend service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL = https://your-project.vercel.app
   ```
4. Save (triggers automatic redeploy)

---

## Step 7: Verify Deployment

### Test Your Frontend:
1. Visit: `https://your-project.vercel.app`
2. Try registering a new user
3. Check if API calls work
4. Test login/logout

### Check API Connection:
Open browser console (F12) and verify:
- No CORS errors
- API calls go to your Render backend
- Responses are successful

---

## 🎯 Post-Deployment

### Custom Domain (Optional)
1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration steps

### Auto-Deploy
Vercel automatically deploys when you push to `main`:
```bash
git add .
git commit -m "feat: update frontend"
git push origin main
```

---

## ⚙️ Environment Variables Reference

| Variable | Local Value | Production Value |
|----------|-------------|------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | `https://standupstrip-backend.onrender.com` |

**Note**: `NEXT_PUBLIC_` prefix makes the variable accessible in browser

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
```
Solution:
1. Check package.json has all dependencies
2. Verify import paths are correct
3. Run npm install locally to test
```

### API Calls Fail

**Error: "CORS error" or "Network error"**
```
Solutions:
1. Verify NEXT_PUBLIC_API_URL is set correctly
2. Check backend FRONTEND_URL matches your Vercel URL
3. Ensure backend is running on Render
4. Check browser console for exact error
```

### Environment Variable Not Working

**Variable is undefined**
```
Solutions:
1. Ensure variable name starts with NEXT_PUBLIC_
2. Redeploy after adding environment variables
3. Check variable is set for correct environment (Production)
```

---

## 📊 Monitoring

### View Logs
1. Go to **Deployments** tab
2. Click on a deployment
3. View **Build Logs** and **Function Logs**

### Analytics
1. Go to **Analytics** tab
2. View page views, performance, etc.

---

## 🔄 Updating Deployment

### Method 1: Git Push (Recommended)
```bash
git add .
git commit -m "feat: update"
git push origin main
```
Vercel auto-deploys!

### Method 2: Manual Redeploy
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

---

## ✅ Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] `NEXT_PUBLIC_API_URL` set to Render backend URL
- [ ] Backend `FRONTEND_URL` updated to Vercel URL
- [ ] Test registration/login works
- [ ] Test email verification (if configured)
- [ ] Check all pages load correctly
- [ ] Verify API calls work
- [ ] Test on mobile devices

---

## 🎉 Success!

Your full-stack application is now live:

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://standupstrip-backend.onrender.com`

---

## 📚 Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
