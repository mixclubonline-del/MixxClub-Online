import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export const ComparisonTable = () => {
  const features = [
    { name: 'Human Engineer', landr: false, emastered: false, starter: true, pro: true },
    { name: 'AI Enhancement', landr: true, emastered: true, starter: true, pro: true },
    { name: 'Unlimited Revisions', landr: false, emastered: false, starter: false, pro: true },
    { name: 'Real-time Collaboration', landr: false, emastered: false, starter: true, pro: true },
    { name: 'Portfolio Review', landr: false, emastered: false, starter: false, pro: true },
    { name: 'Rush Delivery Option', landr: false, emastered: false, starter: true, pro: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-12"
    >
      <Card className="p-6 md:p-8 overflow-x-auto">
        <h3 className="text-2xl font-bold mb-6 text-center">How We Compare</h3>
        
        <div className="min-w-[600px]">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-2"></th>
                <th className="text-center py-4 px-2">
                  <div className="font-bold">LANDR</div>
                  <div className="text-sm text-muted-foreground">$9</div>
                </th>
                <th className="text-center py-4 px-2">
                  <div className="font-bold">eMastered</div>
                  <div className="text-sm text-muted-foreground">$12</div>
                </th>
                <th className="text-center py-4 px-2 bg-muted/30">
                  <div className="font-bold text-primary">MixClub Starter</div>
                  <div className="text-sm text-primary">$29</div>
                </th>
                <th className="text-center py-4 px-2 bg-primary/10">
                  <div className="font-bold text-primary">MixClub Pro</div>
                  <div className="text-sm text-primary">$79</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-4 px-2 font-medium">{feature.name}</td>
                  <td className="text-center py-4 px-2">
                    {feature.landr ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="text-center py-4 px-2">
                    {feature.emastered ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="text-center py-4 px-2 bg-muted/30">
                    {feature.starter ? (
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    )}
                  </td>
                  <td className="text-center py-4 px-2 bg-primary/10">
                    {feature.pro ? (
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};
