import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CostEstimateItem, CloudProposal } from '../types/cloud';

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

interface CloudOpsContextType {
  costs: (CostEstimateItem & { region?: string })[];
  proposals: CloudProposal[];
  isFailoverActive: boolean;
  activeTab: string;
  selectedRegion: string;
  setActiveTab: (tab: string) => void;
  setSelectedRegion: (region: string) => void;
  addCostItem: (item: Omit<CostEstimateItem, 'id'> & { region?: string }) => void;
  deleteCostItem: (id: string) => void;
  addProposal: (proposal: Omit<CloudProposal, 'id' | 'createdAt'>) => void;
  clearDashboard: () => void;
  toggleFailover: () => void;
  metrics: MetricSummary;
  instances: InstanceEC2[];
  setInstances: React.Dispatch<React.SetStateAction<InstanceEC2[]>>;
  logs: CloudOpsLog[];
  toggleInstanceStatus: (id: string) => void;
}

const CloudOpsContext = createContext<CloudOpsContextType | undefined>(undefined);

export const CloudOpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [costs, setCosts] = useState<(CostEstimateItem & { region?: string })[]>(() => {
    const saved = localStorage.getItem('cloudops_costs');
    return saved ? JSON.parse(saved) : [];
  });

  const [proposals, setProposals] = useState<CloudProposal[]>(() => {
    const saved = localStorage.getItem('cloudops_proposals');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRegion, setSelectedRegion] = useState<string>('us-east-1 (Norte de Virginia)');
  const [isFailoverActive, setIsFailoverActive] = useState<boolean>(false);

  const [metrics] = useState<MetricSummary>({
    cpuGlobal: 0,
    ramUsage: 0,
    activeInstances: 0,
    totalVpcs: 0,
    monthlyCostEstimate: 0,
  });

  const [instances, setInstances] = useState<InstanceEC2[]>([]);
  const [logs] = useState<CloudOpsLog[]>([]);

  useEffect(() => {
    localStorage.setItem('cloudops_costs', JSON.stringify(costs));
  }, [costs]);

  useEffect(() => {
    localStorage.setItem('cloudops_proposals', JSON.stringify(proposals));
  }, [proposals]);

  const addCostItem = (itemData: Omit<CostEstimateItem, 'id'> & { region?: string }) => {
    const newItem = {
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

    if (proposalData.selectedRegion) {
      setSelectedRegion(proposalData.selectedRegion);
    }

    const serviceName = proposalData.selectedServices[0] || 'Amazon EC2';
    const estimatedMonthlyCost = 120.00;
    
    // Asociamos la región al costo registrado
    addCostItem({
      serviceId: 'custom-prop',
      serviceName: `${serviceName} (${proposalData.solutionName})`,
      quantity: proposalData.selectedServices.length,
      hoursPerMonth: 720,
      unitCostPerHour: 0.0833,
      monthlyCost: estimatedMonthlyCost * proposalData.selectedServices.length,
      annualCost: estimatedMonthlyCost * proposalData.selectedServices.length * 12,
      region: proposalData.selectedRegion,
    });
  };

  const clearDashboard = () => {
    setCosts([]);
    setProposals([]);
    setIsFailoverActive(false);
    setSelectedRegion('us-east-1 (Norte de Virginia)');
    localStorage.removeItem('cloudops_costs');
    localStorage.removeItem('cloudops_proposals');
  };

  const toggleFailover = () => {
    setIsFailoverActive((prev) => !prev);
  };

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
        costs,
        proposals,
        isFailoverActive,
        activeTab,
        selectedRegion,
        setActiveTab,
        setSelectedRegion,
        addCostItem,
        deleteCostItem,
        addProposal,
        clearDashboard,
        toggleFailover,
        metrics,
        instances,
        setInstances,
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