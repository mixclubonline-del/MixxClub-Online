import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { TrendingDown, Package } from 'lucide-react';

export const BulkPricingSection = () => {
  const bulkDeals = [
    { tracks: 5, discount: '15%', savings: '$59' },
    { tracks: 10, discount: '20%', savings: '$158' },
    { tracks: 15, discount: '25%', savings: '$296', label: 'Album Deal' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-12"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <TrendingDown className="w-6 h-6 text-green-500" />
          <h3 className="text-2xl md:text-3xl font-bold">Save More with Bulk Pricing</h3>
        </div>
        <p className="text-muted-foreground">
          Working on an EP or album? Get bigger discounts on multiple tracks
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {bulkDeals.map((deal, idx) => (
          <Card key={idx} className={`p-6 text-center hover:shadow-xl transition-all ${
            deal.label ? 'border-2 border-primary' : ''
          }`}>
            {deal.label && (
              <Badge className="mb-4 bg-primary text-primary-foreground">
                {deal.label}
              </Badge>
            )}
            
            <Package className="w-12 h-12 text-primary mx-auto mb-4" />
            
            <div className="mb-4">
              <div className="text-4xl font-bold mb-2">{deal.tracks}</div>
              <div className="text-muted-foreground">tracks</div>
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {deal.discount} OFF
              </div>
              <div className="text-sm text-muted-foreground">
                Save {deal.savings}
              </div>
            </div>

            <Button className="w-full" variant={deal.label ? 'default' : 'outline'}>
              Get {deal.discount} Discount
            </Button>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Pro Tip:</strong> Subscribe to MixClub Pro for an additional 20% off all bulk packages
        </p>
      </div>
    </motion.div>
  );
};
