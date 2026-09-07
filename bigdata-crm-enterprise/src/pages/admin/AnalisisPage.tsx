import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDatasets } from '../../context/DatasetContext';
import { normalizeRubro, rubroLabel } from '../../lib/catalog';
import { formatMoney, formatPct } from '../../lib/format';
import { explainWinner } from '../../lib/explain';
import { profileDataset } from '../../lib/profile';
import { rankSameRubro } from '../../lib/recommend';
import { MetricBarChart } from '../../modules/charts/ProfitBarChart';

export const AnalisisPage: React.FC = () => {
  const { datasets } = useDatasets();
  const rubros = [...new Set(datasets.map((d) => normalizeRubro(d.rubro)).filter(Boolean))];
  const [rubro, setRubro] = useState(rubros[0] ?? '');

  useEffect(() => {
    const unique = [...new Set(datasets.map((d) => normalizeRubro(d.rubro)).filter(Boolean))];
    if (unique.length === 0) {
      setRubro('');
      return;
    }
    setRubro((current) => (unique.includes(current) ? current : unique[0]));
  }, [datasets]);

  const ranking = useMemo(() => (rubro ? rankSameRubro(datasets, rubro) : null), [datasets, rubro]);
  const rows = useMemo(
    () =>
      (ranking?.ranked ?? []).map((r) => ({
        ...r,
        profile: profileDataset(r.dataset),
      })),
    [ranking],
  );
  const winner = ranking?.winner;
  const otros = datasets.filter((d) => normalizeRubro(d.rubro) !== normalizeRubro(rubro));
  const delRubro = rows.length;
  const labels = rows.map((r) => (r.dataset.isMine ? `${r.dataset.name} (mío)` : r.dataset.name));
  const hasDelay = rows.some((r) => r.profile.delayAvg != null);
  const hasReview = rows.some((r) => r.profile.reviewAvg != null);
  const why = useMemo(
    () => (ranking?.comparable ? explainWinner(ranking.ranked, rubroLabel(rubro)) : null),
    [ranking, rubro],
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-4xl font-extrabold text-white">Comparar mismo rubro</h1>
        <p className="text-slate-400 mt-2">
          Lee ventas, costos, demora y reseñas. El que <strong className="text-slate-200">gana</strong> es el de mayor
          ganancia. Los gráficos muestran el resto.
        </p>
      </div>

      {rubros.length === 0 ? (
        <p className="text-slate-500 text-sm">
          Todavía no hay archivos.{' '}
          <Link to="/admin/cargas" className="text-blue-400 hover:underline">
            Subí un CSV
          </Link>
          .
        </p>
      ) : (
        <label className="text-sm text-slate-400 block max-w-sm">
          Rubro a analizar
          <select className="nx-input" value={rubro} onChange={(e) => setRubro(e.target.value)}>
            {rubros.map((r) => (
              <option key={r} value={r}>
                {rubroLabel(r)} ({datasets.filter((d) => normalizeRubro(d.rubro) === r).length} CSV)
              </option>
            ))}
          </select>
        </label>
      )}

      {delRubro === 1 && (
        <p className="text-sm text-amber-300/90">
          Hay 1 CSV de {rubroLabel(rubro)}. Para recomendar hacen falta al menos dos del mismo rubro.
        </p>
      )}

      {otros.length > 0 && (
        <p className="text-xs text-slate-500">
          Quedan afuera: {otros.map((d) => `${d.name} (${rubroLabel(d.rubro)})`).join(', ')}.
        </p>
      )}

      {delRubro >= 2 && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="nx-card p-5">
              <p className="text-sm text-white mb-3">Ganancia neta</p>
              <MetricBarChart labels={labels} values={rows.map((r) => r.money.gananciaNeta)} label="Ganancia" kind="money" />
            </div>
            {hasDelay && (
              <div className="nx-card p-5">
                <p className="text-sm text-white mb-3">Días de entrega (promedio)</p>
                <MetricBarChart
                  labels={labels}
                  values={rows.map((r) => r.profile.delayAvg ?? 0)}
                  label="Días"
                  kind="number"
                />
              </div>
            )}
            {hasReview && (
              <div className="nx-card p-5">
                <p className="text-sm text-white mb-3">Estrellas (promedio)</p>
                <MetricBarChart
                  labels={labels}
                  values={rows.map((r) => Number((r.profile.reviewAvg ?? 0).toFixed(2)))}
                  label="Reseña"
                  kind="number"
                />
              </div>
            )}
            <div className="nx-card p-5">
              <p className="text-sm text-white mb-3">Pedidos en el archivo</p>
              <MetricBarChart labels={labels} values={rows.map((r) => r.profile.pedidos)} label="Pedidos" kind="number" />
            </div>
          </div>

          <div className="nx-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-white/10">
                  <th className="p-4 font-medium">Empresa</th>
                  <th className="p-4 font-medium">Cómo trabajan</th>
                  <th className="p-4 font-medium">Ganancia</th>
                  <th className="p-4 font-medium">Margen</th>
                  <th className="p-4 font-medium">Pedidos</th>
                  <th className="p-4 font-medium">Demora</th>
                  <th className="p-4 font-medium">Estrellas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.dataset.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-white">
                      {i === 0 ? <span className="text-blue-400 mr-2 text-xs font-semibold">GANA</span> : null}
                      {r.dataset.name}
                      {r.dataset.isMine ? <span className="text-blue-400"> · mío</span> : null}
                    </td>
                    <td className="p-4 text-slate-400">{r.dataset.metodologia}</td>
                    <td className="p-4 text-blue-300 font-medium">{formatMoney(r.money.gananciaNeta)}</td>
                    <td className="p-4 text-slate-400">{formatPct(r.money.margen)}</td>
                    <td className="p-4 text-slate-400">{r.profile.pedidos}</td>
                    <td className="p-4 text-slate-400">{r.profile.delayAvg != null ? `${r.profile.delayAvg.toFixed(1)} d` : '—'}</td>
                    <td className="p-4 text-slate-400">{r.profile.reviewAvg != null ? r.profile.reviewAvg.toFixed(2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows[0] && (
            <p className="text-xs text-slate-500">
              Columnas leídas: {rows[0].profile.used.map((u) => `${u.role} (${u.column})`).join(' · ') || 'solo las que el CSV trae'}
            </p>
          )}

          {ranking?.comparable && winner && why && (
            <div className="nx-card p-6 bg-blue-600/10 border-blue-500/30 space-y-5">
              <div>
                <p className="text-xs tracking-wide text-blue-400 uppercase">Quién gana</p>
                <p className="text-white mt-1">{why.headline}</p>
              </div>
              <div>
                <p className="text-xs tracking-wide text-blue-400 uppercase">Por qué</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300 list-disc pl-5">
                  {why.why.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs tracking-wide text-blue-400 uppercase">Cómo lo hizo / qué copiar</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300 list-disc pl-5">
                  {why.how.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <Link to="/admin" className="nx-btn inline-flex">
                Pasar al equipo
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};
