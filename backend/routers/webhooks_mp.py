from __future__ import annotations

from typing import Any

from fastapi import HTTPException, Request
from sqlalchemy.orm import Session

from routers import models


async def procesar_webhook_mercadopago(request: Request, db: Session, sdk: Any):
    if sdk is None:
        raise HTTPException(status_code=500, detail="Falta configurar Mercado Pago en el backend.")

    datos = await request.json()
    tema = request.query_params.get("topic") or datos.get("type")

    if tema not in ["payment", "payment.created", "payment.updated"]:
        return {"status": "ok"}

    pago_id = datos.get("data", {}).get("id")
    if not pago_id:
        return {"status": "ok"}

    respuesta_pago = sdk.payment().get(pago_id)
    info_pago = respuesta_pago.get("response")

    if not info_pago or info_pago.get("status") != "approved":
        return {"status": "ok"}

    pedido_id = _obtener_pedido_id(info_pago)
    if pedido_id is None:
        return {"status": "ok"}

    pedido_db = db.query(models.Pedido).filter(models.Pedido.id == pedido_id).first()
    if not pedido_db:
        print(f"[Webhook MP] Pedido no encontrado: {pedido_id}")
        return {"status": "ok"}

    if pedido_db.estado == "Pagado":
        return {"status": "ok"}

    detalles_pedido = list(pedido_db.items)
    actualizaciones_stock = []

    for detalle in detalles_pedido:
        producto_db = (
            db.query(models.productos)
            .filter(models.productos.id == detalle.producto_id)
            .first()
        )

        if not producto_db:
            print(
                f"[Webhook MP] Producto no encontrado para pedido {pedido_id}: "
                f"producto_id={detalle.producto_id}"
            )
            db.rollback()
            return {"status": "ok"}

        if producto_db.stock < detalle.cantidad:
            print(
                f"[Webhook MP] Stock insuficiente para pedido {pedido_id}: "
                f"producto_id={producto_db.id}, stock_actual={producto_db.stock}, "
                f"cantidad_solicitada={detalle.cantidad}"
            )
            db.rollback()
            return {"status": "ok"}

        actualizaciones_stock.append((producto_db, detalle.cantidad))

    try:
        for producto_db, cantidad_comprada in actualizaciones_stock:
            producto_db.stock -= cantidad_comprada
            db.add(producto_db)

        pedido_db.estado = "Pagado"
        db.add(pedido_db)
        db.commit()
    except Exception as error:
        db.rollback()
        print(f"[Webhook MP] Error procesando inventario del pedido {pedido_id}: {error}")

    return {"status": "ok"}


def _obtener_pedido_id(info_pago: dict[str, Any]) -> int | None:
    referencia = info_pago.get("external_reference")
    pedido_id = _parsear_entero(referencia)
    if pedido_id is not None:
        return pedido_id

    metadata = info_pago.get("metadata") or {}
    if isinstance(metadata, dict):
        for clave in ("pedido_id", "order_id", "pedidoId", "orderId"):
            pedido_id = _parsear_entero(metadata.get(clave))
            if pedido_id is not None:
                return pedido_id

    return None


def _parsear_entero(valor: Any) -> int | None:
    if valor is None:
        return None

    try:
        return int(valor)
    except (TypeError, ValueError):
        return None