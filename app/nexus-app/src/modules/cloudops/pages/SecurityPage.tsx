import React from 'react';
import { SECURITY_METRICS, SHARED_RESPONSIBILITY_DATA } from '../data/awsServicesData';
import { SecurityCard } from '../components/SecurityCard';
import { ShieldCheck, Lock, Users } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Seguridad, IAM y Cumplimiento</h2>
        <p className="text-sm text-slate-500">Modelo de responsabilidad compartida, control de acceso e indicadores de auditoría.</p>
      </div>

      {/* Modelo de Responsabilidad Compartida */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-base">Modelo de Responsabilidad Compartida AWS</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Categoría</th>
                <th className="p-3 text-blue-700 bg-blue-50/50">Responsabilidad de AWS (Seguridad DE la nube)</th>
                <th className="p-3 text-emerald-700 bg-emerald-50/50">Responsabilidad del Cliente (Seguridad EN la nube)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SHARED_RESPONSIBILITY_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{row.category}</td>
                  <td className="p-3 text-slate-600 bg-blue-50/20">{row.awsResponsibility}</td>
                  <td className="p-3 text-slate-600 bg-emerald-50/20">{row.customerResponsibility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel de Indicadores de Seguridad */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          Métricas de Seguridad e IAM
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECURITY_METRICS.map((metric) => (
            <SecurityCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </div>
  );
};