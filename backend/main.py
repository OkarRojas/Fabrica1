from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from pydantic import BaseModel
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
secret_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=secret_key)


app = FastAPI()

# Permite requests desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # puerto de Vite
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
    historial: list[dict]  # [{"role": "user", "content": "..."}]

@app.post("/chat")
async def chat(data: Mensaje):
    if not secret_key:
        raise HTTPException(status_code=500, detail="Falta GEMINI_API_KEY en el backend.")

    # Convertimos el historial del frontend a un texto de contexto para Gemini.
    conversation_text = "\n".join(
        f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in data.historial
    )

    try:
        response = client.models.generate_content(
            model=MODEL,
            config={"system_instruction": SYSTEM_PROMPT},
            contents=conversation_text or "Hola"
        )
        reply = response.text or "Lo siento, no pude generar una respuesta en este momento."
        return {"respuesta": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en Gemini: {str(e)}")
