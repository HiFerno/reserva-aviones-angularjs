const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Genera un JSON Web Token (JWT) para un usuario.
 * @param {number} usuario_id - El ID del usuario.
 * @param {string} correo_electronico - El email del usuario.
 * @returns {string} - El token JWT firmado.
 */
const generarJWT = (usuario_id, correo_electronico) => {
    const payload = {
        id: usuario_id,
        correo: correo_electronico
    };

    // El token expira en 1 hora (puedes cambiarlo a '8h', '1d', etc.)
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    return token;
};

module.exports = generarJWT;