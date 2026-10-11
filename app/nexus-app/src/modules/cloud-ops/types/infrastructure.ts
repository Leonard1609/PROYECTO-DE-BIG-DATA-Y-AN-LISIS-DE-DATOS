export interface CloudService {
  name: string;
  type: string;
  instances?: number;
  status: 'active' | 'degraded' | 'inactive';
  description?: string; // <-- Agregado para solucionar el error
}

export interface RegionNode {
  id: string;
  name: string;
  coordinates: [number, number];
  status: 'active' | 'failover' | 'down';
  costMonthly: number;
  latencyMs: number;
  azsCount: number;
  availableZones?: string[]; // <-- Agregado para las Zonas de Disponibilidad
  services: CloudService[];
}

export interface ConnectionLink {
  fromRegionId: string;
  toRegionId: string;
  status: 'primary' | 'backup' | 'active_failover';
}