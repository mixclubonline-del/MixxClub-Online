import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createLogger } from '../_shared/logger.ts';
import { handleError, createResponse } from '../_shared/error-handler.ts';

const logger = createLogger('send-welcome-email');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, fullName, userRole } = await req.json();
    logger.info('Sending welcome email', { userId, email, userRole });

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not configured - skipping email');
      return createResponse({ success: true, message: 'Email not configured' });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get community stats for dynamic content
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: activeProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .in('status', ['in_progress', 'review']);

    const userName = fullName || email.split('@')[0];
    const isEngineer = userRole === 'engineer';

    // Generate role-based email HTML
    const emailHtml = isEngineer 
      ? generateEngineerWelcomeEmail(userName, totalUsers || 0, activeProjects || 0)
      : generateArtistWelcomeEmail(userName, totalUsers || 0, activeProjects || 0);

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Mixxclub <onboarding@resend.dev>',
        to: [email],
        subject: `Welcome to Mixxclub${isEngineer ? ' - Start Earning Today!' : ' - Your Music Journey Begins!'}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      logger.error('Resend error', emailData);
      throw new Error(`Failed to send email: ${emailData.message || 'Unknown error'}`);
    }

    logger.info('Welcome email sent successfully', { messageId: emailData.id });

    return createResponse({ success: true, messageId: emailData.id });

  } catch (error) {
    logger.error('Error sending welcome email', error);
    const errorResponse = handleError(error);
    return new Response(
      JSON.stringify(errorResponse.body),
      { 
        status: errorResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateArtistWelcomeEmail(userName: string, totalUsers: number, activeProjects: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Mixxclub</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #5B3CFF 0%, #7C3AED 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🎵 Welcome to Mixxclub!</h1>
    <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px;">Your music deserves the best sound</p>
  </div>
  
  <!-- Main Content -->
  <div style="background: white; padding: 40px 30px;">
    
    <!-- Personal Greeting -->
    <div style="margin-bottom: 30px;">
      <h2 style="color: #5B3CFF; margin: 0 0 15px 0; font-size: 24px;">Hey ${userName}! 👋</h2>
      <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.8;">
        We're thrilled to have you join our community of <strong>${totalUsers.toLocaleString()}+ artists</strong> who are transforming their music with professional mixing and mastering.
      </p>
      <p style="margin: 0; font-size: 16px; line-height: 1.8;">
        Mixxclub connects you with top-tier audio engineers who will bring your creative vision to life. No more struggling with complex software or settling for amateur sound quality.
      </p>
    </div>

    <!-- Getting Started -->
    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #5B3CFF;">
      <h3 style="color: #5B3CFF; margin: 0 0 20px 0; font-size: 20px;">🚀 Get Started in 3 Easy Steps</h3>
      
      <div style="margin-bottom: 15px;">
        <div style="display: inline-block; background: #5B3CFF; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 10px;">1</div>
        <strong style="color: #333; font-size: 16px;">Upload Your Track</strong>
        <p style="margin: 8px 0 0 38px; color: #666; font-size: 14px;">Upload your raw audio files - we accept all major formats (WAV, MP3, AIFF, FLAC)</p>
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="display: inline-block; background: #5B3CFF; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 10px;">2</div>
        <strong style="color: #333; font-size: 16px;">Choose Your Engineer</strong>
        <p style="margin: 8px 0 0 38px; color: #666; font-size: 14px;">Browse verified engineers, check their portfolios, and select your perfect match</p>
      </div>
      
      <div style="margin-bottom: 0;">
        <div style="display: inline-block; background: #5B3CFF; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 10px;">3</div>
        <strong style="color: #333; font-size: 16px;">Get Professional Results</strong>
        <p style="margin: 8px 0 0 38px; color: #666; font-size: 14px;">Collaborate in real-time, provide feedback, and receive radio-ready tracks</p>
      </div>
    </div>

    <!-- Stats Banner -->
    <div style="background: linear-gradient(135deg, #5B3CFF 0%, #7C3AED 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
      <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
        <div style="color: white; padding: 10px;">
          <div style="font-size: 32px; font-weight: bold;">${totalUsers.toLocaleString()}+</div>
          <div style="font-size: 14px; opacity: 0.9;">Active Members</div>
        </div>
        <div style="color: white; padding: 10px;">
          <div style="font-size: 32px; font-weight: bold;">${activeProjects.toLocaleString()}+</div>
          <div style="font-size: 14px; opacity: 0.9;">Projects Live Now</div>
        </div>
        <div style="color: white; padding: 10px;">
          <div style="font-size: 32px; font-weight: bold;">24-48h</div>
          <div style="font-size: 14px; opacity: 0.9;">Avg Turnaround</div>
        </div>
      </div>
    </div>

    <!-- What You Get -->
    <div style="margin-bottom: 30px;">
      <h3 style="color: #5B3CFF; margin: 0 0 20px 0; font-size: 20px;">✨ What Makes Us Different</h3>
      
      <div style="margin-bottom: 15px; padding-left: 25px; position: relative;">
        <span style="position: absolute; left: 0; color: #5B3CFF; font-size: 18px;">🎯</span>
        <strong style="color: #333;">AI-Powered Matching</strong>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Our intelligent system matches you with engineers who specialize in your genre</p>
      </div>
      
      <div style="margin-bottom: 15px; padding-left: 25px; position: relative;">
        <span style="position: absolute; left: 0; color: #5B3CFF; font-size: 18px;">💬</span>
        <strong style="color: #333;">Real-Time Collaboration</strong>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Live chat, audio comments, and instant feedback throughout the process</p>
      </div>
      
      <div style="margin-bottom: 15px; padding-left: 25px; position: relative;">
        <span style="position: absolute; left: 0; color: #5B3CFF; font-size: 18px;">🔄</span>
        <strong style="color: #333;">Unlimited Revisions</strong>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Get it perfect with unlimited revisions until you're 100% satisfied</p>
      </div>
      
      <div style="margin-bottom: 0; padding-left: 25px; position: relative;">
        <span style="position: absolute; left: 0; color: #5B3CFF; font-size: 18px;">⚡</span>
        <strong style="color: #333;">Fast Turnaround</strong>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Most projects completed within 24-48 hours</p>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 40px 0 30px 0;">
      <a href="https://mixxclubonline.com/artist-crm" style="display: inline-block; background: linear-gradient(135deg, #5B3CFF 0%, #7C3AED 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(91, 60, 255, 0.4);">
        Start Your First Project
      </a>
    </div>

    <!-- Support -->
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
        Need help getting started? Our team is here for you!
      </p>
      <p style="margin: 0; font-size: 14px;">
        <a href="mailto:support@mixxclubonline.com" style="color: #5B3CFF; text-decoration: none; font-weight: bold;">📧 support@mixxclubonline.com</a>
      </p>
    </div>

  </div>
  
  <!-- Footer -->
  <div style="background: #2d3748; padding: 30px 20px; text-align: center; color: #a0aec0;">
    <p style="margin: 0 0 15px 0; font-size: 14px;">
      Follow us for tips, updates, and success stories:
    </p>
    <div style="margin-bottom: 20px;">
      <a href="#" style="color: #5B3CFF; text-decoration: none; margin: 0 10px; font-size: 24px;">📸</a>
      <a href="#" style="color: #5B3CFF; text-decoration: none; margin: 0 10px; font-size: 24px;">🐦</a>
      <a href="#" style="color: #5B3CFF; text-decoration: none; margin: 0 10px; font-size: 24px;">🎵</a>
    </div>
    <p style="margin: 0; color: #718096; font-size: 12px;">
      © ${new Date().getFullYear()} Mixxclub Online. All rights reserved.
    </p>
    <p style="margin: 10px 0 0 0; font-size: 12px;">
      <a href="https://mixxclubonline.com" style="color: #5B3CFF; text-decoration: none;">Visit Website</a> • 
      <a href="https://mixxclubonline.com/faq" style="color: #5B3CFF; text-decoration: none;">FAQ</a>
    </p>
  </div>
  
</body>
</html>
  `;
}

