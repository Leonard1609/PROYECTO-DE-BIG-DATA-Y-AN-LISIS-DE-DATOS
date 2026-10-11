import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useErp } from '../../../core/hooks/useErp';
import { stockDe } from '../../../core/services/erpStore';
import { ERP_BASE } from '../../../core/config/navigation';
import { formatFechaHora, formatMoneda } from '../../../core/utils/format';
import { Indicador } from '../../../core/components/Indicador';
import { Insignia } from '../../../core/components/Insignia';

interface Alerta { clave: string; texto: string; ruta: string; critica: boolean }

const suma = (nums: number[]): number => nums.reduce((a, n) => a + n, 0);

export const DashboardPage: React.FC = () => {
  const { state } = useErp();
  const hoy = new Date().toISOString();

  const ventas = state.ventas.filter((v) => v.estado === 'Emitida');
  const compras = state.compras.filter((c) => c.estado === 'Recibida');
  const totalVentas = suma(ventas.map((v) => v.total));
  const totalCompras = suma(compras.map((c) => c.total));
  const utilidad = suma(ventas.flatMap((v) => v.detalle.map((l) => {
    const costo = state.productos.find((p) => p.id === l.productoId)?.precioCompra ?? l.precioUnitario;
    return l.cantidad * (l.precioUnitario - costo);
  })));

  const ingresos = suma(state.caja.filter((m) => m.tipo === 'Ingreso').map((m) => m.monto));
  const egresos = suma(state.caja.filter((m) => m.tipo === 'Egreso').map((m) => m.monto));
  const pendientes = state.cuentas.filter((c) => c.estado === 'Pendiente');
  const porCobrar = suma(pendientes.filter((c) => c.tipo === 'Cobrar').map((c) => c.saldo));
  const porPagar = suma(pendientes.filter((c) => c.tipo === 'Pagar').map((c) => c.saldo));

  const alertas: Alerta[] = [];
  for (const p of state.productos) {
    for (const a of state.almacenes) {
      const stock = stockDe(state.movimientos, p.id, a.id);
      if (stock <= p.stockMinimo) {
        alertas.push({
          clave: `stock-${p.id}-${a.id}`, ruta: 'inventario', critica: stock === 0,
          texto: `${p.nombre} en ${a.nombre}: ${stock === 0 ? 'sin stock' : `stock bajo (${stock}, mínimo ${p.stockMinimo})`}`,
        });
      }
    }
  }
  for (const c of pendientes.filter((x) => x.vencimiento < hoy)) {
    alertas.push({
      clave: `venc-${c.id}`, ruta: 'finanzas', critica: true,
      texto: `Cuenta por ${c.tipo === 'Cobrar' ? 'cobrar' : 'pagar'} vencida: ${c.documentoNumero}`,
    });
  }

  const pasos = [
    { texto: 'Datos maestros registrados', hecho: [state.clientes, state.proveedores, state.productos, state.almacenes, state.vendedores].every((l) => l.length > 0), ruta: 'mantenimiento' },
    { texto: 'Compra registrada (entra stock)', hecho: state.compras.length > 0, ruta: 'compras' },
    { texto: 'Venta registrada (sale stock)', hecho: state.ventas.length > 0, ruta: 'comercial' },
    { texto: 'Comprobantes archivados', hecho: state.documentos.length > 0, ruta: 'documentos' },
  ];

  const actividad = state.auditoria.slice().reverse().slice(0, 6);

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-slate-500 max-w-2xl">
        Resumen de lo que producen los demás módulos. Aquí no se registra nada: cada cifra viene de Comercial, Compras, Inventario y Finanzas.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Indicador titulo="Ventas" valor={formatMoneda(totalVentas)} nota={`${ventas.length} emitidas, IGV incluido`} />
        <Indicador titulo="Compras" valor={formatMoneda(totalCompras)} nota={`${compras.length} recibidas, IGV incluido`} />
        <Indicador titulo="Utilidad bruta" valor={formatMoneda(utilidad)} nota="Ventas sin IGV menos costo de lo vendido" />
        <Indicador titulo="Saldo de caja" valor={formatMoneda(ingresos - egresos)} nota="Ingresos menos egresos" />
        <Indicador titulo="Por cobrar" valor={formatMoneda(porCobrar)} nota="Saldo pendiente de clientes" />
        <Indicador titulo="Por pagar" valor={formatMoneda(porPagar)} nota="Saldo pendiente a proveedores" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Alertas</h2>
          {alertas.length === 0 ? (
            <p className="text-sm text-slate-500">Sin alertas. El stock y las cuentas están en orden.</p>
          ) : (
            <ul className="space-y-2">
              {alertas.map((a) => (
                <li key={a.clave} className="flex items-start gap-2 text-sm">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${a.critica ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <span className="text-slate-700">
                    {a.texto}{' '}
                    <Link to={`${ERP_BASE}/${a.ruta}`} className="text-teal-700 underline">Ver</Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Recorrido del sistema</h2>
          <ul className="space-y-2">
            {pasos.map((p) => (
              <li key={p.texto} className="flex items-center gap-3 text-sm">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${p.hecho ? 'bg-teal-600 text-white' : 'border border-slate-300'}`}>
                  {p.hecho && <Check className="w-3 h-3" />}
                </span>
                <Link to={`${ERP_BASE}/${p.ruta}`} className={p.hecho ? 'text-slate-700' : 'text-slate-500 hover:text-slate-800'}>
                  {p.texto}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-semibold text-slate-900 mb-3">Actividad reciente</h2>
        {actividad.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no hay actividad registrada.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {actividad.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span className="text-slate-700">{e.modulo}: {e.accion} <span className="text-slate-400">({e.registroId})</span></span>
                <span className="flex items-center gap-3">
                  <Insignia texto={e.resultado} />
                  <span className="text-xs text-slate-400">{formatFechaHora(e.fecha)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
