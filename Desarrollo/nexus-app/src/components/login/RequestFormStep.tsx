import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface Props {
  isInvitation: boolean;
  email: string;
  requestData: {
    nombres: string;
    apellidos: string;
    telefono: string;
    direccion: string;
    nivelEducacion: string;
  };
  setRequestData: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const RequestFormStep: React.FC<Props> = ({
  isInvitation,
  email,
  requestData,
  setRequestData,
  loading,
  onSubmit,
  onCancel
}) => {
  const [errorEmail, setErrorEmail] = useState('');

  // Validar correo Gmail
  const isGmail = (emailStr: string) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(emailStr.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGmail(email)) {
      setErrorEmail('Debes ingresar un correo de Gmail válido (@gmail.com)');
      return;
    }
    setErrorEmail('');
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-h-[80vh] overflow-y-auto pr-1">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">
          {isInvitation ? 'Completar Registro (Fase 2)' : 'Solicitar Acceso (Fase 2)'}
        </h2>
        <p className="text-xs text-slate-400">
          Ingresa tus datos personales para completar tu perfil ({email}).
        </p>
      </div>

      {!isGmail(email) && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>El correo ingresado debe pertenecer al dominio <strong>@gmail.com</strong>.</span>
        </div>
      )}

      {errorEmail && (
        <p className="text-xs text-rose-400 font-semibold">{errorEmail}</p>
      )}

      {/* Nombres y Apellidos */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Nombres *</label>
          <input
            type="text"
            required
            disabled={loading}
            placeholder="Tus nombres"
            value={requestData.nombres}
            onChange={(e) => setRequestData({ ...requestData, nombres: e.target.value })}
            className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Apellidos *</label>
          <input
            type="text"
            required
            disabled={loading}
            placeholder="Tus apellidos"
            value={requestData.apellidos}
            onChange={(e) => setRequestData({ ...requestData, apellidos: e.target.value })}
            className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Contacto & Ubicación */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Teléfono / Móvil</label>
          <input
            type="tel"
            disabled={loading}
            placeholder="+51 987 654 321"
            value={requestData.telefono}
            onChange={(e) => setRequestData({ ...requestData, telefono: e.target.value })}
            className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Dirección / Ciudad</label>
          <input
            type="text"
            disabled={loading}
            placeholder="Ej. Lima, Peru"
            value={requestData.direccion}
            onChange={(e) => setRequestData({ ...requestData, direccion: e.target.value })}
            className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Información Académica (Ocupa ancho completo) */}
      <div>
        <label className="block text-[11px] font-medium text-slate-300 mb-1">Nivel de Educación</label>
        <select
          disabled={loading}
          value={requestData.nivelEducacion}
          onChange={(e) => setRequestData({ ...requestData, nivelEducacion: e.target.value })}
          className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
        >
          <option value="">Selecciona nivel</option>
          <option value="Técnico / Estudiante">Técnico / Estudiante</option>
          <option value="Universitario">Universitario</option>
          <option value="Ingeniero / Titulado">Ingeniero / Titulado</option>
          <option value="Postgrado / Máster">Postgrado / Máster</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !isGmail(email)}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2 mt-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Enviar Solicitud</span>}
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="w-full text-xs text-slate-400 hover:text-white transition-colors text-center"
      >
        Cancelar
      </button>
    </form>
  );
};