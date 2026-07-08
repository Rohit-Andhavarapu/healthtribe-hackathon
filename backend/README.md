# HealthTribe Backend API

FastAPI-based backend for the HealthTribe AI health management platform.

---

## Quick Start (Development)

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis 7+

### Setup

1. **Clone and Navigate**
   ```bash
   cd backend
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment**
   ```bash
   # Copy template
   cp .env.example .env
   
   # Edit .env with your values
   # - Database credentials
   # - Redis URL
   # - Clerk keys
   # - AI provider key (GROQ recommended)
   ```

5. **Run Migrations**
   ```bash
   alembic upgrade head
   ```

6. **Start Server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

7. **Access API**
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - Health: http://localhost:8000/health

---

## Environment Variables

See `.env.example` for complete list. Required variables:

### Database (PostgreSQL)
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name
- `POSTGRES_HOST` - Database host
- `POSTGRES_PORT` - Database port (default: 5432)

### Cache (Redis)
- `REDIS_URL` - Redis connection string (format: `redis://host:port/db`)

### Authentication (Clerk)
- `CLERK_SECRET_KEY` - Clerk secret key (from dashboard)
- `CLERK_PUBLISHABLE_KEY` - Clerk publishable key

### AI Provider (at least one required)
- `GROQ_API_KEY` - GROQ API key (recommended)
- `GROQ_MODEL` - Model name (default: `llama-3.3-70b-versatile`)

*Alternative AI providers: OpenRouter, Together AI (see .env.example)*

---

## Project Structure

```
backend/
├── alembic/              # Database migrations
│   └── versions/         # Migration scripts
├── app/
│   ├── core/             # Core configuration
│   │   ├── settings.py   # Environment settings
│   │   └── security.py   # Authentication
│   ├── infrastructure/   # Infrastructure layer
│   │   └── database/     # Database models and session
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication
│   │   ├── timeline/     # Health timeline
│   │   ├── appointments/ # Appointments
│   │   ├── doctors/      # Doctor management
│   │   ├── profile/      # User profiles
│   │   ├── ai/           # AI assistant
│   │   ├── clinical/     # Clinical data
│   │   └── abha/         # ABHA integration
│   ├── shared/           # Shared utilities
│   └── main.py           # FastAPI application
├── .env.example          # Environment template
├── requirements.txt      # Python dependencies
├── runtime.txt           # Python version
├── render.yaml           # Render deployment config
└── alembic.ini           # Alembic configuration
```

---

## API Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /ready` - Readiness probe
- `GET /live` - Liveness probe

### API Documentation
- `GET /docs` - Swagger UI
- `GET /redoc` - ReDoc UI
- `GET /openapi.json` - OpenAPI schema

### API Routes (v1)
All routes prefixed with `/api/v1`:

- `/auth` - Authentication & user management
- `/timeline` - Health timeline events
- `/appointments` - Appointment management
- `/doctors` - Doctor profiles & search
- `/hospitals` - Hospital information
- `/benefits` - Health benefits & insurance
- `/family` - Family member management
- `/labs` - Lab reports & orders
- `/profile` - User profile & settings
- `/ai` - AI assistant chat
- `/clinical` - Clinical data (medications, orders)
- `/abha` - ABHA identity & health records
- `/consent` - Consent management

---

## Database

### Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one version
alembic downgrade -1

# Rollback all
alembic downgrade base

# View current version
alembic current

# View migration history
alembic history
```

### Models

SQLAlchemy async models in `app/infrastructure/database/models.py`:
- User
- PatientProfile / DoctorProfile
- TimelineEvent
- Appointment
- MedicationOrder / LabOrder
- EmergencyContact
- MedicalInformation
- And more...

---

## Authentication

Uses **Clerk** for authentication:

1. Frontend gets JWT from Clerk
2. JWT sent in `Authorization: Bearer <token>` header
3. Backend validates JWT with Clerk public key
4. User identified and authorized

### Protected Endpoints

Most endpoints require authentication. Use the `get_current_user` dependency:

```python
from app.core.security import get_current_user

@router.get("/protected")
async def protected_route(user: User = Depends(get_current_user)):
    return {"user_id": user.id}
