import React, { useState } from 'react';
import { useDatasets } from '../../context/DatasetContext';
import { pingWithLatency } from '../../lib/datasetStore';

export const SistemaPage: React.FC = () => {
  const { datasets, source, isolation, setIsolation, refresh, tableStatus } = useDatasets();
  const [ping, setPing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const probar = async () => {
    setBusy(true);
    const r = await pingWithLatency();
    setPing(`${r.ms} ms · ${r.status} · ${r.message}`);
    await refresh();
    setBusy(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-4xl font-extrabold text-white">Sistema</h1>
        <p className="text-slate-400 mt-2">
          Tres piezas: pantalla, datos y gráficos. Si la nube no responde, se sigue con la copia local. Eso es real.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { t: 'Pantalla', d: 'React. Siempre encendida.' },
          { t: 'Datos', d: isolation ? 'Copia local' : source === 'supabase' ? 'Nube' : 'Copia local' },
          { t: 'Gráficos', d: 'Chart.js en Comparar (Admin).' },
        ].map((m) => (
          <div key={m.t} className="nx-card p-5">
            <p className="text-xs text-slate-500">{m.t}</p>
            <p className="text-white mt-2 text-sm">{m.d}</p>
          </div>
        ))}
      </div>

      <div className="nx-card p-6 space-y-4">
        <p className="text-sm text-slate-300">
          Copias en este equipo: <strong className="text-white">{datasets.length}</strong>
          {' · '}
          Estado: <strong className="text-white">{tableStatus}</strong>
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="nx-btn-ghost" disabled={busy} onClick={() => void probar()}>
            {busy ? 'Midiendo…' : 'Medir conexión'}
          </button>
          <button type="button" className="nx-btn" onClick={() => void setIsolation(!isolation)}>
            {isolation ? 'Volver a la nube' : 'Probar sin nube'}
          </button>
        </div>
        {ping && <p className="text-xs text-slate-500">{ping}</p>}
        <p className="text-xs text-slate-500">
          «Probar sin nube» corta de verdad las llamadas. No inventa números: usa los archivos que ya están en este
          equipo.
        </p>
      </div>
    </div>
  );
};
