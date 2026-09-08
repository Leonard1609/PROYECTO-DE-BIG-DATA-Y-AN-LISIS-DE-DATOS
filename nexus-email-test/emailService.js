const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Tu correo corporativo/admin
        pass: process.env.EMAIL_PASS  // Contraseña de aplicación
    }
});

// Función para enviar credenciales al aprobar
async function enviarCredencialesAcceso(emailDestino, nombre, passwordTemporal, rol) {
    const mailOptions = {
        from: '"NEXUS Enterprise System" <no-reply@nexus.com>',
        to: emailDestino,
        subject: 'Solicitud Aprobada - Accesos a la Plataforma NEXUS',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>¡Hola, ${nombre}!</h2>
                <p>Tu solicitud de acceso a la plataforma <strong>NEXUS</strong> ha sido aprobada.</p>
                <p>Se te ha asignado el rol de: <strong>${rol}</strong></p>
                <hr>
                <h3>Tus credenciales de acceso:</h3>
                <p><strong>Usuario / Correo:</strong> ${emailDestino}</p>
                <p><strong>Contraseña Temporal:</strong> <code>${passwordTemporal}</code></p>
                <hr>
                <p>Por favor, ingresa al sistema y cambia tu contraseña tras el primer inicio de sesión.</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
}

module.exports = { enviarCredencialesAcceso };