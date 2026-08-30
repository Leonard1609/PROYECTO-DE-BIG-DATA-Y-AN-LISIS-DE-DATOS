import React from 'react';
import { useDatasets } from '../context/DatasetContext';

export const ConnectionBar: React.FC = () => {
  const { tableStatus, source, isolation } = useDatasets();

  if (isolation) {
    return (
      <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-sm text-sky-100">
        Resiliencia activa: trabajando con copia local. La nube no se está usando.
      </div>
    );
  }
  if (tableStatus === 'live' && source === 'supabase') {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-400/90">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Conectado · datos en la nube
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100">
      Sin nube. Seguís operando con la copia de este equipo.
    </div>
  );
};
