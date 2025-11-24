import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import {
    Copy,
    Share2,
    Twitter,
    Facebook,
    Mail,
    MessageCircle,
    Users,
    Gift,
    TrendingUp,
    Clock,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export function ReferralDashboard() {
    const {
        myReferralCode,
        referralLink,
        referralStats,
        outgoingReferrals,
        loading,
        shareReferralLink,
        getTotalReferralEarnings,
        getPendingRewards,
    } = useReferralSystem();

    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await shareReferralLink?.();
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
                title: 'Copied!',
                description: 'Referral link copied to clipboard',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to copy referral link',
                variant: 'destructive',
            });
        }
    };

    const handleShare = async (method: 'twitter' | 'facebook' | 'email' | 'whatsapp') => {
        try {
            await shareReferralLink?.();
            toast({
                title: 'Shared!',
                description: `Shared on ${method}`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: `Failed to share on ${method}`,
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading referral data...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
                <p className="text-muted-foreground">
                    Earn credits for every friend who joins. Share your unique code and watch the rewards add up! 🚀
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Referred</p>
                            <p className="text-3xl font-bold">{referralStats.total}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Successful</p>
                            <p className="text-3xl font-bold">{referralStats.active}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Earned</p>
                            <p className="text-3xl font-bold">${getTotalReferralEarnings()}</p>
                        </div>
                        <Gift className="w-8 h-8 text-amber-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Pending</p>
                            <p className="text-3xl font-bold">${getPendingRewards()}</p>
                        </div>
                        <Clock className="w-8 h-8 text-purple-500 opacity-50" />
                    </div>
                </Card>
            </div>

            {/* Referral Link Section */}
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>

                <div className="flex gap-2 mb-6">
                    <Input
                        value={referralLink}
                        readOnly
                        className="bg-background"
                        onClick={(e) => e.currentTarget.select()}
                    />
                    <Button
                        onClick={handleCopyLink}
                        variant="outline"
                        className="px-4"
                    >
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? 'Copied!' : 'Copy'}
                    </Button>
                </div>

                {myReferralCode && (
                    <div className="mb-6 p-4 bg-background rounded border border-border">
                        <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
                        <p className="text-2xl font-mono font-bold text-primary">{myReferralCode.code}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Share this code with friends and earn ${myReferralCode.rewardValue} for each successful referral
                        </p>
                    </div>
                )}

                <div className="mb-6">
                    <p className="text-sm font-medium mb-3">Share On Social Media</p>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            onClick={() => handleShare('twitter')}
                            variant="outline"
                            className="gap-2"
                        >
                            <Twitter className="w-4 h-4" />
                            Twitter
                        </Button>
                        <Button
                            onClick={() => handleShare('facebook')}
                            variant="outline"
                            className="gap-2"
                        >
                            <Facebook className="w-4 h-4" />
                            Facebook
                        </Button>
                        <Button
                            onClick={() => handleShare('email')}
                            variant="outline"
                            className="gap-2"
                        >
                            <Mail className="w-4 h-4" />
                            Email
                        </Button>
                        <Button
                            onClick={() => handleShare('whatsapp')}
                            variant="outline"
                            className="gap-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                        </Button>
                    </div>
                </div>
            </Card>

            {/* How It Works */}
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">How It Works</h2>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            1
                        </div>
                        <div>
                            <h3 className="font-semibold">Share Your Code</h3>
                            <p className="text-sm text-muted-foreground">
                                Copy your unique referral code and share it with friends
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            2
                        </div>
                        <div>
                            <h3 className="font-semibold">Friend Signs Up</h3>
                            <p className="text-sm text-muted-foreground">
                                Your friend uses your code when creating their account
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            3
                        </div>
                        <div>
                            <h3 className="font-semibold">They Upgrade</h3>
                            <p className="text-sm text-muted-foreground">
                                When they upgrade to any paid plan, you both get rewards!
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            4
                        </div>
                        <div>
                            <h3 className="font-semibold">Earn Credits</h3>
                            <p className="text-sm text-muted-foreground">
                                Credits appear in your account and can be used for services
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Referrals List */}
            {outgoingReferrals.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Your Referrals</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {outgoingReferrals.map((referral) => (
                            <div
                                key={referral.id}
                                className="flex items-center justify-between p-3 bg-accent/50 rounded border border-border"
                            >
                                <div>
                                    <p className="font-medium text-sm">
                                        Referred User #{referral.referredUserId.slice(0, 8)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(referral.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="font-semibold">${referral.rewardValue}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {referral.rewardGiven ? 'Earned' : 'Pending'}
                                        </p>
                                    </div>
                                    {referral.rewardGiven ? (
                                        <span className="px-3 py-1 bg-green-500/20 text-green-700 text-xs rounded-full font-medium">
                                            ✓ Completed
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-700 text-xs rounded-full font-medium">
                                            ⏱ Pending
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
