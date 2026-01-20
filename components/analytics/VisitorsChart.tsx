import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DailyStats, PageStats } from '../../hooks/useAnalyticsData';

interface DailyChartProps {
  data: DailyStats[];
}

export const DailyVisitsChart: React.FC<DailyChartProps> = ({ data }) => {
  // Inverter para mostrar do mais antigo ao mais recente
  const chartData = [...data].reverse().slice(-14).map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center">
        <i className="fas fa-chart-line mr-2 text-blue-600"></i>
        Visitas nos Últimos 14 Dias
      </h3>
      
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <i className="fas fa-chart-area text-4xl mb-2"></i>
            <p>Sem dados ainda</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: 'none', 
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value: number, name: string) => [
                value,
                name === 'visits' ? 'Visitas' : 'Visitantes Únicos'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="visits" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2 }}
              name="visits"
            />
            <Line 
              type="monotone" 
              dataKey="unique_visitors" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2 }}
              name="unique_visitors"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-600">Visitas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-gray-600">Visitantes Únicos</span>
        </div>
      </div>
    </div>
  );
};

interface PageChartProps {
  data: PageStats[];
}

export const TopPagesChart: React.FC<PageChartProps> = ({ data }) => {
  const chartData = data.slice(0, 5).map(d => ({
    ...d,
    name: d.page_title || d.page_path,
    shortName: (d.page_title || d.page_path).slice(0, 20) + ((d.page_title || d.page_path).length > 20 ? '...' : '')
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center">
        <i className="fas fa-file-alt mr-2 text-blue-600"></i>
        Páginas Mais Visitadas
      </h3>
      
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <i className="fas fa-file text-4xl mb-2"></i>
            <p>Sem dados ainda</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis 
              type="category" 
              dataKey="shortName" 
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
              width={100}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: 'none', 
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value: number) => [value, 'Visitas']}
              labelFormatter={(label) => chartData.find(d => d.shortName === label)?.name || label}
            />
            <Bar 
              dataKey="visits" 
              fill="#3b82f6" 
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
