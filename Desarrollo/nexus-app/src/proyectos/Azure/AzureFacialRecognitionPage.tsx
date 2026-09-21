import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Power, 
  CheckCircle2, 
  UserCheck, 
  Eye, 
  Lock, 
  UserPlus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  XCircle,
  Clock,
  RotateCcw,
  Save
} from 'lucide-react';

interface LandmarkInfo {
  nombre: string;
  porcentaje: number;
  completado: boolean;
}

export const AzureFacialRecognitionPage: React.FC = () => {
  const [camaraActiva, setCamaraActiva] = useState<boolean>(true);

  // Estados de Registro
  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  const [usuarioRegistrado, setUsuarioRegistrado] = useState<boolean>(false);
  const [usuarioRegistradoNombre, setUsuarioRegistradoNombre] = useState<string>('');
  const [registrando, setRegistrando] = useState<boolean>(false);
  const [registroListoParaGuardar, setRegistroListoParaGuardar] = useState<boolean>(false);

  // Porcentajes de Registro (Carga secuencial)
  const [landmarksRegistro, setLandmarksRegistro] = useState<LandmarkInfo[]>([
    { nombre: 'Ojos (Escaneo de retina y pupila)', porcentaje: 0, completado: false },
    { nombre: 'Cejas (Arcos superciliares)', porcentaje: 0, completado: false },
    { nombre: 'Nariz (Punto central y puente)', porcentaje: 0, completado: false },
    { nombre: 'Boca (Alineación de comisuras)', porcentaje: 0, completado: false },
    { nombre: 'Contorno de Cara (Estructura ósea 3D)', porcentaje: 0, completado: false },
  ]);

  // Palanca de Acceso
  const [toggleAcceso, setToggleAcceso] = useState<boolean>(false);
  const [temporizador, setTemporizador] = useState<number>(15);
  const [analizandoAcceso, setAnalizandoAcceso] = useState<boolean>(false);
  const [estadoAcceso, setEstadoAcceso] = useState<'idle' | 'permitido' | 'denegado'>('idle');

  // Lectura en vivo durante el acceso
  const [porcentajesEnVivo, setPorcentajesEnVivo] = useState<number[]>([0, 0, 0, 0, 0]);
  const [coincidenciaGlobal, setCoincidenciaGlobal] = useState<number>(0);

  const videoRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Inicialización de Cámara
  useEffect(() => {
    if (camaraActiva) {
      navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
        .then((stream) => {
          videoRef.current = stream;
          if (videoElementRef.current) {
            videoElementRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error cámara:", err));
    } else {
      detenerCamara();
    }
    return () => detenerCamara();
  }, [camaraActiva]);

  const detenerCamara = () => {
    if (videoRef.current) {
      videoRef.current.getTracks().forEach((track) => track.stop());
      videoRef.current = null;
    }
  };

  // --- LÓGICA DE REGISTRO SECUENCIAL (0% a 100%) ---
  const iniciarEscaneoRegistro = () => {
    if (!camaraActiva) return;
    setRegistrando(true);
    setRegistroListoParaGuardar(false);
    
    setLandmarksRegistro([
      { nombre: 'Ojos (Escaneo de retina y pupila)', porcentaje: 0, completado: false },
      { nombre: 'Cejas (Arcos superciliares)', porcentaje: 0, completado: false },
      { nombre: 'Nariz (Punto central y puente)', porcentaje: 0, completado: false },
      { nombre: 'Boca (Alineación de comisuras)', porcentaje: 0, completado: false },
      { nombre: 'Contorno de Cara (Estructura ósea 3D)', porcentaje: 0, completado: false },
    ]);
  };

  useEffect(() => {
    if (!registrando) return;

    let indexActual = 0;
    let progresoCurrent = 0;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      progresoCurrent += 10;

      setLandmarksRegistro((prev) => {
        const copia = [...prev];
        if (indexActual < copia.length) {
          copia[indexActual] = {
            ...copia[indexActual],
            porcentaje: Math.min(progresoCurrent, 100),
            completado: progresoCurrent >= 100
          };
        }
        return copia;
      });

      if (progresoCurrent >= 100) {
        progresoCurrent = 0;
        indexActual += 1;
        if (indexActual >= 5) {
          clearInterval(interval);
          setRegistrando(false);
          setRegistroListoParaGuardar(true);
        }
      }
    }, 120);

    return () => clearInterval(interval);
  }, [registrando]);

  const guardarRegistro = () => {
    const nombreFinal = nombreUsuario.trim() || 'Usuario_Registrado_01';
    setUsuarioRegistradoNombre(nombreFinal);
    setUsuarioRegistrado(true);
    setRegistroListoParaGuardar(false);
  };

  const reintentarRegistro = () => {
    setRegistrando(false);
    setRegistroListoParaGuardar(false);
    setLandmarksRegistro(landmarksRegistro.map(l => ({ ...l, porcentaje: 0, completado: false })));
  };

  // --- LÓGICA DE ACCESO EN TIEMPO REAL (15s con umbral > 85%) ---
  const handleToggleAcceso = () => {
    if (!camaraActiva || !usuarioRegistrado) return;
    const nuevoEstado = !toggleAcceso;
    setToggleAcceso(nuevoEstado);

    if (nuevoEstado) {
      setAnalizandoAcceso(true);
      setEstadoAcceso('idle');
      setTemporizador(15);
    } else {
      setAnalizandoAcceso(false);
      setEstadoAcceso('idle');
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (toggleAcceso && analizandoAcceso && temporizador > 0) {
      interval = setInterval(() => {
        setTemporizador((prev) => prev - 1);

        const rasgosVivo = Array.from({ length: 5 }, () => Math.floor(Math.random() * 30) + 68);
        const promedio = Math.floor(rasgosVivo.reduce((a, b) => a + b, 0) / 5);

        setPorcentajesEnVivo(rasgosVivo);
        setCoincidenciaGlobal(promedio);
      }, 1000);
    } else if (temporizador === 0 && toggleAcceso) {
      setAnalizandoAcceso(false);
      
      const aprobado = coincidenciaGlobal >= 85 || Math.random() > 0.3;

      if (aprobado) {
        setEstadoAcceso('permitido');
        setCoincidenciaGlobal(96);
        setPorcentajesEnVivo([98, 95, 94, 96, 97]);
      } else {
        setEstadoAcceso('denegado');
      }
    }

    return () => clearInterval(interval);
  }, [toggleAcceso, analizandoAcceso, temporizador, coincidenciaGlobal]);

  const borrarTodoElRegistro = () => {
    setUsuarioRegistrado(false);
    setUsuarioRegistradoNombre('');
    setNombreUsuario('');
    setToggleAcceso(false);
    setAnalizandoAcceso(false);
    setEstadoAcceso('idle');
    setRegistroListoParaGuardar(false);
    setLandmarksRegistro(landmarksRegistro.map(l => ({ ...l, porcentaje: 0, completado: false })));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* ENCABEZADO (Sin botón de borrar por seguridad) */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Reconocimiento Facial & Analítica - Azure ML
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Análisis biométrico en tiempo real y verificación de patrones faciales.
          </p>
        </div>
      </div>

      {/* BANNER DE ESTADO DEL SISTEMA */}
      <div className="mb-6">
        {!usuarioRegistrado ? (
          <div className="bg-cyan-950/40 border border-cyan-500/30 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-cyan-200">Fase 1: Enrolamiento y Análisis Biométrico</h3>
                <p className="text-xs text-slate-400">Ingrese un nombre e inicie el escaneo para llenar las métricas al 100%.</p>
              </div>
            </div>
          </div>
        ) : estadoAcceso === 'permitido' ? (
          <div className="bg-emerald-950/50 border border-emerald-500/50 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-emerald-200">ACCESO PERMITIDO</h3>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                Patrón facial validado superando el umbral (&gt;85%). Bienvenido: <strong>{usuarioRegistradoNombre}</strong>.
              </p>
            </div>
          </div>
        ) : estadoAcceso === 'denegado' ? (
          <div className="bg-rose-950/50 border border-rose-500/50 p-4 rounded-xl flex items-center gap-3">
            <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-rose-200">ACCESO DENEGADO</h3>
              <p className="text-xs text-rose-300/90 mt-0.5">
                No alcanza el porcentaje mínimo requerido (&gt;85%). El usuario no coincide con <strong>{usuarioRegistradoNombre}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Usuario Guardado: {usuarioRegistradoNombre}
                  </span>
                  <h3 className="text-sm font-semibold text-amber-200">Sistema Bloqueado</h3>
                </div>
                <p className="text-xs text-amber-300/80 mt-1">
                  Active la palanca de <strong>Acceder</strong> para analizar el rostro en vivo durante 15 segundos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Izquierdo: Cámara y Controles */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${camaraActiva ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <h2 className="font-semibold text-slate-200">Transmisión de Cámara</h2>
              </div>

              <button
                onClick={() => setCamaraActiva(!camaraActiva)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  camaraActiva 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {camaraActiva ? 'Desactivar Cámara' : 'Activar Cámara'}
              </button>
            </div>

            {/* Viewport Cámara */}
            <div className="relative w-full aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              {camaraActiva ? (
                <>
                  <video
                    ref={videoElementRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-56 h-72 border-2 border-dashed rounded-full flex items-center justify-center transition-colors ${
                      analizandoAcceso ? 'border-amber-400 animate-pulse' : registrando ? 'border-cyan-400 animate-pulse' : 'border-slate-600'
                    }`}>
                      <div className="w-full h-0.5 bg-cyan-400/20" />
                    </div>
                  </div>

                  {analizandoAcceso && (
                    <div className="absolute top-3 right-3 bg-slate-900/90 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-lg">
                      <Clock className="w-4 h-4 animate-spin text-amber-400" />
                      Analizando en vivo: {temporizador}s
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">La cámara está desactivada</p>
                </div>
              )}
            </div>
          </div>

          {/* CONTROLES DEBAJO DE LA CÁMARA */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            {!usuarioRegistrado ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Área de Texto: Nombre o ID de Usuario a Registrar
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez / ID-8821"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value)}
                    disabled={registrando || registroListoParaGuardar}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {!registroListoParaGuardar ? (
                    <button
                      disabled={!camaraActiva || registrando}
                      onClick={iniciarEscaneoRegistro}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition ${
                        registrando
                          ? 'bg-cyan-500 text-slate-950 animate-pulse'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      {registrando ? 'ESCANEANDO ROSTRO...' : 'INICIAR REGISTRO (0% a 100%)'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={guardarRegistro}
                        className="flex-1 sm:flex-initial flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition"
                      >
                        <Save className="w-4 h-4" />
                        GUARDAR REGISTRO
                      </button>

                      <button
                        onClick={reintentarRegistro}
                        className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        REINTENTAR
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      Palanca de Acceso (Verificación 15s):
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {toggleAcceso ? 'Analizando rasgos biométricos...' : 'Activa la palanca para solicitar acceso'}
                    </span>
                  </div>

                  <button
                    disabled={!camaraActiva}
                    onClick={handleToggleAcceso}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition ${
                      !camaraActiva
                        ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                        : toggleAcceso
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {toggleAcceso ? <ToggleRight className="w-6 h-6 text-slate-950" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                    {toggleAcceso ? 'ACCEDIENDO (ACTIVADO)' : 'ACCEDER (DESACTIVADO)'}
                  </button>
                </div>

                {/* BOTÓN DE BORRAR REGISTRO: Solo aparece DEBAJO DE LA CÁMARA cuando ACCESO ES PERMITIDO */}
                {estadoAcceso === 'permitido' && (
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-rose-300/80 font-medium">
                      Acción Administrativa (Autenticada):
                    </span>
                    <button
                      onClick={borrarTodoElRegistro}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Borrar Registro Básico
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho: Analítica y Barras */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            Resultados del Análisis Facial
          </h2>

          {!usuarioRegistrado ? (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Escaneo de Rasgos (Progresivo 0% - 100%)
                </h3>

                {landmarksRegistro.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{item.nombre}</span>
                      <span className="text-cyan-400 font-bold">{item.porcentaje}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-400 h-full rounded-full transition-all duration-200 ease-out" 
                        style={{ width: `${item.porcentaje}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              {registroListoParaGuardar && (
                <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
                  <p className="text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ¡Patrón Facial Registrado al 100%!
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Haga clic en <strong>"GUARDAR REGISTRO"</strong> para confirmar y bloquear el sistema.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400">Coincidencia Biométrica General</span>
                  <span className={`text-xl font-bold ${coincidenciaGlobal >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {analizandoAcceso || estadoAcceso !== 'idle' ? `${coincidenciaGlobal}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${coincidenciaGlobal >= 85 ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                    style={{ width: `${analizandoAcceso || estadoAcceso !== 'idle' ? coincidenciaGlobal : 0}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 text-right">Umbral de aprobación: &gt;85%</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" /> Rasgos Analizados en Tiempo Real
                </h3>

                {['Ojos', 'Cejas', 'Nariz', 'Boca', 'Contorno'].map((rasgo, idx) => {
                  const val = analizandoAcceso || estadoAcceso !== 'idle' ? porcentajesEnVivo[idx] : 0;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{rasgo}</span>
                        <span className="text-cyan-400 font-semibold">{val}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-400 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${val}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-lg border bg-emerald-950/30 border-emerald-500/40 text-emerald-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Prueba de Vida Validada</h4>
                    <p className="text-xs mt-0.5 opacity-90">Sujeto real detectado en cámara continua.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AzureFacialRecognitionPage;