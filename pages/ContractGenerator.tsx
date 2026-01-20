import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ContractDraft, ContractDraftType, EquipmentCategory, KionBrand, WizardStep, ContractClause, AISuggestion, Approver } from '../types';
import { useContractDrafts } from '../hooks/useContractDrafts';
import { useToast } from '../hooks/useToast';
import { generateSuggestedClauses, generateEquipmentDescription } from '../services/contractAI';
import { downloadContractPDF } from '../services/pdfGenerator';
import { formatCurrency } from '../utils/formatters';
import { ToastContainer } from '../components/Toast';
import ContractWizard from '../components/generator/ContractWizard';
import EquipmentSelector from '../components/generator/EquipmentSelector';
import ClauseEditor from '../components/generator/ClauseEditor';
import AIAssistant from '../components/generator/AIAssistant';
import ContractPreview from '../components/generator/ContractPreview';
import ApprovalStatus from '../components/generator/ApprovalStatus';
import kionLogoUrl from '../logo.png';

const INITIAL_STEPS: WizardStep[] = [
  { id: 1, title: 'Tipo', description: 'Contrato e equipamento', isComplete: false, isActive: true },
  { id: 2, title: 'Cliente', description: 'Dados do contratante', isComplete: false, isActive: false },
  { id: 3, title: 'Detalhes', description: 'Valores e prazos', isComplete: false, isActive: false },
  { id: 4, title: 'Cláusulas', description: 'Termos do contrato', isComplete: false, isActive: false },
  { id: 5, title: 'Revisão', description: 'Finalizar e aprovar', isComplete: false, isActive: false }
];

