import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import jwt
from routers import models
from database import get_session
from security import ALGORITHM, SECRET_KEY

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

emergencia = os.getenv("llave_de_emergencia")
ADMIN_SECRET_KEY = os.getenv("llave_maestra", f"{emergencia}")

# Define de dónde extrae el token el framework
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def obtener_admin_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_session)):
    excepcion_credenciales = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o expiradas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Intenta decodificar el token usando la firma secreta
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise excepcion_credenciales
    except Exception:
        raise excepcion_credenciales
        
    usuario = db.query(models.Cliente).filter(models.Cliente.email == email).first()
    if usuario is None:
        raise excepcion_credenciales
        
    # La validación central del Rol
    if not usuario.es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación denegada. Se requieren privilegios de administrador."
        )
        
    return usuario


async def verify_secret_key(
    auto: Optional[str] = Header(default=None),
    x_secret_key: Optional[str] = Header(default=None),
    authorization: Optional[str] = Header(default=None),
):
    provided_key = auto or x_secret_key or authorization
    valid_values = {f"Bearer {ADMIN_SECRET_KEY}", emergencia}

    if provided_key not in valid_values:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return "Authorized"