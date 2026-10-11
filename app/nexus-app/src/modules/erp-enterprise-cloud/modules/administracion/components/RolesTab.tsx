import { useState } from 'react';
import { useErp } from '../../../core/hooks/useErp';
import { ERP_MODULOS } from '../../../core/config/navigation';

export const RolesTab: React.FC = () => {
  const { state, acciones } = useErp();
  const [aviso, setAviso] = useState<string | null>(null);
  const modulos = ERP_MODULOS.filter((m) => m.path !== 'dashboard');

  const alternar = (rolId: string, permisos: string[], ruta: string) => {
    const nuevos = permisos.includes(ruta) ? permisos.filter((p) => p !== ruta) : [...permisos, ruta];
    const r = acciones.actualizarPermisos(rolId, nuevos);
    setAviso(r.ok ? null : r.error);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 max-w-2xl">
        Marca o desmarca los módulos de cada rol. El menú lateral cambia al instante, y quien no tenga permiso no puede abrir el módulo ni escribiendo la dirección.
        El Dashboard siempre es visible.
      </p>

      {aviso && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{aviso}</span>
          <button onClick={() => setAviso(null)} className="underline shrink-0">Cerrar</button>
        </div>
      )}

      {state.roles.map((rol) => (
        <section key={rol.id} className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h3 className="font-semibold text-slate-900">{rol.nombre}</h3>
            <p className="text-sm text-slate-500">
              {state.usuarios.filter((u) => u.rolId === rol.id).length} usuario(s) · {rol.permisos.length} de {modulos.length} módulos
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {modulos.map((m) => {
              const id = `permiso-${rol.id}-${m.path}`;
              return (
                <label key={m.path} htmlFor={id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50">
                  <input
                    id={id} type="checkbox" checked={rol.permisos.includes(m.path)}
                    onChange={() => alternar(rol.id, rol.permisos, m.path)}
                    className="w-4 h-4 accent-teal-600"
                  />
                  {m.nombre}
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
