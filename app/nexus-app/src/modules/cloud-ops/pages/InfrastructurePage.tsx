import React from 'react';
import { INITIAL_REGIONS } from '../data/awsServicesData';
import { RegionCard } from '../components/RegionCard';
import { Globe2, Server, ShieldCheck } from 'lucide-react';

export const InfrastructurePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Infraestructura Global AWS</h2>
        <p className="text-sm text-slate-500">Visualización de Regiones, Zonas de Disponibilidad y Ubicaciones Edge.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">33+ Regiones</h4>
            <p className="text-xs text-slate-500">Ubicaciones geográficas globales</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">105+ Zonas AZ</h4>
            <p className="text-xs text-slate-500">Data centers aislados con energía redundante</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">600+ Puntos Edge</h4>
            <p className="text-xs text-slate-500">Caché de baja latencia con CloudFront</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-base">Regiones Seleccionadas en la Solución</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INITIAL_REGIONS.map((region) => (
            <RegionCard key={region.id} region={region} />
          ))}
        </div>
      </div>
    </div>
  );
};