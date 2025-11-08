import { supabase } from '@/integrations/supabase/client';
import {
  EnterpriseAccount,
  AccountStatus,
  EnterprisePackageType,
} from '@/stores/enterpriseStore';

/**
 * EnterpriseService
 * Supabase integration for enterprise account management
 */
export class EnterpriseService {
  /**
   * Create a new enterprise account
   */
  static async createAccount(
    accountData: Omit<EnterpriseAccount, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EnterpriseAccount> {
    const { data, error } = await supabase
      .from('enterprise_accounts')
      .insert({
        organization_name: accountData.organizationName,
        contact_email: accountData.contact.email,
        contact_name: accountData.contact.name,
        contact_phone: accountData.contact.phone,
        type: accountData.type,
        status: accountData.status,
        package_id: accountData.packageId,
        billing_cycle: accountData.billingInfo.billingCycle,
        mrr: accountData.billingInfo.monthlyAmount * 12,
        custom_domain: accountData.whiteLabel.customDomain,
        white_label_enabled: accountData.whiteLabel.enabled,
        sso_enabled: false,
        max_team_members: 50,
        max_storage_gb: 1000,
        max_api_calls: 1000000,
        metadata: {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformAccountFromDb(data, accountData);
  }

  /**
   * Update an existing enterprise account
   */
  static async updateAccount(
    accountId: string,
    updates: Partial<EnterpriseAccount>
  ): Promise<EnterpriseAccount> {
    const dbUpdates: Record<string, any> = {};
    
    if (updates.organizationName) dbUpdates.organization_name = updates.organizationName;
    if (updates.contact?.email) dbUpdates.contact_email = updates.contact.email;
    if (updates.contact?.name !== undefined) dbUpdates.contact_name = updates.contact.name;
    if (updates.contact?.phone !== undefined) dbUpdates.contact_phone = updates.contact.phone;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.packageId !== undefined) dbUpdates.package_id = updates.packageId;
    if (updates.billingInfo?.billingCycle !== undefined) dbUpdates.billing_cycle = updates.billingInfo.billingCycle;
    if (updates.billingInfo?.monthlyAmount !== undefined) dbUpdates.mrr = updates.billingInfo.monthlyAmount * 12;
    if (updates.whiteLabel?.customDomain !== undefined) dbUpdates.custom_domain = updates.whiteLabel.customDomain;
    if (updates.whiteLabel?.enabled !== undefined) dbUpdates.white_label_enabled = updates.whiteLabel.enabled;

    const { data, error } = await supabase
      .from('enterprise_accounts')
      .update(dbUpdates)
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw error;
    
    // Get the full account to return with all nested data
    const fullAccount = await this.getAccount(accountId);
    if (!fullAccount) throw new Error('Account not found after update');
    return fullAccount;
  }

  /**
   * Delete an enterprise account
   */
  static async deleteAccount(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('enterprise_accounts')
      .delete()
      .eq('id', accountId);

    if (error) throw error;
  }

  /**
   * Get a single enterprise account
   */
  static async getAccount(accountId: string): Promise<EnterpriseAccount | null> {
    const { data, error } = await supabase
      .from('enterprise_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.transformAccountFromDb(data, undefined);
  }

  /**
   * List enterprise accounts with optional filters
   */
  static async listAccounts(filters?: {
    status?: AccountStatus;
    type?: EnterprisePackageType;
  }): Promise<EnterpriseAccount[]> {
    let query = supabase.from('enterprise_accounts').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(row => this.transformAccountFromDb(row, undefined));
  }

  /**
   * Log an audit event
   */
  static async logAuditEvent(
    accountId: string,
    eventType: string,
    details: Record<string, any>
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('enterprise_audit_log')
      .insert({
        account_id: accountId,
        user_id: user?.id,
        event_type: eventType,
        action: eventType,
        details,
      });

    if (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging is non-critical
    }
  }

  /**
   * Get dashboard statistics for an account
   */
  static async getDashboardStats(accountId: string): Promise<{
    totalRevenue: number;
    activeUsers: number;
    totalProjects: number;
    storageUsed: number;
  }> {
    // This would integrate with other tables to get real stats
    // For now, return placeholder data
    return {
      totalRevenue: 0,
      activeUsers: 0,
      totalProjects: 0,
      storageUsed: 0,
    };
  }

  /**
   * Transform database row to EnterpriseAccount type
   */
  private static transformAccountFromDb(
    data: any, 
    originalData?: Partial<EnterpriseAccount>
  ): EnterpriseAccount {
    return {
      id: data.id,
      organizationName: data.organization_name,
      type: data.type as EnterprisePackageType,
      status: data.status as AccountStatus,
      packageId: data.package_id,
      billingInfo: originalData?.billingInfo || {
        billingCycle: data.billing_cycle,
        nextBillingDate: new Date(),
        monthlyAmount: data.mrr / 12,
        annualAmount: data.mrr,
        discountPercent: 0,
        taxRate: 0,
        billingEmail: data.contact_email,
        invoiceFormat: 'email',
        outstandingBalance: 0,
      },
      teamMembers: originalData?.teamMembers || [],
      contracts: originalData?.contracts || [],
      metrics: originalData?.metrics || [],
      customPricingRequests: originalData?.customPricingRequests || [],
      whiteLabel: {
        enabled: data.white_label_enabled,
        customDomain: data.custom_domain,
        logoUrl: originalData?.whiteLabel?.logoUrl,
        brandColor: originalData?.whiteLabel?.brandColor,
        termsUrl: originalData?.whiteLabel?.termsUrl,
        privacyUrl: originalData?.whiteLabel?.privacyUrl,
      },
      contact: {
        name: data.contact_name || '',
        email: data.contact_email,
        phone: data.contact_phone,
        title: originalData?.contact?.title || '',
      },
      notes: originalData?.notes || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      trialEndsAt: originalData?.trialEndsAt,
      cancelledAt: originalData?.cancelledAt,
    };
  }
}

export default EnterpriseService;
