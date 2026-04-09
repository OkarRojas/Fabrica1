import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel

from database import create_db_and_tables
from routers import crud

load_dotenv()

secret_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=secret_key) if secret_key else None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = "gemini-3.1-flash-lite-preview"

SYSTEM_PROMPT = """Eres Rozvi, el asistente virtual de la panadería artesanal ROZVI.
Ayudas a los clientes a conocer los productos, precios y recomendaciones.
Productos disponibles:
- Pan de Arroz Artesanal - $4.99 - 250g
- Pandebono - $3.99 - 200g
- Pan de Yuca - $5.99 - 300g
- Jugo de Piña - $2.99 - 500ml
- Jugo de Naranja - $2.99 - 500ml
- Jugo Multifruta - $3.49 - 500ml
adicionalmete debes saber que los medios de comunicacion que pueden usar los clientes
son:
numero de telefono: +573001234567
correo electronico: rozvi@gmail.com
direccion: Calle 123 #45-67, Bogotá, Colombia
Responde siempre en español, de forma amable y breve."""


class Mensaje(BaseModel):
    historial: list[dict]


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def root():
    return {"mensaje": "La aplicación se ha iniciado correctamente."}


@app.post("/chat")
async def chat(data: Mensaje):
    if not secret_key or client is None:
        raise HTTPException(status_code=500, detail="Falta GEMINI_API_KEY en el backend.")

    conversation_text = "\n".join(
        f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in data.historial
    )

    try:
        response = client.models.generate_content(
            model=MODEL,
            config={"system_instruction": SYSTEM_PROMPT},
            contents=conversation_text or "Hola",
        )
        reply = response.text or "Lo siento, no pude generar una respuesta en este momento."
        return {"respuesta": reply}
    except Exception as e:
        error_msg = str(e)
        if "PERMISSION_DENIED" in error_msg or "API key was reported as leaked" in error_msg:
            raise HTTPException(
                status_code=500,
                detail="Tu GEMINI_API_KEY fue revocada o marcada como filtrada. Genera una nueva key y actualiza tu .env.",
            )
        raise HTTPException(status_code=500, detail=f"Error en Gemini: {error_msg}")


app.include_router(crud.router, prefix="/crud", tags=["crud"])
