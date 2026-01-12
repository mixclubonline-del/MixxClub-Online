import { motion } from 'framer-motion';
import { 
  Store, DollarSign, CreditCard, Package, ShoppingBag,
  TrendingUp, ArrowRight, Wallet, Banknote
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DistrictPortal } from '@/components/ui/DistrictPortal';
import { cn } from '@/lib/utils';

const revenueStreams = [
  { name: 'Mixing Services', amount: 450, icon: Package, color: 'from-purple-500 to-pink-500' },
  { name: 'Beat Sales', amount: 320, icon: ShoppingBag, color: 'from-orange-500 to-red-500' },
  { name: 'Mastering', amount: 280, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
  { name: 'Collaborations', amount: 184, icon: CreditCard, color: 'from-blue-500 to-cyan-500' },
];

const pendingPayouts = [
  { source: 'Session with @artist123', amount: 150, status: 'Processing' },
  { source: 'Beat purchase', amount: 49, status: 'Ready' },
  { source: 'Mastering project', amount: 99, status: 'Ready' },
];

const marketplaceItems = [
  { title: 'Lo-Fi Beat Pack', price: 29, sales: 12 },
  { title: 'Drum Kit Vol. 2', price: 19, sales: 28 },
  { title: 'Vocal Presets', price: 15, sales: 45 },
];

export default function CommerceDistrict() {
  const totalRevenue = revenueStreams.reduce((sum, stream) => sum + stream.amount, 0);
  const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <DistrictPortal districtId="commerce">
      <div className="p-6 md:p-8 pb-24">
        {/* Revenue Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-muted-foreground">Total Revenue</span>
              </div>
              <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
              <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                +23% this month
              </Badge>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <Banknote className="w-5 h-5 text-green-400" />
                <span className="text-sm text-muted-foreground">Pending Payouts</span>
              </div>
              <p className="text-3xl font-bold">${pendingAmount}</p>
              <Button size="sm" variant="outline" className="mt-2 text-xs">
                Withdraw
              </Button>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <Store className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-muted-foreground">Marketplace Items</span>
              </div>
              <p className="text-3xl font-bold">{marketplaceItems.length}</p>
              <Button size="sm" variant="outline" className="mt-2 text-xs gap-1">
                Add Item <ArrowRight className="w-3 h-3" />
              </Button>
            </Card>
          </div>
        </motion.div>

        {/* Revenue Streams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Revenue Streams</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {revenueStreams.map((stream, index) => (
              <motion.div
                key={stream.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Card className="p-4 bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all cursor-pointer">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br mb-3",
                    stream.color
                  )}>
                    <stream.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg font-bold">${stream.amount}</p>
                  <p className="text-xs text-muted-foreground">{stream.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Payouts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Pending Payouts
              </h3>
              <div className="space-y-3">
                {pendingPayouts.map((payout, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{payout.source}</p>
                      <p className="text-xs text-muted-foreground">${payout.amount}</p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={cn(
                        payout.status === 'Ready' ? 'border-green-500/50 text-green-400' : 'border-yellow-500/50 text-yellow-400'
                      )}
                    >
                      {payout.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Marketplace Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                Your Store
              </h3>
              <div className="space-y-3">
                {marketplaceItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.sales} sales</p>
                    </div>
                    <span className="font-semibold text-green-400">${item.price}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </DistrictPortal>
  );
}
