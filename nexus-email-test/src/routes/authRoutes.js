// src/routes/authRoutes.js

import { Router } from 'express';
import { 
  listarSolicitudesPendientes, 
  registrarSolicitud, 
  aprobarSolicitud, 
  rechazarSolicitud, 
  validarEmailLogin, 
  login,
  obtenerCuentasActivas
} from '../controllers/authController.js';

const router = Router();

router.get('/solicitudes-pendientes', listarSolicitudesPendientes);
router.get('/cuentas-activas', obtenerCuentasActivas);
router.post('/registrar-solicitud', registrarSolicitud);
router.post('/aprobar-solicitud', aprobarSolicitud);
router.post('/rechazar-solicitud', rechazarSolicitud);

// CAMBIO AQUÍ: Cambia '/validar-email' por '/validar-email-login'
router.post('/validar-email-login', validarEmailLogin);

router.post('/login', login);

export default router;