import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, DollarSign, Radio, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SmartBudgetQualifierProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface QualifierData {
  projectType: string;
  budget: string;
  genre: string;
}

const projectTypes = [
  { value: 'single', label: 'Single track', discount: '' },
  { value: 'ep', label: 'EP (3-5 tracks)', discount: 'Save 15%' },
  { value: 'album', label: 'Album (8+ tracks)', discount: 'Save 20%' },
  { value: 'unsure', label: 'Not sure yet', discount: '' },
];

const budgetRanges = [
  { value: 'starter', label: 'Under $50', tier: 'Starter', recommended: false },
  { value: 'professional', label: '$50-$100', tier: 'Professional', recommended: true },
  { value: 'premium', label: '$100+', tier: 'Premium', recommended: false },
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

const mockEngineerMatches = [
  {
    id: 1,
    name: 'Alex Rivera',
    tier: 'Professional',
    matchScore: 92,
    rating: 4.9,
    reviews: 127,
    price: 79,
    specialty: 'Hip-Hop/Rap',
  },
  {
    id: 2,
    name: 'Jordan Chen',
    tier: 'Professional',
    matchScore: 88,
    rating: 4.8,
    reviews: 95,
    price: 85,
    specialty: 'Pop/R&B',
  },
  {
    id: 3,
    name: 'Taylor Morgan',
    tier: 'Premium',
    matchScore: 85,
    rating: 5.0,
    reviews: 203,
    price: 149,
    specialty: 'Multiple genres',
  },
];

export const SmartBudgetQualifier = ({ open, onOpenChange }: SmartBudgetQualifierProps) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QualifierData>({
    projectType: '',
    budget: '',
    genre: '',
  });
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleComplete = () => {
    // Store in localStorage for later use
    localStorage.setItem('qualifierData', JSON.stringify(data));
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
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">We found 8 engineers perfect for you!</h3>
                <p className="text-muted-foreground">Here are your top 3 matches based on your preferences</p>
              </div>

              <div className="space-y-4">
                {mockEngineerMatches.map((engineer) => (
                  <Card key={engineer.id} className="p-6 hover:border-primary transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg">{engineer.name}</h4>
                            <Badge variant="secondary">{engineer.tier}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{engineer.rating}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">({engineer.reviews} reviews)</span>
                            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                              {engineer.matchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Specialty: {engineer.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${engineer.price}</p>
                        <p className="text-sm text-muted-foreground">per track</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button onClick={handleComplete} className="w-full" size="lg">
                Create Account to Book Your Engineer
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <a href="/auth" className="text-primary hover:underline">Sign in</a>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
