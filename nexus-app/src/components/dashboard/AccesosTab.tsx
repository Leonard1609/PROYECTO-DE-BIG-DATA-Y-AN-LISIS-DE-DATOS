import React from 'react';
import { CheckCircle2, Clock, Briefcase, Mail, UserCheck } from 'lucide-react';
import type { CuentaActiva, InvitacionSolicitud } from '../../types/dashboard';
import { CuentasActivasTable } from './CuentasActivasTable';
import { InvitacionesTable } from './InvitacionesTable';

interface AccesosTabProps {
  cuentasActivas: CuentaActiva[];
  invitacionesSolicitudes: InvitacionSolicitud[];
  onOpenInviteModal: () => void;
  onAprobarActivar: (item: InvitacionSolicitud) => void;
  onEditarProyectoCuenta: (id: number) => void;
  onEliminarCuentaActiva: (id: number) => void;
  onEliminarInvitacion: (id: number) => void;
}

export const AccesosTab: React.FC<AccesosTabProps> = ({
  cuentasActivas,
  invitacionesSolicitudes,
  onOpenInviteModal,
  onAprobarActivar,
  onEditarProyectoCuenta,
  onEliminarCuentaActiva,
  onEliminarInvitacion
}) => {
  // Clasificación estricta de las solicitudes según el origen
  const solicitudesAcceso = invitacionesSolicitudes.filter(item => item.origen === 'Solicitud');
  const invitacionesDirectas = invitacionesSolicitudes.filter(item => item.origen === 'Invitación');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* TARJETAS RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Cuentas Activas</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{cuentasActivas.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Invitaciones / Solicitudes Pendientes</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{invitacionesSolicitudes.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Cargos Asignados</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{cuentasActivas.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TABLA DE CUENTAS ACTIVAS */}
      <CuentasActivasTable 
        cuentas={cuentasActivas}
        onEditarProyecto={onEditarProyectoCuenta}
        onEliminar={onEliminarCuentaActiva}
      />

      {/* SECCIÓN FLUJO 1: SOLICITUDES DE ACCESO */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-800">
            Flujo 1: Solicitudes de Acceso Web (Registro Público)
          </h2>
        </div>
        <InvitacionesTable 
          invitaciones={solicitudesAcceso}
          onOpenInviteModal={onOpenInviteModal}
          onAprobarActivar={onAprobarActivar}
          onEliminarInvitacion={onEliminarInvitacion}
        />
      </div>

      {/* SECCIÓN FLUJO 2: INVITACIONES DIRECTAS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-800">
            Flujo 2: Invitaciones Directas Enviadas (Administración)
          </h2>
        </div>
        <InvitacionesTable 
          invitaciones={invitacionesDirectas}
          onOpenInviteModal={onOpenInviteModal}
          onAprobarActivar={onAprobarActivar}
          onEliminarInvitacion={onEliminarInvitacion}
        />
      </div>
    </div>
  );
};