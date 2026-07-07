# HealthTribe Deployment Guide

This guide explains how to deploy the HealthTribe platform to production.

## Architecture Overview
- **Frontend**: Next.js 16 App Router (React)
- **Backend**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL (Relational Data), Redis (Caching & Rate Limiting)
- **Authentication**: Clerk (JWT-based)

---

## 1. Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ (for frontend)
- Python 3.10+ (for backend)
- Clerk Account (Publishable Key & Secret Key)
- OpenAI API Key (for AI features)

---

## 2. Environment Variables

### Backend (`backend/.env`)
```ini
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=healthtribe
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=sk_...
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]
CLERK_SECRET_KEY=sk_...
```

### Frontend (`apps/web/.env.local`)
```ini
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 3. Database Setup

1. Start PostgreSQL and Redis:
   ```bash
   docker-compose up -d
   ```
2. Run database migrations:
   ```bash
   cd backend
   uv run alembic upgrade head
   ```

---

## 4. Backend Deployment (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   uv sync
   ```
3. Start the production server (using Uvicorn with multiple workers):
   ```bash
   uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

*(Alternatively, use Docker to build and run the backend container.)*

---

## 5. Frontend Deployment (Next.js)

The frontend is configured with `output: 'standalone'` for optimized deployment.

1. Navigate to the frontend directory:
   ```bash
   cd apps/web
   ```
2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
3. Start the production server:
   ```bash
   # When using standalone output, run the generated server.js
   node .next/standalone/server.js
   ```

---

## 6. Security Considerations (Production Audit)
- **Authentication**: Demo overrides and Admin portals have been explicitly disabled. Ensure no `demo_user_id` cookies are accepted in the production middleware.
- **CORS**: Restrict `CORS_ORIGINS` in the backend `.env` to your exact frontend domain.
- **SSL/TLS**: Use a reverse proxy (e.g., Nginx, Traefik, or Caddy) to terminate HTTPS for both the frontend and backend.
- **Database**: Do not expose PostgreSQL (port 5432) or Redis (port 6379) directly to the public internet.

---

## 7. Post-Deployment Verification
1. Access the frontend URL and verify the Sign In flow via Clerk.
2. Ensure the Profile section loads data from the backend correctly.
3. Verify that the AI Assistant returns expected responses (requires valid OpenAI key).
4. Verify both Patient and Doctor views function properly.
