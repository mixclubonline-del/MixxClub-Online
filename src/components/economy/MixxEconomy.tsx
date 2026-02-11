import { motion } from 'framer-motion';
import { Target, Package, Receipt, Sparkles, Zap, Crown, Waves } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { WalletBalance } from './WalletBalance';
import { MissionsList } from './MissionsList';
import { VaultGrid } from './VaultGrid';
import { TransactionLedger } from './TransactionLedger';
import { MixxCoin3D } from './MixxCoin3D';
import { useMissions } from '@/hooks/useMissions';
import { useMixxVault } from '@/hooks/useMixxVault';

export function MixxEconomy() {
  const { unclaimedRewards } = useMissions();
  const { ownedItems } = useMixxVault();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <div className="relative -mx-4 md:-mx-6 overflow-hidden rounded-2xl">
        {/* Dark cosmic background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1117 30%, #0a0a1a 60%, #111827 100%)',
          }}
        />

        {/* Nebula gradients */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 25% 50%, rgba(6,182,212,0.12) 0%, transparent 50%), radial-gradient(ellipse at 75% 50%, rgba(245,158,11,0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.08) 0%, transparent 60%)',
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Hero coin display */}
        <div className="relative z-10 h-64 md:h-80 lg:h-96">
          <MixxCoin3D type="both" autoRotate className="absolute inset-0" />
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/60 to-transparent z-20" />

        {/* Hero text overlay */}
        <motion.div
          className="absolute bottom-6 left-0 right-0 z-30 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              MixxCoinz Economy
            </span>
          </h1>
          <p className="text-sm text-white/50 max-w-md mx-auto">
            Earn through creation. Spend on premium services. Own your value.
          </p>
        </motion.div>
      </div>

      {/* ═══════════════ DUAL COIN LEGEND ═══════════════ */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          className="relative overflow-hidden rounded-xl border border-cyan-500/15 p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.04) 100%)',
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="absolute -top-8 -right-8 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-cyan-400/30">
              <img src="/assets/economy/coin-earned.png" alt="Earned" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">Earned Coinz</p>
              <p className="text-[10px] text-cyan-400/70 uppercase tracking-wider">Soundwave</p>
            </div>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Earned through missions, mix battles, and community contribution.
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Waves className="w-3 h-3 text-cyan-400/50" />
            <span className="text-[10px] text-cyan-400/50">Proof of Work</span>
          </div>
        </motion.div>

        <motion.div
          className="relative overflow-hidden rounded-xl border border-amber-500/15 p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.04) 100%)',
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="absolute -top-8 -right-8 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-amber-400/30">
              <img src="/assets/economy/coin-purchased.png" alt="Purchased" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">Premium Coinz</p>
              <p className="text-[10px] text-amber-400/70 uppercase tracking-wider">Crown</p>
            </div>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Purchased to unlock premium services, beats, and exclusive access.
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Crown className="w-3 h-3 text-amber-400/50" />
            <span className="text-[10px] text-amber-400/50">Premium Access</span>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════ WALLET BALANCE ═══════════════ */}
      <WalletBalance />

      {/* ═══════════════ QUICK ACTIONS ═══════════════ */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { label: 'Earn', icon: Zap, color: 'text-cyan-400', bg: 'rgba(6,182,212,0.08)', border: 'border-cyan-500/15' },
          { label: 'Buy', icon: Crown, color: 'text-amber-400', bg: 'rgba(245,158,11,0.08)', border: 'border-amber-500/15' },
          { label: 'Send', icon: Sparkles, color: 'text-pink-400', bg: 'rgba(244,114,182,0.08)', border: 'border-pink-500/15' },
        ].map(({ label, icon: Icon, color, bg, border }) => (
          <button
            key={label}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${border} transition-all hover:scale-105 active:scale-95`}
            style={{ background: bg }}
          >
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-xs font-medium text-white/70">{label}</span>
          </button>
        ))}
      </motion.div>

      {/* ═══════════════ MAIN TABS ═══════════════ */}
      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-white/[0.03] border border-white/[0.06]">
          <TabsTrigger value="missions" className="gap-2 relative data-[state=active]:bg-primary/10">
            <Target className="h-4 w-4" />
            Missions
            {unclaimedRewards > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                !
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="vault" className="gap-2 data-[state=active]:bg-primary/10">
            <Package className="h-4 w-4" />
            Vault
            {ownedItems.length > 0 && (
              <span className="text-xs text-muted-foreground">({ownedItems.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-2 data-[state=active]:bg-primary/10">
            <Receipt className="h-4 w-4" />
            Ledger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="mt-6">
          <MissionsList />
        </TabsContent>

        <TabsContent value="vault" className="mt-6">
          <VaultGrid />
        </TabsContent>

        <TabsContent value="ledger" className="mt-6">
          <TransactionLedger />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default MixxEconomy;
