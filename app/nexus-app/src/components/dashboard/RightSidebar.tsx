import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const RightSidebar: React.FC = () => {
  return (
    <aside className="w-80 bg-white border-l border-slate-200 p-5 hidden xl:block overflow-y-auto">
      <h2 className="font-bold text-slate-800 text-sm mb-4">Tareas pendientes</h2>
      <div className="p-6 border border-dashed border-slate-200 rounded-md text-center text-slate-400 text-xs space-y-2">
        <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
        <p className="font-medium text-slate-600">Sin tareas pendientes</p>
      </div>
    </aside>
  );
};