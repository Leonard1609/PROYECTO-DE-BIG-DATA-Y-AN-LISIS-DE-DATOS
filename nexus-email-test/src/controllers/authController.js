import bcrypt from 'bcryptjs';
import { enviarCredencialesAcceso, enviarNotificacionRechazo } from '../services/emailService.js';
import { supabase } from '../config/supabase.js';

// 1. APROBAR SOLICITUD Y ENVIAR CREDENCIALES
export async function aprobarSolicitud(req, res) {
  const { usuarioId, rolAsignado } = req.body;
  const idLimpio = usuarioId ? usuarioId.trim() : '';

  try {
    const passwordTemporal = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordTemporal, salt);

    const { data, error } = await supabase
      .from('usuarios_solicitudes')
      .update({
        estado: 'ACTIVO',
        rol: rolAsignado,
        password_hash: passwordHash
      })
      .eq('id', idLimpio)
      .select();

    if (error) {
      console.error('❌ Error en Supabase:', error.message);
      return res.status(400).json({ error: `Supabase: ${error.message}` });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No se encontró la solicitud con ese UUID.' });
    }

    const usuario = data[0];

    await enviarCredencialesAcceso(
      usuario.email,
      usuario.nombre_completo,
      passwordTemporal,
      rolAsignado
    );

    return res.status(200).json({
      message: `¡Solicitud aprobada con éxito! Credenciales enviadas a ${usuario.email}`
    });

  } catch (err) {
    console.error('💥 Error en el servidor:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}

// 2. RECHAZAR SOLICITUD
export async function rechazarSolicitud(req, res) {
  try {
    const { id } = req.body;

    const { data: usuario, error } = await supabase
      .from('usuarios_solicitudes')
      .update({ estado: 'RECHAZADO' })
      .eq('id', id)
      .select()
      .single();

    if (error || !usuario) {
      return res.status(400).json({ error: 'No se pudo rechazar la solicitud o el ID no existe.' });
    }

    if (typeof enviarNotificacionRechazo === 'function') {
      await enviarNotificacionRechazo(usuario.email, usuario.nombre_completo);
    }

    return res.status(200).json({ message: 'Solicitud rechazada con éxito.' });
  } catch (err) {
    console.error('Error al rechazar:', err);
    return res.status(500).json({ error: 'Error interno al procesar el rechazo.' });
  }
}

// 3. VALIDAR EMAIL LOGIN
export async function validarEmailLogin(req, res) {
  const { email } = req.body;

  const { data: usuario, error } = await supabase
    .from('usuarios_solicitudes')
    .select('estado')
    .eq('email', email)
    .maybeSingle();

  if (error || !usuario) {
    return res.status(404).json({ error: 'Correo no registrado.' });
  }

  if (usuario.estado !== 'ACTIVO') {
    return res.status(403).json({ error: 'Tu solicitud aún está pendiente o ha sido rechazada.' });
  }

  return res.status(200).json({ permitido: true });
}

// 4. LISTAR SOLICITUDES PENDIENTES
export async function listarSolicitudesPendientes(req, res) {
  try {
    const { data, error } = await supabase
      .from('usuarios_solicitudes')
      .select('id, nombre_completo, email')
      .eq('estado', 'PENDIENTE');

    if (error) {
      console.error('Error Supabase:', error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error Servidor:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}