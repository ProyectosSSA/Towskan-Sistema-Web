import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")


class Config:
    """Configuración base de la aplicación Towskan."""
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key_towskan_default")
    JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
    
    # Base de datos
    db_url = os.getenv("DATABASE_URL", "sqlite:///towskan.db")
    if db_url.startswith("sqlite:///") and not db_url.startswith("sqlite:////"):
        # Asegurar ruta absoluta para SQLite relativa a la carpeta backend
        db_path = BASE_DIR / db_url.replace("sqlite:///", "")
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"
    else:
        SQLALCHEMY_DATABASE_URI = db_url

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.getenv("FLASK_ENV") == "development"

    # CORS
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
        if origin.strip()
    ]
