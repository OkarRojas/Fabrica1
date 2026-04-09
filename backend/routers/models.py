from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict
from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

router = APIRouter()


class Base(DeclarativeBase):
    pass


class pandearrozBase(BaseModel):
    nombre: str
    precio: float
    stock: int


class pandearroz(Base):
    __tablename__ = "pandearroz"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    precio: Mapped[float] = mapped_column(Float, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False)


class pandearrozCreate(pandearrozBase):
    pass


class PanDeArrozUpdate(BaseModel):
    nombre: str | None = None
    stock: int | None = None
    precio: float | None = None


class pandearrozRead(pandearrozBase):
    id: int
    model_config = ConfigDict(from_attributes=True)