import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_MB", "100"))
