import os


from dotenv import load_dotenv

load_dotenv()

llave_de_emergencia = os.getenv("llave_de_emergencia")
llave_maestra = os.getenv("llave_maestra", f"{llave_de_emergencia}")

print(f"llave_de_emergencia: {llave_de_emergencia}")
print(f"llave_maestra: {llave_maestra}", type(llave_maestra))