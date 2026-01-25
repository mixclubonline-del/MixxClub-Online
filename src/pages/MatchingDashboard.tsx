import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Users, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useBackendMatchingEngine } from '@/backend-integration';
import { MatchCard } from '../components/matching/MatchCard';
// import { type Project, type Match } from '../stores/matchingEngineStore'; // No longer needed directly

const MatchingDashboard: React.FC = () => {
    const [projectId, setProjectId] = useState<string>('project-1'); // Default demo project
    
    const {
        matches: currentMatches,
        isLoading,
        findMatches,
        matchStats,
        selectMatch,
        selectedMatch,
    } = useBackendMatchingEngine(projectId);

    const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('');
    const [selectedConfidenceFilter, setSelectedConfidenceFilter] = useState<
        'all' | 'high' | 'medium' | 'low'
    >('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMatches, setFilteredMatches] = useState<any[]>([]);

    // Sample project for demo (in real app, would come from project selection)
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

    // Find matches when component mounts
    useEffect(() => {
        findMatches();
    }, [projectId]); 

    // Filter matches
    useEffect(() => {
        if (!currentMatches) return;
        
        let filtered = [...currentMatches];

        // Genre filter
        if (selectedGenreFilter) {
            filtered = filtered.filter((match) => {
                // Determine genres from match/engineer object structure
                // Adjust per backend response shape
                const genres = match.engineer?.genres || []; 
                return genres.includes(selectedGenreFilter);
            });
        }

        // Confidence filter
        if (selectedConfidenceFilter !== 'all') {
            filtered = filtered.filter((match) => match.confidence === selectedConfidenceFilter);
        }

        // Search query
        if (searchQuery) {
            filtered = filtered.filter((match) => {
                 const name = match.engineer?.name || '';
                return name.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }

        setFilteredMatches(filtered);
    }, [currentMatches, selectedGenreFilter, selectedConfidenceFilter, searchQuery]);

    // Get unique genres (derived from matches for now)
    const allGenres = useMemo(
        () => {
             if (!currentMatches) return [];
             const genres = currentMatches.flatMap(m => m.engineer?.genres || []);
             return Array.from(new Set(genres)).sort();
        },
        [currentMatches]
    ) as string[]; 
    
    // Get engineer details helper no longer needed as attached to match object
    // but keeping a shim if needed
    const getEngineerInfo = (match: any) => {
        return match.engineer; 
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
                                    <span className="text-sm font-medium text-slate-600">Engineers</span>
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
                    {/* Search */}
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

                    {/* Filter Chips */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <Filter size={18} className="text-slate-600" />

                        {/* Genre Filter */}
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setSelectedGenreFilter('')}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedGenreFilter === ''
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    }`}
                            >
                                All Genres
                            </button>
                            {allGenres.map((genre) => (
                                <button
                                    key={genre}
                                    onClick={() => setSelectedGenreFilter(genre)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${selectedGenreFilter === genre
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                        }`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>

                        {/* Confidence Filter */}
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
                                    {confidence === 'all' ? 'All Matches' : `${confidence} Matches`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Matches Grid */}
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
                            {filteredMatches.map((match, index) => {
                                const engineer = getEngineerInfo(match);
                                return (
                                    <MatchCard
                                        key={`${match.engineerId}-${match.projectId}`}
                                        match={match}
                                        engineerName={engineer?.name || 'Unknown'}
                                        engineerRating={engineer?.rating || 0}
                                        engineerGenres={engineer?.genres || []}
                                        highlighted={index === 0}
                                        onSelect={() => selectMatch(match)}
                                        onAccept={() => {
                                            console.log(`Selected engineer: ${engineer?.name} for project`);
                                            selectMatch(match);
                                        }}
                                    />
                                );
                            })}
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

                {/* Selected Match Details */}
                {selectedMatch && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50 p-8"
                    >
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">
                            Match Details & Breakdown
                        </h3>

                        {(() => {
                            const engineer = getEngineerInfo(selectedMatch);
                            if (!engineer) return null;

                            return (
                                <div className="space-y-6">
                                    {/* Engineer Profile */}
                                    <div className="flex items-center gap-4 pb-6 border-b border-blue-200/50">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                            {engineer.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900">{engineer.name}</h4>
                                            <p className="text-slate-600">{engineer.bio}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm font-medium text-slate-700">
                                                    {engineer.completedProjects} projects completed
                                                </span>
                                                <span className="text-sm font-medium text-amber-600">
                                                    {engineer.rating}★ rating
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score Details */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {[
                                            { label: 'Genre Match', value: selectedMatch.genreMatch },
                                            { label: 'Experience', value: selectedMatch.experienceScore },
                                            { label: 'Performance', value: selectedMatch.performanceScore },
                                            { label: 'Price Alignment', value: selectedMatch.priceAlignment },
                                            { label: 'Availability', value: selectedMatch.availabilityScore },
                                        ].map((score) => (
                                            <div key={score.label} className="bg-white rounded-lg p-4">
                                                <div className="text-sm text-slate-600 mb-1">{score.label}</div>
                                                <div className="text-3xl font-bold text-slate-900">{score.value}%</div>
                                                <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${score.value}%` }}
                                                        transition={{ duration: 0.6 }}
                                                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Match Reason */}
                                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                                        <h5 className="font-bold text-slate-900 mb-2">Why This Match?</h5>
                                        <p className="text-slate-700">{selectedMatch.reason}</p>
                                    </div>

                                    {/* Action */}
                                    <div className="flex gap-4">
                                        <button className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold transition-all shadow-lg hover:shadow-xl">
                                            Select This Engineer
                                        </button>
                                        <button className="flex-1 px-6 py-3 rounded-lg bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-900 font-bold transition-all">
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MatchingDashboard;
