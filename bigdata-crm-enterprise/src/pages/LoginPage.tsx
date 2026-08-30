import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Shield, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { homePathForCargo, type Cargo } from '../types/auth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setBusy(true);
    const result = await login(email, password);
    setBusy(false);
    if (result.error) {
      setErrorMessage(result.error);
      return;
    }
    if (!result.cargo) {
      setErrorMessage('No se encontró tu usuario.');
      return;
    }
    navigate(homePathForCargo(result.cargo as Cargo));
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <section className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-cyan-500/10" />
        <p className="relative font-display text-sm tracking-[0.3em] text-blue-300">NEXUS</p>
        <div className="relative max-w-md space-y-6">
          <h1 className="font-display text-5xl font-extrabold leading-tight text-white">
            Compará. Elegí. Aplicá en lo tuyo.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Cargá CSV del mismo rubro. El sistema lee las columnas, compara ganancia y el equipo aplica esa forma de trabajo.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="nx-card p-4">
              <Shield className="text-blue-400 mb-2" size={20} />
              <p className="text-sm font-medium text-white">Administrador</p>
              <p className="text-xs text-slate-400 mt-1">Sube, compara y decide</p>
            </div>
            <div className="nx-card p-4">
              <Users className="text-blue-400 mb-2" size={20} />
              <p className="text-sm font-medium text-white">Encargado</p>
              <p className="text-xs text-slate-400 mt-1">Tareas y salud del sistema</p>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-slate-500">PostgreSQL · el permiso lo da tu usuario, no un botón</p>
      </section>

      <section className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">Entrar</h2>
            <p className="text-slate-400 text-sm mt-2">Usá el correo de trabajo. El sistema te lleva a tu panel.</p>
          </div>
          {errorMessage && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{errorMessage}</div>
          )}
          <label className="block text-sm text-slate-400">
            Correo
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="nx-input pl-10"
                placeholder="usuario@empresa.com"
              />
            </div>
          </label>
          <label className="block text-sm text-slate-400">
            Contraseña
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="nx-input pl-10"
                placeholder="••••••••"
              />
            </div>
          </label>
          <button type="submit" disabled={busy} className="nx-btn w-full py-3">
            {busy ? 'Entrando…' : 'Continuar'}
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </div>
  );
};
