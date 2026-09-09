import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { RightSidebar } from '../components/dashboard/RightSidebar';
import { InviteModal } from '../components/dashboard/InviteModal';
import { AccesosTab } from '../components/dashboard/AccesosTab';
import { PerfilTab } from '../components/dashboard/PerfilTab';
import { MensajesTab } from '../components/dashboard/MensajesTab';
import { ProyectosTab } from '../components/dashboard/ProyectosTab';
import type { CuentaActiva, InvitacionSolicitud, Proyecto } from '../types/dashboard';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'proyectos' | 'mensajes' | 'accesos'>('accesos');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [cuentasActivas, setCuentasActivas] = useState<CuentaActiva[]>([]);
  const [invitacionesSolicitudes, setInvitacionesSolicitudes] = useState<InvitacionSolicitud[]>([]);

  const proyectos: Proyecto[] = [
    { id: 1, titulo: 'PROYECTO BIG DATA & ANALÍTICA', nrc: '202620-BD-01-NRC_7540', estado: 'Activo', lider: 'CESAR ERINSON CARLOS ZAMB', bg: 'from-blue-700 to-indigo-900', colorBar: 'bg-blue-600' },
    { id: 2, titulo: 'GESTIÓN CRM & PIPELINE VENTAS', nrc: '202620-CRM-02-NRC_7396', estado: 'Activo', lider: 'LEONARD DEV', bg: 'from-slate-800 to-blue-900', colorBar: 'bg-indigo-600' },
    { id: 3, titulo: 'MIGRACIÓN CLOUD AWS', nrc: '202620-AWS-03-NRC_7545', estado: 'Inactivo', lider: 'ALCIDES LLANOS NIETO', bg: 'from-slate-700 to-slate-900', colorBar: 'bg-amber-500' },
    { id: 4, titulo: 'MODELADO DE DATOS POSTGRES', nrc: '202620-BD-05-NRC_9351', estado: 'Pendiente', lider: 'JUAN JOSE LEON SUIYON', bg: 'from-amber-700 to-amber-900', colorBar: 'bg-emerald-600' },
  ];

  // Cargar cuentas activas desde Supabase
  const cargarCuentasActivas = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cuentas-activas');
      if (response.ok) {
        const data = await response.json();
        const mapeadas: CuentaActiva[] = data.map((usr: any) => ({
          id: usr.id,
          nombre: usr.nombre_completo || 'Usuario Sistema',
          cargo: usr.rol === 'ADMIN' ? 'Administrador General' : 'Especialista / Analista',
          correoNormal: usr.email,
          correoEmpresarial: usr.email,
          passwordPlana: '••••••••',
          rol: usr.rol || 'Empleado',
          proyecto: usr.modulo_interes || 'PROYECTO GENERAL',
          estado: 'Activo',
          tiempoEstado: 'hace un momento'
        }));
        setCuentasActivas(mapeadas);
      }
    } catch (error) {
      console.error('Error al cargar cuentas activas:', error);
    }
  };

  // Cargar solicitudes pendientes desde el Backend Node.js
  const cargarSolicitudesPendientes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/solicitudes-pendientes');
      if (response.ok) {
        const data = await response.json();
        
        // Mapear los datos de Supabase a la estructura de la tabla
        const mapeadas: InvitacionSolicitud[] = data.map((sol: any) => ({
          id: sol.id,
          origen: 'Solicitud',
          fase: 'Fase 2/2 (Datos Completados)',
          destinatario: sol.nombre_completo || 'Solicitante Web',
          cargo: sol.modulo_interes ? `Interés: ${sol.modulo_interes}` : 'Solicitante Acceso',
          correoEmpresarial: sol.email,
          proyecto: sol.modulo_interes || 'PROYECTO GENERAL',
          rol: sol.rol || 'Empleado',
          fechaEnviado: new Date(sol.creado_en || Date.now()).toLocaleDateString('es-ES'),
          estado: 'Pendiente Activación'
        }));

        setInvitacionesSolicitudes(mapeadas);
      }
    } catch (error) {
      console.error('Error al cargar las solicitudes del backend:', error);
    }
  };

  useEffect(() => {
    cargarSolicitudesPendientes();
    cargarCuentasActivas();
  }, []);

  const handleSendInvite = (data: {
    emailNormal: string;
    role: 'Admin' | 'Analista' | 'Empleado';
    cargo: string;
    proyecto: string;
    correoEmpresarial: string;
  }) => {
    const nuevaInv: InvitacionSolicitud = {
      id: Date.now(),
      origen: 'Invitación',
      fase: 'Fase 1/1 (Correo Enviado)',
      destinatario: 'Pendiente de Login',
      cargo: data.role === 'Admin' ? 'Administrador de Control' : data.cargo,
      correoEmpresarial: data.correoEmpresarial,
      proyecto: data.role === 'Admin' ? 'N/A (Acceso General Admin)' : data.proyecto,
      rol: data.role,
      fechaEnviado: new Date().toLocaleDateString('es-ES'),
      estado: 'Invitación Pendiente'
    };

    setInvitacionesSolicitudes([nuevaInv, ...invitacionesSolicitudes]);
    alert(`Invitación enviada automáticamente a ${data.emailNormal}`);
    setShowInviteModal(false);
  };

  // Función para aprobar solicitud y llamar a la API del backend
  const handleAprobarActivar = async (item: InvitacionSolicitud) => {
    try {
      const response = await fetch('http://localhost:3000/api/aprobar-solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          email: item.correoEmpresarial,
          nombre: item.destinatario,
          rol: item.rol
        })
      });

      if (response.ok) {
        alert(`Solicitud aprobada con éxito. Se enviaron las credenciales de correo a ${item.correoEmpresarial}`);
        // Recargar ambas listas
        cargarSolicitudesPendientes();
        cargarCuentasActivas();
      } else {
        const errData = await response.json();
        alert(`Error al aprobar: ${errData.error}`);
      }
    } catch (error) {
      console.error('Error al aprobar la solicitud:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  const handleEditarProyectoCuenta = (id: number) => {
    const nuevoProyecto = prompt("Ingrese el nuevo proyecto o área de trabajo:");
    if (nuevoProyecto) {
      setCuentasActivas(cuentasActivas.map(c => c.id === id ? { ...c, proyecto: nuevoProyecto } : c));
    }
  };

  const handleEliminarCuentaActiva = (id: number) => {
    if (confirm("¿Está seguro de revocar el acceso a este usuario?")) {
      setCuentasActivas(cuentasActivas.filter(c => c.id !== id));
    }
  };

  const handleEliminarInvitacion = (id: string | number) => {
    setInvitacionesSolicitudes(invitacionesSolicitudes.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 flex font-sans text-sm">
      <Sidebar 
        userEmail={userEmail}
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
            {activeTab === 'proyectos' && <ProyectosTab proyectos={proyectos} />}
          </main>

          <RightSidebar />
        </div>
      </div>

      {showInviteModal && (
        <InviteModal 
          proyectos={proyectos}
          onClose={() => setShowInviteModal(false)}
          onSendInvite={handleSendInvite}
        />
      )}
    </div>
  );
};