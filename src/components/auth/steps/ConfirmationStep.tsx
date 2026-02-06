import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmationStepProps {
  email: string;
  resendCooldown: number;
  onResend: () => void;
  onChangeEmail: () => void;
  loading: boolean;
}

export function ConfirmationStep({
  email,
  resendCooldown,
  onResend,
  onChangeEmail,
  loading,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Check Your Inbox</h1>
        <p className="text-white/60 text-sm">
          We sent a magic link to <span className="text-primary font-medium">{email}</span>
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-1 rounded-full bg-primary" />
        <div className="w-8 h-1 rounded-full bg-primary" />
        <div className="w-8 h-1 rounded-full bg-primary" />
      </div>

      {/* Animated envelope icon */}
      <div className="flex justify-center py-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <Mail className="w-12 h-12 text-primary" />
          </div>
          {/* Decorative rings */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute -inset-4 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <p className="text-white/80 text-sm text-center">
          Click the link in the email to sign in. The link expires in 1 hour.
        </p>
        <div className="text-white/50 text-xs text-center space-y-1">
          <p>Didn't receive it?</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email</li>
            <li>Wait a moment and try resending</li>
          </ul>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          onClick={onResend}
          disabled={loading || resendCooldown > 0}
          className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Magic Link'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onChangeEmail}
          className="w-full text-white/60 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Use a different email
        </Button>
      </div>
    </div>
  );
}
