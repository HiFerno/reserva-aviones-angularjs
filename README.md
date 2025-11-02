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

- **Git:** https://git-scm.com/install/
- **Node.js(v18 o superior):** https://nodejs.org/es/download
- **Docker:** https://www.docker.com/products/docker-desktop/
- (Recomendado) Un cliente de base de datos como DBeaver o PgAdmin para verificar la base de datos.




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






### 📐 Separadores
```markdown
---


