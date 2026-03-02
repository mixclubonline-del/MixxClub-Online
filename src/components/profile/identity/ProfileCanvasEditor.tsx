/**
 * ProfileCanvasEditor — Main orchestrator for profile visual identity.
 * 
 * Brings together all sub-editors (colors, gradient, avatar frames,
 * layout, fonts, background patterns) into a single tabbed interface
 * with a live preview panel.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Palette, Layers, Type, User, Sparkles, Save, Eye } from 'lucide-react';
import { GlassPanel, HubHeader } from '@/components/crm/design';

import { ColorSystemPicker } from './ColorSystemPicker';
import { GradientBuilder } from './GradientBuilder';
import { AvatarFrameSelector } from './AvatarFrameSelector';
import { LayoutModeSwitcher } from './LayoutModeSwitcher';
import { FontPicker } from './FontPicker';
import { BackgroundPatternSelector } from './BackgroundPatternSelector';
import {
    type ProfileConfig,
    DEFAULT_PROFILE_CONFIG,
    gradientToCSS,
    patternToCSS,
    AVATAR_FRAMES,
} from './types';

interface ProfileCanvasEditorProps {
    config: ProfileConfig;
    onChange: (config: ProfileConfig) => void;
    onSave: () => void;
    saving?: boolean;
    profile?: {
        full_name?: string | null;
        username?: string | null;
        avatar_url?: string | null;
        tagline?: string | null;
        bio?: string | null;
    };
}

export const ProfileCanvasEditor: React.FC<ProfileCanvasEditorProps> = ({
    config,
    onChange,
    onSave,
    saving = false,
    profile,
}) => {
    const [activeTab, setActiveTab] = useState('colors');
    const [showPreview, setShowPreview] = useState(true);

    const updateConfig = useCallback(
        <K extends keyof ProfileConfig>(key: K, value: ProfileConfig[K]) => {
            onChange({ ...config, [key]: value });
        },
        [config, onChange]
    );

    const avatarFrame = AVATAR_FRAMES.find(f => f.value === config.avatarFrame);
    const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

    return (
        <div className="space-y-6">
            <HubHeader
                icon={<Sparkles className="h-5 w-5 text-purple-400" />}
                title="Visual Identity"
                subtitle="Customize how your profile looks to the world"
                accent="rgba(168, 85, 247, 0.5)"
                action={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            className="gap-1.5 border-white/10"
                        >
                            <Eye className="h-3.5 w-3.5" />
                            {showPreview ? 'Hide' : 'Show'} Preview
                        </Button>
                        <Button onClick={onSave} disabled={saving} size="sm" className="gap-1.5">
                            <Save className="h-3.5 w-3.5" />
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                }
            />

            <div className={cn('grid gap-6', showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1')}>
                {/* Editor Panel */}
                <GlassPanel padding="p-5" glow accent="rgba(168, 85, 247, 0.2)">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-white/8 mb-5">
                            <TabsTrigger value="colors" className="gap-1.5 text-xs">
                                <Palette className="h-3.5 w-3.5" />
                                Colors
                            </TabsTrigger>
                            <TabsTrigger value="gradient" className="gap-1.5 text-xs">
                                <Layers className="h-3.5 w-3.5" />
                                Gradient
                            </TabsTrigger>
                            <TabsTrigger value="avatar" className="gap-1.5 text-xs">
                                <User className="h-3.5 w-3.5" />
                                Avatar
                            </TabsTrigger>
                            <TabsTrigger value="layout" className="gap-1.5 text-xs">
                                <Sparkles className="h-3.5 w-3.5" />
                                Layout
                            </TabsTrigger>
                            <TabsTrigger value="type" className="gap-1.5 text-xs">
                                <Type className="h-3.5 w-3.5" />
                                Type
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="colors" className="space-y-5 mt-0">
                            <ColorSystemPicker
                                colors={config.colors}
                                onChange={(colors) => updateConfig('colors', colors)}
                            />
                            <BackgroundPatternSelector
                                background={config.background}
                                onChange={(bg) => updateConfig('background', bg)}
                            />
                        </TabsContent>

                        <TabsContent value="gradient" className="mt-0">
                            <GradientBuilder
                                gradient={config.gradient}
                                onChange={(g) => updateConfig('gradient', g)}
                            />
                        </TabsContent>

                        <TabsContent value="avatar" className="mt-0">
                            <AvatarFrameSelector
                                selected={config.avatarFrame}
                                onChange={(f) => updateConfig('avatarFrame', f)}
                                avatarUrl={profile?.avatar_url}
                            />
                        </TabsContent>

                        <TabsContent value="layout" className="mt-0">
                            <LayoutModeSwitcher
                                selected={config.layout}
                                onChange={(l) => updateConfig('layout', l)}
                            />
                        </TabsContent>

                        <TabsContent value="type" className="mt-0">
                            <FontPicker
                                font={config.font}
                                onChange={(f) => updateConfig('font', f)}
                            />
                        </TabsContent>
                    </Tabs>
                </GlassPanel>

                {/* Live Preview */}
                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <GlassPanel padding="p-0" className="overflow-hidden">
                                {/* Mini profile preview */}
                                <div className="relative">
                                    {/* Cover */}
                                    <div
                                        className="h-32 relative overflow-hidden"
                                        style={{
                                            background: config.gradient.enabled
                                                ? gradientToCSS(config.gradient)
                                                : `linear-gradient(to bottom right, ${config.colors.primary}40, ${config.colors.secondary}40)`,
                                        }}
                                    >
                                        {config.background.pattern !== 'none' && (
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    backgroundImage: patternToCSS(config.background),
                                                    backgroundSize: config.background.pattern === 'dots' ? '20px 20px' : '40px 40px',
                                                }}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    </div>

                                    {/* Profile card overlay */}
                                    <div className="px-5 pb-5 -mt-10 relative z-10">
                                        <div className="flex items-end gap-4">
                                            <Avatar className={cn('h-20 w-20 border-4 border-background', avatarFrame?.cssClass)}>
                                                <AvatarImage src={profile?.avatar_url || undefined} />
                                                <AvatarFallback className="text-xl bg-primary/20">{initials}</AvatarFallback>
                                            </Avatar>
                                            <div className="pb-1 min-w-0">
                                                <h3
                                                    className={cn(
                                                        'font-bold truncate',
                                                        config.font.size === 'sm' ? 'text-lg' : config.font.size === 'lg' ? 'text-2xl' : 'text-xl'
                                                    )}
                                                    style={{
                                                        fontFamily: config.font.heading,
                                                        color: config.colors.primary,
                                                    }}
                                                >
                                                    {profile?.full_name || 'Your Name'}
                                                </h3>
                                                <p
                                                    className="text-sm text-muted-foreground truncate"
                                                    style={{ fontFamily: config.font.body }}
                                                >
                                                    @{profile?.username || 'username'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tagline */}
                                        <p
                                            className="mt-3 text-sm text-foreground/80"
                                            style={{ fontFamily: config.font.body }}
                                        >
                                            {profile?.tagline || 'Your tagline goes here — make it count.'}
                                        </p>

                                        {/* Fake buttons */}
                                        <div className="flex gap-2 mt-4">
                                            <div
                                                className="px-4 py-1.5 rounded-lg text-xs font-medium text-white"
                                                style={{ backgroundColor: config.colors.primary }}
                                            >
                                                Follow
                                            </div>
                                            <div
                                                className="px-4 py-1.5 rounded-lg text-xs font-medium border"
                                                style={{ borderColor: `${config.colors.accent}60`, color: config.colors.accent }}
                                            >
                                                Message
                                            </div>
                                        </div>

                                        {/* Layout indicator */}
                                        <div className="mt-4 pt-3 border-t border-white/10">
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                                Layout: {config.layout}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </GlassPanel>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
