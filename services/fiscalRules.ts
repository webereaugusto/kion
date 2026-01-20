import { Contract, OperationType, FiscalAlert } from '../types';

/**
 * Business Rules Engine for Fiscal Logistics
 * Analyzes contract metadata to trigger alerts.
 */
export function analyzeContractFiscalImpact(contract: Contract): FiscalAlert[] {
  const alerts: FiscalAlert[] = [];

  // 1. Drawback Opportunity (Import)
  if (contract.operationType === OperationType.IMPORT) {
    alerts.push({
      type: 'Opportunity',
      code: 'DRAWBACK',
      message: 'Elegibilidade para Drawback Suspensão/Isenção detectada.',
      impact: 'Redução de até 100% no II, IPI, PIS e COFINS-Importação.'
    });
  }

  // 2. DIFAL Risk (Interstate Sale to Final Consumer)
  if (
    contract.operationType === OperationType.SALE && 
    contract.originState !== contract.destinationState &&
    contract.destinationState !== 'OUTSIDE_BR'
  ) {
    alerts.push({
      type: 'Risk',
      code: 'DIFAL',
      message: 'Análise de DIFAL Obrigatória (EC 87/2015).',
      impact: 'Risco de retenção de carga por recolhimento incorreto da diferença de alíquota.'
    });
  }

  // 3. Tax Benefit (Leasing vs Sale)
  if (contract.operationType === OperationType.LEASING) {
    alerts.push({
      type: 'Opportunity',
      code: 'LEASING_ICMS',
      message: 'Não incidência de ICMS sobre locação de bens móveis.',
      impact: 'Economia direta de ICMS (Súmula Vinculante 31 STF).'
    });
  }

  // 4. Equipment NCM Alert (Capital Goods - BK)
  if (contract.ncm.startsWith('8427') || contract.ncm.startsWith('8428')) {
    alerts.push({
      type: 'Opportunity',
      code: 'EX_TARIFARIO',
      message: 'Ex-Tarifário para Bens de Capital (BK).',
      impact: 'Verificar se o NCM possui redução temporária de I.I. para 0%.'
    });
  }

  // 5. Comodato - ISS Alert
  if (contract.operationType === OperationType.COMODATO) {
    alerts.push({
      type: 'Info',
      code: 'COMODATO_ISS',
      message: 'Comodato não gera ICMS, mas pode haver ISS.',
      impact: 'Avaliar se há prestação de serviço associada que caracterize fato gerador de ISS.'
    });
  }

  // 6. Export - Tax Benefits
  if (contract.operationType === OperationType.EXPORT || contract.destinationState === 'OUTSIDE_BR') {
    alerts.push({
      type: 'Opportunity',
      code: 'EXPORT_IMMUNITY',
      message: 'Imunidade tributária na exportação.',
      impact: 'Não incidência de ICMS, IPI, PIS e COFINS na exportação (CF art. 155, §2º, X, a).'
    });
  }

  // 7. High Value Contract Alert
  if (contract.value >= 1000000) {
    alerts.push({
      type: 'Info',
      code: 'HIGH_VALUE',
      message: 'Contrato de alto valor - Compliance reforçado.',
      impact: 'Recomenda-se revisão jurídica completa e validação fiscal detalhada.'
    });
  }

  // 8. Zona Franca de Manaus
  if (contract.destinationState === 'AM' && contract.operationType === OperationType.SALE) {
    alerts.push({
      type: 'Opportunity',
      code: 'ZFM',
      message: 'Possível benefício Zona Franca de Manaus.',
      impact: 'Verificar elegibilidade para isenção/suspensão de II, IPI e redução de ICMS.'
    });
  }

  // 9. SUFRAMA
  if (['AM', 'RR', 'AP', 'AC', 'RO'].includes(contract.destinationState) && 
      contract.operationType === OperationType.SALE) {
    alerts.push({
      type: 'Info',
      code: 'SUFRAMA',
      message: 'Área de atuação SUFRAMA.',
      impact: 'Verificar necessidade de PIN SUFRAMA e benefícios aplicáveis.'
    });
  }

  // 10. Maquinário Industrial
  if (contract.ncm.startsWith('84') || contract.ncm.startsWith('85')) {
    alerts.push({
      type: 'Info',
      code: 'REINTEGRA',
      message: 'NCM elegível para REINTEGRA.',
      impact: 'Possibilidade de ressarcimento de tributos em caso de exportação futura.'
    });
  }

  // 11. ICMS ST Risk
  const ncmsWithST = ['8544', '8536', '8537', '8538'];
  if (ncmsWithST.some(ncm => contract.ncm.startsWith(ncm))) {
    alerts.push({
      type: 'Risk',
      code: 'ICMS_ST',
      message: 'NCM sujeito a Substituição Tributária.',
      impact: 'Verificar MVA e protocolo ICMS-ST entre os estados de origem e destino.'
    });
  }

  return alerts;
}

/**
 * Calcula score de risco do contrato (0-100)
 */
export function calculateRiskScore(contract: Contract): number {
  const alerts = analyzeContractFiscalImpact(contract);
  const risks = alerts.filter(a => a.type === 'Risk').length;
  const opportunities = alerts.filter(a => a.type === 'Opportunity').length;
  
  let score = 50; // Base score
  score += risks * 15; // Each risk adds 15
  score -= opportunities * 10; // Each opportunity reduces 10
  
  // High value increases risk
  if (contract.value >= 1000000) score += 10;
  
  // Interstate transactions are riskier
  if (contract.originState !== contract.destinationState) score += 5;
  
  return Math.max(0, Math.min(100, score));
}
