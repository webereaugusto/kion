import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Contract, OperationType } from '../types';
import { formatCompactCurrency, daysUntilExpiry } from '../utils/formatters';
import { analyzeContractFiscalImpact } from '../services/fiscalRules';

interface DashboardProps {
  contracts: Contract[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ contracts }) => {
  // Dados por status
  const statusData = [
    { name: 'Ativos', value: contracts.filter(c => c.status === 'Ativo').length, color: '#10b981' },
    { name: 'Vencendo', value: contracts.filter(c => c.status === 'Vencendo').length, color: '#f59e0b' },
    { name: 'Encerrados', value: contracts.filter(c => c.status === 'Encerrado').length, color: '#6b7280' },
  ].filter(d => d.value > 0);

  // Dados por tipo de operação
  const operationData = Object.values(OperationType).map(type => ({
    name: type,
    value: contracts.filter(c => c.operationType === type).reduce((acc, c) => acc + c.value, 0),
    count: contracts.filter(c => c.operationType === type).length
  })).filter(d => d.count > 0);

  // Dados por UF destino (top 5)
  const ufData = contracts.reduce((acc, c) => {
    acc[c.destinationState] = (acc[c.destinationState] || 0) + c.value;
    return acc;
  }, {} as Record<string, number>);

  const topUFs = Object.entries(ufData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([uf, value]) => ({ uf, value }));

  // Alertas totais
  const allAlerts = contracts.flatMap(c => analyzeContractFiscalImpact(c));
  const risks = allAlerts.filter(a => a.type === 'Risk').length;
  const opportunities = allAlerts.filter(a => a.type === 'Opportunity').length;

  // Contratos vencendo em 30 dias
  const expiringContracts = contracts.filter(c => {
    const days = daysUntilExpiry(c.expiryDate);
    return days >= 0 && days <= 30;
  });

  // Valor total
  const totalValue = contracts.reduce((acc, c) => acc + c.value, 0);

  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white">
          <div className="text-blue-100 text-[10px] font-black uppercase tracking-wider">Total de Contratos</div>
          <div className="text-3xl font-black mt-1">{contracts.length}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-xl text-white">
          <div className="text-emerald-100 text-[10px] font-black uppercase tracking-wider">Valor Total</div>
          <div className="text-2xl font-black mt-1">{formatCompactCurrency(totalValue)}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-xl text-white">
          <div className="text-amber-100 text-[10px] font-black uppercase tracking-wider">Oportunidades</div>
          <div className="text-3xl font-black mt-1">{opportunities}</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl text-white">
          <div className="text-red-100 text-[10px] font-black uppercase tracking-wider">Riscos</div>
          <div className="text-3xl font-black mt-1">{risks}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Pie Chart */}
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-4">Por Status</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operation Bar Chart */}
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-4">Por Operação (Valor)</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operationData} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => formatCompactCurrency(v)} fontSize={10} />
                <YAxis type="category" dataKey="name" fontSize={10} width={70} />
                <Tooltip formatter={(v: number) => formatCompactCurrency(v)} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top UFs */}
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-4">Top 5 UF Destino</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topUFs}>
                <XAxis dataKey="uf" fontSize={10} />
                <YAxis tickFormatter={(v) => formatCompactCurrency(v)} fontSize={10} />
                <Tooltip formatter={(v: number) => formatCompactCurrency(v)} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {topUFs.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expiring Contracts Alert */}
      {expiringContracts.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
          <h4 className="font-black text-amber-900 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
            <i className="fas fa-clock"></i>
            Contratos Vencendo em 30 Dias ({expiringContracts.length})
          </h4>
          <div className="grid gap-2">
            {expiringContracts.slice(0, 5).map(c => (
              <div key={c.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800">{c.contractNumber}</span>
                  <span className="text-slate-500 text-sm ml-2">- {c.partyName}</span>
                </div>
                <div className="text-amber-700 font-bold text-sm">
                  {daysUntilExpiry(c.expiryDate)} dias
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
