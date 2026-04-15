from fastapi import APIRouter, Depends, HTTPException

from database import get_session
from dependencies import verify_secret_key

from sqlalchemy.orm import Session

from .models import productos, productosUpdate,  productosCreate, productosRead, pedidoCreate, PedidoRead
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


@router.post("/pedidos/", response_model=PedidoRead, dependencies=[Depends(verify_secret_key)])
def crear_pedido(datos_pedido: pedidoCreate, db: Session = Depends(get_session)):
    total = 0
    productos_a_actualizar = []
    try:
        for item in datos_pedido.productos:
            producto_id = item.get("producto_id")
            cantidad = item.get("cantidad")

            if producto_id is None or cantidad is None:
                raise HTTPException(status_code=422, detail="Cada item debe incluir producto_id y cantidad")

            producto = db.query(models.productos).filter(models.productos.id == producto_id).first()
            if not producto:
                raise HTTPException(status_code=404, detail=f"Producto con id {producto_id} no existe")
            
            if producto.stock >= cantidad:
                producto.stock -= cantidad
                db.add(producto)
                total += cantidad * producto.precio
            else:
                raise HTTPException(status_code=400, detail=f"Stock insuficiente para el producto {producto.nombre}")

            productos_a_actualizar.append((producto, cantidad))
        
        nuevo_pedido = models.Pedido(
            cliente_id=datos_pedido.usuario_id,
            total=total,
            estado="Pendiente",
            direccion_entrega=datos_pedido.direccion_entrega,
        )
        db.add(nuevo_pedido)
        db.flush()   
        for producto_obj, cantidad_pedida in productos_a_actualizar:
          
            detalle = models.DetallePedido(
                pedido_id=nuevo_pedido.id,
                producto_id=producto_obj.id,
                cantidad=cantidad_pedida,
                precio_unitario=producto_obj.precio
            )
            db.add(detalle)

        db.commit()
        db.refresh(nuevo_pedido)
        return {
            "id": nuevo_pedido.id,
            "usuario_id": nuevo_pedido.cliente_id,
            "fecha": nuevo_pedido.fecha,
            "total": nuevo_pedido.total,
            "estado": nuevo_pedido.estado,
            "direccion_entrega": nuevo_pedido.direccion_entrega,
            "items": [
                {
                    "producto_id": item.producto_id,
                    "cantidad": item.cantidad,
                    "precio_unitario": item.precio_unitario,
                }
                for item in nuevo_pedido.items
            ],
        }
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creando pedido: {str(e)}")


    

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