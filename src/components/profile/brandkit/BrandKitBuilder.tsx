/**
 * BrandKitBuilder — Orchestrates press kit, QR code, and analytics
 * into a single unified brand management interface.
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, QrCode, BarChart3 } from 'lucide-react';
import { GlassPanel, HubHeader } from '@/components/crm/design';

import { PressKitExporter } from './PressKitExporter';
import { QRCodeGenerator } from './QRCodeGenerator';
import { ProfileAnalytics } from './ProfileAnalytics';
import type { PressKitData, AnalyticsData } from './types';

interface BrandKitBuilderProps {
    pressKitData: PressKitData;
    analyticsData: AnalyticsData;
    profileUrl: string;
    accent?: string;
}

export const BrandKitBuilder: React.FC<BrandKitBuilderProps> = ({
    pressKitData,
    analyticsData,
    profileUrl,
    accent,
}) => {
    return (
        <div className="space-y-6">
            <HubHeader
                icon={<FileText className="h-5 w-5 text-emerald-400" />}
                title="Brand Kit"
                subtitle="Press kit, QR code, and profile analytics"
                accent="rgba(16, 185, 129, 0.5)"
            />

            <GlassPanel padding="p-5" glow accent="rgba(16, 185, 129, 0.2)">
                <Tabs defaultValue="presskit">
                    <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/8 mb-5">
                        <TabsTrigger value="presskit" className="gap-1.5 text-xs">
                            <FileText className="h-3.5 w-3.5" />
                            Press Kit
                        </TabsTrigger>
                        <TabsTrigger value="qr" className="gap-1.5 text-xs">
                            <QrCode className="h-3.5 w-3.5" />
                            QR Code
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-1.5 text-xs">
                            <BarChart3 className="h-3.5 w-3.5" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="presskit" className="mt-0">
                        <PressKitExporter data={pressKitData} accent={accent} />
                    </TabsContent>

                    <TabsContent value="qr" className="mt-0">
                        <QRCodeGenerator
                            profileUrl={profileUrl}
                            artistName={pressKitData.artistName}
                            accent={accent}
                        />
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-0">
                        <ProfileAnalytics analytics={analyticsData} accent={accent} />
                    </TabsContent>
                </Tabs>
            </GlassPanel>
        </div>
    );
};
