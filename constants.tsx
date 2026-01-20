
import { Contract, OperationType } from './types';

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO', 'OUTSIDE_BR'
];

export const MOCK_CONTRACTS: Contract[] = [
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
    status: 'Ativo'
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
    status: 'Vencendo'
  }
];
