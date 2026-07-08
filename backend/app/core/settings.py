from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Project configuration
    PROJECT_NAME: str = "HealthTribe AI"
    API_V1_STR: str = "/api/v1"
    
    # Database - REQUIRED (no defaults for security)
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    POSTGRES_PORT: str = "5432"
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        
    # Redis - OPTIONAL (not used yet, safe to leave empty)
    REDIS_URL: str = ""
    
    # Clerk Authentication - REQUIRED
    CLERK_SECRET_KEY: str
    CLERK_PUBLISHABLE_KEY: str
    CLERK_JWT_PUBLIC_KEY: str = ""  # Optional: PEM format for faster JWT verification
    
    # AI Providers - At least one API key should be set
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "openai/gpt-4o-mini"
    TOGETHER_API_KEY: str = ""
    TOGETHER_MODEL: str = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore",
        case_sensitive=True
    )

def get_settings() -> Settings:
    return Settings()
