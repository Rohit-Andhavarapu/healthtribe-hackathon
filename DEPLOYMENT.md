# HealthTribe Production Deployment Guide

This guide provides step-by-step instructions for deploying HealthTribe to production using **Render** (backend) and **Vercel** (frontend).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

1. **Clerk Account** - [https://clerk.com](https://clerk.com)
   - Create an application
   - Get your `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Add production domains to allowed origins in Clerk dashboard

2. **AI Provider API Key** - At least one of:
   - **GROQ** (Recommended): [https://console.groq.com](https://console.groq.com)
   - OpenRouter: [https://openrouter.ai](https://openrouter.ai)
   - Together AI: [https://api.together.xyz](https://api.together.xyz)

3. **Render Account** - [https://render.com](https://render.com)

4. **Vercel Account** - [https://vercel.com](https://vercel.com)

5. **Git Repository** - Push your code to GitHub, GitLab, or Bitbucket

---

## Backend Deployment (Render)

### Option 1: Blueprint Deployment (Recommended)

If your repository is public or Render has access, you can use the `render.yaml` blueprint:

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Create Render Blueprint**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New"** → **"Blueprint"**
   - Connect your Git repository
   - Render will detect `backend/render.yaml`
   - Click **"Apply"**

3. **Set Manual Environment Variables**
   
   After blueprint creation, navigate to each service and set these secrets:
   
   **Backend Web Service** (`healthtribe-backend`):
   ```
   CLERK_SECRET_KEY=sk_test_... (from Clerk dashboard)
   CLERK_PUBLISHABLE_KEY=pk_test_... (from Clerk dashboard)
   GROQ_API_KEY=gsk_... (from GROQ console)
   ```

4. **Wait for Deployment**
   - Database and Redis will provision automatically
   - Backend will build and deploy
   - Migrations will run automatically via `alembic upgrade head`

5. **Get Backend URL**
   - Your backend URL: `https://healthtribe-backend.onrender.com`
   - Test: `https://healthtribe-backend.onrender.com/health`

---

### Option 2: Manual Deployment

If you prefer manual setup:

#### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `healthtribe-db`
   - **Database**: `healthtribe_db`
   - **User**: `healthtribe` (auto-generated)
   - **Region**: `Oregon` (or closest to your users)
   - **Plan**: `Starter` ($7/month) or `Free` (for testing)
4. Click **"Create Database"**
5. Save the **Internal Connection String** (e.g., `postgres://user:pass@host:5432/db`)

#### Step 2: Create Redis Instance

1. Click **"New"** → **"Redis"**
2. Configure:
   - **Name**: `healthtribe-redis`
   - **Region**: Same as database
   - **Plan**: `Starter` ($5/month) or use external free Redis
   - **Max Memory Policy**: `allkeys-lru`
3. Click **"Create Redis"**
4. Save the **Internal Connection String** (e.g., `redis://red-xxx:6379`)

#### Step 3: Create Web Service (Backend)

1. Click **"New"** → **"Web Service"**
2. Connect your Git repository
3. Configure:
   - **Name**: `healthtribe-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Starter` ($7/month) or `Free` (with limitations)

4. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):

   ```bash
   # Database (from Step 1 - use INTERNAL connection string)
   POSTGRES_USER=<from-database-internal-url>
   POSTGRES_PASSWORD=<from-database-internal-url>
   POSTGRES_DB=healthtribe_db
   POSTGRES_HOST=<from-database-internal-url>
   POSTGRES_PORT=5432

   # Redis (from Step 2 - use INTERNAL connection string)
   REDIS_URL=redis://red-xxx:6379

   # Clerk (from Clerk dashboard)
   CLERK_SECRET_KEY=sk_test_...
   CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_JWT_PUBLIC_KEY=

   # AI Provider (at least one required)
   GROQ_API_KEY=gsk_...
   GROQ_MODEL=llama-3.3-70b-versatile

   # Optional: Other AI providers
   OPENROUTER_API_KEY=
   OPENROUTER_MODEL=openai/gpt-4o-mini
   TOGETHER_API_KEY=
   TOGETHER_MODEL=meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo

   # Project
   PROJECT_NAME=HealthTribe AI
   API_V1_STR=/api/v1
   ```

