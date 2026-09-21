import React from 'react';

export const ResponsibleAIBanner: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <span>🛡️</span> Marco de IA Responsable (Microsoft Azure)
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="font-semibold text-cyan-400 block mb-1">Equidad y Sesgos</span>
          <p className="text-slate-400 text-[11px]">Evaluación contínua de falsos positivos en rasgos diversos.</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="font-semibold text-cyan-400 block mb-1">Transparencia</span>
          <p className="text-slate-400 text-[11px]">Explicación directa de umbrales y limitaciones operativas.</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="font-semibold text-cyan-400 block mb-1">Privacidad</span>
          <p className="text-slate-400 text-[11px]">Procesamiento efímero de vectores sin almacenamiento persistente no autorizado.</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="font-semibold text-cyan-400 block mb-1">Responsabilidad</span>
          <p className="text-slate-400 text-[11px]">Supervisión humana requerida para decisiones de acceso crítico.</p>
        </div>
      </div>
    </div>
  );
};