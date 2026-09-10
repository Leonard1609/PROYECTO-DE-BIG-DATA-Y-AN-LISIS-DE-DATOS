import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Es fundamental registrar el prefijo /api
app.use('/api', authRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});