import React from 'react';
import { INITIAL_SERVICES, SECURITY_METRICS } from '../data/awsServicesData';
import { useCloudOps } from '../context/CloudOpsContext';
import { StatCard } from '../components/StatCard';
import { SecurityCard } from '../components/SecurityCard';
import { ServiceCard } from '../components/ServiceCard';
import { Server, DollarSign, ShieldCheck, Globe, TrendingUp } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { costs } = useCloudOps();
  const totalMonthlyCost = costs.reduce((acc, item) => acc + item.monthlyCost, 0);
  const activeServicesCount = INITIAL_SERVICES.filter(s => s.status === 'En uso').length;
  const warningsCount = SECURITY_METRICS.filter(m => m.status === 'warning').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard de Control Cloud</h2>
        <p className="text-sm text-slate-500">Resumen general de la arquitectura y estado de la solución AWS.</p>
      </div>

      {/* Indicadores Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Servicios Activos"
          value={`${activeServicesCount} / ${INITIAL_SERVICES.length}`}
          subtitle="Desplegados en producción"
          icon={Server}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <StatCard
          title="Región Principal"
          value="us-east-1"
          subtitle="N. Virginia (EE.UU.)"
          icon={Globe}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
        />
        <StatCard
          title="Costo Est. Mensual"
          value={`$${totalMonthlyCost.toFixed(2)}`}
          subtitle={`Anual: $${(totalMonthlyCost * 12).toFixed(2)}`}
          icon={DollarSign}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <StatCard
          title="Estado Seguridad"
          value={warningsCount > 0 ? `${warningsCount} Revision(es)` : 'Óptimo'}
          subtitle="Cumplimiento Well-Architected"
          icon={ShieldCheck}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
      </div>

      {/* Distribución de Costos e Indicadores Visuales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Distribución de Costos por Servicio
            </h3>
            <span className="text-xs text-slate-400 font-mono">USD / Mes</span>
          </div>

          <div className="space-y-3 pt-2">
            {costs.map((item) => {
              const percentage = totalMonthlyCost > 0 ? Math.round((item.monthlyCost / totalMonthlyCost) * 100) : 0;
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{item.serviceName}</span>
                    <span className="text-slate-800 font-bold">${item.monthlyCost.toFixed(2)} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen Seguridad */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800 text-base">Alertas y Seguridad</h3>
          {SECURITY_METRICS.slice(0, 2).map((metric) => (
            <SecurityCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Vista rápida de Servicios */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-base">Servicios Destacados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_SERVICES.slice(0, 3).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
};