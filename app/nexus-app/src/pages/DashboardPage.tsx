import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserPlus, Menu, X } from 'lucide-react';
import { Sidebar } from '../shared/components/dashboard/Sidebar';
import { RightSidebar } from '../shared/components/dashboard/RightSidebar';
import { InviteModal } from '../shared/components/dashboard/InviteModal';
import { AccesosTab } from '../shared/components/dashboard/AccesosTab';
import { PerfilTab } from '../shared/components/dashboard/PerfilTab';
import { MensajesTab } from '../shared/components/dashboard/MensajesTab';
import { ProyectosTab } from '../shared/components/dashboard/ProyectosTab';
import type { CuentaActiva, InvitacionSolicitud } from '../shared/types/dashboard';
import { API_URL } from '../config/api';
import { ThemeToggle } from '../shared/components/ThemeToggle';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

// Cada sección del dashboard tiene su propia URL: /dashboard/<sección>
type Tab = 'perfil' | 'proyectos' | 'mensajes' | 'accesos';
const TABS: Tab[] = ['perfil', 'proyectos', 'mensajes', 'accesos'];
const SOLO_ADMIN: Tab[] = ['mensajes', 'accesos'];
const ROLES_ADMIN = ['ADMIN', 'ADMINISTRADOR', 'SUB_ADMIN'];
const RUTA_INICIO = '/dashboard/proyectos';
const esTabValido = (s?: string): s is Tab => TABS.includes(s as Tab);

