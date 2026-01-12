import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Users, 
  Music, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Mic2,
  Headphones,
  Calendar,
  TrendingUp,
  Star
} from 'lucide-react';

interface WelcomeExperienceProps {
  userType: 'artist' | 'engineer';
  userName?: string;
  onDismiss?: () => void;
}

export const WelcomeExperience = ({ userType, userName, onDismiss }: WelcomeExperienceProps) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const artistActions = [
    {
      icon: <Mic2 className="w-5 h-5" />,
      title: "Start Your First Session",
      description: "Create a collaboration session and invite engineers",
      action: () => navigate('/sessions/create'),
      primary: true,
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Browse Engineers",
      description: "Find the perfect match for your sound",
      action: () => navigate('/sessions-browser'),
    },
    {
      icon: <Music className="w-5 h-5" />,
      title: "Upload Your Track",
      description: "Get it ready for professional mixing",
      action: () => navigate('/upload'),
    },
  ];

  const engineerActions = [
    {
      icon: <Headphones className="w-5 h-5" />,
      title: "Complete Your Profile",
      description: "Set your rates, specialties, and portfolio",
      action: () => navigate('?tab=profile'),
      primary: true,
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Browse Open Sessions",
      description: "Find artists looking for your expertise",
      action: () => navigate('/sessions-browser'),
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "Set Your Rates",
      description: "Define your pricing structure",
      action: () => navigate('?tab=settings'),
    },
  ];

  const actions = userType === 'artist' ? artistActions : engineerActions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-cyan-500/5">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Welcome to MixClub{userName ? `, ${userName}` : ''}! 🎉
                </CardTitle>
                <CardDescription className="mt-1">
                  {userType === 'artist' 
                    ? "Your music career command center is ready. Let's get you started."
                    : "Your audio business HQ is set up. Here's how to start earning."
                  }
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-muted-foreground">
              Dismiss
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actions.map((action, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                onClick={action.action}
                className={`group relative p-4 rounded-xl text-left transition-all ${
                  action.primary
                    ? 'bg-primary/20 border-2 border-primary hover:bg-primary/30'
                    : 'bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card'
                }`}
              >
                {action.primary && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                    Recommended
                  </Badge>
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                  action.primary ? 'bg-primary/30 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
                <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface EmptyStatePromptProps {
  type: 'sessions' | 'projects' | 'earnings' | 'messages' | 'matches';
  userType: 'artist' | 'engineer';
}

export const EmptyStatePrompt = ({ type, userType }: EmptyStatePromptProps) => {
  const navigate = useNavigate();

  const prompts = {
    sessions: {
      artist: {
        icon: <Mic2 className="w-8 h-8" />,
        title: "No sessions yet",
        description: "Start your first collaboration session to work with professional engineers.",
        action: "Create Session",
        onClick: () => navigate('/sessions/create'),
      },
      engineer: {
        icon: <Headphones className="w-8 h-8" />,
        title: "No sessions yet",
        description: "Browse open sessions from artists looking for your expertise.",
        action: "Browse Sessions",
        onClick: () => navigate('/sessions-browser'),
      },
    },
    projects: {
      artist: {
        icon: <Music className="w-8 h-8" />,
        title: "No projects yet",
        description: "Upload your first track to get it professionally mixed and mastered.",
        action: "Upload Track",
        onClick: () => navigate('/upload'),
      },
      engineer: {
        icon: <Music className="w-8 h-8" />,
        title: "No projects yet",
        description: "Complete your profile to start receiving project invitations.",
        action: "Complete Profile",
        onClick: () => navigate('?tab=profile'),
      },
    },
    earnings: {
      artist: {
        icon: <DollarSign className="w-8 h-8" />,
        title: "Track your investments",
        description: "Your spending on mixing and mastering services will appear here.",
        action: "View Services",
        onClick: () => navigate('/services'),
      },
      engineer: {
        icon: <DollarSign className="w-8 h-8" />,
        title: "Start earning",
        description: "Complete projects to build your earnings. Set competitive rates to attract clients.",
        action: "Set Rates",
        onClick: () => navigate('?tab=settings'),
      },
    },
    messages: {
      artist: {
        icon: <Users className="w-8 h-8" />,
        title: "No messages yet",
        description: "Connect with engineers to start collaborating on your music.",
        action: "Find Engineers",
        onClick: () => navigate('/sessions-browser'),
      },
      engineer: {
        icon: <Users className="w-8 h-8" />,
        title: "No messages yet",
        description: "Complete your profile to attract artists and start receiving inquiries.",
        action: "Complete Profile",
        onClick: () => navigate('?tab=profile'),
      },
    },
    matches: {
      artist: {
        icon: <Sparkles className="w-8 h-8" />,
        title: "Finding your matches",
        description: "Our AI is analyzing your profile to find the perfect engineers for your sound.",
        action: "Update Preferences",
        onClick: () => navigate('?tab=profile'),
      },
      engineer: {
        icon: <Sparkles className="w-8 h-8" />,
        title: "Get matched with artists",
        description: "Add your specialties and portfolio to get matched with compatible artists.",
        action: "Add Specialties",
        onClick: () => navigate('?tab=profile'),
      },
    },
  };

  const prompt = prompts[type][userType];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground">
        {prompt.icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{prompt.title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{prompt.description}</p>
      <Button onClick={prompt.onClick}>
        {prompt.action}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
};

interface RecommendedEngineersProps {
  limit?: number;
}

export const RecommendedEngineers = ({ limit = 3 }: RecommendedEngineersProps) => {
  const navigate = useNavigate();

  // Demo data - in production this would come from the database
  const engineers = [
    { name: "Marcus Williams", specialty: "Mixing • Hip-Hop", rating: 4.9, projects: 156, avatar: "MW" },
    { name: "Aaliyah Johnson", specialty: "Mastering • R&B", rating: 4.8, projects: 89, avatar: "AJ" },
    { name: "Devon Taylor", specialty: "Vocal Production", rating: 4.9, projects: 234, avatar: "DT" },
  ].slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Recommended Engineers
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/sessions-browser')}>
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {engineers.map((engineer, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => navigate('/sessions-browser')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                  {engineer.avatar}
                </div>
                <div>
                  <p className="font-medium">{engineer.name}</p>
                  <p className="text-sm text-muted-foreground">{engineer.specialty}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {engineer.rating}
                </div>
                <p className="text-xs text-muted-foreground">{engineer.projects} projects</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface OpenSessionsForEngineersProps {
  limit?: number;
}

export const OpenSessionsForEngineers = ({ limit = 3 }: OpenSessionsForEngineersProps) => {
  const navigate = useNavigate();

  // Demo data
  const sessions = [
    { title: "Late Night R&B Session", artist: "Jasmine K.", genre: "R&B", budget: "$200-300", urgent: true },
    { title: "Trap Album Mix", artist: "Tyrell B.", genre: "Trap", budget: "$150-250", urgent: false },
    { title: "Single Mastering", artist: "Crystal M.", genre: "Hip-Hop", budget: "$75-100", urgent: true },
  ].slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Open Sessions Looking for Engineers
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/sessions-browser')}>
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:border-cyan-500/30 transition-colors cursor-pointer"
              onClick={() => navigate('/sessions-browser')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-primary flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{session.title}</p>
                    {session.urgent && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Urgent</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">by {session.artist} • {session.genre}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-400">{session.budget}</p>
                <p className="text-xs text-muted-foreground">Budget</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface ProfileCompletionPromptProps {
  completionPercentage: number;
  missingItems: string[];
}

export const ProfileCompletionPrompt = ({ completionPercentage, missingItems }: ProfileCompletionPromptProps) => {
  const navigate = useNavigate();

  if (completionPercentage >= 100) return null;

  return (
    <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-yellow-500/5">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-orange-500/20">
            <TrendingUp className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Complete Your Profile to Get More Matches</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Profiles with 100% completion get 3x more project invitations.
            </p>
            <Progress value={completionPercentage} className="h-2 mb-3" />
            <div className="flex flex-wrap gap-2 mb-4">
              {missingItems.slice(0, 3).map((item, idx) => (
                <Badge key={idx} variant="outline" className="border-orange-500/30 text-orange-400">
                  + Add {item}
                </Badge>
              ))}
            </div>
            <Button size="sm" onClick={() => navigate('?tab=profile')}>
              Complete Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
