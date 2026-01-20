import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { v4 as uuidv4 } from 'uuid';

interface GeoData {
  ip: string;
  country_name?: string;
  city?: string;
  region?: string;
}

// Gera ou recupera session_id do localStorage
function getSessionId(): string {
  const key = 'kion_session_id';
  let sessionId = localStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

// Detecta tipo de dispositivo baseado no user agent
function getDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    if (/tablet|ipad/i.test(ua)) {
      return 'tablet';
    }
    return 'mobile';
  }
  return 'desktop';
}

// Detecta navegador
function getBrowser(): string {
  const ua = navigator.userAgent;
  
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Trident')) return 'Internet Explorer';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Edg')) return 'Edge Chromium';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  
  return 'Outro';
}

// Detecta sistema operacional
function getOS(): string {
  const ua = navigator.userAgent;
  
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  
  return 'Outro';
}

// Cache de geo data para não fazer muitas requisições
let cachedGeoData: GeoData | null = null;

// Obtém dados de geolocalização via API gratuita
async function getGeoData(): Promise<GeoData> {
  if (cachedGeoData) {
    return cachedGeoData;
  }
  
  try {
    // Tenta ipapi.co primeiro (1000 req/dia grátis)
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      cachedGeoData = {
        ip: data.ip || '',
        country_name: data.country_name || '',
        city: data.city || '',
        region: data.region || ''
      };
      return cachedGeoData;
    }
  } catch (error) {
    console.log('ipapi.co falhou, tentando fallback...');
  }
  
  try {
    // Fallback: ip-api.com (sem limite para uso não comercial)
    const response = await fetch('http://ip-api.com/json/', {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      cachedGeoData = {
        ip: data.query || '',
        country_name: data.country || '',
        city: data.city || '',
        region: data.regionName || ''
      };
      return cachedGeoData;
    }
  } catch (error) {
    console.log('Geo lookup falhou');
  }
  
  return { ip: '' };
}

// Registra visita no Supabase
async function trackPageVisit(pagePath: string, pageTitle: string) {
  try {
    const sessionId = getSessionId();
    const geoData = await getGeoData();
    
    const visitData = {
      page_path: pagePath,
      page_title: pageTitle,
      visitor_ip: geoData.ip,
      visitor_country: geoData.country_name || null,
      visitor_city: geoData.city || null,
      visitor_region: geoData.region || null,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      session_id: sessionId,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      visited_at: new Date().toISOString()
    };

    // Fire-and-forget: não aguarda resposta
    supabase.from('page_visits').insert(visitData).then(({ error }) => {
      if (error) {
        console.log('Analytics: erro ao registrar visita', error.message);
      }
    });
  } catch (error) {
    // Silencioso - não deve afetar a experiência do usuário
    console.log('Analytics: erro interno', error);
  }
}

/**
 * Hook para rastrear visitas de página automaticamente
 * Uso: usePageTracker('Nome da Página');
 */
export function usePageTracker(pageTitle: string) {
  const location = useLocation();
  const lastPath = useRef<string>('');
  
  useEffect(() => {
    // Evita registrar a mesma página múltiplas vezes
    if (location.pathname !== lastPath.current) {
      lastPath.current = location.pathname;
      trackPageVisit(location.pathname, pageTitle);
    }
  }, [location.pathname, pageTitle]);
}

/**
 * Função para tracking manual (sem hook)
 * Útil para eventos específicos como cliques
 */
export function trackEvent(eventName: string, eventData?: Record<string, unknown>) {
  const sessionId = getSessionId();
  
  supabase.from('page_visits').insert({
    page_path: `event:${eventName}`,
    page_title: eventName,
    visitor_ip: cachedGeoData?.ip || null,
    visitor_country: cachedGeoData?.country_name || null,
    session_id: sessionId,
    device_type: getDeviceType(),
    browser: getBrowser(),
    os: getOS(),
    user_agent: navigator.userAgent,
    visited_at: new Date().toISOString()
  }).then(() => {});
}

export default usePageTracker;
