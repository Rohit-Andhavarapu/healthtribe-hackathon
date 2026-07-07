from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "HealthTribe AI"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_USER: str = "healthtribe"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "healthtribe_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5433"
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        
    # Redis
    REDIS_URL: str = "redis://localhost:6380/0"
    
    # Clerk
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_JWT_PUBLIC_KEY: str = "" # Set in prod for faster local verification
    
    # AI
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "openai/gpt-oss-120b"
    TOGETHER_API_KEY: str = ""
    TOGETHER_MODEL: str = "openai/gpt-oss-120b"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

def get_settings() -> Settings:
    return Settings()
