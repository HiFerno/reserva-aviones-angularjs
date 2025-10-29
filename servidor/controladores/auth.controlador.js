const db = require('../config/db');
const bcrypt = require('bcryptjs');
const generarJWT = require('../utils/generarJWT');
const enviarEmail = require('../utils/enviarEmail');

// --- REGISTRO DE USUARIO ---
const registrarUsuario = async (req, res) => {
    const { correo_electronico, contrasena } = req.body;

    // --- INICIO DE LA NUEVA VALIDACIÓN ---
    if (!contrasena) {
        return res.status(400).json({ error: 'La contraseña es obligatoria.' });
    }

    const errores = [];
    if (contrasena.length < 8) {
        errores.push('La contraseña debe tener al menos 8 caracteres.');
    }
    if (!/[a-z]/.test(contrasena)) {
        errores.push('La contraseña debe contener al menos una minúscula.');
    }
    if (!/[A-Z]/.test(contrasena)) {
        errores.push('La contraseña debe contener al menos una mayúscula.');
    }
    // Expresión regular para caracteres especiales
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (!specialCharRegex.test(contrasena)) {
        errores.push('La contraseña debe contener al menos un caracter especial.');
    }

    if (errores.length > 0) {
        // Si hay algún error, los unimos y los devolvemos
        return res.status(400).json({ error: errores.join(' ') });
    }

    try {
        // 1. Verificar si el correo ya existe
        const usuarioExistente = await db.query(
            'SELECT * FROM Usuarios WHERE correo_electronico = $1',
            [correo_electronico]
        );

        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // 2. Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const contrasenaHash = await bcrypt.hash(contrasena, salt);

        // 3. Insertar el nuevo usuario en la BD
        const nuevoUsuario = await db.query(
            `INSERT INTO Usuarios (correo_electronico, contrasena) 
            VALUES ($1, $2) 
            RETURNING usuario_id, correo_electronico`,
            [correo_electronico, contrasenaHash]
        );
    
        // 4. Enviar email de confirmación 
        const htmlEmail = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #F26838;">¡Bienvenido al Sistema de Reservas!</h1>
                <p>Hola,</p>
                <p>Tu cuenta ha sido creada exitosamente con el correo: <strong>${correo_electronico}</strong>.</p>
                <p>Ya puedes iniciar sesión en la plataforma.</p>
                <p>¡Gracias!</p>
            </div>
        `;
        await enviarEmail(
            correo_electronico, 
            '✅ Confirmación de Creación de Cuenta', 
        htmlEmail
        );

        // 5. Responder al frontend
        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente. Se ha enviado un correo de confirmación.',
            usuario: nuevoUsuario.rows[0]
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        // Manejo del error de restricción de la BD (gmail/outlook)
        if (error.constraint === 'chk_correo_dominio') {
            return res.status(400).json({ 
                error: 'Error: El correo debe ser @gmail.com o @outlook.com.' 
            });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// --- INICIO DE SESIÓN ---
const iniciarSesion = async (req, res) => {
    const { correo_electronico, contrasena } = req.body;

    try {
        // 1. Verificar si el usuario existe
        const resultado = await db.query(
            'SELECT * FROM Usuarios WHERE correo_electronico = $1',
            [correo_electronico]
        );

        const usuario = resultado.rows[0];
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales incorrectas (correo).' });
        }

        // 2. Verificar la contraseña
        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!contrasenaValida) {
            return res.status(401).json({ error: 'Credenciales incorrectas (contraseña).' });
        }

        // 3. Generar el Token (JWT)
        const token = generarJWT(usuario.usuario_id, usuario.correo_electronico);
    
        // 4. Enviar respuesta con el token
        res.json({
            mensaje: 'Inicio de sesión exitoso.',
            token: token,
            usuario: {
                id: usuario.usuario_id,
                correo: usuario.correo_electronico,
                es_vip: usuario.es_vip
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    registrarUsuario,
    iniciarSesion
};