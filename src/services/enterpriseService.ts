import { supabase } from '@/lib/supabase';
import {
  EnterpriseAccount,
  TeamMember,
  Contract,
  EnterpriseMetrics,
  CustomPricingRequest,
  EnterprisePackageType,
  AccountStatus,
  TeamRole,
  BillingCycle,
} from '@/stores/enterpriseStore';

/**
 * Enterprise Service
 * Supabase integration for enterprise account management
 * Handles database operations for accounts, teams, contracts, and billing
 */

export class EnterpriseService {
  /**
   * ACCOUNT MANAGEMENT
   */

  // Create a new enterprise account
  static async createAccount(account: Omit<EnterpriseAccount, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('enterprise_accounts')
      .insert([account])
      .select()
      .single();

    if (error) throw new Error(`Failed to create account: ${error.message}`);
    return data;
  }

  // Update enterprise account
  static async updateAccount(accountId: string, updates: Partial<EnterpriseAccount>) {
    const { data, error } = await supabase
      .from('enterprise_accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update account: ${error.message}`);
    return data;
  }

  // Get enterprise account by ID
  static async getAccount(accountId: string) {
    const { data, error } = await supabase
      .from('enterprise_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) throw new Error(`Failed to fetch account: ${error.message}`);
    return data;
  }

  // List all enterprise accounts
  static async listAccounts(filters?: { status?: AccountStatus; type?: EnterprisePackageType }) {
    let query = supabase.from('enterprise_accounts').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to list accounts: ${error.message}`);
    return data || [];
  }

  // Delete enterprise account
  static async deleteAccount(accountId: string) {
    const { error } = await supabase.from('enterprise_accounts').delete().eq('id', accountId);

    if (error) throw new Error(`Failed to delete account: ${error.message}`);
  }

  /**
   * TEAM MANAGEMENT
   */

  // Add team member to enterprise
  static async addTeamMember(accountId: string, member: Omit<TeamMember, 'id' | 'joinedAt' | 'lastActiveAt'>) {
    const teamMember = {
      ...member,
      account_id: accountId,
      joined_at: new Date(),
      last_active_at: new Date(),
    };

    const { data, error } = await supabase
      .from('enterprise_team_members')
      .insert([teamMember])
      .select()
      .single();

    if (error) throw new Error(`Failed to add team member: ${error.message}`);
    return data;
  }

  // Update team member
  static async updateTeamMember(memberId: string, updates: Partial<TeamMember>) {
    const { data, error } = await supabase
      .from('enterprise_team_members')
      .update({ ...updates, last_active_at: new Date() })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update team member: ${error.message}`);
    return data;
  }

  // Get team members for account
  static async getTeamMembers(accountId: string) {
    const { data, error } = await supabase
      .from('enterprise_team_members')
      .select('*')
      .eq('account_id', accountId);

    if (error) throw new Error(`Failed to fetch team members: ${error.message}`);
    return data || [];
  }

  // Remove team member
  static async removeTeamMember(memberId: string) {
    const { error } = await supabase.from('enterprise_team_members').delete().eq('id', memberId);

    if (error) throw new Error(`Failed to remove team member: ${error.message}`);
  }

  /**
   * CONTRACT MANAGEMENT
   */

  // Create contract
  static async createContract(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('enterprise_contracts')
      .insert([contract])
      .select()
      .single();

    if (error) throw new Error(`Failed to create contract: ${error.message}`);
    return data;
  }

  // Update contract
  static async updateContract(contractId: string, updates: Partial<Contract>) {
    const { data, error } = await supabase
      .from('enterprise_contracts')
      .update(updates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update contract: ${error.message}`);
    return data;
  }

  // Get contracts for account
  static async getContracts(accountId: string) {
    const { data, error } = await supabase
      .from('enterprise_contracts')
      .select('*')
      .eq('account_id', accountId);

    if (error) throw new Error(`Failed to fetch contracts: ${error.message}`);
    return data || [];
  }

  // Get active contracts
  static async getActiveContracts(accountId: string) {
    const { data, error } = await supabase
      .from('enterprise_contracts')
      .select('*')
      .eq('account_id', accountId)
      .eq('status', 'active');

    if (error) throw new Error(`Failed to fetch active contracts: ${error.message}`);
    return data || [];
  }

  /**
   * METRICS & ANALYTICS
   */

  // Record metrics for account
  static async recordMetrics(accountId: string, metrics: Omit<EnterpriseMetrics, 'id' | 'recordedAt'>) {
    const { data, error } = await supabase
      .from('enterprise_metrics')
      .insert([{ ...metrics, account_id: accountId, recorded_at: new Date() }])
      .select()
      .single();

    if (error) throw new Error(`Failed to record metrics: ${error.message}`);
    return data;
  }

  // Get metrics for account
  static async getMetrics(accountId: string, month?: string) {
    let query = supabase.from('enterprise_metrics').select('*').eq('account_id', accountId);

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch metrics: ${error.message}`);
    return data || [];
  }

  // Get latest metrics for account
  static async getLatestMetrics(accountId: string) {
    const { data, error } = await supabase
      .from('enterprise_metrics')
      .select('*')
      .eq('account_id', accountId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  // Get monthly revenue
  static async getMonthlyRevenue(accountId: string, month: string) {
    const { data, error } = await supabase
      .from('enterprise_metrics')
      .select('revenu_generated')
      .eq('account_id', accountId)
      .eq('month', month)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.revenu_generated || 0;
  }

  /**
   * CUSTOM PRICING REQUESTS
   */

  // Create pricing request
  static async createPricingRequest(request: Omit<CustomPricingRequest, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('enterprise_pricing_requests')
      .insert([request])
      .select()
      .single();

    if (error) throw new Error(`Failed to create pricing request: ${error.message}`);
    return data;
  }

  // Update pricing request
  static async updatePricingRequest(requestId: string, updates: Partial<CustomPricingRequest>) {
    const { data, error } = await supabase
      .from('enterprise_pricing_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update pricing request: ${error.message}`);
    return data;
  }

  // Get pricing request
  static async getPricingRequest(requestId: string) {
    const { data, error } = await supabase
      .from('enterprise_pricing_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  // Get pending pricing requests for account
  static async getPendingPricingRequests(accountId: string) {
    const { data, error } = await supabase
      .from('enterprise_pricing_requests')
      .select('*')
      .eq('account_id', accountId)
      .eq('status', 'pending');

    if (error) throw new Error(`Failed to fetch pricing requests: ${error.message}`);
    return data || [];
  }

  /**
   * BILLING & PAYMENTS
   */

  // Record payment
  static async recordPayment(accountId: string, amount: number, paymentDate: Date) {
    const { data, error } = await supabase
      .from('enterprise_payments')
      .insert([
        {
          account_id: accountId,
          amount,
          payment_date: paymentDate,
          status: 'completed',
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to record payment: ${error.message}`);
    return data;
  }

  // Get payment history
  static async getPaymentHistory(accountId: string, limit: number = 12) {
    const { data, error } = await supabase
      .from('enterprise_payments')
      .select('*')
      .eq('account_id', accountId)
      .order('payment_date', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch payment history: ${error.message}`);
    return data || [];
  }

  // Get outstanding balance
  static async getOutstandingBalance(accountId: string) {
    const { data, error } = await supabase
      .from('enterprise_accounts')
      .select('billing_info')
      .eq('id', accountId)
      .single();

    if (error) throw new Error(`Failed to fetch balance: ${error.message}`);
    return data?.billing_info?.outstandingBalance || 0;
  }

  /**
   * ANALYTICS & REPORTING
   */

  // Get enterprise dashboard stats
  static async getDashboardStats(accountId: string) {
    try {
      const [account, teamMembers, contracts, latestMetrics] = await Promise.all([
        this.getAccount(accountId),
        this.getTeamMembers(accountId),
        this.getContracts(accountId),
        this.getLatestMetrics(accountId),
      ]);

      return {
        account,
        teamCount: teamMembers.length,
        activeContracts: contracts.filter((c) => c.status === 'active').length,
        totalContracts: contracts.length,
        metrics: latestMetrics,
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get usage trends
  static async getUsageTrends(accountId: string, months: number = 12) {
    const { data, error } = await supabase
      .from('enterprise_metrics')
      .select('month,storage_used_gb,api_calls_used,active_users')
      .eq('account_id', accountId)
      .order('month', { ascending: false })
      .limit(months);

    if (error) throw new Error(`Failed to fetch usage trends: ${error.message}`);
    return data || [];
  }

  /**
   * WHITE-LABEL CONFIGURATION
   */

  // Update white-label branding
  static async updateWhiteLabel(
    accountId: string,
    config: {
      logoUrl?: string;
      brandColor?: string;
      customDomain?: string;
      termsUrl?: string;
      privacyUrl?: string;
    }
  ) {
    const { data, error } = await supabase
      .from('enterprise_accounts')
      .update({
        white_label: config,
      })
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update white-label config: ${error.message}`);
    return data;
  }

  /**
   * SUPPORT & NOTIFICATIONS
   */

  // Create support ticket
  static async createSupportTicket(accountId: string, subject: string, description: string, priority: 'low' | 'medium' | 'high' | 'urgent') {
    const { data, error } = await supabase
      .from('enterprise_support_tickets')
      .insert([
        {
          account_id: accountId,
          subject,
          description,
          priority,
          status: 'open',
          created_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to create support ticket: ${error.message}`);
    return data;
  }

  // Get support tickets
  static async getSupportTickets(accountId: string, status?: string) {
    let query = supabase.from('enterprise_support_tickets').select('*').eq('account_id', accountId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch support tickets: ${error.message}`);
    return data || [];
  }

  /**
   * AUDIT LOG
   */

  // Log account action for audit trail
  static async logAuditEvent(
    accountId: string,
    action: string,
    details: Record<string, unknown>,
    userId?: string
  ) {
    const { error } = await supabase.from('enterprise_audit_log').insert([
      {
        account_id: accountId,
        action,
        details,
        user_id: userId,
        timestamp: new Date(),
      },
    ]);

    if (error) throw new Error(`Failed to log audit event: ${error.message}`);
  }

  // Get audit log for account
  static async getAuditLog(accountId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('enterprise_audit_log')
      .select('*')
      .eq('account_id', accountId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch audit log: ${error.message}`);
    return data || [];
  }
}

export default EnterpriseService;
