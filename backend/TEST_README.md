# Pruebas con pytest - ROZVI Backend

Este documento describe cómo ejecutar y escribir pruebas para las rutas de FastAPI en ROZVI.

## Estructura de Tests

```
backend/
├── conftest.py              # Configuración compartida de pytest
├── pytest.ini              # Configuración de pytest
├── .env.test               # Variables de entorno para tests
├── test_crud.py            # Tests de CRUD (productos, clientes, pedidos)
├── test_security.py        # Tests de seguridad y autenticación
└── test_webhooks.py        # Tests de webhooks e integración
```

## Instalación de Dependencias

Asegúrate de tener pytest instalado:

```bash
pip install pytest pytest-asyncio
```

Todas las dependencias están en `requirements.txt`:
- `fastapi`
- `sqlalchemy`
- `pytest`
- `pytest-asyncio`

## Ejecución de Tests

### Ejecutar todos los tests
```bash
pytest
```

### Ejecutar con salida detallada
```bash
pytest -v
```

### Ejecutar un archivo específico
```bash
pytest backend/test_crud.py -v
```

### Ejecutar una clase de tests específica
```bash
pytest backend/test_crud.py::TestProductos -v
```

### Ejecutar un test específico
```bash
pytest backend/test_crud.py::TestProductos::test_crear_producto -v
```

### Ejecutar con coverage (cobertura de código)
```bash
pip install pytest-cov
pytest --cov=. --cov-report=html
```

### Ejecutar solo tests de seguridad
```bash
pytest -m security
```

## Estructura de los Tests

### conftest.py
- **`db_session`**: Fixture que proporciona una sesión de BD para tests
- **`client`**: Fixture que proporciona un cliente de prueba con BD inyectada
- Usa SQLite en memoria (`:memory:`) para aislamiento

### test_crud.py
Contiene pruebas para:
- **TestProductos**: CRUD de productos
  - Crear, leer, actualizar, eliminar productos
  - Validación de stock
  - Casos de error

- **TestClientes**: Gestión de clientes
  - Crear cliente
  - Login
  - Listar clientes
  - Validación de email único

- **TestPedidos**: Operaciones con pedidos
  - Crear pedido
  - Validación de stock en pedidos
  - Pedidos como invitado
  - Ruta de prueba sin Mercado Pago

- **TestAdmin**: Endpoints de administrador
  - Estadísticas
  - Requerimientos de autenticación

### test_security.py
Contiene pruebas para:
- **TestSecurity**: Funciones criptográficas
  - Hash de contraseñas
  - Generación de tokens

- **TestRutasSeguridad**: Protección de endpoints
  - Secret key requerida
  - Autenticación de admin

- **TestValidacionDatos**: Validación de entrada
  - Campos requeridos
  - Formatos válidos
  - Emails válidos

### test_webhooks.py
Contiene pruebas para:
- **TestWebhook**: Webhooks de Mercado Pago
  - Pagos aprobados
  - Pagos rechazados

- **TestIntegracionCompleta**: Flujos end-to-end
  - Compra como invitado
  - Compra de usuario registrado

## Escribir Nuevos Tests

### Estructura básica de un test

```python
def test_algo(client: TestClient):
    """Test: Descripción clara del comportamiento a probar."""
    # Arrange: Preparar datos
    payload = {
        "nombre": "Test",
        "precio": 4.99,
        "stock": 50
    }
    
    # Act: Ejecutar la acción
    response = client.post("/productos/", json=payload)
    
    # Assert: Verificar resultados
    assert response.status_code == 200
    assert response.json()["nombre"] == "Test"
```

### Usar fixtures

```python
def test_con_db(db_session: Session):
    """Test que accede directamente a la BD."""
    from routers.models import productos
    
    # Crear objeto en BD
    producto = productos(
        nombre="Test",
        precio=4.99,
        stock=50
    )
    db_session.add(producto)
    db_session.commit()
    
    # Verificar
    assert producto.id is not None
```

### Mocking de dependencias

```python
from unittest.mock import patch

def test_con_mock(client: TestClient):
    """Test con mocking de servicios externos."""
    with patch("routers.crud.sdk.payment") as mock_payment:
        mock_payment.return_value.get.return_value = {
            "response": {"status": "approved"}
        }
        # ... hacer test
```

## Flujo de Desarrollo con Tests

1. **Escribir test que falla** (TDD)
   ```bash
   pytest test_mi_feature.py -v
   ```

2. **Implementar la funcionalidad**
   - Hacer que el test pase

3. **Refactorizar**
   - Mantener los tests pasando

4. **Verificar cobertura**
   ```bash
   pytest --cov --cov-report=html
   ```

## Casos Importantes a Probar

### Productos
- ✅ Crear producto válido
- ✅ Crear producto sin descripción
- ✅ Listar productos
- ✅ Actualizar producto
- ✅ Eliminar producto
- ✅ Validar stock en pedidos

### Clientes
- ✅ Crear cliente
- ✅ Email único
- ✅ Login exitoso
- ✅ Login con contraseña incorrecta
- ✅ Hash seguro de contraseña

### Pedidos
- ✅ Crear pedido con stock suficiente
- ✅ Rechazar pedido sin stock
- ✅ Pedido de invitado (shadow user)
- ✅ Pedido de usuario registrado
- ✅ Validar producto existe

### Seguridad
- ✅ Secret key requerida para actualizar productos
- ✅ Token JWT válido
- ✅ Admin solo puede ver estadísticas
- ✅ Validación de email en login

## Integración con CI/CD

Para ejecutar automáticamente los tests en CI/CD (GitHub Actions, etc.):

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - run: pip install -r requirements.txt
      - run: pytest --cov
```

## Troubleshooting

### Error: "No module named 'pytest'"
```bash
pip install pytest
```

### Error: "No module named 'fastapi'"
Asegúrate de estar en el venv activado:
```bash
source .venv/bin/activate  # Linux/Mac
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
```

### Error: "DATABASE_URL not configured"
Los tests usan SQLite en memoria automáticamente en conftest.py

### Tests lentos
Algunos tests pueden ser lentos si hay muchas validaciones. Puedes skipear con:
```python
@pytest.mark.slow
def test_algo():
    pass
```

Luego correr sin lentos:
```bash
pytest -m "not slow"
```

## Siguiente Paso

Una vez que los tests estén pasando, considera:
1. Agregar más casos edge
2. Aumentar cobertura de código
3. Agregar tests de performance
4. Integrar con CI/CD pipeline
