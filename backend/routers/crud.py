from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from security import obtener_hash_password, verificar_password
from database import get_session
from dependencies import verify_secret_key
from sqlalchemy.sql import func

from sqlalchemy.orm import Session

import mercadopago
import os
from urllib.parse import quote
import security
from dependencies import obtener_admin_actual


from .models import (
    productos,
    productosUpdate,
    productosCreate,
    productosRead,
    pedidoCreate,
    PedidoRead,
    ClienteCreate,
    ClienteLogin,
    ClienteRead,
    ClienteLoginResponse,
)
from routers import models

router = APIRouter()
load_dotenv()  # Carga las variables de entorno desde el archivo .env
sdk = mercadopago.SDK(os.getenv("MP_ACCESS_TOKEN"))

@router.post("/productos/", response_model=productosRead)
def create_productos(payload: productosCreate, session: Session = Depends(get_session)):
    db_productos = productos(
        nombre=payload.nombre,
        precio=payload.precio,
        stock=payload.stock,
        descripcion=payload.descripcion,
    )
    session.add(db_productos)
    session.commit()
    session.refresh(db_productos)
    return db_productos


@router.get("/productos/")
def read_productos(session: Session = Depends(get_session)):
    productos_list = session.query(productos).all()
    return productos_list

@router.post("/clientes/login/", response_model=ClienteLoginResponse)
def login_usuario(payload: ClienteLogin, session: Session = Depends(get_session)):
    usuario = session.query(models.Cliente).filter(models.Cliente.email == payload.email).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales invalidas")

    if not usuario.hashed_password or not verificar_password(payload.password, usuario.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales invalidas")

    token_acceso = security.crear_token_acceso(
        data={"sub": usuario.email, "es_admin": usuario.es_admin}
    )

    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "telefono": usuario.telefono,
        "es_admin": usuario.es_admin,
        "access_token": token_acceso,
        "token_type": "bearer",
    }

@router.get("/clientes/")
def leer_usuarios(session: Session = Depends(get_session)):
    usuarios = session.query(models.Cliente).all()
    return usuarios

