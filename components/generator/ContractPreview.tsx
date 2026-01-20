import React from 'react';
import { ContractDraft } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  draft: Partial<ContractDraft>;
}

const ContractPreview: React.FC<Props> = ({ draft }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'A definir';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header do Preview */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-black tracking-tight">KION GROUP</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-[0.3em]">
              Linde • STILL • Baoli • Dematic
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase">Preview</div>
            <div className="text-sm font-bold">{draft.status || 'Rascunho'}</div>
          </div>
        </div>
        <div className="text-center py-4 border-t border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Contrato de</div>
          <div className="text-xl font-black">{draft.contractType || 'Tipo não selecionado'}</div>
        </div>
      </div>

      {/* Corpo do Preview */}
      <div className="p-6 space-y-6">
        {/* Título */}
        <div className="text-center pb-4 border-b">
          <h2 className="text-lg font-bold text-slate-800">
            {draft.title || 'Título do Contrato'}
          </h2>
        </div>

        {/* Informações Gerais */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">Valor Total</div>
            <div className="text-lg font-black text-slate-800">
              {formatCurrency(draft.value || 0)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">Vigência</div>
            <div className="text-lg font-black text-slate-800">
              {draft.durationMonths ? `${draft.durationMonths} meses` : 'A definir'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">Data de Início</div>
            <div className="font-bold text-slate-700">{formatDate(draft.startDate)}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">Garantia</div>
            <div className="font-bold text-slate-700">
              {draft.warrantyMonths ? `${draft.warrantyMonths} meses` : '12 meses'}
            </div>
          </div>
        </div>

        {/* Partes */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2">
            <i className="fas fa-users mr-2 text-blue-600"></i>
            Das Partes
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-[10px] text-blue-600 uppercase font-bold mb-2">Contratada</div>
              <div className="font-bold text-slate-800">KION South America Ltda.</div>
              <div className="text-sm text-gray-600">CNPJ: 00.000.000/0001-00</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="text-[10px] text-emerald-600 uppercase font-bold mb-2">Contratante</div>
              <div className="font-bold text-slate-800">{draft.clientName || 'Cliente não informado'}</div>
              {draft.clientCnpj && <div className="text-sm text-gray-600">CNPJ: {draft.clientCnpj}</div>}
              {draft.clientContactName && <div className="text-sm text-gray-600">Contato: {draft.clientContactName}</div>}
            </div>
          </div>
        </div>

        {/* Equipamento */}
        {(draft.brand || draft.equipmentDescription) && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2">
              <i className="fas fa-cogs mr-2 text-blue-600"></i>
              Do Equipamento
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              {draft.brand && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                    {draft.brand}
                  </span>
                  {draft.equipmentCategory && (
                    <span className="text-sm text-gray-600">{draft.equipmentCategory}</span>
                  )}
                </div>
              )}
              {draft.equipmentQuantity && draft.equipmentQuantity > 1 && (
                <div className="text-sm font-bold text-slate-700 mb-2">
                  Quantidade: {draft.equipmentQuantity} unidade(s)
                </div>
              )}
              {draft.equipmentDescription && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {draft.equipmentDescription}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cláusulas */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2">
            <i className="fas fa-list-ol mr-2 text-blue-600"></i>
            Das Cláusulas ({draft.clauses?.length || 0})
          </h3>
          
          {(!draft.clauses || draft.clauses.length === 0) ? (
            <div className="text-center py-8 text-gray-400">
              <i className="fas fa-file-alt text-3xl mb-2"></i>
              <p className="text-sm">Nenhuma cláusula adicionada</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {draft.clauses.map((clause, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <div className="font-bold text-sm text-slate-800 mb-1">
                    Cláusula {clause.number}ª - {clause.title}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-3">
                    {clause.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Termos Customizados */}
        {draft.customTerms && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2">
              <i className="fas fa-edit mr-2 text-blue-600"></i>
              Disposições Especiais
            </h3>
            <p className="text-sm text-gray-600 p-4 bg-amber-50 rounded-lg border border-amber-100">
              {draft.customTerms}
            </p>
          </div>
        )}

        {/* Condições de Pagamento */}
        {draft.paymentTerms && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2">
              <i className="fas fa-credit-card mr-2 text-blue-600"></i>
              Condições de Pagamento
            </h3>
            <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
              {draft.paymentTerms}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 border-t text-center text-[10px] text-gray-400 uppercase tracking-wider">
        Documento de Preview • Não possui validade jurídica
      </div>
    </div>
  );
};

export default ContractPreview;
