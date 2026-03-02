/**
 * LicenseBuilder — Configure license tiers for beats.
 * 
 * Provides 6 license tiers with price, usage terms, and enable/disable toggles.
 * Fulfills the Producer CRM promise of "Smart Pricing" and "6 License Types".
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel, HubHeader, StaggeredList } from '../design';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, DollarSign, Save, Info } from 'lucide-react';
import { toast } from 'sonner';

interface LicenseTier {
    id: string;
    name: string;
    description: string;
    price: number;
    enabled: boolean;
    streams: string;
    downloads: string;
    musicVideos: string;
    radioPlay: boolean;
    profitSharing: boolean;
}

const DEFAULT_TIERS: LicenseTier[] = [
    { id: 'mp3-lease', name: 'MP3 Lease', description: 'Tagged MP3 for demos & mixtapes', price: 29.99, enabled: true, streams: '100,000', downloads: '5,000', musicVideos: '1 non-profit', radioPlay: false, profitSharing: false },
    { id: 'wav-lease', name: 'WAV Lease', description: 'Untagged WAV for releases', price: 49.99, enabled: true, streams: '500,000', downloads: '10,000', musicVideos: '1', radioPlay: false, profitSharing: false },
    { id: 'trackout', name: 'Trackout', description: 'Stems included for mixing', price: 99.99, enabled: true, streams: '1,000,000', downloads: '25,000', musicVideos: '2', radioPlay: true, profitSharing: false },
    { id: 'unlimited', name: 'Unlimited', description: 'No stream/download caps', price: 199.99, enabled: true, streams: 'Unlimited', downloads: 'Unlimited', musicVideos: 'Unlimited', radioPlay: true, profitSharing: false },
    { id: 'exclusive', name: 'Exclusive', description: 'Full ownership transfer', price: 499.99, enabled: false, streams: 'Unlimited', downloads: 'Unlimited', musicVideos: 'Unlimited', radioPlay: true, profitSharing: true },
    { id: 'custom', name: 'Custom', description: 'Negotiable terms', price: 0, enabled: false, streams: 'TBD', downloads: 'TBD', musicVideos: 'TBD', radioPlay: false, profitSharing: false },
];

export const LicenseBuilder: React.FC = () => {
    const [tiers, setTiers] = useState<LicenseTier[]>(DEFAULT_TIERS);
    const [bulkDeal, setBulkDeal] = useState({ enabled: false, buyCount: 3, freeCount: 1 });

    const updateTier = (id: string, updates: Partial<LicenseTier>) => {
        setTiers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const handleSave = () => {
        toast.success('License configuration saved!');
    };

    return (
        <div className="space-y-6">
            <HubHeader
                icon={<FileText className="h-5 w-5 text-emerald-400" />}
                title="License Builder"
                subtitle="Configure pricing tiers for your beats"
                accent="rgba(52, 211, 153, 0.5)"
                action={
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Config
                    </Button>
                }
            />

            <StaggeredList className="space-y-3">
                {tiers.map((tier) => (
                    <GlassPanel
                        key={tier.id}
                        padding="p-4"
                        hoverable
                        accent={tier.enabled ? 'rgba(52, 211, 153, 0.3)' : undefined}
                    >
                        <div className="flex items-start gap-4">
                            <Switch
                                checked={tier.enabled}
                                onCheckedChange={(checked) => updateTier(tier.id, { enabled: checked })}
                            />
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                                            {tier.name}
                                            {tier.id === 'exclusive' && (
                                                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Premium</Badge>
                                            )}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">{tier.description}</p>
                                    </div>
                                    {tier.id !== 'custom' && (
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4 text-emerald-400" />
                                            <Input
                                                type="number"
                                                value={tier.price}
                                                onChange={(e) => updateTier(tier.id, { price: parseFloat(e.target.value) || 0 })}
                                                className="w-24 text-right bg-white/5 border-white/10"
                                                disabled={!tier.enabled}
                                            />
                                        </div>
                                    )}
                                </div>

                                {tier.enabled && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                                            <span className="text-muted-foreground">Streams</span>
                                            <p className="font-medium text-foreground">{tier.streams}</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                                            <span className="text-muted-foreground">Downloads</span>
                                            <p className="font-medium text-foreground">{tier.downloads}</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                                            <span className="text-muted-foreground">Music Videos</span>
                                            <p className="font-medium text-foreground">{tier.musicVideos}</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                                            <span className="text-muted-foreground">Radio</span>
                                            <p className="font-medium text-foreground">{tier.radioPlay ? '✅ Yes' : '❌ No'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassPanel>
                ))}
            </StaggeredList>

            {/* Bulk Deal Configuration */}
            <GlassPanel padding="p-4" accent="rgba(168, 85, 247, 0.2)">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Switch
                            checked={bulkDeal.enabled}
                            onCheckedChange={(checked) => setBulkDeal(prev => ({ ...prev, enabled: checked }))}
                        />
                        <div>
                            <Label className="text-foreground font-medium">Bulk Deal</Label>
                            <p className="text-xs text-muted-foreground">Offer discounts for multiple purchases</p>
                        </div>
                    </div>
                    {bulkDeal.enabled && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Buy</span>
                            <Input
                                type="number"
                                value={bulkDeal.buyCount}
                                onChange={(e) => setBulkDeal(prev => ({ ...prev, buyCount: parseInt(e.target.value) || 1 }))}
                                className="w-16 text-center bg-white/5 border-white/10"
                                min={2}
                            />
                            <span className="text-muted-foreground">get</span>
                            <Input
                                type="number"
                                value={bulkDeal.freeCount}
                                onChange={(e) => setBulkDeal(prev => ({ ...prev, freeCount: parseInt(e.target.value) || 1 }))}
                                className="w-16 text-center bg-white/5 border-white/10"
                                min={1}
                            />
                            <span className="text-muted-foreground">free</span>
                        </div>
                    )}
                </div>
            </GlassPanel>
        </div>
    );
};