@router.post("/pedidos/", response_model=PedidoRead)
def crear_pedido(datos_pedido: pedidoCreate, db: Session = Depends(get_session)):
    total = 0
    productos_a_actualizar = []
    
    try:
        if not datos_pedido.productos:
            raise HTTPException(status_code=400, detail="Debes enviar al menos un producto para crear el pedido.")

        # 1. Validación de stock y cálculo de total (tu lógica original)
        for item in datos_pedido.productos:
            if item is None:
                continue

            producto_id = item.get("producto_id") if isinstance(item, dict) else item.producto_id
            cantidad = item.get("cantidad") if isinstance(item, dict) else item.cantidad
            
            producto = db.query(models.productos).filter(models.productos.id == producto_id).first()
            if not producto:
                raise HTTPException(status_code=404, detail=f"Producto {producto_id} no existe")
            
            if producto.stock >= cantidad:
                total += cantidad * producto.precio
                productos_a_actualizar.append((producto, cantidad))
            else:
                raise HTTPException(status_code=400, detail=f"No hay stock de {producto.nombre}")

        # 2. LÓGICA DE LA "CUENTA SOMBRA" 👤
        # Aquí decidimos de quién es el pedido
        id_final_cliente = datos_pedido.usuario_id

        if id_final_cliente is None:
            # Si no hay ID, es un invitado. ¡Creamos el cliente ahora mismo!
            nuevo_usuario_sombra = models.Cliente(
                nombre=datos_pedido.cliente_sombra or "Invitado ROZVI",
                telefono=datos_pedido.telefono,
                email=None,            # Los invitados no suelen dar email al inicio
                hashed_password=None   # Sin contraseña porque es una Cuenta Sombra
            )
            db.add(nuevo_usuario_sombra)
            
            # EL PASO CLAVE: db.flush()
            # Le dice a la DB: "Registra esto un momento pero no cierres la transacción".
            # La DB genera el ID (el número) y se lo devuelve al objeto.
            db.flush() 
            
            # Ahora ya tenemos un número real para usar
            id_final_cliente = nuevo_usuario_sombra.id

        # 3. CREACIÓN DEL PEDIDO
        # Usamos id_final_cliente, que siempre será un NÚMERO entero.
        nuevo_pedido = models.Pedido(
            cliente_id=id_final_cliente,
            total=total,
            estado="Pendiente",
            direccion_entrega=datos_pedido.direccion_entrega,
            # --- AQUÍ ESTABA EL ERROR: Faltaban estas dos líneas ---
            telefono=datos_pedido.telefono,         
            cliente_sombra=datos_pedido.cliente_sombra 
        )
        db.add(nuevo_pedido)
        db.flush() # Obtenemos el ID del pedido para los detalles

        # 4. Guardar los detalles del pedido sin descontar stock; el webhook lo confirma al aprobarse el pago.
        for producto_obj, cantidad_pedida in productos_a_actualizar:
            detalle = models.DetallePedido(
                pedido_id=nuevo_pedido.id,
                producto_id=producto_obj.id,
                cantidad=cantidad_pedida,
                precio_unitario=producto_obj.precio
            )
            db.add(detalle)

        # 5. FINALIZAR
        db.commit() # Si todo salió bien, guardamos todo permanentemente
        db.refresh(nuevo_pedido)
        
        preference_data = {
            "items": [
                {
                    "title": "Pedido ROZVI - Panadería",
                    "quantity": 1,
                    "unit_price": float(total), # Asegúrate de que sea float
                    "currency_id": "COP"
                }
            ],
            "back_urls": {
                "success": "http://localhost:5173/pago-exitoso", # Ruta en tu React
                "failure": "http://localhost:5173/pago-fallido",
                "pending": "http://localhost:5173/pago-pendiente"
            },
            "auto_return": "approved",
            "external_reference": str(nuevo_pedido.id) # Vinculamos el pago con el ID del pedido
        }

        try:
            # Generamos la preferencia en los servidores de Mercado Pago
            preference_response = sdk.preference().create(preference_data)
            preference = preference_response.get("response")

            if preference is None:
                print("[MercadoPago] Respuesta completa sin 'response':", preference_response)
                raise HTTPException(
                    status_code=500,
                    detail={
                        "message": "Mercado Pago no devolvio el campo 'response'.",
                        "mp_response": preference_response,
                    },
                )

            preference_id = preference.get("id")
            if not preference_id:
                print("[MercadoPago] No se encontro id de preferencia. Respuesta completa:", preference_response)
                raise HTTPException(
                    status_code=500,
                    detail={
                        "message": "Mercado Pago no devolvio el id de preferencia.",
                        "mp_response": preference_response,
                    },
                )

            # Construimos URL canónica de sandbox para evitar rutas /login con preference-id
            link_de_pago = f"https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id={quote(str(preference_id))}"
        except HTTPException:
            raise
        except Exception as mp_error:
            print("[MercadoPago] Error al crear preferencia:", mp_error)
            raise HTTPException(
                status_code=500,
                detail=f"Error al crear preferencia en Mercado Pago: {mp_error}",
            )

        # Devolvemos el objeto del pedido más el link de pago
        # Nota: Asegúrate de que tu modelo 'PedidoRead' en models.py acepte el campo 'payment_link'
        return {
            "id": nuevo_pedido.id,
            "usuario_id": nuevo_pedido.cliente_id,
            "cliente_sombra": nuevo_pedido.cliente_sombra,
            "fecha": nuevo_pedido.fecha,
            "total": nuevo_pedido.total,
            "estado": nuevo_pedido.estado,
            "direccion_entrega": nuevo_pedido.direccion_entrega,
            "telefono": nuevo_pedido.telefono,
            "items": [
                {
                    "producto_id": item.producto_id,
                    "cantidad": item.cantidad,
                    "precio_unitario": item.precio_unitario
                } for item in nuevo_pedido.items
            ],
            "payment_link": link_de_pago # <-- Este es el dato clave para React
        } # Pydantic se encarga de formatear la respuesta

    except HTTPException:
        db.rollback() # Si algo falló, deshacemos todo para no dejar basura en la DB
        raise
    except Exception as e:
        db.rollback() # Si algo falló, deshacemos todo para no dejar basura en la DB
        raise HTTPException(status_code=500, detail=f"Error en ROZVI: {str(e)}")


    
@router.get("/pedidos/")
def leer_pedidos(db: Session = Depends(get_session)):
    pedidos = db.query(models.Pedido).all()
    return [
        {
            "id": pedido.id,
            "usuario_id": pedido.cliente_id,
            "fecha": pedido.fecha,
            "total": pedido.total,
            "estado": pedido.estado,
            "direccion_entrega": pedido.direccion_entrega,
            "items": [
                {
                    "producto_id": item.producto_id,
                    "cantidad": item.cantidad,
                    "precio_unitario": item.precio_unitario,
                }
                for item in pedido.items
            ],
        }
        for pedido in pedidos
    ]


