import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel
from sqlalchemy.orm import Session
from routers.models import productos as ProductoModel
from routers.models import Cliente as ClienteModel
from database import create_db_and_tables, SessionLocal
from database import get_session
from routers import crud
from routers import pagos
from security import obtener_hash_password

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

secret_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=secret_key) if secret_key else None

app = FastAPI()

frontend_url = os.getenv("FRONTEND_URL")

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "https://okarrojas.github.io",
]
if frontend_url:
    default_origins.append(frontend_url)

def obtener_contexto_productos(db: Session):
    productos_db = db.query(ProductoModel).all()

    texto_productos = "CATÁLOGO DE PRODUCTOS:\n"
    for p in productos_db:
        texto_productos += f"- {p.nombre}. Precio: ${p.precio}. Stock: {p.stock} \n"
    
    return texto_productos


def seed_productos_iniciales():
    db = SessionLocal()
    try:
        hay_productos = db.query(ProductoModel).first()
        if hay_productos:
            return

        productos_iniciales = [
            ProductoModel(nombre="Pan de Arroz Artesanal", descripcion="Tradicional", precio=4.99, stock=50),
            ProductoModel(nombre="Pan de Arroz Artesanal Queso", descripcion="Con queso", precio=5.49, stock=40),
            ProductoModel(nombre="Pan de Arroz Artesanal Integral", descripcion="Version integral", precio=5.99, stock=35),
            ProductoModel(nombre="Pan de Arroz Artesanal Mini", descripcion="Presentacion mini", precio=3.99, stock=80),
            ProductoModel(nombre="Pan de Arroz Artesanal Grande", descripcion="Presentacion familiar", precio=8.99, stock=25),
            ProductoModel(nombre="Pan de Arroz Artesanal Mix", descripcion="Surtido", precio=6.99, stock=30),
        ]
        db.add_all(productos_iniciales)
        db.commit()
    finally:
        db.close()


def seed_admin_user():
    db = SessionLocal()
    try:
        admin_existente = db.query(ClienteModel).filter(ClienteModel.email == "admin@rozvi.com").first()
        if admin_existente:
            return

        admin = ClienteModel(
            nombre="Administrador ROZVI",
            email="admin@rozvi.com",
            telefono="3000000000",
            hashed_password=obtener_hash_password("Admin123!"),
            es_admin=True,
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    seed_productos_iniciales()
    seed_admin_user()


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
app.include_router(pagos.router, prefix="/pagos", tags=["pagos"])
