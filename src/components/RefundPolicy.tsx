import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, Shield } from 'lucide-react';

export const RefundPolicy = () => {
  return (
    <Card className="border-green-500/20 bg-green-500/5">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-500/10 rounded-full">
            <Shield className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              100% Money-Back Guarantee
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              We stand behind our work. If you're not completely satisfied with your first mix, 
              we'll refund your money - no questions asked.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">7-Day Refund Window</p>
                  <p className="text-xs text-muted-foreground">Request a refund within 7 days of delivery</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Fast Processing</p>
                  <p className="text-xs text-muted-foreground">Refunds processed within 24-48 hours</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">No Questions Asked</p>
                  <p className="text-xs text-muted-foreground">Simple one-click refund process</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> First-time customers only. Refund policy applies to the first project only. 
                Additional projects may request revisions instead.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
