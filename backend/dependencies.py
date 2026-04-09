import os

from dotenv import load_dotenv
from fastapi import Header, HTTPException

load_dotenv()

emergencia = os.getenv("llave-de-emergencia")
SECRET_KEY = os.getenv("llave-maestra", f"{emergencia}")


async def verify_secret_key(auto: str = Header(...)):
    if auto != f"Bearer {SECRET_KEY}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    return "Authorized"