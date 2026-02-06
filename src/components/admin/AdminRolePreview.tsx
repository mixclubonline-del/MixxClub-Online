import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAdminPreview } from '@/stores/useAdminPreview';
import { Button } from '@/components/ui/button';
import { Eye, X, Mic2, Headphones, Piano, Heart } from 'lucide-react';

const roleConfig = {
  artist: { label: 'Artist', icon: Mic2, accent: 'hsl(280 70% 50%)' },
  engineer: { label: 'Engineer', icon: Headphones, accent: 'hsl(30 90% 50%)' },
  producer: { label: 'Producer', icon: Piano, accent: 'hsl(45 90% 50%)' },
  fan: { label: 'Fan', icon: Heart, accent: 'hsl(330 80% 60%)' },
};

export const AdminRolePreview: React.FC = () => {
  const { previewRole, isPreviewMode, exitPreview } = useAdminPreview();
  const navigate = useNavigate();

  if (!isPreviewMode || !previewRole) return null;

  const config = roleConfig[previewRole];
  const Icon = config.icon;

  const handleExit = () => {
    exitPreview();
    navigate('/admin');
  };

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center"
    >
      <div
        className="flex items-center gap-3 px-5 py-2.5 rounded-b-xl backdrop-blur-xl border border-border/40 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${config.accent}22, ${config.accent}11)` }}
      >
        <Eye className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: `${config.accent}33` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: config.accent }} />
          </div>
          <span className="text-sm font-medium text-foreground">
            Previewing as <span className="font-bold" style={{ color: config.accent }}>{config.label}</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExit}
          className="ml-2 h-7 px-2.5 text-xs hover:bg-destructive/20 hover:text-destructive"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Exit Preview
        </Button>
      </div>
    </motion.div>
  );
};
