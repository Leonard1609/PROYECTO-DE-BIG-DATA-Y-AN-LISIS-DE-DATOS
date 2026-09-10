import React, { useState, useEffect } from 'react';
import { LogOut, Users, Key, RefreshCw } from 'lucide-react';
import { SolicitudesTable } from './SolicitudesTable';

interface DashboardProps {
  userEmail?: string;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'usuarios' | 'solicitudes'>('solicitudes');

  // 1. Fetch de Solicitudes Pendientes desde Express + Supabase
  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/solicitudes-pendientes');
      if (response.ok) {
        const data = await response.json();
        setSolicitudes(data);
      } else {
        console.error("Error al obtener solicitudes pendientes.");
      }
    } catch (error) {
      console.error("Error de conexión con la API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  // 2. Handler para Aprobar Solicitud
  const handleAprobarSolicitud = async (solicitud: any) => {
    try {
      const response = await fetch('http://localhost:3000/aprobar-solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: solicitud.id,
          rolAsignado: 'ANALISTA' // O el rol dinámico asignado en tu UI
        })
      });

      const resData = await response.json();

      if (response.ok) {
        alert(resData.message || "Usuario activado exitosamente.");
        cargarSolicitudes(); // Recargar la tabla
      } else {
        alert(`Error: ${resData.error}`);
      }
    } catch (error) {
      console.error("Error al aprobar:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  // 3. Handler para Rechazar Solicitud
  const handleRechazarSolicitud = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas rechazar esta solicitud?")) return;

    try {
      const response = await fetch('http://localhost:3000/rechazar-solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        alert("Solicitud rechazada.");
        cargarSolicitudes();
      } else {
        alert("Error al rechazar la solicitud.");
      }
    } catch (error) {
      console.error("Error al rechazar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header Top Navigation */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Key className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-wide">Panel de Administración de Accesos</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {userEmail || 'admin@empresa.com'}
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Navigation Tabs and Refresh */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('solicitudes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'solicitudes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users size={16} />
              Solicitudes Pendientes
            </button>
          </div>

          <button
            onClick={cargarSolicitudes}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">Cargando datos desde Supabase...</div>
        ) : (
          <SolicitudesTable
            solicitudes={solicitudes}
            onAprobar={handleAprobarSolicitud}
            onRechazar={handleRechazarSolicitud}
          />
        )}
      </main>
    </div>
  );
};