```

---

## Development

### Code Style

- **Formatting**: Follow PEP 8
- **Type Hints**: Use throughout
- **Async/Await**: Use for all I/O operations
- **Error Handling**: Use FastAPI HTTPException

### Adding a New Module

1. Create module directory: `app/modules/my_module/`
2. Create files:
   - `router.py` - FastAPI routes
   - `service.py` - Business logic
   - `schemas.py` - Pydantic models
   - `models.py` - Database models (if needed)
3. Register router in `app/main.py`
4. Create migration if database changes
5. Update API docs

---

## Deployment

### Render (Recommended)

**One-Click Deploy**:
1. See `render.yaml` for configuration
2. Push to Git repository
3. Create Render Blueprint from repository
4. Set environment variables
5. Deploy automatically

**Manual Deploy**:
See [../DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions.

### Other Platforms

Requirements:
- Python 3.11+
- PostgreSQL database
- Redis cache
- Environment variables set
- Run migrations: `alembic upgrade head`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## Testing

### Manual Testing

Use the Swagger UI at `/docs` for interactive testing.

### Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### Authenticated Request

```bash
# Get token from Clerk (use frontend or API)
TOKEN="your_jwt_token"

# Make authenticated request
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8000/api/v1/auth/me
```

---

## Troubleshooting

### Database Connection Errors

```
sqlalchemy.exc.OperationalError: could not connect
```

**Solutions**:
1. Verify PostgreSQL is running
2. Check `POSTGRES_*` environment variables
3. Verify database exists: `psql -U postgres -l`
4. Check firewall/network settings

### Redis Connection Errors

```
redis.exceptions.ConnectionError
```

**Solutions**:
1. Verify Redis is running: `redis-cli ping`
2. Check `REDIS_URL` environment variable
3. Verify Redis is accessible

### Migration Errors

```
alembic.util.exc.CommandError
```

**Solutions**:
1. Check database connection
2. Verify migrations directory exists
3. Check `alembic.ini` configuration
4. Try: `alembic downgrade base && alembic upgrade head`

### Import Errors

```
ModuleNotFoundError: No module named 'xxx'
```

**Solutions**:
1. Activate virtual environment
2. Install dependencies: `pip install -r requirements.txt`
3. Check Python version: `python --version` (should be 3.11+)

### Clerk Authentication Fails

```
401 Unauthorized
```

**Solutions**:
1. Verify `CLERK_SECRET_KEY` is set correctly
2. Check token is valid (not expired)
3. Verify token is sent in `Authorization: Bearer <token>` format
4. Check Clerk dashboard for API status

---

## Performance

### Database
- Connection pooling enabled (SQLAlchemy default)
- Async operations throughout
- Eager loading for related data (selectinload)

### Caching
- Redis for session storage and caching
- Consider implementing cache decorators for expensive queries

### Optimization Tips
1. Use database indexes on foreign keys
2. Limit query results with pagination
3. Use async operations for all I/O
4. Enable Redis for caching frequently accessed data

---

## Security

### Best Practices Implemented

✅ **No Hardcoded Secrets** - All secrets in environment variables  
✅ **JWT Authentication** - Clerk-based authentication  
✅ **SQL Injection Protection** - SQLAlchemy ORM  
✅ **CORS Configured** - Properly configured for production  
✅ **HTTPS Ready** - Works behind reverse proxies (Render, Railway)  
✅ **Input Validation** - Pydantic models validate all input  

### Security Checklist

- [ ] Environment variables set correctly
- [ ] Database credentials secure
- [ ] Clerk API keys valid
- [ ] HTTPS enabled in production
- [ ] Regular dependency updates
- [ ] Database backups configured

---

## Monitoring

### Health Checks

Monitor these endpoints:
- `/health` - Basic health (200 = OK)
- `/ready` - Database connectivity (200 = ready)
- `/live` - Application alive (200 = alive)

### Logging

Logs are written to stdout. Configure log aggregation in production:
- Render: Built-in log viewer
- Other: Use log aggregation service (e.g., Logtail, Papertrail)

### Metrics

Consider adding:
- Request rate monitoring
- Error rate tracking
- Database query performance
- API response times

---

## Support

### Documentation
- [Deployment Guide](../DEPLOYMENT.md) - Full deployment instructions
- [Production Readiness Report](../PRODUCTION_READINESS_REPORT.md) - Audit results
- [Quick Deploy Guide](../QUICK_DEPLOY.md) - Fast deployment reference
- [Changes Summary](../CHANGES_SUMMARY.md) - What changed for production

### External Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Clerk Documentation](https://clerk.com/docs)
- [Render Documentation](https://render.com/docs)

---

## License

[Your License Here]

---

## Contributing

[Your Contributing Guidelines Here]

---

**Version**: 1.0.0  
**Last Updated**: 2026-07-08  
**Python Version**: 3.11+  
**Framework**: FastAPI 0.115+
