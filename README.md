# JetRoute - Flight Reservation System
JetRoute is a full-stack system for simulating airplane seat reservations. It was created as a final project for the Web Programming course.

The application allows users to register, log in, view a real-time seat map, and manage reservations (create, modify, cancel). The system also generates reports and allows uploading/downloading reservations via XML files.

## Tech Stack
- **Frontend:** AngularJS (v1.x), Bulma CSS.
- **Backend:** Node.js, Express.
- **Database:** PostgreSQL (managed with Docker).
- **Authentication:** JSON Web Tokens (JWT) with bcryptjs for password hashing.
- **Services:** nodemailer for sending emails, multer and xml-js for handling XML files.


## Prerequisites
Before you begin, ensure you have the following software installed on your machine:
- [Git](https://git-scm.com/install/): To clone this repository.
- [Node.js (LTS)](https://nodejs.org/es/download): (v18 or higher) The JavaScript runtime for the backend.
- [Docker Desktop](www.docker.com/products/docker-desktop/): The easiest way to run the database (already includes Docker Compose).
- [Visual Studio Code](https://code.visualstudio.com/): The preferred IDE for creating and editing code files.
- (Optional) [DBeaver Community](https://dbeaver.io/download/): A spectacular database client for peeking into the database.




## Installation and Setup Guide

### 1. Clone the Repository

> Open gitbash and run the command
#### Bash
```markdown
git clone https://github.com/HiFerno/reserva-aviones-angularjs.git
cd reserva-aviones-angularjs
```

### 2. Database Setup
The PostgreSQL database runs in a Docker container. The docker-compose.yml file in the project root handles everything. Make sure you are in the reserva-aviones-angularjs folder (where your docker-compose.yml is) and run:

#### Bash
```markdown
docker-compose up -d
```

### 3. Configure the Backend (API)
#### a. Install Dependencies
Navigate to the \reserva-aviones-angularjs\servidor folder and install the npm packages.
#### Bash
```markdown
cd servidor
npm install
```
#### b. Create the Environment File (.env)
In the \reserva-aviones-angularjs\servidor folder, create a file named .env and copy the following content.
### Code Snippet
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
**IMPORTANT! Configure Email:** You cannot use your normal Gmail password. You must generate a 16-letter "App Password":
1. Go to your Google Account: myaccount.google.com
2. Enable 2-Step Verification (mandatory).
3. Go to Security -> App Passwords.
4. Generate a new password for "Other (Custom name)".
5. Paste that 16-letter password into EMAIL_PASS.

#### c. Configure the Logo in Emails
For the JetRoute logo to appear in emails, you must upload it to a hosting service (like Imgur) and paste the public URL into the servidor/utils/emailTemplate.js file.

#### JavaScript
```markdown
// servidor/utils/emailTemplate.js
// ...
  const LOGO_URL = 'https://i.imgur.com/TU-URL-PUBLICA.png'; // <-- REEMPLAZA ESTO
// ...
```
### 3. Configure the Frontend (AngularJS)
The frontend only requires a lightweight web server to run.

#### a. Install the Server
http-server is recommended for its simplicity. Install it globally:
#### Bash
```markdown
npm install -g http-server
```
#### b. Verify the API Connection
Make sure the frontend knows where the backend is. The frontend/js/app.js file must point to the correct URL (default is http://localhost:4000/api, which is correct if you follow this guide).
#### JavaScript
```markdown
// frontend/js/app.js
// ...
.constant('API_URL', 'http://localhost:4000/api')
// ...
```

## How to Run the Application
To run JetRoute, you will need two terminals (gitbash) open simultaneously.

### Terminal 1: Start the Backend (API)
Navigate to the server folder and run the dev script (which uses nodemon for automatic restarts). \reserva-aviones-angularjs\servidor
#### Bash
```markdown
npm run dev
```
You will see a message like: Servidor corriendo en el puerto 4000 (Server running on port 4000). The API documentation will be available at http://localhost:4000/api-docs.

### Terminal 2: Start the Frontend
Navigate to the frontend folder and launch the server. \reserva-aviones-angularjs\frontend
#### Bash
```markdown
http-server
```
You will see a message: Starting up http-server... The application will be available in your browser at http://127.0.0.1:8080 (or the URL indicated in the terminal).

** ALL SET! **  
If you follow these steps correctly, you can now use the complete system offered by this airplane seat reservation system.

## Project Structure
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





