import { useEnterpriseStore, TeamRole, MemberStatus } from '@/stores/enterpriseStore';

export function useTeamManagement(accountId: string) {
  const store = useEnterpriseStore();

  const loadTeamMembers = async () => {
    try {
      return store.getTeamMembers(accountId);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to load team members');
      return [];
    }
  };

  const inviteTeamMember = async (data: {
    email: string;
    name: string;
    role: TeamRole;
  }) => {
    try {
      const memberId = await store.addTeamMember(accountId, {
        accountId,
        email: data.email,
        name: data.name,
        role: data.role,
        status: MemberStatus.Pending,
        permissions: [],
      });
      return memberId;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to invite team member');
      return null;
    }
  };

  const updateTeamMember = async (memberId: string, updates: any) => {
    try {
      await store.updateTeamMember(accountId, memberId, updates);
      return memberId;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to update team member');
      return null;
    }
  };

  const removeTeamMember = async (memberId: string) => {
    try {
      await store.removeTeamMember(accountId, memberId);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to remove team member');
    }
  };

  const promoteTeamMember = async (memberId: string, newRole: TeamRole) => {
    try {
      await store.promoteTeamMember(accountId, memberId, newRole);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to promote team member');
    }
  };

  const disableTeamMember = async (memberId: string) => {
    try {
      await store.disableTeamMember(accountId, memberId);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to disable team member');
    }
  };

  return {
    teamMembers: store.getTeamMembers(accountId),
    loading: store.loading,
    error: store.error,
    loadTeamMembers,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
    promoteTeamMember,
    disableTeamMember,
  };
}

export default useTeamManagement;
