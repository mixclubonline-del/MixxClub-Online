import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentReleaseButtonProps {
  sessionId: string;
  paymentId: string;
  amount: number;
  currency: string;
  payeeName: string;
  onRelease: () => void;
}

export function PaymentReleaseButton({
  sessionId,
  paymentId,
  amount,
  currency,
  payeeName,
  onRelease,
}: PaymentReleaseButtonProps) {
  const [isReleasing, setIsReleasing] = useState(false);

  const formatAmount = () => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleRelease = async () => {
    setIsReleasing(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "release-payment",
        {
          body: {
            payment_id: paymentId,
            session_id: sessionId,
          },
        }
      );

      if (error) throw error;

      if (data?.success) {
        toast.success(`Payment of ${formatAmount()} released to ${payeeName}!`);
        onRelease();
      } else {
        throw new Error(data?.error || "Failed to release payment");
      }
    } catch (error: any) {
      console.error("Error releasing payment:", error);
      toast.error(error.message || "Failed to release payment");
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white gap-2"
            disabled={isReleasing}
          >
            {isReleasing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <DollarSign className="h-5 w-5" />
            )}
            Release Payment ({formatAmount()})
          </Button>
        </motion.div>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Confirm Payment Release
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You are about to release{" "}
              <span className="font-semibold text-foreground">
                {formatAmount()}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-primary">{payeeName}</span>.
            </p>
            <p className="text-yellow-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRelease}
            className="bg-green-500 hover:bg-green-600"
          >
            Release Payment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
