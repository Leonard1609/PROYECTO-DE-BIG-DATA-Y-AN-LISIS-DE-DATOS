const ESTILOS: Record<string, string> = {
  Activo: 'bg-emerald-50 text-emerald-700',
  Inactivo: 'bg-slate-100 text-slate-500',
};

export const Insignia: React.FC<{ texto: string }> = ({ texto }) => (
  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ESTILOS[texto] ?? 'bg-slate-100 text-slate-600'}`}>
    {texto}
  </span>
);
