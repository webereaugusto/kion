import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pwrmscfqpaucqhxncapf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cm1zY2ZxcGF1Y3FoeG5jYXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDQxOTQsImV4cCI6MjA4NDQ4MDE5NH0.dmyJ2fuGDRpbTvdCDbnr7K2FxnrQXea8HnaHTvWbcbo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface DbContract {
  id: string;
  contract_number: string;
  party_name: string;
  value: number;
  ncm: string;
  origin_state: string;
  destination_state: string;
  operation_type: string;
  expiry_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbContractHistory {
  id: string;
  contract_id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
  changed_by: string;
}

// Funções de conversão entre formato do banco e formato da aplicação
export function dbToContract(db: DbContract): import('../types').Contract {
  return {
    id: db.id,
    contractNumber: db.contract_number,
    partyName: db.party_name,
    value: Number(db.value),
    ncm: db.ncm,
    originState: db.origin_state,
    destinationState: db.destination_state,
    operationType: db.operation_type as import('../types').OperationType,
    expiryDate: db.expiry_date || '',
    status: db.status as 'Ativo' | 'Vencendo' | 'Encerrado',
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    history: []
  };
}

export function contractToDb(contract: Partial<import('../types').Contract>): Partial<DbContract> {
  const db: Partial<DbContract> = {};
  
  if (contract.contractNumber !== undefined) db.contract_number = contract.contractNumber;
  if (contract.partyName !== undefined) db.party_name = contract.partyName;
  if (contract.value !== undefined) db.value = contract.value;
  if (contract.ncm !== undefined) db.ncm = contract.ncm;
  if (contract.originState !== undefined) db.origin_state = contract.originState;
  if (contract.destinationState !== undefined) db.destination_state = contract.destinationState;
  if (contract.operationType !== undefined) db.operation_type = contract.operationType;
  if (contract.expiryDate !== undefined) db.expiry_date = contract.expiryDate || null;
  if (contract.status !== undefined) db.status = contract.status;
  
  return db;
}
