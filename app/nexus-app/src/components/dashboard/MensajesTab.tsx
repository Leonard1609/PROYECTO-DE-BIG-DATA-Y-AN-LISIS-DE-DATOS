import React from 'react';

export const MensajesTab: React.FC = () => {
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between bg-white p-4 rounded-md border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-800">Bandeja de Mensajes, Informes y Solicitudes</h2>
          <p className="text-xs text-slate-500">Comunicaciones e informes enviados directamente por cada proyecto asignado.</p>
        </div>
      </div>
    </div>
  );
};