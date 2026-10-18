import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useErp } from '../../../core/hooks/useErp';
import { ruta } from '../../../core/config/navigation';
import { faltantesDocumento, filasOrdenesVenta } from '../../../core/utils/filas';
import { AvisoFlujo, type Aviso } from '../../../core/components/AvisoFlujo';
import { Modal } from '../../../core/components/Modal';
import { FormularioOperacion } from '../../../core/components/operaciones/FormularioOperacion';
import { ListaDocumentos } from '../../../core/components/operaciones/ListaDocumentos';

export const OrdenesVentaPage: React.FC = () => {
  const { state, acciones } = useErp();
  const [creando, setCreando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-slate-500 max-w-2xl">
        La orden de venta compromete la venta. Nace al aceptar una cotización o se registra directamente, y se factura en el siguiente paso.
      </p>

      {aviso && <AvisoFlujo aviso={aviso} onCerrar={() => setAviso(null)} />}

      <ListaDocumentos
        documento={{ articulo: 'una', singular: 'orden de venta', plural: 'órdenes de venta', tituloDetalle: 'Orden de venta' }}
        etiquetaTercero="Cliente"
        etiquetaEstado="Estado"
        filas={filasOrdenesVenta(state)}
        estadosPendientes={['Pendiente']}
        etiquetaPendientes="Por facturar"
        nuevo={{ texto: 'Nueva orden de venta', onClick: () => { setAviso(null); setCreando(true); }, faltantes: faltantesDocumento(state, 'venta') }}
        accionFila={(f) => f.estado === 'Pendiente' ? (
          <Link to={ruta('ventas', 'facturacion')}
            className="px-3 py-1.5 rounded-lg text-sm text-teal-700 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
            Ir a facturar
          </Link>
        ) : null}
        vacio="Registra una orden de venta, o acepta una cotización para generarla."
      />

      {creando && (
        <Modal titulo="Nueva orden de venta" onCerrar={() => setCreando(false)}>
          <FormularioOperacion
            modo="orden-venta"
            state={state}
            onGuardar={(d) => acciones.registrarOrdenVenta({ clienteId: d.terceroId, vendedorId: d.vendedorId, almacenId: d.almacenId, condicion: d.condicion, detalle: d.detalle })}
            onExito={() => {
              setCreando(false);
              setAviso({ ok: true, texto: 'Orden de venta registrada. Siguiente paso: emitir su factura.', siguiente: { to: ruta('ventas', 'facturacion'), texto: 'Ir a Facturación' } });
            }}
            onCancelar={() => setCreando(false)}
          />
        </Modal>
      )}
    </div>
  );
};
