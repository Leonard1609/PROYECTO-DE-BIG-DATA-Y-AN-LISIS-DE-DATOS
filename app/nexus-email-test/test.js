import express from 'express';
import nodemailer from 'nodemailer';

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  family: 4, // Fuerza conexión IPv4 para evitar el error ENETUNREACH en Render
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get('/', (req, res) => {
  res.send('Servidor de correos NEXUS activo');
});

app.post('/send-email', async (req, res) => {
  try {
    const { destinatario, passwordTemp } = req.body;
    const info = await transporter.sendMail({
      from: `"NEXUS System" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'Acceso Aprobado - Plataforma NEXUS',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>¡Tu solicitud fue aprobada!</h2>
          <p>Tus credenciales temporales de acceso son:</p>
          <p><strong>Contraseña:</strong> <code>${passwordTemp}</code></p>
        </div>
      `,
    });
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de correos escuchando en el puerto ${PORT}`);
});