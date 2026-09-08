import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  UserPlus, 
  CheckCircle2, 
  BarChart3, 
  CheckSquare, 
  Database 
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Estados del Flujo de Acceso
  const [step, setStep] = useState<'EMAIL_CHECK' | 'PASSWORD_INPUT' | 'REQUEST_FORM' | 'REQUEST_SENT'>('EMAIL_CHECK');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [requestData, setRequestData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    interes: ''
  });

  const activeEmails = ['admin@nexus.com', 'empleado@nexus.com', 'sistemas@nexus.com'];

  const handleCheckEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (activeEmails.includes(email.toLowerCase().trim())) {
      setStep('PASSWORD_INPUT');
    } else {
      setRequestData((prev) => ({ ...prev, correo: email }));
      setStep('REQUEST_FORM');
    }
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('REQUEST_SENT');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(email);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-6 md:p-12 font-sans relative overflow-hidden">
      
      {/* Luces de fondo estilo ambiental */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Contenedor Principal (2 Columnas en escritorio) */}
      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* COLUMNA IZQUIERDA: Presentación e Información */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Logo Brand */}
          <div className="inline-flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-widest text-blue-400 uppercase">NEXUS</span>
          </div>

          {/* Slogan Principal */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              Guarda.<br />
              Gestiona.<br />
              Prueba tus proyectos.
            </h1>
          </div>

          {/* Descripción Corta */}
          <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
            Un espacio donde poder guardar tus proyectos y gestionarlos.
          </p>

          {/* Tarjetas de Módulos */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pt-2">
  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mb-3 text-slate-300">
      <BarChart3 className="w-4 h-4" />
    </div>
    <h3 className="text-sm font-bold text-white mb-0.5">Gestión & CRM</h3>
    <p className="text-xs text-slate-400">Control de tareas, pipeline y clientes</p>
  </div>

  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mb-3 text-slate-300">
      <Database className="w-4 h-4" />
    </div>
    <h3 className="text-sm font-bold text-white mb-0.5">Big Data Engine</h3>
    <p className="text-xs text-slate-400">Procesamiento y métricas en tiempo real</p>
  </div>
</div>

{/* Pie de página */}
<div className="pt-4 flex items-center gap-2 text-xs text-slate-500">
  <Database className="w-3.5 h-3.5" />
  <span>NEXUS ERP · Integración de datos masivos y analítica predictiva.</span>
</div>


        </div>

        {/* COLUMNA DERECHA: Formulario Dinámico */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            
            {/* PASO 1: Comprobar Correo */}
            {step === 'EMAIL_CHECK' && (
              <form onSubmit={handleCheckEmail} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Entrar</h2>
                  <p className="text-xs text-slate-400">
                    Usá el correo de trabajo. El sistema te lleva a tu panel.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Correo
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="usuario@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group text-sm"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[11px] text-center text-slate-500 pt-2">
                  Demo: Probá con <code className="text-blue-400">admin@nexus.com</code>
                </p>
              </form>
            )}

            {/* PASO 2A: Contraseña para cuenta activa */}
            {step === 'PASSWORD_INPUT' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Bienvenido</h2>
                  <p className="text-xs text-slate-400">Ingresá tu contraseña corporativa.</p>
                </div>

                <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-3 flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Cuenta detectada</p>
                    <p className="text-xs font-semibold text-white truncate">{email}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all text-sm"
                >
                  Iniciar Sesión
                </button>

                <button
                  type="button"
                  onClick={() => setStep('EMAIL_CHECK')}
                  className="w-full text-xs text-slate-400 hover:text-white transition-colors text-center pt-1"
                >
                  ← Usar otro correo
                </button>
              </form>
            )}

            {/* PASO 2B: Formulario de Solicitud */}
            {step === 'REQUEST_FORM' && (
              <form onSubmit={handleSendRequest} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Solicitar Acceso</h2>
                  <p className="text-xs text-slate-400">
                    El correo <b className="text-slate-200">{email}</b> no está registrado.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nombres</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre"
                      value={requestData.nombres}
                      onChange={(e) => setRequestData({ ...requestData, nombres: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Apellidos</label>
                    <input
                      type="text"
                      required
                      placeholder="Apellido"
                      value={requestData.apellidos}
                      onChange={(e) => setRequestData({ ...requestData, apellidos: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Módulo de Interés</label>
                  <select
                    value={requestData.interes}
                    onChange={(e) => setRequestData({ ...requestData, interes: e.target.value })}
                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Selecciona un módulo</option>
                    <option value="AWS">Módulo AWS Cloud</option>
                    <option value="AZURE">Módulo Microsoft Azure</option>
                    <option value="BIGDATA">Módulo Big Data y Analítica</option>
                    <option value="CRM">Módulo CRM Operativo</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-sm"
                >
                  Enviar Solicitud
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

            {/* PASO 3: Confirmación de envío */}
            {step === 'REQUEST_SENT' && (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">¡Solicitud Enviada!</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tu petición ha sido enviada al administrador del sistema.
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

          </div>
        </div>

      </div>
    </div>
  );
};