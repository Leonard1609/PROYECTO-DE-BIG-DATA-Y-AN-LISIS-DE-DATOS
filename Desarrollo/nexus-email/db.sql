CREATE DATABASE IF NOT EXISTS nexus_db;
USE nexus_db;

CREATE TABLE IF NOT EXISTS usuarios_solicitudes (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL, -- Correo corporativo (@nexus.com)
    email_personal VARCHAR(255) NOT NULL, -- Correo Gmail personal
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    direccion VARCHAR(255),
    nivel_educacion VARCHAR(100),
    empresa_institucion VARCHAR(100),
    modulo_interes VARCHAR(100) DEFAULT 'GENERAL',
    rol ENUM('ADMIN', 'SUB_ADMIN', 'ANALISTA', 'EMPLEADO') DEFAULT 'EMPLEADO',
    estado ENUM('PENDIENTE_PRE_APROBACION', 'PRE_APROBADO', 'PENDIENTE_ACTIVACION', 'ACTIVO', 'RECHAZADO') DEFAULT 'PENDIENTE_PRE_APROBACION',
    fase INT DEFAULT 1,
    origen VARCHAR(50) DEFAULT 'SOLICITUD',
    password_hash VARCHAR(255) NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar usuario Admin General inicial para pruebas
INSERT INTO usuarios_solicitudes 
(id, email, email_personal, nombre_completo, rol, estado, fase, origen, password_hash) 
VALUES 
('admin-uuid-001', 'admin@nexus.com', 'admin@gmail.com', 'Administrador General', 'ADMIN', 'ACTIVO', 4, 'SISTEMA', '$2a$10$e8c1S.8b1Y89IWqL9Z2/8.eO7D9jN.yVvW8M1vO8/X9y/Z.a1b2c3');