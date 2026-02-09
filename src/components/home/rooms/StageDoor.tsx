/**
 * The Stage Door
 * 
 * Room 6: Your seat is waiting.
 * Cinematic full-bleed CTA with glassmorphic overlay and dynamic unlock messaging.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClubRoom } from '../ClubRoom';
import { Button } from '@/components/ui/button';
import { HomeFooter } from '../HomeFooter';
import { useCommunityMilestones } from '@/hooks/useCommunityMilestones';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import studioConsoleImg from '@/assets/promo/studio-console-hero.jpg';

interface StageDoorProps {
  onJoin: () => void;
}

export function StageDoor({ onJoin }: StageDoorProps) {
  const { data: milestones, isLoading } = useCommunityMilestones();
  const [videoBgUrl, setVideoBgUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchStageBg = async () => {
      const { data } = await supabase
        .from('brand_assets')
        .select('public_url, asset_type')
        .eq('asset_context', 'club_stage_bg')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      
      if (data?.asset_type === 'video' && data.public_url) {
        setVideoBgUrl(data.public_url);
      }
    };
    fetchStageBg();
  }, []);

  const nextMilestone = milestones.find((m) => !m.is_unlocked);
  const isNearUnlock = nextMilestone && nextMilestone.progress_percentage >= 80;
  const membersNeeded = nextMilestone 
    ? nextMilestone.target_value - nextMilestone.current_value 
    : 0;

  return (
    <ClubRoom id="stage" className="bg-background flex flex-col relative overflow-hidden">
      {/* Full-bleed cinematic background */}
      <div className="absolute inset-0">
        {videoBgUrl ? (
          <video
            src={videoBgUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{ opacity: 0.18 }}
          />
        ) : (
          <img
            src={studioConsoleImg}
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.18 }}
            loading="lazy"
          />
        )}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, hsl(var(--background) / 0.5) 0%, hsl(var(--background) / 0.35) 40%, hsl(var(--background) / 0.35) 60%, hsl(var(--background) / 0.65) 100%)`
          }}
        />
      </div>

      {/* Ambient glow orbs */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Main CTA — Enhanced Glassmorphic Container */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          className="rounded-3xl p-8 md:p-12 border flex flex-col items-center max-w-2xl w-full"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            boxShadow: '0 0 100px -30px hsl(var(--primary) / 0.15)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Logo glow */}
          <motion.div className="relative mb-8">
            <motion.div
              className="absolute inset-0 w-32 h-32 rounded-full blur-3xl"
              style={{ background: 'hsl(var(--primary) / 0.25)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <span className="relative text-5xl md:text-7xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              MIXXCLUB
            </span>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-2xl md:text-3xl font-bold text-muted-foreground mb-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            From Bedroom to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Billboard.
            </span>
          </motion.p>

          {/* Milestone Progress */}
          {nextMilestone && (
            <motion.div
              className="w-full max-w-md mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div
                className="p-4 rounded-xl border"
                style={{
                  background: 'hsl(var(--primary) / 0.04)',
                  borderColor: 'hsl(var(--primary) / 0.15)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Unlocking: {nextMilestone.milestone_name}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {nextMilestone.progress_percentage}%
                  </span>
                </div>
                <Progress value={nextMilestone.progress_percentage} className="h-2" />
                <p className="mt-2 text-xs text-center text-muted-foreground">
                  {membersNeeded} more {membersNeeded === 1 ? 'member' : 'members'} to unlock
                </p>
              </div>
            </motion.div>
          )}

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={onJoin}
              size="lg"
              className={`group text-lg px-10 py-6 h-auto ${isNearUnlock ? 'animate-pulse' : ''}`}
            >
              {isNearUnlock ? 'Help Us Unlock!' : 'Join the Club'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Sign in link */}
          <motion.p
            className="mt-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            Already a member?{' '}
            <Link 
              to="/auth?mode=login" 
              className="text-primary hover:underline"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative">
        <HomeFooter />
      </div>
    </ClubRoom>
  );
}
