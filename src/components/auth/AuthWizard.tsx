import { useAuthWizard } from '@/hooks/useAuthWizard';
import { AuthLayout } from './AuthLayout';
import { RoleStep } from './steps/RoleStep';
import { EmailStep } from './steps/EmailStep';
import { ConfirmationStep } from './steps/ConfirmationStep';

export function AuthWizard() {
  const wizard = useAuthWizard();

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
          onSubmit={wizard.sendMagicLink}
          loading={wizard.loading}
          error={wizard.error}
          mode={wizard.mode}
          onSwitchMode={wizard.mode === 'login' ? handleSwitchToSignup : handleSwitchToLogin}
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
