import React from 'react';
import { FilterState, OperationType } from '../types';

interface ContractFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

const ContractFilters: React.FC<ContractFiltersProps> = ({ filters, onChange, onReset }) => {
  const inputClasses = "w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none";

  const hasActiveFilters = filters.search || filters.status || filters.operationType || 
    filters.hasRisk !== null || filters.hasOpportunity !== null;

  return (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
          <i className="fas fa-filter text-blue-600"></i>
          Filtros
        </h4>
        {hasActiveFilters && (
          <button 
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold"
          >
            <i className="fas fa-times mr-1"></i>
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-bold text-gray-600 mb-1">Buscar</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nº contrato, contraparte..."
              className={inputClasses + " pl-9"}
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Status</label>
          <select
            className={inputClasses}
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Vencendo">Vencendo</option>
            <option value="Encerrado">Encerrado</option>
          </select>
        </div>

        {/* Operation Type */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Tipo Operação</label>
          <select
            className={inputClasses}
            value={filters.operationType}
            onChange={(e) => onChange({ ...filters, operationType: e.target.value })}
          >
            <option value="">Todos</option>
            {Object.values(OperationType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Alert Type */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Alertas</label>
          <select
            className={inputClasses}
            value={
              filters.hasRisk === true ? 'risk' : 
              filters.hasOpportunity === true ? 'opportunity' : ''
            }
            onChange={(e) => {
              const value = e.target.value;
              onChange({
                ...filters,
                hasRisk: value === 'risk' ? true : null,
                hasOpportunity: value === 'opportunity' ? true : null
              });
            }}
          >
            <option value="">Todos</option>
            <option value="risk">Com Risco</option>
            <option value="opportunity">Com Oportunidade</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ContractFilters;
