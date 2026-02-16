/**
 * Starter Features Configuration
 * Defines the 3 unlocked hub IDs per role for new users.
 * Everything not in this list is gated via FeatureGated.
 */

export type GateableRole = 'producer' | 'artist' | 'engineer' | 'fan';

export const STARTER_HUBS: Record<GateableRole, string[]> = {
  producer: ['dashboard', 'catalog', 'mastering'],
  artist:   ['dashboard', 'music', 'mastering'],
  engineer: ['dashboard', 'sessions', 'mastering'],
  fan:      ['feed', 'missions', 'day1s'],
};

/**
 * Returns true if the given hub is a starter (unlocked) hub for the role.
 * Admin users always return true (full access).
 */
export const isStarterHub = (role: string, hubId: string): boolean => {
  if (role === 'admin') return true;
  const hubs = STARTER_HUBS[role as GateableRole];
  if (!hubs) return false;
  return hubs.includes(hubId);
};
