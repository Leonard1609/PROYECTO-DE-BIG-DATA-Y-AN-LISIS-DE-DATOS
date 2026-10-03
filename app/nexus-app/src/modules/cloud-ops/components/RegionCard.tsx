import React from 'react';
import type { AWSRegionData } from '../types/cloud';
import { StatusBadge } from './StatusBadge';
import { Globe, Activity, Layers } from 'lucide-react';

interface RegionCardProps {
  region: AWSRegionData;
}

export const RegionCard: React.FC<RegionCardProps> = ({ region }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">{region.location}</h4>
            <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-blue-700 font-mono">
              {region.region}
            </code>
          </div>
        </div>
        <StatusBadge status={region.status} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>Servicios Desplegados:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {region.deployedServices.map((srv, idx) => (
            <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200">
              {srv}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-emerald-500" /> Latencia promedio:
        </span>
        <span className="font-bold text-slate-700">{region.latencyMs} ms</span>
      </div>
    </div>
  );
};