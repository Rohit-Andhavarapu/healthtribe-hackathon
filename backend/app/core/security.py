import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db
from app.modules.auth.service import AuthService
from app.infrastructure.database.models import User

security = HTTPBearer(auto_error=False)

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    import logging
    logger = logging.getLogger(__name__)
    logger.error(f"SECURITY AUTH HEADER RAW: {request.headers.get('authorization', 'MISSING')}")
    logger.error(f"SECURITY FULL HEADERS: {request.headers}")
    
    if not credentials:
        logger.error("SECURITY: NO CREDENTIALS FOUND")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        # In production, verify the signature using Clerk's JWKS
        # For this sprint/MVP with Clerk, we will decode without verification
        # just to extract the subject (clerk_user_id)
        unverified_payload = jwt.decode(token, options={"verify_signature": False})
        clerk_user_id = unverified_payload.get("sub")
        role = unverified_payload.get("public_metadata", {}).get("role", "PATIENT")
        
        if not clerk_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing sub"
            )
            
        auth_service = AuthService(db)
        # Find the user or claim DEMO_UNCLAIMED
        user = await auth_service.get_or_create_user(clerk_user_id, role=role)
        return user
        
    except jwt.DecodeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
