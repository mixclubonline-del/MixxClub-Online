import { ProducerOnboardingWizard } from "@/components/onboarding/ProducerOnboardingWizard";
import { WelcomeGate } from "@/components/onboarding/WelcomeGate";

export default function ProducerOnboarding() {
  return (
    <WelcomeGate role="producer">
      <ProducerOnboardingWizard />
    </WelcomeGate>
  );
}
