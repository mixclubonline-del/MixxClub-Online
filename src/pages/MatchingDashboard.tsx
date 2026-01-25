import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Users, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useBackendMatchingEngine } from '@/backend-integration';
import { MatchCard } from '../components/matching/MatchCard';
import type { MatchResult } from '@/services/matchingEngineService';

const MatchingDashboard: React.FC = () => {
    const [projectId, setProjectId] = useState<string>('project-1');
    
    const {
        matches: currentMatches,
        loading: isLoading,
        findMatches,
        selectEngineer,
    } = useBackendMatchingEngine(projectId);

    const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
    const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('');
    const [selectedConfidenceFilter, setSelectedConfidenceFilter] = useState<
        'all' | 'high' | 'medium' | 'low'
    >('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMatches, setFilteredMatches] = useState<MatchResult[]>([]);

    // Compute stats from matches
    const matchStats = useMemo(() => ({
        successRate: currentMatches.length > 0 
            ? currentMatches.filter(m => m.status === 'completed').length / currentMatches.length 
            : 0,
        avgQuality: currentMatches.length > 0
            ? Math.round(currentMatches.reduce((acc, m) => acc + m.match_score, 0) / currentMatches.length)
            : 0,
        totalMatches: currentMatches.length,
    }), [currentMatches]);

    // Sample project for demo
    const demoProject = {
        id: 'project-1',
        title: 'Hip-Hop Album Mixing & Mastering',
        description: 'Professional mixing and mastering for 12-track hip-hop album',
        genres: ['hip-hop', 'trap'],
        budget: 3000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        artistId: 'artist-1',
        artistName: 'Demo Artist',
        skills: ['mixing', 'mastering', 'production'],
        complexity: 'complex',
        priority: 'high',
        createdAt: new Date(),
    };

    useEffect(() => {
        findMatches();
    }, [projectId, findMatches]);

    useEffect(() => {
        if (!currentMatches) return;
        
        let filtered = [...currentMatches];

        if (selectedConfidenceFilter !== 'all') {
            filtered = filtered.filter((match) => match.confidence === selectedConfidenceFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter((match) =>
                match.engineer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                match.reason?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredMatches(filtered);
    }, [currentMatches, selectedGenreFilter, selectedConfidenceFilter, searchQuery]);

    const handleSelectMatch = (match: MatchResult) => {
        setSelectedMatch(match);
    };

    const handleAcceptMatch = async (match: MatchResult) => {
        const success = await selectEngineer(match.id, match.engineer_id);
        if (success) {
            findMatches();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Header */}
            <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">AI Matching Engine</h1>
                            <p className="text-slate-600">Auto-match engineers to your projects</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200/50"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle size={18} className="text-emerald-600" />
                                    <span className="text-sm font-medium text-slate-600">Match Success</span>
                                </div>
                                <div className="text-2xl font-bold text-emerald-900">
                                    {(matchStats.successRate * 100).toFixed(0)}%
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-3 border border-blue-200/50"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp size={18} className="text-blue-600" />
                                    <span className="text-sm font-medium text-slate-600">Avg Quality</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-900">
                                    {matchStats.avgQuality}%
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-3 border border-purple-200/50"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Users size={18} className="text-purple-600" />
                                    <span className="text-sm font-medium text-slate-600">Total Matches</span>
                                </div>
                                <div className="text-2xl font-bold text-purple-900">
                                    {matchStats.totalMatches.toLocaleString()}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-3 border border-amber-200/50"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock size={18} className="text-amber-600" />
                                    <span className="text-sm font-medium text-slate-600">Filtered</span>
                                </div>
                                <div className="text-2xl font-bold text-amber-900">{filteredMatches?.length || 0}</div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Project Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm"
                >
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{demoProject.title}</h2>
                    <p className="text-slate-600 mb-4">{demoProject.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <span className="text-sm text-slate-600">Budget</span>
                            <div className="font-bold text-slate-900">${demoProject.budget.toLocaleString()}</div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600">Genres</span>
                            <div className="font-bold text-slate-900">{demoProject.genres.join(', ')}</div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600">Complexity</span>
                            <div className="font-bold text-slate-900 capitalize">{demoProject.complexity}</div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600">Priority</span>
                            <div className="font-bold text-slate-900 capitalize">{demoProject.priority}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <div className="space-y-4 mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search engineers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <Filter size={18} className="text-slate-600" />
                        <div className="flex gap-2">
                            {(['all', 'high', 'medium', 'low'] as const).map((confidence) => (
                                <button
                                    key={confidence}
                                    onClick={() => setSelectedConfidenceFilter(confidence)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${selectedConfidenceFilter === confidence
                                        ? 'bg-emerald-500 text-white shadow-md'
                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                        }`}
                                >
                                    {confidence === 'all' ? 'All Matches' : `${confidence} Confidence`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-slate-600">Finding matches...</span>
                    </div>
                )}

                {/* Matches Grid */}
                {!isLoading && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">
                                Top Matches ({filteredMatches.length})
                            </h3>
                            {filteredMatches.length > 0 && (
                                <span className="text-sm text-slate-600">
                                    Showing best matches for this project
                                </span>
                            )}
                        </div>

                        {filteredMatches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredMatches.map((match, index) => (
                                    <MatchCard
                                        key={match.id}
                                        match={match}
                                        engineerName={`Engineer ${match.engineer_id.slice(0, 8)}`}
                                        engineerRating={match.performance_score / 20}
                                        engineerGenres={[]}
                                        highlighted={index === 0}
                                        onSelect={() => handleSelectMatch(match)}
                                        onAccept={() => handleAcceptMatch(match)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200"
                            >
                                <Users size={40} className="mx-auto text-slate-400 mb-3" />
                                <p className="text-slate-600">No matches found. Try adjusting your filters.</p>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Selected Match Details */}
                {selectedMatch && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50 p-8"
                    >
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">
                            Match Details
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <span className="text-sm text-slate-600">Match Score</span>
                                <div className="text-2xl font-bold text-blue-600">{selectedMatch.match_score}%</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <span className="text-sm text-slate-600">Genre Match</span>
                                <div className="text-2xl font-bold text-purple-600">{selectedMatch.genre_match}%</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <span className="text-sm text-slate-600">Experience</span>
                                <div className="text-2xl font-bold text-emerald-600">{selectedMatch.experience_score}%</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <span className="text-sm text-slate-600">Confidence</span>
                                <div className="text-2xl font-bold text-amber-600 capitalize">{selectedMatch.confidence}</div>
                            </div>
                        </div>

                        {selectedMatch.reason && (
                            <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
                                <span className="text-sm font-medium text-slate-600">Match Reason</span>
                                <p className="mt-1 text-slate-900">{selectedMatch.reason}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MatchingDashboard;
