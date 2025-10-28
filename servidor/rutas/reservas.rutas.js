const { Router } = require('express');
const { 
    crearReserva,
    modificarReserva,
    cancelarReserva
} = require('../controladores/reservas.controlador');
const validarJWT = require('../middleware/validarJWT');

const router = Router();

// [POST] Crear reserva
// CORRECCIÓN: 'validarJWT' y 'crearReserva' van DENTRO del mismo array.
router.post('/', [validarJWT, crearReserva]);

// [PATCH] Modificar una reserva
// CORRECCIÓN: 'validarJWT' y 'modificarReserva' van DENTRO del mismo array.
router.patch('/', [validarJWT, modificarReserva]);

// [DELETE] Cancelar una reserva
// CORRECCIÓN: 'validarJWT' y 'cancelarReserva' van DENTRO del mismo array.
router.delete('/', [validarJWT, cancelarReserva]);

module.exports = router;