#!/usr/bin/env python
"""Script para actualizar todas las rutas en los tests."""
import re
from pathlib import Path

test_files = [
    'test_crud.py',
    'test_security.py',
    'test_webhooks.py'
]

# Patrones de reemplazo
replacements = [
    (r'"/productos/', '"/crud/productos/'),
    (r'"/clientes/', '"/crud/clientes/'),
    (r'"/pedidos/', '"/crud/pedidos/'),
    (r'"/admin/', '"/crud/admin/'),
    (r'"/webhook', '"/crud/webhook'),
]

for file_name in test_files:
    file_path = Path(__file__).parent / file_name
    
    if not file_path.exists():
        print(f"⚠ {file_name} no encontrado")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {file_name} actualizado")
    else:
        print(f"- {file_name} sin cambios")

print("\nRutas actualizadas correctamente")
