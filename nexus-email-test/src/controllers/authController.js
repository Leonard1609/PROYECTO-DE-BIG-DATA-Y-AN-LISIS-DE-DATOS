import bcrypt from 'bcryptjs';
import { enviarCredencialesAcceso } from '../services/emailService.js';
import { supabase } from '../config/supabase.js';

export async function aprobarSolicitud(req, res) {
  const { usuarioId, rolAsignado } = req.body;

  // Limpiar espacios en blanco del UUID
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
  usuario.email,           // 1. emailDestino
  usuario.nombre_completo, // 2. nombre ("Sam Test")
  passwordTemporal,        // 3. passwordTemporal ("22wdtc1v")
  rolAsignado              // 4. rol
);

    return res.status(200).json({
      message: `¡Solicitud aprobada con éxito! Credenciales enviadas a ${usuario.email}`
    });

  } catch (err) {
    console.error('💥 Error en el servidor:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}