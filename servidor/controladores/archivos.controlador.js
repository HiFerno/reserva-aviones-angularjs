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

        const asientos = jsonObj.flightReservation?.flightSeat || [];
        if (!Array.isArray(asientos)) {
            throw new Error('Formato XML no válido: "flightSeat" no es un array o no existe.');
        }

        const cliente = await db.pool.connect();
    
        // 4. Procesar cada asiento uno por uno
        // (Usamos un 'for...of' para poder usar 'await' dentro del loop)
        for (const asiento of asientos) {
            try {
                await cliente.query('BEGIN');
        
                // 5. Validar datos y buscar IDs
                const email = asiento.user;
                const numero_asiento = asiento.seatNumber;
                const cui = asiento.idNumber;

                if (!email || !numero_asiento || !cui) {
                    throw new Error('Datos incompletos (user, seatNumber, idNumber).');
                }

                const resUsuario = await cliente.query('SELECT usuario_id FROM Usuarios WHERE correo_electronico = $1', [email]);
                if (resUsuario.rows.length === 0) {
                    throw new Error(`Usuario no encontrado: ${email}`);
                }
                const usuario_id = resUsuario.rows[0].usuario_id;

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
        
                // (Asumimos que no es VIP y no aplicamos descuento en carga masiva)
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
                // Requisito: Informar errores y continuar [cite: 103]
                await cliente.query('ROLLBACK');
                console.error(`Error al cargar asiento ${asiento.seatNumber}: ${error.message}`);
                asientos_error++;
            }
        }
        cliente.release();

        const tiempoFin = performance.now();
        const tiempo_total_ms = (tiempoFin - tiempoInicio);

        // 7. Devolver el resumen 
        res.json({
            mensaje: 'Carga de XML completada.',
            asientos_cargados_exito: asientos_exitosos,
            asientos_con_error: asientos_error,
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