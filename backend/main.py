from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI()

# Permite requests desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # puerto de Vite
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "gemma2:2b"

SYSTEM_PROMPT = """Eres Rozvi, el asistente virtual de la panadería artesanal ROZVI.
Ayudas a los clientes a conocer los productos, precios y recomendaciones.
Productos disponibles:
- Pan de Arroz Artesanal - $4.99 - 250g
- Pandebono - $3.99 - 200g
- Pan de Yuca - $5.99 - 300g
- Jugo de Piña - $2.99 - 500ml
- Jugo de Naranja - $2.99 - 500ml
- Jugo Multifruta - $3.49 - 500ml
Responde siempre en español, de forma amable y breve."""

class Mensaje(BaseModel):
    historial: list[dict]  # [{"role": "user", "content": "..."}]

@app.post("/chat")
async def chat(data: Mensaje):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + data.historial

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(OLLAMA_URL, json={
            "model": MODEL,
            "messages": messages,
            "stream": False
        })

    result = response.json()
    reply = result["message"]["content"]
    return {"respuesta": reply}
