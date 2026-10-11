import React, { useState } from 'react';
import { useCloudOps } from '../context/CloudOpsContext';
import { ClipboardList, PlusCircle, CheckCircle2, Server, Globe, Users } from 'lucide-react';

export const PlanningPage: React.FC = () => {
  const { proposals, addProposal, setActiveTab } = useCloudOps();

  // Formulario inicia estrictamente VACÍO
  const [form, setForm] = useState({
    solutionName: '',
    appType: 'Web Application',
    description: '',
    selectedRegion: '', // Vacío para que el usuario seleccione obligatoriamente
    estimatedUsers: 0,
    availabilityLevel: '',
    selectedService: 'Amazon EC2', // Menú desplegable en vez de texto libre
    migrationGoal: '',
  });

  const awsServiceOptions = [
    { name: 'Amazon EC2', desc: 'Servidor virtual elástico en la nube para cómputo escalable.' },
    { name: 'Amazon S3', desc: 'Almacenamiento de objetos seguro y de alta durabilidad.' },
    { name: 'Amazon RDS', desc: 'Base de datos relacional administrada (PostgreSQL/MySQL).' },
    { name: 'Amazon CloudFront', desc: 'Red de entrega de contenido (CDN) global de baja latencia.' },
  ];

  const handleServiceChange = (serviceName: string) => {
    const found = awsServiceOptions.find(s => s.name === serviceName);
    setForm({
      ...form,
      selectedService: serviceName,
      description: found ? found.desc : '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.solutionName || !form.selectedRegion) return;

    addProposal({
      solutionName: form.solutionName,
      appType: form.appType,
      description: form.description || 'Arquitectura cloud propuesta.',
      selectedRegion: form.selectedRegion,
      estimatedUsers: Number(form.estimatedUsers),
      availabilityLevel: form.availabilityLevel || '99.9%',
      selectedServices: [form.selectedService],
      migrationGoal: form.migrationGoal,
    });

    // Redirigir automáticamente al apartado de Costos como indicó el profesor
    setActiveTab('costos');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Planificación Cloud</h2>
        <p className="text-sm text-slate-500">Registra y analiza propuestas de arquitectura de soluciones en la nube.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            Nueva Propuesta Cloud
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nombre de Solución</label>
              <input
                type="text"
                required
                placeholder="ej. Portal Bancario V2"
                value={form.solutionName}
                onChange={(e) => setForm({ ...form, solutionName: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tipo de Aplicación</label>
              <select
                value={form.appType}
                onChange={(e) => setForm({ ...form, appType: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Web Application">Web Application</option>
                <option value="Mobile Backend">Mobile Backend API</option>
                <option value="Data Processing">Procesamiento de Datos / Analytics</option>
                <option value="Microservicios">Arquitectura Microservicios</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Región AWS</label>
              <select
                required
                value={form.selectedRegion}
                onChange={(e) => setForm({ ...form, selectedRegion: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="">-- Seleccione Región --</option>
                <option value="us-east-1 (Norte de Virginia)">us-east-1 (Norte de Virginia)</option>
                <option value="us-west-2 (Oregón)">us-west-2 (Oregón)</option>
                <option value="sa-east-1 (São Paulo)">sa-east-1 (São Paulo)</option>
                <option value="eu-west-1 (Irlanda)">eu-west-1 (Irlanda)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Servicio AWS (Selector)</label>
              <select
                value={form.selectedService}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                {awsServiceOptions.map((srv, idx) => (
                  <option key={idx} value={srv.name}>{srv.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Usuarios Est.</label>
                <input
                  type="number"
                  placeholder="ej. 5000"
                  value={form.estimatedUsers || ''}
                  onChange={(e) => setForm({ ...form, estimatedUsers: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">SLA Requerido</label>
                <input
                  type="text"
                  placeholder="ej. 99.99%"
                  value={form.availabilityLevel}
                  onChange={(e) => setForm({ ...form, availabilityLevel: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Descripción del Servicio</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 text-slate-600"
                placeholder="Seleccione un servicio para autocompletar..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-md shadow-blue-500/20"
            >
              Registrar Propuesta e Ir a Costos
            </button>
          </form>
        </div>

        {/* Lista de Propuestas */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-700" />
            Propuestas Registradas ({proposals.length})
          </h3>

          <div className="space-y-4">
            {proposals.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                No hay propuestas registradas. El sistema se encuentra limpio y activo para nuevas simulaciones.
              </div>
            ) : (
              proposals.map((prop) => (
                <div key={prop.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                        {prop.appType}
                      </span>
                      <h4 className="text-lg font-bold text-slate-800 mt-1">{prop.solutionName}</h4>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{prop.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-600">{prop.description}</p>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate">{prop.selectedRegion}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{prop.estimatedUsers.toLocaleString()} usuarios</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>SLA: {prop.availabilityLevel}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Servicios Incluidos</span>
                    <div className="flex flex-wrap gap-1.5">
                      {prop.selectedServices.map((srv, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded font-medium border border-slate-200 flex items-center gap-1">
                          <Server className="w-3 h-3 text-slate-400" />
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};