/**
 * UsageLimitBanner — Unit tests covering all severity thresholds,
 * variant rendering, visibility rules, and upgrade CTA behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UsageLimitBanner } from './UsageLimitBanner';

// ── Mocks ──────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

let mockTier = 'free';
let mockUsageData: Record<string, { current: number; limit: number; isUnlimited: boolean; percentage: number; remaining: number; limitReached: boolean }> = {};

vi.mock('@/hooks/useUsageEnforcement', () => ({
  useUsageEnforcement: () => ({
    tier: mockTier,
    getFeatureUsage: (feature: string) => mockUsageData[feature] || {
      current: 0, limit: 10, isUnlimited: false, percentage: 0, remaining: 10, limitReached: false,
    },
  }),
}));

// Framer motion: render children immediately without animation
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, transition, whileHover, whileTap, ...domProps } = props;
      return <div {...domProps}>{children}</div>;
    },
  },
}));

// ── Helpers ─────────────────────────────────────────────────────────

function setUsage(feature: string, current: number, limit: number) {
  const percentage = Math.min((current / limit) * 100, 100);
  mockUsageData[feature] = {
    current,
    limit,
    isUnlimited: false,
    percentage,
    remaining: Math.max(limit - current, 0),
    limitReached: current >= limit,
  };
}

function setUnlimited(feature: string) {
  mockUsageData[feature] = {
    current: 5,
    limit: Infinity,
    isUnlimited: true,
    percentage: 0,
    remaining: Infinity,
    limitReached: false,
  };
}

beforeEach(() => {
  mockTier = 'free';
  mockUsageData = {};
  mockNavigate.mockClear();
});

// ── Tests ───────────────────────────────────────────────────────────

describe('UsageLimitBanner', () => {
  // ── Visibility rules ──

  describe('visibility', () => {
    it('renders nothing for unlimited features', () => {
      setUnlimited('projects');
      const { container } = render(<UsageLimitBanner feature="projects" showAlways />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when usage < 70% and showAlways=false', () => {
      setUsage('projects', 2, 10); // 20%
      const { container } = render(<UsageLimitBanner feature="projects" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders when usage < 70% and showAlways=true', () => {
      setUsage('projects', 2, 10); // 20%
      render(<UsageLimitBanner feature="projects" showAlways />);
      expect(screen.getByText(/2 of 10 projects used/i)).toBeInTheDocument();
    });
  });

  // ── Severity thresholds (banner variant) ──

  describe('severity thresholds — banner', () => {
    it('shows normal state (no severity message) below 70%', () => {
      setUsage('projects', 5, 10); // 50%
      render(<UsageLimitBanner feature="projects" variant="banner" showAlways />);
      expect(screen.getByText(/5 of 10 projects used/i)).toBeInTheDocument();
      expect(screen.queryByText('Approaching limit')).not.toBeInTheDocument();
      expect(screen.queryByText('Upgrade')).not.toBeInTheDocument();
    });

    it('shows warning state at 70-89%', () => {
      setUsage('audio_uploads', 8, 10); // 80%
      render(<UsageLimitBanner feature="audio_uploads" variant="banner" showAlways />);
      expect(screen.getByText('Approaching limit')).toBeInTheDocument();
      expect(screen.getByText(/8 of 10 audio uploads used/i)).toBeInTheDocument();
      expect(screen.getByText('Upgrade')).toBeInTheDocument();
    });

    it('shows urgent state at 90-99%', () => {
      setUsage('ai_matching', 9, 10); // 90%
      render(<UsageLimitBanner feature="ai_matching" variant="banner" showAlways />);
      expect(screen.getByText('Almost at limit')).toBeInTheDocument();
      expect(screen.getByText(/9 of 10 ai matching used/i)).toBeInTheDocument();
      expect(screen.getByText('Upgrade')).toBeInTheDocument();
    });

    it('shows blocked state at 100%', () => {
      setUsage('projects', 10, 10); // 100%
      render(<UsageLimitBanner feature="projects" variant="banner" showAlways />);
      expect(screen.getByText('Limit reached')).toBeInTheDocument();
      expect(screen.getByText(/You've used all 10 projects/i)).toBeInTheDocument();
      expect(screen.getByText('Upgrade')).toBeInTheDocument();
    });

    it('shows blocked state when current exceeds limit', () => {
      setUsage('projects', 12, 10); // 120%
      render(<UsageLimitBanner feature="projects" variant="banner" showAlways />);
      expect(screen.getByText('Limit reached')).toBeInTheDocument();
    });
  });

  // ── Inline variant ──

  describe('inline variant', () => {
    it('renders compact usage info', () => {
      setUsage('audio_uploads', 7, 10); // 70%
      render(<UsageLimitBanner feature="audio_uploads" variant="inline" showAlways />);
      expect(screen.getByText('7/10 audio uploads used')).toBeInTheDocument();
      expect(screen.getByText('3 remaining')).toBeInTheDocument();
    });

    it('shows severity message inline at 90%+', () => {
      setUsage('ai_matching', 9, 10);
      render(<UsageLimitBanner feature="ai_matching" variant="inline" showAlways />);
      expect(screen.getByText('Almost at limit')).toBeInTheDocument();
    });

    it('shows blocked message inline at 100%', () => {
      setUsage('projects', 3, 3);
      render(<UsageLimitBanner feature="projects" variant="inline" showAlways />);
      expect(screen.getByText('Limit reached')).toBeInTheDocument();
      expect(screen.getByText('3/3 projects used')).toBeInTheDocument();
      expect(screen.getByText('0 remaining')).toBeInTheDocument();
    });
  });

  // ── Tier badge ──

  describe('tier badge', () => {
    it('shows current tier in banner variant', () => {
      mockTier = 'starter';
      setUsage('projects', 12, 15); // 80%
      render(<UsageLimitBanner feature="projects" variant="banner" showAlways />);
      expect(screen.getByText('starter plan')).toBeInTheDocument();
    });

    it('shows pro tier', () => {
      mockTier = 'pro';
      setUsage('ai_matching', 45, 50); // 90%
      render(<UsageLimitBanner feature="ai_matching" variant="banner" showAlways />);
      expect(screen.getByText('pro plan')).toBeInTheDocument();
    });
  });

  // ── Upgrade CTA ──

  describe('upgrade CTA', () => {
    it('navigates to pricing with feature param', () => {
      setUsage('projects', 10, 10);
      render(<UsageLimitBanner feature="projects" variant="banner" showAlways />);
      fireEvent.click(screen.getByText('Upgrade'));
      expect(mockNavigate).toHaveBeenCalledWith('/pricing?feature=projects');
    });

    it('calls onUpgradeClick callback', () => {
      const onUpgrade = vi.fn();
      setUsage('audio_uploads', 10, 10);
      render(<UsageLimitBanner feature="audio_uploads" variant="banner" showAlways onUpgradeClick={onUpgrade} />);
      fireEvent.click(screen.getByText('Upgrade'));
      expect(onUpgrade).toHaveBeenCalledOnce();
      expect(mockNavigate).toHaveBeenCalledWith('/pricing?feature=audio_uploads');
    });
  });

  // ── Custom label ──

  describe('custom label', () => {
    it('uses custom label override', () => {
      setUsage('storage_mb', 400, 500); // 80%
      render(<UsageLimitBanner feature="storage_mb" label="Storage (MB)" variant="banner" showAlways />);
      expect(screen.getByText(/400 of 500 storage \(mb\) used/i)).toBeInTheDocument();
    });
  });

  // ── Feature-specific scenarios ──

  describe('feature-specific: projects', () => {
    it('free tier: blocked at 3/3', () => {
      mockTier = 'free';
      setUsage('projects', 3, 3);
      render(<UsageLimitBanner feature="projects" variant="banner" showAlways />);
      expect(screen.getByText('Limit reached')).toBeInTheDocument();
      expect(screen.getByText('free plan')).toBeInTheDocument();
    });
  });

  describe('feature-specific: audio_uploads', () => {
    it('free tier: warning at 8/10', () => {
      mockTier = 'free';
      setUsage('audio_uploads', 8, 10);
      render(<UsageLimitBanner feature="audio_uploads" variant="banner" showAlways />);
      expect(screen.getByText('Approaching limit')).toBeInTheDocument();
    });
  });

  describe('feature-specific: ai_matching', () => {
    it('free tier: blocked at 2/2', () => {
      mockTier = 'free';
      setUsage('ai_matching', 2, 2);
      render(<UsageLimitBanner feature="ai_matching" variant="banner" showAlways />);
      expect(screen.getByText('Limit reached')).toBeInTheDocument();
      expect(screen.getByText(/You've used all 2 ai matching/i)).toBeInTheDocument();
    });

    it('starter tier: urgent at 9/10', () => {
      mockTier = 'starter';
      setUsage('ai_matching', 9, 10);
      render(<UsageLimitBanner feature="ai_matching" variant="banner" showAlways />);
      expect(screen.getByText('Almost at limit')).toBeInTheDocument();
    });
  });

  // ── Edge-case stress tests ──────────────────────────────────────────

  describe('edge cases', () => {
    it('zero limit (0/0) shows blocked state', () => {
      setUsage('projects', 0, 0);
      // 0/0 → percentage capped at 100 via NaN guard, limitReached = true
      mockUsageData['projects']!.percentage = 100;
      mockUsageData['projects']!.limitReached = true;
      render(<UsageLimitBanner feature="projects" variant="banner" showAlways />);
      expect(screen.getByText('Limit reached')).toBeInTheDocument();
    });

    it('exact 70% boundary triggers warning', () => {
      setUsage('projects', 7, 10); // exactly 70%
      render(<UsageLimitBanner feature="projects" variant="banner" showAlways />);
      expect(screen.getByText('Approaching limit')).toBeInTheDocument();
      expect(screen.getByText('Upgrade')).toBeInTheDocument();
    });

    it('exact 90% boundary triggers urgent', () => {
      setUsage('projects', 9, 10); // exactly 90%
      render(<UsageLimitBanner feature="projects" variant="banner" showAlways />);
      expect(screen.getByText('Almost at limit')).toBeInTheDocument();
      expect(screen.getByText('Upgrade')).toBeInTheDocument();
    });

    it('unknown feature key renders gracefully', () => {
      setUsage('unknown_feature_x', 5, 10);
      render(<UsageLimitBanner feature="unknown_feature_x" variant="banner" showAlways />);
      expect(screen.getByText(/5 of 10 unknown feature x used/i)).toBeInTheDocument();
    });

    it('renders multiple banners independently', () => {
      setUsage('projects', 3, 3);       // blocked
      setUsage('audio_uploads', 8, 10); // warning
      setUsage('ai_matching', 1, 10);   // normal

      const { container } = render(
        <div>
          <UsageLimitBanner feature="projects" variant="banner" showAlways />
          <UsageLimitBanner feature="audio_uploads" variant="banner" showAlways />
          <UsageLimitBanner feature="ai_matching" variant="banner" showAlways />
        </div>
      );

      expect(screen.getByText('Limit reached')).toBeInTheDocument();
      expect(screen.getByText('Approaching limit')).toBeInTheDocument();
      expect(screen.getByText(/1 of 10 ai matching used/i)).toBeInTheDocument();
    });
  });
});
