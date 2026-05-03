"""
Configuración compartida para los tests de pytest.
Usa SQLite en disco temporal para las pruebas.
"""
import os
import sys
import tempfile
from pathlib import Path
from typing import Generator

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Añadir el directorio actual al path para imports
sys.path.insert(0, str(Path(__file__).parent))

# Cargar variables de entorno
env_test_path = Path(__file__).resolve().parent / ".env.test"
env_path = Path(__file__).resolve().parent / ".env"

if env_test_path.exists():
    load_dotenv(dotenv_path=env_test_path)
else:
    load_dotenv(dotenv_path=env_path)

# Crear BD de prueba temporal
TEMP_DB_FILE = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
TEMP_DB_PATH = TEMP_DB_FILE.name
TEMP_DB_FILE.close()

SQLALCHEMY_TEST_DATABASE_URL = f"sqlite:///{TEMP_DB_PATH}"

# Crear engine de prueba
test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# ANTES de importar app, reemplazar el engine en database
import database as db_module
db_module.engine = test_engine
db_module.SessionLocal = TestingSessionLocal

# Ahora importar la app
from main import app
from database import get_session
from routers.models import Base

# Crear todas las tablas
Base.metadata.create_all(bind=test_engine)


def override_get_session() -> Generator[Session, None, None]:
    """Override de get_session para usar la BD de prueba."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Fixture que proporciona una sesión de BD para las pruebas."""
    db = TestingSessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="function")
def client(db_session: Session) -> TestClient:
    """Fixture que proporciona un cliente de prueba con BD inyectada."""
    # Inyectar la sesión de prueba en la app
    app.dependency_overrides[get_session] = override_get_session
    
    # Crear TestClient
    test_client = TestClient(app)
    
    yield test_client
    
    # Limpiar
    app.dependency_overrides.clear()


@pytest.fixture(scope="session", autouse=True)
def cleanup_db():
    """Limpiar la BD de prueba al finalizar la sesión."""
    yield
    # Limpiar
    if os.path.exists(TEMP_DB_PATH):
        try:
            os.unlink(TEMP_DB_PATH)
        except:
            pass
