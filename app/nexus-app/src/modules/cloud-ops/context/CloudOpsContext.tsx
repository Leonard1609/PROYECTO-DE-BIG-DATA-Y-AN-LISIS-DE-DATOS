import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COSTS } from '../data/awsServicesData';
import type { CostEstimateItem, CloudProposal } from '../types/cloud';

interface CloudOpsContextType {
  costs: CostEstimateItem[];
  proposals: CloudProposal[];
  isFailoverActive: boolean;
  addCostItem: (item: Omit<CostEstimateItem, 'id'>) => void;
  deleteCostItem: (id: string) => void;
  addProposal: (proposal: Omit<CloudProposal, 'id' | 'createdAt'>) => void;
  clearDashboard: () => void;
  toggleFailover: () => void;
}

const CloudOpsContext = createContext<CloudOpsContextType | undefined>(undefined);

export const CloudOpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  useEffect(() => {
    localStorage.setItem('cloudops_costs', JSON.stringify(costs));
  }, [costs]);

  useEffect(() => {
    localStorage.setItem('cloudops_proposals', JSON.stringify(proposals));
  }, [proposals]);

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

  return (
    <CloudOpsContext.Provider
      value={{
        costs,
        proposals,
        isFailoverActive,
        addCostItem,
        deleteCostItem,
        addProposal,
        clearDashboard,
        toggleFailover,
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