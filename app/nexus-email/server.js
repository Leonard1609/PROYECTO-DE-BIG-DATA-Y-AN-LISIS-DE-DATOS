const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const db = require('./db');
const proyectosRouter = require('./proyectos');
const { enviarCorreoPreAprobacion, enviarCorreoRechazo, enviarCorreoActivacionFinal } = require('./emailService');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/proyectos', proyectosRouter);
// 1. Validar e ingresar correo
app.post('/api/solicitudes/validar-email', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.trim()) {
        return res.status(400).json({ error: 'Por favor, ingresa un correo electrónico.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
        if (cleanEmail.endsWith('@gmail.com')) {
            const [rows] = await db.query(
                'SELECT * FROM usuarios_solicitudes WHERE email_personal = ?',
                [cleanEmail]
            );

            if (rows.length > 0) {
                const usuario = rows[0];

                if (usuario.estado === 'ACTIVO') {
                    return res.status(400).json({
                        error: `Tu cuenta ya está ACTIVA. Para iniciar sesión debes ingresar tu correo corporativo (@nexus.com): ${usuario.email}`
                    });
                }

                if (usuario.estado === 'PRE_APROBADO') {
                    return res.status(400).json({
                        error: `Tu correo corporativo ya fue pre-aprobado (${usuario.email}). Ingresa con ese correo en la pestaña de activación.`
                    });
                }

                if (usuario.estado === 'PENDIENTE_ACTIVACION') {
                    return res.status(400).json({
                        error: 'Tu solicitud de activación ya está en proceso. El administrador la revisará pronto.'
                    });
                }

                return res.status(400).json({
                    error: `El estado actual de tu solicitud es: ${usuario.estado}.`
                });
            }

            return res.json({
                tipo: 'GMAIL_NUEVO',
                valido: true,
                message: 'Correo disponible. Completa el formulario a continuación.'
            });
        }

        if (cleanEmail.endsWith('@nexus.com')) {
            const { rows } = await db.query(
                'SELECT * FROM usuarios_solicitudes WHERE email = $1',
                [cleanEmail]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    tipo: 'CORP_NO_ENCONTRADO',
                    error: 'El correo corporativo no se encuentra registrado ni pre-aprobado.'
                });
            }

            const usuario = rows[0];

            if (usuario.estado === 'ACTIVO') {
                return res.json({
                    tipo: 'CORP_ACTIVO',
                    email_corporativo: usuario.email,
                    message: 'Cuenta activa detectada. Por favor, ingresa tu contraseña.'
                });
            }

            if (usuario.estado === 'PRE_APROBADO') {
                return res.json({
                    tipo: 'CORP_PRE_APROBADO',
                    email_corporativo: usuario.email,
                    message: 'Tu correo corporativo ya fue pre-aprobado. Procede a solicitar la activación.'
                });
            }

            if (usuario.estado === 'PENDIENTE_ACTIVACION') {
                return res.json({
                    tipo: 'CORP_PENDIENTE_ACTIVACION',
                    message: 'Tu solicitud de activación ya está en proceso. El administrador la revisará pronto.'
                });
            }

            return res.status(400).json({
                error: `El estado actual de tu solicitud es: ${usuario.estado}.`
            });
        }

        return res.status(400).json({ error: 'Formato no permitido. Solo se admite @gmail.com o @nexus.com' });
    } catch (error) {
        console.error('Error al validar correo:', error);
        return res.status(500).json({ error: 'Error interno del servidor al validar el correo.' });
    }
});

// 2. Autenticación / Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Debes proporcionar correo corporativo y contraseña.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith('@nexus.com')) {
        return res.status(400).json({ error: 'El inicio de sesión solo está permitido con correos corporativos (@nexus.com).' });
    }

    try {
        const [rows] = await db.query(
            'SELECT * FROM usuarios_solicitudes WHERE email = ? AND estado = "ACTIVO"',
            [cleanEmail]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Usuario corporativo no encontrado o la cuenta no se encuentra activa.' });
        }

        const usuario = rows[0];
        const coincide = await bcrypt.compare(password, usuario.password_hash);

        if (!coincide) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        return res.json({
            success: true,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre_completo,
                email: usuario.email,
                rol: usuario.rol,
                proyecto: usuario.proyecto,
                cargo: usuario.cargo
            }
        });
    } catch (error) {
        console.error('Error en el login:', error);
        return res.status(500).json({ error: 'Error interno al iniciar sesión.' });
    }
});

// 3. Crear solicitud de registro inicial
app.post('/api/solicitudes/crear', async (req, res) => {
    const { email_personal, nombres, apellidos, telefono, direccion, nivel_educacion } = req.body;

    if (!email_personal || !nombres || !apellidos) {
        return res.status(400).json({ error: 'Nombres, Apellidos y Correo son obligatorios.' });
    }

    const id = uuidv4();
    const nombre_completo = `${nombres} ${apellidos}`.trim();

    try {
        await db.query(
            `INSERT INTO usuarios_solicitudes 
            (id, email, email_personal, nombre_completo, telefono, direccion, nivel_educacion, estado, fase, origen) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDIENTE_PRE_APROBACION', 2, 'SOLICITUD')`,
            [id, '', email_personal.trim().toLowerCase(), nombre_completo, telefono, direccion, nivel_educacion]
        );

        return res.json({ success: true, message: 'Tus datos pasaron a revisión del área de gestión.' });
    } catch (error) {
        console.error('Error al crear solicitud:', error);
        return res.status(500).json({ error: 'Error al registrar la solicitud.' });
    }
});

