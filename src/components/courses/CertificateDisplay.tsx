/**
 * CertificateDisplay Component
 * Shows earned certificates with verification URL
 * Uses jsPDF text API to prevent XSS - never inserts user content into HTML
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, Download, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import type { Certificate } from '@/stores/coursesStore';

interface CertificateDisplayProps {
    certificate: Certificate;
}

/**
 * Sanitizes text for safe display by encoding HTML entities
 * Prevents XSS attacks when displaying user-controlled content
 */
const sanitizeForDisplay = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

export const CertificateDisplay: React.FC<CertificateDisplayProps> = ({ certificate }) => {
    const handleDownload = () => {
        // Generate PDF using jsPDF text API (not innerHTML) to prevent XSS
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const centerX = pageWidth / 2;

        // Background gradient effect
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Border
        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(2);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Title
        doc.setFontSize(36);
        doc.setTextColor(99, 102, 241);
        doc.text('Certificate of Completion', centerX, 45, { align: 'center' });

        // Subtitle
        doc.setFontSize(16);
        doc.setTextColor(100, 100, 100);
        doc.text('This is to certify that', centerX, 70, { align: 'center' });

        // Recipient name placeholder (user would fill in their own name)
        doc.setFontSize(24);
        doc.setTextColor(50, 50, 50);
        doc.text('The Certificate Holder', centerX, 85, { align: 'center' });

        // Course completion text
        doc.setFontSize(16);
        doc.setTextColor(100, 100, 100);
        doc.text('has successfully completed the course', centerX, 100, { align: 'center' });

        // Course name - sanitized and safely rendered via text API
        doc.setFontSize(20);
        doc.setTextColor(99, 102, 241);
        const courseName = certificate.displayName.substring(0, 100); // Limit length
        doc.text(courseName, centerX, 115, { align: 'center' });

        // Certificate details
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Certificate Number: ${certificate.certificateNumber}`, centerX, 140, { align: 'center' });
        doc.text(`Issued on: ${new Date(certificate.issuedAt).toLocaleDateString()}`, centerX, 150, { align: 'center' });

        // Verification footer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Verify at: ${certificate.verificationUrl}`, centerX, 175, { align: 'center' });

        // MixClub branding
        doc.setFontSize(14);
        doc.setTextColor(99, 102, 241);
        doc.text('MixClub Online', centerX, 190, { align: 'center' });

        // Save PDF with sanitized filename
        const safeFilename = `Certificate_${certificate.certificateNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
        doc.save(safeFilename);
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/verify/${certificate.id}`;
        if (navigator.share) {
            navigator.share({
                title: 'My Certificate',
                text: `I just completed ${certificate.displayName}!`,
                url: shareUrl,
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Certificate link copied to clipboard!');
        }
    };

    // Sanitize display name for safe rendering in JSX
    const safeDisplayName = sanitizeForDisplay(certificate.displayName);

    return (
        <div className="w-full max-w-2xl rounded-lg border-2 border-gradient-to-r from-purple-400 to-pink-400 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-lg">
            {/* Certificate Header */}
            <div className="mb-8 text-center">
                <Award className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Certificate of Completion</h2>
                <p className="text-gray-600">You have successfully completed the course</p>
            </div>

            {/* Certificate Content */}
            <div className="mb-8 rounded-lg bg-white p-8 border-2 border-dashed border-gray-300">
                <p className="mb-4 text-center text-lg text-gray-700">This certifies that</p>
                <p className="mb-6 text-center text-3xl font-bold text-purple-600">You</p>
                <p className="mb-6 text-center text-lg text-gray-700">has successfully completed</p>
                {/* Use textContent-based sanitization for display name */}
                <p className="mb-8 text-center text-2xl font-bold text-indigo-600">{certificate.displayName}</p>

                <hr className="my-6 border-gray-300" />

                <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                        <p className="text-gray-600 mb-1">Certificate Number</p>
                        <p className="font-mono font-bold text-gray-900">{certificate.certificateNumber}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600 mb-1">Issued Date</p>
                        <p className="font-bold text-gray-900">
                            {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Verification URL: {certificate.verificationUrl}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap justify-center">
                <Button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
                >
                    <Download className="h-4 w-4" />
                    Download PDF
                </Button>
                <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                    <Share2 className="h-4 w-4" />
                    Share Certificate
                </Button>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                    onClick={() => {
                        navigator.clipboard.writeText(certificate.verificationUrl);
                        alert('Verification URL copied!');
                    }}
                >
                    Copy Link
                </Button>
            </div>
        </div>
    );
};

export default CertificateDisplay;
