import { useState, useCallback } from 'react';
import { TeamManagementService, TeamMember } from '@/services/TeamManagementService';

/**
 * useTeamManagement
 * Hook for managing enterprise team members
 */
export function useTeamManagement(accountId: string) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load team members
  const loadTeamMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const members = await TeamManagementService.listTeamMembers(accountId);
      setTeamMembers(members);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load team members';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  // Invite team member
  const inviteTeamMember = useCallback(
    async (email: string, name: string, role: TeamMember['role']) => {
      setLoading(true);
      setError(null);
      try {
        const member = await TeamManagementService.inviteTeamMember(accountId, email, name, role);
        setTeamMembers((prev) => [member, ...prev]);
        return member;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to invite team member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accountId]
  );

  // Update team member
  const updateTeamMember = useCallback(
    async (memberId: string, updates: Partial<TeamMember>) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await TeamManagementService.updateTeamMember(memberId, updates);
        setTeamMembers((prev) =>
          prev.map((member) => (member.id === memberId ? updated : member))
        );
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update team member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Remove team member
  const removeTeamMember = useCallback(async (memberId: string) => {
    setLoading(true);
    setError(null);
    try {
      await TeamManagementService.removeTeamMember(memberId);
      setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove team member';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    teamMembers,
    loading,
    error,
    loadTeamMembers,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
  };
}

export default useTeamManagement;
