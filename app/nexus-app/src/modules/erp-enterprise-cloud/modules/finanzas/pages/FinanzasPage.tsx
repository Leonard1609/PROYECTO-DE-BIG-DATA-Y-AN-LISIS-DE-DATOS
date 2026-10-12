import { useState } from 'react';
import { Pestanas } from '../../../core/components/Pestanas';
import { CuentasTab } from '../components/CuentasTab';
import { CajaTab } from '../components/CajaTab';

type Vista = 'cobrar' | 'pagar' | 'caja';

export const FinanzasPage: React.FC = () => {
  const [vista, setVista] = useState<Vista>('cobrar');

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-slate-500 max-w-2xl">
        Las ventas y compras a crédito generan cuentas. Al contado, el dinero va directo a Caja. Aquí se cobran y pagan.
      </p>
      <Pestanas<Vista>
        etiqueta="Finanzas"
        pestanas={[
          { id: 'cobrar', titulo: 'Por cobrar' },
          { id: 'pagar', titulo: 'Por pagar' },
          { id: 'caja', titulo: 'Caja' },
        ]}
        activa={vista}
        onCambiar={setVista}
      />
      {vista === 'cobrar' && <CuentasTab tipo="Cobrar" />}
      {vista === 'pagar' && <CuentasTab tipo="Pagar" />}
      {vista === 'caja' && <CajaTab />}
    </div>
  );
};
