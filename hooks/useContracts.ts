import { useState, useEffect, useCallback } from 'react';
import { Contract, ContractHistory } from '../types';
import { supabase, dbToContract, contractToDb, DbContract, DbContractHistory } from '../services/supabase';
import { v4 as uuidv4 } from 'uuid';

interface UseContractsReturn {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  fetchContracts: () => Promise<void>;
  addContract: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => Promise<Contract | null>;
  updateContract: (contract: Contract) => Promise<boolean>;
  deleteContract: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useContracts(): UseContractsReturn {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar contratos
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (contractsError) throw contractsError;

      // Buscar histórico de todos os contratos
      const { data: historyData, error: historyError } = await supabase
        .from('contract_history')
        .select('*')
        .order('changed_at', { ascending: false });

      if (historyError) throw historyError;

      // Converter e combinar dados
      const contractsWithHistory = (contractsData || []).map((dbContract: DbContract) => {
        const contract = dbToContract(dbContract);
        contract.history = (historyData || [])
          .filter((h: DbContractHistory) => h.contract_id === contract.id)
          .map((h: DbContractHistory) => ({
            id: h.id,
            contractId: h.contract_id,
            field: h.field,
            oldValue: h.old_value || '',
            newValue: h.new_value || '',
            changedAt: h.changed_at,
            changedBy: h.changed_by
          }));
        return contract;
      });

      setContracts(contractsWithHistory);
    } catch (err) {
      console.error('Erro ao buscar contratos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addContract = useCallback(async (
    contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'history'>
  ): Promise<Contract | null> => {
    try {
      const now = new Date().toISOString();
      const dbData = {
        ...contractToDb(contractData),
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('contracts')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;

      const newContract = dbToContract(data);
      newContract.history = [];
      
      setContracts(prev => [newContract, ...prev]);
      return newContract;
    } catch (err) {
      console.error('Erro ao adicionar contrato:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar contrato');
      return null;
    }
  }, []);

  const updateContract = useCallback(async (contract: Contract): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      
      // Buscar contrato atual para comparar mudanças
      const { data: currentData } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contract.id)
        .single();

      if (currentData) {
        const currentContract = dbToContract(currentData);
        const changes: Partial<ContractHistory>[] = [];
        
        // Detectar mudanças
        const fieldsToTrack: (keyof Contract)[] = [
          'contractNumber', 'partyName', 'value', 'ncm', 
          'originState', 'destinationState', 'operationType', 'status', 'expiryDate'
        ];

        for (const field of fieldsToTrack) {
          const oldVal = String(currentContract[field] || '');
          const newVal = String(contract[field] || '');
          if (oldVal !== newVal) {
            changes.push({
              id: uuidv4(),
              contractId: contract.id,
              field,
              oldValue: oldVal,
              newValue: newVal,
              changedAt: now,
              changedBy: 'Usuário Sistema'
            });
          }
        }

        // Inserir histórico de mudanças
        if (changes.length > 0) {
          const historyInserts = changes.map(c => ({
            contract_id: c.contractId,
            field: c.field,
            old_value: c.oldValue,
            new_value: c.newValue,
            changed_at: c.changedAt,
            changed_by: c.changedBy
          }));

          await supabase.from('contract_history').insert(historyInserts);
        }
      }

      // Atualizar contrato
      const dbData = {
        ...contractToDb(contract),
        updated_at: now
      };

      const { error } = await supabase
        .from('contracts')
        .update(dbData)
        .eq('id', contract.id);

      if (error) throw error;

      // Atualizar estado local
      setContracts(prev => prev.map(c => 
        c.id === contract.id 
          ? { ...contract, updatedAt: now }
          : c
      ));

      return true;
    } catch (err) {
      console.error('Erro ao atualizar contrato:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar contrato');
      return false;
    }
  }, []);

  const deleteContract = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContracts(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error('Erro ao excluir contrato:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir contrato');
      return false;
    }
  }, []);

  // Carregar contratos ao montar
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    addContract,
    updateContract,
    deleteContract,
    refetch: fetchContracts
  };
}
