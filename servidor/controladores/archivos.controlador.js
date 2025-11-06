const db = require('../config/db');
const { js2xml } = require('xml-js');
const { XMLParser } = require('fast-xml-parser');
const { performance } = require('perf_hooks'); // Para medir el tiempo [cite: 106]

// --- DESCARGAR XML ---
const descargarXML = async (req, res) => {
    try {
        // 1. Obtener todas las reservas con los datos requeridos por el PDF [cite: 74, 75, 76, 77, 78, 79]
        const { rows } = await db.query(`
            SELECT 
                a.numero_asiento,
                r.nombre_pasajero,
                u.correo_electronico,
                r.cui,
                r.con_equipaje,
                TO_CHAR(r.fecha_reserva, 'DD/MM/YYYY HH24:MI') AS fecha_reserva
            FROM Reservas r
            JOIN Asientos a ON r.asiento_id = a.asiento_id
            JOIN Usuarios u ON r.usuario_id = u.usuario_id
            ORDER BY r.fecha_reserva DESC
        `);

        // 2. Construir el objeto JSON que se convertirá a XML
        const obj = {
            _declaration: { _attributes: { version: '1.0', encoding: 'utf-8' } },
            flightReservation: { // [cite: 72]
                flightSeat: [] // [cite: 73]
            }
        };

        rows.forEach(r => {
            obj.flightReservation.flightSeat.push({
                seatNumber: { _text: r.numero_asiento }, // [cite: 74]
                passengerName: { _text: r.nombre_pasajero }, // [cite: 75]
                user: { _text: r.correo_electronico }, // [cite: 76]
                idNumber: { _text: r.cui }, // [cite: 77]
                hasLuggage: { _text: r.con_equipaje }, // [cite: 78]
                reservationDate: { _text: r.fecha_reserva } // [cite: 79]
            });
        });

        // 3. Convertir el objeto JSON a XML
        const xml = js2xml(obj, { compact: true, spaces: 4 });

        // 4. Enviar el archivo XML como respuesta
        res.header('Content-Type', 'application/xml');
        res.header('Content-Disposition', 'attachment; filename="reservas.xml"');
        res.send(xml);

    } catch (error) {
        console.error('Error al generar el XML:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};


// --- CARGAR XML --- (Esta es la función más compleja)
const cargarXML = async (req, res) => {
    const tiempoInicio = performance.now();
    let asientos_exitosos = 0;
    let asientos_error = 0;
    const detalles_errores = []; // <-- almacenar detalles de los asientos que fallan

    try {
        // 1. Verificar que se haya subido un archivo
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo XML.' });
        }

        // 2. Leer el contenido del archivo
        const xmlData = req.file.buffer.toString('utf-8');

        // 3. Parsear el XML a JSON
        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlData);

        let asientos = []; // Empezar con un array vacío
        const flightSeatData = jsonObj.flightReservation?.flightSeat;

        if (flightSeatData) {
            if (Array.isArray(flightSeatData)) {
                // Caso 1: Múltiples asientos, ya es un array
                asientos = flightSeatData;
            } else {
                // Caso 2: Un solo asiento, es un objeto. ¡Lo envolvemos en un array!
                asientos = [flightSeatData];
            }
        }

        const cliente = await db.pool.connect();
    
        // Asegurar existencia de un usuario por defecto para evitar FK violations
        const DEFAULT_USUARIO_EMAIL = process.env.DEFAULT_USUARIO_EMAIL || 'imported@system.local';
        let defaultUsuarioId = process.env.DEFAULT_USUARIO_ID ? parseInt(process.env.DEFAULT_USUARIO_ID, 10) : null;

        // Si dieron un ID por env, verificar que exista (no lanzar error si falla la verificación)
        if (defaultUsuarioId) {
            try {
                const rCheck = await cliente.query('SELECT usuario_id FROM Usuarios WHERE usuario_id = $1', [defaultUsuarioId]);
                if (rCheck.rows.length === 0) defaultUsuarioId = null;
            } catch (err) {
                console.warn('No se pudo verificar DEFAULT_USUARIO_ID:', err.message);
                defaultUsuarioId = null;
            }
        }

        if (!defaultUsuarioId) {
            // Intentar buscar por email o crear usuario por defecto
            try {
                const resFind = await cliente.query('SELECT usuario_id FROM Usuarios WHERE correo_electronico = $1', [DEFAULT_USUARIO_EMAIL]);
                if (resFind.rows.length > 0) {
                    defaultUsuarioId = resFind.rows[0].usuario_id;
                } else {
                    // Intentar crear usuario por defecto (si falla, usaremos fallback)
                    try {
                        const resInsert = await cliente.query(
                            'INSERT INTO Usuarios (correo_electronico, nombre) VALUES ($1, $2) RETURNING usuario_id',
                            [DEFAULT_USUARIO_EMAIL, 'Import User']
                        );
                        defaultUsuarioId = resInsert.rows[0].usuario_id;
                    } catch (insertErr) {
                        console.warn('No se pudo crear usuario por defecto:', insertErr.message);
                        // Fallback: usar cualquier usuario existente
                        try {
                            const anyUser = await cliente.query('SELECT usuario_id FROM Usuarios LIMIT 1');
                            if (anyUser.rows.length > 0) {
                                defaultUsuarioId = anyUser.rows[0].usuario_id;
                                console.warn('Usando usuario existente como fallback:', defaultUsuarioId);
                            } else {
                                cliente.release();
                                return res.status(500).json({
                                    error: 'No hay usuarios en la BD y no se pudo crear usuario por defecto. Defina DEFAULT_USUARIO_ID o cree un usuario en la BD.'
                                });
                            }
                        } catch (anyErr) {
                            cliente.release();
                            return res.status(500).json({ error: 'Error al obtener usuario fallback: ' + anyErr.message });
                        }
                    }
                }
            } catch (findErr) {
                cliente.release();
                return res.status(500).json({ error: 'Error al buscar/crear usuario por defecto: ' + findErr.message });
            }
        }
    
        // 4. Procesar cada asiento uno por uno
        for (const asiento of asientos) {
            try {
                await cliente.query('BEGIN');
        
                // 5. Validar datos y buscar IDs
                const email = asiento.user; // ya no se valida/consulta en la BD
                const numero_asiento = asiento.seatNumber;
                const cui = asiento.idNumber;
                if (!numero_asiento || !cui) {
                    throw new Error('Datos incompletos (seatNumber o idNumber).');
                }

                // Usar siempre el usuario por defecto (no validar existencia del email del XML)
                const usuario_id = defaultUsuarioId;
                
                const resAsiento = await cliente.query(
                    `SELECT a.asiento_id, a.precio, r.reserva_id AS ocupado 
                    FROM Asientos a
                    LEFT JOIN Reservas r ON a.asiento_id = r.asiento_id
                    WHERE a.numero_asiento = $1`, 
                    [numero_asiento]
                );
                if (resAsiento.rows.length === 0) {
                    throw new Error(`Asiento no encontrado: ${numero_asiento}`);
                }
                if (resAsiento.rows[0].ocupado) {
                    throw new Error(`Asiento ya ocupado: ${numero_asiento}`);
                }
        
                const asiento_id = resAsiento.rows[0].asiento_id;
                const precio_base = parseFloat(resAsiento.rows[0].precio);
        
                // 6. Insertar la reserva
                await cliente.query(
                    `INSERT INTO Reservas (usuario_id, asiento_id, nombre_pasajero, cui, con_equipaje, precio_final)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        usuario_id,
                        asiento_id,
                        asiento.passengerName,
                        cui,
                        asiento.hasLuggage === 'true',
                        precio_base
                    ]
                );
        
                await cliente.query('COMMIT');
                asientos_exitosos++;
            } catch (error) {
                // Requisito: Informar errores y continuar
                await cliente.query('ROLLBACK');
                asientos_error++;

                // Guardar detalle del error para respuesta (se muestra en Swagger)
                detalles_errores.push({
                    seatNumber: asiento.seatNumber || null,
                    passengerName: asiento.passengerName || null,
                    user: asiento.user || null,
                    idNumber: asiento.idNumber || null,
                    reason: error.message
                });

                console.error(`Error al cargar asiento ${asiento.seatNumber || 'N/A'}: ${error.message}`);
            }
        }
        cliente.release();

        const tiempoFin = performance.now();
        const tiempo_total_ms = (tiempoFin - tiempoInicio);

        // 7. Devolver el resumen, incluyendo detalles de errores
        res.json({
            mensaje: 'Carga de XML completada.',
            asientos_cargados_exito: asientos_exitosos,
            asientos_con_error: asientos_error,
            detalles_errores: detalles_errores, // <-- aquí están los detalles para Swagger
            tiempo_procesamiento_ms: tiempo_total_ms
        });
    } catch (error) {
        console.error('Error al cargar XML:', error);
        res.status(500).json({ error: error.message || 'Error interno del servidor.' });
    }
};


module.exports = {
    descargarXML,
    cargarXML
};