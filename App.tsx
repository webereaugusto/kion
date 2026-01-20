
import React, { useState } from 'react';
import { Contract } from './types';
import { MOCK_CONTRACTS } from './constants';
import FiscalTaggingForm from './components/FiscalTaggingForm';
import { analyzeContractFiscalImpact } from './services/fiscalRules';

const App: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);

  const addContract = (c: Contract) => {
    setContracts([c, ...contracts]);
  };

  const totalValue = contracts.reduce((acc, curr) => acc + curr.value, 0);
  const expiringCount = contracts.filter(c => c.status === 'Vencendo').length;

  // URL do logo anexado pelo usuário
  const kionLogoUrl = "input_file_0.png";

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <nav className="bg-white text-gray-900 p-4 shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <img 
                src={kionLogoUrl} 
                alt="KION Group Logo" 
                className="h-12 w-auto min-w-[140px] object-contain"
              />
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Legal Intelligence</h1>
              <p className="text-[10px] text-blue-800 uppercase tracking-widest font-black">Fiscal Logistics CLM</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block border-r pr-6 border-gray-100">
              <div className="text-[10px] text-gray-500 uppercase font-black">Acesso Interno</div>
              <div className="text-sm font-bold text-slate-800">Soluções Jurídicas Sênior</div>
            </div>
            <div className="relative group">
               <i className="fas fa-user-circle text-3xl text-slate-400 cursor-pointer group-hover:text-blue-900 transition-colors"></i>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto mt-8 px-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-600">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">Total Sob Gestão</div>
            <div className="text-3xl font-black text-slate-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-amber-600">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">Contratos Vencendo</div>
            <div className="text-3xl font-black text-slate-900">{expiringCount}</div>
            <div className="text-xs text-amber-800 font-bold">Revisar exposição fiscal em 30 dias</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-emerald-600">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">Oportunidades Fiscais</div>
            <div className="text-3xl font-black text-slate-900">R$ 3.2M</div>
            <div className="text-xs text-emerald-800 font-bold tracking-tight">Estimativa Drawback / Ex-Tarifário</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <FiscalTaggingForm onAdd={addContract} />
            
            <div className="mt-8 bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800">
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

          {/* Right Column: List & Insights */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Pipeline de Contratos Ativos</h3>
                <div className="flex gap-2">
                  <button className="text-[10px] font-black bg-white border-2 border-slate-300 text-slate-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition shadow-sm uppercase">Exportar</button>
                  <button className="text-[10px] font-black bg-blue-800 text-white px-3 py-1.5 rounded-lg hover:bg-blue-900 transition shadow-sm uppercase">Filtrar Riscos</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-slate-700 text-[10px] uppercase tracking-wider font-black">
                      <th className="px-6 py-4 border-b">Referência / Rota</th>
                      <th className="px-6 py-4 border-b">Contraparte</th>
                      <th className="px-6 py-4 border-b">NCM</th>
                      <th className="px-6 py-4 border-b text-center">Alertas</th>
                      <th className="px-6 py-4 border-b text-right">Valor Bruto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map(contract => {
                      const alerts = analyzeContractFiscalImpact(contract);
                      return (
                        <tr key={contract.id} className="hover:bg-blue-50/40 transition-colors border-b last:border-b-0 group">
                          <td className="px-6 py-5">
                            <div className="font-black text-blue-900">{contract.contractNumber}</div>
                            <div className="text-[10px] text-slate-600 font-black uppercase mt-0.5">
                              {contract.originState} <i className="fas fa-long-arrow-alt-right mx-1 text-blue-700"></i> {contract.destinationState}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-900 font-bold">{contract.partyName}</td>
                          <td className="px-6 py-5 text-sm font-mono font-bold text-slate-800">{contract.ncm}</td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex justify-center gap-2">
                              {alerts.some(a => a.type === 'Risk') && (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-[10px] font-black border border-red-300 uppercase shadow-sm">Risco</span>
                              )}
                              {alerts.some(a => a.type === 'Opportunity') && (
                                <span className="bg-amber-100 text-amber-900 px-2 py-1 rounded text-[10px] font-black border border-amber-300 uppercase shadow-sm">Ganho</span>
                              )}
                              {alerts.length === 0 && <span className="text-slate-500 text-[10px] font-black bg-gray-50 px-2 py-1 rounded border border-gray-200">COMPLIANCE</span>}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right font-black text-slate-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(contract.value)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Logical Specification */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-slate-900 text-blue-200 p-6 rounded-xl font-mono text-[11px] shadow-xl border border-slate-800">
                 <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                    <span className="text-blue-400 font-black uppercase tracking-widest text-[9px]">Schema de Dados SQL</span>
                    <i className="fas fa-database text-blue-400 text-xs"></i>
                 </div>
                 <pre className="opacity-100 leading-relaxed text-blue-100">{`CREATE TABLE kion_clm_contracts (
  id UUID PRIMARY KEY,
  ref_number VARCHAR(50) UNIQUE,
  op_type SMALLINT,
  ncm_code VARCHAR(10),
  uf_origin CHAR(2),
  uf_dest CHAR(2),
  gross_value NUMERIC(15,2),
  created_at TIMESTAMP DEFAULT NOW()
);`}</pre>
               </div>

               <div className="bg-slate-900 text-emerald-200 p-6 rounded-xl font-mono text-[11px] shadow-xl border border-slate-800">
                 <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                    <span className="text-emerald-400 font-black uppercase tracking-widest text-[9px]">Motor de Regras Fiscal</span>
                    <i className="fas fa-microchip text-emerald-400 text-xs"></i>
                 </div>
                 <pre className="opacity-100 leading-relaxed text-emerald-100">{`def check_fiscal_strategy(c):
  # Regra de Importação
  if c.op_type == 'IMPORT':
    trigger_alert("DRAWBACK")
  
  # Regra de ICMS / BK
  if c.ncm.match("^8427"):
    flag_ex_tarifario()
    
  # DIFAL Check
  if c.uf_orig != c.uf_dest:
    alert_difal_exposure()`}</pre>
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t py-12 text-center text-slate-600 text-[10px] uppercase font-black tracking-[0.2em] bg-white">
        <div className="flex justify-center mb-6">
           <img 
            src={kionLogoUrl} 
            alt="KION Logo Footer" 
            className="h-8 w-auto grayscale contrast-125 opacity-60 hover:opacity-100 transition-all cursor-pointer" 
          />
        </div>
        <p className="mb-2">KION SOUTH AMERICA • LEGALTECH DIVISION</p>
        <p className="text-slate-500 font-black tracking-widest">LINDE • STILL • BAOLI • DEMATIC</p>
      </footer>
    </div>
  );
};

export default App;
