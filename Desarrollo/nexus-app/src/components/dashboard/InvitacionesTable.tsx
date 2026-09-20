import React, { useState } from 'react';
import { UserPlus, Eye, CheckCircle, Trash2, RefreshCw, X, Shield, Mail, User, Phone, MapPin, GraduationCap } from 'lucide-react';
import type { InvitacionSolicitud } from '../../types/dashboard';

interface InvitacionesTableProps {
  invitaciones: InvitacionSolicitud[];
  onOpenInviteModal: () => void;
  onAprobarActivar: (item: InvitacionSolicitud) => void;
  onEliminarInvitacion: (id: string | number) => void;
}

export const InvitacionesTable: React.FC<InvitacionesTableProps> = ({
  invitaciones,
  onOpenInviteModal,
  onAprobarActivar,
  onEliminarInvitacion
}) => {
  const [selectedItem, setSelectedItem] = useState<InvitacionSolicitud | null>(null);

  const handleConfirmarAprobacion = () => {
    if (selectedItem) {
      onAprobarActivar(selectedItem);
      setSelectedItem(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm">
            Historial de Invitaciones Enviadas & Cargos Solicitados
          </h3>
          <button
            onClick={onOpenInviteModal}
            className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nueva Invitación</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Origen</th>
                <th className="py-3 px-4">Fase Verificación</th>
                <th className="py-3 px-4">Destinatario / Cargo</th>
                <th className="py-3 px-4">Correo Personal (Gmail)</th>
                <th className="py-3 px-4">Proyecto / Módulo</th>
                <th className="py-3 px-4">Fecha Envío</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invitaciones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No hay solicitudes ni invitaciones pendientes.
                  </td>
                </tr>
              ) : (
                invitaciones.map((item) => {
                  const esInvitacion = item.origen === 'Invitación';
                  const estadoStr = String(item.estado || '');
                  const datosCompletados = estadoStr === 'DATOS_COMPLETADOS' || item.fase.includes('Fase 2');

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          esInvitacion ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {item.origen}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        <span className={`px-2 py-0.5 rounded ${
                          datosCompletados ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.fase}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{item.destinatario || 'Pendiente de Registro'}</div>
                        <div className="text-[11px] text-slate-500">{item.cargo || 'Sin cargo asignado'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {item.correoPersonal || item.correoEmpresarial}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-700">{item.proyecto}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{item.fechaEnviado}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="px-2.5 py-1 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-all flex items-center gap-1 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Observar Solicitud</span>
                          </button>

                          <button
                            onClick={() => window.location.reload()}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Recargar"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEliminarInvitacion(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Eliminar / Rechazar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CON INFORMACIÓN DETALLADA ESTILO PERFIL SENATI */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Encabezado */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">Revisión de Solicitud de Acceso</h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Encabezado de estado */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Estado de Verificación:</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                  {selectedItem.origen} - {selectedItem.fase}
                </span>
              </div>

              {/* Información de Cuentas / Correos */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs border-b border-blue-100 pb-2">Datos de Identificación y Acceso</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-400 uppercase text-[10px]">Correo Personal Solicitante (Gmail)</p>
                      <p className="font-mono font-bold text-slate-800">{selectedItem.correoPersonal || selectedItem.correoEmpresarial}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-400 uppercase text-[10px]">Correo Empresarial a Asignar</p>
                      <p className="font-mono font-bold text-emerald-700">
                        {selectedItem.destinatario 
                          ? `${selectedItem.destinatario.toLowerCase().replace(/\s+/g, '.')}@nexus.com`
                          : 'Pendiente de generación (@nexus.com)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Perfil Capturado (Estilo Perfil Senati) */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">Información del Perfil</h4>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Nombre Completo</p>
                      <p className="font-bold text-slate-800">{selectedItem.destinatario || 'No especificado'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Teléfono / Móvil</p>
                      <p className="font-medium text-slate-700">{selectedItem.telefono || 'No registrado'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Ubicación / Dirección</p>
                      <p className="font-medium text-slate-700">{selectedItem.direccion || 'No registrada'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Nivel de Educación</p>
                      <p className="font-medium text-slate-700">{selectedItem.nivelEducacion || 'No registrado'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Módulo Solicitado</p>
                      <p className="font-bold text-indigo-600">{selectedItem.proyecto}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-[11px] leading-relaxed">
                Al confirmar, el usuario recibirá credenciales con su correo corporativo <strong>@nexus.com</strong> y acceso habilitado al módulo seleccionado.
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmarAprobacion}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aprobar y Asignar @nexus.com</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};