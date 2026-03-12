import { SlideLayout, SlideTitle, SlideLabel } from './SlideLayout';
import { Crown, Code2, Music, Palette } from 'lucide-react';

const TEAM = [
  {
    icon: Crown,
    name: 'Ravenis Prime',
    role: 'Founder & CEO',
    bio: 'Creator-engineer with deep roots in Atlanta music culture. Built the entire Mixx Club platform from concept to production — product, engineering, design, and brand.',
    color: 'text-primary',
  },
];

const ROLES_NEEDED = [
  { icon: Code2, title: 'CTO / Lead Engineer', desc: 'Scale real-time infrastructure, audio processing pipeline' },
  { icon: Music, title: 'Head of Creator Relations', desc: 'Onboard engineers and artists, build the supply side' },
  { icon: Palette, title: 'Head of Product Design', desc: 'Refine the F.L.O.W.-conscious interface system' },
];

export function TeamSlide() {
  return (
    <SlideLayout>
      <SlideLabel>The Team</SlideLabel>
      <SlideTitle>Builder-Led, Culture-Rooted</SlideTitle>

      <div className="flex-1 flex gap-16 mt-10">
        {/* Founder */}
        <div className="w-[600px] flex flex-col justify-center">
          {TEAM.map((member) => (
            <div key={member.name} className="rounded-3xl bg-card/50 border border-primary/30 p-12">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8">
                <member.icon className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-[36px] font-bold text-foreground">{member.name}</h3>
              <p className={`text-[22px] ${member.color} mt-1 mb-6`}>{member.role}</p>
              <p className="text-[20px] text-muted-foreground leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>

        {/* Key hires */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-[28px] font-semibold text-foreground mb-8">Key Hires — Funded by This Round</h3>
          <div className="space-y-6">
            {ROLES_NEEDED.map((role) => (
              <div key={role.title} className="flex items-start gap-6 p-8 rounded-2xl bg-card/30 border border-border/20">
                <div className="w-14 h-14 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                  <role.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h4 className="text-[24px] font-semibold text-foreground">{role.title}</h4>
                  <p className="text-[18px] text-muted-foreground mt-1">{role.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