// 4. Obtener todas las solicitudes para el Admin
app.get('/api/admin/solicitudes', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM usuarios_solicitudes ORDER BY creado_en DESC');
        return res.json(rows);
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        return res.status(500).json({ error: 'Error al obtener solicitudes.' });
    }
});

// 5. Pre-aprobar solicitud
app.post('/api/admin/pre-aprobar', async (req, res) => {
    const { id, email_corporativo_asignado } = req.body;

    if (!email_corporativo_asignado || !email_corporativo_asignado.endsWith('@nexus.com')) {
        return res.status(400).json({ error: 'Debe asignar un correo corporativo válido (@nexus.com)' });
    }

    try {
        const [solicitud] = await db.query('SELECT * FROM usuarios_solicitudes WHERE id = ?', [id]);
        if (solicitud.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada.' });

        const data = solicitud[0];
        const cleanCorpEmail = email_corporativo_asignado.trim().toLowerCase();

        await db.query(
            'UPDATE usuarios_solicitudes SET email = ?, estado = "PRE_APROBADO", fase = 3 WHERE id = ?',
            [cleanCorpEmail, id]
        );

        const resultadoEmail = await enviarCorreoPreAprobacion(data.email_personal, cleanCorpEmail, data.nombre_completo);

        return res.json({ 
            success: true, 
            message: resultadoEmail.enviado 
                ? 'Solicitud pre-aprobada y correo enviado con éxito.' 
                : 'Solicitud pre-aprobada en BD, pero falló el envío del correo.'
        });
    } catch (error) {
        console.error('Error al pre-aprobar:', error);
        return res.status(500).json({ error: 'Error interno en la base de datos al pre-aprobar.' });
    }
});

// 6. Solicitar Activación
app.post('/api/solicitudes/solicitar-activacion', async (req, res) => {
    const { email_corporativo } = req.body;

    if (!email_corporativo || !email_corporativo.trim()) {
        return res.status(400).json({ error: 'Debe ingresar un correo corporativo.' });
    }

    try {
        const cleanEmail = email_corporativo.trim().toLowerCase();
        const [rows] = await db.query(
            'SELECT * FROM usuarios_solicitudes WHERE email = ? AND estado = "PRE_APROBADO"',
            [cleanEmail]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'El correo empresarial no está pre-aprobado o ya se encuentra en proceso de activación.' });
        }

        await db.query(
            'UPDATE usuarios_solicitudes SET estado = "PENDIENTE_ACTIVACION", fase = 3 WHERE email = ?',
            [cleanEmail]
        );

        return res.json({ success: true, message: 'Solicitud de activación enviada correctamente. El administrador procederá a la activación.' });
    } catch (error) {
        console.error('Error al solicitar activación:', error);
        return res.status(500).json({ error: 'Error al procesar la solicitud de activación.' });
    }
});

// 7. Activar cuenta final (Guarda rol, proyecto, cargo y genera contraseña temporal)
app.post('/api/admin/activar-cuenta', async (req, res) => {
    const { id, rol, proyecto, cargo } = req.body;

    if (!id || !rol || !proyecto || !cargo) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos (id, rol, proyecto o cargo).' });
    }

    try {
        const [solicitud] = await db.query('SELECT * FROM usuarios_solicitudes WHERE id = ?', [id]);
        if (solicitud.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada.' });

        const data = solicitud[0];

        const passwordTemp = Math.random().toString(36).slice(-8) + 'Nx!';
        const passwordHash = await bcrypt.hash(passwordTemp, 10);

        await db.query(
            'UPDATE usuarios_solicitudes SET rol = ?, proyecto = ?, cargo = ?, password_hash = ?, estado = "ACTIVO", fase = 4 WHERE id = ?',
            [rol, proyecto, cargo, passwordHash, id]
        );

        let emailEnviado = false;
        try {
            const resultado = await enviarCorreoActivacionFinal(data.email_personal, data.email, passwordTemp, rol);
            emailEnviado = resultado ? resultado.enviado : true;
        } catch (emailErr) {
            console.error('Error al enviar correo de activación:', emailErr);
        }

        return res.json({ 
            success: true, 
            message: emailEnviado 
                ? 'Cuenta activada, rol, proyecto y cargo asignados con éxito.' 
                : 'Cuenta activada en BD, pero hubo un problema al enviar el correo.'
        });
    } catch (error) {
        console.error('Error al activar cuenta:', error);
        return res.status(500).json({ error: 'Error interno en BD al activar la cuenta.' });
    }
});

// 8. Rechazar solicitud
app.post('/api/admin/rechazar', async (req, res) => {
    const { id } = req.body;

    try {
        const [solicitud] = await db.query('SELECT * FROM usuarios_solicitudes WHERE id = ?', [id]);
        if (solicitud.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada.' });

        const data = solicitud[0];

        try {
            await enviarCorreoRechazo(data.email_personal, data.nombre_completo);
        } catch (emailErr) {
            console.error('Error enviando notificación de rechazo:', emailErr);
        }

        await db.query('DELETE FROM usuarios_solicitudes WHERE id = ?', [id]);

        return res.json({ success: true, message: 'Solicitud rechazada y eliminada.' });
    } catch (error) {
        console.error('Error al rechazar solicitud:', error);
        return res.status(500).json({ error: 'Error al rechazar la solicitud.' });
    }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Servidor local corriendo en http://localhost:${PORT}`);
});