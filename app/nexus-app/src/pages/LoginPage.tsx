import React, { useState } from 'react';
import { API_URL } from '../config/api';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Database,
  Clock,
  Loader2,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (email: string, usuarioData?: any) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://proyecto-de-big-data-y-an-lisis-de-datos.onrender.com/api';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<
    'EMAIL_CHECK' | 'PASSWORD_INPUT' | 'REQUEST_FORM' | 'INVITATION_FORM' | 'REQUEST_ACTIVATION' | 'ACTIVATE_ACCOUNT' | 'REQUEST_SENT' | 'PENDING_REVIEW'
  >('EMAIL_CHECK');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [requestData, setRequestData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    interes: ''
  });

  // 1. EVALUAR EMAIL (FASE 1 DE AMBOS FLUJOS)
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/validar-email-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (data.accion === 'INGRESAR_PASSWORD') {
        setStep('PASSWORD_INPUT');
      } else if (data.accion === 'ACTIVAR_CUENTA') {
        // FASE 3 SOLICITUD: El sistema detecta sus datos pre-aprobados y habilita botón de activación
        setUserData(data.usuario);
        setStep('REQUEST_ACTIVATION');
      } else if (data.accion === 'COMPLETAR_REGISTRO_INVITACION') {
        // FASE 2 INVITACIÓN: Llena los campos necesarios
        setRequestData((prev) => ({ ...prev, correo: email }));
        setStep('INVITATION_FORM');
      } else if (data.accion === 'EN_REVISION') {
        setStatusMessage(data.message || 'Tu solicitud ya se encuentra en revisión por el área de gestión.');
        setStep('PENDING_REVIEW');
      } else if (data.accion === 'SOLICITAR_ACCESO') {
        // FASE 1 SOLICITUD: Correo no válido -> Opción para solicitar acceso
        setRequestData((prev) => ({ ...prev, correo: email }));
        setStep('REQUEST_FORM');
      } else if (data.accion === 'RECHAZADO') {
        setStatusMessage(data.error || 'El acceso ha sido rechazado.');
        setStep('PENDING_REVIEW');
      }
    } catch (error) {
      console.error("Error al validar correo:", error);
      alert("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // 2. SOLICITAR ACTIVACIÓN DE CUENTA (FASE 3 - FLIJO SOLICITUD DE ACCESO)
  const handleRequestActivation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/solicitar-activacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      if (response.ok) {
        setStatusMessage('Has solicitado la activación de tu cuenta. Pasó a revisión final del administrador (Fase 4).');
        setStep('PENDING_REVIEW');
      } else {
        const data = await response.json();
        alert(data.error || 'No se pudo procesar la solicitud.');
      }
    } catch (error) {
      console.error("Error al solicitar activación:", error);
      alert("Error de conexión al solicitar activación.");
    } finally {
      setLoading(false);
    }
  };

  // 3. LOGIN CON CONTRASEÑA
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('nexus_session', JSON.stringify({
          email: email.trim(),
          usuario: data.usuario,
          authenticatedAt: new Date().toISOString()
        }));

        onLoginSuccess(email, data.usuario);
      } else {
        alert(data.error || 'Contraseña incorrecta');
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error de conexión al autenticar.");
    } finally {
      setLoading(false);
    }
  };

  // 4. SOLICITAR ACCESO GENERAL (FASE 2 - SOLICITUD)
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const payload = {
      nombre_completo: `${requestData.nombres} ${requestData.apellidos}`.trim(),
      email: email.trim(),
      modulo_interes: requestData.interes,
      origen: 'SOLICITUD'
    };

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/registrar-solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStep('REQUEST_SENT');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'intenta de nuevo'}`);
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      alert("Error de conexión al guardar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // 5. COMPLETAR DATOS DE INVITACIÓN (FASE 2 - INVITACIÓN)
  const handleCompleteInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const payload = {
      nombre_completo: `${requestData.nombres} ${requestData.apellidos}`.trim(),
      email: email.trim(),
      modulo_interes: requestData.interes,
      origen: 'INVITACION'
    };

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/registrar-solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatusMessage('Tus datos fueron registrados. El área de gestión analizará y aprobará/negará tu acceso.');
        setStep('PENDING_REVIEW');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Intenta de nuevo'}`);
      }
    } catch (error) {
      console.error("Error al completar invitación:", error);
      alert("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-6 md:p-12 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* IZQUIERDA */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-widest text-blue-400 uppercase">NEXUS</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              Guarda.<br />
              Gestiona.<br />
              Prueba tus proyectos.
            </h1>
          </div>

          <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
            Un espacio para gestionar e integrar tus proyectos en la nube.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pt-2">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mb-3 text-slate-300">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white mb-0.5">Gestión & CRM</h3>
              <p className="text-xs text-slate-400">Control de tareas, pipeline y accesos</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mb-3 text-slate-300">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white mb-0.5">Big Data Engine</h3>
              <p className="text-xs text-slate-400">Procesamiento y métricas en tiempo real</p>
            </div>
          </div>
        </div>

        {/* DERECHO */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            
            {/* FASE 1: CHECK DE EMAIL */}
            {step === 'EMAIL_CHECK' && (
              <form onSubmit={handleCheckEmail} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Entrar</h2>
                  <p className="text-xs text-slate-400">
                    Ingresa tu correo empresarial para validar tu acceso o solicitar uno nuevo.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      disabled={loading}
                      placeholder="usuario@dominio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <span>Continuar</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FASE 3 SOLICITUD: BOTÓN SOLICITAR ACTIVACIÓN */}
            {step === 'REQUEST_ACTIVATION' && (
              <div className="space-y-5">
                <div className="bg-blue-950/40 border border-blue-800/50 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <UserCheck className="w-4 h-4" />
                    <span>Datos Detectados (Fase 3)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    El sistema detectó que ya ingresaste tus datos previamente con el correo <b>{email}</b>. Presiona el botón para solicitar la activación final.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRequestActivation}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Solicitar Activación de Cuenta</span>}
                </button>
              </div>
            )}

            {/* PASSWORD INPUT */}
            {step === 'PASSWORD_INPUT' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Bienvenido</h2>
                  <p className="text-xs text-slate-400">Ingresa tu contraseña para acceder.</p>
                </div>

                <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-3 flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Cuenta activa</p>
                    <p className="text-xs font-semibold text-white truncate">{email}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      disabled={loading}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Iniciar Sesión</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('EMAIL_CHECK')}
                  className="w-full text-xs text-slate-400 hover:text-white transition-colors text-center"
                >
                  ← Cambiar correo
                </button>
              </form>
            )}

            {/* FASE 2: FORMULARIO DE SOLICITUD O INVITACIÓN */}
            {(step === 'REQUEST_FORM' || step === 'INVITATION_FORM') && (
              <form onSubmit={step === 'REQUEST_FORM' ? handleSendRequest : handleCompleteInvitation} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    {step === 'REQUEST_FORM' ? 'Solicitar Acceso (Fase 2)' : 'Completar Registro (Fase 2)'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ingresa todos los datos requeridos para procesar tu cuenta ({email}).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nombres</label>
                    <input
                      type="text"
                      required
                      disabled={loading}
                      placeholder="Nombre"
                      value={requestData.nombres}
                      onChange={(e) => setRequestData({ ...requestData, nombres: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Apellidos</label>
                    <input
                      type="text"
                      required
                      disabled={loading}
                      placeholder="Apellido"
                      value={requestData.apellidos}
                      onChange={(e) => setRequestData({ ...requestData, apellidos: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Módulo / Área</label>
                  <select
                    disabled={loading}
                    value={requestData.interes}
                    onChange={(e) => setRequestData({ ...requestData, interes: e.target.value })}
                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="AWS">Módulo AWS Cloud</option>
                    <option value="AZURE">Módulo Microsoft Azure</option>
                    <option value="BIGDATA">Módulo Big Data y Analítica</option>
                    <option value="CRM">Módulo CRM Operativo</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Enviar Solicitud</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('EMAIL_CHECK')}
                  className="w-full text-xs text-slate-400 hover:text-white transition-colors text-center"
                >
                  Cancelar
                </button>
              </form>
            )}

            {/* PANTALLAS DE ESTADO */}
            {step === 'REQUEST_SENT' && (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">¡Solicitud Enviada!</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tus datos pasaron a revisión del área de gestión. Te enviarán un correo con tu correo empresarial asignado.
                </p>
                <button
                  type="button"
                  onClick={() => setStep('EMAIL_CHECK')}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-colors"
                >
                  Volver al Inicio
                </button>
              </div>
            )}

            {step === 'PENDING_REVIEW' && (
              <div className="text-center py-6 space-y-4">
                <Clock className="w-12 h-12 text-amber-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Estado de Cuenta</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{statusMessage}</p>
                <button
                  type="button"
                  onClick={() => setStep('EMAIL_CHECK')}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-colors"
                >
                  Volver al Inicio
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};