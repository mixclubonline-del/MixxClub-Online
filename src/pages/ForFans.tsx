import { SEOHead } from '@/components/SEOHead';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import {
    Heart,
    Sparkles,
    Trophy,
    Radio,
    Gift,
    Users,
    TrendingUp,
    Globe,
    Music,
    Crown,
    Star,
    Zap,
    ArrowRight,
    Ticket,
    MessageCircle,
    Bell
} from "lucide-react";
import { LandingPortal } from "@/components/landing/LandingPortal";
import { PortalHero } from "@/components/landing/PortalHero";
import { ShowcaseJourney, ShowcaseStep } from "@/components/landing/ShowcaseJourney";
import { ShowcaseFeature } from "@/components/services/ShowcaseFeature";
import { PortalInvitation } from "@/components/landing/PortalInvitation";
import { FoundingBanner } from "@/components/landing/FoundingBanner";
import { ScrollRevealSection } from "@/components/landing/ScrollRevealSection";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/navigation/BackButton";
import portalFanImage from "@/assets/portal-fan.png";

// Reuse promo images temporarily
import artistUploadCloud from "@/assets/promo/artist-upload-cloud.jpg";
import artistAiAnalysis from "@/assets/promo/artist-ai-analysis.jpg";
import artistEngineerMatch from "@/assets/promo/artist-engineer-match.jpg";
import artistLiveCollab from "@/assets/promo/artist-live-collab.jpg";
import artistDelivery from "@/assets/promo/artist-delivery.jpg";
import artistReleaseGrowth from "@/assets/promo/artist-release-growth.jpg";

// CRM images (reused temporarily)
import artistCrmDashboard from "@/assets/promo/artist-crm-dashboard.jpg";
import artistCrmSessions from "@/assets/promo/artist-crm-sessions.jpg";
import artistCrmProjects from "@/assets/promo/artist-crm-projects.jpg";
import artistCrmCommunity from "@/assets/promo/artist-crm-community.jpg";

