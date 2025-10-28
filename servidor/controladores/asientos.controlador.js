const db = require('../config/db');

// Controlador para obtener todos los asientos disponibles y su estado
const obtenerEstadoAsientos = async (req, res) => {
    try {
    // Consulta SQL que une Asientos y Reservas para ver cuáles están ocupados
        const consulta = `
            SELECT 
                a.asiento_id, 
                a.numero_asiento, 
                a.clase, 
                a.precio, 
                CASE WHEN r.reserva_id IS NOT NULL THEN 'ocupado' ELSE 'disponible' END AS estado
            FROM 
                Asientos a
            LEFT JOIN 
                Reservas r ON a.asiento_id = r.asiento_id
            ORDER BY 
                a.clase, a.numero_asiento;
        `;

        const { rows } = await db.query(consulta);
        res.json(rows);

    } catch (error) {
        console.error('Error al obtener el estado de los asientos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    obtenerEstadoAsientos,
};