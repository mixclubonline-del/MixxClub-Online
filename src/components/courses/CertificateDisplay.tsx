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
    courseName?: string;
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

export const CertificateDisplay: React.FC<CertificateDisplayProps> = ({ certificate, courseName }) => {
    const displayName = courseName || 'Course Completion';
    const verificationUrl = `${window.location.origin}/verify/${certificate.id}`;

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

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(40);
        doc.setTextColor(30, 41, 59);
        doc.text('CERTIFICATE', centerX, 60, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(100, 116, 139);
        doc.text('OF COMPLETION', centerX, 75, { align: 'center' });

        // Recipient
        doc.setFontSize(14);
        doc.setTextColor(71, 85, 105);
        doc.text('This certifies that', centerX, 100, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(32);
        doc.setTextColor(99, 102, 241); // Primary color
        // Use user ID if name not available (security preference)
        doc.text(sanitizeForDisplay(certificate.user_id), centerX, 120, { align: 'center' });

        // Course
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(71, 85, 105);
        doc.text('Has successfully completed the course', centerX, 140, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(30, 41, 59);
        doc.text(sanitizeForDisplay(displayName), centerX, 160, { align: 'center' });

        // Date and ID
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text(`Completed on: ${new Date(certificate.issued_at).toLocaleDateString()}`, centerX, 190, { align: 'center' });
        doc.text(`Certificate ID: ${certificate.certificate_number}`, centerX, 200, { align: 'center' });

        // Verification Link
        doc.setTextColor(99, 102, 241);
        doc.textWithLink('Verify at mixxclub.com/verify', centerX, 220, { 
            url: verificationUrl,
            align: 'center' 
        });

        // Footer Branding
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text('Mixxclub Online', 20, 280);
        doc.text('Professional Audio Education', pageWidth - 20, 280, { align: 'right' });

        doc.save(`Certificate_${certificate.certificate_number}.pdf`);
    };

    return (
        <div className="flex flex-col items-center gap-6 p-8 border rounded-xl bg-card">
            <Award className="w-16 h-16 text-primary animate-pulse" />
            
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Course Completed!</h3>
                <p className="text-muted-foreground">
                    You've earned a certificate for <strong>{displayName}</strong>
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded">
                    ID: {certificate.certificate_number}
                </p>
            </div>

            <div className="flex gap-4">
                <Button onClick={handleDownload} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                </Button>
                
                <Button variant="outline" className="gap-2" onClick={() => {
                    navigator.clipboard.writeText(verificationUrl);
                }}>
                    <Share2 className="w-4 h-4" />
                    Copy Link
                </Button>
            </div>
        </div>
    );
};