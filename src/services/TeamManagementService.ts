import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  id: string;
  accountId: string;
  userId?: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  status: 'active' | 'suspended' | 'pending';
  permissions: string[];
  invitedBy?: string;
  invitedAt: Date;
  joinedAt?: Date;
  lastActiveAt?: Date;
}

/**
 * TeamManagementService
 * Manage enterprise team members
 */
export class TeamManagementService {
  /**
   * List team members for an account
   */
  static async listTeamMembers(accountId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('enterprise_team_members')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.transformMemberFromDb);
  }

  /**
   * Invite a team member
   */
  static async inviteTeamMember(
    accountId: string,
    email: string,
    name: string,
    role: TeamMember['role']
  ): Promise<TeamMember> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('enterprise_team_members')
      .insert({
        account_id: accountId,
        email,
        name,
        role,
        status: 'pending',
        permissions: [],
        invited_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send invitation email
    console.log('[TeamManagement] Invitation email should be sent to:', email);

    return this.transformMemberFromDb(data);
  }

  /**
   * Update team member
   */
  static async updateTeamMember(
    memberId: string,
    updates: Partial<TeamMember>
  ): Promise<TeamMember> {
    const dbUpdates: Record<string, any> = {};

    if (updates.name) dbUpdates.name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.permissions) dbUpdates.permissions = updates.permissions;

    const { data, error } = await supabase
      .from('enterprise_team_members')
      .update(dbUpdates)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return this.transformMemberFromDb(data);
  }

  /**
   * Remove team member
   */
  static async removeTeamMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('enterprise_team_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
  }

  /**
   * Get team member by email
   */
  static async getTeamMemberByEmail(
    accountId: string,
    email: string
  ): Promise<TeamMember | null> {
    const { data, error } = await supabase
      .from('enterprise_team_members')
      .select('*')
      .eq('account_id', accountId)
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.transformMemberFromDb(data);
  }

  /**
   * Transform database row to TeamMember
   */
  private static transformMemberFromDb(data: any): TeamMember {
    return {
      id: data.id,
      accountId: data.account_id,
      userId: data.user_id,
      email: data.email,
      name: data.name,
      role: data.role,
      status: data.status,
      permissions: data.permissions || [],
      invitedBy: data.invited_by,
      invitedAt: new Date(data.invited_at),
      joinedAt: data.joined_at ? new Date(data.joined_at) : undefined,
      lastActiveAt: data.last_active_at ? new Date(data.last_active_at) : undefined,
    };
  }
}

export default TeamManagementService;
