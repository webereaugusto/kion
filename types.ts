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

// =====================================================
// Contract Generator Types
// =====================================================

export type ContractDraftType = 'Venda' | 'Locação' | 'Manutenção' | 'Automação' | 'Comodato';
export type EquipmentCategory = 'Empilhadeiras Elétricas' | 'Empilhadeiras Combustão' | 'Transpaleteiras' | 'Rebocadores' | 'AGVs/AMRs' | 'Sistemas Dematic' | 'Empilhadeiras e Transpaleteiras';
export type KionBrand = 'Linde' | 'STILL' | 'Baoli' | 'Dematic';
export type DraftStatus = 'Rascunho' | 'Aguardando Aprovação' | 'Aprovado' | 'Rejeitado';

export interface ContractClause {
  number: number;
  title: string;
  content: string;
  isAISuggested?: boolean;
}

export interface AISuggestion {
  id: string;
  type: 'clause' | 'warning' | 'improvement' | 'legal';
  message: string;
  suggestedClause?: ContractClause;
  appliedAt?: string;
}

export interface Approver {
  name: string;
  email: string;
  approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

export interface ContractDraft {
  id: string;
  title: string;
  contractType: ContractDraftType;
  equipmentCategory?: EquipmentCategory;
  brand?: KionBrand;
  
  // Client data
  clientName: string;
  clientCnpj?: string;
  clientAddress?: string;
  clientContactName?: string;
  clientContactEmail?: string;
  clientContactPhone?: string;
  
  // Contract details
  equipmentDescription?: string;
  equipmentQuantity: number;
  value: number;
  paymentTerms?: string;
  durationMonths?: number;
  startDate?: string;
  warrantyMonths: number;
  
  // Clauses and AI
  clauses: ContractClause[];
  aiSuggestions: AISuggestion[];
  customTerms?: string;
  
  // Workflow
  status: DraftStatus;
  shareToken: string;
  approvedBy: Approver[];
  rejectionReason?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}
