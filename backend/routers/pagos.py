import os
import uuid
from pathlib import Path
from typing import Any
from urllib.parse import quote

import mercadopago
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from database import get_session
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .webhooks_mp import procesar_webhook_mercadopago

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

router = APIRouter()
sdk = mercadopago.SDK(os.getenv("MP_ACCESS_TOKEN"))


class ItemCheckout(BaseModel):
    id: str
    title: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)


class CompradorCheckout(BaseModel):
    nombre: str = Field(min_length=1)
    email: str = Field(min_length=3)
    telefono: str = Field(min_length=5)


class PreferenciaRequest(BaseModel):
    items: list[ItemCheckout]
    comprador: CompradorCheckout
    pedido_id: int | None = None


@router.post("/crear-preferencia")
def crear_preferencia(payload: PreferenciaRequest):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Debes enviar al menos un item para pagar.")

    if "@" not in payload.comprador.email:
        raise HTTPException(status_code=400, detail="Debes enviar un email valido del comprador.")

    mp_access_token = os.getenv("MP_ACCESS_TOKEN")
    mp_public_key = os.getenv("MP_PUBLIC_KEY")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")

    missing_vars = []
    if not mp_access_token:
        missing_vars.append("MP_ACCESS_TOKEN")
    if not mp_public_key:
        missing_vars.append("MP_PUBLIC_KEY")

    if missing_vars:
        missing = ", ".join(missing_vars)
        raise HTTPException(
            status_code=500,
            detail=f"Faltan variables de entorno de Mercado Pago: {missing}.",
        )

    sdk = mercadopago.SDK(mp_access_token)

    mp_items = [
        {
            "id": item.id,
            "title": item.title,
            "quantity": item.quantity,
            "currency_id": "COP",
            "unit_price": float(item.unit_price),
        }
        for item in payload.items
    ]

    telefono_limpio = "".join(ch for ch in payload.comprador.telefono if ch.isdigit())
    payer_data: dict[str, Any] = {
        "name": payload.comprador.nombre,
        "email": payload.comprador.email,
    }
    if telefono_limpio:
        payer_data["phone"] = {
            "number": telefono_limpio,
        }

    preference_data: dict[str, Any] = {
        "items": mp_items,
        "payer": payer_data,
        "back_urls": {
            "success": f"{frontend_url}/pago-exitoso",
            "failure": f"{frontend_url}/pago-fallido",
            "pending": f"{frontend_url}/pago-pendiente",
        },
        "notification_url": f"{backend_url}/pagos/webhook",
        "statement_descriptor": "ROZVI",
    }

    if payload.pedido_id is not None:
        preference_data["external_reference"] = str(payload.pedido_id)
        preference_data["metadata"] = {"pedido_id": payload.pedido_id}
    else:
        preference_data["external_reference"] = f"ROZVI-{uuid.uuid4()}"

    if not frontend_url.startswith("http://localhost") and not frontend_url.startswith("http://127.0.0.1"):
        preference_data["auto_return"] = "approved"

    request_options = mercadopago.config.RequestOptions()
    request_options.custom_headers = {
        "x-idempotency-key": str(uuid.uuid4()),
    }

    try:
        preference_response = sdk.preference().create(preference_data, request_options)
        response_status = preference_response.get("status")
        preference = preference_response.get("response", {})
        if not isinstance(preference, dict):
            preference = {}

        preference_id = preference.get("id")
        if not preference_id:
            mp_message = preference.get("message") or preference_response.get("message")
            mp_cause = preference.get("cause") or preference_response.get("cause")
            raise HTTPException(
                status_code=500,
                detail={
                    "message": "Mercado Pago no devolvio un preference_id valido.",
                    "mp_status": response_status,
                    "mp_message": mp_message,
                    "mp_cause": mp_cause,
                    "mp_response": preference,
                },
            )

        sandbox_url = f"https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id={quote(str(preference_id))}"

        return {
            "preference_id": preference_id,
            "init_point": preference.get("init_point"),
            "sandbox_init_point": sandbox_url,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"No se pudo crear la preferencia de pago: {exc}",
        )


@router.post("/webhook")
async def webhook(request: Request, db: Session = Depends(get_session)):
    return await procesar_webhook_mercadopago(request, db, sdk)
