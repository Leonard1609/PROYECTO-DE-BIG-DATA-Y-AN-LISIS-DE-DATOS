import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export const CompletarInvitacionModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [emailEmpresarial, setEmailEmpresarial] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/completar-invitacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_empresarial: emailEmpresarial,
          codigo,
          nombre_completo: nombreCompleto,
          password
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        onSuccess();
        onClose();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Completar Registro de Invitación</h2>
        <p className="text-xs text-slate-500 mb-4">Ingresa el código enviado a tu correo personal y completa tus datos.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Empresarial Asignado *</label>
            <input
              type="email"
              required
              placeholder="ejemplo@nexus-tech.com"
              value={emailEmpresarial}
              onChange={(e) => setEmailEmpresarial(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Código de Verificación (6 dígitos) *</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none tracking-widest text-center font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              placeholder="Juan Pérez"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Crea tu Contraseña *</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Guardando...' : 'Completar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};