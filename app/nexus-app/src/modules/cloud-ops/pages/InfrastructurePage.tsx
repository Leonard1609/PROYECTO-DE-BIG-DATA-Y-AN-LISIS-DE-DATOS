import React from 'react';
import { INITIAL_REGIONS } from '../data/awsServicesData';
import { RegionCard } from '../components/RegionCard';
import { useCloudOps } from '../context/CloudOpsContext';
import { Globe2, Server, ShieldCheck, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { GlobalMap } from '../components/GlobalMap';
import { MOCK_REGIONS, MOCK_CONNECTIONS } from '../data/mockInfrastructure';

export const InfrastructurePage: React.FC = () => {
  const { isFailoverActive, toggleFailover } = useCloudOps();

  // Calcular el estado dinámico del mapa según el botón de Failover
  const currentRegions = MOCK_REGIONS.map((region) => {
    if (isFailoverActive) {
      if (region.id === 'sa-east-1') return { ...region, status: 'down' as const };
      if (region.id === 'us-east-1') return { ...region, status: 'failover' as const, latencyMs: region.latencyMs + 18 };
    }
    return region;
  });

  const currentConnections = MOCK_CONNECTIONS.map((conn) => {
    if (isFailoverActive && conn.fromRegionId === 'us-east-1' && conn.toRegionId === 'sa-east-1') {
      return { ...conn, status: 'active_failover' as const };
    }
    return conn;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Infraestructura Global AWS</h2>
          <p className="text-sm text-slate-500">Visualización de Regiones, Zonas de Disponibilidad y Failover.</p>
        </div>
        <button
          onClick={toggleFailover}
          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
            isFailoverActive
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {isFailoverActive ? 'Restablecer Infraestructura' : 'Simular Falla (Failover)'}
        </button>
      </div>

      {/* Banner de Failover */}
      {isFailoverActive && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <Activity className="w-5 h-5 text-amber-600 animate-pulse" />
            <span>Alerta de Conmutación por Error (Failover Activado)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-amber-100 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">Región Caída:</span>
              <span className="font-bold text-red-600">sa-east-1 (São Paulo)</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />
              <div>
                <span className="text-slate-400 block font-semibold">Salto a Región Destino:</span>
                <span className="font-bold text-emerald-600">us-east-1 (N. Virginia)</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Impacto en Latencia y Costo:</span>
              <span className="font-semibold text-slate-700">+18ms | Diferencial Costo: +5%</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Trazabilidad de Estado:</span>
              <span className="font-bold text-blue-600">Transacción Segura (100% Sincronizado)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">33+ Regiones</h4>
            <p className="text-xs text-slate-500">Ubicaciones geográficas globales</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">105+ Zonas AZ</h4>
            <p className="text-xs text-slate-500">Data centers aislados con energía redundante</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">600+ Puntos Edge</h4>
            <p className="text-xs text-slate-500">Caché de baja latencia con CloudFront</p>
          </div>
        </div>
      </div>

      {/* Mapa Interactivo con datos reactivos */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-base">Mapa de Red y Resiliencia Multirregión</h3>
        <GlobalMap
          regions={currentRegions}
          connections={currentConnections}
        />
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-base">Regiones Seleccionadas en la Solución</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INITIAL_REGIONS.map((region) => (
            <RegionCard key={region.id} region={region} />
          ))}
        </div>
      </div>
    </div>
  );
};