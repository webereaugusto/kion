import { Contract, OperationType } from './types';

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO', 'OUTSIDE_BR'
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: '1',
    contractNumber: 'KSA-2023-001',
    partyName: 'Linde Material Handling LTDA',
    value: 1250000,
    ncm: '8427.20.10',
    originState: 'SP',
    destinationState: 'MG',
    operationType: OperationType.SALE,
    expiryDate: '2024-12-31',
    status: 'Ativo',
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2023-06-15T10:00:00Z',
    history: []
  },
  {
    id: '2',
    contractNumber: 'KSA-2023-042',
    partyName: 'Dematic Brasil Soluções',
    value: 450000,
    ncm: '8428.39.90',
    originState: 'OUTSIDE_BR',
    destinationState: 'SP',
    operationType: OperationType.IMPORT,
    expiryDate: '2024-05-15',
    status: 'Vencendo',
    createdAt: '2023-08-20T14:30:00Z',
    updatedAt: '2023-08-20T14:30:00Z',
    history: []
  },
  {
    id: '3',
    contractNumber: 'KSA-2024-015',
    partyName: 'STILL do Brasil',
    value: 890000,
    ncm: '8427.10.19',
    originState: 'SP',
    destinationState: 'AM',
    operationType: OperationType.SALE,
    expiryDate: '2025-03-20',
    status: 'Ativo',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-10T09:15:00Z',
    history: []
  },
  {
    id: '4',
    contractNumber: 'KSA-2024-023',
    partyName: 'Baoli Empilhadeiras',
    value: 320000,
    ncm: '8427.20.90',
    originState: 'PR',
    destinationState: 'SC',
    operationType: OperationType.LEASING,
    expiryDate: '2025-06-30',
    status: 'Ativo',
    createdAt: '2024-02-05T16:45:00Z',
    updatedAt: '2024-02-05T16:45:00Z',
    history: []
  },
  {
    id: '5',
    contractNumber: 'KSA-2024-031',
    partyName: 'Logística Santos LTDA',
    value: 2100000,
    ncm: '8428.90.90',
    originState: 'SP',
    destinationState: 'OUTSIDE_BR',
    operationType: OperationType.EXPORT,
    expiryDate: '2025-08-15',
    status: 'Ativo',
    createdAt: '2024-03-12T11:20:00Z',
    updatedAt: '2024-03-12T11:20:00Z',
    history: []
  }
];

// Legacy export for backward compatibility
export const MOCK_CONTRACTS = INITIAL_CONTRACTS;
