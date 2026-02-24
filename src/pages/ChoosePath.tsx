/**
 * Choose Your Path — Cinematic Role Discovery
 * 
 * Full dream-sequence experience: animated orbs, cinematic reveals,
 * role-specific glow storms, and premium hover-state transitions.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic2, Headphones, Disc3, Heart, ArrowRight, Sparkles, Zap, Crown, Star, Rocket } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { BackButton } from '@/components/navigation/BackButton';

import jaxImage from '@/assets/characters/jax_original.png';
import jaxVideo from '@/assets/videos/jax_video.mp4';
import rellImage from '@/assets/characters/rell_original.png';
import rellVideo from '@/assets/videos/rell_video.mp4';
import novaImage from '@/assets/characters/nova_original.png';
// Nova doesn't have a generated video sequence yet, she sits in the crowd!

type PathRole = 'producer' | 'artist' | 'engineer' | 'fan';

interface PathOption {
    id: PathRole;
    title: string;
    subtitle: string;
    tagline: string;
    description: string;
    icon: React.ReactNode;
    accentHsl: string;
    gradient: string;
    route: string;
    keyHint: string;
    stat: { value: string; label: string };
    particles: string;
    image?: string;
    video?: string;
}

const pathOptions: PathOption[] = [
    {
        id: 'producer',
        title: 'Producer',
        subtitle: 'Craft & Sell Beats',
        tagline: 'Your sound. Your empire.',
        description: 'Build your catalog, license your beats globally, and earn from every placement. AI-powered tools amplify your reach.',
        icon: <Disc3 className="w-7 h-7" />,
        accentHsl: '36 95% 55%',
        gradient: 'from-amber-500/80 via-orange-600/60 to-yellow-500/40',
        route: '/for-producers',
        keyHint: '1',
        stat: { value: '$3,800', label: '/mo avg' },
        particles: 'bg-amber-400',
    },
    {
        id: 'artist',
        title: 'Artist',
        subtitle: 'Create & Release',
        tagline: 'From bedroom to billboard.',
        description: 'Upload your raw recordings, get matched with world-class engineers, and release radio-ready hits to every platform.',
        icon: <Mic2 className="w-7 h-7" />,
        accentHsl: '280 65% 60%',
        gradient: 'from-purple-500/80 via-violet-600/60 to-fuchsia-500/40',
        route: '/for-artists',
        keyHint: '2',
        stat: { value: '10K+', label: 'releases' },
        particles: 'bg-purple-400',
        image: jaxImage,
        video: jaxVideo,
    },
    {
        id: 'engineer',
        title: 'Engineer',
        subtitle: 'Mix & Master',
        tagline: 'Get paid for your ears.',
        description: 'Offer mixing, mastering, and consulting services. 10 revenue streams, automatic client matching, and industry-leading splits.',
        icon: <Headphones className="w-7 h-7" />,
        accentHsl: '190 95% 50%',
        gradient: 'from-cyan-500/80 via-teal-600/60 to-blue-500/40',
        route: '/for-engineers',
        keyHint: '3',
        stat: { value: '85%', label: 'rev split' },
        particles: 'bg-cyan-400',
        image: rellImage,
        video: rellVideo,
    },
    {
        id: 'fan',
        title: 'Fan',
        subtitle: 'Discover & Support',
        tagline: 'Be Day 1. Get rewarded.',
        description: 'Follow artists before they blow up, earn blockchain-verified OG status, and unlock exclusive rewards as they rise.',
        icon: <Heart className="w-7 h-7" />,
        accentHsl: '340 75% 55%',
        gradient: 'from-rose-500/80 via-pink-600/60 to-red-500/40',
        route: '/for-fans',
        keyHint: '4',
        stat: { value: 'Free', label: 'forever' },
        particles: 'bg-rose-400',
        image: novaImage,
    },
];

// Generate particles once
const generateParticles = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        duration: 10 + Math.random() * 15,
        delay: Math.random() * 10,
        drift: -30 + Math.random() * 60,
    }));

const ChoosePath = () => {
    const navigate = useNavigate();
    const [hoveredRole, setHoveredRole] = useState<PathRole | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const particles = useMemo(() => generateParticles(40), []);

    // Reveal sequence
    useEffect(() => {
        const timer = setTimeout(() => setIsRevealed(true), 200);
        return () => clearTimeout(timer);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const keyMap: Record<string, PathRole> = { '1': 'producer', '2': 'artist', '3': 'engineer', '4': 'fan' };
            const role = keyMap[e.key];
            if (role) {
                const option = pathOptions.find(r => r.id === role);
                if (option) navigate(option.route);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [navigate]);

    const activeOption = hoveredRole ? pathOptions.find(r => r.id === hoveredRole) : null;

    const handleRoleClick = useCallback((route: string) => {
        navigate(route);
    }, [navigate]);

    return (
        <>
            <SEOHead
                title="Choose Your Path"
                description="Pick your role in MixxClub: Producer, Artist, Engineer, or Fan. Start your music journey today."
                keywords="choose role, music career path, artist signup, engineer signup, producer signup, fan signup"
            />

            <div className="min-h-[100svh] relative overflow-hidden bg-[#050510] flex flex-col items-center justify-center px-4 py-12">
                <BackButton />

                {/* === BACKGROUND LAYER === */}
                {/* Deep space gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,80,200,0.15),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_120%,rgba(0,180,220,0.08),transparent)]" />

                {/* Animated orb — reacts to hovered role */}
                <motion.div
                    className="absolute w-[700px] h-[700px] rounded-full blur-[160px] opacity-40 pointer-events-none"
                    animate={{
                        x: hoveredRole === 'producer' ? '-15%' : hoveredRole === 'fan' ? '15%' : '0%',
                        y: hoveredRole === 'engineer' ? '10%' : hoveredRole === 'artist' ? '-10%' : '0%',
                        background: activeOption
                            ? `radial-gradient(circle, hsl(${activeOption.accentHsl} / 0.5) 0%, transparent 70%)`
                            : 'radial-gradient(circle, rgba(120,80,200,0.2) 0%, transparent 70%)',
                    }}
                    transition={{ type: 'spring', stiffness: 50, damping: 30 }}
                    style={{ top: '30%', left: '30%' }}
                />

                {/* Secondary pulse orb */}
                <motion.div
                    className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-25 pointer-events-none"
                    animate={{
                        scale: [1, 1.2, 1],
                        background: activeOption
                            ? `radial-gradient(circle, hsl(${activeOption.accentHsl} / 0.4) 0%, transparent 70%)`
                            : 'radial-gradient(circle, rgba(0,180,220,0.15) 0%, transparent 70%)',
                    }}
                    transition={{ scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }, background: { duration: 0.6 } }}
                    style={{ bottom: '20%', right: '20%' }}
                />

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {particles.map(p => (
                        <motion.div
                            key={p.id}
                            className={`absolute rounded-full ${activeOption ? activeOption.particles : 'bg-white'} opacity-0`}
                            style={{
                                left: `${p.x}%`,
                                width: p.size,
                                height: p.size,
                            }}
                            animate={{
                                y: ['100vh', '-10vh'],
                                x: [0, p.drift],
                                opacity: [0, 0.5, 0.3, 0],
                            }}
                            transition={{
                                duration: p.duration,
                                repeat: Infinity,
                                ease: 'linear',
                                delay: p.delay,
                            }}
                        />
                    ))}
                </div>

                {/* Grid lines overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* === CONTENT LAYER === */}
                <motion.div
                    className="relative z-10 w-full max-w-6xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Cinematic Title Sequence */}
                    <div className="text-center mb-14">
                        {/* Top-label badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="mg-pill mb-6"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-xs font-medium tracking-widest uppercase text-white/60">Your Journey Starts Here</span>
                        </motion.div>

                        <motion.h1
                            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <motion.span
                                className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60"
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                            >
                                Choose
                            </motion.span>
                            <motion.span
                                className="block mt-1"
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.65, type: 'spring', stiffness: 100 }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={hoveredRole || 'default'}
                                        className="bg-clip-text text-transparent"
                                        style={{
                                            backgroundImage: activeOption
                                                ? `linear-gradient(135deg, hsl(${activeOption.accentHsl}), hsl(${activeOption.accentHsl} / 0.6))`
                                                : 'linear-gradient(135deg, hsl(280 65% 60%), hsl(190 95% 50%))',
                                        }}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        Your Path
                                    </motion.span>
                                </AnimatePresence>
                            </motion.span>
                        </motion.h1>

                        <motion.p
                            className="text-base sm:text-lg text-white/40 max-w-xl mx-auto leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            Every lane hits different. Pick yours and we'll show you exactly how MixxClub was built for you.
                        </motion.p>
                    </div>

                    {/* === ROLE CARDS === */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                        {pathOptions.map((role, index) => (
                            <motion.button
                                key={role.id}
                                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                animate={isRevealed ? { opacity: 1, y: 0, scale: 1 } : {}}
                                transition={{ delay: 0.6 + index * 0.12, type: 'spring', stiffness: 80, damping: 20 }}
                                onClick={() => handleRoleClick(role.route)}
                                onMouseEnter={() => setHoveredRole(role.id)}
                                onMouseLeave={() => setHoveredRole(null)}
                                className="group relative text-left rounded-2xl overflow-hidden transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                                style={{
                                    transform: hoveredRole === role.id ? 'translateY(-6px)' : 'translateY(0)',
                                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                }}
                            >
                                {/* Card background glow */}
                                <div
                                    className="absolute inset-0 transition-opacity duration-500"
                                    style={{
                                        background: `radial-gradient(ellipse at 50% 0%, hsl(${role.accentHsl} / ${hoveredRole === role.id ? '0.2' : '0.04'}) 0%, transparent 70%)`,
                                        opacity: hoveredRole === role.id ? 1 : 0.5,
                                    }}
                                />

                                {/* Glass surface — mg-panel base */}
                                <div
                                    className="mg-panel relative p-6 pb-5 transition-all duration-500 rounded-2xl h-full flex flex-col"
                                    style={{
                                        boxShadow: hoveredRole === role.id
                                            ? `0 20px 60px -15px hsl(${role.accentHsl} / 0.25), 0 0 0 1px hsl(${role.accentHsl} / 0.1)`
                                            : undefined,
                                        borderColor: hoveredRole === role.id
                                            ? `hsl(${role.accentHsl} / 0.35)`
                                            : undefined,
                                    }}
                                >
                                    {/* Key hint badge */}
                                    <div
                                        className="mg-pill absolute top-4 right-4 w-7 h-7 flex items-center justify-center transition-all duration-300"
                                        style={{
                                            background: hoveredRole === role.id
                                                ? `hsl(${role.accentHsl} / 0.2)`
                                                : undefined,
                                            borderColor: hoveredRole === role.id
                                                ? `hsl(${role.accentHsl} / 0.3)`
                                                : undefined,
                                        }}
                                    >
                                        <span
                                            className="text-xs font-mono font-bold transition-colors duration-300"
                                            style={{
                                                color: hoveredRole === role.id
                                                    ? `hsl(${role.accentHsl})`
                                                    : 'rgba(255,255,255,0.3)',
                                            }}
                                        >
                                            {role.keyHint}
                                        </span>
                                    </div>

                                    <div
                                        className="mg-icon w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 relative overflow-hidden"
                                        style={{
                                            boxShadow: hoveredRole === role.id
                                                ? `0 0 30px hsl(${role.accentHsl} / 0.2)`
                                                : 'none',
                                            background: hoveredRole === role.id
                                                ? `linear-gradient(135deg, hsl(${role.accentHsl} / 0.25), hsl(${role.accentHsl} / 0.1))`
                                                : undefined,
                                            padding: role.image ? '2px' : '0'
                                        }}
                                    >
                                        {/* Icon/Image flow ring */}
                                        {hoveredRole === role.id && (
                                            <motion.div
                                                className="absolute inset-0 rounded-2xl"
                                                style={{ border: `1px solid hsl(${role.accentHsl} / 0.4)` }}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}

                                        {role.image ? (
                                            <div className="w-full h-full relative z-10 rounded-[14px] overflow-hidden">
                                                {role.video && hoveredRole === role.id && (
                                                    <video
                                                        src={role.video}
                                                        autoPlay
                                                        loop
                                                        muted
                                                        playsInline
                                                        className="absolute inset-0 w-full h-full object-cover z-20"
                                                        style={{ transform: 'scale(1.1)' }}
                                                    />
                                                )}
                                                <img
                                                    src={role.image}
                                                    alt={role.title}
                                                    className="w-full h-full object-cover shrink-0 transition-transform duration-500 ease-out"
                                                    style={{
                                                        transform: hoveredRole === role.id ? 'scale(1.1)' : 'scale(1)',
                                                        opacity: role.video && hoveredRole === role.id ? 0 : 1
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <span
                                                className="relative z-10 transition-colors duration-300"
                                                style={{
                                                    color: hoveredRole === role.id
                                                        ? `hsl(${role.accentHsl})`
                                                        : 'rgba(255,255,255,0.5)',
                                                }}
                                            >
                                                {role.icon}
                                            </span>
                                        )}
                                    </div>

                                    {/* Title & subtitle */}
                                    <h3 className="text-lg font-bold text-white mb-0.5 tracking-tight">{role.title}</h3>
                                    <p
                                        className="text-sm font-semibold mb-3 transition-colors duration-300"
                                        style={{
                                            color: hoveredRole === role.id
                                                ? `hsl(${role.accentHsl})`
                                                : 'rgba(255,255,255,0.4)',
                                        }}
                                    >
                                        {role.subtitle}
                                    </p>

                                    {/* Tagline - cinematic */}
                                    <p
                                        className="text-xs italic mb-3 transition-colors duration-300"
                                        style={{
                                            color: hoveredRole === role.id
                                                ? `hsl(${role.accentHsl} / 0.8)`
                                                : 'rgba(255,255,255,0.2)',
                                        }}
                                    >
                                        "{role.tagline}"
                                    </p>

                                    {/* Description */}
                                    <p className="text-sm text-white/35 leading-relaxed mb-4 flex-1">{role.description}</p>

                                    {/* Stat highlight */}
                                    <div
                                        className="flex items-baseline gap-1.5 mb-4 pb-4 transition-all duration-300"
                                        style={{
                                            borderBottom: `1px solid ${hoveredRole === role.id ? `hsl(${role.accentHsl} / 0.15)` : 'rgba(255,255,255,0.04)'}`,
                                        }}
                                    >
                                        <span
                                            className="text-2xl font-black transition-colors duration-300"
                                            style={{
                                                color: hoveredRole === role.id
                                                    ? `hsl(${role.accentHsl})`
                                                    : 'rgba(255,255,255,0.6)',
                                            }}
                                        >
                                            {role.stat.value}
                                        </span>
                                        <span className="text-xs text-white/30">{role.stat.label}</span>
                                    </div>

                                    {/* Dual CTA — Explore vs Get Started */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div
                                            className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-300"
                                            style={{
                                                color: hoveredRole === role.id
                                                    ? `hsl(${role.accentHsl})`
                                                    : 'rgba(255,255,255,0.25)',
                                            }}
                                        >
                                            <span>Explore</span>
                                            <motion.div
                                                animate={{ x: hoveredRole === role.id ? 4 : 0 }}
                                                transition={{ type: 'spring', stiffness: 300 }}
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </motion.div>
                                        </div>
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/auth?mode=signup&role=${role.id}`);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.stopPropagation();
                                                    navigate(`/auth?mode=signup&role=${role.id}`);
                                                }
                                            }}
                                            className="mg-pill text-xs font-bold cursor-pointer hover:scale-105 transition-transform"
                                            style={{
                                                color: `hsl(${role.accentHsl})`,
                                                borderColor: `hsl(${role.accentHsl} / 0.3)`,
                                                background: `hsl(${role.accentHsl} / 0.12)`,
                                            }}
                                        >
                                            <Rocket className="w-3 h-3" />
                                            Get Started
                                        </span>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Footer */}
                    <motion.div
                        className="text-center mt-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        <p className="text-white/25 text-sm">
                            Press{' '}
                            {['1', '2', '3', '4'].map((k, i) => (
                                <span key={k}>
                                    <kbd className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-xs text-white/40 mx-0.5">
                                        {k}
                                    </kbd>
                                    {i < 3 && <span className="text-white/15 mx-0.5">·</span>}
                                </span>
                            ))}
                            {' '}to explore
                        </p>
                    </motion.div>
                </motion.div >
            </div >
        </>
    );
};

export default ChoosePath;
