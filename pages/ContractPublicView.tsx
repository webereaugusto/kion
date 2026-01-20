import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ContractDraft, Approver } from '../types';
import { useContractDrafts } from '../hooks/useContractDrafts';
import { downloadContractPDF } from '../services/pdfGenerator';
import { formatCurrency } from '../utils/formatters';
import ContractPreview from '../components/generator/ContractPreview';
import kionLogoUrl from '../logo.png';

const ContractPublicView: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { fetchDraftByShareToken, approveDraft, rejectDraft } = useContractDrafts();
  
  const [draft, setDraft] = useState<ContractDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approverInfo, setApproverInfo] = useState({ name: '', email: '', comment: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionComplete, setActionComplete] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    const loadDraft = async () => {
      if (!shareToken) return;
      
      try {
        setLoading(true);
        const data = await fetchDraftByShareToken(shareToken);
        if (data) {
          setDraft(data);
        } else {
          setError('Contrato não encontrado');
        }
      } catch (err) {
        setError('Erro ao carregar contrato');
      } finally {
        setLoading(false);
      }
    };

    loadDraft();
  }, [shareToken, fetchDraftByShareToken]);

  const handleApprove = async () => {
    if (!draft || !approverInfo.name || !approverInfo.email) return;
    
    setIsSubmitting(true);
    try {
      const approver: Approver = {
        name: approverInfo.name,
        email: approverInfo.email,
        status: 'approved',
        comment: approverInfo.comment,
        approvedAt: new Date().toISOString()
      };
      
      const success = await approveDraft(draft.id, approver);
      if (success) {
        setActionComplete('approved');
        setShowApprovalModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!draft || !rejectReason) return;
    
    setIsSubmitting(true);
    try {
      const success = await rejectDraft(draft.id, rejectReason);
      if (success) {
        setActionComplete('rejected');
        setShowRejectModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!draft) return;
    try {
      await downloadContractPDF(draft);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Carregando contrato...</p>
        </div>
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <i className="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Contrato não encontrado</h1>
          <p className="text-gray-600 mb-6">
            O link pode ter expirado ou o contrato foi removido.
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold inline-block"
          >
            Ir para a página inicial
          </Link>
        </div>
      </div>
    );
  }

  if (actionComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          {actionComplete === 'approved' ? (
            <>
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-check text-4xl text-emerald-600"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Contrato Aprovado!</h1>
              <p className="text-gray-600 mb-6">
                Sua aprovação foi registrada com sucesso. A equipe KION será notificada.
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-times text-4xl text-red-600"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Contrato Rejeitado</h1>
              <p className="text-gray-600 mb-6">
                Sua rejeição foi registrada. A equipe KION entrará em contato para ajustes.
              </p>
            </>
          )}
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold inline-block"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-4">
            <img 
              src={kionLogoUrl} 
              alt="KION" 
              style={{ height: '36px', width: 'auto' }}
            />
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-slate-800">Visualização de Contrato</div>
              <div className="text-[10px] text-gray-500">Documento para aprovação</div>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-bold ${
            draft.status === 'Aguardando Aprovação' ? 'bg-amber-100 text-amber-800' :
            draft.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' :
            draft.status === 'Rejeitado' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            <i className={`fas ${
              draft.status === 'Aguardando Aprovação' ? 'fa-clock' :
              draft.status === 'Aprovado' ? 'fa-check-circle' :
              draft.status === 'Rejeitado' ? 'fa-times-circle' :
              'fa-file-alt'
            } mr-2`}></i>
            {draft.status}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Info Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{draft.title}</h1>
            <p className="text-sm text-gray-500">
              {draft.contractType} • {draft.clientName} • {formatCurrency(draft.value)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-bold text-sm"
            >
              <i className="fas fa-download mr-2"></i>
              Download PDF
            </button>
          </div>
        </div>

        {/* Contract Preview */}
        <div className="mb-6">
          <ContractPreview draft={draft} />
        </div>

        {/* Action Buttons */}
        {draft.status === 'Aguardando Aprovação' && (
          <div className="bg-white rounded-xl shadow-lg p-6 sticky bottom-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800">Você concorda com os termos deste contrato?</h3>
                <p className="text-sm text-gray-500">Sua decisão será registrada e notificada à equipe KION</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-6 py-3 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition font-bold"
                >
                  <i className="fas fa-times mr-2"></i>
                  Rejeitar
                </button>
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-bold"
                >
                  <i className="fas fa-check mr-2"></i>
                  Aprovar Contrato
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-3xl text-emerald-600"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Aprovar Contrato</h2>
              <p className="text-gray-500 text-sm">Preencha seus dados para registrar a aprovação</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Seu Nome *</label>
                <input
                  type="text"
                  value={approverInfo.name}
                  onChange={(e) => setApproverInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Seu E-mail *</label>
                <input
                  type="email"
                  value={approverInfo.email}
                  onChange={(e) => setApproverInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Comentário (opcional)</label>
                <textarea
                  value={approverInfo.comment}
                  onChange={(e) => setApproverInfo(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                  placeholder="Adicione um comentário..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleApprove}
                disabled={!approverInfo.name || !approverInfo.email || isSubmitting}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Aprovando...</>
                ) : (
                  'Confirmar Aprovação'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-times text-3xl text-red-600"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Rejeitar Contrato</h2>
              <p className="text-gray-500 text-sm">Por favor, informe o motivo da rejeição</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Motivo da Rejeição *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Descreva o motivo da rejeição..."
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason || isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Rejeitando...</>
                ) : (
                  'Confirmar Rejeição'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <img 
            src={kionLogoUrl} 
            alt="KION" 
            className="mx-auto mb-4 opacity-50"
            style={{ height: '24px', width: 'auto' }}
          />
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            KION South America • LegalTech Division
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ContractPublicView;
