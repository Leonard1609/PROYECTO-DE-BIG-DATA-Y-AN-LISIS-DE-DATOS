import React, { useState } from 'react';
import { UserPlus, X, Mail } from 'lucide-react';
import type { Proyecto } from '../../types/dashboard';

interface InviteModalProps {
  proyectos: Proyecto[];
  onClose: () => void;
  onSendInvite: (data: {
    emailNormal: string;
    role: 'Admin' | 'Analista' | 'Empleado';
    cargo: string;
    proyecto: string;
    correoEmpresarial: string;
  }) => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ proyectos, onClose, onSendInvite }) => {
  const [inviteEmailNormal, setInviteEmailNormal] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Analista' | 'Empleado'>('Analista');
  const [inviteCargo, setInviteCargo] = useState('Analista (Big Data / Operativo)');
  const [inviteProject, setInviteProject] = useState('PROYECTO BIG DATA & ANALÍTICA');

  const correoEmpresarialGenerado = inviteEmailNormal 
    ? `${inviteEmailNormal.split('@')[0].toLowerCase()}@nexus-tech.com`
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendInvite({
      emailNormal: inviteEmailNormal,
      role: inviteRole,
      cargo: inviteCargo,
      proyecto: inviteProject,
      correoEmpresarial: correoEmpresarialGenerado
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-[#1e1e1e] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Generar Invitación</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Correo Personal (Gmail)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input 
                type="email" 
                required
                placeholder="ejemplo@gmail.com"
                value={inviteEmailNormal}
                onChange={(e) => setInviteEmailNormal(e.target.value)}
                className="w-full border border-slate-300 rounded pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Correo Empresarial (Autogenerado)
            </label>
            <input 
              type="text" 
              readOnly 
              value={correoEmpresarialGenerado}
              placeholder="ejemplo@nexus-tech.com"
              className="w-full border border-slate-200 bg-slate-100 text-slate-600 rounded px-3 py-2 text-xs font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Rol Asignado
            </label>
            <select 
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'Analista' | 'Empleado')}
              className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-medium bg-white"
            >
              <option value="Admin">Admin (Documentación / Control)</option>
              <option value="Analista">Analista (Big Data / Operativo)</option>
              <option value="Empleado">Empleado (General)</option>
            </select>
          </div>

          {inviteRole !== 'Admin' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Cargo / Puesto
              </label>
              <select 
                value={inviteCargo}
                onChange={(e) => setInviteCargo(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="Analista (Big Data / Operativo)">Analista (Big Data / Operativo)</option>
                <option value="Desarrollador Senior Backend">Desarrollador Senior Backend</option>
                <option value="Empleado (General)">Empleado (General)</option>
              </select>
            </div>
          )}

          {inviteRole !== 'Admin' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Proyecto Asignado
              </label>
              <select 
                value={inviteProject}
                onChange={(e) => setInviteProject(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-white"
              >
                {proyectos.map(p => (
                  <option key={p.id} value={p.titulo}>{p.titulo}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#0056d2] hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enviar Invitación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};