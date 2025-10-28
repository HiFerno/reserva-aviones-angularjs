const { Pool } = require('pg');
require('dotenv').config();

// Se crea el pool de conexiones usando las variables de entorno
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('CONEXIÓN EXITOSA A LA BASE DE DATOS');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};