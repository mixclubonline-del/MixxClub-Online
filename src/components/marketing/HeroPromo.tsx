import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Music, Users, TrendingUp, Play, Sparkles } from 'lucide-react';

/**
 * REVOLUTIONARY HERO PROMO SECTION
 * High-impact visual that dominates above the fold
 * Used for landing page, social media hero, email campaigns
 */
export function HeroPromo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isAnimating, setIsAnimating] = useState(true);

    // Animated audio waveform background
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        let animationId: number;
        let time = 0;

        const animate = () => {
            // Clear canvas with gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
            gradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
            gradient.addColorStop(1, 'rgba(30, 41, 59, 0.95)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);

            // Draw animated waveform
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let x = 0; x < canvas.width / 2; x += 5) {
                const y =
                    Math.sin((x + time) * 0.02) * 15 +
                    Math.cos((x + time * 0.5) * 0.015) * 12 +
                    canvas.height / 4;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Secondary wave
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.2)';
            ctx.beginPath();
            for (let x = 0; x < canvas.width / 2; x += 5) {
                const y =
                    Math.sin((x + time * 0.7) * 0.02) * 10 +
                    Math.cos((x - time * 0.3) * 0.015) * 8 +
                    canvas.height / 4 + 20;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            time += 2;
            animationId = requestAnimationFrame(animate);
        };

        if (isAnimating) {
            animate();
        }

        return () => cancelAnimationFrame(animationId);
    }, [isAnimating]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8 },
        },
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
            {/* Animated canvas background */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 opacity-40"
                style={{ mixBlendMode: 'screen' }}
            />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-grid-white/5" />

            {/* Radial gradient overlays */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl opacity-40" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl opacity-40" />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center max-w-6xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div variants={itemVariants} className="mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full text-violet-300 text-sm font-medium">
                            <Sparkles className="w-4 h-4" />
                            🚀 Revolutionizing Music Collaboration
                        </div>
                    </motion.div>

                    {/* Main headline */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
                    >
                        <span className="bg-gradient-to-r from-violet-200 via-pink-200 to-violet-200 bg-clip-text text-transparent">
                            Your Sound.
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-pink-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                            Their Magic.
                        </span>
                        <br />
                        <span className="text-slate-400 text-5xl md:text-6xl lg:text-7xl">
                            Instant. Global. Connected.
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        variants={itemVariants}
                        className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
                    >
                        Connect with world-class audio engineers. Compete in epic mix battles. Build your sound—together.
                    </motion.p>

                    {/* Stats row */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-3 gap-4 md:gap-8 mb-12 max-w-2xl mx-auto"
                    >
                        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                            <div className="text-3xl md:text-4xl font-bold text-violet-400 mb-2">10K+</div>
                            <div className="text-sm text-slate-400">Musicians</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                            <div className="text-3xl md:text-4xl font-bold text-pink-400 mb-2">48h</div>
                            <div className="text-sm text-slate-400">Avg Turnaround</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                            <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">$500K+</div>
                            <div className="text-sm text-slate-400">Paid Out</div>
                        </div>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col md:flex-row gap-4 justify-center mb-12"
                    >
                        <button className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold rounded-lg overflow-hidden transition-all duration-300 hover:scale-105">
                            <span className="relative z-10 flex items-center gap-2 justify-center">
                                <Play className="w-5 h-5" />
                                Start Free Battle
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 transition-all duration-300 backdrop-blur-sm">
                            Watch Demo (2 min)
                        </button>
                    </motion.div>

                    {/* Feature highlights */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
                    >
                        {[
                            { icon: Zap, label: 'Instant Matching', desc: 'AI pairs you with perfect engineers' },
                            { icon: Music, label: 'Real-Time Collab', desc: 'Work together from anywhere' },
                            { icon: Users, label: 'Global Network', desc: 'Access thousands of creators' },
                            { icon: TrendingUp, label: 'Fair Pricing', desc: '$0 platform fee on Mixxclub Pro' },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
                            >
                                <feature.icon className="w-8 h-8 text-violet-400 mb-3 group-hover:scale-110 transition-transform" />
                                <h3 className="font-semibold text-white mb-1">{feature.label}</h3>
                                <p className="text-sm text-slate-400">{feature.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                    <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex items-start justify-center p-2">
                        <div className="w-1 h-2 bg-slate-400 rounded-full" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default HeroPromo;
