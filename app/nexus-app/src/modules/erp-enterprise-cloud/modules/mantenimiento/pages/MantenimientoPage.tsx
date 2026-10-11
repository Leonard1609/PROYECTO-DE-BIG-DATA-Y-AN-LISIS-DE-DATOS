import { useState } from 'react';
import { MAESTROS } from '../config/maestros';
import { MaestroCrud } from '../components/MaestroCrud';

export const MantenimientoPage: React.FC = () => {
  const [activa, setActiva] = useState(MAESTROS[0].coleccion);
  const config = MAESTROS.find((m) => m.coleccion === activa) ?? MAESTROS[0];

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-slate-500 max-w-2xl">
        Aquí se registran una sola vez los datos base. Comercial y Compras no los crean, solo los seleccionan.
      </p>

      <div role="tablist" aria-label="Datos maestros" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {MAESTROS.map((m) => {
          const seleccionada = m.coleccion === activa;
          return (
            <button
              key={m.coleccion}
              role="tab"
              aria-selected={seleccionada}
              onClick={() => setActiva(m.coleccion)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-t-lg ${
                seleccionada
                  ? 'border-teal-600 text-teal-700 font-medium'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {m.tab}
            </button>
          );
        })}
      </div>

      <MaestroCrud key={config.coleccion} config={config} />
    </div>
  );
};
