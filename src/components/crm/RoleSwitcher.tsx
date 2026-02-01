import { Mic2, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { useFlow } from "@/core/fabric/useFlow";

export const RoleSwitcher = () => {
  const { userRoles, activeRole, setActiveRole, isHybridUser } = useAuth();
  const { setIntent } = useFlow();

  if (!isHybridUser || userRoles.length <= 1) return null;

  const handleRoleSwitch = (role: 'artist' | 'engineer') => {
    setActiveRole(role);
    // Use Flow intent for navigation
    setIntent('SWITCH_ROLE', { newRole: role }, { source: 'RoleSwitcher' });
  };

  return (
    <div className="fixed top-20 right-4 z-40 lg:top-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 bg-card/95 backdrop-blur-lg border border-border rounded-full p-1 shadow-lg"
      >
        <Button
          size="sm"
          variant={activeRole === 'artist' ? 'default' : 'ghost'}
          onClick={() => handleRoleSwitch('artist')}
          className="rounded-full"
        >
          <Mic2 className="w-4 h-4 mr-2" />
          Artist
        </Button>
        <Button
          size="sm"
          variant={activeRole === 'engineer' ? 'default' : 'ghost'}
          onClick={() => handleRoleSwitch('engineer')}
          className="rounded-full"
        >
          <Headphones className="w-4 h-4 mr-2" />
          Engineer
        </Button>
      </motion.div>
    </div>
  );
};
