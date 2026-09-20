import React from 'react';
import { BarChart3, Database } from 'lucide-react';

export const BrandSidebar: React.FC = () => {
  return (
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
  );
};