
import React, { useState } from 'react';
import { OperationType, Contract } from '../types';
import { BRAZILIAN_STATES } from '../constants';
import { analyzeContractFiscalImpact } from '../services/fiscalRules';

interface Props {
  onAdd: (contract: Contract) => void;
}

const FiscalTaggingForm: React.FC<Props> = ({ onAdd }) => {
  const [formData, setFormData] = useState<Partial<Contract>>({
    operationType: OperationType.SALE,
    originState: 'SP',
    destinationState: 'SP',
    status: 'Ativo',
    value: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contractNumber || !formData.partyName || !formData.ncm) return;
    
    const newContract = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
    } as Contract;
    
    onAdd(newContract);
    setFormData({
      operationType: OperationType.SALE,
      originState: 'SP',
      destinationState: 'SP',
      status: 'Ativo',
      value: 0
    });
  };

  const currentAlerts = formData.ncm ? analyzeContractFiscalImpact(formData as Contract) : [];

  const inputClasses = "w-full mt-1.5 p-2.5 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-bold text-slate-900 bg-white placeholder-slate-400";
  const labelClasses = "block text-xs font-black text-slate-700 uppercase tracking-wider";

  return (
    <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
      <h3 className="text-xl font-black mb-6 text-slate-900 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <i className="fas fa-file-invoice-dollar text-white text-sm"></i>
        </div>
        Novo Registro Jurídico-Fiscal
      </h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
        <div>
          <label className={labelClasses}>Nº do Contrato / Referência</label>
          <input 
            type="text" 
            className={inputClasses}
            placeholder="KSA-VND-2024-XXX"
            required
            value={formData.contractNumber || ''}
            onChange={e => setFormData({...formData, contractNumber: e.target.value})}
          />
        </div>

        <div>
          <label className={labelClasses}>Contraparte / Entidade</label>
          <input 
            type="text" 
            className={inputClasses}
            placeholder="Nome oficial da empresa"
            required
            value={formData.partyName || ''}
            onChange={e => setFormData({...formData, partyName: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>NCM do Equipamento</label>
            <input 
              type="text" 
              className={inputClasses}
              placeholder="Ex: 8427.20.10"
              required
              value={formData.ncm || ''}
              onChange={e => setFormData({...formData, ncm: e.target.value})}
            />
          </div>
          <div>
            <label className={labelClasses}>Valor Estimado (BRL)</label>
            <input 
              type="number" 
              className={inputClasses}
              placeholder="0,00"
              required
              value={formData.value || ''}
              onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Tipo de Operação</label>
          <select 
            className={inputClasses}
            value={formData.operationType}
            onChange={e => setFormData({...formData, operationType: e.target.value as OperationType})}
          >
            {Object.values(OperationType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>UF Origem</label>
            <select 
              className={inputClasses}
              value={formData.originState}
              onChange={e => setFormData({...formData, originState: e.target.value})}
            >
              {BRAZILIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>UF Destino</label>
            <select 
              className={inputClasses}
              value={formData.destinationState}
              onChange={e => setFormData({...formData, destinationState: e.target.value})}
            >
              {BRAZILIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-2">
           <button 
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
           >
             <i className="fas fa-check-double"></i> Registrar no Workflow Fiscal
           </button>
        </div>
      </form>

      {/* Real-time Fiscal Logic Demonstration */}
      {currentAlerts.length > 0 && (
        <div className="mt-8 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <h4 className="font-black text-amber-900 mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-shield-alt"></i> Compliance Engine
          </h4>
          <ul className="space-y-4">
            {currentAlerts.map((alert, idx) => (
              <li key={idx} className="bg-white/50 p-3 rounded-lg border border-amber-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${alert.type === 'Opportunity' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {alert.type === 'Opportunity' ? 'Oportunidade' : 'Risco'}
                  </span>
                  <span className="text-xs font-black text-slate-800">{alert.message}</span>
                </div>
                <div className="text-[10px] text-slate-600 font-bold ml-1 leading-relaxed">— {alert.impact}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FiscalTaggingForm;
