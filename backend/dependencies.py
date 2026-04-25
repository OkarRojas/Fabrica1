import os
from pathlib import Path

from dotenv import load_dotenv
from typing import Optional

from fastapi import Header, HTTPException

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

emergencia = os.getenv("llave-de-emergencia")
SECRET_KEY = os.getenv("llave-maestra", f"{emergencia}")


async def verify_secret_key(
    auto: Optional[str] = Header(default=None),
    x_secret_key: Optional[str] = Header(default=None),
    authorization: Optional[str] = Header(default=None),
):
    provided_key = auto or x_secret_key or authorization
    valid_values = {f"Bearer {SECRET_KEY}", SECRET_KEY}

    if provided_key not in valid_values:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return "Authorized"