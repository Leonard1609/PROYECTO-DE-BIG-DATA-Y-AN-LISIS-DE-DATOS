import React from 'react';
import { NetworkDiagram } from '../components/NetworkDiagram';
import { Network, Server, Shield, Globe } from 'lucide-react';

export const NetworkPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Arquitectura de Red y VPC</h2>
        <p className="text-sm text-slate-500">Diseño e interconexión de componentes desde Internet hasta la subred privada.</p>
      </div>

      {/* Diagrama Interactivo de Red */}
      <NetworkDiagram />

      {/* Explicación de los Componentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            <h4 className="font-bold text-slate-800 text-sm">Route 53 & CloudFront</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Enrutamiento DNS global de alta disponibilidad combinado con entrega CDN en ubicaciones Edge para aceleración de contenido estático y protección DDoS.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-slate-800 text-sm">Subredes Públicas vs Privadas</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Aislamiento estricto: los balancadores ALB reciben tráfico externo en la subred pública, mientras que las instancias EC2 y bases de datos RDS residen seguras en subredes privadas.
          </p>
        </div>
      </div>
    </div>
  );
};