const ContractGenerator: React.FC = () => {
  const { drafts, createDraft, updateDraft, submitForApproval, loading } = useContractDrafts();
  const { toasts, removeToast, success, error } = useToast();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<WizardStep[]>(INITIAL_STEPS);

  // Draft state
  const [draft, setDraft] = useState<Partial<ContractDraft>>({
    title: '',
    contractType: 'Venda',
    clientName: '',
    value: 0,
    equipmentQuantity: 1,
    warrantyMonths: 12,
    clauses: [],
    aiSuggestions: [],
    approvedBy: [],
    status: 'Rascunho'
  });

  // UI state
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isGeneratingClauses, setIsGeneratingClauses] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);
  const [showDraftsList, setShowDraftsList] = useState(false);

  // Update step completion
  useEffect(() => {
    const newSteps = [...steps];
    
    // Step 1: Tipo - needs contractType
    newSteps[0].isComplete = !!draft.contractType;
    
    // Step 2: Cliente - needs clientName
    newSteps[1].isComplete = !!draft.clientName;
    
    // Step 3: Detalhes - needs value
    newSteps[2].isComplete = (draft.value || 0) > 0;
    
    // Step 4: Cláusulas - needs at least one clause
    newSteps[3].isComplete = (draft.clauses?.length || 0) > 0;
    
    // Step 5: Always incomplete until submitted
    newSteps[4].isComplete = draft.status === 'Aguardando Aprovação' || draft.status === 'Aprovado';
    
    // Update active
    newSteps.forEach((s, i) => s.isActive = i === currentStep);
    
    setSteps(newSteps);
  }, [draft, currentStep]);

  // Handlers
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      if (savedDraftId) {
        await updateDraft(savedDraftId, draft);
        success('Rascunho atualizado!');
      } else {
        const created = await createDraft(draft);
        if (created) {
          setSavedDraftId(created.id);
          setDraft(prev => ({ ...prev, shareToken: created.shareToken }));
          success('Rascunho salvo!');
        }
      }
    } catch (err) {
      error('Erro ao salvar rascunho');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateClauses = async () => {
    setIsGeneratingClauses(true);
    try {
      const clauses = await generateSuggestedClauses(draft.contractType!, {
        brand: draft.brand,
        equipmentDescription: draft.equipmentDescription,
        value: draft.value,
        durationMonths: draft.durationMonths
      });
      setDraft(prev => ({ ...prev, clauses }));
      success('Cláusulas geradas com IA!');
    } catch (err) {
      error('Erro ao gerar cláusulas');
    } finally {
      setIsGeneratingClauses(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!draft.brand || !draft.equipmentCategory) return;
    
    setIsGeneratingDescription(true);
    try {
      const description = await generateEquipmentDescription(
        draft.brand,
        draft.equipmentCategory,
        draft.equipmentQuantity || 1
      );
      setDraft(prev => ({ ...prev, equipmentDescription: description }));
      success('Descrição gerada!');
    } catch (err) {
      error('Erro ao gerar descrição');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!savedDraftId) {
      await handleSaveDraft();
    }
    
    if (savedDraftId) {
      const result = await submitForApproval(savedDraftId);
      if (result) {
        setDraft(prev => ({ ...prev, status: 'Aguardando Aprovação' }));
        success('Contrato enviado para aprovação!');
      }
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadContractPDF(draft as ContractDraft);
      success('PDF gerado com sucesso!');
    } catch (err) {
      error('Erro ao gerar PDF');
    }
  };

  const handleLoadDraft = (loadDraft: ContractDraft) => {
    setDraft(loadDraft);
    setSavedDraftId(loadDraft.id);
    setShowDraftsList(false);
    success('Rascunho carregado!');
  };

  const handleNewDraft = () => {
    setDraft({
      title: '',
      contractType: 'Venda',
      clientName: '',
      value: 0,
      equipmentQuantity: 1,
      warrantyMonths: 12,
      clauses: [],
      aiSuggestions: [],
      approvedBy: [],
      status: 'Rascunho'
    });
    setSavedDraftId(null);
    setCurrentStep(0);
    setShowDraftsList(false);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Título do Contrato
              </label>
              <input
                type="text"
                value={draft.title || ''}
                onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="Ex: Locação de Empilhadeiras Linde - Magazine Luiza"
              />
            </div>
            <EquipmentSelector
              contractType={draft.contractType!}
              brand={draft.brand}
              category={draft.equipmentCategory}
              onContractTypeChange={(type) => setDraft(prev => ({ ...prev, contractType: type }))}
              onBrandChange={(brand) => setDraft(prev => ({ ...prev, brand }))}
              onCategoryChange={(category) => setDraft(prev => ({ ...prev, equipmentCategory: category }))}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              <i className="fas fa-building mr-2 text-blue-600"></i>
              Dados do Cliente
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Razão Social *</label>
                <input
                  type="text"
                  value={draft.clientName || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">CNPJ</label>
                <input
                  type="text"
                  value={draft.clientCnpj || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, clientCnpj: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Contato</label>
                <input
                  type="text"
                  value={draft.clientContactName || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, clientContactName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">E-mail</label>
                <input
                  type="email"
                  value={draft.clientContactEmail || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, clientContactEmail: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={draft.clientContactPhone || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, clientContactPhone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Endereço</label>
                <textarea
                  value={draft.clientAddress || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, clientAddress: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Endereço completo"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              <i className="fas fa-file-invoice-dollar mr-2 text-blue-600"></i>
              Detalhes Comerciais
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Valor Total (R$) *</label>
                <input
                  type="number"
                  value={draft.value || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Vigência (meses)</label>
                <input
                  type="number"
                  value={draft.durationMonths || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, durationMonths: parseInt(e.target.value) || undefined }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Data de Início</label>
                <input
                  type="date"
                  value={draft.startDate || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Garantia (meses)</label>
                <input
                  type="number"
                  value={draft.warrantyMonths || 12}
                  onChange={(e) => setDraft(prev => ({ ...prev, warrantyMonths: parseInt(e.target.value) || 12 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Quantidade de Equipamentos</label>
                <input
                  type="number"
                  value={draft.equipmentQuantity || 1}
                  onChange={(e) => setDraft(prev => ({ ...prev, equipmentQuantity: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min={1}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Descrição do Equipamento
                  {draft.brand && draft.equipmentCategory && (
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={isGeneratingDescription}
                      className="ml-2 text-xs text-purple-600 hover:text-purple-700"
                    >
                      {isGeneratingDescription ? (
                        <><i className="fas fa-spinner fa-spin mr-1"></i>Gerando...</>
                      ) : (
                        <><i className="fas fa-magic mr-1"></i>Gerar com IA</>
                      )}
                    </button>
                  )}
                </label>
                <textarea
                  value={draft.equipmentDescription || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, equipmentDescription: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descreva os equipamentos, especificações técnicas, acessórios..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Condições de Pagamento</label>
                <textarea
                  value={draft.paymentTerms || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Ex: 30% entrada, 70% em 12 parcelas mensais"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <ClauseEditor
            clauses={draft.clauses || []}
            onChange={(clauses) => setDraft(prev => ({ ...prev, clauses }))}
            isLoading={isGeneratingClauses}
            onGenerateWithAI={handleGenerateClauses}
          />
        );

      case 4:
        return (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <ApprovalStatus
                status={draft.status || 'Rascunho'}
                approvers={draft.approvedBy || []}
                shareToken={draft.shareToken}
                onSubmitForApproval={handleSubmitForApproval}
                onAddApprover={(approver) => setDraft(prev => ({
                  ...prev,
                  approvedBy: [...(prev.approvedBy || []), approver]
                }))}
                isSubmitting={isSaving}
              />
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition font-bold"
                >
                  <i className="fas fa-file-pdf mr-2"></i>
                  Download PDF
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider mb-4">
                <i className="fas fa-eye mr-2 text-blue-600"></i>
                Preview do Contrato
              </h3>
              <div className="max-h-[600px] overflow-y-auto">
                <ContractPreview draft={draft} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <nav className="bg-white text-gray-900 p-4 shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center max-w-6xl">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center">
              <img 
                src={kionLogoUrl} 
                alt="KION Group Logo" 
                style={{ height: '40px', width: 'auto', maxWidth: '120px', objectFit: 'contain' }}
              />
            </Link>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="hidden sm:block">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900">Gerador de Contratos</h1>
              <p className="text-[10px] text-purple-600 uppercase tracking-widest font-black">
                <i className="fas fa-robot mr-1"></i>
                Powered by AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDraftsList(!showDraftsList)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-bold text-sm"
            >
              <i className="fas fa-folder-open mr-2"></i>
              Rascunhos ({drafts.filter(d => d.status === 'Rascunho').length})
            </button>
            <button
              onClick={handleNewDraft}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-sm"
            >
              <i className="fas fa-plus mr-2"></i>
              Novo
            </button>
            <Link
              to="/"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-bold text-sm"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Voltar
            </Link>
          </div>
        </div>
      </nav>

      {/* Drafts List Dropdown */}
      {showDraftsList && (
        <div className="absolute top-20 right-8 w-96 bg-white rounded-xl shadow-2xl border z-50 max-h-[400px] overflow-y-auto">
          <div className="p-4 border-b bg-gray-50 sticky top-0">
            <h3 className="font-bold">Seus Rascunhos</h3>
          </div>
          {drafts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <i className="fas fa-folder-open text-3xl mb-2"></i>
              <p>Nenhum rascunho salvo</p>
            </div>
          ) : (
            <div className="divide-y">
              {drafts.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleLoadDraft(d)}
                  className="w-full p-4 text-left hover:bg-blue-50 transition"
                >
                  <div className="font-bold text-slate-800 truncate">{d.title || 'Sem título'}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.status === 'Rascunho' ? 'bg-gray-200' :
                      d.status === 'Aguardando Aprovação' ? 'bg-amber-200 text-amber-800' :
                      d.status === 'Aprovado' ? 'bg-emerald-200 text-emerald-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {d.status}
                    </span>
                    <span>{d.contractType}</span>
                    <span>{formatCurrency(d.value)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <main className="container mx-auto mt-8 px-4 max-w-6xl">
        {/* Wizard Steps */}
        <ContractWizard
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => steps[step].isComplete && setCurrentStep(step)}
        />

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg border p-6 md:p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Anterior
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-bold disabled:opacity-50"
          >
            {isSaving ? (
              <><i className="fas fa-spinner fa-spin mr-2"></i>Salvando...</>
            ) : (
              <><i className="fas fa-save mr-2"></i>Salvar Rascunho</>
            )}
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
            >
              Próximo
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          ) : (
            <div className="w-32"></div>
          )}
        </div>
      </main>

      {/* AI Assistant */}
      <AIAssistant
        draft={draft}
        suggestions={draft.aiSuggestions || []}
        onSuggestionsUpdate={(suggestions) => setDraft(prev => ({ ...prev, aiSuggestions: suggestions }))}
        isOpen={isAIOpen}
        onToggle={() => setIsAIOpen(!isAIOpen)}
      />
    </div>
  );
};

export default ContractGenerator;
