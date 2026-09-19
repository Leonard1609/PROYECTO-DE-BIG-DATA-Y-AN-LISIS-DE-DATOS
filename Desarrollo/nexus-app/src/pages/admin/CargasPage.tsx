import React, { useMemo, useState } from 'react';
import { CheckCircle2, FileSpreadsheet, MoreHorizontal } from 'lucide-react';
import { useDatasets } from '../../context/DatasetContext';
import { withCanonicalMoney } from '../../lib/analyze';
import { METODOLOGIA_OTRA, METODOLOGIAS, metodologiaLabel, normalizeRubro } from '../../lib/catalog';
import { readCsvFile } from '../../lib/inspectCsv';
import { DatasetModal } from '../../components/DatasetModal';
import { DatasetAnalyticsPanel } from '../../components/DatasetAnalyticsPanel';
import type { Dataset } from '../../types/dataset';

type Draft = {
  filename: string;
  headers: string[];
  rows: Record<string, string>[];
  kindLabel: string;
  numeric: string[];
};

export const CargasPage: React.FC = () => {
  const { datasets, addDataset, clearAll } = useDatasets();
  const defaultRubro = datasets.find((d) => d.isMine)?.rubro ?? datasets[0]?.rubro ?? 'ecommerce';

  const [name, setName] = useState('');
  const [rubro] = useState(normalizeRubro(defaultRubro) || 'ecommerce');
  const [rubroOtro] = useState('');
  const [metodologia] = useState<string>(METODOLOGIAS[0].id);
  const [metodologiaOtra] = useState('');
  const [ownership, setOwnership] = useState<'mio' | 'competencia' | null>(null);
  const [ingresosCol, setIngresosCol] = useState('');
  const [costosCol, setCostosCol] = useState('');
  const [drag, setDrag] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [selectedDatasetForModal, setSelectedDatasetForModal] = useState<Dataset | null>(null);

  const rubroId = rubro === 'otro' ? normalizeRubro(rubroOtro) : normalizeRubro(rubro);
  const metodoLabel =
    metodologia === METODOLOGIA_OTRA ? metodologiaOtra.trim() : metodologiaLabel(metodologia);

  const draftDataset = useMemo((): Dataset | null => {
    if (!draft) return null;
    const canonical = ingresosCol
      ? withCanonicalMoney(draft.headers, draft.rows, { ingresos: ingresosCol, costos: costosCol })
      : { headers: draft.headers, rows: draft.rows };
    return {
      id: 'draft-preview',
      name: name.trim() || draft.filename.replace(/\.(csv|txt)$/i, ''),
      rubro: rubroId || 'ecommerce',
      metodologia: metodoLabel || 'Sin etiquetar',
      isMine: ownership === 'mio',
      filename: draft.filename,
      headers: canonical.headers,
      rows: canonical.rows,
      createdAt: new Date().toISOString(),
    };
  }, [draft, ingresosCol, costosCol, name, rubroId, metodoLabel, ownership]);

  const ingest = async (file: File) => {
    setError(null);
    setSuccess(null);
    try {
      const read = await readCsvFile(file);
      if (read.suggested.numeric.length === 0) {
        setDraft(null);
        setError('El CSV se leyó, pero no tiene columnas numéricas para analizar.');
        return;
      }
      setDraft({
        filename: read.filename,
        headers: read.headers,
        rows: read.rows,
        kindLabel: read.kindLabel,
        numeric: read.suggested.numeric,
      });
      setIngresosCol(read.suggested.ingresos);
      setCostosCol(read.suggested.costos);
      if (!name.trim()) setName(file.name.replace(/\.(csv|txt)$/i, ''));
    } catch (e) {
      setDraft(null);
      setError(e instanceof Error ? e.message : 'No se pudo leer el CSV.');
    }
  };

  const guardar = async () => {
    if (!draft) {
      setError('Primero soltá un CSV para que el sistema lo lea.');
      return;
    }
    if (!ingresosCol) {
      setError('Indicá qué columna es el dinero que entra (price, amount, payment_value…).');
      return;
    }
    if (costosCol && costosCol === ingresosCol) {
      setError('Ingresos y costos no pueden ser la misma columna.');
      return;
    }
    if (!rubroId) {
      setError('Elegí el rubro. La comparación solo junta el mismo tipo de negocio.');
      return;
    }
    if (!metodoLabel) {
      setError('Indicá cómo trabajan (la metodología).');
      return;
    }
    if (!ownership) {
      setError('Elegí si el dataset será Mi dataset o Competencia antes de guardarlo.');
      return;
    }

    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const canonical = withCanonicalMoney(draft.headers, draft.rows, { ingresos: ingresosCol, costos: costosCol });
      await addDataset({
        name: name.trim() || draft.filename.replace(/\.(csv|txt)$/i, ''),
        rubro: rubroId,
        metodologia: metodoLabel,
        isMine: ownership === 'mio',
        filename: draft.filename,
        headers: canonical.headers,
        rows: canonical.rows,
      });
      setDraft(null);
      setName('');
      setOwnership(null);
      setSuccess('Dataset guardado. Seleccionalo abajo o andá a Análisis para comparar.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir.');
    } finally {
      setSaving(false);
    }
  };

  const viewingDraft = Boolean(draft && draftDataset);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display nx-title text-4xl font-extrabold">Subir dataset</h1>
          <p className="nx-subtitle mt-2 max-w-2xl">
            Subí un CSV y el sistema muestra al instante KPIs, gráficos y perfil de columnas. Después comparás en{' '}
            <strong className="nx-strong">Análisis</strong>.
          </p>
        </div>
      </div>

      {!draft && (
        <div className="nx-card p-6">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const file = e.dataTransfer.files[0];
              if (file) void ingest(file);
            }}
            className={`nx-dropzone ${drag ? 'nx-dropzone-active' : ''}`}
          >
            <FileSpreadsheet className="w-10 h-10 mx-auto text-blue-500 mb-3" />
            <p className="nx-title font-medium">Soltá el CSV o hacé clic</p>
            <p className="text-xs nx-muted mt-2">
              Ventas, pedidos, items — archivos con columnas <strong>price</strong>, <strong>amount</strong> o similares.
            </p>
            <input
              type="file"
              accept=".csv,.txt,text/csv,text/plain,application/vnd.ms-excel"
              className="hidden"
              disabled={saving}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void ingest(f);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      )}

      {draft && (
        <div className="flex flex-wrap gap-2 items-center">
          <button type="button" className="nx-btn-ghost text-xs" onClick={() => setDraft(null)}>
            ← Cambiar archivo
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`nx-btn text-xs ${ownership === 'mio' ? 'bg-blue-600 text-white border-blue-600' : 'nx-btn-ghost border-slate-300 text-slate-700'}`}
              onClick={() => setOwnership('mio')}
            >
              Mi dataset
            </button>
            <button
              type="button"
              className={`nx-btn text-xs ${ownership === 'competencia' ? 'bg-amber-500 text-white border-amber-500' : 'nx-btn-ghost border-slate-300 text-slate-700'}`}
              onClick={() => setOwnership('competencia')}
            >
              Competencia
            </button>
          </div>
        </div>
      )}

      {viewingDraft && draftDataset && (
        <DatasetAnalyticsPanel
          dataset={draftDataset}
          mode="preview"
          saving={saving}
          onSave={() => void guardar()}
          onRemove={() => setDraft(null)}
        />
      )}


      {datasets.length > 0 && (
        <section className="nx-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide font-semibold text-blue-500">Datasets cargados</p>
              <h3 className="nx-title font-bold text-2xl mt-1">Carga reciente</h3>
            </div>
            <button
              type="button"
              disabled={!datasets.length}
              onClick={() => window.confirm('¿Vaciar la lista?') && void clearAll()}
              className="nx-btn-ghost text-xs"
            >
              Vaciar
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {datasets.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/50 px-4 py-3 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <FileSpreadsheet size={18} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold nx-title truncate">{d.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 text-blue-500">
                        {d.isMine ? 'Mío' : 'Competencia'}
                      </span>
                    </div>
                    <div className="text-xs nx-muted mt-1 flex flex-wrap gap-3">
                      <span>{d.rows.length} registros</span>
                      <span>{d.headers.length} variables</span>
                      <span>{new Date(d.createdAt).toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                    onClick={() => setSelectedDatasetForModal(d)}
                    aria-label="Abrir vista general"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
          <CheckCircle2 size={16} /> {success}
        </p>
      )}

      <DatasetModal
        dataset={selectedDatasetForModal}
        isOpen={!!selectedDatasetForModal}
        onClose={() => setSelectedDatasetForModal(null)}
      />
    </div>
  );
};
