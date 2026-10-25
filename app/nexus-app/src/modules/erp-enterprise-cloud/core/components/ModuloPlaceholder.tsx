import type { ErpModulo } from '../config/navigation';

export const ModuloPlaceholder: React.FC<{ modulo: ErpModulo }> = ({ modulo }) => {
  const Icon = modulo.icon;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-teal-50 text-teal-700">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{modulo.nombre}</h2>
          <p className="text-slate-500 mt-1">{modulo.descripcion}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Qué incluye</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {modulo.contiene.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Por qué va aquí</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{modulo.justificacion}</p>
        </section>
      </div>

      <p className="text-sm text-slate-400">Este módulo se construirá en la siguiente fase.</p>
    </div>
  );
};
