const { Router } = require('express');
const { crearReserva,
        modificarReserva,
        cancelarReserva
    } = require('../controladores/reservas.controlador');
const validarJWT = require('../middleware/validarJWT'); // <-- Importamos el middleware

const router = Router();

// Esta ruta ahora está protegida.
// 1. Primero se ejecuta validarJWT.
// 2. Si el token es válido, pasa a crearReserva.
// 3. Si no es válido, validarJWT devuelve un error 401.
router.post('/', [validarJWT], crearReserva);
// [PATCH] Modificar una reserva (Ruta nueva)
// Usamos PATCH porque es una actualización parcial (solo cambia el asiento_id)
router.patch('/', [validarJWT], modificarReserva);

// [DELETE] Cancelar una reserva (Ruta nueva)
router.delete('/', [validarJWT], cancelarReserva);

module.exports = router;