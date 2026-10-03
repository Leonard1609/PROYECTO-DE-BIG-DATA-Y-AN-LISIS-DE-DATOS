import React, { useState } from 'react';
import { INITIAL_COSTS } from '../data/awsServicesData';
import type { CostEstimateItem } from '../types/cloud';
import { DollarSign, Calculator, Plus, Trash2 } from 'lucide-react';

export const CostsPage: React.FC = () => {
  const [costs, setCosts] = useState<CostEstimateItem[]>(INITIAL_COSTS);
  const [newItem, setNewItem] = useState({
    serviceName: '',
    quantity: 1,
    unitCostPerHour: 0.05,
  });

  const totalMonthly = costs.reduce((acc, c) => acc + c.monthlyCost, 0);
  const totalAnnual = totalMonthly * 12;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.serviceName) return;

    const monthlyCost = newItem.quantity * 720 * newItem.unitCostPerHour;
    const item: CostEstimateItem = {
      id: `c-${Date.now()}`,
      serviceId: 'custom',
      serviceName: newItem.serviceName,
      quantity: Number(newItem.quantity),
      hoursPerMonth: 720,
      unitCostPerHour: Number(newItem.unitCostPerHour),
      monthlyCost: monthlyCost,
      annualCost: monthlyCost * 12,
    };

    setCosts([...costs, item]);
    setNewItem({ serviceName: '', quantity: 1, unitCostPerHour: 0.05 });
  };

  const handleDelete = (id: string) => {
    setCosts(costs.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Costos y Economía Cloud</h2>
        <p className="text-sm text-slate-500">Estimación y proyección de presupuestos de infraestructura en AWS.</p>
      </div>

      {/* Resumen Totales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-amber-500 text-white p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-amber-100">Costo Estimado Mensual</span>
            <h3 className="text-3xl font-extrabold mt-1">${totalMonthly.toFixed(2)} USD</h3>
          </div>
          <DollarSign className="w-10 h-10 text-amber-200" />
        </div>

        <div className="bg-slate-800 text-white p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Costo Estimado Anual</span>
            <h3 className="text-3xl font-extrabold mt-1">${totalAnnual.toFixed(2)} USD</h3>
          </div>
          <Calculator className="w-10 h-10 text-slate-500" />
        </div>
      </div>

      {/* Agregar Recurso a la Estimación */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Agregar Componente al Cálculo
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <input
            type="text"
            placeholder="Nombre del Recurso (ej. ElastiCache Redis)"
            required
            value={newItem.serviceName}
            onChange={(e) => setNewItem({ ...newItem, serviceName: e.target.value })}
            className="p-2.5 border border-slate-200 rounded-lg sm:col-span-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Cantidad"
            min="1"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
            className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="number"
            step="0.0001"
            placeholder="USD / Hora"
            value={newItem.unitCostPerHour}
            onChange={(e) => setNewItem({ ...newItem, unitCostPerHour: Number(e.target.value) })}
            className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="sm:col-span-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-lg transition-all"
          >
            Calcular e Insertar
          </button>
        </form>
      </div>

      {/* Tabla de Detalle de Costos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 font-bold text-slate-800 text-sm">
          Detalle de Recursos Estimados
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Servicio / Recurso</th>
                <th className="p-3.5 text-center">Cantidad</th>
                <th className="p-3.5 text-center">Horas / Mes</th>
                <th className="p-3.5 text-right">Costo / Hora</th>
                <th className="p-3.5 text-right">Costo Mensual</th>
                <th className="p-3.5 text-right">Costo Anual</th>
                <th className="p-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {costs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-800">{item.serviceName}</td>
                  <td className="p-3.5 text-center">{item.quantity}</td>
                  <td className="p-3.5 text-center">{item.hoursPerMonth} h</td>
                  <td className="p-3.5 text-right font-mono">${item.unitCostPerHour.toFixed(4)}</td>
                  <td className="p-3.5 text-right font-bold text-slate-800 font-mono">${item.monthlyCost.toFixed(2)}</td>
                  <td className="p-3.5 text-right text-slate-500 font-mono">${item.annualCost.toFixed(2)}</td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};