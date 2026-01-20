import React, { useState, useRef, useEffect } from 'react';
import { ContractDraft, AISuggestion } from '../../types';
import { chatWithContractAssistant, reviewContract } from '../../services/contractAI';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  draft: Partial<ContractDraft>;
  suggestions: AISuggestion[];
  onSuggestionsUpdate: (suggestions: AISuggestion[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AIAssistant: React.FC<Props> = ({ draft, suggestions, onSuggestionsUpdate, isOpen, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o assistente de contratos da KION. Posso ajudar você a:\n\n• Criar cláusulas personalizadas\n• Revisar o contrato\n• Esclarecer dúvidas jurídicas\n• Sugerir melhorias\n\nComo posso ajudar?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const chatMessages = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));
      chatMessages.push({ role: 'user', content: userMessage });

      const response = await chatWithContractAssistant(chatMessages, draft as ContractDraft);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async () => {
    if (!draft.clauses || draft.clauses.length === 0) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Para revisar o contrato, primeiro adicione algumas cláusulas.'
      }]);
      return;
    }

    setIsReviewing(true);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Analisando o contrato... 🔍'
    }]);

    try {
      const newSuggestions = await reviewContract(draft as ContractDraft);
      onSuggestionsUpdate(newSuggestions);

      const summaryMessage = newSuggestions.length > 0
        ? `Encontrei ${newSuggestions.length} ponto(s) de atenção:\n\n${
            newSuggestions.map((s, i) => `${i + 1}. [${s.type.toUpperCase()}] ${s.message}`).join('\n\n')
          }`
        : 'Ótimo! O contrato parece estar bem estruturado. Não encontrei problemas significativos.';

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: summaryMessage };
        return updated;
      });
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          role: 'assistant', 
          content: 'Erro ao revisar o contrato. Tente novamente.' 
        };
        return updated;
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const quickQuestions = [
    'Quais cláusulas são obrigatórias?',
    'Como calcular multa por atraso?',
    'O que é importante em garantia?',
    'Revisar contrato atual'
  ];

  const handleQuickQuestion = (question: string) => {
    if (question === 'Revisar contrato atual') {
      handleReview();
    } else {
      setInput(question);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-110 z-50"
        title="Assistente IA"
      >
        <i className="fas fa-robot text-xl"></i>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <div className="font-bold">Assistente KION</div>
              <div className="text-xs text-white/80">Especialista em Contratos</div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
              <i className="fas fa-circle-notch fa-spin text-purple-600"></i>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t bg-white">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuickQuestion(q)}
              disabled={isLoading || isReviewing}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 whitespace-nowrap transition disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua pergunta..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition disabled:opacity-50"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>

      {/* Suggestions Badge */}
      {suggestions.length > 0 && (
        <div className="absolute top-16 right-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {suggestions.length} sugestões
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
