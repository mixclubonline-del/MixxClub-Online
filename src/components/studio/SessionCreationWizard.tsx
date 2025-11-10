import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Music,
  Users,
  Settings,
  Sparkles,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Mic,
  Headphones,
  Globe,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface SessionCreationWizardProps {
  onComplete: (sessionData: any) => void;
  onCancel: () => void;
}

const SessionCreationWizard = ({ onComplete, onCancel }: SessionCreationWizardProps) => {
  const [step, setStep] = useState(1);
  const [sessionData, setSessionData] = useState({
    type: '',
    name: '',
    description: '',
    genre: '',
    collaborators: [] as string[],
    audioQuality: 'high',
    maxParticipants: 4,
    mode: 'solo' as 'solo' | 'collaborative',
    visibility: 'private' as 'public' | 'private'
  });

  const totalSteps = sessionData.mode === 'solo' ? 3 : 4;
  const progress = (step / totalSteps) * 100;

  const sessionTypes = [
    { 
      id: 'mixing', 
      label: 'Mixing Session', 
      icon: Headphones,
      gradient: 'from-primary to-primary-glow',
      description: 'Mix and balance your tracks'
    },
    { 
      id: 'production', 
      label: 'Production', 
      icon: Music,
      gradient: 'from-accent-cyan to-accent-blue',
      description: 'Create beats and arrangements'
    },
    { 
      id: 'recording', 
      label: 'Recording', 
      icon: Mic,
      gradient: 'from-warning to-destructive',
      description: 'Capture vocals and instruments'
    }
  ];

  const aiSuggestions = [
    { name: 'Sarah Mix', role: 'Mixing Engineer', rating: 4.9, location: '🇺🇸 LA' },
    { name: 'DJ Pulse', role: 'Producer', rating: 4.8, location: '🇯🇵 Tokyo' },
    { name: 'Maya Sound', role: 'Vocalist', rating: 5.0, location: '🇨🇦 Toronto' }
  ];

  const handleNext = () => {
    if (step === 1 && !sessionData.type) {
      toast.error('Please select a session type');
      return;
    }
    if (step === 2 && !sessionData.name) {
      toast.error('Please enter a session name');
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleLaunch = () => {
    if (!sessionData.type || !sessionData.name) {
      toast.error('Please complete all required fields');
      return;
    }
    onComplete(sessionData);
    toast.success('🎉 Session launching!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Create New Session</h2>
          <Badge variant="secondary">Step {step} of {totalSteps}</Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-8 animate-scale-in">
        {/* Step 1: Session Type & Mode */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">What type of session?</h3>
              <p className="text-muted-foreground">Choose the focus of your session</p>
            </div>

            {/* Session Mode Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card
                className={`p-4 cursor-pointer bloom-hover transition-all ${
                  sessionData.mode === 'solo' ? 'border-primary border-2 shadow-glow-sm' : ''
                }`}
                onClick={() => setSessionData({ ...sessionData, mode: 'solo', maxParticipants: 1 })}
              >
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-bold">Solo Session</h4>
                  <p className="text-xs text-muted-foreground mt-1">Work independently</p>
                </div>
              </Card>
              <Card
                className={`p-4 cursor-pointer bloom-hover transition-all ${
                  sessionData.mode === 'collaborative' ? 'border-primary border-2 shadow-glow-sm' : ''
                }`}
                onClick={() => setSessionData({ ...sessionData, mode: 'collaborative', maxParticipants: 4 })}
              >
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-accent-cyan" />
                  <h4 className="font-bold">Collaborative</h4>
                  <p className="text-xs text-muted-foreground mt-1">Work with others</p>
                </div>
              </Card>
            </div>

            {/* Session Type Selection */}
            <div className="grid gap-4">
              {sessionTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`p-6 cursor-pointer bloom-hover transition-all ${
                    sessionData.type === type.id ? 'border-primary border-2 shadow-glow-sm' : ''
                  }`}
                  onClick={() => setSessionData({ ...sessionData, type: type.id })}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-4 bg-gradient-to-br ${type.gradient} rounded-xl`}>
                      <type.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">{type.label}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    {sessionData.type === type.id && (
                      <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Session Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Music className="w-12 h-12 mx-auto mb-3 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Session Details</h3>
              <p className="text-muted-foreground">Give your session a name and description</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Session Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Summer Vibes Mix Session"
                  value={sessionData.name}
                  onChange={(e) => setSessionData({ ...sessionData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  placeholder="Hip-Hop, R&B, Pop, etc."
                  value={sessionData.genre}
                  onChange={(e) => setSessionData({ ...sessionData, genre: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What are you working on?"
                  value={sessionData.description}
                  onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {sessionData.mode === 'collaborative' && (
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {sessionData.visibility === 'public' ? (
                          <Globe className="w-4 h-4 text-primary" />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <Label htmlFor="visibility" className="text-sm font-medium cursor-pointer">
                          Make session discoverable
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {sessionData.visibility === 'public'
                          ? 'Engineers can discover and request to join your session'
                          : 'Only people you invite can see this session'}
                      </p>
                    </div>
                    <Switch
                      id="visibility"
                      checked={sessionData.visibility === 'public'}
                      onCheckedChange={(checked) =>
                        setSessionData({ ...sessionData, visibility: checked ? 'public' : 'private' })
                      }
                    />
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Step 3: AI Collaborator Suggestions (only for collaborative mode) */}
        {step === 3 && sessionData.mode === 'collaborative' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">AI Recommendations</h3>
              <p className="text-muted-foreground">Perfect collaborators for your session</p>
            </div>

            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-cyan rounded-full flex items-center justify-center text-white font-bold">
                        {suggestion.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-semibold">{suggestion.name}</h4>
                        <p className="text-sm text-muted-foreground">{suggestion.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs">⭐ {suggestion.rating}</span>
                          <span className="text-xs text-muted-foreground">{suggestion.location}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground text-center">
                💡 You can also invite specific people after launching
              </p>
            </Card>
          </div>
        )}

        {/* Step 3/4: Configuration */}
        {((step === 3 && sessionData.mode === 'solo') || (step === 4 && sessionData.mode === 'collaborative')) && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Settings className="w-12 h-12 mx-auto mb-3 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Session Settings</h3>
              <p className="text-muted-foreground">Configure audio quality and participants</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Audio Quality</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['Standard', 'High', 'Ultra'].map((quality) => (
                    <Card
                      key={quality}
                      className={`p-4 cursor-pointer text-center transition-all hover:shadow-lg ${
                        sessionData.audioQuality === quality.toLowerCase()
                          ? 'border-primary border-2'
                          : ''
                      }`}
                      onClick={() => setSessionData({ ...sessionData, audioQuality: quality.toLowerCase() })}
                    >
                      <div className="font-semibold">{quality}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {quality === 'Standard' && '48kHz'}
                        {quality === 'High' && '96kHz'}
                        {quality === 'Ultra' && '192kHz'}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {sessionData.mode === 'collaborative' && (
                <div>
                  <Label className="mb-3 block">Max Participants</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {[2, 4, 6, 8].map((num) => (
                      <Card
                        key={num}
                        className={`p-3 cursor-pointer text-center transition-all hover:shadow-lg ${
                          sessionData.maxParticipants === num ? 'border-primary border-2' : ''
                        }`}
                        onClick={() => setSessionData({ ...sessionData, maxParticipants: num })}
                      >
                        <div className="text-2xl font-bold">{num}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent-cyan/10 border-primary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Ready to Launch!
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your {sessionData.mode === 'solo' ? 'solo' : 'collaborative'} session will be live and ready
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={step === 1 ? onCancel : handleBack}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < totalSteps ? (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleLaunch} className="gap-2 bg-gradient-to-r from-primary to-accent-cyan">
              <Rocket className="w-4 h-4" />
              Launch Session
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SessionCreationWizard;
