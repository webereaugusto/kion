import React from 'react';
import { ContractDraftType, EquipmentCategory, KionBrand } from '../../types';

interface Props {
  contractType: ContractDraftType;
  brand?: KionBrand;
  category?: EquipmentCategory;
  onContractTypeChange: (type: ContractDraftType) => void;
  onBrandChange: (brand: KionBrand) => void;
  onCategoryChange: (category: EquipmentCategory) => void;
}

const CONTRACT_TYPES: { value: ContractDraftType; label: string; icon: string; description: string }[] = [
  { value: 'Venda', label: 'Venda', icon: 'fa-shopping-cart', description: 'Fornecimento de equipamentos' },
  { value: 'Locação', label: 'Locação', icon: 'fa-calendar-alt', description: 'Aluguel de equipamentos' },
  { value: 'Manutenção', label: 'Manutenção', icon: 'fa-tools', description: 'Serviços de manutenção' },
  { value: 'Automação', label: 'Automação', icon: 'fa-robot', description: 'Projetos Dematic' },
  { value: 'Comodato', label: 'Comodato', icon: 'fa-handshake', description: 'Empréstimo de equipamentos' }
];

const BRANDS: { value: KionBrand; label: string; color: string }[] = [
  { value: 'Linde', label: 'Linde Material Handling', color: 'bg-red-600' },
  { value: 'STILL', label: 'STILL', color: 'bg-orange-600' },
  { value: 'Baoli', label: 'Baoli', color: 'bg-blue-600' },
  { value: 'Dematic', label: 'Dematic', color: 'bg-purple-600' }
];

const CATEGORIES: { value: EquipmentCategory; label: string; brands: KionBrand[] }[] = [
  { value: 'Empilhadeiras Elétricas', label: 'Empilhadeiras Elétricas', brands: ['Linde', 'STILL', 'Baoli'] },
  { value: 'Empilhadeiras Combustão', label: 'Empilhadeiras Combustão', brands: ['Linde', 'STILL', 'Baoli'] },
  { value: 'Transpaleteiras', label: 'Transpaleteiras', brands: ['Linde', 'STILL', 'Baoli'] },
  { value: 'Rebocadores', label: 'Rebocadores', brands: ['Linde', 'STILL'] },
  { value: 'AGVs/AMRs', label: 'AGVs / AMRs', brands: ['Linde', 'STILL', 'Dematic'] },
  { value: 'Sistemas Dematic', label: 'Sistemas de Automação', brands: ['Dematic'] },
  { value: 'Empilhadeiras e Transpaleteiras', label: 'Frota Mista', brands: ['Linde', 'STILL', 'Baoli'] }
];

const EquipmentSelector: React.FC<Props> = ({
  contractType,
  brand,
  category,
  onContractTypeChange,
  onBrandChange,
  onCategoryChange
}) => {
  const filteredCategories = brand 
    ? CATEGORIES.filter(c => c.brands.includes(brand))
    : CATEGORIES;

  return (
    <div className="space-y-8">
      {/* Tipo de Contrato */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
          <i className="fas fa-file-contract mr-2 text-blue-600"></i>
          Tipo de Contrato
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CONTRACT_TYPES.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => onContractTypeChange(type.value)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                contractType === type.value
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <i className={`fas ${type.icon} text-2xl mb-2 ${
                contractType === type.value ? 'text-blue-600' : 'text-gray-400'
              }`}></i>
              <div className={`font-bold text-sm ${
                contractType === type.value ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {type.label}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                {type.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Marca */}
      {contractType !== 'Manutenção' && (
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
            <i className="fas fa-industry mr-2 text-blue-600"></i>
            Marca
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BRANDS.map(b => (
              <button
                key={b.value}
                type="button"
                onClick={() => onBrandChange(b.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  brand === b.value
                    ? `border-blue-600 bg-blue-50 shadow-lg`
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${b.color} mx-auto mb-2`}></div>
                <div className={`font-bold text-sm ${
                  brand === b.value ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {b.value}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {b.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categoria de Equipamento */}
      {brand && contractType !== 'Manutenção' && (
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
            <i className="fas fa-cogs mr-2 text-blue-600"></i>
            Categoria de Equipamento
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCategories.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => onCategoryChange(cat.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  category === cat.value
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className={`font-bold text-sm ${
                  category === cat.value ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {cat.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentSelector;
