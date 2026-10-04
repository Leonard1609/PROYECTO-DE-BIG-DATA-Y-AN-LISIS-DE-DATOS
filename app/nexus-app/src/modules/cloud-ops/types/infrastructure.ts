export interface CloudService {
  name: string;
  type: string;
  instances?: number;
  status: 'active' | 'degraded' | 'inactive';
}

export interface RegionNode {
  id: string;
  name: string;
  coordinates: [number, number]; // [Longitud, Latitud] para react-simple-maps
  status: 'active' | 'failover' | 'down';
  costMonthly: number;
  latencyMs: number;
  azsCount: number;
  services: CloudService[];
}

export interface ConnectionLink {
  fromRegionId: string;
  toRegionId: string;
  status: 'primary' | 'backup' | 'active_failover';
}