import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Upload, BarChart3 } from 'lucide-react';
import { useDatasets } from '../../context/DatasetContext';
import { financials } from '../../lib/analyze';
import { rubroLabel } from '../../lib/catalog';
import { formatMoney } from '../../lib/format';
import { rankSameRubro } from '../../lib/recommend';
import { supabase } from '../../lib/supabaseClient';

export const ResumenPage: React.FC = () => {
  const { datasets } = useDatasets();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mine = datasets.find((d) => d.isMine);
  const rubro = mine?.rubro ?? datasets[0]?.rubro ?? '';
  const ranking = useMemo(() => (rubro ? rankSameRubro(datasets, rubro) : null), [datasets, rubro]);
  const neta = mine ? financials(mine) : null;
  const step = datasets.length === 0 ? 1 : ranking?.comparable ? 3 : 2;
  const winner = ranking?.winner;
  const mineRow = ranking?.ranked.find((r) => r.dataset.isMine);

  const avisar = async () => {
    setLoading(true);
    setMensaje(null);
    const w = ranking?.winner;
    const { error } = await supabase.from('tareas').insert([
      {
        cliente: mine?.name ?? 'Nuestro negocio',
        prioridad: 'Alta',
        accion: w
          ? `Aplicar en ${mine?.name ?? 'lo nuestro'} (${rubroLabel(rubro)}): metodología «${w.dataset.metodologia}» como ${w.dataset.name}.`
          : 'Falta comparar archivos del mismo rubro.',
        completada: false,
      },
    ]);
    setMensaje(error ? error.message : 'El equipo ya tiene la tarea en su panel.');
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <p className="text-xs tracking-[0.2em] text-blue-400 uppercase">Inteligencia de negocio</p>
        <h1 className="font-display text-4xl font-extrabold text-white mt-2">Qué conviene copiar</h1>
        <p className="text-slate-400 mt-3 max-w-xl">
          Medís con CSV reales. Comparás solo el mismo rubro. El Encargado aplica la metodología ganadora en el negocio.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { n: '01', t: 'Subir', d: 'CSV + rubro del catálogo', to: '/admin/cargas', icon: Upload, on: step >= 1 },
          { n: '02', t: 'Comparar', d: 'Mismo rubro, mayor ganancia', to: '/admin/analisis', icon: BarChart3, on: step >= 2 },
          { n: '03', t: 'Aplicar', d: 'Tarea real al equipo', to: '/admin', icon: ArrowRight, on: step >= 3 },
        ].map((s) => (
          <Link key={s.n} to={s.to} className={`nx-card p-5 group hover:border-blue-500/40 transition ${s.on ? '' : 'opacity-60'}`}>
            <p className="text-[11px] text-blue-400 font-semibold">{s.n}</p>
            <p className="text-white font-medium mt-2 flex items-center gap-2">
              {s.t}
              <s.icon size={14} className="opacity-0 group-hover:opacity-100 transition" />
            </p>
            <p className="text-xs text-slate-500 mt-1">{s.d}</p>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { k: 'Datasets', v: String(datasets.length) },
          { k: 'Lo nuestro', v: mine ? `${mine.name}` : '—' },
          { k: 'Ganancia nuestra', v: neta && neta.basis !== 'sin_dinero' ? formatMoney(neta.gananciaNeta) : '—' },
        ].map((x) => (
          <div key={x.k} className="nx-card p-5">
            <p className="text-xs text-slate-500">{x.k}</p>
            <p className="text-2xl font-semibold text-white mt-2 truncate">{x.v}</p>
            {x.k === 'Lo nuestro' && mine && <p className="text-xs text-slate-500 mt-1">{rubroLabel(mine.rubro)}</p>}
          </div>
        ))}
      </div>

      {ranking?.comparable && winner ? (
        <div className="nx-card p-6 border-blue-500/30 bg-blue-600/10">
          <p className="text-sm text-slate-300">
            En {rubroLabel(rubro)} conviene probar <strong className="text-white">{winner.dataset.metodologia}</strong> de{' '}
            {winner.dataset.name} ({formatMoney(winner.money.gananciaNeta)}).
          </p>
          {mineRow && mineRow.dataset.id !== winner.dataset.id && (
            <p className="text-xs text-slate-400 mt-2">
              Brecha vs lo nuestro: {formatMoney(winner.money.gananciaNeta - mineRow.money.gananciaNeta)}.
            </p>
          )}
          <button type="button" disabled={loading} onClick={() => void avisar()} className="nx-btn mt-4">
            {loading ? 'Enviando…' : 'Pasar al equipo'}
          </button>
          {mensaje && <p className="text-xs text-slate-400 mt-3">{mensaje}</p>}
        </div>
      ) : (
        <Link to={datasets.length === 0 ? '/admin/cargas' : '/admin/analisis'} className="nx-btn">
          {datasets.length === 0 ? 'Empezar a subir' : 'Ir a comparar'}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
};
