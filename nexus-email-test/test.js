import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'darkkrisalix@gmail.com',
    pass: 'txzjwmqgxvhqwrpe'
  },
  family: 4
});

async function enviarCorreoPrueba(destinatario, passwordTemp) {
  try {
    const info = await transporter.sendMail({
      from: '"NEXUS System" <darkkrisalix@gmail.com>',
      to: destinatario,
      subject: 'Acceso Aprobado - Plataforma NEXUS',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>¡Tu solicitud fue aprobada!</h2>
          <p>Tus credenciales temporales de acceso son:</p>
          <p><strong>Contraseña:</strong> <code>${passwordTemp}</code></p>
        </div>
      `
    });
    console.log('✅ Correo enviado con éxito. ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error al enviar:', error.message);
  }
}

enviarCorreoPrueba('darkkrisalix616@gmail.com', 'NEXUS-2026');