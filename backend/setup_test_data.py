#!/usr/bin/env python3
"""Script para insertar datos de prueba en la BD (cliente de test para pedidos)."""

from database import SessionLocal
from routers.models import Cliente

def setup_test_data():
    db = SessionLocal()
    try:
        # Verificar si ya existe un cliente con id=1
        cliente_existente = db.query(Cliente).filter(Cliente.id == 1).first()
        
        if not cliente_existente:
            nuevo_cliente = Cliente(
                nombre="Cliente Test",
                email="test@example.com",
                telefono="+573001234567",
                hashed_password=None
            )
            db.add(nuevo_cliente)
            db.commit()
            print("✓ Cliente de test creado correctamente")
        else:
            print("✓ Cliente de test ya existe")
            
    except Exception as e:
        db.rollback()
        print(f"✗ Error creando cliente: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup_test_data()
