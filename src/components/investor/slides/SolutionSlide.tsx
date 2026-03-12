import { SlideLayout, SlideTitle, SlideLabel } from './SlideLayout';
import { Mic2, Headphones, Music, Heart } from 'lucide-react';

const ROLES = [
  { icon: Mic2, label: 'Artists', desc: 'Upload, collaborate, distribute, and earn — all in one place', color: 'text-primary' },
  { icon: Headphones, label: 'Engineers', desc: 'Find work, manage clients, deliver mixes in real-time sessions', color: 'text-secondary' },
  { icon: Music, label: 'Producers', desc: 'Sell beats, track royalties, build partnerships with artists', color: 'text-accent' },
  { icon: Heart, label: 'Fans', desc: 'Discover early, support artists, earn Day-1 recognition & rewards', color: 'text-pink-400' },
];

export function SolutionSlide() {
  return (
    <SlideLayout>
      <SlideLabel>The Solution</SlideLabel>
      <SlideTitle>The Atlanta Model — A Non-Extractive Ecosystem</SlideTitle>
      <p className="text-[28px] text-muted-foreground mt-4 max-w-[1200px]">
        Mixx Club connects all four roles in a cyclical economy where every participant creates value — and keeps it.
      </p>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-[800px] h-[500px]">
          {/* Central hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex items-center justify-center">
            <span className="text-[24px] font-bold text-primary">MIXX<br/>CLUB</span>
          </div>

          {/* Role nodes */}
          {ROLES.map((role, i) => {
            const positions = [
              { left: '50%', top: '0', translate: '-translate-x-1/2' },
              { left: '100%', top: '50%', translate: '-translate-x-full -translate-y-1/2' },
              { left: '50%', top: '100%', translate: '-translate-x-1/2 -translate-y-full' },
              { left: '0', top: '50%', translate: '-translate-y-1/2' },
            ];
            const pos = positions[i];
            return (
              <div key={role.label} className={`absolute ${pos.translate}`} style={{ left: pos.left, top: pos.top }}>
                <div className="flex items-center gap-4 bg-card/80 border border-border/30 rounded-2xl p-6 min-w-[280px]">
                  <role.icon className={`w-10 h-10 ${role.color} shrink-0`} />
                  <div>
                    <h3 className={`text-[24px] font-bold ${role.color}`}>{role.label}</h3>
                    <p className="text-[16px] text-muted-foreground leading-snug">{role.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SlideLayout>
  );
}
