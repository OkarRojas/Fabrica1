# 1. Usamos una versión de Python lista para trabajar 🐍
FROM python:3.12-slim

# 2. Creamos una carpeta dentro de la "caja" para nuestro código 📂
WORKDIR /app

# 3. Copiamos el archivo de requerimientos para saber qué instalar 📜
COPY requirements.txt .

# 4. Instalamos todas las librerías necesarias 🛠️
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copiamos todo el contenido de nuestra carpeta backend a la caja 🚚
COPY . .

# 6. Le decimos a la caja que use el puerto 8000 para comunicarse 🌐
EXPOSE 8000

# 7. ¡Encendemos el servidor! 🚀
CMD ["uvicorn", "main.py:app", "--host", "0.0.0.0", "--port", "8000"]