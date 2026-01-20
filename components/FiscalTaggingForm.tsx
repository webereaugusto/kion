import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { OperationType, Contract } from '../types';
import { BRAZILIAN_STATES } from '../constants';
import { analyzeContractFiscalImpact } from '../services/fiscalRules';
import { formatNCM, isValidNCM, formatCurrency, parseCurrency } from '../utils/formatters';

interface Props {
  onAdd: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => void | Promise<void>;
  onUpdate?: (contract: Contract) => void | Promise<void>;
  editingContract?: Contract | null;
  onCancelEdit?: () => void;
}

const FiscalTaggingForm: React.FC<Props> = ({ onAdd, onUpdate, editingContract, onCancelEdit }) => {
  const [formData, setFormData] = useState<Partial<Contract>>({
    operationType: OperationType.SALE,
    originState: 'SP',
    destinationState: 'SP',
    status: 'Ativo',
    value: 0,
    expiryDate: ''
  });

  const [displayValue, setDisplayValue] = useState('');
  const [ncmError, setNcmError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados ao editar
  useEffect(() => {
    if (editingContract) {
      setFormData(editingContract);
      setDisplayValue(formatCurrency(editingContract.value));
    } else {
      resetForm();
    }
  }, [editingContract]);

  const resetForm = () => {
    setFormData({
      operationType: OperationType.SALE,
      originState: 'SP',
      destinationState: 'SP',
      status: 'Ativo',
      value: 0,
      expiryDate: ''
    });
    setDisplayValue('');
    setNcmError('');
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(raw || '0') / 100;
    setFormData({ ...formData, value: numValue });
    setDisplayValue(formatCurrency(numValue));
  };

  const handleNCMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNCM(e.target.value);
    setFormData({ ...formData, ncm: formatted });
    
    if (formatted && !isValidNCM(formatted)) {
      setNcmError('NCM deve ter 8 dígitos (ex: 8427.20.10)');
    } else {
      setNcmError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contractNumber || !formData.partyName || !formData.ncm) return;
    if (ncmError) return;

    setIsSubmitting(true);

    try {
      if (editingContract && onUpdate) {
        // Atualizar contrato existente
        const updatedContract: Contract = {
          ...editingContract,
          ...formData,
        } as Contract;
        await onUpdate(updatedContract);
      } else {
        // Criar novo contrato (sem id, createdAt, etc. - o banco gera)
        const newContractData = {
          contractNumber: formData.contractNumber!,
          partyName: formData.partyName!,
          value: formData.value || 0,
          ncm: formData.ncm!,
          originState: formData.originState || 'SP',
          destinationState: formData.destinationState || 'SP',
          operationType: formData.operationType!,
          expiryDate: formData.expiryDate || '',
          status: formData.status || 'Ativo'
        };
        await onAdd(newContractData as Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'history'>);
      }

      resetForm();
      if (onCancelEdit) onCancelEdit();
    } catch (err) {
      console.error('Erro ao salvar contrato:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getChanges = (oldContract: Contract, newContract: Contract) => {
    const changes: Contract['history'] = [];
    const fieldsToTrack = ['contractNumber', 'partyName', 'value', 'ncm', 'originState', 'destinationState', 'operationType', 'status', 'expiryDate'];
    
    fieldsToTrack.forEach(field => {
      const oldVal = String(oldContract[field as keyof Contract] || '');
      const newVal = String(newContract[field as keyof Contract] || '');
      if (oldVal !== newVal) {
        changes.push({
          id: uuidv4(),
          contractId: oldContract.id,
          field,
          oldValue: oldVal,
          newValue: newVal,
          changedAt: new Date().toISOString(),
          changedBy: 'Usuário Sistema'
        });
      }
    });

    return changes;
  };

  const currentAlerts = formData.ncm ? analyzeContractFiscalImpact(formData as Contract) : [];

  const inputClasses = "w-full mt-1.5 p-2.5 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-bold text-slate-900 bg-white placeholder-slate-400";
  const labelClasses = "block text-xs font-black text-slate-700 uppercase tracking-wider";

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <i className={`fas ${editingContract ? 'fa-edit' : 'fa-file-invoice-dollar'} text-white text-sm`}></i>
          </div>
          {editingContract ? 'Editar Contrato' : 'Novo Registro Jurídico-Fiscal'}
        </h3>
        {editingContract && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      
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
              className={`${inputClasses} ${ncmError ? 'border-red-400 focus:border-red-500' : ''}`}
              placeholder="Ex: 8427.20.10"
              required
              value={formData.ncm || ''}
              onChange={handleNCMChange}
              maxLength={10}
            />
            {ncmError && (
              <p className="text-red-500 text-xs mt-1">{ncmError}</p>
            )}
          </div>
          <div>
            <label className={labelClasses}>Valor Estimado (BRL)</label>
            <input 
              type="text" 
              className={inputClasses}
              placeholder="R$ 0,00"
              required
              value={displayValue}
              onChange={handleValueChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className={labelClasses}>Status</label>
            <select 
              className={inputClasses}
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as Contract['status']})}
            >
              <option value="Ativo">Ativo</option>
              <option value="Vencendo">Vencendo</option>
              <option value="Encerrado">Encerrado</option>
            </select>
          </div>
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

        <div>
          <label className={labelClasses}>Data de Vencimento</label>
          <input 
            type="date" 
            className={inputClasses}
            value={formData.expiryDate || ''}
            onChange={e => setFormData({...formData, expiryDate: e.target.value})}
          />
        </div>

        <div className="pt-2 flex gap-3">
          {editingContract && onCancelEdit && (
            <button 
              type="button"
              onClick={onCancelEdit}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
            >
              <i className="fas fa-times"></i> Cancelar
            </button>
          )}
          <button 
            type="submit"
            disabled={isSubmitting || !!ncmError}
            className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-black py-4 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Processando...
              </>
            ) : (
              <>
                <i className={`fas ${editingContract ? 'fa-save' : 'fa-check-double'}`}></i> 
                {editingContract ? 'Salvar Alterações' : 'Registrar no Workflow Fiscal'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Real-time Fiscal Logic Demonstration */}
      {currentAlerts.length > 0 && (
        <div className="mt-8 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <h4 className="font-black text-amber-900 mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-shield-alt"></i> Compliance Engine ({currentAlerts.length} alertas)
          </h4>
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {currentAlerts.map((alert, idx) => (
              <li key={idx} className="bg-white/50 p-3 rounded-lg border border-amber-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                    alert.type === 'Opportunity' ? 'bg-emerald-600 text-white' : 
                    alert.type === 'Risk' ? 'bg-red-600 text-white' : 
                    'bg-blue-600 text-white'
                  }`}>
                    {alert.type === 'Opportunity' ? 'Oportunidade' : alert.type === 'Risk' ? 'Risco' : 'Info'}
                  </span>
                  {alert.code && (
                    <span className="text-[10px] font-mono bg-gray-200 px-1.5 py-0.5 rounded">
                      {alert.code}
                    </span>
                  )}
                </div>
                <div className="text-xs font-black text-slate-800">{alert.message}</div>
                <div className="text-[10px] text-slate-600 font-bold mt-1 leading-relaxed">— {alert.impact}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FiscalTaggingForm;
