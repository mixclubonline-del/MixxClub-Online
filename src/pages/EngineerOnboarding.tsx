import { EngineerOnboardingWizard } from "@/components/onboarding/EngineerOnboardingWizard";
import { WelcomeGate } from "@/components/onboarding/WelcomeGate";

export default function EngineerOnboarding() {
  return (
    <WelcomeGate role="engineer">
      <EngineerOnboardingWizard />
    </WelcomeGate>
  );
}
