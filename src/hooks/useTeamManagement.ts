import { useState, useCallback } from 'react';
import { useEnterpriseStore, TeamMember, TeamRole, MemberStatus } from '@/stores/enterpriseStore';
import { EnterpriseService } from '@/services/enterpriseService';

/**
 * useTeamManagement
 * Hook for managing enterprise team members
 */

export function useTeamManagement(accountId: string) {
  const store = useEnterpriseStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Invite team member
  const inviteTeamMember = useCallback(
    async (email: string, name: string, role: TeamRole) => {
      setLoading(true);
      setError(null);
      try {
        const memberData = {
          email,
          name,
          role,
          status: MemberStatus.Pending,
          permissions: getDefaultPermissions(role),
        };

        // Add to store
        const memberId = await store.addTeamMember(accountId, memberData);

        // Add to database
        await EnterpriseService.addTeamMember(accountId, memberData);

        // Log audit event
        await EnterpriseService.logAuditEvent(accountId, 'TEAM_MEMBER_INVITED', {
          email,
          name,
          role,
        });

        return memberId;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to invite team member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accountId, store]
  );

  // Accept team member invitation
  const acceptInvitation = useCallback(
    async (memberId: string) => {
      setLoading(true);
      setError(null);
      try {
        // Update to store
        await store.updateTeamMember(accountId, memberId, {
          status: MemberStatus.Active,
        });

        // Update database
        await EnterpriseService.updateTeamMember(memberId, {
          status: MemberStatus.Active,
        });

        // Log audit event
        await EnterpriseService.logAuditEvent(accountId, 'TEAM_MEMBER_ACCEPTED', {
          memberId,
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to accept invitation';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accountId, store]
  );

  // Change team member role
  const changeRole = useCallback(
    async (memberId: string, newRole: TeamRole) => {
      setLoading(true);
      setError(null);
      try {
        const permissions = getDefaultPermissions(newRole);

        // Update in store
        await store.promoteTeamMember(accountId, memberId, newRole);

        // Update database
        await EnterpriseService.updateTeamMember(memberId, {
          role: newRole,
          permissions,
        });

        // Log audit event
        await EnterpriseService.logAuditEvent(accountId, 'TEAM_MEMBER_ROLE_CHANGED', {
          memberId,
          newRole,
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to change role';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accountId, store]
  );

  // Suspend team member
  const suspendMember = useCallback(
    async (memberId: string, reason?: string) => {
      setLoading(true);
      setError(null);
      try {
        // Update in store
        await store.updateTeamMember(accountId, memberId, {
          status: MemberStatus.Suspended,
        });

        // Update database
        await EnterpriseService.updateTeamMember(memberId, {
          status: MemberStatus.Suspended,
        });

        // Log audit event
        await EnterpriseService.logAuditEvent(accountId, 'TEAM_MEMBER_SUSPENDED', {
          memberId,
          reason,
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to suspend member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accountId, store]
  );

  // Reactivate team member
  const reactivateMember = useCallback(
    async (memberId: string) => {
      setLoading(true);
      setError(null);
      try {
        // Update in store
        await store.updateTeamMember(accountId, memberId, {
          status: MemberStatus.Active,
        });

        // Update database
        await EnterpriseService.updateTeamMember(memberId, {
          status: MemberStatus.Active,
        });

        // Log audit event
        await EnterpriseService.logAuditEvent(accountId, 'TEAM_MEMBER_REACTIVATED', {
          memberId,
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reactivate member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accountId, store]
  );

  // Remove team member
  const removeMember = useCallback(
    async (memberId: string) => {
      setLoading(true);
      setError(null);
      try {
        // Remove from store
        await store.removeTeamMember(accountId, memberId);

        // Remove from database
        await EnterpriseService.removeTeamMember(memberId);

        // Log audit event
        await EnterpriseService.logAuditEvent(accountId, 'TEAM_MEMBER_REMOVED', {
          memberId,
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accountId, store]
  );

  // Load team members
  const loadTeamMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const members = await EnterpriseService.getTeamMembers(accountId);
      return members;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load team members';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  // Get team members from store
  const teamMembers = store.getTeamMembers(accountId);

  return {
    // State
    teamMembers,
    loading,
    error,

    // Actions
    inviteTeamMember,
    acceptInvitation,
    changeRole,
    suspendMember,
    reactivateMember,
    removeMember,
    loadTeamMembers,
  };
}

// Helper function to get default permissions for a role
function getDefaultPermissions(role: TeamRole): string[] {
  switch (role) {
    case TeamRole.Owner:
      return [
        'read:all',
        'write:all',
        'delete:all',
        'manage:team',
        'manage:billing',
        'manage:contracts',
        'view:analytics',
      ];
    case TeamRole.Admin:
      return [
        'read:all',
        'write:all',
        'delete:content',
        'manage:team',
        'manage:contracts',
        'view:analytics',
      ];
    case TeamRole.Manager:
      return [
        'read:all',
        'write:all',
        'manage:contracts',
        'view:analytics',
      ];
    case TeamRole.Member:
      return [
        'read:all',
        'write:own',
        'view:analytics',
      ];
    default:
      return [];
  }
}

export default useTeamManagement;
