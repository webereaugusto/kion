
export enum OperationType {
  SALE = 'Venda',
  LEASING = 'Locação',
  COMODATO = 'Comodato',
  IMPORT = 'Importação'
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
}

export interface FiscalAlert {
  type: 'Opportunity' | 'Risk';
  message: string;
  impact: string;
}
