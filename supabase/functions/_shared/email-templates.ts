// Shared email template system for Mixxclub
// All edge functions should use renderEmailTemplate() for consistent branding

const BRAND_PRIMARY = '#5B3CFF';
const BRAND_SECONDARY = '#7C3AED';
const BRAND_GREEN = '#10b981';
const BRAND_DARK = '#1a1a2e';
const BRAND_MUTED = '#64748b';
const BRAND_LIGHT = '#f8fafc';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface EmailLayoutOptions {
  preheader?: string;
  headerBg?: string;
  headerIcon?: string;
  headerTitle: string;
  headerSubtitle?: string;
  bodyHtml: string;
  footerExtra?: string;
}

function renderLayout(options: EmailLayoutOptions): string {
  const bg = options.headerBg || `linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_SECONDARY} 100%)`;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${options.preheader ? `<title>${escapeHtml(options.preheader)}</title>` : ''}
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: ${BRAND_LIGHT};">
  
  <!-- Header -->
  <div style="background: ${bg}; padding: 36px 24px; text-align: center;">
    ${options.headerIcon ? `<div style="font-size: 28px; margin-bottom: 8px;">${options.headerIcon}</div>` : ''}
    <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">${escapeHtml(options.headerTitle)}</h1>
    ${options.headerSubtitle ? `<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${escapeHtml(options.headerSubtitle)}</p>` : ''}
  </div>
  
  <!-- Body -->
  <div style="background: white; padding: 32px 28px;">
    ${options.bodyHtml}
  </div>

  <!-- Footer -->
  <div style="background: #2d3748; padding: 24px 20px; text-align: center; color: #a0aec0;">
    ${options.footerExtra || ''}
    <p style="margin: 0 0 8px 0; font-size: 12px;">
      <a href="https://mixxclub.lovable.app/notification-preferences" style="color: ${BRAND_PRIMARY}; text-decoration: none;">Manage preferences</a> · 
      <a href="https://mixxclub.lovable.app" style="color: ${BRAND_PRIMARY}; text-decoration: none;">Visit Mixxclub</a>
    </p>
    <p style="margin: 0; color: #718096; font-size: 11px;">
      © ${year} Mixxclub Online. All rights reserved.
    </p>
  </div>
</body>
</html>`;
}

// ─── Public API ──────────────────────────────────────────────

export function renderWelcomeArtist(userName: string, totalUsers: number, activeProjects: number): string {
  return renderLayout({
    headerIcon: '🎵',
    headerTitle: 'Welcome to Mixxclub!',
    headerSubtitle: 'Your music deserves the best sound',
    bodyHtml: `
      <h2 style="color: ${BRAND_PRIMARY}; margin: 0 0 15px 0; font-size: 22px;">Hey ${escapeHtml(userName)}! 👋</h2>
      <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8;">
        Welcome to a community of <strong>${totalUsers.toLocaleString()}+ creators</strong> transforming their music with professional mixing and mastering.
      </p>

      <div style="background: ${BRAND_LIGHT}; padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid ${BRAND_PRIMARY};">
        <h3 style="color: ${BRAND_PRIMARY}; margin: 0 0 16px 0; font-size: 18px;">🚀 Get Started in 3 Steps</h3>
        <div style="margin-bottom: 12px;">
          <strong>1. Upload Your Track</strong> — WAV, MP3, AIFF, or FLAC
        </div>
        <div style="margin-bottom: 12px;">
          <strong>2. Choose Your Engineer</strong> — Browse verified portfolios
        </div>
        <div>
          <strong>3. Get Professional Results</strong> — Collaborate in real-time
        </div>
      </div>

      <div style="background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_SECONDARY} 100%); padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
        <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
          <div style="color: white; padding: 8px;">
            <div style="font-size: 28px; font-weight: bold;">${totalUsers.toLocaleString()}+</div>
            <div style="font-size: 13px; opacity: 0.9;">Members</div>
          </div>
          <div style="color: white; padding: 8px;">
            <div style="font-size: 28px; font-weight: bold;">${activeProjects.toLocaleString()}+</div>
            <div style="font-size: 13px; opacity: 0.9;">Projects Live</div>
          </div>
          <div style="color: white; padding: 8px;">
            <div style="font-size: 28px; font-weight: bold;">24-48h</div>
            <div style="font-size: 13px; opacity: 0.9;">Avg Turnaround</div>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="https://mixxclub.lovable.app/artist-crm" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_SECONDARY} 100%); color: white; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(91,60,255,0.3);">
          Start Your First Project
        </a>
      </div>

      <div style="background: ${BRAND_LIGHT}; padding: 16px; border-radius: 8px; text-align: center; margin-top: 24px;">
        <p style="margin: 0; color: ${BRAND_MUTED}; font-size: 13px;">
          Questions? <a href="mailto:support@mixxclubonline.com" style="color: ${BRAND_PRIMARY}; text-decoration: none; font-weight: 600;">support@mixxclubonline.com</a>
        </p>
      </div>`,
  });
}

export function renderWelcomeEngineer(userName: string, totalUsers: number, activeProjects: number): string {
  const engineerCount = Math.floor(totalUsers * 0.15);
  return renderLayout({
    headerBg: `linear-gradient(135deg, ${BRAND_GREEN} 0%, #059669 100%)`,
    headerIcon: '🎚️',
    headerTitle: 'Welcome to Mixxclub!',
    headerSubtitle: 'Start earning from your audio engineering skills',
    bodyHtml: `
      <h2 style="color: ${BRAND_GREEN}; margin: 0 0 15px 0; font-size: 22px;">Hey ${escapeHtml(userName)}! 👋</h2>
      <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8;">
        Join <strong>${engineerCount.toLocaleString()}+ professional engineers</strong> earning from their craft on Mixxclub.
      </p>

      <div style="background: #f0fdf4; padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid ${BRAND_GREEN};">
        <h3 style="color: ${BRAND_GREEN}; margin: 0 0 16px 0; font-size: 18px;">🚀 Start Earning in 3 Steps</h3>
        <div style="margin-bottom: 12px;"><strong>1. Complete Your Profile</strong> — Portfolio, genres, rates</div>
        <div style="margin-bottom: 12px;"><strong>2. Browse Available Projects</strong> — Match your expertise</div>
        <div><strong>3. Deliver & Get Paid</strong> — 70% revenue share</div>
      </div>

      <div style="background: linear-gradient(135deg, ${BRAND_GREEN} 0%, #059669 100%); padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
        <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
          <div style="color: white; padding: 8px;">
            <div style="font-size: 28px; font-weight: bold;">70%</div>
            <div style="font-size: 13px; opacity: 0.9;">Revenue Share</div>
          </div>
          <div style="color: white; padding: 8px;">
            <div style="font-size: 28px; font-weight: bold;">${activeProjects.toLocaleString()}+</div>
            <div style="font-size: 13px; opacity: 0.9;">Active Projects</div>
          </div>
          <div style="color: white; padding: 8px;">
            <div style="font-size: 28px; font-weight: bold;">$50-500</div>
            <div style="font-size: 13px; opacity: 0.9;">Per Project</div>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="https://mixxclub.lovable.app/engineer-crm" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_GREEN} 0%, #059669 100%); color: white; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
          Set Up Your Profile
        </a>
      </div>`,
  });
}

