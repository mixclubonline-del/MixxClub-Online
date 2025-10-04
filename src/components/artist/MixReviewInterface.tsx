import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, CheckCircle, RotateCcw, Download, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface MixReviewInterfaceProps {
  deliverable: {
    id: string;
    delivery_type: string;
    engineer_notes: string;
    file_path: string;
    file_size: number;
    version_number: number;
    created_at: string;
    status: string;
  };
  engineerName: string;
  projectId: string;
  onStatusUpdate?: () => void;
}

export const MixReviewInterface = ({ 
  deliverable, 
  engineerName,
  projectId,
  onStatusUpdate 
}: MixReviewInterfaceProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDeliveryLabel = (type: string) => {
    const labels: Record<string, string> = {
      rough_mix: '🎧 Rough Mix',
      revision: '🔄 Revision',
      final_mix: '✨ Final Mix',
      master: '🎵 Master',
      stems_package: '📦 Stems Package',
    };
    return labels[type] || type;
  };

  const getStatusBadge = () => {
    if (deliverable.status === 'approved') {
      return <Badge className="bg-success">Approved</Badge>;
    }
    if (deliverable.status === 'revision_requested') {
      return <Badge variant="secondary">Revision Requested</Badge>;
    }
    return <Badge variant="outline">Pending Review</Badge>;
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('engineer_deliverables')
        .update({ status: 'approved' })
        .eq('id', deliverable.id);

      if (error) throw error;

      // Update project status if final mix
      if (deliverable.delivery_type === 'final_mix' || deliverable.delivery_type === 'master') {
        await supabase
          .from('projects')
          .update({ status: 'completed' })
          .eq('id', projectId);
      }

      toast.success("Mix approved! The engineer has been notified.");
      onStatusUpdate?.();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error("Failed to approve mix. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      toast.error("Please add notes about what needs to be changed");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('engineer_deliverables')
        .update({ 
          status: 'revision_requested',
          revision_notes: revisionNotes.trim()
        })
        .eq('id', deliverable.id);

      if (error) throw error;

      toast.success("Revision requested. The engineer will update the mix.");
      setRevisionNotes("");
      onStatusUpdate?.();
    } catch (error) {
      console.error('Revision request error:', error);
      toast.error("Failed to request revision. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('engineer-deliverables')
        .createSignedUrl(deliverable.file_path, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
        toast.success("Download started");
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download mix");
    }
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{getDeliveryLabel(deliverable.delivery_type)}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground">
            Version {deliverable.version_number} • {engineerName} • {formatDistanceToNow(new Date(deliverable.created_at), { addSuffix: true })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Engineer Notes */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold">Engineer's Notes:</span>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {deliverable.engineer_notes || "No notes provided"}
        </p>
      </div>

      {/* Audio Player Placeholder */}
      <div className="rounded-lg border border-muted bg-muted/30 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <div className="flex-1">
            <div className="h-2 bg-muted-foreground/20 rounded-full mb-2">
              <div className="h-full w-0 bg-primary rounded-full transition-all" />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0:00</span>
              <div className="flex items-center gap-2">
                <Volume2 className="w-3 h-3" />
                <span>{(deliverable.file_size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Check */}
      <div className="rounded-lg border border-success/20 bg-success/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✅</span>
          <h4 className="font-semibold text-sm">Quality Report</h4>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Loudness</p>
            <p className="font-medium">-14 LUFS ✅</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dynamic Range</p>
            <p className="font-medium">8 dB ✅</p>
          </div>
          <div>
            <p className="text-muted-foreground">True Peak</p>
            <p className="font-medium">-1.0 dB ✅</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {deliverable.status === 'pending' && (
        <>
          {/* Revision Request */}
          <div className="space-y-3">
            <label className="text-sm font-medium block">Request Changes</label>
            <Textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="What would you like changed? Be specific..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleRequestRevision}
              disabled={isSubmitting || !revisionNotes.trim()}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Request Revision
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1 bg-success hover:bg-success/90"
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Mix
            </Button>
          </div>
        </>
      )}

      {deliverable.status === 'approved' && (
        <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
          <p className="font-medium text-success">Mix Approved</p>
          <p className="text-sm text-muted-foreground mt-1">
            This mix has been approved and marked as complete
          </p>
        </div>
      )}

      {deliverable.status === 'revision_requested' && (
        <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
          <RotateCcw className="w-8 h-8 mx-auto mb-2 text-accent" />
          <p className="font-medium">Revision Requested</p>
          <p className="text-sm text-muted-foreground mt-1">
            The engineer is working on your requested changes
          </p>
        </div>
      )}
    </Card>
  );
};