import type { RegionNode, ConnectionLink } from '../types/infrastructure';

export const MOCK_REGIONS: RegionNode[] = [
  {
    id: 'us-east-1',
    name: 'US East (N. Virginia)',
    coordinates: [-77.0369, 38.9072],
    status: 'active',
    costMonthly: 817,
    latencyMs: 1.2,
    azsCount: 6,
    services: [
      { name: 'EC2', type: 'Cómputo', instances: 13, status: 'active' },
      { name: 'S3', type: 'Almacenamiento', status: 'active' },
      { name: 'RDS', type: 'Base de Datos', status: 'active' },
      { name: 'VPC', type: 'Red', status: 'active' }
    ]
  },
  {
    id: 'eu-central-1',
    name: 'EU (Frankfurt)',
    coordinates: [8.6821, 50.1109],
    status: 'active',
    costMonthly: 479,
    latencyMs: 14.7,
    azsCount: 3,
    services: [
      { name: 'EC2', type: 'Cómputo', instances: 5, status: 'active' },
      { name: 'S3', type: 'Almacenamiento', status: 'active' }
    ]
  },
  {
    id: 'sa-east-1',
    name: 'South America (São Paulo)',
    coordinates: [-46.6333, -23.5505],
    status: 'active',
    costMonthly: 258.75,
    latencyMs: 32.7,
    azsCount: 3,
    services: [
      { name: 'EC2', type: 'Cómputo', instances: 2, status: 'active' }
    ]
  }
];

export const MOCK_CONNECTIONS: ConnectionLink[] = [
  { fromRegionId: 'us-east-1', toRegionId: 'eu-central-1', status: 'primary' },
  { fromRegionId: 'us-east-1', toRegionId: 'sa-east-1', status: 'backup' }
];