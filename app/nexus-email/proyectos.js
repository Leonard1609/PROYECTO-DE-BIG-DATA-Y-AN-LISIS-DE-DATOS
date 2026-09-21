const express = require('express');
const router = express.Router();
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento para PDFs y Excels
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Generador automático de NRC / Código único
function generarNRC() {
    const anio = new Date().getFullYear();
    const aleatorio = Math.floor(1000 + Math.random() * 9000);
    return `${anio}-PRJ-NRC_${aleatorio}`;
}

// 1. Obtener todos los proyectos (Excluye 'Eliminado')
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query(
            "SELECT * FROM proyectos WHERE estado != 'Eliminado' ORDER BY creado_en DESC"
        );
        return res.json(rows);
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        return res.status(500).json({ error: 'Error al consultar proyectos en la base de datos.' });
    }
});

// 2. Obtener un proyecto por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('SELECT * FROM proyectos WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Proyecto no encontrado.' });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener el proyecto:', error);
        return res.status(500).json({ error: 'Error en el servidor.' });
    }
});

// 3. Crear un nuevo proyecto
router.post('/', async (req, res) => {
    const { titulo, lider_nombre, lider_id, creado_por } = req.body;

    if (!titulo || !titulo.trim()) {
        return res.status(400).json({ error: 'El nombre del proyecto es obligatorio.' });
    }

    const codigo_nrc = generarNRC();

    try {
        const { rows } = await db.query(
            `INSERT INTO proyectos (codigo_nrc, titulo, lider_nombre, lider_id, estado, creado_por) 
             VALUES ($1, $2, $3, $4, 'Activo', $5) RETURNING *`,
            [codigo_nrc, titulo.trim(), lider_nombre || 'Sin Asignar', lider_id || null, creado_por || null]
        );

        return res.json({
            success: true,
            message: 'Proyecto creado exitosamente.',
            proyecto: rows[0]
        });
    } catch (error) {
        console.error('Error al crear proyecto:', error);
        return res.status(500).json({ error: 'Error al registrar el proyecto.' });
    }
});

// 4. Cambiar estado del proyecto (Activo, Suspendido, Cerrado, Eliminado)
router.put('/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['Activo', 'Suspendido', 'Cerrado', 'Eliminado'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido.' });
    }

    try {
        await db.query('UPDATE proyectos SET estado = $1 WHERE id = $2', [estado, id]);
        return res.json({ success: true, message: `Estado actualizado a: ${estado}` });
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        return res.status(500).json({ error: 'Error al actualizar el estado.' });
    }
});

// 5. Eliminación física definitiva
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM proyectos WHERE id = $1', [id]);
        return res.json({ success: true, message: 'Proyecto eliminado definitivamente.' });
    } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        return res.status(500).json({ error: 'Error al eliminar el proyecto.' });
    }
});

// 6. Subir documento/informe a un proyecto
router.post('/:id/documentos', upload.single('archivo'), async (req, res) => {
    const { id } = req.params;
    const { usuario_id, usuario_nombre, tipo_documento } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }

    try {
        const ruta_archivo = `/uploads/${req.file.filename}`;
        const { rows } = await db.query(
            `INSERT INTO proyecto_documentos 
             (proyecto_id, usuario_id, usuario_nombre, nombre_archivo, ruta_archivo, tipo_documento) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, usuario_id || null, usuario_nombre || 'Anónimo', req.file.originalname, ruta_archivo, tipo_documento || 'PDF']
        );

        return res.json({
            success: true,
            message: 'Documento subido correctamente.',
            documento: rows[0]
        });
    } catch (error) {
        console.error('Error al guardar el documento:', error);
        return res.status(500).json({ error: 'Error al registrar el documento.' });
    }
});

// 7. Obtener documentos de un proyecto
router.get('/:id/documentos', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(
            'SELECT * FROM proyecto_documentos WHERE proyecto_id = $1 ORDER BY subido_en DESC',
            [id]
        );
        return res.json(rows);
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        return res.status(500).json({ error: 'Error al consultar documentos.' });
    }
});

module.exports = router;