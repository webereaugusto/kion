import { useState, useEffect, useCallback } from 'react';
import { ContractDraft, ContractClause, AISuggestion, Approver, DraftStatus } from '../types';
import { supabase } from '../services/supabase';

interface DbContractDraft {
  id: string;
  title: string;
  contract_type: string;
  equipment_category: string | null;
  brand: string | null;
  client_name: string;
  client_cnpj: string | null;
  client_address: string | null;
  client_contact_name: string | null;
  client_contact_email: string | null;
  client_contact_phone: string | null;
  equipment_description: string | null;
  equipment_quantity: number;
  value: number;
  payment_terms: string | null;
  duration_months: number | null;
  start_date: string | null;
  warranty_months: number;
  clauses: ContractClause[];
  ai_suggestions: AISuggestion[];
  custom_terms: string | null;
  status: string;
  share_token: string;
  approved_by: Approver[];
  rejection_reason: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function dbToDraft(db: DbContractDraft): ContractDraft {
  return {
    id: db.id,
    title: db.title,
    contractType: db.contract_type as ContractDraft['contractType'],
    equipmentCategory: db.equipment_category as ContractDraft['equipmentCategory'],
    brand: db.brand as ContractDraft['brand'],
    clientName: db.client_name,
    clientCnpj: db.client_cnpj || undefined,
    clientAddress: db.client_address || undefined,
    clientContactName: db.client_contact_name || undefined,
    clientContactEmail: db.client_contact_email || undefined,
    clientContactPhone: db.client_contact_phone || undefined,
    equipmentDescription: db.equipment_description || undefined,
    equipmentQuantity: db.equipment_quantity || 1,
    value: Number(db.value),
    paymentTerms: db.payment_terms || undefined,
    durationMonths: db.duration_months || undefined,
    startDate: db.start_date || undefined,
    warrantyMonths: db.warranty_months || 12,
    clauses: db.clauses || [],
    aiSuggestions: db.ai_suggestions || [],
    customTerms: db.custom_terms || undefined,
    status: db.status as DraftStatus,
    shareToken: db.share_token,
    approvedBy: db.approved_by || [],
    rejectionReason: db.rejection_reason || undefined,
    createdBy: db.created_by,
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

function draftToDb(draft: Partial<ContractDraft>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  
  if (draft.title !== undefined) db.title = draft.title;
  if (draft.contractType !== undefined) db.contract_type = draft.contractType;
  if (draft.equipmentCategory !== undefined) db.equipment_category = draft.equipmentCategory;
  if (draft.brand !== undefined) db.brand = draft.brand;
  if (draft.clientName !== undefined) db.client_name = draft.clientName;
  if (draft.clientCnpj !== undefined) db.client_cnpj = draft.clientCnpj;
  if (draft.clientAddress !== undefined) db.client_address = draft.clientAddress;
  if (draft.clientContactName !== undefined) db.client_contact_name = draft.clientContactName;
  if (draft.clientContactEmail !== undefined) db.client_contact_email = draft.clientContactEmail;
  if (draft.clientContactPhone !== undefined) db.client_contact_phone = draft.clientContactPhone;
  if (draft.equipmentDescription !== undefined) db.equipment_description = draft.equipmentDescription;
  if (draft.equipmentQuantity !== undefined) db.equipment_quantity = draft.equipmentQuantity;
  if (draft.value !== undefined) db.value = draft.value;
  if (draft.paymentTerms !== undefined) db.payment_terms = draft.paymentTerms;
  if (draft.durationMonths !== undefined) db.duration_months = draft.durationMonths;
  if (draft.startDate !== undefined) db.start_date = draft.startDate;
  if (draft.warrantyMonths !== undefined) db.warranty_months = draft.warrantyMonths;
  if (draft.clauses !== undefined) db.clauses = draft.clauses;
  if (draft.aiSuggestions !== undefined) db.ai_suggestions = draft.aiSuggestions;
  if (draft.customTerms !== undefined) db.custom_terms = draft.customTerms;
  if (draft.status !== undefined) db.status = draft.status;
  if (draft.approvedBy !== undefined) db.approved_by = draft.approvedBy;
  if (draft.rejectionReason !== undefined) db.rejection_reason = draft.rejectionReason;
  
  return db;
}

interface UseContractDraftsReturn {
  drafts: ContractDraft[];
  currentDraft: ContractDraft | null;
  loading: boolean;
  error: string | null;
  fetchDrafts: () => Promise<void>;
  fetchDraftById: (id: string) => Promise<ContractDraft | null>;
  fetchDraftByShareToken: (token: string) => Promise<ContractDraft | null>;
  createDraft: (draft: Partial<ContractDraft>) => Promise<ContractDraft | null>;
  updateDraft: (id: string, updates: Partial<ContractDraft>) => Promise<boolean>;
  deleteDraft: (id: string) => Promise<boolean>;
  setCurrentDraft: (draft: ContractDraft | null) => void;
  submitForApproval: (id: string) => Promise<boolean>;
  approveDraft: (id: string, approver: Approver) => Promise<boolean>;
  rejectDraft: (id: string, reason: string) => Promise<boolean>;
}

export function useContractDrafts(): UseContractDraftsReturn {
  const [drafts, setDrafts] = useState<ContractDraft[]>([]);
  const [currentDraft, setCurrentDraft] = useState<ContractDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('contract_drafts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedDrafts = (data || []).map((d: DbContractDraft) => dbToDraft(d));
      setDrafts(mappedDrafts);
    } catch (err) {
      console.error('Erro ao buscar rascunhos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar rascunhos');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDraftById = useCallback(async (id: string): Promise<ContractDraft | null> => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('contract_drafts')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data ? dbToDraft(data) : null;
    } catch (err) {
      console.error('Erro ao buscar rascunho:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDraftByShareToken = useCallback(async (token: string): Promise<ContractDraft | null> => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('contract_drafts')
        .select('*')
        .eq('share_token', token)
        .single();

      if (fetchError) throw fetchError;
      return data ? dbToDraft(data) : null;
    } catch (err) {
      console.error('Erro ao buscar rascunho por token:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDraft = useCallback(async (draft: Partial<ContractDraft>): Promise<ContractDraft | null> => {
    try {
      const now = new Date().toISOString();
      const dbData = {
        ...draftToDb(draft),
        created_at: now,
        updated_at: now,
        status: 'Rascunho',
        created_by: 'Usuário Sistema'
      };

      const { data, error: insertError } = await supabase
        .from('contract_drafts')
        .insert(dbData)
        .select()
        .single();

      if (insertError) throw insertError;

      const newDraft = dbToDraft(data);
      setDrafts(prev => [newDraft, ...prev]);
      return newDraft;
    } catch (err) {
      console.error('Erro ao criar rascunho:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar rascunho');
      return null;
    }
  }, []);

  const updateDraft = useCallback(async (id: string, updates: Partial<ContractDraft>): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const dbData = {
        ...draftToDb(updates),
        updated_at: now
      };

      const { error: updateError } = await supabase
        .from('contract_drafts')
        .update(dbData)
        .eq('id', id);

      if (updateError) throw updateError;

      setDrafts(prev => prev.map(d => 
        d.id === id ? { ...d, ...updates, updatedAt: now } : d
      ));
      
      if (currentDraft?.id === id) {
        setCurrentDraft(prev => prev ? { ...prev, ...updates, updatedAt: now } : null);
      }

      return true;
    } catch (err) {
      console.error('Erro ao atualizar rascunho:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar rascunho');
      return false;
    }
  }, [currentDraft]);

  const deleteDraft = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('contract_drafts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setDrafts(prev => prev.filter(d => d.id !== id));
      if (currentDraft?.id === id) {
        setCurrentDraft(null);
      }
      return true;
    } catch (err) {
      console.error('Erro ao excluir rascunho:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir rascunho');
      return false;
    }
  }, [currentDraft]);

  const submitForApproval = useCallback(async (id: string): Promise<boolean> => {
    return updateDraft(id, { status: 'Aguardando Aprovação' });
  }, [updateDraft]);

  const approveDraft = useCallback(async (id: string, approver: Approver): Promise<boolean> => {
    const draft = drafts.find(d => d.id === id);
    if (!draft) return false;

    const updatedApprovers = [...draft.approvedBy, { ...approver, status: 'approved' as const, approvedAt: new Date().toISOString() }];
    return updateDraft(id, { 
      status: 'Aprovado', 
      approvedBy: updatedApprovers 
    });
  }, [drafts, updateDraft]);

  const rejectDraft = useCallback(async (id: string, reason: string): Promise<boolean> => {
    return updateDraft(id, { 
      status: 'Rejeitado', 
      rejectionReason: reason 
    });
  }, [updateDraft]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  return {
    drafts,
    currentDraft,
    loading,
    error,
    fetchDrafts,
    fetchDraftById,
    fetchDraftByShareToken,
    createDraft,
    updateDraft,
    deleteDraft,
    setCurrentDraft,
    submitForApproval,
    approveDraft,
    rejectDraft
  };
}
