import React from 'react';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';

interface Props {
  email: string;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export const PasswordInputStep: React.FC<Props> = ({ email, password, setPassword, loading, onSubmit, onBack }) => (
  <form onSubmit={onSubmit} className="space-y-5">
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Bienvenido</h2>
      <p className="text-xs text-slate-400">Ingresa tu contraseña para acceder.</p>
    </div>

    <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-3 flex items-center gap-3">
      <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
      <div className="truncate">
        <p className="text-[10px] text-slate-400 uppercase font-semibold">Cuenta activa</p>
        <p className="text-xs font-semibold text-white truncate">{email}</p>
      </div>
    </div>

    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-300">Contraseña</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
        <input
          type="password"
          required
          disabled={loading}
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
        />
      </div>
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Iniciar Sesión</span>}
    </button>

    <button
      type="button"
      onClick={onBack}
      className="w-full text-xs text-slate-400 hover:text-white transition-colors text-center"
    >
      ← Cambiar correo
    </button>
  </form>
);