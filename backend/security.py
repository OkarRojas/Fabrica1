import bcrypt

def obtener_hash_password(password: str) -> str:
    """Transforma la contraseña plana en un hash seguro."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verificar_password(plain_password: str, hashed_password: str) -> bool:
    """Compara una contraseña ingresada con el hash guardado."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )