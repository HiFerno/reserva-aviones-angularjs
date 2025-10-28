const { Router } = require('express');
const { 
    registrarUsuario, 
    iniciarSesion 
} = require('../controladores/auth.controlador');

const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/registro', registrarUsuario);

// Ruta para iniciar sesión
router.post('/login', iniciarSesion);

module.exports = router;