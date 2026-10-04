import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COSTS } from '../data/awsServicesData';
import type { CostEstimateItem, CloudProposal } from '../types/cloud';

// ==========================================
// 1. Tipos de datos adicionales para CloudOps
// ==========================================
export interface InstanceEC2 {
  id: string;
  name: string;
  type: string;
  region: string;
  status: 'running' | 'stopped' | 'pending';
  ipPublica: string;
  cpuUsage: number;
}

export interface MetricSummary {
  cpuGlobal: number;
  ramUsage: number;
  activeInstances: number;
  totalVpcs: number;
  monthlyCostEstimate: number;
}

export interface CloudOpsLog {
  id: string;
  timestamp: string;
  service: string;
  event: string;
  level: 'INFO' | 'WARN' | 'ERROR';
}

// ==========================================
// 2. Datos Mock Locales para CloudOps
// ==========================================
const MOCK_CLOUDOPS_METRICS: MetricSummary = {
  cpuGlobal: 42.5,
  ramUsage: 68.2,
  activeInstances: 3,
  totalVpcs: 2,
  monthlyCostEstimate: 245.80,
};

const MOCK_EC2_INSTANCES: InstanceEC2[] = [
  {
    id: 'i-0a12b34c567d890ef',
    name: 'web-frontend-prod',
    type: 't3.medium',
    region: 'us-east-1a',
    status: 'running',
    ipPublica: '54.210.12.88',
    cpuUsage: 34,
  },
  {
    id: 'i-0f98e76d543c210ab',
    name: 'backend-api-gateway',
    type: 't3.large',
    region: 'us-east-1b',
    status: 'running',
    ipPublica: '52.90.142.11',
    cpuUsage: 58,
  },
  {
    id: 'i-0c112233445566778',
    name: 'db-postgres-primary',
    type: 'r5.xlarge',
    region: 'us-east-1a',
    status: 'running',
    ipPublica: '10.0.1.45 (Privada)',
    cpuUsage: 71,
  },
  {
    id: 'i-0d998877665544332',
    name: 'worker-queue-service',
    type: 't3.small',
    region: 'us-east-1c',
    status: 'stopped',
    ipPublica: 'N/A',
    cpuUsage: 0,
  },
];

const MOCK_CLOUDOPS_LOGS: CloudOpsLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-10-04 16:45:12',
    service: 'Auto Scaling',
    event: 'Instancia web-frontend-prod escalada correctamente.',
    level: 'INFO',
  },
  {
    id: 'log-002',
    timestamp: '2026-10-04 15:30:00',
    service: 'CloudWatch',
    event: 'Uso de CPU en db-postgres-primary superó el 70%.',
    level: 'WARN',
  },
  {
    id: 'log-003',
    timestamp: '2026-10-04 12:10:05',
    service: 'AWS VPC',
    event: 'Tabla de ruteo actualizada en Subnet Pública 1.',
    level: 'INFO',
  },
];

// ==========================================
// 3. Interfaz del Contexto Extendida
// ==========================================
interface CloudOpsContextType {
  // Datos originales
  costs: CostEstimateItem[];
  proposals: CloudProposal[];
  isFailoverActive: boolean;
  addCostItem: (item: Omit<CostEstimateItem, 'id'>) => void;
  deleteCostItem: (id: string) => void;
  addProposal: (proposal: Omit<CloudProposal, 'id' | 'createdAt'>) => void;
  clearDashboard: () => void;
  toggleFailover: () => void;
  
  // Datos y acciones Mock agregados
  metrics: MetricSummary;
  instances: InstanceEC2[];
  logs: CloudOpsLog[];
  toggleInstanceStatus: (id: string) => void;
}

const CloudOpsContext = createContext<CloudOpsContextType | undefined>(undefined);

export const CloudOpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Estados Originales ---
  const [costs, setCosts] = useState<CostEstimateItem[]>(() => {
    const saved = localStorage.getItem('cloudops_costs');
    return saved ? JSON.parse(saved) : INITIAL_COSTS;
  });

  const [proposals, setProposals] = useState<CloudProposal[]>(() => {
    const saved = localStorage.getItem('cloudops_proposals');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'prop-1',
            solutionName: 'E-Commerce Enterprise AWS',
            appType: 'Web & API Microservicios',
            description: 'Migración de arquitectura monolítica a contenedores escalables.',
            selectedRegion: 'us-east-1 (Norte de Virginia)',
            estimatedUsers: 50000,
            availabilityLevel: '99.99%',
            selectedServices: ['Amazon EC2', 'Amazon RDS', 'Amazon S3', 'Amazon CloudFront'],
            migrationGoal: 'Mejorar disponibilidad y reducir latencia.',
            createdAt: '2026-10-01',
          },
        ];
  });

  const [isFailoverActive, setIsFailoverActive] = useState<boolean>(false);

  // --- Estados Mock Agregados ---
  const [metrics] = useState<MetricSummary>(MOCK_CLOUDOPS_METRICS);
  const [instances, setInstances] = useState<InstanceEC2[]>(MOCK_EC2_INSTANCES);
  const [logs] = useState<CloudOpsLog[]>(MOCK_CLOUDOPS_LOGS);

  // --- Efeectos Originales ---
  useEffect(() => {
    localStorage.setItem('cloudops_costs', JSON.stringify(costs));
  }, [costs]);

  useEffect(() => {
    localStorage.setItem('cloudops_proposals', JSON.stringify(proposals));
  }, [proposals]);

  // --- Funciones Originales ---
  const addCostItem = (itemData: Omit<CostEstimateItem, 'id'>) => {
    const newItem: CostEstimateItem = {
      ...itemData,
      id: `c-${Date.now()}`,
    };
    setCosts((prev) => [...prev, newItem]);
  };

  const deleteCostItem = (id: string) => {
    setCosts((prev) => prev.filter((c) => c.id !== id));
  };

  const addProposal = (proposalData: Omit<CloudProposal, 'id' | 'createdAt'>) => {
    const newProp: CloudProposal = {
      ...proposalData,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProposals((prev) => [newProp, ...prev]);
  };

  const clearDashboard = () => {
    setCosts([]);
    setProposals([]);
    setIsFailoverActive(false);
    localStorage.removeItem('cloudops_costs');
    localStorage.removeItem('cloudops_proposals');
  };

  const toggleFailover = () => {
    setIsFailoverActive((prev) => !prev);
  };

  // --- Función Mock Agregada para Interacción ---
  const toggleInstanceStatus = (id: string) => {
    setInstances((prev) =>
      prev.map((inst) => {
        if (inst.id === id) {
          const nextStatus = inst.status === 'running' ? 'stopped' : 'running';
          return {
            ...inst,
            status: nextStatus,
            cpuUsage: nextStatus === 'running' ? 25 : 0,
          };
        }
        return inst;
      })
    );
  };

  return (
    <CloudOpsContext.Provider
      value={{
        // Originales
        costs,
        proposals,
        isFailoverActive,
        addCostItem,
        deleteCostItem,
        addProposal,
        clearDashboard,
        toggleFailover,
        
        // Mock agregados
        metrics,
        instances,
        logs,
        toggleInstanceStatus,
      }}
    >
      {children}
    </CloudOpsContext.Provider>
  );
};

export const useCloudOps = () => {
  const context = useContext(CloudOpsContext);
  if (!context) {
    throw new Error('useCloudOps debe ser usado dentro de un CloudOpsProvider');
  }
  return context;
};