-- Usar UTF-8 para soportar tildes y caracteres en español
SET client_encoding = 'UTF8';

-- ===== TABLA: USUARIOS =====

CREATE TABLE IF NOT EXISTS Usuarios (
    usuario_id SERIAL PRIMARY KEY,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL, -- En un proyecto real, esto debe ser un hash
    es_vip BOOLEAN DEFAULT FALSE, 
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    

    CONSTRAINT chk_correo_dominio
        CHECK (correo_electronico LIKE '%@gmail.com' OR correo_electronico LIKE '%@outlook.com')
);

-- ===== TABLA: ASIENTOS =====
CREATE TABLE IF NOT EXISTS Asientos (
    asiento_id SERIAL PRIMARY KEY,
    numero_asiento VARCHAR(10) NOT NULL UNIQUE, -- Ej: 'A1', 'I7'
    clase VARCHAR(50) NOT NULL, -- 'Negocios' o 'Económica' [cite: 10]
    precio NUMERIC(10, 2) NOT NULL, 
    
    CONSTRAINT chk_clase_asiento
        CHECK (clase IN ('Negocios', 'Económica'))
);

-- ===== TABLA: RESERVAS =====

CREATE TABLE IF NOT EXISTS Reservas (
    reserva_id SERIAL PRIMARY KEY,
    
    -- Llaves Foráneas
    usuario_id INT NOT NULL, 
    asiento_id INT NOT NULL UNIQUE, -- Un asiento solo puede tener una reserva activa [cite: 16]
    
    nombre_pasajero VARCHAR(255) NOT NULL,
    cui CHAR(13) NOT NULL, 
    con_equipaje BOOLEAN DEFAULT FALSE, 
    
    -- Datos de la reserva
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    precio_final NUMERIC(10, 2) NOT NULL, 
    
    -- Definición de las relaciones
    CONSTRAINT fk_usuario
        FOREIGN KEY(usuario_id) 
        REFERENCES Usuarios(usuario_id)
        ON DELETE CASCADE, -- Si se borra un usuario, se borran sus reservas
        
    CONSTRAINT fk_asiento
        FOREIGN KEY(asiento_id) 
        REFERENCES Asientos(asiento_id)
        -- No ponemos ON DELETE CASCADE aquí, no queremos borrar un asiento
);

-- ===== INSERCIÓN DE DATOS MAESTROS (ASIENTOS) =====


-- Precios base (puedes cambiarlos)
-- Precio Negocios: Q2500.00
-- Precio Económica: Q1500.00


INSERT INTO Asientos (numero_asiento, clase, precio) VALUES
('I1', 'Negocios', 2500.00), ('I2', 'Negocios', 2500.00),
('G1', 'Negocios', 2500.00), ('G2', 'Negocios', 2500.00),
('F1', 'Negocios', 2500.00), ('F2', 'Negocios', 2500.00),
('D1', 'Negocios', 2500.00), ('D2', 'Negocios', 2500.00),
('C1', 'Negocios', 2500.00), ('C2', 'Negocios', 2500.00),
('A1', 'Negocios', 2500.00), ('A2', 'Negocios', 2500.00);


INSERT INTO Asientos (numero_asiento, clase, precio) VALUES
-- Fila I
('I3', 'Económica', 1500.00), ('I4', 'Económica', 1500.00), ('I5', 'Económica', 1500.00), ('I6', 'Económica', 1500.00), ('I7', 'Económica', 1500.00),
-- Fila H
('H3', 'Económica', 1500.00), ('H4', 'Económica', 1500.00), ('H5', 'Económica', 1500.00), ('H6', 'Económica', 1500.00), ('H7', 'Económica', 1500.00),
-- Fila G
('G3', 'Económica', 1500.00), ('G4', 'Económica', 1500.00), ('G5', 'Económica', 1500.00), ('G6', 'Económica', 1500.00), ('G7', 'Económica', 1500.00),
-- Fila F
('F3', 'Económica', 1500.00), ('F4', 'Económica', 1500.00), ('F5', 'Económica', 1500.00), ('F6', 'Económica', 1500.00), ('F7', 'Económica', 1500.00),
-- Fila E
('E3', 'Económica', 1500.00), ('E4', 'Económica', 1500.00), ('E5', 'Económica', 1500.00), ('E6', 'Económica', 1500.00), ('E7', 'Económica', 1500.00),
-- Fila D
('D3', 'Económica', 1500.00), ('D4', 'Económica', 1500.00), ('D5', 'Económica', 1500.00), ('D6', 'Económica', 1500.00), ('D7', 'Económica', 1500.00),
-- Fila C
('C3', 'Económica', 1500.00), ('C4', 'Económica', 1500.00), ('C5', 'Económica', 1500.00), ('C6', 'Económica', 1500.00), ('C7', 'Económica', 1500.00),
-- Fila B
('B3', 'Económica', 1500.00), ('B4', 'Económica', 1500.00), ('B5', 'Económica', 1500.00), ('B6', 'Económica', 1500.00), ('B7', 'Económica', 1500.00),
-- Fila A
('A3', 'Económica', 1500.00), ('A4', 'Económica', 1500.00), ('A5', 'Económica', 1500.00), ('A6', 'Económica', 1500.00), ('A7', 'Económica', 1500.00);

-- Mensaje de éxito
\echo '>>> Base de datos "reservas_vuelos" y tablas creadas exitosamente.'
\echo '>>> 57 asientos (12 Negocios, 45 Económica) han sido insertados.'