import { useState } from 'react';
import type { ErpState, Resultado } from '../../../core/types';
import { EXTENSIONES_PERMITIDAS, MAX_ARCHIVO_KB, type DatosDocumento } from '../../../core/services/erpStore';

interface Props {
  state: ErpState;
  onGuardar: (d: DatosDocumento) => Resultado;
  onExito: () => void;
  onCancelar: () => void;
}

export const FormularioDocumento: React.FC<Props> = ({ state, onGuardar, onExito, onCancelar }) => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [tipo, setTipo] = useState<'Contrato' | 'Otro'>('Contrato');
  const [vinculo, setVinculo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const campo = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';
  const etiqueta = 'block text-sm font-medium text-slate-700 mb-1';

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const [entidad, entidadId] = vinculo === '' ? ['Otro', ''] : (vinculo.split(':') as ['Venta' | 'Compra', string]);
    const r = onGuardar({
      nombre: archivo?.name ?? '',
      tamanoKb: archivo ? Math.max(1, Math.round(archivo.size / 1024)) : 0,
      tipo, entidad: entidad as DatosDocumento['entidad'], entidadId,
    });
    if (r.ok) onExito();
    else setError(r.error);
  };

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <div>
        <label htmlFor="doc-archivo" className={etiqueta}>Archivo</label>
        <input
          id="doc-archivo" type="file" accept={EXTENSIONES_PERMITIDAS.map((x) => `.${x}`).join(',')}
          onChange={(e) => { setArchivo(e.target.files?.[0] ?? null); setError(null); }}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:text-slate-700 hover:file:bg-slate-200"
        />
        <p className="text-xs text-slate-400 mt-1">
          Formatos: {EXTENSIONES_PERMITIDAS.join(', ')}. Máximo {MAX_ARCHIVO_KB / 1024} MB.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="doc-tipo" className={etiqueta}>Tipo de documento</label>
          <select id="doc-tipo" value={tipo} onChange={(e) => setTipo(e.target.value as 'Contrato' | 'Otro')} className={campo}>
            <option value="Contrato">Contrato</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div>
          <label htmlFor="doc-vinculo" className={etiqueta}>Vincular a</label>
          <select id="doc-vinculo" value={vinculo} onChange={(e) => setVinculo(e.target.value)} className={campo}>
            <option value="">Sin vínculo</option>
            {state.ventas.map((v) => <option key={v.id} value={`Venta:${v.id}`}>Venta {v.numero}</option>)}
            {state.compras.map((c) => <option key={c.id} value={`Compra:${c.id}`}>Compra {c.numero}</option>)}
          </select>
        </div>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancelar}
          className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
          Cancelar
        </button>
        <button type="submit"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
          Subir documento
        </button>
      </div>
    </form>
  );
};
