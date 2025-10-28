const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const validarJWT = async (req, res, next) => {
  // El token vendrá en el header 'Authorization'
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    // Extraemos el token (quitamos "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
    // Verificamos el token con nuestro secreto
        const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Si es válido, adjuntamos los datos del usuario (el payload) al objeto 'req'
    // para que las siguientes funciones (controladores) tengan acceso a él.
        req.usuario = payload; // Ej: req.usuario.id, req.usuario.correo
        next(); // Continúa con la siguiente función (el controlador)

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado. Por favor, inicie sesión de nuevo.' });
        }
        res.status(401).json({ error: 'Token no válido.' });
    }
};

module.exports = validarJWT;