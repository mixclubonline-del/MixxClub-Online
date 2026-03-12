/**
 * WaitlistCapture — Exclusive Early Access Request
 *
 * Premium glass-panel capture form with role selection,
 * invite code validation, social proof counter, and
 * animated success states. Designed for the pre-launch
 * "inner circle" experience.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Mic2, Headphones, Music, Heart,
    ArrowRight, CheckCircle, ChevronDown, ChevronUp,
    Sparkles, Lock, Users, Share2, Copy, Check,
} from 'lucide-react';
import { useWaitlistSignup, useWaitlistStats, type WaitlistFormData } from '@/hooks/useWaitlist';
import { useValidateInviteCode } from '@/hooks/useInviteCodes';
import { WaitlistCountdown } from '@/components/waitlist/WaitlistCountdown';
import { ReferralTracker } from '@/components/waitlist/ReferralTracker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import mixxclubLogo from '@/assets/mixxclub-3d-logo.png';

interface WaitlistCaptureProps {
    embedded?: boolean;
    className?: string;
}

const ROLES = [
    { value: 'artist' as const, label: 'Artist', icon: Mic2, description: 'I make music', accent: 'from-purple-500 to-pink-500' },
    { value: 'engineer' as const, label: 'Engineer', icon: Headphones, description: 'I mix & master', accent: 'from-green-500 to-emerald-500' },
    { value: 'producer' as const, label: 'Producer', icon: Music, description: 'I create beats', accent: 'from-cyan-500 to-blue-500' },
    { value: 'fan' as const, label: 'Fan', icon: Heart, description: 'I love music', accent: 'from-orange-500 to-red-500' },
];

export function WaitlistCapture({ embedded, className }: WaitlistCaptureProps) {
    const [formData, setFormData] = useState<WaitlistFormData>({ email: '' });
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [showInviteCode, setShowInviteCode] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [codeValidation, setCodeValidation] = useState<{ valid: boolean; message: string } | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [position, setPosition] = useState<number | null>(null);
    const [hasInviteCode, setHasInviteCode] = useState(false);
    const [copied, setCopied] = useState(false);

    const signup = useWaitlistSignup();
    const { data: stats } = useWaitlistStats();
    const validateCode = useValidateInviteCode();

    const handleCodeValidation = async () => {
        if (!inviteCode.trim()) return;
        const result = await validateCode.mutateAsync(inviteCode);
        setCodeValidation(result);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email) return;

        try {
            const result = await signup.mutateAsync({
                ...formData,
                role_interest: selectedRole as WaitlistFormData['role_interest'],
                invite_code: codeValidation?.valid ? inviteCode : undefined,
            });

            setPosition(result.position);
            setHasInviteCode(result.hasInviteCode);
            setSubmitted(true);
        } catch {
            // Error handled by hook
        }
    };

    const shareUrl = `${window.location.origin}/request-access`;
    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Success State ──
    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative max-w-lg mx-auto ${className || ''}`}
            >
                <div className="relative rounded-3xl overflow-hidden">
                    {/* Glass panel */}
                    <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl" />
                    <div className="absolute inset-0 border border-primary/20 rounded-3xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />

                    <div className="relative p-8 sm:p-10 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-primary" />
                            </div>
                        </motion.div>

                        <motion.h2
                            className="text-2xl sm:text-3xl font-black mb-3"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {hasInviteCode ? (
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                                    Welcome to the Inner Circle
                                </span>
                            ) : (
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                                    You're on the List
                                </span>
                            )}
                        </motion.h2>

                        {!hasInviteCode && position && (
                            <motion.div
                                className="mb-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium">Position <span className="text-primary font-bold">#{position}</span></span>
                                </div>
                            </motion.div>
                        )}

                        <motion.p
                            className="text-muted-foreground mb-8 max-w-sm mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            {hasInviteCode
                                ? "Your invite code has been redeemed. We'll reach out with your exclusive access link before anyone else."
                                : "We'll send you an invite when it's your turn. The earlier you joined, the sooner you're in."
                            }
                        </motion.p>

                        {/* Share section */}
                        <motion.div
                            className="space-y-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                <Share2 className="w-4 h-4" />
                                Share with your people
                            </p>
                            <div className="flex items-center gap-2 max-w-sm mx-auto">
                                <Input
                                    value={shareUrl}
                                    readOnly
                                    className="bg-muted/30 border-border/50 text-xs"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopy}
                                    className="shrink-0"
                                >
                                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ── Capture Form ──
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative max-w-lg mx-auto ${className || ''}`}
        >
            <div className="relative rounded-3xl overflow-hidden">
                {/* Glass panel background */}
                <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl" />
                <div className="absolute inset-0 border border-primary/20 rounded-3xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />

                <div className="relative p-6 sm:p-10">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <motion.img
                            src={mixxclubLogo}
                            alt="Mixxclub"
                            className="w-16 h-16 mx-auto mb-4"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
                            <Lock className="w-3 h-3 text-primary" />
                            <span className="text-xs font-medium text-primary uppercase tracking-wider">Exclusive Early Access</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black mb-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                                Request Early Access
                            </span>
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            The future of music collaboration is almost here. Get in before everyone else.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="waitlist-email" className="text-sm font-medium">Email</Label>
                            <Input
                                id="waitlist-email"
                                type="email"
                                required
                                placeholder="you@email.com"
                                className="bg-muted/30 border-border/50 h-12 text-base"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="waitlist-name" className="text-sm font-medium">Name <span className="text-muted-foreground">(optional)</span></Label>
                            <Input
                                id="waitlist-name"
                                placeholder="What should we call you?"
                                className="bg-muted/30 border-border/50 h-11"
                                value={formData.full_name || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">I am a...</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {ROLES.map((role) => {
                                    const Icon = role.icon;
                                    const isSelected = selectedRole === role.value;
                                    return (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => setSelectedRole(role.value)}
                                            className={`relative p-3 rounded-xl border text-left transition-all duration-200
                        ${isSelected
                                                    ? 'border-primary/50 bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.1)]'
                                                    : 'border-border/30 bg-muted/20 hover:border-border/60 hover:bg-muted/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${role.accent} ${isSelected ? 'opacity-100' : 'opacity-50'}`}>
                                                    <Icon className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{role.label}</p>
                                                    <p className="text-xs text-muted-foreground">{role.description}</p>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <motion.div
                                                    layoutId="role-check"
                                                    className="absolute top-2 right-2"
                                                >
                                                    <CheckCircle className="w-4 h-4 text-primary" />
                                                </motion.div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Social Handle */}
                        <div className="space-y-2">
                            <Label htmlFor="waitlist-social" className="text-sm font-medium">
                                Instagram or SoundCloud <span className="text-muted-foreground">(optional)</span>
                            </Label>
                            <Input
                                id="waitlist-social"
                                placeholder="@yourhandle"
                                className="bg-muted/30 border-border/50 h-11"
                                value={formData.social_handle || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, social_handle: e.target.value }))}
                            />
                        </div>

                        {/* Invite Code — expandable */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowInviteCode(!showInviteCode)}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Lock className="w-3.5 h-3.5" />
                                Have an invite code?
                                {showInviteCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <AnimatePresence>
                                {showInviteCode && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 mt-3">
                                            <Input
                                                placeholder="MIXX-XXXX-XXXX"
                                                className="bg-muted/30 border-border/50 h-11 uppercase tracking-widest font-mono"
                                                value={inviteCode}
                                                onChange={(e) => {
                                                    setInviteCode(e.target.value);
                                                    setCodeValidation(null);
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCodeValidation}
                                                disabled={!inviteCode.trim() || validateCode.isPending}
                                                className="shrink-0 h-11"
                                            >
                                                Verify
                                            </Button>
                                        </div>
                                        {codeValidation && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`text-xs mt-2 ${codeValidation.valid ? 'text-green-500' : 'text-red-400'}`}
                                            >
                                                {codeValidation.valid ? '✓ ' : '✕ '}{codeValidation.message}
                                            </motion.p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={signup.isPending || !formData.email}
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary via-purple-600 to-cyan-600 hover:opacity-90 shadow-lg shadow-primary/20 gap-2"
                        >
                            {signup.isPending ? (
                                <motion.div
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                            ) : (
                                <>
                                    {codeValidation?.valid ? 'Claim Your Spot' : 'Request Early Access'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Social proof */}
                    {stats && stats.totalSignups > 0 && (
                        <motion.div
                            className="mt-6 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border/30">
                                <Users className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs text-muted-foreground">
                                    <span className="text-foreground font-semibold">{stats.totalSignups.toLocaleString()}</span> creators already signed up
                                </span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
