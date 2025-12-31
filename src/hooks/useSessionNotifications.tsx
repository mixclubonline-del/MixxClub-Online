import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type NotificationType = 
  | "session_invite"
  | "session_joined"
  | "deliverable_uploaded"
  | "deliverable_approved"
  | "payment_released"
  | "review_received";

interface SessionNotification {
  type: NotificationType;
  sessionId: string;
  sessionTitle: string;
  fromUser: string;
  amount?: number;
}

export function useSessionNotifications(userId: string | undefined) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    // Listen for session updates
    const sessionsChannel = supabase
      .channel("session-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "collaboration_sessions",
        },
        (payload) => {
          const session = payload.new as any;
          if (session.host_user_id !== userId) {
            toast.info(`New session: ${session.title}`, {
              action: {
                label: "View",
                onClick: () => navigate(`/session/${session.id}`),
              },
            });
          }
        }
      )
      .subscribe();

    // Listen for payment updates
    const paymentsChannel = supabase
      .channel("payment-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "session_payments",
          filter: `payee_id=eq.${userId}`,
        },
        (payload) => {
          const payment = payload.new as any;
          if (payment.status === "released") {
            const amount = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: payment.currency || "USD",
            }).format(payment.amount);

            toast.success(`Payment received: ${amount}`, {
              description: "Funds have been transferred to your account",
              action: {
                label: "View",
                onClick: () => navigate(`/session/${payment.session_id}`),
              },
            });
          }
        }
      )
      .subscribe();

    // Listen for new reviews
    const reviewsChannel = supabase
      .channel("review-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reviews",
          filter: `reviewed_id=eq.${userId}`,
        },
        (payload) => {
          const review = payload.new as any;
          const stars = "⭐".repeat(review.rating);
          
          toast.success(`New review received: ${stars}`, {
            description: review.review_text?.slice(0, 50) || "Someone left you a review!",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(reviewsChannel);
    };
  }, [userId, navigate]);
}

export function sendSessionNotification(
  notification: SessionNotification
): Promise<void> {
  return supabase.functions
    .invoke("send-push-notification", {
      body: notification,
    })
    .then(({ error }) => {
      if (error) console.error("Failed to send notification:", error);
    });
}
