import { ReactNode } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, Briefcase, Search, DollarSign, User, Music, Award, Headphones, Truck, Sparkles, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { RoleSwitcher } from './RoleSwitcher';
import { ResizableAICopilot } from './dashboard/ResizableAICopilot';
import { useAIDashboardInsights } from '@/hooks/useAIDashboardInsights';
import { CursorTrail } from '@/components/effects/CursorTrail';
import { HoverCard3D } from '@/components/interactive/HoverCard3D';

interface CRMLayoutProps {
  children: ReactNode;
  userType: 'artist' | 'engineer';
  profile: any;
  stats: Array<{
    icon: ReactNode;
    label: string;
    value: number | string;
    color: string;
  }>;
  quickActions: Array<{
    label: string;
    icon: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }>;
  isStudioMode?: boolean;
}

export const CRMLayout = ({ children, userType, profile, stats, quickActions, isStudioMode = false }: CRMLayoutProps) => {
  const isMobile = useIsMobile();
  const { insights, isLoading: insightsLoading } = useAIDashboardInsights();
  
  const getLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelPoints = (profile.level - 1) * 1000;
    const progressInLevel = profile.points - currentLevelPoints;
    return (progressInLevel / 1000) * 100;
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: userType === 'engineer' ? '/engineer-crm' : '/artist-crm',
      section: 'dashboard',
    },
    {
      title: 'Studio',
      icon: Headphones,
      path: '/artist-crm?tab=studio',
      section: 'studio',
    },
    {
      title: 'Active Work',
      icon: Briefcase,
      path: userType === 'engineer' ? '/engineer-crm?tab=active-work' : '/artist-crm?tab=active-work',
      section: 'active-work',
    },
    {
      title: 'Opportunities',
      icon: Search,
      path: userType === 'engineer' ? '/engineer-crm?tab=opportunities' : '/artist-crm?tab=opportunities',
      section: 'opportunities',
    },
    {
      title: 'Distribution',
      icon: Truck,
      path: '/distribution',
      section: 'distribution',
    },
    {
      title: 'Business',
      icon: DollarSign,
      path: userType === 'engineer' ? '/engineer-crm?tab=business' : '/artist-crm?tab=business',
      section: 'business',
    },
    {
      title: 'Profile',
      icon: User,
      path: userType === 'engineer' ? '/engineer-crm?tab=profile' : '/artist-crm?tab=profile',
      section: 'profile',
    },
  ];

  // Mobile layout - simplified without nested sidebar
  if (isMobile) {
    return (
      <>
        <CursorTrail />
        {!isStudioMode && <RoleSwitcher />}
        <div className="min-h-screen relative">
          {/* Multi-layer glass depth background */}
          <div className="fixed inset-0 -z-10 bg-gradient-to-br from-midnight via-midnight-light to-ember/10" />
          <div className="fixed inset-0 -z-5 opacity-20" 
            style={{ 
              backgroundImage: `radial-gradient(circle at 20% 50%, hsl(15 95% 58% / 0.15) 0%, transparent 50%),
                               radial-gradient(circle at 80% 80%, hsl(185 90% 52% / 0.1) 0%, transparent 50%)` 
            }} 
          />
          <div className="fixed inset-0 -z-4 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                               linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        {!isStudioMode && <Navigation />}
        
        <div className={isStudioMode ? "" : "pt-20 pb-20 px-4 md:px-6"}>
          {!isStudioMode && (
            <>
              {/* Mobile Header with Gamification */}
              <div className="mb-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                    {userType === 'engineer' ? 'Pro Studio' : 'Your Studio'}
                  </h1>
                  <Sparkles className="w-6 h-6 text-primary animate-pulse-glow" />
                </div>
                <p className="text-muted-foreground text-lg">
                  {userType === 'engineer' 
                    ? "Let's create some magic today 🎚️"
                    : "Let's make some hits today 🎵"
                  }
                </p>
                
                {/* Level Progress */}
                {profile && (
                  <Card variant="glass" hover="glow" className="mt-4 p-4 animate-in slide-in-from-top duration-500">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Level {profile.level || 1}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {profile.points || 0} points
                      </span>
                    </div>
                    <Progress value={getLevelProgress()} className="h-2 bg-muted" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {1000 - ((profile?.points || 0) % 1000)} XP to Level {(profile?.level || 1) + 1}
                    </p>
                  </Card>
                )}
              </div>

              {/* Mobile Quick Stats - Colorful Cards */}
              <ScrollArea className="w-full pb-4">
                <div className="flex gap-3 pb-2">
                  {stats.map((stat, index) => (
                    <HoverCard3D key={index}>
                      <Card 
                        variant="glass"
                        hover="float"
                        className={cn(
                          "p-4 min-w-[160px] flex-shrink-0 animate-in slide-in-from-left cursor-pointer"
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex flex-col gap-2">
                          <div className={cn("p-2 rounded-lg w-fit bg-ember/10 text-ember")}>
                            {stat.icon}
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                          </div>
                        </div>
                      </Card>
                    </HoverCard3D>
                  ))}
                </div>
              </ScrollArea>

              {/* Quick Actions - Glass Pills */}
              <Card variant="glass-heavy" hover="lift" className="p-6 mb-6 animate-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-primary animate-pulse" />
                  <h3 className="font-bold text-lg">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.onClick}
                      variant={action.variant || 'outline'}
                      size="lg"
                      className={cn(
                        "gap-2 h-auto py-4 flex-col items-center justify-center glass-pill hover:scale-105 animate-in zoom-in"
                      )}
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      {action.icon}
                      <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* Main Content with Resizable AI Copilot */}
          <div className={isStudioMode ? "" : "animate-in fade-in duration-1000"}>
            <ResizableAICopilot insights={insights} isLoading={insightsLoading} defaultOpen={!isStudioMode}>
              {children}
            </ResizableAICopilot>
          </div>
        </div>
        </div>
      </>
    );
  }

  // Desktop layout - full width
  return (
    <>
      <CursorTrail />
      {!isStudioMode && <RoleSwitcher />}
      <div className="min-h-screen relative">
        {/* Multi-layer glass depth background */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-midnight via-midnight-light to-ember/10" />
        <div className="fixed inset-0 -z-5 opacity-20" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 20% 50%, hsl(15 95% 58% / 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, hsl(185 90% 52% / 0.1) 0%, transparent 50%)` 
          }} 
        />
        <div className="fixed inset-0 -z-4 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        {!isStudioMode && <Navigation />}
        
        <div className={isStudioMode ? "" : "pt-20 px-4 md:px-6 max-w-[1800px] mx-auto"}>
          {!isStudioMode && (
            <>
              {/* Header with Quick Actions */}
              <div className="mb-3 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse-glow" />
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
                      {userType === 'engineer' ? 'Pro Studio' : 'Your Studio'}
                    </h1>
                  </div>
                  
                  {/* Quick Actions Toolbar */}
                  <div className="hidden lg:flex items-center gap-2">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        onClick={action.onClick}
                        variant={action.variant || 'outline'}
                        size="sm"
                        className="gap-2 hover:scale-105 transition-transform"
                      >
                        {action.icon}
                        <span className="text-xs">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Mobile Quick Actions */}
                <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.onClick}
                      variant={action.variant || 'outline'}
                      size="sm"
                      className="gap-2 whitespace-nowrap flex-shrink-0"
                    >
                      {action.icon}
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Main Content with Resizable AI Copilot */}
          <div className={isStudioMode ? "" : "animate-in fade-in duration-700"}>
            <ResizableAICopilot insights={insights} isLoading={insightsLoading} defaultOpen={!isStudioMode}>
              {children}
            </ResizableAICopilot>
          </div>
        </div>
      </div>
    </>
  );
};