const ForFans = () => {
    const journeySteps: ShowcaseStep[] = [
        {
            image: artistUploadCloud,
            icon: Radio,
            stepNumber: 1,
            title: "Discover New Music",
            description: "Our AI curates a personalized feed of underground, emerging, and rising artists based on your listening DNA. Hear them before anyone else.",
            stats: [
                { label: "New Daily", value: "500+" },
                { label: "Genres", value: "100+" },
                { label: "AI Accuracy", value: "95%" }
            ],
            techDetails: ["Neural Taste Map", "Genre Radar", "Mood Matching", "Deep Discovery"]
        },
        {
            image: artistAiAnalysis,
            icon: Heart,
            stepNumber: 2,
            title: "Follow & Support Early",
            description: "Back artists when they're still underground. Your early support gets timestamped on the blockchain — proving you were Day 1 before the world caught on.",
            stats: [
                { label: "Timestamp", value: "On-Chain" },
                { label: "Proof", value: "Permanent" },
                { label: "Status", value: "Day 1 OG" }
            ],
            techDetails: ["Blockchain Proof", "Day 1 NFT", "Support History", "Fan Score"]
        },
        {
            image: artistEngineerMatch,
            icon: Users,
            stepNumber: 3,
            title: "Join Fan Communities",
            description: "Get into artist-specific rooms, fan circles, and listening parties. Connect with people who share your exact taste — not just a genre.",
            stats: [
                { label: "Communities", value: "5,000+" },
                { label: "Listening Parties", value: "Daily" },
                { label: "Fan Circles", value: "Private" }
            ],
            techDetails: ["Artist Rooms", "Live Listening", "Fan Circles", "Taste Neighborhoods"]
        },
        {
            image: artistLiveCollab,
            icon: Ticket,
            stepNumber: 4,
            title: "Unlock Exclusive Access",
            description: "Earn access to exclusive drops, early releases, behind-the-scenes content, and virtual studio sessions as your Fan Score grows.",
            stats: [
                { label: "Exclusives", value: "Weekly" },
                { label: "BTS Content", value: "✓" },
                { label: "Virtual Sessions", value: "Live" }
            ],
            techDetails: ["Early Releases", "Studio Access", "Exclusive Drops", "Fan-Only Content"]
        },
        {
            image: artistDelivery,
            icon: Gift,
            stepNumber: 5,
            title: "Earn Rewards",
            description: "Your engagement = rewards. Stream, share, attend events, and refer friends to earn points redeemable for merch, tickets, and exclusive experiences.",
            stats: [
                { label: "Reward Types", value: "20+" },
                { label: "Redemption", value: "Instant" },
                { label: "Perks", value: "Exclusive" }
            ],
            techDetails: ["Stream Rewards", "Share Bonuses", "Event Points", "Referral Credits"]
        },
        {
            image: artistReleaseGrowth,
            icon: TrendingUp,
            stepNumber: 6,
            title: "Grow With Your Artists",
            description: "As your favorite artists blow up, your Day 1 status unlocks bigger rewards — VIP tickets, signed merch, personal shoutouts, and lifetime access.",
            stats: [
                { label: "VIP Perks", value: "Tiered" },
                { label: "Loyalty", value: "Rewarded" },
                { label: "Growth Bonus", value: "10x" }
            ],
            techDetails: ["VIP Tiers", "Growth Multipliers", "Loyalty Rewards", "Legacy Status"]
        }
    ];

    const crmFeatures = [
        {
            image: artistCrmDashboard,
            icon: Globe,
            title: "Fan Dashboard",
            subtitle: "Your Music Universe",
            description: "See your entire listening world — followed artists, upcoming releases, fan score, reward balance, and community activity in one gorgeous interface.",
            stats: [
                { label: "Artists Tracked", value: "Unlimited" },
                { label: "Release Alerts", value: "Instant" },
                { label: "Fan Score", value: "Real-Time" }
            ],
            techDetails: ["Release Calendar", "Fan Score", "Reward Balance", "Activity Feed"]
        },
        {
            image: artistCrmSessions,
            icon: Bell,
            title: "Drop Alerts & Releases",
            subtitle: "Never Miss a Beat",
            description: "Get notified the instant your favorite artists drop new music, announce shows, or open exclusive fan experiences. Customized by artist tier.",
            stats: [
                { label: "Alert Speed", value: "<1min" },
                { label: "Channels", value: "Push/Email/SMS" },
                { label: "Custom Filters", value: "✓" }
            ],
            techDetails: ["Instant Alerts", "Priority Queue", "Custom Filters", "Snooze Options"]
        },
        {
            image: artistCrmProjects,
            icon: MessageCircle,
            title: "Artist Connections",
            subtitle: "Get Closer Than Ever",
            description: "Send direct messages to artists in your circle, vote on their next single artwork, participate in creative decisions, and attend virtual meet & greets.",
            stats: [
                { label: "DM Access", value: "Tiered" },
                { label: "Voting", value: "Weekly" },
                { label: "Meet & Greets", value: "Monthly" }
            ],
            techDetails: ["Fan Mail", "Creative Voting", "Virtual M&G", "Artist Q&A"]
        },
        {
            image: artistCrmCommunity,
            icon: Trophy,
            title: "Achievement Wall",
            subtitle: "Flex Your Fandom",
            description: "Collect badges, NFT moments, and fan milestones. Your support history is your trophy case — from first listen to VIP status.",
            stats: [
                { label: "Achievements", value: "200+" },
                { label: "Collectibles", value: "Rare" },
                { label: "Leaderboard", value: "Global" }
            ],
            techDetails: ["Badge Collection", "NFT Moments", "Fan Leaderboard", "Milestone Rewards"]
        }
    ];

    const stats = [
        { value: "500+", label: "New Artists Daily" },
        { value: "Day 1", label: "OG Status on Blockchain" },
        { value: "10x", label: "Growth Reward Multiplier" },
        { value: "Free", label: "To Start" },
    ];

    return (
        <>
            <SEOHead
                title="For Fans"
                description="Discover underground artists before the world catches on. Support early, earn Day 1 OG status, collect rewards, and shape the music you love."
                keywords="music fans, discover artists, support musicians, fan rewards, music discovery platform"
            />
            <LandingPortal backgroundImage={portalFanImage} variant="fan">
            <BackButton />
            {/* Founding Fan Banner */}
            <FoundingBanner
                icon={<Heart className="w-6 h-6 text-rose-400" />}
                text="💎 Founding Fan Program - First 200 get"
                highlight="permanent Day 1 OG status"
                badge="127 spots left"
                variant="fan"
            />

            {/* Hero Section */}
            <PortalHero
                badge={{ icon: <Heart className="w-4 h-4" />, text: "For Fans" }}
                title="Be Day 1. Get Rewarded Forever."
                subtitle="Discover artists before they blow up, earn blockchain-verified OG status, and unlock exclusive rewards as they rise."
                stats={stats}
                primaryAction={{
                    text: "Start Discovering Free",
                    icon: <Zap className="w-5 h-5" />,
                    href: "/auth?mode=signup&role=fan"
                }}
                secondaryAction={{
                    text: "See What's Playing",
                    icon: <ArrowRight className="w-5 h-5" />,
                    href: "/showcase"
                }}
                variant="fan"
            />

            {/* The Journey Section */}
            <ShowcaseJourney
                badge={{ icon: <Star className="w-4 h-4" />, text: "Your Fan Journey" }}
                title="From Listener to Legend"
                subtitle="Six powerful ways to engage with the music and artists you love."
                steps={journeySteps}
                variant="fan"
            />

            {/* Fan Features Section */}
            <section className="py-24 px-6 relative">
                <div className="container mx-auto max-w-6xl">
                    <ScrollRevealSection className="text-center mb-16">
                        <Badge
                            variant="outline"
                            className="mb-4 bg-background/30 backdrop-blur-md border-white/20"
                        >
                            <Trophy className="w-4 h-4" />
                            <span className="ml-2">Your Fan HQ</span>
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">This is YOUR Fan Hub</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to discover, support, and grow with the artists you love.
                        </p>
                    </ScrollRevealSection>

                    <div className="space-y-24">
                        {crmFeatures.map((feature, index) => (
                            <ShowcaseFeature
                                key={feature.title}
                                {...feature}
                                reversed={index % 2 !== 0}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <PortalInvitation
                icon={<Heart className="w-10 h-10" />}
                title="Ready to Be Day 1?"
                subtitle="Join the fans who discover and support the next generation of music."
                cta={{ text: "Start Free Today", href: "/auth?mode=signup&role=fan" }}
                variant="fan"
                disclaimer="Always free • Blockchain-verified OG status • Exclusive rewards"
            />
      <PublicFooter />
        </LandingPortal>
        </>
    );
};

export default ForFans;
