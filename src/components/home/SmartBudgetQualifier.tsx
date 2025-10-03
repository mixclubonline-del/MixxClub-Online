import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, DollarSign, Radio, Star, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SmartBudgetQualifierProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface QualifierData {
  projectType: string;
  budget: string;
  genre: string;
}

interface EngineerMatch {
  engineerId: string;
  engineerName: string;
  avatarUrl?: string;
  specialties: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  matchScore: number;
  matchingGenres: string[];
  portfolioLinks: any[];
}

const projectTypes = [
  { value: 'single', label: 'Single track', discount: '' },
  { value: 'ep', label: 'EP (3-5 tracks)', discount: 'Save 15%' },
  { value: 'album', label: 'Album (8+ tracks)', discount: 'Save 20%' },
  { value: 'unsure', label: 'Not sure yet', discount: '' },
];

const budgetRanges = [
  { value: 'under-50', label: 'Under $50', tier: 'Starter', recommended: false },
  { value: '50-100', label: '$50-$100', tier: 'Professional', recommended: true },
  { value: '100-300', label: '$100-$300', tier: 'Pro', recommended: false },
  { value: '300-500', label: '$300-$500', tier: 'Premium', recommended: false },
  { value: '500+', label: '$500+', tier: 'Elite', recommended: false },
  { value: 'unsure', label: 'Not sure', tier: '', recommended: false },
];

const genres = [
  'Hip-Hop/Rap',
  'Pop/R&B',
  'Rock/Alternative',
  'Electronic/Dance',
  'Country/Folk',
  'Other',
];


export const SmartBudgetQualifier = ({ open, onOpenChange }: SmartBudgetQualifierProps) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QualifierData>({
    projectType: '',
    budget: '',
    genre: '',
  });
  const [matches, setMatches] = useState<EngineerMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch matches when we reach step 4
  useEffect(() => {
    if (step === 4 && data.budget && data.genre) {
      fetchMatches();
    }
  }, [step]);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('match-engineers', {
        body: {
          budgetRange: data.budget,
          genres: [data.genre],
          projectType: data.projectType,
        },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      });

      if (response.error) throw response.error;
      
      setMatches(response.data.matches || []);
      
      // Store matcher data and engineer IDs in localStorage
      localStorage.setItem('qualifierData', JSON.stringify({
        ...data,
        matchedEngineers: response.data.matches.map((m: EngineerMatch) => m.engineerId),
      }));
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to find matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleComplete = () => {
    onOpenChange(false);
    navigate('/auth');
  };

  const resetAndClose = () => {
    setStep(1);
    setData({ projectType: '', budget: '', genre: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Find Your Perfect Engineer Match</DialogTitle>
          <p className="text-muted-foreground">Answer 3 quick questions to get personalized recommendations</p>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">What's your project?</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectTypes.map((type) => (
                  <Card
                    key={type.value}
                    className={`p-4 cursor-pointer transition-all hover:border-primary ${
                      data.projectType === type.value ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      setData({ ...data, projectType: type.value });
                      setTimeout(handleNext, 300);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{type.label}</span>
                      {type.discount && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          {type.discount}
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">What's your budget per track?</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {budgetRanges.map((range) => (
                  <Card
                    key={range.value}
                    className={`p-4 cursor-pointer transition-all hover:border-primary ${
                      data.budget === range.value ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      setData({ ...data, budget: range.value });
                      setTimeout(handleNext, 300);
                    }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{range.label}</span>
                        {range.recommended && (
                          <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                        )}
                      </div>
                      {range.tier && (
                        <p className="text-sm text-muted-foreground">{range.tier} tier</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">What's your genre?</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {genres.map((genre) => (
                  <Card
                    key={genre}
                    className={`p-4 cursor-pointer transition-all hover:border-primary text-center ${
                      data.genre === genre ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      setData({ ...data, genre });
                      setTimeout(handleNext, 300);
                    }}
                  >
                    <span className="font-medium">{genre}</span>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium">Finding your perfect engineer matches...</p>
                  <p className="text-sm text-muted-foreground">Analyzing {data.budget} budget • {data.genre} • {data.projectType}</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">We found {matches.length} engineers perfect for you!</h3>
                    <p className="text-muted-foreground">Here are your top matches based on your preferences</p>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {matches.slice(0, 3).map((engineer) => (
                      <Card key={engineer.engineerId} className="p-6 hover:border-primary transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div 
                              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 bg-cover bg-center"
                              style={engineer.avatarUrl ? { backgroundImage: `url(${engineer.avatarUrl})` } : {}}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg">{engineer.engineerName}</h4>
                                {engineer.experience > 0 && (
                                  <Badge variant="secondary">{engineer.experience}+ years</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">{engineer.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">({engineer.totalReviews} reviews)</span>
                                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                                  {engineer.matchScore}% Match
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Specialties: {engineer.specialties.slice(0, 2).join(', ')}
                                {engineer.specialties.length > 2 && ` +${engineer.specialties.length - 2} more`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">${engineer.hourlyRate}</p>
                            <p className="text-sm text-muted-foreground">per track</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button onClick={handleComplete} className="w-full" size="lg">
                    Create Account to View All {matches.length} Matches
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account? <a href="/auth" className="text-primary hover:underline">Sign in</a>
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
