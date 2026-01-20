import { ContractDraft, ContractClause, AISuggestion, ContractDraftType } from '../types';
import { v4 as uuidv4 } from 'uuid';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

const CONTRACT_SYSTEM_PROMPT = `Você é um especialista jurídico da KION Group, multinacional líder em soluções de intralogística.
Você auxilia na criação e revisão de contratos comerciais no Brasil, com expertise em:

**KION GROUP - Contexto de Negócio:**
- Marcas: Linde Material Handling, STILL, Baoli (economia), Dematic (automação)
- Produtos: Empilhadeiras elétricas e combustão, transpaleteiras, rebocadores, AGVs, AMRs
- Serviços: Locação, manutenção, automação de armazéns, sistemas de movimentação

**Tipos de Contrato:**
1. VENDA - Fornecimento de equipamentos novos/usados
2. LOCAÇÃO - Aluguel de equipamentos (curto/longo prazo)
3. MANUTENÇÃO - Full Service, preventiva, corretiva
4. AUTOMAÇÃO - Projetos Dematic (conveyors, shuttles, WCS)
5. COMODATO - Empréstimo de equipamentos

**Legislação Brasileira Aplicável:**
- Código Civil (Lei 10.406/2002) - Contratos em geral
- Código de Defesa do Consumidor (Lei 8.078/1990) - Quando aplicável
- NR-11 (Transporte de Materiais) - Segurança do trabalho
- Lei 8.666/1993 - Licitações (se aplicável)
- LGPD (Lei 13.709/2018) - Proteção de dados

**Regras:**
- Responda sempre em português brasileiro
- Use linguagem jurídica clara e objetiva
- Inclua referências legais quando relevante
- Sugira cláusulas protetivas para ambas as partes
- Alerte sobre riscos contratuais
- Considere aspectos tributários (ICMS, ISS, IPI)`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

async function callOpenAI(messages: ChatMessage[], maxTokens: number = 2000): Promise<string> {
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
          { role: 'system', content: CONTRACT_SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro na API OpenAI');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Erro OpenAI:', error);
    throw error;
  }
}

/**
 * Gera cláusulas sugeridas para um tipo de contrato
 */
export async function generateSuggestedClauses(
  contractType: ContractDraftType,
  context: {
    brand?: string;
    equipmentDescription?: string;
    value?: number;
    durationMonths?: number;
  }
): Promise<ContractClause[]> {
  const prompt = `Gere as cláusulas essenciais para um contrato de ${contractType} da KION.

Contexto:
- Marca: ${context.brand || 'KION'}
- Equipamento: ${context.equipmentDescription || 'Equipamento de intralogística'}
- Valor: R$ ${context.value?.toLocaleString('pt-BR') || 'A definir'}
- Duração: ${context.durationMonths ? `${context.durationMonths} meses` : 'A definir'}

Retorne APENAS um array JSON com as cláusulas no formato:
[
  {"number": 1, "title": "Título da Cláusula", "content": "Conteúdo completo da cláusula..."},
  ...
]

Inclua no mínimo: Objeto, Prazo, Valor/Pagamento, Obrigações das Partes, Garantia, Rescisão, Foro.`;

  try {
    const response = await callOpenAI([{ role: 'user', content: prompt }], 3000);
    
    // Extrair JSON da resposta
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const clauses = JSON.parse(jsonMatch[0]) as ContractClause[];
      return clauses.map(c => ({ ...c, isAISuggested: true }));
    }
    return [];
  } catch (error) {
    console.error('Erro ao gerar cláusulas:', error);
    return getDefaultClauses(contractType);
  }
}

/**
 * Revisa o contrato e retorna sugestões de melhoria
 */
export async function reviewContract(draft: ContractDraft): Promise<AISuggestion[]> {
  const clausesText = draft.clauses.map(c => `${c.number}. ${c.title}: ${c.content}`).join('\n\n');
  
  const prompt = `Revise o seguinte contrato de ${draft.contractType} e identifique:
1. Cláusulas obrigatórias que estão FALTANDO
2. Riscos jurídicos nas cláusulas existentes
3. Oportunidades de melhoria
4. Conformidade com legislação brasileira

**CONTRATO:**
Tipo: ${draft.contractType}
Cliente: ${draft.clientName}
Valor: R$ ${draft.value.toLocaleString('pt-BR')}
Duração: ${draft.durationMonths || 'Não especificado'} meses

**CLÁUSULAS:**
${clausesText}

Retorne APENAS um array JSON no formato:
[
  {"type": "warning|improvement|legal", "message": "Descrição do ponto identificado"},
  ...
]`;

  try {
    const response = await callOpenAI([{ role: 'user', content: prompt }], 2000);
    
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]) as Array<{type: string; message: string}>;
      return suggestions.map(s => ({
        id: uuidv4(),
        type: s.type as AISuggestion['type'],
        message: s.message
      }));
    }
    return [];
  } catch (error) {
    console.error('Erro ao revisar contrato:', error);
    return [];
  }
}

