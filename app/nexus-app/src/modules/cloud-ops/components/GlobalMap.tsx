import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line
} from 'react-simple-maps';
import type { RegionNode, ConnectionLink } from '../types/infrastructure';
import { Server, X, CheckCircle2, AlertCircle } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GlobalMapProps {
  regions: RegionNode[];
  connections: ConnectionLink[];
}

export const GlobalMap: React.FC<GlobalMapProps> = ({ regions, connections }) => {
  const [selectedRegion, setSelectedRegion] = useState<RegionNode | null>(null);

  return (
    <div className="relative w-full bg-[#0f172a] rounded-xl p-4 border border-slate-800 shadow-2xl overflow-hidden">
      <div className="w-full h-[400px] flex items-center justify-center relative">
        <ComposableMap
          projectionConfig={{ scale: 145, center: [0, 10] }}
          className="w-full h-full"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#334155', outline: 'none' }
                  } as any}
                />
              ))
            }
          </Geographies>

          {connections.map((conn, idx) => {
            const origin = regions.find(r => r.id === conn.fromRegionId);
            const target = regions.find(r => r.id === conn.toRegionId);
            if (!origin || !target) return null;

            const isFailover = conn.status === 'active_failover';

            return (
              <Line
                key={idx}
                from={origin.coordinates}
                to={target.coordinates}
                stroke={isFailover ? '#ef4444' : '#3b82f6'}
                strokeWidth={isFailover ? 2.5 : 1.5}
                strokeDasharray={isFailover ? '5 5' : '3 3'}
              />
            );
          })}

          {regions.map((region) => {
            const isDown = region.status === 'down';
            const isFailover = region.status === 'failover';

            let nodeColor = '#22c55e';
            if (isDown) nodeColor = '#ef4444';
            if (isFailover) nodeColor = '#3b82f6';

            return (
              <Marker
                key={region.id}
                coordinates={region.coordinates}
                onClick={() => setSelectedRegion(region)}
                className="cursor-pointer group"
              >
                <circle
                  r={8}
                  fill={nodeColor}
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="transition-all duration-300 group-hover:r-10"
                />
                <text
                  textAnchor="middle"
                  y={-14}
                  style={{ fill: '#f8fafc', fontSize: '11px', fontWeight: 'bold', pointerEvents: 'none' }}
                >
                  {region.name}
                </text>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* Modal / Popover con diseño limpio, altura controlada y botón de cierre fijo */}
      {selectedRegion && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-30">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full max-h-[92%] flex flex-col text-slate-100 shadow-2xl relative">
            
            {/* Header Fijo con la X de cierre siempre visible */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedRegion.status === 'down' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {selectedRegion.status === 'down' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedRegion.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {selectedRegion.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRegion(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido con scroll interno */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 bg-slate-800/60 p-3 rounded-lg">
                <div>
                  <span className="text-slate-400 block">Estado</span>
                  <span className={`font-bold uppercase ${selectedRegion.status === 'down' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {selectedRegion.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Latencia</span>
                  <span className="font-bold text-slate-200">{selectedRegion.latencyMs} ms</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Costo / Mes</span>
                  <span className="font-bold text-emerald-400">${selectedRegion.costMonthly}</span>
                </div>
              </div>

              {selectedRegion.availableZones && (
                <div className="space-y-1 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-400 block">Zonas de Disponibilidad (AZs):</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedRegion.availableZones.map((az, idx) => (
                      <span key={idx} className="bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[11px] font-mono">
                        {az}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-400 uppercase tracking-wider">Servicios Desplegados</h4>
                <div className="space-y-2">
                  {selectedRegion.services.map((srv, idx) => (
                    <div key={idx} className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50 space-y-1">
                      <div className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="font-bold text-slate-200">{srv.name}</span>
                        <span className="text-[10px] text-slate-400">({srv.type})</span>
                        {srv.instances && <span className="ml-auto text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{srv.instances} Inst.</span>}
                      </div>
                      {srv.description && <p className="text-[11px] text-slate-400 pl-5">{srv.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};