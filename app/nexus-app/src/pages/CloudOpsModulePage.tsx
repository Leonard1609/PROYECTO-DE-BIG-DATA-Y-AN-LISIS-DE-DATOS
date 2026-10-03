import React, { useState } from 'react';
import { DashboardPage } from '../modules/cloudops/pages/DashboardPage';
import { PlanningPage } from '../modules/cloudops/pages/PlanningPage';
import { CostsPage } from '../modules/cloudops/pages/CostsPage';
import { InfrastructurePage } from '../modules/cloudops/pages/InfrastructurePage';
import { SecurityPage } from '../modules/cloudops/pages/SecurityPage';
import { NetworkPage } from '../modules/cloudops/pages/NetworkPage';
import { ServicesPage } from '../modules/cloudops/pages/ServicesPage';

import {
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Globe,
  ShieldCheck,
  Network,
  Server,
  Cloud,
} from 'lucide-react';

type TabType = 'dashboard' | 'planning' | 'costs' | 'infrastructure' | 'security' | 'network' | 'services';

export const CloudOpsModulePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planning', label: 'Planificación', icon: ClipboardList },
    { id: 'costs', label: 'Costos', icon: DollarSign },
    { id: 'infrastructure', label: 'Infraestructura', icon: Globe },
    { id: 'security', label: 'Seguridad', icon: ShieldCheck },
    { id: 'network', label: 'Arquitectura Red', icon: Network },
    { id: 'services', label: 'Servicios AWS', icon: Server },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      {/* Header Superior del Módulo */}
      <header className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white">CloudOps Dashboard</h1>
            <p className="text-xs text-slate-400">Sistema Web para Planificación y Análisis Cloud (AWS)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AWS Cloud Foundations</span>
        </div>
      </header>

      {/* Sub-Barra de Navegación del Módulo */}
      <nav className="bg-white border-b border-[#E2E8F0] px-6 flex items-center gap-2 overflow-x-auto shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#2563EB] text-[#2563EB] bg-blue-50/50'
                  : 'border-transparent text-[#64748B] hover:text-[#1E293B] hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Área Principal de Contenido */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'planning' && <PlanningPage />}
        {activeTab === 'costs' && <CostsPage />}
        {activeTab === 'infrastructure' && <InfrastructurePage />}
        {activeTab === 'security' && <SecurityPage />}
        {activeTab === 'network' && <NetworkPage />}
        {activeTab === 'services' && <ServicesPage />}
      </main>
    </div>
  );
};

export default CloudOpsModulePage;