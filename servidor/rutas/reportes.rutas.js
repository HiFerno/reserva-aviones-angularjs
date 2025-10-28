const { Router } = require('express');
const { obtenerEstadisticas } = require('../controladores/reportes.controlador');
const validarJWT = require('../middleware/validarJWT');

const router = Router();

// Protegemos el endpoint, solo agentes logueados pueden ver reportes
router.get('/', [validarJWT, obtenerEstadisticas]);

module.exports = router;