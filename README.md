# JetRoute - Sistema de Reserva de Vuelos
JetRoute es un sistema full-stack para la simulación de reservas de asientos de avión. Fue creado como proyecto final para el curso de Programación Web.

La aplicación permite a los usuarios registrarse, iniciar sesión, ver un mapa de asientos en tiempo real, y gestionar reservas (crear, modificar, cancelar). El sistema también genera reportes y permite la carga/descarga de reservas vía archivos XML.

## Stack de Tecnologías
- **Frontend:** AngularJS (v1.x), Bulma CSS.
- **Backend:** Node.js, Express.
- **Base de Datos:** PostgreSQL (gestionada con Docker).
- **Autenticación:** JSON Web Tokens (JWT) con bcryptjs para el hash de contraseñas.
- **Servicios:** nodemailer para el envío de correos, multer y xml-js para el manejo de archivos XML.


## Prerrequisitos
Antes de empezar, asegúrate de tener el siguiente software instalado en tu máquina
- [Git](https://git-scm.com/install/): Para clonar este repositorio.
- [Node.js (LTS)](https://nodejs.org/es/download): (v18 o superior) El motor de JavaScript para el backend.
- [Docker Desktop](www.docker.com/products/docker-desktop/): La forma más sencilla de correr la base de datos (ya incluye Docker Compose).
- (Opcional) [DBeaver Community](https://dbeaver.io/download/): Un cliente de base de datos espectacular para espiar la base de datos.




## Guía de Instalación y Puesta en Marcha

### 1. Clonar el Repositorio

> Abre gitbash y ejecuta el comando
#### Bash
```markdown
git clone https://github.com/HiFerno/reserva-aviones-angularjs.git
cd reserva-aviones-angularjs
```

### 2. Instalacion Base de datos
La base de datos PostgreSQL corre en un contenedor de Docker. El archivo docker-compose.yml en la raíz del proyecto se encarga de todo.
Asegúrate de estar en la carpeta reserva-aviones-angularjs (donde está tu docker-compose.yml) y ejecuta

#### Bash
```markdown
docker-compose up -d
```

### 3. Coinfigurar el Backend (API)
#### a. Instalar Dependencias
Navega a la carpeta del backend/servidor e instala los paquetes de npm.
#### Bash
```markdown
cd servidor
npm install
```
#### b. Crear el Archivo de Entorno (.env)
En la carpeta servidor/, crea un archivo llamado .env y copia el siguiente contenido.
### Fragmento de código
```markdown
# Configuración del Servidor
PORT=4000

# Configuración de la Base de Datos PostgreSQL
DB_USER=admin
DB_PASSWORD=adminpass
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=reservas_vuelos

# Configuración de Email (usando GMAIL)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion-de-16-letras

# Secreto para JSON Web Token (JWT)
# Puedes cambiar esto por cualquier frase secreta
JWT_SECRET=esta-es-mi-palabra-secreta-para-jwt-2025
```
**¡IMPORTANTE! Configurar el Email:** No puedes usar tu contraseña normal de Gmail. Debes generar una "Contraseña de Aplicación" de 16 letras:
1. Ve a tu cuenta de Google: myaccount.google.com
2. Activa la Verificación en 2 Pasos (obligatorio).
3. Ve a Seguridad -> Contraseñas de aplicaciones.
4. Genera una nueva contraseña para "Otra (nombre personalizado)".
5. Pega esa contraseña de 16 letras en EMAIL_PASS.

#### c. Configurar el Logo en Correos
Para que el logo de JetRoute aparezca en los correos, debes subirlo a un hosting (como Imgur) y pegar la URL pública en el archivo servidor/utils/emailTemplate.js.
#### JavaScript
```markdown
// servidor/utils/emailTemplate.js
// ...
  const LOGO_URL = 'https://i.imgur.com/TU-URL-PUBLICA.png'; // <-- REEMPLAZA ESTO
// ...
```
### 3. Configurar el Frontend (AngularJS)
El frontend solo requiere un servidor web ligero para funcionar.
#### a. Instalar el Servidor
Se recomienda http-server por su simplicidad. Instálalo globalmente:
#### Bash
```markdown
npm install -g http-server
```
#### b. Verificar la Conexión de la API
Asegúrate de que el frontend sepa dónde está el backend. El archivo frontend/js/app.js debe apuntar a la URL correcta (por defecto http://localhost:4000/api, lo cual ya es correcto si sigues esta guía).
#### JavaScript
```markdown
// frontend/js/app.js
// ...
.constant('API_URL', 'http://localhost:4000/api')
// ...
```

## Cómo Correr la Aplicación
Para correr JetRoute, necesitarás dos terminales (gitbash) abiertas simultáneamente.

### Terminal 1: Iniciar el Backend (API)
Navega a la carpeta del servidor y corre el script dev (que usa nodemon para reinicios automáticos).
\reserva-aviones-angularjs\servidor
#### Bash
```markdown
npm run dev
```
Verás un mensaje: Servidor corriendo en el puerto 4000. La documentación de la API estará disponible en http://localhost:4000/api-docs.

### Terminal 2: Iniciar el Frontend
Navega a la carpeta del frontend y lanza el servidor.
\reserva-aviones-angularjs\frontend
#### Bash
```markdown
http-server
```
Verás un mensaje: Starting up http-server... La aplicación estará disponible en tu navegador en http://127.0.0.1:8080 (o la URL que te indique la terminal).

** LISTO! ** 
Si sigues estos pasos correctamente ya podras utilizar el sistema completo que ofrece este sistema de reserva de asientos de avion

## Estructura del Proyecto 
```
/reserva-aviones-angularjs
├── servidor/            # API del servidor (Node.js, Express)
│   ├── controladores/    # Lógica de negocio (auth, reservas, etc.)
│   ├── middleware/     # Validadores (JWT)
│   ├── rutas/          # Definición de Endpoints
│   ├── utils/          # Helpers (envío de email, plantillas)
│   ├── docs/           # Archivo swagger.yaml
│   ├── index.js        # Archivo principal de la API
│   └── package.json
├── db/                 # Base de Datos
│   └── init.sql        # Script de inicialización (Tablas y Asientos)
├── frontend/           # Aplicación de cliente (AngularJS)
│   ├── css/            # Estilos (style.css, Bulma)
│   ├── img/            # Logo de JetRoute
│   ├── js/             # Lógica de AngularJS
│   │   ├── controladores/
│   │   └── servicios/
│   ├── vistas/         # Plantillas HTML parciales (principal.html, login.html, etc.)
│   └── index.html      # El "cascarón" (Single Page Application)
├── docker-compose.yml  # Orquestador de Docker para Postgres
└── README.md           # Esta guía
```





