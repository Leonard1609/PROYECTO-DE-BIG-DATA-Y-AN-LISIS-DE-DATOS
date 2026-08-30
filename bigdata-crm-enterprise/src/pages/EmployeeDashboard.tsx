import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Tarea {
  id: number;
  cliente: string;
  prioridad: string;
  accion: string;
  completada: boolean;
}

export const EmployeeDashboard: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('tareas').select('*').order('created_at', { ascending: false });
      if (data) setTareas(data);
      setLoading(false);
    };
    void load();
    const canal = supabase
      .channel('tareas-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tareas' }, (p) => {
        setTareas((prev) => [p.new as Tarea, ...prev]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const marcar = async (id: number, hecha: boolean) => {
    await supabase.from('tareas').update({ completada: !hecha }).eq('id', id);
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, completada: !hecha } : t)));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-4xl font-extrabold text-white">Tareas</h1>
        <p className="text-slate-400 mt-2">Lo que el administrador pasa desde Inicio.</p>
      </div>
      {loading ? (
        <p className="text-slate-500 text-sm">Cargando…</p>
      ) : tareas.length === 0 ? (
        <div className="nx-card p-10 text-center text-slate-500">Nada pendiente.</div>
      ) : (
        <div className="space-y-3">
          {tareas.map((t) => (
            <div key={t.id} className={`nx-card p-5 flex items-center justify-between ${t.completada ? 'opacity-40' : ''}`}>
              <div>
                <p className={`font-medium ${t.completada ? 'line-through text-slate-500' : 'text-white'}`}>{t.cliente}</p>
                <p className="text-sm text-slate-400 mt-1">{t.accion}</p>
              </div>
              <button type="button" className="nx-btn" onClick={() => void marcar(t.id, t.completada)}>
                {t.completada ? 'Hecha' : 'Hecho'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
