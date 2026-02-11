import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
    Mic2, Crown, Radio, TrendingUp, DollarSign,
    Heart, ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ThreeWayPartner {
    id: string;
    name: string;
    avatar_url?: string | null;
    role: 'artist' | 'producer' | 'engineer';
    percentage: number;
    earnings: number;
}

interface ThreeWayPartnershipCardProps {
    id: string;
    status: string;
    totalRevenue: number;
    healthScore: number;
    artist: ThreeWayPartner;
    producer: ThreeWayPartner;
    engineer: ThreeWayPartner;
    createdAt: string;
    onClick?: () => void;
}

const ROLE_ICONS = {
    artist: Mic2,
    producer: Crown,
    engineer: Radio,
};

const ROLE_COLORS = {
    artist: 'from-purple-500 to-pink-500',
    producer: 'from-amber-500 to-orange-500',
    engineer: 'from-cyan-500 to-blue-500',
};

const ROLE_RING_COLORS = {
    artist: 'border-purple-500',
    producer: 'border-amber-500',
    engineer: 'border-cyan-500',
};

const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
};

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'active':
            return { label: 'Active', className: 'bg-green-500/10 text-green-500 border-green-500/20' };
        case 'proposed':
            return { label: 'Proposed', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
        case 'completed':
            return { label: 'Completed', className: 'bg-muted text-muted-foreground border-border' };
        case 'paused':
            return { label: 'Paused', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
        default:
            return { label: status, className: 'bg-muted text-muted-foreground border-border' };
    }
};

export const ThreeWayPartnershipCard = ({
    status,
    totalRevenue,
    healthScore,
    artist,
    producer,
    engineer,
    onClick,
}: ThreeWayPartnershipCardProps) => {
    const statusConfig = getStatusConfig(status);
    const partners = [artist, producer, engineer];

    return (
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Card
                className="border-border/30 bg-card/50 hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
                onClick={onClick}
            >
                <CardContent className="p-5">
                    {/* Header: status + revenue */}
                    <div className="flex items-center justify-between mb-5">
                        <Badge variant="outline" className={statusConfig.className}>
                            {statusConfig.label}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span>${totalRevenue.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Three-way avatar triangle */}
                    <div className="relative flex justify-center items-center mb-6 h-28">
                        {/* Center connector lines */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 120">
                            <line x1="150" y1="10" x2="60" y2="100" stroke="currentColor" strokeWidth="1" className="text-border" strokeDasharray="4 4" />
                            <line x1="150" y1="10" x2="240" y2="100" stroke="currentColor" strokeWidth="1" className="text-border" strokeDasharray="4 4" />
                            <line x1="60" y1="100" x2="240" y2="100" stroke="currentColor" strokeWidth="1" className="text-border" strokeDasharray="4 4" />
                        </svg>

                        {/* Top: Producer */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
                            <Avatar className={`w-11 h-11 border-2 ${ROLE_RING_COLORS.producer} mx-auto`}>
                                <AvatarImage src={producer.avatar_url || undefined} />
                                <AvatarFallback className={`bg-gradient-to-br ${ROLE_COLORS.producer} text-white text-xs`}>
                                    {producer.name?.charAt(0) || 'P'}
                                </AvatarFallback>
                            </Avatar>
                            <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[80px]">{producer.name}</p>
                        </div>

                        {/* Bottom-left: Artist */}
                        <div className="absolute bottom-0 left-[15%] text-center">
                            <Avatar className={`w-11 h-11 border-2 ${ROLE_RING_COLORS.artist} mx-auto`}>
                                <AvatarImage src={artist.avatar_url || undefined} />
                                <AvatarFallback className={`bg-gradient-to-br ${ROLE_COLORS.artist} text-white text-xs`}>
                                    {artist.name?.charAt(0) || 'A'}
                                </AvatarFallback>
                            </Avatar>
                            <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[80px]">{artist.name}</p>
                        </div>

                        {/* Bottom-right: Engineer */}
                        <div className="absolute bottom-0 right-[15%] text-center">
                            <Avatar className={`w-11 h-11 border-2 ${ROLE_RING_COLORS.engineer} mx-auto`}>
                                <AvatarImage src={engineer.avatar_url || undefined} />
                                <AvatarFallback className={`bg-gradient-to-br ${ROLE_COLORS.engineer} text-white text-xs`}>
                                    {engineer.name?.charAt(0) || 'E'}
                                </AvatarFallback>
                            </Avatar>
                            <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[80px]">{engineer.name}</p>
                        </div>
                    </div>

                    {/* Split bars */}
                    <div className="space-y-2 mb-4">
                        {partners.map((partner) => {
                            const Icon = ROLE_ICONS[partner.role];
                            return (
                                <div key={partner.role} className="flex items-center gap-2 text-sm">
                                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span className="w-16 truncate text-muted-foreground capitalize">{partner.role}</span>
                                    <Progress value={partner.percentage} className="h-2 flex-1" />
                                    <span className="w-10 text-right font-medium">{partner.percentage}%</span>
                                    <span className="w-16 text-right text-xs text-muted-foreground">
                                        ${partner.earnings.toLocaleString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Health score */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Heart className="w-3.5 h-3.5" />
                            Health
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${getHealthColor(healthScore)}`}>
                                {healthScore}%
                            </span>
                            <Progress value={healthScore} className="h-1.5 w-16" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
