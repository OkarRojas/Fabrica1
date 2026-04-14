from fastapi import APIRouter, Depends, HTTPException

from database import get_session
from dependencies import verify_secret_key

from sqlalchemy.orm import Session

from .models import productos, productosUpdate,  productosCreate, productosRead

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