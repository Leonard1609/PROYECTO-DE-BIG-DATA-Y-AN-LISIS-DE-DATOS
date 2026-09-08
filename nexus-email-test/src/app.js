import 'dotenv/config';
import express from 'express';
import path from 'path';
import { aprobarSolicitud } from './controllers/authController.js';

const app = express();
app.use(express.json());

// Servir la vista de prueba HTML
app.use(express.static('public'));

app.post('/api/aprobar-solicitud', aprobarSolicitud);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});