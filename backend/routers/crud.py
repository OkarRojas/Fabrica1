from fastapi import APIRouter, Depends, HTTPException

from database import get_session
from dependencies import verify_secret_key

from sqlalchemy.orm import Session

from .models import PanDeArrozUpdate, pandearroz, pandearrozCreate, pandearrozRead

router = APIRouter()


@router.post("/pandearroz/", response_model=pandearrozRead, dependencies=[Depends(verify_secret_key)])
def create_pandearroz(payload: pandearrozCreate, session: Session = Depends(get_session)):
    db_pandearroz = pandearroz(
        nombre=payload.nombre,
        precio=payload.precio,
        stock=payload.stock,
    )
    session.add(db_pandearroz)
    session.commit()
    session.refresh(db_pandearroz)
    return db_pandearroz


@router.get("/pandearroz/")
def read_pandearroz(session: Session = Depends(get_session)):
    pandearroz_list = session.query(pandearroz).all()
    return pandearroz_list


@router.put("/pandearroz/{pandearroz_id}", response_model=pandearrozRead, dependencies=[Depends(verify_secret_key)])
def update_pandearroz(
    pandearroz_id: int,
    payload: pandearrozCreate,
    session: Session = Depends(get_session),
):
    db_pandearroz = session.get(pandearroz, pandearroz_id)
    if not db_pandearroz:
        raise HTTPException(status_code=404, detail="Pandearroz not found")
    for key, value in payload.model_dump().items():
        setattr(db_pandearroz, key, value)
    session.commit()
    session.refresh(db_pandearroz)
    return db_pandearroz


@router.delete("/pandearroz/{pandearroz_id}", dependencies=[Depends(verify_secret_key)])
def delete_pandearroz(pandearroz_id: int, session: Session = Depends(get_session)):
    db_pandearroz = session.get(pandearroz, pandearroz_id)
    if not db_pandearroz:
        raise HTTPException(status_code=404, detail="Pandearroz not found")
    session.delete(db_pandearroz)
    session.commit()
    return {"detail": "Pandearroz deleted successfully"}


@router.patch("/pan-de-arroz/{pan_id}", response_model=pandearrozRead, dependencies=[Depends(verify_secret_key)])
def actualizar_stock_pan(pan_id: int, pan_data: PanDeArrozUpdate, session: Session = Depends(get_session)):
    db_pan = session.get(pandearroz, pan_id)
    if not db_pan:
        raise HTTPException(status_code=404, detail="Pan no encontrado")

    update_data = pan_data.model_dump(exclude_unset=True)

    db_pan.sqlmodel_update(update_data)

    session.add(db_pan)
    session.commit()
    session.refresh(db_pan)

    return db_pan