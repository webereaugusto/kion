import React from 'react';
import { VisitRecord, GeoStats, DeviceStats } from '../../hooks/useAnalyticsData';

interface RecentVisitsProps {
  visits: VisitRecord[];
}

export const RecentVisitsTable: React.FC<RecentVisitsProps> = ({ visits }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return 'fa-mobile-alt';
      case 'tablet': return 'fa-tablet-alt';
      default: return 'fa-desktop';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-bold text-slate-800 flex items-center">
          <i className="fas fa-clock mr-2 text-blue-600"></i>
          Últimas Visitas
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Data/Hora</th>
              <th className="px-4 py-3 text-left">Página</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Local</th>
              <th className="px-4 py-3 text-center">Device</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {visits.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  <i className="fas fa-inbox text-3xl mb-2"></i>
                  <p>Nenhuma visita registrada ainda</p>
                </td>
              </tr>
            ) : (
              visits.map((visit) => (
                <tr key={visit.id} className="hover:bg-blue-50/50 transition">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(visit.visited_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 truncate max-w-[200px]">
                      {visit.page_title || visit.page_path}
                    </div>
                    <div className="text-xs text-gray-400 truncate max-w-[200px]">
                      {visit.page_path}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-slate-700">
                      {visit.visitor_city || 'Desconhecido'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {visit.visitor_country || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <i className={`fas ${getDeviceIcon(visit.device_type)} text-gray-400`} title={visit.device_type}></i>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell font-mono text-xs text-gray-500">
                    {visit.visitor_ip || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface GeoTableProps {
  data: GeoStats[];
}

export const GeoTable: React.FC<GeoTableProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-bold text-slate-800 flex items-center">
          <i className="fas fa-globe-americas mr-2 text-blue-600"></i>
          Origem Geográfica
        </h3>
      </div>
      
      <div className="max-h-[300px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">Local</th>
              <th className="px-4 py-3 text-right">Visitas</th>
              <th className="px-4 py-3 text-right">Únicos</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  <i className="fas fa-globe text-3xl mb-2"></i>
                  <p>Sem dados geográficos</p>
                </td>
              </tr>
            ) : (
              data.map((geo, index) => (
                <tr key={index} className="hover:bg-blue-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{geo.city}</div>
                    <div className="text-xs text-gray-400">{geo.country}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-700">
                    {geo.visits}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {geo.unique_visitors}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface DeviceTableProps {
  data: DeviceStats[];
}

export const DeviceTable: React.FC<DeviceTableProps> = ({ data }) => {
  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return 'fa-mobile-alt';
      case 'tablet': return 'fa-tablet-alt';
      default: return 'fa-desktop';
    }
  };

  const getBrowserIcon = (browser: string) => {
    const b = browser?.toLowerCase() || '';
    if (b.includes('chrome')) return 'fa-chrome';
    if (b.includes('firefox')) return 'fa-firefox';
    if (b.includes('safari')) return 'fa-safari';
    if (b.includes('edge')) return 'fa-edge';
    return 'fa-globe';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-bold text-slate-800 flex items-center">
          <i className="fas fa-laptop mr-2 text-blue-600"></i>
          Dispositivos e Navegadores
        </h3>
      </div>
      
      <div className="max-h-[300px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">Dispositivo</th>
              <th className="px-4 py-3 text-left">Navegador</th>
              <th className="px-4 py-3 text-right">Visitas</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  <i className="fas fa-laptop text-3xl mb-2"></i>
                  <p>Sem dados de dispositivos</p>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-blue-50/50 transition">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <i className={`fas ${getDeviceIcon(item.device)} text-gray-400`}></i>
                      <span className="capitalize">{item.device || 'Desconhecido'}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <i className={`fab ${getBrowserIcon(item.browser)} text-gray-400`}></i>
                      <span>{item.browser || 'Desconhecido'}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-700">
                    {item.visits}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
