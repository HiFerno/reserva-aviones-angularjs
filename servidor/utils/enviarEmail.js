const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

/**
 * Función para enviar un correo electrónico.
 * @param {string} destinatario - El email del destinatario.
 * @param {string} asunto - El asunto del correo.
 * @param {string} html - El contenido HTML del correo.
 */
const enviarEmail = async (destinatario, asunto, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Sistema de Reservas ✈️" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: asunto,
            html: html,
        });

        console.log('Correo enviado: %s', info.messageId);

    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};

module.exports = enviarEmail;