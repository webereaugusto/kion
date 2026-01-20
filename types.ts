export enum OperationType {
  SALE = 'Venda',
  LEASING = 'Locação',
  COMODATO = 'Comodato',
  IMPORT = 'Importação',
  EXPORT = 'Exportação'
}

export interface Contract {
  id: string;
  contractNumber: string;
  partyName: string;
  value: number;
  ncm: string;
  originState: string;
  destinationState: string;
  operationType: OperationType;
  expiryDate: string;
  status: 'Ativo' | 'Vencendo' | 'Encerrado';
  createdAt: string;
  updatedAt: string;
  history?: ContractHistory[];
}

export interface ContractHistory {
  id: string;
  contractId: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: string;
  changedBy: string;
}

export interface FiscalAlert {
  type: 'Opportunity' | 'Risk' | 'Info';
  message: string;
  impact: string;
  code?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface FilterState {
  search: string;
  status: string;
  operationType: string;
  hasRisk: boolean | null;
  hasOpportunity: boolean | null;
}