@router.put("/productos/{productos_id}", response_model=productosRead, dependencies=[Depends(verify_secret_key)])
def update_productos(
    productos_id: int,
    payload: productosUpdate,
    session: Session = Depends(get_session),
):
    db_productos = session.get(productos, productos_id)
    if not db_productos:
        raise HTTPException(status_code=404, detail="Productos not found")
    for key, value in payload.model_dump().items():
        setattr(db_productos, key, value)
    session.commit()
    session.refresh(db_productos)
    return db_productos


@router.delete("/productos/{productos_id}", dependencies=[Depends(verify_secret_key)])
def delete_productos(productos_id: int, session: Session = Depends(get_session)):
    db_productos = session.get(productos, productos_id)
    if not db_productos:
        raise HTTPException(status_code=404, detail="Productos not found")
    session.delete(db_productos)
    session.commit()
    return {"detail": "Productos deleted successfully"}


@router.patch("/productos/{productos_id}", response_model=productosRead, dependencies=[Depends(verify_secret_key)])
def actualizar_stock_productos(productos_id: int, payload: productosUpdate, session: Session = Depends(get_session)):
    db_productos = session.get(productos, productos_id)
    if not db_productos:
        raise HTTPException(status_code=404, detail="Productos not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_productos, key, value)

    session.add(db_productos)
    session.commit()
    session.refresh(db_productos)

    return db_productos





@router.post("/clientes/", response_model=ClienteRead)
def crear_usuario(payload: ClienteCreate, session: Session = Depends(get_session)):
    # 1. Generamos el hash de la contraseña que viene en el payload
    hash_seguro = obtener_hash_password(payload.password)
    
    nuevo_usuario = models.Cliente(
        nombre=payload.nombre,
        email=payload.email,
        telefono=payload.telefono,
        hashed_password=hash_seguro # <-- Aquí guardamos la seguridad
    )
    session.add(nuevo_usuario)
    session.commit()
    session.refresh(nuevo_usuario)
    return nuevo_usuario


@router.get("/admin/stats/")
def obtener_estadisticas(
    db: Session = Depends(get_session),
    admin_user: models.Cliente = Depends(obtener_admin_actual),
):
    total_pedidos = db.query(models.Pedido).count()
    total_clientes = db.query(models.Cliente).count()
    total_productos = db.query(models.productos).count()
    ingresos_totales = db.query(func.coalesce(func.sum(models.Pedido.total), 0)).scalar() or 0

    productos_top_query=(
        db.query(
            models.productos.id,
            models.productos.nombre,
            func.sum(models.DetallePedido.cantidad).label("total_vendido")
        )
        .join(models.DetallePedido, models.productos.id == models.DetallePedido.producto_id)
        .group_by(models.productos.id)
        .order_by(func.sum(models.DetallePedido.cantidad).desc())
        .limit(5)
    )

    alertas_stock_query = (
        db.query(models.productos.id, models.productos.nombre, models.productos.stock)
        .filter(models.productos.stock < 10)
        .all()
    )

    productos_top = [
        {
            "id": p.id,
            "nombre": p.nombre,
            "total_vendido": p.total_vendido
        }
        for p in productos_top_query
    ]

    alertas_stock = [
        {
            "id": p.id,
            "nombre": p.nombre,
            "stock": p.stock
        }
        for p in alertas_stock_query
    ]

    return {
        "ingresos_totales": float(ingresos_totales),
        "total_pedidos": total_pedidos,
        "total_clientes": total_clientes,
        "total_productos": total_productos,
        "productos_top": productos_top,
        "alertas_stock": alertas_stock
    }


@router.post(
    "/pedidos/prueba/sin-mp/",
    response_model=PedidoRead,
)
def crear_pedido_prueba_sin_mp(datos_pedido: pedidoCreate, db: Session = Depends(get_session)):
    total = 0
    productos_a_actualizar = []

    try:
        if not datos_pedido.productos:
            raise HTTPException(status_code=400, detail="Debes enviar al menos un producto para crear el pedido.")

        for item in datos_pedido.productos:
            if item is None:
                continue

            producto_id = item.get("producto_id") if isinstance(item, dict) else item.producto_id
            cantidad = item.get("cantidad") if isinstance(item, dict) else item.cantidad

            producto = db.query(models.productos).filter(models.productos.id == producto_id).first()
            if not producto:
                raise HTTPException(status_code=404, detail=f"Producto {producto_id} no existe")

            if producto.stock >= cantidad:
                producto.stock -= cantidad
                db.add(producto)
                total += cantidad * producto.precio
                productos_a_actualizar.append((producto, cantidad))
            else:
                raise HTTPException(status_code=400, detail=f"No hay stock de {producto.nombre}")

        id_final_cliente = datos_pedido.usuario_id
        if id_final_cliente is None:
            nuevo_usuario_sombra = models.Cliente(
                nombre=datos_pedido.cliente_sombra or "Invitado ROZVI",
                telefono=datos_pedido.telefono,
                email=None,
                hashed_password=None,
            )
            db.add(nuevo_usuario_sombra)
            db.flush()
            id_final_cliente = nuevo_usuario_sombra.id

        nuevo_pedido = models.Pedido(
            cliente_id=id_final_cliente,
            total=total,
            estado="Pagado",
            direccion_entrega=datos_pedido.direccion_entrega,
            telefono=datos_pedido.telefono,
            cliente_sombra=datos_pedido.cliente_sombra,
        )
        db.add(nuevo_pedido)
        db.flush()

        for producto_obj, cantidad_pedida in productos_a_actualizar:
            detalle = models.DetallePedido(
                pedido_id=nuevo_pedido.id,
                producto_id=producto_obj.id,
                cantidad=cantidad_pedida,
                precio_unitario=producto_obj.precio,
            )
            db.add(detalle)

        db.commit()
        db.refresh(nuevo_pedido)

        return {
            "id": nuevo_pedido.id,
            "usuario_id": nuevo_pedido.cliente_id,
            "cliente_sombra": nuevo_pedido.cliente_sombra,
            "fecha": nuevo_pedido.fecha,
            "total": nuevo_pedido.total,
            "estado": nuevo_pedido.estado,
            "direccion_entrega": nuevo_pedido.direccion_entrega,
            "telefono": nuevo_pedido.telefono,
            "items": [
                {
                    "producto_id": item.producto_id,
                    "cantidad": item.cantidad,
                    "precio_unitario": item.precio_unitario,
                }
                for item in nuevo_pedido.items
            ],
            "payment_link": None,
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creando pedido de prueba sin MP: {str(e)}")


@router.post("/webhook")
async def mercadopago_webhook(request: Request, db: Session = Depends(get_session)):
    # Capturar los datos enviados por la pasarela
    datos = await request.json()
    
    # Identificar el tipo de evento
    tema = request.query_params.get("topic") or datos.get("type")
    
    if tema in ["payment", "payment.created", "payment.updated"]:
        pago_id = datos.get("data", {}).get("id")
        
        if pago_id:
            # Paso A: Consultar el estado real del pago a la API oficial
            respuesta_pago = sdk.payment().get(pago_id)
            info_pago = respuesta_pago.get("response")
            
            if info_pago and info_pago.get("status") == "approved":
                # Paso B: Extraer el ID del pedido asociado
                pedido_id_str = info_pago.get("external_reference")
                
                if pedido_id_str:
                    try:
                        pedido_id = int(pedido_id_str)
                    except ValueError:
                        print(f"[Webhook MP] external_reference invalido: {pedido_id_str}")
                        return {"status": "ok"}

                    try:
                        pedido_db = db.query(models.Pedido).filter(models.Pedido.id == pedido_id).first()
                        if not pedido_db:
                            print(f"[Webhook MP] Pedido no encontrado: {pedido_id}")
                            return {"status": "ok"}

                        if pedido_db.estado == "Pagado":
                            return {"status": "ok"}

                        detalles_pedido = list(pedido_db.items)
                        actualizaciones_stock = []

                        # Validacion critica: si cualquier item no tiene stock suficiente, no se descuenta nada.
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

                        for producto_db, cantidad_comprada in actualizaciones_stock:
                            producto_db.stock -= cantidad_comprada
                            db.add(producto_db)

                        pedido_db.estado = "Pagado"
                        db.add(pedido_db)
                        db.commit()
                    except Exception as error:
                        db.rollback()
                        print(f"[Webhook MP] Error procesando inventario del pedido {pedido_id}: {error}")
                        
    # Obligatorio: Responder siempre HTTP 200 OK para evitar reintentos infinitos
    return {"status": "ok"}