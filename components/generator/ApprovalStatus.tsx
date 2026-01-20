import React, { useState } from 'react';
import { Approver, DraftStatus } from '../../types';

interface Props {
  status: DraftStatus;
  approvers: Approver[];
  shareToken?: string;
  rejectionReason?: string;
  onSubmitForApproval: () => void;
  onAddApprover: (approver: Approver) => void;
  isSubmitting?: boolean;
}

const ApprovalStatus: React.FC<Props> = ({
  status,
  approvers,
  shareToken,
  rejectionReason,
  onSubmitForApproval,
  onAddApprover,
  isSubmitting
}) => {
  const [showAddApprover, setShowAddApprover] = useState(false);
  const [newApprover, setNewApprover] = useState({ name: '', email: '' });
  const [copied, setCopied] = useState(false);

  const shareUrl = shareToken ? `${window.location.origin}/contract/${shareToken}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddApprover = () => {
    if (newApprover.name && newApprover.email) {
      onAddApprover({
        name: newApprover.name,
        email: newApprover.email,
        status: 'pending'
      });
      setNewApprover({ name: '', email: '' });
      setShowAddApprover(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'Rascunho': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Aguardando Aprovação': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Aprovado': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Rejeitado': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'Rascunho': return 'fa-file-alt';
      case 'Aguardando Aprovação': return 'fa-clock';
      case 'Aprovado': return 'fa-check-circle';
      case 'Rejeitado': return 'fa-times-circle';
      default: return 'fa-file-alt';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider mb-2">
            <i className="fas fa-clipboard-check mr-2 text-blue-600"></i>
            Status do Contrato
          </h3>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold ${getStatusColor()}`}>
            <i className={`fas ${getStatusIcon()}`}></i>
            {status}
          </div>
        </div>
        
        {status === 'Rascunho' && (
          <button
            onClick={onSubmitForApproval}
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Enviando...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Enviar para Aprovação
              </>
            )}
          </button>
        )}
      </div>

      {/* Rejection Reason */}
      {status === 'Rejeitado' && rejectionReason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="font-bold text-red-800 mb-2">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Motivo da Rejeição
          </div>
          <p className="text-sm text-red-700">{rejectionReason}</p>
        </div>
      )}

      {/* Share Link */}
      {shareToken && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="font-bold text-blue-800 mb-3">
            <i className="fas fa-link mr-2"></i>
            Link para Compartilhamento
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <>
                  <i className="fas fa-check mr-1"></i>
                  Copiado!
                </>
              ) : (
                <>
                  <i className="fas fa-copy mr-1"></i>
                  Copiar
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Envie este link para os aprovadores visualizarem e aprovarem o contrato.
          </p>
        </div>
      )}

      {/* Approvers List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">
            <i className="fas fa-user-check mr-2 text-blue-600"></i>
            Aprovadores ({approvers.length})
          </h3>
          {status !== 'Aprovado' && (
            <button
              onClick={() => setShowAddApprover(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-bold"
            >
              <i className="fas fa-plus mr-1"></i>
              Adicionar
            </button>
          )}
        </div>

        {approvers.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <i className="fas fa-users text-3xl text-gray-300 mb-2"></i>
            <p className="text-gray-500 text-sm">Nenhum aprovador adicionado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approvers.map((approver, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border flex items-center justify-between ${
                  approver.status === 'approved' 
                    ? 'bg-emerald-50 border-emerald-200'
                    : approver.status === 'rejected'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    approver.status === 'approved'
                      ? 'bg-emerald-500 text-white'
                      : approver.status === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    <i className={`fas ${
                      approver.status === 'approved' ? 'fa-check' :
                      approver.status === 'rejected' ? 'fa-times' :
                      'fa-user'
                    }`}></i>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{approver.name}</div>
                    <div className="text-sm text-gray-500">{approver.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold uppercase ${
                    approver.status === 'approved' ? 'text-emerald-600' :
                    approver.status === 'rejected' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {approver.status === 'approved' ? 'Aprovado' :
                     approver.status === 'rejected' ? 'Rejeitado' :
                     'Pendente'}
                  </div>
                  {approver.approvedAt && (
                    <div className="text-[10px] text-gray-400">
                      {new Date(approver.approvedAt).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Approver Modal */}
        {showAddApprover && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="font-bold text-lg mb-4">Adicionar Aprovador</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={newApprover.name}
                    onChange={(e) => setNewApprover(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={newApprover.email}
                    onChange={(e) => setNewApprover(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddApprover(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddApprover}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalStatus;