function generateEngineerWelcomeEmail(userName: string, totalUsers: number, activeProjects: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Mixxclub Online - Engineer</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🎚️ Welcome to Mixxclub Online!</h1>
    <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px;">Start earning from your audio engineering skills</p>
  </div>
  
  <!-- Main Content -->
  <div style="background: white; padding: 40px 30px;">
    
    <!-- Personal Greeting -->
    <div style="margin-bottom: 30px;">
      <h2 style="color: #10b981; margin: 0 0 15px 0; font-size: 24px;">Hey ${userName}! 👋</h2>
      <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.8;">
        Welcome to a community where your audio engineering expertise is valued and rewarded. Join <strong>${Math.floor(totalUsers * 0.15).toLocaleString()}+ professional engineers</strong> earning from their craft.
      </p>
      <p style="margin: 0; font-size: 16px; line-height: 1.8;">
        Mixxclub Online connects you directly with artists who need your skills. Set your rates, choose your projects, and build your reputation - all in one platform.
      </p>
    </div>

    <!-- Getting Started -->
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #10b981;">
      <h3 style="color: #10b981; margin: 0 0 20px 0; font-size: 20px;">🚀 Get Started Earning in 3 Steps</h3>
      
      <div style="margin-bottom: 15px;">
        <div style="display: inline-block; background: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 10px;">1</div>
        <strong style="color: #333; font-size: 16px;">Complete Your Profile</strong>
        <p style="margin: 8px 0 0 38px; color: #666; font-size: 14px;">Add your portfolio, experience, genres, and set your rates</p>
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="display: inline-block; background: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 10px;">2</div>
        <strong style="color: #333; font-size: 16px;">Browse Available Projects</strong>
        <p style="margin: 8px 0 0 38px; color: #666; font-size: 14px;">Review project details, budgets, and apply to jobs that match your skills</p>
      </div>
      
      <div style="margin-bottom: 0;">
        <div style="display: inline-block; background: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 10px;">3</div>
        <strong style="color: #333; font-size: 16px;">Deliver & Get Paid</strong>
        <p style="margin: 8px 0 0 38px; color: #666; font-size: 14px;">Complete projects, earn 70% revenue share, and build your reputation</p>
      </div>
    </div>

    <!-- Earnings Potential -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
      <h3 style="color: white; margin: 0 0 15px 0; font-size: 22px;">💰 Your Earning Potential</h3>
      <div style="display: flex; justify-content: space-around; flex-wrap: wrap; margin-top: 20px;">
        <div style="color: white; padding: 10px;">
          <div style="font-size: 28px; font-weight: bold;">70%</div>
          <div style="font-size: 14px; opacity: 0.9;">Revenue Share</div>
        </div>
        <div style="color: white; padding: 10px;">
          <div style="font-size: 28px; font-weight: bold;">${activeProjects.toLocaleString()}+</div>
          <div style="font-size: 14px; opacity: 0.9;">Active Projects</div>
        </div>
        <div style="color: white; padding: 10px;">
          <div style="font-size: 28px; font-weight: bold;">$50-500</div>
          <div style="font-size: 14px; opacity: 0.9;">Per Project</div>
        </div>
      </div>
    </div>

    <!-- Benefits -->
    <div style="margin-bottom: 30px;">
      <h3 style="color: #10b981; margin: 0 0 20px 0; font-size: 20px;">✨ Engineer Benefits</h3>
      
      <div style="margin-bottom: 15px; padding-left: 25px; position: relative;">
        <span style="position: absolute; left: 0; color: #10b981; font-size: 18px;">🎯</span>
        <strong style="color: #333;">Intelligent Project Matching</strong>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Get matched with projects that fit your expertise and style</p>
      </div>
      
      <div style="margin-bottom: 15px; padding-left: 25px; position: relative;">
        <span style="position: absolute; left: 0; color: #10b981; font-size: 18px;">⚡</span>
        <strong style="color: #333;">Instant Payouts</strong>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Get paid immediately upon project completion - no waiting</p>
      </div>
      
      <div style="margin-bottom: 15px; padding-left: 25px; position: relative;">
        <span style="position: absolute; left: 0; color: #10b981; font-size: 18px;">🏆</span>
        <strong style="color: #333;">Build Your Reputation</strong>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Earn badges, climb leaderboards, and get bonus rewards</p>
      </div>
      
      <div style="margin-bottom: 15px; padding-left: 25px; position: relative;">
        <span style="position: absolute; left: 0; color: #10b981; font-size: 18px;">🛠️</span>
        <strong style="color: #333;">Professional Tools</strong>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Access AI-powered mixing suggestions and collaboration tools</p>
      </div>
      
      <div style="margin-bottom: 0; padding-left: 25px; position: relative;">
        <span style="position: absolute; left: 0; color: #10b981; font-size: 18px;">📊</span>
        <strong style="color: #333;">Track Your Earnings</strong>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Comprehensive dashboard to monitor projects, earnings, and performance</p>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 40px 0 30px 0;">
      <a href="https://mixxclubonline.com/engineer-crm" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
        Complete Your Profile
      </a>
    </div>

    <!-- Support -->
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
        Questions about getting started? Contact our engineer support:
      </p>
      <p style="margin: 0; font-size: 14px;">
        <a href="mailto:support@mixxclubonline.com" style="color: #10b981; text-decoration: none; font-weight: bold;">📧 support@mixxclubonline.com</a>
      </p>
    </div>

  </div>
  
  <!-- Footer -->
  <div style="background: #2d3748; padding: 30px 20px; text-align: center; color: #a0aec0;">
    <p style="margin: 0 0 15px 0; font-size: 14px;">
      Follow us for industry news and community highlights:
    </p>
    <div style="margin-bottom: 20px;">
      <a href="#" style="color: #10b981; text-decoration: none; margin: 0 10px; font-size: 24px;">📸</a>
      <a href="#" style="color: #10b981; text-decoration: none; margin: 0 10px; font-size: 24px;">🐦</a>
      <a href="#" style="color: #10b981; text-decoration: none; margin: 0 10px; font-size: 24px;">🎵</a>
    </div>
    <p style="margin: 0; color: #718096; font-size: 12px;">
      © ${new Date().getFullYear()} Mixxclub Online. All rights reserved.
    </p>
    <p style="margin: 10px 0 0 0; font-size: 12px;">
      <a href="https://mixxclubonline.com" style="color: #10b981; text-decoration: none;">Visit Website</a> • 
      <a href="https://mixxclubonline.com/terms" style="color: #10b981; text-decoration: none;">Terms</a>
    </p>
  </div>
  
</body>
</html>
  `;
}