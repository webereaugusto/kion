import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export interface VisitRecord {
  id: string;
  page_path: string;
  page_title: string;
  visitor_ip: string;
  visitor_country: string;
  visitor_city: string;
  visitor_region: string;
  device_type: string;
  browser: string;
  os: string;
  referrer: string;
  session_id: string;
  visited_at: string;
}

export interface DailyStats {
  date: string;
  visits: number;
  unique_visitors: number;
}

export interface PageStats {
  page_path: string;
  page_title: string;
  visits: number;
  unique_visitors: number;
}

export interface GeoStats {
  country: string;
  city: string;
  visits: number;
  unique_visitors: number;
}

export interface DeviceStats {
  device: string;
  browser: string;
  visits: number;
}

export interface AnalyticsSummary {
  totalVisits: number;
  totalVisitsToday: number;
  totalVisits7Days: number;
  totalVisits30Days: number;
  uniqueVisitors: number;
  uniqueVisitorsToday: number;
}

interface UseAnalyticsDataReturn {
  summary: AnalyticsSummary | null;
  dailyStats: DailyStats[];
  pageStats: PageStats[];
  geoStats: GeoStats[];
  deviceStats: DeviceStats[];
  recentVisits: VisitRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalyticsData(): UseAnalyticsDataReturn {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [geoStats, setGeoStats] = useState<GeoStats[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
  const [recentVisits, setRecentVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const days7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Buscar todas as visitas dos últimos 30 dias
      const { data: allVisits, error: visitsError } = await supabase
        .from('page_visits')
        .select('*')
        .gte('visited_at', days30Ago)
        .order('visited_at', { ascending: false });

      if (visitsError) throw visitsError;

      const visits = allVisits || [];

      // Calcular métricas de resumo
      const visitsToday = visits.filter(v => v.visited_at >= today);
      const visits7Days = visits.filter(v => v.visited_at >= days7Ago);
      
      const uniqueSessions = new Set(visits.map(v => v.session_id));
      const uniqueSessionsToday = new Set(visitsToday.map(v => v.session_id));

      setSummary({
        totalVisits: visits.length,
        totalVisitsToday: visitsToday.length,
        totalVisits7Days: visits7Days.length,
        totalVisits30Days: visits.length,
        uniqueVisitors: uniqueSessions.size,
        uniqueVisitorsToday: uniqueSessionsToday.size
      });

      // Calcular estatísticas diárias
      const dailyMap = new Map<string, { visits: number; sessions: Set<string> }>();
      visits.forEach(v => {
        const date = v.visited_at.split('T')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { visits: 0, sessions: new Set() });
        }
        const day = dailyMap.get(date)!;
        day.visits++;
        day.sessions.add(v.session_id);
      });

      const dailyArray: DailyStats[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          visits: data.visits,
          unique_visitors: data.sessions.size
        }))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 30);

      setDailyStats(dailyArray);

      // Calcular estatísticas por página
      const pageMap = new Map<string, { title: string; visits: number; sessions: Set<string> }>();
      visits.forEach(v => {
        if (!v.page_path.startsWith('event:')) {
          if (!pageMap.has(v.page_path)) {
            pageMap.set(v.page_path, { title: v.page_title || v.page_path, visits: 0, sessions: new Set() });
          }
          const page = pageMap.get(v.page_path)!;
          page.visits++;
          page.sessions.add(v.session_id);
        }
      });

      const pageArray: PageStats[] = Array.from(pageMap.entries())
        .map(([path, data]) => ({
          page_path: path,
          page_title: data.title,
          visits: data.visits,
          unique_visitors: data.sessions.size
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);

      setPageStats(pageArray);

      // Calcular estatísticas geográficas
      const geoMap = new Map<string, { city: string; visits: number; sessions: Set<string> }>();
      visits.forEach(v => {
        const country = v.visitor_country || 'Desconhecido';
        const city = v.visitor_city || 'Desconhecido';
        const key = `${country}|${city}`;
        
        if (!geoMap.has(key)) {
          geoMap.set(key, { city, visits: 0, sessions: new Set() });
        }
        const geo = geoMap.get(key)!;
        geo.visits++;
        geo.sessions.add(v.session_id);
      });

      const geoArray: GeoStats[] = Array.from(geoMap.entries())
        .map(([key, data]) => ({
          country: key.split('|')[0],
          city: data.city,
          visits: data.visits,
          unique_visitors: data.sessions.size
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 20);

      setGeoStats(geoArray);

      // Calcular estatísticas de dispositivos
      const deviceMap = new Map<string, number>();
      visits.forEach(v => {
        const device = v.device_type || 'unknown';
        const browser = v.browser || 'unknown';
        const key = `${device}|${browser}`;
        deviceMap.set(key, (deviceMap.get(key) || 0) + 1);
      });

      const deviceArray: DeviceStats[] = Array.from(deviceMap.entries())
        .map(([key, visits]) => ({
          device: key.split('|')[0],
          browser: key.split('|')[1],
          visits
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);

      setDeviceStats(deviceArray);

      // Últimas 50 visitas
      setRecentVisits(visits.slice(0, 50));

    } catch (err) {
      console.error('Erro ao buscar analytics:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    summary,
    dailyStats,
    pageStats,
    geoStats,
    deviceStats,
    recentVisits,
    loading,
    error,
    refetch: fetchData
  };
}

export default useAnalyticsData;
