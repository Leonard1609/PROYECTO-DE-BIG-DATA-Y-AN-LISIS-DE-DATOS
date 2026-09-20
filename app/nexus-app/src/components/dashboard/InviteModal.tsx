import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvite: (data: {
    emailPersonal: string;
    rol?: string;
    cargo?: string;
    proyecto?: string;
  }) => Promise<void> | void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, onSendInvite }) => {
  const [emailPersonal, setEmailPersonal] = useState('');
  const [rol, setRol] = useState('EMPLEADO');
  const [cargo, setCargo] = useState('');
  const [proyecto, setProyecto] = useState('GENERAL');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSendInvite({ emailPersonal, rol, cargo, proyecto });
      setEmailPersonal('');
      setCargo('');
      onClose();
    } catch (err) {
      console.error('Error enviando invitación:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base">Nueva Invitación Directa</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo Personal (Gmail / Entrevistado) *
            </label>
            <input
              type="email"
              required
              placeholder="ejemplo@gmail.com"
              value={emailPersonal}
              onChange={(e) => setEmailPersonal(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rol *</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="EMPLEADO">Empleado</option>
                <option value="ANALISTA">Analista</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Proyecto / Módulo *</label>
              <select
                value={proyecto}
                onChange={(e) => setProyecto(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="GENERAL">General</option>
                <option value="LOGISTICA">Logística</option>
                <option value="FINANZAS">Finanzas</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo / Puesto</label>
            <input
              type="text"
              placeholder="Ej: Desarrollador Backend"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};