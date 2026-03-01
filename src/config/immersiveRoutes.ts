/**
 * Shared list of routes that require full immersive treatment —
 * no global overlays (players, status bars, consoles).
 */
export const FULL_IMMERSIVE_ROUTES = [
  '/',
  '/intro',
  '/auth',
  '/onboarding',
  '/city/gates',
  '/how-it-works',
  '/select-role',
  '/start',
  '/go',
] as const;

export function isFullImmersiveRoute(pathname: string): boolean {
  return FULL_IMMERSIVE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}
