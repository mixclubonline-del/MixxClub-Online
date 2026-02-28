import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileCheck, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface AgreementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  artistName: string;
  engineerName: string;
  scopeOfWork: string;
  engineerSplitPercent: number;
  onAgreementSigned: () => void;
}

export function AgreementModal({
  open,
  onOpenChange,
  projectId,
  projectName,
  artistName,
  engineerName,
  scopeOfWork,
  engineerSplitPercent,
  onAgreementSigned
}: AgreementModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSignAgreement = async () => {
    if (!agreed) {
      toast({
        title: 'Agreement Required',
        description: 'Please check the box to confirm you agree to the terms.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call edge function to sign agreement
      const { error } = await supabase.functions.invoke('sign-project-agreement', {
        body: {
          projectId,
          scopeOfWork,
          engineerSplitPercent
        }
      });

      if (error) throw error;

      toast({
        title: 'Agreement Signed',
        description: 'You can now proceed with payment.',
      });
      
      onAgreementSigned();
      onOpenChange(false);
    } catch (error) {
      console.error('Error signing agreement:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign agreement',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center gap-2">
            <FileCheck className="h-6 w-6" />
            Collaboration Agreement
          </DialogTitle>
          <DialogDescription>
            Please review and sign this agreement before proceeding with payment.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] border rounded-md p-4">
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Project Details</h4>
              <p><strong>Project:</strong> {projectName}</p>
              <p><strong>Artist:</strong> {artistName}</p>
              <p><strong>Engineer:</strong> {engineerName}</p>
            </div>

            <hr className="my-4" />

            <div>
              <h4 className="font-semibold mb-1">Scope of Work</h4>
              <p>{scopeOfWork}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Compensation</h4>
              <p>Engineer receives {engineerSplitPercent}% of project payment</p>
              <p>Platform fee: {100 - engineerSplitPercent}%</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Intellectual Property</h4>
              <p>The Artist retains full ownership of all deliverables. The Engineer grants a non-exclusive license to the Artist to use the work product created under this agreement.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Confidentiality</h4>
              <p>Both parties agree to maintain confidentiality of all project materials and information shared during the collaboration.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Revisions</h4>
              <p>The scope of work includes reasonable revisions as mutually agreed upon by both parties.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Dispute Resolution</h4>
              <p>In the event of a dispute, both parties agree to first attempt mediation. Legal action should only be pursued if mediation fails.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Duration & Termination</h4>
              <p>This agreement is valid until project completion or mutual termination by both parties.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Electronic Signature</h4>
              <p>By clicking "Sign Agreement" below, both parties consent to electronically sign this agreement and acknowledge that electronic signatures have the same legal effect as handwritten signatures.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Payment Terms</h4>
              <p>Payment will be processed through Mixxclub's secure payment system. Engineer earnings will be distributed according to the agreed split percentage.</p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2 my-4">
          <Checkbox 
            id="agree" 
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
          />
          <Label 
            htmlFor="agree" 
            className="text-sm cursor-pointer"
          >
            I have read and agree to the terms of this collaboration agreement
          </Label>
        </div>

        <Button
          onClick={handleSignAgreement}
          disabled={loading || !agreed}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing Agreement...
            </>
          ) : (
            <>
              <FileCheck className="mr-2 h-4 w-4" />
              Sign Agreement
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
