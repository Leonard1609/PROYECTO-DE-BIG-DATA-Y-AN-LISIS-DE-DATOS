import express from 'express';
import authRoutes from './routes/authRoutes.js'; // Importas las rutas que creaste

const app = express();

app.use(express.json());
app.use(express.static('public')); // Para servir tus HTML (solicitudes.html, aprobar.html, etc.)

// REGISTRAR RUTAS CON EL PREFIJO /api
app.use('/api', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});