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
  family: 4
});

export const enviarCredencialesAcceso = async (emailDestino, nombre, passwordTemporal, rol) => {
  const mailOptions = {
    from: `"NEXUS Enterprise System" <${process.env.EMAIL_USER}>`,
    to: emailDestino,
    subject: 'Solicitud Aprobada - Accesos a la Plataforma NEXUS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #0284c7;">¡Hola, ${nombre}!</h2>
        <p>Tu solicitud de acceso a la plataforma <strong>NEXUS</strong> ha sido aprobada.</p>
        <p>Se te ha asignado el rol de: <strong>${rol}</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <h3>Tus credenciales de acceso:</h3>
        <p><strong>Usuario / Correo:</strong> ${emailDestino}</p>
        <p><strong>Contraseña Temporal:</strong> <code>${passwordTemporal}</code></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Por favor, ingresa al sistema y cambia tu contraseña tras el primer inicio de sesión.</p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

export const enviarNotificacionRechazo = async (emailDestino, nombre) => {
  const mailOptions = {
    from: `"NEXUS Enterprise System" <${process.env.EMAIL_USER}>`,
    to: emailDestino,
    subject: 'Estado de Solicitud - Plataforma NEXUS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #e11d48;">Hola, ${nombre}</h2>
        <p>Lamentamos informarte que tu solicitud de acceso a la plataforma <strong>NEXUS</strong> no ha sido aprobada en este momento.</p>
        <p>Si consideras que esto es un error, por favor ponte en contacto con el administrador del sistema.</p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};