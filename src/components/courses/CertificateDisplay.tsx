/**
 * CertificateDisplay Component
 * Shows earned certificates with verification URL
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, Download, Share2 } from 'lucide-react';
import type { Certificate } from '@/stores/coursesStore';

interface CertificateDisplayProps {
    certificate: Certificate;
}

export const CertificateDisplay: React.FC<CertificateDisplayProps> = ({ certificate }) => {
    const handleDownload = () => {
        // Generate PDF certificate
        const pdf = document.createElement('div');
        pdf.innerHTML = `
      <html>
        <head>
          <title>Certificate - ${certificate.displayName}</title>
        </head>
        <body style="text-align: center; font-family: serif; padding: 40px;">
          <img src="/logo.png" style="height: 80px; margin-bottom: 40px;" />
          <h1 style="font-size: 48px; color: #6366f1; margin-bottom: 20px;">Certificate of Completion</h1>
          <p style="font-size: 24px; margin-bottom: 30px;">This is to certify that</p>
          <p style="font-size: 32px; font-weight: bold; margin-bottom: 30px; color: #333;">
            ${certificate.displayName}
          </p>
          <p style="font-size: 18px; margin-bottom: 20px;">has successfully completed the course</p>
          <p style="font-size: 20px; color: #6366f1; margin-bottom: 40px; font-weight: bold;">
            ${certificate.displayName}
          </p>
          <p style="font-size: 14px; color: #666; margin-bottom: 40px;">
            Certificate Number: ${certificate.certificateNumber}
          </p>
          <p style="font-size: 14px; color: #666; margin-bottom: 40px;">
            Issued on ${new Date(certificate.issuedAt).toLocaleDateString()}
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 60px;">
            Verify this certificate at: ${certificate.verificationUrl}
          </p>
        </body>
      </html>
    `;
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
