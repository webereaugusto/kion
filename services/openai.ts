// API Key deve ser configurada via variável de ambiente no Vercel
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `Você é o assistente virtual da KION CLM - Fiscal Intelligence, uma plataforma de gestão de contratos com foco em compliance fiscal e tributário brasileiro.

Seu papel é ajudar os usuários com:
- Dúvidas sobre gestão de contratos
- Explicações sobre regras fiscais brasileiras (ICMS, IPI, PIS, COFINS, DIFAL, Drawback, etc.)
- Como usar as funcionalidades do sistema (cadastrar contratos, filtrar, exportar, etc.)
- Explicações sobre NCM (Nomenclatura Comum do Mercosul)
- Orientações sobre operações interestaduais e internacionais
- Benefícios fiscais como Ex-Tarifário, Zona Franca de Manaus, REINTEGRA

Regras:
- Sempre responda em português brasileiro
- Seja objetivo e profissional
- Use linguagem técnica quando apropriado, mas explique termos complexos
- Se não souber algo específico, sugira que o usuário consulte um contador ou advogado tributarista
- Não forneça conselhos fiscais definitivos - sempre recomende validação com profissionais

Contexto do sistema KION CLM:
- Permite cadastrar contratos com NCM, valor, UF origem/destino
- Analisa automaticamente riscos e oportunidades fiscais
- Suporta operações: Venda, Locação, Comodato, Importação, Exportação
- Possui dashboard com gráficos e filtros avançados
- Exporta dados para CSV`;

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro na API OpenAI');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
  } catch (error) {
    console.error('Erro OpenAI:', error);
    throw error;
  }
}
