import React, { useState } from 'react';
import { useDatasets } from '../context/DatasetContext';
import { financials } from '../lib/analyze';
import { rubroLabel } from '../lib/catalog';
import { formatMoney } from '../lib/format';
import { DatasetAnalyticsPanel } from './DatasetAnalyticsPanel';
import { DatasetModal } from './DatasetModal';

export const MisDatasets: React.FC = () => {
  const { datasets, markMine, removeDataset } = useDatasets();
  const [selectedId, setSelectedId] = useState<string | null>(datasets[0]?.id ?? null);
  const [modalDataset, setModalDataset] = useState<(typeof datasets)[0] | null>(null);

  const selected = datasets.find((d) => d.id === selectedId) ?? datasets[0];

  return (
    <div className="space-y-7 max-w-6xl">
      <div>
        <p className="text-xs text-blue-500 uppercase tracking-widest font-semibold">Biblioteca de datos</p>
        <h1 className="font-display nx-title text-4xl font-extrabold mt-1">Mis datasets</h1>
        <p className="nx-subtitle mt-2">Seleccioná un archivo para ver gráficos, KPIs y perfil de columnas.</p>
      </div>

      {datasets.length === 0 ? (
        <div className="nx-card p-10 text-center nx-muted">Todavía no tienes datasets cargados.</div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {datasets.map((d) => {
              const f = financials(d);
              const active = selected?.id === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  className={`nx-card p-5 text-left transition hover:border-blue-500/40 ${active ? 'ring-2 ring-blue-500/50 border-blue-500/40' : ''} ${d.isMine ? 'border-blue-500/30' : ''}`}
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className={`text-[10px] uppercase tracking-wider font-semibold ${d.isMine ? 'text-blue-500' : 'text-amber-500'}`}>
                        {d.isMine ? 'Mi empresa' : 'Competencia'}
                      </p>
                      <h2 className="nx-title font-semibold mt-2 truncate" title={d.name}>
                        {d.name}
                      </h2>
                    </div>
                    <span className="text-xs nx-muted">{d.rows.length} reg.</span>
                  </div>
                  <p className="text-xs nx-muted mt-2 truncate">{d.filename}</p>
                  <div className="grid grid-cols-2 gap-2 mt-5">
                    <div className="nx-stat-box">
                      <p className="text-[10px] nx-muted">Ingresos</p>
                      <p className="text-sm nx-title font-semibold mt-1">{formatMoney(f.ingresos)}</p>
                    </div>
                    <div className="nx-stat-box">
                      <p className="text-[10px] nx-muted">Ganancia</p>
                      <p className="text-sm nx-title font-semibold mt-1">{formatMoney(f.gananciaNeta)}</p>
                    </div>
                  </div>
                  <p className="text-[11px] nx-muted mt-3">{rubroLabel(d.rubro)} · {d.metodologia}</p>
                </button>
              );
            })}
          </div>

          {selected && (
            <DatasetAnalyticsPanel
              dataset={selected}
              onMarkMine={!selected.isMine ? () => void markMine(selected.id) : undefined}
              onRemove={() => {
                void removeDataset(selected.id);
                setSelectedId(datasets.find((d) => d.id !== selected.id)?.id ?? null);
              }}
              onOpenFull={() => setModalDataset(selected)}
            />
          )}
        </>
      )}

      <DatasetModal dataset={modalDataset} isOpen={!!modalDataset} onClose={() => setModalDataset(null)} />
    </div>
  );
};
