import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line
} from 'react-simple-maps';
import type { RegionNode, ConnectionLink } from '../types/infrastructure';

// Archivo TopoJSON estándar del mapa mundial
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GlobalMapProps {
  regions: RegionNode[];
  connections: ConnectionLink[];
  onSelectRegion: (region: RegionNode) => void;
}

export const GlobalMap: React.FC<GlobalMapProps> = ({ regions, connections, onSelectRegion }) => {
  return (
    <div className="w-full bg-[#1e293b] rounded-xl p-4 overflow-hidden shadow-xl">
      <ComposableMap projectionConfig={{ scale: 140, center: [0, 20] }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
  key={geo.rsmKey}
  geography={geo}
  fill="#334155"
  stroke="#1e293b"
  strokeWidth={0.5}
  style={{
    default: { outline: 'none' },
    hover: { fill: '#475569', outline: 'none' }
  } as any}
/>
            ))
          }
        </Geographies>

        {/* Renderizado de líneas de conexión entre regiones */}
        {connections.map((conn, idx) => {
          const origin = regions.find(r => r.id === conn.fromRegionId);
          const target = regions.find(r => r.id === conn.toRegionId);
          if (!origin || !target) return null;

          return (
            <Line
              key={idx}
              from={origin.coordinates}
              to={target.coordinates}
              stroke={conn.status === 'active_failover' ? '#ef4444' : '#6366f1'}
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Renderizado de nodos/marcadore en el mapa */}
        {regions.map((region) => (
          <Marker
            key={region.id}
            coordinates={region.coordinates}
            onClick={() => onSelectRegion(region)}
            className="cursor-pointer"
          >
            <circle
              r={6}
              fill={region.status === 'active' ? '#22c55e' : '#f59e0b'}
              stroke="#ffffff"
              strokeWidth={2}
            />
            <text
              textAnchor="middle"
              y={-12}
              style={{ fill: '#f8fafc', fontSize: '10px', fontWeight: 'bold' }}
            >
              {region.name}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};