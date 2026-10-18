import React, { useState } from 'react';
import { 
  Users, Truck, Package, Warehouse, UserCheck, 
  Tags, Bookmark, Scale, Coins, ArrowLeft, ChevronRight 
} from 'lucide-react';
import { MAESTROS, type ConfigMaestro } from '../config/maestros';
import { MaestroCrud } from '../components/MaestroCrud';
import { useErp } from '../../../core/hooks/useErp';
import { LIMITE_REGISTROS } from '../../../core/services/erpStore';

// Mapeo de íconos representativos por cada entidad maestra
const ICONOS: Record<string, React.ReactNode> = {
  clientes: <Users className="w-6 h-6 text-teal-600" />,
  proveedores: <Truck className="w-6 h-6 text-blue-600" />,
  productos: <Package className="w-6 h-6 text-indigo-600" />,
  almacenes: <Warehouse className="w-6 h-6 text-amber-600" />,
  vendedores: <UserCheck className="w-6 h-6 text-emerald-600" />,
  categorias: <Tags className="w-5 h-5 text-slate-600" />,
  marcas: <Bookmark className="w-5 h-5 text-slate-600" />,
  unidades: <Scale className="w-5 h-5 text-slate-600" />,
  monedas: <Coins className="w-5 h-5 text-slate-600" />,
};

export const MantenimientoPage: React.FC = () => {
  const { state } = useErp();
  const [seleccionado, setSeleccionado] = useState<ConfigMaestro | null>(null);

  // Clasificación de maestros principales y catálogos secundarios
  const maestrosPrincipales = MAESTROS.filter((m) => 
    ['clientes', 'proveedores', 'productos', 'almacenes', 'vendedores'].includes(m.coleccion)
  );
  
  const catalogosSecundarios = MAESTROS.filter((m) => 
    !['clientes', 'proveedores', 'productos', 'almacenes', 'vendedores'].includes(m.coleccion)
  );

  return (
    <div className="max-w-6xl space-y-6">
      {/* Si hay una entidad seleccionada, mostramos la tabla con el botón de regresar */}
      {seleccionado ? (
        <div className="space-y-4">
          <button
            onClick={() => setSeleccionado(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Tarjetas de Mantenimiento
          </button>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-1">{seleccionado.tab}</h2>
            <p className="text-sm text-slate-500 mb-6">
              Gestión centralizada de {seleccionado.plural}. Los cambios realizados se reflejarán en todo el sistema.
            </p>
            <MaestroCrud key={seleccionado.coleccion} config={seleccionado} />
          </div>
        </div>
      ) : (
        /* Vista Principal: Vista en Cuadrícula de Tarjetas (Cards) */
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mantenimiento de Datos Maestros</h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Aquí se registran una sola vez los datos base del sistema. Módulos como Comercial y Compras consultan y seleccionan estos registros sin duplicarlos.
            </p>
          </div>

          {/* Seccion 1: Entidades Principales */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Entidades Principales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {maestrosPrincipales.map((m) => {
                const total = (state[m.coleccion] as unknown[]).length;
                return (
                  <div
                    key={m.coleccion}
                    onClick={() => setSeleccionado(m)}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          {ICONOS[m.coleccion]}
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                          {total} / {LIMITE_REGISTROS} reg.
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                        {m.tab}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Administrar {m.plural} del ERP
                      </p>
                    </div>

                    <div className="flex items-center justify-end mt-4 text-xs font-medium text-teal-600 group-hover:translate-x-1 transition-transform">
                      Gestionar <ChevronRight className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seccion 2: Tablas Auxiliares y Catálogos */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Catálogos Auxiliares
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {catalogosSecundarios.map((m) => {
                const total = (state[m.coleccion] as unknown[]).length;
                return (
                  <button
                    key={m.coleccion}
                    onClick={() => setSeleccionado(m)}
                    className="bg-white p-3.5 rounded-lg border border-slate-200 text-left hover:border-teal-500 hover:shadow-sm transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded bg-slate-50">
                        {ICONOS[m.coleccion]}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-teal-600">
                          {m.tab}
                        </p>
                        <p className="text-[10px] text-slate-400">{total} reg.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};