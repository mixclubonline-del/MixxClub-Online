import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminPreview } from '@/stores/useAdminPreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Mic2, Headphones, Piano, Heart } from 'lucide-react';

const roles = [
  { id: 'artist' as const, label: 'Artist', icon: Mic2, route: '/artist-crm', accent: 'hsl(280 70% 50%)' },
  { id: 'engineer' as const, label: 'Engineer', icon: Headphones, route: '/engineer-crm', accent: 'hsl(30 90% 50%)' },
  { id: 'producer' as const, label: 'Producer', icon: Piano, route: '/producer-crm', accent: 'hsl(45 90% 50%)' },
  { id: 'fan' as const, label: 'Fan', icon: Heart, route: '/fan-hub', accent: 'hsl(330 80% 60%)' },
];

export const AdminViewAsRole: React.FC = () => {
  const navigate = useNavigate();
  const { enterPreview } = useAdminPreview();

  const handlePreview = (role: typeof roles[number]) => {
    enterPreview(role.id);
    navigate(role.route);
  };

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="w-4 h-4" /> View as Role
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Preview the platform experience for any role. Your admin privileges remain unchanged.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Button
                key={role.id}
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1.5 hover:scale-105 transition-transform"
                onClick={() => handlePreview(role)}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: `${role.accent}22` }}
                >
                  <Icon className="w-4 h-4" style={{ color: role.accent }} />
                </div>
                <span className="text-xs font-medium">{role.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
