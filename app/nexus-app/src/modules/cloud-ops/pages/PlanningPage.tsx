import React, { useState } from 'react';
import { useCloudOps } from '../context/CloudOpsContext';
import { ClipboardList, PlusCircle, CheckCircle2, Server, Globe, Users, Target } from 'lucide-react';

interface ServiceOption {
  name: string;
  desc: string;
}

const AWS_SERVICES_CATALOG: ServiceOption[] = [
  { name: 'Amazon EC2', desc: 'Servidores virtuales elásticos para cómputo escalable.' },
  { name: 'Amazon S3', desc: 'Almacenamiento de objetos seguro, duradero y altamente escalable.' },
  { name: 'Amazon RDS', desc: 'Base de datos relacional administrada para PostgreSQL/MySQL.' },
  { name: 'Amazon CloudFront', desc: 'Red de entrega de contenido (CDN) global de baja latencia.' },
  { name: 'AWS Lambda', desc: 'Ejecución de código sin servidor orientada a eventos.' },
  { name: 'Amazon VPC', desc: 'Red virtual aislada para subredes públicas y privadas.' },
];

export const PlanningPage: React.FC = () => {
  // Extraemos setSelectedRegion del contexto
  const { proposals, addProposal, setActiveTab, setSelectedRegion } = useCloudOps();

  const [form, setForm] = useState({
    solutionName: '',
    appType: '',
    selectedRegion: '',
    estimatedUsers: '' as number | '',
    availabilityLevel: '',
    migrationGoal: '',
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const generatedDescription = selectedServices.length > 0
    ? selectedServices
        .map((sName) => {
          const found = AWS_SERVICES_CATALOG.find((item) => item.name === sName);
          return found ? `${found.name}: ${found.desc}` : sName;
        })
        .join(' | ')
    : 'Seleccione uno o más servicios para generar la descripción técnica...';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.solutionName ||
      !form.appType ||
      !form.selectedRegion ||
      selectedServices.length === 0 ||
      !form.estimatedUsers ||
      !form.availabilityLevel ||
      !form.migrationGoal
    ) {
      alert('Por favor complete todos los campos obligatorios: Nombre, Tipo de Aplicación, Región AWS, al menos un servicio, Usuarios Estimados, SLA Requerido y Objetivo de la Migración.');
      return;
    }

    // 1. Agregar la propuesta al estado
    addProposal({
      solutionName: form.solutionName,
      appType: form.appType,
      description: generatedDescription,
      selectedRegion: form.selectedRegion,
      estimatedUsers: Number(form.estimatedUsers),
      availabilityLevel: form.availabilityLevel,
      selectedServices: selectedServices,
      migrationGoal: form.migrationGoal,
    });

    // 2. Sincronizar de forma inmediata la Región Global para el Dashboard
    setSelectedRegion(form.selectedRegion);

    // 3. Redirigir a Costos
    setActiveTab('costos');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Planificación Cloud</h2>
        <p className="text-sm text-slate-500">Registra y analiza propuestas de arquitectura de soluciones en la nube.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            Nueva Propuesta Cloud
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nombre de Solución *</label>
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
              <label className="font-semibold text-slate-700 block mb-1">Tipo de Aplicación *</label>
              <select
                required
                value={form.appType}
                onChange={(e) => setForm({ ...form, appType: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="">-- Seleccione Tipo de Aplicación --</option>
                <option value="Web Application">Web Application</option>
                <option value="Mobile Backend">Mobile Backend API</option>
                <option value="Procesamiento de Datos / Analytics">Procesamiento de Datos / Analytics</option>
                <option value="Microservicios">Arquitectura Microservicios</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Región AWS *</label>
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
              <label className="font-semibold text-slate-700 block mb-1">
                Servicios AWS Incluidos (Selección Múltiple) *
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                {AWS_SERVICES_CATALOG.map((srv) => {
                  const isChecked = selectedServices.includes(srv.name);
                  return (
                    <button
                      type="button"
                      key={srv.name}
                      onClick={() => toggleService(srv.name)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] font-medium border text-left transition-all ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Server className={`w-3 h-3 ${isChecked ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{srv.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Usuarios Est. *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="ej. 5000"
                  value={form.estimatedUsers}
                  onChange={(e) => setForm({ ...form, estimatedUsers: e.target.value ? Number(e.target.value) : '' })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">SLA Requerido *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. 99.99%"
                  value={form.availabilityLevel}
                  onChange={(e) => setForm({ ...form, availabilityLevel: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Descripción del Servicio (Autogenerada)</label>
              <textarea
                rows={3}
                readOnly
                value={generatedDescription}
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-600 text-[11px] cursor-not-allowed focus:outline-none"
              ></textarea>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Objetivo de la Migración *</label>
              <textarea
                rows={2}
                required
                placeholder="ej. Reducir costos de infraestructura física y mejorar disponibilidad multi-zona."
                value={form.migrationGoal}
                onChange={(e) => setForm({ ...form, migrationGoal: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

                  {prop.migrationGoal && (
                    <div className="text-xs bg-amber-50 border border-amber-200/60 p-2.5 rounded-lg text-amber-900 flex items-start gap-2">
                      <Target className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Objetivo:</strong> {prop.migrationGoal}
                      </div>
                    </div>
                  )}

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