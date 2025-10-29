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

const modificarReserva = async (req, res) => {
    // ID del agente logueado
    const { id: usuario_id } = req.usuario;
    // Datos de la modificación
    const { cui, numero_asiento_actual, numero_asiento_nuevo } = req.body;

    // 1. No pueden ser el mismo asiento
    if (numero_asiento_actual === numero_asiento_nuevo) {
        return res.status(400).json({ error: 'El nuevo asiento debe ser diferente al actual.' });
    }

    const cliente = await db.pool.connect();

    try {
        await cliente.query('BEGIN');

        // 2. Buscar la reserva actual del usuario
        const resActual = await cliente.query(
            `SELECT 
                r.reserva_id, 
                a.asiento_id AS asiento_id_actual,
                a.clase AS clase_actual,
                a.precio AS precio_base_actual,
                (SELECT correo_electronico FROM Usuarios u WHERE u.usuario_id = r.usuario_id) AS correo
            FROM Reservas r
            JOIN Asientos a ON r.asiento_id = a.asiento_id
            WHERE r.cui = $1 
                AND a.numero_asiento = $2
                AND r.usuario_id = $3
            FOR UPDATE OF r`, // Bloqueamos la reserva
            [cui, numero_asiento_actual, usuario_id]
        );

        if (resActual.rows.length === 0) {
            throw new Error('No se encontró la reserva. Verifique el CUI y el asiento actual.');
        }

        const reserva_id = resActual.rows[0].reserva_id;
        const clase_actual = resActual.rows[0].clase_actual;
        const precio_base_actual = parseFloat(resActual.rows[0].precio_base_actual);
        const correo_pasajero = resActual.rows[0].correo;

        // 3. Buscar el nuevo asiento
        const resNuevo = await cliente.query(
            `SELECT 
                a.asiento_id AS asiento_id_nuevo,
                a.clase AS clase_nueva,
                r.reserva_id AS ocupado
            FROM Asientos a
            LEFT JOIN Reservas r ON a.asiento_id = r.asiento_id
            WHERE a.numero_asiento = $1
            FOR UPDATE OF a`, // Bloqueamos el nuevo asiento
            [numero_asiento_nuevo]
        );

        if (resNuevo.rows.length === 0) {
            throw new Error('El nuevo asiento seleccionado no existe.');
        }
        if (resNuevo.rows[0].ocupado) {
            throw new Error('El nuevo asiento seleccionado ya está ocupado.');
        }

        const asiento_id_nuevo = resNuevo.rows[0].asiento_id_nuevo;
        const clase_nueva = resNuevo.rows[0].clase_nueva;

        // 4. Validar que sean de la misma clase [cite: 56]
        if (clase_actual !== clase_nueva) {
            throw new Error('Las reservas solo se pueden modificar por un asiento de la misma clase.');
        }

        // 5. Calcular nuevo precio con el 10% de recargo [cite: 57]
        const costo_modificacion = precio_base_actual * 0.10;
        const nuevo_precio_final = precio_base_actual + costo_modificacion;

        // 6. Actualizar la reserva
        await cliente.query(
            `UPDATE Reservas 
            SET 
                asiento_id = $1, 
                precio_final = $2, 
                fecha_reserva = CURRENT_TIMESTAMP 
            WHERE reserva_id = $3`,
            [asiento_id_nuevo, nuevo_precio_final, reserva_id]
        );

        // 7. Enviar email de confirmación [cite: 58]
        const htmlEmail = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #F26838;">¡Reserva Modificada!</h1>
                <p>Tu reserva ha sido actualizada exitosamente.</p>
                <ul>
                    <li><strong>Asiento Anterior:</strong> ${numero_asiento_actual}</li>
                    <li><strong>Nuevo Asiento:</strong> ${numero_asiento_nuevo}</li>
                    <li><strong>CUI del Pasajero:</strong> ${cui}</li>
                    <li><strong>Costo de Modificación:</strong> Q${costo_modificacion.toFixed(2)}</li>
                    <li><strong>Nuevo Total:</strong> Q${nuevo_precio_final.toFixed(2)}</li>
                </ul>
            </div>
        `;
        await enviarEmail(
            correo_pasajero, 
            `✈️ Modificación de Reserva - Nuevo Asiento ${numero_asiento_nuevo}`,
            htmlEmail
        );

        // 8. Confirmar transacción
        await cliente.query('COMMIT');

        res.json({
            mensaje: 'Reserva modificada exitosamente.',
            nuevo_asiento: numero_asiento_nuevo,
            nuevo_precio: nuevo_precio_final
        });

    } catch (error) {
        await cliente.query('ROLLBACK');
        console.error('Error al modificar la reserva:', error);
        res.status(400).json({ error: error.message || 'Error interno al procesar la modificación.' });
    } finally {
        cliente.release();
    }
};


const cancelarReserva = async (req, res) => {
  // ID del agente logueado
    const { id: usuario_id } = req.usuario;

    // --- CAMBIO ---
    // Leemos desde 'req.query' (parámetros de URL) en lugar de 'req.body'
    const { cui, numero_asiento } = req.query; 
    
    const cliente = await db.pool.connect();

    try {
    // Ponemos esta validación simple aquí por si 'cui' o 'numero_asiento' llegan vacíos
        if (!cui || !numero_asiento) {
            throw new Error('El CUI y el Número de Asiento son obligatorios.');
        } 
        await cliente.query('BEGIN');

        // 1. Buscar y eliminar la reserva en un solo paso
        const resCancelada = await cliente.query(
            `DELETE FROM Reservas r
            USING Asientos a
            WHERE r.asiento_id = a.asiento_id
                AND r.cui = $1
                AND a.numero_asiento = $2
                AND r.usuario_id = $3
            RETURNING 
                r.reserva_id, 
                a.numero_asiento, 
                (SELECT correo_electronico FROM Usuarios u WHERE u.usuario_id = r.usuario_id) AS correo,
                r.nombre_pasajero`,
            [cui, numero_asiento, usuario_id] // <-- Esta parte ya funciona bien
        );

        // 2. Verificar si se borró algo
        if (resCancelada.rows.length === 0) {
            throw new Error('Cancelación fallida. Los datos (CUI, Asiento) no coinciden o la reserva no le pertenece.');
        }

        // ... (el resto de la función para enviar email y hacer COMMIT es igual) ...
        const { correo, nombre_pasajero } = resCancelada.rows[0];

        // 3. Enviar email de confirmación
        const htmlEmail = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #F26838;">Reserva Cancelada</h1>
                <p>Se ha procesado la cancelación de la siguiente reserva:</p>
                <ul>
                    <li><strong>Pasajero:</strong> ${nombre_pasajero}</li>
                    <li><strong>CUI:</strong> ${cui}</li>
                    <li><strong>Asiento Liberado:</strong> ${numero_asiento}</li>
                </ul>
                <p>El asiento ahora está disponible.</p>
            </div>
        `;
        await enviarEmail(
            correo, 
            `✈️ Cancelación de Reserva - Asiento ${numero_asiento}`,
            htmlEmail
        );
    
        // 4. Confirmar transacción
        await cliente.query('COMMIT');

        res.json({ mensaje: 'Reserva cancelada exitosamente.' });

    } catch (error) {
        await cliente.query('ROLLBACK');
        console.error('Error al cancelar la reserva:', error);
        // Ahora sí devolverá el error correcto
        res.status(400).json({ error: error.message || 'Error interno al procesar la cancelación.' });
    } finally {
        cliente.release();
    }
};


// 4. Exportar
module.exports = {
    crearReserva,
    modificarReserva, 
    cancelarReserva  
};

module.exports = {
    crearReserva,
    modificarReserva, // <-- Asegúrate que esta línea exista
    cancelarReserva
};