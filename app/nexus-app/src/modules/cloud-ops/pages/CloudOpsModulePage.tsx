import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Server,
  ShieldCheck,
  Network,
  Cloud
} from 'lucide-react';

import { DashboardPage } from './DashboardPage';
import { PlanningPage } from './PlanningPage';
import { CostsPage } from './CostsPage';
import { InfrastructurePage } from './InfrastructurePage';
import { SecurityPage } from './SecurityPage';
import { NetworkPage } from './NetworkPage';
import { ServicesPage } from './ServicesPage';
import { CloudOpsProvider } from '../context/CloudOpsContext';

const CloudOpsModuleContent: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('servicios');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planificacion', label: 'Planificación', icon: ClipboardList },
    { id: 'costos', label: 'Costos', icon: DollarSign },
    { id: 'infraestructura', label: 'Infraestructura', icon: Server },
    { id: 'seguridad', label: 'Seguridad', icon: ShieldCheck },
    { id: 'arquitectura', label: 'Arquitectura Red', icon: Network },
    { id: 'servicios', label: 'Servicios AWS', icon: Cloud },
  ];

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'planificacion':
        return <PlanningPage />;
      case 'costos':
        return <CostsPage />;
      case 'infraestructura':
        return <InfrastructurePage />;
      case 'seguridad':
        return <SecurityPage />;
      case 'arquitectura':
        return <NetworkPage />;
      case 'servicios':
        return <ServicesPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Header en Pantallas Móviles */}
      <div className="md:hidden bg-[#0f172a] text-white p-4 flex items-center justify-between border-b border-slate-800 z-30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight">CloudOps Dashboard</h2>
            <p className="text-[10px] text-slate-400">AWS Cloud Solutions</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Menú de navegación"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f172a] border-b border-slate-800 p-3 space-y-1 z-30">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Regresar al Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Escritorio */}
      <aside
        className={`hidden md:flex flex-col bg-[#0f172a] text-slate-300 border-r border-slate-800 transition-all duration-300 relative z-20 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between min-h-[65px]">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg shrink-0">
                <Cloud className="w-6 h-6" />
              </div>
              <div className="truncate">
                <h2 className="font-bold text-white text-sm leading-tight truncate">CloudOps Dashboard</h2>
                <p className="text-[11px] text-slate-400 truncate">AWS Cloud Solutions</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Cloud className="w-6 h-6" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors absolute -right-3 top-5 shadow-md border border-slate-700"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Regresar al Dashboard</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">CloudOps Dashboard</h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● AWS Cloud Foundations
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Sistema Web para Planificación y Análisis Cloud (AWS)</p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </button>
        </header>

        <main className="p-4 sm:p-8 space-y-6 flex-1">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export const CloudOpsModulePage: React.FC = () => {
  return (
    <CloudOpsProvider>
      <CloudOpsModuleContent />
    </CloudOpsProvider>
  );
};

export default CloudOpsModulePage;