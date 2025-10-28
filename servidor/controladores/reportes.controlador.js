const db = require('../config/db');

const obtenerEstadisticas = async (req, res) => {
    try {
        // Usamos Promise.all para ejecutar todas las consultas de reportes en paralelo
        const [
            usuariosRes,
            asientosRes,
            reservasPorUsuarioRes
            // Aquí se podrían añadir más consultas para los otros reportes
        ] = await Promise.all([
            // 1. Cantidad de usuarios creados [cite: 109]
            db.query('SELECT COUNT(*) AS total FROM Usuarios'),
            // 2. Asientos ocupados/libres por clase [cite: 111, 112, 113]
            db.query(`
                SELECT 
                    a.clase,
                    COUNT(r.reserva_id) AS ocupados,
                    COUNT(CASE WHEN r.reserva_id IS NULL THEN 1 ELSE NULL END) AS libres
                FROM Asientos a
                LEFT JOIN Reservas r ON a.asiento_id = r.asiento_id
                GROUP BY a.clase
            `),

            // 3. Cantidad de reservas por usuario [cite: 110]
            db.query(`
                SELECT 
                    u.correo_electronico, 
                    COUNT(r.reserva_id) AS total_reservas
                FROM Usuarios u
                LEFT JOIN Reservas r ON u.usuario_id = r.usuario_id
                GROUP BY u.correo_electronico
                ORDER BY total_reservas DESC
            `)
             // Faltarían reportes de 'modificados', 'cancelados', etc.
            // que requerirían una tabla de 'logs' o 'bitácora'
        ]);

        // Procesar resultados
        const total_usuarios = parseInt(usuariosRes.rows[0].total, 10);
    
        let negocios_ocupados = 0;
        let negocios_libres = 0;
        let economica_ocupados = 0;
        let economica_libres = 0;

        asientosRes.rows.forEach(row => {
            if (row.clase === 'Negocios') {
                negocios_ocupados = parseInt(row.ocupados, 10);
                negocios_libres = parseInt(row.libres, 10);
            } else if (row.clase === 'Económica') {
                economica_ocupados = parseInt(row.ocupados, 10);
                economica_libres = parseInt(row.libres, 10);
            }
        });

        const reservas_por_usuario = reservasPorUsuarioRes.rows;

        // Enviar el objeto de estadísticas
        res.json({
            total_usuarios,
            negocios_ocupados,
            negocios_libres,
            economica_ocupados,
            economica_libres,
            reservas_por_usuario
            // Faltan: modificados, cancelados (se añadirían aquí)
        });
    } catch (error) {
        console.error('Error al generar reportes:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    obtenerEstadisticas
};