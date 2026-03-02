/**
 * PromoCodeManager — Create and manage promotional codes for beats.
 * 
 * Fulfills the Producer CRM promise of "Promo Codes" with
 * create, list, copy-to-clipboard, and usage tracking.
 */

import React, { useState } from 'react';
import { GlassPanel, HubHeader, StaggeredList, EmptyState } from '../design';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tag, Plus, Copy, Trash2, CalendarDays, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { uuid } from '@/lib/uuid';

interface PromoCode {
    id: string;
    code: string;
    discount: number;
    expiresAt: string;
    usageLimit: number;
    usageCount: number;
    active: boolean;
}

export const PromoCodeManager: React.FC = () => {
    const [codes, setCodes] = useState<PromoCode[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newCode, setNewCode] = useState({ code: '', discount: 20, expiresAt: '', usageLimit: 100 });

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const handleCreate = () => {
        if (!newCode.code) {
            toast.error('Enter a promo code');
            return;
        }
        const promo: PromoCode = {
            id: uuid(),
            code: newCode.code.toUpperCase(),
            discount: newCode.discount,
            expiresAt: newCode.expiresAt,
            usageLimit: newCode.usageLimit,
            usageCount: 0,
            active: true,
        };
        setCodes(prev => [promo, ...prev]);
        setNewCode({ code: '', discount: 20, expiresAt: '', usageLimit: 100 });
        setShowCreate(false);
        toast.success(`Promo code ${promo.code} created!`);
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied to clipboard!');
    };

    const handleDelete = (id: string) => {
        setCodes(prev => prev.filter(c => c.id !== id));
        toast.success('Promo code deleted');
    };

    return (
        <div className="space-y-6">
            <HubHeader
                icon={<Tag className="h-5 w-5 text-pink-400" />}
                title="Promo Codes"
                subtitle="Create discount codes for your beats"
                accent="rgba(236, 72, 153, 0.5)"
                action={
                    <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Code
                    </Button>
                }
            />

            {/* Create Form */}
            {showCreate && (
                <GlassPanel padding="p-5" accent="rgba(236, 72, 153, 0.2)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newCode.code}
                                    onChange={(e) => setNewCode(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                    placeholder="SUMMER2026"
                                    className="bg-white/5 border-white/10 uppercase"
                                />
                                <Button variant="outline" size="sm" onClick={() => setNewCode(prev => ({ ...prev, code: generateCode() }))} className="border-white/10 whitespace-nowrap">
                                    Generate
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Discount %</Label>
                            <Input
                                type="number"
                                value={newCode.discount}
                                onChange={(e) => setNewCode(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                                min={1}
                                max={100}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input
                                type="date"
                                value={newCode.expiresAt}
                                onChange={(e) => setNewCode(prev => ({ ...prev, expiresAt: e.target.value }))}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Usage Limit</Label>
                            <Input
                                type="number"
                                value={newCode.usageLimit}
                                onChange={(e) => setNewCode(prev => ({ ...prev, usageLimit: parseInt(e.target.value) || 1 }))}
                                min={1}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 gap-2">
                        <Button variant="outline" onClick={() => setShowCreate(false)} className="border-white/10">Cancel</Button>
                        <Button onClick={handleCreate}>Create Code</Button>
                    </div>
                </GlassPanel>
            )}

            {/* Code List */}
            {codes.length === 0 ? (
                <GlassPanel>
                    <EmptyState
                        icon={Tag}
                        title="No promo codes yet"
                        description="Create your first promo code to offer discounts on your beats"
                        cta={{ label: 'Create First Code', onClick: () => setShowCreate(true) }}
                    />
                </GlassPanel>
            ) : (
                <StaggeredList className="space-y-3">
                    {codes.map((promo) => (
                        <GlassPanel key={promo.id} padding="p-4" hoverable accent="rgba(236, 72, 153, 0.2)">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <code className="text-lg font-mono font-bold text-foreground">{promo.code}</code>
                                        <Button variant="ghost" size="sm" onClick={() => handleCopy(promo.code)} className="h-7 w-7 p-0">
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <Badge className="bg-pink-500/10 text-pink-400 border-pink-500/20">
                                        <Percent className="h-3 w-3 mr-1" />
                                        {promo.discount}% off
                                    </Badge>
                                    {promo.expiresAt && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <CalendarDays className="h-3 w-3" />
                                            Expires {promo.expiresAt}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground">
                                        {promo.usageCount}/{promo.usageLimit} used
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(promo.id)} className="h-7 w-7 p-0 text-red-400 hover:text-red-300">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </GlassPanel>
                    ))}
                </StaggeredList>
            )}
        </div>
    );
};