/**
 * Gera descrição técnica de equipamento
 */
export async function generateEquipmentDescription(
  brand: string,
  category: string,
  quantity: number
): Promise<string> {
  const prompt = `Gere uma descrição técnica profissional para contrato de:
- Marca: ${brand}
- Categoria: ${category}
- Quantidade: ${quantity} unidade(s)

A descrição deve incluir características típicas do equipamento (capacidade, especificações).
Retorne apenas a descrição, sem formatação extra.`;

  try {
    const response = await callOpenAI([{ role: 'user', content: prompt }], 500);
    return response.trim();
  } catch (error) {
    console.error('Erro ao gerar descrição:', error);
    return `${quantity}x ${brand} ${category}`;
  }
}

/**
 * Chat interativo para auxiliar na criação do contrato
 */
export async function chatWithContractAssistant(
  messages: ChatMessage[],
  contractContext?: Partial<ContractDraft>
): Promise<string> {
  const contextStr = contractContext 
    ? `\n\nContexto do contrato atual:\n- Tipo: ${contractContext.contractType}\n- Cliente: ${contractContext.clientName}\n- Valor: R$ ${contractContext.value?.toLocaleString('pt-BR')}`
    : '';

  const systemMessage = CONTRACT_SYSTEM_PROMPT + contextStr;
  
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
          { role: 'system', content: systemMessage },
          ...messages
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('Erro na API');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
  } catch (error) {
    console.error('Erro no chat:', error);
    throw error;
  }
}

/**
 * Cláusulas padrão quando a IA não está disponível
 */
function getDefaultClauses(contractType: ContractDraftType): ContractClause[] {
  const commonClauses: ContractClause[] = [
    {
      number: 1,
      title: 'Objeto',
      content: `O presente contrato tem por objeto a ${contractType.toLowerCase()} de equipamentos de movimentação de materiais da KION Group, conforme especificações técnicas constantes no Anexo I.`
    },
    {
      number: 2,
      title: 'Prazo',
      content: 'O prazo de vigência deste contrato será de [PRAZO] meses, contados a partir da assinatura, podendo ser prorrogado mediante termo aditivo assinado por ambas as partes.'
    },
    {
      number: 3,
      title: 'Valor e Condições de Pagamento',
      content: 'O valor total deste contrato é de R$ [VALOR], a ser pago conforme condições estabelecidas no Anexo II - Condições Comerciais.'
    },
    {
      number: 4,
      title: 'Obrigações da Contratante',
      content: 'São obrigações da CONTRATANTE: a) utilizar os equipamentos conforme orientações do fabricante; b) comunicar imediatamente qualquer irregularidade; c) efetuar os pagamentos nas datas acordadas.'
    },
    {
      number: 5,
      title: 'Obrigações da Contratada',
      content: 'São obrigações da CONTRATADA: a) entregar os equipamentos em perfeitas condições; b) fornecer treinamento operacional; c) prestar assistência técnica conforme SLA estabelecido.'
    },
    {
      number: 6,
      title: 'Garantia',
      content: 'A CONTRATADA garante os equipamentos pelo prazo de [GARANTIA] meses contra defeitos de fabricação, excluindo-se danos causados por mau uso, acidentes ou modificações não autorizadas.'
    },
    {
      number: 7,
      title: 'Rescisão',
      content: 'O presente contrato poderá ser rescindido: a) por mútuo acordo; b) por inadimplência de qualquer das partes, após notificação com prazo de 30 dias para regularização; c) por caso fortuito ou força maior.'
    },
    {
      number: 8,
      title: 'Foro',
      content: 'Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer dúvidas ou litígios decorrentes deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.'
    }
  ];

  // Adicionar cláusulas específicas por tipo
  if (contractType === 'Locação') {
    commonClauses.splice(5, 0, {
      number: 6,
      title: 'Manutenção',
      content: 'A manutenção preventiva e corretiva dos equipamentos será de responsabilidade da LOCADORA, devendo ser realizada conforme plano de manutenção do fabricante.'
    });
    // Reordenar números
    commonClauses.forEach((c, i) => c.number = i + 1);
  }

  if (contractType === 'Manutenção') {
    commonClauses.splice(4, 0, {
      number: 5,
      title: 'Nível de Serviço (SLA)',
      content: 'A CONTRATADA compromete-se a atender chamados de manutenção nos seguintes prazos: Urgente (equipamento parado) - 4 horas; Normal - 24 horas; Programado - conforme agendamento.'
    });
    commonClauses.forEach((c, i) => c.number = i + 1);
  }

  return commonClauses;
}

export { getDefaultClauses };
