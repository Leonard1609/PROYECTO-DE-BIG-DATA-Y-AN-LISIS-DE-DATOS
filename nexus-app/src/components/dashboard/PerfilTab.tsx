import React from 'react';
import { User } from 'lucide-react';

interface PerfilTabProps {
  userEmail: string;
}

export const PerfilTab: React.FC<PerfilTabProps> = ({ userEmail }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 relative" />
        <div className="px-6 pb-6 pt-0 relative flex flex-col items-center -mt-16 text-center">
          <div className="w-28 h-28 rounded-full border-4 border-white bg-slate-800 shadow-md flex items-center justify-center text-white overflow-hidden mb-3">
            <User className="w-14 h-14 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
            {userEmail.split('@')[0]} (Sistemas)
          </h2>
          <p className="text-xs text-blue-600 font-semibold">{userEmail}</p>
        </div>
      </div>
    </div>
  );
};