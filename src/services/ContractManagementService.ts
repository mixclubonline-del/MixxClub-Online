import { supabase } from '@/integrations/supabase/client';

export interface Contract {
  id: string;
  accountId: string;
  contractType: 'standard' | 'custom' | 'pilot' | 'enterprise';
  status: 'draft' | 'active' | 'expired' | 'cancelled' | 'renewed';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  terms: Record<string, any>;
  slaTerms: Record<string, any>;
  signedBy?: string;
  signedAt?: Date;
  documentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ContractManagementService
 * Manage enterprise contracts and SLAs
 */
export class ContractManagementService {
  /**
   * List contracts for an account
   */
  static async listContracts(accountId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('enterprise_contracts')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.transformContractFromDb);
  }

  /**
   * Create a new contract
   */
  static async createContract(
    contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Contract> {
    const { data, error } = await supabase
      .from('enterprise_contracts')
      .insert({
        account_id: contractData.accountId,
        contract_type: contractData.contractType,
        status: contractData.status,
        start_date: contractData.startDate.toISOString().split('T')[0],
        end_date: contractData.endDate?.toISOString().split('T')[0],
        auto_renew: contractData.autoRenew,
        terms: contractData.terms,
        sla_terms: contractData.slaTerms,
        signed_by: contractData.signedBy,
        signed_at: contractData.signedAt?.toISOString(),
        document_url: contractData.documentUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformContractFromDb(data);
  }

  /**
   * Update a contract
   */
  static async updateContract(
    contractId: string,
    updates: Partial<Contract>
  ): Promise<Contract> {
    const dbUpdates: Record<string, any> = {};

    if (updates.status) dbUpdates.status = updates.status;
    if (updates.endDate !== undefined) {
      dbUpdates.end_date = updates.endDate?.toISOString().split('T')[0];
    }
    if (updates.autoRenew !== undefined) dbUpdates.auto_renew = updates.autoRenew;
    if (updates.terms) dbUpdates.terms = updates.terms;
    if (updates.slaTerms) dbUpdates.sla_terms = updates.slaTerms;
    if (updates.signedBy) dbUpdates.signed_by = updates.signedBy;
    if (updates.signedAt) dbUpdates.signed_at = updates.signedAt.toISOString();
    if (updates.documentUrl !== undefined) dbUpdates.document_url = updates.documentUrl;

    const { data, error } = await supabase
      .from('enterprise_contracts')
      .update(dbUpdates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) throw error;
    return this.transformContractFromDb(data);
  }

  /**
   * Get a single contract
   */
  static async getContract(contractId: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('enterprise_contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.transformContractFromDb(data);
  }

  /**
   * Get active contracts for an account
   */
  static async getActiveContracts(accountId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('enterprise_contracts')
      .select('*')
      .eq('account_id', accountId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.transformContractFromDb);
  }

  /**
   * Renew a contract
   */
  static async renewContract(
    contractId: string,
    newEndDate: Date
  ): Promise<Contract> {
    const contract = await this.getContract(contractId);
    if (!contract) throw new Error('Contract not found');

    // Update the old contract
    await this.updateContract(contractId, {
      status: 'renewed',
    });

    // Create a new contract
    const newContract = await this.createContract({
      accountId: contract.accountId,
      contractType: contract.contractType,
      status: 'active',
      startDate: contract.endDate || new Date(),
      endDate: newEndDate,
      autoRenew: contract.autoRenew,
      terms: contract.terms,
      slaTerms: contract.slaTerms,
    });

    return newContract;
  }

  /**
   * Check for expiring contracts
   */
  static async getExpiringContracts(daysAhead: number = 30): Promise<Contract[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('enterprise_contracts')
      .select('*')
      .eq('status', 'active')
      .lte('end_date', futureDate.toISOString().split('T')[0])
      .order('end_date', { ascending: true });

    if (error) throw error;
    return data.map(this.transformContractFromDb);
  }

  /**
   * Transform database row to Contract
   */
  private static transformContractFromDb(data: any): Contract {
    return {
      id: data.id,
      accountId: data.account_id,
      contractType: data.contract_type,
      status: data.status,
      startDate: new Date(data.start_date),
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      autoRenew: data.auto_renew,
      terms: data.terms || {},
      slaTerms: data.sla_terms || {},
      signedBy: data.signed_by,
      signedAt: data.signed_at ? new Date(data.signed_at) : undefined,
      documentUrl: data.document_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export default ContractManagementService;
