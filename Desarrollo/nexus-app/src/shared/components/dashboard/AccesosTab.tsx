import React, { useState } from 'react';
import { CheckCircle2, Trash2, Edit3, X, Mail, Shield, User, Phone, MapPin, GraduationCap } from 'lucide-react';
import type { CuentaActiva, InvitacionSolicitud } from '../../types/dashboard.ts';

interface AccesosTabProps {
  cuentasActivas: CuentaActiva[];
  invitacionesSolicitudes: InvitacionSolicitud[];
  onOpenInviteModal: () => void;
  onAprobarActivar: (item: InvitacionSolicitud, datosPersonalizados?: { rol?: string; cargo?: string; proyecto?: string; emailCorporativo?: string }) => void;
  onEditarProyectoCuenta: (id: string | number) => void;
  onEliminarCuentaActiva: (id: string | number) => void;
  onEliminarInvitacion: (id: string | number) => void;
}

export const AccesosTab: React.FC<AccesosTabProps> = ({
  cuentasActivas,
  invitacionesSolicitudes,
  onOpenInviteModal,
  onAprobarActivar,
  onEditarProyectoCuenta,
  onEliminarCuentaActiva,
  onEliminarInvitacion,
}) => {
  const [modalItem, setModalItem] = useState<InvitacionSolicitud | null>(null);

  const [emailCorporativoInput, setEmailCorporativoInput] = useState('');
  const [rolSeleccionado, setRolSeleccionado] = useState('ANALISTA');
  const [cargoSeleccionado, setCargoSeleccionado] = useState('Analista / Colaborador');
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('PROYECTO BIG DATA & ANALÍTICA');

  const abrirModalRevision = (item: InvitacionSolicitud) => {
    setModalItem(item);
    const nombreSugerido = item.destinatario ? item.destinatario.toLowerCase().replace(/\s+/g, '.') : 'usuario';
    const emailSugerido = item.correoEmpresarial || `${nombreSugerido}@nexus.com`;
    setEmailCorporativoInput(emailSugerido);

    setRolSeleccionado(item.rol || 'ANALISTA');
    setCargoSeleccionado(item.cargo || 'Analista / Colaborador');
    setProyectoSeleccionado(item.proyecto || 'PROYECTO BIG DATA & ANALÍTICA');
  };

  const handleConfirmarAprobacion = () => {
    if (!modalItem) return;

    onAprobarActivar(modalItem, {
      emailCorporativo: emailCorporativoInput,
      rol: rolSeleccionado,
      cargo: cargoSeleccionado,
      proyecto: proyectoSeleccionado
    });

    setModalItem(null);
  };

  const esFaseActivacion = (item: InvitacionSolicitud) => {
    const estado = String(item.estado || '').toUpperCase();
    const fase = String(item.fase || '');
    return estado === 'PENDIENTE_ACTIVACION' || estado === 'PRE_APROBADO' || fase.includes('Fase 3/4');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Cuentas Activas</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{cuentasActivas.length}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Solicitudes Pendientes</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{invitacionesSolicitudes.length}</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Cargos Asignados</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{cuentasActivas.length}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabla Cuentas Activas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Historial de Cuentas Activas y Credenciales de Acceso</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/70 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-6 py-3">Usuario y Cargo</th>
                <th className="px-6 py-3">Correo Personal</th>
                <th className="px-6 py-3">Correo Empresarial</th>
                <th className="px-6 py-3">Rol / Proyecto</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cuentasActivas.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{usr.nombre}</p>
                    <p className="text-slate-500">{usr.cargo}</p>
                  </td>
                  <td className="px-6 py-4">{usr.correoNormal}</td>
                  <td className="px-6 py-4 font-semibold text-blue-600">{usr.correoEmpresarial}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">{usr.rol}</span>
                    <p className="text-[10px] text-slate-400 mt-1">{usr.proyecto}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Activo
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => onEditarProyectoCuenta(usr.id)} className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEliminarCuentaActiva(usr.id)} className="p-1.5 hover:bg-red-100 text-red-600 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla Invitaciones Pendientes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Solicitudes de Acceso Web e Invitaciones Pendientes</h3>
          <button onClick={onOpenInviteModal} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800">
            + Nueva Invitación
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/70 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-6 py-3">Origen</th>
                <th className="px-6 py-3">Fase Verificación</th>
                <th className="px-6 py-3">Destinatario</th>
                <th className="px-6 py-3">Correo Personal</th>
                <th className="px-6 py-3">Fecha Envío</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invitacionesSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No hay solicitudes ni invitaciones pendientes.
                  </td>
                </tr>
              ) : (
                invitacionesSolicitudes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">{item.origen}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        esFaseActivacion(item) ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.fase}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{item.destinatario}</td>
                    <td className="px-6 py-4">{item.correoPersonal}</td>
                    <td className="px-6 py-4 text-slate-400">{item.fechaEnviado}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => abrirModalRevision(item)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-all shadow-sm"
                      >
                        Revisar / Aprobar
                      </button>
                      <button
                        onClick={() => onEliminarInvitacion(item.id)}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Revisión estilo Dashboard Claro */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl relative space-y-5">
            <button 
              onClick={() => setModalItem(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Revisión de Solicitud de Acceso</h3>
                <p className="text-xs text-slate-500">Verifica la información antes de continuar.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-600">Estado de Verificación:</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                esFaseActivacion(modalItem) ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {modalItem.fase}
              </span>
            </div>

            {/* Datos Personales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-blue-500" />
                <span><strong>Nombre:</strong> {modalItem.destinatario}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-blue-500" />
                <span><strong>Gmail:</strong> {modalItem.correoPersonal}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-blue-500" />
                <span><strong>Teléfono:</strong> {modalItem.telefono || 'No especificado'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span><strong>Ubicación:</strong> {modalItem.direccion || 'Lima / Callao'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 col-span-2">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <span><strong>Nivel Educativo:</strong> {modalItem.nivelEducacion || 'Ingeniero / Titulado'}</span>
              </div>
            </div>

            {/* FASE 2: Correo Corporativo */}
            {!esFaseActivacion(modalItem) && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  CORREO CORPORATIVO A ASIGNAR (@nexus.com)
                </label>
                <input
                  type="email"
                  value={emailCorporativoInput}
                  onChange={(e) => setEmailCorporativoInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-emerald-700 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="ejemplo@nexus.com"
                />
              </div>
            )}

            {/* FASE 3/4: Asignación Final */}
            {esFaseActivacion(modalItem) && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  ASIGNACIÓN DE CREDENCIALES FINALES
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ROL</label>
                    <select
                      value={rolSeleccionado}
                      onChange={(e) => setRolSeleccionado(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ANALISTA">ANALISTA</option>
                      <option value="ADMIN">ADMINISTRADOR</option>
                      <option value="EMPLEADO">EMPLEADO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">CARGO</label>
                    <input
                      type="text"
                      value={cargoSeleccionado}
                      onChange={(e) => setCargoSeleccionado(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      placeholder="Analista / Colaborador"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">PROYECTO</label>
                    <select
                      value={proyectoSeleccionado}
                      onChange={(e) => setProyectoSeleccionado(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PROYECTO BIG DATA & ANALÍTICA">PROYECTO BIG DATA & ANALÍTICA</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setModalItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarAprobacion}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {esFaseActivacion(modalItem) ? 'Activar Cuenta Final' : 'Aprobar y Asignar @nexus.com'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};