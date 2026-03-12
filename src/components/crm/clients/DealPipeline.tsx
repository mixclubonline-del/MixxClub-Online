import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Plus, DollarSign, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { DealCard } from './DealCard';
import { AddDealDialog } from './AddDealDialog';
import { useCRMDeals } from '@/hooks/useCRMDeals';
import { cn } from '@/lib/utils';

interface DealPipelineProps {
  userType: 'artist' | 'engineer';
}

const STAGES = [
  { id: 'lead', label: 'Lead', icon: TrendingUp, color: 'text-slate-400' },
  { id: 'contacted', label: 'Contacted', icon: TrendingUp, color: 'text-blue-400' },
  { id: 'proposal', label: 'Proposal', icon: TrendingUp, color: 'text-purple-400' },
  { id: 'negotiation', label: 'Negotiation', icon: TrendingUp, color: 'text-amber-400' },
  { id: 'won', label: 'Won', icon: CheckCircle2, color: 'text-emerald-400' },
  { id: 'lost', label: 'Lost', icon: XCircle, color: 'text-red-400' },
];

export const DealPipeline: React.FC<DealPipelineProps> = ({ userType }) => {
  const { deals, loading: isLoading, updateDeal, deleteDeal } = useCRMDeals();
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);

  const getDealsByStage = (stage: string) => {
    return deals?.filter((d) => d.stage === stage) || [];
  };

  const getStageValue = (stage: string) => {
    return getDealsByStage(stage).reduce((sum, d) => sum + (d.value || 0), 0);
  };

  const handleDragStart = (dealId: string) => {
    setDraggedDeal(dealId);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
  };

  const handleDrop = async (stage: string) => {
    if (draggedDeal) {
      await updateDeal({ id: draggedDeal, stage: stage as 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost' });
      setDraggedDeal(null);
    }
  };

  const handleStageChange = async (dealId: string, stage: string) => {
    await updateDeal({ id: dealId, stage: stage as 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost' });
  };

  const handleEdit = (id: string) => {
    const deal = deals?.find(d => d.id === id);
    if (!deal) return;
    // Re-use the AddDealDialog in edit mode — for now surface a toast
    toast({
      title: 'Edit Deal',
      description: `Editing "${deal.title}" — full editor launching soon.`,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this deal?')) {
      await deleteDeal(id);
    }
  };

  // Calculate pipeline metrics
  const totalValue = deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;
  const wonValue = getStageValue('won');
  const activeDeals = deals?.filter((d) => !['won', 'lost'].includes(d.stage)).length || 0;

  return (
    <div className="space-y-6">
      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Total Pipeline</span>
            </div>
            <p className="text-2xl font-bold mt-2">${totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Won Revenue</span>
            </div>
            <p className="text-2xl font-bold mt-2">${wonValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Active Deals</span>
            </div>
            <p className="text-2xl font-bold mt-2">{activeDeals}</p>
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center">
          <Button onClick={() => setShowAddDeal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Deal
          </Button>
        </Card>
      </div>

      {/* Pipeline Columns */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {STAGES.filter(s => s.id !== 'won' && s.id !== 'lost').map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const stageValue = getStageValue(stage.id);

            return (
              <div
                key={stage.id}
                className={cn(
                  'w-72 shrink-0 rounded-xl border-2 border-dashed transition-colors',
                  draggedDeal ? 'border-primary/50 bg-primary/5' : 'border-transparent'
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(stage.id)}
              >
                <Card className="h-full bg-accent/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <stage.icon className={cn('h-4 w-4', stage.color)} />
                        <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {stageDeals.length}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      ${stageValue.toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <AnimatePresence>
                      {stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={() => handleDragStart(deal.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <DealCard
                            deal={deal}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onStageChange={handleStageChange}
                            isDragging={draggedDeal === deal.id}
                          />
                        </div>
                      ))}
                    </AnimatePresence>
                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No deals in this stage
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Won/Lost Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-sm">Won Deals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {getDealsByStage('won').length}
              </span>
              <span className="text-muted-foreground">
                (${getStageValue('won').toLocaleString()})
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              <CardTitle className="text-sm">Lost Deals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-400">
                {getDealsByStage('lost').length}
              </span>
              <span className="text-muted-foreground">
                (${getStageValue('lost').toLocaleString()})
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddDealDialog open={showAddDeal} onOpenChange={setShowAddDeal} />
    </div>
  );
};
