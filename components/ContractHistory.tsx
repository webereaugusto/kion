import React from 'react';
import { ContractHistory as HistoryType } from '../types';
import { formatDateTime } from '../utils/formatters';

interface ContractHistoryProps {
  history: HistoryType[];
}

const ContractHistory: React.FC<ContractHistoryProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <i className="fas fa-history text-3xl mb-2"></i>
        <p>Nenhuma alteração registrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item, idx) => (
        <div 
          key={item.id} 
          className={`p-4 rounded-lg border-l-4 ${idx === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-slate-800 capitalize">{item.field}</span>
            <span className="text-xs text-gray-500">{formatDateTime(item.changedAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded line-through">
              {item.oldValue || '(vazio)'}
            </span>
            <i className="fas fa-arrow-right text-gray-400"></i>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
              {item.newValue || '(vazio)'}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <i className="fas fa-user mr-1"></i>
            {item.changedBy}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContractHistory;
