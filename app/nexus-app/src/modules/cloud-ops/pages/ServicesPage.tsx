import React, { useState } from 'react';
import { INITIAL_SERVICES } from '../data/awsServicesData';
import { ServiceCard } from '../components/ServiceCard';
import { Search, Filter, Layers } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Compute', 'Storage', 'Database', 'Security', 'Networking'];

  const filteredServices = INITIAL_SERVICES.filter((srv) => {
    const matchesSearch = srv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          srv.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || srv.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Catálogo de Servicios AWS</h2>
        <p className="text-sm text-slate-500">Consulta de componentes de infraestructura disponibles en el proyecto.</p>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar servicio (ej. EC2, S3)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))
        ) : (
          <div className="col-span-full bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500 text-sm">
            No se encontraron servicios que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};