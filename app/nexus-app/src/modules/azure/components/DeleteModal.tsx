import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  usuarioNombre: string;
  confirmacionTexto: string;
  setConfirmacionTexto: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  usuarioNombre,
  confirmacionTexto,
  setConfirmacionTexto,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center gap-3 text-rose-400">
          <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg">Confirmar Eliminación Biométrica</h3>
            <p className="text-xs text-rose-300">Acción crítica reservada para Administrador</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Esta acción eliminará de forma permanente el vector biométrico guardado para{' '}
          <strong className="text-white">{usuarioNombre}</strong> de la base de datos.
        </p>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 block">
            Para confirmar, escriba <span className="text-rose-400 font-bold">ELIMINAR</span> a continuación:
          </label>
          <input
            type="text"
            value={confirmacionTexto}
            onChange={(e) => setConfirmacionTexto(e.target.value)}
            placeholder="ELIMINAR"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono tracking-wider"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
          >
            Cancelar
          </button>
          <button
            disabled={confirmacionTexto.trim().toUpperCase() !== 'ELIMINAR'}
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Confirmar y Borrar
          </button>
        </div>
      </div>
    </div>
  );
};