import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, DollarSign, CheckCircle, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EngineerMatch } from '@/hooks/useEngineerMatchingAPI';

interface APIMatchCardProps {
  match: EngineerMatch;
  onHire?: (engineerId: string, projectDetails: { title: string; description?: string; projectType: string }) => Promise<void>;
  highlighted?: boolean;
  projectType?: string;
  hiring?: boolean;
}

export const APIMatchCard: React.FC<APIMatchCardProps> = ({
  match,
  onHire,
  highlighted = false,
  projectType = 'mixing',
  hiring = false,
}) => {
  const [showHireDialog, setShowHireDialog] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-emerald-600';
    if (score >= 60) return 'from-amber-500 to-amber-600';
    return 'from-orange-500 to-orange-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' };
    if (score >= 60) return { label: 'Good', color: 'bg-amber-100 text-amber-700 border-amber-300' };
    return { label: 'Fair', color: 'bg-orange-100 text-orange-700 border-orange-300' };
  };

  const badge = getScoreBadge(match.matchScore);

  const handleHire = async () => {
    if (!projectTitle.trim()) return;
    
    await onHire?.(match.engineerId, {
      title: projectTitle,
      description: projectDescription || undefined,
      projectType,
    });
    
    setShowHireDialog(false);
    setProjectTitle('');
    setProjectDescription('');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all hover:shadow-lg ${
          highlighted
            ? 'border-emerald-300 bg-gradient-to-br from-emerald-50/80 to-blue-50/80 shadow-md scale-[1.02]'
            : 'bg-white/80 border-slate-200 hover:border-slate-300'
        }`}
      >
        {highlighted && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-blue-500" />
        )}

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3 flex-1">
              {match.avatarUrl ? (
                <img
                  src={match.avatarUrl}
                  alt={match.engineerName}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white shadow">
                  {match.engineerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{match.engineerName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(match.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-600">{match.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
              {match.matchScore >= 80 && <CheckCircle className="inline mr-1" size={12} />}
              {badge.label}
            </span>
          </div>

          {/* Match Score */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">Match Score</span>
              <span className="font-bold text-xl text-slate-900">{match.matchScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${match.matchScore}%` }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(match.matchScore)}`}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <DollarSign className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
              <div className="text-sm font-bold text-slate-900">${match.hourlyRate}</div>
              <div className="text-xs text-slate-500">per hour</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <Briefcase className="w-4 h-4 mx-auto text-blue-600 mb-1" />
              <div className="text-sm font-bold text-slate-900">{match.completedProjects}</div>
              <div className="text-xs text-slate-500">projects</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <TrendingUp className="w-4 h-4 mx-auto text-purple-600 mb-1" />
              <div className="text-sm font-bold text-slate-900">{match.experience}+</div>
              <div className="text-xs text-slate-500">years exp</div>
            </div>
          </div>

          {/* Matching Genres */}
          {match.matchingGenres.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-600">Matching Genres</span>
              <div className="flex flex-wrap gap-1.5">
                {match.matchingGenres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 font-medium"
                  >
                    ✓ {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specialties */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-600">Specialties</span>
            <div className="flex flex-wrap gap-1.5">
              {match.specialties.slice(0, 4).map((specialty) => (
                <span
                  key={specialty}
                  className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700 font-medium capitalize"
                >
                  {specialty}
                </span>
              ))}
              {match.specialties.length > 4 && (
                <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-500">
                  +{match.specialties.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {match.portfolioUrl && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(match.portfolioUrl!, '_blank')}
              >
                View Portfolio
              </Button>
            )}
            {onHire && (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md"
                onClick={() => setShowHireDialog(true)}
                disabled={hiring}
              >
                {hiring ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Hire Engineer'
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hire Dialog */}
      <Dialog open={showHireDialog} onOpenChange={setShowHireDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hire {match.engineerName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectTitle">Project Title *</Label>
              <Input
                id="projectTitle"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g., Album Mixing Project"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Description (optional)</Label>
              <Input
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Brief project description..."
              />
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
              <p>This will create a new project with <strong>{match.engineerName}</strong> as your engineer.</p>
              <p className="mt-1">Rate: <strong>${match.hourlyRate}/hr</strong></p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHireDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleHire}
              disabled={!projectTitle.trim() || hiring}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {hiring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Confirm & Create Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
