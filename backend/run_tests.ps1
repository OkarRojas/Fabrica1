#!/usr/bin/env pwsh
# Script para ejecutar tests en Windows PowerShell

# Colores para salida
$Green = @{ ForegroundColor = "Green" }
$Red = @{ ForegroundColor = "Red" }
$Yellow = @{ ForegroundColor = "Yellow" }

Write-Host "=== ROZVI Backend - Ejecutor de Tests ===" @Green

# 1. Verificar si pytest está instalado
Write-Host "`n[1/5] Verificando instalación de pytest..."
python -m pytest --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "pytest no está instalado. Instalando..." @Yellow
    pip install pytest pytest-asyncio
}

# 2. Ejecutar todos los tests
Write-Host "`n[2/5] Ejecutando todos los tests..." @Green
python -m pytest -v

# 3. Mostrar resumen
Write-Host "`n[3/5] Resumen de ejecución:"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Todos los tests pasaron" @Green
} else {
    Write-Host "✗ Algunos tests fallaron" @Red
}

# 4. Opcionales: Coverage
Write-Host "`n[4/5] ¿Desea generar reporte de cobertura? (s/n)"
$response = Read-Host
if ($response -eq "s") {
    Write-Host "Instalando pytest-cov..."
    pip install pytest-cov
    
    Write-Host "Generando reporte de cobertura..."
    python -m pytest --cov=. --cov-report=html
    Write-Host "Reporte guardado en htmlcov/index.html" @Green
}

# 5. Limpiar
Write-Host "`n[5/5] Tests completados"
Write-Host "Para más información, ver TEST_README.md" @Green
