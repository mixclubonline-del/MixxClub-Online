import { ArtistOnboardingWizard } from "@/components/onboarding/ArtistOnboardingWizard";
import { WelcomeGate } from "@/components/onboarding/WelcomeGate";

export default function ArtistOnboarding() {
  return (
    <WelcomeGate role="artist">
      <ArtistOnboardingWizard />
    </WelcomeGate>
  );
}
