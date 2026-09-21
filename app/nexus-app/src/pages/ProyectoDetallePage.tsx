import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Folder, LayoutDashboard, Database, FileText } from 'lucide-react';
import { API_URL } from '../config/api';

interface Proyecto {
  id: number | string; // Permite tanto números como UUIDs
  codigo_nrc: string;
  titulo: string;
  lider_nombre: string;
  estado: string;
}

export const ProyectoDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    const obtenerProyecto = async () => {
      try {
        setCargando(true);
        const res = await fetch(`${API_URL}/api/proyectos`);
        if (!res.ok) throw new Error('Error al cargar proyectos');
        const data: Proyecto[] = await res.json();
        
        // Comparación segura convirtiendo ambos valores a String
        const encontrado = data.find((p) => String(p.id).toLowerCase() === String(id).toLowerCase());
        setProyecto(encontrado || null);
      } catch (error) {
        console.error('Error al obtener el proyecto:', error);
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      obtenerProyecto();
    }
  }, [id]);

  if (cargando) {
    return <div className="p-8 text-gray-500">Cargando dashboard del proyecto...</div>;
  }

  if (!proyecto) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-red-500 font-semibold">Proyecto no encontrado.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-6">
      {/* Botón de regreso */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a Proyectos
      </button>

      {/* Encabezado del Proyecto */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md uppercase tracking-wide">
            {proyecto.codigo_nrc}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2 uppercase">{proyecto.titulo}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Líder a cargo: <strong className="text-gray-700">{proyecto.lider_nombre}</strong>
          </p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-green-100 text-green-700">
          ✓ {proyecto.estado}
        </span>
      </div>

      {/* Grid de Previsualización del Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Estructura</p>
            <p className="text-lg font-bold text-gray-800">
              /src/modules/{proyecto.titulo.toLowerCase().replace(/\s+/g, '-')}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Base de Datos</p>
            <p className="text-lg font-bold text-gray-800">Conectado (MySQL)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Reportes & Analítica</p>
            <p className="text-lg font-bold text-gray-800">0 Archivos cargados</p>
          </div>
        </div>
      </div>

      {/* Panel principal de previsualización */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-blue-600" />
          Módulo de Trabajo en Desarrollo
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Este es el espacio de previsualización para el proyecto <strong>{proyecto.titulo}</strong>. Las métricas, tablas de datos y componentes específicos de este módulo se cargarán aquí dinámicamente.
        </p>
      </div>
    </div>
  );
};