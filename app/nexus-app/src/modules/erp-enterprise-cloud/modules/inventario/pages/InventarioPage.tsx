import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useErp } from '../../../core/hooks/useErp';
import { Modal } from '../../../core/components/Modal';
import { Pestanas } from '../../../core/components/Pestanas';
import { StockTab } from '../components/StockTab';
import { KardexTab } from '../components/KardexTab';
import { FormularioAjuste } from '../components/FormularioAjuste';

type Vista = 'stock' | 'kardex';

export const InventarioPage: React.FC = () => {
  const { state, acciones } = useErp();
  const [vista, setVista] = useState<Vista>('stock');
  const [ajustando, setAjustando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-slate-500 max-w-2xl">
          Las existencias no se digitan: cada compra suma y cada venta resta. Solo los ajustes se registran a mano.
        </p>
        <button
          onClick={() => { setAviso(null); setAjustando(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo ajuste
        </button>
      </div>

      {aviso && (
        <div role="status" className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{aviso}</span>
          <button onClick={() => setAviso(null)} className="underline shrink-0">Cerrar</button>
        </div>
      )}

      <Pestanas<Vista>
        etiqueta="Inventario"
        pestanas={[{ id: 'stock', titulo: 'Stock actual' }, { id: 'kardex', titulo: 'Kardex' }]}
        activa={vista}
        onCambiar={setVista}
      />

      {vista === 'stock' ? <StockTab /> : <KardexTab />}

      {ajustando && (
        <Modal titulo="Nuevo ajuste de inventario" onCerrar={() => setAjustando(false)}>
          <FormularioAjuste
            state={state}
            onGuardar={acciones.registrarAjuste}
            onExito={() => { setAjustando(false); setAviso('Ajuste registrado. El saldo del kardex se actualizó.'); }}
            onCancelar={() => setAjustando(false)}
          />
        </Modal>
      )}
    </div>
  );
};