export function renderPaymentReceipt(details: {
  userName: string;
  projectName: string;
  amount: number;
  engineerShare: number;
  platformFee: number;
  paymentMethod: string;
  transactionId: string;
  date: string;
}): string {
  return renderLayout({
    headerIcon: '🧾',
    headerTitle: 'Payment Receipt',
    headerSubtitle: 'Thank you for your payment!',
    bodyHtml: `
      <div style="background: ${BRAND_LIGHT}; padding: 24px; border-radius: 10px; margin-bottom: 24px;">
        <h3 style="color: ${BRAND_PRIMARY}; margin: 0 0 16px 0;">Payment Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Customer</strong></td><td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #e9ecef;">${escapeHtml(details.userName)}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Project</strong></td><td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #e9ecef;">${escapeHtml(details.projectName)}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Date</strong></td><td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #e9ecef;">${escapeHtml(details.date)}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Method</strong></td><td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #e9ecef;">${escapeHtml(details.paymentMethod)}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Transaction ID</strong></td><td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #e9ecef; font-family: monospace; font-size: 12px;">${escapeHtml(details.transactionId)}</td></tr>
        </table>
      </div>

      <div style="background: ${BRAND_LIGHT}; padding: 24px; border-radius: 10px;">
        <h3 style="color: ${BRAND_PRIMARY}; margin: 0 0 16px 0;">Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">Engineer Share (70%)</td><td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #e9ecef;">$${details.engineerShare.toFixed(2)}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">Platform Fee (30%)</td><td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #e9ecef;">$${details.platformFee.toFixed(2)}</td></tr>
          <tr><td style="padding: 16px 0 0 0; font-size: 18px;"><strong>Total Paid</strong></td><td style="text-align: right; padding: 16px 0 0 0; font-size: 22px; color: ${BRAND_PRIMARY};"><strong>$${details.amount.toFixed(2)}</strong></td></tr>
        </table>
      </div>`,
  });
}

