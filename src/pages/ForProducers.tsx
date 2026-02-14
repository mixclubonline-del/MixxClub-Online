import { PublicFooter } from '@/components/layouts/PublicFooter';
import {
    Disc3,
    Sparkles,
    ShoppingBag,
    BarChart3,
    Layers,
    DollarSign,
    TrendingUp,
    Globe,
    Music,
    Crown,
    Star,
    Zap,
    ArrowRight,
    Users,
    Package
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
import portalProducerImage from "@/assets/portal-producer.png";

// Reuse some promo images until producer-specific ones are created
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

const ForProducers = () => {
    const journeySteps: ShowcaseStep[] = [
        {
            image: artistUploadCloud,
            icon: Layers,
            stepNumber: 1,
            title: "Build Your Beat",
            description: "Create instrumentals in your DAW, then upload stems or bounces to your MixxClub catalog. Auto-tagged by genre, key, BPM, and mood.",
            stats: [
                { label: "Formats", value: "15+" },
                { label: "Auto-Tag", value: "AI" },
                { label: "Storage", value: "∞" }
            ],
            techDetails: ["Stem Upload", "AI Tagging", "BPM Detection", "Key Analysis"]
        },
        {
            image: artistAiAnalysis,
            icon: Sparkles,
            stepNumber: 2,
            title: "AI Catalog Enhancement",
            description: "Our AI enriches every beat with mood analysis, similar artist tags, and suggested use cases — making your catalog instantly searchable by artists.",
            stats: [
                { label: "Analysis", value: "<10s" },
                { label: "Tags", value: "30+" },
                { label: "Accuracy", value: "97%" }
            ],
            techDetails: ["Mood Detection", "Genre Match", "Vocal Space Analysis", "Market Fit Score"]
        },
        {
            image: artistEngineerMatch,
            icon: Globe,
            stepNumber: 3,
            title: "Global Storefront",
            description: "Your beats go live in the MixxClub marketplace — exposed to thousands of artists actively seeking production. Set your prices, licensing terms, and exclusivity.",
            stats: [
                { label: "Active Artists", value: "10K+" },
                { label: "Daily Views", value: "50K+" },
                { label: "Regions", value: "Global" }
            ],
            techDetails: ["Custom Pricing", "License Tiers", "Exclusive Deals", "Featured Placement"]
        },
        {
            image: artistLiveCollab,
            icon: Users,
            stepNumber: 4,
            title: "Artist Collaboration",
            description: "When an artist picks your beat, collaborate in real-time. Share stems, adjust arrangements, and co-produce — all within MixxClub's live workspace.",
            stats: [
                { label: "Latency", value: "<50ms" },
                { label: "Video", value: "HD" },
                { label: "DAW Sync", value: "Real-Time" }
            ],
            techDetails: ["Live Stems", "Arrangement Editing", "Version Control", "Artist Chat"]
        },
        {
            image: artistDelivery,
            icon: DollarSign,
            stepNumber: 5,
            title: "Instant Payouts",
            description: "Get paid the moment a license is purchased. Track every sale, download, and stream. Withdrawals hit your account within 24 hours.",
            stats: [
                { label: "Payout Speed", value: "24h" },
                { label: "Revenue Split", value: "80%+" },
                { label: "Payment Methods", value: "10+" }
            ],
            techDetails: ["Instant Sales", "License Tracking", "Revenue Dashboard", "Tax Reports"]
        },
        {
            image: artistReleaseGrowth,
            icon: TrendingUp,
            stepNumber: 6,
            title: "Scale Your Brand",
            description: "Build your producer brand with analytics, playlist placements, and repeat clients. Our AI recommends production styles trending in your genre.",
            stats: [
                { label: "Analytics", value: "Real-Time" },
                { label: "Trend Intel", value: "AI" },
                { label: "Repeat Rate", value: "67%" }
            ],
            techDetails: ["Brand Analytics", "Trend Forecasting", "Client CRM", "Placement Support"]
        }
    ];

    const crmFeatures = [
        {
            image: artistCrmDashboard,
            icon: BarChart3,
            title: "Producer Dashboard",
            subtitle: "Revenue Command Center",
            description: "See every beat sale, license, and collaboration fee in one view. Track monthly revenue, top-performing beats, and growth trajectory.",
            stats: [
                { label: "Metrics", value: "40+" },
                { label: "Revenue Streams", value: "5" },
                { label: "Forecasting", value: "AI" }
            ],
            techDetails: ["Live Revenue", "Beat Analytics", "Trend Insights", "Goal Tracking"]
        },
        {
            image: artistCrmSessions,
            icon: Package,
            title: "Beat Catalog Manager",
            subtitle: "Your Digital Store",
            description: "Manage your entire catalog — set pricing tiers, exclusive/non-exclusive options, bulk deals, and seasonal promotions. Organize by genre, mood, and BPM.",
            stats: [
                { label: "Beats", value: "Unlimited" },
                { label: "License Types", value: "6" },
                { label: "Bulk Deals", value: "Custom" }
            ],
            techDetails: ["Smart Pricing", "License Builder", "Promo Codes", "Featured Rotation"]
        },
        {
            image: artistCrmProjects,
            icon: Music,
            title: "Collaboration Pipeline",
            subtitle: "From Demo to Drop",
            description: "Track every active collaboration from initial artist interest to final delivery. Manage revisions, approvals, and deadlines effortlessly.",
            stats: [
                { label: "Active Projects", value: "Unlimited" },
                { label: "Stages", value: "Auto-Flow" },
                { label: "Deliverables", value: "Tracked" }
            ],
            techDetails: ["Pipeline View", "Revision History", "Deadline Alerts", "Auto-Delivery"]
        },
        {
            image: artistCrmCommunity,
            icon: Crown,
            title: "Producer Leaderboard",
            subtitle: "Rise Through the Ranks",
            description: "Earn recognition through sales, collaborations, and community contributions. Unlock badges, featured placements, and exclusive opportunities.",
            stats: [
                { label: "Badges", value: "50+" },
                { label: "Tiers", value: "5" },
                { label: "Rewards", value: "Monthly" }
            ],
            techDetails: ["XP System", "Tier Progression", "Featured Beats", "Exclusive Events"]
        }
    ];

    const stats = [
        { value: "$3,800", label: "Avg Monthly Earnings" },
        { value: "10K+", label: "Active Artists Shopping" },
        { value: "80%+", label: "Revenue to You" },
        { value: "24h", label: "Payout Speed" },
    ];

    return (
        <LandingPortal backgroundImage={portalProducerImage} variant="producer">
            <BackButton />
            {/* Founding Producer Banner */}
            <FoundingBanner
                icon={<Crown className="w-6 h-6 text-amber-400" />}
                text="🔥 Founding Producer Program - First 75 get"
                highlight="lifetime featured placement"
                badge="41 spots left"
                variant="producer"
            />

            {/* Hero Section */}
            <PortalHero
                badge={{ icon: <Disc3 className="w-4 h-4" />, text: "For Producers" }}
                title="Your Beats Deserve a Global Stage"
                subtitle="Build your catalog, license your sound, and earn from every beat — with AI-powered tools and a marketplace of 10,000+ artists."
                stats={stats}
                primaryAction={{
                    text: "Start Selling Beats",
                    icon: <Zap className="w-5 h-5" />,
                    href: "/auth?mode=signup&role=producer"
                }}
                secondaryAction={{
                    text: "Explore the Platform",
                    icon: <ArrowRight className="w-5 h-5" />,
                    href: "/showcase"
                }}
                variant="producer"
            />

            {/* The Journey Section */}
            <ShowcaseJourney
                badge={{ icon: <Star className="w-4 h-4" />, text: "From Beat to Bank" }}
                title="Your Production Pipeline"
                subtitle="Six powerful steps from creating your beat to scaling your producer brand."
                steps={journeySteps}
                variant="producer"
            />

            {/* CRM/Business Tools Section */}
            <section className="py-24 px-6 relative">
                <div className="container mx-auto max-w-6xl">
                    <ScrollRevealSection className="text-center mb-16">
                        <Badge
                            variant="outline"
                            className="mb-4 bg-background/30 backdrop-blur-md border-white/20"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span className="ml-2">Your Beat Empire</span>
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">This is YOUR Producer CRM</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to manage your catalog, clients, and career growth.
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
                icon={<Crown className="w-10 h-10" />}
                title="Ready to Monetize Your Sound?"
                subtitle="Join the producers already earning on MixClub."
                cta={{ text: "Start Free Today", href: "/auth?mode=signup&role=producer" }}
                variant="producer"
                disclaimer="No credit card required • Keep 80%+ of earnings • Instant payouts"
            />
      <PublicFooter />
        </LandingPortal>
    );
};

export default ForProducers;
