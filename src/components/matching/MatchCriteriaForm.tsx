import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Music, Sliders, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MatchCriteriaFormValues {
  budgetRange: string;
  genres: string[];
  projectType: string;
}

interface MatchCriteriaFormProps {
  values: MatchCriteriaFormValues;
  onChange: (values: MatchCriteriaFormValues) => void;
  onSubmit: () => void;
  loading?: boolean;
}

const BUDGET_RANGES = [
  { value: 'under-50', label: 'Under $50/hr', description: 'Budget-friendly' },
  { value: '50-100', label: '$50-100/hr', description: 'Standard rate' },
  { value: '100-300', label: '$100-300/hr', description: 'Professional' },
  { value: '300-500', label: '$300-500/hr', description: 'Premium' },
  { value: '500+', label: '$500+/hr', description: 'Elite tier' },
];

const GENRES = [
  'hip-hop', 'r&b', 'pop', 'rock', 'electronic', 'edm',
  'trap', 'jazz', 'classical', 'country', 'latin', 'afrobeats',
  'indie', 'metal', 'folk', 'reggae', 'soul', 'funk'
];

const PROJECT_TYPES = [
  { value: 'mixing', label: 'Mixing', icon: '🎚️' },
  { value: 'mastering', label: 'Mastering', icon: '💿' },
  { value: 'production', label: 'Production', icon: '🎹' },
  { value: 'full-service', label: 'Full Service', icon: '🎯' },
];

export const MatchCriteriaForm: React.FC<MatchCriteriaFormProps> = ({
  values,
  onChange,
  onSubmit,
  loading = false,
}) => {
  const toggleGenre = (genre: string) => {
    const newGenres = values.genres.includes(genre)
      ? values.genres.filter(g => g !== genre)
      : [...values.genres, genre];
    onChange({ ...values, genres: newGenres });
  };

  const isValid = values.budgetRange && values.genres.length > 0 && values.projectType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2 rounded-lg bg-blue-50">
          <Sliders className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Find Your Perfect Engineer</h2>
          <p className="text-sm text-slate-600">Set your preferences to find matching engineers</p>
        </div>
      </div>

      {/* Budget Range */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Budget Range
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {BUDGET_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => onChange({ ...values, budgetRange: range.value })}
              className={`p-3 rounded-lg border text-left transition-all ${
                values.budgetRange === range.value
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-medium text-slate-900">{range.label}</div>
              <div className="text-xs text-slate-500">{range.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Music className="w-4 h-4 text-purple-600" />
          Genres (select at least one)
        </label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                values.genres.includes(genre)
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
        {values.genres.length > 0 && (
          <p className="text-xs text-slate-500">
            Selected: {values.genres.join(', ')}
          </p>
        )}
      </div>

      {/* Project Type */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Sliders className="w-4 h-4 text-amber-600" />
          Service Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PROJECT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange({ ...values, projectType: type.value })}
              className={`p-4 rounded-lg border text-center transition-all ${
                values.projectType === type.value
                  ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-sm font-medium text-slate-900">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4 border-t border-slate-100">
        <Button
          onClick={onSubmit}
          disabled={!isValid || loading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Finding Matches...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Find Matching Engineers
            </>
          )}
        </Button>
        {!isValid && (
          <p className="text-xs text-center text-slate-500 mt-2">
            Select budget, at least one genre, and service type to search
          </p>
        )}
      </div>
    </motion.div>
  );
};
