import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Tarea {
  id: number;
  cliente: string;
  prioridad: string;
  accion: string;
  completada: boolean;
}

export const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loadingTareas, setLoadingTareas] = useState(true);

  // Cargar tareas iniciales
  const fetchTareas = async () => {
    setLoadingTareas(true);
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener tareas:', error.message);
    } else if (data) {
      setTareas(data);
    }
    setLoadingTareas(false);
  };

  useEffect(() => {
    fetchTareas();

    // Escuchar inserciones en tiempo real desde Supabase
    const canalRealtime = supabase
      .channel('cambios-tareas')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tareas' },
        (payload) => {
          const nuevaTarea = payload.new as Tarea;
          setTareas((prevTareas) => [nuevaTarea, ...prevTareas]);
        }
      )
      .subscribe();

    // Limpiar suscripción al desmontar el componente
    return () => {
      supabase.removeChannel(canalRealtime);
    };
  }, []);

  // Marcar tarea como realizada
  const toggleCompletada = async (id: number, estadoActual: boolean) => {
    const { error } = await supabase
      .from('tareas')
      .update({ completada: !estadoActual })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar la tarea: ' + error.message);
    } else {
      setTareas((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completada: !estadoActual } : t))
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="flex justify-between items-center pb-6 mb-8 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white">CRM Operativo (Fuerza de Ventas)</h1>
          <p className="text-slate-400 text-sm mt-1">
            Usuario: <span className="text-indigo-400 font-semibold">{user?.nombre}</span> | Cargo:{' '}
            <span className="text-emerald-400">{user?.cargo}</span>
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Cerrar Sesión
        </button>
      </header>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-white">Tareas Operativas Asignadas Hoy</h2>

        {loadingTareas ? (
          <p className="text-slate-400 text-sm">Cargando tareas...</p>
        ) : tareas.length === 0 ? (
          <p className="text-slate-400 text-sm">No hay tareas asignadas en este momento.</p>
        ) : (
          <div className="space-y-4">
            {tareas.map((t) => (
              <div
                key={t.id}
                className={`border rounded-xl p-5 flex items-center justify-between transition-colors ${
                  t.completada
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className={`font-medium ${t.completada ? 'line-through text-slate-400' : 'text-white'}`}>
                      {t.cliente}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        t.prioridad === 'Alta'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Prioridad {t.prioridad}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${t.completada ? 'line-through text-slate-500' : 'text-slate-400'}`}>
                    {t.accion}
                  </p>
                </div>

                <button
                  onClick={() => toggleCompletada(t.id, t.completada)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    t.completada
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/50'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {t.completada ? '✓ Realizada' : 'Marcar Realizada'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};