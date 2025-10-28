const { Router } = require('express');
const { obtenerEstadoAsientos } = require('../controladores/asientos.controlador');

const router = Router();


router.get('/asientos', obtenerEstadoAsientos);

module.exports = router;