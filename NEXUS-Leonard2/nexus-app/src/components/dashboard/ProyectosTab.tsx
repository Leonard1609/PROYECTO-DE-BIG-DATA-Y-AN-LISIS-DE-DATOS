import React, { useState } from 'react';
import { Search, Grid, List, Star } from 'lucide-react';
import type { Proyecto } from '../../types/dashboard';

interface ProyectosTabProps {
  proyectos: Proyecto[];
  onSelectProyecto?: (id: number) => void;
}

export const ProyectosTab: React.FC<ProyectosTabProps> = ({ proyectos, onSelectProyecto }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProyectos = proyectos.filter(p => {
    const matchesSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.nrc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.lider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' ? true : p.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 border border-slate-300 rounded px-3 py-1.5 w-72 bg-white">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Busque sus proyectos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <select className="border border-slate-300 rounded px-3 py-1.5 bg-white">
            <option>Todos los periodos</option>
            <option>2026 - Trimestre 1</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Proyectos Activos</option>
            <option value="Inactivo">Proyectos Inactivos</option>
            <option value="Pendiente">Pendientes de activación</option>
          </select>

          <div className="flex items-center gap-1 border-l pl-3">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded border ${viewMode === 'grid' ? 'bg-slate-200 border-slate-400 text-slate-800' : 'hover:bg-slate-100 border-transparent text-slate-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded border ${viewMode === 'list' ? 'bg-slate-200 border-slate-400 text-slate-800' : 'hover:bg-slate-100 border-transparent text-slate-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-500">{filteredProyectos.length} resultados</p>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProyectos.map((p) => (
            <div key={p.id} className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className={`h-28 bg-gradient-to-r ${p.bg} p-3 text-white flex flex-col justify-between`}>
                  <span className="text-[10px] bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded w-fit font-mono">
                    {p.nrc}
                  </span>
                  <h2 className="font-bold text-sm tracking-wide line-clamp-2 leading-tight">
                    {p.titulo}
                  </h2>
                </div>

                <div className="p-3 space-y-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    p.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' :
                    p.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.estado}
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium truncate uppercase pt-1">
                    Líder: {p.lider}
                  </p>
                </div>
              </div>

              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-slate-400">
                <span 
                  onClick={() => onSelectProyecto && onSelectProyecto(p.id)}
                  className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline"
                >
                  Acceder al proyecto →
                </span>
                <Star className="w-4 h-4 cursor-pointer hover:text-amber-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Nombre del Proyecto</th>
                <th className="p-3">Líder</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProyectos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-600">{p.nrc}</td>
                  <td className="p-3 font-bold text-slate-800">{p.titulo}</td>
                  <td className="p-3 text-slate-600 uppercase">{p.lider}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      p.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' :
                      p.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => onSelectProyecto && onSelectProyecto(p.id)}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Acceder →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};