import React from 'react';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  email: string;
  setEmail: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const EmailCheckStep: React.FC<Props> = ({ email, setEmail, loading, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Entrar</h2>
      <p className="text-xs text-slate-400">
        Ingresa tu correo empresarial para validar tu acceso o solicitar uno nuevo.
      </p>
    </div>

    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-300">Correo Electrónico</label>
      <div className="relative">
        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
        <input
          type="email"
          required
          disabled={loading}
          placeholder="usuario@dominio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
        />
      </div>
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group text-sm"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verificando...</span>
        </>
      ) : (
        <>
          <span>Continuar</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  </form>
);