import React from 'react';
import { BarChart3, FileText, LayoutDashboard, Upload, Database, Sparkles } from 'lucide-react';
import { NavLink, Outlet, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { DatasetProvider } from '../context/DatasetContext';
import { ResumenPage } from './admin/ResumenPage';
import { CargasPage } from './admin/CargasPage';
import { AnalisisPage } from './admin/AnalisisPage';
import { MisDatasets } from '../components/MisDatasets';
import { DocumentUploader } from '../components/DocumentUploader';
import { ReportePage } from './admin/ReportePage';
import { ThemeProvider } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

const links = [
  { to:'/big-data', label:'Dashboard', icon:LayoutDashboard, end:true },
  { to:'/big-data/cargas', label:'Subir datasets', icon:Upload },
  { to:'/big-data/mis-datasets', label:'Mis datasets', icon:Database },
  { to:'/big-data/analisis', label:'Análisis y comparación', icon:BarChart3 },
  { to:'/big-data/reporte', label:'Reporte e insight IA', icon:Sparkles },
  { to:'/big-data/documentos', label:'Documentos', icon:FileText },
];

const BigDataShell: React.FC = () => {
  const navigate = useNavigate();
  return <div className="h-screen flex overflow-hidden bg-transparent">
    <aside className="w-64 shrink-0 border-r nx-shell flex flex-col">
      <div className="h-16 px-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--nx-border)' }}>
        <div><p className="text-[10px] tracking-[.25em] text-blue-400 font-bold">NEXUS</p><p className="font-display font-bold nx-shell-text">BIG DATA</p></div>
        <ThemeToggle />
      </div>
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {links.map(({to,label,icon:Icon,end})=><NavLink key={to} to={to} end={end} className={({isActive})=>`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${isActive?'bg-blue-600 text-white shadow-lg shadow-blue-600/20':'nx-shell-muted hover:bg-slate-200/70 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white'}`}><Icon size={18}/><span>{label}</span></NavLink>)}
      </nav>
      <div className="p-3 border-t" style={{ borderColor: 'var(--nx-border)' }}><button onClick={()=>navigate('/dashboard')} className="w-full nx-btn-ghost text-xs">← Volver a NEXUS</button></div>
    </aside>
    <main className="flex-1 min-w-0 overflow-y-auto"><header className="h-16 sticky top-0 z-20 border-b nx-shell backdrop-blur px-7 flex items-center justify-between" style={{ borderColor: 'var(--nx-border)' }}><div><p className="text-sm font-semibold nx-shell-text">Big Data & Analítica</p><p className="text-xs nx-shell-muted">Datos → visualización → comparación → inteligencia</p></div><span className="text-xs text-emerald-500">● Módulo activo</span></header><div className="p-7"><Outlet/></div></main>
  </div>
};

export const BigDataModulePage: React.FC = () => <ThemeProvider><DatasetProvider><Routes><Route element={<BigDataShell/>}><Route index element={<ResumenPage/>}/><Route path="cargas" element={<CargasPage/>}/><Route path="mis-datasets" element={<MisDatasets/>}/><Route path="analisis" element={<AnalisisPage/>}/><Route path="reporte" element={<ReportePage/>}/><Route path="documentos" element={<DocumentUploader/>}/><Route path="*" element={<Navigate to="/big-data" replace/>}/></Route></Routes></DatasetProvider></ThemeProvider>;
