
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
      message: 'Elegibilidade para Drawback Suspencão/Isenção detectada.',
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
      message: 'Análise de DIFAL Obrigatória (EC 87/2015).',
      impact: 'Risco de retenção de carga por recolhimento incorreto da diferença de alíquota.'
    });
  }

  // 3. Tax Benefit (Leasing vs Sale)
  if (contract.operationType === OperationType.LEASING) {
    alerts.push({
      type: 'Opportunity',
      message: 'Não incidência de ICMS sobre locação de bens móveis.',
      impact: 'Economia direta de ICMS (Súmula Vinculante 31 STF).'
    });
  }

  // 4. Equipment NCM Alert (Capital Goods - BK)
  if (contract.ncm.startsWith('8427') || contract.ncm.startsWith('8428')) {
    alerts.push({
      type: 'Opportunity',
      message: 'Ex-Tarifário para Bens de Capital (BK).',
      impact: 'Verificar se o NCM possui redução temporária de I.I. para 0%.'
    });
  }

  return alerts;
}
