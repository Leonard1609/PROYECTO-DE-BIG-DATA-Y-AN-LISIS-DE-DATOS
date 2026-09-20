import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Interfaz amplia de Proyecto para soportar backend y datos de DashboardPage
export interface Proyecto {
  id: number;
  codigo_nrc?: string;
  nrc?: string;
  titulo: string;
  lider_nombre?: string;
  lider?: string;
  estado: 'Activo' | 'Suspendido' | 'Cerrado' | 'Eliminado' | 'Inactivo' | 'Pendiente de activación' | string;
  bg_gradient?: string;
  bg?: string;
  colorBar?: string;
}

// 2. Interfaz de Props ajustada con todos los callbacks de DashboardPage
export interface ProyectosTabProps {
  esAdmin?: boolean;
  userRole?: string;
  proyectos?: Proyecto[];
  onCambiarEstadoProyecto?: (id: number, nuevoEstado: 'Activo' | 'Inactivo' | 'Pendiente de activación') => void;
  onSelectProyecto?: (id: number) => void;
}

export const ProyectosTab: React.FC<ProyectosTabProps> = ({
  esAdmin,
  userRole,
  proyectos: proyectosProp,
  onCambiarEstadoProyecto,
  onSelectProyecto,
}) => {
  // Determina si el usuario tiene rol administrativo
  const esAdminCalculado =
    esAdmin !== undefined
      ? esAdmin
      : userRole
      ? ['ADMIN', 'ADMINISTRADOR', 'SUB_ADMIN'].includes(userRole.toUpperCase())
      : true;

  const [proyectosLocales, setProyectosLocales] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState<boolean>(!proyectosProp);
  const [error, setError] = useState<string | null>(null);

  // Estados para el Modal de Crear Proyecto
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [nuevoTitulo, setNuevoTitulo] = useState<string>('');
  const [nuevoLider, setNuevoLider] = useState<string>('');
  const [guardando, setGuardando] = useState<boolean>(false);

  const navigate = useNavigate();
  const API_URL = 'http://localhost:3006/api/proyectos';

  // Cargar proyectos desde la API backend si no se reciben por props
  const cargarProyectos = async () => {
    try {
      setCargando(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error al consultar proyectos');
      const data = await res.json();
      setProyectosLocales(data);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!proyectosProp || proyectosProp.length === 0) {
      cargarProyectos();
    } else {
      setCargando(false);
    }
  }, [proyectosProp]);

  // Selección de lista de proyectos
  const proyectosAMostrar =
    proyectosProp && proyectosProp.length > 0 ? proyectosProp : proyectosLocales;

  // Crear Proyecto (se guarda en BD y recarga lista)
  const handleCrearProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return;

    try {
      setGuardando(true);
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: nuevoTitulo,
          lider_nombre: nuevoLider || 'Sin Asignar',
        }),
      });

      if (!res.ok) throw new Error('Error al crear proyecto');

      setNuevoTitulo('');
      setNuevoLider('');
      setModalAbierto(false);
      cargarProyectos();
    } catch (err: any) {
      alert(err.message || 'No se pudo crear el proyecto');
    } finally {
      setGuardando(false);
    }
  };

  // Cambiar Estado del Proyecto
  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    if (onCambiarEstadoProyecto) {
      onCambiarEstadoProyecto(
        id,
        nuevoEstado as 'Activo' | 'Inactivo' | 'Pendiente de activación'
      );
    }

    try {
      const res = await fetch(`${API_URL}/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        cargarProyectos();
      }
    } catch (err) {
      // Ignora fallo silencioso si solo se maneja por estado local
    }
  };

  // Eliminación Definitiva (Solo Admin)
  const handleEliminarDefinitivo = async (id: number) => {
    if (
      !window.confirm(
        '¿Estás seguro de eliminar definitivamente este proyecto? Esta acción no se puede deshacer.'
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      cargarProyectos();
    } catch (err: any) {
      alert(err.message || 'No se pudo eliminar');
    }
  };

  // Manejar click de redirección / selección
  const handleAccederProyecto = (id: number) => {
    if (onSelectProyecto) {
      onSelectProyecto(id);
    } else {
      navigate(`/proyectos/${id}`);
    }
  };

  if (cargando) return <div className="p-6 text-gray-500">Cargando proyectos...</div>;
  if (error && proyectosAMostrar.length === 0)
    return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Proyectos Asignados</h2>
        {esAdminCalculado && (
          <button
            onClick={() => setModalAbierto(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Nuevo Proyecto
          </button>
        )}
      </div>

      {/* Grid de Tarjetas de Proyecto */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proyectosAMostrar.map((prj) => {
          const codigoNRC = prj.codigo_nrc || prj.nrc || 'SIN-NRC';
          const liderNombre = prj.lider_nombre || prj.lider || 'Sin Asignar';
          const bgClass = prj.bg_gradient || prj.bg || 'from-blue-700 to-indigo-900';

          return (
            <div
              key={prj.id}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col justify-between"
            >
              {/* Cabecera de la Tarjeta */}
              <div className={`p-5 bg-gradient-to-r ${bgClass} text-white`}>
                <span className="inline-block bg-black/30 text-xs font-semibold px-2.5 py-1 rounded-md mb-2">
                  {codigoNRC}
                </span>
                <h3 className="text-lg font-bold tracking-wide uppercase">{prj.titulo}</h3>
              </div>

              {/* Cuerpo de la Tarjeta */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        prj.estado === 'Activo'
                          ? 'bg-green-100 text-green-700'
                          : prj.estado === 'Suspendido' || prj.estado === 'Inactivo'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      ✓ {prj.estado}
                    </span>

                    {/* Selector de Estado */}
                    {esAdminCalculado && (
                      <select
                        value={prj.estado}
                        onChange={(e) => handleCambiarEstado(prj.id, e.target.value)}
                        className="text-xs border rounded-lg p-1 bg-gray-50 font-medium"
                      >
                        <option value="Activo">🟢 Activo</option>
                        <option value="Inactivo">🟡 Inactivo</option>
                        <option value="Suspendido">🟡 Suspendido</option>
                        <option value="Pendiente de activación">🟠 Pendiente</option>
                        <option value="Cerrado">🔴 Cerrado</option>
                        <option value="Eliminado">🗑️ Ocultar (Soft Delete)</option>
                      </select>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    <p className="text-xs uppercase font-semibold text-gray-400">
                      Líder de Proyecto
                    </p>
                    <p className="font-semibold text-gray-800">{liderNombre}</p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => handleAccederProyecto(prj.id)}
                    className="w-full text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-xl transition flex items-center justify-center gap-2"
                  >
                    Acceder al proyecto <span>→</span>
                  </button>

                  {esAdminCalculado && (
                    <button
                      onClick={() => handleEliminarDefinitivo(prj.id)}
                      title="Eliminar Definitivamente de BD"
                      className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg text-xs"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Crear Proyecto */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Crear Nuevo Proyecto</h3>
            <form onSubmit={handleCrearProyecto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. PROYECTO BIG DATA & ANALÍTICA"
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Líder del Proyecto
                </label>
                <input
                  type="text"
                  placeholder="Ej. CESAR ERINSON CARLOS"
                  value={nuevoLider}
                  onChange={(e) => setNuevoLider(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                ℹ️ El código NRC se generará automáticamente en el servidor al guardar.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
                >
                  {guardando ? 'Guardando...' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};