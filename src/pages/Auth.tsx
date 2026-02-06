import { AuthWizard } from '@/components/auth/AuthWizard';

/**
 * Auth Page - Wizard-style magic link authentication
 * 
 * Flow:
 * 1. Role Selection (signup) → Choose Producer/Artist/Engineer/Fan
 * 2. Email Entry → Enter email for magic link
 * 3. Confirmation → Check inbox for magic link
 * 
 * Returning users skip role selection and go directly to email entry.
 */
const Auth = () => {
  return <AuthWizard />;
};

export default Auth;
