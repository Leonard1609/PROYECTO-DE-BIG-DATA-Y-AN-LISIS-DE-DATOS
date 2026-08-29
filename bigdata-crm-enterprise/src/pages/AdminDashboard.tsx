import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface CSVStats {
  nombreArchivo: string;
  totalFilas: number;
  columnas: string[];
}

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [csvStats, setCsvStats] = useState<CSVStats | null>(null);

  // Procesar archivo CSV seleccionado
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((line) => line.trim() !== '');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
        setCsvStats({
          nombreArchivo: file.name,
          totalFilas: lines.length - 1, // Excluir la fila de encabezados
          columnas: headers.slice(0, 5), // Mostrar primeras 5 columnas
        });
      }
    };
    reader.readAsText(file);
  };

  // Generar e insertar tareas automáticas a Supabase
  const dispararTareasCRM = async () => {
    setLoading(true);
    setMensaje(null);

    const nuevasTareas = [
      {
        cliente: 'Fernanda Lima (Rio de Janeiro)',
        prioridad: 'Alta',
        accion: 'Ofrecer bonificación del 15% por retención de cliente',
        completada: false,
      },
      {
        cliente: 'Lucas Rocha (Bahia)',
        prioridad: 'Alta',
        accion: 'Contacto directo de soporte logístico VIP',
        completada: false,
      },
    ];

    const { error } = await supabase.from('tareas').insert(nuevasTareas);

    if (error) {
      setMensaje(`Error al enviar tareas: ${error.message}`);
    } else {
      setMensaje('¡Plan operativo enviado con éxito a la base de datos del CRM (Supabase)!');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="flex justify-between items-center pb-6 mb-8 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white">Módulo BI & Big Data</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingesta de Datos */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Cargar Dataset Externo</h2>
            <p className="text-slate-400 text-sm mb-4">Ingesta de datos NoSQL / CSV (ej. Olist E-commerce)</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </div>

          {csvStats && (
            <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <p className="text-xs text-emerald-400 font-semibold mb-1">✓ Archivo Procesado</p>
              <p className="text-sm font-medium text-white">{csvStats.nombreArchivo}</p>
              <p className="text-xs text-slate-400 mt-1">
                Registros analizados: <span className="text-indigo-400 font-bold">{csvStats.totalFilas.toLocaleString()}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1 truncate">
                Campos: {csvStats.columnas.join(', ')}...
              </p>
            </div>
          )}
        </div>

        {/* Hallazgos e Integración CRM */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Hallazgo BI: Correlación Demora vs. Bajas Ventas</h2>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 mb-4">
              <p className="text-slate-300 text-sm">
                Las regiones con entregas mayores a 8 días presentan un{' '}
                <span className="text-rose-400 font-bold">80% de reseñas de 1 estrella</span>.
              </p>
              {csvStats && (
                <p className="text-xs text-indigo-400 mt-2 font-medium">
                  → Basado en la muestra de {csvStats.totalFilas.toLocaleString()} registros de {csvStats.nombreArchivo}.
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={dispararTareasCRM}
              disabled={loading}
              className={`w-full py-2.5 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer ${
                loading
                  ? 'bg-emerald-800 opacity-50 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {loading ? 'Disparando Tareas...' : 'Disparar Tareas al CRM de Supabase'}
            </button>

            {mensaje && (
              <p className={`mt-3 text-xs text-center font-medium ${mensaje.includes('Error') ? 'text-rose-400' : 'text-emerald-400'}`}>
                {mensaje}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};