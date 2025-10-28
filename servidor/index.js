const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// --- CAMBIOS PARA SWAGGER ---
const swaggerUI = require('swagger-ui-express');
// Ya no importamos swagger-jsdoc
const fs = require('fs'); // Módulo para leer archivos
const YAML = require('js-yaml'); // Módulo para parsear YAML
// --- FIN CAMBIOS ---

// Inicialización
const app = express();
const PORT = process.env.PORT || 4000;

// --- CAMBIOS PARA SWAGGER ---
// Cargar el archivo YAML y convertirlo a un objeto JSON
let swaggerDocs;
try {
    const swaggerFile = fs.readFileSync(path.join(__dirname, './docs/swagger.yaml'), 'utf8');
    swaggerDocs = YAML.load(swaggerFile);
} catch (e) {
    console.error("Error al leer/parsear swagger.yaml:", e);
}
// --- FIN CAMBIOS ---

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Rutas
app.use('/api', require('./rutas/asientos.rutas'));
app.use('/api', require('./rutas/asientos.rutas'));
app.use('/api/auth', require('./rutas/auth.rutas.js'));
app.use('/api/reservas', require('./rutas/reservas.rutas.js'));

// --- CAMBIOS PARA SWAGGER ---
// Servir la documentación usando el objeto cargado del archivo
if (swaggerDocs) {
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs)); 
}
// --- FIN CAMBIOS ---

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Documentación de API disponible en http://localhost:4000/api-docs`);
});