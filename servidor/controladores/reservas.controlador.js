const db = require('../config/db');
const validarCUI = require('../utils/validarCUI');
const enviarEmail = require('../utils/enviarEmail');

const crearReserva = async (req, res) => {
  // 1. Obtener el ID del usuario desde el token (gracias al middleware)
    const { id: usuario_id } = req.usuario;
  // 2. Obtener los datos del pasajero desde el body
    const { asiento_id, nombre_pasajero, cui, con_equipaje } = req.body;

  // 3. Validar el CUI
    if (!validarCUI(cui)) {
        return res.status(400).json({ error: 'El formato del CUI no es válido (deben ser 13 dígitos numéricos).' });
    }

  // Iniciamos una conexión de cliente para manejar la TRANSACCIÓN
    const cliente = await db.pool.connect();

    try {
    // 4. Iniciar la transacción
        await cliente.query('BEGIN');

        // 5. Verificar que el asiento exista y NO esté ocupado (y bloquear la fila)
        // 'FOR UPDATE' bloquea la fila del asiento para que dos personas
        // no puedan reservarlo al mismo tiempo (evita "race conditions").
        const asientoRes = await cliente.query(
            `SELECT a.precio, a.clase, a.numero_asiento, r.reserva_id 
            FROM Asientos a
            LEFT JOIN Reservas r ON a.asiento_id = r.asiento_id
            WHERE a.asiento_id = $1
            FOR UPDATE OF a`,
            [asiento_id]
        );

        if (asientoRes.rows.length === 0) {
            throw new Error('El asiento seleccionado no existe.');
        }
        if (asientoRes.rows[0].reserva_id) {
            throw new Error('El asiento seleccionado ya se encuentra ocupado.');
        }

        const { precio: precio_base, numero_asiento } = asientoRes.rows[0];

        // 6. Verificar el estado VIP del usuario
        const usuarioRes = await cliente.query(
            'SELECT es_vip, correo_electronico FROM Usuarios WHERE usuario_id = $1',
            [usuario_id]
        );
        const { es_vip, correo_electronico } = usuarioRes.rows[0];
    
        // Contar reservas (para el chequeo VIP post-reserva)
        const conteoRes = await cliente.query(
            'SELECT COUNT(*) AS total FROM Reservas WHERE usuario_id = $1',
            [usuario_id]
        );
        const total_reservas = parseInt(conteoRes.rows[0].total);

        // 7. Calcular precio final
        let precio_final = parseFloat(precio_base);
        if (es_vip) {
            precio_final = precio_final * 0.90; // Aplicar 10% de descuento
        }

        // 8. Insertar la reserva
        await cliente.query(
            `INSERT INTO Reservas (usuario_id, asiento_id, nombre_pasajero, cui, con_equipaje, precio_final)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [usuario_id, asiento_id, nombre_pasajero, cui, con_equipaje, precio_final]
        );

        // 9. Actualizar estado VIP si aplica
        // Si el usuario *no* era VIP, pero esta nueva reserva es la número 6 o más,
        // se convierte en VIP para futuras compras.
        if (!es_vip && (total_reservas + 1) > 5) {
            await cliente.query('UPDATE Usuarios SET es_vip = TRUE WHERE usuario_id = $1', [usuario_id]);
        }

        // 10. Enviar email de confirmación
        const htmlEmail = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #F26838;">¡Reserva Confirmada!</h1>
                <p>Tu reserva para el asiento <strong>${numero_asiento}</strong> ha sido completada.</p>
                <p><strong>Detalles del Pasajero:</strong></p>
                <ul>
                    <li><strong>Pasajero:</strong> ${nombre_pasajero}</li>
                    <li><strong>CUI:</strong> ${cui}</li>
                    <li><strong>Asiento:</strong> ${numero_asiento}</li>
                    <li><strong>Equipaje:</strong> ${con_equipaje ? 'Sí' : 'No'}</li>
                    <li><strong>Precio Pagado:</strong> Q${precio_final.toFixed(2)}</li>
                </ul>
                <p>¡Gracias por volar con nosotros!</p>
            </div>
        `;
        await enviarEmail(
            correo_electronico, 
            `✈️ Confirmación de Reserva - Asiento ${numero_asiento}`,
            htmlEmail
        );
    
        // 11. Si todo salió bien, confirmar la transacción
        await cliente.query('COMMIT');
    
        res.status(201).json({
            mensaje: 'Reserva creada exitosamente.',
            asiento: numero_asiento,
            precio: precio_final
        });
    } catch (error) {
        // 12. Si algo falló, revertir la transacción
        await cliente.query('ROLLBACK');
        console.error('Error al crear la reserva:', error);
        // Devolvemos el mensaje de error personalizado (ej. "Asiento ocupado")
        res.status(400).json({ error: error.message || 'Error interno al procesar la reserva.' });
    } finally {
        // 13. Liberar al cliente de la pool, sin importar si falló o no
        cliente.release();
    }
};

module.exports = {
    crearReserva
};