// src/services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Envia credenciales activas con Password
export const enviarCredencialesAcceso = async (emailDestino, correoEmpresarial, nombre, passwordTemporal, rol) => {
  const mailOptions = {
    from: `"NEXUS Enterprise System" <${process.env.EMAIL_USER}>`,
    to: emailDestino,
    subject: '¡Cuenta Activada! - Accesos a NEXUS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #0284c7;">¡Hola, ${nombre}!</h2>
        <p>Tu cuenta en la plataforma <strong>NEXUS</strong> ha sido activada exitosamente.</p>
        <p><strong>Rol asignado:</strong> ${rol}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <h3>Credenciales de acceso:</h3>
        <p><strong>Correo Empresarial:</strong> <span style="color: #0284c7;">${correoEmpresarial}</span></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Por favor, ingresa a la plataforma y cambia tu contraseña tras el primer inicio.</p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

// Envia notificaciones de rechazo
export const enviarNotificacionRechazo = async (emailDestino, motivo) => {
  const mailOptions = {
    from: `"NEXUS Enterprise System" <${process.env.EMAIL_USER}>`,
    to: emailDestino,
    subject: 'Estado de Solicitud - Plataforma NEXUS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #e11d48;">Atención</h2>
        <p>Tu solicitud o acceso a la plataforma <strong>NEXUS</strong> no ha sido aprobada.</p>
        ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ''}
        <p>Ponte en contacto con el administrador si requieres más información.</p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

// Envia invitación inicial (Fase 1 Invitación)
export async function enviarCorreoInvitacion(correoPersonal, correoEmpresarial) {
  const mailOptions = {
    from: '"NEXUS Enterprise System" <tu_correo_emisor@gmail.com>',
    to: correoPersonal, // <--- OBLIGATORIO: Debe ser el Gmail personal que sí existe
    subject: 'Invitación de Acceso a NEXUS - Correo Corporativo Asignado',
    html: `
      <h2>¡Bienvenido a NEXUS!</h2>
      <p>Has sido pre-aprobado en el sistema.</p>
      <p>Se te ha asignado el siguiente correo empresarial para ingresar: <b>${correoEmpresarial}</b></p>
      <p>Ingresa al portal de Login con este correo corporativo para solicitar la activación final de tu cuenta.</p>
    `
  };

  return await transporter.sendMail(mailOptions);
}