export function renderDigestEmail(userName: string, notifications: Array<{
  title: string;
  message: string;
  type: string | null;
  action_url: string | null;
  created_at: string;
}>): string {
  const count = notifications.length;

  const typeIcon = (type: string | null): string => {
    switch (type) {
      case 'payment_received': return '💰';
      case 'milestone_reached': return '🎯';
      case 'collaboration_invite': return '🤝';
      case 'health_warning': return '⚠️';
      case 'health_critical': return '🔴';
      case 'follow': return '👤';
      case 'milestone': return '🏆';
      default: return '🔔';
    }
  };

  const rows = notifications.slice(0, 20).map(n => {
    const icon = typeIcon(n.type);
    const d = new Date(n.created_at);
    const h = d.getUTCHours() % 12 || 12;
    const m = d.getUTCMinutes().toString().padStart(2, '0');
    const ampm = d.getUTCHours() >= 12 ? 'PM' : 'AM';
    const time = `${h}:${m} ${ampm} UTC`;
    const link = n.action_url
      ? `<a href="https://mixxclub.lovable.app${n.action_url}" style="color: ${BRAND_PRIMARY}; text-decoration: none; font-size: 13px; font-weight: 600;">View →</a>`
      : '';

    return `<tr>
      <td style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td width="36" valign="top" style="font-size: 18px;">${icon}</td>
          <td style="padding-left: 10px;" valign="top">
            <div style="font-weight: 600; color: ${BRAND_DARK}; font-size: 14px; margin-bottom: 4px;">${escapeHtml(n.title)}</div>
            <div style="color: ${BRAND_MUTED}; font-size: 13px; line-height: 1.5; margin-bottom: 6px;">${escapeHtml(n.message)}</div>
            <div><span style="color: #94a3b8; font-size: 12px;">${time}</span> ${link}</div>
          </td>
        </tr></table>
      </td>
    </tr>`;
  }).join('');

  const moreRow = count > 20
    ? `<tr><td style="padding: 14px 16px; text-align: center; color: ${BRAND_MUTED}; font-size: 14px;">...and ${count - 20} more notifications</td></tr>`
    : '';

  return renderLayout({
    headerIcon: '📬',
    headerTitle: 'Your Daily Digest',
    headerSubtitle: `${count} unread notification${count !== 1 ? 's' : ''} since yesterday`,
    bodyHtml: `
      <p style="margin: 0 0 20px 0; font-size: 15px; color: ${BRAND_DARK};">
        Hey <strong>${escapeHtml(userName)}</strong>, here's what you missed:
      </p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #fafafa; border-radius: 12px; overflow: hidden;">
        ${rows}
        ${moreRow}
      </table>
      <div style="text-align: center; margin: 28px 0 8px 0;">
        <a href="https://mixxclub.lovable.app/notifications" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_SECONDARY} 100%); color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          View All Notifications
        </a>
      </div>`,
    footerExtra: `<p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">You're receiving this because you have daily digest enabled.</p>`,
  });
}

export function renderSimpleReceipt(payment: {
  userName: string;
  receiptNumber: string;
  date: string;
  paymentMethod: string;
  projectTitle: string;
  transactionId: string;
  amount: string;
}): string {
  return renderLayout({
    headerIcon: '🧾',
    headerTitle: 'Payment Receipt',
    headerSubtitle: 'Thank you for your purchase!',
    bodyHtml: `
      <p>Hi ${escapeHtml(payment.userName)},</p>
      <p>Your payment has been successfully processed. Here are your receipt details:</p>
      <div style="background: ${BRAND_LIGHT}; padding: 24px; border-radius: 10px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Receipt #</strong></td><td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #e9ecef;">${escapeHtml(payment.receiptNumber)}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Date</strong></td><td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #e9ecef;">${escapeHtml(payment.date)}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Method</strong></td><td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #e9ecef;">${escapeHtml(payment.paymentMethod)}</td></tr>
          ${payment.projectTitle ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Project</strong></td><td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #e9ecef;">${escapeHtml(payment.projectTitle)}</td></tr>` : ''}
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Transaction ID</strong></td><td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #e9ecef; font-family: monospace; font-size: 12px;">${escapeHtml(payment.transactionId)}</td></tr>
          <tr><td style="padding: 14px 0 0 0; font-size: 18px;"><strong>Total</strong></td><td style="text-align: right; padding: 14px 0 0 0; font-size: 22px; color: ${BRAND_PRIMARY};"><strong>${escapeHtml(payment.amount)}</strong></td></tr>
        </table>
      </div>`,
  });
}

// ─── Email send logging helper ──────────────────────────────

export async function logEmailSend(
  supabase: any,
  recipientEmail: string,
  templateName: string,
  status: 'sent' | 'failed' | 'skipped',
  errorMessage?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('email_send_log').insert({
      recipient_email: recipientEmail,
      template_name: templateName,
      status,
      error_message: errorMessage || null,
      metadata: metadata || null,
    });
  } catch (err) {
    console.error('Failed to log email send:', err);
  }
}
