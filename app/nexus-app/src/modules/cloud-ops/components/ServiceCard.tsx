import React from 'react';
import type { AWSService } from '../types/cloud';
import { StatusBadge } from './StatusBadge';
import { Server, Database, Shield, Globe, HardDrive, Cpu, DollarSign } from 'lucide-react';

interface ServiceCardProps {
  service: AWSService;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Compute': return <Cpu className="w-5 h-5 text-blue-600" />;
    case 'Storage': return <HardDrive className="w-5 h-5 text-amber-600" />;
    case 'Database': return <Database className="w-5 h-5 text-indigo-600" />;
    case 'Security': return <Shield className="w-5 h-5 text-emerald-600" />;
    case 'Networking': return <Globe className="w-5 h-5 text-purple-600" />;
    default: return <Server className="w-5 h-5 text-slate-600" />;
  }
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-100">
              {getCategoryIcon(service.category)}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base">{service.name}</h4>
              <span className="text-xs text-slate-500 font-medium">{service.category}</span>
            </div>
          </div>
          <StatusBadge status={service.status} />
        </div>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {service.description}
        </p>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-0.5">Función Principal</span>
          <p className="text-xs text-slate-700 font-medium">{service.mainFunction}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Costo Est. Mensual:</span>
        <span className="font-bold text-slate-800 flex items-center">
          <DollarSign className="w-3.5 h-3.5 text-amber-500" />
          {service.estimatedCost.toFixed(2)} USD
        </span>
      </div>
    </div>
  );
};