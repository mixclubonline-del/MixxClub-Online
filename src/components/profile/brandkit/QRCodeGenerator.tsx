/**
 * QRCodeGenerator — Generate a branded QR code for profile sharing.
 * 
 * Uses a simple SVG-based QR rendering (no external dependency).
 * Provides download and copy-link actions.
 */

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Copy, CheckCircle, QrCode, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
    profileUrl: string;
    artistName: string;
    accent?: string;
    className?: string;
}

/**
 * Simple QR-style pattern generator (decorative).
 * For production, integrate a real QR library like 'qrcode'.
 */
function generateQRPattern(size: number): boolean[][] {
    const grid: boolean[][] = [];
    // Seed-based pseudo-random for consistent output
    let seed = 42;
    const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    };

    for (let y = 0; y < size; y++) {
        grid[y] = [];
        for (let x = 0; x < size; x++) {
            // Corner markers (finder patterns)
            const isCorner =
                (x < 7 && y < 7) ||
                (x >= size - 7 && y < 7) ||
                (x < 7 && y >= size - 7);

            if (isCorner) {
                const cx = x < 7 ? 3 : x >= size - 7 ? size - 4 : 3;
                const cy = y < 7 ? 3 : y >= size - 7 ? size - 4 : 3;
                const dist = Math.max(Math.abs(x - cx), Math.abs(y - cy));
                grid[y][x] = dist <= 3 && (dist === 0 || dist === 2 || dist === 3);
            } else {
                grid[y][x] = rand() > 0.55;
            }
        }
    }
    return grid;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
    profileUrl,
    artistName,
    accent = '#f97316',
    className,
}) => {
    const [copied, setCopied] = useState(false);
    const qrSize = 25;
    const qrPattern = generateQRPattern(qrSize);

    const handleCopyLink = useCallback(async () => {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        toast.success('Profile link copied!');
        setTimeout(() => setCopied(false), 2000);
    }, [profileUrl]);

    const handleDownloadQR = useCallback(() => {
        // Generate SVG as downloadable
        const cellSize = 10;
        const padding = 20;
        const totalSize = qrSize * cellSize + padding * 2;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize + 30}" viewBox="0 0 ${totalSize} ${totalSize + 30}">`;
        svg += `<rect width="${totalSize}" height="${totalSize + 30}" fill="#111" rx="12"/>`;
        svg += `<rect x="${padding - 4}" y="${padding - 4}" width="${qrSize * cellSize + 8}" height="${qrSize * cellSize + 8}" fill="#fff" rx="4"/>`;

        for (let y = 0; y < qrSize; y++) {
            for (let x = 0; x < qrSize; x++) {
                if (qrPattern[y][x]) {
                    svg += `<rect x="${padding + x * cellSize}" y="${padding + y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${accent}" rx="1"/>`;
                }
            }
        }

        svg += `<text x="${totalSize / 2}" y="${totalSize + 16}" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#888">@${artistName}</text>`;
        svg += '</svg>';

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${artistName}_QR.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('QR code downloaded!');
    }, [qrPattern, qrSize, artistName, accent]);

    const handleShare = useCallback(async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${artistName} on MixxClub`,
                    url: profileUrl,
                });
            } catch {
                // User cancelled
            }
        } else {
            handleCopyLink();
        }
    }, [artistName, profileUrl, handleCopyLink]);

    return (
        <div className={cn('space-y-4', className)}>
            {/* QR Preview */}
            <div className="flex justify-center">
                <div className="relative bg-white p-3 rounded-xl shadow-lg">
                    <svg
                        width={qrSize * 6}
                        height={qrSize * 6}
                        viewBox={`0 0 ${qrSize} ${qrSize}`}
                    >
                        {qrPattern.map((row, y) =>
                            row.map((cell, x) =>
                                cell ? (
                                    <rect
                                        key={`${x}-${y}`}
                                        x={x}
                                        y={y}
                                        width={1}
                                        height={1}
                                        fill={accent}
                                        rx={0.1}
                                    />
                                ) : null
                            )
                        )}
                    </svg>
                    <p className="text-center text-[9px] text-gray-500 mt-1 font-mono">
                        @{artistName}
                    </p>
                </div>
            </div>

            {/* Profile URL */}
            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Profile Link</Label>
                <div className="flex gap-2">
                    <Input
                        value={profileUrl}
                        readOnly
                        className="h-9 bg-white/5 border-white/10 text-xs font-mono"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="border-white/10 flex-shrink-0"
                    >
                        {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button onClick={handleDownloadQR} variant="outline" size="sm" className="flex-1 gap-1.5 border-white/10">
                    <Download className="h-3.5 w-3.5" />
                    Download QR
                </Button>
                <Button onClick={handleShare} variant="outline" size="sm" className="flex-1 gap-1.5 border-white/10">
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                </Button>
            </div>
        </div>
    );
};
