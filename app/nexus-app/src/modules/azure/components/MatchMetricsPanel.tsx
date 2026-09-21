import React from 'react';
import { UserCheck, Eye, CheckCircle2 } from 'lucide-react';

export interface LandmarkInfo {
  nombre: string;
  porcentaje: number;
  completado: boolean;
}

interface MatchMetricsPanelProps {
  usuarioRegistrado: boolean;
  landmarksRegistro: LandmarkInfo[];
  registroListoParaGuardar: boolean;
  analizandoAcceso: boolean;
  estadoAcceso: 'idle' | 'permitido' | 'denegado';
  coincidenciaGlobal: number;
  porcentajesEnVivo: number[];
}

export const MatchMetricsPanel: React.FC<MatchMetricsPanelProps> = ({
  usuarioRegistrado,
  landmarksRegistro,
  registroListoParaGuardar,
  analizandoAcceso,
  estadoAcceso,
  coincidenciaGlobal,
  porcentajesEnVivo
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
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
              <span className={`text-xl font-bold ${(analizandoAcceso || estadoAcceso !== 'idle') && coincidenciaGlobal >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
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
                <p className="text-xs mt-0.5 opacity-90">Malla 3D continua ajustada correctamente sobre sujeto real.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};