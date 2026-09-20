import React from 'react';
import { CheckCircle2, Clock, UserCheck, Loader2 } from 'lucide-react';

interface RequestActivationProps {
  email: string;
  loading: boolean;
  onActivate: () => void;
}

export const RequestActivationStep: React.FC<RequestActivationProps> = ({ email, loading, onActivate }) => (
  <div className="space-y-5">
    <div className="bg-blue-950/40 border border-blue-800/50 rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
        <UserCheck className="w-4 h-4" />
        <span>Datos Detectados (Fase 3)</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">
        El sistema detectó que ya ingresaste tus datos previamente con el correo <b>{email}</b>. Presiona el botón para solicitar la activación final.
      </p>
    </div>

    <button
      type="button"
      onClick={onActivate}
      disabled={loading}
      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Solicitar Activación de Cuenta</span>}
    </button>
  </div>
);

interface StatusScreenProps {
  type: 'REQUEST_SENT' | 'PENDING_REVIEW';
  statusMessage?: string;
  onBack: () => void;
}

export const StatusScreen: React.FC<StatusScreenProps> = ({ type, statusMessage, onBack }) => (
  <div className="text-center py-6 space-y-4">
    {type === 'REQUEST_SENT' ? (
      <>
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">¡Solicitud Enviada!</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Tus datos pasaron a revisión del área de gestión. Te enviarán un correo con tu correo empresarial asignado.
        </p>
      </>
    ) : (
      <>
        <Clock className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Estado de Cuenta</h3>
        <p className="text-xs text-slate-300 leading-relaxed">{statusMessage}</p>
      </>
    )}

    <button
      type="button"
      onClick={onBack}
      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-colors"
    >
      Volver al Inicio
    </button>
  </div>
);