import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import PasswordGate from '../components/analytics/PasswordGate';
import { DailyVisitsChart, TopPagesChart } from '../components/analytics/VisitorsChart';
import { RecentVisitsTable, GeoTable, DeviceTable } from '../components/analytics/VisitorsTable';
import kionLogoUrl from '../logo.png';

const Analytics: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { 
    summary, 
    dailyStats, 
    pageStats, 
    geoStats, 
    deviceStats, 
    recentVisits, 
    loading, 
    error, 
    refetch 
  } = useAnalyticsData();

  // Verificar se já está autenticado
  useEffect(() => {
    const auth = sessionStorage.getItem('kion_analytics_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Se não autenticado, mostra tela de senha
  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('kion_analytics_auth');
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img 
                src={kionLogoUrl} 
                alt="KION" 
                style={{ height: '40px', width: 'auto' }}
              />
            </Link>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="hidden sm:block">
              <h1 className="text-base font-extrabold text-slate-900">Analytics</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Métricas de Visitantes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refetch}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-sm disabled:opacity-50"
            >
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-2`}></i>
              Atualizar
            </button>
            <Link
              to="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-bold text-sm"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Voltar
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm"
              title="Sair"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <i className="fas fa-exclamation-triangle text-red-500"></i>
            <div>
              <p className="font-bold text-red-800">Erro ao carregar dados</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button onClick={refetch} className="ml-auto text-red-600 hover:text-red-700">
              <i className="fas fa-redo"></i>
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Visitas Hoje</div>
            <div className="text-2xl font-black text-blue-600">
              {loading ? '-' : summary?.totalVisitsToday || 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Últimos 7 Dias</div>
            <div className="text-2xl font-black text-slate-800">
              {loading ? '-' : summary?.totalVisits7Days || 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Últimos 30 Dias</div>
            <div className="text-2xl font-black text-slate-800">
              {loading ? '-' : summary?.totalVisits30Days || 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Únicos Hoje</div>
            <div className="text-2xl font-black text-emerald-600">
              {loading ? '-' : summary?.uniqueVisitorsToday || 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Únicos 30 Dias</div>
            <div className="text-2xl font-black text-emerald-600">
              {loading ? '-' : summary?.uniqueVisitors || 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Geral</div>
            <div className="text-2xl font-black text-slate-800">
              {loading ? '-' : summary?.totalVisits || 0}
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <DailyVisitsChart data={dailyStats} />
              <TopPagesChart data={pageStats} />
            </div>

            {/* Tables Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <GeoTable data={geoStats} />
              <DeviceTable data={deviceStats} />
            </div>

            {/* Recent Visits Table */}
            <RecentVisitsTable visits={recentVisits} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            KION CLM Analytics • Dados atualizados em tempo real
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Analytics;
