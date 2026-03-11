/**
 * Integration-level tests for useUsageEnforcement hook.
 *
 * Verifies tier fallback, canUseFeature gating, getFeatureUsage
 * calculations, and overallUsage aggregation using controlled
 * Supabase mocks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Mocks ──────────────────────────────────────────────────────────

let mockUser: { id: string } | null = { id: 'test-user-123' };
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

let mockCurrentPlan: { tier: string } | null = null;
let mockSubLoading = false;
vi.mock('@/hooks/useSubscriptionManagement', () => ({
  useSubscriptionManagement: () => ({
    currentPlan: mockCurrentPlan,
    loading: mockSubLoading,
  }),
}));

const mockCounts: Record<string, number> = { projects: 0, audio_uploads: 0, ai_matching: 0 };

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => ({
      select: (_sel: string, opts?: { count?: string; head?: boolean }) => ({
        eq: (_col: string, _val: string) => {
          const key =
            table === 'projects' ? 'projects' :
            table === 'audio_files' ? 'audio_uploads' :
            table === 'ai_collaboration_matches' ? 'ai_matching' : table;
          return Promise.resolve({ count: mockCounts[key] || 0, error: null });
        },
      }),
    }),
  },
}));

// ── Wrapper ─────────────────────────────────────────────────────────

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

// ── Tests ───────────────────────────────────────────────────────────

// Dynamic import so mocks are registered first
const importHook = async () => {
  const mod = await import('../useUsageEnforcement');
  return mod.useUsageEnforcement;
};

beforeEach(() => {
  mockUser = { id: 'test-user-123' };
  mockCurrentPlan = null;
  mockSubLoading = false;
  mockCounts.projects = 0;
  mockCounts.audio_uploads = 0;
  mockCounts.ai_matching = 0;
});

describe('useUsageEnforcement', () => {
  it('defaults to free tier when no subscription exists', async () => {
    const useUsageEnforcement = await importHook();
    const { result } = renderHook(() => useUsageEnforcement(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tier).toBe('free');
    expect(result.current.limits.projects).toBe(3);
  });

  it('uses correct limits for starter tier', async () => {
    mockCurrentPlan = { tier: 'starter' };
    const useUsageEnforcement = await importHook();
    const { result } = renderHook(() => useUsageEnforcement(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tier).toBe('starter');
    expect(result.current.limits.projects).toBe(15);
    expect(result.current.limits.audio_uploads).toBe(50);
  });

  it('canUseFeature returns false when at limit', async () => {
    mockCounts.projects = 3; // free limit is 3
    const useUsageEnforcement = await importHook();
    const { result } = renderHook(() => useUsageEnforcement(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canUseFeature('projects')).toBe(false);
  });

  it('canUseFeature returns true when under limit', async () => {
    mockCounts.projects = 2;
    const useUsageEnforcement = await importHook();
    const { result } = renderHook(() => useUsageEnforcement(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canUseFeature('projects')).toBe(true);
  });

  it('canUseFeature returns true for unlimited (studio tier)', async () => {
    mockCurrentPlan = { tier: 'studio' };
    mockCounts.projects = 999;
    const useUsageEnforcement = await importHook();
    const { result } = renderHook(() => useUsageEnforcement(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canUseFeature('projects')).toBe(true);
  });

  it('getFeatureUsage returns correct percentage and remaining', async () => {
    mockCounts.audio_uploads = 7; // free limit is 10
    const useUsageEnforcement = await importHook();
    const { result } = renderHook(() => useUsageEnforcement(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    const usage = result.current.getFeatureUsage('audio_uploads');
    expect(usage.current).toBe(7);
    expect(usage.limit).toBe(10);
    expect(usage.percentage).toBe(70);
    expect(usage.remaining).toBe(3);
    expect(usage.limitReached).toBe(false);
    expect(usage.isUnlimited).toBe(false);
  });

  it('getFeatureUsage reports limitReached at boundary', async () => {
    mockCounts.ai_matching = 2; // free limit is 2
    const useUsageEnforcement = await importHook();
    const { result } = renderHook(() => useUsageEnforcement(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    const usage = result.current.getFeatureUsage('ai_matching');
    expect(usage.limitReached).toBe(true);
    expect(usage.remaining).toBe(0);
    expect(usage.percentage).toBe(100);
  });

  it('overallUsage detects any limit reached', async () => {
    mockCounts.projects = 3; // at limit
    mockCounts.audio_uploads = 1; // under limit
    const useUsageEnforcement = await importHook();
    const { result } = renderHook(() => useUsageEnforcement(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.overallUsage.anyLimitReached).toBe(true);
  });

  it('canUseFeature returns true for unknown features', async () => {
    const useUsageEnforcement = await importHook();
    const { result } = renderHook(() => useUsageEnforcement(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canUseFeature('nonexistent_feature')).toBe(true);
  });
});
