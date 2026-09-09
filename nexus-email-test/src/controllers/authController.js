// src/controllers/authController.js

import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import { 
  enviarCredencialesAcceso, 
  enviarNotificacionRechazo, 
  enviarCorreoInvitacion 
} from '../services/emailService.js';

// Regex para validar si el ID es un UUID válido de Supabase/PostgreSQL
const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 1. CREAR INVITACIÓN DIRECTA POR EL ADMIN (FASE 1 INVITACIÓN)
export async function crearInvitacion(req, res) {
  const { email_personal, email_empresarial, rol, cargo, proyecto } = req.body;

  if (!email_personal || !email_empresarial) {
    return res.status(400).json({ error: 'El correo personal y el empresarial son requeridos.' });
  }

  const emailEmpClean = email_empresarial.trim().toLowerCase();
  const emailPersClean = email_personal.trim().toLowerCase();

  try {
    const { data: existente } = await supabase
      .from('usuarios_solicitudes')
      .select('id')
      .eq('email', emailEmpClean)
      .maybeSingle();

    if (existente) {
      return res.status(400).json({ error: 'Ya existe un usuario o solicitud asociada a este correo empresarial.' });
    }

    const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();

    const payloadInvitacion = {
      email: emailPersClean,
      email_personal: emailPersClean,
      email_empresarial: emailEmpClean,
      codigo: codigoGenerado,
      rol: rol || 'EMPLEADO',
      proyecto: proyecto || 'GENERAL',
      estado: 'PENDIENTE',
      usado: false
    };

    if (cargo) payloadInvitacion.cargo = cargo;

    const { data, error } = await supabase
      .from('invitaciones')
      .insert([payloadInvitacion])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    try {
      await enviarCorreoInvitacion(emailPersClean, emailEmpClean);
    } catch (emailErr) {
      console.error("Error al enviar email de invitación:", emailErr);
    }

    return res.status(201).json({
      message: 'Invitación enviada con éxito.',
      data
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno al generar la invitación.' });
  }
}

// 2. VALIDAR EMAIL EN LOGIN GENERAL (GESTIÓN DE FASES)
export async function validarEmailLogin(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El correo es requerido.' });

  const emailClean = email.trim().toLowerCase();

  try {
    const { data: usuario } = await supabase
      .from('usuarios_solicitudes')
      .select('id, estado, origen, fase, nombre_completo, email, email_personal')
      .or(`email.eq.${emailClean},email_personal.eq.${emailClean}`)
      .maybeSingle();

    if (usuario) {
      if (usuario.estado === 'ACTIVO') {
        return res.status(200).json({ accion: 'INGRESAR_PASSWORD', fase: 4, usuario });
      }

      if (usuario.estado === 'PRE_APROBADO' || usuario.estado === 'PENDIENTE_ACTIVACION' || (usuario.origen === 'SOLICITUD' && usuario.fase === 3)) {
        return res.status(200).json({ 
          accion: 'ACTIVAR_CUENTA', 
          fase: 3, 
          origen: 'SOLICITUD',
          message: 'Tu solicitud fue pre-aprobada. Presiona el botón para solicitar la activación final.',
          usuario 
        });
      }

      if (usuario.estado === 'PENDIENTE') {
        return res.status(200).json({ 
          accion: 'EN_REVISION', 
          fase: 2,
          message: 'Tu solicitud o registro de datos se encuentra en revisión por el área de gestión.' 
        });
      }

      if (usuario.estado === 'RECHAZADO') {
        return res.status(403).json({ 
          accion: 'RECHAZADO', 
          error: 'El acceso para este correo ha sido rechazado.' 
        });
      }
    }

    const { data: invitacion } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('email_empresarial', emailClean)
      .eq('usado', false)
      .maybeSingle();

    if (invitacion) {
      return res.status(200).json({
        accion: 'COMPLETAR_REGISTRO_INVITACION',
        origen: 'INVITACION',
        fase: 2,
        datosInvitacion: {
          invitacion_id: invitacion.id,
          email_empresarial: invitacion.email_empresarial,
          modulo_interes: invitacion.proyecto || invitacion.rol
        }
      });
    }

    return res.status(200).json({
      accion: 'SOLICITAR_ACCESO',
      origen: 'SOLICITUD',
      fase: 1
    });

  } catch (err) {
    return res.status(500).json({ error: 'Error al validar el correo.' });
  }
}

// 3. REGISTRAR SOLICITUD / DATOS (FASE 2)
export async function registrarSolicitud(req, res) {
  const { nombre_completo, email, modulo_interes, origen, invitacion_id } = req.body;
  const emailClean = email.trim().toLowerCase();

  try {
    if (origen === 'INVITACION' && invitacion_id) {
      await supabase
        .from('invitaciones')
        .update({ usado: true, estado: 'DATOS_COMPLETADOS' })
        .eq('id', invitacion_id);
    }

    const { data, error } = await supabase
      .from('usuarios_solicitudes')
      .insert([
        {
          nombre_completo,
          email: emailClean,
          email_personal: emailClean, // Preservamos el Gmail personal original
          modulo_interes: modulo_interes || 'GENERAL',
          estado: 'PENDIENTE',
          origen: origen || 'SOLICITUD',
          fase: 2
        }
      ])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({
      message: 'Datos guardados. Pasa a revisión del área de gestión.',
      data
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno al registrar la solicitud.' });
  }
}

// 4. SOLICITAR ACTIVACIÓN (FASE 3 - SOLICITUD DE ACCESO)
export async function solicitarActivacion(req, res) {
  const { email } = req.body;
  const emailClean = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from('usuarios_solicitudes')
      .update({ estado: 'PENDIENTE_ACTIVACION', fase: 3 })
      .or(`email.eq.${emailClean},email_personal.eq.${emailClean}`)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({
      message: 'Activación solicitada al administrador.',
      data
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al solicitar activación.' });
  }
}

// 5. APROBAR Y ACTIVAR DEFINITIVAMENTE (FASE 4 / FASE 3 INVITACIÓN)
export async function aprobarSolicitud(req, res) {
  const { id, email, correoEmpresarial, nombre, rol, proyecto, origen } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'El ID es obligatorio.' });
  }

  if (!REGEX_UUID.test(id)) {
    return res.status(400).json({ error: `El ID '${id}' no es un UUID válido.` });
  }

  try {
    const passwordTemporal = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(passwordTemporal, 10);
    const rolNormalizado = (rol || 'EMPLEADO').toUpperCase();

    // Obtener los datos actuales del registro
    const { data: solActual } = await supabase
      .from('usuarios_solicitudes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    // FASE 2 SOLICITUD DE ACCESO -> Visto Bueno del Admin
    if ((solActual && solActual.estado === 'PENDIENTE') || origen === 'SOLICITUD_FASE_2') {
      const correoPersonalNotif = solActual?.email_personal || solActual?.email || email;
      
      let correoAsignado = correoEmpresarial;
      if (!correoAsignado) {
        const prefix = correoPersonalNotif.split('@')[0];
        correoAsignado = `${prefix}@nexus-tech.com`;
      }

      const { error: preApproveError } = await supabase
        .from('usuarios_solicitudes')
        .update({
          email: correoAsignado,
          email_personal: correoPersonalNotif,
          estado: 'PRE_APROBADO',
          fase: 3,
          rol: rolNormalizado,
          modulo_interes: proyecto || 'GENERAL'
        })
        .eq('id', id);

      if (preApproveError) return res.status(400).json({ error: preApproveError.message });

      // Enviar notificación al Gmail personal
      try {
        await enviarCorreoInvitacion(correoPersonalNotif, correoAsignado);
      } catch (eErr) {
        console.error("Error enviando correo de visto bueno:", eErr);
      }

      return res.status(200).json({
        message: 'Solicitud pre-aprobada. Se envió correo con su correo empresarial asignado.',
        correoEmpresarial: correoAsignado
      });
    }

    // ACTIVACIÓN FINAL (FASE 4 Solicitud o FASE 3 Invitación)
    if (origen === 'INVITACION' || origen === 'Invitación') {
      const { data: invData } = await supabase
        .from('invitaciones')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      const emailPersonal = invData ? invData.email_personal : email;
      const correoDestino = correoEmpresarial || invData?.email_empresarial || email;

      const { error: insertError } = await supabase
        .from('usuarios_solicitudes')
        .insert([
          {
            nombre_completo: nombre || 'Usuario Invitado',
            email: correoDestino,
            email_personal: emailPersonal,
            modulo_interes: proyecto || invData?.proyecto || 'GENERAL',
            estado: 'ACTIVO',
            origen: 'INVITACION',
            fase: 3,
            rol: rolNormalizado,
            password_hash: passwordHash
          }
        ]);

      if (insertError) return res.status(400).json({ error: insertError.message });

      await supabase
        .from('invitaciones')
        .update({ usado: true, estado: 'COMPLETADO' })
        .eq('id', id);

      try {
        await enviarCredencialesAcceso(
          emailPersonal,
          correoDestino,
          nombre || 'Usuario',
          passwordTemporal,
          rolNormalizado
        );
      } catch (eErr) {
        console.error("Error enviando credenciales:", eErr);
      }

      return res.status(200).json({
        message: 'Cuenta activada correctamente.',
        correoEmpresarial: correoDestino
      });
    }

    // Activación final para flujo de solicitud (Fase 4 - PENDIENTE_ACTIVACION / PRE_APROBADO)
    const correoPersonalReal = solActual?.email_personal || email;
    const correoEmpresarialFinal = correoEmpresarial || solActual?.email || email;

    const { error: updateError } = await supabase
      .from('usuarios_solicitudes')
      .update({
        email: correoEmpresarialFinal,
        email_personal: correoPersonalReal,
        estado: 'ACTIVO',
        fase: 4,
        rol: rolNormalizado,
        modulo_interes: proyecto || 'GENERAL',
        password_hash: passwordHash
      })
      .eq('id', id);

    if (updateError) return res.status(400).json({ error: updateError.message });

    try {
      await enviarCredencialesAcceso(
        correoPersonalReal, // Destinatario real de correo (Gmail)
        correoEmpresarialFinal, // Correo empresarial impreso en la plantilla
        nombre || solActual?.nombre_completo || 'Usuario',
        passwordTemporal,
        rolNormalizado
      );
    } catch (eErr) {
      console.error("Error enviando credenciales finales:", eErr);
    }

    return res.status(200).json({
      message: 'Cuenta activada exitosamente en Fase 4.',
      correoEmpresarial: correoEmpresarialFinal
    });

  } catch (err) {
    return res.status(500).json({ error: 'Error interno al procesar la aprobación.' });
  }
}

// 6. RECHAZAR SOLICITUD O INVITACIÓN
export async function rechazarSolicitud(req, res) {
  const { id, origen, motivo } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'El ID es requerido para rechazar.' });
  }

  if (!REGEX_UUID.test(id)) {
    return res.status(400).json({ error: `El ID '${id}' no es un UUID válido.` });
  }

  try {
    if (origen === 'INVITACION' || origen === 'Invitación') {
      const { data: inv } = await supabase
        .from('invitaciones')
        .update({ estado: 'RECHAZADO', usado: true })
        .eq('id', id)
        .select()
        .single();

      if (inv?.email_personal) {
        try {
          await enviarNotificacionRechazo(inv.email_personal, motivo);
        } catch (e) {
          console.error("Error enviando rechazo:", e);
        }
      }
    } else {
      const { data: sol } = await supabase
        .from('usuarios_solicitudes')
        .update({ estado: 'RECHAZADO' })
        .eq('id', id)
        .select()
        .single();

      const destinatarioRechazo = sol?.email_personal || sol?.email;
      if (destinatarioRechazo) {
        try {
          await enviarNotificacionRechazo(destinatarioRechazo, motivo);
        } catch (e) {
          console.error("Error enviando rechazo:", e);
        }
      }
    }

    return res.status(200).json({ message: 'Solicitud/Invitación rechazada correctamente.' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al rechazar.' });
  }
}

// 7. LISTAR PENDIENTES
export async function listarSolicitudesPendientes(req, res) {
  try {
    const { data: solicitudes, error: errSol } = await supabase
      .from('usuarios_solicitudes')
      .select('*')
      .neq('estado', 'ACTIVO');

    const { data: invitaciones, error: errInv } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('usado', false);

    if (errSol) console.error("Error consultando solicitudes:", errSol.message);
    if (errInv) console.error("Error consultando invitaciones:", errInv.message);

    return res.status(200).json({
      solicitudes: solicitudes || [],
      invitaciones: invitaciones || []
    });
  } catch (err) {
    console.error("Error interno en listarSolicitudesPendientes:", err);
    return res.status(500).json({ error: 'Error al obtener pendientes.' });
  }
}

// 8. LOGIN DE USUARIOS ACTIVOS
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const { data: usuario, error } = await supabase
      .from('usuarios_solicitudes')
      .select('id, nombre_completo, email, rol, estado, password_hash')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error || !usuario) return res.status(404).json({ error: 'Credenciales inválidas.' });
    if (usuario.estado !== 'ACTIVO') return res.status(403).json({ error: 'Cuenta no activa.' });

    const passwordValido = (password === usuario.password_hash) || 
                           (await bcrypt.compare(password, usuario.password_hash).catch(() => false));

    if (!passwordValido) return res.status(401).json({ error: 'Contraseña incorrecta.' });

    const { password_hash, ...datosUsuario } = usuario;
    return res.status(200).json({ message: 'Inicio de sesión exitoso', usuario: datosUsuario });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno al iniciar sesión.' });
  }
}

// 9. CUENTAS ACTIVAS
export async function obtenerCuentasActivas(req, res) {
  try {
    const { data, error } = await supabase
      .from('usuarios_solicitudes')
      .select('id, nombre_completo, email, email_personal, rol, modulo_interes, creado_en')
      .eq('estado', 'ACTIVO');

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data || []);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener cuentas activas.' });
  }
}