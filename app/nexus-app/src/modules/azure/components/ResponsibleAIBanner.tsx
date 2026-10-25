import React from 'react';
import { UserPlus, CheckCircle2, XCircle, Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResponsibleAIBannerProps {
  usuarioRegistrado: boolean;
  usuarioRegistradoNombre: string;
  estadoAcceso: 'idle' | 'permitido' | 'denegado';
  usandoMediaPipe: boolean;
  userRole?: 'ADMIN' | 'EMPLEADO' | 'ANALISTA';
}

export const ResponsibleAIBanner: React.FC<ResponsibleAIBannerProps> = ({
  usuarioRegistrado,
  usuarioRegistradoNombre,
  estadoAcceso,
  usandoMediaPipe,
  userRole
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-100">
              Reconocimiento Facial Biométrico 3D - Azure ML
            </h1>
            {userRole === 'ADMIN' && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                <ShieldAlert className="w-3 h-3" /> Modo Administrador
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Alineación de malla poligonal dinámica sobre contorno facial completo y puntos clave.
          </p>
        </div>

        {/* Botón para retornar al Dashboard principal */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 hover:border-slate-600 transition-all shadow-sm shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Regresar al Dashboard
        </button>
      </div>

      <div>
        {!usuarioRegistrado ? (
          <div className="bg-cyan-950/40 border border-cyan-500/30 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-cyan-200">Fase 1: Enrolamiento y Análisis Biométrico</h3>
                <p className="text-xs text-slate-400">
                  {usandoMediaPipe 
                    ? 'Detección dinámica activa: la malla se adapta automáticamente al contorno de su cara.' 
                    : 'Alinee su rostro frente a la cámara para iniciar el análisis.'}
                </p>
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
    </div>
  );
};