5. **Health Check Configuration**:
   - **Health Check Path**: `/health`
   - Leave other health check settings as default

6. Click **"Create Web Service"**

7. **Wait for Build & Deployment**
   - First build: 3-5 minutes
   - Check logs for any errors
   - Database migrations will run automatically

8. **Verify Deployment**
   - Access: `https://healthtribe-backend.onrender.com/health`
   - Should return: `{"status":"ok","version":"1.0.0"}`
   - API docs: `https://healthtribe-backend.onrender.com/docs`

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Environment Variables

Create a `.env.production` file locally (for reference, don't commit):

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://healthtribe-backend.onrender.com

# Clerk (same keys as backend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd apps/web
   vercel
   ```

4. **Follow Prompts**:
   - Set up and deploy? `Y`
   - Which scope? (select your account)
   - Link to existing project? `N`
   - Project name: `healthtribe-web`
   - Directory: `./` (current directory is already apps/web)
   - Override settings? `N`

5. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter: https://healthtribe-backend.onrender.com
   
   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
   # Enter: pk_test_...
   
   vercel env add CLERK_SECRET_KEY production
   # Enter: sk_test_...
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Option B: Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your Git repository
4. Configure:
   - **Framework Preset**: `Next.js` (auto-detected)
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL = https://healthtribe-backend.onrender.com
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...
   CLERK_SECRET_KEY = sk_test_...
   ```

6. Click **"Deploy"**

7. **Wait for Deployment** (2-3 minutes)

8. **Get Production URL**
   - Example: `https://healthtribe-web.vercel.app`

---

### Step 3: Update Clerk Configuration

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **"API Keys"** → **"Domains"**
4. Add your Vercel production domain:
   - `https://healthtribe-web.vercel.app`
5. Save changes

---

## Post-Deployment Verification

### Backend Health Checks

1. **Health Endpoint**
   ```bash
   curl https://healthtribe-backend.onrender.com/health
   ```
   Expected: `{"status":"ok","version":"1.0.0"}`

2. **Readiness Check**
   ```bash
   curl https://healthtribe-backend.onrender.com/ready
   ```
   Expected: `{"status":"ready"}`

3. **API Documentation**
   - Visit: `https://healthtribe-backend.onrender.com/docs`
   - Should load Swagger UI

4. **Database Connection**
   - Check Render logs for successful migrations
   - Look for: `Running upgrade -> <revision>, <migration_name>`

### Frontend Verification

1. **Visit Production URL**
   ```
   https://healthtribe-web.vercel.app
   ```

2. **Test Authentication**
   - Click "Sign In"
   - Should redirect to Clerk authentication
   - After login, should redirect back

3. **Test API Connection**
   - Open browser DevTools → Network tab
   - Navigate through the app
   - API requests should go to your Render backend
   - Check for CORS errors (should be none)

4. **Check Console Logs**
   - Open browser DevTools → Console
   - Should be no errors related to API or environment variables

---

## Troubleshooting

### Backend Issues

#### Problem: Migration Errors
```
alembic.util.exc.CommandError: Can't locate revision identified by '...'
```

**Solution**:
```bash
# SSH into Render shell (from dashboard)
alembic downgrade base
alembic upgrade head
```

#### Problem: Database Connection Failed
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution**:
- Verify `POSTGRES_*` environment variables
- Use **internal** connection string, not external
- Check database is in same region as web service

#### Problem: Redis Connection Failed
```
redis.exceptions.ConnectionError
```

**Solution**:
- Verify `REDIS_URL` uses internal URL
- Temporarily comment out Redis operations if not critical
- Check Redis service is running

#### Problem: 500 Internal Server Error
```
Check Render logs for details
```

**Solution**:
```bash
# View logs in Render dashboard
# Common issues:
# 1. Missing environment variable
# 2. Import errors (check requirements.txt)
# 3. Database not migrated
```

### Frontend Issues

#### Problem: API_URL Not Defined
```
TypeError: Cannot read property of undefined
```

**Solution**:
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel environment variables
- Redeploy after adding variables
- Check variable has no trailing slash

#### Problem: CORS Errors
```
Access to fetch blocked by CORS policy
```

**Solution**:
- Verify backend CORS is set to `allow_origins=["*"]`
- Check Render logs for CORS-related errors
- Test backend directly: `curl -H "Origin: https://your-vercel-domain.vercel.app" https://your-render-backend.onrender.com/health`

#### Problem: Clerk Authentication Fails
```
Clerk: Invalid publishable key
```

**Solution**:
- Verify Clerk keys are correct
- Check Vercel domain is added to Clerk allowed origins
- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_`

#### Problem: Build Fails - Module Not Found
```
Error: Cannot find module '@healthtribe/...'
```

**Solution**:
- Monorepo issue - Vercel needs to install root dependencies
- Add to Vercel project settings:
  - **Root Directory**: `apps/web`
  - **Install Command**: `cd ../.. && npm install && cd apps/web`

---

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `POSTGRES_USER` | ✅ | `healthtribe` | From Render Postgres |
| `POSTGRES_PASSWORD` | ✅ | `***` | From Render Postgres |
| `POSTGRES_DB` | ✅ | `healthtribe_db` | Database name |
| `POSTGRES_HOST` | ✅ | `dpg-xxx-a` | Internal hostname |
| `POSTGRES_PORT` | ✅ | `5432` | Default Postgres port |
| `REDIS_URL` | ✅ | `redis://red-xxx:6379` | Internal Redis URL |
| `CLERK_SECRET_KEY` | ✅ | `sk_test_...` | From Clerk dashboard |
| `CLERK_PUBLISHABLE_KEY` | ✅ | `pk_test_...` | From Clerk dashboard |
| `GROQ_API_KEY` | ✅* | `gsk_...` | *At least one AI key required |
| `GROQ_MODEL` | ⚪ | `llama-3.3-70b-versatile` | Default model |
| `OPENROUTER_API_KEY` | ⚪ | `sk-or-...` | Alternative AI provider |
| `TOGETHER_API_KEY` | ⚪ | `...` | Alternative AI provider |

### Frontend (Vercel)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://healthtribe-backend.onrender.com` | No trailing slash |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | `pk_test_...` | Same as backend |
| `CLERK_SECRET_KEY` | ✅ | `sk_test_...` | Same as backend |

---

## Production Checklist

Before going live:

- [ ] Backend health endpoint returns 200 OK
- [ ] Database migrations completed successfully
- [ ] Redis connection working (check logs)
- [ ] API documentation accessible
- [ ] Frontend loads without console errors
- [ ] Authentication flow works end-to-end
- [ ] API requests succeed (check Network tab)
- [ ] No CORS errors
- [ ] All environment variables set correctly
- [ ] Clerk domain whitelist updated
- [ ] AI provider API key valid and has credits
- [ ] SSL certificates active (automatic on Render/Vercel)
- [ ] Custom domain configured (optional)

---

## Support

If you encounter issues not covered here:

1. **Check Logs**:
   - Render: Dashboard → Service → Logs
   - Vercel: Dashboard → Project → Deployments → View Function Logs

2. **Test Endpoints Individually**:
   ```bash
   # Backend health
   curl https://your-backend.onrender.com/health
   
   # Backend auth (should return 401)
   curl https://your-backend.onrender.com/api/v1/auth/me
   ```

3. **Verify Environment Variables**:
   - Render: Dashboard → Service → Environment
   - Vercel: Dashboard → Project → Settings → Environment Variables

---

## Estimated Costs

### Render (Backend)
- **Free Tier**: Limited hours, spins down after inactivity
- **Starter Plan**: $7/month (web service) + $7/month (Postgres) + $5/month (Redis) = **$19/month**
- **Professional**: Higher performance, starts at $15/month per service

### Vercel (Frontend)
- **Hobby**: Free (personal projects, non-commercial)
- **Pro**: $20/month per user (includes commercial use)

### Total Estimated Cost
- **Development/Testing**: $0-7/month (using free tiers)
- **Production**: ~$19-40/month (Render Starter + Vercel Pro)

---

## Next Steps

After successful deployment:

1. **Set up monitoring** (Render and Vercel provide basic monitoring)
2. **Configure custom domains** (optional)
3. **Set up automated backups** for Render Postgres
4. **Enable error tracking** (Sentry, LogRocket, etc.)
5. **Set up CI/CD** for automatic deployments on git push
6. **Configure rate limiting** and additional security measures

---

**Congratulations! Your HealthTribe application is now live in production! 🎉**
