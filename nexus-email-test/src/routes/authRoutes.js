// src/routes/authRoutes.js

import { Router } from 'express';
import { 
  listarSolicitudesPendientes, 
  registrarSolicitud, 
  aprobarSolicitud, 
  rechazarSolicitud, 
  validarEmailLogin, 
  login,
  obtenerCuentasActivas,
  crearInvitacion,
  solicitarActivacion
} from '../controllers/authController.js';

const router = Router();

router.get('/solicitudes-pendientes', listarSolicitudesPendientes);
router.get('/cuentas-activas', obtenerCuentasActivas);
router.post('/registrar-solicitud', registrarSolicitud);
router.post('/aprobar-solicitud', aprobarSolicitud);
router.post('/rechazar-solicitud', rechazarSolicitud);
router.post('/crear-invitacion', crearInvitacion);
router.post('/validar-email-login', validarEmailLogin);
router.post('/solicitar-activacion', solicitarActivacion);
router.post('/login', login); 

export default router;