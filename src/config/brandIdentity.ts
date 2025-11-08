/**
 * MIXCLUB BRAND IDENTITY SYSTEM
 * Complete visual language for promotional materials
 */

export const brandIdentity = {
    // PRIMARY COLORS - VIBRANT & ENERGETIC
    colors: {
        primary: {
            violet: '#7c3aed', // Vibrant purple
            pink: '#ec4899', // Hot pink
            blue: '#3b82f6', // Bright blue
        },
        secondary: {
            emerald: '#10b981', // Success green
            amber: '#f59e0b', // Warning/premium gold
            cyan: '#06b6d4', // Cyberpunk cyan
        },
        neutrals: {
            slate950: '#030712',
            slate900: '#0f172a',
            slate800: '#1e293b',
            slate400: '#94a3b8',
            white: '#ffffff',
        },
        gradients: {
            heroGradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #06b6d4 100%)',
            ctaGradient: 'linear-gradient(135deg, #ec4899 0%, #7c3aed 100%)',
            successGradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        },
    },

    // TYPOGRAPHY - BOLD & MODERN
    typography: {
        fonts: {
            display: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        sizes: {
            h1: { size: '72px', weight: 900, lineHeight: 1.1 },
            h2: { size: '56px', weight: 800, lineHeight: 1.2 },
            h3: { size: '40px', weight: 700, lineHeight: 1.3 },
            h4: { size: '28px', weight: 600, lineHeight: 1.4 },
            body: { size: '16px', weight: 400, lineHeight: 1.6 },
            caption: { size: '12px', weight: 500, lineHeight: 1.5 },
        },
    },

    // BUTTON STYLES - CTA OPTIMIZED
    buttons: {
        primary: {
            bg: 'linear-gradient(135deg, #ec4899 0%, #7c3aed 100%)',
            text: '#ffffff',
            padding: '16px 32px',
            radius: '8px',
            fontSize: '16px',
            weight: 700,
            shadow: '0 20px 40px rgba(236, 72, 153, 0.3)',
            hover: {
                transform: 'scale(1.05)',
                shadow: '0 25px 50px rgba(236, 72, 153, 0.4)',
            },
        },
        secondary: {
            bg: 'rgba(255, 255, 255, 0.1)',
            text: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            padding: '14px 30px',
            radius: '8px',
            fontSize: '16px',
            weight: 600,
        },
    },

    // MESSAGING FRAMEWORK
    messaging: {
        tagline: 'Your Sound. Their Magic. Your Career.',
        subheadlines: [
            'Connect with world-class engineers. Instantly.',
            'From bedroom to breakthrough. In 48 hours.',
            'Global studio. Zero commute. Infinite opportunity.',
            '10,000 creators. Millions in payouts. You\'re next.',
        ],
        ctas: [
            'Start Free Battle',
            'Join the Revolution',
            'Unlock Your Potential',
            'Get Started Today',
            'See What\'s Possible',
        ],
    },

    // VISUAL PATTERNS
    patterns: {
        // Grid background (40x40 repeating)
        gridBackground: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,

        // Gradient orbs for background
        orbGradient: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
    },

    // SOCIAL MEDIA SPECS
    socialMedia: {
        instagram: {
            postSize: '1080x1080px',
            storySize: '1080x1920px',
            reelSize: '1080x1920px',
            avgEngagementRate: 0.05,
        },
        tiktok: {
            videoSize: '1080x1920px',
            maxDuration: '180s',
            targetAvgViews: '500k',
        },
        youtube: {
            thumbnailSize: '1280x720px',
            bannerSize: '2560x1440px',
            targetMinin3Min: '3 minutes',
        },
        linkedin: {
            postSize: '1200x627px',
            videoSize: '1920x1080px',
        },
    },

    // EMAIL DESIGN SPECS
    email: {
        width: '600px',
        headerHeight: '300px',
        ctaButtonWidth: '250px',
        backgroundColor: '#030712',
        textColor: '#e2e8f0',
        accentColor: '#ec4899',
    },

    // ANIMATION TOKENS
    animations: {
        fast: '150ms ease-out',
        normal: '300ms ease-out',
        slow: '600ms ease-out',
        slowest: '1000ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    },

    // SOCIAL PROOF MESSAGING
    socialProof: {
        stats: [
            '10,000+ creators',
            '$500K+ paid out',
            '48h avg turnaround',
            '98% satisfaction rate',
            '500+ battles/day',
        ],
        testimonials: [
            {
                name: 'Maya J.',
                role: 'Producer, Tokyo',
                quote: 'Made $3K in my first month. Best decision ever.',
            },
            {
                name: 'Alex R.',
                role: 'Engineer, LA',
                quote: 'Quit my job. Now I work with artists worldwide.',
            },
            {
                name: 'Jordan T.',
                role: 'Artist, NYC',
                quote: 'Got professional mixes for $50. Would cost $500 elsewhere.',
            },
        ],
    },

    // EMERGENCY MESSAGING (Crisis comms)
    crisisMessaging: {
        downtime: 'We\'re back. We\'re sorry. $50 credit to everyone.',
        delay: 'Your trust is sacred. Extra $100 added. No questions.',
        competitor: 'First. Still best. 10K creators can\'t be wrong.',
    },

    // PERFORMANCE TARGETS
    targets: {
        cpaCost: '$5-15',
        ltv: '$200-500',
        ltvToCpaRatio: '30x',
        viralCoefficient: '2.0+',
        emailOpenRate: '35%',
        emailCtr: '8%',
        videoCompletion: '50%',
        socialEngagement: '5%',
        conversionRate: '2-5%',
    },
};

/**
 * HERO COPYWRITING FRAMEWORK
 * 5-layer emotional hook
 */
export const copyframework = {
    // Layer 1: PROBLEM
    problem: 'Artists waste months finding engineers. Engineers hunt for clients.',

    // Layer 2: TENSION
    tension: 'Every month of delays costs thousands in lost opportunity.',

    // Layer 3: SOLUTION
    solution: 'MixClub matches you instantly. 48-hour turnarounds. Fair pricing.',

    // Layer 4: PROOF
    proof: '10,000 creators. $500K paid. 98% satisfaction.',

    // Layer 5: CALL TO ACTION
    cta: 'Your breakthrough is 60 seconds away.',

    // BENEFIT LADDER
    benefits: {
        immediate: 'Get professional mixes in 48 hours',
        shortTerm: 'Earn $500-1000/month as engineer/artist',
        longTerm: 'Build full-time career in music production',
        transformational: 'Financial freedom. Creative fulfillment. Global network.',
    },
};

/**
 * AD COPY SWIPES
 * Proven high-performing headlines
 */
export const adCopySwipes = {
    headlines: [
        // Curiosity angle
        '🎵 This Engineer Made $500 While We Slept',
        '🎵 The $5 Secret That Turned Into $5,000',
        '🎵 10,000 Creators Are Doing This. You?',

        // Pain angle
        '🎵 Tired of Hunting for Engineers? We Found 10,000.',
        '🎵 Your Mixes Are Too Good For Mediocre Mastering',
        '🎵 Stop Waiting. Start Earning. Today.',

        // Desire angle
        '🎵 Work With World-Class Engineers (Without Compromise)',
        '🎵 Turn Your Bedroom Into a $5K/Month Studio',
        '🎵 The Global Collaboration Platform Artists Deserve',

        // FOMO angle
        '🎵 Missed Out? 127 New Creators Just Joined',
        '🎵 Last Spot in Today\'s Premier Engineer Queue',
        '🎵 High-Skill Battles Filling Fast (Only 3 Slots Left)',
    ],

    subheadlines: [
        'Instant matching. 48-hour delivery. Zero BS.',
        'Join thousands already earning while they sleep.',
        'Professional results. Fair pricing. Your terms.',
        'From side hustle to full-time income in 30 days.',
        'The marketplace that actually works for creators.',
    ],

    callToActions: [
        'Start Your First Battle Free',
        'Join 10K+ Creators Today',
        'See What\'s Possible',
        'Claim Your Unique Link',
        'Get Started (Takes 2 Min)',
    ],
};

/**
 * VISUAL ASSET SPECS FOR DESIGNERS
 */
export const designSpecs = {
    // Banner Sizes (Web)
    banners: {
        leaderboard: '728x90px',
        mediumRectangle: '300x250px',
        wideSkyscraper: '160x600px',
        halfPage: '300x600px',
    },

    // Video Specs
    video: {
        heroVideo: {
            duration: '60s',
            resolution: '1080p',
            aspectRatio: '16:9',
            framerate: '30fps',
        },
        socialReels: {
            duration: '15-30s',
            resolution: '1080p',
            aspectRatio: '9:16',
            format: 'MP4',
        },
    },

    // Icon System
    icons: {
        primary: 'Lucide React',
        style: 'Minimal, modern, 2px stroke weight',
        sizes: ['16px', '24px', '32px', '48px'],
    },

    // Image Requirements
    images: {
        userProfile: {
            size: '400x400px',
            format: 'JPG/PNG',
            quality: 'High-res faces, professional lighting',
        },
        productScreenshot: {
            size: '1920x1080px',
            format: 'PNG',
            quality: 'Clean UI, dark theme preferred',
        },
        beforeAfterAudio: {
            size: '1200x628px',
            format: 'PNG',
            quality: 'Waveform visualization, clear diff',
        },
    },
};

export default brandIdentity;
