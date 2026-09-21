require('dotenv').config();

/**
 * Función interna para realizar las peticiones a la API de Brevo via HTTP REST
 */
async function enviarCorreoBrevo({ to, subject, htmlContent }) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.EMAIL_SENDER_ADDR || process.env.EMAIL_USER;
    const senderName = process.env.EMAIL_SENDER_NAME || 'NEXUS Plataforma';

    if (!apiKey) {
        console.error('❌ Error: BREVO_API_KEY no está configurada en el archivo .env');
        return { enviado: false, error: 'BREVO_API_KEY no configurada' };
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: senderName,
                    email: senderEmail
                },
                to: [
                    { email: to }
                ],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Error de Brevo API:', data);
            return { enviado: false, error: data.message || 'Error al enviar correo' };
        }

        console.log(`📧 Notificación enviada con éxito a ${to} (MessageID: ${data.messageId})`);
        return { enviado: true, messageId: data.messageId };
    } catch (error) {
        console.error('❌ Error de conexión al servicio de correo Brevo:', error.message);
        return { enviado: false, error: error.message };
    }
}

async function enviarCorreoPreAprobacion(emailPersonal, emailCorporativo, nombre) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #2563eb;">¡Solicitud Pre-aprobada en NEXUS!</h2>
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Tu solicitud de acceso ha sido revisada y pre-aprobada exitosamente.</p>
            <p>Se te ha asignado el siguiente correo corporativo:</p>
            <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 16px; text-align: center; font-weight: bold; color: #0f172a;">
                ${emailCorporativo}
            </div>
            <small style="color: #666;">Sistema NEXUS - Gestión Unificada de Accesos</small>
        </div>
    `;

    return enviarCorreoBrevo({
        to: emailPersonal,
        subject: 'Solicitud Pre-Aprobada - Asignación de Correo Corporativo NEXUS',
        htmlContent
    });
}

async function enviarCorreoRechazo(emailPersonal, nombre) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #dc2626;">Solicitud de Acceso No Aprobada</h2>
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Lamentamos informarte que tu solicitud de acceso a la plataforma NEXUS ha sido rechazada.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <small style="color: #666;">Sistema NEXUS - Gestión Unificada de Accesos</small>
        </div>
    `;

    return enviarCorreoBrevo({
        to: emailPersonal,
        subject: 'Actualización sobre tu Solicitud de Acceso - NEXUS',
        htmlContent
    });
}

async function enviarCorreoActivacionFinal(emailPersonal, emailCorporativo, passwordGenerada, rol) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #16a34a;">¡Cuenta Activada Exitosamente!</h2>
            <p>Tu cuenta corporativa ya se encuentra activa con el rol de <strong>${rol}</strong>.</p>
            <p>Tus credenciales de acceso son:</p>
            <ul>
                <li><strong>Contraseña Temporal:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${passwordGenerada}</code></li>
            </ul>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <small style="color: #666;">Sistema NEXUS - Gestión Unificada de Accesos</small>
        </div>
    `;

    return enviarCorreoBrevo({
        to: emailPersonal,
        subject: 'Credenciales de Acceso - Cuenta Activada NEXUS',
        htmlContent
    });
}

module.exports = {
    enviarCorreoPreAprobacion,
    enviarCorreoRechazo,
    enviarCorreoActivacionFinal
};