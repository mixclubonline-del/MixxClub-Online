import { useEffect, useMemo, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressIndicator, type ProgressStep } from '@/components/ui/progress-indicator';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import {
  Wallet,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  RefreshCw,
  ExternalLink,
  Banknote,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const StripeConnectWizard = () => {
  const {
    status,
    isLoading,
    isOnboarding,
    startOnboarding,
    refreshStatus,
    canReceivePayouts,
    isConnected,
    needsSetup,
    hasRequirements,
  } = useStripeConnect();

  const [isPolling, setIsPolling] = useState(false);

  // Determine current wizard step from live status
  const currentStep = useMemo(() => {
    if (!isConnected) return 0;
    if (!status.detailsSubmitted) return 1;
    if (!canReceivePayouts) return 2;
    return 3;
  }, [isConnected, status.detailsSubmitted, canReceivePayouts]);

  // Auto-poll verification status when on step 2
  useEffect(() => {
    if (currentStep !== 2) return;
    const interval = setInterval(() => {
      refreshStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, [currentStep, refreshStatus]);

  const handleRefresh = useCallback(() => {
    setIsPolling(true);
    refreshStatus();
    setTimeout(() => setIsPolling(false), 2000);
  }, [refreshStatus]);

  // Build step definitions with live status
  const steps: ProgressStep[] = useMemo(() => {
    const stepStatus = (index: number): ProgressStep['status'] => {
      if (index < currentStep) return 'completed';
      if (index === currentStep) return 'active';
      return 'pending';
    };

    return [
      {
        id: 'welcome',
        label: 'Get Started',
        status: stepStatus(0),
        description: currentStep > 0 ? 'Ready to connect' : 'Learn about payouts & revenue share',
      },
      {
        id: 'setup',
        label: 'Bank Account Setup',
        status: stepStatus(1),
        description: currentStep > 1
          ? 'Account created'
          : currentStep === 1
            ? 'Complete your Stripe onboarding'
            : 'Connect via Stripe',
      },
      {
        id: 'verification',
        label: 'Verification',
        status: status.details.status === 'restricted' ? 'error' : stepStatus(2),
        description: currentStep > 2
          ? 'Verified'
          : currentStep === 2
            ? status.requirements.pending_verification.length > 0
              ? 'Stripe is reviewing your info...'
              : `${status.requirements.currently_due.length} item${status.requirements.currently_due.length !== 1 ? 's' : ''} remaining`
            : 'Identity & bank verification',
      },
      {
        id: 'complete',
        label: 'Payouts Active',
        status: stepStatus(3),
        description: canReceivePayouts
          ? `Bank ****${status.details.bankLast4 || '****'} · Weekly transfers`
          : 'Start earning from your sessions',
      },
    ];
  }, [currentStep, status, canReceivePayouts]);

  const progress = useMemo(() => {
    if (currentStep >= 3) return 100;
    return Math.round(((currentStep) / 3) * 100);
  }, [currentStep]);

  if (isLoading) {
    return (
      <Card variant="glass">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" hover="glow" className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Payout Setup</CardTitle>
              <CardDescription>
                {canReceivePayouts
                  ? 'Your payouts are fully configured'
                  : 'Connect your bank account to receive earnings'}
              </CardDescription>
            </div>
          </div>
          {canReceivePayouts && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <ProgressIndicator steps={steps} currentStep={currentStep} progress={progress} />

        {/* Step Content Panels */}
        {currentStep === 0 && <WelcomePanel onStart={startOnboarding} isOnboarding={isOnboarding} />}
        {currentStep === 1 && <SetupPanel onContinue={startOnboarding} isOnboarding={isOnboarding} />}
        {currentStep === 2 && (
          <VerificationPanel
            status={status}
            onRefresh={handleRefresh}
            onContinue={startOnboarding}
            isPolling={isPolling}
            isOnboarding={isOnboarding}
          />
        )}
        {currentStep === 3 && <CompletePanel status={status} />}
      </CardContent>
    </Card>
  );
};

/* ─── Step 0: Welcome ────────────────────────────────────────── */
const WelcomePanel = ({
  onStart,
  isOnboarding,
}: {
  onStart: () => void;
  isOnboarding: boolean;
}) => (
  <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
    <h3 className="text-lg font-semibold">Why connect your bank account?</h3>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <BenefitItem
        icon={<Banknote className="w-5 h-5 text-green-400" />}
        title="70% Revenue Share"
        description="Keep the majority of every project payment you earn"
      />
      <BenefitItem
        icon={<Clock className="w-5 h-5 text-blue-400" />}
        title="Weekly Payouts"
        description="Automatic transfers every week — no manual requests"
      />
      <BenefitItem
        icon={<ShieldCheck className="w-5 h-5 text-primary" />}
        title="Secure & Protected"
        description="Bank-grade encryption via Stripe's verified platform"
      />
    </div>
    <Button onClick={onStart} disabled={isOnboarding} size="lg" className="w-full mt-2">
      {isOnboarding ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Preparing setup...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Connect Bank Account
          <ArrowRight className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  </div>
);

/* ─── Step 1: Setup ──────────────────────────────────────────── */
const SetupPanel = ({
  onContinue,
  isOnboarding,
}: {
  onContinue: () => void;
  isOnboarding: boolean;
}) => (
  <div className="space-y-4 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="font-semibold text-yellow-400">Complete Your Stripe Onboarding</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You'll be redirected to Stripe's secure portal to provide your identity, business details,
          and bank account information. This typically takes 3–5 minutes.
        </p>
      </div>
    </div>
    <Button
      onClick={onContinue}
      disabled={isOnboarding}
      size="lg"
      className="w-full bg-yellow-600 hover:bg-yellow-700 text-primary-foreground"
    >
      {isOnboarding ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Redirecting to Stripe...
        </>
      ) : (
        <>
          Continue Setup on Stripe
          <ExternalLink className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  </div>
);

/* ─── Step 2: Verification ───────────────────────────────────── */
const VerificationPanel = ({
  status,
  onRefresh,
  onContinue,
  isPolling,
  isOnboarding,
}: {
  status: ReturnType<typeof useStripeConnect>['status'];
  onRefresh: () => void;
  onContinue: () => void;
  isPolling: boolean;
  isOnboarding: boolean;
}) => {
  const hasPending = status.requirements.pending_verification.length > 0;
  const hasDue = status.requirements.currently_due.length > 0;

  return (
    <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
      {hasPending && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-400">Verification in progress</p>
            <p className="text-sm text-muted-foreground mt-1">
              Stripe is reviewing your submitted information. This can take a few minutes to a
              couple of business days.
            </p>
          </div>
        </div>
      )}

      {hasDue && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Items still needed:</p>
          <ul className="space-y-1.5">
            {status.requirements.currently_due.map((req, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-foreground p-2 rounded-md bg-muted/30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                {req.replace(/_/g, ' ').replace(/\./g, ' → ')}
              </li>
            ))}
          </ul>
          <Button
            onClick={onContinue}
            disabled={isOnboarding}
            className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700 text-primary-foreground"
          >
            {isOnboarding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening Stripe...
              </>
            ) : (
              <>
                Complete Remaining Items
                <ExternalLink className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}

      {!hasDue && !hasPending && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-primary">Almost there</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your details have been submitted. Stripe is finalizing your account activation.
            </p>
          </div>
        </div>
      )}

      <Button variant="outline" onClick={onRefresh} disabled={isPolling} className="w-full">
        <RefreshCw className={`w-4 h-4 mr-2 ${isPolling ? 'animate-spin' : ''}`} />
        {isPolling ? 'Checking status...' : 'Refresh Verification Status'}
      </Button>
    </div>
  );
};

/* ─── Step 3: Complete ───────────────────────────────────────── */
const CompletePanel = ({
  status,
}: {
  status: ReturnType<typeof useStripeConnect>['status'];
}) => (
  <div className="space-y-4 p-4 rounded-lg border border-green-500/30 bg-green-500/5">
    <div className="flex items-center gap-3">
      <CheckCircle2 className="w-8 h-8 text-green-400" />
      <div>
        <h3 className="text-lg font-semibold text-green-400">Payouts Fully Enabled</h3>
        <p className="text-sm text-muted-foreground">
          {status.details.bankLast4
            ? `Bank account ending in ****${status.details.bankLast4} is connected`
            : 'Your bank account is connected and ready to receive payouts'}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 rounded-lg bg-green-500/10 text-center">
        <p className="text-xs text-muted-foreground">Charges</p>
        <p className="font-semibold text-green-400">
          {status.chargesEnabled ? 'Enabled' : 'Pending'}
        </p>
      </div>
      <div className="p-3 rounded-lg bg-green-500/10 text-center">
        <p className="text-xs text-muted-foreground">Payouts</p>
        <p className="font-semibold text-green-400">
          {status.payoutsEnabled ? 'Enabled' : 'Pending'}
        </p>
      </div>
    </div>

    <p className="text-xs text-muted-foreground text-center">
      Earnings are automatically transferred to your bank account every week.
    </p>
  </div>
);

/* ─── Shared sub-component ───────────────────────────────────── */
const BenefitItem = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-card/60 border border-border/50">
    {icon}
    <p className="font-medium text-sm">{title}</p>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);
