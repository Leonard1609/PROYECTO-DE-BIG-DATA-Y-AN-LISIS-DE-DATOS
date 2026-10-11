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
    availableZones: ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d'],
    services: [
      { name: 'EC2', type: 'Cómputo', instances: 13, status: 'active', description: 'Servidor virtual elástico en la nube.' },
      { name: 'S3', type: 'Almacenamiento', status: 'active', description: 'Almacenamiento de objetos altamente durable.' },
      { name: 'RDS', type: 'Base de Datos', status: 'active', description: 'Base de datos relacional administrada.' },
      { name: 'VPC', type: 'Red', status: 'active', description: 'Red virtual aislada para subredes.' }
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
    availableZones: ['eu-central-1a', 'eu-central-1b', 'eu-central-1c'],
    services: [
      { name: 'EC2', type: 'Cómputo', instances: 5, status: 'active', description: 'Instancias de cómputo optimizadas para Europa.' },
      { name: 'S3', type: 'Almacenamiento', status: 'active', description: 'Respaldo regional secundario.' }
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
    availableZones: ['sa-east-1a', 'sa-east-1c', 'sa-east-1d'],
    services: [
      { name: 'EC2', type: 'Cómputo', instances: 2, status: 'active', description: 'Instancias de baja latencia para Sudamérica.' }
    ]
  }
];

export const MOCK_CONNECTIONS: ConnectionLink[] = [
  { fromRegionId: 'us-east-1', toRegionId: 'eu-central-1', status: 'primary' },
  { fromRegionId: 'us-east-1', toRegionId: 'sa-east-1', status: 'backup' }
];