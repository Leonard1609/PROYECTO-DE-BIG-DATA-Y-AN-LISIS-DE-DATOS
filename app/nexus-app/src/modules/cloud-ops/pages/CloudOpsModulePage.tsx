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
  Cloud,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  HardDrive,
  Database,
  Lock,
  Layers,
  Activity,
  TrendingUp,
  Check,
  ExternalLink,
  FileText,
  Zap
} from 'lucide-react';

export const CloudOpsModulePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* 1. BARRA DE NAVEGACIÓN LATERAL (DESKTOP) */}
      <aside
        className={`hidden md:flex flex-col bg-[#0f172a] text-slate-300 border-r border-slate-800 transition-all duration-300 relative z-20 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Cabecera Sidebar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between min-h-[65px]">
          {!isCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg shrink-0">
                <Cloud className="w-6 h-6" />
              </div>
              <div className="truncate">
                <h2 className="font-bold text-white text-sm leading-tight truncate">CloudOps Dashboard</h2>
                <p className="text-[11px] text-slate-400 truncate">AWS Cloud Solutions</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Cloud className="w-6 h-6" />
            </div>
          )}

          {/* Botón Flecha Colapsar / Expandir */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors absolute -right-3 top-5 shadow-md border border-slate-700"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Opciones del Menú */}
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
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Volver a la plataforma principal"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Regresar al Dashboard</span>}
          </button>
        </div>
      </aside>

      {/* NAVEGACIÓN MÓVIL (MENÚ DESPLEGABLE) */}
      <div className="md:hidden bg-[#0f172a] text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
            <Cloud className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm">CloudOps Dashboard</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f172a] text-slate-300 p-4 border-b border-slate-800 space-y-2 sticky top-[57px] z-20 shadow-xl">
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Regresar al Dashboard Principal</span>
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Cabecera Superior */}
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

        {/* Área de Trabajo */}
        <main className="p-4 sm:p-8 space-y-6 flex-1">
          
          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Dashboard de Control Cloud</h2>
                <p className="text-xs text-slate-500">Resumen general de la arquitectura y estado de la solución AWS.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Servicios Activos</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">7 / 7</p>
                    <p className="text-xs text-slate-500 mt-0.5">Desplegados en producción</p>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Server className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Región Principal</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">us-east-1</p>
                    <p className="text-xs text-slate-500 mt-0.5">N. Virginia (EE.UU.)</p>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Globe className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Costo Est. Mensual</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">$407.00</p>
                    <p className="text-xs text-slate-500 mt-0.5">Anual: $4884.00</p>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado Seguridad</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">2 Revisión(es)</p>
                    <p className="text-xs text-slate-500 mt-0.5">Cumplimiento Well-Architected</p>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      Distribución de Costos por Servicio
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">USD / Mes</span>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Amazon EC2 (t3.medium x 2)</span>
                        <span>$120.00 (29%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '29%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Amazon RDS PostgreSQL (db.t3.large)</span>
                        <span>$210.00 (52%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '52%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Amazon S3 Standard (1.5 TB)</span>
                        <span>$34.50 (8%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '8%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Amazon CloudFront (Tráfico de Salida 500 GB)</span>
                        <span>$42.50 (10%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-base">Alertas y Seguridad</h3>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">IAM</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Correcto
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-xs mt-1">Autenticación Multifactor (MFA)</p>
                      <p className="text-[11px] text-slate-500 mt-1">MFA habilitado para la cuenta raíz y usuarios administradores.</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">IAM</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Revisión Requerida
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-xs mt-1">Políticas de Principio de Menor Privilegio</p>
                      <p className="text-[11px] text-slate-500 mt-1">Se detectaron 2 roles con acceso broad (*:*) que requieren auditoría.</p>
                      <div className="mt-2.5 p-2 bg-amber-50/60 rounded-lg border border-amber-200/60 text-[11px] text-amber-800">
                        <strong>Recomendación:</strong> Restringir acciones específicas por recurso en IAM.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-base mb-4">Servicios Destacados</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">✓ En uso</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Amazon EC2</h4>
                    <p className="text-xs text-slate-500">Compute — Capacidad de cómputo redimensionable en la nube.</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">✓ En uso</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Amazon S3</h4>
                    <p className="text-xs text-slate-500">Storage — Almacenamiento de objetos a escala masiva.</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Database className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">✓ En uso</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Amazon RDS</h4>
                    <p className="text-xs text-slate-500">Database — Servicio de bases de datos relacionales administradas.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 2. PLANIFICACIÓN */}
          {activeTab === 'planificacion' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Planificación Estratégica Cloud</h2>
                <p className="text-xs text-slate-500">Hitos de migración, cronograma de arquitectura y adopción de AWS.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Fase 1: Evaluación</h4>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Completado</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">Auditoría de activos, análisis TCO y definición de VPC base.</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Fase 2: Migración</h4>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">En Progreso</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">Despliegue de instancias EC2 y migración de base PostgreSQL a RDS.</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Fase 3: Optimización</h4>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Pendiente</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">Implementación de Auto Scaling, CloudFront CDN y Reserved Instances.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Cronograma de Implementación Cloud</h3>
                <div className="space-y-3">
                  {[
                    { task: 'Diseño de Red VPC & Subredes Públicas/Privadas', status: 'Completado', date: 'Semana 1-2' },
                    { task: 'Configuración de Seguridad IAM & MFA', status: 'Completado', date: 'Semana 3' },
                    { task: 'Despliegue Servidores Web EC2 y Load Balancer', status: 'En Progreso', date: 'Semana 4' },
                    { task: 'Migración BD PostgreSQL hacia AWS RDS', status: 'Pendiente', date: 'Semana 5' },
                    { task: 'Pruebas de Carga y Monitoreo CloudWatch', status: 'Pendiente', date: 'Semana 6' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                      <span className="font-medium text-slate-700">{item.task}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono text-[11px]">{item.date}</span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          item.status === 'Completado' ? 'bg-emerald-100 text-emerald-700' :
                          item.status === 'En Progreso' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. COSTOS */}
          {activeTab === 'costos' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Análisis y Gestión de Costos AWS</h2>
                <p className="text-xs text-slate-500">Estimación presupuestaria, facturación y oportunidades de ahorro.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Presupuesto Limite</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">$500.00 / mes</p>
                  <p className="text-xs text-emerald-600 mt-1">81% consumido del límite</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Gasto Actual Proyectado</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">$407.00 / mes</p>
                  <p className="text-xs text-slate-500 mt-1">Calculado sobre 730 horas/mes</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Ahorro Estimado (Savings Plans)</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">-$125.00 / mes</p>
                  <p className="text-xs text-slate-500 mt-1">Al aplicar compromiso de 1 año</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Detalle de Facturación por Recurso</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="pb-3">Servicio</th>
                        <th className="pb-3">Especificación</th>
                        <th className="pb-3">Cantidad</th>
                        <th className="pb-3">Costo Est./Mes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="py-3 font-semibold">Amazon EC2</td>
                        <td className="py-3 text-slate-500">t3.medium (Linux / On-Demand)</td>
                        <td className="py-3">2 Instancias</td>
                        <td className="py-3 font-mono font-semibold">$120.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold">Amazon RDS</td>
                        <td className="py-3 text-slate-500">db.t3.large PostgreSQL (Single-AZ)</td>
                        <td className="py-3">1 Instancia (100GB SSD)</td>
                        <td className="py-3 font-mono font-semibold">$210.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold">Amazon S3</td>
                        <td className="py-3 text-slate-500">Standard Storage + Solic. PUT/GET</td>
                        <td className="py-3">1.5 TB / mes</td>
                        <td className="py-3 font-mono font-semibold">$34.50</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold">Amazon CloudFront</td>
                        <td className="py-3 text-slate-500">Outbound Data Transfer (Global)</td>
                        <td className="py-3">500 GB / mes</td>
                        <td className="py-3 font-mono font-semibold">$42.50</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. INFRAESTRUCTURA */}
          {activeTab === 'infraestructura' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Recursos de Infraestructura AWS</h2>
                <p className="text-xs text-slate-500">Instancias activas, estado de salud y métricas de cómputo.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-slate-800 text-sm">Web-Server-Primary (EC2)</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Running</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 font-mono">
                    <p><strong>Instance ID:</strong> i-0a8bf92c431d1e</p>
                    <p><strong>Tipo:</strong> t3.medium (2 vCPU, 4GB RAM)</p>
                    <p><strong>IP Privada:</strong> 10.0.1.45</p>
                    <p><strong>IP Pública:</strong> 54.210.12.88</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-bold text-slate-800 text-sm">PostgreSQL-Prod (RDS)</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Available</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 font-mono">
                    <p><strong>DB Identifier:</strong> rds-app-prod-db</p>
                    <p><strong>Motor:</strong> PostgreSQL 15.3</p>
                    <p><strong>Endpoint:</strong> rds-app.c3xyz.us-east-1.rds.amazonaws.com</p>
                    <p><strong>Almacenamiento:</strong> 100 GB GP3</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Monitoreo de Carga y Rendimiento (CloudWatch)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase">Uso de CPU Promedio</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">24.5%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase">Memoria Libre</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">2.1 GB</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase">Latencia de Red</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">18 ms</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. SEGURIDAD */}
          {activeTab === 'seguridad' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Centro de Seguridad & Gobernanza IAM</h2>
                <p className="text-xs text-slate-500">Evaluación de riesgos, cumplimiento Well-Architected y permisos.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-slate-800 text-sm">Controles de Seguridad Activos</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      MFA Habilitado en Usuarios Root y Admins.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      Encriptación AES-256 activa en S3 Buckets.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      Subredes Privadas para Base de Datos sin IP Pública.
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h4 className="font-bold text-slate-800 text-sm">Revisiones de Seguridad Pendientes</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      Grupo de Seguridad EC2 tiene puerto 22 SSH abierto a 0.0.0.0/0.
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      Actualizar política IAM para limitar permisos de creación de usuarios.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 6. ARQUITECTURA RED */}
          {activeTab === 'arquitectura' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Arquitectura de Red Cloud (VPC)</h2>
                <p className="text-xs text-slate-500">Diseño topológico de VPC, subredes, tablas de enrutamiento e Internet Gateway.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Network className="w-5 h-5 text-blue-600" />
                    VPC Topología (vpc-0a123bc456)
                  </h3>
                  <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">CIDR: 10.0.0.0/16</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/60 space-y-2">
                    <span className="text-xs font-bold text-blue-800 uppercase">Subredes Públicas (Public Subnets)</span>
                    <p className="text-xs text-slate-600">Conectadas al Internet Gateway para Frontend y Balanceadores de Carga.</p>
                    <div className="text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-blue-100">
                      • subnet-pub-1a: 10.0.1.0/24 (us-east-1a)<br/>
                      • subnet-pub-1b: 10.0.2.0/24 (us-east-1b)
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase">Subredes Privadas (Private Subnets)</span>
                    <p className="text-xs text-slate-600">Aisladas sin acceso directo a Internet para la capa de Base de Datos.</p>
                    <div className="text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-emerald-100">
                      • subnet-priv-1a: 10.0.3.0/24 (us-east-1a)<br/>
                      • subnet-priv-1b: 10.0.4.0/24 (us-east-1b)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. SERVICIOS AWS */}
          {activeTab === 'servicios' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Catálogo de Servicios AWS Utilizados</h2>
                <p className="text-xs text-slate-500">Módulos integrados y acceso a la consola de administración.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Amazon EC2', desc: 'Instancias de Cómputo Elástico', cat: 'Compute', icon: Cpu },
                  { name: 'Amazon S3', desc: 'Almacenamiento de Objetos Seguro', cat: 'Storage', icon: HardDrive },
                  { name: 'Amazon RDS', desc: 'Base de Datos Relacional Administrada', cat: 'Database', icon: Database },
                  { name: 'AWS IAM', desc: 'Gestión de Identidades y Accesos', cat: 'Security', icon: Lock },
                  { name: 'Amazon VPC', desc: 'Redes Virtuales Privadas', cat: 'Networking', icon: Network },
                  { name: 'Amazon CloudFront', desc: 'Red de Distribución de Contenido (CDN)', cat: 'Content Delivery', icon: Globe },
                ].map((s, i) => {
                  const SIcon = s.icon;
                  return (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                        <SIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase">{s.cat}</span>
                        <h4 className="font-bold text-slate-800 text-sm">{s.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default CloudOpsModulePage;