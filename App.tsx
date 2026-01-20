import React, { useState, useMemo } from 'react';
import { Contract, FilterState } from './types';
import FiscalTaggingForm from './components/FiscalTaggingForm';
import Dashboard from './components/Dashboard';
import ContractFilters from './components/ContractFilters';
import ContractHistory from './components/ContractHistory';
import Modal from './components/Modal';
import ConfirmModal from './components/ConfirmModal';
import ChatBot from './components/ChatBot';
import { ToastContainer } from './components/Toast';
import { useContracts } from './hooks/useContracts';
import { useToast } from './hooks/useToast';
import { analyzeContractFiscalImpact } from './services/fiscalRules';
import { formatCurrency, exportToCSV } from './utils/formatters';
import kionLogoUrl from './logo.png';

type ViewMode = 'table' | 'dashboard';

const App: React.FC = () => {
  // Estado persistido no Supabase
  const { 
    contracts, 
    loading: contractsLoading, 
    error: contractsError,
    addContract: addContractToDb, 
    updateContract: updateContractInDb, 
    deleteContract: deleteContractFromDb,
    refetch 
  } = useContracts();
  
  // Estados locais
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [historyContract, setHistoryContract] = useState<Contract | null>(null);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    operationType: '',
    hasRisk: null,
    hasOpportunity: null
  });
  
  // Toast notifications
  const { toasts, removeToast, success, error } = useToast();

  // Filtrar contratos
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch = 
          contract.contractNumber.toLowerCase().includes(search) ||
          contract.partyName.toLowerCase().includes(search) ||
          contract.ncm.includes(search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && contract.status !== filters.status) return false;

      // Operation type filter
      if (filters.operationType && contract.operationType !== filters.operationType) return false;

      // Alert filters
      if (filters.hasRisk !== null || filters.hasOpportunity !== null) {
        const alerts = analyzeContractFiscalImpact(contract);
        if (filters.hasRisk === true && !alerts.some(a => a.type === 'Risk')) return false;
        if (filters.hasOpportunity === true && !alerts.some(a => a.type === 'Opportunity')) return false;
      }

      return true;
    });
  }, [contracts, filters]);

  // Handlers
  const handleAddContract = async (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => {
    const result = await addContractToDb(contractData);
    if (result) {
      success('Contrato registrado com sucesso!');
    } else {
      error('Erro ao registrar contrato');
    }
  };

  const handleUpdateContract = async (updated: Contract) => {
    const result = await updateContractInDb(updated);
    if (result) {
      setEditingContract(null);
      success('Contrato atualizado com sucesso!');
    } else {
      error('Erro ao atualizar contrato');
    }
  };

  const handleDelete = async () => {
    if (contractToDelete) {
      const result = await deleteContractFromDb(contractToDelete.id);
      if (result) {
        success('Contrato excluído com sucesso!');
      } else {
        error('Erro ao excluir contrato');
      }
      setContractToDelete(null);
    }
  };

  const handleExport = () => {
    exportToCSV(filteredContracts, 'contratos_kion', [
      { key: 'contractNumber', label: 'Número do Contrato' },
      { key: 'partyName', label: 'Contraparte' },
      { key: 'ncm', label: 'NCM' },
      { key: 'value', label: 'Valor' },
      { key: 'operationType', label: 'Tipo de Operação' },
      { key: 'originState', label: 'UF Origem' },
      { key: 'destinationState', label: 'UF Destino' },
      { key: 'status', label: 'Status' },
      { key: 'expiryDate', label: 'Data Vencimento' }
    ]);
    success('Arquivo CSV exportado!');
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      operationType: '',
      hasRisk: null,
      hasOpportunity: null
    });
  };

  // Stats
  const totalValue = contracts.reduce((acc, curr) => acc + curr.value, 0);
  const expiringCount = contracts.filter(c => c.status === 'Vencendo').length;
  const allAlerts = contracts.flatMap(c => analyzeContractFiscalImpact(c));
  const opportunitiesValue = allAlerts.filter(a => a.type === 'Opportunity').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <nav className="bg-white text-gray-900 p-4 shadow-sm border-b sticky top-0 z-50" style={{ backgroundColor: 'white', padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
        <div className="container mx-auto flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1280px', margin: '0 auto' }}>
          <div className="flex items-center gap-4 md:gap-6" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="flex items-center">
              <img 
                src={kionLogoUrl} 
                alt="KION Group Logo" 
                className="h-10 md:h-12 w-auto min-w-[100px] md:min-w-[140px] object-contain"
                style={{ height: '48px', width: 'auto', maxWidth: '140px', objectFit: 'contain' }}
              />
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="hidden sm:block">
              <h1 className="text-base md:text-lg font-extrabold tracking-tight text-slate-900">Legal Intelligence</h1>
              <p className="text-[10px] text-blue-800 uppercase tracking-widest font-black">Fiscal Logistics CLM</p>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  viewMode === 'table' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className="fas fa-table mr-1"></i>
                <span className="hidden md:inline">Tabela</span>
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  viewMode === 'dashboard' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className="fas fa-chart-pie mr-1"></i>
                <span className="hidden md:inline">Dashboard</span>
              </button>
            </div>
            <div className="text-right hidden lg:block border-r pr-6 border-gray-100">
              <div className="text-[10px] text-gray-500 uppercase font-black">Acesso Interno</div>
              <div className="text-sm font-bold text-slate-800">Soluções Jurídicas Sênior</div>
            </div>
            <div className="relative group">
              <i className="fas fa-user-circle text-2xl md:text-3xl text-slate-400 cursor-pointer group-hover:text-blue-900 transition-colors"></i>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto mt-6 md:mt-8 px-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow border-l-4 border-blue-600">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">Total Sob Gestão</div>
            <div className="text-xl md:text-3xl font-black text-slate-900">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow border-l-4 border-slate-600">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">Contratos</div>
            <div className="text-xl md:text-3xl font-black text-slate-900">{contracts.length}</div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow border-l-4 border-amber-600">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">Vencendo</div>
            <div className="text-xl md:text-3xl font-black text-slate-900">{expiringCount}</div>
            <div className="text-xs text-amber-800 font-bold hidden md:block">Revisar em 30 dias</div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow border-l-4 border-emerald-600">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">Oportunidades</div>
            <div className="text-xl md:text-3xl font-black text-slate-900">{opportunitiesValue}</div>
            <div className="text-xs text-emerald-800 font-bold hidden md:block">Alertas fiscais</div>
          </div>
        </div>

        {viewMode === 'dashboard' ? (
          <Dashboard contracts={contracts} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <FiscalTaggingForm 
                onAdd={handleAddContract} 
                onUpdate={handleUpdateContract}
                editingContract={editingContract}
                onCancelEdit={() => setEditingContract(null)}
              />
              
              <div className="mt-6 md:mt-8 bg-slate-900 p-5 md:p-6 rounded-xl shadow-lg border border-slate-800">
                <h4 className="font-black text-white mb-3 uppercase text-xs tracking-widest border-b border-slate-700 pb-2 flex items-center gap-2">
                  <i className="fas fa-microchip text-blue-400"></i> Business Insights
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Integração estratégica entre <strong>Jurídico</strong> e <strong>Tributário</strong>. 
                  A visibilidade preventiva de NCMs e rotas logísticas permite a maximização de créditos e conformidade fiscal.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="bg-blue-900 text-blue-100 text-[9px] px-2 py-0.5 rounded font-black uppercase border border-blue-800">Compliance AI</span>
                  <span className="bg-slate-700 text-slate-200 text-[9px] px-2 py-0.5 rounded font-black uppercase border border-slate-600">BK Ready</span>
                </div>
              </div>
            </div>

            {/* Right Column: Filters + List */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              {/* Filters */}
              <ContractFilters 
                filters={filters} 
                onChange={setFilters} 
                onReset={resetFilters}
              />

              {/* Contracts Table */}
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
                    Pipeline de Contratos ({filteredContracts.length})
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleExport}
                      className="text-[10px] font-black bg-white border-2 border-slate-300 text-slate-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition shadow-sm uppercase"
                    >
                      <i className="fas fa-download mr-1"></i> Exportar
                    </button>
                    <button 
                      onClick={() => setFilters({ ...filters, hasRisk: filters.hasRisk === true ? null : true })}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition shadow-sm uppercase ${
                        filters.hasRisk === true 
                          ? 'bg-red-600 text-white' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      <i className="fas fa-exclamation-triangle mr-1"></i> Riscos
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-slate-700 text-[10px] uppercase tracking-wider font-black">
                        <th className="px-4 md:px-6 py-4 border-b">Referência / Rota</th>
                        <th className="px-4 md:px-6 py-4 border-b hidden md:table-cell">Contraparte</th>
                        <th className="px-4 md:px-6 py-4 border-b hidden lg:table-cell">NCM</th>
                        <th className="px-4 md:px-6 py-4 border-b text-center">Alertas</th>
                        <th className="px-4 md:px-6 py-4 border-b text-right">Valor</th>
                        <th className="px-4 md:px-6 py-4 border-b text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractsLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            <i className="fas fa-spinner fa-spin text-4xl mb-3 block text-blue-500"></i>
                            <p className="font-bold">Carregando contratos...</p>
                          </td>
                        </tr>
                      ) : contractsError ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                            <i className="fas fa-exclamation-triangle text-4xl mb-3 block"></i>
                            <p className="font-bold">Erro ao carregar contratos</p>
                            <p className="text-sm">{contractsError}</p>
                            <button 
                              onClick={refetch}
                              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Tentar novamente
                            </button>
                          </td>
                        </tr>
                      ) : filteredContracts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            <i className="fas fa-inbox text-4xl mb-3 block"></i>
                            <p className="font-bold">Nenhum contrato encontrado</p>
                            <p className="text-sm">Tente ajustar os filtros ou cadastre um novo contrato.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredContracts.map(contract => {
                          const alerts = analyzeContractFiscalImpact(contract);
                          return (
                            <tr key={contract.id} className="hover:bg-blue-50/40 transition-colors border-b last:border-b-0 group">
                              <td className="px-4 md:px-6 py-4 md:py-5">
                                <div className="font-black text-blue-900">{contract.contractNumber}</div>
                                <div className="text-[10px] text-slate-600 font-black uppercase mt-0.5">
                                  {contract.originState} <i className="fas fa-long-arrow-alt-right mx-1 text-blue-700"></i> {contract.destinationState}
                                </div>
                                <div className="md:hidden text-xs text-gray-600 mt-1">{contract.partyName}</div>
                              </td>
                              <td className="px-4 md:px-6 py-4 md:py-5 text-sm text-slate-900 font-bold hidden md:table-cell">
                                {contract.partyName}
                              </td>
                              <td className="px-4 md:px-6 py-4 md:py-5 text-sm font-mono font-bold text-slate-800 hidden lg:table-cell">
                                {contract.ncm}
                              </td>
                              <td className="px-4 md:px-6 py-4 md:py-5 text-center">
                                <div className="flex justify-center gap-1 flex-wrap">
                                  {alerts.some(a => a.type === 'Risk') && (
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-[10px] font-black border border-red-300 uppercase shadow-sm">
                                      Risco
                                    </span>
                                  )}
                                  {alerts.some(a => a.type === 'Opportunity') && (
                                    <span className="bg-amber-100 text-amber-900 px-2 py-1 rounded text-[10px] font-black border border-amber-300 uppercase shadow-sm">
                                      Ganho
                                    </span>
                                  )}
                                  {alerts.length === 0 && (
                                    <span className="text-slate-500 text-[10px] font-black bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                      OK
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 md:px-6 py-4 md:py-5 text-right font-black text-slate-900 text-sm">
                                {formatCurrency(contract.value)}
                              </td>
                              <td className="px-4 md:px-6 py-4 md:py-5 text-center">
                                <div className="flex justify-center gap-1">
                                  <button
                                    onClick={() => setHistoryContract(contract)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Ver histórico"
                                  >
                                    <i className="fas fa-history"></i>
                                  </button>
                                  <button
                                    onClick={() => setEditingContract(contract)}
                                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                    title="Editar"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    onClick={() => setContractToDelete(contract)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Excluir"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t py-8 md:py-12 text-center text-slate-600 text-[10px] uppercase font-black tracking-[0.2em] bg-white">
        <div className="flex justify-center mb-6" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img 
            src={kionLogoUrl} 
            alt="KION Logo Footer" 
            className="h-8 w-auto grayscale contrast-125 opacity-60 hover:opacity-100 transition-all cursor-pointer" 
            style={{ height: '32px', width: 'auto', maxWidth: '120px', filter: 'grayscale(1)', opacity: '0.6' }}
          />
        </div>
        <p className="mb-2">KION SOUTH AMERICA • LEGALTECH DIVISION</p>
        <p className="text-slate-500 font-black tracking-widest">LINDE • STILL • BAOLI • DEMATIC</p>
      </footer>

      {/* History Modal */}
      <Modal
        isOpen={!!historyContract}
        onClose={() => setHistoryContract(null)}
        title={`Histórico - ${historyContract?.contractNumber || ''}`}
        size="lg"
      >
        {historyContract && (
          <ContractHistory history={historyContract.history || []} />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!contractToDelete}
        onClose={() => setContractToDelete(null)}
        onConfirm={handleDelete}
        title="Excluir Contrato"
        message={`Tem certeza que deseja excluir o contrato "${contractToDelete?.contractNumber}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* AI ChatBot */}
      <ChatBot />
    </div>
  );
};

export default App;
