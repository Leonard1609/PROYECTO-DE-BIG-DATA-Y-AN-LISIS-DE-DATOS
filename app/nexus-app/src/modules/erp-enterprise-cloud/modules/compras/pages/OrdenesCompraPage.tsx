import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useErp } from '../../../core/hooks/useErp';
import { ruta } from '../../../core/config/navigation';
import { faltantesDocumento, filasOrdenesCompra } from '../../../core/utils/filas';
import { AvisoFlujo, type Aviso } from '../../../core/components/AvisoFlujo';
import { Modal } from '../../../core/components/Modal';
import { FormularioOperacion } from '../../../core/components/operaciones/FormularioOperacion';
import { ListaDocumentos } from '../../../core/components/operaciones/ListaDocumentos';

export const OrdenesCompraPage: React.FC = () => {
  const { state, acciones } = useErp();
  const [creando, setCreando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-slate-500 max-w-2xl">
        La orden de compra es el pedido al proveedor. No mueve stock todavía: eso ocurre cuando la mercadería llega y se recibe en Kardex.
      </p>

      {aviso && <AvisoFlujo aviso={aviso} onCerrar={() => setAviso(null)} />}

      <ListaDocumentos
        documento={{ articulo: 'una', singular: 'orden de compra', plural: 'órdenes de compra', tituloDetalle: 'Orden de compra' }}
        etiquetaTercero="Proveedor"
        etiquetaEstado="Estado"
        filas={filasOrdenesCompra(state)}
        estadosPendientes={['Pendiente']}
        etiquetaPendientes="Por recibir"
        nuevo={{ texto: 'Nueva orden de compra', onClick: () => { setAviso(null); setCreando(true); }, faltantes: faltantesDocumento(state, 'compra') }}
        accionFila={(f) => f.estado === 'Pendiente' ? (
          <Link to={ruta('compras', 'kardex')}
            className="px-3 py-1.5 rounded-lg text-sm text-teal-700 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
            Ir a Kardex
          </Link>
        ) : null}
        vacio="Registra una orden de compra o amplía el rango de fechas."
      />

      {creando && (
        <Modal titulo="Nueva orden de compra" onCerrar={() => setCreando(false)}>
          <FormularioOperacion
            modo="orden-compra"
            state={state}
            onGuardar={(d) => acciones.registrarOrdenCompra({ proveedorId: d.terceroId, almacenId: d.almacenId, condicion: d.condicion, detalle: d.detalle })}
            onExito={() => {
              setCreando(false);
              setAviso({ ok: true, texto: 'Orden de compra registrada. Siguiente paso: recibirla en Kardex cuando llegue la mercadería.', siguiente: { to: ruta('compras', 'kardex'), texto: 'Ir a Kardex' } });
            }}
            onCancelar={() => setCreando(false)}
          />
        </Modal>
      )}
    </div>
  );
};
