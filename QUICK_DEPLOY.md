# HealthTribe - Quick Deploy Guide

**5-Minute Production Deployment** 🚀

---

## Prerequisites (2 minutes)

Get these API keys ready:

1. **Clerk** - [https://dashboard.clerk.com](https://dashboard.clerk.com)
   - Create application → Copy keys
   - `CLERK_SECRET_KEY` (starts with `sk_`)
   - `CLERK_PUBLISHABLE_KEY` (starts with `pk_`)

2. **GROQ** - [https://console.groq.com](https://console.groq.com)
   - Create API key
   - `GROQ_API_KEY` (starts with `gsk_`)

---

## Backend (3 minutes)

### Deploy to Render

1. **Push Code**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Render Dashboard**
   - Go to [render.com/dashboard](https://dashboard.render.com)
   - Click **New** → **Blueprint**
   - Connect your Git repository
   - Render detects `backend/render.yaml` ✅
   - Click **Apply**

3. **Set Environment Variables**
   
   After services are created, go to `healthtribe-backend` service:
   - **Environment** tab
   - Add these 3 secrets:
   
   ```
   CLERK_SECRET_KEY = sk_test_xxxxx
   CLERK_PUBLISHABLE_KEY = pk_test_xxxxx
   GROQ_API_KEY = gsk_xxxxx
   ```

4. **Wait for Deploy** (3-5 minutes)
   - Database auto-provisions ✅
   - Redis auto-provisions ✅
   - Migrations run automatically ✅
   - Backend goes live ✅

5. **Copy Backend URL**
   ```
   https://healthtribe-backend.onrender.com
   ```

---

## Frontend (2 minutes)

### Deploy to Vercel

1. **Vercel Dashboard**
   - Go to [vercel.com/new](https://vercel.com/new)
   - **Import Git Repository**
   - Select your repository

2. **Configure Project**
   - **Framework Preset**: Next.js ✅ (auto-detected)
   - **Root Directory**: `apps/web` ⚠️ (IMPORTANT!)
   - **Build Command**: `npm run build` (default)
   - Click **Environment Variables** ▼

3. **Add Environment Variables**
   
   Add these 3 variables:
   
   ```
   NEXT_PUBLIC_API_URL = https://healthtribe-backend.onrender.com
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_xxxxx
   CLERK_SECRET_KEY = sk_test_xxxxx
   ```
   
   **Important**: 
   - Use YOUR Render backend URL from step above
   - No trailing slash on API URL

4. **Deploy**
   - Click **Deploy**
   - Wait 2-3 minutes
   - Copy your Vercel URL:
   ```
   https://healthtribe-web.vercel.app
   ```

---

## Final Step (1 minute)

### Update Clerk

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys** → **Domains**
4. Add your Vercel URL:
   ```
   https://healthtribe-web.vercel.app
   ```
5. Save ✅

---

## Verification

### Backend Health Check

```bash
curl https://healthtribe-backend.onrender.com/health
```

**Expected**:
```json
{"status":"ok","version":"1.0.0"}
```

### Frontend

Visit:
```
https://healthtribe-web.vercel.app
```

**Expected**:
- ✅ Page loads
- ✅ No console errors
- ✅ "Sign In" button works
- ✅ After login, dashboard loads

---

## Troubleshooting

### Backend won't start

**Check Render logs** → Look for:

1. **Missing environment variable**
   ```
   ValidationError: GROQ_API_KEY field required
   ```
   **Fix**: Add the missing env var in Render dashboard

2. **Database connection failed**
   ```
   OperationalError: could not connect to server
   ```
   **Fix**: Wait for database to provision (check Render dashboard)

3. **Migration error**
   ```
   alembic.util.exc.CommandError
   ```
   **Fix**: Open Render shell, run:
   ```bash
   alembic downgrade base
   alembic upgrade head
   ```

### Frontend build fails

**Check Vercel logs** → Look for:

1. **Module not found: @healthtribe/...**
   ```
   Error: Cannot find module '@healthtribe/api-client'
   ```
   **Fix**: 
   - Go to Vercel project settings
   - **Build & Development Settings**
   - **Install Command**: 
     ```bash
     cd ../.. && npm install && cd apps/web
     ```
   - Redeploy

2. **API_URL not defined**
   ```
   TypeError: Cannot read property
   ```
   **Fix**: Add `NEXT_PUBLIC_API_URL` to Vercel env vars

### Auth fails

**Error**: "Invalid publishable key"

**Fix**:
1. Verify Clerk keys are correct in both Render and Vercel
2. Add Vercel domain to Clerk dashboard (Domains section)
3. Wait 1-2 minutes for Clerk to sync

---

## Environment Variables Cheat Sheet

### Backend (Render)

| Variable | Where to Get | Example |
|----------|--------------|---------|
| `CLERK_SECRET_KEY` | Clerk dashboard | `sk_test_...` |
| `CLERK_PUBLISHABLE_KEY` | Clerk dashboard | `pk_test_...` |
| `GROQ_API_KEY` | GROQ console | `gsk_...` |

*Database and Redis auto-configured by render.yaml ✅*

### Frontend (Vercel)

| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Your Render backend URL | `https://healthtribe-backend.onrender.com` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Same as backend | `pk_test_...` |
| `CLERK_SECRET_KEY` | Same as backend | `sk_test_...` |

---

## Cost Estimate

### Free Tier (Development)
- **Render**: Free web service + Free PostgreSQL (limited hours)
- **Vercel**: Free (Hobby plan)
- **Total**: $0/month ✅

### Production Tier
- **Render**: 
  - Web Service: $7/month
  - PostgreSQL: $7/month
  - Redis: $5/month
  - **Subtotal**: $19/month
- **Vercel**: 
  - Pro: $20/month (for commercial use)
- **Total**: $39/month

---

## Next Steps After Deployment

1. ✅ Test all features end-to-end
2. ✅ Set up monitoring (Render and Vercel dashboards)
3. ✅ Configure custom domain (optional)
4. ✅ Set up automated backups for Render Postgres
5. ✅ Enable Vercel Analytics (optional)

---

## Need Help?

- **Deployment Issues**: See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide
- **Production Audit**: See [PRODUCTION_READINESS_REPORT.md](PRODUCTION_READINESS_REPORT.md)
- **Environment Variables**: See `.env.example` files in `backend/` and `apps/web/`

---

**Deployment Status**: ✅ **READY**

**Total Time**: ~10 minutes from start to finish

---

**Last Updated**: 2026-07-08  
**Tested On**: Render (Starter plan) + Vercel (Pro plan)
