import { motion } from 'framer-motion';
import { Coins, Target, Package, Receipt, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { WalletBalance } from './WalletBalance';
import { MissionsList } from './MissionsList';
import { VaultGrid } from './VaultGrid';
import { TransactionLedger } from './TransactionLedger';
import { useMissions } from '@/hooks/useMissions';
import { useMixxVault } from '@/hooks/useMixxVault';

export function MixxEconomy() {
  const { unclaimedRewards } = useMissions();
  const { ownedItems } = useMixxVault();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10">
            <Coins className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">MixxCoinz Economy</h1>
            <p className="text-muted-foreground">Earn, spend, and unlock</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Ownership Economy
        </Badge>
      </div>

      {/* Wallet Balance */}
      <WalletBalance />

      {/* Main Tabs */}
      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="missions" className="gap-2 relative">
            <Target className="h-4 w-4" />
            Missions
            {unclaimedRewards > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="vault" className="gap-2">
            <Package className="h-4 w-4" />
            Vault
            {ownedItems.length > 0 && (
              <span className="text-xs text-muted-foreground">({ownedItems.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-2">
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
