import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Match } from '../../stores/matchingEngineStore';

interface MatchCardProps {
    match: Match;
    engineerName: string;
    engineerAvatar?: string;
    engineerRating: number;
    engineerGenres: string[];
    onSelect?: () => void;
    onAccept?: () => void;
    highlighted?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
    match,
    engineerName,
    engineerAvatar,
    engineerRating,
    engineerGenres,
    onSelect,
    onAccept,
    highlighted = false,
}) => {
    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high':
                return 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/40';
            case 'medium':
                return 'from-amber-500/20 to-amber-600/10 border-amber-500/40';
            case 'low':
                return 'from-orange-500/20 to-orange-600/10 border-orange-500/40';
            default:
                return 'from-slate-500/20 to-slate-600/10 border-slate-500/40';
        }
    };

    const getConfidenceBadgeColor = (confidence: string) => {
        switch (confidence) {
            case 'high':
                return 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/40';
            case 'medium':
                return 'bg-amber-500/20 text-amber-700 border border-amber-500/40';
            case 'low':
                return 'bg-orange-500/20 text-orange-700 border border-orange-500/40';
            default:
                return 'bg-slate-500/20 text-slate-700 border border-slate-500/40';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative overflow-hidden rounded-lg border backdrop-blur-sm transition-all ${highlighted
                    ? `${getConfidenceColor(match.confidence)} shadow-lg scale-105`
                    : 'bg-white/50 border-slate-200/50 hover:shadow-md'
                }`}
            onClick={onSelect}
        >
            {/* Border gradient effect for high confidence */}
            {highlighted && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 pointer-events-none" />
            )}

            <div className="p-4 space-y-4">
                {/* Header: Engineer Info */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 flex-1">
                        {engineerAvatar ? (
                            <img
                                src={engineerAvatar}
                                alt={engineerName}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {engineerName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{engineerName}</h3>
                            <div className="flex items-center gap-1">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={
                                                i < Math.floor(engineerRating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-slate-300'
                                            }
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-slate-600">{engineerRating}★</span>
                            </div>
                        </div>
                    </div>

                    {/* Confidence badge */}
                    <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getConfidenceBadgeColor(
                            match.confidence
                        )}`}
                    >
                        {match.confidence === 'high' && <CheckCircle className="inline mr-1" size={12} />}
                        {match.confidence.charAt(0).toUpperCase() + match.confidence.slice(1)} Match
                    </span>
                </div>

                {/* Match Score */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-600">Overall Match</span>
                        <span className="font-bold text-lg text-slate-900">{match.matchScore}%</span>
                    </div>
                    <div className="w-full bg-slate-200/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${match.matchScore}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className={`h-full rounded-full ${match.confidence === 'high'
                                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                    : match.confidence === 'medium'
                                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                        : 'bg-gradient-to-r from-orange-400 to-orange-500'
                                }`}
                        />
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50/50 rounded p-2">
                        <span className="text-xs text-slate-600">Genre Match</span>
                        <div className="font-semibold text-slate-900">{match.genreMatch}%</div>
                    </div>
                    <div className="bg-slate-50/50 rounded p-2">
                        <span className="text-xs text-slate-600">Experience</span>
                        <div className="font-semibold text-slate-900">{match.experienceScore}%</div>
                    </div>
                    <div className="bg-slate-50/50 rounded p-2">
                        <span className="text-xs text-slate-600">Performance</span>
                        <div className="font-semibold text-slate-900">{match.performanceScore}%</div>
                    </div>
                    <div className="bg-slate-50/50 rounded p-2">
                        <span className="text-xs text-slate-600">Availability</span>
                        <div className="font-semibold text-slate-900">{match.availabilityScore}%</div>
                    </div>
                </div>

                {/* Genres */}
                <div className="space-y-2">
                    <span className="text-xs font-medium text-slate-600">Specialties</span>
                    <div className="flex flex-wrap gap-1.5">
                        {engineerGenres.map((genre) => (
                            <span
                                key={genre}
                                className="px-2 py-1 rounded-full text-xs bg-slate-200/50 text-slate-700 font-medium"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Match Reason */}
                <div className="flex gap-2 p-2 bg-slate-50/50 rounded-lg">
                    <TrendingUp size={16} className="text-slate-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">{match.reason}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect?.();
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium text-sm transition-colors"
                    >
                        View Details
                    </button>
                    {onAccept && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAccept();
                            }}
                            className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg"
                        >
                            Select Engineer
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
