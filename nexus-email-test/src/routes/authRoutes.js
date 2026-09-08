import { Router } from 'express';
import { 
  aprobarSolicitud, 
  rechazarSolicitud, 
  validarEmailLogin, 
  listarSolicitudesPendientes 
} from '../controllers/authController.js';

const router = Router();

router.get('/solicitudes-pendientes', listarSolicitudesPendientes);
router.post('/aprobar-solicitud', aprobarSolicitud);
router.post('/rechazar-solicitud', rechazarSolicitud);
router.post('/validar-email-login', validarEmailLogin);

export default router;