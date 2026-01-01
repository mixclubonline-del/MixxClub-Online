/**
 * MobileOpportunitiesHub - Touch-optimized swipeable opportunity cards
 * Full mobile experience with gestures, bottom sheets, and native feel
 */

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Heart, X, Sparkles, MapPin, Clock, DollarSign,
  Music, Star, ChevronUp, Play, MessageCircle, 
  TrendingUp, Award, Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOpportunities, useOpportunityAction, useMatchAnalytics } from '@/hooks/useOpportunities';
import { cn } from '@/lib/utils';

interface MobileOpportunitiesHubProps {
  userRole: 'artist' | 'engineer';
}

export const MobileOpportunitiesHub = ({ userRole }: MobileOpportunitiesHubProps) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const { data: opportunities = [], isLoading } = useOpportunities(userRole);
  const { data: analytics } = useMatchAnalytics(userRole);
  const { mutate: performAction } = useOpportunityAction();

  const currentOpportunity = opportunities[currentIndex];

  // Swipe gesture values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentOpportunity) return;

    setExitDirection(direction);

    performAction({
      opportunityId: currentOpportunity.id,
      action: direction === 'right' ? 'interested' : 'pass',
      userRole
    });

    if (direction === 'right') {
      toast({
        title: "Match! 💜",
        description: `You liked ${currentOpportunity.artist}'s project!`,
      });
    }

    setTimeout(() => {
      if (currentIndex < opportunities.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
      setExitDirection(null);
      x.set(0);
    }, 300);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      handleSwipe('right');
    } else if (info.offset.x < -100) {
      handleSwipe('left');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Finding opportunities...</p>
        </div>
      </div>
    );
  }

  if (!opportunities.length) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] p-6">
        <Card className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">No Opportunities Yet</h3>
          <p className="text-muted-foreground">
            Check back soon for new {userRole === 'engineer' ? 'gigs' : 'collaborations'}!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] p-4">
      {/* Quick Stats - Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        <Card className="flex-shrink-0 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-lg font-bold">{analytics?.matches || 0}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>
          </div>
        </Card>
        <Card className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-lg font-bold">{analytics?.activeChats || 0}</p>
              <p className="text-xs text-muted-foreground">Chats</p>
            </div>
          </div>
        </Card>
        <Card className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-lg font-bold">{analytics?.completed || 0}</p>
              <p className="text-xs text-muted-foreground">Done</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Swipeable Card Area */}
      <div className="flex-1 relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentOpportunity && (
            <motion.div
              key={currentOpportunity.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              style={{ x, rotate }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                x: exitDirection === 'right' ? 300 : exitDirection === 'left' ? -300 : 0,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.3 }
              }}
              className="absolute w-full max-w-sm touch-none"
            >
              <Card className="overflow-hidden shadow-2xl">
                {/* Like/Nope Indicators */}
                <motion.div
                  style={{ opacity: likeOpacity }}
                  className="absolute top-8 left-8 z-20 rotate-[-15deg]"
                >
                  <Badge className="bg-green-500 text-white text-xl px-4 py-2 border-4 border-green-400">
                    LIKE
                  </Badge>
                </motion.div>
                <motion.div
                  style={{ opacity: nopeOpacity }}
                  className="absolute top-8 right-8 z-20 rotate-[15deg]"
                >
                  <Badge className="bg-red-500 text-white text-xl px-4 py-2 border-4 border-red-400">
                    NOPE
                  </Badge>
                </motion.div>

                {/* Match Score */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {currentOpportunity.matchScore}%
                  </Badge>
                </div>

                {/* Hero */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
                    <AvatarImage src={currentOpportunity.avatar} />
                    <AvatarFallback className="text-3xl">
                      {currentOpportunity.artist[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{currentOpportunity.title}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-muted-foreground">by {currentOpportunity.artist}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 text-sm">{currentOpportunity.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span>{currentOpportunity.budget}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{currentOpportunity.responseTime}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(currentOpportunity.skills) && currentOpportunity.skills.slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {String(skill)}
                      </Badge>
                    ))}
                    {currentOpportunity.skills?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{currentOpportunity.skills.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* See More */}
                  <button
                    onClick={() => setShowDetails(true)}
                    className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground py-2"
                  >
                    <ChevronUp className="w-4 h-4" />
                    See Details
                  </button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6 py-6">
        <Button
          size="lg"
          variant="outline"
          className="w-16 h-16 rounded-full border-2 border-red-500/30 hover:bg-red-500/10"
          onClick={() => handleSwipe('left')}
        >
          <X className="w-8 h-8 text-red-500" />
        </Button>
        <Button
          size="lg"
          className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
          onClick={() => handleSwipe('right')}
        >
          <Heart className="w-10 h-10" />
        </Button>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1 pb-4">
        {opportunities.slice(0, 10).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              idx === currentIndex ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
        {opportunities.length > 10 && (
          <span className="text-xs text-muted-foreground ml-2">
            +{opportunities.length - 10}
          </span>
        )}
      </div>

      {/* Detail Bottom Sheet */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          {currentOpportunity && (
            <div className="overflow-y-auto h-full pb-20">
              <SheetHeader className="text-left">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={currentOpportunity.avatar} />
                    <AvatarFallback>{currentOpportunity.artist[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle>{currentOpportunity.title}</SheetTitle>
                    <SheetDescription>by {currentOpportunity.artist}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Match Analysis */}
                <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-bold">AI Match Analysis</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentOpportunity.matchScore}% compatibility based on your skills, 
                    genre preferences, and past collaboration success.
                  </p>
                </Card>

                {/* Full Description */}
                <div>
                  <h4 className="font-bold mb-2">Project Details</h4>
                  <p className="text-muted-foreground">{currentOpportunity.description}</p>
                </div>

                {/* All Skills */}
                <div>
                  <h4 className="font-bold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(currentOpportunity.skills) && currentOpportunity.skills.map((skill, i) => (
                      <Badge key={i} variant="outline">{String(skill)}</Badge>
                    ))}
                  </div>
                </div>

                {/* Budget & Timeline */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <DollarSign className="w-5 h-5 text-green-500 mb-2" />
                    <p className="font-bold">{currentOpportunity.budget}</p>
                    <p className="text-xs text-muted-foreground">Budget</p>
                  </Card>
                  <Card className="p-4">
                    <Clock className="w-5 h-5 text-blue-500 mb-2" />
                    <p className="font-bold">{currentOpportunity.responseTime}</p>
                    <p className="text-xs text-muted-foreground">Response Time</p>
                  </Card>
                </div>
              </div>

              {/* Fixed Bottom Actions */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t">
                <div className="flex gap-3 max-w-md mx-auto">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowDetails(false);
                      handleSwipe('left');
                    }}
                  >
                    <X className="w-5 h-5 mr-2 text-red-500" />
                    Pass
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                    onClick={() => {
                      setShowDetails(false);
                      handleSwipe('right');
                    }}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    I'm In!
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
