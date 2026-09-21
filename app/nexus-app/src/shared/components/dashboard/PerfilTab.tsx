import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, GraduationCap, ShieldCheck, CheckCircle2, Briefcase } from 'lucide-react';
import { API_URL } from '../../../config/api';

interface PerfilTabProps {
  userEmail: string;
}

export const PerfilTab: React.FC<PerfilTabProps> = ({ userEmail }) => {
  const [perfil, setPerfil] = useState({
    nombre: 'Sad.Saf',
    emailCorporativo: userEmail || 'sad.saf@nexus.com',
    telefono: '913557865',
    ubicacion: 'Lima / Callao',
    nivelEducativo: 'Ingeniero / Titulado',
    rol: 'ANALISTA',
    proyecto: 'PROYECTO BIG DATA & ANALÍTICA'
  });

  useEffect(() => {
    const cargarPerfilUsuario = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/solicitudes`);
        if (response.ok) {
          const data = await response.json();
          // Buscar el registro coincidente por correo
          const usr = data.find((u: any) => 
            u.email?.toLowerCase() === userEmail?.toLowerCase() || 
            u.email_personal?.toLowerCase() === userEmail?.toLowerCase()
          );

          if (usr) {
            setPerfil({
              nombre: usr.nombre_completo || 'Sad.Saf',
              emailCorporativo: usr.email || userEmail,
              telefono: usr.telefono || '913557865',
              ubicacion: usr.direccion || 'Lima / Callao',
              nivelEducativo: usr.nivel_educacion || 'Ingeniero / Titulado',
              rol: usr.rol || 'ANALISTA',
              proyecto: usr.proyecto || 'PROYECTO BIG DATA & ANALÍTICA'
            });
          }
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      }
    };

    cargarPerfilUsuario();
  }, [userEmail]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Banner Superior de Perfil */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700" />
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-end gap-4 -mt-10">
            <div className="w-20 h-20 bg-slate-900 border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-md">
              <span className="text-xl font-bold uppercase">{perfil.nombre.slice(0, 2)}</span>
            </div>
            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">{perfil.nombre}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-600">{perfil.emailCorporativo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Rol: {perfil.rol}
            </span>
          </div>
        </div>
      </div>

      {/* Secciones de Información */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información de Contacto */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Mail className="w-4 h-4 text-blue-600" /> Información de Contacto
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Correo Institucional / Corporativo:</span>
              <span className="font-bold text-blue-600">{perfil.emailCorporativo}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Teléfono / Móvil:
              </span>
              <span className="font-semibold text-slate-800">{perfil.telefono}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Ubicación:
              </span>
              <span className="font-semibold text-slate-800">{perfil.ubicacion}</span>
            </div>
          </div>
        </div>

        {/* Perfil Profesional y Asignación */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-4 h-4 text-blue-600" /> Perfil Profesional y Asignación
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Nivel Educativo:
              </span>
              <span className="font-semibold text-slate-800">{perfil.nivelEducativo}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Proyecto / Módulo Asignado:</span>
              <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg">
                {perfil.proyecto}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};