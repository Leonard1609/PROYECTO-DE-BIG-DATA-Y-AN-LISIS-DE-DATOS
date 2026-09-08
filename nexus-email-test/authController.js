const { enviarCredencialesAcceso } = require('./emailService');
const crypto = require('crypto');

// 1. Cuando el trabajador ingresa su correo en el Login para solicitar acceso
async function solicitarAcceso(req, res) {
    const { email, nombre } = req.body;
    
    // Verificar si ya existe
    const usuarioExistente = await buscarUsuarioPorEmail(email);
    
    if (usuarioExistente) {
        if (usuarioExistente.estado === 'ACTIVO') {
            return res.json({ status: 'REQUIERE_PASSWORD', message: 'Cuenta activa. Ingrese contraseña.' });
        } else {
            return res.json({ status: 'PENDIENTE', message: 'Su solicitud sigue en revisión por el Administrador.' });
        }
    }

    // Si no existe, crear solicitud PENDIENTE
    await crearSolicitudAcceso({ email, nombre, estado: 'PENDIENTE' });
    return res.json({ status: 'SOLICITUD_ENVIADA', message: 'Solicitud enviada con éxito al Administrador.' });
}

// 2. Acción del ADMIN desde el Panel de Gestión / Invitaciones
async function aprobarSolicitud(req, res) {
    const { usuarioId, rolAsignado } = req.body;

    // Generar contraseña aleatoria segura
    const tempPassword = crypto.randomBytes(4).toString('hex'); // Ej: "a3f8b9c2"

    // Actualizar usuario en Base de Datos: Estado 'ACTIVO', Asignar Rol y Contraseña
    const usuarioActualizado = await actualizarUsuario({
        id: usuarioId,
        rol: rolAsignado,
        estado: 'ACTIVO',
        password: tempPassword // Guardar cifrada con bcrypt en producción
    });

    // Enviar correo con credenciales
    try {
        await enviarCredencialesAcceso(
            usuarioActualizado.email, 
            usuarioActualizado.nombre, 
            tempPassword, 
            rolAsignado
        );
        res.json({ success: true, message: `Acceso aprobado y correo enviado a ${usuarioActualizado.email}` });
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar el correo con las credenciales.' });
    }
}