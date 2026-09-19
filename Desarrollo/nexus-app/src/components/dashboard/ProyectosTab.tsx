import React, { useState } from 'react';
import { Search, Lock, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { Proyecto } from '../../types/dashboard';

interface ProyectosTabProps {
  proyectos: Proyecto[];
  userRole?: string;
  onSelectProyecto: (id: number) => void;
  onCambiarEstadoProyecto?: (id: number, nuevoEstado: 'Activo' | 'Inactivo' | 'Pendiente de activación') => void;
}

export const ProyectosTab: React.FC<ProyectosTabProps> = ({
  proyectos,
  userRole = 'ANALISTA',
  onSelectProyecto,
  onCambiarEstadoProyecto
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');

  const rolUpper = userRole.toUpperCase();
  const esAdmin = ['ADMIN', 'ADMINISTRADOR', 'SUB_ADMIN'].includes(rolUpper);

  // Filtrado de proyectos por búsqueda y estado
  const proyectosFiltrados = proyectos.filter((p) => {
    const coincideBusqueda =
      p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nrc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lider.toLowerCase().includes(searchTerm.toLowerCase());

    const coincideEstado =
      selectedStatus === 'todos' ||
      p.estado.toLowerCase() === selectedStatus.toLowerCase();

    return coincideBusqueda && coincideEstado;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* BARRA DE BÚSQUEDA Y DESPLEGABLES DE FILTRO */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Busque sus proyectos por título, NRC o líder..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-700"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Desplegable: Todos los periodos */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="todos">Todos los periodos</option>
            <option value="2026-1">Periodo 2026-I</option>
            <option value="2026-2">Periodo 2026-II</option>
          </select>

          {/* Desplegable: Todos los estados */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="Activo">Proyectos Activos</option>
            <option value="Inactivo">Proyectos Inactivos</option>
            <option value="Pendiente de activación">Pendientes de activación</option>
          </select>
        </div>
      </div>

      {/* CONTADOR DE RESULTADOS */}
      <div className="text-xs font-semibold text-slate-500">
        {proyectosFiltrados.length} {proyectosFiltrados.length === 1 ? 'resultado' : 'resultados'}
      </div>

      {/* TARJETAS DE PROYECTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proyectosFiltrados.map((p) => {
          const estaActivo = p.estado === 'Activo';
          const estaPendiente = p.estado === 'Pendiente de activación';

          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                estaActivo ? 'border-slate-200' : 'border-slate-300 opacity-95'
              }`}
            >
              {/* CABECERA DEL CARD */}
              <div className={`p-5 bg-gradient-to-br ${p.bg || 'from-blue-700 to-indigo-900'} text-white relative`}>
                <div className="inline-block px-2.5 py-1 rounded-md bg-black/30 backdrop-blur-md text-[10px] font-mono font-bold tracking-wider mb-3 border border-white/10">
                  {p.nrc}
                </div>
                <h3 className="text-base font-extrabold leading-snug tracking-wide uppercase">
                  {p.titulo}
                </h3>
              </div>

              {/* CUERPO DEL CARD */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-white">
                <div className="space-y-3">
                  {/* ESTADO Y CAMBIO DE ESTADO (SOLO ADMIN) */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Badge de Estado */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        estaActivo
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : estaPendiente
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {estaActivo && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {estaPendiente && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      {!estaActivo && !estaPendiente && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                      {p.estado}
                    </span>

                    {/* Desplegable de Cambiar Estado (Visión y Control del Administrador) */}
                    {esAdmin && onCambiarEstadoProyecto && (
                      <select
                        value={p.estado}
                        onChange={(e) =>
                          onCambiarEstadoProyecto(p.id, e.target.value as any)
                        }
                        className="text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 outline-none cursor-pointer transition-colors"
                        title="Cambiar estado del proyecto"
                      >
                        <option value="Activo">🟢 Activo</option>
                        <option value="Inactivo">🔴 Inactivo</option>
                        <option value="Pendiente de activación">🟡 Pendiente</option>
                      </select>
                    )}
                  </div>

                  {/* LÍDER DE PROYECTO */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Líder de Proyecto
                    </p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      {p.lider}
                    </p>
                  </div>
                </div>

                {/* BOTÓN DE ACCESO SEGÚN ESTADO */}
                <div className="pt-3 border-t border-slate-100">
                  {estaActivo ? (
                    <button
                      onClick={() => onSelectProyecto(p.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all duration-200 flex items-center justify-between group shadow-sm"
                    >
                      <span>Acceder al proyecto</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  ) : (
                    <button
                      disabled={!esAdmin}
                      onClick={() => {
                        if (esAdmin) {
                          onSelectProyecto(p.id);
                        } else {
                          alert('Este proyecto se encuentra inactivo.');
                        }
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                        esAdmin
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 cursor-pointer'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        {esAdmin ? 'Acceder (Modo Admin)' : 'Proyecto Inactivo'}
                      </span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {proyectosFiltrados.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <p className="text-sm font-semibold text-slate-500">
              No se encontraron proyectos con los filtros aplicados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};