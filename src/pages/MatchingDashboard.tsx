import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useEngineerMatchingAPI, type EngineerMatch, type MatchCriteria } from '@/hooks/useEngineerMatchingAPI';
import { MatchCriteriaForm, type MatchCriteriaFormValues } from '@/components/matching/MatchCriteriaForm';
import { APIMatchCard } from '@/components/matching/APIMatchCard';
import { toast } from 'sonner';

const MatchingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { matches, loading, error, hiring, findMatches, hireEngineer } = useEngineerMatchingAPI();

  // Form state
  const [criteria, setCriteria] = useState<MatchCriteriaFormValues>({
    budgetRange: '',
    genres: [],
    projectType: '',
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  // Handle search
  const handleSearch = async () => {
    if (!criteria.budgetRange || criteria.genres.length === 0 || !criteria.projectType) {
      toast.error('Please fill in all criteria');
      return;
    }

    const results = await findMatches({
      budgetRange: criteria.budgetRange,
      genres: criteria.genres,
      projectType: criteria.projectType,
    });

    setHasSearched(true);

    if (results.length === 0) {
      toast.info('No engineers found matching your criteria. Try adjusting your filters.');
    } else {
      toast.success(`Found ${results.length} matching engineer${results.length === 1 ? '' : 's'}!`);
    }
  };

  // Handle hire
  const handleHire = async (
    engineerId: string,
    projectDetails: { title: string; description?: string; projectType: string }
  ) => {
    const result = await hireEngineer(engineerId, projectDetails);
    if (result) {
      navigate(`/projects/${result.projectId}`);
    }
  };

  // Filter matches
  const filteredMatches = useMemo(() => {
    let filtered = matches;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((match) =>
        match.engineerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Genre filter
    if (selectedGenreFilter) {
      filtered = filtered.filter((match) =>
        match.genres.some((g) => g.toLowerCase() === selectedGenreFilter.toLowerCase()) ||
        match.matchingGenres.some((g) => g.toLowerCase() === selectedGenreFilter.toLowerCase())
      );
    }

    return filtered;
  }, [matches, searchQuery, selectedGenreFilter]);

  // Get unique genres from matches
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    matches.forEach((match) => {
      match.genres.forEach((g) => genres.add(g));
    });
    return Array.from(genres).sort();
  }, [matches]);

  // Stats
  const stats = useMemo(() => {
    if (matches.length === 0) {
      return { avgScore: 0, highMatches: 0, avgRate: 0 };
    }
    const avgScore = Math.round(matches.reduce((acc, m) => acc + m.matchScore, 0) / matches.length);
    const highMatches = matches.filter((m) => m.matchScore >= 80).length;
    const avgRate = Math.round(matches.reduce((acc, m) => acc + m.hourlyRate, 0) / matches.length);
    return { avgScore, highMatches, avgRate };
  }, [matches]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AI Matching Engine</h1>
              <p className="text-slate-600">Find the perfect engineer for your project</p>
            </div>

            {/* Stats - Show after search */}
            {hasSearched && matches.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={18} className="text-emerald-600" />
                    <span className="text-sm font-medium text-slate-600">High Matches</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">{stats.highMatches}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-3 border border-blue-200/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={18} className="text-blue-600" />
                    <span className="text-sm font-medium text-slate-600">Avg Score</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{stats.avgScore}%</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-3 border border-purple-200/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={18} className="text-purple-600" />
                    <span className="text-sm font-medium text-slate-600">Results</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{matches.length}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-3 border border-amber-200/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={18} className="text-amber-600" />
                    <span className="text-sm font-medium text-slate-600">Avg Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-900">${stats.avgRate}/hr</div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Criteria Form */}
        <MatchCriteriaForm
          values={criteria}
          onChange={setCriteria}
          onSubmit={handleSearch}
          loading={loading}
        />

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Results Section */}
        {hasSearched && matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Filters */}
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search engineers by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                />
              </div>

              {/* Genre Filter Chips */}
              {availableGenres.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <Filter size={18} className="text-slate-600" />
                  <button
                    onClick={() => setSelectedGenreFilter('')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedGenreFilter === ''
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    All Genres
                  </button>
                  {availableGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenreFilter(genre)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                        selectedGenreFilter === genre
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Matches Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">
                  Top Matches ({filteredMatches.length})
                </h3>
                <span className="text-sm text-slate-600">
                  Sorted by match score
                </span>
              </div>

              {filteredMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMatches.map((match, index) => (
                    <APIMatchCard
                      key={match.engineerId}
                      match={match}
                      onHire={handleHire}
                      highlighted={index === 0}
                      projectType={criteria.projectType}
                      hiring={hiring}
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
                  <p className="text-slate-600">No matches found with current filters.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty State - Before Search */}
        {!hasSearched && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center py-16"
          >
            <div className="inline-flex p-4 rounded-full bg-blue-50 mb-4">
              <Users size={48} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Find Your Perfect Engineer</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Set your budget, select your genres, and choose the service type above.
              Our AI will match you with the best engineers for your project.
            </p>
          </motion.div>
        )}

        {/* Empty Results */}
        {hasSearched && matches.length === 0 && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center py-12 bg-slate-50 rounded-lg border border-slate-200"
          >
            <Users size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Engineers Found</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              No engineers match your current criteria. Try adjusting your budget range,
              selecting different genres, or changing the service type.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MatchingDashboard;