export const DashboardPage: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  const navigate = useNavigate();
  const { section } = useParams<{ section: string }>();
  const activeTab: Tab = esTabValido(section) ? section : 'proyectos';
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const [cuentasActivas, setCuentasActivas] = useState<CuentaActiva[]>([]);
  const [invitacionesSolicitudes, setInvitacionesSolicitudes] = useState<InvitacionSolicitud[]>([]);
  const [userRole, setUserRole] = useState<string>('ANALISTA');
  // Hasta que no llega la respuesta del servidor no se sabe el rol real del usuario
  const [rolCargado, setRolCargado] = useState<boolean>(false);

  const esAdmin = ROLES_ADMIN.includes(userRole.toUpperCase());

  const cargarDatosServidor = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/admin/solicitudes`);
      if (response.ok) {
        const data = await response.json();

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

        const usrActual = data.find((usr: any) =>
          usr.email?.toLowerCase() === userEmail?.toLowerCase() ||
          usr.email_personal?.toLowerCase() === userEmail?.toLowerCase()
        );

        if (usrActual) {
          setUserRole(usrActual.rol || 'ANALISTA');
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del backend:', error);
    } finally {
      setRolCargado(true);
    }
  };

  useEffect(() => {
    cargarDatosServidor();
  }, [userEmail]);

  // Guarda de navegación: sección inexistente o sin permisos -> Proyectos
  useEffect(() => {
    const seccionInvalida = !esTabValido(section);
    const sinPermiso = rolCargado && !esAdmin && SOLO_ADMIN.includes(activeTab);
    if (seccionInvalida || sinPermiso) {
      navigate(RUTA_INICIO, { replace: true });
    }
  }, [section, activeTab, rolCargado, esAdmin, navigate]);

  const handleSendInvite = async (data: any): Promise<void> => {
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

  const handleAprobarActivar = async (
    item: InvitacionSolicitud,
    datosPersonalizados?: { rol?: string; cargo?: string; proyecto?: string; emailCorporativo?: string }
  ): Promise<void> => {
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

  const handleEditarProyectoCuenta = (id: number | string): void => {
    const nuevoProyecto = prompt("Ingrese el nuevo proyecto o área de trabajo:", "PROYECTO BIG DATA & ANALÍTICA");
    if (nuevoProyecto) {
      setCuentasActivas(cuentasActivas.map((c: CuentaActiva) => c.id === id ? { ...c, proyecto: nuevoProyecto } : c));
    }
  };

  const handleEliminarCuentaActiva = (id: number | string): void => {
    if (confirm("¿Está seguro de revocar el acceso a este usuario?")) {
      setCuentasActivas(cuentasActivas.filter((c: CuentaActiva) => c.id !== id));
    }
  };

  const handleEliminarInvitacion = async (id: string | number): Promise<void> => {
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

  // Cambiar de sección = cambiar de URL (/dashboard/<sección>)
  const handleSelectTab = (tab: Tab) => {
    navigate(`/dashboard/${tab}`);
    setIsMobileMenuOpen(false); // Cierra menú lateral al cambiar de tab en móvil
  };

  // Las secciones de administración solo se muestran cuando el rol ya está confirmado como admin
  const permisosPendientes = SOLO_ADMIN.includes(activeTab) && !rolCargado;
  const mostrarTab = (tab: Tab): boolean =>
    activeTab === tab && (!SOLO_ADMIN.includes(tab) || (rolCargado && esAdmin));

  return (
    <div className="nx-dash min-h-screen bg-[#f4f6f8] text-slate-800 flex font-sans text-sm relative overflow-x-hidden">
      {/* Overlay Backdrop para menú móvil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Contenedor del Sidebar con comportamiento Drawer en móvil */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          userEmail={userEmail}
          userRole={userRole}
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          onLogout={onLogout}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header Responsive */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-h-[57px]">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Botón Hamburguesa para Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <h1 className="text-lg sm:text-xl font-bold text-slate-800 capitalize truncate">
              {activeTab === 'perfil' && 'Perfil de Usuario'}
              {activeTab === 'proyectos' && 'Proyectos'}
              {activeTab === 'mensajes' && 'Mensajes e Informes de Proyectos'}
              {activeTab === 'accesos' && 'Gestión de Accesos'}
            </h1>
          </div>

          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3">
            {activeTab === 'accesos' && esAdmin && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-[#0056d2] text-white rounded-md text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>Generar Nueva Invitación / Cargo</span>
              </button>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Área Principal + Sidebar Derecha */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 w-full">
            {permisosPendientes && (
              <div className="p-6 text-slate-500">Verificando permisos...</div>
            )}

            {mostrarTab('accesos') && (
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

            {mostrarTab('perfil') && <PerfilTab userEmail={userEmail} />}
            {mostrarTab('mensajes') && <MensajesTab />}
            {mostrarTab('proyectos') && (
              <ProyectosTab
                userRole={userRole}
                onSelectProyecto={(proyectoData: any) => {
                  const id = typeof proyectoData === 'object' ? proyectoData.id : proyectoData;
                  const titulo = typeof proyectoData === 'object' ? proyectoData.titulo : '';
                  const codigoNrc = typeof proyectoData === 'object' ? proyectoData.codigo_nrc : '';
                  const url = typeof proyectoData === 'object' ? proyectoData.url : '';

                  // Si el proyecto tiene una URL independiente registrada, abrirla directamente
                  if (url) {
                    window.open(url, '_blank');
                    return;
                  }

                  const strId = String(id || '').toLowerCase();
                  const strTitulo = String(titulo || '').toLowerCase();
                  const strNrc = String(codigoNrc || '').toLowerCase();

                  const esBigData =
                    strId === '1' ||
                    strId.startsWith('64cb9f39') ||
                    strNrc.includes('3860') ||
                    strTitulo.includes('big data');

                  const esAzure =
                    strId === 'd7dcf898-012a-4d06-a1ab-354d32a132b9' ||
                    strNrc.includes('8499') ||
                    strTitulo.includes('azure');

                  const esErp =
                    strId.startsWith('902094cc') ||
                    strNrc.includes('7411') ||
                    strTitulo.includes('erp');

                  const esCloudOps =
                    strId.startsWith('b0da6f34') ||
                    strNrc.includes('4575') ||
                    strTitulo.includes('cloud');

                  if (esErp) {
                    navigate('/erp-enterprise-cloud');
                  } else if (esBigData) {
                    navigate('/big-data');
                  } else if (esAzure) {
                    navigate('/azure');
                  } else if (esCloudOps) {
                    navigate('/cloud-ops');
                  } else {
                    navigate(`/proyecto/${id}`);
                  }
                }}
              />
            )}
          </main>

          {/* Oculto en móviles y pantallas medianas, visible solo desde xl */}
          <div className="hidden xl:block">
            <RightSidebar />
          </div>
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
