import { useAuthWizard } from '@/hooks/useAuthWizard';
import { useReferralRedemption } from '@/hooks/useReferralRedemption';
import { AuthLayout } from './AuthLayout';
import { RoleStep } from './steps/RoleStep';
import { EmailStep } from './steps/EmailStep';
import { ConfirmationStep } from './steps/ConfirmationStep';

export function AuthWizard() {
  const wizard = useAuthWizard();
  // Process ?ref= query param for referral tracking + coinz rewards
  useReferralRedemption();

  const handleSwitchToLogin = () => {
    wizard.setMode('login');
  };

  const handleSwitchToSignup = () => {
    wizard.setMode('signup');
  };

  const handleBack = wizard.canGoBack ? wizard.goBack : undefined;

  return (
    <AuthLayout onBack={handleBack}>
      {wizard.step === 'role' && (
        <RoleStep
          selectedRole={wizard.selectedRole}
          onSelectRole={wizard.setSelectedRole}
          onNext={wizard.nextStep}
          onSwitchToLogin={handleSwitchToLogin}
          error={wizard.error}
        />
      )}

      {wizard.step === 'email' && (
        <EmailStep
          email={wizard.email}
          onEmailChange={wizard.setEmail}
          password={wizard.password}
          onPasswordChange={wizard.setPassword}
          onSubmit={wizard.sendMagicLink}
          onPasswordSubmit={wizard.signInWithEmail}
          loading={wizard.loading}
          error={wizard.error}
          mode={wizard.mode}
          onSwitchMode={wizard.mode === 'login' ? handleSwitchToSignup : handleSwitchToLogin}
          preselectedRole={wizard.preselectedRole}
        />
      )}

      {wizard.step === 'confirmation' && (
        <ConfirmationStep
          email={wizard.email}
          resendCooldown={wizard.resendCooldown}
          onResend={wizard.resendMagicLink}
          onChangeEmail={wizard.goBack}
          loading={wizard.loading}
        />
      )}
    </AuthLayout>
  );
}
