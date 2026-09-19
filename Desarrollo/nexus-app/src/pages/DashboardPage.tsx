import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { RightSidebar } from '../components/dashboard/RightSidebar';
import { InviteModal } from '../components/dashboard/InviteModal';
import { AccesosTab } from '../components/dashboard/AccesosTab';
import { PerfilTab } from '../components/dashboard/PerfilTab';
import { MensajesTab } from '../components/dashboard/MensajesTab';
import { ProyectosTab } from '../components/dashboard/ProyectosTab';
import type { CuentaActiva, InvitacionSolicitud, Proyecto } from '../types/dashboard.ts';
import { API_URL } from '../config/api';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'perfil' | 'proyectos' | 'mensajes' | 'accesos'>('accesos');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [cuentasActivas, setCuentasActivas] = useState<CuentaActiva[]>([]);
  const [invitacionesSolicitudes, setInvitacionesSolicitudes] = useState<InvitacionSolicitud[]>([]);
  
  // Estado para gestionar el rol del usuario conectado
  const [userRole, setUserRole] = useState<string>('ANALISTA');

  // Estado dinámico de proyectos para permitir su activación / desactivación
  const [proyectos, setProyectos] = useState<Proyecto[]>([
    { 
      id: 1, 
      titulo: 'PROYECTO BIG DATA & ANALÍTICA', 
      nrc: '202620-BD-01-NRC_7540', 
      estado: 'Activo', 
      lider: 'CESAR ERINSON CARLOS ZAMB', 
      bg: 'from-blue-700 to-indigo-900', 
      colorBar: 'bg-blue-600' 
    }
  ]);

  // Manejador para cambiar el estado de un proyecto (Activo, Inactivo, Pendiente)
  const handleCambiarEstadoProyecto = (id: number, nuevoEstado: 'Activo' | 'Inactivo' | 'Pendiente de activación') => {
    setProyectos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p))
    );
  };

  // Cargar datos desde el servidor y detectar el rol del usuario actual
  const cargarDatosServidor = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/solicitudes`);
      if (response.ok) {
        const data = await response.json();

        // Mapear cuentas activas
        const activasMapeadas: CuentaActiva[] = data
          .filter((usr: any) => usr.estado === 'ACTIVO')
          .map((usr: any) => ({
            id: usr.id,
            nombre: usr.nombre_completo || 'Usuario Sistema',
            cargo: usr.cargo || (usr.rol === 'ADMIN' ? 'Administrador General' : 'Especialista / Analista'),
            correoNormal: usr.email_personal || usr.email,
            correoEmpresarial: usr.email,
            passwordPlana: '••••••••',
            rol: usr.rol || 'Empleado',
            proyecto: usr.proyecto || 'PROYECTO BIG DATA & ANALÍTICA',
            estado: 'Activo',
            tiempoEstado: 'hace un momento'
          }));

        // Mapear solicitudes / invitaciones pendientes
        const solicitudesMapeadas: InvitacionSolicitud[] = data
          .filter((sol: any) => sol.estado !== 'ACTIVO')
          .map((sol: any) => ({
            id: sol.id,
            origen: sol.origen === 'INVITACION' ? 'Invitación' : 'Solicitud',
            fase: sol.fase === 3 
              ? 'Fase 3/4 (Solicitud de Activación)' 
              : sol.fase === 2 
              ? 'Fase 2/4 (Visto Bueno Gestión)' 
              : `Fase ${sol.fase || 2}/4`,
            destinatario: sol.nombre_completo || sol.email_personal || 'Solicitante Web',
            cargo: sol.cargo || 'Analista / Colaborador',
            correoPersonal: sol.email_personal || sol.email,
            correoEmpresarial: sol.email,
            proyecto: sol.proyecto || 'PROYECTO BIG DATA & ANALÍTICA',
            rol: sol.rol || 'EMPLEADO',
            fechaEnviado: sol.creado_en ? new Date(sol.creado_en).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
            estado: sol.estado,
            telefono: sol.telefono,
            direccion: sol.direccion,
            nivelEducacion: sol.nivel_educacion
          }));

        setCuentasActivas(activasMapeadas);
        setInvitacionesSolicitudes(solicitudesMapeadas);

        // Detectar el rol del usuario conectado
        const usrActual = data.find((usr: any) => 
          usr.email?.toLowerCase() === userEmail?.toLowerCase() || 
          usr.email_personal?.toLowerCase() === userEmail?.toLowerCase()
        );

        if (usrActual) {
          const rolDetectado = usrActual.rol || 'ANALISTA';
          setUserRole(rolDetectado);

          // Si NO es admin, redirigir por defecto a la pestaña 'proyectos'
          const esAdmin = ['ADMIN', 'ADMINISTRADOR', 'SUB_ADMIN'].includes(rolDetectado.toUpperCase());
          if (!esAdmin) {
            setActiveTab('proyectos');
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del backend:', error);
    }
  };

  useEffect(() => {
    cargarDatosServidor();
  }, [userEmail]);

  // Crear invitación / solicitud inicial
  const handleSendInvite = async (data: any) => {
    const emailTarget = typeof data === 'string' ? data : data.emailPersonal;
    try {
      const response = await fetch(`${API_URL}/api/solicitudes/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_personal: emailTarget,
          nombres: data.nombres || 'Invitado',
          apellidos: data.apellidos || 'Sistema',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          nivel_educacion: data.nivelEducacion || 'Técnico'
        })
      });

      if (response.ok) {
        alert(`Solicitud enviada exitosamente a ${emailTarget}`);
        setShowInviteModal(false);
        cargarDatosServidor();
      } else {
        const err = await response.json();
        alert(`Error al generar invitación: ${err.error}`);
      }
    } catch (error) {
      console.error('Error creando invitación:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  // Aprobar (Fase 2) o Activar (Fase 3/4)
  const handleAprobarActivar = async (
    item: InvitacionSolicitud, 
    datosPersonalizados?: { rol?: string; cargo?: string; proyecto?: string; emailCorporativo?: string }
  ) => {
    try {
      const estadoStr = String(item.estado || '').toUpperCase();

      if (estadoStr === 'PENDIENTE_ACTIVACION' || estadoStr === 'PRE_APROBADO' || item.fase?.includes('Fase 3/4')) {
        const response = await fetch(`${API_URL}/api/admin/activar-cuenta`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            rol: datosPersonalizados?.rol || item.rol || 'ANALISTA',
            proyecto: datosPersonalizados?.proyecto || item.proyecto || 'PROYECTO BIG DATA & ANALÍTICA',
            cargo: datosPersonalizados?.cargo || item.cargo || 'Especialista de Sistemas'
          })
        });

        const resData = await response.json();
        if (response.ok) {
          alert(resData.message || 'Cuenta activada correctamente.');
          cargarDatosServidor();
        } else {
          alert(`Error: ${resData.error}`);
        }
      } else {
        const corpEmail = datosPersonalizados?.emailCorporativo || item.correoEmpresarial;

        if (!corpEmail) {
          alert("Debes proporcionar un correo corporativo válido.");
          return;
        }

        const response = await fetch(`${API_URL}/api/admin/pre-aprobar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            email_corporativo_asignado: corpEmail.trim().toLowerCase()
          })
        });

        const resData = await response.json();
        if (response.ok) {
          alert(resData.message || 'Solicitud pre-aprobada exitosamente.');
          cargarDatosServidor();
        } else {
          alert(`Error: ${resData.error}`);
        }
      }
    } catch (error) {
      console.error('Error al aprobar/activar:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  const handleEditarProyectoCuenta = (id: number | string) => {
    const nuevoProyecto = prompt("Ingrese el nuevo proyecto o área de trabajo:", "PROYECTO BIG DATA & ANALÍTICA");
    if (nuevoProyecto) {
      setCuentasActivas(cuentasActivas.map(c => c.id === id ? { ...c, proyecto: nuevoProyecto } : c));
    }
  };

  const handleEliminarCuentaActiva = (id: number | string) => {
    if (confirm("¿Está seguro de revocar el acceso a este usuario?")) {
      setCuentasActivas(cuentasActivas.filter(c => c.id !== id));
    }
  };

  const handleEliminarInvitacion = async (id: string | number) => {
    if (!confirm("¿Desea rechazar/eliminar este registro?")) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/rechazar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        alert('Solicitud rechazada correctamente.');
        cargarDatosServidor();
      } else {
        const err = await response.json();
        alert(`Error al rechazar: ${err.error}`);
      }
    } catch (error) {
      console.error('Error al rechazar:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 flex font-sans text-sm">
      <Sidebar 
        userEmail={userEmail}
        userRole={userRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between min-h-[57px]">
          <h1 className="text-xl font-bold text-slate-800 capitalize">
            {activeTab === 'perfil' && 'Perfil de Usuario'}
            {activeTab === 'proyectos' && 'Proyectos'}
            {activeTab === 'mensajes' && 'Mensajes e Informes de Proyectos'}
            {activeTab === 'accesos' && 'Gestión Unificada de Accesos e Invitaciones'}
          </h1>
          
          {activeTab === 'accesos' && (
            <button 
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-2 bg-[#0056d2] text-white rounded-md text-xs font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Generar Nueva Invitación / Cargo</span>
            </button>
          )}
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeTab === 'accesos' && (
              <AccesosTab 
                cuentasActivas={cuentasActivas}
                invitacionesSolicitudes={invitacionesSolicitudes}
                onOpenInviteModal={() => setShowInviteModal(true)}
                onAprobarActivar={handleAprobarActivar}
                onEditarProyectoCuenta={handleEditarProyectoCuenta}
                onEliminarCuentaActiva={handleEliminarCuentaActiva}
                onEliminarInvitacion={handleEliminarInvitacion}
              />
            )}

            {activeTab === 'perfil' && <PerfilTab userEmail={userEmail} />}
            {activeTab === 'mensajes' && <MensajesTab />}
            {activeTab === 'proyectos' && (
              <ProyectosTab 
                proyectos={proyectos} 
                userRole={userRole}
                onCambiarEstadoProyecto={handleCambiarEstadoProyecto}
                onSelectProyecto={(id) => {
                  if (id === 1) {
                    navigate('/big-data');
                  }
                }}
              />
            )}
          </main>

          <RightSidebar />
        </div>
      </div>

      {showInviteModal && (
        <InviteModal 
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSendInvite={handleSendInvite}
        />
      )}
    </div>
  );
};