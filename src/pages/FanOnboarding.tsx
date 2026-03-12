import { FanOnboardingWizard } from "@/components/onboarding/FanOnboardingWizard";
import { WelcomeGate } from "@/components/onboarding/WelcomeGate";

export default function FanOnboarding() {
  return (
    <WelcomeGate role="fan">
      <FanOnboardingWizard />
    </WelcomeGate>
  );
}
