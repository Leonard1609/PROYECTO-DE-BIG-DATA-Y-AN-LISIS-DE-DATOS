import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import { enviarCredencialesAcceso, enviarNotificacionRechazo } from '../services/emailService.js';

// 1. LISTAR SOLICITUDES PENDIENTES
export async function listarSolicitudesPendientes(req, res) {
  try {
    const { data, error } = await supabase
      .from('usuarios_solicitudes')
      .select('*')
      .eq('estado', 'PENDIENTE');

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener las solicitudes pendientes.' });
  }
}

// 2. REGISTRAR SOLICITUD
export async function registrarSolicitud(req, res) {
  const { nombre_completo, email, modulo_interes } = req.body;

  try {
    const { data, error } = await supabase
      .from('usuarios_solicitudes')
      .insert([
        {
          nombre_completo,
          email,
          modulo_interes,
          estado: 'PENDIENTE'
        }
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ message: 'Solicitud registrada correctamente.', data });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno al registrar la solicitud.' });
  }
}

// 3. APROBAR SOLICITUD (Genera contraseña y envía email)
export async function aprobarSolicitud(req, res) {
  const { id, email, nombre, rol } = req.body;

  try {
    // 1. Generar contraseña temporal de 8 caracteres
    const passwordTemporal = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(passwordTemporal, 10);

    // Normalizar el rol para coincidir con enum de Supabase (EMPLEADO, ADMIN, ANALISTA)
    const rolNormalizado = (rol || 'EMPLEADO').toUpperCase();

    // 2. Actualizar estado y hash en Supabase
    const { error } = await supabase
      .from('usuarios_solicitudes')
      .update({
        estado: 'ACTIVO',
        rol: rolNormalizado,
        password_hash: passwordHash
      })
      .eq('id', id);

    if (error) {
      console.error('Error de Supabase al actualizar:', error.message);
      return res.status(400).json({ error: error.message });
    }

    // 3. Intentar enviar correo (sin bloquear si la cuenta de Gmail falla)
    try {
      await enviarCredencialesAcceso(email, nombre, passwordTemporal, rolNormalizado);
    } catch (emailErr) {
      console.error('Error al enviar el correo (Nodemailer):', emailErr.message);
      return res.status(200).json({ 
        message: `Solicitud aprobada, pero falló el envío de correo. Contraseña generada: ${passwordTemporal}` 
      });
    }

    return res.status(200).json({ message: 'Solicitud aprobada y correo enviado con éxito.' });
  } catch (err) {
    console.error('Error en aprobarSolicitud:', err);
    return res.status(500).json({ error: 'Error interno al aprobar la solicitud.' });
  }
}

// 4. RECHAZAR SOLICITUD (Notifica por correo)
export async function rechazarSolicitud(req, res) {
  const { id, email, nombre } = req.body;

  try {
    const { error } = await supabase
      .from('usuarios_solicitudes')
      .update({ estado: 'RECHAZADO' })
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });

    // Enviar correo de notificación
    await enviarNotificacionRechazo(email, nombre);

    return res.status(200).json({ message: 'Solicitud rechazada y correo enviado.' });
  } catch (err) {
    console.error('Error en rechazarSolicitud:', err);
    return res.status(500).json({ error: 'Error interno al rechazar la solicitud.' });
  }
}

// 5. VALIDAR EMAIL EN LOGIN
export async function validarEmailLogin(req, res) {
  const { email } = req.body;

  try {
    const { data: usuario, error } = await supabase
      .from('usuarios_solicitudes')
      .select('estado')
      .eq('email', email)
      .maybeSingle();

    if (error || !usuario) {
      return res.status(404).json({ error: 'Correo no registrado.' });
    }

    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({ error: 'Tu solicitud aún está pendiente o fue rechazada.' });
    }

    return res.status(200).json({ permitido: true });
  } catch (err) {
    return res.status(500).json({ error: 'Error al validar el correo.' });
  }
}

// 6. LOGIN
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const { data: usuario, error } = await supabase
      .from('usuarios_solicitudes')
      .select('id, nombre_completo, email, rol, estado, password_hash')
      .eq('email', email)
      .maybeSingle();

    if (error || !usuario) return res.status(404).json({ error: 'Credenciales inválidas.' });
    if (usuario.estado !== 'ACTIVO') return res.status(403).json({ error: 'Usuario no activo.' });

    // Comparación híbrida: verifica texto plano O hash bcrypt
    const passwordValido = (password === usuario.password_hash) || 
                           (await bcrypt.compare(password, usuario.password_hash).catch(() => false));

    if (!passwordValido) return res.status(401).json({ error: 'Contraseña incorrecta.' });

    const { password_hash, ...datosUsuario } = usuario;
    return res.status(200).json({ message: 'Inicio de sesión exitoso', usuario: datosUsuario });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno al iniciar sesión.' });
  }
}

// 7. OBTENER CUENTAS ACTIVAS
export async function obtenerCuentasActivas(req, res) {
  try {
    const { data, error } = await supabase
      .from('usuarios_solicitudes')
      .select('id, nombre_completo, email, rol, modulo_interes, creado_en')
      .eq('estado', 'ACTIVO');

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener cuentas activas.' });
  }
}