🥖 Fabrica 1: E-commerce Full-Stack & Dashboard

¡Bienvenido! Este es Fabrica 1, un proyecto robusto que combina una experiencia de compra fluida para el usuario con un panel administrativo potente. Olvídate de las soluciones genéricas; aquí hay código real, integración con pasarelas de pago y una arquitectura pensada para escalar.

🚀 ¿Qué hace especial a este proyecto?

Este no es el típico "Hola Mundo". Es una aplicación completa que resuelve problemas reales:

Frontend Moderno: Construido con React y Vite para una velocidad de desarrollo y ejecución brutal.

Backend de Alto Rendimiento: Potenciado por FastAPI, lo que significa que es rápido, seguro y con documentación automática (Swagger).

Pagos Reales: Integración nativa con Mercado Pago para procesar transacciones de forma segura.

Gestión Total: Un Dashboard administrativo para controlar productos, usuarios y pedidos sin tocar la base de datos manualmente.

Cerebro Inteligente: Incluye un Chatbot integrado para mejorar la experiencia del cliente.

Contenerización: Todo corre sobre Docker, así que el "en mi máquina sí funciona" ya no es una excusa.

🛠️ Stack Tecnológico

Área

Tecnologías

Frontend

React, Vite, CSS3, Lucide Icons

Backend

Python, FastAPI, SQLAlchemy, JWT Auth

Base de Datos

PostgreSQL (vía Docker)

Pagos

Mercado Pago SDK

DevOps

Docker, Docker Compose

📦 Estructura del Proyecto

Para que no te pierdas en el código:

├── backend/                # El motor Python (FastAPI)
│   ├── routers/            # Endpoints (CRUD, Pagos, Auth)
│   ├── main.py             # Punto de entrada de la API
│   └── database.py         # Configuración de SQLAlchemy
├── src/                    # La magia visual (React)
│   ├── components/         # Componentes reutilizables (Admin, Carrito, etc.)
│   ├── lib/                # Configuraciones externas (Mercado Pago)
│   └── App.jsx             # Orquestador del frontend
├── docker-compose.yml      # El director de orquesta de los contenedores
└── .env.example            # Lo que necesitas para que todo prenda


⚡ Guía de Inicio Rápido

1. Requisitos previos

Tener instalado Docker y Docker Compose. Si prefieres correrlo local, necesitarás Node.js y Python 3.10+.

2. Configura tus secretos

Copia los archivos de ejemplo y añade tus credenciales (especialmente las de Mercado Pago):

cp .env.example .env
cp backend/.env.example backend/.env


3. ¡Lánzalo todo!

Si usas Docker, solo necesitas un comando y sentarte a esperar que la magia ocurra:

docker-compose up --build


Frontend: http://localhost:5173

Backend API: http://localhost:8000

Docs (Swagger): http://localhost:8000/docs

💳 Integración con Mercado Pago

El flujo de pago está totalmente integrado. El sistema genera una preferencia de pago en el backend, redirige al usuario a la pasarela segura y maneja los estados de retorno:

✅ Pago Exitoso: src/components/pagos/pagoExitoso.jsx

⏳ Pago Pendiente: src/components/pagos/pagoPendiente.jsx

❌ Pago Fallido: src/components/pagos/pagoFallido.jsx

🧠 Chatbot & UX

No solo vendemos pan o productos; ayudamos al cliente. El componente chatbot.jsx permite una interacción directa para resolver dudas frecuentes, haciendo que la página se sienta viva.

🛡️ Seguridad

Usamos JWT (JSON Web Tokens) para proteger las rutas del administrador. Nadie que no tenga las llaves correctas podrá entrar al dashboard a cambiar precios o ver usuarios.

🤝 Contacto

¿Te gusta lo que ves? Estoy buscando mi próxima aventura profesional como desarrollador. Si quieres charlar sobre este proyecto o sobre una oportunidad laboral, ¡no dudes en contactarme!

Hecho con ❤️ y mucha cafeína.