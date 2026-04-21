from fastapi import APIRouter, Depends, HTTPException
from security import obtener_hash_password, verificar_password
from database import get_session
from dependencies import verify_secret_key

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

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
)
from routers import models

router = APIRouter()


@router.post("/productos/", response_model=productosRead, dependencies=[Depends(verify_secret_key)])
def create_productos(payload: productosCreate, session: Session = Depends(get_session)):
    db_productos = productos(
        nombre=payload.nombre,
        precio=payload.precio,
        stock=payload.stock,
    )
    session.add(db_productos)
    session.commit()
    session.refresh(db_productos)
    return db_productos


@router.get("/productos/")
def read_productos(session: Session = Depends(get_session)):
    productos_list = session.query(productos).all()
    return productos_list

@router.post("/clientes/", response_model=ClienteRead)
def crear_usuario(payload: ClienteCreate, session: Session = Depends(get_session)):
    
    password_hash = obtener_hash_password(payload.password)

    nuevo_usuario = models.Cliente(
        nombre=payload.nombre,
        email=payload.email,
        telefono=payload.telefono,
        hashed_password=password_hash,
    )
    try:
        session.add(nuevo_usuario)
        session.commit()
        session.refresh(nuevo_usuario)
        return {
            "id": nuevo_usuario.id,
            "nombre": nuevo_usuario.nombre,
            "email": nuevo_usuario.email,
            "telefono": nuevo_usuario.telefono,
            "es_admin": nuevo_usuario.es_admin,
        }
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="El correo ya esta registrado")


@router.post("/clientes/login/", response_model=ClienteRead)
def login_usuario(payload: ClienteLogin, session: Session = Depends(get_session)):
    usuario = session.query(models.Cliente).filter(models.Cliente.email == payload.email).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales invalidas")

    if not usuario.hashed_password or not verificar_password(payload.password, usuario.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales invalidas")

    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "telefono": usuario.telefono,
        "es_admin": usuario.es_admin,
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
        # 1. Validación de stock y cálculo de total (tu lógica original)
        for item in datos_pedido.productos:
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

        # 4. Guardar los detalles (tu lógica original)
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
        
        return nuevo_pedido # Pydantic se encarga de formatear la respuesta

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