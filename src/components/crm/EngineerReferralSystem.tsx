import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Star, Music, Send, Check, Gift } from 'lucide-react';
import { toast } from 'sonner';

interface EngineerReferral {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  rating: number;
  projects: number;
  reason: string;
}

interface EngineerReferralSystemProps {
  projectId: string;
  currentEngineer?: {
    id: string;
    name: string;
  };
}

export const EngineerReferralSystem = ({ 
  projectId, 
  currentEngineer 
}: EngineerReferralSystemProps) => {
  const [referrals] = useState<EngineerReferral[]>([
    {
      id: '1',
      name: 'Marcus Rivera',
      specialty: 'Vocal Production',
      rating: 4.9,
      projects: 85,
      reason: 'Perfect for vocal tuning and harmonies'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      specialty: 'Mastering',
      rating: 5.0,
      projects: 120,
      reason: 'Specialist in electronic music mastering'
    },
    {
      id: '3',
      name: 'James Foster',
      specialty: 'Live Instruments',
      rating: 4.8,
      projects: 95,
      reason: 'Expert in recording and mixing live bands'
    }
  ]);

  const [sentReferrals, setSentReferrals] = useState<Set<string>>(new Set());

  const handleSendReferral = (engineerId: string, engineerName: string) => {
    setSentReferrals(new Set(sentReferrals).add(engineerId));
    toast.success(`Referral sent to ${engineerName}`);
  };

  if (!currentEngineer) return null;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Specialist Recommendations
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {currentEngineer.name} recommends these pros for specialized services
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/5 border-primary/20">
            <Gift className="w-3 h-3 mr-1" />
            Earn $25 per referral
          </Badge>
        </div>

        {/* Info Banner */}
        <Card className="p-4 bg-accent/5 border-dashed">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Building Your Team:</strong> These specialists can help take specific 
            elements of your track to the next level while keeping your main engineer in the loop.
          </p>
        </Card>

        {/* Referrals List */}
        <div className="space-y-3">
          {referrals.map((engineer) => {
            const isSent = sentReferrals.has(engineer.id);
            
            return (
              <Card 
                key={engineer.id} 
                className="p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={engineer.avatar} />
                    <AvatarFallback className="bg-primary/10">
                      {engineer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{engineer.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {engineer.specialty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{engineer.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        <span>{engineer.projects} tracks</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground italic">
                      "{engineer.reason}"
                    </p>
                  </div>

                  {/* Action */}
                  <Button
                    size="sm"
                    variant={isSent ? 'outline' : 'default'}
                    onClick={() => handleSendReferral(engineer.id, engineer.name)}
                    disabled={isSent}
                  >
                    {isSent ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Sent
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* How It Works */}
        <Card className="p-4 bg-primary/5 border-primary/10">
          <p className="text-sm font-medium mb-2">How Referrals Work:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Your main engineer stays in the project as the lead</li>
            <li>• Specialists collaborate on specific elements</li>
            <li>• All work is coordinated through the shared workspace</li>
            <li>• You maintain full creative control</li>
          </ul>
        </Card>
      </div>
    </Card>
  );
};