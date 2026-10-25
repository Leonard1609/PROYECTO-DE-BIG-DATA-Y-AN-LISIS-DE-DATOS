import { useState } from 'react';
import { useErp } from '../../../core/hooks/useErp';
import { ruta } from '../../../core/config/navigation';
import { faltantesDocumento, filasCotizaciones } from '../../../core/utils/filas';
import { AvisoFlujo, type Aviso } from '../../../core/components/AvisoFlujo';
import { Modal } from '../../../core/components/Modal';
import { FormularioOperacion } from '../../../core/components/operaciones/FormularioOperacion';
import { ListaDocumentos } from '../../../core/components/operaciones/ListaDocumentos';

export const CotizacionesPage: React.FC = () => {
  const { state, acciones } = useErp();
  const [creando, setCreando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const aceptar = (id: string) => {
    const r = acciones.aceptarCotizacion(id);
    setAviso(r.ok
      ? { ok: true, texto: 'Cotización aceptada. Se generó la orden de venta.', siguiente: { to: ruta('ventas', 'ordenes'), texto: 'Ir a Órdenes de venta' } }
      : { ok: false, texto: r.error });
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-500 max-w-2xl">
        La cotización es la oferta al cliente. Cuando el cliente la acepta, se convierte en una orden de venta.
      </p>

      {aviso && <AvisoFlujo aviso={aviso} onCerrar={() => setAviso(null)} />}

      <ListaDocumentos
        documento={{ articulo: 'una', singular: 'cotización', plural: 'cotizaciones', tituloDetalle: 'Cotización' }}
        etiquetaTercero="Cliente"
        etiquetaEstado="Estado"
        filas={filasCotizaciones(state)}
        estadosPendientes={['Pendiente']}
        etiquetaPendientes="Por aceptar"
        nuevo={{ texto: 'Nueva cotización', onClick: () => { setAviso(null); setCreando(true); }, faltantes: faltantesDocumento(state, 'venta') }}
        accionFila={(f) => f.estado === 'Pendiente' ? (
          <button onClick={() => aceptar(f.id)}
            className="px-3 py-1.5 rounded-lg text-sm text-teal-700 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
            Aceptar y generar orden
          </button>
        ) : null}
        vacio="Registra una cotización o amplía el rango de fechas."
      />

      {creando && (
        <Modal titulo="Nueva cotización" onCerrar={() => setCreando(false)}>
          <FormularioOperacion
            modo="cotizacion"
            state={state}
            onGuardar={(d) => acciones.registrarCotizacion({ clienteId: d.terceroId, vendedorId: d.vendedorId, almacenId: d.almacenId, condicion: d.condicion, detalle: d.detalle })}
            onExito={() => { setCreando(false); setAviso({ ok: true, texto: 'Cotización registrada. Siguiente paso: aceptarla para generar la orden de venta.' }); }}
            onCancelar={() => setCreando(false)}
          />
        </Modal>
      )}
    </div>
  );
};
