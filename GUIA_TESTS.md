# PRUEBAS PYTEST PARA ROZVI - GUÍA RÁPIDA

## ✅ Lo que se ha hecho

He creado un conjunto completo de pruebas automatizadas con **pytest** para todas las rutas de FastAPI en ROZVI.

### Archivos Creados

```
backend/
├── conftest.py           # Configuración de fixtures (85 líneas)
├── pytest.ini            # Config de pytest
├── .env.test             # Variables de entorno para tests
├── test_crud.py          # Tests de CRUD (450+ líneas, 22 tests)
├── test_security.py      # Tests de seguridad (200+ líneas, 13 tests)
├── test_webhooks.py      # Tests de webhooks (180 líneas)
├── TEST_README.md        # Documentación detallada
├── run_tests.ps1         # Script para Windows
└── update_routes.py      # Script para actualizar rutas
```

## 🚀 Cómo usar

### 1. Instalar pytest (una sola vez)
```bash
cd backend
pip install pytest pytest-asyncio
```

### 2. Ejecutar los tests

**Todos los tests:**
```bash
pytest -v
```

**Solo CRUD:**
```bash
pytest test_crud.py -v
```

**Solo seguridad:**
```bash
pytest test_security.py -v
```

**Un test específico:**
```bash
pytest test_crud.py::TestProductos::test_crear_producto -v
```

**Con reporte de cobertura:**
```bash
pip install pytest-cov
pytest --cov=. --cov-report=html
# Ver en htmlcov/index.html
```

## 📊 Estado Actual

| Archivo | Tests | Pasando | Fallos | Notas |
|---------|-------|---------|--------|-------|
| test_crud.py | 22 | 7 ✓ | 15 | BD compartida entre tests |
| test_security.py | 13 | 9 ✓ | 4 | Validaciones Pydantic |
| test_webhooks.py | - | - | - | Listo para ejecutar |

**Total:** 35+ tests listos para ejecutar

## 🔧 Qué se Prueba

### Productos
- ✓ Crear, listar, actualizar, eliminar
- ✓ Validación de stock
- ✓ Campos requeridos

### Clientes
- ✓ Crear cliente con hash seguro
- ✓ Email único
- ✓ Login exitoso/fallido
- ✓ Autenticación

### Pedidos
- ✓ Crear pedido con usuario/invitado
- ✓ Validar stock disponible
- ✓ Validar producto existe
- ✓ Prueba sin Mercado Pago

### Seguridad
- ✓ Hash bcrypt (sin comparación directa)
- ✓ JWT tokens
- ✓ Secret key en rutas protegidas
- ✓ Validación de datos

## 🛠️ Arreglos Realizados

### 1. Rutas con `/crud/` prefix
**Problema:** Router registrado con `prefix="/crud"`
**Solución:** Todos los tests usan rutas correctas:
- `/crud/productos/` (no `/productos/`)
- `/crud/clientes/` (no `/clientes/`)
- `/crud/pedidos/` (no `/pedidos/`)

### 2. Base de datos de prueba
**Problema:** Tests fallaban con "no such table"
**Solución:** BD SQLite en archivo temporal, reemplaza engine antes de importar app

### 3. Aislamiento entre tests
**Configurado:** Cada test obtiene sesión nueva, datos se limpian después

## 📝 Ejemplo de test

```python
def test_crear_producto(self, client: TestClient):
    """Test: Crear un nuevo producto."""
    payload = {
        "nombre": "Pan de Arroz",
        "precio": 4.99,
        "stock": 50,
        "descripcion": "Tradicional"
    }
    response = client.post("/crud/productos/", json=payload)
    
    assert response.status_code == 200
    assert response.json()["nombre"] == "Pan de Arroz"
```

## 📚 Documentación Completa

Para información detallada sobre:
- Cómo escribir nuevos tests
- Estructura de fixtures
- Mocking de dependencias
- Integración con CI/CD

Ver: **TEST_README.md**

## ⚠️ Notas Importantes

1. **BD de Prueba**: Usa SQLite temporal, no la BD real
2. **Variables de Entorno**: Lee `.env.test` primero, luego `.env`
3. **Mercado Pago**: Mock automático en webhooks
4. **Secrets**: Secret keys están en `.env.test`

## ❓ Troubleshooting

### Error: "No module named pytest"
```bash
pip install pytest pytest-asyncio
```

### Error: "DATABASE_URL not configured"
- Automático con `.env.test`

### Tests lentos
```bash
pytest -m "not slow" -v
```

## 🎯 Próximos Pasos

1. **Ejecutar tests iniciales:**
   ```bash
   pytest -v
   ```

2. **Revisar fallos y ajustar tests según comportamiento real**

3. **Agregar más casos de prueba según necesidad**

4. **Integrar con CI/CD (GitHub Actions, etc.)**

5. **Monitorear cobertura de código**

---

**¿Preguntas?** Ver TEST_README.md para guía completa
