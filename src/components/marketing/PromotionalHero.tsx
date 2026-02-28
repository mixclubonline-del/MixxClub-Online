// ============= Full file contents =============

import { useState } from 'react';
import { Play, Zap, Music, Users, TrendingUp, Sparkles, ArrowRight, Award } from 'lucide-react';

/**
 * MIXCLUB PROMOTIONAL HERO SECTION
 * High-conversion landing page hero with animated elements
 * Optimized for: Homepage, social media embeds, email templates
 */
export function PromotionalHero() {
    const [activeTab, setActiveTab] = useState<'creators' | 'engineers'>('creators');

    const testimonials = [
        {
            name: 'Maya J.',
            role: 'Producer, Tokyo',
            image: '👩‍🎤',
            quote: 'Made $3K in my first month. Best decision ever.',
            stat: '$3K MRR',
        },
        {
            name: 'Alex R.',
            role: 'Engineer, LA',
            image: '👨‍💻',
            quote: 'Quit my job 6 months ago.',
            stat: 'Full-Time',
        },
        {
            name: 'Jordan T.',
            role: 'Artist, NYC',
            image: '🎵',
            quote: 'Pro mixes for $50. Would cost $500.',
            stat: '-90% Cost',
        },
    ];

    const features = [
        {
            icon: Zap,
            title: 'Instant Matching',
            description: 'AI pairs you with perfect collaborators',
            color: 'text-yellow-400',
        },
        {
            icon: Music,
            title: 'Real-Time Collab',
            description: 'Work together from anywhere on Earth',
            color: 'text-pink-400',
        },
        {
            icon: Users,
            title: 'Global Network',
            description: 'Access thousands of verified creators',
            color: 'text-cyan-400',
        },
        {
            icon: TrendingUp,
            title: 'Fair Pricing',
            description: '$0 platform fee. You keep 100%.',
            color: 'text-emerald-400',
        },
    ];

    const stats = [
        { number: '10K+', label: 'Creators' },
        { number: '48h', label: 'Avg Turnaround' },
        { number: '$500K+', label: 'Paid Out' },
        { number: '98%', label: 'Satisfaction' },
    ];

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient orbs */}
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-30" />

                {/* Grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* HERO SECTION */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
                {/* Badge */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full text-violet-300 text-sm font-medium">
                        <Sparkles className="w-4 h-4" />
                        🚀 Revolutionizing Music Collaboration
                    </div>
                </div>

                {/* Main headline */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-center mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-violet-200 via-pink-200 to-violet-200 bg-clip-text text-transparent">
                        Your Sound.
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-pink-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                        Their Magic.
                    </span>
                    <br />
                    <span className="text-slate-400 text-4xl sm:text-5xl md:text-6xl">
                        Instant. Global. Connected.
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg sm:text-xl md:text-2xl text-slate-300 text-center mb-8 max-w-3xl mx-auto leading-relaxed">
                    Connect with world-class audio engineers. Compete in epic mix battles. Build your sound—together.
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className="p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
                        >
                            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-1">
                                {stat.number}
                            </div>
                            <div className="text-xs md:text-sm text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <button className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-violet-600 text-white font-bold rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 shadow-2xl">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Play className="w-5 h-5" />
                            Start Free Battle
                        </span>
                    </button>

                    <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2">
                        Watch Demo <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Feature highlights grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="p-6 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                        >
                            <feature.icon className={`w-8 h-8 ${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
                            <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* COMPARISON TABS */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
                <h2 className="text-4xl font-bold text-center mb-12 text-white">
                    Built for <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">Everyone</span>
                </h2>

                {/* Tab buttons */}
                <div className="flex gap-4 mb-8 justify-center">
                    {['creators', 'engineers'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as typeof activeTab)}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === tab
                                    ? 'bg-gradient-to-r from-pink-600 to-violet-600 text-white'
                                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                }`}
                        >
                            {tab === 'creators' ? '🎤 Artists' : '🎚️ Engineers'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm p-8 md:p-12">
                    {activeTab === 'creators' ? (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-4">For Artists</h3>
                                <ul className="space-y-3">
                                    {[
                                        'Get professional mixes in 48 hours',
                                        'Pay only what you want ($50-500)',
                                        'Unlimited revisions included',
                                        'Battle for featured placement',
                                        'Connect with your perfect engineer',
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-slate-300">
                                            <Award className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-gradient-to-br from-pink-500/10 to-violet-500/10 rounded-lg p-6 border border-pink-500/20">
                                <div className="text-5xl font-black bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-4">
                                    Save 90%
                                </div>
                                <p className="text-slate-300 mb-4">
                                    Professional studio rates: $500-1000 per mix. Mixxclub: $50-150. Your choice.
                                </p>
                                <button className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-violet-600 text-white font-bold rounded-lg hover:scale-105 transition-transform">
                                    Get Your Mix Today
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-4">For Engineers</h3>
                                <ul className="space-y-3">
                                    {[
                                        'Earn $150-1000 per project',
                                        'Compete in battles for bigger payouts',
                                        'Work your own hours from home',
                                        'Build portfolio & get referrals',
                                        'Scale to full-time income',
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-slate-300">
                                            <TrendingUp className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-lg p-6 border border-emerald-500/20">
                                <div className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                                    $5K/mo
                                </div>
                                <p className="text-slate-300 mb-4">
                                    Average monthly income for top engineers. Work 20 hours/week. From anywhere.
                                </p>
                                <button className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold rounded-lg hover:scale-105 transition-transform">
                                    Start Earning Today
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TESTIMONIALS */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
                <h2 className="text-4xl font-bold text-center mb-12 text-white">
                    <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">Real Results.</span> Real People.
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, idx) => (
                        <div key={idx} className="p-6 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="text-4xl">{testimonial.image}</div>
                                <div>
                                    <p className="font-semibold text-white">{testimonial.name}</p>
                                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                                </div>
                            </div>
                            <p className="text-slate-300 mb-4 italic">"{testimonial.quote}"</p>
                            <div className="text-lg font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                                {testimonial.stat}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FINAL CTA */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center border-t border-white/10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready to <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">Change Your Game?</span>
                </h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                    These beats showcase Mixxclub's capabilities and populate the marketplace.
                </p>
                <button className="group px-12 py-5 bg-gradient-to-r from-pink-600 to-violet-600 text-white text-lg font-bold rounded-lg overflow-hidden transition-all duration-300 hover:scale-110 shadow-2xl">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Get Started Free <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
                <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex items-start justify-center p-2">
                    <div className="w-1 h-2 bg-slate-400 rounded-full animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export default PromotionalHero;