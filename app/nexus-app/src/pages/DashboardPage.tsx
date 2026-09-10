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

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

const API_BASE = 'https://proyecto-de-big-data-y-an-lisis-de-datos.onrender.com/api';


export const DashboardPage: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  const navigate = useNavigate();
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

  // 1. Cargar cuentas activas desde Supabase / Backend
  const cargarCuentasActivas = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cuentas-activas`);
      if (response.ok) {
        const data = await response.json();
        const mapeadas: CuentaActiva[] = data.map((usr: any) => ({
          id: usr.id,
          nombre: usr.nombre_completo || 'Usuario Sistema',
          cargo: usr.rol === 'ADMIN' ? 'Administrador General' : 'Especialista / Analista',
          correoNormal: usr.email_personal || usr.email,
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

  // 2. Cargar solicitudes e invitaciones pendientes
  const cargarSolicitudesPendientes = async () => {
    try {
      const response = await fetch(`${API_BASE}/solicitudes-pendientes`);
      if (response.ok) {
        const data = await response.json();
        
        const solicitudesMapeadas: InvitacionSolicitud[] = (data.solicitudes || []).map((sol: any) => ({
          id: sol.id,
          origen: 'Solicitud',
          fase: sol.fase === 3 
            ? 'Fase 3/4 (Solicitud de Activación)' 
            : sol.fase === 2 
            ? 'Fase 2/4 (Visto Bueno Gestión)' 
            : `Fase ${sol.fase || 2}/4`,
          destinatario: sol.nombre_completo || 'Solicitante Web',
          cargo: sol.modulo_interes ? `Interés: ${sol.modulo_interes}` : 'Solicitante Acceso',
          correoEmpresarial: sol.email,
          proyecto: sol.modulo_interes || 'PROYECTO GENERAL',
          rol: sol.rol || 'EMPLEADO',
          fechaEnviado: sol.creado_en ? new Date(sol.creado_en).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
          estado: sol.estado
        }));

        const invitacionesMapeadas: InvitacionSolicitud[] = (data.invitaciones || []).map((inv: any) => ({
          id: inv.id,
          origen: 'Invitación',
          fase: inv.estado === 'DATOS_COMPLETADOS' 
            ? 'Fase 2/3 (Datos Completados por Usuario)' 
            : 'Fase 1/3 (Correo Enviado al Empleado)',
          destinatario: inv.email_personal || 'Empleado Invitado',
          cargo: inv.cargo || 'Analista / Colaborador',
          correoEmpresarial: inv.email_empresarial,
          proyecto: inv.proyecto || 'PROYECTO GENERAL',
          rol: inv.rol || 'EMPLEADO',
          fechaEnviado: inv.creado_en ? new Date(inv.creado_en).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
          estado: inv.estado
        }));

        setInvitacionesSolicitudes([...solicitudesMapeadas, ...invitacionesMapeadas]);
      }
    } catch (error) {
      console.error('Error al cargar las solicitudes del backend:', error);
    }
  };

  useEffect(() => {
    cargarSolicitudesPendientes();
    cargarCuentasActivas();
  }, []);

  // 3. Crear invitación (Fase 1 Invitación - Flujo 2)
  const handleSendInvite = async (data: any) => {
    const emailTarget = typeof data === 'string' ? data : data.emailPersonal;
    try {
      const response = await fetch(`${API_BASE}/api/crear-invitacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_personal: emailTarget,
          rol: data.rol,
          cargo: data.cargo,
          proyecto: data.proyecto
        })
      });

      if (response.ok) {
        alert(`Invitación enviada exitosamente a ${emailTarget}`);
        setShowInviteModal(false);
        cargarSolicitudesPendientes();
      } else {
        const err = await response.json();
        alert(`Error al generar invitación: ${err.error}`);
      }
    } catch (error) {
      console.error('Error creando invitación:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  // 4. Aprobar o Activar registros
  const handleAprobarActivar = async (item: InvitacionSolicitud) => {
    try {
      const estadoStr = String(item.estado || '').toUpperCase();
      const faseStr = String(item.fase || '');

      const esSolicitudActivacion = estadoStr === 'PENDIENTE_ACTIVACION' || faseStr.includes('Fase 3/4');

      const origenDinamico = item.origen === 'Invitación'
        ? 'INVITACION'
        : esSolicitudActivacion
        ? 'SOLICITUD_ACTIVACION'
        : 'SOLICITUD_FASE_2';

      const response = await fetch(`${API_BASE}/api/aprobar-solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          email: item.correoEmpresarial,
          correoEmpresarial: item.correoEmpresarial,
          nombre: item.destinatario,
          rol: item.rol,
          proyecto: item.proyecto,
          origen: origenDinamico
        })
      });

      if (response.ok) {
        const resData = await response.json();
        alert(resData.message);
        cargarSolicitudesPendientes();
        cargarCuentasActivas();
      } else {
        const err = await response.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error('Error al aprobar:', error);
    }
  };

  const handleEditarProyectoCuenta = (id: number | string) => {
    const nuevoProyecto = prompt("Ingrese el nuevo proyecto o área de trabajo:");
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

    const item = invitacionesSolicitudes.find(i => i.id === id);
    if (!item) return;

    try {
      const response = await fetch(`${API_BASE}/api/rechazar-solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          origen: item.origen === 'Invitación' ? 'INVITACION' : 'SOLICITUD',
          motivo: 'Rechazado desde el panel de administración.'
        })
      });

      if (response.ok) {
        setInvitacionesSolicitudes(invitacionesSolicitudes.filter(i => i.id !== id));
      } else {
        const err = await response.json();
        alert(`Error al rechazar: ${err.error}`);
      }
    } catch (error) {
      console.error('Error al rechazar:', error);
    }
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
            {activeTab === 'proyectos' && (
              <ProyectosTab 
                proyectos={proyectos} 
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