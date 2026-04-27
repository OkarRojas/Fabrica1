from datetime import datetime
from typing import List, Optional
from sqlalchemy import Float, Integer, String, DateTime, ForeignKey, Table, Column, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from pydantic import BaseModel, ConfigDict, Field

# --- BASE DE DATOS (SQLAlchemy 2.0) ---

class Base(DeclarativeBase):
    pass

# Tabla Intermedia para Relación Muchos a Muchos (Productos <-> Etiquetas)
producto_etiqueta = Table(
    "producto_etiqueta",
    Base.metadata,
    Column("producto_id", Integer, ForeignKey("productos.id"), primary_key=True),
    Column("etiqueta_id", Integer, ForeignKey("etiquetas.id"), primary_key=True),
)

class productos(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    precio: Mapped[float] = mapped_column(Float, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relaciones
    etiquetas: Mapped[List["Etiqueta"]] = relationship(
        secondary=producto_etiqueta, back_populates="productos"
    )
    detalles: Mapped[List["DetallePedido"]] = relationship(back_populates="producto")

class Etiqueta(Base):
    __tablename__ = "etiquetas"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    
    productos: Mapped[List["productos"]] = relationship(
        secondary=producto_etiqueta, back_populates="etiquetas"
    )

class Cliente(Base):
    __tablename__ = "clientes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(150), unique=True, nullable=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    telefono: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    es_admin: Mapped[bool] = mapped_column(default=False)
    
    pedidos: Mapped[List["Pedido"]] = relationship(back_populates="cliente")

class Pedido(Base):
    __tablename__ = "pedidos"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cliente_id: Mapped[Optional[int]] = mapped_column(ForeignKey("clientes.id"), nullable=False)
    cliente_sombra: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    fecha: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    total: Mapped[float] = mapped_column(Float, nullable=False)
    estado: Mapped[str] = mapped_column(String(50), default="Pendiente")
    direccion_entrega: Mapped[str] = mapped_column(String(50), nullable=False)
    telefono: Mapped[str] = mapped_column(String(10), nullable=False)
    
    cliente: Mapped["Cliente"] = relationship(back_populates="pedidos")
    items: Mapped[List["DetallePedido"]] = relationship(back_populates="pedido")

class DetallePedido(Base):
    __tablename__ = "detalle_pedido"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    pedido_id: Mapped[int] = mapped_column(ForeignKey("pedidos.id"), nullable=False)
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    precio_unitario: Mapped[float] = mapped_column(Float, nullable=False)
    
    pedido: Mapped["Pedido"] = relationship(back_populates="items")
    producto: Mapped["productos"] = relationship(back_populates="detalles")

# --- MODELOS DE VALIDACIÓN (Pydantic) ---

class productosbase(BaseModel):
    nombre: str
    precio: float
    stock: int
    descripcion: Optional[str] = None

class productosCreate(productosbase):
    pass

class productosUpdate(BaseModel):
    nombre: str | None = None
    stock: int | None = None
    descripcion: str | None = None
    precio: float | None = None

class productosRead(productosbase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class pedidoCreate(BaseModel):
    usuario_id: Optional[int] = None
    direccion_entrega: str
    productos: List[dict]  # Lista de {producto_id: int, cantidad: int}
    telefono: str
    cliente_sombra: Optional[str] = None

class PedidoRead(BaseModel):
    id: int
    usuario_id: Optional[int] = Field(default=None, validation_alias="cliente_id", serialization_alias="usuario_id")
    cliente_sombra: Optional[str] = None
    fecha: datetime
    total: float
    estado: str
    direccion_entrega: str
    telefono: Optional[str] = None
    items: List["DetallePedidoRead"]
    model_config = ConfigDict(from_attributes=True)
    payment_link: Optional[str] = None  


class DetallePedidoRead(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float
    model_config = ConfigDict(from_attributes=True)


class ClienteCreate(BaseModel):
    nombre: str
    email: Optional[str] = None
    telefono: Optional[str] = None
    password: str


class ClienteLogin(BaseModel):
    email: str
    password: str


class ClienteRead(BaseModel):
    id: int
    nombre: str
    email: Optional[str] = None
    telefono: Optional[str] = None
    es_admin: bool = False
    model_config = ConfigDict(from_attributes=True)


class ClienteLoginResponse(ClienteRead):
    access_token: str
    token_type: str = "bearer"