import React, { useState } from 'react';
import kionLogoUrl from '../../logo.png';

interface Props {
  onAuthenticated: () => void;
}

const ANALYTICS_PASSWORD = import.meta.env.VITE_ANALYTICS_PASSWORD || 'kion2025';

const PasswordGate: React.FC<Props> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Pequeno delay para parecer que está verificando
    setTimeout(() => {
      if (password === ANALYTICS_PASSWORD) {
        sessionStorage.setItem('kion_analytics_auth', 'true');
        onAuthenticated();
      } else {
        setError('Senha incorreta');
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={kionLogoUrl} 
            alt="KION" 
            className="mx-auto mb-4"
            style={{ height: '48px', width: 'auto' }}
          />
          <h1 className="text-2xl font-black text-slate-800">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Área restrita - Digite a senha para acessar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <i className="fas fa-lock mr-2"></i>
              Senha de Acesso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                error ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="Digite a senha"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!password || isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Verificando...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                Entrar
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a 
            href="/"
            className="text-sm text-gray-500 hover:text-blue-600 transition"
          >
            <i className="fas fa-arrow-left mr-1"></i>
            Voltar ao sistema
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordGate;
