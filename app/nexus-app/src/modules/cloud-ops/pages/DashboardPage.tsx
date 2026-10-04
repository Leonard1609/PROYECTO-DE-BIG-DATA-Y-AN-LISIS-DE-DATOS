import React from 'react';
import { INITIAL_SERVICES, SECURITY_METRICS } from '../data/awsServicesData';
import { useCloudOps } from '../context/CloudOpsContext';
import { StatCard } from '../components/StatCard';
import { SecurityCard } from '../components/SecurityCard';
import { ServiceCard } from '../components/ServiceCard';
import { Server, DollarSign, ShieldCheck, Globe, TrendingUp, RotateCcw, FileText } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { costs, proposals, clearDashboard } = useCloudOps();
  const latestProposal = proposals[0];

  const totalMonthlyCost = costs.reduce((acc, item) => acc + item.monthlyCost, 0);
  const activeServicesCount = latestProposal ? latestProposal.selectedServices.length : 0;
  const warningsCount = SECURITY_METRICS.filter((m) => m.status === 'warning').length;

  const handleExportPDF = () => {
    window.print(); // Solución rápida e integrada para exportar/imprimir el Dashboard en PDF
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard de Control Cloud</h2>
          <p className="text-sm text-slate-500">Resumen general de la arquitectura y estado de la solución AWS.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearDashboard}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar Datos
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Reporte PDF
          </button>
        </div>
      </div>

      {/* Indicadores Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Servicios Activos"
          value={`${activeServicesCount} / ${INITIAL_SERVICES.length}`}
          subtitle={latestProposal ? latestProposal.solutionName : 'Sin propuesta registrada'}
          icon={Server}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <StatCard
          title="Región Principal"
          value={latestProposal ? latestProposal.selectedRegion.split(' ')[0] : 'Sin asignar'}
          subtitle={latestProposal ? latestProposal.selectedRegion : 'Por favor configure en Planificación'}
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

      {/* Distribución de Costos */}
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
            {costs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No hay datos registrados. Registre una propuesta en Planificación Cloud.</p>
            ) : (
              costs.map((item) => {
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
              })
            )}
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
    </div>
  );
};