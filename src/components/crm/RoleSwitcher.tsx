 import { Mic2, Headphones, Disc3, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

 type SwitchableRole = 'artist' | 'engineer' | 'producer' | 'fan';
 
 const ROLE_CONFIG: Record<SwitchableRole, { icon: typeof Mic2; label: string; path: string }> = {
   producer: { icon: Disc3, label: 'Producer', path: '/producer-crm' },
   artist: { icon: Mic2, label: 'Artist', path: '/artist-crm' },
   engineer: { icon: Headphones, label: 'Engineer', path: '/engineer-crm' },
   fan: { icon: Heart, label: 'Fan', path: '/fan-hub' },
 };
 
export const RoleSwitcher = () => {
  const { userRoles, activeRole, setActiveRole, isHybridUser } = useAuth();
  const navigate = useNavigate();

  if (!isHybridUser || userRoles.length <= 1) return null;

   // Filter to only switchable roles the user has
   const switchableRoles = userRoles.filter(
     (r): r is SwitchableRole => r in ROLE_CONFIG
   );
 
   if (switchableRoles.length <= 1) return null;
 
   const handleRoleSwitch = (role: SwitchableRole) => {
    setActiveRole(role);
     const config = ROLE_CONFIG[role];
     navigate(config.path);
  };

  return (
    <div className="fixed top-20 right-4 z-40 lg:top-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
         className="flex items-center gap-1 bg-card/95 backdrop-blur-lg border border-border rounded-full p-1 shadow-lg"
      >
         {switchableRoles.map((role) => {
           const config = ROLE_CONFIG[role];
           const Icon = config.icon;
           return (
             <Button
               key={role}
               size="sm"
               variant={activeRole === role ? 'default' : 'ghost'}
               onClick={() => handleRoleSwitch(role)}
               className="rounded-full px-3"
             >
               <Icon className="w-4 h-4 mr-1.5" />
               {config.label}
             </Button>
           );
         })}
      </motion.div>
    </div>
  );
};
