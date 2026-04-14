import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel
from sqlalchemy.orm import Session
from routers.models import productos
from database import create_db_and_tables
from database import get_session
from routers import crud

load_dotenv()

secret_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=secret_key) if secret_key else None

app = FastAPI()

def obtener_contexto_productos(db: Session):
    productos = db.query(productos).all()

    texto_productos = "CATÁLOGO DE PRODUCTOS:\n"
    for p in productos:
        texto_productos += f"- {p.nombre}. Precio: ${p.precio}. Stock: {p.stock} \n"
    
    return texto_productos

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "https://okarrojas.github.io",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = "gemini-3.1-flash-lite-preview"

SYSTEM_PROMPT = """Eres Rozvi, el asistente virtual experto de la panadería artesanal ROZVI. 
Tu objetivo no es solo informar, sino actuar como un asesor de ventas inteligente.

REGLAS DE INTERACCIÓN:
1. PERSONALIDAD: Responde siempre en español, de forma muy amable, entusiasta y breve.
2. CONOCIMIENTO DE PRODUCTOS: Tienes acceso en tiempo real al catálogo. Úsalo para:
   - Identificar el producto más barato si el cliente tiene un presupuesto ajustado.
   - Recomendar productos que tengan stock disponible si otros están agotados.
   - Comparar opciones (ej: "Si buscas algo ligero, te recomiendo el X que cuesta solo Y").
3. PROACTIVIDAD: Si un cliente pregunta por un producto, menciona su precio y si quedan pocas unidades (stock bajo).
4. INFORMACIÓN DE CONTACTO:
   - Teléfono: +573001234567
   - Email: rozvi@gmail.com
   - Dirección: Calle 123 #45-67, Bogotá, Colombia.
5.quiero que ofrezcas ventas al por mayor, si el cliente parece interesado en comprar grandes cantidades, sugiere descuentos o promociones especiales.

OBJETIVO DE VENTA:
Si el cliente parece indeciso, sugiere el 'Pan de Arroz Artesanal' como nuestra especialidad de la casa.
Siempre prioriza la satisfacción del cliente con respuestas útiles que faciliten su compra."""


class Mensaje(BaseModel):
    historial: list[dict]


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def root():
    return {"mensaje": "La aplicación se ha iniciado correctamente."}


@app.post("/chat")
async def chat(data: Mensaje, db: Session = Depends(get_session)):

    if not secret_key or client is None:
        raise HTTPException(status_code=500, detail="Falta GEMINI_API_KEY en el backend.")

    contexto_db = obtener_contexto_productos(db)

    conversation_text = "\n".join(
        f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in data.historial
    )

    try:
        response = client.models.generate_content(
            model=MODEL,
            config={"system_instruction": f"{SYSTEM_PROMPT}\n y esta es la información de los productos:\n{contexto_db}"},
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
